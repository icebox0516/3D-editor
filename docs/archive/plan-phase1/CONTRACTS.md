# 全局约束与接口契约（所有子代理必读；唯一权威，任务文件与源码不得重定义）

> **按需读取体系（2026-09-11 拆分）**：本文件只保留**全任务必读**的基础契约；分域契约按任务书「必读」节指定读取（见文末「契约分域索引」）。与基础契约冲突时停下在报告中提出，由主代理决策。

## 全局约束

1. **分层 DAG（导入方向强制）：**
   `core` ← `scene` ← `domain` ← `registries` ← (`editor` | `runtime` | `io`) ← `ui` ← `app`
   即：core 不依赖任何层；scene→core；domain→core,scene；registries→core,scene,domain；editor/runtime/io→core,scene,domain,registries；ui→core,scene,domain,registries,editor（**禁止导入 runtime/io**）；app（组合根 `src/app/`、入口 `src/main.tsx`）可导入一切。
2. **three 导入白名单：** `three` 及 `three/examples/*` 只允许出现在 `src/runtime/**` 与 `src/app/**`；由 `scripts/check-layer-deps.mjs` 强制。
3. **Scene 唯一数据源：** 业务层禁止把 THREE.Mesh 当业务对象；运行时只读 Scene，反向修改一律走 Command → SceneManager。`userData` 只存 `objectId` 映射辅助。
4. **一切可见修改经 Command**，命令保存 before/after；批量操作用 BatchCommand 合并为一条历史。
5. **Domain 零渲染：** `src/domain/**`、`src/scene/**`、`src/registries/**`、`src/editor/**`、`src/io/**` 中禁止出现任何 `THREE` 类型或导入。editor 需要渲染能力时通过下方 Port 接口（依赖倒置，runtime 实现、app 注入）。
6. **注册制扩展：** 新要素/样式/资产/工具/命令一律 Registry 注册接入；业务代码禁止 `if (type === 'building')` 式散落判断。
7. **ID 前缀：** `scene_ / layer_ / region_ / style_ / asset_ / model_ / cmd_ / tool_ / tpl_ / group_ / measure_`（`createId(prefix)` 生成；`region_` 为阶段 6 RegionObject 增补，2026-09-11；`element_` 随 T6.9 旧契约类型面删除移出清单；`tpl_` 为 T8.2 用户模板 id 增补，2026-09-14——内置模板 id 为固定字符串 `builtin-empty`/`builtin-sample`，属注册表键命名空间先例，不走本前缀体系；`group_` 为 T8.5 组壳（纯组织节点）id 增补，2026-09-14；`measure_` 为阶段 10 测量项 id 增补，2026-09-15——**会话态不序列化**，仅 MeasureSession 生命周期内有效）。注册表键命名空间（如样式预设 `water.flow`）不属本前缀体系，见分域契约 §B。
8. **坐标约定：** 编辑器内部世界坐标，Y 向上，地面为 XZ 平面（y=0）；业务几何 Vec2 = (x, z)；rotation 用弧度 Euler。
9. **场景文件版本：** `"version": "2.0"`（T6.9 v2 接管）；SceneSerializer 版本门仅认 2.0——**v1 旧格式停止支持**（2026-09-12 按需门用户裁决：旧数据兼容整体不做，不做任何旧要素转换层），并做对象类型 fail-fast 校验（region/model + region 三层结构 + shape/semantic 枚举合法，路径化错误）。T8.5（2026-09-14）**版本号不变的增量扩展**：类型校验放行 `'group'` 纯组织节点（阶段门 2026-09-13 裁定），未知类型仍路径化报错。
10. **TDD + 频繁提交：** 每任务内先测后码；每任务至少一个 commit（conventional commits：`feat(scope): …` / `test(scope): …` / `chore: …`）。
11. **UI 边界：** React 组件只调用 editor 层门面（`EditorFacade`）与订阅 EventBus→zustand store；禁止直接操作 THREE.Object3D。

## 明确排除项（任何任务不得实现）

批量散布、DXF/GeoJSON 导入、测量标注、插件系统（注：阶段 6 的「样式插件化」是**样式模块化文件规范**，不是通用插件系统，不在此列）、LOD、Vertex/Edge 吸附、OBJ/FBX 格式、停车车辆填充。

> **2026-09-11 设计门修订（用户逐题拍板，决策日志留痕）**：解禁「Shader/样式编辑器」与「水面波纹动画」（样式插件可携带任意 ShaderMaterial，归阶段 6，契约见 `contracts/stage6-region.md`）；「顶点编辑」限定解禁于 T6.8（阶段 6 末档）——其余任务仍不得实现顶点级编辑。

> **2026-09-12 T7.1 阶段门增补（用户裁定，决策日志留痕）**：①「面板 Docking / Floating / Auto Hide」延后至远期规划（原 T7.2 整体不做，重启需按需门）；②建筑「自动生成」（需求 6.2）不做——与批量散布近亲、需求不明；③道路「偏移」不做（记观察项，width 参数覆盖多数诉求）。

> **2026-09-15 T10.1 阶段门增补（第十一次修订，常设预授权自决，决策日志留痕）**：「测量标注」**限定解禁**——阶段 10 会话态测量（四类：距离/高度差/面积/角度）**不入场景 JSON、不入 Command 历史**（沿 T8.1 参考线「可见但不入历史」先例；社区主流佐证见 archive/research-phase10-measure-analysis.md）；**持久化与测量点吸附仍属排除项**（远期池）。目标契约见 `contracts/stage10-measure.md`（含统计报表与日照分析域）。

## 目录结构（最终形态）

```text
3D editor/
├── index.html
├── package.json / tsconfig.json / vite.config.ts / vitest.config.ts
├── scripts/
│   ├── check-layer-deps.mjs      # 分层 DAG + three 白名单检查
│   ├── generate-assets.mjs       # 程序生成占位 GLB + manifest.json
│   └── scan-assets.mjs           # 扫描 assets/models 重生成 manifest（T2.1）
├── assets/
│   ├── models/{category}/*.glb
│   ├── manifest.json
│   └── mappings/building.example.json   # JSON 导入映射配置示例
├── docs/plan/                    # 计划体系：PROTOCOL / CONTRACTS / STATUS / METHODOLOGY /
│   │                             #   tasks/ / contracts/(分域契约) / history/(归档) / archive/ / screenshots/
│   └── archive/                  # 原始需求文档、旧版主计划（冻结只读）
└── src/
    ├── core/        # id / events / math / types / utils
    ├── scene/       # SceneManager / SelectionManager / 数据接口
    ├── domain/      # geometry / regions / styles(StyleParameter) / assets / validate
    ├── registries/  # semantic / preset / asset / tool / command
    ├── editor/      # commands / history / tools / services(Port) / EditorFacade
    ├── runtime/     # renderer / adapters / renderers / loaders / preview / gizmo / instancing / styles(阶段6)
    ├── io/          # serializer / importer / exporter
    ├── ui/          # React：viewport / toolbar / panels / store(EventBus 桥) / styles(设计系统)
    └── app/         # bootstrap 组合根
```

## 接口契约（基础 · 全任务必读；签名以本节为准）

```ts
// ── core/types ─────────────────────────────────────────────
export type ID = string;
export interface Vec2 { x: number; y: number }          // y 即世界 z
export interface Vec3 { x: number; y: number; z: number }
export interface Euler { x: number; y: number; z: number } // 弧度
export interface Transform { position: Vec3; rotation: Euler; scale: Vec3 }

// ── core/id ────────────────────────────────────────────────
export function createId(prefix: string): ID;            // `${prefix}_${base36时间戳}${随机}`

// ── core/events（类型化事件总线）────────────────────────────
export interface EventMap {
  'object:created':  { objectId: ID };
  'object:updated':  { objectId: ID; keys: string[] };
  'object:removed':  { objectId: ID };
  'selection:changed': { selectedIds: ID[] };
  'scene:changed':   { source: string };
  'history:changed': { canUndo: boolean; canRedo: boolean };
  'layer:updated':   { layerId: ID };
  'tool:changed':    { toolId: string | null };
  'style:changed':   { objectId: ID };
  'asset:registered':{ assetId: ID };
  'draw:status':     DrawStatusPayload;   // 2026-09-09 增补（T3.2 预授权变更点，已落地）
  'app:notify':      { message: string; kind?: 'info' | 'warn' | 'error };
                                         // 2026-09-11 阶段 6 审计增补，用户批准：
                                         // runtime→UI 的 Toast 通知通道（现状 runtime 无合法 Toast 路径）
  'measure:status':  MeasureStatusPayload;      // 2026-09-15 阶段 10 增补（第十一次修订）：
  'measure:changed': { count: number };         // 测量读数（空载荷复位，沿 draw:status 先例）与会话增删清；
                                               // 定义在分域契约 contracts/stage10-measure.md §B，此处仅指针
}
// 绘制状态栏载荷：全部字段可选；完成/取消后发空载荷 {} 复位状态栏；
// Point 工具只发 cursor，Line 加 length，Polygon 发 length+area；校验拦截时附 error
export interface DrawStatusPayload {
  length?: number;   // 当前折线累计长度（米，含游标弹性段；Polygon 为去闭合边的周长链）
  area?: number;     // 当前面实时面积（平方米，环 = 已绘点 + 游标）；仅 Polygon 工具发出
  cursor?: Vec2;     // 游标地面坐标（Vec2 = x, 世界 z，已过吸附/锁定管线）；无有效游标时缺省
  vertexCount?: number; // 当前形状顶点计数；仅绘制会话中发出（2026-09-11 阶段 6 审计增补，用户批准）
  error?: string;    // 校验/操作拦截提示（自相交、顶点不足等）；随下一次正常状态自然清除
}
export class EventBus {
  on<K extends keyof EventMap>(type: K, fn: (p: EventMap[K]) => void): () => void;
  off<K extends keyof EventMap>(type: K, fn: (p: EventMap[K]) => void): void;
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void;
}

// ── scene ──────────────────────────────────────────────────
export interface SceneObject {
  id: ID; type: string; name: string;
  parentId: ID | null; layerId: ID | null;   // parentId 自 T8.5（2026-09-14）承载真实层级（'group' 纯组织节点；此前恒 null 保留字段）；平铺数组内同父兄弟顺序 = 数组内顺序
  visible: boolean; locked: boolean;
  transform: Transform;
  properties: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
// 'group' 组壳（T8.5）：SceneObject 基座即全部（无 shape/semantic/style/asset），transform 恒等、
// layerId 缺省 null（组无图层语义）；纯组织节点——不传递变换、删组不删成员（成员上提父级）、
// 组可嵌套、挂入前环检测；工厂唯一入口 editor/factories/groupFactory（id 前缀 group_）
export interface Layer { id: ID; name: string; visible: boolean; locked: boolean; opacity: number; order: number; objectIds: ID[] }
export interface SceneEnvironment { preset: string; [k: string]: unknown }
export interface SceneData { version: '2.0'; id: ID; name: string; environment: SceneEnvironment; layers: Layer[]; objects: SceneObject[] }

export class SceneManager {          // 只增删改查，不校验、不计算、不发命令
  constructor(eventBus: EventBus);
  getObject(id: ID): SceneObject | undefined;
  addObject(obj: SceneObject): void;                 // emit object:created + scene:changed
  removeObject(id: ID): SceneObject | undefined;     // emit object:removed + scene:changed
  updateObject<K extends keyof SceneObject>(id: ID, patch: Partial<SceneObject>): void; // emit object:updated；勘误（2026-09-09，T1.5）：patch 运行时透传任意键（现含 RegionObject 扩展字段 shape/semantic/style），类型签名保持 SceneObject 键约束，扩展字段写入经结构化收窄
  getObjects(pred?: (o: SceneObject) => boolean): SceneObject[];
  reorderObjects(orderedIds: readonly ID[]): void;  // 2026-09-14 增补（T8.5 同层排序语义）：按清单序重排（未知 id 忽略、遗漏对象追加尾部保原相对序）；顺序无变化幂等静默，有变化 emit scene:changed（source=reorderObjects，不逐对象发 object:updated）
  getLayer(id: ID): Layer | undefined; getLayers(): Layer[];
  addLayer(layer: Layer): void; updateLayer(id: ID, patch: Partial<Layer>): void;   // 2026-09-09 增补（T1.2 按需门）：无写入方法则图层功能不成立
  removeLayer(id: ID): Layer | undefined;           // 成员对象 layerId 置 null，不逐对象发事件；layer.objectIds 为 SceneManager 依对象 layerId 维护的派生索引
  clear(): void;
}
export class SelectionManager {
  constructor(eventBus: EventBus);
  select(id: ID): void; add(id: ID): void; remove(id: ID): void;
  selectMany(ids: ID[]): void; clear(): void;
  getSelectedIds(): ID[]; isSelected(id: ID): boolean;  // 变更 emit selection:changed
}

// ── domain/geometry ────────────────────────────────────────
export type GeometryType = 'Point' | 'LineString' | 'Polygon';
export interface GeometryData { type: GeometryType }
export interface PointGeometryData       extends GeometryData { type: 'Point';       coordinates: Vec2 }
export interface LineStringGeometryData  extends GeometryData { type: 'LineString';  coordinates: Vec2[] }
export interface PolygonGeometryData     extends GeometryData { type: 'Polygon';     coordinates: Vec2[][] } // rings[0]=外环

// ── domain/styles（参数元数据形态；T6.9 后仅存 StyleParameter——语义定义/预设元数据/UI 表单
//    共用；v1 StyleDefinition / MaterialSpec / StyleReference / resolveStyle 已随旧契约类型面删除，
//    历史形态见 contracts/legacy-elements.md）──
export type StyleParameterType = 'color' | 'number' | 'boolean' | 'select';
export interface StyleParameter {
  key: string; label: string; type: StyleParameterType; default: string | number | boolean;
  min?: number; max?: number; step?: number; options?: { value: string | number; label: string }[];
}

// ── domain/assets ──────────────────────────────────────────
export interface ModelAsset {
  id: ID; name: string; category: string; file: string; thumbnail?: string;
  // 勘误注记（2026-09-09，T2.1 阶段门）：file 与 thumbnail 一律为「相对 assets 根」的路径
  //（如 "models/plant/tree.glb"、"thumbnails/tree.svg"）；由组合根 app/bootstrap 统一解析为
  // 可加载 URL 后写入 AssetRegistry，runtime AssetLoader 不感知路径拼接。
  tags: string[]; defaultScale: Vec3; defaultRotation: Euler; metadata?: Record<string, unknown>;
}
export interface AssetReference { assetId: ID }
export interface ModelObject extends SceneObject { asset: AssetReference }

// ── domain/validate ────────────────────────────────────────
export interface ValidationResult { valid: boolean; errors: ValidationError[]; autoFixed: boolean }
export interface ValidationError { code: 'SELF_INTERSECT' | 'TOO_FEW_VERTICES' | 'INVALID_COORD' | 'NOT_CLOSED'; message: string; index?: number }
export function validateGeometry(geometry: GeometryData): ValidationResult;   // 自相交/最少顶点/坐标非法；顶点顺序自动修复

// ── registries ─────────────────────────────────────────────
// 勘误（2026-09-09，T1.3）：Tool/Command 完整类型定义在 editor 层，DAG 禁止 registries→editor 导入，
// 故 ToolRegistry/CommandRegistry 签名使用结构化最小类型 RegisteredTool{id,name} / RegisteredCommand（工厂同样返回最小结构）；
// editor 层完整 Tool/Command 是其结构超集，可直接注册；editor 侧消费 create() 结果时自行结构化收窄。
// 退役注记（2026-09-12，T6.9）：ElementRegistry / StyleRegistry（及 ElementDefinition / Element /
// StyleDefinition / StyleReference / resolveStyle 契约类型面）已删除——JsonImporter v2 零注册表依赖，
// RegionObject 语义/预设默认值以 domain/regions/semanticDefinitions 为单一真相源；v1 形态存档见
// contracts/legacy-elements.md。
export class AssetRegistry    { register(a: ModelAsset): void; unregister(id: ID): void; get(id: ID): ModelAsset | undefined; list(): ModelAsset[]; findByCategory(c: string): ModelAsset[]; search(q: string): ModelAsset[] }
export class ToolRegistry     { register(t: Tool): void; unregister(id: string): void; get(id: string): Tool | undefined; list(): Tool[] }
export class CommandRegistry  { register(type: string, factory: (data: any) => Command): void; create(type: string, data: any): Command }

// ── editor/services（Port 接口，runtime 实现，app 注入）─────
export interface PointerEventInfo { screenX: number; screenY: number; button: 'left' | 'right' | 'middle'; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }
export interface KeyboardEventInfo { key: string; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }
export interface ViewportPort {
  pickObject(x: number, y: number): ID | null;      // 射线拾取 → objectId
  groundPoint(x: number, y: number): Vec3 | null;   // Raycast → Ground 平面世界坐标
  surfacePoint(x: number, y: number): Vec3 | null;  // 2026-09-15 阶段 10 增补（第十一次修订）：
                                                     // 测量拾取——表面优先（content 对象交点）/地面兜底/
                                                     // 近水平限距；定义见 contracts/stage10-measure.md §B
}
export interface CameraPort {
  getMode(): 'perspective' | 'top' | 'front' | 'side';
  // 2026-09-10 增补（T4.1 按需门，用户批准）：当前机位模式；由 runtime 实现内部跟踪
  // （setMode 写入、启动默认 'perspective'）。用途：绘制工具进入时记录原机位、退出时
  // setMode(原模式) 恢复（setMode 语义 = 保持观察距离与目标的预设方位角，不承诺任意自由姿态快照）。
  // 注：T3.2 曾驳回同名提案（当时无任务书诉求）；本轮体验收编诉求成立，用户拍板批准。
  setMode(mode: 'perspective' | 'top' | 'front' | 'side'): void;
  setOrthoLock(locked: boolean): void;               // 绘制模式限制旋转
  focusObjects(ids: ID[]): void; focusAll(): void;
}
export interface PreviewPort {                        // 临时预览，不入 Scene、不入历史
  showGhost(assetId: ID, t: Transform): void; updateGhost(t: Transform): void; hideGhost(): void;
  updateDrawPreview(state: DrawPreviewState): void; clear(): void;
}
export interface DrawPreviewState { geometryType: GeometryType; points: Vec2[]; cursor: Vec2 | null; closed: boolean }
export interface GizmoPort {
  attach(ids: ID[]): void; detach(): void;
  setMode(mode: 'translate' | 'rotate' | 'scale'): void;
  /** 代理重同步（T8.6 缺陷①，契约第十次修订）：attach 为一次性快照，undo/redo/贴地/
   *  阵列等命令路径改场景 transform 后由 TransformTool 经 scene:changed 触发重读写回；
   *  拖拽会话中实现方自守卫无操作（防自反馈），未挂载无操作 */
  resync(): void;
  /** 拖拽结束回调（一次性 before/after），由 TransformTool 转成 TransformCommand */
  onDragEnd(cb: (info: { objectId: ID; before: Transform; after: Transform }) => void): void;
}
// VertexEditPort（阶段 6 T6.8 顶点编辑跨层通路，模式沿 GizmoPort 先例）与 VertexEditSessionPort
// （编辑会话控制四方法，通路必要组成）定义在分域契约 contracts/stage6-region.md §C——
// 本文件仅留指针注记，不重复定义（2026-09-11 阶段 6 审计增补；SessionPort 2026-09-12
// T6.8 按需门暂裁并入、待用户追认，见决策日志）。
// MeasurePort（阶段 10 测量覆盖层：updateDraft/updateMeasurements/clear；runtime 实现
// MeasureOverlay，模式沿 PreviewPort 先例）定义在分域契约 contracts/stage10-measure.md §B——
// 同上仅留指针注记（2026-09-15 第十一次修订）。

// ── editor/commands ────────────────────────────────────────
export interface CommandContext { sceneManager: SceneManager; selection: SelectionManager; eventBus: EventBus }
export interface Command {
  readonly id: ID; readonly name: string;
  execute(ctx: CommandContext): boolean;
  undo(ctx: CommandContext): void; redo(ctx: CommandContext): void;
  canExecute(): boolean;
}
export class HistoryManager {
  constructor(ctx: CommandContext, opts?: { mergeBatch?: boolean });
  execute(cmd: Command): boolean;    // 成功入栈并清空 redo 栈
  undo(): boolean; redo(): boolean;
  canUndo(): boolean; canRedo(): boolean; clear(): void;   // 变更 emit history:changed
}
// 基础命令（每个单独文件）：CreateObjectCommand / DeleteObjectCommand / TransformCommand /
// ChangePropertyCommand / ChangeStyleCommand / ChangeGeometryCommand / ChangeLayerCommand / BatchCommand
// 增补注记（2026-09-09，T2.4）：另含 UpdateObjectCommand（对象通用键更新）/ UpdateLayerCommand（图层
// name/visible/locked/opacity/order）——与 ChangePropertyCommand（属性面板专用键值）/ ChangeLayerCommand
// （对象→图层归属迁移）并存，语义不重叠
// 增补注记（2026-09-13，T7.6）：另含 SplitRoadCommand / MergeRoadCommand（道路 line region 在节点处
// 一分为二 / 两条邻接拼接为一条；shape 级几何命令，单命令单历史——BatchCommand 语义不适用）
// 退役注记（2026-09-11 阶段 6 审查）：ChangeGeometryCommand / ChangeStyleCommand（v1 Element 语义）
// 随 T6.7 旧要素删除退役；阶段 6 对应命令 ChangeShape/ChangeSemantic/ChangePreset 及过渡期并存/
// 派发/退役对照见 contracts/stage6-region.md §D。

// ── editor/tools ───────────────────────────────────────────
export interface ToolContext {
  sceneManager: SceneManager; selection: SelectionManager; history: HistoryManager;
  registries: { assets: AssetRegistry };   // T6.9 收窄：v1 elements/styles 注册表已删除，工具仅消费资产注册表
  viewport: ViewportPort; camera: CameraPort; preview: PreviewPort; eventBus: EventBus;
}
export interface Tool {
  readonly id: string; readonly name: string;
  activate(ctx: ToolContext, params?: unknown): void;
  deactivate(): void;
  onPointerDown(e: PointerEventInfo): void; onPointerMove(e: PointerEventInfo): void; onPointerUp(e: PointerEventInfo): void;
  onDoubleClick?(e: PointerEventInfo): void; onKeyDown?(e: KeyboardEventInfo): void; onWheel?(delta: number): void;
  cancel(): void;   // ESC / 右键：清理临时状态，不产生任何 Command
}
export class ToolManager { register(t: Tool): void; activate(id: string, params?: unknown): void; deactivate(): void; getActiveTool(): Tool | null; cancel(): void } // 切换自动 deactivate 上一个，emit tool:changed

// ── io（T6.9 v2：场景格式 2.0 + 导入零注册表）──────────────
export interface ImportMapping {
  version: '2.0';
  rootArray: string;                 // 对象数组的 JSON Path，如 "data.buildings"
  semanticType: SemanticType;        // 十类语义（取代 v1 elementType），决定默认预设/图层/参数/baseHeight
  geometry: { path: string; format: 'xy-array' | 'xyz-array' | 'ring-array'; shape?: 'polygon' | 'line' | 'point' };
                                     // shape 显式覆写；缺省推断：ring-array→polygon、xy/xyz 单点→point、≥2 点→line
  fields: Record<string, string>;    // 目标 "name"→对象名，其余→semantic.properties（支持 "floors*3" 表达式）
  defaults: { presetId?: string; layerName?: string; [k: string]: unknown };
                                     // presetId 缺省=语义默认预设；layerName 缺省=语义默认图层（写 metadata.layerName）；其余键→semantic.properties 默认值
}
export interface ImportError { path: string; message: string }
export class SceneSerializer {
  serialize(data: SceneData): string;
  deserialize(json: string): SceneData;      // 版本门仅认 2.0（v1 拒读，错误含停止支持提示）+ 对象类型 fail-fast 校验（region/model/group、region 三层结构、枚举合法，路径化错误）；group 为 T8.5（2026-09-14）2.0 增量放行的纯组织节点——**版本号不变的前向兼容扩展**（免结构校验同 model，未知类型仍路径化报错）
}
export class JsonImporter { constructor(); parse(raw: unknown, mapping: ImportMapping): { objects: RegionObject[]; errors: ImportError[] } }
                                             // 零注册表依赖；宽限语义：NOT_CLOSED/顺时针修复收录、自相交/顶点不足/坐标非法排除；ring-array 多环取外环、内环丢弃记告警
export class SceneExporter { export(data: SceneData): string }

// ── editor/EditorFacade（app 组合根装配后交给 UI 的唯一门面）──
export interface EditorFacade {
  scene: SceneManager; selection: SelectionManager; history: HistoryManager; tools: ToolManager;
  registries: { assets: AssetRegistry; tools: ToolRegistry; commands: CommandRegistry;
                presets: StylePresetRegistry }; // 2026-09-12 T6.9：删 elements/styles 两字段（旧契约类型面删除）；presets 为 ui 读预设元数据唯一途径（分域 §B）
  openScene(data: SceneData): void;
  saveScene(): string;                     // serialize 当前 SceneData
  dispose(): void;
}
```

## 契约分域索引（按任务书「必读」节指定读取）

| 分域文件 | 内容 | 必读任务 |
|---|---|---|
| `contracts/stage6-region.md` | 阶段 6 目标契约：SemanticType 十类 / RegionObject 三层结构 / StylePresetMeta / StyleInstance / 引擎入口与材质纪律 | **T6.1–T6.10** |
| `contracts/stage10-measure.md` | 阶段 10 目标契约：会话态测量域（四类/四不变式）/ MeasurePort 与 surfacePoint / measure 事件 / 太阳位置纯函数与 sun 扩展键 / 场景统计聚合 | **T10.1–T10.5** |
| `contracts/legacy-elements.md` | v1 旧要素体系历史存档：StyleDefinition / resolveStyle / Element 及 Building/Road/Green/Water/Parking 形态（T6.7 数据删除、T6.9 契约类型面删除） | 纯历史参考，无必读任务 |

分域文件与基础契约同等权威；冲突时停下在报告中提出。新阶段可新增分域文件（如 stage7），须在本索引登记并记决策日志。

**契约变更规则：** 唯一预授权增补点——T3.2 为绘制状态栏在 EventMap 增加 `draw:status` 事件——已于 2026-09-09 落地（含 `DrawStatusPayload` 定义，决策日志留痕）；第二处增补——T4.1 为「退出绘制恢复原机位」在 CameraPort 增加 `getMode()`——已于 2026-09-10 经按需门用户批准落地；第三次修订——2026-09-11 阶段 6 设计门（形状驱动重构 grilling，用户逐题拍板）：排除项解禁两限一（Shader 样式/水面动画解禁、顶点编辑限 T6.8）、新增阶段 6 目标契约（现位于 contracts/stage6-region.md）、domain/elements 加退役注记（现位于 contracts/legacy-elements.md）；第四次修订——2026-09-11 按需读取重构（用户指示）：契约拆分为「基础（本文件）+ 分域（contracts/）」，本文件保留全任务必读部分并加分域索引；第五次修订——2026-09-11 阶段 6 审计第三轮整改（用户批准两处 EventMap 预授权增补）：EventMap 增加 `app:notify`（runtime→UI Toast 通道）、`DrawStatusPayload` 增加 `vertexCount`（绘制顶点计数），另分域契约 stage6-region.md §C 增补 VertexEditPort（定义在分域，本文件 editor/services 节仅留指针注记）；第六次修订——2026-09-12 T6.9 按需门（用户裁决 v1 旧数据兼容整体不做）：场景文件版本 2.0 接管（#9）、io 契约节重写（ImportMapping v2 / SceneSerializer 版本门+对象校验 / JsonImporter 零注册表产出 RegionObject）、registries 节删 ElementRegistry/StyleRegistry、ToolContext.registries 与 EditorFacade.registries 收窄、domain/styles 仅存 StyleParameter、ID 前缀移出 element_（决策日志留痕）；第七次修订——2026-09-12 T7.1 阶段门（用户逐题拍板）：明确排除项增补三则（面板 Docking 延后远期 / 建筑自动生成不做 / 道路偏移不做记观察项），无接口签名变更（决策日志留痕）；第八次修订——2026-09-14 T8.2 主代理预裁定（派发简报授权 + 验收落档）：ID 前缀清单增补 `tpl_`（用户模板 TemplatePayload id），无接口签名变更；第九次修订——2026-09-14 T8.5 主代理验收落档（阶段门 2026-09-13 预授权 + 任务书「契约修订（主代理权限内）」）：① ID 前缀清单增补 `group_`（组壳 GroupObject id）；② SceneObject.parentId 注记翻转（自 T8.5 承载真实层级，此前恒 null 保留字段）+ 同父兄弟顺序 = 数组内顺序语义 + 'group' 组壳语义注记（纯组织节点四不变式）；③ SceneManager 增补 `reorderObjects(orderedIds)` 契约方法（沿 addLayer 增补先例）；④ #9 场景文件版本补记 group 为 2.0 版本号不变的前向兼容增量放行。**第十次修订——2026-09-14 T8.6 缺陷①修复（threejs-expert 2cc6d7b，此处回溯补登：当时漏在本段登记，GizmoPort 注记已自记第十次）：GizmoPort 增补 `resync()`（attach 一次性快照后命令路径变更须重同步；拖拽中实现方自守卫）**。第十一次修订——2026-09-15 T10.1 阶段门（常设预授权自决，决策日志留痕）：① 排除项「测量标注」限定解禁（会话态四类测量，不入 JSON 不入历史；持久化与测量点吸附仍排除）；② EventMap 增补 `measure:status`/`measure:changed`（定义在分域 stage10 §B，本文件指针）；③ ViewportPort 增补 `surfacePoint()`（同上指针）；④ 新增 MeasurePort（editor/services 节指针注记）；⑤ ID 前缀清单增补 `measure_`（会话态注记）；⑥ 新增分域契约 contracts/stage10-measure.md 并入索引。除此之外任何任务发现需要改契约，必须停下来在报告中提出，由主代理决策。
