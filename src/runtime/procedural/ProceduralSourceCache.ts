/**
 * runtime/procedural/ProceduralSourceCache —— 程序化资产构建缓存（T002.1，D17；T008.1 槽路由；T009.6 档位维度）。
 *
 * 职责：程序化源构建缓存的双维表示缓存（T009.6 D23.2/D27 → T021.7 键收敛 D41 §10.2）
 *      ——**形态身份由 sourceKey 定义，具体几何 Source 由 sourceKey + representation
 *      决定**（表示维度只作缓存条目后缀 `::level` 内部编码——**永不进 sourceKeyOf、
 *      永不掺形态身份**，D19/D23.2 重申；high/mid/low 与构建档位同名同值，load 入参
 *      level 语义保持 ProceduralLevel，canopy 永不路由进本缓存——非构建档，
 *      RepresentationSourceRouter 门面在缓存之外分流，T021.7）；读缓存，未命中经
 *      routes 的 getProceduralBuild 同步构建并缓存（build 契约：每次调用 new 全部
 *      资源，所有权移交调用方——本类即调用方；**缓存持有面经 D44 #3 窄化**：主
 *      material 按缓存条目私有，geometry 与 customDepthMaterial 按「无卡 sourceKey +
 *      level」跨色卡共享单份——模块内 shared 登记表 + 引用计数，后到色卡条目新建的
 *      冗余几何/深度即时 dispose（切卡不重建几何；build 侧契约窄化正文见 types.ts
 *      「程序化构建函数」段；preset 进键分桶 = resolveEntry/sourceKeyOf 第三参，
 *      色卡位语义 D44 #1——同场景同树不同卡必须并存）。
 *      槽路由（D19）：资产 meta 声明 shapeFamily 时，load 的 seed 形参 = **对象 seed**
 *      （asset.seed，仅供内部路由定 sourceKey，seed 缺省按 0 参与路由——确定性回退），
 *      slot = shapeSlotOf(seed, size)；**构建时一律以 morphSeed 调用**
 *      `build({ seed: morphSeedOf(assetId, slot), preset, level })`——契约第一锁：对象 seed
 *      永不直接参与 Source Geometry 生成，不同对象只要路由到同一槽，传入 build 的
 *      morphSeed 逐位相同，因此命中同缓存条目、Geometry/Material 同引用。
 *      level 语义（D27.7）：load/evict 入参 level 缺省按 'high' 归一；档位几何独立缓存
 *      （条目间 geometry/material 不共享）、独立释放（evict——单档单槽精确释放，
 *      T006 换档释放旧档的消费面）；资产未声明该档时的回落由资产 build 自行决定，
 *      选档/距离切换策略归 T006，Cache 只透传。
 *      LOD 声明/调度规范真相源 = docs/procedural-assets/lod-spec.md（T010.3）。
 *      键规则二分支（T021.7 收敛，D41 §10.2——旧「未声明多档」中间分支删除，
 *      其唯一消费者 asset_streetlamp 已由 021.1 representations 声明收编）：
 *      ① **声明表示能力**（shapeFamily ∨ representations 非空 ∨ levels 多档——即
 *      有效链多表示）→ 键 = `${sourceKey}::${level}`（无 shapeFamily 时 sourceKey
 *      退化为 assetId——streetlamp 先例键字面量 `assetId::level` 新旧逐位一致，
 *      收敛安全判据）；② **未声明**（恒单档且无 shapeFamily）→ 键 = 纯 assetId、
 *      build 以无参 `build()` 调用（preset/level 一并忽略，行为与现状逐位一致）。
 *      失败语义镜像 AssetLoader：未注册 id 与 build 抛错均 reject 且**不缓存坏
 *      结果**（下次 load 重试）。
 * 边界：**绝不模块级单例**（D17——StrictMode 双挂载 createEditor(A)→dispose(A)→
 *      createEditor(B) 时，单例会让 dispose(A) 释放 B 在用的几何）；由组合根随
 *      渲染器会话创建，随 Renderer.dispose 链在 assetLoader.dispose() 相邻位置
 *      释放；缓存不淘汰（无 LRU——有限形态族 ⇒ 天然有界，D19.4；档位维度同理，
 *      每资产至多 槽数×档数×卡数 条目 + 槽数×档数 共享行——色卡条目数 = 用到的
 *      组合、混卡增殖为用户显式选择的自然代价，D44 #3；换档释放走 evict）。
 */
import { morphSeedOf, shapeSlotOf, sourceKeyOf } from '../../domain/assets';
import type { ProceduralLevel } from '../../domain/assets';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { getProceduralBuild, getProceduralMeta } from './routes';

/** load/evict 入参：seed = 对象 seed（只参与槽路由，绝不进 build）；preset = 色卡 id
 *  （进缓存键分桶 + 透传 build，D44 #1/#3——共享层按「无卡键」剥离该维度）；level =
 *  请求档位（缺省 'high'；选档/回落策略归 T006，Cache 只透传） */
export interface ProceduralSourceLoadParams {
  seed?: number;
  preset?: string;
  level?: ProceduralLevel;
}

/** 跨色卡共享登记行（D44 #3）：geometry + customDepthMaterial 单份 + 引用计数。
 *  共享键 = 条目键去掉 preset 段（「无卡 sourceKey::level」；无 shapeFamily 分支
 *  键不含卡段——共享键 = 条目键，引用计数退化为 1 进 1 出，行为与共享层落地前等价）。 */
interface SharedSourceResource {
  geometry: InstanceSource['geometry'];
  customDepthMaterial: InstanceSource['customDepthMaterial'];
  refs: number;
}

export class ProceduralSourceCache {
  /** `sourceKey::level`（未声明表示能力时 = 纯 assetId）→ 构建产物（本实例所持资源；dispose/evict 释放） */
  private readonly cache = new Map<string, InstanceSource>();

  /** 「无卡 sourceKey::level」→ 跨色卡共享资源（D44 #3；与缓存实例同生命周期——
   *  绝不模块级单例，D17） */
  private readonly shared = new Map<string, SharedSourceResource>();

  /**
   * 键/槽/档归一（load 与 evict 共用的单一真相——两 API 键规则逐位一致）：
   * **声明表示能力**（shapeFamily ∨ representations 非空 ∨ levels 多档——T021.7
   * 收敛后的统一第一分支）→ 键 = `${sourceKey}::${level}`：声明 shapeFamily 时
   * slot = shapeSlotOf(seed ?? 0, size)、sourceKeyOf 零改动（preset 第三参与键——
   * 色卡分桶）；无 shapeFamily 时 sourceKey 退化为 assetId（键字面量
   * `${assetId}::${level}`——streetlamp 先例新旧逐位一致）；**未声明**（恒单档且无
   * shapeFamily）→ 键 = 纯 assetId（无 level 后缀——行为与现状逐位一致）。level 缺省
   * 按 'high' 归一。sharedKey = 键剥离 preset 段（无 shapeFamily 分支 = 键本身）——
   * D44 #3 共享层分键。
   */
  private resolveEntry(
    assetId: string,
    params?: ProceduralSourceLoadParams,
  ): { key: string; sharedKey: string; slot: number | undefined; level: ProceduralLevel; levelKeyed: boolean } {
    const level = params?.level ?? 'high';
    const routeMeta = getProceduralMeta(assetId);
    const family = routeMeta?.shapeFamily;
    if (family) {
      const slot = shapeSlotOf(params?.seed ?? 0, family.size);
      return {
        key: `${sourceKeyOf(assetId, slot, params?.preset)}::${level}`,
        sharedKey: `${sourceKeyOf(assetId, slot)}::${level}`,
        slot,
        level,
        levelKeyed: true,
      };
    }
    // 无 shapeFamily：声明表示能力（representations 非空 ∨ levels 多档）→ assetId::level；未声明 → 纯 assetId
    const levelKeyed =
      (routeMeta?.representations?.length ?? 0) > 0 || (routeMeta?.levels?.length ?? 0) > 1;
    const key = levelKeyed ? `${assetId}::${level}` : assetId;
    return { key, sharedKey: key, slot: undefined, level, levelKeyed };
  }

  /**
   * 读缓存；未命中经 getProceduralBuild 构建并缓存。未注册 id reject；build 抛错 reject 且不缓存。
   * seed 语义 = 对象 seed（槽路由用；缺省按 0 路由）；声明 shapeFamily 的资产以
   * morphSeedOf(assetId, slot) 调用 build（契约第一锁）；无 shapeFamily 的声明能力
   * 资产（representations 非空 ∨ levels 多档）以 build({ level }) 调用（只透传
   * level——无 shapeFamily 即无 seed/preset 声明面）；未表示能力资产无参调用
   * （preset/level 一并忽略——恒单档现状）。level 缺省 'high'，参与缓存键
   * （sourceKey::level / assetId::level 后缀）并透传 build。未命中构建成功后经
   * adoptSharedResource 采编共享层（D44 #3——条目 geometry/depth 改归共享行持有，
   * material 保持条目私有）。 */
  load(assetId: string, params?: ProceduralSourceLoadParams): Promise<InstanceSource> {
    const { key, sharedKey, slot, level, levelKeyed } = this.resolveEntry(assetId, params);
    const cached = this.cache.get(key);
    if (cached) return Promise.resolve(cached);
    const build = getProceduralBuild(assetId);
    if (!build) return Promise.reject(new Error(`未注册的程序化资产: ${assetId}`));
    let source: InstanceSource;
    try {
      source =
        slot !== undefined
          ? build({ seed: morphSeedOf(assetId, slot), preset: params?.preset, level })
          : levelKeyed
            ? build({ level }) // 声明能力但无 shapeFamily（representations / levels 多档）：只透传 level
            : build(); // 未声明资产：无参调用（preset/level 一并忽略——行为与现状逐位一致）
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return Promise.reject(new Error(`程序化资产构建失败: ${assetId}（${reason}）`));
    }
    this.adoptSharedResource(sharedKey, source);
    this.cache.set(key, source);
    return Promise.resolve(source);
  }

  /** 精确释放单档单槽（×色卡）条目（档位独立释放的最小 API——T006 换档释放旧档的消费面）：
   *  键规则与 load 完全一致（同一 resolveEntry——params.seed/preset 同口径参与路由、
   *  level 同口径归一）。命中：释放条目私有 material，geometry 与 customDepthMaterial
   *  （T009.5 影 pass 深度材质归源所有）走共享层引用计数——refs-- 归零才 dispose
   *  共享份并移除登记（同「无卡 sourceKey::level」其他色卡在用时不误伤，D44 #3）——
   *  并移除条目返回 true；未命中返回 false；幂等（已释放条目重复 evict 返回 false）。 */
  evict(assetId: string, params?: ProceduralSourceLoadParams): boolean {
    const { key, sharedKey } = this.resolveEntry(assetId, params);
    const source = this.cache.get(key);
    if (!source) return false;
    this.releaseSource(source, sharedKey);
    this.cache.delete(key);
    return true;
  }

  /** 释放全部所持资源并清空缓存与共享登记：条目私有 material 逐条目释放（数组与单值
   *  都处理）、共享 geometry/深度逐登记行释放恰一次（D44 #3——引用计数全清）；幂等 */
  dispose(): void {
    for (const source of this.cache.values()) this.releaseMaterials(source);
    for (const shared of this.shared.values()) {
      shared.geometry.dispose();
      shared.customDepthMaterial?.dispose();
    }
    this.shared.clear();
    this.cache.clear();
  }

  /** 释放单个条目：私有 material 即时释放；geometry/customDepthMaterial 走共享层
   *  引用计数（refs-- 归零才 dispose 共享份并移除登记——另一色卡在用时不误伤，D44 #3；
   *  customDistanceMaterial 为 T009.5 类型占位——零实装不释放） */
  private releaseSource(source: InstanceSource, sharedKey: string): void {
    this.releaseMaterials(source);
    const shared = this.shared.get(sharedKey);
    // adoptSharedResource 保证条目 geometry/depth 即共享登记行——每条目恰贡献一次计数
    if (shared && --shared.refs <= 0) {
      shared.geometry.dispose();
      shared.customDepthMaterial?.dispose();
      this.shared.delete(sharedKey);
    }
  }

  /** 释放条目私有材质面（数组与单值都处理；geometry/depth 归共享层，不在此释放） */
  private releaseMaterials(source: InstanceSource): void {
    const material = source.material;
    if (Array.isArray(material)) {
      for (const item of material) item.dispose();
    } else {
      material.dispose();
    }
  }

  /** D44 #3 共享采编：共享键已有登记 → 即时 dispose 本次 build 交付的冗余 geometry 与
   *  customDepthMaterial、条目改持共享引用并 refs++（切卡不重建几何——色不进深度、
   *  几何不随卡）；没有登记 → 采编本次交付为共享单份（refs=1）。主 material（单值或
   *  数组）始终条目私有，不进共享层。调用时机 = load 未命中构建成功后、条目入缓存前
   *  （此刻条目尚未外流，改写其字段安全）。 */
  private adoptSharedResource(sharedKey: string, source: InstanceSource): void {
    const shared = this.shared.get(sharedKey);
    if (shared) {
      source.geometry.dispose();
      source.customDepthMaterial?.dispose();
      source.geometry = shared.geometry;
      source.customDepthMaterial = shared.customDepthMaterial;
      shared.refs++;
    } else {
      this.shared.set(sharedKey, {
        geometry: source.geometry,
        customDepthMaterial: source.customDepthMaterial,
        refs: 1,
      });
    }
  }

  /** 当前缓存条目数（测试断言用） */
  get size(): number {
    return this.cache.size;
  }

  /** 跨色卡共享登记行数（测试断言用——D44 #3 引用计数清空证据） */
  get sharedSize(): number {
    return this.shared.size;
  }
}
