# TASKS

> 任务地图（D24）：Current / Next / Done + 状态摘要 + 链接，仅导航用途。epic 总纲 = `tasks/0XX-*.md`（子任务勾选表 + epic 内依赖），子任务 = `tasks/0XX.N-*.md`（头部状态/前置字段 + 完成记录）——**状态与依赖的事实源是任务文件，本文件摘要与之冲突时以任务文件为准；修改依赖只改任务书，不动本文件**。

## Current

- [ ] T008 程序化树木（4/6）→ [tasks/008-procedural-tree.md](tasks/008-procedural-tree.md)
  - [ ] T008.6 夏栎视觉参考研究（锚点门已过，可启动；T009 前置）→ [tasks/008.6-plant-reference.md](tasks/008.6-plant-reference.md)
  - [ ] T008.5 T008 收官验收门（修订版 → D20，后置于 T009 全部完成）→ [tasks/008.5-acceptance.md](tasks/008.5-acceptance.md)
  - [x] T008.4 放置全链路集成（done 2026-09-18；+22 测试 → 2443 全绿；Ghost 携 seed / 重掷命令 / 孪生 / 存档 e2e + 冒烟零错误）→ [tasks/008.4-placement-integration.md](tasks/008.4-placement-integration.md)
  - [x] T008.3 叶/树皮材质+风动（done 2026-09-18；锚点门过：近观 R1 四项微调一轮终裁定稿，+24 测试 → 2421 全绿）→ [tasks/008.3-leaf-shader-wind.md](tasks/008.3-leaf-shader-wind.md)
  - [x] T008.2 树几何生成器·slot-0 锚点形态（done 2026-09-17）→ [tasks/008.2-tree-geometry.md](tasks/008.2-tree-geometry.md)
  - [x] T008.1 契约增量+uTime 基建（done 2026-09-17）→ [tasks/008.1-contract-infra.md](tasks/008.1-contract-infra.md)
- [❄] T003 Scatter Styles（2/6；冻结 2026-09-17，恢复入口见任务书）→ [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
  - [~] T003.3 Style 配方+序列化（代码完成，验收中断冻结——交接快照见任务书）→ [tasks/003.3-style-recipe.md](tasks/003.3-style-recipe.md)
  - [~] T003.4 植物资产 4 种（代码完成；返工升格 T008 路线（D19），冻结）→ [tasks/003.4-plant-assets.md](tasks/003.4-plant-assets.md)
  - [x] T003.2 分块实例化管线（done 2026-09-16）→ [tasks/003.2-chunk-pipeline.md](tasks/003.2-chunk-pipeline.md)
  - [x] T003.1 撒点纯函数（done 2026-09-16）→ [tasks/003.1-scatter-function.md](tasks/003.1-scatter-function.md)
- [x] T002 Procedural Assets（5/5，epic 收官 2026-09-16）→ [tasks/002-procedural-assets.md](tasks/002-procedural-assets.md)
  - [x] T002.5 T002 验收门（done 2026-09-16；近观材质截图留档待用户过目）→ [tasks/002.5-acceptance.md](tasks/002.5-acceptance.md)
  - [x] T002.4 设施资产包 5 种（done 2026-09-16）→ [tasks/002.4-facility-assets.md](tasks/002.4-facility-assets.md)
  - [x] T002.3 放置+烘焙式变体（done 2026-09-16）→ [tasks/002.3-placement-variation.md](tasks/002.3-placement-variation.md)
  - [x] T002.2 资产库混排+缩略图（done 2026-09-16）→ [tasks/002.2-browser-mixing.md](tasks/002.2-browser-mixing.md)
  - [x] T002.1 注册与生成契约（done 2026-09-16；grill 门过 → D17）→ [tasks/002.1-asset-contract.md](tasks/002.1-asset-contract.md)

## Next

- [ ] T003 收官路径（冻结 2026-09-17；剩余 003.3 验收续走 / 003.5 / 003.6 / 设施返工）→ [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
- [ ] T004 Style Gallery（0/3）→ [tasks/004-style-gallery.md](tasks/004-style-gallery.md)
- [ ] T005 Animation Pathway（0/3）→ [tasks/005-animation-pathway.md](tasks/005-animation-pathway.md)
- [ ] T006 LOD Chunking（0/4）→ [tasks/006-lod-chunking.md](tasks/006-lod-chunking.md)
- [ ] T007 Bake Scatter（可选；启动前 grill 拷问门见任务书）→ [tasks/007-bake-scatter.md](tasks/007-bake-scatter.md)
- [ ] T009 夏栎结构真实性与生产化（0/7；2026-09-18 立项 → D20）→ [tasks/009-tree-realism.md](tasks/009-tree-realism.md)
- [ ] T010 程序化资产公共能力与规范（0/5；2026-09-18 立项 → D20）→ [tasks/010-asset-capability.md](tasks/010-asset-capability.md)
- [ ] T011 第一批阔叶乔木：朴树 / 香樟 / 榉树 / 银杏【占位】
- [ ] T012 针叶族【占位】
- [ ] T013 花木族【占位】
- [ ] T014 灌木族【占位】
- [ ] T015 地被/草本族【占位】
- [ ] T016 资产管理器重构（大类→小类、GLB+程序化统一入口；启动前独立拷问门 D21）【占位】
- [ ] T017 多边形区域生成重构 · Feature Generator 体系（启动前独立拷问门 D21）【占位】

## Done

- [x] T001 Docs Bootstrap → [tasks/001-docs-bootstrap.md](tasks/001-docs-bootstrap.md)
