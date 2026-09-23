/**
 * runtime/procedural/tree/salix/salixGeometry —— 垂柳（Salix babylonica L. 杨柳科
 * 柳属落叶乔木——定名三差分见 salixShapeProfile 模块头，中国城市公园水边中龄个体
 * ≈10m，喷泉状/伞状垂帘冠 + 狭披针细叶互生沿索密排 + 低叉单干中间型）CPU 几何生成器
 * （T011.12 Step 3a，阔叶家族第十三实例——**垂枝冠首例（契约应力位，Step 1 判定①档：
 * 现有参数域内表达，零契约修订）**；方法复制自夏栎第一实例经朴树/香樟/榉树/银杏/
 * 悬铃木/栾树/乌桕（**冠缘微垂 upturn 负值最近邻**）/重阳木/国槐/白蜡/女贞（**最直接
 * 模板：第十二实例化最新世代——互生挂点回取 triadica 黄金角螺旋，decussate 对生为
 * 女贞私有语言不继承**）十二次验证的通路 ../ligustrum/ligustrumGeometry，契约字段
 * 语义不变：五级递归分枝拓扑 / 锥度管状枝干 / 枝梢驱动叶簇 / 冠内通透三规则 / 树皮
 * 近景微起伏 / LOD 三档同流派生全部沿用；垂柳数值与算法细节差异点见下）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级
 *      递归分枝拓扑 → 锥度管状枝干（平行传输标架）→ 枝梢驱动**互生细长单叶卡簇**
 *      （黄金角螺旋散布——crown-a 双问「互生错位」[6] 直证，单叶系互生主流挂点语言）
 *      烘焙，产出树皮/叶两层非索引几何；层间 mergeGeometries(useGroups=true) 恰 2 组
 *      （D15 免组膨胀：皮 0 / 叶 1——**无花果器官账目**（任务书裁决 2：柔荑花序先叶
 *      开放花期 3–4 月、蒴果 4–5 月，时窗错位判据 ligustrum 先例直接适用——组 0 纯
 *      皮拓扑，uv 花果域 v∈[3,7) 全空）。形态参数类型 = 阔叶家族契约
 *      ../broadleaf/broadleafShapeProfile（垂柳为第十三实例，零修改实例化——**upturn
 *      强负链 = 带符号连续参数的量级极端化而非域外，D31.2 未触落的实证**），数值与
 *      槽组合见 ./salixShapeProfile（全部数值依据 docs/research/salix-reference.md
 *      Spec 1.0——含主代理采样终审修正口径：冠幅比上沿 1.3 / 垂幕深 2/5–2/3 / 叶沿
 *      索轴取向）；build 只做 slot → profile 路由，不进 ProceduralBuild 公共签名。
 * 垂柳算法细节差异点（vs ligustrum 模板，逐条 Spec 引用见 salixShapeProfile 内联
 *      注释；主代理「待裁决位」11 条为执行依据）：
 *   - **垂枝链（应力位核心，裁决 1①档——量级极端化首例）**：L3/L4/L5 upturn 强负链
 *     [-0.85,-1.35,-1.55]（先例 11 树带 [-0.04,+0.41]——乌桕 L5 微负在先；upturn 为
 *     带符号连续参数无 clamp，growBranch 每段方向更新 d += UP×upturn·t·0.5 的负向
 *     叠积使垂索末段俯角达 -70°~-80°（探针实测记档））+ L1/L2 正值拱起链 [0.16,
 *     0.04]（骨架外展-拱起的喷泉半拱）+ **末级链加长**（lengthRatioBase 0.74——垂幕
 *     深覆树高 2/5–2/3 的路径预算）+ wander 低值链（垂索近直微曲——S/J 波曲与节点
 *     微 zigzag（branch-b [6]）由逐段小扰动涌现，不用大 wander）。
 *   - **喷泉骨架（裁决 1）**：scaffoldAngle 20–36°（与垂直 20–60° 三源双问 [6] 域内
 *     窄端带——拱高读向优先（探针六轮回调：大值域直读实测腰过低 + 冠幅越域，收窄
 *     定档））+ 挂高段 0.72–0.94 低-中挂高段（干高占比 0.25–0.35 低叉型
 *     [6]——干高参数域由挂高段中点派生：attachMid 映射 0.27–0.35 带（slot-5 高位端/
 *     slot-6 近基端的干形轴三型承载））+ **领导枝弱化 0.30**（喷泉形无中央领导——
 *     冠顶由骨架拱链决定；T009.3 弱领导翻转语义的极端端）+ 子枝方向分档：拱层级
 *     （父 L1/L2）侧枝上举域 0.2–0.55 / 垂帘层级（父 L3/L4）侧枝低举域 0.05–0.23
 *     （垂索平射后坠——帘幕列紧致、横向外泄受控，rng 消费次数恒等），延伸枝近延续
 *     （up kick 0.05——垂坠末梢不被上踢）。
 *   - **垂索细化（裁决 1）**：radiusRatio 末端两级陡减 [0.58,0.40] + endRatio 收窄
 *     ——L5 起径 ≈5–6mm / 末径恒地板 0.004m（growBranch 末径地板族常量）：索径
 *     4–8mm 量级带（Spec 垂索径 2–6mm Inferred [6] 的同量级可达带——地板下不可
 *     达记档）。
 *   - **簇沿切向 → 垂帘（裁决 1 簇沿切向条 + Spec 终审补强「叶尖沿索轴朝下、部分
 *     微外翻」）**：先例「簇方向 = 挂点枝切向」机制直接继承——垂索切向近垂直向下 →
 *     簇平面近水平 → 卡沿垂索放射；**卡向 = 簇辐射外向 + 沿索切向下倾混合**
 *     （STRAND_TILT 0.38——「叶尖沿索轴朝下」的卡向弱表达，替代先例 PLANE_LIFT 平展
 *     上举；卡根朝簇心、外向分量保「部分微外翻」）+ 簇位点域外段化（clusterInnerStart
 *     L5 0.30 / L4 0.35——垂索长 → 簇沿索分布拉长覆帘幕纵深）+ 中簇 0.26–0.40 +
 *     每簇 10 候选（细叶中数量档）；簇间列距抑制 0.50（帘幕列间隙 0.1–0.25 的下界
 *     保险）。
 *   - **细卡风险（裁决 5/6 + 冻结接口）**：真叶 9–16cm × 0.5–1.5cm（FRPS Verified
 *     [1][3]）× 2 家族卡映射 → 卡宽 0.02–0.03 × **卡长宽比域 8–18**（冻结接口——
 *     几何卡与 salixMaterials 狭披针 SDF 包络同域消费）；Mid/Low 档细卡亚像素风险：
 *     **档间连续性优先**（Low 壳卡保底策略沿先例——壳卡宽轴 = 1/13 中位长宽比 ≈
 *     0.077 的窄竖卡，垂帘剪影的档间语义），预算行内自洽。
 *   - 尺度锚：公园水边中龄个体 ≈10m（Spec §2 生产锚 8–12m 带中值偏上——物种上限
 *     12–18m + NC 园艺典型 9–12m 高宽同域 + form-a 岸线粗估佐证）——形态参数域树高
 *     10.0–10.6m（**Step 3 探针回调定档（六轮）**：初值 9.4–10.0 实测涌现 8.97–12.81 跨越域——弱领导 0.30 下骨架拱链外泄系数 ~×0.88–1.2 槽间波动，经 8.7–9.3 → 终值 10.0–10.6 终测涌现 8.43–11.22 全落 8–12 带、slot-0 9.83 ≈10 锚；终测带见 asset 模块头）；根径 0.30–0.36m
 *     （DBH Unknown——工程设定，10m 速生乔木家族带）；干高 0.27–0.35 派生带（挂高段
 *     中点映射，干形轴三型分化）。
 *   - 树皮近景微起伏：**暗灰黑波状不规则纵沟脊（第 13 树皮语言，裁决 7；「树皮灰
 *     黑色，不规则开裂」FRPS/FOC Verified [1][3] + bark-a「波状不规则纵沟脊、沟深、
 *     脊浅褐 vs 沟近黑强对比」[6]）**——amplitudeRatio 0.028（深沟带）+ 谐波 {4,6}
 *     （**主干 radial 14 的奈奎斯特域 7 ≥ 6+1 留 1 档边际**）+ drift 6.2 rad/m
 *     （**波状档**——轴向去相关 ≈2π/6.2 ≈ 1.0m 脊沿轴急游走 = 波状不规则读向；
 *     国槐 5.5/重阳 6.5 交叉扭错带，vs 女贞 3.4 顺直档）。机制不变：纯确定性函数
 *     零 rng；幅度 ∝ 局部半径（**亚视觉地板 3.0mm：0.028 下起径 < 0.107m 的管平滑
 *     发射 → 仅主干有效起伏**、全部分枝管光滑——细枝纤细光滑的几何侧读向，暗灰黑
 *     色调/沟脊色对比/修剪残桩归材质层）；主干 radial 14（奈奎斯特域 7 容纳 k=6 留
 *     1 档边际）。
 *   - **uv 域身份标记（家族探针断言纪律）**：皮管 v = 累计弧长 × 0.5（主干）/×0.42
 *     （**五级枝压缩系数——10m 级最长拱枝弧（L1 ≈4.5m）×0.42 ≈ 1.9，全几何皮管
 *     v ≤≈2.0 < 2.5 族纪律**，fraxinus 式压缩的垂柳档）；**v∈[3,7) 顶点数 = 0**
 *     （无花果资产——任务书裁决 2 的结构锁）。
 *   - 骨架：**6 骨架枝 + 1 领导枝**（scaffold 文献无计数——照片判读 3–6 枝 [6] +
 *     族典型域，裁决 11【工程设定无现实基准】照片域上沿取值；拓扑 L1=7 → 枝数
 *     [7,21,63,189,378]、簇位 945（L4 189×1 + L5 378×2）、皮面 26180：主干 406
 *     （14 段 ×14 + 底盖 14）+ L1 1120（7 枝 ×10 段 ×8）+ L2 2352（21 ×8 段 ×7）+
 *     L3 3780（63 ×5 段 ×6）+ L4 9450（189 ×5 段 ×5）+ L5 9072（378 ×3 段 ×4））。
 *   - 密度语言：**通透档（间隙 0.1–0.25，crown-a 双问 [6]——vs 女贞/樟密档）**：
 *     canopyDensity 0.80 + 壳带 0.42 + 芯层地板 0.06 + 空腔 3 个 0.55–0.95 + 中簇
 *     （0.26–0.40）+ shellBias 0.44（帘幕薄壳——细长卡放射）。
 *   - 干形轴（裁决 3）：slot-0 低叉单干中间型（微倾 ≤2.9°——主代理裁定 Spec 建议
 *     维持）；三型端点 = slot-5 高位单干（挂高段上移 + trunk.wander 0.03 顺直）/ 
 *     slot-6 基部多干斜弯（挂高段下移 + **trunk.wander 0.16 斜弯弱表达**——真多干
 *     为结构差异不落连续参数，记档不建模沿家族纪律）；「旱柳砧高接」成因 Unknown
 *     不消费——干形域由照片三型直接承重 [6]。
 * 不建模（Spec 有事实、几何不表达——记档见 salixShapeProfile 模块头）：**花/蒴果**
 *   （裁决 2 时窗错位；v∈[3,7) 空）；叶形内部结构（狭披针包络/细锯齿/长渐尖/羽状脉/
 *   叶柄/两面色——归 salixMaterials 单叶 SDF 层，并行交付，签名冻结：
 *   createSalixBarkMaterial / createSalixLeafMaterial / createSalixLeafDepthMaterial，
 *   均 (level?) => 材质 + SALIX_TREE_HEIGHT_NOMINAL 树高锚）；芽（冬态）；小枝色
 *   （单档，归材质层）；树皮色调/残桩（归材质层）；真多干丛生相；曲枝变体 f.
 *   tortuosa / 旱柳系变体。
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等（High 26180 账目见
 *      上）；Mid 5648 = 主干 90（7 段 ×6 + 底盖 6）+ L1 350（7 枝 ×5 段 ×5）+
 *      L2 672（21 ×4 段 ×4）+ L3 1134（63 ×3 段 ×3）+ L4 3402（189 ×3 段 ×3），
 *      L5 不发射；Low 370 = 主干 90 + L1 280（7 枝 ×5 段 ×4）。簇位数 945（L4
 *      189×1 + L5 378×2）/每簇 10 卡为计数类（rng 消费次数恒定），保留簇数与实际
 *      叶卡数随 seed 由簇级距离抑制 + 通透规则确定（同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律原样沿用）：簇生成与叶片候选的 rng 消费均为无条件固定次数
 *      （每簇：簇位 2 次（t 抖动/半径）+ 每卡 8 次（方位抖动 1 + 球面抖动 2 + r̂ 1 +
 *      滚转 1 + 宽 1 + 长宽比 1 + rand 1——互生逐卡独立 r̂，vs 女贞对内共享的 8/7
 *      分档结构）），被簇级距离抑制丢弃的簇位足额消费后丢弃；通透 roll 每卡无条件
 *      1 次。**探针闭包教训（011.3 ③）**：rng 消费计数用包裹 rng 闭包实测，消费次数
 *      以测试锁定快照为准。结构消费全部固定次数；总消费数随保留簇数变化（通透 roll
 *      计数 = 存活候选数）——槽内三档恒等（同 seed 同保留簇集）、跨槽/跨 seed 随保留
 *      簇数浮动（实测带见 salixStructure 测试快照注释）。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值；皮组
 *        顶点树皮语义位恒 0；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，卡内根→尖非降（根 0.12·hw / 尖 0.52+
 *        0.44·hw，hw = 冠内高度权重）；树皮层同名属性写恒等值 0。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0——**垂帘帘缘带前提**：
 *      终测帘缘止于地上 0.45–2.13m（Spec「多数止于其上 1–2m [6]」带内 + 低垂个体
 *      端），探针锁原始 minY ≥ −0.08（叶卡极值斜伸的 ≤8cm 穿地允许带——大幅负值
 *      = 垂索主体生成至地面下（贴地平移抬干的隐性风险位），Step 3 探针锁；初值
 *      参数实测 −1.30 → 垂索收短定档后终测 −0.01～−0.06）；
 *      叶卡 UV 标准 0–1 四边形域（v 轴 = 单叶长轴（叶基 0 → 叶尖 1）、u = 叶宽方向
 *      0–1——狭披针 SDF 消费归 salixMaterials）；叶法线取卡面单侧（cross(side, dir)）。
 * LOD 三档（T011.12，家族方法逐位复制：level 为 Runtime 可选参数——不参与
 *      shapeSlot/morphSeed/sourceKey 形态身份计算；档位缓存维度 = sourceKey + level 归
 *      ProceduralSourceCache）：三档共用**同一条 rng 消费流**与同一套骨架/簇位决策
 *      路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/叶候选照常
 *      决策，枝路径/簇位/冠形包络/通透过滤决策逐位同源：
 *      - High：全发射（缺省档；皮面数 26180）；树皮微起伏保留；
 *      - Mid：径向段数降（主干/五级 14/8/7/6/5/4 → 6/5/4/3/3/3——粗枝保圆度、细枝
 *        三边管）+ 轴向站点隔 1 抽 1 发射（站点全算·游走 rng 全消费）+ L5 末梢管不
 *        发射（末梢径亚厘米，Mid 观距亚像素；簇位照常派生）+ 簇内叶卡掩码
 *        j % 3 === 1（每簇 10 候选中 3 张（30%）——被弃候选足额消费 rng 后不进烘焙；
 *        通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位同位）+ 树皮微起伏
 *        保留；皮 4514；
 *      - Low：主干 + L1 骨架极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（每保留簇 1 张离心切向竖卡——**垂柳分化**：
 *        簇位沿索拉长 → 保留簇 600–800 级（vs 先例 ~474），双竖卡口径越 Low 预算
 *        上沿，单卡落带（记档）；半幅 = 簇半径 + 0.32m 余量（细长卡沿索斜伸的常态
 *        伸出中位——极值叶尖仍由 High 决定冠包络，Low 不涨出）；宽轴 = 0.077 × 半幅
 *        ——**卡长宽比域 8–18 中位 13 的倒数在 Low 壳卡的延续**（细长窄竖卡 = 垂帘
 *        剪影的档间语义））；皮 370。
 *      预算锁定账目（8 槽 × 3 档实测带 + 锁定依据）见
 *      ../assets/asset_tree_salix.asset 模块头（预算制 D19.8，家族行沿用）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SALIX_SLOT0_PROFILE } from './salixShapeProfile';
import type { BroadleafBarkRelief, BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface LeafCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖 = 叶基 → 叶尖；垂柳 = 簇辐射外向 + 沿垂索切向下倾混合）
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

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径（枝梢驱动叶簇——家族方法
 *  沿用；垂柳语义 = 末级垂索互生细卡簇的簇空间——簇方向近垂直向下 → 簇平面近水平 →
 *  卡沿垂索放射下倾（垂帘幕的挂点语言） */
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
export interface SalixGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 叶卡三角（leafCards × 2——无花果器官账目，组 0 纯皮拓扑） */
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
    /** 原始 minY（贴地平移量 = −rawMinY；垂帘极值触地锁：rawMinY ≥ −0.08——垂幕
     *  帘缘止于地上 0.45–2.13m 的设计带内，叶卡极值（卡长 0.16–0.54 斜伸至帘缘以下）
     *  允许 ≤8cm 穿地（平移抬干亚视觉级、地面遮挡；终测 8 槽 −0.01～−0.06——大幅
     *  负值 = 垂索主体生成至地面下的隐性风险位，探针锁 −0.08）） */
    rawMinY: number;
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

/** x → [0,1)（确定性散列分量） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

// ── 垂柳互生细卡挂点语言常量（结构常数：槽间恒等——改值即改面数与 rng 消费）──

/** 黄金角（137.5° = 2.39996 rad——**互生螺旋方位步进**：「叶沿垂索互生错位」crown-a
 *  双问 [6] 的几何落地——单叶系互生主流语言（朴/樟/榉/栎/槐/栾/桕/重阳/乌桕）直接
 *  继承（语言继承 platanus/triadica），vs 女贞 decussate 对生（对生为女贞私有） */
const GOLDEN_ANGLE = 2.39996;
/** 互生方位抖动 ±0.45 rad（互生自然不齐——triadica 同档沿用） */
const PHYLLO_JITTER = 0.45;
/** 散簇细长卡取向常量（垂帘语言——连续形态方法常量，非槽差异维度）：沿索前倾分量
 *  （× 簇方向 T——卡位沿垂索下移的弱表达）+ 弱球面抖动 + **沿索轴下倾（本树核心
 *  分化位）**：卡向 = 簇辐射外向 + 索切向 ×0.38 的混合——「叶尖沿索轴朝下、部分微
 *  外翻」（Spec 终审补强，crown-a 双问 [6]）的卡向弱表达，**替代先例 PLANE_LIFT
 *  平展上举**（垂柳叶不平展上举而沿索垂排）；0.38 < 1 保证卡根朝簇心判定恒真 */
const ALT_FORWARD_TILT = 0.24; // 沿枝向前倾分量（× 簇方向 T）
const ALT_WOBBLE = 0.14; // 弱球面抖动（自然不齐——细叶档低于 triadica 0.16）
const STRAND_TILT = 0.38; // 卡向沿索切向下倾分量（叶尖沿索轴朝下——垂帘卡向）

// ── 垂枝链子枝方向常量（垂柳分化位——层级分档上举域；rng 消费次数恒等）──

/** 拱层级（父 L1/L2）侧枝上举域基值与跨度（家族量级沿用——外展-拱起的喷泉半拱层） */
const ARCH_LATERAL_UP_BASE = 0.2;
const ARCH_LATERAL_UP_SPAN = 0.35;
/** 垂帘层级（父 L3/L4）侧枝上举域基值与跨度（**垂柳分化**：低举域——垂索平射后坠，
 *  帘幕列紧致、横向外泄受控 vs 拱层级高举再坠的宽散型；值域工程设定，方向 = 喷泉
 *  冠「四周垂帘下覆」读向 [6]） */
const CASCADE_LATERAL_UP_BASE = 0.05;
const CASCADE_LATERAL_UP_SPAN = 0.18;
/** 延伸枝上踢分量（垂柳分化：0.05 近延续——**垂坠末梢不被上踢**，vs 家族 0.18 上扬
 *  延续；喷泉垂帘的末级路径方向连续性） */
const TIP_UP_KICK = 0.05;

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
   *  每簇 10 候选 → j∈{1,4,7} 3 张（30%）） */
  leafEmitEvery: number;
  leafEmitPhase: number;
  /** Low 壳卡模式：不烘焙簇内叶卡（候选/过滤决策照常），逐保留簇发射交叉壳卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（结构依据见模块头 LOD 段；预算记账 = 8 槽实测口径，正式预算带
 * 锁定见 ../assets/asset_tree_salix.asset 模块头）：
 * - High 皮 26180（拓扑恒等不动：主干 406（14 段 ×14 + 底盖 14）+ L1 1120（7 枝 ×10
 *   段 ×8）+ L2 2352（21 ×8 段 ×7）+ L3 3780（63 ×5 段 ×6）+ L4 9450（189 ×5 段 ×5）+
 *   L5 9072（378 ×3 段 ×4））；Mid 皮 5648 = 主干 90（7 段 ×6 + 底盖 6）+ L1 350
 *   （7 枝 ×5 段 ×5）+ L2 672（21 ×4 段 ×4）+ L3 1134（63 ×3 段 ×3）+ L4 3402
 *   （189 ×3 段 ×3），L5 不发射；Low 皮 370 = 主干 90 + L1 280（7 枝 ×5 段 ×4）。
 * - Mid 叶 ≈ High 存活卡 × 掩码率（每簇 10 选 3 = 30%）；8 槽实测落 6–10K 带。
 * - Low 叶 = 保留簇数 × 1 壳卡 × 2 三角；8 槽实测落 1.5–3K 带。
 */
function lodPlanFor(profile: BroadleafShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    // 缺省档全发射：profile 原值直读 + 步长 1（thinStations 原数组透传）——皮面数
    // 26180 / rng 消费快照（salixLod 测试锁）延续
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
    // 不发射（亚厘米径亚像素）+ 叶卡掩码 j%3===1（每簇 10 选 3——8 槽实测 High 卡 →
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

/** Low 壳卡半幅余量（米）：High 散簇细长卡自簇心的最大伸出 ≈ 簇半径 + 卡长（≤0.54m
 *  斜向——卡宽 0.02–0.03 × 长宽比 8–18 ⇒ 卡长 0.16–0.54m），典型伸出（r̂≤1 壳位 +
 *  沿索下倾）中位 ≈ 半卡长 0.16–0.27m——取 0.32（细长卡档）使壳卡吞并簇半径 + 常态
 *  伸出域，且极值叶尖仍由 High 决定冠包络（Low 不涨出——档间 bbox 一致性测试容差
 *  依据见 salixLod） */
const LOW_SHELL_MARGIN = 0.32;
/** Low 每保留簇壳卡数（**单竖卡（垂柳分化记档）**：垂柳簇位沿索拉长分布（innerStart
 *  0.30/0.35 域外段化）→ 保留簇 600–800 级（vs 先例 ~474）——双竖卡口径下 Low 总面
 *  越家族预算上沿（簇×4 + 皮 > 3000），单竖卡落带；垂帘剪影 = 竖条纹列语义单卡已足，
 *  宽轴 0.077 极窄下双卡与单卡同为远距线条；确定性几何，非 billboard） */
const LOW_SHELL_CARDS_PER_CLUSTER = 1;
/** Low 壳卡宽轴比（宽/高 = 0.077——**卡长宽比域 8–18 中位 13 的倒数延续**（1/13 ≈
 *  0.077）：细长窄竖卡 = 垂帘剪影的档间语义（vs 女贞大卡中位 0.44 宽壳卡——细叶
 *  档的 Low 口径记档） */
const LOW_SHELL_WIDTH_RATIO = 0.077;

/** Low 壳卡逐卡身份（aLeafRand 契约值 ∈ [0,1)）：簇心 sin 散列 + 第二卡派生错相（零 rng
 *  ——簇位表跨档同源，壳卡身份随簇确定；同簇双卡色相微错开避免同色块读向） */
function shellCardRandOf(cx: number, cy: number, cz: number, derive: number): number {
  const base = fract01(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453);
  return derive === 0 ? base : fract01(base * 7.31 + 0.37);
}

/**
 * Low 壳卡发射：簇心单竖卡——宽轴 w（水平单位向量 = 离心切向，卡面法线水平离心——
 * 喷泉壳层最优读向）× 宽半幅 = **0.077 × 半幅**（细长卡中位长宽比 13 的倒数延续
 * ——垂帘窄竖剪影）、高轴 UP × 半幅；六顶点卡 / uv 0–1 四边形域 / aLeafRand /
 * aBend 契约与 High 叶卡同构（根边 v=0（叶基）、尖边 v=1（叶尖）；aBend 根
 * 0.12·hw / 尖 0.52+0.44·hw 与 High 同公式同常数——档间风相位/摆幅语义一致，
 * D19.7）；卡面法线 = w × UP（水平——竖卡双面读向）。
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
  const bendRoot = 0.12 * hw; // 根边（簇挂枝端语义——叶基）≈ 0
  const bendTip = 0.52 + 0.44 * hw; // 尖边大；树顶簇 > 树底簇（同 High 公式）
  const halfW = half * LOW_SHELL_WIDTH_RATIO; // 细长卡中位长宽比延续（宽轴）
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
//    全在 shapeProfile.barkRelief 三字段（垂柳幅度/谐波/游走率见 salixShapeProfile）──
/** 谐波权重基线（低次主导；按 harmonics 序循环取用后归一） */
const BARK_RELIEF_WEIGHT_BASE = [0.42, 0.33, 0.25];
/** 相位游走正弦项频率（rad/m）/幅度（rad）——沿轴缓变游走分量 */
const BARK_RELIEF_WANDER_FREQ = 1.6;
const BARK_RELIEF_WANDER_AMP = 0.5;
/** 脊深呼吸（权重沿轴调制）频率（rad/m）/幅度——起伏深浅沿干交错（波状沟脊的
 *  深浅缓变读向 [6]；幅度工程设定） */
const BARK_RELIEF_BREATHE_FREQ = 2.4;
const BARK_RELIEF_BREATHE_AMP = 0.3;
/** 亚视觉幅度地板（米，峰值，**3.0mm——家族档沿用**）：管起径 × amplitudeRatio < 此值
 *  → 该管整体跳过起伏。抬档依据（暗灰黑深沟脊显于主干、细枝纤细光滑）：0.028 下
 *  起径 < 0.107m 的管（L1 骨架起径 0.08–0.10 亦在内）平滑发射 → **仅主干有效起伏**、
 *  全部分枝管光滑（垂柳细枝 2–6mm 光滑 [6] 的几何侧读向；暗灰黑色调/沟脊色对比/
 *  修剪残桩归材质层） */
const SALIX_BARK_RELIEF_MIN_EFFECTIVE = 0.003;

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
  /** 轴向游走率（±drift 域内确定性取值——垂柳 drift 6.2：**波状档**（轴向去相关
   *  ≈2π/6.2 ≈ 1.0m——脊沿轴急游走 = 波状不规则读向 [6]；国槐 ±5.5 局部交叉 /
   *  重阳 ±6.5 扭错带 / 女贞 ±3.4 顺直档）。速率值 = profile.barkRelief.drift） */
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
 * （垂柳 driftₘ ±6.2 rad/m——波状急游走）、wₘ(s) = baseWₘ·(1 + breathe 正弦项)
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
 * （三角形 (a0,b1,b0)/(a0,a1,b1)——右手系 (N,B,T) 下外向），uv = 环向 θ/2π × 累计弧长
 * ×vScale（垂柳：主干 0.5 / 五级枝 0.42 压缩系数——10m 级最长拱枝弧域收敛 < 2.5 族
 * 纪律，fraxinus 式压缩的垂柳档）。
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
  // 亚视觉地板（3.0mm）：起径 × 幅度比 < 0.003 的管（L1 骨架起径 0.08–0.10 亦在
  // 内）整体按 0 起伏发射——仅主干有效起伏、全部分枝管光滑（暗灰黑深沟脊显于主干、
  // 细枝纤细光滑 [6] 的几何侧读向，色调/色对比/残桩归材质层；抬档依据见常量注释）
  const effectiveAmplitude =
    relief.amplitudeRatio * radii[0]! >= SALIX_BARK_RELIEF_MIN_EFFECTIVE ? relief.amplitudeRatio : 0;
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

/** 主干 uv 压缩系数（弧长 ×0.5——家族常量：主干弧 ~3.2m → v ≈1.6） */
const TRUNK_V_SCALE = 0.5;
/** 五级枝 uv 压缩系数（弧长 ×0.42——**垂柳压缩档**：10m 级最长拱枝弧（L1 ≈4.5m）×
 *  0.42 ≈ 1.9，全几何皮管 v ≤≈2.0 < 2.5 族纪律（fraxinus 式压缩的垂柳档记档）） */
const BRANCH_V_SCALE = 0.42;

/**
 * 主生成入口：rng（morphRng）+ shapeProfile → 合并几何 + 账目。
 * 拓扑：主干（含根部 flare）→ 6 骨架枝 + 1 领导枝（L1）→ 逐级递归（L2×3 / L3×3 / L4×3 /
 * L5×2 末梢）；枝角/长度/粗度/曲率 rng 驱动（**喷泉骨架**：骨架枝窄端带角域（20–36°
 * 外展-拱起 [6]）+ L1/L2 upturn 正值拱链 + **L3/L4/L5 upturn 强负垂枝链**
 * （[-0.85,-1.35,-1.55]——量级极端化首例，裁决 1①档）+ 领导枝弱 0.30（喷泉冠顶由
 * 骨架拱链决定）——喷泉状/伞状垂帘轮廓的结构成因，Spec §3/§4 per 终审记档口径；
 * 子枝方向层级分档（拱层级高举 / 垂帘层级低举——帘幕列紧致）、延伸枝近延续（垂坠
 * 末梢不上踢））。叶卡挂点：末两级枝梢互生螺旋散布细长卡簇（中簇 + 10 候选，簇
 * 方向 = 挂点枝切向 → 簇平面近水平 → 卡沿垂索放射下倾）——垂帘幕的挂点语言。主次
 * 分级与冠内通透规则见模块头。
 * profile 缺省 = slot-0 标准组合（锚点回落——单测直调便捷路径，资产路径显式传槽
 * profile）。level 缺省 = 'high'（三档同流派生——档位只改发射密度，不改骨架决策/
 * rng 消费序，见 lodPlanFor）。
 */
export function buildSalixGeometry(
  rng: () => number,
  profile: BroadleafShapeProfile = SALIX_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): SalixGeometryResult {
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
  const totalHeight = 10.0 + rng() * 0.6; // 形态参数域 10.0–10.6m（≈10m 锚——Spec §2 生产锚 8–12m 带中值；涌现系数 ×~1.13（弱领导 0.30 下树顶由骨架拱链决定——T009.3 弱领导翻转语义，骨架链外泄高于中庸领导先例）实测涌现高 ≈10m 级：**Step 3 探针回调记档**，终测带见 asset 模块头）
  const crownRadius = (totalHeight * profile.crownWidthRatio * 0.5) * (0.94 + rng() * 0.12); // 冠幅半径 = 冠幅比驱动（含 ±6% 抖动）——喷泉冠幅涌现主轴（骨架外展 + 垂帘外伸合成，探针定档见 profile）
  const trunkBaseR = 0.3 + rng() * 0.06; // 根径 0.30–0.36m（DBH Unknown（照片不可标定 [6]）——工程设定，10m 速生乔木家族带）
  // 干高参数域由挂高段中点派生（裁决 3 干形轴三型承载：attachMid 0.71–0.89 →
  // trunkRatio 0.27–0.35——低叉中间型（slot-0 0.31）/ 高位单干端（slot-5 0.354）/
  // 近基端（slot-6 0.271）；干高占比 0.25–0.35 双问 [6] 的挂高段映射带内）
  const attachMid = profile.scaffoldAttachMin + profile.scaffoldAttachSpan * 0.5;
  const trunkRatio = THREE.MathUtils.clamp(0.31 + (attachMid - 0.81) * 0.55, 0.24, 0.42);
  const trunkH = totalHeight * (trunkRatio + rng() * 0.04);
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.05)); // 主干倾轴（≤2.9° 微倾——slot-0 低叉单干中间型（Spec 建议维持）；斜弯相由各槽 trunk.wander 承载（slot-6 0.16），真多干记档不建模）

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
    TRUNK_V_SCALE,
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

  // ── L1 骨架枝 ×6（**窄端带角域**：scaffoldAngleMin/Max 20–36°（与垂直 20–60°
  //    三源双问 [6] 域内窄端——拱高读向）——喷泉骨架：适度开角横展 + L1 upturn 正值拱起的
  //    半拱姿态；方位 60° 均分 + asymmetry 0.42 散布抖动（骨架排列照片无模式 [6]——
  //    散布口径）；挂高 0.72–0.94 干高段 span 0.22（低-中挂高段——干高占比 0.25–0.35
  //    低叉型 [6]）──
  const scaffoldCount = profile.scaffoldCount;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const rank = Math.min(i, profile.scaffoldRankLength.length - 1);
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, profile.asymmetry * 0.88); // 方位抖动 ±25°·(asymmetry/0.5)——散布
    const attachT = profile.scaffoldAttachMin + (i / scaffoldCount) * profile.scaffoldAttachSpan + jitter(rng, 0.06);
    // 起角（对铅垂）→ 方向分量：水平 sin / 铅垂 cos——大值域直读（确定性随 rng 抽域）
    const tilt = THREE.MathUtils.degToRad(
      profile.scaffoldAngleMin + rng() * (profile.scaffoldAngleMax - profile.scaffoldAngleMin),
    );
    const length = crownRadius * profile.scaffoldRankLength[rank]! * (0.94 + rng() * 0.12);
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
  // ── L1 领导枝 ×1（**喷泉形无中央领导**——裁决 1：领导枝弱化 0.30（先例最弱带之下
  //    的强弱化端），冠顶由骨架拱链决定、领导仅补冠心结构（T009.3 弱领导翻转语义的
  //    极端端）；直立系数 0.92 为家族方法常量）──
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
  //    每簇 10 候选 3 张；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡
  //    逐位同位）；Low 壳卡模式不烘焙簇内叶卡（候选生成/通透过滤已照常走完）──
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
    // ── Low 壳卡烘焙：逐保留簇**单竖卡**（垂柳分化：簇位沿索拉长 → 保留簇 600–800
    //    级，双卡口径越 Low 预算上沿——记档见 LOW_SHELL_CARDS_PER_CLUSTER）；宽轴 =
    //    簇心离心切向（卡面法线水平离心——喷泉壳层最优读向；近轴簇确定性回退簇切向
    //    水平投影）；簇位/簇半径与 High 同源，半幅吞并簇半径 + LOW_SHELL_MARGIN
    //    （细长卡常态伸出域，校准依据见常量注释）；宽轴 = 0.077 × 半幅（卡长宽比域
    //    8–18 中位 13 的倒数延续——细长窄竖卡）──
    for (const cluster of ctx.clusters) {
      const half = cluster.radius + LOW_SHELL_MARGIN;
      const radial = new THREE.Vector3(cluster.center.x, 0, cluster.center.z);
      let w: THREE.Vector3;
      if (radial.lengthSq() < 1e-4) {
        const h = cluster.dir.clone();
        h.y = 0;
        w = h.lengthSq() < 1e-6 ? new THREE.Vector3(1, 0, 0) : h.normalize();
      } else {
        w = new THREE.Vector3().crossVectors(UP, radial).normalize();
      }
      const hw = THREE.MathUtils.clamp(
        (cluster.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY),
        0,
        1,
      );
      emitShellCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        cluster.center, w, half,
        shellCardRandOf(cluster.center.x, cluster.center.y, cluster.center.z, 0), hw,
      );
      leafRhat.push(1); // 壳面 r̂ 恒 1.0（壳即簇外壳）
    }
  } else {
    for (const card of bakedCards) {
      const hw = THREE.MathUtils.clamp((card.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY), 0, 1);
      const bendRoot = 0.12 * hw; // 枝轴节位（叶基）≈ 0
      const bendTip = 0.52 + 0.44 * hw; // 叶尖大；树顶叶 > 树底叶
      const half = card.width / 2;
      const r0 = card.center.clone().addScaledVector(card.side, -half);
      const r1 = card.center.clone().addScaledVector(card.side, half);
      const t0 = r0.clone().addScaledVector(card.dir, card.height);
      const t1 = r1.clone().addScaledVector(card.dir, card.height);
      const n = card.side.clone().cross(card.dir).normalize();
      // 顶点序（非索引 6 顶点/卡）：r0 r1 t1 | r0 t1 t0；根 = 0,1,3（叶基——uv v=0，
      // 材质 SDF 叶基域低端）尖 = 2,4,5（叶尖——uv v=1；aBend 契约序）
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

  // ── minY 精确贴地：全树（皮+叶）最低点上移至 0（垂帘不触地前提：原始 minY 账目
  //    见 stats.rawMinY——垂索生成至地面下时平移会抬干，探针锁 > 0.2）──
  let minY = Infinity;
  for (let i = 1; i < bark.pos.length; i += 3) minY = Math.min(minY, bark.pos[i]!);
  for (let i = 1; i < leafPos.length; i += 3) minY = Math.min(minY, leafPos[i]!);
  const rawMinY = minY;
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
  if (!geometry) throw new Error('程序化资产 asset_tree_salix 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  /** 组 0 = 纯皮拓扑（无花果器官账目——裁决 2）；皮拓扑面数 = 组 0 三角（结构锁 26180
   *  口径不变） */
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
      rawMinY,
    },
  };
}

/** 通道线段构造（半径平方预热） */
function segOf(a: THREE.Vector3, b: THREE.Vector3, radius: number): ChannelSeg {
  return { ax: a.x, ay: a.y, az: a.z, bx: b.x, by: b.y, bz: b.z, r2: radius * radius };
}

/**
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上举偏置（**垂柳垂枝
 * 链——量级极端化首例（裁决 1①档）**：upturn [0.16,0.04,-0.85,-1.35,-1.55]——L1/L2
 * 正值拱起链（外展-拱起骨架层）+ L3 过渡负 + **L4/L5 强负（近垂直下垂垂帘层：每段
 * 方向更新 d += UP×upturn·t·0.5 的负向叠积使垂索末段俯角 -70°~-80°（探针实测），
 * 先例 11 树带 [-0.04,+0.41] 的量级极端化——upturn 带符号连续参数无 clamp，域内
 * 表达的实证）**；wander 低值链 [0.08,…,0.05]——垂索近直微曲，S/J 波曲与节点微
 * zigzag（branch-b [6]）由逐段小扰动涌现）；起径 = 父径 × profile.radiusRatio[level]
 * （**末端两级 [0.58,0.40] 陡减——垂索细化**）、末径 = 起径 × profile.endRatio[level]
 * （L5 末径恒地板 0.004m——索径 4–8mm 量级带记档）；子枝挂点内埋父径内（起点回退
 * 2.5×子径，杜绝接缝黑洞——树皮微起伏仅主干有效（抬档地板），≪ 内埋余量，接缝
 * 安全不变）；末两级 = **互生细长卡挂点**（黄金角螺旋散簇挂枝梢簇位）；通透过滤在
 * 收冠后统一执行，内层稀疏由密度场接管。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划
 * 抽稀（径向降段 + 站点隔 1 抽 1 + 未发射级跳过 emitTube）；簇决策/簇内候选生成与
 * 档位无关（发射省略不省略消费）。
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
      // 上举偏置随 t 增强（末段姿态——垂柳垂枝链：L1/L2 正值拱起 + L3/L4/L5 强负
      // 下垂（量级极端化首例）；喷泉主剪影由骨架侧驱动链承载：大值域角 + 挂高段
      // + 弱领导）
      d.add(UP.clone().multiplyScalar(spec.upturn * t * 0.5));
      d.normalize();
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
      BRANCH_V_SCALE,
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

  // ── 互生细长卡挂点（末两级 L4/L5）──
  // 散簇（家族「枝梢驱动叶簇」的垂柳语义）：枝梢 → 簇空间（⊥ 枝切向平面）→ 互生
  // 螺旋散排细长卡——L4 外段 1 簇 / L5 沿途外段 + 枝端共 2 簇（「叶沿垂索密排、互生
  // 错位」crown-a 双问 [6]——簇 = 末级垂索叶组的卡布置球）；**簇位点域外段化**
  // （clusterInnerStart L5 0.30 / L4 0.35——垂索长 → 簇沿索分布拉长覆帘幕纵深）；
  // 簇间间隙 = 「簇列距抑制」（拓扑相关处的父子/兄弟共位由簇级距离抑制保险，见下）
  const clusterCount = level === 3 ? profile.clustersL4 : level === 4 ? profile.clustersL5 : 0;
  if (clusterCount > 0) {
    const isL5 = level === 4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const leavesPerCluster = isL5 ? profile.clusterLeavesL5 : profile.clusterLeavesL4;
    for (let i = clusterCount - 1; i >= 0; i--) {
      // 簇沿枝 t：末位簇 = 枝端（t=1），其余在外段均匀散布（+抖动）；生成序枝端簇优先
      // （倒序）——散簇上簇级抑制先保证枝端簇位，沿途簇让位
      const spread = clusterCount === 1 ? 0.6 : i / (clusterCount - 1);
      const t = THREE.MathUtils.clamp(inner + spread * (1 - inner) + jitter(rng, 0.05), 0, 1);
      const attach = pointAt(t);
      // 簇方向承接挂点局部切向（簇-枝梢生长关系；t 端点自动退化为单侧差分）——垂柳：
      // 垂索切向近垂直向下 → 簇平面近水平 → 卡沿垂索放射下倾（垂帘挂点语言）
      const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      // 簇半径：profile 域抽样 × 挂簇枝长比例上限 cap（rng 先消费再 cap——消费次数恒定；
      //  短枝梢簇随之缩小：簇尺度随枝条活力，且同枝两簇中心距 > 半径和——簇间间隙成立）
      const radius = Math.min(
        (profile.clusterRadiusMinL5 + rng() * profile.clusterRadiusSpanL5) *
          (isL5 ? 1 : profile.clusterRadiusScaleL4),
        length * profile.clusterRadiusLengthCap,
      );
      // 簇中心 = 挂点沿簇方向前移（极近——簇坐枝梢稍前方，叶量越枝端；垂柳 = 沿索
      // 下 slope 前移的弱表达）
      const center = attach.clone().addScaledVector(tangent, radius * profile.clusterForwardOffset);
      // 簇级显式剔除：与已保留簇中心距 < clusterMinSeparation×(ri+rj) 的簇位丢弃（父子/
      // 兄弟枝梢拓扑共位——后生成者让位；垂柳 = 垂帘列距抑制——帘幕列间隙 0.1–0.25
      // 的下界保险）；簇位与叶片 rng 仍无条件消费，消费次数与数据分支无关（确定性纪律）
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
      // 散簇平面基（⊥ 簇方向 = 挂点枝切向——垂索近垂直 → 簇平面近水平的卡布置面）
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0); // 近铅垂切向的确定性回退
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      for (let j = 0; j < leavesPerCluster; j++) {
        // 互生螺旋方位：黄金角步进 + 抖动（「叶沿垂索互生错位」crown-a 双问 [6]——
        // 单叶系互生主流语言继承 platanus/triadica：互生叶序的螺旋错位，vs 女贞
        // decussate 对生（对生为女贞私有语言不继承））
        const phi = j * GOLDEN_ANGLE + jitter(rng, PHYLLO_JITTER); // 1 次
        const wobble = randUnit(rng); // 2 次（互生自然不齐的弱球面抖动）
        // 外壳偏置：r̂ = mix(1−shellBias, 1, rng^γ)——互生叶位宽域平摊分布（簇心 = 枝梢位）
        const rhat =
          1 - profile.clusterShellBias + profile.clusterShellBias * Math.pow(rng(), profile.clusterShellGamma); // 1 次
        // 互生偏移方向：簇平面辐射 + 沿枝向前倾（FORWARD_TILT——卡位沿索下移）+ 弱抖动
        const offsetDir = u1
          .clone()
          .multiplyScalar(Math.cos(phi))
          .add(u2.clone().multiplyScalar(Math.sin(phi)))
          .add(tangent.clone().multiplyScalar(ALT_FORWARD_TILT))
          .add(wobble.clone().multiplyScalar(ALT_WOBBLE))
          .normalize();
        const cardCenter = center.clone().addScaledVector(offsetDir, rhat * radius);
        // 卡尖方向：辐射外向 + **沿索切向下倾（STRAND_TILT——「叶尖沿索轴朝下、部分微
        // 外翻」Spec 终审补强 [6] 的卡向弱表达，替代先例 PLANE_LIFT 平展上举：垂柳叶
        // 不平展上举而沿索垂排；0.38 < 1 保证卡根朝簇心判定恒真）**
        const cardDir = offsetDir.clone().add(tangent.clone().multiplyScalar(STRAND_TILT)).normalize();
        let side = cardDir.clone().cross(UP);
        if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
        side.normalize();
        const roll = rng() * Math.PI; // 卡面滚转（取向随机——打散规则感；家族共性沿用）1 次
        side.applyAxisAngle(cardDir, roll).normalize();
        // 卡根朝内：cardDir 与簇内偏移方向反向时 dir/side 同取负（卡面不变、根尖互换、
        // 法线不变），叶尖恒指簇外——「叶自枝梢节位向外生长」读向（根边 uv v=0 =
        // 叶基 = aBend 低端 = 材质 SDF 叶基域低端）
        if (cardDir.dot(offsetDir) < 0) {
          cardDir.negate();
          side.negate();
        }
        // 尺寸/aLeafRand 抽样无条件消费（含被剔除簇位——消费次数与 kept 分支无关，
        // 调 clusterMinSeparation 等参数时保留簇随机流不重排——确定性纪律）；
        // 长宽比变域消费（leafAspectSpan 10——真叶狭披针域 8–18 冻结接口域如实映射）
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
        // 延伸枝：延续父向 + 近延续游走（**垂柳分化：up kick 0.05——垂坠末梢不被上踢**
        // （vs 家族 0.18 上扬延续），喷泉垂帘的末级路径方向连续性）
        childDir = tTan.clone().add(UP.clone().multiplyScalar(TIP_UP_KICK)).add(randUnit(rng).multiplyScalar(0.25)).normalize();
      } else {
        // 侧枝：方位按父相位角均分展开（冠向四周填充 + 抖动）；**上举域层级分档（垂柳
        // 分化位）**：拱层级（父 L1/L2——level ≤1）侧枝高举 0.2–0.55（外展-拱起半拱层）
        // / 垂帘层级（父 L3/L4——level ≥2）侧枝低举 0.05–0.23（垂索平射后坠——帘幕列
        // 紧致、横向外泄受控；rng 消费次数恒等——分档只改系数不改变消费结构）
        childPhase = phase + i * plan.phaseStep + jitter(rng, 0.35);
        const h = new THREE.Vector3(Math.cos(childPhase), 0, Math.sin(childPhase));
        const [upBase, upSpan] =
          level <= 1 ? [ARCH_LATERAL_UP_BASE, ARCH_LATERAL_UP_SPAN] : [CASCADE_LATERAL_UP_BASE, CASCADE_LATERAL_UP_SPAN];
        childDir = h
          .clone()
          .multiplyScalar(0.8)
          .add(UP.clone().multiplyScalar(upBase + rng() * upSpan))
          .add(tTan.clone().multiplyScalar(0.25))
          .normalize();
      }
      const lenRatio = profile.lengthRatioBase + rng() * profile.lengthRatioSpan + (level + 1) * 0.03; // 逐级长度衰减（垂柳末级加长链——垂幕路径预算）
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
