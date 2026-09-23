# Representation Runtime 规范（T021 · D41）

> T021 立项产出（2026-09-23，D41——grilling 三轮 16 题裁定 + 独立对抗审核修正）。**本文档为 LOD / Representation「运行面」唯一真相源**（选档 / 过渡 / 阴影策略 / 密度 / 批次 / 状态 / 键 / 路由 / 验收口径）；**「声明面」（资产如何声明可用表示与预算）唯一真相源仍为 `lod-spec.md`**——两面互指，声明面字段由 T021 各子任务增量修订。
> 取代关系：T006 的「level 统一语义」模型（D27 运行面条款 + D28 Step 3）由本文档部分取代；T006.1–6.5 与 T006.6 Step 1/2 的交付**保留为技术基线**（选档评估器 / 稳定基准球 / 分桶 / 批次 / 拾取 / 缓存所有权全部继续有效）。
> 编号说明：**T019 为颜色管线任务语义保留**（D29.3 / D39 引用，勿挪用）；本体系占用 T021。

## 一 · 背景与取代关系

T006 已交付并验证：LOD 公共选档语义、High 派生稳定基准球（T006.6 Step 2）、放置 `source × level` 与散布 `chunk × source × level` 分桶、hysteresis、批次抽稀与稀疏块合并、LOD 总开关、分布统计、拾取跨档保持、资源缓存与档位切换。**以上能力全部保留为实现基础，不回滚。**

被取代的核心模型：`High → Mid → Low → Culled` 的 level 统一语义。取代理由（均有代码实锤）：

1. `ProceduralLevel` 同时承担「资产几何档位」与「Runtime 远景表示」两个概念；
2. `Low`（1.5–3K 面级）是「低面数树」，不是「远景森林表示」；
3. `BATCH_POLICY.levelInstanceKeep.low = 0.5` 把几何降档与密度抽稀耦合；
4. `'culled'` 躺在类型联合里（`LodRepresentation = ProceduralLevel | 'culled'`），调度结果被当成表示档位；
5. 远景表示与阴影没有独立策略层，未来 Canopy / Impostor 无法自然接入三值模型。

T006.6 Step 3（A/B 实测 + 阈值重锁判定）注销原执行，迁入 T021.8 成为全链标定的组成部分（D41）。

## 二 · 核心原则：六概念分离

系统不再定义为「不同距离使用不同 LOD Mesh」，而是：

> **根据屏幕空间表现选择最合适的 Representation，并独立决定 Transition、Shadow、Density、Batch 与 Cull。**

```text
Camera / View → Visibility → Screen-space Representation Selection
  → Representation State → Transition → Shadow Policy → Density Policy
  → Batch / Chunk / Instance Submit → Render / Cull
```

六个概念必须独立，禁止重新合并成一个「LOD 档位」：

| 概念 | 回答的问题 |
|---|---|
| Selection | 什么时候切 |
| Representation | 切成什么 |
| Transition | 怎么切 |
| Shadow | 阴影怎么算 |
| Density | 要不要减少实例数量 |
| Batch | 怎么组织 GPU 提交 |

## 三 · Representation 模型

### 3.1 类型定义（第一阶段）

```ts
export type RuntimeRepresentation = 'high' | 'mid' | 'low' | 'canopy';
```

- **不含 `'impostor'`**：Impostor 是架构预留（§十六扩展契约），不进第一阶段类型联合、不写占位代码（延续 D27.7/D27.12 防幽灵字段纪律）。
- **`'culled'` 不是 Representation**：它是 Runtime 最终提交状态（submit state），从类型联合移出、独立建模。现有 `LodRepresentation` 类型原地演化退役（021.1）。
- **`ProceduralLevel`（`'high' | 'mid' | 'low'`）保留不动**，语义收窄为「资产可直接 Build 的几何档位」= Asset Build Capability；`RuntimeRepresentation` = Runtime Render Representation。禁止继续让 `ProceduralLevel` 充当远景表示的统一枚举。

### 3.2 资产能力声明（声明面）

有效链由资产实际能力驱动，不硬编码：AssetDescriptor 新增独立声明字段（首选 `representations?: RuntimeRepresentation[]`），`levels` 三值语义不污染。资产声明面细则与字段最终形态归 `lod-spec.md`（021.1 同步修订其 §2/§3）。

有效链示例（Runtime 按能力生成，不强制全链）：

```text
乔木（canopy 能力）：High → Mid → Canopy → Culled
无 canopy 旧资产：  High → Mid → Low   → Culled
单档资产 / GLB：    High → Culled
```

`Low` 是可用表示而非必经表示；乔木在 Canopy 建立后是否跳过 `Low` 由 021.8 视觉 + 性能实测判定。旧 Low 代码保留为兼容与 fallback，不立即删除。GLB 恒 `'high'` + 超远 culled（D28.5 不变）。

## 四 · 选档（Selection）

### 4.1 度量与屏幕占比

继续使用归一化视图度量 `m`（T006 语义不变，代码与下列公式逐操作符一致——`src/domain/lod/lodEvaluation.ts`）：

```text
透视：m = (d / r) × tan(fovY / 2)      r = 稳定基准球半径 × 实例 scale
正交：m = orthoHeight / (2r)
```

**screenFraction（资产直径 / 视口高度）= 1 / m**——调试与验收的统一解释口径（代码注释锚点：`m = 1` 恰好资产直径占满视口高度）。历史阈值 6 / 16 / 60 对应屏占比 **16.7% / 6.25% / 1.67%**。

禁止固定米数阈值（资产尺寸不同）；禁止像素口径作选档输入（仅验收报表）。

### 4.2 阈值与迟滞（全部候选化）

新链初值直接继承 legacy 映射：`highToMid = 6`、`midToCanopy = 16`、`canopyToCulled = 60`、迟滞带 `0.15`。**全部为 A/B 候选而非锁定值**，021.8 重锁；legacy `6/16/60` 仅作对照基线。

### 4.3 Selection Bounds 与 Render Bounds

- **SelectionBounds**：恒取 High 派生稳定基准球（T006.6 Step 2 交付，`src/runtime/lodReference.ts`），不随当前表示变化，不进资产声明（D28.4）。
- **RenderBounds**：当前表示的真实几何边界，用于视锥剔除；由 Source 契约随几何成套提供（§十一）。
- **Transition 期 Union 规则**：`Current ≠ Target` 且双表示同屏时，剔除边界 = Union(Current, Target)——禁止过渡期间一侧被提前剔除。

### 4.4 Selection Granularity / Transition Granularity（正式定义）

| 链 | 粒度 |
|---|---|
| 放置 Placement | per-object（逐放置对象） |
| 散布 Scatter | region × chunk × asset（四维，含 region 维度） |

Transition Granularity 与选档同粒度。散布桶选档代表 scale = **桶内最大实例 scale**（保守偏高档：大树更晚降档）。散布链无 shapeSlot 维度（`provideSource(assetId, level?)` 现状），canopy 侧同样按 assetId 派生。若实测证明 32m chunk 过粗，再单独升级 chunk 内多表示桶，不提前重构。

## 五 · 过渡（Transition）

Hysteresis（防震荡）与 Fade（防视觉 pop）是两回事，**不得共用参数**。

### 5.1 过渡类型（第一阶段默认）

```text
High ↔ Mid          硬切（既有视觉连续性已验证）
Mid / Low → Canopy  Dither Transition
Canopy → Culled     Fade Out
```

不要求所有表示双渲染；真正要解决的是「真实树 → 冠层代理」与「冠层 → 消失」两个跳变。

### 5.2 双表示共存与性能预算

Transition 期间 `Current` 与 `Target` 两套表示同时提交（dither 交叉）。预算红线：**双表示桶 draw call 增量 ≤ +30**（021.8 标定复核）；过渡带宽度定义在 metric 空间（候选比例，021.8 锁定）。放置链实例数上限暂不设（量级小）。

### 5.3 Fade 技术

采用 Dither / Alpha-Hash 风格过渡，不用普通透明度。实现注意：现有叶材质为 `alphaTest 0.5 + alphaToCoverage`，dither 阈值与 alphaTest 的**合成顺序**是 shader 交付必答题（park-shader-agent 简报必列）。放置对象允许逐实例 fade（实例可各自处于 1.0 / 0.7 / 0.2 态）；散布按 chunk × asset 粒度维护过渡态。

### 5.4 Transition Shadow

不做双 Shadow 交叉渐变：主渲染做 dither，Shadow 表示在**过渡中点**切换（Shadow Map 双表示叠加不值得）。

## 六 · Canopy Proxy（第一阶段新增表示）

Canopy Proxy 的目标不是「更低面数的树」，而是**以最低成本保持完整树冠的轮廓、体量、绿色覆盖率与树种级冠形特征**：

```text
   ████          保留：冠幅 / 轮廓 / 冠层体量 / 绿色覆盖率 /
 ████████        外密内疏 / 树种级冠形差异 / 基本阴影体量
██████████       不保留：远景不可辨枝条 / 单叶细节 / 近景树皮 /
 ██████          高成本叶片 SDF
    │
```

### 6.1 BroadleafCanopyProxy（统一实现）

全乔木共用一个 BroadleafCanopyProxy，输入 = Tree ShapeProfile + 冠层场（ClusterRecord）+ shapeSlot，输出 = Canopy Geometry + Canopy Material + Canopy Depth Material。**禁止每树种自建一套远景冠层算法**；**禁止脱离现有冠层数据另建树冠生成体系**（必须从现有 ClusterRecord / Low 档 shell-card 逻辑派生）。

**前置工作（021.6 第一项）**：`ClusterRecord` 现为 13 个树种几何文件各自独立定义（形状相同、无共享类型）——先抽出共享冠层场契约再实现 Proxy。

### 6.2 工程预算

**≤ 500 面 / 树**（冠层 shell + 简化树干预柱；对照 Low 档 1662–2150 面〔夏栎〕再压一个量级），021.6 内锁定并回写 lod-spec §5.2 预算表（canopy 列）。含简化树干——远景剪影缺主干会直接违反远景验收第 1 条。

### 6.3 风动契约（身份一致的强制延伸）

Canopy **必须接入同一风动体系**：同一 `uTime` 驱动 + 声明并消费同一 `aSeed` / `aBend` 顶点属性（先例：叶材质三档同源不动，档间风相位一致 = 身份一致，D19.7）。

**aSeed 前向兼容口径（D41）**：散布链实例当前无逐实例 aSeed（D20.4 已把散布侧 aSeed 修复留 T003 解冻后独立任务）——Canopy 材质从第一天声明 aSeed 属性，散布几何缺属性时按 GL 缺省 0（与散布 High/Mid 当前行为逐位一致，档间 0=0 同相成立）；未来 D20.4 修复落地后，High/Mid/Canopy 零改动同时获得逐实例相位。禁止为绕开该现状引入坐标哈希等第三套相位机制（dither 共存期同树双相位 = 可见脱同步）。

### 6.4 材质（光照模型）

简化受光：主光方向 lambert + IBL 环境项采样，树种级冠色 + 内外明暗梯度，**共享 T018 envMap / intensity 域**（MeshStandardMaterial 族自动吃 `scene.environment` / `environmentIntensity`，与 D29.2 全仓受光同构）。禁止 unlit 顶点色——远景占屏比大，预设切换（day/dusk/night/tech）不跟随是最易被抓的不一致。

### 6.5 Impostor（架构预留，不实装）

只有当「Canopy + 当前园区可见范围仍无法达到设备性能预算」成立才启动后续 Impostor 子任务。禁止现在引入 Atlas Baker / 多视角 Capture / Octahedral Atlas / Normal·Depth Atlas。扩展路径见 §十六。

## 七 · 阴影（Shadow Policy）

从主表示独立、由统一 Runtime 调度，三字段建模：

```ts
interface ShadowPolicy {
  cast: boolean;                              // 是否进 shadow pass
  receive: boolean;                           // 主渲染是否采样阴影
  depth: 'full' | 'simplified' | 'none';      // 深度表示
}
```

初始策略：High = `{cast: true, receive: true, depth: 'full'}`（现状）；Mid = depth `full / simplified` 由 A/B 定；Low / Canopy = `simplified`；Cull = `off`。**Canopy 初始 `receive = false`**（远景树冠采样阴影成本高、视觉贡献小——021.8 A/B 可开项；现状两链 cast/receive 统一 true，此为真实行为变化，必须进 A/B）。现状 cast/receive 由池建网格统一设 true，与档位无关——策略层落位后由表示驱动。

Canopy 不使用高成本叶片 SDF 深度材质，使用 Canopy Depth Material（仅保留冠层轮廓 + 主要空隙 + 基本体量）；**禁止远景 Shadow Pass 继续计算完整叶片级 SDF**。

冻结域：Shadow Camera（2048² / ±160 / near 1 / far 400 / bias −0.0004，D29.1）、T018 环境光照、Sun Direction 一律不动——只改「哪些表示参与 Shadow、用什么深度表示」。

## 八 · 密度（Density Policy）

`Representation = 树变成什么；Density = 树还保留多少棵`——完全独立。

第一阶段规则：High / Mid / Canopy 默认 **Density = 100%**，Cull = 0%。**不得自动继承旧 `low = 0.5`**（`levelInstanceKeep` 的密度职责整体废止，几何降档与密度抽稀解耦）。先解决「远处森林变稀」；若性能确需降密度，75% / 50% 作为独立 Density A/B 专项（§十四）单独验收视觉空洞——100% 达预算时不得为「进一步优化」默认降密。

## 九 · 批次（Batch Policy）

批次策略从绑定 `high/mid/low` 改为绑定 **representation**（`isBatchMergeAllowed(representation)` 形态）。Canopy 天然适合 `chunk × asset × canopy` 远景合批；第一版保留现有 32m chunk + 2×2 sparse merge（`sparseMergeMaxInstances 32` / `mergeGroupFactor 2`），实测 Canopy 桶数过多才提升区域级合批。`drawCallBudget = 650` 降格为 **Legacy Baseline**，T021 加入 Canopy / 双表示 / Shadow 表示后重测重锁（连同 Frame Time p95 / Triangle Budget / Shadow Cost）。

## 十 · 运行状态与缓存键

### 10.1 SelectionState（按粒度实例化）

```ts
interface SelectionState {
  current: RuntimeRepresentation;
  target: RuntimeRepresentation;      // 已决定要去的表示
  sourceReady: boolean;               // 目标表示 Source 是否就绪（pending 并入本标志）
  transition: number;                 // 0..1
  transitionActive: boolean;
}
```

放置链 per-object 一份、散布链每 (region × chunk × asset) 一份。Shadow / Density 是 Policy 层每帧派生视图，**不进状态体**；`selectionMetric` 等诊断量不进 Scene 持久化（档位每帧派生态，D27.6 延续）。

### 10.2 缓存键统一

源缓存维度统一为 **`sourceKey + representation`**；`ProceduralSourceCache` 现三分支收敛为二：声明表示能力 → `sourceKey::representation`；未声明 → 纯 `assetId`。「未声明多档」中间态（`assetId::level`）**现存唯一消费者 = streetlamp**（两档 levels、无 shapeFamily，T006.2 先例）——须先由 021.1 的 representations 声明收编入第一分支，021.7 方可删除该中间分支（收编完成前禁删，防 streetlamp 双档缓存静默塌缩为单档）。放置桶键 `sourceKey::representation`、散布桶键 `region × chunk × asset × representation`（`culled` 仍是 submit state 不是桶类型）。**representation 永远不进 sourceKey 形态身份计算**（D19/D23.2 延续）。

### 10.3 缓存与所有权

同 sourceKey 不重复 Geometry / Material；缓存边界升为 `sourceKey + representation` 双维；缓存不淘汰（天然有界）；**Source/Cache 拥有并释放 geometry / material / customDepthMaterial / bounds，Pool 只挂引用不 dispose**（既有契约，Canopy Source 与 Canopy Depth Material 同样遵守）。

## 十一 · 路由与 Source 契约

不重写现有 `ProceduralSourceCache` / `AssetSourceRouter` / `InstancedAssetPool`，渐进扩展出 **RepresentationSourceRouter** 门面（现有路由之上的表示感知层）：

```ts
provideRepresentationSource(assetId, seed, representation)
  → { geometry, material, customDepthMaterial?, bounds }
```

内部路由：`high/mid/low` → 现有 ProceduralSourceCache；`canopy` → BroadleafCanopyProxy / CanopySourceCache；未来 `impostor` → ImpostorSourceCache。`bounds`（球形，与选档度量同形）随几何成套、归 Source/Cache 所有——Pool / Scatter / Picking / Lifecycle / Shadow Hook 不需要知道表示的具体来源。散布链 `provideSource` 签名从 `(assetId, level?)` 演化为 `(assetId, representation?)`（021.7）。

## 十二 · 编辑态与拾取

**编辑态优先级（全新 Runtime pin 层，021.7）**：`selected` / `transforming` / `gizmo target` / `focusObjects` 目标（相机飞行期间）强制 `High + Shadow full + Fade 1`；Ghost / Preview 沿用现状固定 High（D27.14）。pin 在 Scheduler 层每帧生效、编辑结束恢复正常调度；**禁止为编辑态修改 Scene 持久数据**。

**拾取身份不变**：RuntimeObjectMap + InstancedMesh.instanceId + resolvePick 继续作为唯一对象身份来源；表示变化不得改动 objectId / seed / shapeSlot / Scene Object / Command / Undo·Redo。fade 期间仍可拾取；真 cull 后不可拾取。

## 十三 · 帧时序与统计

```text
controls.update → Camera/View update → Spatial Frustum Cull
  → Representation Selection → Transition update → Shadow Policy
  → Density Policy → Batch/Bucket submit → Render
```

`ScatterChunkManager.frame()` 与 `InstancedAssetPool.frameLod()` 不再各自独立决定完整表示语义——共享 domain 层统一调度语义（语义在 `src/domain/lod/` 纯函数、零 THREE；执行按各自粒度接线，沿用现行「语义在 domain、执行在 runtime」分层）。

分布统计升级口径：`currentRepresentation / targetRepresentation / transitioning / culled`，至少提供 `instances / buckets / transitionInstances / shadowCasterInstances`，诊断 High / Mid / Low / Canopy / Impostor / Culled / Transition 全集。

## 十四 · 验收与性能口径

**环境**：RTX 2080 Ti / WebGL2 / Chromium / 1920×1080 / DPR 1 / Shadow ON / 固定环境（T018 预设 day）。

**性能梯队**：1 / 20 / 100 / 500 / 1000 / **2000**（新增）+ 高密度园区混植。必记指标：FPS、frame time mean/p50/p95/max、draw calls、triangles、visible instances、representation distribution、transition instances、shadow cost、geometries、textures、programs。

**远景视觉验收**（固定 M25 / F50 机位〔shadow-visual-sop §3〕+ 远景园区总览 + representation transition probe）十条：①树冠不再「只剩树干」②远景绿色覆盖率连续 ③冠幅连续 ④树种级冠形可辨 ⑤无明显块状切换 ⑥无明显 dither 闪烁 ⑦Cull 不产生整片突然消失 ⑧无「树没了影子还在」⑨无森林空洞 ⑩相机连续移动无周期性跳变。

**Density 专项**：同表示不同密度（100/75/50）对比 forest coverage / 空洞率 / 视觉平均绿色覆盖 / FPS——100% 满足预算则不得默认降密。

**Fade 专项**：远离 / 靠近 / 往返 / 快速拖拽 / 慢速移动 / FOV 改变 × {无震荡、无重复重建、无闪烁、无明显 pop}；main render / depth / shadow / picking 四面状态同步。

**资源生命周期专项**：`sourceKey + representation` 缓存边界下，生成 → 删除 → 再生成循环 10 轮，geometry / texture / program 无持续增长；Canopy Source 与 Canopy Depth Material 所有权（Source owns / Pool references）与现有 customDepthMaterial 同规。

## 十五 · 禁止事项

```text
1.  重新建立 TreeLOD / VegetationLOD 类资产域专用体系
2.  在 asset.ts 里写距离阈值
3.  把固定米数写死成全资产 Cull 距离
4.  用 Fog 代替 Cull
5.  把 Density 抽稀与 Representation 绑定
6.  把 shapeSlot 混入 Representation identity
7.  把 representation 混入 sourceKey
8.  每种乔木写一套 Canopy Runtime
9.  先实现完整 Impostor 再验证 Canopy 是否足够
10. 修改 Scene 持久数据保存 LOD 状态
11. 修改 Tone Mapping
12. 修改 T018 Sky / IBL
13. 修改 Shadow Camera
14. 升级 Three.js
15. 新增重量级依赖
```

## 十六 · 扩展契约与执行路由

**新增一个 Representation（如未来 Impostor）= 且仅 =**：扩 `RuntimeRepresentation` 联合类型 + 注册一个 source provider（RepresentationSourceRouter 路由表加一行）+ 声明面 lod-spec 增量修订——不重写 Runtime。本契约由 021.1 落为类型与路由的开放式结构（资产能力声明驱动有效链），保证 §六.5 的预留承诺成立。

**T021 子任务与专业路由**：021.0 立项迁移（文档）→ 021.1 契约层（threejs-runtime-agent）→ 021.2 选档（threejs-runtime-agent）→ 021.3 过渡（机制 runtime + dither·alphaTest 合成 park-shader-agent）→ 021.4 密度/批次（threejs-runtime-agent）→ 021.5 阴影表示（runtime + Canopy Depth Material 归 park-shader-agent）→ 021.6 Broadleaf Canopy Proxy（几何/共享冠层场契约 procedural-asset-agent + 材质 park-shader-agent）→ 021.7 两链接线与编辑态 pin（threejs-runtime-agent）→ 021.8 标定与验收门（021.8 吸收 T006.6 Step 3）。子任务差异见 `tasks/021-*.md` 各任务书。
