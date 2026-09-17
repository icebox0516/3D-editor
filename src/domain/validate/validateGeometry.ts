/**
 * domain/validate/validateGeometry —— 业务几何校验（含自动修复）。
 *
 * 职责：对 Point/LineString/Polygon 做四类检查并就地修复可修复项：
 *   - INVALID_COORD      坐标非法（缺失/非有限数值：NaN、±Infinity）
 *   - TOO_FEW_VERTICES   顶点不足（Point 恒过；线 <2；环去闭合点后 <3）
 *   - NOT_CLOSED         环未显式闭合（首点 ≠ 末点）→ 自动补首点闭合，autoFixed=true
 *   - SELF_INTERSECT     自相交（非相邻边相交，环含首尾相邻边；八字形/十字交叉中心线）
 *   修复：顺时针环自动反转（就地 reverse），autoFixed=true；未闭合环自动补闭合点。
 * 边界：纯函数（对传入 geometry 的 coordinates 就地修复）；复用 core/math 的 segmentsIntersect；
 *      环与环之间的包含/相交关系不在一期校验范围；所有环统一规整为逆时针（CCW），
 *      不采用 GeoJSON 的外环 CCW / 洞 CW 方向约定。
 *
 * 结果语义：errors 描述"原始数据存在的问题"（因此 autoFixed=true 时 errors 可非空，valid=false）；
 * autoFixed 表示"已就地修复了哪些问题"（宽限流程可凭 autoFixed 继续使用修复后的几何）。
 * ValidationError.index：Polygon 为环序号；LineString 的 SELF_INTERSECT 为相交段起始顶点序号。
 */
import { isVec2 } from '../../core/types';
import type { Vec2 } from '../../core/types';
import { segmentsIntersect } from '../../core/math';
import {
  isLineStringGeometry,
  isPointGeometry,
  isPolygonGeometry,
} from '../geometry';
import type {
  GeometryData,
  LineStringGeometryData,
  PointGeometryData,
  PolygonGeometryData,
} from '../geometry';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  autoFixed: boolean;
}

export interface ValidationError {
  code: 'SELF_INTERSECT' | 'TOO_FEW_VERTICES' | 'INVALID_COORD' | 'NOT_CLOSED';
  message: string;
  /** Polygon：环序号；LineString SELF_INTERSECT：相交段起始顶点序号 */
  index?: number;
}

/** 逐点校验上下文（内部用）：errors 收集与 autoFixed 标记 */
class Collector {
  readonly errors: ValidationError[] = [];
  autoFixed = false;

  add(code: ValidationError['code'], message: string, index?: number): void {
    this.errors.push({ code, message, ...(index !== undefined ? { index } : {}) });
  }

  result(): ValidationResult {
    return { valid: this.errors.length === 0, errors: this.errors, autoFixed: this.autoFixed };
  }
}

function coordsEqual(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y;
}

/** 坐标合法性检查：存在非法顶点则报 INVALID_COORD 并返回 false（后续几何检查无意义） */
function checkCoordinateValidity(
  points: Vec2[],
  kind: 'LineString' | `Polygon 环 ${number}`,
  index: number | undefined,
  c: Collector,
): boolean {
  const badIndex = points.findIndex((p) => !isVec2(p));
  if (badIndex !== -1) {
    c.add('INVALID_COORD', `${kind}第 ${badIndex} 个顶点坐标非法（必须为有限数值）`, index);
    return false;
  }
  return true;
}

/** 开放折线自相交：非相邻段两两判定（首尾不相连，无回绕相邻特例） */
function checkOpenChainSelfIntersect(points: Vec2[], c: Collector): void {
  const segCount = points.length - 1;
  for (let i = 0; i < segCount; i++) {
    for (let j = i + 2; j < segCount; j++) {
      if (segmentsIntersect(points[i]!, points[i + 1]!, points[j]!, points[j + 1]!)) {
        c.add('SELF_INTERSECT', `折线第 ${i} 段与第 ${j} 段相交`, i);
        return; // 只报第一处
      }
    }
  }
}

/** 闭合环自相交：非相邻段两两判定（首段与末段经闭合点相邻，需跳过该组合） */
function checkRingSelfIntersect(ring: Vec2[], segCount: number, ringIndex: number, c: Collector): void {
  for (let i = 0; i < segCount; i++) {
    for (let j = i + 2; j < segCount; j++) {
      if (i === 0 && j === segCount - 1) continue; // 首末两段共享闭合点，视为相邻
      if (segmentsIntersect(ring[i]!, ring[i + 1]!, ring[j]!, ring[j + 1]!)) {
        c.add('SELF_INTERSECT', `环 ${ringIndex} 第 ${i} 段与第 ${j} 段相交`, ringIndex);
        return; // 只报第一处
      }
    }
  }
}

/** 闭合环有向面积（鞋带公式，符号保留）：>0 逆时针（CCW），<0 顺时针（CW） */
function signedArea(ring: Vec2[], distinct: number): number {
  let sum = 0;
  for (let i = 0; i < distinct; i++) {
    const p = ring[i]!;
    const q = ring[(i + 1) % distinct]!;
    sum += p.x * q.y - q.x * p.y;
  }
  return sum / 2;
}

function validatePoint(geo: PointGeometryData, c: Collector): void {
  if (!isVec2(geo.coordinates)) {
    c.add('INVALID_COORD', 'Point 坐标非法（必须为有限数值）', 0);
  }
}

function validateLineString(geo: LineStringGeometryData, c: Collector): void {
  if (!Array.isArray(geo.coordinates)) {
    c.add('INVALID_COORD', 'LineString coordinates 结构非法（应为 Vec2 数组）', 0);
    return;
  }
  if (!checkCoordinateValidity(geo.coordinates, 'LineString', undefined, c)) return;
  if (geo.coordinates.length < 2) {
    c.add('TOO_FEW_VERTICES', `LineString 顶点数不足（至少 2 个，实际 ${geo.coordinates.length} 个）`, 0);
    return;
  }
  checkOpenChainSelfIntersect(geo.coordinates, c);
}

function validatePolygon(geo: PolygonGeometryData, c: Collector): void {
  if (!Array.isArray(geo.coordinates)) {
    c.add('INVALID_COORD', 'Polygon coordinates 结构非法（应为 Vec2[][] 环数组）', 0);
    return;
  }
  if (geo.coordinates.length === 0) {
    c.add('TOO_FEW_VERTICES', 'Polygon 缺少环（coordinates 为空）', 0);
    return;
  }
  geo.coordinates.forEach((ring, ringIndex) => {
    if (!Array.isArray(ring)) {
      c.add('INVALID_COORD', `环 ${ringIndex} 结构非法（应为 Vec2 数组）`, ringIndex);
      return;
    }
    if (!checkCoordinateValidity(ring, `Polygon 环 ${ringIndex}`, ringIndex, c)) return;

    const closed = ring.length > 0 && coordsEqual(ring[0]!, ring[ring.length - 1]!);
    const distinct = ring.length === 0 ? 0 : closed ? ring.length - 1 : ring.length;

    // 顶点数按"去闭合点后的有效顶点"计：闭合环 [a,b,a] 实际只有 2 个有效顶点
    if (distinct < 3) {
      c.add(
        'TOO_FEW_VERTICES',
        `Polygon 环 ${ringIndex} 有效顶点数不足（至少 3 个，实际 ${distinct} 个）`,
        ringIndex,
      );
      return;
    }

    // 未闭合：补首点闭合（就地修复），同时报 NOT_CLOSED 说明原始数据问题
    if (!closed) {
      ring.push({ ...ring[0]! });
      c.autoFixed = true;
      c.add('NOT_CLOSED', `环 ${ringIndex} 未闭合（首点 ≠ 末点），已自动补首点闭合`, ringIndex);
    }

    // 自相交（闭合后环共 distinct 段）
    checkRingSelfIntersect(ring, distinct, ringIndex, c);

    // 顺时针环自动反转为逆时针（就地修复，不报错）
    if (signedArea(ring, distinct) < 0) {
      ring.reverse();
      c.autoFixed = true;
    }
  });
}

/** 校验业务几何：四类检查 + 就地自动修复（未闭合补首点、顺时针反转），见文件头语义说明 */
export function validateGeometry(geometry: GeometryData): ValidationResult {
  const c = new Collector();
  if (isPointGeometry(geometry)) {
    validatePoint(geometry, c);
  } else if (isLineStringGeometry(geometry)) {
    validateLineString(geometry, c);
  } else if (isPolygonGeometry(geometry)) {
    validatePolygon(geometry, c);
  }
  return c.result();
}
