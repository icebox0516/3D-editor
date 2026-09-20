/**
 * runtime/procedural/tree/camphor/camphorShapeProfile —— 香樟 shapeProfile 数值面
 * （T011.2，阔叶家族契约第三实例——方法复制自夏栎第一实例经朴树（T011.1）二次验证的
 * 通路：../celtis/celtisShapeProfile 同构）。
 *
 * 职责：香樟（Cinnamomum camphora，樟科樟属常绿大乔木）枝干/冠层结构的形态参数
 *      **数值面**——类型契约 = 阔叶家族 ../broadleaf/broadleafShapeProfile
 *      （BroadleafShapeProfile，零修改实例化；字段语义、【阔叶共性候选】标注、T009.3
 *      消费语义与槽间恒等纪律见家族文件）。**夏栎/朴树的数值是证据不是家族真理**，
 *      本文件全部数值依据 docs/research/camphor-reference.md（Spec Version 1.0，
 *      含主代理终审记档——比例类数值经第二视觉系统交叉确认）香樟自己的现实事实重定；
 *      下方逐字段标注【家族共性候选】沿用 /【香樟特有】新证据 / 工程设定（无现实基准
 *      不编造依据）。方法恒同纪律（T011.2 任务书）：五级拓扑 L1–L5、叶簇挂末两级
 *      L4/L5、结构计数类跨槽恒等、rng 无条件消费、LOD 三档同流派生整体复制，
 *      香樟只换数值与算法细节（差异点清单见 camphorGeometry 模块头，逐条 Spec 引用）。
 * 边界：香樟资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_camphor.asset）；比率字段以
 *      totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 * 不建模记档（Spec 有事实、工程不表达）：樟脑气味（全株气味语义——几何/材质均无通道，
 *      Spec §1 Verified [1][2]）；果实 6–8mm 紫黑杯托（Verified [1][2][5][6]——面数尺度
 *      不可辨）；春季换叶黄绿斑驳与新叶古铜色（季相信号，Verified [5][6]——归材质/风格
 *      层，本资产交付常绿浓绿基调）；叶柄 2–3cm 长柄（Verified [1][2][6]——叶卡抽象不建
 *      柄，朴树先例；长柄辨识归材质侧近景叶形）；离基三出脉与脉腋腺窝（Verified
 *      [1][2][3][4][6]——近景叶背细节，归 camphorMaterials 的 SDF 叶形，不在几何面）；
 *      苔藓沟底附生（Verified [6]——归树皮材质配方）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：中龄公园个体 ≈8m 量级、**广卵形满密常绿冠**（中下部
 * 宽、向上渐收、顶部圆钝——Spec §3 树形语言 Verified [1][2][5][6] + 主代理终审照片双样木
 * 一致）、干更矮冠更下压（干高占比 ≈0.30–0.35 vs 朴树 0.35–0.45——Spec 域扩展节 A，
 * 主代理终审由 Inferred 升格双系统一致 [6]）。T009.3 教训沿用：视觉冠底由挂高段
 * （scaffoldAttachMin/Span）+ 横展角 + upturn + 领导枝链涌现，不由 crownCenterRatio——
 * 校准以实测 stats 的叶卡最低 Y（视觉冠底）为准回推挂高段参数。结构计数类
 * （trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）
 * 全槽恒等；叶卡尺寸/长宽比域槽间不动（叶身份）。
 */
export const CAMPHOR_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节 B：冠幅/树高比 ≈0.7–0.85（整树双样木 0.85 / 0.7–0.8，主代理终审
   *  第二视觉系统交叉一致——档位 Inferred [6]）。参数 → 涌现映射沿家族口径（朴树参数
   *  0.74 → bbox 涌现 ≈0.77）；**香樟开张横展角 + 外层上收 upturn 链的宽度外泄系数高于
   *  朴树上举链（探针实测参数 0.75 → bbox 涌现 ≈0.99 越对标域）**，参数 0.62 → 涌现
   *  bbox 冠幅/实高 ≈0.78、绝对冠幅 ≈6.5–6.9m 落 8m 个体对标域 5.5–7m（Spec §2
   *  Inferred [5][6]）——涌现值（非参数）对标照片域。【冠幅比类 = 家族共性候选沿用；
   *  锚值 = 香樟特有（域 0.7–0.85 与朴树 0.8–0.9 相近略收束——Spec §3 原文；参数对
   *  开张链外泄的补偿见 levels.upturn）】 */
  crownWidthRatio: 0.62,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；间接锚广卵形读向——冠体
   *  中心下移使密度场最宽带落在冠中下部，向上渐收由骨架侧低挂高段 + 开张角承载）。 */
  crownCenterRatio: 0.62,
  /** 工程设定（同上；广卵冠冠体纵域参考系——顶部圆钝渐收的密度场高度向配合
   *  crownTopBias 正偏置）。 */
  crownHeightRatio: 0.72,
  /** Spec 域扩展节 A branch_orientation：无明显轮生证据、倾向螺旋/互生散布（Unknown 弱
   *  Inferred [1][2][6]——叶互生 Verified 为唯一可判口径）。slot-0 = 0.5（家族共性沿用
   *  等效幅度）。 */
  asymmetry: 0.5,
  /** Spec §3 / 域扩展节 B crown_top 方向：广卵形顶部**圆钝渐收**、中龄样木未见强单领导
   *  枝延伸（apical_dominance 中庸偏强 Inferred [1][6]）——顶密读向起步（顶部叶量保留
   *  使冠顶圆钝闭合），偏置归槽。【香樟特有定档依据 = Spec 广卵形顶钝 + apical_dominance
   *  Inferred；幅度工程设定】 */
  crownTopBias: 0.1,

  // 骨架
  /** Spec 域扩展节 A：scaffold_branch_count ≈5–7（双样木 5–7 / 5–6，主代理终审交叉一致
   *  Inferred [6]）。slot-0 = 5（另含 1 领导枝不计入）——域下段取值与朴树 6 分化：香樟
   *  大枝**开张横展**（Spec scaffold_angle 45–70° 开张 [6]）的少量粗枝 + 满密叶团读向
 *      （vs 朴树 6 枝上举密冠）。【结构计数类：槽间恒等；取 5 = 香樟特有（域内取值 +
   *  拓扑分化动机）】 */
  scaffoldCount: 5,
  /** Spec 域扩展节 A：scaffold_angle ≈45–70° 对铅垂开张横展（双样木 50–70° / 45–65°，
   *  主代理终审交叉一致 Inferred [6]；OSU「rounded then wide spreading」随龄开张 [5]）。
   *  slot-0 = 46–68°（域内近全幅；上限比朴树 46–64° 更开张——横展平展端读向）。
   *  【香樟特有（新证据域比朴树整体开张）】 */
  scaffoldAngleMin: 46,
  scaffoldAngleMax: 68,
  /** 干高占比 ≈0.30–0.35 的挂高段实现（Spec 域扩展节 A trunk_height_ratio 主代理终审
   *  双系统一致 [6]；T009.3：挂高段下缘即视觉冠底的主驱动——但视觉冠底 ≠ 挂点 Y：
   *  香樟开张横展（46–68°）+ 逐级 upturn + 领导枝链把冠在挂点之上再抬（抬升弱于朴树
   *  上举链），调参以实测冠底回推）。slot-0 = 0.56 起跨 0.18（挂点 0.56–0.74 干高段）+
   *  干高参数域 0.38–0.43（geometry 硬编码 rng 域，低于朴树 0.44–0.50——香樟干更矮）→
   *  涌现视觉冠底/实高 ≈0.30–0.34（8 槽带 0.24–0.36 覆盖 Spec 域 0.30–0.35 并两端微
   *  外推——夏栎/朴树同型先例）。实测校准：slot-0 规范种子探针记录见 camphorGeometry
   *  模块头。【香樟特有（干高域下移 + 开张冠链弱抬升的回推结果）】 */
  scaffoldAttachMin: 0.58,
  scaffoldAttachSpan: 0.18,
  /** 工程设定（branch_radius_decay Unknown、胸径典型值 Unknown（Spec §2 极值 3m 不用）；
   *  香樟中龄 8m 量级取略粗于朴树的挂点比例——樟为速生树种 [5]、干基轻膨大（定性
   *  Inferred [6]）的观感，待视觉验收校）。 */
  scaffoldThickness: 0.58,
  /** rank 长度乘子（5 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用，
   *  5 枝下势差幅度贴朴树标准槽量级）。 */
  scaffoldRankLength: [1.14, 1.04, 0.96, 0.9, 0.84],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.02, 0.96, 0.92, 0.88, 0.86],
  /** Spec 域扩展节 A apical_dominance：**中庸偏强**（广卵形冠顶部圆钝渐收、中龄样木未见
   *  强单领导枝延伸 Inferred [1][6]；化学型「枝桠直上 vs 敞开」轴存在个体幅度 [1]）。
   *  定档 0.52 基准（朴树 0.50 中庸、夏栎 0.48——香樟取略偏强：顶钝渐收需要适度领导链
   *  闭合冠顶，槽间 0.46–0.58 展开个体差异幅度）。【香樟特有定档依据 = Spec
   *  apical_dominance Inferred [1][6]；幅度工程设定】 */
  leaderLengthRatio: 0.52,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；5 骨架下每枝更粗的起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；二级枝对一级枝 ≈40–60°（Spec 域扩展节 A
   *  Inferred [6]）由侧枝方向混合常量表达——方法恒同，长度比沿用家族量级）。 */
  lengthRatioBase: 0.4,
  lengthRatioSpan: 0.15,
  /** L1 0.68 通体锥度（骨架枝粗壮方向性表达）。工程设定（Spec 无香樟锥度数值，
   *  branch_curvature Unknown——常绿全年带叶未获裸枝照）。 */
  endRatio: [0.68, 0.62, 0.62, 0.62, 0.62],

  // 冠内通透（常绿满密基调——与朴树个体差异显著型分化）
  /** Spec 域扩展节 B crown_transparency：**高密基调**——逆光空隙 ≈10–15%（早春仰视）至
   *  ≈10%（秋末）、满密读向四样木四季一致（Verified 读向 [5][6]；等级 Inferred）；
   *  §6 密度个体差异弱于朴树组（未见显著空冠个体）。slot-0 = 1.0 基准（满密端起步——
   *  高于朴树 1.0 起步的**通透参数全面收束**见下；疏密差异幅度归槽 6/7 且比朴树收窄）。
   *  【canopyDensity 类 = 家族共性候选；基调读向 = 香樟特有（常绿满密 Verified [5][6]）】 */
  canopyDensity: 1.0,
  /** Spec 域扩展节 B crown_fill_gradient：外密内疏（Verified [6] 四样木互证）。家族沿用；
   *  香樟满密壳带更厚（0.48 vs 朴树 0.55——空隙 10–15% 的收束读向）。【连续形态参数；
   *  值 = 香樟特有】 */
  crownShellStart: 0.48,
  /** 芯层起点与地板值：Spec §3 内膛枝现象——**存在但幅度小**（冠内少量无叶细枝/空枝，
   *  三源一致 Inferred [6]；整体外密内疏满密、不呈显著杯状空膛）→ 芯层地板 0.08 高于
   *  朴树 0.05（内膛不空透）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.08,
  /** 规则①（枝干通道：主干大枝进冠不被封死——满密冠型尤其需要）；数值工程设定
   *  （干径略粗于朴树，通道带同幅微放）。 */
  channelRadius: 0.42,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：满密基调下的冠内小空隙——空隙 10–15% 的读向由小半径空腔承载）。
   *  【结构计数类：槽间恒等】数量工程设定（与朴树同为 3——空腔尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域收窄（0.42–0.72 vs 朴树 0.50–0.90——逆光空隙 10–15% 的小空隙读向，
   *  Spec 域扩展节 B Inferred [5][6]）。值 = 香樟特有；半径域机制 = 家族共性候选。 */
  voidRadiusMin: 0.42,
  voidRadiusMax: 0.72,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；簇位数/每簇叶量为香樟自己的
  // 结构计数口径，与夏栎/朴树数值不同不破纪律——恒等约束只在**本资产槽间**）
  /** Spec 域扩展节 B leaf_attachment_rule：叶互生一年生枝（Verified [1][2][5]）、集中
   *  末级枝外段受光区、内膛枝叶少（Inferred [6]）。簇位数 L5=2 + L4=1（家族沿用
   *  夏栎拓扑映射）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用）。 */
  clusterInnerStartL5: 0.5,
  clusterInnerStartL4: 0.45,
  /** 工程设定（clump_scale 冠壳叶团 ≈1/8–1/10 冠径 Inferred [6]——可见叶团为多簇聚合
   *  尺度，非单簇半径直译；香樟真叶典型 7–10 × 3–4.5cm 与朴树 6–8 × 4–5cm 相近、
   *  常绿叶量满密，簇半径取 0.11–0.15 微放于朴树 0.10–0.14）。L4 簇 ×1.25 承接更粗
   *  末级枝——家族沿用。【簇半径比类 = 家族共性候选；绝对量级 = 香樟特有】 */
  clusterRadiusMinL5: 0.11,
  clusterRadiusSpanL5: 0.04,
  clusterRadiusScaleL4: 1.25,
  /** 工程设定（家族沿用）。 */
  clusterRadiusLengthCap: 0.6,
  /** 工程设定（leaf_cluster_density Unknown（定性末级枝叶量中-高密 Inferred [6]）——
   *  满密读向取 0.50 抑制略松于朴树 0.55，离散挂簇间隙保险仍成立）。 */
  clusterMinSeparation: 0.5,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 18（香樟口径：5 骨架 + 领导拓扑下簇位 810（L4 162×1 + L5 324×2）、
   *  皮面 20782 的 High 预算校准——常绿满密 + 末级枝叶量中-高密（Inferred [6]）读向；
   *  探针实测 8 槽 High 带 ≈32.4–38.6K 落 ≤40000 带（实测记录见 camphorGeometry
   *  模块头与资产入口预算锁定账目）。【每簇叶量类 = 家族共性候选；绝对值 = 香樟特有
   *  （预算校准 + 满密观感）】 */
  clusterLeavesL5: 18,
  clusterLeavesL4: 18,
  /** 工程设定（外密内疏的簇内同构映射，家族沿用；满密端 0.66 微实于朴树 0.62）。 */
  clusterShellBias: 0.66,
  clusterShellGamma: 0.8,
  /** Spec 域扩展节 B leaf_size：真叶 6–12 × 2.5–5.5cm（FRPS/FOC 双源逐字一致 Verified
   *  [1][2]）、典型 7–10 × 3–4.5cm（照片交叉 [5][6]）——单卡 ≈ 真叶 2× 的工程映射
   *  （夏栎/朴树先例口径）→ 卡宽 0.06–0.095m（真叶宽 3–4.5cm 端，微窄于朴树——
   *  长宽比更狭长）。【卡尺寸域类 = 家族共性候选；绝对量级 = 香樟特有】 */
  leafWidthMin: 0.06,
  leafWidthSpan: 0.035,
  /** Spec 域扩展节 B leaf_aspect_ratio ≈1.8–2.4（文献域推 + 照片判读 ≈1.8–2.4 +
   *  FRPS 叶形多变注记，Inferred [1][2][6]）——直接采用；比朴树 1.3–2.0 明显狭长的
   *  卵状椭圆语言（香樟与朴树的叶身份分化；夏栎 1.6–2.7 居中偏长）。 */
  leafAspectMin: 1.8,
  leafAspectSpan: 0.6,

  // 树皮近景微起伏（香樟特有分化：**纵裂深沟语言**——Spec §5 / 域扩展节 C
  //  bark_archetype：黄褐/灰褐色不规则纵裂、脊宽沟深、局部横向纹连接成块状感，
  //  Verified [1][2][6] + 主代理终审第二视觉系统交叉一致；中龄即充分纵裂（Inferred
  //  [6]）——与朴树平滑-浅裂小斑块、夏栎纵脊三分化）
  /** 中-强浮雕锚定 0.036（Spec 域扩展节 C bark_relief 中-强 Verified [6]；高于朴树
   *  0.016 低浮雕、量级强于夏栎 0.033——沟深脊宽读向）。主干基环半径 ≈0.29–0.36m →
   *  峰幅度 ≈10–13mm、同环极差 ≈15–25mm——近景深沟可辨，与朴树 ≈4–5mm 浅斑明确
   *  分化；中景不可辨由近景观感标定。【幅度 ∝ 半径量级挂钩 = 家族共性候选沿用；
   *  绝对值 = 香樟特有】槽间恒等（barkRelief 非形态差异维度——slot-0 定义、其余槽
   *  spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.036,
    /** 纵裂脊宽谐波：k∈{3,4,6}——k3/k4 主脊（周向脊宽 ≈主干周长/4 ≈0.45–0.55m 的
     *  宽脊尺度，Spec「脊宽沟深」[6]）+ k6 细纹（块状边缘的次级沟壑质感；≤ 主干
     *  radial 14 的奈奎斯特域 7 留 1 档边际——家族同款边际纪律）。【谐波语言 =
     *  香樟特有（vs 夏栎 [3,4,5] 纵脊、朴树 [4,5,6] 短斑）】 */
    harmonics: [3, 4, 6],
    /** 轴向游走基率 3.2 rad/m（夏栎 0.85 纵脊缓游走 / 朴树 16 短斑快断裂之间）：
     *  轴向去相关长度 ≈2π/3.2 ≈ 2.0m——纵脊轴向连续性保持（数米段脊线可追）+ 呼吸
     *  调制与游走使局部横断、连接成**块状感**（Spec「局部横向纹连接成块状感」Verified
     *  [1][2][6] 的方向性工程映射；脊连续强于朴树、断块多于夏栎——三分化中间偏脊端）。
     *  【游走机制 = 家族共性候选；速率值 = 香樟特有（纵脊连续 + 局部断块）】 */
    drift: 3.2,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown，干基轻膨大定性 Inferred [6]）。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.06 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 ≥3–4 级（Spec 域扩展节 A
   *  branching_levels Inferred [6]）的家族五级方法沿用，级数槽间不动。姿态分级工程
   *  设定（branch_curvature Unknown——常绿未获裸枝照；方向贴广卵形读向：L1 级沿家族
   *  量级、**外三级 upturn 高于朴树**（0.20/0.12/0.05 vs 朴树 0.16/0.08/0.02——开张
   *  横展大枝的末段上收，冠缘向上收口成广卵形「向上渐收、顶部圆钝」的侧影；同时抑制
   *  开张角下的冠幅外泄——探针校准依据）、末级 0.05 近水平摊出（冠缘圆钝）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.28 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.25 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.2 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.12 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.05 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑——L3→L4 三挂点承载香樟 5 骨架下的簇位量 810）。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3 语法复制）：密林端窄高读向——冠幅收窄、冠体上扬（樟化学型
 * 「枝桠直上」轴 Spec §6 Verified [1] 的个体幅度端；方向工程设定）。组合：冠幅比降
 * （0.56）+ 冠高比升（0.78）+ 横展角收窄上举（36–50°）+ 挂高段上移（0.68–0.82 干高段，
 * span 0.14——密林干净主干）+ 领导枝强（0.58——直上端 [1]）+ rank 势差收小（窄冠
 * 均齐）+ asymmetry 降（0.40）+ 姿态更刚直（trunk/levels wander ×0.8，分级单调性不破）。
 */
const CAMPHOR_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...CAMPHOR_SLOT0_PROFILE,
  crownWidthRatio: 0.56,
  crownCenterRatio: 0.66,
  crownHeightRatio: 0.78,
  asymmetry: 0.4,
  crownTopBias: 0.16,
  scaffoldAngleMin: 36,
  scaffoldAngleMax: 50,
  scaffoldAttachMin: 0.68,
  scaffoldAttachSpan: 0.14,
  scaffoldRankLength: [1.08, 1.0, 0.95, 0.91, 0.87],
  scaffoldRankRadius: [1.0, 0.97, 0.94, 0.91, 0.89],
  leaderLengthRatio: 0.58,
  trunk: { radial: 14, segs: 14, wander: 0.04, upturn: 0.06 },
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.32 },
    { radial: 7, segs: 8, wander: 0.11, upturn: 0.28 },
    { radial: 6, segs: 5, wander: 0.16, upturn: 0.23 },
    { radial: 5, segs: 4, wander: 0.22, upturn: 0.14 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.06 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：老树/开阔端宽展——冠幅比增大、领导枝弱化、冠顶
 * 多主枝分摊（OSU「rounded shape, then wide spreading」随龄开张 Verified [5]；冠幅/树高
 * 比域 0.7–0.85 的宽端 Inferred [6]）。组合：冠幅比 0.72（涌现 bbox 冠幅/实高 ≈0.83
 * ——照片域 0.7–0.85 的宽端，记档）+ 冠高比降（0.66 广卵扁端）+ 冠心降（0.58——
 * 冠最宽带下压）+ 横展角大（58–72° 大枝平展——Spec 域 45–70° 的开张端外推 2°，夏栎/
 * 朴树宽展槽同型先例）+ 挂高段下移（0.50 起 span 0.24——干高占比域下段）+ 外层
 * upturn 微收（冠缘摊平的宽展读向）+ 领导枝弱（0.46）+ 首枝 rank 主导强（×1.26）+
 * asymmetry 升（0.60）+ crownTopBias 负（-0.06 顶均）。
 */
const CAMPHOR_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...CAMPHOR_SLOT0_PROFILE,
  crownWidthRatio: 0.72,
  crownCenterRatio: 0.58,
  crownHeightRatio: 0.66,
  asymmetry: 0.6,
  crownTopBias: -0.06,
  scaffoldAngleMin: 58,
  scaffoldAngleMax: 72,
  scaffoldAttachMin: 0.5,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.26, 1.04, 0.94, 0.86, 0.8],
  scaffoldRankRadius: [1.06, 0.95, 0.89, 0.85, 0.81],
  leaderLengthRatio: 0.46,
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.26 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.23 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.18 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.11 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.04 },
  ],
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：骨架枝
 * 螺旋散布无轮生（Unknown 弱 Inferred [1][2][6]）、冠形个体开张度幅度（§6）——方向
 * 采信；幅度工程设定）。组合：asymmetry 微降（0.58——高 asymmetry 的方位大抖动在 5 骨架
 * 下相干偏侧信号被稀释（朴树 6 骨架同款探针教训）；偏侧相干性由 rank 主导承载）+
 * scaffoldRankLength 首枝 ×1.66 / 弱势 ×0.66（一侧枝展压倒性——首枝质量占比 34%
 * （1.66/4.9），配 4 弱枝近均分 → 质心稳定指向首枝方位）+ scaffoldRankRadius 同向
 * （×1.15）+ 冠幅比升（0.72 容纳域）+ 横展角域微扩（48–70°）+ 挂高段微上移（0.58 起
 * span 0.18）。其余维度贴标准（偏冠 = 方位维差异）。实测校准：6 种子面板质心均值比对
 * 标准槽 ≈×2.6（面板口径见 camphorShapeSlots 测试——相位 rng 运气单种子波动大，面板
 * 均值是稳健口径，朴树先例）。
 */
const CAMPHOR_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...CAMPHOR_SLOT0_PROFILE,
  crownWidthRatio: 0.72,
  crownCenterRatio: 0.63,
  asymmetry: 0.58,
  scaffoldAngleMin: 48,
  scaffoldAngleMax: 70,
  scaffoldAttachMin: 0.58,
  scaffoldAttachSpan: 0.18,
  scaffoldRankLength: [1.66, 1.02, 0.86, 0.74, 0.66],
  scaffoldRankRadius: [1.15, 0.95, 0.88, 0.82, 0.78],
  leaderLengthRatio: 0.5,
};

/**
 * slot-4 低冠组合（009.3 语法复制 + 香樟干高域 0.30–0.35 下端）：低分枝点个体——挂高段
 * 压向 Spec trunk_height_ratio 域下缘 0.30（双样木 0.35/0.30 的低值端 [6]，主代理终审
 * form-b 0.30 交叉）。组合：挂高段下移（attachMin 0.38 + span 0.24——开张平展姿态下
 * 冠链抬升弱（upturn ×0.5），挂点比标准槽更低回推）+ 冠心降（0.56）+ crownTopBias 负
 * （-0.12 底密）+ 横展角大（60–74° 近水平低垂平展）+ 姿态下压（levels upturn ×0.5——
 * 末梢上举弱化；分级单调性保持）+ 簇半径微升（0.12–0.17 低垂大簇）+ 领导枝弱（0.48）+
 * 冠幅比微收（0.64——低垂平展角下宽度外泄大，参数补偿）。
 * 实测校准：涌现视觉冠底/实高 ≈0.24–0.26（域下缘 0.30 的变体外推——夏栎/朴树 slot-4
 * 同型先例）。
 */
const CAMPHOR_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...CAMPHOR_SLOT0_PROFILE,
  crownWidthRatio: 0.64,
  crownCenterRatio: 0.56,
  crownHeightRatio: 0.74,
  asymmetry: 0.55,
  crownTopBias: -0.12,
  scaffoldAngleMin: 60,
  scaffoldAngleMax: 74,
  scaffoldAttachMin: 0.38,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.18, 1.02, 0.94, 0.87, 0.82],
  scaffoldRankRadius: [1.02, 0.95, 0.9, 0.87, 0.84],
  leaderLengthRatio: 0.48,
  clusterRadiusMinL5: 0.12,
  clusterRadiusSpanL5: 0.05,
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.14 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.13 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.1 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.06 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.02 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制 + 香樟干高域 0.30–0.35 上端）：清干高枝个体——挂高段
 * 提向域上缘 0.35（双样木高值端 [6]，主代理终审 form-a 0.35 交叉）。组合：挂高段上移
 * （attachMin 0.68 + span 0.12——上举姿态（upturn ×1.25）冠链抬升强，挂点不必贴干顶）+
 * 冠心升（0.68）+ crownTopBias 正（0.18 顶密——圆钝顶读向加强）+ 领导枝强（0.58——
 * 化学型直上端 [1]）+ 横展角收（40–54° 上举）+ 姿态上举（levels upturn ×1.25）+ 冠高比
 * 降（0.64 高挂点纵域收窄）+ 冠幅比微降（0.60）+ asymmetry 降（0.45）。实测校准：涌现
 * 视觉冠底/实高 ≈0.36–0.38 域上缘外推。
 */
const CAMPHOR_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...CAMPHOR_SLOT0_PROFILE,
  crownWidthRatio: 0.6,
  crownCenterRatio: 0.68,
  crownHeightRatio: 0.64,
  asymmetry: 0.45,
  crownTopBias: 0.18,
  scaffoldAngleMin: 40,
  scaffoldAngleMax: 54,
  scaffoldAttachMin: 0.68,
  scaffoldAttachSpan: 0.12,
  scaffoldRankLength: [1.1, 1.0, 0.95, 0.9, 0.86],
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.9, 0.88],
  leaderLengthRatio: 0.58,
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.35 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.31 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.25 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.15 },
    { radial: 4, segs: 3, wander: 0.34, upturn: 0.06 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：换叶期通透上升端——canopyDensity 0.79（**比朴树
 * 疏松槽 0.68 收窄**：Spec §6 密度个体差异弱于朴树组、未见显著空冠个体 Inferred [5][6]；
 * 换叶期短暂通透上升 Verified [5] 是本槽现实锚——最疏档仍保持常绿满密基调的幅度下限；
 * 0.76 初值探针实测 High 总面 28772 距家族行下沿 28754 仅 18 面——无 rng 余量，回调
 * 0.79 留带内余量）。组合：crownShellStart ↑（0.56）+ crownCoreStart ↓（0.10）+
 * coreDensityFloor ↓（0.04——内膛空枝读向的疏端）+ 空腔半径域 ↑（0.50–0.88）+
 * clusterMinSeparation ↑（0.60）+ clusterShellBias ↓（0.60）+ 领导枝弱（0.48）。
 */
const CAMPHOR_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...CAMPHOR_SLOT0_PROFILE,
  canopyDensity: 0.79,
  crownShellStart: 0.56,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.04,
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.88,
  clusterMinSeparation: 0.6,
  clusterShellBias: 0.6,
  leaderLengthRatio: 0.48,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密闭浓绿团冠——冬季-早春满密浓绿四样木基调（Spec
 * §3 Verified [6]：1 月浓密深绿背景落叶树对照、3 月逆光空隙仅 10–15%）。组合：
 * canopyDensity 0.94（**高于朴树丰满槽 0.93 的满密端起点**——预算校准：1.0 时 High 总面
 * 探针实测越 40000 上限（簇位 810 × 18 卡满存活读向），0.94 收敛带内且浓密读向保持）+
 * crownShellStart ↓（0.42 满密壳带更厚）+ crownCoreStart ↑（0.18）+ coreDensityFloor ↑
 * （0.12 团冠感）+ 空腔半径域 ↓（0.34–0.60）+ clusterMinSeparation ↓（0.44）+
 * clusterShellBias ↑（0.70 簇壳更实）+ 冠幅/冠高比微升（0.70 / 0.76 团冠体量）+ 领导枝
 * 微强（0.54——密冠中央干读向 [1][6]）。实测校准：High 总面贴带内上部（探针记录见
 * 资产入口预算锁定账目）。
 */
const CAMPHOR_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...CAMPHOR_SLOT0_PROFILE,
  crownWidthRatio: 0.7,
  crownHeightRatio: 0.76,
  canopyDensity: 0.94,
  crownShellStart: 0.42,
  crownCoreStart: 0.18,
  coreDensityFloor: 0.12,
  voidRadiusMin: 0.34,
  voidRadiusMax: 0.6,
  clusterMinSeparation: 0.44,
  clusterShellBias: 0.7,
  leaderLengthRatio: 0.54,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合）。slot-1…7 以
 * slot-0 锚点为底的差量展开定义——**结构计数类字段（trunk/levels radial/segs、
 * childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/长宽比域由展开
 * 继承逐位恒等**（皮面数恒等 20782 与 rng 消费次数恒等的结构性保证）；barkRelief 槽间
 * 恒等（spread 继承）。morphSeed 路由见 assets/asset_tree_camphor.asset。
 */
export const CAMPHOR_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  CAMPHOR_SLOT0_PROFILE,
  CAMPHOR_SLOT1_PROFILE,
  CAMPHOR_SLOT2_PROFILE,
  CAMPHOR_SLOT3_PROFILE,
  CAMPHOR_SLOT4_PROFILE,
  CAMPHOR_SLOT5_PROFILE,
  CAMPHOR_SLOT6_PROFILE,
  CAMPHOR_SLOT7_PROFILE,
];
