/**
 * runtime/procedural/tree/platanus/platanusGeometry —— 悬铃木（Platanus ×
 * acerifolia (Ait.) Willd. 二球悬铃木，悬铃木科悬铃木属落叶大乔木——公园自然冠单干
 * 中龄个体）CPU 几何生成器（T011.5，阔叶家族第六实例——方法复制自夏栎第一实例经朴树
 * （T011.1）/香樟（T011.2）/榉树（T011.3）/银杏（T011.4）五次验证的通路
 * ../ginkgo/ginkgoGeometry，契约字段语义不变：五级递归分枝拓扑 / 锥度管状枝干 /
 * 枝梢驱动叶簇 / 冠内通透三规则 / 树皮近景微起伏 / LOD 三档同流派生全部沿用；
 * 悬铃木数值与算法细节差异点见下）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级递归
 *      分枝拓扑 → 锥度管状枝干（平行传输标架）→ 枝梢驱动叶簇烘焙 + 宿存球状果序，
 *      产出树皮/叶两层非索引几何；层间 mergeGeometries(useGroups=true) 恰 2 组
 *      （D15 免组膨胀：树皮 0 / 叶 1——**果序入皮组（组 0）**，材质接口约定见下）。形态参数类型 =
 *      阔叶家族契约 ../broadleaf/broadleafShapeProfile（悬铃木为第六实例），数值与
 *      槽组合见 ./platanusShapeProfile（全部数值依据 docs/research/platanus-
 *      reference.md Spec 1.0——含终审记档：form-a/b 照片作废、树高 ≈12m 主代理裁定
 *      保守低端、干高 0.25–0.35 Inferred 维持、容许低位双主枝记档不建模）；
 *      build 只做 slot → profile 路由，不进 ProceduralBuild 公共签名。
 * 悬铃木算法细节差异点（vs 银杏模板，逐条 Spec 引用见 platanusShapeProfile 内联注释）：
 *   - 尺度锚：中龄公园单干个体 ≈12m 量级（主代理裁定保守低端——12–14m 弱 Inferred
 *     per 终审记档；悬铃木速生大乔木「中龄个体显著大于先例锚」Spec §2 原文）——形态
 *     参数域树高 11.7–12.7m（≈1.5× 五先例——同语境混植的上层大乔突出量级）；**干高
 *     参数域 0.29–0.35**（Spec 域扩展节 A trunk_height_ratio 0.25–0.35 Inferred [9]
 *     ——六实例首个 Inferred 支撑干高域）；根径 0.30–0.36m（DBH Unknown——工程设定，
 *     速生比例瘦干读向）。
 *   - 干形：近直立通直（单干主导 + 容许低位双主枝记档不建模 per 终审 C-5）→ 主干倾轴
 *     幅度 ≤2.9°（jitter 0.05）；根部 flare 轻度 1.18×（basal_flare Unknown——家族常量）。
 *   - 树形：**阔卵-圆头冠**（中龄锚定相 broadly ovoid to rounded、顶部略平、轮廓不规则
 *     Inferred [9]；幼金字塔→老开张序列 Verified [7][8]）——几何侧驱动链（T009.3
 *     消费语义）：**干向挂点高度分级**（SCAFFOLD_LENGTH_TAPER ×1.18→×0.72 低枝长高枝短
 *     + SCAFFOLD_ANGLE_TAPER 低枝 +14…16° 平展（「lower limbs spread widely」[9]）/
 *     高枝 −6…−8° 圆头闭合（弱于银杏锥顶 −8…−10°）——确定性零 rng）+ **斜上-平展
 *     广角骨架**（35–60° 主流 40–55° Inferred+Verified 双源 [7][8][9]——横展角域
 *     36–54°）+ **散布方位**（螺旋互生散布 [4][9]——无轮生口径，asymmetry 0.48 散布端）+
 *     **领导中庸**（0.50——幼强老失轴过渡位 Verified [4][7][8]；圆头顶由骨架链共构、
 *     领导不翻转树顶）+ upturn 链低于银杏（[0.28,…,0.10] 开展平摊）+ 冠幅比工程域
 *     0.6–0.75（crownWidthRatio 0.46 探针定档涌现 0.683——外泄 ×1.48：低枝平展基扇）。
 *   - **大叶疏簇挂点语言（悬铃木独有身份，Spec §4/域扩展节 B leaf_attachment_rule：
 *     互生一节一叶、节间 3–5cm、疏朗通透 [3][4][9]）**：家族「叶簇」槽位 = **末级枝
 *     疏簇**——簇内叶方位 **黄金角互生螺旋**（φ_j = j×137.5° + 抖动——互生叶序方位
 *     语言，vs 银杏莲座均分 2π/n）+ **卡面平展摊开**（PLANE_LIFT 0.12 低于银杏莲座
 *     上举 0.32——「叶对枝轴近垂直、略前倾、平展摊开」[9]）+ 略前倾（FORWARD_TILT
 *     0.28）+ 弱抖动（WOBBLE 0.15）；每簇 5 候选（真节间 3–5cm × 卡直径 ≈0.36m ⇒
 *     ≈5–9 节/卡径的连续节位合并抽象——逐叶建模面数不可行，银杏散生节距同款先例口径
 *     记档），通透过滤后逐簇存活典型 2–4 片；**无长短枝二型**（全为长枝延伸、无短枝
 *     距状钉突——vs 银杏双挂点语言）；大簇半径 0.20–0.30（cap 0.6×枝长主导）+
 *     大间距抑制（minSeparation 0.55×径和——疏簇大间隙读向）。
 *   - **宿存球状果序（Spec 判定做，§2/域扩展节 B 宿存果序组 Verified [1][3][7][8][9]）**：
 *     夏季满冠宿存成对果球 = 悬铃木最强身份信号之一（07 月照片直接证据 + FOC fr.
 *     Jun–Oct + NC/OSU persist——终审处置 1 明示判定维持）——径 ≈2.5cm（标尺实测
 *     2.5–2.8 [9]）×2 工程映射（叶卡同源口径）→ 球半径 0.024–0.032（径 ≈4.8–6.4cm）；
 *     **每果枝典型 2 个**（「二球」名源 [1][3][5]——85% 成对 / 15% 单球 roll）；
 *     **长梗下垂叶幕下方**（FOC "pendulous at least in fruit" [4]）——挂点 = 保留 L5
 *     簇位低频抽样（bear rate 0.22，roll 与簇位消费同流无条件）+ 球心垂挂簇心下方
 *     0.10–0.18m（簇半径外 + 长梗）+ 成对水平错位 3×球径；表达 = **正二十面体球 +
 *     细梗**（20 面/球 flat 法线——球形剪影中距 15–30m 可读、近景无八面体菱形/尖角
 *     读向；球心 sin 散列确定性姿态（零 rng）逐球剪影错位去克隆；每球一根 3 面
 *     ≈3mm 细梗——首球梗自簇心回连、成对第二球梗自首球球心侧向连出，端点内埋
 *     簇心/球心（无盖无接缝）破「无梗悬浮」读向；26 三角/球含梗）；
 *     **账目入皮组（组 0）**——platanusMaterials（park-shader-
 *     agent 并行交付、签名冻结）模块头记档的冻结接口：皮材质圆上部红褐偏色近似绿褐
 *     果球（褐系近似、可接受记档）+ 拼贴场按 uv 采样 + **深度材质 aLeafRand=0 皮组
 *     实心守卫天然覆盖果序（果影实心）**；果序顶点（球 + 梗）**uv v ∈ [4,5] 果序域**
 *     （与叶卡
 *     0–1 四边形域及皮管弧长域（v ≤ ≈3.1）双重隔离的几何身份标记——皮材质拼贴场在
 *     v≥4 域 = 移位拼贴微变奏，无害）
 *     + aLeafRand/aBend 随皮组恒 0（aBend 0 = 刚性悬垂——风动语义归材质层）；rng
 *     消费口径：每 L5 簇位固定 3 次（bear/pair/az——无条件，结构计数类槽间恒等）；
 *     Mid 保留全量（身份信号）/ **Low 省略**（远距亚像素——档间连续性记档：果序为
 *     冠底点缀，Low 壳卡吞并冠形轮廓，档间 bbox 一致性不受扰动）。
 *   - 骨架：**6 骨架枝 + 1 领导枝**（Spec 4–7 典型 5–6 上端 [9]——「下部大枝平展 +
 *     广角开展」多枝读向）；拓扑 L1=7 → 枝数 [7,21,63,189,378]、簇位 945（L4 189×1 +
 *     L5 378×2）、皮面 24178——为 12m 大冠的大卡低数量预算留带内余量。
 *   - 密度语言：中-疏（逆光空隙 20–30% Inferred [9]）：壳带 0.48（薄）+ 芯层地板
 *     0.08（内膛细枝开网「inner branchlets visible」[9]）+ 大空腔 0.50–0.85 +
 *     疏簇浅壳（clusterShellBias 0.42——互生散布平摊）。
 *   - 树皮近景微起伏：**光滑斑块剥落浅浮雕**（「树皮光滑，大片块状脱落」FRPS Verified
 *     [1]；FOC "smooth, exfoliating in plates" [4]）——amplitudeRatio 0.014（贴榉树
 *     0.015 光滑端——六分化与榉同量级，**斑驳主体（三色带奶油白/浅黄绿-橄榄/灰褐 +
 *     斑块 1/8–1/12 干径细端 1/20）在 platanusMaterials 材质层**，geometry 只管浅
 *     起伏）+ 谐波 {3,5,6}（k3 主导低频大斑）+ drift 11 rad/m（轴向去相关 ≈0.57m——
 *     大片剥落断裂拼贴读向，贴榉树断裂端）。机制不变：纯确定性函数零 rng；幅度 ∝
 *     局部半径（0.014 下起径 <0.11m 的管（L2 以下细枝典型域）平滑发射——主干 + L1
 *     粗枝端有效起伏、细枝光滑）；主干 radial 14（奈奎斯特域 7 容纳 k=6 留 1 档边际）。
 *   - 叶卡：卡宽 0.30–0.44m（真叶宽 15–22cm Verified [1][3][8][9] ×≈2 工程映射——
 *     **六资产最大叶**）+ 长宽比 0.70–0.90（宽>长 0.7–0.9 反向口径——阔卵形掌状裂
 *     [1][3][9]，家族 leafAspect 语义 = 长/宽 <1 契约内表达）+ 大簇（0.20–0.30）=
 *     大卡疏簇的粗质冠面团块（「大叶疏簇粗质 coarse」六资产最粗质冠面 [9]）。
 * 不建模（Spec 有事实、几何不表达——记档见 platanusShapeProfile 模块头）：掌状 5 裂
 *   轮廓/裂深/裂片齿/离基三脉/截形基（归 platanusMaterials SDF）/ 叶柄与叶柄下芽 /
 *   托叶 / 小枝二色（归材质）/ 秋色黄褐 / pollard 相 / 低位双主枝（终审 C-5 记档不
 *   建模）/ 花 / 品种窄化 / 果序宿存花柱刺状（归材质）。
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等（High 24178：主干 406 +
 *      L1 1008（7 枝 ×9 段 ×8）+ L2 2352（21 ×8 段 ×7）+ L3 3780（63 ×5 段 ×6）+
 *      L4 7560（189 ×4 段 ×5）+ L5 9072（378 ×3 段 ×4）；枝数 [7,21,63,189,378]——
 *      6 骨架 + 1 领导）；簇位数 945（L4 189×1 + L5 378×2）/ 每簇 5 卡 / 果序挂点
 *      rng 3 次/L5 簇位为计数类（rng 消费次数恒定），保留簇数与实际叶卡数随 seed 由
 *      簇级距离抑制 + 通透规则确定（同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律原样沿用）：簇生成与叶片候选的 rng 消费均为无条件固定次数（每簇
 *      2 次 + 每疏簇叶 8 次 + 每 L5 簇位果序 3 次），被簇级距离抑制丢弃的簇位足额消费后
 *      丢弃；通透 roll 每卡无条件 1 次——任何条件跳过都禁止（档间同理：Mid/Low 的发射
 *      省略不省略消费）。**探针闭包教训（011.3 ③）**：rng 消费计数必须用包裹 rng 闭包实测
 *      （每次调用即计数），不得事后重建流复算——消费次数以测试锁定快照为准。结构消费
 *      （主干/骨架/递归/簇位/叶候选/果序挂点）全部固定次数；总消费数随保留簇数变化
 *      （通透 roll 计数 = 存活候选数——簇级剔除的簇位不产候选，五先例同机制记档）——
 *      槽内三档恒等（同 seed 同保留簇集）、跨槽/跨 seed 随保留簇数浮动（实测 8 槽
 *      51403–51928 带内 ±0.5%）。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值；皮组
 *        （含果序）与叶组顶点树皮语义位恒 0（皮组全 0——果序随组恒 0）；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，卡内根→尖非降（根 0.12·hw / 尖 0.52+0.44·hw，
 *        hw = 冠内高度权重）；树皮层同名属性写恒等值 0；**果序恒 0**（随皮组——刚性
 *        悬垂，长梗下垂果球的摆动语义归 platanusMaterials 风动层，几何侧不预置摆幅）。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0）；叶卡 UV 标准 0–1 四边形
 *      域（SDF 掌状裂叶 alpha 消费归 platanusMaterials——并行交付，签名冻结）；**果序
 *      UV v∈[4,5] 果序域**（几何身份标记——果序入皮组接口记档，见上）；叶法线取卡面
 *      单侧（cross(side, dir)）。
 * LOD 三档（T011.5，家族方法逐位复制：level 为 Runtime 可选参数——不参与
 *      shapeSlot/morphSeed/sourceKey 形态身份计算；档位缓存维度 = sourceKey + level 归
 *      ProceduralSourceCache）：三档共用**同一条 rng 消费流**与同一套骨架/簇位/果序
 *      决策路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/叶候选/果球
 *      照常足额消费 rng（三档 rng 消费总数恒等，快照数见 platanusLod 测试），枝路径/
 *      簇位/果序挂点/冠形包络/通透过滤决策逐位同源：
 *      - High：全发射（缺省档；皮面数 24178）；树皮微起伏保留；果序全量烘焙；
 *      - Mid：径向段数降（主干/五级 14/8/7/6/5/4 → 6/5/4/3/3/3——粗枝保圆度、细枝
 *        三边管）+ 轴向站点隔 1 抽 1 发射（站点全算·游走 rng 全消费）+ L5 末梢管不
 *        发射（末梢径亚厘米，Mid 观距亚像素；簇位/果序挂点照常派生）+ 簇内叶卡掩码
 *        j % 3 === 1（疏簇 5 候选中 2 张（40%）——被弃候选足额消费 rng 后不进烘焙；
 *        通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位同位）+ 树皮微起伏
 *        保留 + **果序全量保留**（身份信号——成对果球中距可读 [9]，26 三角/球预算轻）；
 *        皮 4514；
 *      - Low：主干 + L1 骨架极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（每保留簇 2 张交叉竖卡，半幅 = 簇半径 + 0.16m
 *        余量——悬铃木大卡尺度：典型卡长 ≈0.21–0.40m，margin 取银杏 0.12 的大卡放
 *        大档覆盖疏簇大卡常态伸出，极值叶尖仍由 High 决定冠包络）+ **果序不发射**
 *        （Low 观距果球 ≈5cm 亚像素——省略记档，rng 照常消费）；皮 370。
 *      预算锁定账目（8 槽 × 3 档实测带 + 锁定依据）见
 *      ../assets/asset_tree_platanus.asset 模块头（预算制 D19.8，家族行沿用）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PLATANUS_SLOT0_PROFILE } from './platanusShapeProfile';
import type { BroadleafBarkRelief, BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface LeafCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖；疏簇叶恒指簇外平展——卡根朝簇心）
  side: THREE.Vector3; // 卡宽方向（水平随机滚转）
  width: number;
  height: number;
  rand: number; // aLeafRand
  rhat: number; // 簇内归一化半径（互生疏簇 shellBias 归一——结构证据账目）
  clusterIndex: number; // 所属簇（存活后归账 clusterLeaves）
  /** 簇内候选序：Mid 发射掩码 j % 3 === 1 的选择位——候选生成/通透过滤/rng 消费对全
   *  候选照常，掩码只在烘焙阶段生效（Mid 存活卡 ⊂ High 存活卡逐位同位） */
  emitOrdinal: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径（枝梢驱动叶簇——家族方法沿用；
 *  悬铃木语义 = 末级枝疏簇的簇空间） */
// ——T021.6 收编家族共享契约：类型真相源 = ../broadleaf/broadleafClusterField（本地名零 churn）
type ClusterRecord = BroadleafClusterRecord;

/** 单个果球记录（发射原料：球心 + 半径 + 梗起点——首球梗回簇心、成对第二球梗自首球
 *  球心侧向连出（不必各自回簇心）；球/梗发射为记录的确定性纯函数，零 rng） */
interface FruitBall {
  center: THREE.Vector3;
  radius: number;
  /** 细梗起点（首球 = 簇心；成对第二球 = 首球球心——端点内埋，无盖无接缝） */
  stemFrom: THREE.Vector3;
}

/** 果序挂点记录：1–2 球（「果枝有头状果序 1-2 个，典型 2」FRPS Verified [1]） */
interface FruitSite {
  balls: FruitBall[];
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

/** 构建上下文：发射槽 + 簇表 + 果序表 + 候选叶卡 + 通道表 + 逐级统计（全树共享，逐枝累加） */
interface BuildCtx {
  bark: BarkSink;
  clusters: ClusterRecord[];
  clustersCulled: number; // 簇级距离抑制丢弃的簇位数（工程账目）
  fruit: FruitSite[]; // 果序挂点表（保留 L5 簇位 bear roll 命中——档间同源）
  leafCandidates: LeafCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含领导枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点（冠参考系上界）
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface PlatanusGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 叶卡三角（仅卡——leafCards × 2；果序三角单列 fruitTriangles） */
    leafTriangles: number;
    leafCards: number;
    /** 宿存果序账目：挂点数（1–2 球/点）/ 烘焙球数 / 果序三角（球 × 26 = 二十面体球
     *  20 + 细梗 6——每球恰一梗；Low = 0 省略）。守恒：组 0 三角 = 皮拓扑
     *  （barkTriangles）+ fruitTriangles（果序入皮组记档——材质接口约定）、组 1 三角
     *  = leafTriangles（纯叶卡） */
    fruitSites: number;
    fruitBalls: number;
    fruitTriangles: number;
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
    /** 逐簇存活疏簇卡数（索引对齐 clusters）与 min/mean/max */
    clusterLeaves: number[];
    clusterLeafMin: number;
    clusterLeafMean: number;
    clusterLeafMax: number;
    /** 逐存活卡簇内归一化半径（对齐存活卡烘焙序——互生疏簇 shellBias 平摊的结构证据） */
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

// ── 悬铃木大叶疏簇挂点语言常量（结构常数：槽间恒等——改值即改面数与 rng 消费）──

/** 黄金角（互生叶序螺旋步进——悬铃木互生一节一叶 [3][4][9] 的簇内方位语言：φ_j =
 *  j×137.5° + 抖动，vs 银杏莲座均分 2π/n——互生 vs 轮生/均分的方位分化） */
const GOLDEN_ANGLE = 2.39996;
/** 疏簇叶取向常量（互生平展语言——连续形态方法常量，非槽差异维度）：
 *  叶对枝轴近垂直、略前倾、平展摊开（shoot-a 判读 Inferred [9]）+ 大叶平展 */
const ALT_FORWARD_TILT = 0.28; // 沿枝向前倾分量（× 簇方向 T）
const ALT_WOBBLE = 0.15; // 弱球面抖动（互生自然不齐）
const PLANE_LIFT = 0.12; // 叶尖上举分量（平展摊开——低于银杏莲座 0.32 [9]）

/** 干向挂点高度分级锥度（阔卵-圆头剪影驱动：挂点低枝 ×1.10 → 高枝 ×0.72 的确定性线性
 *  分级，零 rng——低枝略长（冠基放张）/ 高枝短（圆头收拢）；与 rank 环内势差正交；散布
 *  互生骨架 + 广角 + 本分级 = 阔卵-圆头冠的骨架侧驱动链，Spec §3 阔卵-圆头 Inferred
 *  [9] + 下部平展/开张序列 Verified [7][8]。**探针记档（2026-09-20）**：初值 [1.18,
 *  0.72] + 角度梯度 +14/+16° 叠加使冠幅外泄 ×1.67（低枝平展 + 长枝双放大——扁平枝向
 *  的延伸链水平展宽），回调 [1.10, 0.72] + 角度 +10/+12° 后外泄 ≈×1.35 落阔卵域。
 *  幅度工程设定 */
const SCAFFOLD_LENGTH_TAPER = [1.1, 0.72] as const;
/** 干向挂点高度角度梯度（阔卵-圆头第二驱动——低枝 +10…+12° 平展（「lower limbs
 *  spread widely」[9]——冠基放张）× 高枝 −6…−8° 收角（圆头闭合——弱于银杏锥顶
 *  −8…−10°：圆头 vs 锥顶的分化）。确定性零 rng（作用于 profile 角域两端，槽间角域
 *  差异保持）。幅度工程设定（探针回调 +14/+16° → +10/+12°，见上） */
const SCAFFOLD_ANGLE_TAPER = { minLow: 10, minHigh: -6, maxLow: 12, maxHigh: -8 } as const;

// ── 宿存球状果序常量（Spec 判定做——§2/域扩展节 B 宿存果序组 Verified [1][3][7][8][9]；
//    结构常数：挂点口径槽间恒等——rng 3 次/L5 簇位无条件消费）──

/** 果序承载率（L5 保留簇位 bear roll 阈值——每果枝典型 2 球身份信号的满冠密度工程
 *  定档：实测 ≈保留簇 × 0.22 挂点 × ≈1.85 球/点 ≈ 190–240 球/树（「满冠悬垂」[9]
 *  中距可读、远距省略——Low 档）；数字 rng roll 与簇位消费同流，无条件） */
const FRUIT_BEAR_RATE = 0.22;
/** 成对率（「二球」名源：每果枝 1–2 个典型 2 Verified [1][3][5]——85% 成对 / 15% 单球
 *  （Wikipedia 收录单球克隆 [5] 的变体带内表达）） */
const FRUIT_PAIR_RATE = 0.85;
/** 果球半径域（米）：真径 ≈2.5cm（FRPS/FOC Verified [1][3] + 标尺实测 2.5–2.8 [9]）
 *  ×2 工程映射（叶卡同源口径）→ 径 ≈4.8–6.4cm——中距 15–30m 球形剪影可读、近景成对
 *  可辨；半径 = 0.024 + 0.008×fract(singleRoll×7.31)（roll 派生，零额外消费） */
const FRUIT_BALL_R_MIN = 0.024;
const FRUIT_BALL_R_SPAN = 0.008;
/** 垂挂深度域（米）：0.10–0.18——长梗下垂叶幕下方（FOC "pendulous at least in fruit"
 *  [4]——梗长 + 簇半径外的冠底垂挂；hang = 0.10 + 0.08×fract(bearRoll×13.7) 派生） */
const FRUIT_HANG_MIN = 0.1;
const FRUIT_HANG_SPAN = 0.08;
/** 成对水平错位（× 球径）：3×球径 ≈ 0.14–0.19m——「成对」中距可辨（pairAz = azRoll
 *  派生方位，双球同深错位） */
const FRUIT_PAIR_OFFSET = 3;
/** 果梗半径（米）：≈3mm 直径的果梗量级（视觉存在即可——细线读向）；单段 3 面细管、
 *  两端内埋（from = 簇心/首球球心、to = 球心——被叶幕/球体遮挡，无盖无接缝） */
const FRUIT_STEM_R = 0.0015;
/** 每球三角账（结构常数）：正二十面体球 20 + 细梗 6（3 面 × 单段）= 26——
 *  stats.fruitTriangles = 烘焙球数 × 26（组 0 守恒口径，见 stats.fruitTriangles） */
const FRUIT_TRIS_PER_BALL = 26;

// ── LOD 三档发射计划（家族方法复制——档位只改「发射」，不改骨架决策/rng 消费序）──

/** LOD 发射档：三档共用同一条 rng 流与同一套骨架/簇位/果序决策，差异全在发射密度 */
interface LodEmissionPlan {
  /** 逐管径向段 [主干, L1..L5]（High = profile 原值；Mid/Low 为降段阶梯——粗枝保圆度、
   *  细枝三边管：中景圆度可辨层级以下径向 3 已足，再降破管面下限 3） */
  radial: number[];
  /** 逐管轴向发射站点抽取步长（1 = 全发射；>1 = 每隔 step 站发射一站 + 恒保末站——
   *  站点全算·游走 rng 全消费，路径逐位同 High，发射管为同一曲线的弦近似） */
  stationStep: number[];
  /** L1..L5 逐级是否发射管（false = 只递归不发射——子枝/簇位/果序/rng 照常派生；主干恒发射） */
  emitTube: boolean[];
  /** 簇内叶卡发射掩码（每簇 leavesPerCluster 候选中，仅 j % leafEmitEvery === leafEmitPhase
   *  者进烘焙；候选生成/通透过滤/rng 消费对全候选照常——Mid 存活卡 ⊂ High 存活卡；
   *  疏簇 5 候选 → j∈{1,4} 2 张（40%）） */
  leafEmitEvery: number;
  leafEmitPhase: number;
  /** Low 壳卡模式：不烘焙簇内叶卡与果序（候选/过滤/果序 rng 照常），逐保留簇发射交叉壳卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（结构依据见模块头 LOD 段；预算记账 = 8 槽实测口径，正式预算带
 * 锁定见 ../assets/asset_tree_platanus.asset 模块头）：
 * - High 皮 24178（拓扑恒等不动：主干 406（14 段 ×14 + 底盖 14）+ L1 1008（7 枝 ×9 段
 *   ×8）+ L2 2352（21 ×8 段 ×7）+ L3 3780（63 ×5 段 ×6）+ L4 7560（189 ×4 段 ×5）+
 *   L5 9072（378 ×3 段 ×4））；Mid 皮 4514 = 主干 90（7 段 ×6 + 底盖 6）+ L1 350
 *   （7 枝 ×5 段 ×5）+ L2 672（21 ×4 段 ×4）+ L3 1134（63 ×3 段 ×3）+ L4 2268
 *   （189 ×2 段 ×3），L5 不发射；Low 皮 370 = 主干 90 + L1 280（7 枝 ×5 段 ×4）。
 * - Mid 叶 ≈ High 存活卡 × 掩码率（疏簇 5 选 2 = 40%）+ 果序全量；8 槽实测落 6–10K 带。
 * - Low 叶 = 保留簇数 × 2 壳卡 × 2 三角（果序省略记档）；8 槽实测落 1.5–3K 带。
 */
function lodPlanFor(profile: BroadleafShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    // 缺省档全发射：profile 原值直读 + 步长 1（thinStations 原数组透传）——皮面数
    // 24178 / rng 消费快照（platanusLod 测试锁）延续
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
    // 不发射（亚厘米径亚像素）+ 叶卡掩码 j%3===1（疏簇 5 选 2——8 槽实测 High 卡 →
    // Mid 总面落 6–10K 预算带的档率）+ 果序全量保留（身份信号 [9]）
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
  // L2–L5 不发射（递归照常走完消费 rng/派生簇位与果序）；冠层转壳卡模式（果序省略）
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

/** Low 壳卡半幅余量（米）：High 疏簇大卡自簇心的最大伸出 ≈ 簇半径 + 卡长（≤0.40m 斜向
 *  ——悬铃木大卡 0.21–0.40 长域），典型伸出（r̂≤1 壳位 + 互生平摊）中位 ≈ 半卡长
 *  0.10–0.20m——取 0.16（银杏 0.12 的大卡放大档）使壳卡吞并簇半径的常态视觉域，
 *  且极值叶尖仍由 High 决定冠包络（Low 不涨出，档间 bbox 一致性测试容差依据：实测
 *  跨档 XZ 跨度/总高差 ≤ 0.5m） */
const LOW_SHELL_MARGIN = 0.16;
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

// ── 宿存果序发射（正二十面体 20 面 flat 球 + 每球一根 3 面细梗 = 26 三角/球；
//    uv v∈[4,5] 果序域约定——球/梗全部顶点落域内，材质侧冻结接口）──

/** 正二十面体单位顶点表（黄金矩形顶点集归一到单位球——12 顶点；flat 面片弦面
 *  微内切于球（面心 ≈0.79R）——20 面剪影已圆，无八面体上下尖角读向） */
const ICO_VERTS: THREE.Vector3[] = (() => {
  const t = (1 + Math.sqrt(5)) / 2;
  return (
    [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ] as const
  ).map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
})();

/** 正二十面体面表：[顶点索引三元组, 面法线]——20 面外向 CCW；绕序自校准（叉积法线
 *  与面心外积 < 0 时翻转顶点序——确定性构造，与手写绕序笔误免疫）；法线 = 面平面
 *  单位法线（flat shading 逐面恒定） */
const ICO_FACES: { v: [number, number, number]; n: THREE.Vector3 }[] = (
  [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ] as const
).map(([a, b, c]) => {
  const centroid = ICO_VERTS[a]!.clone().add(ICO_VERTS[b]!).add(ICO_VERTS[c]!);
  const n = ICO_VERTS[b]!
    .clone()
    .sub(ICO_VERTS[a]!)
    .cross(ICO_VERTS[c]!.clone().sub(ICO_VERTS[a]!))
    .normalize();
  return n.dot(centroid) >= 0 ? { v: [a, b, c], n } : { v: [a, c, b], n: n.negate() };
});

/** 球心 sin 散列派生果球姿态（确定性零 rng——Low 壳卡 shellCardRandOf 同款口径）：
 *  yaw 全周 + tilt ±≈31.5°——逐球 20 面剪影错位，破「整行同向同形」的合并读向；
 *  同球心同姿态（确定性不破）、跨球心自然去克隆 */
function fruitBallOrientation(center: THREE.Vector3): THREE.Quaternion {
  const base = fract01(Math.sin(center.x * 12.9898 + center.y * 78.233 + center.z * 37.719) * 43758.5453);
  const derived = fract01(base * 7.31 + 0.37);
  const yaw = base * Math.PI * 2;
  const tilt = (derived - 0.5) * 1.1;
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, yaw, 0));
}

/**
 * 单果球发射：正二十面体 20 面 × 3 顶点（60 顶点/球）+ 球心散列姿态旋转（顶点/法线
 * 同刚体旋转）；uv 三角 (0,4)(1,4)(0.5,5)——**v∈[4,5] 果序域**（几何身份标记：与叶卡
 * 0–1 四边形域及皮管弧长域（v = 累计弧长 × 0.5，最长枝 ≈6m 弧 → v ≤ ≈3.1）双重隔离
 * ——v≥2 会与长枝皮管碰撞，取 ×2 安全带）。**账目入皮组（组 0）**——材质侧
 * platanusMaterials 冻结接口（其模块头记档）：皮材质按 uv v≥4 门控整域染绿褐色果球 +
 * 深度材质 aLeafRand=0 皮组实心守卫天然覆盖果序（果影实心）；aLeafRand/aBend 随皮组
 * 恒 0（果序刚性悬垂——风动语义归材质层）。
 */
function emitFruitBall(
  sink: BarkSink,
  center: THREE.Vector3,
  radius: number,
): void {
  const q = fruitBallOrientation(center);
  for (const face of ICO_FACES) {
    const [ia, ib, ic] = face.v;
    const uvs: [number, number][] = [[0, 4], [1, 4], [0.5, 5]];
    const idxs = [ia!, ib!, ic!];
    for (let k = 0; k < 3; k++) {
      const v = ICO_VERTS[idxs[k]!]!.clone().applyQuaternion(q);
      sink.pos.push(center.x + v.x * radius, center.y + v.y * radius, center.z + v.z * radius);
      const n = face.n.clone().applyQuaternion(q);
      sink.nrm.push(n.x, n.y, n.z);
      sink.uv.push(uvs[k]![0], uvs[k]![1]);
    }
  }
}

/**
 * 单根细梗发射：from → to 的 3 面细管单段（6 三角/梗）——顶点流与 emitTube 同外向绕制
 * （(n,b,d) 右手系，参考基取与梗向最不共线基投影）；法线 flat 逐面（边中角径向）；
 * 梗径 FRUIT_STEM_R ≈3mm（果梗量级，视觉存在即可）；两端内埋（from = 簇心（叶幕内）/
 * 首球球心、to = 球心（球体内））无盖无接缝；uv：u 沿梗长 0→1、v 恒 4.5——**v∈[4,5]
 * 果序域**（材质接口与球同域，见 emitFruitBall）。零 rng、纯 from/to 确定性函数。
 */
function emitFruitStem(sink: BarkSink, from: THREE.Vector3, to: THREE.Vector3): void {
  const d = to.clone().sub(from).normalize();
  const ref = Math.abs(d.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const n = ref.clone().sub(d.clone().multiplyScalar(d.dot(ref))).normalize();
  const b = d.clone().cross(n); // B = D×N——(n,b,d) 右手系，绕制序外向同 emitTube
  const pushVert = (base: THREE.Vector3, c: number, s: number, u: number): void => {
    sink.pos.push(
      base.x + (n.x * c + b.x * s) * FRUIT_STEM_R,
      base.y + (n.y * c + b.y * s) * FRUIT_STEM_R,
      base.z + (n.z * c + b.z * s) * FRUIT_STEM_R,
    );
    sink.uv.push(u, 4.5);
  };
  for (let j = 0; j < 3; j++) {
    const th0 = (j / 3) * Math.PI * 2;
    const th1 = ((j + 1) / 3) * Math.PI * 2;
    const mid = (th0 + th1) / 2;
    const c0 = Math.cos(th0), s0 = Math.sin(th0), c1 = Math.cos(th1), s1 = Math.sin(th1);
    const nx = n.x * Math.cos(mid) + b.x * Math.sin(mid);
    const ny = n.y * Math.cos(mid) + b.y * Math.sin(mid);
    const nz = n.z * Math.cos(mid) + b.z * Math.sin(mid);
    // 顶点流（emitTube 同序）：a0 a1 b1 | a0 b1 b0（from 环 u=0 / to 环 u=1）
    pushVert(from, c0, s0, 0);
    pushVert(from, c1, s1, 0);
    pushVert(to, c1, s1, 1);
    sink.nrm.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
    pushVert(from, c0, s0, 0);
    pushVert(to, c1, s1, 1);
    pushVert(to, c0, s0, 1);
    sink.nrm.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  }
}

// ── 树皮近景微起伏：固定形态常数（方法层，家族沿用）——非槽差异维度，可调面
//    全在 shapeProfile.barkRelief 三字段（悬铃木幅度/谐波/游走率见 platanusShapeProfile）──
/** 谐波权重基线（低次主导；按 harmonics 序循环取用后归一） */
const BARK_RELIEF_WEIGHT_BASE = [0.42, 0.33, 0.25];
/** 相位游走正弦项频率（rad/m）/幅度（rad）——沿轴缓变游走分量 */
const BARK_RELIEF_WANDER_FREQ = 1.6;
const BARK_RELIEF_WANDER_AMP = 0.5;
/** 脊深呼吸（权重沿轴调制）频率（rad/m）/幅度——起伏深浅沿干交错（悬铃木「光滑斑块
 *  剥落」的斑缘浅浮雕交错 [1][4]——大片剥落的断裂拼贴读向由高 drift 11 承载，呼吸
 *  调制斑缘深浅缓变；幅度工程设定） */
const BARK_RELIEF_BREATHE_FREQ = 2.4;
const BARK_RELIEF_BREATHE_AMP = 0.3;
/** 亚视觉幅度地板（米，峰值）：管起径 × amplitudeRatio < 此值 → 该管整体跳过起伏
 *  （近景不可辨的亚毫米层，兼免低径向段细枝上高次谐波混叠成无意义计算——悬铃木
 *  amplitudeRatio 0.014 下起径 < 0.11m 的管（L2 以下细枝典型域）平滑发射，主干 +
 *  L1 粗枝端有效起伏（大片剥落显于粗干 [1][4]）、细枝光滑的读向自然涌现） */
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
  /** 轴向游走率（±drift 域内确定性取值——悬铃木 drift 11：斑块断裂拼贴（轴向去相关
   *  ≈2π/11 ≈ 0.57m）——大片剥落斑缘断裂读向的工程映射；榉树 11 同族断裂端 / 银杏
   *  2.6 纵脊连续 / 夏栎 0.85 缓游走。速率值 = profile.barkRelief.drift） */
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
 * 半径；d_θ/d_s 为解析导数（法线修正源）。φₘ(s) = ψₘ + driftₘ·s + wander 正弦项（悬铃木
 * driftₘ ±11 rad/m——斑块断裂拼贴：轴向去相关 ≈0.57m 斑缘断裂读向；榉树 ±11 同族、
 * 银杏 ±2.6 纵脊连续、夏栎 ±0.85 缓游走）、wₘ(s) = baseWₘ·(1 + breathe 正弦项)
 * （斑缘深浅呼吸）——均弧长 s 的缓变函数。amplitudeRatio ≤ 0（亚视觉地板跳过路径）时
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
  // 亚视觉地板：起径 × 幅度比 < 1.5mm 的管（悬铃木 0.014 幅度下 L2 以下细枝典型域）
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
 * L5×2 末梢）；枝角/长度/粗度/曲率 rng 驱动（骨架枝横展 36–54° 对铅垂斜上-平展广角 +
 * 干向挂点高度分级（长度 ×1.18→×0.72 / 角度 +14…16°→−6…−8° 低枝平展高枝收角）——
 * 阔卵-圆头冠的结构成因，Spec §3 Inferred [9] + open spreading Verified [7][8]；领导枝
 * 0.50 中庸续顶——圆头顶共构）。大叶疏簇挂点：末两级枝梢疏簇（大簇 + 5 候选大卡黄金角
 * 互生螺旋）+ 保留 L5 簇位果序挂点（成对二十面体球 + 细梗，见模块头）。主次分级与冠内通透规则
 * 见模块头。
 * profile 缺省 = slot-0 标准组合（锚点回落——单测直调便捷路径，资产路径显式传槽
 * profile）。level 缺省 = 'high'（三档同流派生——档位只改发射密度，不改骨架决策/
 * rng 消费序，见 lodPlanFor）。
 */
export function buildPlatanusGeometry(
  rng: () => number,
  profile: BroadleafShapeProfile = PLATANUS_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): PlatanusGeometryResult {
  const lod = lodPlanFor(profile, level);
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    clusters: [],
    clustersCulled: 0,
    fruit: [],
    leafCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（shapeProfile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = 11.9 + rng() * 0.7; // 形态参数域 11.9–12.6m（≈12m 主代理裁定保守低端——12–14m 弱 Inferred per 终审记档）；实测涌现带 11.53–12.79（8 槽，领导/骨架链复利外伸 Δ ∈ −0.6…+1.9 随 seed、各槽领导比回调研 slot-0 leaderLengthRatio 注释——先例银杏链噪声 ±0.5 于 8m 级、悬铃木 12m 级链长放大噪声，参数域收紧 0.7 收束槽带）
  const crownRadius = (totalHeight * profile.crownWidthRatio * 0.5) * (0.94 + rng() * 0.12); // 冠幅半径 = 冠幅比驱动（含 ±6% 抖动）——工程域 0.6–0.75 涌现（探针定档见 profile）
  const trunkBaseR = 0.3 + rng() * 0.06; // 根径 0.30–0.36m（DBH Unknown——工程设定，速生比例瘦干读向；vs 银杏慢生粗干 0.26–0.32）
  const trunkH = totalHeight * (0.29 + rng() * 0.06); // 干高 29–35%（Spec 域扩展节 A 0.25–0.35 Inferred [9]——六实例首个 Inferred 支撑干高域）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.05)); // 主干倾轴（≤2.9°——单干主导通直 [9]，容许低位双主枝记档不建模 per 终审 C-5）

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

  // ── L1 骨架枝 ×6（横展 36–54° 对铅垂斜上-平展广角——35–60° 主流 40–55° Inferred
  //    [9] + open spreading Verified [7][8]；方位 60° 均分 + asymmetry 0.48 散布抖动 =
  //    螺旋互生散布（无轮生口径 [4][9]）；挂高 0.58–0.74 干高段 span 0.16；rank 乘子
  //    承担环内势差 + 干向挂点高度分级 SCAFFOLD_LENGTH_TAPER ×1.18→×0.72 + 角度梯度
  //    低枝 +14…16° 平展（lower limbs spread widely [9]）/ 高枝 −6…−8° 圆头闭合）──
  const scaffoldCount = profile.scaffoldCount;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const rank = Math.min(i, profile.scaffoldRankLength.length - 1);
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, profile.asymmetry * 0.88); // 方位抖动 ±25°·(asymmetry/0.5)——互生散布
    const attachT = profile.scaffoldAttachMin + (i / scaffoldCount) * profile.scaffoldAttachSpan + jitter(rng, 0.06);
    // 干向挂点高度分级（阔卵-圆头剪影）：挂点在挂高段内归一位置——低枝长且平展 / 高枝短且收角
    const attachNorm = THREE.MathUtils.clamp(
      (attachT - profile.scaffoldAttachMin) / Math.max(profile.scaffoldAttachSpan, 1e-4),
      0,
      1,
    );
    // 横展角（对铅垂）→ 方向分量：水平 sin / 铅垂 cos；角度梯度：挂点低端平展
    // （+14…+16°——冠基放张）/ 高端收角（−6…−8°——圆头闭合），确定性随 attachNorm 插值
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
  // ── L1 领导枝 ×1（幼-中龄较强 excurrent 过渡位——apical_dominance 幼强老失轴
  //    Verified [4][7][8]，leaderLengthRatio 0.50 中庸：圆头顶由骨架链共构、领导不翻转
  //    树顶；无顶芽合轴分枝（FOC "Terminal buds absent" [4]）由领导链抽象承载；
  //    强度差异全部由 profile.leaderLengthRatio 表达，直立系数 0.92 为家族方法常量）──
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
  //    疏簇 5 候选 2 张；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位
  //    同位）；Low 壳卡模式不烘焙簇内叶卡与果序（候选生成/通透过滤/果序 rng 消费已
  //    照常走完——消费序列档间恒等）──
  const bakedCards: LeafCard[] = lod.shellCards
    ? []
    : leafCards.filter((c) => c.emitOrdinal % lod.leafEmitEvery === lod.leafEmitPhase);
  /** 烘焙叶卡数（Low = 保留簇 × 每簇壳卡数——叶组三角 = 该数 × 2） */
  const bakedLeafCount = lod.shellCards
    ? ctx.clusters.length * LOW_SHELL_CARDS_PER_CLUSTER
    : bakedCards.length;
  /** 烘焙果球数（High/Mid 全量保留——身份信号；Low 省略记档） */
  const bakedFruitBalls = lod.shellCards ? 0 : ctx.fruit.reduce((s, f) => s + f.balls.length, 0);

  // ── 簇账目：逐簇烘焙疏簇叶量 + 逐烘焙卡簇内归一化半径（烘焙序对齐；Low 壳卡无簇内
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
    //    半幅吞并簇半径（LOW_SHELL_MARGIN 校准依据见常量注释）；果序不发射（省略记档）──
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
      const bendRoot = 0.12 * hw; // 枝轴节位 ≈ 0
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

  // ── 果序烘焙（High/Mid 全量：逐球细梗 + 正二十面体球 = 26 三角/球——**入皮组
  //    （组 0）**：uv v∈[4,5] 果序域身份标记 + aLeafRand/aBend 随皮组恒 0（材质侧
  //    冻结接口——皮材质 v≥4 门控整域染绿褐果球、深度材质 aLeafRand=0 实心守卫覆盖
  //    果影，见 emitFruitBall/emitFruitStem 注释）；「满冠悬垂绿褐果球、长梗下垂叶幕
  //    下」Spec §2 判定做的几何侧表达；Low 省略记档 ──
  if (!lod.shellCards) {
    for (const site of ctx.fruit) {
      for (const ball of site.balls) {
        emitFruitStem(bark, ball.stemFrom, ball.center);
        emitFruitBall(bark, ball.center, ball.radius);
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

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 叶 1——果序入皮组）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_platanus 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  /** 组 0 = 皮拓扑 + 果序（果序入皮组——材质接口约定，见 emitFruitBall 注释）；
   *  皮拓扑面数 = 组 0 三角 − 果序三角（结构锁 24178 口径不变） */
  const group0Tris = (groups[0]?.count ?? 0) / 3;
  const fruitTris = bakedFruitBalls * FRUIT_TRIS_PER_BALL;
  return {
    geometry,
    stats: {
      barkTriangles: group0Tris - fruitTris,
      leafTriangles: bakedLeafCount * 2,
      leafCards: bakedLeafCount,
      fruitSites: lod.shellCards ? 0 : ctx.fruit.length,
      fruitBalls: bakedFruitBalls,
      fruitTriangles: fruitTris,
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
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上举偏置（悬铃木 upturn
 * [0.26,0.22,0.17,0.13,0.09] 低于银杏上举链——斜上-平展开展 [4][7][8]：冠缘摊平的
 * 阔卵-圆头读向）；起径 = 父径 × profile.radiusRatio[level]、末径 = 起径 ×
 * profile.endRatio[level]；子枝挂点内埋父径内（起点回退 2.5×子径，杜绝接缝黑洞——
 * 树皮微起伏幅度 ≈ 1.4% 局部半径，≪ 内埋余量，接缝安全不变）；末两级 = **大叶疏簇
 * 挂点 + 果序挂点**（疏簇挂枝梢簇位 + 保留 L5 簇位果序成对球；通透过滤在收冠后统一
 * 执行，内层稀疏由密度场接管）。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划抽稀
 * （径向降段 + 站点隔 1 抽 1 + 未发射级跳过 emitTube）；簇决策/簇内候选生成/果序 rng
 * 与档位无关（发射省略不省略消费）。
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
      // 上举偏置随 t 增强（横枝末段姿态——悬铃木末级 0.09 冠缘摊平 + 游走 = 圆头冠
      // 外缘闭合；阔卵主剪影由骨架侧驱动链承载：干向分级 + 广角 + 散布方位）
      d.add(UP.clone().multiplyScalar(spec.upturn * t * 0.5)).normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  // 管发射按档位计划：未发射级（Mid L5 / Low L2–L5）只递归不发射——站点/簇位/果序/rng 照常
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

  // ── 大叶疏簇挂点 + 果序挂点（末两级 L4/L5）──
  // 疏簇（家族「枝梢驱动叶簇」的悬铃木语义）：枝梢 → 簇空间（⊥ 枝切向平面）→ 互生
  // 螺旋疏排大卡——L4 外段 1 簇 / L5 沿途外段 + 枝端共 2 簇（互生一节一叶、节间
  // 3–5cm、疏朗通透 [3][4][9]——簇 = 末级枝叶组的卡布置球）；簇间大间隙 = 「簇只挂
  // 枝梢离散位 + 大间距抑制」（拓扑相关处的父子/兄弟共位由簇级距离抑制保险，见下）
  const clusterCount = level === 3 ? profile.clustersL4 : level === 4 ? profile.clustersL5 : 0;
  if (clusterCount > 0) {
    const isL5 = level === 4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const leavesPerCluster = isL5 ? profile.clusterLeavesL5 : profile.clusterLeavesL4;
    for (let i = clusterCount - 1; i >= 0; i--) {
      // 簇沿枝 t：末位簇 = 枝端（t=1），其余在外段均匀散布（+抖动）；单簇枝落外段中后部。
      //  生成序枝端簇优先（倒序）——疏簇上簇级抑制先保证枝端簇位，沿途簇让位
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
      // 兄弟枝梢拓扑共位——后生成者让位）；簇位与叶片/果序 rng 仍无条件消费，消费次数与
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
      // 疏簇平面基（⊥ 簇方向 = 挂点枝切向——「叶对枝轴近垂直」[9] 的簇平面）
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0); // 近铅垂切向的确定性回退
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      for (let j = 0; j < leavesPerCluster; j++) {
        // 互生螺旋方位：黄金角步进 + 抖动（「互生、一节一叶」[3][4][9] 的簇内方位语言——
        // vs 银杏莲座均分 2π/n：互生叶序的螺旋错位）
        const phi = j * GOLDEN_ANGLE + jitter(rng, 0.45); // 1 次
        const wobble = randUnit(rng); // 2 次（互生自然不齐的弱球面抖动）
        // 外壳偏置：r̂ = mix(1−shellBias, 1, rng^γ)——互生叶位宽域平摊分布（簇心 = 枝梢位）
        const rhat =
          1 - profile.clusterShellBias + profile.clusterShellBias * Math.pow(rng(), profile.clusterShellGamma); // 1 次
        // 互生偏移方向：簇平面辐射 + 沿枝向前倾（FORWARD_TILT——「略前倾」[9]）+ 弱抖动
        const offsetDir = u1
          .clone()
          .multiplyScalar(Math.cos(phi))
          .add(u2.clone().multiplyScalar(Math.sin(phi)))
          .add(tangent.clone().multiplyScalar(ALT_FORWARD_TILT))
          .add(wobble.clone().multiplyScalar(ALT_WOBBLE))
          .normalize();
        const cardCenter = center.clone().addScaledVector(offsetDir, rhat * radius);
        // 叶尖方向：辐射外向 + 平展上举（大叶平展摊开 [9]——PLANE_LIFT 低于银杏莲座）
        const cardDir = offsetDir.clone().add(UP.clone().multiplyScalar(PLANE_LIFT)).normalize();
        let side = cardDir.clone().cross(UP);
        if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
        side.normalize();
        const roll = rng() * Math.PI; // 卡面滚转（取向随机——打散规则感；家族共性沿用）1 次
        side.applyAxisAngle(cardDir, roll).normalize();
        // 卡根朝内：cardDir 与簇内偏移方向反向时 dir/side 同取负（卡面不变、根尖互换、
        // 法线不变），叶尖恒指簇外——「叶自枝梢节位向外生长」读向（根边 uv v=0 = aBend 低端）
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
            emitOrdinal: j, // 簇内候选序（Mid 掩码位——见 LeafCard.emitOrdinal 注释）
          });
        }
      }

      // ── 果序挂点（L5 簇位：宿存成对球果——Spec 判定做 [1][3][7][8][9]；rng 3 次
      //    无条件消费（bear/pair/az——结构计数类槽间恒等），派生量（垂挂深度/球径/
      //    逐球 rand）由 roll 确定性派生零额外消费；「果枝有头状果序 1-2 个，典型 2」
      //    FRPS Verified [1]——85% 成对 / 15% 单球）──
      if (isL5) {
        const bearRoll = rng(); // 1 次
        const singleRoll = rng(); // 1 次
        const azRoll = rng(); // 1 次
        if (kept && bearRoll < FRUIT_BEAR_RATE) {
          const hang = FRUIT_HANG_MIN + FRUIT_HANG_SPAN * fract01(bearRoll * 13.7);
          const ballR = FRUIT_BALL_R_MIN + FRUIT_BALL_R_SPAN * fract01(singleRoll * 7.31);
          const pairAz = azRoll * Math.PI * 2;
          // 球心垂挂簇心下方：簇半径外 + 长梗（FOC "pendulous at least in fruit" [4]）
          const hangBase = center.clone().addScaledVector(UP, -(radius * 0.9 + hang));
          const u = new THREE.Vector3(Math.cos(pairAz), 0, Math.sin(pairAz));
          // 细梗挂点：首球梗自簇心回连（簇心藏梗顶）、成对第二球梗自首球球心侧向连出
          // （成对水平错位的连接读向——不必各自回簇心）；stemFrom 只作发射原料，零 rng
          const balls: FruitBall[] = [
            {
              center: hangBase.clone().addScaledVector(u, ballR * FRUIT_PAIR_OFFSET),
              radius: ballR,
              stemFrom: center.clone(),
            },
          ];
          if (singleRoll < FRUIT_PAIR_RATE) {
            balls.push({
              center: hangBase.clone().addScaledVector(u, -ballR * FRUIT_PAIR_OFFSET),
              radius: ballR,
              stemFrom: balls[0]!.center,
            });
          }
          ctx.fruit.push({ balls });
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
        // branch_angle 度数 Unknown（「斜上-平展延展」定性 Verified [4][7][8]，读向由
        // levels.upturn 承担），家族方法常量承载）
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
