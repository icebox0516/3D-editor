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
 * 夏栎 shapeProfile：字段分五组——冠形 / 骨架 / 逐级分级 / 冠内通透 / 叶簇与拓扑预算。
 * 槽间差异（009.3）= 同字段集不同值组合；结构计数类（radial/segs/childPlan/簇位数/
 * 每簇叶量）保持槽间恒定以维持皮面数恒等与 rng 消费次数恒定（保留簇数与叶卡数随 seed
 * 由簇级距离抑制 + 冠内通透规则确定），槽差异全部落在连续形态参数上。
 * 叶簇字段组逐字段标【阔叶共性候选】/【夏栎特有】（T009.2——供 T010.1 家族契约提炼
 * 取证，只标注不做公共抽象）。
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

  // ── 叶簇（T009.2 枝梢驱动叶簇：L4/L5 枝梢 → 簇空间 → 叶片分布）——
  // 「多个叶簇构成的树冠」替代「叶片堆起来的树冠」；共性标注供 T010.1 家族契约提炼取证，
  // 本任务只标注不做公共抽象 ──
  /** L5 / L4 每枝簇位数量（结构计数类——rng 消费次数恒定的来源，槽间恒定；保留簇数随
   *  seed 由簇级距离抑制确定，见 clusterMinSeparation）。
   *  L5 = 沿途外段 + 枝端共 2 簇、L4 = 外段 1 簇。Spec：叶着生一年生小枝
   *  （leaf_attachment_rule，Verified [1][2]）；冠壳外段受光集中（Inferred [6]）。
   *  【夏栎特有】（挂簇枝级 L4/L5 与簇位数为夏栎五级拓扑的私有映射）。 */
  clustersL5: number;
  clustersL4: number;
  /** 簇挂点 t 域下限（沿枝弧长；枝端簇固定 t=1，其余簇在外段均匀散布）。
   *  工程设定（「外段」Inferred [6] 的幅度映射；内层枝梢的外段仍进冠心——内层候选来源）。 */
  clusterInnerStartL5: number;
  clusterInnerStartL4: number;
  /** L5 簇半径域（米）/ L4 簇半径乘子（L4 簇略大——承接更粗末级枝）。工程设定
   *  （clump_scale 仅定性「簇团状」Inferred [6]，数值尺度照片不可靠）。【簇半径比类 =
   *  阔叶共性候选；绝对量级 = 夏栎特有】。半径须显著小于典型枝梢间距（簇间间隙来源）。 */
  clusterRadiusMinL5: number;
  clusterRadiusSpanL5: number;
  clusterRadiusScaleL4: number;
  /** 簇半径 / 挂簇枝长 比例上限（cap：短枝梢簇随之缩小——簇尺度随枝条活力，且保证同枝
   *  两簇中心距 > 簇半径和、簇间间隙成立）。工程设定（无现实基准）。【阔叶共性候选】 */
  clusterRadiusLengthCap: number;
  /** 簇级显式剔除：与已保留簇中心距 < clusterMinSeparation×(ri+rj) 的簇位丢弃（后生成
   *  者让位——父子/兄弟枝梢拓扑共位处的距离抑制；簇位 rng/叶片 rng 无条件消费后丢弃，
   *  确定性不破）。工程设定（leaf_cluster_density Unknown——离散挂簇的间隙保险，
   *  无现实基准）。【阔叶共性候选】 */
  clusterMinSeparation: number;
  /** 簇中心沿簇方向（挂点枝切向）前移量（× 簇半径）——簇坐枝梢稍前方、叶量越枝端。
   *  工程设定（簇-枝梢生长关系的幅度项）。【阔叶共性候选】 */
  clusterForwardOffset: number;
  /** 每簇叶量（候选上限，固定计数——确定性纪律：rng 消费次数与数据分支无关，被簇级
   *  剔除的簇位足额消费后丢弃；簇间疏密差异由簇级剔除与通透三规则承担）。工程设定
   *  （leaf_cluster_density Unknown，无现实基准——不得编造依据）。
   *  【每簇叶量类 = 阔叶共性候选；绝对值 = 夏栎特有】 */
  clusterLeavesL5: number;
  clusterLeavesL4: number;
  /** 外壳偏置 ∈ (0,1]：簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^gamma)——
   *  叶沿簇壳偏置、簇内自然稀疏成腔。工程设定（crown_fill_gradient 外密内疏
   *  Verified [6] 的簇内同构映射；簇内幅度无现实基准）。【阔叶共性候选】 */
  clusterShellBias: number;
  /** 外壳偏置分布形状 γ（<1 向簇壳聚、>1 向簇心聚）。工程设定。【阔叶共性候选】 */
  clusterShellGamma: number;
  /** 卡宽域（米）。Spec：真叶 6–20 × 3–8cm、典型 ≈10 × 5cm（leaf_size Verified [1][2]）——
   *  单卡视觉 ≈ 真叶 1.6–2.6×、中位 ≈2×（附录#12 偏差收敛的工程映射；卡 = 叶簇抽象，
   *  非等比复刻）。【卡尺寸域类 = 阔叶共性候选；绝对量级 = 夏栎特有】 */
  leafWidthMin: number;
  leafWidthSpan: number;
  /** 卡长宽比域。Spec：leaf_aspect_ratio ≈1.6–2.7、典型 ≈2（Verified [1][2]）——
   *  附录#13 收敛，直接采用 Verified 域。【阔叶共性候选】 */
  leafAspectMin: number;
  leafAspectSpan: number;
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

  // 叶簇与拓扑预算（T009.2 slot-0 锚点终值——探针矩阵实测收敛：存活卡 7167 / 总面
  //  35058 / 保留簇 398（剔 412）/ 保留簇近邻比全 ≥0.554 中位 0.73，依据见任务完成记录）
  clustersL5: 2,
  clustersL4: 1,
  clusterInnerStartL5: 0.5,
  clusterInnerStartL4: 0.45,
  clusterRadiusMinL5: 0.11,
  clusterRadiusSpanL5: 0.04,
  clusterRadiusScaleL4: 1.25,
  clusterRadiusLengthCap: 0.6,
  clusterMinSeparation: 0.55,
  clusterForwardOffset: 0.2,
  clusterLeavesL5: 22,
  clusterLeavesL4: 22,
  clusterShellBias: 0.62,
  clusterShellGamma: 0.8,
  leafWidthMin: 0.08,
  leafWidthSpan: 0.05,
  leafAspectMin: 1.6,
  leafAspectSpan: 1.1,
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
