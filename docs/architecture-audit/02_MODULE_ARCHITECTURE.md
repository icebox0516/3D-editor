# 02 · 模块架构与边界（Module Architecture）

> 依据实际代码（import 关系 + 文件头职责声明 + 守护脚本）逐模块分析。分层规则由 `scripts/check-layer-deps.mjs:30-41` 的 `ALLOWED_DEPS` 表强制执行。

## 分层总则（代码事实）

```ts
// scripts/check-layer-deps.mjs:30-41
core:     []                                    // 不依赖任何层
scene:    ['core']
domain:   ['core', 'scene']
registries:['core', 'scene', 'domain']
editor:   ['core', 'scene', 'domain', 'registries']   // 与 runtime/io 互为兄弟，禁止互导
runtime:  ['core', 'scene', 'domain', 'registries']
io:       ['core', 'scene', 'domain', 'registries']
ui:       ['core', 'scene', 'domain', 'registries', 'editor']  // 禁止 runtime/io
app:      全部层                                  // src/app/** + src/main.tsx + src/App.tsx
```

- 同层互导默认允许；兄弟层（editor/runtime/io 之间）禁止互导——**依赖倒置经 Port 接口实现**：Port 声明在 `editor/services/ports.ts`，实现在 runtime，app 组合根注入（`Tool.ts:16-17` 注释、`bootstrap.ts:406-441`）。
- three 白名单：仅 `src/runtime/**`、`src/app/**`、`src/main.tsx`（脚本 :44-58）。

---

## 逐模块分析

### core（7 文件，479 行）

- **职责**：全层公共基础件——ID 生成、类型化事件总线、数学纯函数、基础类型与守卫、工具函数。
- **主要文件/核心导出**：`id/index.ts: createId(prefix)`（`${prefix}_${base36时间戳}${序号}${随机}`，:26-33）；`events/EventBus.ts`（同步派发、遍历快照 :36-40）+ `events/events.ts: EventMap`（14 事件，:57-82）；`types/index.ts: ID/Vec2/Vec3/Euler/Transform/MeasureKind` + 守卫（坐标约定：Vec2.y = 世界 z，:16-19）；`math/index.ts`、`utils/index.ts`（deepClone/clamp 等）。
- **被谁依赖**：全部八层。
- **依赖谁**：零（纯类型 + 纯函数，头注「core 不依赖任何层与任何外部包」）。
- **业务规则**：无（MeasureKind 枚举因 EventMap 需要而放此，`types/index.ts:22-26` 注释说明取舍）。
- **Three.js**：无。**循环依赖**：无。

### scene（8 文件，688 行）

- **职责**：场景唯一数据源的**纯数据层**——对象/图层/场景文件数据接口 + 增删改查容器 + 选中集 + parentId 层级派生纯函数。
- **主要文件**：`SceneObject.ts`（统一基座接口）、`GroupObject.ts`（组壳 + `isGroupObject` 守卫）、`Layer.ts`、`SceneData.ts`（v2 顶层结构 + `coerceSceneGrid/coerceRenderMode/coerceSceneAxes` 归一函数 + `DEFAULT_SCENE_GRID`）、`SceneManager.ts`（Map 容器，每次变更恰发一次 `scene:changed`，clear 只发一次 :78-90）、`SelectionManager.ts`、`hierarchy.ts`（森林构建/搬移原语，环防御）。
- **核心导出**：`SceneManager` / `SelectionManager` / 全部数据接口 / `hierarchy` 纯函数族。
- **被谁依赖**：domain(仅类型)/registries(仅类型)/editor/runtime/io/ui/app。**依赖谁**：仅 core。
- **职责越界**：无。SceneManager 严格「只增删改查——不校验、不计算、不发命令」（`SceneManager.ts:7-9`）；但注意 `SceneManager` 持有 `EventBus` 并广播事件（:30-31 构造注入）——事件广播是唯一「行为」，属设计内。
- **Three.js**：无（`scene/index.ts:9` 明注「零渲染，禁止 THREE」）。

### domain（21 文件，1,523 行）

- **职责**：业务领域模型——区域对象三层结构、七形状、十语义定义、几何换算纯函数、校验管线、模型资产数据、样式参数元数据。
- **主要文件**：
  - `regions/RegionObject.ts`：`RegionShape/RegionSemantic/RegionStyle` 三层接口 + `SHAPE_TYPES` 七枚举 + `isRegionObject` 守卫。
  - `regions/semanticDefinitions.ts`：`SEMANTIC_TYPES` 十枚举 + 十条内置定义（`defaultLayerName/defaultPresetId/defaultBaseHeight/properties`——语义→图层名/预设/层高的**单一真相源**，文件头 :14-35）。
  - `regions/createRegionObject.ts`：工厂（id=`createId('region')`，:76）。
  - `regions/`：`shapePoints`（参数化展开）、`shapeConvert`、`roadGeometry`（`roadBandHalfWidth`）、`footprint`、`elevationLevels`（`collectElevationSnapLevels/baseLevelOf`）、`vertexEdit`、`validateRegionShape`。
  - `assets/ModelObject.ts`（`MODEL_LAYER_NAME`/`MODEL_BASE_HEIGHT=0.03`/`isModelObject`）、`ModelAsset.ts`、`AssetReference.ts`。
  - `styles/StyleParameter.ts`：参数控件元数据形态（语义定义与样式预设共用）。
  - `geometry/GeometryData.ts`、`validate/validateGeometry.ts`。
- **被谁依赖**：registries/editor/runtime/io/ui/app。**依赖谁**：core + scene（类型）。
- **业务规则**：是——业务规则的主要归宿（默认值、层高、宽度语义、校验规则全在此）。
- **Three.js**：无。**越界**：无。

### registries（6 文件，306 行）

- **职责**：注册制扩展入口——五个纯数据注册表。
- **主要文件/导出**：`SemanticRegistry`（预载十条内置定义，`createSemanticRegistry` :59-65）、`StylePresetRegistry`（`StylePresetMeta` + `find(shape,semantic)` 双维过滤 :55-61；**永不含构建函数**——DAG 禁止 registries→runtime，头注 :12-13）、`AssetRegistry`（register/list/findByCategory/search :64-80）、`ToolRegistry`（最小结构 `{id,name}`）、`CommandRegistry`（type→工厂，`CommandFactory = (data:any)=>RegisteredCommand` :22）。
- **被谁依赖**：editor/runtime/io/ui/app。**依赖谁**：core/scene/domain。
- **注意**：CommandRegistry 与 ToolRegistry 只认「注册身份」最小结构（editor 层完整 Command/Tool 结构兼容之，`CommandRegistry.ts:6-11` 注释）。**无生产代码调用 `commands.create()`**——注册表挂 `facade.registries.commands`（`bootstrap.ts:527`）为扩展点，实际路径全部直接 `new`（见 09 文档）。

### editor（56 文件，5,350 行）

- **职责**：编辑器交互层——命令系统、历史、工具系统、Port 声明、门面接口、工厂。
- **主要文件**：
  - `commands/`：17 个命令文件（`Command.ts` 接口 + CommandBase、`CommandContext.ts`（仅 sceneManager/selection/eventBus 三成员）、15 具体命令 + index）。
  - `history/HistoryManager.ts`：双栈、`mergeBatch` 选项、无上限。
  - `EditorFacade.ts`：UI 唯一门面**接口**（实现在 app/bootstrap——editor 与 io 为兄弟层禁互导，头注 :8-10）。
  - `tools/`：`Tool.ts`（工具接口 + ToolContext）、`ToolManager.ts`（互斥激活 + `tool:changed` 广播；**指针事件不经它分发**——app/input 直转 `tools.getActiveTool()?.onPointerDown`，`input.ts:152-170`）、`SelectTool`、`TransformTool`、`PlacementTool`、`VertexEditTool`、`RoadSplitTool`、`measure/MeasureTool`、`draw/`（DrawToolBase + DragShapeToolBase + DrawSession + 七形状工具 + snap 纯函数 + DrawGridConfig）、`vertexSnapPipeline.ts`。
  - `services/`：`ports.ts`（ViewportPort/CameraPort/PreviewPort/GizmoPort/VertexEditSessionPort/RectPickPort/MeasurePort/FootprintGhostPort 等依赖倒置接口）、`PointerEventInfo.ts`、`objectSnapConfig.ts`、`snapTiersConfig.ts`、`measure/index.ts`（MeasureSession）。
  - `factories/`：`groupFactory.ts`（id `group_`）、`modelFactory.ts`（id `model_`）。
- **被谁依赖**：ui（接口）/app（实现装配）。**依赖谁**：core/scene/domain/registries。
- **Three.js**：**零**（CONTRACTS #5；渲染能力全经 Port）。
- **业务规则**：命令持有业务变更语义（如 ChangeSemanticCommand 的三联动：类型+图层+预设重置，`ChangeSemanticCommand.ts:73-88`）。
- **越界检查**：审计未发现 editor 直写 SceneManager 绕过 Command 的路径（grep 证实 addObject/removeObject/updateObject/reorderObjects 调用点全在 commands/ 下；唯一例外在 app 组合根，见 09）。

### runtime（65 文件，9,908 行）

- **职责**：Three.js 渲染层——业务数据 → WebGL 单向映射的全体实现。
- **主要文件**：
  - `Renderer.ts`（1,069 行渲染总管）、`RenderLoop.ts`（rAF 循环 + 异常兜底/连败 30 帧熔断）、`SceneSync.ts`（EventBus→attach/update/detach 翻译，纯逻辑可测）、`RuntimeObjectMap.ts`（id↔Object3D 双向映射，userData 仅存 objectId）、`ObjectAdapter.ts`（create/update/dispose 三段抽象）。
  - `renderers/`：`RegionRenderer.ts`（region→样式实例生命周期）、`RendererRegistry.ts`（type→adapter 分派，默认注册表仅 'region'，:44-49）、`geometryBuilders.ts`（多边形/条带几何构造）、`objectState.ts`、`layerState.ts`。
  - `styles/`：`engine.ts`（createStyle/updateStyle/disposeStyle 纯函数入口 + 实例簿记 WeakMap）、`materialPool.ts`（presetId→共享材质模板引用计数）、`params.ts`（参数解析/钳制）、`routes.ts`（import.meta.glob 双轨构建路由）、`types.ts`（StyleInstance 契约 + 插件授权规则）、24 个 `*.preset.ts`。
  - `loaders/`：`AssetLoader.ts`（GLTFLoader，无 DRACO；模板缓存 + clone(true) 实例化 + 多 Mesh merge 单几何）、`ThumbnailCache.ts`（内存→IndexedDB→离屏快照三级）。
  - `instancing/InstancedAssetPool.ts`（每 assetId 一池，1=普通 Mesh / ≥2=InstancedMesh，矩阵槽增量写）。
  - `services/`：`RuntimeViewport.ts`（拾取/地面投影/框选）、`CameraController.ts`、`GizmoImpl.ts`（TransformControls 封装 + 吸附 + 多选组枢轴）、`PreviewManager.ts`（Ghost/绘制预览/足迹幽灵）、`AlignGuides.ts`、`MeasureOverlay.ts`、`VertexEditImpl.ts`。
  - `spatial/SpatialIndex.ts`：**纯接口占位 + LinearSpatialIndex O(n) 实现，当前无消费方**（头注 :10 自述）——预留扩展点，非现存能力。
  - `MinimapRenderer.ts` + `minimap/`、`AxesIndicator.ts`、`RenderModeState.ts`（六模式分遍 + override 材质）、`ViewportResizePolicy.ts`、`ContextLossWatchdog.ts`、`renderLoopStats.ts`、`geometry/GeometryBuilder.ts`（RegionShape+semantic→BufferGeometry 分派）。
- **被谁依赖**：仅 app（+ tests/runtime）。**依赖谁**：core/scene/domain/registries。
- **只读纪律**：Renderer 头注「只读 Scene 数据（SceneManager 仅 getObject/getObjects/getLayer），反向修改一律禁止」（`Renderer.ts:29-30`）；各 Adapter 同（`ObjectAdapter.ts:10-11`）。Gizmo 拖拽中间态直写渲染对象属「预览隔离」——结束时经回调走 Command 提交（`Renderer.ts:410-412` 注释）。
- **runtime 零事件耦合的例外**：样式引擎不依赖 EventBus（通知通道经 `setStyleNotifier` 注入，`engine.ts:31-35`）。

### io（7 文件，1,063 行）

- **职责**：场景数据 ⇄ 外部格式互转——序列化/导出/JSON 导入/资产清单校验/模板。
- **主要文件**：`SceneSerializer.ts`（v2 版本门 + 对象类型 fail-fast 校验 + 结构级 region 校验）、`SceneExporter.ts`（**薄壳**：`export` 直接委托 serialize，:15-17，无任何额外处理）、`JsonImporter.ts`（映射配置化导入：点分路径/xy·xyz·ring 三格式/floors*3 表达式/自动修复）、`AssetManifest.ts`（manifest 校验 + 幂等灌注注册表）、`templates/`（empty-campus/sample-campus 内置 + `regenerateSceneIds` 全量 id 重生成 :66-95 + userTemplates localStorage）。
- **依赖谁**：core/scene/domain。**被谁依赖**：仅 app。**Three.js**：无。

### ui（49 文件，14,898 行）—— 最大的层

- **职责**：React 组件 + zustand 状态桥 + 纯函数 UI 模型 + 设计系统。
- **结构**（面板数据源三类模式）：
  - `store.ts`：`useEditorStore`——EventBus→React 桥（订阅 7 事件），不缓存场景对象本体。
  - `panels/`：InspectorPanel/OutlinerPanel/ContentBrowser 组件 + 同名 `*Model.ts` 纯函数模型（sectionsFor/buildOutlinerTree/filterAssets…）。
  - `tools/toolIA.ts`（~1100 行交互架构核心）：工具表/快捷键映射/八工作模式表/上下文动作矩阵/激活入口。
  - `components/`：ContextToolbar/StatusBar/弹层体系（popupLayer/AnchoredPopup/ContextMenu/Toasts）等。
  - `menus/`、`hud/`、`layout/`（workspaceStore + 四预设 + 持久化）、`feedback/`、`styles/`。
- **依赖谁**：core/scene/domain/registries/editor——**grep 证实全 ui/ 零 runtime/io 导入**（ui/index.ts:21-63 统一再导出）。
- **UI→渲染通信**：不直接——经组合根注入 store 的结构化 Port（`camera/session/footprintGhost/measure`，`store.ts:34-59`「最小结构子集」注释）；canvas 由 app 持有（`Viewport.tsx:19-23`）。
- **UI→数据修改**：对象数据一律 `facade.history.execute(new XxxCommand(...))`（证据例：`InspectorPanel.tsx:392-409` TransformCommand、:510 UpdateObjectCommand；`OutlinerPanel.tsx:227-228` BatchCommand；`regionQuickApply.ts:104-121` BatchCommand）。**例外**：图层新建/删除直调 `facade.scene.addLayer/removeLayer`（`OutlinerPanel.tsx:1062-1087`，绕过 Command 不可撤销，注释自述任务书授权——详见 09/12）。

### app（6 文件，2,086 行）

- **职责**：组合根——装配一切 + 输入接线 + actionId 路由。
- **主要文件**：`bootstrap.ts`（`createEditor` :343-634 全部装配 + EditorHandle 超集门面 + 默认场景 + 命令工厂注册 :637-688）、`input.ts`（DOM 指针/键盘 → PointerEventInfo/工具转发 + 快捷键路由 :207-344 + `classifyRightButton` :95-99）、`actions.ts`（统一 actionId 路由 + 文件 IO + dirty 检测）、`editorActionsCore.ts`（剪贴板/删除/贴地/分组共享核心）、`sceneDialogs.tsx`、`index.ts`。
- **可导入一切**（DAG 顶端）；three 经 runtime 间接使用（头注 :25）。

### assets / scripts / tests / docs

- `assets/`：纯静态资源（13 GLB + manifest + 13 SVG + mappings 示例）。manifest 由 `scripts/scan-assets.mjs` 生成（manifest.json `generator` 字段自述）；`generate-assets.mjs` 程序生成占位 GLB。
- `scripts/check-layer-deps.mjs`：唯一架构守护——正则解析 import，无 AST（:78-81 自述），对 `export ... from` / 动态 import / require 均覆盖。
- `tests/`：148 文件镜像 src 结构；tests 不受 DAG 限制但受 three 白名单限制（仅 runtime 路径段可用 three，脚本 :56-58）。
- `docs/plan/`：过程文档（契约/任务书/状态），非运行代码。

---

## 「数据层 / 业务层 / 编辑器层 / 渲染层 / UI 层」实际分离方式

| 概念层 | 对应目录 | 分离手段 | 强制机制 |
|---|---|---|---|
| 数据层 | `scene`（+core 类型） | 纯数据接口 + 增删改查容器 + 事件广播 | check:layers + 零 THREE |
| 业务层 | `domain`（+registries 注册表） | 纯数据/纯函数 + 注册制单一真相源 | check:layers + 零 THREE |
| 编辑器层 | `editor` | Command/History + Tool + **Port 依赖倒置**（渲染能力接口声明在 editor、实现在 runtime） | check:layers + 零 THREE |
| 渲染层 | `runtime` | ObjectAdapter/RegionRenderer/样式引擎/实例池；事件驱动单向映射 | three 白名单 + 只读纪律（注释与设计约束，非运行时强制） |
| UI 层 | `ui` | zustand 事件桥 + 纯函数模型 + 结构化 Port | check:layers 禁 runtime/io |
| 装配 | `app` | 组合根唯一 new 一切的地方 | 可导入一切 |

关键点：**「渲染层只读 Scene」是设计纪律而非运行时强制**——代码靠注释约定 + review + 测试维持；runtime 拿到的 SceneManager 引用类型上可调用写方法（如 `updateObject`），但没有调用点（审计 grep 证实 runtime 内对 SceneManager 仅 getObject/getObjects/getLayer/getLayers 调用）。

## 实际依赖关系（ASCII）

```
                    ┌──────────────────────── app（组合根 src/app + main.tsx + App.tsx）──────────────────────┐
                    │  装配一切；唯一允许 import 全部层 + three；EditorHandle 超集门面                        │
                    └──────┬───────────────┬────────────────┬───────────────┬───────────────┬───────────────┘
                           │               │                │               │               │
        ┌──────────────────▼──┐  ┌─────────▼────────┐  ┌────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐
        │ ui（React+zustand） │  │ runtime（THREE） │  │   io     │  │   editor    │  │ registries│
        │ 订阅 EventBus；     │  │ Renderer/样式引擎 │  │ 序列化/  │  │ 命令/历史/  │  │ 五注册表  │
        │ 经 facade.history   │  │ /实例池/服务      │  │ 导入/    │  │ 工具/Port   │  │ (纯数据)  │
        │ 执行命令；Port 调用  │  │                  │  │ 模板     │  │ (Port 声明) │  │           │
        └──┬───────┬───────┬──┘  └────┬──────┬──────┘  └──┬──┬────┘  └──┬────┬────┘  └─┬────┬────┘
           │       │       │(仅editor)│      │            │  │          │     │          │     │
           │       │       └─────────┼──────┼────────────┼──┼──────────┘     │          │     │
           │       │                 │      │            │  └────────────────┼──────────┼─────┘
           │       └─────────────────┼──────┼────────────┼───────────────────┘          │
           └─────────────────────────┼──────┼────────────┴────────────────────────────────┘
                                     ▼      ▼
                              ┌─────────────────┐        ┌──────────┐
                              │ domain（业务模型）│ ─────► │ scene    │ ─────► core
                              │ regions/assets/  │ (类型) │ 数据源   │  (类型)  id/events/
                              │ styles/validate  │        │ +选择集  │         math/types/utils
                              └─────────────────┘        └──────────┘         （零依赖）

  运行期数据流（非 import，经 EventBus 与 Port）：
    UI/工具 ──Command──► SceneManager ──object:*/scene:changed──► SceneSync ──► Renderer ──► WebGL
    工具 ◄──Port(声明于 editor，实现在 runtime)──► RuntimeViewport/Camera/Gizmo/Preview/Measure
    runtime ──app:notify/draw:status──► ui store ──► React
```

兄弟层互导（editor↔runtime↔io）：**不存在**（脚本强制）；它们只在 app 汇合。

## 循环依赖检查

- 层间：无（DAG 脚本强制，`npm run check:layers` 收官基线绿）。
- 层内：`Command ↔ HistoryManager` 潜在环被显式规避——CommandContext 不含 history（`CommandContext.ts:6-8` 注释「避免命令与历史管理器循环依赖」）；`Tool ↔ ToolManager` 同法——工具不持 ToolManager，经 `setExitToSelect` 钩子由组合根注入（`bootstrap.ts:463-473`）。
- `runtime/styles/routes ↔ registries`：类型单向（runtime import registries 类型），无环。

## 职责越界与可疑点（事实记录，非评价）

1. `scene/SceneData.ts` 含行为函数（coerce 系列归一 + 常量）——契约上「纯数据接口」文件携带纯函数，属设计内（scene 只依赖 core），但说明 scene 层并非只有数据声明。
2. `registries/CommandRegistry` 的 `CommandFactory = (data: any) => ...`（`CommandRegistry.ts:22`）——any 契约；且注册后无生产消费（见 09）。
3. `runtime/spatial/SpatialIndex.ts` 为无消费方占位（头注自述）。
4. `io/SceneExporter.ts` 是 15 行薄壳，与 SceneSerializer.serialize 完全同构（:15-17）。
5. UI 层体量（14.9k 行，占 src 41%）显著大于其他层——`toolIA.ts` 单文件承载工具表/快捷键/模式/上下文矩阵多重职责（结构性事实，影响见 12 文档）。
