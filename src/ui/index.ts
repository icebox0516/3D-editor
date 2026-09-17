/**
 * ui 层汇总导出：React 组件（Viewport / MenuBar（T5.2 主菜单条）/ ContentBrowser
 * （T5.5 底部内容浏览器，吸收 T2.1 AssetLibraryPanel）/ OutlinerPanel（T5.3 场景大纲 +
 * 图层管理双标签）/ InspectorPanel（T5.4 三标签检查器：对象属性 + 环境设置 + 全局设置）/
 * components——含 T5.1 PanelFrame / Splitter、T5.3 TabStrip、T5.6 VerticalToolbar /
 * ContextToolbar / Tooltip、T5.7 hud/ViewportHUD 四角 HUD）与 zustand 状态桥
 * （useEditorStore 编辑器事件桥、useWorkspaceStore 四区一层布局状态）及纯逻辑模块
 * （saveStatus 保存状态机、menus/menuModel 菜单模型、tools/toolIA 工具信息架构
 * （T5.6，吸收 DrawPanel 纯函数）、hud/hudModel（T5.7 HUD/状态栏读数模型）、
 * panels/outlinerModel 大纲树模型（T6.7 语义分组）、panels/inspectorModel
 * 检查器分组模型、panels/browserModel 内容浏览器模型、layout/layoutPresets 布局预设
 * 与序列化、layout/workspacePersistence 工作区自动持久化、menus/LayoutMenu 布局弹层
 * ——均 T7.3）。
 *
 * 边界：只依赖 core/scene/domain/registries/editor（分层 DAG：禁止 runtime/io）；
 *      组件只经 EditorFacade 与 store 与编辑器交互（菜单只发 actionId 回调，路由在
 *      app 层），禁止直接操作 THREE.Object3D（CONTRACTS.md #11）；
 *      设计系统：styles/tokens.css（变量）+ styles/app.css（组件），方向说明见 styles/DESIGN.md。
 *      T6.7：panels/SimpleStylePicker 与 icons/custom（v1 旧要素 UI）已删除。
 */
export * from './store';
export * from './layout/workspaceStore';
export * from './layout/layoutPresets';
export * from './layout/workspacePersistence';
export * from './saveStatus';
export * from './feedback/toastStore';
export * from './menus/menuModel';
export * from './menus/contextMenus';
export * from './menus/MenuBar';
export * from './menus/LayoutMenu';
export * from './Viewport';
export * from './hud/hudModel';
export * from './hud/ViewportHUD';
export * from './panels/ContentBrowser';
export * from './panels/browserModel';
export * from './panels/InspectorPanel';
export * from './panels/inspectorModel';
export * from './panels/NumberField';
export * from './panels/StyleParametersForm';
export * from './panels/OutlinerPanel';
export * from './panels/outlinerModel';
export * from './tools/toolIA';
export * from './components/ColorInput';
export * from './components/ContextMenu';
export * from './components/popupLayer';
export * from './components/AnchoredPopup';
export * from './components/NumberSlider';
export * from './components/IconToggle';
export * from './components/Toasts';
export * from './components/ViewButtons';
export * from './components/StatusBar';
export * from './components/PanelFrame';
export * from './components/Splitter';
export * from './components/TabStrip';
export * from './components/Tooltip';
export * from './components/VerticalToolbar';
export * from './components/ContextToolbar';
export * from './components/ContextActions';
export * from './components/ModeGuideCard';
export * from './components/SceneDialogs';
export * from './components/BatchRenameDialog';
export * from './panels/multiEditModel';
export * from './panels/batchRenameModel';
