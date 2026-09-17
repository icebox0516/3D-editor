/**
 * tests/domain/regions/roadGeometry.test.ts —— 道路分割/合并几何纯函数测试
 * （T7.6 R4/R5，先测后码；R9 测试 4 项）。
 *
 * 覆盖：
 * - detectRoadAdjacency：四邻接情形（end-start / end-end / start-start / start-end）
 *   + 容差边界（恰 0.5m 内命中 / 略超拒绝）+ 非邻接 null + 多组命中取最小距离（确定性）
 *   + 点数不足（<2）null；
 * - mergeRoadPoints：四情形拼接点列 + 丢弃第二段共享端点（以保留段端点为准）；
 * - splitRoadPoints：合法内部顶点二分（共享分割顶点）；端点/越界/非整数/点数不足 null。
 */
import { describe, expect, it } from 'vitest';
import {
  ROAD_ADJACENCY_TOLERANCE,
  detectRoadAdjacency,
  mergeRoadPoints,
  splitRoadPoints,
} from '../../../src/domain/regions/roadGeometry';

const P = (x: number, y: number) => ({ x, y });

describe('detectRoadAdjacency（端点邻接判定）', () => {
  const a = [P(0, 0), P(10, 0), P(20, 0)]; // start (0,0) → end (20,0)

  it('first.end ≈ second.start（end-start）', () => {
    const b = [P(20, 0), P(30, 0)];
    expect(detectRoadAdjacency(a, b)?.case).toBe('end-start');
  });

  it('first.end ≈ second.end（end-end：第二段反向相接）', () => {
    const b = [P(30, 0), P(20, 0)];
    expect(detectRoadAdjacency(a, b)?.case).toBe('end-end');
  });

  it('first.start ≈ second.start（start-start：两段同起点）', () => {
    const b = [P(0, 0), P(-10, 0)];
    expect(detectRoadAdjacency(a, b)?.case).toBe('start-start');
  });

  it('first.start ≈ second.end（start-end：第二段接在头部）', () => {
    const b = [P(-10, 0), P(0, 0)];
    expect(detectRoadAdjacency(a, b)?.case).toBe('start-end');
  });

  it('容差边界：距离恰 0.5（≤ 容差）命中；略超 0.5 拒绝', () => {
    const atLimit = [P(20.5, 0), P(30, 0)];
    expect(detectRoadAdjacency(a, atLimit)?.case).toBe('end-start');
    const overLimit = [P(20.51, 0), P(30, 0)];
    expect(detectRoadAdjacency(a, overLimit)).toBeNull();
  });

  it('默认容差 = 0.5；自定义容差参与判定', () => {
    expect(ROAD_ADJACENCY_TOLERANCE).toBe(0.5);
    const gap = [P(20.8, 0), P(30, 0)];
    expect(detectRoadAdjacency(a, gap)).toBeNull();
    expect(detectRoadAdjacency(a, gap, 1)?.case).toBe('end-start');
  });

  it('多组端点都在容差内 → 取距离最小者（确定性）', () => {
    // end-start 距离 0.1；start-start 距离 0.4 → 取 end-start
    const a2 = [P(0.4, 0), P(10, 0), P(20.1, 0)];
    const b = [P(20.2, 0), P(30, 0)];
    expect(detectRoadAdjacency(a2, b)?.case).toBe('end-start');
  });

  it('非邻接（全部端点组合超容差）→ null；点数不足 → null', () => {
    expect(detectRoadAdjacency(a, [P(100, 100), P(120, 100)])).toBeNull();
    expect(detectRoadAdjacency([P(0, 0)], [P(0, 0), P(5, 0)])).toBeNull();
    expect(detectRoadAdjacency(a, [P(5, 0)])).toBeNull();
  });

  it('返回命中距离（供诊断/测试断言）', () => {
    const hit = detectRoadAdjacency(a, [P(20.3, 0), P(30, 0)]);
    expect(hit?.distance).toBeCloseTo(0.3, 10);
  });
});

describe('mergeRoadPoints（四情形拼接）', () => {
  const a = [P(0, 0), P(10, 0), P(20, 0)];

  it('end-start：first + second[1..]（丢弃第二段共享起点）', () => {
    const merged = mergeRoadPoints(a, [P(20, 0), P(30, 0), P(40, 0)], 'end-start');
    expect(merged).toEqual([P(0, 0), P(10, 0), P(20, 0), P(30, 0), P(40, 0)]);
  });

  it('end-end：first + reverse(second)[1..]（第二段翻向相接）', () => {
    const merged = mergeRoadPoints(a, [P(40, 0), P(30, 0), P(20, 0)], 'end-end');
    expect(merged).toEqual([P(0, 0), P(10, 0), P(20, 0), P(30, 0), P(40, 0)]);
  });

  it('start-start：reverse(first) + second[1..]（first 翻向）', () => {
    const merged = mergeRoadPoints(a, [P(0, 0), P(-10, 0), P(-20, 0)], 'start-start');
    expect(merged).toEqual([P(20, 0), P(10, 0), P(0, 0), P(-10, 0), P(-20, 0)]);
  });

  it('start-end：second + first[1..]（second 在前，以保留段 first 端点为准去重）', () => {
    const merged = mergeRoadPoints(a, [P(-20, 0), P(-10, 0), P(0, 0)], 'start-end');
    expect(merged).toEqual([P(-20, 0), P(-10, 0), P(0, 0), P(10, 0), P(20, 0)]);
  });

  it('输出为新数组（入参点列不被修改）', () => {
    const b = [P(20, 0), P(30, 0)];
    const merged = mergeRoadPoints(a, b, 'end-start');
    expect(merged).not.toBe(a);
    expect(a).toHaveLength(3);
    expect(b).toHaveLength(2);
  });
});

describe('splitRoadPoints（内部顶点二分）', () => {
  const points = [P(0, 0), P(10, 0), P(20, 0), P(30, 0)];

  it('合法内部顶点（1..n−2）：两段共享分割顶点', () => {
    const parts = splitRoadPoints(points, 1);
    expect(parts).not.toBeNull();
    expect(parts!.first).toEqual([P(0, 0), P(10, 0)]);
    expect(parts!.second).toEqual([P(10, 0), P(20, 0), P(30, 0)]);

    const tail = splitRoadPoints(points, 2);
    expect(tail!.first).toEqual([P(0, 0), P(10, 0), P(20, 0)]);
    expect(tail!.second).toEqual([P(20, 0), P(30, 0)]);
  });

  it('端点不可分割（0 / n−1）→ null；越界 / 非整数 → null', () => {
    expect(splitRoadPoints(points, 0)).toBeNull();
    expect(splitRoadPoints(points, 3)).toBeNull();
    expect(splitRoadPoints(points, -1)).toBeNull();
    expect(splitRoadPoints(points, 4)).toBeNull();
    expect(splitRoadPoints(points, 1.5)).toBeNull();
  });

  it('点数不足（<3，无内部顶点）→ null', () => {
    expect(splitRoadPoints([P(0, 0), P(10, 0)], 1)).toBeNull();
    expect(splitRoadPoints([P(0, 0)], 0)).toBeNull();
  });

  it('输出为新数组（入参不被修改）', () => {
    const parts = splitRoadPoints(points, 1);
    expect(points).toHaveLength(4);
    expect(parts!.first).not.toBe(points);
  });
});
