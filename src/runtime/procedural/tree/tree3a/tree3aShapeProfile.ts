/**
 * runtime/procedural/tree/tree3a/tree3aShapeProfile —— 夏栎 shapeProfile 第一实例 config
 * （T009.1 建立；T010.1 Step 1 迁移为阔叶家族契约第一实例）。
 *
 * 职责：夏栎枝干/冠层结构的形态参数**数值面**——类型契约自 T010.1 起上提至阔叶家族
 *      ../broadleaf/broadleafShapeProfile（字段语义、【阔叶共性候选】/【夏栎特有】标注、
 *      T009.3 消费语义与槽间恒等纪律见家族文件），本文件只保留：8 槽 profile 值组合 +
 *      全部数值依据（Spec 锚点、slot-0 锚定值、实测校准记录、槽间差量说明——字段依据
 *      按 docs/research/tree3a-reference.md（Spec Version 1.0）结构事实定稿，逐字段
 *      Evidence Status（Verified / Inferred / Unknown / 工程设定）见 slot-0 内联注释，
 *      Unknown 项不得编造现实依据，仅按工程直觉设定）。008.2 硬编码在 tree3aGeometry
 *      的 LEVELS / TRUNK / CHILD_PLAN / LEAF 常量自 T009.1 起由本参数面消费；字段面
 *      同时是 009.3 八槽形态向量组合的原料（八槽完整组合见下方 TREE3A_SHAPE_PROFILES
 *      ——slot-0 锚点 + 七组差量展开）。
 * 边界：夏栎资产私有数值面——**不进 ProceduralBuild 公共签名**（build 只负责把
 *      morphSeed 路由到对应槽的 profile，见 asset_tree_3a）；比率字段以 totalHeight
 *      （形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：T008.6 附录已符合项全部保持——主干近直立（倾轴
 * ≤4°，见 tree3aGeometry 生成域）、分枝五级、骨架枝 5 根横展 55–70°、挂高 55–95%
 * 干高段（视觉冠底占比 0.20–0.33）；主次分级与冠内通透为 T009.1 升级项（数值变化见
 * T009.1 完成记录新旧对照）。Unknown 项（radiusRatio / lengthRatio / 骨架枝锥度）为
 * 工程设定，无现实基准。逐字段数值依据见各内联注释（家族文件只存语义不存数值——
 * 第一实例证据以本文件为准）。
 */
export const TREE3A_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec：成熟开阔地 ≈0.8–0.9、老树 ≈1.0（Inferred [6] 照片目测）；slot-0 锚中龄
   *  公园树 0.66（域内偏窄侧，幅度裁决归 009.3）。 */
  crownWidthRatio: 0.66,
  /** 工程设定（涌现自挂高段与领导枝链，Spec 无直接数值；间接锚 trunk_height_ratio
   *  ≈0.25–0.35 Inferred [6]）。 */
  crownCenterRatio: 0.64,
  /** 工程设定（同 crownCenterRatio）。 */
  crownHeightRatio: 0.72,
  /** Spec：宽展不规则圆顶（Verified [3]）、骨架枝绕干方位不规则非轮生（Inferred [6]）。
   *  slot-0 = 0.5（等效 008.2 ±25°）。 */
  asymmetry: 0.5,
  /** Spec：成熟/老树冠顶多主枝分摊（Inferred [6]）。slot-0 = 0（顶底均衡）。 */
  crownTopBias: 0,

  // 骨架
  /** Spec：≈5–7 根（Inferred [6] 三照汇聚）；slot-0 = 5（附录#8 已符合，另含 1 领导枝
   *  ——中龄口径，顶枝优势裁决归 009.3）。 */
  scaffoldCount: 5,
  /** slot-0 = 55–70°（附录#8 已符合；Spec scaffold_angle 仅定性「横展大角度」，数值
   *  撤销——工程设定维持已符合带）。 */
  scaffoldAngleMin: 55,
  scaffoldAngleMax: 70,
  /** slot-0 = 0.55 起跨 0.35（附录#8 已符合：挂高 55–95% 干高段、视觉冠底占比
   *  0.20–0.33；Spec branch_attachment_t ≈0.25–0.35 树高 Inferred [6]）。 */
  scaffoldAttachMin: 0.55,
  scaffoldAttachSpan: 0.35,
  /** 工程设定（branch_radius_decay Unknown，无现实基准）。 */
  scaffoldThickness: 0.58,
  /** rank 长度乘子（按方位序递减，rank0 = 首枝主导——强化自 008.2 单点 ×1.08）。
   *  工程设定。 */
  scaffoldRankLength: [1.14, 1.02, 0.94, 0.87, 0.81],
  /** rank 起径乘子（与长度乘子同向——主导枝更粗）。工程设定。 */
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.88, 0.85],
  /** 工程设定（保留中龄领导枝续顶口径）。 */
  leaderLengthRatio: 0.48,

  // 逐级分级（主次分级；低级陡、末级缓）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；Spec 末级结构仅定性「细密
   *  小枝网络」Inferred [6]）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown）。 */
  lengthRatioBase: 0.4,
  lengthRatioSpan: 0.15,
  /** L1 0.7 = 骨架枝通体粗壮有力——Spec「骨架枝粗壮有力」Verified [3] 的方向性锥度
   *  表达；具体数值工程设定。 */
  endRatio: [0.7, 0.62, 0.62, 0.62, 0.62],

  // 冠内通透
  /** Spec：crown_transparency 冠内明显空隙、逆光可透视（Verified [6] 照片）。
   *  slot-0 = 1.0（基准；槽间调密度归 009.3）。 */
  canopyDensity: 1.0,
  /** Spec：crown_fill_gradient 外密内疏、冠壳叶密冠心空（Verified [6] 照片）。 */
  crownShellStart: 0.55,
  /** 芯层起点与地板值：工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.05,
  /** 规则①（Spec crown_transparency 的「透」侧表达，Verified [6]）；数值工程设定。 */
  channelRadius: 0.42,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（Spec「冠内明显空隙」Verified [6]）；数量与尺度工程设定。 */
  voidCount: 3,
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.9,
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（T009.2 slot-0 锚点终值——探针矩阵实测收敛：存活卡 7167 / 总面
  //  35058 / 保留簇 398（剔 412）/ 保留簇近邻比全 ≥0.554 中位 0.73，依据见任务完成记录）
  /** Spec：叶着生一年生小枝（leaf_attachment_rule，Verified [1][2]）；冠壳外段受光
   *  集中（Inferred [6]）。簇位数（L5=2 沿途外段 + 枝端、L4=1 外段）为夏栎五级拓扑
   *  的私有映射。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」Inferred [6] 的幅度映射；内层枝梢的外段仍进冠心——内层候选来源）。 */
  clusterInnerStartL5: 0.5,
  clusterInnerStartL4: 0.45,
  /** 工程设定（clump_scale 仅定性「簇团状」Inferred [6]，数值尺度照片不可靠）。
   *  L4 簇略大（×1.25）——承接更粗末级枝。 */
  clusterRadiusMinL5: 0.11,
  clusterRadiusSpanL5: 0.04,
  clusterRadiusScaleL4: 1.25,
  /** 工程设定（无现实基准）。 */
  clusterRadiusLengthCap: 0.6,
  /** 工程设定（leaf_cluster_density Unknown——离散挂簇的间隙保险，无现实基准）。 */
  clusterMinSeparation: 0.55,
  /** 工程设定（簇-枝梢生长关系的幅度项）。 */
  clusterForwardOffset: 0.2,
  /** 工程设定（leaf_cluster_density Unknown，无现实基准——不得编造依据）。 */
  clusterLeavesL5: 22,
  clusterLeavesL4: 22,
  /** 工程设定（crown_fill_gradient 外密内疏 Verified [6] 的簇内同构映射；簇内幅度
   *  无现实基准）。 */
  clusterShellBias: 0.62,
  /** 工程设定。 */
  clusterShellGamma: 0.8,
  /** Spec：真叶 6–20 × 3–8cm、典型 ≈10 × 5cm（leaf_size Verified [1][2]）——单卡
   *  视觉 ≈ 真叶 1.6–2.6×、中位 ≈2×（附录#12 偏差收敛的工程映射；卡 = 叶簇抽象，
   *  非等比复刻）。 */
  leafWidthMin: 0.08,
  leafWidthSpan: 0.05,
  /** Spec：leaf_aspect_ratio ≈1.6–2.7、典型 ≈2（Verified [1][2]）——附录#13 收敛，
   *  直接采用 Verified 域。 */
  leafAspectMin: 1.6,
  leafAspectSpan: 1.1,
  // 树皮近景微起伏（T009.4 slot-0 终值——近景轮廓起伏可辨、中远景无观感回归的锚定值；
  //  槽间恒等非形态差异维度——slot-0 定义、slot-1…7 spread 继承；机制与共性标注见
  //  家族契约 BroadleafBarkRelief 注释。amplitudeRatio 0.033：主干基环（含 flare）半径
  //  0.34–0.42m → 峰幅度 ≈1.1–1.4cm、同环极差 ≈1.5–2.5cm；L1 ≈4mm、L5 末梢 <1mm。
  //  harmonics ≤5 为主干 radial 12 的奈奎斯特安全域）
  barkRelief: {
    amplitudeRatio: 0.033,
    harmonics: [3, 4, 5],
    drift: 0.85,
  },
  /** 主干拓扑（径向 12 满足近景圆度、环段 14 承载根部 flare 与挂点插值）。工程设定。 */
  trunk: { radial: 12, segs: 14, wander: 0.05, upturn: 0.06 },
  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）。分枝 4–5 级为附录#7 已符合项（Spec
   *  branching_levels ≥3–4 级 Inferred [6]），级数槽间不动；各级数值工程设定。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.12, upturn: 0.3 },
    { radial: 7, segs: 8, wander: 0.16, upturn: 0.22 },
    { radial: 6, segs: 5, wander: 0.22, upturn: 0.18 },
    { radial: 5, segs: 4, wander: 0.3, upturn: 0.15 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.12 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（计数类：改值即改面数）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3）：密林端窄高读向——光照竞争下冠幅收窄、冠体上扬、干材比例高
 * （Spec §6「密林更高更窄、干净主干」Inferred [6]，照片样木均为开阔地个体、密林端无照片
 * 证据——方向采信、幅度工程设定）。组合：冠幅比显著降（0.56，同槽带 ≈0.54–0.58；附录#2
 * 成熟开阔地域 0.8–0.9 的密林对端外推）+ 冠高比升（0.80）+ 冠心微升 + 横展角收窄上举
 * （42–56°——横枝上举收拢冠幅）+ 挂高段上移（0.62–0.92 干高段——密林干净主干）+
 * 领导枝强（0.58——中龄领导枝口径 Spec Unknown，工程设定延续 slot-0 口径加强）+
 * rank 势差收小（首枝 ×1.06 → 窄冠均齐）+ asymmetry 降（0.40——密林个体冠形规整）+
 * 姿态更刚直（trunk/levels wander ×0.8，分级单调性不破——工程设定）。
 */
const TREE3A_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...TREE3A_SLOT0_PROFILE,
  crownWidthRatio: 0.56,
  crownCenterRatio: 0.66,
  crownHeightRatio: 0.8,
  asymmetry: 0.4,
  crownTopBias: 0.15,
  scaffoldAngleMin: 42,
  scaffoldAngleMax: 56,
  scaffoldAttachMin: 0.62,
  scaffoldAttachSpan: 0.3,
  scaffoldRankLength: [1.06, 1.0, 0.95, 0.9, 0.86],
  scaffoldRankRadius: [1.0, 0.97, 0.94, 0.91, 0.88],
  leaderLengthRatio: 0.58,
  trunk: { radial: 12, segs: 14, wander: 0.04, upturn: 0.06 },
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.3 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.22 },
    { radial: 6, segs: 5, wander: 0.18, upturn: 0.18 },
    { radial: 5, segs: 4, wander: 0.24, upturn: 0.15 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.12 },
  ],
};

/**
 * slot-2 展开组合（009.3）：老树端宽展扁冠——树龄联动冠幅比增大、失去领导枝、冠顶多主枝
 * 分摊（Spec §3 老树 ≈1.0 / §6 树龄联动并发，Inferred [6]）。组合：冠幅比 0.70（附录#2
 *  老树 1.0 域下缘的参数映射——实测校准：横展角 64–80° + 首枝 ×1.22 + 槽 seed 抖动放大
 * 实现冠幅，0.70 参数 + 领导枝 0.44 实现 ≈1.05 实测冠幅/树高，直取任务书起点
 * 0.85–0.88 会越域至 ≈1.3）+ 冠高比降（0.64 扁冠）+ 冠心降（0.58）+
 * 横展角大（64–80°——大枝自干平展张开，Spec scaffold_angle 定性横展大角度 Inferred [6]）+
 * 挂高段下移（0.46 起——附录#3 干高占比下缘联动）+ 领导枝弱（0.44——成熟冠顶多主枝分摊
 * Inferred [6]，领导枝链缩短弱化；实测校准自 0.34：过弱领导下树顶改由骨架枝链决定、随
 * 冠幅缩水跌破 7m 尺度带下沿）+ 首枝 rank 主导强（×1.22——老树一级枝可极粗并承载大
 * 质量，Spec §4 Inferred [6]）+ asymmetry 升（0.60——宽展不规则圆顶 Verified [3]）+
 * crownTopBias 负（-0.10——扁冠顶均）。
 */
const TREE3A_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...TREE3A_SLOT0_PROFILE,
  crownWidthRatio: 0.7,
  crownCenterRatio: 0.58,
  crownHeightRatio: 0.64,
  asymmetry: 0.6,
  crownTopBias: -0.1,
  scaffoldAngleMin: 64,
  scaffoldAngleMax: 80,
  scaffoldAttachMin: 0.46,
  scaffoldAttachSpan: 0.38,
  scaffoldRankLength: [1.22, 1.02, 0.9, 0.8, 0.72],
  scaffoldRankRadius: [1.05, 0.94, 0.88, 0.82, 0.78],
  leaderLengthRatio: 0.44,
};

/**
 * slot-3 偏冠组合（009.3）：冠不对称——一侧枝展显著强于对侧的偏重读向（现实依据：冠形
 * 不规则、骨架枝方位不规则非轮生 Inferred [6]——方向采信；持续单侧偏冠的幅度无照片证据，
 * 幅度工程设定）。组合：asymmetry ↑↑（0.85——方位抖动 ±37.5°，骨架枝方位聚散幅度大）+
 * scaffoldRankLength 首枝 ×1.50 主导（弱势 ×0.70——一侧枝展压倒性，读向「偏」；实测
 * 校准自 ×1.40：同 seed 下质心偏移对标准槽仅 ×1.49 不足方向读数）+ scaffoldRankRadius
 * 同向（×1.12——主导枝更粗）+ 冠幅比升（0.74——偏冠展幅的容纳域）+ 横展角域微扩
 * （52–72°）。其余维度贴标准（偏冠 = 方位维差异，非冠形整体差异）。
 */
const TREE3A_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...TREE3A_SLOT0_PROFILE,
  crownWidthRatio: 0.74,
  crownCenterRatio: 0.63,
  asymmetry: 0.85,
  scaffoldAngleMin: 52,
  scaffoldAngleMax: 72,
  scaffoldAttachMin: 0.54,
  scaffoldAttachSpan: 0.36,
  scaffoldRankLength: [1.5, 1.0, 0.85, 0.76, 0.7],
  scaffoldRankRadius: [1.12, 0.96, 0.9, 0.85, 0.8],
  leaderLengthRatio: 0.46,
};

/**
 * slot-4 低冠组合（009.3）：冠位低垂——分枝点压向现实域下缘（Spec §3 主干分枝点高度占比
 * ≈0.25–0.35 树高 Inferred [6]，附录#3 判定口径 slot-0 中位 ≈0.27–0.29，本槽向下缘压；
 * 更低于域的幅度工程设定）。组合：挂高段大幅下移（attachMin 0.40 + span 0.42——视觉
 * 冠底 ≈0.40×干高 0.40–0.46 ≈ 0.17 树高，仍高于 0.16 下限；实测校准自 0.44/0.40：同
 * seed 下与高冠槽冠底差不足 1.2m 方向读数）+ 冠心大降（0.52）+ crownTopBias 负（-0.18
 * ——底密顶疏，下垂冠量）+ 横展角大（68–84° 近水平低垂平展）+ 姿态下压（levels upturn
 * ×0.5——枝梢上翘弱化、冠体下沉；分级单调性保持）+ 簇半径微升（低垂大簇——簇内叶卡
 * 下缘更低）+ 领导枝弱（0.38——冠顶优势弱化）+ 冠高比微升（0.74——低挂点纵域更长）+
 * 冠幅比微升（0.72）。
 */
const TREE3A_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...TREE3A_SLOT0_PROFILE,
  crownWidthRatio: 0.72,
  crownCenterRatio: 0.52,
  crownHeightRatio: 0.74,
  asymmetry: 0.55,
  crownTopBias: -0.18,
  scaffoldAngleMin: 68,
  scaffoldAngleMax: 84,
  scaffoldAttachMin: 0.4,
  scaffoldAttachSpan: 0.42,
  scaffoldRankLength: [1.18, 1.02, 0.92, 0.84, 0.78],
  scaffoldRankRadius: [1.02, 0.95, 0.9, 0.86, 0.83],
  leaderLengthRatio: 0.38,
  clusterRadiusMinL5: 0.13,
  clusterRadiusSpanL5: 0.05,
  levels: [
    { radial: 8, segs: 9, wander: 0.12, upturn: 0.15 },
    { radial: 7, segs: 8, wander: 0.16, upturn: 0.11 },
    { radial: 6, segs: 5, wander: 0.22, upturn: 0.09 },
    { radial: 5, segs: 4, wander: 0.3, upturn: 0.08 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.06 },
  ],
};

/**
 * slot-5 高冠组合（009.3）：清干高枝——分枝点上提（Spec §3 分枝点占比域 0.25–0.35 上缘
 * 外的密林「干净主干」联动读向 Inferred [6]；幅度工程设定）。组合：挂高段大幅上移
 * （attachMin 0.74 + span 0.22——最高挂点 0.74+0.22×0.8+0.06 ≤ 0.98 < 1.0 不越干顶；
 * 实测校准自 0.70/0.26：同 seed 下与低冠槽冠底差不足 1.2m 方向读数）+ 冠心升（0.72）+
 * crownTopBias 正（0.18——顶密）+ 领导枝强（0.56——续顶收束）+ 横展角收（44–58° 上举）+
 * 姿态上举（levels upturn ×1.25——枝梢上翘强化、冠体上收；分级单调性保持）+ 冠高比降
 * （0.66——高挂点下纵域收窄）+ 冠幅比微降（0.62）+ asymmetry 降（0.45）。
 */
const TREE3A_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...TREE3A_SLOT0_PROFILE,
  crownWidthRatio: 0.62,
  crownCenterRatio: 0.72,
  crownHeightRatio: 0.66,
  asymmetry: 0.45,
  crownTopBias: 0.18,
  scaffoldAngleMin: 44,
  scaffoldAngleMax: 58,
  scaffoldAttachMin: 0.74,
  scaffoldAttachSpan: 0.22,
  scaffoldRankLength: [1.08, 1.0, 0.94, 0.89, 0.85],
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.89, 0.86],
  leaderLengthRatio: 0.56,
  levels: [
    { radial: 8, segs: 9, wander: 0.12, upturn: 0.38 },
    { radial: 7, segs: 8, wander: 0.16, upturn: 0.28 },
    { radial: 6, segs: 5, wander: 0.22, upturn: 0.23 },
    { radial: 5, segs: 4, wander: 0.3, upturn: 0.19 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.15 },
  ],
};

/**
 * slot-6 疏松组合（009.3）：通透稀疏——冠形近标准，差异纯落冠内通透维（Spec
 * crown_transparency 冠内明显空隙、逆光可透视 Verified [6]；「老树通透强于密冠个体」的
 * 疏端个体——变体幅度内，幅度工程设定）。组合：canopyDensity 0.70（整体叶量基准降三成）
 * + crownShellStart ↑（0.62——满密壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor
 * ↓（0.03——冠心更空）+ 空腔半径域 ↑（0.60–1.05——冠内大空隙更大）+ clusterMinSeparation
 * ↑（0.70——簇间距离抑制更狠，保留簇更少）+ clusterShellBias ↓（0.56——簇内也更散）。
 */
const TREE3A_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...TREE3A_SLOT0_PROFILE,
  canopyDensity: 0.7,
  crownShellStart: 0.62,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.03,
  voidRadiusMin: 0.6,
  voidRadiusMax: 1.05,
  clusterMinSeparation: 0.7,
  clusterShellBias: 0.56,
};

/**
 * slot-7 丰满组合（009.3）：浓密团冠——crown_transparency 变体幅度的密端个体（照片样木
 * 「三张整树照均判 open-with-gaps」内的相对密端；幅度工程设定）。组合：crownShellStart ↓
 * （0.42——满密壳带更厚）+ crownCoreStart ↑（0.20）+ coreDensityFloor ↑（0.20——冠心
 * 地板密度抬升（锚点 0.05 的 4 倍），团冠感；实测校准：0.30 时总面数 40886 越 40000
 * 预算带，0.25/0.22 时内核/外壳保留比 1.76/1.81 贴 1.8 外密内疏不变量线）+ 空腔半径域
 * ↓（0.40–0.72）+ clusterMinSeparation ↓（0.50——簇间抑制放松，保留簇仍多于标准槽；
 * 实测校准自 0.45：卡数 10081 越预算带）+ clusterShellBias ↑（0.68——簇壳更实）+
 * 冠幅/冠高比微升（0.68 / 0.74——团冠体量）。
 */
const TREE3A_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...TREE3A_SLOT0_PROFILE,
  crownWidthRatio: 0.68,
  crownHeightRatio: 0.74,
  crownShellStart: 0.42,
  crownCoreStart: 0.2,
  coreDensityFloor: 0.2,
  voidRadiusMin: 0.4,
  voidRadiusMax: 0.72,
  clusterMinSeparation: 0.5,
  clusterShellBias: 0.68,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽形态向量组合——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合）。slot-1…7 以
 * slot-0 锚点为底的差量展开定义——**结构计数类字段（radial/segs/childPlan/簇位数/每簇
 * 叶量/voidCount/scaffoldCount）与叶卡尺寸/长宽比域由展开继承逐位恒等**（皮面数恒等
 * 20724 与 rng 消费次数恒等的结构性保证）；morphSeed 路由见 asset_tree_3a。
 */
export const TREE3A_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  TREE3A_SLOT0_PROFILE,
  TREE3A_SLOT1_PROFILE,
  TREE3A_SLOT2_PROFILE,
  TREE3A_SLOT3_PROFILE,
  TREE3A_SLOT4_PROFILE,
  TREE3A_SLOT5_PROFILE,
  TREE3A_SLOT6_PROFILE,
  TREE3A_SLOT7_PROFILE,
];
