/**
 * runtime/styles/presetShapes —— 预设共用形状支撑集（T6.3）。
 *
 * 职责：从 domain SHAPE_TYPES 组装各预设族共用的 supportedShapes 集合，
 *      避免重复字面量数组散落各插件文件（面类五形状 = 面域填充类预设共用）。
 * 边界：纯数据派生，零 THREE；仅被 *.preset.ts 插件消费（非插件文件，不进 glob 收割）。
 */
import { SHAPE_TYPES } from '../../domain/regions';
import type { ShapeType } from '../../domain/regions';

/** 面类五形状（polygon/rectangle/circle/ellipse/freehand）：面域填充类预设的支撑集 */
export const SURFACE_SHAPES: readonly ShapeType[] = SHAPE_TYPES.filter(
  (type) => type !== 'line' && type !== 'point',
);
