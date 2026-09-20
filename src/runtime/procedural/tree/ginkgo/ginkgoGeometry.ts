/**
 * runtime/procedural/tree/ginkgo/ginkgoGeometry —— 银杏（Ginkgo biloba Linn.，
 * 银杏科银杏属落叶乔木——单科单属单种活化石，雄株口径）CPU 几何生成器（T011.4，
 * 阔叶家族第五实例——方法复制自夏栎第一实例经朴树（T011.1）/香樟（T011.2）/榉树
 * （T011.3）四次验证的通路 ../zelkova/zelkovaGeometry，契约字段语义不变：五级递归
 * 分枝拓扑 / 锥度管状枝干 / 枝梢驱动叶簇 / 冠内通透三规则 / 树皮近景微起伏 / LOD
 * 三档同流派生全部沿用；银杏数值与算法细节差异点见下）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级递归
 *      分枝拓扑 → 锥度管状枝干（平行传输标架）→ 枝梢驱动叶簇烘焙，产出树皮/叶两层
 *      非索引几何；层间 mergeGeometries(useGroups=true) 恰 2 组（D15 免组膨胀：树皮 0 /
 *      叶 1）。形态参数类型 = 阔叶家族契约 ../broadleaf/broadleafShapeProfile（银杏为
 *      第五实例），数值与槽组合见 ./ginkgoShapeProfile（全部数值依据
 *      docs/research/ginkgo-reference.md Spec 1.0——含终审记档：form 系照片读数作废、
 *      干高占比 Unknown·无实证工程默认、冠幅比 0.55–0.65 改园艺域 + fall 实测支撑）；
 *      build 只做 slot → profile 路由，不进 ProceduralBuild 公共签名。
 * 银杏算法细节差异点（vs 榉树模板，逐条 Spec 引用见 ginkgoShapeProfile 内联注释）：
 *   - 尺度锚：中龄公园个体 ≈8m 量级（工程锚弱推断 per 终审 C-1——照片带尺度样木作废，
 *     栽培域下段 + 同语境混植量级）——形态参数域树高 7.9–8.8m（与四先例同量级可混植）；
 *     **干高参数域 0.34–0.40**（工程默认·无实证 per 终审 C-3——Spec 域扩展节 A
 *     trunk_height_ratio 四样木读数全部作废、文献无值，数值沿用须标注）；根径 0.26–
 *     0.32m（DBH Unknown——工程设定，慢生粗干读向，四先例中庸偏粗端）。
 *   - 干形：近直立通直（excurrent 强领导 Verified [1][4]）→ 主干倾轴幅度 ≤2.5°
 *     （jitter 0.04，四先例最刚直）；根部 flare 轻度 1.18×（basal_flare_ratio Unknown、
 *     定性倾向不显 [7]——低于榉树 1.22/香樟 1.32）。
 *   - 树形：**圆锥-广卵过渡冠**（幼壮年圆锥形 Verified [1][2][4][5][6]；中龄锚定相 =
 *     圆锥后段/圆锥→广卵过渡 Inferred [1][7]——明显圆锥/金字塔读向 + 顶部圆化 + 轮廓
 *     轻微不规则）——几何侧驱动链（T009.3 消费语义）：**excurrent 强领导**
 *     （leaderLengthRatio 0.64 四先例最高——树顶由领导链决定、锥尖读向成立）+ **大枝
 *     近轮生**（「枝近轮生」FRPS Verified [1]——挂高段窄跨度 0.16 集中于干上部 +
 *     asymmetry 0.32 低方位抖动 → 环状轮生读向）+ **斜上收敛**（雄株口径 Verified [1]
 *     ——横展角 32–48° 五实例最收；度数工程默认无实证 per 终审 C-4）+ **干向挂点高度
 *     分级锥度**（SCAFFOLD_LENGTH_TAPER [1.22, 0.68] × SCAFFOLD_ANGLE_TAPER 低枝
 *     +20…22° 平展 / 高枝 −8…10° 陡立——挂点低枝长而平展、高枝短而陡立的确定性分级，
 *     零 rng：圆锥剪影的直接驱动，与 rank 环内势差正交）+ upturn 链中庸
 *     （[0.30,…,0.11]——斜上直伸非拱曲非下垂 [1]）+ 最窄冠幅比（工程域 0.55–0.65
 *     涌现，slot-0 实测 0.581——crownWidthRatio 探针定档 0.55 见 profile 注释）。
 *   - **长短枝双挂点语言（银杏独有身份，Spec §4 长短枝二型系统 Verified [1][2][3][5]）**：
 *     ① 短枝（距状 spur）= 家族「叶簇」槽位 → **辐射莲座簇**：簇内叶方位沿簇平面
 *     （⊥ 挂点枝切向）均分展开 + 沿枝向前倾（SPUR_FORWARD_TILT 0.30——「叶对枝轴
 *     近垂直、略前倾」[7]）+ 弱球面抖动（SPUR_WOBBLE 0.18）+ 叶尖上举（SPUR_UP_LIFT
 *     0.32——扇叶自短枝顶平摊张开的莲座观感 [7]）；每簇 8 候选（FRPS 3–8 域上沿 [1]），
 *     通透过滤后逐簇存活典型 4–7 = 「3–8 叶簇生、典型 4–6」[1][4][7]；
 *     ② 长枝（延伸枝）叶**螺旋散生**：L5 每枝 4 张 / L4 每枝 2 张单片卡（结构常数
 *     LONGSHOOT_LEAVES，槽间恒等）沿途黄金角螺旋方位 + 叶柄抬离枝轴（stick-out
 *     0.05–0.10m——柄长 ≈叶宽同量级 [1][2][7] 的工程抽象）+ 叶尖外上前举；
 *     螺旋节距为工程抽象（真叶节间 (1–)1.5–4cm [2] 逐叶建模面数不可行，散生读向保留）。
 *     两类卡同流：同候选池 → 同通透过滤 → 同 Mid 掩码（j%3===1）→ 同烘焙契约
 *     （aLeafRand/aBend）；账目分离（stats.spurCards / longCards）。
 *   - 骨架：**5 骨架枝 + 1 领导枝**（工程默认无实证 per 终审 C-4；「枝近轮生」排列口径
 *     Verified [1]）——拓扑同榉树/香樟：L1 枝数 6、簇位 810、皮面 20782，为扇形大卡
 *     的叶面预算留带内余量。
 *   - 密度语言：中-密（逆光空隙 25–35% Inferred [7]——与榉树同带）：壳带 0.50 + 芯层
 *     地板 0.06（内膛细枝开网「thin inner branchlets visible」[7]）+ 空腔 0.46–0.78
 *     （profile 数值面）；莲座簇浅壳（clusterShellBias 0.50——簇心即短枝顶钉突位）。
 *   - 树皮近景微起伏：**纵裂脊沟族浅-中端**（幼树即浅纵裂→大树深纵裂粗糙 Verified
 *     [1][2]，中龄取浅-中相 per 终审 C-6 中庸）——amplitudeRatio 0.030（介于榉树光滑
 *     0.015 与香樟深沟 0.036 之间、贴夏栎脊沟 0.033 浅侧）+ 谐波 {4,5,6}（k4 主导窄密
 *     脊——脊宽 ≈干径 1/10–1/15 可微扩至 1/20 per 终审 C-6）+ drift 2.6 rad/m（纵脊
 *     轴向连续 ≈2.4m——贴香樟 3.2 连续端、远于夏栎 0.85 缓游走）。机制不变：纯确定性
 *     函数零 rng；起伏幅度 ∝ 局部半径（0.030 下起径 <0.05m 的管（L2 以下细枝典型域）
 *     平滑发射——主干 + L1 粗枝端有效起伏（幼即裂、粗枝同裂 [1][2]）、细枝光滑）；
 *     主干 radial 14（奈奎斯特域 7 容纳 k=6 留 1 档边际——家族同款）。
 *   - 叶卡：卡宽 0.10–0.16m（真叶宽 5–8cm Verified [1][2][4][5] ×≈2 工程映射——五资产
 *     最大叶）+ 长宽比 0.62–0.91（宽>高 1.1–1.6 反向口径 Inferred [7]——扇形叶卡宽
 *     大于卡长，家族 leafAspect 语义 = 长/宽 <1 的契约内表达）+ 小簇（0.085–0.125）=
 *     大卡莲座 + 密布短枝的「钉状凸起 + 团簇」冠面粒状纹理（Spec §7 中距信号 [7]）。
 * 不建模（Spec 有事实、几何不表达——记档见 ginkgoShapeProfile 模块头）：秋色金黄 /
 *   种子白果 / 雄球花 / 落叶集中行为 / 叶柄（卡抽象）/ 扇形轮廓-波状缺刻-2 裂-二叉脉
 *   （归 ginkgoMaterials SDF）/ 冬芽 / 小枝三色 / 树瘤 / 苔藓地衣。
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等（High 20782：主干 406 +
 *      L1 864 + L2 2016 + L3 3240 + L4 6480 + L5 7776；枝数 [6,18,54,162,324]——5 骨架
 *      + 1 领导）；簇位数 810（L4 162×1 + L5 324×2）/ 每簇 8 卡 / 长枝散生卡 L5×4 +
 *      L4×2 = 1620 为计数类（rng 消费次数恒定），保留簇数与实际叶卡数随 seed 由簇级
 *      距离抑制 + 通透规则确定（同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律原样沿用）：簇生成与叶片候选的 rng 消费均为无条件固定次数（每簇
 *      2 次 + 每莲座叶 8 次 + 每散生叶 9 次），被簇级距离抑制丢弃的簇位足额消费后丢弃；
 *      通透 roll 每卡无条件 1 次——任何条件跳过都禁止（档间同理：Mid/Low 的发射省略
 *      不省略消费）。**探针闭包教训（011.3 ③）**：rng 消费计数必须用包裹 rng 闭包实测
 *      （每次调用即计数），不得事后重建流复算——消费次数以测试锁定快照为准。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，卡内根→尖非降（根 0.12·hw / 尖 0.52+0.44·hw，
 *        hw = 冠内高度权重）；树皮层同名属性写恒等值 0。长柄扇叶的颤动幅度语义归
 *        ginkgoMaterials 风动层消费（柄长 ≈叶宽同量级 [1][2][7] 的快颤口径）。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0）；叶卡 UV 标准 0–1 四边形
 *      域（SDF 扇形叶 alpha 消费归 ginkgoMaterials——并行交付，签名冻结）；叶法线取卡面
 *      单侧（cross(side, dir)）。
 * LOD 三档（T011.4，家族方法逐位复制：level 为 Runtime 可选参数——不参与
 *      shapeSlot/morphSeed/sourceKey 形态身份计算；档位缓存维度 = sourceKey + level 归
 *      ProceduralSourceCache）：三档共用**同一条 rng 消费流**与同一套骨架/簇位决策
 *      路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/叶候选照常足额
 *      消费 rng（三档 rng 消费总数恒等，快照数见 ginkgoLod 测试），枝路径/簇位/冠形
 *      包络/通透过滤决策逐位同源：
 *      - High：全发射（缺省档；皮面数 20782）；树皮微起伏保留；
 *      - Mid：径向段数降（主干/五级 14/8/7/6/5/4 → 6/5/4/3/3/3——粗枝保圆度、细枝
 *        三边管）+ 轴向站点隔 1 抽 1 发射（站点全算·游走 rng 全消费）+ L5 末梢管不
 *        发射（末梢径亚厘米，Mid 观距亚像素；簇位与散生卡照常派生）+ 簇内叶卡掩码
 *        j % 3 === 1（莲座 8 候选中 3 张 / 散生 4 候选中 1 张——两类同掩码位，被弃
 *        候选足额消费 rng 后不进烘焙；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High
 *        存活卡逐位同位）+ 树皮微起伏保留；皮 3882；
 *      - Low：主干 + L1 骨架极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（每保留簇 2 张交叉竖卡，半幅 = 簇半径 + 0.12m
 *        余量——银杏大卡尺度：典型卡长 ≈0.10–0.15m，margin 取香樟同款 0.12 覆盖莲座
 *        大卡常态伸出，极值叶尖仍由 High 决定冠包络）；皮 330。
 *      预算锁定账目（8 槽 × 3 档实测带 + 锁定依据）见
 *      ../assets/asset_tree_ginkgo.asset 模块头（预算制 D19.8，家族行沿用）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GINKGO_SLOT0_PROFILE } from './ginkgoShapeProfile';
import type { BroadleafBarkRelief, BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface LeafCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖；莲座叶恒指簇外上举——卡根朝簇心）
  side: THREE.Vector3; // 卡宽方向（水平随机滚转）
  width: number;
  height: number;
  rand: number; // aLeafRand
  rhat: number; // 簇内归一化半径（莲座 shellBias / 散生 stick-out 归一——结构证据账目）
  clusterIndex: number; // 所属簇（存活后归账 clusterLeaves；长枝散生卡 = -1 不归簇账）
  /** 挂点语言身份：spur = 短枝莲座卡 / long = 长枝螺旋散生卡（长短枝二型账目分离） */
  kind: 'spur' | 'long';
  /** 簇/枝内候选序：Mid 发射掩码 j % 3 === 1 的选择位——候选生成/通透过滤/rng 消费对全
   *  候选照常，掩码只在烘焙阶段生效（Mid 存活卡 ⊂ High 存活卡逐位同位） */
  emitOrdinal: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径（枝梢驱动叶簇——家族方法沿用；
 *  银杏语义 = 短枝莲座簇的簇空间） */
interface ClusterRecord {
  /** 挂簇枝级（3 = L4 / 4 = L5） */
  level: number;
  attach: THREE.Vector3;
  center: THREE.Vector3;
  radius: number;
  dir: THREE.Vector3;
}

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
export interface GinkgoGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    leafTriangles: number;
    leafCards: number;
    /** 长短枝二型账目：短枝莲座卡 / 长枝散生卡（烘焙口径——leafCards = spur + long） */
    spurCards: number;
    longCards: number;
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
     *  即外密内疏的结构化证据（叶卡背景分布由枝路径决定，通透规则的作用在保留率） */
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
    /** 逐簇存活莲座卡数（索引对齐 clusters；长枝散生卡不归簇账）与 min/mean/max */
    clusterLeaves: number[];
    clusterLeafMin: number;
    clusterLeafMean: number;
    clusterLeafMax: number;
    /** 逐存活卡簇内归一化半径（对齐存活卡烘焙序——莲座 shellBias 外偏的结构证据；
     *  长枝散生卡记 stick-out 归一值，账目长度与烘焙卡数的既有不变量延续） */
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

// ── 银杏长短枝双挂点语言常量（结构常数：槽间恒等——改值即改面数与 rng 消费）──

/** 长枝散生卡数（螺旋散生单片叶——L5 每枝 5 / L4 每枝 3；FOC "sparsely and spirally
 *  arranged on long branchlets" [3] 的工程抽象：节距非真叶 1.5–4cm [2] 逐叶建模（面数
 *  不可行），散生单片读向保留；张数为 Mid 档预算带的定档值——探针实测 4/2 张时疏松槽
 *  Mid 总面 5830 越家族行下沿 6000，5/3 张后 8 槽 Mid 全带内，2026-09-20 探针记档）。
 *  【结构计数类：槽间恒等】 */
const LONGSHOOT_LEAVES_L5 = 5;
const LONGSHOOT_LEAVES_L4 = 3;
/** 散生卡挂点 t 域（避开枝端簇 t=1 与枝基——「外段受光区」[7] 的散生带） */
const LONGSHOOT_T_START = 0.32;
const LONGSHOOT_T_SPAN = 0.56;
/** 散生卡叶柄抬离枝轴域（米：0.05–0.10——柄长 ≈叶宽同量级 [1][2][7] 的卡中心抬离抽象；
 *  rhat 账目记 stick-out / 0.10 归一值） */
const LONGSHOOT_STICK_SPAN = 0.1;
/** 黄金角（螺旋叶序步进——长枝螺旋散生 [1][3] 的方位语言） */
const GOLDEN_ANGLE = 2.39996;

/** 短枝莲座几何常量（莲座取向语言——连续形态方法常量，非槽差异维度）：
 *  叶对枝轴近垂直略前倾（canopy-b/shoot-a 双源 Inferred [7]）+ 扇叶自短枝顶平摊上举 */
const SPUR_FORWARD_TILT = 0.3; // 沿枝向前倾分量（× 簇方向 T）
const SPUR_WOBBLE = 0.18; // 弱球面抖动（莲座自然不齐）
const SPUR_UP_LIFT = 0.32; // 叶尖上举分量（扇叶张开读向）

/** 干向挂点高度分级锥度（圆锥剪影驱动：挂点低枝 ×1.15 → 高枝 ×0.72 的确定性线性分级，
 *  零 rng——与 rank 环内势差正交；excurrent 强领导 + 近轮生挂高段 + 本分级 = 圆锥-广卵
 *  过渡冠的骨架侧驱动链，Spec §3 圆锥相 Verified [1][2][4][5][6]）。幅度工程设定 */
const SCAFFOLD_LENGTH_TAPER = [1.22, 0.68] as const;
/** 干向挂点高度角度梯度（圆锥剪影第二驱动——探针记档 2026-09-20：仅长度分级时冠最宽
 *  环涌现于 60–80% 冠高（领导链 L2 侧枝），读向倒卵非圆锥；低枝角度 +20…+22° 平展
 *  （冠基放张）× 高枝 −8…−10° 陡立（锥顶收敛）后冠最宽带落冠高 ≈40–55% 段（fall
 *  大树样木异系统实测最宽处冠高 1/3–1/2 [7] 的工程逼近）——金字塔/宽锥读向成立）。
 *  确定性零 rng（作用于 profile 角域两端，槽间角域差异保持）。幅度工程设定 */
const SCAFFOLD_ANGLE_TAPER = { minLow: 22, minHigh: -8, maxLow: 20, maxHigh: -10 } as const;

// ── LOD 三档发射计划（家族方法复制——档位只改「发射」，不改骨架决策/rng 消费序）──

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
   *  莲座 8 候选 → j∈{1,4,7} 3 张（37.5%）/ 散生 4 候选 → j=1 1 张（25%）——两类同掩码位） */
  leafEmitEvery: number;
  leafEmitPhase: number;
  /** Low 壳卡模式：不烘焙簇内叶卡（候选/过滤/rng 照常），逐保留簇发射交叉壳卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（结构依据见模块头 LOD 段；预算记账 = 8 槽实测口径，正式预算带
 * 锁定见 ../assets/asset_tree_ginkgo.asset 模块头）：
 * - High 皮 20782（拓扑恒等不动：主干 406（14 段 ×14 + 底盖 14）+ L1 864（6 枝 ×9 段
 *   ×8）+ L2 2016（18 ×8 段 ×7）+ L3 3240（54 ×5 段 ×6）+ L4 6480（162 ×4 段 ×5）+
 *   L5 7776（324 ×3 段 ×4））；Mid 皮 3882 = 主干 90（7 段 ×6 + 底盖 6）+ L1 300
 *   （6 枝 ×5 段 ×5）+ L2 576（18 ×4 段 ×4）+ L3 972（54 ×3 段 ×3）+ L4 1944
 *   （162 ×2 段 ×3），L5 不发射；Low 皮 330 = 主干 90 + L1 240（6 枝 ×5 段 ×4）。
 * - Mid 叶 ≈ High 存活卡 × 掩码率（莲座 3/8 + 散生 1/4 混合 ≈ 34%）；8 槽实测落 6–10K 带。
 * - Low 叶 = 保留簇数 × 2 壳卡 × 2 三角；8 槽实测落 1.5–3K 带。
 */
function lodPlanFor(profile: BroadleafShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    // 缺省档全发射：profile 原值直读 + 步长 1（thinStations 原数组透传）——皮面数
    // 20782 / rng 消费快照（ginkgoLod 测试锁）延续
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
    // 不发射（亚厘米径亚像素）+ 叶卡掩码 j%3===1（莲座 8 选 3 / 散生 4 选 1——两类
    // 同掩码位：8 槽实测 High 卡 → Mid 总面落 6–10K 预算带的档率）
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

/** Low 壳卡半幅余量（米）：High 莲座叶卡自簇心的最大伸出 ≈ 簇半径 + 卡长（≤0.15m 斜向
 *  ——银杏大卡 0.062–0.146），典型伸出（r̂≤1 壳位 + 莲座平摊）中位 ≈ 半卡长
 *  0.05–0.08m——取 0.12（香樟同款：大卡尺度同步大余量）使壳卡吞并簇半径的常态视觉域，
 *  且极值叶尖仍由 High 决定冠包络（Low 不涨出，档间 bbox 一致性测试容差依据：实测
 *  跨档 XZ 跨度/总高差 ≤ 0.4m） */
const LOW_SHELL_MARGIN = 0.12;
/** Low 每保留簇壳卡数（交叉双竖卡：任意水平方位至少一卡正面可读——确定性几何，非 billboard） */
const LOW_SHELL_CARDS_PER_CLUSTER = 2;

/** Low 壳卡逐卡身份（aLeafRand 契约值 ∈ [0,1)）：簇心 sin 散列 + 第二卡派生错相（零 rng
 *  ——簇位表跨档同源，壳卡身份随簇确定；同簇双卡色相微错开避免同色块读向） */
function shellCardRandOf(cx: number, cy: number, cz: number, derive: number): number {
  const base = fract01(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453);
  return derive === 0 ? base : fract01(base * 7.31 + 0.37);
}

/**
 * Low 壳卡发射：簇心交叉竖卡——宽轴 w（水平单位向量）、高轴 UP、半幅 half；六顶点卡 /
 * uv 0–1 四边形域 / aLeafRand / aBend 契约与 High 叶卡同构（根边 v=0、尖边 v=1；aBend
 * 根 0.12·hw / 尖 0.52+0.44·hw 与 High 同公式同常数——档间风相位/摆幅语义一致，D19.7）；
 * 卡面法线 = w × UP（水平——竖卡双面读向）。
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
  const r0 = center.clone().addScaledVector(w, -half);
  const r1 = center.clone().addScaledVector(w, half);
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
//    全在 shapeProfile.barkRelief 三字段（银杏幅度/谐波/游走率见 ginkgoShapeProfile）──
/** 谐波权重基线（低次主导；按 harmonics 序循环取用后归一） */
const BARK_RELIEF_WEIGHT_BASE = [0.42, 0.33, 0.25];
/** 相位游走正弦项频率（rad/m）/幅度（rad）——沿轴缓变游走分量 */
const BARK_RELIEF_WANDER_FREQ = 1.6;
const BARK_RELIEF_WANDER_AMP = 0.5;
/** 脊深呼吸（权重沿轴调制）频率（rad/m）/幅度——起伏深浅沿干交错（纵脊沿轴连续前提下的
 *  深浅缓变——银杏「纵裂脊沟」的脊线连续读向 [1][2]，断续弱于榉树贴片斑驳；幅度工程设定） */
const BARK_RELIEF_BREATHE_FREQ = 2.4;
const BARK_RELIEF_BREATHE_AMP = 0.3;
/** 亚视觉幅度地板（米，峰值）：管起径 × amplitudeRatio < 此值 → 该管整体跳过起伏
 *  （近景不可辨的亚毫米层，兼免低径向段细枝上高次谐波混叠成无意义计算——银杏
 *  amplitudeRatio 0.030 下起径 < 0.05m 的管（L2 以下细枝典型域）平滑发射，主干 +
 *  L1 粗枝端有效起伏（幼即裂、粗枝同裂 [1][2]）、细枝光滑的读向自然涌现） */
const BARK_RELIEF_MIN_EFFECTIVE = 0.0015;

/** x → [0,1)（确定性散列分量） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

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
  /** 轴向游走率（±drift 域内确定性取值——银杏 drift 2.6：纵脊轴向连续（轴向去相关
   *  ≈2π/2.6 ≈ 2.4m）——脊线连续读向的工程映射；香樟 3.2 连续 / 夏栎 0.85 缓游走 /
   *  榉树 11 斑驳断裂。速率值 = profile.barkRelief.drift） */
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
 * 半径；d_θ/d_s 为解析导数（法线修正源）。φₘ(s) = ψₘ + driftₘ·s + wander 正弦项（银杏
 * driftₘ ±2.6 rad/m——纵脊轴向连续：轴向去相关 ≈2.4m 脊线连续读向；香樟 ±3.2 同族
 * 连续端、夏栎 ±0.85 缓游走、榉树 ±11 斑驳断裂）、wₘ(s) = baseWₘ·(1 + breathe 正弦项)
 * （起伏深浅呼吸）——均弧长 s 的缓变函数。amplitudeRatio ≤ 0（亚视觉地板跳过路径）时
 * 三数组清零——环 cos/sin 仍预算（发射共享）。
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
  // 亚视觉地板：起径 × 幅度比 < 1.5mm 的管（银杏 0.030 幅度下 L2 以下细枝典型域）
  // 整体按 0 起伏发射——近景不可辨的亚毫米层不值得算，主干强末梢弱读向不变
  const effectiveAmplitude =
    relief.amplitudeRatio * radii[0]! >= BARK_RELIEF_MIN_EFFECTIVE ? relief.amplitudeRatio : 0;
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
  const tangent = new THREE.Vector3(0, 1, 0); // 主干首站切向恒近 +Y（lean 幅度 ≤2.5°）
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
 * 拓扑：主干（含根部 flare）→ 5 骨架枝 + 1 领导枝（L1）→ 逐级递归（L2×3 / L3×3 / L4×2 /
 * L5×2 末梢）；枝角/长度/粗度/曲率 rng 驱动（骨架枝横展 32–48° 对铅垂斜上收敛 + 干向
 * 挂点高度分级锥度 ×1.15→×0.72——圆锥-广卵过渡冠的结构成因，Spec §3 Verified [1][2]
 * [4][5][6]；领导枝 excurrent 强 0.64 续顶——锥尖读向）。长短枝双挂点：末两级枝梢短枝
 * 莲座簇 + 枝身长枝螺旋散生卡（见模块头）。主次分级与冠内通透规则见模块头。
 * profile 缺省 = slot-0 标准组合（锚点回落——单测直调便捷路径，资产路径显式传槽
 * profile）。level 缺省 = 'high'（三档同流派生——档位只改发射密度，不改骨架决策/
 * rng 消费序，见 lodPlanFor）。
 */
export function buildGinkgoGeometry(
  rng: () => number,
  profile: BroadleafShapeProfile = GINKGO_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): GinkgoGeometryResult {
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
  const totalHeight = 7.9 + rng() * 0.9; // 形态参数域 7.9–8.8m（≈8m 工程锚弱推断 per 终审 C-1——栽培域下段 + 同语境混植量级；与四先例同量级可混植）
  const crownRadius = (totalHeight * profile.crownWidthRatio * 0.5) * (0.94 + rng() * 0.12); // 冠幅半径 = 冠幅比驱动（含 ±6% 抖动）——最窄冠（工程域 0.55–0.65 涌现，探针定档见 profile）
  const trunkBaseR = 0.26 + rng() * 0.06; // 根径 0.26–0.32m（DBH Unknown——工程设定（慢生粗干读向 [2]，四先例中庸偏粗端）；basal_flare「不显」倾向 [7] 由 flare 承载）
  const trunkH = totalHeight * (0.34 + rng() * 0.06); // 干高 34–40%（**工程默认·无实证** per 终审 C-3——Spec 域扩展节 A trunk_height_ratio 四样木读数作废、文献无值；vs 榉树 0.33–0.38 中庸域持平）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.04)); // 主干倾轴（≤2.5°——excurrent 通直 Verified [1][4]，四先例最刚直）

  // ── 主干：14 环段锥度曲线（根部 flare 1.18×指数衰减 × 0.42 顶径锥度——basal_flare
  //    Unknown、定性「不显」单源低置信 [7]，flare 低于榉树 1.22；taper Unknown 沿家族
  //    常量）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * 0.42;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + 0.18 * Math.exp(-t * 7); // 根部张拉（轻度——「不显」倾向 [7]）
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

  // ── L1 骨架枝 ×5（横展 32–48° 对铅垂斜上收敛——「斜上伸展」FRPS Verified [1] 雄株
  //    口径、度数工程默认无实证 per 终审 C-4；方位 72° 均分 + asymmetry 0.32 低抖动 =
  //    近轮生环（「枝近轮生」Verified [1]）；挂高 0.62–0.78 干高段窄跨度 0.16 = 轮生环
  //    集中；rank 乘子承担环内势差 + 干向挂点高度分级锥度 SCAFFOLD_LENGTH_TAPER
  //    ×1.15→×0.72（低枝长高枝短——圆锥剪影的直接驱动，零 rng 确定性）──
  const scaffoldCount = profile.scaffoldCount;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const rank = Math.min(i, profile.scaffoldRankLength.length - 1);
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, profile.asymmetry * 0.88); // 方位抖动 ±25°·(asymmetry/0.5)——近轮生低抖动
    const attachT = profile.scaffoldAttachMin + (i / scaffoldCount) * profile.scaffoldAttachSpan + jitter(rng, 0.06);
    // 干向挂点高度分级（圆锥剪影）：挂点在挂高段内归一位置——低枝长且平展 / 高枝短且陡立
    const attachNorm = THREE.MathUtils.clamp(
      (attachT - profile.scaffoldAttachMin) / Math.max(profile.scaffoldAttachSpan, 1e-4),
      0,
      1,
    );
    // 横展角（对铅垂）→ 方向分量：水平 sin / 铅垂 cos；圆锥角度梯度：挂点低端平展
    // （+14…+16°——冠基放张）/ 高端陡立（−6…−8°——锥顶收敛），确定性随 attachNorm 插值
    const tiltMin =
      profile.scaffoldAngleMin +
      THREE.MathUtils.lerp(SCAFFOLD_ANGLE_TAPER.minLow, SCAFFOLD_ANGLE_TAPER.minHigh, attachNorm);
    const tiltMax = Math.max(
      tiltMin + 2,
      profile.scaffoldAngleMax +
        THREE.MathUtils.lerp(SCAFFOLD_ANGLE_TAPER.maxLow, SCAFFOLD_ANGLE_TAPER.maxHigh, attachNorm),
    );
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
  // ── L1 领导枝 ×1（excurrent 强续顶——apical_dominance 幼壮年强 Verified [1][4]，
  //    leaderLengthRatio 0.64 四先例最高：圆锥冠锥尖读向的结构成因；强度差异全部由
  //    profile.leaderLengthRatio 表达，直立系数 0.92 为家族方法常量）──
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

  // ── 烘焙名单：High = 全存活卡；Mid = 簇/枝内候选序掩码子集（j % every === phase——
  //    莲座与散生两类同掩码位；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡
  //    逐位同位）；Low 壳卡模式不烘焙簇内叶卡（候选生成/通透过滤/rng 消费已照常走完
  //    ——消费序列档间恒等）──
  const bakedCards: LeafCard[] = lod.shellCards
    ? []
    : leafCards.filter((c) => c.emitOrdinal % lod.leafEmitEvery === lod.leafEmitPhase);
  /** 烘焙叶卡数（Low = 保留簇 × 每簇壳卡数——叶组三角 = 该数 × 2） */
  const bakedLeafCount = lod.shellCards
    ? ctx.clusters.length * LOW_SHELL_CARDS_PER_CLUSTER
    : bakedCards.length;

  // ── 簇账目：逐簇烘焙莲座叶量 + 逐烘焙卡簇内归一化半径（烘焙序对齐；长枝散生卡不归
  //    簇账（clusterIndex = -1）；Low 壳卡无簇内径向分布语义——r̂ 记壳面恒 1.0，账目
  //    长度与烘焙卡数的既有不变量延续）──
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
  const bakedSpur = lod.shellCards ? 0 : bakedCards.filter((c) => c.kind === 'spur').length;
  const bakedLong = lod.shellCards ? 0 : bakedCards.length - bakedSpur;

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
    //    半幅吞并簇半径（LOW_SHELL_MARGIN 校准依据见常量注释）──
    for (const cluster of ctx.clusters) {
      const half = cluster.radius + LOW_SHELL_MARGIN;
      let h = cluster.dir.clone();
      h.y = 0; // 簇切向（挂点枝切向）水平投影
      if (h.lengthSq() < 1e-6) h.set(1, 0, 0); // 近铅垂切向的确定性回退（L5 上举末梢）
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
      const bendRoot = 0.12 * hw; // 短枝顶/枝轴钉点 ≈ 0
      const bendTip = 0.52 + 0.44 * hw; // 叶尖大；树顶叶 > 树底叶
      const half = card.width / 2;
      const r0 = card.center.clone().addScaledVector(card.side, -half);
      const r1 = card.center.clone().addScaledVector(card.side, half);
      const t0 = r0.clone().addScaledVector(card.dir, card.height);
      const t1 = r1.clone().addScaledVector(card.dir, card.height);
      const n = card.side.clone().cross(card.dir).normalize();
      // 顶点序（非索引 6 顶点/卡）：r0 r1 t1 | r0 t1 t0；根 = 0,1,3 尖 = 2,4,5（aBend 契约序）
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
  if (!geometry) throw new Error('程序化资产 asset_tree_ginkgo 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  return {
    geometry,
    stats: {
      barkTriangles: (groups[0]?.count ?? 0) / 3,
      leafTriangles: (groups[1]?.count ?? 0) / 3,
      leafCards: bakedLeafCount,
      spurCards: bakedSpur,
      longCards: bakedLong,
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
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上举偏置（银杏 upturn
 * 中庸 [0.30,0.26,0.21,0.16,0.11]——斜上直伸 [1]：低于榉树 vase 上拱链、高于香樟平摊，
 * 末级 0.11 承担冠缘轻微上收的锥面闭合）；起径 = 父径 × profile.radiusRatio[level]、
 * 末径 = 起径 × profile.endRatio[level]；子枝挂点内埋父径内（起点回退 2.5×子径，杜绝
 * 接缝黑洞——树皮微起伏幅度 ≈ 3% 局部半径，≪ 内埋余量，接缝安全不变）；末两级 =
 * **长短枝双挂点**（短枝莲座簇挂枝梢簇位 + 长枝散生卡挂枝身螺旋位；通透过滤在收冠后
 * 统一执行，内层稀疏由密度场接管）。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划抽稀
 * （径向降段 + 站点隔 1 抽 1 + 未发射级跳过 emitTube）；簇决策/簇内候选生成与档位无关
 * （发射省略不省略消费）。
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
      // 上举偏置随 t 增强（横枝末段姿态——银杏末级 0.11 冠缘上收 + 游走 = 锥面闭合；
      // 圆锥主剪影由骨架侧驱动链承载：强领导 + 近轮生 + 干向分级锥度）
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

  // ── 长短枝双挂点（末两级 L4/L5）──
  // ① 短枝莲座簇（家族「枝梢驱动叶簇」的银杏语义）：枝梢 → 簇空间（⊥ 枝切向平面）
  //    → 莲座叶片分布——L4 外段 1 簇 / L5 沿途外段 + 枝端共 2 簇（短枝 3–8 叶簇生
  //    Verified [1]、辐射莲座 [7]）；簇间间隙 = 「簇只挂枝梢离散位」（拓扑相关处的
  //    父子/兄弟共位由簇级距离抑制保险，见下）
  const clusterCount = level === 3 ? profile.clustersL4 : level === 4 ? profile.clustersL5 : 0;
  if (clusterCount > 0) {
    const isL5 = level === 4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const leavesPerCluster = isL5 ? profile.clusterLeavesL5 : profile.clusterLeavesL4;
    for (let i = clusterCount - 1; i >= 0; i--) {
      // 簇沿枝 t：末位簇 = 枝端（t=1），其余在外段均匀散布（+抖动）；单簇枝落外段中后部。
      //  生成序枝端簇优先（倒序）——短枝上簇级抑制先保证枝端簇位，沿途簇让位
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
      // 莲座平面基（⊥ 簇方向 = 挂点枝切向——「叶对枝轴近垂直」[7] 的簇平面）
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0); // 近铅垂切向的确定性回退
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      for (let j = 0; j < leavesPerCluster; j++) {
        // 莲座方位：簇平面内均分展开 + 抖动（辐射莲座 [7]——方位沿 φ_j 均分）
        const phi = (j / leavesPerCluster) * Math.PI * 2 + jitter(rng, 0.3); // 1 次
        const wobble = randUnit(rng); // 2 次（莲座自然不齐的弱球面抖动）
        // 外壳偏置：r̂ = mix(1−shellBias, 1, rng^γ)——莲座叶位浅壳分布（簇心 = 短枝顶钉突位）
        const rhat =
          1 - profile.clusterShellBias + profile.clusterShellBias * Math.pow(rng(), profile.clusterShellGamma); // 1 次
        // 莲座偏移方向：簇平面辐射 + 沿枝向前倾（SPUR_FORWARD_TILT——「略前倾」[7]）+ 弱抖动
        const offsetDir = u1
          .clone()
          .multiplyScalar(Math.cos(phi))
          .add(u2.clone().multiplyScalar(Math.sin(phi)))
          .add(tangent.clone().multiplyScalar(SPUR_FORWARD_TILT))
          .add(wobble.clone().multiplyScalar(SPUR_WOBBLE))
          .normalize();
        const cardCenter = center.clone().addScaledVector(offsetDir, rhat * radius);
        // 叶尖方向：辐射外向 + 上举（扇叶自短枝顶平摊张开 [7]——SPUR_UP_LIFT）
        const cardDir = offsetDir.clone().add(UP.clone().multiplyScalar(SPUR_UP_LIFT)).normalize();
        let side = cardDir.clone().cross(UP);
        if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
        side.normalize();
        const roll = rng() * Math.PI; // 卡面滚转（取向随机——打散规则感；家族共性沿用）1 次
        side.applyAxisAngle(cardDir, roll).normalize();
        // 卡根朝内：cardDir 与簇内偏移方向反向时 dir/side 同取负（卡面不变、根尖互换、
        // 法线不变），叶尖恒指簇外——「叶从短枝顶向外生长」读向（根边 uv v=0 = aBend 低端）
        if (cardDir.dot(offsetDir) < 0) {
          cardDir.negate();
          side.negate();
        }
        // 尺寸/aLeafRand 抽样无条件消费（含被剔除簇位——消费次数与 kept 分支无关，
        // 调 clusterMinSeparation 等参数时保留簇随机流不重排——确定性纪律）
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
            kind: 'spur',
            emitOrdinal: j, // 簇内候选序（Mid 掩码位——见 LeafCard.emitOrdinal 注释）
          });
        }
      }
    }

    // ② 长枝螺旋散生卡（长枝叶螺旋状散生 [1][3]）：枝身外段沿途单片卡、黄金角螺旋方位
    //    + 叶柄抬离枝轴 + 叶尖外上前举；逐枝固定张数（结构常数——槽间恒等）；rng 无条件
    //    消费（每卡 9 次：t 抖动/方位抖动/stick-out/上举/滚转/宽/长宽比/rand）
    const longShootCount = isL5 ? LONGSHOOT_LEAVES_L5 : LONGSHOOT_LEAVES_L4;
    for (let k = 0; k < longShootCount; k++) {
      const t = THREE.MathUtils.clamp(
        LONGSHOOT_T_START + ((k + 0.5) / longShootCount) * LONGSHOOT_T_SPAN + jitter(rng, 0.04),
        0,
        1,
      ); // 1 次
      const base = pointAt(t);
      const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0);
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      // 螺旋叶序方位：黄金角步进 + 抖动（「螺旋状散生」[1][3] 的方位语言）
      const phi = k * GOLDEN_ANGLE + jitter(rng, 0.5); // 1 次
      const radial = u1.clone().multiplyScalar(Math.cos(phi)).add(u2.clone().multiplyScalar(Math.sin(phi))).normalize();
      const stick = 0.05 + rng() * 0.05; // 叶柄抬离枝轴 0.05–0.10m（柄长 ≈叶宽同量级 [1][2][7]）1 次
      const cardCenter = base.clone().addScaledVector(radial, stick);
      const lift = 0.35 + rng() * 0.35; // 叶尖上举分量 1 次
      const cardDir = radial
        .clone()
        .add(UP.clone().multiplyScalar(lift))
        .add(tangent.clone().multiplyScalar(0.15))
        .normalize();
      let side = cardDir.clone().cross(UP);
      if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
      side.normalize();
      const roll = rng() * Math.PI; // 1 次
      side.applyAxisAngle(cardDir, roll).normalize();
      const width = profile.leafWidthMin + rng() * profile.leafWidthSpan; // 1 次
      const height = width * (profile.leafAspectMin + rng() * profile.leafAspectSpan); // 1 次
      const rand = rng(); // 1 次
      ctx.leafCandidates.push({
        center: cardCenter,
        dir: cardDir,
        side,
        width,
        height,
        rand,
        rhat: stick / LONGSHOOT_STICK_SPAN, // stick-out 归一（账目长度不变量延续）
        clusterIndex: -1, // 长枝散生卡不归簇账
        kind: 'long',
        emitOrdinal: k, // Mid 掩码位（4 候选 → j=1 一张）
      });
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
        // branch_angle 度数 Unknown（「斜上延展」定性 Verified [1]，读向由 levels.upturn
        // 承担），家族方法常量承载）
        childPhase = phase + i * plan.phaseStep + jitter(rng, 0.35);
        const h = new THREE.Vector3(Math.cos(childPhase), 0, Math.sin(childPhase));
        childDir = h
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
