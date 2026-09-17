// editor 层：commands / history / tools / services(Port) / EditorFacade —— 用户操作与交互编排，渲染能力经 Port 依赖倒置。
// 边界：只依赖 core/scene/domain/registries（分层 DAG）；零渲染——禁止任何 THREE 类型或导入，
// 渲染能力经 services/ports 的 Port 接口由 runtime 实现、app 注入（依赖倒置）。
export * from './services/ports';
export * from './commands';
export * from './factories';
export * from './history/HistoryManager';
export * from './tools';
export * from './EditorFacade';
