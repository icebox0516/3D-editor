# 01 · 项目全貌（Project Overview）

> 本文基于 2026-09-15 对仓库实际代码的完整审计（src 218 文件 / assets / scripts / tests / 配置全部扫描，核心文件逐行精读）。所有结论均给出代码出处；与文档描述不一致处单列。

## 1. 项目名称 / 定位

- package.json `name: "3d-editor"`（`package.json:2`），`private: true`，版本 `0.0.0`。
- README 定位：「三维园区可视化编辑器」——组件化、可拓展的三维园区编辑器（`README.md:1-3`）。
- 实际代码印证：一个运行于浏览器的**园区级三维场景编辑器**——绘制面/线/点区域、放置 GLB 模型资产、样式引擎渲染、撤销重做、场景 JSON 存取。

## 2. 技术栈

| 依赖 | 版本 | 出处 |
|---|---|---|
| react / react-dom | ^19.2.8 | `package.json:15,16` |
| three | ^0.186.0 | `package.json:17` |
| zustand | ^5.0.15 | `package.json:18` |
| lucide-react（图标） | ^1.44.0 | `package.json:14` |
| vite / @vitejs/plugin-react | ^8.2.2 / ^6.1.1 | `package.json:20,22` |
| typescript | ^7.0.2 | `package.json:21` |
| vitest / @testing-library/react | ^5.0.0 / ^16.3.3 | `package.json:19,23` |

- 无其他运行时依赖；无 UI 组件库（全部自绘组件 + `src/ui/styles/` 设计系统）。
- TypeScript `strict: true` + `noUnusedLocals/Parameters` + `verbatimModuleSyntax`（`tsconfig.json:12-20`）。

## 3. 构建方式

- Vite 8（`vite.config.ts`）：`@vitejs/plugin-react` + 自定义 `copyStaticAssets` 插件——生产构建把 `assets/`（manifest/models/thumbnails/mappings）整体拷入 `dist/assets/`，否则 `vite preview` 下 `fetch('assets/manifest.json')` 命中 SPA fallback 返回 HTML 导致清单解析失败（`vite.config.ts:5-17` 注释）。
- 测试独立配置 `vitest.config.ts`（优先于 vite.config.ts），include `tests/**/*.test.{ts,tsx,mjs}` 与 `src/**/*.test.*`。
- 脚本（`package.json:6-13`）：`dev` / `build` / `preview` / `test`（vitest run）/ `test:watch` / `typecheck`（tsc --noEmit）/ `check:layers`（分层 DAG 守护脚本）/ `assets:generate` / `assets:scan`。

## 4. Three.js 版本

- `three@^0.186.0`（`package.json:17`）；类型 `@types/three@^0.185.4`。
- 代码中针对 r186 的适配证据：`Renderer.ts:340-341` 注释「r186 已移除 PCFSoftShadowMap……显式用实际生效的 PCF」。
- 附加导入：`three/examples/jsm/controls/OrbitControls.js`（`Renderer.ts:51`）、`three/examples/jsm/utils/BufferGeometryUtils.js`（AssetLoader merge，见子代理报告）。

## 5. Renderer 类型

- `THREE.WebGLRenderer`（`src/runtime/Renderer.ts:336`：`new THREE.WebGLRenderer({ canvas, antialias: true })`）。
- **页面上同时存在三个 WebGLRenderer**（三上下文拓扑）：
  1. 主视口（`Renderer.ts:336`）；
  2. 右下角导航小地图（`src/runtime/MinimapRenderer.ts`，独立 canvas + 独立小 renderer + 正交俯视相机）；
  3. 左下角坐标轴指示器（`src/runtime/AxesIndicator.ts`，88×88 独立 canvas + WebGLRenderer）。
- 另有第四个**按需懒建**的离屏 renderer：缩略图快照 `OffscreenSnapshotter`（`src/runtime/loaders/ThumbnailCache.ts:209`，128×96 独立小 WebGLRenderer，首点资产卡时懒建）。

## 6. WebGL / WebGPU

- **纯 WebGL**。全仓 grep 无 `WebGPURenderer` / `TSL` / `wgsl` / compute 任何命中（grep 证据见审计过程；`Renderer.ts:336` 为唯一主渲染器构造点）。
- 上下文健壮性：`ContextLossWatchdog` 监听 `webglcontextlost/restored`（`Renderer.ts:468-475`）；`Renderer.dispose` 明确**不调用** `forceContextLoss`（React StrictMode 双挂载共享上下文的历史冻结 bug，`Renderer.ts:773-777` 注释）。

## 7. TSL / WGSL / Shader

- 无 TSL、无 WGSL、无 compute。
- **GLSL 自定义 shader 实际存在**（均为 WebGL1 风格 GLSL 字符串）：
  - `src/runtime/styles/base/shader_test.preset.ts:33-60`：`THREE.ShaderMaterial`，uniforms 含 `uTime` 动画钩子（渲染循环驱动），世界坐标波纹——样式引擎「任意 ShaderMaterial 可挂载」的验证件。
  - `src/runtime/styles/base/grid.preset.ts:32`：静态 ShaderMaterial 世界 XZ 网格线。
  - `src/runtime/styles/poi/beam.preset.ts:43`：ShaderMaterial 光柱。
  - `src/runtime/RenderModeState.ts:181`：诊断「法线」模式自写微型 ShaderMaterial（世界空间法线 RGB 编码，含 `USE_INSTANCING` 分支）。
  - `src/runtime/Renderer.ts:201-219`：`onBeforeCompile` 向网格线材质注入「按相机距离衰减 alpha」。
- 程序化纹理：`CanvasTexture` 用于天空渐变（`Renderer.ts:1063`）、轴标签（`AxesIndicator.ts:226`）、测量标签（`MeasureOverlay.ts:203`）、绘制文字 sprite（`PreviewManager.ts:377`）；`DataTexture` 仅见 poi.billboard 无 DOM 兜底。

## 8. 状态管理方式

三层各司其职（全部为代码事实）：

1. **业务数据**：`SceneManager`（`src/scene/SceneManager.ts:21`，`Map<ID,SceneObject>` + `Map<ID,Layer>`）为唯一数据源；`SelectionManager`（`src/scene/SelectionManager.ts:13`）管选中 ID 集。
2. **事件层**：类型化 `EventBus`（`src/core/events/EventBus.ts` + `EventMap` 于 `src/core/events/events.ts:57-82`，共 14 个事件）——所有跨层通知的唯一通道。
3. **UI 状态**：zustand `useEditorStore`（`src/ui/store.ts:167`）——**不缓存场景对象本体**，仅镜像事件（selectedIds/sceneVersion/activeToolId 等），组件按 `sceneVersion` 重读 facade（`store.ts:104-106` 注释）；另有 `workspaceStore`（布局/模式持久化，`src/ui/layout/workspaceStore.ts`）与 `toastStore`（`src/ui/feedback/toastStore.ts`）。

工具状态在 `ToolManager` + 各 Tool 实例字段内（如 `DrawToolBase.ts:97-115` 草稿 session）；测量会话在 `MeasureSession`（`src/editor/services/measure/index.ts:45`）。

## 9. 数据持久化方式

| 数据 | 方式 | 出处 |
|---|---|---|
| 场景文件 | JSON 下载/打开（文件系统），版本固定 `"2.0"` | `bootstrap.ts:602-618`、`actions.ts`（defaultDownloadJson/defaultPickFile） |
| 用户场景模板 | localStorage `t3d-editor.templates`（≤20 套） | `src/io/templates/userTemplates.ts:24-30` |
| 工作区布局+模式 | localStorage `t3d-editor.workspace`（300ms 防抖） | `src/ui/layout/workspacePersistence.ts:27,86-134`；key 定义 `layoutPresets.ts:93` |
| 个人布局 | localStorage `t3d-editor.workspace-layouts` | `layoutPresets.ts:96` |
| 资产收藏 | localStorage `t3d-editor.asset-favorites` | `src/ui/panels/browserModel.ts:21` |
| 资产缩略图缓存 | IndexedDB `t3d-editor`/`thumbnails` | `ThumbnailCache.ts:129-136` |
| 资产清单 | 运行时 fetch `assets/manifest.json` | `bootstrap.ts:204-215` |

## 10. 测试体系

- vitest 5，**148 个测试文件 / 33,624 行**（tests/ 目录统计）；直接 `it/test` 调用约 1908 处 + each 展开，README/STATUS 声称基线 **1989 用例全绿**（`README.md:163`）。
- 分层覆盖与 src 一一对应：`tests/core|scene|domain|editor|runtime|io|ui|app/`（148 文件清单见 tests 目录）。runtime 层测试允许 three（`scripts/check-layer-deps.mjs:56-58`），Renderer 本体（含 WebGL 初始化）不做 node 单测、由逻辑拆分层（SceneSync/适配器/RenderLoop）覆盖 + GUI 验收兜底（`Renderer.ts:30-31` 注释）。
- 守护脚本：`npm run check:layers`——分层 DAG + three 导入白名单正则检查（`scripts/check-layer-deps.mjs`），违规 exit 1。

## 11. 项目入口

- HTML：`index.html:11` → `/src/main.tsx`。
- React 入口：`src/main.tsx:8-12`——`createRoot(...).render(<StrictMode><App/></StrictMode>)`，先装 `tokens.css` → `app.css`。
- 组合根：`src/App.tsx` `useEffect` 内调 `createEditor(canvas, opts)`（`src/app/bootstrap.ts:343`）完成全部装配。

## 12. 运行入口

`npm run dev`（Vite dev server，5173 被占落 5174，`README.md:152`）。启动链（代码事实）：

```
main.tsx → App.tsx useEffect
  → app/bootstrap.createEditor(canvas)
     EventBus → SceneManager/SelectionManager → 四注册表(assets/tools/commands/presets)
     → HistoryManager → EditorActionsCore → 共享吸附配置
     → Renderer(canvas, deps)（内部：SceneSync 订阅、InstancedAssetPool、RuntimeViewport、
       CameraController、PreviewManager、GizmoImpl、VertexEditImpl、MeasureOverlay、
       MinimapRenderer、AxesIndicator、RenderLoop）
     → ports 注入 → MeasureSession → ToolManager + 16 工具注册
     → ResizeObserver + renderer.renderLoop() + InputController
     → 默认 11 图层 → 返回 EditorHandle 门面
  → ui/store.attach(facade, eventBus, services)
  → app/actions.createEditorActions（菜单/actionId 路由）
  → loadManifest('assets/manifest.json') → registerAssets
```
（`bootstrap.ts:343-634`；App.tsx 装配与卸载依序 dispose。）

## 13. 核心目录树（src 实际结构）

```
src/
├── main.tsx / App.tsx          # React 入口 + App 装配（App 属 app 层白名单）
├── core/          (7 文件,   479 行)  id / events(EventBus+14 事件 EventMap) / math / types / utils
├── scene/         (8 文件,   688 行)  SceneObject/GroupObject/Layer/SceneData/SceneManager/
│                                          SelectionManager/hierarchy(纯函数)
├── domain/       (21 文件, 1,523 行)  regions(RegionObject/七形状/十语义/校验/道路几何/顶点编辑)/
│                                          styles(StyleParameter)/assets(ModelObject/ModelAsset/
│                                          AssetReference)/geometry/validate
├── registries/    (6 文件,   306 行)  SemanticRegistry/StylePresetRegistry/AssetRegistry/
│                                          ToolRegistry/CommandRegistry
├── editor/       (56 文件, 5,350 行)  commands(17 命令)/history/EditorFacade/tools(select/transform/
│                                          placement/vertexEdit/roadSplit/measure×4/draw×7/
│                                          ToolManager)/services(Port+吸附配置+测量会话)/
│                                          factories(group/model)
├── runtime/      (65 文件, 9,908 行)  Renderer/RenderLoop/SceneSync/RuntimeObjectMap/ObjectAdapter/
│                                          renderers(RegionRenderer/RendererRegistry/geometryBuilders)/
│                                          styles(引擎+24 预设插件)/loaders(AssetLoader/
│                                          ThumbnailCache)/instancing(InstancedAssetPool)/
│                                          services(RuntimeViewport/CameraController/GizmoImpl/
│                                          PreviewManager/AlignGuides/MeasureOverlay/VertexEditImpl)/
│                                          spatial(SpatialIndex 占位)/minimap/AxesIndicator/
│                                          MinimapRenderer/RenderModeState/RenderLoop 健壮性件
├── io/            (7 文件, 1,063 行)  SceneSerializer/SceneExporter/JsonImporter/AssetManifest/
│                                          templates(内置 2 + 用户模板)
├── ui/           (49 文件,14,898 行)  store(zustand)/Viewport/panels(Inspector/Outliner/ContentBrowser/
│                                          模型层)/tools(toolIA 交互架构/quickApply/alignArray)/
│                                          components(ContextToolbar/StatusBar/弹层体系…)/menus/
│                                          hud/layout(布局持久化)/feedback(toast)/styles(设计系统
│                                          tokens.css+app.css 共 4,067 行)
└── app/           (6 文件, 2,086 行)  bootstrap(组合根)/input(指针+快捷键)/actions(actionId 路由)/
                                          editorActionsCore(剪贴板/删除/贴地/分组)/sceneDialogs
```

其他目录：

- `assets/`：13 个 GLB（8 分类）+ manifest.json + 13 SVG 缩略图 + `mappings/building.example.json`（导入映射示例）。
- `scripts/`：`check-layer-deps.mjs`（分层守护）、`generate-assets.mjs`（程序生成占位 GLB）、`scan-assets.mjs`（扫描 models/ 重生成 manifest）。
- `docs/plan/`：CONTRACTS.md（契约唯一权威）、STATUS.md、PROTOCOL.md、contracts/（分域契约）、archive/（61 份一期任务书冻结）、screenshots/。
- `tests/`：148 文件，结构与 src 镜像。

## 14. 当前代码规模

| 范围 | 文件数 | 行数 |
|---|---|---|
| src 合计 | 218 | ≈36,300 |
| — 其中 ui | 49 | 14,898 |
| — 其中 runtime | 65 | 9,908 |
| — 其中 editor | 56 | 5,350 |
| — 其中 app | 6 | 2,086 |
| — 其中 io/domain/scene/registries/core | 49 | 4,059 |
| tests | 148 | 33,624 |
| UI 样式（tokens+app.css） | 2 | 4,067 |

（行数含大量中文文档注释——本项目注释密度极高，几乎每个文件头都有职责/边界/决策留痕说明。）

## 15. 当前主要功能模块（代码证实）

1. **形状驱动绘制**：七形状工具（polygon/rectangle/circle/ellipse/freehand/line/point）产出三层解耦 RegionObject（`SHAPE_TYPES`，`src/domain/regions/RegionObject.ts:10-17`）。
2. **语义系统**：十类语义注册制（`semanticDefinitions.ts:20-30`），类型↔默认图层/默认预设/贴地层高单一真相源。
3. **样式引擎**：24 套预设插件（`src/runtime/styles/*/*.preset.ts` 共 24 文件；README「21 套」指 T6.3 新交付数，测试 `matrix.test.ts:23` 明确「24 套 = 21 新 + 3 既有」）、双轨注册（meta 进 registries、build 留 runtime 路由）、材质模板池 + 写时复制。
4. **资产与放置**：manifest 驱动 GLB 资产库、Ghost 预览、连续放置会话批次、同资产 ≥2 实例 InstancedMesh 合批（`InstancedAssetPool.ts`）。
5. **编辑交互**：选择/框选、Gizmo 变换（含多选组枢轴）、顶点编辑、高级吸附（对象/网格/参考线/高度层/角度步进/Ctrl 反转）、对齐/阵列、道路分割/合并、批量编辑/批量重命名。
6. **工作模式体系**：八模式（六启用 + measure Alt+7 阶段 10 转正 + analysis 禁用占位，`toolIA.ts:65-73`）、四布局预设 + 个人布局 + 纯三维模式。
7. **图层系统**：11 默认图层、可见/锁定/透明度/排序/合并（`MergeLayerCommand.ts`）。
8. **场景 IO**：v2 JSON 存取、内置/用户模板（id 全量重生成）、映射化 JSON 批量导入。
9. **诊断渲染**：六渲染模式（shaded/wireframe/xray/clay/normals/islands，分遍 + overrideMaterial，`RenderModeState.ts:86-97`）。
10. **测量**：四类会话态测量（距离/高度/面积/角度，不入场景不入历史，`MeasureTool.ts` + `MeasureSession`）。
11. **导航**：OrbitControls（UE 式手势重映射）、四机位、小地图、坐标轴指示器。

## 16. 当前最重要的架构约束

均由 `docs/plan/CONTRACTS.md` 声明且由代码/脚本实际强制：

1. **分层单向 DAG**：`core → scene → domain → registries → (editor|runtime|io) → ui → app`；`scripts/check-layer-deps.mjs:30-41` 以 ALLOWED_DEPS 表正则扫描强制，违规 exit 1。
2. **three 白名单**：`three` 仅允许出现在 `src/runtime/**`、`src/app/**`、`src/main.tsx`（同脚本 :44-58）。
3. **Scene 唯一数据源**：`Renderer.ts:29-30` 头注「只读 Scene 数据，反向修改一律禁止」；`userData` 只存 `objectId`（`RuntimeObjectMap.ts:7-9`）。
4. **一切可见修改经 Command**：`Command.ts:5-7`；工具不得直接写 SceneManager（`Tool.ts:12-14`）。审计确认唯一绕过点在组合根 openScene/默认装配路径（属场景全量替换语义，见 09 文档）。
5. **注册制扩展**：禁止散落 `if (type === '…')`（CONTRACTS #6）；语义/预设/资产/工具/命令/对象渲染器六处注册表。
6. **渲染循环为每帧连续渲染**（有意决策，`RenderLoop.ts` rAF 循环；AGENTS.md 明令勿改按需渲染）。

## 当前系统一句话架构

一个以 `SceneManager` 为唯一数据源、经类型化 EventBus 事件驱动 `Renderer` 单向映射到三个 WebGL 上下文、一切可见修改走 Command/History 可撤销、由九层单向依赖 DAG（check:layers 脚本强制）与六个注册表组织扩展点的浏览器端三维园区编辑器，样式经「双轨注册的插件化预设引擎」渲染、模型经 InstancedAssetPool 实例化合批。

---

## 附：文档 vs 代码一致性记录（本节范围仅项目级）

| 项 | 文档描述 | 实际代码 | 差异 |
|---|---|---|---|
| 预设数量 | README「21 套插件化预设」（`README.md:10`） | 24 个 `*.preset.ts` 文件 | 无实质矛盾：测试 `matrix.test.ts:23` 明确「24 套 = 21 新 + 3 既有（default_solid/default_wireframe/test.shader）」；README 表述为交付口径 |
| 分层依赖 | CONTRACTS #1 九层 DAG | `check-layer-deps.mjs` ALLOWED_DEPS 与 CONTRACTS 逐条一致，src 实际导入未见违规 | 一致 |
| 测试数 | README「1989 用例」（`README.md:163`） | 148 文件 / ~1908 直接用例 + each 展开 | 数量级吻合（each 展开后 1989 可信，未逐条复数） |
| 「六层单向依赖」措辞 | README:3 「六层单向依赖架构」 | 实际 DAG 为 9 个目录层（CONTRACTS #1 自身写九层） | 措辞口径差异：README「六层」为早期说法残留，CONTRACTS/脚本均九层。非代码问题 |
