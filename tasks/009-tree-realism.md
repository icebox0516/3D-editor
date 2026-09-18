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

- [ ] T009.1 枝干结构真实性 → [009.1-branch-structure.md](009.1-branch-structure.md)
- [ ] T009.2 夏栎叶簇生成 → [009.2-leaf-cluster.md](009.2-leaf-cluster.md)
- [ ] T009.3 8 槽形态向量表 → [009.3-shape-slots.md](009.3-shape-slots.md)
- [ ] T009.4 树皮近景微起伏 → [009.4-bark-relief.md](009.4-bark-relief.md)
- [ ] T009.5 程序化资产公共 Shadow 能力（可与 009.1–009.4 并行）→ [009.5-shadow-path.md](009.5-shadow-path.md)
- [ ] T009.6 夏栎 LOD 三档 → [009.6-lod-levels.md](009.6-lod-levels.md)
- [ ] T009.7 夏栎四类验收门 → [009.7-acceptance.md](009.7-acceptance.md)

依赖链：009.1 → 009.2 → 009.3 → 009.4 → 009.6 → 009.7；009.5 可与 009.1–009.4 并行、汇入 009.7。注：009.1–009.4 串行主因 = broadleafGeometry.ts 单文件并行修改冲突规避；其中 009.1→009.2→009.3 同时是功能依赖（参数面 → 叶簇 → 向量表），009.3→009.4 仅为冲突规避非功能依赖；009.6 功能依赖 = 几何终态（含 009.4 树皮微起伏）。

## 进度

- 2026-09-18 立项：植物资产路线 grill（三轮拷问 + 两轮修正）→ D20，0/7。前置 = 008.4 + 008.6 均完成（二者锚点门后可并行）。
