# 11 · 功能地图（Feature Map）

> 从**用户功能**角度整理「功能 → 代码」映射。每项：入口 / 核心模块 / 数据 / Command / Runtime。证据均来自实际代码。

## 场景（新建/打开/保存/环境）

- **入口**：菜单「文件」（MenuBar → actionId 路由 `app/actions.ts:248-403`）。
- **核心模块**：`app/bootstrap.ts`（openScene :578 / saveScene :602 / createDefaultSceneData :132）、`io/SceneSerializer.ts`、`app/actions.ts`（文件读写/dirty 检测）。
- **数据**：SceneData v2；环境四预设（bootstrap `ENVIRONMENT_PRESETS` :117-123 ↔ Renderer 同名表 :126-175）。
- **Command**：无（场景级操作不入历史；openScene 后 history.clear）。
- **Runtime**：openScene 经 scene:changed{clear} → Renderer.resyncAll；setEnvironment → Renderer.applyEnvironment（整组重建）。

## 绘制（七形状三步流）

- **入口**：垂直条 1/2/3/4 + ⇧1-5 + 大纲「创建 ▾」+ 视口右键「创建 ▾」（toolIA.resolveDigitAction :437-446）。
- **核心模块**：`editor/tools/draw/`（DrawToolBase/DragShapeToolBase/DrawSession/七工具/snap.ts/DrawGridConfig）；辅助 = Shift 正交/A 45°/G 网格（applyAids :366-383）。
- **数据**：草稿 DrawSession（纯内存）→ RegionObject（semantic=unclassified, style=default_solid）。
- **Command**：CreateObjectCommand（面/线每次一条；点按段合并）→ 完成后 BatchCommand[ChangeSemantic+ChangePreset]（类型芯片一步赋型，`regionQuickApply.ts:104-121`）。
- **Runtime**：PreviewManager.updateDrawPreview（顶点/线/面/文字 sprite + 状态栏 draw:status）；完成 attach → RegionRenderer。
- **校验**：validateGeometry（顶点不足/自相交拦截，状态栏红字）；参数化形状天然合法。

## 区域类型（十类语义）

- **入口**：ContextToolbar 类型芯片 / Inspector 类型下拉（regionInspectorModel.ts:212 semanticTypeChange）。
- **核心模块**：`domain/regions/semanticDefinitions.ts`（十定义单一真相源）+ `registries/SemanticRegistry.ts`。
- **数据**：`RegionSemantic{type, properties}`；road.width / building.height 参数。
- **Command**：ChangeSemanticCommand（**三联动**：类型 + 图层迁移(按 defaultLayerName) + 样式重置）。
- **Runtime**：RegionRenderer 按 keys['semantic'] 分派（类型切换 swapStyle / 参数 updateStyle 透传）。

## 样式（24 预设 + 参数覆写 + 批量应用）

- **入口**：ContextToolbar 色样快选 / Inspector「表现样式」分组（StyleParametersForm.tsx）/ 批量作用域（同类型/图层/预设，multiEditModel）。
- **核心模块**：`runtime/styles/`（engine/materialPool/params/routes + 24 preset）、`registries/StylePresetRegistry.ts`。
- **数据**：`RegionStyle{presetId, overrides}`；参数定义 StylePresetMeta.defaultParams。
- **Command**：ChangePresetCommand（含 style:changed 事件）。
- **Runtime**：swapStyle（几何复用）或 updateStyle（参数热更/写时复制）。

## 资产（库/浏览/收藏）

- **入口**：底部 ContentBrowser（双态收展）。
- **核心模块**：`ui/panels/browserModel.ts`（分类/搜索/标签/收藏/排序纯函数）、`registries/AssetRegistry.ts`、`io/AssetManifest.ts`、`runtime/loaders/ThumbnailCache.ts`（SVG 占位 → IndexedDB 离屏快照）。
- **数据**：ModelAsset（manifest 13 条）；收藏 localStorage。
- **Command**：无（浏览态）。
- **Runtime**：缩略图 OffscreenSnapshotter 懒建。

## 放置

- **入口**：资产卡点击 / 拖放（mime `application/x-asset-id`，App.tsx:329 拖放落点 groundPoint）/ 数字键 4 重放最近资产。
- **核心模块**：`editor/tools/PlacementTool.ts`、`editor/factories/modelFactory.ts`。
- **数据**：ModelObject{asset:{assetId}}；transform y = 地面 + MODEL_BASE_HEIGHT(0.03)；R 旋转 π/4 步进 / 滚轮缩放 [0.2,5]。
- **Command**：CreateObjectCommand；连续放置会话批次（mergeBatch 默认 true，一条历史）。
- **Runtime**：PreviewManager Ghost（占位盒→异步克隆）；InstancedAssetPool。

## 选择（点选/多选/框选）

- **入口**：左键点选 / Shift·Ctrl 追加 / 空白拖拽框选（3px 阈值）。
- **核心模块**：`editor/tools/SelectTool.ts` + `scene/SelectionManager.ts`。
- **数据**：选中 ID 数组（不序列化）。
- **Command**：无（选中集不入历史，SelectTool.ts:15-16）。
- **Runtime**：RuntimeViewport.pickObject / pickInRect；选中高亮 Gizmo attach。

## 变换（Gizmo + 数值）

- **入口**：QWER / 垂直条 / Inspector 数值输入。
- **核心模块**：`editor/tools/TransformTool.ts`、`runtime/services/GizmoImpl.ts`（多选质心组枢轴）。
- **数据**：SceneObject.transform。
- **Command**：TransformCommand（N=1）/ BatchCommand（N>1，微任务聚合 flushGesture :117-131）。
- **Runtime**：拖拽中 applyGizmoPreview 直写（预览隔离）；提交后按权威数据收敛。

## 顶点编辑

- **入口**：双击面对象 / Inspector「编辑顶点」/ Esc 退出。
- **核心模块**：`editor/tools/VertexEditTool.ts`、`runtime/services/VertexEditImpl.ts`（琥珀球/八面体句柄）、`editor/tools/vertexSnapPipeline.ts`。
- **数据**：工作点列（会话态）→ 提交 RegionShape。
- **Command**：ChangeShapeCommand（shape-only 一条历史，材质/类型/样式不动）。
- **Runtime**：句柄层 AUX_LAYER + 拖拽预览 RegionRenderer.applyShapePreview（几何重绑材质不动）；Alt 点边中点插入 / 右键点按删除顶点（手势在 VertexEditImpl，:390/:334）。

## 吸附（五级 + 总开关）

- **入口**：「工具 → 吸附」分级设置 / ContextToolbar 吸附钮 / G（绘制会话）/ Ctrl 拖拽中反转。
- **核心模块**：`editor/services/objectSnapConfig.ts`（0.5m 容差）、`snapTiersConfig.ts`（总开关/角度 15°/高度）、`draw/snap.ts`（正交/45°/网格纯函数）、`runtime/services/GizmoImpl.ts:393-465`（消费端）+ `runtime/services/AlignGuides.ts`（参考线）。
- **数据**：三个共享可变配置对象（会话级，不入历史）。
- **Command**：无（配置态）；贴地 End → BatchCommand（dropSelectionToGround）。
- **Runtime**：高度层候选 domain `collectElevationSnapLevels`（region baseHeight/模型 posY 派生）；参考线 1px 琥珀 + 端点方块屏幕恒定。

## 对齐 / 阵列

- **入口**：多选 ≥2 ContextToolbar「对齐」八项 / 任意选中「阵列」popover。
- **核心模块**：`ui/tools/alignArrayModel.ts`（alignDeltas 八模式/planArrayCopies 深拷贝新 id）。
- **Command**：BatchCommand[N×TransformCommand]（对齐）/ BatchCommand[N×CreateObjectCommand]（阵列，副本入选中）。
- **Runtime**：悬停实时足迹预览 PreviewManager.showFootprints（footprintGhost Port）。

## 道路（分割/合并/条带几何）

- **入口**：单选道路「分割」→ 节点拾取；恰选两条相邻（≤0.5m）「合并」。
- **核心模块**：`editor/tools/RoadSplitTool.ts`（复用顶点句柄层）、`domain/regions/roadGeometry.ts`、`runtime/renderers/geometryBuilders.ts` centerlineRibbonGeometry。
- **数据**：shape.type='line' + semantic.properties.width（条带放样）。
- **Command**：SplitRoadCommand（副本 id 构造期生成）/ MergeRoadCommand（世界坐标邻接判定）。
- **Runtime**：宽度变化 rebuildGeometry（line 几何按 width 重建）。

## 图层（11 默认层 + 管理）

- **入口**：Outliner 图层区（行尾合并/删除/重命名 + 拖拽排序 + 透明度松手提交）。
- **核心模块**：`ui/panels/OutlinerPanel.tsx`、`scene/Layer.ts`。
- **数据**：Layer（objectIds 派生索引）。
- **Command**：UpdateLayerCommand（属性）/ MergeLayerCommand（合并，可撤销）/ 图层拖拽排序 BatchCommand。**例外**：新建/删除图层直调 SceneManager（不可撤销，P0 授权——见 09）。
- **Runtime**：layer:updated → applyLayerToMembers（可见性 ∧ / 透明度乘算；模型实例零缩放矩阵编码可见性）。

## 场景树（层级/分组/拖拽）

- **入口**：Outliner 层级树（分类视图并列切换）/ Ctrl+G / Ctrl+Shift+G / 右键菜单。
- **核心模块**：`ui/panels/hierarchyModel.ts`、`scene/hierarchy.ts`（森林原语）、`editor/commands/GroupCommand/UngroupCommand/ReparentCommand`、`editor/factories/groupFactory.ts`。
- **数据**：parentId 森林 + 数组序（同父兄弟序）；GroupObject 纯组织节点。
- **Command**：GroupCommand（组落首成员原位）/ UngroupCommand（成员上插）/ ReparentCommand（三态落点+环检测）。
- **Runtime**：group 不产 RuntimeObject（NON_RENDERABLE_TYPES，Renderer.ts:256）；双击组行选中全部成员。

## 工作模式（八模式）

- **入口**：ContextToolbar `Scene ▼` / Alt+1..6（+Alt+7 测量）/ 菜单「视图 → 工作模式」三路同源。
- **核心模块**：`ui/tools/toolIA.ts`（MODES 表 :503-612 / combineMode :481 / activateWorkMode :666）。
- **数据**：workspaceStore.mode（localStorage 持久化；analysis 禁用回落）。
- **Command**：无。**Runtime**：零改动（纯 UI 焦点态；垂直条分组置顶 + Inspector 引导卡 + HUD 徽标联动）。

## 布局（四预设 + 个人布局 + 纯三维）

- **入口**：顶栏「布局」/ Tab 纯三维。
- **核心模块**：`ui/layout/`（workspaceStore/layoutPresets/workspacePersistence）。
- **数据**：localStorage `t3d-editor.workspace`（300ms 防抖）/ `-layouts`（个人布局，导出 JSON 往返）。
- **Command/Runtime**：无（UI 会话态；minimapVisible 开关经 EditorHandle.setMinimapVisible → MinimapRenderer.setVisible）。

## 导入导出

- **入口**：菜单「文件 → 导入 JSON…」（批量多选）、「导出 JSON」（=保存同构）。
- **核心模块**：`io/JsonImporter.ts`（映射配置）+ `app/bootstrap.importElements`（归层+BatchCommand）。
- **数据**：ImportMapping（xy/xyz/ring 三格式、点分路径、floors*3 表达式）。
- **Command**：BatchCommand[N×CreateObjectCommand] 一条历史。
- **Runtime**：常规 attach 链路。

## 模板

- **入口**：菜单「文件 → 新建场景 ▾」（空场景/内置两套/个人模板）+「另存为模板…」。
- **核心模块**：`io/templates/`（内置 JSON + regenerateSceneIds 全量 id 重生成 + userTemplates localStorage ≤20）。
- **Command**：openScene 全量替换（不入历史）。

## 诊断（渲染模式六态 + islands 计数）

- **入口**：HUD `Shaded ▼` / 菜单「视图」/ 视口右键三路同源。
- **核心模块**：`runtime/RenderModeState.ts`（composeRenderPasses 分遍 + override 材质令牌）+ Renderer.renderModePasses。
- **数据**：environment.renderMode（诊断三档**会话级**，保存剥离）。
- **Command**：无。**Runtime**：wireframe/xray/clay/normals 三遍（环境/内容/辅助）；islands 四遍 + 对象换层 + 实例池分组（混合池双网格）+ HUD 实时计数（countUnclassified）。

## 测量（四类，会话态）

- **入口**：Alt+7 测量模式 + 垂直条测量分组（四子工具）/ 工具菜单。
- **核心模块**：`editor/tools/measure/MeasureTool.ts`（单类四实例）、`editor/services/measure/index.ts`（MeasureSession）、`runtime/services/MeasureOverlay.ts`（藤紫标签 sprite）。
- **数据**：MeasureItem[]（measure_ 前缀，**不入场景 JSON 不入历史**——阶段 10 契约）。
- **Command**：无（Delete 删上一条 / 清除全部走 session.removeLast/clear）。
- **Runtime**：surfacePoint 表面优先拾取；measure:status → 状态栏读数段（StatusBar.describeMeasureStatus）。

## 渲染（视口/机位/聚焦）

- **入口**：HUD `Perspective ▼` 四机位 / F 聚焦 / Home 全景 / 滚轮缩放 / 右键拖旋转 / 中键平移。
- **核心模块**：`runtime/services/CameraController.ts`（**顶/正/侧 = 固定方位角透视机位，非真正交切换**，头注 :6-7）、OrbitControls 手势重映射。
- **Command**：无。**Runtime**：minimap 拖拽导航 panTargetTo；聚焦 = 包围球 + 双 fov 距离推导 ×1.4。

## 未实现/占位功能（代码证实的「没有」）

- **面板 Docking/Floating**：T7.2 明确延后远期（CONTRACTS 增补）。
- **analysis 工作模式**：MODES 表 enabled=false 占位（toolIA.ts:65-73）。
- **测量持久化与测量点吸附**：排除项（远期池）。
- **LOD / 批量散布 / OBJ/FBX / DXF/GeoJSON / 停车车辆填充**：CONTRACTS「明确排除项」。
- **图层新建/删除的撤销**：不做（P0 授权例外）。
