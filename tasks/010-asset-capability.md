# T010 程序化资产公共能力与规范

> 立项：2026-09-18 植物资产路线 grill（→ D20）。前置：T009 全部 + T008.5 收官。

## Goal

从夏栎代码中提炼可复制的「方法」（而非复制代码）：家族契约、文件组织规范、元数据与分类契约、LOD/Shadow 声明规范、视觉验收 SOP——使后续植物（及一切程序化资产）按模板批量生产。**不是建立独立的植物平台**：公共能力从真实消费者中提炼（夏栎为第一实例；T011 新树种出现后按需增量修订契约，不提前抽象）。

## Requirements

- **家族契约**（010.1）：BroadleafShapeConfig / BroadleafBranchProfile / BroadleafCanopyProfile 等类型契约，算法仍由资产控制；夏栎迁移为契约第一实例
- **元数据与分类契约**（010.2）：大类 enum + 可选 family；植物语义放 proceduralProfile / family 层，不进公共 AssetDescriptor
- **LOD 声明规范**（010.3）：levels 声明/消费契约文档化（T009.6 落地能力的规范面）+ 家族预算表规范 + T006 接缝
- **Shadow 公共能力规范 + 视觉验收 SOP**（010.4）：T009.5 契约的规范面；十项视觉检查单；固定机位取证规范；性能验收流程模板；新增植物资产 SOP（Reference Research 前置）
- **模板固化验收门**（010.5）：夏栎迁移零回退 + 规范齐备 + T011 启动条件确认

## Scope

- 预期触碰：夏栎文件重组（推荐结构）、AssetDescriptor 分类扩展、规范文档（docs/）
- 不碰：Asset Runtime 重做、GLB 行为、T006 实现

## Acceptance（epic 级，010.5 执行）

- 夏栎迁移后对照 T009.7 基线零回退（观感 + 性能）
- 全部规范文档落档；`npm test` / `check:layers` / `typecheck` 全绿
- T011（第一批阔叶乔木）启动条件确认

## Constraints

- 四文件是推荐结构不是契约（最小 = asset.ts 单文件）
- 不建完整 BroadleafTreeGenerator 框架——只提炼 Family Contract
- 植物语义（crownWidth 等）不得泄漏进公共资产协议
- T010 启动时若 T009 实际形态与 D20 预期偏差大，可补一次轻量拷问门

## 子任务（2026-09-18 立项拆分，D16 会话粒度）

- [x] T010.1 家族契约提炼与文件组织规范（done 2026-09-19：Broadleaf 家族类型契约 51 字段全消费佐证 + 夏栎四文件重组第一实例 + 命名规范（broadleaf* 专属家族层）+ organization.md 三级边界落档；2542 全绿零回退）→ [010.1-family-contract.md](010.1-family-contract.md)
- [x] T010.2 元数据与分类契约（done 2026-09-19：taxonomy.ts 大类 8 值+family 6 值 + 11 资产归类映射 + proceduralProfile 通用维度（植物术语禁入公共协议）+ metadata-taxonomy.md 契约文档；2547 全绿 UI 行为不变）→ [010.2-metadata-taxonomy.md](010.2-metadata-taxonomy.md)
- [x] T010.3 LOD 声明规范固化（done 2026-09-19：lod-spec.md 立为 LOD 规范唯一真相源——声明/消费契约+六档语义集+选档语义+家族预算表+T006 接缝；纯文档零行为改动）→ [010.3-lod-spec.md](010.3-lod-spec.md)
- [x] T010.4 Shadow 公共能力规范 + 视觉验收 SOP（done 2026-09-19：shadow-visual-sop.md——Shadow 分口径规范+十项视觉检查单+固定机位取证+性能验收模板+新增植物 SOP；纯文档零代码）→ [010.4-shadow-visual-sop.md](010.4-shadow-visual-sop.md)
- [ ] T010.5 模板固化验收门 → [010.5-acceptance.md](010.5-acceptance.md)

依赖链：010.1 →（010.2 ∥ 010.3 ∥ 010.4）→ 010.5（010.3/010.4 规范面基于 T009.5/009.6 已落地契约，与 010.2 分类契约无依赖，无需串行等待）。

## 进度

- 2026-09-18 立项：植物资产路线 grill → D20，0/5。
- 2026-09-19 T010.1 完成（1/5）：家族契约（BroadleafShapeProfile = Canopy 34 + Branch 13 扁平 + 4 嵌套，51 字段全消费佐证；T009.3 消费语义并入）+ 夏栎迁移第一实例（tree/tree3a/ 四文件 + broadleaf* 前缀让出家族层）+ `docs/procedural-assets/organization.md`（三级边界/两档结构/命名规范/方法论六条）；2542 全绿、逐位零回退、取证 `docs/acceptance/t010/010.1/`。010.2/010.3/010.4 解锁（可并行）。
- 2026-09-19 T010.2/010.3/010.4 并行完成（4/5，三子代理并行交付 + 主代理合并验收）：010.2 触代码（taxonomy 必填 + proceduralProfile + 契约测试 +5 → 2547）｜010.3/010.4 纯文档（lod-spec.md / shadow-visual-sop.md，零行为改动）；统一三门槛 2547 / 182 文件、check:layers 449、typecheck 零错。010.5 模板固化验收门解锁。
