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

- [ ] T010.1 家族契约提炼与文件组织规范 → [010.1-family-contract.md](010.1-family-contract.md)
- [ ] T010.2 元数据与分类契约 → [010.2-metadata-taxonomy.md](010.2-metadata-taxonomy.md)
- [ ] T010.3 LOD 声明规范固化 → [010.3-lod-spec.md](010.3-lod-spec.md)
- [ ] T010.4 Shadow 公共能力规范 + 视觉验收 SOP → [010.4-shadow-visual-sop.md](010.4-shadow-visual-sop.md)
- [ ] T010.5 模板固化验收门 → [010.5-acceptance.md](010.5-acceptance.md)

依赖链：010.1 →（010.2 ∥ 010.3 ∥ 010.4）→ 010.5（010.3/010.4 规范面基于 T009.5/009.6 已落地契约，与 010.2 分类契约无依赖，无需串行等待）。

## 进度

- 2026-09-18 立项：植物资产路线 grill → D20，0/5。
