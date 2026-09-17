/**
 * domain/regions/roadGeometry —— 道路分割/合并几何纯函数（T7.6 R4/R5）。
 *
 * 职责：line region 中心线的端点邻接判定、四情形合并拼接、内部顶点二分——
 *  editor 命令（SplitRoadCommand / MergeRoadCommand）与 ui 矩阵（合并按钮的
 *  visible-when-applicable 判定）共用的单一真相源；全部纯点列运算（世界坐标
 *  由调用方换算，本层不感知 transform）。
 *  - detectRoadAdjacency：四端点组合（end-start / end-end / start-start / start-end）
 *    距离最小且 ≤ 容差者命中（并列按此列举序，确定性）；默认容差 0.5m；
 *  - mergeRoadPoints：按邻接情形拼接——保留段在前、附加段翻向/直连按序相接，
 *    丢弃第二段共享端点（以保留段端点为准，避免接点重复顶点）；
 *  - splitRoadPoints：仅在内部顶点（index 1..n−2，端点不可分割）二分，两段共享
 *    分割顶点（各保持 ≥2 点）。
 * 边界：纯函数零渲染（CONTRACTS #5）；点数 <2 的线不参与邻接/合并；n<3 不可分割。
 */
import type { Vec2 } from '../../core/types';

/** 端点邻接容差（米；主代理 T7.6 裁定） */
export const ROAD_ADJACENCY_TOLERANCE = 0.5;

/** 四种邻接情形（first/second 各自 start/end 的相接组合） */
export type RoadAdjacencyCase = 'end-start' | 'end-end' | 'start-start' | 'start-end';

/** 邻接命中：情形 + 端点距离（诊断/断言用） */
export interface RoadAdjacency {
  case: RoadAdjacencyCase;
  distance: number;
}

const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * 端点邻接判定（纯函数）：四组合距离最小且 ≤ tolerance 者命中（并列按
 * end-start → end-end → start-start → start-end 序，确定性输出）；
 * 任一点列不足 2 点或全部组合超容差 → null。
 */
export function detectRoadAdjacency(
  a: readonly Vec2[],
  b: readonly Vec2[],
  tolerance = ROAD_ADJACENCY_TOLERANCE,
): RoadAdjacency | null {
  if (a.length < 2 || b.length < 2) return null;
  const aStart = a[0]!;
  const aEnd = a[a.length - 1]!;
  const bStart = b[0]!;
  const bEnd = b[b.length - 1]!;
  const combos: ReadonlyArray<{ case: RoadAdjacencyCase; distance: number }> = [
    { case: 'end-start', distance: dist(aEnd, bStart) },
    { case: 'end-end', distance: dist(aEnd, bEnd) },
    { case: 'start-start', distance: dist(aStart, bStart) },
    { case: 'start-end', distance: dist(aStart, bEnd) },
  ];
  let best: { case: RoadAdjacencyCase; distance: number } | null = null;
  for (const combo of combos) {
    if (combo.distance > tolerance) continue;
    if (best === null || combo.distance < best.distance) best = combo;
  }
  return best;
}

/** 点列反转（新数组） */
function reversed(points: readonly Vec2[]): Vec2[] {
  return [...points].reverse().map((p) => ({ x: p.x, y: p.y }));
}

/** 点列拷贝（新数组，逐点新对象） */
function copied(points: readonly Vec2[]): Vec2[] {
  return points.map((p) => ({ x: p.x, y: p.y }));
}

/**
 * 四情形拼接（纯函数）——保留段在前、附加段按情形直连或翻向相接，丢弃附加段
 * 共享端点（以保留段端点为准，接点不产生重复顶点）：
 *  - end-start：first + second[1..]
 *  - end-end：first + reverse(second)[1..]
 *  - start-start：reverse(first) + second[1..]
 *  - start-end：second + first[1..]
 */
export function mergeRoadPoints(
  a: readonly Vec2[],
  b: readonly Vec2[],
  adjacency: RoadAdjacencyCase,
): Vec2[] {
  switch (adjacency) {
    case 'end-start':
      return [...copied(a), ...copied(b.slice(1))];
    case 'end-end':
      return [...copied(a), ...reversed(b).slice(1)];
    case 'start-start':
      return [...reversed(a), ...copied(b.slice(1))];
    case 'start-end':
      return [...copied(b), ...copied(a.slice(1))];
  }
}

/**
 * 内部顶点二分（纯函数）：index ∈ 1..n−2（端点不可分割）→ 两段点列
 * { first: points[0..i], second: points[i..end] }（共享分割顶点，各 ≥2 点）；
 * 点数不足（<3）/ 越界 / 非整数 → null。
 */
export function splitRoadPoints(
  points: readonly Vec2[],
  index: number,
): { first: Vec2[]; second: Vec2[] } | null {
  if (!Number.isInteger(index)) return null;
  if (points.length < 3) return null;
  if (index < 1 || index > points.length - 2) return null;
  return {
    first: copied(points.slice(0, index + 1)),
    second: copied(points.slice(index)),
  };
}
