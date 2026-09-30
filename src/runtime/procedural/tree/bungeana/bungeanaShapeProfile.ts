/**
 * runtime/procedural/tree/bungeana/bungeanaShapeProfile —— 白皮松 shapeProfile 数值面
 * （T012.4 Step 2，针叶家族契约**第四实例化**——契约 = ../conifer/coniferShapeProfile
 * （ConiferShapeProfile **定稿 80 位**，012.2 转正；本任务定稿态增量消费、契约文件零
 * 触碰）。族内先例 = 雪松（012.1）/ 水杉（012.2）/ 圆柏（012.3）：槽组织 / 差量展开
 * 语法 / 三标注 / 模块头纪律照抄其组织（八槽差量结构同构 juniperus）。
 *
 * 职责：白皮松（*Pinus bungeana* Zucc. ex Endl.，松科松属，常绿乔木、中国特有）
 *      枝干/冠层/器官/材质参数的**数值面**。全部数值依据
 *      docs/research/bungeana-reference.md（**Spec Version 1.1**，2026-09-30 落盘 +
 *      主代理采样终审通过——文字锚 9 项逐位一致零修正；照片 4 槽双问复核 3 一致 +
 *      s07 槽位定性精化 + 边缘过渡槽间分歧记档）；逐字段标注【家族共性】（字段类 =
 *      族内真实消费）/【本资产特有】（数值锚 / 本例消费路径）/【工程设定无现实基准】
 *      （工程设定不编造现实依据）+ Evidence Status（Verified / Inferred / Observed /
 *      工程设定）+ 消费差异标记〔消费 / 零值消费 / 不适用 / 退化消费〕。
 *
 * ── Step 1 判定记档 → 字段落位（T012.4 任务书，2026-09-30；判定 12 条 = 结构输入）──
 *   高度域连续散生骨架（无严格轮生——散生 4/6 问一致）→ **层位字段退化消费**（判定 1：
 *   012.3 路径直承：tierCount 10 密层 + tierSpacingJitter 0.50 大抖动 + tierGapBand 0
 *   + rng 方位散布〔tierPhaseStagger / clusterAzimuthStep 双省略〕→ 近连续散生冠，
 *   零契约新增）；开张卵圆→伞形平顶冠谱系（判定 2：第 4 冠轮廓包络型——宽塔幼态
 *   slot-1 ↔ 开张卵圆 slot-0 ↔ 伞形平顶老端 slot-2）→ tierAngleBase/Top 梯度 +
 *   tierRadiusTaper + tierProfileExponent + crownWidthRatio 组合；三针束聚合卡（判定 3：
 *   第 4 叶语言——束生短枝单律 + 螺旋排列 + 束间距 ≈针长 1/3–1/2）→ rosette* 主卡
 *   （卡尺度从族内最新终值带 0.24–0.32 m 起步；束内 3 针扇形 / 束螺旋 / 束间距 =
 *   SDF 内部近景身份，3b 承载）+ 散生单针卡通路**零值占位**（束生单律——无长枝散生
 *   针，vs 雪松双挂点 / 圆柏刺叶 minority）；疏散冠（判定 4：半透光 4 照片 8 问全
 *   一致——族内第 4 种透光读向）→ 疏密轴带 0.80–1.0 + 密度先验 caveat 记档；树皮
 *   第 17 语言（判定 5：白基调多色斑驳薄片剥落——跨族机制沿 platanus、色相序列全新）
 *   → bark 三色组（乳白 plate / 灰褐 base / 近黑 groove）+ 弱浮雕低端；双态两年熟
 *   低量果账目·近景点彩级（判定 6）→ cone 组（单生候选 1 + 幼果主导 classRatio
 *   0.25）；雄球花不做（判定 7）→ strobili 整组省略；无两面色差（判定 8：族内第 4
 *   数据点——「无差」轴三例〔雪松/圆柏/白皮松〕vs 水杉温和差）→ needleFaceContrast
 *   省略 + 受光 ramp（阳黄绿/阴灰绿）+ 微白粉弱档；风动两成分（判定 9：整冠低频
 *   慢摆 + 末级束高频小幅颤）→ wind 组 + leader 零占位；slot-0 锚（判定 10：开阔
 *   公园中龄开张卵圆 ~11–12 m）→ scale 组。
 *
 * ── 契约 80 位消费分类（定稿态增量消费记档，归族门 012.5 素材）──
 *   全消费 60 ｜ 退化消费 4（tierCount / tierBranchCount / tierSpacingJitter /
 *   tierGapBand——层位量化骨架退化承载散生连续冠，判定 1 直承）｜ 零值消费 8
 *   （leaderDroop / coneAxisColor / windLeaderAmplitude / windLeaderFrequency +
 *   **needleCardLenMin·Span / longShootCardsL5·L4**——束生单律无散生单针挂点通路，
 *   水杉式零占位）｜ 不适用 8（tierPhaseStagger / clusterAzimuthStep〔散生 = rng
 *   方位散布，双省略〕+ needleFaceContrast〔无两面色差——判定 8〕+ strobili 组 5
 *   〔雄球花不做——物候窗特异，判定 7〕）＝ 80。
 *   族内可选位第四数据点：雪松消费位 11 中本例**消费 3**（coneClassRatio /
 *   coneColorYoung〔双态两年熟第三消费者〕/ needleGlaucousBloom〔微白粉弱档第三
 *   消费者〕）、**零值 8**（含 needleCardLen 与 longShootCards 两组从圆柏消费回落
 *   零占位——束生单律的负证据记档）；水杉消费位 8 **全部省略**（散生 rng + 无两面差 +
 *   雄球花不做——与圆柏同款省略集）。
 *
 * ── 结构裁定与预算推算（首版，Step 3 探针回调回路开放；预算按 lod-spec §5.2 已锁
 *    conifer 行声明不实测——实测归 3a/3c）──
 *   - 拓扑：tierCount 10 × tierBranchCount 2（散生 rng 方位）= 20 L1 层枝；
 *     childPlan [2,2,2,2] → L1–L5 = [20, 40, 80, 160, 320]；皮面基数 = trunk
 *     14×13×2 = 364 + L1 20×7×7×2 = 1960 + L2 40×6×5×2 = 2400 + L3 80×5×4×2 =
 *     3200 + L4 160×4×3×2 = 3840 + L5 320×4×2×2 = 5120 → **皮恒 16884**。
 *   - 卡账：束卡标称位 = L5 320×12 + L4 160×8 = **5120**；交叉双卡 4 tri → 卡面
 *     标称 5120×4 = **20480**。
 *   - High 预估 ≈ 16884 + 20480×存活(~0.70–0.85) + 果点彩账目(~0.2–0.6K) ≈
 *     **31–35K** ⊂ 已锁 conifer 行 High ≤ 40000（待裁决位 2；预估待 Step 3 探针
 *     复核定档——出带调簇密度或 suppression，计数类全槽同调不破恒等）。
 *   - **密度/卡尺度先验（族终值带直采 + 疏散 caveat）**：束卡 0.26–0.32 ⊂ 族内最新
 *     终值带 0.24–0.32 m（判定 3 明文起步带）；密度类从 M25 冠带绿终值带 33.0/34.3%
 *     同量级起步——**疏散冠 caveat（判定 4）**：Spec 承重半透光疏散结构（4 照片
 *     8 问全一致），M25 显著低于带**不必然是密度缺陷疑点**，判读须对照透天结构
 *     证据（族内首例带下例外记档，Unknown ①留档）。
 *   - **体量差记档**：白皮松生产锚 9–15 m（槽轴 8.5–14）介于雪松 15–18 / 水杉
 *     18–25 与圆柏 6–10 之间——全部尺度锚（trunk segs / 卡绝对量级 / 风动锚）按
 *     本资产树高级重定，不沿用先例数值。
 *   - **层数轴不进槽差异**：tierCount 属结构计数类（改值即改皮面数与 rng 消费数）
 *     ——沿三先例处置：全槽恒等取 10，表观层密度差异由层距/展幅连续参数间接表达；
 *     层数轴槽间展开 = 契约缺口候选归族门（**族内第三例同位记档**）。
 *
 * ── 多干双态表达路径评估（判定 1 留档 → Step 2 结论，不阻塞）──
 *   结论：**可承载（近似路径）**——slot-7 以「低位粗枝上举近似」承载 s08 型多干
 *   （低位 ~25% 高度分叉外张伞状，照片 s08：30–45% 高度分叉外张 40–70°）：连续参数
 *   组合（trunkHeightRatio 0.25 低位端 + tierAngleBase 48° 上举陡端 + tierRank
 *   双强乘子 1.50/1.38 + 起径 1.40/1.28 + tierPlateArch 0.09 拱起 = 低位双主枝
 *   粗壮上举成双干观感）——全部连续形态参数，结构计数全槽恒等不破，**零契约修订**。
 *   理由：s08 伞状分叉型与「单干管 + 低位大枝」参数谱系连续（分叉观感可由裸干比
 *   低端 + 低位枝粗壮上举渐近表达）。
 *   **真近基并立多干（s01 型：2–3 干自干基并立、分叉 <10% 高度）不可承载**：现契约
 *   单干管（trunk radial/segs 单链拓扑）+ rng 消费次数槽间恒等纪律不容干链数槽间
 *   变化；需 geometry 多干链生成 + 契约干链计数位 = **D31.2 候选清单记档归族门
 *   012.5**（非阻塞——slot-0 单干锚定〔准入判据 + 公园典型园林修剪产物〕，多干仅
 *   变体位；族内后续资产确需真近基多干再提请 D31.2 最小必要修订 + 主代理留痕）。
 *
 * ── 年龄皮色轴承载判定（判定 10 slot 主轴「幼灰绿→斑驳→白」的契约落位）──
 *   结论：**契约现有字段无承载位——消费差异记档归族门**。bark 组属叶身份类·槽间
 *   恒等（契约明文「叶身份类（…树皮…）槽间不动」），幼灰绿→斑驳→白三段序列不能
 *   以 bark 色字段进槽差异；**契约缺口候选：树皮年龄轴连续位（白占比 / 斑驳对比度）
 *   ——族内首个皮色主轴 slot 维度的真实需求凭证，归 012.5 裁定**。本任务替代承载
 *   ①：株内大梯度「上白下深」（s07 Verified——族内最强株内梯度）由 3b 沿干高度
 *   梯度承载（材质侧语言，零契约需求）；②：slot 年龄轴以冠形谱系端（宽塔幼态 ↔
 *   开张卵圆中龄 ↔ 伞形平顶老端）间接暗示年龄读向；③：全槽皮色 = 中龄公园典型
 *   斑驳基调（s07/s08 承重参数：乳白/灰白 40–65% + 灰褐 20–30% + 近黑 5–10%）。
 *   伴随消费分工记档：淡黄绿新皮露斑 / 薄片翘边亮斑缘 / 多色第四色 = 3b 材质侧
 *   （非契约缺口，沿圆柏白霜分工先例）。
 *
 * ── Unknown / 不消费记档（Step 1 留档 6 项 + 工程占位，工程不编造依据）──
 *   Unknown（Step 3/4 探针）：①疏散冠 M25 冠带绿落带（vs 终值带——caveat 判读）
 *   ②束卡中距可辨性（3 针小扇放射刷状质感）③螺旋束位近景读向（束间距真实感——
 *   SDF 内部承载）④多干近基分叉表达（slot-7 近似路径成效——见上评估）⑤白干
 *   中距/远景可辨性（M75 身份承重）⑥伞形平顶端 slot 表达（exp<1 + 高 taper 的
 *   顶平截包络首用——表示链 canopy 外推待 3c/Step 4 复核，预期零改动〔判定 11〕）。
 *   不消费（工程占位零值，字段语义不驱动）：leaderDroop / windLeader*（顶梢专路 =
 *   族内可选·雪松消费位，直立刚硬无点头——不消费第三例〔水杉/圆柏/白皮松〕）/
 *   needleCardLen* / longShootCards*（束生单律）/ coneAxisColor（双态皆未熟端——
 *   中轴相不入主语境，宿存窗口 Unknown ②）；省略位 = tierPhaseStagger /
 *   clusterAzimuthStep / needleFaceContrast / strobili 整组（雄球花春窗物候不消费
 *   ——判定 7 明文）。
 *
 * 边界：白皮松资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把
 *      morphSeed 路由到对应槽的 profile，见 assets/asset_tree_bungeana.asset，
 *      Step 3 交付）；比率字段以 totalHeight（形态参数域树高）为基；角度字段以度
 *      存、弧度算（本资产无 clusterAzimuthStep——省略位）；颜色字段为 sRGB hex
 *      （0xRRGGBB），3b 材质负责工作色域转换。
 */

import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：**开阔公园中龄开张卵圆型**（T012.4 Step 1 判定 10
 * + Spec §尺度锚——中龄公园典型生产锚 9–15 m 中位偏上〔慢生注记：同龄公园个体小于
 * 雪松/水杉〕+ 中龄冠形裁定 = 宽塔→开张广卵圆过渡态）——树高 ≈11.5 m（~11–12 m 锚
 * 带中值）、冠幅比 ≈0.85（开张卵圆 0.8–0.9 锚带 + Spec 中龄 0.7–1.0）、裸干比 ≈0.30
 * （Spec 0.25–0.4 中值）、干基膨大 ×1.15（≤1.3 域内）、单干通直（园林修剪典型态）+
 * 散生连续冠（判定 1 退化消费路径）+ 中龄定型相（宽塔幼态 ↔ 伞形平顶老端年龄轴的
 * 中点，皮色 = 中龄斑驳基调全槽恒定）。结构计数类（tierCount / tierBranchCount /
 * trunk·levels radial·segs / childPlan / 簇位计数 / cone 候选 / tierRank* 数组长度）
 * 与叶身份类（束卡元素数与尺度域 / 散生单针零占位 / 球果组 / needleMaterial /
 * bark / wind / 挂点语言位〔双省略即散生 rng 语言〕）全槽恒等；槽差异全部落连续
 * 形态参数。
 */
export const BUNGEANA_SLOT0_PROFILE: ConiferShapeProfile = {
  // ── 体量与干形 ──
  /** Spec §尺度锚 **中龄公园生产锚树高 9–15 m**（Inferred [3]+s01–s03——慢生三源
   *  一致；体量介于雪松 15–18 / 水杉 18–25 与圆柏 6–10 之间）；slot-0 取 ≈11.5
   *  （判定 10 锚带 ~11–12 m 中值——谱系中位偏上）。**同源风动树高锚**：3b 材质
   *  摆幅归一直读本字段（锚同步轮无独立锚值——测试锚断言同源，判定 9：树高锚 =
   *  slot-0 同步轮）。【体量类字段 = 家族共性；锚值 = 本资产特有（Spec 尺度锚
   *  Inferred）】〔消费〕 */
  totalHeight: 11.5,
  /** Spec §尺度锚 **冠幅比谱系：中龄 0.7–1.0 → 中老 0.8–1.2 → 老树伞形端 >1.2**
   *  （Verified 中老照片 / Inferred 中龄段 + 文献序列 [1][3]+s01–s03）；slot-0 =
   *  0.85（判定 10 锚带 ~0.8–0.9 + 中龄开张卵圆 0.7–1.0 主域）。8 槽带 0.60–1.25
   *  （宽塔幼态 slot-1 ↔ 开张卵圆 slot-0 ↔ 伞形平顶老端 slot-2——判定 2 冠形谱系
   *  槽轴）。【字段 = 家族共性；锚值 = 本资产特有（Spec 域 Verified/Inferred +
   *  判定 10）】〔消费〕 */
  crownWidthRatio: 0.85,
  /** Spec §尺度锚 **裸干比 0.25–0.4**（Verified 照片双问 s01/s02/s03——中龄公园
   *  典型净干）；slot-0 = 0.30（域中值 + 判定 10 锚 ~0.3）。8 槽带 0.25–0.36
   *  （多干变体 slot-7 低位分叉端 ↔ 老树 slot-2 净干抬升端）。【字段 = 家族共性；
   *  锚值 = 本资产特有（Spec 域 Verified）】〔消费〕 */
  trunkHeightRatio: 0.3,
  /** 干顶径/基径。方向 = **主干通直至略弯**（中龄 Verified s01/s02/s03；老树端
   *  S 形扭曲不进生产域）；数值 0.30 = 工程设定无现实基准（Spec 无干形锥度数值
 *      ——通直干的缓收）。【字段 = 家族共性；值 = 工程设定（方向 Verified）】〔消费〕 */
  trunkTaperRatio: 0.3,
  /** 根部展宽（基径/胸径）——**干基膨大弱 ≤×1.3 常态**（Spec §干基：根盘膨大弱
   *  「不明显」/「略加粗不夸张」双问一致——Inferred 照片弱读 s08；无板根证据）；
   *  slot-0 = 1.15（弱膨中值）。8 槽带 1.06–1.24（幼弱 ↔ 老强年龄轴，全程 ≤1.3
   *  域内；水杉膨大字段的低值端消费——圆柏同判）。【字段 = 家族共性（水杉强端 /
   *  圆柏弱端谱系第三数据点后第四数据点）；锚值 = 本资产特有（Spec 域 Inferred）】〔消费〕 */
  trunkFlareRatio: 1.15,
  /** 散生冠的规整度载体（层内枝方位抖动幅度缩放）。方向 = **无严格轮生成层、散生
   *  为主**（Spec §骨架 4/6 问一致 Verified s01/s02/s08——弱层性 2 问分歧不承重）
   *  → 散布端高值 0.33（介于圆柏 0.34 最散与雪松 0.30 之间）；幅度 = 工程设定。
   *  【方位抖动机制 = 家族共性；幅度 = 工程设定（方向 Verified）】〔消费〕 */
  crownAsymmetry: 0.33,

  // ── 层结构（退化消费：高度域连续散生——无层冠的层位量化骨架承载，判定 1 直承 012.3 路径）──
  /** 主层数。Spec §骨架「**无严格轮生成层**（散生为主）」（Verified s01/s02/s08
   *  ——族内第三骨架型同型直承）；判定 1 退化消费路径：密层 10（密层预估带 8–12
   *  中值）+ jitter 0.50 + tierGapBand 0 + rng 方位 → 层位量化退化为高度域连续散布
   *  的挂点骨架（11.5 m 树 × 10 层 ≈ 0.75 m 层距——圆柏 0.68 m 同量级，表观无层）。
   *  绝对计数 Unknown → Inferred-工程待探针。【结构计数类：槽间恒等】；【层数轴
   *  不进槽差异——缺口候选归族门（族内第三例同位记档）】；【字段 = 家族共性；值 =
   *  本资产特有（Spec 散生定性 Verified + 计数预估 Inferred 待探针）】〔退化消费〕 */
  tierCount: 10,
  /** 每层主枝数 = **2 散生枝/高度片**（rng 任意方位 + 大抖动——散生语言的层内实现，
   *  圆柏同款第三型；数值资产侧定：同计数下雪松 = 近轮多枝、水杉 = 对生成对、
   *  白皮松 = 随机方位散布〔双省略锁〕）。3 枝/层预算超 High 带（30 L1 → 皮面
   *  ≈25K 无卡余量）→ 取 2/层 + 密簇挂点承载疏散冠观感。【结构计数类：槽间恒等】；
   *  【字段 = 家族共性；值 = 工程设定（散生主律的定枝实现 + 预算裁定——探针可
   *  全槽同调回调）】〔退化消费〕 */
  tierBranchCount: 2,
  /** 层位垂直抖动。方向 = **散生为主**（Verified s01/s02/s08——无轮生读向）；幅度
   *  0.50 = **大抖动破层端**（退化消费杠杆——沿圆柏 0.50 同档，层位读向被散布覆盖
   *  → 近连续冠）。【字段 = 家族共性；值 = 工程设定（方向 Verified + 退化消费
   *  记档）】〔退化消费〕 */
  tierSpacingJitter: 0.5,
  /** 层角梯度下端（最下层自垂直角）。Spec §骨架「**枝较细长，斜展**」（FRPS
   *  Verified [1]）+ s08 低位分叉外张 40–70°（Observed）+ 中龄开张卵圆下枝斜展-
   *  近水平混合（s01/s03 Observed）→ 裁定带**下 50–80°**；slot-0 = 65°（中龄
   *  开张卵圆中值——斜展近平展端）。【层角梯度机制 = 家族共性；端值 = 本资产
   *  特有（Spec 斜展 Verified + 照片域 Observed 裁定带）】〔消费〕 */
  tierAngleBase: 65,
  /** 层角梯度上端（最上层自垂直角）。Spec 上部枝斜展上举 + 先端上翘（Verified [1]
   *  「斜展」+ 照片先端上翘 Observed）→ 裁定带**上 25–55°**；slot-0 = 35°（中龄
   *  上举端；伞形平顶槽升 55° 平展端——顶平截读向）。【同上】〔消费〕 */
  tierAngleTop: 35,
  /** 层内枝角抖动。工程设定（散生非机械规整的散布；Spec 无度数——散生读向已由
   *  jitter/asymmetry 承载，本值为枝角微散）。【字段 = 家族共性；值 = 工程设定】〔消费〕 */
  tierAngleJitter: 8,
  /** 顶层枝长/底层枝长。**开张卵圆冠**（中龄宽塔→开张广卵圆过渡态——中部最宽
   *  轮廓 Verified [1][3]+s01–s03）→ 0.55（中宽端——vs 宽塔急收 slot-1 0.40 /
   *  伞形平顶 slot-2 0.85 近等宽端：**冠形谱系槽轴载体**，判定 2）。【轮廓读向 =
   *  家族共性（Verified）；数值 = 本资产特有（Spec 冠形谱系域 + 谱系端工程落位）】〔消费〕 */
  tierRadiusTaper: 0.55,
  /** 层半径沿高分布指数。**开张卵圆**（中下部宽展 + 顶部渐收的卵形权重）→ 1.6
   *  （vs 宽塔 1.30 塔形 / 伞形 0.90 顶阔端——**伞形平顶端 = exp<1 新端型首用**，
   *  Unknown ⑥留档）；方向 = 冠形谱系 Verified；数值 = 工程设定。【字段 = 家族
   *  共性；值 = 工程设定（方向 Verified）】〔消费〕 */
  tierProfileExponent: 1.6,
  /** 层板拱起。方向 = **大枝先端上翘**（Spec §骨架斜展先端上翘 Verified s01/s03
   *  Observed——白皮松枝姿特征读向）→ 0.07（高于圆柏 0.03 近水杉档——先端上翘
   *  的拱形层板）；伞形槽 0.10（伞骨上拱端）。【层板轮廓机制 = 家族共性；幅度 =
   *  工程设定（方向 Observed）】〔消费〕 */
  tierPlateArch: 0.07,
  /** 层板外缘下卷。方向 = **针硬挺平直或端部微垂**（Spec §针叶质感 Verified [1][2]
   *  ——无垂帘读向）+ 老树伞缘微垂覆（s02 老树端 Observed）→ 弱 0.04；老树槽升
   *  0.06。【同上】〔消费〕 */
  tierEdgeDroop: 0.04,
  /** 层内枝 rank 长度乘子（2 枝 = 散生对——跨层同方位势差弱〔散生无相干律〕+
   *  近等基线；破缺即偏冠槽载体见 slot-5、双强即多干近似槽载体见 slot-7）。
   *  工程设定。【数组长度 = 结构计数类：槽间恒等；值 = 连续】〔消费〕 */
  tierRankLength: [1.04, 0.97],
  /** rank 起径乘子（与长度同向）。工程设定。【数组长度 = 结构计数类：槽间恒等】〔消费〕 */
  tierRankRadius: [1.03, 0.98],
  /** 层枝起径/主干挂点径。方向 = **大枝较细长**（FRPS「枝较细长」Verified [1]
   *  ——vs 雪松粗壮平展轮层；疏散冠由细长枝构成）→ 0.40（纤细-中庸端，近水杉
   *  0.42）；多干近似槽由 rank 乘子承载粗壮（非本值）。【字段 = 家族共性；值 =
   *  工程设定（方向 Verified）】〔消费〕 */
  tierBranchRadiusRatio: 0.4,
  /** 顶梢段长/树高。方向 = **主干通直延伸 + 冠顶由叶团簇构成**（幼树宽塔顶梢主导
   *  强 → 老树伞形平顶端顶梢短——FRPS 冠形序列 Verified [1][3]）；slot-0 = 0.06
   *  （中龄中值；幼态槽 0.09 / 伞形槽 0.04）。【字段 = 家族共性；值 = 工程设定
   *  （方向 Verified 年龄序列）】〔消费〕 */
  leaderLengthRatio: 0.06,
  /** 顶梢下垂强度。**零值消费占位 0**（判定 9：顶梢直立刚硬无点头证据——顶梢专路
   *  = 族内可选·雪松消费位，不消费第三例〔水杉/圆柏/白皮松〕）。【族内可选·雪松
   *  消费】〔零值消费〕 */
  leaderDroop: 0,
  /** 相邻主层方位交错角。**省略**（判定 1：散生 = rng 任意方位〔雪松近轮散布同款
   *  省略——圆柏同判〕——无对生交错的层间律）。【挂点语言身份：槽间恒等】【族内
   *  可选·水杉消费——本例省略】〔不适用〕 */
  // tierPhaseStagger: 省略

  // ── 三针束聚合卡挂点（第 4 叶语言：末级枝段多束聚合——束生短枝单律）──
  /** 束卡 SDF 叶元素数（末级枝段 + 多束聚合的并集抽象——元素 = 束单元，束内 3 针
   *  扇形开展由 SDF 内部承载〔近景身份——3b〕）。Spec §针束机制：**束沿枝螺旋排列
   *  + 束间距 ≈针长 1/3–1/2（≈2–5 cm）**（排列 Verified s04/s05 / 间距 Inferred
   *  换算）× 卡长 0.26–0.32 m → 真束 5–16 → SDF 抽象 12（真域中值——**SDF 内部
   *  束密度不随卡尺度稀释**，判定 3 明文近景身份保位）。LOD 降档 = 递减派生归 3b。
   *  【叶身份：槽间恒等】；【字段 = 家族共性（主卡 SDF 叶元素数）；值 = 本资产特有
   *  （Spec 束间距 Inferred × 聚合算术）】〔消费〕 */
  rosetteNeedles: 12,
  /** 束卡尺度域（米，min + rng×span）。**族内最新终值带直采起步**（判定 3 明文：
   *  束真实尺度 5–10 cm 亚像素，卡单位 = 末级枝段多束聚合卡；0.24–0.32 m 带 =
   *  012.3 几何轮终值）→ 0.26–0.32 ⊂ 带（中上段——11.5 m 级中量级体的中距面质量
   *  档）。近景取舍沿族先例：单卡大于实物末级枝段，中距「硬针束放射刷状质感」由
   *  SDF 内部束密度承载（Unknown ②留档）。【卡尺度域类 = 家族共性；绝对量级 =
   *  本资产特有（族终值带直采 + 判定 3）】〔消费〕 */
  rosetteCardMin: 0.26,
  rosetteCardSpan: 0.06,
  /** 散生单针卡长域（米）。**零值消费占位 0**（判定 3/12：**束生短枝单律**——
   *  白皮松针叶全部 3 针一束着生短枝，无长枝散生单针挂点〔vs 雪松长短枝双挂点 /
   *  圆柏刺叶 minority 双叶型〕；cedrus 短枝机制族内直承但单律——ginkgo 跨族读取
   *  不需要）。【叶身份：槽间恒等】【族内可选·雪松消费——本例零值占位（从圆柏
   *  消费回落水杉式零占位——束生单律的负证据记档，第四数据点）】〔零值消费〕 */
  needleCardLenMin: 0,
  needleCardLenSpan: 0,
  /** 束卡轮廓长宽比域（米——蓬松放射刷轮廓）。真针长径比（5–10 cm / 1.5–2 mm ≈
   *  25–60 微观）由 SDF 内部承载；卡轮廓比 = 聚合单元侧影：束开展幅（针长放射
   *  ≈0.10–0.16 m 宽）× 卡长 0.26–0.32 → 真域 ≈1.6–3.2 → 域 1.6–2.6（**下限低于
   *  圆柏绳卡 2.0–3.2 = 放射蓬松 vs 绳列细长的语言区分锁**，判定 3 卡构成差）。
   *  【字段 = 家族共性（叶卡轮廓比域）；域值 = 本资产特有（Spec 针尺度 Verified ×
   *  聚合工程映射）】〔消费〕 */
  needleCardAspectMin: 1.6,
  needleCardAspectSpan: 1.0,
  /** 束卡挂点位（末两级 L5/L4 每枝）。**族终值带起步**（判定 4 三杠杆之密度档：
   *  M25 冠带绿终值带同量级起步；疏散 caveat 见模块头——疏散观感由簇卡形态/透射
   *  承载非挂点减量初值）→ 12/8（圆柏校准前值 12/8 同档——探针回调全槽同调开放）。
   *  【结构计数类：槽间恒等】【工程设定——挂点采样计划位（族终值带起步，校准
   *  回调）】〔消费〕 */
  clustersL5: 12,
  clustersL4: 8,
  /** 散生单针卡数（L5/L4 逐枝固定计数）。**零值消费占位 0**（束生单律——散生单针
   *  通路不实现，同 needleCardLen*）。【结构计数类：槽间恒等】【族内可选·雪松
   *  消费——本例零值占位】〔零值消费〕 */
  longShootCardsL5: 0,
  longShootCardsL4: 0,
  /** 簇挂点 t 域下限。工程设定（**挂点前移杠杆 ✓**——三杠杆之三：疏散冠外段受光
   *  集中〔半透光叶团外缘不规则 Observed〕；族校准实证直承）。〔消费〕 */
  clusterInnerStartL5: 0.15,
  clusterInnerStartL4: 0.13,
  /** 簇级显式剔除抑制。**族校准带直采**：metasequoia/juniperus 同步值 0.02 档
   *  （束卡 0.26–0.32 尺度带的近重合去重档；重叠由交叉双卡随机滚转吸收〔**交叉
   *  双卡 ✓** 三杠杆之二继承〕）；疏冠槽 0.045（疏端档）。【工程设定——管线
   *  抑制位】〔消费〕 */
  clusterMinSeparation: 0.02,
  /** 末级枝长加长乘子。方向 = **针硬挺平直或端部微垂 + 枝较细长**（Verified [1][2]
   *  ——无垂帘段加长读向）→ 近平 1.12（近圆柏紧密直伸 1.12 档 « 水杉轻垂 « 雪松
   *  垂帘）；老树伞缘端 1.16 / 幼态刚直 1.08。【垂帘机制 = 家族共性；乘子 = 工程
   *  设定（方向 Verified）】〔消费〕 */
  fringeLengthRatio: 1.12,
  /** 基准密度乘子（slot-0 = 1.0 满基准；疏密轴全槽带 0.80–1.0——**疏散冠下限
   *  0.80**：疏散身份 = 半透光叶团结构〔Observed 4 照片 8 问〕由簇卡形态/透射/
   *  抑制承载，密度乘子只承载株间密度变幅，判定 4 caveat 参数面落位）。【密度
   *  乘子类 = 家族共性；基调 = 工程设定（Spec 疏散 Observed + 判定 4）】〔消费〕 */
  canopyDensity: 1.0,
  /** 层隙观感带。**零端消费 0**（判定 1：**散生连续冠无层隙**——退化消费路径第四
   *  杠杆〔tierGapBand 0 明文〕，与水杉密连续锥/圆柏密实连续冠同零端〔消费差异
   *  即转正素材的第四数据点〕）。【字段 = 家族共性（水杉/圆柏零端）；值 = 本资产
   *  特有（Spec 散生读向 Verified + 判定 1）】〔退化消费〕 */
  tierGapBand: 0,
  /** 簇挂点方位步进。**省略**（判定 1：散生 = rng 方位散布〔雪松/圆柏同款省略〕
   *  ——束的螺旋排列是**卡内 SDF 微观律**〔束沿末级枝段螺旋，3b 承载〕，非簇级
   *  挂点方位步进语言——层级分工记档，Unknown ③留档）。【挂点语言身份：槽间
   *  恒等】【族内可选·水杉消费——本例省略】〔不适用〕 */
  // clusterAzimuthStep: 省略

  // ── 双态两年熟低量果账目（近景点彩级——判定 6 改写）──
  /** 结果枝带起点 t。方向 = **球果通常单生、幼果初直立着生新枝端/近顶**（FRPS
   *  「球果通常单生，初直立，后下垂」+ 短梗或几无梗 Verified [1][2]）→ 外段结果
   *  位（t ≥ 0.72 的外段枝位为结果候选；值工程映射）。【叶身份：槽间恒等（账位
   *  语言）】〔消费〕 */
  coneFruitingZone: 0.72,
  /** 每结果位候选果数。方向 = **单生**（FRPS「通常单生」Verified [1][2]）→ 候选
   *  1（单生律的固定计数；rng 无条件消费后按 keep 过滤——posHash 零 rng 账目归
   *  3a 几何侧，族先例法）。【结构计数类：槽间恒等】；【账目机制 = 家族共性；
   *  候选值 = 本资产特有（Spec 单生 Verified）】〔消费〕 */
  coneCandidates: 1,
  /** 候选存活比例。全冠量级 = Spec §5.3 **低-中量单生**（幼果照片低量弱读
   *  s06+643005572 快判——精确档落空按低量消费；判定 6 点彩级：幼果 1–1.5 cm
   *  中距亚像素，4 tri/果入皮组先例）的定档载体：keep 0.22（低量档——vs 水杉
   *  轻量 0.30 / 圆柏中量 0.55）。【叶身份侧：槽间恒等】；【值 = 工程设定
   *  （Observed 量级弱读的工程落位，Step 3 探针复核）】〔消费〕 */
  coneKeepRatio: 0.22,
  /** 球果尺度域（米）——**双态两年熟域**：一年生绿幼果 ≈1–1.5 cm（Verified [1]
   *  机制 + 幼果照片弱读）主导 + 少量二年生近熟淡绿-黄褐（成熟 5–7 cm〔Verified
   *  [1][2]〕的生长季半熟外推 Inferred）→ 0.012–0.048（幼果端主导 + 近熟端上限
   *  内收）。【叶身份：槽间恒等】；【尺寸域 = 本资产特有（幼果 Verified × 近熟
   *  Inferred 外推）】〔消费〕 */
  coneSizeMin: 0.012,
  coneSizeSpan: 0.036,
  /** 两类果并存比（近熟果占比）。**消费**（判定 6：**两年熟机制 → 生长季主视觉
   *  = 一年生绿幼果主导 + 少量近熟淡绿-黄褐并存**〔翌年 10–11 月熟 Verified [1][2]
   *  ——同雪松翌年熟时窗错位同型语义，第三消费者〕）→ 0.25（幼果主导端——vs 圆柏
   *  熟果主导 0.75 反向）。【叶身份：槽间恒等】【族内可选·雪松消费——**本例消费
   *  （第三消费者，幼果主导反向档）**】；【值 = 本资产特有（Spec 两年熟 Verified +
   *  主语境照片弱读的工程落位）】〔消费〕 */
  coneClassRatio: 0.25,
  /** 主类果表征色（近熟淡绿-黄褐端——熟相端色）。Spec **成熟前淡绿色，熟时淡黄
   *  褐色**（Verified [1][2]）→ 0xa2985a = 近熟淡绿-黄褐工程映射（生长季半熟相
   *  ——熟窗不入主语境）。【叶身份：槽间恒等】；【表征色语义 = 家族共性（主类果
   *  色）；色值 = 本资产特有（Spec Verified）】〔消费〕 */
  coneColorMature: 0xa2985a,
  /** 次类果色（当年一年生绿幼果端）。Spec §5.3 幼果**小绿幼果（直立、覆瓦鳞）**
   *  （幼果照片弱读 s06）→ 0x5d7a44 = 绿幼果表征（主语境主导色）。【叶身份：槽间
   *  恒等】【族内可选·雪松消费——**本例消费（第三消费者）**】；【色值 = 本资产
   *  特有（幼果照片弱读 + Spec 淡绿端）】〔消费〕 */
  coneColorYoung: 0x5d7a44,
  /** 宿存中轴色。**零值消费占位**（本例双态皆未熟端——一年生 + 近熟，中轴暴露相
   *  不入主语境；开裂后宿存窗口 Unknown ②；族内可选·雪松消费位，占位色）。【族内
   *  可选·雪松消费】〔零值消费〕 */
  coneAxisColor: 0x6b6355,
  /** 雄（花粉）球花第二器官账目。**省略整组**（判定 7：**雄球花不做**——春季
   *  物候窗 4–5 月特异、主语境 9 月末不消费〔Spec 反证「可见性显著」但物候窗
   *  判定维持，012.3 同判〕；春景语义需求时复议，Constraints 记档）。【族内可选·
   *  水杉消费——本例省略】〔不适用〕 */
  // strobili: 省略

  /** 针叶色材质参数（3b 消费；**无两面色差**——判定 8 族内第 4 数据点：与雪松/
   *  圆柏同「无差」轴〔气孔线为两侧浅色细线观感 + 微白粉感，非水杉式两面差〕；
   *  needleFaceContrast 省略即「无两面差」语义）。全组【叶身份：槽间恒等】。 */
  needleMaterial: {
    /** 受光面（阳面）叶色。Spec §5.2 **深绿-中绿带黄绿/灰绿调**（NC medium to
     *  dark green Verified [3]）+ **阳面黄绿亮/阴面灰绿暗受光色差为主律**（s04/s05
     *  照片 Observed——判定 8 受光 ramp 同源）→ 0x77864f = 黄绿亮端工程映射。 */
    needleColorSun: 0x77864f,
    /** 荫面叶色（灰绿暗端——受光色差 ramp 的暗端）。0x49543e = 灰绿暗工程映射
     *  （s04/s05 Observed 灰绿域）。 */
    needleColorShade: 0x49543e,
    /** 白粉强度。**消费（微档）**：整冠**浅色细线 + 微白粉感**（Spec §5.2——气孔
     *  线致观感 Inferred 照片佐证 s04/s05）的工程映射 → 0.10 微档（雪松银灰强端 /
     *  圆柏 0.15 弱档后更弱——微白粉谱系第四数据点）。【族内可选·雪松消费——
     *  **本例消费（第三消费者，微档端）**】；【值 = 工程设定（Observed 微白粉
     *  读向的微档落位）】。 */
    needleGlaucousBloom: 0.1,
    /** 叶龄梯度强度。Spec §5.2/s06 **新梢黄绿-灰绿 → 深绿渐变**（一年生小枝灰绿/
     *  浅黄绿 Verified [1]+s04/s06）的域内梯度（非季相语义——常绿无季相证据不建
     *  卡，待裁决位 4）；强度 0.20 = 工程。【字段 = 家族共性；值 = 工程设定（方向
     *  Verified/Observed）】。 */
    needleJuvenility: 0.2,
    /** 两面色差强度。**省略**（判定 8：**无两面色差**——FRPS「叶背及腹面两侧均有
     *  气孔线」= 两侧白线观感非块状两面差〔族内第 4 数据点：无差轴三例——雪松/
     *  圆柏/白皮松〕；族内可选·水杉消费位，本例省略）。【族内可选·水杉消费——
     *  本例省略】〔不适用〕 */
    // needleFaceContrast: 省略
  },

  /** 树皮材质参数（3b 消费——**第 17 语言：白基调多色斑驳薄片剥落**（判定 5 立项
   *  即定做 identity 级；机制沿 platanus 斑驳剥落〔跨族复制，3b read-point〕、色相
   *  序列全新——族内首个非褐色系白基调皮）。契约三色组承载：plate = 乳白/灰白主导
   *  斑块（40–65%）/ base = 灰褐基面（20–30% 次要 + 单元间基面）/ groove = 近黑
   *  沟端（5–10% 点缀）；**消费分工记档（非契约缺口）**：淡黄绿新皮露斑 / 薄片
   *  翘边亮斑缘 / 地图状边缘窄-中等过渡带 / 多色第四色 = 3b 材质侧；株内大梯度
   *  「上白下深」（s07 Verified 族内最强）= 3b 沿干高度梯度；**年龄三段序列（幼
   *  灰绿→斑驳→白）契约无槽承载位——缺口候选归族门**（bark 叶身份类槽间恒等，
   *  见模块头年龄皮色轴承载判定）。全组【叶身份：槽间恒等】。 */
  bark: {
    /** 斑块单元尺度域。Spec §5.1 **地图状不规则、大小混杂**（Verified 照片双问
     *  s07/s08——精确尺度两问分歧不承重）→ 工程推断 0.10–0.20 m（11.5 m 级干径
     *  0.3–0.5 m × 地图状大斑块域；探针复核）。【单元尺度域类 = 家族共性；域值 =
     *  工程推断（方向 Verified + 分歧不承重记档）】 */
    barkPlateMin: 0.1,
    barkPlateSpan: 0.1,
    /** 沟深强度。Spec §5.1 **表面近光滑紧贴、浮雕感弱**（Verified s07/s08——vs
     *  深沟裂型语言；斑块色差为主浮雕）→ 0.18 低端（族内最低：vs 雪松 0.45 /
     *  圆柏 0.55 / 水杉 0.68——第 17 语言弱浮雕区分锁；老树基部段浅纵裂归 3b
     *  沿位变化）。 */
    barkGrooveDepth: 0.18,
    /** 基色（单元间基面——灰褐/深灰褐次要色带 20–30%）。0x6f675c = 灰褐基面
     *  工程映射（s07/s08 Observed 灰褐/深灰褐端）。 */
    barkBaseColor: 0x6f675c,
    /** 单元顶色（乳白/灰白主导 40–65%——**白基调 identity 色**：远景白干 = 第一
     *  识别特征，M75 可辨性身份承重 Unknown ⑤）。0xd9d5c6 = 乳白灰白工程映射
     *  （s07/s08 Observed 浅白主导带）。 */
    barkPlateColor: 0xd9d5c6,
    /** 沟色（近黑小斑/节疤 5–10% 点缀 + 沟底深端）。0x342f29 = 近黑深端工程映射
     *  （s01/s02/s08 Observed 深灰黑斑）。 */
    barkGrooveColor: 0x342f29,
  },

  /** 风动两层**两成分**（3b 消费；**树高锚 = totalHeight 同源**——锚同步轮直读
   *  11.5 m 级〔判定 9：树高锚 = slot-0 同步轮 ~11–12 m 域〕，测试锚断言同步）。
   *  方向依据 = Spec §风动读向（**结构推导无直证 Inferred**）：粗硬短针束（5–10 cm
   *  惯量小）+ 细长斜展枝 → **整冠低频慢摆 + 末级枝/束高频小幅颤**（束颤小幅——
   *  硬针束惯量小读向；频率高于圆柏鳞枝档）。**顶梢成分不消费**（直立刚硬无点头
   *  ——族内可选·雪松消费位，零占位第三例〔水杉/圆柏/白皮松〕）。数值 = 工程设定
   *  （3b 定档回路开放）。全组【叶身份：槽间恒等】。 */
  wind: {
    windTierAmplitude: 0.02,
    windTierFrequency: 0.3,
    windFringeAmplitude: 0.014,
    windFringeFrequency: 2.4,
    windLeaderAmplitude: 0,
    windLeaderFrequency: 0,
  },

  /** 主干拓扑（径向 14 承载白斑驳 SDF 周向频率奈奎斯特域 + 近景圆度——11.5 m 级
   *  中档〔雪松 16.5/16 / 水杉 20/18 / 圆柏 8/12 之间〕；环段 13 与 11.5 m 树高
   *  级匹配〔≈0.88 m/环〕——白干 M75 身份承重取中高档）。【结构计数类：槽间
   *  恒等】；wander 0.020 = **通直至略弯**（中龄 Verified——介于圆柏 0.015 与
   *  老树 S 弯端之间）。 */
  trunk: { radial: 14, segs: 13, wander: 0.02 },

  /** 五级枝拓扑（L1 层枝 → L5 末级细枝——散生连续冠的逐级分瓦细长枝链；级数为
   *  实例口径）。radial/segs【结构计数类：槽间恒等】（沿族先例档——细枝疏散冠
   *  预算带）；wander/droop 连续：droop = **细长直伸-端部微垂链**（针硬挺 Verified
   *  [1][2]——低幅端近圆柏、末级 0.05；单调不降）；wander 主次分级（大枝较细长
   *  刚直 → 末级温和散乱 0.24）。数值工程设定（方向 Verified [1]）。 */
  levels: [
    { radial: 7, segs: 7, wander: 0.035, droop: 0 },
    { radial: 6, segs: 5, wander: 0.07, droop: 0.008 },
    { radial: 5, segs: 4, wander: 0.12, droop: 0.018 },
    { radial: 4, segs: 3, wander: 0.18, droop: 0.032 },
    { radial: 4, segs: 2, wander: 0.24, droop: 0.05 },
  ],

  /** 子枝挂点计划（L1→L2 … L4→L5 四过渡级，各 2 挂点〔侧枝 + 末位 1.0 延伸枝〕——
   *  L1–L5 = [20,40,80,160,320] 拓扑来源）。【结构计数类：槽间恒等】；ts 分布工程
   *  设定（**挂点前移 + 族校准外推带**——11.5 m 级开张疏散冠：侧枝自中外段展开
   *  → 束卡布满冠壳带 = 疏散冠的壳面覆盖，内膛透天由通道保护带自然露枝〔疏散
   *  身份读向〕）；phaseStep = **π 二分基步进**（散生方位均匀化的基步进 +
   *  crownAsymmetry 0.33 rng 抖动散布——判定 1「高度域连续散布 + 方位均匀化」的
   *  级内表达，圆柏同款；弧度口径）。 */
  childPlan: [
    { ts: [0.26, 1.0], phaseStep: Math.PI },
    { ts: [0.3, 1.0], phaseStep: Math.PI },
    { ts: [0.32, 1.0], phaseStep: Math.PI },
    { ts: [0.34, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 幼态宽塔组合（年龄轴幼端——皮色轴幼端〔幼灰绿〕由冠形端间接承载，bark
 * 槽间恒等）：Spec §3「**宽塔形**（幼-中龄金字塔）」（Verified [1][3]）+ §尺度锚
 * 中龄 0.7–1.0 的幼端收窄。组合：树高 8.5（槽轴下端——幼树个体）+ 冠幅 0.60（宽塔
 * 窄端——非水杉尖塔急收、宽塔=金字塔开张基底）+ 干高 0.26 + 膨大 1.06（幼树最弱）+
 * 层角整体上举（base 50 / top 25——幼树枝条斜上伸展端）+ 收顶比最低（0.40 急收
 * 塔端）+ 指数 1.30（塔形）+ 顶梢段占比最高（0.09 幼树顶梢主导强）+ 方位最规整
 * （asymmetry 0.28）+ 垂帘最短（fringe 1.08）+ 姿态刚直（wander ×~0.85）。
 */
const BUNGEANA_SLOT1_PROFILE: ConiferShapeProfile = {
  ...BUNGEANA_SLOT0_PROFILE,
  totalHeight: 8.5,
  crownWidthRatio: 0.6,
  trunkHeightRatio: 0.26,
  trunkTaperRatio: 0.28,
  trunkFlareRatio: 1.06,
  crownAsymmetry: 0.28,
  tierSpacingJitter: 0.44,
  tierAngleBase: 50,
  tierAngleTop: 25,
  tierAngleJitter: 6,
  tierRadiusTaper: 0.4,
  tierProfileExponent: 1.3,
  tierPlateArch: 0.05,
  tierEdgeDroop: 0.03,
  leaderLengthRatio: 0.09,
  fringeLengthRatio: 1.08,
  clusterInnerStartL5: 0.13,
  clusterInnerStartL4: 0.11,
  trunk: { radial: 14, segs: 13, wander: 0.016 },
  levels: [
    { radial: 7, segs: 7, wander: 0.03, droop: 0 },
    { radial: 6, segs: 5, wander: 0.06, droop: 0.006 },
    { radial: 5, segs: 4, wander: 0.1, droop: 0.014 },
    { radial: 4, segs: 3, wander: 0.15, droop: 0.026 },
    { radial: 4, segs: 2, wander: 0.2, droop: 0.04 },
  ],
};

/**
 * slot-2 老树伞形平顶组合（年龄轴老端——皮色轴白端由冠形端间接承载）：Spec §3
 * 「老树**伞形**（flat-topped with age）」+ §尺度锚 老树伞形端 >1.2（s02/s03 Observed
 * 开阔不对称伞状）。组合：树高 14（生产锚上端——老树大个体）+ 冠幅 1.25（伞形端
 * >1.2 外抛开阔）+ 干高 0.36（老树净干抬升端）+ 膨大 1.24（≤1.3 域内强端）+ 层角
 * 最平（base 80 下枝近水平 / top 55 顶平截开张——**伞形平顶端 = exp 0.90 <1 新端
 * 型首用** + taper 0.85 近等宽 + leader 0.04 顶梢最短）+ 拱起最高（0.10 伞骨上拱）+
 * 外缘下卷 0.06（伞缘微垂覆）+ 垂帘最长（1.16）+ 方位最散（0.38）+ 干形略弯端
 * （wander 0.026——通直至略弯老端；S 形扭曲极端态不进生产域）。
 */
const BUNGEANA_SLOT2_PROFILE: ConiferShapeProfile = {
  ...BUNGEANA_SLOT0_PROFILE,
  totalHeight: 14,
  crownWidthRatio: 1.25,
  trunkHeightRatio: 0.36,
  trunkTaperRatio: 0.32,
  trunkFlareRatio: 1.24,
  crownAsymmetry: 0.38,
  tierSpacingJitter: 0.54,
  tierAngleBase: 80,
  tierAngleTop: 55,
  tierAngleJitter: 9,
  tierRadiusTaper: 0.85,
  tierProfileExponent: 0.9,
  tierPlateArch: 0.1,
  tierEdgeDroop: 0.06,
  leaderLengthRatio: 0.04,
  fringeLengthRatio: 1.16,
  clusterInnerStartL5: 0.17,
  clusterInnerStartL4: 0.15,
  clusterMinSeparation: 0.03,
  trunk: { radial: 14, segs: 13, wander: 0.026 },
  levels: [
    { radial: 7, segs: 7, wander: 0.045, droop: 0 },
    { radial: 6, segs: 5, wander: 0.08, droop: 0.012 },
    { radial: 5, segs: 4, wander: 0.13, droop: 0.024 },
    { radial: 4, segs: 3, wander: 0.19, droop: 0.04 },
    { radial: 4, segs: 2, wander: 0.25, droop: 0.065 },
  ],
};

/**
 * slot-3 中老开张广卵组合（冠形谱系中老端）：Spec §3 中老**开张广卵圆 0.8–1.2**
 * （s03 Observed 卵圆-近圆 0.8–1.2）+ NC State rounded。组合：树高 12.5 + 冠幅
 * 1.00（中老带中值）+ 干高 0.33 + 膨大 1.18 + 层角放平（base 72 / top 42）+ 收顶
 * 比 0.68 + 指数 1.25（中下部宽展）+ 外缘下卷 0.05 + 垂帘 1.14。
 */
const BUNGEANA_SLOT3_PROFILE: ConiferShapeProfile = {
  ...BUNGEANA_SLOT0_PROFILE,
  totalHeight: 12.5,
  crownWidthRatio: 1.0,
  trunkHeightRatio: 0.33,
  trunkTaperRatio: 0.31,
  trunkFlareRatio: 1.18,
  crownAsymmetry: 0.35,
  tierSpacingJitter: 0.52,
  tierAngleBase: 72,
  tierAngleTop: 42,
  tierRadiusTaper: 0.68,
  tierProfileExponent: 1.25,
  tierPlateArch: 0.08,
  tierEdgeDroop: 0.05,
  leaderLengthRatio: 0.05,
  fringeLengthRatio: 1.14,
  clusterInnerStartL5: 0.16,
  clusterInnerStartL4: 0.14,
};

/**
 * slot-4 紧凑中小个体组合（开张度低 / 体量下端）：Spec §尺度锚园艺域 9–15 m 下段
 * + 中龄冠形域 0.7–1.0 收窄端个体（株间开张度变幅——Spec §6 冠形个体变差轴）。
 * 组合：树高 9.5（生产锚下段）+ 冠幅 0.72（中龄带窄端）+ 干高 0.27 + 膨大 1.12 +
 * 层角收窄上举（base 58 / top 32）+ 收顶比 0.50 + 指数 1.55（卵圆权重高）+ 垂帘
 * 1.10。
 */
const BUNGEANA_SLOT4_PROFILE: ConiferShapeProfile = {
  ...BUNGEANA_SLOT0_PROFILE,
  totalHeight: 9.5,
  crownWidthRatio: 0.72,
  trunkHeightRatio: 0.27,
  trunkTaperRatio: 0.28,
  trunkFlareRatio: 1.12,
  crownAsymmetry: 0.31,
  tierSpacingJitter: 0.48,
  tierAngleBase: 58,
  tierAngleTop: 32,
  tierAngleJitter: 7,
  tierRadiusTaper: 0.5,
  tierProfileExponent: 1.55,
  tierPlateArch: 0.06,
  tierEdgeDroop: 0.03,
  leaderLengthRatio: 0.07,
  fringeLengthRatio: 1.1,
  clusterInnerStartL5: 0.14,
  clusterInnerStartL4: 0.12,
};

/**
 * slot-5 偏冠组合（散生对的破缺）：一侧枝展显著强于对侧（Spec §6 开张冠个体变差
 * 方向 Inferred；幅度工程设定）。散生律下偏冠 = 对内强弱破缺 + 跨层同方位弱相干
 * （圆柏同构机制）：rank0 ×1.45 / rank1 ×0.78（对内破缺比 1.86），全 10 层同方位
 * → 质心稳定指向首方位。组合：asymmetry 0.42（全槽最散——偏冠+散生叠加）+ 冠幅
 * 0.88 容纳域 + 层角微扩（66–36）。其余维度贴标准（偏冠 = 方位维差异）。
 */
const BUNGEANA_SLOT5_PROFILE: ConiferShapeProfile = {
  ...BUNGEANA_SLOT0_PROFILE,
  totalHeight: 11,
  crownWidthRatio: 0.88,
  crownAsymmetry: 0.42,
  tierAngleBase: 66,
  tierAngleTop: 36,
  tierRankLength: [1.45, 0.78],
  tierRankRadius: [1.12, 0.9],
};

/**
 * slot-6 疏冠透天组合（疏端——疏散冠谱系的疏极）：Spec §3 **叶团半透光/疏松**
 * （4 整树照片 8 问全一致——族内第 4 种透光读向）的疏端个体。组合：canopyDensity
 * 0.80（**疏散身份下限锁**——判定 4 caveat 参数面落位：低于 0.80 即非本资产密度
 * 语言）+ 簇抑制升（**0.045**——族校准带同款疏端档 ≈ 基准 0.02 × 2）+ 簇外移
 * （0.19/0.17——外段受光集中）+ 冠幅 0.95（疏冠开阔端）+ 干高 0.32 + 层角放平
 * （70–40）+ 垂帘 1.10。
 */
const BUNGEANA_SLOT6_PROFILE: ConiferShapeProfile = {
  ...BUNGEANA_SLOT0_PROFILE,
  totalHeight: 10.5,
  crownWidthRatio: 0.95,
  trunkHeightRatio: 0.32,
  trunkFlareRatio: 1.14,
  crownAsymmetry: 0.36,
  tierAngleBase: 70,
  tierAngleTop: 40,
  canopyDensity: 0.8,
  clusterMinSeparation: 0.045,
  clusterInnerStartL5: 0.19,
  clusterInnerStartL4: 0.17,
  fringeLengthRatio: 1.1,
};

/**
 * slot-7 多干变体组合（**低位粗枝上举近似**——判定 1 多干双态的近似路径承载，
 * 见模块头评估记档）：s08 型低位分叉伞状（30–45% 高度分叉外张 40–70°——Observed
 * s08 + FRPS 近基多干佐证）的连续参数近似：**双低位主枝粗壮上举成双干观感** =
 * trunkHeightRatio 0.25（低位端——分叉观感起点低）+ tierAngleBase 48°（上举陡端
 * ——分叉外张 40–70° 的低位枝上举）+ rank 双强（长度 1.50/1.38 + 起径 1.40/1.28
 * ——双主枝均强化，非 slot-5 单侧破缺）+ 拱起 0.09（上举拱）+ 冠幅 1.05（伞状
 * 开张多干冠）+ 膨大 1.22（多干基共享盘）。真近基并立型（s01）= D31.2 候选归族
 * 门（不可承载，见模块头）。全槽结构计数恒等不破（纯连续参数组合）。
 */
const BUNGEANA_SLOT7_PROFILE: ConiferShapeProfile = {
  ...BUNGEANA_SLOT0_PROFILE,
  totalHeight: 10.5,
  crownWidthRatio: 1.05,
  trunkHeightRatio: 0.25,
  trunkFlareRatio: 1.22,
  crownAsymmetry: 0.36,
  tierAngleBase: 48,
  tierAngleTop: 30,
  tierRadiusTaper: 0.72,
  tierProfileExponent: 1.15,
  tierPlateArch: 0.09,
  tierEdgeDroop: 0.05,
  leaderLengthRatio: 0.05,
  fringeLengthRatio: 1.14,
  tierRankLength: [1.5, 1.38],
  tierRankRadius: [1.4, 1.28],
};

/**
 * 形态槽路由表：索引 = shapeSlot（八槽差量语法沿族先例——slot-1…7 以 slot-0 锚点
 * 为底展开定义；方向名仅为标签，槽身份 = 多维取值整体组合）。8 槽主轴覆盖（判定
 * 10 ⊂ Spec 域）：树高 8.5–14 ⊂ 8–15 主轴 × 冠形谱系（宽塔幼态 slot-1 ⊂ 0.55–0.65
 * ↔ 开张卵圆 slot-0 ∈ 0.80–0.90 ⊂ 中龄 0.7–1.0 ↔ 中老广卵 slot-3 ∈ 0.8–1.2 ↔
 * 伞形平顶老端 slot-2 >1.2）× 开张度 × 裸干 0.25–0.36 ⊂ 0.25–0.4 × **年龄皮色轴**
 * （幼灰绿→斑驳→白——**bark 槽间恒等无承载位，年龄读向由冠形谱系端承载 + 缺口
 * 候选归族门**，见模块头）× 多干轴（slot-7 近似变体）× 果量（全槽恒定低量点彩
 * ——账目组槽间恒等，量轴不展开）× 疏密轴（slot-6 疏端 0.80 ↔ 满基准）。**层数
 * 轴因结构计数类跨槽恒等不进槽差异**（全槽 tierCount 10——表观差异由层距/展幅
 * 连续参数承载，缺口候选归族门，三先例同位第三例记档）。**结构计数类**（tierCount
 * / tierBranchCount / trunk·levels radial·segs / childPlan / clustersL5·L4 /
 * longShootCardsL5·L4 / coneCandidates / tierRank* 数组长度）与**叶身份类**（束卡
 * 元素数与尺度域 / 散生单针零占位 / 球果组 / needleMaterial / bark / wind / 挂点
 * 语言位〔tierPhaseStagger·clusterAzimuthStep 双省略即散生 rng 语言〕）由差量展开
 * 继承**逐位恒等**（皮面数恒等 16884 与 rng 消费次数恒等的结构性保证）；槽差异
 * 全部落连续形态参数。morphSeed 路由见 assets/asset_tree_bungeana.asset（Step 3
 * 交付）。
 */
export const BUNGEANA_SHAPE_PROFILES: ConiferShapeProfile[] = [
  BUNGEANA_SLOT0_PROFILE,
  BUNGEANA_SLOT1_PROFILE,
  BUNGEANA_SLOT2_PROFILE,
  BUNGEANA_SLOT3_PROFILE,
  BUNGEANA_SLOT4_PROFILE,
  BUNGEANA_SLOT5_PROFILE,
  BUNGEANA_SLOT6_PROFILE,
  BUNGEANA_SLOT7_PROFILE,
];
