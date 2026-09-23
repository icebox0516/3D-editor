# T021.1 Representation 契约层——验收取证

> 纯契约与类型面任务（无渲染行为变化、无视觉验收面、未拉 dev server）。取证 = 三门槛输出 + 契约落位证据。执行日 2026-09-23；执行 = threejs-runtime-agent，验收 = 主代理（三门槛亲自复跑）。

## 三门槛（验收环境复跑，全部通过）

| 门槛 | 结果 |
|---|---|
| `npm test` | **4041 全绿**（260 文件）= HEAD 基线 4024 + 新增 17 契约用例（`tests/domain/lod/representation.test.ts`） |
| `npm run check:layers` | 607 文件通过（domain 新模块 `representation.ts` 零 THREE 验证含内） |
| `npm run typecheck` | 零错——即 `LodRepresentation` 类型引用全量迁移零残留即证 |

基线说明：PROGRESS 快照 4023 为 T020 阶段二时点数；HEAD 提交 c6204be（单发视觉优化）自报 4024 全绿——+1 漂移早于本任务，本任务在 4024 基线上 +17 = 4041。

## 契约落位证据（D41 → 代码）

- `src/domain/lod/representation.ts`（新）：`RuntimeRepresentation = 'high'|'mid'|'low'|'canopy'`（无 impostor / 无 culled）；`LodSubmitState = 'culled'` 提交终态独立建模；`LodSelectionOutcome = RuntimeRepresentation | LodSubmitState` 承接旧联合全部语义槽位；`SelectionState`（§10.1 原文形状）；`ShadowPolicy`（§七三字段）；`RenderBounds`（球形 center+radius，与 SelectionBounds 分别命名）；`REPRESENTATION_ORDER` + `effectiveRepresentationChain` 能力驱动有效链纯函数（representations 优先 / levels 派生 / 均无 = 单档 high / 乱序归一 / 脏值防御）。
- `AssetDescriptor`：`ProceduralAssetMeta.representations?: RuntimeRepresentation[]` 独立声明字段；`ProceduralLevel` 注释收窄为 Asset Build Capability（三值不动）。
- `InstanceSource.bounds?: RenderBounds`（归 Source/Cache 所有，Pool 只挂引用——§十一/§10.3 注释锚点）；`runtime/loaders/RepresentationSourceRouter.ts`（新）：provider + 路由表类型（§十六开放式扩展：新增表示 = 扩联合 + 表加一行 + lod-spec 增量），不接线、无门面实例（归 021.7）。
- `streetlamp.asset.ts`：meta 增 `representations: ['high', 'low']`——「未声明多档」中间态唯一消费者收编入第一分支（D41 §10.2，ProceduralSourceCache 键逻辑一行未改、现行为逐位不变，分支删除归 021.7）。
- `lod-spec.md` §2.1/§2.2/§3 声明面条款改写（双轨类型表 / 缺省三态 / streetlamp 收编记档 / Culled 提交状态表述）。

## 行为不变性证据

- 选档 / 渲染 / 缓存键 / 分布计数数值全部零变化；唯一数据面变化 = streetlamp meta 增可选声明字段（无消费者）。
- 既有测试改写仅两文件且均机械：`lodEvaluation.test.ts`（类型名迁移，行为断言一字未改）、`lodDistribution.test.ts`（Record 键位补 `canopy: 0` 共 6 处字面量，计数断言数值不变）。
- canopy 相关分支（评估器名义上界 / 两链 `if (next === 'canopy') continue`）均为 021.2 前运行时不可达的类型完备防御。
