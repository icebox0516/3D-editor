/**
 * runtime/procedural/CanopySourceCache —— canopy 表示源缓存（T021.7，D41 §十一/§10.2/§10.3；
 * T024.1 preset 维度 + 跨色卡共享，D44 #1/#3）。
 *
 * 职责：canopy 表示（远景冠层代理，非构建档）的会话私有源缓存——RepresentationSourceRouter
 *      门面在 ProceduralSourceCache 之外分流至此（canopy 永不路由进 ProceduralSourceCache：
 *      构建缓存吃 ProceduralLevel 三值，canopy 不在其中）。条目 = broadleafCanopyProxy
 *      几何工厂 + broadleafCanopyMaterials 成套材质工厂产物：geometry（恰 2 组：干柱 0 /
 *      冠卡 1）+ material（[干柱, 冠卡] 数组，**按色卡条目私有**）+ customDepthMaterial
 *      （Canopy Depth Material）+ bounds（RenderBounds 球形契约，D41 §四.3/§十一）。
 *      色卡维度（T024.1，D44 #1——「冠变干不变」推广到远景表示）：load 第三可选参
 *      preset 进缓存键（`${sourceKeyOf(assetId, slot, preset)}::canopy`——冠卡随卡
 *      分桶，同场景同树不同卡并存；远景不随卡会破所见即所得）；跨卡共享层（D44 #3）：
 *      geometry / customDepthMaterial / uTime / bounds 不随卡增殖——按「无卡
 *      sourceKey::canopy」共享单份 + 引用计数（首卡采编工厂交付，后续卡注入共享
 *      uTime 只取材质数组、冗余深度即时 dispose、**跳过几何工厂调用**——canopy
 *      几何与卡无关）；bounds 随几何派生一次（共享）。
 *      种子路由（morphSeed 语义与 provideSource 现状一致）：seed = 对象 seed →
 *      shapeSlotOf(seed ?? 0, meta.shapeFamily.size) 定槽 → buildBroadleafCanopyGeometry
 *      (assetId, morphSeedOf(assetId, slot))——同槽对象命中同条目、Geometry/材质同引用；
 *      seed 缺省按 0 路由（散布链 assetId 粒度语义 = 确定性单槽，D41 §4.4）。
 *      缓存键 = `${sourceKey}::canopy`（§10.2 双维口径——与 ProceduralSourceCache
 *      同构；representation 只作条目后缀，永不进 sourceKey 形态身份，D19/D23.2）。
 *      uTime 同源契约（021.6 遗留② → T024.1 D44 #3 窄化：「三材质成套」窄化为
 *      「uTime 引用同源」）：trunk/card 材质级 uniforms.uTime 与 depth 的
 *      onBeforeCompile 绑定**同一 uTime 对象引用**——共享层持 uTime 单份（无 GPU
 *      资源，纯 JS 对象随登记行丢弃），首卡采编工厂自建对象、后续卡经工厂 uTime
 *      注入参绑定同一对象；TimeUniformService 每帧写任一主材质一次、深度程序
 *      uniform 即时同值（影 pass 风摆与主渲染同相同帧）；拆开单独挂 depth 依旧禁止
 *      （depth 的 uTime 更新源 = 共享对象——失去任一持有它的主材质即失去扫描面，
 *      024.1 任务书待裁决位记档）。
 *      失败语义镜像 ProceduralSourceCache：未接入树种（非 13 阔叶乔木）reject 且**不缓存
 *      坏结果**——门面消费方（池/散布）sourceReady 保持 false、对象停留当前表示，不静默
 *      回 high（能力声明驱动下 canopy 只被已声明资产请求，本路径是防御面）。
 * 边界：**绝不模块级单例**（D17——StrictMode 双挂载，随 Renderer dispose 链在
 *      proceduralCache.dispose 相邻位置释放）；缓存不淘汰（天然有界：至多 树种数 ×
 *      槽数 × 卡数 条目 + 树种数 × 槽数 共享行，D19.4 同推——canopy 无换档释放
 *      消费面，无 evict API）；Source/Cache 拥有并释放 material（条目私有）与共享行
 *      geometry/customDepthMaterial/bounds，Pool 只挂引用不 dispose（§10.3——canopy
 *      条目与既有 customDepthMaterial 同规）。
 */
import { morphSeedOf, shapeSlotOf, sourceKeyOf } from '../../domain/assets';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { getProceduralMeta } from './routes';
import { buildBroadleafCanopyGeometry } from './tree/broadleafCanopyProxy';
import { createBroadleafCanopyMaterials } from './tree/broadleafCanopyMaterials';

/** 材质级 uniforms 的最小结构面（broadleafCanopyMaterials TimeBridgedMaterial 同形态——
 *  TimeUniformService 扫描面；首卡采编共享 uTime 的提取口） */
type TimeBridgedMaterial = import('three').MeshStandardMaterial & {
  uniforms?: { uTime?: { value: number } };
};

/** 跨色卡共享登记行（D44 #3）：geometry + Canopy Depth Material + uTime + bounds
 *  单份 + 引用计数。共享键 = 「无卡 sourceKey::canopy」（条目键剥离 preset 段）。 */
interface SharedCanopyResource {
  geometry: InstanceSource['geometry'];
  customDepthMaterial: InstanceSource['customDepthMaterial'];
  /** 三材质 uTime 同源对象（纯 JS 对象无 GPU 资源——随登记行丢弃，不 dispose） */
  uTime: { value: number };
  /** 随几何派生一次的 RenderBounds（纯数据，跨卡共享） */
  bounds: NonNullable<InstanceSource['bounds']>;
  refs: number;
}

export class CanopySourceCache {
  /** `sourceKey::canopy`（preset 进 sourceKey——冠卡随卡分桶）→ canopy 实例化源（本实例所持资源；dispose 释放） */
  private readonly cache = new Map<string, InstanceSource>();

  /** 「无卡 sourceKey::canopy」→ 跨色卡共享资源（D44 #3；与缓存实例同生命周期——
   *  绝不模块级单例，D17） */
  private readonly shared = new Map<string, SharedCanopyResource>();

  /**
   * 读缓存；未命中经 021.6 工厂构建（几何 + 成套材质 + 深度材质 + bounds）并缓存。
   * seed = 对象 seed（只参与槽路由，绝不直接进几何生成——与 ProceduralSourceCache
   * 契约第一锁同语义）；缺省按 0 路由。preset = 色卡 id（进缓存键分桶 + 透传材质
   * 工厂——冠卡随卡、干柱不随卡；共享层按「无卡键」剥离该维度，D44 #3）。未接入
   * 树种 reject 且不缓存。共享键已有登记（后到色卡）→ 跳过几何工厂（canopy 几何
   * 与卡无关），材质工厂注入共享 uTime 取私有材质数组、冗余深度即时 dispose；首卡
   * → 采编工厂交付的 geometry/depth/uTime/bounds 为共享单份（refs=1）。
   */
  load(assetId: string, seed?: number, preset?: string): Promise<InstanceSource> {
    const family = getProceduralMeta(assetId)?.shapeFamily;
    const slot = family ? shapeSlotOf(seed ?? 0, family.size) : undefined;
    const key = `${slot !== undefined ? sourceKeyOf(assetId, slot, preset) : assetId}::canopy`;
    const cached = this.cache.get(key);
    if (cached) return Promise.resolve(cached);
    const sharedKey = `${slot !== undefined ? sourceKeyOf(assetId, slot) : assetId}::canopy`;
    let source: InstanceSource;
    try {
      const shared = this.shared.get(sharedKey);
      if (shared) {
        // 后到色卡：canopy 几何与卡无关——跳过几何工厂；材质按卡私有 + 注入共享 uTime
        //（成套契约窄化为「uTime 引用同源」，D44 #3）
        const materials = createBroadleafCanopyMaterials(assetId, preset, shared.uTime);
        materials.depthMaterial.dispose(); // 冗余深度（共享份在用）——即时 dispose
        shared.refs++;
        source = {
          geometry: shared.geometry,
          material: materials.materials,
          customDepthMaterial: shared.customDepthMaterial,
          bounds: shared.bounds,
        };
      } else {
        // 首卡：几何工厂 + 材质工厂（自建 uTime）→ 采编 geometry/depth/uTime/bounds 为
        // 共享单份（refs=1）；后续卡经共享键复用，几何不再重建
        // 同槽确定性：morphSeedOf(assetId, slot) 驱动几何（工厂内部 profileForSeed 同口径路由）
        const morphSeed = morphSeedOf(assetId, slot ?? 0);
        const built = buildBroadleafCanopyGeometry(assetId, morphSeed); // 未接入树种 throw
        const materials = createBroadleafCanopyMaterials(assetId, preset); // 未接入树种 throw
        built.geometry.computeBoundingSphere();
        const sphere = built.geometry.boundingSphere!;
        const adopted: SharedCanopyResource = {
          geometry: built.geometry,
          customDepthMaterial: materials.depthMaterial,
          // 工厂契约：trunk 材质级 uniforms.uTime 恒在（TimeUniformService 扫描面）
          uTime: (materials.trunkMaterial as TimeBridgedMaterial).uniforms!.uTime!,
          bounds: {
            center: { x: sphere.center.x, y: sphere.center.y, z: sphere.center.z },
            radius: sphere.radius,
          },
          refs: 1,
        };
        this.shared.set(sharedKey, adopted);
        source = {
          geometry: adopted.geometry,
          material: materials.materials,
          customDepthMaterial: adopted.customDepthMaterial,
          bounds: adopted.bounds,
        };
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return Promise.reject(new Error(`canopy 源构建失败: ${assetId}（${reason}）`));
    }
    this.cache.set(key, source);
    return Promise.resolve(source);
  }

  /** 释放全部所持资源并清空缓存与共享登记：条目私有材质数组逐条目释放、共享行
   *  geometry/深度逐行释放恰一次（引用计数全清——D44 #3；uTime/bounds 纯对象随行
   *  丢弃）；幂等 */
  dispose(): void {
    for (const source of this.cache.values()) {
      const material = source.material;
      if (Array.isArray(material)) {
        for (const item of material) item.dispose();
      } else {
        material.dispose();
      }
    }
    for (const shared of this.shared.values()) {
      shared.geometry.dispose();
      shared.customDepthMaterial?.dispose();
    }
    this.shared.clear();
    this.cache.clear();
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
