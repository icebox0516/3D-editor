/**
 * runtime/procedural/tree/platanus/platanusShapeProfile —— 悬铃木 shapeProfile 数值面
 * （T011.5 Step 1 + Step 2，阔叶家族契约第六实例——方法复制自夏栎第一实例经朴树
 * （T011.1）/香樟（T011.2）/榉树（T011.3）/银杏（T011.4）五次验证的通路：
 * ../ginkgo/ginkgoShapeProfile 同构——最新方法复制模板）。
 *
 * 职责：悬铃木（Platanus × acerifolia (Ait.) Willd. 二球悬铃木，悬铃木科悬铃木属
 *      落叶大乔木——**杂交起源志书明文**（FRPS「三球 × 一球久经栽培」原句 Verified
 *      [1]；生产口径 P. × acerifolia，俗名英桐（志书系）/法桐（民间系）不做种下分裂
 *      [1][2][6]）、**公园自然冠单干中龄个体**（行道 pollard 抹头相不进生产记档 [5]）
 *      枝干/冠层结构的形态参数**数值面**——类型契约 = 阔叶家族
 *      ../broadleaf/broadleafShapeProfile（BroadleafShapeProfile，零修改第六实例化；
 *      字段语义、【阔叶共性候选】标注、T009.3 消费语义与槽间恒等纪律见家族文件）。
 *      **夏栎/朴树/香樟/榉树/银杏的数值是证据不是家族真理**，本文件全部数值依据
 *      docs/research/platanus-reference.md（Spec Version 1.0，含终审记档——生产取用
 *      尺度类照片参数以终审第三节为准：form-a/b 照片作废、树高 12–14m 降弱 Inferred、
 *      **主代理裁定树高锚取保守低端 ≈12m**（与夏栎 ≈8m 等五先例可混植的悬铃木
 *      速生大乔木突出量级）、裂深典型 1/2 深端 2/3 记档、斑块主口径 1/8–1/12 细端
 *      1/20 记档、容许低位双主枝**记档不建模**（伪差异禁止项纪律——8 槽差异全部落
 *      连续形态参数））悬铃木自己的现实事实重定；下方逐字段标注【家族共性候选】沿用
 *      /【悬铃木特有】新证据 / 工程设定（无现实基准不编造依据）。方法恒同纪律
 *      （T011.5 任务书）：五级拓扑 L1–L5、叶簇挂末两级 L4/L5、结构计数类跨槽恒等、
 *      rng 无条件消费、LOD 三档同流派生整体复制，悬铃木只换数值与算法细节（几何侧
 *      差异点归 platanusGeometry Step 3 交付，逐条 Spec 引用见其模块头）。
 * 边界：悬铃木资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_platanus.asset，Step 3 交付）；比率字段
 *      以 totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0 × 五先例方法基线对照，三栏落档；改写项逐条映射实现面）──
 *
 * ■ 可继承项（家族方法原样沿用，悬铃木证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——悬铃木分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [9]）落在家族五级口径内（夏栎先例同款包含关系）；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown），家族方法沿用；
 *   3. 冠内通透三规则——悬铃木外密内疏（Spec 域扩展节 B crown_fill_gradient
 *      Inferred [9]）+ 枝干通道（内膛细枝网可见 [9]——通道不封死同向）+ 局部空腔
 *      （逆光空隙 20–30% Inferred [9]）；
 *   4. 枝梢驱动叶簇——叶幕组织 = 末枝簇状团块 ≈1/10–1/15 冠幅（Spec 域扩展节 B
 *      clump_scale Inferred [9]，团块为末级枝叶组非叶簇）——家族「簇挂末两级枝梢」
 *      映射同向（挂点语言的悬铃木分化见改写项 1）；
 *   5. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   6. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡）；
 *   7. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   8. 尺度锚 ≈12m 中龄公园（**主代理裁定**：12–14m 照片带尺度样木作废降弱 Inferred
 *      后取保守低端（终审记档 §2/§三-1——数值不推翻但不得称「带行人参照实测」，
 *      支撑 = form-c/d 无参照粗估带 8–18m 与栽培域 21–30m 下沿 [7][8][9] 之间内插）；
 *      与夏栎 ≈8m/朴树 ≈8.5m/香樟 ≈8.6m/榉树 ≈8m/银杏 ≈8.2m 同语境可混植的悬铃木
 *      速生大乔木突出量级——「中龄个体显著大于先例锚」Spec §2 原文）。
 *
 * ■ 按悬铃木改写项（每条映射实现面）：
 *   1. **大叶疏簇挂点语言（悬铃木独有身份，Spec §4/域扩展节 B leaf_attachment_rule：
 *      互生、一节一叶、节间 3–5cm——shoot-a/b 双源 + FOC "Leaves alternate" [3][4][9]）**：
 *      末级枝疏朗通透（sparse and airy [9]）、每挂点单位 = **单叶**（leaf_cluster_density
 *      = 1 叶/挂点 Spec 域扩展节 B——无簇数）——vs 朴树/香樟小卡密簇（18 卡/簇）、银杏
 *      短枝莲座簇（8 卡/簇）。实现：家族「叶簇」槽位 = **末级枝疏簇**（大簇半径 0.20–0.30
 *      = clump 1/10–1/15 冠幅的卡布置球）+ **簇内 5 候选大卡**（卡宽 0.30–0.44——真叶宽
 *      15–22cm Verified [1][3][8][9] ×≈2 工程映射，六资产最大叶）**黄金角互生螺旋方位**
 *      （φ_j = j×137.5° + 抖动——互生叶序的方位语言，vs 银杏莲座均分 2π/n）+ 簇内大间距
 *      （minSeparation 0.55×簇径和）——「疏簇观感由大叶 + 大节间联合产生」（Spec 原文）
 *      的工程映射：真节间 3–5cm × 卡直径 0.36m ⇒ 卡尺度下 ≈5–9 节/卡径，每簇 5 候选 =
 *      连续节位合并抽象（逐叶 3–5cm 建模面数不可行——银杏散生节距同款先例口径记档）；
 *      卡面平展摊开（PLANE_LIFT 0.12 低于银杏莲座上举 0.32——「叶对枝轴近垂直、略前倾、
 *      平展摊开」[9]）+ 略前倾（FORWARD_TILT 0.28）；无长短枝二型（悬铃木全为长枝延伸、
 *      无短枝距状钉突——vs 银杏双挂点语言）；
 *   2. 树形语言：圆锥（银杏）/圆穹（朴）/广卵（樟）/宽展圆顶（栎）/vase（榉）→
 *      **阔卵-圆头冠**（中龄锚定相 broadly ovoid to rounded、顶部略平、轮廓不规则
 *      ——Spec §3 form 系判读 + 终审降级后仍维持方向（form-c/d 第三眼复核「阔卵冠、
 *      单干、大枝斜上 30–50°」同构）Inferred [9]；幼金字塔→老开张序列 Verified [7][8]）
 *      → 实现：**干向挂点高度分级**（SCAFFOLD_LENGTH_TAPER ×1.18→×0.72 低枝长高枝短 +
 *      SCAFFOLD_ANGLE_TAPER 低枝 +14…16° 平展（「下部大枝明显向四周平展」Spec §3
 *      form-d 读向）/ 高枝 −6…−8° 陡立（圆头闭合——弱于银杏锥顶 −8…−10°）——确定性零
 *      rng）+ 领导枝中庸 0.50（幼-中龄较强 Verified [4][7][8] 的中龄过渡相——圆头顶
 *      由骨架链共构、领导不翻转树顶）+ 散布方位（螺旋互生散布——「骨架枝排列无轮生
 *      口径」Spec 域扩展节 A branch_orientation Inferred [4][9]；asymmetry 0.48 散布端
 *      vs 银杏轮生 0.32）+ 顶部略平（crownTopBias −0.04 微负偏置）；
 *   3. 冠幅比：Spec §3/域扩展节 **0.6–0.8（典型 0.65–0.75）**——六资产中偏窄端（银杏
 *      0.55–0.65 最窄、朴 0.8–0.9/榉 0.8–0.95 最宽、樟 0.7–0.85），速生高干所致；终审
 *      处置 4 维持（form-c/d 复核 0.67–0.83 落域）→ 建模 8 槽取 0.6–0.75（Spec §6 明示）、
 *      crownWidthRatio 参数探针定档（T009.3 口径——外泄系数实测回写，见字段注释）；
 *   4. 干高占比：Spec 域扩展节 A trunk_height_ratio ≈**0.25–0.35**（form 四样木——终审
 *      后有效样木降为 2 张仍落域 ≈0.33，处置 4 维持 Inferred）——悬铃木为六实例首个
 *      **有 Inferred 支撑**的干高域（先例银杏 Unknown·无实证工程默认）；挂高段
 *      scaffoldAttachMin/Span + 干高参数域 0.29–0.35（geometry rng 域）承载；
 *   5. 骨架数：Spec §4/域扩展节 A **4–7 根（典型 5–6）**（Inferred [9]——终审降级后
 *      工程默认带内取值）取 **6 + 1 领导枝**（典型域上端——「下部大枝平展 + 斜上开展
 *      35–60° 广角」的多枝平展读向；拓扑 L1=7 → 簇位 945/皮面 24178，为 12m 大冠的
 *      大卡低数量预算留带内余量——见改写项 1 尺度核算）；
 *   6. 树皮：**光滑斑块剥落型浅起伏**（「树皮光滑，大片块状脱落」FRPS 原句 Verified
 *      [1]；FOC 科级 "smooth, exfoliating in plates" [4]）——非纵裂脊沟族（夏栎/樟/银杏）
 *      与榉树同「光滑剥落」族；**斑驳主体在材质侧**（三色带奶油白/浅黄绿-橄榄/灰褐
 *      多色拼贴 + 斑块 ≈1/8–1/12 干径细端 1/20 记档——platanusMaterials 配方层），几何
 *      只管浅浮雕 → 实现：barkRelief 幅度 0.014（贴榉树光滑 0.015 端——斑块边缘浅
 *      起伏，六分化中与榉树同量级、色温/斑尺度分化全部让渡材质层）+ 谐波 {3,5,6}
 *      （低频大斑）+ drift 11 rad/m（轴向去相关 ≈0.57m——大片剥落的断裂拼贴读向，
 *      贴榉树 11 斑驳断裂端、远于纵脊连续族）；
 *   7. 密度语言：**中-疏**（逆光空隙 20–30% Inferred [9]——canopy-a 25–30%/canopy-b
 *      20–25%）→ crownShellStart 0.48（壳带薄）+ coreDensityFloor 0.08（内膛细枝开网
 *      [9]）+ 空腔 0.50–0.85（大空隙——疏端）+ 疏密差异归槽 6/7；
 *   8. **宿存球状果序（Spec 判定做，§2/域扩展节 B 宿存果序组 Verified [1][3][7][8][9]）**：
 *      夏季满冠宿存成对果球 = 悬铃木最强身份信号之一（07 月照片直接证据 + FOC fr.
 *      Jun–Oct + NC/OSU persist 文献轴——终审处置 1 明示判定维持）——径 ≈2.5cm（标尺
 *      实测 2.5–2.8 [9]）×2 工程映射 ≈5–6.4cm（叶卡同源口径）、每果枝典型 2 个（「二球」
 *      名源 [1][3][5]——85% 成对/15% 单球）、长梗下垂叶幕下方外缘（FOC "pendulous at
 *      least in fruit" [4]）→ 实现：L5 簇位低频挂点（bear rate 0.22）+ 八面体最小面数
 *      表达（8 面/球）+ 账目入叶组（组 1——D15 恰 2 组不破）**uv v∈[2,3] 果序域约定**
 *      （材质侧 v≥2 = 实心果色区，几何-材质接口记档）+ Mid 保留（身份信号）/Low 省略
 *      （远距亚像素，档间连续性记档——果序为冠底点缀，Low 壳卡吞并冠形轮廓）；
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开（差异轴 = 冠幅比 0.6–0.75 / 冠形阔卵↔圆头 /
 *      大枝角斜上↔平展 / 疏密——主代理指定）：slot-1 幼金字塔窄端（NC pyramidal
 *      Verified [7] 的中龄窄相）/ slot-2 老龄开张圆头端（open spreading [7][8] +
 *      form-d 落叶相 0.7–0.8 读向）/ slot-3 偏冠 / slot-4 低冠（干高端个体——域下缘
 *      0.25 侧）/ slot-5 高冠（清干行道语境——域上缘 0.35 侧）/ slot-6/7 疏密端
 *      （空隙 20–30% 带内两端）。**容许低位双主枝不进 8 槽**（终审 C-5 记档不建模——
 *      伪差异禁止项纪律：结构差异（双干/双主枝）不落连续参数，如需表达须家族契约
 *      新结构语义，归 011.13 缺口清单）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_taper_ratio / basal_flare_ratio（Spec 域扩展节 A 均 Unknown）——干形锥度
 *      与根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. DBH 典型值 Unknown（Spec §2 极值「trunk up to 10 m in circumference」[5] 为老树
 *      口径不用）——根径 0.30–0.36m 工程设定（12m 速生中龄个体——比例上瘦于银杏慢生
 *      粗干读向，Step 3 探针校）；
 *   3. branch_angle 度数 / scaffold_angle 度数——「斜上至平展广角」方向 Verified
 *      [7][8][9]（open spreading 园艺 + form 照片 35–60° Inferred），度数取域中带
 *      工程默认（Inferred 支撑强于银杏作废后工程默认——记档分级）；
 *   4. branch_length_decay / branch_radius_decay / allometry_exponent——家族量级工程
 *      设定（干向挂点高度分级为悬铃木工程语言，非实证数值）；
 *   5. leaf_orientation_dist 定量（「近垂直略前倾平展」定性 Inferred [9]——PLANE_LIFT/
 *      FORWARD_TILT 为工程幅度）；裂片数分布比例（5/3/7 各占比）Unknown——5 裂主相
 *      归材质 SDF 层；
 *   6. 生长速率数值 / 树龄-尺度对应 Unknown（Spec §2）——12m 锚的龄级推断以主代理
 *      裁定为准（见可继承项 8）。
 *
 * 不建模记档（Spec 有事实、工程不表达）：掌状 5 裂轮廓/裂深 1/3–1/2/中央裂片阔三角/
 * 裂片 0–2 粗齿/离基掌状 3 脉/截形基（Verified [1][3][4][8][9]——近景叶形细节归
 *      platanusMaterials 的 SDF 叶形，不在几何面）；叶柄长 3–10cm + 叶柄下芽喇叭口
 *      （Verified [1][3][4]——卡抽象不建柄，五先例口径；叶柄下芽近景语义归材质层）；
 *      托叶早落（Verified [1][3][8]——夏季成枝不可见）；嫩枝灰黄绒毛/老枝红褐秃净
 *      （Verified [1][3]——小枝二色归材质层）；秋色黄褐（Verified [7] 单源低置信——
 *      季相归材质/风格层）；行道 pollard 抹头相（Verified [5]——不进生产，§6 记档）；
 *      容许低位双主枝自然变体（终审 C-5 记档容差——单干主导口径维持）；花/春相
 *      （果期外语义）；品种窄化（'Bloodgood' 等 Verified [7]——原种血统口径不取）；
 *      果序宿存花柱刺状 2–3mm（Verified [1]——果球表面细部归材质）；三球/一球亲本相。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：中龄公园单干自然冠个体 ≈12m 量级（主代理裁定
 * 保守低端——弱推断 per 终审记档）、**阔卵-圆头冠**（低枝平展 + 高枝收角 + 领导中庸
 * + 散布方位 + 顶部略平）、**六资产最大叶**（大卡 0.30–0.44 × 长宽比 0.70–0.90 宽>长）
 * **疏簇挂点**（每簇 5 候选黄金角互生螺旋）、干高占比 0.25–0.35（六实例首个 Inferred
 * 支撑域）。T009.3 教训沿用：视觉冠底由挂高段（scaffoldAttachMin/Span）+ 横展角 +
 * upturn + 领导枝链涌现，不由 crownCenterRatio——校准以实测 stats 的叶卡最低 Y（视觉
 * 冠底）为准回推挂高段参数；阔卵-圆头剪影由干向挂点高度分级（长度 + 角度双梯度，
 * platanusGeometry）+ 散布方位涌现。结构计数类（trunk/levels radial/segs、childPlan、
 * 簇位数、每簇叶量、voidCount、scaffoldCount、果序 rng 消费口径 [geometry 常数]）
 * 全槽恒等；叶卡尺寸/长宽比域槽间不动（叶身份）。
 */
export const PLATANUS_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节：冠幅/树高比 **0.6–0.8（典型 0.65–0.75）**——六资产中偏窄端
   *  （速生高干所致；终审处置 4：form-c/d 复核 0.67–0.83 落域维持 Inferred）。**Step 3
   *  探针回推定档（2026-09-20 实测，三轮）**：初值 0.52 期涌现 w/h = 0.868 大幅越域上沿
   *  （外泄 ×1.67——低枝平展角 +14…16° × 长度分级 ×1.18 双放大，扁平枝向延伸链水平
   *  展宽——vs 银杏收角端外泄 ×1.06），骨架侧分级梯度回调（角度 +14/+16°→+10/+12°、
   *  长度 ×1.18→×1.10，platanusGeometry SCAFFOLD_*_TAPER）+ 参数 0.46 复测涌现
   *  **w/h = 0.683**（外泄 ×1.48）落工程域 0.6–0.75 中带；8 槽带 0.543–0.762（slot-1
   *  幼相窄端 0.543 微出下沿 / slot-2 老龄开张端 0.762 贴上沿——龄相端点读向，记档同
   *  银杏 Princeton Sentry 0.447 先例）。【冠幅比类 = 家族共性候选沿用；锚值 = 悬铃木
   *  特有（工程域 + 实测外泄系数回推——探针定档记录，非编造）】 */
  crownWidthRatio: 0.46,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；阔卵-圆头冠体中心中带
   *  ——干高 0.29–0.35 + 冠高 0.70 的参考系，圆头闭合由骨架侧驱动链承载）。 */
  crownCenterRatio: 0.62,
  /** 工程设定（同上；阔卵-圆头冠纵域参考系——顶部略平由 crownTopBias 微负偏置配合，
   *  冠顶圆化由高枝收角 + 末级 upturn 承载）。 */
  crownHeightRatio: 0.7,
  /** Spec 域扩展节 A branch_orientation：**螺旋互生散布（alternate）**——「Leaves
   *  alternate」FOC Verified [4] + 枝系无轮生证据（vs 银杏近轮生——五资产唯一轮生口径）
   *  ——骨架枝排列无轮生口径（Inferred [9]）。slot-0 = 0.48（**散布端**——vs 银杏轮生
   *  0.32/榉树 0.5：方位均分步进 + 大抖动 → 互生散布读向）。【散布机制 = 家族共性候选
   *  沿用（榉/朴/樟同端）；幅度 = 悬铃木特有（互生散布口径 [4][9]）】 */
  asymmetry: 0.48,
  /** Spec §3 中龄锚定相「顶部略平、轮廓不规则」（Inferred [9]——阔卵-圆头读向下的
   *  顶密轻微负偏置；几何顶圆化由高枝收角 + 末级 upturn 承载，本字段只调密度场高度向）。
   *  【悬铃木特有定档依据 = Spec §3 中龄相 Inferred [9]；幅度工程设定】 */
  crownTopBias: -0.04,

  // 骨架
  /** Spec §4 / 域扩展节 A scaffold_branch_count ≈**4–7 根（典型 5–6）**（Inferred [9]——
   *  终审降级后工程默认带内取值）。slot-0 = 6（典型域上端 + 「下部大枝平展」多枝读向；
   *  另含 1 领导枝不计入）——拓扑 L1=7 → 簇位 945 / 皮面 24178，为 12m 大冠的大卡
   *  低数量预算留带内余量（叶面预算核算见 clusterLeaves 注释）。【结构计数类：槽间
   *  恒等；取 6 = 工程默认（Spec 域典型带内）】 */
  scaffoldCount: 6,
  /** Spec 域扩展节 A scaffold_angle：**斜上至平展广角 35–60°（主流 40–55°）**（四样木
   *  35–55°/40–60°/35–55°/40–60° Inferred [9] + open spreading 园艺 Verified [7][8]——
   *  证据强于先例银杏（照片作废后纯工程默认））。slot-0 = 36–54°（主流 40–55 取中带
   *  ——vs 银杏 32–48 收角端：广角开展读向）；干向角度梯度（低枝 +14…16° 平展——
   *  「lower limbs spread widely」[9] / 高枝 −6…−8° 圆头闭合，platanusGeometry
   *  SCAFFOLD_ANGLE_TAPER）在本域上叠加。【悬铃木特有（广角 Inferred+Verified 双源 +
   *  度数域中带工程默认）】 */
  scaffoldAngleMin: 36,
  scaffoldAngleMax: 54,
  /** Spec 域扩展节 A trunk_height_ratio ≈**0.25–0.35**（form 四样木 Inferred [9]——
   *  终审处置 4 维持：有效样木降为 2 张仍落域）的挂高段实现：挂点 0.58–0.74 干高段
   *  （trunk 参数域 0.29–0.35 × H）span 0.16——干高 Inferred 域中带挂高；T009.3：挂高段
   *  下缘 + 横展角 + upturn + 领导链共同涌现视觉冠底。**Step 3 探针回推（2026-09-20
   *  实测）**：涌现视觉冠底/实高 **0.296**（8 槽带 0.198–0.314——低冠/高冠槽展开；
   *  Inferred 域 0.25–0.35 中带——六实例首个实测落 Inferred 域）。【悬铃木特有
   *  （Inferred 支撑域 + 探针回推实测）】 */
  scaffoldAttachMin: 0.58,
  scaffoldAttachSpan: 0.16,
  /** 工程设定（branch_radius_decay Unknown、DBH 典型值 Unknown（Spec §2 极值 10m 周长
   *  为老树口径不用）；12m 速生中龄个体的比例瘦干读向（vs 银杏慢生粗干 0.57）取 0.54
   *  ——六实例偏细端，待视觉验收校）。 */
  scaffoldThickness: 0.54,
  /** rank 长度乘子（6 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用；
   *  散布互生骨架的环内势差——偏冠槽加大首枝势差承载）。 */
  scaffoldRankLength: [1.12, 1.04, 0.98, 0.92, 0.88, 0.84],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.03, 0.97, 0.93, 0.90, 0.88, 0.86],
  /** Spec 域扩展节 A apical_dominance：**幼-中龄较强（幼金字塔 pyramidal Verified
   *  [7][8]）→ 老龄失去主轴转开张（open spreading）**——中龄锚定相 = 过渡段：领导中庸
   *  0.50（vs 银杏 0.54 强 / 榉树 0.46 弱——圆头顶由骨架链共构、领导不翻转树顶（T009.3
   *  弱领导翻转警示的安全带内）；无顶芽合轴分枝（FOC "Terminal buds absent" Verified
   *  [4]）由领导链抽象承载——真二叉/双主枝不建模记档见模块头）。**Step 3 探针记档
   *  （2026-09-20）**：悬铃木 12m 级领导链复利外伸 ≈×1.9（实测领导比 ±0.1 → 涌现树高
   *  ±1.4–1.9m——先例银杏 ×1.8 于 8m 级、绝对噪声 ×0.65；slot-0 涌现 11.63 落锚域），
   *  槽间种子实现的涌现高度差由各槽领导比回调定档（slot-2 0.46→0.52 / slot-4
   *  0.48→0.40 / slot-7 0.48→0.44，8 槽涌现带 11.53–12.79 收进 ≈12m 锚域 ±5%——回调
   *  记档同银杏 slot-5 0.72→0.46 先例）。【悬铃木特有定档依据 = Spec apical_dominance
   *  幼强老失轴序列 Verified [4][7][8] 的中龄过渡位；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.5,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；7 L1 下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝「斜上延展 + 果期下垂」定性
   *  Verified [4] 由 levels.upturn 承载——方法恒同，长度比沿用家族量级）。 */
  lengthRatioBase: 0.42,
  lengthRatioSpan: 0.15,
  /** L1 0.64 通体锥度（骨架枝开展直伸——略粗于银杏 0.66 的通体；branch_curvature
   *  「斜上-平展开展（ascending-spreading）」Verified [4][7][8] 由姿态字段承载）。
   *  工程设定（Spec 无悬铃木锥度数值）。 */
  endRatio: [0.64, 0.6, 0.6, 0.6, 0.6],

  // 冠内通透（中-疏基调——逆光空隙 20–30%，六资产疏端带）
  /** Spec §3 / 域扩展节 B crown_transparency：**中-疏**——逆光空隙 ≈20–30%（canopy-a
   *  25–30% / canopy-b 20–25% / form 系整树 20–30% Inferred [9]）。slot-0 = 1.0 基准
   *  （疏密差异归槽 6/7——家族沿用；空隙量级由大卡疏簇覆盖 + 大空腔域 + 薄壳带参数
   *  承载）。【canopyDensity 类 = 家族共性候选；基调读向 = 悬铃木特有（中-疏
   *  Inferred [9]）】 */
  canopyDensity: 1.0,
  /** Spec 域扩展节 B crown_fill_gradient：外密内疏（canopy 双源 + form-c「外部密实、
   *  内部稀疏」双系统交叉 Inferred [9]）。家族沿用；悬铃木壳带取 0.48（**薄于五先例**
   *  ——中-疏基调：外壳满密带窄、向内快速衰减，配合大卡覆盖语义）。【连续形态参数；
   *  值 = 悬铃木特有】 */
  crownShellStart: 0.48,
  /** 芯层起点与地板值：Spec §3 内膛枝现象——**内膛细枝网可见但不成密团**（canopy-a/b
   *  「inner branchlets visible」Inferred [9]）→ 芯层地板 0.08（开网不空透——略高于
   *  银杏 0.06 的开网端）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.08,
  /** 规则①（枝干通道：主干大枝进冠不被封死——内膛细枝网可见 [9] 的「透」侧承载）；
   *  数值工程设定（12m 大冠通道带随冠尺度放大，比例沿家族量级）。 */
  channelRadius: 0.5,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：中-疏 20–30% 空隙读向的冠内空隙表达之一）。【结构计数类：槽间
   *  恒等】数量工程设定（与五先例同为 3——空腔尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域大档（0.50–0.85：疏端大空隙——空隙 20–30% 的疏读向表达；vs 银杏
   *  0.46–0.78 / 榉树 0.48–0.82 的中带）。值 = 悬铃木特有；半径域机制 = 家族共性候选。 */
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.85,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；悬铃木「叶簇」= **末级枝疏簇**
  // （大簇半径 0.20–0.30 = clump 1/10–1/15 冠幅的卡布置球 + 簇内 5 候选大卡黄金角互生
  // 螺旋疏排 + L5 簇位果序挂点）= 大叶疏簇挂点语言）
  /** Spec 域扩展节 B leaf_attachment_rule：**单叶互生疏排（一节一叶）**——互生
   *  Verified [3][4]、节间 3–5cm + 疏朗通透 Inferred [9]（shoot-a/b 双源）+ 叶幕集中
   *  冠壳外段（Inferred [9]）。簇位数 L5=2 + L4=1（家族沿用夏栎拓扑映射——「末级枝
   *  外段 + 枝端」的疏簇位点）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——末级枝叶组挂外段受光区 [9]；疏簇位点较先例
   *  略向内起——L5 内段 0.45 起，为枝中疏簇位（互生叶沿枝全长散布的映射）。）。 */
  clusterInnerStartL5: 0.45,
  clusterInnerStartL4: 0.4,
  /** Spec §2 / 域扩展节 B leaf_size + clump_scale：真叶宽 15–22cm（FRPS/FOC 双志
   *  Verified [1][3] + OSU/照片交叉 [8][9]——**六资产最大叶**）× ≈2 工程映射（先例
   *  口径）→ **疏簇半径 0.20–0.30**（末枝叶团 ≈1/10–1/15 冠幅 = 0.55–0.8m 的卡布置
   *  球半径域——团块为末级枝叶组非叶簇 [9]，L5 枝长 cap 0.6 下实际多落 0.20–0.25）；
   *  夏栎 0.11–0.15/朴树 0.10–0.14/香樟 0.11–0.15/榉树 0.09–0.125/银杏 0.085–0.125
   *  ——悬铃木为六实例最大簇（大叶 × 疏簇语义：簇 = 布置球非密团）。L4 簇 ×1.2 承接
   *  更粗末级枝——家族沿用。【簇半径比类 = 家族共性候选；绝对量级 = 悬铃木特有】 */
  clusterRadiusMinL5: 0.2,
  clusterRadiusSpanL5: 0.1,
  clusterRadiusScaleL4: 1.2,
  /** 工程设定（家族沿用——短枝梢簇随之缩小的 cap 语义：L5 枝长 ~0.4–0.6m 下 cap
   *  0.24–0.36，簇半径实际由 cap 主导）。 */
  clusterRadiusLengthCap: 0.6,
  /** Spec 域扩展节 B leaf_cluster_density「1 叶/挂点」+ 疏簇观感由「大叶 + 大节间」
   *  联合产生——簇级显式剔除的大间距保险：0.55（**高于五先例 0.46–0.58 带中值**——
   *  大簇 + 疏簇语义：簇心距 ≥ 0.55×(ri+rj) ≈ 0.22–0.33m，簇间大间隙读向；挂点 rng/
   *  叶片 rng 无条件消费后丢弃，确定性不破）。【间距机制 = 家族共性候选；值 = 悬铃木
   *  特有（疏簇大间距）】 */
  clusterMinSeparation: 0.55,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 5 = **疏簇候选数**（互生单叶语言的卡尺度合并抽象：真节间 3–5cm × 卡直径
   *  ≈0.36m ⇒ ≈5–9 节/卡径，每簇 5 候选 = 连续节位合并 + 通透过滤后逐簇存活典型 3–5
   *  片（实测逐簇均值 3.49–4.50）——「一节一叶 + 疏朗通透」[9] 的工程映射；vs 朴树/香樟
   *  密簇 18、银杏莲座 8）。8 槽簇位 945（L4 189×1 + L5 378×2，7 L1 拓扑）× 5 卡的 High
   *  实测（2026-09-20 探针）：保留簇 371–447（簇级剔除 498–574）× 通透存活 → 卡
   *  1295–1752（slot-6 疏松最低 / slot-7 丰满最高）→ High 总面 27456–28769 = 皮 24178 +
   *  卡 2590–3504 + 果序 672–1048 落家族行 [?, 40000] 带内（**大卡低数量语义**：单卡
   *  面积 ≈0.10m² vs 银杏 0.013m² ×7.7——同覆盖率下卡数天然低于小卡资产、密度语义由
   *  大卡覆盖率承载，High 参考下沿 = 悬铃木自己的实测带下沿记档——同银杏先例口径）。
   *  【每簇叶量类 = 家族共性候选；绝对值 = 悬铃木特有（互生疏排合并抽象 + 实测定档）】 */
  clusterLeavesL5: 5,
  clusterLeavesL4: 5,
  /** 外壳偏置 ∈ (0,1]：疏簇平摊——簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^γ)
   *  取 0.42（**低于五先例 0.50–0.66**：互生叶沿末级枝散布非壳聚团——r̂ ∈ [0.58, 1]
   *  的宽域均匀分布，簇心即枝梢位）。【壳偏置机制 = 家族共性候选；值 = 悬铃木特有
   *  （互生散布平摊读向）】 */
  clusterShellBias: 0.42,
  clusterShellGamma: 0.9,
  /** Spec §2 / 域扩展节 B leaf_size + leaf_aspect_ratio：真叶宽 15–22cm × 长 12–18cm
   *  （FRPS/FOC 全域宽 12–25 × 长 10–24 Verified [1][3]——照片建模域 [9]）→ **卡宽
   *  0.30–0.44m**（真叶宽 ×≈2 工程映射——六先例口径：银杏 0.10–016/朴树 0.07–0.11/
   *  香樟 0.06–0.095/榉树 0.04–0.06/夏栎 0.08–0.13——悬铃木 ≈银杏 ×3）。【卡尺寸域
   *  类 = 家族共性候选；绝对量级 = 悬铃木特有（六资产最大叶）】 */
  leafWidthMin: 0.3,
  leafWidthSpan: 0.14,
  /** Spec 域扩展节 B leaf_aspect_ratio：**长/宽 ≈0.7–0.9（宽>长——阔卵形掌状裂口径；
   *  FRPS 宽 15–22 > 长 12–18 原句序 Verified [1][3] + 照片实测 [9]）→ 卡长宽比
   *  （长/宽）= **0.70–0.90**（与银杏扇形 0.62–0.91 同「宽>长」反向族——家族
   *  leafAspect 语义 = 卡长/卡宽 <1 的契约内表达）。【长宽比域类 = 家族共性候选；
   *  域值 = 悬铃木特有（阔卵宽叶口径）】 */
  leafAspectMin: 0.7,
  leafAspectSpan: 0.2,

  // 树皮近景微起伏（悬铃木特有分化：**光滑斑块剥落浅浮雕**——「树皮光滑，大片块状
  // 脱落」FRPS Verified [1] / FOC "smooth, exfoliating in plates" [4]；vs 夏栎脊沟
  // 0.033/朴树浅斑 0.016/香樟纵裂 0.036/银杏浅-中纵裂 0.030/榉树光滑剥落 0.015 六分化
  // 中贴榉树光滑端——**斑驳主体在材质侧**（三色带奶油白/浅黄绿-橄榄/灰褐拼贴 + 斑块
  // 1/8–1/12 干径细端 1/20 记档——platanusMaterials 配方层），geometry 只管浅起伏）
  /** 光滑斑块剥落端锚定 0.014（Spec §5 / 域扩展节 C bark_relief「光滑-低浮雕」
   *  Inferred [1][9]——干面整体光滑、斑块凸起差异细碎浮雕；贴榉树 0.015 同量级：
   *  同「光滑剥落」族的几何层共性，色温/斑尺度分化让渡材质层）。主干基环半径 ≈0.30–
   *  0.36m（Step 3 域）→ 峰幅度 ≈4.2–5.0mm、同环极差 ≈6–10mm——近景斑块边缘浅起伏
   *  可辨、中景剪影光滑。亚视觉地板联动：0.014 下起径 <0.11m 的管平滑发射——主干 +
   *  L1 骨架有效起伏（大片剥落显于粗干 [1][4]）、L2 以下细枝光滑。【幅度 ∝ 半径量级
   *  挂钩 = 家族共性候选沿用；绝对值 = 悬铃木特有】槽间恒等（barkRelief 非形态差异
   *  维度——slot-0 定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.014,
    /** 低频大斑谐波：k∈{3,5,6}——k3 主导（周向 3 大斑——大片地图状剥落 ≈1/8–1/12
     *  干径的周向大斑语言 + k5/k6 斑缘细纹（≤ 主干 radial 14 的奈奎斯特域 7 留 1 档
     *  边际——家族同款边际纪律；谐波语言与榉树 {3,5,6} 同构——光滑剥落族共性，色带
     *  分化在材质层）。【谐波语言 = 悬铃木特有定档（光滑剥落浅浮雕——低频大斑）】 */
    harmonics: [3, 5, 6],
    /** 轴向游走基率 11 rad/m（**断裂拼贴端**——轴向去相关 ≈2π/11 ≈ 0.57m：大片剥落
     *  的斑块边界轴向断裂读向，贴榉树 11 斑驳断裂端、远于纵脊连续族（银杏 2.6/香樟
     *  3.2）与夏栎缓游走 0.85——斑块地图状拼贴的工程映射）。【游走机制 = 家族共性
     *  候选；速率值 = 悬铃木特有（断裂拼贴端）】 */
    drift: 11,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown——flare 1.18 轻度沿家族常量，Step 3 微调归几何））。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 branching_levels
   *  Inferred [9]）的家族五级方法沿用，级数槽间不动。姿态分级为悬铃木开展语言：
   *  upturn [0.28,0.24,0.19,0.15,0.10]（**低于银杏 [0.30,…,0.11] 的上举链**——斜上-
   *  平展开展 [4][7][8]：冠缘摊平的阔卵-圆头读向，末级 0.10 承担外缘平展 + 果枝下垂
   *  由果序挂点语言承载；初值 [0.26,…,0.09] 在 12m 级链上涌现高度噪声放大（树顶链
   *  实现离散），微升收紧——探针记档）；wander 骨架级 0.09 略游走（开展自然）+ 末级
   *  乱幅 0.35 家族量级（内膛细枝网 [9]）；分级单调性保持。各级数值工程设定（方向
   *  Spec Verified [4][7][8]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.28 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.24 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.19 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.15 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.1 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑——L3→L4 三挂点承载 7 骨架下的簇位量 945）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3 语法复制）：窄冠幼相端——幼金字塔读向（NC「pyramidal when
 * young」Verified [7]；Spec §6 冠形幅度全域窄端 + 幼相个体——12m 中龄混植带内的年轻
 * 相个体）。组合：冠幅比降（0.40——**Step 3 探针回推（2026-09-20 实测）**：涌现 0.543
 * 微出建模域 0.6–0.75 下沿——幼相窄冠受散布方位底宽制约的域外个体读向，记档同银杏
 * slot-1 0.447 先例；同 seed 展开/挺拔叶幕宽度比实测 1.75、规范种子宽比 8.79/6.52
 * ≈1.35——槽身份可辨）+ 冠高比升（0.78 幼相纵域长）+ 横展角收窄上举（28–42°）+
 * 挂高段上移收窄（0.66–0.76 干高段 span 0.10——幼相高挂点）+ 领导枝偏强（0.52——
 * 幼-中龄 excurrent 较强端 [7][8]；实测涌现树高 12.00 落锚域）+ crownTopBias 转正
 * （0.10 幼金字塔顶密）+ upturn 链 ×1.1（幼相上举）。upturn 分级结构不动（同种语言
 * ——窄金字塔而非柱冠）。
 */
const PLATANUS_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...PLATANUS_SLOT0_PROFILE,
  crownWidthRatio: 0.4,
  crownCenterRatio: 0.66,
  crownHeightRatio: 0.78,
  crownTopBias: 0.1,
  scaffoldAngleMin: 28,
  scaffoldAngleMax: 42,
  scaffoldAttachMin: 0.66,
  scaffoldAttachSpan: 0.1,
  scaffoldRankLength: [1.08, 1.02, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.52,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.31 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.26 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.21 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.17 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.11 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：开张圆头端——老龄开张广展读向（NC/OSU「open,
 * spreading with age」Verified [7][8] + form-d 落叶相冠幅比 0.7–0.8 读向 [9]——
 * Spec §6 联动轴老龄端；中龄带内的开张个体）。组合：冠幅比升（0.54——**Step 3 探针
 * 回推（2026-09-20 实测）**：涌现 0.762 贴工程域 0.6–0.75 上沿（外泄 ×1.41——低枝
 * 平展基扇的宽端外泄；老龄开张 0.7–0.8 域内读向）+ 冠高比降（0.60 扁圆头端）+ 冠心降
 * （0.58——冠最宽带下压向挂点段）+ 横展角大（46–62° 开张端——工程域内宽端外推）+
 * 挂高段下移放宽（0.46 起 span 0.24——开张广展）+ 外层 upturn 微收（冠缘摊平）+
 * 领导枝回调（0.52——开张端设计领导弱，初值 0.46 实测涌现树高 10.70 越锚域下沿
 * （12m 级领导链复利外伸的种子实现差异，见 slot-0 leaderLengthRatio 探针记档），回调
 * 后 11.53 落锚域下段——开张语义由横展角/挂高段/冠形参数承载，记档）+ 首枝 rank
 * 主导强（×1.26）+ crownTopBias 负（−0.10 顶部平展圆头）。
 */
const PLATANUS_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...PLATANUS_SLOT0_PROFILE,
  crownWidthRatio: 0.54,
  crownCenterRatio: 0.58,
  crownHeightRatio: 0.6,
  crownTopBias: -0.1,
  scaffoldAngleMin: 46,
  scaffoldAngleMax: 62,
  scaffoldAttachMin: 0.46,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.26, 1.05, 0.95, 0.87, 0.81, 0.77],
  scaffoldRankRadius: [1.06, 0.97, 0.91, 0.87, 0.84, 0.81],
  leaderLengthRatio: 0.52,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.22 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.19 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.15 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.11 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.08 },
  ],
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：散布
 * 互生骨架的方位强弱分化（无轮生均分约束——悬铃木散布口径 [4][9] 使偏侧势差更自由）
 * + 冠形个体开张度幅度（Spec §6）——方向采信；幅度工程设定）。组合：asymmetry 升
 * （0.52——散布骨架的方位大抖动；偏侧相干性由 rank 主导承载）+ scaffoldRankLength
 * 首枝 ×1.62 / 弱势 ×0.74（一侧枝展压倒性——首枝质量占比 0.32，配 5 弱枝近均分 →
 * 质心稳定指向首枝方位；榉树 ×1.50/银杏 ×1.70 同构量级带）+ scaffoldRankRadius 同向
 * （×1.10）+ 冠幅比 0.46 容纳域（**Step 3 探针回推（2026-09-20 实测）**：涌现 0.726
 * 带内——偏侧枝展的质心偏移读数见下）+ 横展角域微扩（38–56°）+ 挂高段贴标准。其余
 * 维度贴标准（偏冠 = 方位维差异）。**Step 3 探针实测**：6 种子面板质心均值比 1.208
 * （散布骨架偏冠读向——介于银杏 1.20 中轴稀释与榉树 1.51 之间）；规范种子绝对偏移
 * 1.55m（slot-0 规范种子质心 0.06m 居中——单种子读数相干性强，绝对读数为主口径）。
 */
const PLATANUS_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...PLATANUS_SLOT0_PROFILE,
  crownWidthRatio: 0.46,
  crownCenterRatio: 0.62,
  asymmetry: 0.52,
  scaffoldAngleMin: 38,
  scaffoldAngleMax: 56,
  scaffoldAttachMin: 0.58,
  scaffoldAttachSpan: 0.16,
  scaffoldRankLength: [1.62, 1.04, 0.94, 0.86, 0.79, 0.74],
  scaffoldRankRadius: [1.1, 0.96, 0.92, 0.88, 0.85, 0.82],
  leaderLengthRatio: 0.5,
};

/**
 * slot-4 低冠组合（009.3 语法复制 + 干高 Inferred 域下端）：低分枝点开张个体——干高
 * 占比 0.25–0.35（Inferred [9]）的下段端个体（「下部大枝明显向四周平展」[9] 的低冠
 * 极端读向）。组合：挂高段下移放宽（attachMin 0.46 + span 0.22——低分枝 + 挂高段
 * 松散）+ 冠心降（0.56）+ crownTopBias 负（−0.08 底密）+ 横展角大（46–62° 低枝开张
 * 平展）+ 姿态下压（levels upturn ×0.75——开展弱化端、冠缘摊平；分级单调性保持）+
 * 簇半径微升（0.22–0.34 低开张大簇）+ **领导枝回调 0.40**（初值 0.48 实测涌现树高
 * 14.31 大幅越锚——本槽种子的领导链复利外伸实现（12m 级链噪声，见 slot-0
 * leaderLengthRatio 探针记档），回调后 12.79 落锚域上段；低冠槽领导弱化与低分枝读向
 * 同向，记档同银杏 slot-5 0.72→0.46 先例）+ 冠幅比 0.48（**Step 3 探针回推
 * （2026-09-20 实测）**：涌现 0.656 带内）。**涌现视觉冠底 0.198**（Inferred 域
 * 0.25–0.35 下缘的低冠变体外推——低枝平展使叶幕自挂点下方展开；高冠槽冠底差同 seed
 * 实测 1.20m）。
 */
const PLATANUS_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...PLATANUS_SLOT0_PROFILE,
  crownWidthRatio: 0.48,
  crownCenterRatio: 0.56,
  crownHeightRatio: 0.7,
  asymmetry: 0.48,
  crownTopBias: -0.08,
  scaffoldAngleMin: 46,
  scaffoldAngleMax: 62,
  scaffoldAttachMin: 0.46,
  scaffoldAttachSpan: 0.22,
  scaffoldRankLength: [1.16, 1.03, 0.96, 0.9, 0.86, 0.82],
  scaffoldRankRadius: [1.03, 0.96, 0.92, 0.89, 0.87, 0.85],
  leaderLengthRatio: 0.4,
  clusterRadiusMinL5: 0.22,
  clusterRadiusSpanL5: 0.12,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.21 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.18 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.14 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.11 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.08 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制 + 干高 Inferred 域上端）：清干高枝个体——挂高段提向
 * Inferred 域上缘（行道清干语境的公园自然冠变体——无 pollard 修剪伤、天然高分枝）。
 * 组合：挂高段上移收窄（attachMin 0.74 + span 0.08——高挂点 + 挂高段集中）+ 冠心升
 * （0.68）+ crownTopBias 转正（0.08 顶密）+ 领导枝 0.50（**Step 3 探针定档**：初值
 * 0.54 实测涌现 13.27 越锚域上沿（12m 级链复利外伸的种子实现差异，见 slot-0
 * leaderLengthRatio 探针记档），回调后 12.58 落锚域上段——高冠槽树高读向偏高与身份
 * 同向）+ 横展角收（30–44°）+ 姿态上举（levels upturn ×1.05；分级单调性保持）+
 * 冠高比降（0.64 高挂点纵域收窄）+ 冠幅比 0.46（**Step 3 探针回推（2026-09-20
 * 实测）**：涌现 0.663 带内）+ asymmetry 降（0.42）。**涌现视觉冠底 0.314**（Inferred
 * 域 0.25–0.35 上带——高挂点变体，槽维度展开记档）。
 */
const PLATANUS_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...PLATANUS_SLOT0_PROFILE,
  crownWidthRatio: 0.46,
  crownCenterRatio: 0.68,
  crownHeightRatio: 0.64,
  asymmetry: 0.42,
  crownTopBias: 0.08,
  scaffoldAngleMin: 30,
  scaffoldAngleMax: 44,
  scaffoldAttachMin: 0.74,
  scaffoldAttachSpan: 0.08,
  scaffoldRankLength: [1.1, 1.03, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.5,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.29 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.25 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.2 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.16 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.11 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透疏端——canopy-a 型空隙 25–30% 个体（Spec §3
 * crown_transparency Inferred [9] 的疏端——逆光大空隙 + 内膛细枝开网读向）。组合：
 * canopyDensity 0.82（**Step 3 探针定档（2026-09-20 实测）**：Mid 总面 6208 贴家族行
 * 下沿 6000（大卡低数量语义下 Mid 叶面基数小——低密度端保留下沿余量锁定）；疏密对比
 * 维持（同 seed 卡数比 slot-7 实测 0.739、规范种子 1295/1740 ≈0.744））+
 * crownShellStart ↑（0.54 壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓
 * （0.05——内膛开网读向的疏端）+ 空腔半径域 ↑（0.56–1.00 大空隙）+ clusterMinSeparation
 * ↑（0.62 疏簇更散）+ clusterShellBias ↓（0.36 散布更宽）+ 领导枝弱（0.48——多枝共构
 * 开张端，涌现树高 12.18 落锚域）+ 冠幅比 0.48（涌现 0.612 带内）。
 */
const PLATANUS_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...PLATANUS_SLOT0_PROFILE,
  crownWidthRatio: 0.48,
  canopyDensity: 0.82,
  crownShellStart: 0.54,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.05,
  voidRadiusMin: 0.56,
  voidRadiusMax: 1.0,
  clusterMinSeparation: 0.62,
  clusterShellBias: 0.36,
  leaderLengthRatio: 0.48,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密团冠端——canopy 空隙 20–30% 带内密端（Spec §3
 * Inferred [9]——canopy-b 20–25% 读向的密侧 + 中龄生长季满冠个体）。组合：canopyDensity
 * 0.92（**Step 3 探针复核（2026-09-20 实测 High 28706**——簇 5 候选高保留 1740 卡 +
 * 果序 131 球落带内中段；先例同款预算校准流程：朴树 0.93/香樟 0.94/榉树 0.92/银杏
 * 0.92 定档）+ crownShellStart ↓（0.42 满密壳带更厚）+
 * crownCoreStart ↑（0.16）+ coreDensityFloor ↑（0.11 团冠感）+ 空腔半径域 ↓（0.38–
 * 0.66）+ clusterMinSeparation ↓（0.48 簇更密）+ clusterShellBias ↑（0.48 簇更实）+
 * 冠幅/冠高比 0.48 / 0.74（团冠体量，涌现 0.568——密簇端叶幕内收读向）+ **领导枝回调
 * 0.44**（初值 0.48 实测涌现 13.28 越锚域上沿（12m 级链噪声，见 slot-0
 * leaderLengthRatio 探针记档），回调后 12.61 落锚域，记档）。
 */
const PLATANUS_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...PLATANUS_SLOT0_PROFILE,
  crownWidthRatio: 0.48,
  crownHeightRatio: 0.74,
  canopyDensity: 0.92,
  crownShellStart: 0.42,
  crownCoreStart: 0.16,
  coreDensityFloor: 0.11,
  voidRadiusMin: 0.38,
  voidRadiusMax: 0.66,
  clusterMinSeparation: 0.48,
  clusterShellBias: 0.48,
  leaderLengthRatio: 0.44,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；悬铃木沿
 * Spec §6 幅度轴展开：幼金字塔窄端（slot-1）/ 老龄开张圆头端（slot-2）/ 偏冠端
 * （slot-3）/ 干高端（slot-4/5——Inferred 域 0.25–0.35 两侧）/ 疏密端（slot-6/7——
 * 空隙 20–30% 带两端））。slot-1…7 以 slot-0 锚点为底的差量展开定义——**结构计数类
 * 字段（trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、
 * scaffoldCount）与叶卡尺寸/长宽比域由展开继承逐位恒等**（皮面数恒等 24178 与 rng
 * 消费次数恒等的结构性保证；果序挂点口径 [platanusGeometry 常数] 同槽间恒等）；
 * barkRelief 槽间恒等（spread 继承）。morphSeed 路由见
 * assets/asset_tree_platanus.asset（Step 3 交付）。
 */
export const PLATANUS_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  PLATANUS_SLOT0_PROFILE,
  PLATANUS_SLOT1_PROFILE,
  PLATANUS_SLOT2_PROFILE,
  PLATANUS_SLOT3_PROFILE,
  PLATANUS_SLOT4_PROFILE,
  PLATANUS_SLOT5_PROFILE,
  PLATANUS_SLOT6_PROFILE,
  PLATANUS_SLOT7_PROFILE,
];
