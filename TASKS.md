# TASKS

> 任务地图（D24）：Current / Next / Done + 状态摘要 + 链接，仅导航用途。epic 总纲 = `tasks/0XX-*.md`（子任务勾选表 + epic 内依赖），子任务 = `tasks/0XX.N-*.md`（头部状态/前置字段 + 完成记录）——**状态与依赖的事实源是任务文件，本文件摘要与之冲突时以任务文件为准；修改依赖只改任务书，不动本文件**。

## Current

（空——候选启动见 Next；实际启动顺序由任务文件依赖与有效架构裁定决定）

## Done（近）

- [x] T020 任务执行体系收敛（第二批：执行协议整体切换；两阶段均 done 2026-09-23——阶段一 rule 层原子切换 / 阶段二 code 面独立提交）→ [tasks/020-task-system-reform.md](tasks/020-task-system-reform.md)
  - [x] 阶段二 code 面（done 2026-09-23：共享 harness 三模块 + 39 文件去重 / O(n²) 碰撞断言收容 assetTaxonomy / 16 软跳过清除——宽读法经审核追认记档任务书）→ [tasks/020-task-system-reform.md](tasks/020-task-system-reform.md)

- [x] T018 真实程序化天空与环境光照（5/5 epic 收官 2026-09-23）→ [tasks/018-real-sky-environment.md](tasks/018-real-sky-environment.md)
  - [x] T018.5 验收门（done 2026-09-23）→ [tasks/018.5-acceptance.md](tasks/018.5-acceptance.md)
  - [x] T018.4 DEV 调参面（done 2026-09-23）→ [tasks/018.4-dev-tuning.md](tasks/018.4-dev-tuning.md)
  - [x] T018.3 预设面 + fallback（done 2026-09-23）→ [tasks/018.3-preset-fallback.md](tasks/018.3-preset-fallback.md)
  - [x] T018.2 PMREM / IBL（done 2026-09-23）→ [tasks/018.2-pmrem-ibl.md](tasks/018.2-pmrem-ibl.md)
  - [x] T018.1 Sky + Sun + Cloud Core（done 2026-09-23）→ [tasks/018.1-sky-sun-cloud-core.md](tasks/018.1-sky-sun-cloud-core.md)

- [x] T011 阔叶乔木族生产任务集合（13/13 epic 收官 2026-09-23，D33 开放式集合）→ [tasks/011-broadleaf-trees.md](tasks/011-broadleaf-trees.md)
  - [x] T011.13 族级验收门（done 2026-09-23：七项全过；族门方法首跑升格提案待用户确认）→ [tasks/011.13-acceptance.md](tasks/011.13-acceptance.md)
  - [x] T011.12 垂柳（done 2026-09-23；垂枝域应力位实证）→ [tasks/011.12-salix.md](tasks/011.12-salix.md)
  - [x] T011.11 女贞（done 2026-09-22；常绿第二例）→ [tasks/011.11-ligustrum.md](tasks/011.11-ligustrum.md)
  - [x] T011.10 白蜡树（done 2026-09-22）→ [tasks/011.10-fraxinus.md](tasks/011.10-fraxinus.md)
  - [x] T011.9 国槐（done 2026-09-22）→ [tasks/011.9-sophora.md](tasks/011.9-sophora.md)
  - [x] T011.8 重阳木（done 2026-09-22；三出复叶第二型）→ [tasks/011.8-bischofia.md](tasks/011.8-bischofia.md)
  - [x] T011.7 乌桕（done 2026-09-22）→ [tasks/011.7-triadica.md](tasks/011.7-triadica.md)
  - [x] T011.6 栾树（done 2026-09-21；复叶首例）→ [tasks/011.6-koelreuteria.md](tasks/011.6-koelreuteria.md)
  - [x] T011.5 悬铃木（done 2026-09-20；掌状裂新叶形）→ [tasks/011.5-platanus.md](tasks/011.5-platanus.md)
  - [x] T011.4 银杏（done 2026-09-20）→ [tasks/011.4-ginkgo.md](tasks/011.4-ginkgo.md)
  - [x] T011.3 榉树（done 2026-09-20；D30 增量口径首跑）→ [tasks/011.3-zelkova.md](tasks/011.3-zelkova.md)
  - [x] T011.2 香樟（done 2026-09-20；常绿第一例）→ [tasks/011.2-camphor.md](tasks/011.2-camphor.md)
  - [x] T011.1 朴树（done 2026-09-20；家族契约第一实例化）→ [tasks/011.1-celtis.md](tasks/011.1-celtis.md)

（T006/T010/T008/T009 以下为此前 Done 条目）

- [x] T006 Asset Runtime LOD（5/5 epic 收官 2026-09-19；**D41 2026-09-23 部分取代**——level 统一语义由 T021 Representation 体系接替，既有交付保留为技术基线）→ [tasks/006-lod-chunking.md](tasks/006-lod-chunking.md)
  - [x] T006.5 验收门（done 2026-09-19：双档达标 + 常量锁定）→ [tasks/006.5-acceptance.md](tasks/006.5-acceptance.md)
  - [x] T006.6 LOD 选档稳定基准（done 2026-09-23 收口：Step 1/2 done 2026-09-20〔稳定基准球〕；Step 3 迁 T021.8 承接——D41）→ [tasks/006.6-lod-reference-bounds.md](tasks/006.6-lod-reference-bounds.md)
  - [x] T006.1 LOD 公共语义层（done 2026-09-19）→ [tasks/006.1-lod-semantics.md](tasks/006.1-lod-semantics.md)
  - [x] T006.2 非植物第二资产档位验证（done 2026-09-19）→ [tasks/006.2-second-asset-levels.md](tasks/006.2-second-asset-levels.md)
  - [x] T006.3 块×档分桶+换档（done 2026-09-19）→ [tasks/006.3-chunk-lod-bucketing.md](tasks/006.3-chunk-lod-bucketing.md)
  - [x] T006.4 批次控制（done 2026-09-19）→ [tasks/006.4-batch-control.md](tasks/006.4-batch-control.md)

- [x] T010 程序化资产公共能力与规范（5/5 epic 收官 2026-09-19）→ [tasks/010-asset-capability.md](tasks/010-asset-capability.md)
  - [x] T010.5 模板固化验收门（done 2026-09-19：夏栎零回退复核全过）→ [tasks/010.5-acceptance.md](tasks/010.5-acceptance.md)
  - [x] T010.1 家族契约提炼与文件组织规范（done 2026-09-19）→ [tasks/010.1-family-contract.md](tasks/010.1-family-contract.md)
  - [x] T010.2 元数据与分类契约（done 2026-09-19）→ [tasks/010.2-metadata-taxonomy.md](tasks/010.2-metadata-taxonomy.md)
  - [x] T010.3 LOD 声明规范固化（done 2026-09-19）→ [tasks/010.3-lod-spec.md](tasks/010.3-lod-spec.md)
  - [x] T010.4 Shadow 公共能力规范 + 视觉验收 SOP（done 2026-09-19）→ [tasks/010.4-shadow-visual-sop.md](tasks/010.4-shadow-visual-sop.md)

- [x] T008 程序化树木（6/6 epic 收官 2026-09-19；树协议冻结为稳定基线）→ [tasks/008-procedural-tree.md](tasks/008-procedural-tree.md)
  - [x] T008.5 收官验收门（done 2026-09-19）→ [tasks/008.5-acceptance.md](tasks/008.5-acceptance.md)
  - [x] T008.6 夏栎视觉参考研究（done 2026-09-18；异议窗口开放见任务书处置记档）→ [tasks/008.6-plant-reference.md](tasks/008.6-plant-reference.md)
  - [x] T008.4 放置全链路集成（done 2026-09-18）→ [tasks/008.4-placement-integration.md](tasks/008.4-placement-integration.md)
  - [x] T008.3 叶/树皮材质+风动（done 2026-09-18；锚点门过）→ [tasks/008.3-leaf-shader-wind.md](tasks/008.3-leaf-shader-wind.md)
  - [x] T008.2 树几何生成器·slot-0 锚点形态（done 2026-09-17）→ [tasks/008.2-tree-geometry.md](tasks/008.2-tree-geometry.md)
  - [x] T008.1 契约增量+uTime 基建（done 2026-09-17）→ [tasks/008.1-contract-infra.md](tasks/008.1-contract-infra.md)
- [x] T009 夏栎结构真实性与生产化（7/7 epic 收官 2026-09-19）→ [tasks/009-tree-realism.md](tasks/009-tree-realism.md)
  - [x] T009.7 四类验收门（done 2026-09-19）→ [tasks/009.7-acceptance.md](tasks/009.7-acceptance.md)
  - [x] T009.5 公共 Shadow 能力（done 2026-09-19）→ [tasks/009.5-shadow-path.md](tasks/009.5-shadow-path.md)
  - [x] T009.1 枝干结构真实性（done 2026-09-18）→ [tasks/009.1-branch-structure.md](tasks/009.1-branch-structure.md)
  - [x] T009.2 夏栎叶簇生成（done 2026-09-18）→ [tasks/009.2-leaf-cluster.md](tasks/009.2-leaf-cluster.md)
  - [x] T009.3 8 槽形态向量表（done 2026-09-18；用户裁定门定稿）→ [tasks/009.3-shape-slots.md](tasks/009.3-shape-slots.md)
  - [x] T009.4 树皮近景微起伏（done 2026-09-18）→ [tasks/009.4-bark-relief.md](tasks/009.4-bark-relief.md)
  - [x] T009.6 夏栎 LOD 三档（done 2026-09-19；预算锁定）→ [tasks/009.6-lod-levels.md](tasks/009.6-lod-levels.md)
- [❄] T003 Scatter Styles（3/6；003.3 收官 2026-09-19，冻结其余——恢复入口见任务书）→ [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
  - [x] T003.3 Style 配方+序列化（done 2026-09-19）→ [tasks/003.3-style-recipe.md](tasks/003.3-style-recipe.md)
  - [~] T003.4 植物资产 4 种（代码完成；返工升格 T008 路线〔D19〕，冻结）→ [tasks/003.4-plant-assets.md](tasks/003.4-plant-assets.md)
  - [x] T003.2 分块实例化管线（done 2026-09-16）→ [tasks/003.2-chunk-pipeline.md](tasks/003.2-chunk-pipeline.md)
  - [x] T003.1 撒点纯函数（done 2026-09-16）→ [tasks/003.1-scatter-function.md](tasks/003.1-scatter-function.md)
- [x] T002 Procedural Assets（5/5，epic 收官 2026-09-16）→ [tasks/002-procedural-assets.md](tasks/002-procedural-assets.md)
  - [x] T002.5 验收门（done 2026-09-16）→ [tasks/002.5-acceptance.md](tasks/002.5-acceptance.md)
  - [x] T002.4 设施资产包 5 种（done 2026-09-16）→ [tasks/002.4-facility-assets.md](tasks/002.4-facility-assets.md)
  - [x] T002.3 放置+烘焙式变体（done 2026-09-16）→ [tasks/002.3-placement-variation.md](tasks/002.3-placement-variation.md)
  - [x] T002.2 资产库混排+缩略图（done 2026-09-16）→ [tasks/002.2-browser-mixing.md](tasks/002.2-browser-mixing.md)
  - [x] T002.1 注册与生成契约（done 2026-09-16）→ [tasks/002.1-asset-contract.md](tasks/002.1-asset-contract.md)

## Next

> Next 仅表示已排入路线图的后续任务，不代表执行顺序；实际启动顺序由任务文件中的依赖、当前项目状态及有效架构裁定决定（D31.8）。

- [ ] T021 LOD → Representation 运行体系重构（021.0–021.6 done——021.5 done 2026-09-24；下一步 021.7，其后 021.8——D41，运行面真相源 docs/procedural-assets/representation-runtime.md）→ [tasks/021-lod-representation.md](tasks/021-lod-representation.md)
  - [x] T021.5 Shadow Representation（done 2026-09-24：ShadowPolicy 三字段策略层 / depth 三档〔low 不挂 SDF→实心影〕/ 两链策略驱动 + 合并桶 OR / 中点切换钩子接通 / culled 零残影 + 九帧取证，4160 全绿）→ [tasks/021.5-shadow-representation.md](tasks/021.5-shadow-representation.md)
  - [x] T021.4 Density / Batch 解耦（done 2026-09-24：levelInstanceKeep 废止密度恒全量 / 批次键迁移 representation / 分布口径升级，4141 全绿）→ [tasks/021.4-density-batch.md](tasks/021.4-density-batch.md)
  - [x] T021.3 Transition Runtime（done 2026-09-24：metric 步进过渡状态机 / aFadeOut 属性缝 / 两链客座双表示 + Union 剔除 / dither×alphaTest 合成〔A2C 不吃 fade、IGN 镜像互补〕/ 中点切换钩子，4129 全绿）→ [tasks/021.3-transition-runtime.md](tasks/021.3-transition-runtime.md)
  - [x] T021.6 Broadleaf Canopy Proxy（done 2026-09-23：共享冠层场契约收编 / 统一工厂 487 面 / 材质与深度材质 drift-lock / 13 树种基线帧取证，与 021.2 并行）→ [tasks/021.6-canopy-proxy.md](tasks/021.6-canopy-proxy.md)
  - [x] T021.2 Selection Runtime（done 2026-09-23：新链候选阈值 / canopy 名义区间落位 / 散布四维粒度 + 代表 scale 全集口径，4073 全绿）→ [tasks/021.2-selection-runtime.md](tasks/021.2-selection-runtime.md)
  - [x] T021.1 Representation 契约层（done 2026-09-23：表示联合四值 / culled 转提交终态 / representations 声明 / bounds 契约，4041 全绿）→ [tasks/021.1-representation-contract.md](tasks/021.1-representation-contract.md)
- [ ] T019 颜色管线（Tone Mapping 应急出口 / ACES 素材指针——D29.3 / D39 语义保留；占位行 2026-09-23 补登，D41 会话核实此前未同步）【占位】
- [ ] T003 收官路径（冻结 2026-09-17；剩余 003.3 验收续走 / 003.5 / 003.6 / 设施返工）→ [tasks/003-scatter-styles.md](tasks/003-scatter-styles.md)
- [ ] T004 Style Gallery（0/3）→ [tasks/004-style-gallery.md](tasks/004-style-gallery.md)
- [ ] T005 Animation Pathway（0/3）→ [tasks/005-animation-pathway.md](tasks/005-animation-pathway.md)
- [ ] T007 Bake Scatter（可选；启动前 grill 拷问门见任务书）→ [tasks/007-bake-scatter.md](tasks/007-bake-scatter.md)
- [ ] T012 针叶族【占位；立项按 D30：012.1 雪松 = ConiferShapeProfile 家族首例走完整 SOP 口径，后续资产增量口径，族末集体验收门；候选池（D34 摘要，docs/research/urban-tree-candidates.md §2）：强 9——圆柏/龙柏/侧柏/白皮松/黑松/水杉/落羽杉/池杉/罗汉松，中 2（油松/华山松），弱 1（马尾松需补园艺文献或降优先级）】
- [ ] T013 花木族【占位；候选池（D34 摘要，§3/§4）：乔木型观花强 8——东京樱花/紫叶李/碧桃/梅花/海棠花/西府海棠/紫薇/桂花 + 灌木型观花强 8——月季/杜鹃/山茶/栀子/木槿/紫荆/紫丁香/夹竹桃 + D34 自阔叶候选分流 7（玉兰/广玉兰/合欢/凤凰木/蓝花楹/羊蹄甲/洋紫荆——乔木观花为纲）】
- [ ] T014 灌木族【占位；候选池（D34 摘要，§5）：强 4——冬青卫矛（「大叶黄杨」口径立项须钉死 Euonymus japonicus）/海桐/珊瑚树/南天竹，中 2（金森女贞/红花檵木），弱 2（小叶女贞/Buxus 口径大叶黄杨），Unknown 1（红叶石楠立项须补园艺权威来源）】
- [ ] T015 地被/草本族【占位；候选池（D34 摘要，§6）：强 4——狗牙根（暖季草坪）/草地早熟禾（冷季草坪）/鸢尾/萱草，中 1（麦冬——园林地被用途无志书明文），弱 3（结缕草/高羊茅——学名口径立项须钉死/二月兰）】
- [ ] T022 资产库清理（浏览器一行大分类化 + 四低模植物删除 + plantMaterials 模块整体删除；记档：T016 取消 / **D19 第 1 条四植物子句废止** / taxonomy 口径修正 + metadata-taxonomy 失真面同步）→ [tasks/022-asset-library-cleanup.md](tasks/022-asset-library-cleanup.md)
- [ ] T023 生产脊柱 spine 提取（spine + 方法剖面两层 / D36 边界句 + D30 最低可信证据原则记档 / **AGENTS「首例完整 SOP」两句同步**〔P0〕/ 新 workflow 创建纪律与 read-set 体积约束）→ [tasks/023-spine-extraction.md](tasks/023-spine-extraction.md)
- [ ] T024 资产色卡预设【占位；2026-09-24 共识：激活 D17.2 preset 扩展位（材质基调切换，冠变干不变；instanceColor 继续管 hueJitter 群内微差）；声明契约 + 浏览器名旁色点切换 + 手动放置带 preset；存量 13 种乔木全量回补（色卡以各 Spec 季相记录为证据）；配方 schema 预留 preset 字段位，散布份额消费归散布任务；后续各族与车辆出生即带 preset；**立项必答**：preset 声明硬钩子（契约测试整表锁或 meta 必填 + typecheck 闸）/ D19.2「preset 不启用」子句修订记档 / sourceKey×preset 缓存增殖裁定（lod-spec sourceKey 语义下 13 树 × 槽 × N 色卡的 Source 增殖）】
- [ ] T025 园区设施扩充【占位；花箱/防撞柱/护栏/停车设施/充电桩等；轻量批量任务制（T002.4 先例：同方法一批 3–5 个一会话，共用方法与测试基建）；首例批次触发创建 simple-asset workflow（引用 spine 只写差异剖面）；充电桩按复杂度路由可能中等；**立项必答**：批次 Spec 口径（建议一批一合并 Spec + 逐资产 Gate 留痕——T002.4 为 pre-Gate 时代先例不可直接沿用）/ category 值收敛策略（程序化 facility 单栏 vs GLB 细分 slug 分栏终态裁定）】
- [ ] T026 人物与车辆【占位；行人/工作人员 + 轿车/SUV/接驳车/货车/自行车，少量高复用变体；车辆复用 preset 车身色；全新资产域，立项过 Research Gate + Family 判定】
- [ ] T027 自然小物【占位；景观石/岩石/树桩等】
- [ ] T028 建筑/设备【占位；扩充终段】
- [ ] T017 多边形区域生成重构 · Feature Generator 体系（启动前独立拷问门 D21）【占位】

## Done

- [x] T001 Docs Bootstrap → [tasks/001-docs-bootstrap.md](tasks/001-docs-bootstrap.md)
