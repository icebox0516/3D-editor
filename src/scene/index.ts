/**
 * scene 层汇总导出：数据接口（SceneObject/GroupObject/Layer/SceneData）、管理器
 * （SceneManager/SelectionManager）与层级派生纯函数（hierarchy，T8.5）。
 *
 * 职责：场景唯一数据源的纯数据容器与增删改查、选中集管理、parentId 层级派生。
 * 边界：只依赖 core（分层 DAG：scene→core）；零渲染（禁止 THREE，见 CONTRACTS.md #5）。
 */
export * from './SceneObject';
export * from './GroupObject';
export * from './Layer';
export * from './SceneData';
export * from './SceneManager';
export * from './SelectionManager';
export * from './hierarchy';
