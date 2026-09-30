/**
 * runtime/procedural/tree/bungeana/bungeanaGeometry —— 白皮松
 * （*Pinus bungeana* Zucc. ex Endl.，松科松属常绿乔木、中国特有）
 * CPU 几何生成器（T012.4 Step 3a，**针叶家族 conifer 第四实例——契约定稿态增量消费**：
 * 方法 = 族内先例复制（012.4 待裁决位 5——几何管线〔growBranch 递归 / 层位退化骨架 /
 * 簇布点 / 卡挂点 / 锥度管发射 / 平行传输标架 / minY 贴地 / 属性契约〕复制自雪松
 * cedrusGeometry + 水杉 metasequoiaGeometry + 圆柏 juniperusGeometry 经三例验证的方法；
 * 挂点语言按白皮松**散生连续冠 + 三针束聚合卡 + 开张卵圆→伞形平顶冠谱系 + 双态两年熟
 * 低量果账目 + 干基弱膨**改写〔Step 1 判定 1–10〕；cedrus/metasequoia/juniperus 四件
 * 零触碰）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的
 *      **高度域连续散生分枝拓扑**（层位字段退化消费——判定 1 直承 012.3 路径零契约
 * 新增）→ 锥度管状枝干（平行传输标架）→ 末两级**三针束聚合卡散生挂点**（1 卡 =
 * 末级枝段多束聚合：束真实 5–10cm 亚像素、卡 0.26–0.32 m 族终值带直采；束内 3 针
 * 扇形开展 + 束螺旋排列 + 束间距 ≈针长 1/3–1/2 = **SDF 内部近景身份（3b 承载）**，
 * 非簇级挂点语言——判定 3 层级分工记档；rng 方位散布 + clusterInnerStart 挂点前移 +
 * clusterMinSeparation 低抑制 + **交叉双卡**——中距浓密板三杠杆全用〔判定 4〕）+
 * **开张卵圆→伞形平顶冠包络**（tierRadiusTaper + tierProfileExponent 组合——伞形
 * 平顶端 = **exp<1 新端型首用**：顶层半径近等宽外抛 + 顶平截读向，判定 2/Unknown ⑥）+
 * **双态两年熟低量果账目**（零 rng——koelreuteria posHash 账目法；一年生绿幼果主导
 * 〔直立初相〕+ 少量近熟淡绿-黄褐〔下垂相〕——「幼果初直立、熟果下垂」FRPS 着生律
 * 的姿态侧语言），产出树皮/叶卡两层非索引几何；层间 mergeGeometries(useGroups=true)
 * 恰 2 组（D15 免组膨胀：皮 0 / 叶卡 1——**果卡入皮组**：uv v 域身份标记 +
 * aLeafRand/aBend 随组恒 0，材质按 v 域分流配方——双帧域冻结接口②见任务派遣简报，
 * 与 bungeanaMaterials 并行交付）。
 *      形态参数类型 = 针叶家族契约 ../conifer/coniferShapeProfile（定稿 80 位
 * ——012.2 转正；白皮松 = 第四实例定稿态增量消费），数值与槽组合见
 *      ./bungeanaShapeProfile（全部数值依据 docs/research/bungeana-reference.md
 * Spec **@1.1** 含终审记档）；build 只做 slot → profile 路由
 * （assets/asset_tree_bungeana），不进 ProceduralBuild 公共签名。
 *
 * ── 白皮松身份核心（Step 1 判定 → 几何落点，vs juniperus 管线差异清单）──
 *   1. **散生连续冠骨架（判定 1——退化消费四杠杆，012.3 路径直承）**：tierCount 10
 *      密层 + tierSpacingJitter 0.50 大抖动破层（11.5 m 树 ≈0.75 m 名义层距 →
 *      ±0.37 m 抖动 ≈ 层距半程 = 高度域连续散布）+ tierGapBand 0 零端（密度场整场
 *      短路——疏散半透光冠〔4 照片 8 问全一致〕的连续分布，vs 雪松层隙带）+
 *      tierPhaseStagger/clusterAzimuthStep 双省略（散生 = rng 任意方位）+ 层间随机旋
 *      （逐层 tierRot = rng()×2π——散生 rng 方位散布主消费，跨层去相干 → 全冠方位
 *      均匀化）。**vs juniperus：机制逐项同源（第三型骨架直承），差异全落连续参数**
 *      （层角梯度 65→35 开张带 / 枝较细长 tierBranchRadiusRatio 0.40 / 先端上翘拱起）。
 *   2. **开张卵圆→伞形平顶冠包络（判定 2——第 4 冠轮廓包络型）**：层半径沿高 =
 *      mix(1, tierRadiusTaper, u^tierProfileExponent)——宽塔幼态 slot-1（taper 0.40
 *      × exp 1.30 急收塔）↔ 开张卵圆 slot-0（0.55 × 1.6 中下部最宽卵形权重）↔
 *      **伞形平顶 slot-2（0.85 × 0.90——exp<1：半径沿高凸增，顶层近等宽外抛 +
 *      tierAngleTop 55 平展 + leader 0.04 顶梢最短 = 顶平截读向）**。**冠顶 = 解析
 *      冠顶适配**（vs juniperus 单常数 1.45 预留：白皮松冠幅/树高比 0.60–1.25 +
 *      层角谱系 48–80° 跨度下单常数无法跨槽落高——逐层解析爬升 + 层发射位 K(θ)
 *      包络归一 + 跨度下限收缩三机制，见 buildBungeanaGeometry 层位退化路由段与
 *      常数注；实测 8 槽树高涌现 ⊂ ±3.2%、冠幅比涌现 ⊂ ±11%——族先例级涌现带）。
 *   3. **三针束聚合卡（判定 3——第 4 叶语言，束生短枝单律）**：卡 = 末级枝段多束
 *      聚合单元（卡长 0.26–0.32 m 族终值带直采；真束 5–10 cm × 束间距 2–5 cm →
 *      真束 5–16/卡 → SDF 抽象 rosetteNeedles 12——SDF 内部束密度不随卡尺度稀释）；
 *      **散生单针通路不实现**（needleCardLen 与 longShootCards 两组零值占位——束生单律
 *      负证据记档，vs 雪松长短枝双挂点 / 圆柏刺叶 minority 双叶型）；卡姿 = 径向
 *      放射主导 + 全方位斜立倾侧（放射蓬松刷状——vs 圆柏绳卡沿枝前向主导 0.55：
 *      FASCICLE_RADIAL 0.82 / FASCICLE_FORWARD 0.30 的姿态分化）+ 滚转打散；
 *      **交叉双卡**（第二卡绕卡轴转 90°，零 rng 派生）；挂点前移 clusterInnerStart
 *      0.15/0.13（疏散冠外段受光集中——三杠杆之三）。
 *   4. **双态两年熟低量果账目（判定 6——零 rng posHash 账目法）**：结果位 = L5 末级
 *      枝外段（coneFruitingZone 0.72 起单生 1 位/枝——FRPS「球果通常单生」）× 上半
 *      冠门控 → posHash 排序 + coneKeepRatio 0.22 低量抽选 → **双态分类**
 *      （classRoll < coneClassRatio 0.25 → 近熟淡绿-黄褐少量 / 其余一年生绿幼果主导
 *      ——**classRatio 反向档 vs 圆柏熟果主导 0.75**；「两年熟 → 生长季树上恒有
 *      一年生绿幼果」FRPS 机制）+ **双态姿态**（幼果直立微外倾 / 近熟下垂外倾——
 *      「初直立，后下垂」着生律的姿态侧语言）+ 双态分带尺寸（幼果 1.2–2.0 cm /
 *      近熟 2.8–4.8 cm——域 ⊂ profile coneSize 域的分带消费）+ 4 tri/果入皮组
 *      （近景点彩级——中距亚像素，判定 6 消费分级）+ uv v∈[1,2)（冻结接口②）+
 *      **u 色档域双态编码**（u ≥ 0.5 近熟 / u < 0.5 幼果——juniperus 先例名路线，
 *      零新增 attribute）。
 *   5. **slot-7 多干近似（判定 1 多干双态评估——纯连续参数组合零契约修订）**：
 *      低位粗枝上举渐近（trunkHeightRatio 0.25 低位端 + tierAngleBase 48° 上举陡端
 *      + tierRank 双强 1.50/1.38 × 起径 1.40/1.28 + 拱起 0.09）——双低位主枝粗壮
 *      上举成双干观感（s08 型 30–45% 高度分叉外张伞状）；真近基并立型（s01 型
 *      <10% 高度分叉）不可承载 = D31.2 候选归族门 012.5（bungeanaShapeProfile
 *      模块头记档）。几何侧零专路代码——slot 参数直读。
 *   6. **干基弱膨 ≤1.3**（Spec §干基 Inferred）：trunkFlareRatio 1.06–1.24 低值带
 *      × exp(-7t) 快速衰减——圆柏同款弱膨机制第三例。
 *
 * ── 预算锁定账目（LOD 已锁 conifer 行：High ≤ 40000 / Mid 6000–10000 /
 *    Low 1500–3000 / Canopy ≤ 500——T012.1 锁定，非候选带流程（012.4 待裁决位 2）；
 *    实测记档 = **Step 3a 初版探针 2026-09-30**〔Step 4 密度校准回路开放——出带调
 *    簇密度或抑制，计数类全槽同调不破恒等〕，回写 ../assets/asset_tree_bungeana.asset
 *    模块头〕──
 *    8 槽 × 3 档实测带：**High 31548–37108**（皮恒 16996 + 束卡 7134–9914 张 ×2
 *    + 果 50–71 枚 ×4；slot-6 疏冠 canopyDensity 0.80 带剔除最多最低 / slot-7 多干
 *    近似 rank 双强冠域最密最高——survival 由通道/抑制/密度 roll 决定）；**Mid
 *    6544–7846**（皮恒 2850 + 存活簇位 /4 × 交叉双卡 + **果省略**〔近景点彩级——
 *    幼果 1–2 cm 中距亚像素，非身份信号 vs 圆柏浆果双熟度身份信号 Mid 全量保留的
 *    取舍差异〕）；**Low 2592–2758**（皮恒 762 + 壳卡 = ⌈保留簇/5⌉ × 2、果省略同
 *    Mid）；rng 消费 slot-0 三档恒等 **51863**（快照锁——果账目零 rng；包裹闭包
 *    逐调用计数）、minY 三档恒 0；slot-0 High 总面 **36752** = 皮 16996 + 束卡
 *    9750×2 + 果 64×4（meta triangleCount 实数）；树高涌现 8.59–13.55 vs 锚
 *    8.5–14（⊂ ±3.2%——解析冠顶适配实测带，见判定 2 落点段）、冠幅比涌现 ⊂
 *    ±11%（族先例级涌现带——juniperus +8.7%/+12% 记档同量级）。
 *
 * 结构计数（皮拓扑槽间恒定 → 皮面数恒等；配置侧基数 16884 = bungeanaShapeProfile
 *      模块头算术——trunk 364 + L1 20 管 1960 + L2–L5 2400/3200/3840/5120）：实测
 *      皮恒 **16996** = 基数 16884 + 顶梢管 98（levels[0] 同规格计入 L1——21 管）
 *      + 主干底盖 14（radial 14——封顶视空洞，家族先例同构）；束簇位标称 5128
 *      （L5 320×12 + L4 160×8 + 顶梢 8）为计数类（rng 消费次数恒定的固定计数），
 *      保留簇数与实际卡数随 seed 由簇级抑制 + 通透规则确定（同槽同 seed 恒等——
 *      确定性不破）。
 * 确定性纪律（家族纪律沿用）：簇生成的 rng 消费为无条件固定次数（每束簇位 7 次：
 *      t/尺寸/方位/倾侧/滚转/rand/轮廓比——被抑制丢弃的簇位足额消费后丢弃）；通透
 *      roll 每卡无条件 1 次；**果账目零 rng**（posHash 确定性布点）；rng 消费总数 =
 *      结构固定段 + 通透 roll 段（计数 = 存活候选卡数——随保留簇数浮动，家族先例
 *      同机制）。
 * 叶卡属性契约（008.3 家族冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐卡 ∈ [0,1)（逐卡种子——风动 flutter 相位
 *        变奏源，消费语义归 3b；实例级 aSeed 归 Runtime/D20.4，几何零 aSeed 顶点
 *        属性）；皮组（含果卡）恒 0；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，**沿枝弧长 0→1 弯曲权重（末级最大）**
 *        （T012.4 冻结接口③）：根边 = (0.10 + 0.42×t)×lf / 尖边 = 根 + 0.28×lf
 *        （t = 簇位沿枝弧长；lf = 末级权重——L5/顶梢 1.0、L4 0.72），卡内根→尖
 *        非降；树皮层同名属性写恒等值 0（**果刚性**——aBend 随组恒 0，摆动语义归
 *        材质层/缺口候选，cedrus/juniperus 同判）。
 * uv 双帧域（**T012.4 冻结接口②——材质判别阈值 1.0**）：束卡 v∈[0, 0.99]（根→尖
 *      帧——尖端取 0.99 不取 1.0 整：1.0 判别阈值的安全边距，卡内帧线性 0→0.99、
 *      1% 压缩不可辨）/ 果卡 v∈[1.0, 1.95]（沿果轴帧；**双态分类走 u 色档域**——
 *      u ≥ 0.5 近熟淡绿-黄褐 / u < 0.5 一年生绿幼果〔juniperus 先例名路线——零新增
 *      attribute、零新增 v 阈值〕，带内色档 posHash 逐果；根 1.0 恰落阈值判据
 *      v ≥ 1.0 的果侧 ✓）/ **皮管域 v ∈ [0, TUBE_V_MAX=0.92] 逐管归一**（果域自
 *      1.0 起——水杉防线全程推广：主干与全部枝管均按全弧归一到 0.92 < 1.0，任意槽
 *      树高/冠幅组合下皮管域与器官域恒隔离——3b 树皮斑驳 SDF 的 v 向频率按逐管
 *      归一口径定档）；主干底盖 uv 盘半径 0.4（v ≤ 0.9——同阈值防线）。
 *      **vs juniperus 三级帧域：本资产无双叶型 → 刺卡帧 v∈[2,3) 缺席——双帧域
 *      （束卡/果卡），3b 材质判别阈值 1.0（冻结接口②）**。
 * LOD 三档（家族方法复制：level 为 Runtime 可选参数——不参与 shapeSlot/morphSeed/
 *      sourceKey 形态身份计算）：三档共用**同一条 rng 消费流**与同一套骨架/簇位/
 *      器官决策路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/簇位
 *      照常足额消费 rng（三档 rng 消费总数恒等），枝路径/簇位/通道过滤/器官决策
 *      逐位同源：
 *      - High：全发射（缺省档；皮 16996）；果全量（近景点彩级低量——High 独有，
 *        Mid/Low 省略记档）；
 *      - Mid：径向段数降（14/7/6/5/4/4 → 6/5/4/3/3/3）+ 轴向站点隔 1 抽 1 +
 *        L4/L5 末级细管不发射（末级径 ≈4–6mm，Mid 观距亚像素；簇位照常派生）+
 *        **站点级隔 3 抽 1 保交叉双卡**（siteOrdinal % 4 === 0 的簇位整簇保留双卡
 *        ——「交叉双卡 High/Mid 保留」的 Mid 实现；%4 = 束簇位量级 5128 + 果省略
 *        的 Mid 带适配〔同 juniperus %5 位〕，角覆盖与面数同守；存活卡 ⊂ High
 *        存活卡逐位同位）+ **果省略**（近景点彩级非身份信号——vs 圆柏浆果 Mid
 *        全量的取舍差异记档）；皮 2850；
 *      - Low：主干 + L1 层枝极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng/
 *        派生簇位）+ 冠 = High 簇位表驱动的壳层卡（**每保留簇 1 张切向竖卡 × 隔
 *        5 簇抽取**（stride 5——簇位量级 5000+ 的预算适配，家族校准同款）× 半幅 =
 *        簇半径 + LOW_SHELL_MARGIN 0.20（束簇半径 0.13–0.16——壳卡体量 0.33–0.36
 *        半幅，远距剪影连续）；aBend 沿用簇位弧长权重（clusterBends 平行账——沿
 *        枝弧长语义 Low 不失）；**壳卡走束卡帧 v∈[0, 0.99]**（整簇抽象 → 材质 Low
 *        档束 SDF 同帧——「Low 单卡」冻结接口）；皮 762。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随
 *      调用移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 0）；叶法线取卡面单侧。
 * 风动 attribute 契约（家族先例）：几何携带 aLeafRand/aBend（皮组恒 0 实心）；
 *      树高锚 = profile.totalHeight 同源（3b 材质消费，无独立锚；**两成分消费——
 *      整冠低频慢摆 + 末级枝/束高频小幅颤**〔硬针小惯量读向——判定 9〕，顶梢成分
 *      不进本资产〔windLeader* 零占位〕）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BUNGEANA_SLOT0_PROFILE } from './bungeanaShapeProfile';
import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙；bend 随候选携带） */
interface FoliageCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖 = 束簇放射外伸方向）
  side: THREE.Vector3; // 卡宽方向（滚转后）
  width: number;
  height: number;
  rand: number; // aLeafRand（逐卡种子）
  clusterIndex: number; // 所属簇位（束卡 ≥ 0 归簇账）
  /** 簇/枝内候选序（Mid 站点掩码 % 4 === 0 的选择位——束卡枝端簇优先序） */
  emitOrdinal: number;
  /** aBend 沿枝弧长权重（冻结接口③——根/尖两值随候选携带，烘焙直读） */
  bendRoot: number;
  bendTip: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径——束簇的簇空间。
 *  T021.6 家族共享契约同构（canopy proxy 消费——BroadleafClusterRecord 字段兼容） */
type ClusterRecord = BroadleafClusterRecord;

/** 枝干发射槽：非索引三角形流（pos/normal/uv 三数组同步追加——果卡同槽） */
interface BarkSink {
  pos: number[];
  nrm: number[];
  uv: number[];
}

/** 枝干通道线段（点到线段距离 < r 即硬抑制——疏散冠露干的通透规则） */
interface ChannelSeg {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  r2: number; // 半径平方（判定预热）
}

/** 果候选位（账目原料：L5 末级枝外段结果带——posHash 排序抽选后成卡） */
interface ConeCandidate {
  x: number;
  y: number;
  z: number;
  /** 所属层位的相对高度（上半冠门控用——挂点高/主干顶） */
  heightFrac: number;
}

/** 构建上下文：发射槽 + 簇表 + 候选叶卡 + 通道表 + 逐级统计 + 果候选（全树共享） */
interface BuildCtx {
  bark: BarkSink;
  clusters: ClusterRecord[];
  clustersCulled: number; // 簇级距离抑制丢弃的簇位数（工程账目）
  /** 逐保留簇的 aBend 根权重（沿枝弧长——Low 壳卡沿用，平行账不进共享簇记录） */
  clusterBends: number[];
  leafCandidates: FoliageCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含顶梢枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点
  /** 逐层账目（层角梯度 + 散生方位证据）：每层枝初向自垂直角（度）均值 / 方位（弧度） */
  tierAngles: number[];
  tierAzimuths: number[][];
  coneCandidates: ConeCandidate[];
  /** 顶梢账目（通直证据）：顶梢最高站 Y / 末站 Y（leaderDroop 0 → peak ≈ tip） */
  leaderPeakY: number;
  leaderTipY: number;
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface BungeanaGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 叶卡三角（cards × 2——组 1 纯卡） */
    needleTriangles: number;
    needleCards: number;
    /** 通透账目：候选数与两规则的剔卡数（通道 > 层隙密度场——首个命中计；
     *  tierGapBand 零端消费 → 密度场整场短路（canopyDensity < 1 槽的 roll 剔除
     *  计入 gapRejects——疏密槽 slot-6 的读数面） */
    needleCandidates: number;
    channelRejects: number;
    gapRejects: number;
    /** 主次分级证据：各级枝数与平均起径（米；L1 含顶梢枝） */
    levelBranches: number[];
    levelMeanStartRadius: number[];
    /** 层结构账目（退化消费证据）：层挂高（米，贴地平移前）/ 名义层间距 / 冠半径 */
    tierHeights: number[];
    tierSpacingMean: number;
    crownRadius: number;
    /** 层角梯度证据：每层枝初向自垂直角均值（度——base > top 单调降） */
    tierAngleMeans: number[];
    /** 散生方位证据：每层枝方位（弧度 ∈ [0,2π)——层内对差 ≈ π、跨层随机旋去相干） */
    tierAzimuths: number[][];
    /** 顶梢通直证据：peak ≈ tip（leaderDroop 0——无点头读向） */
    leaderPeakY: number;
    leaderTipY: number;
    /** 层隙带证据（零端消费对照读数：带内/带外候选与存活——带外存活率 ≈ 带内 = 连续分布） */
    bandCandidates: [number, number];
    bandSurvived: [number, number];
    /** 果账目（零 rng——确定性账目）：候选池（门控后）/ 各态烘焙数 / 三角 */
    coneCandidatePool: number;
    conesMature: number;
    conesYoung: number;
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

/** x → [0,1)（确定性散列分量——果账目零 rng 的布点源） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

/** 位置确定性散列（salt 分通道——果排序抽选/分类/色档/姿态/尺寸共用，零 rng） */
function posHash(x: number, y: number, z: number, salt: number): number {
  return fract01(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + salt * 53.71) * 43758.5453);
}

// ── 散生连续冠形态常数（工程设定——几何私有算法面；Spec 依据见 bungeanaShapeProfile
//    逐字段，此处只放机制增益与结构常数；探针校准记档见模块头）──────────────────────

/** L1 层枝长 / 层半径（层板外缘由 L2 延伸枝补满） */
const TIER_BRANCH_LENGTH_FACTOR = 0.78;
/** 层板拱起增益（tierPlateArch × 此值 = 行走方向每步的向上速度分量幅度——先端上翘弱拱） */
const TIER_ARCH_GAIN = 0.8;
/** 层板外缘下卷增益（tierEdgeDroop × 此值 = 外段（t>0.45 平滑过渡）向下速度分量幅度） */
const TIER_EDGE_GAIN = 1.4;
/** 逐过渡级子枝长比（L1→L2 … L4→L5——疏散冠体积填充链的长度衰减；末级偏高 = 细长
 *  直伸段。vs juniperus [0.44, 0.5, 0.66, 0.95]（8m 小树末级抬高补偿）：白皮松
 *  8.5–14m 级天然枝长更长，末级比沿家族中带（0.46/0.52/0.68/0.92）——L5 ≈
 *  0.55–1.1 m × 12 簇位沿枝散开（束簇 0.13–0.16 半径的部分重叠 = 交叉双卡统计
 *  覆盖的设计域，簇级抑制 0.02 只剔除近重合） */
const CHILD_LENGTH_RATIO = [0.46, 0.52, 0.68, 0.92] as const;
/** 子枝长比抖动幅度（±） */
const CHILD_LENGTH_JITTER = 0.12;
/** 逐过渡级子/父起径比（低级陡末级缓——主次分级；细长枝链：L1 ≈3–4cm → L5 ≈4–6mm） */
const CHILD_RADIUS_RATIO = [0.5, 0.58, 0.62, 0.66] as const;
/** 逐级末径/起径比（L1 通体顺收 → 末级收细；地板 0.004 同家族） */
const LEVEL_END_RATIO = [0.45, 0.5, 0.55, 0.6, 0.65] as const;
/** droop 链增益（levels[].droop × 此值 × t = 每步向下速度分量——细长直伸-端部微垂链） */
const DROOP_GAIN = 1.0;
/** 顶梢下垂增益（leaderDroop × t² × 此值——白皮松 0 占位短路，常数沿家族保留位） */
const LEADER_DROOP_GAIN = 4.0;
/** 顶梢初向水平分量（近直立微倾——通直干顶延伸；家族同值） */
const LEADER_TILT = 0.1;
/** 顶梢干顶预留系数（主干顶 = 树高 − 顶梢段长 × 此值 ≈ 顶梢平均升角的余弦补偿） */
const LEADER_RISE_FACTOR = 0.9;
/** 层半径包络归一（探针拟合 2026-09-30）：层枝长 0.78×tierR + 延伸链向外累积
 *  → 实测冠包络涌现比 K(θ) ≈ 2.45×sin(自垂直角) − 0.96（近水平角放大约 1.46×
 *  ——白皮松层角谱系 48–80° 跨度下单常数无法跨槽落包络，vs juniperus 全槽
 *  55–30° 窄谱系可单因子记档 +12% 涌现）。层半径发射位 = profile 包络 / K(θ)
 *  逐层归一（伞形平顶端 exp<1 的近等宽外抛不被链涌现再放大）；**只收缩不放大**
 *  （clamp ≤ 1.0）：陡角端（θ < 62°）拟合域外推不可信——放大发射位会把冠顶
 *  爬升预留推爆（trunkTopY 塌缩实测记档），陡角层直接以包络值发射（涌现 <1 的
 *  轻度欠包络由槽底部层主导 bbox，读向无害）。012.2/012.3 密度校准先例同型
 *  手法——几何私有标定，profile 语义值不动） */
function tierLaunchFactor(angleDeg: number): number {
  const k = Math.max(1, Math.min(1.5, 2.45 * Math.sin(THREE.MathUtils.degToRad(angleDeg)) - 0.96));
  return 1 / k;
}
/** 延伸链解析爬升系数（冠顶适配模型核心——探针验证 ±5% 内吻合 8 槽实测爬升）：
 *  L1 之后的 ts=1.0 延伸枝链逐级叠加 +0.15 上举混合 → 链逐级陡化 ≈15°/级；
 *  累计爬升 / L1 长 = Σ (链长乘子 × cos(θ − 15°×级))，链长乘子 = CHILD_LENGTH_
 *  RATIO 累积（末级 × fringeLengthRatio）。WANDER_ALLOWANCE = 游走 + 拱起的
 *  随机上浮余量（实测中带 ×1.06）。 */
const CHAIN_STEEPEN_DEG = 15;
const CLIMB_WANDER_ALLOWANCE = 1.06;
function chainClimbFactor(angleDeg: number, fringe: number): number {
  const cos = (d: number): number => Math.cos(THREE.MathUtils.degToRad(Math.max(d, 0)));
  return (
    cos(angleDeg) +
    CHILD_LENGTH_RATIO[0]! * cos(angleDeg - CHAIN_STEEPEN_DEG) +
    CHILD_LENGTH_RATIO[0]! * CHILD_LENGTH_RATIO[1]! * cos(angleDeg - 2 * CHAIN_STEEPEN_DEG) +
    CHILD_LENGTH_RATIO[0]! * CHILD_LENGTH_RATIO[1]! * CHILD_LENGTH_RATIO[2]! * cos(angleDeg - 3 * CHAIN_STEEPEN_DEG) +
    CHILD_LENGTH_RATIO[0]! *
      CHILD_LENGTH_RATIO[1]! *
      CHILD_LENGTH_RATIO[2]! *
      CHILD_LENGTH_RATIO[3]! *
      fringe *
      cos(angleDeg - 4 * CHAIN_STEEPEN_DEG)
  );
}
/** 冠顶适配跨度下限比（层域塌缩护栏：span < 此比 × 可用高时等比收缩层发射位
 *  ——多干近似槽 rank 双强链爬升 > 可用高的保底路径） */
const CROWN_MIN_SPAN_RATIO = 0.1;
/** 顶梢束簇数（固定计数——防裸梢 + 束卡同管线；结构计数类：槽间恒等） */
const LEADER_FASCICLE_CLUSTERS = 8;
/** 顶梢束簇挂点 t 域下限（沿顶梢弧长——顶梢下半段留给干顶收细；家族同域） */
const LEADER_FASCICLE_INNER = 0.2;
/** 皮管 v 域归一上限（逐管归一——双帧域果卡自 1.0 起的必要防线，见模块头） */
const TUBE_V_MAX = 0.92;
/** 层隙空带密度地板（tierGapBand > 0 时的空带核心保留率——白皮松零端短路不走此分支，
 *  常数沿家族机制保留位） */
const TIER_GAP_FLOOR = 0.05;
/** 主干根径 / 树高（等比干径——8.5–14m 槽跨度；11.5m → 0.17–0.22m；工程设定，
 *  DBH 无 Spec 数值） */
const TRUNK_BASE_FACTOR = 0.015;
const TRUNK_BASE_SPAN = 0.004;
/** 束卡径向放射分量（**放射蓬松刷状**——束簇自枝周全方位放射：vs 圆柏绳卡前向
 *  主导 0.55 / 径向 0.70 的姿态分化〔判定 3 卡构成差——蓬松放射刷 vs 绳列贴枝〕；
 *  斜伸方位多样性由 rng 方位 + 滚转承载） */
const FASCICLE_RADIAL = 0.82;
/** 束卡沿枝前向分量（弱串联——束沿末级枝段螺旋排列的聚合卡弱延伸读向） */
const FASCICLE_FORWARD = 0.3;
/** 束卡倾侧 rng 域宽（全域 ± 一半 = ±0.7 上下对称——全方位斜立带；juniperus 密度
 *  校准终值同款：消除低机位近水平卡面的系统性薄片化） */
const FASCICLE_TILT_SPAN = 1.4;
/** 束卡 aBend 末级权重（lf——末级最大：L5/顶梢 1.0、L4 0.72） */
const FASCICLE_BEND_LF_L5 = 1.0;
const FASCICLE_BEND_LF_L4 = 0.72;
/** 束卡帧尖端 v 值（0.99——**1.0 判别阈值的安全边距**：尖端若取 1.0 整则束卡尖
 *  顶点会被 v ≥ 1.0 判进果域；卡内帧线性 0→0.99，3b 侧按 v/0.99 归一或直接
 *  消费——1% 线性压缩不可辨） */
const CARD_V_TIP = 0.99;
/** 果结果位上半冠门控（挂点高 ≥ 主干顶 × 此值的层位 L5 末级枝为结果候选枝——
 *  「幼果初直立着生新枝端/近顶」的近顶读向；工程设定，量级定档载体见模块头果段） */
const CONE_CROWN_GATE = 0.5;
/** 果卡 SDF 余量（近卵球轮廓 → 方卡半幅 = 果径 × 此值 × 0.5——沿果轴帧留边） */
const CONE_CARD_SCALE = 1.15;
/** 一年生绿幼果分带尺寸（米——profile coneSize 域 [0.012, 0.048] 的幼果亚带：
 *  1.2–2.0 cm = Spec 幼果 ≈1–1.5 cm Verified + 帧幅容差；双态分带消费记档模块头） */
const CONE_YOUNG_MIN = 0.012;
const CONE_YOUNG_SPAN = 0.008;
/** 二年生近熟果分带尺寸（米——近熟亚带：2.8–4.8 cm = 成熟 5–7 cm〔Verified〕的
 *  生长季半熟外推 Inferred；上限 ⊆ profile 域 0.048） */
const CONE_MATURE_MIN = 0.028;
const CONE_MATURE_SPAN = 0.02;
/** 幼果直立微外倾幅度（「初直立」FRPS——竖直向上 + 微外倾水平分量；vs 近熟下垂） */
const CONE_YOUNG_LEAN = 0.22;
/** 近熟果下垂外倾幅度（「后下垂」——竖直向下 + 外倾水平分量；juniperus 浆果外倾同档） */
const CONE_MATURE_SAG = 0.35;
/** 果卡微沉（米——「短梗或几无梗」的贴枝落位；juniperus 无柄微沉同档） */
const CONE_SINK = 0.004;
/** 果 uv v 域帧（冻结接口②：v∈[1.0,1.95] 沿果轴单帧——根 base → 尖 tip；根 1.0
 *  恰落 v ≥ 1.0 的果侧 ✓）；**u = 双态分类 + 带内色档**（3b 冻结编码：u ≥ 0.5
 *  近熟淡绿-黄褐 / u < 0.5 一年生绿幼果——juniperus 先例名路线，零新增 attribute、
 *  零新增 v 阈值；带内色档 = posHash 逐果） */
const CONE_UV = { base: 1.0, tip: 1.95 } as const;
/** 果 u 色档域带（双态分类 + 带内变奏：young [0.02, 0.5) / mature [0.5, 0.98]） */
const CONE_U_YOUNG = { min: 0.02, span: 0.46 } as const;
const CONE_U_MATURE = { min: 0.52, span: 0.46 } as const;
/** Low 壳卡：每保留簇张数（1 = 单卡——「Low 单卡」冻结接口）与隔簇抽取步长
 *  （stride 5——束簇位量级 5000+ 的预算适配，家族校准同款） */
const LOW_SHELL_CARDS_PER_CLUSTER = 1;
const LOW_SHELL_STRIDE = 5;
/** Low 壳卡半幅余量（米）：束簇半径 0.13–0.16——壳卡体量 0.33–0.36 半幅由余量
 *  承担（远距剪影连续；极值叶尖仍由 High 决定冠包络） */
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
  /** 簇位级发射掩码（siteOrdinal % every === 0 的簇位整簇保留交叉双卡——候选生成/
   *  通透过滤/rng 消费对全簇位照常——Mid 存活卡 ⊂ High） */
  siteEmitEvery: number;
  /** Low 壳卡模式：不烘焙簇内束卡（候选/过滤/rng 照常），逐保留簇发射切向竖卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（预算记账 = 实测口径，正式预算带锁定见
 * ../assets/asset_tree_bungeana.asset 模块头）：
 * - High 皮 16996（拓扑恒等不动：主干 364 + 底盖 14 + L1 2058〔21 管 = 20 层枝 +
 *   顶梢，levels[0] 同规格〕+ L2 2400 + L3 3200 + L4 3840 + L5 5120）；果全量；
 * - Mid 皮 2850 = 主干 90（7 段 ×6 + 底盖 6）+ L1 840（21 ×4 段 ×5）+ L2 960
 *   （40 ×3 段 ×4）+ L3 960（80 ×2 段 ×3），L4/L5 不发射（末级径 ≈4–6mm 亚像素）；
 *   卡 = 存活簇位 / 4 × 双卡 + **果省略**（近景点彩级非身份信号——vs 圆柏 Mid
 *   全量的取舍差异记档）；
 * - Low 皮 762 = 主干 90 + L1 672（21 ×4 段 ×4）；叶 = 保留簇 / 5 × 2 三角
 *   （单切向竖卡）；果省略。
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
    // ≈4–6mm，Mid 观距亚像素；簇位照常派生）+ **站点级隔 3 抽 1（siteOrdinal % 4
    // === 0——整簇保留交叉双卡**：单面卡无角度覆盖，Mid 抽 3/4 簇位保对卡，角覆盖
    // 与面数同守〔束簇位 5128 + 果省略的 Mid 带适配〕）+ 果省略（近景点彩级——
    // 幼果 1–2cm 中距亚像素，非身份信号）
    return {
      radial: [6, 5, 4, 3, 3, 3],
      stationStep: [2, 2, 2, 2, 2, 2],
      emitTube: [true, true, true, false, false],
      siteEmitEvery: 4,
      shellCards: false,
    };
  }
  // Low：主干 + L1 层枝极简管（径向 6/4）；L2–L5 不发射（递归照常走完消费 rng/
  // 派生簇位）；冠层转壳卡模式（单切向竖卡 × 隔 5 簇抽取——「Low 单卡」冻结接口）；
  // 果省略（远距亚像素——记档同先例）
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

// ── 锥度管发射（家族方法复制：平行传输标架 + 外向绕制四边形；无树皮起伏——白皮
//    第 17 树皮语言〔白基调多色斑驳薄片剥落〕为纯材质语言（ConiferBarkProfile
//    全组 3b 消费——株内「上白下深」大梯度 = 3b 沿干高度梯度），几何侧零起伏场。
//    **v 域逐管归一**：vScale = TUBE_V_MAX / 全弧长——双帧域果卡自 1.0 起，任意
//    管长按比例缩放恒落 [0, 0.92]（水杉防线的全程推广）──────────────────────────────

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

// ── 双态两年熟低量果账目（零 rng——koelreuteria 账目法改写；「足额候选 posHash
//    排序 + keep 抽选」；双态分类 + 双态姿态〔幼果直立 / 近熟下垂〕+ 分带尺寸 =
//    白皮松改写，vs 圆柏无柄腋生双熟度 / 雪松直立如烛 / 水杉长柄下垂）────────────────

/** 果烘焙卡原料（账目抽选后的成卡：位置 + 双态类 + 尺寸 + 色档 u + 姿态方位） */
interface ConeCard {
  x: number;
  y: number;
  z: number;
  /** 卡半幅（果径 × CONE_CARD_SCALE × 0.5——分带尺寸先乘） */
  half: number;
  /** 双态类（u 色档域身份：mature 二年生近熟淡绿-黄褐 / young 一年生绿幼果——
   *  3b 冻结编码；姿态轴 = 直立〔young〕/ 下垂〔mature〕——着生律的姿态侧语言） */
  cls: 'mature' | 'young';
  u: number; // 逐果色档 ∈ [0.02, 0.98]（位置散列——材质色档通道）
  az: number; // 姿态方位（位置散列——直立微倾/下垂外倾的水平分量方向）
}

/**
 * 果账目主函数（收冠后统一执行——簇位/枝位已定，纯确定性零 rng）：
 * 1. 候选池 = 上半冠（挂点高 ≥ 主干顶 × CONE_CROWN_GATE 的层位）L5 末级枝的
 *    外段结果带候选位（每枝 coneCandidates 1 位，t = fruitingZone 0.72 → 1 中点
 *    ≈ 0.86——「球果通常单生，初直立」新枝端/近顶着生的外段位映射）；
 * 2. posHash 排序 + coneKeepRatio 抽选（保留前 ⌈池 × keep⌉ 位——排序确定性，同
 *    seed 同果集；跨 seed 因布点差异自然去克隆）；
 * 3. 逐果双态分类（classRoll < coneClassRatio 0.25 → 二年生近熟淡绿-黄褐少量 /
 *    其余一年生绿幼果主导——**classRatio 反向档 vs 圆柏熟果主导 0.75**：「两年熟 →
 *    生长季主视觉树上恒有一年生绿幼果」FRPS 机制 + 主语境幼果照片弱读）；
 * 4. 分带尺寸（young 1.2–2.0 cm / mature 2.8–4.8 cm——profile coneSize 域
 *    [0.012, 0.048] 的双态分带消费，见常数注）——位置散列抽样。
 * 量级定档：候选 ≈ 上半冠 L5 枝数 × 1 × keep 0.22 ≈「低量单生」（Spec §5.3
 *    Unknown ③ 精确档落空按低量消费——族内第四档位：雪松如烛正向 / 水杉轻量 /
 *    圆柏中量 / 白皮松低量点彩；近景点彩级 High 独有——Mid/Low 省略记档）。
 */
function accountCones(ctx: BuildCtx, profile: ConiferShapeProfile): ConeCard[] {
  const pool = ctx.coneCandidates.filter((c) => c.heightFrac >= CONE_CROWN_GATE);
  const sorted = [...pool].sort(
    (a, b) => posHash(a.x, a.y, a.z, 1.7) - posHash(b.x, b.y, b.z, 1.7) || a.x - b.x || a.y - b.y || a.z - b.z,
  );
  const keepCount = Math.ceil(sorted.length * profile.coneKeepRatio);
  const cones: ConeCard[] = [];
  for (let i = 0; i < keepCount; i++) {
    const c = sorted[i]!;
    const classRoll = posHash(c.x, c.y, c.z, 3.3);
    const young = classRoll >= profile.coneClassRatio; // < 0.25 → 近熟少量 / 其余幼果主导
    const sizeRoll = posHash(c.x, c.y, c.z, 5.9);
    const size = young
      ? CONE_YOUNG_MIN + sizeRoll * CONE_YOUNG_SPAN
      : CONE_MATURE_MIN + sizeRoll * CONE_MATURE_SPAN;
    // u = 双态分类 + 带内色档（3b 冻结编码：u ≥ 0.5 近熟 / u < 0.5 幼果——posHash 带内变奏）
    const uBand = young ? CONE_U_YOUNG : CONE_U_MATURE;
    const uRoll = posHash(c.x, c.y, c.z, 7.7);
    cones.push({
      x: c.x,
      y: c.y,
      z: c.z,
      half: (size * CONE_CARD_SCALE) / 2, // 沿果轴帧方卡半幅（SDF 留边）
      cls: young ? 'young' : 'mature',
      u: uBand.min + uBand.span * uRoll,
      az: posHash(c.x, c.y, c.z, 9.1) * Math.PI * 2,
    });
  }
  return cones;
}

/** 果姿态轴构造（双态分化——FRPS「初直立，后下垂」着生律）：
 *  young = 竖直向上 + 微外倾（CONE_YOUNG_LEAN）/ mature = 竖直向下 + 外倾
 *  （CONE_MATURE_SAG——juniperus 浆果 sagAxis 同型提参化） */
function coneAxis(cls: 'mature' | 'young', az: number): THREE.Vector3 {
  const outward = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
  const vertical = cls === 'young' ? UP.clone() : new THREE.Vector3(0, -1, 0);
  const lean = cls === 'young' ? CONE_YOUNG_LEAN : CONE_MATURE_SAG;
  return vertical.addScaledVector(outward, lean).normalize();
}

/**
 * 单枚果发射：**交叉方卡**（2 卡 × 2 tri——交叉方位对展）：卡根坐挂点（微沉
 * CONE_SINK 贴枝——「短梗或几无梗」），卡体沿双态姿态轴（幼果直立 / 近熟下垂）
 * 对展。uv：v∈[1.0, 1.95] 沿果轴帧（根 base → 尖 tip——**双帧域冻结接口②**，
 * 根 1.0 恰落 v ≥ 1.0 的果侧 ✓）；**u = 双态分类 + 带内色档**（3b 冻结编码：
 * u ≥ 0.5 近熟淡绿-黄褐 / u < 0.5 一年生绿幼果；果内 12 顶点同值——材质双色值
 * 通道消费归 3b）。法线 = 宽轴 × 姿态轴（双面读向）；aLeafRand/aBend 随皮组
 * 恒 0（果刚性——摆动语义归材质层/缺口候选）。
 */
function emitConeCard(sink: BarkSink, cone: ConeCard): void {
  const root = new THREE.Vector3(cone.x, cone.y - CONE_SINK, cone.z);
  const axis = coneAxis(cone.cls, cone.az);
  const domain = CONE_UV;
  for (let k = 0; k < 2; k++) {
    const az = cone.az + (k * Math.PI) / 2; // 交叉方位（第二卡正交）
    let w = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    w = w.clone().sub(axis.clone().multiplyScalar(w.dot(axis))).normalize(); // ⊥ 姿态轴
    const center = root.clone().addScaledVector(axis, cone.half);
    const r0 = center.clone().addScaledVector(w, -cone.half);
    const r1 = center.clone().addScaledVector(w, cone.half);
    const t0 = r0.clone().addScaledVector(axis, cone.half * 2);
    const t1 = r1.clone().addScaledVector(axis, cone.half * 2);
    const n = w.clone().cross(axis).normalize();
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
 * Low 壳卡发射：簇心切向竖卡——宽轴 = 簇切向水平投影，高轴 UP，半幅 = 簇半径 +
 * LOW_SHELL_MARGIN；六顶点卡 / aLeafRand / aBend 契约与 High 束卡同构（根边 v 域
 * 基 / 尖边 v 域顶；**aBend 沿用簇位弧长权重**（clusterBends 平行账——沿枝弧长
 * 语义 Low 档不失；尖边 = 根 + 0.28 末级跨度）。**uv v∈[0, 0.99] 束卡帧**（壳卡 =
 * 整簇抽象 → 材质 Low 档束 SDF 同帧——「Low 单卡」冻结接口）。
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
    [t1, 1, CARD_V_TIP, bendTip],
    [r0, 0, 0.0, bendRoot],
    [t1, 1, CARD_V_TIP, bendTip],
    [t0, 0, CARD_V_TIP, bendTip],
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
 * **双帧域（冻结接口②）**：束卡 v∈[0, 0.99]（根 0 → 尖 0.99——1.0 判别阈值安全
 * 边距，见 CARD_V_TIP；束生单律无刺卡帧——vs juniperus 三级帧域）；bend 值随
 * 候选携带；u = 卡宽 0/1（卡内帧——SDF 消费归 3b）。
 */
function emitCard(
  pos: number[],
  nrm: number[],
  uv: number[],
  rand: number[],
  bend: number[],
  card: FoliageCard,
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
    [t1, 1, CARD_V_TIP, card.bendTip],
    [r0, 0, 0.0, card.bendRoot],
    [t1, 1, CARD_V_TIP, card.bendTip],
    [t0, 0, CARD_V_TIP, card.bendTip],
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
 * 拓扑：主干（含根部弱膨 flare ×1.06–1.24 ≤1.3 域，顶 = 解析冠顶适配解
 * 〔max(attach(u)+climb(u)) = 树高——见层位退化路由段〕）→ tierCount 密层
 * × tierBranchCount 散生对（**层间随机旋 rng 方位散布** + 高度域大抖动 + 层角梯度
 * + 开张卵圆→伞形平顶层半径轮廓）→ L2–L5 递归（细长直伸 droop 链 + fringe 近平
 * 加长）→ 顶梢（通直微倾 + leaderDroop 0 短路 + 固定束簇）；末两级束簇散生挂点；
 * 收冠后：通道过滤（tierGapBand 0 → 密度场整场短路）→ 双态果账目（零 rng）→
 * 烘焙（Mid 站点掩码 / Low 壳卡）。profile 缺省 = slot-0 标准组合（锚点回落——
 * 单测直调便捷路径）；level 缺省 = 'high'（三档同流派生）。
 */
export function buildBungeanaGeometry(
  rng: () => number,
  profile: ConiferShapeProfile = BUNGEANA_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): BungeanaGeometryResult {
  const lod = lodPlanFor(profile, level);
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    clusters: [],
    clustersCulled: 0,
    clusterBends: [],
    leafCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
    tierAngles: [],
    tierAzimuths: [],
    coneCandidates: [],
    leaderPeakY: 0,
    leaderTipY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（profile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = profile.totalHeight; // 形态参数域树高直读（= 3b 风动树高锚同源——无独立锚）
  const crownRadius = totalHeight * profile.crownWidthRatio * 0.5 * (0.94 + rng() * 0.12); // 冠幅包络半径（profile 语义值 + ±6% 抖动——层发射位逐层 / K(θ) 归一，见 tierLaunchFactor）
  const trunkBaseR = totalHeight * (TRUNK_BASE_FACTOR + rng() * TRUNK_BASE_SPAN); // 等比干径（11.5m → 0.17–0.22m）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.04)); // 主干倾轴（干通直至略弯 Verified——工程幅度）

  // ── 层位退化路由（身份核心）：**解析冠顶适配**——开张卵圆/伞形平顶冠的冠顶由
  //    枝列 + 延伸链爬升形成（vs juniperus 单常数 1.45 预留：白皮松冠幅/树高比
  //    0.60–1.25 + 层角谱系 48–80° 跨度下单常数无法跨槽落高）。逐层解析爬升
  //    climb(u) = 发射枝长 × chainClimbFactor(θ(u))（延伸链 15°/级 陡化模型，
  //    见常数注）→ 解 trunkTopY 使 max_u[attach(u) + climb(u)] = 树高（attach =
  //    firstTierY + u×span）——span = min_u (可用高 − climb(u))/u；**链爬升超
  //    可用高时等比收缩层发射位**（span < CROWN_MIN_SPAN_RATIO × 可用高——多干
  //    近似槽 rank 双强低位链的保底路径：双干上举观感保持、冠顶不越树高）。
  //    tierCount 密层均匀布层 + tierSpacingJitter 0.50 大抖动破层（高度域连续
  //    散布——层位读向被散布覆盖）──
  const leaderLen = totalHeight * profile.leaderLengthRatio * (0.92 + rng() * 0.16);
  const firstTierY = totalHeight * profile.trunkHeightRatio;
  const tierCount = profile.tierCount;
  const rankTop = Math.max(...profile.tierRankLength);
  const availSpan = Math.max(totalHeight - firstTierY, 0.01);
  /** 逐层解析爬升（u = 层位 0–1 采样；×launchShrink 收缩回路） */
  const angleAtU = (u: number): number =>
    THREE.MathUtils.lerp(profile.tierAngleBase, profile.tierAngleTop, u);
  const climbAtU = (u: number, shrink: number): number =>
    crownRadius *
    THREE.MathUtils.lerp(1, profile.tierRadiusTaper, Math.pow(u, profile.tierProfileExponent)) *
    tierLaunchFactor(angleAtU(u)) *
    TIER_BRANCH_LENGTH_FACTOR *
    rankTop *
    chainClimbFactor(angleAtU(u), profile.fringeLengthRatio) *
    CLIMB_WANDER_ALLOWANCE *
    shrink;
  const CLIMB_SAMPLES = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1] as const;
  const solveSpan = (shrink: number): number => {
    let spanMax = availSpan;
    for (const u of CLIMB_SAMPLES) {
      if (u === 0) continue;
      spanMax = Math.min(spanMax, (availSpan - climbAtU(u, shrink)) / u);
    }
    return spanMax;
  };
  let launchShrink = 1;
  let tierSpanCap = solveSpan(launchShrink);
  if (tierSpanCap < CROWN_MIN_SPAN_RATIO * availSpan) {
    // 等比收缩层发射位：climb × s → span(u) = (可用高 − s×climb(u))/u ≥ 下限
    let shrink = Infinity;
    for (const u of CLIMB_SAMPLES) {
      if (u === 0) continue;
      shrink = Math.min(shrink, (availSpan - CROWN_MIN_SPAN_RATIO * availSpan * u) / climbAtU(u, 1));
    }
    launchShrink = Math.min(1, Math.max(0.4, shrink));
    tierSpanCap = solveSpan(launchShrink);
  }
  const tierSpan = Math.max(tierSpanCap, 0.02);
  const trunkTopY = Math.min(
    firstTierY + tierSpan,
    totalHeight - leaderLen * LEADER_RISE_FACTOR,
  );
  const tierSpacing = tierSpan / Math.max(1, tierCount - 1);
  const tierHeights: number[] = [];
  for (let i = 0; i < tierCount; i++) {
    tierHeights.push(
      i === tierCount - 1
        ? trunkTopY
        : firstTierY + tierSpacing * i + jitter(rng, tierSpacing * profile.tierSpacingJitter), // 层位垂直抖动（1 次/层）
    );
  }

  // ── 主干：13 环段锥度曲线（trunkFlareRatio 干基弱膨 ≤1.3 × trunkTaperRatio 锥度）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * profile.trunkTaperRatio;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + (profile.trunkFlareRatio - 1) * Math.exp(-t * 7); // 干基弱膨（≤1.3 域内——快速衰减）
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < profile.trunk.segs) {
      dir.add(randUnit(rng).multiplyScalar(profile.trunk.wander)).normalize(); // 主干通直至略弯（wander 0.016–0.026 槽带）
      p = p.clone().addScaledVector(dir, trunkTopY / profile.trunk.segs);
    }
  }
  emitTube(
    bark,
    thinStations(trunkPts, lod.stationStep[0]!),
    thinStations(trunkRadii, lod.stationStep[0]!),
    lod.radial[0]!,
    TUBE_V_MAX / arcOf(trunkPts), // 逐管归一——v 域上限恒 0.92 < 1.0（双帧域防线）
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

  // ── L1 散生层枝 × tierCount 层 × tierBranchCount 枝（高度域连续散生骨架——身份核心）──
  //    方位：phase0 全冠锚 + **逐层随机旋 tierRot = rng()×2π**（散生 rng 方位散布主
  //    消费——tierPhaseStagger 省略的「近轮随机」语义端；跨层去相干 → 全冠方位均匀
  //    化）+ rank × 均分步进（散生对 ±180°）+ crownAsymmetry 抖动（slot-5 偏冠 =
  //    散生对内 rank 破缺 / **slot-7 多干近似 = rank 双强 + 低位陡角上举**——包络
  //    不对称/双干观感的槽载体）；层角梯度：tierAngleBase → tierAngleTop 沿层位
  //    插值（自垂直角——下部斜展近水平 / 上部上举；伞形平顶槽 top 55° 平展端）；
  //    层半径：mix(1, taper, u^exponent) 开张卵圆↔伞形平顶轮廓（exp<1 伞形端顶层
  //    近等宽外抛——第 4 冠轮廓包络型）。
  const phase0 = rng() * Math.PI * 2;
  const tierAngleSum = new Array<number>(tierCount).fill(0);
  for (let ti = 0; ti < tierCount; ti++) {
    const u = tierCount > 1 ? ti / (tierCount - 1) : 0;
    const angleDeg = THREE.MathUtils.lerp(profile.tierAngleBase, profile.tierAngleTop, u);
    const radiusFactor = THREE.MathUtils.lerp(1, profile.tierRadiusTaper, Math.pow(u, profile.tierProfileExponent));
    const tierR = crownRadius * radiusFactor * tierLaunchFactor(angleDeg) * launchShrink; // 层发射位 = 包络 / K(θ) × 冠顶适配收缩（见两常数注）
    const tierRot = rng() * Math.PI * 2; // 1 次（层间随机旋——散生 rng 方位散布）
    const tierAzRow: number[] = [];
    for (let r = 0; r < profile.tierBranchCount; r++) {
      const rank = Math.min(r, profile.tierRankLength.length - 1);
      const azRaw = phase0 + tierRot + (r / profile.tierBranchCount) * Math.PI * 2 + jitter(rng, profile.crownAsymmetry * 0.88); // 方位抖动 1 次
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
      // 枝干通道：层枝基段保护带（疏散冠露干的通透规则——主干 + 层枝进冠可见）
      ctx.channels.push(
        segOf(attach, attach.clone().addScaledVector(bDir, length * 0.45), Math.max(startR * 2.0, 0.05)),
      );
    }
    ctx.tierAzimuths.push(tierAzRow);
  }

  // ── 顶梢（通直无点头——判定 9：leaderDroop 0 占位短路，顶梢专路不实现第三例）：
  //    主干顶独立枝 + 近直立微倾 + 固定束簇防裸梢 ──
  {
    const leaderAz = rng() * Math.PI * 2; // 1 次
    const lDir = new THREE.Vector3(
      Math.cos(leaderAz) * LEADER_TILT,
      Math.sqrt(Math.max(0, LEADER_TILT * LEADER_TILT)),
      Math.sin(leaderAz) * LEADER_TILT,
    ).normalize();
    growLeader(ctx, rng, profile, lod, trunkPointAt(0.995), lDir, leaderLen, trunkRadiusAt(0.995) * 0.55);
    // 枝干通道：主干 → 顶梢连续中轴保护带（近共线直线近似）
    const leaderEnd = trunkPointAt(0.995).clone().addScaledVector(lDir, leaderLen * 0.6);
    ctx.channels.push(segOf(new THREE.Vector3(0, 0, 0), leaderEnd, Math.max(trunkTopR * 1.6, 0.05)));
  }

  const tierAngleMeans = tierAngleSum.map((s) => s / profile.tierBranchCount);

  // ── 通透过滤（疏散半透光连续冠：tierGapBand 0 → 层带密度场整场短路，仅通道硬抑制 +
  //    canopyDensity roll——roll 每卡无条件 1 次，确定性纪律）──
  const halfSpacing = Math.max(tierSpacing * 0.5, 1e-4);
  const nearestTierDist = (y: number): number => {
    let d = Infinity;
    for (const h of tierHeights) d = Math.min(d, Math.abs(y - h));
    return d;
  };
  const bandKeep = 1 - profile.tierGapBand;
  const leafCards: FoliageCard[] = [];
  let channelRejects = 0;
  let gapRejects = 0;
  const bandCandidates: [number, number] = [0, 0];
  const bandSurvived: [number, number] = [0, 0];
  for (const card of ctx.leafCandidates) {
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
      leafCards.push(card);
      if (inBand) bandSurvived[0]++;
      else bandSurvived[1]++;
    }
  }

  // ── 双态果账目（零 rng——收冠后统一；决策表档间同源）──
  const cones = accountCones(ctx, profile);
  const conesMature = cones.filter((c) => c.cls === 'mature').length;
  const conesYoung = cones.length - conesMature;
  const bakeOrgans = level === 'high'; // Mid/Low 省略（近景点彩级——幼果 1–2cm 中距亚像素，非身份信号）
  if (bakeOrgans) {
    for (const cone of cones) emitConeCard(bark, cone);
  }
  const coneTriangles = bakeOrgans ? cones.length * 4 : 0; // 交叉双卡 × 2 tri

  // ── 烘焙名单：High = 全存活卡；Mid = 候选序掩码子集（emitOrdinal % every === 0
  //    ——整簇保留交叉双卡〔束卡簇序〕；通透过滤对全候选照常执行 → Mid 存活卡 ⊂
  //    High 存活卡逐位同位）；Low 壳卡模式不烘焙簇内束卡（候选生成/通透过滤/rng
  //    消费已照常走完——消费序列档间恒等）──
  const bakedCards: FoliageCard[] = lod.shellCards
    ? []
    : leafCards.filter((c) => c.emitOrdinal % lod.siteEmitEvery === 0);
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

  // ── 层几何组装：树皮（含果卡；aLeafRand/aBend 恒 0——属性集一致）──
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

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 叶卡 1）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_bungeana 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  return {
    geometry,
    stats: {
      barkTriangles: (groups[0]?.count ?? 0) / 3 - coneTriangles,
      needleTriangles: (groups[1]?.count ?? 0) / 3,
      needleCards: lod.shellCards ? lowShellCount : bakedCards.length,
      needleCandidates: ctx.leafCandidates.length,
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
      coneCandidatePool: ctx.coneCandidates.filter((c) => c.heightFrac >= CONE_CROWN_GATE).length,
      conesMature: bakeOrgans ? conesMature : 0,
      conesYoung: bakeOrgans ? conesYoung : 0,
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
 * L1 层枝生长（散生层枝专路——身份核心）：路径 = 起点方向（层角梯度）+ 每步游走 +
 * **层板垂直速度场**（tierPlateArch 先端上翘拱 + tierEdgeDroop 伞缘轻下卷——「大枝
 * 较细长斜展 + 先端上翘」FRPS 枝姿语言的层板轮廓）；起径 = 主干挂点径 ×
 * tierBranchRadiusRatio × rank（slot-7 多干近似 = rank 双强 1.40/1.28 起径承载）；
 * 子级递归进 growBranch（L2 起细长直伸 droop 链）；站点全分辨率计算（游走 rng 全
 * 消费——档间逐位同源），管发射按 lod 计划抽稀（v 域逐管归一）。
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
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize(); // 层枝刚直（细长大枝）
      // ── 层板垂直速度场（先端上翘拱 + 伞缘轻下卷）──
      const tNext = (i + 1) / spec.segs;
      const arch = profile.tierPlateArch * Math.sin(Math.PI * tNext) * TIER_ARCH_GAIN; // 中部上拱（先端上翘）
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

  // 子级递归（childPlan[0]：侧枝 + 末位 1.0 延伸枝——疏散冠体积填充链）
  recurseChildren(ctx, rng, profile, lod, 0, length, phase, radiusAt, pointAt, tierIndex, heightFrac);
}

/**
 * 顶梢（通直无点头——判定 9 第三例）：主干顶独立枝——近直立微倾 + leaderDroop 0
 * 占位短路（二次点头项恒零——peak ≈ tip 通直读向，stats.leaderPeakY/TipY 结构
 * 证据）+ 固定 LEADER_FASCICLE_CLUSTERS 束簇（防裸梢——散生 rng 方位挂点同管线，
 * 簇位入簇账供 canopy proxy；**伞形平顶槽顶梢最短 0.04——冠顶由顶层平展枝列
 * 形成，顶梢埋入冠帽**）。
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
      d.add(UP.clone().multiplyScalar(-profile.leaderDroop * t * t * LEADER_DROOP_GAIN)).normalize(); // 0 占位短路（白皮松无点头）
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

  // 顶梢束簇（固定计数——rng 无条件消费；末级权重 lf 1.0 同 L5）
  const pointAt = (t: number): THREE.Vector3 => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return pts[i]!.clone().lerp(pts[i + 1]!, idx - i);
  };
  emitFascicleClusters(ctx, rng, profile, pointAt, LEADER_FASCICLE_CLUSTERS, LEADER_FASCICLE_INNER, 4, FASCICLE_BEND_LF_L5);
}

/**
 * 分枝递归（L2–L5，level 1–4）：路径 = 起点方向 + 每步游走 + **细长直伸-端部微垂
 * droop 链**（方向更新减 UP × droop × t × DROOP_GAIN——L2 近平 → L5 末级 0.05 低
 * 幅端：针硬挺 Verified 无垂帘读向）；起径 = 父径 × CHILD_RADIUS_RATIO、末径 =
 * 起径 × LEVEL_END_RATIO；L5 = 果候选位（外段结果带——coneFruitingZone 起
 * coneCandidates 位/枝，上半冠门控在账目侧）；L4/L5 = 束簇挂点位（束生单律——
 * 无刺叶 minority 双挂点，vs 圆柏双叶型并存）。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod
 * 计划抽稀（v 域逐管归一）。
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
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize(); // 主次分级游走（大枝较细长刚直 → 末级温和散乱）
      d.add(UP.clone().multiplyScalar(-spec.droop * t * DROOP_GAIN)).normalize(); // 细长直伸-端部微垂链（低幅端）
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

  // 果候选位（L5 末级枝——外段结果带：coneCandidates 1 位/枝，t = fruitingZone → 1
  // 中点 ≈ 0.86；零 rng 纯位置——posHash 排序抽选在收冠后 accountCones 统一执行）
  if (level === profile.levels.length - 1) {
    for (let j = 0; j < profile.coneCandidates; j++) {
      const t =
        profile.coneFruitingZone +
        (1 - profile.coneFruitingZone) * (profile.coneCandidates > 1 ? j / (profile.coneCandidates - 1) : 0.5);
      const pos = pointAt(THREE.MathUtils.clamp(t, 0, 1));
      ctx.coneCandidates.push({ x: pos.x, y: pos.y, z: pos.z, heightFrac });
    }
  }

  // ── 束簇挂点（末两级 L4/L5——束生短枝单律：1 挂点语言，无散生单针/刺叶通路）──
  if (level >= profile.levels.length - 2) {
    const isL5 = level === profile.levels.length - 1;
    const clusterCount = isL5 ? profile.clustersL5 : profile.clustersL4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const lf = isL5 ? FASCICLE_BEND_LF_L5 : FASCICLE_BEND_LF_L4;
    emitFascicleClusters(ctx, rng, profile, pointAt, clusterCount, inner, level, lf);
  }

  // 子级递归（L5 末级无子）
  if (level < profile.levels.length - 1) {
    recurseChildren(ctx, rng, profile, lod, level, length, phase, radiusAt, pointAt, tierIndex, heightFrac);
  }
}

/**
 * 束簇发射（L4/L5 逐枝 + 顶梢共用——簇位 + 交叉双卡，rng 每簇位 7 次无条件消费：
 * t/尺寸/方位/倾侧/滚转/rand/轮廓比）。**散生 rng 方位**（clusterAzimuthStep 省略
 * ——判定 1）：簇位 i 的方位 = rng()×2π 全随机（散生语言的簇级表达——束的螺旋
 * 排列是卡内 SDF 微观律〔3b 承载〕非簇级挂点方位律——判定 3 层级分工记档）。
 * 簇 = 1 位双卡：卡姿 = **径向放射主导**（FASCICLE_RADIAL 0.82——蓬松放射刷状
 * vs 圆柏绳卡前向主导）+ 全方位斜立倾侧 + 弱沿枝前向 + 滚转打散；**交叉双卡**
 * （第二卡绕卡轴转 90°——side→法线；零 rng 派生，aLeafRand sin 散列错相）；
 * emitOrdinal = 枝端优先簇序（Mid 掩码保枝端簇）；aBend = 沿枝弧长 0→1（根
 * (0.10+0.42t)×lf / 尖 根+0.28lf——末级最大权重 lf）。
 */
function emitFascicleClusters(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  pointAt: (t: number) => THREE.Vector3,
  clusterCount: number,
  inner: number,
  level: number,
  lf: number,
): void {
  for (let i = clusterCount - 1; i >= 0; i--) {
    // 簇沿枝 t：枝端簇（t=1）优先生成序；emitOrdinal = 枝端优先序（Mid 掩码保枝端簇）
    const spread = clusterCount === 1 ? 0.6 : i / (clusterCount - 1);
    const t = THREE.MathUtils.clamp(inner + spread * (1 - inner) + jitter(rng, 0.05), 0, 1); // 1 次
    const attach = pointAt(t);
    const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
    const size = profile.rosetteCardMin + rng() * profile.rosetteCardSpan; // 1 次（束卡长）
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
    // 束卡参数（无条件消费——含被剔除簇位）：rng 全随机方位 + 全方位斜立倾侧 + 径向
    // 放射主导 + 滚转；卡根坐簇心、卡体沿 dir 外伸（根锚卡——aBend 根端 = 簇位弧长权重）
    const az = rng() * Math.PI * 2; // 1 次（散生 rng 方位——clusterAzimuthStep 省略语义）
    let u1 = tangent.clone().cross(UP);
    if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0);
    u1.normalize();
    const u2 = tangent.clone().cross(u1).normalize();
    const radial = u1.clone().multiplyScalar(Math.cos(az)).add(u2.clone().multiplyScalar(Math.sin(az)));
    const tilt = (rng() - 0.5) * FASCICLE_TILT_SPAN; // 1 次（倾侧——上下对称全方位斜立带）
    const cardDir = radial
      .clone()
      .multiplyScalar(FASCICLE_RADIAL)
      .add(UP.clone().multiplyScalar(-tilt))
      .add(tangent.clone().multiplyScalar(FASCICLE_FORWARD))
      .normalize();
    let side = cardDir.clone().cross(tangent);
    if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
    side.normalize();
    const roll = rng() * Math.PI; // 1 次（卡面滚转——打散规则感）
    side.applyAxisAngle(cardDir, roll).normalize();
    const rand = rng(); // 1 次
    const aspect = profile.needleCardAspectMin + rng() * profile.needleCardAspectSpan; // 1 次（蓬松放射刷轮廓比）
    const width = size / aspect;
    if (kept) {
      const normal = side.clone().cross(cardDir).normalize();
      ctx.leafCandidates.push({
        center: center.clone(),
        dir: cardDir.clone(),
        side: side.clone(),
        width,
        height: size, // 束卡长 = 沿放射方向（根→尖）
        rand,
        clusterIndex,
        emitOrdinal: clusterCount - 1 - i, // 枝端优先序（Mid 站点掩码整簇保对卡）
        bendRoot,
        bendTip,
      });
      // 第二卡：dir 同轴、side = 首卡法线（正交平面交叉）；rand sin 散列错相（零 rng）
      ctx.leafCandidates.push({
        center: center.clone(),
        dir: cardDir.clone(),
        side: normal.clone(),
        width,
        height: size,
        rand: fract01(rand * 7.31 + 0.37),
        clusterIndex,
        emitOrdinal: clusterCount - 1 - i, // 同簇同序（Mid 掩码整簇保对卡——「交叉双卡 High/Mid 保留」）
        bendRoot,
        bendTip,
      });
    }
  }
}

/**
 * 子级递归公共段（growTierBranch / growBranch 共用）：childPlan[level] 挂点序列——
 * 侧枝（**方位 = 父相位 + phaseStep 级内步进**——π 二分基步进：侧枝自父方位反侧
 * 展开的冠内体积填充 + 抖动 + 上举混合）与末位 1.0 延伸枝（延续父向 + 轻微上扬
 * 与游走）；子枝长 = 父长 × CHILD_LENGTH_RATIO[level]（±CHILD_LENGTH_JITTER）
 * ——末级（L4→L5）再乘 fringeLengthRatio（细长直伸近平加长）；每子恰 4 次 rng
 * （t 抖动 + 方位组 2 / 延伸 randUnit 2 + 长 1——延伸/侧枝两形态消费数恒等）。
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
      // 延伸枝：延续父向 + 轻微上扬与游走（疏散冠外缘延伸/直伸延续）
      childDir = tTan.clone().add(UP.clone().multiplyScalar(0.15)).add(randUnit(rng).multiplyScalar(0.22)).normalize(); // 2 次
    } else {
      // 侧枝：方位 = 父相位 + phaseStep 级内步进（π 二分基步进——散生方位均匀化的
      // 级内表达：侧枝反侧展开填充冠内）+ 抖动；上举混合比层级分档
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
