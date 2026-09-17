/**
 * runtime/renderers/geometryBuilders —— 业务几何 → Three.js 渲染几何的共享构造器。
 *
 * 职责：多边形环 → THREE.Shape（绕向归一）、贴地表面几何、中心线放样条带几何。
 * 边界：纯几何换算，只读 Vec2 数据；坐标约定（CONTRACTS.md #8）：业务 Vec2 = (x, 世界 z)，
 *      Y 向上、地面 XZ 平面——映射规则：shape 点取 (x, -y)，配合 rotateX(-π/2) 使
 *      shape 的 -y 轴落到世界 +z、挤出方向 +z 落到世界 +y（地面之上）。
 */
import type { Vec2 } from '../../core/types';
import * as THREE from 'three';

// 贴地表层抬升量数值源 = domain/regions/semanticDefinitions.defaultBaseHeight
// （road 0.06 / grass 0.12 / water 0.18，层序 ground(0) < 网格(0.02) < road < grass < water，
// 层间距 ≥ 0.03 防深度穿透；T6.7 删除旧要素体系后本文件不再持有数值表）。

/**
 * 多边形环 → THREE.Shape：去除重复闭合点、统一为逆时针（CCW，ExtrudeGeometry 语义），
 * 点映射 (x, -y) 使 Vec2.y 对应世界 +z。
 */
export function ringToShape(ring: Vec2[]): THREE.Shape {
  const pts = dedupeRing(ring);
  if (pts.length < 3) return new THREE.Shape(); // 退化环交由上游校验拦截，这里防御性兜底
  if (signedArea(pts) < 0) pts.reverse();
  return new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, -p.y)));
}

/** 去掉首尾重复的闭合点（保留一份） */
function dedupeRing(ring: Vec2[]): Vec2[] {
  const pts = ring.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length < 2) return [...pts];
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first.x === last.x && first.y === last.y) return pts.slice(0, -1);
  return pts;
}

/** 鞋带有向面积（正 = CCW） */
function signedArea(pts: Vec2[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    sum += p.x * q.y - q.x * p.y;
  }
  return sum / 2;
}

/** 多边形环 → 贴地表面几何（法线朝上，位于 y=elevation） */
export function polygonSurfaceGeometry(ring: Vec2[], elevation: number): THREE.BufferGeometry {
  const geometry = new THREE.ShapeGeometry(ringToShape(ring));
  geometry.rotateX(-Math.PI / 2); // XY 平面 → XZ 平面，法线 (0,0,1) → (0,1,0)
  if (elevation !== 0) geometry.translate(0, elevation, 0);
  return geometry;
}

/**
 * 中心线 + 宽度 → 条带几何（道路放样）。
 * 各顶点取相邻段方向的平均作为切向，垂直方向左右各外扩 width/2（斜接近似），
 * 法线统一朝上，位于 y=elevation。
 */
export function centerlineRibbonGeometry(
  points: Vec2[],
  width: number,
  elevation: number,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const half = Math.max(width, 0.001) / 2;
  if (pts.length < 2) return geometry; // 退化折线交由上游校验拦截

  // 每个顶点的左右偏移点（在 XZ 平面内）
  const left: Vec2[] = [];
  const right: Vec2[] = [];
  for (let i = 0; i < pts.length; i++) {
    // 相邻段方向（首点取后段、末点取前段、中间取两段平均）
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    let dx = next.x - prev.x;
    let dy = next.y - prev.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) {
      dx = 1;
      dy = 0;
    } else {
      dx /= len;
      dy /= len;
    }
    // 垂直方向（XZ 平面内旋转 90°）
    const nx = -dy * half;
    const ny = dx * half;
    left.push({ x: pts[i].x + nx, y: pts[i].y + ny });
    right.push({ x: pts[i].x - nx, y: pts[i].y - ny });
  }

  // 顶点缓冲：left[i], right[i] 交错
  const positions = new Float32Array(pts.length * 2 * 3);
  for (let i = 0; i < pts.length; i++) {
    positions[i * 6 + 0] = left[i].x;
    positions[i * 6 + 1] = elevation;
    positions[i * 6 + 2] = left[i].y;
    positions[i * 6 + 3] = right[i].x;
    positions[i * 6 + 4] = elevation;
    positions[i * 6 + 5] = right[i].y;
  }

  // 索引：每段两个三角形（绕向保证法线朝上；T3.3 勘误——原绕向 (li,ri,lj)+(ri,rj,lj)
  // 的叉积指向 -Y，被 RoadRenderer.centerline 验收测试「法线朝上」拦截后改正）
  const indices: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const li = i * 2;
    const ri = i * 2 + 1;
    const lj = (i + 1) * 2;
    const rj = (i + 1) * 2 + 1;
    indices.push(li, lj, ri, lj, rj, ri);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
