/**
 * editor/tools/draw —— 绘制子系统汇总导出（T3.1 会话/吸附/错误 + T3.2 三工具与共享基座
 * + T6.5 七形状：四拖拽工具与拖拽基座，全部产出 RegionObject）。
 *
 * 边界：全部零 three；半成品只经 PreviewPort（DrawSession / DragShapeToolBase 草稿），
 * 完成产物经 CreateObjectCommand/BatchCommand 落地（CONTRACTS.md #3/#4/#5）。
 */
export * from './DrawSession';
export * from './DrawValidationError';
export * from './snap';
export * from './DrawGridConfig';
export * from './DrawToolBase';
export * from './DragShapeToolBase';
export * from './DrawPointTool';
export * from './DrawLineTool';
export * from './DrawPolygonTool';
export * from './DrawRectangleTool';
export * from './DrawCircleTool';
export * from './DrawEllipseTool';
export * from './DrawFreehandTool';
