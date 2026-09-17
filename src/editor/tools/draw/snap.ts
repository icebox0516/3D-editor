/**
 * editor/tools/draw/snap —— 绘制吸附纯函数（T3.2 绘制工具使用）。
 *
 * 职责：正交锁定（X/Z 轴向投影）、角度锁定（方向吸附保持距离）、网格吸附三件套，
 *      对应需求文档「绘制模式」与「吸附、网格与视图」中的一期 Ground/Grid 吸附规划。
 * 边界：纯函数，零 three、零 DOM、不修改入参；坐标约定 Vec2 = (x, 世界 z)，
 *      轴名 'z' 对应 Vec2.y 分量（CONTRACTS.md #8）。
 */
import type { Vec2 } from '../../../core/types';

/**
 * 正交锁定：把 from→to 的落点投影到指定轴方向。
 * axis='x'（锁 X 轴）：x 取 to、z 取 from；axis='z'（锁 Z 轴）：x 取 from、z 取 to。
 */
export function orthoLock(from: Vec2, to: Vec2, axis: 'x' | 'z'): Vec2 {
  return axis === 'x' ? { x: to.x, y: from.y } : { x: from.x, y: to.y };
}

/**
 * 角度锁定：把 from→to 的方向吸附到最近的 stepDeg 度数倍数方向，距离保持不变。
 * stepDeg 非法（≤0 / 非有限值）时不吸附，返回 to 的副本；
 * from 与 to 重合（零距离）时方向无意义，返回 from 的副本。
 */
export function angleLock(from: Vec2, to: Vec2, stepDeg = 45): Vec2 {
  if (!(stepDeg > 0) || !Number.isFinite(stepDeg)) {
    return { x: to.x, y: to.y };
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return { x: from.x, y: from.y };
  }
  const stepRad = (stepDeg * Math.PI) / 180;
  const snapped = Math.round(Math.atan2(dy, dx) / stepRad) * stepRad;
  return {
    x: from.x + distance * Math.cos(snapped),
    y: from.y + distance * Math.sin(snapped),
  };
}

/**
 * 网格吸附：p 的各分量吸附到最近的 gridSize 整数倍网格点。
 * gridSize 非法（≤0 / 非有限值）时返回 p 的副本（避免除零，不吸附）。
 */
export function gridSnap(p: Vec2, gridSize: number): Vec2 {
  if (!Number.isFinite(gridSize) || gridSize <= 0) {
    return { x: p.x, y: p.y };
  }
  return {
    x: Math.round(p.x / gridSize) * gridSize,
    y: Math.round(p.y / gridSize) * gridSize,
  };
}
