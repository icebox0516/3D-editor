# 00 · 架构总览（Architecture Summary）

> 本文档是给后续 AI 的「项目地图」——不重复细分文档内容，只提供定位与关键事实。全部结论基于 2026-09-15 全仓代码审计（详见 01-13 分文档）。

## 1. 项目一句话定位

浏览器端三维园区编辑器（React 19 + Three.js 0.186 WebGL + zustand + Vite）：绘制面/线/点区域、放置 GLB 资产、插件化样式渲染、全量可撤销编辑、场景 JSON 存取。

## 2. 当前真实架构

九层单向 DAG（`scripts/check-layer-deps.mjs` 脚本强制，`npm run check:layers`）：

```
core → scene → domain → registries → (editor | runtime | io) → ui → app(组合根)
```

- **three 只允许出现在 runtime/app**（白名单强制）；editor/ui/domain 零 THREE。
- editor 与 runtime 互为兄弟禁互导——渲染能力经 **Port 依赖倒置**（接口声明在 `editor/services/ports.ts`，实现在 runtime，app 注入）。
- 装配唯一发生在 `src/app/bootstrap.ts: createEditor()`（EventBus→SceneManager→四注册表→History→Renderer→16 工具→InputController），产出 `EditorHandle`（EditorFacade 超集门面）。

## 3. 核心数据模型

```
SceneData v2.0 { version,id,name,environment(开放键:grid/renderMode/axes), layers[], objects[] }
SceneObject 基座 { id,type,name,parentId,layerId,visible,locked,transform,properties,metadata }
 ├─ RegionObject  type:'region'  = 基座 + shape{type:7枚举,points,baseHeight,closed,options?}
 │                                    + semantic{type:10枚举,properties} + style{presetId,overrides}
 ├─ ModelObject   type:'model'   = 基座 + asset{assetId}（唯一引用字段）
 └─ GroupObject   type:'group'   = 基座即全部（纯组织节点，不渲染不拾取，transform 恒等）
Layer { ...,objectIds:派生索引 }
```

高度合成：region 最终 y = `shape.baseHeight + transform.position.y`；model y = 放置时地面 + `MODEL_BASE_HEIGHT`(0.03)。

## 4. 核心模块

| 模块 | 职责 | 关键文件 |
|---|---|---|
| SceneManager/SelectionManager | 唯一数据源容器 / 选中集 | `src/scene/` |
| semanticDefinitions | 十类语义定义（默认图层/预设/层高单一真相源） | `src/domain/regions/semanticDefinitions.ts` |
| 样式引擎 | createStyle/updateStyle/disposeStyle + 材质模板池 + 写时复制 | `src/runtime/styles/engine.ts` 等 |
| RegionRenderer | region→样式实例生命周期（按 object:updated keys 精确分派） | `src/runtime/renderers/RegionRenderer.ts` |
| InstancedAssetPool | 每 assetId 一池（1=Mesh/≥2=InstancedMesh，矩阵槽增量） | `src/runtime/instancing/InstancedAssetPool.ts` |
| Renderer | 渲染总管（三 WebGL 上下文 + 分遍渲染模式 + 图层 + 全部 Port 实现族） | `src/runtime/Renderer.ts`(1069行) |
| Command/History | 16 类命令 + 双栈撤销（无 merge API——合并在工具层「会话批次协议」） | `src/editor/commands/`、`history/` |
| ToolManager + 16 工具 | 交互层（七绘制/放置/选择/变换/顶点/道路分割/四测量） | `src/editor/tools/` |
| toolIA | UI 交互架构（工具表/快捷键/八模式/上下文矩阵，~1100 行） | `src/ui/tools/toolIA.ts` |
| store | zustand 事件桥（EventBus→React，不缓存场景本体） | `src/ui/store.ts` |

## 5. 核心运行流程

```
用户操作 → UI/Tool → new Command → history.execute → SceneManager(增删改)
  → EventBus(object:*/scene:changed) → SceneSync → Renderer.attach/update/detach
  → RegionRenderer(样式引擎) 或 InstancedAssetPool → 连续 rAF 渲染循环下一帧呈现
工具↔渲染交互经 Port（拾取/地面投影/Ghost/Gizmo/顶点句柄/测量覆盖层）
UI 渲染读数经事件回流（draw:status/measure:status/app:notify）+ session Port 1Hz 轮询
```

## 6. Feature / Style / Asset 当前关系

- **Feature（region 对象）**= shape × semantic × style 三层解耦数据；语义决定默认样式与默认图层；样式与资产系统当前**零连接**（runtime/styles 不 import loaders/instancing）。
- **Style** = 注册表元数据（registries，UI 可见）+ 构建函数（runtime 路由，UI 不可见）「双轨」；场景只存 presetId+overrides，渲染实例纯运行期。
- **Asset** = manifest→AssetRegistry 元数据 + GLB 文件 + AssetLoader 模板缓存；场景只存 assetId。

## 7. Scene / Command / Renderer 当前关系

- Scene 唯一数据源；Renderer 只读（getObject/getObjects/getLayer），事件驱动单向映射；userData 只存 objectId。
- 一切对象级可见修改经 Command（16 类 + BatchCommand 合并）；**已知例外**：图层新建/删除直调 SceneManager（不可撤销，代码注释自述任务书授权——OutlinerPanel.tsx:1062-1087）。
- Renderer 拖拽中间态直写渲染对象属预览隔离，结束必经 Command 收敛。

## 8. Three.js / GPU 当前能力

- 纯 **WebGL2**（无 WebGPU/TSL/WGSL/compute/render target 业务使用）；页面常驻 3 个 WebGLRenderer（主视口+小地图+轴指示器）+ 按需第 4 个（缩略图离屏快照）。
- **能力等级 Level 2（Instancing）为主，Level 3 受限形态**：ShaderMaterial 预设可挂载（3 套）+ 诊断自写 shader + onBeforeCompile；但无时间推进（uTime 恒 0 未接线）、无程序化纹理材质、无散布。Level 4/5 不存在。
- 性能监测内建：getViewportStats（fps/triangles/drawCalls，状态栏实时）。

## 9. 当前已实现能力（速览）

七形状绘制三步流 / 十语义注册制 / 24 样式预设（参数覆写+批量作用域）/ 13 GLB 资产库（分类/搜索/标签/收藏/缩略图三级缓存）/ Ghost 放置+连续批次 / 选择框选 / Gizmo 三态（多选组枢轴）/ 五级吸附+参考线+贴地 / 顶点编辑 / 对齐阵列 / 道路分割合并 / 11 图层管理 / 场景树分组拖拽 / 八工作模式 / 四布局+个人布局+纯三维 / v2 场景 IO+模板+映射化批量导入 / 六渲染模式（含 islands 诊断）/ 四类会话态测量 / 小地图+轴指示器 / 1989 测试基线全绿。

**明确未实现**：面板 Docking（远期）、analysis 模式（禁用占位）、测量持久化、LOD、批量散布、正交相机（机位为固定方位角透视）、水面动画（uTime 未接线）。

## 10. 当前主要技术债（详见 12）

P1 ×1：图层新建/删除绕过 Command 不可撤销（与 README 不变式冲突）。
P2：模型图层透明度不生效；多材质组透明度跳过；uTime 占位未接线；历史栈无上限；拖拽帧全量对象扫描（SpatialIndex 未接线）；环境预设双表约定耦合。
P3：死事件（style:changed/asset:registered）、CommandRegistry 未消费、注释陈旧（element_ 前缀/六层措辞）等。

## 11. 最值得保留的现有设计

1. **九层 DAG + 守护脚本**——架构约束可执行而非口头约定；
2. **Port 依赖倒置**——editor 零 THREE 而 Gizmo/拾取/预览全可用；
3. **样式双轨注册 + 引擎资源归属规则**——材质模板池/写时复制/几何归调用方的边界清晰，新预设即插即用（零注册代码）；
4. **InstanceSourceProvider 注入接口 + 锚点脱离渲染树**——实例化对业务层完全无感；
5. **事件驱动的渲染同步（SceneSync 纯逻辑可测）** + 连续渲染健壮性件（RenderLoop 熔断/上下文看门狗/逐帧尺寸自检）；
6. **单一真相源纪律**——语义→图层名/预设/层高、MODEL_BASE_HEIGHT、道路宽度等数值全仓唯一出处。

## 12. 最容易影响未来扩展的地方

1. 样式系统无时间 tick 通路（动态样式第一缺口）；
2. materialPool 无参数签名（参数化样式→材质数=对象数）；
3. Style 无散布/资产引用输出能力（森林类样式无基础设施）；
4. RegionStyle/ModelObject 无参数化引用位（数据模型需扩展才能承载 scatter 规则/实例变体）；
5. SceneSerializer 对 region 三层强校验（新层需放行策略）；
6. UI 交互人口集中于 toolIA.ts 单文件。

## 13. Procedural Style 扩展点（详见 13）

- **零改动**：新 preset 文件 + ShaderMaterial（表面着色型：草地/沥青/砖纹）——契约已验证容纳。
- **小改**：StyleInstance 增 tick + params 注入资产源保留键（动画与插件自管 InstancedMesh 散布）。
- **大改**：引擎级 scatter 池（复用 InstancedAssetPool 形态，按 presetId+assetId 分池）。

## 14. Procedural Asset 扩展点（详见 13）

- **最佳接入点 = `InstanceSourceProvider`**（已是注入接口，程序化源 provider 并列注入，池零改动）；
- 需扩展：ModelAsset 资源形态字段 + manifest schema、AssetLoader.instantiate 分派、缩略图快照源；
- 放置/Ghost/拾取/撤销链路**完全兼容**（assetId 引用间接性收益）。

## 15. 当前无法从代码确定的问题

1. shader_test「T6.4 接线」原计划是否包含 uTime 驱动（代码未实现，无任务书结论可考——archive/tasks-v1 可查但属历史文档）；
2. 图层新建/删除「任务书授权 P0」的完整决策上下文（注释引用任务书，任务书已冻结归档）；
3. 性能实测基线（结构分析指出拖拽帧 O(n) 扫描，无 profile 数据证实当前规模是否已达瓶颈）；
4. dist/ 目录为旧构建产物（含 2026-09-15 时间戳），是否与当前 src 完全同步未验证（不影响审计结论）。

---

# 给后续 AI 的重要事实

以下事实**直接可信**，均已代码验证：

1. **Scene 是唯一数据源**：`SceneManager`（Map 容器）持有全部对象与图层；渲染对象 userData 只存 objectId；UI store 不缓存场景本体（sceneVersion 重读模式）。
2. **Renderer 只读**：runtime 层对 SceneManager 仅调用 getObject/getObjects/getLayer(s)；Gizmo/顶点编辑拖拽中间态直写渲染对象（预览），结束经回调走 Command。
3. **Command 覆盖一切对象级修改，例外仅两处**：UI 图层新建/删除（直调 SceneManager，不可撤销）与组合根 openScene/装配（全量替换语义）。选中集/环境/网格/模式/测量按设计不入历史。
4. **RegionObject** = `{id(type:'region'), name, parentId, layerId, visible, locked, transform, properties{}, shape{type:7枚举, points:Vec2[]已展开, baseHeight, closed, options?}, semantic{type:10枚举, properties}, style{presetId, overrides}, metadata?}`；id 前缀 `region_`。
5. **ModelObject** = 基座 + `asset:{assetId}`（仅此一个扩展字段）；id 前缀 `model_`；贴地抬升 0.03（MODEL_BASE_HEIGHT 单一数值源）。
6. **Style 注册方式**：`*.preset.ts` 文件同文件导出 `{meta, build}`；`import.meta.glob` eager 扫描 → build 进 runtime 路由表 + meta 收割进 `StylePresetRegistry`（bootstrap 装配）；预设 id 命名空间 `'<category>.<name>'`（如 `water.standard`），非 createId 体系；当前 24 套。
7. **Asset 注册方式**：fetch `assets/manifest.json`（scan-assets.mjs 生成，13 条目）→ `loadManifest` 校验 → `AssetRegistry` 幂等灌注；id 如 `asset_tree`（含中文 id）。
8. **Instancing 方式**：`InstancedAssetPool` 每 assetId 一池；同资产 1 实例=普通 Mesh、≥2=InstancedMesh（一个 Draw Call）；单实例更新只写对应矩阵槽；隐藏=零缩放矩阵；InstancedMesh 命中 instanceId→resolvePick 反查业务 id；锚点 Object3D 脱离渲染树供映射与取景。
9. **Three.js 边界**：仅 `src/runtime/**` + `src/app/**` + `src/main.tsx`（check:layers 白名单强制）；editor 需渲染能力走 Port 接口（ports.ts 声明、runtime 实现、bootstrap 注入）。
10. **WebGL 状态**：纯 WebGL（WebGL2），无 WebGPU/TSL/WGSL/compute；页常驻 3 个 WebGLRenderer + 按需缩略图第 4 个；渲染循环为连续 rAF（有意决策勿改）；Renderer.dispose 禁 forceContextLoss（StrictMode 双挂载历史 bug）。
11. **样式材质纪律**：材质归引擎（presetId 模板池引用计数，带覆写独享，update 写时复制提升）；几何归调用方（RegionRenderer 拥有并释放）；update 只改参数/uniform 禁重建几何；切预设/类型复用同一 BufferGeometry。
12. **历史合并机制**：Command 接口无 merge；「连续放置/点绘制合并为一条」靠工具层会话批次协议（undo 弹本会话批→重建更大 BatchCommand）；多目标拖拽微任务聚合。
13. **场景格式 v2**：serialize=JSON 整体透传；版本门仅 '2.0'（v1 无迁移层）；对象类型 fail-fast（region/model/group）；场景不存渲染结果（样式/资产按 id 重建）；诊断渲染档保存时剥离。
14. **事件总线**：类型化 EventMap 14 事件（`core/events/events.ts`）全局唯一；runtime 样式引擎例外（通知通道注入）。
15. **审计基线**：分层检查 `npm run check:layers` + `typecheck` + `test`（1989 基线）是「完成」的三重门槛（AGENTS.md 硬约束）。

## 文档索引

| 文档 | 内容 |
|---|---|
| [01](01_PROJECT_OVERVIEW.md) | 技术栈/构建/规模/入口/功能清单/约束 |
| [02](02_MODULE_ARCHITECTURE.md) | 九层逐模块分析 + 依赖 ASCII 图 + 越界记录 |
| [03](03_SCENE_DATA_MODEL.md) | 数据对象全字段 + 三层解耦判定 + 结构图 |
| [04](04_OBJECT_LIFECYCLE.md) | 绘制/放置/编辑/撤销四链路逐行追踪 |
| [05](05_STYLE_SYSTEM.md) | 样式引擎全解析 + 四概念辨析 + 扩展缺口 |
| [06](06_ASSET_SYSTEM.md) | manifest→放置→实例化全链 + 定义/渲染分离判定 |
| [07](07_RENDER_ARCHITECTURE.md) | 渲染初始化→拾取→模式→资源生命周期 + GPU 等级 |
| [08](08_EDITOR_INTERACTION.md) | 交互设施总表 + 状态归属 + 通信机制 |
| [09](09_COMMAND_HISTORY.md) | 16 命令逐个 + 历史机制 + 绕过点审计 |
| [10](10_SCENE_IO.md) | v2 schema/校验/导入/模板/引用完整性 |
| [11](11_FEATURE_MAP.md) | 24 个用户功能→代码映射表 |
| [12](12_ARCHITECTURE_FINDINGS.md) | P0-P3 分级问题/风险/技术债 |
| [13](13_EXTENSION_POINTS.md) | Procedural Style/Asset/Style 引用 Asset 三方向分析 |
