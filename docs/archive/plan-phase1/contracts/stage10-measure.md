# 阶段 10 目标契约：测量与分析（会话态测量域 + 统计/日照分析）

> 增补时间：2026-09-15（T10.1 阶段门，第十一次契约修订——排除项「测量标注」限定解禁，决策日志留痕；第十次为 T8.6 GizmoPort.resync 回溯补登）。
> 与基础契约（CONTRACTS.md）同等权威；冲突时停下在报告中提出，由主代理决策。
> 调研依据：[archive/research-phase10-measure-analysis.md](../archive/research-phase10-measure-analysis.md)（冻结存档）。

## §A 测量域数据模型（会话态）

**四不变式（全任务强制）：**

1. **会话态**：测量项只存在于编辑器会话内存（`MeasureSession`），**不入场景 JSON、不入 Command 历史、不入 SceneManager**——沿参考线（T8.1 AlignGuides）「可见但不入历史」先例；社区主流佐证（Blender/UE5/SketchUp 读数均会话态，见调研 §四）。持久化与测量点吸附**仍属排除项**（远期池）。
2. **纯数据**：`MeasureItem` 是 editor 层纯数据；渲染由 runtime 经 `MeasurePort` 完成（依赖倒置，Port 先例同 PreviewPort）。editor 层零 THREE。
3. **测量层永远置顶**：覆盖层（线/端点/标签）`depthTest:false` + AUX_LAYER + renderOrder 1001（与参考线同刻度）——明示「永远置顶」策略（调研坑①择一），不做遮挡检测降透明。
4. **零场景副作用**：测量工具不选对象、不改 transform、不产生 Command；`cancel()`（ESC）只清当前草稿，完整保留已提交测量项。

```ts
// ── 会话域（不序列化；MeasureKind 物理定义在 core/types——EventMap 载荷引用所需，
//    core 为 editor/core/events 唯一公共上游（DAG），editor/services/measure 再导出保持
//    契约导入形状；2026-09-15 T10.1 落地勘正）────────────────
export type MeasureKind = 'distance' | 'height' | 'area' | 'angle';

export interface MeasureItem {
  id: ID;                 // createId('measure')，会话态（ID 前缀清单增补 measure_）
  kind: MeasureKind;
  points: Vec3[];         // 世界坐标；distance ≥2 / height =2 / area ≥3 非共线 / angle =3
  createdAt: number;      // 提交时序（「删除上一条」依据）
}

// 测量会话存储（editor 层；ToolManager 生命周期外仍存活——切工具不清空，模式退出/清除全部才清）
export class MeasureSession {
  list(): readonly MeasureItem[];
  add(item: MeasureItem): void;          // emit 'measure:changed'
  removeLast(): boolean;                 // emit 'measure:changed'；空表 false
  clear(): void;                         // emit 'measure:changed'（count:0）
}
```

**各 kind 语义（交互与数值口径）：**

| kind | 点击流 | 完成 | 读数（标签 + 状态栏） |
|---|---|---|---|
| distance | 逐点（≥2），双击/Enter 结束 | 末点去重（双击重复点 ε=0.01m 丢弃）后 ≥2 点成项 | 每段标签=段长（段中点）；总长标签=累计（末点）；口径=三维空间距离 |
| height | 2 点，第 2 点自动完成 | — | 三读数：空间距离 + 水平距离（XZ 投影）+ ΔH（y₂−y₁，可负） |
| area | 逐点（≥3 非共线），双击/Enter 结束 | 同 distance 去重；共线/不足拦截（error 提示，草稿保留） | 面积标签（质心）=**水平投影面积（XZ 平面）**——口径单一，斜面表面积不做（调研坑②） |
| angle | 3 点（第 2 点为角点），第 3 点自动完成 | — | 角度标签（角点）=∠ABC，度，0–180；实时预览随游标 |

- 进行中草稿经 `MeasurePort.updateDraft` 呈现（弹性段随游标）；完成后并入 `MeasureSession` 并整组刷新覆盖层。
- **拾取**：`surfacePoint`——表面优先、地面兜底、近水平限距（见 §B）。测量**不切顶视、不锁旋转**（与绘制不同：测量常在透视下贴立面）。
- **吸附**：网格吸附（G，会话开关）与正交（Shift）/45°（A）锁定作用于 x/z（沿 snap.ts 纯函数），拾取 y 值保留不锁定。
- **删除**：Delete/退格=「删除上一条」（有草稿时先弃草稿）；ContextToolbar「清除全部」清空会话。逐条点选拾取**不做**（远期池）。

## §B 端口与事件（跨层通路）

```ts
// ── ViewportPort 增补（runtime 实现；基础契约 editor/services 节留指针注记）──
export interface ViewportPort {
  // …既有方法不变…
  /** 测量拾取：表面优先（content 对象 raycast 交点世界坐标；AUX 层/gizmo/网格/地面辅助不可拾取），
   *  未命中落地面 y=0 平面；射线-平面近水平（交点距相机 > 2000m）返回 null（调研坑③限距）。 */
  surfacePoint(x: number, y: number): Vec3 | null;
}

// ── MeasurePort（新 Port；runtime 实现 MeasureOverlay，app 注入）─────────
export interface MeasureDraft {
  kind: MeasureKind;
  points: Vec3[];        // 已固定点
  cursor: Vec3 | null;   // 游标弹性段端点
}
export interface MeasurePort {
  /** 草稿整组替换（null = 清草稿）；弹性段 = points 末点→cursor 连线（area 为闭合环+cursor） */
  updateDraft(draft: MeasureDraft | null): void;
  /** 已提交测量项整组替换（空数组 = 隐藏已提交层；草稿不受影响） */
  updateMeasurements(items: readonly MeasureItem[]): void;
  /** 清全部（草稿 + 已提交；模式退出/清除全部用） */
  clear(): void;
}

// ── EventMap 增补（基础契约 EventMap 留指针注记；定义在本节）──────────────
export interface MeasureStatusPayload {
  kind: MeasureKind;
  segment?: number;    // 当前弹性段长度（distance/height；三维）
  total?: number;      // 已固定点累计长度（distance，含弹性段）
  area?: number;       // 实时水平投影面积（area；环 = 已固定点 + 游标）
  angle?: number;      // 实时角度（angle；度）
  dh?: number;         // ΔH（height；米，可负）
  horizontal?: number; // 水平距离（height）
  cursor?: Vec3;       // 游标拾取点（表面优先口径）
  error?: string;      // 校验拦截（共线/顶点不足）；随下一次正常状态自然清除
}
// 'measure:status': MeasureStatusPayload   —— 完成/取消后发**仅含 kind 的复位载荷**（沿 draw:status
//                                          //  空载荷复位先例；kind 为契约必填字段，复位 = 无任何读数字段。
//                                          //  2026-09-15 T10.1 落地勘正：初稿「空载荷 {}」与 kind 必填矛盾，取类型安全侧）
// 'measure:changed': { count: number }     —— MeasureSession 增删清后发（UI「清除全部/删除上一条」可用态）
```

**覆盖层渲染纪律（runtime/MeasureOverlay，全沿 AlignGuides 先例）：** 恒驻组 + 池化（Line/Sprite 预分配，update 只写缓冲）；AUX_LAYER + depthTest:false + renderOrder 1001；标签 = **canvas 纹理 Sprite**（DPR 感知 2x 绘制、`frame()` 相机距离自适应保屏幕恒定字号、文字变更才重绘纹理）；端点标记屏幕恒定 4px；组名 `__measure_overlay__`；dispose 释放全部几何/材质/纹理。**不引 CSS2DRenderer / troika 等新依赖**（自研先例延续；社区折中方案的 DOM 路线已否决——避开层叠秩序与每帧 DOM 同步，理由见调研 §三与阶段门 Q4）。

## §C 太阳位置纯函数（日照分析，T10.4）

```ts
// ── domain/solar（纯函数、零依赖；不引 suncalc——阶段门 Q7 裁定自研 NOAA 简式）──
export interface SunPosition { azimuth: number; elevation: number }  // 弧度；azimuth 自北顺时针
/** NOAA 简式太阳位置；hourUTC 为十进制小时（0–24），latitudeDeg 北纬为正。
 *  精度要求：参考值单测锁定（NOAA 官方示例数值 ±0.5° 内）。 */
export function solarPosition(dayOfYear: number, hourUTC: number, latitudeDeg: number): SunPosition;
```

- **环境通道扩展键 `environment.sun`**：`{ hour: number; dayOfYear: number; latitudeDeg: number }`（会话级——saveScene **剥离**，沿 renderMode 先例，T8.4；缺省无此键 = 预设固定太阳）。渲染：applyEnvironment 读键 → solarPosition → 太阳方向覆写（预设色温/强度不变），太阳位置 = 场景中心 + 方向 × 定距；阴影相机随向重配（多遍 shadowMap.autoUpdate 纪律不变，环境遍 true）。

## §D 场景统计报表（T10.3，纯数据聚合）

```ts
// ── domain（纯函数；输入 SceneData，输出聚合行）──────────────────
export interface SceneStatsRow {
  layerName: string;
  regionCount: number;      // 分语义细分计数见 subRows
  modelCount: number;
  areaSum: number;          // 水平投影面积合计（m²；region 多边形=core polygonArea，
                            //  圆/椭圆=参数化面积；line/point 计 0；model 不计面积）
  subRows: { semanticLabel: string; count: number; areaSum: number }[];  // region 按语义分节
}
export function computeSceneStats(data: SceneData): { rows: SceneStatsRow[]; total: Omit<SceneStatsRow, 'subRows' | 'layerName'> };
// 组壳（type 'group'）纯组织节点不计入任何行；隐藏图层照常统计（统计=数据口径非显示口径）
```

## §E 模式启用语义（T10.2/T10.3 落地）

- `MODES` 表 measure/analysis 两项 `enabled:false → true`（toolIA.ts:519-538）；`ALT_MODE_ORDER` 第 7/8 位 null → `'measure' / 'analysis'`（Alt+7/8 解绑预留位启用）。
- measure 模式：`verticalGroup: 'measure'`（垂直条新分组——四测量子工具按钮，**无数字键**，1–4 已占不扩位）；模式专属色新增令牌（DESIGN §5.22 登记）。
- analysis 模式：非工具型（`verticalGroup: null`），ContextToolbar 驱动（统计入口 + 日照 popover）；引导卡/HUD 徽标沿六联动体系。
- 测量子工具 id：`measure.distance / measure.height / measure.area / measure.angle`（ToolRegistry 注册制；一实现类 + kind 参数，沿 DrawToolBase shapeType 先例）。
- 菜单接线：`tool.measure` 占位（menuModel.ts:262）→「工具 → 测量」四子工具子菜单；`scene.stats` 占位（menuModel.ts:245）→「场景 → 场景统计」打开报表。`tool.annotate`（:263）**保持占位**（不在本期）。
