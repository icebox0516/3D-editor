import { describe, expect, it } from 'vitest';
import type { LineStringGeometryData, PointGeometryData, PolygonGeometryData } from '../../src/domain/geometry';
import {
  isLineStringGeometry,
  isPointGeometry,
  isPolygonGeometry,
} from '../../src/domain/geometry';
import { validateGeometry } from '../../src/domain/validate/validateGeometry';

const point = (x: number, y: number) => ({ x, y });

describe('validateGeometry · Point', () => {
  it('合法点通过', () => {
    const geo: PointGeometryData = { type: 'Point', coordinates: point(1, 2) };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.autoFixed).toBe(false);
  });

  it('坐标为 NaN / Infinity 报 INVALID_COORD', () => {
    const geo = { type: 'Point', coordinates: point(NaN, 0) } as unknown as PointGeometryData;
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe('INVALID_COORD');
  });
});

describe('validateGeometry · LineString', () => {
  it('两点折线通过', () => {
    const geo: LineStringGeometryData = { type: 'LineString', coordinates: [point(0, 0), point(1, 1)] };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.autoFixed).toBe(false);
  });

  it('少于 2 个顶点报 TOO_FEW_VERTICES', () => {
    const geo: LineStringGeometryData = { type: 'LineString', coordinates: [point(0, 0)] };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('TOO_FEW_VERTICES');
  });

  it('自相交折线（十字交叉）报 SELF_INTERSECT', () => {
    const geo: LineStringGeometryData = {
      type: 'LineString',
      coordinates: [point(0, 0), point(2, 2), point(2, 0), point(0, 2)],
    };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe('SELF_INTERSECT');
  });

  it('非有限坐标报 INVALID_COORD', () => {
    const geo = {
      type: 'LineString',
      coordinates: [point(0, 0), point(Infinity, 1)],
    } as unknown as LineStringGeometryData;
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('INVALID_COORD');
  });
});

describe('validateGeometry · Polygon', () => {
  it('闭合逆时针三角形通过（无错误、无修复）', () => {
    const geo: PolygonGeometryData = {
      type: 'Polygon',
      coordinates: [[point(0, 0), point(1, 0), point(1, 1), point(0, 0)]],
    };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.autoFixed).toBe(false);
    expect(geo.coordinates[0]).toHaveLength(4);
  });

  it('少于 3 个顶点的环报 TOO_FEW_VERTICES', () => {
    const geo: PolygonGeometryData = {
      type: 'Polygon',
      coordinates: [[point(0, 0), point(1, 0)]],
    };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('TOO_FEW_VERTICES');
  });

  it('空环报 TOO_FEW_VERTICES', () => {
    const geo: PolygonGeometryData = { type: 'Polygon', coordinates: [[]] };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('TOO_FEW_VERTICES');
  });

  it('自相交八字形环报 SELF_INTERSECT', () => {
    const geo: PolygonGeometryData = {
      type: 'Polygon',
      coordinates: [[point(0, 0), point(2, 2), point(2, 0), point(0, 2), point(0, 0)]],
    };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe('SELF_INTERSECT');
    expect(result.errors[0]!.index).toBe(0);
  });

  it('顺时针环自动反转为逆时针并置 autoFixed=true', () => {
    const ring = [point(0, 0), point(0, 1), point(1, 1), point(0, 0)]; // 鞋带有向面积为负 => 顺时针
    const geo: PolygonGeometryData = { type: 'Polygon', coordinates: [ring] };
    const result = validateGeometry(geo);
    expect(result.autoFixed).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    // 反转后仍保持闭合，且第一个点不变
    expect(geo.coordinates[0]).toEqual([point(0, 0), point(1, 1), point(0, 1), point(0, 0)]);
  });

  it('未闭合环自动补首点闭合：报 NOT_CLOSED 且 autoFixed=true', () => {
    const geo: PolygonGeometryData = {
      type: 'Polygon',
      coordinates: [[point(0, 0), point(1, 0), point(1, 1)]],
    };
    const result = validateGeometry(geo);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe('NOT_CLOSED');
    expect(result.autoFixed).toBe(true);
    // 修复后环闭合，且方向为逆时针（无需再次反转）
    expect(geo.coordinates[0]).toEqual([point(0, 0), point(1, 0), point(1, 1), point(0, 0)]);
  });

  it('环内非有限坐标报 INVALID_COORD，index 为环序号', () => {
    const geo = {
      type: 'Polygon',
      coordinates: [
        [point(0, 0), point(1, 0), point(1, 1), point(0, 0)],
        [point(NaN, 0), point(1, 0), point(1, 1), point(NaN, 0)],
      ],
    } as unknown as PolygonGeometryData;
    const result = validateGeometry(geo);
    expect(result.valid).toBe(false);
    const coordErrors = result.errors.filter((e) => e.code === 'INVALID_COORD');
    expect(coordErrors).toHaveLength(1);
    expect(coordErrors[0]!.index).toBe(1);
  });

  it('多环各自校验互不影响', () => {
    const geo: PolygonGeometryData = {
      type: 'Polygon',
      coordinates: [
        [point(0, 0), point(10, 0), point(10, 10), point(0, 0)],
        [point(2, 2), point(4, 2), point(4, 4), point(2, 2)],
      ],
    };
    const result = validateGeometry(geo);
    expect(result.valid).toBe(true);
    expect(result.autoFixed).toBe(false);
  });
});

describe('geometry 类型守卫', () => {
  it('按 type 判别三种几何', () => {
    const p: PointGeometryData = { type: 'Point', coordinates: point(0, 0) };
    const l: LineStringGeometryData = { type: 'LineString', coordinates: [point(0, 0)] };
    const g: PolygonGeometryData = { type: 'Polygon', coordinates: [[point(0, 0)]] };
    expect(isPointGeometry(p)).toBe(true);
    expect(isPointGeometry(l)).toBe(false);
    expect(isLineStringGeometry(l)).toBe(true);
    expect(isPolygonGeometry(g)).toBe(true);
    expect(isPolygonGeometry(p)).toBe(false);
  });
});
