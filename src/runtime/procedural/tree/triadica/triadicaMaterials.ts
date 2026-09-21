/**
 * runtime/procedural/tree/triadica/triadicaMaterials —— 乌桕（Triadica sebifera，
 * asset_tree_triadica）叶/皮（含绿闭果域）/叶影深度材质（T011.7，阔叶族第八材质实例
 * ——**菱形叶 + 叶柄腺体语言首例**）。
 *
 * 职责：复制七先例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce
 * 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 * <color_fragment> 绝不触碰），物种配方按乌桕自己的 Reference Spec 换装——
 * Spec docs/research/triadica-reference.md **1.0**（任务书锚点 1.0，开工前已校验一致，
 * 生产一律以文末「终审记档（主代理）」④ 生产口径终版建议为准：①体量锚树高 ≈9–10m /
 * 冠幅比 0.8–1.0 / 净干占比低；②叶 = 菱形/菱状卵形主相 6–7 成 + 阔卵-心形端变体、
 * 腺体毫米级近景可辨（表达路径归材质层——本文件承载）；③树皮第 8 语言「暗灰-灰褐
 * 窄纵裂 + 窄条翘皮」（第 8 = 夏栎1 朴2 樟3 榉4 银杏5 悬铃木6 栾树7 乌桕8——收尾轮
 * 编号笔误修正，原文「第 7」与栾树撞号）；④夏季相果 = 绿闭小蒴果可做（低-中显著）；花黄绿穗弱显著。
 * 消费冻结几何契约（与七先例同款）：组 0 皮（含果序）组 1 叶卡，叶卡固有 attribute
 * aLeafRand / aBend + 实例 aSeed；组 0 aLeafRand 恒 0、aBend 恒 0。
 *
 * 【与几何侧的冻结接口（主代理简报冻结，不得偏离）】
 *   - 三工厂签名：(level: ProceduralLevel = 'high') => THREE.MeshStandardMaterial /
 *     MeshDepthMaterial；每次调用全部 new（D17）。
 *   - 恰两组语义：组 0 = 皮 + 绿闭果序（createTriadicaBarkMaterial 一材质两域分支）、
 *     组 1 = 叶卡（createTriadicaLeafMaterial）；材质数组序 [皮, 叶]。
 *   - uv 域身份标记（几何侧冻结）：果序顶点 uv v∈[4,5]（u 自由 = 逐果随机）、
 *     aLeafRand = 0、aBend = 0；皮管弧长域不侵入 [4,5)。材质侧域判据阈值 3.5
 *     （果域 4.0 下探 0.5 隔离带——koelreuteria 4.5/6.0 三重隔离同款纪律，platanus
 *     v∈[2,3] 碰撞教训）。
 *   - 顶点属性：叶卡 aLeafRand 逐叶 ∈[0,1) 同卡 6 顶点同值 / aBend 卡内根→尖非降；
 *     组 0 恒 0（果序刚性）。
 *
 * 【菱形/菱状卵形 SDF——第七种叶形语言，全缘连续轮廓族内新路径（本任务核心，限定
 *   文件内最小扩展，记缺口候选②）】
 *   前六例单叶语言：夏栎倒卵羽裂 / 朴树卵形齿缘 / 樟卵状椭圆全缘 / 榉卵形锯齿 / 银杏
 *   扇形二叉脉顶缺刻 / 悬铃木阔卵掌状裂（栾为复叶窗列另族）。菱形叶的结构信息是
 *   「中部最宽、向两端收放的棱形-菱状卵形轮廓」——包络峰**居中** + 缘的**直线感**
 *   （vs 卵形族的偏基峰 + 凸缘鼓腹）。新路径 = **指数充满度法**（envelope fullness
 *   exponent——同一 sin 全周期包络上，指数 >1 把凸缘向三角形收直 = 棱角/直缘的发生学
 *   表达；卵形族指数 <1.1 鼓凸、菱形族 1.35–1.88 收直）：
 *   ① 全周期包络 sin(π·v^0.94)：峰 v≈0.478 近中部——「叶近等长宽」FOC 检索表
 *      "nearly as long as wide" Verified [4]（菱形本质；宽≈长的比例归几何侧）。
 *   ② 指数充满度 mix(1.35, 1.88, ss(0.22,0.55,v))：基 1.35 阔楔开张（「基部阔楔形或
 *      钝」FRPS Verified [1]——v=0.10 半宽 ≈25% 峰值：楔形收放非圆钝）→ 中段 1.88
 *      菱形直缘（v=0.25 半宽 ≈55% 峰值：菱形直线 42% 与樟卵形 73% 之间的菱状卵形域
 *      ——「菱形、菱状卵形」FRPS 首列 Verified [1] 的统计主相）。
 *   ③ 先端骤尖长尾头：「顶端骤然紧缩具长短不等的尖头」FRPS Verified [1]——上段指数
 *      ramp：mix(→2.95+0.95·fract(rand·5.731+0.41), ss(0.68,0.86,v))，2.95–3.90 逐叶
 *      变奏 = 尖头**长短不等**的统计实现；v=0.80 半宽收至 v=0.68 的 ≈25%（骤然紧缩）
 *      + v=0.90 半宽 <6% 峰值（细长尾尖 "apex acutely acuminate" FOC Verified [3]）。
 *      JS 数值锚测试覆盖（骤缩比/尾宽/不对称）。
 *   ④ 心形端变奏（aLeafRand 驱动，≈34% 叶域）：「base … sometimes shallowly cordate」
 *      FOC Verified [3] + 阔卵-近心形端占 3–4 成照片读向 [7]——基部中心圆顶凹口减法
 *      （径向窗 R=0.17、深度 0.05–0.11 逐叶、域限基部中心 triCordOf 门控 smoothstep
 *      (0.60,0.72,fract(rand·7.117+0.53))）——platanus dip 减法机制同族、挂载点换叶基
 *      中心；两出基脉起点随心形下移联动（见叶脉段）。
 *   ⑤ 全缘无齿载波（樟先例——「全缘」FRPS/FOC Verified [1][3]）：零载波零扰动，SDF
 *      纯 ALU（深度材质同源不挂噪声库的前提）；「微波状」类次要读向不载入（樟口径）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - 脉型：羽状脉 + 基部两出（掌状-羽状过渡）——中脉两面微凸亮带（「中脉两面微凸起」
 *     FRPS Verified [1]，平顶加宽先例口径）+ 基部长两出侧脉对（leaf-c「基部两出侧脉」
 *     [7]——离基渐显斜升外展、中带前内收渐隐不达缘「离缘 2-5 毫米弯拱网结」Verified
 *     [1]；起点 v0 = mix(0.15, 0.06, 心形度)——心形叶两出脉更贴基）+ 侧脉 6–10 对纤细
 *     斜升（「侧脉6-10对，纤细，斜上升」Verified [1]——sin 脊族 pow^8 纤细、逐叶频
 *     66–78 → 卡面 7–8 对中段统计）。**脉色偏黄显著**（NC "Conspicuous yellow veins
 *     on both sides" Verified [5]——身份点）：脉乘色 (1.66,1.44,0.86) R 强抬 B 压低 =
 *     黄绿亮于叶面；两面同显（"on both sides"）。
 *   - 腺体（大戟科身份，材质层唯一承载——决定做）：叶基-叶柄交接处**一对黄绿腺点**
 *     （FRPS「叶柄……顶端具2腺体」Verified [1] + leaf-b/leaf-c 近景判读 [7]）——卡域
 *     (±0.028, 0.055) 两个小点（半径 0.012–0.030 smoothstep，≈1–2mm 当量微放大），
 *     乘色 (1.85,1.60,0.42) 黄绿亮；High 专属（近景 1–2m 可辨、中距亚像素自然消失
 *     ——生产口径，与叶脉同档取舍）。JS 断言腺点存在。
 *   - 新叶铜红 flush（生长季冠内零星红梢——leaf-c/716489846/689658920 三照片源
 *     Inferred [7]）：低优先变奏——step(0.945, fract(rand·9.417+0.71)) ≈5.5% 叶域
 *     铜红-绯红偏移 ×(1.80,0.60,0.34)，三档同体（冠级点缀信号档间一致；非身份主信号
 *     ——叶位语义缺失，红梢全域统计散布记缺口候选⑥）。
 *   - 叶色：正面中绿-深绿有光泽（NC "medium to dark green" Verified [5] + 照片六源
 *     medium green glossy [7]）——底色 #507c34（工程设定；八树亮度链：银杏 > 朴 >
 *     悬铃木 > 栾 > **乌桕** > 夏栎 > 榉 > 樟——中绿-深绿档）；光泽中档 roughness
 *     0.58（纸质叶非革质——「纸质」FRPS Verified [1]，gloss 低于香樟 0.50 革质口径
 *     一档：樟 0.50 < 乌桕 0.58 < 榉 0.62）。背面稍浅淡绿（NC "lighter underside" /
 *     wiki "slightly paler beneath" Verified [5][6]——非粉绿级弱色差）×(1.06,1.08,
 *     1.02)（幅度六树最弱档——两面色差弱不做强双面）；两面糙度差 +0.05（「各部均
 *     无毛」Verified [1]——最小差）。
 *   - 背光透光（纸质薄叶中等偏上）：峰值 0.33（悬 0.28 < 栾 0.32 < **乌桕 0.33** <
 *     银杏 0.34——纸质薄菱叶透风透光）+ 透射色 (0.55,0.91,0.34)；逐叶变奏 ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand：色相两端冷中绿↔暖黄绿（通道摆幅 ≤15% 纪律）+ 明度 ±8%
 *     （去相关取样）+ 心形域 34% / 尾尖长短 2.95–3.90 / 侧脉频 58–70 / 透光变奏 /
 *     flush 5.5%（多通道复用同一 rand——统计近似是家族契约下的最大表达，缺口候选①）。
 *   - 冠内竖向自遮蔽（冠基 ≈2.2m——净干占比 0.15–0.30 终审 ④ × 树高 9.5m 取中，
 *     工程锚记档：几何 slot-0 未落盘，落盘后同源锚同步点记缺口候选⑤）+ 中频叶团斑块
 *     （High，波长 ≈0.85m ≈ 团块 1/8–1/12 冠幅——中细质轻盈叶幕 Spec §3 Inferred [7]）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent——实例化 +
 *     深度排序灾难）；坡宽 0.04（单叶先例口径）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值记档）：整树缓摆 ~0.18Hz / 顶部 ~4.4cm
 *     （aSeed 相位，hash 常数 86.531/63.917 与七先例相位流去相关）+ 叶片快颤 11–18
 *     rad/s（≈1.75–2.9Hz）/ ≤12mm——**长柄飘逸**（柄 2.5–6cm ≈ 等长 blade、leaf-c
 *     实测 1–1.5× blade [7]：近自由摆——幅度 12mm 介于银杏长柄扇叶 13mm 与栾 11mm
 *     之间、频率高于银杏 10–17 一档）；aBend 权重（卡根≈0 尖大）；树高锚 9.5m
 *     （×0.1053——终审 ④ ≈9–10m 取中工程锚记档）。
 *
 * 皮（组 0）配方（**第 7 种树皮语言「暗灰-灰褐窄纵裂 + 窄条翘皮碎斑」**——FRPS「树皮
 *   暗灰色，有纵裂纹」+ FOC 龄级句 + NC "peel off in vertical, narrow strips" 三源
 *   Verified [1][3][5]；vs 六先例：夏栎/樟深纵裂脊沟族、朴平滑浅裂小斑、榉光滑暖色
 *   薄片斑驳、悬铃木光滑大片三色地图、栾浅色光滑皮孔麻点。分化点：①暗色调（暗灰-
 *   灰褐主调——vs 栾 #90928a 最浅/榉暖色/悬冷调灰绿）；②纵裂但**脊窄沟浅-中**（vs
 *   夏栎/樟深纵裂宽脊——脊数 11 窄脊、沟底 0.60 浅-中剖面）；③**窄条翘皮碎斑**（窄
 *   竖条 14 条/周 × 竖向碎段 × 局部域——条面浅灰亮 + 条界翘缝暗；vs 悬铃木大片地图
 *   拼贴：条状窄、竖向、碎）：
 *   - 主调 #6f6a62 暗灰-灰褐（工程设定——FRPS 暗灰 + bark-c「暗灰褐」[7] 交叉；八树
 *     亮度链暗色族：樟 < **乌桕** < 榉 < 悬 < 栾——暗于全部灰绿/浅色族、亮于樟黄褐
 *     深沟读向；R−G=5 微暖 = 灰褐向）。
 *   - 脊沟系统：裂线游走低频 (2.0,1.0) 纵向连续（樟同族更缓）+ 11 窄脊 tri 剖面 +
 *     沟浅-中 mix(0.60+0.40·tri², 0.90+0.10·tri², 上部门控)（「沟浅-中」bark-b 相
 *     [7]；vs 樟 0.50 深 / 朴 0.76 浅）+ 沟内冷灰 AO（沟暗脊浅灰——两带分化）。
 *   - 翘皮碎斑（身份核心）：翘皮域场 (3.4,7.5)（u 低频局部域 × v 高频碎段——条状
 *     窄、竖向、碎）× 窄竖条族 14 条/周（游走调制）→ 条核亮面 ×(1.13,1.11,1.05)
 *     （窄条翘起浅灰亮缘读向）+ 条界翘缝暗 ×(0.72,0.70,0.68)（High 专属近景浮雕
 *     读向——条缘翘缝阴影）。
 *   - 干基向暗化微渐变（低调）：高度门控 (0.6,2.4) ×0.7 ×(0.88,0.87,0.88)——老干
 *     暗灰深裂带读向（bark-a/form-a [7]）；幼干灰绿光滑纵细纹**不做**记档（单一中龄
 *     龄档——FOC 龄级句的幼干端不建模）。
 *   - 干上部/细枝：向**灰绿**收敛 ×(0.94,1.02,0.88)（小枝亮绿色带浅色皮孔——大戟科
 *     近景点，leaf-c「亮绿小枝」[7]；vs 悬/栾红褐收敛的分化）+ 微光（糙度 −0.12）；
 *     浅色皮孔点不做记档（近景细节——皮孔麻点语言归栾树，不串种）。
 *   - 苔藓/地衣不做（bark-a 银灰地衣斑弱单源不承重——不做不编造，沿先例）；微起伏
 *     已归几何层（浅起伏纵脊族 ~0.024–0.030 由几何侧承载，任务书口径）。
 *   - 风动：整树缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用）。
 *
 * 果域分支（v∈[4,5]，组 0 一材质两域——platanus/koelreuteria 果域路由先例）：
 *   - 夏季相绿闭蒴果（判定：夏季相树上果 = 绿色闭合小蒴果径 1–1.5cm、显著性低-中
 *     ——Spec §4 证据链三源 Verified；白蜡爆米花相属夏末起-冬相**不建模**记档）：
 *     中绿带黄（果-c「中绿带黄」[7]）两端 per-果变奏 (0.56,0.66,0.28)↔(0.66,0.74,
 *     0.36)（u 自由 = 逐果随机——几何冻结接口）+ 光泽微高 roughness 0.62（vs 皮高糙
 *     0.92）；实体无裁切（果为闭球——alpha 恒 1）；宿存柱头暗点记档**不做**（果卡
 *     局部 uv 未冻结——接口只冻结 v 域，柱头点位无锚）。
 *   - 花（黄绿穗弱显著）**不建模**记档：恰 2 组容量给果序（主代理 Step 1 判定）——
 *     顶生总状黄绿细穗归几何/后续变体档议题，缺口候选④。
 *
 * 深度材质（customDepthMaterial 契约通道——沿 SOP 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与
 *     叶表面材质共享同一 GLSL 字符串（表面改叶形深度自动同步，禁复制粘贴）。
 *   - **零噪声库注入**：菱形包络/凹口/腺点全 ALU → SDF 零 facVnoise 引用 → 深度片元
 *     不挂 FACILITY_GLSL_NOISE（樟全缘先例 + 榉 011.3 组合口径）。保护性约束：SDF
 *     字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 多材质网格守卫：组 0（皮 + 果序）以恒等 attribute（aLeafRand=0）走实心分支，
 *     防叶形 SDF 在圆柱/果球 uv 域上误裁出洞（platanus 恒等 attribute 先例——果域
 *     无需 v 路由，rand=0 即守卫）。
 *   - 档位匹配：Mid = High SDF 同源全形（含心形凹口——档间剪影一致）/ Low =
 *     SDF_LOW 零凹口版（远距「菱形轮廓可辨、基形变奏不可辨」Spec §7 牺牲顺序——
 *     菱形叶轮廓 + 开展圆头剪影最后保留；包络/骤尖收口与 High 逐字同源——去细节
 *     不改形原则）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T011.7，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去叶脉三件（中脉带/两出基脉对/侧脉脊族）/腺点/中频叶团 + 糙度叶团项
 *     （Spec §7 叶脉与腺体仅近距可辨——「近景 1–2m 可辨、中距自然消失」生产口径）；
 *     SDF 全形（含心形凹口——档间剪影一致）/透光/叶背/hue·luma/flush/shade/两面糙度
 *     差保留（颜色层次档间连续保留面）。
 *   - 叶 Low：SDF 换 TRIADICA_LEAF_SDF_LOW（去心形凹口——近景基形变奏细化；包络/
 *     骤尖收口与 High 逐字同源）+ 去透光（远距逆光透射不可辨）；hue·luma/shade/
 *     flush/叶背保留；片元零噪声。
 *   - 皮 Mid：去条界翘缝暗（High 专属近景浮雕读向）；纵裂脊沟/翘条碎斑亮面/干基暗化/
 *     果域全保留——中距「暗灰窄纵裂 + 碎亮斑 + 冠缘绿果」身份（Spec §7 中距保留面）。
 *   - 皮 Low：再去翘皮碎斑/干基暗化（远距亚像素/低调项）；纵裂脊沟 + 上部灰绿 + 果域
 *     绿果保留（远距「暗灰纵裂剪影」保留面）；1× vnoise。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；triadica 前缀不与七先例混缓存）：
 *     'triadica:leaf' / 'triadica:leaf:mid' / 'triadica:leaf:low'；'triadica:bark' /
 *     'triadica:bark:mid' / 'triadica:bark:low'；'triadica:leaf-depth' /
 *     'triadica:leaf-depth:mid' / 'triadica:leaf-depth:low'（9 键全异）。
 *   - 风动（TRIADICA_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分
 *     （D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团斑块；全缘免齿载波噪声）= 3× + SDF（包络 sin/
 *     pow + 凹口 length/pow）≈ 2.5× + 腺点 length ≈ 0.5× + 叶脉三件 ≈ 2.5× + 透光/
 *     两面/flush/hue ≈ 2× ≈ **10.5×**（低于朴树 11.5×/悬铃木 12×——全缘红利）；
 *   - 叶 Mid 片元 = 0× 噪声（噪声库死码编译消除）+ 简化 ALU ≈ 3×；叶 Low ≈ 2.5×；
 *   - 皮 High 片元 = 2× vnoise（裂线游走 + 翘皮域场）= 6× + 脊沟/翘条 ALU ≈ 1.5×
 *     ≈ 7.5×；皮 Mid ≈ 7×（去 crack 项）；皮 Low = 1× vnoise ≈ 4×；
 *   - 深度片元 = SDF 纯 ALU ≈ 2.5×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——指数充满度包络/翘皮碎斑
 *   场全部限定文件内）：
 *   ① 心形域/尾长/侧脉频/flush 共用 aLeafRand 单属性统计近似（多通道复用同一 rand
 *     ——变奏间相关性无法表达；几何侧若有叶位语义通道可精确分型，家族共有缺口）；
 *   ② 菱形「指数充满度」包络 SDF：本文件内实现；族内再现菱形/菱状渐变叶形可提炼为
 *     家族公共 SDF 模式（暂不动公共抽象）；
 *   ③ 腺体为近景亚视觉（毫米级设计内）——若族级需中距腺体可辨需几何层腺点结构（材质
 *     层已到卡分辨率表达上限）；
 *   ④ 果序无独立形变/成熟度通道（u 仅色变奏；绿→黑成熟序列与白蜡相不建模〔建模相 =
 *     夏季绿闭果〕）；花黄绿穗无组容量（恰 2 组冻结——第三材质组契约扩展议题）；
 *   ⑤ 树高锚 9.5m/冠基 2.2m 材质侧工程锚（终审 ④ 域取中——几何 slot-0 未落盘；与
 *     koelreuteria ⑥ 同型家族缺口：profile 变更需材质侧同步）；
 *   ⑥ 新叶 flush 红梢的叶位语义缺失（真实红梢集中顶梢新生区——rand 统计近似全域
 *     散布；需叶位/新生标记通道）。
 *
 * X4000 口径（011.6 终裁带入）：console X4000 警告若复现 = FXC 数据流保守误报预期
 *   口径——直接接受记档，不逐树变体消元追逐（族级议题归 011.13）；GLSL 全路径初始
 *   化运行零错误为准（凹口/腺点均单赋值初始化，无 out 参）。
 *
 * 【Step 4 视觉验证实证修复记档（2026-09-21，主代理浏览器取证）】皮材质真实编译错误
 *   （非 X4000 误报口径）：roughnessmap_fragment 注入（main 顶层、模板序在 map 之后）
 *   消费 map 注入 else 块内声明的 triBarkSmooth → 块作用域已关闭、未声明（High/Mid
 *   两档程序均失败）；次生静默 bug：TRIADICA_BARK_CURL 块内 `float triCurlCore =`
 *   遮蔽 domainVars 预声明——roughness 消费的域外变量恒 0.0，翘条微泽项从未生效。
 *   修复：domainVars 三档统一预声明 triBarkSmooth/triCurlCore 两跨 include 变量 +
 *   块内改纯赋值（koelreuteria koeDot 赋值域变量同款纪律）；测试新增跨 include 作用
 *   域防回归 guard（roughness/透光注入段消费的 tri* 标识符必须 main 顶层唯一声明）。
 *   叶材质自查：leafBody 平铺无块包裹（map 注入声明的 triClump/triAlpha 在 main
 *   顶层，roughness/透光注入点可见）——无同型问题，guard 断言一并固化。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与七先例的通用段
 *   （风动公式等）为复制改造非 import（资产私有，跨资产不耦合——organization.md 边界）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`triadica 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，组 0 恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值记档：
 * hash 常数 86.531/63.917（与七先例相位流去相关）+ 树高锚 9.5m（×0.1053——终审 ④
 * ≈9–10m 取中工程锚：几何 slot-0 未落盘记档，落盘后同源锚同步点见缺口候选⑤）；
 * 快颤 11–18 rad/s（≈1.75–2.9Hz）/ ≤12mm——长柄飘逸（柄 2.5–6cm ≈ 等长 blade、
 * leaf-c 实测 1–1.5× blade [7]：轻质纸质叶近自由摆——幅度介于银杏长柄扇叶 13mm 与
 * 栾 11mm 之间、频率高于银杏 10–17 一档）。
 */
const TRIADICA_WIND = /* glsl */ `
// triadica wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float triWindPhase = fract(sin(aSeed * 86.531 + 3.4) * 43758.5453);
float triWindH = clamp(position.y * 0.1053, 0.0, 1.0); // /9.5m 树高锚（终审 ④ ≈9–10m 取中工程锚——缩放抖动下权重近似）
float triSway = triWindH * triWindH * 0.044 * sin(uTime * 1.15 + triWindPhase * 6.28318 + triWindH * 1.4);
// 叶片快颤：ω = 11 + 7φ（11–18 rad/s ≈ 1.75–2.9Hz），幅度 ≤12mm（长柄 1–1.5× blade 轻纸质叶近自由摆）；权重 = aBend（卡根≈0 尖大）
float triFlutterPhase = fract(sin((aSeed + aLeafRand) * 63.917 + 5.1) * 43758.5453);
float triFlutter = aBend * 0.012 * sin(uTime * (11.0 + 7.0 * triFlutterPhase) + triFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (triSway + triFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(triSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * triFlutter * 0.9; // 叶面沿卡法线微扑（组 0 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const TRIADICA_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 心形端门控（≈34% 叶域——「sometimes shallowly cordate」FOC Verified + 阔卵-心形端
 * 3–4 成照片读向）：SDF 凹口与叶脉两出基脉起点（triBasalV0）共享的单一来源。
 */
const TRIADICA_CORD_GATE = /* glsl */ `
float triCordOf(float triR) {
  return smoothstep(0.60, 0.72, fract(triR * 7.117 + 0.53));
}
`;

/**
 * 乌桕菱形/菱状卵形叶形覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶顶 1；宽≈长比例归
 * 几何侧）：全周期包络 sin(π·v^0.94)（峰 v≈0.478 近中部——「叶近等长宽」FOC 检索表
 * Verified [4]）× 指数充满度 mix(1.35, 1.88, ss)（基 1.35 阔楔开张 → 中段 1.88 菱形
 * 直缘——指数 >1 把 sin 凸缘向三角形收直 = 棱角/直缘读向的发生学表达）× 上段骤尖
 * 指数 ramp（mix → 2.95+0.95·fract(rand)——「顶端骤然紧缩具长短不等的尖头」FRPS
 * Verified [1] 的逐叶统计实现）− 心形基凹口（域限基部中心圆顶减法——platanus dip
 * 机制同族挂叶基，≈34% 叶域）× **全缘零载波**（樟先例——无齿附加项）；**零
 * facVnoise 引用是深度材质不挂噪声库的前提（引入即深度编译暴雷——保护性约束）**；
 * 返回近似符号距离的覆盖率坡（edge/0.04——alphaToCoverage 的 fwidth smoothstep 吃
 * 这条坡抗锯边；坡宽 0.04 沿单叶先例 AA 口径）。
 */
const TRIADICA_LEAF_SDF = /* glsl */ `
${TRIADICA_CORD_GATE}
float triLeafAlpha(vec2 triUv, float triRand) {
  vec2 triP = vec2(triUv.x - 0.5, triUv.y);
  float triEnvSin = sin(3.14159 * pow(clamp(triP.y, 0.001, 0.999), 0.94)); // v^0.94：最宽 v≈0.478 近中部（菱形「宽≈长」读向——vs 卵形族偏基峰 0.40–0.46）
  float triEnvExp = mix(mix(1.35, 1.88, smoothstep(0.22, 0.55, triP.y)), 2.95 + 0.95 * fract(triRand * 5.731 + 0.41), smoothstep(0.68, 0.86, triP.y)); // 指数充满度：基 1.35 阔楔开张 → 中 1.88 菱形直缘 → 上段 2.95–3.90 骤尖长尾（逐叶长短不等）
  float triEnv = pow(triEnvSin, triEnvExp);
  float triNotch = (0.05 + 0.06 * fract(triRand * 3.713 + 0.22)) * triCordOf(triRand)
    * pow(max(0.0, 1.0 - length(vec2(triP.x * 1.35, (triP.y - 0.01) * 1.2)) / 0.17), 2.0); // 心形基凹口（域限基部中心——两肩不受影响）
  float triEdge = 0.5 * triEnv - abs(triP.x) - triNotch; // 全缘零载波（樟先例）
  return clamp(triEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.04（单叶先例 AA 口径）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档取用）：
 * 包络 + 指数充满度 + 骤尖收口即可——去心形凹口（**近景基形变奏细化**：远距菱形轮廓
 * 可辨、心形基不可辨 Spec §7 牺牲顺序；片元零噪声先天成立）。包络/收口与 High 逐字
 * 同源（档间叶形身份一致的去细节不改形原则——远距保留菱形叶轮廓色块）。
 */
const TRIADICA_LEAF_SDF_LOW = /* glsl */ `
float triLeafAlpha(vec2 triUv, float triRand) {
  vec2 triP = vec2(triUv.x - 0.5, triUv.y);
  float triEnvSin = sin(3.14159 * pow(clamp(triP.y, 0.001, 0.999), 0.94)); // 包络（与 High 逐字同源）
  float triEnvExp = mix(mix(1.35, 1.88, smoothstep(0.22, 0.55, triP.y)), 2.95 + 0.95 * fract(triRand * 5.731 + 0.41), smoothstep(0.68, 0.86, triP.y));
  float triEdge = 0.5 * pow(triEnvSin, triEnvExp) - abs(triP.x); // 去心形凹口（triRand 保留双参签名沿家族契约——骤尖收口仍逐叶）
  return clamp(triEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/叶脉三件/腺点——叶团乘子 0.94+0.12×triClump 均值化 = 1.0 消去，值噪声
 *  均值 0.5 精确保均；flush 在 HEAD 三档同体——冠级点缀信号档间一致）。 */
const TRIADICA_LEAF_HEAD = /* glsl */ `
// triadica:leaf —— SDF 菱形全缘叶覆盖 + 逐叶变奏 + 新叶铜红 flush + 冠内层次（<color_fragment> 不触碰）
float triAlpha = triLeafAlpha(vUv, vLeafRand);
diffuseColor.a = triAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷中绿 ↔ 暖黄绿——Spec §5 中绿-深绿 + §6 变体读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 triHue = mix(vec3(0.94, 1.00, 1.05), vec3(1.07, 1.04, 0.90), fract(vLeafRand * 6.317 + 0.37));
float triLuma = 0.92 + 0.16 * fract(vLeafRand * 4.117 + 0.43);
// 新叶铜红 flush（生长季冠内零星红梢——三照片源 Inferred；低优先变奏 ≈5.5% 叶域，非身份主信号；
// 叶位语义缺失——统计近似全域散布，缺口候选⑥；三档同体：冠级点缀信号档间一致）
float triFlush = step(0.945, fract(vLeafRand * 9.417 + 0.71));
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.80, 0.60, 0.34), triFlush);
`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const TRIADICA_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.85m ≈ 团块 1/8–1/12 冠幅——中细质轻盈叶幕 Spec §3 Inferred [7]；
// 采样偏移与七先例去相关）
float triClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.57, vTreePos.y - vTreePos.z * 0.61) * 1.12 + vec2(37.9, 23.3));
`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const TRIADICA_LEAF_SHADE = /* glsl */ `
float triShade = clamp((vTreePos.y - 2.2) / 2.6, 0.0, 1.0); // 冠基 ≈2.2m（净干占比 0.15–0.30 终审 ④ × 树高 9.5m 取中——工程锚记档，几何 slot-0 未落盘）`;

/** High 专属：叶脉三件（中脉亮带 / 两出基脉对 / 侧脉脊族）+ 柄顶腺体对因子，纯 ALU 零采样 */
const TRIADICA_LEAF_VEIN = /* glsl */ `
// 叶脉（羽状 + 基部两出——掌状-羽状过渡）：中脉两面微凸亮带（FRPS Verified [1]，平顶加宽先例口径）
// + 基部长两出侧脉对（leaf-c「基部两出侧脉」[7]——起点 v0 随心形度下移 mix(0.15,0.06)：心形叶两出脉
// 更贴基 = 掌状-羽状过渡读向；离基渐显斜升外展、中带前内收渐隐不达缘「离缘 2-5 毫米弯拱网结」[1]）
// + 侧脉 6–10 对纤细斜升（「侧脉6-10对，纤细，斜上升」FRPS Verified [1]——sin 脊族 pow^8 纤细、
// 逐叶频 66–78 → 卡面 7–8 对中段统计）；**脉色偏黄显著**（NC "Conspicuous yellow veins" [5]——身份点）
// 浅黄绿亮带（R 强抬 B 压低 = 黄绿亮于叶面，两面同显 "on both sides"）；纯 ALU 零采样。
// 柄顶腺体对（大戟科身份，材质层唯一承载）：叶基-叶柄交接处一对黄绿腺点（±0.028, 0.055）——
// 毫米级近景 1–2m 可辨、中距亚像素自然消失（生产口径——High 专属与叶脉同档取舍）
vec2 triP = vec2(vUv.x - 0.5, vUv.y);
float triVeinMid = 1.0 - smoothstep(0.012, 0.040, abs(triP.x)); // 中脉带（平顶加宽——先例口径）
float triCordVein = triCordOf(vLeafRand);
float triBasalV0 = mix(0.15, 0.06, triCordVein); // 两出脉起点（心形联动下移）
float triBasalPath = 0.44 * pow(max(triP.y - triBasalV0, 0.0), 0.62) * (1.0 - 0.42 * triP.y); // 两出轨迹：斜升外展、先端前内收（弯拱读向）
float triVeinBasal = (1.0 - triVeinMid)
  * (1.0 - smoothstep(0.012, 0.044, abs(abs(triP.x) - triBasalPath))) // 两侧对称一对（±|x| 距离场）
  * smoothstep(triBasalV0 + 0.02, triBasalV0 + 0.10, triP.y) * (1.0 - smoothstep(0.46, 0.62, triP.y)); // 离基渐显、中带前渐隐（不达缘）
float triVeinFreq = 66.0 + 12.0 * fract(vLeafRand * 4.317 + 0.63); // 侧脉频逐叶 66–78 → 7–8 对（6–10 对 Verified 域内中段）
float triVeinLat = pow(max(0.0, sin(triP.y * triVeinFreq - abs(triP.x) * 34.0 + (vLeafRand - 0.5) * 0.8)), 8.0)
  * (1.0 - triVeinMid) * smoothstep(0.16, 0.28, triP.y) * (1.0 - smoothstep(0.70, 0.86, triP.y)); // 侧脉脊族（-|x|·34 斜升倾斜；避开两出脉区自 0.16 起）
float triGland = 1.0 - smoothstep(0.012, 0.030, length(vec2(abs(triP.x) - 0.028, (triP.y - 0.055) * 1.15))); // 柄顶腺体对（±一对）
`;

/** High 专属：合成（叶团乘子 + 黄绿脉调制 + 腺点亮腺点） */
const TRIADICA_LEAF_MUL_HIGH = /* glsl */ `
vec3 triMul = triHue * triLuma * (0.80 + 0.20 * triShade) * (0.94 + 0.12 * triClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
triMul = mix(triMul, triMul * vec3(1.66, 1.44, 0.86), triVeinMid * 1.00 + triVeinBasal * 0.62 + triVeinLat * 0.42); // 脉色偏黄显著（NC Conspicuous yellow veins——身份点；两出对 0.62 次强层、侧脉 0.42 纤细弱层）
triMul *= mix(vec3(1.0), vec3(1.85, 1.60, 0.42), triGland * 0.9); // 柄顶腺体对黄绿亮腺点（大戟科身份——材质层唯一承载）
diffuseColor.rgb *= triMul;
`;

/** Mid/Low：合成（去叶团/叶脉/腺点项——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const TRIADICA_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 triMul = triHue * triLuma * (0.80 + 0.20 * triShade); // Mid/Low：叶团乘子均值化消去（T011.7）
diffuseColor.rgb *= triMul;
`;

/** 叶背稍浅淡绿（三档共用，纯 ALU 零采样零分支） */
const TRIADICA_LEAF_BACK = /* glsl */ `
// 叶背稍浅淡绿（NC "lighter underside" / wiki "slightly paler beneath" Verified [5][6]——非粉绿级弱色差）：
// gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，背面法线由 three 双面光照自动翻转，
// 此处只调固有色）——背面 R/G 主导提亮 B 微抬（浅淡绿暖读向**无粉感**、幅度六树最弱档——两面
// 色差弱不做强双面）；两面糙度差 +0.05（「各部均无毛」FRPS Verified [1]——最小差，见
// roughnessmap 注入）；纯 ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.06, 1.08, 1.02), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  中等偏上版：纸质薄菱叶透风透光（「纸质」FRPS Verified [1]——薄叶透光好于栾复叶卡/悬厚叶）。 */
const TRIADICA_LEAF_TRANSLUCENCY = /* glsl */ `
// triadica:leaf —— 背光透射（中等偏上）：视线与阳光反向时叶背透亮黄绿（叶绿素吸收红蓝 →
// 透射偏黄绿；纸质薄菱叶——峰值 0.33 家族链：悬厚叶 0.28 < 栾 0.32 < 乌桕 0.33 < 银杏
// 纸质薄叶 0.34，Spec §2「纸质」Verified [1]）
#if NUM_DIR_LIGHTS > 0
  float triBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float triTransVar = 0.55 + 0.45 * fract(vLeafRand * 7.613 + 0.51); // 逐叶透光强度变奏
  outgoingLight += vec3(0.55, 0.91, 0.34) * directionalLights[0].color
    * pow(triBack, 3.0) * triTransVar * triAlpha * 0.33;
#endif
`;

// ── 组 0（皮+果）配方主体（<map_fragment> 后注入；uv 域身份分支 3.5）────────────────

/** 皮域：裂线游走 + 窄脊沟剖面 + 上部门控（三档共用——Low 保留面的唯一采样：裂线游走） */
const TRIADICA_BARK_RIDGE = /* glsl */ `
float triBarkWarp = facVnoise(vec2(vUv.x * 2.0, vUv.y * 1.0) + vec2(15.7, 8.3)); // 裂线游走（低频缓走——纵向连续窄裂，樟同族更缓）
float triBarkTri = abs(fract(vUv.x * 11.0 + triBarkWarp * 0.70) * 2.0 - 1.0); // 整数脊数 → u 缝相位连续（11 窄脊——vs 樟 7 宽脊/朴 9：窄脊族）
triBarkSmooth = smoothstep(2.6, 5.0, vTreePos.y); // 干上部弱化门控（冠基 2.2m 上方渐入——9.5m 树工程锚；赋值域变量——domainVars 预声明，roughness 注入跨 include 消费）
float triBarkRidge = mix(0.60 + 0.40 * triBarkTri * triBarkTri, 0.90 + 0.10 * triBarkTri * triBarkTri, triBarkSmooth); // 沟浅-中剖面（bark-b 相——vs 樟 0.50 深/朴 0.76 浅）+ 上部弱化
`;

/** 干基暗化（High/Mid 共用——低调项：老干暗灰深裂带读向，Low 随段去） */
const TRIADICA_BARK_BASEDARK = /* glsl */ `
float triBarkBase = 1.0 - smoothstep(0.6, 2.4, vTreePos.y); // 干基暗带门控（低调 ×0.7）
`;

/** 翘皮碎斑场（High/Mid 共用——身份核心后半：窄竖条族 × 翘皮域场，1× vnoise） */
const TRIADICA_BARK_CURL = /* glsl */ `
// 窄条翘皮碎斑（NC "peel off in vertical, narrow strips" Verified [5]——vs 悬铃木大片地图拼贴：条状窄、竖向、碎）：
// 翘皮域场 (3.4,7.5) = u 低频局部域 × v 高频碎段（条短碎读向）；窄竖条族 14 条/周（游走调制防阵列读向）
float triCurlField = facVnoise(vec2(vUv.x * 3.4 + 21.0, vUv.y * 7.5 + 13.0));
float triCurlTri = abs(fract(vUv.x * 14.0 + triBarkWarp * 0.50) * 2.0 - 1.0); // 窄竖条相位（tri=1 条心）
triCurlCore = smoothstep(0.60, 0.75, triCurlTri) * smoothstep(0.52, 0.72, triCurlField); // 条核窗（窄条面 ≈1/3 相位宽）× 局部域门控（赋值域变量——domainVars 预声明，块内不重声明防遮蔽）
`;

/** 条界翘缝暗（High 专属——近景浮雕读向：条缘翘起缝阴影，Mid 随段去） */
const TRIADICA_BARK_CRACK = /* glsl */ `
float triCurlCrack = smoothstep(0.10, 0.28, triCurlTri) * (1.0 - smoothstep(0.28, 0.48, triCurlTri)) * smoothstep(0.46, 0.66, triCurlField); // 条界翘缝带（tri≈0.28 峰——条间边界暗缝）
`;

/** High：合成（竖条冷暖 + 沟内冷灰 AO + 翘条亮面 + 条界翘缝暗 + 干基暗化 + 上部灰绿收敛） */
const TRIADICA_BARK_MUL = /* glsl */ `
vec3 triBarkMul = triBarkRidge * mix(vec3(0.92, 0.92, 0.96), vec3(1.05, 1.01, 0.93), triCurlField); // 竖条冷暖微变（翘皮域场复用——条状明暗分层）
triBarkMul *= mix(vec3(0.86, 0.85, 0.92), vec3(1.03, 1.01, 0.95), smoothstep(0.25, 0.75, triBarkTri)); // 沟内冷灰 AO（沟暗脊浅灰——纵裂两带分化）
triBarkMul *= mix(vec3(1.0), vec3(1.13, 1.11, 1.05), triCurlCore * 0.65); // 翘条面亮（窄条翘起浅灰亮缘——bark-c 竖向棱脊读向）
triBarkMul *= mix(vec3(1.0), vec3(0.72, 0.70, 0.68), triCurlCrack * 0.75); // 条界翘缝暗（碎斑边界阴影——贴片感）
triBarkMul *= mix(vec3(1.0), vec3(0.88, 0.87, 0.88), triBarkBase * 0.7); // 干基暗化微渐变（老干暗灰深裂带——低调）
triBarkMul = mix(triBarkMul, vec3(0.94, 1.02, 0.88) * (0.92 + 0.08 * triBarkWarp), triBarkSmooth * 0.8); // 上部小枝灰绿收敛（亮绿小枝——大戟科近景点；浅色皮孔点不做记档）
diffuseColor.rgb *= triBarkMul;
`;

/** Mid：合成（去条界翘缝——近景浮雕读向；脊沟/翘条亮面/干基暗化/上部灰绿保留） */
const TRIADICA_BARK_MUL_MID = /* glsl */ `
vec3 triBarkMul = triBarkRidge * mix(vec3(0.92, 0.92, 0.96), vec3(1.05, 1.01, 0.93), triCurlField);
triBarkMul *= mix(vec3(0.86, 0.85, 0.92), vec3(1.03, 1.01, 0.95), smoothstep(0.25, 0.75, triBarkTri)); // 沟内冷灰 AO
triBarkMul *= mix(vec3(1.0), vec3(1.13, 1.11, 1.05), triCurlCore * 0.65); // 翘条面亮保留（中距碎亮斑身份）
triBarkMul *= mix(vec3(1.0), vec3(0.88, 0.87, 0.88), triBarkBase * 0.7); // 干基暗化保留
triBarkMul = mix(triBarkMul, vec3(0.94, 1.02, 0.88) * (0.92 + 0.08 * triBarkWarp), triBarkSmooth * 0.8); // 上部灰绿收敛
diffuseColor.rgb *= triBarkMul;
`;

/** Low：合成（去翘皮碎斑/干基暗化——远距亚像素/低调项；脊沟 + 沟内 AO + 上部灰绿保留） */
const TRIADICA_BARK_MUL_LOW = /* glsl */ `
vec3 triBarkMul = triBarkRidge * mix(vec3(0.86, 0.85, 0.92), vec3(1.03, 1.01, 0.95), smoothstep(0.25, 0.75, triBarkTri)); // 脊沟 + 沟内 AO（远距「暗灰窄纵裂剪影」保留面）
triBarkMul = mix(triBarkMul, vec3(0.94, 1.02, 0.88) * (0.92 + 0.08 * triBarkWarp), triBarkSmooth * 0.8); // 上部灰绿（结构剪影项三档保留）
diffuseColor.rgb *= triBarkMul;
`;

/** 果域体（三档共用——夏季相绿闭蒴果：中绿带黄两端 per-果变奏，实体无裁切） */
const TRIADICA_FRUIT_BODY = /* glsl */ `
  // 果域（v∈[4,5]）：夏季相绿闭蒴果（果-c「中绿带黄」+ form-b「绿果挂梢端」三源 [7]——
  // 白蜡爆米花相属夏末起-冬相不建模记档）；u = 逐果随机（几何冻结接口）；
  // 宿存柱头暗点记档不做（果卡局部 uv 未冻结——接口只冻结 v 域，柱头点位无锚）
  diffuseColor.rgb = mix(vec3(0.56, 0.66, 0.28), vec3(0.66, 0.74, 0.36), fract(vUv.x * 13.7 + 0.35));
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 菱形全缘叶 alphaTest 裁切 + 黄绿脉三件/柄顶腺体对（High）+
 * 两面弱区分 + 中等偏上透光 + 新叶 flush + 逐叶变奏 + 风动。level 分档（T011.7，
 * 缺省 'high'）：Mid 去叶脉三件/腺点/叶团 + 糙度叶团项（Spec §7 叶脉与腺体仅近距可辨
 * ——「近景 1–2m 可辨、中距自然消失」生产口径；SDF 全形含心形凹口保留——档间剪影
 * 一致），透光/叶背/hue·luma/flush/shade/两面糙度差保留；Low 换
 * TRIADICA_LEAF_SDF_LOW（去心形凹口——近景基形变奏细化；包络/骤尖收口与 High 逐字
 * 同源）+ 去透光，片元零噪声采样。风动三档同源不动（TRIADICA_WIND 同一常量——档间
 * 风相位一致 = 身份一致）。
 * 底参：中绿-深绿 #507c34（工程设定——NC "medium to dark green" [5] + 照片六源
 * medium green glossy [7] 交叉；八树亮度链：银杏 > 朴 > 悬 > 栾 > **乌桕** > 夏栎 >
 * 榉 > 樟——中绿-深绿档）/ m 0 / r 0.58（光泽中档——纸质非革质：樟 0.50 革质 <
 * 0.58 < 榉 0.62）/ DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createTriadicaLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x507c34, // 中绿-深绿（工程设定：NC medium to dark green [5] + 照片 medium green glossy [7] 交叉——八树链中绿-深绿档；中距色块与栾中绿/夏栎深绿相邻档区分）
    metalness: 0,
    roughness: 0.58, // 光泽中档（纸质非革质——「纸质」FRPS Verified [1]；gloss 低于香樟 0.50 革质口径一档）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? TRIADICA_LEAF_SDF_LOW : TRIADICA_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含心形凹口）
  const leafBody = level === 'high'
    ? TRIADICA_LEAF_HEAD + TRIADICA_LEAF_CLUMP + TRIADICA_LEAF_SHADE + TRIADICA_LEAF_VEIN + TRIADICA_LEAF_MUL_HIGH + TRIADICA_LEAF_BACK
    : TRIADICA_LEAF_HEAD + TRIADICA_LEAF_SHADE + TRIADICA_LEAF_MUL_SIMPLE + TRIADICA_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (triClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.05, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.05, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面糙度差保留——各部无毛最小差）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${TRIADICA_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${TRIADICA_WIND}`,
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
        `${TRIADICA_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `triadica:leaf${levelKeySuffix(level)}`;
  return material;
}

/**
 * 组 0 材质（皮+果一材质两域，uv 域身份分支 3.5）：皮域 = 第 7 树皮语言「暗灰-灰褐
 * 窄纵裂 + 窄条翘皮碎斑」（裂线游走 + 11 窄脊浅-中沟 + 沟内冷灰 AO + 翘条碎斑亮面/
 * 条界翘缝暗（High）+ 干基暗化 + 上部灰绿收敛）；果域 v∈[4,5] = 绿闭蒴果中绿带黄
 * 两端变奏（光泽微高）。level 分档（T011.7，缺省 'high'）：Mid 去条界翘缝暗（近景
 * 浮雕读向），脊沟/翘条亮面/干基暗化/果域全保留——中距「暗灰窄纵裂 + 碎亮斑 + 冠缘
 * 绿果」身份；Low 再去翘皮碎斑/干基暗化（远距亚像素/低调项），脊沟 + 上部灰绿 + 果
 * 域保留（远距「暗灰纵裂剪影」保留面），1× vnoise。风动 = 整树缓摆与叶同公式同相位
 * （aBend 恒 0 快颤层天然不作用——果序刚性摆动未表达归缺口候选④同族议题）。
 * 底参：暗灰-灰褐主调 #6f6a62（工程设定——FRPS「暗灰色」+ bark-c「暗灰褐」[7] 交叉；
 * 八树亮度链暗色族：樟 < **乌桕** < 榉 < 悬 < 栾）/ m 0 / r 0.92（纵裂族高糙哑光）/
 * FrontSide（皮管/果球闭合实体——无裁切无 alphaTest）。
 */
export function createTriadicaBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x6f6a62, // 暗灰-灰褐（工程设定：FRPS 暗灰 [1] + bark-c 暗灰褐 [7] 交叉——暗色族；R−G=5 微暖灰褐向）
    metalness: 0,
    roughness: 0.92, // 纵裂族高糙哑光（vs 悬光滑 0.86/栾粉质 0.87）
    side: THREE.FrontSide, // 皮管/果球闭合实体（无花卡类裁切需求——vs 栾 DoubleSide 三域取舍）
  });
  material.defines = { USE_UV: '' }; // 两域分支 = uv 域身份标记（皮圆柱 / 果球）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'low'
    ? TRIADICA_BARK_RIDGE + TRIADICA_BARK_MUL_LOW
    : level === 'mid'
      ? TRIADICA_BARK_RIDGE + TRIADICA_BARK_BASEDARK + TRIADICA_BARK_CURL + TRIADICA_BARK_MUL_MID
      : TRIADICA_BARK_RIDGE + TRIADICA_BARK_BASEDARK + TRIADICA_BARK_CURL + TRIADICA_BARK_CRACK + TRIADICA_BARK_MUL;
  // 跨 include 域变量预声明（roughnessmap 注入在 main 顶层消费 triBarkSmooth/triCurlCore——map 注入的
  // if/else 块内声明在该注入点作用域已关闭〔Step 4 浏览器实证编译错误，2026-09-21〕；块内改纯赋值防
  // 遮蔽。三档统一声明：Low 的 RIDGE 段仍赋值 triBarkSmooth，未消费的预声明无害）
  const domainVars = 'float triBarkSmooth = 0.0; float triCurlCore = 0.0; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明）\n';
  const body = /* glsl */ `
// triadica:bark —— 组 0 两域分支（皮 v<3.5 / 绿闭果 v∈[4,5]——uv 域身份标记，几何侧冻结契约；
// 阈值 3.5 = 果域 4.0 下探 0.5 隔离带，koelreuteria 4.5/6.0 三重隔离同款纪律）
${domainVars}if (vUv.y >= 3.5) {
${TRIADICA_FRUIT_BODY}
} else {
${barkBody}
}`;
  const barkRoughness = level === 'high'
    ? `if (vUv.y >= 3.5) { roughnessFactor = 0.62; } // 果域光泽微高（中绿带黄微亮——vs 皮高糙哑光）
else { roughnessFactor = clamp(0.92 - triCurlCore * 0.06 - triBarkSmooth * 0.12, 0.05, 1.0); } // 翘条面微泽 + 上部绿枝微光`
    : level === 'mid'
      ? `if (vUv.y >= 3.5) { roughnessFactor = 0.62; }
else { roughnessFactor = clamp(0.92 - triCurlCore * 0.06 - triBarkSmooth * 0.12, 0.05, 1.0); } // Mid：翘条面/上部项保留（翘缝项随段去）`
      : `if (vUv.y >= 3.5) { roughnessFactor = 0.62; } // Low：果域光泽保留（远距果色读向）
else { roughnessFactor = 0.92; } // Low：纵裂高糙哑光基底（翘条/上部项随段去）`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${TRIADICA_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${TRIADICA_WIND}`,
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
${body}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${barkRoughness}`,
    );
  };
  material.customProgramCacheKey = () => `triadica:bark${levelKeySuffix(level)}`;
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（同源全形
 * 含心形凹口——档间剪影一致）；Low = TRIADICA_LEAF_SDF_LOW（表面/影档内一致——去凹
 * 口版）。**深度片元不挂噪声库**——SDF 零 facVnoise 引用（包络/凹口全 ALU——樟全缘
 * 先例；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 组 0 守卫：皮/果域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质时
 * 组 0 不被叶形 SDF 误裁（果域无需 v 路由——rand=0 即守卫，platanus 恒等 attribute
 * 先例）。风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap
 * 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap 按主
 * 材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createTriadicaLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  const leafSdf = level === 'low' ? TRIADICA_LEAF_SDF_LOW : TRIADICA_LEAF_SDF; // Mid 深度 = High SDF（同源全形含心形凹口）
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
diffuseColor.a = mix(1.0, triLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱/果球 uv 域不误裁）`,
    );
  };
  material.customProgramCacheKey = () => `triadica:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
