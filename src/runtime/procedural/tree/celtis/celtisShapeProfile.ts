/**
 * runtime/procedural/tree/celtis/celtisShapeProfile —— 朴树 shapeProfile 数值面
 * （T011.1，阔叶家族契约第二实例——方法复制自夏栎第一实例 ../tree3a/tree3aShapeProfile）。
 *
 * 职责：朴树（Celtis sinensis）枝干/冠层结构的形态参数**数值面**——类型契约 =
 *      阔叶家族 ../broadleaf/broadleafShapeProfile（BroadleafShapeProfile，零修改实例化；
 *      字段语义、【阔叶共性候选】/【夏栎特有】标注、T009.3 消费语义与槽间恒等纪律见家族
 *      文件——**夏栎第一实例的数值是证据不是家族真理**，本文件全部数值依据
 *      docs/research/celtis-reference.md（Spec Version 1.0）朴树自己的现实事实重定）。
 *      方法恒同纪律（T011.1 任务书）：夏栎已验收的方法（五级拓扑 L1–L5、叶簇挂末两级
 *      L4/L5、结构计数类跨槽恒等、rng 无条件消费、LOD 三档同流派生）整体复制，朴树
 *      只换数值与算法细节；下方逐字段标注【家族共性候选】沿用 /【朴树特有】新证据 /
 *      工程设定（无现实基准不编造依据）。
 * 边界：朴树资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_celtis.asset）；比率字段以 totalHeight
 *      （形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 * 不建模记档（Spec 有事实、工程不表达）：核果（5–7mm 橙黄近球形，Verified [1][3][5]
 *      ——面数尺度不可辨）；秋色季相（黄至橙，Verified [5][6]——本资产交付夏绿冠层，
 *      季相归材质/风格层）；叶柄 3–10mm（Verified [3][5]——叶卡抽象不建柄）；弱水平
 *      层纹（Inferred 低置信 [6]——不建模）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：中龄公园个体 ≈8m 量级、宽阔圆穹顶冠、干高于夏栎
 * （朴树特有读向：trunk_height_ratio ≈0.35–0.45 vs 夏栎 0.25–0.35，Spec 域扩展节 A
 * Inferred [8][9] 两样木 0.35/0.45）。T009.3 教训沿用：视觉冠底由挂高段
 * （scaffoldAttachMin/Span）+ 横展角 + upturn + 领导枝链涌现，不由 crownCenterRatio——
 * 校准以实测 stats 的叶卡最低 Y（视觉冠底）为准回推挂高段参数。结构计数类
 * （trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）
 * 全槽恒等；叶卡尺寸/长宽比域槽间不动（叶身份）。
 */
export const CELTIS_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3：宽阔圆穹顶树冠（broad rounded dome，Inferred [5][6][8][9] 四源定性）；
   *  冠幅/树高比 ≈0.8–0.9（主代理终审两样木 0.80/0.85 Inferred [8][9]）。参数 → 涌现
   *  映射沿夏栎先例口径（夏栎参数 0.66 → bbox 涌现 ≈0.73——照片冠幅口径比 bbox 含裸
   *  枝梢尖的口径宽，不按照片比直调参数），slot-0 参数 0.74 → 涌现 bbox 冠幅/实高
   *  ≈0.77、绝对冠幅 ≈6.8m 落任务宽域 5.5–7.5m。【冠幅比类 = 家族共性候选沿用；锚值
   *  = 朴树特有（域比夏栎照片域同型）】 */
  crownWidthRatio: 0.74,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；间接锚干高占比域上移的
   *  冠位读向——朴树冠更收束上提）。 */
  crownCenterRatio: 0.66,
  /** 工程设定（同上；穹顶冠冠体饱满度参考系）。 */
  crownHeightRatio: 0.7,
  /** Spec：骨架枝绕干方位不规则非轮生（branch_orientation 细枝互生 Inferred [6] +
   *  整树配互生 [8][9]）。slot-0 = 0.5（家族共性沿用夏栎等效幅度）。 */
  asymmetry: 0.5,
  /** Spec §6：冠密度个体差异显著（crown_transparency Inferred [6]）；顶底均衡起步，
   *  偏置归槽。 */
  crownTopBias: 0.05,

  // 骨架
  /** Spec 域扩展节 A：scaffold_branch_count ≈5–6（主代理终审整树 ×2：~5 / ~5–6
   *  Inferred [8][9]）。slot-0 = 6（另含 1 领导枝不计入——中庸领导，见 leaderLengthRatio）。
   *  【结构计数类：槽间恒等；取 6 而非夏栎 5 = 朴树密冠读向（canopy-b 密冠 [6] 佐证）】 */
  scaffoldCount: 6,
  /** Spec 域扩展节 A：scaffold_angle ≈45–65° 对铅垂开张横展（两样木 45–60° / 50–65°
   *  Inferred [8][9]）。slot-0 = 46–64°（域内近全幅；比夏栎 55–70° 整体上举——干高冠
   *  收束读向的同族分化）。【朴树特有（新证据域比夏栎上移）】 */
  scaffoldAngleMin: 46,
  scaffoldAngleMax: 64,
  /** 干高占比 0.35–0.45 的挂高段实现（Spec 域扩展节 A trunk_height_ratio Inferred
   *  [8][9]；T009.3：挂高段下缘即视觉冠底的主驱动——但视觉冠底 ≠ 挂点 Y：朴树横展角
   *  上举（46–64°）+ 逐级 upturn + 领导枝链把冠在挂点之上再抬 ≈1.4m（探针实测：attachMin
   *  0.78 时视觉冠底达 0.51 实高——T009.3「弱领导枝翻转树顶」同款涌现，调参以实测冠底
   *  回推）。slot-0 = 0.52 起跨 0.20（挂点 0.52–0.72 干高段）+ 干高参数域 0.44–0.50
   *  （geometry 硬编码 rng 域，高于夏栎 0.40–0.46——朴树干更长）→ 涌现视觉冠底/实高
   *  0.30–0.45（8 槽带，覆盖 Spec 域并两端微外推——夏栎 slot-4/5 同型先例）。
   *  实测校准：slot-0 规范种子 0.363（两样木 0.35/0.45 的低值端邻域，探针记录）。
   *  【朴树特有（干高域上移 + 上举冠链抬升的回推结果）】 */
  scaffoldAttachMin: 0.52,
  scaffoldAttachSpan: 0.2,
  /** 工程设定（branch_radius_decay Unknown，无现实基准；朴树干径 Unknown——中龄 8m
   *  量级取略细于夏栎的挂点比例，观感待视觉验收校）。 */
  scaffoldThickness: 0.56,
  /** rank 长度乘子（6 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用，
   *  势差幅度贴夏栎标准槽）。 */
  scaffoldRankLength: [1.12, 1.03, 0.96, 0.9, 0.85, 0.8],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.89, 0.86, 0.84],
  /** Spec 域扩展节 A apical_dominance：中龄密冠个体中央干延伸入冠（canopy-b 单源）、
   *  开张个体无单一领导枝（canopy-a）——**中庸强度**（弱于绝对领导、强于无）。定档
   *  0.50 基准（夏栎 slot-0 = 0.48 近似中庸、slot-1 强 0.58 / slot-2 弱 0.44——朴树取
   *  与夏栎锚点同量级的中庸值，槽间在 0.44–0.58 展开个体差异幅度）。【朴树特有定档
   *  依据 = Spec Inferred [6] 两型个体；幅度工程设定】 */
  leaderLengthRatio: 0.5,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown；朴树细枝「长而直」form-d Inferred [6] 的
   *  视觉权重落差不反证通用分级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown）。 */
  lengthRatioBase: 0.4,
  lengthRatioSpan: 0.15,
  /** L1 0.68 通体锥度（骨架枝粗壮方向性表达）。工程设定（Spec 无朴树锥度数值）。 */
  endRatio: [0.68, 0.62, 0.62, 0.62, 0.62],

  // 冠内通透
  /** Spec 域扩展节 B crown_transparency：个体差异显著、空隙感是形态向量必要维度
   *  （Inferred [6]）。slot-0 = 1.0 基准（中密端起步；疏密差异归槽 6/7）。 */
  canopyDensity: 1.0,
  /** Spec 域扩展节 B crown_fill_gradient：外密内疏（Verified [6] 两地互证）。家族沿用。 */
  crownShellStart: 0.55,
  /** 芯层起点与地板值：工程设定幅度（Spec 只给定性方向；家族沿用夏栎量级）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.05,
  /** 规则①（枝干通道：主干大枝进冠不被封死——密冠型尤其需要，canopy-b 密冠 [6]）；
   *  数值工程设定（干径略细于夏栎，通道带同幅微收）。 */
  channelRadius: 0.4,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：中密+空隙型个体 canopy-a [6] 的「空隙」表达之一）。【结构计数类：
   *  槽间恒等】数量与尺度工程设定。 */
  voidCount: 3,
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.9,
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；簇位数/每簇叶量为朴树自己的
  // 结构计数口径，与夏栎数值不同不破纪律——恒等约束只在**本资产槽间**）
  /** Spec 域扩展节 B leaf_attachment_rule：叶互生一年生细枝（Verified [3][5]）、冠壳
   *  外段受光集中（Inferred [6]）。簇位数 L5=2 + L4=1（家族沿用夏栎拓扑映射）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用）。 */
  clusterInnerStartL5: 0.5,
  clusterInnerStartL4: 0.45,
  /** 工程设定（clump_scale 仅定性「团块状」Inferred [6]；朴树叶小（真叶典型 6–8cm
   *  vs 夏栎 ≈10cm）簇半径微收：0.10–0.14 vs 夏栎 0.11–0.15）。L4 簇 ×1.25 承接更粗
   *  末级枝——家族沿用。 */
  clusterRadiusMinL5: 0.1,
  clusterRadiusSpanL5: 0.04,
  clusterRadiusScaleL4: 1.25,
  /** 工程设定（家族沿用）。 */
  clusterRadiusLengthCap: 0.6,
  /** 工程设定（leaf_cluster_density Unknown——离散挂簇间隙保险，家族沿用量级）。 */
  clusterMinSeparation: 0.55,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 16（朴树口径：叶卡面积 ≈夏栎 60%（卡宽域下移 + 长宽比短圆），皮面 24178
   *  （6 骨架 + 领导，比夏栎 20724 高 16%）+ 945 簇位下的 High 预算校准——探针实测
   *  18/簇时 8 槽 High 带 32.3–41.9K 越 40000 上限，16/簇收敛带内）。【每簇叶量类 =
   *  家族共性候选；绝对值 = 朴树特有（预算校准 + canopy-b 密冠 [6] 观感）】 */
  clusterLeavesL5: 16,
  clusterLeavesL4: 16,
  /** 工程设定（外密内疏的簇内同构映射，家族沿用）。 */
  clusterShellBias: 0.62,
  clusterShellGamma: 0.8,
  /** Spec 域扩展节 B leaf_size：真叶 3–11 × 3.5–6cm、典型 ≈6–8 × 4–5cm（Verified
   *  [1][2][3][5][6]）——单卡 ≈ 真叶 2× 的工程映射（夏栎先例口径）→ 卡宽 0.07–0.11m。
   *  【卡尺寸域类 = 家族共性候选；绝对量级 = 朴树特有（真叶小于夏栎）】 */
  leafWidthMin: 0.07,
  leafWidthSpan: 0.04,
  /** Spec 域扩展节 B leaf_aspect_ratio ≈1.3–2.0（文献推中位 ≈1.3 Verified / 照片幅度
   *  1.3–2.0 Inferred [3][5][6]）——直接采用；比夏栎 1.6–2.7 明显短圆（卵形语言，
   *  朴树与夏栎的叶身份分化）。 */
  leafAspectMin: 1.3,
  leafAspectSpan: 0.7,

  // 树皮近景微起伏（朴树特有分化：**低浮雕小斑块语言，非深沟纵脊**——Spec §5
  //  bark_archetype：幼-中龄平滑灰/灰白 → 成熟浅裂小斑块、低浮雕，Verified [1][2][5][6]，
  //  与夏栎脊状皮明确分化；幅度显著小于夏栎 0.033）
  /** 低浮雕端锚定 0.016（任务域 0.012–0.02 中值；主干基环半径 ≈0.24–0.30m → 峰幅度
   *  ≈4–5mm、同环极差 ≈5–8mm——近景低浮雕可辨、与夏栎 ≈1.1–1.4cm 的脊深明确分化；
   *  中景不可辨由近景观感标定）。【幅度 ∝ 半径量级挂钩 = 家族共性候选沿用；绝对值 =
   *  朴树特有】槽间恒等（barkRelief 非形态差异维度——slot-0 定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.016,
    /** 短斑/浅裂谐波：k∈{4,5,6} 高频端（周向斑块宽 ≈主干周长/k ≈0.28–0.43m 的小板块
     *  尺度；≤ 主干 radial 14 的奈奎斯特域 7 留 1 档边际——夏栎同款边际纪律）。
     *  【谐波语言 = 朴树特有（vs 夏栎 [3,4,5] 纵脊）】 */
    harmonics: [4, 5, 6],
    /** 轴向游走基率 16 rad/m（vs 夏栎 0.85 纵脊缓游走）：轴向去相关长度 ≈2π/16 ≈
     *  0.39m——纵向连续性快速断裂，脊读向转为浅裂小斑块（Spec「浅裂成不规则小斑块」
     *  Verified [6] 的方向性工程映射；坡度 = A·drift ≈ 0.016×0.3×16 ≈ 0.077 温和无混叠）。
     *  【游走机制 = 家族共性候选；速率值 = 朴树特有（短斑 vs 长脊）】 */
    drift: 16,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown，仅 bark-a 定性干基略扩 [6]）。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.06 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 ≥3–4 级（Spec branching_levels
   *  Inferred [6]）的家族五级方法沿用，级数槽间不动。姿态分级为朴树语言：
   *  wander 前三级比夏栎刚直（细枝「长而直」form-d Inferred [6]：0.10/0.14/0.20 vs
   *  夏栎 0.12/0.16/0.22）、末两级同乱幅（末梢束状/帚状 Inferred [6] 的散乱端）；
   *  upturn 逐级收小、L5 归零近水平——**冠缘末梢微下垂**（Spec 域扩展节 A
   *  branch_curvature Inferred [6]「末梢束状/帚状、冠缘末梢微下垂」的工程表达：
   *  末级上扬偏置 0.02 ≈ 水平摊出 + 游走散乱 → 视觉末梢垂坠读向；不用负 upturn——
   *  负值会在所有末梢强制下垂超出「冠缘微下垂、冠内直立并存」的 Spec 幅度）。各级
   *  数值工程设定（方向 Spec Inferred [6]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.28 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.22 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.16 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.08 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.02 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；二级枝对父枝 45–60°（Spec branch_angle form-d Inferred [6]）由侧枝方向
   *  混合常量表达（方法恒同），挂点分布沿用家族拓扑）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3 语法复制）：密林端窄高读向——冠幅收窄、冠体上扬、干材比例高
 * （Spec §6 尺度幅度由立地主导 Verified 域 + 立地联动 Unknown——方向工程设定）。
 * 组合：冠幅比降（0.64）+ 冠高比升（0.76）+ 横展角收窄上举（36–50°）+ 挂高段上移
 * （0.74–0.90 干高段，span 0.16——密林干净主干）+ 领导枝强（0.58——密冠个体中央干
 * 延伸入冠 Spec apical_dominance canopy-b 端 [6]）+ rank 势差收小（窄冠均齐）+
 * asymmetry 降（0.40）+ 姿态更刚直（trunk/levels wander ×0.8，分级单调性不破）。
 * 实测校准：同 seed 下 XZ 宽比 slot-2/slot-1 ≈1.35（探针记录）。
 */
const CELTIS_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...CELTIS_SLOT0_PROFILE,
  crownWidthRatio: 0.64,
  crownCenterRatio: 0.68,
  crownHeightRatio: 0.76,
  asymmetry: 0.4,
  crownTopBias: 0.15,
  scaffoldAngleMin: 36,
  scaffoldAngleMax: 50,
  scaffoldAttachMin: 0.74,
  scaffoldAttachSpan: 0.16,
  scaffoldRankLength: [1.06, 1.0, 0.95, 0.91, 0.87, 0.84],
  scaffoldRankRadius: [1.0, 0.97, 0.94, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.58,
  trunk: { radial: 14, segs: 14, wander: 0.04, upturn: 0.06 },
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.28 },
    { radial: 7, segs: 8, wander: 0.11, upturn: 0.22 },
    { radial: 6, segs: 5, wander: 0.16, upturn: 0.16 },
    { radial: 5, segs: 4, wander: 0.22, upturn: 0.08 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.02 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：老树/开阔端宽展扁穹——冠幅比增大、领导枝弱化、
 * 冠顶多主枝分摊（Spec §6 尺度幅度 + 开张个体无单一领导枝 apical_dominance canopy-a 端
 * [6]；冠幅/树高比域 0.8–0.9 的宽端 Inferred [8][9]）。组合：冠幅比 0.78（涌现
 * bbox 冠幅/实高 ≈0.99——照片域 0.8–0.9 的宽端变体外推，记档）+ 冠高比降（0.64
 * 扁穹）+ 冠心降（0.62）+ 横展角大（58–74° 大枝平展）+ 挂高段下移（0.57 起 span
 * 0.24——干高占比域下段）+ 领导枝弱（0.44）+ 首枝 rank 主导强（×1.22）+ asymmetry
 * 升（0.60）+ crownTopBias 负（-0.08 顶均）。
 */
const CELTIS_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...CELTIS_SLOT0_PROFILE,
  crownWidthRatio: 0.78,
  crownCenterRatio: 0.62,
  crownHeightRatio: 0.64,
  asymmetry: 0.6,
  crownTopBias: -0.08,
  scaffoldAngleMin: 58,
  scaffoldAngleMax: 74,
  scaffoldAttachMin: 0.57,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.22, 1.04, 0.94, 0.86, 0.79, 0.73],
  scaffoldRankRadius: [1.05, 0.95, 0.89, 0.85, 0.81, 0.78],
  leaderLengthRatio: 0.44,
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：冠形
 * 不规则、骨架枝方位不规则 Inferred [6][8][9]——方向采信；幅度工程设定）。组合：
 * asymmetry 微降（0.60——探针实测：高 asymmetry（0.85）的方位大抖动在 6 骨架下随机化
 * 整体方位、相干偏侧信号反被稀释（同 seed 质心比 ×0.81–0.84 无方向读数）；偏侧相干性
 * 由 rank 主导承载，方位不规则保中幅）+ scaffoldRankLength 首枝 ×1.62 / 弱势 ×0.64
 * （一侧枝展压倒性——首枝质量占比 27%（1.62/5.98），配 5 弱枝近均分 → 质心稳定指向
 * 首枝方位）+ scaffoldRankRadius 同向（×1.15——主导枝更粗）+ 冠幅比升（0.80 容纳域——
 * 涌现 bbox 宽 ≈9.0m，夏栎偏冠槽 9.8m 同量级容纳域）+ 横展角域微扩（44–66°）。其余
 * 维度贴标准（偏冠 = 方位维差异）。实测校准：6 种子面板质心均值比对标准槽 ≈×1.76
 * （单种子 ×0.8–×2.1 波动——相位 rng 运气，面板口径见 celtisShapeSlots 测试；rank
 * ×1.85 试算越物种尺度带弃用，探针记录）。
 */
const CELTIS_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...CELTIS_SLOT0_PROFILE,
  crownWidthRatio: 0.8,
  crownCenterRatio: 0.65,
  asymmetry: 0.6,
  scaffoldAngleMin: 50,
  scaffoldAngleMax: 68,
  scaffoldRankLength: [1.62, 1.0, 0.84, 0.75, 0.69, 0.64],
  scaffoldRankRadius: [1.15, 0.95, 0.89, 0.84, 0.8, 0.77],
  leaderLengthRatio: 0.48,
};

/**
 * slot-4 低冠组合（009.3 语法复制 + 朴树干高域 0.35–0.45 下端）：低分枝点个体——挂高段
 * 压向 Spec trunk_height_ratio 域下缘 0.35（两样木 0.35/0.45 的低值端 [8][9]）。组合：
 * 挂高段下移（attachMin 0.42 + span 0.26——低垂平展枝姿态下冠链抬升弱（upturn ×0.5，
 * 涌现 ≈0.9m vs 标准 ≈1.4m），挂点比标准槽更低回推）+ 冠心降（0.60）+ crownTopBias
 * 负（-0.15 底密）+ 横展角大（60–76° 近水平低垂平展）+ 姿态下压（levels upturn ×0.5
 * ——末梢上举弱化；分级单调性保持）+ 簇半径微升（低垂大簇）+ 领导枝弱（0.47）。
 * 实测校准：涌现视觉冠底/实高 ≈0.30（Spec 域下缘 0.35 的变体外推——夏栎 slot-4
 * 同型先例）；同 seed 下与高冠槽视觉冠底差 ≈1.3m（探针记录）。
 */
const CELTIS_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...CELTIS_SLOT0_PROFILE,
  crownWidthRatio: 0.76,
  crownCenterRatio: 0.6,
  crownHeightRatio: 0.74,
  asymmetry: 0.55,
  crownTopBias: -0.15,
  scaffoldAngleMin: 60,
  scaffoldAngleMax: 76,
  scaffoldAttachMin: 0.42,
  scaffoldAttachSpan: 0.26,
  scaffoldRankLength: [1.16, 1.02, 0.94, 0.87, 0.82, 0.77],
  scaffoldRankRadius: [1.02, 0.95, 0.9, 0.87, 0.84, 0.82],
  leaderLengthRatio: 0.47,
  clusterRadiusMinL5: 0.12,
  clusterRadiusSpanL5: 0.05,
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.14 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.11 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.08 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.04 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.01 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制 + 朴树干高域 0.35–0.45 上端）：清干高枝个体——挂高段
 * 提向域上缘 0.45（两样木高值端 [8][9] + Spec §1 城市公园语境「干更高」读向）。组合：
 * 挂高段上移（attachMin 0.64 + span 0.12——上举姿态（upturn ×1.25）冠链抬升强（涌现
 * ≈1.5m），挂点不必贴干顶）+ 冠心升（0.72）+ crownTopBias 正（0.16 顶密）+ 领导枝强
 * （0.56——密冠中央干延伸端 [6]）+ 横展角收（38–52° 上举）+ 姿态上举（levels upturn
 * ×1.25）+ 冠高比降（0.64 高挂点纵域收窄）+ 冠幅比微降（0.70）+ asymmetry 降（0.45）。
 * 实测校准：涌现视觉冠底/实高 ≈0.45 域上缘；同 seed 下与低冠槽视觉冠底差 ≈1.3m
 * （探针记录）。
 */
const CELTIS_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...CELTIS_SLOT0_PROFILE,
  crownWidthRatio: 0.7,
  crownCenterRatio: 0.72,
  crownHeightRatio: 0.64,
  asymmetry: 0.45,
  crownTopBias: 0.16,
  scaffoldAngleMin: 38,
  scaffoldAngleMax: 52,
  scaffoldAttachMin: 0.64,
  scaffoldAttachSpan: 0.12,
  scaffoldRankLength: [1.08, 1.0, 0.95, 0.9, 0.86, 0.83],
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.9, 0.88, 0.86],
  leaderLengthRatio: 0.56,
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.35 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.28 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.2 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.1 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.03 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透稀疏——canopy-a 型中密+可见空隙个体（Spec
 * crown_transparency「个体差异显著、空隙感是形态向量必要维度」Inferred [6]；开张个体
 * 无单一领导枝同端 [6]）。组合：canopyDensity 0.68 + crownShellStart ↑（0.62 满密壳带
 * 更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓（0.03 冠心更空）+ 空腔半径域 ↑
 * （0.60–1.05 大空隙）+ clusterMinSeparation ↑（0.70 簇间抑制更狠）+ clusterShellBias ↓
 * （0.56 簇内也散）+ 领导枝弱（0.46）。实测校准：同 seed 疏松/丰满卡数比 ≈0.5（探针
 * 记录）。
 */
const CELTIS_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...CELTIS_SLOT0_PROFILE,
  canopyDensity: 0.68,
  crownShellStart: 0.62,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.03,
  voidRadiusMin: 0.6,
  voidRadiusMax: 1.05,
  clusterMinSeparation: 0.7,
  clusterShellBias: 0.56,
  leaderLengthRatio: 0.46,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：浓密团穹——canopy-b 型密闭密冠个体（Spec §6 冠密度
 * 个体差异 Inferred [6]；成都夏绿密冠单源直接证据）。组合：canopyDensity 0.93（整体
 * 密度基准微降——预算校准：1.0 时 High 总面探针实测 41.9K 越 40000 上限、Mid 10.5K 越
 * 10000，0.93 收敛带内且密冠读向保持）+ crownShellStart ↓（0.44 满密壳带更厚）+
 * crownCoreStart ↑（0.18）+ coreDensityFloor ↑（0.16 团冠感）+ 空腔半径域 ↓（0.42–0.74）+
 * clusterMinSeparation ↓（0.50）+ clusterShellBias ↑（0.66 簇壳更实）+ 冠幅/冠高比微升
 * （0.76 / 0.74 团穹体量）+ 领导枝微强（0.52 密冠中央干 [6]）。
 * 实测校准：High 总面 ≈39.0K 贴 40000 上限内（探针记录；coreDensityFloor 0.20 试算
 * 越带弃用）。
 */
const CELTIS_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...CELTIS_SLOT0_PROFILE,
  crownWidthRatio: 0.76,
  crownHeightRatio: 0.74,
  canopyDensity: 0.93,
  crownShellStart: 0.44,
  crownCoreStart: 0.18,
  coreDensityFloor: 0.16,
  voidRadiusMin: 0.42,
  voidRadiusMax: 0.74,
  clusterMinSeparation: 0.5,
  clusterShellBias: 0.66,
  leaderLengthRatio: 0.52,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合）。slot-1…7 以
 * slot-0 锚点为底的差量展开定义——**结构计数类字段（trunk/levels radial/segs、
 * childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/长宽比域由展开
 * 继承逐位恒等**（皮面数恒等 24178 与 rng 消费次数恒等的结构性保证）；barkRelief 槽间
 * 恒等（spread 继承）。morphSeed 路由见 assets/asset_tree_celtis.asset。
 */
export const CELTIS_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  CELTIS_SLOT0_PROFILE,
  CELTIS_SLOT1_PROFILE,
  CELTIS_SLOT2_PROFILE,
  CELTIS_SLOT3_PROFILE,
  CELTIS_SLOT4_PROFILE,
  CELTIS_SLOT5_PROFILE,
  CELTIS_SLOT6_PROFILE,
  CELTIS_SLOT7_PROFILE,
];
