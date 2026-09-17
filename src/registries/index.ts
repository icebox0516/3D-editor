/**
 * registries 层汇总导出：注册表（semantic/asset/tool/command/preset）。
 *
 * 职责：系统的注册制扩展入口——「注册-定义-工厂-实例」模式；业务代码的类型分派
 *      一律经注册表查询，禁止散落的 if (type === '…') 判断（CONTRACTS.md #6）。
 *      阶段 6 T6.1 增补 SemanticRegistry（十类语义定义，纯数据）；T6.2 增补
 *      StylePresetRegistry（插件化样式预设元数据，永不含构建函数——构建函数在
 *      runtime/styles 构建路由，DAG 禁止 registries→runtime）。
 * T6.9（2026-09-12）：ElementRegistry / StyleRegistry（v1 旧契约类型面）已删除——
 *      JsonImporter v2 零注册表依赖，RegionObject 语义/预设默认值以
 *      domain/regions/semanticDefinitions 为单一真相源。
 * 边界：只依赖 core/scene/domain（分层 DAG）；零渲染（禁止 THREE）。
 */
export * from './StylePresetRegistry';
export * from './SemanticRegistry';
export * from './AssetRegistry';
export * from './ToolRegistry';
export * from './CommandRegistry';
