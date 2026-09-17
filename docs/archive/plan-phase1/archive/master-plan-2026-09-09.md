# 【已归档 · 非执行依据】

> 本文件为初版单文件主计划，2026-09-09 起已被状态外化计划体系取代：
> - 执行协议：docs/plan/PROTOCOL.md
> - 约束与契约：docs/plan/CONTRACTS.md
> - 进度真相源：docs/plan/STATUS.md
> - 任务书：docs/plan/tasks/T*.md
> 本文件仅作设计论证（需求覆盖矩阵、计划自查记录）存档。需求覆盖矩阵与排除项已并入 CONTRACTS.md。

---

# 三维园区可视化编辑器 · 实施主计划（编排型）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **编排说明：** 本计划是「编排型主计划」。模块级实现细节由两份随行文档承载，执行时必须一起读：
> - 需求与架构（Spec）：`三维园区可视化编辑器需求文档.md`（工作区根目录）
> - 模块级实现提示词：`各阶段提示词.txt`（工作区根目录）
>
> 每个任务标注「注入提示词」（对应提示词组）与「偏差与补充」（对提示词的修正指令，**以本计划为准**）。

**Goal:** 从零构建组件化三维园区编辑器：Scene 唯一数据源 + Command 全量可撤销 + 六层单向依赖架构，三阶段交付（①数据架构与样式系统 ②资产库与编辑交互 ③点线面绘制闭环）。

**Architecture:** 六层单向依赖（core → scene → domain → registries → editor / runtime / io，app 为组合根）。业务数据与 Three.js 渲染彻底分离；editor 通过 Port 接口（依赖倒置）使用 runtime 能力；一切可见修改经 Command 入 History。

**Tech Stack:** TypeScript (strict) + Vite + Three.js（仅 runtime/app）+ React + zustand（仅 ui）+ Vitest。**所有依赖一律安装 npm 最新稳定版并锁定**（版本快照见 T0.1）。Node ≥ 20。

**Spec:** `三维园区可视化编辑器需求文档.md`

---

## 执行协议（每个执行会话开始时必须完整阅读本节）

### 角色分工

| 角色 | 职责 |
|---|---|
| **主代理（编排者）** | 维护 todolist 与本计划状态表；派发任务子代理；每任务后运行守护检查（`npm test` / `npm run check:layers` / `npm run typecheck`）；执行浏览器 GUI 验收（browser-use 技能仅主代理可用，禁止下放子代理）；失败时派发修复子代理（同一任务最多 2 次，仍失败则标记 `blocked` 并向用户呈报）；批准任务完成并要求提交 |
| **任务子代理** | 每任务一个全新 general-purpose 子代理，只做本任务：读上下文 → TDD 实现 → 自测 → 提交 → 返回报告。禁止顺手改其他任务的文件 |
| **修复子代理** | 携带失败输出（测试日志 / 检查脚本输出 / 截图问题清单）的定向修复代理 |

### 任务状态机

`pending` → `in_progress` → `done`；异常：`blocked`（需用户决策）、`failed`（2 次修复未过）。
状态记录在两处，**每任务完成时必须同步更新**：
1. 本文档「任务状态总表」；
2. 当前会话 todolist（TodoWrite）。

### 子代理派发模板

```
你是执行任务 T{id} 的子代理。工作目录：D:\3D editor（Windows，Git Bash）。

必读（按序，读完再动手）：
1. docs/superpowers/plans/2026-09-09-3d-campus-editor.md 的「全局约束」「接口契约」两节 + 本任务小节
2. 三维园区可视化编辑器需求文档.md 中任务标注的章节
3. 各阶段提示词.txt 第{N}组（注入提示词）
4. 任务 Files 列出的既有源码

硬性要求：
- TDD：先写失败测试 → 运行确认失败 → 最小实现 → 通过
- 严格遵守分层 DAG 与 three 导入白名单（见全局约束），禁止越层
- {本任务为 UI 任务时追加}：先完整阅读 C:\Users\admin\.agents\skills\frontend-design\SKILL.md 并遵循其准则与本计划「UI 任务设计规则」
- 完成后依次运行：npm test、npm run check:layers、npm run typecheck，全绿才算完成
- 更新计划文档中本任务 checkbox 与「任务状态总表」行（状态 done + 日期）
- git add 相关文件并 commit，提交信息用任务给定的信息
- 返回报告：变更文件清单 / 测试结果摘要 / 与注入提示词的偏差及原因
```

### 守护检查（任何任务完成的定义）

```bash
npm test                 # 全部通过
npm run check:layers     # 无越层导入、three 白名单无违规
npm run typecheck        # tsc --noEmit 无错误
```

里程碑任务（T1.9 / T2.5 / T3.4）额外由主代理做浏览器验收（启动 `npm run dev`，按任务验收清单用 browser-use 实操 + 截图审查）。

### UI 任务设计规则（硬性要求）

- **所有涉及 `.tsx` / 样式产出的任务（T1.8、T2.1、T2.4、T3.3）**：执行代理必须先完整阅读 frontend-design 技能（`C:\Users\admin\.agents\skills\frontend-design\SKILL.md`）并遵循其设计准则——确立鲜明美学方向、拒绝通用 AI 风格（禁 Inter/Roboto/system 字体、紫色渐变等）、CSS 变量管理主题、注重排版与微交互。
- **T1.8 是设计系统奠基任务**：在该任务中用 frontend-design 技能确定整个编辑器的美学方向（建议方向：专业三维工具的暗色工作台风格，密度高、层级清晰、单一强调色——最终由执行时按技能准则定夺），产出 `src/ui/styles/tokens.css`（色板/字体/间距/圆角/阴影变量）与 `src/ui/styles/DESIGN.md`（设计方向说明，供后续任务遵循）。
- **后续 UI 任务禁止另起炉灶**：一律复用 tokens.css 与 DESIGN.md 的既定语言，保证全编辑器视觉一致性；新增面板若引入新视觉元素，需在 DESIGN.md 补记。

---

## 全局约束

1. **分层 DAG（导入方向强制）：**
   `core` ← `scene` ← `domain` ← `registries` ← (`editor` | `runtime` | `io`) ← `ui` ← `app`
   即：core 不依赖任何层；scene→core；domain→core,scene；registries→core,scene,domain；editor/runtime/io→core,scene,domain,registries；ui→core,scene,domain,registries,editor（**禁止导入 runtime/io**）；app（组合根 `src/app/`、入口 `src/main.tsx`）可导入一切。
2. **three 导入白名单：** `three` 及 `three/examples/*` 只允许出现在 `src/runtime/**` 与 `src/app/**`；由 `scripts/check-layer-deps.mjs` 强制。
3. **Scene 唯一数据源：** 业务层禁止把 THREE.Mesh 当业务对象；运行时只读 Scene，反向修改一律走 Command → SceneManager。`userData` 只存 `objectId` 映射辅助。
4. **一切可见修改经 Command**，命令保存 before/after；批量操作用 BatchCommand 合并为一条历史。
5. **Domain 零渲染：** `src/domain/**`、`src/scene/**`、`src/registries/**`、`src/editor/**`、`src/io/**` 中禁止出现任何 `THREE` 类型或导入。editor 需要渲染能力时通过本计划「接口契约」中的 Port 接口（依赖倒置，runtime 实现、app 注入）。
6. **注册制扩展：** 新要素/样式/资产/工具/命令一律 Registry 注册接入；业务代码禁止 `if (type === 'building')` 式散落判断。
7. **ID 前缀：** `scene_ / element_ / layer_ / style_ / asset_ / model_ / cmd_ / tool_`（`createId(prefix)` 生成）。
8. **坐标约定：** 编辑器内部世界坐标，Y 向上，地面为 XZ 平面（y=0）；业务几何 Vec2 = (x, z)；rotation 用弧度 Euler。
9. **场景文件版本：** `"version": "1.0"`；SceneSerializer 做版本校验与向后兼容读取。
10. **TDD + 频繁提交：** 每任务内先测后码；每任务至少一个 commit（conventional commits：`feat(scope): …` / `test(scope): …` / `chore: …`）。
11. **UI 边界：** React 组件只调用 editor 层门面（`EditorFacade`）与订阅 EventBus→zustand store；禁止直接操作 THREE.Object3D 或 DOM 之外绕过 store 改状态。

### 目录结构（最终形态）

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
├── docs/superpowers/plans/…      # 本计划
├── 三维园区可视化编辑器需求文档.md
├── 各阶段提示词.txt
└── src/
    ├── core/        # id / events / math / types / utils
    ├── scene/       # SceneManager / SelectionManager / 数据接口
    ├── domain/      # geometry / elements / styles / assets / validate
    ├── registries/  # element / style / asset / tool / command
    ├── editor/      # commands / history / tools / services(Port) / EditorFacade
    ├── runtime/     # renderer / adapters / renderers / loaders / preview / gizmo / instancing
    ├── io/          # serializer / importer / exporter
    ├── ui/          # React：viewport / toolbar / panels / store(Ev entBus 桥)
    └── app/         # bootstrap 组合根
```

---

## 接口契约（跨任务一致性基准；签名以本节为准，任务内不得擅改）

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
}
export class EventBus {
  on<K extends keyof EventMap>(type: K, fn: (p: EventMap[K]) => void): () => void;
  off<K extends keyof EventMap>(type: K, fn: (p: EventMap[K]) => void): void;
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void;
}

// ── scene ──────────────────────────────────────────────────
export interface SceneObject {
  id: ID; type: string; name: string;
  parentId: ID | null; layerId: ID | null;
  visible: boolean; locked: boolean;
  transform: Transform;
  properties: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
export interface Layer { id: ID; name: string; visible: boolean; locked: boolean; opacity: number; order: number; objectIds: ID[] }
export interface SceneEnvironment { preset: string; [k: string]: unknown }
export interface SceneData { version: '1.0'; id: ID; name: string; environment: SceneEnvironment; layers: Layer[]; objects: SceneObject[] }

export class SceneManager {          // 只增删改查，不校验、不计算、不发命令
  constructor(eventBus: EventBus);
  getObject(id: ID): SceneObject | undefined;
  addObject(obj: SceneObject): void;                 // emit object:created + scene:changed
  removeObject(id: ID): SceneObject | undefined;     // emit object:removed + scene:changed
  updateObject<K extends keyof SceneObject>(id: ID, patch: Partial<SceneObject>): void; // emit object:updated
  getObjects(pred?: (o: SceneObject) => boolean): SceneObject[];
  getLayer(id: ID): Layer | undefined; getLayers(): Layer[];
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

// ── domain/styles ──────────────────────────────────────────
export interface StyleReference { styleId: ID; overrides?: Record<string, string | number | boolean> }
export type StyleParameterType = 'color' | 'number' | 'boolean' | 'select';
export interface StyleParameter {
  key: string; label: string; type: StyleParameterType; default: string | number | boolean;
  min?: number; max?: number; step?: number; options?: { value: string | number; label: string }[];
}
export interface MaterialSpec {
  color?: string; opacity?: number; emissive?: string; emissiveIntensity?: number;
  metalness?: number; roughness?: number; flatShading?: boolean; doubleSide?: boolean; wireframe?: boolean;
}
export interface StyleDefinition { id: ID; name: string; elementType: string; parameters: StyleParameter[]; material: MaterialSpec }
/** 三级优先级合成：全局预设 < 图层覆盖 < 对象 overrides */
export function resolveStyle(def: StyleDefinition, layerOverrides?: Record<string, unknown>, objectOverrides?: Record<string, unknown>): ResolvedStyle;

// ── domain/elements ────────────────────────────────────────
export interface Element extends SceneObject { geometry: GeometryData; style: StyleReference }
export interface BuildingProperties { height: number; baseHeight: number; floors: number }
export interface BuildingElement extends Element { type: 'building'; properties: BuildingProperties }
export interface RoadProperties { mode: 'centerline' | 'polygon'; width: number }
export interface RoadElement extends Element { type: 'road'; properties: RoadProperties }
export interface GreenElement  extends Element { type: 'green' }
export interface WaterElement  extends Element { type: 'water' }
export interface ParkingElement extends Element { type: 'parking' }

// ── domain/assets ──────────────────────────────────────────
export interface ModelAsset {
  id: ID; name: string; category: string; file: string; thumbnail?: string;
  tags: string[]; defaultScale: Vec3; defaultRotation: Euler; metadata?: Record<string, unknown>;
}
export interface AssetReference { assetId: ID }
export interface ModelObject extends SceneObject { asset: AssetReference }

// ── domain/validate ────────────────────────────────────────
export interface ValidationResult { valid: boolean; errors: ValidationError[]; autoFixed: boolean }
export interface ValidationError { code: 'SELF_INTERSECT' | 'TOO_FEW_VERTICES' | 'INVALID_COORD' | 'NOT_CLOSED'; message: string; index?: number }
export function validateGeometry(geometry: GeometryData): ValidationResult;   // 自相交/最少顶点/坐标非法；顶点顺序自动修复

// ── registries ─────────────────────────────────────────────
export interface ElementDefinition<T extends Element = Element> {
  type: string; label: string; geometryTypes: GeometryType[];
  createDefault(init?: { geometry?: GeometryData; layerId?: ID; name?: string }): T;
  validate(element: T): ValidationResult;
  serialize(element: T): unknown; deserialize(data: unknown): T;
}
export class ElementRegistry { register(def): void; unregister(type: string): void; get(type: string): ElementDefinition | undefined; has(type: string): boolean; list(): ElementDefinition[]; create(type: string, init?): Element }
export class StyleRegistry    { register(s: StyleDefinition): void; unregister(id: ID): void; get(id: ID): StyleDefinition | undefined; list(): StyleDefinition[]; findByType(elementType: string): StyleDefinition[] }
export class AssetRegistry    { register(a: ModelAsset): void; unregister(id: ID): void; get(id: ID): ModelAsset | undefined; list(): ModelAsset[]; findByCategory(c: string): ModelAsset[]; search(q: string): ModelAsset[] }
export class ToolRegistry     { register(t: Tool): void; unregister(id: string): void; get(id: string): Tool | undefined; list(): Tool[] }
export class CommandRegistry  { register(type: string, factory: (data: any) => Command): void; create(type: string, data: any): Command }

// ── editor/services（Port 接口，runtime 实现，app 注入）─────
export interface PointerEventInfo { screenX: number; screenY: number; button: 'left' | 'right' | 'middle'; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }
export interface KeyboardEventInfo { key: string; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }
export interface ViewportPort {
  pickObject(x: number, y: number): ID | null;      // 射线拾取 → objectId
  groundPoint(x: number, y: number): Vec3 | null;   // Raycast → Ground 平面世界坐标
}
export interface CameraPort {
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
  /** 拖拽结束回调（一次性 before/after），由 TransformTool 转成 TransformCommand */
  onDragEnd(cb: (info: { objectId: ID; before: Transform; after: Transform }) => void): void;
}

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

// ── editor/tools ───────────────────────────────────────────
export interface ToolContext {
  sceneManager: SceneManager; selection: SelectionManager; history: HistoryManager;
  registries: { elements: ElementRegistry; styles: StyleRegistry; assets: AssetRegistry };
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

// ── io ─────────────────────────────────────────────────────
export interface ImportMapping {
  version: string;
  rootArray: string;                 // 对象数组的 JSON Path，如 "data.buildings"
  elementType: string;               // 如 "building"
  geometry: { path: string; format: 'xy-array' | 'xyz-array' | 'ring-array'; };
  fields: Record<string, string>;    // 属性映射：目标属性 <- 源字段路径（支持 "floors*3" 表达式）
  defaults: { styleId?: ID; layerName?: string; [k: string]: unknown };
}
export interface ImportError { path: string; message: string }
export class SceneSerializer {
  serialize(data: SceneData): string;
  deserialize(json: string): SceneData;      // 版本校验，不识别的版本抛带版本号的错误
}
export class JsonImporter { parse(raw: unknown, mapping: ImportMapping): { objects: Element[]; errors: ImportError[] } }
export class SceneExporter { export(data: SceneData): string }

// ── editor/EditorFacade（app 组合根装配后交给 UI 的唯一门面）──
export interface EditorFacade {
  scene: SceneManager; selection: SelectionManager; history: HistoryManager; tools: ToolManager;
  registries: { elements: ElementRegistry; styles: StyleRegistry; assets: AssetRegistry; tools: ToolRegistry; commands: CommandRegistry };
  openScene(data: SceneData): void;
  saveScene(): string;                     // serialize 当前 SceneData
  dispose(): void;
}
```

---

## 任务状态总表（每任务完成时由执行方同步更新）

| ID | 任务 | 阶段 | 注入提示词 | 状态 | 完成日期 | 备注 |
|---|---|---|---|---|---|---|
| T0.1 | 工程脚手架与守护设施 | 0 | 组1（改造） | pending | | |
| T1.1 | core 层基础能力 | 1 | 组1 | pending | | |
| T1.2 | scene + domain 纯数据模型 | 1 | 组2 | pending | | |
| T1.3 | Registry 注册体系 | 1 | 组3（修正） | pending | | |
| T1.4 | runtime 渲染适配层 | 1 | 组4（补充） | pending | | |
| T1.5 | Command 命令与 History | 1 | 组5 | pending | | |
| T1.6 | Tool 工具系统 + Preview | 1 | 组6（修正） | pending | | |
| T1.7 | IO 序列化与配置化导入 | 1 | 组7 | pending | | |
| T1.8 | 占位资产 + 阶段一闭环装配与最小 UI | 1 | 组8 + 组9部分 | pending | | |
| T1.9 | 阶段一 GUI 验收（主代理） | 1 | — | pending | | |
| T2.1 | 资产清单与缩略图 | 2 | 组9-1 | pending | | |
| T2.2 | PlacementTool 放置增强 | 2 | 组9-2 | pending | | |
| T2.3 | InstancedMesh 渲染优化 | 2 | 组9-3 | pending | | |
| T2.4 | Gizmo / 属性面板 / 图层与场景树 UI | 2 | 组9-4 + 需求§功能 | pending | | |
| T2.5 | 阶段二 GUI 验收（主代理） | 2 | — | pending | | |
| T3.1 | DrawSession 与几何校验 | 3 | 组10-1 | pending | | |
| T3.2 | 三绘制工具与绘制辅助 | 3 | 组10-2/3 | pending | | |
| T3.3 | 绘制模式 UI 与流程串联 | 3 | 组10-4 | pending | | |
| T3.4 | 阶段三 GUI 验收 + 全量回归（主代理） | 3 | — | pending | | |

---

## 阶段 0：工程引导

### Task T0.1：工程脚手架与守护设施

**注入提示词：** 第 1 组，但按本节偏差执行。
**偏差与补充：**
- 提示词「不做 UI、纯 TS」在本任务仅指**不写功能 UI**；仍需 Vite + React 壳，因为后续里程碑要浏览器验收。占位页不需要设计投入（纯空 div），UI 设计系统在 T1.8 用 frontend-design 技能确立。
- 本任务不实现 core 逻辑（那是 T1.1），只搭骨架 + 守护脚本，`src/` 各层先放 `index.ts` 占位导出。

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`（渲染空视口占位 div）
- Create: `scripts/check-layer-deps.mjs`
- Create: `src/{core,scene,domain,registries,editor,runtime,io,ui,app}/index.ts`（空占位）
- Create: `.gitignore`（node_modules/dist/.vite）、`README.md`（运行方式）

**Interfaces（Produces，后续所有任务依赖）:**
- npm scripts：`dev` / `build` / `preview` / `test`(vitest run) / `test:watch` / `typecheck`(tsc --noEmit) / `check:layers`
- `scripts/check-layer-deps.mjs`：扫描 `src/**/*.{ts,tsx}` 的 import 声明，按全局约束 DAG 校验层间依赖与 `three` 白名单（three 仅 `src/runtime/**`、`src/app/**`、`src/main.tsx`）；违规时输出 `文件 -> 违规导入 -> 原因` 并 exit 1。测试导入（`tests/**`）不受 DAG 限制但受 three 白名单限制（runtime 单测允许 three）。
- 依赖版本策略：**安装时一律取 npm 最新稳定版（`npm install <pkg>@latest`）并提交 lockfile**，禁止使用落后于快照的旧版本。2026-09 快照（`npm view` 实测）：`typescript 7.0.2`、`vite 8.2.2`、`vitest 5.0.0`、`react 19.2.8`、`three 0.186.0`、`zustand 5.0.15`、`@testing-library/react 16.3.3`、`@types/three 0.185.4`（取最新，允许与 three 小版本错位）、`@types/react 19.2.18`。若某依赖的最新版与工具链不兼容（如 TS7 与某插件），回退到最近可用大版本并在任务备注记录原因。

**验收标准:**
- `npm run dev` 启动并显示占位页面；`npm test`（0 个测试时通过）、`npm run typecheck`、`npm run check:layers` 全绿。
- 故意在某层写入越层导入时 `check:layers` 能报错（自测后移除）。

**Steps:**
- [ ] 1. 初始化 package.json / 安装依赖 / 五个配置文件；git 已在（T0.1 前主代理已 init）
- [ ] 2. 编写 `scripts/check-layer-deps.mjs`（用正则解析 `from '...'` / `import '...'` 即可，无需 AST 依赖）
- [ ] 3. 写一个临时越层导入验证脚本生效，然后删除临时代码
- [ ] 4. 运行四条守护命令全绿
- [ ] 5. 更新状态总表 + commit：`chore: scaffold vite+ts+react project with layer guard`

---

## 阶段 1：核心骨架与样式系统（需求文档·阶段一）

### Task T1.1：core 层基础能力

**注入提示词：** 第 1 组（core 部分）。
**偏差与补充：** EventBus 用类型化 EventMap（见接口契约），不是松散 string；math 工具含 Vec2 距离/线段长度/多边形面积（绘制辅助与校验都依赖，必须此刻就有）。

**Files:**
- Create: `src/core/types/index.ts`（ID/Vec2/Vec3/Euler/Transform + 类型守卫 isVec2 等）
- Create: `src/core/id/index.ts`（createId）
- Create: `src/core/events/EventBus.ts` + `events.ts`（EventMap）
- Create: `src/core/math/index.ts`（dist2 / polylineLength / polygonArea / pointToSegmentDistance / segmentsIntersect）
- Create: `src/core/utils/index.ts`（deepClone（结构化克隆语义）、clamp、degToRad）
- Test: `tests/core/*.test.ts`

**Interfaces（Produces）:** 见「接口契约」core 部分；另 `segmentsIntersect(a1,a2,b1,b2): boolean`、`polygonArea(ring: Vec2[]): number`（T3.1 依赖）。

**验收标准:**
- createId 前缀与唯一性（连发 1000 次无碰撞）；EventBus on/off/emit 类型化且 off 后不再收；polygonArea 单位正方形=1；deepClone 修改副本不影响原对象。
- 守护三连全绿。

**Steps:**
- [ ] 1. 为 id/events/math/utils 写失败测试（用例：唯一性、事件订阅退订、面积/距离计算、克隆隔离）
- [ ] 2. `npx vitest run tests/core` 确认失败
- [ ] 3. 实现并通过
- [ ] 4. 守护三连 + 更新状态 + commit：`feat(core): id, typed event bus, math and utils`

### Task T1.2：scene + domain 纯数据模型

**需求文档对照：** §核心数据模型全部、§分层边界规则 1/3。
**注入提示词：** 第 2 组。
**偏差与补充：** SelectionManager 放 `src/scene/`（提示词允许）；domain 增加 `validateGeometry`（提示词未列，T3.1 前置到此处保证 domain 自足）；environment 用 `SceneEnvironment`（preset + 开放字段）。

**Files:**
- Create: `src/scene/{SceneObject.ts,Layer.ts,SceneData.ts,SceneManager.ts,SelectionManager.ts,index.ts}`
- Create: `src/domain/geometry/{GeometryData.ts,index.ts}`
- Create: `src/domain/elements/{Element.ts,BuildingElement.ts,RoadElement.ts,GreenElement.ts,WaterElement.ts,ParkingElement.ts,index.ts}`
- Create: `src/domain/styles/{StyleDefinition.ts,StyleReference.ts,resolveStyle.ts,index.ts}`
- Create: `src/domain/assets/{ModelAsset.ts,AssetReference.ts,ModelObject.ts,index.ts}`
- Create: `src/domain/validate/validateGeometry.ts`
- Test: `tests/scene/*.test.ts`、`tests/domain/*.test.ts`

**Interfaces:** 见「接口契约」scene / domain 部分。

**验收标准:**
- SceneManager 增删改查触发对应事件且 `scene:changed` 恰好一次/操作；updateObject 不允许改 id（抛错）。
- validateGeometry：三角形通过；<3 顶点 Polygon 报 TOO_FEW_VERTICES；自相交八字形报 SELF_INTERSECT；环形顺序为顺时针时自动反转并 `autoFixed=true`。
- resolveStyle：对象覆盖 > 图层覆盖 > 预设默认，参数越界取 min/max 钳制。
- domain/scene 源码无 THREE 痕迹（check:layers 保证）。

**Steps:**
- [ ] 1. 失败测试：SceneManager/SelectionManager 行为 + 事件断言
- [ ] 2. 失败测试：validateGeometry 四类用例、resolveStyle 三级优先级
- [ ] 3. 运行确认失败 → 实现全部接口与类 → 通过
- [ ] 4. 守护三连 + 更新状态 + commit：`feat(scene,domain): pure data models, validation and style resolution`

### Task T1.3：Registry 注册体系

**需求文档对照：** §八大核心概念 Registry、§扩展性。
**注入提示词：** 第 3 组。
**偏差与补充（重要）：** 提示词的 `ElementDefinition.createRenderer` 违反「Domain 不碰渲染」（分层规则 3），**移除**；渲染器由 runtime 侧 `RendererRegistry`（T1.4）按 elementType 注册。其余按提示词。

**Files:**
- Create: `src/registries/{ElementRegistry.ts,StyleRegistry.ts,AssetRegistry.ts,ToolRegistry.ts,CommandRegistry.ts,index.ts}`
- Create: `src/registries/definitions/building.ts`（BuildingDefinition 注册示例，含 createDefault 返回默认 BuildingElement——默认高度 10、style 指向 style_building_default）
- Test: `tests/registries/*.test.ts`

**Interfaces:** 见「接口契约」registries 部分。

**验收标准:**
- register 后 get/has/list/findByType/search 正确；unregister 后再 get 返回 undefined；重复注册同 type 抛错。
- `ElementRegistry.create('building', { geometry })` 返回带 `element_` 前缀 ID、几何、默认样式的 BuildingElement。
- 注册 5 类要素定义（building/road/green/water/parking）+ 每类要素 2–5 套预设样式（建筑 5 套：默认/现代/玻璃/科技/夜景；道路 4；绿地 3；水面 3；停车场 2，参数按需求文档表格）——样式定义文件放 `src/registries/definitions/styles.ts`。

**Steps:**
- [ ] 1. 失败测试：五个 Registry 的注册/查询/注销/重复注册/搜索
- [ ] 2. 失败测试：building createDefault 内容
- [ ] 3. 实现通过；编写全部预设样式与要素定义注册示例
- [ ] 4. 守护三连 + 更新状态 + commit：`feat(registries): five registries with element/style preset definitions`

### Task T1.4：runtime 渲染适配层

**需求文档对照：** §分层边界规则 2/3/5/6、§非功能性能。
**注入提示词：** 第 4 组。
**偏差与补充：**
- 提示词要求 AssetLoader 支持 InstancedMesh —— InstancedMesh 完整优化在 T2.3，本任务仅做「同 assetId 缓存共享 geometry/material，多实例 clone Group」。
- 额外实现接口契约中的 `ViewportPort / CameraPort / PreviewPort` 运行时实现类（`RuntimeViewport / CameraController / PreviewManager`），供 T1.6 注入。
- `MaterialFactory`：`StyleDefinition + ResolvedStyle → THREE.MeshStandardMaterial`（color/opacity/emissive/metalness/roughness/flatShading/doubleSide/wireframe 全参数映射）。
- 新建场景默认环境：天空渐变（大球体 shader 或 hemisphere）+ 无限地面（大平面 + 网格辅助线）+ 平行光带阴影 + 环境光。

**Files:**
- Create: `src/runtime/{RuntimeObjectMap.ts,ObjectAdapter.ts,Renderer.ts,MaterialFactory.ts}`
- Create: `src/runtime/renderers/{ElementRenderer.ts,BuildingRenderer.ts,GreenRenderer.ts,WaterRenderer.ts,RoadRenderer.ts,RendererRegistry.ts}`
- Create: `src/runtime/loaders/AssetLoader.ts`
- Create: `src/runtime/services/{RuntimeViewport.ts,CameraController.ts,PreviewManager.ts}`
- Modify: `src/App.tsx`（挂最小视口：Renderer 初始化 + 渲染循环 + resize）
- Test: `tests/runtime/{RuntimeObjectMap.test.ts,MaterialFactory.test.ts}`（three 对象可在 node 下构造，不依赖 WebGL）

**Interfaces（Produces）:**
- `Renderer { constructor(canvas)；attach(obj: SceneObject)；update(id: ID, keys?)；detach(id)；renderLoop()；syncAll(sceneData) }`——监听 EventBus 的 object:* 事件驱动 update。
- `RendererRegistry { register(elementType, renderer: ElementRenderer)；get(elementType) }`。
- RuntimeViewport/CameraController/PreviewManager 实现对应 Port。

**验收标准:**
- RuntimeObjectMap 双向查找（id→Object3D、Object3D.userData.objectId→id）。
- BuildingRenderer：单位正方形 Polygon + height=10 → ExtrudeGeometry，包围盒 Y 范围 [0,10]；换 StyleDefinition 后仅 material 引用变化，geometry 对象不变（断言同一引用）。
- MaterialFactory：opacity<1 时 transparent=true；emissive 映射正确。
- 浏览器冒烟（主代理可选）：dev 页面显示天空/地面/灯光。

**Steps:**
- [ ] 1. 失败测试：RuntimeObjectMap / MaterialFactory / BuildingRenderer 几何不变性
- [ ] 2. 实现 runtime 全部文件 + App 最小视口
- [ ] 3. 守护三连（重点 check:layers：three 只在 runtime/app）+ 更新状态 + commit：`feat(runtime): three adapters, renderers, ports implementation`

### Task T1.5：Command 命令与 History

**需求文档对照：** §Command 与 History（含批量）、§撤销重做。
**注入提示词：** 第 5 组。
**偏差与补充：** 无实质偏差；补充——命令执行成功后除具体事件外统一 emit `scene:changed`（source=命令名）；HistoryManager 每次栈变更 emit `history:changed`。

**Files:**
- Create: `src/editor/commands/{Command.ts,CommandContext.ts,CreateObjectCommand.ts,DeleteObjectCommand.ts,TransformCommand.ts,ChangePropertyCommand.ts,ChangeStyleCommand.ts,ChangeGeometryCommand.ts,ChangeLayerCommand.ts,BatchCommand.ts,index.ts}`
- Create: `src/editor/history/HistoryManager.ts`
- Test: `tests/editor/{commands.test.ts,history.test.ts,batch.test.ts}`

**Interfaces:** 见「接口契约」commands 部分。

**验收标准:**
- 每条命令 execute→场景生效→undo→完全回到 before→redo→after（含对象删除恢复后 id 不变、transform 逐字段比对）。
- execute 返回 false 时（对象不存在等）不入栈。
- BatchCommand：3 个 CreateObject 一次 undo 全消失、一次 redo 全恢复；execute 半路失败则回滚已执行子命令。
- HistoryManager：undo 栈空时 undo() 返回 false；execute 清空 redo 栈；history:changed 事件参数正确。

**Steps:**
- [ ] 1. 失败测试：8 类命令的 execute/undo/redo 往返一致性（每命令至少 2 用例）
- [ ] 2. 失败测试：HistoryManager 栈行为 + BatchCommand 原子性
- [ ] 3. 实现通过
- [ ] 4. 守护三连 + 更新状态 + commit：`feat(editor): command system with batch and history manager`

### Task T1.6：Tool 工具系统 + Preview 隔离

**需求文档对照：** §八大核心概念 Tool、§分层边界规则 4/5。
**注入提示词：** 第 6 组。
**偏差与补充（重要）：**
- 提示词 ToolContext 直接含 renderer —— 会造成 editor→runtime 反向依赖，违反 DAG。改为接口契约的 Port 注入方案；DOM 指针事件由 app 层（`src/app/input.ts`）归一化为 `PointerEventInfo` 后转发 ToolManager。
- TransformTool 本任务仅留桩（activate 时经 GizmoPort attach——Gizmo 实现 T2.4 才有），完整交互在 T2.4；本任务验收聚焦 SelectTool 与 PlacementTool。
- PlacementTool 一期参数：`{ assetId, continuous: true, randomRotation?: [min,max], randomScale?: [min,max] }`；左键放置（CreateObjectCommand）、右键/ESC 退出且已放置对象保留；Ghost 经 PreviewPort，不进 SceneManager。

**Files:**
- Create: `src/editor/services/{ports.ts,PointerEventInfo.ts}`（Port 接口定义，纯 TS）
- Create: `src/editor/tools/{Tool.ts,ToolManager.ts,SelectTool.ts,TransformTool.ts,PlacementTool.ts,index.ts}`
- Create: `src/app/input.ts`（DOM→PointerEventInfo→ToolManager 接线；W/E/R、Ctrl+Z/Y、Ctrl+Shift+Z、Delete、ESC 全局快捷键表）
- Test: `tests/editor/{ToolManager.test.ts,SelectTool.test.ts,PlacementTool.test.ts}`（用 Fake Port：假 viewport 返回预置拾取/地面坐标）

**Interfaces:** 见「接口契约」tools / ports 部分。

**验收标准:**
- ToolManager：activate 自动 deactivate 上一工具并 emit tool:changed；同一时刻仅一个激活。
- SelectTool：点击命中→select；shift 点击→add/remove 切换；点空处→clear。
- PlacementTool：FakePort 下模拟移动+左键×3 → 场景 3 个 ModelObject、Ghost 从未进入 SceneManager、历史 3 条（合并策略 T2.2 再开）；右键退出后 activeTool=null；随机旋转/缩放值落在配置区间。
- 工具代码零 `three` 导入、零直接 SceneManager 写入（写操作只见 CreateObjectCommand）。

**Steps:**
- [ ] 1. 失败测试：ToolManager 互斥 / SelectTool 选择逻辑 / PlacementTool 连续放置与退出（Fake ports）
- [ ] 2. 实现工具系统与 app 输入接线
- [ ] 3. 守护三连 + 更新状态 + commit：`feat(editor): tool system with ports, select and placement tools`

### Task T1.7：IO 序列化与配置化导入

**需求文档对照：** §数据导入（JSON 配置化映射）、§数据校验。
**注入提示词：** 第 7 组。
**偏差与补充：** 无实质偏差。补充：导入产物先过 `validateGeometry` 与 ElementDefinition.validate，非法对象进 errors 不入 objects；提供 `assets/mappings/building.example.json` 示例映射与 `tests/io/fixtures/buildings.sample.json` 示例数据（字段结构与映射严格对应，含 floors 字段供表达式映射演示）。

**Files:**
- Create: `src/io/{SceneSerializer.ts,JsonImporter.ts,SceneExporter.ts,index.ts}`
- Create: `assets/mappings/building.example.json`、`tests/io/fixtures/buildings.sample.json`
- Test: `tests/io/*.test.ts`

**Interfaces:** 见「接口契约」io 部分。

**验收标准:**
- serialize→deserialize 往返：所有对象深度相等（transform 逐字段、style.overrides、properties）。
- deserialize 遇 `"version": "2.0"` 抛错且信息含版本号；缺字段（objects/layers）抛定位错误。
- JsonImporter：按示例映射导入示例 JSON → 全部是标准 `BuildingElement`（type='building'、element_ 前缀 id、style 指向 defaults.styleId）；`floors*3` 表达式生效为 height；错误 JSON 字段在 errors 中带 path。
- 导入对象经 CreateObjectCommand 入场景后与手绘对象结构一致（同一断言函数复用）。

**Steps:**
- [ ] 1. 失败测试：往返序列化 / 版本拒绝 / 映射导入 / 表达式字段 / 错误定位
- [ ] 2. 实现通过；编写示例映射与 fixture
- [ ] 3. 守护三连 + 更新状态 + commit：`feat(io): serializer, exporter and mapping-driven json importer`

### Task T1.8：占位资产 + 阶段一闭环装配与最小 UI

**需求文档对照：** §阶段一验收流程、§模型资产库（最小子集）、§环境预设。
**注入提示词：** 第 8 组 + 第 9 组的「资产生成」部分。
**偏差与补充：**
- 提示词组 8 的验收含 Gizmo 拖拽移动——Gizmo 属 T2.4；本任务变换验收经属性面板数值输入（同样走 TransformCommand）。文档阶段一验收流程中「资产库连续放置」依赖占位资产，故资产生成脚本提前到本任务。
- `scripts/generate-assets.mjs`：纯 Node 手写 glTF 2.0 Binary（12 字节头 + JSON chunk + BIN chunk），不依赖 three，程序生成 8 个低多边形占位模型并写 `assets/models/{category}/*.glb` + `assets/manifest.json`：tree(植物)、streetlight(道路设施)、car(车辆)、person(人物)、bench(公共设施)、extinguisher(消防设施)、sensor(设备)、pavilion(建筑)。每个模型含顶点法线与基础色材质。
- 最小 UI（React，仅阶段一验收所需）：顶部工具条（撤销/重做/保存/打开/导入 JSON）、左侧资产迷你列表（读 manifest，点击进入放置模式）、右侧属性面板（Transform 数值输入 + 样式预设下拉切换 + 高度输入）。样式参数面板自动化生成留 T2.4，这里用预设下拉。
- **本任务同时是全编辑器 UI 设计奠基**（用户指定）：按「UI 任务设计规则」先读 frontend-design 技能，确立美学方向并产出设计系统 `src/ui/styles/tokens.css` + `src/ui/styles/DESIGN.md`；上述全部面板按该设计系统实现，禁止使用通用默认样式。
- bootstrap：`src/app/bootstrap.ts` 装配 EditorFacade（含 8 个默认图层：Building/Roads/Green/Water/Parking/Models/Decoration/Annotation 与环境预设 白天/傍晚/夜景/科技 四选一的默认「白天」）；`src/ui/store.ts` 用 zustand 桥接 EventBus（selection/history/tool/scene 版本号）。

**Files:**
- Create: `scripts/generate-assets.mjs`、`assets/models/**`（生成物）、`assets/manifest.json`
- Modify: `package.json`（增 `assets:generate` 脚本）
- Create: `src/app/bootstrap.ts`、`src/ui/store.ts`、`src/ui/styles/{tokens.css,DESIGN.md}`
- Create: `src/ui/{Viewport.tsx,Toolbar.tsx,AssetListPanel.tsx,PropertyPanel.tsx,index.ts}`、`src/ui/panels/SimpleStylePicker.tsx`
- Modify: `src/App.tsx`（组装面板布局）
- Test: `tests/app/{bootstrap.test.ts}`（facade 装配后链路冒烟：开门面方法存在且可用）、`tests/tools/generate-assets.test.mjs`（GLB 头 magic 'glTF'、chunk 结构、manifest 条目数）

**Interfaces（Produces）:** `createEditor(canvas, opts?): EditorFacade`；`useEditorStore`（selectedIds/history 状态/activeToolId/sceneVersion）。

**验收标准:**
- `npm run assets:generate` 产出 8 个 GLB + manifest，GLB 二进制头合法（测试断言）。
- tokens.css + DESIGN.md 存在且面板实际引用 tokens 变量（无硬编码颜色/字体散落）；视觉方向具有辨识度（frontend-design 准则：非通用字体、非模板化配色）。
- 全链路（逻辑层，vitest）：createEditor → JsonImporter 导入 fixture → ChangeStyleCommand 切样式 → 改高度 → undo/redo → PlacementTool 放 3 棵树（FakePort 或真实 Renderer 二选一，测试用 Fake）→ saveScene→openScene → 断言恢复一致。此测试就是「阶段一验收流程」的可执行版：`tests/app/phase1.acceptance.test.ts`。
- 浏览器冒烟（主代理可选）：页面布局无报错。

**Steps:**
- [ ] 1. 编写 generate-assets.mjs + 其结构测试（先测后码）
- [ ] 2. 失败测试：phase1.acceptance.test.ts 全链路
- [ ] 3. 实现 bootstrap + 最小 UI + store 桥接，使验收测试通过
- [ ] 4. 守护三连 + 更新状态 + commit：`feat(app,ui): placeholder assets, bootstrap composition and minimal phase-1 ui`

### Task T1.9：阶段一 GUI 验收（主代理执行，不派发子代理）

**需求文档对照：** §阶段一验收流程、§阶段总览验收表。
**执行者：** 主代理（browser-use 技能，浏览器实操 + 截图审查）。

**验收清单（逐项截图留证到 `docs/superpowers/plans/screenshots/phase1/`）:**
- [ ] 新建场景：天空 + 地面 + 网格可见，无控制台错误
- [ ] 导入示例 JSON（UI 上选择 mapping + fixture）→ 出现建筑
- [ ] 点击建筑 → 属性面板显示；切换 5 套样式逐一生效且几何不变
- [ ] 修改高度数值 → 实时更新；Ctrl+Z 撤销 / Ctrl+Shift+Z 重做正确
- [ ] 资产列表点击树 → Ghost 跟随鼠标 → 连续放置 3 棵 → 右键退出
- [ ] 属性面板改树的 position 数值 → 生效（等效变换验收）
- [ ] 保存 → 刷新页面 → 打开 → 建筑/树/样式/位置完整恢复
- [ ] 控制台全程无错误；撤销步数与操作一致（放置 3 棵=3 步或合并为 1 步，与实现声明一致）

**失败处理：** 每个不过项派发修复子代理（带截图+复现步骤），同一项最多 2 轮；全过则 T1.9 done 并 commit 截图目录：`docs(phase1): gui acceptance screenshots`。

---

## 阶段 2：模型资产库与交互（需求文档·阶段二）

### Task T2.1：资产清单与缩略图

**需求文档对照：** §模型资产库。
**注入提示词：** 第 9 组任务 1。
**偏差与补充：** 缩略图两级：①脚本为每个 GLB 生成确定性 SVG 占位缩略图（按类别色+名称首字，写 `assets/thumbnails/*.svg` 进 manifest）；②运行时首次加载真实模型后用离屏渲染快照替换内存缩略图并 best-effort 持久化 IndexedDB（assetId+file 尺寸做 key）。资产面板 UI：搜索框 + 分类侧栏 + 卡片网格（缩略图/名称/标签/收藏星标），按需求文档完整实现。

**Files:**
- Create: `scripts/scan-assets.mjs`（扫描 assets/models → 重写 manifest.json，含缩略图路径与 tags）
- Create: `src/io/AssetManifest.ts`（manifest 读取与 AssetRegistry 灌注）
- Create: `src/runtime/loaders/ThumbnailCache.ts`（离屏渲染快照 + IndexedDB 持久化）
- Create: `src/ui/panels/AssetLibraryPanel.tsx`（替换 T1.8 迷你列表；UI 按 tokens.css / DESIGN.md 既有设计系统实现，遵循「UI 任务设计规则」先读 frontend-design 技能）
- Test: `tests/io/AssetManifest.test.ts`、`tests/scripts/scan-assets.test.mjs`

**Interfaces（Produces）:** `loadManifest(json): { assets: ModelAsset[] }`；AssetLibraryPanel 点击卡片 → `tools.activate('placement', { assetId })`。

**验收标准:**
- scan-assets 对目录增删模型后重跑，manifest 增量正确、旧 tags/收藏保留（按 file 路径合并）。
- 面板搜索命中 name/tags；分类过滤正确；收藏状态存 localStorage 跨刷新保留。
- 首次点击资产出现真实缩略图（第二次不再渲染，从缓存取——用加载计数断言）。

**Steps:**
- [ ] 1. 失败测试：manifest 灌注 / scan 合并语义 / 缩略图缓存命中
- [ ] 2. 实现脚本与运行时缩略图
- [ ] 3. 实现资产面板 UI（浏览器手测由主代理在 T2.5 统一验收）
- [ ] 4. 守护三连 + 更新状态 + commit：`feat(assets): manifest scanning, thumbnails and asset library panel`

### Task T2.2：PlacementTool 放置增强

**需求文档对照：** §模型放置。
**注入提示词：** 第 9 组任务 2。
**偏差与补充：** 无。滚轮在放置模式下缩放 Ghost 预览（临时 scale，夹在 [0.2,5]），R 键 45° 旋转 Ghost，均为预览参数，落点时进 CreateObjectCommand 的 transform；地面吸附恒开（y=0）。

**Files:**
- Modify: `src/editor/tools/PlacementTool.ts`
- Test: `tests/editor/PlacementTool.enhanced.test.ts`

**验收标准:**
- onWheel 改变 ghost scale 且夹取；onKeyDown 'r' 旋转 45°。
- 随机旋转/缩放：跑 200 次统计值全部落在 [min,max]；randomScale 同时作用于 x/y/z。
- `mergeBatch: true` 时连续放置 N 次仅 1 条历史（BatchCommand），undo 一次全撤、redo 一次全恢复；`false` 时逐个。
- 放置中 ESC/右键退出不删除已放置对象（回归）。

**Steps:**
- [ ] 1. 失败测试：滚轮/R 键/随机区间/BatchCommand 合并开关
- [ ] 2. 实现通过（Fake ports）
- [ ] 3. 守护三连 + 更新状态 + commit：`feat(editor): enhanced placement with batch merge`

### Task T2.3：InstancedMesh 渲染优化

**需求文档对照：** §非功能·性能。
**注入提示词：** 第 9 组任务 3。
**偏差与补充：** 实现放 `src/runtime/instancing/InstancedAssetPool.ts`：每 assetId 一个池；业务层仍逐个 ModelObject 调 attach，runtime 内部检测同 assetId ≥ 2 实例时切换 InstancedMesh 路径（重建矩阵缓冲而非重建对象）；单实例退化普通 Mesh。选中高亮与预览 Ghost 不走实例池。

**Files:**
- Create: `src/runtime/instancing/InstancedAssetPool.ts`、`src/runtime/spatial/SpatialIndex.ts`（接口占位：`interface SpatialIndex { insert(id, aabb); remove(id); query(aabb): ID[] }` + 线性暴力实现，规模上升后可换 BVH/四叉树实现而不动业务代码）
- Modify: `src/runtime/loaders/AssetLoader.ts`、`src/runtime/Renderer.ts`
- Test: `tests/runtime/InstancedAssetPool.test.ts`

**验收标准（node 下统计，无需 WebGL）:**
- 同 assetId 500 实例：场景 THREE 对象数为 1 个 InstancedMesh 而非 500 Group；每个实例世界矩阵与其 transform 一致。
- 删除中间一实例：其余矩阵不变、count 减一；undo 恢复后 count 与矩阵复原。
- 更新单实例 transform 只写对应矩阵槽（spy 断言 setMatrixAt 调用次数=1）。
- 业务层无感：`tests/app` 阶段一验收测试不改一行仍全绿。

**Steps:**
- [ ] 1. 失败测试：池化/矩阵一致性/删除恢复/增量更新
- [ ] 2. 实现通过 + 回归全部旧测试
- [ ] 3. 守护三连 + 更新状态 + commit：`perf(runtime): instanced mesh pool for repeated assets`

### Task T2.4：Gizmo / 属性面板 / 图层与场景树 UI

**需求文档对照：** §选择、变换与属性、§图层与场景树、§撤销重做快捷键。
**注入提示词：** 第 9 组任务 4 + 需求文档该两节（本任务 UI 为主，提示词覆盖不全，以需求文档为准）。
**偏差与补充：**
- Gizmo：runtime 用 three `TransformControls` 实现 `GizmoPort`（拖拽中临时直接改渲染对象矩阵，拖拽结束一次性回调 before/after → TransformCommand；拖拽中不发事件不进历史——与需求「预览隔离」一致）。
- 属性面板升级：由 `StyleDefinition.parameters` 声明自动生成控件（color→取色器、number→滑杆+数值框、boolean→开关、select→下拉），写值经 ChangeStyleCommand(overrides)/ChangePropertyCommand；三级样式作用域下拉（当前对象/同类型/当前图层/全部使用该样式）批量执行 BatchCommand。
- 场景树：按图层分组树，点击选中、眼睛/锁图标、双击重命名（ChangePropertyCommand）、搜索过滤并定位（focusObjects）；图层条目支持显示/锁/透明度滑杆/拖拽排序（ChangeLayerCommand）。
- 快捷键补全：W/E/R 切 gizmo 模式、F 聚焦、Home 全景、Delete 删除（DeleteObjectCommand）、Ctrl+C/V、Ctrl+D 复制（CreateObjectCommand，偏移 1m）。
- SelectTool 增强：空白处按下拖拽=框选（PreviewPort 画 2D 框，屏幕矩形投影相交选中）；Ctrl 多选。
- EnvironmentPanel：环境预设下拉（白天/傍晚/夜景/科技，来自 bootstrap 注册的环境预设表），切换只改 SceneData.environment 并 emit scene:changed，随场景保存。

**Files:**
- Create: `src/runtime/services/GizmoImpl.ts`、`src/editor/tools/TransformTool.ts`（完整实现，替换桩）
- Create: `src/ui/panels/{PropertyPanel.tsx,StyleParametersForm.tsx,SceneTreePanel.tsx,LayerPanel.tsx,EnvironmentPanel.tsx}`
- Create: `src/ui/components/{ColorInput.tsx,NumberSlider.tsx,IconToggle.tsx}`
- UI 一律复用 T1.8 设计系统（tokens.css / DESIGN.md），遵循「UI 任务设计规则」先读 frontend-design 技能
- Modify: `src/editor/tools/SelectTool.ts`（框选）、`src/app/input.ts`（新快捷键）、`src/ui/store.ts`
- Test: `tests/editor/{TransformTool.test.ts,SelectTool.box.test.ts}`、`tests/ui/StyleParametersForm.test.tsx`（用 @testing-library/react，需在 T0.1 依赖中加入）

**Interfaces:** GizmoPort.onDragEnd 回调驱动 TransformCommand；StyleParametersForm 接收 `parameters: StyleParameter[] + values` 受控渲染。

**验收标准:**
- Fake gizmo 下：拖拽结束生成一条 TransformCommand，undo 后对象回 before，且拖拽过程中历史栈长度不变。
- StyleParametersForm 快照：对建筑 5 套预设的参数声明渲染出对应控件类型与默认值。
- 框选：Fake viewport 返回矩形内两个 id → 两对象选中且 selection:changed 一次。
- 复制/粘贴/删除/聚焦/图层操作全部经命令且可撤销（测试覆盖）。

**Steps:**
- [ ] 1. 失败测试：TransformTool 命令化 / 框选 / 参数表单渲染 / 各命令快捷键行为
- [ ] 2. 实现 GizmoImpl + 工具增强 + 四个面板 + 快捷键
- [ ] 3. 守护三连 + 更新状态 + commit：`feat(ui,runtime): gizmo, auto-generated property panel, layers and scene tree`

### Task T2.5：阶段二 GUI 验收（主代理执行）

**需求文档对照：** §阶段总览验收表·阶段二行。
**验收清单（截图到 `docs/superpowers/plans/screenshots/phase2/`）:**
- [ ] 资产库：搜索「树」过滤正常、分类切换、收藏星标持久
- [ ] 连续放置 5 棵树 + 2 盏路灯（不同资产混放），mergeBatch 开启时一次 Ctrl+Z 全撤、redo 全恢复
- [ ] 放置中滚轮缩放 / R 旋转预览可见生效
- [ ] 选中树 → Gizmo 移动/旋转/缩放（W/E/R 切换）各拖一次，每次一格历史，撤销正确
- [ ] 属性面板：样式参数滑杆改颜色实时生效；作用域切「同类型」批量改样式一次撤销
- [ ] 场景树：按图层分组、显隐/锁定/透明度即时生效、重命名可撤销、搜索定位（F 聚焦）
- [ ] 500+ 树放置后帧率目测流畅（DevTools FPS 或滚动无卡顿）
- [ ] 保存/重开：图层状态、样式覆盖、树位置完整恢复；控制台无错误
- 失败处理同 T1.9。

---

## 阶段 3：绘制能力闭环（需求文档·阶段三）

### Task T3.1：DrawSession 与几何校验

**需求文档对照：** §绘制模式（校验部分）、§数据校验。
**注入提示词：** 第 10 组任务 1。
**偏差与补充：** DrawSession 属 editor 层纯逻辑（无 three）；complete 前调 `validateGeometry`，非法则抛 `DrawValidationError`（含 ValidationError 列表）供工具层提示。校验函数 T1.2 已建，本任务补「正交/45° 锁定」的坐标修正纯函数。

**Files:**
- Create: `src/editor/tools/draw/{DrawSession.ts,DrawValidationError.ts,snap.ts}`
- Test: `tests/editor/draw/{DrawSession.test.ts,snap.test.ts}`

**Interfaces（Produces）:**
- `DrawSession { constructor(geometryType)；addPoint(p: Vec2)；moveCursor(p: Vec2)；complete(): GeometryData；cancel()；state: DrawPreviewState }`
- `snap.ts`：`orthoLock(from: Vec2, to: Vec2, axis: 'x'|'z'|null): Vec2`（轴向投影）、`angleLock(from, to, stepDeg=45): Vec2`（角度吸附到最近 45° 方向，保持距离）、`gridSnap(p, gridSize): Vec2`。

**验收标准:**
- Point：1 点 complete → PointGeometryData；LineString：≥2 点，1 点 complete 抛错；Polygon：≥3 点且校验通过才返回 PolygonGeometryData（首环自动闭合）。
- 自相交八字形 complete 抛 DrawValidationError(code=SELF_INTERSECT)。
- orthoLock/angleLock/gridSnap 数值用例（给定输入断言输出坐标，误差 <1e-9）。
- 全程无 SceneManager 写入（DrawSession 不持 SceneManager 引用）。

**Steps:**
- [ ] 1. 失败测试：三类几何 complete 规则 / 非法拦截 / 三种吸附函数
- [ ] 2. 实现通过
- [ ] 3. 守护三连 + 更新状态 + commit：`feat(editor): draw session with validation and snapping`

### Task T3.2：三绘制工具与绘制辅助

**需求文档对照：** §绘制模式。
**注入提示词：** 第 10 组任务 2、3。
**偏差与补充：**
- 三工具均经 PreviewPort.updateDrawPreview 渲染临时线/面/顶点（PreviewManager 扩展 3D 预览：Line 段+顶点 sprite、Polygon 半透明面、测长/测面积文字 sprite——文字渲染用 CanvasTexture，仅 runtime）。
- 进入绘制：CameraPort.setMode('top') + setOrthoLock(true) + 网格显示；工具参数带 `perspective: boolean` 保留透视绘制开关；退出恢复原模式。
- 状态栏信息（长度/面积/坐标）经 EventBus 新增事件 `draw:status`（EventMap 增补）驱动 UI 状态栏。
- Shift 按住=正交锁定、A 键切换 45° 锁定、G 键切换网格吸附（默认开，1m 网格）。
- 完成 → `ElementRegistry.create(elementType, { geometry })` + 默认样式 → CreateObjectCommand 入场景。

**Files:**
- Create: `src/editor/tools/draw/{DrawPointTool.ts,DrawLineTool.ts,DrawPolygonTool.ts,index.ts}`
- Modify: `src/editor/services/ports.ts`（PreviewPort 已含 updateDrawPreview，无需改）、`src/core/events/events.ts`（增 `draw:status` 事件）
- Modify: `src/runtime/services/PreviewManager.ts`（3D 绘制预览 + 文字 sprite + 2D 框选矩形）
- Test: `tests/editor/draw/{DrawLineTool.test.ts,DrawPolygonTool.test.ts,DrawPointTool.test.ts}`

**验收标准:**
- FakePort 下：面工具点击 4 点 + 双击 → 场景多 1 个 Polygon 要素、几何顶点顺序一致、默认样式正确；绘制全程历史栈长度不变，完成后恰好 +1。
- 自相交时 complete 被拦、场景无变化、收到 draw:status 错误提示。
- 长度/面积：画 3-4-5 直角三角形时状态面积=6、长度实时累计（事件 payload 断言）。
- 正交锁定：Shift 下第二点仅沿主轴偏移；45° 锁定点落在 45° 方向。
- ESC/右键取消：清预览、切回先前工具、场景与历史零变化。

**Steps:**
- [ ] 1. 失败测试：三工具流程 / 拦截 / 辅助计算 / 锁定 / 取消零污染
- [ ] 2. 实现工具 + PreviewManager 扩展 + 事件增补
- [ ] 3. 守护三连 + 更新状态 + commit：`feat(editor,runtime): draw tools with aids, locks and preview isolation`

### Task T3.3：绘制模式 UI 与流程串联

**需求文档对照：** §绘制模式流程、§范围（点线面绘制模式）。
**注入提示词：** 第 10 组任务 4。
**偏差与补充：** UI：左侧「绘制」面板 = 要素类型网格（building/road/green/water/parking，来自 ElementRegistry.list()）→ 几何类型（按 definition.geometryTypes 过滤）→ 点击激活对应 Draw 工具（params: { elementType, perspective:false }）；顶部工具条加「选择/移动/绘制」模式切换与视图按钮（透视/顶/前/侧、F、Home）；底部状态栏显示 draw:status（长度/面积/坐标/错误提示）；GridSettings 提供网格显示开关、尺寸与间距配置（作用于 gridSnap 步长与视口网格渲染）。道路 centerline 模式：线绘制完成后 properties.width 默认 6，RoadRenderer 按中心线+宽度扩面（此为 Road 渲染补全，RoadRenderer 已在 T1.4 骨架，此处补 centerline 分支）。

**Files:**
- Create: `src/ui/panels/DrawPanel.tsx`、`src/ui/components/{ModeSwitch.tsx,StatusBar.tsx,ViewButtons.tsx,GridSettings.tsx}`（UI 复用 T1.8 设计系统，遵循「UI 任务设计规则」先读 frontend-design 技能）
- Modify: `src/runtime/renderers/RoadRenderer.ts`（centerline 分支：LineString + width → 平面带状几何，端头圆角可留 TODO 注释但主体必须正确）
- Modify: `src/App.tsx`（布局：左资产/绘制、右属性、下状态栏）
- Test: `tests/ui/DrawPanel.test.tsx`、`tests/runtime/RoadRenderer.centerline.test.ts`

**验收标准:**
- DrawPanel 选项由 Registry 驱动（注册新要素类型自动出现，测试用假注册验证）。
- RoadRenderer：直线 (0,0)→(10,0) + width 6 → 带状面宽 6、长 10，法线朝上。
- 状态栏随绘制事件更新（测试事件 payload → store → 渲染）。
- 浏览器串测留给 T3.4。

**Steps:**
- [ ] 1. 失败测试：DrawPanel registry 驱动 / centerline 渲染几何 / 状态栏数据流
- [ ] 2. 实现通过
- [ ] 3. 守护三连 + 更新状态 + commit：`feat(ui): draw mode panel, status bar and centerline roads`

### Task T3.4：阶段三 GUI 验收 + 全量回归（主代理执行）

**需求文档对照：** §阶段总览验收表·阶段三行 + §阶段一验收流程全文。
**验收清单（截图到 `docs/superpowers/plans/screenshots/phase3/`）:**
- [ ] 空白场景 → 绘制面板选 building/Polygon → 自动顶视图 → 画五边形建筑（双击闭合）→ 生成建筑带默认样式 → 高度改 15 → 切「玻璃建筑」样式
- [ ] 绘制过程状态栏实时显示长度/面积；Shift 正交锁定可感知
- [ ] 画自相交多边形 → 被拦截 + 提示，场景无变化
- [ ] 道路：centerline 模式画折线 → 带状道路生成，宽度参数可改
- [ ] 绘制半成品按 ESC → 无残留对象、历史零污染（打开历史面板核对步数）
- [ ] 点/线要素各画一个（路灯点位、围墙线）成功生成
- [ ] 混合回归：导出 JSON 生成建筑→切样式→撤销重做→放树→画绿地→保存重开全恢复（阶段一验收流程完整重跑）
- [ ] `npm test` / `check:layers` / `typecheck` 全绿；控制台无错误
- [ ] 更新 README：功能清单与操作指南
- 失败处理同 T1.9；全过后 commit：`docs(phase3): acceptance screenshots and readme`

---

## 需求覆盖对照（自查矩阵）

| 需求文档条目 | 承接任务 |
|---|---|
| 六层架构/边界规则/八大概念 | T0.1(守护)、T1.1–T1.6 |
| SceneObject/Transform/Element/Geometry/Style/Asset/Layer 数据模型 | T1.2、T1.3 |
| 样式三级优先级 | T1.2(resolveStyle)、T2.4(作用域 UI) |
| Command/History/BatchCommand | T1.5、T2.2(合并开关) |
| 场景环境（天空/地面/光照/预设） | T1.4、T1.8(环境预设) |
| 选择/变换/Gizmo/属性面板/场景树/复制删除 | T1.6(基础选择)、T2.4 |
| 绘制三工具/辅助/校验/顶视图/预览隔离 | T3.1–T3.3 |
| 模型资产库/manifest/缩略图 | T1.8(占位生成)、T2.1 |
| 模型放置（Ghost/连续/随机参数/滚轮/R 键） | T1.6(基础)、T2.2(增强) |
| InstancedMesh/缓存/空间索引接口预留 | T2.3、T2.1(缩略图缓存) |
| JSON 配置化导入 | T1.7 |
| 保存/加载/版本兼容 | T1.7、T1.8 |
| 环境预设切换（白天/傍晚/夜景/科技） | T1.8(预设注册)、T2.4(EnvironmentPanel) |
| 吸附（Grid 一期）/网格尺寸间距/视图 | T3.2(gridSnap+网格)、T3.3(GridSettings+视图按钮) |
| 三阶段验收 | T1.9、T2.5、T3.4 |

**明确排除项（本计划不做）：** Shader/样式编辑器、批量散布、DXF/GeoJSON 导入、顶点编辑、测量标注、插件系统、LOD、Vertex/Edge 吸附、OBJ/FBX 格式、水面波纹动画、停车车辆填充。

---

## 计划自查记录

- **占位符扫描：** 无 TBD/TODO 型步骤；RoadRenderer 端头圆角标注为显式非目标（主体几何有验收断言）。
- **类型一致性：** 各任务 Interfaces 均引用「接口契约」节统一签名；KeyboardEventInfo 已补入契约；EventMap 增补 `draw:status` 在 T3.2 显式声明为唯一事后增补事件；`assets:generate` 脚本在 T1.8 显式加入 package.json。
- **规格覆盖：** 见上方矩阵，无缺口；文档验收流程中越阶段内容（Gizmo/资产库在阶段一流程中出现）已通过 T1.8 偏差说明重新分配；环境预设切换、网格尺寸间距配置、空间索引接口预留三处初稿缺口已在自查后补入（T2.4/T3.3/T2.3）。
- **用户追加要求（2026-09-09）：** ①依赖一律最新稳定版——版本策略改为安装时取 `@latest` 并锁定，2026-09 快照（TS 7.0.2 / Vite 8.2.2 / Vitest 5.0.0 / React 19.2.8 / three 0.186.0）记入 T0.1，含不兼容回退规则；②UI 任务（T1.8/T2.1/T2.4/T3.3）必须先读 frontend-design 技能——已写入「UI 任务设计规则」节与派发模板，T1.8 奠基设计系统（tokens.css + DESIGN.md），后续任务复用。
