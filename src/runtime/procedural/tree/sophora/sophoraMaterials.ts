/**
 * runtime/procedural/tree/sophora/sophoraMaterials —— 国槐（Styphnolobium
 * japonicum (L.) Schott，asset_tree_sophora）叶/皮（含串珠荚果域）/叶影深度材质
 * （T011.9，阔叶族第十材质实例——**一回奇数羽状复叶 SDF（窗列单级化 + 顶生独立
 * 窗位）+ 树皮第 10 语言 + 串珠荚果域**）。
 *
 * 职责：复制九先例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce
 * 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 * <color_fragment> 绝不触碰），物种配方按国槐自己的 Reference Spec 换装——
 * Spec docs/research/sophora-reference.md **1.0**（任务书锚点 1.0，开工前已校验
 * 一致；生产一律以文末「终审记档」④ 裁决十项为唯一事实源：①命名现用名锚定；
 * ②树高 slot-0 ≈10m / 生产域 8–12m / 冠幅比 0.9–1.2；③**花不做**（乳白低对比 +
 * 五信号已足）；④**荚果做**（moniliform 串珠九资产独有 + 8 月起挂枝宿存冬挂 +
 * 9–10 月盛挂期属相内）；⑤荚果主域 2.5–8cm / 珠径 ≈1cm / 每串 3–10 珠 / 珠间
 * 缢缩可见（照片裁定）；⑥树皮第 10 语言定稿（见下）；⑦冠幅比 0.9–1.2 维持；
 * ⑧当年生枝绿色+皮孔（双志 Verified + 照片佐证）；⑨末级枝 zigzag 弱表达记档；
 * ⑩小叶对生或近互生 + 顶生小叶——与 011.10 白蜡对生轴对照）。
 *
 * 【与几何侧的冻结接口（主代理简报冻结，不得偏离）】
 *   - 三工厂签名与 koelreuteria/triadica/bischofia 同构：(level: ProceduralLevel
 *     = 'high') => THREE.MeshStandardMaterial / MeshDepthMaterial；每次调用全部
 *     new（D17）。**三工厂 = 叶 / 皮（含果域）/ 叶影深度**——荚果按冻结接口归组 0
 *     （「荚果：组 0 内、uv 果域标记 v∈[4,5]，triadica 先例」），材质数组序
 *     [皮, 叶]；9 程序键 = 3 工厂 × 3 档（brief「bark/leaf/fruit 三材质」为三视觉
 *     域口径——fruit 域由组 0 皮材质 v 路由承载，第三工厂为深度材质，记档）。
 *   - 复叶卡：v=0 复叶基部（裸轴段）→ v=1 顶端（顶生小叶）；u=0.5 叶轴中轴；
 *     **宽/长比 0.34 冻结**（卡空间半宽 0.17）；1 卡 = 整枚一回奇数羽状复叶
 *     （几何 2 tri）。组 1 aLeafRand ∈ (0,1] 同卡同值、aBend 卡根≈0 尖大。
 *   - 果域（组 0 内）：uv v∈[4,5]（triadica 先例——材质域判据阈值 3.5 = 果域
 *     4.0 下探 0.5 隔离带，皮弧长域 ≤≈2.9 三重隔离同款纪律）；u 自由 = 逐果随机；
 *     珠串几何八面体/低模球归几何侧，材质给色序 + 珠间缢缩暗缝 + 肉质光润；
 *     组 0 aLeafRand/aBend 恒 0（果串刚性——下垂摆动未表达归缺口候选④）。
 *
 * 【一回奇数羽状复叶 SDF——窗列单级化 + 顶生独立窗位（复叶第三型，限定文件内
 *   最小扩展，记缺口候选②）】前九例叶卡语言：夏栎倒卵羽裂 / 朴卵形齿缘 / 樟卵状
 *   椭圆全缘 / 榉卵形锯齿 / 银杏扇形二叉脉 / 悬铃木阔卵掌状裂 / 栾二回羽叶两级
 *   窗列（lift 折叠）/ 乌桕菱形指数充满度 / 重阳木三出三叶场并集。国槐一回奇数
 *   羽状复叶 = **沿轴重复的离散小叶带列 + 顶端单生小叶**——比栾树二回低一级
 *   （无第二级羽片窗列，小叶直接沿叶轴排列），比重阳木放射并集多「多对沿轴」
 *   维度。新路径 = **单级窗列 + 顶生独立窗**：
 *   ① 卡空间折算：物理横坐标 x = (u−0.5)·0.34（长 1 单位、半宽 0.17——宽/长比
 *      0.34 冻结接口）；y = v（0 复叶基 → 1 顶端）。
 *   ② 全叶包络（外层减法域）：0.166·sin(π·v^0.90)^mix(0.88,1.26,ss)——椭圆性
 *      整体剪影（峰 v≈0.48 近中 = 中位小叶最大、两端渐小的真实大小梯度；上段
 *      收口 = 顶生带收束读向；峰值 0.166 恰在卡缘 0.17 内侧 2.4%——卡缘恒裁、
 *      无外溢，JS 锚锁）。
 *   ③ 小叶窗列（单级带列）：yb = y − 0.130 − max(sign(x),0)·space·0.18——带列
 *      自裸轴段上沿起排；**右列降 0.18·space = 近对生**（「小叶 4-7 对，对生或
 *      近互生」FRPS Verified——vs 栾互生侧偏 c=±0.40·len 的相位对生化）；带 =
 *      floor(yb/space+0.5) 最近带；间距 space = 0.098+0.080·rand ∈ [0.098,
 *      0.178] → 有效带数 **4–7 对**（JS run 计数锚实测 4/…/7——生产口径「小叶
 *      4-7 对」的统计实现；间距逐卡 rand 变奏）。
 *   ④ 小叶场：长 len = clamp(0.92·env, 0.050, 0.158)（行包络锚定——中位对最大
 *      0.15、两端渐小至 0.05；tip 留 8% 包络内边距）；卵状披针形包络
 *      sin(π·t^0.84)^mix(1.12, 2.60–3.50 逐叶, ss(0.55,0.85,t))——基 1.12 宽楔
 *      开张（「基部宽楔形或近圆形」Verified）→ 先端强收口（「先端渐尖，具小尖
 *      头」Verified——尾长逐叶统计）；半宽 hw = len·(0.20+0.08·rand)（**小叶
 *      长宽比 1.81–2.46 ∈ 1.7–2.7 Verified 域**，JS 锚）；**基部稍偏斜**：轴偏
 *      c = ±0.45·hw·(1−t)^1.5（「稍偏斜」Verified——偏斜量自小叶基向先端渐伸
 *      直的弱表达）；**全缘零载波**（属级「leaflets many, entire」原句——无齿
 *      载波零锯齿项，JS 单峰性断言锁 + SDF 字符串零 cos 断言锁）。
 *   ⑤ 顶生小叶独立窗位（「奇数」的表达）：v∈[0.815, ~0.97] 中轴竖直叶场——
 *      lenT = 0.154+0.012·rand（≈中位对量级）、同型包络同型偏斜；带列经顶栏
 *      门控在 0.80–0.84 终止 → 顶端只见一枚顶生小叶（vs 侧生对）——奇数羽状
 *      读向的来源；JS 锚：顶生带横向 reach ≥ 0.030（明确宽于叶轴）。
 *   ⑥ 裸轴基段与顶栏双**减法门控**（011.8 修正记档强制——乘法门控负距离 ×0
 *      被钳恰 0 → alpha 恰 0.5 恰过 alphaTest 的伪覆盖）：col − (1−ss(0.09,
 *      0.13,y))·0.10（裸轴段 = 裸叶柄+叶轴，band −1 幻影带压灭）− ss(0.80,
 *      0.84,y)·0.10（顶栏 = 顶生小叶下方窗列终止，第 8+ 幻影对压灭——space
 *      下限时 band 7 以上残余的硬偏置裁切）。JS 锚：裸区 |x|>0.03 命中数 = 0
 *      + 顶栏以上残余 W ≤ 0.005。
 *   ⑦ 叶轴 rachis：0.0040+0.0050·(1−y) 渐细 + 基部 +0.0038 膨大带（「叶柄基部
 *      膨大，包裹着芽」Verified——藏芽结构的卡分辨率微放大；JS 锚 x=0 处
 *      alpha ≥0.5 全 v 连续，叶轴永不裁穿）。
 *   合成：edge = max(叶轴, max(min(包络, 窗列), 顶生窗))——叶轴恒连、窗列在包
 *   络内开窗、顶生窗自界。全 ALU 零噪声（floor/fract/pow——深度材质同源不挂
 *   噪声库的前提）。
 *   ⑧ FXC 预防（011.6 ⑨ / 011.8 ⑦ 前置）：窗列 + 小叶场封装子函数
 *      sopColumn(...)（单返回零 out 参）、顶生窗封装 sopTerminal(...)（同款）、
 *      sopLeafAlpha 主函数体最小化；小叶脉装饰层经共享变量段 SOP_LEAFLET_VARS
 *      与 SDF 同源折算（koe KOE_PINNA_VARS 同款纪律）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - 小叶脉（High，Inferred 弱层——志书无脉句，leaf-b 照片「中脉浅色明显、
 *     侧脉羽状细密」[6]）：每小叶中脉亮带（沿小叶轴自叶轴伸出、先端渐隐）权重
 *     0.26 + 侧脉斜升细脊（sin pow^7 纤细不达缘）0.12 弱层 + 顶生小叶竖直中脉；
 *     中距弱表达不承重。
 *   - **两面色差（加重档——身份特征，Verified 双源）**：上面中绿-亮绿（FRPS
 *     「下面灰白色」反面读向 + leaf-a「上面有光泽中绿」[6]）/ **下面灰白粉绿**
 *     （FRPS「下面灰白色」+ FOC "glaucous"——双源 Verified）：底色 #568a3e
 *     （工程设定——十树亮度链：银杏 > 朴 > 悬 > **国槐** ≈ 栾偏亮 > 重阳木
 *     > 乌桕 > 夏栎 > 榉 > 樟——中绿-亮绿档）；背面 ×(1.16, 1.18, 1.28)（B
 *     显著抬升 = 灰白粉绿读向——家族叶背稍浅链位上加重档：悬 +0.02 档 <
 *     栾柔毛灰绿 < **国槐 glaucous 灰白**——两面色差为近中景身份细节，风翻叶
 *     灰绿闪烁读向）；两面糙度差 +0.06。
 *   - roughness 0.67（「纸质」FRPS Verified——微光泽端：悬厚实 0.66 < 国槐
 *     0.67 < 栾/重阳木纸质 0.70——leaf-a「有光泽」微抬一档）。
 *   - 背光透射 0.325（家族值域内取——纸质细碎小叶透风：悬 0.28 < 朴 0.30 <
 *     重阳木 0.31 < 栾 0.32 < **国槐 0.325** < 乌桕 0.33 < 银杏 0.34）+ 透射
 *     色 (0.56, 0.92, 0.38) 灰绿黄基调；逐叶变奏 ∈[0.55, 1.0]。
 *   - 逐叶变奏 aLeafRand 多通道复用：色相两端冷中绿↔暖黄绿（通道摆幅 ≤15%
 *     纪律）+ 明度 ±8%（去相关取样）+ 带间距 + 尾长 + 偏斜相 + 半宽比 + 透光
 *     变奏（统计近似是家族契约下的最大表达，缺口候选①）。
 *   - **中距单叶自检剖面（细碎域——本树反证 011.8 宽卵法）**：羽状复叶中距离
 *     读向 = 细碎均质绿面（form-a「叶片细碎均匀」[6] + NC 细质 [4]）——SDF 行
 *     宽剖面断言：maxW 全宽 0.265–0.302 ∈ 细碎质域 + 中段缢缩行 ≥6 行（W ≤
 *     0.030——带间仅叶轴可见 = 「细碎」的量化面；vs 重阳木宽卵无腰 W(0.48)
 *     ≥ 0.5·maxW 的连续剖面——两树中距读向互为反例记档）。
 *   - 冠内竖向自遮蔽（冠基 ≈2.6m **工程占位锚**——净干 2–3m Spec §4 域取中；
 *     几何 slot-0 未落盘，Stage 实测后同步轮记缺口候选⑤）+ 中频叶团斑块
 *     （High，波长 ≈0.85m ≈ 团块 1/8–1/15 冠幅——细碎羽叶层叠复合质感 Spec §3
 *     Inferred [6]）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage；坡宽 0.02（小叶间隙级——复叶
 *     卡细一档）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值记档）：整树缓摆 ~0.18Hz / 顶部
 *     ~4.2cm（aSeed 相位，hash 常数 91.523/68.137 与九先例〔sway 77.669–88.217
 *     / flutter 49.337–65.443〕去相关）+ 复叶卡快颤 9–15 rad/s（≈1.4–2.4Hz
 *     中频）/ ≤11mm（**11mm 家族档**——任务简报口径：整枚羽叶中等摆锤，与栾/
 *     重阳木同档中幅）；aBend 权重（卡根≈0 尖大）；**树高锚 10.3413m（×0.09670
 *     单点常量——slot-0 Stage 实测同步〔2026-09-21，011.8 的
 *     9.896m 先例〕）**。
 *
 * 皮（组 0 皮域）配方——**第 10 树皮语言「灰褐-深灰褐深纵裂厚脊沟（板状粗犷）
 *   + 纵为主局部交叉网状 + 散在暗色瘤状突起」**（裁决 6 定稿；vs 九先例：夏栎/
 *   樟深纵裂族、朴平滑浅裂、榉光滑暖剥、银杏灰褐浅纵裂、悬铃木地图剥落三色带、
 *   栾浅色皮孔麻点、乌桕暗灰窄裂碎翘、重阳木褐宽脊扭转）。分化点：①**脊厚沟深
 *   板状**（6 脊/周 = 十树最粗犷档〔vs 重阳木 8 / 乌桕 11 / 樟 7〕+ 板状剖面
 *   smoothstep(0.16,0.42)（窄深沟 + 宽平脊）+ 沟深剖面 0.52（樟 0.50 深 / 重阳
 *   木 0.54——深沟端）+ drift 0.95 适中游走（纵为主——bark-b 双问一致）；②
 *   **老干交叉网状次级层**（bark-a「纵为主局部交叉网状」双问——脊线横断 ×
 *   老干门控 × 局部域门，bischofia 同法）；③**散在暗色瘤状突起**（九资产独有
 *   维度——bark-a/bark-c 照片双源：ALU 网格 hash 稀疏暗点 ≈14% 格、老干强/
 *   中龄弱双门控）；④**沟底红褐不做**（裁决 6——NC 单源、照片双问皆读沟底
 *   深色无红调：沟内冷中性暗 AO ×(0.79,0.78,0.77) 无红向）：
 *   - 主调 #6d675d 灰褐-深灰褐（工程设定——FRPS「树皮灰褐色」Verified + twig-a
 *     「深灰褐纵裂脊」/bark-b「灰褐纵裂沟脊」照片交叉；R−G=6 灰褐向〔vs 重阳
 *     木 R−G=13 褐向〕；十树链：重阳木 < 樟 < **国槐** < 乌桕 < 榉 < 悬 < 栾）。
 *   - 竖向脊沟：裂线游走低频场（1× vnoise 复用为单色微变 ±6%——「灰褐色」
 *     单色系、无剥落无三色带）+ 6 板状厚脊剖面 + 沟内冷中性 AO + 上部弱化门控。
 *   - 老干交叉网状（High）：脊线横断 fissure × 老干门控（低位 × 低弧长 v——
 *     皮管 v = 累计弧长契约注记）× 局部域门（tone 片域）× 微暗 ×(0.87,0.85,
 *     0.84)。
 *   - 瘤突场（High）：22×26 格 ALU hash 抖动、≈14% 格有瘤（散在——「散在暗色
 *     瘤状突起」照片双源）、暗色 ×(0.70,0.68,0.66) × 老干强/中龄弱门控
 *     mix(0.30, 1.0, 老干门)。
 *   - 愈合疤弱表达不单独建场（可选项——并入网状/瘤突层读向记档，裁决 6 低
 *     优先口径）。
 *   - 干基暗化（家族惯例）+ **当年年生枝绿色收敛 + 皮孔两档**（裁决 8——FRPS
 *     「当年生枝绿色，无毛」+ FOC "branches of current year green" 双原句
 *     Verified + fruit-a 照片「绿枝带浅色皮孔」佐证；bischofia 同法）：当年生
 *     v 域绿色收敛 ×(0.86, 1.16, 0.72)、老枝灰褐弱收敛 ×(1.03, 1.00, 0.95)、
 *     皮孔浅色小点两档（40×34 格 58% 有孔——当年生档浅灰白 ×(1.34,1.35,1.28)
 *     / 老枝档弱浅 ×(1.18,1.18,1.14)）。
 *   - 苔藓/地衣不做（bark-c 藓斑低置信不承重——不做不编造，沿先例）；微起伏
 *     已归几何层。
 *
 * 果域（v∈[4,5]，组 0 分支——triadica 先例 + 裁决 4/5）：
 *   - **绿→黄绿→黄褐三档色序**（NC "green ripening to yellow-brown" Verified
 *     [4]——同树多串多代并存 Spec §6 Inferred）：按 u 分档（u = 逐果随机——
 *     几何冻结接口）+ warp 权重倾斜（JS 锚分布绿 ≈32 / 黄绿 ≈36 / 黄褐 ≈32%
 *     ——9–10 月盛挂期混熟读向）+ 档内 ±5% 变奏。
 *   - **珠间缢缩暗缝**（裁决 5「缢缩可见」——照片三源裁定）：沿串坐标 fract
 *     (v−4)·6 珠周期暗带（6 珠/串统计中值——每串 3–10 珠域中段）×(0.74,0.72,
 *     0.68)——几何珠串珠间缝处的材质暗线强化念珠读向；**沿串坐标为材质侧假设**
 *     （几何铺珠相位契约未冻结——错位时降级为果面凹凸纹理，缺口候选③）。
 *   - **肉质光润**（「具肉质果皮」FRPS / "indehiscent, fleshy" FOC Verified：
 *     低 roughness 光泽档 0.45）+ 微透亮感（fruit-a/b/c「微透亮/光滑肉质」[6]
 *     ——High 弱背光透射 0.14 黄绿）；实体着色无裁切（珠为闭合实体）。
 *
 * 深度材质（customDepthMaterial 契约通道——沿 SOP 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5；叶卡 SDF
 *     与叶表面材质共享同一 GLSL 字符串（表面改形深度自动同步，禁复制粘贴）。
 *   - **零噪声库注入**：窗列/小叶场/顶生窗全 ALU → SDF 零 facVnoise 引用 →
 *     深度片元不挂 FACILITY_GLSL_NOISE（樟全缘 + 榉 011.3 组合先例）。保护性
 *     约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 组 0 守卫：皮/果域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本
 *     深度材质时组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例；果域无
 *     需 v 路由——rand=0 即守卫）。
 *   - 档位匹配：Mid = High SDF 同源全形（档间剪影一致——羽状剪影是中距身份，
 *     Spec §7 中距保留面）；Low = SDF_LOW 零窗列版（远距「复叶结构不可辨」
 *     Spec §7 牺牲顺序——包络/叶轴/裸轴门控与 High 逐字同源，去窗列/顶生窗）。
 *   - 风动不进 depth pass（静态影取舍，沿先例）。
 *
 * 分档记档（T011.9，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset
 *   build 路由）：
 *   - 叶 Mid：去小叶脉/叶团 + 糙度叶团项（Spec §7 叶脉仅近距可辨；**SDF 全形
 *     含窗列/顶生窗保留——档间剪影一致：羽状剪影是中距身份**），透光/叶背/
 *     hue·luma/shade/两面糙度差保留；叶 Low：SDF 换 SOP_LEAF_SDF_LOW（去窗列
 *     ——复叶细化；包络/叶轴/裸轴门控逐字同源）+ 去透光；片元零噪声。
 *   - 皮 Mid：去老干网状/瘤突/皮孔点（近景细节层）；脊沟板状/沟内 AO/干基暗化/
 *     细枝两档保留——中距「灰褐深纵裂厚脊 + 冠缘绿细枝」身份（Spec §7 中距
 *     保留面）；皮 Low：再去干基暗化/老枝褐档（低调项）；脊沟 + 沟内 AO +
 *     当年生绿档保留（远距「深纵裂剪影」保留面）；1× vnoise。
 *   - 果域：三档同体色序 + 缢缩暗缝（中距身份信号——串珠剪影）；肉质光泽档
 *     逐档微升（0.45/0.48/0.50）；微透亮 High 专属。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；sophora 前缀不与九先例混
 *     缓存）：'sophora:leaf' / ':mid' / ':low'；'sophora:bark' …；
 *     'sophora:leaf-depth' …（9 键全异）。
 *   - 风动（SOP_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团）= 3× + 单级窗列 SDF ALU（sopColumn+
 *     sopTerminal ≈ 40 flop ≈ 4×——复叶第三型的账，与栾两级窗列 4.5× / 重阳木
 *     三叶并集 4× 同档）+ 小叶脉 ≈ 1.5× + 透光/两面/hue ≈ 2× ≈ **10.5×**；
 *     叶 Mid ≈ 8×（0 噪声 + SDF 全形）；叶 Low ≈ 3.5×（单包络）；
 *   - 皮 High 片元（两域取最重路径）= 皮路径 2× vnoise（游走场 + 网状/域门场）
 *     = 6× + 脊沟/网状/瘤突/皮孔 ALU ≈ 2× ≈ **8×** / 果路径纯 ALU ≈ 1.5×
 *     ——域互斥执行，最重 ≈ 8×；皮 Mid/Low = 1× vnoise ≈ 4.5×；
 *   - 深度片元 = 单级窗列 SDF 纯 ALU ≈ 4×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——单级窗列/顶生窗/
 * 瘤突场/珠缝周期全部限定文件内）：
 *   ① 带间距/尾长/偏斜相/半宽比/透光共用 aLeafRand 单属性统计近似（多通道复用
 *      同一 rand——变奏间相关性无法表达；家族共有缺口）；**小叶独立颤动不可表
 *      达**（整卡同摆——需 per-leaflet 顶点通道；koe ①/重 ③ 同型家族缺口）；
 *   ② 一回奇数羽状「单级窗列 + 顶生独立窗」SDF：本文件内实现（复叶第三型）；
 *      复叶三型到齐（栾二回两级窗列 / 重阳木三叶并集 / 国槐一回单级窗列）——
 *      011.10 白蜡（羽状对生轴对照，裁决 10）后族级「复叶 SDF 公共模式」提炼
 *      评估（沿 koe ② / 重 ②）；
 *   ③ 荚果珠间缢缝的沿串坐标假设：fract(v−4)·6 珠周期为材质侧统计中值——几何
 *      侧珠串若非沿 v 等距铺珠/珠数非 6 则缝错位（降级果面凹凸纹理读向，不破
 *      串珠剪影）；需几何侧铺珠相位契约冻结；
 *   ④ 果序下垂摆动（「念珠串自枝下垂挂」fruit-a 读向）组 0 aBend≡0 未表达
 *      ——附加元素无独立形变通道（恰 2 组冻结的连带限制，koe ③ 同型）；
 *   ⑤ 冠基 2.6m 材质侧工程锚（slot-0 未实测——净干 2–3m Spec §4 域取中；树高
 *      锚已 2026-09-21 Stage 实测同步 10.3413m〔011.8 9.896m 同款流程〕；与
 *      profile 侧无联动通道——家族缺口，triadica ⑤ 同型）；
 *   ⑥ 瘤突/网状/皮孔的干龄判别以「高度 × 弧长 v」双门控近似（皮管 v = 累计
 *      弧长契约注记——细枝管 v 小，bischofia ⑥ 同型）；小托叶 2 枚钻状/藏芽
 *      微结构卡分辨率不可辨（Spec §7 牺牲顺序首位记档）。
 *
 * X4000 口径（011.6 终裁带入）：console X4000 警告若复现 = FXC 数据流保守误报
 *   预期口径——直接接受记档一次即止，不逐树变体消元追逐（归 011.13 复叶系议
 *   题）；GLSL 全路径初始化运行零错误为准（sopColumn/sopTerminal 单返回零
 *   out 参、全变量单赋值初始化）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；
 *   零贴图/零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV
 *   普通 Mesh 无该属性，WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除
 *   法无 NaN；与九先例的通用段（风动公式等）为复制改造非 import（资产私有，
 *   跨资产不耦合——organization.md 边界）。
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
  if (!source.includes(target)) throw new Error(`sophora 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 复叶卡快颤（aBend 权重，组 0 恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值记档：
 * hash 常数 91.523/68.137（与九先例相位流〔sway 77.669–88.217 / flutter
 * 49.337–65.443〕去相关）+ 树高锚 10.3413m（×0.09670——slot-0 精确涌现实测锚
 * 〔Stage 代理探针 10.34133243560791，2026-09-21 同步——缩放抖动下权重近似〕）；缓摆
 * ~0.18Hz / 顶部 ~4.2cm；快颤 9–15 rad/s（≈1.4–2.4Hz 中频）/ ≤11mm（11mm
 * 家族档——任务简报口径：整枚羽叶中等摆锤，与栾/重阳木同档中幅）。
 */
const SOP_WIND = /* glsl */ `
// sophora wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float sopWindPhase = fract(sin(aSeed * 91.523 + 4.9) * 43758.5453);
float sopWindH = clamp(position.y * 0.09670, 0.0, 1.0); // /10.3413m 精确涌现实测锚（Stage 代理 slot-0 探针 10.34133243560791，2026-09-21 同步——缩放抖动下权重近似，011.8 9.896m 先例）
float sopSway = sopWindH * sopWindH * 0.042 * sin(uTime * 1.15 + sopWindPhase * 6.28318 + sopWindH * 1.4);
// 复叶卡快颤：ω = 9 + 6φ（9–15 rad/s ≈ 1.4–2.4Hz 中频），幅度 ≤11mm 家族档（整枚羽叶中等摆锤——与栾/重阳木同档）；权重 = aBend（卡根≈0 尖大）
float sopFlutterPhase = fract(sin((aSeed + aLeafRand) * 68.137 + 7.3) * 43758.5453);
float sopFlutter = aBend * 0.011 * sin(uTime * (9.0 + 6.0 * sopFlutterPhase) + sopFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (sopSway + sopFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(sopSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * sopFlutter * 0.9; // 叶面沿卡法线微扑（组 0 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const SOP_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 一回奇数羽状复叶 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────

/**
 * 小叶窗列变量段（单级带列 + 小叶场——到偏斜量）：单一来源——SDF 子函数
 * sopColumn 与叶面小叶脉装饰层两处展开共享同一字符串（koe KOE_PINNA_VARS 同款
 * 纪律）。依赖作用域内已有 sopX/sopY/sopA/sopEnv/sopRand。
 */
const SOP_LEAFLET_VARS = /* glsl */ `
  // 小叶窗列（单级带列——沿叶轴 v）：yb = y − 0.130 − 右列降 0.18·space（「对生或近互生」FRPS Verified——对生主力 + 近对生右偏相位）
  float sopSpace = 0.098 + 0.080 * fract(sopRand * 5.713 + 0.31); // 间距逐卡变奏 → 有效带数 4–7 对（JS run 计数锚）
  float sopYb = sopY - 0.130 - max(sign(sopX), 0.0) * sopSpace * 0.18;
  float sopBandT = sopYb / sopSpace;
  float sopBandIdx = floor(sopBandT + 0.5);
  float sopL = (sopBandT - sopBandIdx) * sopSpace; // 距最近带中心有符号侧偏（沿 v）
  // 小叶场：长 = 0.92×行包络（中位对最大 0.15、两端渐小至 0.05——tip 留 8% 包络内边距）
  float sopLen = clamp(0.92 * sopEnv, 0.050, 0.158);
  float sopTc = clamp(sopA / sopLen, 0.001, 0.999); // 沿小叶轴
  float sopEnvSinL = sin(3.14159 * pow(sopTc, 0.84)); // 峰 t≈0.445 偏基（「卵状披针形或卵状长圆形」首列 Verified）
  float sopEnvExpL = mix(1.12, 2.60 + 0.90 * fract(sopRand * 4.731 + 0.27), smoothstep(0.55, 0.85, sopTc)); // 基 1.12 宽楔开张（「基部宽楔形或近圆形」）→ 先端 2.60–3.50 强收口（「先端渐尖，具小尖头」Verified——尾长逐叶统计）
  float sopEnvNL = pow(sopEnvSinL, sopEnvExpL);
  float sopHw = sopLen * (0.20 + 0.08 * fract(sopRand * 6.117 + 0.19)); // 小叶半宽（长宽比 1.81–2.46 ∈ 1.7–2.7 Verified 域）
  float sopObk = (fract(sopRand * 3.317 + 0.53) - 0.5) * 0.9; // 基部稍偏斜 ±0.45（「稍偏斜」Verified——逐叶相位）
  float sopC = sopObk * sopHw * pow(1.0 - sopTc, 1.5); // 偏斜量自小叶基向先端渐伸直
`;

/**
 * 国槐一回奇数羽状复叶卡覆盖率（uv：u 横 0–1、v 沿主轴 0 复叶基 → 1 顶端；
 * 宽/长比 0.34 冻结接口）：**单级窗列 + 顶生独立窗**（复叶第三型新路径——见
 * 模块头方法记档）。合成 edge = max(叶轴, max(min(包络, 窗列 − 双减法门控),
 * 顶生窗))——窗列带**减法门控**两道（裸轴基段 + 顶栏：负距离判弃——011.8 乘法
 * 门控伪覆盖教训的强制形态）；**零 facVnoise 引用是深度材质不挂噪声库的前提
 * （引入即深度编译暴雷——保护性约束）**；返回近似符号距离的覆盖率坡（edge/
 * 0.02——坡宽 0.02 小叶间隙级，alphaToCoverage 承担 AA）。
 */
const SOP_LEAF_SDF = /* glsl */ `
// 窗列子函数（FXC X4000 数据流误报规避——011.6 ⑨/011.8 ⑦ 前置）：小叶带列 + 小叶场
// 整体封装，单返回值零 out 参；主函数体随之最小化。数学逐位等价——纯函数引用透明。
float sopColumn(float sopX, float sopY, float sopEnv, float sopRand) {
  float sopA = abs(sopX);
${SOP_LEAFLET_VARS}
  return sopHw * sopEnvNL - abs(sopL - sopC); // 小叶场（全缘零载波——属级 leaflets entire 原句）
}
// 顶生小叶独立窗位（「奇数」的表达——奇数羽状顶端单生；同型包络/同型偏斜，竖直轴）
float sopTerminal(float sopX, float sopY, float sopRand) {
  float sopLenT = 0.154 + 0.012 * fract(sopRand * 2.913 + 0.44);
  float sopTt = clamp((sopY - 0.815) / sopLenT, 0.001, 0.999);
  float sopEnvSinT = sin(3.14159 * pow(sopTt, 0.84));
  float sopEnvExpT = mix(1.12, 2.60 + 0.90 * fract(sopRand * 4.731 + 0.27), smoothstep(0.55, 0.85, sopTt));
  float sopEnvNT = pow(sopEnvSinT, sopEnvExpT);
  float sopHwT = sopLenT * (0.22 + 0.07 * fract(sopRand * 6.117 + 0.19));
  float sopObkT = (fract(sopRand * 3.317 + 0.53) - 0.5) * 0.9;
  float sopCT = sopObkT * sopHwT * pow(1.0 - sopTt, 1.5);
  return sopHwT * sopEnvNT - abs(sopX - sopCT);
}
float sopLeafAlpha(vec2 sopUv, float sopRand) {
  vec2 sopP = vec2(sopUv.x - 0.5, sopUv.y);
  float sopX = sopP.x * 0.34; // 物理横坐标（长 1 单位、半宽 0.17——宽/长比 0.34 冻结接口）
  float sopY = sopP.y;
  float sopA = abs(sopX);
  // 全叶包络：椭圆性整体剪影（峰 v≈0.48 近中 = 中位小叶最大；峰值 0.166 恰在卡缘内侧——卡缘恒裁 JS 锚）
  float sopEnvSin = sin(3.14159 * pow(clamp(sopY, 0.001, 0.999), 0.90));
  float sopEnv = 0.166 * pow(sopEnvSin, mix(0.88, 1.26, smoothstep(0.30, 0.92, sopY)));
  float sopEnvEdge = sopEnv - sopA;
  // 叶轴 rachis：渐细 + 基部膨大带（「叶柄基部膨大，包裹着芽」Verified——藏芽结构微放大；JS 锚 x=0 全 v 连续）
  float sopRachisEdge = 0.0040 + 0.0050 * (1.0 - sopY) + 0.0038 * (1.0 - smoothstep(0.0, 0.07, sopY)) - sopA;
  // 窗列 + 双减法门控（011.8 教训强制形态——负距离判弃，非乘法钳 0）：
  // 裸轴基段（band −1 幻影带压灭）+ 顶栏（顶生小叶下方窗列终止——space 下限时第 8+ 幻影对压灭）
  float sopCol = sopColumn(sopX, sopY, sopEnv, sopRand)
    - (1.0 - smoothstep(0.09, 0.13, sopY)) * 0.10
    - smoothstep(0.80, 0.84, sopY) * 0.10;
  float sopTermEdge = sopTerminal(sopX, sopY, sopRand);
  float sopEdge = max(sopRachisEdge, max(min(sopEnvEdge, sopCol), sopTermEdge));
  return clamp(sopEdge / 0.02 + 0.5, 0.0, 1.0); // 坡宽 0.02（小叶间隙级——alphaToCoverage AA）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档
 * 取用）：包络 + 叶轴即可——去窗列/顶生窗（**复叶细化**：远距复叶结构不可辨
 * Spec §7 牺牲顺序；片元零噪声先天成立）。包络/叶轴/裸轴门控与 High 逐字同源
 * （档间叶形身份一致的去细节不改形原则——远距保留羽叶层叠轮廓色块）。JS 锚：
 * Low 最宽行与 High 外廓差 ∈[−0.010, +0.038]（带列相位错过包络峰的固有差——
 * 带间离散结构，宽于单叶先例 ±0.025 带的记档理由；LOD 切换无跳变量级）。
 */
const SOP_LEAF_SDF_LOW = /* glsl */ `
float sopLeafAlpha(vec2 sopUv, float sopRand) {
  vec2 sopP = vec2(sopUv.x - 0.5, sopUv.y);
  float sopA = abs(sopP.x * 0.34); // （与 High 逐字同源折算）
  float sopY = sopP.y;
  float sopEnvSin = sin(3.14159 * pow(clamp(sopY, 0.001, 0.999), 0.90)); // 包络（与 High 逐字同源）
  float sopEnv = 0.166 * pow(sopEnvSin, mix(0.88, 1.26, smoothstep(0.30, 0.92, sopY)));
  float sopEdge = max(0.0040 + 0.0050 * (1.0 - sopY) + 0.0038 * (1.0 - smoothstep(0.0, 0.07, sopY)),
    sopEnv - (1.0 - smoothstep(0.09, 0.13, sopY)) * 0.10) - sopA; // 叶轴 ∪ 包络 − 裸轴减法门控（去窗列/顶生窗——sopRand 保留双参签名沿家族契约、Low 不用）
  return clamp(sopEdge / 0.02 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/小叶脉——叶团乘子 0.94+0.12×sopClump 均值化 = 1.0 消去，值噪声均值
 *  0.5 精确保均）。 */
const SOP_LEAF_HEAD = /* glsl */ `
// sophora:leaf —— 一回奇数羽状复叶 SDF 裁切 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float sopAlpha = sopLeafAlpha(vUv, vLeafRand);
diffuseColor.a = sopAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷中绿 ↔ 暖黄绿——Spec §5 上面中绿-亮绿 + §6 变体读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 sopHue = mix(vec3(0.95, 1.00, 1.03), vec3(1.05, 1.05, 0.93), fract(vLeafRand * 7.213 + 0.29));
float sopLuma = 0.92 + 0.16 * fract(vLeafRand * 4.417 + 0.51);
`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const SOP_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.85m ≈ 团块 1/8–1/15 冠幅——细碎羽叶层叠复合质感 Spec §3
// Inferred [6]；采样偏移与九先例去相关）
float sopClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.67, vTreePos.y - vTreePos.z * 0.71) * 1.16 + vec2(45.7, 25.9));
`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const SOP_LEAF_SHADE = /* glsl */ `
float sopShade = clamp((vTreePos.y - 2.6) / 2.4, 0.0, 1.0); // 冠基 ≈2.6m 工程占位锚（净干 2–3m Spec §4 域取中——slot-0 未实测，Stage 同步轮记缺口候选⑤）；带宽 2.4 = 家族 2.8 × 冠深比（2.8×8.5/10）`;

/** High 专属：小叶羽状脉（中脉亮带 + 侧脉细脊，纯 ALU 零采样）。
 *  坐标段与 SDF 共享（SOP_LEAFLET_VARS 同源折算——同名单不同作用域，koe 装饰层同款纪律）。 */
const SOP_LEAF_VEIN = /* glsl */ `
// 小叶羽状脉（leaf-b「中脉浅色明显、侧脉羽状细密」[6]——Inferred 弱层，志书无脉句；中距弱表达不承重）：
// 每小叶中脉亮带（沿小叶轴自叶轴伸出、先端渐隐）+ 侧脉斜升细脊（sin pow^7 纤细不达缘）+ 顶生小叶竖直中脉
float sopX = (vUv.x - 0.5) * 0.34;
float sopY = vUv.y;
float sopRand = vLeafRand;
float sopA = abs(sopX);
float sopEnvSin = sin(3.14159 * pow(clamp(sopY, 0.001, 0.999), 0.90));
float sopEnv = 0.166 * pow(sopEnvSin, mix(0.88, 1.26, smoothstep(0.30, 0.92, sopY)));
${SOP_LEAFLET_VARS}
float sopVMid = (1.0 - smoothstep(0.006, 0.020, abs(sopL - sopC))) * smoothstep(0.02, 0.10, sopTc) * (1.0 - smoothstep(0.72, 0.90, sopTc)); // 小叶中脉（先端渐隐）
float sopVLat = pow(max(0.0, sin(sopTc * 46.0 - abs(sopL - sopC) * 92.0 + (sopRand - 0.5) * 0.8)), 7.0)
  * smoothstep(0.004, 0.014, abs(sopL - sopC)) * smoothstep(0.10, 0.22, sopTc) * (1.0 - smoothstep(0.70, 0.86, sopTc)); // 侧脉斜升脊族（避开中脉带、纤细不达缘）
float sopVMidT = (1.0 - smoothstep(0.006, 0.020, sopA)) * smoothstep(0.83, 0.86, sopY) * (1.0 - smoothstep(0.93, 0.965, sopY)); // 顶生小叶竖直中脉
float sopVMidAll = max(sopVMid, sopVMidT);
`;

/** High 专属：合成（叶团乘子 + 小叶脉调制） */
const SOP_LEAF_MUL_HIGH = /* glsl */ `
vec3 sopMul = sopHue * sopLuma * (0.80 + 0.20 * sopShade) * (0.94 + 0.12 * sopClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
sopMul = mix(sopMul, sopMul * vec3(1.42, 1.36, 1.04), sopVMidAll * 0.26 + sopVLat * 0.12); // 小叶脉弱表达 0.26/0.12（中脉浅色身份层 + 侧脉细密弱层）
diffuseColor.rgb *= sopMul;
`;

/** Mid/Low：合成（去叶团/小叶脉——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const SOP_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 sopMul = sopHue * sopLuma * (0.80 + 0.20 * sopShade); // Mid/Low：叶团乘子均值化消去（T011.9）
diffuseColor.rgb *= sopMul;
`;

/** 叶背灰白粉绿（三档共用，纯 ALU 零采样零分支） */
const SOP_LEAF_BACK = /* glsl */ `
// 叶背灰白粉绿（**两面色差加重档——身份特征，Verified 双源**：FRPS「下面灰白色」+ FOC
// "glaucous"）：gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，背面法线由
// three 双面光照自动翻转，此处只调固有色）——背面 ×(1.16, 1.18, 1.28)（B 显著抬高于
// R/G = 灰白粉绿读向；家族叶背稍浅链位上加重档：悬 +0.02 弱差 < 栾柔毛灰绿 < **国槐
// glaucous 灰白**——风翻叶灰绿闪烁读向）；两面糙度差 +0.06（见 roughnessmap 注入）；
// 纯 ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.16, 1.18, 1.28), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  家族值域内取：纸质细碎小叶透风（0.325——悬 0.28 < 朴 0.30 < 重阳木 0.31 < 栾 0.32
 *  < 国槐 0.325 < 乌桕 0.33 < 银杏 0.34）。 */
const SOP_LEAF_TRANSLUCENCY = /* glsl */ `
// sophora:leaf —— 背光透射（家族值域内取）：视线与阳光反向时叶背透亮灰绿黄（叶绿素吸收
// 红蓝 → 透射偏黄绿；纸质细碎小叶透风透光——峰值 0.325，Spec §2「纸质」Verified；
// 小叶间隙透空由 SDF alpha 承担）
#if NUM_DIR_LIGHTS > 0
  float sopBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float sopTransVar = 0.55 + 0.45 * fract(vLeafRand * 7.613 + 0.51); // 逐叶透光强度变奏
  outgoingLight += vec3(0.56, 0.92, 0.38) * directionalLights[0].color
    * pow(sopBack, 3.0) * sopTransVar * sopAlpha * 0.325;
#endif
`;

// ── 组 0（皮+果）配方主体（<map_fragment> 后注入；uv 域身份分支 3.5）────────────────

/** 皮域：裂线游走 + 6 板状厚脊剖面 + 上部门控（三档共用——Low 保留面的唯一采样：裂线游走） */
const SOP_BARK_WARP = /* glsl */ `
// 裂线游走低频场（1× vnoise 复用为单色微变 ±6%——「树皮灰褐色」单色系无剥落；drift 0.95 适中 = 纵为主）
float sopWarp = facVnoise(vec2(vUv.x * 2.3, vUv.y * 1.15) + vec2(53.1, 31.7));
// 6 板状厚脊/周（十树最粗犷档——vs 重阳木 8 / 乌桕 11 / 樟 7；bark-a/b「脊宽厚沟深、板状粗厚脊」双问照片源）
float sopTri = abs(fract(vUv.x * 6.0 + sopWarp * 0.95) * 2.0 - 1.0);
float sopPlate = smoothstep(0.16, 0.42, sopTri); // 板状剖面（窄深沟 + 宽平脊——「脊厚沟深板状粗犷」读向）
sopBarkSmooth = smoothstep(2.8, 5.2, vTreePos.y); // 干上部弱化门控（赋值域变量——domainVars 预声明，roughness 注入跨 include 消费）
float sopRidge = mix(0.52 + 0.48 * sopPlate, 0.90 + 0.10 * sopPlate, sopBarkSmooth); // 沟深剖面（深——vs 重阳木 0.54 中深 / 樟 0.50 深）+ 上部弱化
`;

/** 网状/域门场（High 专属采样——老干网状层与局部域门的共享场） */
const SOP_BARK_TONE = /* glsl */ `
float sopTone = facVnoise(vec2(vUv.x * 2.1, vUv.y * 1.8) + vec2(37.3, 23.9)); // 网状/瘤突局部域门场（High 专属）`;

/** 老干交叉网状次级层（High 专属近景——脊线横断 × 老干门控 × 局部域门，bischofia 同法） */
const SOP_BARK_NET = /* glsl */ `
// 老干交叉网状（bark-a「纵为主局部交叉网状」双问一致——裁决 6 定稿项）：脊线横断 fissure 族
// （游走 + 脊相位调制）× 老干门控（低位 × 低弧长 v——皮管 v = 累计弧长契约注记〔细枝管 v 小，缺口候选⑥〕）
// × 局部域门（tone 片域——非通干）
float sopNet = (1.0 - smoothstep(0.05, 0.22, abs(fract(vUv.y * 2.3 + sopWarp * 0.55 + sopTri * 0.20) - 0.5)))
  * smoothstep(0.44, 0.62, sopTone) * (1.0 - smoothstep(1.7, 3.2, vTreePos.y)) * (1.0 - smoothstep(1.4, 2.2, vUv.y));
`;

/** 散在暗色瘤状突起场（High 专属近景——九资产独有维度，裁决 6 定稿项） */
const SOP_BARK_BUMP = /* glsl */ `
// 瘤突场（bark-a「瘤状突起」/bark-c「密布暗色小瘤突」照片双源——散在）：22×26 格 ALU hash
// 抖动、≈14% 格有瘤（step 0.86 稀疏门——散在非密布）；老干强/中龄弱双门控（mix 0.30–1.0）
vec2 sopBc = vec2(vUv.x * 22.0, vUv.y * 26.0);
vec2 sopBId = floor(sopBc);
float sopBR = fract(sin(dot(sopBId, vec2(127.1, 311.7)) + 29.7) * 43758.5453);
vec2 sopBF = fract(sopBc) - 0.5 - (vec2(fract(sopBR * 7.31), fract(sopBR * 3.17)) - 0.5) * 0.52;
float sopBumpOld = (1.0 - smoothstep(1.9, 3.4, vTreePos.y)) * (1.0 - smoothstep(1.5, 2.4, vUv.y)); // 老干门（低位 × 低弧长）
float sopBump = (1.0 - smoothstep(0.08, 0.24, length(sopBF))) * step(0.86, sopBR);
`;

/** 干基暗化（High/Mid 共用——低调项，Low 随段去） */
const SOP_BARK_BASEDARK = /* glsl */ `
float sopBarkBase = 1.0 - smoothstep(0.5, 2.4, vTreePos.y); // 干基暗带门控（家族惯例——老干深裂暗带读向）`;

/** 细枝绿色-灰褐过渡门控（三档共用——结构剪影项） */
const SOP_BARK_TWIG = /* glsl */ `
// 细枝段门控（v 低弧长域——「细枝管 v 小」几何契约注记 × 冠缘高位双门控）：当年生枝绿 / 老枝灰褐两档
float sopTwigHi = smoothstep(6.0, 8.0, vTreePos.y) * (1.0 - smoothstep(0.45, 0.95, vUv.y));
float sopTwigMid = smoothstep(4.6, 6.0, vTreePos.y) * (1.0 - smoothstep(0.40, 0.90, vUv.y));
`;

/** 皮孔点场（High 专属近景——ALU 网格 hash，细枝域点缀；浅色两档） */
const SOP_BARK_LENTICEL = /* glsl */ `
// 皮孔浅色小点两档（裁决 8——FRPS「当年生枝绿色」+ FOC "branches of current year green" 双原句
// Verified + fruit-a「绿枝带浅色皮孔」照片佐证）：40×34 格 hash 抖动、58% 格有孔
// （step 0.42——细枝域中等密度）；两档分色在 MUL（当年生浅灰白 / 老枝弱浅）
vec2 sopLc = vec2(vUv.x * 40.0, vUv.y * 34.0);
vec2 sopLId = floor(sopLc);
float sopLR = fract(sin(dot(sopLId, vec2(127.1, 311.7)) + 19.3) * 43758.5453);
vec2 sopLF = fract(sopLc) - 0.5 - (vec2(fract(sopLR * 7.31), fract(sopLR * 3.17)) - 0.5) * 0.48;
sopLenticel = (1.0 - smoothstep(0.09, 0.19, length(sopLF))) * step(0.42, sopLR) * max(sopTwigHi, sopTwigMid * 0.8); // 赋值域变量（跨 include 供 roughness 消费——块内不重声明防遮蔽）
`;

/** High：合成（基底灰褐微变 + 沟内冷中性 AO + 老干网状 + 瘤突 + 干基暗化 + 细枝两档 + 皮孔两档） */
const SOP_BARK_MUL = /* glsl */ `
vec3 sopBarkMul = vec3(sopRidge) * (0.93 + 0.12 * sopWarp); // 基底灰褐单色微变 ±6%（「树皮灰褐色」FRPS Verified——无剥落无三色带；vec3(sopRidge) 显式广播——011.8 编译事故修复形态）
sopBarkMul *= mix(vec3(0.79, 0.78, 0.77), vec3(1.03, 1.02, 1.00), smoothstep(0.10, 0.55, sopTri)); // 沟内冷中性暗 AO（沟底深色无红调——裁决 6：沟底红褐不做）
sopBarkMul *= mix(vec3(1.0), vec3(0.87, 0.85, 0.84), sopNet * 0.8); // 老干交叉网状微暗（纵为主局部交叉）
sopBarkMul *= mix(vec3(1.0), vec3(0.70, 0.68, 0.66), sopBump * mix(0.30, 1.0, sopBumpOld)); // 散在暗色瘤突（老干强/中龄弱——九资产独有维度）
sopBarkMul *= mix(vec3(1.0), vec3(0.88, 0.87, 0.88), sopBarkBase * 0.7); // 干基暗化（家族惯例低调项）
sopBarkMul = mix(sopBarkMul, sopBarkMul * vec3(0.86, 1.16, 0.72), sopTwigHi * 0.75); // 当年生枝绿色收敛（双志 Verified——近景身份点）
sopBarkMul = mix(sopBarkMul, sopBarkMul * vec3(1.03, 1.00, 0.95), sopTwigMid * 0.35); // 老枝灰褐弱收敛
sopBarkMul *= mix(vec3(1.0), mix(vec3(1.18, 1.18, 1.14), vec3(1.34, 1.35, 1.28), sopTwigHi), sopLenticel * 0.85); // 皮孔两档：老枝弱浅 ↔ 当年生浅灰白（fruit-a 佐证）
diffuseColor.rgb *= sopBarkMul;
`;

/** Mid：合成（去老干网状/瘤突/皮孔点——近景细节层；脊沟板状/沟内 AO/干基暗化/细枝两档保留） */
const SOP_BARK_MUL_MID = /* glsl */ `
vec3 sopBarkMul = vec3(sopRidge) * (0.93 + 0.12 * sopWarp); // 基底灰褐微变保留（中距「灰褐」色块身份）
sopBarkMul *= mix(vec3(0.79, 0.78, 0.77), vec3(1.03, 1.02, 1.00), smoothstep(0.10, 0.55, sopTri)); // 沟内冷中性 AO（深纵裂厚脊中距两带）
sopBarkMul *= mix(vec3(1.0), vec3(0.88, 0.87, 0.88), sopBarkBase * 0.7); // 干基暗化保留
sopBarkMul = mix(sopBarkMul, sopBarkMul * vec3(0.86, 1.16, 0.72), sopTwigHi * 0.75); // 细枝绿过渡保留（冠缘绿细枝中距读向）
sopBarkMul = mix(sopBarkMul, sopBarkMul * vec3(1.03, 1.00, 0.95), sopTwigMid * 0.35);
diffuseColor.rgb *= sopBarkMul;
`;

/** Low：合成（再去干基暗化/老枝灰褐档——低调项；脊沟 + 沟内 AO + 当年生绿档保留） */
const SOP_BARK_MUL_LOW = /* glsl */ `
vec3 sopBarkMul = vec3(sopRidge) * (0.93 + 0.12 * sopWarp); // 脊沟板状基底（远距「灰褐深纵裂剪影」保留面）
sopBarkMul *= mix(vec3(0.79, 0.78, 0.77), vec3(1.03, 1.02, 1.00), smoothstep(0.10, 0.55, sopTri)); // 沟内 AO（纵裂两带剪影）
sopBarkMul = mix(sopBarkMul, sopBarkMul * vec3(0.86, 1.16, 0.72), sopTwigHi * 0.75); // 当年生绿档（结构剪影项三档保留）
diffuseColor.rgb *= sopBarkMul;
`;

/** 果域体（三档共用——串珠荚果：绿→黄绿→黄褐三档色序 + 珠间缢缩暗缝） */
const SOP_FRUIT_BODY = /* glsl */ `
  // 果域（v∈[4,5]）：串珠状肉质荚果（裁决 4 做/裁决 5 主域）——绿→黄绿→黄褐三档色序
  // （NC "green ripening to yellow-brown" Verified [4]；同树多串多代并存 Spec §6 Inferred）；
  // u = 逐果随机（几何冻结接口）；warp 权重倾斜（JS 锚 ≈32/36/32%——9–10 月盛挂混熟读向）
  float sopFu = clamp(vUv.x + 0.06 * sin(6.28318 * (vUv.x - 0.2)), 0.0, 0.999);
  float sopFBin = floor(sopFu * 3.0);
  vec3 sopFruit = mix(mix(vec3(0.50, 0.62, 0.26), vec3(0.63, 0.71, 0.31), step(0.5, sopFBin)), vec3(0.67, 0.58, 0.30), step(1.5, sopFBin));
  // 珠间缢缩暗缝（裁决 5「缢缩可见」照片三源裁定）：沿串坐标 fract(v−4)·6 珠周期暗带
  // （6 珠/串统计中值——每串 3–10 珠域中段；沿串坐标为材质侧假设，几何铺珠相位契约未冻结——缺口候选③）
  float sopBeadPh = fract((vUv.y - 4.0) * 6.0);
  float sopSeam = 1.0 - smoothstep(0.015, 0.09, min(sopBeadPh, 1.0 - sopBeadPh));
  diffuseColor.rgb = sopFruit * (0.94 + 0.10 * fract(vUv.x * 29.7)) * mix(vec3(1.0), vec3(0.74, 0.72, 0.68), sopSeam); // 档内 ±5% 变奏 + 缢缩暗线
`;

/** 果域微透亮（High 专属——肉质微透；<opaque_fragment> 前注入，域门控 v≥3.5） */
const SOP_FRUIT_TRANSLUCENCY = /* glsl */ `
// sophora:bark —— 果域肉质微透亮（fruit-a/b/c「微透亮/光滑肉质」[6]——弱背光 0.14 黄绿，域门控 v≥3.5）
#if NUM_DIR_LIGHTS > 0
  if (vUv.y >= 3.5) {
    float sopFBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
    outgoingLight += vec3(0.72, 0.86, 0.50) * directionalLights[0].color * pow(sopFBack, 2.5) * 0.14;
  }
#endif
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 复叶卡材质（组 1）：一回奇数羽状复叶单级窗列 SDF alphaTest 裁切 + 小叶脉（High）
 * + 两面 glaucous 加重差 + 家族值域透光 + 逐叶变奏 + 风动。level 分档（T011.9，
 * 缺省 'high'）：Mid 去小叶脉/叶团/糙度叶团项（Spec §7 叶脉仅近距可辨；**SDF
 * 全形含窗列/顶生窗保留——档间剪影一致：羽状剪影是中距身份**），透光/叶背/
 * hue·luma/shade/两面糙度差保留；Low 换 SOP_LEAF_SDF_LOW（去窗列——复叶细化；
 * 包络/叶轴/裸轴门控与 High 逐字同源）+ 去透光，片元零噪声采样。风动三档同源
 * 不动（SOP_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：中绿-亮绿 #568a3e（工程设定——Spec §5 上面中绿-亮绿〔FRPS「下面灰白
 * 色」反面读向 + leaf-a「有光泽中绿」[6] 交叉〕；十树亮度链：银杏 > 朴 > 悬 >
 * **国槐** ≈ 栾偏亮 > 重阳木 > 乌桕 > 夏栎 > 榉 > 樟）/ m 0 / r 0.67（「纸质」
 * FRPS Verified 微光泽端：悬厚实 0.66 < 0.67 < 栾/重阳木 0.70）/ DoubleSide
 * （卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createSophoraLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x568a3e, // 中绿-亮绿（工程设定：Spec §5 + leaf-a [6] 交叉——十树链栾偏亮一档；中距色块与栾中绿/重阳木中绿偏深区分）
    metalness: 0,
    roughness: 0.67, // 纸质微光泽（「纸质」FRPS Verified 取微光泽端——leaf-a「有光泽」）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 复叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? SOP_LEAF_SDF_LOW : SOP_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含窗列/顶生窗）
  const leafBody = level === 'high'
    ? SOP_LEAF_HEAD + SOP_LEAF_CLUMP + SOP_LEAF_SHADE + SOP_LEAF_VEIN + SOP_LEAF_MUL_HIGH + SOP_LEAF_BACK
    : SOP_LEAF_HEAD + SOP_LEAF_SHADE + SOP_LEAF_MUL_SIMPLE + SOP_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (sopClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.06, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.06, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面糙度差保留）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${SOP_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${SOP_WIND}`,
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
        `${SOP_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `sophora:leaf${levelKeySuffix(level)}`;
  return material;
}

/**
 * 组 0 材质（皮+果一材质两域，uv 域身份分支 3.5）：皮域 = 第 10 树皮语言「灰褐-
 * 深灰褐深纵裂厚脊沟（板状粗犷）+ 纵为主局部交叉网状 + 散在暗色瘤状突起」（6
 * 板状厚脊 + 沟内冷中性 AO【无红调——裁决 6】+ 老干网状（High）+ 瘤突场
 * （High）+ 干基暗化 + 细枝绿-灰褐两档 + 皮孔浅色两档（High））；果域 v∈[4,5]
 * = 串珠荚果绿→黄绿→黄褐三档色序 + 珠间缢缩暗缝 + 肉质光润（微透亮 High）。
 * level 分档（T011.9，缺省 'high'）：Mid 去老干网状/瘤突/皮孔点（近景细节层），
 * 脊沟板状/沟内 AO/干基暗化/细枝两档/果域全保留——中距「灰褐深纵裂厚脊 + 冠缘
 * 绿细枝 + 串珠果」身份（Spec §7 中距保留面）；Low 再去干基暗化/老枝灰褐档
 * （低调项），脊沟 + 沟内 AO + 当年生绿档 + 果域保留（远距「深纵裂剪影 + 果
 * 串」保留面），1× vnoise。风动 = 整树缓摆与叶同公式同相位（aBend 恒 0 快颤
 * 层天然不作用——果序下垂摆动归缺口候选④）。
 * 底参：灰褐-深灰褐主调 #6d675d（工程设定——FRPS「树皮灰褐色」Verified + twig-a
 * 「深灰褐纵裂脊」/bark-b「灰褐纵裂沟脊」照片交叉；R−G=6 灰褐向；十树链：
 * 重阳木 < 樟 < **国槐** < 乌桕 < 榉 < 悬 < 栾）/ m 0 / r 0.93（深纵裂族高糙
 * 哑光）/ FrontSide（皮管/果珠闭合实体——无裁切无 alphaTest）。
 */
export function createSophoraBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x6d675d, // 灰褐-深灰褐（工程设定：FRPS 灰褐 [1][2] + twig-a/bark-b 照片 [6] 交叉——R−G=6 灰褐向、深灰褐暗端）
    metalness: 0,
    roughness: 0.93, // 深纵裂厚脊族高糙哑光（vs 纵裂族 0.92 同档偏深）
    side: THREE.FrontSide, // 皮管/果珠闭合实体（无花卡类裁切需求——vs 栾 DoubleSide 三域的分化）
  });
  material.defines = { USE_UV: '' }; // 两域分支 = uv 域身份标记（皮圆柱 / 果珠串）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? SOP_BARK_WARP + SOP_BARK_TONE + SOP_BARK_NET + SOP_BARK_BUMP + SOP_BARK_BASEDARK + SOP_BARK_TWIG + SOP_BARK_LENTICEL + SOP_BARK_MUL
    : level === 'mid'
      ? SOP_BARK_WARP + SOP_BARK_BASEDARK + SOP_BARK_TWIG + SOP_BARK_MUL_MID
      : SOP_BARK_WARP + SOP_BARK_TWIG + SOP_BARK_MUL_LOW;
  // 跨 include 域变量预声明（roughnessmap 注入在 main 顶层消费 sopBarkSmooth/sopLenticel——
  // map 注入的 if/else 块内声明在该注入点作用域已关闭〔triadica Step 4 实证事故形态〕；
  // 块内改纯赋值防遮蔽。三档统一声明：WARP 段三档均赋值 sopBarkSmooth（Mid/Low 未消费的
  // 预声明为无害死值——triadica domainVars 同款处置）
  const domainVars = 'float sopLenticel = 0.0; float sopBarkSmooth = 0.0; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一，未消费档为无害死值）\n';
  const body = /* glsl */ `
// sophora:bark —— 组 0 两域分支（皮 v<3.5 / 串珠荚果 v∈[4,5]——uv 域身份标记，几何侧冻结契约；
// 阈值 3.5 = 果域 4.0 下探 0.5 隔离带，triadica/koelreuteria 三重隔离同款纪律）
${domainVars}if (vUv.y >= 3.5) {
${SOP_FRUIT_BODY}
} else {
${barkBody}
}`;
  const barkRoughness = level === 'high'
    ? `if (vUv.y >= 3.5) { roughnessFactor = 0.45; } // 果域肉质光润（低糙光泽档——「具肉质果皮」Verified）
else { roughnessFactor = clamp(0.93 - sopLenticel * 0.10 - sopBarkSmooth * 0.06, 0.05, 1.0); } // 皮孔微凸微泽 + 上部细枝微光`
    : level === 'mid'
      ? `if (vUv.y >= 3.5) { roughnessFactor = 0.48; } // Mid：果域光泽（微透亮随段去）
else { roughnessFactor = clamp(0.93 - sopBarkSmooth * 0.06, 0.05, 1.0); } // Mid：上部细枝微光保留（皮孔项随段去）`
      : `if (vUv.y >= 3.5) { roughnessFactor = 0.50; } // Low：果域光泽（远距果色读向保留）
else { roughnessFactor = 0.93; } // Low：深纵裂高糙哑光基底（皮孔/上部项随段去）`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${SOP_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${SOP_WIND}`,
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
    if (level === 'high') { // 果域肉质微透亮（High）；Mid/Low 不注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${SOP_FRUIT_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `sophora:bark${levelKeySuffix(level)}`;
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（同源
 * 全形含窗列/顶生窗——档间剪影一致）；Low = SOP_LEAF_SDF_LOW（表面/影档内一致
 * ——去窗列版）。**深度片元不挂噪声库**——SDF 零 facVnoise 引用（窗列/小叶场/
 * 顶生窗全 ALU；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 组 0 守卫：皮/果域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质
 * 时组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例；果域无需 v 路由——
 * rand=0 即守卫）。风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向
 * 由 shadowMap 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由
 * shadowMap 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createSophoraLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 复叶卡 uv
  const leafSdf = level === 'low' ? SOP_LEAF_SDF_LOW : SOP_LEAF_SDF; // Mid 深度 = High SDF（同源全形含窗列/顶生窗）
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
diffuseColor.a = mix(1.0, sopLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱/果珠 uv 域不误裁）`,
    );
  };
  material.customProgramCacheKey = () => `sophora:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
