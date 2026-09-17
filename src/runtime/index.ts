/**
 * runtime 层汇总导出：渲染总管 / 映射 / 适配器 / 渲染器体系 / 加载器 / Port 实现。
 *
 * 职责：「业务数据 → Three.js 对象」的单向映射（Renderer 编排，Adapter/Renderer 分派；
 *      重复资产经 InstancedAssetPool 实例化合批；空间索引占位在 spatial/）。
 * 边界：three/three/examples 仅允许出现在本层与 src/app/**、src/main.tsx
 *      （check-layer-deps.mjs 强制）；只读 Scene 数据，反向修改一律禁止；
 *      Port 实现（RuntimeViewport/CameraController/PreviewManager）对应接口在
 *      editor/services/ports（依赖倒置），由 app 组合根装配注入。
 * 阶段 6 T6.2 增补 styles/（插件化样式引擎，分域契约 §C——仅 runtime/app 可见）；
 * T6.4 增补 geometry/（RegionShape → BufferGeometry 构建器）与 RegionRenderer/layerState；
 * T6.7 删除 v1 旧要素渲染器与旧材质工厂（旧要素体系退役），objectState 为
 * applySceneObjectState 迁移归宿（原 ElementRenderer 内联纯函数）。
 */
export * from './RuntimeObjectMap';
export * from './ObjectAdapter';
export * from './SceneSync';
export * from './Renderer';
export * from './instancing/InstancedAssetPool';
export * from './spatial/SpatialIndex';
export * from './geometry/GeometryBuilder';
export * from './renderers/geometryBuilders';
export * from './renderers/RendererRegistry';
export * from './renderers/RegionRenderer';
export * from './renderers/layerState';
export * from './renderers/objectState';
export * from './loaders/AssetLoader';
export * from './loaders/ThumbnailCache';
export * from './services/RuntimeViewport';
export * from './services/CameraController';
export * from './services/PreviewManager';
export * from './services/GizmoImpl';
export * from './styles';
