/**
 * runtime/procedural/tree/cedrus/cedrusGeometry —— 雪松（Cedrus deodara (Roxb.) G. Don，
 * 松科雪松属常绿乔木，FRPS 7:200 正名「雪松」）CPU 几何生成器（T012.1 Step 3a，
 * **针叶家族 conifer 第一实例——层状轮生骨架首例**：方法 = 跨族方法复制（T012.1 待裁决位
 * 5）——几何管线骨架（growBranch 递归 / 簇布点 / 卡挂点 / 锥度管发射 / 平行传输标架 /
 * minY 贴地 / 属性契约）复制自 tree3a 系阔叶通路经 13 树验证的方法；挂点语言按雪松
 * **层状轮生**从零改写（T012.1 Step 1 判定 1：BroadleafShapeProfile 与 tree3a 零触碰）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的**层状轮生
 *      分枝拓扑** → 锥度管状枝干（平行传输标架）→ 末两级**长短枝双挂点**（短枝莲座簇卡 +
 *      长枝散生针卡——ginkgo 机制直接继承）+ **层隙观感带**簇聚集（vs 阔叶外密内疏的层状
 *      空隙语言）+ **球果直立账目**（零 rng——koelreuteria 账目法改写），产出树皮/针叶
 *      两层非索引几何；层间 mergeGeometries(useGroups=true) 恰 2 组（D15 免组膨胀：
 *      皮 0 / 针叶卡 1——**球果卡入皮组**：uv v 域身份标记 + aLeafRand/aBend 随组恒 0，
 *      材质按 v 域分流配方——冻结接口见任务派遣简报与 cedrusMaterials 并行交付）。
 *      形态参数类型 = 针叶家族契约草案 ../conifer/coniferShapeProfile（雪松 = 第一实例），
 *      数值与槽组合见 ./cedrusShapeProfile（全部数值依据 docs/research/cedrus-reference.md
 *      Spec 1.0 含终审记档）；build 只做 slot → profile 路由（assets/asset_tree_cedrus），
 *      不进 ProceduralBuild 公共签名。
 *
 * ── 层状轮生骨架（身份核心，Step 1 判定 1 的机制逐项落点）──
 *   1. **scaffold 挂点按层位量化路由**：主干顶端 = 树高 − 顶梢段（leaderLengthRatio）；
 *      tierCount 主层在 [首层挂高 = trunkHeightRatio × totalHeight, 主干顶] 均匀布层 +
 *      tierSpacingJitter 垂直抖动（层间距 ≈1.5–2m 算术推断的探针验证载体——实测涌现带见
 *      模块头「探针记档」）；层内 tierBranchCount 枝方位近均分 + crownAsymmetry 抖动 +
 *      **tierRank 跨层同方位**（rank r 在每层同方位——环内势差与相干偏冠载体，slot-5）。
 *   2. **层角梯度**：层枝初向自垂直角 = tierAngleBase（下部近水平 80°）→ tierAngleTop
 *      （上部上举 45°）沿层位线性插值 + tierAngleJitter 抖动（Spec §4 自垂直角域——
 *      与 ginkgo 干向分级的角度梯度法同型、层级量化版）。
 *   3. **层板升扇/拱形轮廓 + 锥形收顶**：L1 层枝行走带拱形/外缘下卷垂直速度场
 *      （tierPlateArch 中部上拱 + tierEdgeDroop 外段下卷——「外缘先平后微垂下卷」）；
 *      层半径沿高 = mix(1, tierRadiusTaper, u^tierProfileExponent)（基部最宽 + 上 1/4
 *      渐尖——尖塔剪影，非光滑圆锥面的层叠外缘）。
 *   4. **末级细枝垂帘**：L2–L5 droop 链（levels[].droop 0.05→0.45，**针叶姿态语言——
 *      与阔叶 upturn 反向**；机制 = salix upturn 负链的下垂向改写：方向更新减 UP×droop×t，
 *      游走叠加末级垂下）+ fringeLengthRatio 末级加长（垂帘长度侧——salix 机制复制）。
 *   5. **顶梢专路下垂点头**：主干顶独立顶梢枝（leaderLengthRatio 段长 + leaderDroop
 *      二次增强下垂——「顶梢细尖明显下垂点头」TSO Verified，近景身份读向；顶梢带固定
 *      LEADER_NEEDLE_CARDS 张散生针卡防裸梢）。
 *   6. **长短枝双挂点**（ginkgo 机制直接继承——银杏短枝莲座簇与雪松短枝针簇结构同型）：
 *      ① 短枝莲座簇卡（clustersL5/L4 簇位，单卡 = 整簇针叶 SDF 抽象——簇 = 1 卡，
 *      rosetteNeedles 归 3b 材质 SDF）+ clusterInnerStartL5/L4 外段带 + clusterMinSeparation
 *      簇级剔除；② 长枝散生针卡（longShootCardsL5/L4 逐枝固定计数——黄金角螺旋方位 +
 *      抬离枝轴 + 外上前举，needleCardLen/Aspect 域 = 细长针形语言）。
 *   7. **层隙观感带**（vs 阔叶外密内疏的通透语言分化）：通透 = 枝干通道（硬抑制——层隙
 *      露干）+ **层带密度场**（簇卡挂点天然按层聚集——L2–L5 链自层板下垂；密度 = 挂点
 *      对最近层位的归一垂距函数：层带内满密 → 层间空带（tierGapBand）衰减至地板——
 *      「层间可见天光缝隙 ≈0.15–0.3 观感」的参数化；垂帘端部稀疏穿带 = 真实雪松帘缘
 *      读向）。**无冠内空腔规则**（阔叶规则③——层隙语言下无对应物，0 rng 记档）。
 *   8. **球果直立账目（零 rng——koelreuteria 账目法改写）**：结果位 = 上半冠 L2 层板枝
 *      （CONE_UPPER_CROWN_FRACTION 门控——雌球花上位着生读向）× 外缘结果带
 *      （coneFruitingZone 起 coneCandidates 候选位/枝）→ posHash 排序 + coneKeepRatio
 *      抽选 → 两类果并存（coneClassRatio 分将熟/幼果）+ 宿存中轴稀疏位（CONE_AXIS_RATIO）
 *      + 直立桶形交叉竖卡（顶生短枝向上如烛——卡根坐枝面向上发射，Spec Verified）；
 *      全冠量级 ≈ 数十枚（Spec Inferred 的探针定档载体）。
 *
 * ── 探针记档（Step 3a 实测，2026-09-29——先例流程：朴树 18→16 / 银杏簇 8 探针定档）──
 *   - **childPlan 数据行修正（3→2 挂点）**：cedrusShapeProfile 模块头拓扑算术
 *     「childPlan [2,2,2,2] → L1–L5 = [28,56,112,224,448]、皮面 ≈28.0K、High ≈31–33K」
 *     与数据行 ts 长度 3/3/3/2（Step 2 模板拷贝痕）不一致——按字面消费实测皮面 70198 越候选
 *     带 High ≤40000 达 75%；按模块头算术修正数据行为 2 挂点（侧枝 + 末位 1.0 延伸枝，
 *     ts 首值原样保留）后皮面 28142 ⊂ 预估 28.0K。修正只动 ts 数组、3b 消费组
 *     （needleMaterial/bark/wind）零触碰——记档归主代理合并复核（本模块头 + 交付报告双记）。
 *   - 层间距涌现带 / 面数带 / rng 快照 / 包围盒带：见「预算锁定账目」引用的
 *     ../assets/asset_tree_cedrus.asset 模块头（Step 3a 探针实测后回填）。
 *
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等（High 28142 = 主干 462
 *      （16 段 ×14 + 底盖 14）+ 顶梢 128（8 段 ×8）+ L1 层枝 3584（28 枝 ×8 段 ×8）+
 *      L2 4704（56 ×6 段 ×7）+ L3 5376（112 ×4 段 ×6）+ L4 6720（224 ×3 段 ×5）+
 *      L5 7168（448 ×2 段 ×4）——L1 含顶梢 29 管）；簇位数 2464（L5 448×4 + L4 224×3，
 *      **Step 4 密度校准 2026-09-29**：初版 1120 → 2464 + 莲座簇**交叉双卡**〔簇 = 2 卡
 *      ——单面卡无角度覆盖的统计覆盖修复〕，卡面 0.30–0.44〔枝段叶量质量单元〕）/ 散生
 *      针卡 L5×2 + L4×1 = 1120 + 顶梢 6 为计数类（rng 消费次数恒定），保留簇数与
 *      实际卡数随 seed 由簇级抑制 + 通透规则确定（同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律沿用）：簇生成与针卡的 rng 消费均为无条件固定次数（每簇位 6 次：
 *      t/尺寸/方位/倾侧/滚转/rand；每散生针卡 8 次：t/方位/抬离/上举/滚转/长/长宽比/rand），
 *      被簇级抑制丢弃的簇位足额消费后丢弃；通透 roll 每卡无条件 1 次——任何条件跳过都
 *      禁止（档间同理：Mid/Low 的发射省略不省略消费）。**球果账目零 rng**（posHash 确定性
 *      布点——消费顺序契约不含球果）；rng 消费总数 = 结构固定段 + 通透 roll 段（计数 =
 *      存活候选数——随保留簇数浮动，家族先例同机制）。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐卡 ∈ [0,1)，同卡 6 顶点同值；皮组（含球果卡）恒 0；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，卡内根→尖非降（根 0.12·hw / 尖 0.52+0.44·hw，
 *        hw = 冠内高度权重——存活卡 Y 域归一）；树皮层同名属性写恒等值 0。
 * uv 域身份标记（v 域，冻结接口——platanus 66 顶点碰撞教训）：皮管 v = 累计弧长 × 压缩
 *      系数（主干按全弧归一到 TRUNK_V_TARGET 3.4 < 4.0——16.5m 级干长 ×0.5 会直冲 7.3
 *      侵入球果域，**逐管归一**为雪松必要改写；枝管 ×0.5 最长 L1 弧 ≈4m → v ≤ 2.0）；
 *      v∈[4.0,5.0) 隔离带零几何；v∈[5.0,5.95] 将熟球果卡 / v∈[6.0,6.95] 当年幼果卡 /
 *      v∈[7.0,7.95] 宿存中轴卡（u = 逐果色档 ∈ [0,1) 位置散列——材质 v 域分流 + 色档
 *      通道消费归 cedrusMaterials）。
 * LOD 三档（家族方法复制：level 为 Runtime 可选参数——不参与 shapeSlot/morphSeed/
 *      sourceKey 形态身份计算；档位缓存维度 = sourceKey + level 归 ProceduralSourceCache）：
 *      三档共用**同一条 rng 消费流**与同一套骨架/簇位/球果决策路径，Mid/Low 只在「发射」
 *      阶段降密度/降段数——被省略发射的站点/卡候选照常足额消费 rng（三档 rng 消费总数
 *      恒等），枝路径/簇位/层隙过滤/球果决策逐位同源：
 *      - High：全发射（缺省档；皮面 28142）；球果全量（身份信号）；
 *      - Mid：径向段数降（主干/五级 14/8/7/6/5/4 → 6/5/4/3/3/3）+ 轴向站点隔 1 抽 1 +
 *        L4/L5 末级细管不发射（末级径 ≈7–11mm，Mid 观距亚像素；簇位照常派生——探针
 *        记档：保留 L4 管时疏松槽 Mid 总面越带上沿）+ 卡掩码 j % 2 === 0（枝端簇优先序
 *        ——L5 双簇位保枝端簇、L4 单簇位全保、散生针卡 3 保 2）+ 球果全量保留（身份
 *        信号——koelreuteria 花果档间同源先例）；皮 5294；
 *      - Low：主干 + L1 层枝极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（**每保留簇 1 张切向竖卡 × 隔簇抽取**（stride 2——
 *        salix 单卡先例 + 雪松簇量级 900+ 的预算适配：双卡口径越 Low 带上沿；半幅 = 簇
 *        半径 + LOW_SHELL_MARGIN 0.14m——莲座方卡半对角 ≈0.07–0.11 的常态伸出覆盖））；
 *        球果省略（远距亚像素——记档同 koelreuteria）；皮 1030。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 0）；**针卡双帧 uv 域（材质侧
 *      定义的并行契约，合并阶段对齐 2026-09-29）**：散生单针卡 v∈[0,1)（针基→针尖
 *      经典帧）/ 莲座簇卡与 Low 壳卡 v∈[2,3)（卡内帧 (u, v−2) 中心放射——材质判据
 *      阈值 v≥1.5；v∈[1,2) 隔离带不产出）；莲座/壳卡方卡与散生细长卡均纯 uv 值路由，
 *      rng/账目/顶点数零变化；叶法线取卡面单侧。
 * 风动 attribute 契约（家族先例）：几何携带 aLeafRand/aBend（皮组恒 0 实心）；实例
 *      aSeed 归 Runtime；树高锚 = profile.totalHeight 同源（3b 材质消费，无独立锚）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CEDRUS_SLOT0_PROFILE } from './cedrusShapeProfile';
import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 针卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface NeedleCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖；莲座卡 = 簇平面内外向、散生卡 = 外上前举）
  side: THREE.Vector3; // 卡宽方向（滚转后）
  width: number;
  height: number;
  rand: number; // aLeafRand
  clusterIndex: number; // 所属簇（莲座卡 ≥ 0 归簇账；散生卡 = -1）
  /** 挂点语言身份：rosette = 短枝莲座簇卡 / long = 长枝螺旋散生卡（长短枝二型账目分离） */
  kind: 'rosette' | 'long';
  /** 簇/枝内候选序（Mid 掩码 j % 2 === 0 的选择位——枝端簇优先序，见模块头 Mid 段） */
  emitOrdinal: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径——短枝莲座簇的簇空间。
 *  T021.6 家族共享契约同构（canopy proxy 消费——BroadleafClusterRecord 字段兼容，
 *  conifer canopy 经 BroadleafCanopyProxy 统一实现派生，待裁决位 3） */
type ClusterRecord = BroadleafClusterRecord;

/** 枝干发射槽：非索引三角形流（pos/normal/uv 三数组同步追加——球果卡同槽） */
interface BarkSink {
  pos: number[];
  nrm: number[];
  uv: number[];
}

/** 枝干通道线段（点到线段距离 < r 即硬抑制——层隙露干的通透规则①） */
interface ChannelSeg {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  r2: number; // 半径平方（判定预热）
}

/** 球果候选位（账目原料：层板外缘结果带候选——posHash 排序抽选后成卡） */
interface ConeCandidate {
  x: number;
  y: number;
  z: number;
  /** 所属层位的相对高度（上半冠门控用——挂点高/主干顶） */
  heightFrac: number;
}

/** 构建上下文：发射槽 + 簇表 + 候选针卡 + 通道表 + 逐级统计 + 球果候选（全树共享） */
interface BuildCtx {
  bark: BarkSink;
  clusters: ClusterRecord[];
  clustersCulled: number; // 簇级距离抑制丢弃的簇位数（工程账目）
  needleCandidates: NeedleCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含顶梢枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点
  /** 逐层账目（层角梯度结构证据）：每层枝初向自垂直角（度）均值 */
  tierAngles: number[];
  coneCandidates: ConeCandidate[];
  /** 顶梢账目（下垂点头结构证据）：顶梢最高站 Y / 末站 Y（nod = peak > tip） */
  leaderPeakY: number;
  leaderTipY: number;
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface CedrusGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 针叶卡三角（needleCards × 2——组 1 纯卡） */
    needleTriangles: number;
    needleCards: number;
    /** 长短枝二型账目：短枝莲座簇卡 / 长枝散生卡（烘焙口径） */
    rosetteCards: number;
    longCards: number;
    /** 通透账目：候选数与两规则的剔卡数（通道 > 层隙密度场——首个命中计） */
    needleCandidates: number;
    channelRejects: number;
    gapRejects: number;
    /** 主次分级证据：各级枝数与平均起径（米；L1 含顶梢枝） */
    levelBranches: number[];
    levelMeanStartRadius: number[];
    /** 层结构账目（身份核心证据）：层挂高（米，贴地平移前）/ 实测平均层间距 / 冠半径 */
    tierHeights: number[];
    tierSpacingMean: number;
    crownRadius: number;
    /** 层角梯度证据：每层枝初向自垂直角均值（度——base > top 单调降） */
    tierAngleMeans: number[];
    /** 顶梢下垂点头证据：peak > tip（米，贴地平移前） */
    leaderPeakY: number;
    leaderTipY: number;
    /** 层隙带证据（vs 阔叶外密内疏的分化证据）：带内/空带候选数与存活数
     *  （空带保留率显著低于带内 = 簇聚集 + 层间留空的结构化读数） */
    bandCandidates: [number, number];
    bandSurvived: [number, number];
    /** 球果账目（零 rng——确定性账目）：候选池 / 各类烘焙数（将熟/幼果/宿存中轴） */
    coneCandidatePool: number;
    conesMature: number;
    conesYoung: number;
    conesAxis: number;
    coneTriangles: number;
    /** 叶簇账目（canopy proxy 消费面 + 簇级抑制账目） */
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
    /** 通道线段表（诊断/测试口径：ax..bz + 半径 r；世界坐标 = 贴地平移前） */
    channels: { ax: number; ay: number; az: number; bx: number; by: number; bz: number; r: number }[];
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

/** x → [0,1)（确定性散列分量——球果账目零 rng 的布点源） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

/** 位置确定性散列（salt 分通道——球果排序抽选/色档/姿态/尺寸共用，零 rng） */
function posHash(x: number, y: number, z: number, salt: number): number {
  return fract01(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + salt * 53.71) * 43758.5453);
}

// ── 层状轮生形态常数（工程设定——几何私有算法面；Spec 依据见 cedrusShapeProfile 逐字段，
//    此处只放机制增益与结构常数；探针校准记档见模块头）──────────────────────────────

/** L1 层枝长 / 层半径（层板外缘由 L2 延伸枝补满——plate 展幅 ≈ L1×0.78 + L2 链外伸） */
const TIER_BRANCH_LENGTH_FACTOR = 0.78;
/** 层板拱起增益（tierPlateArch × 此值 = 行走方向每步的向上速度分量幅度——中部上拱） */
const TIER_ARCH_GAIN = 0.8;
/** 层板外缘下卷增益（tierEdgeDroop × 此值 = 外段（t>0.45 平滑过渡）向下速度分量幅度） */
const TIER_EDGE_GAIN = 1.4;
/** 逐过渡级子枝长比（L1→L2 … L4→L5——层板填充链的长度衰减；末级偏高 = 垂帘段） */
const CHILD_LENGTH_RATIO = [0.44, 0.5, 0.58, 0.85] as const;
/** 子枝长比抖动幅度（±） */
const CHILD_LENGTH_JITTER = 0.12;
/** 逐过渡级子/父起径比（低级陡末级缓——主次分级；massive 层枝 → 垂帘细枝的实径链：
 *  L1 ≈6cm → L2 ≈3cm → L3 ≈1.7cm → L4 ≈1.1cm → L5 ≈7mm，探针校准 2026-09-29） */
const CHILD_RADIUS_RATIO = [0.5, 0.58, 0.62, 0.66] as const;
/** 逐级末径/起径比（L1 通体粗壮 → 末级收细；地板 0.004 同家族） */
const LEVEL_END_RATIO = [0.45, 0.5, 0.55, 0.6, 0.65] as const;
/** droop 链增益（levels[].droop × 此值 × t = 每步向下速度分量——salix upturn 负链同型） */
const DROOP_GAIN = 1.0;
/** 顶梢下垂增益（leaderDroop × t² × 此值——二次增强 = 末段点头读向；探针校准
 *  2026-09-29：1.6 时末站仍为最高站（点头未涌现），4.0 实测 peak−tip ≈ 数十cm） */
const LEADER_DROOP_GAIN = 4.0;
/** 顶梢初向水平分量（近直立微倾——「顶梢细尖」+ 明显摆幅的 3b 风动第三成分挂点） */
const LEADER_TILT = 0.22;
/** 顶梢干顶预留系数（主干顶 = 树高 − 顶梢段长 × 此值 ≈ 顶梢平均升角的余弦补偿） */
const LEADER_RISE_FACTOR = 0.78;
/** 顶梢散生针卡数（固定计数——防裸梢；结构计数类：槽间恒等） */
const LEADER_NEEDLE_CARDS = 6;
/** 散生针卡挂点 t 域（避开枝端簇 t=1 与枝基——「外段受光区」散生带） */
const LONGSHOOT_T_START = 0.3;
const LONGSHOOT_T_SPAN = 0.58;
/** 散生卡抬离枝轴域（米：0.02–0.05——针叶自枝轴辐射伸展的最小分离） */
const LONGSHOOT_STICK_SPAN = 0.05;
/** 黄金角（螺旋叶序步进——长枝螺旋散生的方位语言，ginkgo 同型） */
const GOLDEN_ANGLE = 2.39996;
/** 层隙空带密度地板（空带核心保留率——垂帘端部稀疏穿带，非清零） */
const TIER_GAP_FLOOR = 0.05;
/** 主干管 v 域归一目标（16.5m 级干长 ×0.5 = 7.3 会侵入球果域 [5,8)——逐管归一到 3.4 < 4.0） */
const TRUNK_V_TARGET = 3.4;
/** 球果结果位上半冠门控（挂点高 ≥ 主干顶 × 此值的 L2 层板枝为结果候选枝——雌球花
 *  上位着生读向；工程设定，量级定档载体见模块头球果段） */
const CONE_UPPER_CROWN_FRACTION = 0.5;
/** 宿存中轴位比（球果账目第三类「熟后果鳞散落留枝」的稀疏占比——工程设定） */
const CONE_AXIS_RATIO = 0.14;
/** 球果卡宽/高比（7–12 × 5–9cm 桶形 → 宽 ≈ 0.62 高；中轴卡细梗另设） */
const CONE_WIDTH_RATIO = 0.62;
/** 当年幼果尺度比（6–7cm vs 将熟 7–12cm——幼果小桶） */
const CONE_YOUNG_SCALE = 0.62;
/** 宿存中轴卡宽比（细梗 + 中轴——窄竖条读向） */
const CONE_AXIS_WIDTH_RATIO = 0.16;
/** 球果卡直立根部抬离（米——顶生短枝的着生微抬） */
const CONE_LIFT = 0.015;
/** 球果 uv v 域基/顶（v∈[4,5) 隔离带零几何的冻结接口——三类卡各占一带，u = 色档） */
const CONE_UV_MATURE = { base: 5.0, tip: 5.95 } as const;
const CONE_UV_YOUNG = { base: 6.0, tip: 6.95 } as const;
const CONE_UV_AXIS = { base: 7.0, tip: 7.95 } as const;
/** Low 壳卡：每保留簇张数（1 = salix 单卡先例——簇量级 900+ 的预算适配）与隔簇抽取步长
 *  （**Step 4 校准 2026-09-29：2 → 3**——簇位 1120 → 2464 后 stride 2 越 Low 带上沿
 *  〔1030 + ⌈2045/2⌉×2 > 3000〕，stride 3 落带 ≈2400；卡面 0.12–0.19 上调后半幅
 *  ≈0.24m 覆盖常态间距，远距剪影连续性保持） */
const LOW_SHELL_CARDS_PER_CLUSTER = 1;
const LOW_SHELL_STRIDE = 3;
/** Low 壳卡半幅余量（米）：莲座方卡自簇心的常态伸出 ≈ 半对角（0.07–0.11）——取 0.14
 *  覆盖壳卡吞并簇半径的常态视觉域，极值针尖仍由 High 决定冠包络（Low 不涨出） */
const LOW_SHELL_MARGIN = 0.14;

// ── LOD 三档发射计划（家族方法复制——档位只改「发射」，不改骨架决策/rng 消费序）──────────

/** LOD 发射档：三档共用同一条 rng 流与同一套骨架/簇位/球果决策，差异全在发射密度 */
interface LodEmissionPlan {
  /** 逐管径向段 [主干, L1..L5]（High = profile 原值；Mid/Low 为降段阶梯——粗枝保圆度） */
  radial: number[];
  /** 逐管轴向发射站点抽取步长（1 = 全发射；>1 = 每隔 step 站发射一站 + 恒保末站） */
  stationStep: number[];
  /** L1..L5 逐级是否发射管（false = 只递归不发射——子枝/簇位/rng 照常派生；主干恒发射） */
  emitTube: boolean[];
  /** 卡发射掩码（每候选序 j % every === phase 者进烘焙——枝端簇优先序 + L4 单簇全保 +
   *  散生 3 保 2；候选生成/通透过滤/rng 消费对全候选照常——Mid 存活卡 ⊂ High 存活卡） */
  cardEmitEvery: number;
  cardEmitPhase: number;
  /** Low 壳卡模式：不烘焙簇内针卡（候选/过滤/rng 照常），逐保留簇发射切向竖卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（预算记账 = 实测口径，正式预算带锁定见
 * ../assets/asset_tree_cedrus.asset 模块头）：
 * - High 皮 28142（拓扑恒等不动：主干 462 + 顶梢 128 + L1 3584 + L2 4704 + L3 5376 +
 *   L4 6720 + L5 7168——L1 含顶梢共 29 管）；
 * - Mid 皮 5294 = 主干 102（8 段 ×6 + 底盖 6）+ L1 1160（29 ×4 段 ×5）+ L2 1344
 *   （56 ×3 段 ×4）+ L3 1344（112 ×2 段 ×3）+ L4 1344（224 ×1 段 ×3），L5 不发射；
 * - Low 皮 1030 = 主干 102 + L1 928（29 ×4 段 ×4）；
 * - Mid 卡 ≈ High 存活卡 × 0.7 量级（枝端簇 + L4 全保 + 散生 2/3）——8 槽实测带见
 *   asset 模块头；Low 叶 = 保留簇 / stride × 2 三角 × 1 卡。
 */
function lodPlanFor(profile: ConiferShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    return {
      radial: [profile.trunk.radial, ...profile.levels.map((l) => l.radial)],
      stationStep: [1, 1, 1, 1, 1, 1],
      emitTube: [true, true, true, true, true],
      cardEmitEvery: 1,
      cardEmitPhase: 0,
      shellCards: false,
    };
  }
  if (level === 'mid') {
    // 径向 14/8/7/6/5/4 → 6/5/4/3/3/3 + 隔 1 抽 1 + L4/L5 末级细管不发射（末级径
    // ≈7–11mm，Mid 观距亚像素；簇位与散生卡照常派生）+ 卡掩码 j%2===0（枝端簇优先：
    // L5 双簇保枝端簇、L4 单簇全保、散生 3 保 2）+ 球果全量保留（身份信号）；
    // 皮 5294（探针实测——slot-4 保留 L4 管时 10088 越 Mid 带上沿，亚像素省略记档）
    return {
      radial: [6, 5, 4, 3, 3, 3],
      stationStep: [2, 2, 2, 2, 2, 2],
      emitTube: [true, true, true, false, false],
      cardEmitEvery: 2,
      cardEmitPhase: 0,
      shellCards: false,
    };
  }
  // Low：主干 + L1 层枝极简管（径向 6/4——干身与 massive 层枝剪影保圆度）；L2–L5 不发射
  // （递归照常走完消费 rng/派生簇位）；冠层转壳卡模式（单切向竖卡 × 隔簇抽取）
  return {
    radial: [6, 4, 3, 3, 3, 3],
    stationStep: [2, 2, 2, 2, 2, 2],
    emitTube: [true, false, false, false, false],
    cardEmitEvery: 1,
    cardEmitPhase: 0,
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

// ── 锥度管发射（家族方法复制：平行传输标架 + 外向绕制四边形；无树皮起伏——雪松树皮
//    鳞状块片为纯材质语言（ConiferBarkProfile 全组 3b 消费），几何侧零起伏场）────────

/**
 * 锥度管发射：沿站点序列（points/radii 等长）平行传输标架，逐段发射外向绕制四边形
 * （三角形 (a0,b1,b0)/(a0,a1,b1)——右手系 (N,B,T) 下外向），uv = 环向 θ/2π × 累计弧长
 * × vScale。雪松改写：主干管 vScale 按全弧归一（TRUNK_V_TARGET / 弧长——v 域上限恒
 * 3.4 < 4.0，杜绝 16.5m 级干长侵入球果 v 域）。
 */
function emitTube(
  sink: BarkSink,
  points: THREE.Vector3[],
  radii: number[],
  radial: number,
  vScale: number,
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
    for (let j = 0; j < radial; j++) {
      const j1 = (j + 1) % radial;
      const u0 = j / radial;
      const u1 = (j + 1) / radial;
      // 顶点流：a0 a1 b1 | a0 b1 b0（外向绕制）
      const push = (p: THREE.Vector3, n: THREE.Vector3, b: THREE.Vector3, jj: number, r: number, u: number, v: number): void => {
        const c = Math.cos((jj / radial) * Math.PI * 2);
        const s = Math.sin((jj / radial) * Math.PI * 2);
        sink.pos.push(p.x + (n.x * c + b.x * s) * r, p.y + (n.y * c + b.y * s) * r, p.z + (n.z * c + b.z * s) * r);
        sink.nrm.push(n.x * c + b.x * s, n.y * c + b.y * s, n.z * c + b.z * s);
        sink.uv.push(u, v);
      };
      push(pA, nA, bA, j, rA, u0, vA);
      push(pA, nA, bA, j1, rA, u1, vA);
      push(pB, nB, bB, j1, rB, u1, vB);
      push(pA, nA, bA, j, rA, u0, vA);
      push(pB, nB, bB, j1, rB, u1, vB);
      push(pB, nB, bB, j, rB, u0, vB);
    }
  }
}

/** 主干底盖：封住从上方斜看进空心干身的可见洞；扇面 (c, V_j, V_{j+1})，法线 +Y */
function emitBaseCapTri(sink: BarkSink, center: THREE.Vector3, radius: number, radial: number): void {
  const tangent = new THREE.Vector3(0, 1, 0); // 主干首站切向恒近 +Y（lean 幅度小）
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

/** 通道线段构造（半径平方预热） */
function segOf(a: THREE.Vector3, b: THREE.Vector3, radius: number): ChannelSeg {
  return { ax: a.x, ay: a.y, az: a.z, bx: b.x, by: b.y, bz: b.z, r2: radius * radius };
}

// ── 球果直立账目（零 rng——koelreuteria 账目法改写；「足额候选 posHash 排序 + keep 抽选」）──

/** 球果卡类别（v 域身份 + 语义：将熟绿转红褐 / 当年幼果淡绿 / 宿存中轴细梗留枝） */
type ConeClass = 'mature' | 'young' | 'axis';

/** 球果烘焙卡原料（账目抽选后的成卡：位置 + 类别 + 尺寸 + 色档 u + 交叉方位） */
interface ConeCard {
  x: number;
  y: number;
  z: number;
  height: number;
  width: number;
  cls: ConeClass;
  u: number; // 逐果色档 ∈ [0.02, 0.98]（位置散列——材质色档通道）
  az: number; // 交叉竖卡方位（位置散列）
}

/**
 * 球果账目主函数（收冠后统一执行——簇位/枝位已定，纯确定性零 rng）：
 * 1. 候选池 = 上半冠（挂点高 ≥ 主干顶 × CONE_UPPER_CROWN_FRACTION 的层）L2 层板枝的
 *    外缘结果带候选位（每枝 coneCandidates 位，t = fruitingZone → 1 均布——「层板外缘
 *    结果枝带」）；
 * 2. posHash 排序 + coneKeepRatio 抽选（保留前 ⌈池 × keep⌉ 位——排序确定性，同 seed
 *    同果集；跨 seed 因布点差异自然去克隆）；
 * 3. 逐果类别（posHash 分通道）：宿存中轴 CONE_AXIS_RATIO 位 / 其余按 coneClassRatio
 *    分将熟:幼果（两类并存——翌年 10 月熟时窗错位的主语境读向）；
 * 4. 尺寸 coneSizeMin/Span + 类别缩放（幼果 ×0.62 / 中轴细条）——位置散列抽样。
 * 量级定档：结果枝 ≈ 上半冠 L2 枝数 × keep ≈ 20–35 枝 × 3 候选 × 0.6 ≈ 全冠 40–70 枚
 * ⊂ 「中龄树全冠数十枚」Inferred 量级（探针复核记档——asset 模块头实测带）。
 */
function accountCones(ctx: BuildCtx, profile: ConiferShapeProfile): ConeCard[] {
  const pool = ctx.coneCandidates.filter((c) => c.heightFrac >= CONE_UPPER_CROWN_FRACTION);
  const sorted = [...pool].sort(
    (a, b) => posHash(a.x, a.y, a.z, 1.7) - posHash(b.x, b.y, b.z, 1.7) || a.x - b.x || a.y - b.y || a.z - b.z,
  );
  const keepCount = Math.ceil(sorted.length * profile.coneKeepRatio);
  const cones: ConeCard[] = [];
  for (let i = 0; i < keepCount; i++) {
    const c = sorted[i]!;
    const classRoll = posHash(c.x, c.y, c.z, 3.3);
    const sizeRoll = posHash(c.x, c.y, c.z, 5.9);
    const height = profile.coneSizeMin + sizeRoll * profile.coneSizeSpan;
    let cls: ConeClass;
    let h = height;
    let w = height * CONE_WIDTH_RATIO;
    if (classRoll < CONE_AXIS_RATIO) {
      cls = 'axis';
      h = height * 1.1;
      w = height * CONE_AXIS_WIDTH_RATIO;
    } else if (classRoll < CONE_AXIS_RATIO + (1 - CONE_AXIS_RATIO) * profile.coneClassRatio) {
      cls = 'mature';
    } else {
      cls = 'young';
      h = height * CONE_YOUNG_SCALE;
      w = h * CONE_WIDTH_RATIO;
    }
    cones.push({
      x: c.x,
      y: c.y + CONE_LIFT,
      z: c.z,
      height: h,
      width: w,
      cls,
      u: 0.02 + 0.96 * posHash(c.x, c.y, c.z, 7.7),
      az: posHash(c.x, c.y, c.z, 9.1) * Math.PI * 2,
    });
  }
  return cones;
}

/**
 * 单枚球果发射：直立桶形交叉竖卡（2 卡 × 2 tri——koelreuteria 顶生花序交叉卡先例的
 * 直立版；「顶生短枝向上如烛」Verified——卡根坐枝面、卡体垂直向上）。uv：u = 逐果
 * 色档（果内 12 顶点同值——材质色档通道）；v = 卡根（域基）→ 卡尖（域顶）——三类卡
 * 各占一带（5/6/7），隔离带 v∈[4,5) 零几何由结构测试锁。法线 = 宽轴 × UP（水平——
 * 竖卡双面读向）；aLeafRand/aBend 随皮组恒 0（球果刚性——摆动语义归材质层/缺口候选）。
 */
function emitConeCard(sink: BarkSink, cone: ConeCard): void {
  const domain = cone.cls === 'mature' ? CONE_UV_MATURE : cone.cls === 'young' ? CONE_UV_YOUNG : CONE_UV_AXIS;
  const half = cone.width / 2;
  const root = new THREE.Vector3(cone.x, cone.y, cone.z);
  for (let k = 0; k < 2; k++) {
    const az = cone.az + (k * Math.PI) / 2; // 交叉方位（第二卡正交）
    const w = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    const r0 = root.clone().addScaledVector(w, -half);
    const r1 = root.clone().addScaledVector(w, half);
    const t0 = r0.clone().addScaledVector(UP, cone.height);
    const t1 = r1.clone().addScaledVector(UP, cone.height);
    const n = w.clone().cross(UP).normalize();
    const verts: [THREE.Vector3, number, number][] = [
      [r0, cone.u, domain.base],
      [r1, cone.u, domain.base],
      [t1, cone.u, domain.tip],
      [r0, cone.u, domain.base],
      [t1, cone.u, domain.tip],
      [t0, cone.u, domain.tip],
    ];
    for (const [v, u, vv] of verts) {
      sink.pos.push(v.x, v.y, v.z);
      sink.nrm.push(n.x, n.y, n.z);
      sink.uv.push(u, vv);
    }
  }
}

// ── Low 壳卡（簇位表驱动——确定性几何，非 billboard；单切向竖卡 × 隔簇抽取）──────────

/** Low 壳卡逐卡身份（aLeafRand 契约值 ∈ [0,1)）：簇心 sin 散列（零 rng——簇位表跨档同源） */
function shellCardRandOf(cx: number, cy: number, cz: number): number {
  return fract01(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453);
}

/**
 * Low 壳卡发射：簇心切向竖卡——宽轴 = 簇切向水平投影（切向读向 = 层板延伸方向的窄条
 * 剪影），高轴 UP，半幅 = 簇半径 + LOW_SHELL_MARGIN；六顶点卡 / aLeafRand / aBend
 * 契约与 High 针卡同构（根边 v 域基 / 尖边 v 域顶；aBend 根 0.12·hw / 尖 0.52+0.44·hw
 * 同公式同常数——档间风相位/摆幅语义一致，D19.7）。**uv v∈[2,3) 莲座帧**（壳卡 =
 * 整簇抽象 → 中心放射 SDF；材质 Low 档 8 针「近似星点」在莲座分支——壳卡走散生帧
 * 则该 SDF 路径在 Low 档成死路，合并阶段自查确认记档 2026-09-29）。
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
    [r0, 0, 2.0, bendRoot],
    [r1, 1, 2.0, bendRoot],
    [t1, 1, 3.0, bendTip],
    [r0, 0, 2.0, bendRoot],
    [t1, 1, 3.0, bendTip],
    [t0, 0, 3.0, bendTip],
  ];
  for (const [v, u, vv, b] of verts) {
    pos.push(v.x, v.y, v.z);
    nrm.push(n.x, n.y, n.z);
    uv.push(u, vv);
    rand.push(cardRand);
    bend.push(b);
  }
}

// ── 卡发射辅助（六顶点卡——aBend 根→尖契约序）────────────────────────────────────

/**
 * 六顶点卡发射（r0 r1 t1 | r0 t1 t0——根 = 0,1,3 / 尖 = 2,4,5 的 aBend 契约序）。
 * **针卡双帧 uv 域（材质侧定义的并行契约，合并阶段对齐 2026-09-29）**：散生单针卡
 * v∈[0,1)（v=0 针基 → v=1 针尖——家族叶卡经典帧）；莲座簇卡 v∈[2,3)（卡内帧 =
 * (u, v−2) ∈ [0,1]² 方形卡，中心放射 SDF——材质判据阈值 v≥1.5 路由莲座分支）。
 * 纯 uv 值改写——rng/账目/顶点数零变化。
 */
function emitCard(
  pos: number[],
  nrm: number[],
  uv: number[],
  rand: number[],
  bend: number[],
  card: NeedleCard,
  bendRoot: number,
  bendTip: number,
): void {
  const vBase = card.kind === 'rosette' ? 2.0 : 0.0; // 双帧域：莲座 [2,3) / 散生 [0,1)
  const half = card.width / 2;
  const r0 = card.center.clone().addScaledVector(card.side, -half);
  const r1 = card.center.clone().addScaledVector(card.side, half);
  const t0 = r0.clone().addScaledVector(card.dir, card.height);
  const t1 = r1.clone().addScaledVector(card.dir, card.height);
  const n = card.side.clone().cross(card.dir).normalize();
  const verts: [THREE.Vector3, number, number, number][] = [
    [r0, 0, vBase + 0, bendRoot],
    [r1, 1, vBase + 0, bendRoot],
    [t1, 1, vBase + 1, bendTip],
    [r0, 0, vBase + 0, bendRoot],
    [t1, 1, vBase + 1, bendTip],
    [t0, 0, vBase + 1, bendTip],
  ];
  for (const [v, u, vv, b] of verts) {
    pos.push(v.x, v.y, v.z);
    nrm.push(n.x, n.y, n.z);
    uv.push(u, vv);
    rand.push(card.rand);
    bend.push(b);
  }
}

/**
 * 主生成入口：rng（morphRng）+ shapeProfile → 合并几何 + 账目。
 * 拓扑：主干（含根部 flare，顶 = 树高 − 顶梢段）→ tierCount 主层 × tierBranchCount 层枝
 * （层位量化挂点 + 层角梯度 + 层板拱形/外缘下卷 + tierRank 跨层同方位）→ L2–L5 递归
 * （droop 链 + fringeLengthRatio 末级加长）→ 顶梢专路（主干顶独立枝 + 二次增强下垂 +
 * 固定散生针卡）；末两级长短枝双挂点（莲座簇卡 + 散生针卡）；收冠后：通道 + 层隙密度
 * 场通透过滤 → 球果直立账目 → 烘焙（Mid 掩码 / Low 壳卡）。profile 缺省 = slot-0 标准
 * 组合（锚点回落——单测直调便捷路径）；level 缺省 = 'high'（三档同流派生）。
 */
export function buildCedrusGeometry(
  rng: () => number,
  profile: ConiferShapeProfile = CEDRUS_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): CedrusGeometryResult {
  const lod = lodPlanFor(profile, level);
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    clusters: [],
    clustersCulled: 0,
    needleCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
    tierAngles: [],
    coneCandidates: [],
    leaderPeakY: 0,
    leaderTipY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（profile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = profile.totalHeight; // 形态参数域树高直读（= 3b 风动树高锚同源——无独立锚）
  const crownRadius = totalHeight * profile.crownWidthRatio * 0.5 * (0.94 + rng() * 0.12); // 冠幅半径（±6% 抖动）
  const trunkBaseR = 0.21 + rng() * 0.05; // 根径 0.21–0.26m（16.5m 级中龄公园个体——工程设定，DBH 无 Spec 数值）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.04)); // 主干倾轴（干端直 [1]——工程幅度）

  // ── 层位量化路由（身份核心）：主干顶 = 树高 − 顶梢段；tierCount 主层均匀布层 ──
  const leaderLen = totalHeight * profile.leaderLengthRatio * (0.92 + rng() * 0.16);
  const trunkTopY = totalHeight - leaderLen * LEADER_RISE_FACTOR;
  const firstTierY = totalHeight * profile.trunkHeightRatio;
  const tierCount = profile.tierCount;
  const tierSpan = trunkTopY - firstTierY;
  const tierSpacing = tierSpan / Math.max(1, tierCount - 1);
  const tierHeights: number[] = [];
  for (let i = 0; i < tierCount; i++) {
    tierHeights.push(
      i === tierCount - 1
        ? trunkTopY
        : firstTierY + tierSpacing * i + jitter(rng, tierSpacing * profile.tierSpacingJitter), // 层位垂直抖动（1 次/层）
    );
  }

  // ── 主干：16 环段锥度曲线（trunkFlareRatio 根部展宽 × trunkTaperRatio 干顶锥度）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * profile.trunkTaperRatio;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + (profile.trunkFlareRatio - 1) * Math.exp(-t * 7); // 根部展宽（雪松干基无显著膨大——1.15 轻度）
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < profile.trunk.segs) {
      dir.add(randUnit(rng).multiplyScalar(profile.trunk.wander)).normalize(); // 干端直（wander 0.03）
      p = p.clone().addScaledVector(dir, trunkTopY / profile.trunk.segs);
    }
  }
  const trunkArc =
    profile.trunk.segs > 0
      ? trunkPts.reduce(
          (sum, pt, i) => (i > 0 ? sum + pt.distanceTo(trunkPts[i - 1]!) : 0),
          0,
        )
      : 1;
  emitTube(
    bark,
    thinStations(trunkPts, lod.stationStep[0]!),
    thinStations(trunkRadii, lod.stationStep[0]!),
    lod.radial[0]!,
    TRUNK_V_TARGET / Math.max(trunkArc, 1e-6), // 逐管归一——v 域上限恒 3.4 < 4.0（16.5m 级干长的必要改写）
  );
  emitBaseCapTri(bark, trunkPts[0]!, trunkRadii[0]!, lod.radial[0]!);
  ctx.maxY = Math.max(ctx.maxY, trunkPts[trunkPts.length - 1]!.y);

  /** 主干半径/位置插值（挂点处子枝起径连续源） */
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

  // ── L1 层枝 × tierCount 层 × tierBranchCount 枝（近轮生层状骨架——身份核心）──
  //    方位：phase0 + rank × 均分步进 + crownAsymmetry 抖动（**rank 跨层同方位**——
  //    环内势差与相干偏冠载体）；层角梯度：tierAngleBase → tierAngleTop 沿层位插值
  //    （自垂直角——下部近水平、上部上举）；层半径：mix(1, taper, u^exponent) 锥形收顶。
  const phase0 = rng() * Math.PI * 2;
  const tierAngleSum = new Array<number>(tierCount).fill(0);
  for (let ti = 0; ti < tierCount; ti++) {
    const u = tierCount > 1 ? ti / (tierCount - 1) : 0;
    const angleDeg = THREE.MathUtils.lerp(profile.tierAngleBase, profile.tierAngleTop, u);
    const radiusFactor = THREE.MathUtils.lerp(1, profile.tierRadiusTaper, Math.pow(u, profile.tierProfileExponent));
    const tierR = crownRadius * radiusFactor;
    for (let r = 0; r < profile.tierBranchCount; r++) {
      const rank = Math.min(r, profile.tierRankLength.length - 1);
      const az =
        phase0 +
        (r / profile.tierBranchCount) * Math.PI * 2 +
        jitter(rng, profile.crownAsymmetry * 0.88); // 方位抖动（近轮生非机械规整）1 次
      const attachT = THREE.MathUtils.clamp(tierHeights[ti]! / trunkTopY + jitter(rng, 0.02), 0.02, 0.995); // 层内微抖 1 次
      const tilt = THREE.MathUtils.degToRad(angleDeg + jitter(rng, profile.tierAngleJitter)); // 层内枝角抖动 1 次
      tierAngleSum[ti]! += THREE.MathUtils.radToDeg(tilt);
      const length = tierR * TIER_BRANCH_LENGTH_FACTOR * profile.tierRankLength[rank]! * (0.94 + rng() * 0.12); // 1 次
      const attach = trunkPointAt(attachT);
      const dirH = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
      const bDir = dirH
        .clone()
        .multiplyScalar(Math.sin(tilt))
        .add(UP.clone().multiplyScalar(Math.cos(tilt)))
        .normalize();
      const startR = trunkRadiusAt(attachT) * profile.tierBranchRadiusRatio * profile.tierRankRadius[rank]!;
      growTierBranch(ctx, rng, profile, lod, attach, bDir, length, startR, az, ti, tierHeights[ti]! / trunkTopY);
      // 枝干通道：层枝基段保护带（层隙露干的通透规则①——主干 + massive 层枝进冠可见）
      ctx.channels.push(
        segOf(attach, attach.clone().addScaledVector(bDir, length * 0.45), Math.max(startR * 2.2, 0.06)),
      );
    }
  }

  // ── 顶梢专路（近景身份读向）：主干顶独立枝 + 二次增强下垂点头 + 固定散生针卡 ──
  {
    const leaderAz = rng() * Math.PI * 2; // 1 次
    const lDir = new THREE.Vector3(
      Math.cos(leaderAz) * LEADER_TILT,
      Math.sqrt(Math.max(0, 1 - LEADER_TILT * LEADER_TILT)),
      Math.sin(leaderAz) * LEADER_TILT,
    ).normalize();
    growLeader(ctx, rng, profile, lod, trunkPointAt(0.995), lDir, leaderLen, trunkRadiusAt(0.995) * 0.55);
    // 枝干通道：主干 → 顶梢连续中轴保护带（近共线直线近似）
    const leaderEnd = trunkPointAt(0.995).clone().addScaledVector(lDir, leaderLen * 0.6);
    ctx.channels.push(segOf(new THREE.Vector3(0, 0, 0), leaderEnd, Math.max(trunkTopR * 1.6, 0.05)));
  }

  const tierAngleMeans = tierAngleSum.map((s) => s / profile.tierBranchCount);

  // ── 通透过滤（层隙语言：通道（硬）→ 层带密度场（roll）——无空腔规则记档模块头）──
  //    层带密度：挂点对最近层位归一垂距 u = |dy| / (层间距/2)；带内（u ≤ 1-tierGapBand）
  //    满密 → 空带核心（u ≥ 1）衰减至 TIER_GAP_FLOOR——「层间可见天光缝隙」+ 垂帘端部
  //    稀疏穿带的读向；roll 每卡无条件 1 次（确定性纪律）。
  const halfSpacing = Math.max(tierSpacing * 0.5, 1e-4);
  const nearestTierDist = (y: number): number => {
    let d = Infinity;
    for (const h of tierHeights) d = Math.min(d, Math.abs(y - h));
    return d;
  };
  const bandKeep = 1 - profile.tierGapBand;
  const needleCards: NeedleCard[] = [];
  let channelRejects = 0;
  let gapRejects = 0;
  const bandCandidates: [number, number] = [0, 0];
  const bandSurvived: [number, number] = [0, 0];
  for (const card of ctx.needleCandidates) {
    const c = card.center;
    const u = nearestTierDist(c.y) / halfSpacing;
    const inBand = u <= 1;
    if (inBand) bandCandidates[0]++;
    else bandCandidates[1]++;
    const roll = rng(); // 无条件消费（消费次数与数据分支无关）
    let keep = true;
    for (const ch of ctx.channels) {
      if (distToSegmentSq(c.x, c.y, c.z, ch.ax, ch.ay, ch.az, ch.bx, ch.by, ch.bz) < ch.r2) {
        keep = false;
        channelRejects++;
        break;
      }
    }
    if (keep) {
      let density: number;
      if (u <= bandKeep) density = 1;
      else if (u >= 1) density = TIER_GAP_FLOOR;
      else density = 1 - ((u - bandKeep) / (1 - bandKeep)) * (1 - TIER_GAP_FLOOR);
      if (roll >= Math.min(1, Math.max(0, profile.canopyDensity * density))) {
        keep = false;
        gapRejects++;
      }
    }
    if (keep) {
      needleCards.push(card);
      if (inBand) bandSurvived[0]++;
      else bandSurvived[1]++;
    }
  }

  // ── 球果直立账目（零 rng——收冠后统一；决策表档间同源）──
  const cones = accountCones(ctx, profile);
  const conesMature = cones.filter((c) => c.cls === 'mature').length;
  const conesYoung = cones.filter((c) => c.cls === 'young').length;
  const conesAxis = cones.filter((c) => c.cls === 'axis').length;
  const bakeCones = !lod.shellCards; // Low 省略（远距亚像素——记档同 koelreuteria）
  if (bakeCones) {
    for (const cone of cones) emitConeCard(bark, cone);
  }
  const coneTriangles = bakeCones ? cones.length * 4 : 0; // 交叉双卡 × 2 tri

  // ── 烘焙名单：High = 全存活卡；Mid = 候选序掩码子集（j % every === phase——通透过滤
  //    对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位同位）；Low 壳卡模式不烘焙簇内
  //    针卡（候选生成/通透过滤/rng 消费已照常走完——消费序列档间恒等）──
  const bakedCards: NeedleCard[] = lod.shellCards
    ? []
    : needleCards.filter((c) => c.emitOrdinal % lod.cardEmitEvery === lod.cardEmitPhase);
  const bakedRosette = lod.shellCards ? 0 : bakedCards.filter((c) => c.kind === 'rosette').length;
  const bakedLong = lod.shellCards ? 0 : bakedCards.length - bakedRosette;
  /** Low 壳卡数（隔簇抽取——簇位表驱动；每簇 LOW_SHELL_CARDS_PER_CLUSTER 张切向竖卡） */
  const lowShellCount = Math.ceil(ctx.clusters.length / LOW_SHELL_STRIDE) * LOW_SHELL_CARDS_PER_CLUSTER;

  // ── 针卡烘焙（两段式：Y 域 → 冠内高度权重 aBend；Mid 的 Y 域取全存活集——与 High
  //    逐位同源；Low 的 Y 域取簇心域）──
  let crownMinY = Infinity;
  let crownMaxY = -Infinity;
  if (lod.shellCards) {
    for (const cluster of ctx.clusters) {
      crownMinY = Math.min(crownMinY, cluster.center.y);
      crownMaxY = Math.max(crownMaxY, cluster.center.y);
    }
  } else {
    for (const card of needleCards) {
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
    // ── Low 壳卡烘焙：隔簇抽取的切向竖卡（宽轴 = 簇切向水平投影——层板延伸方向窄条
    //    剪影；单卡口径记档模块头）──
    for (let i = 0; i < ctx.clusters.length; i += LOW_SHELL_STRIDE) {
      const cluster = ctx.clusters[i]!;
      const half = cluster.radius + LOW_SHELL_MARGIN;
      let h = cluster.dir.clone();
      h.y = 0; // 簇切向水平投影
      if (h.lengthSq() < 1e-6) h.set(1, 0, 0); // 近铅垂切向的确定性回退
      h.normalize();
      const hw = THREE.MathUtils.clamp(
        (cluster.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY),
        0,
        1,
      );
      emitShellCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        cluster.center, h, half,
        shellCardRandOf(cluster.center.x, cluster.center.y, cluster.center.z), hw,
      );
    }
  } else {
    for (const card of bakedCards) {
      const hw = THREE.MathUtils.clamp((card.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY), 0, 1);
      emitCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        card,
        0.12 * hw, // 根边（挂枝端）≈ 0
        0.52 + 0.44 * hw, // 尖边大；树顶卡 > 树底卡
      );
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

  // ── 层几何组装：树皮（含球果卡；aLeafRand/aBend 恒 0——mergeGeometries 属性集一致）──
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

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 针叶卡 1）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_cedrus 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  return {
    geometry,
    stats: {
      barkTriangles: (groups[0]?.count ?? 0) / 3 - coneTriangles,
      needleTriangles: (groups[1]?.count ?? 0) / 3,
      needleCards: lod.shellCards ? lowShellCount : bakedCards.length,
      rosetteCards: bakedRosette,
      longCards: bakedLong,
      needleCandidates: ctx.needleCandidates.length,
      channelRejects,
      gapRejects,
      levelBranches: ctx.levelBranches,
      levelMeanStartRadius: ctx.levelBranches.map((n, i) => (n > 0 ? ctx.levelRadiusSum[i]! / n : 0)),
      tierHeights,
      tierSpacingMean: tierSpacing,
      crownRadius,
      tierAngleMeans,
      leaderPeakY: ctx.leaderPeakY,
      leaderTipY: ctx.leaderTipY,
      bandCandidates,
      bandSurvived,
      coneCandidatePool: ctx.coneCandidates.length,
      conesMature: bakeCones ? conesMature : 0,
      conesYoung: bakeCones ? conesYoung : 0,
      conesAxis: bakeCones ? conesAxis : 0,
      coneTriangles,
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
      channels: ctx.channels.map((ch) => ({
        ax: ch.ax,
        ay: ch.ay,
        az: ch.az,
        bx: ch.bx,
        by: ch.by,
        bz: ch.bz,
        r: Math.sqrt(ch.r2),
      })),
    },
  };
}

/**
 * L1 层枝生长（层板专路——身份核心）：路径 = 起点方向（层角梯度）+ 每步游走 +
 * **层板垂直速度场**（tierPlateArch 中部上拱 + tierEdgeDroop 外段下卷——升扇/拱形
 * 层板轮廓，外缘先平后微垂下卷）；起径 = 主干挂点径 × tierBranchRadiusRatio × rank；
 * 子级递归进 growBranch（L2 起 droop 链）；球果候选位挂账（L2 层板枝生成时记——见
 * growBranch level 1 段）。站点全分辨率计算（游走 rng 全消费——档间逐位同源），管发射
 * 按 lod 计划抽稀。
 */
function growTierBranch(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  lod: LodEmissionPlan,
  start: THREE.Vector3,
  dirIn: THREE.Vector3,
  length: number,
  startR: number,
  phase: number,
  tierIndex: number,
  heightFrac: number,
): void {
  const spec = profile.levels[0]!;
  const endR = Math.max(startR * LEVEL_END_RATIO[0]!, 0.004);
  const pts: THREE.Vector3[] = [];
  const radii: number[] = [];
  let d = dirIn.clone().normalize();
  const p0 = start.clone().addScaledVector(d, -(startR * 2.5 + 0.015)); // 子枝起点内埋（接缝黑洞杜绝——家族沿用）
  let p = p0;
  for (let i = 0; i <= spec.segs; i++) {
    const t = i / spec.segs;
    pts.push(p.clone());
    radii.push(startR + (endR - startR) * t); // 线性锥度（连续到子级）
    if (i < spec.segs) {
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize(); // massive 层枝刚直（wander 0.06）
      // ── 层板垂直速度场（升扇/拱形 + 外缘下卷——层板轮廓身份）──
      const tNext = (i + 1) / spec.segs;
      const arch = profile.tierPlateArch * Math.sin(Math.PI * tNext) * TIER_ARCH_GAIN; // 中部上拱
      const edge = profile.tierEdgeDroop * THREE.MathUtils.smoothstep(tNext, 0.45, 1) * TIER_EDGE_GAIN; // 外缘下卷
      d.add(UP.clone().multiplyScalar(arch - edge)).normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  if (lod.emitTube[0]) {
    emitTube(ctx.bark, thinStations(pts, lod.stationStep[1]!), thinStations(radii, lod.stationStep[1]!), lod.radial[1]!, 0.5);
  }
  ctx.levelBranches[0]!++;
  ctx.levelRadiusSum[0]! += startR;
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

  // 子级递归（childPlan[0]：侧枝 + 末位 1.0 延伸枝——层板填充链）
  recurseChildren(ctx, rng, profile, lod, 0, length, phase, radiusAt, pointAt, tierIndex, heightFrac);
}

/**
 * 顶梢专路（近景身份读向）：主干顶独立枝——近直立初向 + **二次增强下垂**（leaderDroop ×
 * t²——末段点头：peak 站高于末站的确定性读向，stats.leaderPeakY/TipY 结构证据）+ 固定
 * LEADER_NEEDLE_CARDS 张散生针卡（防裸梢——顶梢细尖但被针叶包裹的真实读向）。
 */
function growLeader(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  lod: LodEmissionPlan,
  start: THREE.Vector3,
  dirIn: THREE.Vector3,
  length: number,
  startR: number,
): void {
  const spec = profile.levels[0]!;
  const endR = Math.max(startR * 0.3, 0.006);
  const pts: THREE.Vector3[] = [];
  const radii: number[] = [];
  let d = dirIn.clone().normalize();
  let p = start.clone().addScaledVector(d, -(startR * 2.0));
  for (let i = 0; i <= spec.segs; i++) {
    pts.push(p.clone());
    radii.push(startR + (endR - startR) * (i / spec.segs));
    if (i < spec.segs) {
      d.add(randUnit(rng).multiplyScalar(0.05)).normalize(); // 顶梢细柔微游走
      const t = i / spec.segs;
      d.add(UP.clone().multiplyScalar(-profile.leaderDroop * t * t * LEADER_DROOP_GAIN)).normalize(); // 二次增强点头
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  if (lod.emitTube[0]) {
    emitTube(ctx.bark, thinStations(pts, lod.stationStep[1]!), thinStations(radii, lod.stationStep[1]!), lod.radial[1]!, 0.5);
  }
  ctx.levelBranches[0]!++; // 顶梢计入 L1 管账（皮拓扑 29 管的组成）
  ctx.levelRadiusSum[0]! += startR;
  for (const pt of pts) {
    ctx.leaderPeakY = Math.max(ctx.leaderPeakY, pt.y);
    ctx.maxY = Math.max(ctx.maxY, pt.y);
  }
  ctx.leaderTipY = pts[pts.length - 1]!.y;

  // 顶梢散生针卡（固定计数——rng 无条件消费；同长枝散生卡管线）
  const pointAt = (t: number): THREE.Vector3 => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return pts[i]!.clone().lerp(pts[i + 1]!, idx - i);
  };
  emitLongShootCards(ctx, rng, profile, pointAt, LEADER_NEEDLE_CARDS);
}

/**
 * 分枝递归（L2–L5，level 1–4）：路径 = 起点方向 + 每步游走 + **droop 链**（方向更新减
 * UP × droop × t × DROOP_GAIN——salix upturn 负链的下垂向改写：L2 近平（0.05）→ L5
 * 垂帘（0.45），层缘垂帘的姿态语言）；起径 = 父径 × CHILD_RADIUS_RATIO、末径 = 起径 ×
 * LEVEL_END_RATIO；L4/L5 = 长短枝双挂点（莲座簇位 + 散生针卡）；L2 层板枝记球果候选位
 * （外缘结果带——coneFruitingZone 起 coneCandidates 位/枝，上半冠门控在账目侧）。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划抽稀。
 */
function growBranch(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  lod: LodEmissionPlan,
  level: number,
  start: THREE.Vector3,
  dirIn: THREE.Vector3,
  length: number,
  startR: number,
  phase: number,
  tierIndex: number,
  heightFrac: number,
): void {
  const spec = profile.levels[level]!;
  const endR = Math.max(startR * LEVEL_END_RATIO[level]!, 0.004);
  const pts: THREE.Vector3[] = [];
  const radii: number[] = [];
  let d = dirIn.clone().normalize();
  const p0 = start.clone().addScaledVector(d, -(startR * 2.5 + 0.015)); // 子枝起点内埋
  let p = p0;
  for (let i = 0; i <= spec.segs; i++) {
    const t = i / spec.segs;
    pts.push(p.clone());
    radii.push(startR + (endR - startR) * t);
    if (i < spec.segs) {
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize(); // 主次分级游走（粗枝刚直 → 细枝纷乱）
      d.add(UP.clone().multiplyScalar(-spec.droop * t * DROOP_GAIN)).normalize(); // droop 链（针叶姿态语言）
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  if (lod.emitTube[level]) {
    emitTube(ctx.bark, thinStations(pts, lod.stationStep[1 + level]!), thinStations(radii, lod.stationStep[1 + level]!), lod.radial[1 + level]!, 0.5);
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

  // 球果候选位（L2 层板枝——外缘结果带：coneCandidates 位/枝，t = fruitingZone → 1
  // 均布；零 rng 纯位置——posHash 排序抽选在收冠后 accountCones 统一执行）
  if (level === 1) {
    for (let j = 0; j < profile.coneCandidates; j++) {
      const t =
        profile.coneFruitingZone +
        (1 - profile.coneFruitingZone) * (profile.coneCandidates > 1 ? j / (profile.coneCandidates - 1) : 0.5);
      const pos = pointAt(THREE.MathUtils.clamp(t, 0, 1));
      ctx.coneCandidates.push({ x: pos.x, y: pos.y, z: pos.z, heightFrac });
    }
  }

  // ── 长短枝双挂点（末两级 L4/L5）──
  if (level >= profile.levels.length - 2) {
    const isL5 = level === profile.levels.length - 1;
    // ① 短枝莲座簇（簇 = 1 卡——单卡承载整簇针叶的 SDF 抽象；rosetteNeedles 归 3b）
    const clusterCount = isL5 ? profile.clustersL5 : profile.clustersL4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    for (let i = clusterCount - 1; i >= 0; i--) {
      // 簇沿枝 t：枝端簇（t=1）优先生成序；emitOrdinal = 枝端优先序（Mid 掩码保枝端簇）
      const spread = clusterCount === 1 ? 0.6 : i / (clusterCount - 1);
      const t = THREE.MathUtils.clamp(inner + spread * (1 - inner) + jitter(rng, 0.05), 0, 1); // 1 次
      const attach = pointAt(t);
      const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      const size = profile.rosetteCardMin + rng() * profile.rosetteCardSpan; // 1 次
      const radius = size * 0.5; // 簇半径 = 卡半边长（壳卡吞并域 + 簇级抑制口径）
      const center = attach.clone().addScaledVector(tangent, radius * 0.4); // 簇坐枝梢稍前方
      // 簇级显式剔除：与已保留簇中心距 < clusterMinSeparation×(ri+rj) 的簇位丢弃（簇位与
      // 卡参数 rng 仍无条件消费——确定性纪律）
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
      // 莲座卡参数（无条件消费——含被剔除簇位）：簇平面 ⊥ 切向（辐射莲座）+ 方位/倾侧/滚转；
      // 卡根坐簇心、卡体沿 dir 伸出（根锚卡——aBend 根端 = 短枝钉枝位）；dir 与切向前向
      // 反向时 dir/side 同取负（卡面不变、根尖互换、法线不变）——莲座尖恒指枝梢前方。
      // **交叉双卡（Step 4 校准 2026-09-29）**：单面卡无角度覆盖（卡平面 ⊥ 枝切向 →
      // 边缘朝向投影近零——M25 剪影透天 88% 的主因之一）；第二卡绕 dir 轴转 90°（side→
      // 法线、法线→−side——与首卡共享 dir 轴的正交平面，家族 Low 壳卡/花序交叉卡同款
      // 统计覆盖语言）；第二卡参数零 rng 派生（aLeafRand = sin 散列错相——簇内双卡色相
      // 微差；emitOrdinal = 簇序×2 + 1——Mid 掩码 %2===0 恒保首卡，每簇至少一卡）
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0);
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      const phi = rng() * Math.PI * 2; // 1 次（簇平面内辐射方位）
      const tilt = (rng() - 0.5) * 0.5; // 1 次（卡面倾侧——莲座自然不齐）
      let cardDir = u1
        .clone()
        .multiplyScalar(Math.cos(phi))
        .add(u2.clone().multiplyScalar(Math.sin(phi)))
        .add(UP.clone().multiplyScalar(0.25 + tilt))
        .normalize();
      if (cardDir.dot(tangent) < 0) {
        cardDir.negate();
      }
      let side = cardDir.clone().cross(tangent);
      if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
      side.normalize();
      const roll = rng() * Math.PI; // 1 次（卡面滚转——打散规则感）
      side.applyAxisAngle(cardDir, roll).normalize();
      const rand = rng(); // 1 次
      if (kept) {
        const normal = side.clone().cross(cardDir).normalize();
        ctx.needleCandidates.push({
          center: center.clone(),
          dir: cardDir.clone(),
          side: side.clone(),
          width: size,
          height: size, // 方卡（莲座放射读向——SDF 内 20 针放射归 3b）
          rand,
          clusterIndex,
          kind: 'rosette',
          emitOrdinal: (clusterCount - 1 - i) * 2, // 枝端优先序 ×2（偶数位——Mid 掩码保首卡）
        });
        // 第二卡：dir 同轴、side = 首卡法线（正交平面交叉）；rand sin 散列错相（零 rng）
        ctx.needleCandidates.push({
          center: center.clone(),
          dir: cardDir.clone(),
          side: normal.clone(),
          width: size,
          height: size,
          rand: fract01(rand * 7.31 + 0.37),
          clusterIndex,
          kind: 'rosette',
          emitOrdinal: (clusterCount - 1 - i) * 2 + 1, // 奇数位（Mid 掩码弃——每簇保首卡）
        });
      }
    }
    // ② 长枝散生针卡（逐枝固定计数——螺旋散生辐射伸展；不归簇账 = -1，ginkgo 同口径）
    const longCount = isL5 ? profile.longShootCardsL5 : profile.longShootCardsL4;
    emitLongShootCards(ctx, rng, profile, pointAt, longCount);
  }

  // 子级递归（L5 末级无子）
  if (level < profile.levels.length - 1) {
    recurseChildren(ctx, rng, profile, lod, level, length, phase, radiusAt, pointAt, tierIndex, heightFrac);
  }
}

/** 散生卡簇账索引（长枝散生卡不归簇账 = -1——ginkgo 同口径） */
const LONGSHOOT_CLUSTER_INDEX = -1;

/**
 * 长枝散生针卡发射（growBranch 末两级与顶梢共用——逐枝固定计数，rng 每卡 8 次无条件
 * 消费）：t 外段均布 + 黄金角螺旋方位（「长枝螺旋散生辐射伸展」Verified）+ 抬离枝轴 +
 * 外上前举 + 细长针形卡（needleCardLen/Aspect 域）。
 */
function emitLongShootCards(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  pointAt: (t: number) => THREE.Vector3,
  count: number,
): void {
  for (let k = 0; k < count; k++) {
    const t = THREE.MathUtils.clamp(
      LONGSHOOT_T_START + ((k + 0.5) / count) * LONGSHOOT_T_SPAN + jitter(rng, 0.04),
      0,
      1,
    ); // 1 次
    const base = pointAt(t);
    const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
    let u1 = tangent.clone().cross(UP);
    if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0);
    u1.normalize();
    const u2 = tangent.clone().cross(u1).normalize();
    const phi = k * GOLDEN_ANGLE + jitter(rng, 0.5); // 1 次（螺旋叶序方位 + 抖动）
    const radial = u1.clone().multiplyScalar(Math.cos(phi)).add(u2.clone().multiplyScalar(Math.sin(phi))).normalize();
    const stick = 0.02 + rng() * LONGSHOOT_STICK_SPAN; // 1 次（抬离枝轴 0.02–0.05m）
    const cardCenter = base.clone().addScaledVector(radial, stick);
    const lift = 0.35 + rng() * 0.35; // 1 次（外上前举分量）
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
    const height = profile.needleCardLenMin + rng() * profile.needleCardLenSpan; // 1 次（针长）
    const aspect = profile.needleCardAspectMin + rng() * profile.needleCardAspectSpan; // 1 次（细长针形）
    const rand = rng(); // 1 次
    ctx.needleCandidates.push({
      center: cardCenter,
      dir: cardDir,
      side,
      width: height / aspect,
      height,
      rand,
      clusterIndex: LONGSHOOT_CLUSTER_INDEX,
      kind: 'long',
      emitOrdinal: k, // Mid 掩码位（3 候选保 2）
    });
  }
}

/**
 * 子级递归公共段（growTierBranch / growBranch 共用）：childPlan[level] 挂点序列——
 * 侧枝（方位按父相位均分 + 抖动 + 上举混合）与末位 1.0 延伸枝（延续父向 + 轻微上扬与
 * 游走）；子枝长 = 父长 × CHILD_LENGTH_RATIO[level]（±CHILD_LENGTH_JITTER）——末级
 * （L4→L5）再乘 fringeLengthRatio（垂帘加长——salix 机制）；每子恰 4 次 rng（t 抖动 +
 * 方位组 2 / 延伸 randUnit 2 + 长 1——延伸/侧枝两形态消费数恒等）。
 */
function recurseChildren(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  lod: LodEmissionPlan,
  level: number,
  parentLength: number,
  phase: number,
  radiusAt: (t: number) => number,
  pointAt: (t: number) => THREE.Vector3,
  tierIndex: number,
  heightFrac: number,
): void {
  const plan = profile.childPlan[level]!;
  const isLastTransition = level === profile.levels.length - 2;
  for (let i = 0; i < plan.ts.length; i++) {
    const t = Math.min(1, plan.ts[i]! + jitter(rng, 0.05)); // 1 次
    const attach = pointAt(t);
    const attachR = radiusAt(t);
    const isTip = plan.ts[i] === 1.0;
    const tTan = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
    let childDir: THREE.Vector3;
    let childPhase = phase;
    if (isTip) {
      // 延伸枝：延续父向 + 轻微上扬与游走（层板外缘延伸/垂帘延续）
      childDir = tTan.clone().add(UP.clone().multiplyScalar(0.18)).add(randUnit(rng).multiplyScalar(0.25)).normalize(); // 2 次
    } else {
      // 侧枝：方位按父相位角均分展开（层板填充）+ 抖动；上举混合比层级分档（层板近平）
      childPhase = phase + i * plan.phaseStep + jitter(rng, 0.35); // 1 次
      const h = new THREE.Vector3(Math.cos(childPhase), 0, Math.sin(childPhase));
      childDir = h
        .multiplyScalar(0.8)
        .add(UP.clone().multiplyScalar(0.12 + rng() * 0.22)) // 1 次（层板填充枝近平）
        .add(tTan.clone().multiplyScalar(0.25))
        .normalize();
    }
    const lenRatio =
      CHILD_LENGTH_RATIO[level]! * (1 - CHILD_LENGTH_JITTER / 2 + rng() * CHILD_LENGTH_JITTER) * // 1 次
      (isLastTransition ? profile.fringeLengthRatio : 1);
    growBranch(
      ctx,
      rng,
      profile,
      lod,
      level + 1,
      attach,
      childDir,
      parentLength * lenRatio,
      attachR * CHILD_RADIUS_RATIO[level]!,
      childPhase,
      tierIndex,
      heightFrac,
    );
  }
}
