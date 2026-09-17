# 03 · Scene 数据模型（Scene Data Model）

> 本文是本次审计核心文档之一。全部字段与语义直接摘自 `src/scene/`、`src/domain/`、`src/core/` 实际代码。

## 对象总览与派生关系

```
SceneData（io 层序列化顶层结构，src/scene/SceneData.ts:118-125）
 ├─ version: '2.0'（固定）
 ├─ id / name
 ├─ environment: SceneEnvironment（开放扩展键：grid / renderMode / axes）
 ├─ layers: Layer[]
 └─ objects: SceneObject[]（平铺数组；同父兄弟顺序 = 数组内顺序）

运行期（非 SceneData 字段，bootstrap.ts:507-510 组合根持有）：
 sceneId / sceneName / environment 三个可变局部变量 + SceneManager 内的 objects/layers

SceneObject（统一基座接口，src/scene/SceneObject.ts:8-30）
 ├─ RegionObject（type:'region'，src/domain/regions/RegionObject.ts:72-80）
 ├─ ModelObject（type:'model'，src/domain/assets/ModelObject.ts:8-10）
 └─ GroupObject（type:'group'，src/scene/GroupObject.ts:17-20）

Layer（src/scene/Layer.ts:6-18）
SelectionManager（选中 ID 集，运行态，不序列化）
StylePresetMeta（注册表数据，不随场景序列化——场景只存 presetId）
ModelAsset（注册表数据，不随场景序列化——场景只存 assetId）
```

---

## 1. SceneObject —— 一切可编辑对象的基座

`src/scene/SceneObject.ts:8-30`，纯数据接口：

| 字段 | 类型 | 语义（代码注释原文依据） |
|---|---|---|
| `id` | `ID`(string) | 稳定业务 ID，`createId(prefix)` 生成（:11） |
| `type` | `string` | 合法值现状 `'region' / 'model' / 'group'`（:14 注释 + `SceneSerializer.ts:35` OBJECT_TYPES） |
| `name` | `string` | 显示名 |
| `parentId` | `ID \| null` | 层级树挂靠；根级 null；T8.5 起承载真实层级（:18-19） |
| `layerId` | `ID \| null` | 所属图层；null = 未归属（:20）——islands 诊断档以此判定「未归类」 |
| `visible` / `locked` | `boolean` | 显示/锁定 |
| `transform` | `Transform` | 世界坐标 position/rotation(弧度)/scale，Y 向上（:23-24） |
| `properties` | `Record<string,unknown>` | 基座开放业务属性（region 的语义参数实际在 `semantic.properties`，不在此，:26-27） |
| `metadata?` | `Record<string,unknown>` | 附加元数据，可随场景保存不进业务逻辑（:28-29）；实际用途：导入归层 `layerName`（`bootstrap.ts:166-171`）、资产量级信息 |

### ID 如何生成

- `createId(prefix)`：`${prefix}_${base36时间戳}${同毫秒序号}${随机8位}`（`src/core/id/index.ts:26-33`）——同毫秒单调序号 + 随机兜底，进程内唯一。
- 实际前缀（代码使用点）：`region_`（`createRegionObject.ts:76`）、`model_`（`modelFactory.ts:66-79`）、`group_`（`groupFactory.ts:25-41`）、`layer_`/`scene_`（`bootstrap.ts:138-139,135`）、`cmd_`（`Command.ts:33`）、`measure_`（`measure/index.ts:33`，会话态不序列化）。
- **注意**：`SceneObject.ts:11` 注释写「element_ / model_ / scene_ 前缀」——`element_` 已随 v1 旧要素体系删除（CONTRACTS #7 勘误记录），注释为历史残留。

### transform 与高度合成

- `Transform { position: Vec3; rotation: Euler(弧度); scale: Vec3 }`（`core/types/index.ts:44-48`）。
- **高度合成规则**（分域契约 §A，代码多处引用）：region 最终 y = `shape.baseHeight + transform.position.y`（`RegionObject.ts:22`、`GeometryBuilder.ts` 头注）。model 的 y 直接取 `transform.position.y`（放置时 = 地面 y + `MODEL_BASE_HEIGHT` 0.03，`PlacementTool.ts:289-306`）。

---

## 2. RegionObject —— 绘制产物（三层解耦结构）

`src/domain/regions/RegionObject.ts:72-80`：`extends SceneObject`，`type: 'region'`，扩展三个顶级字段：

```ts
shape:    RegionShape    // 几何层：纯形状，无业务语义
semantic: RegionSemantic // 语义层：业务类型 + 业务参数，与渲染无关
style:    RegionStyle    // 样式层：预设引用 + 用户覆写，视觉由 runtime 样式引擎消费
```

### RegionShape（:26-34）

| 字段 | 类型 | 说明 |
|---|---|---|
| `type` | `ShapeType` | 七枚举：`polygon/rectangle/circle/ellipse/freehand/line/point`（:10-17） |
| `points` | `Vec2[]` | XZ 平面顶点/控制点（Vec2.y = 世界 z）；**参数化形状已展开为点列**（绘制/面板写入） |
| `baseHeight` | `number` | 贴地层抬升基准（高度合成基线） |
| `closed` | `boolean` | 面类恒 true，line/point 恒 false |
| `options?` | `Record<string,unknown>` | 参数化派生参数缓存（圆半径/分段、矩形长宽、自由形状平滑度——调用方写入，本层只约定形态） |

### RegionSemantic（:37-40）

```ts
type: SemanticType          // 十枚举（semanticDefinitions.ts:20-30）：
                            // unclassified/water/grass/plaza/parking/bare_land/road/building/poi/custom
properties: Record<string, unknown>  // 业务参数：road.width(默认6)、building.height(默认10)……
```

- 参数**定义**（元数据）在 `SemanticDefinition.properties: StyleParameter[]`（`semanticDefinitions.ts:47-52`）；参数**值**存在对象上。UI 据定义自动生成控件。

### RegionStyle（:43-47）

```ts
presetId: string                        // 样式插件注册键，如 'water.standard'（非 createId 体系）
overrides: Record<string, unknown>      // 用户覆写参数，非默认值才存
```

### 守卫

`isRegionObject(obj)`：type==='region' 且 shape/semantic/style 三字段为 plain object（:58-66）——不做深层校验（归 validate）。

---

## 3. ModelObject —— 模型放置对象

`src/domain/assets/ModelObject.ts:8-10`：

```ts
interface ModelObject extends SceneObject {
  asset: AssetReference;   // 仅 { assetId: ID }（AssetReference.ts:8-10）——只存引用不内联资源
}
```

- 守卫 `isModelObject`：有 `asset` 字段且 `asset.assetId` 为 string（:38-44）——结构判别，无运行时 type 标记强校验（`type` 字段实际为 `'model'`，工厂写入）。
- 常量：`MODEL_LAYER_NAME = '模型'`（:21）、`MODEL_BASE_HEIGHT = 0.03`（:33，贴地 z-fighting 消除的单一数值源，五路落点引用）。

## 4. GroupObject —— 纯组织节点（组壳）

`src/scene/GroupObject.ts:17-20`：`extends SceneObject`，`type: 'group'`，**无任何扩展字段**。

- 语义（:10-16 注释）：组不传递变换（transform 恒等，由工厂与命令保证）、删组不删成员（成员上提）、子对象 layerId 独立、组可嵌套、空组保留、组壳 layerId 建议默认 null。
- 渲染侧：`Renderer.ts:256` `NON_RENDERABLE_TYPES = { 'group' }`——attach 静默跳过，无 RuntimeObject、不参与渲染与拾取（:503）。

## 5. Layer

`src/scene/Layer.ts:6-18`：

| 字段 | 说明 |
|---|---|
| `id/name` | |
| `visible/locked` | |
| `opacity` | [0,1]，渲染侧乘算进材质（模型实例除外，`Renderer.ts:943-949`） |
| `order` | 叠加顺序（小者后画在上——注释原文；实际渲染语义由 runtime 决定，:15） |
| `objectIds` | **派生索引**——由 SceneManager 依据对象 layerId 自动维护，调用方不应手工修改（updateLayer patch 忽略该字段，`SceneManager.ts:132`） |

## 6. SceneData / SceneEnvironment

`src/scene/SceneData.ts:118-125` 顶层（见上文总览）。`SceneEnvironment`（:13-16）：

```ts
interface SceneEnvironment {
  preset: string;          // day/dusk/night/tech（ENVIRONMENT_PRESETS，Renderer.ts:126-175）
  [k: string]: unknown;    // 开放扩展——实际使用的键：
}
```

- `grid: SceneGrid`（:23-29）——`{visible,size,spacing}`，spacing 即绘制吸附步长（`coerceSceneGrid` 钳制 spacing [0.1,100] / size [100,4000]）。
- `renderMode: ViewportRenderMode`（:53-58）——六态；**诊断三档（clay/normals/islands）会话级，保存时由组合根剥离**（`bootstrap.ts:607-608`），常规三态随场景往返。
- `axes: SceneAxes`（:76-79）——坐标轴指示器开关。

## 7. Style / Asset 的「注册表侧」数据（不随场景序列化）

- `StylePresetMeta`（`src/registries/StylePresetRegistry.ts:23-36`）：`{ id, name, category?, thumbnail?, supportedShapes: ShapeType[], supportedSemantics: SemanticType[], defaultParams: StyleParameter[] }`——纯元数据，**永不含构建函数**（构建函数在 `runtime/styles/routes.ts`，DAG 隔离）。
- `ModelAsset`（`src/domain/assets/ModelAsset.ts:11-25`）：`{ id, name, category, file(.glb 相对路径), thumbnail?, tags[], defaultScale, defaultRotation, metadata? }`。
- `StyleParameter`（`src/domain/styles/StyleParameter.ts:12-23`）：`{ key, label, type: 'color'|'number'|'boolean'|'select', default, min?, max?, step?, options? }`——语义参数与样式预设参数共用同一形态。

---

## 重点问题解答

### RegionObject 实际的数据结构是什么？

`SceneObject 基座 + shape{type,points,baseHeight,closed,options?} + semantic{type,properties} + style{presetId,overrides}`（`RegionObject.ts:72-80`）。形状是**已展开的点列**（参数化信息只缓存在 `shape.options`），语义与样式是**独立子对象**，通过 `createRegionObject` 工厂组装（`createRegionObject.ts:62-92`：semantic 缺省 unclassified、style 缺省=语义 defaultPresetId + 空 overrides、id=`createId('region')`、未知语义类型抛错）。

### ModelObject 实际的数据结构是什么？

`SceneObject 基座 + asset: { assetId }`（仅一个引用字段）。无几何数据、无实例参数——**实例的全部空间状态就是基座 transform**；资产的几何/材质本体在 AssetLoader 模板缓存中，多实例共享。

### 「形状 / 语义 / 样式」是否真正解耦？

**数据结构上完全解耦**（三个互不嵌套的子对象）；**行为上有三条有意耦合链**（均为代码事实，非违规）：

1. 语义定义携带 `defaultPresetId`（赋类型时命令重置样式，`ChangeSemanticCommand.ts:73-88`——类型切换三联动：semantic + layerId(按 def.defaultLayerName 查名) + style 重置）。
2. 几何构建读语义参数：`GeometryBuilder` 对 line 形状读 `semantic.properties.width` 生成道路条带（`GeometryBuilder.ts:14-17`）；building 预设读 `params.semantic.height` 挤出（`engine.ts` 头注 :42-45）。
3. 贴地层高 `defaultBaseHeight` 是**语义**属性但写在 **shape**.baseHeight 上（创建时按语义写入，`createRegionObject` 注释 + `semanticDefinitions.ts:32-35`）。

渲染侧解耦断言被 RegionRenderer 显式维护：改 shape 只重建几何不碰材质；切预设/类型只换样式实例**复用同一 BufferGeometry**（`RegionRenderer.ts` 头注「解耦断言①②③」）。

### Style 是 ID、对象、参数还是生成结果？

**场景内是「ID + 参数覆写」**（`presetId: string + overrides: Record`）——不存对象、不存生成结果。渲染实例（`StyleInstance`，含 material/objects）只存在于 runtime 内存，由引擎按 presetId 路由 + 参数解析即时构建。Style 完整定义分两半：元数据在 registries（UI 可见），构建函数在 runtime 路由表（UI 不可见）。

### Asset 是什么？

**Asset = 注册表中的元数据条目（ModelAsset）+ 磁盘上的 GLB 文件**。场景对资产的唯一引用是 `ModelObject.asset.assetId`。Asset 无生命周期事件（注册时发 `asset:registered`，EventMap 有此事件但 Bootstrap 装配后静态）；资产加载/缓存/实例化全部运行期行为归 AssetLoader + InstancedAssetPool。

### Scene 是否真的是唯一数据源？

**是，且有明确边界**：
- 渲染对象（THREE Object3D）不承载业务数据，`userData` 只存 objectId（`RuntimeObjectMap.ts:7-9`，CONTRACTS #3）。
- UI store 不缓存场景对象本体，按 sceneVersion 重读 facade（`store.ts:104-106`）。
- 例外（设计内的运行态非持久数据）：选中集（SelectionManager）、历史栈、测量会话（MeasureSession，不入场景 JSON 不入历史）、绘制草稿（DrawSession 纯内存）、吸附配置（会话级）。这些是「编辑器会话状态」而非「场景数据」，不参与序列化。

### Renderer 是否直接修改 Scene？

**否**。Renderer 头注明确「只读 Scene 数据（SceneManager 仅 getObject/getObjects/getLayer）」（`Renderer.ts:29-30`）；审计 grep 证实 runtime 层对 SceneManager 无任何写方法调用。Gizmo 拖拽**中间态**直写渲染对象（transform 预览隔离，`Renderer.ts:410-412`），**结束**经 `onDragEnd` 回调 → TransformTool → TransformCommand → SceneManager（唯一落库路径）。顶点编辑拖拽同理（预览经 `RegionRenderer.applyShapePreview` 只换几何，提交走 ChangeShapeCommand）。

### UI 是否直接修改 Scene？

**对象数据：否**——全部经 `facade.history.execute(command)`（多文件证据见 02/08 文档）。**例外（图层）**：`OutlinerPanel.tsx:1063-1077` 新建图层与 `:1084-1087` 删除图层**直接调 `facade.scene.addLayer/removeLayer`**（绕过 Command、不可撤销，代码注释自述「任务书授权，P0」；图层合并仍走 MergeLayerCommand）。选中集操作（select/clear）是另一类非命令直调——按设计不经 Command（`SelectTool.ts:15-16` 注释）。

### Command 在数据变化中处于什么位置？

**一切持久化数据变更的唯一写路径**（除组合根 openScene/默认装配的「全量替换」语义，见 09）。链路：

```
用户操作（UI 组件 / Tool / InputController 快捷键）
  → new XxxCommand(before, after)          // 命令构造时 deepClone 快照
  → facade.history.execute(cmd)            // HistoryManager: canExecute → execute → 入 undoStack
  → cmd.execute(CommandContext)            // 内部调 SceneManager.addObject/updateObject/…
  → SceneManager emit object:*/scene:changed
  → SceneSync 翻译 → Renderer.attach/update/detach
  → 下一帧渲染（连续渲染循环）
```

CommandContext 仅 `{ sceneManager, selection, eventBus }` 三成员（`CommandContext.ts:14-21`）——命令零渲染、零历史感知。

---

## Scene 数据结构图（树）

```
SceneData (version '2.0')
│
├─ id: scene_xxx ── name ── environment { preset, grid?, renderMode?, axes?, …开放键 }
│
├─ layers: Layer[]
│   └─ Layer { id: layer_xxx, name, visible, locked, opacity, order,
│              objectIds: ID[] ←——派生索引（SceneManager 维护，与对象.layerId 对偶） }
│
└─ objects: SceneObject[]（平铺；同父兄弟顺序 = 数组序；parentId 构成森林，hierarchy.ts 派生）
    │
    ├─ SceneObject 基座
    │   id: region_xxx | model_xxx | group_xxx
    │   type: 'region' | 'model' | 'group'
    │   parentId: ID | null        layerId: ID | null（islands 诊断按 null 高亮）
    │   visible / locked / name
    │   transform { position(Vec3), rotation(Euler 弧度), scale(Vec3) }
    │   properties: {}（基座开放位，region 实际不用）
    │   metadata?: { layerName?(导入归层), … }
    │
    ├─ [type='region'] RegionObject
    │   ├─ shape    { type: 7 枚举, points: Vec2[](已展开点列), baseHeight,
    │   │             closed, options?(参数化缓存: radius/width/… ) }
    │   ├─ semantic { type: 10 枚举, properties: { width?, height?, … } }
    │   └─ style    { presetId: 'water.standard'…, overrides: { color?, opacity?, … } }
    │
    ├─ [type='model'] ModelObject
    │   └─ asset { assetId ──► AssetRegistry.ModelAsset { file→GLB, defaultScale, tags, … } }
    │
    └─ [type='group'] GroupObject（组壳：基座即全部；transform 恒等；不渲染不拾取）

── 注册表侧（进程内常驻，不随场景序列化）─────────────────────
   StylePresetRegistry: presetId → StylePresetMeta { defaultParams, supportedShapes, supportedSemantics }
   runtime/styles/routes: presetId → build(geometry, params) → StyleInstance（仅运行期）
   AssetRegistry: assetId → ModelAsset
   SemanticRegistry: SemanticType → SemanticDefinition { defaultLayerName, defaultPresetId,
                                                          defaultBaseHeight, properties }
── 运行态（不序列化）─────────────────────────────────────────
   SelectionManager.selected: ID[]      HistoryManager: undo/redoStack
   MeasureSession: MeasureItem[](measure_)   DrawSession: 草稿点列
```

## 序列化要点（详见 10 文档）

- serialize = `JSON.stringify(data, null, 2)` 整体透传（`SceneSerializer.ts:89-91`）——region 三层字段、group 嵌套（parentId + 数组序）天然往返无损。
- deserialize 版本门仅认 '2.0'（:28），对象类型 fail-fast（region/model/group），region 三层结构级校验（:47-84）。
- **场景文件不保存渲染结果**：无材质对象、无 THREE 数据、无 StyleInstance——全部可在加载后按 presetId+overrides 重建。
