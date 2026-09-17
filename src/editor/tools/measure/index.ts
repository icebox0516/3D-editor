/**
 * editor/tools/measure —— 四类测量工具子系统（阶段 10，T10.1）。
 *
 * 边界：只依赖 core + 本层 services（Port）+ draw/snap 纯函数（分层 DAG）；零 THREE；
 *      会话存储在 editor/services/measure（MeasureSession，跨工具存活），
 *      渲染经 MeasurePort（runtime MeasureOverlay 实现，app 注入）。
 */
export * from './MeasureTool';
