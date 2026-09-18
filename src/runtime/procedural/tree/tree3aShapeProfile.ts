/**
 * runtime/procedural/tree/tree3aShapeProfile —— 夏栎私有结构参数面（shapeProfile，T009.1）。
 *
 * 职责：夏栎枝干/冠层结构的全部形态参数域——008.2 硬编码在 broadleafGeometry 的
 *      LEVELS / TRUNK / CHILD_PLAN / LEAF 常量自本任务起由 shapeProfile 消费；字段集
 *      按 docs/research/tree3a-reference.md（Spec Version 1.0）结构事实定稿，逐字段
 *      标注 Spec 依据与 Evidence Status（Verified / Inferred / Unknown / 工程设定——
 *      Unknown 项不得编造现实依据，仅按工程直觉设定）。字段面同时是 009.3 八槽形态
 *      向量组合的原料（本任务只交付 slot-0 标准组合初值）。
 * 边界：夏栎资产私有参数面——**不进 ProceduralBuild 公共签名**（build 只负责把
 *      morphSeed 路由到对应槽的 profile，见 asset_tree_3a.asset）；比率字段以
 *      totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 */

/** 逐级枝拓扑预算（皮面恒等的来源——计数类参数，改值即改面数） */
export interface LevelTopology {
  /** 径向分段（管周向顶点数；随枝级递减） */
  radial: number;
  /** 环段数（管轴向前向分段） */
  segs: number;
  /** 每步方向游走幅度（粗枝刚直、细枝纷乱——主次分级的姿态语言） */
  wander: number;
  /** 上扬曲率偏置（横枝末段上翘——夏栎冠形语言） */
  upturn: number;
}

/** 子枝挂点计划（t 沿父枝弧长；末位 1.0 = 延伸延续枝） */
export interface ChildPlan {
  ts: number[];
  /** 侧枝方位均分步进（弧度） */
  phaseStep: number;
}

/**
 * 夏栎 shapeProfile：字段分五组——冠形 / 骨架 / 逐级分级 / 冠内通透 / 叶卡与拓扑预算。
 * 槽间差异（009.3）= 同字段集不同值组合；结构计数类（radial/segs/childPlan/每枝卡数）
 * 保持槽间恒定以维持皮面数恒等，槽差异全部落在连续形态参数上。
 */
export interface Tree3aShapeProfile {
  // ── 冠形（009.3 形态向量原料；冠参考系同时是冠内通透密度场的判定基准）──
  /** 冠幅 / 树高（骨架枝长度与冠椭球半径的共同驱动）。Spec：成熟开阔地 ≈0.8–0.9、
   *  老树 ≈1.0（Inferred [6] 照片目测）；slot-0 锚中龄公园树 0.66（域内偏窄侧，
   *  幅度裁决归 009.3）。 */
  crownWidthRatio: number;
  /** 冠中心高 / 实际树高（冠椭球中心）。工程设定（涌现自挂高段与领导枝链，
   *  Spec 无直接数值；间接锚 trunk_height_ratio ≈0.25–0.35 Inferred [6]）。 */
  crownCenterRatio: number;
  /** 冠高 / 实际树高（冠椭球半高 = ratio/2）。工程设定（同上）。 */
  crownHeightRatio: number;
  /** 冠不对称强度 0–1（骨架枝方位抖动幅度缩放）。Spec：宽展不规则圆顶（Verified [3]）、
   *  骨架枝绕干方位不规则非轮生（Inferred [6]）。slot-0 = 0.5（等效 008.2 ±25°）。 */
  asymmetry: number;
  /** 冠顶偏置 -1..+1（叶量沿冠高方向的保留偏置；>0 顶密、<0 底密）。
   *  Spec：成熟/老树冠顶多主枝分摊（Inferred [6]）。slot-0 = 0（顶底均衡）。 */
  crownTopBias: number;

  // ── 骨架（一级枝）──
  /** 骨架枝数量。Spec：≈5–7 根（Inferred [6] 三照汇聚）；slot-0 = 5（附录#8 已符合，
   *  另含 1 领导枝——中龄口径，顶枝优势裁决归 009.3）。 */
  scaffoldCount: number;
  /** 骨架枝横展角域（对铅垂，度）。slot-0 = 55–70°（附录#8 已符合；
   *  Spec scaffold_angle 仅定性「横展大角度」，数值撤销——工程设定维持已符合带）。 */
  scaffoldAngleMin: number;
  scaffoldAngleMax: number;
  /** 挂高段（沿干弧长；下缘即视觉冠底）。slot-0 = 0.55 起跨 0.35（附录#8 已符合：
   *  挂高 55–95% 干高段、视觉冠底占比 0.20–0.33；Spec branch_attachment_t
   *  ≈0.25–0.35 树高 Inferred [6]）。 */
  scaffoldAttachMin: number;
  scaffoldAttachSpan: number;
  /** 骨架枝起径 / 主干挂点径。工程设定（branch_radius_decay Unknown，无现实基准）。 */
  scaffoldThickness: number;
  /** 骨架枝 rank 长度乘子（按方位序递减——主次分级：骨架枝内部强弱势差，
   *  rank0 = 首枝主导，强化自 008.2 单点 ×1.08）。工程设定。 */
  scaffoldRankLength: number[];
  /** 骨架枝 rank 起径乘子（与长度乘子同向——主导枝更粗）。工程设定。 */
  scaffoldRankRadius: number[];
  /** 领导枝链长基准（段长 / (树高 - 干高)）。工程设定（保留中龄领导枝续顶口径）。 */
  leaderLengthRatio: number;

  // ── 逐级分级（主次分级核心；子/父比序列）──
  /** 子起径 / 父挂点径，按父级 L1→L2 … L4→L5 共 4 项（低级陡、末级缓——
   *  一级粗枝与末梢细枝的视觉权重落差）。工程设定（branch_radius_decay Unknown，
   *  无现实基准；Spec 末级结构仅定性「细密小枝网络」Inferred [6]）。 */
  radiusRatio: [number, number, number, number];
  /** 子长 / 父长基值与跨度（rng 连续域）。工程设定（branch_length_decay Unknown）。 */
  lengthRatioBase: number;
  lengthRatioSpan: number;
  /** 每级末径 / 起径（L1 0.7 = 骨架枝通体粗壮有力——Spec「骨架枝粗壮有力」
   *  Verified [3] 的方向性锥度表达；具体数值工程设定）。 */
  endRatio: number[];

  // ── 冠内通透（本任务核心：显式规则替代「叶卡只挂外段」的涌现式空腔）──
  /** 基准密度乘子（整体叶量缩放）。Spec：crown_transparency 冠内明显空隙、逆光可透视
   *  （Verified [6] 照片）。slot-0 = 1.0（基准；槽间调密度归 009.3）。 */
  canopyDensity: number;
  /** 壳层满密度起点（冠内归一化径向深度 q ≥ 此值密度 = 1）。Spec：crown_fill_gradient
   *  外密内疏、冠壳叶密冠心空（Verified [6] 照片）。 */
  crownShellStart: number;
  /** 芯层起点（q ≤ 此值密度 = 地板值）与地板值。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: number;
  coreDensityFloor: number;
  /** 枝干通道半径（米）：主干 / 领导枝基段周围的叶卡硬抑制带——主干大枝进冠不被封死
   *  （规则①；Spec crown_transparency 的「透」侧表达，Verified [6]）。 */
  channelRadius: number;
  /** 骨架枝通道半径缩放 / 保护段占枝长（规则①：粗枝基段同样留通道）。工程设定。 */
  channelBranchScale: number;
  channelLengthRatio: number;
  /** 局部空腔数量 / 半径域（米）/ 中心向冠心偏置（规则③：冠内大空隙的显式控制，
   *  Spec「冠内明显空隙」Verified [6]；数量与尺度工程设定）。 */
  voidCount: number;
  voidRadiusMin: number;
  voidRadiusMax: number;
  voidCenterBias: number;

  // ── 叶卡与拓扑预算（结构计数类——槽间保持恒定以维持皮面数恒等）──
  /** L4/L5 每枝叶卡数（候选数，通透过滤前）。工程设定（leaf_cluster_density Unknown）。 */
  leafCardsL4: number;
  leafCardsL5: number;
  /** 沿枝挂点起点（t 下限）——放宽自 008.2 的 0.55/0.3：内层挂点交由显式密度场裁汰
   *  （外密内疏不再依赖「只挂外段」的涌现式空腔）。工程设定。 */
  leafInnerStartL4: number;
  leafInnerStartL5: number;
  /** 叶位径向外扩上限（米）。工程设定（008.2 现值维持）。 */
  leafOffsetMax: number;
  /** 卡宽域 / 长宽比域（009.2 叶簇生成将重校，本任务维持现值）。 */
  leafWidthMin: number;
  leafWidthSpan: number;
  leafLenRatioMin: number;
  leafLenRatioSpan: number;
  /** 主干拓扑（径向 12 满足近景圆度、环段 14 承载根部 flare 与挂点插值）。工程设定。 */
  trunk: { radial: number; segs: number; wander: number; upturn: number };
  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）。分枝 4–5 级为附录#7 已符合项
   *  （Spec branching_levels ≥3–4 级 Inferred [6]），级数槽间不动。 */
  levels: LevelTopology[];
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（计数类：改值即改面数）。 */
  childPlan: ChildPlan[];
}

/**
 * slot-0 标准组合初值（锚点形态）：T008.6 附录已符合项全部保持——主干近直立（倾轴
 * ≤4°，见 broadleafGeometry 生成域）、分枝五级、骨架枝 5 根横展 55–70°、挂高 55–95%
 * 干高段（视觉冠底占比 0.20–0.33）；主次分级与冠内通透为本次升级项（数值变化见
 * T009.1 完成记录新旧对照）。Unknown 项（radiusRatio / lengthRatio / 骨架枝锥度）为
 * 工程设定，无现实基准。
 */
export const TREE3A_SLOT0_PROFILE: Tree3aShapeProfile = {
  // 冠形
  crownWidthRatio: 0.66,
  crownCenterRatio: 0.64,
  crownHeightRatio: 0.72,
  asymmetry: 0.5,
  crownTopBias: 0,

  // 骨架
  scaffoldCount: 5,
  scaffoldAngleMin: 55,
  scaffoldAngleMax: 70,
  scaffoldAttachMin: 0.55,
  scaffoldAttachSpan: 0.35,
  scaffoldThickness: 0.58,
  scaffoldRankLength: [1.14, 1.02, 0.94, 0.87, 0.81],
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.88, 0.85],
  leaderLengthRatio: 0.48,

  // 逐级分级（主次分级）
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  lengthRatioBase: 0.4,
  lengthRatioSpan: 0.15,
  endRatio: [0.7, 0.62, 0.62, 0.62, 0.62],

  // 冠内通透
  canopyDensity: 1.0,
  crownShellStart: 0.55,
  crownCoreStart: 0.12,
  coreDensityFloor: 0.05,
  channelRadius: 0.42,
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  voidCount: 3,
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.9,
  voidCenterBias: 0.6,

  // 叶卡与拓扑预算
  leafCardsL4: 7,
  leafCardsL5: 14,
  leafInnerStartL4: 0.18,
  leafInnerStartL5: 0.08,
  leafOffsetMax: 0.07,
  leafWidthMin: 0.15,
  leafWidthSpan: 0.08,
  leafLenRatioMin: 0.85,
  leafLenRatioSpan: 0.3,
  trunk: { radial: 12, segs: 14, wander: 0.05, upturn: 0.06 },
  levels: [
    { radial: 8, segs: 9, wander: 0.12, upturn: 0.3 },
    { radial: 7, segs: 8, wander: 0.16, upturn: 0.22 },
    { radial: 6, segs: 5, wander: 0.22, upturn: 0.18 },
    { radial: 5, segs: 4, wander: 0.3, upturn: 0.15 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.12 },
  ],
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 填满 8 槽形态向量组合；当前仅 slot-0 标准组合，
 * 未列槽一律回落 slot-0——009.3 之前 8 槽结构一致、差异仅来自 morphSeed 随机流，
 * 与 008.x 行为兼容）。
 */
export const TREE3A_SHAPE_PROFILES: Tree3aShapeProfile[] = [TREE3A_SLOT0_PROFILE];
