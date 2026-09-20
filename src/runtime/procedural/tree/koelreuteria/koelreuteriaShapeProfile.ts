/**
 * runtime/procedural/tree/koelreuteria/koelreuteriaShapeProfile —— 栾树 shapeProfile 数值面
 * （T011.6 Step 1 + Step 2，阔叶家族契约第七实例——方法复制自夏栎第一实例经朴树
 * （T011.1）/香樟（T011.2）/榉树（T011.3）/银杏（T011.4）/悬铃木（T011.5）六次验证的
 * 通路：../platanus/platanusShapeProfile 同构——最新方法复制模板）。
 *
 * 职责：栾树（Koelreuteria bipinnata Franchet 复羽叶栾树 FOC 广义，无患子科栾树属
 *      落叶乔木——**生产主力相 = 黄山栾树相**（FRPS var. integrifoliola 口径小叶全缘，
 *      FOC Vol.12 并入 K. bipinnata 作异名；定名判据链与 paniculata 差分对照轴见
 *      Spec §1，种定名维持终审裁决 6）、**公园单干中龄个体 ≈10m**（树高锚主代理裁定
 *      ——Spec §2 中龄域 8–12m 弱 Inferred 收口 9–11m 默认 10m，终审裁决 7））
 *      枝干/冠层结构的形态参数**数值面**——类型契约 = 阔叶家族契约
 *      ../broadleaf/broadleafShapeProfile（BroadleafShapeProfile，零修改第七实例化；
 *      字段语义、【阔叶共性候选】标注、T009.3 消费语义与槽间恒等纪律见家族文件）。
 *      **六先例的数值是证据不是家族真理**，本文件全部数值依据
 *      docs/research/koelreuteria-reference.md（Spec Version 1.0——生产一律以文末
 *      「终审记档」④ 生产口径终版 + 「主代理补充证据记档」为准，两节覆盖正文处以后者
 *      为准：复叶计数域改「羽片 4–5(–6) 对 × 每羽片 5–7(–9) 枚」（裁决 2）、树高锚
 *      10m 保守 9–11（裁决 7）、花果冠面覆盖率口径（裁决 3）、果尺寸锚文献 4–7 ×
 *      3.5–5cm 中值 5.5×4.2（裁决 4）、**树皮主代理终版 = 浅色光滑 + 皮孔麻点 + 局部
 *      浅细纵裂 + 无剥落**（bark-b 双系统补证，替代终审保守类比口径）、多干变体记档
 *      不建模（platanus 低位双主枝先例——结构差异不落连续参数））栾树自己的现实事实
 *      重定；下方逐字段标注【家族共性候选】沿用 /【栾树特有】新证据 / 工程设定（无
 *      现实基准不编造依据）。方法恒同纪律（T011.6 任务书）：五级拓扑 L1–L5、叶簇挂
 *      末两级 L4/L5、结构计数类跨槽恒等、rng 无条件消费、LOD 三档同流派生整体复制，
 *      栾树只换数值与算法细节（几何侧差异点归 koelreuteriaGeometry Step 3 交付）。
 * 边界：栾树资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_koelreuteria.asset，Step 3 交付）；
 *      比率字段以 totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、
 *      弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0（含终审 + 主代理补充记档）× 六先例方法基线对照，三栏
 *    落档；改写项逐条映射实现面）──
 *
 * ■ 可继承项（家族方法原样沿用，栾树证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——栾树分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [12]）落在家族五级口径内（夏栎先例同款包含关系）；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown，域扩展节 A 全组 Unknown），家族方法沿用；
 *   3. 冠内通透三规则——栾树外密内疏（域扩展节 B crown_fill_gradient Inferred [12]，
 *      canopy-a 单源）+ 枝干通道（冠下仰观红褐细枝网可见 [12]）+ 局部空腔（空隙
 *      ≈20–30% Inferred [12]——与悬铃木同档）；
 *   4. 枝梢驱动叶簇——家族「簇挂末两级枝梢」映射同向（挂点语言的栾树分化见改写项 1）；
 *   5. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   6. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡 / 附加元素 Low 省略
 *      档间连续记档——platanus 果序先例）；
 *   7. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   8. 尺度锚中龄公园（≈10m 主代理裁定——弱 Inferred 域内插承托 per 终审裁决 7；与
 *      夏栎 ≈8/朴树 ≈8.5/香樟 ≈8.6/榉树 ≈8/银杏 ≈8.2/悬铃木 ≈12 同语境混植的中量级
 *      ——速生树种上探变体入 slot-1 记档）。
 *
 * ■ 按栾树改写项（每条映射实现面）：
 *   1. **复叶卡挂点语言（家族复叶首例核心，Spec §4/域扩展节 B 复叶形态组 Verified
 *      [2][4][6]）**：挂点单位 = **1 枚二回羽状复叶**（总长 45–70cm「叶平展，二回羽状
 *      复叶」FRPS 原句 Verified [2][4]）——**复叶表达路径判定（Step 1 主代理裁定，
 *      三判据）**：①预算——分卡方案（羽片 4–5(–6) 对 × 每羽片 5–7(–9) 枚 ≈ 35–70
 *      小叶/叶 ⇒ 35–70 小叶卡 × 挂点数爆预算（对比整树仅数百挂点即数万小叶卡）；
 *      单卡 1 枚复叶 = 2 tri；②档间连续——单卡 SDF 细节随档简化（Mid/Low 卡数掩码/
 *      壳卡，结构不散架）；③近景读出——SDF 沿卡轴多小叶排布（羽叶长轴沿卡 v 轴 +
 *      小叶包络窗序列，材质层绘制）⇒ **复叶卡 = 1 卡承载整枚二回羽叶**（几何四边形
 *      + 材质 SDF 分工）。**卡宽/长比冻结 0.60**（几何四边形按此比例建、尺寸抖动仅
 *      缩放不改比例——羽片横向展开 ≈ 0.5–0.7 × 复叶总长的双轴结构推算，主代理冻结）；
 *      卡长 = 真复叶 45–70cm × ≈1.4 工程映射（**复叶 SDF 满幅绘制多小叶、无单叶卡
 *      的叶缘余量需求，映射系数低于单叶 ×2 先例口径**——记档）⇒ 卡长 0.63–0.93m /
 *      卡宽 0.38–0.56m（七资产最大叶结构体——真值即六资产最大单叶悬铃木 ×≈2）。
 *      挂点方位：**黄金角互生螺旋继承 platanus**（φ_j = j×137.5° + 抖动——叶互生
 *      [6]「叶互生」属级 Verified 的方位语言）+ **平展取向**（「叶平展」[2] Verified
 *      + 域扩展节 B leaf_orientation_dist「分层摊开非球面随机」——PLANE_LIFT 0.10
 *      低于悬铃木平展 0.12、FORWARD_TILT 0.24）+ **非簇生**（域扩展节 B
 *      leaf_cluster_density「1 枚羽叶/挂点；冠面密度由大羽叶 + 小叶细碎联合产生」
 *      ——每簇 3 候选大卡稀排 + 大簇 + 大间距抑制）；小叶结构（羽片对数/每羽片枚数/
 *      小叶斜卵形/全缘主力相↔细齿变体/近无柄/基部偏斜）全部归材质 SDF 层不建模
 *      （geometry 只建整枚复叶卡四边形）；
 *   2. 树形语言：圆锥（银杏）/圆穹（朴）/广卵（樟）/宽展圆顶（栎）/vase（榉）/
 *      阔卵-圆头（悬铃木）→ **开展圆头-伞形、轮廓不规则微起伏**（Spec §3 冠形重点
 *      问题：fruit-f 青岛仰观 + 园艺文本 spreading/irregular [8][9] 承托 per 终审
 *      裁决 3；form-b 补证单干低分枝开展伞形冠冠幅 ≥ 高）→ 实现：**低挂高段**
 *      （scaffoldAttachMin 0.55 + 主干干高参数域 0.26–0.32——form-b ≈2m 处分骨干枝
 *      的低分枝读向 Inferred）+ **广角开展骨架**（40–56° 对铅垂）+ **ascending→
 *      arching 枝角梯度**（大枝先直立后外弯下倾「Branches are upright but bend down
 *      somewhat as the tree grows」wiki EN Verified [8] + NC「branches may droop」[9]
 *      ——koelreuteriaGeometry SCAFFOLD_ARCH 外弯漂移 + levels.upturn 链低于先例、
 *      L4/L5 微负（枝梢微下垂）——确定性零 rng）+ 领导中庸 0.50（圆头-伞形顶由骨架
 *      链共构）+ 散布方位（螺旋互生散布——骨架枝排列 Unknown [8] few-branched 弱读）；
 *   3. 冠幅比：Spec §3/域扩展节 **0.7–1.0（弱 Inferred**——form-b 补证单干「冠幅 ≥
 *      高」+ NC spreading 园艺 + form-a 野生幼树 0.8–1.0；8–12m 单干样木仍缺记档**）**
 *      ——七资产最宽端带（vs 悬铃木 0.6–0.8 偏窄端）；crownWidthRatio 参数探针定档
 *      （T009.3 口径——外泄系数实测回写，见字段注释）；
 *   4. 干高占比：域扩展节 A trunk_height_ratio **Unknown**（Spec 结构性缺口——终审
 *      后 bark-a 佐证失效回归纯 Unknown；form-b 补证 ≈2m 低分枝单干 Inferred 单源）
 *      ——挂高段 0.55–0.73 + 干高参数域 0.26–0.32（geometry rng 域）工程设定承载，
 *      弱 Inferred 单源方向（低分枝）记档；
 *   5. 骨架数：域扩展节 A scaffold_branch_count Unknown + wiki EN「few branched」[8]
 *      （大枝少而粗弱读）→ **5 骨架枝 + 1 领导枝**（few-branched 读向 + 大卡低数量
 *      预算——拓扑 L1=6 → 枝数 [6,18,54,162,324]、簇位 810（L4 162×1 + L5 324×2）、
 *      皮面 20782，为花果双信号（花卡 + 灯笼串，栾树独有双重附加元素）留组 0 预算
 *      带内余量——见改写项 6 账目）；
 *   6. **夏花秋果双信号（Spec 判定均做——花序/蒴果序形态组 Verified [2][4][5][6]
 *      [8][9][12]；生产口径终版 ④-3/④-4）**：**花 = 顶生大型圆锥花序（30–70cm 级
 *      建模域）金黄-橙黄团块集中冠面上部外缘、冠面覆盖率 10–25%**（「聚伞圆锥花序
 *      大型，顶生」属级 Verified [6] + 花序高出叶幕 [12]）——每花序一对交叉竖卡
 *      （2 卡 × 2 tri billboard 十字，花卡宽/长比 0.65 冻结——主代理接口）+ 卡心
 *      上抬高出叶幕；**果 = 灯笼蒴果序偏冠缘、覆盖率 15–30%、多色并存**（蒴果 4–7
 *      × 3.5–5cm 中值 5.5×4.2、钝圆顶小凸尖、三棱 Verified [2][4]——尺寸锚文献域
 *      per 终审裁决 4）——八面体灯笼 8 tri/果（platanus 果球方法复制）×2 工程映射
 *      真径 8–14cm + **串状挂点**（大型果序轴排布、后转下垂 [12]——垂挂弧链）；
 *      **空间分工**：花带（冠上部外缘）与果带（冠缘中下）按高度带判据不相交——
 *      同点重叠避免、合计冠面非绿信号 ≈25–45% 中庸（裁决 3 生产口径）；**确定性挂点
 *      账目法**（vs platanus 果序 rng roll 先例）：花果承载位 = 保留簇位表上确定性
 *      区域判据 + 位置散列排序 + 固定步长抽选，**零 rng 消费**——组 0 带随槽仅随
 *      保留簇数平滑变化（platanus rng roll 引起的组 0 带状浮动已归族门复核负担，
 *      本例规避记档）；花果入组 0（恰两材质组冻结）、uv 域身份标记花 v∈[5,6]/果
 *      v∈[6,7]（与皮管弧长域（v ≤ ≈2.9）三重隔离——**探针断言**，platanus v∈[2,3]
 *      与皮管碰撞 66 顶点先例教训）、aLeafRand/aBend 随组 0 恒 0（花果刚性——下垂
 *      摆动未表达归缺口候选）；Mid 保留（身份信号）/ Low 省略（远距亚像素，档间
 *      连续记档——platanus 果序先例）；
 *   7. 树皮（主代理补充证据终版，bark-b 双系统一致）：**浅色光滑（灰白-灰褐粉质感）
 *      + 密布皮孔麻点（呼应 FRPS bipinnata「皮孔圆形至椭圆形」「枝具小疣点」Verified
 *      [2] 枝侧描述向干侧推广）+ 局部浅细纵裂 + 无剥落**——七资产第 7 树皮语言
 *      「浅色光滑 + 皮孔麻点 + 局部浅细裂」（vs 朴树平滑-浅裂小斑块：分化点 = 皮孔
 *      麻点密度 + 浅色粉质感）；**斑驳/麻点主体在材质侧**（koelreuteriaMaterials
 *      配方层），几何只管浅浮雕 → 实现：barkRelief 幅度 **0.013**（最浅档——榉
 *      0.015/悬铃木 0.014 光滑端量级参照再收一档，主代理「最浅档」裁定）+ 谐波
 *      {3,5,6}（低频浅斑）+ drift 5 rad/m（局部浅细纵裂的轴向连续性——纵裂语言
 *      取低游走（银杏 2.6 纵脊连续/悬铃木 11 断裂拼贴之间的中低档，光滑基底 + 局部
 *      细裂的复合读向））；
 *   8. 密度语言：**中-疏**（空隙 ≈20–30% Inferred [12] canopy-a 单源——与悬铃木
 *      同档）→ crownShellStart 0.50 + coreDensityFloor 0.08（冠内细枝开网 [12]）
 *      + 空腔 0.50–0.88 + 疏密差异归槽 6/7；
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开（差异轴建议：**冠幅比 0.7–1.0 / 冠形圆头↔
 *      伞形 / 大枝外弯度 / 花果承载**——主代理指定）：slot-1 速生上探窄端（终审
 *      裁决 7「速生属性允许上探 12m 变体」——FRPS「速生树种」[2] Verified 的槽位
 *      化）/ slot-2 老龄开张伞形宽端（spreading with age [8][9] + form-b 冠幅 ≥ 高）
 *      / slot-3 偏冠 / slot-4 低冠（form-b 低分枝相带下缘）/ slot-5 高冠 / slot-6/7
 *      疏密端（空隙 20–30% 带内两端——**花果承载由簇位量表间接承载**：资格簇数随
 *      密度参数增减，确定性步长抽选下花果数随槽平滑变化——家族契约无花果参数位，
 *      连续参数承载的实现口径记档）。**多干变体不进 8 槽**（Spec §3 单干↔多干轴
 *      Verified 现象、频率 Unknown——结构差异不落连续参数，platanus 低位双主枝
 *      同款纪律记档）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_taper_ratio / basal_flare_ratio（域扩展节 A 均 Unknown）——干形锥度与
 *      根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. DBH 典型值 Unknown（终审后干径照片证据失效）——根径 0.24–0.30m 工程设定
 *      （10m 速生中龄个体比例瘦干读向，Step 3 探针校）；
 *   3. scaffold_angle 度数 Unknown（域扩展节 A——「先直立后外弯下倾」定性 Verified
 *      [8][9]）——起角取域中带工程默认（ascending 段起始角 + arching 漂移承载姿态，
 *      记档分级：定性 Verified / 度数工程默认）；
 *   4. branch_length_decay / branch_radius_decay / allometry_exponent——家族量级工程
 *      设定（外弯漂移 + upturn 链为栾树工程语言，非实证数值）；
 *   5. 羽片对数/每羽片小叶枚数/小叶缘相——归材质 SDF 层（几何不建模，改写项 1）；
 *      芽（域扩展节 C Unknown——志书无芽描述）/ 新叶色（Unknown）/ 幼态一回羽状叶
 *      （单源 Unknown 不归纳）——不建模记档；
 *   6. 生长速率数值 Unknown（Spec §2）——10m 锚的龄级推断以主代理裁定为准。
 *
 * 不建模记档（Spec 有事实、工程不表达）：二回羽状复叶内部结构（羽片对数/每羽片
 *      小叶数/小叶斜卵形/全缘↔内弯细齿相轴/近无柄/基部偏斜/叶轴毛——Verified
 *      [2][4][6]，归 koelreuteriaMaterials 复叶 SDF 层）；花瓣 4 + 瓣基橙红斑/微香
 *      （Verified [2][6][8][9]——花卡内部归材质）；蒴果色序绿→黄绿→鲑粉→玫红→褐
 *      与膜质网纹（Verified [2][4][8][9][12]——果色档归材质 u 通道）；花序内聚伞
 *      分枝/果序轴分支（Inferred [1][5][6]——卡/串抽象）；秋色黄（Verified [8][9]
 *      ——季相归材质/风格层）；冬态宿存干果（Verified [12]——季相不进生产）；多干
 *      丛生（现象 Verified [9][12] 频率 Unknown——结构差异不落连续参数记档）；幼态
 *      一回羽状叶（单源 Unknown）；芽（Unknown）；新叶色（Unknown）；小枝疣点/皮孔
 *      圆形至椭圆形（Verified [2][4]——归材质树皮配方）；一年生枝红褐色（Inferred
 *      [12]——归材质）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/** 复叶卡宽/长比冻结值的倒数（宽/长 = 0.60 主代理冻结 ⇒ 长/宽 aspect = 1/0.60 ≈
 *  1.6667——家族 leafAspect 语义 = 卡长/卡宽；leafAspectSpan = 0：尺寸抖动仅缩放
 *  不改比例（SDF 按此比例设计）） */
const LEAF_ASPECT_BIPINNATE = 1 / 0.6;

/**
 * slot-0 标准组合初值（锚点形态）：公园单干中龄个体 ≈10m 量级（主代理裁定——8–12m
 * 弱 Inferred 域收口 9–11 默认 10）、**开展圆头-伞形冠**（低挂高段 + 广角开展 +
 * ascending→arching 外弯 + 散布方位 + 领导中庸）、**家族复叶首例大卡**（整枚二回
 * 羽叶卡 0.38–0.56 宽 × 长/宽 1.6667 恒比例）**互生平展疏排**（每簇 3 候选黄金角
 * 螺旋）、夏花（冠面上部外缘交叉卡）+ 灯笼果串（冠缘八面体链）双信号确定性账目。
 * T009.3 教训沿用：视觉冠底由挂高段 + 横展角 + 外弯漂移 + 领导枝链涌现，不由
 * crownCenterRatio；开展圆头-伞形剪影由骨架侧驱动链（广角 + 外弯 + 低挂高段）
 * 涌现。结构计数类（trunk/levels radial/segs、childPlan、簇位数、每簇叶量、
 * voidCount、scaffoldCount）全槽恒等；叶卡尺寸/长宽比域槽间不动（叶身份）；
 * **复叶卡比例 0.60 结构性恒定**（冻结接口）。
 */
export const KOELREUTERIA_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节：冠幅/树高比 **≈0.7–1.0（弱 Inferred）**——form-b 补证单干
   *  「冠幅 ≥ 高」+ NC「spreading crown, irregular form」Verified [9] + form-a 野生
   *  幼树 0.8–1.0；8–12m 带参照单干样木缺失记档（终审结构性缺口——数值取域宽并降
   *  置信）。**Step 3 探针回推定档（2026-09-21 实测，三轮——花果挂点改确定性零 rng
   *  账目法后 rng 流位移，终测带以第三轮为准）**：初值 0.55 期涌现
   *  w/h = 0.926 越域上沿（外泄 ×1.68——广角骨架 + 外弯漂移 + 低挂高段三放大，开展
   *  伞形读向的骨架侧延伸链水平展宽——vs 悬铃木平展端外泄 ×1.48），骨架侧回调
   *  （角度 46–62°→40–56°、外弯漂移 0.60→0.34、挂高段 0.50→0.55 起）+ 参数终值 0.40
   *  终测涌现 **w/h = 0.877** 落工程域 0.7–1.0 中上带；8 槽带 0.710–0.979（slot-1
   *  速生窄端 0.710 贴下沿 / slot-2 开张伞形端 0.979 贴上沿——**全槽域内、无域外
   *  个体**（二轮 0.68 微出下沿的域外读向被第三轮回调收回，记档）。【冠幅比类 =
   *  家族共性候选沿用；锚值 = 栾树特有
   *  （工程域 + 实测外泄系数回推——探针定档记录，非编造）】 */
  crownWidthRatio: 0.4,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；开展圆头-伞形冠体中心
   *  中带偏低——伞形冠最宽带中下读向的参考系，实际由骨架侧驱动链承载）。 */
  crownCenterRatio: 0.58,
  /** 工程设定（同上；开展冠纵域参考系——轮廓不规则微起伏由 crownTopBias 微负 +
   *  外弯漂移的种子实现差异共构）。 */
  crownHeightRatio: 0.68,
  /** Spec 域扩展节 A branch_orientation / wiki EN「few branched」[8]：**螺旋互生散布**
   *  ——骨架枝排列 Unknown（无轮生/对生口径），散布互生为六实例主流读向沿用。
   *  slot-0 = 0.46（散布端——方位均分步进 + 大抖动 → 互生散布读向）。【散布机制 =
   *  家族共性候选沿用；幅度 = 栾树特有（散布口径 [8] 弱 + 工程默认）】 */
  asymmetry: 0.46,
  /** Spec §3「开展圆头-伞形、轮廓不规则微起伏」（fruit-f + 园艺文本 [8][9] 承托
   *  per 终审裁决 3）——伞形顶略平的密度场高度向微负偏置；几何侧顶圆化由外弯漂移
   *  + 高枝收角承载。【栾树特有定档依据 = Spec §3 冠形重点问题 Inferred+Verified
   *  双源；幅度工程设定】 */
  crownTopBias: -0.05,

  // 骨架
  /** Spec 域扩展节 A scaffold_branch_count Unknown + wiki EN「few branched」[8]（大枝
   *  少而粗弱读）→ slot-0 = **5 骨架枝 + 1 领导枝**（few-branched 读向 + 花果双信号
   *  组 0 预算余量——拓扑 L1=6 → 簇位 810 / 皮面 20782，账目见模块头改写项 6）。
   *  【结构计数类：槽间恒等；取 5 = 工程默认（Unknown 域 + 弱读向带内）】 */
  scaffoldCount: 5,
  /** Spec 域扩展节 A scaffold_angle Unknown（度数）、「先直立后外弯下倾」定性 Verified
   *  [8][9]——**起角**取广角开展域中带（ascending 段起始角）：40–56°（大枝先直立 =
   *  起角低于平展端、后外弯由 SCAFFOLD_ARCH 漂移 + upturn 链承载至开展——终态开展
   *  圆头-伞形）；度数工程默认（定性 Verified / 定量 Unknown 分级记档）。
   *  【栾树特有（定性 Verified [8][9] + 度数工程默认）】 */
  scaffoldAngleMin: 40,
  scaffoldAngleMax: 56,
  /** Spec 域扩展节 A trunk_height_ratio Unknown（结构性缺口——终审后纯 Unknown）+
   *  form-b 补证 ≈2m 低分枝单干（Inferred 单源方向）的挂高段实现：挂点 0.55–0.73
   *  干高段 span 0.18（trunk 参数域 0.26–0.32 × H）——低分枝弱 Inferred 方向的
   *  工程域中带；T009.3：挂高段下缘 + 横展角 + 外弯漂移 + 领导链共同涌现视觉冠底。
   *  **Step 3 探针回推（2026-09-21 终测）**：涌现视觉冠底/实高 **0.193**（8 槽带
   *  0.093–0.229——低冠/高冠槽展开（slot-4 低分枝端 0.093 / slot-1 高干端 0.229）；
   *  form-b 低分枝方向带内）。【栾树特有（Unknown
   *  域 + 单源弱方向 + 探针回推实测）】 */
  scaffoldAttachMin: 0.55,
  scaffoldAttachSpan: 0.18,
  /** 工程设定（branch_radius_decay Unknown、DBH Unknown（终审后照片证据失效）；10m
   *  速生中龄个体比例瘦干读向取 0.56——家族带内，待视觉验收校）。 */
  scaffoldThickness: 0.56,
  /** rank 长度乘子（5 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法
   *  沿用；散布互生骨架的环内势差——偏冠槽加大首枝势差承载）。 */
  scaffoldRankLength: [1.14, 1.04, 0.96, 0.9, 0.85],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.04, 0.97, 0.92, 0.89, 0.86],
  /** Spec 域扩展节 A apical_dominance：**幼-中龄枝直立、随龄外弯下倾**（[8][9]
   *  Verified）+ 花序顶生（属级 [5][6]——季节性顶端结构）——中龄锚定相领导中庸
   *  0.50（圆头-伞形顶由骨架链共构、领导不翻转树顶（T009.3 弱领导翻转警示的安全带
   *  内））。**Step 3 探针记档（2026-09-21）**：10m 级领导链复利外伸 ≈×1.8（实测
   *  领导比 ±0.1 → 涌现树高 ±1.2–1.6m——先例悬铃木 ×1.9 于 12m 级、银杏 ×1.8 于
   *  8m 级），槽间种子实现的涌现高度差由各槽领导比回调定档（见各槽注释，回调记档
   *  同 platanus slot-2/4/7 先例）。【栾树特有定档依据 = Spec apical_dominance
   *  Verified [5][6][8][9] 的中龄过渡位；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.5,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；6 L1 下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝「先上举后下垂」定性 [12] 由
   *  levels.upturn 微负承载——方法恒同，长度比沿用家族量级）。 */
  lengthRatioBase: 0.42,
  lengthRatioSpan: 0.15,
  /** L1 0.62 通体锥度（大枝少而粗的 few-branched 读向 [8]——骨架级通体粗壮）。
   *  工程设定（Spec 无栾树锥度数值）。 */
  endRatio: [0.62, 0.6, 0.6, 0.6, 0.6],

  // 冠内通透（中-疏基调——空隙 20–30%，与悬铃木同档带）
  /** Spec §3 / 域扩展节 B crown_transparency：**中-疏**——空隙 ≈20–30%（canopy-a
   *  冠下仰观覆盖率 70–80% 单源 Inferred [12]）。slot-0 = 1.0 基准（疏密差异归槽
   *  6/7——家族沿用；空隙量级由大卡覆盖 + 大空腔域 + 薄壳带参数承载）。【canopyDensity
   *  类 = 家族共性候选；基调读向 = 栾树特有（中-疏 Inferred 单源 [12]）】 */
  canopyDensity: 1.0,
  /** Spec 域扩展节 B crown_fill_gradient：外密内疏（canopy-a「外层浓密、内部较稀疏、
   *  中心透光」单源 Inferred [12]）。家族沿用；栾树壳带取 0.50（中带——大羽叶平展
   *  层叠的外密读向）。【连续形态参数；值 = 栾树特有】 */
  crownShellStart: 0.5,
  /** 芯层起点与地板值：Spec §3 冠内「中心透光」[12] → 芯层地板 0.08（开网不空透
   *  ——红褐细枝网可见 [12] 的密度语义）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.08,
  /** 规则①（枝干通道：主干大枝进冠不被封死——冠下仰观细枝网可见 [12] 的「透」侧
   *  承载）；数值工程设定（家族量级沿用）。 */
  channelRadius: 0.5,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：中-疏 20–30% 空隙读向的冠内空隙表达之一）。【结构计数类：
   *  槽间恒等】数量工程设定（家族沿用 3——空腔尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域大档（0.50–0.88：中-疏大空隙——空隙 20–30% 的读向表达；vs 悬铃木
   *  0.50–0.85 同档）。值 = 栾树特有；半径域机制 = 家族共性候选。 */
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.88,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；栾树「叶簇」= **末级枝互生
  // 平展疏簇**（大簇 + 每簇 3 候选整枚复叶大卡黄金角互生螺旋稀排 + L5 簇位花果承载
  // 位）= 复叶卡挂点语言）
  /** Spec §4/域扩展节 B leaf_attachment_rule：**大型二回羽叶互生、平展、分层摊开
   *  （非簇生）**（「叶互生」属级 Verified [6] + 「叶平展」种级 Verified [2]）——
   *  叶沿末级枝全长散布。簇位数 L5=2 + L4=1（家族沿用——「末级枝外段 + 枝端」的
   *  疏簇位点，外段下限 0.45 起（互生羽叶沿枝全长散布的映射同 platanus 口径））。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——末级枝叶组挂外段受光区；平展分层摊开的
   *  站位带）。 */
  clusterInnerStartL5: 0.45,
  clusterInnerStartL4: 0.4,
  /** Spec §2/域扩展节 B leaf_size + clump_scale：真复叶总长 45–70cm（FRPS/FOC 双志
   *  Verified [2][4]）× ≈1.4 工程映射（复叶 SDF 满幅绘制多小叶、无单叶卡叶缘余量
   *  需求——映射系数低于单叶 ×2 先例口径记档）→ 卡长 0.63–0.93 / **卡宽 0.38–0.56**
   *  （比例 0.60 冻结）⇒ **疏簇半径 0.24–0.34**（末枝羽叶组 ≈1/8–1/15 冠幅
   *  （clump_scale Inferred [12]）= 0.6–1.2m 布置球半径域的卡心分布球——卡体伸出
   *  球外由大卡本体覆盖）；L4 簇 ×1.2 承接更粗末级枝——家族沿用。【簇半径比类 =
   *  家族共性候选；绝对量级 = 栾树特有（复叶首例大卡语义：簇 = 布置球非密团）】 */
  clusterRadiusMinL5: 0.24,
  clusterRadiusSpanL5: 0.1,
  clusterRadiusScaleL4: 1.2,
  /** 工程设定（家族沿用——短枝梢簇随之缩小的 cap 语义：L5 枝长 ~0.4–0.6m 下 cap
   *  0.24–0.36，簇半径实际由 cap 主导）。 */
  clusterRadiusLengthCap: 0.6,
  /** Spec 域扩展节 B leaf_cluster_density「1 枚羽叶/挂点」+ 疏簇观感由「大羽叶 +
   *  大节间」联合产生——簇级显式剔除的大间距保险：0.66（**高于先例带 0.46–0.62**
   *  ——最大叶结构体的大卡疏排语义：簇心距 ≥ 0.58×(ri+rj) ≈ 0.29–0.40m，簇间大
   *  间隙读向；挂点 rng/复叶卡 rng 无条件消费后丢弃，确定性不破）。【间距机制 =
   *  家族共性候选；值 = 栾树特有（复叶大卡大间距）】 */
  clusterMinSeparation: 0.58,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 3 = **疏簇候选数**（互生羽叶语言的卡尺度合并抽象：真羽叶沿枝互生
   *  节距 ~8–15cm × 卡长 ≈0.63–0.93 ⇒ ≈5–10 节/卡长，每簇 3 候选 = 连续节位合并
   *  + 通透过滤后逐簇存活典型 1–3 枚——「1 枚羽叶/挂点 + 平展分层」[2][6][12] 的
   *  工程映射；vs 悬铃木 5/银杏 8/朴樟 18）；黄金角互生螺旋方位在 3 候选间成立
   *  （φ = 0°/137.5°/275°——互生叶序螺旋语言继承 platanus）。8 槽簇位 810
   *  （L4 162×1 + L5 324×2，6 L1 拓扑）× 3 卡的 High 实测（2026-09-21 终测——花果
   *  挂点确定性零 rng 账目法定稿后的 rng 流）：
   *  保留簇 301–339（簇级剔除 471–509）× 通透存活 → 卡 664–865（slot-6 疏松最低 /
   *  slot-3 偏冠最高）→ High 总面 24134–24680 落家族行 [24000, 40000] 带内（**复叶大卡
   *  低数量语义**：单卡面积 ≈0.36m² 中值 vs 悬铃木 0.10 ×3.6——同覆盖率下卡数天然
   *  低，密度语义由大卡覆盖率承载，参考带 = 栾树自己的实测带记档——同 platanus
   *  先例口径）。【每簇叶量类 = 家族共性候选；绝对值 = 栾树特有（互生稀排合并
   *  抽象 + 实测定档）】 */
  clusterLeavesL5: 3,
  clusterLeavesL4: 3,
  /** 外壳偏置 ∈ (0,1]：疏簇平摊——簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^γ)
   *  取 0.40（**低于先例 0.50–0.66 带**：互生羽叶沿末级枝散布非壳聚团——r̂ ∈ [0.60,
   *  1] 的宽域均匀分布，簇心即枝梢位；「平展分层摊开」[2] 的平摊读向）。【壳偏置
   *  机制 = 家族共性候选；值 = 栾树特有（互生散布平摊读向）】 */
  clusterShellBias: 0.4,
  clusterShellGamma: 0.9,
  /** Spec §2/域扩展节 B leaf_size：真复叶总长 45–70cm（Verified [2][4]）× ≈1.4
   *  工程映射（复叶 SDF 满幅——见 clusterRadius 注释）→ **卡宽 0.38–0.56m**（真
   *  复叶 ×≈1.4——七资产最大叶结构体：真值 45–70cm 即六资产最大单叶悬铃木 15–22cm
   *  ×≈3；先例口径：悬铃木 0.30–0.44/银杏 0.10–0.16/朴 0.07–0.11/樟 0.06–0.095/
   *  榉 0.04–0.06/夏栎 0.08–0.13）。【卡尺寸域类 = 家族共性候选；绝对量级 = 栾树
   *  特有（复叶首例整叶卡）】 */
  leafWidthMin: 0.38,
  leafWidthSpan: 0.18,
  /** **复叶卡宽/长比冻结 0.60（主代理接口冻结）** → 长/宽 aspect = 1/0.60 ≈ 1.6667
   *  恒定、span = 0（尺寸抖动仅缩放不改比例——羽叶长轴沿卡 v 轴，SDF 按此比例设计，
   *  材质-几何冻结接口）；真复叶横向羽片展开 ≈ 0.5–0.7 × 总长的双轴结构推算同向。
   *  【长宽比域类 = 家族共性候选；恒值 = 栾树特有（冻结接口——七实例首个恒比例
   *  卡）】 */
  leafAspectMin: LEAF_ASPECT_BIPINNATE,
  leafAspectSpan: 0,

  // 树皮近景微起伏（栾树特有分化：**浅色光滑 + 皮孔麻点 + 局部浅细纵裂浅浮雕**——
  // 主代理补充证据终版（bark-b 双系统一致：浅灰白-灰褐光滑粉质感 + 密布深色皮孔点
  //  1–3mm + 局部浅细纵裂 + 无剥落）；vs 夏栎脊沟 0.033/朴树浅斑 0.016/香樟纵裂
  //  0.036/银杏浅-中纵裂 0.030/榉树光滑剥落 0.015/悬铃木光滑剥落 0.014 七分化中
  //  **最浅档**（0.013——主代理「最浅档」裁定：榉/悬光滑端 0.014–0.015 量级参照再
  //  收一档）——**皮孔麻点/浅色粉质感主体在材质侧**（koelreuteriaMaterials 配方层），
  //  geometry 只管浅浮雕）
  /** 浅色光滑浅浮雕锚定 0.013（主代理终版「最浅档」——光滑基底近于平、局部浅细裂
   *  微起伏；bark-b「more or less smooth」双系统一致 + 皮孔文献呼应 [2]）。主干基环
   *  半径 ≈0.24–0.30m（Step 3 域）→ 峰幅度 ≈3.1–3.9mm、同环极差实测 ≈6.3mm（环极差/
   *  均径 1.7–2.2%）——近景浅细
   *  裂微起伏可辨、中景剪影光滑。亚视觉地板联动：0.013 下起径 <0.115m 的管平滑发射
   *  ——L1 骨架起径 0.09–0.11 亦在地板下：**仅主干有效起伏**、全部分枝管光滑（光滑
   *  干读向 [12] form-b 远观 + 皮孔麻点归材质层的复合读向）。
   *  【幅度 ∝ 半径量级挂钩 = 家族共性候选沿用；绝对值 = 栾树特有（最浅档）】槽间
   *  恒等（barkRelief 非形态差异维度——slot-0 定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.013,
    /** 低频浅斑谐波：k∈{3,5,6}——k3 主导（周向低频浅起伏——光滑基底的微起伏层；
   *  ≤ 主干 radial 14 的奈奎斯特域 7 留 1 档边际——家族同款边际纪律；皮孔麻点
   *  （1–3mm 高频）为材质层语言不入几何谐波）。【谐波语言 = 栾树特有定档（光滑
   *  浅浮雕——低频浅斑）】 */
    harmonics: [3, 5, 6],
    /** 轴向游走基率 5 rad/m（**中低档连续**——轴向去相关 ≈2π/5 ≈ 1.26m：局部浅细
   *  纵裂的轴向连续性读向（纵裂沿轴伸展 = 低游走），vs 银杏 2.6 纵脊连续 / 悬铃木
   *  11 断裂拼贴 / 夏栎 0.85 缓游走——光滑基底 + 局部细裂复合的中间低档）。【游走
   *  机制 = 家族共性候选；速率值 = 栾树特有（光滑 + 细裂复合中低档）】 */
    drift: 5,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown——flare 1.18 轻度沿家族常量，Step 3 微调归几何））。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 branching_levels
   *  Inferred [12]）的家族五级方法沿用，级数槽间不动。姿态分级为栾树 ascending→
   *  arching 语言：upturn [0.06,0.05,0.03,0.00,-0.03]（**七实例首个含负链**——大枝
   *  先直立后外弯下倾 [8][9]：L1–L3 近零（外弯漂移主导开展）/ L4 平伸 / **L5 微负
   *  （枝梢微下垂**——「branches may droop」[9] + 果序后转下垂 [12] 的末级姿态；
   *  负 upturn 的下沉链 + SCAFFOLD_ARCH 外弯 = ascending→arching 复合）；wander
   *  骨架级 0.08 略游走 + 末级乱幅 0.35 家族量级（冠内细枝网 [12]）；分级单调性
   *  保持。各级数值工程设定（方向 Spec Verified [8][9]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.12 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.1 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.07 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.03 },
    { radial: 4, segs: 3, wander: 0.35, upturn: -0.02 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑——L3→L4 三挂点承载 5 骨架下的簇位量 810）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3 语法复制）：**速生上探窄端**——终审裁决 7「速生属性允许
 * 上探 12m 变体」（FRPS「速生树种」[2] Verified）+ 冠形幅度窄端的槽位化（同带混植
 * 的年轻/速生相个体）。组合：冠幅比降（0.44——**Step 3 探针终测（2026-09-21）**：
 * 涌现 0.710 贴工程域 0.7–1.0 下沿——速生窄冠（二轮曾 0.68 微出下沿，第三轮骨架/
 * 冠幅参数回调后收回域内，记档见 slot-0 crownWidthRatio 注释）；同 seed 展开/挺拔
 * 叶幕宽度比实测 1.29、规范种子宽比 9.89/8.13 ≈ 1.22——槽身份可辨）+ 冠高比升（0.78 速生纵域长）+ 横展角收窄
 * 上举（34–46°——ascending 段强化）+ 挂高段上移收窄（0.64–0.74 干高段 span 0.10）
 * + 领导枝偏强（0.54——速生 excurrent 端；终测涌现树高 11.44 为 8 槽最高——10m 锚
 * 域 9–11 之上、12m 上探域内的速生变体读向）
 * + crownTopBias 转正（0.08 速生顶密）+ upturn 链 ×1.4（直立相——L5 仍微负保枝梢
 * 下垂语言）。外弯漂移由 geometry 常数承载槽间恒等（结构语言），冠形差由角域/挂高/
 * 领导链承载。upturn 分级结构不动（同种语言——速生窄冠而非柱冠）。
 */
const KOELREUTERIA_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...KOELREUTERIA_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  crownCenterRatio: 0.62,
  crownHeightRatio: 0.78,
  crownTopBias: 0.08,
  scaffoldAngleMin: 34,
  scaffoldAngleMax: 46,
  scaffoldAttachMin: 0.64,
  scaffoldAttachSpan: 0.1,
  scaffoldRankLength: [1.1, 1.02, 0.96, 0.91, 0.87],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.9, 0.88],
  leaderLengthRatio: 0.54,
  levels: [
    { radial: 8, segs: 9, wander: 0.06, upturn: 0.1 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.08 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.06 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.02 },
    { radial: 4, segs: 3, wander: 0.27, upturn: -0.02 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：**老龄开张伞形宽端**——开张伞形读向（form-b
 * 单干低分枝开展伞形冠冠幅 ≥ 高 Inferred + NC「spreading crown, irregular」[9] +
 * 花果相「开展圆头-伞形」[12]——Spec §6 冠形幅度宽端；中龄带内的开张个体）。组合：
 * 冠幅比升（0.50——**Step 3 探针终测（2026-09-21）**：涌现 0.979 贴工程域
 * 0.7–1.0 上沿（外泄 ×1.96——广角 + 外弯 + 低挂高段全开的宽端外泄；开张伞形
 * 「冠幅 ≥ 高」form-b 域内读向）+ 冠高比降（0.58 扁伞端）+ 冠心降（0.54——冠最宽
 * 带下压）+ 横展角大（52–66° 开张端——工程域内宽端外推）+ 挂高段下移放宽
 * （0.42 起 span 0.24——低分枝开张）+ **领导枝 0.50**（终测涌现树高
 * 10.10 落锚域中带——零 rng 账目法定稿后本槽种子实现无需回调，二轮「0.56 回调」
 * 记档作废（10m 级领导链复利外伸 ≈×1.8 的种子实现差异，见 slot-0
 * leaderLengthRatio 探针记档）——开张语义由横展角/挂高段/
 * 冠形参数承载，记档）+ 首枝 rank 主导强（×1.28）+ crownTopBias 负（−0.12 顶部
 * 平展伞形）。
 */
const KOELREUTERIA_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...KOELREUTERIA_SLOT0_PROFILE,
  crownWidthRatio: 0.5,
  crownCenterRatio: 0.54,
  crownHeightRatio: 0.58,
  crownTopBias: -0.12,
  scaffoldAngleMin: 52,
  scaffoldAngleMax: 66,
  scaffoldAttachMin: 0.42,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.28, 1.05, 0.95, 0.87, 0.81],
  scaffoldRankRadius: [1.06, 0.97, 0.91, 0.87, 0.84],
  leaderLengthRatio: 0.5,
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：
 * 散布互生骨架的方位强弱分化（骨架排列 Unknown [8]——散布口径使偏侧势差更自由）
 * + 冠形个体开张度幅度（Spec §6）——方向采信；幅度工程设定）。组合：asymmetry 升
 * （0.52——散布骨架的方位大抖动；偏侧相干性由 rank 主导承载）+ scaffoldRankLength
 * 首枝 ×1.62 / 弱势 ×0.72（一侧枝展压倒性——首枝质量占比 0.34，配 4 弱枝近均分 →
 * 质心稳定指向首枝方位；榉 ×1.50/悬铃木 ×1.62/银杏 ×1.70 同构量级带）+
 * scaffoldRankRadius 同向（×1.10）+ 冠幅比 0.42 容纳域（**Step 3 探针终测
 * （2026-09-21）**：涌现 0.889 带内——偏侧枝展的质心偏移读数见下）+ 横展角域
 * 微扩（44–60°）+ 挂高段贴标准。其余维度贴标准（偏冠 = 方位维差异）。**Step 3
 * 探针终测**：6 种子面板质心均值比 1.673（散布骨架偏冠读向——强于悬铃木 1.208，
 * 同榉树 1.51 量级带）；规范种子绝对偏移 0.77m（slot-0 规范种子质心 0.48m——
 * 绝对读数为主口径，比 1.60）。
 */
const KOELREUTERIA_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...KOELREUTERIA_SLOT0_PROFILE,
  crownWidthRatio: 0.42,
  crownCenterRatio: 0.58,
  asymmetry: 0.52,
  scaffoldAngleMin: 44,
  scaffoldAngleMax: 60,
  scaffoldAttachMin: 0.6,
  scaffoldAttachSpan: 0.16,
  scaffoldRankLength: [1.78, 1.02, 0.9, 0.82, 0.66],
  scaffoldRankRadius: [1.12, 0.96, 0.9, 0.86, 0.8],
  leaderLengthRatio: 0.5,
};

/**
 * slot-4 低冠组合（009.3 语法复制）：低分枝点开张个体——form-b「≈2m 处分骨干枝」
 * （Inferred 单源）的低冠极端读向 + 干高 Unknown 域下段端。组合：挂高段下移放宽
 * （attachMin 0.42 + span 0.24——低分枝 + 挂高段松散）+ 冠心降（0.52）+
 * crownTopBias 负（−0.10 底密）+ 横展角大（50–64° 低枝开张）+ 姿态下压（levels
 * upturn ×0.6——开展弱化端、冠缘摊平；L5 微负保下垂；分级单调性保持）+ 簇半径
 * 微升（0.26–0.36 低开张大簇）+ **领导枝回调 0.42**（初值 0.48 实测涌现树高 11.38
 * 越锚域上沿——本槽种子的领导链复利外伸实现（10m 级链噪声，见 slot-0
 * leaderLengthRatio 探针记档），零 rng 账目法定稿后终测 10.02 落锚域中带；低冠槽
 * 领导弱化与低分枝
 * 读向同向，记档同 platanus slot-4 0.48→0.40 先例）+ 冠幅比 0.44（**Step 3 探针
 * 终测（2026-09-21）**：涌现 0.835 带内）。**涌现视觉冠底 0.093**（form-b 低
 * 分枝方向带外推——低枝外弯使叶幕自挂点下方展开；高冠槽冠底差同 seed 终测 1.52m）。
 */
const KOELREUTERIA_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...KOELREUTERIA_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  crownCenterRatio: 0.52,
  crownHeightRatio: 0.68,
  asymmetry: 0.46,
  crownTopBias: -0.1,
  scaffoldAngleMin: 50,
  scaffoldAngleMax: 64,
  scaffoldAttachMin: 0.42,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.18, 1.03, 0.96, 0.9, 0.85],
  scaffoldRankRadius: [1.03, 0.96, 0.92, 0.89, 0.87],
  leaderLengthRatio: 0.42,
  clusterRadiusMinL5: 0.26,
  clusterRadiusSpanL5: 0.1,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.04 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.03 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.02 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.0 },
    { radial: 4, segs: 3, wander: 0.35, upturn: -0.04 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制）：高分枝清干个体——干高 Unknown 域上段端（公园
 * 清干修剪语境的自然变体）。组合：挂高段上移收窄（attachMin 0.72 + span 0.08——
 * 高挂点 + 挂高段集中）+ 冠心升（0.64）+ crownTopBias 转正（0.06 顶密）+ 领导枝
 * 0.44（**Step 3 探针定档**：初值 0.54 实测涌现 11.52 越锚域上沿（10m 级链复利
 * 外伸的种子实现差异，见 slot-0 leaderLengthRatio 探针记档），零 rng 账目法定稿后
 * 终测 10.22 落锚域
 * 中带——高冠槽树高读向偏高与身份同向）+ 横展角收（36–50°）+ 姿态上举（levels
 * upturn ×1.4；L5 平伸——分级单调性保持）+ 冠高比降（0.62 高挂点纵域收窄）+
 * 冠幅比 0.42（**Step 3 探针终测（2026-09-21）**：涌现 0.817 带内）+
 * asymmetry 降（0.40）。**涌现视觉冠底 0.223**（高挂点变体，槽维度展开记档）。
 */
const KOELREUTERIA_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...KOELREUTERIA_SLOT0_PROFILE,
  crownWidthRatio: 0.42,
  crownCenterRatio: 0.64,
  crownHeightRatio: 0.62,
  asymmetry: 0.4,
  crownTopBias: 0.06,
  scaffoldAngleMin: 36,
  scaffoldAngleMax: 50,
  scaffoldAttachMin: 0.72,
  scaffoldAttachSpan: 0.08,
  scaffoldRankLength: [1.1, 1.03, 0.97, 0.92, 0.88],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89],
  leaderLengthRatio: 0.44,
  levels: [
    { radial: 8, segs: 9, wander: 0.06, upturn: 0.09 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.07 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.05 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.0 },
    { radial: 4, segs: 3, wander: 0.27, upturn: -0.02 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透疏端——canopy-a 型空隙 20–30% 带疏端
 * （Spec §3 crown_transparency Inferred [12] 单源——冠下仰观大空隙 + 中心透光读向；
 * **花果承载轴的疏端**——资格簇数随密度参数收缩，花果数随槽平滑减少（确定性步长
 * 抽选的间接承载，家族契约无花果参数位记档））。组合：canopyDensity 0.80（**Step 3
 * 探针终测（2026-09-21）**：Mid 总面 6338 贴家族行下沿 6000 余量（复叶大卡
 * Mid 掩码 3 选 1 下叶面基数小——低密度端保留下沿余量锁定）；疏密对比维持（同 seed
 * 卡数比 slot-7 终测 0.69、规范种子 664/847 ≈ 0.78））+ crownShellStart ↑（0.56
 * 壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓（0.05——中心透光 [12]
 * 的疏端）+ 空腔半径域 ↑（0.56–1.00 大空隙）+ clusterMinSeparation ↑（0.62 疏簇
 * 更散）+ clusterShellBias ↓（0.34 散布更宽）+ 领导枝弱（0.40——多枝共构开张端，
 * 涌现树高 9.93 落锚域）+ 冠幅比 0.44（涌现 0.847 带内）。
 */
const KOELREUTERIA_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...KOELREUTERIA_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  canopyDensity: 0.8,
  crownShellStart: 0.56,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.05,
  voidRadiusMin: 0.56,
  voidRadiusMax: 1.0,
  clusterMinSeparation: 0.62,
  clusterShellBias: 0.34,
  leaderLengthRatio: 0.4,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密团冠端——空隙 20–30% 带内密端（Spec §3
 * Inferred [12]——覆盖率 70–80% 密侧 + 中龄生长季满冠个体；**花果承载轴的密端**——
 * 资格簇数随密度参数扩张，花果数随槽平滑增多（间接承载记档同 slot-6））。组合：
 * canopyDensity 0.92（**Step 3 探针终测（2026-09-21 实测 High 24448**——簇 3 候选
 * 高保留 847 卡 + 花序 45 点 + 灯笼串 42 点 224 果落带内中段；先例同款预算校准
 * 流程：朴 0.93/樟 0.94/榉 0.92/银杏 0.92/悬铃木 slot-7 0.92 定档）+ crownShellStart
 * ↓（0.44 满密壳带更厚）+ crownCoreStart ↑（0.16）+ coreDensityFloor ↑（0.11
 * 团冠感）+ 空腔半径域 ↓（0.38–0.64）+ clusterMinSeparation ↓（0.50 簇更密）+
 * clusterShellBias ↑（0.46 簇更实）+ 冠幅/冠高比 0.43 / 0.72（团冠体量，涌现
 * 0.854——密簇端叶幕外扩读向）+ **领导枝回调 0.46**（初值 0.50 实测涌现 11.02 越锚
 * 域上沿（10m 级链噪声，见 slot-0 leaderLengthRatio 探针记档），零 rng 账目法定稿
 * 后终测 9.82 落锚域，记档）。
 */
const KOELREUTERIA_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...KOELREUTERIA_SLOT0_PROFILE,
  crownWidthRatio: 0.43,
  crownHeightRatio: 0.72,
  canopyDensity: 0.92,
  crownShellStart: 0.44,
  crownCoreStart: 0.16,
  coreDensityFloor: 0.11,
  voidRadiusMin: 0.38,
  voidRadiusMax: 0.64,
  clusterMinSeparation: 0.5,
  clusterShellBias: 0.46,
  leaderLengthRatio: 0.46,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；栾树沿
 * Spec §6 幅度轴展开：速生上探窄端（slot-1，终审裁决 7 变体域）/ 老龄开张伞形宽端
 * （slot-2，冠幅比 0.7–1.0 上段）/ 偏冠端（slot-3）/ 干高端（slot-4/5——form-b 低
 * 分枝方向 Unknown 域两侧）/ 疏密端（slot-6/7——空隙 20–30% 带两端 + 花果承载轴
 * 间接承载））。slot-1…7 以 slot-0 锚点为底的差量展开定义——**结构计数类字段
 * （trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）
 * 与叶卡尺寸/长宽比域由展开继承逐位恒等**（皮面数恒等 20782 与 rng 消费次数恒等的
 * 结构性保证；**花果挂点 = 确定性账目零 rng**（koelreuteriaGeometry 常数与判据）——
 * 槽间恒等无消费口径问题）；barkRelief 槽间恒等（spread 继承）。morphSeed 路由见
 * assets/asset_tree_koelreuteria.asset（Step 3 交付）。
 */
export const KOELREUTERIA_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  KOELREUTERIA_SLOT0_PROFILE,
  KOELREUTERIA_SLOT1_PROFILE,
  KOELREUTERIA_SLOT2_PROFILE,
  KOELREUTERIA_SLOT3_PROFILE,
  KOELREUTERIA_SLOT4_PROFILE,
  KOELREUTERIA_SLOT5_PROFILE,
  KOELREUTERIA_SLOT6_PROFILE,
  KOELREUTERIA_SLOT7_PROFILE,
];
