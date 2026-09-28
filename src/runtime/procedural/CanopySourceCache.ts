/**
 * runtime/procedural/CanopySourceCache —— canopy 表示源缓存（T021.7，D41 §十一/§10.2/§10.3）。
 *
 * 职责：canopy 表示（远景冠层代理，非构建档）的会话私有源缓存——RepresentationSourceRouter
 *      门面在 ProceduralSourceCache 之外分流至此（canopy 永不路由进 ProceduralSourceCache：
 *      构建缓存吃 ProceduralLevel 三值，canopy 不在其中）。条目 = broadleafCanopyProxy
 *      几何工厂 + broadleafCanopyMaterials 成套材质工厂产物：geometry（恰 2 组：干柱 0 /
 *      冠卡 1）+ material（[干柱, 冠卡] 数组）+ customDepthMaterial（Canopy Depth Material）+
 *      bounds（RenderBounds 球形契约，D41 §四.3/§十一——随几何成套、归本缓存所有）。
 *      种子路由（morphSeed 语义与 provideSource 现状一致）：seed = 对象 seed →
 *      shapeSlotOf(seed ?? 0, meta.shapeFamily.size) 定槽 → buildBroadleafCanopyGeometry
 *      (assetId, morphSeedOf(assetId, slot))——同槽对象命中同条目、Geometry/材质同引用；
 *      seed 缺省按 0 路由（散布链 assetId 粒度语义 = 确定性单槽，D41 §4.4）。
 *      缓存键 = `${sourceKey}::canopy`（§10.2 双维口径——与 ProceduralSourceCache
 *      同构；representation 只作条目后缀，永不进 sourceKey 形态身份，D19/D23.2）。
 *      三材质成套消费契约（021.6 遗留②）：trunk/card 材质级 uniforms.uTime 与 depth 的
 *      onBeforeCompile 绑定**共享同一 uTime 对象**——TimeUniformService 每帧写主材质一次、
 *      深度程序 uniform 即时同值（影 pass 风摆与主渲染同相同帧）；缓存整体持有并释放三
 *      材质（拆开单独挂 depth 会失去 uTime 更新源——禁止）。
 *      失败语义镜像 ProceduralSourceCache：未接入树种（非 13 阔叶乔木）reject 且**不缓存
 *      坏结果**——门面消费方（池/散布）sourceReady 保持 false、对象停留当前表示，不静默
 *      回 high（能力声明驱动下 canopy 只被已声明资产请求，本路径是防御面）。
 * 边界：**绝不模块级单例**（D17——StrictMode 双挂载，随 Renderer dispose 链在
 *      proceduralCache.dispose 相邻位置释放）；缓存不淘汰（天然有界：至多 树种数 ×
 *      槽数 × 1 表示条目，D19.4 同推——canopy 无换档释放消费面，无 evict API）；
 *      Source/Cache 拥有并释放 geometry/material/customDepthMaterial/bounds，Pool 只挂
 *      引用不 dispose（§10.3——canopy 条目与既有 customDepthMaterial 同规）。
 */
import { morphSeedOf, shapeSlotOf, sourceKeyOf } from '../../domain/assets';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { getProceduralMeta } from './routes';
import { buildBroadleafCanopyGeometry } from './tree/broadleafCanopyProxy';
import { createBroadleafCanopyMaterials } from './tree/broadleafCanopyMaterials';

export class CanopySourceCache {
  /** `sourceKey::canopy` → canopy 实例化源（本实例所持资源；dispose 释放） */
  private readonly cache = new Map<string, InstanceSource>();

  /**
   * 读缓存；未命中经 021.6 工厂构建（几何 + 成套材质 + 深度材质 + bounds）并缓存。
   * seed = 对象 seed（只参与槽路由，绝不直接进几何生成——与 ProceduralSourceCache
   * 契约第一锁同语义）；缺省按 0 路由。未接入树种 reject 且不缓存。
   */
  load(assetId: string, seed?: number): Promise<InstanceSource> {
    const family = getProceduralMeta(assetId)?.shapeFamily;
    const slot = family ? shapeSlotOf(seed ?? 0, family.size) : undefined;
    const key = `${slot !== undefined ? sourceKeyOf(assetId, slot) : assetId}::canopy`;
    const cached = this.cache.get(key);
    if (cached) return Promise.resolve(cached);
    let source: InstanceSource;
    try {
      // 同槽确定性：morphSeedOf(assetId, slot) 驱动几何（工厂内部 profileForSeed 同口径路由）
      const morphSeed = morphSeedOf(assetId, slot ?? 0);
      const built = buildBroadleafCanopyGeometry(assetId, morphSeed); // 未接入树种 throw
      const materials = createBroadleafCanopyMaterials(assetId); // 未接入树种 throw
      built.geometry.computeBoundingSphere();
      const sphere = built.geometry.boundingSphere!;
      source = {
        geometry: built.geometry,
        material: materials.materials,
        customDepthMaterial: materials.depthMaterial,
        bounds: {
          center: { x: sphere.center.x, y: sphere.center.y, z: sphere.center.z },
          radius: sphere.radius,
        },
      };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return Promise.reject(new Error(`canopy 源构建失败: ${assetId}（${reason}）`));
    }
    this.cache.set(key, source);
    return Promise.resolve(source);
  }

  /** 释放全部所持 geometry/材质数组各项/深度材质并清空缓存；幂等 */
  dispose(): void {
    for (const source of this.cache.values()) this.releaseSource(source);
    this.cache.clear();
  }

  /** 释放单个条目所持资源（dispose 同款释放逻辑——canopy 无单条目 evict 消费面） */
  private releaseSource(source: InstanceSource): void {
    source.geometry.dispose();
    const material = source.material;
    if (Array.isArray(material)) {
      for (const item of material) item.dispose();
    } else {
      material.dispose();
    }
    source.customDepthMaterial?.dispose();
  }

  /** 当前缓存条目数（测试断言用） */
  get size(): number {
    return this.cache.size;
  }
}
