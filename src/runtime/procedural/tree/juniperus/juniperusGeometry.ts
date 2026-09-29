/**
 * runtime/procedural/tree/juniperus/juniperusGeometry —— 圆柏
 * （Juniperus chinensis (L.) Ant.，柏科 Cupressaceae 刺柏属常绿乔木、雌雄异株）
 * CPU 几何生成器（T012.3 Step 3a，**针叶家族 conifer 第三实例——契约定稿态增量消费**：
 * 方法 = 族内先例复制（012.3 待裁决位 5 / Step 1 判定记档 3——几何管线〔growBranch
 * 递归 / 层位退化骨架 / 簇布点 / 卡挂点 / 锥度管发射 / 平行传输标架 / minY 贴地 /
 * 属性契约〕复制自雪松 cedrusGeometry + 水杉 metasequoiaGeometry 经两例验证的方法；
 * 挂点语言按圆柏**散生连续冠 + 绳状鳞卡 + 刺叶 minority 双叶型 + 柱/卵双冠轮廓 +
 * 浆果双熟度账目 + 干基微膨**改写〔Step 1 判定 1–8〕；cedrus/metasequoia 四件零触碰）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的
 *      **高度域连续散生分枝拓扑**（层位字段退化消费——判定 1 零契约新增路径）→
 * 锥度管状枝干（平行传输标架）→ 末两级**绳状鳞卡散生挂点**（rng 方位散布 +
 * clusterInnerStart 挂点前移 + clusterMinSeparation 低抑制 + **交叉双卡**——
 * 单面卡无角度覆盖的统计覆盖修复，012.1 校准实证直承）+ **刺叶卡 minority 位**
 * （cedrus 散生针卡机制复用——黄金角螺旋 + 抬离枝轴 + 外上前举；判定 3 二型叶
 * 消费路径 = 做，族内首例双叶型并存）+ **密实无层连续冠**（tierGapBand 0 零端消费
 * = 层带密度场整场短路——连续分布无层间空带，水杉同零端第三例）+ **浆果双熟度
 * 账目**（零 rng——koelreuteria posHash 账目法；无柄腋生 + 翌年霜熟果/当年绿幼果
 * 双色并存），产出树皮/叶卡两层非索引几何；层间 mergeGeometries(useGroups=true)
 * 恰 2 组（D15 免组膨胀：皮 0 / 叶卡 1——**浆果卡入皮组**：uv v 域身份标记 +
 * aLeafRand/aBend 随组恒 0，材质按 v 域分流配方——三级帧域冻结接口见任务派遣
 * 简报，与 juniperusMaterials 并行交付）。
 *      形态参数类型 = 针叶家族契约 ../conifer/coniferShapeProfile（**定稿 80 位**
 * ——012.2 转正；圆柏 = 第三实例/定稿态增量消费例），数值与槽组合见
 *      ./juniperusShapeProfile（全部数值依据 docs/research/juniperus-reference.md
 * Spec **@1.1** 含终审记档）；build 只做 slot → profile 路由
 * （assets/asset_tree_juniperus），不进 ProceduralBuild 公共签名。
 *
 * ── 散生连续冠骨架（身份核心，Step 1 判定 1 机制逐项落点）──
 *   1. **层位字段退化消费（判定 1 零契约新增路径——四杠杆）**：tierCount 10 密层 +
 *      tierSpacingJitter 0.50 大抖动破层（±0.35m @0.71m 层距——相邻层高度带重叠 →
 *      高度域连续散布）+ tierGapBand 0 零端（密度场整场短路——密实无层连续冠，
 *      90–95% 实心 Observed s01–s04）+ tierPhaseStagger/clusterAzimuthStep 双省略
 *      （省略 = 层间同相或**近轮随机**〔契约语义〕→ 本例消费随机端）——四杠杆合力
 *      把「层位量化挂点」退化为高度域连续散生的挂点骨架，表观无层（散生读向 =
 *      族内第三骨架型：vs 雪松近轮生成层 / 水杉对生轮生——两例皆层位变体）。
 *      **层间随机旋**：逐层 tierRot = rng()×2π（1 次/层——散生 rng 方位散布的主
 *      消费；vs 雪松层间同相 phase0 / 水杉层间交错 π/2）——20 L1 层枝方位跨层去
 *      相干 → 全冠方位均匀化（判定 1「高度域连续散布 + 方位均匀化」）。
 *   2. **枝角梯度（判定 1——ginkgo 角度梯度法第三次消费）**：层枝初向自垂直角 =
 *      tierAngleBase 55°（下部斜展平展——Spec 双问下枝 40–50°/天津型近水平带
 *      任务裁定下端 40–70°）→ tierAngleTop 30°（上部上举贴干——双问 30–40° 带
 *      上端 20–40°）沿层位线性插值 + tierAngleJitter 7° 抖动。
 *   3. **柱/卵双型冠轮廓（判定 2——族内第三冠体语言）**：层半径沿高 =
 *      mix(1, tierRadiusTaper, u^tierProfileExponent)——狭圆柱槽（0/1/4）：taper
 *      0.85–0.90 近等宽 + 指数 1.1–1.2 近柱体 + 顶部钝圆收（leaderLengthRatio
 *      0.04–0.06 短钝顶段——s01 西安桶柱 Observed）；卵圆/阔卵槽（3/2）：taper
 *      0.55–0.58 + 指数 1.7–1.9 中下部最宽的卵形权重（s02/s03 Observed）。vs
 *      雪松/水杉共用的「锥形收顶」读向——收顶比谱系第三极。
 *   4. **末级紧密直伸（判定 8 侧面——鳞叶小枝「直伸而紧密」Verified [1][2]）**：
 *      levels[].droop 链 0→0.06（三例最低幅 « 水杉轻垂 0.26 « 雪松垂帘）+
 *      fringeLengthRatio 1.04–1.16 近平加长；干轴 wander 0.015 主干通直（三整树
 *      槽双问一致——三例最低）。
 *   5. **顶梢通直无点头（判定 8——水杉同判第三例）**：主干顶独立顶梢枝（近直立
 *      微倾 + leaderDroop 0 占位短路——二次点头项恒零，peak ≈ tip 结构证据）+
 *      顶梢绳簇 + **顶梢刺卡**（固定计数防裸梢 + 幼态梢 = 刺叶 minority 挂点位的
 *      判定 3 锚——结构计数类：槽间恒等）。
 *   6. **绳状鳞卡主挂点（判定 3——第 3 叶语言 SDF）**：「叶」单位 = 末级鳞叶小枝
 *      聚合系统（「末级鳞叶小枝绳状/corded 聚合自成叶化单元」Verified——1 卡 =
 *      中轴枝 + 四列交互对生贴生鳞叶轮廓并集，卡长 0.18–0.30 m 族校准终值带直采
 *      〔012.2 亚像素教训——聚合单元不例外〕，rosetteNeedles 24 归 3b SDF）；挂点
 *      = 末两级（L5/L4）簇位 × **rng 方位散布**（clusterAzimuthStep 省略——az =
 *      rng()×2π 全随机，vs 水杉对生交错叶序 π/2 步进）+ clusterInnerStartL5/L4
 *      0.14/0.12 挂点前移（密实冠自枝基部布满——密冠贴地感 Observed）+
 *      clusterMinSeparation 0.02 低抑制（重叠由交叉双卡随机滚转吸收）；卡姿 =
 *      自枝轴方位外伸 + 小倾侧（紧密直伸——无下垂倾侧读向）+ 沿枝前向 + 滚转打散。
 *      **交叉双卡**（三杠杆之一）：第二卡绕卡轴转 90°（side→法线），零 rng 派生
 *      （aLeafRand sin 散列错相）；**Mid 档保交叉双卡、隔簇位抽取**（站点级掩码
 *      ——每存活簇保双卡，见 LOD 段）。
 *   7. **刺叶卡 minority（判定 3——二型叶消费路径 = 做，族内首例双叶型并存）**：
 *      cedrus 散生针卡机制复用（黄金角螺旋方位 + 抬离枝轴 + 外上前举 + 细长卡）；
 *      刺卡长 0.12–0.20 m（真刺叶 6–12 mm Verified × 聚合映射）挂 L5/L4 逐枝固定
 *      计数 2/1 + 顶梢 2（幼态梢/旺枝位——判定 3 明文 minority 比例 ≈ 绳卡 1/6–
 *      1/8；中景无质量贡献、近景身份细节——圆柏 vs 侧柏差分第一条）；不归簇账
 *      （clusterIndex −1，cedrus/ginkgo 同口径）。
 *   8. **浆果双熟度账目（判定 5——零 rng，koelreuteria 账目法改写）**：结果位 =
 *      L5 末级鳞枝外段结果带（coneFruitingZone 0.58 起 3 位/枝 t 均布——「小枝
 *      腋生/节间散生或 2–4 枚小簇、短柄」Verified 的节间位映射；L5 = 真腋生位，
 *      vs 雪松 L2 层板枝 / 水杉 L3——账位语言资产侧定）；上半冠门控
 *      （BERRY_CROWN_GATE 0.5）→ posHash 排序 + coneKeepRatio 0.55 抽选 →
 *      **双熟度分类**（classRoll < coneClassRatio 0.75 → 翌年霜熟果主导 / 其余
 *      当年绿幼果——「两年熟 → 同树同枝 green immature + frosted blue 并存」s08
 *      双问直证）+ **无柄腋生**（root 微沉贴枝腋——vs 水杉长柄下垂 CONE_STALK；
 *      s08「短柄散生」Observed）+ 近真尺寸 6–8 mm ×1（中距亚像素点彩——判定 10
 *      Unknown 留档）；账目全零 rng（消费顺序契约不含器官）。
 *
 * ── 预算锁定账目（LOD 已锁 conifer 行：High ≤ 40000 / Mid 6000–10000 /
 *    Low 1500–3000 / Canopy ≤ 500——T012.1 锁定，非候选带流程（012.3 待裁决位 2）；
 *    实测记档 = **Step 3a 初版探针 2026-09-29**〔Step 4 密度校准回路开放——出带调
 *    簇密度或抑制，计数类全槽同调不破恒等〕，回写 ../assets/asset_tree_juniperus.asset
 *    模块头）──
 *    8 槽 × 3 档实测带：**High 26438–38892**（皮恒 16918 + 绳卡/刺卡 4232–10247
 *    张 ×2 + 浆果 264–370 枚 ×4；slot-1 幼尖塔最低 / slot-2 老树阔卵密簇最高
 *    ——上限用满 66–97%，沿雪松 32.2–38.4K 校准先例带〔slot-2 96%〕）；**Mid
 *    6514–9526**（皮恒 2838 + 存活簇位 /4 × 交叉双卡 + 刺卡全局序 /4 + 浆果全量
 *    〔身份信号——双熟度并存〕）；**Low 1884–2802**（皮恒 750 + 壳卡 = ⌈保留簇/5⌉
 *    × 2、浆果省略〔远距亚像素——6–8 mm 果径记档同 koelreuteria/雪松球果〕）；
 *    rng 消费 slot-0 三档恒等 **56851**（快照锁——散生层间随机旋 +10 并入骨架段；
 *    浆果账目零 rng）、minY 三档恒 0；层间距涌现 0.64m（密层——vs 雪松 1.74 /
 *    水杉 1.17 三例最密；±0.32m 抖动 ≈ 层距半程 = 高度域连续读向）；树高涌现 =
 *    profile 树高 ×1.02–1.11（slot-0 8.19 vs 锚 8——冠顶形成位预留后残余 +2.4%；
 *    slot-5 +10.7% = 偏冠 rank ×1.50 顶枝加长的读向性涌现）；slot-0 High 总面
 *    **32062** = 皮 16918 + 绳卡 6280×2 + 刺卡 658×2 + 浆果 317×4（meta
 *    triangleCount 实数）；浆果账目 slot-0 = 317 枚（熟 226 / 幼 91——posHash
 *    分域 ≈ coneClassRatio 0.75）。
 *
 * 结构计数（皮拓扑槽间恒定 → 皮面数恒等；配置侧基数 16808 = juniperusShapeProfile
 *      模块头算术——trunk 288 + L1 20 管 1960 + L2–L5 2400/3200/3840/5120）：实测
 *      皮恒 **16918** = 基数 16808 + 顶梢管 98（levels[0] 同规格计入 L1——21 管 ×
 *      98）+ 主干底盖 12（radial 12——封顶视空洞，家族先例同构）；绳簇位标称 5126
 *      （L5 320×12 + L4 160×8 + 顶梢 6）、刺卡标称 802（L5 320×2 + L4 160×1 +
 *      顶梢 2）为计数类（rng 消费次数恒定的固定计数），保留簇数与实际卡数随
 *      seed 由簇级抑制 + 通透规则确定（同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律沿用）：簇生成与刺卡的 rng 消费均为无条件固定次数（每绳簇
 *      位 7 次：t/尺寸/方位/倾侧/滚转/rand/轮廓比；每刺卡 8 次：t/方位/抬离/上举/
 *      滚转/长/长宽比/rand——cedrus 散生针卡同款），被抑制丢弃的簇位足额消费后
 *      丢弃；通透 roll 每卡无条件 1 次；**浆果账目零 rng**（posHash 确定性布点）
 *      ；rng 消费总数 = 结构固定段 + 通透 roll 段（计数 = 存活候选卡数——随保留
 *      簇数浮动，家族先例同机制）。
 * 叶卡属性契约（008.3 家族冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐卡 ∈ [0,1)（**逐卡种子**——风动 flutter
 *        相位变奏源，消费语义归 3b；实例级 aSeed 归 Runtime/D20.4，几何零 aSeed
 *        顶点属性）；皮组（含浆果卡）恒 0；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，**沿枝弧长 0→1 弯曲权重（末级最大）**
 *        （T012.3 冻结接口）：根边 = (0.10 + 0.42×t)×lf / 尖边 = 根 + 0.28×lf
 *        （t = 簇位沿枝弧长；lf = 末级权重——L5/顶梢 1.0、L4 0.72），卡内根→尖
 *        非降；树皮层同名属性写恒等值 0（**浆果刚性**——aBend 随组恒 0，摆动语义
 *        归材质层/缺口候选，cedrus 同判）。
 * uv 三级帧域（**T012.3 冻结接口 2——阈值 1.0 / 2.0，沿水杉三级先例**）：
 *      绳卡（鳞卡）v∈[0, 0.99]（根→尖帧——尖端取 0.99 **不取 1.0 整**：1.0 判别
 *      阈值的安全边距，卡内帧线性 0→0.99、1% 压缩不可辨）/ 浆果卡 v∈[1.0, 1.95]
 *      （沿果轴帧；**双熟度分类走 u 色档域**——3b juniperusMaterials 冻结声明：
 *      u ≥ 0.5 翌年霜熟果 / u < 0.5 当年绿幼果〔cedrus 两类果机制在单果帧下的先例
 *      名路线——零新增 attribute、零新增 v 阈值〕，带内色档 posHash 逐果；根 1.0
 *      恰落阈值判据 v ≥ 1.0 的浆果侧 ✓）/ 刺卡 v∈[2.0, 2.95]（针基→针尖经典帧
 *      ——cedrus 散生单针卡同帧〔v 基 2.0 平移〕；根 2.0 恰落 v ≥ 2.0 刺卡侧 ✓）；
 *      **皮管域 v ∈ [0, TUBE_V_MAX=0.92] 逐管归一**（浆果域自 1.0 起——水杉防线
 *      全程推广：主干与全部枝管均按全弧归一到 0.92 < 1.0，任意槽树高/冠幅组合下
 *      皮管域与器官域恒隔离——3b 树皮条片 SDF 的 v 向频率按逐管归一口径定档）；
 *      主干底盖 uv 盘半径 0.4（v ≤ 0.9——同阈值防线）。
 * LOD 三档（家族方法复制：level 为 Runtime 可选参数——不参与 shapeSlot/morphSeed/
 *      sourceKey 形态身份计算）：三档共用**同一条 rng 消费流**与同一套骨架/簇位/
 *      器官决策路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/簇位
 *      照常足额消费 rng（三档 rng 消费总数恒等），枝路径/簇位/通道过滤/器官决策
 *      逐位同源：
 *      - High：全发射（缺省档；皮 16918）；浆果全量（身份信号——双熟度并存）；
 *      - Mid：径向段数降（12/7/6/5/4/4 → 6/5/4/3/3/3）+ 轴向站点隔 1 抽 1 +
 *        L4/L5 末级细管不发射（末级径 ≈3.5–5mm，Mid 观距亚像素；簇位照常派生）+
 *        **站点级隔 3 抽 1 保交叉双卡**（siteOrdinal % 4 === 0 的簇位整簇保留双卡
 *        ——「交叉双卡 High/Mid 保留」的 Mid 实现：单面卡无角度覆盖，Mid 抽 3/4
 *        簇位保对卡〔%4 = 圆柏预算适配——绳卡标称位 5126 + 刺卡 802 + 浆果 ~300×4
 *        的 Mid 带适配，vs 水杉 %3——其无刺卡/浆果较少〕，角覆盖与面数同守；存活
 *        卡 ⊂ High 存活卡逐位同位）+ 刺卡全局序同掩码 /4 + 浆果全量保留（身份
 *        信号）；皮 2838；
 *      - Low：主干 + L1 层枝极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng/
 *        派生簇位）+ 冠 = High 簇位表驱动的壳层卡（**每保留簇 1 张切向竖卡 × 隔
 *        5 簇抽取**（stride 5——簇位量级 5000+ 的预算适配，水杉校准同款）× 半幅 =
 *        簇半径 + LOW_SHELL_MARGIN 0.20（绳簇半径 0.09–0.15——壳卡体量 0.29–0.35
 *        半幅，远距剪影连续）；aBend 沿用簇位弧长权重（clusterBends 平行账——沿
 *        枝弧长语义 Low 不失）；**壳卡走绳卡帧 v∈[0, 0.99]**（整簇抽象 → 材质
 *        Low 档 8 元素绳 SDF 同帧）；浆果省略（远距亚像素——记档同先例）；皮 750。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随
 *      调用移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 0）；叶法线取卡面单侧。
 * 风动 attribute 契约（家族先例）：几何携带 aLeafRand/aBend（皮组恒 0 实心）；
 *      树高锚 = profile.totalHeight 同源（3b 材质消费，无独立锚；**两成分消费——
 *      整冠低频小幅摆为主 + 末级细幅微颤**〔密实质量体——判定 8〕，顶梢成分不进
 *      本资产〔windLeader* 零占位〕）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { JUNIPERUS_SLOT0_PROFILE } from './juniperusShapeProfile';
import type { ConiferShapeProfile } from '../conifer/coniferShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙；bend 随候选携带） */
interface FoliageCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖 = 绳轴/针轴外伸方向）
  side: THREE.Vector3; // 卡宽方向（滚转后）
  width: number;
  height: number;
  rand: number; // aLeafRand（逐卡种子）
  clusterIndex: number; // 所属簇位（绳卡 ≥ 0 归簇账；刺卡 = -1 不归簇）
  /** 挂点语言身份：rope = 绳状鳞卡（主卡 v∈[0,1)）/ awl = 刺叶卡（minority v∈[2,3)） */
  kind: 'rope' | 'awl';
  /** 簇/枝内候选序（Mid 站点掩码 % 4 === 0 的选择位——绳卡枝端簇优先序；刺卡全局序） */
  emitOrdinal: number;
  /** aBend 沿枝弧长权重（冻结接口——根/尖两值随候选携带，烘焙直读） */
  bendRoot: number;
  bendTip: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径——绳簇的簇空间。
 *  T021.6 家族共享契约同构（canopy proxy 消费——BroadleafClusterRecord 字段兼容） */
type ClusterRecord = BroadleafClusterRecord;

/** 枝干发射槽：非索引三角形流（pos/normal/uv 三数组同步追加——浆果卡同槽） */
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

/** 浆果候选位（账目原料：L5 末级鳞枝外段结果带——posHash 排序抽选后成卡） */
interface BerryCandidate {
  x: number;
  y: number;
  z: number;
  /** 所属层位的相对高度（上半冠门控用——挂点高/主干顶） */
  heightFrac: number;
}

/** 构建上下文：发射槽 + 簇表 + 候选叶卡 + 通道表 + 逐级统计 + 浆果候选（全树共享） */
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
  berryCandidates: BerryCandidate[];
  /** 刺卡全局候选序（Mid 掩码的均匀覆盖位——逐卡递增，确定性） */
  awlOrdinal: number;
  /** 顶梢账目（通直证据）：顶梢最高站 Y / 末站 Y（leaderDroop 0 → peak ≈ tip） */
  leaderPeakY: number;
  leaderTipY: number;
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface JuniperusGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 叶卡三角（cards × 2——组 1 纯卡） */
    needleTriangles: number;
    needleCards: number;
    /** 双叶型账目（绳卡 = 主卡 / 刺卡 = minority——烘焙口径） */
    ropeCards: number;
    awlCards: number;
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
    /** 浆果账目（零 rng——确定性账目）：候选池（门控后）/ 各熟度烘焙数 / 三角 */
    berryCandidatePool: number;
    berriesMature: number;
    berriesYoung: number;
    berryTriangles: number;
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

/** x → [0,1)（确定性散列分量——浆果账目零 rng 的布点源） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

/** 位置确定性散列（salt 分通道——浆果排序抽选/分类/色档/姿态/尺寸共用，零 rng） */
function posHash(x: number, y: number, z: number, salt: number): number {
  return fract01(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + salt * 53.71) * 43758.5453);
}

// ── 散生连续冠形态常数（工程设定——几何私有算法面；Spec 依据见 juniperusShapeProfile
//    逐字段，此处只放机制增益与结构常数；探针校准记档见模块头）──────────────────────

/** L1 层枝长 / 层半径（层板外缘由 L2 延伸枝补满） */
const TIER_BRANCH_LENGTH_FACTOR = 0.78;
/** 层板拱起增益（tierPlateArch × 此值 = 行走方向每步的向上速度分量幅度——弱拱） */
const TIER_ARCH_GAIN = 0.8;
/** 层板外缘下卷增益（tierEdgeDroop × 此值 = 外段（t>0.45 平滑过渡）向下速度分量幅度） */
const TIER_EDGE_GAIN = 1.4;
/** 逐过渡级子枝长比（L1→L2 … L4→L5——密冠体积填充链的长度衰减；末级偏高 = 直伸段。
 *  密度校准 2026-09-29：末两级 [0.58, 0.85] → [0.66, 0.95]——8m 级小树末级枝长
 *  0.11m « 簇径 0.24 导致 12 簇同心堆叠（壳面 r>0.9 仅 3.4% 簇——透天主因）；
 *  增长后 L4/L5 ≈ 0.15/0.16m，绳列沿枝串联散开（vs 水杉 20m 树同常数下末级
 *  自然 ≈0.25m——小树需抬高比率补偿绝对枝长） */
const CHILD_LENGTH_RATIO = [0.44, 0.5, 0.66, 0.95] as const;
/** 子枝长比抖动幅度（±） */
const CHILD_LENGTH_JITTER = 0.12;
/** 逐过渡级子/父起径比（低级陡末级缓——主次分级；纤细分枝链：L1 ≈3.6cm → L5 ≈4mm） */
const CHILD_RADIUS_RATIO = [0.5, 0.58, 0.62, 0.66] as const;
/** 逐级末径/起径比（L1 通体顺收 → 末级收细；地板 0.004 同家族） */
const LEVEL_END_RATIO = [0.45, 0.5, 0.55, 0.6, 0.65] as const;
/** droop 链增益（levels[].droop × 此值 × t = 每步向下速度分量——紧密直伸链三例最低幅） */
const DROOP_GAIN = 1.0;
/** 顶梢下垂增益（leaderDroop × t² × 此值——圆柏 0 占位短路，常数沿家族保留位） */
const LEADER_DROOP_GAIN = 4.0;
/** 顶梢初向水平分量（近直立微倾——通直干顶延伸 + 钝圆收顶；水杉同值） */
const LEADER_TILT = 0.1;
/** 顶梢干顶预留系数（主干顶 = 树高 − 顶梢段长 × 此值 ≈ 顶梢平均升角的余弦补偿） */
const LEADER_RISE_FACTOR = 0.9;
/** 冠顶形成位系数（**柱/卵冠的钝圆收顶预留**——顶部枝列 + 子链升幅把冠顶抬到主干
 *  顶之上：冠顶预留 = 此值 × 冠半径 × tierRadiusTaper × 层枝长比；1.45 = 探针标定
 *  2026-09-29〔顶枝升幅 + L2 链上举 + 弱拱项的实测合计 ≈ 1.09–2.66m @两极端槽〕
 *  ——vs 先例锥收顶（taper 0.15–0.22 顶枝短小自带收敛，无需预留）：柱冠 taper
 *  0.85–0.90 顶枝近全长 → 冠顶由枝叶形成、主干顶埋入冠帽——钝圆收顶的几何实现） */
const CROWN_TOP_RISE_FACTOR = 1.45;
/** 顶梢绳簇数（固定计数——防裸梢 + 绳卡同管线；结构计数类：槽间恒等；**密度校准
 *  2026-09-29：6 → 10**——上半冠带投影覆盖 35.9% < 中带 49.6%〔顶梢段 1.27m 仅
 *  12 卡〕的顶部补偿，钝圆收顶的密实读向） */
const LEADER_ROPE_CLUSTERS = 10;
/** 顶梢绳簇挂点 t 域下限（沿顶梢弧长——顶梢下半段留给干顶收细；密度校准 2026-09-29：
 *  0.3 → 0.2——顶梢簇沿顶梢散开补上带） */
const LEADER_ROPE_INNER = 0.2;
/** 顶梢刺卡数（固定计数——**幼态梢 = 刺叶 minority 挂点位**〔判定 3 锚〕；槽间恒等） */
const LEADER_AWL_CARDS = 2;
/** 皮管 v 域归一上限（逐管归一——三级帧域浆果卡自 1.0 起的必要防线，见模块头） */
const TUBE_V_MAX = 0.92;
/** 层隙空带密度地板（tierGapBand > 0 时的空带核心保留率——圆柏零端短路不走此分支，
 *  常数沿家族机制保留位） */
const TIER_GAP_FLOOR = 0.05;
/** 主干根径 / 树高（等比干径——槽树高档 4.5–10m 跨度 ×2.2 > 先例固定域口径：
 *  8m → 0.12–0.152m；工程设定，DBH 无 Spec 数值） */
const TRUNK_BASE_FACTOR = 0.015;
const TRUNK_BASE_SPAN = 0.004;
/** 绳卡倾侧 rng 域宽（全域 ± 一半——**密度校准 2026-09-29：±0.15 → ±0.7 上下
 *  对称**：鳞叶小枝在枝周全方位着生〔上仰/下俯/侧平各 1/3——真实鳞叶枝覆盖枝周
 *  球面，「直伸」= 不垂头由 |tilt| ≤ 0.7 界定〕；斜立姿态消除 el8 低机位下近水平
 *  卡面的系统性薄片化〔原 tilt ∈ [-0.05, 0.25] 全近水平——有效投影系数 ~0.09〕） */
const ROPE_TILT_SPAN = 1.4;
/** 绳卡沿枝前向分量（**密度校准 2026-09-29：0.2 → 0.55**——绳轴沿枝切向主导：末级
 *  鳞叶小枝 = 枝系统的末梢延伸〔「直伸而紧密」Verified——贴枝延伸语言〕，卡列沿枝
 *  串联而非径向同心堆叠〔堆叠 = 覆盖效率浪费的根源，12 簇堆 0.11m 短枝〕；斜伸
 *  方位多样性保留〔radial 0.70 + rng 方位〕——散生方位身份不破） */
const ROPE_FORWARD = 0.55;
/** 绳卡径向外伸分量（密度校准同步：0.92 → 0.70——前向主导后保持单位向量斜伸带） */
const ROPE_RADIAL = 0.7;
/** 绳卡 aBend 末级权重（lf——末级最大：L5/顶梢 1.0、L4 0.72） */
const ROPE_BEND_LF_L5 = 1.0;
const ROPE_BEND_LF_L4 = 0.72;
/** 绳卡帧尖端 v 值（0.99——**1.0 判别阈值的安全边距**：尖端若取 1.0 整则绳卡尖
 *  顶点会被 v ≥ 1.0 判进浆果域；卡内帧线性 0→0.99，3b 侧按 v/0.99 归一或直接
 *  消费——1% 线性压缩不可辨） */
const CARD_V_TIP = 0.99;
/** 浆果结果位上半冠门控（挂点高 ≥ 主干顶 × 此值的层位 L5 末级枝为结果候选枝——
 *  「中距霜蓝果点布冠」的上冠为主读向；工程设定，量级定档载体见模块头浆果段） */
const BERRY_CROWN_GATE = 0.5;
/** 浆果卡 SDF 余量（近球体轮廓 → 方卡半幅 = 果径 × 此值 × 0.5——沿垂轴帧留边） */
const BERRY_CARD_SCALE = 1.15;
/** 当年绿幼果尺度比（两年熟——当年幼果未膨大；cedrus 幼果缩放同型工程值） */
const BERRY_YOUNG_SCALE = 0.72;
/** 浆果无柄微沉（米——「短柄散生」Observed 的无柄贴枝腋落位；vs 水杉长柄 2.5cm） */
const BERRY_SINK = 0.004;
/** 浆果外倾幅度（腋生微外倾——近球浆果的姿态弱读向；vs 水杉弯垂下垂 0.38） */
const BERRY_SAG = 0.18;
/** 浆果 uv v 域帧（冻结接口 2：v∈[1.0,1.95] 沿果轴单帧——metasequoia 球果帧同构；
 *  **双熟度分类走 u 色档域**：u ≥ 0.5 翌年霜熟果 / u < 0.5 当年绿幼果——3b
 *  juniperusMaterials 冻结声明的先例名路线〔cedrus 两类果 v 域带分流在本例单果帧
 *  下不可用 → u 域编码〕，零新增 attribute、零新增 v 阈值；带内色档 = posHash 逐果） */
const BERRY_UV = { base: 1.0, tip: 1.95 } as const;
/** 浆果 u 色档域带（熟度分类 + 带内变奏：young [0.02, 0.5) / mature [0.5, 0.98]） */
const BERRY_U_YOUNG = { min: 0.02, span: 0.46 } as const;
const BERRY_U_MATURE = { min: 0.52, span: 0.46 } as const;
/** 刺卡挂点 t 域（避开枝端簇 t=1 与枝基——「幼态梢/旺枝位」外段带；cedrus 同域） */
const LONGSHOOT_T_START = 0.3;
const LONGSHOOT_T_SPAN = 0.58;
/** 刺卡抬离枝轴域（米：0.02–0.05——刺叶自枝轴辐射伸展的最小分离；cedrus 同域） */
const LONGSHOOT_STICK_SPAN = 0.05;
/** 黄金角（螺旋叶序步进——散生螺旋方位语言，cedrus 散生针卡同型） */
const GOLDEN_ANGLE = 2.39996;
/** Low 壳卡：每保留簇张数（1 = 单卡——「Low 单卡」冻结接口）与隔簇抽取步长
 *  （stride 5——绳簇位量级 5000+ 的预算适配，水杉校准同款） */
const LOW_SHELL_CARDS_PER_CLUSTER = 1;
const LOW_SHELL_STRIDE = 5;
/** Low 壳卡半幅余量（米）：绳簇半径 0.09–0.15——壳卡体量 0.29–0.35 半幅由余量
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
  /** 簇位级发射掩码（siteOrdinal % every === 0 的簇位整簇保留交叉双卡 + 刺卡全局序
   *  同掩码——候选生成/通透过滤/rng 消费对全簇位照常——Mid 存活卡 ⊂ High） */
  siteEmitEvery: number;
  /** Low 壳卡模式：不烘焙簇内绳卡（候选/过滤/rng 照常），逐保留簇发射切向竖卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（预算记账 = 实测口径，正式预算带锁定见
 * ../assets/asset_tree_juniperus.asset 模块头）：
 * - High 皮 16918（拓扑恒等不动：主干 288 + 底盖 12 + L1 2058〔21 管 = 20 层枝 +
 *   顶梢，levels[0] 同规格〕+ L2 2400 + L3 3200 + L4 3840 + L5 5120）；
 * - Mid 皮 2838 = 主干 78（6 段 ×6 + 底盖 6）+ L1 840（21 ×4 段 ×5）+ L2 960
 *   （40 ×3 段 ×4）+ L3 960（80 ×2 段 ×3），L4/L5 不发射（末级径 ≈3.5–5mm
 *   亚像素）；卡 = 存活簇位 / 4 × 双卡 + 刺卡 /4 + 浆果全量（站点掩码保交叉对卡
 *   ——%4 = 绳卡 5126 + 刺卡 802 + 浆果 ~300×4 的 Mid 带适配，vs 水杉 %3）；
 * - Low 皮 750 = 主干 78 + L1 672（21 ×4 段 ×4）；叶 = 保留簇 / 5 × 2 三角
 *   （单切向竖卡）；浆果省略（远距亚像素）。
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
    // 径向 12/7/6/5/4/4 → 6/5/4/3/3/3 + 隔 1 抽 1 + L4/L5 末级细管不发射（末级径
    // ≈3.5–5mm，Mid 观距亚像素；簇位照常派生）+ **站点级隔 4 抽 1（siteOrdinal % 5
    // === 0——整簇保留交叉双卡**：单面卡无角度覆盖，Mid 抽 4/5 簇位保对卡，角覆盖
    // 与面数同守；刺卡全局序同掩码）+ 浆果全量保留（身份信号——双熟度并存）
    // 〔密度校准 2026-09-29：%4 → %5——簇 13/9 全槽同调后 Mid 带适配（slot-2/7
    // 压回 ≤10000；012.2 LOD 保带先例同款手法）〕
    return {
      radial: [6, 5, 4, 3, 3, 3],
      stationStep: [2, 2, 2, 2, 2, 2],
      emitTube: [true, true, true, false, false],
      siteEmitEvery: 5,
      shellCards: false,
    };
  }
  // Low：主干 + L1 层枝极简管（径向 6/4）；L2–L5 不发射（递归照常走完消费 rng/
  // 派生簇位）；冠层转壳卡模式（单切向竖卡 × 隔 5 簇抽取——「Low 单卡」冻结接口）；
  // 浆果省略（远距亚像素——记档同先例）
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

// ── 锥度管发射（家族方法复制：平行传输标架 + 外向绕制四边形；无树皮起伏——圆柏
//    第 16 树皮语言〔灰-灰褐基调纵长条片剥落〕为纯材质语言（ConiferBarkProfile
//    全组 3b 消费），几何侧零起伏场。**v 域逐管归一**：vScale = TUBE_V_MAX / 全弧长
//    ——三级帧域浆果卡自 1.0 起，任意管长按比例缩放恒落 [0, 0.92]（水杉防线的
//    全程推广）────────────────────────────────────────────────────────────────────

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

// ── 浆果双熟度账目（零 rng——koelreuteria 账目法改写；「足额候选 posHash 排序 +
//    keep 抽选」；无柄腋生 + 双熟度分类 = 圆柏改写，vs 雪松直立如烛 / 水杉长柄下垂）──

/** 浆果烘焙卡原料（账目抽选后的成卡：位置 + 熟度类 + 尺寸 + 色档 u + 外倾方位/幅度） */
interface BerryCard {
  x: number;
  y: number;
  z: number;
  /** 卡半幅（果径 × BERRY_CARD_SCALE × 0.5——young ×0.72 先乘） */
  half: number;
  /** 双熟度类（u 色档域身份：mature 翌年霜熟果 / young 当年绿幼果——3b 冻结编码） */
  cls: 'mature' | 'young';
  u: number; // 逐果色档 ∈ [0.02, 0.98]（位置散列——材质色档通道）
  az: number; // 外倾方位（位置散列）
  sag: number; // 外倾幅度 ∈ [0,1]（位置散列）
}

/**
 * 浆果账目主函数（收冠后统一执行——簇位/枝位已定，纯确定性零 rng）：
 * 1. 候选池 = 上半冠（挂点高 ≥ 主干顶 × BERRY_CROWN_GATE 的层位）L5 末级鳞枝的
 *    外段结果带候选位（每枝 coneCandidates 3 位，t = fruitingZone 0.58 → 1 均布
 *    ——「小枝腋生/节间散生 2–4 枚小簇」的节间位映射）；
 * 2. posHash 排序 + coneKeepRatio 抽选（保留前 ⌈池 × keep⌉ 位——排序确定性，同
 *    seed 同果集；跨 seed 因布点差异自然去克隆）；
 * 3. 逐果熟度分类（classRoll < coneClassRatio 0.75 → 翌年霜熟果〔主导——s07 色
 *    构成 暗蓝紫 70–80% + 霜蓝 15–20% Observed〕/ 其余当年绿幼果——「两年熟 →
 *    同树同枝双熟度并存」s08 双问直证）；
 * 4. 尺寸 coneSizeMin/Span + 熟度缩放（young ×0.72——当年幼果未膨大）——位置散列抽样。
 * 量级定档：候选 ≈ 上半冠 L5 枝数 × 3 × keep ≈「中量-较多」（Spec §5.2 Observed
 *    ——族内第三档位：雪松如烛正向 / 水杉轻量 / 圆柏多果霜蓝显眼；探针复核记档）。
 */
function accountBerries(ctx: BuildCtx, profile: ConiferShapeProfile): BerryCard[] {
  const pool = ctx.berryCandidates.filter((c) => c.heightFrac >= BERRY_CROWN_GATE);
  const sorted = [...pool].sort(
    (a, b) => posHash(a.x, a.y, a.z, 1.7) - posHash(b.x, b.y, b.z, 1.7) || a.x - b.x || a.y - b.y || a.z - b.z,
  );
  const keepCount = Math.ceil(sorted.length * profile.coneKeepRatio);
  const berries: BerryCard[] = [];
  for (let i = 0; i < keepCount; i++) {
    const c = sorted[i]!;
    const classRoll = posHash(c.x, c.y, c.z, 3.3);
    const sizeRoll = posHash(c.x, c.y, c.z, 5.9);
    const young = classRoll >= profile.coneClassRatio; // < 0.75 → 翌年霜熟果主导
    const size =
      (profile.coneSizeMin + sizeRoll * profile.coneSizeSpan) * (young ? BERRY_YOUNG_SCALE : 1);
    // u = 熟度分类 + 带内色档（3b 冻结编码：u ≥ 0.5 熟果 / u < 0.5 幼果——posHash 带内变奏）
    const uBand = young ? BERRY_U_YOUNG : BERRY_U_MATURE;
    const uRoll = posHash(c.x, c.y, c.z, 7.7);
    berries.push({
      x: c.x,
      y: c.y,
      z: c.z,
      half: (size * BERRY_CARD_SCALE) / 2, // 沿垂轴帧方卡半幅（SDF 留边）
      cls: young ? 'young' : 'mature',
      u: uBand.min + uBand.span * uRoll,
      az: posHash(c.x, c.y, c.z, 9.1) * Math.PI * 2,
      sag: posHash(c.x, c.y, c.z, 11.3),
    });
  }
  return berries;
}

/** 外倾轴构造（浆果共用：竖直向下 + 微外倾水平分量——无柄腋生的近球姿态） */
function sagAxis(az: number, sagAmount: number, sagGain: number): THREE.Vector3 {
  const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).multiplyScalar(sagAmount * sagGain);
  return new THREE.Vector3(0, -1, 0).add(out).normalize();
}

/**
 * 单枚浆果发射：**无柄腋生交叉方卡**（2 卡 × 2 tri——交叉方位对展）：卡根坐挂点
 * （微沉 BERRY_SINK 贴枝腋——「短柄散生」无柄化 vs 水杉长柄下垂），卡体沿外倾轴
 * （竖直向下 + 微外倾）对展。uv：v∈[1.0, 1.95] 沿果轴帧（根 base → 尖 tip——
 * **三级帧域冻结接口 2**，根 1.0 恰落 v ≥ 1.0 的浆果侧 ✓）；**u = 熟度分类 + 带内
 * 色档**（3b 冻结编码：u ≥ 0.5 翌年霜熟果 / u < 0.5 当年绿幼果；果内 12 顶点同值
 * ——材质双色值 + 白霜层通道消费归 3b）。法线 = 宽轴 × 外倾轴（双面读向）；
 * aLeafRand/aBend 随皮组恒 0（浆果刚性——摆动语义归材质层/缺口候选）。
 */
function emitBerryCard(sink: BarkSink, berry: BerryCard): void {
  const root = new THREE.Vector3(berry.x, berry.y - BERRY_SINK, berry.z);
  const axis = sagAxis(berry.az, berry.sag, BERRY_SAG);
  const domain = BERRY_UV;
  for (let k = 0; k < 2; k++) {
    const az = berry.az + (k * Math.PI) / 2; // 交叉方位（第二卡正交）
    let w = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    w = w.clone().sub(axis.clone().multiplyScalar(w.dot(axis))).normalize(); // ⊥ 外倾轴
    const center = root.clone().addScaledVector(axis, berry.half);
    const r0 = center.clone().addScaledVector(w, -berry.half);
    const r1 = center.clone().addScaledVector(w, berry.half);
    const t0 = r0.clone().addScaledVector(axis, berry.half * 2);
    const t1 = r1.clone().addScaledVector(axis, berry.half * 2);
    const n = w.clone().cross(axis).normalize();
    const verts: [THREE.Vector3, number, number][] = [
      [r0, berry.u, domain.base],
      [r1, berry.u, domain.base],
      [t1, berry.u, domain.tip],
      [r0, berry.u, domain.base],
      [t1, berry.u, domain.tip],
      [t0, berry.u, domain.tip],
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
 * LOW_SHELL_MARGIN；六顶点卡 / aLeafRand / aBend 契约与 High 绳卡同构（根边 v 域
 * 基 / 尖边 v 域顶；**aBend 沿用簇位弧长权重**（clusterBends 平行账——沿枝弧长
 * 语义 Low 档不失；尖边 = 根 + 0.28 末级跨度）。**uv v∈[0, 0.99] 绳卡帧**（壳卡 =
 * 整簇抽象 → 材质 Low 档 8 元素绳 SDF 同帧——「Low 单卡」冻结接口）。
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
 * **三级帧域按 kind 分域（冻结接口）**：绳卡 v∈[0, 0.99]（根 0 → 尖 0.99——
 * 1.0 判别阈值安全边距，见 CARD_V_TIP）/ 刺卡 v∈[2.0, 2.95]（针基 2.0 → 针尖
 * 2.95——cedrus 散生单针帧 v 基平移；根 2.0 恰落 v ≥ 2.0 刺卡侧 ✓）；bend 值随
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
  const vBase = card.kind === 'rope' ? 0.0 : 2.0; // 三级帧域：绳 [0,1) / 刺 [2,3)
  const vTip = card.kind === 'rope' ? CARD_V_TIP : 2.95;
  const half = card.width / 2;
  const r0 = card.center.clone().addScaledVector(card.side, -half);
  const r1 = card.center.clone().addScaledVector(card.side, half);
  const t0 = r0.clone().addScaledVector(card.dir, card.height);
  const t1 = r1.clone().addScaledVector(card.dir, card.height);
  const n = card.side.clone().cross(card.dir).normalize();
  const verts: [THREE.Vector3, number, number, number][] = [
    [r0, 0, vBase, card.bendRoot],
    [r1, 1, vBase, card.bendRoot],
    [t1, 1, vTip, card.bendTip],
    [r0, 0, vBase, card.bendRoot],
    [t1, 1, vTip, card.bendTip],
    [t0, 0, vTip, card.bendTip],
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
 * 拓扑：主干（含根部微膨 flare ×1.15 低值端，顶 = 树高 − max(顶梢段, 冠顶形成位
 * ——柱/卵冠钝圆收顶预留））→ tierCount 密层
 * × tierBranchCount 散生对（**层间随机旋 rng 方位散布** + 高度域大抖动 + 层角梯度
 * + 柱/卵双型层半径轮廓）→ L2–L5 递归（紧密直伸 droop 链 + fringe 近平加长）→
 * 顶梢（通直微倾 + leaderDroop 0 短路 + 固定绳簇 + 幼态梢刺卡）；末两级绳簇散生
 * 挂点 + 刺卡 minority；收冠后：通道过滤（tierGapBand 0 → 密度场整场短路）→
 * 浆果双熟度账目（零 rng）→ 烘焙（Mid 站点掩码 / Low 壳卡）。profile 缺省 =
 * slot-0 标准组合（锚点回落——单测直调便捷路径）；level 缺省 = 'high'（三档同流
 * 派生）。
 */
export function buildJuniperusGeometry(
  rng: () => number,
  profile: ConiferShapeProfile = JUNIPERUS_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): JuniperusGeometryResult {
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
    berryCandidates: [],
    awlOrdinal: 0,
    leaderPeakY: 0,
    leaderTipY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（profile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = profile.totalHeight; // 形态参数域树高直读（= 3b 风动树高锚同源——无独立锚）
  const crownRadius = totalHeight * profile.crownWidthRatio * 0.5 * (0.94 + rng() * 0.12); // 冠幅半径（±6% 抖动）
  const trunkBaseR = totalHeight * (TRUNK_BASE_FACTOR + rng() * TRUNK_BASE_SPAN); // 等比干径（8m → 0.12–0.152m）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.04)); // 主干倾轴（干通直 s01/s03/s04 Verified——工程幅度）

  // ── 层位退化路由（身份核心）：主干顶 = 树高 − max(顶梢段, 冠顶形成位)——柱/卵
  //    冠钝圆收顶的冠顶由顶部枝列形成（CROWN_TOP_RISE_FACTOR 预留，见常数注）；
  //    tierCount 密层均匀布层 + tierSpacingJitter 0.50 大抖动破层（高度域连续散布
  //    ——层位读向被散布覆盖）──
  const leaderLen = totalHeight * profile.leaderLengthRatio * (0.92 + rng() * 0.16);
  const crownTopRise =
    CROWN_TOP_RISE_FACTOR * crownRadius * profile.tierRadiusTaper * TIER_BRANCH_LENGTH_FACTOR;
  const trunkTopY = totalHeight - Math.max(leaderLen * LEADER_RISE_FACTOR, crownTopRise);
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

  // ── 主干：12 环段锥度曲线（trunkFlareRatio 干基微膨 ×1.15 低值端 × trunkTaperRatio 锥度）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * profile.trunkTaperRatio;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + (profile.trunkFlareRatio - 1) * Math.exp(-t * 7); // 干基微膨（1.15 低值端——快速衰减）
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < profile.trunk.segs) {
      dir.add(randUnit(rng).multiplyScalar(profile.trunk.wander)).normalize(); // 主干通直（wander 0.015 三例最低）
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

  // ── L1 散生层枝 × tierCount 层 × tierBranchCount 枝（高度域连续散生骨架——身份核心）──
  //    方位：phase0 全冠锚 + **逐层随机旋 tierRot = rng()×2π**（散生 rng 方位散布主
  //    消费——tierPhaseStagger 省略的「近轮随机」语义端；跨层去相干 → 全冠方位均匀
  //    化）+ rank × 均分步进（散生对 ±180°）+ crownAsymmetry 抖动（slot-5 偏冠 =
  //    散生对内 rank 破缺——包络不对称读向）；层角梯度：tierAngleBase → tierAngleTop
  //    沿层位插值（自垂直角——下部斜展平展、上部上举贴干）；层半径：mix(1, taper,
  //    u^exponent) 柱/卵双型轮廓（柱端近等宽 / 卵端中下部最宽）。
  const phase0 = rng() * Math.PI * 2;
  const tierAngleSum = new Array<number>(tierCount).fill(0);
  for (let ti = 0; ti < tierCount; ti++) {
    const u = tierCount > 1 ? ti / (tierCount - 1) : 0;
    const angleDeg = THREE.MathUtils.lerp(profile.tierAngleBase, profile.tierAngleTop, u);
    const radiusFactor = THREE.MathUtils.lerp(1, profile.tierRadiusTaper, Math.pow(u, profile.tierProfileExponent));
    const tierR = crownRadius * radiusFactor;
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
      // 枝干通道：层枝基段保护带（密冠露干的通透规则——主干 + 层枝进冠可见）
      ctx.channels.push(
        segOf(attach, attach.clone().addScaledVector(bDir, length * 0.45), Math.max(startR * 2.0, 0.05)),
      );
    }
    ctx.tierAzimuths.push(tierAzRow);
  }

  // ── 顶梢（通直无点头——判定 8：leaderDroop 0 占位短路，顶梢专路不实现）：主干顶
  //    独立枝 + 近直立微倾 + 固定绳簇防裸梢 + 幼态梢刺卡（判定 3 刺叶挂点锚）──
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

  // ── 通透过滤（密实无层连续冠：tierGapBand 0 → 层带密度场整场短路，仅通道硬抑制 +
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

  // ── 浆果双熟度账目（零 rng——收冠后统一；决策表档间同源）──
  const berries = accountBerries(ctx, profile);
  const berriesMature = berries.filter((b) => b.cls === 'mature').length;
  const berriesYoung = berries.length - berriesMature;
  const bakeOrgans = !lod.shellCards; // Low 省略（远距亚像素 6–8mm——记档同先例）
  if (bakeOrgans) {
    for (const berry of berries) emitBerryCard(bark, berry);
  }
  const berryTriangles = bakeOrgans ? berries.length * 4 : 0; // 交叉双卡 × 2 tri

  // ── 烘焙名单：High = 全存活卡；Mid = 候选序掩码子集（emitOrdinal % every === 0
  //    ——整簇保留交叉双卡（绳卡簇序）+ 刺卡全局序同掩码；通透过滤对全候选照常
  //    执行 → Mid 存活卡 ⊂ High 存活卡逐位同位）；Low 壳卡模式不烘焙簇内绳卡
  //    （候选生成/通透过滤/rng 消费已照常走完——消费序列档间恒等）──
  const bakedCards: FoliageCard[] = lod.shellCards
    ? []
    : leafCards.filter((c) => c.emitOrdinal % lod.siteEmitEvery === 0);
  const bakedRope = lod.shellCards ? 0 : bakedCards.filter((c) => c.kind === 'rope').length;
  const bakedAwl = lod.shellCards ? 0 : bakedCards.length - bakedRope;
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

  // ── 层几何组装：树皮（含浆果卡；aLeafRand/aBend 恒 0——属性集一致）──
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
  if (!geometry) throw new Error('程序化资产 asset_tree_juniperus 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  return {
    geometry,
    stats: {
      barkTriangles: (groups[0]?.count ?? 0) / 3 - berryTriangles,
      needleTriangles: (groups[1]?.count ?? 0) / 3,
      needleCards: lod.shellCards ? lowShellCount : bakedCards.length,
      ropeCards: bakedRope,
      awlCards: bakedAwl,
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
      berryCandidatePool: ctx.berryCandidates.filter((c) => c.heightFrac >= BERRY_CROWN_GATE).length,
      berriesMature: bakeOrgans ? berriesMature : 0,
      berriesYoung: bakeOrgans ? berriesYoung : 0,
      berryTriangles,
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
 * **层板垂直速度场**（tierPlateArch 弱拱 + tierEdgeDroop 轻下卷——「大枝斜展上举
 * + 冠面密实」的层板轮廓）；起径 = 主干挂点径 × tierBranchRadiusRatio × rank；
 * 子级递归进 growBranch（L2 起紧密直伸 droop 链）；站点全分辨率计算（游走 rng 全
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
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize(); // 层枝刚直（wander 0.045）
      // ── 层板垂直速度场（弱拱 + 轻下卷——斜展上举层板轮廓）──
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
 * 顶梢（通直无点头——判定 8）：主干顶独立枝——近直立微倾 + leaderDroop 0 占位短路
 * （二次点头项恒零——peak ≈ tip 通直读向，stats.leaderPeakY/TipY 结构证据）+
 * 固定 LEADER_ROPE_CLUSTERS 绳簇（防裸梢——钝圆收顶被鳞叶包裹读向；散生 rng 方位
 * 挂点同管线，簇位入簇账供 canopy proxy）+ LEADER_AWL_CARDS 刺卡（**幼态梢 = 刺叶
 * minority 挂点位**——判定 3 锚：幼树全刺叶 FRPS，顶梢幼态组织刺叶在位）。
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
      d.add(UP.clone().multiplyScalar(-profile.leaderDroop * t * t * LEADER_DROOP_GAIN)).normalize(); // 0 占位短路（圆柏无点头）
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

  // 顶梢绳簇 + 刺卡（固定计数——rng 无条件消费；末级权重 lf 1.0 同 L5）
  const pointAt = (t: number): THREE.Vector3 => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return pts[i]!.clone().lerp(pts[i + 1]!, idx - i);
  };
  emitRopeClusters(ctx, rng, profile, pointAt, LEADER_ROPE_CLUSTERS, LEADER_ROPE_INNER, 4, ROPE_BEND_LF_L5);
  emitAwlCards(ctx, rng, profile, pointAt, LEADER_AWL_CARDS, ROPE_BEND_LF_L5);
}

/**
 * 分枝递归（L2–L5，level 1–4）：路径 = 起点方向 + 每步游走 + **紧密直伸 droop 链**
 * （方向更新减 UP × droop × t × DROOP_GAIN——L2 近平（0.01）→ L5 近零（0.06），
 * 三例最低幅：鳞叶小枝紧密直伸 Verified [1][2] 的姿态语言）；起径 = 父径 ×
 * CHILD_RADIUS_RATIO、末径 = 起径 × LEVEL_END_RATIO；L5 = 浆果候选位（外段结果带
 * ——coneFruitingZone 起 coneCandidates 位/枝，上半冠门控在账目侧——真腋生位，
 * vs 雪松 L2 / 水杉 L3 的账位语言资产侧定）；L4/L5 = 绳簇 + 刺卡双挂点位
 * （双叶型并存——主卡 + minority 位）。
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
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize(); // 主次分级游走（粗枝刚直 → 细枝散乱）
      d.add(UP.clone().multiplyScalar(-spec.droop * t * DROOP_GAIN)).normalize(); // 紧密直伸链（三例最低幅）
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

  // 浆果候选位（L5 末级鳞枝——外段结果带：coneCandidates 位/枝，t = fruitingZone → 1
  // 均布；零 rng 纯位置——posHash 排序抽选在收冠后 accountBerries 统一执行）
  if (level === profile.levels.length - 1) {
    for (let j = 0; j < profile.coneCandidates; j++) {
      const t =
        profile.coneFruitingZone +
        (1 - profile.coneFruitingZone) * (profile.coneCandidates > 1 ? j / (profile.coneCandidates - 1) : 0.5);
      const pos = pointAt(THREE.MathUtils.clamp(t, 0, 1));
      ctx.berryCandidates.push({ x: pos.x, y: pos.y, z: pos.z, heightFrac });
    }
  }

  // ── 双叶型双挂点（末两级 L4/L5——绳簇主卡 + 刺卡 minority）──
  if (level >= profile.levels.length - 2) {
    const isL5 = level === profile.levels.length - 1;
    const clusterCount = isL5 ? profile.clustersL5 : profile.clustersL4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const lf = isL5 ? ROPE_BEND_LF_L5 : ROPE_BEND_LF_L4;
    // ① 绳状鳞卡（主卡——末级鳞叶小枝聚合系统，卡 = 绳形单元）
    emitRopeClusters(ctx, rng, profile, pointAt, clusterCount, inner, level, lf);
    // ② 刺叶卡（minority——cedrus 散生针卡机制复用；幼态梢/旺枝位近景身份细节）
    const awlCount = isL5 ? profile.longShootCardsL5 : profile.longShootCardsL4;
    emitAwlCards(ctx, rng, profile, pointAt, awlCount, lf);
  }

  // 子级递归（L5 末级无子）
  if (level < profile.levels.length - 1) {
    recurseChildren(ctx, rng, profile, lod, level, length, phase, radiusAt, pointAt, tierIndex, heightFrac);
  }
}

/**
 * 绳簇发射（L4/L5 逐枝 + 顶梢共用——簇位 + 交叉双卡，rng 每簇位 7 次无条件消费：
 * t/尺寸/方位/倾侧/滚转/rand/轮廓比）。**散生 rng 方位**（clusterAzimuthStep 省略
 * ——判定 1）：簇位 i 的方位 = rng()×2π 全随机（vs 水杉对生交错 π/2 步进 / 雪松
 * 环列 + 抖动——散生语言的簇级表达）。簇 = 1 位双卡：卡姿 = 方位外伸 + 小倾侧
 * （紧密直伸——无下垂读向）+ 沿枝前向 + 滚转打散；**交叉双卡**（第二卡绕卡轴转
 * 90°——side→法线；零 rng 派生，aLeafRand sin 散列错相）；emitOrdinal = 枝端优先
 * 簇序（Mid 站点掩码整簇保对卡）；aBend = 沿枝弧长 0→1（根 (0.10+0.42t)×lf / 尖
 * 根+0.28lf——末级最大权重 lf）。
 */
function emitRopeClusters(
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
    const size = profile.rosetteCardMin + rng() * profile.rosetteCardSpan; // 1 次（绳卡长）
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
    // 绳卡参数（无条件消费——含被剔除簇位）：rng 全随机方位 + 小倾侧 + 前向 + 滚转；
    // 卡根坐簇心、卡体沿 dir 外伸（根锚卡——aBend 根端 = 簇位弧长权重）
    const az = rng() * Math.PI * 2; // 1 次（散生 rng 方位——clusterAzimuthStep 省略语义）
    let u1 = tangent.clone().cross(UP);
    if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0);
    u1.normalize();
    const u2 = tangent.clone().cross(u1).normalize();
    const radial = u1.clone().multiplyScalar(Math.cos(az)).add(u2.clone().multiplyScalar(Math.sin(az)));
    const tilt = (rng() - 0.5) * ROPE_TILT_SPAN; // 1 次（倾侧——上下对称全方位斜立带）
    const cardDir = radial
      .clone()
      .multiplyScalar(ROPE_RADIAL)
      .add(UP.clone().multiplyScalar(-tilt))
      .add(tangent.clone().multiplyScalar(ROPE_FORWARD))
      .normalize();
    let side = cardDir.clone().cross(tangent);
    if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
    side.normalize();
    const roll = rng() * Math.PI; // 1 次（卡面滚转——打散规则感）
    side.applyAxisAngle(cardDir, roll).normalize();
    const rand = rng(); // 1 次
    const aspect = profile.needleCardAspectMin + rng() * profile.needleCardAspectSpan; // 1 次（绳状细长轮廓比）
    const width = size / aspect;
    if (kept) {
      const normal = side.clone().cross(cardDir).normalize();
      ctx.leafCandidates.push({
        center: center.clone(),
        dir: cardDir.clone(),
        side: side.clone(),
        width,
        height: size, // 绳卡长 = 沿绳轴（根→尖）
        rand,
        clusterIndex,
        kind: 'rope',
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
        kind: 'rope',
        emitOrdinal: clusterCount - 1 - i, // 同簇同序（Mid 掩码整簇保对卡——「交叉双卡 High/Mid 保留」）
        bendRoot,
        bendTip,
      });
    }
  }
}

/** 散生卡簇账索引（刺叶卡不归簇账 = -1——cedrus/ginkgo 同口径） */
const LONGSHOOT_CLUSTER_INDEX = -1;

/**
 * 刺叶卡发射（growBranch 末两级与顶梢共用——逐枝固定计数，rng 每卡 8 次无条件
 * 消费——cedrus 散生针卡机制复用）：t 外段均布 + 黄金角螺旋方位（「刺叶三叶交互
 * 轮生、斜展、疏松」Verified——幼态梢/旺枝位的螺旋散生辐射伸展）+ 抬离枝轴 +
 * 外上前举 + 细长卡（needleCardLen/Aspect 域——0.12–0.20 m 近景聚合映射）。
 * v 域 = [2.0, 2.95] 刺卡帧（三级帧域冻结接口）；emitOrdinal = 全局候选序
 * （Mid 掩码的均匀覆盖位——确定性逐卡递增）。
 */
function emitAwlCards(
  ctx: BuildCtx,
  rng: () => number,
  profile: ConiferShapeProfile,
  pointAt: (t: number) => THREE.Vector3,
  count: number,
  lf: number,
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
    const lift = 0.35 + rng() * 0.35; // 1 次（外上前举分量——刺叶斜展疏松）
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
    const height = profile.needleCardLenMin + rng() * profile.needleCardLenSpan; // 1 次（刺卡长）
    const aspect = profile.needleCardAspectMin + rng() * profile.needleCardAspectSpan; // 1 次（细长轮廓比）
    const rand = rng(); // 1 次
    const bendRoot = (0.1 + 0.42 * t) * lf; // aBend 沿枝弧长（与绳卡同式）
    ctx.leafCandidates.push({
      center: cardCenter,
      dir: cardDir,
      side,
      width: height / aspect,
      height,
      rand,
      clusterIndex: LONGSHOOT_CLUSTER_INDEX,
      kind: 'awl',
      emitOrdinal: ctx.awlOrdinal++, // 全局候选序（Mid 掩码均匀覆盖位）
      bendRoot,
      bendTip: bendRoot + 0.28 * lf,
    });
  }
}

/**
 * 子级递归公共段（growTierBranch / growBranch 共用）：childPlan[level] 挂点序列——
 * 侧枝（**方位 = 父相位 + phaseStep 级内步进**——圆柏 π 二分基步进：侧枝自父方位
 * 反侧展开的冠内体积填充 + 抖动 + 上举混合）与末位 1.0 延伸枝（延续父向 + 轻微
 * 上扬与游走）；子枝长 = 父长 × CHILD_LENGTH_RATIO[level]（±CHILD_LENGTH_JITTER）
 * ——末级（L4→L5）再乘 fringeLengthRatio（直伸近平加长）；每子恰 4 次 rng（t 抖动
 * + 方位组 2 / 延伸 randUnit 2 + 长 1——延伸/侧枝两形态消费数恒等）。
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
      // 延伸枝：延续父向 + 轻微上扬与游走（密冠外缘延伸/直伸延续）
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
