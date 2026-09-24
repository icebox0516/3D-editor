/**
 * runtime/procedural/tree/bischofia/bischofiaMaterials —— 重阳木（Bischofia
 * polycarpa，asset_tree_bischofia）叶/皮/叶影深度材质（T011.8，阔叶族第九材质实例
 * ——**三出复叶 SDF 第二型（三叶场并集法）+ 树皮第 9 语言**）。
 *
 * 职责：复制八先例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce
 * 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 * <color_fragment> 绝不触碰），物种配方按重阳木自己的 Reference Spec 换装——
 * Spec docs/research/bischofia-reference.md **1.0**（任务书锚点 1.0，开工前已校验
 * 一致；生产一律以文末「终审记档（主代理）」④ 生产口径终版为唯一事实源：①体量锚
 * 树高 ≈10m slot-0 / 生产域 8–12m / 冠幅比 0.8–1.0 / 单干干高占比 0.25–0.33；
 * ②叶 = 三出复叶卡语言（复叶第二型，1 卡承载整枚三出复叶）；③树皮第 9 语言
 * 「褐-深灰褐纵裂深沟宽脊 + 裂纹扭转/局部网状、细枝红褐光滑皮孔」；④花/果序
 * **不做**（夏相幼果 2–3mm 亚厘米级显著性极低 + 春花非建模相——终审 ③-2 裁决；
 * 本材质无 v∈[4,7] 花果域分支，组 0 单域皮）。
 *
 * 【与几何侧的冻结接口（主代理简报冻结，不得偏离）】
 *   - 三工厂签名与 koelreuteria/triadica 同构：(level: ProceduralLevel = 'high')
 *     => THREE.MeshStandardMaterial / MeshDepthMaterial；每次调用全部 new（D17）。
 *   - 恰两组语义：组 0 = 皮（createBischofiaBarkMaterial，单域无分支）、组 1 =
 *     三出复叶卡（createBischofiaLeafMaterial）；材质数组序 [皮, 叶]。
 *   - 三出复叶卡：1 卡 = 整枚三出复叶，几何 2 tri 四边形、**宽/长比 0.75 冻结**
 *     （卡空间半宽 0.375）、卡长 0.28–0.42m；v 轴 = 总柄基 0 → 顶小叶尖 1；
 *     **总柄裸段 v∈[0, 0.35]**（裸柄线 + bare 门控域）；叶卡 uv 标准 0–1；
 *     aLeafRand ∈ (0,1] 同卡同值、aBend 根→尖非降（几何侧契约）。
 *   - 皮组（组 0）aLeafRand/aBend 恒 0；皮管 v = 累计弧长 × 0.5 ≤ ≈2.9
 *     （profile 探针断言域；**细枝管 v 小**——几何契约注记，皮域门控消费）。
 *
 * 【三出复叶 SDF——三叶场并集法（复叶第二型核心，限定文件内最小扩展，记缺口
 *   候选②）】前八例叶卡语言：夏栎倒卵羽裂 / 朴卵形齿缘 / 樟卵状椭圆全缘 / 榉卵形
 *   锯齿 / 银杏扇形二叉脉顶缺刻 / 悬铃木阔卵掌状裂 / 栾二回羽叶两级窗列（轴系复叶
 *   首例）/ 乌桕菱形指数充满度。重阳木三出复叶是**放射对称型**——三枚小叶从总柄
 *   顶端同一点放射（掌状三出），结构信息是「三叶并集 + 裸总柄」，不是栾树的沿轴
 *   重复，无法由窗列折叠或任何单叶包络表达。新路径 = **三叶场并集**：
 *   ① 卡空间折算：物理横坐标 x = (u−0.5)·0.75（长 1 单位、半宽 0.375——宽/长比
 *      0.75 冻结接口）；y = v（0 总柄基 → 1 顶小叶尖）。
 *   ② 裸柄段 y∈[0, ~0.35]：总柄线 |x| < w(y)（w 0.009→0.0055 渐细——真实总柄
 *      9–13.5cm ≈3–4mm 视觉宽的卡分辨率工程放大下限；线延伸至 0.40 = 顶小叶柄
 *      1.5–4(–6)cm 的压缩表达，节点上下不断线）；**bare 门控为减法式**
 *      `edge − (1−ss(0.315,0.365,y))·0.10`——压灭柄段任何叶场幻影（011.6 ⑧ 同型
 *      目标）；**不得用乘法门控**（负距离 × 0 被钳到恰 0 → alpha 恰 0.5 恰过
 *      alphaTest 的伪覆盖——JS 镜像实测教训，本文件修正记档；栾树因 min(包络,
 *      羽片) 合成链天然免疫未暴露）。
 *   ③ 三叶场并集：叶着生节点 y=0.35。**顶生小叶**（大）：竖直轴，基 0.38 / 长
 *      0.58 / 半宽 0.180（基中心 0.67——简报「中心轴 (0, ~0.68)」域内）——
 *      「顶生小叶通常较两侧的大」FRPS Verified [1][3]；包络 sin(π·t^0.84)（峰
 *      t≈0.445 偏基 =「卵形或椭圆状卵形」首列）× 指数收口 mix(0.96, 2.60–3.50
 *      逐叶, ss(0.60,0.88,t))（基部圆 ≈1 凸缓 + 先端强收口 =「顶端突尖或短渐尖」
 *      + 照片尾状渐尖读向——尾长逐叶统计）。**侧生小叶对**（小、近无柄——柄
 *      3–14mm 亚像素不表达）：局部旋转坐标架 ±40–50° 从竖直向外上举（**旋转矩阵
 *      手写展开** mix(0.643,0.766) 常数对——不用矩阵函数），镜面 |x| 单侧计算，
 *      长 0.43·(0.94+0.10·rand)、半宽 ×0.31（小叶长宽比 ≈1.6——Spec §B 1.3–1.7
 *      中上域 + 照片 7–10×5–8 交叉）；侧叶中心 (±0.13–0.17, 0.48–0.51)。**数值
 *      锚（JS 镜像断言锁）**：顶生/侧生长度比 **1.30–1.43**（全域 1.297–1.435
 *      ——「顶生小叶通常较两侧的大」FRPS + 照片 l1 双问的统计实现）；三叶间隙
 *      （侧叶-顶叶夹缝 bisector 透空段 ≈0.13 > 0.03 阈）——三出结构中距可辨的
 *      来源；**中距单叶读向自检**：并集行宽剖面 maxW ≈0.28–0.32 @y≈0.63–0.66、
 *      W(0.48) ≥ 0.5·maxW（宽卵无腰）、W(0.90) ≤ 0.35·maxW（渐尖收口）——卡缩小
 *      后三叶并集剪影 ≈ 一枚宽卵形大叶（Spec §4「同一结构两种距离读向」：近景
 *      三裂、中距宽卵大叶）。
 *   ④ 缘钝细齿：「每 1 厘米长 4–5 个」FRPS Verified [1][3]——真实齿卡分辨率亚
 *      像素，**微幅载波统计近似**（cos 载波沿缘 ±0.003–0.006 逐叶幅 + 频 350–410
 *      → 顶生小叶 ≈37 齿 ≈ 4–5/cm × 7–10cm 域内），随包络衰减（clamp(envN·3)）
 *      防尖/基幻影齿；Spec §7 牺牲顺序首位记档（Low 档随 SDF_LOW 消去）。
 *   ⑤ 脉型：羽状脉（照片 leaf-b 读向 Inferred——文献无种级脉句）：每小叶中脉亮带
 *      0.28（先端渐隐）+ 侧脉对角读向 0.15 弱层（sin 脊族 pow^6 斜升不达缘）；
 *      中距弱表达不承重。
 *   ⑥ 基部圆-浅心形：弱凹口减损（triadica 菱形 SDF 凹口机制同族挂小叶基中心，
 *      域限 (n/hw, t·2.4)/0.55）+ 逐叶门控 ≈44%（「基部圆或浅心形」FRPS 圆首列
 *      → 心形为次相）+ 深度 0.012–0.024 弱表达（vs triadica 0.05–0.11 全叶级）。
 *   ⑦ FXC 预防（011.6 ⑨ 教训前置）+ 作用域纪律（triadica 事故修复）：小叶场 +
 *      齿载波 + 凹口整体封装子函数 bisLeaflet(...)（单返回 float 零 out 参）、三叶
 *      并集封装 bisLeafSDF(...)（同款零 out 参）——bisLeafAlpha 主函数体最小化；
 *      叶脉装饰层经共享变量段 BIS_LOCAL_VARS 与 SDF 同源折算（koe 装饰层同款
 *      纪律）；跨 include 消费的变量全部平铺于 main 顶层声明（本资产组 0 单域无
 *      if/else 分支块——结构天然满足；守卫测试 braceDepth=1 断言固化）。
 *   ⑧ 全 ALU 零噪声零贴图（D13——深度材质同源不挂噪声库的前提）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - 叶色：正面**中绿-深绿、纸质稍光泽**（照片 leaf-b 单源 Inferred——文献无种
 *     级叶色句，Spec §5 如实降档记档）；底色 #517c35（工程设定——九树亮度链：
 *     银杏 > 朴 > 悬铃木 > 栾 > **重阳木** > 乌桕 > 夏栎 > 榉 > 樟，栾乌之间）。
 *   - 背面 **Unknown → 弱差档**（Spec 结构缺口 + 终审 ③-5「弱差档或不区分」取弱
 *     差）：×(1.06, 1.07, 1.05) 浅绿（幅度弱于栾柔毛差 +0.08/悬近无毛 +0.06 级）；
 *     两面糙度差 +0.05（「全株均无毛」FRPS Verified [1]——与乌桕同最小差档）。
 *   - roughness 0.70（「小叶片纸质」FRPS Verified [1][3]——与栾树纸质同档哑光；
 *     照片「稍光泽」由透光/环境反射承担，不抬光档）。
 *   - 背光透射 0.30–0.33 家族中庸取 **0.31**（悬厚叶 0.28 < 朴 0.30 < **重阳木
 *     0.31** < 栾 0.32 < 乌桕 0.33 < 银杏 0.34——纸质复叶卡中庸档）+ 透射色
 *     (0.55, 0.89, 0.34) 黄绿基调；逐叶变奏 ∈[0.55, 1.0]。
 *   - 逐叶变奏 aLeafRand 多通道复用：色相两端冷中绿↔暖黄绿（通道摆幅 ≤15% 纪律）
 *     + 明度 ±8%（去相关取样）+ 齿幅/齿频 + 尾长 + 浅心形域 + 侧叶角 + 透光变奏。
 *   - **新叶红褐 flush**（Spec §5 双源 Inferred——重阳木知名春相）：铜红-古铜新梢
 *     统计点缀 step(0.938, fract(rand·8.913+0.63)) ≈6.3% 叶域 ×(1.78, 0.62,
 *     0.30)（参照 triadica 5.5% flush 手法、幅度色调自分档；叶位语义缺失全域
 *     散布记缺口候选⑥）；三档同体（冠级点缀信号档间一致）。
 *   - 冠内竖向自遮蔽（冠底 **P5 = 2.679m**——Stage 代理 slot-0 叶卡质心百分位实测
 *     〔2026-09-21 同步；min 1.7569 距 P1 2.348 达 0.59m = 离群单卡，主数口径
 *     **P5 裁定记档**——冠底质量下缘整簇落最深遮蔽带 = 冠底暗裙读向；min 质心口
 *     径记档备用〕；渐入带宽 2.0m = 家族 2.8 × 冠深比 2.8×7.217/9.896）+ 中频
 *     叶团斑块（High，波长 ≈0.85m ≈ 团块 1/8–1/15 冠幅——大复叶层叠中细质
 *     Spec §3 Inferred [7]）。
 *   - 裁切 alphaTest 0.5 + alphaToCoverage；坡宽 0.025（三叶间隙级结构——简报
 *     0.02–0.03 域中值）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值记档）：整树缓摆 ~0.18Hz / 顶部 ~4cm
 *     （aSeed 相位 hash 常数 88.217/65.443 与八先例〔77.669–86.531 / 49.337–
 *     63.917〕去相关）+ 复叶卡快颤 9–15 rad/s（≈1.4–2.4Hz）/ ≤11mm 中幅——总柄
 *     9–13.5cm ≈ 0.7–1.5× 小叶长（Spec §B leaf_orientation_dist）：摆锤自由度
 *     大于单叶小于栾树二回羽叶，与栾同档中幅（任务简报 9–15 rad/s / ≤10–12mm
 *     域中值）；aBend 权重（卡根≈0 尖大）；树高锚 9.896m（×0.1011——几何侧
 *     slot-0 精确涌现实测同步〔Stage 代理探针经 asset build() 全管线，2026-09-21〕）。
 *
 * 皮（组 0）配方——**第 9 树皮语言「褐-深灰褐纵裂深沟宽脊 + 扭转」**（vs 八先例：
 * 夏栎脊沟 / 樟黄褐不规则纵裂深沟 / 朴平滑浅裂小斑 / 榉光滑暖剥 / 银杏灰褐浅纵裂 /
 * 悬铃木地图剥落三色带 / 栾浅色皮孔麻点 / 乌桕暗灰窄裂碎翘）。分化点：①基色**褐**
 * （FRPS「树皮褐色，厚6毫米，纵裂」Verified [1][3]——vs 乌桕暗灰 #6f6a62 / 栾
 * #90928a；主调 #675a4b 深灰褐-暗褐〔bark-a「深灰褐-暗褐」/bark-b「深灰褐」照片
 * 读向 [7]〕，R−G=13 褐向与樟 #6e6352〔R−G=11〕争家族最褐端——樟黄褐不规则 vs
 * 重阳木深褐规则纵裂，亮度更暗一档〔九树链：重阳木 < 樟 < 乌桕 < 榉 < 悬 < 栾〕）；
 * ②**沟深脊宽**（8 宽脊/周 vs 乌桕 11 窄脊/樟 7；沟深剖面 0.54 vs 樟 0.50 深 /
 * 乌桕 0.60 中——b1「脊宽沟深」双问）；③裂纹**扭转/局部网状**（脊线游走率
 * drift 1.25 偏强——vs 乌桕 0.70 缓走；b1「裂纹扭曲交错/主干扭转感」双问 [7]；
 * 老干段交叉网状次级层〔脊线横断 fissure 族 × 老干门控 × 局部域门〕High 近景）；
 * ④**无剥落无翘皮**（vs 榉/悬铃木/乌桕——单色系微变 ±6%）：
 *   - 竖向脊沟：裂线游走低频场（低谐波——与几何 relief 谐波 {3,4,5} 视觉同源；
 *     复用为单色微变省 1 采样）+ 8 宽脊 tri 剖面 + 沟内暖暗 AO 两带 + 上部弱化
 *     门控（主干带 0→1.7569m〔Stage 代理 slot-0 min 质心口径实测，2026-09-21〕
 *     上方 0.1 起坡、带宽 2.4——皮门用 min 口径 = 主干结构终止处，与叶 shade 的
 *     P5 口径分工记档）。
 *   - 老干段交叉网状（High）：脊线横断 fissure（游走调制）× 老干门控（低位 ×
 *     低弧长 v——皮管 v = 累计弧长契约注记）× 局部域门（tone > 0.46 片域）×
 *     微暗 ×(0.87, 0.85, 0.84)。
 *   - 干基暗化 + 上部收敛（家族惯例）：干基 ×(0.87, 0.86, 0.87) 低调；细枝段
 *     （**v 低弧长域——「细枝管 v 小」几何契约注记** × 冠缘高位双门控）**绿色-
 *     绿褐过渡 + 皮孔两档**（FRPS「当年生枝绿色，皮孔明显，灰白色，老枝变褐色，
 *     皮孔变锈褐色」Verified [1][3]——近景身份点）：当年生枝绿色收敛 ×(0.88,
 *     1.16, 0.74) / 老枝褐弱收敛；皮孔 ALU 网格 hash 点（36×30 格 65% 有孔——
 *     vs 栾全干密布 82% 稀疏一档）灰白 ×(1.38, 1.38, 1.32) ↔ 锈褐 ×(1.42, 1.06,
 *     0.72) 两档（High）。
 *   - roughness 0.92（纵裂深沟族高糙哑光——与乌桕/樟同档；皮孔微凸微泽 −0.10、
 *     上部细枝微光 −0.08）；苔藓/地衣不做（不做不编造，沿先例）；微起伏已归几何层。
 *
 * 深度材质（customDepthMaterial 契约通道——沿 SOP 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha
 *     与叶表面材质共享同一 GLSL 字符串（表面改形深度自动同步，禁复制粘贴）。
 *   - **零噪声库注入**：三叶场/齿载波/凹口全 ALU → SDF 零 facVnoise 引用 → 深度
 *     片元不挂 FACILITY_GLSL_NOISE（樟全缘 + 榉 011.3 组合先例）。保护性约束：
 *     SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 组 0 守卫：皮域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质
 *     时组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例；无花果域无需 v 路由）。
 *   - 档位匹配：Mid = High SDF 同源全形（档间剪影一致——三出剪影是中距身份）；
 *     Low = SDF_LOW 宽卵大叶单包络（远距「三裂结构不可辨」Spec §7 牺牲顺序——
 *     三叶并集剪影的字面单叶化；总柄线/bare 门控/坡宽与 High 逐字同源）。
 *   - 风动不进 depth pass（静态影取舍，沿先例）。
 *
 * 分档记档（T011.8，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去小叶脉两件/叶团 + 糙度叶团项（Spec §7 叶脉仅近距可辨——「近景可
 *     辨、中距弱表达」生产口径）；**SDF 全形含三叶并集/齿/凹口保留——档间剪影
 *     一致**（三出剪影是中距身份）；透光/叶背/hue·luma/flush/shade/两面糙度差
 *     保留；片元零噪声。
 *   - 叶 Low：SDF 换 BIS_LEAF_SDF_LOW（宽卵大叶单包络——三裂细化 Spec §7 牺牲顺
 *     序「小叶柄长度差 → 顶/侧小叶大小差 → 三出宽卵剪影（最后保留）」；总柄线/
 *     bare 门控/坡宽与 High 逐字同源）+ 去透光；hue·luma/shade/flush/叶背保留；
 *     片元零噪声。
 *   - 皮 Mid：去老干网状层/皮孔点（近景细节层）；脊沟扭转/沟内 AO/干基暗化/细枝
 *     绿过渡全保留——中距「褐纵裂深沟宽脊 + 冠缘绿细枝」身份（Spec §7 中距保留面）。
 *   - 皮 Low：再去干基暗化/老枝褐档（低调项）；脊沟 + 沟内 AO + 当年生绿档保留
 *     （远距「褐纵裂剪影」保留面）；1× vnoise。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；bischofia 前缀不与八先例混
 *     缓存）：'bischofia:leaf' / ':mid' / ':low'；'bischofia:bark' …；
 *     'bischofia:leaf-depth' …（9 键全异）。
 *   - 风动（BIS_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团）= 3× + 三出 SDF ALU（bisLeaflet×2 调用 +
 *     局部坐标架 ≈ 40 flop ≈ 4×——复叶第二型的账，与栾两级窗列 4.5× 同档）+
 *     小叶脉 ≈ 2× + 透光/两面/flush/hue ≈ 2× ≈ **11×**（与栾 11× 同档）；
 *     叶 Mid ≈ 8×（0 噪声 + SDF 全形）；叶 Low ≈ 3.5×（单包络）；
 *   - 皮 High 片元 = 2× vnoise（游走场 + 网状域门场）= 6× + 脊沟/网状/皮孔 ALU
 *     ≈ 1.5× ≈ 7.5×；皮 Mid/Low = 1× vnoise ≈ 4.5×；
 *   - 深度片元 = 三出 SDF 纯 ALU ≈ 4×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——三叶场并集/宽脊扭转/
 * 皮孔两档全部限定文件内）：
 *   ① 齿幅/尾长/浅心形域/侧叶角/透光共用 aLeafRand 单属性统计近似（多通道复用
 *     同一 rand——变奏间相关性无法表达；家族共有缺口）；**小叶独立变奏不可表达**
 *     （三叶同 rand 派生——顶/侧小叶形状/齿相相关；需 per-leaflet 通道）；
 *   ② 三出复叶「三叶场并集」SDF：本文件内实现（复叶第二型）；复叶三型到齐（栾
 *     轴系窗列 / 重阳木放射并集 / 后续羽状）后族级「复叶 SDF 公共模式」提炼评估
 *     （沿 koe ②）；
 *   ③ 小叶独立颤动不可表达（三叶刚性同摆——复叶内小叶各颤需 per-leaflet 顶点
 *     通道；koe ①尾同型）；
 *   ④ 缘钝细齿 4–5/cm 亚像素统计近似（真实齿形态/齿距不分辨——Spec §7 牺牲顺序
 *     首位记档）；小叶柄长度差（顶 1.5–4(–6)cm / 侧 3–14mm）压缩为单柄线表达；
 *   ⑤ 树高锚 9.896m/冠底 P5 2.679m/主干带 1.7569m 材质侧实测锚（Stage 代理
 *     slot-0 精确涌现实测同步，2026-09-21——探针经 asset build() 全管线；
 *     triadica 11.87→9.854 同款流程）；余留家族缺口 = 与 profile 侧无联动通道
 *     （profile 变更需材质侧手动同步）；
 *   ⑥ 皮管 v 语义（累计弧长——细枝管 v 小）材质侧以「高度 × 小弧长」双门控近似
 *     细枝/老干判别——精确叶位/龄级通道缺失（几何契约注记，Stage 视觉验证疑点位）；
 *     新叶 flush 红梢叶位语义缺失（真实红梢集中顶梢新生区——rand 统计近似全域
 *     散布）。
 *
 * X4000 口径（011.6 终裁带入）：console X4000 警告若复现 = FXC 数据流保守误报预
 *   期口径——直接接受记档一次即止，不逐树变体消元追逐（归 011.13 复叶系议题）；
 *   GLSL 全路径初始化运行零错误为准（bisLeaflet/bisLeafSDF 单返回零 out 参、
 *   全变量单赋值初始化）。
 *
 * 【乘法门控伪覆盖修正记档（本文件新增教训，2026-09-21 JS 镜像实测）】bare 门控
 *   若写成 `leafEdge × smoothstep(...)`：门控 0 处负距离被钳到恰 0 → alpha 恰
 *   0.5 恰过 alphaTest → 裸柄段全卡宽伪覆盖；修正 = 减法门控 `edge − (1−ss)·0.10`
 *   （符号距离语义的硬偏置裁切）。JS 锚「裸区 |x|>0.03 命中数 = 0」锁定。栾树
 *   koe 因 min(包络, 羽片) 合成链（包络负值兜底）天然免疫未暴露此坑——复叶二
 *   型无外层包络兜底，减法式为三叶并集族的必选形态。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与 zelkova/camphor/
 *   celtis/ginkgo/platanus/koelreuteria/triadica/tree3a 的通用段（风动公式等）为复制改造
 *   非 import（资产私有，跨资产不耦合——organization.md 边界）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`bischofia 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 复叶卡快颤（aBend 权重，组 0 恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值记档：
 * hash 常数 88.217/65.443（与八先例相位流〔sway 77.669–86.531 / flutter 49.337–
 * 63.917〕去相关）+ 树高锚 9.896m（×0.1011——几何侧 slot-0 精确涌现实测〔Stage
 * 代理探针，2026-09-21 同步〕，材质-几何侧同源锚记档）；缓摆 ~0.18Hz / 顶部 ~4cm；快颤 9–15 rad/s
 * （≈1.4–2.4Hz）/ ≤11mm 中幅——总柄 9–13.5cm ≈ 0.7–1.5× 小叶长（Spec §B
 * leaf_orientation_dist）：摆锤自由度大于单叶小于栾二回羽叶，与栾同档中幅。
 */
const BIS_WIND = /* glsl */ `
// bischofia wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float bisWindPhase = fract(sin(aSeed * 88.217 + 6.8) * 43758.5453);
float bisWindH = clamp(position.y * 0.1011, 0.0, 1.0); // /9.896m 精确涌现实测锚（Stage 代理 slot-0 探针经 asset build() 全管线，2026-09-21 同步——缩放抖动下权重近似）
float bisSway = bisWindH * bisWindH * 0.040 * sin(uTime * 1.15 + bisWindPhase * 6.28318 + bisWindH * 1.4);
// 复叶卡快颤：ω = 9 + 6φ（9–15 rad/s ≈ 1.4–2.4Hz），幅度 ≤11mm 中幅（长总柄 0.7–1.5× 小叶长——摆锤自由度大于单叶小于羽叶）；权重 = aBend（卡根≈0 尖大）
float bisFlutterPhase = fract(sin((aSeed + aLeafRand) * 65.443 + 8.9) * 43758.5453);
float bisFlutter = aBend * 0.011 * sin(uTime * (9.0 + 6.0 * bisFlutterPhase) + bisFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (bisSway + bisFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(bisSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * bisFlutter * 0.9; // 叶面沿卡法线微扑（组 0 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const BIS_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 三出复叶 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────

/**
 * 单枚小叶场（FXC X4000 规避：整体封装子函数、单返回 float 零 out 参——011.6 ⑨
 * 前置）：卵形-椭圆状卵形包络 + 先端突尖-短渐尖指数收口 + 基部浅心形弱凹口 +
 * 缘钝细齿微载波（随包络衰减）。顶生/侧生共用同型包络（侧生缩小 ×≈0.7–0.79）。
 * 依赖作用域内 bisN/bisT/bisLen/bisHw/bisR 形参——纯函数引用透明。
 */
const BIS_LEAFLET_FN = /* glsl */ `
float bisLeaflet(float bisN, float bisT, float bisLen, float bisHw, float bisR) {
  float bisTl = clamp(bisT / bisLen, 0.001, 0.999);
  float bisEnvSin = sin(3.14159 * pow(bisTl, 0.84)); // 峰 t≈0.445 偏基（「卵形或椭圆状卵形」FRPS 首列 Verified [1][3]）
  float bisEnvExp = mix(0.96, 2.60 + 0.90 * fract(bisR * 4.731 + 0.27), smoothstep(0.60, 0.88, bisTl)); // 基部圆（≈1 凸缓）→ 先端强收口（「顶端突尖或短渐尖」+ 照片尾状读向——尾长逐叶 2.60–3.50）
  float bisEnvN = pow(bisEnvSin, bisEnvExp);
  float bisEdge = bisHw * bisEnvN - abs(bisN);
  // 基部圆-浅心形：弱凹口减损（triadica 凹口机制同族挂小叶基中心；逐叶门控 ≈44%——「基部圆或浅心形」圆首列）
  float bisCord = smoothstep(0.50, 0.62, fract(bisR * 7.117 + 0.53));
  bisEdge -= (0.012 + 0.012 * fract(bisR * 3.713 + 0.22)) * bisCord
    * pow(max(0.0, 1.0 - length(vec2(bisN / bisHw, bisTl * 2.4)) / 0.55), 2.0);
  // 缘钝细齿微载波（「每1厘米长4-5个」FRPS Verified [1][3]——亚像素统计近似：幅 0.003–0.006 逐叶、频 350–410；clamp(envN·3) 随包络衰减防尖/基幻影齿；Spec §7 牺牲顺序首位记档）
  bisEdge += cos((bisT + abs(bisN) * 0.8) * (350.0 + 60.0 * fract(bisR * 3.317 + 0.19)) + bisR * 6.283)
    * (0.003 + 0.003 * fract(bisR * 6.113 + 0.41)) * clamp(bisEnvN * 3.0, 0.0, 1.0);
  return bisEdge;
}
`;

/**
 * 三叶局部坐标架变量段（侧生小叶 ±40–50° 手写展开旋转——不用矩阵函数；镜面 |x|
 * 单侧计算）。单一来源：SDF 子函数 bisLeafSDF 与叶面小叶脉装饰层两处展开共享同一
 * 字符串（koe KOE_PINNA_VARS 同款纪律）。依赖作用域内已有 bisX/bisY/bisRand。
 */
const BIS_LOCAL_VARS = /* glsl */ `
  // 侧生小叶局部坐标架：±40–50° 从竖直向外上举（三叶放射的真实姿态——l1「3 枚从同一点放射」双问 [7]）；旋转矩阵手写展开（sin/cos 常数对 mix 逐叶）
  float bisPhi = fract(bisRand * 2.713 + 0.17);
  float bisSin = mix(0.643, 0.766, bisPhi); // sin(40°..50°)
  float bisCos = mix(0.766, 0.643, bisPhi); // cos(40°..50°)
  float bisAx = abs(bisX);
  float bisRy = bisY - 0.35; // 三叶放射节点（裸段 v∈[0,0.35] 上沿——冻结接口）
  float bisLatLen = 0.43 * (0.94 + 0.10 * fract(bisRand * 5.317 + 0.63)); // 侧生小叶长逐叶 → 顶/侧长度比 1.30–1.43（「顶生小叶通常较两侧的大」FRPS Verified [1][3] 的统计实现）
  float bisLatHw = bisLatLen * 0.31; // 小叶长宽比 ≈1.6（Spec §B 1.3–1.7 中上域 + 照片 7–10×5–8 交叉 [7]）
  float bisLt = bisAx * bisSin + bisRy * bisCos; // 沿侧叶轴（自节点外上举）
  float bisLn = bisAx * bisCos - bisRy * bisSin; // 垂直侧叶轴（有符号）
`;

/**
 * 重阳木三出复叶卡覆盖率（uv：u 横 0–1、v 沿主轴 0 总柄基 → 1 顶小叶尖；宽/长比
 * 0.75 冻结接口）：**三叶场并集法**（复叶第二型新路径——见模块头方法记档）。合成
 * edge = max(总柄线, 三叶并集 − bare 减法门控)；**零 facVnoise 引用是深度材质不
 * 挂噪声库的前提（引入即深度编译暴雷——保护性约束）**；返回近似符号距离的覆盖率
 * 坡（edge/0.025——坡宽 0.025 三叶间隙级，alphaToCoverage 承担 AA）。
 */
const BIS_LEAF_SDF = /* glsl */ `
${BIS_LEAFLET_FN}
float bisLeafSDF(float bisX, float bisY, float bisRand) {
${BIS_LOCAL_VARS}
  float bisTermEdge = bisLeaflet(bisX, bisY - 0.38, 0.58, 0.180, bisRand); // 顶生小叶（大：基 0.38 / 长 0.58 / 半宽 0.180 / 中心 0.67）
  float bisLatEdge = bisLeaflet(bisLn, bisLt, bisLatLen, bisLatHw, bisRand + 0.37); // 侧生小叶对（|x| 镜像单算、近无柄自节点放射；+0.37 去相关齿相/凹口通道）
  return max(bisTermEdge, bisLatEdge); // 三叶场并集（间隙透空 = 三出结构中距可辨的来源）
}
float bisLeafAlpha(vec2 bisUv, float bisRand) {
  float bisX = (bisUv.x - 0.5) * 0.75; // 物理横坐标（长 1 单位、半宽 0.375——宽/长比 0.75 冻结接口）
  float bisY = bisUv.y;
  float bisPetEdge = 0.009 - 0.0035 * clamp(bisY / 0.40, 0.0, 1.0) - abs(bisX); // 总柄+顶小叶柄渐细线（0.009→0.0055——真实 9–13.5cm ≈3–4mm 视觉宽的工程放大下限；延伸 0.40 节点上下不断线）
  // bare 门控（减法式）：裸段压灭任何叶场幻影——乘法门控会把负距离钳恰 0 → alpha 恰 0.5 伪覆盖（JS 镜像实测教训，模块头修正记档）
  float bisLeafEdge = bisLeafSDF(bisX, bisY, bisRand) - (1.0 - smoothstep(0.315, 0.365, bisY)) * 0.10;
  float bisEdge = max(bisPetEdge, bisLeafEdge);
  return clamp(bisEdge / 0.025 + 0.5, 0.0, 1.0); // 坡宽 0.025（三叶间隙级——任务简报 0.02–0.03 域中值）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档取用）：
 * **宽卵大叶单包络**（三叶并集剪影的字面单叶化——Spec §4「中距宽卵大叶读向」的
 * 远距极限；三裂间隙/齿/凹口随档去 = Spec §7 牺牲顺序「小叶柄长度差 → 顶/侧大小
 * 差 → 三出宽卵剪影（最后保留）」）。JS 锚：Low 最宽行与 High 外廓差 ∈[−0.015,
 * +0.025]（档间剪影近似一致，LOD 切换无跳变）；总柄线/bare 门控/坡宽与 High 逐字
 * 同源（档间叶形身份一致的去细节不改形原则）。
 */
const BIS_LEAF_SDF_LOW = /* glsl */ `
float bisLeafAlpha(vec2 bisUv, float bisRand) {
  float bisX = (bisUv.x - 0.5) * 0.75; // （与 High 逐字同源折算）
  float bisY = bisUv.y;
  float bisPetEdge = 0.009 - 0.0035 * clamp(bisY / 0.40, 0.0, 1.0) - abs(bisX); // 总柄线（与 High 逐字同源）
  // 宽卵大叶单包络（bisRand 保留双参签名沿家族契约、Low 不用——形状恒定）
  float bisTl = clamp((bisY - 0.36) / 0.61, 0.001, 0.999);
  float bisEnvN = pow(sin(3.14159 * pow(bisTl, 0.90)), mix(0.98, 2.30, smoothstep(0.62, 0.92, bisTl))); // 峰 y≈0.64 与 High 外廓同带 + 上段 2.30 收口（渐尖读向保持）
  float bisLeafEdge = 0.305 * bisEnvN - abs(bisX) - (1.0 - smoothstep(0.315, 0.365, bisY)) * 0.10; // bare 门控（减法式与 High 同源）
  float bisEdge = max(bisPetEdge, bisLeafEdge);
  return clamp(bisEdge / 0.025 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/小叶脉——叶团乘子 0.94+0.12×bisClump 均值化 = 1.0 消去，值噪声均值
 *  0.5 精确保均；flush 在 HEAD 三档同体——冠级点缀信号档间一致）。 */
const BIS_LEAF_HEAD = /* glsl */ `
// bischofia:leaf —— 三出复叶 SDF 裁切 + 逐叶变奏 + 新叶红褐 flush + 冠内层次（<color_fragment> 不触碰）
float bisAlpha = bisLeafAlpha(vUv, vLeafRand);
diffuseColor.a = bisAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷中绿 ↔ 暖黄绿——Spec §5 正面中绿-深绿 Inferred + §6 变体读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 bisHue = mix(vec3(0.95, 1.00, 1.03), vec3(1.05, 1.05, 0.93), fract(vLeafRand * 7.213 + 0.33));
float bisLuma = 0.92 + 0.16 * fract(vLeafRand * 4.417 + 0.55);
// 新叶红褐 flush（Spec §5 双源 Inferred——重阳木知名春相）：铜红-古铜统计点缀 ≈6.3% 叶域（非身份主信号；
// 叶位语义缺失——统计近似全域散布，缺口候选⑥；三档同体：冠级点缀信号档间一致）
float bisFlush = step(0.938, fract(vLeafRand * 8.913 + 0.63));
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.78, 0.62, 0.30), bisFlush);
`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const BIS_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.85m ≈ 团块 1/8–1/15 冠幅——大复叶层叠中细质 Spec §3 Inferred [7]；
// 采样偏移与八先例去相关）
float bisClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.61, vTreePos.y - vTreePos.z * 0.67) * 1.14 + vec2(27.7, 15.3));
`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const BIS_LEAF_SHADE = /* glsl */ `
float bisShade = clamp((vTreePos.y - 2.68) / 2.0, 0.0, 1.0); // 冠底 P5 = 2.679m（Stage 代理 slot-0 叶卡质心百分位实测，2026-09-21——min 1.7569 距 P1 0.59m 离群单卡，P5 主数裁定记档）；带宽 2.0 = 家族 2.8 × 冠深比（2.8×7.217/9.896）`;

/** High 专属：三出复叶脉型（每小叶中脉亮带 + 侧脉对角读向，纯 ALU 零采样）。
 *  坐标段与 SDF 共享（BIS_LOCAL_VARS 同源折算——同名单不同作用域，koe 装饰层同款纪律）。 */
const BIS_LEAF_VEIN = /* glsl */ `
// 三出复叶脉型（羽状脉——照片 leaf-b 读向 Inferred〔文献无种级脉句，如实降档〕；中距弱表达不承重）：
// 每小叶中脉亮带（先端渐隐不达尖）+ 侧脉对角脊族（斜升、sin pow^6 纤细、不达缘）；侧生小叶沿自身旋转架
float bisX = (vUv.x - 0.5) * 0.75;
float bisY = vUv.y;
float bisRand = vLeafRand;
${BIS_LOCAL_VARS}
float bisVTt = bisY - 0.38; // 顶生小叶沿轴坐标
float bisVMidTerm = (1.0 - smoothstep(0.012, 0.042, abs(bisX))) * smoothstep(0.36, 0.42, bisY) * (1.0 - smoothstep(0.90, 0.965, bisY)); // 顶生中脉（基部自小叶基起、先端渐隐）
float bisVMidLat = (1.0 - smoothstep(0.009, 0.034, abs(bisLn))) * smoothstep(0.02, 0.10, bisLt) * (1.0 - smoothstep(bisLatLen * 0.82, bisLatLen * 0.96, bisLt)); // 侧生中脉（近无柄——自节点即脉、先端渐隐）
float bisVMid = max(bisVMidTerm, bisVMidLat);
float bisVLatT = pow(max(0.0, sin(bisVTt * 88.0 - abs(bisX) * 46.0 + (bisRand - 0.5) * 0.9)), 6.0)
  * smoothstep(0.42, 0.50, bisY) * (1.0 - smoothstep(0.80, 0.92, bisY)) * (1.0 - bisVMidTerm); // 顶生侧脉对角脊族
float bisVLatL = pow(max(0.0, sin(bisLt * 74.0 - abs(bisLn) * 42.0 + (bisRand - 0.5) * 0.7)), 6.0)
  * smoothstep(0.10, 0.18, bisLt) * (1.0 - smoothstep(bisLatLen * 0.70, bisLatLen * 0.88, bisLt)) * (1.0 - bisVMidLat); // 侧生侧脉（缩小频）
float bisVLat = max(bisVLatT, bisVLatL);
`;

/** High 专属：合成（叶团乘子 + 小叶脉调制） */
const BIS_LEAF_MUL_HIGH = /* glsl */ `
vec3 bisMul = bisHue * bisLuma * (0.80 + 0.20 * bisShade) * (0.94 + 0.12 * bisClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
bisMul = mix(bisMul, bisMul * vec3(1.48, 1.36, 1.03), bisVMid * 0.28 + bisVLat * 0.15); // 小叶脉弱表达 0.28/0.15（中脉身份层 + 侧脉读向弱层）
diffuseColor.rgb *= bisMul;
`;

/** Mid/Low：合成（去叶团/小叶脉——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const BIS_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 bisMul = bisHue * bisLuma * (0.80 + 0.20 * bisShade); // Mid/Low：叶团乘子均值化消去（T011.8）
diffuseColor.rgb *= bisMul;
`;

/** 叶背浅绿弱差档（三档共用，纯 ALU 零采样零分支） */
const BIS_LEAF_BACK = /* glsl */ `
// 叶背浅绿（Spec §5 两面色差 Unknown——终审 ③-5「弱差档或不区分」取弱差：×(1.06,1.07,1.05)
// 浅绿弱提亮，弱于栾柔毛差/悬近无毛差级——不编造粉感/灰感倾向）；gl_FrontFacing 区分背面
// （WebGL2 内建；DoubleSide 双面片元，背面法线由 three 双面光照自动翻转，此处只调固有色）；
// 两面糙度差 +0.05（「全株均无毛」FRPS Verified [1]——最小差档，见 roughnessmap 注入）
diffuseColor.rgb *= mix(vec3(1.06, 1.07, 1.05), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  家族中庸版：纸质复叶卡中等透光（0.31——悬 0.28 < 朴 0.30 < 重阳木 0.31 < 栾 0.32）。 */
const BIS_LEAF_TRANSLUCENCY = /* glsl */ `
// bischofia:leaf —— 背光透射（家族中庸）：视线与阳光反向时叶背透亮黄绿（叶绿素吸收红蓝 →
// 透射偏黄绿；纸质复叶卡——峰值 0.31：悬厚叶 0.28 < 朴 0.30 < 重阳木 0.31 < 栾 0.32 < 乌桕
// 0.33 < 银杏 0.34，Spec §2「小叶片纸质」Verified [1][3]；三叶间隙透空由 SDF alpha 承担）
#if NUM_DIR_LIGHTS > 0
  float bisBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float bisTransVar = 0.55 + 0.45 * fract(vLeafRand * 7.613 + 0.57); // 逐叶透光强度变奏
  outgoingLight += vec3(0.55, 0.89, 0.34) * directionalLights[0].color
    * pow(bisBack, 3.0) * bisTransVar * bisAlpha * 0.31;
#endif
`;

// ── 组 0（皮）配方主体（<map_fragment> 后注入；单域无 if/else 分支——平铺 main 顶层，
//    跨 include 作用域天然安全，守卫测试固化）────────────────────────────────────

/** 皮域：裂线游走低频场 + 8 宽脊扭转剖面 + 上部弱化门控（三档共用——Low 保留面的唯一采样） */
const BIS_BARK_WARP = /* glsl */ `
// 裂线游走低频场（低谐波——与几何 relief 谐波 {3,4,5} 视觉同源；复用为单色微变 ±6% 省 1 采样）
float bisWarp = facVnoise(vec2(vUv.x * 2.2, vUv.y * 1.3) + vec2(19.7, 11.9));
// 8 宽脊/周（vs 乌桕 11 窄脊——「脊宽沟深」bark-a 双问 [7]）× drift 1.25 强游走（vs 乌桕 0.70——「裂纹扭曲交错/主干扭转感」扭转分化）
float bisTri = abs(fract(vUv.x * 8.0 + bisWarp * 1.25) * 2.0 - 1.0);
float bisBarkSmooth = smoothstep(1.86, 4.26, vTreePos.y); // 干上部弱化门控（主干带 0→1.7569m〔Stage 代理 slot-0 min 质心口径实测，2026-09-21〕上方 0.1 起坡、带宽 2.4——皮门 min 口径 = 主干结构终止处，与叶 shade 的 P5 口径分工记档）
float bisRidge = mix(0.54 + 0.46 * bisTri * bisTri, 0.90 + 0.10 * bisTri * bisTri, bisBarkSmooth); // 沟深中-深剖面（vs 樟 0.50 深 / 乌桕 0.60 中——沟深脊宽读向）+ 上部弱化
`;

/** 网状局部域门控噪声（High 专属——老干交叉网状层的片域门） */
const BIS_BARK_TONE = /* glsl */ `
float bisTone = facVnoise(vec2(vUv.x * 2.4, vUv.y * 2.0) + vec2(33.7, 21.3)); // 网状局部域门（老干层专属采样）`;

/** 老干段交叉网状次级层（High 专属近景——脊线横断 fissure × 老干门控 × 局部域门） */
const BIS_BARK_NET = /* glsl */ `
// 老干交叉网状（b1 73 年生「裂纹扭曲交错」读向的中龄弱表达）：脊线横断 fissure 族（游走 + 脊相位调制）
// × 老干门控（低位 × 低弧长 v——皮管 v = 累计弧长契约注记〔细枝管 v 小，缺口候选⑥〕）× 局部域门（tone 片域）
float bisNet = (1.0 - smoothstep(0.06, 0.24, abs(fract(vUv.y * 2.6 + bisWarp * 0.6 + bisTri * 0.22) - 0.5)))
  * smoothstep(0.46, 0.64, bisTone) * (1.0 - smoothstep(1.6, 3.0, vTreePos.y)) * (1.0 - smoothstep(1.4, 2.2, vUv.y));
`;

/** 干基暗化（High/Mid 共用——低调项，Low 随段去） */
const BIS_BARK_BASEDARK = /* glsl */ `
float bisBarkBase = 1.0 - smoothstep(0.5, 2.4, vTreePos.y); // 干基暗带门控（家族惯例——老干暗褐深裂带读向）`;

/** 细枝绿色-绿褐过渡门控（三档共用——结构剪影项） */
const BIS_BARK_TWIG = /* glsl */ `
// 细枝段门控（v 低弧长域——「细枝管 v 小」几何契约注记 × 冠缘高位双门控）：当年生枝绿色 / 老枝褐两档
float bisTwigHi = smoothstep(5.8, 7.8, vTreePos.y) * (1.0 - smoothstep(0.45, 0.95, vUv.y));
float bisTwigMid = smoothstep(4.4, 5.8, vTreePos.y) * (1.0 - smoothstep(0.40, 0.90, vUv.y));
`;

/** 皮孔点场（High 专属近景——ALU 网格 hash，细枝域稀疏点缀） */
const BIS_BARK_LENTICEL = /* glsl */ `
// 皮孔两档（FRPS「当年生枝绿色，皮孔明显，灰白色，老枝变褐色，皮孔变锈褐色」Verified [1][3]——近景身份点）：
// 36×30 格 hash 抖动、65% 格有孔（vs 栾皮孔全干密布 82%——细枝域稀疏一档）；锈褐（老枝档）/灰白（当年生档）分色在 MUL
vec2 bisLc = vec2(vUv.x * 36.0, vUv.y * 30.0);
vec2 bisLId = floor(bisLc);
float bisLR = fract(sin(dot(bisLId, vec2(127.1, 311.7)) + 23.7) * 43758.5453);
vec2 bisLF = fract(bisLc) - 0.5 - (vec2(fract(bisLR * 7.31), fract(bisLR * 3.17)) - 0.5) * 0.50;
float bisLenticel = (1.0 - smoothstep(0.10, 0.20, length(bisLF))) * step(0.35, bisLR) * max(bisTwigHi, bisTwigMid * 0.85);
`;

/** High：合成（基底褐微变 + 沟内暖暗 AO + 老干网状 + 干基暗化 + 细枝绿-褐两档 + 皮孔两档） */
const BIS_BARK_MUL = /* glsl */ `
vec3 bisBarkMul = vec3(bisRidge) * (0.93 + 0.13 * bisWarp); // 基底单色微变 ±6%（「树皮褐色」FRPS Verified [1][3]——无剥落无三色带；游走场复用）
bisBarkMul *= mix(vec3(0.80, 0.78, 0.76), vec3(1.04, 1.02, 0.98), smoothstep(0.20, 0.70, bisTri)); // 沟内暖暗 AO（深沟宽脊两带分化——沟暗脊面暖灰）
bisBarkMul *= mix(vec3(1.0), vec3(0.87, 0.85, 0.84), bisNet * 0.8); // 老干交叉网状微暗（脊线横断交错——扭转读向的近景层）
bisBarkMul *= mix(vec3(1.0), vec3(0.87, 0.86, 0.87), bisBarkBase * 0.7); // 干基暗化（家族惯例低调项）
bisBarkMul = mix(bisBarkMul, bisBarkMul * vec3(0.88, 1.16, 0.74), bisTwigHi * 0.75); // 当年生枝绿色收敛（近景身份点）
bisBarkMul = mix(bisBarkMul, bisBarkMul * vec3(1.05, 0.98, 0.90), bisTwigMid * 0.40); // 老枝褐弱收敛（基底已褐——弱档）
bisBarkMul *= mix(vec3(1.0), mix(vec3(1.42, 1.06, 0.72), vec3(1.38, 1.38, 1.32), bisTwigHi), bisLenticel * 0.85); // 皮孔两档：老枝锈褐 ↔ 当年生灰白（FRPS 色序 Verified）
diffuseColor.rgb *= bisBarkMul;
`;

/** Mid：合成（去老干网状/皮孔点——近景细节层；脊沟扭转/沟内 AO/干基暗化/细枝两档保留） */
const BIS_BARK_MUL_MID = /* glsl */ `
vec3 bisBarkMul = vec3(bisRidge) * (0.93 + 0.13 * bisWarp); // 基底褐微变保留（中距「褐」色块身份）
bisBarkMul *= mix(vec3(0.80, 0.78, 0.76), vec3(1.04, 1.02, 0.98), smoothstep(0.20, 0.70, bisTri)); // 沟内暖暗 AO（深沟宽脊中距两带）
bisBarkMul *= mix(vec3(1.0), vec3(0.87, 0.86, 0.87), bisBarkBase * 0.7); // 干基暗化保留
bisBarkMul = mix(bisBarkMul, bisBarkMul * vec3(0.88, 1.16, 0.74), bisTwigHi * 0.75); // 细枝绿过渡保留（冠缘绿细枝中距读向）
bisBarkMul = mix(bisBarkMul, bisBarkMul * vec3(1.05, 0.98, 0.90), bisTwigMid * 0.40);
diffuseColor.rgb *= bisBarkMul;
`;

/** Low：合成（再去干基暗化/老枝褐档——低调项；脊沟 + 沟内 AO + 当年生绿档保留） */
const BIS_BARK_MUL_LOW = /* glsl */ `
vec3 bisBarkMul = vec3(bisRidge) * (0.93 + 0.13 * bisWarp); // 脊沟扭转基底（远距「褐纵裂剪影」保留面）
bisBarkMul *= mix(vec3(0.80, 0.78, 0.76), vec3(1.04, 1.02, 0.98), smoothstep(0.20, 0.70, bisTri)); // 沟内 AO（纵裂两带剪影）
bisBarkMul = mix(bisBarkMul, bisBarkMul * vec3(0.88, 1.16, 0.74), bisTwigHi * 0.75); // 当年生绿档（结构剪影项三档保留）
diffuseColor.rgb *= bisBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 三出复叶卡材质（组 1）：三叶场并集 SDF alphaTest 裁切 + 小叶脉两件（High）+
 * 叶背弱差 + 家族中庸透光 + 新叶红褐 flush + 逐叶变奏 + 风动。level 分档（T011.8，
 * 缺省 'high'）：Mid 去小叶脉/叶团/糙度叶团项（Spec §7 叶脉仅近距可辨；**SDF 全形
 * 含三叶并集/齿/凹口保留——档间剪影一致：三出剪影是中距身份**），透光/叶背/
 * hue·luma/flush/shade/两面糙度差保留；Low 换 BIS_LEAF_SDF_LOW（宽卵大叶单包络
 * ——三裂细化；总柄线/bare 门控/坡宽与 High 逐字同源）+ 去透光，片元零噪声采样。
 * 风动三档同源不动（BIS_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：中绿-深绿 #517c35（工程设定——Spec §5 正面中绿-深绿〔照片 leaf-b 单源
 * Inferred〕；九树亮度链：银杏 > 朴 > 悬 > 栾 > **重阳木** > 乌桕 > 夏栎 > 榉 >
 * 樟）/ m 0 / r 0.70（「小叶片纸质」FRPS Verified [1][3]——与栾纸质同档哑光）/
 * DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createBischofiaLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x517c35, // 中绿-深绿（工程设定：Spec §5 Inferred + leaf-b [7] 交叉——九树链栾乌之间；中距色块与栾中绿/乌桕深绿相邻档区分）
    metalness: 0,
    roughness: 0.70, // 纸质复叶哑光（「小叶片纸质」Verified [1][3]——悬铃木厚实 0.66 < 0.70 = 栾 0.70 < 朴树近革质 0.72）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 三出复叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? BIS_LEAF_SDF_LOW : BIS_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含三叶并集/齿/凹口）
  const leafBody = level === 'high'
    ? BIS_LEAF_HEAD + BIS_LEAF_CLUMP + BIS_LEAF_SHADE + BIS_LEAF_VEIN + BIS_LEAF_MUL_HIGH + BIS_LEAF_BACK
    : BIS_LEAF_HEAD + BIS_LEAF_SHADE + BIS_LEAF_MUL_SIMPLE + BIS_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (bisClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.05, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.05, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面糙度差保留——全株无毛最小差）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${BIS_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${BIS_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${leafSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${leafBody}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${leafRoughness}`,
    );
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${BIS_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `bischofia:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（皮单域——无花果域分支，vs 栾三域/乌桕两域的简化）：第 9 树皮语言
 * 「褐-深灰褐纵裂深沟宽脊 + 扭转」（裂线游走强 drift + 8 宽脊深沟剖面 + 沟内暖暗
 * AO + 老干交叉网状（High）+ 干基暗化 + 细枝绿-绿褐过渡 + 皮孔灰白↔锈褐两档
 * （High））。level 分档（T011.8，缺省 'high'）：Mid 去老干网状/皮孔点（近景细节
 * 层），脊沟扭转/沟内 AO/干基暗化/细枝两档保留——中距「褐纵裂深沟宽脊 + 冠缘绿
 * 细枝」身份（Spec §7 中距保留面）；Low 再去干基暗化/老枝褐档（低调项），脊沟 +
 * 沟内 AO + 当年生绿档保留（远距「褐纵裂剪影」保留面），1× vnoise。风动 = 整树
 * 缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用）。
 * 底参：深灰褐-暗褐主调 #675a4b（工程设定——FRPS「树皮褐色」Verified [1][3] +
 * bark-a「深灰褐-暗褐」/bark-b「深灰褐」[7] 交叉；R−G=13 褐向与樟争家族最褐端、
 * 亮度更暗〔九树链：重阳木 < 樟 < 乌桕 < 榉 < 悬 < 栾〕）/ m 0 / r 0.92（纵裂深沟
 * 族高糙哑光）/ FrontSide（皮管闭合实体——无裁切无 alphaTest）。
 */
export function createBischofiaBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x675a4b, // 深灰褐-暗褐（工程设定：FRPS「树皮褐色」[1][3] + bark-a/b 照片 [7] 交叉——褐向 R−G=13、暗端读向）
    metalness: 0,
    roughness: 0.92, // 纵裂深沟族高糙哑光（与乌桕/樟同档——vs 悬光滑 0.86 / 栾粉质 0.87）
    side: THREE.FrontSide, // 皮管闭合实体（无花果域裁切需求——vs 栾 DoubleSide 三域的分化）
  });
  material.defines = { USE_UV: '' }; // 皮域脊沟 = uv 驱动（v = 累计弧长契约）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  // 单域平铺（无 if/else 分支块）——全部声明位于 main 顶层，roughnessmap 注入跨 include 消费天然可见
  // （triadica 皮域分支作用域事故的结构性免疫；守卫测试 braceDepth=1 断言固化）
  const barkBody = level === 'high'
    ? BIS_BARK_WARP + BIS_BARK_TONE + BIS_BARK_NET + BIS_BARK_BASEDARK + BIS_BARK_TWIG + BIS_BARK_LENTICEL + BIS_BARK_MUL
    : level === 'mid'
      ? BIS_BARK_WARP + BIS_BARK_BASEDARK + BIS_BARK_TWIG + BIS_BARK_MUL_MID
      : BIS_BARK_WARP + BIS_BARK_TWIG + BIS_BARK_MUL_LOW;
  const barkRoughness = level === 'high'
    ? 'roughnessFactor = clamp(0.92 - bisLenticel * 0.10 - bisBarkSmooth * 0.08, 0.05, 1.0); // 皮孔微凸微泽 + 上部细枝微光'
    : level === 'mid'
      ? 'roughnessFactor = clamp(0.92 - bisBarkSmooth * 0.08, 0.05, 1.0); // Mid：皮孔项随段去（细枝微光保留）'
      : 'roughnessFactor = 0.92; // Low：纵裂高糙哑光基底（上部微光项随段去）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${BIS_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${BIS_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${barkBody}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${barkRoughness}`,
    );
  };
  material.customProgramCacheKey = () => `bischofia:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（同源
 * 全形含三叶并集/齿/凹口——档间剪影一致）；Low = BIS_LEAF_SDF_LOW（表面/影档内
 * 一致——宽卵大叶单包络）。**深度片元不挂噪声库**——SDF 零 facVnoise 引用（三叶
 * 场/齿载波/凹口全 ALU；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 组 0 守卫：皮域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质时
 * 组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例；无花果域无需 v 路由）。
 * 风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap 按主材
 * 质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap 按主材质
 * alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createBischofiaLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 三出复叶卡 uv
  const leafSdf = level === 'low' ? BIS_LEAF_SDF_LOW : BIS_LEAF_SDF; // Mid 深度 = High SDF（同源全形含三叶并集/齿/凹口）
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
attribute float aLeafRand;
varying float vLeafRand;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
${leafSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, bisLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮管 uv 域不误裁）`,
    );
  };
  material.customProgramCacheKey = () => `bischofia:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
