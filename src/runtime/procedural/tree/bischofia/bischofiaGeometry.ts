/**
 * runtime/procedural/tree/bischofia/bischofiaGeometry —— 重阳木（Bischofia polycarpa
 * (H. Léveillé) Airy Shaw，大戟科落叶乔木——长江流域城市公园夏绿单干中龄个体 ≈10m，
 * 速生伞形开展）CPU 几何生成器（T011.8，阔叶家族第九实例——方法复制自夏栎第一实例经
 * 朴树/香樟/榉树/银杏/悬铃木（单叶先例）/栾树（011.6 复叶首例——复叶卡路径）/乌桕
 * （011.7 最新模板——零 rng 花果账目 + uv 域隔离断言）八次验证的通路
 * ../triadica/triadicaGeometry，契约字段语义不变：五级递归分枝拓扑 / 锥度管状枝干 /
 * 枝梢驱动叶簇 / 冠内通透三规则 / 树皮近景微起伏 / LOD 三档同流派生全部沿用；重阳木
 * 数值与算法细节差异点见下）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级递归
 *      分枝拓扑 → 锥度管状枝干（平行传输标架）→ 枝梢驱动**三出复叶卡**烘焙，产出
 *      树皮/叶两层非索引几何；层间 mergeGeometries(useGroups=true) 恰 2 组（D15 免组
 *      膨胀：皮 0 / 叶 1）。形态参数类型 = 阔叶家族契约
 *      ../broadleaf/broadleafShapeProfile（重阳木为第九实例），数值与槽组合见
 *      ./bischofiaShapeProfile（全部数值依据 docs/research/bischofia-reference.md
 *      Spec 1.0——**生产以文末「终审记档」③ 逐项裁决 + ④ 生产口径终版为准**：树高锚
 *      ≈10m 裁决 1、夏相果序/春花不做裁决 2、冠幅比 0.8–1.0 维持裁决 3、两段 scaffold
 *      采纳裁决 4、叶色弱差裁决 5）；build 只做 slot → profile 路由，不进
 *      ProceduralBuild 公共签名。
 * 重阳木算法细节差异点（vs triadica 模板，逐条 Spec 引用见 bischofiaShapeProfile
 *      内联注释；主代理 Step 1 判定 A–D 为执行依据）：
 *   - 尺度锚：长江流域公园夏绿单干中龄个体 ≈10m（速生伞形开展——与栾树同量级、高于
 *     乌桕 9.5m 半档；FRPS 上限 15m，生产域 8–12m Inferred——终审裁决 1）——形态参数
 *     域树高 9.9–10.7m（弱领导伞形的涌现折减 +0.2 校正）；干高参数域 0.25–0.33
 *     （form-a 干高 1/4–1/3 双问 [7]）；根径 0.25–0.31m（DBH Unknown——工程设定，
 *     速生中龄个体）。
 *   - 干形：近直立单干（form-a 双株一直一斜 [7]——倾斜个体变体档**记档不建模**：结构
 *     差异不落连续参数，家族同款纪律）→ 主干倾轴幅度 ≤2.9°（jitter 0.05）；根部
 *     flare 轻度 1.18×（basal_flare Unknown——家族常量）。
 *   - 树形：**伞形-开展圆头**（FRPS「树冠伞形状，大枝斜展」Verified [1] + form-a
 *     双问 [7]）——几何侧驱动链（T009.3 消费语义）：**两段 scaffold 角带**
 *     （SCAFFOLD_BAND——挂高段内归一位置分带：下带（<0.45）角域 +15° → 近水平
 *     70–90°（伞形下缘大枝横展，form-a「中下部大枝近水平或略下垂」[7]——下带高端
 *     >90° 的微下垂自然允许）/ 上带（>0.55）−15° → 斜上 40–60°（圆头顶闭合），0.45–
 *     0.55 线性过渡——profile 角域存两带几何平均中带，槽间角域差异整体平移两带；
 *     确定性零 rng）+ **干向挂点高度长度分级**（SCAFFOLD_LENGTH_TAPER ×1.14→×0.72
 *     低枝长高枝短——伞形放张）+ **upturn 链低正**（[0.10,…,0.03] 单调递减——端部
 *     小枝斜上收口 + 冠缘细枝横展微垂读向（winter-fruit [7]）由末级低值 + 下带 90°
 *     上限 + 游走复合承载，不建负链下垂语言（终审裁决 2 同口径））+ **领导枝弱**
 *     0.42（伞形无强单顶——apical_dominance 弱 [1][7]，家族低档）+ 散布方位（螺旋
 *     互生散布——骨架排列 Unknown [7]）+ wander 骨架级 0.10 中高游走（**大枝虬曲**
 *     form-a [7]——vs 先例 0.08–0.09 略抬档）。
 *   - **三出复叶卡挂点语言（家族复叶第二型核心，Step 1 判定 A = 1 卡承载整枚三出
 *     复叶——分卡方案 3 小叶卡/挂点 = 3× tri 成本 + 三卡方位协同复杂度 vs 单卡 2 tri、
 *     档间连续、近景读出（SDF 三叶放射场可读——材质层）三判据，主代理冻结；与 011.6
 *     分化点 = 放射对称型（无轴系窗列）——SDF「三叶场并集 + 裸柄段」vs 栾树「两级窗
 *     列」，接口纪律复用）**：家族「叶簇」槽位 = 末级枝互生平展散布中卡簇——簇内复叶
 *     卡方位 **黄金角互生螺旋**（φ_j = j×137.5° + 抖动——互生 Inferred [7] + 科通则，
 *     语言继承 platanus）+ **平展取向**（PLANE_LIFT 0.12——总柄 9–13.5cm ≈ 0.7–1.5×
 *     小叶长的摆动自由度、多向摊开层叠（域扩展节 B leaf_orientation_dist Inferred
 *     [1][3][7]））+ 略前倾（FORWARD_TILT 0.24）+ 弱抖动（WOBBLE 0.15）；每簇 8 候选
 *     （互生复叶节位合并抽象——中密大叶层叠 Spec §3 的工程映射），通透过滤后逐簇存活
 *     典型 4–7 枚；**卡宽/长比冻结 0.75**（aspect = 1/0.75 ≈ 1.3333 恒定、span 0——
 *     尺寸抖动仅缩放不改比例；三出展幅放射对称宽于栾树羽叶 0.60，Step 1 判定 B）；
 *     卡长 0.28–0.42 / 卡宽 0.21–0.315（真复叶全展幅 20–30cm〔总柄 9–13.5 + 小叶
 *     5–14cm，Verified [1][3]〕× ≈1.4 工程映射——011.6 复叶映射系数沿用）；**卡 v 轴
 *     = 总柄基 0 → 顶小叶尖 1，总柄裸段 v∈[0, 0.35] 为材质 SDF 裸柄线域**（bare 门控
 *     ——011.6 ⑧ 同型，比例由材质侧设计、几何侧 uv 标准 0–1 四边形域不变）；中簇
 *     （0.17–0.23）+ 中间距抑制（minSeparation 0.55×径和）。三小叶结构（顶大侧小/
 *     顶生小叶柄 1.5–4(–6)cm ↔ 侧生 3–14mm 近无柄/小叶卵形-椭圆状卵形/缘钝细齿
 *     4–5/cm/基部圆-浅心/先端突尖-短渐尖）全部归 bischofiaMaterials 三出复叶 SDF 层
 *     （几何不建模）。
 *   - **花/果 = 不做（Step 1 判定 C，终审 ③-2 裁决）**：夏相幼果 2–3mm 亚厘米显著性
 *     极低 + 熟期 10–11 月相外 + 春花 4–5 月相外——**几何无花果账目、无 rng 花果消费、
 *     无 v∈[4,7] uv 域**：皮管弧长域（v = 累计弧长 × 0.5，10m 级最长枝弧实测
 *     v ≤ 1.99）+ 叶卡 0–1 四边形域两域即全部（**「无花果资产」先例接口**——
 *     triadica 有绿闭果入皮组、本例无，差异记档不混淆；比 011.6/011.7 简化一节：
 *     无 Low 附加元素省略问题）。秋冬红果串相/春花/秋色记档不建模
 *     （bischofiaShapeProfile 模块头清单）。
 *   - **uv 域身份标记双重隔离（家族探针断言纪律沿用——platanus v∈[2,3] 与皮管弧长域
 *     碰撞 66 顶点先例教训）**：皮管 v = 累计弧长 × 0.5（10m 级最长枝弧实测 ≤ ≈2.9）
 *     ｜叶卡 uv 标准 0–1 四边形域（组 1）——**v∈[4,7) 顶点数 = 0（无花果域断言——
 *     无花果资产的结构锁）+ 皮组顶点 v < 4**（bischofiaStructure 测试锁；[2.9, 4)
 *     为天然隔离带）。
 *   - 骨架：**6 骨架枝 + 1 领导枝**（scaffold_branch_count Unknown + 伞形开展冠多枝
 *     平展读向——拓扑 L1=7 → 枝数 [7,21,63,189,378]、簇位 945（L4 189×1 + L5 378×2）、
 *     皮面 24178；两段角 6 枝 = 下带 3 枝近水平 + 上带 3 枝斜上的对称分配）。
 *   - 密度语言：中密-中疏带（推断中-疏通透 Spec §3 + young-a 幼树中密 [7] 的中带）：
 *     壳带 0.50 + 芯层地板 0.07（开网）+ 大空腔 0.52–0.90 + 散布平摊浅壳
 *     （clusterShellBias 0.42——互生散布平摊）。
 *   - 树皮近景微起伏：**褐-深灰褐纵裂深沟宽脊 + 裂纹扭转中-深浮雕**（第 9 树皮语言
 *     ——FRPS「树皮褐色，厚6毫米，纵裂」Verified [1] + bark-a 老龄「脊宽沟深、裂纹
 *     扭曲交错/主干扭转感」[7] + bark-b 中龄「纵浅裂窄脊」[7]，建模取中龄档沟深中-
 *     深）——amplitudeRatio 0.028（中-深档——triadica 0.027 附近自定，主代理 Step 1
 *     判定）+ 谐波 {3,4,5}（宽脊低谐波——宽脊 = 低谐波量级）+ drift 6.5 rad/m（**中-
 *     高扭转档**——轴向去相关 ≈0.97m：裂纹扭转交错的短程去相关读向，游走强于顺直
 *     脊沟族 2.6–3.2 与栾 5、弱于悬铃木/榉断裂拼贴 11）。机制不变：纯确定性函数零
 *     rng；幅度 ∝ 局部半径（**亚视觉地板抬档 3.5mm（BISCHOFIA_BARK_RELIEF_MIN_
 *     EFFECTIVE，本资产档——「细枝光滑、纵裂显于主干」双源读向的档位实现：0.028
 *     幅度下起径 <0.125m 的管平滑发射，L1 骨架起径 0.09–0.10 亦在地板下 → **仅主干
 *     有效起伏**、全部分枝管光滑（「细枝红褐-灰褐较光滑带皮孔」fruit-c/bark-a [7]
 *     的几何侧读向——皮孔/色序归材质层；vs 先例 0.0015 亚毫米档（主干+L1 有效），抬
 *     档差异记档））；主干 radial 14（奈奎斯特域 7 容纳 k=5 留 2 档边际）。
 * 不建模（Spec 有事实、几何不表达——记档见 bischofiaShapeProfile 模块头）：三出复叶
 *   内部结构（顶大侧小/小叶柄差/卵形三相/缘钝细齿/基部圆-浅心/纸质——归材质 SDF）/
 *   总柄裸段（v∈[0,0.35] 材质 SDF 裸柄线域——几何 uv 域不变）/ 花与果序（终审 ③-2
 *   不做）/ 秋色黄-橙红 / 新叶红褐 flush / 当年生枝绿色皮孔色序（归材质）/ 芽 /
 *   托叶（早落）/ 叶背色差（Unknown 弱差归材质）/ 倾斜个体（变体档记档）。
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等（High 24178：主干 406 +
 *      L1 1008（7 枝 ×9 段 ×8）+ L2 2352（21 ×8 段 ×7）+ L3 3780（63 ×5 段 ×6）+
 *      L4 7560（189 ×4 段 ×5）+ L5 9072（378 ×3 段 ×4）；枝数 [7,21,63,189,378]——
 *      6 骨架 + 1 领导）；簇位数 945（L4 189×1 + L5 378×2）/ 每簇 8 卡为计数类（rng
 *      消费次数恒定），保留簇数与实际叶卡数随 seed 由簇级距离抑制 + 通透规则确定
 *      （同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律原样沿用）：簇生成与叶片候选的 rng 消费均为无条件固定次数（每簇
 *      2 次 + 每复叶卡 8 次），被簇级距离抑制丢弃的簇位足额消费后丢弃；通透 roll 每卡
 *      无条件 1 次——任何条件跳过都禁止（档间同理：Mid/Low 的发射省略不省略消费）。
 *      **探针闭包教训（011.3 ③）**：rng 消费计数必须用包裹 rng 闭包实测（每次调用即
 *      计数），不得事后重建流复算——消费次数以测试锁定快照为准。结构消费（主干/骨架/
 *      递归/簇位/叶候选）全部固定次数；总消费数随保留簇数变化（通透 roll 计数 = 存活
 *      候选数——簇级剔除的簇位不产候选，八先例同机制记档）——槽内三档恒等（同 seed
 *      同保留簇集）、跨槽/跨 seed 随保留簇数浮动。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值；皮组顶点
 *        树皮语义位恒 0（皮组全 0——无花果附加元素，组 0 = 纯皮拓扑）；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，卡内根→尖非降（根 0.12·hw / 尖 0.52+
 *        0.44·hw，hw = 冠内高度权重）；树皮层同名属性写恒等值 0。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0）；叶卡 UV 标准 0–1 四边形
 *      域（v 轴 = 总柄基 0 → 顶小叶尖 1——三出复叶 SDF 消费归 bischofiaMaterials——
 *      park-shader-agent 并行交付，签名冻结：createBischofiaBarkMaterial /
 *      createBischofiaLeafMaterial / createBischofiaLeafDepthMaterial，均
 *      (level?) => 材质——入口 assets/asset_tree_bischofia.asset 在材质工厂落位后
 *      合并 import，见主代理协调）；叶法线取卡面单侧（cross(side, dir)）。
 * LOD 三档（T011.8，家族方法逐位复制：level 为 Runtime 可选参数——不参与
 *      shapeSlot/morphSeed/sourceKey 形态身份计算；档位缓存维度 = sourceKey + level 归
 *      ProceduralSourceCache）：三档共用**同一条 rng 消费流**与同一套骨架/簇位决策
 *      路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/叶候选照常决策，
 *      枝路径/簇位/冠形包络/通透过滤决策逐位同源（**无花果资产：无附加元素档位取舍节
 *      ——比 011.6/011.7 简一节**）：
 *      - High：全发射（缺省档；皮面数 24178）；树皮微起伏保留；
 *      - Mid：径向段数降（主干/五级 14/8/7/6/5/4 → 6/5/4/3/3/3——粗枝保圆度、细枝
 *        三边管）+ 轴向站点隔 1 抽 1 发射（站点全算·游走 rng 全消费）+ L5 末梢管不
 *        发射（末梢径亚厘米，Mid 观距亚像素；簇位照常派生）+ 簇内叶卡掩码 j % 3 === 1
 *        （中卡簇 8 候选中 3 张（37.5%）——被弃候选足额消费 rng 后不进烘焙；通透过滤
 *        对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位同位）+ 树皮微起伏保留；
 *        皮 4514；
 *      - Low：主干 + L1 骨架极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（每保留簇 2 张交叉竖卡，半幅 = 簇半径 + 0.22m
 *        余量（复叶中卡尺度：卡长 0.28–0.42 的常态伸出中位 ≈ 半卡长，取 0.22 使壳卡
 *        吞并簇半径 + 常态伸出域；极值叶尖（≤ 簇半径 + 0.42 斜伸出）仍由 High 决定
 *        冠包络）；**宽轴 = 0.75 × 半幅——三出复叶卡比例在 Low 壳卡延续**（Step 1
 *        判定 B 的档间连续语义））；皮 370（330 量级档——6 骨架 + 1 领导拓扑）。
 *      预算锁定账目（8 槽 × 3 档实测带 + 锁定依据）见
 *      ../assets/asset_tree_bischofia.asset 模块头（预算制 D19.8，家族行沿用）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BISCHOFIA_SLOT0_PROFILE } from './bischofiaShapeProfile';
import type { BroadleafBarkRelief, BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface LeafCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖 = 总柄基→顶小叶尖；散簇叶恒指簇外平展——卡根朝簇心）
  side: THREE.Vector3; // 卡宽方向（水平随机滚转）
  width: number;
  height: number;
  rand: number; // aLeafRand
  rhat: number; // 簇内归一化半径（互生散簇 shellBias 归一——结构证据账目）
  clusterIndex: number; // 所属簇（存活后归账 clusterLeaves）
  /** 簇内候选序：Mid 发射掩码 j % 3 === 1 的选择位——候选生成/通透过滤/rng 消费对全
   *  候选照常，掩码只在烘焙阶段生效（Mid 存活卡 ⊂ High 存活卡逐位同位） */
  emitOrdinal: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径（枝梢驱动叶簇——家族方法沿用；
 *  重阳木语义 = 末级枝互生平展散布中卡簇的簇空间（无花果承载位——Step 1 判定 C） */
// ——T021.6 收编家族共享契约：类型真相源 = ../broadleaf/broadleafClusterField（本地名零 churn）
type ClusterRecord = BroadleafClusterRecord;

/** 枝干发射槽：非索引三角形流（pos/normal/uv 三数组同步追加） */
interface BarkSink {
  pos: number[];
  nrm: number[];
  uv: number[];
}

/** 枝干通道线段（点到线段距离 < r 即硬抑制——冠内通透规则①） */
interface ChannelSeg {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  r2: number; // 半径平方（判定预热）
}

/** 局部空腔球（冠内通透规则③） */
interface CavitySphere {
  center: THREE.Vector3;
  radius: number;
}

/** 构建上下文：发射槽 + 簇表 + 候选叶卡 + 通道表 + 逐级统计（全树共享，逐枝累加） */
interface BuildCtx {
  bark: BarkSink;
  clusters: ClusterRecord[];
  clustersCulled: number; // 簇级距离抑制丢弃的簇位数（工程账目）
  leafCandidates: LeafCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含领导枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点（冠参考系上界）
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface BischofiaGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 叶卡三角（仅卡——leafCards × 2；无花果附加元素（Step 1 判定 C），组 0 = 纯皮
     *  拓扑、组 1 = 纯叶卡——组账守恒即皮拓扑面数锁 */
    leafTriangles: number;
    leafCards: number;
    /** 通透账目：候选数与三条规则的剔卡数（按首个命中规则计——通道 > 空腔 > 密度） */
    leafCandidates: number;
    channelRejects: number;
    voidRejects: number;
    gradientRejects: number;
    /** 主次分级证据：各级枝数与平均起径（米；L1 含领导枝） */
    levelBranches: number[];
    levelMeanStartRadius: number[];
    /** 冠参考系（密度场判定基准，米；世界坐标 = 贴地平移前） */
    crownCenterY: number;
    crownRadius: number;
    crownHalfHeight: number;
    /** 冠内归一化径向深度 q 五分桶（0–0.2 … 0.8+）：候选数与存活数——保留率随 q 递增
     *  即外密内疏的结构化证据 */
    qCandidates: number[];
    qSurvived: number[];
    /** 通道线段表（诊断/测试口径：ax..bz + 半径 r；世界坐标 = 贴地平移前） */
    channels: { ax: number; ay: number; az: number; bx: number; by: number; bz: number; r: number }[];
    /** 叶簇账目：簇列表（挂簇枝级 / 挂点 / 簇中心 / 半径 / 簇方向 = 挂点枝切向单位向量；
     *  世界坐标 = 贴地平移前，与 channels 同口径）与簇级距离抑制丢弃数 */
    clusters: {
      level: number;
      attachX: number;
      attachY: number;
      attachZ: number;
      cx: number;
      cy: number;
      cz: number;
      radius: number;
      dirX: number;
      dirY: number;
      dirZ: number;
    }[];
    clustersCulled: number;
    /** 逐簇存活散簇卡数（索引对齐 clusters）与 min/mean/max */
    clusterLeaves: number[];
    clusterLeafMin: number;
    clusterLeafMean: number;
    clusterLeafMax: number;
    /** 逐存活卡簇内归一化半径（对齐存活卡烘焙序——互生散簇 shellBias 平摊的结构证据） */
    leafRhat: number[];
  };
}

/** 世界向上基向量（只读复用） */
const UP = new THREE.Vector3(0, 1, 0);

/** rng → [0,1) 均匀；对称抖动 ±span */
function jitter(rng: () => number, span: number): number {
  return (rng() - 0.5) * 2 * span;
}

/** rng → 单位球面随机方向（两次 rng 消费：z 平均分布 + 方位角均匀） */
function randUnit(rng: () => number): THREE.Vector3 {
  const z = rng() * 2 - 1;
  const az = rng() * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return new THREE.Vector3(r * Math.cos(az), z, r * Math.sin(az));
}

/** 点到线段距离平方（通道判定；p 在 [a,b] 参数域外取端点距离） */
function distToSegmentSq(
  px: number,
  py: number,
  pz: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const abz = bz - az;
  const apx = px - ax;
  const apy = py - ay;
  const apz = pz - az;
  const lenSq = abx * abx + aby * aby + abz * abz;
  const t = lenSq > 1e-12 ? Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / lenSq)) : 0;
  const dx = apx - abx * t;
  const dy = apy - aby * t;
  const dz = apz - abz * t;
  return dx * dx + dy * dy + dz * dz;
}

// ── 重阳木三出复叶卡挂点语言常量（结构常数：槽间恒等——改值即改面数与 rng 消费）──

/** 黄金角（互生叶序螺旋步进——互生 Inferred [7] + 科通则的簇内方位语言：φ_j =
 *  j×137.5° + 抖动，语言继承 platanus（vs 银杏莲座均分 2π/n——互生 vs 轮生的方位分化） */
const GOLDEN_ANGLE = 2.39996;
/** 散簇中卡取向常量（互生平展语言——连续形态方法常量，非槽差异维度）：总柄 9–13.5cm
 *  ≈ 0.7–1.5× 小叶长的摆动自由度——**长总柄复叶多向摊开、层叠**（域扩展节 B
 *  leaf_orientation_dist Inferred [1][3][7]：「多向摊开层叠」的平展摊开 + 略前倾 +
 *  弱抖动取向——Step 1 判定 D） */
const ALT_FORWARD_TILT = 0.24; // 沿枝向前倾分量（× 簇方向 T）
const ALT_WOBBLE = 0.15; // 弱球面抖动（互生自然不齐）
const PLANE_LIFT = 0.12; // 叶尖上举分量（平展摊开——长总柄飘逸，先例带内中档）

/** 三出复叶卡宽/长比（主代理冻结 0.75，Step 1 判定 B——三出展幅放射对称宽于栾树羽叶
 *  0.60；卡宽 = 0.75 × 卡长；尺寸抖动仅缩放不改比例；卡 v 轴 = 总柄基 0 → 顶小叶尖
 *  1（总柄裸段 v∈[0,0.35] 归材质 SDF）——材质-几何冻结接口；Low 壳卡宽轴同比例延续 */
const TRIFOLIATE_WIDTH_RATIO = 0.75;

/** 干向挂点高度分级锥度（伞形放张驱动：挂点低枝 ×1.14 → 高枝 ×0.72 的确定性线性
 *  分级，零 rng——低枝长（伞形下缘放张）/ 高枝短（圆头顶收拢）；与 rank 环内势差
 *  正交；两段角带 + 本分级 + 弱领导 = 伞形-开展圆头冠的骨架侧驱动链，FRPS「树冠伞
 *  形状，大枝斜展」Verified [1] + form-a [7] per 终审裁决 4。幅度工程设定（探针回调
 *  记档见 shapeProfile crownWidthRatio 注释） */
const SCAFFOLD_LENGTH_TAPER = [1.14, 0.72] as const;
/** **两段 scaffold 角带（重阳木伞形身份，Step 1 判定 D）**：挂高段内归一位置
 *  attachNorm 分带——下带（<0.45）角域 +15°（近水平 70–90°：伞形下缘大枝横展，
 *  form-a「中下部大枝近水平或略下垂」[7]——下带高端 >90° 的微下垂自然允许）/
 *  上带（>0.55）−15°（斜上 40–60°：圆头顶闭合），0.45–0.55 线性过渡。profile
 *  scaffoldAngleMin/Max 存两带几何平均中带（slot-0 = 55–75 → 下带 70–90 / 上带
 *  40–60，终审裁决 4 数值带）——槽间角域差异整体平移两带（速生窄端slot-1 上移 /
 *  开张宽端 slot-2 下移）。确定性零 rng。带位边界与漂移量工程设定（数值带承重
 *  form-a 双问 [7]） */
const SCAFFOLD_BAND_EDGE0 = 0.45;
const SCAFFOLD_BAND_EDGE1 = 0.55;
const SCAFFOLD_BAND_SHIFT_LOW = 15;
const SCAFFOLD_BAND_SHIFT_HIGH = -15;

// ── LOD 三档发射计划（家族方法复制——档位只改「发射」，不改骨架决策/rng 消费序；
//    无花果资产：无附加元素档位取舍节（Step 1 判定 C）──

/** LOD 发射档：三档共用同一条 rng 流与同一套骨架/簇位决策，差异全在发射密度 */
interface LodEmissionPlan {
  /** 逐管径向段 [主干, L1..L5]（High = profile 原值；Mid/Low 为降段阶梯——粗枝保圆度、
   *  细枝三边管：中景圆度可辨层级以下径向 3 已足，再降破管面下限 3） */
  radial: number[];
  /** 逐管轴向发射站点抽取步长（1 = 全发射；>1 = 每隔 step 站发射一站 + 恒保末站——
   *  站点全算·游走 rng 全消费，路径逐位同 High，发射管为同一曲线的弦近似） */
  stationStep: number[];
  /** L1..L5 逐级是否发射管（false = 只递归不发射——子枝/簇位/rng 照常派生；主干恒发射） */
  emitTube: boolean[];
  /** 簇内叶卡发射掩码（每簇 leavesPerCluster 候选中，仅 j % leafEmitEvery === leafEmitPhase
   *  者进烘焙；候选生成/通透过滤/rng 消费对全候选照常——Mid 存活卡 ⊂ High 存活卡；
   *  中卡簇 8 候选 → j∈{1,4,7} 3 张（37.5%）） */
  leafEmitEvery: number;
  leafEmitPhase: number;
  /** Low 壳卡模式：不烘焙簇内叶卡（候选/过滤照常），逐保留簇发射交叉壳卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（结构依据见模块头 LOD 段；预算记账 = 8 槽实测口径，正式预算带
 * 锁定见 ../assets/asset_tree_bischofia.asset 模块头）：
 * - High 皮 24178（拓扑恒等不动：主干 406（14 段 ×14 + 底盖 14）+ L1 1008（7 枝 ×9 段
 *   ×8）+ L2 2352（21 ×8 段 ×7）+ L3 3780（63 ×5 段 ×6）+ L4 7560（189 ×4 段 ×5）+
 *   L5 9072（378 ×3 段 ×4））；Mid 皮 4514 = 主干 90（7 段 ×6 + 底盖 6）+ L1 350
 *   （7 枝 ×5 段 ×5）+ L2 672（21 ×4 段 ×4）+ L3 1134（63 ×3 段 ×3）+ L4 2268
 *   （189 ×2 段 ×3），L5 不发射；Low 皮 370 = 主干 90 + L1 280（7 枝 ×5 段 ×4）。
 * - Mid 叶 ≈ High 存活卡 × 掩码率（中卡簇 8 选 3 = 37.5%）；8 槽实测落 6–10K 带。
 * - Low 叶 = 保留簇数 × 2 壳卡 × 2 三角；8 槽实测落 1.5–3K 带。
 */
function lodPlanFor(profile: BroadleafShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    // 缺省档全发射：profile 原值直读 + 步长 1（thinStations 原数组透传）——皮面数
    // 24178 / rng 消费快照（bischofiaLod 测试锁）延续
    return {
      radial: [profile.trunk.radial, ...profile.levels.map((l) => l.radial)],
      stationStep: [1, 1, 1, 1, 1, 1],
      emitTube: [true, true, true, true, true],
      leafEmitEvery: 1,
      leafEmitPhase: 0,
      shellCards: false,
    };
  }
  if (level === 'mid') {
    // 径向 14/8/7/6/5/4 → 6/5/4/3/3/3（骨架枝 5 边保中景圆度）+ 隔 1 抽 1 + L5 末梢
    // 不发射（亚厘米径亚像素）+ 叶卡掩码 j%3===1（中卡簇 8 选 3——8 槽实测 High 卡 →
    // Mid 总面落 6–10K 预算带的档率）
    return {
      radial: [6, 5, 4, 3, 3, 3],
      stationStep: [2, 2, 2, 2, 2, 2],
      emitTube: [true, true, true, true, false],
      leafEmitEvery: 3,
      leafEmitPhase: 1,
      shellCards: false,
    };
  }
  // Low：主干 + L1 骨架极简管（径向 6/4——干身剪影保圆度、骨架枝 4 边够远距读向）；
  // L2–L5 不发射（递归照常走完消费 rng/派生簇位）；冠层转壳卡模式
  return {
    radial: [6, 4, 3, 3, 3, 3],
    stationStep: [2, 2, 2, 2, 2, 2],
    emitTube: [true, false, false, false, false],
    leafEmitEvery: 1,
    leafEmitPhase: 0,
    shellCards: true,
  };
}

/** 轴向站点抽取（step ≤ 1 原数组透传——High 逐位不变；step > 1 每 step 站取一 + 恒保末站） */
function thinStations<T>(list: T[], step: number): T[] {
  if (step <= 1) return list;
  const out: T[] = [];
  for (let i = 0; i < list.length; i += step) out.push(list[i]!);
  const last = list[list.length - 1]!;
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/** Low 壳卡半幅余量（米）：High 散簇三出复叶中卡自簇心的最大伸出 ≈ 簇半径 + 卡长
 *  （≤0.42m 斜向——中卡 0.21–0.315 宽 × 长/宽 1.3333 恒比例 ⇒ 卡长 0.28–0.42m），
 *  典型伸出（r̂≤1 壳位 + 互生平摊）中位 ≈ 半卡长 0.14–0.21m——取 0.22（中卡档：
 *  悬铃木 0.16 大卡 / 栾树 0.58 复叶大卡 / 乌桕 0.10 中小卡的缩放档）使壳卡吞并簇
 *  半径 + 常态伸出域，且极值叶尖仍由 High 决定冠包络（Low 不涨出——8 槽实测 Low
 *  水平跨恒窄于 High，档间 bbox 一致性测试容差依据见 bischofiaLod） */
const LOW_SHELL_MARGIN = 0.22;
/** Low 每保留簇壳卡数（交叉双竖卡：任意水平方位至少一卡正面可读——确定性几何，非 billboard） */
const LOW_SHELL_CARDS_PER_CLUSTER = 2;

/** Low 壳卡逐卡身份（aLeafRand 契约值 ∈ [0,1)）：簇心 sin 散列 + 第二卡派生错相（零 rng
 *  ——簇位表跨档同源，壳卡身份随簇确定；同簇双卡色相微错开避免同色块读向） */
function shellCardRandOf(cx: number, cy: number, cz: number, derive: number): number {
  const base = fract01(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453);
  return derive === 0 ? base : fract01(base * 7.31 + 0.37);
}

/** x → [0,1)（确定性散列分量） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

/**
 * Low 壳卡发射：簇心交叉竖卡——宽轴 w（水平单位向量）× 宽半幅 = **0.75 × 半幅**
 * （**三出复叶卡比例 0.75 在 Low 壳卡延续**——Step 1 判定 B 的档间剪影语义一致）、
 * 高轴 UP × 半幅；六顶点卡 / uv 0–1 四边形域 / aLeafRand / aBend 契约与 High 叶卡
 * 同构（根边 v=0、尖边 v=1；aBend 根 0.12·hw / 尖 0.52+0.44·hw 与 High 同公式同常数
 * ——档间风相位/摆幅语义一致，D19.7）；卡面法线 = w × UP（水平——竖卡双面读向）。
 */
function emitShellCard(
  pos: number[],
  nrm: number[],
  uv: number[],
  rand: number[],
  bend: number[],
  center: THREE.Vector3,
  w: THREE.Vector3,
  half: number,
  cardRand: number,
  hw: number,
): void {
  const bendRoot = 0.12 * hw; // 根边（簇挂枝端语义）≈ 0
  const bendTip = 0.52 + 0.44 * hw; // 尖边大；树顶簇 > 树底簇（同 High 公式）
  const halfW = half * TRIFOLIATE_WIDTH_RATIO; // 复叶卡比例 0.75 延续（宽轴）
  const r0 = center.clone().addScaledVector(w, -halfW);
  const r1 = center.clone().addScaledVector(w, halfW);
  const t0 = r0.clone().addScaledVector(UP, half);
  const t1 = r1.clone().addScaledVector(UP, half);
  const n = w.clone().cross(UP).normalize();
  const verts: [THREE.Vector3, number, number, number][] = [
    [r0, 0, 0, bendRoot],
    [r1, 1, 0, bendRoot],
    [t1, 1, 1, bendTip],
    [r0, 0, 0, bendRoot],
    [t1, 1, 1, bendTip],
    [t0, 0, 1, bendTip],
  ];
  for (const [v, u, vv, b] of verts) {
    pos.push(v.x, v.y, v.z);
    nrm.push(n.x, n.y, n.z);
    uv.push(u, vv);
    rand.push(cardRand);
    bend.push(b);
  }
}

// ── 树皮近景微起伏：固定形态常数（方法层，家族沿用）——非槽差异维度，可调面
//    全在 shapeProfile.barkRelief 三字段（重阳木幅度/谐波/游走率见
//    bischofiaShapeProfile）──
/** 谐波权重基线（低次主导；按 harmonics 序循环取用后归一） */
const BARK_RELIEF_WEIGHT_BASE = [0.42, 0.33, 0.25];
/** 相位游走正弦项频率（rad/m）/幅度（rad）——沿轴缓变游走分量 */
const BARK_RELIEF_WANDER_FREQ = 1.6;
const BARK_RELIEF_WANDER_AMP = 0.5;
/** 脊深呼吸（权重沿轴调制）频率（rad/m）/幅度——起伏深浅沿干交错（重阳木「纵裂深沟
 *  宽脊 + 扭转」的脊沟深浅交错读向 [1][7]——扭转交错的短程去相关由 drift 6.5 承载，
 *  呼吸调制脊沟深浅缓变；幅度工程设定） */
const BARK_RELIEF_BREATHE_FREQ = 2.4;
const BARK_RELIEF_BREATHE_AMP = 0.3;
/** 亚视觉幅度地板（米，峰值，**重阳木抬档 3.5mm——本资产档**）：管起径 ×
 *  amplitudeRatio < 此值 → 该管整体跳过起伏。抬档依据（主代理 Step 1 判定「仅主干
 *  有效」）：FRPS「树皮褐色，厚6毫米，纵裂」[1] 纵裂显于主干 + bark-a「细枝深褐较
 *  光滑」/fruit-c「红褐细枝较光滑带皮孔」[7] 细枝光滑双源——0.028 幅度下起径
 *  <0.125m 的管（L1 骨架起径 0.09–0.10 亦在内）平滑发射 → **仅主干有效起伏**、
 *  全部分枝管光滑（vs 先例 0.0015 亚毫米档（triadica 0.027 下主干 + L1 有效）——
 *  档位差异记档：重阳木细枝光滑读向的抬档实现，皮孔/色序归材质层） */
const BISCHOFIA_BARK_RELIEF_MIN_EFFECTIVE = 0.0035;

/** 管起点确定性相位源：位置 + 起径的 sin 散列（零 rng；同位同相位——确定性不破，
 *  跨 seed 因起径/站位差异自然去克隆——主干起点虽恒原点，r0 随 seed 变化） */
function barkReliefPhaseSeed(px: number, py: number, pz: number, r0: number): number {
  return fract01(Math.sin(px * 12.9898 + py * 78.233 + pz * 37.719 + r0 * 53.71) * 43758.5453);
}

/** 单谐波沿轴缓变函数的常量系数（由管起点散列派生；phi(s)/w(s) 见 computeReliefRing） */
interface ReliefHarmonic {
  /** 环向谐波数（整数——θ 周期性的来源） */
  k: number;
  /** 相位原点 */
  psi: number;
  /** 轴向游走率（±drift 域内确定性取值——重阳木 drift 6.5：裂纹**扭转**（bark-a
   *  「裂纹扭曲交错/主干扭转感」[7]——轴向去相关 ≈2π/6.5 ≈ 0.97m 的扭转交错读向）；
   *  顺直脊沟族（银杏 ±2.6/樟 ±3.2/乌桕 ±2.8 纵脊长程连续）/ 栾 ±5 局部细裂 /
   *  悬铃木-榉 ±11 断裂拼贴。速率值 = profile.barkRelief.drift） */
  driftRate: number;
  /** 游走正弦相位 */
  chi: number;
  /** 呼吸正弦相位 */
  omega: number;
  /** 权重基线（归一） */
  baseW: number;
}

/** 单环起伏预算：径向各 θ 位的位移与解析导数（顶点位置/法线共用；cos/sin 一并预算） */
interface ReliefRing {
  d: Float64Array;
  dTheta: Float64Array;
  dS: Float64Array;
  cos: Float64Array;
  sin: Float64Array;
}

/** 逐站点谐波沿轴相位/权重状态（emitTube 单管私有 scratch，避免逐环分配） */
interface ReliefPhaseScratch {
  phi: Float64Array;
  dPhi: Float64Array;
  w: Float64Array;
  dW: Float64Array;
}

/** 管谐波状态：harmonics 序 → 权重基线（循环取 BARK_RELIEF_WEIGHT_BASE 后归一）+
 *  相位/游走/呼吸系数（管起点散列派生的确定性纯函数，零 rng） */
function buildReliefHarmonics(origin: THREE.Vector3, r0: number, relief: BroadleafBarkRelief): ReliefHarmonic[] {
  const seed = barkReliefPhaseSeed(origin.x, origin.y, origin.z, r0);
  const raw = relief.harmonics.map((_, m) => BARK_RELIEF_WEIGHT_BASE[m % BARK_RELIEF_WEIGHT_BASE.length]!);
  const wSum = raw.reduce((sum, w) => sum + w, 0);
  return relief.harmonics.map((k, m) => ({
    k,
    psi: Math.PI * 2 * fract01(seed * (7.31 + 2.93 * m)),
    driftRate: relief.drift * (2 * fract01(seed * (3.77 + 1.71 * m)) - 1),
    chi: Math.PI * 2 * fract01(seed * (5.13 + 2.37 * m)),
    omega: Math.PI * 2 * fract01(seed * (9.29 + 3.17 * m)),
    baseW: raw[m]! / wSum,
  }));
}

/**
 * 填充单环起伏预算：d(θ,s) = A·Σₘ wₘ(s)·cos(kₘθ + φₘ(s))，A = amplitudeRatio × 环基准
 * 半径；d_θ/d_s 为解析导数（法线修正源）。φₘ(s) = ψₘ + driftₘ·s + wander 正弦项
 * （重阳木 driftₘ ±6.5 rad/m——裂纹扭转交错）、wₘ(s) = baseWₘ·(1 + breathe 正弦项)
 * （脊沟深浅呼吸）——均弧长 s 的缓变函数。amplitudeRatio ≤ 0（亚视觉地板跳过路径）
 * 时三数组清零——环 cos/sin 仍预算（发射共享）。
 */
function computeReliefRing(
  out: ReliefRing,
  scratch: ReliefPhaseScratch,
  radial: number,
  s: number,
  rBase: number,
  harmonics: ReliefHarmonic[],
  amplitudeRatio: number,
): void {
  for (let j = 0; j < radial; j++) {
    const th = (j / radial) * Math.PI * 2;
    out.cos[j] = Math.cos(th);
    out.sin[j] = Math.sin(th);
  }
  if (amplitudeRatio <= 0) {
    out.d.fill(0);
    out.dTheta.fill(0);
    out.dS.fill(0);
    return;
  }
  const M = harmonics.length;
  for (let m = 0; m < M; m++) {
    const h = harmonics[m]!;
    const wanderArg = BARK_RELIEF_WANDER_FREQ * s + h.chi;
    const breatheArg = BARK_RELIEF_BREATHE_FREQ * s + h.omega;
    scratch.phi[m] = h.psi + h.driftRate * s + BARK_RELIEF_WANDER_AMP * Math.sin(wanderArg);
    scratch.dPhi[m] = h.driftRate + BARK_RELIEF_WANDER_AMP * BARK_RELIEF_WANDER_FREQ * Math.cos(wanderArg);
    scratch.w[m] = h.baseW * (1 + BARK_RELIEF_BREATHE_AMP * Math.sin(breatheArg));
    scratch.dW[m] = h.baseW * BARK_RELIEF_BREATHE_AMP * BARK_RELIEF_BREATHE_FREQ * Math.cos(breatheArg);
  }
  const A = amplitudeRatio * rBase;
  for (let j = 0; j < radial; j++) {
    const th = (j / radial) * Math.PI * 2;
    let d = 0;
    let dTheta = 0;
    let dS = 0;
    for (let m = 0; m < M; m++) {
      const h = harmonics[m]!;
      const arg = h.k * th + scratch.phi[m]!;
      const ca = Math.cos(arg);
      const sa = Math.sin(arg);
      const w = scratch.w[m]!;
      d += w * ca;
      dTheta -= w * h.k * sa;
      dS += scratch.dW[m]! * ca - w * scratch.dPhi[m]! * sa;
    }
    out.d[j] = A * d;
    out.dTheta[j] = A * dTheta;
    out.dS[j] = A * dS;
  }
}

/**
 * 发射单个起伏管顶点：位置 = p + R·(cosθ·N + sinθ·B)（R = r + d——位移沿环向外向）；
 * 法线 = 参数面 X(θ,s) = C(s) + R·e(θ) 导数的解析修正：n ∝ e − (d_θ/R)·ē − d_s·T
 * （ē = −sinθ·N + cosθ·B；量纲：θ 的米制弧长 = R·dθ → 环向坡度 = d_θ/R，s 已是米 →
 * 轴向坡度 = d_s 直接使用不除 R；锥度项沿现状约定忽略——起伏坡度倾斜进法线、平滑
 * 外向、禁平面着色化）；uv 透传不变。
 */
function emitReliefVertex(
  sink: BarkSink,
  ring: ReliefRing,
  j: number,
  p: THREE.Vector3,
  n: THREE.Vector3,
  b: THREE.Vector3,
  t: THREE.Vector3,
  rBase: number,
  u: number,
  vT: number,
): void {
  const c = ring.cos[j]!;
  const s = ring.sin[j]!;
  const R = rBase + ring.d[j]!;
  const g = ring.dTheta[j]! / R; // 环向坡度（θ 米制弧长 = R·dθ → 除 R）
  const h = ring.dS[j]!; // 轴向坡度（s 已是米——不除 R）
  const nx = c + g * s;
  const ny = s - g * c;
  const nz = -h;
  const inv = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
  sink.pos.push(p.x + (n.x * c + b.x * s) * R, p.y + (n.y * c + b.y * s) * R, p.z + (n.z * c + b.z * s) * R);
  sink.nrm.push(
    (nx * n.x + ny * b.x + nz * t.x) * inv,
    (nx * n.y + ny * b.y + nz * t.y) * inv,
    (nx * n.z + ny * b.z + nz * t.z) * inv,
  );
  sink.uv.push(u, vT);
}

/**
 * 锥度管发射：沿站点序列（points/radii 等长）平行传输标架，逐段发射外向绕制四边形
 * （三角形 (a0,b1,b0)/(a0,a1,b1)——右手系 (N,B,T) 下外向），uv = 环向 θ/2π × 累计弧长。
 * 树皮近景微起伏：每环预算 ReliefRing（位移 + 导数 + cos/sin）后发射——同一环顶点跨
 * 相邻四边形复用同一预算值，wrap 位（j=radial−1 的 th1）直接取 j=0 的预算值，
 * 环向浮点级无缝（顶点位置差恰为 0）；拓扑/绕序/uv 与无起伏路径完全一致。
 */
function emitTube(
  sink: BarkSink,
  points: THREE.Vector3[],
  radii: number[],
  radial: number,
  vScale: number,
  relief: BroadleafBarkRelief,
): void {
  const stations = points.length;
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < stations; i++) {
    const prev = points[Math.max(0, i - 1)]!;
    const next = points[Math.min(stations - 1, i + 1)]!;
    tangents.push(next.clone().sub(prev).normalize());
  }
  // 平行传输法向：首站取与世界 up 最不共线基，后续投影去切向分量
  const normals: THREE.Vector3[] = [];
  const t0 = tangents[0]!;
  let seed = Math.abs(t0.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  normals.push(seed.clone().sub(t0.clone().multiplyScalar(t0.dot(seed))).normalize());
  for (let i = 1; i < stations; i++) {
    const t = tangents[i]!;
    const n = normals[i - 1]!.clone().sub(t.clone().multiplyScalar(t.dot(normals[i - 1]!)));
    if (n.lengthSq() < 1e-8) n.copy(seed).sub(t.clone().multiplyScalar(t.dot(seed)));
    normals.push(n.normalize());
  }
  const arcs: number[] = [0];
  for (let i = 1; i < stations; i++) arcs.push(arcs[i - 1]! + points[i]!.distanceTo(points[i - 1]!));

  // 起伏预算流：逐管谐波状态（起点散列派生）+ 双环 ping-pong（环 A 沿段间传递复用）。
  // 亚视觉地板（重阳木抬档 3.5mm）：起径 × 幅度比 < 0.0035 的管（L1 骨架起径
  // 0.09–0.10 亦在内）整体按 0 起伏发射——仅主干有效起伏、全部分枝管光滑（「细枝
  // 红褐-灰褐较光滑带皮孔」[7] 的几何侧读向，皮孔/色序归材质层；抬档依据见常量注释）
  const effectiveAmplitude =
    relief.amplitudeRatio * radii[0]! >= BISCHOFIA_BARK_RELIEF_MIN_EFFECTIVE ? relief.amplitudeRatio : 0;
  const harmonics = buildReliefHarmonics(points[0]!, radii[0]!, relief);
  const scratch: ReliefPhaseScratch = {
    phi: new Float64Array(harmonics.length),
    dPhi: new Float64Array(harmonics.length),
    w: new Float64Array(harmonics.length),
    dW: new Float64Array(harmonics.length),
  };
  const makeRing = (): ReliefRing => ({
    d: new Float64Array(radial),
    dTheta: new Float64Array(radial),
    dS: new Float64Array(radial),
    cos: new Float64Array(radial),
    sin: new Float64Array(radial),
  });
  let ringA = makeRing();
  let ringB = makeRing();
  computeReliefRing(ringA, scratch, radial, arcs[0]!, radii[0]!, harmonics, effectiveAmplitude);

  for (let i = 0; i < stations - 1; i++) {
    const tA = tangents[i]!;
    const nA = normals[i]!;
    const bA = tA.clone().cross(nA); // B = T×N（(N,B,T) 右手系）
    const tB = tangents[i + 1]!;
    const nB = normals[i + 1]!;
    const bB = tB.clone().cross(nB);
    const pA = points[i]!;
    const pB = points[i + 1]!;
    const rA = radii[i]!;
    const rB = radii[i + 1]!;
    const vA = arcs[i]! * vScale;
    const vB = arcs[i + 1]! * vScale;
    computeReliefRing(ringB, scratch, radial, arcs[i + 1]!, rB, harmonics, effectiveAmplitude);
    for (let j = 0; j < radial; j++) {
      const j1 = (j + 1) % radial; // wrap 位取 j=0 预算值——θ=2π ≡ 0 浮点级一致
      const u0 = j / radial;
      const u1 = (j + 1) / radial;
      // 顶点流：a0 a1 b1 | a0 b1 b0（外向绕制——绕序与起伏无关，保持不变）
      emitReliefVertex(sink, ringA, j, pA, nA, bA, tA, rA, u0, vA);
      emitReliefVertex(sink, ringA, j1, pA, nA, bA, tA, rA, u1, vA);
      emitReliefVertex(sink, ringB, j1, pB, nB, bB, tB, rB, u1, vB);
      emitReliefVertex(sink, ringA, j, pA, nA, bA, tA, rA, u0, vA);
      emitReliefVertex(sink, ringB, j1, pB, nB, bB, tB, rB, u1, vB);
      emitReliefVertex(sink, ringB, j, pB, nB, bB, tB, rB, u0, vB);
    }
    const swap = ringA;
    ringA = ringB;
    ringB = swap;
  }
}

/** 主干底盖：封住从上方斜看进空心干身的可见洞；扇面 (c, V_j, V_{j+1})，法线 +Y。
 *  保持无起伏（近地视角不可见——树基 minY=0 贴地，盖沿与管壁首环的 ≤ 5mm 环形错位
 *  由地面遮挡；封洞功能不受影响）。 */
function emitBaseCapTri(sink: BarkSink, center: THREE.Vector3, radius: number, radial: number): void {
  const tangent = new THREE.Vector3(0, 1, 0); // 主干首站切向恒近 +Y（lean 幅度 ≤2.9°）
  const seed = Math.abs(tangent.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const n = seed.clone().sub(tangent.clone().multiplyScalar(tangent.dot(seed))).normalize();
  const b = tangent.clone().cross(n);
  for (let j = 0; j < radial; j++) {
    const th0 = (j / radial) * Math.PI * 2;
    const th1 = ((j + 1) / radial) * Math.PI * 2;
    const v0 = center.clone().addScaledVector(n, radius * Math.cos(th0)).addScaledVector(b, radius * Math.sin(th0));
    const v1 = center.clone().addScaledVector(n, radius * Math.cos(th1)).addScaledVector(b, radius * Math.sin(th1));
    for (const [vtx, u, vv] of [
      [center, 0.5, 0.5],
      [v0, 0.5 + 0.5 * Math.cos(th0), 0.5 + 0.5 * Math.sin(th0)],
      [v1, 0.5 + 0.5 * Math.cos(th1), 0.5 + 0.5 * Math.sin(th1)],
    ] as const) {
      sink.pos.push(vtx.x, vtx.y, vtx.z);
      sink.nrm.push(tangent.x, tangent.y, tangent.z);
      sink.uv.push(u, vv);
    }
  }
}

/**
 * 主生成入口：rng（morphRng）+ shapeProfile → 合并几何 + 账目。
 * 拓扑：主干（含根部 flare）→ 6 骨架枝 + 1 领导枝（L1）→ 逐级递归（L2×3 / L3×3 / L4×3 /
 * L5×2 末梢）；枝角/长度/粗度/曲率 rng 驱动（骨架枝两段角带（挂高段归一位置分带：
 * 下带 +15° 近水平 70–90° / 上带 −15° 斜上 40–60°，SCAFFOLD_BAND 确定性零 rng）+
 * 干向挂点高度长度分级（×1.14→×0.72 伞形放张）+ upturn 链低正（冠缘微垂读向）+
 * wander 0.10 中高游走（大枝虬曲 [7]）——伞形-开展圆头冠的结构成因，FRPS「树冠伞
 * 形状，大枝斜展」Verified [1] + 终审裁决 4；领导枝 0.42 弱续顶——伞形顶由上带
 * 骨架链共构）。三出复叶卡挂点：末两级枝梢互生平展散布中卡簇（中簇 + 8 候选复叶
 * 中卡黄金角互生螺旋）。主次分级与冠内通透规则见模块头。
 * profile 缺省 = slot-0 标准组合（锚点回落——单测直调便捷路径，资产路径显式传槽
 * profile）。level 缺省 = 'high'（三档同流派生——档位只改发射密度，不改骨架决策/
 * rng 消费序，见 lodPlanFor）。
 */
export function buildBischofiaGeometry(
  rng: () => number,
  profile: BroadleafShapeProfile = BISCHOFIA_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): BischofiaGeometryResult {
  const lod = lodPlanFor(profile, level);
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    clusters: [],
    clustersCulled: 0,
    leafCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（shapeProfile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = 9.9 + rng() * 0.8; // 形态参数域 9.9–10.7m（≈10m 主代理裁定——速生伞形开展与栾树同量级、FRPS 上限 15m 生产域 8–12m Inferred 收口，终审裁决 1；速生上探 12 变体入 slot-1 领导链；实测涌现带见 asset 模块头——10m 级领导链复利外伸的种子实现差异，各槽领导比回调研 profile 注释）
  const crownRadius = (totalHeight * profile.crownWidthRatio * 0.5) * (0.94 + rng() * 0.12); // 冠幅半径 = 冠幅比驱动（含 ±6% 抖动）——Spec 工程/家族域 0.7–1.0 涌现（探针定档见 profile）
  const trunkBaseR = 0.25 + rng() * 0.06; // 根径 0.25–0.31m（DBH Unknown——8–12m 中龄个体干径 25–45cm 无标尺推断 [7] 不承重，工程设定；家族带内）
  const trunkH = totalHeight * (0.25 + rng() * 0.08); // 干高 25–33%（form-a 干高 1/4–1/3 双问 Inferred [7] 的工程域）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.05)); // 主干倾轴（≤2.9°——单干典型；倾斜个体变体记档不建模 [7]）

  // ── 主干：14 环段锥度曲线（根部 flare 1.18×指数衰减 × 0.42 顶径锥度——basal_flare
  //    Unknown、taper Unknown 沿家族常量）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * 0.42;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + 0.18 * Math.exp(-t * 7); // 根部张拉（轻度——家族常量）
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < profile.trunk.segs) {
      dir.add(randUnit(rng).multiplyScalar(profile.trunk.wander)).add(UP.clone().multiplyScalar(profile.trunk.upturn * 0.1)).normalize();
      p = p.clone().addScaledVector(dir, trunkH / profile.trunk.segs);
    }
  }
  emitTube(
    bark,
    thinStations(trunkPts, lod.stationStep[0]!),
    thinStations(trunkRadii, lod.stationStep[0]!),
    lod.radial[0]!,
    0.5,
    profile.barkRelief,
  );
  // 底盖独立性说明：emitBaseCapTri 保持无起伏（近地视角不可见——盖沿与管壁首环的
  // ≤5mm 环形错位由地面遮挡；封洞功能不受影响）
  emitBaseCapTri(bark, trunkPts[0]!, trunkRadii[0]!, lod.radial[0]!);
  ctx.maxY = Math.max(ctx.maxY, trunkPts[trunkPts.length - 1]!.y);

  /** 主干半径插值（挂点处子枝起径连续源） */
  const trunkRadiusAt = (t: number): number => {
    const idx = t * profile.trunk.segs;
    const i = Math.min(profile.trunk.segs - 1, Math.floor(idx));
    return THREE.MathUtils.lerp(trunkRadii[i]!, trunkRadii[i + 1]!, idx - i);
  };
  const trunkPointAt = (t: number): THREE.Vector3 => {
    const idx = t * profile.trunk.segs;
    const i = Math.min(profile.trunk.segs - 1, Math.floor(idx));
    return trunkPts[i]!.clone().lerp(trunkPts[i + 1]!, idx - i);
  };

  // ── L1 骨架枝 ×6（**两段角带**（SCAFFOLD_BAND——挂高段归一位置 attachNorm 分带：
  //    下带（<0.45）角域 +15° → 近水平 70–90°（伞形下缘大枝横展）/ 上带（>0.55）
  //    −15° → 斜上 40–60°（圆头顶闭合），0.45–0.55 线性过渡——profile 角域 55–75
  //    存两带中带；确定性零 rng，槽间角域差异整体平移两带）；方位 60° 均分 +
  //    asymmetry 0.46 散布抖动 = 螺旋互生散布（骨架排列 Unknown [7]）；挂高
  //    0.62–0.86 干高段 span 0.24（干高 1/4–1/3 form-a [7] 的映射带）；rank 乘子承担
  //    环内势差 + 干向挂点高度长度分级 SCAFFOLD_LENGTH_TAPER ×1.14→×0.72（伞形放张
  //    ——低枝长高枝短）；wander 0.10 中高游走（大枝虬曲 [7]）──
  const scaffoldCount = profile.scaffoldCount;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const rank = Math.min(i, profile.scaffoldRankLength.length - 1);
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, profile.asymmetry * 0.88); // 方位抖动 ±25°·(asymmetry/0.5)——互生散布
    const attachT = profile.scaffoldAttachMin + (i / scaffoldCount) * profile.scaffoldAttachSpan + jitter(rng, 0.06);
    // 挂点在挂高段内归一位置（两段角带判据 + 长度分级的驱动量）
    const attachNorm = THREE.MathUtils.clamp(
      (attachT - profile.scaffoldAttachMin) / Math.max(profile.scaffoldAttachSpan, 1e-4),
      0,
      1,
    );
    // 两段角带（重阳木伞形身份）：下带 +15°（近水平 70–90）/ 上带 −15°（斜上 40–60）、
    // 0.45–0.55 线性过渡——确定性随 attachNorm 插值（下带高端 >90° 的微下垂自然允许
    // ——form-a「近水平或略下垂」[7]）
    const bandT = THREE.MathUtils.clamp(
      (attachNorm - SCAFFOLD_BAND_EDGE0) / (SCAFFOLD_BAND_EDGE1 - SCAFFOLD_BAND_EDGE0),
      0,
      1,
    );
    const bandShift = THREE.MathUtils.lerp(SCAFFOLD_BAND_SHIFT_LOW, SCAFFOLD_BAND_SHIFT_HIGH, bandT);
    // 起角（对铅垂）→ 方向分量：水平 sin / 铅垂 cos
    const tiltMin = profile.scaffoldAngleMin + bandShift;
    const tiltMax = Math.max(tiltMin + 2, profile.scaffoldAngleMax + bandShift);
    const tilt = THREE.MathUtils.degToRad(tiltMin + rng() * (tiltMax - tiltMin));
    const conicalGrade = THREE.MathUtils.lerp(SCAFFOLD_LENGTH_TAPER[0], SCAFFOLD_LENGTH_TAPER[1], attachNorm);
    const length = crownRadius * profile.scaffoldRankLength[rank]! * (0.94 + rng() * 0.12) * conicalGrade;
    const attach = trunkPointAt(attachT);
    const dirH = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    const bDir = dirH.clone().multiplyScalar(Math.sin(tilt)).add(UP.clone().multiplyScalar(Math.cos(tilt))).normalize();
    const startR = trunkRadiusAt(attachT) * profile.scaffoldThickness * profile.scaffoldRankRadius[rank]!;
    growBranch(ctx, rng, profile, lod, 0, attach, bDir, length, startR, az);
    // 枝干通道②：骨架枝基段保护带（初方向直线近似——主干大枝进冠不被封死）
    ctx.channels.push(
      segOf(attach, attach.clone().addScaledVector(bDir, length * profile.channelLengthRatio), profile.channelRadius * profile.channelBranchScale),
    );
  }
  // ── L1 领导枝 ×1（apical_dominance 弱 Verified [1]+Inferred [7]——伞形顶由上带
  //    骨架链共构、领导不翻转树顶；leaderLengthRatio 0.42 家族低档表达强度，直立
  //    系数 0.92 为家族方法常量）──
  const leaderAz = rng() * Math.PI * 2;
  const leaderDir = new THREE.Vector3(Math.cos(leaderAz) * 0.4, 0.92, Math.sin(leaderAz) * 0.4).normalize();
  const leaderLen = (totalHeight - trunkH) * (profile.leaderLengthRatio + rng() * 0.08);
  const leaderAttach = trunkPointAt(0.98);
  const leaderProtectEnd = leaderAttach.clone().addScaledVector(leaderDir, leaderLen * profile.channelLengthRatio);
  growBranch(
    ctx,
    rng,
    profile,
    lod,
    0,
    leaderAttach,
    leaderDir,
    leaderLen,
    trunkRadiusAt(0.98) * 0.62,
    leaderAz,
  );
  // 枝干通道①：主干→领导枝保护段终点 = 连续中轴保护带（主干近直立 + 领导枝 0.92 直立，
  // 近共线直线近似）——主干大枝进冠不被封死；骨架枝基段保护带见上
  ctx.channels.push(segOf(new THREE.Vector3(0, 0, 0), leaderProtectEnd, profile.channelRadius));
  ctx.channels.push(segOf(leaderAttach, leaderProtectEnd, profile.channelRadius * profile.channelBranchScale));

  // ── 冠参考系（密度场判定基准）：中心/半高按 profile 比例 × 全树实际高，半径 = 冠幅生成参数 ──
  const treeTopY = ctx.maxY;
  const crownCenterY = treeTopY * profile.crownCenterRatio;
  const crownHalfH = treeTopY * profile.crownHeightRatio * 0.5;
  const crownR = crownRadius * 1.06; // 叶位径向外扩余量

  // ── 局部空腔（规则③）：rng 固定消费（每腔 4 次）——同 seed 同空腔 ──
  const voids: CavitySphere[] = [];
  for (let i = 0; i < profile.voidCount; i++) {
    const d = randUnit(rng); // 2 次
    const rr = profile.voidCenterBias * (0.25 + 0.75 * Math.sqrt(rng())); // 偏内分布
    const center = new THREE.Vector3(
      d.x * rr * crownR,
      crownCenterY + d.y * rr * crownHalfH * 0.8, // 垂直向压扁（冠形）
      d.z * rr * crownR,
    );
    voids.push({ center, radius: profile.voidRadiusMin + rng() * (profile.voidRadiusMax - profile.voidRadiusMin) });
  }

  // ── 冠内通透过滤：通道（硬）→ 空腔（硬）→ 密度场（rng 概率；每卡无条件消费 1 次——确定性）──
  const leafCards: LeafCard[] = [];
  let channelRejects = 0;
  let voidRejects = 0;
  let gradientRejects = 0;
  const qCandidates = [0, 0, 0, 0, 0];
  const qSurvived = [0, 0, 0, 0, 0];
  /** 冠内归一化径向深度（与密度场同口径：水平半径 / 该高度冠壳半径，端盖保护 0.3） */
  const qOf = (c: THREE.Vector3): number => {
    const dy = (c.y - crownCenterY) / crownHalfH;
    const shellFactor = Math.sqrt(Math.max(0, 1 - dy * dy));
    const rShell = Math.max(shellFactor, 0.3) * crownR;
    return Math.hypot(c.x, c.z) / rShell;
  };
  for (const card of ctx.leafCandidates) {
    const c = card.center;
    const qBucket = Math.min(4, Math.floor(qOf(c) / 0.2));
    qCandidates[qBucket]!++;
    const roll = rng(); // 无条件消费（消费次数与数据分支无关）
    let keep = true;
    if (keep) {
      for (const ch of ctx.channels) {
        if (distToSegmentSq(c.x, c.y, c.z, ch.ax, ch.ay, ch.az, ch.bx, ch.by, ch.bz) < ch.r2) {
          keep = false;
          channelRejects++;
          break;
        }
      }
    }
    if (keep) {
      for (const v of voids) {
        if (c.distanceToSquared(v.center) < v.radius * v.radius) {
          keep = false;
          voidRejects++;
          break;
        }
      }
    }
    if (keep) {
      // 内层密度衰减（规则②）：q = 冠内归一化径向深度（与 qOf 同口径）
      const q = qOf(c);
      let density: number;
      if (q >= profile.crownShellStart) density = 1;
      else if (q <= profile.crownCoreStart) density = profile.coreDensityFloor;
      else {
        density =
          profile.coreDensityFloor +
          (1 - profile.coreDensityFloor) *
            ((q - profile.crownCoreStart) / (profile.crownShellStart - profile.crownCoreStart));
      }
      const heightBias = 1 + profile.crownTopBias * ((c.y / treeTopY) * 2 - 1); // 冠顶偏置
      if (roll >= Math.min(1, Math.max(0, profile.canopyDensity * density * heightBias))) {
        keep = false;
        gradientRejects++;
      }
    }
    if (keep) {
      leafCards.push(card);
      qSurvived[qBucket]!++;
    }
  }

  // ── 烘焙名单：High = 全存活卡；Mid = 簇内候选序掩码子集（j % every === phase——
  //    中卡簇 8 候选 3 张；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位
  //    同位）；Low 壳卡模式不烘焙簇内叶卡（候选生成/通透过滤已照常走完——无花果
  //    附加元素，决策表档间同源，消费序列档间恒等）──
  const bakedCards: LeafCard[] = lod.shellCards
    ? []
    : leafCards.filter((c) => c.emitOrdinal % lod.leafEmitEvery === lod.leafEmitPhase);
  /** 烘焙叶卡数（Low = 保留簇 × 每簇壳卡数——叶组三角 = 该数 × 2） */
  const bakedLeafCount = lod.shellCards
    ? ctx.clusters.length * LOW_SHELL_CARDS_PER_CLUSTER
    : bakedCards.length;

  // ── 簇账目：逐簇烘焙散簇卡量 + 逐烘焙卡簇内归一化半径（烘焙序对齐；Low 壳卡无簇内
  //    径向分布语义——r̂ 记壳面恒 1.0，账目长度与烘焙卡数的既有不变量延续）──
  const clusterLeaves: number[] = new Array(ctx.clusters.length).fill(0);
  const leafRhat: number[] = [];
  if (lod.shellCards) {
    clusterLeaves.fill(LOW_SHELL_CARDS_PER_CLUSTER);
  } else {
    for (const card of bakedCards) {
      if (card.clusterIndex >= 0) clusterLeaves[card.clusterIndex]!++;
      leafRhat.push(card.rhat);
    }
  }

  // ── 叶卡烘焙（两段式：Y 域 → 冠内高度权重 aBend；Mid 的 Y 域取全存活集——与 High
  //    逐位同源，两档公共卡 aBend 恒等；Low 的 Y 域取簇心域）──
  let crownMinY = Infinity;
  let crownMaxY = -Infinity;
  if (lod.shellCards) {
    for (const cluster of ctx.clusters) {
      crownMinY = Math.min(crownMinY, cluster.center.y);
      crownMaxY = Math.max(crownMaxY, cluster.center.y);
    }
  } else {
    for (const card of leafCards) {
      crownMinY = Math.min(crownMinY, card.center.y);
      crownMaxY = Math.max(crownMaxY, card.center.y);
    }
  }
  const leafPos: number[] = [];
  const leafNrm: number[] = [];
  const leafUv: number[] = [];
  const leafRand: number[] = [];
  const leafBend: number[] = [];
  if (lod.shellCards) {
    // ── Low 壳卡烘焙：逐保留簇交叉双竖卡——宽轴 = 簇切向水平投影 / 其水平垂直（任意
    //    水平方位至少一卡正面可读——确定性几何非 billboard）；簇位/簇半径与 High 同源，
    //    半幅吞并簇半径（LOW_SHELL_MARGIN 校准依据见常量注释）；宽轴 = 0.75 × 半幅
    //    （三出复叶卡比例 0.75 延续——Step 1 判定 B 的档间剪影语义）──
    for (const cluster of ctx.clusters) {
      const half = cluster.radius + LOW_SHELL_MARGIN;
      let h = cluster.dir.clone();
      h.y = 0; // 簇切向（挂点枝切向）水平投影
      if (h.lengthSq() < 1e-6) h.set(1, 0, 0); // 近铅垂切向的确定性回退（L5 末梢）
      h.normalize();
      const perp = new THREE.Vector3(-h.z, 0, h.x); // h × UP（水平垂直）
      const hw = THREE.MathUtils.clamp(
        (cluster.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY),
        0,
        1,
      );
      emitShellCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        cluster.center, h, half,
        shellCardRandOf(cluster.center.x, cluster.center.y, cluster.center.z, 0), hw,
      );
      emitShellCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        cluster.center, perp, half,
        shellCardRandOf(cluster.center.x, cluster.center.y, cluster.center.z, 1), hw,
      );
      leafRhat.push(1, 1); // 壳面 r̂ 恒 1.0（壳即簇外壳）
    }
  } else {
    for (const card of bakedCards) {
      const hw = THREE.MathUtils.clamp((card.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY), 0, 1);
      const bendRoot = 0.12 * hw; // 枝轴节位（总柄基）≈ 0
      const bendTip = 0.52 + 0.44 * hw; // 叶尖（顶小叶尖）大；树顶叶 > 树底叶
      const half = card.width / 2;
      const r0 = card.center.clone().addScaledVector(card.side, -half);
      const r1 = card.center.clone().addScaledVector(card.side, half);
      const t0 = r0.clone().addScaledVector(card.dir, card.height);
      const t1 = r1.clone().addScaledVector(card.dir, card.height);
      const n = card.side.clone().cross(card.dir).normalize();
      // 顶点序（非索引 6 顶点/卡）：r0 r1 t1 | r0 t1 t0；根 = 0,1,3（总柄基——uv v=0，
      // 材质 SDF 裸柄线域 v∈[0,0.35] 的低端）尖 = 2,4,5（顶小叶尖——uv v=1；aBend 契约序）
      const verts: [THREE.Vector3, number, number, number][] = [
        [r0, 0, 0, bendRoot],
        [r1, 1, 0, bendRoot],
        [t1, 1, 1, bendTip],
        [r0, 0, 0, bendRoot],
        [t1, 1, 1, bendTip],
        [t0, 0, 1, bendTip],
      ];
      for (const [v, u, vv, bend] of verts) {
        leafPos.push(v.x, v.y, v.z);
        leafNrm.push(n.x, n.y, n.z);
        leafUv.push(u, vv);
        leafRand.push(card.rand);
        leafBend.push(bend);
      }
    }
  }

  // ── minY 精确贴地：全树（皮+叶）最低点上移至 0 ──
  let minY = Infinity;
  for (let i = 1; i < bark.pos.length; i += 3) minY = Math.min(minY, bark.pos[i]!);
  for (let i = 1; i < leafPos.length; i += 3) minY = Math.min(minY, leafPos[i]!);
  if (minY !== 0 && Number.isFinite(minY)) {
    for (let i = 1; i < bark.pos.length; i += 3) bark.pos[i]! -= minY;
    for (let i = 1; i < leafPos.length; i += 3) leafPos[i]! -= minY;
  }

  // ── 层几何组装：树皮（aLeafRand/aBend 恒 0——mergeGeometries 属性集一致）──
  const mkAttr = (arr: number[]): THREE.BufferAttribute => new THREE.BufferAttribute(new Float32Array(arr), 1);
  const barkGeo = new THREE.BufferGeometry();
  barkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bark.pos), 3));
  barkGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(bark.nrm), 3));
  barkGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(bark.uv), 2));
  barkGeo.setAttribute('aLeafRand', mkAttr(new Array(bark.pos.length / 3).fill(0)));
  barkGeo.setAttribute('aBend', mkAttr(new Array(bark.pos.length / 3).fill(0)));

  const leafGeo = new THREE.BufferGeometry();
  leafGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(leafPos), 3));
  leafGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(leafNrm), 3));
  leafGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(leafUv), 2));
  leafGeo.setAttribute('aLeafRand', mkAttr(leafRand));
  leafGeo.setAttribute('aBend', mkAttr(leafBend));

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 叶 1）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_bischofia 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  /** 组 0 = 纯皮拓扑（无花果资产——Step 1 判定 C，无附加元素入皮组）；组 1 = 纯叶卡 */
  const group0Tris = (groups[0]?.count ?? 0) / 3;
  return {
    geometry,
    stats: {
      barkTriangles: group0Tris,
      leafTriangles: bakedLeafCount * 2,
      leafCards: bakedLeafCount,
      leafCandidates: ctx.leafCandidates.length,
      channelRejects,
      voidRejects,
      gradientRejects,
      levelBranches: ctx.levelBranches,
      levelMeanStartRadius: ctx.levelBranches.map((n, i) => (n > 0 ? ctx.levelRadiusSum[i]! / n : 0)),
      crownCenterY,
      crownRadius: crownR,
      crownHalfHeight: crownHalfH,
      qCandidates,
      qSurvived,
      channels: ctx.channels.map((ch) => ({
        ax: ch.ax,
        ay: ch.ay,
        az: ch.az,
        bx: ch.bx,
        by: ch.by,
        bz: ch.bz,
        r: Math.sqrt(ch.r2),
      })),
      clusters: ctx.clusters.map((c) => ({
        level: c.level,
        attachX: c.attach.x,
        attachY: c.attach.y,
        attachZ: c.attach.z,
        cx: c.center.x,
        cy: c.center.y,
        cz: c.center.z,
        radius: c.radius,
        dirX: c.dir.x,
        dirY: c.dir.y,
        dirZ: c.dir.z,
      })),
      clustersCulled: ctx.clustersCulled,
      clusterLeaves,
      clusterLeafMin: clusterLeaves.length > 0 ? Math.min(...clusterLeaves) : 0,
      clusterLeafMean:
        clusterLeaves.length > 0 ? clusterLeaves.reduce((s, n) => s + n, 0) / clusterLeaves.length : 0,
      clusterLeafMax: clusterLeaves.length > 0 ? Math.max(...clusterLeaves) : 0,
      leafRhat,
    },
  };
}

/** 通道线段构造（半径平方预热） */
function segOf(a: THREE.Vector3, b: THREE.Vector3, radius: number): ChannelSeg {
  return { ax: a.x, ay: a.y, az: a.z, bx: b.x, by: b.y, bz: b.z, r2: radius * radius };
}

/**
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上举偏置（重阳木
 * upturn [0.10,0.09,0.07,0.05,0.03] 单调递减低正链——两段角带已由 SCAFFOLD_BAND
 * 承担主剪影，upturn 链低正承载端部小枝斜上收口 + 冠缘细枝横展微垂读向
 * （winter-fruit [7]）——末级低值 + 下带 90° 上限 + 游走复合，不建负链下垂语言）；
 * 起径 = 父径 × profile.radiusRatio[level]、末径 = 起径 × profile.endRatio[level]；
 * 子枝挂点内埋父径内（起点回退 2.5×子径，杜绝接缝黑洞——树皮微起伏仅主干有效
 * （抬档地板），≪ 内埋余量，接缝安全不变）；末两级 = **三出复叶卡挂点**（散簇挂
 * 枝梢簇位）；通透过滤在收冠后统一执行，内层稀疏由密度场接管。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划抽稀
 * （径向降段 + 站点隔 1 抽 1 + 未发射级跳过 emitTube）；簇决策/簇内候选生成与档位
 * 无关（簇位表驱动——发射省略不省略消费）。
 */
function growBranch(
  ctx: BuildCtx,
  rng: () => number,
  profile: BroadleafShapeProfile,
  lod: LodEmissionPlan,
  level: number,
  start: THREE.Vector3,
  dirIn: THREE.Vector3,
  length: number,
  startR: number,
  phase: number,
): void {
  const spec = profile.levels[level]!;
  const endR = Math.max(startR * profile.endRatio[level]!, 0.004);
  const pts: THREE.Vector3[] = [];
  const radii: number[] = [];
  let d = dirIn.clone().normalize();
  // 子枝起点内埋（回退进父枝体内；末级细枝回退量加大遮梢孔）
  const p0 = start.clone().addScaledVector(d, -(startR * 2.5 + 0.015));
  let p = p0;
  for (let i = 0; i <= spec.segs; i++) {
    const t = i / spec.segs;
    pts.push(p.clone());
    radii.push(startR + (endR - startR) * t); // 线性锥度（连续到子级）
    if (i < spec.segs) {
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize();
      // 上举偏置随 t 增强（末段姿态——重阳木末级低值 0.03 + 游走 = 冠缘横展微垂
      // 读向 [7]；伞形-开展圆头主剪影由骨架侧驱动链承载：两段角带 + 长度分级 + 弱领导）
      d.add(UP.clone().multiplyScalar(spec.upturn * t * 0.5)).normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  // 管发射按档位计划：未发射级（Mid L5 / Low L2–L5）只递归不发射——站点/簇位/rng 照常
  if (lod.emitTube[level]) {
    emitTube(
      ctx.bark,
      thinStations(pts, lod.stationStep[1 + level]!),
      thinStations(radii, lod.stationStep[1 + level]!),
      lod.radial[1 + level]!,
      0.5,
      profile.barkRelief,
    );
  }
  ctx.levelBranches[level]!++;
  ctx.levelRadiusSum[level]! += startR;
  ctx.maxY = Math.max(ctx.maxY, pts[pts.length - 1]!.y);

  const radiusAt = (t: number): number => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return THREE.MathUtils.lerp(radii[i]!, radii[i + 1]!, idx - i);
  };
  const pointAt = (t: number): THREE.Vector3 => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return pts[i]!.clone().lerp(pts[i + 1]!, idx - i);
  };

  // ── 三出复叶卡挂点（末两级 L4/L5）──
  // 散簇（家族「枝梢驱动叶簇」的重阳木语义）：枝梢 → 簇空间（⊥ 枝切向平面）→ 互生
  // 螺旋散排三出复叶中卡——L4 外段 1 簇 / L5 沿途外段 + 枝端共 2 簇（复叶互生散生于
  // 枝 [1][3][7]——簇 = 末级枝复叶组的卡布置球）；簇间间隙 = 「簇只挂枝梢离散位 +
  // 间距抑制」（拓扑相关处的父子/兄弟共位由簇级距离抑制保险，见下）
  const clusterCount = level === 3 ? profile.clustersL4 : level === 4 ? profile.clustersL5 : 0;
  if (clusterCount > 0) {
    const isL5 = level === 4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const leavesPerCluster = isL5 ? profile.clusterLeavesL5 : profile.clusterLeavesL4;
    for (let i = clusterCount - 1; i >= 0; i--) {
      // 簇沿枝 t：末位簇 = 枝端（t=1），其余在外段均匀散布（+抖动）；单簇枝落外段中后部。
      //  生成序枝端簇优先（倒序）——散簇上簇级抑制先保证枝端簇位，沿途簇让位
      const spread = clusterCount === 1 ? 0.6 : i / (clusterCount - 1);
      const t = THREE.MathUtils.clamp(inner + spread * (1 - inner) + jitter(rng, 0.05), 0, 1);
      const attach = pointAt(t);
      // 簇方向承接挂点局部切向（簇-枝梢生长关系；t 端点自动退化为单侧差分）
      const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      // 簇半径：profile 域抽样 × 挂簇枝长比例上限 cap（rng 先消费再 cap——消费次数恒定；
      //  短枝梢簇随之缩小：簇尺度随枝条活力，且同枝两簇中心距 > 半径和——簇间间隙成立）
      const radius = Math.min(
        (profile.clusterRadiusMinL5 + rng() * profile.clusterRadiusSpanL5) *
          (isL5 ? 1 : profile.clusterRadiusScaleL4),
        length * profile.clusterRadiusLengthCap,
      );
      // 簇中心 = 挂点沿簇方向前移（极近——簇坐枝梢稍前方，叶量越枝端）
      const center = attach.clone().addScaledVector(tangent, radius * profile.clusterForwardOffset);
      // 簇级显式剔除：与已保留簇中心距 < clusterMinSeparation×(ri+rj) 的簇位丢弃（父子/
      // 兄弟枝梢拓扑共位——后生成者让位）；簇位与叶片 rng 仍无条件消费，消费次数与
      // 数据分支无关（确定性纪律）
      let kept = true;
      for (const k of ctx.clusters) {
        if (center.distanceTo(k.center) < profile.clusterMinSeparation * (radius + k.radius)) {
          kept = false;
          break;
        }
      }
      const clusterIndex = ctx.clusters.length;
      if (kept) {
        ctx.clusters.push({ level, attach: attach.clone(), center: center.clone(), radius, dir: tangent.clone() });
      } else {
        ctx.clustersCulled++;
      }
      // 散簇平面基（⊥ 簇方向 = 挂点枝切向——「长总柄复叶多向摊开、平展分层」的簇平面 [1][3][7]）
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0); // 近铅垂切向的确定性回退
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      for (let j = 0; j < leavesPerCluster; j++) {
        // 互生螺旋方位：黄金角步进 + 抖动（互生 [7]+科通则的簇内方位语言——语言
        // 继承 platanus：互生叶序的螺旋错位，vs 银杏莲座均分 2π/n）
        const phi = j * GOLDEN_ANGLE + jitter(rng, 0.45); // 1 次
        const wobble = randUnit(rng); // 2 次（互生自然不齐的弱球面抖动）
        // 外壳偏置：r̂ = mix(1−shellBias, 1, rng^γ)——互生复叶位宽域平摊分布（簇心 = 枝梢位）
        const rhat =
          1 - profile.clusterShellBias + profile.clusterShellBias * Math.pow(rng(), profile.clusterShellGamma); // 1 次
        // 互生偏移方向：簇平面辐射 + 沿枝向前倾（FORWARD_TILT——总柄略前倾）+ 弱抖动
        const offsetDir = u1
          .clone()
          .multiplyScalar(Math.cos(phi))
          .add(u2.clone().multiplyScalar(Math.sin(phi)))
          .add(tangent.clone().multiplyScalar(ALT_FORWARD_TILT))
          .add(wobble.clone().multiplyScalar(ALT_WOBBLE))
          .normalize();
        const cardCenter = center.clone().addScaledVector(offsetDir, rhat * radius);
        // 卡尖方向：辐射外向 + 平展上举（长总柄多向摊开、层叠 [1][3][7]——PLANE_LIFT）
        const cardDir = offsetDir.clone().add(UP.clone().multiplyScalar(PLANE_LIFT)).normalize();
        let side = cardDir.clone().cross(UP);
        if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
        side.normalize();
        const roll = rng() * Math.PI; // 卡面滚转（取向随机——打散规则感；家族共性沿用）1 次
        side.applyAxisAngle(cardDir, roll).normalize();
        // 卡根朝内：cardDir 与簇内偏移方向反向时 dir/side 同取负（卡面不变、根尖互换、
        // 法线不变），叶尖恒指簇外——「复叶自枝梢节位向外生长」读向（根边 uv v=0 =
        // 总柄基 = aBend 低端 = 材质 SDF 裸柄线域低端）
        if (cardDir.dot(offsetDir) < 0) {
          cardDir.negate();
          side.negate();
        }
        // 尺寸/aLeafRand 抽样无条件消费（含被剔除簇位——消费次数与 kept 分支无关，
        // 调 clusterMinSeparation 等参数时保留簇随机流不重排——确定性纪律）；
        // 高度抽样恒比例消费（leafAspectSpan = 0——冻结比例 0.75 的纪律位，消费不减）
        const width = profile.leafWidthMin + rng() * profile.leafWidthSpan; // 1 次
        const height = width * (profile.leafAspectMin + rng() * profile.leafAspectSpan); // 1 次
        const rand = rng(); // 1 次
        if (kept) {
          ctx.leafCandidates.push({
            center: cardCenter,
            dir: cardDir,
            side,
            width,
            height,
            rand,
            rhat,
            clusterIndex,
            emitOrdinal: j, // 簇内候选序（Mid 掩码位——见 LeafCard.emitOrdinal 注释）
          });
        }
      }
    }
  }

  // 子级递归（L5 末级无子）
  if (level < profile.levels.length - 1) {
    const plan = profile.childPlan[level]!;
    for (let i = 0; i < plan.ts.length; i++) {
      const t = Math.min(1, plan.ts[i]! + jitter(rng, 0.05));
      const attach = pointAt(t);
      const attachR = radiusAt(t);
      const isTip = plan.ts[i] === 1.0;
      // 挂点父向（局部切向——侧枝混合用）
      const tTan = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      let childDir: THREE.Vector3;
      let childPhase = phase;
      if (isTip) {
        // 延伸枝：延续父向 + 轻微上扬与游走
        childDir = tTan.clone().add(UP.clone().multiplyScalar(0.18)).add(randUnit(rng).multiplyScalar(0.25)).normalize();
      } else {
        // 侧枝：方位按父相位角均分展开（冠向四周填充 + 抖动；二级枝对一级枝张角——
        // branch_angle 度数 Unknown（两段姿定性 Verified/Inferred [1][7]，读向由
        // 角带 + upturn 链承载），家族方法常量承载）
        childPhase = phase + i * plan.phaseStep + jitter(rng, 0.35);
        const h = new THREE.Vector3(Math.cos(childPhase), 0, Math.sin(childPhase));
        childDir = h
          .clone()
          .multiplyScalar(0.8)
          .add(UP.clone().multiplyScalar(0.2 + rng() * 0.35))
          .add(tTan.clone().multiplyScalar(0.25))
          .normalize();
      }
      const lenRatio = profile.lengthRatioBase + rng() * profile.lengthRatioSpan + (level + 1) * 0.03; // 逐级长度衰减
      growBranch(
        ctx,
        rng,
        profile,
        lod,
        level + 1,
        attach,
        childDir,
        length * lenRatio,
        attachR * profile.radiusRatio[level]!,
        childPhase,
      );
    }
  }
}
