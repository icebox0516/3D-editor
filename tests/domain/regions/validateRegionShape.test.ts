/**
 * tests/domain/regions/validateRegionShape.test.ts —— RegionShape 校验适配测试（T6.1，先测后码）。
 *
 * 覆盖（分域契约 §D「几何两套标准」② 校验复用）：
 * - polygon / freehand → 映射 PolygonGeometryData 外环复用 validateGeometry：
 *   自相交拦截、顶点不足拦截、顶点顺序（顺时针）autoFixed 语义透传、未闭合补点透传；
 * - rectangle / circle / ellipse 与 line / point → 直通合法（恒 { valid, [], false }）；
 * - 纯适配：不改动传入 shape.points（validateGeometry 的就地修复作用于适配层副本）。
 */
import { describe, expect, it } from 'vitest';
import { validateRegionShape } from '../../../src/domain/regions';
import type { RegionShape } from '../../../src/domain/regions';

function makeShape(partial: Partial<RegionShape>): RegionShape {
  return { type: 'polygon', points: [], baseHeight: 0, closed: true, ...partial };
}

describe('面类（polygon / freehand）→ 复用 validateGeometry 环校验', () => {
  it('合法逆时针闭合三角形通过', () => {
    const shape = makeShape({
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 },
        { x: 0, y: 0 }, // 显式闭合（首点重复）
      ],
    });
    const result = validateRegionShape(shape);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.autoFixed).toBe(false);
  });

  it('顺时针环：顶点顺序 autoFixed 语义透传，且不改动 shape.points', () => {
    const cw = [
      { x: 0, y: 0 },
      { x: 0, y: 3 },
      { x: 4, y: 0 },
    ];
    const shape = makeShape({ points: cw.map((p) => ({ ...p })) });
    const snapshot = shape.points.map((p) => ({ ...p }));

    const result = validateRegionShape(shape);
    expect(result.autoFixed).toBe(true);
    // 原始点列不被就地反转（validateGeometry 的修复作用于适配层副本）
    expect(shape.points).toEqual(snapshot);
  });

  it('顶点不足（去闭合点后 <3）拦截 TOO_FEW_VERTICES', () => {
    const shape = makeShape({
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    });
    const result = validateRegionShape(shape);
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain('TOO_FEW_VERTICES');
  });

  it('自相交（八字形）拦截 SELF_INTERSECT', () => {
    const shape = makeShape({
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 4 },
        { x: 4, y: 0 },
        { x: 0, y: 4 },
      ],
    });
    const result = validateRegionShape(shape);
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain('SELF_INTERSECT');
  });

  it('未闭合环：NOT_CLOSED 透传（原始数据问题），autoFixed=true', () => {
    const shape = makeShape({
      closed: false,
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
        // 首点 (0,0) ≠ 末点 (0,3)：未显式闭合
      ],
    });
    const result = validateRegionShape(shape);
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain('NOT_CLOSED');
    expect(result.autoFixed).toBe(true);
    // 适配层不改传入点列
    expect(shape.points).toHaveLength(4);
  });

  it('freehand 与 polygon 同走环校验路径', () => {
    const freehand = makeShape({
      type: 'freehand',
      closed: true,
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    });
    expect(validateRegionShape(freehand).errors.map((e) => e.code)).toContain('TOO_FEW_VERTICES');
  });
});

describe('参数化形状与线/点 → 直通合法', () => {
  it('rectangle / circle / ellipse 恒合法（含空点列）', () => {
    for (const type of ['rectangle', 'circle', 'ellipse'] as const) {
      const shape = makeShape({ type, points: [] });
      expect(validateRegionShape(shape)).toEqual({ valid: true, errors: [], autoFixed: false });
    }
  });

  it('line / point 直通合法（任务书：参数化形状与线/点天然合法）', () => {
    const line = makeShape({
      type: 'line',
      closed: false,
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    });
    expect(validateRegionShape(line)).toEqual({ valid: true, errors: [], autoFixed: false });

    const point = makeShape({ type: 'point', closed: false, points: [{ x: 1, y: 2 }] });
    expect(validateRegionShape(point)).toEqual({ valid: true, errors: [], autoFixed: false });
  });
});
