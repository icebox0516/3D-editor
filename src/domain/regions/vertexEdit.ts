/**
 * domain/regions/vertexEdit —— 顶点编辑纯函数（阶段 6 T6.8，解禁项末档）。
 *
 * 职责：RegionObject shape.points 顶点级编辑的数据基座（零渲染，editor 编辑会话与
 * runtime 句柄层共用）：
 *  - editableShapeTypeOf / editableShapeOf：进入编辑会话的目标形状——面类（含参数化
 *    rectangle/circle/ellipse）→ polygon 自由点列；**参数化形状进入编辑即转 polygon，
 *    原 options（半径/长宽/分段）随之失效不携带**（转换仅存在于编辑会话内存，首次
 *    提交时随 after 点列落库，任务书推荐语义）；line → line（closed=false）、
 *    point → point（单点）；baseHeight 恒保留；
 *  - insertVertexAt / removeVertexAt：纯点列插删（新数组，不改入参；越界防御返回等值拷贝）；
 *  - canRemoveVertex：删除约束的数据判定——面保持 ≥3 顶点、线保持 ≥2 点、点恒不可删
 *    （违例由调用方拦截提示）；
 *  - pointsEqual：点列逐项相等（零位移手势不入历史的判定）。
 * 边界：纯函数；转换复用 shapeConvert.convertShape（单一真相源）；不构造 RegionObject、
 *      不触碰语义/样式层（三层解耦，分域契约 §A）。
 */
import type { Vec2 } from '../../core/types';
import type { RegionShape } from './RegionObject';
import { convertShape } from './shapeConvert';

/** 顶点编辑会话的目标形状类型：面类统一转 polygon 自由点列，line/point 保持自身 */
export type EditableShapeType = 'polygon' | 'line' | 'point';

/** 形状类型 → 编辑会话目标类型（面类 → polygon；line / point → 自身） */
export function editableShapeTypeOf(shape: RegionShape): EditableShapeType {
  if (shape.type === 'line') return 'line';
  if (shape.type === 'point') return 'point';
  return 'polygon';
}

/**
 * 进入编辑会话的目标形状：经 convertShape 转换（参数化形状点列按 options 采样生成、
 * options 丢弃——缓存失效；polygon/freehand/line/point 点列等值拷贝）；baseHeight 保留。
 */
export function editableShapeOf(shape: RegionShape): RegionShape {
  return convertShape(shape, editableShapeTypeOf(shape));
}

/** 在 index 后插入顶点（index = 边 i→i+1 的插入位；越界返回等值拷贝） */
export function insertVertexAt(points: readonly Vec2[], index: number, point: Vec2): Vec2[] {
  if (!Number.isInteger(index) || index < 0 || index >= points.length) {
    return points.map((p) => ({ x: p.x, y: p.y }));
  }
  const out = points.map((p) => ({ x: p.x, y: p.y }));
  out.splice(index + 1, 0, { x: point.x, y: point.y });
  return out;
}

/** 删除 index 处顶点（越界返回等值拷贝；约束校验归 canRemoveVertex，调用方先判） */
export function removeVertexAt(points: readonly Vec2[], index: number): Vec2[] {
  if (!Number.isInteger(index) || index < 0 || index >= points.length) {
    return points.map((p) => ({ x: p.x, y: p.y }));
  }
  const out = points.map((p) => ({ x: p.x, y: p.y }));
  out.splice(index, 1);
  return out;
}

/** 顶点删除约束：面保持 ≥3 顶点、线保持 ≥2 点、点恒不可删 */
export function canRemoveVertex(shapeType: EditableShapeType, count: number): boolean {
  switch (shapeType) {
    case 'polygon':
      return count > 3;
    case 'line':
      return count > 2;
    default:
      return false;
  }
}

/** 点列逐项相等（长度相同且坐标按位相等） */
export function pointsEqual(a: readonly Vec2[], b: readonly Vec2[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.x !== b[i]!.x || a[i]!.y !== b[i]!.y) return false;
  }
  return true;
}
