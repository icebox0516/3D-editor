/**
 * runtime/procedural/tree/sophora/sophoraShapeProfile —— 国槐 shapeProfile 数值面
 * （T011.9 Step 2，阔叶家族契约第十实例——方法复制自夏栎第一实例经朴树（T011.1）/
 * 香樟（T011.2）/榉树（T011.3）/银杏（T011.4）/悬铃木（T011.5）/栾树（T011.6 复叶
 * 首例）/乌桕（T011.7）/重阳木（T011.8 复叶第二型）九次验证的通路：
 * ../bischofia/bischofiaShapeProfile 同构——最新方法复制模板）。
 *
 * 职责：国槐（Styphnolobium japonicum (L.) Schott 现用名口径〔FRPS 40:92 与 FOC
 *      Vol.10 均采 Sophora japonica 传统口径、FOC 属级将 Styphnolobium 整属列异名——
 *      同种实体仅属级归置之别，终审裁决 1〕，豆科落叶乔木——**长江流域城市公园夏绿
 *      落叶单干中龄个体 ≈10m**（树高锚主代理裁定——Spec §2 中龄域 8–12m Inferred
 *      收口默认 10m，终审裁决 2））、**一回奇数羽状复叶（家族复叶第三型——一回奇数
 *      羽状轴系窗列）+ 开展宽圆头冠（族内最开展档 0.9–1.2）+ 主枝低位放射 + 串珠状
 *      肉质荚果（夏末盛挂身份信号——做，终审裁决 4）+ 灰褐深纵裂厚脊树皮（第 10 语言，
 *      裁决 6）**语言）枝干/冠层结构的形态参数**数值面**——类型契约 = 阔叶家族契约
 *      ../broadleaf/broadleafShapeProfile（BroadleafShapeProfile，零修改第十实例化；
 *      字段语义、【阔叶共性候选】标注、T009.3 消费语义与槽间恒等纪律见家族文件）。
 *      **九先例的数值是证据不是家族真理**，本文件全部数值依据
 *      docs/research/sophora-reference.md（Spec Version 1.0——生产一律以文末「终审
 *      记档」④ 终审裁决十项为准：花不做裁决 3、荚果做裁决 4、荚果主域 2.5–8cm/珠径
 *      ≈1cm/3–10 珠/缢缩可见裁决 5、树皮第 10 语言裁决 6、冠幅比 0.9–1.2 维持裁决 7、
 *      zigzag 弱表达裁决 9）国槐自己的现实事实重定；下方逐字段标注【家族共性候选】
 *      沿用 /【国槐特有】新证据 / 工程设定（无现实基准不编造依据）。方法恒同纪律
 *      （T011.9 任务书）：五级拓扑 L1–L5、叶簇挂末两级 L4/L5、结构计数类跨槽恒等、
 *      rng 无条件消费、LOD 三档同流派生整体复制，国槐只换数值与算法细节（几何侧
 *      差异点归 sophoraGeometry Step 3 交付）。
 * 边界：国槐资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_sophora.asset）；比率字段以
 *      totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0（含终审记档）× 九先例方法基线对照，主代理 Step 1
 *    判定为执行依据：一回奇数羽状复叶沿 011.6 复叶卡路径（1 卡整枚一回羽叶 + 窗列
 *    单级化）+ 荚果沿 011.6 灯笼八面体串先例；三栏落档）──
 *
 * ■ 可继承项（家族方法原样沿用，国槐证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——国槐分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [6] twig-a 冬态细枝密网）落在家族五级口径内；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown，域扩展节 A 全组 Unknown），家族方法沿用；
 *   3. 冠内通透三规则——国槐**致密相**（空隙 ≈10–20% Inferred [6] form-a「树冠浓密」
 *      单源 +「冠大荫浓」园艺通说 [1]）取家族致密带参数（壳带厚 + 芯层地板高 +
 *      空腔少而小）；
 *   4. 枝梢驱动叶簇——家族「簇挂末两级枝梢」映射同向（挂点语言的国槐分化见改写项 1）；
 *   5. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   6. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡 / 附加元素 Low 省略
 *      档间连续记档——triadica/koelreuteria 果处理先例）；
 *   7. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   8. 尺度锚中龄公园 ≈10m（与栾树/重阳木同量级；速生上端不采——国槐生长速率
 *      Medium [4] 无速生上探槽，变体轴走培训直干相（NC 双相栽培 Verified [4]）记档）。
 *
 * ■ 按国槐改写项（每条映射实现面）：
 *   1. **一回奇数羽状复叶卡挂点语言（家族复叶第三型核心，Spec §4/域扩展节 B 复叶
 *      形态组 Verified [1][2][3][6]；主代理 Step 1 判定 = 1 卡承载整枚一回奇数羽叶
 *      （1 卡 2 tri、档间连续、近景读出（SDF 沿叶轴窗列）三判据沿 011.6 复叶卡路径
 *      ——**窗列单级化**（vs 栾树二回两级窗列：一回羽叶只有一级小叶窗列 + 顶生小叶
 *      单独窗位（「奇数」来源）+ 裸轴基段（bare 门控交材质侧减法式实现，几何 uv 标准
 *      0–1 四边形域不变）；小叶沿叶轴**对生/近对生窗列**（FRPS「小叶4-7对，对生或
 *      近互生」Verified [1]——vs 栾树小叶互生侧偏的相位对生化）全部归材质 SDF 层）**：
 *      挂点单位 = 1 枚 15–25cm 一回羽叶（「羽状复叶长达25厘米」FRPS Verified [1][2]）
 *      × ≈1.4 工程映射（011.6/011.8 复叶映射系数沿用——复叶 SDF 满幅绘制多小叶、
 *      无单叶卡叶缘余量需求）→ **卡长 0.21–0.35m / 卡宽 0.07–0.12m**（**卡宽/长比
 *      冻结 0.34**（材质冻结接口——一回羽叶横向展开 ≈ 小叶长 2× ≈ 0.3–0.4 × 复叶
 *      总长的窄长双轴结构推算，主代理冻结）；aspect = 1/0.34 ≈ 2.9412 恒定、span 0
 *      ——尺寸抖动仅缩放不改比例）；卡 v 轴 = 复叶基部（裸轴段）0 → 顶生小叶尖 1、
 *      u = 0.5 叶轴中轴（标准 0–1 四边形域的自然中轴——材质 SDF 窗列按此表达）。
 *      挂点方位：**黄金角互生螺旋**（φ_j = j×137.5° + 抖动——复叶在枝上互生（leaf-c
 *      照片 Inferred [6] + FOC 属级语境 [3]），语言继承 platanus）+ **平展取向**
 *      （PLANE_LIFT 0.11——羽叶平展层叠（域扩展节 B leaf_orientation_dist Inferred
 *      [6] form-a「叶片细碎均匀铺展」））+ 略前倾 + 弱抖动；**每簇 10 候选**（互生
 *      复叶节位合并抽象——15–25cm 羽叶细碎层叠的致密冠面工程映射，vs 栾树大卡 3 /
 *      重阳木中卡 8 的小卡高数量语义）；小簇（0.15–0.22）+ 中间距抑制；
 *   2. 树形语言：**开展宽圆头 + 主枝低位放射 + 弱领导枝**（Spec §3 冠形重点问题：
 *      NC「Rounded, Spreading」habit + branch low [4] Verified + form-a「主枝低位放射」
 *      〔终审不承重但方向记档〕+ twig-a「粗大主枝辐射开展」双问 [6]；终审裁决 7 族内
 *      最开展档）→ 实现：**两段 scaffold 角带**（011.8 SCAFFOLD_BAND 方法复制——
 *      挂高段内归一位置分带：下带（<0.45）角域 +15° → 近水平 69–87°（**主枝低位
 *      放射横展**——NC open-grown 低位分枝 [4] + form-b 老树大枝水平-下垂 [6] 的
 *      开展读向）/ 上带（>0.55）−15° → 斜上 39–57°（宽圆头顶闭合），0.45–0.55 线性
 *      过渡——profile 角域存两带几何平均中带 54–72；确定性零 rng）+ **挂高段低**
 *      （attachMin 0.52——族内低档：vs 栾 0.55/重阳 0.62）+ **干向长度分级**
 *      （×1.10→×0.74 低枝长高枝短——低位长枝放射放张）+ **领导枝弱-中庸 0.48**
 *      （apical_dominance 中庸-失去领导 [4][6]——圆头顶由上带骨架链共构，族内低带；
 *      **Step 3 探针回调**：初值 0.42 涌现树高偏锚域下沿，回调记档见字段注释）
 *      + 散布方位（螺旋互生散布——骨架枝排列 Unknown [4][6]）+ **末级枝 zigzag
 *      之字形弱表达**（twig-a 双问一致 [6]——sophoraGeometry 细级确定性交替偏置，
 *      零 rng；夏绿相叶幕覆盖下不显著、冬态不建模，终审裁决 9 记档）；
 *   3. 冠幅比：Spec §3/终审裁决 7 **0.9–1.2（族内最开展档——NC 高宽同域 [4] 等宽
 *      读向 +「冠大荫浓」通说 [1] 的几何落点）**；8 槽 w/h 涌现落 0.85–1.2 带读向
 *      （crownWidthRatio 参数探针定档——T009.3 口径外泄系数实测回写，见字段注释）；
 *   4. 干高占比：域扩展节 A trunk_height_ratio **两相并存**（开放生长低分枝 ↔ 培训
 *      高干，NC 原句 Verified [4]）——公园语境净干 2–3m 级建议 Inferred → 干高参数
 *      域 0.24–0.32 + 挂高段 0.52–0.74 承载（低位放射方向的带内映射）；两相变体走
 *      slot-1（培训直干高干相）/slot-2（开放生长低分枝开张相）槽位化记档；
 *   5. 骨架数：域扩展节 A scaffold_branch_count Unknown（form-a 弱读 4–6 级不承重
 *      [6]）+ 低位放射多枝开展读向 → **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 枝数
 *      [7,21,63,189,378]、簇位 945（L4 189×1 + L5 378×2）、皮面 24178——10m 开展
 *      宽冠的小卡高数量 + 荚果串组 0 预算留带内余量，账目见 clusterLeaves 注释；
 *      两段角 6 枝 = 下带 3 枝近水平放射 + 上带 3 枝斜上圆头的对称分配）；
 *   6. **荚果序（Spec 判定做——终审裁决 4：串珠状 moniliform 九资产独有 + 可见窗口
 *      8 月至冬挂 + 9–10 月盛挂期属相内）**：**念珠串沿末级枝梢下垂挂**（fruit-a
 *      「念珠串自枝下垂挂」[6] + NC 宿存冬挂 [4]）——**零 rng 确定性挂点账目法**
 *      （011.6 灯笼串/011.7 绿闭果先例：保留 L5 簇位冠外带判据 + 位置散列排序 +
 *      固定步长抽选——账目恒等可断言）；**主域 2.5–8cm（裁决 5：志书 2.5–5「或稍长」
 *      + fruit-c 实测 8–10cm 上段）、珠径 ≈1cm（径约10毫米 FRPS Verified [1]）、
 *      每串 3–10 珠（fruit-a 每串 3–10 节 [6]——志书种子 1–6 粒 [1] 为珠数下段文献
 *      域）、珠间缢缩可见（照片裁定，裁决 5）**；几何 = 八面体珠 8 tri/珠（011.6
 *      灯笼方法复制）× 2 家族工程映射；**uv 果域标记 v∈[4,5]**（triadica 果域先例
 *      ——材质按域识别；无花资产 → v∈[5,7] 域空）。花不做（裁决 3——乳白低对比 +
 *      窗口短 + 身份五信号已足：冠形+羽叶+串珠果+绿枝+树皮）；Low 档荚果串省略
 *      （triadica/koelreuteria Low 果省略先例——远距亚像素，档间连续记档）；
 *   7. 树皮（第 10 语言，终审裁决 6）：**灰褐-深灰褐深纵裂厚脊沟（脊厚沟深板状
 *      粗犷）+ 纵为主局部交叉网状次级层 + 散在暗色瘤状突起（老干身份点，九资产独有
 *      维度）+ 愈合疤弱表达；沟底红褐降级不做**——几何只管深纵裂厚脊浮雕 →
 *      amplitudeRatio **0.032**（中-深偏高档——脊厚沟深的板状粗犷读向 [4][6]；vs 樟
 *      0.036/夏栎 0.033/重阳 0.028/乌桕 0.027）+ 谐波 **{3,4,6}**（厚脊低谐波 + 6
 *      次局部交叉网状的次级层语言）+ drift **5.5 rad/m 中档游走**（「纵为主局部交叉」
 *      ——轴向去相关 ≈2π/5.5 ≈ 1.14m：纵脊长程为主 + 局部交叉去相关，游走弱于
 *      重阳扭转 6.5、强于顺直族 2.6–3.2）+ **细枝光滑**（起伏幅度地板抬档 3.5mm
 *      （011.8 同款）：0.032 下起径 <0.109m 的管平滑发射 → 仅主干有效起伏、全部分枝
 *      管光滑——「纵裂显于粗干」[4][6]；**交叉网状/暗色瘤突/愈合疤/灰褐色调主体在
 *      材质侧**（sophoraMaterials 配方层——并行交付））；
 *   8. 密度语言：**致密**（空隙 ≈10–20% Inferred [6]——「树冠浓密」+「冠大荫浓」
 *      [1]）→ crownShellStart 0.46（厚壳带）+ coreDensityFloor 0.10（芯层不空透）
 *      + 空腔 2 个小域 0.42–0.72 + 疏密差异归槽 6/7；
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开（差异轴：**冠幅比 0.9–1.2 两端（培训直干
 *      窄端 ↔ 开放生长开张宽端——NC 两相栽培 Verified [4] 的槽位化）/ 干高端 /
 *      偏冠 / 疏密端**——主代理指定）：slot-1 培训直干窄端（NC「trained into a tall
 *      specimen with an erect trunk」Verified [4]——行道培训相个体）/ slot-2 开放
 *      生长开张宽端（NC「branch low to the ground」+ 冠幅 ≥ 高读向——0.9–1.2 域上
 *      段）/ slot-3 偏冠 / slot-4/5 干高端（净干 2–3m 域两侧）/ slot-6/7 疏密端
 *      （空隙 10–20% 带两端——**荚果承载由簇位量表间接承载**：资格簇数随密度参数
 *      增减，确定性步长抽选下串数随槽平滑变化——家族契约无果序参数位，连续参数
 *      承载的实现口径记档同 011.6）。**多干古树相（form-b）不进 8 槽**（老树变体端
 *      ——结构差异不落连续参数，家族同款纪律记档）；龙爪槐 f. pendula 垂枝变型记档
 *      不建模（Spec §6 Verified [1]）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_taper_ratio / basal_flare_ratio（域扩展节 A 均 Unknown）——干形锥度与
 *      根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. DBH 典型值 Unknown（照片不可标定——Spec §2 记档）——根径 0.26–0.32m 工程设定
 *      （10m 中龄「干粗」读向 [6] form-a 方向记档不承重，家族带内，Step 3 探针校）；
 *   3. scaffold 角带数值 = 定性 Verified（低位放射/开展 [4][6]）/ 度数工程默认——
 *      分级记档（Unknown 域 + 方向带内）；
 *   4. branch_length_decay / branch_radius_decay / branch_attachment_t /
 *      allometry_exponent——家族量级工程设定（两段角带 + 长度分级 + zigzag 偏置为
 *      工程语言，非实证数值）；
 *   5. 小叶窗列细节（对生/近对生相位、顶生小叶窗位、裸轴基段比例、小叶卵状披针形
 *      三相/渐尖小尖头/基稍偏斜/全缘/两面色差/小托叶/叶柄基膨大藏芽——Verified
 *      [1][2][3]）——归材质 SDF 层（几何不建模）；芽形态（Unknown——藏芽结构
 *      Verified [1][2] 不进建模）；荚果肉质光润质感/色序细档（归材质 u 通道）；
 *   6. 生长速率数值定性 Medium [4]——10m 锚的龄级推断以主代理裁定为准。
 *
 * 不建模记档（Spec 有事实、工程不表达）：一回羽叶内部结构（小叶 4–7 对对生窗列/
 * 顶生小叶/裸轴基段/小叶卵状披针形 2.5–6×1.5–3cm/渐尖小尖头/基宽楔形稍偏斜/全缘/
 * 上面中绿下面灰白两面色差/小托叶钻状/托叶早落/叶柄基膨大藏芽——Verified [1][2][3]，
 * 归 sophoraMaterials 复叶 SDF 层）；**花**（圆锥花序顶生金字塔形 15–30cm/乳白旗瓣
 * 紫脉——Verified [1][2][4][6]，终审裁决 3 不做：色淡低对比 + 窗口短 + 五信号已足）；
 * 荚果肉质光润质感与绿→黄绿→黄褐色序（Verified [1][2][4][6]——色档归材质 u 通道）；
 * 当年生枝绿色 + 皮孔（Verified [1][2] + 终审裁决 8——归材质层近景身份点）；秋色
 * 金黄短暂（NC [4]——季相归材质/风格层）；冬态 zigzag 密网裸枝相（twig-a [6]——
 * 冬态不建模，裁决 9）；多干古树相（form-b [6] 老树变体端）；龙爪槐垂枝变型与种内
 * 变种变型谱（FRPS Verified [1]——记档不建模）；芽（Unknown + 藏芽结构 [1][2]）；
 * 树皮交叉网状次级层/暗色瘤突/愈合疤（裁决 6——归材质层）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/** 一回羽叶卡宽/长比冻结值的倒数（宽/长 = 0.34 主代理冻结（材质冻结接口）⇒ 长/宽
 *  aspect = 1/0.34 ≈ 2.9412——家族 leafAspect 语义 = 卡长/卡宽；leafAspectSpan = 0：
 *  尺寸抖动仅缩放不改比例（SDF 按此比例设计窗列） */
const LEAF_ASPECT_IMPARIPINNATE = 1 / 0.34;

/**
 * slot-0 标准组合初值（锚点形态）：长江流域公园夏绿单干中龄个体 ≈10m 量级（主代理
 * 裁决——8–12m 弱 Inferred 收口默认 10m，终审裁决 2）、**开展宽圆头冠**（两段
 * scaffold 角带（下带近水平 69–87° 主枝低位放射 / 上带斜上 39–57° 圆头闭合——
 * sophoraGeometry SCAFFOLD_BAND 实现）+ 挂高段低 + 干向长度分级 + 领导枝弱 + 散布
 * 方位 + 末级 zigzag 弱表达）、**一回羽叶小卡**（卡宽 0.07–0.12 × 长/宽 2.9412
 * 恒比例冻结 0.34）**互生平展小卡簇**（每簇 10 候选黄金角螺旋）、冠内通透致密带、
 * **念珠荚果串**（保留 L5 簇位冠外带确定性抽选——零 rng 账目，果域 uv v∈[4,5]）、
 * 无花资产（裁决 3）。T009.3 教训沿用：视觉冠底由挂高段 + 两段横展角 + upturn +
 * 领导枝链涌现，不由 crownCenterRatio；开展宽圆头剪影由两段角带 + 长度分级 + 弱
 * 领导的骨架侧驱动链涌现。结构计数类（trunk/levels radial/segs、childPlan、簇位数、
 * 每簇叶量、voidCount、scaffoldCount）全槽恒等；**复叶卡比例 0.34 结构性恒定**
 * （冻结接口）；卡宽域槽间不动（叶身份）。
 */
export const SOPHORA_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节 / 终审裁决 7：冠幅/树高比 **≈0.9–1.2（族内最开展档——NC 高宽
   *  同域 50–75ft both Verified [4] 的等宽读向 +「冠大荫浓」园艺通说 [1]；form-a
   *  照片支撑终审撤销后 NC 单源承托 Inferred 维持——8–12m 带参照单干样木缺失记档）**。
   *  **Step 3 探针回推定档（2026-09-21 实测）**：两段角下带近水平放射的横向伸长放大
   *  外泄（011.8 伞形同款 ×~1.6——两段角 + 长度分级的复合外泄下参数→涌现的换算
   *  系数），参数终值 **0.59** 终测涌现 **w/h = 0.960** 落 Spec 域 0.9–1.2 中带；
   *  8 槽带 **0.886–1.147**（slot-5 高冠窄端 0.886 / slot-1 培训窄端 0.895 微出
   *  0.9 下沿——窄端变体槽读向记档 / slot-2 开放生长宽端 1.147 贴上沿）。【冠幅比
   *  类 = 家族共性候选沿用；锚值 = 国槐特有（工程域 + 实测外泄系数回推——探针
   *  定档记录，非编造）】 */
  crownWidthRatio: 0.59,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；开展宽圆头冠体中心中带
   *  偏低——宽圆头最宽带中下读向的参考系，实际由两段角骨架侧驱动链承载）。 */
  crownCenterRatio: 0.56,
  /** 工程设定（同上；开展宽冠纵域参考系——宽圆头纵域中高带）。 */
  crownHeightRatio: 0.66,
  /** Spec 域扩展节 A branch_orientation Unknown（无轮生/对生口径证据）+ 复叶互生
   *  照片弱单源 Inferred [6] + FOC 属级语境 [3]——**螺旋互生散布**为九实例主流读向
   *  沿用。slot-0 = 0.44（散布端——方位均分步进 + 大抖动 → 互生散布读向）。
   *  【散布机制 = 家族共性候选沿用；幅度 = 国槐特有（散布口径 [6] 弱 + 工程默认）】 */
  asymmetry: 0.44,
  /** Spec §3「开展圆形-宽圆头形」（NC rounded/spreading Verified [4] + twig-a「粗大
   *  主枝辐射开展」[6]）——宽圆头顶缓圆的密度场高度向微负偏置；几何侧顶圆化由上带
   *  收角承载。【国槐特有定档依据 = Spec §3 冠形重点问题 Verified [4]+Inferred [6]；
   *  幅度工程设定】 */
  crownTopBias: -0.04,

  // 骨架
  /** Spec 域扩展节 A scaffold_branch_count Unknown（form-a 弱读 4–6 主枝不承重 [6]）+
   *  低位放射多枝开展读向 [4][6] → slot-0 = **6 骨架枝 + 1 领导枝**（拓扑 L1=7 →
   *  簇位 945 / 皮面 24178——10m 开展宽冠的小卡高数量 + 荚果串组 0 预算余量，账目见
   *  clusterLeaves 注释；两段角 6 枝 = 下带 3 枝近水平放射 + 上带 3 枝斜上圆头的
   *  对称分配）。【结构计数类：槽间恒等；取 6 = 工程默认（Unknown 域 + 低位放射
   *  多枝读向带内）】 */
  scaffoldCount: 6,
  /** Spec 域扩展节 A scaffold_angle Unknown（度数）；定性 = **主枝低位放射、开展-
   *  平展**（NC branch low Verified [4] + form-b 老树大枝水平-下垂 [6] + twig-a 粗大
   *  主枝辐射开展 [6]）——**两段姿**（011.8 SCAFFOLD_BAND 方法复制）：profile 存
   *  **角域中带 54–72°**（两带的几何平均位），挂高段内归一位置 <0.45 → +15°（下带
   *  近水平 69–87°——主枝低位放射横展，>90° 微下垂自然允许（form-b 老树端））/ >0.55
   *  → −15°（上带斜上 39–57°——宽圆头顶闭合），0.45–0.55 过渡——**带位漂移在
   *  sophoraGeometry SCAFFOLD_BAND**（确定性零 rng，槽间角域差异整体平移两带）。
   *  【国槐特有（定性 Verified [4] + 照片双源 Inferred [6]；带位机制 = 011.8 方法
   *  复制；度数工程默认——分级记档）】 */
  scaffoldAngleMin: 54,
  scaffoldAngleMax: 72,
  /** Spec 域扩展节 A trunk_height_ratio 两相并存（NC open-grown 低分枝 ↔ 培训高干
   *  原句 Verified [4]）+ 公园语境净干 2–3m 级建议 Inferred——挂高段实现：挂点
   *  0.52–0.74 干高段 span 0.22（**挂高段低——族内低档：vs 栾 0.55 / 重阳 0.62**，
   *  低位放射读向 [4][6]；trunk 参数域 0.24–0.32 × H × 0.52–0.74 ≈ 离地 1.2–2.4m）
   *  ——两相变体槽位化（slot-1 培训高干相 / slot-2 开放低分枝相）；T009.3：挂高段
   *  下缘 + 两段横展角 + upturn + 领导链共同涌现视觉冠底。【国槐特有（两相 Verified
   *  [4] + 净干数值 Inferred + 低位方向带内映射）】 */
  scaffoldAttachMin: 0.52,
  scaffoldAttachSpan: 0.22,
  /** 工程设定（branch_radius_decay Unknown、DBH Unknown（照片不可标定 [6]）；10m
   *  中龄「干粗」方向读向 [6]（不承重）取 0.56 家族带内，待视觉验收校）。 */
  scaffoldThickness: 0.56,
  /** rank 长度乘子（6 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用；
   *  散布互生骨架的环内势差——偏冠槽加大首枝势差承载）。 */
  scaffoldRankLength: [1.14, 1.05, 0.98, 0.92, 0.88, 0.84],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.04, 0.97, 0.93, 0.9, 0.88, 0.86],
  /** Spec 域扩展节 A apical_dominance：**中庸-失去领导**（开放生长圆冠读向——NC
   *  rounded + branch low [4] + form-b 大枝水平-下垂 [6]）——领导枝 0.48（弱-中庸
   *  低带（vs 栾 slot-0 0.50 中庸 / 重阳 0.48——宽圆头顶由上带骨架链共构、领导不
   *  翻转树顶（T009.3 弱领导翻转警示的安全带内；**Step 3 探针记档（2026-09-21）**：
   *  初值 0.42 实测涌现树高 9.13 偏离 ≈10m 锚——10m 级领导链复利外伸同先例量级
   *  （×~1.8），回调 0.48 + 树高参数域上移后落锚域中带，终测带见 asset 模块头，
   *  回调记档同先例）。【国槐特有定档依据 = Spec apical_dominance Verified [4]+
   *  Inferred [6]；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.48,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；7 L1 下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝 zigzag 之字形 [6] 由 sophora
   *  Geometry 细级确定性交替偏置承载（弱表达——裁决 9），长度比沿用家族量级）。 */
  lengthRatioBase: 0.42,
  lengthRatioSpan: 0.15,
  /** L1 0.62 通体锥度（大枝粗壮开展——低位放射骨架级通体粗壮）。工程设定（Spec 无
   *  国槐锥度数值）。 */
  endRatio: [0.62, 0.6, 0.6, 0.6, 0.6],

  // 冠内通透（致密基调——空隙 ≈10–20%：form-a「树冠浓密」Inferred [6] +「冠大荫浓」[1]）
  /** Spec §3 / 域扩展节 B crown_transparency：**致密**——空隙 ≈10–20%（form-a 单源
   *  Inferred [6] + 园艺通说 [1]）。slot-0 = 0.94（致密带基准——vs 重阳 0.90 中带 /
   *  栾 1.0 中-疏带；疏密差异归槽 6/7；空隙量级由小卡高数量 + 厚壳带 + 小空腔域
   *  参数承载）。【canopyDensity 类 = 家族共性候选；基调读向 = 国槐特有（致密
   *  Inferred 单源 + 通说双源）】 */
  canopyDensity: 0.94,
  /** Spec §3 冠面「细碎均质绿面」（form-a「叶片细碎均匀」[6]）——外密内疏为家族方向
   *  沿用；国槐壳带取 0.46（**厚壳带**——致密相的外密读向，vs 重阳/栾 0.50 中带）。
   *  【连续形态参数；值 = 国槐特有】 */
  crownShellStart: 0.46,
  /** 芯层起点与地板值：致密相 → 芯层地板 0.10（芯层不空透——「浓密」读向；vs 重阳
   *  0.07 开网）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.1,
  /** 规则①（枝干通道：主干大枝进冠不被封死——致密相的「透」侧保险）；数值工程设定
   *  （10m 开展宽冠通道带随冠尺度，比例沿家族量级）。 */
  channelRadius: 0.5,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：致密相的冠内空隙表达——**数量少**（2 个，vs 先例 3））。
   *  【结构计数类：槽间恒等】数量工程设定（致密读向：空隙由密度场承载为主）。 */
  voidCount: 2,
  /** 空腔半径域小档（0.42–0.72：致密相小空隙——vs 重阳 0.52–0.90 / 栾 0.50–0.88 的
   *  中大腔族）。值 = 国槐特有；半径域机制 = 家族共性候选。 */
  voidRadiusMin: 0.42,
  voidRadiusMax: 0.72,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；国槐「叶簇」= **末级枝互生
  // 平展小卡簇**（小簇 0.15–0.22 + 每簇 10 候选一回羽叶小卡黄金角互生螺旋散布平摊）
  // = 一回羽叶卡挂点语言；L5 簇位表同时为荚果串承载位表（确定性账目——sophora
  // Geometry 常数与判据））
  /** Spec §4/域扩展节 B leaf_attachment_rule：**一回羽状复叶在枝上互生**（leaf-c
   *  照片单源 Inferred [6] + FOC 属级语境 [3]）；着生于末级枝（当年生绿色枝
   *  Verified [1][2]）——叶沿末级枝全长散布。簇位数 L5=2 + L4=1（家族沿用——「末级
   *  枝外段 + 枝端」的散布位点，外段下限 0.44 起）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——末级枝叶组挂外段受光区；平展层叠的站位带）。 */
  clusterInnerStartL5: 0.44,
  clusterInnerStartL4: 0.4,
  /** Spec §2/域扩展节 B leaf_size + clump_scale：真复叶总长 15–25cm（「羽状复叶长达
   *  25厘米」FRPS Verified [1][2][4]）× ≈1.4 工程映射（011.6/011.8 复叶映射系数
   *  沿用——复叶 SDF 满幅绘制窗列、无单叶卡叶缘余量需求）→ 卡长 0.21–0.35 / 卡宽
   *  0.07–0.12（比例 0.34 冻结）⇒ **小簇半径 0.15–0.22**（末级枝羽叶组布置球——
   *  簇半径 ≈ 卡长的 0.6–0.7 量级带（vs 重阳中簇 0.17–0.23 / 栾大簇 0.24–0.34——
   *  小卡小簇语义）；卡体伸出球外由卡本体覆盖）；L4 簇 ×1.15 承接更粗末级枝——家族
   *  沿用。【簇半径比类 = 家族共性候选；绝对量级 = 国槐特有（一回羽叶小卡小簇）】 */
  clusterRadiusMinL5: 0.15,
  clusterRadiusSpanL5: 0.07,
  clusterRadiusScaleL4: 1.15,
  /** 工程设定（家族沿用——短枝梢簇随之缩小的 cap 语义：L5 枝长 ~0.4–0.6m 下 cap
   *  0.22–0.33，簇半径实际由 cap 主导）。 */
  clusterRadiusLengthCap: 0.55,
  /** Spec 域扩展节 B leaf_cluster_density「1 枚羽叶/挂点」+ 细碎层叠致密冠面——簇级
   *  显式剔除的间距保险：0.55（小卡中距：簇心距 ≥ 0.55×(ri+rj) ≈ 0.17–0.25m
   *  （**Step 3 探针定档**：初值 0.52 实测保留簇 474–557，slot-7 密端 Mid 总面贴
   *  10000 上沿——回调 0.55 收簇位量保 Mid 预算带余量，记档）；挂点 rng/复叶卡 rng
   *  无条件消费后丢弃，确定性不破）。【间距机制 = 家族共性候选；值 = 国槐特有
   *  （小卡小簇中距 + Mid 预算回调）】 */
  clusterMinSeparation: 0.55,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 10 = **小卡簇候选数**（互生复叶语言的卡尺度合并抽象：真羽叶沿枝互生
   *  节距 ~4–8cm × 卡长 0.21–0.35 ⇒ ≈4–8 节/卡长的连续节位合并，每簇 10 候选 =
   *  小卡高数量档（vs 栾大卡 3 / 银杏 8 / 重阳中卡 8 / 朴樟密簇 18）——「细碎
   *  均质绿面」Spec §3 [6] + 致密相的工程映射；通透过滤后逐簇存活典型 5–9 枚）；
   *  黄金角互生螺旋方位在 10 候选间成立（φ_j = j×137.5°——互生叶序螺旋语言继承
   *  platanus）。8 槽簇位 945（L4 189×1 + L5 378×2，7 L1 拓扑）× 10 卡的 High 实测
   *  （2026-09-21 终测）：保留簇 423–521（簇级剔除 424–522）× 通透存活 → 卡
   *  **3178–4517**（slot-6 疏松最低 / slot-7 丰满最高）→ High 总面
   *  **32430–35700** = 皮 24178 + 卡 6356–9034 + 荚果串 1896–2552 落家族行
   *  [≤40000] 带内（**小卡高数量语义**：单卡面积 ≈0.025m² 中值 vs 重阳 0.09 ×0.28
   *  ——同覆盖率下卡数天然高于中卡族、密度语义由小卡数量承载，记档同
   *  platanus/栾/triadica/bischofia 先例口径）。【每簇叶量类 = 家族共性候选；
   *  绝对值 = 国槐特有（互生小卡高数量抽象 + 实测定档）】 */
  clusterLeavesL5: 10,
  clusterLeavesL4: 10,
  /** 外壳偏置 ∈ (0,1]：小卡平摊——簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^γ)
   *  取 0.44（互生羽叶沿末级枝散布非壳聚团——r̂ ∈ [0.56, 1] 的宽域均匀分布，簇心即
   *  枝梢位；「平展层叠」域扩展节 B 的平摊读向——011.8 同档）。【壳偏置机制 = 家族
   *  共性候选；值 = 国槐特有（互生散布平摊读向）】 */
  clusterShellBias: 0.44,
  clusterShellGamma: 0.9,
  /** Spec §2/域扩展节 B leaf_size + 材质冻结接口：真复叶总长 15–25cm（Verified
   *  [1][2][4]）× ≈1.4 工程映射 → **卡宽 0.07–0.12m**（真复叶 ×≈1.4 的一回羽叶
   *  小卡档；先例口径：栾大卡 0.38–0.56 / 重阳中卡 0.21–0.315 / 乌桕 0.08–0.14——
   *  国槐与乌桕同量级的小卡族）。【卡尺寸域类 = 家族共性候选；绝对量级 = 国槐特有
   *  （复叶第三型整叶卡）；卡宽域槽间不动（叶身份）】 */
  leafWidthMin: 0.07,
  leafWidthSpan: 0.05,
  /** **一回羽叶卡宽/长比冻结 0.34（主代理接口冻结——材质冻结接口）** → 长/宽
   *  aspect = 1/0.34 ≈ 2.9412 恒定、span = 0（尺寸抖动仅缩放不改比例——卡 v 轴 =
   *  复叶基部（裸轴段）0 → 顶生小叶尖 1、u = 0.5 叶轴中轴，一回羽叶 SDF 按此比例
   *  设计窗列——材质-几何冻结接口）。【长宽比域类 = 家族共性候选；恒值 = 国槐特有
   *  （冻结接口——复叶系第三个恒比例卡：0.60 二回 → 0.75 三出 → 0.34 一回奇数的
   *  展幅分化）】 */
  leafAspectMin: LEAF_ASPECT_IMPARIPINNATE,
  leafAspectSpan: 0,

  // 树皮近景微起伏（国槐特有分化：**灰褐-深灰褐深纵裂厚脊沟（板状粗犷）+ 纵为主
  // 局部交叉的中-深浮雕**——第 10 树皮语言，终审裁决 6；FRPS「树皮灰褐色，具纵裂纹」
  // Verified [1] + FOC "longitudinally striate" [2] + NC "deep fissures, furrows, and
  // ridges" [4] + 照片三源 [6]（bark-a 深沟厚脊板状/ bark-b 板状粗厚脊/ twig-a 深灰
  // 褐纵裂脊）——建模取中龄-大树中-深偏高档；vs 夏栎 0.033/樟 0.036/银杏 0.030/
  // 乌桕 0.027/重阳 0.028/朴 0.016/榉-悬 0.014–0.015/栾 0.013 九分化中**中-深偏高
  // 档（0.032）**——**交叉网状次级层/暗色瘤突/愈合疤/灰褐-深灰褐色调主体在材质侧**
  // （sophoraMaterials 配方层——并行交付），geometry 只管厚脊深沟浮雕）
  /** 深纵裂厚脊中-深偏高档锚定 0.032（脊厚沟深的板状粗犷读向 [4][6]——bark-a
   *  「脊宽厚沟深（厘米级）」双问 [6] 端 ↔ FOC striate 浅端的中-深偏高带；主干基环
   *  半径 ≈0.26–0.32m（Step 3 域）→ 峰幅度 ≈8.3–10.2mm（厘米级沟脊的起伏量级域
   *  [6]）。亚视觉地板联动（sophoraGeometry 抬档 3.5mm——011.8 同款）：0.032 下
   *  起径 <0.109m 的管平滑发射——L1 骨架起径 0.09–0.10 亦在地板下：**仅主干有效
   *  起伏**、全部分枝管光滑（「深裂显于粗干」[4][6] + 细枝 zigzag 网光滑读向——
   *  瘤突/网状/色序归材质层）。【幅度 ∝ 半径量级挂钩 = 家族共性候选沿用；绝对值 =
   *  国槐特有（中-深偏高档）】槽间恒等（barkRelief 非形态差异维度——slot-0 定义、
   *  其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.032,
    /** 厚脊低谐波 + 交叉次级层：k∈{3,4,6}（厚脊 = 低谐波量级——bark-a「脊宽厚沟深」
     *  [6] 的周向语言：周向 3–4 条厚脊 + k6 次谐波的局部交叉网状读向（裁决 6「纵为
     *  主局部交叉网状次级层」的几何侧弱表达——交叉主体在材质层）；≤ 主干 radial 14
     *  的奈奎斯特域 7 留 1 档边际——家族同款边际纪律）。【谐波语言 = 国槐特有定档
     *  （厚脊低谐波 + 交叉次级）】 */
    harmonics: [3, 4, 6],
    /** 轴向游走基率 5.5 rad/m（**中档**——「纵为主局部交叉」：轴向去相关 ≈2π/5.5 ≈
     *  1.14m——纵脊长程连续为主 + 局部交叉的短程去相关，游走弱于重阳扭转 6.5 /
     *  栾局部细裂 5 相当、强于顺直脊沟族（银杏 2.6/樟 3.2/乌桕 2.8）——「纵裂 +
     *  局部交叉」复合的中档）。【游走机制 = 家族共性候选；速率值 = 国槐特有（纵为主
     *  局部交叉中档）】 */
    drift: 5.5,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown——flare 1.18 轻度沿家族常量，Step 3 微调归几何））。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 Inferred [6]）
   *  的家族五级方法沿用，级数槽间不动。姿态分级为国槐开展宽圆头语言：upturn
   *  [0.10,0.08,0.06,0.04,0.03] 单调递减低正链（两带角位已由 SCAFFOLD_BAND 承载主
   *  剪影，upturn 链低正承载端部小枝斜上收口——**不建负链下垂语言**（大枝水平-下垂
   *  为老树端 [6]，中龄主相由下带 87° 上限 + 游走复合承载））；wander 骨架级 0.09
   *  中游走（大枝较顺直开展——vs 重阳虬曲 0.10）+ **末级乱幅 0.42 略抬档 + zigzag
   *  确定性交替偏置（sophoraGeometry ZIGZAG_*——末级枝之字形 [6] 的弱表达，裁决 9：
   *  夏绿相叶幕覆盖下不显著记档）**；分级单调性保持。各级数值工程设定（方向 Spec
   *  Verified [4] + Inferred [6]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.1 },
    { radial: 7, segs: 8, wander: 0.15, upturn: 0.08 },
    { radial: 6, segs: 5, wander: 0.24, upturn: 0.06 },
    { radial: 5, segs: 4, wander: 0.32, upturn: 0.04 },
    { radial: 4, segs: 3, wander: 0.42, upturn: 0.03 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑——L3→L4 三挂点承载 6 骨架下的簇位量 945）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3 语法复制）：**培训直干窄端**——NC 两相栽培原句「can be
 * trained into a tall specimen with an erect trunk」Verified [4] 的行道培训相个体
 * （冠幅比 0.9–1.2 域窄端 + 干高域上段）。组合：冠幅比降（0.46——Step 3 探针终测
 * 涌现 w/h 贴工程读向域下沿——培训窄冠）+ 冠高比升（0.74 直干纵域长）+ **两段角域
 * 整体上移**（48–66——带位漂移后下带 63–81 / 上带 33–51：培训相下带不全平展、上带
 * 更斜上）+ 挂高段上移收窄（0.62–0.76 干高段 span 0.14——高干培训相）+ 领导枝偏强
 * （0.48——培训直干 excurrent 端；涌现树高读向偏高，探针回调记档见各槽注释）+
 * crownTopBias 转正（0.06 顶密）+ upturn 链 ×1.3（直立相）。两段带位结构不动
 * （SCAFFOLD_BAND 几何常数槽间恒等——同种语言，培训窄冠而非柱冠）。
 */
const SOPHORA_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...SOPHORA_SLOT0_PROFILE,
  crownWidthRatio: 0.515,
  crownCenterRatio: 0.62,
  crownHeightRatio: 0.74,
  crownTopBias: 0.06,
  scaffoldAngleMin: 48,
  scaffoldAngleMax: 66,
  scaffoldAttachMin: 0.62,
  scaffoldAttachSpan: 0.14,
  scaffoldRankLength: [1.08, 1.02, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.56,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.13 },
    { radial: 7, segs: 8, wander: 0.12, upturn: 0.1 },
    { radial: 6, segs: 5, wander: 0.18, upturn: 0.08 },
    { radial: 5, segs: 4, wander: 0.24, upturn: 0.05 },
    { radial: 4, segs: 3, wander: 0.32, upturn: 0.04 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：**开放生长开张宽端**——NC 两相栽培原句
 * 「When open-grown, it tends to branch low to the ground」Verified [4] 的开放
 * 生长相 + 冠幅比 0.9–1.2 域上段（族内最开展端的槽位化——「冠大荫浓」[1] 的宽端
 * 个体）。组合：冠幅比升（0.56——Step 3 探针终测涌现 w/h 贴 Spec 域 0.9–1.2 上沿
 * ——开放生长「冠幅 ≥ 高」读向 [4]）+ 冠高比降（0.58 扁宽端）+ 冠心降（0.52——冠
 * 最宽带下压）+ **两段角域整体下移**（60–78——带位漂移后下带 75–93 近水平-微下垂
 * （form-b 老树大枝水平-下垂 [6] 的开张端）/ 上带 45–63）+ 挂高段下移放宽（0.42 起
 * span 0.28——低分枝开张）+ 首枝 rank 主导强（×1.28）+ crownTopBias 负（−0.10 顶部
 * 平缓宽圆）+ 领导枝 0.38（开放生长更弱顶——矮冠宽端）。
 */
const SOPHORA_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...SOPHORA_SLOT0_PROFILE,
  crownWidthRatio: 0.62,
  crownCenterRatio: 0.52,
  crownHeightRatio: 0.58,
  crownTopBias: -0.1,
  scaffoldAngleMin: 60,
  scaffoldAngleMax: 78,
  scaffoldAttachMin: 0.42,
  scaffoldAttachSpan: 0.28,
  scaffoldRankLength: [1.28, 1.05, 0.95, 0.87, 0.81, 0.77],
  scaffoldRankRadius: [1.06, 0.97, 0.91, 0.87, 0.84, 0.81],
  leaderLengthRatio: 0.44,
  clusterMinSeparation: 0.58, // 扁宽冠簇位横向拥挤（探针实测 R 520 贴 Mid 预算上沿）——回调间距保带宽余量，记档
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：
 * 散布互生骨架的方位强弱分化（骨架排列 Unknown [4][6]——散布口径使偏侧势差更自由）
 * + 冠形个体幅度（Spec §6）——方向采信；幅度工程设定）。组合：asymmetry 升（0.52
 * ——散布骨架的方位大抖动；偏侧相干性由 rank 主导承载）+ scaffoldRankLength 首枝
 * ×1.60 / 弱势 ×0.74（一侧枝展压倒性——首枝质量占比 ≈0.32，配 5 弱枝近均分 → 质心
 * 稳定指向首枝方位；榉 ×1.50/悬 ×1.62/栾 ×1.78/重阳 ×1.62 同构量级带）+
 * scaffoldRankRadius 同向（×1.10）+ 冠幅比 0.46 容纳域（探针涌现带内上段 + 质心
 * 偏移读数见测试）+ 角域贴标准微扩（56–74）。其余维度贴标准（偏冠 = 方位维差异）。
 */
const SOPHORA_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...SOPHORA_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  crownCenterRatio: 0.56,
  asymmetry: 0.54,
  scaffoldAngleMin: 56,
  scaffoldAngleMax: 74,
  scaffoldAttachMin: 0.54,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.72, 1.02, 0.92, 0.84, 0.77, 0.72],
  scaffoldRankRadius: [1.1, 0.96, 0.92, 0.88, 0.85, 0.82],
  leaderLengthRatio: 0.5,
};

/**
 * slot-4 低冠组合（009.3 语法复制）：低分枝点开张个体——开放生长相的低冠极端读向
 * （NC branch low Verified [4]）+ 净干 2–3m 域下段端。组合：挂高段下移放宽
 * （attachMin 0.40 + span 0.30——低分枝 + 挂高段松散）+ 冠心降（0.50）+
 * crownTopBias 负（−0.08 底密）+ 两段角域下移（58–76 → 下带 73–91 更近水平/上带
 * 43–61）+ 姿态下压（levels upturn ×0.6——开展弱化端、冠缘摊平；分级单调性保持）+
 * 簇半径微升（0.17–0.24 低开张小簇偏大）+ 领导枝 0.40（低冠槽弱顶与低分枝同向——
 * 探针回调记档）+ 冠幅比 0.48（涌现带内）。高冠槽冠底差同 seed 实测记档见测试。
 */
const SOPHORA_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...SOPHORA_SLOT0_PROFILE,
  crownWidthRatio: 0.54,
  crownCenterRatio: 0.5,
  crownHeightRatio: 0.66,
  asymmetry: 0.44,
  crownTopBias: -0.08,
  scaffoldAngleMin: 58,
  scaffoldAngleMax: 76,
  scaffoldAttachMin: 0.4,
  scaffoldAttachSpan: 0.3,
  scaffoldRankLength: [1.16, 1.03, 0.96, 0.9, 0.86, 0.82],
  scaffoldRankRadius: [1.03, 0.96, 0.92, 0.89, 0.87, 0.85],
  leaderLengthRatio: 0.48,
  clusterRadiusMinL5: 0.17,
  clusterRadiusSpanL5: 0.07,
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.06 },
    { radial: 7, segs: 8, wander: 0.16, upturn: 0.05 },
    { radial: 6, segs: 5, wander: 0.24, upturn: 0.04 },
    { radial: 5, segs: 4, wander: 0.32, upturn: 0.02 },
    { radial: 4, segs: 3, wander: 0.42, upturn: 0.02 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制）：高分枝清干个体——净干 2–3m 域上段端（公园
 * 清干修剪语境的自然变体——公园修剪相 Unknown 结构缺口的带内上侧展开）。组合：挂高段
 * 上移收窄（attachMin 0.72 + span 0.10——高挂点 + 挂高段集中）+ 冠心升（0.62）+
 * crownTopBias 转正（0.04 顶密）+ 领导枝 0.46（高冠槽树高读向偏高与身份同向——探针
 * 回调记档）+ 两段角域上移（48–66 → 下带 63–81/上带 33–51）+ 姿态上举（levels
 * upturn ×1.3；分级单调性保持）+ 冠高比降（0.60 高挂点纵域收窄）+ 冠幅比 0.46
 * （涌现带内）+ asymmetry 降（0.38）。
 */
const SOPHORA_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...SOPHORA_SLOT0_PROFILE,
  crownWidthRatio: 0.54,
  crownCenterRatio: 0.62,
  crownHeightRatio: 0.6,
  asymmetry: 0.38,
  crownTopBias: 0.04,
  scaffoldAngleMin: 48,
  scaffoldAngleMax: 66,
  scaffoldAttachMin: 0.72,
  scaffoldAttachSpan: 0.1,
  scaffoldRankLength: [1.1, 1.03, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.54,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.13 },
    { radial: 7, segs: 8, wander: 0.12, upturn: 0.1 },
    { radial: 6, segs: 5, wander: 0.18, upturn: 0.08 },
    { radial: 5, segs: 4, wander: 0.24, upturn: 0.05 },
    { radial: 4, segs: 3, wander: 0.32, upturn: 0.04 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透疏端——空隙 ≈10–20% 带疏端（Spec §3
 * crown_transparency Inferred [6] 单源——20% 空隙读向个体；**荚果承载轴的疏端**——
 * 资格簇数随密度参数收缩，串数随槽平滑减少（确定性步长抽选的间接承载，家族契约无
 * 果序参数位记档同 011.6））。组合：canopyDensity 0.80（Step 3 探针定档：Mid 总面
 * 贴家族行下沿 6000 余量锁定——小卡高数量 Mid 掩码 10 选 3 下叶面基数高，低密度端
 * 保留下沿余量；疏密对比维持——卡数比 slot-7 实测记档见测试）+ crownShellStart ↑
 * （0.52 壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓（0.05——疏端）
 * + 空腔半径域 ↑（0.50–0.88 大空隙）+ clusterMinSeparation ↑（0.58 疏簇更散）+
 * clusterShellBias ↓（0.38 散布更宽）+ 领导枝弱（0.40——多枝共构开张端）+ 冠幅比
 * 0.50（涌现带内）。
 */
const SOPHORA_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...SOPHORA_SLOT0_PROFILE,
  crownWidthRatio: 0.52,
  canopyDensity: 0.8,
  crownShellStart: 0.52,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.05,
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.88,
  clusterMinSeparation: 0.58,
  clusterShellBias: 0.38,
  leaderLengthRatio: 0.48,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密团冠端——空隙 ≈10–20% 带密端（Spec §3
 * Inferred [6] 密侧 + 中龄生长季满冠个体——「冠大荫浓」[1] 的密端读向；**荚果承载轴
 * 的密端**——串数随槽平滑增多（间接承载记档同 slot-6））。组合：canopyDensity
 * 0.98（Step 3 探针定档——簇 10 候选高保留 + 皮面 24178 落带内上段复核；先例同款
 * 预算校准流程：朴 0.93/樟 0.94/榉 0.92/银杏 0.92/悬 0.92/栾 0.92/乌桕 0.94/重阳
 * 0.94 定档）+ crownShellStart ↓（0.42 满密壳带更厚）+ crownCoreStart ↑（0.14）+
 * coreDensityFloor ↑（0.13 团冠感）+ 空腔半径域 ↓（0.36–0.62）+ clusterMinSeparation
 * ↓（0.48 簇更密）+ clusterShellBias ↑（0.50 簇更实）+ 冠幅/冠高比 0.50 / 0.68
 * （团冠体量）+ 领导枝 0.44（团冠顶密带内——探针回调记档）。
 */
const SOPHORA_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...SOPHORA_SLOT0_PROFILE,
  crownWidthRatio: 0.545,
  crownHeightRatio: 0.68,
  canopyDensity: 0.96,
  crownShellStart: 0.42,
  crownCoreStart: 0.14,
  coreDensityFloor: 0.13,
  voidRadiusMin: 0.36,
  voidRadiusMax: 0.62,
  clusterMinSeparation: 0.545,
  clusterShellBias: 0.5,
  leaderLengthRatio: 0.48,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；国槐沿
 * Spec §6 幅度轴展开：培训直干窄端（slot-1——NC 两相栽培培训相 Verified [4]）/
 * 开放生长开张宽端（slot-2——冠幅比 0.9–1.2 上段）/ 偏冠端（slot-3）/ 干高端
 * （slot-4/5——净干 2–3m 域两侧）/ 疏密端（slot-6/7——空隙 10–20% 带两端 + 荚果
 * 承载轴间接承载））。slot-1…7 以 slot-0 锚点为底的差量展开定义——**结构计数类字段
 * （trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）
 * 与叶卡尺寸/长宽比域由展开继承逐位恒等**（皮面数恒等 24178 与 rng 消费次数恒等的
 * 结构性保证；**荚果挂点 = 确定性账目零 rng**（sophoraGeometry 常数与判据）——槽间
 * 恒等无消费口径问题）；**一回羽叶卡比例 0.34 全槽恒定**（冻结接口）；barkRelief
 * 槽间恒等（spread 继承）。morphSeed 路由见 assets/asset_tree_sophora.asset。
 */
export const SOPHORA_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  SOPHORA_SLOT0_PROFILE,
  SOPHORA_SLOT1_PROFILE,
  SOPHORA_SLOT2_PROFILE,
  SOPHORA_SLOT3_PROFILE,
  SOPHORA_SLOT4_PROFILE,
  SOPHORA_SLOT5_PROFILE,
  SOPHORA_SLOT6_PROFILE,
  SOPHORA_SLOT7_PROFILE,
];
