/**
 * editor/tools 汇总导出：工具接口（Tool/ToolContext）、管理器、核心工具与绘制子系统（draw/）。
 *
 * 边界：只依赖 core/scene/domain/registries + 本层 services(Port)（分层 DAG）；
 * 零渲染；工具产生意图、Command 落地修改，临时预览一律经 PreviewPort。
 */
export * from './Tool';
export * from './ToolManager';
export * from './SelectTool';
export * from './TransformTool';
export * from './PlacementTool';
export * from './VertexEditTool';
export * from './RoadSplitTool';
export * from './draw';
export * from './measure';
