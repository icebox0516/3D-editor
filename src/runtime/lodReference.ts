/**
 * runtime/lodReference —— LOD 选档稳定基准缓存（T006.6，D28.2/D28.4）。
 *
 * 契约：两链（InstancedAssetPool / ScatterChunkManager）选档度量 m = d/(r·scale) 的
 * 基准球一律取 **High 档源几何一次派生并冻结的 referenceSphere**——与当前渲染档位
 * 完全解耦：同一实例 / (块×资产) 无论处于哪档，同机位下选档度量恒定（迁档不换选档
 * 输入，「迁档 → 半径换源 → 读数平移」反馈环消除）。整球缓存（center+radius）：
 * 放置链代表点 = 基准球心过实例矩阵——只缓存半径会让 d 随档微抖；散布链代表点 =
 * 块盒最近点（只消费 radius，缓存形态两链统一）。
 *
 * 派生时机 = High 档源解析到达（两链起步恒先解析 high：放置链 attach 即建 high 桶、
 * 散布链块注册即请求 high 源——条目首评前基准必已就绪）；消费方身份键缓存（放置链
 * sourceKey（assetId+槽）/ 散布链 assetId）。冻结语义：同 key 首次派生后不改写——
 * 源 evict 重建后同 key 几何确定性恒等，冻结值持续有效（幂等）。缓存持有独立 Sphere
 * 拷贝（不引用几何球对象——几何归源端释放，基准不随源对象消亡）。
 *
 * 边界：这是 Runtime 从 High 档几何派生的缓存值，**不是资产声明字段**（D28.4——不进
 * asset.ts / ModelAsset / AssetDescriptor / proceduralProfile；D27.12「调度阈值归
 * Runtime 全局策略常量、不进资产 Profile」边界不受影响）。剔除不跟随（D28.2）：视锥
 * 剔除继续用各档真实几何包围球（InstancedMesh.computeBoundingSphere / chunk 盒路径），
 * 与本基准无关。
 */
import type { InstanceSource } from './instancing/InstancedAssetPool';
import * as THREE from 'three';

/** High 档派生基准球缓存（消费方身份键 → 冻结基准；契约见模块头注） */
export class LodReferenceSphereCache {
  private readonly spheres = new Map<string, THREE.Sphere>();

  /** High 档源到达时派生并冻结（同 key 幂等 no-op；包围球惰性首算一次） */
  freezeFromHighSource(key: string, source: InstanceSource): void {
    if (this.spheres.has(key)) return;
    const geometry = source.geometry;
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    const sphere = geometry.boundingSphere!;
    this.spheres.set(key, new THREE.Sphere(sphere.center.clone(), sphere.radius));
  }

  /** 稳定基准球（未派生 = undefined——消费方按防御回退处理，见各链 frame 路径注） */
  get(key: string): THREE.Sphere | undefined {
    return this.spheres.get(key);
  }

  /** 释放（随消费方 dispose） */
  clear(): void {
    this.spheres.clear();
  }
}
