/**
 * runtime/procedural/tree/juniperus/juniperusShapeProfile —— 圆柏 shapeProfile 数值面
 * （T012.3 Step 2，针叶家族契约**第三实例化**——契约 = ../conifer/coniferShapeProfile
 * （ConiferShapeProfile **定稿 80 位**，012.2 转正；本任务定稿态增量消费、契约文件零
 * 触碰）。族内先例 = 雪松（012.1）/ 水杉（012.2）：槽组织 / 差量展开语法 / 三标注 /
 * 模块头纪律照抄其组织（八槽差量结构同构 metasequoia）。
 *
 * 职责：圆柏（Juniperus chinensis (L.) Ant.，柏科 Cupressaceae 刺柏属 Juniperus，
 *      常绿乔木、雌雄异株）枝干/冠层/器官/材质参数的**数值面**。全部数值依据
 *      docs/research/juniperus-reference.md（**Spec Version 1.1**，2026-09-29 落盘 +
 *      主代理采样终审通过——文字 8 锚逐位一致、照片 s01/s08 一致承重、s06 两点分歧
 *      处置记档）；逐字段标注【家族共性】（字段类 = 族内真实消费）/【本资产特有】
 *      （数值锚 / 本例消费路径）/【工程设定无现实基准】（工程设定不编造现实依据）
 *      + Evidence Status（Verified / Inferred / Observed / 工程设定）+ 消费差异标记
 *      〔消费 / 零值消费 / 不适用 / 退化消费〕。
 *
 * ── Step 1 判定记档 → 字段落位（T012.3 任务书，2026-09-29）──
 *   高度域连续散生骨架（无规则轮层）→ **层位字段退化消费**（判定 1：tierCount 密层
 *   + tierSpacingJitter 大 + tierGapBand 0 + rng 方位散布〔tierPhaseStagger /
 *   clusterAzimuthStep 双省略〕→ 近连续散生冠——退化值本文件记档，零契约新增）；
 *   枝角梯度（下 40–70°→上 20–40°，自垂直角）→ tierAngleBase/Top；柱/卵双冠轮廓
 *   （狭圆柱 0.2–0.3 上下近等宽 + 顶部钝圆收 ↔ 卵圆 0.4–0.6 中部最宽 ↔ 老树阔卵端
 *   0.7–0.9）→ tierRadiusTaper + tierProfileExponent 双槽轴；绳状鳞卡（第 3 叶语言：
 *   末级鳞叶小枝聚合系统）→ rosette* 主卡 + needleCardAspect* 绳状轮廓比；刺叶
 *   minority（二型叶消费路径 = 做，族内首例双叶型并存）→ needleCardLen* +
 *   longShootCards*（cedrus 散生针卡机制复用）；浆果状球果双熟度账目 → cone* 组
 *   （posHash 零 rng 账目归 3a 几何侧，koelreuteria 法）；树皮第 16 语言（灰-灰褐
 *   基调纵长条片剥落）→ bark 组；风动两成分（整冠低频小幅摆为主 + 末级细幅微颤；
 *   顶梢专路不消费——水杉同判第三例）→ wind 组 + leaderDroop 0；干基微膨 ≤×1.3 →
 *   trunkFlareRatio 低值端（水杉膨大字段的弱端消费）。
 *
 * ── 契约 80 位消费分类（定稿态增量消费记档，归族门素材）──
 *   全消费 64 ｜ 退化消费 4（tierCount / tierBranchCount / tierSpacingJitter /
 *   tierGapBand——层位量化骨架退化承载散生连续冠，见上）｜ 零值消费 4（leaderDroop /
 *   coneAxisColor / windLeaderAmplitude / windLeaderFrequency——语义不驱动的显式
 *   占位）｜ 不适用 8（tierPhaseStagger / clusterAzimuthStep〔散生 = rng 方位散布，
 *   双省略同雪松〕+ needleFaceContrast〔无两面色差，终审修正口径同雪松〕+ strobili
 *   组 5〔雄球花不做——春季物候窗特异，判定 5 明文〕）＝ 80。
 *   族内可选位第三数据点：needleCardLen* / longShootCards* / coneClassRatio /
 *   coneColorYoung/needleGlaucousBloom（雪松消费、水杉零值）**本例消费**；
 *   tierPhaseStagger/clusterAzimuthStep/needleFaceContrast/strobili（水杉消费）
 *   **本例省略**——定稿态消费谱系两例 → 三例，差异逐位见各字段注释。
 *
 * ── 结构裁定与预算推算（首版，Step 3 探针回调回路开放）──
 *   - 拓扑：tierCount 10 × tierBranchCount 2（散生 rng 方位）= 20 L1 层枝；
 *     childPlan [2,2,2,2] → L1–L5 = [20, 40, 80, 160, 320]；皮面基数 = trunk
 *     12×12×2 = 288 + L1 20×7×7×2 = 1960 + L2 40×6×5×2 = 2400 + L3 80×5×4×2 =
 *     3200 + L4 160×4×3×2 = 3840 + L5 320×4×2×2 = 5120 → **皮恒 16808**。
 *   - 卡账：绳卡标称位 = L5 320×12 + L4 160×8 = **5120**；刺卡标称位 = 320×2 +
 *     160×1 = **800**；交叉双卡 4 tri → 卡面标称 (5120+800)×4 = 23680。
 *   - High 预估 ≈ 16808 + 23680×存活(~0.70–0.85) + 浆果账目(~1–2K) ≈ **33–38K**
 *     ⊂ LOD 已锁 conifer 行 High ≤ 40000（待裁决位 2；**预估待 Step 3 探针复核定档**
 *     ——出带调簇密度或 suppression，计数类全槽同调不破恒等）。
 *   - **密度/卡尺度先验（T030 试行）**：簇 12/8 档 + 绳卡 0.18–0.30 m = metasequoia
 *     Step 4 校准终值带直采（012.2 亚像素教训后不再判「聚合单元例外」）；密实块状
 *     冠（90–95% 实心 Observed）预期 M25 冠带绿 ≥ 族终值带 33.0/34.3% 或略高——
 *     **初版显著低于带即疑点**（Unknown 留档，判定 10）。
 *   - **体量差记档**：圆柏生产锚 6–10 m（槽轴 4.5–10）显著低于水杉 18–25 / 雪松
 *     15–18——全部尺度锚（trunk segs / 卡绝对量级 / 风动锚）按本资产树高级重定，
 *     不沿用先例数值。
 *   - **层数轴不进槽差异**：tierCount 属结构计数类（改值即改皮面数与 rng 消费数）
 *     ——沿雪松/水杉先例处置：全槽恒等取 10，表观层密度差异由层距/展幅连续参数
 *     间接表达；层数轴槽间展开 = 契约缺口候选归族门（两先例已记同位缺口）。
 *
 * ── Unknown / 不消费记档（Spec 明示或判定 10 留档，工程不编造依据）──
 *   Unknown（Step 3/4 探针）：散生连续冠的 M25 冠带绿落带（密实块状冠 vs 终值带
 *   关系）；绳卡中距可辨性（细密纹理读向）；刺卡近景贡献（M8）；果点中距可见性
 *   （6–8 mm 亚像素——近景位为主中距点彩预期，判定 10）。
 *   不消费（工程占位零值，字段语义不驱动）：leaderDroop / coneAxisColor /
 *   windLeader*（顶梢专路 = 族内可选·雪松消费位，通直无点头第三例）；省略位 =
 *   tierPhaseStagger / clusterAzimuthStep / needleFaceContrast / strobili 整组
 *   （雄球花春窗物候不消费——Spec §7 明文）。
 *
 * ── 消费差异记档归族门（零阻塞——不动契约文件）──
 *   1. **刺叶比例轴缺连续位**：longShootCards* 为结构计数类（全槽恒等 2/1）——
 *      判定 9 的「幼态多刺 ↔ 成树鳞绝对主导」比例轴**无法以现有字段进槽差异**
 *      （无 needleKeepRatio 类连续位）；本任务以恒定低计数消费（双叶型身份全槽
 *      在位），年龄轴槽的刺叶比例差由幼尖塔/老树阔卵的形态读向间接暗示。缺口
 *      候选归族门：minority 叶型连续比例位。
 *   2. 浆果白霜层表达：coneColorMature 为果体表征色，霜粉高光/色相位归 3b 材质
 *      侧（判定 5「白粉霜层材质表达」）——非契约缺口，消费分工记档。
 *
 * 边界：圆柏资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_juniperus.asset，Step 3 交付）；
 *      比率字段以 totalHeight（形态参数域树高）为基；角度字段以度存、弧度算
 *      （本资产无 clusterAzimuthStep——省略位）；颜色字段为 sRGB hex（0xRRGGBB），
 *      3b 材质负责工作色域转换。
 */

import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：**开阔中龄狭圆柱型**（T012.3 Step 1 判定 9 +
 * Spec §尺度锚——三整树槽谱系中位偏上 + 身份读向最强型 + NC State 窄冠域）——
 * 树高 ≈8 m（生产锚 6–10 中值上段、西安槽 8–10 m 支持）、冠幅比 ≈0.28（狭圆柱
 * 0.2–0.3 带中值）、干高 ≈0.15（密冠贴地感）、干基微膨 ×1.15、密实连续柱冠
 * （tierCount 10 密层退化 + jitter 0.50 散布）、中龄定型相（幼尖塔 ↔ 老树阔卵
 * 年龄轴的中点）。结构计数类（tierCount / tierBranchCount / trunk·levels
 * radial·segs / childPlan / 簇位与刺卡计数 / cone 候选 / tierRank* 数组长度）与
 * 叶身份类（绳卡元素数与尺度域 / 刺卡长域 / 球果组 / needleMaterial / bark /
 * wind / 挂点语言位〔双省略即散生 rng 语言〕）全槽恒等；槽差异全部落连续形态参数。
 */
export const JUNIPERUS_SLOT0_PROFILE: ConiferShapeProfile = {
  // ── 体量与干形 ──
  /** Spec §尺度锚 **中龄公园生产锚树高 6–10 m**（Inferred [1][3]+s01–s03——显著低于
   *  雪松 15–18 / 水杉 18–25 骨架树量级，「体量差接受」成立）；slot-0 取 ≈8（西安
   *  狭圆柱槽 8–10 m 段支持 + 谱系中位偏上）。**同源风动树高锚**：3b 材质摆幅归一
   *  直读本字段（锚同步轮无独立锚值——测试锚断言同源）。【体量类字段 = 家族共性；
   *  锚值 = 本资产特有（Spec 尺度锚 Inferred）】〔消费〕 */
  totalHeight: 8,
  /** Spec §尺度锚 **冠幅比分型：狭圆柱 0.2–0.3 / 卵圆 0.4–0.6 / 阔卵老树端 0.7–0.9**
   *  （Verified 照片+园艺表 [3]+s01–s04）；slot-0 = 0.28（狭圆柱带中值——上下近等宽
   *  桶柱 s01）。8 槽带 0.22–0.80（幼尖塔窄 ↔ 老树阔卵端 + 冠形双型轴）。【字段 =
   *  家族共性；锚值 = 本资产特有（Spec 域 Verified）】〔消费〕 */
  crownWidthRatio: 0.28,
  /** Spec §尺度锚 **干高比 0.1–0.2**（下枝低着生、密冠贴地感——Inferred 照片
   *  s01–s03）；slot-0 = 0.15（域中值——密实低裸干冠）。判定 9 主轴域 0.1–0.25
   *  （老树端下枝平展净干抬升外推）。【字段 = 家族共性；锚值 = 本资产特有（Spec 域
   *  Inferred）】〔消费〕 */
  trunkHeightRatio: 0.15,
  /** 干顶径/基径。方向 = **主干通直**（三整树槽双问一致 + TSO 标本记录 Verified
   *  s01/s03/s04+[4]；古树扭曲极端态不进生产域）；数值 0.30 = 工程设定无现实基准
   *  （Spec 无干形锥度数值——通直干的缓收）。【字段 = 家族共性；值 = 工程设定】〔消费〕 */
  trunkTaperRatio: 0.3,
  /** 根部展宽（基径/胸径）——**干基常态或微膨 ≤×1.3**（Spec §干基：中龄公园个体
   *  常态或微膨、无显著板根——Inferred 照片弱读 s01–s03；水杉膨大字段的**低值端
   *  消费**，vs 水杉 ×1.5–2.0 强端）；slot-0 = 1.15（微膨中值）。8 槽带 1.05–1.28
   *  （幼弱 ↔ 老强年龄轴，全程 ≤1.3 域内）。【字段 = 家族共性（水杉提供强现实锚，
   *  圆柏消费弱端——谱系第三数据点）；锚值 = 本资产特有（Spec 域 Inferred）】〔消费〕 */
  trunkFlareRatio: 1.15,
  /** 散生冠的规整度载体（层内枝方位抖动幅度缩放）。方向 = **无规则轮生、不规则散生
   *  着生**（Spec §骨架 Verified s01–s03——vs 雪松近轮 / 水杉对生成对）→ 散布端
   *  高值 0.34（> 雪松 0.30 > 水杉 0.22——三例最散）；幅度 = 工程设定。【方位抖动
   *  机制 = 家族共性；幅度 = 工程设定（方向 Verified）】〔消费〕 */
  crownAsymmetry: 0.34,

  // ── 层结构（退化消费：高度域连续散生——无层冠的层位量化骨架承载）──
  /** 主层数。Spec §骨架「**无层状轮生结构**（不规则散生着生——连续密冠由此形成）」
   *  （Verified s01–s03——族内第三骨架型）；判定 1 退化消费路径：密层 10（密层预估
   *  带 8–12 中值）+ jitter 0.50 + tierGapBand 0 + rng 方位 → 层位量化退化为高度域
   *  连续散布的挂点骨架（8 m 树 × 10 层 ≈ 0.68 m 层距——远小于绳卡 0.18–0.30 尺度，
   *  表观无层）。绝对计数 Unknown → Inferred-工程待探针。【结构计数类：槽间恒等】；
   *  【层数轴不进槽差异——缺口候选归族门（沿两先例同位处置）】；【字段 = 家族共性；
   *  值 = 本资产特有（Spec 散生定性 Verified + 计数预估 Inferred 待探针）】〔退化消费〕 */
  tierCount: 10,
  /** 每层主枝数 = **2 散生枝/高度片**（rng 任意方位 + 大抖动——散生语言的层内实现；
   *  数值资产侧定：同计数下水杉语义 = 对生成对〔stagger+phaseStep 锁〕、圆柏语义 =
   *  随机方位散布〔双省略锁〕——方位律资产侧定的族内第三型）。3 枝/层预算超 High 带
   *  （30 L1 → 皮面 ≈25K 无卡余量）→ 取 2/层 + 密簇挂点承载密冠观感。【结构计数类：
   *  槽间恒等】；【字段 = 家族共性；值 = 工程设定（散生主律的定枝实现 + 预算裁定
   *  ——探针可全槽同调回调）】〔退化消费〕 */
  tierBranchCount: 2,
  /** 层位垂直抖动。方向 = **不规则散生**（"irregularly whorled" 域外——无轮生读向
   *  Verified s01–s03）；幅度 0.50 = **大抖动破层端**（退化消费第三杠杆——> 雪松
   *  0.18 / 水杉 0.26，层位读向被散布覆盖 → 近连续冠）。【字段 = 家族共性；值 =
   *  工程设定（方向 Verified + 退化消费记档）】〔退化消费〕 */
  tierSpacingJitter: 0.5,
  /** 层角梯度下端（最下层自垂直角）。Spec §骨架双问「**下部枝 40–50° 近平展、天津
   *  型下枝近水平 70–85°**」（Observed→任务裁定枝角带**下 40–70°**，自垂直角）；
   *  slot-0 = 55°（裁定带中值——斜展上举的主干姿）。【层角梯度机制 = 家族共性
   *  （ginkgo 角度梯度法第三次消费）；端值 = 本资产特有（Spec 照片域 Observed+
   *  裁定带）】〔消费〕 */
  tierAngleBase: 55,
  /** 层角梯度上端（最上层自垂直角）。Spec 双问「**上部枝 30–40° 上举贴干**」→
   *  裁定带**上 20–40°**；slot-0 = 30°（带中值——上举端）。【同上】〔消费〕 */
  tierAngleTop: 30,
  /** 层内枝角抖动。工程设定（散生非机械规整的散布；Spec 无度数——散生读向已由
   *  jitter/asymmetry 承载，本值为枝角微散）。【字段 = 家族共性；值 = 工程设定】〔消费〕 */
  tierAngleJitter: 7,
  /** 顶层枝长/底层枝长。**狭圆柱冠**（s01 西安型：上下近等宽桶柱 + 顶部钝圆收
   *  Observed）→ 0.85（近等宽端——vs 雪松 0.22 / 水杉 0.15 锥收端：**收顶比谱系
   *  第三极**，柱冠语言）；卵圆/阔卵槽降至 0.55–0.58（中部最宽）。【轮廓读向 =
   *  家族共性（Verified）；数值 = 本资产特有（Spec 照片域 Observed——柱型锚）】〔消费〕 */
  tierRadiusTaper: 0.85,
  /** 层半径沿高分布指数。**近柱体轮廓**（狭圆柱：半径沿高近常量 + 顶部钝圆）→
   *  1.20（近线性低段——vs 水杉密连续锥 1.35 / 雪松层叠尖塔更高段）；卵圆槽
   *  1.7–1.9（中下部最宽的卵形权重）。方向 = 冠形谱系 Verified [1]+s01–s03；
   *  数值 = 工程设定。【字段 = 家族共性；值 = 工程设定（方向 Verified）】〔消费〕 */
  tierProfileExponent: 1.2,
  /** 层板拱起。方向 = **大枝斜展上举**（FRPS 幼树「枝条通常斜上伸展」Verified [1]）
   *  ——弱拱 0.03（< 雪松升扇 0.10，近水杉 0.05）；幅度 = 工程。【层板轮廓机制 =
   *  家族共性；幅度 = 工程设定（方向 Verified）】〔消费〕 */
  tierPlateArch: 0.03,
  /** 层板外缘下卷。方向 = **小枝直伸、密实冠面**（鳞叶小枝紧密直伸 Verified [1][2]
   *  ——无垂帘/下垂读向）→ 弱 0.03；老树阔卵槽升 0.05（下枝平展端微垂覆）。【同上】〔消费〕 */
  tierEdgeDroop: 0.03,
  /** 层内枝 rank 长度乘子（2 枝 = 散生对——**跨层同方位势差弱**〔散生无相干律〕+
   *  近等基线；破缺即偏冠槽载体见 slot-5）。工程设定。【数组长度 = 结构计数类：槽间
   *  恒等；值 = 连续】〔消费〕 */
  tierRankLength: [1.05, 0.96],
  /** rank 起径乘子（与长度同向）。工程设定。【数组长度 = 结构计数类：槽间恒等】〔消费〕 */
  tierRankRadius: [1.04, 0.97],
  /** 层枝起径/主干挂点径。方向 = **密实冠由细枝密叶构成、大枝相对纤细**（密实度
   *  90–95% 实心 Observed s01–s04 的枝级读向 Inferred——近水杉 0.42 纤细端）；
   *  数值 0.36 = 工程设定。【字段 = 家族共性；值 = 工程设定（方向 Inferred）】〔消费〕 */
  tierBranchRadiusRatio: 0.36,
  /** 顶梢段长/树高。方向 = **顶部钝圆收**（狭圆柱冠顶 Observed s01）+ 主干通直
   *  延伸；段长占比 0.06 = 工程设定（钝圆顶的干顶延伸——通直无点头）；幼尖塔槽
   *  升 0.10（尖塔顶梢主导强）。【字段 = 家族共性；值 = 工程设定（方向 Observed）】〔消费〕 */
  leaderLengthRatio: 0.06,
  /** 顶梢下垂强度。**零值消费占位 0**（判定 8：主干通直无点头——顶梢专路 = 族内
   *  可选·雪松消费位，水杉同判第三例）。【族内可选·雪松消费】〔零值消费〕 */
  leaderDroop: 0,
  /** 相邻主层方位交错角。**省略**（判定 1：散生 = rng 任意方位〔雪松近轮散布同款
   *  省略〕——无对生交错的层间律）。【挂点语言身份：槽间恒等】【族内可选·水杉
   *  消费——本例省略】〔不适用〕 */
  // tierPhaseStagger: 省略

  // ── 绳状鳞卡挂点（第 3 叶语言：末级鳞叶小枝聚合系统）+ 刺叶 minority ──
  /** 绳卡 SDF 叶元素数（中轴枝段 + 对生贴生鳞叶轮廓的并集抽象）。Spec §结构层级：
   *  末级鳞叶小枝**绳状/corded 聚合**自成叶化单元（Verified [1][2]+s06/s02——非
   *  羽状、非平铺喷雾）；真鳞叶列距 2.5–5 mm × 卡长 0.18–0.30 → 真列数 36–120 →
   *  SDF 抽象 24（相邻 2–4 对合并为绳状单元；真叶 mm 级由 SDF 内部纹理承载——
   *  元素物理尺度不求近真，绳状聚合语言 vs 水杉羽列近真语言）。LOD 降档 = 递减
   *  派生归 3b（24/14/8——冻结单）。【叶身份：槽间恒等】；【字段 = 家族共性（主卡
   *  SDF 叶元素数）；值 = 本资产特有（Spec 列距算术 Inferred + 绳状语言工程抽象）】〔消费〕 */
  rosetteNeedles: 24,
  /** 绳卡尺度域（米，min + rng×span）。**密度校准 2026-09-29（Step 4）：0.18–0.30 →
   *  0.24–0.34**——8m 级小树 + 预算 40K 硬顶下，同簇量在中距投影的覆盖空洞无法
   *  靠密度填补（模拟实测 47% 结构上限——簇挂枝上的骨架约束）；卡长上移至雪松
   *  ≥0.3m 实证带量级（012.1 中距面质量先例——均值 0.29 ≈ 雪松带）→ 单卡投影
   *  +21%。近景取舍沿 012.2 同款：单卡大于实物末级小枝（5–15cm），中距「绳状
   *  细密质感」由 SDF 内部 24/14/8 绳列密度承载（密度不随卡尺度稀释）。
   *  【卡尺度域类 = 家族共性；绝对量级 = 本资产特有（雪松实证带 + 012.2 亚像素
   *  教训 + 本轮校准记档）】〔消费〕 */
  rosetteCardMin: 0.24,
  rosetteCardSpan: 0.08,
  /** 散生单针卡（刺叶 minority）长域（米，min–span rng 抽样——二型叶的刺叶侧：
   *  判定 3 消费路径 = **做**，族内首例双叶型并存；复用 cedrus 散生针卡机制〔sin
   *  单针包络〕挂幼态梢/旺枝位）。真刺叶 6–12 mm（Verified [1][2]）× 聚合映射 →
   *  0.12–0.20 m（近景身份细节位——判定 3 明文「中景无质量贡献」，亚像素豁免记档：
   *  刺卡非中距质量单元、与绳卡 0.18–0.30 主卡带不同轨）。【叶身份：槽间恒等】；
   *  【族内可选·雪松消费——**本例消费（第二消费者，定稿态第三数据点）**】；
   *  【值 = 本资产特有（Spec 刺叶尺寸 Verified × 近景聚合工程映射）】〔消费〕 */
  needleCardLenMin: 0.12,
  needleCardLenSpan: 0.08,
  /** 绳卡轮廓长宽比域（绳状/corded 细长轮廓）。真末级小枝径 1–1.2 mm × 小枝长
   *  5–15 cm → 真长径比极细（~40–100）由 SDF 内部承载；卡轮廓比 = 聚合单元侧影。
   *  **密度校准 2026-09-29：2.6–4.2 → 2.0–3.2**（Step 4 校准：M25 渲染实测绳卡
   *  宽向 2–4.6px 亚像素 SDF 绳隙经 alphaToCoverage 折损大半〔树区 71% mask 像素
   *  = 天色调淡染〕——卡幅加宽 30% 同时提高 SDF 绳列中距占空〔校准实测：加宽
   *  后绿/剪影 27% → 36%〕；下限 2.0 与水杉 1.8–2.6 上段重叠但全域仍 ≥ 水杉
   *  中值 = 细长读向次序保持）【字段 = 家族共性（叶卡轮廓比域）；域值 = 本资产
   *  特有（Spec 小枝径 Verified + 绳状轮廓工程映射 Inferred + 校准记档）】〔消费〕 */
  needleCardAspectMin: 2.0,
  needleCardAspectSpan: 1.2,
  /** 绳卡挂点位（末两级 L5/L4 每枝）。**密度校准 2026-09-29**：12/8 → **13/9**
   *  （标称 5126 → 5570 位——M25 同式窗口绿 13.6% 的密度补充，预算带内全槽同调
   *  +8.3%；slot-2 老树阔卵同步抑制 0.035 保 High ≤40000）。【结构计数类：槽间
   *  恒等】【工程设定——挂点采样计划位（族终值带起步，校准回调）】〔消费〕 */
  clustersL5: 13,
  clustersL4: 9,
  /** 散生刺卡数（L5/L4 逐枝固定计数——rng 无条件消费；刺叶 minority 密度：绳卡
   *  12/8 的 ~1/6–1/8——幼态梢/旺枝位的近景细节量级，判定 3 比例位）。【结构计数类：
   *  槽间恒等】【族内可选·雪松消费——**本例消费（第二消费者）**】；【值 = 工程设定
   *  （minority 比例的定档——**比例轴缺口记档归族门**：计数类恒等 → 幼态↔成树比例
   *  差不进槽差异，见模块头）】〔消费〕 */
  longShootCardsL5: 2,
  longShootCardsL4: 1,
  /** 簇挂点 t 域下限。工程设定（**挂点前移杠杆 ✓**——三杠杆之三：密实冠自枝基部
   *  布满〔密冠贴地感 Observed s01–s03〕；雪松校准实证直承，较水杉更前移）。〔消费〕 */
  clusterInnerStartL5: 0.14,
  clusterInnerStartL4: 0.12,
  /** 簇级显式剔除抑制。**族校准带直采**：metasequoia Step 4 同步值 0.02（新簇半径
   *  0.09–0.15 口径的近重合去重档——同卡尺度带直采；重叠由交叉双卡随机滚转吸收
   *  〔**交叉双卡 ✓** 三杠杆之二继承〕）。【工程设定——管线抑制位】〔消费〕 */
  clusterMinSeparation: 0.02,
  /** 末级枝长加长乘子。方向 = **鳞叶小枝紧密直伸**（"直伸而紧密" Verified [1][2]
   *  ——无下垂段加长读向）→ 近平 1.12（三例最短：vs 水杉轻垂 1.15 / 雪松垂帘更重；
   *  **密度校准 2026-09-29：1.08 → 1.12**——末级绳列散开联动）；老树阔卵槽 1.16
   *  （下枝平展端）。【垂帘机制 = 家族共性；乘子 = 工程设定（方向 Verified）】〔消费〕 */
  fringeLengthRatio: 1.12,
  /** 基准密度乘子（slot-0 = 1.0 满基准；密实身份——疏密轴全槽带 0.85–1.0，密实
   *  90–95% Observed 的参数面投影）。【密度乘子类 = 家族共性；基调 = 工程设定】〔消费〕 */
  canopyDensity: 1.0,
  /** 层隙观感带。**零端消费 0**（判定 1：**密实无层连续冠**——冠体连续无层隙 90–95%
   *  实心 Observed s01–s04；零端 = 簇布点连续分布无层间空带——退化消费第四杠杆，
   *  与水杉密连续锥同零端〔消费差异即转正素材的第三数据点〕）。【字段 = 家族共性
   *  （水杉/圆柏零端）；值 = 本资产特有（Spec 密冠读向 Observed+判定 1）】〔退化消费〕 */
  tierGapBand: 0,
  /** 簇挂点方位步进。**省略**（判定 1：散生 = rng 方位散布〔雪松同款省略〕——无
   *  对生交错叶序挂点律）。【挂点语言身份：槽间恒等】【族内可选·水杉消费——本例
   *  省略】〔不适用〕 */
  // clusterAzimuthStep: 省略

  // ── 浆果状球果账目（双熟度双色果 + 白霜——判定 5 改写）──
  /** 结果枝带起点 t。方向 = **小枝腋生/节间散生或 2–4 枚簇、短柄**（Verified
   *  [1][2]+s07/s08：腋生节间簇生、散生 2–5 cm 间距）→ 结果带较水杉外段顶生更
   *  靠内散布（t ≥ 0.58 的中外段枝位为结果候选；值工程映射）。【叶身份：槽间恒等
   *  （账位语言）】〔消费〕 */
  coneFruitingZone: 0.58,
  /** 每结果位候选果数。方向 = **2–4 枚小簇**（Verified s07/s08）→ 候选 3（簇中值）
   *  + 存活过滤（**posHash 零 rng 账目〔koelreuteria 法〕归 3a 几何侧**——判定 5
   *  实现路径记档；本字段为每位候选计数）。【结构计数类：槽间恒等】；【账目机制 =
   *  家族共性；候选值 = 本资产特有（Spec 簇生读向 Verified）】〔消费〕 */
  coneCandidates: 3,
  /** 候选存活比例。全冠量级 = Spec §5.2 **中量-较多**（12 月枝段 20+ 果大量宿存
   *  s07 Observed——族内第三档位：雪松如烛正向 / 水杉轻量 0.30 / 圆柏中量多果）
   *  的定档载体：keep 0.55。【叶身份侧：槽间恒等】；【值 = 工程设定（Observed 量级
   *  的工程落位，Step 3 探针复核）】〔消费〕 */
  coneKeepRatio: 0.55,
  /** 球果尺度域（米）。Spec **近圆球形、径 6–8 mm**（Verified [1][2]；FoC 4–9 mm
   *  域）×1 近真 → 0.006–0.008 ⊂ 域（中距亚像素——近景位为主中距点彩预期，判定
   *  10 Unknown 留档）。【叶身份：槽间恒等】；【尺寸域 = 本资产特有（Spec Verified
   *  ×1 映射）】〔消费〕 */
  coneSizeMin: 0.006,
  coneSizeSpan: 0.002,
  /** 两类果并存比（将熟果占比）。**消费**（判定 5：**两年熟 → 当年绿幼果 + 翌年
   *  暗褐/蓝黑霜果同树同枝并存**〔s08 双问直证：green immature + frosted blue 同
   *  枝〕；s07 色构成 暗蓝紫 70–80% + 霜蓝 15–20% + 绿 5% Observed）→ 0.75（霜熟
   *  果主导端）。【叶身份：槽间恒等】【族内可选·雪松消费——**本例消费（第二消费
   *  者，翌年熟时窗错位同型语义——定稿态第三数据点）**】；【值 = 本资产特有（Spec
   *  两年熟 Verified + 照片色构成 Observed 的工程落位）】〔消费〕 */
  coneClassRatio: 0.75,
  /** 主类果表征色（翌年霜熟果）。Spec **熟时暗褐色被白粉**（Verified [1][2]）+
   *  照片**暗蓝紫基调带白霜**（s07/s08 Observed：暗蓝紫 70–80% + 霜蓝高光）→
   *  0x3a3b52 = 暗蓝紫褐果体表征（**白粉霜层材质表达归 3b**——高光/色相位，判定
   *  5 分工记档）。【叶身份：槽间恒等】；【表征色语义 = 家族共性（主类果色）；色值
   *  = 本资产特有（Spec Verified+Observed）】〔消费〕 */
  coneColorMature: 0x3a3b52,
  /** 次类果色（当年绿幼果）。Spec/s08 **绿幼果与霜熟果并存**（green immature
   *  Observed）→ 0x5d7a48 = 绿幼果表征。【叶身份：槽间恒等】【族内可选·雪松消费
   *  ——**本例消费（第二消费者）**】；【色值 = 本资产特有（Observed 绿端）】〔消费〕 */
  coneColorYoung: 0x5d7a48,
  /** 宿存中轴色。**零值消费占位**（浆果状肉质果**不开裂整果脱落**〔Verified [1][5]
   *  差分③〕——无种鳞散落中轴暴露相；族内可选·雪松消费位，占位色）。【族内可选·
   *  雪松消费】〔零值消费〕 */
  coneAxisColor: 0x4a4438,
  /** 雄（花粉）球花第二器官账目。**省略整组**（判定 5：**雄球花不做**——春季物候
   *  窗特异、主语境 9 月末不消费，Spec §7 明文；雌雄异株果实账目按雌株锚记档
   *  Constraints）。【族内可选·水杉消费——本例省略】〔不适用〕 */
  // strobili: 省略

  /** 针叶色材质参数（3b 消费；**无两面色差**——终审修正口径：鳞叶无两面差语句、
   *  刺叶白粉带为上面特征不迁移〔族内第三数据点：圆柏=无（同雪松）、异于水杉温和
   *  差〕；needleFaceContrast 省略即「无两面差」语义）。全组【叶身份：槽间恒等】。 */
  needleMaterial: {
    /** 受光面（阳面）叶色。Spec §5.1 **深绿—暗绿/蓝绿域带灰蓝霜调**（NC dark green
     *  Verified [3] + s01–s04 Observed）+ **阳面灰绿亮/阴面深绿暗受光色差为主律**
     *  （s02 双读一致 Observed）；色值 0x64785e = 灰绿亮端工程映射（受光 ramp
     *  同源——判定 7）。 */
    needleColorSun: 0x64785e,
    /** 荫面叶色（深绿暗端——受光色差 ramp 的暗端）。0x2f4230 = 深绿暗工程映射
     *  （s01–s04 Observed 深绿/暗蓝绿）。 */
    needleColorShade: 0x2f4230,
    /** 白粉强度。**消费（弱档）**：整冠**灰蓝霜调**（s01–s04 Observed——深绿带灰
     *  蓝霜调读向）+ 刺叶上面**两条白粉带**（Verified [1][2]——远看灰绿两调来源）
     *  的工程映射 → 0.15 弱档（vs 雪松银灰粉调强端）。【族内可选·雪松消费——**本例
     *  消费（第二消费者，弱档谱系第三数据点）**】；【值 = 工程设定（Observed 霜调
     *  读向的弱档落位）】。 */
    needleGlaucousBloom: 0.15,
    /** 叶龄梯度强度。Spec §5.1/s08 **新梢黄绿-灰绿 → 深绿渐变**（s08 Observed：
     *  鳞叶黄绿→深绿渐变直证）的域内梯度（非季相语义——常绿无季相证据不建卡，
     *  待裁决位 4）；强度 0.22 = 工程（较水杉 0.15 强——直证梯度）。【字段 = 家族
     *  共性；值 = 工程设定（方向 Observed）】。 */
    needleJuvenility: 0.22,
    /** 两面色差强度。**省略**（判定 7：**无两面色差**——终审修正口径按文献消费
     *  〔同雪松辐射着生语义〕；族内可选·水杉消费位，本例省略）。【族内可选·水杉
     *  消费——本例省略】〔不适用〕 */
    // needleFaceContrast: 省略
  },

  /** 树皮材质参数（3b 消费——**第 16 语言：灰-灰褐基调纵长条片剥落**（判定 6；vs
   *  水杉第 15 红褐基调长条片纤维剥落——同为条片轴、色相轴区分；vs 雪松第 14 鳞状
   *  方块片）。条片机制沿用第 15 语言（长宽比/脊沟比/翘边浮雕 SDF 归材质侧）+ 色相
   *  轴换灰-灰褐；枝皮灰长纤维条剥高位门控归 3b。全组【叶身份：槽间恒等】。 */
  bark: {
    /** 条片单元长域。Spec §5.3 FRPS「树皮深灰色，纵裂，**成条片开裂**」（Verified
     *  [1]）+ s04/s02 双问 纵长条裂、条片状剥落 Observed——无长度数值 → 工程推断
     *  0.08–0.16 m（8 m 级树干〔较水杉 20 m 级 ×0.12–0.22 按干径等比收〕；探针
     *  复核）。【单元尺度域类 = 家族共性；域值 = 工程推断（方向 Verified + 记档）】 */
    barkPlateMin: 0.08,
    barkPlateSpan: 0.08,
    /** 沟深强度。s04/s02 双问 **沟脊条状纵走、浮雕感中深**（Observed——介于雪松
     *  浅-中 0.45 与水杉深索 0.68 之间）；0.55 = 中深端工程映射。 */
    barkGrooveDepth: 0.55,
    /** 基色（深灰基调——FRPS「树皮深灰色」Verified [1] 的单元间基面）。0x595955 =
     *  深灰工程映射（灰-灰褐谱系的灰端）。 */
    barkBaseColor: 0x595955,
    /** 单元顶色（脊顶风化灰褐——s04/s02 Observed 灰褐/暗褐基调）。0x786f60 = 灰褐
     *  脊顶工程映射。 */
    barkPlateColor: 0x786f60,
    /** 沟色（沟底暗褐深端——s04/s02 Observed）。0x33302b = 暗褐沟底工程映射
     *  （三色 R≥G≥B 灰-灰褐读向——无水杉红褐基调，第 16 语言色相区分锁）。 */
    barkGrooveColor: 0x33302b,
  },

  /** 风动两层**两成分**（3b 消费；**树高锚 = totalHeight 同源**——锚同步轮直读 8
   *  级〔判定 8：树高锚换 6–10 m 同步轮〕，测试锚断言同步）。方向依据 = Spec §风动
   *  读向（**结构推断无直证 Inferred**）：密实圆柱/卵圆连续冠体 + 硬质鳞叶绳状小枝
   *  → **整冠低频小幅摆为主成分** + 末级鳞叶枝细幅微颤（幅度小于水杉羽状单元、
   *  频率低于其高频细颤——密实质量体读向）。**顶梢成分不消费**（通直无点头——
   *  族内可选·雪松消费位，零占位第三例）。数值 = 工程设定（3b 定档回路开放）。
   *  全组【叶身份：槽间恒等】。 */
  wind: {
    windTierAmplitude: 0.022,
    windTierFrequency: 0.3,
    windFringeAmplitude: 0.018,
    windFringeFrequency: 1.9,
    windLeaderAmplitude: 0,
    windLeaderFrequency: 0,
  },

  /** 主干拓扑（径向 12 承载条片 SDF 周向频率奈奎斯特域 + 近景圆度——8 m 级细干
   *  〔vs 水杉 14/20 m 级〕；环段 12 与 8 m 树高级匹配〔雪松 16.5/16、水杉 20/18
   *  的等比下推——≈0.67 m/环与层距 0.68 m 对齐〕）。【结构计数类：槽间恒等】；
   *  wander 0.015 = **主干通直**（三整树槽双问一致 Observed——三例最低）。 */
  trunk: { radial: 12, segs: 12, wander: 0.015 },

  /** 五级枝拓扑（L1 层枝 → L5 末级细枝——散生连续冠的逐级分瓦密枝；级数为实例
   *  口径）。radial/segs【结构计数类：槽间恒等】（沿族先例档——细枝密冠预算带）；
   *  wander/droop 连续：droop = **紧密直伸链**（鳞叶小枝紧密直伸 Verified [1][2]
   *  ——三例最低幅：L5 0.06 « 水杉轻垂 0.26 « 雪松垂帘；单调不降）；wander 主次
   *  分级（小枝直或稍弧曲 Verified——末级 0.26 温和散乱端）。数值工程设定（方向
   *  Verified [1][2]）。 */
  levels: [
    { radial: 7, segs: 7, wander: 0.045, droop: 0 },
    { radial: 6, segs: 5, wander: 0.08, droop: 0.01 },
    { radial: 5, segs: 4, wander: 0.13, droop: 0.02 },
    { radial: 4, segs: 3, wander: 0.19, droop: 0.04 },
    { radial: 4, segs: 2, wander: 0.26, droop: 0.06 },
  ],

  /** 子枝挂点计划（L1→L2 … L4→L5 四过渡级，各 2 挂点〔侧枝 + 末位 1.0 延伸枝〕——
   *  L1–L5 = [20,40,80,160,320] 拓扑来源）。【结构计数类：槽间恒等】；ts 分布工程
   *  设定（**挂点前移 + 密度校准 2026-09-29 外推 [0.24,0.26,0.26,0.3] → [0.28,0.32,
   *  0.32,0.34]**——8m 级小树枝链短，侧枝自内段发出时子链末端滞留冠内〔簇心
   *  r<0.45 占 64%、外壳 r>0.9 仅 3.4%——透天主因〕；外推后子链自中外段展开 →
   *  簇布满冠壳带 = 密实块状冠的壳面覆盖，内膛由通道保护带自然露枝〔外推幅度
   *  0.36/0.38 档实测过度放大阔卵槽顶带簇幅——卵形分化断言回调至带内〕）；
   *  phaseStep = **π 二分基步进**（散生方位均匀化的基步进 + crownAsymmetry 0.34
   *  rng 抖动散布——判定 1「高度域连续散布 + 方位均匀化」的级内表达；弧度口径）。 */
  childPlan: [
    { ts: [0.28, 1.0], phaseStep: Math.PI },
    { ts: [0.32, 1.0], phaseStep: Math.PI },
    { ts: [0.32, 1.0], phaseStep: Math.PI },
    { ts: [0.34, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 幼尖塔组合（年龄轴幼端）：Spec §3「**幼树的枝条通常斜上伸展，形成尖塔形
 * 树冠**」（Verified [1]）+ 判定 9 年龄轴端点。组合：树高 4.5（槽轴下端——幼树
 * 个体）+ 冠幅 0.22（极窄端）+ 干高 0.10（幼树下枝极低/枝到地——密冠贴地感端）+
 * 膨大 1.05（幼树最弱）+ 层角整体上举（base 45 / top 24——幼树枝条斜上伸展）+
 * 收顶比最低（0.45 急收尖塔端）+ 收顶指数升（1.5）+ 顶梢段占比最高（0.10 幼树
 * 顶梢主导强）+ 方位最规整（asymmetry 0.26）+ 垂帘最短（fringe 1.04）+ 姿态刚直
 * （wander ×~0.87）。**幼态多刺端**（判定 9 刺叶比例轴幼端——longShootCards 计数
 * 类恒等，比例差不进槽差异：缺口记档归族门，见模块头）。
 */
const JUNIPERUS_SLOT1_PROFILE: ConiferShapeProfile = {
  ...JUNIPERUS_SLOT0_PROFILE,
  totalHeight: 4.5,
  crownWidthRatio: 0.22,
  trunkHeightRatio: 0.1,
  trunkTaperRatio: 0.26,
  trunkFlareRatio: 1.05,
  crownAsymmetry: 0.26,
  tierSpacingJitter: 0.4,
  tierAngleBase: 45,
  tierAngleTop: 24,
  tierAngleJitter: 5,
  tierRadiusTaper: 0.45,
  tierProfileExponent: 1.5,
  tierPlateArch: 0.02,
  tierEdgeDroop: 0.02,
  leaderLengthRatio: 0.1,
  fringeLengthRatio: 1.04,
  clusterInnerStartL5: 0.12,
  clusterInnerStartL4: 0.1,
  trunk: { radial: 12, segs: 12, wander: 0.013 },
  levels: [
    { radial: 7, segs: 7, wander: 0.04, droop: 0 },
    { radial: 6, segs: 5, wander: 0.07, droop: 0 },
    { radial: 5, segs: 4, wander: 0.11, droop: 0.01 },
    { radial: 4, segs: 3, wander: 0.17, droop: 0.02 },
    { radial: 4, segs: 2, wander: 0.23, droop: 0.04 },
  ],
};

/**
 * slot-2 老树阔卵组合（年龄轴老端）：Spec §3「**老则下部大枝平展，形成广圆形的
 * 树冠**」（Verified [1]）+ §6 阔卵/广圆老树端 0.7–0.9（s03 天津型 Observed：5–6 m、
 * c/w 0.7–0.9、下枝近水平 70–85°）。组合：树高 10（生产锚上端——老树大个体）+
 * 冠幅 0.80（阔卵老树端）+ 干高 0.22（下枝平展净干抬升）+ 膨大 1.28（微膨强端，
 * ≤1.3 域内）+ 层角最平（base 70 / top 38——下部大枝平展）+ 收顶指数最高（1.9
 * 中下部最宽的卵形权重）+ 外缘下卷 0.05（平展端微垂覆）+ 垂帘 1.16 + 顶梢段占比
 * 最低（0.04）+ 方位最散（asymmetry 0.38）。
 */
const JUNIPERUS_SLOT2_PROFILE: ConiferShapeProfile = {
  ...JUNIPERUS_SLOT0_PROFILE,
  totalHeight: 10,
  crownWidthRatio: 0.8,
  trunkHeightRatio: 0.22,
  trunkTaperRatio: 0.34,
  trunkFlareRatio: 1.28,
  crownAsymmetry: 0.38,
  tierSpacingJitter: 0.46,
  tierAngleBase: 70,
  tierAngleTop: 28,
  tierAngleJitter: 8,
  tierRadiusTaper: 0.55,
  tierProfileExponent: 1.9,
  tierPlateArch: 0.05,
  tierEdgeDroop: 0.05,
  leaderLengthRatio: 0.04,
  fringeLengthRatio: 1.16,
  clusterInnerStartL5: 0.18,
  clusterInnerStartL4: 0.16,
  /** 密度校准 2026-09-29：全槽簇 12/8 → 13/9 后 slot-2 独有抑制微升（0.02 →
   *  0.035）——阔卵冠存活簇全槽最高的预算适配（High 压回 ≤40000；密度乘子
   *  canopyDensity 不动 = 密实身份语义不变） */
  clusterMinSeparation: 0.035,
  trunk: { radial: 12, segs: 12, wander: 0.018 },
  levels: [
    { radial: 7, segs: 7, wander: 0.05, droop: 0 },
    { radial: 6, segs: 5, wander: 0.09, droop: 0.01 },
    { radial: 5, segs: 4, wander: 0.14, droop: 0.03 },
    { radial: 4, segs: 3, wander: 0.21, droop: 0.05 },
    { radial: 4, segs: 2, wander: 0.29, droop: 0.08 },
  ],
};

/**
 * slot-3 卵圆中龄组合（冠形双型轴之卵圆端）：Spec §3 中龄个体三型之**卵圆型**
 * （s02 上海型 Observed：4.5–6 × 3–4 m、阔卵密冠、下枝近水平→上部上举）+ §尺度锚
 * 卵圆 0.4–0.6（Verified）。组合：树高 5.5（沪型主体段）+ 冠幅 0.50（卵圆带中值）+
 * 干高 0.12（下枝低）+ 膨大 1.10 + 层角放平（base 60 / top 32）+ 收顶比 0.55 +
 * 收顶指数 1.7（中部最宽）+ 外缘下卷 0.04 + 垂帘 1.10。
 */
const JUNIPERUS_SLOT3_PROFILE: ConiferShapeProfile = {
  ...JUNIPERUS_SLOT0_PROFILE,
  totalHeight: 5.5,
  crownWidthRatio: 0.5,
  trunkHeightRatio: 0.12,
  trunkFlareRatio: 1.1,
  crownAsymmetry: 0.35,
  tierSpacingJitter: 0.52,
  tierAngleBase: 60,
  tierAngleTop: 32,
  tierRadiusTaper: 0.55,
  tierProfileExponent: 1.7,
  tierEdgeDroop: 0.04,
  leaderLengthRatio: 0.05,
  fringeLengthRatio: 1.1,
};

/**
 * slot-4 高狭圆柱组合（体量上端窄柱）：Spec §3 三型之**狭圆柱型**高个体（s01 西安
 * 型 Observed：8–10 m、上下近等宽桶柱、密实 95%）+ NC State 窄冠域（10–20 ft 宽
 * 域窄段 Verified [3]）。组合：树高 9.5（西安段上端）+ 冠幅 0.24（窄柱带）+ 干高
 * 0.18 + 膨大 1.12 + 层角收角上举（base 50 / top 28）+ 收顶比最高（0.90 近等宽
 * 桶柱端）+ 收顶指数最低（1.1 近柱体）。
 */
const JUNIPERUS_SLOT4_PROFILE: ConiferShapeProfile = {
  ...JUNIPERUS_SLOT0_PROFILE,
  totalHeight: 9.5,
  crownWidthRatio: 0.24,
  trunkHeightRatio: 0.18,
  trunkTaperRatio: 0.28,
  trunkFlareRatio: 1.12,
  crownAsymmetry: 0.32,
  tierAngleBase: 50,
  tierAngleTop: 28,
  tierRadiusTaper: 0.9,
  tierProfileExponent: 1.1,
  leaderLengthRatio: 0.05,
};

/**
 * slot-5 偏冠组合（散生对的破缺）：一侧枝展显著强于对侧（冠形个体开张幅度——
 * Spec §6 方向采信 Inferred；幅度工程设定）。散生律下偏冠 = **对内强弱破缺 + 跨层
 * 同方位弱相干**（vs 雪松环内 rank 势差机制同构、弱于水杉对生相干）：rank0 ×1.50 /
 * rank1 ×0.72（对内破缺比 2.08），全 10 层同方位 → 质心稳定指向首方位。组合：
 * asymmetry 0.44（全槽最散——偏冠+散生叠加）+ 冠幅 0.32 容纳域 + 层角微扩
 * （57–31）。其余维度贴标准（偏冠 = 方位维差异）。
 */
const JUNIPERUS_SLOT5_PROFILE: ConiferShapeProfile = {
  ...JUNIPERUS_SLOT0_PROFILE,
  totalHeight: 7,
  crownWidthRatio: 0.32,
  crownAsymmetry: 0.44,
  tierAngleBase: 57,
  tierAngleTop: 31,
  tierRankLength: [1.5, 0.72],
  tierRankRadius: [1.12, 0.9],
};

/**
 * slot-6 疏松组合（疏端）：密实冠谱系的相对疏端（密实 90–95% Observed 的疏端——
 * 株间密度变幅）。组合：canopyDensity 0.85（密实身份下限——全槽 ≥0.85 锁）+ 簇
 * 抑制升（**0.04**——族校准带同款疏端档 = 基准 0.02 × 2 的读向差）+ 簇外移
 * （0.20/0.18——外段受光集中）+ 树高 6.5（中小个体）+ 冠幅 0.36（疏冠开阔端）+
 * 干高 0.20 + 膨大 1.10 + 垂帘 1.04（直伸端）。
 */
const JUNIPERUS_SLOT6_PROFILE: ConiferShapeProfile = {
  ...JUNIPERUS_SLOT0_PROFILE,
  totalHeight: 6.5,
  crownWidthRatio: 0.36,
  trunkHeightRatio: 0.2,
  trunkFlareRatio: 1.1,
  crownAsymmetry: 0.36,
  canopyDensity: 0.85,
  clusterMinSeparation: 0.04,
  clusterInnerStartL5: 0.2,
  clusterInnerStartL4: 0.18,
  fringeLengthRatio: 1.04,
};

/**
 * slot-7 丰满组合（密端）：密实无层连续冠的密实端（90–95% 实心 Observed 的密端
 * ——「整块密冠」身份读向的满档）。组合：canopyDensity 1.0（满基准同 slot-0——
 * 密端以抑制/内移差异化）+ 簇抑制最低（**0——密端零抑制**：标称簇位全保留，疏密
 * 由 density roll 单独承载，族先例同款处置）+ 簇内移（0.12/0.10——自基部布满）+
 * 树高 7.5 + 冠幅 0.30（密簇体量）+ 干高 0.14（枝到地端）+ 膨大 1.18。
 */
const JUNIPERUS_SLOT7_PROFILE: ConiferShapeProfile = {
  ...JUNIPERUS_SLOT0_PROFILE,
  totalHeight: 7.5,
  crownWidthRatio: 0.3,
  trunkHeightRatio: 0.14,
  trunkFlareRatio: 1.18,
  crownAsymmetry: 0.33,
  canopyDensity: 1.0,
  /** 密度校准 2026-09-29：0 → 0.008——全槽簇 13/9 后密端槽预算适配（High 压回
   *  ≤40000：近零抑制仅剔近正重合堆叠位 ~5%；密度乘子保持 1.0 满基准——密端
   *  身份语义不变，疏密轴与 slot-6 的分化由 canopyDensity 0.85 承载） */
  clusterMinSeparation: 0.008,
  clusterInnerStartL5: 0.12,
  clusterInnerStartL4: 0.1,
};

/**
 * 形态槽路由表：索引 = shapeSlot（八槽差量语法沿族先例——slot-1…7 以 slot-0 锚点
 * 为底展开定义；方向名仅为标签，槽身份 = 多维取值整体组合）。8 槽主轴覆盖（判定 9
 * ⊂ Spec 域）：树高 4.5–10 ⊂ 4–10 主轴 × 冠形双型（狭圆柱 slot-0/4 ⊂ 0.2–0.3 ↔
 * 卵圆 slot-3 ⊂ 0.4–0.6 ↔ 老树阔卵端 slot-2 ∈ 0.7–0.9）× 干高 0.10–0.22 ⊂
 * 0.1–0.25 × 年龄轴（slot-1 幼尖塔 ↔ slot-0 中龄定型 ↔ slot-2 老树阔卵）× 刺叶
 * 比例轴（幼态多刺 ↔ 鳞绝对主导——**计数类恒等不进槽差异，缺口记档归族门**，见
 * 模块头）× 疏密轴（slot-6/7）；**层数轴因结构计数类跨槽恒等不进槽差异**（全槽
 * tierCount 10——表观差异由层距/展幅连续参数承载，缺口候选归族门，两先例同位）。
 * **结构计数类**（tierCount / tierBranchCount / trunk·levels radial·segs /
 * childPlan / clustersL5·L4 / longShootCardsL5·L4 / coneCandidates / tierRank*
 * 数组长度）与**叶身份类**（绳卡元素数与尺度域 / 刺卡长域与轮廓比域 / 球果组 /
 * needleMaterial / bark / wind / 挂点语言位〔tierPhaseStagger·clusterAzimuthStep
 * 双省略即散生 rng 语言〕）由差量展开继承**逐位恒等**（皮面数恒等 16808 与 rng
 * 消费次数恒等的结构性保证）；槽差异全部落连续形态参数。morphSeed 路由见
 * assets/asset_tree_juniperus.asset（Step 3 交付）。
 */
export const JUNIPERUS_SHAPE_PROFILES: ConiferShapeProfile[] = [
  JUNIPERUS_SLOT0_PROFILE,
  JUNIPERUS_SLOT1_PROFILE,
  JUNIPERUS_SLOT2_PROFILE,
  JUNIPERUS_SLOT3_PROFILE,
  JUNIPERUS_SLOT4_PROFILE,
  JUNIPERUS_SLOT5_PROFILE,
  JUNIPERUS_SLOT6_PROFILE,
  JUNIPERUS_SLOT7_PROFILE,
];
