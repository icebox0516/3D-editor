/**
 * runtime/procedural/ProceduralSourceCache —— 程序化资产构建缓存（T002.1，D17；T008.1 槽路由）。
 *
 * 职责：sourceKey → InstanceSource 的会话私有缓存（T008.1 前为 assetId 键）——读缓存，
 *      未命中经 routes 的 getProceduralBuild 同步构建并缓存（build 契约：每次调用
 *      new 全部资源，所有权移交调用方——本类即调用方，缓存条目资源归本实例所有）。
 *      槽路由（D19）：资产 meta 声明 shapeFamily 时，load 的 seed 形参 = **对象 seed**
 *      （asset.seed，仅供内部路由定 sourceKey，seed 缺省按 0 参与路由——确定性回退），
 *      slot = shapeSlotOf(seed, size)；**构建时一律以 morphSeed 调用**
 *      `build({ seed: morphSeedOf(assetId, slot), preset })`——契约第一锁：对象 seed
 *      永不直接参与 Source Geometry 生成，不同对象只要路由到同一槽，传入 build 的
 *      morphSeed 逐位相同，因此命中同缓存条目、Geometry/Material 同引用。
 *      未声明 shapeFamily 的资产：键回退纯 assetId、build 以无参 `build()` 调用
 *      （preset 一并忽略），行为与现状逐位一致。
 *      失败语义镜像 AssetLoader：未注册 id 与 build 抛错均 reject 且**不缓存坏
 *      结果**（下次 load 重试）。
 * 边界：**绝不模块级单例**（D17——StrictMode 双挂载 createEditor(A)→dispose(A)→
 *      createEditor(B) 时，单例会让 dispose(A) 释放 B 在用的几何）；由组合根随
 *      渲染器会话创建，随 Renderer.dispose 链在 assetLoader.dispose() 相邻位置
 *      释放；缓存不淘汰（无 LRU——有限形态族 ⇒ 天然有界，D19.4）。
 */
import { morphSeedOf, shapeSlotOf, sourceKeyOf } from '../../domain/assets';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { getProceduralBuild, getProceduralMeta } from './routes';

/** load 入参：seed = 对象 seed（只参与槽路由，绝不进 build）；preset = 协议扩展位 */
export interface ProceduralSourceLoadParams {
  seed?: number;
  preset?: string;
}

export class ProceduralSourceCache {
  /** sourceKey → 构建产物（本实例所持资源；dispose 统一释放） */
  private readonly cache = new Map<string, InstanceSource>();

  /**
   * 读缓存；未命中经 getProceduralBuild 构建并缓存。未注册 id reject；build 抛错 reject 且不缓存。
   * seed 语义 = 对象 seed（槽路由用；缺省按 0 路由）；声明 shapeFamily 的资产以
   * morphSeedOf(assetId, slot) 调用 build（契约第一锁），未声明资产无参调用（现状）。
   */
  load(assetId: string, params?: ProceduralSourceLoadParams): Promise<InstanceSource> {
    const family = getProceduralMeta(assetId)?.shapeFamily;
    let key = assetId;
    let slot: number | undefined;
    if (family) {
      slot = shapeSlotOf(params?.seed ?? 0, family.size);
      key = sourceKeyOf(assetId, slot, params?.preset);
    }
    const cached = this.cache.get(key);
    if (cached) return Promise.resolve(cached);
    const build = getProceduralBuild(assetId);
    if (!build) return Promise.reject(new Error(`未注册的程序化资产: ${assetId}`));
    let source: InstanceSource;
    try {
      source =
        slot === undefined
          ? build() // 未声明 shapeFamily：无参调用（含 preset 一并忽略——行为与现状逐位一致）
          : build({ seed: morphSeedOf(assetId, slot), preset: params?.preset });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return Promise.reject(new Error(`程序化资产构建失败: ${assetId}（${reason}）`));
    }
    this.cache.set(key, source);
    return Promise.resolve(source);
  }

  /** 释放全部所持 geometry/material（数组与单值都处理）并清空缓存；幂等 */
  dispose(): void {
    for (const source of this.cache.values()) {
      source.geometry.dispose();
      const material = source.material;
      if (Array.isArray(material)) {
        for (const item of material) item.dispose();
      } else {
        material.dispose();
      }
    }
    this.cache.clear();
  }

  /** 当前缓存条目数（测试断言用） */
  get size(): number {
    return this.cache.size;
  }
}
