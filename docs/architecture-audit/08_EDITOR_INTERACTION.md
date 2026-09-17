# 08 · 编辑器交互架构（Editor Interaction）

> 只分析技术结构。数据来源：`src/ui/`、`src/editor/tools/`、`src/app/input.ts` 实际代码。

## 交互设施总表

| 设施 | 实现 | 状态 |
|---|---|---|
| Selection（点选/多选） | `SelectTool.ts:68-102`（pickObject + Shift/Ctrl 切换式追加） | 已实现 |
| Multi Selection（框选） | `pickInRect`（RuntimeViewport :108 包围盒 8 角投影），3px 阈值起框 | 已实现 |
| Gizmo | `GizmoImpl.ts`（TransformControls 封装：translate/rotate/scale，多选质心组枢轴） | 已实现 |
| Drawing（七形状） | `draw/` 工具族 + DrawSession 草稿 + PreviewPort 可视化 | 已实现 |
| Vertex Editing | `VertexEditTool.ts` + `VertexEditImpl.ts`（句柄层：拖动/Alt 插入/右键删除，rAF 节流预览） | 已实现 |
| Snapping（五级） | 对象吸附/网格/对齐参考线/高度层/角度步进 + Ctrl 临时反转（GizmoImpl :393-465 + snapTiersConfig/objectSnapConfig/DrawGridConfig 共享配置对象） | 已实现 |
| Context Toolbar | `ContextToolbar.tsx` + `toolIA.contextToolsFor/contextActionsFor`（选中对象驱动中段矩阵） | 已实现 |
| Inspector | `InspectorPanel.tsx` + inspectorModel/regionInspectorModel 纯函数（region 四分组/model 引用只读/多选分节批量） | 已实现 |
| Outliner | `OutlinerPanel.tsx` + outlinerModel/hierarchyModel（层级树 + 分类视图并列；拖拽三形态） | 已实现 |
| Content Browser | `ContentBrowser.tsx` + browserModel（见 06） | 已实现 |
| Work Mode | 八模式（六启用+measure+analysis 禁用占位），toolIA.MODES 表 | 已实现（analysis 禁用） |
| Viewport HUD | `ViewportHUD.tsx` 四角（模式徽标/机位/渲染模式/齿轮选项/islands 计数） | 已实现 |
| Keyboard Shortcut | `app/input.ts:207-344` 路由 + toolIA 键表（QWER/1-4/⇧1-5/Alt+1-6/Tab/G/A/End/F/Home/Ctrl 系） | 已实现 |
| Context Menu | `ContextMenu.tsx` + `contextMenus.buildContextMenu` 四类目标（viewport-object/viewport-blank/outliner-row/asset-card），actionId 协议 | 已实现 |
| Layout | workspaceStore + 四预设 + 个人布局 + 纯三维模式（Tab） | 已实现（T7.2 面板 Docking 明确延后远期） |
| Measure | MeasureTool×4 + MeasureSession + MeasureOverlay（会话态，不入场景不入历史） | 已实现 |

## 核心问答

### UI 是直接修改 Scene，还是通过 Command？

**对象数据一律通过 Command**。审计证据（UI 层内 grep + 抽查）：
- `InspectorPanel.tsx:392-409` TransformCommand、:510 UpdateObjectCommand、:561 ChangeLayerCommand、:877/:909 ChangeSemanticCommand；
- `OutlinerPanel.tsx:227-228` BatchCommand（组级开关）、:642-643 ReparentCommand；
- `regionQuickApply.ts:104-121` BatchCommand[ChangeSemantic+ChangePreset]；
- `alignArrayModel.ts:171/301+` TransformCommand×N / CreateObjectCommand×N；
- `multiEditModel.ts:236-297` 六种 batch*Command 规划器。

**例外（图层新建/删除）**：`OutlinerPanel.tsx:1062-1077/1084-1087` 直接调 `facade.scene.addLayer/removeLayer`，绕过 Command 且不可撤销（注释自述「任务书授权，P0 不可撤销」）——见 09/12 文档。**不修改场景数据的 UI 状态**（选中集、工具激活、布局、模式）不走 Command——选中集按设计不经历史（`SelectTool.ts:15-16`）。

### 选择状态存在哪里？

`scene/SelectionManager`（**scene 层**，非 UI store）：ID 数组 + `selection:changed` 事件。UI store `selectedIds` 只是镜像（`store.ts:220`）。渲染侧 Gizmo 经组合根订阅 selection:changed 重挂（TransformTool :89 附近）。选中集**不序列化**。

### 工具状态存在哪里？

三层：
1. **活动工具 id**：`ToolManager.active`（editor 层）→ `tool:changed` → store.activeToolId 镜像；
2. **工具会话内部状态**（草稿点列/键累计旋转/Ghost 等）：各 Tool 实例私有字段（如 `DrawToolBase.ts:97-115`、`PlacementTool.ts:92`）——不进 zustand、不序列化，工具切换即丢（deactivate 清理）；
3. **UI 记账**（供重入与显示）：store.drawTarget/lastAreaShape/lastAssetId/placingAssetId/gizmoMode（`store.ts:123-146`）。

### 工作模式存在哪里？

`ui/layout/workspaceStore.mode`（zustand + localStorage 持久化，`workspaceStore.ts:119`）；派生模式（绘制/放置激活时的临时合成态）由 `toolIA.combineMode`（:481）实时计算不落盘；禁用模式不可恢复回落场景模式（README 口径 + MODES.enabled 校验）。**模式是 UI 会话态，不进 Scene、不影响工具可用性**（「工作域焦点」而非权限闸门，README:39 与 toolIA 实现——全部工具在任何模式可用）。

### 面板之间如何通信？

三种机制，无面板间直接 props 链（除 ContentBrowser assets/onPick 由 App 注入）：
1. **共享 store**（useEditorStore / useWorkspaceStore）——面板各自订阅切片；
2. **sceneVersion 重读**——任意 scene:changed 递增版本号，订阅了 sceneVersion 的面板（Inspector :157-166、Outliner :191-192、ContextToolbar :110-114）下次渲染重读 facade.scene；
3. **contextMenu/toast** 等全局 UI 态经 store。

### UI 与 runtime 如何通信？

**零直接依赖**（grep 证实 ui/ 无 runtime/io import）。四条间接通道：
1. **Port 注入**：组合根把 runtime 实现注入 store services（`camera: CameraPort` / `session: ViewportSessionServices` / `footprintGhost` / `measure: MeasureSessionPort`，`store.ts:34-59`）——类型以「最小结构子集」声明在 ui，避免 ui→app 导入（DAG）；
2. **EditorFacade 命令通道**（UI→数据→事件→渲染）；
3. **事件回流**：runtime 发 `app:notify`（Toast）/`draw:status`/`measure:status` → store；
4. **canvas 宿主**：`Viewport.tsx` 只提供 canvasRef，Renderer 由 app 挂载——UI 组件树内无任何 THREE 节点。

### 是否存在 Editor Store / Editor Context？

- `useEditorStore`（zustand，`ui/store.ts:167`）即编辑器全局 store——单例绑定（模块级 unsubscribe，同一时刻一个编辑器实例，:165 注释）。
- 无 React Context 体系（无 EditorProvider/context consumer）——全靠 zustand 全局 hook。

### 是否存在事件总线？

**是，且是全局唯一**：`core/events/EventBus`，类型化 EventMap 14 事件（`events.ts:57-82`）：`object:created/updated/removed`、`selection:changed`、`scene:changed`、`history:changed`、`layer:updated`、`tool:changed`、`style:changed`、`asset:registered`、`draw:status`、`app:notify`、`measure:status/changed`。同步派发、遍历快照（EventBus.ts:36-40）。**runtime 样式引擎例外地不依赖 EventBus**（通知通道经 setStyleNotifier 注入，保持 runtime 零事件耦合，engine.ts:25-28）。

注意：`style:changed` 由 ChangePresetCommand 发出（ChangePresetCommand.ts:47），`asset:registered` 在 io/AssetManifest 灌注时发出——两者订阅方主要是测试（渲染经 object:updated keys 驱动，不依赖 style:changed）。

## 输入路由（app/input.ts）

- **指针**：DOM pointerdown/move/up → PointerEventInfo → `tools.getActiveTool()?.onPointerXxx` 直转（不经 ToolManager，input.ts:152-170）；中/右键一律不转发（OrbitControls 语义）；dblclick/wheel 同路转 onDoubleClick/onWheel。
- **右键分类**：`classifyRightButton(dx,dy,dt)`（:95-99）——<4px 且 <500ms = tap（→ onContextMenuRequest 回调，App 命中判定后开菜单），否则 drag（旋转已归 OrbitControls）。
- **键盘**（:207-344，defaultPrevented/isEditableTarget 豁免优先）：Ctrl+Z/Y → Delete/Backspace（顶点编辑/测量工具优先转发）→ Ctrl+C/V/D/G(±Shift) → Esc(cancel) → Tab(纯三维) → F/Home/End → Q → Alt+1..6(模式) → 数字键（toolIA.resolveDigitAction：⇧1-5 子形状 / 1-4 垂直条 toggle）→ W/E/R（placement 工具内 R 归工具——TOOL_KEY_OWNERSHIP :109）→ 其余转发激活工具 onKeyDown。
- 手势分类器不是独立文件——`classifyRightButton` 为 input.ts 内导出纯函数（tests/app/gestureClassifier.test.ts 对应测试）。

## 工具 IA（toolIA.ts，~1100 行交互架构核心）

- **纯数据表**：`VERTICAL_TOOLS`（1 区域/2 路径/3 点/4 放置）、`AREA_SUBTOOLS`（⇧1-5）、`MEASURE_SUBTOOLS`（measure.<kind> 四类无数字键）、`MODES`（八模式：label/enabled/accent/verticalGroup/hudHint/inspectorGuide）、`SEMANTIC_MATRIX`（上下文动作矩阵注册表：building 楼层步进 / road 宽度步进+分割+合并）。
- **纯函数**：`resolveDigitAction` / `resolveAltDigitMode` / `deriveMode` / `combineMode` / `contextToolsFor`（中段互斥优先级 draw>vertexEdit>roadSplit>measure）/ `contextActionsFor`。
- **薄激活入口**（唯一带副作用）：`activateTransformTool` / `toggleRegionDraw` / `toggleShapeDraw` / `activateWorkMode` / `togglePure3d`——内部调 `tools.activate` + 写 store 记账；模式切换先 `tools.cancel()`（零历史）。

## 弹层体系（T9.1 治理后）

- 统一 portal 根 `#ed-popup-root`（`popupLayer.ts:24`，resolvePopupContainer 缺失回退 body）；`AnchoredPopup` createPortal 逃逸宿主层叠上下文（AnchoredPopup.tsx:105-118）+ 四策略定位（below-left/right、submenu-right、flyout-right）+ 8px 视口收边/翻边（computeAnchoredPopupRect :80-125）+ ResizeObserver 重测 + 统一外点关闭。
- ContextMenu：fixed 定位于 store.contextMenu(x,y)，派发 `(actionId, arg)` 归 App 路由。
- Toast：toastStore reducer（TTL 4.5s、上限 3 条）+ 250ms tick 轮询（Toasts.tsx:23-27）。
- z 刻度规范在 DESIGN 文档（T9.1），代码体现在 tokens/类名。

## 布局持久化

- `workspaceStore`：面板尺寸（钳制表 PANEL_SIZE_SPECS）/显隐/折叠/inspectorTab/browser 态/mode/minimapVisible；pure3d 不持久化（:130）。
- `layoutPresets.ts`：四预设 + `WorkspaceSnapshot = layout+mode+minimapVisible` 序列化（字段级回退、mode 过 MODES.enabled 校验）+ 命名布局 CRUD（`t3d-editor.workspace-layouts`）+ 导入导出 JSON。
- `workspacePersistence.ts`：localStorage `t3d-editor.workspace`，**300ms 防抖**写回，三路依赖注入可测。

## 值得记录的结构事实

1. **UI 层最大（14.9k 行 / src 41%）**，其中 toolIA.ts 单文件承担工具表+快捷键+模式+上下文矩阵四重职责（~1100 行）——扩展交互的人口集中在该文件。
2. 面板「模型层」（*Model.ts 纯函数）与组件分离良好（browserModel/inspectorModel/outlinerModel/multiEditModel/alignArrayModel/batchRenameModel/hudModel/contextMenus/menuModel）——**命令规划也在模型层**（如 multiEditModel.batch*Command 返回 Command 实例），组件只做提交。
3. 选中集/工具/模式三层状态分属 scene/editor/ui 三层——无单一「EditorState」聚合，新读者需跨层追（本表即索引）。
4. 上下文菜单/主菜单/HUD 三路 UI 共享同一 actionId 协议（`menus/menuModel.ts` + `contextMenus.ts` + actions.ts dispatch 路由 :248-403）——「三路同源」的代码基础。
