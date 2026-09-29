/**
 * runtime/procedural/tree/cedrus/cedrusShapeProfile —— 雪松 shapeProfile 数值面
 * （T012.1 Step 2，针叶家族契约**第一实例化**——契约 = ../conifer/coniferShapeProfile
 * （ConiferShapeProfile 草案，D37.2 本任务同 Step 创建；字段语义 / 槽间恒等纪律 /
 * 【家族共性候选】标注见契约文件）。**conifer 族无先例——方法 = 跨族方法复制**
 * （T012.1 待裁决位 5）：几何管线骨架（growBranch 递归 / 簇布点 / 卡挂点）复制自
 * tree3a 系阔叶通路，挂点语言按雪松层状轮生改写；长短枝双挂点继承 ginkgo 机制；
 * 末级垂帘 upturn 负链 + lengthRatio 加长继承 salix 机制（本契约以 droop 字段从零
 * 表达）；风动两层 + 树高锚同步轮继承 sophora 机制（锚值换 15–18m 级）。
 *
 * 职责：雪松（Cedrus deodara (Roxb.) G. Don，松科雪松属常绿乔木，FRPS 7:200 正名
 *      「雪松」）枝干/冠层/器官/材质参数的**数值面**。全部数值依据
 *      docs/research/cedrus-reference.md（**Spec Version 1.0**，含主代理终审记档
 *      2026-09-29——form-a 裸干比例与层数读数两处分歧已按「不一致即不承重」处置）
 *      雪松自己的现实事实重定；逐字段标注【家族共性候选】（字段类）/【雪松特有】
 *      （数值锚）/【工程设定无现实基准】（工程设定不编造现实依据）+ Evidence Status
 *      （Verified / Inferred / Unknown / 工程设定）。
 *
 * ── Step 1 判定记档 → 字段落位（T012.1 任务书，2026-09-29）──
 *   层状量化挂点+层角梯度+层板升扇+末级垂帘+顶梢专路 → ConiferTierProfile；
 *   长短枝双挂点（莲座簇针数+长枝散生）→ ConiferFoliageProfile；
 *   层隙布点 → tierGapBand；球果直立账目（两类果色+宿存中轴）→ ConiferConeProfile；
 *   树皮鳞状块片 → ConiferBarkProfile；针叶色（灰绿蓝粉+受光色差+无两面色差）→
 *   ConiferNeedleMaterialProfile；风动两层三成分+树高锚 → ConiferWindProfile +
 *   totalHeight 同源；干形/树高锚 → ConiferScaleProfile。
 *
 * ── 结构裁定与预算推算（首版，Step 3 探针回调回路开放）──
 *   - 拓扑：tierCount 7 × tierBranchCount 4 = 28 L1 层枝；childPlan [2,2,2,2] →
 *     L1–L5 = [28, 56, 112, 224, 448]；皮面估算 ≈28.0K（trunk 448 + L1 3.6K +
 *     L2 4.7K + L3 5.4K + L4 6.7K + L5 7.2K）+ 叶卡候选（簇位 448×2+224×1 = 1120
 *     莲座卡 + 散生 448×3+224×2 = 1792 针卡）×存活 ≈0.55–0.65 → 卡 ≈1900–2300 →
 *     总面 ≈31–33K ⊂ LOD 候选带 High ≤ 40000（待裁决位 2；**预估待 Step 3 探针
 *     复核定档**——先例流程：朴树 18→16 / 银杏簇 8 均为探针实测定档）。
 *   - **层数 6–8 变体轴不进槽差异**：tierCount 属结构计数类（改值即改皮面数与 rng
 *     消费数）——沿 ginkgo「长短枝比轴」先例处置：全槽恒等取 7，表观层数差异由
 *     层隙带宽（tierGapBand）/ 展幅连续参数间接表达；**层数轴的槽间展开需家族契约
 *     新数值面——记缺口候选归 T012 族级验收门**。
 *
 * ── Unknown / 不消费记档（Spec 明示，工程不编造依据）──
 *   Unknown：老树平台顶极端态（不消费）；form-a 裸干比例照片读数（分歧不承重——
 *   干高域下沿改由 TSO 孤立树立枝几贴地支撑）；层间距绝对值（算术推断 ≈1.5–2m，
 *   由 tierCount × 冠高参数隐含——契约不设独立层间距字段，Step 3 探针验证涌现值）；
 *   全冠球果绝对量级（Inferred——由 coneCandidates × keep × 结果位数定档）。
 *   不建模：雄球花（秋末抽出早春散粉后落——物候窗主视觉不消费，Spec §5）；欧洲
 *   栽培巨树 39–41m（长龄极端不进生产域）；北非雪松 C. atlantica（属内差分判据，
 *   非本资产）；glaucous 银灰栽培型（色相域内微调可、不另立槽）。
 *
 * 边界：雪松资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_cedrus.asset，Step 3 交付）；比率
 *      字段以 totalHeight（形态参数域树高）为基；角度字段以度存、弧度算；颜色字段为
 *      sRGB hex（0xRRGGBB），3b 材质负责工作色域转换。
 */

import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：**开阔孤立中龄型**（T012.1 Step 1 判定 9 + Spec §6
 * slot-0 锚点建议）——树高 ≈15–18m 级锚、冠幅比 ≈0.4（尖塔窄冠）、干高 ≈0.25、
 * 6–7 主层（取 7）、中龄层展相（幼树密贴 ↔ 成熟宽塔年龄轴的中点）。结构计数类
 * （tierCount / tierBranchCount / trunk·levels radial·segs / childPlan / 簇位数 /
 * 散生卡数 / coneCandidates / tierRank* 数组长度）与叶身份类（莲座针数 / 卡尺寸 /
 * 长宽比 / 球果 / 树皮 / 针叶色 / 风动参数）全槽恒等；槽差异全部落连续形态参数。
 */
export const CEDRUS_SLOT0_PROFILE: ConiferShapeProfile = {
  // ── 体量与干形 ──
  /** Spec §2 中龄公园个体生产锚 **≈15–18m（域 12–20m）**（form-a 12–15 / form-b 15–20
   *  双问 + NC State 域上沿合域——Inferred [4][6]）；slot-0 取域中值 16.5（与阔叶族
   *  锚同语境可混植的量级差——中龄雪松高于阔叶 8m 级锚，混植层次来源）。**同源风动
   *  树高锚**：3b 材质摆幅归一直读本字段（锚同步轮无独立锚值——测试锚断言同源）。
   *  【体量类字段 = 家族共性候选；锚值 = 雪松特有（Spec 生产锚 Inferred）】 */
  totalHeight: 16.5,
  /** Spec §2 冠幅比中龄 **≈0.35–0.5**（form-a 1/3–2/5 / form-b 0.25–0.33 受挤压下沿
   *  ——Verified [4][6]）；尖塔冠显著窄于阔叶族。slot-0 = 0.40（判定 9 锚：域中值；
   *  8 槽带 0.30–0.50）。【冠幅比类 = 家族共性候选；锚值 = 雪松特有（Spec 域
   *  Verified）】 */
  crownWidthRatio: 0.4,
  /** Spec §2 干高占比 **≈0.1–0.4**（下沿 = TSO 孤立树立枝几贴地 + form-a 质化下层枝
   *  近地；上沿 = form-b 0.3–0.4 立木 + TSO 林内净干——Inferred [5][6]，form-a 比例
   *  读数分歧不承重 per 终审）。slot-0 = 0.25（判定 9 锚：域中值——开阔孤立型下层枝
   *  半净干）。【干高占比类 = 家族共性候选；锚值 = 雪松特有（Spec 域 Inferred）】 */
  trunkHeightRatio: 0.25,
  /** 干顶径/基径。工程设定无现实基准（Spec 无干形锥度数值；「乔木高达 50m 胸径 3m」
   *  为物种上限不用；干端直为定性读向 [1]）。16.5m 中龄个体锥度 0.32——端直干缓收。 */
  trunkTaperRatio: 0.32,
  /** 根部展宽（基径/胸径）。工程设定无现实基准（阔叶族同位亦工程常量）；雪松干基
   *  无显著膨大读向（照片 form 系质化）取轻度 1.15。 */
  trunkFlareRatio: 1.15,
  /** 近轮生环的规整度载体（层内枝方位抖动幅度）。方向依据 = Spec §4 分枝方位「近轮生
   *  层状（层内方位近均分 + 抖动）」Inferred [6]；幅度 0.30 = 工程设定（中龄层展相的
   *  中等规整——vs 幼树规整 0.22 / 成熟松散 0.38，年龄轴载体）。【方位抖动机制 =
   *  家族共性候选；幅度 = 工程设定】 */
  crownAsymmetry: 0.3,

  // ── 层结构（身份核心）──
  /** Spec §4 主层计数带 **6–8 清晰主层**（照片双问 12–20m 个体——终审第二读 8–10 含
   *  未完全分离次级层，主层计数带承重；层数值照片判读 = Inferred [6]）；判定 9
   *  slot-0 = 6–7 → 取 7。【结构计数类：槽间恒等】；【层数轴 6–8 变体不进槽差异——
   *  记缺口候选归族门（见模块头）】；【字段 = 家族共性候选；值 = 雪松特有（Spec 计数
   *  带 Inferred）】 */
  tierCount: 7,
  /** 每层主枝数。工程设定无现实基准（Spec 无层内枝数数值；「近轮生成层」排列口径
   *  Verified [1][6]）；4 枝/层 × 7 层 = 28 L1——皮面预算推算（模块头）的拓扑基。
   *  【结构计数类：槽间恒等】 */
  tierBranchCount: 4,
  /** 层位垂直抖动。方向依据 = Spec §4「层间距均匀为主（终审 crown-a 读紧叠不规则——
   *  规则性不作数值承重）」；幅度 0.18 = 工程设定（均匀为主带个体散布）。 */
  tierSpacingJitter: 0.18,
  /** 层角梯度下端（最下层自垂直角）。Spec §4 **下部层近水平 60–90°（自垂直角）**
   *  （form-a/form-b 双问合域——Inferred [5][6]）；slot-0 = 80°（近水平带中值）。
   *  【层角梯度机制 = 家族共性候选；端值 = 雪松特有（Spec 域 Inferred）】 */
  tierAngleBase: 80,
  /** 层角梯度上端（最上层自垂直角）。Spec §4 **上部层上举 30–60°**（form-b 上枝上举
   *  30–45°——Inferred [5][6]）；slot-0 = 45°（上举带中值）。【同上】 */
  tierAngleTop: 45,
  /** 层内枝角抖动。工程设定（近轮生非机械规整的散布；Spec 无度数）。 */
  tierAngleJitter: 6,
  /** 顶层枝长/底层枝长。Spec §3 尖塔轮廓「基部最宽、上 1/4 渐尖收顶、顶梢细」
   *  （三整树槽双问一致——Verified [6]）的层半径梯度工程映射；0.22 = 收顶比。
   *  【轮廓读向 = 家族共性候选（Verified）；数值 = 工程设定】 */
  tierRadiusTaper: 0.22,
  /** 层半径沿高分布指数。工程设定（「上 1/4 渐尖」→ 指数 >1 的顶部急收形状；Spec
   *  定性轮廓 Verified [6]，形状参数无现实数值）。 */
  tierProfileExponent: 1.6,
  /** 层板拱起。方向依据 = Spec §3/§4「层板升扇形/拱形轮廓」Inferred [6]（crown-a）；
   *  幅度 0.10 = 工程（×层半径）。【层板轮廓机制 = 家族共性候选；幅度 = 工程设定】 */
  tierPlateArch: 0.1,
  /** 层板外缘下卷。方向依据 = Spec §3「外缘先平后微垂下卷」+ crown-b「拱形层板边缘
   *  下卷」Inferred [6]；幅度 0.07 = 工程。【同上】 */
  tierEdgeDroop: 0.07,
  /** 层内 rank 长度乘子（4 枝方位序，跨层同方位一致——环内势差 + 相干偏冠载体）。
   *  工程设定（近轮生环内均齐读向的温和势差；偏冠槽上调见 slot-5）。【数组长度 =
   *  结构计数类：槽间恒等】 */
  tierRankLength: [1.12, 1.04, 0.98, 0.93],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  tierRankRadius: [1.06, 0.99, 0.95, 0.92],
  /** 层枝起径/主干挂点径。方向依据 = TSO「Primary branches massive」[5]（粗壮大枝
   *  定性 Verified）；数值 0.52 = 工程设定（massive 平展枝的相对粗度）。 */
  tierBranchRadiusRatio: 0.52,
  /** 顶梢段长/树高。方向依据 = TSO「Leading shoots, including the apical leader,
   *  distinctly drooping」[5] + form-a「leader nods over」[6]（顶梢细尖下垂——Verified）；
   *  段长占比 0.14 = 工程设定（上 1/4 渐尖区段的顶梢延伸）。 */
  leaderLengthRatio: 0.14,
  /** 顶梢下垂强度。方向同上 Verified [5][6]；幅度 0.50 = 工程设定（明显点头读向）。 */
  leaderDroop: 0.5,

  // ── 针叶挂点与簇布点（长短枝双挂点）──
  /** 短枝莲座簇针数（单卡 SDF 放射针数——**3b 材质消费**；LOD 降档 = 递减派生）。
   *  Spec §4/§5 簇密度锚 **15–25**（FRPS「短枝之叶成簇生状（每年生出新叶约 15-20
   *  枚）」Verified [1] + TSO false whorls 20–30 [5] + 照片双问 15–25 [6]）→ 建模
   *  取带中 20。【叶身份：槽间恒等】；【莲座簇机制 = 家族共性候选（ginkgo 莲座簇
   *  机制同型）；针数值 = 雪松特有（Spec 三源合域 Verified）】 */
  rosetteNeedles: 20,
  /** 莲座簇卡边长域（米）。真针 **2.5–5cm**（FRPS = FOC = TSO 四源同域 Verified
   *  [1][3][5]）→ 短枝莲座簇真径 ≈ 8–10cm（20 针放射 + 短枝顶）。**Step 4 视觉校准
   *  回调 2026-09-29**（D30 一轮，两轮内）：五帧 + B25 逆光判读「层板稀疏 / 细暗线 /
   *  winter-like」（剪影透天 88%）→ **0.20–0.30**（真簇 ×2.5–3 观感映射——卡 = 簇 +
   *  邻接叶量质量抽象〔vs 阔叶簇卡 = 簇抽象同口径〕；16.5m 级树 ×2 映射 0.12–0.19
   *  实测 M25 处单卡 3–4px 亚像素不可辨——中距浓密绿板需簇质量单元 ≥0.2m；零面数
   *  成本纯尺度回调）。【卡尺寸域类 = 家族共性候选；绝对量级 = 雪松特有（真针尺寸
   *  Spec Verified + 工程映射记档）】 */
  rosetteCardMin: 0.3,
  rosetteCardSpan: 0.14,
  /** 长枝散生针卡长域（米）。真针同上 × ≈1.5–2 映射（单片散生针——非莲座展开）；
   *  0.05–0.09。【同上】 */
  needleCardLenMin: 0.05,
  needleCardLenSpan: 0.04,
  /** 针卡长宽比域。真针 2.5–5cm × 1–1.5mm → 长宽比 ≈17–50（Spec §5 算术）——1.5mm
   *  级宽度不可渲染，卡抽象收窄至 7–12 保持针形读向与面数/观感平衡（工程映射记档；
   *  vs 阔叶叶卡长宽比 <2 的正交针形语言）。【长宽比域类 = 家族共性候选；域值 =
   *  工程映射（真针比 Spec Verified + 收窄记档）】 */
  needleCardAspectMin: 7,
  needleCardAspectSpan: 5,
  /** 簇位数（末两级 L5/L4 每枝）。工程设定；**Step 4 视觉校准回调 2026-09-29**（D30
   *  一轮）：初版 2/1 五帧 + B25 逆光判读「层板本体内稀疏 / 枝上裸段长」→ **4/3**
   *  （簇位 1120 → 2464，层板簇布点密度 ×2.2——层板内部密实 Spec §3 读向；High 总面
   *  带 ≈35–37.5K ⊆ ≤40000 上限用满口径）；保留簇数随 seed 由簇级抑制确定。
   *  【结构计数类：槽间恒等（全槽同值回调——快照断言随调）】 */
  clustersL5: 4,
  clustersL4: 3,
  /** 长枝散生卡数（L5/L4 逐枝固定——rng 无条件消费）。工程设定（ginkgo 散生卡机制
   *  4/2）；**Step 4 校准 2026-09-29**：4/2 → **2/1**（M25 处单针卡 2–3px 亚像素无质量
   *  贡献——面数预算再分配给莲座簇双卡；近景螺旋散生读向由每枝 2/1 张保留）。
   *  【结构计数类：槽间恒等】 */
  longShootCardsL5: 2,
  longShootCardsL4: 1,
  /** 簇挂点 t 域下限。工程设定；**Step 4 校准 2026-09-29**：0.50/0.45 → **0.22/0.20**
   *  （簇沿枝自基部密集分布——「枝上裸段缩短」的回调主位；外段受光读向由簇密度
   *  本身承载）。【连续】 */
  clusterInnerStartL5: 0.22,
  clusterInnerStartL4: 0.2,
  /** 簇级剔除抑制。工程设定；**Step 4 校准 2026-09-29**：0.50 → **0.15**（初版抑制
   *  剔除 ≈18% 簇位 + 大卡半径联动放大剔除——密度优先下仅剔除近共位簇；卡 = 枝段
   *  叶量质量抽象后簇位即质量单元，重叠由卡面随机滚转吸收）。 */
  clusterMinSeparation: 0.1,
  /** 末级枝长加长乘子（垂帘长度侧——salix 机制）。方向依据 = Spec §4「末级细枝下垂
   *  成垂帘缘沿层板外缘覆垂」Verified [1][3][5][6]；乘子 1.25 = 工程（中龄层展相；
   *  年龄轴载体：幼树 1.05 ↔ 成熟 1.40）。【垂帘机制 = 家族共性候选；乘子 = 工程
   *  设定（方向 Verified）】 */
  fringeLengthRatio: 1.25,
  /** 基准密度乘子（slot-0 = 1.0 满基准；疏密差异归槽 6/7——家族沿用）。【密度乘子类
   *  = 家族共性候选；基调 = 工程设定】 */
  canopyDensity: 1.0,
  /** 层隙观感带（层间空带/层间距）。Spec §3 **层间可见天光缝隙 ≈0.15–0.3 观感**
   *  （crown-b「gaps of sky between tiers」——空隙集中于层间而非均匀散布，Inferred
   *  [6]）；Step 1 判定 3 探针定档带内取中 0.22（**Step 3 探针定档**——vs 阔叶外密
   *  内疏模式的层状空隙语言分化）。【层隙机制 = 家族共性候选（层状族共性读向）；
   *  值 = 雪松特有（Spec 观感带 Inferred + 探针定档回路开放）】 */
  tierGapBand: 0.22,

  // ── 球果直立账目 ──
  /** 结果枝带起点 t。工程设定（Step 1 判定 4 账位语言：层板外缘结果枝带——外段
   *  0.70 起为结果候选位；Spec「直立、顶生短枝、成排向上如烛」Verified [1][4][6]
   *  的布位工程映射）。【叶身份：槽间恒等（账位语言）】 */
  coneFruitingZone: 0.7,
  /** 每结果位候选果数。Spec §5 照片「结果枝顶生短枝单生或数枚（单枝 2–4 枚）」
   *  Verified [6]（cone-a 4 枚 / cone-b 2 枚）→ 候选 3 + 存活过滤（rng 无条件消费）。
   *  【结构计数类：槽间恒等】；【账目机制 = 家族共性候选（ligustrum/fraxinus 账目法
   *  跨族复制）；候选值 = 雪松特有（Spec 照片 Verified）】 */
  coneCandidates: 3,
  /** 候选存活比例。全冠绝对量级 = Spec「中龄树全冠数十枚」**Inferred** [6]（外推）的
   *  定档载体：结果位数 × 3 候选 × 0.60 ≈ 全冠数十枚量级——工程设定（Inferred 量级
   *  的工程落位，Step 3 探针复核）。【叶身份：槽间恒等】 */
  coneKeepRatio: 0.6,
  /** 球果长度域（米）。Spec **7–12cm**（FRPS「长 7-12 厘米」= FOC 7–12 + TSO
   *  7–11(–13) + NC 3–4in——Verified [1][3][4][5]）×1 近真尺寸（大型果身份可辨、
   *  果长数倍于针的读向 [6]）→ 0.08–0.12。【叶身份：槽间恒等】；【尺寸域 = 雪松
   *  特有（Spec Verified ×1 映射）】 */
  coneSizeMin: 0.08,
  coneSizeSpan: 0.04,
  /** 两类果并存比（将熟:幼果）。Spec §5 生长季可见性（主语境 9–10 月）：**两类并存**
   *  ——上年授粉将熟果（绿/转褐）+ 当年幼果（淡绿），周期 Verified [1][2][6]；比例
   *  无数值 → 工程取半 0.50。【叶身份：槽间恒等】；【两类并存机制 = 雪松特有（翌年
   *  熟时窗错位 Verified）；比例 = 工程设定】 */
  coneClassRatio: 0.5,
  /** 将熟果色（绿→红褐转色端的表征色）。Spec「成熟前淡绿色微有白粉，**熟时红褐色**」
   *  Verified [1]（+ 照片黄绿带粉 [6]）；色值 0x8a6a4c = 工程映射（红褐端表征）。
   *  【叶身份：槽间恒等】 */
  coneColorMature: 0x8a6a4c,
  /** 当年幼果色（淡绿带粉端）。Spec「成熟前淡绿色，微有白粉」Verified [1] + cone-b
   *  淡绿-黄绿带粉 [6]；色值 0xa3bf92 = 工程映射。【叶身份：槽间恒等】 */
  coneColorYoung: 0xa3bf92,
  /** 宿存中轴色（种鳞散落后留枝淡入）。Spec「熟时与种鳞一同从宿存的中轴上脱落」
   *  （FRPS 属级——中轴宿存留枝）Verified [2][5]；淡褐色值 = 工程映射。【叶身份：
   *  槽间恒等】 */
  coneAxisColor: 0x9c8a70,

  /** 针叶色材质参数（3b 消费；**无两面色差字段 = 语义本身**——针叶辐射着生，色差来自
   *  受光与白粉，vs 阔叶两面色差语言分化）。全组【叶身份：槽间恒等】。 */
  needleMaterial: {
    /** 受光面（阳面）针色。Spec §5「**阳面银灰-蓝绿 vs 荫面深绿**（受光色差证据，
     *  crown-b 双问）」+ NC「grayish-green, light blue apically」+ TSO glaucous——
     *  Verified [4][5][6]；色值 0x9db3a6 = 工程映射（银灰蓝绿端）。 */
    needleColorSun: 0x9db3a6,
    /** 荫面针色。同上 Verified（crown-b 荫面深绿 [6]）；0x39503f = 深绿端工程映射
     *  （阳银荫深受光色差——Step 1 判定 6 承重）。 */
    needleColorShade: 0x39503f,
    /** 白粉强度。来源 = FRPS「幼时气孔线有白粉」[1]（气孔线白粉为银灰调来源——工程
     *  映射注释，Step 1 判定 6）；强度 0.35 = 工程设定。 */
    needleGlaucousBloom: 0.35,
    /** 叶龄梯度强度。FOC「initially pale green, aging dark green」Verified [3]（幼叶
     *  淡绿银灰白粉 → 老叶深绿——**域内变体非季相卡**，判定 8）；强度 0.40 = 工程。 */
    needleJuvenility: 0.4,
  },

  /** 树皮材质参数（3b 消费——鳞状方块片独立语言位，Step 1 判定 5；几何侧轮廓起伏层
   *  未进契约见模块头缺口记档）。全组【叶身份：槽间恒等】。 */
  bark: {
    /** 块片边长域。Spec §5「**3–8cm 不规则方-长方形鳞状块片**」（bark-a 双问细化）
     *  + FRPS「裂成不规则的鳞状块片」Verified [1][4][5][6] → 0.03–0.08 近真域。 */
    barkPlateMin: 0.03,
    barkPlateSpan: 0.05,
    /** 沟深强度。Spec「**沟浅-中等近黑**」（bark-a [6]）的 0–1 SDF 映射——浅-中端
     *  0.45（幼树光滑渐开裂发育序列的成树中龄相 [4][5]）。 */
    barkGrooveDepth: 0.45,
    /** 基色（暗灰-灰褐）。Spec Verified [1][6]；色值工程映射。 */
    barkBaseColor: 0x555049,
    /** 块顶色（浅灰褐）。Spec「块顶浅灰褐」bark-a Verified [6]；色值工程映射。 */
    barkPlateColor: 0x7a7468,
    /** 沟色（近黑）。Spec「沟浅-中等近黑」Verified [6]；色值工程映射。 */
    barkGrooveColor: 0x2b2823,
  },

  /** 风动两层三成分（3b 消费；**树高锚 = totalHeight 同源**——锚同步轮直读 16.5 级，
   *  阔叶 8–12m 锚 → 1/实测树高重锚，测试锚断言同步）。全组方向依据 = Spec §4 风动
   *  读向「整层小幅慢摆（层状大枝 massive）+ 层缘垂帘与针簇高频颤动（末级细柔）+
   *  顶梢下垂明显摆幅」——**结构推断无直证 Inferred [5][6]**；数值 = 工程设定
   *  （3b 定档回路开放）。【叶身份：槽间恒等】 */
  wind: {
    windTierAmplitude: 0.025,
    windTierFrequency: 0.35,
    windFringeAmplitude: 0.05,
    windFringeFrequency: 2.4,
    windLeaderAmplitude: 0.09,
    windLeaderFrequency: 0.9,
  },

  /** 主干拓扑（径向 14 承载树皮块片 SDF 的周向频率奈奎斯特域 + 近景圆度；环段 16 与
   *  16.5m 树高级匹配——阔叶 8m 级 14 段的等比上推）。【结构计数类：槽间恒等】；
   *  wander 0.03 = 干端直（FRPS「乔木」干形定性 [1]——工程幅度）。 */
  trunk: { radial: 14, segs: 16, wander: 0.03 },

  /** 五级枝拓扑（L1 层枝 → L5 垂帘细枝——跨族复制 tree3a 五级骨架，级数为实例口径）。
   *  radial/segs【结构计数类：槽间恒等】；wander/droop 连续（droop = 末级下垂姿态
   *  语言——L1 0.02 近平〔层角由梯度场承载〕→ L5 0.45 垂帘；wander 主次分级：
   *  massive 层枝刚直 0.06 → 细柔末级 0.34）。数值工程设定（方向 Spec Verified
   *  [1][5][6]）。 */
  levels: [
    { radial: 8, segs: 8, wander: 0.06, droop: 0.02 },
    { radial: 7, segs: 6, wander: 0.1, droop: 0.05 },
    { radial: 6, segs: 4, wander: 0.16, droop: 0.1 },
    { radial: 5, segs: 3, wander: 0.26, droop: 0.22 },
    { radial: 4, segs: 2, wander: 0.34, droop: 0.45 },
  ],

  /** 子枝挂点计划（L1→L2 … L4→L5 四过渡级，各 2 挂点——L1–L5 = [28,56,112,224,448]
   *  的拓扑来源；末位 1.0 = 延伸延续枝）。【结构计数类：槽间恒等】；分布工程设定
   *  （层板布枝的外段偏置——层板填充与外缘结果带的挂点基础）。
   *  **Step 3a 探针回调记档（2026-09-29）**：Step 2 初版数据行为 3/3/3/2 挂点（阔叶模板
   *  拷贝痕），与模块头拓扑算术「childPlan [2,2,2,2] → 皮面 ≈28.0K」自相矛盾——按字面
   *  消费实测皮面 70198 越候选带 High ≤40000 达 75%；修正为各 2 挂点（侧枝 ts 首值原样
   *  保留 + 末位 1.0 延伸枝），实测皮面 28142 回到模块头预估带。修正只动本 ts 数组，
   *  材质消费组（needleMaterial/bark/wind）零触碰——归主代理合并复核。
   *  **Step 4 视觉校准回调（2026-09-29，D30 一轮）**：侧枝 ts 内移 0.38/0.45/0.50/0.60 →
   *  **0.26/0.30/0.30/0.36**——L2–L5 链自层板内段展开（初版外段偏置致层板内圈 ≈40%
   *  裸枝「bare runs」；层板内部密实 Spec §3）。ts 值连续（数组长度 = 计数恒等不变），
   *  rng 消费序不变。 */
  childPlan: [
    { ts: [0.26, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.3, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.3, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.36, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 幼树密贴组合（009.3 差量语法——沿家族先例；年龄轴幼端）：幼树金字塔相（NC
 * 「pyramidal when young」Verified [4] + TSO broad-conical Verified [5]）——层少而
 * 密贴干（Spec §6「幼树窄金字塔（层少而密贴干）」Verified [4][5][6] 的连续参数表达：
 * 层数轴计数恒等不进槽——由 tierGapBand 收窄 + 簇内移 + 冠幅下探间接表达，记档见
 * 模块头）。组合：树高 12.5（域下沿——幼树个体）+ 冠幅 0.33（窄金字塔）+ 干高 0.10
 * （下层枝近地——幼树密贴）+ 层角整体上举（base 75 / top 38）+ 收顶比降（0.16 窄塔）
 * + 顶梢占比升（0.18——幼树顶梢主导强）+ 垂帘弱（fringe 1.05 + L4/L5 droop 0.12/
 * 0.22——「小枝常下垂」的幼树弱表达）+ 层隙 0.15（密贴）+ 簇内移（0.40/0.36）+
 * 方位规整（asymmetry 0.22）+ 姿态更刚直（wander ×~0.85）。
 */
const CEDRUS_SLOT1_PROFILE: ConiferShapeProfile = {
  ...CEDRUS_SLOT0_PROFILE,
  totalHeight: 12.5,
  crownWidthRatio: 0.33,
  trunkHeightRatio: 0.1,
  crownAsymmetry: 0.22,
  tierAngleBase: 75,
  tierAngleTop: 38,
  tierAngleJitter: 5,
  tierRadiusTaper: 0.16,
  tierProfileExponent: 1.45,
  tierPlateArch: 0.07,
  tierEdgeDroop: 0.04,
  leaderLengthRatio: 0.18,
  leaderDroop: 0.4,
  fringeLengthRatio: 1.05,
  tierGapBand: 0.15,
  clusterInnerStartL5: 0.18,
  clusterInnerStartL4: 0.16,
  trunk: { radial: 14, segs: 16, wander: 0.025 },
  levels: [
    { radial: 8, segs: 8, wander: 0.05, droop: 0.01 },
    { radial: 7, segs: 6, wander: 0.09, droop: 0.03 },
    { radial: 6, segs: 4, wander: 0.14, droop: 0.06 },
    { radial: 5, segs: 3, wander: 0.22, droop: 0.12 },
    { radial: 4, segs: 2, wander: 0.3, droop: 0.22 },
  ],
};

/**
 * slot-2 成熟宽塔组合（年龄轴成端）：成熟宽展相（NC「pendulous or weeping branches
 * become wide-spreading as it matures」Verified [4]；中龄生产锚不取老树平顶极端态
 * ——Unknown 不消费）。组合：树高 19.5（域上沿——成熟大个体 20m 级的带内值）+ 冠幅
 * 0.50（宽塔端——域上沿）+ 干高 0.32（净干抬升）+ 层角放平（base 85 近水平端 / top
 * 50）+ 收顶比升（0.30 顶部相对宽——宽塔读向）+ 外缘下卷强（0.10——「外缘先平后微垂
 * 下卷」的成熟强表达）+ 垂帘长（fringe 1.40 + L4/L5 droop 0.30/0.62——「层缘垂帘」
 * 成熟读向）+ 顶梢占比降（0.12）+ 顶梢垂强（0.60）+ 方位松散（asymmetry 0.38）+
 * 层隙 0.25（层展）。
 */
const CEDRUS_SLOT2_PROFILE: ConiferShapeProfile = {
  ...CEDRUS_SLOT0_PROFILE,
  totalHeight: 19.5,
  crownWidthRatio: 0.5,
  trunkHeightRatio: 0.32,
  crownAsymmetry: 0.38,
  tierAngleBase: 85,
  tierAngleTop: 50,
  tierRadiusTaper: 0.3,
  tierProfileExponent: 1.75,
  tierPlateArch: 0.12,
  tierEdgeDroop: 0.1,
  leaderLengthRatio: 0.12,
  leaderDroop: 0.6,
  fringeLengthRatio: 1.4,
  tierGapBand: 0.25,
  clusterInnerStartL5: 0.32,
  clusterInnerStartL4: 0.28,
  levels: [
    { radial: 8, segs: 8, wander: 0.07, droop: 0.03 },
    { radial: 7, segs: 6, wander: 0.11, droop: 0.07 },
    { radial: 6, segs: 4, wander: 0.17, droop: 0.14 },
    { radial: 5, segs: 3, wander: 0.27, droop: 0.3 },
    { radial: 4, segs: 2, wander: 0.38, droop: 0.62 },
  ],
};

/**
 * slot-3 挤压窄塔组合（冠幅受挤压下沿端）：form-b 型个体（Spec §2「form-b 0.25–0.33
 * 受周边挤压下沿」Verified [6] 的域内端 + 干高上沿「立木型 0.3–0.4」Inferred [5][6]）。
 * 组合：树高 18.5（挤压向上生长）+ 冠幅 0.30（带内下沿——任务主轴 0.3–0.5 下端）+
 * 干高 0.40（立木净干端）+ 层角收角（base 70 / top 40——挤压上举）+ 收顶比 0.18
 * （窄塔）+ 密度微降（0.95——受挤压冠内受光弱）+ 层隙 0.24 + 垂帘短（1.15——受挤
 * 压末级伸展弱）+ 方位规整（0.26）。
 */
const CEDRUS_SLOT3_PROFILE: ConiferShapeProfile = {
  ...CEDRUS_SLOT0_PROFILE,
  totalHeight: 18.5,
  crownWidthRatio: 0.3,
  trunkHeightRatio: 0.4,
  crownAsymmetry: 0.26,
  tierAngleBase: 70,
  tierAngleTop: 40,
  tierRadiusTaper: 0.18,
  tierProfileExponent: 1.5,
  leaderLengthRatio: 0.15,
  fringeLengthRatio: 1.15,
  canopyDensity: 0.95,
  tierGapBand: 0.24,
};

/**
 * slot-4 低枝贴地组合（干高低沿端）：孤立开阔低枝个体（Spec §2 干低下沿 = TSO「孤立
 * 树枝几贴地」+ form-a「下层枝近地」质化——Inferred [5][6]；公园孤立树下层枝近地为
 * 雪松公园印象一部分）。组合：树高 14.5（开阔中龄偏小个体）+ 冠幅 0.46（低开阔冠）+
 * 干高 0.10（下层枝近地端）+ 层角最平（base 88 近水平端 / top 48）+ 收顶比 0.28 +
 * 外缘下卷 0.09 + 垂帘 1.30 + 层隙 0.20 + 方位 0.34 + L4/L5 droop 0.26/0.52（低展
 * 垂帘覆垂）。
 */
const CEDRUS_SLOT4_PROFILE: ConiferShapeProfile = {
  ...CEDRUS_SLOT0_PROFILE,
  totalHeight: 14.5,
  crownWidthRatio: 0.46,
  trunkHeightRatio: 0.1,
  crownAsymmetry: 0.34,
  tierAngleBase: 88,
  tierAngleTop: 48,
  tierRadiusTaper: 0.28,
  tierProfileExponent: 1.7,
  tierEdgeDroop: 0.09,
  fringeLengthRatio: 1.3,
  tierGapBand: 0.2,
  levels: [
    { radial: 8, segs: 8, wander: 0.06, droop: 0.03 },
    { radial: 7, segs: 6, wander: 0.1, droop: 0.06 },
    { radial: 6, segs: 4, wander: 0.16, droop: 0.12 },
    { radial: 5, segs: 3, wander: 0.26, droop: 0.26 },
    { radial: 4, segs: 2, wander: 0.34, droop: 0.52 },
  ],
};

/**
 * slot-5 偏冠组合：一侧层枝展显著强于对侧（近轮生环内强弱分化 + 冠形个体开张幅度
 * Spec §6——方向采信 Inferred；幅度工程设定——沿阔叶偏冠槽先例机制：高 asymmetry 在
 * 近轮生环下相干偏侧信号被稀释，偏侧相干性由 **tierRank 跨层同方位主导** 承载——
 * rank0 ×1.58 / 弱势 ×0.78，全 7 层同方位 → 质心稳定指向首方位）。组合：asymmetry
 * 0.42 + rank 首位比 ×1.58（vs slot-0 ×1.12）+ 起径同向 ×1.12 + 冠幅 0.38 容纳域 +
 * 层角微扩（78–46）。其余维度贴标准（偏冠 = 方位维差异）。
 */
const CEDRUS_SLOT5_PROFILE: ConiferShapeProfile = {
  ...CEDRUS_SLOT0_PROFILE,
  totalHeight: 16.0,
  crownWidthRatio: 0.38,
  crownAsymmetry: 0.42,
  tierAngleBase: 78,
  tierAngleTop: 46,
  tierRankLength: [1.58, 1.04, 0.92, 0.78],
  tierRankRadius: [1.12, 0.97, 0.92, 0.88],
};

/**
 * slot-6 疏松组合（疏端）：层隙天光带 0.15–0.3 观感域（Spec §3 Inferred [6]）的疏端
 * + 簇间更散。组合：canopyDensity 0.78 + 层隙 0.30（带上沿——Step 1 判定 3 探针带
 * 上端）+ 簇抑制升（0.58）+ 簇外移（0.55/0.50——层板外段受光集中）+ 树高 17.0（疏
 * 冠高个体）+ 冠幅 0.42 + 干高 0.28。
 */
const CEDRUS_SLOT6_PROFILE: ConiferShapeProfile = {
  ...CEDRUS_SLOT0_PROFILE,
  totalHeight: 17.0,
  crownWidthRatio: 0.42,
  trunkHeightRatio: 0.28,
  crownAsymmetry: 0.33,
  canopyDensity: 0.78,
  tierGapBand: 0.3,
  clusterMinSeparation: 0.32,
  clusterInnerStartL5: 0.34,
  clusterInnerStartL4: 0.3,
};

/**
 * slot-7 丰满组合（密端）：层板内部密实、层隙窄的密簇相（Spec §3「层板内部密实」
 * Inferred [6] 的密端）。组合：canopyDensity 0.94 + 层隙 0.16（带下沿）+ 簇抑制降
 * （0.44）+ 簇内移（0.46/0.42——层板内圈填充）+ 树高 15.5 + 冠幅 0.44（密簇体量）+
 * 干高 0.22 + 外缘下卷 0.08。
 */
const CEDRUS_SLOT7_PROFILE: ConiferShapeProfile = {
  ...CEDRUS_SLOT0_PROFILE,
  totalHeight: 15.5,
  crownWidthRatio: 0.44,
  trunkHeightRatio: 0.22,
  crownAsymmetry: 0.3,
  canopyDensity: 0.94,
  tierGapBand: 0.16,
  clusterMinSeparation: 0.2,
  clusterInnerStartL5: 0.26,
  clusterInnerStartL4: 0.22,
  tierEdgeDroop: 0.08,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽差量语法复制——slot-1…7 以 slot-0 锚点为底
 * 展开定义；方向名仅为标签，槽身份 = 多维取值整体组合）。8 槽主轴覆盖（判定 9 变体
 * 主轴）：树高 12.5–19.5 ⊂ 12–20 × 冠幅 0.30–0.50 = 0.3–0.5 × 干高 0.10–0.40 =
 * 0.1–0.4 × 年龄轴（slot-1 幼树密贴 ↔ slot-0 中龄层展 ↔ slot-2 成熟宽塔）× 疏密轴
 * （slot-6/7）；**层数 6–8 轴因结构计数类跨槽恒等不进槽差异**（全槽 tierCount 7——
 * 表观差异由层隙/展幅连续参数承载，缺口候选归族门，见模块头）。
 * **结构计数类**（tierCount / tierBranchCount / trunk·levels radial·segs / childPlan /
 * clustersL5·L4 / longShootCardsL5·L4 / coneCandidates / tierRank* 数组长度）与
 * **叶身份类**（rosetteNeedles / 卡尺寸与长宽比域 / 球果组 / needleMaterial / bark /
 * wind）由差量展开继承**逐位恒等**（皮面数恒等 ≈28.0K 与 rng 消费次数恒等的结构性
 * 保证）；槽差异全部落连续形态参数。morphSeed 路由见 assets/asset_tree_cedrus.asset
 * （Step 3 交付）。
 */
export const CEDRUS_SHAPE_PROFILES: ConiferShapeProfile[] = [
  CEDRUS_SLOT0_PROFILE,
  CEDRUS_SLOT1_PROFILE,
  CEDRUS_SLOT2_PROFILE,
  CEDRUS_SLOT3_PROFILE,
  CEDRUS_SLOT4_PROFILE,
  CEDRUS_SLOT5_PROFILE,
  CEDRUS_SLOT6_PROFILE,
  CEDRUS_SLOT7_PROFILE,
];
