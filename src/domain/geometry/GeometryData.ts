/**
 * domain/geometry/GeometryData —— 业务几何纯数据（Point / LineString / Polygon）。
 *
 * 职责：声明要素的空间形状数据结构与判别守卫；Vec2 = (x, 世界 z)（CONTRACTS.md #8）。
 * 边界：纯数据，不是 THREE.BufferGeometry——渲染几何由 runtime 的 GeometryBuilder 转换；
 *      Polygon 的 coordinates 为环数组，rings[0] 为外环；环推荐显式闭合（首点=末点），
 *      未闭合环由 validateGeometry 自动补齐。
 */
import type { Vec2 } from '../../core/types';

export type GeometryType = 'Point' | 'LineString' | 'Polygon';

export interface GeometryData {
  type: GeometryType;
}

export interface PointGeometryData extends GeometryData {
  type: 'Point';
  coordinates: Vec2;
}

export interface LineStringGeometryData extends GeometryData {
  type: 'LineString';
  coordinates: Vec2[];
}

export interface PolygonGeometryData extends GeometryData {
  type: 'Polygon';
  /** 环数组：rings[0] 为外环，其余为洞（一期只用外环） */
  coordinates: Vec2[][];
}

/** 判别守卫：Point 几何 */
export function isPointGeometry(g: GeometryData): g is PointGeometryData {
  return g.type === 'Point';
}

/** 判别守卫：LineString 几何 */
export function isLineStringGeometry(g: GeometryData): g is LineStringGeometryData {
  return g.type === 'LineString';
}

/** 判别守卫：Polygon 几何 */
export function isPolygonGeometry(g: GeometryData): g is PolygonGeometryData {
  return g.type === 'Polygon';
}
