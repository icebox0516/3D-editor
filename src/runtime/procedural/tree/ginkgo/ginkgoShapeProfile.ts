/**
 * runtime/procedural/tree/ginkgo/ginkgoShapeProfile —— 银杏 shapeProfile 数值面
 * （T011.4 Step 1 + Step 2，阔叶家族契约第五实例——方法复制自夏栎第一实例经朴树
 * （T011.1）/香樟（T011.2）/榉树（T011.3）四次验证的通路：../zelkova/zelkovaShapeProfile
 * 同构）。
 *
 * 职责：银杏（Ginkgo biloba Linn.，银杏科银杏属落叶乔木——**单科单属单种**活化石，
 *      种定名无争议 Verified [1][2]；**雄株口径**——城市绿化以嫁接雄株为主流三源一致
 *      Verified [4][5][6]，雌株果臭是雄株选育原因）枝干/冠层结构的形态参数**数值面**
 *      ——类型契约 = 阔叶家族 ../broadleaf/broadleafShapeProfile（BroadleafShapeProfile，
 *      零修改第五实例化；字段语义、【阔叶共性候选】标注、T009.3 消费语义与槽间恒等
 *      纪律见家族文件）。**夏栎/朴树/香樟/榉树的数值是证据不是家族真理**，本文件全部
 *      数值依据 docs/research/ginkgo-reference.md（Spec Version 1.0，含终审记档——
 *      form-a/b/c 三照片读数作废、干高占比降 Unknown、树高 ≈8m 为弱推断工程锚、冠幅比
 *      0.55–0.65 改由园艺域 + fall 整树异系统实测支撑，生产引用以终审 C 节为准）银杏
 *      自己的现实事实重定；下方逐字段标注【家族共性候选】沿用 /【银杏特有】新证据 /
 *      工程设定（无现实基准不编造依据；干高占比一类**工程设定·无实证**显式标注 per
 *      终审 C-3）。方法恒同纪律（T011.4 任务书）：五级拓扑 L1–L5、叶簇挂末两级 L4/L5、
 *      结构计数类跨槽恒等、rng 无条件消费、LOD 三档同流派生整体复制，银杏只换数值与
 *      算法细节（几何侧差异点归 ginkgoGeometry Step 3 交付，逐条 Spec 引用见其模块头）。
 * 边界：银杏资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_ginkgo.asset，Step 3 交付）；比率字段
 *      以 totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0 × 四先例方法基线对照，三栏落档；改写项逐条映射实现面）──
 *
 * ■ 可继承项（家族方法原样沿用，银杏证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——银杏分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [7]）落在家族五级口径内（夏栎先例同款包含关系）；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown），家族方法沿用；
 *   3. 冠内通透三规则——银杏外密内疏（Spec 域扩展节 B crown_fill_gradient Inferred [7]）
 *      + 枝干通道（内膛细枝网可见 [7]——通道不封死同向）+ 局部空腔（逆光空隙 25–35%
 *      Inferred [7]）；
 *   4. 枝梢驱动叶簇——银杏叶幕集中冠壳外段受光区（Spec 域扩展节 B leaf_attachment_rule
 *      Inferred [3][7]），短枝遍布冠内各级枝——家族「簇挂末两级枝梢」映射银杏「短枝
 *      莲座簇挂末两级枝梢」同向（挂点语言的银杏分化见改写项 1）；
 *   5. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   6. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡）；
 *   7. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   8. 尺度锚 ≈8m 中龄公园（Spec §2/终审 C-1：照片带尺度样木作废后，中龄树高 = 栽培
 *      域下段 + 同语境混植量级的**弱推断**，任务书 ≈8m 工程锚沿用——与夏栎/朴树/香樟/
 *      榉树同量级可混植，证据状态记推断不称实测）。
 *
 * ■ 按银杏改写项（每条映射实现面）：
 *   1. **长短枝双挂点语言（银杏独有身份，Spec §4 长短枝二型系统 Verified [1][2][3][5]）**：
 *      长枝叶螺旋状散生（节间 (1–)1.5–4cm [2]）+ 短枝 3–8 叶辐射莲座簇（FRPS 原句
 *      Verified [1]、典型 4–6 Inferred [4][7]）——前四例均为单一互生/二列挂点系统。
 *      实现：家族「叶簇」槽位 = **短枝莲座簇**（clusterLeaves = 8 候选，通透过滤后逐簇
 *      存活典型 4–7——簇数按 Spec Verified 3–8 域；簇内叶**辐射莲座**取向：叶面对枝轴
 *      近垂直略前倾 [7]，ginkgoGeometry 簇内生成改莲座方位语言）+ **长枝散生卡**
 *      （L5/L4 枝沿途螺旋散生单片卡，逐枝固定 4/2 张——ginkgoGeometry 结构常数，
 *      槽间恒等）。长短枝比维度（任务书差异轴）因属结构计数类（簇位/每簇叶量/散生卡
 *      数改值即改面数与 rng 消费）**槽间恒等不进差异轴**——差异由圆锥度/冠幅比/轮生
 *      清晰度/疏密四轴承载（记档：长短枝比轴的槽间展开需家族契约新数值面，归 011.13
 *      缺口清单）；
 *   2. 树形语言：圆穹（朴）/广卵（樟）/宽展圆顶（栎）/vase（榉）→ **圆锥-广卵过渡冠**
 *      （幼壮年圆锥形 Verified [1][2][4][5][6]，中龄锚定相 = 圆锥形后段/圆锥→广卵过渡
 *      Inferred [1][7]——建模主相保留明显圆锥/金字塔读向、顶部圆化、轮廓轻微不规则）
 *      → 实现：**excurrent 强领导**（apical_dominance 幼壮年强 Verified [1][4]——
 *      leaderLengthRatio 0.64 基准，四先例最高）+ **大枝近轮生**（「枝近轮生」FRPS 原句
 *      Verified [1]——挂高段窄跨度 0.16 集中 + asymmetry 0.32 低方位抖动）+ **斜上收敛**
 *      （雄株口径 Verified [1]——横展角 32–48° 整体低于四先例）+ 干向挂点高度分级锥度
 *      （低枝长高枝短——圆锥剪影的直接驱动，ginkgoGeometry 结构常数 SCAFFOLD_LENGTH_
 *      TAPER，零 rng）+ 最窄冠幅比（见 3）；
 *   3. 冠幅比：Spec §3/终审 C-2 工程域 **0.55–0.65**（五资产最窄冠——朴树 0.8–0.9/
 *      榉树 0.8–0.9/樟树 0.7–0.85/夏栎 0.8+；支撑 = NC 栽培域 ≈0.5–0.6 [6] + fall 整树
 *      异系统实测 ≈0.5–0.65 [7]——仍 Inferred）→ 实现：crownWidthRatio 参数 0.55 起步、
 *      **Step 3 探针定档**（T009.3 口径——外泄系数实测回写，见字段注释定档记录）；
 *   4. 干高占比：Spec 域 0.30–0.40 四样木读数**全部作废**（终审 C-3：form 系证据链断裂、
 *      文献无值 → **Unknown**）→ 数值作工程默认域沿用但**标注无实证**：挂高段
 *      scaffoldAttachMin/Span 0.62/0.16 + Step 3 干高参数域 0.34–0.40（geometry 硬编码
 *      rng 域）——涌现视觉冠底预估 ≈0.30–0.36（**工程设定·无实证**，可由 fall 照片补估
 *      后复升 Inferred per 终审 C-3）；
 *   5. 树皮：**纵裂脊沟族浅-中端**——幼树即浅纵裂、大树深纵裂粗糙（FRPS 原句 Verified
 *      [1][2]；中龄 8m 个体取浅-中纵裂相）+ 灰褐色调 + 脊较窄密（脊宽 ≈干径 1/10–1/15、
 *      可向细端微扩至 1/20 不失真——终审 C-6 中庸处置）→ 实现：barkRelief 幅度 0.030
 *      （介于榉树光滑 0.015 与香樟深沟 0.036 之间的浅-中端；vs 夏栎脊沟 0.033/朴树浅斑
 *      0.016）+ 谐波 [4,5,6]（窄密脊——k4 主导高于夏栎 [3,4,5]/香樟 [3,4,6] 的宽脊端）
 * + drift 2.6 rad/m（纵脊轴向连续——轴向去相关 ≈2.4m，介于夏栎 0.85 缓游走与香樟 3.2
 *      连续之间贴连续端；灰褐**色**调与沟内层次归 ginkgoMaterials 材质层，geometry 只管
 *      轮廓起伏）；
 *   6. 叶卡与簇：扇形大叶（宽 5–8cm Verified [1][2][4][5]——五资产最大叶）+ 宽>高
 *      （leaf_aspect_ratio 宽/高 ≈1.1–1.6 Inferred [7]——**长宽比口径反向**，银杏卡
 *      aspect = 长/宽 ∈ 0.62–0.91，四先例全部 >1.3）→ 卡宽 0.10–0.16m（真叶宽 ×≈2
 *      工程映射——先例口径）+ 短枝簇半径 0.085–0.125（莲座平摊域）——大卡 + 莲座簇 =
 *      冠面「钉状短枝凸起 + 团簇」细碎起伏观感（Spec §7 中距信号 [7]）；细质 fine
 *      texture [7] 由小簇密布承载（簇位 810 同榉树拓扑）；
 *   7. 密度语言：中-密（逆光空隙 25–35% Inferred [7]——与榉树同带）→ crownShellStart
 *      0.50 + coreDensityFloor 0.06（内膛细枝网「thin inner branchlets visible」[7] 的
 *      开网读向）+ 空腔 0.46–0.78；
 *   8. 骨架数：Spec 域 5–8（照片部分作废 per 终审 C-4——**工程默认无实证**）取 5 + 1
 *      领导枝——拓扑同榉树/香樟（簇位 810 / 皮面 20782，皮面恒等先例带内复用）；
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开：冠形幅度全域 0.4–0.7（品种窄端 Princeton
 *      Sentry® 18×6 柱状 / 阔端 Autumn Gold™ 12×9 阔圆锥 Verified [4][6]）——建模 8 槽
 *      取 0.5–0.7（Spec 明示）；slot-1 窄冠端（Princeton Sentry 读向）/ slot-2 阔圆锥端
 *      （Autumn Gold 读向）/ slot-3 偏冠（冠不对称 + 轮生清晰度降）/ slot-4 低冠（挂高段
 *      下移 + 轮生松散）/ slot-6/7 疏密端——品种极端比值不直取（8 槽带连续性 + 同种
 *      语言一致优先，记档见各槽注释）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_height_ratio——**Unknown**（终审 C-3 降级；工程默认 0.34–0.40 沿用**无实证
 *      标注**）；
 *   2. trunk_taper_ratio / basal_flare_ratio（后者定性倾向「不显」单源低置信 [7]）——干
 *      形锥度与根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   3. branch_angle 度数 / scaffold_angle 度数——照片读数作废（终审 C-4）降工程默认
 *      （**无实证**）；「斜上伸展」方向本身 FRPS Verified [1]（雄株收敛读向）；
 *   4. branch_length_decay / branch_radius_decay / allometry_exponent——家族量级工程设定
 *      （干向挂点高度分级锥度为银杏工程语言，非实证数值）；
 *   5. branch_orientation 数值域——「近轮生」定性 Verified [1]（五资产唯一轮生口径），
 *      度数/散布幅度 Unknown（asymmetry 0.32 为轮生清晰度的工程幅度）；
 *   6. leaf_orientation_dist（短枝簇辐射莲座双源 Inferred [7]——已按莲座实现；长枝散
 *      生叶姿态工程设定）；leaf_cluster_density 典型值 4–6 Inferred [4][7]（建模以
 *      FRPS 3–8 Verified 域为准）；
 *   7. 公园中龄 ≈8m 本身弱推断（终审 C-1）——任务书工程锚沿用，沿家族混植语境。
 *
 * 不建模记档（Spec 有事实、工程不表达）：秋色金黄（≈90%+ 纯金黄 Verified [1][2][4][5]
 *      [6][7]——季相归材质/风格层，任务书「秋色不建模记档」）；种子白果 2.5–3.5cm 长梗
 *      下垂（Verified [1][2][7]——雌株不进生产口径，面数尺度不可辨）；雄球花（Verified
 *      [1][2][7]——花语义不在观感资产）；落叶一夜集中行为（Verified [4][5]——动态语义）；
 *      叶柄细长 3–10cm（Verified [1][2][7]——叶卡抽象不建柄，四先例口径；长柄扇叶颤动
 *      归材质风动层）；扇形轮廓/波状缺刻/2 裂/二叉分歧脉（Verified [1][2][3][5][7]——
 *      近景叶形细节归 ginkgoMaterials 的 SDF 叶形，不在几何面）；冬芽黄褐色卵圆形
 *      （Verified [1][2]——冬季裸枝语义不在观感资产内）；一年生长枝淡褐黄→灰/短枝黑灰
 *      密叶痕（Verified [1][2]——小枝三色归材质层，短枝距状钉突观感由莲座簇挂点语言
 *      承载）；树瘤/苔藓地衣少量（Inferred 单源低置信 [7]——归树皮材质配方）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：中龄公园雄株个体 ≈8m 量级（工程锚弱推断 per 终审
 * C-1）、**圆锥-广卵过渡冠**（excurrent 强领导 + 大枝近轮生斜上收敛——圆锥/金字塔读向
 * 保留、顶部圆化）、**五资产最窄冠**（工程域 0.55–0.65 per 终审 C-2）、干高占比工程
 * 默认域（**Unknown·无实证** per 终审 C-3）。T009.3 教训沿用：视觉冠底由挂高段
 * （scaffoldAttachMin/Span）+ 横展角 + upturn + 领导枝链涌现，不由 crownCenterRatio
 * ——校准以实测 stats 的叶卡最低 Y（视觉冠底）为准回推挂高段参数；圆锥剪影由干向挂点
 * 高度分级锥度 + 强领导链涌现（ginkgoGeometry）。结构计数类（trunk/levels radial/segs、
 * childPlan、簇位数、每簇叶量、voidCount、scaffoldCount + 长枝散生卡数 [geometry 常数]）
 * 全槽恒等；叶卡尺寸/长宽比域槽间不动（叶身份）。
 */
export const GINKGO_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 终审 C-2：冠幅/树高比工程域 **0.55–0.65**（五资产最窄冠——圆锥/金字塔冠
   *  所致；支撑链 = NC 栽培域 50–80ft 高 × 30–40ft 宽 ≈0.5–0.6 Verified [6] + fall
   *  整树第二视觉实测 ≈0.5–0.65 [7]——照片三样木读数作废后仍 Inferred）。**Step 3 探针
   *  回推定档（2026-09-20 实测，三轮）**：领导链初值 0.64 期树高涌现 9.64m 越锚（见
   *  leaderLengthRatio 注释）使比值读数失真（0.54）；领导链回调 + 圆锥角度梯度
   *  （ginkgoGeometry SCAFFOLD_ANGLE_TAPER）定档后参数 0.55 复测涌现 **w/h = 0.581**
   *  （外泄 ×1.06——低枝平展基扇 + 高枝陡立收角使外泄温和）落工程域中带；8 槽带
   *  0.447–0.696（slot-1 窄端品种读向下探、余槽落 0.5–0.7 建模域，逐槽记档见各槽注释）。
   *  【冠幅比类 = 家族共性候选沿用；锚值 = 银杏特有（工程域 + 实测外泄系数回推——
   *  探针定档记录，非编造）】 */
  crownWidthRatio: 0.55,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；圆锥冠纵域长——冠体中心
   *  中偏上使密度场沿锥体分布，圆锥剪影由骨架侧驱动链承载）。 */
  crownCenterRatio: 0.66,
  /** 工程设定（同上；圆锥-广卵过渡冠纵域参考系——挂高段 0.62 起的长锥冠体，顶部圆化
   *  由 crownTopBias 正偏置配合）。 */
  crownHeightRatio: 0.7,
  /** Spec §4 / 域扩展节 A branch_orientation：**近轮生**（「枝近轮生」FRPS 原句
   *  Verified [1]——五资产唯一轮生口径；照片 semi/near-whorled 交叉作废 per 终审 C-4，
   *  度数散布幅度 Unknown）。slot-0 = 0.32（**低方位抖动 = 轮生清晰度**——vs 榉树 0.5/
   *  香樟 0.5 的散布槽：方位均分步进 + 小抖动 → 近轮生环状读向；轮生清晰度为 8 槽差异
   *  轴之一，槽 3/4 放松）。【轮生机制 = 银杏特有（FRPS Verified）；幅度工程设定】 */
  asymmetry: 0.32,
  /** Spec §3 中龄锚定相「顶部圆化、轮廓轻微不规则」（Inferred [1][7]——圆锥读向保留
   *  前提下的顶密轻微正偏置；几何顶圆化由强领导链 + 末级 upturn 承载，本字段只调
   *  密度场高度向）。【银杏特有定档依据 = Spec §3 中龄相 Inferred [1][7]；幅度工程设定】 */
  crownTopBias: 0.06,

  // 骨架
  /** Spec §4 / 域扩展节 A scaffold_branch_count ≈5–8（照片部分作废 per 终审 C-4——
   *  **工程默认无实证**；「枝近轮生」为排列口径 Verified [1]）。slot-0 = 5（另含 1
   *  领导枝不计入）——近轮生环读向 5–6 枝典型（form 读数作废、按排列口径工程默认），
   *  且 5+1 拓扑（簇位 810 / 皮面 20782）同榉树/香樟先例带，为扇形大卡的叶面预算留
   *  带内余量。【结构计数类：槽间恒等；取 5 = 工程默认（无实证标注）】 */
  scaffoldCount: 5,
  /** Spec 域扩展节 A scaffold_angle：**斜上伸展**（FRPS 原句 Verified [1]——雄株大枝
   *  斜上较收敛口径；仰角 30–60° 照片读数作废 per 终审 C-4 → 度数**工程默认无实证**）。
   *  slot-0 = 32–48°（对铅垂——**五实例最收角**：夏栎 50–66/朴树 46–64/香樟 46–68/
   *  榉树 42–60；斜上收敛 + 窄冠的圆锥读向来源；圆锥角度梯度（低枝 +20…22° 平展 /
   *  高枝 −8…10° 陡立，ginkgoGeometry SCAFFOLD_ANGLE_TAPER）在本域上叠加——冠基放张
   *  与锥顶收敛的确定性表达）。【银杏特有（斜上 Verified + 收敛度数工程默认）】 */
  scaffoldAngleMin: 32,
  scaffoldAngleMax: 48,
  /** 干高占比工程默认域（Unknown·无实证 per 终审 C-3）的挂高段实现：挂点 0.62–0.78
   *  干高段（trunk 参数域）**窄跨度 0.16** = 近轮生环集中（vs 榉树 0.52–0.72 span 0.20
   *  /夏栎更散——轮生清晰度的挂高段载体）；T009.3：挂高段下缘 + 横展角 + upturn + 领导
   *  链共同涌现视觉冠底。**Step 3 探针回推（2026-09-20 实测）**：涌现视觉冠底/实高
   *  **0.328**（8 槽带 0.195–0.378——低冠/高冠槽展开；**工程设定·无实证**——终审 C-3
   *  口径，可由 fall 照片补估后复升 Inferred）。【银杏特有（工程默认域 + 近轮生窄跨度
   *  + 回推实测）】 */
  scaffoldAttachMin: 0.62,
  scaffoldAttachSpan: 0.16,
  /** 工程设定（branch_radius_decay Unknown、DBH 典型值 Unknown（Spec §2 极值 4m 不用）；
   *  银杏慢生粗干读向（3000 年栽培古树语境 [2]、中龄 8m 个体粗壮端）取 0.57 中庸——
   *  与榉树同值，待视觉验收校）。 */
  scaffoldThickness: 0.57,
  /** rank 长度乘子（5 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法沿用；
   *  近轮生环内势差收小——轮生均齐读向 + 圆锥分级由干向高度锥度承载 [ginkgoGeometry
   *  SCAFFOLD_LENGTH_TAPER]，rank 只承担环内强弱）。 */
  scaffoldRankLength: [1.1, 1.02, 0.96, 0.9, 0.86],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.02, 0.96, 0.92, 0.89, 0.87],
  /** Spec §3 / 域扩展节 A apical_dominance：**幼-壮年强（excurrent，dominant main
   *  leader——OSU 术语级 Verified [4]）**——圆锥冠的直接结构成因（老树失去领导转广卵
   *  [1][5]，本资产锚中龄不取）。定档 0.54 基准（**五实例最高**：榉树 0.46/朴树 0.50/
   *  夏栎 0.48/香樟 0.52——强领导续顶使树顶由领导链决定、锥尖读向成立；T009.3 弱领导
   *  翻转警示的反端：强领导下冠幅参数与树高解耦更稳。**Step 3 探针回调记档
   *  （2026-09-20）**：初值 0.64 实测涌现树高 9.64m 越锚域上沿 8.8（领导链含子级延展
   *  的总外伸 ≈×1.8——五级 upturn 链复利），回调 0.54 复测涌现 ≈8.2m 落锚域——相对
   *  强度（五实例最高 + 锥顶主导）不变，绝对链长以涌现高度定档）。【银杏特有定档依据
   *  = Spec apical_dominance 幼壮年强 Verified [1][4]；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.54,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；5 骨架下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级——榉树/香樟同拓扑同值）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝方向「斜上延展」定性 Verified [1]
   *  由 levels.upturn 表达——方法恒同，长度比沿用家族量级）。 */
  lengthRatioBase: 0.4,
  lengthRatioSpan: 0.15,
  /** L1 0.66 通体锥度（骨架枝斜上直伸的方向性表达——银杏枝「斜上伸展」非拱曲 [1]，
   *  略粗于榉树 0.68 的通体）。工程设定（Spec 无银杏锥度数值，branch_curvature 定性
   *  「斜上伸展、非下垂非拱曲」Verified [1] 由姿态字段承载）。 */
  endRatio: [0.66, 0.62, 0.62, 0.62, 0.62],

  // 冠内通透（中-密基调——逆光空隙 25–35%，与榉树同带）
  /** Spec §3 / 域扩展节 B crown_transparency：**中-密**——逆光空隙 ≈25–35%（canopy-a
   *  Inferred [7]）；叶质细密 fine texture（form 系作废、canopy 系维持 per 终审 C-5）
   *  + 短枝密布的冠面粒状纹理（Spec §7 中距信号 [7]）。slot-0 = 1.0 基准（疏密差异归
   *  槽 6/7——家族沿用；空隙量级由莲座簇覆盖 + 空腔域 + 壳层参数承载）。【canopyDensity
   *  类 = 家族共性候选；基调读向 = 银杏特有（中-密 Inferred [7]）】 */
  canopyDensity: 1.0,
  /** Spec 域扩展节 B crown_fill_gradient：外密内疏（canopy-a「denser at outer shell」
   *  Inferred [7]——叶幕集中冠壳外段受光区 [3][7]）。家族沿用；银杏壳带取 0.50（榉树
   *  0.52 / 朴树 0.55 之间的中带——莲座簇挂外段的簇位分布配合）。【连续形态参数；值 =
   *  银杏特有】 */
  crownShellStart: 0.5,
  /** 芯层起点与地板值：Spec §3 内膛枝现象——**内膛细枝网可见但不成密团**（canopy-a
   *  「thin inner branchlets visible」Inferred [7]）→ 芯层地板 0.06（开网不空透——
   *  榉树同值同读向）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.06,
  /** 规则①（枝干通道：主干大枝进冠不被封死——内膛细枝网可见 [7] 的「透」侧承载）；
   *  数值工程设定（干径四先例中庸，通道带同幅）。 */
  channelRadius: 0.42,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：中-密 25–35% 空隙读向的冠内空隙表达之一）。【结构计数类：槽间
   *  恒等】数量工程设定（与朴树/香樟/榉树同为 3——空腔尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域中档（0.46–0.78：榉树 0.48–0.82 与香樟 0.42–0.72 之间的中带——空隙
   *  25–35% 的中档读向，Spec 域扩展节 B Inferred [7]）。值 = 银杏特有；半径域机制 =
   *  家族共性候选。 */
  voidRadiusMin: 0.46,
  voidRadiusMax: 0.78,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；银杏「叶簇」= **短枝莲座簇**
  // （3–8 叶辐射莲座）+ 长枝散生卡（ginkgoGeometry 常数）= 长短枝双挂点语言）
  /** Spec 域扩展节 B leaf_attachment_rule：**长短枝二型双挂点**——短枝叶簇生莲座
   *  3–8 片（FRPS「在短枝上3-8叶呈簇生状」Verified [1]、OSU 3–5 [4]、照片 3–8 [7]、
   *  典型 4–6 Inferred）+ 长枝叶螺旋散生（FOC "sparsely and spirally arranged" [3]、
   *  节间 (1–)1.5–4cm [2]）+ 叶幕集中冠壳外段（Inferred [3][7]）。簇位数 L5=2 + L4=1
   *  （家族沿用夏栎拓扑映射——短枝遍布冠内各级枝 [3] 的末两级工程映射）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——短枝遍布枝外段受光区 [7]）。 */
  clusterInnerStartL5: 0.5,
  clusterInnerStartL4: 0.45,
  /** Spec §2 / 域扩展节 B leaf_size + clump_scale：真叶宽 5–8cm（FRPS/FOC 双志 Verified
   *  [1][2] + OSU/照片交叉 [4][7]——**五资产最大叶**）× ≈2 工程映射（先例口径）→
   *  莲座簇半径 0.085–0.125（扇形大卡 0.10–0.16 宽的平摊辐射域——叶簇在短枝顶端平摊
   *  展开 [7]，簇半径略小于卡宽 ×2 的莲座几何域；夏栎 0.11–0.15/朴树 0.10–0.14/
   *  香樟 0.11–0.15/榉树 0.09–0.125 中银杏取榉树量级——小簇 × 大卡 = 细质密叶 +
   *  钉状凸起观感）。L4 簇 ×1.25 承接更粗末级枝——家族沿用。【簇半径比类 = 家族共性
   *  候选；绝对量级 = 银杏特有】 */
  clusterRadiusMinL5: 0.085,
  clusterRadiusSpanL5: 0.04,
  clusterRadiusScaleL4: 1.25,
  /** 工程设定（家族沿用）。 */
  clusterRadiusLengthCap: 0.6,
  /** 工程设定（短枝密布的簇间抑制——莲座簇粒状分布保险，家族沿用 0.50）。 */
  clusterMinSeparation: 0.5,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 8 = **短枝莲座候选数**（FRPS 3–8 域上沿 [1]——通透过滤后逐簇存活典型
   *  4–7 片 = 「3–8 叶簇生、典型 4–6」的 Verified+Inferred 合并口径；(–10) 无源不取
   *  per Spec 溯源记档）。8 槽簇位 810（L4 162×1 + L5 324×2，5+1 拓扑同榉树）× 8 卡 +
   *  长枝散生卡（L5×4 + L4×2，geometry 常数）的 High 预算推算：候选 8088 × 存活率
   *  ≈0.52–0.62 → 卡 ≈4200–5000 → High 总面 ≈20782 + 8400–10000 = 29.2–30.8K 落家族
   *  行 [28754, 40000] 带内（扇形大卡覆盖率高——单卡面积 ≈0.013m² vs 榉树 0.0058m²）；
   *  **预估待 Step 3 探针复核定档**（先例流程：朴树 18→16、香樟 18、榉树 18 均为探针
   *  实测定档）。【每簇叶量类 = 家族共性候选；绝对值 = 银杏特有（FRPS 3–8 域上沿 +
   *  预算推算）】 */
  clusterLeavesL5: 8,
  clusterLeavesL4: 8,
  /** 外壳偏置 ∈ (0,1]：莲座平摊——簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^gamma)
   *  取 0.50（**低于四先例 0.62–0.66**：莲座叶自短枝顶平摊辐射 [7]，r̂ ∈ [0.5, 1] 的
   *  浅壳域——簇心即短枝顶钉突位，非深腔球簇）。【壳偏置机制 = 家族共性候选；值 =
   *  银杏特有（莲座平摊读向）】 */
  clusterShellBias: 0.5,
  clusterShellGamma: 0.8,
  /** Spec §2 / 域扩展节 B leaf_size + leaf_aspect_ratio：真叶宽 5–8cm（FRPS/FOC 双志
   *  Verified [1][2]——五资产最大叶）→ 卡宽 0.10–0.16m（真叶宽 ×≈2 工程映射——四先例
   *  口径：夏栎 0.08–0.13/朴树 0.07–0.11/香樟 0.06–0.095/榉树 0.04–0.06）。【卡尺寸域
   *  类 = 家族共性候选；绝对量级 = 银杏特有】 */
  leafWidthMin: 0.1,
  leafWidthSpan: 0.06,
  /** Spec 域扩展节 B leaf_aspect_ratio：**宽/高 ≈1.1–1.6（宽>高——扇形口径，与前四例
   *  长/宽 >1.3 反向；leaf-a 1.1–1.3 / leaf-b 1.4–1.75 + 终审第二视觉宽 1.5–2×长交叠
   *  取全域 Inferred [7]）→ 卡长宽比（长/宽）= 1/1.6–1/1.1 = **0.62–0.91**（家族
   *  leafAspect 语义 = 卡长/卡宽，银杏值域 <1 为扇形宽叶的契约内表达——无需改契约，
   *  数值面直接填）。【长宽比域类 = 家族共性候选；域值 = 银杏特有（扇形反向口径）】 */
  leafAspectMin: 0.62,
  leafAspectSpan: 0.29,

  // 树皮近景微起伏（银杏特有分化：**纵裂脊沟族浅-中端**——幼树即浅纵裂 Verified
  // [1][2]，中龄 8m 个体取浅-中纵裂相 per 终审 C-6 中庸处置；vs 夏栎脊沟 0.033/
  // 朴树浅斑 0.016/香樟纵裂深沟 0.036/榉树光滑剥落 0.015 五分化第五种量级；灰褐色调/
  // 沟脊对比/树瘤/苔藓归 ginkgoMaterials 材质层——geometry 只管轮廓起伏）
  /** 浅-中纵裂端锚定 0.030（Spec §5 / 域扩展节 C bark_relief 中-深 Inferred [7] × 终审
   *  C-6 第二视觉偏浅端中庸——介于榉树光滑 0.015 与香樟深沟 0.036 之间、贴夏栎脊沟
   *  0.033 浅侧：中龄「浅-中纵裂」相，大树「深纵裂粗糙」Verified [1][2] 不进中龄锚）。
   *  主干基环半径 ≈0.26–0.32m（Step 3 域建议）→ 峰幅度 ≈7.8–9.6mm、同环极差 ≈10–
   *  15mm——近景纵脊沟可辨、中景脊线连续读向。亚视觉地板联动：0.030 下起径 <0.05m
   *  的管平滑发射——主干 + L1 骨架有效起伏（幼即裂 [1][2]——粗枝同裂 ✓）、L2 以下
   *  细枝光滑。【幅度 ∝ 半径量级挂钩 = 家族共性候选沿用；绝对值 = 银杏特有】槽间恒等
   *  （barkRelief 非形态差异维度——slot-0 定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.03,
    /** 纵裂窄密脊谐波：k∈{4,5,6}——k4 主导（窄密脊：脊宽 ≈干径 1/10–1/15、可微扩至
     *  1/20 per 终审 C-6——周向脊密高于夏栎 [3,4,5]/香樟 [3,4,6] 的 k3 宽脊端）+ k5/k6
     *  脊缘细纹（≤ 主干 radial 14 的奈奎斯特域 7 留 1 档边际——家族同款边际纪律）。
     *  【谐波语言 = 银杏特有（vs 夏栎 [3,4,5] / 朴树 [4,5,6] / 香樟 [3,4,6] / 榉树
     *  [3,5,6]）】 */
    harmonics: [4, 5, 6],
    /** 轴向游走基率 2.6 rad/m（**纵脊轴向连续**——轴向去相关 ≈2π/2.6 ≈ 2.4m：贴香樟
     *  3.2 连续端、远于夏栎 0.85 缓游走与榉树 11 斑驳断裂——纵裂脊沟的脊线连续读向
     *  工程映射，Spec bark_archetype 纵裂族 Verified [1][2]）。【游走机制 = 家族共性
     *  候选；速率值 = 银杏特有（纵脊连续端）】 */
    drift: 2.6,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown（后者定性倾向「不显」单源低置信 [7]）——flare 1.18 轻度沿家族常量，
   *  Step 3 微调归几何）。 */
  trunk: { radial: 14, segs: 14, wander: 0.04, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 branching_levels
   *  Inferred [7]）的家族五级方法沿用，级数槽间不动。姿态分级为银杏斜上语言：
   *  upturn [0.30,0.26,0.21,0.16,0.11] 中庸带（榉树 [0.34,…,0.14] 强上举 / 香樟
   *  [0.28,…,0.05] 平摊之间——银杏「斜上伸展」Verified [1] 非拱曲非下垂，末级 0.11
   *  承担冠缘轻微上收的锥面闭合 + 顶部圆化 [1][7]）；wander 骨架级 0.08 略刚直（斜上
   *  直伸读向）+ 末级乱幅 0.35 家族量级（细枝网 [7]）；分级单调性保持。各级数值工程
   *  设定（方向 Spec Verified [1]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.3 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.26 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.21 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.16 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.11 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑——L3→L4 三挂点承载 5 骨架下的簇位量 810，与榉树/
   *  香樟同拓扑）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 挺拔组合（009.3 语法复制）：窄冠端——Princeton Sentry® 品种读向（OSU 18×6m
 * 柱状 Verified [4][6]；Spec §6 冠形幅度全域 0.4–0.7 的窄端真实分化）。组合：冠幅比降
 * （0.44——**Step 3 探针回推（2026-09-20 实测）**：涌现 0.447，微出建模域 0.5–0.7 下沿
 * ——近轮生环 + 强领导中轴使冠宽存在种子无关的底宽（领导链侧枝），窄槽下探受限（同
 * seed 宽/窄槽宽比实测 1.18、规范种子比 5.89/3.82 ≈1.54——槽身份仍可辨）；品种极端比
 * 6/18 ≈0.33 不直取——8 槽带连续性 + 同种语言一致优先，下探 0.447 记档）+ 冠高比升
 * （0.76 纵锥）+ 横展角收窄上举（26–38°）+ 挂高段上移收窄（0.68–0.80 干高段，span
 * 0.12——清干 + 轮生环更集中）+ 领导枝偏强（0.56——excurrent 直立端 [4]）+ rank 势差
 * 收小（窄冠均齐）+ asymmetry 降（0.24——轮生清晰度升）+ 姿态更刚直（trunk/levels
 * wander ×0.8，分级单调性不破）+ crownTopBias 升（0.12 锥顶闭合）。upturn 分级结构
 * 不动（圆锥同种语言——窄锥而非柱冠）。
 */
const GINKGO_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...GINKGO_SLOT0_PROFILE,
  crownWidthRatio: 0.44,
  crownCenterRatio: 0.68,
  crownHeightRatio: 0.76,
  asymmetry: 0.24,
  crownTopBias: 0.12,
  scaffoldAngleMin: 26,
  scaffoldAngleMax: 38,
  scaffoldAttachMin: 0.68,
  scaffoldAttachSpan: 0.12,
  scaffoldRankLength: [1.06, 1.0, 0.95, 0.91, 0.88],
  scaffoldRankRadius: [1.0, 0.96, 0.93, 0.91, 0.89],
  leaderLengthRatio: 0.56,
  trunk: { radial: 14, segs: 14, wander: 0.03, upturn: 0.05 },
  levels: [
    { radial: 8, segs: 9, wander: 0.06, upturn: 0.3 },
    { radial: 7, segs: 8, wander: 0.1, upturn: 0.26 },
    { radial: 6, segs: 5, wander: 0.15, upturn: 0.21 },
    { radial: 5, segs: 4, wander: 0.22, upturn: 0.16 },
    { radial: 4, segs: 3, wander: 0.28, upturn: 0.11 },
  ],
};

/**
 * slot-2 展开组合（009.3 语法复制）：阔圆锥端——Autumn Gold™ 品种读向（OSU 12×9m
 * broad conical 全雄无性系 Verified [4][6]；品种比 0.75 贴建模域 0.5–0.7 上沿外——
 * 8 槽带连续性优先，取域内宽端）+ 随龄开张读向（老相广卵序列 [1][5] 的中龄前奏）。
 * 组合：冠幅比 0.43（**Step 3 探针回推（2026-09-20 实测）**：涌现 0.687——44–58° 开
 * 角 + 圆锥基扇的宽端外泄显著（外泄 ×1.60——收角端 ×1.06 的镜像），落建模域宽端）
 * + 冠高比降（0.62 阔锥扁端）+ 冠心降（0.60——冠最宽带下压向挂点段）+ 横展角大
 * （44–58° 开张端——工程域内宽端外推）+ 挂高段下移放宽（0.54 起 span 0.20——轮生环
 * 松散开张）+ 外层 upturn 微收（冠缘摊平的宽锥读向）+ 领导枝弱（0.50——多枝共构端，
 * 仍 > 0.46 保锥顶不翻转）+ 首枝 rank 主导强（×1.22）+ asymmetry 升（0.40）+
 * crownTopBias 微负（-0.04 顶部圆化摊平）。
 */
const GINKGO_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...GINKGO_SLOT0_PROFILE,
  crownWidthRatio: 0.43,
  crownCenterRatio: 0.6,
  crownHeightRatio: 0.62,
  asymmetry: 0.4,
  crownTopBias: -0.04,
  scaffoldAngleMin: 44,
  scaffoldAngleMax: 58,
  scaffoldAttachMin: 0.54,
  scaffoldAttachSpan: 0.2,
  scaffoldRankLength: [1.22, 1.03, 0.94, 0.87, 0.82],
  scaffoldRankRadius: [1.05, 0.96, 0.9, 0.86, 0.83],
  leaderLengthRatio: 0.5,
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.26 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.22 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.18 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.14 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.09 },
  ],
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：近轮
 * 生环内强弱分化 + 冠形个体开张度幅度（Spec §6）——方向采信；幅度工程设定；照片读数
 * 作废 per 终审 C-4）。组合：asymmetry 升（0.40——高 asymmetry 的方位大抖动在 5 骨架
 * 下相干偏侧信号被稀释（朴树/香樟/榉树同款探针教训）；偏侧相干性由 rank 主导承载）+
 * scaffoldRankLength 首枝 ×1.70 / 弱势 ×0.70（一侧枝展压倒性——首枝质量占比 0.34，
 * 配 4 弱枝近均分 → 质心稳定指向首枝方位；榉树 ×1.50 同构量级上调——银杏领导链独立
 * 续顶不受骨架质量牵动，上调无榉树推树顶副作用）+ scaffoldRankRadius 同向（×1.10）+
 * 冠幅比 0.37 容纳域（**Step 3 探针回推（2026-09-20 实测）**：涌现 0.675 带内——偏侧
 * 枝展的质心偏移读数见下）+ 横展角域微扩（34–52°）+ 挂高段贴标准。其余维度贴标准
 * （偏冠 = 方位维差异）。**Step 3 探针实测**：6 种子面板质心均值比 1.195（excurrent
 * 强领导中轴使偏冠读向弱于榉树 1.51——中轴树冠的固有稀释，记档归 011.13 缺口候选
 * 「excurrent 树种的偏冠表达幅度」）；规范种子绝对偏移 0.446m / ×1.437（单种子读数
 * 相干性良好）。
 */
const GINKGO_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...GINKGO_SLOT0_PROFILE,
  crownWidthRatio: 0.37,
  crownCenterRatio: 0.65,
  asymmetry: 0.4,
  scaffoldAngleMin: 34,
  scaffoldAngleMax: 52,
  scaffoldAttachMin: 0.62,
  scaffoldAttachSpan: 0.16,
  scaffoldRankLength: [1.7, 1.03, 0.92, 0.82, 0.7],
  scaffoldRankRadius: [1.1, 0.96, 0.91, 0.86, 0.81],
  leaderLengthRatio: 0.52,
};

/**
 * slot-4 低冠组合（009.3 语法复制 + 干高工程默认域下端）：低分枝点开张个体——干高
 * 占比 Unknown·无实证（终审 C-3）工程默认域 0.30–0.40 的下段端个体。组合：挂高段下移
 * 放宽（attachMin 0.46 + span 0.24——低分枝 + 轮生环松散：低冠端「近轮生」读向弱化
 * 的现实个体幅度）+ 冠心降（0.58）+ crownTopBias 负（-0.08 底密）+ 横展角大（44–60°
 * 低枝开张）+ 姿态下压（levels upturn ×0.7——斜上弱化端、冠缘摊平；分级单调性保持）+
 * 簇半径微升（0.095–0.14 低开张大簇）+ 领导枝弱（0.50）+ 冠幅比 0.42（**Step 3 探针
 * 回推（2026-09-20 实测）**：涌现 0.645 带内宽段）。**涌现视觉冠底 0.195**（工程默认
 * 域下缘的低冠变体外推——低枝平展 + upturn×0.7 使叶幕自挂点下方展开；高冠槽冠底差
 * 实测 0.948m）。
 */
const GINKGO_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...GINKGO_SLOT0_PROFILE,
  crownWidthRatio: 0.42,
  crownCenterRatio: 0.58,
  crownHeightRatio: 0.66,
  asymmetry: 0.4,
  crownTopBias: -0.08,
  scaffoldAngleMin: 44,
  scaffoldAngleMax: 60,
  scaffoldAttachMin: 0.46,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.16, 1.02, 0.94, 0.88, 0.84],
  scaffoldRankRadius: [1.02, 0.95, 0.9, 0.87, 0.85],
  leaderLengthRatio: 0.5,
  clusterRadiusMinL5: 0.095,
  clusterRadiusSpanL5: 0.045,
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.21 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.18 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.15 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.11 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.08 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制 + 干高工程默认域上端）：清干高枝个体——挂高段提向
 * 工程默认域上缘（Unknown·无实证 per 终审 C-3；行道清干语境 [4][6]）。组合：挂高段
 * 上移收窄（attachMin 0.78 + span 0.08——高挂点 + 轮生环最集中）+ 冠心升（0.70）+
 * crownTopBias 正（0.12 顶密——锥顶读向加强）+ 领导枝强（0.46 为本槽相对上举端——
 * **Step 3 探针回调记档**：初值 0.72 + upturn ×1.15 实测树高涌现 10.26m 大幅越锚
 * （高挂点 × 举升链复利），回调领导 0.46 + upturn ×1.05 后涌现 8.77m 贴锚域上沿）
 * + 横展角收（28–42° 上举）+ 姿态上举（levels upturn ×1.05——锥体上收；分级单调性
 * 保持）+ 冠高比降（0.64 高挂点纵域收窄）+ 冠幅比 0.42（**Step 3 探针回推（2026-09-20
 * 实测）**：涌现 0.527 窄端第二）+ asymmetry 降（0.26）。**涌现视觉冠底 0.354**（域
 * 上缘外推）。
 */
const GINKGO_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...GINKGO_SLOT0_PROFILE,
  crownWidthRatio: 0.42,
  crownCenterRatio: 0.7,
  crownHeightRatio: 0.64,
  asymmetry: 0.26,
  crownTopBias: 0.12,
  scaffoldAngleMin: 28,
  scaffoldAngleMax: 42,
  scaffoldAttachMin: 0.78,
  scaffoldAttachSpan: 0.08,
  scaffoldRankLength: [1.08, 1.0, 0.95, 0.9, 0.87],
  scaffoldRankRadius: [1.0, 0.96, 0.92, 0.9, 0.88],
  leaderLengthRatio: 0.46,
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.32 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.28 },
    { radial: 6, segs: 5, wander: 0.19, upturn: 0.22 },
    { radial: 5, segs: 4, wander: 0.27, upturn: 0.17 },
    { radial: 4, segs: 3, wander: 0.35, upturn: 0.12 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透上升端——canopy-a 型空隙 25–35% 个体（Spec
 * §3 crown_transparency Inferred [7] 的疏端）+ 内膛细枝开网读向（「thin inner
 * branchlets visible」[7]——冠心更开、簇间更散）。组合：canopyDensity 0.82（**Step 3
 * 探针定档（2026-09-20）**：初值 0.78 实测 Mid 总面 5830 越家族行下沿 6000，回调 0.82
 * 后 Mid 6622 落带——疏密对比维持（卡数比 slot-7 实测 0.822））+ crownShellStart ↑
 * （0.56 壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓（0.04——内膛开网
 * 读向的疏端）+ 空腔半径域 ↑（0.50–0.88 大空隙）+ clusterMinSeparation ↑（0.58）+
 * clusterShellBias ↓（0.44 莲座也散）+ 领导枝弱（0.50——多枝共构开张端）+ 冠幅比
 * 0.47（涌现 0.615 带内）。
 */
const GINKGO_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...GINKGO_SLOT0_PROFILE,
  crownWidthRatio: 0.47,
  canopyDensity: 0.82,
  crownShellStart: 0.56,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.04,
  voidRadiusMin: 0.5,
  voidRadiusMax: 0.88,
  clusterMinSeparation: 0.58,
  clusterShellBias: 0.44,
  leaderLengthRatio: 0.5,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密闭细密团冠——canopy 空隙 25–35% 带内密端
 * （Spec §3 Inferred [7]）+ Shangri-la® 品种密枝读向（OSU 14×7.5m 紧凑密枝 Verified
 * [4]）。组合：canopyDensity 0.92（**Step 3 探针复核（2026-09-20 实测 High 29190**
 * ——莲座 8 候选 + 散生 5/3 卡的满存活理论顶 ≈33.9K，0.92 收敛带内中段；先例同款
 * 预算校准流程：朴树 0.93/香樟 0.94/榉树 0.92 定档）+ crownShellStart ↓（0.44 满密
 * 壳带更厚）+ crownCoreStart ↑（0.16）+ coreDensityFloor ↑（0.09 团冠感）+ 空腔半径
 * 域 ↓（0.34–0.60）+ clusterMinSeparation ↓（0.46）+ clusterShellBias ↑（0.56 莲座
 * 更实）+ 冠幅/冠高比 0.39 / 0.72（团冠体量）+ 领导枝 0.50（涌现 0.696 贴建模域宽沿）。
 */
const GINKGO_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...GINKGO_SLOT0_PROFILE,
  crownWidthRatio: 0.39,
  crownHeightRatio: 0.72,
  canopyDensity: 0.92,
  crownShellStart: 0.44,
  crownCoreStart: 0.16,
  coreDensityFloor: 0.09,
  voidRadiusMin: 0.34,
  voidRadiusMax: 0.6,
  clusterMinSeparation: 0.46,
  clusterShellBias: 0.56,
  leaderLengthRatio: 0.5,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 挺拔 / 展开 / 偏冠 /
 * 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；银杏沿 Spec
 * §6 幅度轴展开：Princeton Sentry 窄端（slot-1）/ Autumn Gold 阔圆锥端（slot-2）/
 * 偏冠-轮生松散端（slot-3/4）/ Shangri-la 密冠端（slot-7）——品种极端比值不直取记档
 * 见各槽注释）。slot-1…7 以 slot-0 锚点为底的差量展开定义——**结构计数类字段
 * （trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）
 * 与叶卡尺寸/长宽比域由展开继承逐位恒等**（皮面数恒等 20782 与 rng 消费次数恒等的
 * 结构性保证；长枝散生卡数 [ginkgoGeometry 常数] 同槽间恒等）；barkRelief 槽间恒等
 * （spread 继承）。morphSeed 路由见 assets/asset_tree_ginkgo.asset（Step 3 交付）。
 */
export const GINKGO_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  GINKGO_SLOT0_PROFILE,
  GINKGO_SLOT1_PROFILE,
  GINKGO_SLOT2_PROFILE,
  GINKGO_SLOT3_PROFILE,
  GINKGO_SLOT4_PROFILE,
  GINKGO_SLOT5_PROFILE,
  GINKGO_SLOT6_PROFILE,
  GINKGO_SLOT7_PROFILE,
];
