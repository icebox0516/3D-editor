/**
 * runtime/procedural/tree/bungeana/bungeanaMaterials —— 白皮松（Pinus bungeana，
 * asset_tree_bungeana）束卡/树皮（含双态果卡）/束影深度材质（T012.4 Step 3b，
 * 针叶族 conifer **第四例材质实例**——组织照抄 juniperus 先例〔材质管线 + 亚像素
 * 退化门〕，形态语言按白皮松改写：**三针束卡 = 族内第 4 叶语言 SDF** + **第 17
 * 树皮语言白基调多色斑驳薄片剥落**〔机制沿 platanus 跨族复制授权——Step 1 判定 5：
 * 学机制不抄色相〕+ 双态两年熟果〔近景点彩级〕）。
 *
 * 职责：复制族内已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce
 * 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 * <color_fragment> 绝不触碰），物种配方按白皮松自己的 Reference Spec 换装——Spec
 * docs/research/bungeana-reference.md **@1.1**（任务书锚点 1.1，开工前已校验一致，
 * 2026-09-30 主代理采样终审通过——文字锚 9 项逐位一致 + 边缘过渡槽间差异域记档
 * 〔窄-中等过渡带〕）。消费冻结契约（只读）：conifer/coniferShapeProfile（定稿
 * 80 位）+ bungeana/bungeanaShapeProfile（8 槽数值面，Step 2 定稿）——
 * needleMaterial / bark / wind / cone 色字段为本文件消费面；**数值按家族先例以
 * 字面量 + 同源注释消费（硬编码，与 profile 侧无联动通道——cedrus ⑥ 同型家族
 * 缺口，记缺口候选⑥；材质测试以 profile 导入值做 JS 锚交叉——笔误防线）**。
 *
 * 【与几何侧（3a）的材质侧契约声明（并行冻结面，合并阶段对账——派遣简报冻结接口）】
 *   - 三工厂签名沿 juniperus 常绿单卡先例（无 preset 尾参——D44 常绿无卡：判定/
 *     预设「default 单卡」，无季相证据不建卡）+ **聚合导出 createBungeanaMaterials
 *     （冻结接口⑥）返回 { needle, bark, depth }**——组序与装配归 3a 入口（组 0 =
 *     皮管 + 双态果卡 → bark；组 1 = 束卡 → needle；depth = customDepthMaterial
 *     通道）；每次调用全部 new（D17）。
 *   - **uv 帧域双帧（冻结接口②，判别阈值 1.0）**：束卡 v∈[0,1) 卡基→卡尖（v = 沿
 *     末级枝段轴，u = 横向全幅）；果卡 v∈[1.0,1.95] 沿果轴（u = **逐果态类色档
 *     ∈ [0.02,0.98] 常量**——见果分类编码）。0.95 安全边距沿族先例器官帧惯例。
 *   - **果分类编码（u 色档域——juniperus 先例名路线，零新增 attribute）**：双态
 *     两年熟（判定 6）分类走 **u 域：u ≥ 0.5 二年生近熟淡绿-黄褐（coneClassRatio
 *     0.25 少量）/ u < 0.5 一年生绿幼果（0.75 主导）**。几何 posHash 账目逐果定类
 *     后按域编码 u——账目归 3a。合并阶段与 3a 实编码对账（cedrus ③ 同型风险，
 *     记缺口候选②）。
 *   - attribute 契约（沿族先例，冻结接口③ aSeed/aBend 字段名沿用）：aLeafRand =
 *     束卡逐卡 ∈ [0,1) 非零种子；器官卡（果卡）随皮组恒 0（器官刚性——aBend 亦
 *     恒 0）；aBend = 束卡沿枝末端权重（组 0 恒 0 免颤）；aSeed = 实例个体相位
 *     （Runtime 逐实例——几何零 aSeed 顶点属性）。**零几何 rng**（本文件纯
 *     uv/attribute 函数，无任何随机消费）。
 *   - 皮管域 v ∈ [0, 0.92] 逐管归一（TUBE_V_MAX——沿 metasequoia/juniperus 同名
 *     冻结契约假设；与器官域恒隔离，主干底盖盘同守）。3a 若实编码不同 → 合并阶段
 *     对账（记缺口候选⑤）。
 *   - 卡轮廓契约：束卡卡幅 = rosetteCardMin/Span 0.26–0.32 m × needleCardAspect
 *     1.6–2.6（几何侧定幅——下限低于圆柏绳卡 2.0–3.2 = 放射蓬松 vs 绳列细长的
 *     语言区分锁）；果卡 = coneSize 0.012–0.048 m × 交叉双卡边距（几何定幅）——
 *     SDF 消费卡内归一 uv，幅值不进材质。
 *
 * 【三针束卡 SDF——族内第 4 叶语言（本任务核心新形，限定文件内最小扩展）】
 *   族内前三例：雪松莲座簇卡（极坐标扇区窗列放射）/ 水杉羽卡（对生羽列窗列）/
 *   圆柏绳卡（对生行窗列 + 四列错位）。白皮松「叶」单位 = **末级枝段多束聚合
 *   系统**（Spec §针束机制：束生短枝单律 + 束沿枝螺旋排列 + 束间距 ≈ 针长
 *   1/3–1/2 ≈ 2–5 cm Verified/Inferred s04/s05）——结构信息 = 「枝段中轴 + 沿轴
 *   螺旋束位 + 每束 3 针小扇并集」的放射刷状 3D 聚合。新路径 = **螺旋束位行窗列
 *   + 三针小扇法**（vs 圆柏的四列错位、vs 雪松的径向扇区放射）：
 *   ① 螺旋束位行窗列：s = v × N（N = 束单元数 = profile rosetteNeedles 12 为
 *      High 基准——真束 5–16 的工程抽象〔真束间距 2–5 cm × 卡长 0.26–0.32〕，
 *      **SDF 内部束密度不随卡尺度稀释**〔012.2 教训——N 为卡内 uv 固频，分档
 *      锁定 12/8/5〕）；逐束 hash → 束位抖动 ±13%（非机械规整）+ **束心横向游走
 *      0.11 × cos(k × 2.3998)**（137.5° 叶序角投影——束沿枝螺旋排列 s04/s05
 *      Verified 的 2D 投影承载）；
 *   ② 三针小扇（束内 3 针 V/扇形开展 15–45° s04/s05 Verified 的投影抽象）：
 *      中央针直（slope 0）+ 两侧针 ±开展（横向随束内针体坐标线性张开——开展幅
 *      0.085–0.135 逐束浮动 = 15–45° 域工程映射）；单针粗硬先端尖（半宽 0.042
 *      基宽 × 42% 尖收）+ **边缘细锯齿载波**（FRPS「边缘细锯齿」Verified——
 *      sin 载波 ×0.16 幅，纯 ALU；亚像素归退化门）；
 *   ③ 束带：带占 84% + 束隙 16%（束间距真实间隙的工程收编——近景束列可辨、
 *      中距 M25 亚像素退化）；
 *   ④ 刷形轮廓包络：pow(sin, 0.42) plateau 包络（中下部宽 plateau = 放射刷——
 *      vs 圆柏 sqrt(sin) 细杆端帽的绳状侧影；蓬松放射 vs 细长的语言区分）×
 *      基部微收 + 末级枝段中轴条（mix 0.016→0.008 渐细——束基着生轴，近连续）；
 *      卡实际剪影 = 束并集主导的扇贝缘（束尖外突——放射刷边缘读向）∩ 包络外裁。
 *   ⑤ **导数感知亚像素退化门直接继承（012.3 fwidth 两域先例第三次消费——束卡
 *      薄元素针列同型）**：域① 束节距 px = 1/(N·|∇v|)〔0.9,1.3〕带 + 域② 针划
 *      宽 px = 2×针半宽/|∇u|〔1.2,4.5〕带（圆柏刺卡薄元素门带直承）。**双域
 *      分治**（vs 圆柏 max 合成的分化：束卡针划恒细于节距——pitch 可读而针划
 *      亚像素时 max 门误放行 → M25 淡染）：横向填充收敛（针划宽 → 扇并集填充）
 *      归针划门、轴向带占收敛（0.84 → 1.00）归节距门、AA 坡宽 max(0.02,
 *      fwidth(d)) 与剪影厚度保持 bngSolidify（H3b 低尾裁除/高段饱和/+0.19 补宽）
 *      归 min 合成（任一域亚像素即治）。可解析域原值逐位不动（近景束列身份
 *      不变）。门作用于表面/深度同串（生成器单一来源——影裁切同步收敛）。
 *   全 ALU 零 facVnoise（窗列/螺旋/锯齿 hash 全 inline sin-hash）——深度材质不挂
 *   噪声库的前提；坡宽 0.02（细针划结构口径——alphaToCoverage 承担 AA）。
 *   果卡帧轮廓 = v 埧圆端带（mm 级器官 AA 肩 0.08——族先例器官帧同式；卵圆
 *   5–7 × 4–6 cm Verified + 幼果 1–1.5 cm 点彩级，体积读向由几何交叉双卡承载）。
 *   双帧同函数同签名（表面/深度同源取用——单一来源经生成器保证；SDF 随档变体 =
 *   束单元数 12/8/5，果卡帧三档同体）。
 *
 * 叶卡（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - **深绿-中绿带黄绿/灰绿域基色（default 单卡——判定/预设 4：常绿无季相证据
 *     不建卡）**：构造中点 #606d47 = (needleColorSun 0x77864f + needleColorShade
 *     0x49543e) 严格中点（cedrus 构造中点式——常绿单卡先例；暴露度 0.5 处即此色）。
 *   - **阳黄绿亮/阴灰绿暗受光色差（身份主律）**：冠层暴露度 ramp（冠基 3.45 m =
 *     trunkHeightRatio 0.30 × 11.5 锚 + 3.5 m 渐入带 + 逐卡 ±0.12 抖动破纯竖向
 *     梯度）mix(阴灰绿暗 ×(0.844,0.851,0.918), 阳黄绿亮 ×(1.156,1.149,1.073))
 *     ——端点 = needleColorShade/Sun 对构造中点的 sRGB 比值 × 0.65 观感软化
 *     （算术对称）。Spec §5.2「阳面黄绿亮/阴面灰绿暗受光色差为主律」s04/s05
 *     Observed。**无两面色差**（族内第 4 数据点——同雪松/圆柏「无差」轴、异水杉
 *     温和差；needleFaceContrast 省略即「无两面差」语义——契约缺口零新增）：无
 *     BACK 段、色路零 gl_FrontFacing、两面糙度同值。
 *   - **微白粉 needleGlaucousBloom 0.10（微档）**：整冠浅色细线 + 微白粉感观感
 *     （Spec §5.2——气孔线致观感 Inferred 照片佐证 s04/s05）随暴露度
 *     ×(1.03, 1.02, 1.04)（B > R > G 去饱和冷灰——cedrus 0.35 档 ×(1.10,1.07,
 *     1.14) 的等比弱化第四数据点）。
 *   - **新梢黄绿-灰绿 needleJuvenility 0.20**（域内变体非季相卡）：9% 卡（0.20 ×
 *     新梢少数相 0.45）×(1.12, 1.15, 0.95)（一年生小枝灰绿/浅黄绿 Verified [1]
 *     + s04/s06）。
 *   - **气孔线白线（近景束卡微特征）**：束坐标同式重算（纯 ALU）针划中线窄带
 *     提亮 ×(1.13,1.14,1.10) × 0.50——「背腹两侧均有气孔线」FRPS Verified 的
 *     浅色细线观感（vs 圆柏刺叶白粉带的帧门分化：束卡全帧作用 + 针划可解析门
 *     同步〔亚像素域白线归零——退化门色层同步〕）。
 *   - 逐卡变奏 aLeafRand：色相两端冷蓝绿灰↔暖黄绿（通道摆幅 ≤15% 纪律——常绿
 *     冠均一）+ 明度 ±8%（去相关取样）。
 *   - 中频簇团斑块（High）：松散叶团簇 ≈0.95 m（频率 1.05——疏散冠 Observed
 *     s01–s03 的团块簇聚读向）。
 *   - 糙度 0.67（硬针角质——哑光-半光泽；family 链：樟 0.50 革质亮 < 圆柏 0.64
 *     蜡质鳞叶 < 雪松 0.66 角质 < **白皮松 0.67 硬针角质** < ginkgo 0.68 < 水杉
 *     0.70 软条形；工程设定）；无两面糙度差。
 *   - **背光透射（硬针疏散冠·中幅 0.42）**：家族链 夏栎 0.65 > 水杉 0.46 > **
 *     白皮松 0.42** > 雪松 0.38 > 圆柏 0.28 > 樟 0.22——硬针透光强于角质密簇的
 *     雪松、疏散冠结构（4 照片 8 问半透光一致）逼近水杉高档但硬针厚质下调
 *     （判定 8「透射中幅」）。透射色 (0.54, 0.82, 0.42) 中绿偏黄绿向（深绿-
 *     中绿带黄绿域冠的透光读向）。**Step 4 校准回路开放**。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent）；
 *     零贴图零 DataTexture（D13）。
 *
 * 双态果卡域（组 0 v∈[1,2) 帧体——两年熟双态，判定 6）：
 *   - **一年生绿幼果（u < 0.5 主导 0.75）**：coneColorYoung 0x5d7a44 线性
 *     (0.109, 0.195, 0.058) × 档内 ±12%（生长季主视觉树上果态 = 一年生小绿幼果
 *     ——Spec §5.3 两年熟机制 Verified [1] + 幼果照片弱读 s06）；糙度 0.58。
 *   - **二年生近熟淡绿-黄褐（u ≥ 0.5 少量 0.25）**：coneColorMature 0xa2985a
 *     线性 (0.361, 0.314, 0.102) × 档内 ±12%（「成熟前淡绿色，熟时淡黄褐色」
 *     FRPS Verified——生长季半熟外推 Inferred；下垂黄褐成果 10–11 月窗不入
 *     主语境）；糙度 0.50（覆瓦鳞哑光-半泽）。
 *   - 两端收边暗 0.18（卵圆明暗读向）；轮廓 = 双帧生成器 v 埧圆端带（单一来源）。
 *
 * 皮（组 0 皮域）配方——**第 17 语言：白基调多色斑驳薄片剥落**（identity 级——
 *   判定 5 立项即定做；机制沿 platanus 斑块剥落跨族复制授权〔代场 tone + 破碎场
 *   fine + 阈值分带 + 边缘缝〕，色相序列全新——族内首个非褐色系白基调皮）：
 *   - 主调 #6f675c 灰褐基面（barkBaseColor——灰褐/深灰褐次要色带 20–30%，
 *     s07/s08 Observed）。
 *   - 代场（地图状大斑块主结构）：频率 (7.0, 83.0)——**物理各向同性**（u 域 =
 *     环绕一周 ≈1.1 m 周长 / 7 ≈ 0.157 m；v 域 = 主管弧 ≈11.5 m × 0.92 / 76 ≈
 *     0.139 m——两向同尺度 ⊂ barkPlateMin/Span 0.10–0.20 工程推断域；分支管
 *     逐管归一后斑块等比缩小——族先例接受的近似，3c 校准回路开放）。
 *   - **白基调多色四带**（Spec §5.1 中龄公园典型斑块参数 Verified s07/s08）：
 *     乳白/灰白主导带 tone 阈值中心 0.50（≈50% 份额 ⊂ 40–65% 域——**identity
 *     白全比值无软化**：barkPlateColor 0xd9d5c6 对基色 (1.955, 2.068, 2.152)
*      ——远景白干 = 第一识别特征，M75 白干可辨性 Unknown ⑤ 的承载）+ 灰褐/
 *     深灰褐基带（base ×1.0 ↔ ×0.85 fine 二级色变，20–30%）+ 近黑小斑/节疤带
 *     阈值中心 0.18（≈8–12% ⊂ 5–10% 域上沿——barkGrooveColor 0x342f29 比值
 *     × 0.90 软化 (0.522, 0.511, 0.501)）+ **淡黄绿新皮露斑**（最新剥落代
 *     高 tone × fine 双门 ≈8%——FRPS「露出淡黄绿色的新皮」Verified，×(1.496,
 *     1.709, 1.304) = 0xa6b078 工程映射对基色比值）。
 *   - **边缘窄-中等过渡带**（Spec @1.1 终审槽间差异域——s07 渐变 / s08 锐利，
 *     取窄-中等过渡域不承重单一读向）：白带 smoothstep(0.44, 0.56)（中等
 *     0.12）/ 近黑带 smoothstep(0.14, 0.22)（窄 0.08）+ High 档 fine 扰曲阈值
 *     （地图状曲折边——platanus 破碎场机制）。
 *   - **株内「上白下深」大梯度**（s07 Verified 族内最强——年龄皮色轴〔幼灰绿→
 *     斑驳→白〕的替代承载，Step 2 记档）：tone 高度偏移 mix(-0.10, +0.14) ×
 *     (y-1.5)/6.5 ramp——干基白带收缩 / 上部主干大枝白带扩张（「越向梢部越白
 *     越光滑」）；**全槽中龄斑驳基调恒等**（bark 组槽间恒等——Step 2 结论）。
 *   - **薄片翘边亮斑缘**（活跃剥落带微浮雕——s08 终审替补双问一致「薄片纸感
 *     翘边出现在亮斑边缘/深浅交界处」）：带间阈值交界 0.045 窄窗 × 1.14 亮缘
 *     （vs platanus 代块缝深褐的分化——白皮松翘边反光亮读向）+ High fine 门控
 *     曲折。
 *   - 近光滑弱浮雕 + 浅纵细纹（barkGrooveDepth 0.18 族内最低——vs 雪松 0.45/
 *     圆柏 0.55/水杉 0.68；「表面近光滑紧贴」Verified s07/s08）：周向 60 列
 *     sin 细纹弱暗 0.045（纯 ALU——tone 扰曲防机械规整）；**干基深色裂沟端**
 *     （老树基部段浅纵裂——FRPS 老树皮段：干基暗化 0.10 + 裂沟加深 0.10）。
 *   - 乳白斑光滑（roughness -0.10——白皮新露近光滑 identity 光泽读向）+ 近黑
 *     斑微糙。
 *   - 苔藓/地衣不做（Spec 无记载——不做不编造）；微起伏归几何层（契约记档——
 *     几何侧树皮轮廓层未进契约，同族先例）。
 *
 * 风动（**两成分**——判定 9 + Spec §风动读向结构推导 Inferred：粗硬短针束
 *   （惯量小）+ 细长斜展枝 → 束级小幅高频颤 + 整冠慢摆；**顶梢成分不消费**
 *   ——直立刚硬无点头证据，族内可选·雪松消费位零占位第三例〔水杉/圆柏/白皮松〕）：
 *   - 成分① 整冠低频慢摆：0.30 Hz（windTierFrequency）× 幅 0.02 m 顶
 *     （windTierAmplitude）；高度权重² × 1/11.5 锚。
 *   - 成分② 末级枝/束高频小幅颤：2.4 Hz（windFringeFrequency——**频率 > 圆柏
 *     鳞枝 1.9 Hz**：硬针束惯量小读向；15.0796 rad/s ⊂ family 快颤链 9–23 内带）
 *     × 幅 0.014 m（windFringeAmplitude——**幅 < 圆柏 0.018**：小幅）；权重 =
 *     aBend（组 0 恒 0 免颤）；相位 = hash(aSeed + aLeafRand)——个体 + 逐卡双
 *     相位差。
 *   - **树高锚 11.5 m**（BUNGEANA_TREE_HEIGHT_NOMINAL = slot-0 totalHeight 同源
 *     ——锚同步轮 11–12 m 域；1/11.5 = 0.08696 命名常量注入 + 测试锚断言）。
 *     两成分皮/叶同公式同相位（不撕裂穿帮）；hash 常数 95.137/72.311 与先例
 *     相位流（sway 77.669–111.413 / flutter 49.337–88.523）去相关。
 *
 * 深度材质（束影裁切，customDepthMaterial 契约通道——沿 SOP §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha
 *     与束卡表面材质共享同一 GLSL 生成器输出（同档同串——表面改叶形深度自动同步）。
 *   - **零噪声库注入**：双帧 SDF 全 ALU（inline sin-hash 非 facVnoise）。保护性
 *     约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 多材质网格守卫：组 0（皮 + 果卡）以恒等 attribute（aLeafRand=0）走实心
 *     分支，防束卡 SDF 在圆柱/器官 uv 域上误裁出洞（triadica 恒等 attribute 先例）；
 *     果卡随皮组 → 影 = 实心方卡剪影（mm-cm 级点彩果在影贴图 ~16 cm/texel 下
 *     不可辨，记档取舍沿族先例口径）。
 *   - 档位匹配：Mid = Mid SDF（8 束单元）/ Low = Low SDF（5）——表面/影档内一致
 *     （SDF 随档变体 = 束单元数递减）。customProgramCacheKey 三档分键（9 键契约）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T012.4，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build）：
 *   - 束卡 Mid：SDF 束单元 12→8（几何簇卡数同步降——剪影连续归 3a 档间不变量）；
 *     去簇团噪声/糙度簇团项；受光色差/微白粉/新梢/气孔线/透光/hue·luma 三档保留
 *     （颜色层次档间连续保留面）。
 *   - 束卡 Low：SDF 5 单元 + 去透光（远距逆光透射不可辨）/簇团；受光色差/微白粉/
 *     气孔线/hue·luma 保留；片元零噪声。果卡帧 SDF 三档同体（Low 几何若省略果卡
 *     发射 → 分支死代码无害——归 3a）。
 *   - 皮 Mid：去破碎场 fine（带内二级色变均值化 + 边缘直缘化 + 新皮露斑 tone 单门
 *     + 亮缘直缘版）+ 去浅纵细纹（近景细节）；**三色带拼贴本体 + 株内梯度 + 干基
 *     暗化保留**（中距「白基调多色斑驳干面」= 最强身份信号）；果卡帧三档同体。
 *   - 皮 Low：再去株内梯度/新皮露斑/亮缘/干基暗化（低调项）；**三色带拼贴保留**
 *     （远距「白斑驳干剪影」Spec §7 远景保留面——白干第一识别特征的 Low 保留位，
 *     vs 榉树 Low 斑驳全去的分化）；1× vnoise（代场）。
 *   - 深度：Mid/Low = 各自档 SDF（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；bungeana 前缀不与先例混缓存）：
 *     'bungeana:needle' / ':mid' / ':low'；'bungeana:bark' …；'bungeana:needle-
 *     depth' …（9 键全异；叶/皮经 applyTreeFadeDither 追加 '+dither'）。
 *   - 风动（BUNGEANA_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一
 *     部分（D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 束卡 High 片元 = 1× vnoise（簇团）= 3× + 束卡 SDF（包络 pow/sin + 螺旋束位
 *     窗列 + 三针小扇 + 双 hash + 锯齿载波 sin）≈ 4× + 受光/白粉/新梢/气孔线
 *     重算/hue ≈ 3× ≈ **10×**（与圆柏绳卡同档——三针小扇 + 气孔线重算的账）；
 *     Mid/Low = 0 噪声 + ALU ≈ 6× / 5.5×；
 *   - 皮 High 片元（域互斥取最重路径）= 皮路径 2× vnoise（代场 + 破碎场）= 6× +
 *     分带/亮缘/细纹 ALU ≈ 2× ≈ **8×** / 果卡帧纯 ALU ≈ 2×；
 *   - 皮 Mid/Low = 1× vnoise + ALU ≈ 5×；
 *   - 深度片元 = SDF 纯 ALU ≈ 4×（双帧路由 + 三针小扇），**零噪声采样**；
 *   - 顶点 = 两次 sin（两成分）+ 一次法线乘，无循环；全源零数据依赖循环/零纹理采样。
 *
 * 契约缺口候选（归 T012 族级验收门 012.5；本文件零公共抽象扩展——螺旋束位行窗列/
 * 三针小扇/白基调代场分带/果 u 域编码全部限定文件内）：
 *   ① 三针束卡「螺旋束位行窗列 + 三针小扇」SDF：本文件内实现（针叶族第四个簇卡
 *      语言——莲座放射〔雪松〕/对生羽列〔水杉〕/绳列〔圆柏〕/束生螺旋扇〔白皮松〕）；
 *      松属第二例（黑松/油松类针束树）出现后评估提炼家族公共 SDF 模式（暂不动公共
 *      抽象——真实消费者触发）；
 *   ② 果双态 u 色档编码（u ≥ 0.5 二年生近熟 / u < 0.5 一年生绿幼）为材质侧契约
 *      ——juniperus「u 域分类」同型；需与 3a posHash 编码合并阶段对齐冻结
 *      （cedrus ③ 同型风险）；
 *   ③ 亚像素退化门双域分治（针划宽门 + 节距门各自收敛 + min 合成）为束卡薄元素
 *      型变体——vs 圆柏 max 合成；族内下一薄元素卡（刺叶/细针类）出现后评估两型
 *      是否合并为参数化公共门（暂不动）；
 *   ④ 束卡分型（束位抖动/螺旋游走/开展幅）与受光/白粉/变奏共用 aLeafRand 单属性
 *      统计近似（多通道复用同一 rand——分型间相关性无法表达；家族共有缺口）；
 *   ⑤ 皮管 v ∈ [0,0.92] 逐管归一（TUBE_V_MAX）沿族契约假设——3a 实编码若异 →
 *      合并阶段对账（冻结接口隐式面）；
 *   ⑥ 树高锚 11.5/冠基 3.45/渐入带 3.5/皮代场频率（7.0, 83.0）材质侧硬编码——
 *      与 profile 侧无联动通道（cedrus ⑥ 同型家族缺口；3c 出图面校准回路）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；
 *   零贴图/零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通
 *   Mesh 无该属性，WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；
 *   与族先例的通用段（风动公式等）为复制改造非 import（资产私有，跨资产不耦合
 *   ——organization.md 边界）；**真实编译验证（console 零错误零警告）归 3c 合并后
 *   执行**（无浏览器环境——本 Step 以测试基建 GLSL 组装断言〔真实 ShaderLib 源 +
 *   include 展开 + 配平校验〕先行，沿 cedrus/metasequoia/juniperus 同款记档；
 *   X4000 纪律：单返回/零 out 参/全路径初始化）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/**
 * 树高锚（T012.4 判定 9「树高锚 = slot-0 同步轮 ~11–12 m 域」：slot-0
 * totalHeight 11.5 同源——profile 冻结值；材质-几何侧无联动通道记缺口候选⑥）。
 * 1/11.5 = 0.08696 命名常量注入风动 GLSL + 测试锚断言（cedrus/juniperus 先例）。
 */
export const BUNGEANA_TREE_HEIGHT_NOMINAL = 11.5;

/** 风动高度权重 = 1/树高锚（0.08696——注入 GLSL 字面量；5 位小数 = 家族同步轮精度口径） */
const BUNGEANA_WIND_H_SCALE = (1.0 / BUNGEANA_TREE_HEIGHT_NOMINAL).toFixed(5);

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿家族范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`bungeana 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

/**
 * 束卡 SDF 束单元数分档（profile rosetteNeedles = 12 为 High 基准——契约注释「LOD
 * 降档 = 递减派生归 3b」；冻结单 12/8/5）：SDF 内以螺旋束位行窗列频率 N 承载
 * （每束 = 真实短枝束的直接对应——真束 5–16 的工程中值；**束密度不随卡尺度稀释**
 * 〔012.2 教训〕——N 为卡内 uv 固频）。
 */
const BUNGEANA_FASCICLE_UNITS: Record<ProceduralLevel, number> = { high: 12, mid: 8, low: 5 };

// ── 风动 GLSL（束卡/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：**两成分**（判定 9）——①整冠低频慢摆（细长斜展枝整冠质量体）+
 * ②末级枝/束高频小幅颤（2.4 Hz × 0.014 m——频率 > 圆柏鳞枝 1.9 Hz、幅 < 其
 * 0.018：硬针束惯量小读向；aBend 权重，组 0 恒 0 免颤）。**无顶梢成分**（主干
 * 直立刚硬无点头——族内可选·雪松消费位零占位第三例）。频率 = windTier/
 * FringeFrequency (Hz) × 2π（profile 契约「频率 Hz（uTime 驱动）」）；幅度为米
 * （0.02/0.014——windTier/FringeAmplitude）。hash 常数 95.137/72.311 与先例相位流
 * 去相关；树高锚 11.5 m（×0.08696——slot-0 totalHeight 同源，锚同步轮 11–12 m 域）。
 */
const BUNGEANA_WIND = /* glsl */ `
// bungeana wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float bngWindPhase = fract(sin(aSeed * 95.137 + 5.7) * 43758.5453);
float bngWindH = clamp(position.y * ${BUNGEANA_WIND_H_SCALE}, 0.0, 1.0); // /11.5m 树高锚（slot-0 totalHeight 同源——BUNGEANA_TREE_HEIGHT_NOMINAL；锚同步轮 11–12m 域）
// 成分① 整冠低频慢摆：0.30Hz（1.8850 rad/s）× 幅 0.02m 顶（Spec §风动读向 Inferred——细长斜展枝整冠质量体）
float bngTier = bngWindH * bngWindH * 0.02 * sin(uTime * 1.8850 + bngWindPhase * 6.28318 + bngWindH * 1.2);
// 成分② 末级枝/束高频小幅颤：2.4Hz（15.0796 rad/s——family 快颤链 9–23 内带）× 幅 0.014m（频 > 圆柏鳞枝 1.9Hz / 幅 < 其 0.018——硬针束惯量小读向）；权重 = aBend（组 0 恒 0 免颤）
float bngFlutterPhase = fract(sin((aSeed + aLeafRand) * 72.311 + 7.9) * 43758.5453);
float bngFlutter = aBend * 0.014 * sin(uTime * 15.0796 + bngFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (bngTier + bngFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(bngTier) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * bngFlutter * 0.9; // 束卡沿卡法线微扑（皮组 aBend=0 → 恒 0）
`;

/** 顶点声明（束卡/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const BUNGEANA_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 双帧卡 SDF（表面材质与深度材质共用——单一来源生成器，禁复制粘贴）────────────────

/**
 * 白皮松双帧卡覆盖率生成器（uv v 帧域双帧——派遣简报冻结接口②，阈值 1.0；见模块
 * 头【三针束卡 SDF】节）：
 * - 束卡 v∈[0,0.99]：螺旋束位行窗列 + 三针小扇法（N 束单元分档 12/8/5；逐束
 *   hash 抖动 + 137.5° 叶序角螺旋游走 + 中央/两侧三针小扇〔15–45° 开展〕+ 边缘
 *   细锯齿载波 + 刷形轮廓包络 + 末级枝段中轴渐细条——末级枝段多束聚合系统的单卡
 *   整枝抽象）；
 * - 果卡 v∈[1.0,1.95]：v 埧圆端带（u = 逐果态类色档常量——卵圆 5–7×4–6 cm +
 *   幼果 1–1.5 cm 点彩级 Verified [1][2]，体积读向由几何交叉双卡承载）。
 * **零 facVnoise 引用是深度材质不挂噪声库的前提（引入即深度编译暴雷——保护性
 * 约束；窗列/螺旋/锯齿 hash 全 inline sin-hash ALU）**；坡宽 0.02（细针划结构
 * 口径——alphaToCoverage AA；亚像素域经 ⓪ 门导数化放宽至 ≈1px——见模块头
 * 【三针束卡 SDF】节⑤）；器官帧 0.08 mm 级器官的 AA 肩；单返回 + 声明处初始化
 * （X4000 纪律）。fwidth 为 WebGL2 GLSL ES 3.00 内建（零扩展依赖——表面/深度
 * 两 pass 通用）。
 */
function bungeanaCardSdfSource(level: ProceduralLevel): string {
  const n = BUNGEANA_FASCICLE_UNITS[level].toFixed(1); // High 12.0 / Mid 8.0 / Low 5.0（束单元数分档派生）
  return /* glsl */ `
// 剪影厚度保持重映射（H3b——012.3 Step 4 第二轮先例第三次消费）：A2C 4x 样本量化
//（≥0.875 → 4/4）下中低 alpha 边缘像素解析为 2–3/4 样本 → 天色淡染。低尾裁除 +
// 高段饱和 + 薄卡 +0.19 上偏补宽。bngRead = 两域可解析度 min 合成（任一域亚像素即治）。
float bngSolidify(float bngA0, float bngRead0) {
  return mix(clamp((bngA0 + (1.0 - bngRead0) * 0.19 - 0.25) / 0.24, 0.0, 1.0), bngA0, bngRead0);
}
float bngCardAlpha(vec2 bngUv, float bngRand) {
  float bngA = 1.0;
  if (bngUv.y < 1.0) {
    // 束卡帧（v∈[0,1) 卡基→卡尖沿末级枝段轴——u 横向全幅）
    vec2 bngP = vec2(bngUv.x - 0.5, bngUv.y);
    // ⓪ 导数感知亚像素退化门（012.3 fwidth 两域先例**第三次消费**——束卡薄元素针列同型）：
    // 域① 束节距 px = 1/(N·|∇v|)〔0.9,1.3〕带；域② 针划宽 px = 2×针半宽/|∇u|〔1.2,4.5〕带
    //（圆柏刺卡薄元素门带直承）。**双域分治**（vs 圆柏 max 合成的分化——束卡针划恒细于
    // 节距：pitch 可读而针划亚像素时 max 门误放行 → M25 淡染）：横向填充收敛归针划门、
    // 轴向带占收敛归节距门、AA 坡宽/剪影补偿归 min 合成。可解析域原值逐位不动。
    float bngPitchPx = 1.0 / max(fwidth(bngP.y) * ${n}, 1e-4);
    float bngStrokePx = 0.084 / max(fwidth(bngP.x), 1e-4);
    float bngReadPitch = smoothstep(0.9, 1.3, bngPitchPx);
    float bngReadStroke = smoothstep(1.2, 4.5, bngStrokePx);
    float bngRead = min(bngReadPitch, bngReadStroke);
    // ① 刷形轮廓包络（硬针束放射刷——中下部宽 plateau〔蓬松放射 vs 圆柏细杆绳列的语言区分〕
    // + 基部微收 × 尖部收）
    float bngEnv = pow(sin(3.14159 * clamp(bngP.y, 0.005, 0.995)), 0.42) * (0.82 + 0.18 * bngP.y);
    float bngSil = 0.5 * bngEnv - abs(bngP.x);
    // ② 螺旋束位行窗列：N 束单元（束生短枝单律——束沿末级枝段螺旋排列 s04/s05 Verified；
    // N = ${n} 分档 12/8/5——卡内 uv 固频，束密度不随卡尺度稀释〔012.2 教训〕）
    float bngS = bngP.y * ${n} + bngRand * ${n};
    float bngK = floor(bngS);
    float bngH = fract(sin(bngK * 12.9898 + bngRand * 78.233) * 43758.5453); // 逐束 hash（inline sin-hash——非噪声库）
    bngS += (bngH - 0.5) * 0.26; // 束位抖动 ±13%（非机械规整）
    float bngCw = 0.11 * cos(bngK * 2.3998 + bngRand * 6.28318); // 螺旋束位横向游走（137.5° phyllotaxis 叶序角投影）
    float bngXr = bngP.x - bngCw; // 束心相对横坐标
    // ③ 三针小扇（束内 3 针 V/扇形开展 15–45° s04/s05 Verified——中央针直 + 两侧针 ±开展）
    float bngDuty = mix(1.00, 0.84, bngReadPitch); // H1-带占：亚像素束隙→束色收敛（可解析域恒 0.84 原值——近景束列密度不稀释）
    float bngF = fract(bngS);
    float bngFl = clamp(bngF / bngDuty, 0.0, 1.0); // 束内针体坐标 0 基 → 1 尖
    float bngSpread = 0.085 + 0.05 * fract(bngH * 7.313 + 0.31); // 束内开展幅（15–45° 域工程映射——逐束浮动）
    float bngWBase = 0.042 * (1.0 - 0.42 * bngFl); // 针半宽（粗硬 + 先端尖收 42%）
    float bngW = bngWBase * (1.0 + 0.16 * sin(bngFl * 43.98 + bngH * 6.28318)); // 边缘细锯齿载波（FRPS「边缘细锯齿」Verified——亚像素归退化门）
    float bngWFill = mix(bngSpread + bngWBase, bngW, bngReadStroke); // H1-束内：亚像素针划→扇并集填充收敛（可解析域原值）
    float bngNc = bngWFill - abs(bngXr); // 中央针（slope 0）
    float bngNs = bngWFill - min(abs(bngXr - bngSpread * bngFl), abs(bngXr + bngSpread * bngFl)); // 两侧针并集（±开展 V 形）
    float bngNlat = max(bngNc, bngNs); // 三针并集
    float bngAxw = min(bngF, bngDuty - bngF); // 轴窗（束带内——0 带界 → 0.42 带心）
    float bngTuft = min(bngNlat, bngAxw); // 针扇 ∩ 轴窗
    // ④ 末级枝段中轴条（束基着生轴——近连续不断裂）
    float bngAxis = mix(0.016, 0.008, bngP.y) - abs(bngP.x);
    float bngD = max(min(bngSil, bngTuft), bngAxis); // (刷形轮廓 ∩ 束并集) ∪ 枝轴
    // H3 AA 坡宽导数化：亚像素域坡宽 ≈1px 覆盖 AA（footprint 均值化）；可解析域恒 0.02 原值（近景不动）
    float bngAa = max(0.02, fwidth(bngD) * (1.0 - bngRead));
    bngA = bngSolidify(clamp(bngD / bngAa + 0.5, 0.0, 1.0), bngRead);
  } else {
    // 果卡（v∈[1.0,1.95] 沿果轴——u = 逐果态类色档常量）：v 埧圆端带（双态两年熟——
    // 卵圆 5–7×4–6 cm + 幼果 1–1.5 cm 点彩级 Verified [1][2]，体积读向由几何交叉双卡承载）
    float bngCb = clamp((bngUv.y - 1.0) / 0.95, 0.0, 1.0);
    bngA = clamp((0.5 - abs(bngCb - 0.5)) / 0.08 + 0.5, 0.0, 1.0); // 圆端带（器官 AA 肩 0.08——mm–cm 级器官口径）
  }
  return bngA;
}
`;
}

// ── 束卡帧片元配方（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写
//    diffuseColor.a；位于 <color_fragment> 之前，与 vColor 乘算交换律安全）──────────

/**
 * 束卡帧配方头（束卡单帧——组 1 顶点 v ∈ [0,1) 只命中束卡帧）。分段拼装（沿先例
 * 体例）：High = HEAD + CLUMP + MUL_HIGH；Mid/Low = HEAD + MUL_SIMPLE（去簇团噪声
 * ——乘子 0.94+0.12×bngClump 均值化 = 1.0 消去，值噪声均值 0.5 精确保均）。
 * **无两面色差**（判定 8 族内第 4 数据点——needleFaceContrast 省略即语义）：无
 * BACK 段、色路零 gl_FrontFacing、两面糙度同值。HEAD 为 level 函数（气孔线重算
 * 需束单元数 N 与 SDF 同源）。
 */
function bungeanaNeedleHead(level: ProceduralLevel): string {
  const n = BUNGEANA_FASCICLE_UNITS[level].toFixed(1);
  return /* glsl */ `
// bungeana:needle —— SDF 束卡覆盖 + 受光色差（阳黄绿亮/阴灰绿暗）+ 微白粉 + 新梢黄绿 + 气孔线白线 + 逐卡变奏（<color_fragment> 不触碰）
float bngAlpha = bngCardAlpha(vUv, vLeafRand);
diffuseColor.a = bngAlpha;
// 受光色差 ramp（身份主律——Spec §5.2 阳面黄绿亮/阴面灰绿暗 s04/s05 Observed）：冠层暴露度 mix
//（冠基 3.45m = trunkHeightRatio 0.30 × 11.5 锚 + 3.5m 渐入带 + 逐卡 ±0.12 抖动破纯竖向梯度）——非叶面腹背语义（无两面色差——族内第 4 数据点）
float bngExp = clamp((vTreePos.y - 3.45) / 3.5, 0.0, 1.0);
bngExp = clamp(bngExp + (fract(vLeafRand * 5.113 + 0.23) - 0.5) * 0.24, 0.0, 1.0);
vec3 bngLight = mix(vec3(0.844, 0.851, 0.918), vec3(1.156, 1.149, 1.073), bngExp); // 阴灰绿暗 ↔ 阳黄绿亮（端点 = needleColorShade/Sun 对构造中点 #606d47 的 sRGB 比值 × 0.65 观感软化——算术对称，暴露度 0.5 处 = 中点色）
bngLight *= mix(vec3(1.0), vec3(1.03, 1.02, 1.04), bngExp * 0.10); // 微白粉（needleGlaucousBloom 0.10 微档——整冠浅色细线 + 微白粉感 Observed s04/s05；B > R > G 去饱和冷灰）
bngLight = mix(bngLight, bngLight * vec3(1.12, 1.15, 0.95), step(fract(vLeafRand * 7.513 + 0.37), 0.09)); // 新梢黄绿-灰绿（needleJuvenility 0.20 × 新梢少数相 0.45 ≈ 9% 卡——一年生小枝浅黄绿 Verified [1]+s04/s06；域内变体非季相卡）
// 气孔线白线（近景束卡微特征——「叶背及腹面两侧均有气孔线」FRPS Verified 的浅色细线观感）：
// 束坐标同式重算（纯 ALU——与 SDF 同源公式）取最近针划中线窄带提亮；针划可解析门同步
//（亚像素域白线归零——退化门色层同步，第三次消费）
float bngScS = vUv.y * ${n} + vLeafRand * ${n};
float bngScK = floor(bngScS);
float bngScH = fract(sin(bngScK * 12.9898 + vLeafRand * 78.233) * 43758.5453);
bngScS += (bngScH - 0.5) * 0.26;
float bngScCw = 0.11 * cos(bngScK * 2.3998 + vLeafRand * 6.28318);
float bngScFl = clamp(fract(bngScS) / 0.84, 0.0, 1.0);
float bngScSp = 0.085 + 0.05 * fract(bngScH * 7.313 + 0.31);
float bngScX = vUv.x - 0.5 - bngScCw;
float bngScD = min(abs(bngScX), min(abs(bngScX - bngScSp * bngScFl), abs(bngScX + bngScSp * bngScFl))); // 最近针划中线
float bngScGate = smoothstep(1.2, 4.5, 0.084 / max(fwidth(vUv.x - 0.5), 1e-4)); // 针划可解析门（与 SDF 域②同式——亚像素域归零）
bngLight = mix(bngLight, bngLight * vec3(1.13, 1.14, 1.10), (1.0 - smoothstep(0.005, 0.013, bngScD)) * bngScGate * 0.50);
// 逐卡身份（aLeafRand）：色相两端（冷蓝绿灰 ↔ 暖黄绿——深绿-中绿带黄绿/灰绿域 Spec §5.2；通道摆幅 ≤15% 纪律）+ 明度 ±8%（去相关取样）
vec3 bngHue = mix(vec3(0.96, 1.00, 1.03), vec3(1.05, 1.04, 0.93), fract(vLeafRand * 5.913 + 0.23));
float bngLuma = 0.92 + 0.16 * fract(vLeafRand * 3.719 + 0.57);
`;
}

/** High 专属：中频簇团斑块（位置域 1× vnoise——Mid/Low 去采样；赋值域变量） */
const BUNGEANA_NEEDLE_CLUMP = /* glsl */ `
// 冠内：中频簇团斑块（波长 ≈1/1.05 ≈ 0.95m——松散叶团簇 Observed s01–s03 的团块簇聚读向；采样偏移与先例去相关）
bngClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 1.05 + vec2(41.7, 63.2));
`;

/** High 专属：合成（簇团乘子——均值 0.5 精确保均；受光色差在 bngLight——三档保留面） */
const BUNGEANA_NEEDLE_MUL_HIGH = /* glsl */ `
vec3 bngMul = bngHue * bngLuma * bngLight * (0.94 + 0.12 * bngClump); // 簇团乘子
diffuseColor.rgb *= bngMul;
`;

/** Mid/Low：合成（去簇团项——乘子均值化消去，值噪声均值 0.5 精确保均） */
const BUNGEANA_NEEDLE_MUL_SIMPLE = /* glsl */ `
vec3 bngMul = bngHue * bngLuma * bngLight; // Mid/Low：簇团乘子均值化消去（0.94 + 0.12×0.5 = 1.0）
diffuseColor.rgb *= bngMul;
`;

/** 束卡背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  硬针疏散冠·中幅 0.42：家族链 夏栎 0.65 > 水杉 0.46 > **白皮松 0.42** > 雪松 0.38 >
 *  圆柏 0.28 > 樟 0.22——疏散半透光结构（4 照片 8 问一致）逼近水杉高档、硬针厚质
 *  下调（判定 8「透射中幅」）。透射色中绿偏黄绿 (0.54, 0.82, 0.42)（深绿-中绿带
 *  黄绿/灰绿域冠的透光读向——vs 水杉亮黄绿/圆柏深青绿）；Step 4 校准回路开放。 */
const BUNGEANA_NEEDLE_TRANSLUCENCY = /* glsl */ `
// bungeana:needle —— 背光透射（硬针疏散冠·中幅 0.42）：视线与阳光反向时针束透中绿偏黄绿
//（疏散冠半透光读向 Observed s01–s03——4 照片 8 问全一致的族内第 4 种透光语言）
#if NUM_DIR_LIGHTS > 0
  float bngBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float bngTransVar = 0.55 + 0.45 * fract(vLeafRand * 9.117 + 0.47); // 逐卡透光强度变奏
  outgoingLight += vec3(0.54, 0.82, 0.42) * directionalLights[0].color
    * pow(bngBack, 3.0) * bngTransVar * bngAlpha * 0.42;
#endif
`;

// ── 双态果卡帧体（皮材质 v 域二分支之果卡段——实色赋值非乘性；
//    alpha = 同一 SDF 生成器圆端带——aLeafRand 恒 0 传常数，变奏源 = vUv.x 态类色档）──

/** 双态果卡帧体（皮材质分支之一，三档共用——两年熟双态双色 + 圆端带轮廓） */
const BUNGEANA_CONE_BODY = /* glsl */ `
  // 果卡（v∈[1,2) 冻结域②——沿果轴；u = 逐果态类色档 ∈ [0.02,0.98]）：**u ≥ 0.5 二年生
  // 近熟淡绿-黄褐 / u < 0.5 一年生绿幼果**（双态两年熟判定 6 的 u 域承载——juniperus
  // 先例名路线；coneClassRatio 0.25 幼果主导归几何 posHash 编码，账目归 3a，冻结接口分工）
  float bngCs = clamp((vUv.y - 1.0) / 0.95, 0.0, 1.0); // 卡内轴向帧
  float bngMatC = step(0.5, vUv.x); // 态类分类门（u 域阈值 0.5）
  float bngMg = clamp((vUv.x - 0.5) / 0.48, 0.0, 1.0); // 近熟端档内变奏
  float bngYg = clamp((0.5 - vUv.x) / 0.48, 0.0, 1.0); // 幼果端档内变奏
  // 一年生绿幼果（coneColorYoung 0x5d7a44 sRGB→线性 (0.109,0.195,0.058)——生长季主视觉
  // 树上果态 = 一年生小绿幼果〔两年熟机制 Verified [1] + 幼果照片弱读 s06〕；主导 0.75）
  vec3 bngConeY = vec3(0.109, 0.195, 0.058) * (0.88 + 0.24 * bngYg); // ±12% 档内变奏
  // 二年生近熟淡绿-黄褐（coneColorMature 0xa2985a 线性 (0.361,0.314,0.102)——「成熟前淡绿色，
  // 熟时淡黄褐色」FRPS Verified 的生长季半熟外推 Inferred；少量 0.25——下垂黄褐成果 10–11 月窗不入主语境）
  vec3 bngConeM = vec3(0.361, 0.314, 0.102) * (0.88 + 0.24 * bngMg); // ±12% 档内变奏
  vec3 bngCone = mix(bngConeY, bngConeM, bngMatC); // 双态并存（判定 6——幼果主导反向档 vs 圆柏熟果主导 0.75）
  bngCone *= 1.0 - smoothstep(0.32, 0.50, abs(bngCs - 0.5)) * 0.18; // 两端收边暗（卵圆明暗读向）
  diffuseColor.rgb = bngCone;
  bngAlpha = bngCardAlpha(vUv, 0.0); // 轮廓 = 双帧生成器圆端带（单一来源——皮表面/束表面/深度同串；器官帧不消费 rand）
`;

// ── 组 0（皮 + 果卡）配方主体（<map_fragment> 后注入——工厂 body 内 v 域二分支：
//    皮 v<1.0〔本节〕/ 果卡 [1,2)〔上节帧体〕）─────────────────────────────────

/**
 * 皮域：白基调多色斑驳薄片剥落核心（第 17 语言——机制沿 platanus 斑块剥落跨族
 * 复制授权〔代场 tone + 破碎场 fine + 阈值分带 + 边缘缝〕，色相序列全新）。域
 * 变量赋值段（bngWhite/bngDark/bngRim/bngNew 在此赋值、roughness 注入消费——
 * 跨 include 预声明见工厂内 domainVars）。
 */
const BUNGEANA_BARK_TONE = /* glsl */ `
// 代场（地图状大斑块主结构——第 17 语言；机制沿 platanus 跨族复制，色相序列全新）：
// 频率 (7.0, 83.0) 物理各向同性（u 环绕 ≈1.1m/7 ≈ 0.157m；v 主管弧 ≈11.5m×0.92/76 ≈ 0.139m——
// 两向同尺度 ⊂ barkPlateMin/Span 0.10–0.20 工程推断域；v ∈ [0,0.92] 逐管归一契约假设——3a 合并对账面；
// 分支管逐管归一后斑块等比缩小 = 族先例接受的近似，3c 校准回路开放）
bngTone = facVnoise(vec2(vUv.x * 7.0, vUv.y * 83.0) + vec2(17.3, 29.7)); //（纯赋值不重声明——域变量预声明见工厂 domainVars，防作用域遮蔽 roughness 消费）
// 株内「上白下深」大梯度（s07 Verified 族内最强——年龄皮色轴〔幼灰绿→斑驳→白〕的替代承载，Step 2 记档）：
// 干基老皮带（白带收缩）→ 上部主干/大枝新皮带（白带扩张）——「越向梢部越白越光滑」
float bngWhiteRamp = clamp((vTreePos.y - 1.5) / 6.5, 0.0, 1.0);
float bngToneH = bngTone + mix(-0.10, 0.14, bngWhiteRamp); // 下端 -0.10 收缩 / 上端 +0.14 扩张（全槽中龄斑驳基调恒等——Step 2 结论）
`;

/** High 专属：破碎场（1× vnoise——Mid/Low 去采样；赋值域变量） */
const BUNGEANA_BARK_FINE = /* glsl */ `
bngFine = facVnoise(vec2(vUv.x * 16.0, vUv.y * 190.0) + vec2(43.9, 11.6)); // 破碎场（带内二级色变 + 细碎小斑 + 代块边缘扰曲——platanus 机制；纯赋值不重声明）
`;

/** High：分带（fine 扰曲阈值——地图状曲折边 + fine 门控亮缘/新皮露斑；赋值域变量） */
const BUNGEANA_BARK_BANDS = /* glsl */ `
float bngTj = bngToneH + (bngFine - 0.5) * 0.10; // 阈值扰曲（地图状不规则曲折边——零额外阈值的曲折带界；块内局部量）
bngDark = 1.0 - smoothstep(0.14, 0.22, bngTj); // 近黑小斑/节疤带（窄过渡 0.08——Spec @1.1 终审槽间差异域窄端）
bngWhite = smoothstep(0.44, 0.56, bngTj); // 乳白/灰白主导带（中等过渡 0.12——Spec @1.1 终审槽间差异域中端；阈值中心 0.50 → ≈50% 份额 ⊂ 40–65% 域）
bngRim = clamp(max(1.0 - abs(bngTj - 0.50) / 0.045, 1.0 - abs(bngTj - 0.18) / 0.045), 0.0, 1.0) * smoothstep(0.40, 0.62, bngFine); // 薄片翘边亮斑缘（活跃剥落带——深浅交界处窄窗 + fine 门控曲折；s08 终审替补双问一致）
bngNew = smoothstep(0.80, 0.88, bngToneH) * smoothstep(0.55, 0.75, bngFine); // 淡黄绿新皮露斑（最新剥落代——高 tone × fine 双门 ≈8%）
`;

/** Mid/Low：分带（去 fine 扰曲/门控——直缘；域变量同名同义） */
const BUNGEANA_BARK_BANDS_SIMPLE = /* glsl */ `
float bngTj = bngToneH; // 直缘（去 fine 扰曲——中距贴片感保留；块内局部量）
bngDark = 1.0 - smoothstep(0.14, 0.22, bngTj); // 近黑带保留（与 High 逐字同源）
bngWhite = smoothstep(0.44, 0.56, bngTj); // 乳白主导带保留（与 High 逐字同源）
bngRim = clamp(max(1.0 - abs(bngTj - 0.50) / 0.045, 1.0 - abs(bngTj - 0.18) / 0.045), 0.0, 1.0) * 0.55; // 直缘亮线（去 fine 门控取固定中值——活跃剥落带中距读向保留）
bngNew = smoothstep(0.82, 0.90, bngToneH) * 0.45; // 新皮露斑 tone 单门（fine 均值 0.5 近似——份额守恒收窄带）
`;

/** High：合成（白基调多色四带 + 亮缘 + 浅纵细纹 + 干基裂沟端 + 干基暗化） */
const BUNGEANA_BARK_MUL = /* glsl */ `
vec3 bngBrown = mix(vec3(0.85, 0.84, 0.82), vec3(1.0), smoothstep(0.35, 0.65, bngFine)); // 灰褐 ↔ 深灰褐（fine 带内二级色变——次要色带 20–30%）
vec3 bngBarkMul = mix(bngBrown, vec3(1.955, 2.068, 2.152), bngWhite); // 乳白/灰白主导（barkPlateColor 0xd9d5c6 对基色全比值——identity 白无软化，40–65% 主导带 + 远景白干第一识别）
bngBarkMul = mix(bngBarkMul, vec3(1.496, 1.709, 1.304), bngNew); // 淡黄绿新皮露斑（FRPS「露出淡黄绿色的新皮」Verified——0xa6b078 工程映射对基色比值）
bngBarkMul = mix(bngBarkMul, vec3(0.522, 0.511, 0.501), bngDark); // 近黑小斑/节疤（barkGrooveColor 0x342f29 比值 × 0.90 软化——5–10% 点缀）
bngBarkMul *= 1.0 + bngRim * 0.14; // 薄片翘边亮斑缘（亮斑边缘微浮雕反光——vs platanus 代块缝深褐的分化）
float bngStria = 0.5 + 0.5 * sin(vUv.x * 6.28318 * 60.0 + bngTone * 2.7); // 浅纵细纹（周向 60 列 + tone 扰曲防机械规整——「近光滑紧贴 + 浅纵细纹」Verified s07/s08；barkGrooveDepth 0.18 族内最低的弱浮雕承载）
bngBarkMul *= 1.0 - bngStria * 0.045; // 细纹弱暗（近光滑弱浮雕）
float bngBase = 1.0 - smoothstep(0.6, 1.8, vTreePos.y); // 干基老皮带（株内梯度干基端）
bngBarkMul *= 1.0 - bngBase * (0.10 + 0.10 * bngStria); // 干基暗化 + 裂沟加深（老树基部段浅纵裂——FRPS 老树皮段裂沟端）
diffuseColor.rgb *= bngBarkMul;
`;

/** Mid：合成（去 fine 二级色变/细纹——近景细节；三色带 + 亮缘 + 新皮 + 干基暗化保留） */
const BUNGEANA_BARK_MUL_MID = /* glsl */ `
vec3 bngBrown = vec3(0.925, 0.920, 0.910); // 灰褐均值（fine 二级色变均值化）
vec3 bngBarkMul = mix(bngBrown, vec3(1.955, 2.068, 2.152), bngWhite); // 乳白主导带保留（中距「白基调多色斑驳干面」= 最强身份信号）
bngBarkMul = mix(bngBarkMul, vec3(1.496, 1.709, 1.304), bngNew); // 新皮露斑保留（tone 单门版）
bngBarkMul = mix(bngBarkMul, vec3(0.522, 0.511, 0.501), bngDark); // 近黑带保留
bngBarkMul *= 1.0 + bngRim * 0.14; // 直缘亮线保留
bngBarkMul *= 1.0 - (1.0 - smoothstep(0.6, 1.8, vTreePos.y)) * 0.10; // 干基暗化保留（裂沟加深项随细纹去）
diffuseColor.rgb *= bngBarkMul;
`;

/** Low：合成（再去株内梯度/新皮/亮缘/干基暗化（低调项）；三色带拼贴保留——远距白干剪影保留面） */
const BUNGEANA_BARK_MUL_LOW = /* glsl */ `
vec3 bngBarkMul = mix(vec3(0.925, 0.920, 0.910), vec3(1.955, 2.068, 2.152), bngWhite); // 三色带拼贴剪影（远距「白斑驳干」Spec §7 远景保留面——白干第一识别特征 Unknown ⑤ 的 Low 承载；vs 榉树 Low 斑驳全去的分化）
bngBarkMul = mix(bngBarkMul, vec3(0.522, 0.511, 0.501), bngDark); // 近黑带保留（白斑驳对比剪影）
diffuseColor.rgb *= bngBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 束卡材质（组 1——**族内第 4 叶语言**：三针束卡 = 末级枝段多束聚合系统，判定 3）：
 * SDF 双帧生成器同串（组 1 顶点 v ∈ [0,1) 只命中束卡帧——单一来源纪律 + 深度共享）
 * alphaTest 裁切 + 受光色差（阳黄绿亮/阴灰绿暗——**无两面色差**：无 BACK 段、零
 * gl_FrontFacing，族内第 4 数据点）+ 微白粉 0.10 + 新梢黄绿 + 气孔线白线（针划
 * 可解析门同步）+ 中幅透光 0.42 + 逐卡变奏 + 风动两成分。level 分档（T012.4，
 * 缺省 'high'）：Mid 束单元 8 + 去簇团噪声/糙度项（受光/白粉/新梢/气孔线/透光/
 * hue·luma 保留——颜色层次档间连续保留面）；Low 束单元 5 + 再去透光，片元零噪声；
 * 果卡帧 SDF 三档同体。风动三档同源不动。
 * 底参：构造中点 #606d47（= needleColorSun 0x77864f + needleColorShade 0x49543e
 * 严格中点——暴露度 0.5 处即此色；cedrus 构造中点式——常绿单卡）/ m 0 / r 0.67
 * （硬针角质哑光-半光泽——family 链：圆柏 0.64 < 雪松 0.66 < 白皮松 0.67 <
 * ginkgo 0.68；无两面糙度差）/ DoubleSide（卡面双面可见，背面法线由 three 双面
 * 光照自动翻转——两面固有色同值）。
 */
export function createBungeanaNeedleMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x606d47, // 构造中点（受光色差 ramp 基点——严格中点下 sun/shade 端算术对称；Spec §5.2 深绿-中绿带黄绿/灰绿域身份）
    metalness: 0,
    roughness: 0.67, // 硬针角质（工程设定——family 链：樟 0.50 < 圆柏 0.64 < 雪松 0.66 < 白皮松 0.67 < ginkgo 0.68 < 水杉 0.70；无两面糙度差）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 双帧卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const cardSdf = bungeanaCardSdfSource(level); // 单一来源（表面/深度共享同档同串）
  const needleBody = level === 'high'
    ? bungeanaNeedleHead(level) + BUNGEANA_NEEDLE_CLUMP + BUNGEANA_NEEDLE_MUL_HIGH
    : bungeanaNeedleHead(level) + BUNGEANA_NEEDLE_MUL_SIMPLE; // Mid/Low 同体（档差在 SDF 束单元数 / 簇团段 / 透光注入）
  // 跨 include 域变量预声明（map 注入块内赋值 / roughnessmap 注入消费——块内纯赋值
  // 不重声明防作用域遮蔽；bngClump High 注入段赋值、Mid/Low 为无害死值 0.5）
  const domainVars = 'float bngClump = 0.5; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一）\n';
  const body = /* glsl */ `
// bungeana:needle —— 组 1 束卡（第 4 叶语言：螺旋束位行窗列 + 三针小扇——判定 3；
// SDF 双帧路由保留为单一来源纪律 + 深度同串，组 1 顶点 v 恒 ∈ [0,1) 不命中果卡帧）
${domainVars}${needleBody}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${BUNGEANA_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${BUNGEANA_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${cardSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${body}`,
    );
    if (level === 'high') { // 糙度注入仅 High（簇团微变——无两面糙度差，Mid/Low 无项不注入）
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + (bngClump - 0.5) * 0.05, 0.05, 1.0); // 簇团糙度微变（两面同值——无两面语义）`,
      );
    }
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${BUNGEANA_NEEDLE_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `bungeana:needle${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（皮 + 双态果卡——沿 juniperus 组织：器官卡入皮组，v 域二分支）：
 * 皮 = **第 17 语言白基调多色斑驳薄片剥落**（代场 (7.0, 83.0) 物理各向同性地图状
 * 大斑块〔机制沿 platanus 跨族复制授权〕+ 白基调多色四带〔乳白/灰白主导 ≈50%
 * 全比值无软化 + 灰褐/深灰褐 fine 二级 + 近黑小斑 + 淡黄绿新皮露斑〕+ 边缘窄-
 * 中等过渡带〔smoothstep 0.12/0.08 + High fine 扰曲〕+ 株内「上白下深」大梯度
 * 〔tone 高度偏移——年龄皮色轴替代承载〕+ 薄片翘边亮斑缘 + 近光滑弱浮雕浅纵细纹
 * + 干基深色裂沟端）；果卡 [1,2) = 双态双色（u ≥ 0.5 二年生近熟淡绿-黄褐 / u < 0.5
 * 一年生绿幼果主导 0.75）——器官轮廓 = 双帧 SDF 圆端带（单一来源生成器——与束
 * 表面/深度同串；aLeafRand 恒 0 传常数，变奏 = vUv.x 态类色档）。level 分档
 * （T012.4，缺省 'high'）：Mid 去破碎场 fine/浅纵细纹（近景细节），三色带 + 株内
 * 梯度 + 新皮单门 + 直缘亮线 + 干基暗化保留；Low 再去株内梯度/新皮/亮缘/干基
 * （低调项），**三色带拼贴保留**（远距「白斑驳干剪影」Spec §7 远景保留面——
 * vs 榉树 Low 斑驳全去的分化记档），1× vnoise。风动 = 两成分与束卡同公式同相位
 * （aBend 恒 0 高频颤层天然不作用；果卡随整冠摆）。
 * 底参：灰褐主调 #6f675c（barkBaseColor——灰褐/深灰褐次要色带，s07/s08 Observed）/
 * m 0 / r 0.84（近光滑微泽——「表面近光滑紧贴」Verified；果卡帧定值 0.58/0.50
 * 覆写）/ DoubleSide + alphaTest 0.5 + alphaToCoverage（**果单面卡交叉双卡需双面
 * 读向**——背面剔除留盲区角；皮域 alpha 恒 1 实心不受裁，皮管闭合由深度测试淘汰
 * 背面，微 overdraw 记档）。
 */
export function createBungeanaBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x6f675c, // 灰褐（barkBaseColor——灰褐/深灰褐次要色带 20–30% Observed s07/s08；白基调多色带的基面）
    metalness: 0,
    roughness: 0.84, // 近光滑微泽（「表面近光滑紧贴」Verified s07/s08——vs 纵裂族高糙哑光）
    side: THREE.DoubleSide, // 果单面卡双面读向（皮域实心闭合不受影响——见 docstring）
    alphaTest: 0.5, // 果卡圆端带裁切（皮域 alpha 恒 1 实心——不裁）
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // 拼贴域 = 皮圆柱 uv + 器官卡 v 帧（u=环绕一周、v=逐管归一 [0,0.92]——契约见 TONE 注释）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const cardSdf = bungeanaCardSdfSource(level); // 器官轮廓单一来源（与束表面/深度同档同串）
  const barkCore = level === 'high'
    ? BUNGEANA_BARK_TONE + BUNGEANA_BARK_FINE + BUNGEANA_BARK_BANDS
    : BUNGEANA_BARK_TONE + BUNGEANA_BARK_BANDS_SIMPLE;
  const barkMul = level === 'high'
    ? BUNGEANA_BARK_MUL
    : level === 'mid'
      ? BUNGEANA_BARK_MUL_MID
      : BUNGEANA_BARK_MUL_LOW;
  // 跨 include 域变量预声明（map 注入块内赋值 / roughnessmap 注入消费；Mid/Low 未赋
  // 项为无害死值——bngFine 0.5 / bngRim 0.0 等）
  const domainVars = 'float bngWhite = 0.0; float bngDark = 0.0; float bngRim = 0.0; float bngNew = 0.0; float bngTone = 0.5; float bngFine = 0.5; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一）\n';
  const body = /* glsl */ `
// bungeana:bark —— 组 0 皮 + 双态果卡 v 埧二分支（皮 <1.0 / 果卡 [1,2)——冻结域表；判别阈值 1.0）
${domainVars}float bngAlpha = 1.0; // 皮域实心（分支内果卡帧覆写为圆端带 SDF）
if (vUv.y >= 1.0) {
${BUNGEANA_CONE_BODY}
} else {
${barkCore}${barkMul}
}
diffuseColor.a = bngAlpha;`;
  const barkRoughness = `if (vUv.y >= 1.0) {
  roughnessFactor = mix(0.58, 0.50, step(0.5, vUv.x)); // 果卡定值（一年生绿幼果 0.58 / 二年生近熟 0.50 覆瓦鳞哑光-半泽——三档同）
} else {
  roughnessFactor = clamp(0.84 - bngWhite * 0.10 + bngDark * 0.05, 0.05, 1.0); // 乳白斑光滑（白皮新露近光滑 identity 光泽读向）+ 近黑斑微糙（三档同——Mid/Low 死值 0 无项）
}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${BUNGEANA_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${BUNGEANA_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${cardSdf}`,
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
  material.customProgramCacheKey = () => `bungeana:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 束影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（**SDF 随档变体**——束单元数 12/8/5 递减即 LOD 内容）：Mid = Mid
 * SDF / Low = Low SDF（表面/影档内一致——表面/影裁切叶形同档同步）。**深度片元
 * 不挂噪声库**——双帧 SDF 全 ALU（inline sin-hash 非 facVnoise）。组 0 守卫：皮域 +
 * 果卡（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质时组 0 不被束卡
 * SDF 误裁（triadica 恒等 attribute 先例）；果卡影 = 实心方卡剪影（vs 表面圆端带
 * 略大——mm–cm 级点彩果在影贴图 ~16 cm/texel 下不可辨，记档取舍沿族先例口径）。
 * 风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap 按主材质
 * DoubleSide 覆写为双面（束卡/果卡两面皆可投影）；alphaTest 由 shadowMap 按主材质
 * alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createBungeanaNeedleDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 双帧卡 uv
  const cardSdf = bungeanaCardSdfSource(level); // 与束表面同档同串（单一来源生成器）
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
${cardSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, bngCardAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱/果卡 uv 域不误裁）；束卡非零 → 双帧 SDF 裁切`,
    );
  };
  material.customProgramCacheKey = () => `bungeana:needle-depth${levelKeySuffix(level)}`;
  return material;
}

/**
 * 白皮松材质成套聚合（冻结接口⑥——3a 入口按此 import）：返回 { needle, bark,
 * depth } 三件套。装配分工：组 0（皮管 + 双态果卡）→ bark；组 1（束卡）→
 * needle；depth → InstanceSource.customDepthMaterial 通道（池三建网格点统一挂载）。
 * 每次调用全部 new（D17——所有权随调用移交调用方）；level 透传三工厂（档位配套
 * 传参归 asset build 路由，缺省 'high'）。
 */
export interface BungeanaMaterialSet {
  /** 组 1 束卡材质（束卡 v∈[0,1) 帧顶点） */
  needle: THREE.MeshStandardMaterial;
  /** 组 0 皮 + 双态果卡材质（皮管 v<1.0 + 果卡 v∈[1,2)——冻结接口②） */
  bark: THREE.MeshStandardMaterial;
  /** 深度材质（customDepthMaterial 通道——冻结接口④，与束表面同档同串 SDF） */
  depth: THREE.MeshDepthMaterial;
}

/** 白皮松材质成套工厂（冻结接口⑥具名导出——3a 入口消费面） */
export function createBungeanaMaterials(level: ProceduralLevel = 'high'): BungeanaMaterialSet {
  return {
    needle: createBungeanaNeedleMaterial(level),
    bark: createBungeanaBarkMaterial(level),
    depth: createBungeanaNeedleDepthMaterial(level),
  };
}
