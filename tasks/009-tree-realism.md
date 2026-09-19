# T009 夏栎结构真实性与生产化

> 立项：2026-09-18 植物资产路线 grill（→ D20）。前置：T008.4 + T008.6 均完成（二者锚点门后可并行）。**状态：收官（7/7，2026-09-19）**。

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
- [x] T009.4 树皮近景微起伏（done 2026-09-18：emitTube 低频环向谐波起伏（零 rng/拓扑恒等/法线解析修正）+ 树皮灰度校正 #63513f→#5c534a 并行交付；+9 测试 → 2482 全绿；四机位 vs 009.3 基线取证 `docs/acceptance/t009/009.4/`）→ [009.4-bark-relief.md](009.4-bark-relief.md)
- [x] T009.5 程序化资产公共 Shadow 能力（done 2026-09-19：InstanceSource customDepthMaterial 契约 + 池三建网格点挂载 + dispose 链三端同步 + 夏栎首验同源消费（DEV=正式）；+11 测试；取证 `docs/acceptance/t009/009.5/`）→ [009.5-shadow-path.md](009.5-shadow-path.md)
- [x] T009.6 夏栎 LOD 三档（done 2026-09-19：三档同流派生（同 rng 流同骨架决策、Mid 掩码 22 选 7、Low 簇位壳卡）+ 材质 9 键分档（High 逐字节不变 fixture 锁）+ asset 路由/meta 三档 + 缓存 `sourceKey::level` 双维 + evict + mountLevels 取证面；预算锁定 High ≤40K / Mid 6–10K / Low 1.5–3K（实测 28754–38780 / 6414–9650 / 1662–2150）；+32 测试 → 2514 全绿；7 图取证 `docs/acceptance/t009/009.6/`）→ [009.6-lod-levels.md](009.6-lod-levels.md)
- [x] T009.7 夏栎四类验收门（done 2026-09-19：性能 1/20/100/500/1000 = 710/426/267/82/49 FPS 全过阈值 + 资源契约五条全过 + Shadow A/B +7.7ms/帧 + 结构 5 项/视觉 3 距离×6 要素/变体 8 槽全过 + 回归 2542 全绿；测量口径 vsync-off（虚拟显示 10Hz 记档）；__tree3aPerf 产品路径驱动句柄 +17 测试；T009 收官 7/7；取证 `docs/acceptance/t009/009.7/`）→ [009.7-acceptance.md](009.7-acceptance.md)

依赖链：009.1 → 009.2 → 009.3 → 009.4 → 009.6 → 009.7；009.5 可与 009.1–009.4 并行、汇入 009.7。注：009.1–009.4 串行主因 = broadleafGeometry.ts 单文件并行修改冲突规避；其中 009.1→009.2→009.3 同时是功能依赖（参数面 → 叶簇 → 向量表），009.3→009.4 仅为冲突规避非功能依赖；009.6 功能依赖 = 几何终态（含 009.4 树皮微起伏）。

## 进度

- 2026-09-18 立项：植物资产路线 grill（三轮拷问 + 两轮修正）→ D20，0/7。前置 = 008.4 + 008.6 均完成（二者锚点门后可并行）。
- 2026-09-18 T009.1 完成（1/7）：shapeProfile 夏栎私有参数面（tree3aShapeProfile.ts，逐字段 Spec 依据 + Evidence Status 标注，Unknown 不编造）落地，LEVELS/TRUNK/CHILD_PLAN/LEAF 硬编码全部改 profile 消费（ProceduralBuild 公共签名未动，morphSeed→slot→profile 查表路由）；主次分级（rank 势差 + 逐级半径比低级陡 + L1 锥度 0.7 + wander 姿态分级，L1/L5 起径比 29.8）；冠内通透三显式规则（枝干通道 / 内层密度场 q 梯度 / 局部空腔球——内核保留率 0.330 vs 外壳 0.985）；slot-0 锚点重校（已符合项全部保持，冠幅比裁决留 009.3）。29520 面（-8%）不回落；2443 → 2452 全绿。主代理四机位取证 + 视觉裁定四判据全过；延期项：spec 附录#16 小枝材质分化（破「恰 2 组」或动材质，去向 009.4/材质专项）。
- 2026-09-18 T009.2 完成（2/7）：枝梢驱动叶簇（procedural-asset-agent）——L4/L5 枝梢挂簇（簇中心/方向承接枝切向/半径域）、簇内壳偏置发卡（r̂ = mix(0.38,1,rng^0.8)，卡根朝内叶尖向簇外）、簇级距离抑制保簇间间隙；卡宽 0.08–0.13m + 长宽比 1.6–2.7（附录 #12/#13 Verified 域收敛）；通透三规则零改动全过（外壳保留率 1.000 / 内核比 0.298）。叶形 SDF + 叶背粉绿（park-shader-agent，文件不相交并行）——倒卵形包络 v^1.4（最宽点 ≈61%）、裂 4→5 对、基部耳形 t3aEar、gl_FrontFacing 背面 ×(0.94,1.05,1.16)。slot-0：簇位 810 → 保留 398 + 剔 412、存活卡 7167、总面 29520 → 35058（预算带内，009.6 锁定）。主代理审查揪出 rng 条件消费违约并返工（每叶 9 次全无条件——009.3 调参不重排随机流）；通道测试度量点对齐过滤口径（根边中点）。+7 测试 → 2459 全绿三门槛；六机位取证 + 视觉裁定全过（叶簇可辨/透枝/轮廓完整/叶形/叶背五项）。下一步 009.3 八槽形态向量表（**逐槽用户裁定门**）。
- 2026-09-18 T009.3 完成（3/7）：8 槽形态向量表——slot-0 锚点逐位不动，slot-1…7 以差量展开定义（结构计数类字段由展开继承**结构性恒等**：皮面数 20724 + rng 消费次数恒等不靠纪律靠语法；每槽 7–9 维连续参数差异，注释含 Spec 1.0 锚点 + 实测校准记录）；tree3aStage mountSlots/viewSlots/viewSlot 批量出图面（threejs-runtime-agent 并行，文件不相交）。8 槽实测：皮全槽 20724、叶卡 4015–9028、总面 32424–38780 ⊂ 预算带、XZ 跨 4.22–9.54m、视觉冠底 1.55–3.72m。主代理 agent-browser 固定机位批量取证（全景 + 8 特写 + 拼图，slot4 下枝边缘项双验复核通过）；**用户裁定门两轮批量（槽 0–3 / 槽 4–7）8/8 通过定稿、零微调轮消耗**，参考基调无异议（008.6 异议出口关闭）。消费语义发现记档：crownCenterRatio/crownHeightRatio/crownTopBias 只进密度场不动几何（T010.1 提炼契约的重要事实）。+14 测试 → 2473 全绿三门槛。下一步 009.4 树皮近景微起伏。
- 2026-09-18 T009.4 完成（4/7）：树皮近景微起伏——emitTube 顶点域低频环向谐波 d(θ,s) = A·Σwₘ(s)·cos(kₘθ+φₘ(s))（k∈{3,4,5} ≤ radial 12 奈奎斯特域；A = 0.033×局部半径——主干强末梢弱比例式挂钩；轴向游走+脊深呼吸——纵向脊语言非箍纹）；**纯确定性函数零 rng 消费**（消费计数 177234 快照锁）、拓扑/uv/绕序不变（皮面 20724 恒等）、wrap 位环级共享预算浮点级无缝（差恰 0）、法线参数面导数解析修正（主代理审查揪出轴向项量纲错误返工：d_s 误除 R → 修复）；起伏只动表面发射不动路径/簇/通道（stats 与叶簇逐位不受扰动）。参数面 barkRelief 三字段（Spec 依据 + 共性标注，slot-0 定义 spread 继承）。并行交付：树皮灰度校正（park-shader-agent，Spec 附录 #15 映射本任务——#63513f→#5c534a 等亮度去饱和，GLSL 零改动）。+9 测试 → 2482 全绿三门槛。四机位 vs 009.3 基线取证（近景轮廓波浪明显可辨且自然 / 中景整树零变化 / 远景零变化）`docs/acceptance/t009/009.4/`。延期项：#16 小枝材质分化维持「材质专项」去向（破恰 2 组或动材质结构，与本任务约束冲突）。下一步 009.6（几何终态已含微起伏；009.5 可并行）。
- 2026-09-19 T009.6 完成（5/7）：夏栎 LOD 三档——**前会话遗留半成品（契约层/缓存双维/几何三档 + 临时探针，未提交）本会话审查验证后续走完成**；三子代理补完（park-shader-agent 材质分档 / threejs-runtime-agent mountLevels 出图面 / procedural-asset-agent asset 路由+预算+正式测试）。核心不变量：三档同 rng 流（177234 恒等）同骨架决策——档位只改发射（Mid 降径向 12/8/7/6/5/4→6/5/4/3/3/3 + 隔站抽发 + L5 不发射 + 叶卡掩码 22 选 7；Low 主干+L1 极简管 + 簇位表交叉壳卡），Mid 存活卡 ⊂ High 逐位同位、簇表跨档全等；材质 9 键分档（High GLSL 逐字节不变以改前全文 fixture 锁定，风动三档同源）；缓存 `sourceKey::level` 双维 + evict 独立释放（sourceKeyOf 零改动、level 不掺形态身份，D23.2）；asset `meta.levels` 三档 + level 透传路由（'medium'→'mid' D27.7 改名全仓零残留）。**预算锁定（任务输出，D19.8 预算制）**：High ≤40K / Mid 6–10K / Low 1.5–3K，实测带 28754–38780 / 6414–9650 / 1662–2150（8 槽 × 3 档）；记档修正：009.3「总面 32424–38780」下限为笔误（4015 卡 → 28754 面，与自身叶卡数矛盾，非回归）。档间贴地平移差 ≤3cm 发现记档（树皮起伏径向采样档间不同致 minY 微差——测试口径已吸收）。+32 测试 → 2514 全绿三门槛。视觉裁定 7 图（slot-0 三档 32m 全景档间身份一致/颜色连续 + Mid 12m 五项 + Low 剪影完整、颜色层次存在但对比含蓄——009.7 远距口径复核项）`docs/acceptance/t009/009.6/`。009.7 解锁（009.5 可并行汇入）。
- 2026-09-19 T009.5 + T009.7 完成（7/7，**epic 收官**）：009.5（threejs-runtime-agent）——InstanceSource `customDepthMaterial` 契约立契（归源所有/池只挂引用；`customDistanceMaterial` 仅类型位）+ 池三建网格点挂载 + dispose 链三端同步（缓存/缩略图/舞台）+ 夏栎 build 返回档位匹配深度材质、DEV 舞台改同源消费（DEV 预览 = 正式场景，单测锁同一实例）+ aSeed 类头过时断言修正（D23.6：非实例绘制读缓冲首元素/GL 缺省 0，确定性相位）+ ScatterChunkManager/AssetSourceRouter/AssetLoader 零改动契约兼容；+11 测试。009.7（主代理验收门）——DEV 驱动 `__tree3aPerf`（产品路径命令管线批量放置/清除 + sampleFrames + getResourceStats + setSunShadow，threejs-runtime-agent 并行，+17 测试）；**性能实测（RTX 2080 Ti 实机/1920×1080/DPR=1/Shadow 开）1/20/100/500/1000 = 710/426/267/82/49 FPS 全过阈值**（测量口径 vsync-off——本会话虚拟显示器合成器恒限 rAF 10Hz，vsync 口径不可测，如实记档换算保守口径）；资源契约五条全过（1000 棵 drawCalls 恒 35 = InstancedMesh 未退化、geometries 恒 11 = 槽数有界、10 轮零增长）；Shadow A/B +7.7ms/帧 @1000；结构 5 项（vs Spec 1.0）/视觉 3 距离×6 要素/变体 8 槽全过；**009.6 遗留 Low 远距复核过**（50m 剪影完整/层次非死平/三档 60m 连续）；回归 2542 全绿三门槛、GLB/设施构造性零变化；观感复核窗口开放（沿 008.6 先例）。取证 `docs/acceptance/t009/009.5/` `009.7/`（含复现脚本 tools/）。T008.5 收官门解锁。
