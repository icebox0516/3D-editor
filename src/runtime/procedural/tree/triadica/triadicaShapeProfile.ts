/**
 * runtime/procedural/tree/triadica/triadicaShapeProfile —— 乌桕 shapeProfile 数值面
 * （T011.7 Step 1 + Step 2，阔叶家族契约第八实例——方法复制自夏栎第一实例经朴树
 * （T011.1）/香樟（T011.2）/榉树（T011.3）/银杏（T011.4）/悬铃木（T011.5）/栾树
 * （T011.6）七次验证的通路：../koelreuteria/koelreuteriaShapeProfile 同构——最新
 * 方法复制模板）。
 *
 * 职责：乌桕（Triadica sebifera (Linnaeus) Small，大戟科乌桕属（Triadica Loureiro，
 * FOC Vol.11 现口径自 Sapium sect. Triadica 升格；旧口径 Sapium sebiferum (Linn.)
 * Roxb. FRPS 44(3):14 作文献检索别名记档——命名切换链见 Spec §1 种定名判定）、
 * **长江流域城市公园夏绿落叶乔木**（建模目标相 = 生长季夏季绿叶相；秋色红/白蜡种子
 * 相为身份标志但非夏季主相——记档不建模，同 011.6 秋叶纪律））枝干/冠层结构的形态
 * 参数**数值面**——类型契约 = 阔叶家族契约 ../broadleaf/broadleafShapeProfile
 * （BroadleafShapeProfile，零修改第八实例化；字段语义、【阔叶共性候选】标注、T009.3
 * 消费语义与槽间恒等纪律见家族文件）。**七先例的数值是证据不是家族真理**，本文件全部
 * 数值依据 docs/research/triadica-reference.md（Spec Version 1.0——生产取用版 =
 * 正文 + 文末「终审记档（主代理）」：④生产口径终版建议为准；树高锚 ≈9–10m 带内中值
 * **主代理裁定 slot-0 取 ≈9.5m**、外缘枝姿微垂由末级 upturn 低值 + 冠缘平展承载
 * （终审裁决 2——不建下垂枝语言）、冠幅比域 0.8–1.0 维持（终审裁决 3））乌桕自己的
 * 现实事实重定；下方逐字段标注【家族共性候选】沿用 /【乌桕特有】新证据 / 工程设定
 * （无现实基准不编造依据）。方法恒同纪律（T011.7 任务书）：五级拓扑 L1–L5、叶簇挂
 * 末两级 L4/L5、结构计数类跨槽恒等、rng 无条件消费、LOD 三档同流派生整体复制，乌桕
 * 只换数值与算法细节（几何侧差异点归 triadicaGeometry Step 3 交付，逐条 Spec 引用见
 * 其模块头）。
 * 边界：乌桕资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_triadica.asset，Step 3 交付）；比率
 *      字段以 totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0（含终审记档）× 七先例方法基线对照，三栏落档；改写项
 *    逐条映射实现面；主代理 Step 1 判定为执行依据）──
 *
 * ■ 可继承项（家族方法原样沿用，乌桕证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——乌桕分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [7]）落在家族五级口径内（夏栎先例同款包含关系）；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown，域扩展节 A 全组 Unknown），家族方法沿用；
 *   3. 冠内通透三规则——乌桕外密内疏（家族沿用方向；Spec crown_fill_gradient
 *      Unknown——无冠内仰观样张）+ 枝干通道 + 局部空腔（**空隙 40–55%** form-b 单源
 *      Inferred [7]——七实例最疏带，取中带不极端）；
 *   4. 枝梢驱动叶簇——家族「簇挂末两级枝梢」映射同向（挂点语言的乌桕分化见改写项 1）；
 *   5. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   6. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡 / 附加元素 Low 省略
 *      档间连续记档——platanus 果序先例）；
 *   7. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   8. 尺度锚中龄公园 ≈9.5m（**主代理裁定**：终审两读取中庸 + 文献域 NC 30–40ft =
 *      9–12m → 生产域 8–12m 维持 Inferred、slot-0 锚 ≈9–10m 带内中值 9.5——速生开展
 *      等幅冠：低于悬铃木 12m 大乔、与栾树 ≈10m 相当、高于夏栎 8m；中国公园单干样木
 *      缺失为 Spec 最大结构缺口，随 Step 4 取证可补）。
 *
 * ■ 按乌桕改写项（每条映射实现面）：
 *   1. **互生单叶「中卡簇」挂点语言（乌桕独有身份，Spec §4/域扩展节 B
 *      leaf_attachment_rule：单叶互生、散生于枝（一年生枝为主）非簇生非短枝簇——
 *      FRPS「叶互生」Verified [1] + FOC "Leaves alternate" [3] + 照片三源 [7]）**：
 *      挂点单位 = 1 枚具长柄菱形叶（真叶 3–9(13)×3–9cm Verified [1][3] + 柄 2.5–6cm
 *      ≈ 等叶长「纤细飘逸」[1][3][5]——颤动飘逸感来源）→ 卡宽 **0.08–0.14m**（真叶
 *      ×≈2 工程映射，先例口径）× **卡长宽比（长/宽）0.8–1.2 近等宽**（FOC 检索表
 *      "nearly as long as wide" Verified [4]——菱形本质；vs 悬铃木 0.70–0.90 宽>长
 *      反向族）——家族第七种叶形语言（菱形/菱状卵形）；簇 = 末级枝叶组布置球（半径
 *      0.11–0.16——先例量级带中档）+ **簇内互生螺旋方位**（φ_j = j×137.5° + 抖动——
 *      互生叶序方位语言继承 platanus）+ **每簇 8 候选中量**（介于朴/樟密簇 18 与悬铃木
 *      疏簇 5 之间——「叶中细质、量大轻盈」[5][7] 的工程映射：真节距与卡尺度合并抽象，
 *      通透过滤后逐簇存活典型 4–7 片）；簇内大间距/壳偏置按「散布平摊」读向（platanus
 *      同向——互生沿枝散布非壳聚团）；取向平展摊开略前倾（PLANE_LIFT/FORWARD_TILT/
 *      WOBBLE 归 triadicaGeometry 常量）；无长短枝二型（银杏双挂点语言不适用）；菱形
 *      轮廓/骤尖尾头/全缘/基部阔楔-浅心/腺体细节全部归 triadicaMaterials SDF/材质层
 *      （几何不建模——模块头不建模清单）；
 *   2. 冠形语言：**开展圆头（rounded-spreading）**——大枝广展 45–90°（FRPS「枝广展」
 *      Verified [1] + 照片双源数值 [7]）+ 末级细枝上举 20–30°（bark-c 判读 [7]）+
 *      **冠缘微垂读向**（终审裁决 2——由末级 upturn 低值 + 冠缘平展承载，不建下垂枝
 *      语言）+ 顶部圆化不规则（form-a「开展-圆形树冠、顶部微圆穹、轮廓不规则圆滑」[7]）
 *      → 实现：**干向挂点高度分级**（SCAFFOLD_LENGTH_TAPER ×1.10→×0.74 低枝长高枝短
 *      + SCAFFOLD_ANGLE_TAPER 低枝 +12…14° 平展（冠基放张）/ 高枝 −6…−8° 收角（圆头
 *      闭合）——确定性零 rng，platanus 先例方法复制）+ **广角骨架**（50–68° 对铅垂——
 *      「广展 45–90°」域中带，七实例最开展起角带）+ upturn 链低正递减（[0.20,…,0.08]
 *      ——末级低值承载冠缘平展/微垂读向）+ 散布方位（螺旋互生散布——骨架排列
 *      Unknown [7]）+ 领导中庸偏弱（0.48——apical_dominance 中庸-弱 [7]，开展圆头顶
 *      由骨架链共构、领导不翻转树顶）+ crownTopBias 微负（顶部圆化）；
 *   3. 冠幅比：Spec §3/域扩展节/终审裁决 3 **0.8–1.0（开展等幅族——七实例最宽端带）**
 *      ——NC 0.75 下限 + form-a/b ≈1.0 双源；slot 展开端容纳 1.0 读向；crownWidthRatio
 *      参数探针定档（T009.3 口径——外泄系数实测回写，见字段注释）；
 *   4. 净干占比：Spec 域扩展节 A trunk_height_ratio **0.15–0.25（form-a 宅院开放生长低
 *      分枝相单源 Inferred）/ 公园单干相 Unknown（结构缺口）**——主代理带内推 0.15–0.30
 *      → 挂高段 0.50–0.70 干高段 span 0.20 + 干高参数域 0.17–0.26（geometry rng 域）
 *      承载（低分枝方向，速生开展种同向 koelreuteria form-b 先例量级）；
 *   5. 骨架数：Spec 域扩展节 A scaffold_branch_count Unknown（form-a 弱读 3–5 主枝不
 *      承重）+ 开展等幅冠的多枝平展读向 → **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 枝数
 *      [7,21,63,189,378]、簇位 945（L4 189×1 + L5 378×2）、皮面 24178——9.5m 开展冠
 *      的中卡中量预算留带内余量，账目见 clusterLeaves 注释）；
 *   6. **绿闭蒴果序（Spec 判定做——§4 果序姿态与账目重点问题 Verified [1][3][5][7]，
 *      终审 ③-5 复核 + ④ 生产口径）**：夏季相树上果 = **绿色闭合小蒴果**（径 1–1.5cm
 *      梨状球形三室——四月绿幼果 → 七月末绿闭果簇挂枝顶三源证据链）×2 工程映射 → 径
 *      ≈2.4–3.0cm（半径 0.012–0.015m）；**沿弯垂总状轴散挂枝顶/冠缘外段**（顶生花序
 *      语言 [1][3]——果期轴弯垂 [7]；区别 platanus 冠下缘垂挂点缀与 koelreuteria 冠缘
 *      灯笼串）；每轴 2–4 果、步距沿轴散布非密串（果序至 28cm [3] 的散布读向）；总量
 *      按「显著性低-中」克制（中距可辨但不主导——悬铃木 84–131 球量级下调，探针定）；
 *      **账目法沿先例**：入组 0（皮组）+ **uv v∈[4,5] 果域**（platanus 终版口径，u =
 *      逐果熟度 roll ∈ [0,1) 位置散列——材质绿果变奏通道）+ aLeafRand/aBend 恒 0（刚
 *      性）+ **确定性账目零 rng**（koelreuteria 先例优先——保留 L5 簇位冠外域判据 +
 *      位置散列排序 + 固定步长抽选，规避 platanus rng roll 组 0 带状浮动）+ **皮管弧长
 *      域不得侵入 [4,5)**（9.5m 级最长枝弧 ×0.5 ≈ ≤2.1——隔离带空 + 果域顶点数断言，
 *      triadicaStructure 测试锁）；八面体最小面数 8 tri/果（platanus 果球方法复制）；
 *      Mid 保留（身份信号）/ Low 省略记档（远距亚像素）；**花不做**（黄绿穗色近叶弱
 *      显著、牺牲顺位第 3——记档模块头不建模清单）；白蜡种子相不做（非夏季主相，同
 *      秋色纪律记档）；
 *   7. 树皮（第 8 语言「暗灰-灰褐窄纵裂 + 窄条翘皮」——第 8 = 夏栎1 朴2 樟3 榉4 银杏5
 *      悬铃木6 栾树7 乌桕8，收尾轮编号笔误修正）：FRPS「树皮暗灰色，有纵裂纹」
 *      Verified [1] + FOC 幼干灰绿纵纹→老干浅褐 [3] + NC 窄条翘皮 [5] + 照片四源 [7]
 *      ——中龄档 = 灰褐浅-中纵裂。**幅度 ≈0.027**（中-深端：参考带 朴 0.016 浅 /
 *      悬铃木-榉 0.014–0.015 光滑族 / 银杏 0.030 / 夏栎 0.033 / 樟 0.036——浅-中裂到
 *      中裂带，探针定）+ 谐波 **{3,4,5} 纵脊族**（窄纵脊——vs 银杏 {4,5,6}/夏栎 {3,4,5}
 *      同族）+ drift **2.8 rad/m 低值连续**（纵裂连续族 2–3.5 rad/m——轴向去相关
 *      ≈2.2m 纵脊长程连续；区别悬铃木/榉断裂拼贴 11）；**暗色调/窄条翘皮/幼干灰绿/
 *      地衣银斑主体让渡材质层**（triadicaMaterials 配方），geometry 只管中-深浮雕起伏；
 *   8. 密度语言：**中-疏轻盈**（空隙 40–55% form-b 单源 Inferred [7]——取中带 45–50%，
 *      别做极端疏；七实例最疏带）→ crownShellStart 0.50 + coreDensityFloor 0.06（开网）
 *      + 大空腔 0.52–0.92 + 疏密差异归槽 6/7；
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开（差异轴：冠幅比 0.8–1.0 两端（开展等幅↔收窄）
 *      / 干高端（0.15 低冠 ↔ 0.30 高冠）/ 偏冠 / 疏密 / 幼相-老龄端（幼相冠幅窄密、
 *      老龄开展圆头）/ **叶形相轴微调**（菱形主相 ↔ 阔卵端——只动卡长宽比连续域
 *      （slot-1 菱形端 0.78–1.10 / slot-2 阔卵端 0.88–1.26），**结构计数恒等、卡宽域
 *      槽间不动**（叶身份——尺寸域锁，长宽比微调为 Spec §6 叶形相轴的工程承载））。
 *      结构计数类（radial/segs/childPlan/簇位数/每簇候选/voidCount/scaffoldCount/果序
 *      账目口径）跨槽恒等；皮面数恒等；rng 消费口径槽间恒等。**多干/萌生变体不进
 *      8 槽**（Spec §3 单干↔多干轴现象 Verified 频率 Unknown——结构差异不落连续参数，
 *      platanus 低位双主枝/koelreuteria 多干同款纪律记档）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_taper_ratio / basal_flare_ratio（域扩展节 A 均 Unknown）——干形锥度与
 *      根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. DBH 典型值 Unknown（Spec §2 照片判 8–12m 中龄 ≈20–40cm 无标尺推断）——根径
 *      0.26–0.32m 工程设定（9.5m 速生中龄个体，Step 3 探针校）；
 *   3. branch_angle 度数 / scaffold_angle 度数——「枝广展」定性 Verified [1] + 照片
 *      45–90° Inferred [7]，起角取域中带工程默认（记档分级：定性 Verified / 度数
 *      工程默认）；末级上举 20–30° 单源照片 Inferred [7]（bark-c）——upturn 链低值
 *      工程幅度承载；
 *   4. branch_length_decay / branch_radius_decay / branch_attachment_t /
 *      allometry_exponent——家族量级工程设定（干向挂点高度分级为工程语言，非实证数值）；
 *   5. 芽（域扩展节 C Unknown——志书无芽描述）、冠层密度梯度（crown_fill_gradient
 *      Unknown 无冠内仰观样张——外密内疏为家族方向沿用）、果序冠面覆盖率定量（Spec
 *      结构性缺口——定性链足：绿闭果小、散生-簇挂、显著性低-中）——不建模/不承重记档；
 *   6. 生长速率数值（NC "Rapid" [5] 定性 Verified）——9.5m 锚的龄级推断以主代理裁定
 *      为准。
 *
 * 不建模记档（Spec 有事实、工程不表达）：菱形/菱状卵形轮廓细节/骤尖长尾尖/全缘/基部
 *      阔楔-钝或浅心/侧脉 6–10(12) 对弯拱网结/网脉偏黄（Verified [1][3][4][5]——归
 *      triadicaMaterials 菱形叶 SDF 与脉纹层）；**叶柄 2.5–6cm 与柄顶 2 腺体**（毫米级
 *      ——FRPS/FOC Verified [1][3][4][5] + 照片近景可辨 [7]，**归材质层**（triadica
 *      Materials 腺体表达候选），几何不建柄不建腺体——卡抽象先例口径）；托叶 1mm
 *      （恒不可见）；**花**（顶生总状黄绿穗 6–20cm——色近叶弱显著、牺牲顺位第 3，
 *      主代理判定不做，记档）；**白蜡种子相**（种子黑 8mm 外被白蜡假种皮「爆米花」
 *      ——最强身份标志但属夏末起-冬相，非夏季建模主相，同秋色纪律记档）；**秋色红**
 *      （猩红-绯红-橙-黄多色并存 Verified [5][6][7]——季相归材质/风格层）；新叶铜红
 *      flush（冠内零星点缀 [7]——归材质变奏候选）；小枝亮绿皮孔色序（Verified [1][3]
 *      [7]——归材质层）；地衣银斑（弱单源 [7] 不承重——归材质候选）；乳状汁液/毒性
 *      （非形态）；多干/萌生（现象 Verified 频率 Unknown——结构差异不落连续参数记档）；
 *      品种/栽培变体。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：长江流域公园夏绿单干中龄个体 ≈9.5m 量级（主代理
 * 裁定——9–10m 带内中值）、**开展圆头冠**（广角骨架 + 干向挂点分级 + 散布方位 + 领导
 * 中庸偏弱 + 末级 upturn 低值承载冠缘平展/微垂读向）、**菱形中卡**（卡宽 0.08–0.14 ×
 * 长宽比 0.8–1.2 近等宽）**互生散布中卡簇**（每簇 8 候选黄金角螺旋）、冠内通透中-疏
 * 轻盈（空隙 40–55% 带中带）、**绿闭蒴果序沿弯垂轴散挂冠缘**（确定性零 rng 账目）。
 * T009.3 教训沿用：视觉冠底由挂高段（scaffoldAttachMin/Span）+ 横展角 + upturn + 领导
 * 枝链涌现，不由 crownCenterRatio；开展圆头剪影由干向挂点高度分级（长度 + 角度双梯度，
 * triadicaGeometry）+ 广角 + 散布方位涌现。结构计数类（trunk/levels radial/segs、
 * childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）全槽恒等；**卡宽域槽间不动
 * （叶身份）；卡长宽比域在叶形相轴槽（slot-1/2）微调**（Spec §6 相轴的工程承载——
 * 连续域微调、结构计数恒等）；果序挂点口径 [triadicaGeometry 常数] 槽间恒等。
 */
export const TRIADICA_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节 / 终审裁决 3：冠幅/树高比 **≈0.8–1.0（开展等幅族——七实例
   *  最宽端带；NC 0.75 下限 Verified [5] + form-a/b ≈1.0 双源 Inferred [7]）**；slot
   *  展开端容纳 1.0 读向。**Step 3 探针回推定档（2026-09-21
   *  实测）**：初值 0.42 期涌现 w/h = 0.571 大幅低于域下沿（外泄 ×1.36——广角骨架水平
   *  伸长但中卡簇内收于冠参数域、开展等幅需冠参数直推），参数终值 0.62 终测涌现
   *  **w/h = 0.861** 落工程域 0.8–1.0 中带；8 槽带 0.700–0.986（slot-1 幼相窄端
   *  0.700 微出下沿——幼相窄冠个体读向记档，platanus slot-1 0.543 先例口径 / slot-7
   *  丰满端 0.986 贴上沿）。【冠幅比类 = 家族共性候选沿用；锚值 = 乌桕特有（工程域 +
   *  实测外泄系数回推——探针定档记录，非编造）】 */
  crownWidthRatio: 0.62,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；开展圆头冠体中心中带——
   *  低分枝 0.17–0.26 + 冠高 0.70 的参考系，圆头闭合由骨架侧驱动链承载）。 */
  crownCenterRatio: 0.6,
  /** 工程设定（同上；开展圆头冠纵域参考系——顶部圆化不规则由 crownTopBias 微负 +
   *  高枝收角 + 末级 upturn 低值共构）。 */
  crownHeightRatio: 0.7,
  /** Spec 域扩展节 A branch_orientation Unknown（无轮生/对生口径证据）+ 叶互生
   *  Verified [1][3]——**螺旋互生散布**为七实例主流读向沿用。slot-0 = 0.46（散布端
   *  ——方位均分步进 + 大抖动 → 互生散布读向）。【散布机制 = 家族共性候选沿用；幅度
   *  = 乌桕特有（散布口径 [7] 弱 + 工程默认）】 */
  asymmetry: 0.46,
  /** Spec §3「开展-圆形树冠、顶部微圆穹、轮廓不规则圆滑」（form-a Inferred [7]）
   *  ——圆头顶的密度场高度向微负偏置；几何顶圆化由高枝收角 + 末级 upturn 低值承载。
   *  【乌桕特有定档依据 = Spec §3 冠形重点问题 Inferred [7] + 园艺 Rounded Verified
   *  [5]；幅度工程设定】 */
  crownTopBias: -0.04,

  // 骨架
  /** Spec 域扩展节 A scaffold_branch_count Unknown（form-a 弱读 3–5 主枝不承重 [7]）+
   *  开展等幅冠多枝平展读向 → slot-0 = **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 簇位 945 /
   *  皮面 24178——9.5m 开展冠的中卡中量预算余量，账目见 clusterLeaves 注释）。
   *  【结构计数类：槽间恒等；取 6 = 工程默认（Unknown 域 + 多枝开展读向带内）】 */
  scaffoldCount: 6,
  /** Spec 域扩展节 A scaffold_angle：**广展 45–90°**（FRPS「枝广展」Verified [1] +
   *  照片双源数值 45–90° Inferred [7]——七实例最开展起角带证据）。slot-0 = 50–68°
   *  （域中带——vs 悬铃木 36–54 / 栾树 40–56：广展开展读向）；干向角度梯度（低枝
   *  +12…14° 平展——冠基放张 / 高枝 −6…−8° 圆头闭合，triadicaGeometry
   *  SCAFFOLD_ANGLE_TAPER）在本域上叠加（低枝外段可达 60–80° 近平展——「枝广展」
   *  45–90° 域内）。【乌桕特有（定性 Verified [1] + 数值 Inferred [7] 双源 + 度数域
   *  中带工程默认）】 */
  scaffoldAngleMin: 50,
  scaffoldAngleMax: 68,
  /** Spec 域扩展节 A trunk_height_ratio **0.15–0.25（form-a 单源 Inferred [7]）/
   *  公园相 Unknown（结构缺口）**——主代理带内推 0.15–0.30 的挂高段实现：挂点
   *  0.50–0.70 干高段 span 0.20（trunk 参数域 0.17–0.26 × H）——低分枝方向的工程域
   *  中带；T009.3：挂高段下缘 + 横展角 + upturn + 领导链共同涌现视觉冠底。**Step 3
   *  探针回推（2026-09-21 实测）**：涌现视觉冠底/实高 **0.219**（8 槽带 0.123–0.256
   *  ——低冠/高冠槽展开（slot-2 老龄低挂端 0.123 / slot-1 幼相高挂端 0.256；slot-4
   *  0.139 / slot-5 0.207——净干槽对向展开）；主代理带 0.15–0.30 带内为主、开展端
   *  低挂个体带外推记档）。【乌桕特有（单源 Inferred 域 + 带内推 + 探针回推实测）】 */
  scaffoldAttachMin: 0.5,
  scaffoldAttachSpan: 0.2,
  /** 工程设定（branch_radius_decay Unknown、DBH 典型值 Unknown（照片 20–40cm 无标尺
   *  推断 [7]）；9.5m 速生中龄个体比例瘦干读向取 0.54——家族带内，待视觉验收校）。 */
  scaffoldThickness: 0.54,
  /** rank 长度乘子（6 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用；
   *  散布互生骨架的环内势差——偏冠槽加大首枝势差承载）。 */
  scaffoldRankLength: [1.12, 1.04, 0.98, 0.92, 0.88, 0.84],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.03, 0.97, 0.93, 0.90, 0.88, 0.86],
  /** Spec 域扩展节 A apical_dominance：**中庸-弱**（无强单领导枝、开展圆头冠、照片
   *  crown 多主枝平展 Inferred [7]）——领导中庸偏弱 0.48（开展圆头顶由骨架链共构、
   *  领导不翻转树顶（T009.3 弱领导翻转警示的安全带内））。**Step 3 探针记档
   *  （2026-09-21）**：9.5m 级领导链复利外伸（实测领导比 ±0.1 → 涌现树高 ±0.8–1.2m
   *  ——先例银杏 ×1.8 于 8m 级、栾树 ×1.8 于 10m 级、悬铃木 ×1.9 于 12m 级的同量级
   *  带），槽间种子实现的涌现高度差由各槽领导比回调定档（终测 8 槽涌现带 9.08–10.14
   *  收进 ≈9.5m 锚域 +7%——回调记档同 platanus/koelreuteria 先例）。【乌桕特有定档
   *  依据 = Spec apical_dominance 中庸-弱 Inferred [7]；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.44,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；7 L1 下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级细枝上举 20–30° [7] 由 levels.upturn
   *  低值链承载——方法恒同，长度比沿用家族量级）。 */
  lengthRatioBase: 0.42,
  lengthRatioSpan: 0.15,
  /** L1 0.64 通体锥度（骨架枝广展开展直伸——与悬铃木开展族同量级；branch_curvature
   *  「大枝广展平展 + 末级上举」Inferred [7] 由姿态字段承载）。工程设定（Spec 无乌桕
   *  锥度数值）。 */
  endRatio: [0.64, 0.6, 0.6, 0.6, 0.6],

  // 冠内通透（中-疏轻盈基调——空隙 40–55% 带中带，七实例最疏带）
  /** Spec §3 / 域扩展节 B crown_transparency：**中-疏轻盈**——空隙 ≈40–55%（form-b
   *  「叶幕覆盖 45–60%」单源 Inferred [7]；「细碎质感 + 开放空隙」[7] + medium
   *  texture [5] 多源读向承托）。slot-0 = 0.88 基准（七实例最低密度基准——空隙 40–55%
   *  带中带的密度映射；疏密差异归槽 6/7；空隙量级由中卡量 + 大空腔域 + 薄壳带参数
   *  联合承载）。【canopyDensity 类 = 家族共性候选；基调读向 = 乌桕特有（中-疏单源
   *  Inferred [7]——取中带不极端）】 */
  canopyDensity: 0.88,
  /** Spec 域扩展节 B crown_fill_gradient Unknown（无冠内仰观样张）——外密内疏为家族
   *  方向沿用（七实例同向）；乌桕壳带取 0.50（中带——轻盈通透下外壳满密带中等、向内
   *  快速衰减，配合中卡散布覆盖语义）。【连续形态参数；值 = 乌桕特有（工程设定）】 */
  crownShellStart: 0.5,
  /** 芯层起点与地板值：Spec §3「开放空隙」[7] + 「轻盈通透」读向 → 芯层地板 0.06
   *  （七实例开网最透端——与银杏 0.06 同档）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.06,
  /** 规则①（枝干通道：主干大枝进冠不被封死——「开放空隙」[7] 的「透」侧承载）；
   *  数值工程设定（9.5m 冠通道带随冠尺度，比例沿家族量级）。 */
  channelRadius: 0.45,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：中-疏 40–55% 空隙读向的冠内空隙表达之一）。【结构计数类：槽间
   *  恒等】数量工程设定（家族沿用 3——空腔尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域大档（0.52–0.92：疏端大空隙——空隙 40–55% 带中带的读向表达；vs 悬铃木
   *  0.50–0.85 / 栾树 0.50–0.88 的中带微放）。值 = 乌桕特有；半径域机制 = 家族共性
   *  候选。 */
  voidRadiusMin: 0.52,
  voidRadiusMax: 0.92,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；乌桕「叶簇」= **末级枝互生
  // 散布中卡簇**（中簇 0.11–0.16 + 每簇 8 候选中卡黄金角互生螺旋散布平摊 + L5 簇位
  // 果序承载位）= 互生单叶「中卡簇」挂点语言）
  /** Spec §4/域扩展节 B leaf_attachment_rule：**单叶互生、散生于枝（一年生枝为主）
   *  非簇生**（FRPS「叶互生」Verified [1] + FOC "Leaves alternate" [3] + 照片三源
   *  [7]）——叶沿末级枝全长散布。簇位数 L5=2 + L4=1（家族沿用——「末级枝外段 +
   *  枝端」的簇位点，外段下限 0.45 起（互生叶沿枝全长散布的映射同 platanus 口径））。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——末级枝叶组挂外段受光区；散布平摊的站位带）。 */
  clusterInnerStartL5: 0.45,
  clusterInnerStartL4: 0.4,
  /** Spec §2/域扩展节 B leaf_size + clump_scale：真叶 3–9(13)×3–9cm（FRPS/FOC 双志
   *  Verified [1][3] + 照片交叉 [7]）×≈2 工程映射（先例口径）→ 卡宽 0.08–0.14 ⇒
   *  **中簇半径 0.11–0.16**（末级枝叶组布置球——先例量级带中档：夏栎 0.11–0.15/朴
   *  0.10–0.14/樟 0.11–0.15/榉 0.09–0.125/银杏 0.085–0.125 同档，vs 悬铃木 0.20–0.30/
   *  栾树 0.24–0.34 大卡疏簇族——中卡中簇语义）；L4 簇 ×1.2 承接更粗末级枝——家族
   *  沿用。【簇半径比类 = 家族共性候选；绝对量级 = 乌桕特有（中卡中簇）】 */
  clusterRadiusMinL5: 0.11,
  clusterRadiusSpanL5: 0.05,
  clusterRadiusScaleL4: 1.2,
  /** 工程设定（家族沿用——短枝梢簇随之缩小的 cap 语义：L5 枝长 ~0.4–0.6m 下 cap
   *  0.24–0.36，簇半径实际由 cap 主导）。 */
  clusterRadiusLengthCap: 0.6,
  /** Spec 域扩展节 B leaf_cluster_density「单叶/挂点（散生语言）；密度以叶量与叶柄长
   *  共同表达」+ 散布平摊读向——簇级显式剔除的间距保险：0.54（platanus 0.55 同档——
   *  中簇间距：簇心距 ≥ 0.54×(ri+rj) ≈ 0.12–0.19m，簇间间隙读向；挂点 rng/叶片 rng
   *  无条件消费后丢弃，确定性不破）。【间距机制 = 家族共性候选；值 = 乌桕特有（散布
   *  平摊中档）】 */
  clusterMinSeparation: 0.54,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 8 = **中卡簇候选数**（互生单叶语言的卡尺度合并抽象：真叶沿枝互生密节距
   *  × 卡宽 ≈0.08–0.14 ⇒ 数节/卡宽的连续节位合并，每簇 8 候选 = 介于朴/樟密簇 18 与
   *  悬铃木疏簇 5 之间的中量——「叶中细质、量大轻盈」[5][7] 的工程映射；通透过滤后
   *  逐簇存活典型 4–7 片）；黄金角互生螺旋方位在 8 候选间成立（φ_j = j×137.5°——
   *  互生叶序螺旋语言继承 platanus）。8 槽簇位 945（L4 189×1 + L5 378×2，7 L1 拓扑）
   *  × 8 卡的 High 实测（2026-09-21 终测）：保留簇 472–584（簇级剔除 361–473）× 通透
   *  存活 → 卡 2578–3980（slot-6 疏松最低 / slot-2 丰满最高）→ High 总面 29862–32786
   *  = 皮 24178 + 卡 5156–7960 + 果序 480–672（60–84 果 × 8）落家族行 [29000, 40000]
   *  带内（**中卡中量语义**：单卡面积 ≈0.011m² 中值 vs 悬铃木 0.10 ×0.11——同覆盖率
   *  下卡数天然高于大卡资产、密度语义由中卡数量承载，High 参考下沿 = 乌桕自己的实测
   *  带下沿记档——同 platanus/栾树先例口径）。【每簇叶量类 = 家族共性候选；绝对值 =
   *  乌桕特有（互生散布中量抽象 + 实测定档）】 */
  clusterLeavesL5: 8,
  clusterLeavesL4: 8,
  /** 外壳偏置 ∈ (0,1]：散布平摊——簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^γ)
   *  取 0.42（platanus 0.42 同档：互生叶沿末级枝散布非壳聚团——r̂ ∈ [0.58, 1] 的宽域
   *  均匀分布，簇心即枝梢位；「散布平摊」读向 platanus 同向）。【壳偏置机制 = 家族
   *  共性候选；值 = 乌桕特有（互生散布平摊读向）】 */
  clusterShellBias: 0.42,
  clusterShellGamma: 0.9,
  /** Spec §2/域扩展节 B leaf_size：真叶宽 3–9cm（FRPS/FOC 双志 Verified [1][3]——
   *  3–9(13)×3–9 域的典型带）×≈2 工程映射（先例口径：银杏 0.10–0.16/朴 0.07–0.11/
   *  樟 0.06–0.095/榉 0.04–0.06/夏栎 0.08–0.13 同档小卡族——vs 悬铃木 0.30–0.44 大
   *  卡）→ **卡宽 0.08–0.14m**（探针定档）。【卡尺寸域类 = 家族共性候选；绝对量级 =
   *  乌桕特有（菱形中卡——卡宽域槽间不动，叶身份）】 */
  leafWidthMin: 0.08,
  leafWidthSpan: 0.06,
  /** Spec 域扩展节 B leaf_aspect_ratio：**长/宽 ≈0.8–1.2（近等宽——菱形本质）**
   *  （FOC 检索表 "nearly as long as wide" Verified [4]——sebifera 支差分特征）→
   *  卡长宽比（长/宽）= **0.80–1.20**（近等宽中带——vs 悬铃木 0.70–0.90 宽>长反向
   *  族、栾树 1.6667 复叶长轴族）。**叶形相轴槽（slot-1/2）微调**：slot-1 菱形端
   *  0.78–1.10 / slot-2 阔卵端 0.88–1.26（Spec §6 叶形相轴：菱形主相 ↔ 阔卵-心形端
   *  Verified 相存在 [1][3][5][7]——连续域微调、结构计数恒等、卡宽域不动）。
   *  【长宽比域类 = 家族共性候选；域值 = 乌桕特有（近等宽菱形口径）】 */
  leafAspectMin: 0.8,
  leafAspectSpan: 0.4,

  // 树皮近景微起伏（乌桕特有分化：**暗灰-灰褐窄纵裂 + 窄条翘皮中-深浮雕**——第 7 树皮
  // 语言「暗色窄纵裂翘皮」；FRPS「树皮暗灰色，有纵裂纹」Verified [1] + FOC 幼干灰绿
  // 纵纹→老干浅褐 [3] + NC "peel off in vertical, narrow strips" [5] + 照片四源 [7]；
  // vs 夏栎脊沟 0.033/樟纵裂 0.036/银杏浅-中纵裂 0.030/朴浅斑 0.016/榉-悬铃木光滑
  // 剥落 0.014–0.015/栾最浅 0.013 七分化中**浅-中裂到中裂带（0.027）**——**暗色调/
  // 窄条翘皮/幼干灰绿/地衣银斑主体在材质侧**（triadicaMaterials 配方层），geometry
  // 只管纵裂浮雕起伏）
  /** 窄纵裂中-深浮雕锚定 0.027（主代理带 0.024–0.030 探针定——中龄档「灰褐浅-中
   *  纵裂」（bark-b 较小树浅纵裂 ↔ bark-c 深纵脊沟的龄级中带 [7]）；纵裂脊窄沟中——
   *  幅度高于银杏 0.030 的浅-中端一档之下？否——0.027 落银杏 0.030 与朴 0.016 之间
   *  的中裂带，峰值幅度 ≈7.0–8.6mm、同环极差 ≈10–14mm——近景窄纵裂脊沟可辨、中景
   *  剪影连续）。亚视觉地板联动：0.027 下起径 <0.056m 的管平滑发射——主干 + L1 骨架
   *  （起径 0.09–0.11）有效起伏（窄纵裂显于粗干 [1][5]）、L2 以下细枝光滑。【幅度 ∝
   *  半径量级挂钩 = 家族共性候选沿用；绝对值 = 乌桕特有（浅-中裂到中裂带）】槽间恒等
   *  （barkRelief 非形态差异维度——slot-0 定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.027,
    /** 窄纵脊谐波：k∈{3,4,5}——纵脊族（周向 3–5 条窄纵脊——「窄纵裂」脊窄沟中的
     *  周向密度语言；与夏栎 {3,4,5} 同族、vs 银杏 {4,5,6} 多一道细脊——窄条翘皮的
     *  脊密度中档；≤ 主干 radial 14 的奈奎斯特域 7 留 2 档边际——家族同款边际纪律）。
     *  【谐波语言 = 乌桕特有定档（窄纵裂纵脊族——主代理 {3,4,5} 或 {4,5,6} 带内取
     *  {3,4,5}：低 k 主导 = 脊更少更窄长，窄条翘皮读向）】 */
    harmonics: [3, 4, 5],
    /** 轴向游走基率 2.8 rad/m（**纵裂连续族低值**——主代理带 2–3.5 内取：轴向去相关
     *  ≈2π/2.8 ≈ 2.24m——纵裂长脊沿轴长程连续读向（银杏 2.6 纵脊连续 / 香樟 3.2 同
     *  族），区别悬铃木/榉断裂拼贴 11（轴向去相关 0.57m）与栾局部细裂 5——窄纵裂的
     *  脊连续性工程映射）。【游走机制 = 家族共性候选；速率值 = 乌桕特有（纵裂连续
     *  低值带）】 */
    drift: 2.8,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 5（14/2=7 ≥ 5+2 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown——flare 1.18 轻度沿家族常量，Step 3 微调归几何））。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 branching_levels
   *  Inferred [7]）的家族五级方法沿用，级数槽间不动。姿态分级为乌桕两段枝姿语言：
   *  **大枝广展平展 + 末级细枝上举 20–30° + 冠缘微垂读向**（FRPS「枝广展」Verified
   *  [1] + bark-c 判读 [7] + 终审裁决 2）——upturn [0.20,0.17,0.14,0.11,0.08] 单调
   *  递减低正链：骨架级中低（广展平展——横枝外伸为主）+ 末级低值 0.08（末级上举由
   *  低正 upturn + 游走复合，冠缘平展/微垂读向由末级低值承载——不建负链下垂语言，
   *  区别栾树 L5 −0.02 枝梢微下垂）；wander 骨架级 0.09 略游走（开展自然）+ 末级乱幅
   *  0.35 家族量级（「细碎质感」[7]）；分级单调性保持。各级数值工程设定（方向 Spec
   *  Verified [1] + Inferred [7]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.2 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.17 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.14 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.11 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.08 },
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
 * slot-1 挺拔组合（009.3 语法复制）：幼相窄密端——幼相个体读向（Spec §6 幼相-老龄
 * 轴幼端：幼相冠幅窄密、**叶形相轴菱形端**——叶形联动「菱形端偏小」[1][3][7] 的
 * 工程承载：卡长宽比域微调 0.78–1.10（菱形窄端），**卡宽域不动（叶身份）、结构计数
 * 恒等**）。组合：冠幅比降（0.55——Step 3 探针回推（2026-09-21 实测）：涌现 0.700
 * 微出工程域 0.8–1.0 下沿——幼相窄冠个体读向记档（platanus slot-1 0.543 微出下沿
 * 先例口径）；同 seed 展开/挺拔叶幕宽度比实测 1.38——槽
 * 身份可辨）+ 冠高比升（0.78 幼相纵域长）+ 横展角收窄上举（40–56° 幼相直立性强）+
 * 挂高段上移收窄（0.60–0.72 干高段 span 0.12——幼相高挂点）+ 领导枝偏强（0.52——
 * 幼相 excurrent 较强端；实测涌现树高 9.08 落锚域下段——本槽种子的领导链实现差、
 * 幼相体量偏小读向与身份同向）+ crownTopBias 转正（0.10
 * 幼相顶密）+ upturn 链 ×1.1（幼相上举）+ canopyDensity 升（0.94 幼相密——「幼相
 * 冠幅窄密」主代理判定）。upturn 分级结构不动（同种语言——窄圆头而非柱冠）。
 */
const TRIADICA_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...TRIADICA_SLOT0_PROFILE,
  crownWidthRatio: 0.55,
  crownCenterRatio: 0.64,
  crownHeightRatio: 0.78,
  crownTopBias: 0.1,
  canopyDensity: 0.94,
  scaffoldAngleMin: 40,
  scaffoldAngleMax: 56,
  scaffoldAttachMin: 0.6,
  scaffoldAttachSpan: 0.12,
  scaffoldRankLength: [1.08, 1.02, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.52,
  leafAspectMin: 0.78, // 叶形相轴·菱形端（Spec §6——连续域微调，卡宽域不动）
  leafAspectSpan: 0.32,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.22 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.19 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.16 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.12 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.09 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：老龄开展圆头宽端——开展等幅读向（Spec §6 幼相-
 * 老龄轴老端：老龄开展圆头 + **叶形相轴阔卵端**——「卵形-心形端偏大」联动 [1][3][5]
 * [7] 的工程承载：卡长宽比域微调 0.88–1.26（阔卵端），**卡宽域不动（叶身份）、结构
 * 计数恒等**）。组合：冠幅比升（0.58——Step 3 探针回推（2026-09-21 实测）：涌现
 * 0.953 落工程域 0.8–1.0 上带（外泄 ×1.64——广角 + 低枝平展 + 长度分级全开的宽端
 * 外泄；「开展圆头、冠幅≈高」form-a ≈1.0 读向 [7]）+ 冠高比降（0.62 扁圆头端）+
 * 冠心降（0.56——冠最宽带下压向挂点段）+ 横展角大（56–74° 开张端——工程域内宽端
 * 外推，「枝广展 45–90°」域内 [1][7]）+ 挂高段下移放宽（0.40 起 span 0.26——低
 * 分枝开张）+ 外层 upturn 微收（冠缘摊平）+ 领导枝 0.54（开张端领导中庸带内上推——本槽
 * 种子的领导下垂链实现差，初值 0.46 实测涌现树高 8.88 越锚域下沿（9.5m 级领导链
 * 复利外伸的种子实现差异，见 slot-0 leaderLengthRatio 探针记档），上推后 10.04 落
 * 锚域上段——老龄大冠个体体量读向，开张语义由横展角/挂高段/冠形参数承载，记档）+ 首枝 rank 主导强（×1.26）+ crownTopBias 负
 * （−0.10 顶部圆化平展）。
 */
const TRIADICA_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...TRIADICA_SLOT0_PROFILE,
  crownWidthRatio: 0.58,
  crownCenterRatio: 0.56,
  crownHeightRatio: 0.62,
  crownTopBias: -0.1,
  scaffoldAngleMin: 56,
  scaffoldAngleMax: 74,
  scaffoldAttachMin: 0.4,
  scaffoldAttachSpan: 0.26,
  scaffoldRankLength: [1.26, 1.05, 0.95, 0.87, 0.81, 0.77],
  scaffoldRankRadius: [1.06, 0.97, 0.91, 0.87, 0.84, 0.81],
  leaderLengthRatio: 0.54,
  leafAspectMin: 0.88, // 叶形相轴·阔卵端（Spec §6——连续域微调，卡宽域不动）
  leafAspectSpan: 0.38,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.16 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.14 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.11 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.09 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.07 },
  ],
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：
 * 散布互生骨架的方位强弱分化（骨架排列 Unknown [7]——散布口径使偏侧势差更自由）+
 * 冠形个体开张度幅度（Spec §6）——方向采信；幅度工程设定）。组合：asymmetry 升
 * （0.52——散布骨架的方位大抖动；偏侧相干性由 rank 主导承载）+ scaffoldRankLength
 * 首枝 ×1.62 / 弱势 ×0.74（一侧枝展压倒性——首枝质量占比 0.32，配 5 弱枝近均分 →
 * 质心稳定指向首枝方位；榉 ×1.50/悬铃木 ×1.62/栾 ×1.78 同构量级带）+
 * scaffoldRankRadius 同向（×1.10）+ 冠幅比 0.56 容纳域（Step 3 探针回推（2026-09-21
 * 实测）：涌现 0.770 带内下段——偏侧枝展的质心偏移读数见下）+ 横展角域微扩（52–70°）+
 * 挂高段贴标准。其余维度贴标准（偏冠 = 方位维差异）。**Step 3 探针实测**：6 种子
 * 面板质心均值比 1.802（散布骨架偏冠读向——强于悬铃木 1.208、同栾树 1.673 量级带）；
 * 规范种子绝对偏移 1.03m（slot-0 规范种子质心 0.28m 居中——绝对读数为主口径）。
 */
const TRIADICA_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...TRIADICA_SLOT0_PROFILE,
  crownWidthRatio: 0.56,
  crownCenterRatio: 0.6,
  asymmetry: 0.52,
  scaffoldAngleMin: 52,
  scaffoldAngleMax: 70,
  scaffoldAttachMin: 0.5,
  scaffoldAttachSpan: 0.2,
  scaffoldRankLength: [1.62, 1.04, 0.94, 0.86, 0.79, 0.74],
  scaffoldRankRadius: [1.1, 0.96, 0.92, 0.88, 0.85, 0.82],
  leaderLengthRatio: 0.46,
};

/**
 * slot-4 低冠组合（009.3 语法复制 + 净干带下端）：低分枝点开张个体——净干占比
 * 0.15–0.30（form-a 15–20% 单源 Inferred [7] + 主代理带内推）的下段端个体
 * （form-a「净干仅 15–20% 全高」宅院开放生长低分枝相 [7]）。组合：挂高段下移放宽
 * （attachMin 0.38 + span 0.26——低分枝 + 挂高段松散）+ 冠心降（0.54）+
 * crownTopBias 负（−0.08 底密）+ 横展角大（54–72° 低枝开张平展）+ 姿态下压
 * （levels upturn ×0.75——开展弱化端、冠缘摊平；分级单调性保持）+ 簇半径微升
 * （0.13–0.18 低开张中簇偏大）+ 领导枝 0.54（低冠槽冠体量推大——Step 3
 * 探针定档：初值 0.42 实测涌现 8.09 越锚域下沿（9.5m 级链复利外伸的种子实现差异，
 * 见 slot-0 leaderLengthRatio 探针记档），上推后 9.87 落锚域上段；记档同 platanus
 * slot-4 0.48→0.40 先例的反向）+ 冠幅比 0.56（Step 3 探针回推（2026-09-21
 * 实测）：涌现 0.819 带内）。**涌现视觉冠底 0.139**（主代理带 0.15–0.30 下缘的
 * 低冠变体外推——低枝平展使叶幕自挂点下方展开；高冠槽冠底差同 seed 实测 0.94m）。
 */
const TRIADICA_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...TRIADICA_SLOT0_PROFILE,
  crownWidthRatio: 0.56,
  crownCenterRatio: 0.54,
  crownHeightRatio: 0.7,
  asymmetry: 0.46,
  crownTopBias: -0.08,
  scaffoldAngleMin: 54,
  scaffoldAngleMax: 72,
  scaffoldAttachMin: 0.32,
  scaffoldAttachSpan: 0.28,
  scaffoldRankLength: [1.16, 1.03, 0.96, 0.9, 0.86, 0.82],
  scaffoldRankRadius: [1.03, 0.96, 0.92, 0.89, 0.87, 0.85],
  leaderLengthRatio: 0.54,
  clusterRadiusMinL5: 0.13,
  clusterRadiusSpanL5: 0.05,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.15 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.13 },
    { radial: 6, segs: 5, wander: 0.2, upturn: 0.11 },
    { radial: 5, segs: 4, wander: 0.28, upturn: 0.08 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.06 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制 + 净干带上端）：高分枝清干个体——净干 0.15–0.30
 * 带上段端（公园清干修剪语境的自然变体——乌桕公园单干相 Unknown（结构缺口）的带内
 * 上侧展开）。组合：挂高段上移收窄（attachMin 0.70 + span 0.10——高挂点 + 挂高段
 * 集中）+ 冠心升（0.66）+ crownTopBias 转正（0.08 顶密）+ 领导枝 0.48（Step 3 探针
 * 定档：初值 0.52 链噪声越域后回调（9.5m 级链复利外伸的种子实现差异，见 slot-0
 * leaderLengthRatio 探针记档），终测涌现 9.26 落锚域中带——高冠槽树高读向偏高
 * 与身份同向）+ 横展角收（42–58°）+ 姿态上举（levels upturn ×1.1；分级单调性保持）+
 * 冠高比降（0.64 高挂点纵域收窄）+ 冠幅比 0.42（Step 3 探针回推（2026-09-21 实测）：
 * 涌现 0.818 带内）+ asymmetry 降（0.40）。**涌现视觉冠底 0.207**（主代理带
 * 0.15–0.30 中上带——高挂点变体，槽维度展开记档）。
 */
const TRIADICA_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...TRIADICA_SLOT0_PROFILE,
  crownWidthRatio: 0.58,
  crownCenterRatio: 0.66,
  crownHeightRatio: 0.64,
  asymmetry: 0.4,
  crownTopBias: 0.08,
  scaffoldAngleMin: 42,
  scaffoldAngleMax: 58,
  scaffoldAttachMin: 0.7,
  scaffoldAttachSpan: 0.08,
  scaffoldRankLength: [1.1, 1.03, 0.97, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.48,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.22 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.19 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.16 },
    { radial: 5, segs: 4, wander: 0.21, upturn: 0.12 },
    { radial: 4, segs: 3, wander: 0.27, upturn: 0.09 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透疏端——空隙 40–55% 带疏端（Spec §3
 * crown_transparency 单源 Inferred [7] 的疏侧：「开放空隙」大空隙 + 轻盈通透读向；
 * **果序承载轴的疏端**——资格簇数随密度参数收缩，果序轴数随槽平滑减少（确定性步长
 * 抽选的间接承载，家族契约无果序参数位记档——栾树同款））。组合：canopyDensity
 * 0.72（Step 3 探针定档（2026-09-21 实测）：Mid 总面 6968 贴家族行下沿 6000 余量锁定
 * （中卡 Mid 掩码 8 选 3 下叶面基数中档——低密度端保留下沿余量）；疏密对比维持
 * （同 seed 卡数比 slot-7 实测 0.772、规范种子 2578/3870 ≈ 0.666））+ crownShellStart
 * ↑（0.56 壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓（0.04——开放
 * 空隙的疏端）+ 空腔半径域 ↑（0.60–1.04 大空隙）+ clusterMinSeparation ↑（0.62
 * 疏簇更散）+ clusterShellBias ↓（0.36 散布更宽）+ 领导枝 0.52（多枝共构开张
 * 端，涌现树高 10.14 落锚域上段——本槽种子链实现偏高的带内读向）+ 冠幅比 0.60
 * （涌现 0.803 带内）。
 */
const TRIADICA_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...TRIADICA_SLOT0_PROFILE,
  crownWidthRatio: 0.6,
  canopyDensity: 0.72,
  crownShellStart: 0.56,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.04,
  voidRadiusMin: 0.6,
  voidRadiusMax: 1.04,
  clusterMinSeparation: 0.62,
  clusterShellBias: 0.36,
  leaderLengthRatio: 0.52,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密团冠端——空隙 40–55% 带内密端（Spec §3
 * 单源 Inferred [7] 的密侧 45% 端 + 中龄生长季满冠个体；**果序承载轴的密端**——
 * 资格簇数随密度参数扩张，果序轴数随槽平滑增多（间接承载记档同 slot-6））。组合：
 * canopyDensity 0.94（Step 3 探针复核（2026-09-21 实测 High 32550）——簇 8 候选
 * 高保留 3870 卡 + 果序 26 轴 79 果落带内上段；先例同款预算校准流程：朴 0.93/樟
 * 0.94/榉 0.92/银杏 0.92/悬铃木 slot-7 0.92 定档）+ crownShellStart ↓（0.44 满密
 * 壳带更厚）+ crownCoreStart ↑（0.16）+ coreDensityFloor ↑（0.09 团冠感）+ 空腔
 * 半径域 ↓（0.42–0.74）+ clusterMinSeparation ↓（0.48 簇更密）+ clusterShellBias
 * ↑（0.48 簇更实）+ 冠幅/冠高比 0.44 / 0.74（团冠体量，涌现 0.986——密簇端叶幕
 * 匀实读向）+ 领导枝 0.54（初值 0.44 实测涌现 8.19 越锚域下沿（9.5m 级链噪声，
 * 见 slot-0 leaderLengthRatio 探针记档），上推后 9.67 落锚域，记档）。
 */
const TRIADICA_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...TRIADICA_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  crownHeightRatio: 0.74,
  canopyDensity: 0.94,
  crownShellStart: 0.44,
  crownCoreStart: 0.16,
  coreDensityFloor: 0.09,
  voidRadiusMin: 0.42,
  voidRadiusMax: 0.74,
  clusterMinSeparation: 0.48,
  clusterShellBias: 0.48,
  leaderLengthRatio: 0.54,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；乌桕沿
 * Spec §6 幅度轴展开：幼相窄密端（slot-1——叶形相轴菱形端）/ 老龄开展圆头宽端
 * （slot-2——叶形相轴阔卵端）/ 偏冠端（slot-3）/ 净干端（slot-4/5——主代理带
 * 0.15–0.30 两侧）/ 疏密端（slot-6/7——空隙 40–55% 带两端 + 果序承载轴间接承载））。
 * slot-1…7 以 slot-0 锚点为底的差量展开定义——**结构计数类字段（trunk/levels
 * radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与卡宽域由
 * 展开继承逐位恒等**（皮面数恒等 24178 与 rng 消费次数恒等的结构性保证；**果序挂点
 * = 确定性账目零 rng**（triadicaGeometry 常数与判据）——槽间恒等无消费口径问题；
 * **卡长宽比域在 slot-1/2 叶形相轴微调**（Spec §6 相轴工程承载——连续域微调、结构
 * 计数与卡宽域不动））；barkRelief 槽间恒等（spread 继承）。morphSeed 路由见
 * assets/asset_tree_triadica.asset（Step 3 交付）。
 */
export const TRIADICA_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  TRIADICA_SLOT0_PROFILE,
  TRIADICA_SLOT1_PROFILE,
  TRIADICA_SLOT2_PROFILE,
  TRIADICA_SLOT3_PROFILE,
  TRIADICA_SLOT4_PROFILE,
  TRIADICA_SLOT5_PROFILE,
  TRIADICA_SLOT6_PROFILE,
  TRIADICA_SLOT7_PROFILE,
];
