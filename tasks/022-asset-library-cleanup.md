# T022 资产库清理（浏览器简化 + 低模植物删除 + 记档）

状态：pending ｜ 立项 2026-09-24（资产库扩充方向共识会话，用户确认）

## Goal

正式扩充资产库前的清障：内容浏览器收敛为一行大分类（删标签行与左侧栏全部功能）；删除 T003 时代冻结的四个低模植物及全部引用；三项架构裁定落 DECISIONS。

## 前置

- 无硬前置（与 T021.7/.8 无依赖；建议先于 T023 spine 提取 / T024 色卡执行）

## Research Gate 留痕

Status: waived — Reason: 清理任务，非程序化资产生产，无现实对象定义依赖；删除对象为已冻结占位资产（003.4，D19 路线）。

## 待裁决位（2026-09-24 共识，执行时不再复议）

1. 浏览器只保留 `ed-browser__bar`；`ed-browser__tags`（含排序下拉，排序能力一并移除不保留）与 `ed-browser__rail` 全删
2. bar 分类键维持现状：程序化 `meta.category` + GLB 目录 slug 混排自动派生、零手写表；不迁移 taxonomy 八大类值域
3. rail 与 bar 共用的持久化 `workspaceStore.browser.category` + `selectCategory` 保留给 bar；`browser.search / browser.expanded` 不动
4. T016 资产管理器取消（浏览器一行大分类即终态）；taxonomy 契约降位纯元数据（family 值随各族落地继续补，不驱动任何导航）
5. 四低模植物纯删除不留替补（13 种乔木四档表示已覆盖用途）；D19「v1 四植物不动」废止
6. `.ed-chip` 共享样式（RegionQuickApply / BatchRenameDialog / ContextToolbar / ContextActions 共用）不动
7. asset-research SKILL.md §3 照片槽示例标注「树族当前值」（本任务一并收口）

## Scope

### A. 浏览器简化

- `src/ui/panels/ContentBrowser.tsx`：删 `RailSelection` 类型、`rail` 变量、`tagFilter`/`sortKey` state、`tagChips` memo、`railItem()` 工厂、`sortAssets`/`buildTagChips`/`AssetSortKey` 导入；`visible` memo 收窄（收藏过滤分支改读共用分类值，移除 tag/sort 依赖）；文件头注释与展开态结构同步
- `src/ui/panels/browserModel.ts`：删 `buildTagChips` / `sortAssets` / `AssetSortKey` / `filterAssets` 的 `tag` 参数；`categoryMarkColor`（rail 分类色点）确认 bar 无消费后删；`buildCategories` / `favoriteCount` / 排序档保留给 bar
- `src/ui/styles/app.css`：删 rail 整块（≈:2065-2130）与 tags/sort 整块（≈:3761-3784）；`ed-browser__body` flex 布局收窄为纯 grid
- `src/ui/styles/DESIGN.md`（≈:163-165）：三行规格改一行 bar 规格
- workspaceStore / layoutPresets：零改动（`browser.category` 保留给 bar）

### B. 浏览器测试

- `tests/ui/panels/browserModel.test.ts`：删 `buildTagChips` / `sortAssets` / `filterAssets` tag 分支用例；`categoryMarkColor` 用例随实现处置；`buildCategories` 与收藏分支（经 bar）保留
- `tests/ui/layout/workspaceStore.test.ts`：保留（状态未删）

### C. 四低模植物删除

- 删 `src/runtime/procedural/assets/` 下 `asset_oak` / `asset_pine` / `asset_shrub` / `asset_flower` 四个 `.asset.ts`
- `tests/app/bootstrap.test.ts`：注册账目 23→19（glob 字典序同步）
- `tests/app/phase1.acceptance.test.ts`：数量断言 + procedural id 清单去四者（注释一并更新）
- `tests/runtime/procedural/assets/plantAssets.test.ts` / `plantMaterials.test.ts`：四资产专属用例删除；若文件承载公共工具测试则换现役 id fixture（按实际覆盖裁定）
- `tests/runtime/procedural/assets/assetTaxonomy.test.ts`：删 4 行声明锁定
- `tests/domain/assets/shapeFamily.test.ts`：`asset_shrub` fixture 换现役资产 id
- `tests/io/sceneSerializer.region-seed.test.ts`（oak/pine）、`tests/registries/StylePresetRegistry.test.ts`（oak）、`tests/ui/panels/ScatterParamsForm.test.ts`（oak/pine/flower）：fixture 换现役 id
- 注释清理：`asset_tree_3a.asset.ts` ≈:71、`asset_tree_3a.test.ts` ≈:74「参照 asset_oak 量级」改现役口径

### D. 文档与记档

- TASKS.md：T003.4 行终态收口（资产已删）；本任务勾选
- `tasks/003-scatter-styles.md`（≈:44/:57）：引用行加删除记注
- `docs/procedural-assets/metadata-taxonomy.md`（≈:68/:74-77）：taxonomy 表删 4 行
- DECISIONS.md 新条：浏览器简化 + T016 取消 + D19 废止 + taxonomy 降位（一次记档，注明 2026-09-24 共识会话用户裁定）

## 特殊 Acceptance

- 触代码执行面 → `npm test` 全量零回归（注册账目更新后基线随动）；`check:layers` / `typecheck` 恒跑
- 视觉冒烟：浏览器展开态截图——bar 一行可切换分类（含全部/收藏）、无左栏无标签行、资产网格占满 body；console 零错误零警告
- `ed-browser__tags` / `ed-browser__rail` 在 src 全域零残留（DESIGN.md 同步后含样式文档）

## 取证路径

`docs/acceptance/T022/`（独立任务，无 epic）
