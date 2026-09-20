/**
 * runtime/procedural/tree/zelkova/zelkovaShapeProfile —— 榉树 shapeProfile 数值面
 * （T011.3 Step 1 + Step 2，阔叶家族契约第四实例——方法复制自夏栎第一实例经朴树
 * （T011.1）/香樟（T011.2）三次验证的通路：../camphor/camphorShapeProfile 同构）。
 *
 * 职责：榉树（光叶榉 Zelkova serrata (Thunb.) Makino，榆科榉属落叶乔木；与大叶榉
 *      Z. schneideriana「极其近似」（FRPS 明文 [1][2]），生产关键面两形一致——本资产
 *      按 **Spec 合并口径** 记录，锚定种 Z. serrata，近景辨析轴见 Spec §6）枝干/冠层
 *      结构的形态参数**数值面**——类型契约 = 阔叶家族 ../broadleaf/broadleafShapeProfile
 *      （BroadleafShapeProfile，零修改第四实例化；字段语义、【阔叶共性候选】标注、T009.3
 *      消费语义与槽间恒等纪律见家族文件）。**夏栎/朴树/香樟的数值是证据不是家族真理**，
 *      本文件全部数值依据 docs/research/zelkova-reference.md（Spec Version 1.0，含主代理
 *      终审记档——两视觉系统比例类分歧已记档，参数化取中庸域）榉树自己的现实事实重定；
 *      下方逐字段标注【家族共性候选】沿用 /【榉树特有】新证据 / 工程设定（无现实基准
 *      不编造依据）。方法恒同纪律（T011.3 任务书）：五级拓扑 L1–L5、叶簇挂末两级 L4/L5、
 *      结构计数类跨槽恒等、rng 无条件消费、LOD 三档同流派生整体复制，榉树只换数值与
 *      算法细节（几何侧差异点归 zelkovaGeometry Step 3 交付，逐条 Spec 引用见其模块头）。
 * 边界：榉树资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_zelkova.asset，Step 3 交付）；比率字段
 *      以 totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0 × 三先例方法基线对照，三栏落档；改写项逐条映射实现面）──
 *
 * ■ 可继承项（家族方法原样沿用，榉树证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——榉树分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [8]）落在家族五级口径内（夏栎先例同款包含关系）；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown），家族方法沿用；
 *   3. 冠内通透三规则——榉树外密内疏（Spec 域扩展节 B crown_fill_gradient 双样木一致
 *      Inferred [8]）+ 枝干通道（冬季裸枝高通透、层级完全可读 [8]——通道不封死同向）+
 *      局部空腔（逆光空隙 20–35% [8]）；
 *   4. 枝梢驱动叶簇——叶集中末级枝外段受光区（Spec 域扩展节 B leaf_attachment_rule
 *      Inferred [6][7][8]，叶互生二列 Verified [6][7]）同夏栎读向；
 *   5. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   6. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡）；
 *   7. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   8. 尺度锚 ≈8m 中龄公园（Spec §2 公园中龄 ≈8–12m 弱 Inferred [7][8]，任务书锚 ≈8m
 *      在域内——与夏栎/朴树/香樟同量级可混植）。
 *
 * ■ 按榉树改写项（每条映射实现面）：
 *   1. 树形语言：圆穹（朴）/广卵（樟）/宽展圆顶（栎）→ **vase 形冠**（冠基收窄、向上
 *      渐宽、顶部圆穹——Spec §3 Verified [7][8] 三样木一致）→ 实现：横展角 42–60°
 *      （Spec 域扩展节 A scaffold_angle 40–60° Inferred [8]，整体低于三先例——开张由
 *      横展角承担）+ levels.upturn 五级全面高于三先例（上拱与末梢上举由 upturn 承担，
 *      读向与香樟「开张但下压」分化）+ 领导枝弱-中庸 0.46（多枝上拱共构冠顶，Spec
 *      apical_dominance 弱-中庸 Inferred [7][8]）；
 *   2. 干高占比：Spec 域 0.30–0.40 [7][8] × 终审第二视觉系统 0.20–0.25（±0.1 级分歧，
 *      两读并档）→ **取中庸域 0.30–0.36** → 实现：挂高段 scaffoldAttachMin/Span
 *      0.52/0.20 + Step 3 干高参数域建议 0.33–0.38（geometry 硬编码 rng 域，低于夏栎
 *      0.40–0.46）；上拱链抬升强于香樟开张链，涌现视觉冠底预估 ≈0.30–0.34；
 *   3. 冠幅比：Spec 照片域 0.8–0.95（Inferred [8]）× 终审交叉 0.7–0.8 → **取中庸域
 *      0.80–0.90** → 实现：crownWidthRatio 0.82（**Step 3 探针定档 2026-09-20**：初值
 *      0.70 的预估外泄 ×1.18–1.23 被实测否定——强 upturn 梢端内收使实测外泄仅 ×1.03，
 *      涌现 0.724 低于中庸域；回调 0.82 后涌现 ≈0.85 落 0.83–0.86 带；宽端槽（2/4）
 *      外泄大（×1.25/×1.63）反向微收——逐槽实测外泄系数见各槽注释）；
 *   4. 树皮：**第四种树皮语言**——光滑基底 + 不规则薄片状剥落斑驳微起伏（vs 夏栎脊沟/
 *      朴树浅斑/香樟纵裂；四源 Verified [1][2][3][4][7]）→ 实现：barkRelief 幅度低端
 *      0.015 + 谐波 [3,5,6] + drift 11（斑驳**色**归 zelkovaMaterials 材质层，几何只管
 *      轮廓起伏——暖色剥落斑 15–30% 是榉树 vs 三先例最强近景分化）；
 *   5. 叶卡与簇：细质密叶 fine texture（Spec §3 双整树 + 双冠层一致 [8]；§7 中距「细
 *      纹理」冠面是榉树 vs 朴树可读差异）→ 实现：卡宽 0.04–0.06（真叶典型 4–6 ×
 *      2–3cm Verified [1][2][3][4][8] × ≈2 工程映射——小于三先例）+ 簇半径 0.09–0.125
 *      收小 + 每簇 18 卡（簇壳单层覆盖 ≈70% → 簇内空隙 ≈30% 落 Spec 逆光空隙 20–35%
 *      带内的推算依据，详见 clusterLeaves 注释）；
 *   6. 密度语言：中-密（逆光空隙 20–35%，Inferred [8]）——介于香樟满密（10–15%）与
 *      朴树/夏栎个体差异型之间 → 实现：crownShellStart 0.52 + coreDensityFloor 0.06
 *      （内膛裸细枝网「fine, open network——visible but not dense」[8] 的开网读向）+
 *      空腔 0.48–0.82；
 *   7. 骨架数：Spec 域 4–7（form 双样木 5–7/4–6 Inferred [8]）取 5 + 1 领导枝——拓扑
 *      同香樟（簇位 810 / 皮面 20782，为细质密叶的叶卡预算留带内余量）；
 *   8. 8 槽形态向量沿 Spec §6 品种群轴展开（OSU Verified [7]）：Musashino 直立窄冠端
 *      （slot-1）/ Green Vase® 宽 vase 端（slot-2）/ Wireless® 低干开张端（slot-4）/
 *      Village Green 密冠端（slot-7）——保持 vase 同种语言一致（upturn 全面高于先例的
 *      分级结构全槽不动，品种极端比值不直取，记档见各槽注释）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_taper_ratio / basal_flare_ratio（后者定性「不显-轻度」单源 [8]）——干形
 *      锥度与根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. branch_angle 度数（方向上举定性 Inferred [8]）——由家族侧枝方向混合常量承载，
 *      上举读向已由 levels.upturn 表达；
 *   3. branch_orientation（螺旋/互生散布倾向低置信；叶二列互生为唯一可判口径 [6][7]）
 *      ——asymmetry 0.5 家族等效幅度；
 *   4. branch_length_decay / branch_radius_decay / allometry_exponent——家族量级工程
 *      设定；
 *   5. leaf_cluster_density / leaf_orientation_dist（二列叶序暗示沿枝平面排列倾向，
 *      未验）——簇参数工程设定 / 卡姿态家族随机沿用；
 *   6. 公园中龄 ≈8–12m 本身弱 Inferred（[7][8]）——任务书锚 ≈8m 在域内，沿家族混植
 *      语境。
 *
 * 不建模记档（Spec 有事实、工程不表达）：核果 2.5–3.5mm 淡绿斜卵状圆锥形（Verified
 *      [1][2][3][4]——面数尺度不可辨）；秋色叶橙-橙红（Verified [7][8]——季相归材质/
 *      风格层，本资产交付夏绿冠层，任务书「秋色不建模记档」）；花小绿色不显眼、花期
 *      4 月（Verified [1][2][3][4][5][7]——不建模）；叶柄粗短 2–7mm（Verified
 *      [1][2][3][4]——叶卡抽象不建柄，朴树/香樟先例）；叶基稍偏斜 + 全缘尖头单锯齿 +
 *      羽状脉直伸齿尖（Verified [1][2][3][4][5][6][7][8]——近景叶形细节归 zelkovaMaterials
 *      的 SDF 叶形，不在几何面）；冬芽圆锥状卵形（Verified [1][2][3][4]——冬季裸枝语义
 *      不在常绿态观感资产内）；苔藓/地衣少量（Inferred 单源低置信 [8]——归树皮材质配方）；
 *      两榉辨析轴（叶背毛被/冬芽并生/当年生枝色，Verified [1][2][3][4]——近景材质变体
 *      维度记档归材质层，不进几何）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：中龄公园个体 ≈8m 量级、**vase 形冠**（冠基收窄、向上
 * 渐宽、顶部圆穹——Spec §3 Verified [7][8] 文献 + 照片三样木一致）、干高占比中庸域
 * 0.30–0.36（Spec 0.30–0.40 × 终审 0.20–0.25 分歧取中庸，主代理终审记档）、冠幅比中庸
 * 域 0.80–0.90（Spec 0.8–0.95 × 终审 0.7–0.8 分歧取中庸）。T009.3 教训沿用：视觉冠底由
 * 挂高段（scaffoldAttachMin/Span）+ 横展角 + upturn + 领导枝链涌现，不由 crownCenterRatio
 * ——校准以实测 stats 的叶卡最低 Y（视觉冠底）为准回推挂高段参数。结构计数类
 * （trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）
 * 全槽恒等；叶卡尺寸/长宽比域槽间不动（叶身份）。
 */
export const ZELKOVA_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节 B：冠幅/树高比照片域 ≈0.8–0.95（form 双样木 0.85–0.95 / 0.8–0.9，
   *  Inferred [8]）；主代理终审第二视觉系统交叉读 0.7–0.8（±0.1 级分歧，两读并档——
   *  终审记档「参数化取中庸」）→ 生产中庸域 **0.80–0.90**。**Step 3 探针回推定档
   *  （2026-09-20 实测，T009.3 口径——bbox 涌现/参数外泄系数）**：初值 0.70 实测涌现
   *  w/h = 0.724（外泄 ×1.03，远低于香樟开张链 ×1.29——榉树横展角低 42–60° + 全面强
   *  upturn 梢端内收使冠幅涌现收窄，预估 ×1.18–1.23 被实测否定）→ 参数上调 0.82，
   *  复测涌现 w/h ≈0.85 落中庸域与 0.83–0.86 预估带。【冠幅比类 = 家族共性候选沿用；
   *  锚值 = 榉树特有（中庸域 + **实测外泄系数**回推——探针定档记录，非编造）】 */
  crownWidthRatio: 0.82,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；间接锚 vase 读向——冠体
   *  中心中偏上使密度场最宽带落在冠中上部，冠基收窄由骨架侧挂高段 + 上拱链承载）。 */
  crownCenterRatio: 0.64,
  /** 工程设定（同上；vase 冠纵域参考系——挂高段 0.52 起的长大冠体，顶部圆穹由
   *  crownTopBias 正偏置配合）。 */
  crownHeightRatio: 0.76,
  /** Spec 域扩展节 A branch_orientation：无轮生证据、倾向螺旋/互生散布（Unknown 弱
   *  Inferred——叶二列互生 Verified [6][7] 为唯一可判口径）。slot-0 = 0.5（家族共性
   *  沿用等效幅度）。 */
  asymmetry: 0.5,
  /** Spec §3：vase then rounded top（form-b「vase-like then rounded top (classic
   *  zelkova)」Inferred [8]）+ 顶部圆穹读向——顶密轻微正偏置起步（冠顶圆穹闭合的密度场
   *  配合；圆穹几何由骨架上拱链 + 多枝共构承载）。【榉树特有定档依据 = Spec §3 圆穹顶
   *  Inferred [8]；幅度工程设定】 */
  crownTopBias: 0.08,

  // 骨架
  /** Spec §4 / 域扩展节 A：scaffold_branch_count ≈4–7（form-a 5–6/5–7、form-b 4–6，
   *  Inferred [8]）。slot-0 = 5（另含 1 领导枝不计入）——域中值贴下段：vase 形由少量
   *  强拱曲骨架线共构（Green Vase 式拱线读向 [7]），且 5+1 拓扑（簇位 810）为细质密叶
   *  的小卡叶量留预算带内余量（vs 朴树 6+1 簇位 945）。【结构计数类：槽间恒等；取 5 =
   *  榉树特有（域内取值 + vase 骨架线 + 预算动机）】 */
  scaffoldCount: 5,
  /** Spec 域扩展节 A：scaffold_angle ≈40–60° 对铅垂（form 双样木 50–60°/45–60° + 冬季
   *  裸枝 30–60°，Inferred [8]）——**开张后上拱**（出干先外展后上举，vase 结构成因）。
   *  slot-0 = 42–60°（Spec 域近全幅；上限低于香樟 46–68/朴树 46–64——榉树开张角整体
   *  低于三先例：横展角只承担「开张」，「上举」归 upturn 链——与香樟「开张但下压」的
   *  读向分化点）。【榉树特有（新证据域整体低于先例 + 开张/上举分工）】 */
  scaffoldAngleMin: 42,
  scaffoldAngleMax: 60,
  /** 干高占比中庸域 0.30–0.36 的挂高段实现（Spec 域扩展节 A trunk_height_ratio 0.30–0.40
   *  Inferred [7][8] × 终审交叉 0.20–0.25 分歧 → 取中庸，主代理终审记档；T009.3：挂高段
   *  下缘即视觉冠底的主驱动——但视觉冠底 ≠ 挂点 Y：榉树 42–60° 开张 + 全面强 upturn
   *  上拱链把冠在挂点之上再抬 ≈0.12–0.15 实高（上举链抬升强于香樟开张链、贴朴树上举链），
   *  调参以实测冠底回推）。slot-0 = 0.52 起跨 0.20（挂点 0.52–0.72 干高段）+ 干高参数域
   *  建议 0.33–0.38（Step 3 geometry 硬编码 rng 域，低于夏栎 0.40–0.46）→ 涌现视觉冠底/
   *  实高预估 ≈0.30–0.34（8 槽带预估 0.26–0.38 覆盖中庸域并两端微外推——先例同型）。
   *  **预估待 Step 3 探针回推校准**。【榉树特有（中庸域 + 上拱链强抬升的回推预估）】 */
  scaffoldAttachMin: 0.52,
  scaffoldAttachSpan: 0.2,
  /** 工程设定（branch_radius_decay Unknown、DBH 典型值 Unknown（Spec §2 极值不用）；
   *  榉树中龄 8m 量级取三先例中庸挂点比例——相对慢生 [7]、干通直（form 双样木
   *  「straight」Inferred [8]），待视觉验收校）。 */
  scaffoldThickness: 0.57,
  /** rank 长度乘子（5 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用，
   *  5 枝下势差幅度贴香樟标准槽——vase 拱线相对均齐，势差微收）。 */
  scaffoldRankLength: [1.12, 1.03, 0.96, 0.9, 0.85],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.02, 0.96, 0.92, 0.89, 0.87],
  /** Spec 域扩展节 A apical_dominance：**弱-中庸**（vase 形多领导枝读向：无强单领导枝、
   *  多枝上拱共构冠顶 Inferred [7][8]）。定档 0.46 基准（低于朴树 0.50/香樟 0.52——
   *  冠顶圆穹由多枝上拱链共构、领导枝只需弱-中庸续顶；T009.3 弱领导枝翻转警示：0.46 ≥
   *  夏栎 slot-2 校准下界 0.44，树顶不翻转，槽间 0.42–0.54 展开个体幅度）。【榉树特有
   *  定档依据 = Spec apical_dominance 弱-中庸 Inferred [7][8]；幅度工程设定】 */
  leaderLengthRatio: 0.46,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；5 骨架下每枝更粗的起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级——香樟同拓扑同值）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝方向「上举」定性 Inferred [8] 由
   *  levels.upturn 表达——方法恒同，长度比沿用家族量级）。 */
  lengthRatioBase: 0.4,
  lengthRatioSpan: 0.15,
  /** L1 0.68 通体锥度（骨架枝拱线粗壮方向性表达）。工程设定（Spec 无榉树锥度数值，
  *  branch_curvature 定性「上拱-末梢上翘、非下垂型」Inferred [7][8] 由姿态字段承载）。 */
  endRatio: [0.68, 0.62, 0.62, 0.62, 0.62],

  // 冠内通透（中-密基调——介于香樟满密与朴树/夏栎个体差异型之间）
  /** Spec §3 / 域扩展节 B crown_transparency：**中-密**——逆光空隙 ≈20–35%（canopy-a
   *  20–30% / canopy-b 20–35% 双样木 Inferred [8]）；叶质细密（fine texture 双整树 +
   *  fine branchlets 双冠层一致 [8]）。slot-0 = 1.0 基准（疏密差异归槽 6/7——家族沿用；
   *  空隙量级由簇壳覆盖率 + 空腔域 + 壳层参数承载，见 clusterLeaves 注释推算）。
   *  【canopyDensity 类 = 家族共性候选；基调读向 = 榉树特有（中-密 Inferred [8]）】 */
  canopyDensity: 1.0,
  /** Spec 域扩展节 B crown_fill_gradient：外密内疏（canopy-a/b 双样木一致 Inferred [8]）。
   *  家族沿用；榉树中-密壳带取朴树 0.55 与香樟 0.48 之间。【连续形态参数；值 = 榉树特有】 */
  crownShellStart: 0.52,
  /** 芯层起点与地板值：Spec §3 内膛枝现象——**内膛裸细枝网可见但不成密团**（canopy-b
   *  「inner-crown bare twigs read as a fine, open network——visible but not dense」
   *  Inferred [8]）→ 芯层地板 0.06（高于朴树 0.05 微许、低于香樟 0.08——开网不空透）。
   *  工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.06,
  /** 规则①（枝干通道：主干大枝进冠不被封死——榉树冠内细枝网 + 冬季通透读向 [8] 的
   *  「透」侧承载）；数值工程设定（干径三先例中庸，通道带同幅）。 */
  channelRadius: 0.42,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：中-密 20–35% 空隙读向的冠内空隙表达之一）。【结构计数类：槽间
   *  恒等】数量工程设定（与朴树/香樟同为 3——空腔尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域中档（0.48–0.82：朴树 0.50–0.90 与香樟 0.42–0.72 之间——空隙 20–35%
   *  的中档读向，Spec 域扩展节 B Inferred [8]）。值 = 榉树特有；半径域机制 = 家族共性
   *  候选。 */
  voidRadiusMin: 0.48,
  voidRadiusMax: 0.82,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；簇位数/每簇叶量为榉树自己的
  // 结构计数口径，与夏栎/朴树/香樟数值不同不破纪律——恒等约束只在**本资产槽间**）
  /** Spec 域扩展节 B leaf_attachment_rule：叶互生二列（Verified [6][7]）、集中末级枝
   *  外段受光区、内膛枝叶少（Inferred [8]）。簇位数 L5=2 + L4=1（家族沿用夏栎拓扑
   *  映射）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用）。 */
  clusterInnerStartL5: 0.5,
  clusterInnerStartL4: 0.45,
  /** 工程设定（clump_scale 冠壳叶团 ≈1/8–1/10 冠幅 Inferred [8]——可见叶团为多簇聚合
   *  尺度，非单簇半径直译；榉树真叶典型 4–6 × 2–3cm 小于朴树 6–8cm/香樟 7–10cm，细质
   *  密叶读向取最小簇半径带：0.09–0.125 vs 夏栎 0.11–0.15/朴树 0.10–0.14/香樟
   *  0.11–0.15——细簇 + 小卡 = 细纹理冠面）。L4 簇 ×1.25 承接更粗末级枝——家族沿用。
   *  【簇半径比类 = 家族共性候选；绝对量级 = 榉树特有】 */
  clusterRadiusMinL5: 0.09,
  clusterRadiusSpanL5: 0.035,
  clusterRadiusScaleL4: 1.25,
  /** 工程设定（家族沿用）。 */
  clusterRadiusLengthCap: 0.6,
  /** 工程设定（leaf_cluster_density Unknown（定性末级细枝密 Inferred [8]）——细质密叶
   *  取 0.50 抑制略松（密簇间隙小），离散挂簇间隙保险仍成立）。 */
  clusterMinSeparation: 0.5,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 18（榉树口径：5 骨架 + 领导拓扑下簇位 810（L4 162×1 + L5 324×2）、皮面
   *  20782 的 High 预算推算——细质密叶的覆盖率推算：卡面积 ≈0.0058m²（宽 0.04–0.06 ×
   *  长 0.07–0.144，均值口径）× 18 卡 ≈0.105m² / 簇壳面积 4πr̄² ≈0.146m²（r̄ ≈0.1075）
   *  → 单层覆盖 ≈72% → 簇内空隙 ≈28%，叠簇间间隙与冠内空腔 → 逆光空隙落 Spec 20–35%
   *  带内；High 总面预估 20782 + 29160×存活率(0.42–0.62) ≈ 33.0–38.9K ≤40000（槽 7 密
   *  端预估 ≈38–39.5K 贴上限内）。**预估待 Step 3 探针复核定档**（先例流程：朴树 18→16、
   *  香樟 18 均为探针实测定档——本值含校准余量动机：卡小于先例、簇小于先例、18 卡维持
   *  细质密叶读向）。【每簇叶量类 = 家族共性候选；绝对值 = 榉树特有（预算推算 + fine
   *  texture 观感）】 */
  clusterLeavesL5: 18,
  clusterLeavesL4: 18,
  /** 工程设定（外密内疏的簇内同构映射，家族沿用；中-密取朴树/夏栎同值 0.62——簇内
   *  空隙幅度已由小卡小簇承载）。 */
  clusterShellBias: 0.62,
  clusterShellGamma: 0.8,
  /** Spec §2 / 域扩展节 B leaf_size：真叶 3–10 × 1.5–5cm（FRPS/FOC 双志两全种四源逐字
   *  一致 Verified [1][2][3][4]）、典型单叶 ≈4–6 × 2–3cm（照片交叉 [8]）——单卡 ≈ 真叶
   *  2× 的工程映射（夏栎/朴树/香樟先例口径）→ 卡宽 0.04–0.06m（真叶典型宽 2–3cm 端）。
   *  **小于三先例**（夏栎 0.08–0.13 / 朴树 0.07–0.11 / 香樟 0.06–0.095）——榉叶偏小的
   *  细质密叶 fine texture 读向（Spec §3 fine texture 双整树一致 [8]；§7 中距「细纹理」
   *  冠面为榉树 vs 朴树可读差异）。【卡尺寸域类 = 家族共性候选；绝对量级 = 榉树特有】 */
  leafWidthMin: 0.04,
  leafWidthSpan: 0.02,
  /** Spec 域扩展节 B leaf_aspect_ratio：≈1.8–2.2（leaf-a/leaf-b/leaf-sch 三验一致
   *  Inferred [8]）+ 建模域 1.8–2.4（Spec 明示）——直接采用 Spec 建模域；与香樟
   *  1.8–2.4 同域、比朴树 1.3–2.0 狭长的卵状披针语言（榉树与朴树的叶身份分化轴之一）。
   *  【长宽比域类 = 家族共性候选；域值 = 榉树特有（Spec 建模域直接采用）】 */
  leafAspectMin: 1.8,
  leafAspectSpan: 0.6,

  // 树皮近景微起伏（榉树特有分化：**光滑基底 + 薄片剥落斑驳微起伏**——第四种树皮语言，
  //  Spec §5 / 域扩展节 C bark_archetype：光滑灰白-灰褐基底 + 不规则薄片状剥落斑驳
  //  （四源 Verified [1][2][3][4] + OSU「smooth-gray initially」[7]）；近景起伏量级
  //  「微起伏」——光滑基底上剥落斑局部薄片翘曲、非脊沟非深裂（bark_relief 低-微起伏
  //  Inferred [7][8]，判读波动如实记档 [8]）——vs 夏栎脊沟纵纹 / 朴树平滑-浅斑 / 香樟
  //  纵裂深沟三分化；剥落斑**色**语言（奶油白-浅褐-锈橙暖斑 15–30%、四资产唯一带橙锈
  //  新斑）归 zelkovaMaterials 材质层——geometry 只管轮廓起伏）
  /** 低-微起伏端锚定 0.015（Spec 域扩展节 C bark_relief 低-微 Inferred [7][8]：光滑
   *  基底、剥落斑局部翘曲贴片感——低于朴树浅斑 0.016、远低于夏栎脊沟 0.033/香樟纵裂
   *  0.036）。主干基环半径 ≈0.24–0.30m（Step 3 域建议）→ 峰幅度 ≈3.6–4.5mm、同环极差
   *  ≈5–7mm——近景「贴片感」微起伏可辨、光滑基底读向保持；中景不可辨由近景观感标定。
   *  亚视觉地板联动：0.015 下起径 <0.10m 的管平滑发射——主干 + L1 骨架有效起伏（粗枝
   *  同样剥落斑驳 winter-a [8] ✓）、L2 以下细枝光滑。【幅度 ∝ 半径量级挂钩 = 家族共性
   *  候选沿用；绝对值 = 榉树特有】槽间恒等（barkRelief 非形态差异维度——slot-0 定义、
   *  其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.015,
    /** 光滑基底 + 翘皮斑驳谐波：k∈{3,5,6}——k3 宽缓波（光滑基底的低频缓起伏读向）+
     *  k5/k6 细谐波（薄片边缘翘曲的局部斑尺度；≤ 主干 radial 14 的奈奎斯特域 7 留 1 档
     *  边际——家族同款边际纪律）。【谐波语言 = 榉树特有（vs 夏栎 [3,4,5] 纵脊 / 朴树
     *  [4,5,6] 短斑 / 香樟 [3,4,6] 宽脊+细纹）】 */
    harmonics: [3, 5, 6],
    /** 轴向游走基率 11 rad/m（朴树 16 短斑快断裂与香樟 3.2 纵脊连续之间）：轴向去相关
     *  长度 ≈2π/11 ≈ 0.57m——薄片斑驳的斑片感轴向尺度（斑缘翘曲局部断续、基底的缓波
     *  连续——「光滑基底 + 局部翘皮」的方向性工程映射，Spec bark_relief Inferred
     *  [7][8]）。【游走机制 = 家族共性候选；速率值 = 榉树特有（贴片斑驳的中间偏断续端）】 */
    drift: 11,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown（后者定性「不显-轻度」单源 [8]）——flare 沿家族常量，Step 3 微调归几何）。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.06 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 branching_levels
   *  Inferred [8]）的家族五级方法沿用，级数槽间不动。姿态分级为榉树 vase 语言核心：
   *  **upturn 五级全面高于三先例**（[0.34,0.30,0.26,0.20,0.14] vs 夏栎 [0.30,…,0.12] /
   *  朴树 [0.28,…,0.02] / 香樟 [0.28,…,0.05]）——骨架枝开张后 arching 上拱 + 末级枝
   *  梢端上举（Spec §3/域扩展节 A branch_curvature「上拱-末梢上翘、非下垂型」Inferred
   *  [7][8]；winter-a「young twigs arch upward at tips」[8]）：L1 0.34 承担骨架拱弯、
   *  末级 L5 0.14（vs 朴树 0.02/香樟 0.05）承担冠缘上举收口——vase「向上渐宽 + 顶部
   *  圆穹」侧影的驱动链（与横展角分工：横展角承担开张、upturn 承担上举）。wander 骨架
   *  级略刚直于先例（vase 拱线可读——冬季裸枝 3–4 级分枝 + 上举姿态完全可读 [8]）+
   *  末级乱幅微高（密细枝网 dense fine twig network [8]）；分级单调性保持。各级数值
   *  工程设定（方向 Spec Inferred [7][8]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.34 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.3 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.26 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.2 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.14 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑——L3→L4 三挂点承载榉树 5 骨架下的簇位量 810，与香樟
   *  同拓扑）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3 语法复制）：直立窄冠端——Musashino 品种读向（OSU 14×6m 直立
 * 窄冠 Verified [7]；Spec §6 冠形变体轴的窄端真实分化）。组合：冠幅比降（0.63——Step 3
 * 探针回推（2026-09-20 实测外泄 ×0.96）：涌现 ≈0.60；品种极端比 6/14 ≈0.43 不直取——
 * 8 槽带连续性 + 同种语言一致优先，记档）+
 * 冠高比升（0.80）+ 横展角收窄上举（34–48°）+ 挂高段上移（0.62–0.76 干高段，span
 * 0.14——清干）+ 领导枝偏强（0.54——直立品种端 [7]）+ rank 势差收小（窄冠均齐）+
 * asymmetry 降（0.40）+ 姿态更刚直（trunk/levels wander ×0.8，分级单调性不破）+
 * crownTopBias 升（0.14 窄冠顶部闭合）。upturn 分级结构不动（vase 同种语言——窄 vase
 * 而非柱冠）。
 */
const ZELKOVA_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...ZELKOVA_SLOT0_PROFILE,
  crownWidthRatio: 0.63,
  crownCenterRatio: 0.66,
  crownHeightRatio: 0.8,
  asymmetry: 0.4,
  crownTopBias: 0.14,
  scaffoldAngleMin: 34,
  scaffoldAngleMax: 48,
  scaffoldAttachMin: 0.62,
  scaffoldAttachSpan: 0.14,
  scaffoldRankLength: [1.08, 1.0, 0.95, 0.91, 0.87],
  scaffoldRankRadius: [1.0, 0.97, 0.94, 0.91, 0.89],
  leaderLengthRatio: 0.54,
  trunk: { radial: 14, segs: 14, wander: 0.04, upturn: 0.06 },
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.34 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.3 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.26 },
    { radial: 5, segs: 4, wander: 0.22, upturn: 0.2 },
    { radial: 4, segs: 3, wander: 0.28, upturn: 0.14 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：宽 vase 端——Green Vase® 品种读向（OSU 15×12m
 * vase、upright arching branches Verified [7]；品种比 0.8 恰落 Spec 照片域 0.8–0.95 宽
 * 端）+ 随龄开张读向。组合：冠幅比 0.76（**Step 3 探针回推（2026-09-20 实测外泄
 * ×1.25——54–70° 大枝平展的宽端外泄显著大于锚点 ×1.03）**：涌现 ≈0.95 落中庸域
 * 0.80–0.90 宽端上沿外推，记档）+ 冠高比降（0.66 宽杯扁端）+ 冠心降（0.58——冠最宽
 * 带下压）+ 横展角大（54–70° 大枝平展——Spec 域 40–60° 的开张端外推 10°，夏栎/朴树/
 * 香樟宽展槽同型先例）+ 挂高段下移（0.44 起 span 0.22——干高占比中庸域下段）+ 外层
 * upturn 微收（冠缘摊平的宽展读向，vase 上举弱化端）+ 领导枝弱（0.42——多枝共构端）+
 * 首枝 rank 主导强（×1.24）+ asymmetry 升（0.60）+ crownTopBias 负（-0.06 顶均）。
 */
const ZELKOVA_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...ZELKOVA_SLOT0_PROFILE,
  crownWidthRatio: 0.76,
  crownCenterRatio: 0.58,
  crownHeightRatio: 0.66,
  asymmetry: 0.6,
  crownTopBias: -0.06,
  scaffoldAngleMin: 54,
  scaffoldAngleMax: 70,
  scaffoldAttachMin: 0.44,
  scaffoldAttachSpan: 0.22,
  scaffoldRankLength: [1.24, 1.04, 0.94, 0.86, 0.8],
  scaffoldRankRadius: [1.06, 0.95, 0.89, 0.85, 0.81],
  leaderLengthRatio: 0.42,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.3 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.26 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.22 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.17 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.11 },
  ],
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：骨架枝
 * 方位不规则散布（branch_orientation Unknown 弱 Inferred——叶二列互生 Verified [6][7]
 * 为唯一可判口径）+ 冠形个体开张度幅度（Spec §6）——方向采信；幅度工程设定）。组合：
 * asymmetry 微降（0.58——高 asymmetry 的方位大抖动在 5 骨架下相干偏侧信号被稀释（朴树/
 * 香樟同款探针教训）；偏侧相干性由 rank 主导承载）+ scaffoldRankLength 首枝 ×1.66 /
 * 弱势 ×0.66（一侧枝展压倒性——首枝质量占比 34%（1.66/4.94），配 4 弱枝近均分 → 质心
 * 稳定指向首枝方位；香樟 5 骨架同构取值——**Step 3 探针回调（2026-09-20）**：初值
 * ×1.66 在榉树强 upturn 上拱链下把树顶推至 11.3m（+41% 锚高——香樟 upturn 弱无此
 * 副作用，同值不可直搬），回调 ×1.50/弱势 ×0.74（首枝质量占比 0.30 维持偏冠主导））
 * + scaffoldRankRadius 同向（×1.12）+ 冠幅比升（0.78 容纳域——Step 3 探针回推
 * （2026-09-20 实测外泄 ×0.89：首枝上拱内收）：涌现 ≈0.69 贴中庸域下缘，「容纳域」
 * 语义由 0.78 参数承载）+ 横展角域微扩（44–64°）+ 挂高段贴标准。其余维度贴标准（偏冠 = 方位维
 * 差异）。校准口径沿先例：6 种子面板质心均值为稳健读数（单种子相位 rng 波动大），Step 3
 * 探针复核记档。
 */
const ZELKOVA_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...ZELKOVA_SLOT0_PROFILE,
  crownWidthRatio: 0.78,
  crownCenterRatio: 0.63,
  asymmetry: 0.58,
  scaffoldAngleMin: 44,
  scaffoldAngleMax: 64,
  scaffoldAttachMin: 0.52,
  scaffoldAttachSpan: 0.2,
  scaffoldRankLength: [1.5, 1.04, 0.92, 0.82, 0.74],
  scaffoldRankRadius: [1.12, 0.96, 0.9, 0.84, 0.8],
  leaderLengthRatio: 0.46,
};

/**
 * slot-4 低冠组合（009.3 语法复制 + 榉树干高中庸域 0.30–0.36 下端 + 低干品种证据）：
 * 低分枝点开张个体——Wireless® 品种读向（OSU 7.6×11m 低矮开张 Verified [7]）+ OSU
 * 「vase-shaped, low branched」园艺低干语境 [7]（挂高段压向中庸域下缘 0.30——Spec 域
 * 0.30–0.40 下段 [7][8] 与终审 0.20–0.25 交叉的中庸折衷下端）。组合：挂高段下移
 * （attachMin 0.40 + span 0.24——低垂平展姿态下冠链抬升弱（upturn ×0.5），挂点比标准
 * 槽更低回推）+ 冠心降（0.56）+ crownTopBias 负（-0.12 底密）+ 横展角大（60–76° 近
 * 水平低垂平展）+ 姿态下压（levels upturn ×0.5——上举弱化、vase 收口放宽成低开张杯；
 * 分级单调性保持）+ 簇半径微升（0.10–0.145 低垂大簇）+ 领导枝弱（0.44）+ 冠幅比收
 * （0.70——**Step 3 探针回推（2026-09-20 实测外泄 ×1.63：60–76° 低垂平展 + upturn×0.5
 * 的宽端大外泄）**：涌现 ≈1.14 宽 > 高的低矮开张读向；品种极端比 11/7.6 ≈1.45 不直取，
 * 同种语言一致优先，记档）。涌现视觉冠底预估 ≈0.26–0.28（中庸域下缘变体外推——先例
 * slot-4 同型）。
 */
const ZELKOVA_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...ZELKOVA_SLOT0_PROFILE,
  crownWidthRatio: 0.7,
  crownCenterRatio: 0.56,
  crownHeightRatio: 0.72,
  asymmetry: 0.55,
  crownTopBias: -0.12,
  scaffoldAngleMin: 60,
  scaffoldAngleMax: 76,
  scaffoldAttachMin: 0.4,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.18, 1.02, 0.94, 0.87, 0.82],
  scaffoldRankRadius: [1.02, 0.95, 0.9, 0.87, 0.84],
  leaderLengthRatio: 0.44,
  clusterRadiusMinL5: 0.1,
  clusterRadiusSpanL5: 0.045,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.17 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.15 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.13 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.1 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.07 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制 + 榉树干高中庸域 0.30–0.36 上端）：清干高枝个体——
 * 挂高段提向中庸域上缘 0.36（Spec 域 0.30–0.40 上段 [7][8]；form-a 0.35–0.40 高值端
 * 邻域）。组合：挂高段上移（attachMin 0.66 + span 0.12——上举姿态（upturn ×1.2）冠链
 * 抬升强，挂点不必贴干顶）+ 冠心升（0.68）+ crownTopBias 正（0.16 顶密——圆穹顶读向
 * 加强）+ 领导枝强（0.52——上举端）+ 横展角收（38–52° 上举）+ 姿态上举（levels upturn
 * ×1.2——vase 上拱强化、冠体上收；分级单调性保持）+ 冠高比降（0.64 高挂点纵域收窄）+
 * 冠幅比微降（0.73——Step 3 探针回推（2026-09-20 实测外泄 ×0.89：38–52° 收角 + upturn
 * ×1.2 上举内收）：涌现 ≈0.65 窄端第二）+ asymmetry 降（0.45）。涌现视觉冠底预估
 * ≈0.36–0.38 域上缘外推。
 */
const ZELKOVA_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...ZELKOVA_SLOT0_PROFILE,
  crownWidthRatio: 0.73,
  crownCenterRatio: 0.68,
  crownHeightRatio: 0.64,
  asymmetry: 0.45,
  crownTopBias: 0.16,
  scaffoldAngleMin: 38,
  scaffoldAngleMax: 52,
  scaffoldAttachMin: 0.66,
  scaffoldAttachSpan: 0.12,
  scaffoldRankLength: [1.1, 1.0, 0.95, 0.9, 0.86],
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.9, 0.88],
  leaderLengthRatio: 0.52,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.41 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.36 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.31 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.24 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.17 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透上升端——canopy-a 型空隙 20–30% 个体（Spec
 * §3 逆光空隙带 20–35% 的疏端 Inferred [8]）+ 内膛细枝开网读向（「fine, open network
 * ——visible but not dense」[8]——冠心更开、簇间更散）。组合：canopyDensity 0.78 +
 * crownShellStart ↑（0.58 满密壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓
 * （0.04——内膛开网读向的疏端）+ 空腔半径域 ↑（0.52–0.90 大空隙）+ clusterMinSeparation
 * ↑（0.58）+ clusterShellBias ↓（0.58 簇内也散）+ 领导枝弱（0.44——多枝共构开张端）。
 */
const ZELKOVA_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...ZELKOVA_SLOT0_PROFILE,
  canopyDensity: 0.78,
  crownShellStart: 0.58,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.04,
  voidRadiusMin: 0.52,
  voidRadiusMax: 0.9,
  clusterMinSeparation: 0.58,
  clusterShellBias: 0.58,
  leaderLengthRatio: 0.44,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密闭细密团冠——canopy-b 型空隙 20–35% 带内密端
 * （Spec §3 Inferred [8]）+ Village Green 品种 dense 读向（OSU「12m vase-rounded dense」
 * Verified [7]）。组合：canopyDensity 0.92（**预算护栏**：1.0 时簇位 810 × 18 卡满存活
 * 推算越 40000 上限（29160 叶面 + 20782 皮面 = 49942 理论顶），0.92 收敛预估 ≈38–39.5K
 * 带内上部——Step 3 探针复核，先例同款预算校准流程：朴树 0.93/香樟 0.94 定档）+
 * crownShellStart ↓（0.46 满密壳带更厚）+ crownCoreStart ↑（0.16）+ coreDensityFloor ↑
 * （0.10 团冠感）+ 空腔半径域 ↓（0.36–0.64）+ clusterMinSeparation ↓（0.46）+
 * clusterShellBias ↑（0.66 簇壳更实）+ 冠幅/冠高比微升（0.84 / 0.78 团冠体量——锚
 * 0.82 + 0.02 原差量）+ 领导枝微强（0.50——密冠续顶）。
 */
const ZELKOVA_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...ZELKOVA_SLOT0_PROFILE,
  crownWidthRatio: 0.84,
  crownHeightRatio: 0.78,
  canopyDensity: 0.92,
  crownShellStart: 0.46,
  crownCoreStart: 0.16,
  coreDensityFloor: 0.1,
  voidRadiusMin: 0.36,
  voidRadiusMax: 0.64,
  clusterMinSeparation: 0.46,
  clusterShellBias: 0.66,
  leaderLengthRatio: 0.5,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；榉树沿 Spec §6
 * 品种群轴展开：Musashino 窄端（slot-1）/ Green Vase 宽端（slot-2）/ Wireless 低干开张
 * 端（slot-4）/ Village Green 密冠端（slot-7））。slot-1…7 以 slot-0 锚点为底的差量展开
 * 定义——**结构计数类字段（trunk/levels radial/segs、childPlan、簇位数、每簇叶量、
 * voidCount、scaffoldCount）与叶卡尺寸/长宽比域由展开继承逐位恒等**（皮面数恒等 20782
 * 与 rng 消费次数恒等的结构性保证）；barkRelief 槽间恒等（spread 继承）。morphSeed 路由
 * 见 assets/asset_tree_zelkova.asset（Step 3 交付）。
 */
export const ZELKOVA_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  ZELKOVA_SLOT0_PROFILE,
  ZELKOVA_SLOT1_PROFILE,
  ZELKOVA_SLOT2_PROFILE,
  ZELKOVA_SLOT3_PROFILE,
  ZELKOVA_SLOT4_PROFILE,
  ZELKOVA_SLOT5_PROFILE,
  ZELKOVA_SLOT6_PROFILE,
  ZELKOVA_SLOT7_PROFILE,
];
