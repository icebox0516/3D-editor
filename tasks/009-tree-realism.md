# T009 夏栎结构真实性与生产化

> 立项：2026-09-18 植物资产路线 grill（→ D20）。前置：T008.4 + T008.6 均完成（二者锚点门后可并行）。

## Goal

把夏栎从「可用的程序化树」提升为**生产级植物资产**：枝-簇-叶结构关系可信、8 槽人工形态向量族、树皮近景微起伏、程序化资产公共 Shadow 生产路径、三档 LOD——以四类验收（结构/视觉/变体/性能）收官。运行时契约（D19 锁定规则链：seed → shapeSlot → morphRng → sourceKey → Cache → Pool）延续不推翻。

## Requirements

- **结构真实性**（009.1/009.2）：夏栎内部结构参数面（shapeProfile）+ 冠内空间通透规则显式化 + 枝梢驱动叶簇（外密中疏内空、簇间间隙）
- **形态族**（009.3）：8 组完整形态向量（shapeProfile 预设组合，方向名仅为标签）——Shape Slot 是人工可控形态资产而非随机数展示
- **树皮**（009.4）：少量低频几何微起伏解决近景光滑感；Shader 维持现有结构不加 noise
- **公共 Shadow 能力**（009.5）：核心链 ProceduralSourceCache → InstanceSource → InstancedAssetPool → 正式场景；夏栎为第一个实际验证该公共能力的 Procedural Asset
- **LOD 三档**（009.6）：High/Mid/Low 几何实现与质量取舍 + 预算实测锁定；距离切换/分块消费归 T006
- **四类验收门**（009.7）：结构 / 视觉 / 变体 / 性能
- **性能验收基准（RTX 2080 Ti 开发档）**：1920×1080、DPR=1、Chromium、WebGL2、固定场景/相机/灯光、Shadow 开启——1/20/100 棵 ≥60 FPS、500 棵 ≥45 FPS、1000 棵 ≥30 FPS（Frame Time ≤16.7 / 22.2 / 33.3ms）；资源契约：同 sourceKey 不重复创建 Geometry/Material、500/1000 棵保持 InstancedMesh 路径、不因实例数增长退化为逐对象 Mesh、删除实例后无 Geometry/Material/InstanceBuffer 残留、连续放置/删除 10 次无持续资源增长、Shadow 开启状态下满足对应档位。2080 Ti 仅为当前独显开发基准，不宣称为全平台最终性能承诺

## Scope

- 预期触碰：`src/runtime/procedural/tree/`（broadleafGeometry / tree3aMaterials / tree3aStage）、`asset_tree_3a.asset.ts`、InstanceSource 契约及其消费端（InstancedAssetPool / ScatterChunkManager 契约兼容 / AssetLoader 类型兼容 / ThumbnailCache dispose）
- 不碰：GLB 行为（零回归）、T003 散布功能开发（冻结维持）、D19 契约第一锁

## Acceptance（epic 级，009.7 执行）

- 四类验收全项过（结构 / 视觉 / 变体 / 性能，细则见 009.7）
- GLB 与非植物资产回归零变化；`npm test` / `check:layers` / `typecheck` 全绿
- 全套取证存 `docs/acceptance/t009/`

## Constraints

- **公共能力从真实第二消费者中提炼，不在 T009 预抽象**——叶簇生成保持夏栎私有命名与实现，家族契约提炼是 T010.1 职责
- D19 契约第一锁不破：对象 seed 永不直接进 Source Geometry；sourceKey 形态身份语义不变（LOD 走独立 level 维度）
- 面数/叶卡数为预算非验收门槛（D19.8）；正式 High/Mid/Low 预算由 009.6 实测锁定
- T003 冻结口径 = 仅 009.5 契约级小触碰，不恢复散布功能开发；散布侧 aSeed 同相位修复留给 T003 解冻后独立任务
- 派发按 AGENTS.md「多 Agent 按 Step 派遣」执行；主代理简报 + diff 审查 + 视觉验收
- 性能验收走产品放置路径（池）而非仅 DEV 舞台

## 子任务（2026-09-18 立项拆分，D16 会话粒度）

- [x] T009.1 枝干结构真实性（done 2026-09-18：shapeProfile 参数面 + 主次分级 + 冠内通透三规则 + slot-0 重校；29520 面 -8%；+9 测试 → 2452 全绿；四机位视觉裁定过，取证 `docs/acceptance/t009/009.1/`）→ [009.1-branch-structure.md](009.1-branch-structure.md)
- [x] T009.2 夏栎叶簇生成（done 2026-09-18：枝梢驱动叶簇 + 簇间间隙/shellBias 参数面 + 卡尺寸/长宽比重校 + SDF 倒卵形/5 裂/耳形 + 叶背粉绿；35058 面；+7 测试 → 2459 全绿；六机位取证 `docs/acceptance/t009/009.2/`）→ [009.2-leaf-cluster.md](009.2-leaf-cluster.md)
- [x] T009.3 8 槽形态向量表（done 2026-09-18：8 组 shapeProfile 差量展开 + mountSlots 批量出图面；用户裁定门两轮 8/8 通过定稿零微调；+14 测试 → 2473 全绿；取证 `docs/acceptance/t009/009.3/`）→ [009.3-shape-slots.md](009.3-shape-slots.md)
- [ ] T009.4 树皮近景微起伏 → [009.4-bark-relief.md](009.4-bark-relief.md)
- [ ] T009.5 程序化资产公共 Shadow 能力（可与 009.1–009.4 并行）→ [009.5-shadow-path.md](009.5-shadow-path.md)
- [ ] T009.6 夏栎 LOD 三档 → [009.6-lod-levels.md](009.6-lod-levels.md)
- [ ] T009.7 夏栎四类验收门 → [009.7-acceptance.md](009.7-acceptance.md)

依赖链：009.1 → 009.2 → 009.3 → 009.4 → 009.6 → 009.7；009.5 可与 009.1–009.4 并行、汇入 009.7。注：009.1–009.4 串行主因 = broadleafGeometry.ts 单文件并行修改冲突规避；其中 009.1→009.2→009.3 同时是功能依赖（参数面 → 叶簇 → 向量表），009.3→009.4 仅为冲突规避非功能依赖；009.6 功能依赖 = 几何终态（含 009.4 树皮微起伏）。

## 进度

- 2026-09-18 立项：植物资产路线 grill（三轮拷问 + 两轮修正）→ D20，0/7。前置 = 008.4 + 008.6 均完成（二者锚点门后可并行）。
- 2026-09-18 T009.1 完成（1/7）：shapeProfile 夏栎私有参数面（tree3aShapeProfile.ts，逐字段 Spec 依据 + Evidence Status 标注，Unknown 不编造）落地，LEVELS/TRUNK/CHILD_PLAN/LEAF 硬编码全部改 profile 消费（ProceduralBuild 公共签名未动，morphSeed→slot→profile 查表路由）；主次分级（rank 势差 + 逐级半径比低级陡 + L1 锥度 0.7 + wander 姿态分级，L1/L5 起径比 29.8）；冠内通透三显式规则（枝干通道 / 内层密度场 q 梯度 / 局部空腔球——内核保留率 0.330 vs 外壳 0.985）；slot-0 锚点重校（已符合项全部保持，冠幅比裁决留 009.3）。29520 面（-8%）不回落；2443 → 2452 全绿。主代理四机位取证 + 视觉裁定四判据全过；延期项：spec 附录#16 小枝材质分化（破「恰 2 组」或动材质，去向 009.4/材质专项）。
- 2026-09-18 T009.2 完成（2/7）：枝梢驱动叶簇（procedural-asset-agent）——L4/L5 枝梢挂簇（簇中心/方向承接枝切向/半径域）、簇内壳偏置发卡（r̂ = mix(0.38,1,rng^0.8)，卡根朝内叶尖向簇外）、簇级距离抑制保簇间间隙；卡宽 0.08–0.13m + 长宽比 1.6–2.7（附录 #12/#13 Verified 域收敛）；通透三规则零改动全过（外壳保留率 1.000 / 内核比 0.298）。叶形 SDF + 叶背粉绿（park-shader-agent，文件不相交并行）——倒卵形包络 v^1.4（最宽点 ≈61%）、裂 4→5 对、基部耳形 t3aEar、gl_FrontFacing 背面 ×(0.94,1.05,1.16)。slot-0：簇位 810 → 保留 398 + 剔 412、存活卡 7167、总面 29520 → 35058（预算带内，009.6 锁定）。主代理审查揪出 rng 条件消费违约并返工（每叶 9 次全无条件——009.3 调参不重排随机流）；通道测试度量点对齐过滤口径（根边中点）。+7 测试 → 2459 全绿三门槛；六机位取证 + 视觉裁定全过（叶簇可辨/透枝/轮廓完整/叶形/叶背五项）。下一步 009.3 八槽形态向量表（**逐槽用户裁定门**）。
- 2026-09-18 T009.3 完成（3/7）：8 槽形态向量表——slot-0 锚点逐位不动，slot-1…7 以差量展开定义（结构计数类字段由展开继承**结构性恒等**：皮面数 20724 + rng 消费次数恒等不靠纪律靠语法；每槽 7–9 维连续参数差异，注释含 Spec 1.0 锚点 + 实测校准记录）；tree3aStage mountSlots/viewSlots/viewSlot 批量出图面（threejs-runtime-agent 并行，文件不相交）。8 槽实测：皮全槽 20724、叶卡 4015–9028、总面 32424–38780 ⊂ 预算带、XZ 跨 4.22–9.54m、视觉冠底 1.55–3.72m。主代理 agent-browser 固定机位批量取证（全景 + 8 特写 + 拼图，slot4 下枝边缘项双验复核通过）；**用户裁定门两轮批量（槽 0–3 / 槽 4–7）8/8 通过定稿、零微调轮消耗**，参考基调无异议（008.6 异议出口关闭）。消费语义发现记档：crownCenterRatio/crownHeightRatio/crownTopBias 只进密度场不动几何（T010.1 提炼契约的重要事实）。+14 测试 → 2473 全绿三门槛。下一步 009.4 树皮近景微起伏。
