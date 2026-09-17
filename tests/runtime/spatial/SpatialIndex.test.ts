/**
 * tests/runtime/spatial/SpatialIndex.test.ts —— 空间索引接口占位测试（先测后码）。
 *
 * 覆盖（T2.3 偏差补充：预留空间索引接口 + 线性暴力实现）：
 * - insert / remove / query 基本语义：相交返回 id，不相交不返回，边界相接视为命中；
 * - 重复 insert 同 id 覆盖旧盒；移除未登记 id 幂等；
 * - clear 清空；size 计数。
 * 边界：纯数据结构（core Vec3，无 three、无 WebGL）；规模上升后换 BVH/四叉树
 *      实现同一接口，业务代码零变化（需求 §非功能需求·性能「预留空间索引接口」）。
 */
import { describe, expect, it } from 'vitest';
import { LinearSpatialIndex } from '../../../src/runtime/spatial/SpatialIndex';
import type { AABB } from '../../../src/runtime/spatial/SpatialIndex';

const box = (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): AABB => ({
  min: { x: minX, y: minY, z: minZ },
  max: { x: maxX, y: maxY, z: maxZ },
});

describe('LinearSpatialIndex（线性暴力实现）', () => {
  it('insert/query：相交区域返回 id，不相交不返回；边界相接（共享面）视为命中', () => {
    const index = new LinearSpatialIndex();
    index.insert('element_1', box(0, 0, 0, 10, 10, 10));
    index.insert('element_2', box(100, 0, 100, 110, 10, 110));

    expect(index.query(box(-1, -1, -1, 1, 1, 1))).toEqual(['element_1']);
    expect(index.query(box(99, 0, 99, 111, 10, 111))).toEqual(['element_2']);
    expect(index.query(box(0, 0, 0, 200, 10, 200)).sort()).toEqual(['element_1', 'element_2']);
    expect(index.query(box(20, 0, 20, 30, 10, 30))).toEqual([]);
    // 边界相接：min.x === 10 与盒子 max.x === 10 共享面
    expect(index.query(box(10, 0, 0, 20, 10, 10))).toEqual(['element_1']);
  });

  it('remove 后不再命中；移除未登记 id 幂等安全', () => {
    const index = new LinearSpatialIndex();
    index.insert('element_1', box(0, 0, 0, 10, 10, 10));
    expect(index.remove('element_1')).toBe(true);
    expect(index.query(box(0, 0, 0, 10, 10, 10))).toEqual([]);
    expect(index.remove('element_1')).toBe(false);
    expect(index.remove('never_existed')).toBe(false);
  });

  it('重复 insert 同 id → 覆盖旧盒（计数不变、命中新位置）', () => {
    const index = new LinearSpatialIndex();
    index.insert('element_1', box(0, 0, 0, 1, 1, 1));
    index.insert('element_1', box(50, 0, 50, 60, 1, 60));
    expect(index.size()).toBe(1);
    expect(index.query(box(0, 0, 0, 1, 1, 1))).toEqual([]);
    expect(index.query(box(55, 0, 55, 56, 1, 56))).toEqual(['element_1']);
  });

  it('clear 清空全部', () => {
    const index = new LinearSpatialIndex();
    index.insert('element_1', box(0, 0, 0, 1, 1, 1));
    index.insert('element_2', box(2, 0, 2, 3, 1, 3));
    index.clear();
    expect(index.size()).toBe(0);
    expect(index.query(box(-10, -10, -10, 10, 10, 10))).toEqual([]);
  });
});
