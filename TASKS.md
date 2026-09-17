# TASKS

> 任务索引板：epic 行带子任务进度 (n/m)，Current 指向当前子任务。epic 总纲在 `tasks/0XX-*.md`（含子任务勾选表）；会话粒度子任务在 `tasks/0XX.N-*.md`（头部状态字段 + 会话结束必写完成记录）。

## Current

- [ ] T008 程序化树木（2/5；2026-09-17 grill 拷问门过立顶，D19 落档；**008.3 尾锚点定调 = 唯一人工阻断门**）→ [tasks/008-procedural-tree.md](tasks/008-procedural-tree.md)
  - [~] T008.3 叶/树皮材质+风动（**代码段 done 2026-09-17**：park-shader-agent 交付，+22 测试 → 2419 全绿三重门槛过；8 图取证存 docs/acceptance/t008/008.3/，风动冻结对 0.000% 逐位一致；**锚点门待用户裁定**——视觉通道断连，观感首验即用户）→ [tasks/008.3-leaf-shader-wind.md](tasks/008.3-leaf-shader-wind.md)
  - [ ] T008.4 放置全链路集成（锚点门过后才可启动）→ [tasks/008.4-placement-integration.md](tasks/008.4-placement-integration.md)
  - [ ] T008.5 扩 8 槽+验收门（含同 sourceKey 共享验证）→ [tasks/008.5-acceptance.md](tasks/008.5-acceptance.md)
  - [x] T008.2 树几何生成器·slot-0 锚点形态（done 2026-09-17；+21 测试 → 2397 全绿；结构计数固定⇒面数恒定 32064，aLeafRand/aBend 几何契约冻结）→ [tasks/008.2-tree-geometry.md](tasks/008.2-tree-geometry.md)
  - [x] T008.1 契约增量+uTime 基建（done 2026-09-17；+45 测试 → 2376 全绿；aSeed geometry 绑定 + 带 seed 池单实例仍 InstancedMesh 两裁定落档）→ [tasks/008.1-contract-infra.md](tasks/008.1-contract-infra.md)
- [❄] T003 Scatter Styles（2/6；**冻结 2026-09-17 待 T008 树协议稳定后恢复**——003.3 验收续走/003.5/003.6/设施返工全挂起；41 项未提交变更原状挂账）→ [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
  - [~] T003.3 Style 配方+序列化（代码全量完成、三重门槛 2331 全绿，浏览器验收中断于「实例可见性确认」，恢复入口=任务书交接快照；未提交）→ [tasks/003.3-style-recipe.md](tasks/003.3-style-recipe.md)
  - [~] T003.4 植物资产 4 种（代码完成 +70 测试，观感裁定已升格 T008 全新路线处理（D19）；未提交）→ [tasks/003.4-plant-assets.md](tasks/003.4-plant-assets.md)
  - [x] T003.2 分块实例化管线（done 2026-09-16；+24 测试 → 2192 全绿）→ [tasks/003.2-chunk-pipeline.md](tasks/003.2-chunk-pipeline.md)
  - [x] T003.1 撒点纯函数（done 2026-09-16；+25 测试 → 2168 全绿）→ [tasks/003.1-scatter-function.md](tasks/003.1-scatter-function.md)
- [x] T002 Procedural Assets（5/5，epic 收官 2026-09-16；验收门全项过：41 对象 GUI 取证 14 图 + 合批实测 + 撤销链字节级验证 + console 零错误，2143 全绿）→ [tasks/002-procedural-assets.md](tasks/002-procedural-assets.md)
  - [x] T002.5 T002 验收门（done 2026-09-16；近观材质截图留档待用户过目）→ [tasks/002.5-acceptance.md](tasks/002.5-acceptance.md)
  - [x] T002.4 设施资产包 5 种（done 2026-09-16；两阶段派发 threejs-expert+park-shader-agent，+63 测试 → 2143 全绿）→ [tasks/002.4-facility-assets.md](tasks/002.4-facility-assets.md)
  - [x] T002.3 放置+烘焙式变体（done 2026-09-16；+48 测试 → 2080 全绿）→ [tasks/002.3-placement-variation.md](tasks/002.3-placement-variation.md)
  - [x] T002.2 资产库混排+缩略图（done 2026-09-16；+19 测试 → 2032 全绿）→ [tasks/002.2-browser-mixing.md](tasks/002.2-browser-mixing.md)
  - [x] T002.1 注册与生成契约（done 2026-09-16；grill 门过，裁定 D17；+24 测试 → 2013 全绿）→ [tasks/002.1-asset-contract.md](tasks/002.1-asset-contract.md)

## Next

- [ ] T003 收官路径（**冻结 2026-09-17，T008 树协议稳定后恢复**）：①~~资产观感方向讨论~~（已升格为 T008 全新路线，D19）；②003.3 验收续走（中断点见任务书交接快照）→ 双笔 commit（003.3/003.4 分笔）；③003.5 绿地样式 5 种 → 003.6 验收门 → [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
- [ ] T004 Style Gallery（0/3）→ [tasks/004-style-gallery.md](tasks/004-style-gallery.md)
- [ ] T005 Animation Pathway（0/3）→ [tasks/005-animation-pathway.md](tasks/005-animation-pathway.md)
- [ ] T006 LOD Chunking（0/4）→ [tasks/006-lod-chunking.md](tasks/006-lod-chunking.md)
- [ ] T007 Bake Scatter（后置可选，不拆；启动前过 grill 拷问门）→ [tasks/007-bake-scatter.md](tasks/007-bake-scatter.md)

## Done

- [x] T001 Docs Bootstrap → [tasks/001-docs-bootstrap.md](tasks/001-docs-bootstrap.md)

---

> 子任务依赖速查：T002 内 002.1→002.2→002.3 刚性，002.4 仅依赖 002.1，002.5 依赖全部；T003 内 003.1/003.2 仅依赖 002.1，003.3 依赖 003.1+003.2，003.4 仅依赖 002.1，003.5 依赖 003.3+003.4；T008 内 008.1→008.2→008.3→【锚点人工门】→008.4→008.5 刚性（门未过 008.4/008.5 不得启动）；各 epic 验收门（x.x.N 末位）依赖本 epic 全部内容子任务。grill 拷问门：T002.1 开工前、T003.3 开工前、T008 开工前（2026-09-17 已过 → D19）、T007 启动前（议题见各自任务书）。
