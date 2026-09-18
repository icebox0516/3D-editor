/**
 * runtime/procedural/ProceduralSourceCache —— 程序化资产构建缓存（T002.1，D17；T008.1 槽路由；T009.6 档位维度）。
 *
 * 职责：程序化 Source 双维档位缓存（T009.6，D23.2/D27）——**形态身份由 sourceKey 定义，
 *      具体几何 Source 由 sourceKey + level 决定**（level 只作缓存档位维度后缀 `::level`，
 *      内部编码——不进 sourceKeyOf、不掺形态身份）；读缓存，未命中经 routes 的
 *      getProceduralBuild 同步构建并缓存（build 契约：每次调用 new 全部资源，所有权
 *      移交调用方——本类即调用方，缓存条目资源归本实例所有）。
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
 *      未声明 shapeFamily 的资产：键回退纯 assetId、build 以无参 `build()` 调用
 *      （preset/level 一并忽略），行为与现状逐位一致。
 *      失败语义镜像 AssetLoader：未注册 id 与 build 抛错均 reject 且**不缓存坏
 *      结果**（下次 load 重试）。
 * 边界：**绝不模块级单例**（D17——StrictMode 双挂载 createEditor(A)→dispose(A)→
 *      createEditor(B) 时，单例会让 dispose(A) 释放 B 在用的几何）；由组合根随
 *      渲染器会话创建，随 Renderer.dispose 链在 assetLoader.dispose() 相邻位置
 *      释放；缓存不淘汰（无 LRU——有限形态族 ⇒ 天然有界，D19.4；档位维度同理，
 *      每资产至多 槽数×档数 条目，换档释放走 evict）。
 */
import { morphSeedOf, shapeSlotOf, sourceKeyOf } from '../../domain/assets';
import type { ProceduralLevel } from '../../domain/assets';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { getProceduralBuild, getProceduralMeta } from './routes';

/** load/evict 入参：seed = 对象 seed（只参与槽路由，绝不进 build）；preset = 协议扩展位；
 *  level = 请求档位（缺省 'high'；选档/回落策略归 T006，Cache 只透传） */
export interface ProceduralSourceLoadParams {
  seed?: number;
  preset?: string;
  level?: ProceduralLevel;
}

export class ProceduralSourceCache {
  /** sourceKey::level（未声明 shapeFamily 时为纯 assetId）→ 构建产物（本实例所持资源；dispose/evict 释放） */
  private readonly cache = new Map<string, InstanceSource>();

  /**
   * 键/槽/档归一（load 与 evict 共用的单一真相——两 API 键规则逐位一致）：
   * 声明 shapeFamily → slot = shapeSlotOf(seed ?? 0, size)、键 = `${sourceKey}::${level}`
   * （level 只作档位维度后缀，sourceKeyOf 零改动）；未声明 → 键 = 纯 assetId（无 level
   * 后缀——恒单档资产，行为与现状逐位一致）。level 缺省按 'high' 归一。
   */
  private resolveEntry(
    assetId: string,
    params?: ProceduralSourceLoadParams,
  ): { key: string; slot: number | undefined; level: ProceduralLevel } {
    const level = params?.level ?? 'high';
    const family = getProceduralMeta(assetId)?.shapeFamily;
    if (!family) return { key: assetId, slot: undefined, level };
    const slot = shapeSlotOf(params?.seed ?? 0, family.size);
    return { key: `${sourceKeyOf(assetId, slot, params?.preset)}::${level}`, slot, level };
  }

  /**
   * 读缓存；未命中经 getProceduralBuild 构建并缓存。未注册 id reject；build 抛错 reject 且不缓存。
   * seed 语义 = 对象 seed（槽路由用；缺省按 0 路由）；声明 shapeFamily 的资产以
   * morphSeedOf(assetId, slot) 调用 build（契约第一锁），未声明资产无参调用（现状）。
   * level 缺省 'high'，参与缓存键（sourceKey::level 后缀）并透传 build。
   */
  load(assetId: string, params?: ProceduralSourceLoadParams): Promise<InstanceSource> {
    const { key, slot, level } = this.resolveEntry(assetId, params);
    const cached = this.cache.get(key);
    if (cached) return Promise.resolve(cached);
    const build = getProceduralBuild(assetId);
    if (!build) return Promise.reject(new Error(`未注册的程序化资产: ${assetId}`));
    let source: InstanceSource;
    try {
      source =
        slot === undefined
          ? build() // 未声明 shapeFamily：无参调用（preset/level 一并忽略——行为与现状逐位一致）
          : build({ seed: morphSeedOf(assetId, slot), preset: params?.preset, level });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return Promise.reject(new Error(`程序化资产构建失败: ${assetId}（${reason}）`));
    }
    this.cache.set(key, source);
    return Promise.resolve(source);
  }

  /** 精确释放单档单槽条目（档位独立释放的最小 API——T006 换档释放旧档的消费面）：
   *  键规则与 load 完全一致（同一 resolveEntry——params.seed 同口径参与槽路由、level
   *  同口径归一）。命中：dispose 其 geometry/material 并移除条目，返回 true；未命中
   *  返回 false；幂等（已释放条目重复 evict 返回 false）。 */
  evict(assetId: string, params?: ProceduralSourceLoadParams): boolean {
    const { key } = this.resolveEntry(assetId, params);
    const source = this.cache.get(key);
    if (!source) return false;
    this.releaseSource(source);
    this.cache.delete(key);
    return true;
  }

  /** 释放全部所持 geometry/material（数组与单值都处理）并清空缓存；幂等 */
  dispose(): void {
    for (const source of this.cache.values()) this.releaseSource(source);
    this.cache.clear();
  }

  /** 释放单个条目所持资源（dispose/evict 同款释放逻辑） */
  private releaseSource(source: InstanceSource): void {
    source.geometry.dispose();
    const material = source.material;
    if (Array.isArray(material)) {
      for (const item of material) item.dispose();
    } else {
      material.dispose();
    }
  }

  /** 当前缓存条目数（测试断言用） */
  get size(): number {
    return this.cache.size;
  }
}
