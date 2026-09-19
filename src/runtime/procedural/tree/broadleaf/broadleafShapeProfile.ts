/**
 * runtime/procedural/tree/broadleaf/broadleafShapeProfile —— 阔叶家族形态参数面
 * 类型契约（T010.1 Step 1，家族契约提炼；沿 runtime/procedural/types「本文件只有类型，
 * 零运行时」模式）。
 *
 * 职责：阔叶树家族的 shapeProfile 类型契约——自第一实例夏栎（asset_tree_3a，T008/T009
 *      已验收）的私有参数面 tree3aShapeProfile（T009.1）提炼：字段集 = 夏栎真实消费并
 *      验证过的字段（tree3aGeometry 全字段消费，消费点 grep 可证——无投机字段）；
 *      【阔叶共性候选】/【夏栎特有】标注自 T009.2/T009.3 逐字段原样搬运，供后续树种
 *      接入时对照取舍。
 * 提炼纪律（D20.3 / T010.1 约束，模块级承诺）：
 *   - 只提炼夏栎自身已实现并验证、且具有明确家族语义的共性类型契约；未经真实消费者
 *     验证的算法级抽象不进契约，不建完整 BroadleafTreeGenerator 框架；
 *   - T011 新树种出现后按需**增量修订**，不做预防性泛化（如把 per-level 字段
 *     （levels/childPlan/radiusRatio/endRatio）重参数化成映射）；
 *   - 本文件只有类型与文档，零运行时——无工厂、无默认值对象、无常量；
 *   - 数值依据不进契约：slot-0 锚定值、Spec 数值域与实测校准记录留在实例 config
 *     （夏栎 = ../tree3a/tree3aShapeProfile）。下文各字段的「夏栎第一实例证据」统一指
 *     tree3a/tree3aShapeProfile 与 docs/research/tree3a-reference.md（Spec 1.0）——
 *     夏栎 Spec 数值是第一实例证据，不作家族真理。
 * 槽间恒等纪律（多形态槽资产的皮面数恒等与确定性保证）：**结构计数类**字段
 *      （radial/segs/childPlan/簇位数（clustersL5/L4）/每簇叶量（clusterLeavesL5/L4）/
 *      voidCount/scaffoldCount）跨槽恒定——计数类改值即改面数与 rng 消费次数，槽间
 *      恒定维持皮面数恒等与 rng 消费恒等；**连续形态参数**（角域/比率/幅度类）承担
 *      全部槽差异。保留簇数与实际叶卡数随 seed 由簇级距离抑制 + 冠内通透规则确定
 *      （同槽同 seed 恒等——确定性不破）。
 * 边界：家族类型层，不进 ProceduralBuild 公共签名（build 只做 slot → profile 路由，
 *      见 asset_tree_3a.asset）；比率字段以 totalHeight（形态参数域树高）或实际涌现
 *      高度为基、角度字段以度存弧度算的口径随第一实例（详见 tree3aShapeProfile 模块头）。
 */

/** 逐级枝拓扑预算（皮面恒等的来源——radial/segs 为结构计数类，改值即改面数） */
export interface BroadleafLevelTopology {
  /** 径向分段（管周向顶点数；典型随枝级递减）。【结构计数类：槽间恒等】 */
  radial: number;
  /** 环段数（管轴向前向分段）。【结构计数类：槽间恒等】 */
  segs: number;
  /** 每步方向游走幅度（粗枝刚直、细枝纷乱——主次分级的姿态语言；连续形态参数） */
  wander: number;
  /** 上扬曲率偏置（横枝末段上翘的冠体抬升/下沉姿态；连续形态参数）。冠垂直摆放
   *  驱动链成员（T009.3 消费语义）——与挂高段/横展角/领导枝链共同决定冠的实际垂直位置。 */
  upturn: number;
}

/** 子枝挂点计划（t 沿父枝弧长；末位 1.0 = 延伸延续枝） */
export interface BroadleafChildPlan {
  /** 挂点 t 序列。【结构计数类：改值即改面数与 rng 消费数——槽间恒等】 */
  ts: number[];
  /** 侧枝方位均分步进（弧度） */
  phaseStep: number;
}

/**
 * 树皮近景微起伏参数组：emitTube 顶点域低频环向起伏——近景轮廓的真实树皮微起伏层
 * （三距离目标：远景颜色粗糙度 / 中景 Shader 脊沟 / 近景本几何层，互不对齐必要）。
 * 起伏 = 管参数（θ / 弧长 / 半径）的纯确定性函数（整数谐波环向 + 沿轴缓变相位游走），
 * 零 rng 消费（rng 消费次数恒等纪律不破）；非结构计数类（改值不改面数）。
 * （夏栎第一实例口径：槽间恒等——树皮微起伏非形态差异维度，slot-0 定义、其余槽
 * spread 继承。）
 */
export interface BroadleafBarkRelief {
  /** 起伏幅度 / 局部半径（比例式量级挂钩——主干强末梢弱，子枝/末梢绝对量按半径
   *  自洽衰减且须 ≪ 子枝内埋余量）。【幅度 ∝ 半径的量级挂钩 = 阔叶共性候选（粗干
   *  起伏强、细枝平滑的通用读向）；绝对值 = 夏栎特有（锚中龄公园树「成熟个体较弱
   *  浮雕」端——定性方向与数值锚见夏栎第一实例证据）】 */
  amplitudeRatio: number;
  /** 环向谐波数（整数谐波 k——纵向脊的周向数量级；须落在最粗管径向分段的奈奎斯特
   *  安全域内，径向段更少的细枝上高次谐波自然混叠为无害低频）——脊沿轴向伸展的
   *  方向性表达。【夏栎特有（橡树系纵沟窄脊原型；幼树光滑端不在第一实例龄级口径）】 */
  harmonics: number[];
  /** 轴向相位游走基率（rad/m；逐谐波在 ±drift 域内按管起点确定性散列取值——脊沿轴向
   *  缓慢游走，非环形箍纹的反箍纹保证）。【脊游走机制 = 阔叶共性候选（纵脊树皮共性）；
   *  速率值 = 夏栎特有】 */
  drift: number;
}

/**
 * 冠侧标量场（扁平字段，非嵌套）：冠形参考系 + 冠内通透规则 + 枝梢驱动叶簇。
 * 消费语义（T009.3 记档，家族级事实）：冠形 5 字段中 crownCenterRatio /
 * crownHeightRatio / crownTopBias **不动几何**——只进密度场参考系（q 分桶/存活率，
 * 空腔摆放同源）调制叶卡分布与数量；冠的实际垂直摆放由骨架侧驱动链决定（挂高段
 * scaffoldAttachMin/Span + 横展角 + upturn + 领导枝链），调冠形参考系不等于调冠位置。
 */
export interface BroadleafCanopyProfile {
  // ── 冠形（形态向量原料；冠参考系同时是冠内通透密度场的判定基准）──
  /** 冠幅 / 树高（骨架枝长度与冠椭球半径的共同驱动）。（夏栎第一实例的 Spec 数值域
   *  与 slot-0 锚定值见夏栎第一实例证据） */
  crownWidthRatio: number;
  /** 冠中心高 / 实际树高（冠椭球中心）。**消费语义（T009.3）：不动几何——只进冠参考系
   *  （密度场 q 分桶/存活率与空腔摆放）调制叶卡分布与数量**；冠的垂直摆放实际由
   *  挂高段 + 横展角 + upturn + 领导枝链驱动。工程设定（涌现自挂高段与领导枝链，
   *  夏栎间接锚见第一实例证据）。 */
  crownCenterRatio: number;
  /** 冠高 / 实际树高（冠椭球半高 = ratio/2）。**消费语义（T009.3）：同 crownCenterRatio
   *  ——不动几何，只进密度场参考系**。工程设定（同上）。 */
  crownHeightRatio: number;
  /** 冠不对称强度 0–1（骨架枝方位抖动幅度缩放——连续形态参数）。 */
  asymmetry: number;
  /** 冠顶偏置 -1..+1（叶量沿冠高方向的保留偏置；>0 顶密、<0 底密）。
   *  **消费语义（T009.3）：同 crownCenterRatio——密度场高度向调制，不动几何**。 */
  crownTopBias: number;

  // ── 冠内通透（显式规则替代「叶卡只挂外段」的涌现式空腔：①枝干通道 ②内层密度
  //    衰减 ③局部空腔——外密内疏、主干大枝进冠不被封死、冠内大空隙可控）──
  /** 基准密度乘子（整体叶量缩放；连续形态参数——槽间密度维度差异的载体）。 */
  canopyDensity: number;
  /** 壳层满密度起点（冠内归一化径向深度 q ≥ 此值密度 = 1——外密内疏的壳带厚度）。 */
  crownShellStart: number;
  /** 芯层起点（q ≤ 此值密度 = 地板值）。 */
  crownCoreStart: number;
  /** 芯层地板密度（冠心空度；连续形态参数——团冠/疏冠读向的载体）。 */
  coreDensityFloor: number;
  /** 枝干通道半径（米）：主干/领导枝基段周围的叶卡硬抑制带（规则①——主干大枝
   *  进冠不被封死）。 */
  channelRadius: number;
  /** 骨架枝通道半径缩放（规则①：粗枝基段同样留通道）。 */
  channelBranchScale: number;
  /** 通道保护段占枝长（规则①：沿枝基段的保护长度）。 */
  channelLengthRatio: number;
  /** 局部空腔数量（规则③：rng 驱动的冠内空腔球剔卡）。【结构计数类：槽间恒等
   *  （rng 消费次数恒定的来源——每腔固定消费次数）】 */
  voidCount: number;
  /** 空腔半径域（米，min–max rng 抽样）。 */
  voidRadiusMin: number;
  voidRadiusMax: number;
  /** 空腔中心向冠心偏置（0–1：空腔聚冠心、避冠壳）。 */
  voidCenterBias: number;

  // ── 叶簇（枝梢驱动叶簇：末两级枝梢 → 簇空间 → 叶片分布——「多个叶簇构成的树冠」
  //    替代「叶片堆起来的树冠」）──
  /** 末两级（第一实例 L5/L4）每枝簇位数量。【结构计数类：rng 消费次数恒定的来源，
   *  槽间恒定；保留簇数随 seed 由簇级距离抑制确定，见 clusterMinSeparation】。
   *  【夏栎特有（挂簇枝级 L4/L5 与簇位数为夏栎五级拓扑的私有映射——家族层面
   *  「末两级挂簇」为语义、具体枝级与簇位数为实例口径）】 */
  clustersL5: number;
  clustersL4: number;
  /** 簇挂点 t 域下限（沿枝弧长；枝端簇固定 t=1，其余簇在外段均匀散布——「外段」
   *  受光集中读向的幅度映射；内层枝梢的外段仍进冠心——内层候选来源）。 */
  clusterInnerStartL5: number;
  clusterInnerStartL4: number;
  /** 末级簇半径域（米）/ 次级簇半径乘子（次级簇略大——承接更粗末级枝）。半径须
   *  显著小于典型枝梢间距（簇间间隙来源）。【簇半径比类 = 阔叶共性候选；绝对量级
   *  = 夏栎特有（Spec 定性依据见夏栎第一实例证据）】 */
  clusterRadiusMinL5: number;
  clusterRadiusSpanL5: number;
  clusterRadiusScaleL4: number;
  /** 簇半径 / 挂簇枝长 比例上限（cap：短枝梢簇随之缩小——簇尺度随枝条活力，且保证
   *  同枝两簇中心距 > 簇半径和、簇间间隙成立）。【阔叶共性候选】 */
  clusterRadiusLengthCap: number;
  /** 簇级显式剔除：与已保留簇中心距 < clusterMinSeparation×(ri+rj) 的簇位丢弃（后生成
   *  者让位——父子/兄弟枝梢拓扑共位处的距离抑制；簇位 rng/叶片 rng 无条件消费后丢弃，
   *  确定性不破——离散挂簇的间隙保险）。【阔叶共性候选】 */
  clusterMinSeparation: number;
  /** 簇中心沿簇方向（挂点枝切向）前移量（× 簇半径）——簇坐枝梢稍前方、叶量越枝端
   *  （簇-枝梢生长关系的幅度项）。【阔叶共性候选】 */
  clusterForwardOffset: number;
  /** 每簇叶量（候选上限，固定计数）。确定性纪律：rng 消费次数与数据分支无关，被簇级
   *  剔除的簇位足额消费后丢弃；簇间疏密差异由簇级剔除与通透三规则承担。
   *  【结构计数类：槽间恒等】【每簇叶量类 = 阔叶共性候选；绝对值 = 夏栎特有】 */
  clusterLeavesL5: number;
  clusterLeavesL4: number;
  /** 外壳偏置 ∈ (0,1]：簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^gamma)——
   *  叶沿簇壳偏置、簇内自然稀疏成腔（外密内疏的簇内同构映射）。【阔叶共性候选】 */
  clusterShellBias: number;
  /** 外壳偏置分布形状 γ（<1 向簇壳聚、>1 向簇心聚）。【阔叶共性候选】 */
  clusterShellGamma: number;
  /** 卡宽域（米，min–span rng 抽样）——叶卡 = 叶簇抽象，非等比复刻真叶（夏栎单卡
   *  ≈ 真叶 2× 的工程映射见第一实例证据）。【卡尺寸域类 = 阔叶共性候选；绝对量级
   *  = 夏栎特有（真叶尺寸 Spec 依据见夏栎第一实例证据）】 */
  leafWidthMin: number;
  leafWidthSpan: number;
  /** 卡长宽比域（min–span rng 抽样）。【阔叶共性候选（夏栎直接采用其 Verified
   *  长宽比域，见第一实例证据）】 */
  leafAspectMin: number;
  leafAspectSpan: number;
}

/**
 * 骨架侧标量（扁平字段）：一级枝骨架 + 逐级分级（主次分级核心）。
 * 消费语义（T009.3 记档）：本组是冠垂直摆放与冠幅涌现的实际驱动链——挂高段
 * （scaffoldAttachMin/Span）+ 横展角（scaffoldAngleMin/Max）+ 逐级 upturn + 领导枝链
 * （leaderLengthRatio）共同决定冠的实际位置与树顶；弱领导枝会翻转树顶决定因素
 * （领导链→骨架链），使树高与冠幅参数耦合缩水。
 */
export interface BroadleafBranchProfile {
  // ── 骨架（一级枝）──
  /** 骨架枝数量。【结构计数类：槽间恒等】（夏栎第一实例口径：另含 1 领导枝——
   *  领导枝是否计入 scaffoldCount 由实例决定，夏栎为不计入） */
  scaffoldCount: number;
  /** 骨架枝横展角域（对铅垂，度；rng 连续域）。**冠垂直摆放驱动链成员（T009.3：
   *  横展角与挂高段共同决定冠的垂直位置与冠幅涌现——大开角抬冠幅压冠高、收角
   *  上举收冠）**。 */
  scaffoldAngleMin: number;
  scaffoldAngleMax: number;
  /** 挂高段下缘（沿干弧长；下缘即视觉冠底）。**冠垂直摆放主驱动（T009.3：冠形
   *  参考系字段不动几何，冠的实际垂直位置由本组驱动）**。 */
  scaffoldAttachMin: number;
  /** 挂高段跨度（沿干弧长：挂点在 [Min, Min+Span] 分布）。 */
  scaffoldAttachSpan: number;
  /** 骨架枝起径 / 主干挂点径。 */
  scaffoldThickness: number;
  /** 骨架枝 rank 长度乘子（按方位序递减——主次分级：骨架枝内部强弱势差，rank0 =
   *  首枝主导；偏冠/宽展读向的载体之一）。 */
  scaffoldRankLength: number[];
  /** 骨架枝 rank 起径乘子（与长度乘子同向——主导枝更粗）。 */
  scaffoldRankRadius: number[];
  /** 领导枝链长基准（段长 / (树高 - 干高)）。**消费语义（T009.3 记档）：弱领导枝会
   *  翻转树顶决定因素（领导链→骨架链决定树顶），使树高与冠幅参数耦合缩水——领导枝
   *  强度与冠幅/树高参数非独立调参（夏栎 slot-2 实测校准见第一实例证据）**。 */
  leaderLengthRatio: number;

  // ── 逐级分级（主次分级核心；子/父比序列）──
  /** 子起径 / 父挂点径，逐过渡级一项（低级陡、末级缓——一级粗枝与末梢细枝的视觉
   *  权重落差；第一实例 = 五级拓扑 4 项元组——**级数为实例口径，家族不做 per-level
   *  映射化泛化（提炼纪律，T011 后按需修订）**）。 */
  radiusRatio: [number, number, number, number];
  /** 子长 / 父长基值与跨度（rng 连续域）。 */
  lengthRatioBase: number;
  lengthRatioSpan: number;
  /** 每级末径 / 起径（通体锥度——骨架级通体粗壮的方向性表达；长度 = 分枝级数）。 */
  endRatio: number[];
}

/**
 * 阔叶家族 shapeProfile：BroadleafCanopyProfile + BroadleafBranchProfile 扁平合并
 * （多接口 extends 后字段访问路径不变——profile.asymmetry 等照旧，几何消费点零
 * churn）+ 四个嵌套组。夏栎第一实例的槽组合、数值锚定与实测校准记录见
 * tree3aShapeProfile（本契约只定字段语义与纪律，不落数值）。
 */
export interface BroadleafShapeProfile extends BroadleafCanopyProfile, BroadleafBranchProfile {
  /** 树皮近景微起伏（近景轮廓起伏层；机制与共性标注见 BroadleafBarkRelief） */
  barkRelief: BroadleafBarkRelief;
  /** 主干拓扑预算（与 levels 项同构——radial/segs/wander/upturn 同语义；夏栎数值
   *  依据（近景圆度/根部 flare 承载的径向环段选择）见第一实例证据） */
  trunk: BroadleafLevelTopology;
  /** 逐级枝拓扑（L1 骨架枝 → 末梢；长度 = 分枝级数——级数为实例口径，夏栎五级）。
   *  radial/segs 结构计数类槽间恒等；wander/upturn 连续（upturn 为冠垂直摆放
   *  驱动链成员，见 BroadleafLevelTopology.upturn）。 */
  levels: BroadleafLevelTopology[];
  /** 子枝挂点计划（逐过渡级一项：L1→L2 … 末二级→末级；第一实例 4 项）。【结构
   *  计数类：改值即改面数与 rng 消费数——槽间恒等】 */
  childPlan: BroadleafChildPlan[];
}
