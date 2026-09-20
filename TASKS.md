# TASKS

> 任务地图（D24）：Current / Next / Done + 状态摘要 + 链接，仅导航用途。epic 总纲 = `tasks/0XX-*.md`（子任务勾选表 + epic 内依赖），子任务 = `tasks/0XX.N-*.md`（头部状态/前置字段 + 完成记录）——**状态与依赖的事实源是任务文件，本文件摘要与之冲突时以任务文件为准；修改依赖只改任务书，不动本文件**。

## Current

- [~] T011 第一批阔叶乔木（2/5；011.2 香樟 done 2026-09-20：常绿阔叶首个实例——零修改第三实例化、全缘 SDF 零齿载波 + 离基三出脉/腺窝探针实证、Step 4b 革质光泽 0.62→0.50 一轮校准、十项适用项全过（2 例视觉疑读机器否证）、2842 零回归、跨会话恢复收官；下一步 011.3 榉树）→ [tasks/011-broadleaf-trees.md](tasks/011-broadleaf-trees.md)

## Done（近）

- [x] T006 Asset Runtime LOD（**5/5 epic 收官 2026-09-19**；通用 Runtime LOD 调度完整交付，策略常量实测锁定；收官后 D28 追加演进任务 006.6 见 Next）→ [tasks/006-lod-chunking.md](tasks/006-lod-chunking.md)
  - [x] T006.5 T006 验收门（done 2026-09-19：双档达标——城市 10 万路灯 175-190fps/531≤650、园区 2 万树 206-229fps@1080p（核显 BIOS 禁用→2080 Ti 实测+临界外推+遗留核显复验）；范围门三项全绿 Impostor 不立项；树 A/B 207↔17fps；换档序列无震荡+diff 不超运动基线；LOD_THRESHOLDS/BATCH_POLICY 候选→锁定；2657 零回归）→ [tasks/006.5-acceptance.md](tasks/006.5-acceptance.md)
  - [x] T006.1 LOD 公共语义层（done 2026-09-19：evaluateLodRepresentation 纯函数 + 候选阈值常量 + 总开关语义；+38 测试 → 2585 全绿）→ [tasks/006.1-lod-semantics.md](tasks/006.1-lod-semantics.md)
  - [x] T006.2 非植物第二资产档位验证（done 2026-09-19：路灯 High/Low 两档 328/136 面 + SourceCache 无族多档键 assetId::level 扩展；+16 测试）→ [tasks/006.2-second-asset-levels.md](tasks/006.2-second-asset-levels.md)
  - [x] T006.3 块×档分桶+换档（done 2026-09-19：两链接线评估器——散布 chunk×source×level / 放置 source×level 跨桶迁移 + 迟滞 + 拾取跨档一致 + 总开关；+23 测试，合并态 2624 全绿）→ [tasks/006.3-chunk-lod-bucketing.md](tasks/006.3-chunk-lod-bucketing.md)
  - [x] T006.4 批次控制（done 2026-09-19：BATCH_POLICY 候选常量 + 确定性抽稀 + 粗档稀疏块 2×2 超块合并 + 桶级提交跳过 + 预算 650 节流告警 + LOD 分布双口径；10 万实例 531≤650 压测留档；+33 测试 → 2657 全绿）→ [tasks/006.4-batch-control.md](tasks/006.4-batch-control.md)

- [x] T010 程序化资产公共能力与规范（**5/5 epic 收官 2026-09-19**）→ [tasks/010-asset-capability.md](tasks/010-asset-capability.md)
  - [x] T010.5 模板固化验收门（done 2026-09-19：夏栎零回退复核全过——锚点/8 槽 stats 逐位、8 机位像素 diff 99%+ 一致视觉核验、五档性能全过且资源账目逐位同；规范齐备互指一致；T011 启动条件确认就绪；2547 全绿）→ [tasks/010.5-acceptance.md](tasks/010.5-acceptance.md)
  - [x] T010.1 家族契约提炼与文件组织规范（done 2026-09-19；2542 全绿零回退）→ [tasks/010.1-family-contract.md](tasks/010.1-family-contract.md)
  - [x] T010.2 元数据与分类契约（done 2026-09-19：taxonomy 大类+family 枚举 + 11 资产映射 + proceduralProfile 植物语义隔离；+5 测试 → 2547 全绿）→ [tasks/010.2-metadata-taxonomy.md](tasks/010.2-metadata-taxonomy.md)
  - [x] T010.3 LOD 声明规范固化（done 2026-09-19：lod-spec.md 唯一真相源；纯文档零行为改动）→ [tasks/010.3-lod-spec.md](tasks/010.3-lod-spec.md)
  - [x] T010.4 Shadow 公共能力规范 + 视觉验收 SOP（done 2026-09-19：shadow-visual-sop.md；纯文档零代码）→ [tasks/010.4-shadow-visual-sop.md](tasks/010.4-shadow-visual-sop.md)

- [x] T008 程序化树木（**6/6 epic 收官 2026-09-19**；树协议冻结为稳定基线）→ [tasks/008-procedural-tree.md](tasks/008-procedural-tree.md)
  - [x] T008.5 T008 收官验收门（done 2026-09-19：全链路 + 同 sourceKey 合批三次实证 + 零错误五拆 + 8 槽终态复核全过；2542 全绿）→ [tasks/008.5-acceptance.md](tasks/008.5-acceptance.md)
  - [x] T008.6 夏栎视觉参考研究（done 2026-09-18：spec 1.0 + plant-schema v0.2 + 对照 7/3/6/2；用户过目门按放行处置——「继续任务」指令后问询未获回答，异议窗口开放，见任务书处置记档）→ [tasks/008.6-plant-reference.md](tasks/008.6-plant-reference.md)
  - [x] T008.4 放置全链路集成（done 2026-09-18；+22 测试 → 2443 全绿；Ghost 携 seed / 重掷命令 / 孪生 / 存档 e2e + 冒烟零错误）→ [tasks/008.4-placement-integration.md](tasks/008.4-placement-integration.md)
  - [x] T008.3 叶/树皮材质+风动（done 2026-09-18；锚点门过：近观 R1 四项微调一轮终裁定稿，+24 测试 → 2421 全绿）→ [tasks/008.3-leaf-shader-wind.md](tasks/008.3-leaf-shader-wind.md)
  - [x] T008.2 树几何生成器·slot-0 锚点形态（done 2026-09-17）→ [tasks/008.2-tree-geometry.md](tasks/008.2-tree-geometry.md)
  - [x] T008.1 契约增量+uTime 基建（done 2026-09-17）→ [tasks/008.1-contract-infra.md](tasks/008.1-contract-infra.md)
- [x] T009 夏栎结构真实性与生产化（**7/7 epic 收官 2026-09-19**）→ [tasks/009-tree-realism.md](tasks/009-tree-realism.md)
  - [x] T009.7 四类验收门（done 2026-09-19：性能 1/20/100/500/1000=710/426/267/82/49 FPS 全过 + 资源契约五条 + 结构/视觉/变体全过 + 回归 2542 全绿；vsync-off 口径记档；T009.5 同会话汇入）→ [tasks/009.7-acceptance.md](tasks/009.7-acceptance.md)
  - [x] T009.5 公共 Shadow 能力（done 2026-09-19：customDepthMaterial 契约 + 池挂载 + dispose 链 + 夏栎首验同源消费；+11 测试）→ [tasks/009.5-shadow-path.md](tasks/009.5-shadow-path.md)
  - [x] T009.1 枝干结构真实性（done 2026-09-18：shapeProfile 参数面 + 主次分级 + 冠内通透三规则；29520 面 -8%；+9 测试 → 2452 全绿；四机位取证 `docs/acceptance/t009/009.1/`）→ [tasks/009.1-branch-structure.md](tasks/009.1-branch-structure.md)
  - [x] T009.2 夏栎叶簇生成（done 2026-09-18：枝梢驱动叶簇 + SDF 倒卵形/5 裂/耳形 + 叶背粉绿；35058 面；+7 测试 → 2459 全绿；六机位取证 `docs/acceptance/t009/009.2/`）→ [tasks/009.2-leaf-cluster.md](tasks/009.2-leaf-cluster.md)
  - [x] T009.3 8 槽形态向量表（done 2026-09-18：8 组 shapeProfile 差量展开 + mountSlots 批量出图面；用户裁定门两轮批量 8/8 通过定稿零微调；+14 测试 → 2473 全绿；取证 `docs/acceptance/t009/009.3/`）→ [tasks/009.3-shape-slots.md](tasks/009.3-shape-slots.md)
  - [x] T009.4 树皮近景微起伏（done 2026-09-18：emitTube 低频环向谐波起伏（零 rng/拓扑恒等/法线解析修正）+ 树皮灰度校正 #63513f→#5c534a 并行交付；+9 测试 → 2482 全绿；四机位 vs 009.3 基线取证 `docs/acceptance/t009/009.4/`）→ [tasks/009.4-bark-relief.md](tasks/009.4-bark-relief.md)
  - [x] T009.6 夏栎 LOD 三档（done 2026-09-19：三档同流派生 + 材质 9 键分档 + 缓存 sourceKey::level 双维 + asset 路由/meta 三档；预算锁定 High ≤40K / Mid 6–10K / Low 1.5–3K；+32 测试 → 2514 全绿；7 图取证 `docs/acceptance/t009/009.6/`）→ [tasks/009.6-lod-levels.md](tasks/009.6-lod-levels.md)
- [❄] T003 Scatter Styles（3/6；003.3 收官 2026-09-19，冻结其余——恢复入口见任务书）→ [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
  - [x] T003.3 Style 配方+序列化（done 2026-09-19：验收续走收官端到端全过，中断点=验收读数误判非 bug；2542 全绿）→ [tasks/003.3-style-recipe.md](tasks/003.3-style-recipe.md)
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

- [ ] T006.6 LOD 选档稳定基准（D28 收官后追加；Step 1 测试先行 + Step 2 稳定基准实装 done 2026-09-20——Step 2 经用户指令提前于 T011；余 Step 3 A/B 实测 + 阈值重锁判定）→ [tasks/006.6-lod-reference-bounds.md](tasks/006.6-lod-reference-bounds.md)
- [ ] T003 收官路径（冻结 2026-09-17；剩余 003.3 验收续走 / 003.5 / 003.6 / 设施返工）→ [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
- [ ] T004 Style Gallery（0/3）→ [tasks/004-style-gallery.md](tasks/004-style-gallery.md)
- [ ] T005 Animation Pathway（0/3）→ [tasks/005-animation-pathway.md](tasks/005-animation-pathway.md)
- [ ] T007 Bake Scatter（可选；启动前 grill 拷问门见任务书）→ [tasks/007-bake-scatter.md](tasks/007-bake-scatter.md)
- [ ] T012 针叶族【占位】
- [ ] T013 花木族【占位】
- [ ] T014 灌木族【占位】
- [ ] T015 地被/草本族【占位】
- [ ] T016 资产管理器重构（大类→小类、GLB+程序化统一入口；启动前独立拷问门 D21）【占位】
- [ ] T017 多边形区域生成重构 · Feature Generator 体系（启动前独立拷问门 D21）【占位】
- [ ] T018 真实程序化天空与环境光照（D29 立项 2026-09-20：Sky + 统一 Sun + PMREM IBL 替换渐变天空 + Hemi，零资产改动自动获得环境光；启动排 **T011.5 + T006.6 Step 3 之后**——不打断榉树/银杏生产与 LOD 阈值收口）→ [tasks/018-real-sky-environment.md](tasks/018-real-sky-environment.md)

## Done

- [x] T001 Docs Bootstrap → [tasks/001-docs-bootstrap.md](tasks/001-docs-bootstrap.md)
