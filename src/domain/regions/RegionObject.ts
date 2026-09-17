/**
 * domain/regions/RegionObject —— 形状驱动区域对象的三层结构（阶段 6 T6.1）。
 *
 * 职责：在 SceneObject 基座之上扩展三层完全解耦的字段（分域契约 contracts/stage6-region.md §A）：
 *   - shape    几何层：纯形状（七类），无业务语义；高度合成 = shape.baseHeight + transform.position.y；
 *   - semantic 语义层：业务类型 + 业务参数（道路宽度、建筑高度等），与渲染无关；
 *   - style    样式层：样式预设引用（presetId + 用户覆写），视觉表现由 runtime 样式引擎消费。
 * 边界：纯数据接口，零渲染（禁止 THREE）；沿 Element 同构先例做顶级扩展字段（T1.5 勘误：
 * updateObject patch 运行时透传任意键、结构化收窄），不与基础契约 SceneManager 签名冲突；
 * 序列化经 SceneSerializer 整体透传（§D 过渡壳），正式 v2 归 T6.9。
 * 参数化形状（圆/椭圆半径、矩形长宽等）的派生参数缓存于 shape.options，由调用方（绘制工具/
 * 面板）写入，本层只约定形态（Record<string, unknown>）。
 */
import type { Vec2 } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import type { SemanticType } from './semanticDefinitions';

/** 七类形状类型（分域契约 §A 逐字一致） */
export const SHAPE_TYPES = [
  'polygon',
  'rectangle',
  'circle',
  'ellipse',
  'freehand',
  'line',
  'point',
] as const;

export type ShapeType = (typeof SHAPE_TYPES)[number];

/** 未知值是否为合法 ShapeType（守卫，避免散落 includes 判断） */
export function isShapeType(value: unknown): value is ShapeType {
  return typeof value === 'string' && (SHAPE_TYPES as readonly string[]).includes(value);
}

/** 几何层：纯形状（points 为 XZ 平面顶点/控制点；line/point 恒 closed=false，面类恒 true） */
export interface RegionShape {
  type: ShapeType;
  points: Vec2[];
  /** 贴地层抬升基准（高度合成：最终 y = baseHeight + transform.position.y，分域契约 §A） */
  baseHeight: number;
  closed: boolean;
  /** 参数化形状派生参数缓存（圆/椭圆半径与分段、矩形长宽、自由形状平滑度等），调用方写入 */
  options?: Record<string, unknown>;
}

/** 语义层：业务类型与业务参数（道路 width、建筑 height 等，面板按语义定义自动生成） */
export interface RegionSemantic {
  type: SemanticType;
  properties: Record<string, unknown>;
}

/** 样式层：视觉引用（presetId 为样式插件注册键，非 createId 实例前缀体系） */
export interface RegionStyle {
  presetId: string;
  /** 用户覆写参数（非默认值才存；散布覆写键带 `scatter.` 前缀，D18） */
  overrides: Record<string, unknown>;
  /**
   * 散布种子（可选，T003.3/D18）：缺省时消费端派生 hash(objectId)（确定性回退）；
   * 重掷经命令显式写入；换 preset 保留——undo/redo 换回原样式散布逐位复原。
   */
  seed?: number;
}

/**
 * 绘制产物统一结构：复用 SceneObject 基座（id/name/layerId/transform/visible/locked），
 * SceneManager/选择/图层按通用字段无差别处理（§D 共存语义）。
 */
export interface RegionObject extends SceneObject {
  /** 对象类型字面量（区别于旧要素 type） */
  type: 'region';
  shape: RegionShape;
  semantic: RegionSemantic;
  style: RegionStyle;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * RegionObject 类型守卫：type 'region' 且 shape/semantic/style 三层字段齐备。
 * 用于命令/序列化/渲染侧的结构化收窄（T1.5 勘误语义）；不做深层字段校验（属 validate 职责）。
 */
export function isRegionObject(obj: SceneObject): obj is RegionObject {
  if (obj.type !== 'region') return false;
  const ext = obj as unknown as Record<string, unknown>;
  return isPlainRecord(ext.shape) && isPlainRecord(ext.semantic) && isPlainRecord(ext.style);
}
