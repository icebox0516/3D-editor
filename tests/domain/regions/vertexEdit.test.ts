/**
 * tests/domain/regions/vertexEdit.test.ts —— 顶点编辑纯函数测试（阶段 6 T6.8，先测后码）。
 *
 * 覆盖（任务书验收 2/4/5 项的数据基座）：
 * - editableShapeTypeOf / editableShapeOf：七类形状进入编辑会话的目标形状——
 *   面类（含参数化 rectangle/circle/ellipse）→ polygon 自由点列（options 丢弃，
 *   「参数化形状进入编辑即转 polygon，options 缓存失效标注」）；line → line（closed=false）；
 *   point → point（单点）；baseHeight 恒保留；
 * - insertVertexAt：在 index 后插入（不修改入参，返回新数组）；
 * - removeVertexAt：删除 index 处顶点（不修改入参）；
 * - canRemoveVertex：面 ≥3 / 线 ≥2 / 点恒不可删（违例拦截的数据判定）；
 * - pointsEqual：点列逐项相等（零位移手势不入历史判定）。
 */
import { describe, expect, it } from 'vitest';
import {
  canRemoveVertex,
  editableShapeOf,
  editableShapeTypeOf,
  insertVertexAt,
  pointsEqual,
  removeVertexAt,
} from '../../../src/domain/regions/vertexEdit';
import type { RegionShape } from '../../../src/domain/regions';

const TRIANGLE: RegionShape = {
  type: 'polygon',
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 10 },
  ],
  baseHeight: 0.12,
  closed: true,
};

describe('editableShapeTypeOf / editableShapeOf（进入编辑会话的目标形状）', () => {
  it('面类（polygon/freehand/rectangle/circle/ellipse）→ polygon', () => {
    for (const type of ['polygon', 'freehand', 'rectangle', 'circle', 'ellipse'] as const) {
      expect(editableShapeTypeOf({ ...TRIANGLE, type })).toBe('polygon');
    }
  });

  it('line → line；point → point', () => {
    expect(editableShapeTypeOf({ ...TRIANGLE, type: 'line', closed: false })).toBe('line');
    expect(
      editableShapeTypeOf({ ...TRIANGLE, type: 'point', points: [{ x: 1, y: 2 }], closed: false }),
    ).toBe('point');
  });

  it('circle → polygon：点列原样保留（参数化派生点已在 points）、options 丢弃、baseHeight 保留', () => {
    const circle: RegionShape = {
      type: 'circle',
      points: [
        { x: 5, y: 0 },
        { x: 0, y: 5 },
        { x: -5, y: 0 },
        { x: 0, y: -5 },
      ],
      baseHeight: 0.18,
      closed: true,
      options: { radius: 5, segments: 4 },
    };
    const editable = editableShapeOf(circle);
    expect(editable.type).toBe('polygon');
    expect(editable.closed).toBe(true);
    expect(editable.baseHeight).toBe(0.18);
    expect(editable.options).toBeUndefined(); // 参数化 options 失效不携带
    expect(editable.points).toEqual(circle.points);
  });

  it('polygon 点列原样（等值新引用）；line 保留 closed=false；point 单点', () => {
    const poly = editableShapeOf(TRIANGLE);
    expect(poly.points).toEqual(TRIANGLE.points);
    expect(poly.points).not.toBe(TRIANGLE.points);

    const line = editableShapeOf({
      type: 'line',
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ],
      baseHeight: 0.06,
      closed: false,
    });
    expect(line.type).toBe('line');
    expect(line.closed).toBe(false);
    expect(line.points.length).toBe(2);

    const point = editableShapeOf({
      type: 'point',
      points: [{ x: 3, y: 4 }],
      baseHeight: 0,
      closed: false,
    });
    expect(point.type).toBe('point');
    expect(point.points).toEqual([{ x: 3, y: 4 }]);
  });
});

describe('insertVertexAt / removeVertexAt（纯点列操作）', () => {
  it('在 index 后插入（末尾 index = 点列长度-1 → 追加）', () => {
    const src = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const out = insertVertexAt(src, 0, { x: 5, y: 0 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect(src.length).toBe(2); // 入参不动
  });

  it('删除 index 处顶点', () => {
    const out = removeVertexAt(TRIANGLE.points, 1);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
    ]);
    expect(TRIANGLE.points.length).toBe(3); // 入参不动
  });

  it('越界 index 防御：插入/删除均返回等值拷贝不抛错', () => {
    expect(insertVertexAt(TRIANGLE.points, 99, { x: 1, y: 1 })).toEqual(TRIANGLE.points);
    expect(removeVertexAt(TRIANGLE.points, -1)).toEqual(TRIANGLE.points);
  });
});

describe('canRemoveVertex（≥3 面 / ≥2 线约束）', () => {
  it('面：>3 可删，=3 拦截', () => {
    expect(canRemoveVertex('polygon', 4)).toBe(true);
    expect(canRemoveVertex('polygon', 3)).toBe(false);
  });

  it('线：>2 可删，=2 拦截', () => {
    expect(canRemoveVertex('line', 3)).toBe(true);
    expect(canRemoveVertex('line', 2)).toBe(false);
  });

  it('点：恒不可删', () => {
    expect(canRemoveVertex('point', 1)).toBe(false);
    expect(canRemoveVertex('point', 5)).toBe(false);
  });
});

describe('pointsEqual（零位移判定）', () => {
  it('等值点列 / 含 NaN 安全', () => {
    expect(pointsEqual(TRIANGLE.points, editableShapeOf(TRIANGLE).points)).toBe(true);
    expect(
      pointsEqual(TRIANGLE.points, [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10.5 },
      ]),
    ).toBe(false);
    expect(pointsEqual(TRIANGLE.points, TRIANGLE.points.slice(0, 2))).toBe(false);
  });
});
