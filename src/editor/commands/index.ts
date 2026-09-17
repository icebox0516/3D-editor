/**
 * editor/commands 汇总导出：命令接口（Command/CommandContext）与命令集。
 *
 * 职责：一切可见场景修改的命令载体（创建/删除/变换/属性/图层 + 批量，
 *      T2.4 增补对象顶层字段 UpdateObjectCommand 与图层属性 UpdateLayerCommand；
 *      阶段 6 命令三件套 ChangeShape/ChangeSemantic/ChangePreset——RegionObject 的
 *      形状/语义/样式层修改，分域契约 contracts/stage6-region.md §A/§D；
 *      T8.3 增补 MergeLayerCommand（图层合并：成员迁移 + 删源一条可撤销历史）；
 *      T8.5 增补层级三件套 GroupCommand/UngroupCommand/ReparentCommand——
 *      建组/解散/换父排序（组为纯组织节点，成员世界变换零变化）。
 *      T6.7（2026-09-12）：v1 几何/样式两条 Element 语义命令已随旧要素体系退役删除
 *      （CONTRACTS.md 退役注记；过渡期并存结束）。
 * 边界：只依赖 core/scene/domain（分层 DAG）；零渲染；执行与历史入栈由
 *      editor/history/HistoryManager 编排，命令自身不感知历史。
 */
export * from './Command';
export * from './CommandContext';
export * from './CreateObjectCommand';
export * from './DeleteObjectCommand';
export * from './TransformCommand';
export * from './ChangePropertyCommand';
export * from './ChangeLayerCommand';
export * from './BatchCommand';
export * from './UpdateObjectCommand';
export * from './UpdateLayerCommand';
export * from './ChangeShapeCommand';
export * from './ChangeSemanticCommand';
export * from './ChangePresetCommand';
export * from './SplitRoadCommand';
export * from './MergeRoadCommand';
export * from './MergeLayerCommand';
export * from './GroupCommand';
export * from './UngroupCommand';
export * from './ReparentCommand';
