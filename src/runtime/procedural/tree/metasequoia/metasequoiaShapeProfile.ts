/**
 * runtime/procedural/tree/metasequoia/metasequoiaShapeProfile —— 水杉 shapeProfile 数值面
 * （T012.2 Step 2，针叶家族契约**第二实例化**——契约 = ../conifer/coniferShapeProfile
 * （ConiferShapeProfile **定稿**，本任务同 Step 转正：四档消费终标 + 可选位 8——见契约
 * 文件头转正差异一行）。**族内先例 = 雪松（012.1）**：槽组织 / 差量展开语法 / 三标注 /
 * 模块头纪律照抄其组织（CEDRUS_SHAPE_PROFILES 八槽差量结构同构）。
 *
 * 职责：水杉（Metasequoia glyptostroboides Hu & W. C. Cheng，柏科水杉属落叶乔木，
 *      单种属）枝干/冠层/器官/材质参数的**数值面**。全部数值依据
 *      docs/research/metasequoia-reference.md（**Spec Version 1.0**，2026-09-29 落盘
 *      含终审记档——通过 + 3 处修正）；逐字段标注【家族共性】（字段类 = 雪松+水杉均
 *      消费）/【本资产特有】（数值锚 / 仅水杉消费位）/【工程设定无现实基准】（工程
 *      设定不编造现实依据）+ Evidence Status（Verified / Inferred / Observed /
 *      工程设定）。
 *
 * ── Step 1 判定记档 → 字段落位（T012.2 任务书，2026-09-29）──
 *   对生轮生层位挂点（±180° 对 + 层间交错 90°）→ tierBranchCount 2 + tierPhaseStagger
 *   90 + childPlan.phaseStep；枝角梯度（下 70–85°→上 30–50°）→ tierAngleBase/Top；
 *   密连续锥冠（无层隙）→ tierGapBand 0 零端 + exponent 近线性；羽状小枝卡（3–7cm
 *   细质地）→ rosette* 主卡字段 + needleCardAspect* 轮廓比 + clusterAzimuthStep 对生
 *   交错叶序；末级轻垂 → droop 链低幅 + fringe 轻乘子；下垂绿果 + 雄序枯穗双器官账目
 *   → cone* + strobili*；干基膨大 ×1.5–2.0 → trunkFlareRatio 强值；风动两成分（顶梢
 *   不消费）→ wind tier/fringe + leader 零占位；顶梢专路不消费 → leaderDroop 0。
 *
 * ── 结构裁定与预算推算（首版，Step 3 探针回调回路开放）──
 *   - 拓扑：tierCount 10 × tierBranchCount 2（对生成对）= 20 L1 层枝；childPlan
 *     [2,2,2,2] → L1–L5 = [20, 40, 80, 160, 320]；皮面估算 ≈17.0K（trunk 504 +
 *     L1 1.96K + L2 2.4K + L3 3.2K + L4 3.84K + L5 5.12K）+ 羽卡挂点（L5 320×6 +
 *     L4 160×4 = 2560 位）× 交叉双卡 4 tri ≈ 10.2K + 双器官卡（果/枯穗）≈0.4K →
 *     总面 ≈27.6K ⊂ LOD 已锁 conifer 行 High ≤ 40000（待裁决位 2；**预估待 Step 3
 *     探针复核定档**——密冠卡密度有上调空间，带 ≈26–31K）。
 *   - **Step 4 密度校准终档（2026-09-29，探针 8 槽实测）**：羽卡尺度 0.055–0.10 →
 *     **0.18–0.30**（终诊 = 羽卡密度/尺度不足——M25 投影 ~0.1% 亚像素证伪初版
 *     「卡尺度杠杆不适用」判定）+ 挂点密度 6/4 → **12/8**（标称 2560 → 5126 位）
 *     + 簇抑制 0.08 → **0.02**（新簇半径口径的近重合去重档；slot-6/7 同步 0.04/0）
 *     → 皮恒 17136 + 羽卡 ×2 + 双器官 ≈0.5K：**High 实测带 27088–35156**（slot-0
 *     32172 = 上限 80.4%；slot-6 疏端 27088 / slot-7 密端 35156）⊂ ≤40000；
 *     Mid 站点掩码 %3 / Low 壳卡 stride 5 同步落带（几何侧 lodPlanFor，出带调
 *     密度分配不破带——brief 授权）。
 *   - **层数 8–12 变体轴不进槽差异**：tierCount 属结构计数类（改值即改皮面数与 rng
 *     消费数）——沿雪松先例处置：全槽恒等取 10（判定 1 密层预估带中值），表观层密度
 *     差异由层距/展幅连续参数间接表达；层数轴槽间展开 = 契约缺口候选归族门（雪松已
 *     记同位缺口）。
 *   - **密植展冠不进槽域**：Spec §6 生境变体密植林分冠幅展至 ~0.5——生产锚 = 公园
 *     孤立木窄段 0.20–0.32（判定 10 主轴），密林端不建槽记档。
 *
 * ── Unknown / 不消费记档（Spec 明示或判定 11 留档，工程不编造依据）──
 *   Unknown（Step 3/4 探针）：层计数绝对值（照片 tier 化观感 Inferred——8–12 预估带
 *   取 10）；密冠透天比例（vs 雪松层隙透天——tierGapBand 0 起步，探针定档）；
 *   ~~羽卡中距可辨性~~（**已回调**——Step 4 终诊亚像素证伪 + 0.18–0.30 上调落带，
 *   2026-09-29；余量 = 视觉复拍归主代理）；雄序枯穗近景显著性（M8 判读）。
 *   不消费（工程占位零值，字段语义不驱动）：leaderDroop / needleCardLen* /
 *   longShootCards* / coneClassRatio / coneColorYoung / coneAxisColor /
 *   needleGlaucousBloom / windLeader*（顶梢专路 + 散生单针 + 两类并存 + 宿存中轴 +
 *   白粉 = 雪松侧族内可选位）；FRPS 版本差数值（Spec Unknown ①——按 FoC 1999 准入）；
 *   冬态骨架相（脱落性小枝的冬季裸枝——非主语境季相卡，presets 双卡 = default 秋绿 +
 *   autumn 锈橙红褐）。
 *
 * 边界：水杉资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_metasequoia.asset，Step 3 交付）；
 *      比率字段以 totalHeight（形态参数域树高）为基；角度字段以度存、弧度算
 *      （clusterAzimuthStep 沿 childPlan.phaseStep 弧度口径）；颜色字段为 sRGB hex
 *      （0xRRGGBB），3b 材质负责工作色域转换。
 */

import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：**开阔孤立中龄密尖塔型**（T012.2 Step 1 判定 10 +
 * Spec §3 尺度锚建议）——树高 ≈20m 级锚（域 18–25 中值）、冠幅比 ≈0.25（尖塔窄冠）、
 * 干高 ≈0.40、干基膨大 ×1.6、密层尖塔（tierCount 10 预估带中值）、中龄密尖塔相（幼树
 * 极窄 ↔ 老树阔圆锥年龄轴的中点）。结构计数类（tierCount / tierBranchCount /
 * trunk·levels radial·segs / childPlan / 簇位数 / cone·strobilus 候选 / tierRank*
 * 数组长度）与叶身份类（羽卡元素数与尺度域 / 球果与枯穗组 / needleMaterial / bark /
 * wind / 挂点语言位）全槽恒等；槽差异全部落连续形态参数。
 */
export const METASEQUOIA_SLOT0_PROFILE: ConiferShapeProfile = {
  // ── 体量与干形 ──
  /** Spec §尺度锚（摘要区）**树高 18–25 m**（栽培权威域 19–30 m 中低段——Inferred
   *  [3][4]）；slot-0 取域中值 20（中龄公园典型个体——与阔叶 8m / 雪松 16.5m 锚的
   *  混植层次梯队：水杉最高级）。**同源风动树高锚**：3b 材质摆幅归一直读本字段
   *  （锚同步轮无独立锚值——测试锚断言同源）。【体量类字段 = 家族共性；锚值 =
   *  本资产特有（Spec 尺度锚 Inferred）】 */
  totalHeight: 20,
  /** Spec §尺度锚 **冠幅比 0.22–0.30**（尖塔窄冠孤立木——NC 数值域 0.21–0.36 窄段
   *  Inferred [3][4] + s01 终审并集 0.15–0.25 Observed）；slot-0 = 0.25（8 槽带
   *  0.20–0.32——幼极窄 ↔ 老阔圆锥年龄轴）。【字段 = 家族共性；锚值 = 本资产特有
   *  （Spec 域 Inferred+Observed）】 */
  crownWidthRatio: 0.25,
  /** Spec §尺度锚 **干高比 0.35–0.50**（冠底/全高——照片群 1/3–3/5 中段，
   *  Observed→Inferred 中）；slot-0 = 0.40（域中值——开阔孤立中龄净干相）。
   *  【字段 = 家族共性；锚值 = 本资产特有（Spec 域 Inferred）】 */
  trunkHeightRatio: 0.4,
  /** 干顶径/基径。方向 = 干通直 excurrent + 干如柱（Spec §骨架 Inferred [2] + s01/
   *  s03/s05b Observed）；数值 0.30 = 工程设定无现实基准（Spec 无干形锥度数值——
   *  通直柱状干的缓收）。【字段 = 家族共性；值 = 工程设定】 */
  trunkTaperRatio: 0.3,
  /** 根部展宽（基径/胸径）——**干基膨大/板根状**（Spec §干基："trunk buttressed at
   *  base" Verified [2][3][4]；NC 域 **×1.6–1.9** Inferred [4]；公园老树照片 ×2.2–3.3
   *  Observed s09——中龄合理域 **×1.5–2.0** Spec §3 推导）；slot-0 = 1.6（NC 域中值
   *  ——旱地栽植常见膨大）。8 槽带 1.3–2.0（幼弱 ↔ 老强年龄轴）。【字段 = 家族共性
   *  （水杉提供强现实锚——vs 雪松轻度端）；锚值 = 本资产特有（Spec 域
   *  Inferred+Observed）】 */
  trunkFlareRatio: 1.6,
  /** 对生成对层的规整度载体（层内枝方位抖动幅度缩放）。方向 = **小枝/叶/果鳞均对
   *  生**（MoBot "The twigs, needles and cone scales are in opposite pairs" Verified
   *  [3]）——对生律较雪松近轮散布更规整 → 0.22 < 雪松 0.30；幅度 = 工程设定。
   *  【方位抖动机制 = 家族共性；幅度 = 工程设定（方向 Verified）】 */
  crownAsymmetry: 0.22,

  // ── 层结构（身份核心：对生 + 不规则轮生层位挂点）──
  /** 主层数。Spec §骨架「大枝**不规则轮生**」（FoC "main branches irregularly whorled"
   *  Verified [1][2]）+ s05b/s01 tier 化观感 Observed；判定 1 **密层 8–12**（vs 雪松
   *  6–8 疏层——层距密尖塔读向）——绝对计数 Unknown（判定 11）→ 预估带中值 10
   *  （**Inferred-工程待探针**）。【结构计数类：槽间恒等】；【层数轴 8–12 变体不进
   *  槽差异——记缺口候选归族门（沿雪松同位先例，见模块头）】；【字段 = 家族共性；
   *  值 = 本资产特有（Spec 轮生定性 Verified + 计数预估 Inferred 待探针）】 */
  tierCount: 10,
  /** 每层主枝数 = **1 对生对**（±180° 方位对——对生成对主律的层内实现；MoBot 对生
   *  对 Verified [3] + 判定 1）。2 对/层（4 枝）预算超 High 带（40 L1 → 皮面 ≈36K
   *  无卡余量）→ 取 1 对/层 + 层间交错（tierPhaseStagger）+ 密簇挂点承载密冠观感。
   *  【结构计数类：槽间恒等】；【字段 = 家族共性；值 = 工程设定（对生主律的定对
   *  实现 + 预算裁定——探针可全槽同调回调）】 */
  tierBranchCount: 2,
  /** 层位垂直抖动。方向 = **不规则轮生**（"irregularly whorled" Verified [1][2]——
   *  层距不规整读向强于雪松均匀层）；幅度 0.26 = 工程设定（> 雪松 0.18——不规则
   *  轮生的散布端）。【字段 = 家族共性；值 = 工程设定（方向 Verified）】 */
  tierSpacingJitter: 0.26,
  /** 层角梯度下端（最下层自垂直角）。Spec s01 终审精化**下部近水平 70–85°**（自垂直
   *  角——Observed 终审）；slot-0 = 78°（带中值）。【层角梯度机制 = 家族共性（层状
   *  骨架语言家族第一横向证据——与雪松 81→44 同型读向）；端值 = 本资产特有（Spec
   *  照片域 Observed）】 */
  tierAngleBase: 78,
  /** 层角梯度上端（最上层自垂直角）。Spec s01 终审精化**上部 30–50°**（Observed）；
   *  slot-0 = 40°（带中值——斜展上举端）。【同上】 */
  tierAngleTop: 40,
  /** 层内枝角抖动。工程设定（层状非机械规整的散布；Spec 无度数）。 */
  tierAngleJitter: 6,
  /** 顶层枝长/底层枝长。方向 = 窄尖塔剪影 + **顶部细长收尖**（判定 3；冠形序列
   *  Verified [2][3][4]）；0.15 = 窄塔急收（< 雪松 0.22——更窄更尖）。【轮廓读向 =
   *  家族共性（Verified）；数值 = 工程设定】 */
  tierRadiusTaper: 0.15,
  /** 层半径沿高分布指数。**密连续锥**（判定 3：vs 雪松层叠尖塔带隙——exponent 近
   *  线性 = 光滑圆锥读向）；1.35 = 工程设定（方向 = 冠形序列 Verified）。 */
  tierProfileExponent: 1.35,
  /** 层板拱起。方向 = **枝斜展上举**（"branches ascending" Verified [1][2]）——层板
   *  弱拱（< 雪松升扇 0.10）；幅度 0.05 = 工程。【层板轮廓机制 = 家族共性；幅度 =
   *  工程设定（方向 Verified）】 */
  tierPlateArch: 0.05,
  /** 层板外缘下卷。方向 = **末级轻垂**（"branchlets pendulous" Verified [1][2]——
   *  判定 4 轻度版）；幅度 0.05 = 工程。【同上】 */
  tierEdgeDroop: 0.05,
  /** 层内 rank 长度乘子（2 枝 = 对生对——**对内近等**〔对生成对主律〕+ 跨层同方位
   *  温和势差；破缺即偏冠槽载体见 slot-5）。工程设定。【数组长度 = 结构计数类：槽间
   *  恒等；值 = 连续】 */
  tierRankLength: [1.06, 0.96],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  tierRankRadius: [1.04, 0.97],
  /** 层枝起径/主干挂点径。方向 = 密尖塔冠大枝相对纤细分枝繁密（NC "Texture: Fine"
   *  [4] 的枝级读向 Inferred——vs 雪松 massive）；数值 0.42 = 工程设定。 */
  tierBranchRadiusRatio: 0.42,
  /** 顶梢段长/树高。方向 = 顶部细长收尖（判定 3 + 冠形序列 Verified）+ 干通直延伸
   *  （excurrent）；段长占比 0.08 = 工程设定（收尖段的干顶延伸——通直无点头）。 */
  leaderLengthRatio: 0.08,
  /** 顶梢下垂强度。**不消费占位 0**（判定 4：leader 通直无点头——顶梢专路〔含裸梢
   *  散生卡〕= 族内可选·雪松消费位）。 */
  leaderDroop: 0,
  /** 相邻主层方位交错角（度存弧度算）——**对生层间交错 90°**（decussate 观感：判定 1
   *  「±180° 方位对 + 层间交错」；MoBot 对生对 Verified [3] 的层间表达）。**挂点语言
   *  身份：槽间恒等**。【族内可选·水杉消费——转正新增位（雪松近轮任意方位省略）】 */
  tierPhaseStagger: 90,

  // ── 羽状小枝卡挂点（对生叶序单挂点——判定 2 新形态语言）──
  /** 羽卡 SDF 叶元素数（二列合计）。Spec §脱落性小枝：羽状小枝 3–7cm × 叶对生二列、
   *  沿轴 2–5mm 间距（Verified [1][2]）→ 每枝叶数算术 ≈12–28；取 22（带中值）。
   *  LOD 降档 = 递减派生归 3b（22/14/8——冻结单）。【叶身份：槽间恒等】；【字段 =
   *  家族共性（主卡 SDF 叶元素数——转正重标语义）；值 = 本资产特有（Spec 算术
   *  Inferred）】 */
  rosetteNeedles: 22,
  /** 羽卡长域（米）。**Step 4 密度校准值**（2026-09-29）：真羽 3–7cm ×~1.4 初版
   *  0.055–0.10 被像素证伪——~4400 位总投影面积 M8 仅 ~3.5%、M25 ~0.1%（5.5–10cm
   *  聚合单元在 M25 仍亚像素 1–2px，冠读作光杆枝）→ 上调至 **0.18–0.30** 对齐雪松
   *  ≥0.3m 实证带（中距「卡尺度给面质量」对本资产同样成立）；**雪松同款取舍**：近景
   *  单卡大于实物羽枝，中距「羽列软质感」读向由 SDF 内部 22/14/8 羽列密度承载（22
   *  元素 / 0.24m 卡 ≈ 1.1cm 元素间距 ≈ 真叶 0.8–1.5cm——元素物理尺度近真）。
   *  【卡尺度域类 = 家族共性；绝对量级 = 本资产特有（真羽尺寸 Spec Verified ×
   *  工程校准映射记档——判定 2 初版「杠杆不适用」结论作废，校准简报 2026-09-29）】 */
  rosetteCardMin: 0.18,
  rosetteCardSpan: 0.12,
  /** 散生单针卡长域。**不消费占位 0**（判定 2：挂点 = 末级枝对生叶序单挂点——无
   *  长短枝双挂点；族内可选·雪松消费位）。 */
  needleCardLenMin: 0,
  needleCardLenSpan: 0,
  /** 羽卡轮廓长宽比域（卵状椭圆轮廓比）。真羽 3–7 × 1.5–4 cm → 轮廓比 ≈1.8–2.6
   *  （Verified [1][2] 算术；真叶 0.8–1.5cm × 1.2–2mm 的微观长宽比由 SDF 内部承载
   *  不进本域）。【字段 = 家族共性（叶卡轮廓比域——转正重标语义）；域值 = 本资产
   *  特有（Spec 轮廓算术 Inferred）】 */
  needleCardAspectMin: 1.8,
  needleCardAspectSpan: 0.8,
  /** 羽卡挂点位（末两级 L5/L4 每枝）。**Step 4 密度校准值**（2026-09-29 探针定档）：
   *  初版 6/4（预估 2560 位）中距浓密读向不足（终诊 = 密度/尺度双缺）→ 上调 12/8
   *  （标称 5126 位 = L5 320×12 + L4 160×8 + 顶梢 6；实测存活 3223–5126 随槽），
   *  High 实测带 27088–35156 ⊂ ≤40000（上限用满 68–88%——slot-0 80.4% 沿雪松
   *  32.2–38.4K 先例带）。【结构计数类：槽间恒等】 */
  clustersL5: 12,
  clustersL4: 8,
  /** 散生单针卡数。**不消费占位 0**（同 needleCardLen*——族内可选·雪松消费位）。
   *  【结构计数类：槽间恒等】 */
  longShootCardsL5: 0,
  longShootCardsL4: 0,
  /** 簇挂点 t 域下限。工程设定（**挂点前移杠杆 ✓**——判定 2 三杠杆选择性继承之二：
   *  密冠自枝基部布满；雪松校准实证直承）。 */
  clusterInnerStartL5: 0.16,
  clusterInnerStartL4: 0.14,
  /** 簇级剔除抑制。**Step 4 密度校准同步值**：卡尺度 ×~3 后簇半径 0.0275–0.05 →
   *  0.09–0.15，原 0.08 的绝对阈值（0.08×(ri+rj)）放大 ~3× 会过度剔除交叉枝位簇
   *  （探针：sep 0.04 剔 33% / 0.06 剔 44%）→ 降至 **0.02**（阈值 ~5mm = 近重合
   *  去重档——重叠由交叉双卡随机滚转吸收，三杠杆之一 **交叉双卡 ✓** 继承〔单面卡
   *  无角度覆盖为几何普适〕；密度主控权归簇位基数 + canopyDensity）。 */
  clusterMinSeparation: 0.02,
  /** 末级枝长加长乘子（下垂段长度侧）。方向 = **末级小枝下垂**（"branchlets
   *  pendulous" Verified [1][2] + 脱落枝下垂轮廓）——**轻度版**（判定 4：幅度远小于
   *  salix/雪松垂帘）；乘子 1.15 = 工程（中龄相；年龄轴载体：幼树 1.06 ↔ 老树
   *  1.32）。【垂帘机制 = 家族共性；乘子 = 工程设定（方向 Verified）】 */
  fringeLengthRatio: 1.15,
  /** 基准密度乘子（slot-0 = 1.0 满基准；疏密差异归槽 6/7——家族沿用）。【密度乘子类
   *  = 家族共性；基调 = 工程设定】 */
  canopyDensity: 1.0,
  /** 层隙观感带。**零端消费 0**（判定 3：**密连续锥冠无层隙**——冠连续密实 s01/s03
   *  Observed；字段零端 = 簇布点连续分布无层间空带。消费差异即转正素材——字段保留
   *  家族共性，水杉消费零端）。【字段 = 家族共性（水杉零端）；值 = 本资产特有
   *  （Spec 密冠读向 Observed+判定 3）】 */
  tierGapBand: 0,
  /** 簇挂点方位步进（弧度）——**对生交错叶序 π/2**（判定 2：末级枝对生叶序挂点；
   *  逐点 90° 步进 + 偶奇 ±π 配对成对生对 = 3a 实现；MoBot 对生 Verified [3]）。
   *  **挂点语言身份：槽间恒等**。【族内可选·水杉消费——转正新增位（雪松 rng 散布
   *  省略；弧度存沿 childPlan.phaseStep 口径）】 */
  clusterAzimuthStep: Math.PI / 2,

  // ── 球果下垂账目（绿果单 cohort）+ 雄序枯穗第二器官 ──
  /** 结果枝带起点 t。方向 = **单生去年生枝顶/近顶**（Verified [1][2]）→ 外段结果位
   *  （t ≥ 0.72 的近梢枝位为结果候选；值工程映射）。【叶身份：槽间恒等（账位语言）】 */
  coneFruitingZone: 0.72,
  /** 每结果位候选果数。方向 = 单生为主（Verified [1][2]）+ s06 对生果柄痕 Observed
   *  → 候选 2 + 存活过滤（rng 无条件消费）。【结构计数类：槽间恒等】；【账目机制 =
   *  家族共性；候选值 = 本资产特有（Spec 单生读向 Inferred）】 */
  coneCandidates: 2,
  /** 候选存活比例。全冠量级 = Spec §5.3 **零星-少量**（介于雪松正向与 bischofia 无果
   *  之间偏轻——s04/s06/s05b Observed→Inferred 中）的定档载体：低 keep 0.30。
   *  【叶身份：槽间恒等】；【值 = 工程设定（Observed 量级的工程落位，Step 3 探针
   *  复核）】 */
  coneKeepRatio: 0.3,
  /** 球果尺度域（米）。Spec **熟时 1.4–2.5 × 1.6–2.3 cm**（Verified [1][2] + MoBot
   *  3/4″ 同域 [3]）×1 近真 → 0.016–0.024 ⊂ 域。【叶身份：槽间恒等】；【尺寸域 =
   *  本资产特有（Spec Verified ×1 映射）】 */
  coneSizeMin: 0.016,
  coneSizeSpan: 0.008,
  /** 两类果并存比。**不消费占位 1.0**（判定 5：当年熟单 cohort——主语境 9–10 月 =
   *  绿色近成熟体一类；两类并存 = 翌年熟时窗错位〔雪松〕族内可选位）。 */
  coneClassRatio: 1.0,
  /** 主类果表征色（当年近熟绿果）。Spec §5.3 主语境 9–10 月 = **绿色近成熟体**
   *  （幼紫黑绿 → 熟深褐的绿端；s04 Observed 9-30 绿幼果带柄）；色值 0x55793f =
   *  工程映射（绿近熟表征）。【叶身份：槽间恒等】；【表征色语义 = 家族共性（主类
   *  果色）；色值 = 本资产特有（Spec 物候 Verified + 照片 Observed）】 */
  coneColorMature: 0x55793f,
  /** 次类果色。**不消费占位**（单 cohort——同绿域占位 0x4c7038；族内可选·雪松
   *  消费位）。 */
  coneColorYoung: 0x4c7038,
  /** 宿存中轴色。**不消费占位**（判定 5：水杉熟果**整果脱落**非宿存中轴——s05b
   *  冬季挂果 = 整果宿存；族内可选·雪松消费位）。 */
  coneAxisColor: 0x8a7a5c,
  /** 雄（花粉）序枯穗第二器官账目（判定 5：**做**——s04 实证 9-30 枝上残留上年雄
   *  花序枯穗 3–5cm 下垂，default 卡近景身份细节）。候选/存活/枯穗色 = 工程定档
   *  （量级 Observed 中 + 探针复核）；尺寸 = Spec s04 Observed 3–5cm 近真；色 =
   *  枯褐表征（工程映射）。全组【叶身份：槽间恒等】；【**转正新增组**——族内可选·
   *  水杉消费（单性序器官的族扩展点）】 */
  strobili: {
    strobilusCandidates: 4,
    strobilusKeepRatio: 0.35,
    strobilusSizeMin: 0.03,
    strobilusSizeSpan: 0.02,
    strobilusColor: 0x9a7f4d,
  },

  /** 针叶色材质参数（3b 消费；**两面温和色差 = 族内差异轴**——needleFaceContrast
   *  转正新增位，vs 雪松无两面差省略）。全组【叶身份：槽间恒等】。 */
  needleMaterial: {
    /** 受光面（阳面）叶色。Spec §5.1 **上面 bluish green or yellowish green**（Verified
     *  [2]）+ 季相主语境 **9 月末亮黄绿**（s04 Pisa 2024-09-30 Observed——default 卡
     *  时点锚 + MoBot 演替「夏深绿」端 [3]）；色值 0x8ab65a = 工程映射（亮黄绿端）。 */
    needleColorSun: 0x8ab65a,
    /** 荫面叶色。Spec §5.1 **下面明显较淡（paler abaxially）**（Verified [2]）+ 夏深
     *  绿端；0x4c6e3c = 深绿端工程映射（阳亮荫深受光色差 ramp 同源——判定 7）。 */
    needleColorShade: 0x4c6e3c,
    /** 白粉强度。**不消费占位 0**（水杉无白粉读向——气孔带 4–8 条仅下面〔Verified
     *  [1]〕不承色；银灰粉调 = 雪松侧族内可选位）。 */
    needleGlaucousBloom: 0,
    /** 叶龄梯度强度。Spec §5.2 演替 春浅绿 → 夏深绿（Verified [2][3]）的域内轻梯度
     *  （当年生小枝淡绿读向——非季相卡）；强度 0.15 = 工程。 */
    needleJuvenility: 0.15,
    /** 两面色差强度（上面深/下面浅的温和差）。Spec §5.1 判定①结论：两面色差**存在、
     *  温和**（"paler abaxially" Verified [2] + s02/s04 近距单一黄绿观感 Observed——
     *  中远景单色、特写档微差）；强度 0.22 = 工程映射（温和档）。【**转正新增位**——
     *  族内可选·水杉消费（条形叶二列两面读向）】 */
    needleFaceContrast: 0.22,
  },

  /** 树皮材质参数（3b 消费——**第 15 语言：纵长条片-纤维剥落**（判定 6；vs 雪松第 14
   *  鳞状方块片——同科两语言轴）。单元形状/长宽比/纵向朝向 = SDF 内部（材质侧），
   *  契约只承载单元尺度域/沟深/三色；几何侧轮廓起伏层未进契约（缺口归族门）。全组
   *  【叶身份：槽间恒等】。 */
  bark: {
    /** 条片单元长域。Spec §5.4 **纵向长条片/纤维状剥落**（"exfoliating… ribbon-like
     *  strips" Verified [2]）+ s08 长纤维条 Observed——无长度数值 → 工程推断
     *  0.12–0.22m（成年干条片量级；探针复核）。【单元尺度域类 = 家族共性；域值 =
     *  工程推断（方向 Verified + 记档）】 */
    barkPlateMin: 0.12,
    barkPlateSpan: 0.1,
    /** 沟深强度。s08 Observed **深索状浮雕**（脊:沟 ≈2–3:1——vs 雪松浅-中沟）；
     *  0.68 = 深端工程映射。 */
    barkGrooveDepth: 0.68,
    /** 基色（红褐/桂皮棕基调——脊侧中褐）。s08 Observed + FoC "dark reddish brown"
     *  Verified [2]；色值工程映射。 */
    barkBaseColor: 0x7a5138,
    /** 单元顶色（脊顶风化灰褐）。s08 Observed；色值工程映射。 */
    barkPlateColor: 0x8f7a62,
    /** 沟色（沟底橙褐深端）。s08 Observed（沟底橙褐）+ 幼树淡橙褐 Verified [2]；
     *  色值工程映射。 */
    barkGrooveColor: 0x452e1e,
  },

  /** 风动两层**两成分**（3b 消费；**树高锚 = totalHeight 同源**——锚同步轮直读 20
   *  级〔判定 8：树高锚换 18–25m 同步轮〕，测试锚断言同步）。方向依据 = Spec §风动
   *  读向（**结构推断无直证 Inferred**）：密尖塔冠 + 通直骨干 → 整冠低频小幅摆；
   *  细软条形叶 + 下垂末级羽状轻质单元 → **末级高频细颤为主成分**（判定 8）。
   *  **顶梢成分不消费**（leader 通直——族内可选·雪松消费位，零占位）。数值 = 工程
   *  设定（3b 定档回路开放）。全组【叶身份：槽间恒等】。 */
  wind: {
    windTierAmplitude: 0.018,
    windTierFrequency: 0.32,
    windFringeAmplitude: 0.055,
    windFringeFrequency: 2.6,
    windLeaderAmplitude: 0,
    windLeaderFrequency: 0,
  },

  /** 主干拓扑（径向 14 承载条片 SDF 周向频率奈奎斯特域 + 近景圆度——雪松同值；环段
   *  18 与 20m 树高级匹配〔雪松 16.5m/16 的等比上推〕）。【结构计数类：槽间恒等】；
   *  wander 0.02 = 干通直如柱（s01/s03/s05b Observed——低于雪松 0.03）。 */
  trunk: { radial: 14, segs: 18, wander: 0.02 },

  /** 五级枝拓扑（L1 层枝 → L5 末级细枝——对生成对递归分瓦密枝冠；级数为实例口径）。
   *  radial/segs【结构计数类：槽间恒等】（细于雪松一档——纤细分枝 + 预算）；wander/
   *  droop 连续：droop = **末级轻垂链**（判定 4 轻度版——L5 0.26 « 雪松垂帘 0.45；
   *  单调不降）；wander 主次分级。数值工程设定（方向 Verified [1][2]）。 */
  levels: [
    { radial: 7, segs: 7, wander: 0.05, droop: 0.01 },
    { radial: 6, segs: 5, wander: 0.09, droop: 0.03 },
    { radial: 5, segs: 4, wander: 0.15, droop: 0.08 },
    { radial: 4, segs: 3, wander: 0.22, droop: 0.16 },
    { radial: 4, segs: 2, wander: 0.3, droop: 0.26 },
  ],

  /** 子枝挂点计划（L1→L2 … L4→L5 四过渡级，各 2 挂点〔侧枝 + 末位 1.0 延伸枝〕——
   *  L1–L5 = [20,40,80,160,320] 拓扑来源）。【结构计数类：槽间恒等】；ts 分布工程
   *  设定（挂点前移——密冠自内段展开，雪松校准实证直承）；phaseStep = **π/2 四列
   *  交错**（对生 + 层间交错同律的级内表达——体积填充；判定 1 方位律）。 */
  childPlan: [
    { ts: [0.28, 1.0], phaseStep: Math.PI / 2 },
    { ts: [0.3, 1.0], phaseStep: Math.PI / 2 },
    { ts: [0.3, 1.0], phaseStep: Math.PI / 2 },
    { ts: [0.34, 1.0], phaseStep: Math.PI / 2 },
  ],
};

/**
 * slot-1 幼树极窄组合（年龄轴幼端）：Spec §3「幼-中龄**窄圆锥/尖塔形**」+ §6「幼树
 * 尖塔极窄 + 叶更长」（Verified [2][3][4]——叶更长属叶身份不进槽差异记档）。组合：
 * 树高 15（域下沿——幼树个体）+ 冠幅 0.20（极窄端）+ 干高 0.35（下层枝低）+ 膨大
 * 1.3（幼树弱）+ 层角整体上举（base 72 / top 34）+ 收顶比最低（0.12 极尖）+ 顶梢
 * 段占比升（0.12 幼树顶梢主导强）+ 层距规则（jitter 0.18 幼树规则轮生）+ 垂帘最弱
 * （fringe 1.06 + L4/L5 droop 0.10/0.16）+ 方位最规整（asymmetry 0.16——幼树对生
 * 律最规整）+ 姿态刚直（wander ×~0.85）。
 */
const METASEQUOIA_SLOT1_PROFILE: ConiferShapeProfile = {
  ...METASEQUOIA_SLOT0_PROFILE,
  totalHeight: 15,
  crownWidthRatio: 0.2,
  trunkHeightRatio: 0.35,
  trunkTaperRatio: 0.26,
  trunkFlareRatio: 1.3,
  crownAsymmetry: 0.16,
  tierSpacingJitter: 0.18,
  tierAngleBase: 72,
  tierAngleTop: 34,
  tierAngleJitter: 4,
  tierRadiusTaper: 0.12,
  tierProfileExponent: 1.25,
  tierPlateArch: 0.03,
  tierEdgeDroop: 0.03,
  leaderLengthRatio: 0.12,
  fringeLengthRatio: 1.06,
  clusterInnerStartL5: 0.14,
  clusterInnerStartL4: 0.12,
  trunk: { radial: 14, segs: 18, wander: 0.017 },
  levels: [
    { radial: 7, segs: 7, wander: 0.04, droop: 0.0 },
    { radial: 6, segs: 5, wander: 0.08, droop: 0.02 },
    { radial: 5, segs: 4, wander: 0.13, droop: 0.05 },
    { radial: 4, segs: 3, wander: 0.19, droop: 0.1 },
    { radial: 4, segs: 2, wander: 0.26, droop: 0.16 },
  ],
};

/**
 * slot-2 老树阔圆锥组合（年龄轴老端）：Spec §3「**finally broadly conical**」+ §6
 * 「老树阔圆锥 + 干基膨大强化 + 树皮深裂化」（Verified [2][3]——树皮深裂化属材质
 * 身份不进槽差异记档）。组合：树高 24（域上部——老树大个体）+ 冠幅 0.32（阔圆锥
 * 端）+ 干高 0.48（净干抬升）+ 膨大 2.0（强化端——板根发育）+ 层角放平（base 84 /
 * top 48）+ 收顶比升（0.24 顶部相对宽）+ 外缘下卷强（0.08）+ 垂帘长（fringe 1.32 +
 * L4/L5 droop 0.22/0.36——末级下垂随龄强化）+ 顶梢段占比降（0.06）+ 层距最不规
 * 则（jitter 0.32）+ 方位松散（asymmetry 0.30）。
 */
const METASEQUOIA_SLOT2_PROFILE: ConiferShapeProfile = {
  ...METASEQUOIA_SLOT0_PROFILE,
  totalHeight: 24,
  crownWidthRatio: 0.32,
  trunkHeightRatio: 0.48,
  trunkTaperRatio: 0.34,
  trunkFlareRatio: 2.0,
  crownAsymmetry: 0.3,
  tierSpacingJitter: 0.32,
  tierAngleBase: 84,
  tierAngleTop: 48,
  tierAngleJitter: 7,
  tierRadiusTaper: 0.24,
  tierProfileExponent: 1.5,
  tierPlateArch: 0.07,
  tierEdgeDroop: 0.08,
  leaderLengthRatio: 0.06,
  fringeLengthRatio: 1.32,
  clusterInnerStartL5: 0.2,
  clusterInnerStartL4: 0.18,
  levels: [
    { radial: 7, segs: 7, wander: 0.06, droop: 0.02 },
    { radial: 6, segs: 5, wander: 0.1, droop: 0.05 },
    { radial: 5, segs: 4, wander: 0.17, droop: 0.12 },
    { radial: 4, segs: 3, wander: 0.26, droop: 0.22 },
    { radial: 4, segs: 2, wander: 0.34, droop: 0.36 },
  ],
};

/**
 * slot-3 密林挤压组合（生境轴挤压端）：Spec §6 生境变体（密植林分干高比降、向上
 * 生长——Observed→Inferred 中；密植展冠 0.33–0.5 不进槽域记档见模块头）。组合：
 * 树高 25（域上沿——挤压向上生长）+ 冠幅 0.20（带内下沿——受挤窄冠）+ 干高 0.50
 * （立木净干上沿）+ 膨大 1.5 + 层角收角上举（base 70 / top 32）+ 收顶比 0.13（窄
 * 塔）+ 密度微降（0.94——受挤冠内受光弱）+ 垂帘短（1.08）+ 顶梢段占比升（0.10
 * ——高生长主导）。
 */
const METASEQUOIA_SLOT3_PROFILE: ConiferShapeProfile = {
  ...METASEQUOIA_SLOT0_PROFILE,
  totalHeight: 25,
  crownWidthRatio: 0.2,
  trunkHeightRatio: 0.5,
  trunkFlareRatio: 1.5,
  crownAsymmetry: 0.24,
  tierAngleBase: 70,
  tierAngleTop: 32,
  tierRadiusTaper: 0.13,
  tierProfileExponent: 1.3,
  leaderLengthRatio: 0.1,
  fringeLengthRatio: 1.08,
  canopyDensity: 0.94,
};

/**
 * slot-4 低枝开阔组合（干低下沿端）：公园开阔低枝个体（Spec §3 干高比照片群 1/3–3/5
 * 下沿——Observed→Inferred 中；开阔公园下层枝低垂常见态）。组合：树高 17（开阔
 * 中龄偏小个体）+ 冠幅 0.28（低开阔冠）+ 干高 0.35（下层枝低端）+ 膨大 1.5 + 层角
 * 最平（base 85 / top 44）+ 收顶比 0.20 + 外缘下卷 0.07 + 垂帘 1.22 + 方位 0.28 +
 * L4/L5 droop 0.18/0.30（低展末级垂覆）。
 */
const METASEQUOIA_SLOT4_PROFILE: ConiferShapeProfile = {
  ...METASEQUOIA_SLOT0_PROFILE,
  totalHeight: 17,
  crownWidthRatio: 0.28,
  trunkHeightRatio: 0.35,
  trunkFlareRatio: 1.5,
  crownAsymmetry: 0.28,
  tierAngleBase: 85,
  tierAngleTop: 44,
  tierRadiusTaper: 0.2,
  tierProfileExponent: 1.45,
  tierEdgeDroop: 0.07,
  fringeLengthRatio: 1.22,
  levels: [
    { radial: 7, segs: 7, wander: 0.05, droop: 0.01 },
    { radial: 6, segs: 5, wander: 0.09, droop: 0.04 },
    { radial: 5, segs: 4, wander: 0.15, droop: 0.1 },
    { radial: 4, segs: 3, wander: 0.23, droop: 0.18 },
    { radial: 4, segs: 2, wander: 0.31, droop: 0.3 },
  ],
};

/**
 * slot-5 偏冠组合（对的破缺）：一侧层枝展显著强于对侧（冠形个体开张幅度 Spec §6
 * ——方向采信 Inferred；幅度工程设定）。对生成对律下偏冠 = **对内强弱破缺 + 跨层
 * 同方位相干**（vs 雪松环内 rank 势差机制同构）：rank0 ×1.55 / rank1 ×0.75（对内
 * 破缺比 2.07），全 10 层同方位 → 质心稳定指向首方位。组合：asymmetry 0.40 + 冠幅
 * 0.26 容纳域 + 层角微扩（76–42）。其余维度贴标准（偏冠 = 方位维差异）。
 */
const METASEQUOIA_SLOT5_PROFILE: ConiferShapeProfile = {
  ...METASEQUOIA_SLOT0_PROFILE,
  totalHeight: 19.5,
  crownWidthRatio: 0.26,
  crownAsymmetry: 0.4,
  tierAngleBase: 76,
  tierAngleTop: 42,
  tierRankLength: [1.55, 0.75],
  tierRankRadius: [1.14, 0.88],
};

/**
 * slot-6 疏松组合（疏端）：密冠谱系的相对疏端（密冠透天比例 Unknown——探针定档，
 * 判定 11）。组合：canopyDensity 0.82 + 簇抑制升（**0.04**——Step 4 同步值：新簇
 * 半径 0.09–0.15 口径的疏端抑制，= 基准 0.02 × 2 的读向差）+ 簇外移（0.24/0.22
 * ——外段受光集中）+ 树高 21（疏冠高个体）+ 冠幅 0.24 + 干高 0.44 + 膨大 1.4 +
 * 垂帘 1.10。
 */
const METASEQUOIA_SLOT6_PROFILE: ConiferShapeProfile = {
  ...METASEQUOIA_SLOT0_PROFILE,
  totalHeight: 21,
  crownWidthRatio: 0.24,
  trunkHeightRatio: 0.44,
  trunkFlareRatio: 1.4,
  crownAsymmetry: 0.25,
  canopyDensity: 0.82,
  clusterMinSeparation: 0.04,
  clusterInnerStartL5: 0.24,
  clusterInnerStartL4: 0.22,
  fringeLengthRatio: 1.1,
};

/**
 * slot-7 丰满组合（密端）：密连续锥冠的密实端（冠连续密实 s01/s03 Observed 的密
 * 端）。组合：canopyDensity 0.97 + 簇抑制最低（**0——密端零抑制**，Step 4 同步值：
 * 标称簇位全保留，疏密由 density roll 单独承载）+ 簇内移（0.12/0.10——自基部
 * 布满）+ 树高 18.5 + 冠幅 0.27（密簇体量）+ 干高 0.38 + 膨大 1.7 + 外缘下卷 0.06。
 */
const METASEQUOIA_SLOT7_PROFILE: ConiferShapeProfile = {
  ...METASEQUOIA_SLOT0_PROFILE,
  totalHeight: 18.5,
  crownWidthRatio: 0.27,
  trunkHeightRatio: 0.38,
  trunkFlareRatio: 1.7,
  crownAsymmetry: 0.24,
  canopyDensity: 0.97,
  clusterMinSeparation: 0,
  clusterInnerStartL5: 0.12,
  clusterInnerStartL4: 0.1,
  tierEdgeDroop: 0.06,
};

/**
 * 形态槽路由表：索引 = shapeSlot（八槽差量语法沿雪松先例——slot-1…7 以 slot-0 锚点
 * 为底展开定义；方向名仅为标签，槽身份 = 多维取值整体组合）。8 槽主轴覆盖（判定 10
 * 变体主轴 ⊂ Spec 域）：树高 15–25 ⊂ 18–25 生产域（幼树端下探）× 冠幅 0.20–0.32 ⊂
 * 0.22–0.30 带内展开（幼极窄 ↔ 老阔圆锥年龄轴）× 干高 0.35–0.50 × 膨大 1.3–2.0 ×
 * 年龄轴（slot-1 幼树极窄 ↔ slot-0 中龄密尖塔 ↔ slot-2 老树阔圆锥）× 疏密轴
 * （slot-6/7）；**层数 8–12 轴因结构计数类跨槽恒等不进槽差异**（全槽 tierCount 10
 * ——表观差异由层距/展幅连续参数承载，缺口候选归族门，见模块头）。
 * **结构计数类**（tierCount / tierBranchCount / trunk·levels radial·segs /
 * childPlan / clustersL5·L4 / longShootCardsL5·L4 / cone·strobilus 候选 /
 * tierRank* 数组长度）与**叶身份类**（羽卡元素数与尺度域 / 球果与枯穗组 /
 * needleMaterial / bark / wind / 挂点语言位 tierPhaseStagger·clusterAzimuthStep）
 * 由差量展开继承**逐位恒等**（皮面数恒等 17136 与 rng 消费次数恒等的结构性保证
 * ——挂点基数 12/8 同为计数类，Step 4 校准全槽同调）；槽差异全部落连续形态参数。
 * morphSeed 路由见
 * assets/asset_tree_metasequoia.asset（Step 3 交付）。
 */
export const METASEQUOIA_SHAPE_PROFILES: ConiferShapeProfile[] = [
  METASEQUOIA_SLOT0_PROFILE,
  METASEQUOIA_SLOT1_PROFILE,
  METASEQUOIA_SLOT2_PROFILE,
  METASEQUOIA_SLOT3_PROFILE,
  METASEQUOIA_SLOT4_PROFILE,
  METASEQUOIA_SLOT5_PROFILE,
  METASEQUOIA_SLOT6_PROFILE,
  METASEQUOIA_SLOT7_PROFILE,
];
