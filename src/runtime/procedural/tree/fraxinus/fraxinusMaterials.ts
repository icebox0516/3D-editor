/**
 * runtime/procedural/tree/fraxinus/fraxinusMaterials —— 白蜡树（Fraxinus
 * chinensis subsp. chinensis，asset_tree_fraxinus）叶/皮（含匙形翅果域）/叶影
 * 深度材质（T011.10，阔叶族第十一材质实例——**一回奇数羽状复叶 SDF 对生严格变体
 * （窗列相位对生化 + 顶生近等大 + 裸轴更长 + 缘齿载波回归）+ 树皮第 11 语言 +
 * 匙形翅果域**）。
 *
 * 职责：复制十先例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce
 * 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 * <color_fragment> 绝不触碰），物种配方按白蜡树自己的 Reference Spec 换装——
 * Spec docs/research/fraxinus-reference.md **1.0**（任务书锚点 1.0，开工前已校验
 * 一致；生产一律以文末「终审记档」③ 裁决八项为唯一事实源：①种定名 subsp.
 * chinensis 本尊〔「白蜡」命源 = 白蜡虫非叶色——叶背不做蜡白过度引申〕；②树高
 * 锚 slot-0 ≈10m / 生产域 8–12m / 冠幅比 0.7–1.0；③花不做（无花冠最弱信号——
 * 四信号承托已足）；④**翅果做**（匙形单翅果家族独有 + 7–9 盛挂宿存至冬 + 满冠
 * 帘幕显著 + 覆盖 9–10 月主语境）；⑤翅果主域 3–4cm × 4–6mm 匙形 + 簇帘幕密度
 * 高于国槐念珠；⑥树皮第 11 语言定稿（见下）；⑦冠幅比 0.7–1.0 维持；⑧对生结构
 * 双级化〔复叶对生 + 小叶对生 + 对生芽序三重对生——vs 国槐互生螺旋对照轴〕+
 * 缘整齐锐锯齿〔vs 国槐全缘——复叶系缘齿对照轴：载波回归〕）。
 *
 * 【与几何侧的冻结接口（主代理简报冻结，不得偏离）】
 *   - 三工厂签名与 sophora/koelreuteria/triadica/bischofia 同构：(level:
 *     ProceduralLevel = 'high') => THREE.MeshStandardMaterial / MeshDepthMaterial；
 *     每次调用全部 new（D17）。**三工厂 = 叶 / 皮（含果域）/ 叶影深度**——翅果按
 *     冻结接口归组 0（「翅果：组 0 内、uv 果域标记 v∈[4,5]，triadica 先例」），
 *     材质数组序 [皮, 叶]；9 程序键 = 3 工厂 × 3 档（brief「bark/leaf/fruit 三
 *     工厂」为三视觉域口径——fruit 域由组 0 皮材质 v 路由承载，第三工厂为深度
 *     材质，记档——sophora 同款解释）。
 *   - 复叶卡：v=0 复叶基部（**裸轴段更长——bare 段占比 ≈0.28–0.35**，白蜡叶柄
 *     4–6cm/复叶 15–25cm）→ v=1 顶端（顶生小叶）；u=0.5 叶轴中轴；**宽/长比
 *     0.36 冻结**（卡空间半宽 0.18）；1 卡 = 整枚一回奇数羽状复叶（几何 2 tri）。
 *     组 1 aLeafRand ∈ (0,1] 同卡同值、aBend 卡根≈0 尖大。
 *   - 果域（组 0 内）：uv v∈[4,5]（triadica 先例——材质域判据阈值 3.5 = 果域
 *     4.0 下探 0.5 隔离带，皮弧长域 ≤≈2.9 三重隔离同款纪律）；u 自由 = 逐果随机；
 *     扁平 quad 面片果（几何侧——双面渲染由几何侧双 tri 承担，缺口候选③），
 *     材质给色序 + 边缘微暗线（桨形轮廓读向）+ 微透亮；组 0 aLeafRand/aBend
 *     恒 0（果簇刚性——下垂摆动未表达归缺口候选④）。
 *
 * 【一回奇数羽状复叶 SDF——011.9 单级窗列路径的对生严格变体（同型不同数值，
 *   复叶系对照轴的材质侧证据）】沿 sophora「单级窗列 + 顶生独立窗」结构，四处
 *   物种差分（每处 = 与国槐的直接对照——两树互为同型不同数值样本）：
 *   ① 卡空间折算：x = (u−0.5)·0.36（长 1 单位、半宽 0.18——宽/长比 0.36 冻结
 *      接口）；y = v（0 复叶基 → 1 顶端）。
 *   ② 全叶包络：0.166·sin(π·v^0.92)^mix(0.90,1.24,ss)——椭圆整体剪影（峰
 *      v≈0.52 近中 = 中位小叶最大；峰值 0.166 + 齿峰 0.011 = 0.177 在卡缘 0.18
 *      内侧——卡缘恒裁 JS 锚）。
 *   ③ 小叶窗列（对生**严格**——裁决 8 / leaf-b/c 照片双问）：yb = y − 0.285 −
 *      max(sign(x),0)·space·0.05——右列降 0.05·space 极小抖动（vs 国槐近对生
 *      0.18·space 降列——对生严格 = 相位差压缩到 5%：跨轴带峰错位 ≤0.012，JS
 *      锚）；间距 space = 0.150+0.075·rand ∈ [0.150,0.225] → 有效带数 **2–3
 *      对**（JS run 计数锚——「小叶5-7枚」= 2–3 对 + 顶生的统计实现；vs 国槐
 *      4–7 对——计数少而整齐）；带列自 v=0.285 起排 = **裸轴段更长**（bare 占比
 *      ≈0.29 ∈ 0.28–0.35 冻结接口域——白蜡叶柄 4–6cm/复叶 15–25cm；vs 国槐
 *      0.130 起排）。
 *   ④ 小叶场：长 len = clamp(0.92·env, 0.055, 0.170)（行包络锚定）；卵形-
 *      披针形包络 sin(π·t^0.80)^mix(1.06, 2.50–3.30, ss)（基 1.06 钝圆/楔形宽
 *      开张〔「基部钝圆或楔形」Verified〕→ 先端 2.50–3.30 锐尖至渐尖强收口
 *      〔「先端锐尖至渐尖」Verified〕）；半宽 hw = len·(0.17+0.12·rand)（小叶
 *      长宽比 1.72–2.94 ∈ 1.5–3.0 Verified 域——JS 锚）；**零偏斜**（FRPS 小叶
 *      描述无偏斜句——vs 国槐「稍偏斜」±0.45：对生严格 + 无偏斜 = 更整齐读向，
 *      两树材质侧对照记档）；**缘整齐锐锯齿载波回归**（裁决 8——「叶缘具整齐
 *      锯齿」FRPS Verified + subsp. chinensis "margin distinctly serrate"：
 *      2π·9 = 56.55 同频 9 齿/小叶轴 pow 2.4 锐齿〔zelkova 011.3 锐齿载波先例
 *      同法〕——「整齐」= 规则单频载波零抖动噪声〔vs 朴树齿抖动噪声——ALU 化
 *      保深度零噪声〕；幅度 ±0.011 = 坡宽 0.02 的 55%；端部渐隐门控）。
 *   ⑤ 顶生小叶独立窗位（「奇数」的表达）：v∈[0.795, ~0.97] 中轴竖直叶场——
 *      lenT = 0.155+0.020·rand = 中位侧生 len 0.153 的 **1.01–1.14×**（「顶生
 *      小叶与侧生小叶近等大或稍大」FRPS 原句——vs 国槐顶生窗更大：两树窗列
 *      数值对照即复叶系同型对照轴的材质侧证据）；同型包络 + 同型齿载波；带列
 *      经顶栏门控在 0.70–0.74 终止 → 顶端只见一枚顶生小叶；JS 锚：顶生带横向
 *      reach ≥ 0.030（明确宽于叶轴）。
 *   ⑥ 裸轴基段与顶栏双**减法门控**（011.8 教训强制——乘法门控负距离 ×0 被钳
 *      恰 0 → alpha 恰 0.5 恰过 alphaTest 的伪覆盖；sophora 双减法形态沿承）：
 *      col − (1−ss(0.24,0.285,y))·0.10（裸轴段 = 裸叶柄+叶轴更长——band −1
 *      幻影带压灭）− ss(0.70,0.74,y)·0.10（顶栏 = 顶生小叶下方窗列终止——
 *      space 上限时 band 2 半灭/压灭 → 2–3 对门控的另一半）。JS 锚：裸区
 *      |x|>0.03 命中数 = 0 + 顶栏以上残余 W ≤ 0.055。
 *   ⑦ 叶轴 rachis：0.0045+0.0055·(1−y) 渐细——**无基部膨大带**（「叶柄基部
 *      不增厚」FRPS Verified——vs 国槐「叶柄基部膨大，包裹着芽」藏芽膨大带：
 *      两树叶柄基对照点）；「叶轴挺直」恒直。JS 锚 x=0 处 alpha ≥0.5 全 v 连续。
 *   合成：edge = max(叶轴, max(min(包络, 窗列), 顶生窗))——叶轴恒连、窗列在包
 *   络内开窗（齿载波在窗列内——包络约束整叶剪影，齿被包络削平的最宽行不外溢
 *   卡缘）、顶生窗自界。全 ALU 零噪声（floor/fract/pow/cos——**cos 为齿载波
 *   专用**，深度材质同源不挂噪声库的前提不变〔zelkova 齿载波 + 深度零噪声
 *   组合先例〕）。
 *   ⑧ FXC 预防（011.6 ⑨ / 011.8 ⑦ 前置）：窗列 + 小叶场封装子函数
 *      frxColumn(...)（单返回零 out 参）、顶生窗封装 frxTerminal(...)（同款）、
 *      frxLeafAlpha 主函数体最小化；小叶脉装饰层经共享变量段 FRX_LEAFLET_VARS
 *      与 SDF 同源折算（koe/sophora 同款纪律）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - 小叶脉（High，FRPS Verified 原句「中脉在上面平坦，侧脉8-10对，下面凸起，
 *     细脉在两面凸起，明显网结」——三层）：每小叶中脉亮带（沿小叶轴、先端渐隐）
 *     权重 0.24 + 侧脉斜升细脊（sin pow^7 纤细不达缘）0.11——**载波与齿同频
 *     56.55**（侧脉 8–10 对 × 每齿一脉的达缘入齿统计读向——zelkova「脉端直达
 *     齿尖」同法；非逐齿相位锁定记档）+ 细脉网结弱表达（双 sin 交织细纹 0.06
 *     ——「明显网结」的弱层，中距不承重）+ 顶生小叶竖直中脉。
 *   - **两面色差 = 弱档**（裁决 1 / §5——上面中绿-亮绿、下面浅绿-灰绿，照片级
 *     Inferred〔志书仅毛被句无「下面灰白色」显式原句〕；「白蜡」命源已裁定为
 *     白蜡虫非叶色——叶背不做蜡白过度引申）：底色 #548840（工程设定——十树
 *     亮度链栾 < **白蜡** ≈ 国槐邻档 < …中绿档）；背面 ×(1.09, 1.11, 1.17)
 *     （B 抬升灰向但幅度低于国槐 glaucous 加重档 ×(1.16,1.18,1.28)——弱档：
 *     介于榉无粉 ×(1.10,1.12,1.04) 与栾柔毛灰绿 ×(1.09,1.10,1.13) 之间偏灰
 *     向）；两面糙度差 +0.05（弱于国槐 +0.06）。
 *   - roughness 0.68（「硬纸质」FRPS Verified——悬厚实 0.66 < 国槐纸质 0.67 <
 *     **白蜡硬纸质 0.68** < 栾/重阳木 0.70）。
 *   - 背光透射 0.318（家族值域内取——硬纸质透光微逊纸质端：悬 0.28 < 朴 0.30 <
 *     重阳木 0.31 < **白蜡 0.318** < 栾 0.32 < 国槐 0.325 < 乌桕 0.33 < 银杏
 *     0.34；恢复会话重验注释修正：中断落盘留「栾 0.32 < 白蜡 0.318? 不——」
 *     自我纠错残段——0.318 < 0.32 实际位于栾之下国槐之上的整理；工程设定）+
 *     透射色 (0.54, 0.90, 0.36) 灰绿黄基调；逐叶变奏 ∈[0.55, 1.0]。
 *   - 逐叶变奏 aLeafRand 多通道复用：色相两端冷中绿↔暖黄绿（通道摆幅 ≤15%
 *     纪律）+ 明度 ±8%（去相关取样）+ 带间距 + 先端指数 + 半宽比 + 齿相位 +
 *     透光变奏（统计近似是家族契约下的最大表达，缺口候选①）。
 *   - **中距单叶自检剖面（细碎域——对生羽叶层叠）**：冠面质感「细碎均质中绿
 *     + airy 开放（空隙 25–40% 中通透）」Spec §3 Inferred——SDF 行宽剖面断言：
 *     maxW 全宽 ∈ 细碎质域 + 中段缢缩行 ≥6 行（W ≤ 0.030——带间仅叶轴可见 =
 *     「细碎」的量化面；带数少于国槐 → 缢缩段更长更疏——两树中距读向互为
 *     同型对照记档）。
 *   - 冠内竖向自遮蔽（冠基 ≈2.8m **工程占位锚**——净干 Unknown〔Spec §A 结构
 *     性缺口〕，8–12m 域取中下；几何 slot-0 未落盘，Stage 实测后同步轮记缺口
 *     候选⑤）+ 中频叶团斑块（High，波长 ≈0.85m ≈ 团块 1/8–1/15 冠幅——对生
 *     羽叶层叠复合质感 Spec §3 Inferred）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage；坡宽 0.02（小叶间隙级——复叶
 *     卡细一档）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值记档）：整树缓摆 ~0.18Hz / 顶部
 *     ~4.2cm（aSeed 相位，hash 常数 93.847/70.913 与十先例〔sway 77.669–88.217
 *     + 91.523 / flutter 49.337–65.443 + 68.137〕去相关——新值域外）+ 复叶卡
 *     快颤 9–15 rad/s（≈1.4–2.4Hz 中频）/ ≤11mm（**11mm 家族档**——整枚羽叶
 *     中等摆锤，与栾/重阳木/国槐同档中幅）；aBend 权重（卡根≈0 尖大）；
 *     **树高锚 10.4973m（×0.09526——slot-0 Stage 实测涌现同步轮，2026-09-22；
 *     011.8 9.896m / 011.9 10.3413m 同款流程）**。
 *
 * 皮（组 0 皮域）配方——**第 11 树皮语言「灰褐浅-中纵裂（无剥落无碎翘）+ 幼干-
 *   大枝近光滑 + 皮孔小不明显」**（裁决 6 定稿；vs 十先例：夏栎/樟/银杏深纵裂
 *   族、朴平滑浅裂、榉光滑暖剥、悬铃木地图剥落三色带、栾浅色光滑+密麻点醒目、
 *   乌桕暗灰窄裂碎翘、重阳木褐宽脊扭转、国槐板状厚脊+瘤突）。分化点：①**脊浅
 *   沟浅**（8 细脊/周〔vs 国槐 6 板状粗犷——细一档〕+ 浅宽坡剖面 smoothstep
 *   (0.26,0.56)〔vs 国槐窄深沟 0.16–0.42〕+ 沟深剖面 0.68〔vs 国槐 0.52/重阳
 *   木 0.54——浅档，脊沟对比 0.32〕）；②**龄级序列浅档**（幼干-大枝近光滑 →
 *   中龄浅-中脊沟 → 老干渐深：上部弱化门控 smoothstep(3.2,5.6) 近光滑〔幼干/
 *   大枝〕+ 沟内弱 AO + 干基暗化弱档〔老干渐深读向〕——沿 sophora 干龄近似但
 *   档位浅）；③**皮孔小不明显**（vs 栾 52×78 格 82% 有孔密麻醒目：30×44 格
 *   26% 有孔〔稀〕+ 小半径〔尺寸小〕+ ×(1.12,1.11,1.08) 弱对比〔不明显〕——
 *   「皮孔小，不明显」FRPS 原句三项落地）；④**小枝黄褐色**（「小枝黄褐色」
 *   FRPS 原句——vs 国槐当年生枝绿色：两树细枝色对照——黄褐收敛 ×(1.16,
 *   1.04,0.76) R 主导褐向）：
 *   - 主调 #7a746b 灰褐（工程设定——FRPS「树皮灰褐色」Verified + bark-a「幼
 *     干光滑浅灰褐-棕褐」/fruit-c「干灰-灰褐浅纵脊沟」照片交叉；R−G=6 灰褐向；
 *     十树链：国槐 #6d675d < **白蜡** < 栾 #90928a——浅国槐一档）。
 *   - 竖向脊沟：裂线游走低频场（1× vnoise 复用为单色微变 ±5%——「灰褐色」
 *     单色系、无剥落无三色带）+ 8 细脊/周浅宽坡剖面 + 沟内弱 AO + 上部弱化
 *     门控（幼干近光滑）+ drift 0.80 纵为主。
 *   - 皮孔场（High 专属近景）：30×44 格 ALU hash 抖动、26% 格有孔（step 0.74
 *     稀疏门——「不明显」的密度侧）、小半径（0.06–0.10 格单位——「小」，恢复会话
 *     重验注释修正：原文档 0.04 与代码 0.06+0.04·fract 不一致）、浅
 *     微亮 ×(1.12,1.11,1.08) 弱对比；域 = 上部幼干大枝带（高位门 + 中低弧长
 *     ——「幼干-大枝近光滑 + 皮孔」合并读向）。
 *   - 干基暗化弱档（家族惯例——×0.91 权重 0.5：老干渐深读向，弱于国槐 ×0.88
 *     权重 0.7）。
 *   - 细枝两档：当年生黄褐收敛 ×(1.16, 1.04, 0.76)（FRPS「小枝黄褐色」原句
 *     ——两树细枝色对照轴：国槐绿 ×(0.86,1.16,0.72) vs 白蜡黄褐 R 主导）、
 *     老枝灰褐弱收敛 ×(1.02, 1.00, 0.94)。
 *   - 苔藓/地衣不做（flower-b 大枝绿斑低置信不承重——不做不编造，沿先例）；
 *     微起伏已归几何层。
 *
 * 果域（v∈[4,5]，组 0 分支——triadica 先例 + 裁决 4/5）：
 *   - **嫩绿→黄绿→淡褐→淡黄褐四档色序**（§5 照片四点链 fruit-b 嫩绿 5 月 →
 *     fruit-a 黄绿-淡褐 9 月 → fruit-c 黄绿-淡黄绿帘幕 7 月 → twig-a/b 淡黄
 *     褐浅棕宿存 2 月——色序照片级 Verified）：按 u 分档（u = 逐果随机——几何
 *     冻结接口）+ warp 权重倾斜（相位 0 = 正弦导数在中域为负 → 中域密度放大；JS 锚分布
 *     嫩绿 ≈17 / 黄绿 ≈33 / 淡褐 ≈33 / 淡黄褐 ≈17%——9–10 月盛挂混熟读向，黄绿-淡褐
 *     中域 ≈66% 可辨〔fruit-c 双问「醒目」——色档落可辨域〕。恢复会话重验修正：
 *     中断落盘 0.05·sin(2π(u−0.18)) 实测 23/22/33/22% 中域仅 55%，与「主域黄绿-
 *     淡褐」意图不符且头注释锚未经运行验证——幅相改 0.09·sin(2πu) 对齐意图并
 *     锚化实测值）+ 档内 ±5% 变奏。
 *   - **扁平双面感 + 边缘微暗线**（近景身份点——「匙形桨状」轮廓强化）：正背
 *     面一致色（无 gl_FrontFacing 分支——果面片双面渲染归几何侧双 tri〔缺口
 *     候选③〕；双面一致色即「扁平双面读向」的材质侧表达）+ 果面片周缘双轴
 *     微暗线 ×(0.84,0.82,0.80)·0.8（桨形轮廓读向——**果 uv 轴向契约为材质侧
 *     假设**〔几何侧果面片 uv 映射未冻结——双轴保守实现四缘皆暗，错位时降级
 *     为果面边缘纹理，缺口候选③〕）。
 *   - **微透亮感**（fruit-b「嫩绿半透明」/twig-a「backlit 半透明」——High 弱
 *     背光透射 0.16 嫩绿，域门控 v≥3.5）。
 *   - 老熟档淡黄褐 = 宿存端色序上限（裁决 5 主域 3–4cm × 4–6mm 之外的时序档
 *     ——twig-a/b 照片双源）；翅面纸质微光泽 roughness 0.52/0.55/0.58（干翅
 *     非肉质——vs 国槐肉质荚果 0.45 光泽档哑一档）。
 *
 * 深度材质（customDepthMaterial 契约通道——沿 SOP 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5；叶卡 SDF
 *     与叶表面材质共享同一 GLSL 字符串（表面改形深度自动同步，禁复制粘贴）。
 *   - **零噪声库注入**：窗列/小叶场/顶生窗/齿载波全 ALU（cos 为齿载波专用——
 *     ALU 非噪声采样）→ SDF 零 facVnoise 引用 → 深度片元不挂
 *     FACILITY_GLSL_NOISE（樟全缘 + 榉 011.3 齿载波 ALU 组合先例）。保护性
 *     约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 组 0 守卫：皮/果域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本
 *     深度材质时组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例；果域无
 *     需 v 路由——rand=0 即守卫）。
 *   - 档位匹配：Mid = High SDF 同源全形（档间剪影一致——羽状剪影是中距身份，
 *     Spec §7 中距保留面）；Low = SDF_LOW 零窗列零齿版（远距「复叶结构不可
 *     辨」+「齿亚像素」Spec §7 牺牲顺序双首位——**亚像素档 Low 齿消去记档**；
 *     包络/叶轴/裸轴门控与 High 逐字同源）。
 *   - 风动不进 depth pass（静态影取舍，沿先例）。
 *
 * 分档记档（T011.10，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset
 *   build 路由）：
 *   - 叶 Mid：去小叶脉/叶团 + 糙度叶团项（Spec §7 叶脉仅近距可辨；**SDF 全形
 *     含窗列/顶生窗/齿载波保留——档间剪影一致：羽状剪影是中距身份**），透光/
 *     叶背/hue·luma/shade/两面糙度差保留；叶 Low：SDF 换 FRX_LEAF_SDF_LOW（去
 *     窗列+**去齿载波**——复叶细化 + 锯齿亚像素双牺牲；包络/叶轴/裸轴门控逐字
 *     同源）+ 去透光；片元零噪声。
 *   - 皮 Mid：去皮孔点（近景细节层）；脊沟浅档/沟内弱 AO/干基暗化/细枝两档
 *     保留——中距「灰褐浅纵裂 + 冠缘黄褐细枝」身份（Spec §7 中距保留面）；
 *     皮 Low：再去干基暗化/老枝灰褐档（低调项）；脊沟 + 沟内 AO + 当年生黄褐
 *     档保留（远距「浅纵裂剪影」保留面）；1× vnoise。
 *   - 果域：四档同体色序 + 边缘暗线（中距身份信号——帘幕果簇剪影）；翅面光泽
 *     档逐档微升（0.52/0.55/0.58）；微透亮 High 专属。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；fraxinus 前缀不与十先例
 *     混缓存）：'fraxinus:leaf' / ':mid' / ':low'；'fraxinus:bark' …；
 *     'fraxinus:leaf-depth' …（9 键全异）。
 *   - 风动（FRX_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团）= 3× + 单级窗列 SDF ALU（frxColumn+
 *     frxTerminal + 齿载波 ≈ 45 flop ≈ 4.5×——含齿载波的账，与栾两级窗列 4.5×
 *     同档）+ 小叶脉三层 ≈ 2× + 透光/两面/hue ≈ 2× ≈ **11.5×**；叶 Mid ≈ 8×
 *     （0 噪声 + SDF 全形）；叶 Low ≈ 3.5×（单包络）；
 *   - 皮 High 片元（两域取最重路径）= 皮路径 1× vnoise（游走场）= 3× + 脊沟/
 *     皮孔/细枝 ALU ≈ 1.5× ≈ **4.5×** / 果路径纯 ALU ≈ 1.5×——域互斥执行，
 *     最重 ≈ 4.5×；皮 Mid/Low = 1× vnoise ≈ 4.5×；
 *   - 深度片元 = 单级窗列 SDF 纯 ALU ≈ 4.5×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——对生窗列变体/齿
 *   载波/皮孔场/果缘暗线全部限定文件内）：
 *   ① 带间距/先端指数/半宽比/齿相位/透光共用 aLeafRand 单属性统计近似（多通道
 *      复用同一 rand——变奏间相关性无法表达；家族共有缺口）；**小叶独立颤动
 *      不可表达**（整卡同摆——需 per-leaflet 顶点通道；koe ①/重 ③/sophora ①
 *      同型家族缺口）；
 *   ② 一回奇数羽状「单级窗列 + 顶生独立窗」SDF 对生严格变体：本文件内实现
 *      （复叶第三型第二例——011.9 国槐近对生 vs 011.10 白蜡严格对生，相位差
 *      0.18 vs 0.05 同型对照轴闭合）；复叶 SDF 公共模式族级提炼评估归 011.13
 *      （沿 koe ② / 重 ② / sophora ②）；
 *   ③ 翅果面片双面渲染 + 边缘暗线的 uv 轴向契约：果面片双 tri（双面可见）与
 *      匙形轮廓 uv 映射均为几何侧未冻结契约——材质侧边缘暗线取双轴保守实现
 *      （四缘皆暗），错位时降级为果面边缘纹理，不破帘幕剪影；需几何侧果面片
 *      uv 契约冻结（sophora ③ 同型）；
 *   ④ 果序下垂摆动（fruit-a「下垂簇」/twig-a「成簇下垂」读向）组 0 aBend≡0
 *      未表达——附加元素无独立形变通道（恰 2 组冻结的连带限制，koe ③/sophora
 *      ④ 同型）；
 *   ⑤ 冠基 2.8m 材质侧工程锚 + **树高锚 10.4973m 已同步**（slot-0 Stage 实测
 *      2026-09-22 ×0.09526；冠基占位 2.8 vs 实测视觉冠底 2.17 差 0.6m 为弱梯度
 *      低幅项（权重 0.20 渐变带 2.8–5.6），同步编辑归 park-shader-agent；与
 *      profile 侧无联动通道——triadica ⑤/sophora ⑤ 同型家族缺口）；
 *   ⑥ 皮孔/脊沟龄级的干龄判别以「高度 × 弧长 v」双门控近似（皮管 v = 累计
 *      弧长契约注记——细枝管 v 小，bischofia ⑥/sophora ⑥ 同型）；干龄序列浅
 *      档以照片多源中景合并承托（Spec 结构性缺口「主干特写缺失」如实记档——
 *      族门 011.13 横向对照复核）；对生芽序（冬态身份锚）材质侧无表达位（芽
 *      归几何微结构——Spec §7 近距末位，牺牲顺序记档）。
 *
 * X4000 口径（011.6 终裁带入）：console X4000 警告若复现 = FXC 数据流保守误报
 *   预期口径——直接接受记档一次即止，不逐树变体消元追逐（归 011.13 复叶系议
 *   题）；GLSL 全路径初始化运行零错误为准（frxColumn/frxTerminal 单返回零 out
 *   参、全变量单赋值初始化）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；
 *   零贴图/零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV
 *   普通 Mesh 无该属性，WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除
 *   法无 NaN；与十先例的通用段（风动公式等）为复制改造非 import（资产私有，
 *   跨资产不耦合——organization.md 边界）。
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
  if (!source.includes(target)) throw new Error(`fraxinus 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 复叶卡快颤（aBend 权重，组 0 恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值记档：
 * hash 常数 93.847/70.913（与十先例相位流〔sway 77.669–88.217 + 91.523 /
 * flutter 49.337–65.443 + 68.137〕去相关——新值在两域外）+ **树高锚 10.4973m
 * （×0.09526——slot-0 Stage 实测涌现同步轮，2026-09-22**〔志书「高10-12米」
 * 直给 + 卵圆开展冠不宜取高端；011.8 9.896m / 011.9 10.3413m 同款流程〕）；缓摆
 * ~0.18Hz / 顶部 ~4.2cm；快颤 9–15 rad/s（≈1.4–2.4Hz 中频）/ ≤11mm（11mm
 * 家族档——整枚羽叶中等摆锤，与栾/重阳木/国槐同档中幅）。
 */
const FRX_WIND = /* glsl */ `
// fraxinus wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float frxWindPhase = fract(sin(aSeed * 93.847 + 5.7) * 43758.5453);
float frxWindH = clamp(position.y * 0.09526, 0.0, 1.0); // /10.4973m 树高锚（slot-0 实测涌现 10.4973，T011.10 Stage 探针同步轮 2026-09-22——志书「高10-12米」直给 ≈10m 锚落域；011.8 9.896m / 011.9 10.3413m 同款流程）
float frxSway = frxWindH * frxWindH * 0.042 * sin(uTime * 1.15 + frxWindPhase * 6.28318 + frxWindH * 1.4);
// 复叶卡快颤：ω = 9 + 6φ（9–15 rad/s ≈ 1.4–2.4Hz 中频），幅度 ≤11mm 家族档（整枚羽叶中等摆锤——与栾/重阳木/国槐同档）；权重 = aBend（卡根≈0 尖大）
float frxFlutterPhase = fract(sin((aSeed + aLeafRand) * 70.913 + 6.4) * 43758.5453);
float frxFlutter = aBend * 0.011 * sin(uTime * (9.0 + 6.0 * frxFlutterPhase) + frxFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (frxSway + frxFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(frxSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * frxFlutter * 0.9; // 叶面沿卡法线微扑（组 0 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const FRX_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 一回奇数羽状复叶 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────

/**
 * 小叶窗列变量段（单级带列 + 小叶场 + 齿载波——到齿项）：单一来源——SDF 子函数
 * frxColumn 与叶面小叶脉装饰层两处展开共享同一字符串（koe/sophora 同款纪律）。
 * 依赖作用域内已有 frxX/frxY/frxA/frxEnv/frxRand。
 */
const FRX_LEAFLET_VARS = /* glsl */ `
  // 小叶窗列（单级带列——沿叶轴 v）：yb = y − 0.285 − 右列降 0.05·space（对生严格——裁决 8/照片双问；
  // vs 国槐近对生 0.18·space：相位差压缩到 5% = 严格对生的极小抖动）
  float frxSpace = 0.150 + 0.075 * fract(frxRand * 5.317 + 0.41); // 间距逐卡变奏 → 有效带数 2–3 对（JS run 计数锚——「小叶5-7枚」统计实现）
  float frxYb = frxY - 0.285 - max(sign(frxX), 0.0) * frxSpace * 0.05;
  float frxBandT = frxYb / frxSpace;
  float frxBandIdx = floor(frxBandT + 0.5);
  float frxL = (frxBandT - frxBandIdx) * frxSpace; // 距最近带中心有符号侧偏（沿 v）
  // 小叶场：长 = 0.92×行包络（行包络锚定——中位对最大、两端渐小）
  float frxLen = clamp(0.92 * frxEnv, 0.055, 0.170);
  float frxTc = clamp(frxA / frxLen, 0.001, 0.999); // 沿小叶轴
  float frxEnvSinL = sin(3.14159 * pow(frxTc, 0.80)); // 峰 t≈0.42 偏基（「卵形、倒卵状长圆形至披针形」首列 Verified）
  float frxEnvExpL = mix(1.06, 2.50 + 0.80 * fract(frxRand * 4.517 + 0.33), smoothstep(0.55, 0.85, frxTc)); // 基 1.06 钝圆/楔形宽开张（「基部钝圆或楔形」）→ 先端 2.50–3.30 锐尖-渐尖强收口（「先端锐尖至渐尖」Verified——尾长逐叶统计）
  float frxEnvNL = pow(frxEnvSinL, frxEnvExpL);
  float frxHw = frxLen * (0.17 + 0.12 * fract(frxRand * 6.311 + 0.23)); // 小叶半宽（长宽比 1.72–2.94 ∈ 1.5–3.0 Verified 域）
  // 缘整齐锐锯齿载波（裁决 8——「叶缘具整齐锯齿」FRPS Verified + subsp. chinensis distinctly serrate）：
  // 2π·9 = 56.55 同频 9 齿/小叶轴 pow 2.4 锐齿（zelkova 011.3 锐齿载波先例同法——ALU 化零抖动噪声保深度零噪声；
  // 「整齐」= 规则单频载波不调频率）；端部渐隐门控（基部贴轴/先端收口渐隐）
  float frxTooth = pow(0.5 + 0.5 * cos(frxTc * 56.55 - fract(frxRand * 8.127 + 0.61) * 6.28), 2.4);
  float frxGate = smoothstep(0.03, 0.12, frxTc) * (1.0 - smoothstep(0.92, 0.985, frxTc));
  float frxSerr = (frxTooth - 0.5) * 0.022 * frxGate; // 幅度 ±0.011 = 坡宽 0.02 的 55%（细密锐齿——不破 AA）
`;

/**
 * 白蜡一回奇数羽状复叶卡覆盖率（uv：u 横 0–1、v 沿主轴 0 复叶基 → 1 顶端；
 * 宽/长比 0.36 冻结接口）：**单级窗列对生严格变体 + 顶生近等大独立窗 + 裸轴更长
 * + 缘齿载波**（011.9 路径同型不同数值——复叶系对照轴的材质侧证据，见模块头
 * 方法记档）。合成 edge = max(叶轴, max(min(包络, 窗列 − 双减法门控), 顶生窗))
 * ——窗列带**减法门控**两道（裸轴基段更长 + 顶栏：负距离判弃——011.8 乘法
 * 门控伪覆盖教训的强制形态）；**零 facVnoise 引用是深度材质不挂噪声库的前提
 * （引入即深度编译暴雷——保护性约束；齿载波 cos 为 ALU 非噪声——zelkova 组合
 * 先例）**；返回近似符号距离的覆盖率坡（edge/0.02——坡宽 0.02 小叶间隙级，
 * alphaToCoverage 承担 AA）。
 */
const FRX_LEAF_SDF = /* glsl */ `
// 窗列子函数（FXC X4000 数据流误报规避——011.6 ⑨/011.8 ⑦ 前置）：小叶带列 + 小叶场 + 齿载波
// 整体封装，单返回值零 out 参；主函数体随之最小化。数学逐位等价——纯函数引用透明。
float frxColumn(float frxX, float frxY, float frxEnv, float frxRand) {
  float frxA = abs(frxX);
${FRX_LEAFLET_VARS}
  return frxHw * frxEnvNL + frxSerr - abs(frxL); // 小叶场 + 齿载波（零偏斜——FRPS 小叶描述无偏斜句，vs 国槐「稍偏斜」对照）
}
// 顶生小叶独立窗位（「奇数」的表达——奇数羽状顶端单生；近等大或稍大 1.01–1.14×〔FRPS 原句——vs 国槐顶生更大〕，
// 同型包络 + 同型齿载波，竖直轴）
float frxTerminal(float frxX, float frxY, float frxRand) {
  float frxLenT = 0.155 + 0.020 * fract(frxRand * 2.713 + 0.47);
  float frxTt = clamp((frxY - 0.795) / frxLenT, 0.001, 0.999);
  float frxEnvSinT = sin(3.14159 * pow(frxTt, 0.80));
  float frxEnvExpT = mix(1.06, 2.50 + 0.80 * fract(frxRand * 4.517 + 0.33), smoothstep(0.55, 0.85, frxTt));
  float frxEnvNT = pow(frxEnvSinT, frxEnvExpT);
  float frxHwT = frxLenT * (0.19 + 0.08 * fract(frxRand * 6.311 + 0.23));
  float frxToothT = pow(0.5 + 0.5 * cos(frxTt * 56.55 - fract(frxRand * 8.127 + 0.61) * 6.28), 2.4);
  float frxGateT = smoothstep(0.03, 0.12, frxTt) * (1.0 - smoothstep(0.92, 0.985, frxTt));
  float frxSerrT = (frxToothT - 0.5) * 0.022 * frxGateT;
  return frxHwT * frxEnvNT + frxSerrT - abs(frxX);
}
float frxLeafAlpha(vec2 frxUv, float frxRand) {
  vec2 frxP = vec2(frxUv.x - 0.5, frxUv.y);
  float frxX = frxP.x * 0.36; // 物理横坐标（长 1 单位、半宽 0.18——宽/长比 0.36 冻结接口）
  float frxY = frxP.y;
  float frxA = abs(frxX);
  // 全叶包络：椭圆性整体剪影（峰 v≈0.52 近中 = 中位小叶最大；峰值 0.166 + 齿峰 0.011 = 0.177 在卡缘 0.18 内侧——卡缘恒裁 JS 锚）
  float frxEnvSin = sin(3.14159 * pow(clamp(frxY, 0.001, 0.999), 0.92));
  float frxEnv = 0.166 * pow(frxEnvSin, mix(0.90, 1.24, smoothstep(0.30, 0.92, frxY)));
  float frxEnvEdge = frxEnv - frxA;
  // 叶轴 rachis：挺直渐细（「叶轴挺直」+「叶柄基部不增厚」FRPS Verified——无基部膨大带，vs 国槐藏芽膨大对照）
  float frxRachisEdge = 0.0045 + 0.0055 * (1.0 - frxY) - frxA;
  // 窗列 + 双减法门控（011.8 教训强制形态——负距离判弃，非乘法钳 0）：
  // 裸轴基段更长（bare 占比 ≈0.29 ∈ 0.28–0.35 冻结接口域——band −1 幻影带压灭）
  // + 顶栏（顶生小叶下方窗列终止——space 上限时 band 2 半灭/压灭 → 2–3 对门控的另一半）
  float frxCol = frxColumn(frxX, frxY, frxEnv, frxRand)
    - (1.0 - smoothstep(0.24, 0.285, frxY)) * 0.10
    - smoothstep(0.70, 0.74, frxY) * 0.10;
  float frxTermEdge = frxTerminal(frxX, frxY, frxRand);
  float frxEdge = max(frxRachisEdge, max(min(frxEnvEdge, frxCol), frxTermEdge));
  return clamp(frxEdge / 0.02 + 0.5, 0.0, 1.0); // 坡宽 0.02（小叶间隙级——alphaToCoverage AA）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档
 * 取用）：包络 + 叶轴即可——去窗列/顶生窗/**去齿载波**（**复叶细化 + 锯齿亚
 * 像素双牺牲**：远距复叶结构与缘齿均不可辨 Spec §7 牺牲顺序；片元零噪声先天
 * 成立）。包络/叶轴/裸轴门控与 High 逐字同源（档间叶形身份一致的去细节不改形
 * 原则——远距保留羽叶层叠轮廓色块）。JS 锚：Low 最宽行与 High 外廓差 ∈
 * [−0.010, +0.040]（带列相位错过包络峰的固有差——带间离散结构，宽于单叶先例
 * ±0.025 带的记档理由；LOD 切换无跳变量级）。
 */
const FRX_LEAF_SDF_LOW = /* glsl */ `
float frxLeafAlpha(vec2 frxUv, float frxRand) {
  vec2 frxP = vec2(frxUv.x - 0.5, frxUv.y);
  float frxA = abs(frxP.x * 0.36); // （与 High 逐字同源折算）
  float frxY = frxP.y;
  float frxEnvSin = sin(3.14159 * pow(clamp(frxY, 0.001, 0.999), 0.92)); // 包络（与 High 逐字同源）
  float frxEnv = 0.166 * pow(frxEnvSin, mix(0.90, 1.24, smoothstep(0.30, 0.92, frxY)));
  float frxEdge = max(0.0045 + 0.0055 * (1.0 - frxY), frxEnv - (1.0 - smoothstep(0.24, 0.285, frxY)) * 0.10) - frxA; // 叶轴 ∪ 包络 − 裸轴减法门控（去窗列/顶生窗/齿载波——frxRand 保留双参签名沿家族契约、Low 不用）
  return clamp(frxEdge / 0.02 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/小叶脉——叶团乘子 0.94+0.12×frxClump 均值化 = 1.0 消去，值噪声均值
 *  0.5 精确保均）。 */
const FRX_LEAF_HEAD = /* glsl */ `
// fraxinus:leaf —— 一回奇数羽状复叶对生窗列 SDF 裁切 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float frxAlpha = frxLeafAlpha(vUv, vLeafRand);
diffuseColor.a = frxAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷中绿 ↔ 暖黄绿——Spec §5 上面中绿-亮绿 + §6 变体读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 frxHue = mix(vec3(0.95, 1.00, 1.02), vec3(1.05, 1.04, 0.94), fract(vLeafRand * 7.517 + 0.33));
float frxLuma = 0.92 + 0.16 * fract(vLeafRand * 4.619 + 0.57);
`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const FRX_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.85m ≈ 团块 1/8–1/15 冠幅——对生羽叶层叠复合质感 Spec §3
// Inferred；采样偏移与十先例去相关）
float frxClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.63, vTreePos.y - vTreePos.z * 0.77) * 1.12 + vec2(63.4, 29.8));
`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const FRX_LEAF_SHADE = /* glsl */ `
float frxShade = clamp((vTreePos.y - 2.8) / 2.8, 0.0, 1.0); // 冠基 ≈2.8m 工程占位锚（净干 Unknown——Spec §A 结构性缺口；8–12m 域取中下，slot-0 未实测，Stage 同步轮记缺口候选⑤）；带宽 2.8 = 家族 2.8 × 冠深比 1（10m 树）`;

/** High 专属：小叶羽状脉三层（中脉亮带 + 侧脉细脊 + 细脉网结弱纹，纯 ALU 零采样）。
 *  坐标段与 SDF 共享（FRX_LEAFLET_VARS 同源折算——同名单不同作用域，koe/sophora 装饰层同款纪律）。 */
const FRX_LEAF_VEIN = /* glsl */ `
// 小叶脉三层（FRPS Verified 原句「中脉在上面平坦，侧脉8-10对，下面凸起，细脉在两面凸起，明显网结」）：
// 每小叶中脉亮带（沿小叶轴自叶轴伸出、先端渐隐）+ 侧脉斜升细脊（sin pow^7 纤细不达缘——与齿同频 56.55：
// 每对侧脉对应一齿的达缘入齿统计读向，zelkova「脉端直达齿尖」同法；非逐齿相位锁定记档）
// + 细脉网结弱纹（双 sin 交织——「明显网结」的弱层）+ 顶生小叶竖直中脉
float frxX = (vUv.x - 0.5) * 0.36;
float frxY = vUv.y;
float frxRand = vLeafRand;
float frxA = abs(frxX);
float frxEnvSin = sin(3.14159 * pow(clamp(frxY, 0.001, 0.999), 0.92));
float frxEnv = 0.166 * pow(frxEnvSin, mix(0.90, 1.24, smoothstep(0.30, 0.92, frxY)));
${FRX_LEAFLET_VARS}
float frxVMid = (1.0 - smoothstep(0.006, 0.020, abs(frxL))) * smoothstep(0.02, 0.10, frxTc) * (1.0 - smoothstep(0.72, 0.90, frxTc)); // 小叶中脉（先端渐隐；零偏斜轴——|L| 直读）
float frxVLat = pow(max(0.0, sin(frxTc * 56.55 - abs(frxL) * 88.0 + (frxRand - 0.5) * 0.8)), 7.0)
  * smoothstep(0.004, 0.014, abs(frxL)) * smoothstep(0.10, 0.22, frxTc) * (1.0 - smoothstep(0.70, 0.86, frxTc)); // 侧脉斜升脊族（避开中脉带、纤细不达缘；与齿载波同频 56.55——脉端入齿统计）
float frxVNet = (0.5 + 0.5 * sin(frxTc * 23.0 + frxL * 61.0)) * (0.5 + 0.5 * sin(frxTc * 31.0 - frxL * 47.0))
  * smoothstep(0.006, 0.016, abs(frxL)) * (1.0 - smoothstep(0.030, 0.044, abs(frxL)))
  * smoothstep(0.10, 0.25, frxTc) * (1.0 - smoothstep(0.72, 0.90, frxTc)); // 细脉网结弱纹（中域交织——「明显网结」弱层）
float frxVMidT = (1.0 - smoothstep(0.006, 0.020, frxA)) * smoothstep(0.80, 0.83, frxY) * (1.0 - smoothstep(0.94, 0.965, frxY)); // 顶生小叶竖直中脉
float frxVMidAll = max(frxVMid, frxVMidT);
`;

/** High 专属：合成（叶团乘子 + 小叶脉三层调制） */
const FRX_LEAF_MUL_HIGH = /* glsl */ `
vec3 frxMul = frxHue * frxLuma * (0.80 + 0.20 * frxShade) * (0.94 + 0.12 * frxClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
frxMul = mix(frxMul, frxMul * vec3(1.40, 1.34, 1.02), frxVMidAll * 0.24 + frxVLat * 0.11 + frxVNet * 0.06); // 小叶脉三层弱表达 0.24/0.11/0.06（中脉浅色身份层 + 侧脉细脊 + 网结弱纹）
diffuseColor.rgb *= frxMul;
`;

/** Mid/Low：合成（去叶团/小叶脉——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const FRX_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 frxMul = frxHue * frxLuma * (0.80 + 0.20 * frxShade); // Mid/Low：叶团乘子均值化消去（T011.10）
diffuseColor.rgb *= frxMul;
`;

/** 叶背浅绿-灰绿（三档共用，纯 ALU 零采样零分支） */
const FRX_LEAF_BACK = /* glsl */ `
// 叶背浅绿-灰绿（**两面色差 = 弱档**——裁决 1/§5：上面中绿-亮绿、下面浅绿-灰绿，照片级 Inferred
// 〔志书仅毛被句无「下面灰白色」显式原句——弱于国槐灰白 Verified 级〕；「白蜡」命源 = 白蜡虫非
// 叶色——叶背不做蜡白过度引申）：gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，
// 背面法线由 three 双面光照自动翻转，此处只调固有色）——背面 ×(1.09, 1.11, 1.17)（B 抬升灰向
// 但幅度低于国槐 glaucous 加重档 ×(1.16,1.18,1.28)——弱档：介于榉无粉 ×(1.10,1.12,1.04) 与
// 栾柔毛灰绿 ×(1.09,1.10,1.13) 之间偏灰向）；两面糙度差 +0.05（弱档——弱于国槐 +0.06）；纯
// ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.09, 1.11, 1.17), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  家族值域内取：硬纸质细碎小叶透风（0.318——悬 0.28 < 朴 0.30 < 重阳木 0.31 <
 *  **白蜡 0.318** < 栾 0.32 < 国槐 0.325 < 乌桕 0.33 < 银杏 0.34——硬纸质透光
 *  微逊纸质端栾/国槐）。 */
const FRX_LEAF_TRANSLUCENCY = /* glsl */ `
// fraxinus:leaf —— 背光透射（家族值域内取）：视线与阳光反向时叶背透亮灰绿黄（叶绿素吸收
// 红蓝 → 透射偏黄绿；硬纸质细碎小叶透风透光——峰值 0.318，Spec §2「硬纸质」Verified；
// 小叶间隙透空由 SDF alpha 承担）
#if NUM_DIR_LIGHTS > 0
  float frxBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float frxTransVar = 0.55 + 0.45 * fract(vLeafRand * 7.913 + 0.63); // 逐叶透光强度变奏
  outgoingLight += vec3(0.54, 0.90, 0.36) * directionalLights[0].color
    * pow(frxBack, 3.0) * frxTransVar * frxAlpha * 0.318;
#endif
`;

// ── 组 0（皮+果）配方主体（<map_fragment> 后注入；uv 域身份分支 3.5）────────────────

/** 皮域：裂线游走 + 8 细脊浅宽坡剖面 + 上部弱化门控（三档共用——Low 保留面的唯一采样：裂线游走） */
const FRX_BARK_WARP = /* glsl */ `
// 裂线游走低频场（1× vnoise 复用为单色微变 ±5%——「树皮灰褐色」单色系无剥落无三色带；drift 0.80 纵为主）
float frxWarp = facVnoise(vec2(vUv.x * 2.4, vUv.y * 1.25) + vec2(59.3, 35.1));
// 8 细脊/周（vs 国槐 6 板状粗犷——细一档；bark-a「细纵纹」/fruit-c「浅纵脊沟」照片源）
float frxTri = abs(fract(vUv.x * 8.0 + frxWarp * 0.80) * 2.0 - 1.0);
float frxPlate = smoothstep(0.26, 0.56, frxTri); // 浅宽坡剖面（脊浅沟浅——vs 国槐窄深沟 0.16–0.42）
frxBarkSmooth = smoothstep(3.2, 5.6, vTreePos.y); // 幼干-大枝上部弱化门控（赋值域变量——domainVars 预声明，roughness 注入跨 include 消费；龄级序列浅档近似）
float frxRidge = mix(0.68 + 0.32 * frxPlate, 0.94 + 0.06 * frxPlate, frxBarkSmooth); // 沟深剖面 0.68 浅档（vs 国槐 0.52/重阳木 0.54——脊沟对比 0.32）+ 上部近光滑（幼干-大枝近光滑读向）
`;

/** 干基暗化弱档（High/Mid 共用——低调项，Low 随段去） */
const FRX_BARK_BASEDARK = /* glsl */ `
float frxBarkBase = 1.0 - smoothstep(0.5, 2.4, vTreePos.y); // 干基暗带门控（家族惯例——老干渐深读向，弱档权重）`;

/** 细枝黄褐-灰褐过渡门控（三档共用——结构剪影项） */
const FRX_BARK_TWIG = /* glsl */ `
// 细枝段门控（v 低弧长域——「细枝管 v 小」几何契约注记 × 冠缘高位双门控）：当年生枝黄褐 / 老枝灰褐两档
float frxTwigHi = smoothstep(6.2, 8.2, vTreePos.y) * (1.0 - smoothstep(0.45, 0.95, vUv.y));
float frxTwigMid = smoothstep(4.8, 6.2, vTreePos.y) * (1.0 - smoothstep(0.40, 0.90, vUv.y));
`;

/** 皮孔点场（High 专属近景——ALU 网格 hash；小、稀、弱对比 =「皮孔小，不明显」FRPS 原句三项落地） */
const FRX_BARK_LENTICEL = /* glsl */ `
// 皮孔浅微亮小点（「皮孔小，不明显」FRPS Verified + bark-a「圆-椭圆皮孔」照片佐证——vs 栾密麻点
// 醒目分化）：30×44 格 hash 抖动、26% 格有孔（step 0.74 稀疏门——不明显〔密度侧〕）、小半径
// （0.06–0.10 格单位——「小」）、×(1.12,1.11,1.08) 弱对比（「不明显」〔对比侧〕）；域 = 上部幼干
// 大枝带（高位门 × 中低弧长——「幼干-大枝近光滑 + 皮孔」合并读向）
vec2 frxLc = vec2(vUv.x * 30.0, vUv.y * 44.0);
vec2 frxLId = floor(frxLc);
float frxLR = fract(sin(dot(frxLId, vec2(127.1, 311.7)) + 23.7) * 43758.5453);
vec2 frxLF = fract(frxLc) - 0.5 - (vec2(fract(frxLR * 7.31), fract(frxLR * 3.17)) - 0.5) * 0.46;
float frxLRad = 0.06 + 0.04 * fract(frxLR * 9.31);
frxLenticel = (1.0 - smoothstep(frxLRad * 0.5, frxLRad, length(frxLF))) * step(0.74, frxLR)
  * smoothstep(2.6, 3.8, vTreePos.y) * (1.0 - smoothstep(0.90, 1.70, vUv.y)); // 赋值域变量（跨 include 供 roughness 消费——块内不重声明防遮蔽）
`;

/** High：合成（基底灰褐微变 + 沟内弱 AO + 干基暗化弱档 + 细枝两档 + 皮孔弱对比点） */
const FRX_BARK_MUL = /* glsl */ `
vec3 frxBarkMul = vec3(frxRidge) * (0.94 + 0.10 * frxWarp); // 基底灰褐单色微变 ±5%（「树皮灰褐色」FRPS Verified——无剥落无三色带；vec3(frxRidge) 显式广播——011.8 编译事故修复形态）
frxBarkMul *= mix(vec3(0.87, 0.86, 0.85), vec3(1.0), smoothstep(0.20, 0.62, frxTri)); // 沟内弱 AO（沟浅——弱于国槐深沟冷中性 AO）
frxBarkMul *= mix(vec3(1.0), vec3(0.91, 0.91, 0.92), frxBarkBase * 0.5); // 干基暗化弱档（老干渐深读向——家族惯例低调项）
frxBarkMul = mix(frxBarkMul, frxBarkMul * vec3(1.16, 1.04, 0.76), frxTwigHi * 0.70); // 小枝黄褐收敛（「小枝黄褐色」FRPS 原句——vs 国槐绿枝两树细枝色对照）
frxBarkMul = mix(frxBarkMul, frxBarkMul * vec3(1.02, 1.00, 0.94), frxTwigMid * 0.30); // 老枝灰褐弱收敛
frxBarkMul *= mix(vec3(1.0), vec3(1.12, 1.11, 1.08), frxLenticel * 0.7); // 皮孔浅微亮弱对比（小不明显——vs 栾密麻点醒目不串种）
diffuseColor.rgb *= frxBarkMul;
`;

/** Mid：合成（去皮孔点——近景细节层；脊沟浅档/沟内弱 AO/干基暗化/细枝两档保留） */
const FRX_BARK_MUL_MID = /* glsl */ `
vec3 frxBarkMul = vec3(frxRidge) * (0.94 + 0.10 * frxWarp); // 基底灰褐微变保留（中距「灰褐浅纵裂」色块身份）
frxBarkMul *= mix(vec3(0.87, 0.86, 0.85), vec3(1.0), smoothstep(0.20, 0.62, frxTri)); // 沟内弱 AO（浅纵裂两带）
frxBarkMul *= mix(vec3(1.0), vec3(0.91, 0.91, 0.92), frxBarkBase * 0.5); // 干基暗化保留
frxBarkMul = mix(frxBarkMul, frxBarkMul * vec3(1.16, 1.04, 0.76), frxTwigHi * 0.70); // 细枝黄褐过渡保留（冠缘黄褐细枝中距读向）
frxBarkMul = mix(frxBarkMul, frxBarkMul * vec3(1.02, 1.00, 0.94), frxTwigMid * 0.30);
diffuseColor.rgb *= frxBarkMul;
`;

/** Low：合成（再去干基暗化/老枝灰褐档——低调项；脊沟 + 沟内 AO + 当年生黄褐档保留） */
const FRX_BARK_MUL_LOW = /* glsl */ `
vec3 frxBarkMul = vec3(frxRidge) * (0.94 + 0.10 * frxWarp); // 脊沟浅档基底（远距「灰褐浅纵裂剪影」保留面）
frxBarkMul *= mix(vec3(0.87, 0.86, 0.85), vec3(1.0), smoothstep(0.20, 0.62, frxTri)); // 沟内 AO（浅纵裂两带剪影）
frxBarkMul = mix(frxBarkMul, frxBarkMul * vec3(1.16, 1.04, 0.76), frxTwigHi * 0.70); // 当年生黄褐档（结构剪影项三档保留）
diffuseColor.rgb *= frxBarkMul;
`;

/** 果域体（三档共用——匙形翅果：嫩绿→黄绿→淡褐→淡黄褐四档色序 + 边缘微暗线） */
const FRX_FRUIT_BODY = /* glsl */ `
  // 果域（v∈[4,5]）：匙形翅果（裁决 4 做/裁决 5 主域）——嫩绿→黄绿→淡褐→淡黄褐四档色序
  // （§5 照片四点链：fruit-b 嫩绿 5 月 → fruit-c 黄绿帘幕 7 月 → fruit-a 黄绿-淡褐 9 月 →
  // twig-a/b 淡黄褐宿存 2 月——老熟档 = 宿存端色序上限）；u = 逐果随机（几何冻结接口）；
  // warp 权重倾斜（相位 0 = 正弦导数在中域为负 → 中域密度放大；JS 锚 ≈17/33/33/17% 实测——
  // 9–10 月盛挂混熟读向，黄绿-淡褐中域 ≈66% 与中绿叶幕可辨〔fruit-c 双问「醒目」〕；
  // 恢复会话重验修正：原 0.05·sin(2π(u−0.18)) 实测 23/22/33/22% 中域仅 55% 未达意图且锚未经运行验证）
  float frxFu = clamp(vUv.x + 0.09 * sin(6.28318 * vUv.x), 0.0, 0.999);
  float frxFBin = floor(frxFu * 4.0);
  vec3 frxFruit = mix(mix(mix(vec3(0.55, 0.66, 0.30), vec3(0.66, 0.72, 0.34), step(0.5, frxFBin)), vec3(0.72, 0.66, 0.42), step(1.5, frxFBin)), vec3(0.78, 0.70, 0.48), step(2.5, frxFBin));
  // 扁平双面感 + 边缘微暗线（近景身份点——匙形桨形轮廓强化）：正背面一致色（无 gl_FrontFacing 分支——
  // 果面片双面渲染归几何侧双 tri〔缺口候选③〕；双面一致色即扁平双面读向的材质侧表达）+ 果面片周缘
  // 双轴微暗线 ×(0.84,0.82,0.80)·0.8（果 uv 轴向契约为材质侧假设——双轴保守实现四缘皆暗，
  // 错位时降级为果面边缘纹理，不破帘幕剪影，缺口候选③）
  float frxFEx = max(smoothstep(0.86, 0.985, vUv.x), smoothstep(0.015, 0.14, vUv.x));
  float frxFEy = max(smoothstep(0.90, 0.995, fract(vUv.y - 4.0)), smoothstep(0.005, 0.10, fract(vUv.y - 4.0)));
  float frxFEdge = max(frxFEx, frxFEy);
  diffuseColor.rgb = frxFruit * (0.94 + 0.10 * fract(vUv.x * 31.3)) * mix(vec3(1.0), vec3(0.84, 0.82, 0.80), frxFEdge * 0.8); // 档内 ±5% 变奏 + 桨形轮廓暗线
`;

/** 果域微透亮（High 专属——嫩绿/宿存果半透明；<opaque_fragment> 前注入，域门控 v≥3.5） */
const FRX_FRUIT_TRANSLUCENCY = /* glsl */ `
// fraxinus:bark —— 果域微透亮（fruit-b「嫩绿半透明」/twig-a「backlit 半透明」[12]——弱背光 0.16 嫩绿，域门控 v≥3.5）
#if NUM_DIR_LIGHTS > 0
  if (vUv.y >= 3.5) {
    float frxFBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
    outgoingLight += vec3(0.72, 0.90, 0.52) * directionalLights[0].color * pow(frxFBack, 2.5) * 0.16;
  }
#endif
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 复叶卡材质（组 1）：一回奇数羽状复叶对生窗列 SDF alphaTest 裁切 + 小叶脉三层
 * （High）+ 两面浅绿-灰绿弱差 + 家族值域透光 + 逐叶变奏 + 风动。level 分档
 * （T011.10，缺省 'high'）：Mid 去小叶脉/叶团/糙度叶团项（Spec §7 叶脉仅近距
 * 可辨；**SDF 全形含窗列/顶生窗/齿载波保留——档间剪影一致：羽状剪影是中距
 * 身份**），透光/叶背/hue·luma/shade/两面糙度差保留；Low 换 FRX_LEAF_SDF_LOW
 * （去窗列+**去齿载波**——复叶细化 + 锯齿亚像素双牺牲；包络/叶轴/裸轴门控与
 * High 逐字同源）+ 去透光，片元零噪声采样。风动三档同源不动（FRX_WIND 同一
 * 常量——档间风相位一致 = 身份一致）。
 * 底参：中绿 #548840（工程设定——Spec §5 上面中绿-亮绿〔照片级〕；十树亮度链：
 * 栾 < **白蜡** ≈ 国槐邻档半档之差）/ m 0 / r 0.68（「硬纸质」FRPS Verified：
 * 悬厚实 0.66 < 国槐纸质 0.67 < 0.68 < 栾/重阳木 0.70）/ DoubleSide（卡面双面
 * 可见，背面法线由 three 双面光照自动翻转）。
 */
export function createFraxinusLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x548840, // 中绿（工程设定：Spec §5 上面中绿-亮绿——亮于栾、微暗于国槐亮绿端半档）
    metalness: 0,
    roughness: 0.68, // 硬纸质（「硬纸质」FRPS Verified——国槐纸质 0.67 微抬一档）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 复叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? FRX_LEAF_SDF_LOW : FRX_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含窗列/顶生窗/齿载波）
  const leafBody = level === 'high'
    ? FRX_LEAF_HEAD + FRX_LEAF_CLUMP + FRX_LEAF_SHADE + FRX_LEAF_VEIN + FRX_LEAF_MUL_HIGH + FRX_LEAF_BACK
    : FRX_LEAF_HEAD + FRX_LEAF_SHADE + FRX_LEAF_MUL_SIMPLE + FRX_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (frxClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.05, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.05, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面糙度差保留）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${FRX_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${FRX_WIND}`,
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
        `${FRX_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `fraxinus:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（皮+果一材质两域，uv 域身份分支 3.5）：皮域 = 第 11 树皮语言「灰褐
 * 浅-中纵裂（无剥落无碎翘）+ 幼干-大枝近光滑 + 皮孔小不明显」（8 细脊浅宽坡
 * 剖面 + 沟深 0.68 浅档 + 上部弱化门控【龄级序列浅档】+ 沟内弱 AO + 干基暗化
 * 弱档 + 细枝黄褐-灰褐两档 + 皮孔浅微亮小点【High——小稀弱对比三项落地】）；
 * 果域 v∈[4,5] = 匙形翅果嫩绿→黄绿→淡褐→淡黄褐四档色序 + 边缘微暗线（桨形
 * 轮廓）+ 翅面微光泽（微透亮 High）。level 分档（T011.10，缺省 'high'）：Mid
 * 去皮孔点（近景细节层），脊沟浅档/沟内 AO/干基暗化/细枝两档/果域全保留——
 * 中距「灰褐浅纵裂 + 冠缘黄褐细枝 + 帘幕果簇」身份（Spec §7 中距保留面）；
 * Low 再去干基暗化/老枝灰褐档（低调项），脊沟 + 沟内 AO + 当年生黄褐档 + 果域
 * 保留（远距「浅纵裂剪影 + 果帘」保留面），1× vnoise。风动 = 整树缓摆与叶同
 * 公式同相位（aBend 恒 0 快颤层天然不作用——果序下垂摆动归缺口候选④）。
 * 底参：灰褐主调 #7a746b（工程设定——FRPS「树皮灰褐色」Verified + bark-a/fruit-c
 * 照片交叉；R−G=6 灰褐向；十树链：国槐 #6d675d < **白蜡** < 栾 #90928a——浅
 * 国槐一档）/ m 0 / r 0.90（浅裂光滑族中糙——深纵裂族 0.93 与光滑栾之间）/
 * FrontSide（皮管闭合实体；果面片双面渲染归几何侧双 tri——缺口候选③）。
 */
export function createFraxinusBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x7a746b, // 灰褐（工程设定：FRPS 灰褐 [1] + bark-a「浅灰褐-棕褐」/fruit-c「灰-灰褐浅纵脊沟」[12] 交叉——浅国槐 #6d675d 一档、深于栾 #90928a）
    metalness: 0,
    roughness: 0.90, // 浅裂光滑族中糙哑光（vs 深纵裂族 0.93）
    side: THREE.FrontSide, // 皮管闭合实体（果面片双 tri 双面归几何侧——缺口候选③）
  });
  material.defines = { USE_UV: '' }; // 两域分支 = uv 域身份标记（皮圆柱 / 果面片）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? FRX_BARK_WARP + FRX_BARK_BASEDARK + FRX_BARK_TWIG + FRX_BARK_LENTICEL + FRX_BARK_MUL
    : level === 'mid'
      ? FRX_BARK_WARP + FRX_BARK_BASEDARK + FRX_BARK_TWIG + FRX_BARK_MUL_MID
      : FRX_BARK_WARP + FRX_BARK_TWIG + FRX_BARK_MUL_LOW;
  // 跨 include 域变量预声明（roughnessmap 注入在 main 顶层消费 frxBarkSmooth/frxLenticel——
  // map 注入的 if/else 块内声明在该注入点作用域已关闭〔triadica Step 4 实证事故形态〕；
  // 块内改纯赋值防遮蔽。三档统一声明：WARP 段三档均赋值 frxBarkSmooth（Mid/Low 未消费的
  // 预声明为无害死值——triadica domainVars 同款处置；frxLenticel High 注入段赋值、
  // Mid/Low 未消费零赋值）
  const domainVars = 'float frxLenticel = 0.0; float frxBarkSmooth = 0.0; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一，未消费档为无害死值）\n';
  const body = /* glsl */ `
// fraxinus:bark —— 组 0 两域分支（皮 v<3.5 / 匙形翅果 v∈[4,5]——uv 域身份标记，几何侧冻结契约；
// 阈值 3.5 = 果域 4.0 下探 0.5 隔离带，triadica/koelreuteria/sophora 三重隔离同款纪律）
${domainVars}if (vUv.y >= 3.5) {
${FRX_FRUIT_BODY}
} else {
${barkBody}
}`;
  const barkRoughness = level === 'high'
    ? `if (vUv.y >= 3.5) { roughnessFactor = 0.52; } // 果域翅面微光泽（干翅纸质——vs 国槐肉质荚果 0.45 哑一档）
else { roughnessFactor = clamp(0.90 - frxBarkSmooth * 0.05 - frxLenticel * 0.06, 0.05, 1.0); } // 皮域：幼干上部微泽 + 皮孔点微泽`
    : level === 'mid'
      ? `if (vUv.y >= 3.5) { roughnessFactor = 0.55; } // Mid：果域光泽（微透亮随段去）
else { roughnessFactor = clamp(0.90 - frxBarkSmooth * 0.05, 0.05, 1.0); } // Mid：幼干上部微泽保留（皮孔项随段去）`
      : `if (vUv.y >= 3.5) { roughnessFactor = 0.58; } // Low：果域光泽（远距果色读向保留）
else { roughnessFactor = 0.90; } // Low：浅裂族中糙哑光基底（皮孔/上部项随段去）`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${FRX_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${FRX_WIND}`,
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
    if (level === 'high') { // 果域微透亮（High）；Mid/Low 不注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${FRX_FRUIT_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `fraxinus:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（同源
 * 全形含窗列/顶生窗/齿载波——档间剪影一致）；Low = FRX_LEAF_SDF_LOW（表面/影
 * 档内一致——去窗列+去齿版）。**深度片元不挂噪声库**——SDF 零 facVnoise 引用
 * （窗列/小叶场/顶生窗/齿载波全 ALU——cos 为齿载波专用非噪声；SDF 内引入噪声
 * 即编译暴雷——保护性约束）。
 * 组 0 守卫：皮/果域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质
 * 时组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例；果域无需 v 路由——
 * rand=0 即守卫）。风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向
 * 由 shadowMap 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由
 * shadowMap 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createFraxinusLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 复叶卡 uv
  const leafSdf = level === 'low' ? FRX_LEAF_SDF_LOW : FRX_LEAF_SDF; // Mid 深度 = High SDF（同源全形含窗列/顶生窗/齿载波）
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
diffuseColor.a = mix(1.0, frxLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱/果面片 uv 域不误裁）`,
    );
  };
  material.customProgramCacheKey = () => `fraxinus:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
