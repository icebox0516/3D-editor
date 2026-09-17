# 分域契约 · 阶段 6：形状驱动创建 + 插件化样式引擎

> 2026-09-11 自 CONTRACTS.md 拆离；**同日分层审查修订（v2）**：显式声明各类型可见层与跨层交互面——分域契约不得突破基础契约的 DAG 与 three 白名单，本文件 §C 是阶段 6 契约中 THREE 类型**唯一合法出现处**。
> **T6.1–T6.10 任务必读**（任务书「必读」节指定）。共享基础类型（Vec2/Transform/SceneObject/StyleParameter/EventMap 等）见 CONTRACTS.md 基础契约；冲突时停下在报告中提出，由主代理决策。设计依据：2026-09-11 grilling 十项裁决 + 同日分层审查三问（history/decisions.md）。

## §0 分层总则（先读本节再读类型）

| 模块 | 归属层 | 可见方 | THREE |
|---|---|---|---|
| SemanticType / ShapeType / RegionShape / RegionSemantic / RegionStyle / RegionObject | domain（T6.1 交付） | 全层（纯数据） | 禁止 |
| 参数化形状点生成纯函数（矩形/圆/椭圆/自由 → Vec2[]） | domain | runtime GeometryBuilder 消费 | 禁止 |
| StylePresetMeta / StylePresetRegistry | registries | editor / ui / runtime / app（纯数据） | 禁止 |
| 命令三件套 | editor | ui 经 EditorFacade 调用 | 禁止 |
| GeometryBuilder / StylePresetBuild / StyleInstance / StyleEngine | **runtime（src/runtime/styles/**、geometry） | **仅 runtime / app** | 仅此处合法 |

**跨层交互规则（唯一通路，违反即契约违规）：**

1. editor 层与样式系统的全部交互 = 修改 RegionObject 的 `style` / `semantic` / `shape` **纯数据字段**（经命令，emit `scene:changed`）；runtime 的 RegionRenderer 订阅事件 reconcile 实例——改预设 = dispose+create、改参数 = `instance.update`、改形状 = 重建几何+`setGeometry`。沿 SceneSync / RuntimeObjectMap 既有模式。**editor / domain / scene / registries / io / ui 的源码中禁止出现 StyleInstance、THREE.* 或对 runtime/styles 的导入**（check:layers 静态守门 + 本契约语义守门，双保险）。
2. ui 读预设元数据的唯一途径 = `EditorFacade.registries.presets`（StylePresetRegistry 实例，组合根装配）；ui 禁止 import runtime。

## §A 数据契约（domain/editor/ui 可见 · 零 THREE）

```ts
// ── 语义类型（十类，注册制接入）──────────────────────────
export type SemanticType =
  'unclassified' | 'water' | 'grass' | 'plaza' | 'parking' |
  'bare_land' | 'road' | 'building' | 'poi' | 'custom';

// ── RegionObject（绘制产物统一结构，三层解耦）──────────────
export type ShapeType = 'polygon' | 'rectangle' | 'circle' | 'ellipse' | 'freehand' | 'line' | 'point';
export interface RegionShape {
  type: ShapeType; points: Vec2[]; baseHeight: number; closed: boolean;
  options?: Record<string, unknown>;   // 参数化形状派生参数（半径/长宽/平滑度）
}
// 高度合成（2026-09-11 审计定稿）：最终 y = shape.baseHeight + transform.position.y。
// baseHeight = 贴地层抬升基准：语义注册表每类含 defaultBaseHeight 字段（数值沿现状
// runtime SURFACE_ELEVATION：road 0.06 / green→grass 0.12 / water 0.18，其余 0），
// 绘制创建时按语义写入 shape.baseHeight。面板「基准高度」读写 shape.baseHeight，
// Gizmo/属性面板 Y 值读写 transform.position.y——两个入口各管一层，叠加生效不互斥。
export interface RegionSemantic { type: SemanticType; properties: Record<string, unknown> }  // 道路 width、建筑 height 等
export interface RegionStyle { presetId: string; overrides: Record<string, unknown> }
export interface RegionObject extends SceneObject {          // 复用 SceneObject 基座（id/name/layerId/transform/visible/locked）
  type: 'region';                                          // 对象类型字面量；SceneManager/选择/图层按 SceneObject 通用字段无差别处理
  shape: RegionShape; semantic: RegionSemantic; style: RegionStyle;
}
// 扩展字段合法性：沿 Element 同构先例（geometry/style 顶级扩展 + T1.5 勘误「updateObject patch
// 运行时透传任意键、结构化收窄」），不与基础契约 SceneManager 签名冲突；序列化经 §D 过渡壳保证往返。

// 命令三件套（ChangeShapeCommand / ChangeSemanticCommand / ChangePresetCommand——
// 第三件 2026-09-11 审查裁定改名，避开 v1 ChangeStyleCommand 同名冲突）：
// ChangeSemanticCommand = 语义层一切变更（2026-09-11 审计定稿）——①类型切换：自动迁入
//   类型默认图层 + presetId 置新类型默认预设 + overrides 清空，一条历史整体回退；
//   ②业务参数变更：semantic.properties 键值修改，同命令承载（几何顶点不动，渲染侧按
//   §C update/setGeometry 路径消化）；
// 改形状不改类型与样式；改预设/覆写（presetId + overrides）复用几何、一条历史。
```

## §B 预设元数据注册（registries 层 · 纯数据）

```ts
export interface StylePresetMeta {
  id: string; name: string;                        // id 为注册表键命名空间 '<category>.<name>'（如 'water.flow'），
                                                   // 不属全局约束 7 的 createId 实例 ID 前缀体系（两个空间互不混淆）
  category?: string; thumbnail?: string;           // 缩略图静态资源引用（工具脚本或离屏渲染产出，非运行时 THREE 对象）
  supportedShapes: ShapeType[]; supportedSemantics: SemanticType[];
  defaultParams: StyleParameter[];                 // 沿用基础契约 StyleParameter 形态（ui 参数表单据此生成）
}
export class StylePresetRegistry {                 // 与 v1 StyleRegistry 并存，互不替代
  register(m: StylePresetMeta): void; get(id: string): StylePresetMeta | undefined;
  list(): StylePresetMeta[]; find(shapeType: ShapeType, semanticType: SemanticType): StylePresetMeta[];
}
```

**双轨注册与装配规则（组合根）：**

- 插件文件（runtime/styles/**）同文件导出 `meta`（纯数据）与 `build`（§C）；
- app/bootstrap 启动时 eager 收割全部插件 `meta` 注册进 StylePresetRegistry（app 可导入一切，注入方向合法）；EditorFacade.registries 暴露 `presets`；
- runtime 引擎侧另持 `presetId → build` 构建路由（`import.meta.glob`）；registries 层**只存元数据，永不含构建函数**（registries→runtime 为禁止方向）；
- 一致性守门（测试锁定）：meta 无 build → 该预设 UI 灰显禁用 + Toast；build 无 meta → 不注册不暴露；
- 当前不做按预设代码分包（简化首版）；若未来需要，升级为「registries meta 文件 + runtime build 文件」成对方案，公共接口不变。

## §C runtime 内部契约（仅 runtime / app · 本节 THREE 类型唯一合法出现处）

```ts
// ── 几何构建（runtime；输入 domain 纯数据，输出 THREE 几何）──
// GeometryBuilder(shape: RegionShape, semantic: RegionSemantic): THREE.BufferGeometry
// 职责：参数化点列（来自 T6.1 domain 纯函数）→ BufferGeometry；三角化/UV/法线；
// baseHeight → y 平移（高度合成规则见 §A：最终 y = shape.baseHeight + transform.position.y，
// position.y 由对象 transform 供给，不在此叠加）；
// 道路带宽面在此生成（读 semantic.properties.width）——样式插件不做业务几何；
// 带宽生成仅对 shape.type='line'（2026-09-11 审计增补）：polygon 形状 + road 语义走
// 平面贴地渲染（width 忽略）；
// building 立体挤出不属于本构建器（由 building 预设 build 内按 height 实现）。

// ── 样式插件（一预设一文件，TypeScript）─────────────────────
export interface StyleInstance {                   // 统一返回契约（强制，主框架只经此交互）
  object: THREE.Object3D; material: THREE.Material;
  presetId: string; supportedShapes: ShapeType[];
  update(params: Record<string, unknown>): void;   // 只改参数/uniform，禁止重建几何
  setGeometry(geometry: THREE.BufferGeometry): void; // 形状修改后的几何重绑
  dispose(): void;                                 // 释放本实例全部资源
}
export type StylePresetBuild = (geometry: THREE.BufferGeometry, params: Record<string, unknown>) => StyleInstance;

// ── 引擎入口（纯函数，无状态）──────────────────────────────
// createStyle(geometry, shapeType, semanticType, presetId, overrides?) → StyleInstance
//   校验 → 参数合并（StyleParameter 语义 + min/max 钳制）→ 参数通路（2026-09-11 审计定稿）：
//   semantic.properties 以保留键 `semantic` 并入 params 后调用 build（createStyle 内部完成，
//   签名不变；载体裁定 2026-09-11 主代理：语义属性经可选尾参
//   `semanticProperties?: Record<string, unknown>` 传入、缺省 {}——semanticType 字符串参数
//   无法承载 properties，审计「并入 params」原意以此落地，五参调用形态与既有调用方不变）
//   ——building 预设读 `params.semantic.height` 挤出 → 构建路由 → build；
//   失败降级 default_solid + 经 EventMap `app:notify` 发 Toast（基础契约 2026-09-11 增补）
// updateStyle(instance, params) / disposeStyle(instance)
// 材质纪律：同预设多实例共享材质模板，带 overrides 的对象 clone 独享，删除时引用计数释放。
// 渲染模式：线框/X-Ray 用场景级 overrideMaterial 全局覆盖（Shader 插件零负担）。

// ── 顶点编辑跨层通路（T6.8；2026-09-11 审计增补，模式沿 GizmoPort 先例）──
export interface VertexEditPort {
  /** 顶点拖动结束回调（一次性 before/after 点列），由 editor 层编辑会话转成 ChangeShapeCommand */
  onDragEnd(cb: (info: { objectId: ID; before: Vec2[]; after: Vec2[] }) => void): void;
}
// 通路：runtime 顶点句柄拖动 → Port 回调（before/after 点列）→ editor 层编辑会话转
// ChangeShapeCommand（松手提交一条历史）；基础契约 editor/services 节仅留指针注记（定义在本节）。

// ── 顶点编辑会话控制（T6.8 实现增补；2026-09-12 按需门暂裁并入、待用户追认）──
// VertexEditPort 只定义 onDragEnd 提交通道；会话挂载/点列同步/删除转发没有以下接口
// 功能不成立（与 RectPickPort「可选退化」性质不同，为通路必要组成），故并入本节正式化：
export interface VertexEditSessionPort {
  /** 开始编辑会话：runtime 渲染顶点/边中点句柄（closed 决定首尾边与约束族） */
  beginSession(info: { objectId: ID; points: Vec2[]; closed: boolean }): void;
  /** 同步工作点列（提交回环/撤销/重做后的句柄重排） */
  setPoints(points: Vec2[]): void;
  /** 删除当前悬停顶点（Delete/Backspace 转发；违例约束由实现拦截提示；无悬停返回 false） */
  requestVertexRemoval(): boolean;
  /** 结束会话：移除句柄、清理拖拽态、按场景数据恢复预览几何 */
  endSession(): void;
}
// editor 接口端定义在 editor/services/ports.ts（与 GizmoPort/RectPickPort 同节）；
// runtime VertexEditImpl 以结构化类型实现（DAG 禁止 runtime→editor，不 implements）。
```

## §D 过渡期共存规则（T6.1–T6.6；2026-09-11 审查增补）

**Scene 并存语义**：同一 SceneData 内 `type: 'region'` 与旧要素 type（building/road/green/water/parking/marker/model）合法并存；SceneManager/SelectionManager/图层/大纲/选择/框选/变换/Gizmo 均按 SceneObject 通用字段工作，对二者无差别。

| 关注点 | 过渡规则 |
|---|---|
| 渲染分支 | 沿 RendererRegistry 按 `object.type` 派发（既有机制）：RegionRenderer 注册 `'region'`，旧渲染器不动（2026-09-11 审计措辞校正：现状注册 5 个——building/road/green/water/marker；parking 无独立渲染器本体）；SceneSync 不感知差异 |
| 工具支持 | Select/Transform/Placement 与右键对象通用动作（重命名/隐藏/锁定/移动至图层/复制粘贴删除）对二者通用；旧六要素绘制工具保留至 T6.5 移除入口、T6.7 删本体；T6.5 起新绘制只产出 RegionObject |
| 面板/大纲 | Inspector 按对象 type 分支（T6.6：新四分组 + 旧要素分支共存）；大纲分组模型在 T6.5/T6.6 纳入 region 类型，未更新前 region 行落入既有「未分层/表外类型」兜底组（不报错） |
| 序列化过渡 | **已完成（T6.9）**：场景文件 v2（version '2.0'）正式接管——RegionObject 三层字段整体序列化/反序列化，往返无损（含 options 缓存/overrides/业务参数）；按需门裁决（2026-09-12 用户拍板）**v1 旧数据兼容整体不做**——版本门拒读 v1（错误含停止支持提示），无任何旧要素转换层，SceneSerializer 增对象类型 fail-fast 校验（region/model + 三层结构 + 枚举合法）；bootstrap 旧六类跳过兜底随之删除 |
| 几何两套标准 | 业务几何唯一标准 = RegionShape（7 类）；GeometryData（3 类）为**运行时内部表达**：①绘制预览映射——面类（polygon/rectangle/circle/ellipse/freehand）→ Polygon 点列、line → LineString、point → Point（DrawPreviewState 不改）；②校验复用——validateGeometry 经适配器消费 RegionShape（面类映射环校验、line 折线校验、参数化形状直通）。**T6.9 重设计已收口**：JsonImporter v2 直接产出 RegionShape 点列（不再经 GeometryData）；GeometryData 仅存上述①②内部用途，**评估结论：保留**（绘制预览管线与校验适配两处真实消费，并入 RegionShape 无净收益） |
| 命令对照与退役 | v1 `ChangeGeometryCommand` / `ChangeStyleCommand`（Element 语义）与阶段 6 `ChangeShapeCommand` / `ChangeSemanticCommand` / `ChangePresetCommand` 过渡期**并存、按对象 type 由调用侧（facade/面板）派发**，注册制接入禁止散落 type 判断；**T6.7 随旧要素删除退役 v1 这两条**；CreateObject/DeleteObject/Transform/ChangeProperty/ChangeLayer/Batch/UpdateObject/UpdateLayer 为通用命令持续存活 |
