/**
 * runtime/procedural/tree/metasequoia/metasequoiaGeometry —— 水杉
 * （Metasequoia glyptostroboides Hu & W. C. Cheng，柏科水杉属落叶乔木，单种属）
 * CPU 几何生成器（T012.2 Step 3a，**针叶家族 conifer 第二实例——契约转正例**：
 * 方法 = 族内先例复制（012.2 待裁决位 5）——几何管线（growBranch 递归 / 层位量化
 * 挂点 / 簇布点 / 卡挂点 / 锥度管发射 / 平行传输标架 / minY 贴地 / 属性契约）复制自
 * 雪松 cedrusGeometry 经首例验证的方法；挂点语言按水杉**对生枝序 + 羽状小枝卡 +
 * 密连续锥冠 + 双器官下垂账目**改写（T012.2 Step 1 判定 1–5；cedrus 四件零触碰）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的
 *      **对生轮生层位分枝拓扑** → 锥度管状枝干（平行传输标架）→ 末两级**羽状小枝卡
 *      对生叶序挂点**（clusterAzimuthStep 逐点步进 + 偶奇 ±π 配对 + 交叉双卡——
 *      单面卡无角度覆盖的统计覆盖修复，012.1 校准实证直承）+ **密连续锥冠零端层隙**
 *      （tierGapBand 0 = 层带密度场整场短路——连续分布无层间空带）+ **球果下垂账目 +
 *      雄序枯穗账目**（双器官，零 rng——koelreuteria 账目法；长柄下垂姿态 + 未熟绿果
 *      单 cohort），产出树皮/羽卡两层非索引几何；层间 mergeGeometries(useGroups=true)
 *      恰 2 组（D15 免组膨胀：皮 0 / 羽卡 1——**球果卡 + 枯穗卡入皮组**：uv v 域身份
 *      标记 + aLeafRand/aBend 随组恒 0，材质按 v 域分流配方——三级帧域冻结接口见
 *      任务派遣简报，与 metasequoiaMaterials 并行交付）。
 *      形态参数类型 = 针叶家族契约 ../conifer/coniferShapeProfile（**定稿**——本任务
 *      Step 2 转正；水杉 = 第二实例/转正例），数值与槽组合见
 *      ./metasequoiaShapeProfile（全部数值依据 docs/research/metasequoia-reference.md
 *      Spec 1.0 含终审记档）；build 只做 slot → profile 路由
 *      （assets/asset_tree_metasequoia），不进 ProceduralBuild 公共签名。
 *
 * ── 对生轮生骨架（身份核心，Step 1 判定 1 机制逐项落点）──
 *   1. **scaffold 挂点按层位量化路由 + 对生成对**：主干顶端 = 树高 − 顶梢段
 *      （leaderLengthRatio）；tierCount 主层在 [首层挂高, 主干顶] 均匀布层 +
 *      tierSpacingJitter 垂直抖动；层内 tierBranchCount = 2 枝**±180° 方位对**
 *      （az = phase0 + 层序 × tierPhaseStagger + rank × π——MoBot「twigs…
 *      in opposite pairs」Verified 的层内实现）+ crownAsymmetry 抖动；**层间交错
 *      90°**（tierPhaseStagger——decussate 观感；rank 跨层同方位保持相干，破缺即
 *      slot-5 偏冠载体）。
 *   2. **层角梯度**：层枝初向自垂直角 = tierAngleBase 78°（下部近水平——s01 终审
 *      精化 70–85°）→ tierAngleTop 40°（上部斜展上举 30–50°）沿层位线性插值 +
 *      tierAngleJitter 抖动（与雪松 81→44 同型读向——层状骨架语言家族第一横向证据）。
 *   3. **密连续锥冠**（判定 3，vs 雪松层叠带隙尖塔）：层半径沿高 =
 *      mix(1, tierRadiusTaper, u^tierProfileExponent)（近线性指数 1.35 = 光滑圆锥
 *      收顶读向）；层板弱拱（tierPlateArch 0.05「枝斜展上举」Verified）+ 外缘轻下卷
 *      （tierEdgeDroop 0.05）；**tierGapBand 零端消费 = 层带密度场整场短路**（密度
 *      恒 1，簇布点连续分布无层间空带——消费差异即转正素材：字段保留家族共性、
 *      水杉走零端分支；通透只剩枝干通道硬抑制一规则）。
 *   4. **末级轻垂**（判定 4 轻度版——「branchlets pendulous」Verified）：L2–L5
 *      droop 链（levels[].droop 0.01→0.26 « 雪松垂帘 0.45——salix upturn 负链的下垂
 *      向机制、幅度谱系轻端）+ fringeLengthRatio 末级轻加长（1.15）。
 *   5. **顶梢通直无点头**（判定 4：leader 通直——顶梢专路〔下垂点头 + 裸梢散生卡〕
 *      = 族内可选·雪松消费位，本资产不实现）：主干顶独立顶梢枝（近直立微倾 +
 *      leaderDroop 0 占位短路——二次点头项恒零）；**顶梢羽簇防裸梢**（固定
 *      LEADER_FEATHER_CLUSTERS 簇沿顶梢对生叶序挂点——通直细尖但被羽叶包裹的
 *      密尖塔收顶读向；结构计数类：槽间恒等）。
 *   6. **羽状小枝卡挂点（判定 2 新形态语言）**：「叶」单位 = 侧生小枝系统
 *      （「Leaves deciduous together with lateral branchlet as a unit」Verified）——
 *      1 卡 = 1 羽状小枝（卡内帧根→尖，rosetteNeedles 二列叶元素归 3b SDF）；挂点 =
 *      末两级（L5/L4）簇位 × **对生交错叶序**（clusterAzimuthStep π/2 逐对步进 +
 *      偶奇 ±π 配对——「叶对生基部扭转成二列」Verified 的挂点语言实现）+
 *      clusterInnerStartL5/L4 挂点前移（密冠自枝基部布满——012.1 三杠杆之二的
 *      校准实证直承）+ clusterMinSeparation 低抑制（0.08——重叠由交叉双卡随机滚转
 *      吸收）；卡姿 = 自枝轴方位外伸 + **下垂倾侧**（末级轻垂的卡级表达）+ 沿枝前
 *      向分量 + 滚转打散。**交叉双卡**（三杠杆之一）：第二卡绕卡轴转 90°（side→
 *      法线），零 rng 派生（aLeafRand sin 散列错相）；**Mid 档保交叉双卡、隔簇位
 *      抽取**（站点级掩码——每存活簇保双卡，见 LOD 段）。
 *   7. **双器官下垂账目（判定 5，零 rng——koelreuteria 账目法改写）**：结果位 =
 *      L3 层枝外段结果带（coneFruitingZone 0.72 起——「单生去年生枝顶/近顶」
 *      Verified 的外段映射）；① 球果：coneCandidates 候选 → posHash 排序 +
 *      coneKeepRatio 抽选 → **长柄下垂姿态**（卡根坐挂点下方 CONE_STALK 果柄 +
 *      下垂外倾弯垂轴——「果柄伸长、成熟时下垂」Verified + s06 柄 2–3cm 弯垂
 *      Observed）+ 未熟绿果单 cohort（coneClassRatio 1 占位——当年 10–11 月熟的
 *      9–10 月主语境绿果读向，两类并存位不消费）；② 雄序枯穗（第二器官，
 *      strobili 组——转正新增位）：strobiliCandidates 候选 → posHash 抽选 →
 *      下垂枯穗卡（沿穗轴帧——s04 实证 9-30 枝上残留上年雄花序枯穗 3–5cm 下垂）。
 *      两账目均零 rng（消费顺序契约不含器官）。
 *
 * ── 预算锁定账目（LOD 已锁 conifer 行：High ≤ 40000 / Mid 6000–10000 /
 *    Low 1500–3000 / Canopy ≤ 500——T012.1 锁定，本行非候选带流程（012.2 待裁决位
 *    2）；实测记档 = **Step 4 密度校准终测 2026-09-29 规范种子**〔初版 Step 3a 记档
 *    被 Step 4 取代：羽卡 0.055–0.10 → 0.18–0.30 + 簇位 6/4 → 12/8 + 簇抑制
 *    0.08 → 0.02——终诊 = 羽卡密度/尺度不足，M25 投影 ~0.1% 亚像素；Mid/Low 抽稀
 *    档位同步（%3 / stride 5）出带回调授权内〕，回写 ../assets/
 *    asset_tree_metasequoia.asset 模块头）──
 *    8 槽 × 3 档实测带：**High 27088–35156**（皮恒 17136 + 羽卡 4686–8752 张 ×2 +
 *    球果 39–48×4 + 枯穗 90–112×4；slot-6 疏松最低 / slot-7 密端与 slot-2 宽冠密簇
 *    并列最高）⊂ ≤40000（上限用满 68–88%——slot-0 32172 = 80.4%，沿雪松 32.2–38.4K
 *    校准先例带）；**Mid 7090–9654**（皮恒 2874 + 存活簇位/3 × 双卡 + 双器官全量
 *    〔卡数比实测 0.345–0.388——L4 掩码位 3/8 与通道剔除的结构性偏置〕）；**Low
 *    2076–2838**（皮恒 786 + 壳卡 = ⌈保留簇/5⌉ × 2、双器官省略〔远距亚像素〕）；
 *    rng 消费 slot-0 三档恒等 **50463**（快照锁 = 骨架 6107 + 簇位 7×5126 + 通透
 *    roll 2×4237）、minY 三档恒 0；层间距涌现 1.17m（密层——vs 雪松 1.74）。
 *
 * 结构计数（皮拓扑槽间恒定 → 皮面数恒等）：主干 518（18 段 ×14 + 底盖 14）+ 顶梢
 *      计入 L1 → L1–L5 = [21, 40, 80, 160, 320]（20 层枝 + 1 顶梢；10 层 × 2 对生
 *      枝），皮面 High 恒 **17136** = 主干 518 + L1 2058（21×7 段×7）+ L2 2400
 *      （40×5×6）+ L3 3200（80×4×5）+ L4 3840（160×3×4）+ L5 5120（320×2×4）；
 *      羽簇位 5126（L5 320×12 + L4 160×8 + 顶梢 6——**Step 4 密度校准值 12/8**
 *      〔初版 6/4 = 2566 位〕；rng 消费次数恒定的固定计数），
 *      保留簇数随 seed 由簇级抑制 + 通道规则确定（同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律沿用）：簇生成 rng 消费无条件固定次数（每簇位 7 次：t/尺寸/
 *      方位抖/下垂倾侧/滚转/rand/轮廓比），被抑制丢弃的簇位足额消费后丢弃；通透 roll
 *      每卡无条件 1 次；**双器官账目零 rng**（posHash 确定性布点）；rng 消费总数 = 结构
 *      固定段 + 通透 roll 段（计数 = 存活卡数——随保留簇数浮动，家族先例同机制）。
 * 羽卡属性契约（008.3 家族冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐卡 ∈ [0,1)（**逐卡种子**——风动 flutter
 *        相位变奏源，消费语义归 3b；实例级 aSeed 归 Runtime/D20.4，几何零 aSeed
 *        顶点属性——与池挂逐实例 InstancedBufferAttribute('aSeed') 无名冲突）；
 *        皮组（含球果/枯穗卡）恒 0；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，**沿枝弧长 0→1 弯曲权重（末级最大）**
 *        （T012.2 冻结接口）：根边 = (0.10 + 0.42×t)×lf / 尖边 = 根 + 0.28×lf
 *        （t = 簇位沿枝弧长；lf = 末级权重——L5/顶梢 1.0、L4 0.72），卡内根→尖
 *        非降；树皮层同名属性写恒等值 0。
 * uv 三级帧域（**T012.2 冻结接口**——vs 雪松双帧域阈值 1.5：三级帧域判别阈值
 *      1.0 / 2.0，族级差异已知会 3b）：羽状叶卡 v∈[0, 0.99]（根→尖帧——尖端取
 *      0.99 **不取 1.0 整**：1.0 判别阈值的安全边距，卡内帧线性 0→0.99、1% 压缩
 *      不可辨）/ 球果卡 v∈[1.0,1.95]（沿垂轴帧——u = 逐果色档常量〔3b 合并裁定：
 *      器官卡走皮组 + u 色档契约，中心放射结构在该契约下不可表达——记缺口候选〕；
 *      根 1.0 恰落阈值判据 v ≥ 1.0 的球果侧 ✓）/ 雄序枯穗卡
 *      v∈[2.0,2.95]（沿穗轴帧——v=2 根 → v=2.95 穗尖；根 2.0 恰落 v ≥ 2.0 枯穗侧 ✓）；
 *      **皮管域 v ∈ [0, TUBE_V_MAX=0.92] 逐管归一**（球果域自 1.0 起——锥冠域紧贴，
 *      16.5m 级以上干长按弧长比例必侵入；雪松「主干逐管归一」防线的全程推广：主干
 *      与全部枝管均按全弧归一到 0.92 < 1.0，任意槽树高/冠幅组合下皮管域与器官域
 *      恒隔离——3b 树皮条片 SDF 的 v 向频率按逐管归一口径定档）；主干底盖 uv 盘
 *      半径 0.4（v ≤ 0.9——同阈值防线）。
 * LOD 三档（家族方法复制：level 为 Runtime 可选参数——不参与 shapeSlot/morphSeed/
 *      sourceKey 形态身份计算）：三档共用**同一条 rng 消费流**与同一套骨架/簇位/
 *      器官决策路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/簇位
 *      照常足额消费 rng（三档 rng 消费总数恒等），枝路径/簇位/通道过滤/器官决策
 *      逐位同源：
 *      - High：全发射（缺省档；皮 17136）；球果 + 枯穗全量（身份信号）；
 *      - Mid：径向段数降（14/7/6/5/4/4 → 6/5/4/3/3/3）+ 轴向站点隔 1 抽 1 +
 *        L5 末级细管不发射（末级径 ≈7mm，Mid 观距亚像素；簇位照常派生）+
 *        **站点级隔 2 抽 1 保交叉双卡**（siteOrdinal % 3 === 0 的簇位整簇保留双卡
 *        ——「交叉双卡 High/Mid 保留」的 Mid 实现：单面羽卡无角度覆盖，Mid 保对
 *        卡、抽 2/3 簇位〔%3 = Step 4 密度校准同步值——簇位 ×2 后原 %2 出 Mid 带
 *        上限〕，角覆盖与面数同守；存活卡 ⊂ High 存活卡逐位同位）+ 双器官全量
 *        保留（身份信号）；皮 2874；
 *      - Low：主干 + L1 层枝极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（**每保留簇 1 张切向竖卡 × 隔 5 簇抽取**
 *        （stride 5——Step 4 密度校准同步值：簇位量级 5000+ 的预算适配）× 半幅 =
 *        簇半径 + LOW_SHELL_MARGIN 0.20（羽簇半径 0.09–0.15——壳卡体量 0.29–0.35
 *        半幅，远距剪影连续）；
 *        aBend 沿用簇位弧长权重（clusterBends 平行账——沿枝弧长语义 Low 不失）；
 *        **壳卡走羽卡帧 v∈[0,1]**（整簇抽象 → 材质 Low 档 8 元素羽 SDF 同帧）；
 *        球果 + 枯穗省略（远距亚像素——记档同 koelreuteria/雪松球果）；皮 786。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随
 *      调用移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 0）；叶法线取卡面单侧。
 * 风动 attribute 契约（家族先例）：几何携带 aLeafRand/aBend（皮组恒 0 实心）；
 *      树高锚 = profile.totalHeight 同源（3b 材质消费，无独立锚；两成分消费——
 *      整冠低频 + 末级高频细颤，顶梢成分不进本资产）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { METASEQUOIA_SLOT0_PROFILE } from './metasequoiaShapeProfile';
import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 羽卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙；bend 随候选携带） */
interface FeatherCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖 = 羽轴外伸下垂方向）
  side: THREE.Vector3; // 卡宽方向（滚转后）
  width: number;
  height: number;
  rand: number; // aLeafRand（逐卡种子）
  clusterIndex: number; // 所属簇位（≥ 0 归簇账）
  /** 挂点语言身份：feather = 羽状小枝卡（对生叶序单挂点——水杉唯一卡型） */
  kind: 'feather';
  /** 簇/枝内候选序（Mid 站点掩码 siteOrdinal % 2 === 0 的选择位——枝端簇优先序） */
  emitOrdinal: number;
  /** aBend 沿枝弧长权重（冻结接口——根/尖两值随候选携带，烘焙直读） */
  bendRoot: number;
  bendTip: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径——羽簇的簇空间。
 *  T021.6 家族共享契约同构（canopy proxy 消费——BroadleafClusterRecord 字段兼容） */
type ClusterRecord = BroadleafClusterRecord;

/** 枝干发射槽：非索引三角形流（pos/normal/uv 三数组同步追加——器官卡同槽） */
interface BarkSink {
  pos: number[];
  nrm: number[];
  uv: number[];
}

/** 枝干通道线段（点到线段距离 < r 即硬抑制——密冠露干的通透规则） */
interface ChannelSeg {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  r2: number; // 半径平方（判定预热）
}

/** 器官候选位（双器官账目原料：cone / strobili 共池分账） */
interface FruitCandidate {
  x: number;
  y: number;
  z: number;
  /** 所属层位的相对高度（上半冠门控用——挂点高/主干顶） */
  heightFrac: number;
  kind: 'cone' | 'strobilus';
}

/** 构建上下文：发射槽 + 簇表 + 候选羽卡 + 通道表 + 逐级统计 + 器官候选（全树共享） */
interface BuildCtx {
  bark: BarkSink;
  clusters: ClusterRecord[];
  clustersCulled: number; // 簇级距离抑制丢弃的簇位数（工程账目）
  /** 逐保留簇的 aBend 根权重（沿枝弧长——Low 壳卡沿用，平行账不进共享簇记录） */
  clusterBends: number[];
  featherCandidates: FeatherCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含顶梢枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点
  /** 逐层账目（层角梯度 + 对生成对结构证据）：每层枝初向自垂直角（度）均值 / 方位（弧度） */
  tierAngles: number[];
  tierAzimuths: number[][];
  fruitCandidates: FruitCandidate[];
  /** 顶梢账目（通直证据）：顶梢最高站 Y / 末站 Y（leaderDroop 0 → peak ≈ tip） */
  leaderPeakY: number;
  leaderTipY: number;
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface MetasequoiaGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 羽卡三角（featherCards × 2——组 1 纯卡） */
    needleTriangles: number;
    needleCards: number;
    /** 通透账目：候选数与两规则的剔卡数（通道 > 层隙密度场——首个命中计；
     *  tierGapBand 零端消费 → 密度场整场短路，gapRejects 恒 0——密连续锥读数） */
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
    /** 对生成对 + 层间交错证据：每层枝方位（弧度 ∈ [0,2π)——层内对差 ≈ π、层间差 ≈ π/2） */
    tierAzimuths: number[][];
    /** 顶梢通直证据：peak ≈ tip（leaderDroop 0——无点头读向） */
    leaderPeakY: number;
    leaderTipY: number;
    /** 层隙带证据（零端消费对照读数：带内/带外候选与存活——带外存活率 ≈ 带内 = 连续分布） */
    bandCandidates: [number, number];
    bandSurvived: [number, number];
    /** 球果账目（零 rng——确定性账目）：候选池（门控后）/ 烘焙数 / 三角 */
    coneCandidatePool: number;
    conesBaked: number;
    coneTriangles: number;
    /** 雄序枯穗账目（第二器官，零 rng）：候选池（门控后）/ 烘焙数 / 三角 */
    strobiliCandidatePool: number;
    strobiliBaked: number;
    strobiliTriangles: number;
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

/** x → [0,1)（确定性散列分量——双器官账目零 rng 的布点源） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

/** 位置确定性散列（salt 分通道——器官排序抽选/色档/姿态/尺寸共用，零 rng） */
function posHash(x: number, y: number, z: number, salt: number): number {
  return fract01(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + salt * 53.71) * 43758.5453);
}

// ── 对生轮生形态常数（工程设定——几何私有算法面；Spec 依据见 metasequoiaShapeProfile
//    逐字段，此处只放机制增益与结构常数；探针校准记档见模块头）──────────────────────

/** L1 层枝长 / 层半径（层板外缘由 L2 延伸枝补满） */
const TIER_BRANCH_LENGTH_FACTOR = 0.78;
/** 层板拱起增益（tierPlateArch × 此值 = 行走方向每步的向上速度分量幅度——弱拱） */
const TIER_ARCH_GAIN = 0.8;
/** 层板外缘下卷增益（tierEdgeDroop × 此值 = 外段（t>0.45 平滑过渡）向下速度分量幅度） */
const TIER_EDGE_GAIN = 1.4;
/** 逐过渡级子枝长比（L1→L2 … L4→L5——密冠体积填充链的长度衰减；末级偏高 = 轻垂段） */
const CHILD_LENGTH_RATIO = [0.44, 0.5, 0.58, 0.85] as const;
/** 子枝长比抖动幅度（±） */
const CHILD_LENGTH_JITTER = 0.12;
/** 逐过渡级子/父起径比（低级陡末级缓——主次分级；纤细分枝链：L1 ≈6cm → L5 ≈7mm） */
const CHILD_RADIUS_RATIO = [0.5, 0.58, 0.62, 0.66] as const;
/** 逐级末径/起径比（L1 通体顺收 → 末级收细；地板 0.004 同家族） */
const LEVEL_END_RATIO = [0.45, 0.5, 0.55, 0.6, 0.65] as const;
/** droop 链增益（levels[].droop × 此值 × t = 每步向下速度分量——salix upturn 负链同型） */
const DROOP_GAIN = 1.0;
/** 顶梢下垂增益（leaderDroop × t² × 此值——水杉 0 占位短路，常数沿家族保留位） */
const LEADER_DROOP_GAIN = 4.0;
/** 顶梢初向水平分量（近直立微倾——通直干顶延伸；« 雪松 0.22 无摆幅挂点需求） */
const LEADER_TILT = 0.1;
/** 顶梢干顶预留系数（主干顶 = 树高 − 顶梢段长 × 此值 ≈ 顶梢平均升角的余弦补偿） */
const LEADER_RISE_FACTOR = 0.9;
/** 顶梢羽簇数（固定计数——防裸梢；结构计数类：槽间恒等；对生叶序挂点同管线） */
const LEADER_FEATHER_CLUSTERS = 6;
/** 顶梢羽簇挂点 t 域下限（沿顶梢弧长——顶梢下半段留给干顶收细） */
const LEADER_FEATHER_INNER = 0.3;
/** 皮管 v 域归一上限（逐管归一——三级帧域球果卡自 1.0 起的必要防线，见模块头） */
const TUBE_V_MAX = 0.92;
/** 层隙空带密度地板（tierGapBand > 0 时的空带核心保留率——水杉零端短路不走此分支，
 *  常数沿家族机制保留位） */
const TIER_GAP_FLOOR = 0.05;
/** 球果/枯穗结果位上半冠门控（挂点高 ≥ 主干顶 × 此值的 L3 层枝为结果候选枝） */
const FRUIT_UPPER_CROWN_FRACTION = 0.5;
/** 枯穗结果带起点 t（沿枝弧长——叶腋列沿枝读向，较球果带内移起步） */
const STROBILUS_ZONE_START = 0.6;
/** 球果果柄长（米——「果柄伸长」Verified + s06 柄 2–3cm 弯垂 Observed 的中值） */
const CONE_STALK = 0.025;
/** 球果卡 SDF 余量（近球体轮廓 → 方卡半幅 = 果径 × 此值 × 0.5——沿垂轴帧留边） */
const CONE_CARD_SCALE = 1.15;
/** 球果下垂外倾幅度（弯垂轴水平分量——挂点下垂 + 微外倾的「长柄下垂」姿态） */
const CONE_SAG = 0.38;
/** 枯穗卡宽/长比（细穗剪影——3–5cm 枯穗的窄条读向） */
const STROBILUS_WIDTH_RATIO = 0.3;
/** 枯穗下垂外倾幅度（下垂枯穗姿态——s04 Observed 下垂读向） */
const STROBILUS_SAG = 0.3;
/** 羽卡下垂倾侧基值（「branchlets pendulous」的卡级表达——外伸 + 下垂倾侧） */
const FEATHER_DROOP_BIAS = 0.3;
/** 羽卡下垂倾侧 rng 域宽（± 一半——羽列自然不齐） */
const FEATHER_DROOP_SPAN = 0.34;
/** 羽卡沿枝前向分量（羽轴微前伸——小枝延展读向） */
const FEATHER_FORWARD = 0.16;
/** 羽卡 aBend 末级权重（lf——末级最大：L5/顶梢 1.0、L4 0.72） */
const FEATHER_BEND_LF_L5 = 1.0;
const FEATHER_BEND_LF_L4 = 0.72;
/** 羽卡帧尖端 v 值（0.99——**1.0 判别阈值的安全边距**：尖端若取 1.0 整则羽卡尖顶点
 *  会被 v ≥ 1.0 判进球果域；卡内帧线性 0→0.99，3b 侧按 v/0.99 归一或直接消费——
 *  1% 线性压缩不可辨） */
const FEATHER_V_TIP = 0.99;
/** Low 壳卡：每保留簇张数（1 = 单卡——「Low 单卡」冻结接口）与隔簇抽取步长
 *  （**Step 4 密度校准同步值 5**——簇位量级升至 5000+ 后 stride 3 出 Low 带
 *  〔>3000〕；壳卡半幅随簇半径升至 0.29–0.35——剪影连续性由更大壳卡承担） */
const LOW_SHELL_CARDS_PER_CLUSTER = 1;
const LOW_SHELL_STRIDE = 5;
/** Low 壳卡半幅余量（米）：羽簇半径 0.03–0.05 偏小（细质地身份）——壳卡体量由
 *  余量承担（0.20 覆盖羽簇常态伸出 + 远距剪影连续；极值叶尖仍由 High 决定冠包络） */
const LOW_SHELL_MARGIN = 0.2;

// ── LOD 三档发射计划（家族方法复制——档位只改「发射」，不改骨架决策/rng 消费序）──────────

/** LOD 发射档：三档共用同一条 rng 流与同一套骨架/簇位/器官决策，差异全在发射密度 */
interface LodEmissionPlan {
  /** 逐管径向段 [主干, L1..L5]（High = profile 原值；Mid/Low 为降段阶梯——粗枝保圆度） */
  radial: number[];
  /** 逐管轴向发射站点抽取步长（1 = 全发射；>1 = 每隔 step 站发射一站 + 恒保末站） */
  stationStep: number[];
  /** L1..L5 逐级是否发射管（false = 只递归不发射——子枝/簇位/rng 照常派生；主干恒发射） */
  emitTube: boolean[];
  /** 簇位级发射掩码（siteOrdinal % every === 0 的簇位整簇保留交叉双卡——Mid 站点级
   *  抽 2/3 保对卡〔every 3——Step 4 密度校准同步值〕；候选生成/通透过滤/rng 消费
   *  对全簇位照常——Mid 存活卡 ⊂ High） */
  siteEmitEvery: number;
  /** Low 壳卡模式：不烘焙簇内羽卡（候选/过滤/rng 照常），逐保留簇发射切向竖卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（预算记账 = 实测口径，正式预算带锁定见
 * ../assets/asset_tree_metasequoia.asset 模块头）：
 * - High 皮 17136（拓扑恒等不动：主干 518 + L1 2058〔21 管〕+ L2 2400 + L3 3200 +
 *   L4 3840 + L5 5120）；
 * - Mid 皮 2874 = 主干 114（9 段 ×6 + 底盖 6）+ L1 840（21 ×4 段 ×5）+ L2 960
 *   （40 ×3 段 ×4）+ L3 960（80 ×2 段 ×3），L4/L5 不发射（末级径 ≈7–11mm 亚像素）；
 * - Low 皮 786 = 主干 114 + L1 672（21 ×4 段 ×4）；
 * - Mid 卡 = 存活簇位 / 3 × 双卡（站点掩码保交叉对卡——Step 4 同步 %3）；Low 叶 =
 *   保留簇 / 5 × 2 三角（stride 5——Step 4 同步）。
 */
function lodPlanFor(profile: ConiferShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    return {
      radial: [profile.trunk.radial, ...profile.levels.map((l) => l.radial)],
      stationStep: [1, 1, 1, 1, 1, 1],
      emitTube: [true, true, true, true, true],
      siteEmitEvery: 1,
      shellCards: false,
    };
  }
  if (level === 'mid') {
    // 径向 14/7/6/5/4/4 → 6/5/4/3/3/3 + 隔 1 抽 1 + L4/L5 末级细管不发射（末级径
    // ≈7–11mm，Mid 观距亚像素；簇位照常派生）+ **站点级隔 2 抽 1（siteOrdinal % 3
    // === 0——Step 4 密度校准同步值：簇位 ×2 后原 %2 出 Mid 带上限，抽稀档位同步
    // 调整；整簇保留交叉双卡语义不变**——单面羽卡无角度覆盖，Mid 抽 2/3 簇位保对
    // 卡，角覆盖与面数同守）+ 双器官全量保留（身份信号）
    return {
      radial: [6, 5, 4, 3, 3, 3],
      stationStep: [2, 2, 2, 2, 2, 2],
      emitTube: [true, true, true, false, false],
      siteEmitEvery: 3,
      shellCards: false,
    };
  }
  // Low：主干 + L1 层枝极简管（径向 6/4）；L2–L5 不发射（递归照常走完消费 rng/
  // 派生簇位）；冠层转壳卡模式（单切向竖卡 × 隔 3 簇抽取——「Low 单卡」冻结接口）；
  // 球果 + 枯穗省略（远距亚像素——记档同雪松球果）
  return {
    radial: [6, 4, 3, 3, 3, 3],
    stationStep: [2, 2, 2, 2, 2, 2],
    emitTube: [true, false, false, false, false],
    siteEmitEvery: 1,
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

// ── 锥度管发射（家族方法复制：平行传输标架 + 外向绕制四边形；无树皮起伏——
//    水杉纵长条片-纤维剥落为纯材质语言（ConiferBarkProfile 全组 3b 消费），几何侧
//    零起伏场。**v 域逐管归一**：vScale = TUBE_V_MAX / 全弧长——三级帧域球果卡自
//    1.0 起，任意管长按比例缩放恒落 [0, 0.92]（雪松主干归一防线的全程推广）────────

/**
 * 锥度管发射：沿站点序列（points/radii 等长）平行传输标架，逐段发射外向绕制四边形
 * （三角形 (a0,b1,b0)/(a0,a1,b1)——右手系 (N,B,T) 下外向），uv = 环向 θ/2π × 逐管
 * 归一累计弧长（vScale = TUBE_V_MAX / 弧长，调用方传入）。
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
      [v0, 0.5 + 0.4 * Math.cos(th0), 0.5 + 0.4 * Math.sin(th0)],
      [v1, 0.5 + 0.4 * Math.cos(th1), 0.5 + 0.4 * Math.sin(th1)],
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

/** 站点序列全弧长（逐管归一 vScale 的分母） */
function arcOf(points: THREE.Vector3[]): number {
  let arc = 0;
  for (let i = 1; i < points.length; i++) arc += points[i]!.distanceTo(points[i - 1]!);
  return Math.max(arc, 1e-6);
}

// ── 双器官下垂账目（零 rng——koelreuteria 账目法改写；「足额候选 posHash 排序 +
//    keep 抽选」；长柄下垂姿态 = 水杉改写，vs 雪松直立如烛）─────────────────────────

/** 器官烘焙卡原料（账目抽选后的成卡：位置 + 尺寸 + 色档 u + 弯垂方位/幅度） */
interface OrganCard {
  x: number;
  y: number;
  z: number;
  /** 卡半幅（球果 = 果径 × CONE_CARD_SCALE × 0.5；枯穗 = 穗长 × 0.5） */
  half: number;
  /** 枯穗卡宽半幅（球果方卡 = half；枯穗窄条另设） */
  halfWidth: number;
  u: number; // 逐果色档 ∈ [0.02, 0.98]（位置散列——材质色档通道）
  az: number; // 弯垂外倾方位（位置散列）
  sag: number; // 弯垂外倾幅度 ∈ [0,1]（位置散列）
}

/**
 * 器官账目主函数（收冠后统一执行——簇位/枝位已定，纯确定性零 rng）：
 * 1. 候选池 = 上半冠（挂点高 ≥ 主干顶 × FRUIT_UPPER_CROWN_FRACTION 的层）L3 层枝的
 *    外段结果带候选位（球果 coneCandidates 位 t = fruitingZone → 1 / 枯穗
 *    strobilusCandidates 位 t = STROBILUS_ZONE_START → 1——叶腋列沿枝内移起步）；
 * 2. posHash 排序 + keep 抽选（保留前 ⌈池 × keep⌉ 位——排序确定性，同 seed 同果集；
 *    跨 seed 因布点差异自然去克隆）；
 * 3. 尺寸 min+span 位置散列抽样（球果 coneSize / 枯穗 strobilusSize 域）。
 * 量级定档：球果 ≈ 上半冠 L3 枝数 × candidates × keep ≈「零星-少量」（Spec §5.3
 *    Observed→Inferred 中——介于雪松正向与 bischofia 无果之间偏轻）；枯穗 ≈ 同域
 *    ×4 候选 × keep（s04 枝上残留读向的量级工程落位，探针复核记档）。
 */
function accountOrgans(ctx: BuildCtx, profile: ConiferShapeProfile): { cones: OrganCard[]; strobili: OrganCard[] } {
  const gate = FRUIT_UPPER_CROWN_FRACTION;
  const sortAndKeep = (
    kind: FruitCandidate['kind'],
    keepRatio: number,
    sizeOf: (roll: number) => { half: number; halfWidth: number },
  ): OrganCard[] => {
    const pool = ctx.fruitCandidates.filter((c) => c.kind === kind && c.heightFrac >= gate);
    const sorted = [...pool].sort(
      (a, b) => posHash(a.x, a.y, a.z, 1.7) - posHash(b.x, b.y, b.z, 1.7) || a.x - b.x || a.y - b.y || a.z - b.z,
    );
    const keepCount = Math.ceil(sorted.length * keepRatio);
    const out: OrganCard[] = [];
    for (let i = 0; i < keepCount; i++) {
      const c = sorted[i]!;
      const sizeRoll = posHash(c.x, c.y, c.z, 5.9);
      const { half, halfWidth } = sizeOf(sizeRoll);
      out.push({
        x: c.x,
        y: c.y,
        z: c.z,
        half,
        halfWidth,
        u: 0.02 + 0.96 * posHash(c.x, c.y, c.z, 7.7),
        az: posHash(c.x, c.y, c.z, 9.1) * Math.PI * 2,
        sag: posHash(c.x, c.y, c.z, 11.3),
      });
    }
    return out;
  };
  const cones = sortAndKeep('cone', profile.coneKeepRatio, (roll) => {
    const size = profile.coneSizeMin + roll * profile.coneSizeSpan; // 近球体果径
    const half = (size * CONE_CARD_SCALE) / 2; // 沿垂轴帧方卡半幅（SDF 留边）
    return { half, halfWidth: half };
  });
  const st = profile.strobili;
  const strobili =
    st !== undefined
      ? sortAndKeep('strobilus', st.strobilusKeepRatio, (roll) => {
          const len = st.strobilusSizeMin + roll * st.strobilusSizeSpan;
          return { half: len / 2, halfWidth: (len * STROBILUS_WIDTH_RATIO) / 2 };
        })
      : [];
  return { cones, strobili };
}

/** 弯垂轴构造（器官共用：竖直向下 + 外倾水平分量——「长柄下垂 + 弯垂」姿态） */
function sagAxis(az: number, sagAmount: number, sagGain: number): THREE.Vector3 {
  const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).multiplyScalar(sagAmount * sagGain);
  return new THREE.Vector3(0, -1, 0).add(out).normalize();
}

/**
 * 单枚球果发射：**长柄下垂交叉方卡**（2 卡 × 2 tri——交叉方位对展）：卡根坐挂点下方
 * CONE_STALK 果柄处（「果柄伸长、成熟时下垂」Verified + s06 柄 2–3cm Observed），
 * 卡体沿弯垂轴（竖直向下 + 外倾）对展。uv：v ∈ [1.0,1.95] 沿垂轴根→尖帧
 * （v ∈ [1.0, 1.95]——**三级帧域冻结接口**，材质判别阈值 1.0 路由球果分支）；
 * u = 逐果色档（果内 12 顶点同值）。法线 = 宽轴 × 弯垂轴（双面读向）；
 * aLeafRand/aBend 随皮组恒 0（器官刚性——摆动语义归材质层/缺口候选）。
 */
function emitConeCard(sink: BarkSink, cone: OrganCard): void {
  const root = new THREE.Vector3(cone.x, cone.y - CONE_STALK, cone.z);
  const axis = sagAxis(cone.az, cone.sag, CONE_SAG);
  for (let k = 0; k < 2; k++) {
    const az = cone.az + (k * Math.PI) / 2; // 交叉方位（第二卡正交）
    let w = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    w = w.clone().sub(axis.clone().multiplyScalar(w.dot(axis))).normalize(); // ⊥ 弯垂轴
    const center = root.clone().addScaledVector(axis, cone.half);
    const r0 = center.clone().addScaledVector(w, -cone.half);
    const r1 = center.clone().addScaledVector(w, cone.half);
    const t0 = r0.clone().addScaledVector(axis, cone.half * 2);
    const t1 = r1.clone().addScaledVector(axis, cone.half * 2);
    const n = w.clone().cross(axis).normalize();
    const verts: [THREE.Vector3, number, number][] = [
      [r0, cone.u, 1.0],
      [r1, cone.u, 1.0],
      [t1, cone.u, 1.95],
      [r0, cone.u, 1.0],
      [t1, cone.u, 1.95],
      [t0, cone.u, 1.95],
    ];
    for (const [v, u, vv] of verts) {
      sink.pos.push(v.x, v.y, v.z);
      sink.nrm.push(n.x, n.y, n.z);
      sink.uv.push(u, vv);
    }
  }
}

/**
 * 单枚雄序枯穗发射：**下垂枯穗交叉窄卡**（2 卡 × 2 tri——沿穗轴帧）：穗根坐挂点
 * （微下沉 0.01 贴枝下侧），穗体沿弯垂轴下垂（s04 实证 3–5cm 下垂枯穗）。uv：
 * v ∈ [2.0, 2.95] 沿穗轴根→尖（**三级帧域冻结接口**，材质判别阈值 2.0 路由枯穗
 * 分支）；u = 逐穗色档。法线 = 宽轴 × 穗轴（双面）；aLeafRand/aBend 随皮组恒 0。
 */
function emitStrobilusCard(sink: BarkSink, st: OrganCard): void {
  const root = new THREE.Vector3(st.x, st.y - 0.01, st.z);
  const axis = sagAxis(st.az, st.sag, STROBILUS_SAG);
  for (let k = 0; k < 2; k++) {
    const az = st.az + (k * Math.PI) / 2;
    let w = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    w = w.clone().sub(axis.clone().multiplyScalar(w.dot(axis))).normalize();
    const r0 = root.clone().addScaledVector(w, -st.halfWidth);
    const r1 = root.clone().addScaledVector(w, st.halfWidth);
    const t0 = r0.clone().addScaledVector(axis, st.half * 2);
    const t1 = r1.clone().addScaledVector(axis, st.half * 2);
    const n = w.clone().cross(axis).normalize();
    const verts: [THREE.Vector3, number, number][] = [
      [r0, st.u, 2.0],
      [r1, st.u, 2.0],
      [t1, st.u, 2.95],
      [r0, st.u, 2.0],
      [t1, st.u, 2.95],
      [t0, st.u, 2.95],
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
 * Low 壳卡发射：簇心切向竖卡——宽轴 = 簇切向水平投影，高轴 UP，半幅 = 簇半径 +
 * LOW_SHELL_MARGIN；六顶点卡 / aLeafRand / aBend 契约与 High 羽卡同构（根边 v 域
 * 基 / 尖边 v 域顶；**aBend 沿用簇位弧长权重**（clusterBends 平行账——沿枝弧长
 * 语义 Low 档不失；尖边 = 根 + 0.28 末级跨度）。**uv v∈[0, 0.99] 羽卡帧**（壳卡 =
 * 整簇抽象 → 材质 Low 档 8 元素羽 SDF 同帧——「Low 单卡」冻结接口）。
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
  bendRoot: number,
): void {
  const bendTip = bendRoot + 0.28; // 末级跨度（lf 1.0——与 High L5 尖边跨度同常数）
  const r0 = center.clone().addScaledVector(w, -half);
  const r1 = center.clone().addScaledVector(w, half);
  const t0 = r0.clone().addScaledVector(UP, half);
  const t1 = r1.clone().addScaledVector(UP, half);
  const n = w.clone().cross(UP).normalize();
  const verts: [THREE.Vector3, number, number, number][] = [
    [r0, 0, 0.0, bendRoot],
    [r1, 1, 0.0, bendRoot],
    [t1, 1, FEATHER_V_TIP, bendTip],
    [r0, 0, 0.0, bendRoot],
    [t1, 1, FEATHER_V_TIP, bendTip],
    [t0, 0, FEATHER_V_TIP, bendTip],
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
 * **羽卡帧 v∈[0, 0.99]**（根 0 → 尖 0.99——1.0 判别阈值安全边距，见 FEATHER_V_TIP；
 * bend 值随候选携带）。
 */
function emitCard(
  pos: number[],
  nrm: number[],
  uv: number[],
  rand: number[],
  bend: number[],
  card: FeatherCard,
): void {
  const half = card.width / 2;
  const r0 = card.center.clone().addScaledVector(card.side, -half);
  const r1 = card.center.clone().addScaledVector(card.side, half);
  const t0 = r0.clone().addScaledVector(card.dir, card.height);
  const t1 = r1.clone().addScaledVector(card.dir, card.height);
  const n = card.side.clone().cross(card.dir).normalize();
  const verts: [THREE.Vector3, number, number, number][] = [
    [r0, 0, 0.0, card.bendRoot],
    [r1, 1, 0.0, card.bendRoot],
    [t1, 1, FEATHER_V_TIP, card.bendTip],
    [r0, 0, 0.0, card.bendRoot],
    [t1, 1, FEATHER_V_TIP, card.bendTip],
    [t0, 0, FEATHER_V_TIP, card.bendTip],
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
 * 拓扑：主干（含根部 flare，顶 = 树高 − 顶梢段）→ tierCount 主层 × tierBranchCount
 * 层枝（对生成对层位挂点 + 层间交错 + 层角梯度 + 层板弱拱/轻下卷）→ L2–L5 递归
 * （droop 轻垂链 + fringe 末级轻加长）→ 顶梢（通直微倾 + leaderDroop 0 短路 + 固定
 * 羽簇防裸梢）；末两级羽簇对生叶序挂点；收冠后：通道过滤（tierGapBand 0 → 密度场
 * 整场短路）→ 双器官账目 → 烘焙（Mid 站点掩码 / Low 壳卡）。profile 缺省 = slot-0
 * 标准组合（锚点回落——单测直调便捷路径）；level 缺省 = 'high'（三档同流派生）。
 */
export function buildMetasequoiaGeometry(
  rng: () => number,
  profile: ConiferShapeProfile = METASEQUOIA_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): MetasequoiaGeometryResult {
  const lod = lodPlanFor(profile, level);
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    clusters: [],
    clustersCulled: 0,
    clusterBends: [],
    featherCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
    tierAngles: [],
    tierAzimuths: [],
    fruitCandidates: [],
    leaderPeakY: 0,
    leaderTipY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（profile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = profile.totalHeight; // 形态参数域树高直读（= 3b 风动树高锚同源——无独立锚）
  const crownRadius = totalHeight * profile.crownWidthRatio * 0.5 * (0.94 + rng() * 0.12); // 冠幅半径（±6% 抖动）
  const trunkBaseR = 0.23 + rng() * 0.05; // 根径 0.23–0.28m（20m 级中龄公园个体——工程设定，DBH 无 Spec 数值）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.04)); // 主干倾轴（干通直如柱 s01/s03 Observed——工程幅度）

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

  // ── 主干：18 环段锥度曲线（trunkFlareRatio 干基膨大 × trunkTaperRatio 干顶锥度）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * profile.trunkTaperRatio;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + (profile.trunkFlareRatio - 1) * Math.exp(-t * 7); // 干基膨大/板根状（1.6 强值——快速衰减）
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < profile.trunk.segs) {
      dir.add(randUnit(rng).multiplyScalar(profile.trunk.wander)).normalize(); // 干通直（wander 0.02）
      p = p.clone().addScaledVector(dir, trunkTopY / profile.trunk.segs);
    }
  }
  emitTube(
    bark,
    thinStations(trunkPts, lod.stationStep[0]!),
    thinStations(trunkRadii, lod.stationStep[0]!),
    lod.radial[0]!,
    TUBE_V_MAX / arcOf(trunkPts), // 逐管归一——v 域上限恒 0.92 < 1.0（三级帧域防线）
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

  // ── L1 层枝 × tierCount 层 × tierBranchCount 枝（对生轮生层状骨架——身份核心）──
  //    方位：phase0 + 层序 × tierPhaseStagger（层间交错 90°）+ rank × 均分步进
  //    （tierBranchCount 2 → ±180° 方位对——对生成对主律）+ crownAsymmetry 抖动
  //    （**rank 跨层同方位**——对内近等 + 跨层相干，破缺即偏冠槽载体 slot-5）；
  //    层角梯度：tierAngleBase → tierAngleTop 沿层位插值（自垂直角——下部近水平、
  //    上部斜展上举）；层半径：mix(1, taper, u^exponent) 近线性锥形收顶。
  const phase0 = rng() * Math.PI * 2;
  const staggerRad =
    profile.tierPhaseStagger !== undefined ? THREE.MathUtils.degToRad(profile.tierPhaseStagger) : 0;
  const tierAngleSum = new Array<number>(tierCount).fill(0);
  for (let ti = 0; ti < tierCount; ti++) {
    const u = tierCount > 1 ? ti / (tierCount - 1) : 0;
    const angleDeg = THREE.MathUtils.lerp(profile.tierAngleBase, profile.tierAngleTop, u);
    const radiusFactor = THREE.MathUtils.lerp(1, profile.tierRadiusTaper, Math.pow(u, profile.tierProfileExponent));
    const tierR = crownRadius * radiusFactor;
    const tierAzRow: number[] = [];
    for (let r = 0; r < profile.tierBranchCount; r++) {
      const rank = Math.min(r, profile.tierRankLength.length - 1);
      const azRaw =
        phase0 + ti * staggerRad + (r / profile.tierBranchCount) * Math.PI * 2 + jitter(rng, profile.crownAsymmetry * 0.88); // 方位抖动 1 次
      const az = ((azRaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      tierAzRow.push(az);
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
      // 枝干通道：层枝基段保护带（密冠露干的通透规则——主干 + 层枝进冠可见）
      ctx.channels.push(
        segOf(attach, attach.clone().addScaledVector(bDir, length * 0.45), Math.max(startR * 2.0, 0.05)),
      );
    }
    ctx.tierAzimuths.push(tierAzRow);
  }

  // ── 顶梢（通直无点头——判定 4：leaderDroop 0 占位短路，顶梢专路不实现）：主干顶
  //    独立枝 + 近直立微倾 + 固定羽簇防裸梢 ──
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

  // ── 通透过滤（密连续锥：tierGapBand 0 → 层带密度场整场短路，仅通道硬抑制 +
  //    canopyDensity roll——roll 每卡无条件 1 次，确定性纪律）──
  const halfSpacing = Math.max(tierSpacing * 0.5, 1e-4);
  const nearestTierDist = (y: number): number => {
    let d = Infinity;
    for (const h of tierHeights) d = Math.min(d, Math.abs(y - h));
    return d;
  };
  const bandKeep = 1 - profile.tierGapBand;
  const featherCards: FeatherCard[] = [];
  let channelRejects = 0;
  let gapRejects = 0;
  const bandCandidates: [number, number] = [0, 0];
  const bandSurvived: [number, number] = [0, 0];
  for (const card of ctx.featherCandidates) {
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
      // 层带密度场：tierGapBand 0 = 零端短路（密度恒 1——连续分布无层间空带）；
      // > 0 时带内满密 → 空带核心衰减至 TIER_GAP_FLOOR（雪松层隙语言——本资产不走）
      let density = 1;
      if (profile.tierGapBand > 0) {
        if (u <= bandKeep) density = 1;
        else if (u >= 1) density = TIER_GAP_FLOOR;
        else density = 1 - ((u - bandKeep) / (1 - bandKeep)) * (1 - TIER_GAP_FLOOR);
      }
      if (roll >= Math.min(1, Math.max(0, profile.canopyDensity * density))) {
        keep = false;
        gapRejects++;
      }
    }
    if (keep) {
      featherCards.push(card);
      if (inBand) bandSurvived[0]++;
      else bandSurvived[1]++;
    }
  }

  // ── 双器官账目（零 rng——收冠后统一；决策表档间同源）──
  const { cones, strobili } = accountOrgans(ctx, profile);
  const bakeOrgans = !lod.shellCards; // Low 省略（远距亚像素——记档同雪松球果）
  if (bakeOrgans) {
    for (const cone of cones) emitConeCard(bark, cone);
    for (const st of strobili) emitStrobilusCard(bark, st);
  }
  const coneTriangles = bakeOrgans ? cones.length * 4 : 0; // 交叉双卡 × 2 tri
  const strobiliTriangles = bakeOrgans ? strobili.length * 4 : 0;

  // ── 烘焙名单：High = 全存活卡；Mid = 簇位级掩码子集（siteOrdinal % every === 0
  //    ——整簇保留交叉双卡；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡
  //    逐位同位）；Low 壳卡模式不烘焙簇内羽卡（候选生成/通透过滤/rng 消费已照常
  //    走完——消费序列档间恒等）──
  const bakedCards: FeatherCard[] = lod.shellCards
    ? []
    : featherCards.filter((c) => c.emitOrdinal % lod.siteEmitEvery === 0);
  /** Low 壳卡数（隔簇抽取——簇位表驱动；每簇 LOW_SHELL_CARDS_PER_CLUSTER 张切向竖卡） */
  const lowShellCount = Math.ceil(ctx.clusters.length / LOW_SHELL_STRIDE) * LOW_SHELL_CARDS_PER_CLUSTER;

  const leafPos: number[] = [];
  const leafNrm: number[] = [];
  const leafUv: number[] = [];
  const leafRand: number[] = [];
  const leafBend: number[] = [];
  if (lod.shellCards) {
    // ── Low 壳卡烘焙：隔簇抽取的切向竖卡（宽轴 = 簇切向水平投影；aBend 沿用簇位
    //    弧长权重——clusterBends 平行账）──
    for (let i = 0; i < ctx.clusters.length; i += LOW_SHELL_STRIDE) {
      const cluster = ctx.clusters[i]!;
      const half = cluster.radius + LOW_SHELL_MARGIN;
      let h = cluster.dir.clone();
      h.y = 0; // 簇切向水平投影
      if (h.lengthSq() < 1e-6) h.set(1, 0, 0); // 近铅垂切向的确定性回退
      h.normalize();
      emitShellCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        cluster.center, h, half,
        shellCardRandOf(cluster.center.x, cluster.center.y, cluster.center.z),
        ctx.clusterBends[i]!,
      );
    }
  } else {
    for (const card of bakedCards) {
      emitCard(leafPos, leafNrm, leafUv, leafRand, leafBend, card);
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

  // ── 层几何组装：树皮（含球果/枯穗卡；aLeafRand/aBend 恒 0——属性集一致）──
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

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 羽卡 1）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_metasequoia 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  return {
    geometry,
    stats: {
      barkTriangles: (groups[0]?.count ?? 0) / 3 - coneTriangles - strobiliTriangles,
      needleTriangles: (groups[1]?.count ?? 0) / 3,
      needleCards: lod.shellCards ? lowShellCount : bakedCards.length,
      needleCandidates: ctx.featherCandidates.length,
      channelRejects,
      gapRejects,
      levelBranches: ctx.levelBranches,
      levelMeanStartRadius: ctx.levelBranches.map((n, i) => (n > 0 ? ctx.levelRadiusSum[i]! / n : 0)),
      tierHeights,
      tierSpacingMean: tierSpacing,
      crownRadius,
      tierAngleMeans,
      tierAzimuths: ctx.tierAzimuths,
      leaderPeakY: ctx.leaderPeakY,
      leaderTipY: ctx.leaderTipY,
      bandCandidates,
      bandSurvived,
      coneCandidatePool: ctx.fruitCandidates.filter((c) => c.kind === 'cone' && c.heightFrac >= FRUIT_UPPER_CROWN_FRACTION).length,
      conesBaked: bakeOrgans ? cones.length : 0,
      coneTriangles,
      strobiliCandidatePool: ctx.fruitCandidates.filter((c) => c.kind === 'strobilus' && c.heightFrac >= FRUIT_UPPER_CROWN_FRACTION).length,
      strobiliBaked: bakeOrgans ? strobili.length : 0,
      strobiliTriangles,
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
 * **层板垂直速度场**（tierPlateArch 弱拱 + tierEdgeDroop 轻下卷——「枝斜展上举 +
 * 末级轻垂」的层板轮廓）；起径 = 主干挂点径 × tierBranchRadiusRatio × rank；
 * 子级递归进 growBranch（L2 起 droop 轻垂链）；站点全分辨率计算（游走 rng 全消费
 * ——档间逐位同源），管发射按 lod 计划抽稀（v 域逐管归一）。
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
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize(); // 层枝刚直（wander 0.05）
      // ── 层板垂直速度场（弱拱 + 轻下卷——层板轮廓身份）──
      const tNext = (i + 1) / spec.segs;
      const arch = profile.tierPlateArch * Math.sin(Math.PI * tNext) * TIER_ARCH_GAIN; // 中部弱拱
      const edge = profile.tierEdgeDroop * THREE.MathUtils.smoothstep(tNext, 0.45, 1) * TIER_EDGE_GAIN; // 外缘轻下卷
      d.add(UP.clone().multiplyScalar(arch - edge)).normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  if (lod.emitTube[0]) {
    emitTube(ctx.bark, thinStations(pts, lod.stationStep[1]!), thinStations(radii, lod.stationStep[1]!), lod.radial[1]!, TUBE_V_MAX / arcOf(pts));
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

  // 子级递归（childPlan[0]：侧枝 + 末位 1.0 延伸枝——密冠体积填充链）
  recurseChildren(ctx, rng, profile, lod, 0, length, phase, radiusAt, pointAt, tierIndex, heightFrac);
}

/**
 * 顶梢（通直无点头——判定 4）：主干顶独立枝——近直立微倾 + leaderDroop 0 占位短路
 * （二次点头项恒零——peak ≈ tip 通直读向，stats.leaderPeakY/TipY 结构证据）+
 * 固定 LEADER_FEATHER_CLUSTERS 簽羽簇（防裸梢——密尖塔收顶被羽叶包裹的真实读向；
 * 对生叶序挂点同管线，簇位入簇账供 canopy proxy）。
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
      d.add(randUnit(rng).multiplyScalar(0.04)).normalize(); // 顶梢通直微游走
      const t = i / spec.segs;
      d.add(UP.clone().multiplyScalar(-profile.leaderDroop * t * t * LEADER_DROOP_GAIN)).normalize(); // 0 占位短路（水杉无点头）
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  if (lod.emitTube[0]) {
    emitTube(ctx.bark, thinStations(pts, lod.stationStep[1]!), thinStations(radii, lod.stationStep[1]!), lod.radial[1]!, TUBE_V_MAX / arcOf(pts));
  }
  ctx.levelBranches[0]!++; // 顶梢计入 L1 管账（皮拓扑 21 管的组成）
  ctx.levelRadiusSum[0]! += startR;
  for (const pt of pts) {
    ctx.leaderPeakY = Math.max(ctx.leaderPeakY, pt.y);
    ctx.maxY = Math.max(ctx.maxY, pt.y);
  }
  ctx.leaderTipY = pts[pts.length - 1]!.y;

  // 顶梢羽簇（固定计数——rng 无条件消费；末级权重 lf 1.0 同 L5）
  const pointAt = (t: number): THREE.Vector3 => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return pts[i]!.clone().lerp(pts[i + 1]!, idx - i);
  };
  emitFeatherClusters(ctx, rng, profile, pointAt, LEADER_FEATHER_CLUSTERS, LEADER_FEATHER_INNER, 4, FEATHER_BEND_LF_L5);
}

/**
 * 分枝递归（L2–L5，level 1–4）：路径 = 起点方向 + 每步游走 + **droop 轻垂链**
 * （方向更新减 UP × droop × t × DROOP_GAIN——L2 近平（0.03）→ L5 轻垂（0.26），
 * « 雪松垂帘——末级轻垂的姿态语言）；起径 = 父径 × CHILD_RADIUS_RATIO、末径 =
 * 起径 × LEVEL_END_RATIO；L4/L5 = 羽簇挂点位（对生叶序 + 交叉双卡）；L3 层枝记
 * 双器官候选位（外段结果带——coneFruitingZone / STROBILUS_ZONE_START 起，上半冠
 * 门控在账目侧）。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划
 * 抽稀（v 域逐管归一）。
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
      d.add(UP.clone().multiplyScalar(-spec.droop * t * DROOP_GAIN)).normalize(); // droop 轻垂链（末级轻垂语言）
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  if (lod.emitTube[level]) {
    emitTube(ctx.bark, thinStations(pts, lod.stationStep[1 + level]!), thinStations(radii, lod.stationStep[1 + level]!), lod.radial[1 + level]!, TUBE_V_MAX / arcOf(pts));
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

  // 双器官候选位（L3 层枝——外段结果带：球果 coneCandidates 位 t = fruitingZone → 1 /
  // 枯穗 strobiliCandidates 位 t = STROBILUS_ZONE_START → 1 均布；零 rng 纯位置
  // ——posHash 排序抽选在收冠后 accountOrgans 统一执行）
  if (level === 2) {
    for (let j = 0; j < profile.coneCandidates; j++) {
      const t =
        profile.coneFruitingZone +
        (1 - profile.coneFruitingZone) * (profile.coneCandidates > 1 ? j / (profile.coneCandidates - 1) : 0.5);
      const pos = pointAt(THREE.MathUtils.clamp(t, 0, 1));
      ctx.fruitCandidates.push({ x: pos.x, y: pos.y, z: pos.z, heightFrac, kind: 'cone' });
    }
    const stCandidates = profile.strobili?.strobilusCandidates ?? 0;
    for (let j = 0; j < stCandidates; j++) {
      const t =
        STROBILUS_ZONE_START +
        (1 - STROBILUS_ZONE_START) * (stCandidates > 1 ? j / (stCandidates - 1) : 0.5);
      const pos = pointAt(THREE.MathUtils.clamp(t, 0, 1));
      ctx.fruitCandidates.push({ x: pos.x, y: pos.y, z: pos.z, heightFrac, kind: 'strobilus' });
    }
  }

  // ── 羽簇挂点（末两级 L4/L5——对生叶序单挂点；散生单针通路不实现：
  //    needleCardLen*/longShootCards* 全槽 0 占位——族内可选·雪松消费位）──
  if (level >= profile.levels.length - 2) {
    const isL5 = level === profile.levels.length - 1;
    const clusterCount = isL5 ? profile.clustersL5 : profile.clustersL4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const lf = isL5 ? FEATHER_BEND_LF_L5 : FEATHER_BEND_LF_L4;
    emitFeatherClusters(ctx, rng, profile, pointAt, clusterCount, inner, level, lf);
  }

  // 子级递归（L5 末级无子）
  if (level < profile.levels.length - 1) {
    recurseChildren(ctx, rng, profile, lod, level, length, phase, radiusAt, pointAt, tierIndex, heightFrac);
  }
}

/**
 * 羽簇发射（L4/L5 逐枝 + 顶梢共用——簇位 + 交叉双卡，rng 每簇位 7 次无条件消费：
 * t/尺寸/方位抖/下垂倾侧/滚转/rand/轮廓比）。**对生交错叶序**（判定 2 + clusterAzimuthStep
 * 契约）：簇位 i 的方位 = ⌊i/2⌋ × step + (i mod 2) × π——逐对步进 π/2 + 偶奇 ±π
 * 配对（「叶对生基部扭转成二列」的挂点语言实现 + 小抖动保留自然不齐）。簇 = 1 位
 * 双卡：卡姿 = 方位外伸 + 下垂倾侧（末级轻垂的卡级表达）+ 沿枝前向 + 滚转打散；
 * **交叉双卡**（第二卡绕卡轴转 90°——side→法线；零 rng 派生，aLeafRand sin 散列
 * 错相）；emitOrdinal = 枝端优先簇序（Mid 站点掩码整簇保对卡）；aBend = 沿枝弧长
 * 0→1（根 (0.10+0.42t)×lf / 尖根+0.28lf——末级最大权重 lf）。
 */
function emitFeatherClusters(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  pointAt: (t: number) => THREE.Vector3,
  clusterCount: number,
  inner: number,
  level: number,
  lf: number,
): void {
  const step = profile.clusterAzimuthStep ?? Math.PI / 2; // 契约缺省 = π/2（对生交错）；省略语义归雪松 rng 散布——本资产恒给定
  for (let i = clusterCount - 1; i >= 0; i--) {
    // 簇沿枝 t：枝端簇（t=1）优先生成序；emitOrdinal = 枝端优先序（Mid 掩码保枝端簇）
    const spread = clusterCount === 1 ? 0.6 : i / (clusterCount - 1);
    const t = THREE.MathUtils.clamp(inner + spread * (1 - inner) + jitter(rng, 0.05), 0, 1); // 1 次
    const attach = pointAt(t);
    const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
    const size = profile.rosetteCardMin + rng() * profile.rosetteCardSpan; // 1 次（羽卡长）
    const radius = size * 0.5; // 簇半径 = 卡半长（壳卡吞并域 + 簇级抑制口径）
    const center = attach.clone().addScaledVector(tangent, radius * 0.4); // 簇坐枝梢稍前方（挂点前移）
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
    const bendRoot = (0.1 + 0.42 * t) * lf; // aBend 沿枝弧长（根）
    const bendTip = bendRoot + 0.28 * lf; // 尖（末级最大）
    if (kept) {
      ctx.clusters.push({ level, attach: attach.clone(), center: center.clone(), radius, dir: tangent.clone() });
      ctx.clusterBends.push(bendRoot);
    } else {
      ctx.clustersCulled++;
    }
    // 羽卡参数（无条件消费——含被剔除簇位）：对生交错方位 + 下垂倾侧 + 前向 + 滚转；
    // 卡根坐簇心、卡体沿 dir 外伸下垂（根锚卡——aBend 根端 = 簇位弧长权重）
    const azStepBase = Math.floor(i / 2) * step + (i % 2) * Math.PI; // 逐对步进 + 偶奇 ±π 配对
    const az = azStepBase + jitter(rng, 0.16); // 1 次（对生律的自然不齐）
    let u1 = tangent.clone().cross(UP);
    if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0);
    u1.normalize();
    const u2 = tangent.clone().cross(u1).normalize();
    const radial = u1.clone().multiplyScalar(Math.cos(az)).add(u2.clone().multiplyScalar(Math.sin(az)));
    const droopTilt = FEATHER_DROOP_BIAS + (rng() - 0.5) * FEATHER_DROOP_SPAN; // 1 次（下垂倾侧——羽列自然不齐）
    const cardDir = radial
      .clone()
      .multiplyScalar(0.92)
      .add(UP.clone().multiplyScalar(-droopTilt))
      .add(tangent.clone().multiplyScalar(FEATHER_FORWARD))
      .normalize();
    let side = cardDir.clone().cross(tangent);
    if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
    side.normalize();
    const roll = rng() * Math.PI; // 1 次（卡面滚转——打散规则感）
    side.applyAxisAngle(cardDir, roll).normalize();
    const rand = rng(); // 1 次
    const aspect = profile.needleCardAspectMin + rng() * profile.needleCardAspectSpan; // 1 次（卵状椭圆轮廓比）
    const width = size / aspect;
    if (kept) {
      const normal = side.clone().cross(cardDir).normalize();
      ctx.featherCandidates.push({
        center: center.clone(),
        dir: cardDir.clone(),
        side: side.clone(),
        width,
        height: size, // 羽卡长 = 沿羽轴（根→尖）
        rand,
        clusterIndex,
        kind: 'feather',
        emitOrdinal: clusterCount - 1 - i, // 枝端优先序（Mid 站点掩码整簇保对卡）
        bendRoot,
        bendTip,
      });
      // 第二卡：dir 同轴、side = 首卡法线（正交平面交叉）；rand sin 散列错相（零 rng）
      ctx.featherCandidates.push({
        center: center.clone(),
        dir: cardDir.clone(),
        side: normal.clone(),
        width,
        height: size,
        rand: fract01(rand * 7.31 + 0.37),
        clusterIndex,
        kind: 'feather',
        emitOrdinal: clusterCount - 1 - i, // 同簇同序（Mid 掩码整簇保对卡——「交叉双卡 High/Mid 保留」）
        bendRoot,
        bendTip,
      });
    }
  }
}

/**
 * 子级递归公共段（growTierBranch / growBranch 共用）：childPlan[level] 挂点序列——
 * 侧枝（**方位 = 父相位 + phaseStep 级内步进**——π/2 四列交错的体积填充 + 抖动 +
 * 上举混合）与末位 1.0 延伸枝（延续父向 + 轻微上扬与游走）；子枝长 = 父长 ×
 * CHILD_LENGTH_RATIO[level]（±CHILD_LENGTH_JITTER）——末级（L4→L5）再乘
 * fringeLengthRatio（末级轻加长）；每子恰 4 次 rng（t 抖动 + 方位组 2 / 延伸
 * randUnit 2 + 长 1——延伸/侧枝两形态消费数恒等）。
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
      // 延伸枝：延续父向 + 轻微上扬与游走（密冠外缘延伸/轻垂延续）
      childDir = tTan.clone().add(UP.clone().multiplyScalar(0.15)).add(randUnit(rng).multiplyScalar(0.22)).normalize(); // 2 次
    } else {
      // 侧枝：方位 = 父相位 + phaseStep 级内步进（对生交错同律的级内表达——逐级
      // 递进 90° 四列填充）+ 抖动；上举混合比层级分档
      childPhase = phase + plan.phaseStep + jitter(rng, 0.35); // 1 次
      const h = new THREE.Vector3(Math.cos(childPhase), 0, Math.sin(childPhase));
      childDir = h
        .multiplyScalar(0.8)
        .add(UP.clone().multiplyScalar(0.1 + rng() * 0.2)) // 1 次（填充枝近平）
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
