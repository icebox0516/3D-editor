/**
 * tests/runtime/GizmoImpl.objectSnap.test.ts —— 对象吸附纯函数测试（T7.6 R3，先测后码；
 * R9 测试 5 项）。
 *
 * 覆盖：
 * - unionFootprint：并集包围盒；空输入 null；
 * - collectSnapEdges：候选边收集（每足迹 minX/maxX/minZ/maxZ）+ 排除集；
 * - snapFootprintDelta：每轴候选择优（移动框 min/max 与候选 min/max 四组合），
 *   阈值边界（恰 ≤ 吸 / 略超不吸）、无候选 null、已对齐（零修正）null、
 *   仅单轴命中只修正该轴；
 * - 结构约定：ObjectSnapSource / GridSnapSource 为结构化配置（editor 层共享对象注入）。
 * 边界：node 环境只测纯函数（TransformControls 交互由浏览器验收覆盖；
 * GizmoImpl 行为变更不破坏 T7.5 既有 groupDelta/pose 测试）。
 */
import { describe, expect, it } from 'vitest';
import type { ID } from '../../src/core/types';
import {
  collectSnapEdges,
  snapFootprintDelta,
  unionFootprint,
} from '../../src/runtime/services/GizmoImpl';
import type { FootprintBox } from '../../src/runtime/services/GizmoImpl';

const box = (minX: number, maxX: number, minZ: number, maxZ: number): FootprintBox => ({
  minX,
  maxX,
  minZ,
  maxZ,
});

describe('unionFootprint（多选并集框）', () => {
  it('并集 = 各维度极值', () => {
    const union = unionFootprint([box(0, 10, 0, 4), box(30, 40, -6, 2), box(-5, 5, 10, 12)]);
    expect(union).toEqual(box(-5, 40, -6, 12));
  });

  it('空输入 → null', () => {
    expect(unionFootprint([])).toBeNull();
  });
});

describe('collectSnapEdges（候选边收集）', () => {
  it('每足迹贡献 minX/maxX/minZ/maxZ 四条候选边；排除集过滤', () => {
    const entries: Array<{ id: ID; box: FootprintBox }> = [
      { id: 'region_a', box: box(0, 10, 0, 4) },
      { id: 'region_b', box: box(30, 40, 20, 24) },
      { id: 'model_c', box: box(50, 50, 2, 2) },
    ];
    const edges = collectSnapEdges(entries, ['region_a']); // 排除拖拽目标自身
    expect(edges.xs).toEqual([30, 40, 50, 50]); // b 的两条 + c 的零尺寸两条
    expect(edges.zs).toEqual([20, 24, 2, 2]);
  });

  it('空候选集 → 双轴空数组', () => {
    const edges = collectSnapEdges([], []);
    expect(edges.xs).toEqual([]);
    expect(edges.zs).toEqual([]);
  });
});

describe('snapFootprintDelta（每轴候选择优）', () => {
  const edges = { xs: [10, 40], zs: [20, 60] };
  const threshold = 0.5;

  it('移动框 min 命中候选：dx = 候选 − min', () => {
    // moving.minX 9.7 → 候选 10 距离 0.3 ≤ 0.5 → dx = +0.3
    const delta = snapFootprintDelta(box(9.7, 19.7, 100, 104), edges, threshold);
    expect(delta).not.toBeNull();
    expect(delta!.dx).toBeCloseTo(0.3, 10);
    expect(delta!.dz).toBe(0); // Z 轴远离候选
  });

  it('移动框 max 命中候选（min/max 四组合同权）', () => {
    // moving.maxX 40.4 → 候选 40 距离 0.4 → dx = −0.4
    const delta = snapFootprintDelta(box(30.4, 40.4, 100, 104), edges, threshold);
    expect(delta!.dx).toBeCloseTo(-0.4, 10);
  });

  it('每轴取距离最小者（两候选同时在阈值内取更近）', () => {
    // moving.minX 9.6 距候选 10 为 0.4；moving.maxX 19.9 距候选 20? 候选只有 10/40 —— 
    // min 9.6 → 10（0.4）；max 19.6 → 无（10 差 9.6、40 差 20.4）→ 取 0.4
    const delta = snapFootprintDelta(box(9.6, 19.6, 100, 104), edges, threshold);
    expect(delta!.dx).toBeCloseTo(0.4, 10);
    // min 9.6（→10 距 0.4）与 max 39.8（→40 距 0.2）同时在阈：取更近的 max → dx = 0.2
    const dual = snapFootprintDelta(box(29.8, 39.8, 100, 104), edges, threshold);
    expect(dual!.dx).toBeCloseTo(0.2, 10);
  });

  it('阈值边界：距离恰 0.5 吸附；略超 0.5 不吸', () => {
    const atLimit = snapFootprintDelta(box(9.5, 19.5, 100, 104), edges, threshold);
    expect(atLimit!.dx).toBeCloseTo(0.5, 10);
    const overLimit = snapFootprintDelta(box(9.49, 19.49, 100, 104), edges, threshold);
    expect(overLimit).toBeNull();
  });

  it('两轴同时命中 → 双轴修正（边对齐 → 面对齐）', () => {
    const delta = snapFootprintDelta(box(9.8, 19.8, 19.9, 23.9), edges, threshold);
    expect(delta!.dx).toBeCloseTo(0.2, 10);
    expect(delta!.dz).toBeCloseTo(0.1, 10);
  });

  it('已对齐（零修正）→ null（无修正必要）', () => {
    expect(snapFootprintDelta(box(10, 20, 100, 104), edges, threshold)).toBeNull();
    expect(snapFootprintDelta(box(0, 5, 100, 104), edges, threshold)).toBeNull();
  });

  it('无候选 → null；零阈值 → 恒 null', () => {
    expect(snapFootprintDelta(box(9.9, 19.9, 100, 104), { xs: [], zs: [] }, threshold)).toBeNull();
    expect(snapFootprintDelta(box(9.9, 19.9, 100, 104), edges, 0)).toBeNull();
  });

  it('非法阈值（负数/NaN）→ 恒 null（防误吸）', () => {
    expect(snapFootprintDelta(box(9.9, 19.9, 100, 104), edges, -1)).toBeNull();
    expect(snapFootprintDelta(box(9.9, 19.9, 100, 104), edges, Number.NaN)).toBeNull();
  });
});
