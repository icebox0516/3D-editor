/**
 * runtime/procedural/tree/conifer/coniferShapeProfile —— 针叶家族形态参数面**契约定稿**
 * （T012.1 Step 2 创建草案 2026-09-28 → **T012.2 Step 2 转正定稿 2026-09-29**：spine §6
 *  D37 六步第 6 步——第二例〔水杉 asset_tree_metasequoia〕真实消费后转正）。
 * 转正差异（一行化）：全字段【家族共性候选】重标注为消费终标（家族共性 50 / 族内可选·
 * 雪松消费 11 / 工程设定 11）+ 新增可选位 8（tierPhaseStagger / clusterAzimuthStep /
 * needleMaterial.needleFaceContrast / strobili 组 5——均为可选字段，cedrus 实例化零触碰
 * 零行为变化）+ 删除 0；数值零出现纪律不变。
 *
 * 职责：针叶（松柏类 conifer）乔木家族的 shapeProfile 类型契约——自两真实实例雪松
 *      （asset_tree_cedrus，T012.1）与水杉（asset_tree_metasequoia，T012.2）的消费
 *      需求定字段集（D20.3 / D37——无投机字段；第三例起增量消费，不再整面重标）。
 * 定稿纪律（模块级承诺）：
 *   - **标注四档（以两例真实消费为准）**：【家族共性】= 雪松+水杉均消费（雪松消费点 =
 *     其 config 字段注释 3a/3b；水杉消费点 = ../metasequoia/metasequoiaShapeProfile）；
 *     【族内可选·雪松消费】= 仅雪松消费（水杉填工程占位零值，字段语义不驱动其形态）；
 *     【族内可选·水杉消费】= 仅水杉消费的新可选位（可选字段——雪松实例化省略，零触碰
 *     零行为变化）；【工程设定】= 两例均消费但字段语义为**采样与预算计划位**（面数拓扑
 *     档 / 挂点采样计划 / 账目存活率——值来自探针与校准回路，无 Spec 读向锚）；
 *   - **数值零出现**——契约只定义字段结构 / 语义 / 类型与消费点；一切数值依据（Spec
 *     数值域、锚定值、实测校准记录）留在资产 config（雪松 = ../cedrus/cedrusShapeProfile、
 *     水杉 = ../metasequoia/metasequoiaShapeProfile；organization.md §3 语义与数值分离）；
 *   - 本文件只有类型与文档，零运行时——无工厂、无默认值对象、无常量。
 * 与阔叶契约（../broadleaf/broadleafShapeProfile）的正交决策（T012.1 待裁决位 1；
 * 转正复核维持 + 两例分化注记）：
 *   - 骨架语言 = **层状轮生枝姿**（近轮生成层 / 层角梯度 / 层板轮廓 / 层隙观感带），
 *     非阔叶「骨架枝 + 挂高段 + 椭球密度场」语言——契约不含 crownCenterRatio /
 *     crownHeightRatio / crownTopBias 一类椭球密度场参考系字段；层内方位律族内分化
 *     （雪松 = 近轮任意方位 + 抖动 / 水杉 = 对生成对 + 层间交错——tierPhaseStagger）；
 *     层隙观感带水杉以零端值消费 = 密连续锥冠（消费差异即转正素材，字段保留）；
 *   - 姿态语言 = **droop**（末级下垂）——幅度谱系族内分化（雪松层缘垂帘重 / 水杉轻垂）；
 *     **顶梢专路 = 族内可选·雪松消费**（leaderDroop 下垂点头 + 顶梢风动成分——水杉
 *     leader 通直无点头，填零占位）；
 *   - 叶语言 = **叶卡 SDF 抽象**（卡 = 叶量质量单元；卡形态语言资产侧定：雪松 = 短枝
 *     莲座簇卡 + 长枝散生针卡〔长短枝双挂点〕/ 水杉 = 羽状小枝卡〔对生叶序单挂点〕——
 *     主卡尺度域 / 叶卡轮廓比域 / SDF 叶元素数字段两例共用，散生单针卡字段仅雪松消费）；
 *   - 两面色差 = **族内可选位**（needleFaceContrast 省略 = 无两面差语义〔雪松针叶辐射
 *     着生，色差来自受光与白粉〕；水杉条形叶二列消费温和两面差——T012.2 Step 1 判定 7
 *     族内差异轴的参数化落位）；
 *   - 器官账目组含颜色字段（颜色随账目成组；账目器官与着生姿态〔直立如烛 / 长柄下垂〕
 *     为资产几何侧语言，不进契约字段）；两类果并存 = 翌年熟时窗错位语义（仅雪松）；
 *     第二器官（花粉序枯穗）= 族内可选组 strobili（水杉消费——单性序器官的族扩展点）；
 *   - 树皮组为**材质语言**（单元形状语言资产侧定：雪松 = 鳞状方块片 SDF〔第 14 语言〕/
 *     水杉 = 纵长条片-纤维剥落 SDF〔第 15 语言〕——契约只承载单元尺度域 / 沟深 / 三色）；
 *     几何侧树皮轮廓层未进契约（缺口候选归族门，若 3a 需要再记）。
 * 槽间恒等纪律（多形态槽资产的皮面数恒等与确定性保证）：**结构计数类**字段
 *      （tierCount / tierBranchCount / trunk 与 levels 的 radial·segs / childPlan /
 *      clustersL5·L4 / longShootCardsL5·L4 / coneCandidates / strobili.candidates /
 *      tierRank* 数组长度）跨槽恒定——计数类改值即改面数与 rng 消费次数；**叶身份类**
 *      （叶元素数 / 卡尺寸与轮廓比域 / 球果与序组 / 树皮 / 针叶色 / 风动参数 / 挂点
 *      语言位 tierPhaseStagger·clusterAzimuthStep·childPlan.phaseStep）槽间不动（叶与
 *      器官身份 + 挂点语言身份）；**连续形态参数**（体量 / 层角 / 层板 / 疏密 / 姿态
 *      幅度 / 干基膨大）承担全部槽差异；**rng 无条件消费纪律**（消费次数与数据分支
 *      无关——簇位 / 卡 / 果与序候选足额消费后按规则丢弃）。
 * 边界：家族类型层，不进 ProceduralBuild 公共签名（build 只做 slot → profile 路由，
 *      见资产入口文件）；比率字段以 totalHeight（形态参数域树高）为基；角度字段以度存、
 *      弧度算（clusterAzimuthStep 例外 = 弧度存，沿 childPlan.phaseStep 口径）；颜色字段
 *      为 sRGB hex（0xRRGGBB），材质层负责工作色域转换。
 */

/** 体量与干形（3a 几何消费：总体 scale / 干管发射 / 首层挂高；两例均消费）。【家族共性】 */
export interface ConiferScaleProfile {
  /** 形态参数域树高（米）——几何总高直接驱动；**同源风动树高锚**（3b 材质 uTime 摆幅
   *  的树高归一基准——两层风动的锚同步轮消费本字段，契约不含独立风动锚字段）。
   *  【家族共性】（连续形态参数——槽差异主轴之一） */
  totalHeight: number;
  /** 冠幅 / 树高（尖塔冠体量——层板半径域的共同驱动）。【家族共性】（连续） */
  crownWidthRatio: number;
  /** 干高占比（首层挂高 / 树高——视觉冠底锚：孤立木下层枝近地 ↔ 立木清干两端的槽
   *  差异轴载体）。【家族共性】（连续） */
  trunkHeightRatio: number;
  /** 干顶径 / 基径（干管通体锥度——端直树干的收细；方向 = 干形定性读向，数值工程）。
   *  【家族共性】（连续） */
  trunkTaperRatio: number;
  /** 根部展宽（基径 / 胸高处径——干基 flare / 基部膨大板根状；强度谱系族内分化——
   *  轻度端 ↔ 显著膨大端，数值锚归资产 Spec）。【家族共性】（连续——年龄轴载体之一） */
  trunkFlareRatio: number;
  /** 冠不对称强度 0–1（层内枝方位抖动幅度缩放——层状环的规整度载体；层内方位律
   *  族内分化：近轮散布 ↔ 对生成对）。【家族共性】（连续） */
  crownAsymmetry: number;
}

/** 层结构（身份核心：近轮生成层——3a 几何消费：层位量化挂点路由 / 层角梯度 / 层板轮廓 /
 *  顶梢延伸）。【家族共性为主】 */
export interface ConiferTierProfile {
  /** 主层数。【结构计数类：槽间恒等】（层 × 每层枝 × 逐级拓扑 = 皮面数与 rng 消费次数
   *  的结构性来源；表观层数差异由层隙 / 展幅连续参数间接表达——层数轴槽间展开属契约
   *  缺口候选，归族级验收门）。【家族共性】 */
  tierCount: number;
  /** 每层主枝数（层内方位近均分的布点数——层内方位律族内分化：近轮多枝 ↔ 对生成对，
   *  数值资产侧定）。【结构计数类：槽间恒等】【家族共性】 */
  tierBranchCount: number;
  /** 层位垂直抖动幅度（层间距均匀性的个体散布——0 = 严格等距；方向 = 轮生规整度
   *  定性读向）。【家族共性】（连续） */
  tierSpacingJitter: number;
  /** 最下层主枝角（度，**自垂直角**——大角 = 平展、小角 = 上举；层角沿高度自本值向
   *  tierAngleTop 插值 = 层角梯度）。【家族共性】（连续） */
  tierAngleBase: number;
  /** 最上层主枝角（度，自垂直角——上部层上举端）。【家族共性】（连续） */
  tierAngleTop: number;
  /** 层内枝角抖动（度，rng 域——层状非机械规整的散布；方向定性，幅度工程）。
   *  【家族共性】（连续） */
  tierAngleJitter: number;
  /** 顶层枝长 / 底层枝长（层半径沿高收敛——尖塔剪影的直接驱动）。【家族共性】（连续） */
  tierRadiusTaper: number;
  /** 层半径沿高分布形状（指数：>1 = 中下部宽展、顶部急收的「上段渐尖收顶」；1 = 线性
   *  锥——层叠尖塔 ↔ 连续光滑锥的谱系由本值承载）。【家族共性】（连续） */
  tierProfileExponent: number;
  /** 层板拱起强度（层板中部上拱 / 层半径——升扇形/拱形层板轮廓）。【家族共性】（连续） */
  tierPlateArch: number;
  /** 层板外缘下卷（外缘先平后微垂下卷 / 层半径——层缘姿态）。【家族共性】（连续） */
  tierEdgeDroop: number;
  /** 层内枝 rank 长度乘子（按方位序——**跨层同方位一致**：环内势差与相干偏冠的载体；
   *  长度 = tierBranchCount——对生成对律下对内近等、破缺即偏冠槽载体）。
   *  【数组长度 = 结构计数类：槽间恒等；值 = 连续】【家族共性】 */
  tierRankLength: number[];
  /** 层内枝 rank 起径乘子（与长度同向——主导枝更粗；长度 = tierBranchCount）。
   *  【数组长度 = 结构计数类：槽间恒等；值 = 连续】【家族共性】 */
  tierRankRadius: number[];
  /** 层枝起径 / 主干挂点径（大枝的相对粗度——massive ↔ 纤细分枝谱系，方向定性读向）。
   *  【家族共性】（连续） */
  tierBranchRadiusRatio: number;
  /** 顶梢段长 / 树高（最上层挂点以上的干顶延伸——顶梢细尖的长度占比）。【家族共性】
   *  （连续——年龄轴载体：幼树顶梢主导强） */
  leaderLengthRatio: number;
  /** 顶梢下垂强度（0–1——顶梢专路下垂点头的幅度；近景身份读向）。【族内可选·雪松
   *  消费】（水杉 leader 通直无点头——填 0 工程占位，专路不实现） */
  leaderDroop: number;
  /** 相邻主层方位交错角（度存弧度算——层间方位律：0 / 省略 = 层间同相或近轮随机；
   *  给定 = 对生成对的层间交错〔decussate 观感〕——对生枝序资产的层状表达）。
   *  【挂点语言身份：槽间恒等】【族内可选·水杉消费】（雪松近轮任意方位，省略） */
  tierPhaseStagger?: number;
}

/**
 * 针叶挂点与簇布点（3a 几何消费：叶卡挂点 / 簇位 / 层隙带；疏密轴载体）。主叶卡字段
 * 两例共用（卡形态语言资产侧定：莲座簇卡 ↔ 羽状小枝卡）；散生单针卡仅雪松消费。
 */
export interface ConiferFoliageProfile {
  /** 主叶卡 SDF 叶元素数（单卡内的叶元素计数——**材质消费**〔叶卡 SDF〕；卡形态语言
   *  资产侧定：雪松 = 莲座簇放射针数 / 水杉 = 羽列二列叶数。LOD 降档 = 该值递减派生
   *  归 3b，非面数计数）。【叶身份：槽间恒等】【家族共性】 */
  rosetteNeedles: number;
  /** 主叶卡尺度域（米，min + rng×span——单卡 = 叶量质量单元的抽象，非等比复刻真叶；
   *  卡形态语言资产侧定：雪松 = 莲座簇卡边长 / 水杉 = 羽状小枝卡长——尺度档位谱系
   *  〔大卡面质量 ↔ 细质地密集〕由资产侧数值与挂点密度组合表达）。
   *  【叶身份：槽间恒等】【家族共性】 */
  rosetteCardMin: number;
  rosetteCardSpan: number;
  /** 散生单针卡长域（米，min–span rng 抽样——长短枝双挂点的长枝侧单针卡；仅雪松
   *  消费）。【叶身份：槽间恒等】【族内可选·雪松消费】（水杉无散生单针挂点——填 0
   *  工程占位） */
  needleCardLenMin: number;
  needleCardLenSpan: number;
  /** 叶卡轮廓长宽比域（min–span rng 抽样——卡形态语言资产侧定：雪松 = 单针细长比 /
   *  水杉 = 羽卡卵状椭圆轮廓比；真叶 microscopic 宽度由 SDF 内部承载不进本域）。
   *  【叶身份：槽间恒等】【家族共性】 */
  needleCardAspectMin: number;
  needleCardAspectSpan: number;
  /** 末两级（L5/L4）每枝簇位数量（叶卡挂点位）。【结构计数类：rng 消费次数恒定
   *  的来源，槽间恒等；保留簇数随 seed 由簇级抑制规则确定】【工程设定——挂点采样
   *  计划位，值由密度探针定档】 */
  clustersL5: number;
  clustersL4: number;
  /** 散生单针卡数（L5/L4 逐枝固定计数——rng 无条件消费；仅雪松消费）。
   *  【结构计数类：槽间恒等】【族内可选·雪松消费】（水杉填 0 工程占位——挂点通路
   *  不实现） */
  longShootCardsL5: number;
  longShootCardsL4: number;
  /** 簇挂点 t 域下限（沿枝弧长——挂点前移 / 外段受光集中读向的幅度映射；浓密板
   *  校准杠杆之一）。【工程设定——挂点采样计划位（校准回调主位）】 */
  clusterInnerStartL5: number;
  clusterInnerStartL4: number;
  /** 簇级显式剔除：与已保留簇中心距 < 此值×(ri+rj) 的簇位丢弃（簇位 rng 足额消费后
   *  丢弃——确定性不破）。【工程设定——管线抑制位】 */
  clusterMinSeparation: number;
  /** 末级枝长加长乘子（下垂段 lengthRatio 加长——末级下垂的长度侧）。
   *  【家族共性】（连续——年龄轴载体之一） */
  fringeLengthRatio: number;
  /** 基准密度乘子（整体簇卡量缩放；消费端截断 ≤1；疏密个体变体的槽差异载体——两例
   *  疏密轴均真实）。【家族共性】（连续） */
  canopyDensity: number;
  /** 层隙观感带（层间空带高 / 层间距——簇布点按层聚集、层间留空；**零端值 = 连续
   *  分布无层隙**——层叠带隙尖塔 ↔ 密连续锥冠的谱系由本值承载，消费差异即转正素材；
   *  vs 阔叶外密内疏的层状空隙语言）。【家族共性】（连续——水杉零端消费） */
  tierGapBand: number;
  /** 簇挂点方位步进（弧度；**省略 = rng 方位散布**〔雪松近轮散布〕；给定 = 确定性
   *  方位步进的叶序挂点语言〔水杉对生交错叶序——逐点步进 + 偶奇配对为 3a 实现〕；
   *  沿 childPlan.phaseStep 弧度口径）。【挂点语言身份：槽间恒等】【族内可选·水杉
   *  消费】 */
  clusterAzimuthStep?: number;
}

/**
 * 球果账目（3a 几何消费：结果枝带布点 + posHash 确定性存活；3b 材质消费：果色组）。
 * 账目法语义：候选足额 rng 消费后按 keep 比例与结果位规则丢弃——消费次数与数据分支
 * 无关。着生姿态（直立如烛 / 长柄下垂）与果序形态 = 资产几何侧语言，不进契约字段。
 */
export interface ConiferConeProfile {
  /** 结果枝带起点 t（沿枝弧长——外段结果位；t ≥ 此值的外段枝位为结果候选）。
   *  【叶身份：槽间恒等（账位语言）】【家族共性】 */
  coneFruitingZone: number;
  /** 每结果位候选果数（固定计数——rng 无条件消费；单生 ↔ 数枚谱系由资产 Spec 定）。
   *  【结构计数类：槽间恒等】【家族共性】 */
  coneCandidates: number;
  /** 候选存活比例（0–1——全冠绝对量级的定档载体，账目法连续侧）。【工程设定——
   *  量级定档旋钮（Inferred 量级的工程落位，探针复核）】【叶身份侧：槽间恒等】 */
  coneKeepRatio: number;
  /** 球果尺度域（米，min + rng×span——近真尺寸锚定归资产 Spec）。【叶身份：槽间
   *  恒等】【家族共性】 */
  coneSizeMin: number;
  coneSizeSpan: number;
  /** 两类果并存比（0–1——将熟果占比；两类并存 = **翌年熟时窗错位**语义〔上年将熟 +
   *  当年幼果〕，仅雪松；当年熟单 cohort 资产填满值占位）。【叶身份：槽间恒等】
 *  【族内可选·雪松消费】 */
  coneClassRatio: number;
  /** 主类果表征色（sRGB hex——熟相端的表征色，色相锚归资产 Spec；果形 SDF 归材质）。
   *  【叶身份：槽间恒等】【家族共性】 */
  coneColorMature: number;
  /** 次类果色（sRGB hex——当年幼果端；与两类并存语义成组）。【叶身份：槽间恒等】
   *  【族内可选·雪松消费】（单 cohort 资产填同域占位） */
  coneColorYoung: number;
  /** 宿存中轴色（sRGB hex——果熟种鳞散落后中轴留枝的淡入色；**整果脱落型资产不
   *  消费**）。【叶身份：槽间恒等】【族内可选·雪松消费】（水杉熟果整果脱落——填
   *  占位色） */
  coneAxisColor: number;
}

/**
 * 花序（花粉序）枯穗第二器官账目（3a 几何消费：布点 + posHash 确定性存活；3b 材质
 * 消费：枯穗色）——单性同株资产的雄序残留表达（主语境挂上年枯序的近景身份细节）。
 * 账目法语义同球果组（候选足额 rng 消费后按 keep 丢弃）。可选组：不消费的实例省略
 * 整组（零触碰）。【族内可选·水杉消费】
 */
export interface ConiferStrobilusProfile {
  /** 每结果位候选穗数（固定计数——rng 无条件消费）。【结构计数类：槽间恒等】
   *  【族内可选·水杉消费】 */
  strobilusCandidates: number;
  /** 候选存活比例（0–1——全冠量级定档，账目法连续侧）。【工程设定语义｜族内可选·
   *  水杉消费】 */
  strobilusKeepRatio: number;
  /** 枯穗长度域（米，min + rng×span——近真尺寸锚定归资产 Spec）。【叶身份：槽间
   *  恒等】【族内可选·水杉消费】 */
  strobilusSizeMin: number;
  strobilusSizeSpan: number;
  /** 枯穗色（sRGB hex——枯褐表征端）。【叶身份：槽间恒等】【族内可选·水杉消费】 */
  strobilusColor: number;
}

/** 针叶色材质参数（3b 材质消费：色相身份 + 受光色差；两面色差 = 族内可选位——
 *  needleFaceContrast 省略即「无两面差」语义本身〔辐射着生〕，条形叶二列资产以温和
 *  值消费）。 */
export interface ConiferNeedleMaterialProfile {
  /** 受光面（阳面）针色（sRGB hex）。【叶身份：槽间恒等】【家族共性】 */
  needleColorSun: number;
  /** 荫面针色（sRGB hex——深色端；阳亮荫深 = 受光色差语言）。【叶身份：槽间恒等】
   *  【家族共性】 */
  needleColorShade: number;
  /** 白粉强度 0–1（粉调来源——气孔线白粉的工程映射；无白粉读向资产填零占位）。
   *  【叶身份：槽间恒等】【族内可选·雪松消费】 */
  needleGlaucousBloom: number;
  /** 叶龄梯度强度 0–1（新梢淡 → 老叶深的域内变体——非季相语义）。【叶身份：槽间
   *  恒等】【家族共性】 */
  needleJuvenility: number;
  /** 两面色差强度 0–1（上面深 / 下面浅的温和差——条形叶二列着生的两面读向；省略 /
   *  零 = 无两面差〔辐射着生语义——色差来自受光与白粉〕）。【叶身份：槽间恒等】
   *  【族内可选·水杉消费】 */
  needleFaceContrast?: number;
}

/** 树皮材质参数（3b 材质消费：单元形状语言资产侧定——鳞状方块片 / 纵长条片-纤维
 * 剥落等同科语言轴分化；契约只承载单元尺度域 / 沟深 / 三色，SDF 形状归材质；几何侧
 * 轮廓起伏层未进契约，见模块头缺口记档）。【家族共性】 */
export interface ConiferBarkProfile {
  /** 树皮单元尺度域（米，min + rng×span——单元 = 块片 / 条片〔形状语言资产侧定〕）。
   *  【叶身份：槽间恒等】【家族共性】 */
  barkPlateMin: number;
  barkPlateSpan: number;
  /** 沟深强度 0–1（单元间沟的 SDF 深度对比——浅沟 ↔ 深裂端）。【叶身份：槽间恒等】
   *  【家族共性】 */
  barkGrooveDepth: number;
  /** 树皮基色（sRGB hex——单元间基面）。【叶身份：槽间恒等】【家族共性】 */
  barkBaseColor: number;
  /** 单元顶色（sRGB hex——单元顶/脊面浅色端）。【叶身份：槽间恒等】【家族共性】 */
  barkPlateColor: number;
  /** 沟色（sRGB hex——单元间沟深色端）。【叶身份：槽间恒等】【家族共性】 */
  barkGrooveColor: number;
}

/**
 * 风动两层多成分（3b 材质消费：aSeed / aBend 契约字段沿用；树高锚 = totalHeight
 * 同源——**契约不含独立锚字段**，锚同步轮直读 scale 组）。频率 Hz（uTime 驱动）、
 * 幅度为归一化摆幅（× totalHeight 锚缩放）。成分消费谱系：整层慢摆 + 末级细颤两成分
 * 家族共用；顶梢成分 = 族内可选·雪松消费（水杉不消费填零占位）。
 */
export interface ConiferWindProfile {
  /** 整层低频慢摆幅度（层状大枝 massive 粗刚——第一成分）。【叶身份：槽间恒等】
   *  【家族共性】 */
  windTierAmplitude: number;
  /** 整层摆频率（Hz——慢摆端）。【叶身份：槽间恒等】【家族共性】 */
  windTierFrequency: number;
  /** 末级细柔高频颤幅度（垂帘 / 叶簇 / 羽枝——第二成分）。【叶身份：槽间恒等】
   *  【家族共性】 */
  windFringeAmplitude: number;
  /** 末级颤频率（Hz——高频端）。【叶身份：槽间恒等】【家族共性】 */
  windFringeFrequency: number;
  /** 顶梢摆幅度（下垂顶梢的明显摆幅——第三成分；顶梢专路配套）。【叶身份：槽间
   *  恒等】【族内可选·雪松消费】（水杉顶梢通直不消费——填 0 占位） */
  windLeaderAmplitude: number;
  /** 顶梢摆频率（Hz）。【叶身份：槽间恒等】【族内可选·雪松消费】（同上填 0 占位） */
  windLeaderFrequency: number;
}

/** 主干拓扑预算（radial/segs 为结构计数类——改值即改面数；wander = 干轴游走，
 *  连续）。【radial/segs = 工程设定（面数档）；wander = 家族共性（干形定性方向）】 */
export interface ConiferTrunkTopology {
  /** 径向分段（管周向顶点数——树皮单元 SDF 周向频率的奈奎斯特域 + 近景圆度）。
   *  【结构计数类：槽间恒等】【工程设定】 */
  radial: number;
  /** 环段数（管轴向前向分段——与树高级匹配）。【结构计数类：槽间恒等】【工程设定】 */
  segs: number;
  /** 干轴方向游走幅度（端直干 = 低值；方向 = 干形定性读向）。【家族共性】（连续） */
  wander: number;
}

/** 逐级枝拓扑预算（L1 层枝 → 末级细枝；长度 = 分枝级数——级数为实例口径）。
 *  【radial/segs = 工程设定（面数档）；wander/droop = 家族共性】 */
export interface ConiferLevelTopology {
  /** 径向分段。【结构计数类：槽间恒等】【工程设定】 */
  radial: number;
  /** 环段数。【结构计数类：槽间恒等】【工程设定】 */
  segs: number;
  /** 方向游走幅度（粗枝刚直、细枝纷乱——主次分级；连续）。【家族共性】 */
  wander: number;
  /** 下垂偏置（0–1——末级细柔下垂的姿态；**与阔叶 upturn 反向的针叶姿态语言**，
   *  幅度谱系族内分化：层缘垂帘重 ↔ 末级轻垂；连续——年龄轴载体）。【家族共性】 */
  droop: number;
}

/** 子枝挂点计划（t 沿父枝弧长；末位 1.0 = 延伸延续枝；逐过渡级一项）。
 *  【ts = 工程设定（采样计划——校准回调主位）；phaseStep = 家族共性（方位律——
 *  对生步进锚由水杉提供）】 */
export interface ConiferChildPlan {
  /** 挂点 t 序列。【结构计数类：改值即改面数与 rng 消费数——槽间恒等】【工程设定】 */
  ts: number[];
  /** 侧枝方位均分步进（弧度——层内/级内方位律：均分步进 ↔ 对生二列步进谱系）。
   *  【家族共性】 */
  phaseStep: number;
}

/**
 * 针叶家族 shapeProfile：四个扁平组 extends 合并（字段访问路径扁平——profile.tierCount
 * 等直读）+ 六个嵌套组（strobili 可选）。两实例的槽组合、数值锚定与实测校准记录见
 * ../cedrus/cedrusShapeProfile 与 ../metasequoia/metasequoiaShapeProfile（本契约只定
 * 字段语义与纪律，不落数值）。
 */
export interface ConiferShapeProfile
  extends ConiferScaleProfile,
    ConiferTierProfile,
    ConiferFoliageProfile,
    ConiferConeProfile {
  /** 针叶色材质参数（3b 消费；结构见 ConiferNeedleMaterialProfile） */
  needleMaterial: ConiferNeedleMaterialProfile;
  /** 树皮材质参数（3b 消费；结构见 ConiferBarkProfile） */
  bark: ConiferBarkProfile;
  /** 风动两层多成分（3b 消费；树高锚同源 totalHeight；结构见 ConiferWindProfile） */
  wind: ConiferWindProfile;
  /** 主干拓扑预算（结构见 ConiferTrunkTopology） */
  trunk: ConiferTrunkTopology;
  /** 逐级枝拓扑（L1 层枝 → 末级；长度 = 分枝级数，实例口径）。radial/segs 结构计数类
   *  槽间恒等；wander/droop 连续。 */
  levels: ConiferLevelTopology[];
  /** 子枝挂点计划（逐过渡级一项）。【结构计数类：槽间恒等】 */
  childPlan: ConiferChildPlan[];
  /** 花序枯穗第二器官账目（可选组——不消费的实例省略整组；结构见
   *  ConiferStrobilusProfile）。【族内可选·水杉消费】 */
  strobili?: ConiferStrobilusProfile;
}
