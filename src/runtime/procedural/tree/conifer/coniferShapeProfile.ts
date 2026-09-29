/**
 * runtime/procedural/tree/conifer/coniferShapeProfile —— 针叶家族形态参数面**契约草案**
 * （T012.1 Step 2，spine §6 D37 六步第 3 步：新 Family 首例创建草案——第二例真实消费后
 * 转正定稿；草案期「修订」= 草案创建本身，无 D31.2 阻塞概念）。
 *
 * 职责：针叶（松柏类 conifer）乔木家族的 shapeProfile 类型契约——自第一实例雪松
 *      （asset_tree_cedrus，T012.1）的真实需求**从零建字段**：字段集 = cedrus 几何
 *      （Step 3a cedrusGeometry）/ 材质（Step 3b cedrusMaterials）将消费的字段，
 *      不做预防性字段（D20.3 / D37.2——无投机字段）。
 * 草案纪律（D37.2，模块级承诺）：
 *   - 字段**一律标注【家族共性候选】**——单样本（雪松）不足以判定家族共性；三标注中的
 *     【本资产特有】/【工程设定无现实基准】在资产 config 侧逐字段给出（契约层不区分——
 *     草案期全部字段尚无第二消费者验证）；
 *   - **数值零出现**——契约只定义字段结构 / 语义 / 类型与消费点；一切数值依据（Spec
 *     数值域、锚定值、实测校准记录）留在资产 config（雪松 =
 *     ../cedrus/cedrusShapeProfile；organization.md §3 语义与数值分离）；
 *   - 本文件只有类型与文档，零运行时——无工厂、无默认值对象、无常量。
 * 与阔叶契约（../broadleaf/broadleafShapeProfile）的正交决策（T012.1 待裁决位 1：
 * 针叶形态语言与阔叶正交、契约从零建字段）：
 *   - 骨架语言 = **层状轮生枝姿**（近轮生成层 / 层角梯度 / 层板轮廓 / 层隙观感带），
 *     非阔叶「骨架枝 + 挂高段 + 椭球密度场」语言——冠形参考系由层结构直接驱动，契约
 *     不含 crownCenterRatio / crownHeightRatio / crownTopBias 一类椭球密度场参考系字段；
 *   - 姿态语言 = **droop**（末级下垂——层缘垂帘），非阔叶 upturn（上扬）；
 *   - 叶语言 = **短枝莲座簇卡**（单卡 = 整簇针叶的 SDF 抽象，簇 = 1 卡）+ **长枝散生
 *     针卡**（长短枝双挂点）——无「每簇叶量」字段（簇内针数是 SDF 内部参数归材质）；
 *   - **针叶辐射着生无两面色差**——契约不含两面色差字段即语义本身（vs 阔叶两面色差
 *     语言分化，T012.1 Step 1 判定 6）；
 *   - 器官账目组含颜色字段（球果两类果色 + 宿存中轴色）——首例消费点在材质侧，颜色
 *     随账目成组；
 *   - 树皮组为**材质语言**（鳞状块片 SDF）——阔叶谐波脊几何微起伏机制语言不匹配，
 *     几何侧树皮轮廓层未进草案（缺口候选归族门，若 3a 需要再记）。
 * 槽间恒等纪律（多形态槽资产的皮面数恒等与确定性保证）：**结构计数类**字段
 *      （tierCount / tierBranchCount / trunk 与 levels 的 radial·segs / childPlan /
 *      clustersL5·L4 / longShootCardsL5·L4 / coneCandidates / tierRank* 数组长度）
 *      跨槽恒定——计数类改值即改面数与 rng 消费次数；**叶身份类**（莲座针数 / 卡尺寸 /
 *      长宽比域 / 球果尺寸与账目色 / 树皮 / 针叶色 / 风动参数）槽间不动（叶与器官
 *      身份）；**连续形态参数**（体量 / 层角 / 层板 / 垂帘 / 疏密 / 层隙 / 姿态幅度）
 *      承担全部槽差异；**rng 无条件消费纪律**（消费次数与数据分支无关——簇位 / 散生
 *      卡 / 球果候选足额消费后按规则丢弃）。
 * 边界：家族类型层，不进 ProceduralBuild 公共签名（build 只做 slot → profile 路由，
 *      见资产入口文件）；比率字段以 totalHeight（形态参数域树高）为基；角度字段以度存、
 *      弧度算；颜色字段为 sRGB hex（0xRRGGBB），材质层负责工作色域转换。
 */

/** 体量与干形（3a 几何消费：总体 scale / 干管发射 / 首层挂高）。【家族共性候选】 */
export interface ConiferScaleProfile {
  /** 形态参数域树高（米）——几何总高直接驱动；**同源风动树高锚**（3b 材质 uTime 摆幅
   *  的树高归一基准——两层风动的锚同步轮消费本字段，契约不含独立风动锚字段）。
   *  【家族共性候选】（连续形态参数——槽差异主轴之一） */
  totalHeight: number;
  /** 冠幅 / 树高（尖塔冠体量——层板半径域的共同驱动）。【家族共性候选】（连续） */
  crownWidthRatio: number;
  /** 干高占比（首层挂高 / 树高——视觉冠底锚：孤立木下层枝近地 ↔ 立木清干两端的槽
   *  差异轴载体）。【家族共性候选】（连续） */
  trunkHeightRatio: number;
  /** 干顶径 / 基径（干管通体锥度——端直树干的收细）。【家族共性候选】（连续） */
  trunkTaperRatio: number;
  /** 根部展宽（基径 / 胸高处径——干基 flare）。【家族共性候选】（连续） */
  trunkFlareRatio: number;
  /** 冠不对称强度 0–1（层内枝方位抖动幅度缩放——近轮生环的规整度载体）。【家族共性
   *  候选】（连续） */
  crownAsymmetry: number;
}

/** 层结构（身份核心：近轮生成层——3a 几何消费：层位量化挂点路由 / 层角梯度 / 层板轮廓 /
 *  顶梢专路）。【家族共性候选】 */
export interface ConiferTierProfile {
  /** 主层数。【结构计数类：槽间恒等】（层 × 每层枝 × 逐级拓扑 = 皮面数与 rng 消费次数
   *  的结构性来源；表观层数差异由层隙 / 展幅连续参数间接表达——层数轴槽间展开属契约
   *  缺口候选，归族级验收门）。【家族共性候选】 */
  tierCount: number;
  /** 每层主枝数（近轮生层内方位近均分的布点数）。【结构计数类：槽间恒等】【家族共性候选】 */
  tierBranchCount: number;
  /** 层位垂直抖动幅度（层间距均匀性的个体散布——0 = 严格等距）。【家族共性候选】（连续） */
  tierSpacingJitter: number;
  /** 最下层主枝角（度，**自垂直角**——大角 = 平展、小角 = 上举；层角沿高度自本值向
   *  tierAngleTop 插值 = 层角梯度）。【家族共性候选】（连续） */
  tierAngleBase: number;
  /** 最上层主枝角（度，自垂直角——上部层上举端）。【家族共性候选】（连续） */
  tierAngleTop: number;
  /** 层内枝角抖动（度，rng 域——近轮生非机械规整的散布）。【家族共性候选】（连续） */
  tierAngleJitter: number;
  /** 顶层枝长 / 底层枝长（层半径沿高收敛——尖塔剪影的直接驱动）。【家族共性候选】（连续） */
  tierRadiusTaper: number;
  /** 层半径沿高分布形状（指数：>1 = 中下部宽展、顶部急收的「上段渐尖收顶」；1 = 线性
   *  锥）。【家族共性候选】（连续） */
  tierProfileExponent: number;
  /** 层板拱起强度（层板中部上拱 / 层半径——升扇形/拱形层板轮廓）。【家族共性候选】（连续） */
  tierPlateArch: number;
  /** 层板外缘下卷（外缘先平后微垂下卷 / 层半径——层缘姿态）。【家族共性候选】（连续） */
  tierEdgeDroop: number;
  /** 层内枝 rank 长度乘子（按方位序——**跨层同方位一致**：环内势差与相干偏冠的载体；
   *  长度 = tierBranchCount）。【数组长度 = 结构计数类：槽间恒等；值 = 连续】【家族共性候选】 */
  tierRankLength: number[];
  /** 层内枝 rank 起径乘子（与长度同向——主导枝更粗；长度 = tierBranchCount）。
   *  【数组长度 = 结构计数类：槽间恒等；值 = 连续】【家族共性候选】 */
  tierRankRadius: number[];
  /** 层枝起径 / 主干挂点径（massive 大枝的相对粗度）。【家族共性候选】（连续） */
  tierBranchRadiusRatio: number;
  /** 顶梢段长 / 树高（最上层挂点以上的干顶延伸——顶梢细尖的长度占比；顶梢下垂的
   *  作用段）。【家族共性候选】（连续） */
  leaderLengthRatio: number;
  /** 顶梢下垂强度（0–1——顶梢专路下垂点头的幅度；近景身份读向）。【家族共性候选】（连续） */
  leaderDroop: number;
}

/**
 * 针叶挂点与簇布点（3a 几何消费：长短枝双挂点 / 簇位 / 层隙带；疏密轴载体）。
 * 【家族共性候选】
 */
export interface ConiferFoliageProfile {
  /** 短枝莲座簇针数（单卡 SDF 内的放射针数——**材质消费**〔莲座簇卡 SDF〕；LOD 降档
   *  = 该值递减派生归 3b，非面数计数）。【叶身份：槽间恒等】【家族共性候选】 */
  rosetteNeedles: number;
  /** 莲座簇卡边长域（米，min + rng×span——单卡 = 整簇针叶的抽象，非等比复刻真针）。
   *  【叶身份：槽间恒等】【家族共性候选】 */
  rosetteCardMin: number;
  rosetteCardSpan: number;
  /** 长枝散生针卡长域（米，min–span rng 抽样——长短枝双挂点的长枝侧单针卡）。
   *  【叶身份：槽间恒等】【家族共性候选】 */
  needleCardLenMin: number;
  needleCardLenSpan: number;
  /** 针卡长宽比域（min–span rng 抽样——细长针形语言，与阔叶阔叶形长宽比域正交）。
   *  【叶身份：槽间恒等】【家族共性候选】 */
  needleCardAspectMin: number;
  needleCardAspectSpan: number;
  /** 末两级（L5/L4）每枝簇位数量（短枝莲座簇挂点）。【结构计数类：rng 消费次数恒定
   *  的来源，槽间恒等；保留簇数随 seed 由簇级抑制规则确定】【家族共性候选】 */
  clustersL5: number;
  clustersL4: number;
  /** 长枝散生卡数（L5/L4 逐枝固定计数——rng 无条件消费）。【结构计数类：槽间恒等】
   *  【家族共性候选】 */
  longShootCardsL5: number;
  longShootCardsL4: number;
  /** 簇挂点 t 域下限（沿枝弧长——外段受光集中读向的幅度映射）。【家族共性候选】（连续） */
  clusterInnerStartL5: number;
  clusterInnerStartL4: number;
  /** 簇级显式剔除：与已保留簇中心距 < 此值×(ri+rj) 的簇位丢弃（簇位 rng 足额消费后
   *  丢弃——确定性不破）。【家族共性候选】（连续） */
  clusterMinSeparation: number;
  /** 末级枝长加长乘子（垂帘段 lengthRatio 加长——层缘垂帘的长度侧）。【家族共性候选】
   *  （连续——年龄轴载体之一） */
  fringeLengthRatio: number;
  /** 基准密度乘子（整体簇卡量缩放；消费端截断 ≤1）。【家族共性候选】（连续——疏密
   *  槽差异的载体） */
  canopyDensity: number;
  /** 层隙观感带（层间空带高 / 层间距——簇布点按层聚集、层间留空；vs 阔叶外密内疏的
   *  层状空隙语言）。【家族共性候选】（连续） */
  tierGapBand: number;
}

/**
 * 球果直立账目（3a 几何消费：层板外缘结果枝带布点 + posHash 确定性存活；3b 材质消费：
 * 两类果色 + 宿存中轴色）。账目法语义：候选足额 rng 消费后按 keep 比例与结果位规则
 * 丢弃——消费次数与数据分支无关。【家族共性候选】
 */
export interface ConiferConeProfile {
  /** 结果枝带起点 t（沿层板枝弧长——外缘结果位；t ≥ 此值的外段枝位为结果候选）。
   *  【叶身份：槽间恒等（账位语言）】【家族共性候选】 */
  coneFruitingZone: number;
  /** 每结果位候选果数（固定计数——rng 无条件消费）。【结构计数类：槽间恒等】
   *  【家族共性候选】 */
  coneCandidates: number;
  /** 候选存活比例（0–1——全冠绝对量级的定档载体，账目法连续侧）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  coneKeepRatio: number;
  /** 球果长度域（米，min + rng×span——近真尺寸的大型果身份）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  coneSizeMin: number;
  coneSizeSpan: number;
  /** 两类果并存比（0–1 = 将熟果占比——上年将熟（绿/转褐）: 当年幼果（淡绿）的主语境
   *  语境比；两类并存为账目语言的成组语义）。【叶身份：槽间恒等】【家族共性候选】 */
  coneClassRatio: number;
  /** 将熟果色（sRGB hex——熟时转红褐端的表征色；直立桶形 SDF 归材质）。【叶身份：槽间
   *  恒等】【家族共性候选】 */
  coneColorMature: number;
  /** 当年幼果色（sRGB hex——淡绿带粉端）。【叶身份：槽间恒等】【家族共性候选】 */
  coneColorYoung: number;
  /** 宿存中轴色（sRGB hex——果熟种鳞散落后中轴留枝的淡入色）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  coneAxisColor: number;
}

/** 针叶色材质参数（3b 材质消费：灰绿蓝粉调身份 + 受光色差；**无两面色差字段 = 语义
 *  本身**——针叶辐射着生，色差来自受光与白粉而非叶面腹背）。【家族共性候选】 */
export interface ConiferNeedleMaterialProfile {
  /** 受光面（阳面）针色（sRGB hex——银灰-蓝绿端）。【叶身份：槽间恒等】【家族共性候选】 */
  needleColorSun: number;
  /** 荫面针色（sRGB hex——深绿端；阳银荫深 = 受光色差语言）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  needleColorShade: number;
  /** 白粉强度 0–1（银灰粉调来源——气孔线白粉的工程映射）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  needleGlaucousBloom: number;
  /** 叶龄梯度强度 0–1（新梢淡绿银灰 → 老叶深绿的域内变体——非季相语义）。【叶身份：
   *  槽间恒等】【家族共性候选】 */
  needleJuvenility: number;
}

/** 树皮材质参数（3b 材质消费：鳞状方块片 SDF——独立语言位；几何侧轮廓起伏层未进草案，
 * 见模块头缺口记档）。【家族共性候选】 */
export interface ConiferBarkProfile {
  /** 块片边长域（米，min + rng×span——方-长方形鳞状块片的尺度域）。【叶身份：槽间
   *  恒等】【家族共性候选】 */
  barkPlateMin: number;
  barkPlateSpan: number;
  /** 沟深强度 0–1（块间沟的 SDF 深度对比——浅沟 ↔ 深裂端）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  barkGrooveDepth: number;
  /** 树皮基色（sRGB hex——沟间块片基面）。【叶身份：槽间恒等】【家族共性候选】 */
  barkBaseColor: number;
  /** 块顶色（sRGB hex——块片顶面浅色端）。【叶身份：槽间恒等】【家族共性候选】 */
  barkPlateColor: number;
  /** 沟色（sRGB hex——块间沟深色端）。【叶身份：槽间恒等】【家族共性候选】 */
  barkGrooveColor: number;
}

/**
 * 风动两层三成分（3b 材质消费：aSeed / aBend 契约字段沿用；树高锚 = totalHeight
 * 同源——**契约不含独立锚字段**，锚同步轮直读 scale 组）。频率 Hz（uTime 驱动）、
 * 幅度为归一化摆幅（× totalHeight 锚缩放）。【家族共性候选】
 */
export interface ConiferWindProfile {
  /** 整层低频慢摆幅度（层状大枝 massive 粗刚——第一成分）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  windTierAmplitude: number;
  /** 整层摆频率（Hz——慢摆端）。【叶身份：槽间恒等】【家族共性候选】 */
  windTierFrequency: number;
  /** 层缘垂帘 / 针簇高频颤幅度（末级细柔——第二成分）。【叶身份：槽间恒等】
   *  【家族共性候选】 */
  windFringeAmplitude: number;
  /** 垂帘颤频率（Hz——高频端）。【叶身份：槽间恒等】【家族共性候选】 */
  windFringeFrequency: number;
  /** 顶梢摆幅度（下垂顶梢的明显摆幅——第三成分）。【叶身份：槽间恒等】【家族共性候选】 */
  windLeaderAmplitude: number;
  /** 顶梢摆频率（Hz）。【叶身份：槽间恒等】【家族共性候选】 */
  windLeaderFrequency: number;
}

/** 主干拓扑预算（radial/segs 为结构计数类——改值即改面数；wander = 干轴游走，
 *  连续）。【家族共性候选】 */
export interface ConiferTrunkTopology {
  /** 径向分段（管周向顶点数）。【结构计数类：槽间恒等】【家族共性候选】 */
  radial: number;
  /** 环段数（管轴向前向分段——与树高级匹配）。【结构计数类：槽间恒等】【家族共性候选】 */
  segs: number;
  /** 干轴方向游走幅度（端直干 = 低值；连续形态参数）。【家族共性候选】 */
  wander: number;
}

/** 逐级枝拓扑预算（L1 层枝 → 末级垂帘细枝；长度 = 分枝级数——级数为实例口径）。
 *  【家族共性候选】 */
export interface ConiferLevelTopology {
  /** 径向分段。【结构计数类：槽间恒等】【家族共性候选】 */
  radial: number;
  /** 环段数。【结构计数类：槽间恒等】【家族共性候选】 */
  segs: number;
  /** 方向游走幅度（粗枝刚直、细枝纷乱——主次分级；连续）。【家族共性候选】 */
  wander: number;
  /** 下垂偏置（0–1——末级细柔下垂的垂帘姿态；**与阔叶 upturn 反向的针叶姿态语言**，
   *  末级高值 = 层缘垂帘；连续——年龄轴载体）。【家族共性候选】 */
  droop: number;
}

/** 子枝挂点计划（t 沿父枝弧长；末位 1.0 = 延伸延续枝；逐过渡级一项）。【家族共性候选】 */
export interface ConiferChildPlan {
  /** 挂点 t 序列。【结构计数类：改值即改面数与 rng 消费数——槽间恒等】【家族共性候选】 */
  ts: number[];
  /** 侧枝方位均分步进（弧度）。【家族共性候选】 */
  phaseStep: number;
}

/**
 * 针叶家族 shapeProfile：四个扁平组 extends 合并（字段访问路径扁平——profile.tierCount
 * 等直读）+ 五个嵌套组。雪松第一实例的槽组合、数值锚定与实测校准记录见
 * ../cedrus/cedrusShapeProfile（本草案只定字段语义与纪律，不落数值）。
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
  /** 风动两层三成分（3b 消费；树高锚同源 totalHeight；结构见 ConiferWindProfile） */
  wind: ConiferWindProfile;
  /** 主干拓扑预算（结构见 ConiferTrunkTopology） */
  trunk: ConiferTrunkTopology;
  /** 逐级枝拓扑（L1 层枝 → 末级；长度 = 分枝级数，实例口径）。radial/segs 结构计数类
   *  槽间恒等；wander/droop 连续。 */
  levels: ConiferLevelTopology[];
  /** 子枝挂点计划（逐过渡级一项）。【结构计数类：槽间恒等】 */
  childPlan: ConiferChildPlan[];
}
