/**
 * runtime/procedural/tree/bischofia/bischofiaShapeProfile —— 重阳木 shapeProfile 数值面
 * （T011.8 Step 1 + Step 2，阔叶家族契约第九实例——方法复制自夏栎第一实例经朴树
 * （T011.1）/香樟（T011.2）/榉树（T011.3）/银杏（T011.4）/悬铃木（T011.5）/栾树
 * （T011.6 复叶首例）/乌桕（T011.7）八次验证的通路：../triadica/triadicaShapeProfile
 * 同构——最新方法复制模板）。
 *
 * 职责：重阳木（Bischofia polycarpa (H. Léveillé) Airy Shaw，大戟科 Euphorbiaceae
 *      （FRPS/FOC 口径；APG IV 归叶下珠科记档不影响生产）、**长江流域城市公园夏绿落叶
 *      乔木**（建模目标相 = 生长季夏季绿叶相；秋色黄-橙红/冬态宿存红果串为身份标志但
 *      非夏季主相——记档不建模，同 011.6/011.7 秋色纪律）、**家族复叶第二型（三出复叶
 *      ——放射对称型）+ 伞形开展冠 + 褐色纵裂深沟宽脊扭转树皮**语言（vs 011.6 栾树
 *      二回羽状复叶首例的轴系窗列型））、**公园单干中龄个体 ≈10m**（速生伞形开展——
 *      与栾树 10m 同量级，主代理裁定；FRPS 上限 15m，生产域 8–12m Inferred））枝干/
 *      冠层结构的形态参数**数值面**——类型契约 = 阔叶家族契约
 *      ../broadleaf/broadleafShapeProfile（BroadleafShapeProfile，零修改第九实例化；
 *      字段语义、【阔叶共性候选】标注、T009.3 消费语义与槽间恒等纪律见家族文件）。
 *      **八先例的数值是证据不是家族真理**，本文件全部数值依据
 *      docs/research/bischofia-reference.md（Spec Version 1.0——生产一律以文末「终审
 *      记档」③ 逐项裁决 + ④ 生产口径终版（生产口径终版 ④）为准：树高锚 ≈10m 裁决 1、
 *      夏相果序/春花不做裁决 2、冠幅比 0.8–1.0 维持裁决 3、两段 scaffold 采纳裁决 4、
 *      叶色弱差裁决 5）重阳木自己的现实事实重定；下方逐字段标注【家族共性候选】沿用 /
 *      【重阳木特有】新证据 / 工程设定（无现实基准不编造依据）。方法恒同纪律（T011.8
 *      任务书）：五级拓扑 L1–L5、叶簇挂末两级 L4/L5、结构计数类跨槽恒等、rng 无条件
 *      消费、LOD 三档同流派生整体复制，重阳木只换数值与算法细节（几何侧差异点归
 *      bischofiaGeometry Step 3 交付，逐条 Spec 引用见其模块头）。
 * 边界：重阳木资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_bischofia.asset）；比率字段以
 *      totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0（含终审记档）× 八先例方法基线对照，三栏落档；改写项
 *    逐条映射实现面；主代理 Step 1 判定 A–D 为执行依据）──
 *
 * ■ 可继承项（家族方法原样沿用，重阳木证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——重阳木分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [7]）落在家族五级口径内（夏栎先例同款包含关系）；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown，域扩展节 A 全组 Unknown），家族方法沿用；
 *   3. 冠内通透三规则——外密内疏为家族方向沿用（Spec crown_fill_gradient Unknown
 *      ——生长季成树冠内样张缺失为本 Spec 最大缺口）+ 枝干通道 + 局部空腔；
 *   4. 枝梢驱动叶簇——家族「簇挂末两级枝梢」映射同向（挂点语言的重阳木分化见改写
 *      项 1）；
 *   5. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   6. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡）；**无花果附加元素
 *      （Step 1 判定 C）→ 无 Low 附加元素省略节——比 011.6/011.7 简一节**；
 *   7. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   8. 尺度锚中龄公园 ≈10m（速生伞形开展——与栾树 ≈10m 同量级、高于乌桕 9.5m 半档；
 *      长江中下游行道/园景习见 [1][3][7] 的速生上探 12m 变体入 slot-1 记档）。
 *
 * ■ 按重阳木改写项（每条映射实现面）：
 *   1. **三出复叶卡挂点语言（家族复叶第二型核心，Step 1 判定 A = 1 卡承载整枚三出
 *      复叶——分卡方案 3 小叶卡/挂点 = 3× tri 成本 + 三卡方位协同复杂度 vs 单卡 2 tri，
 *      011.6 复叶卡先例同裁定逻辑；档间连续（单卡 SDF 细节随档简化）+ 近景读出（SDF
 *      三叶放射场可读——材质层）三判据，主代理冻结）**：Spec §4/域扩展节 B 三出复叶
 *      结构组 Verified [1][3]——三小叶掌状放射、顶生大（柄 1.5–4(–6)cm）+ 侧生小近无柄
 *      （3–14mm）、小叶卵形-椭圆状卵形 5–9(–14)×3–6(–9)cm、总柄 9–13.5cm ⇒ 全展幅
 *      ≈20–30cm 级（Spec §3 叶幕质感计算）；**与 011.6 分化点 = 放射对称型（无轴系
 *      窗列）**——SDF 结构上「三叶场并集 + 裸柄段」vs 栾树「两级窗列」，但接口纪律
 *      （卡比例冻结/满幅绘制/尺寸抖动不改比例）复用。**卡接口冻结（Step 1 判定 B，
 *      几何-材质共享一字不改）**：卡宽/长比 **0.75 冻结**（aspect = 1/0.75 ≈ 1.3333
 *      恒定、span 0——三出展幅宽于羽叶 0.60 的 Spec §4 展幅计算 + 终审 ④ 0.7–0.85
 *      取中值）；卡长 **0.28–0.42m**（真复叶全展幅 20–30cm × ≈1.4 工程映射——011.6
 *      复叶映射系数沿用）⇒ 卡宽 0.21–0.315；卡 v 轴 = 总柄基 0 → 顶小叶尖 1，**总柄
 *      裸段 v∈[0, 0.35] 为材质 SDF 裸柄线域**（bare 门控——011.6 ⑧ 同型，比例由材质侧
 *      设计、几何侧 uv 标准 0–1 四边形域不变）；挂点方位 = **黄金角 137.5° 互生螺旋**
 *      （互生 Inferred 弱单源 [7] + 科通则——家族互生螺旋挂点方法沿用）+ **平展取向**
 *      （PLANE_LIFT——总柄 9–13.5cm ≈ 0.7–1.5× 小叶长的摆动自由度，域扩展节 B
 *      leaf_orientation_dist「多向摊开层叠」Inferred [1][3][7]）+ 略前倾 + 弱抖动；
 *      **密度语言中密**（young-a 幼树中密 [7] + 推断中-疏通透——中带）：复叶卡小于栾树
 *      卡（0.28–0.42 vs 0.63–0.93 长）⇒ 同覆盖率卡数多——每簇 8 候选 + 中簇 + 疏簇
 *      间距抑制沿用（预算 High ≤40000 反推约束，账目见 clusterLeaves 注释）；三小叶
 *      结构（顶大侧小/小叶柄差/缘钝细齿 4–5/cm/基部圆-浅心/纸质）全部归
 *      bischofiaMaterials 三出复叶 SDF 层（几何不建模）；
 *   2. 树形语言：**伞形-开展圆头（spreading umbrella-rounded）**——FRPS「树冠伞形状，
 *      大枝斜展」Verified [1] + form-a「开展不规则圆头-近伞形、顶部略平缓、下缘大枝近
 *      水平展出」双问 [7] → 实现：**两段 scaffold 角**（Step 1 判定 D——域扩展节 A
 *      scaffold_angle 两段姿：下带近水平 70–90° / 上带斜上 40–60°，form-a 双问数值带
 *      承重 + FRPS「斜展」定性兼容（裁决 4）——bischofiaGeometry SCAFFOLD_BAND 带位
 *      漂移实现：挂高段内归一位置分带，低挂点枝近水平开展（伞形下缘）/ 高挂点枝斜上
 *      （圆头顶），确定性零 rng）+ 干向挂点高度长度分级（低枝长高枝短——伞形放张）+
 *      upturn 链低正（冠缘微垂读向——winter-fruit 细枝横展微垂 [7]；不建负链下垂语言，
 *      终审裁决 2 同口径）+ **领导枝弱**（伞形无强单顶——apical_dominance 弱 Verified
 *      [1]+Inferred [7]，leaderLengthRatio 家族低档 0.42）+ 散布方位（骨架排列 Unknown）；
 *   3. 冠幅比：Spec §3/域扩展节/终审裁决 3 **0.8–1.0（伞形开展等幅族——幼树 young-a
 *      冠幅 ≥ 高 [7] 开张端入 slot-2）**；8 槽 w/h 涌现落工程域 0.7–1.0（家族行）；
 *      crownWidthRatio 参数探针定档（T009.3 口径——外泄系数实测回写，见字段注释）；
 *   4. 干高占比：域扩展节 A trunk_height_ratio **0.25–0.33（form-a 干高 1/4–1/3 双问
 *      [7]）**——干高参数域 0.25–0.33（geometry rng 域）+ 挂高段 0.62–0.86 承载
 *      （form-a「约 2–3m 分出大枝」的映射）；公园修剪相 Unknown（结构缺口记档）；
 *   5. 骨架数：域扩展节 A scaffold_branch_count Unknown（form-a 弱读 3–5 主枝不承重
 *      [7]）+ 伞形开展冠多枝平展读向 → **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 枝数
 *      [7,21,63,189,378]、簇位 945（L4 189×1 + L5 378×2）、皮面 24178——10m 伞形开展
 *      冠的复叶中卡中量预算留带内余量，账目见 clusterLeaves 注释；两段角 6 枝 = 下带
 *      3 枝 + 上带 3 枝的对称分配）；
 *   6. **花/果 = 不做（Step 1 判定 C，终审 ③-2 裁决）**：夏相幼果 2–3mm 亚厘米显著性
 *      极低（vs 叶幕 20–30cm 级大叶）+ 熟期 10–11 月相外 + 春花 4–5 月相外——**几何无
 *      花果账目、无 rng 花果消费、无 v∈[4,7] uv 域**（皮管弧长 v ≤ ≈2.9 + 叶卡 0–1 两
 *      域即全部——比 011.6（花果双信号）/011.7（绿闭果）简化的「无花果资产」先例接口；
 *      triadica 有果、本例无，差异记档不混淆）；秋冬红果串相（身份标志）记档不建模；
 *   7. 树皮（第 9 语言「褐-深灰褐纵裂深沟宽脊 + 裂纹扭转/局部网状、细枝红褐光滑皮孔」
 *      ——FRPS「树皮褐色，厚6毫米，纵裂」Verified [1] + bark-a（73 年生）深纵裂宽脊
 *      强扭转 [7] + bark-b（中龄）纵浅裂窄脊 [7]；建模取中龄档沟深中-深）：几何只管
 *      纵裂浮雕 → amplitudeRatio **0.028**（沟深中-深——家族中-深档，triadica 0.027
 *      附近自定；朴 0.016 浅 / 银杏 0.030 / 夏栎 0.033 / 樟 0.036 深裂族的浅侧）+
 *      谐波 **{3,4,5} 宽脊低谐波**（宽脊 = 低谐波量级——bark-a「脊宽沟深」[7]；vs
 *      银杏 {4,5,6} 多一道细脊）+ drift **6.5 rad/m 中-高游走**（裂纹**扭转**——bark-a
 *      「裂纹扭曲交错/主干扭转感」[7]——游走强于顺直脊沟族 2.6–3.2（银杏/樟/乌桕）与
 *      栾局部细裂 5、弱于悬铃木/榉断裂拼贴 11；轴向去相关 ≈2π/6.5 ≈ 0.97m 的扭转
 *      交错读向）+ **细枝光滑**（起伏幅度地板下、仅主干有效——bischofiaGeometry 亚
 *      视觉地板抬档 3.5mm：0.028 幅度下起径 <0.125m 的管平滑发射，L1 骨架起径
 *      0.09–0.10 亦在地板下——「细枝红褐-灰褐光滑带皮孔」fruit-c/bark-a [7] 的几何
 *      侧读向，皮孔/色序归材质层）；
 *   8. 密度语言：**中密-中疏带**（推断中-疏通透 Spec §3 + young-a 幼树中密 [7]——
 *      取中带）→ crownShellStart 0.50 + coreDensityFloor 0.07（开网）+ 大空腔
 *      0.52–0.90 + 疏密差异归槽 6/7；
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开（差异轴：**冠幅比 0.8–1.0 两端（幼龄开张
 *      young-a 冠幅 ≥ 高 ↔ 速生收窄）/ 干高端（0.25 低冠 ↔ 0.33 高冠）/ 偏冠 / 疏密 /
 *      速生上探**——主代理指定）：slot-1 速生上探窄端（终审 ③-1「速生上探 12m 变体
 *      入高位槽」——长江行道速生读向）/ slot-2 幼龄开张宽端（young-a 冠幅 ≥ 高 [7]）/
 *      slot-3 偏冠 / slot-4/5 干高端（0.25–0.33 域两侧）/ slot-6/7 疏密端。结构计数类
 *      （radial/segs/childPlan/簇位/每簇叶量/voidCount/scaffoldCount）8 槽恒等；槽差异
 *      全走连续参数（角域/比率/幅度）。**多干/倾斜个体不进 8 槽**（form-a 双株一直一
 *      斜 [7]——倾个体变体档，结构差异不落连续参数，家族同款纪律记档）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_taper_ratio / basal_flare_ratio（域扩展节 A 均 Unknown）——干形锥度与
 *      根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. DBH 典型值 Unknown（8–12m 中龄公园个体干径 25–45cm 无标尺推断 [7] 不承重）
 *      ——根径 0.25–0.31m 工程设定（10m 速生中龄个体，家族带内，Step 3 探针校）；
 *   3. scaffold 角带数值 = form-a 双问 Inferred [7]（「斜展」定性 Verified [1]——
 *      分级记档：定性 Verified / 度数带 Inferred 承重）；
 *   4. branch_length_decay / branch_radius_decay / branch_attachment_t /
 *      allometry_exponent——家族量级工程设定（两段角带 + 长度分级为工程语言，非实证
 *      数值）；
 *   5. 小叶柄长度差/顶侧小叶大小差/缘钝细齿/芽（FRPS「芽小，顶端稍尖或钝，少数芽鳞」
 *      Verified [1]——毫米级近景档）/托叶（早落 [1]）——归材质 SDF 层或不建模记档；
 *      生长季成树冠内样张缺失（本 Spec 最大缺口——通透度取中带 + Step 4 取证可补）；
 *   6. 生长速率数值 Unknown（NC 无条目 + wiki 超时——速生-中速弱推断不承重 [1]）——
 *      10m 锚的龄级推断以主代理裁定为准。
 *
 * 不建模记档（Spec 有事实、工程不表达）：三出复叶内部结构（顶大侧小/顶生小叶柄
 *      1.5–4(–6)cm ↔ 侧生 3–14mm 近无柄/小叶卵形-椭圆状卵形-长圆状卵形三相/缘钝细齿
 *      4–5/cm/基部圆-浅心/先端突尖-短渐尖/纸质——Verified [1][3]，归 bischofiaMaterials
 *      三出复叶 SDF 层）；总柄裸段（v∈[0,0.35] 材质 SDF 裸柄线域——几何 uv 域不变）；
 *      **花**（4–5 月春相总状绿穗——相外，终审 ③-2 不做）；**夏相幼果/秋冬红果串**
 *      （幼果 2–3mm 亚厘米显著性极低 + 熟期 10–11 月相外——终审 ③-2 不做，身份标志
 *      记档）；秋色黄主导带橙红（fruit-b Inferred [7]——季相归材质/风格层）；新叶红褐
 *      flush（照片双源 Inferred [7]——归材质变奏候选）；当年生枝绿色 + 皮孔灰白→锈色
 *      （FRPS/FOC Verified [1][3]——归材质层近景身份点）；芽（毫米级）；托叶（早落）；
 *      叶背面色差 Unknown（弱差归材质）；多干/倾斜个体（现象 [7] 频率 Unknown——
 *      结构差异不落连续参数记档）；心材鲜红色至暗红褐色（不可见）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/** 三出复叶卡宽/长比冻结值的倒数（宽/长 = 0.75 主代理冻结（Step 1 判定 B——三出展幅
 *  宽于羽叶 0.60：Spec §4 展幅计算 + 终审 ④ 0.7–0.85 取中值）⇒ 长/宽 aspect =
 *  1/0.75 ≈ 1.3333——家族 leafAspect 语义 = 卡长/卡宽；leafAspectSpan = 0：尺寸抖动
 *  仅缩放不改比例（三出复叶 SDF 按此比例设计——材质-几何冻结接口） */
const LEAF_ASPECT_TRIFOLIATE = 1 / 0.75;

/**
 * slot-0 标准组合初值（锚点形态）：长江流域公园夏绿单干中龄个体 ≈10m 量级（速生伞形
 * 开展——与栾树同量级，主代理裁定）、**伞形-开展圆头冠**（两段 scaffold 角（下带近
 * 水平 70–90° / 上带斜上 40–60°——bischofiaGeometry SCAFFOLD_BAND 实现）+ 干向长度
 * 分级 + upturn 链低正 + 散布方位 + 领导枝弱）、**三出复叶中卡**（卡宽 0.21–0.315 ×
 * 长/宽 1.3333 恒比例冻结 0.75）**互生平展散布中卡簇**（每簇 8 候选黄金角螺旋）、冠内
 * 通透中密-中疏带、无花果附加元素（终审 ③-2）。T009.3 教训沿用：视觉冠底由挂高段 +
 * 两段横展角 + upturn + 领导枝链涌现，不由 crownCenterRatio；伞形-开展圆头剪影由两段
 * 角带 + 长度分级 + 弱领导的骨架侧驱动链涌现。结构计数类（trunk/levels radial/segs、
 * childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）全槽恒等；**复叶卡比例 0.75
 * 结构性恒定**（冻结接口）；卡宽域槽间不动（叶身份）。
 */
export const BISCHOFIA_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节 / 终审裁决 3：冠幅/树高比 **≈0.8–1.0（伞形开展等幅族——form-a
   *  双问 0.8–1.0 [7] + FRPS「树冠伞形状，大枝斜展」Verified [1]；幼树 young-a ≥1.0
   *  开张端 [7] 入 slot-2）**；8 槽 w/h 涌现落工程域 0.7–1.0（家族行）。**Step 3 探针
   *  回推定档（2026-09-21 实测）**：两段角下带近水平 70–90° 的横向伸长放大外泄（vs
   *  triadica 单带广角 ×1.39——伞形两段角更大），参数终值 **0.48** 终测涌现
   *  **w/h = 0.852** 落 Spec 域 0.8–1.0 中带；8 槽带 **0.733–0.992** 全槽落工程域
   *  0.7–1.0（slot-1 速生窄端 0.733 贴下沿 / slot-2 幼龄开张宽端 0.992 贴上沿——
   *  **伞形两段角的叶幕绝对宽度种子方差大（面板 ±20%），域带收口以规范种子锁定**
   *  ——探针记档，见 bischofiaShapeSlots 测试注释）。【冠幅比类 = 家族共性候选沿用；
   *  锚值 = 重阳木特有（工程域 + 实测外泄系数回推——探针定档记录，非编造）】 */
  crownWidthRatio: 0.48,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；伞形-开展圆头冠体中心中带
   *  偏低——伞形冠最宽带中下读向的参考系，实际由两段角骨架侧驱动链承载）。 */
  crownCenterRatio: 0.58,
  /** 工程设定（同上；伞形开展冠纵域参考系——顶部圆缓（form-a「顶部略平缓」[7]）由
   *  crownTopBias 微负 + 上带收角共构）。 */
  crownHeightRatio: 0.64,
  /** Spec 域扩展节 A branch_orientation Unknown（无轮生/对生口径证据）+ 叶互生弱单源
   *  Inferred [7] + 科通则——**螺旋互生散布**为八实例主流读向沿用。slot-0 = 0.46
   *  （散布端——方位均分步进 + 大抖动 → 互生散布读向）。【散布机制 = 家族共性候选
   *  沿用；幅度 = 重阳木特有（散布口径 [7] 弱 + 工程默认）】 */
  asymmetry: 0.46,
  /** Spec §3「开展不规则圆头-近伞形、顶部略平缓」（form-a 双问 Inferred [7]）——伞形
   *  顶略平的密度场高度向微负偏置；几何侧顶圆化由上带 40–60° 收角 + 长度分级承载。
   *  【重阳木特有定档依据 = Spec §3 冠形重点问题 FRPS Verified [1] + 照片双源
   *  Inferred [7]；幅度工程设定】 */
  crownTopBias: -0.06,

  // 骨架
  /** Spec 域扩展节 A scaffold_branch_count Unknown（form-a 弱读 3–5 主枝不承重 [7]）+
   * 伞形开展冠多枝平展读向 → slot-0 = **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 簇位 945 /
   *  皮面 24178——10m 伞形开展冠的复叶中卡中量预算余量，账目见 clusterLeaves 注释；
   *  两段角 6 枝 = 下带 3 枝近水平 + 上带 3 枝斜上的对称分配）。【结构计数类：槽间
   *  恒等；取 6 = 工程默认（Unknown 域 + 伞形多枝开展读向带内）】 */
  scaffoldCount: 6,
  /** Spec 域扩展节 A scaffold_angle **两段姿**（终审裁决 4 采纳）——**下带近水平
   *  70–90° / 上带斜上 40–60°**（form-a 双问「中下部大枝近水平或略下垂、中上部大枝
   *  斜上」[7] + FRPS「大枝斜展」Verified [1] 定性兼容）。profile 存**角域中带**（55–75°
   *  ——两带的几何平均位），**两段带位漂移在 bischofiaGeometry SCAFFOLD_BAND**
   *  （挂高段内归一位置 <0.45 → +15°（下带 70–90）/ >0.55 → −15°（上带 40–60），
   *  0.45–0.55 过渡——确定性零 rng，槽间角域差异保持）；「略下垂」端由下带 90° 上限
   *  + 低 upturn 链复合，不建负角。【重阳木特有（定性 Verified [1] + 数值带 Inferred
   *  [7] 双源；带位漂移机制 = 两段角实现，主代理 Step 1 判定 D）】 */
  scaffoldAngleMin: 55,
  scaffoldAngleMax: 75,
  /** Spec 域扩展节 A trunk_height_ratio **0.25–0.33（form-a 干高 1/4–1/3 双问
   *  Inferred [7]）**的挂高段实现：挂点 0.62–0.86 干高段 span 0.24（trunk 参数域
   *  0.25–0.33 × H × 0.62–0.86 ≈ 离地 1.5–2.9m——form-a「约 2–3m 分出大枝」[7] 的
   *  映射带）；T009.3：挂高段下缘 + 两段横展角 + upturn + 领导链共同涌现视觉冠底。
   *  【重阳木特有（双问 Inferred 域 + 带内映射）】 */
  scaffoldAttachMin: 0.62,
  scaffoldAttachSpan: 0.24,
  /** 工程设定（branch_radius_decay Unknown；form-a「大枝粗壮（径 ≈1/3–1/2 主干）」
   *  Inferred [7]——挂点径 × 0.56 家族带内承载粗壮读向，DBH Unknown 待视觉验收校）。 */
  scaffoldThickness: 0.56,
  /** rank 长度乘子（6 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用；
   *  散布互生骨架的环内势差——偏冠槽加大首枝势差承载）。 */
  scaffoldRankLength: [1.12, 1.04, 0.98, 0.92, 0.88, 0.84],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.03, 0.97, 0.93, 0.9, 0.88, 0.86],
  /** Spec 域扩展节 A apical_dominance：**弱**（伞形开展冠无强单领导枝——FRPS 伞形
   *  Verified [1] + form-a [7]）——领导枝弱 0.42（家族低档（triadica 0.48 中庸偏弱
   *  /栾树 slot-4 0.42 低档带），伞形顶由上带骨架链共构、领导不翻转树顶（T009.3 弱
   *  领导翻转警示的安全带内）——slot-0 = 0.48（家族弱-中庸低带：vs 栾树 slot-0 0.50 /
 *  乌桕 0.48，伞形顶由上带骨架链共构）。**Step 3 探针记档（2026-09-21）**：10m 级领导链
   *  复利外伸实测同先例量级（银杏 ×1.8 于 8m 级 / 栾树 ×1.8 于 10m 级 / 悬铃木 ×1.9
   *  于 12m 级），槽间种子实现的涌现高度差由各槽领导比回调定档（终测带见 asset 模块
   *  头，回调记档同 platanus/koelreuteria/triadica 先例）。【重阳木特有定档依据 =
   *  Spec apical_dominance 弱 Verified [1]+Inferred [7]；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.48,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；7 L1 下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝横展微垂 [7] 由 levels.upturn 低值
   *  链承载——方法恒同，长度比沿用家族量级）。 */
  lengthRatioBase: 0.42,
  lengthRatioSpan: 0.15,
  /** L1 0.62 通体锥度（大枝粗壮 [7]——骨架级通体粗壮，家族带内）。工程设定（Spec 无
   *  重阳木锥度数值）。 */
  endRatio: [0.62, 0.6, 0.6, 0.6, 0.6],

  // 冠内通透（中密-中疏基调——推断中-疏通透 Spec §3 + young-a 幼树中密 [7] 的中带）
  /** Spec §3 / 域扩展节 B crown_transparency：**推断中-疏**（开展冠 + 大叶层叠；form-a
   *  三月相枝结构清晰但生长季叶幕 Unknown——本 Spec 最大缺口）+ young-a/young-b 幼树
   *  中密 [7] → **中带 0.90**（vs triadica 0.88 最疏带 / koelreuteria 1.0 中-疏带——
   *  大叶层叠（单复叶展幅 20–30cm 级）的中密读向）。slot-0 = 0.90 基准（疏密差异归
   *  槽 6/7；空隙量级由中卡量 + 大空腔域 + 壳带参数承载）。【canopyDensity 类 = 家族
   *  共性候选；基调读向 = 重阳木特有（中-疏推断 + 幼树中密双源中带）】 */
  canopyDensity: 0.9,
  /** Spec 域扩展节 B crown_fill_gradient Unknown（生长季成树冠内样张缺失——本 Spec
   *  最大结构缺口）——外密内疏为家族方向沿用（八实例同向）；重阳木壳带取 0.50
   *  （中带——大叶层叠的外密读向，Spec §3「中绿大叶层叠 + 疏松开展冠缘」）。
   *  【连续形态参数；值 = 重阳木特有（工程设定）】 */
  crownShellStart: 0.5,
  /** 芯层起点与地板值：Spec §3「疏松通透、枝结构清晰」（form-a 三月相 [7]——生长季
   *  推断）→ 芯层地板 0.07（开网不空透——中带）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.07,
  /** 规则①（枝干通道：主干大枝进冠不被封死——「疏松通透、枝结构清晰」[7] 的「透」侧
   *  承载）；数值工程设定（10m 伞形冠通道带随冠尺度，比例沿家族量级）。 */
  channelRadius: 0.48,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：中-疏通透读向的冠内空隙表达之一）。【结构计数类：槽间恒等】
   *  数量工程设定（家族沿用 3——空腔尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域大档（0.52–0.90：中带大空隙——中-疏通透的读向表达；vs 悬铃木
   *  0.50–0.85 / 栾树 0.50–0.88 / 乌桕 0.52–0.92 的中带族）。值 = 重阳木特有；半径域
   *  机制 = 家族共性候选。 */
  voidRadiusMin: 0.52,
  voidRadiusMax: 0.9,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；重阳木「叶簇」= **末级枝互生
  // 平展散布中卡簇**（中簇 0.17–0.23 + 每簇 8 候选复叶中卡黄金角互生螺旋散布平摊）=
  // 三出复叶卡挂点语言；无花果承载位（Step 1 判定 C——L5 簇位表即全部挂点语义））
  /** Spec §4/域扩展节 B leaf_attachment_rule：**三出复叶互生散生**（互生 = 照片弱
   *  单源 Inferred [7] + 科通则；三出 = Verified [1][3]）非簇生——叶沿末级枝全长
   *  散布。簇位数 L5=2 + L4=1（家族沿用——「末级枝外段 + 枝端」的散布位点，外段
   *  下限 0.45 起（互生沿枝全长散布的映射同 platanus/triadica 口径)）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——末级枝叶组挂外段受光区；长总柄平展摊开的
   *  站位带）。 */
  clusterInnerStartL5: 0.45,
  clusterInnerStartL4: 0.4,
  /** Spec §2/域扩展节 B leaf_size + clump_scale：真复叶全展幅 ≈20–30cm（总柄 9–13.5 +
   *  小叶 5–14cm 计算，Spec §3 叶幕质感）× ≈1.4 工程映射（011.6 复叶映射系数沿用
   *  ——复叶 SDF 满幅绘制三叶场、无单叶卡叶缘余量需求）→ 卡长 0.28–0.42 / 卡宽
   *  0.21–0.315（比例 0.75 冻结）⇒ **中簇半径 0.17–0.23**（末级枝复叶组布置球——
   *  先例量级带中档（vs 悬铃木 0.20–0.30/栾树 0.24–0.34 大卡族、triadica 0.11–0.16
   *  中卡族之间的中卡中簇语义）；卡体伸出球外由复叶卡本体覆盖）；L4 簇 ×1.2 承接
   *  更粗末级枝——家族沿用。【簇半径比类 = 家族共性候选；绝对量级 = 重阳木特有
   *  （复叶第二型中卡中簇）】 */
  clusterRadiusMinL5: 0.17,
  clusterRadiusSpanL5: 0.06,
  clusterRadiusScaleL4: 1.2,
  /** 工程设定（家族沿用——短枝梢簇随之缩小的 cap 语义：L5 枝长 ~0.4–0.6m 下 cap
   *  0.24–0.36，簇半径实际由 cap 主导）。 */
  clusterRadiusLengthCap: 0.6,
  /** Spec 域扩展节 B leaf_cluster_density「1 复叶/挂点散布语言；密度以复叶展幅 + 冠
   *  通透共同表达」+ 互生散布平摊读向——簇级显式剔除的间距保险：0.55（triadica
   *  0.54 同档中簇间距：簇心距 ≥ 0.55×(ri+rj) ≈ 0.19–0.28m，簇间间隙读向；挂点
   *  rng/复叶卡 rng 无条件消费后丢弃，确定性不破）。【间距机制 = 家族共性候选；
   *  值 = 重阳木特有（散布平摊中档）】 */
  clusterMinSeparation: 0.55,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 8 = **中卡簇候选数**（互生复叶语言的卡尺度合并抽象：真复叶沿枝互生
   *  节距与卡长 0.28–0.42 的连续节位合并，每簇 8 候选 = triadica 中卡同档中量
   *  （朴/樟密簇 18 与悬铃木疏簇 5 之间）——「中密大叶层叠」Spec §3 的工程映射；
   *  通透过滤后逐簇存活典型 4–7 枚）；黄金角互生螺旋方位在 8 候选间成立（φ_j =
   *  j×137.5°——互生叶序螺旋语言继承 platanus）。8 槽簇位 945（L4 189×1 + L5
   *  378×2，7 L1 拓扑）× 8 卡的 High 实测（2026-09-21 终测）：保留簇 383–461（簇级
   *  剔除 484–562）× 通透存活 → 卡 **2052–3097**（slot-6 疏松最低 / slot-7 丰满最高）
   *  → High 总面 **28282–30372** = 皮 24178 + 卡 4104–6194 落家族行 [27000, 40000]
   *  带内（**复叶中卡中量语义**：单卡面积 ≈0.09m² 中值 vs 栾树 0.36 ×0.25——同覆盖
   *  率下卡数天然高于栾树大卡、密度语义由中卡数量承载，High 参考下沿 = 重阳木自己的
   *  实测带下沿 27000 记档——同 platanus/栾树/triadica 先例口径；正式锁定带见 asset
   *  模块头预算账目）。【每簇叶量类 = 家族共性候选；绝对值 = 重阳木特有（互生散布
   *  中量抽象 + 实测定档）】 */
  clusterLeavesL5: 8,
  clusterLeavesL4: 8,
  /** 外壳偏置 ∈ (0,1]：散布平摊——簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^γ)
   *  取 0.42（triadica 0.42 同档：互生复叶沿末级枝散布非壳聚团——r̂ ∈ [0.58, 1] 的
   *  宽域均匀分布，簇心即枝梢位；「多向摊开层叠」域扩展节 B 的平摊读向）。【壳偏置
   *  机制 = 家族共性候选；值 = 重阳木特有（互生散布平摊读向）】 */
  clusterShellBias: 0.42,
  clusterShellGamma: 0.9,
  /** Spec §2/域扩展节 B leaf_size + Step 1 判定 B 冻结：真复叶全展幅 20–30cm（总柄
   *  9–13.5cm + 小叶 5–14cm Verified [1][3] 的展幅计算）× ≈1.4 工程映射 → **卡长
   *  0.28–0.42m** ⇒ **卡宽 = 0.75 × 卡长 = 0.21–0.315m**（宽/长比 0.75 冻结——
   *  三出展幅放射对称宽于栾树羽叶 0.60；先例口径：栾树 0.38–0.56 大卡 / triadica
   *  0.08–0.14 中卡之间的中卡档）。【卡尺寸域类 = 家族共性候选；绝对量级 = 重阳木
   *  特有（复叶第二型整叶卡）；卡宽域槽间不动（叶身份）】 */
  leafWidthMin: 0.21,
  leafWidthSpan: 0.105,
  /** **三出复叶卡宽/长比冻结 0.75（主代理接口冻结，Step 1 判定 B）** → 长/宽
   *  aspect = 1/0.75 ≈ 1.3333 恒定、span = 0（尺寸抖动仅缩放不改比例——卡 v 轴 =
   *  总柄基 0 → 顶小叶尖 1，总柄裸段 v∈[0,0.35] 为材质 SDF 裸柄线域（bare 门控），
   *  三出复叶 SDF 按此比例设计——材质-几何冻结接口）。【长宽比域类 = 家族共性候选；
   *  恒值 = 重阳木特有（冻结接口——复叶系第二个恒比例卡，0.60 → 0.75 的展幅分化）】 */
  leafAspectMin: LEAF_ASPECT_TRIFOLIATE,
  leafAspectSpan: 0,

  // 树皮近景微起伏（重阳木特有分化：**褐-深灰褐纵裂深沟宽脊 + 裂纹扭转中-深浮雕**——
  // 第 9 树皮语言；FRPS「树皮褐色，厚6毫米，纵裂」Verified [1] + bark-a（73 年生）
  // 「脊宽沟深、裂纹扭曲交错/主干扭转感」[7] + bark-b（中龄）「纵浅裂窄脊」[7]——
  // 建模取中龄档沟深中-深；vs 夏栎脊沟 0.033/樟纵裂 0.036/银杏浅-中纵裂 0.030/乌桕
  // 窄裂 0.027/朴浅斑 0.016/榉-悬铃木光滑 0.014–0.015/栾最浅 0.013 八分化中**中-深
  // 档（0.028）**——**褐色基调/宽脊扭转纹/细枝皮孔色序主体在材质侧**
  // （bischofiaMaterials 配方层），geometry 只管纵裂浮雕起伏）
  /** 纵裂深沟宽脊中-深浮雕锚定 0.028（中-深档——triadica 0.027 附近自定（主代理
   *  Step 1 判定）；bark-a「深纵裂宽脊」老龄端 ↔ bark-b「纵浅裂」幼端的中龄中-深带
   *  [7]——主干基环半径 ≈0.30–0.37m（Step 3 域）→ 峰幅度 ≈8.4–10.3mm（志书皮厚
   *  6mm [1] 的起伏量级域）。亚视觉地板联动（bischofiaGeometry 抬档 3.5mm）：0.028
   *  下起径 <0.125m 的管平滑发射——L1 骨架起径 0.09–0.10 亦在地板下：**仅主干有效
   *  起伏**、全部分枝管光滑（「细枝红褐-灰褐较光滑带皮孔」fruit-c/bark-a [7] 的
   *  几何侧读向——皮孔与色序归材质层）。【幅度 ∝ 半径量级挂钩 = 家族共性候选沿用；
   *  绝对值 = 重阳木特有（中-深档）】槽间恒等（barkRelief 非形态差异维度——slot-0
   *  定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.028,
    /** 宽脊低谐波：k∈{3,4,5}（宽脊 = 低谐波量级（主代理 Step 1 判定）——bark-a「脊宽
     *  沟深」[7] 的周向语言：周向 3–5 条宽脊，vs 银杏 {4,5,6} 多一道细脊、乌桕
     *  {3,4,5} 窄脊同 k 宽脊差由幅度+游走复合；≤ 主干 radial 14 的奈奎斯特域 7 留
     *  2 档边际——家族同款边际纪律）。【谐波语言 = 重阳木特有定档（宽脊低谐波）】 */
    harmonics: [3, 4, 5],
    /** 轴向游走基率 6.5 rad/m（**中-高扭转档**——裂纹**扭转**：bark-a「裂纹扭曲
     *  交错/主干扭转感」[7]——轴向去相关 ≈2π/6.5 ≈ 0.97m：扭转交错的短程去相关读向，
     *  游走强于顺直脊沟族（银杏 2.6/樟 3.2/乌桕 2.8 纵脊长程连续）与栾局部细裂 5、
     *  弱于悬铃木/榉断裂拼贴 11（轴向去相关 0.57m）——「纵裂 + 扭转」复合的中间偏
     *  高档）。【游走机制 = 家族共性候选；速率值 = 重阳木特有（扭转中-高档）】 */
    drift: 6.5,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 5（14/2=7 ≥ 5+2 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown——flare 1.18 轻度沿家族常量，Step 3 微调归几何））。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 branching_levels
   *  Inferred [7]）的家族五级方法沿用，级数槽间不动。姿态分级为重阳木两段枝姿语言：
   *  **下带大枝近水平开展 + 上带斜上 + 端部小枝斜上收口 + 冠缘细枝横展微垂**（FRPS
   *  「大枝斜展」Verified [1] + form-a 双问 [7] + winter-fruit 细枝横展微垂 [7]）——
   *  upturn [0.10,0.09,0.07,0.05,0.03] 单调递减低正链：骨架级低正（两带角位已由
   *  SCAFFOLD_BAND 承载，upturn 链低正承载端部收口与冠缘摊平）+ 末级低值 0.03
   *  （**冠缘微垂读向由末级低值 + 下带 90° 上限 + 游走复合承载**——不建负链下垂
   *  语言，终审裁决 2 同口径，区别栾树 L5 −0.02 枝梢微下垂）；wander 骨架级 0.10
   *  **中高游走**（大枝虬曲 form-a [7]——vs 先例 0.08–0.09 略抬档）+ 末级乱幅 0.35
   *  家族量级；分级单调性保持。各级数值工程设定（方向 Spec Verified [1] + Inferred
   *  [7]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.1 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.09 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.07 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.05 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.03 },
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
 * slot-1 挺拔组合（009.3 语法复制）：**速生上探窄端**——终审裁决 1「速生上探 12m
 * 变体入高位槽」（长江中下游行道速生读向 [1][7] + FRPS 上限 15m）+ 冠幅比幅度窄端的
 * 槽位化（同带混植的速生年轻相个体）。组合：冠幅比 0.58（**Step 3 探针终测
 * （2026-09-21）**：规范种子涌现 **w/h = 0.733** 贴工程域 0.7–1.0 下沿（速生窄冠
 * 个体读向）；**伞形两段角的叶幕绝对宽度种子方差大（面板 ±20%）——速生窄端以
 * w/h 比 + 高度方向承载身份（面板高度带 9.8–11.7 均值 ≈10.6，全种子高于 slot-2
 * +1.4–2.0m），绝对宽度方向断言以规范种子承载（bischofiaShapeSlots 测试记档）**）+
 * 冠高比升（0.76 速生纵域长）+ **两段角域整体上移**（scaffoldAngleMin/Max 49–69——
 * 带位漂移后下带 64–84 / 上带 34–54：速生相下带不全平展、上带更斜上）+ 挂高段上移
 * 收窄（0.68–0.82 干高段 span 0.14——速生高挂点）+ 领导枝偏强（0.50——速生
 * excurrent 端；终测涌现树高 10.73 为 8 槽最高——12m 上探域内的速生变体读向）+
 * crownTopBias 转正（0.08 速生顶密）+ upturn 链 ×1.3（直立相）。两段带位结构不动
 * （SCAFFOLD_BAND 几何常数槽间恒等——同种语言，速生窄伞而非柱冠）。
 */
const BISCHOFIA_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...BISCHOFIA_SLOT0_PROFILE,
  crownWidthRatio: 0.58,
  crownCenterRatio: 0.64,
  crownHeightRatio: 0.76,
  crownTopBias: 0.08,
  scaffoldAngleMin: 49,
  scaffoldAngleMax: 69,
  scaffoldAttachMin: 0.68,
  scaffoldAttachSpan: 0.14,
  scaffoldRankLength: [1.08, 1.02, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.5,
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.13 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.12 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.09 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.07 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.04 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：**幼龄开张宽端**——young-a（南京九月幼树）
 * 「冠幅 ≥ 高的开展圆头」[7] 的开张端（Spec §6 幼龄开张度轴：幼龄更开张 ↔ 成树
 * 0.8–1.0 的开张带上沿个体）。组合：冠幅比 0.44（**Step 3 探针终测（2026-09-21）**：
 * 规范种子涌现 **w/h = 0.992** 贴 Spec 域 0.8–1.0 上沿（young-a「冠幅 ≥ 高」域内
 * 读向 [7]）+ 冠高比降（0.54 扁伞端）+ 冠心降（0.52——冠最宽带下压）+ **两段角域
 * 整体下移**（51–71——带位漂移后下带 66–86 / 上带 36–56：开张相下带更近水平）+
 * 挂高段下移放宽（0.50 起 span 0.30——低分枝开张）+ 首枝 rank 主导强（×1.26）+
 * crownTopBias 负（−0.12 顶部平展伞形）+ 领导枝 0.38（**幼龄开张更弱顶**——矮冠
 * 扁伞个体，终测涌现树高 9.72 为宽冠矮端）。
 */
const BISCHOFIA_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...BISCHOFIA_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  crownCenterRatio: 0.52,
  crownHeightRatio: 0.54,
  crownTopBias: -0.12,
  scaffoldAngleMin: 51,
  scaffoldAngleMax: 71,
  scaffoldAttachMin: 0.5,
  scaffoldAttachSpan: 0.3,
  scaffoldRankLength: [1.26, 1.05, 0.95, 0.87, 0.81, 0.77],
  scaffoldRankRadius: [1.06, 0.97, 0.91, 0.87, 0.84, 0.81],
  leaderLengthRatio: 0.38,
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：
 * 散布互生骨架的方位强弱分化（骨架排列 Unknown [7]——散布口径使偏侧势差更自由）+
 * 冠形个体开张度幅度（Spec §6）——方向采信；幅度工程设定）。组合：asymmetry 升
 * （0.52——散布骨架的方位大抖动；偏侧相干性由 rank 主导承载）+ scaffoldRankLength
 * 首枝 ×1.62 / 弱势 ×0.74（一侧枝展压倒性——首枝质量占比 0.32，配 5 弱枝近均分 →
 * 质心稳定指向首枝方位；榉 ×1.50/悬铃木 ×1.62/栾 ×1.78/乌桕 ×1.62 同构量级带）+
 * scaffoldRankRadius 同向（×1.10）+ 冠幅比 0.42 容纳域（**Step 3 探针终测
 * （2026-09-21）**：涌现 w/h = 0.957 带内上段 + 规范种子质心绝对偏移 1.20m / 面板
 * 均值比 1.45——偏侧枝展的质心偏移读数见测试）+ 角域贴标准微扩（57–77）。其余
 * 维度贴标准（偏冠 = 方位维差异）。
 */
const BISCHOFIA_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...BISCHOFIA_SLOT0_PROFILE,
  crownWidthRatio: 0.42,
  crownCenterRatio: 0.58,
  asymmetry: 0.52,
  scaffoldAngleMin: 57,
  scaffoldAngleMax: 77,
  scaffoldAttachMin: 0.6,
  scaffoldAttachSpan: 0.26,
  scaffoldRankLength: [1.62, 1.04, 0.94, 0.86, 0.79, 0.74],
  scaffoldRankRadius: [1.1, 0.96, 0.92, 0.88, 0.85, 0.82],
  leaderLengthRatio: 0.42,
};

/**
 * slot-4 低冠组合（009.3 语法复制）：低分枝点开张个体——干高 0.25–0.33 域（form-a
 * 1/4–1/3 双问 [7]）的下段端读向。组合：挂高段下移放宽（attachMin 0.46 + span
 * 0.28——低分枝 + 挂高段松散）+ 冠心降（0.54）+ crownTopBias 负（−0.10 底密）+
 * 两段角域下移（57–77 → 下带 72–92 更近水平/上带 42–62）+ 姿态下压（levels upturn
 * ×0.6——开展弱化端、冠缘摊平；分级单调性保持）+ 簇半径微升（0.19–0.25 低开张
 * 中簇偏大）+ 领导枝 0.44（低冠槽冠体量推持——探针定档见 asset 模块头终测带）+
 * 冠幅比 0.42（**Step 3 探针终测（2026-09-21）**：涌现 w/h = 0.816 带内；涌现视觉
 * 冠底 0.161——低带端）。**高冠槽冠底差同 seed 实测 1.84m**（干高端槽对向展开
 * 记档，读数见 shapeSlots 测试）。
 */
const BISCHOFIA_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...BISCHOFIA_SLOT0_PROFILE,
  crownWidthRatio: 0.42,
  crownCenterRatio: 0.54,
  crownHeightRatio: 0.64,
  asymmetry: 0.46,
  crownTopBias: -0.1,
  scaffoldAngleMin: 57,
  scaffoldAngleMax: 77,
  scaffoldAttachMin: 0.46,
  scaffoldAttachSpan: 0.28,
  scaffoldRankLength: [1.16, 1.03, 0.96, 0.9, 0.86, 0.82],
  scaffoldRankRadius: [1.03, 0.96, 0.92, 0.89, 0.87, 0.85],
  leaderLengthRatio: 0.44,
  clusterRadiusMinL5: 0.19,
  clusterRadiusSpanL5: 0.06,
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.06 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.05 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.04 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.03 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.02 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制）：高分枝清干个体——干高 0.25–0.33 域上段端（公园
 * 清干修剪语境的自然变体——公园修剪相 Unknown 结构缺口的带内上侧展开）。组合：挂高段
 * 上移收窄（attachMin 0.78 + span 0.10——高挂点 + 挂高段集中）+ 冠心升（0.64）+
 * crownTopBias 转正（0.06 顶密）+ 领导枝 0.46（高冠槽树高读向偏高与身份同向——探针
 * 定档见 asset 模块头终测带）+ 两段角域上移（51–71 → 下带 66–86/上带 36–56）+
 * 姿态上举（levels upturn ×1.3；分级单调性保持）+ 冠高比降（0.58 高挂点纵域收窄）+
 * 冠幅比 0.42（**Step 3 探针终测（2026-09-21）**：涌现 w/h = 0.779 带内）+
 * asymmetry 降（0.40）。
 */
const BISCHOFIA_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...BISCHOFIA_SLOT0_PROFILE,
  crownWidthRatio: 0.42,
  crownCenterRatio: 0.64,
  crownHeightRatio: 0.58,
  asymmetry: 0.4,
  crownTopBias: 0.06,
  scaffoldAngleMin: 51,
  scaffoldAngleMax: 71,
  scaffoldAttachMin: 0.78,
  scaffoldAttachSpan: 0.1,
  scaffoldRankLength: [1.1, 1.03, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.46,
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.13 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.12 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.09 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.06 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.04 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透疏端——推断中-疏通透（Spec §3 crown_
 * transparency Inferred——生长季成树样张缺失的中-疏读向 + form-a「疏松通透、枝结构
 * 清晰」[7]）的疏侧。组合：canopyDensity 0.82（**Step 3 探针定档（2026-09-21
 * 实测）**：Mid 总面 6092 贴家族行下沿 6000 余量锁定（复叶中卡 Mid 掩码 8 选 3 下
 * 叶面基数中档——低密度端保留下沿余量）；疏密对比维持（规范种子卡数比 slot-7
 * 实测 0.663、同 seed 0.688））+ crownShellStart ↑（0.56 壳带更薄）+ crownCoreStart
 * ↓（0.10）+ coreDensityFloor ↓（0.04——「疏松通透」的疏端）+ 空腔半径域 ↑
 * （0.60–1.02 大空隙）+ clusterMinSeparation ↑（0.60 疏簇更散）+ clusterShellBias ↓
 * （0.36 散布更宽）+ 领导枝 0.42（多枝共构开张端 + 回落与 slot-1 的「最高」身份分离
 * ——终测涌现树高 10.16）+ 冠幅比 0.48（涌现 w/h = 0.772 带内）。
 */
const BISCHOFIA_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...BISCHOFIA_SLOT0_PROFILE,
  crownWidthRatio: 0.48,
  canopyDensity: 0.82,
  crownShellStart: 0.56,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.04,
  voidRadiusMin: 0.6,
  voidRadiusMax: 1.02,
  clusterMinSeparation: 0.6,
  clusterShellBias: 0.36,
  leaderLengthRatio: 0.42,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密团冠端——中密带的密侧（young-a/young-b 幼树
 * 中密 [7] + 中龄生长季满冠个体）。组合：canopyDensity 0.94（**Step 3 探针复核
 * （2026-09-21 实测 High 30372）**——簇 8 候选高保留 3097 卡 + 皮面 24178 落带内
 * 上段；先例同款预算校准流程：朴 0.93/樟 0.94/榉 0.92/银杏 0.92/悬铃木 slot-7
 * 0.92/栾 0.92/乌桕 0.94 定档）+ crownShellStart ↓（0.44 满密壳带更厚）+
 * crownCoreStart ↑（0.16）
 * + coreDensityFloor ↑（0.10 团冠感）+ 空腔半径域 ↓（0.42–0.74）+
 * clusterMinSeparation ↓（0.48 簇更密）+ clusterShellBias ↑（0.48 簇更实）+ 冠幅/
 * 冠高比 0.44 / 0.68（团冠体量）+ 领导枝 0.46（团冠顶密带内——探针定档见 asset
 * 模块头终测带）。
 */
const BISCHOFIA_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...BISCHOFIA_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  crownHeightRatio: 0.68,
  canopyDensity: 0.94,
  crownShellStart: 0.44,
  crownCoreStart: 0.16,
  coreDensityFloor: 0.1,
  voidRadiusMin: 0.42,
  voidRadiusMax: 0.74,
  clusterMinSeparation: 0.48,
  clusterShellBias: 0.48,
  leaderLengthRatio: 0.46,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；重阳木沿
 * Spec §6 幅度轴展开：速生上探窄端（slot-1——终审裁决 1 变体域）/ 幼龄开张宽端
 * （slot-2——young-a 冠幅 ≥ 高 [7]）/ 偏冠端（slot-3）/ 干高端（slot-4/5——干高
 * 0.25–0.33 域两侧）/ 疏密端（slot-6/7——中密带两端））。slot-1…7 以 slot-0 锚点为
 * 底的差量展开定义——**结构计数类字段（trunk/levels radial/segs、childPlan、簇位数、
 * 每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/长宽比域由展开继承逐位恒等**（皮面数
 * 恒等 24178 与 rng 消费次数恒等的结构性保证——**无花果挂点（Step 1 判定 C）→ 无
 * 附加账目口径**，消费全在骨架/簇/通透 roll）；**三出复叶卡比例 0.75 全槽恒定**
 * （冻结接口）；barkRelief 槽间恒等（spread 继承）。morphSeed 路由见
 * assets/asset_tree_bischofia.asset。
 */
export const BISCHOFIA_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  BISCHOFIA_SLOT0_PROFILE,
  BISCHOFIA_SLOT1_PROFILE,
  BISCHOFIA_SLOT2_PROFILE,
  BISCHOFIA_SLOT3_PROFILE,
  BISCHOFIA_SLOT4_PROFILE,
  BISCHOFIA_SLOT5_PROFILE,
  BISCHOFIA_SLOT6_PROFILE,
  BISCHOFIA_SLOT7_PROFILE,
];
