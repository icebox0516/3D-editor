/**
 * runtime/procedural/tree/juniperus/juniperusMaterials —— 圆柏（Juniperus chinensis，
 * asset_tree_juniperus）鳞卡/刺卡/树皮（含浆果球果卡）/针影深度材质（T012.3 Step 3b，
 * 针叶族 conifer **第三例材质实例**——组织照抄雪松/水杉先例，形态语言按圆柏改写：
 * 绳状鳞卡 = 族内**第 3 叶语言 SDF** + 二型叶双帧同材质 + 浆果白霜 + 第 16 树皮）。
 *
 * 职责：复制族内两例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce
 * 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 * <color_fragment> 绝不触碰），物种配方按圆柏自己的 Reference Spec 换装——Spec
 * docs/research/juniperus-reference.md **@1.1**（任务书锚点 1.1，开工前已校验一致，
 * 2026-09-29 主代理采样终审通过——含 s06 两点分歧处置〔两面色差按文献消费 = 无〕）。
 * 消费冻结契约（只读）：conifer/coniferShapeProfile（定稿 80 位）+ juniperus/
 * juniperusShapeProfile（8 槽数值面，顶层 53 键位锁）——needleMaterial / bark / wind /
 * cone 色字段为本文件消费面；**数值按家族先例以字面量 + 同源注释消费（硬编码，与
 * profile 侧无联动通道——cedrus ⑥ 同型家族缺口，记缺口候选⑤；材质测试以 profile
 * 导入值做 JS 锚交叉——笔误防线）**。
 *
 * 【与几何侧（3a）的材质侧契约声明（并行冻结面，合并阶段对账——派遣简报冻结接口）】
 *   - 三工厂签名沿 cedrus 常绿单卡先例（无 preset 尾参——D44 常绿无卡：判定/预设
 *     「default 单卡」，无季相证据不建卡）：(level: ProceduralLevel = 'high') =>
 *     MeshStandardMaterial / MeshDepthMaterial；每次调用全部 new（D17）。
 *   - 恰两组（沿 metasequoia 组织：器官卡入组 0）：组 0 = **皮管 + 浆果球果卡**
 *     （createJuniperusBarkMaterial 按 uv v 域二分支〔皮条片 v<1.0 / 球果 [1,2)〕；
 *     器官单面卡交叉双卡需双面读向 → DoubleSide + alphaTest 0.5——皮域 alpha 恒 1
 *     实心不受裁，皮管闭合由深度测试淘汰背面，微 overdraw 记档）；组 1 = 叶卡
 *     （createJuniperusNeedleMaterial——**双叶型并存族内首例**：绳卡 + 刺卡双帧）。
 *   - **uv v 帧域三级（冻结接口 2，阈值 1.0/2.0）**：绳状鳞卡 v∈[0, 0.99] 卡基→卡尖
 *     （u = 横向全幅——四列域）；浆果球果卡 v∈[1.0, 1.95] 沿果轴（u = **逐果熟度
 *     色档 ∈ [0.02, 0.98] 常量**——见果分类编码）；刺卡 v∈[2.0, 2.95] 刺基→刺尖
 *     （u = 横向）；0.95 安全边距沿 metasequoia 器官帧惯例。
 *   - **果分类编码（冻结接口 3——「沿 cedrus 机制〔aConeClass 或先例名〕」的先例名
 *     路线，零新增 attribute）**：cedrus 两类果并存 = uv v 域分流〔将熟 [5,6)/幼果
 *     [6,7)〕；圆柏冻结接口 2 只给球果一个 v 帧 → 分类走 **u 色档域：u ≥ 0.5 翌年
 *     霜熟果（coneClassRatio 0.75 主导）/ u < 0.5 当年绿幼果**（几何 posHash 账目
 *     逐果定类后按域编码 u——账目归 3a，冻结接口 4 分工）。合并阶段与 3a 实编码
 *     对账（cedrus ③ 同型风险，记缺口候选②）。
 *   - attribute 契约（沿族先例）：aLeafRand = 叶卡（绳卡/刺卡）逐卡 ∈ [0,1) 非零
 *     种子；器官卡（球果）随皮组恒 0（器官刚性——aBend 亦恒 0）；aBend = 叶卡沿枝
 *     末端权重（组 0 恒 0 免颤）；aSeed = 实例个体相位（Runtime 逐实例——几何零
 *     aSeed 顶点属性）。**零几何 rng**（本文件纯 uv/attribute 函数，无任何随机消费）。
 *   - 皮管域 v ∈ [0, 0.92] 逐管归一（TUBE_V_MAX——沿 metasequoia 同名冻结契约假设；
 *     与器官域恒隔离，主干底盖盘同守）；条片纵向频率按逐管归一口径定档（72 段频率/
 *     管程——见皮配方节）。3a 若实编码不同 → 合并阶段对账（记缺口候选⑥）。
 *   - 卡轮廓契约：绳卡卡幅 = rosetteCardMin/Span 0.18–0.30 m × needleCardAspect
 *     2.6–4.2（几何侧定幅）；刺卡 = needleCardLen 0.12–0.20 m；球果卡 = coneSize
 *     6–8 mm × 交叉双卡边距（几何定幅）——SDF 消费卡内归一 uv，幅值不进材质。
 *
 * 【绳状鳞卡 SDF——族内第 3 叶语言（本任务核心新形，限定文件内最小扩展）】
 *   族内前两例：雪松莲座簇卡 = 极坐标扇区窗列放射（离散放射）；水杉羽卡 = 对生羽列
 *   窗列（轴向两列）。圆柏「叶」单位 = **末级鳞叶小枝聚合系统**（Spec §结构层级：
 *   「末级鳞叶小枝绳状/corded 聚合自成叶化单元（非羽状、非平铺喷雾）」Verified
 *   [1][2]+s06/s02）——结构信息 = 「中轴枝 + 四列交互对生贴生鳞叶轮廓并集」的绳状
 *   3D 聚合。新路径 = **对生行窗列 + 四列错位法**（vs 水杉的横向二列、vs 雪松的径向
 *   放射）：
 *   ① 对生行窗列：s = v × N（N = 绳单元数 = profile rosetteNeedles 24 为 High 基准
 *      ——真鳞叶列距 2.5–5 mm × 卡长 0.18–0.30 → 真列数 36–120，相邻 2–4 对并为
 *      绳状单元；LOD 降档 = 递减派生归 3b，冻结单 **24/14/8**）；逐单元 hash →
 *      单元位抖动 ±13%（非机械规整）；
 *   ② 四列错位（交互对生四列贴枝 10–30° s06 Verified 的投影抽象）：u 四列域
 *      floor(u×4)，**邻列半节距错位**（decussate stagger——列间关节错开 = 绳股编
 *      织读向的主载体）+ 奇偶行斜向交替剪切（交互对生 90° 交错的投影——单元界微斜
 *      绳股斜纹）；
 *   ③ 绳单元带：带占节距 80% + 绳隙 20%（细密绳状纹理——vs 羽列 55% 覆盖的密实
 *      端；密实 90–95% 实心冠的卡面质量基调）；
 *   ④ 细杆轮廓包络：sqrt(sin) 半椭圆端帽 × 基部微收（末级小枝绳状侧影——两端圆收
 *      的细杆）+ 中轴枝常覆盖条（mix 0.014→0.007 渐细——贴生鳞叶的枝轴，近连续
 *      不断裂）；
 *   ⑤ **密度不随卡尺度稀释（012.2 羽卡教训）**：N 为卡内 uv 固频（分档锁定），
 *      卡幅 0.18–0.30 m → 绳隙物理宽 1.5–2.5 mm、节距 7.5–12.5 mm——近景可辨、
 *      中距 M25 亚像素退化为整杆读向（细密绳状质感 = 近中距纹理尺度控制）。
 *   ⑥ **导数感知亚像素退化门（T012.3 Step 4 第二轮·材质域校准——H1/H3）**：
 *      **近景可解析度 jnpRead = max(绳节距门, 卡宽门)——任一向可读即原值**（M25/M8
 *      屏幕尺度域因斜置姿态重叠，单门不可分）：节距 px = 1/(N·|∇v|)、卡宽 px =
 *      1/|∇u|。可解析域（M8 面向 pitch ≥1.4px/宽 ≥25px + 斜置可读卡）带占 0.80/
 *      坡宽 0.02/剪影原值**逐位不动**（近景绳列身份不变——M8 帧边缘能量与游程
 *      结构回归验证）；亚像素域（M25 全卡 pitch ≤1.3——卡长 ≤31px 两向均不可读）
 *      ①带占向 1.00 收敛（绳隙→带色——012.3 第一轮根因「24 绳单元亚像素经
 *      alphaToCoverage 淡染折损 ~0.5」的 H1 对策）②坡宽 max(0.02, fwidth(d))
 *      （≈1px 覆盖 AA——SDF 在像素 footprint 内均值化，替代逐点采样 + A2C 抖动
 *      的绳隙扩张，H3 对策）③剪影厚度保持 jnpSolidify（H3b——A2C 4x 样本量化
 *      下中低 alpha 解析为 2–3/4 样本的淡染补偿：低尾裁除 + 高段饱和 + 薄卡
 *      +0.19 补宽；绳卡/刺卡共用、刺卡独立门带 1.2–4.5px）。门作用于表面/深度
 *      同串（生成器单一来源——影裁切同步收敛）。
 *   全 ALU 零 facVnoise（窗列/错位 hash 全 inline sin-hash）——深度材质不挂噪声库
 *   的前提；坡宽 0.02（绳隙细结构口径——alphaToCoverage 承担 AA）。
 *   **刺卡帧（二型叶 minority——判定 3「做」，族内首例双叶型并存）**：cedrus 散生
 *   针 sin 单针包络**机制直承**，指数 1.55→0.65（雪松披针针叶「上部较宽」↔ 圆柏
 *   刺叶披针-钻形**最宽中下段 ≈0.35**——FRPS「披针形，先端渐尖」+ NC "awl" 折中
 *   映射）；两条白粉带归色层非 alpha（刺叶上面气孔带 FRPS Verified——近景两调
 *   来源）；三棱/截面卡分辨率不可读记档不表达（cedrus 同判）。
 *   浆果球果帧轮廓 = v 埧圆端带（mm 级器官 AA 肩 0.08——metasequoia 器官帧同式；
 *   近球 6–8 mm 体积读向由几何交叉双卡承载）。
 *   三帧同函数同签名（表面/深度同源取用——单一来源经生成器保证；SDF 随档变体 =
 *   绳单元数 24/14/8，器官/刺卡帧三档同体）。
 *
 * 叶卡（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - **深绿-暗绿/蓝绿灰蓝霜调基色（default 单卡——判定/预设 4：常绿无季相证据不建
 *     卡）**：构造中点 #4a5d47 = (needleColorSun 0x64785e + needleColorShade
 *     0x2f4230) 严格中点（cedrus 构造中点式——常绿单卡先例；暴露度 0.5 处即此色）。
 *   - **阳灰绿亮/荫深绿暗受光色差（身份主律）**：冠层暴露度 ramp（冠基 1.2 m =
 *     trunkHeightRatio 0.15 × 8 锚 + 3.5 m 渐入带 + 逐卡 ±0.12 抖动破纯竖向梯度）
 *     mix(荫深绿 ×(0.766,0.811,0.789), 阳灰绿亮 ×(1.234,1.189,1.211))——端点 =
 *     needleColorShade/Sun 对构造中点的 sRGB 比值 × 0.65 观感软化（算术对称）。
 *     Spec §5.1「阳面灰绿亮/阴面深绿暗」s02 双读一致 Observed。**无两面色差**
 *     （终审修正口径：文献无两面差语句、刺叶白粉带不迁移——同雪松、异水杉）：无
 *     BACK 段、色路零 gl_FrontFacing、两面糙度同值（needleFaceContrast 省略即
 *     「无两面差」语义——契约缺口零新增）。
 *   - **白粉 needleGlaucousBloom 0.15（弱档）**：整冠灰蓝霜调（s01–s04 Observed
 *     深绿带灰蓝霜调）随暴露度 ×(1.04, 1.03, 1.06)（B > R > G 去饱和冷灰——
 *     cedrus 0.35 档 ×(1.10,1.07,1.14) 的等比弱化）。
 *   - **新梢黄绿-灰绿 needleJuvenility 0.22**（域内变体非季相卡）：10% 卡（0.22 ×
 *     新梢少数相 0.45）×(1.12, 1.15, 0.95)（s08 鳞叶黄绿→深绿渐变 Observed 直证）。
 *   - **刺叶两条白粉带（双叶型色层——族内首例）**：v≥2 帧门 + u 双带位 0.5±0.18
 *     ×(1.17, 1.19, 1.15) 0.55——「上面微凹，有两条白粉带」FRPS Verified（远看
 *     灰绿两调来源）；卡投影无法定向上面 → 双面同显记档（缺口候选③）。
 *   - 逐卡变奏 aLeafRand：色相两端冷蓝绿灰↔暖绿（通道摆幅 ≤15% 纪律——常绿冠均一）
 *     + 明度 ±8%（去相关取样）。
 *   - 中频簇团斑块（High）：密实连续冠内簇聚尺度 ≈0.87 m（频率 1.15——90–95%
 *     实心 Observed 的块状簇聚读向）。
 *   - 糙度 0.64（鳞叶硬质蜡质贴生——哑光-半光泽；family 链：樟 0.50 革质亮 <
 *     **圆柏 0.64 蜡质鳞叶** < 雪松 0.66 角质 < ginkgo 0.68 < 水杉 0.70 软条形；
 *     工程设定）；无两面糙度差。
 *   - **背光透射（密质贴枝·低幅试探值 0.28）**：家族链 夏栎 0.65 > 水杉 0.46 >
 *     雪松 0.38 > **圆柏 0.28** > 樟 0.22——密质贴生厚鳞叶硬质蜡质透光最弱（判定
 *     「透射低幅——密质贴枝 vs 水杉羽状软单元」）；组 1 双叶帧均透光（幅值按密质
 *     主导观感定档）。透射色 (0.42, 0.70, 0.48) 深青绿向（深绿蓝灰冠透光非黄绿
 *     透明感）。**Step 4 校准回路开放**。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent）；
 *     零贴图零 DataTexture（D13）。
 *   - **缘齿载波/脉型消费裁定（判定 9）：零消费**——鳞叶全缘无锯齿（贴生鳞叶形态
 *     无锯齿缘证据），卡缘纹理由 SDF 绳隙/单元界/杆包络承担（无独立载波项）；鳞叶
 *     无脉型（mm 级卡分辨率下不可读——记档不表达，沿 cedrus 三棱截面同判）。
 *
 * 浆果球果域（组 0 v∈[1,2) 帧体——双熟度双色 + 白霜，判定 5）：
 *   - **翌年霜熟果（u ≥ 0.5 主导 0.75）**：暗蓝紫褐果体 coneColorMature 0x3a3b52
 *     sRGB→线性 (0.042, 0.044, 0.084) × 档内 ±15% + **白粉霜层**（「熟时暗褐色，
 *     被白粉」FRPS Verified + s07/s08 暗蓝紫 70–80% + 霜蓝 15–20% Observed）=
 *     加性蓝灰覆层 mix →(0.160, 0.180, 0.240)，霜量 0.22–0.46 逐果浮动（u 档）；
 *     **白粉霜层三档保留**（中距霜蓝果点布冠 = Spec §7 中距身份信号——vs cedrus
 *     Mid 去白粉的分化点）；糙度 0.45（蜡质果霜微泽）。
 *   - **当年绿幼果（u < 0.5）**：coneColorYoung 0x5d7a48 线性 (0.110, 0.195,
 *     0.065) × 档内 ±12%（s08 同枝绿幼果 Observed）；糙度 0.58。
 *   - 两端收边暗 0.18（近球明暗读向）；轮廓 = 三帧生成器 v 埧圆端带（单一来源）。
 *
 * 皮（组 0 皮域）配方——**第 16 语言：灰-灰褐基调纵长条片剥落**（判定 6；条片机制
 *   沿用第 15 语言（水杉），色相轴换灰-灰褐 + 枝皮灰长纤维条剥高位门控 + 株内梯度）：
 *   - 主调 #595955 深灰（barkBaseColor——FRPS「树皮深灰色，纵裂，成条片开裂」
 *     Verified [1]）。
 *   - 条片网格（机制直承第 15）：周向 24 条片列 × 纵向 **72 段频率/管程**（v ∈
 *     [0,0.92] 逐管归一契约——主干全弧 ≈8 m / 0.92×72 ≈ 66 段 → 段长 ≈0.121 m ⊂
 *     barkPlateMin/Span 0.08–0.16 近真域〔8 m 级干按水杉 20 m 级 ×0.12–0.22 等比
 *     收〕）+ 低频游走 warp（「纵裂不规则」）+ 逐条片/逐段 hash + 纵向段相位逐列
 *     错开（断口交错）；**3c 出图面校准回路开放**。
 *   - 脊:沟 ≈ 2.9:1（沟半宽 = 0.08 + 0.09 × barkGrooveDepth 0.55 = 0.1295——第 15
 *     语言公式直承；中深端 → 脊相对更宽于水杉深索）；陡壁剖面 ±0.035 急变。
 *   - **三调色（灰-灰褐轴——第 16 语言色相区分锁：R ≥ G ≥ B 乘子，无水杉红褐
 *     基调）**：脊顶风化灰褐 = barkPlateColor 0x786f60 比值 × 0.70 软化 →
 *     ×(1.244, 1.173, 1.091)（脊心带 de>0.26–0.40 渐入）；脊侧 = 基色 ×1.0；沟底
 *     暗褐 = barkGrooveColor 0x33302b 比值 × 0.90 软化 → ×(0.616, 0.585, 0.555)。
 *   - 长纤维条翘边（第 15 机制）：条片缘区高频纵向锯齿游走 + 缘区微暗 ×0.88（High/
 *     Mid；Mid 去微暗留几何微扰）+ 横向断口沟（细于纵沟 ×0.82 暗化）+ 逐段深浅
 *     hash（剥落代际）。
 *   - **枝皮灰长纤维条剥高位门控（判定 6 增量）**：高位域（y>3.8–6.2 m 门——冠区
 *     主枝带）灰化 ×(0.99, 1.04, 1.05) + 断口沟深度衰减 ×(0.18→0.10)（条片连续
 *     变长 = 「枝皮灰长纤维条剥」s04/s02 Observed 读向）。
 *   - **株内梯度（幼枝灰绿→干灰褐——判定 6）**：更高位小枝带（y>5.0–7.2 m）灰绿
 *     ×(0.95, 1.07, 0.92)（鳞叶枝幼龄灰绿端——v 逐管归一契约下小弧长门退化，高位
 *     单门记档）。
 *   - 纤维细纹（High 1× vnoise——条片表面长纤维拉丝；Mid/Low 去采样）。
 *   - 干基暗化弱档（家族惯例 ×0.35）；苔藓/地衣不做（Spec 无记载——不做不编造）；
 *     微起伏归几何层（契约记档——几何侧树皮轮廓层未进契约，同两先例）。
 *
 * 风动（**两成分**——判定 8 + Spec §风动读向 Inferred：密实圆柱/卵圆连续冠体 +
 *   硬质鳞叶绳状小枝 → **整冠低频小幅摆为主成分** + 末级鳞枝细幅微颤；**顶梢成分
 *   不消费**——族内可选·雪松消费位，通直无点头第三例）：
 *   - 成分① 整冠低频小幅摆（**主成分**——密实质量体）：0.30 Hz（windTierFrequency）
 *     × 幅 0.022 m 顶（windTierAmplitude——tier > fringe 的主成分排位）；高度权重²
 *     × 1/8 锚。
 *   - 成分② 末级鳞枝细幅微颤：1.9 Hz（windFringeFrequency）× 幅 0.018 m
 *     （windFringeAmplitude——幅度 < 水杉羽状 0.055、频率 < 其 2.6 Hz：密质硬质
 *     读向；family 快颤链 9–23 rad/s 内带 11.94）；权重 = aBend（组 0 恒 0 免颤）；
 *     相位 = hash(aSeed + aLeafRand)——个体 + 逐卡双相位差。
 *   - **树高锚 8 m**（JUNIPERUS_TREE_HEIGHT_NOMINAL = slot-0 totalHeight 同源——
 *     锚同步轮 6–10 m 级；1/8 = 0.12500 命名常量注入 + 测试锚断言）。两成分皮/叶
 *     同公式同相位（不撕裂穿帮）；hash 常数 111.413/88.523 与先例相位流（sway
 *     77.669–107.317 / flutter 49.337–84.931）去相关。
 *
 * 深度材质（针影裁切，customDepthMaterial 契约通道——沿 SOP §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与
 *     叶表面材质共享同一 GLSL 生成器输出（同档同串——表面改叶形深度自动同步）。
 *   - **零噪声库注入**：三帧 SDF 全 ALU（inline sin-hash 非 facVnoise）。保护性
 *     约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 多材质网格守卫：组 0（皮 + 浆果卡）以恒等 attribute（aLeafRand=0）走实心
 *     分支，防绳卡 SDF 在圆柱/器官 uv 域上误裁出洞（triadica 恒等 attribute 先例）；
 *     浆果卡随皮组 → 影 = 实心方卡剪影（vs 表面圆端带略大——mm 级果在影贴图
 *     ~16 cm/texel 下不可辨，记档取舍沿 metasequoia 口径）。
 *   - 档位匹配：Mid = Mid SDF（14 绳单元）/ Low = Low SDF（8）——表面/影档内一致
 *     （SDF 随档变体 = 绳单元数递减）。customProgramCacheKey 三档分键（9 键契约）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T012.3，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build）：
 *   - 鳞卡 Mid：SDF 绳单元 24→14（几何簇卡数同步降——剪影连续归 3a 档间不变量）；
 *     去簇团噪声/糙度簇团项；受光色差/白粉/新梢/刺带/透光/hue·luma 三档保留（颜色
 *     层次档间连续保留面）。
 *   - 鳞卡 Low：SDF 8 单元 + 去透光（远距逆光透射不可辨）/簇团；受光色差/白粉/
 *     刺带/hue·luma 保留；片元零噪声。刺卡/球果帧 SDF 三档同体（Low 几何若省略
 *     器官/刺卡发射 → 分支死代码无害——归 3a）。
 *   - 皮 Mid：去翘边微暗/纤维细纹（近景细节）；条片网格/三色剖面/断口/逐段深浅/
 *     枝皮灰门/株内梯度/干基暗化保留；球果帧三档同体（白霜层三档保留——中距身份
 *     信号，vs cedrus Mid 去白粉的分化记档）。
 *   - 皮 Low：再去逐段深浅/枝皮灰门/株内梯度/干基暗化（低调项）；条片三色剖面 +
 *     断口剪影保留（远距「灰-灰褐纵长条片」身份——第 16 语言剪影位）；1× vnoise
 *     （游走）。
 *   - 深度：Mid/Low = 各自档 SDF（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；juniperus 前缀不与先例混缓存）：
 *     'juniperus:needle' / ':mid' / ':low'；'juniperus:bark' …；'juniperus:needle-
 *     depth' …（9 键全异；叶/皮经 applyTreeFadeDither 追加 '+dither'）。
 *   - 风动（JUNIPERUS_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一
 *     部分（D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 鳞卡 High 片元 = 1× vnoise（簇团）= 3× + 绳卡 SDF（窗列 + 四列错位 + 双
 *     hash + rod/rachis）≈ 3.5× + 受光/白粉/新梢/刺带/hue ≈ 2.5× ≈ **9×**（与
 *     水杉羽列同档）；Mid/Low = 0 噪声 + ALU ≈ 5× / 4.5×；
 *   - 皮 High 片元（域互斥取最重路径）= 皮路径 2× vnoise（游走 + 纤维细纹）= 6× +
 *     条片网格/翘边 ALU ≈ 2× ≈ **8×** / 球果帧纯 ALU ≈ 2×；
 *   - 皮 Mid/Low = 1× vnoise + ALU ≈ 5×；
 *   - 深度片元 = SDF 纯 ALU ≈ 3.5×（三帧路由 + 绳列窗列），**零噪声采样**；
 *   - 顶点 = 两次 sin（两成分）+ 一次法线乘，无循环；全源零数据依赖循环/零纹理采样。
 *
 * 契约缺口候选（归 T012 族级验收门；本文件零公共抽象扩展——绳列窗列/四列错位/
 * 条片网格/球果 u 域编码全部限定文件内）：
 *   ① 绳状鳞卡「对生行窗列 + 四列错位」SDF：本文件内实现（针叶族第三个簇卡语言
 *      ——莲座放射〔雪松〕/对生羽列〔水杉〕/绳列〔圆柏〕）；族内第四例（侧柏/
 *      扁柏类鳞叶树）出现后评估提炼家族公共 SDF 模式（暂不动公共抽象——真实消费
 *      者触发）；
 *   ② 果双熟度 u 色档编码（u ≥ 0.5 霜熟 / < 0.5 绿幼）为材质侧契约——cedrus「v
 *      域分流」在单 v 帧冻结接口下的 u 域变体；需与 3a posHash 编码合并阶段对齐
 *      冻结（cedrus ③ 同型风险）；
 *   ③ 刺叶两条白粉带双面同显（卡投影无法定向上面——gl_FrontFacing 不消费：刺卡
 *      随机滚转下双面读向均可接受，近景两调弱化一半记档）；
 *   ④ 绳卡分型（单元抖动/斜切/带占）与受光/白粉/变奏共用 aLeafRand 单属性统计
 *      近似（多通道复用同一 rand——分型间相关性无法表达；家族共有缺口）；
 *   ⑤ 树高锚 8/冠基 1.2/渐入带 3.5/皮网格 uv 频率（24/72）材质侧硬编码——与
 *      profile 侧无联动通道（cedrus ⑥ 同型家族缺口；3c 出图面校准回路）；
 *   ⑥ 皮管 v ∈ [0,0.92] 逐管归一（TUBE_V_MAX）沿 metasequoia 契约假设——3a 实
 *      编码若异 → 合并阶段对账（冻结接口隐式面）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；
 *   零贴图/零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通
 *   Mesh 无该属性，WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；
 *   与雪松/水杉先例的通用段（风动公式等）为复制改造非 import（资产私有，跨资产不
 *   耦合——organization.md 边界）；**真实编译验证（console 零错误零警告）归 3c
 *   合并后执行**（无浏览器环境——本 Step 以测试基建 GLSL 组装断言〔真实 ShaderLib
 *   源 + include 展开 + 配平校验〕先行，沿 cedrus/metasequoia 同款记档；X4000
 *   纪律：单返回/零 out 参/全路径初始化）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/**
 * 树高锚（T012.3 判定 8「树高锚换 6–10 m 同步轮」：slot-0 totalHeight 8 同源——
 * profile 冻结值；材质-几何侧无联动通道记缺口候选⑤）。1/8 = 0.12500 命名常量
 * 注入风动 GLSL + 测试锚断言（cedrus CEDRUS_TREE_HEIGHT_NOMINAL 先例）。
 */
export const JUNIPERUS_TREE_HEIGHT_NOMINAL = 8;

/** 风动高度权重 = 1/树高锚（0.12500——注入 GLSL 字面量；5 位小数 = 家族同步轮精度口径） */
const JUNIPERUS_WIND_H_SCALE = (1.0 / JUNIPERUS_TREE_HEIGHT_NOMINAL).toFixed(5);

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿家族范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`juniperus 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

/**
 * 绳卡 SDF 绳单元数分档（profile rosetteNeedles = 24 为 High 基准——契约注释「LOD
 * 降档 = 递减派生归 3b」；冻结单 24/14/8）：SDF 内以对生行窗列频率 N 承载（相邻
 * 2–4 对贴生鳞叶并为绳状单元——真列数 36–120 的工程抽象）。
 */
const JUNIPERUS_ROPE_UNITS: Record<ProceduralLevel, number> = { high: 24, mid: 14, low: 8 };

// ── 风动 GLSL（鳞卡/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：**两成分**（判定 8）——①整冠低频小幅摆（**主成分**——密实圆柱/卵圆
 * 连续质量冠）+ ②末级鳞枝细幅微颤（1.9 Hz × 0.018 m——幅度频率均低于水杉羽状单元，
 * 硬质密质读向；aBend 权重，组 0 恒 0 免颤）。**无顶梢成分**（主干通直无点头——
 * 族内可选·雪松消费位，判定 8 第三例）。频率 = windTier/FringeFrequency (Hz) × 2π
 * （profile 契约「频率 Hz（uTime 驱动）」）；幅度为米（0.022/0.018——
 * windTier/FringeAmplitude）。hash 常数 111.413/88.523 与先例相位流去相关；树高锚
 * 8 m（×0.12500——slot-0 totalHeight 同源，锚同步轮 6–10 m 级）。
 */
const JUNIPERUS_WIND = /* glsl */ `
// juniperus wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float jnpWindPhase = fract(sin(aSeed * 111.413 + 6.3) * 43758.5453);
float jnpWindH = clamp(position.y * ${JUNIPERUS_WIND_H_SCALE}, 0.0, 1.0); // /8m 树高锚（slot-0 totalHeight 同源——JUNIPERUS_TREE_HEIGHT_NOMINAL；锚同步轮 6–10m 级）
// 成分① 整冠低频小幅摆（主成分——密实质量体）：0.30Hz（1.8850 rad/s）× 幅 0.022m 顶（Spec §风动读向 Inferred——密实圆柱/卵圆连续冠体）
float jnpTier = jnpWindH * jnpWindH * 0.022 * sin(uTime * 1.8850 + jnpWindPhase * 6.28318 + jnpWindH * 1.2);
// 成分② 末级鳞枝细幅微颤：1.9Hz（11.9381 rad/s——family 快颤链 9–23 内带）× 幅 0.018m（< 水杉羽状 0.055/2.6Hz——硬质密质读向）；权重 = aBend（组 0 恒 0 免颤）
float jnpFlutterPhase = fract(sin((aSeed + aLeafRand) * 88.523 + 8.4) * 43758.5453);
float jnpFlutter = aBend * 0.018 * sin(uTime * 11.9381 + jnpFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (jnpTier + jnpFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(jnpTier) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * jnpFlutter * 0.9; // 叶卡沿卡法线微扑（皮组 aBend=0 → 恒 0）
`;

/** 顶点声明（鳞卡/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const JUNIPERUS_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 三帧卡 SDF（表面材质与深度材质共用——单一来源生成器，禁复制粘贴）────────────────

/**
 * 圆柏三帧卡覆盖率生成器（uv v 帧域三级——派遣简报冻结接口 2，阈值 1.0/2.0；见模块
 * 头【绳状鳞卡 SDF】节）：
 * - 绳状鳞卡 v∈[0,0.99]：对生行窗列 + 四列错位法（N 绳单元分档 24/14/8；逐单元
 *   hash 抖动 + 奇偶行斜切 + 邻列半节距错位 = 绳股编织读向）+ 细杆轮廓包络 +
 *   中轴渐细条（末级鳞叶小枝聚合系统的单卡整枝抽象）；
 * - 浆果球果卡 v∈[1.0,1.95]：v 埧圆端带（u = 逐果熟度色档常量——近球 6–8 mm
 *   Verified [1][2]，体积读向由几何交叉双卡承载）；
 * - 刺卡 v∈[2.0,2.95]：sin 单针包络（cedrus 机制直承；指数 0.65 = 披针-钻形最宽
 *   中下段 ≈0.35——二型叶 minority 帧三档同体）。
 * **零 facVnoise 引用是深度材质不挂噪声库的前提（引入即深度编译暴雷——保护性
 * 约束；窗列/错位 hash 全 inline sin-hash ALU）**；坡宽 0.02（绳隙细结构口径——
 * alphaToCoverage AA；亚像素域经 ⓪ 门导数化放宽至 ≈1px——见模块头【绳状鳞卡
 * SDF】节⑥）；器官帧 0.08 mm 级器官的 AA 肩；单返回 + 声明处初始化（X4000
 * 纪律）。fwidth 为 WebGL2 GLSL ES 3.00 内建（零扩展依赖——表面/深度两 pass 通用）。
 */
function juniperusCardSdfSource(level: ProceduralLevel): string {
  const n = JUNIPERUS_ROPE_UNITS[level].toFixed(1); // High 24.0 / Mid 14.0 / Low 8.0（绳单元数分档派生）
  return /* glsl */ `
// 剪影厚度保持重映射（H3b——T012.3 Step 4 第二轮·材质域）：A2C 4x 样本量化
//（≥0.875 → 4/4）下中低 alpha 边缘像素解析为 2–3/4 样本 → 天色淡染（身份色
// g-b 边距 ~11 经不起 <0.85 混合——绿判据失守主体）。低尾裁除 + 高段饱和 +
// 薄卡 +0.19 上偏补宽。jnpRead = 近景可解析度（1 原值逐位返回 / 0 亚像素全治）。
// 绳卡/刺卡剪影共用（M25 卡宽绳 2–13px / 刺 2–5px 均在淡染域）。
float jnpSolidify(float jnpA0, float jnpRead0) {
  return mix(clamp((jnpA0 + (1.0 - jnpRead0) * 0.19 - 0.25) / 0.24, 0.0, 1.0), jnpA0, jnpRead0);
}
float jnpCardAlpha(vec2 jnpUv, float jnpRand) {
  float jnpA = 1.0;
  if (jnpUv.y < 1.0) {
    // 绳状鳞卡帧（v∈[0,1) 卡基→卡尖——u 横向全幅，四列域 [0,0.25)…[0.75,1)）
    vec2 jnpP = vec2(jnpUv.x - 0.5, jnpUv.y);
    // ⓪ 导数感知亚像素退化门（T012.3 Step 4 第二轮·材质域——H1/H3 中距淡染修复）：
    // 绳节距 px = 卡长px/N = 1/(N·|∇v|)、卡宽 px = 1/|∇u|（均含姿态透视缩并）。
    // **近景可解析度 jnpRead = 任一向可读即原值**（max 双门——M25/M8 屏幕尺度域因
    // 斜置姿态重叠，单门不可分：M8 面向卡 pitch ≥1.4px/宽 ≥25px 与斜置可读卡
    //（pitch ≥1.4）经任一门全保护；M25 全卡 pitch ≤1.3〔卡长 ≤31px〕两向均亚像素
    // → 全治）。阈值带压在 M8 主体（pitch 1.4+）之下——近景绳列密度不稀释（012.2
    // 教训；实测 M8 帧边缘能量/游程结构回归验证）。
    float jnpPitchPx = 1.0 / max(fwidth(jnpP.y) * ${n}, 1e-4);
    float jnpRead = max(smoothstep(0.9, 1.3, jnpPitchPx), smoothstep(3.0, 12.0, 1.0 / max(fwidth(jnpP.x), 1e-4)));
    // ① 细杆轮廓包络（末级鳞枝绳状侧影）：sqrt(sin) 半椭圆端帽 × 基部微收（贴枝附着端窄）
    float jnpRodW = 0.5 * sqrt(sin(3.14159 * clamp(jnpP.y, 0.005, 0.995))) * (0.82 + 0.18 * jnpP.y);
    float jnpSil = jnpRodW - abs(jnpP.x);
    // ② 对生行窗列：N 绳单元（相邻 2–4 对贴生鳞叶并为一单元；N = ${n} 分档 24/14/8——卡内 uv 固频，密度不随卡尺度稀释〔012.2 羽卡教训〕）
    float jnpS = jnpP.y * ${n} + jnpRand * ${n};
    float jnpK = floor(jnpS);
    float jnpH = fract(sin(jnpK * 12.9898 + jnpRand * 78.233) * 43758.5453); // 逐单元 hash（inline sin-hash——非噪声库）
    jnpS += (jnpH - 0.5) * 0.26; // 单元位抖动 ±13%（非机械规整）
    float jnpDir = 1.0 - 2.0 * mod(jnpK, 2.0); // 奇偶行斜向交替（交互对生 90° 交错的投影——绳股斜纹）
    float jnpRk = floor(clamp(jnpUv.x, 0.001, 0.999) * 4.0); // 四列域（鳞叶交互对生四列贴枝 10–30° s06 Verified）
    jnpS += mod(jnpRk, 2.0) * 0.5 + jnpP.x * jnpDir * 0.30; // 邻列半节距错位（decussate stagger）+ 单元界斜切
    float jnpF = fract(jnpS);
    float jnpDuty = mix(1.00, 0.80, jnpRead); // H1 带占放宽：亚像素域绳隙→带色收敛（可解析域恒 0.80 原值——近景绳列密度不稀释）
    float jnpBand = min(jnpF, jnpDuty - jnpF); // 绳单元带（带 80% + 绳隙 20%——细密绳状纹理；0 带界 → 0.4 带心）
    // ③ 中轴枝常覆盖条（贴生鳞叶的枝轴——基部 0.014 → 尖部 0.007 渐细，近连续不断裂）
    float jnpRachis = mix(0.014, 0.007, jnpP.y) - abs(jnpP.x);
    float jnpD = max(min(jnpSil, jnpBand), jnpRachis); // (杆 ∩ 带) ∪ 中轴
    // H3 AA 坡宽导数化：亚像素域坡宽 ≈1px 覆盖 AA（footprint 均值化——SDF 崩解为局部均值
    // alpha，替代逐点采样 + A2C 抖动的绳隙扩张淡染）；可解析域恒 0.02 原值（近景不动）
    float jnpAa = max(0.02, fwidth(jnpD) * (1.0 - jnpRead));
    jnpA = jnpSolidify(clamp(jnpD / jnpAa + 0.5, 0.0, 1.0), jnpRead);
  } else if (jnpUv.y < 2.0) {
    // 浆果球果卡（v∈[1.0,1.95] 沿果轴；u = 逐果熟度色档——双熟度分类）：v 埧圆端带
    //（近球径 6–8 mm Verified [1][2]——体积读向由几何交叉双卡承载；横向盘形裁切 u 色档契约下不可表达——弱化记档）
    float jnpCb = clamp((jnpUv.y - 1.0) / 0.95, 0.0, 1.0); // 卡内轴向帧
    jnpA = clamp((0.5 - abs(jnpCb - 0.5)) / 0.08 + 0.5, 0.0, 1.0); // 圆端带（器官 AA 肩 0.08——mm 级器官口径）
  } else {
    // 刺卡（v∈[2.0,2.95] 刺基→刺尖——二型叶 minority，cedrus 散生针机制直承）：sin 单针包络
    //（指数 0.65 = 披针-钻形最宽 ≈0.35 中下段——FRPS「披针形，先端渐尖」+ NC "awl" 折中，vs 雪松 1.55 上部较宽）
    float jnpNd = clamp(jnpUv.y - 2.0, 0.001, 0.999);
    float jnpEnv = sin(3.14159 * pow(jnpNd, 0.65));
    // 剪影厚度保持（刺卡独立门——M25 刺卡宽 1.9–3.1px 淡染域 / M8 面向 3.6–10px：门带上沿 4.5 压在 M25 带上沿之上 +1.4）
    float jnpSpineRead = smoothstep(1.2, 4.5, 1.0 / max(fwidth(jnpUv.x - 0.5), 1e-4));
    jnpA = jnpSolidify(clamp((0.5 * jnpEnv - abs(jnpUv.x - 0.5)) / 0.02 + 0.5, 0.0, 1.0), jnpSpineRead); // 坡宽 0.02（针形细结构口径）
  }
  return jnpA;
}
`;
}

// ── 叶卡帧片元配方（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写
//    diffuseColor.a；位于 <color_fragment> 之前，与 vColor 乘算交换律安全）──────────

/**
 * 叶卡帧配方头（双叶帧共用——绳卡 + 刺卡同 HEAD，帧差异走 vUv.y 门）。分段拼装
 * （沿先例体例）：High = HEAD + CLUMP + MUL_HIGH；Mid/Low = HEAD + MUL_SIMPLE（去
 * 簇团噪声——乘子 0.94+0.12×jnpClump 均值化 = 1.0 消去，值噪声均值 0.5 精确保均）。
 * **无两面色差**（终审修正口径同雪松——needleFaceContrast 省略即语义）：无 BACK
 * 段、色路零 gl_FrontFacing、两面糙度同值（vs 水杉两面差语言的反向分化）。
 */
const JUNIPERUS_NEEDLE_HEAD = /* glsl */ `
// juniperus:needle —— SDF 双叶帧覆盖 + 受光色差（阳灰绿亮/荫深绿暗）+ 白粉弱档 + 新梢黄绿 + 刺叶白粉带 + 逐卡变奏（<color_fragment> 不触碰）
float jnpAlpha = jnpCardAlpha(vUv, vLeafRand);
diffuseColor.a = jnpAlpha;
// 受光色差 ramp（身份主律——Spec §5.1 阳面灰绿亮/阴面深绿暗 s02 双读一致 Observed）：冠层暴露度 mix
//（冠基 1.2m = trunkHeightRatio 0.15 × 8 锚 + 3.5m 渐入带 + 逐卡 ±0.12 抖动破纯竖向梯度）——非叶面腹背语义（无两面色差——终审修正口径同雪松）
float jnpExp = clamp((vTreePos.y - 1.2) / 3.5, 0.0, 1.0);
jnpExp = clamp(jnpExp + (fract(vLeafRand * 5.113 + 0.23) - 0.5) * 0.24, 0.0, 1.0);
vec3 jnpLight = mix(vec3(0.766, 0.811, 0.789), vec3(1.234, 1.189, 1.211), jnpExp); // 荫深绿 ↔ 阳灰绿亮（端点 = needleColorShade/Sun 对构造中点 #4a5d47 的 sRGB 比值 × 0.65 观感软化——算术对称，暴露度 0.5 处 = 中点色）
jnpLight *= mix(vec3(1.0), vec3(1.04, 1.03, 1.06), jnpExp * 0.15); // 白粉（needleGlaucousBloom 0.15 弱档——整冠灰蓝霜调 Observed s01–s04；B > R > G 去饱和冷灰）
jnpLight = mix(jnpLight, jnpLight * vec3(1.12, 1.15, 0.95), step(fract(vLeafRand * 7.513 + 0.37), 0.10)); // 新梢黄绿-灰绿（needleJuvenility 0.22 × 新梢少数相 0.45 ≈ 10% 卡——域内变体非季相卡；s08 鳞叶黄绿→深绿渐变直证）
// 刺叶上面两条白粉带（v≥2 帧门——二型叶色层：「上面微凹，有两条白粉带」FRPS Verified；近景两调来源；双面同显记档缺口③）
float jnpSpine = step(2.0, vUv.y);
float jnpStoma = 1.0 - smoothstep(0.045, 0.095, abs(abs(vUv.x - 0.5) - 0.18)); // 双带位 0.5±0.18（横贯刺叶上面的两条气孔带）
jnpLight = mix(jnpLight, jnpLight * vec3(1.17, 1.19, 1.15), jnpSpine * jnpStoma * 0.55);
// 逐卡身份（aLeafRand）：色相两端（冷蓝绿灰 ↔ 暖绿——深绿-暗绿基调 Spec §5.1；通道摆幅 ≤15% 纪律）+ 明度 ±8%（去相关取样）
vec3 jnpHue = mix(vec3(0.96, 1.00, 1.03), vec3(1.04, 1.03, 0.94), fract(vLeafRand * 5.913 + 0.23));
float jnpLuma = 0.92 + 0.16 * fract(vLeafRand * 3.719 + 0.57);
`;

/** High 专属：中频簇团斑块（位置域 1× vnoise——Mid/Low 去采样；赋值域变量） */
const JUNIPERUS_NEEDLE_CLUMP = /* glsl */ `
// 冠内：中频簇团斑块（波长 ≈1/1.15 ≈ 0.87m——密实连续冠 90–95% 实心的块状簇聚读向 Observed s01–s04；采样偏移与先例去相关）
jnpClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.57) * 1.15 + vec2(53.3, 27.9));
`;

/** High 专属：合成（簇团乘子——均值 0.5 精确保均；受光色差在 jnpLight——三档保留面） */
const JUNIPERUS_NEEDLE_MUL_HIGH = /* glsl */ `
vec3 jnpMul = jnpHue * jnpLuma * jnpLight * (0.94 + 0.12 * jnpClump); // 簇团乘子
diffuseColor.rgb *= jnpMul;
`;

/** Mid/Low：合成（去簇团项——乘子均值化消去，值噪声均值 0.5 精确保均） */
const JUNIPERUS_NEEDLE_MUL_SIMPLE = /* glsl */ `
vec3 jnpMul = jnpHue * jnpLuma * jnpLight; // Mid/Low：簇团乘子均值化消去（0.94 + 0.12×0.5 = 1.0）
diffuseColor.rgb *= jnpMul;
`;

/** 叶卡背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  密质贴枝·低幅试探值 0.28：家族链 夏栎 0.65 > 水杉 0.46 > 雪松 0.38 > **圆柏
 *  0.28** > 樟 0.22——密质贴生厚鳞叶硬质蜡质透光最弱（判定「透射低幅」）；组 1
 *  双叶帧均透光（绳卡主导定档，刺卡 minority）。透射色深青绿 (0.42, 0.70, 0.48)
 *  （深绿蓝灰冠透光读向——vs 水杉亮黄绿向）；Step 4 校准回路开放。 */
const JUNIPERUS_NEEDLE_TRANSLUCENCY = /* glsl */ `
// juniperus:needle —— 背光透射（密质贴枝·低幅试探档 0.28）：视线与阳光反向时叶体透深青绿
//（深绿-蓝绿灰蓝霜调冠的透光读向；组 1 双叶帧均作用——幅值按密质主导观感定档）
#if NUM_DIR_LIGHTS > 0
  float jnpBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float jnpTransVar = 0.55 + 0.45 * fract(vLeafRand * 9.117 + 0.47); // 逐卡透光强度变奏
  outgoingLight += vec3(0.42, 0.70, 0.48) * directionalLights[0].color
    * pow(jnpBack, 3.0) * jnpTransVar * jnpAlpha * 0.28;
#endif
`;

// ── 浆果球果帧体（皮材质 v 域二分支之球果段——实色赋值非乘性；
//    alpha = 同一 SDF 生成器圆端带——aLeafRand 恒 0 传常数，变奏源 = vUv.x 熟度色档）──

/** 浆果球果帧体（皮材质分支之一，三档共用——双熟度双色 + 白粉霜层 + 圆端带轮廓） */
const JUNIPERUS_CONE_BODY = /* glsl */ `
  // 浆果球果帧（v∈[1,2) 冻结域——沿果轴；u = 逐果熟度色档 ∈ [0.02,0.98]）：**u ≥ 0.5 翌年霜熟果 /
  // u < 0.5 当年绿幼果**（cedrus 两类果并存机制的 u 域承载——冻结接口 2 单 v 帧下分类走 u；
  // coneClassRatio 0.75 霜熟主导归几何 posHash 编码，判定 5 分工：双色值 + 白霜层归本文件）
  float jnpCs = clamp((vUv.y - 1.0) / 0.95, 0.0, 1.0); // 卡内轴向帧
  float jnpMatC = step(0.5, vUv.x); // 熟度分类门（u 域阈值 0.5）
  float jnpMg = clamp((vUv.x - 0.5) / 0.48, 0.0, 1.0); // 熟端档内变奏
  float jnpYg = clamp((0.5 - vUv.x) / 0.48, 0.0, 1.0); // 幼端档内变奏
  // 翌年霜熟果：暗蓝紫褐果体（coneColorMature 0x3a3b52 sRGB→线性 (0.042,0.044,0.084)——「熟时暗褐色」FRPS
  // Verified + s07/s08 暗蓝紫 70–80% Observed）+ **白粉霜层**（「被白粉」FRPS Verified + s07 霜蓝 15–20%
  // Observed——身份特征；加性蓝灰覆层随档浮动，中距霜蓝果点读向 Spec §7）
  vec3 jnpConeM = vec3(0.042, 0.044, 0.084) * (0.85 + 0.30 * jnpMg); // 果体 ±15% 档内变奏
  jnpConeM = mix(jnpConeM, vec3(0.160, 0.180, 0.240), 0.22 + 0.24 * jnpMg); // 白粉霜覆层（霜量 0.22–0.46 逐果浮动）
  // 当年绿幼果（coneColorYoung 0x5d7a48 sRGB→线性——s08 同枝 green immature Observed）
  vec3 jnpConeY = vec3(0.110, 0.195, 0.065) * (0.88 + 0.24 * jnpYg); // ±12% 档内变奏
  vec3 jnpCone = mix(jnpConeY, jnpConeM, jnpMatC); // 双熟度并存（判定 5）
  jnpCone *= 1.0 - smoothstep(0.32, 0.50, abs(jnpCs - 0.5)) * 0.18; // 两端收边暗（近球明暗读向）
  diffuseColor.rgb = jnpCone;
  jnpAlpha = jnpCardAlpha(vUv, 0.0); // 轮廓 = v 埧圆端带（三帧生成器单一来源——皮表面/叶表面/深度同串；器官帧不消费 rand）
`;

// ── 组 0（皮 + 浆果卡）配方主体（<map_fragment> 后注入——工厂 body 内 v 域二分支：
//    皮条片 v<1.0〔本节〕/ 浆果 [1,2)〔上节帧体〕）─────────────────────────────────

/**
 * 皮域：纵长条片剥落核心（第 16 语言——条片机制沿用第 15，色相轴换灰-灰褐；三档
 * 共用——Low 保留面的唯一采样：低频游走 warp；皮域恒 alpha=1 实心——alphaTest 仅
 * 为浆果卡裁切而开）。域变量赋值段（jnpPlateau/jnpSegH/jnpCross/jnpHi/jnpTwig
 * 在此赋值、合成段消费——跨 include 预声明见工厂内 domainVars）。
 */
const JUNIPERUS_BARK_STRIPS = /* glsl */ `
// 纵长条片剥落（第 16 语言，判定 6——机制沿用第 15：条片列 × 段频率 + 游走 + 逐段 hash + 断口交错；色相轴换灰-灰褐）
// 周向 24 条片列 × 纵向 72 段频率/管程（v ∈ [0,0.92] 逐管归一契约——主干全弧 ≈8m → ≈66 段、段长 ≈0.121m
// ⊂ barkPlateMin/Span 0.08–0.16 近真域〔8m 级干按水杉 20m 级等比收〕；3c 校准回路开放）
// uv 契约（3a 对齐假设）：u = 环绕一周、v = 逐管归一 [0, 0.92]（TUBE_V_MAX——皮管与器官域恒隔离防线）
float jnpBarkWarp = facVnoise(vec2(vUv.x * 2.1, vUv.y * 0.9) + vec2(59.1, 37.3)); // 条片列低频游走（「纵裂不规则」缓歪防整齐阵列）
vec2 jnpBg = vec2(vUv.x * 24.0 + jnpBarkWarp * 1.5, vUv.y * 72.0 + jnpBarkWarp * 0.6);
float jnpStripId = floor(jnpBg.x);
float jnpStripH = fract(sin(jnpStripId * 127.1 + 29.7) * 43758.5453); // 逐条片 hash（inline sin-hash）
jnpBg.y += jnpStripH * 7.31; // 纵向段相位逐列错开（条片断口交错——「不规则」剥落）
float jnpSegId = floor(jnpBg.y);
jnpSegH = fract(sin(jnpStripId * 311.7 + jnpSegId * 74.7 + 19.1) * 43758.5453); // 逐段 hash（赋值域变量）
float jnpF0 = fract(jnpBg.x);
float jnpDe0 = min(jnpF0, 1.0 - jnpF0); // 距条片缘初距（0 缘 → 0.5 心）
float jnpEdgeZone = 1.0 - smoothstep(0.02, 0.10, jnpDe0); // 翘边缘区（长纤维条）
float jnpFray = jnpEdgeZone * sin(jnpBg.y * 47.0 + jnpStripH * 6.28318) * 0.05; // 长纤维条翘边（缘区高频细须——横向微扰）
float jnpFx = fract(jnpBg.x + jnpFray);
float jnpDe = min(jnpFx, 1.0 - jnpFx); // 翘边扰动后的距缘距离
float jnpGh = 0.08 + 0.09 * 0.55; // 沟半宽 0.1295（barkGrooveDepth 0.55 中深端——第 15 语言公式直承）→ 脊:沟 ≈ 2.9:1
jnpPlateau = 1.0 - smoothstep(jnpGh - 0.035, jnpGh + 0.035, jnpDe); // 陡壁剖面（±0.035 急变；赋值域变量）
jnpCross = 1.0 - smoothstep(0.025, 0.065, min(fract(jnpBg.y), 1.0 - fract(jnpBg.y))); // 横向断口沟（细于纵沟；赋值域变量）
jnpHi = smoothstep(3.8, 6.2, vTreePos.y); // 枝皮灰长纤维高位门（冠区主枝带——s04/s02 枝皮灰长纤维条剥 Observed；赋值域变量）
jnpTwig = smoothstep(5.0, 7.2, vTreePos.y); // 幼枝灰绿高位门（株内梯度幼端——v 逐管归一契约下小弧长门退化记档；赋值域变量）
`;

/** High 专属：纤维细纹（1× vnoise——Mid/Low 去采样；条片表面长纤维拉丝） */
const JUNIPERUS_BARK_GRAIN = /* glsl */ `
jnpGrain = facVnoise(vec2(vUv.x * 36.0, vUv.y * 2.5) + vec2(jnpStripH * 17.3, jnpStripH * 9.1)); // 纤维细纹（周向高频 × 纵向拉伸——长纤维拉丝；赋值域变量）
`;

/** High：合成（三色剖面 + 逐段深浅 + 翘边微暗 + 断口 + 枝皮灰门 + 株内梯度 + 纤维细纹 + 干基暗化） */
const JUNIPERUS_BARK_MUL = /* glsl */ `
vec3 jnpRidge = mix(vec3(1.0), vec3(1.244, 1.173, 1.091), smoothstep(0.26, 0.40, jnpDe)); // 脊侧（基色）→ 脊顶风化灰褐（barkPlateColor 0x786f60 比值 × 0.70 软化——R ≥ G ≥ B 灰-灰褐轴）
vec3 jnpBarkMul = mix(vec3(0.616, 0.585, 0.555), jnpRidge, jnpPlateau); // 沟底暗褐深端（barkGrooveColor 0x33302b 比值 × 0.90 软化）↔ 脊（vs 水杉红褐基调——第 16 语言色相区分锁）
jnpBarkMul *= 0.92 + 0.16 * jnpSegH; // 逐段深浅（剥落代际明暗——条片段间差）
jnpBarkMul *= 1.0 - jnpEdgeZone * 0.12; // 翘边缘区微暗（长纤维条翘边投影）
jnpBarkMul *= 1.0 - jnpCross * (0.18 - jnpHi * 0.08); // 横向断口沟（高位衰减 ×0.18→0.10——条片连续变长 = 枝皮长纤维条剥读向）
jnpBarkMul = mix(jnpBarkMul, jnpBarkMul * vec3(0.99, 1.04, 1.05), jnpHi * 0.55); // 枝皮灰长纤维（高位灰化去褐——s04/s02 Observed）
jnpBarkMul = mix(jnpBarkMul, jnpBarkMul * vec3(0.95, 1.07, 0.92), jnpTwig * 0.50); // 幼枝灰绿（株内梯度幼端——幼枝灰绿 → 干灰褐，判定 6）
jnpBarkMul *= 0.97 + 0.06 * jnpGrain; // 纤维细纹（条片表面长纤维拉丝——High）
jnpBarkMul *= mix(vec3(1.0), vec3(0.93, 0.93, 0.94), (1.0 - smoothstep(0.5, 2.0, vTreePos.y)) * 0.35); // 干基暗化弱档（家族惯例）
diffuseColor.rgb *= jnpBarkMul;
`;

/** Mid：合成（去翘边微暗/纤维细纹——近景细节；其余保留） */
const JUNIPERUS_BARK_MUL_MID = /* glsl */ `
vec3 jnpRidge = mix(vec3(1.0), vec3(1.244, 1.173, 1.091), smoothstep(0.26, 0.40, jnpDe)); // 脊侧 → 脊顶风化灰褐（与 High 逐字同源）
vec3 jnpBarkMul = mix(vec3(0.616, 0.585, 0.555), jnpRidge, jnpPlateau); // 沟 ↔ 脊三色剖面（中距「灰-灰褐纵长条片」身份）
jnpBarkMul *= 0.92 + 0.16 * jnpSegH; // 逐段深浅保留
jnpBarkMul *= 1.0 - jnpCross * (0.18 - jnpHi * 0.08); // 断口沟保留（高位衰减同源）
jnpBarkMul = mix(jnpBarkMul, jnpBarkMul * vec3(0.99, 1.04, 1.05), jnpHi * 0.55); // 枝皮灰门保留（冠区主枝中距读向）
jnpBarkMul = mix(jnpBarkMul, jnpBarkMul * vec3(0.95, 1.07, 0.92), jnpTwig * 0.50); // 幼枝灰绿保留
jnpBarkMul *= mix(vec3(1.0), vec3(0.93, 0.93, 0.94), (1.0 - smoothstep(0.5, 2.0, vTreePos.y)) * 0.35);
diffuseColor.rgb *= jnpBarkMul;
`;

/** Low：合成（再去逐段深浅/枝皮灰门/株内梯度/干基暗化——低调项；条片三色剖面 + 断口剪影保留） */
const JUNIPERUS_BARK_MUL_LOW = /* glsl */ `
vec3 jnpRidge = mix(vec3(1.0), vec3(1.244, 1.173, 1.091), smoothstep(0.26, 0.40, jnpDe)); // 脊侧 → 脊顶（与 High 逐字同源）
vec3 jnpBarkMul = mix(vec3(0.616, 0.585, 0.555), jnpRidge, jnpPlateau); // 条片三色剖面剪影（远距「灰-灰褐纵长条片」保留面——第 16 语言剪影位）
jnpBarkMul *= 1.0 - jnpCross * 0.18; // 断口沟保留（剥落段读向——条片分段身份）
diffuseColor.rgb *= jnpBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1——**双叶型并存族内首例**：绳状鳞卡 v∈[0,1) 主语言 + 刺卡 v∈[2,3)
 * minority 双帧同材质，判定 3）：SDF 三帧生成器同串（组 1 顶点 v ∈ [0,1) ∪ [2,3)
 * 只命中绳卡/刺卡帧——单一来源纪律 + 深度共享）alphaTest 裁切 + 受光色差（阳灰绿
 * 亮/荫深绿暗——**无两面色差**：无 BACK 段、零 gl_FrontFacing，终审修正口径同
 * 雪松）+ 白粉弱档 + 新梢黄绿 + 刺叶两条白粉带（帧门）+ 高档试探透光 0.28 + 逐卡
 * 变奏 + 风动两成分。level 分档（T012.3，缺省 'high'）：Mid 绳单元 14 + 去簇团噪声/
 * 糙度项（受光/白粉/新梢/刺带/透光/hue·luma 保留——颜色层次档间连续保留面）；Low
 * 绳单元 8 + 再去透光，片元零噪声；刺卡帧 SDF 三档同体。风动三档同源不动。
 * 底参：构造中点 #4a5d47（= needleColorSun 0x64785e + needleColorShade 0x2f4230
 * 严格中点——暴露度 0.5 处即此色；cedrus 构造中点式——常绿单卡）/ m 0 / r 0.64
 * （鳞叶硬质蜡质贴生——family 链：樟 0.50 < 圆柏 0.64 < 雪松 0.66；无两面糙度差）/
 * DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转——两面固有色同值）。
 */
export function createJuniperusNeedleMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a5d47, // 构造中点（受光色差 ramp 基点——严格中点下 sun/shade 端算术对称；Spec §5.1 深绿-暗绿/蓝绿灰蓝霜调身份）
    metalness: 0,
    roughness: 0.64, // 鳞叶硬质蜡质贴生（工程设定——family 链：樟 0.50 革质亮 < 圆柏 0.64 蜡质鳞叶 < 雪松 0.66 角质；无两面糙度差）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 三帧卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const cardSdf = juniperusCardSdfSource(level); // 单一来源（表面/深度共享同档同串）
  const needleBody = level === 'high'
    ? JUNIPERUS_NEEDLE_HEAD + JUNIPERUS_NEEDLE_CLUMP + JUNIPERUS_NEEDLE_MUL_HIGH
    : JUNIPERUS_NEEDLE_HEAD + JUNIPERUS_NEEDLE_MUL_SIMPLE; // Mid/Low 同体（档差在 SDF 绳单元数 / 簇团段 / 透光注入）
  // 跨 include 域变量预声明（map 注入块内赋值 / roughnessmap 注入消费——块内纯赋值
  // 不重声明防作用域遮蔽；jnpClump High 注入段赋值、Mid/Low 为无害死值 0.5）
  const domainVars = 'float jnpClump = 0.5; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一）\n';
  const body = /* glsl */ `
// juniperus:needle —— 组 1 双叶帧（绳状鳞卡主语言 + 刺卡 minority——判定 3 族内首例双叶型
// 并存；SDF 三帧路由保留为单一来源纪律 + 深度同串，组 1 顶点 v 恒 ∈ [0,1) ∪ [2,3) 不命中浆果帧）
${domainVars}${needleBody}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${JUNIPERUS_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${JUNIPERUS_WIND}`,
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
roughnessFactor = clamp(roughnessFactor + (jnpClump - 0.5) * 0.05, 0.05, 1.0); // 簇团糙度微变（两面同值——无两面语义）`,
      );
    }
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${JUNIPERUS_NEEDLE_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `juniperus:needle${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（皮 + 浆果球果卡——沿 metasequoia 组织：器官卡入皮组，v 域二分支）：
 * 皮 = **第 16 语言灰-灰褐基调纵长条片剥落**（周向 24 条片列 × 纵向 72 段频率/管程
 * 〔v ∈ [0,0.92] 逐管归一契约〕+ 脊:沟 ≈ 2.9:1 陡壁 + 三调色〔脊顶风化灰褐/脊侧
 * 基色/沟底暗褐——R ≥ G ≥ B 灰-灰褐轴，vs 水杉红褐〕+ 长纤维翘边 + 横向断口 +
 * 逐段深浅 + 枝皮灰长纤维高位门 + 幼枝灰绿株内梯度 + 纤维细纹【High】+ 干基暗化）；
 * 浆果 [1,2) = 双熟度双色（u ≥ 0.5 翌年霜熟果暗蓝紫褐 + 白粉霜层 / u < 0.5 当年绿
 * 幼果）——器官轮廓 = 三帧 SDF 圆端带（单一来源生成器——与叶表面/深度同串；
 * aLeafRand 恒 0 传常数，变奏 = vUv.x 熟度色档）。level 分档（T012.3，缺省
 * 'high'）：Mid 去翘边微暗/纤维细纹（近景细节），条片/三色剖面/断口/段深浅/枝皮
 * 灰门/株内梯度保留、**白霜层三档保留**（中距霜蓝果点 = 身份信号——vs cedrus Mid
 * 去白粉的分化记档）；Low 再去逐段深浅/枝皮灰门/株内梯度/干基暗化（低调项），条片
 * 三色剖面 + 断口剪影保留（远距「灰-灰褐纵长条片」身份），1× vnoise。风动 = 两
 * 成分与叶卡同公式同相位（aBend 恒 0 高频颤层天然不作用；浆果卡随整冠摆）。
 * 底参：深灰主调 #595955（barkBaseColor——FRPS「树皮深灰色」Verified [1]）/ m 0 /
 * r 0.92（纤维条片高糙哑光；浆果帧定值 0.58/0.45 覆写）/ DoubleSide + alphaTest
 * 0.5 + alphaToCoverage（**浆果单面卡交叉双卡需双面读向**——背面剔除留盲区角；皮
 * 域 alpha 恒 1 实心不受裁，皮管闭合由深度测试淘汰背面，微 overdraw 记档）。
 */
export function createJuniperusBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x595955, // 深灰（barkBaseColor——Spec「树皮深灰色，纵裂，成条片开裂」FRPS Verified [1]）
    metalness: 0,
    roughness: 0.92, // 纤维条片高糙哑光
    side: THREE.DoubleSide, // 浆果单面卡双面读向（皮域实心闭合不受影响——见 docstring）
    alphaTest: 0.5, // 浆果卡圆端带裁切（皮域 alpha 恒 1 实心——不裁）
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // 条片域 = 皮圆柱 uv + 器官卡 v 帧（u=环绕一周、v=逐管归一 [0,0.92]——契约见 STRIPS 注释）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const cardSdf = juniperusCardSdfSource(level); // 器官轮廓单一来源（与叶表面/深度同档同串）
  const barkBody = level === 'high'
    ? JUNIPERUS_BARK_STRIPS + JUNIPERUS_BARK_GRAIN + JUNIPERUS_BARK_MUL
    : level === 'mid'
      ? JUNIPERUS_BARK_STRIPS + JUNIPERUS_BARK_MUL_MID
      : JUNIPERUS_BARK_STRIPS + JUNIPERUS_BARK_MUL_LOW;
  // 跨 include 域变量预声明（map 注入块内赋值 / roughnessmap 注入消费；Mid/Low 未赋
  // 项为无害死值——jnpGrain 0.5 / jnpTwig 0.0 等）
  const domainVars = 'float jnpPlateau = 1.0; float jnpSegH = 0.5; float jnpCross = 0.0; float jnpHi = 0.0; float jnpTwig = 0.0; float jnpGrain = 0.5; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一）\n';
  const body = /* glsl */ `
// juniperus:bark —— 组 0 皮 + 浆果球果卡 v 埧二分支（皮 <1.0 / 浆果 [1,2)——冻结域表；
// 刺卡帧 v∈[2,3) 归组 1 叶材质，组 0 顶点不命中；判别阈值 1.0）
${domainVars}float jnpAlpha = 1.0; // 皮域实心（分支内浆果帧覆写为圆端带 SDF）
if (vUv.y >= 1.0) {
${JUNIPERUS_CONE_BODY}
} else {
${barkBody}
}
diffuseColor.a = jnpAlpha;`;
  const barkRoughness = `if (vUv.y >= 1.0) {
  roughnessFactor = mix(0.58, 0.45, step(0.5, vUv.x)); // 浆果帧定值（当年绿幼果 0.58 / 翌年霜熟果 0.45 蜡质果霜微泽——三档同）
} else {
  roughnessFactor = clamp(0.92 + (1.0 - jnpPlateau) * 0.04 - jnpHi * 0.05, 0.05, 1.0); // 沟糙 + 块顶/枝皮高位微泽（纤维条片浮雕糙度响应；三档同——Mid/Low 死值 0 无项）
}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${JUNIPERUS_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${JUNIPERUS_WIND}`,
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
  material.customProgramCacheKey = () => `juniperus:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 针影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（**SDF 随档变体**——绳单元数 24/14/8 递减即 LOD 内容）：Mid = Mid
 * SDF / Low = Low SDF（表面/影档内一致——表面/影裁切叶形同档同步）。**深度片元不挂
 * 噪声库**——三帧 SDF 全 ALU（inline sin-hash 非 facVnoise）。组 0 守卫：皮域 +
 * 浆果卡（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质时组 0 不被
 * 绳卡 SDF 误裁（triadica 恒等 attribute 先例）；浆果卡影 = 实心方卡剪影（vs 表面
 * 圆端带略大——mm 级果在影贴图 ~16 cm/texel 下不可辨，记档取舍沿 metasequoia 口径）。
 * 风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap 按主材质
 * DoubleSide 覆写为双面（叶卡/浆果卡两面皆可投影）；alphaTest 由 shadowMap 按主
 * 材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createJuniperusNeedleDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 三帧卡 uv
  const cardSdf = juniperusCardSdfSource(level); // 与叶表面同档同串（单一来源生成器）
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
diffuseColor.a = mix(1.0, jnpCardAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱/浆果卡 uv 域不误裁）；叶卡非零 → 三帧 SDF 裁切`,
    );
  };
  material.customProgramCacheKey = () => `juniperus:needle-depth${levelKeySuffix(level)}`;
  return material;
}
