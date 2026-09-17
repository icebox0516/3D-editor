/**
 * runtime/spatial/SpatialIndex —— 空间索引接口占位（需求 §非功能需求·性能：
 * 「预留空间索引接口（BVH / 四叉树）：场景对象规模上升后接入，不改业务代码」）。
 *
 * 职责：定义 id ↔ AABB 的空间查询契约；本期提供线性暴力实现
 *      （LinearSpatialIndex，O(n) 扫描），消费方仅依赖 SpatialIndex 接口，
 *      规模上升后替换为 BVH / 四叉树实现，业务代码零变化。
 * 边界：纯数据结构——只依赖 core 的 Vec3/ID，不导入 three、不感知渲染；
 *      AABB 为轴对齐包围盒（min/max 均为闭区间，共享面视为相交）；
 *      本期无消费方（占位），接入拾取/框选加速时由对应任务引用。
 */
import type { ID, Vec3 } from '../../core/types';

/** 轴对齐包围盒（闭区间；min ≤ max 逐分量成立） */
export interface AABB {
  min: Vec3;
  max: Vec3;
}

/** 空间索引契约：插入 / 移除 / 区域查询（返回与查询盒相交的全部 id） */
export interface SpatialIndex {
  insert(id: ID, aabb: AABB): void;
  remove(id: ID): void;
  query(aabb: AABB): ID[];
}

/** 两盒是否相交（闭区间语义：任一轴共享面即视为相交） */
function intersects(a: AABB, b: AABB): boolean {
  return (
    a.min.x <= b.max.x &&
    a.max.x >= b.min.x &&
    a.min.y <= b.max.y &&
    a.max.y >= b.min.y &&
    a.min.z <= b.max.z &&
    a.max.z >= b.min.z
  );
}

/**
 * 线性暴力实现（占位）：Map 全量保存，query 逐盒扫描。
 * 规模上限内（数千对象）足够；更大规模换 BVH/四叉树实现同一接口即可。
 */
export class LinearSpatialIndex implements SpatialIndex {
  private readonly boxes = new Map<ID, AABB>();

  insert(id: ID, aabb: AABB): void {
    this.boxes.set(id, aabb);
  }

  /** 是否确实移除了一个条目（幂等：未登记返回 false） */
  remove(id: ID): boolean {
    return this.boxes.delete(id);
  }

  query(aabb: AABB): ID[] {
    const out: ID[] = [];
    for (const [id, box] of this.boxes) {
      if (intersects(aabb, box)) out.push(id);
    }
    return out;
  }

  clear(): void {
    this.boxes.clear();
  }

  size(): number {
    return this.boxes.size;
  }
}
