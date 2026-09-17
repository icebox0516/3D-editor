/**
 * domain/regions/shapePoints —— 参数化形状点生成纯函数（阶段 6 T6.1）。
 *
 * 职责：矩形/圆/椭圆 → 顶点序列（Vec2[]，逆时针 CCW，与 validateGeometry 环方向规整一致）；
 *      自由形状 → 道格拉斯-普克简化（simplifyFreehand）+ 可选 Chaikin 平滑（smoothFreehand，
 *      端点保持）。输出点列由调用方（绘制工具/面板）写入 RegionShape.points。
 * 边界：纯函数、零渲染（runtime GeometryBuilder 消费本组函数，分域契约 §0）；**函数自身不构造
 *      RegionShape、不写 options**——参数化形状的派生参数（半径/长宽/分段/平滑度）存入调用方
 *      shape.options 的纪律由调用方遵守（签名不含 shape 即此约束的显式表达）。
 * 坐标约定：业务 Vec2 = (x, 世界 z)（CONTRACTS.md #8）；点列不重复闭合点（闭合由 shape.closed
 *      表达，环校验的补闭合由 validateGeometry 自动处理）。
 */
import { pointToSegmentDistance } from '../../core/math';
import type { Vec2 } from '../../core/types';

/** 圆/椭圆默认分段数（缺省值锁定：tests/domain/regions/shapePoints.test.ts） */
export const DEFAULT_CIRCLE_SEGMENTS = 64;

/** 自由形状简化默认容差（米，缺省值锁定：tests/domain/regions/shapePoints.test.ts） */
export const DEFAULT_SIMPLIFY_TOLERANCE = 0.2;

/** 自由形状平滑默认迭代次数（缺省值锁定：tests/domain/regions/shapePoints.test.ts） */
export const DEFAULT_SMOOTH_ITERATIONS = 1;

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} 必须为有限数值（实际：${String(value)}）`);
  }
}

function assertFinitePoint(point: Vec2, name: string): void {
  assertFinite(point.x, `${name}.x`);
  assertFinite(point.y, `${name}.y`);
}

/**
 * 矩形 → 4 角点（逆时针）。width/height 为沿 x/y（世界 z）方向的边长；
 * center 缺省原点。调用方应将 { width, height, centerX, centerY } 缓存进 shape.options。
 */
export function rectanglePoints(width: number, height: number, center: Vec2 = { x: 0, y: 0 }): Vec2[] {
  assertFinite(width, 'width');
  assertFinite(height, 'height');
  assertFinitePoint(center, 'center');
  if (width <= 0 || height <= 0) {
    throw new Error(`矩形边长必须为正（width=${width}, height=${height}）`);
  }
  const hw = width / 2;
  const hh = height / 2;
  return [
    { x: center.x - hw, y: center.y - hh },
    { x: center.x + hw, y: center.y - hh },
    { x: center.x + hw, y: center.y + hh },
    { x: center.x - hw, y: center.y + hh },
  ];
}

/** 参数化椭圆弧点列（首点在正 X 轴、角度递增即逆时针）；segments ≥ 3 */
function ellipsePointList(radiusX: number, radiusY: number, segments: number): Vec2[] {
  assertFinite(radiusX, 'radiusX');
  assertFinite(radiusY, 'radiusY');
  assertFinite(segments, 'segments');
  if (radiusX <= 0 || radiusY <= 0) {
    throw new Error(`椭圆半轴必须为正（radiusX=${radiusX}, radiusY=${radiusY}）`);
  }
  if (!Number.isInteger(segments) || segments < 3) {
    throw new Error(`分段数必须为 ≥3 的整数（实际：${segments}）`);
  }
  const points: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    points.push({ x: radiusX * Math.cos(angle), y: radiusY * Math.sin(angle) });
  }
  return points;
}

/**
 * 圆 → 点列（逆时针、不重复闭合点）。调用方应将 { radius, segments } 缓存进 shape.options。
 * 注：点列以原点为圆心，平移由调用方（绘制落点/transform）承担。
 */
export function circlePoints(radius: number, segments: number = DEFAULT_CIRCLE_SEGMENTS): Vec2[] {
  return ellipsePointList(radius, radius, segments);
}

/**
 * 椭圆 → 点列（逆时针、不重复闭合点）。调用方应将 { radiusX, radiusY, segments } 缓存进 shape.options。
 * 注：同 circlePoints，以原点为中心。
 */
export function ellipsePoints(
  radiusX: number,
  radiusY: number,
  segments: number = DEFAULT_CIRCLE_SEGMENTS,
): Vec2[] {
  return ellipsePointList(radiusX, radiusY, segments);
}

/**
 * 自由形状跟踪点列 → 道格拉斯-普克简化（迭代式，保两端点）。
 * tolerance 为点到弦的垂距容差（米）；容差单调性（容差增大 → 保留点数单调不增）由算法保证，
 * 测试锁定。纯函数：不改动入参点列；空/单点/两点输入返回等值拷贝。
 * 平滑参数（若调用方启用 smoothFreehand）应缓存进 shape.options（如 { simplify: 0.2, smooth: 1 }）。
 */
export function simplifyFreehand(
  points: Vec2[],
  tolerance: number = DEFAULT_SIMPLIFY_TOLERANCE,
): Vec2[] {
  assertFinite(tolerance, 'tolerance');
  const limit = Math.max(0, tolerance);
  if (points.length <= 2) {
    return points.map((p) => ({ ...p }));
  }

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop()!;
    let maxDistance = -1;
    let maxIndex = -1;
    for (let i = start + 1; i < end; i++) {
      const distance = pointToSegmentDistance(points[i]!, points[start]!, points[end]!);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }
    if (maxIndex !== -1 && maxDistance > limit) {
      keep[maxIndex] = 1;
      stack.push([start, maxIndex], [maxIndex, end]);
    }
  }

  const simplified: Vec2[] = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) simplified.push({ ...points[i]! });
  }
  return simplified;
}

/**
 * 自由形状可选平滑：Chaikin 角切割（端点精确保持）。
 * 每次迭代对每段生成 1/4、3/4 两割点并保留原端点：点数 2 + 2×段数 = 2n（n ≥ 3）；
 * iterations 取非负整数（0 = 等值拷贝；≤2 点输入原样返回拷贝）。纯函数：不改动入参。
 * 端点保持使平滑结果可直接作为 RegionShape.points（首尾顶点不被平滑漂移）。
 */
export function smoothFreehand(
  points: Vec2[],
  iterations: number = DEFAULT_SMOOTH_ITERATIONS,
): Vec2[] {
  let remaining = Math.max(0, Math.floor(iterations));
  let current = points.map((p) => ({ ...p }));
  if (current.length <= 2 || remaining === 0) {
    return current;
  }
  while (remaining-- > 0) {
    const next: Vec2[] = [current[0]!];
    for (let i = 0; i + 1 < current.length; i++) {
      const a = current[i]!;
      const b = current[i + 1]!;
      next.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      next.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    next.push(current[current.length - 1]!);
    current = next;
  }
  return current;
}
