/**
 * core/math —— 业务几何计算工具（二维，Vec2 = (x, 世界 z)）。
 *
 * 职责：绘制辅助（T3.2 吸附/闭合判定）与几何校验（T1.2/T3.1 自相交/面积）所需的
 *      距离、折线长度、多边形面积、点到线段距离、线段相交判定；
 *      阶段 10 测量域三维纯函数（T10.1：dist3/polylineLength3/polygonAreaXZ/angleDeg/
 *      isCollinearXZ——editor 测量工具与 runtime 覆盖层标签共用，DAG 下 core 是两层的
 *      唯一合法公共层，故收编于此；仍为零依赖纯函数）。
 * 边界：只做业务计算，不替代 three 的数学库；core 层零依赖。
 */
import type { Vec2, Vec3 } from '../types';

/** 两点欧氏距离的平方（比较用途优先，避免开方） */
export function dist2(a: Vec2, b: Vec2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

/** 两点欧氏距离 */
export function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt(dist2(a, b));
}

/** 折线长度：逐段累加；空折线或单点折线返回 0 */
export function polylineLength(points: Vec2[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += dist(points[i - 1], points[i]);
  }
  return length;
}

/** 多边形面积（鞋带公式，返回绝对值，与顶点绕向无关）；顶点少于 3 个返回 0。环不要求显式闭合 */
export function polygonArea(ring: Vec2[]): number {
  const n = ring.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % n];
    sum += p.x * q.y - q.x * p.y;
  }
  return Math.abs(sum) / 2;
}

/**
 * 点在多边形内判定（射线法，奇偶规则）：支持任意简单多边形（凸/凹/带共线边），
 * 与顶点绕向无关；环不要求显式闭合。点在边界上的行为不确定（浮点敏感）——
 * 调用方若需严格内点语义应自行容差偏移。撒点（domain/scatter）用它过滤落点。
 */
export function pointInPolygon(p: Vec2, ring: Vec2[]): boolean {
  const n = ring.length;
  if (n < 3) return false;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = ring[j]!;
    const b = ring[i]!;
    // 只处理「跨 p.y 水平线」的边，异或翻转奇偶
    if (b.y > p.y !== a.y > p.y) {
      const xAtY = a.x + ((p.y - a.y) / (a.y - b.y)) * (b.x - a.x);
      if (p.x < xAtY) inside = !inside;
    }
  }
  return inside;
}

/** 点到线段的最短距离（投影钳制到 [0,1]；零长度线段退化为点到点距离） */
export function pointToSegmentDistance(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return dist(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/** 叉积 o->a 与 o->b 的 z 分量：>0 左转，<0 右转，=0 共线 */
function cross(o: Vec2, a: Vec2, b: Vec2): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/** 共线前提下，点 q 是否落在 p-r 的包围盒内（含端点） */
function withinBox(p: Vec2, r: Vec2, q: Vec2): boolean {
  return (
    q.x >= Math.min(p.x, r.x) &&
    q.x <= Math.max(p.x, r.x) &&
    q.y >= Math.min(p.y, r.y) &&
    q.y <= Math.max(p.y, r.y)
  );
}

/**
 * 线段相交判定（含端点相接、共线重叠、T 形相接；不含共线不相接）。
 * 用于几何校验（自相交检测）与绘制辅助（闭合判定）。
 */
export function segmentsIntersect(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  const d1 = cross(b1, b2, a1);
  const d2 = cross(b1, b2, a2);
  const d3 = cross(a1, a2, b1);
  const d4 = cross(a1, a2, b2);

  // 规范相交：两线段的端点分别严格位于对方两侧
  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true;
  }

  // 退化情形：端点落在对方线段上（共线 + 包围盒内）
  if (d1 === 0 && withinBox(b1, b2, a1)) return true;
  if (d2 === 0 && withinBox(b1, b2, a2)) return true;
  if (d3 === 0 && withinBox(a1, a2, b1)) return true;
  if (d4 === 0 && withinBox(a1, a2, b2)) return true;

  return false;
}

// ── 阶段 10 测量域三维纯函数（T10.1；口径见 contracts/stage10-measure.md §A）──────

/** 三维欧氏距离 */
export function dist3(a: Vec3, b: Vec3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** 三维折线累计长度：逐段累加；空折线或单点折线返回 0 */
export function polylineLength3(points: Vec3[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += dist3(points[i - 1]!, points[i]!);
  }
  return length;
}

/** 水平投影面积（XZ 平面）：点列映射 (x, z) 后套鞋带公式；y 分量不参与（口径单一，斜面表面积不做） */
export function polygonAreaXZ(points: Vec3[]): number {
  return polygonArea(points.map((p) => ({ x: p.x, y: p.z })));
}

/**
 * ∠ABC（角点 b）三维夹角，度，0–180：acos 夹角（点积 / 模长积，钳制 [-1,1] 抗浮点越界）。
 * 退化（任一臂零长度）返回 0。
 */
export function angleDeg(a: Vec3, b: Vec3, c: Vec3): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v1z = a.z - b.z;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const v2z = c.z - b.z;
  const dot = v1x * v2x + v1y * v2y + v1z * v2z;
  const m1 = Math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z);
  const m2 = Math.sqrt(v2x * v2x + v2y * v2y + v2z * v2z);
  if (m1 === 0 || m2 === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** XZ 投影共线判定（面积工具「≥3 非共线」拦截）：全部点落在首两点决定的直线上（容差 1e-9） */
export function isCollinearXZ(points: Vec3[]): boolean {
  const n = points.length;
  if (n < 3) return false;
  const p0 = points[0]!;
  const p1 = points[1]!;
  let dirX = p1.x - p0.x;
  let dirZ = p1.z - p0.z;
  // 首两点重合：沿点列找第一条非零方向基准
  let base = 1;
  while (dirX === 0 && dirZ === 0 && base + 1 < n) {
    base += 1;
    dirX = points[base]!.x - p0.x;
    dirZ = points[base]!.z - p0.z;
  }
  if (dirX === 0 && dirZ === 0) return true; // 全部点重合：退化共线
  for (let i = base + 1; i < n; i++) {
    const cross = dirX * (points[i]!.z - p0.z) - dirZ * (points[i]!.x - p0.x);
    if (Math.abs(cross) > 1e-9) return false;
  }
  return true;
}
