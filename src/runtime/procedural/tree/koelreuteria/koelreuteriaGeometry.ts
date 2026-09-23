/**
 * runtime/procedural/tree/koelreuteria/koelreuteriaGeometry —— 栾树（Koelreuteria
 * bipinnata Franchet 复羽叶栾树 FOC 广义——生产主力相黄山栾树相（小叶全缘端），无患子
 * 科栾树属落叶乔木——公园单干中龄个体 ≈10m）CPU 几何生成器（T011.6，阔叶家族第七
 * 实例——方法复制自夏栎第一实例经朴树（T011.1）/香樟（T011.2）/榉树（T011.3）/银杏
 * （T011.4）/悬铃木（T011.5）六次验证的通路 ../platanus/platanusGeometry，契约字段
 * 语义不变：五级递归分枝拓扑 / 锥度管状枝干 / 枝梢驱动叶簇 / 冠内通透三规则 / 树皮
 * 近景微起伏 / LOD 三档同流派生全部沿用；栾树数值与算法细节差异点见下）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级递归
 *      分枝拓扑 → 锥度管状枝干（平行传输标架）→ 枝梢驱动**复叶卡**烘焙 + **顶生圆锥
 *      花序交叉卡**（夏花）+ **灯笼蒴果串**（秋果），产出树皮/叶两层非索引几何；层间
 *      mergeGeometries(useGroups=true) 恰 2 组（D15 免组膨胀：皮 0 / 叶 1——**花与果
 *      入皮组（组 0）**，材质接口约定见下）。形态参数类型 = 阔叶家族契约
 *      ../broadleaf/broadleafShapeProfile（栾树为第七实例），数值与槽组合见
 *      ./koelreuteriaShapeProfile（全部数值依据 docs/research/koelreuteria-
 *      reference.md Spec 1.0——**生产以文末「终审记档」④ 生产口径终版 + 「主代理补充
 *      证据记档」为准**：复叶计数域裁决 2、花果覆盖率裁决 3、果尺寸锚文献裁决 4、
 *      树高锚 10m 裁决 7、树皮浅色光滑 + 皮孔麻点终版、多干记档不建模）；build 只做
 *      slot → profile 路由，不进 ProceduralBuild 公共签名。
 * 栾树算法细节差异点（vs 悬铃木模板，逐条 Spec 引用见 koelreuteriaShapeProfile
 * 内联注释）：
 *   - 尺度锚：公园单干中龄个体 ≈10m（主代理裁定——8–12m 弱 Inferred 收口 9–11 默认
 *     10，终审裁决 7；速生上探 12 变体入 slot-1）——形态参数域树高 9.7–10.5m；干高
 *     参数域 0.26–0.32（trunk_height_ratio Unknown + form-b ≈2m 低分枝单源弱方向）；
 *     根径 0.24–0.30m（DBH Unknown——工程设定，速生比例瘦干读向）。
 *   - 干形：近直立单干（多干栽培变体 NC「often multi-stemmed」[9] 现象 Verified——
 *     **记档不建模**：结构差异不落连续参数，platanus 低位双主枝同款纪律）→ 主干倾轴
 *     幅度 ≤2.9°（jitter 0.05）；根部 flare 轻度 1.18×（basal_flare Unknown——家族
 *     常量）。
 *   - 树形：**开展圆头-伞形冠、轮廓不规则微起伏**（fruit-f + 园艺 spreading/irregular
 *     [8][9] per 终审裁决 3 + form-b 低分枝开展伞形单干）——几何侧驱动链（T009.3
 *     消费语义）：**低挂高段**（0.55–0.73 + 干高参数域 0.26–0.32）+ **广角开展骨架**
 *     （40–56° 起角）+ **ascending→arching 外弯漂移**（SCAFFOLD_ARCH：大枝先直立后
 *     外弯下倾「Branches are upright but bend down somewhat as the tree grows」wiki
 *     EN Verified [8] + NC「branches may droop」[9]——沿枝 t 增强的外向 + 下垂漂移，
 *     确定性零 rng）+ upturn 链低正（[0.12,0.10,0.07,0.03]）+ **L5 微负（−0.02，七
 *     实例首个含负链——枝梢微下垂** [8][9]）+ 干向长度分级（×1.08→×0.76 开展圆头）+ 角度梯度
 *     （低枝 +8…+10° 平展 / 高枝 −5…−7° 圆头闭合）+ 散布方位 + 领导中庸 0.50。
 *   - **复叶卡挂点语言（家族复叶首例核心，Step 1 判定 = 1 卡承载整枚二回羽叶——
 *     分卡方案 35–70 小叶卡 × 挂点数爆预算 vs 单卡 2 tri、档间连续（单卡 SDF 细节随
 *     档简化）、近景读出（SDF 沿轴多小叶）三判据，主代理裁定）**：家族「叶簇」槽位
 *     = 末级枝互生平展疏簇——簇内复叶卡方位 **黄金角互生螺旋**（φ_j = j×137.5° +
 *     抖动——「叶互生」属级 Verified [6]，语言继承 platanus）+ **平展取向**（PLANE_LIFT
 *     0.10——「叶平展」FRPS Verified [2]、分层摊开非球面随机（域扩展节 B
 *     leaf_orientation_dist）；低于悬铃木平展 0.12）+ 略前倾（FORWARD_TILT 0.24）+
 *     弱抖动（WOBBLE 0.15）；每簇 3 候选（真羽叶互生节距 8–15cm × 卡长 0.63–0.93 ⇒
 *     ≈5–10 节/卡长的连续节位合并抽象——「1 枚羽叶/挂点」域扩展节 B 的工程映射），
 *     通透过滤后逐簇存活典型 1–3 枚；**卡宽/长比冻结 0.60**（aspect = 1/0.60 ≈
 *     1.6667 恒定、span 0——尺寸抖动仅缩放不改比例；羽叶长轴沿卡 v 轴、SDF 按此
 *     比例设计——材质-几何冻结接口）；卡宽 0.38–0.56（真复叶 45–70cm Verified [2][4]
 *     × ≈1.4 工程映射——复叶 SDF 满幅绘制多小叶、无单叶卡叶缘余量需求，映射系数低
 *     于单叶 ×2 先例口径记档）；大簇（0.24–0.34）+ 大间距抑制（minSeparation 0.58×
 *     径和——疏簇大间隙读向）。小叶结构（羽片 4–5(–6) 对 × 每羽片 5–7(–9) 枚 + 顶生
 *     小叶 / 小叶斜卵形 / 全缘主力↔细齿变体 / 近无柄 / 基部偏斜）全部归
 *     koelreuteriaMaterials 复叶 SDF 层（几何不建模）。
 *   - **夏花（Spec 判定做——顶生大型圆锥花序 30–70cm、金黄-橙黄团块集中冠面上部
 *     外缘、覆盖率 10–25%（生产口径终版 ④-3；「聚伞圆锥花序大型，顶生，很少腋生」
 *     属级 Verified [5][6] + 花序高出叶幕 [12]）**：每花序 **一对交叉竖卡**（2 卡 ×
 *     2 tri billboard 十字，主代理冻结接口）；花卡宽/长比 **0.65 冻结**；卡长
 *     0.52–0.82（真花序 30–70cm × ≈1.2 映射）、卡心上抬簇心上方 0.26–0.50m（高出
 *     叶幕）；挂点 = 保留 L5 簇位（末级枝顶——顶生语义）**确定性区域判据**（冠上部带：
 *     保留 L5 簇位 Y 排序第 55 百分位以上 ∧ q ≥ 0.30 内位弱滤——百分位口径自校准
 *     簇质量分布，见 FLOWER_PCTL 注释）+ 位置散列排序 + 固定步长抽选（FLOWER_STRIDE
 *     2）——**零 rng 消费**（确定性挂点账目法，vs platanus 果序 rng roll 引起的组 0
 *     带状浮动先例——本例规避记档）；花卡 uv：**u = 逐花序相位 ∈ [0,1)（位置散列，
 *     序内 6 顶点同值——材质相位/变奏通道）、v ∈ [5.0, 5.95] 花域**（沿卡长根 5.0 →
 *     尖 5.95，< 6 与果域隔离——v∈[5,6) 冻结口径）；aLeafRand/aBend 随组 0 恒 0
 *     （花穗刚性——下垂摆动未表达归缺口候选）。
 *   - **秋果（Spec 判定做——灯笼蒴果序偏冠缘、覆盖率 15–30%、多色并存（④-4；蒴果
 *     4–7 × 3.5–5cm 中值 5.5×4.2、钝圆顶小凸尖、三棱 Verified [2][4]——尺寸锚文献
 *     域 per 终审裁决 4）**：**八面体灯笼 8 tri/果**（platanus 果球方法复制）真径
 *     ×2 工程映射 → 径 8.4–14cm（半径 0.042–0.070）；**串状挂点**（大型果序轴排布、
 *     后转下垂 [12]——垂挂弧链 5–6 灯笼 × 步距 0.12–0.16m = 串长 0.48–0.80m ≈ 真
 *     果序 30–70cm 同级）：挂点 = 保留 L5 簇位**确定性区域判据**（冠缘中下带：Y 排序
 *     第 50 百分位以下 ∧ q ≥ 0.50 冠外半滤——与花带（第 55 百分位以上）留 5 百分位
 *     中立带不相交，**空间分工避免同点重叠**，
 *     合计冠面非绿信号 ≈25–45% 中庸）+ 散列排序 + 步长抽选（FRUIT_STRIDE 2）——零
 *     rng；灯笼 uv：**u = 逐果色档随机 ∈ [0,1)（位置散列，果内 24 顶点同值——材质
 *     果色档通道：色序 绿→黄绿→鲑粉→玫红→褐 同树并存 [2][4][12]）、v ∈ [6.0,
 *     6.97] 果域**（v∈[6,7] 冻结口径）；aLeafRand/aBend 恒 0（刚性悬垂——摆动语义
 *     归材质层/缺口候选）。
 *   - **uv 域身份标记三重隔离（platanus v∈[2,3] 与皮管弧长域碰撞 66 顶点重叠先例
 *     教训——探针断言强制）**：皮管 v = 累计弧长 × 0.5 ≤ ≈2.0（10m 级最长枝弧
 *     ≈4m）｜花 v∈[5.0, 5.95]｜果 v∈[6.0, 6.97]——**皮管弧长域不得侵入 [5,7]**：
 *     测试探针断言「v∈[4,5) 顶点数 = 0（隔离带空）+ 花域顶点 = 花卡 × 6 + 果域
 *     顶点 = 灯笼 × 24 + 皮组其余顶点 v < 4」（koelreuteriaStructure 测试锁）。
 *   - 骨架：**5 骨架枝 + 1 领导枝**（wiki EN「few branched」[8] 大枝少而粗弱读 +
 *     花果双信号组 0 预算余量）；拓扑 L1=6 → 枝数 [6,18,54,162,324]、簇位 810（L4
 *     162×1 + L5 324×2）、皮面 20782。
 *   - 密度语言：中-疏（空隙 ≈20–30% Inferred [12]）：壳带 0.50 + 芯层地板 0.08
 *     （中心透光 [12]）+ 大空腔 0.50–0.88 + 疏簇浅壳（clusterShellBias 0.40——
 *     互生散布平摊）。
 *   - 树皮近景微起伏：**浅色光滑浅浮雕最浅档**（主代理补充证据终版：bark-b 双系统
 *     一致「浅灰白-灰褐光滑粉质感 + 密布皮孔点 + 局部浅细纵裂 + 无剥落」——皮孔麻点
 *     /浅色粉质感主体在 koelreuteriaMaterials 材质层，geometry 只管浅起伏）——
 *     amplitudeRatio 0.013（榉 0.015/悬铃木 0.014 光滑端再收一档——**七实例最浅**）
 *     + 谐波 {3,5,6}（低频浅斑）+ drift 5 rad/m（局部浅细纵裂的轴向连续——纵裂沿
 *     轴伸展 = 低游走；银杏 2.6 纵脊连续 / 悬铃木 11 断裂拼贴之间的中低档）。机制
 *     不变：纯确定性函数零 rng；幅度 ∝ 局部半径（0.013 下起径 <0.115m 的管平滑发射
 *     ——L1 骨架起径 0.09–0.11 亦在地板下：**仅主干有效起伏**、全部分枝管光滑（浅
 *     色光滑 + 皮孔麻点主体在材质层的读向——主干环极差/均径实测 1.7–2.2%、峰极差
 *     ≈6mm，L1/L5 环极差 = 0 探针实测）；主干 radial
 *     14（奈奎斯特域 7 容纳 k=6 留 1 档边际）。
 * 不建模（Spec 有事实、几何不表达——记档见 koelreuteriaShapeProfile 模块头）：
 *   二回羽叶内部结构/小叶缘相轴（归材质 SDF）/花瓣与瓣基橙红斑（归材质）/蒴果色序
 *   细节与膜质网纹（归材质 u 通道）/花序-果序分支结构（卡/串抽象）/秋色黄/冬态宿存
 *   干果/多干丛生（记档不建模）/幼态一回羽状叶（Unknown）/芽（Unknown）/新叶色
 *   （Unknown）/小枝疣点皮孔与红褐一年生枝（归材质）。
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等（High 20782：主干 406
 *      （14 段 ×14 + 底盖 14）+ L1 864（6 枝 ×9 段 ×8）+ L2 2016（18 ×8 段 ×7）+
 *      L3 3240（54 ×5 段 ×6）+ L4 6480（162 ×4 段 ×5）+ L5 7776（324 ×3 段 ×4）；
 *      枝数 [6,18,54,162,324]——5 骨架 + 1 领导）；簇位数 810（L4 162×1 + L5 324×2）/
 *      每簇 3 卡为计数类（rng 消费次数恒定），**花果挂点零 rng**（确定性账目——无
 *      消费口径问题），保留簇数与实际叶卡数随 seed 由簇级距离抑制 + 通透规则确定
 *      （同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律原样沿用）：簇生成与叶片候选的 rng 消费均为无条件固定次数
 *      （每簇 2 次 + 每疏簇叶 8 次），被簇级距离抑制丢弃的簇位足额消费后丢弃；通透
 *      roll 每卡无条件 1 次——任何条件跳过都禁止（档间同理：Mid/Low 的发射省略不
 *      省略消费）。**探针闭包教训（011.3 ③）**：rng 消费计数必须用包裹 rng 闭包实测
 *      （每次调用即计数），不得事后重建流复算——消费次数以测试锁定快照为准。结构
 *      消费全部固定次数；总消费数随保留簇数变化（通透 roll 计数 = 存活候选数）——
 *      槽内三档恒等（同 seed 同保留簇集）、跨槽/跨 seed 随保留簇数浮动（实测带见
 *      koelreuteriaStructure 测试快照注释）。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值；皮组
 *        （含花/果）顶点树皮语义位恒 0；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，卡内根→尖非降（根 0.12·hw / 尖 0.52+
 *        0.44·hw，hw = 冠内高度权重）；树皮层同名属性写恒等值 0；**花/果恒 0**（随
 *        皮组——花穗/果串刚性悬垂，摆动语义归材质层；下垂摆动未表达归缺口候选）。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0）；叶卡 UV 标准 0–1 四边形
 *      域（v 轴 = 羽叶长轴——复叶 SDF 消费归 koelreuteriaMaterials——并行交付，签名
 *      冻结：createKoelreuteriaLeafMaterial / createKoelreuteriaBarkMaterial /
 *      createKoelreuteriaLeafDepthMaterial，均 (level?) => 材质）；**花卡 uv u = 逐
 *      花序相位 / v∈[5.0,5.95]、灯笼 uv u = 逐果色档 / v∈[6.0,6.97]**（几何身份
 *      标记——花果入皮组接口记档，见上）；叶法线取卡面单侧（cross(side, dir)）。
 * LOD 三档（T011.6，家族方法逐位复制：level 为 Runtime 可选参数——不参与
 *      shapeSlot/morphSeed/sourceKey 形态身份计算；档位缓存维度 = sourceKey + level 归
 *      ProceduralSourceCache）：三档共用**同一条 rng 消费流**与同一套骨架/簇位/花果
 *      决策路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/叶候选/花果
 *      照常决策（花果零 rng，决策 = 同一簇位表 + 同一区域判据 + 同一散列抽选——逐位
 *      同源），枝路径/簇位/花果挂点/冠形包络/通透过滤决策逐位同源：
 *      - High：全发射（缺省档；皮面数 20782）；树皮微起伏保留；花果全量烘焙；
 *      - Mid：径向段数降（主干/五级 14/8/7/6/5/4 → 6/5/4/3/3/3——粗枝保圆度、细枝
 *        三边管）+ 轴向站点隔 1 抽 1 发射（站点全算·游走 rng 全消费）+ L5 末梢管不
 *        发射（末梢径亚厘米，Mid 观距亚像素；簇位/花果挂点照常派生）+ 簇内叶卡掩码
 *        j % 3 === 1（疏簇 3 候选中 1 张（33%）——被弃候选足额消费 rng 后不进烘焙；
 *        通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位同位）+ 树皮微起伏
 *        保留 + **花果全量保留**（身份信号——金黄花团/粉红灯笼串中距可读 [12]，花
 *        4 tri/序 + 8 tri/灯笼预算轻）；皮 3882；
 *      - Low：主干 + L1 骨架极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（每保留簇 2 张交叉竖卡，半幅 = 簇半径 + 0.58m
 *        余量（复叶大卡尺度：卡长 0.63–0.93 的常态伸出中位 ≈ 半卡长，取 0.58 使壳卡
 *        吞并簇半径 + 常态伸出域；极值叶尖（≤ 簇半径 + 0.93 斜伸出）仍由 High 决定
 *        冠包络——Low 水平跨实测窄 ≤1.0m（复叶大卡极值伸出），档间连续记档、Lod
 *        测试容差 1.1m）；宽轴 = 0.60 × 半幅——**复叶卡比例在
 *        Low 壳卡延续**）+ **花果不发射**（Low 观距花穗/灯笼亚像素——省略记档，档
 *        间连续记档同 platanus 果序先例）；皮 330。
 *      预算锁定账目（8 槽 × 3 档实测带 + 锁定依据）见
 *      ../assets/asset_tree_koelreuteria.asset 模块头（预算制 D19.8，家族行沿用）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { KOELREUTERIA_SLOT0_PROFILE } from './koelreuteriaShapeProfile';
import type { BroadleafBarkRelief, BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface LeafCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖；疏簇复叶卡恒指簇外平展——卡根朝簇心）
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
 *  栾树语义 = 末级枝互生平展疏簇的簇空间 + 花果承载位（L5 簇位 = 顶生花序/果序候选） */
// ——T021.6 收编家族共享契约：类型真相源 = ../broadleaf/broadleafClusterField（本地名零 churn）
type ClusterRecord = BroadleafClusterRecord;

/** 单个灯笼果记录（八面体发射原料：果心 + 半径 + 色档 u） */
interface FruitLantern {
  center: THREE.Vector3;
  radius: number;
  /** uv u = 逐果色档随机 ∈ [0,1)（位置散列——材质果色档通道：色序多代并存 [2][4][12]） */
  colorRoll: number;
}

/** 果序挂点记录：1 串下垂弧链灯笼（4–6 枚） */
interface FruitSite {
  lanterns: FruitLantern[];
}

/** 花序挂点记录：一对交叉竖卡（billboard 十字——2 卡 × 2 tri） */
interface FlowerSite {
  center: THREE.Vector3;
  /** 交叉卡水平轴 1（轴 2 = 其水平垂直） */
  axis: THREE.Vector3;
  /** 卡长（米；卡宽 = 0.65 × 长——冻结比例） */
  length: number;
  /** uv u = 逐花序相位 ∈ [0,1)（位置散列——材质花序变奏通道） */
  phase: number;
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

/** 构建上下文：发射槽 + 簇表 + 花果表 + 候选叶卡 + 通道表 + 逐级统计（全树共享，逐枝累加） */
interface BuildCtx {
  bark: BarkSink;
  clusters: ClusterRecord[];
  clustersCulled: number; // 簇级距离抑制丢弃的簇位数（工程账目）
  flowers: FlowerSite[]; // 花序挂点表（保留 L5 簇位确定性抽选——档间同源）
  fruit: FruitSite[]; // 果序挂点表（同上）
  leafCandidates: LeafCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含领导枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点（冠参考系上界）
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface KoelreuteriaGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 叶卡三角（仅卡——leafCards × 2；花/果三角单列） */
    leafTriangles: number;
    leafCards: number;
    /** 花序账目：挂点数（1 对交叉卡/点）/ 花卡数（点 × 2）/ 花序三角（卡 × 2；Low = 0
     *  省略）。入皮组（组 0）——组 0 三角 = 皮拓扑 + 花序 + 果序（守恒） */
    flowerSites: number;
    flowerCards: number;
    flowerTriangles: number;
    /** 果序账目：挂点数（1 串/点）/ 灯笼数 / 果序三角（灯笼 × 8；Low = 0 省略） */
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

/** x → [0,1)（确定性散列分量） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

// ── 栾树复叶卡挂点语言常量（结构常数：槽间恒等——改值即改面数与 rng 消费）──

/** 黄金角（互生叶序螺旋步进——「叶互生」属级 Verified [6] 的簇内方位语言：φ_j =
 *  j×137.5° + 抖动，语言继承 platanus（vs 银杏莲座均分 2π/n——互生 vs 轮生的方位分化） */
const GOLDEN_ANGLE = 2.39996;
/** 疏簇复叶卡取向常量（互生平展语言——连续形态方法常量，非槽差异维度）：
 *  「叶平展」FRPS Verified [2] + 平展分层摊开非球面随机（域扩展节 B） */
const ALT_FORWARD_TILT = 0.24; // 沿枝向前倾分量（× 簇方向 T）
const ALT_WOBBLE = 0.15; // 弱球面抖动（互生自然不齐）
const PLANE_LIFT = 0.1; // 叶尖上举分量（平展摊开——低于悬铃木平展 0.12 [2]）

/** 复叶卡宽/长比（主代理冻结 0.60——卡宽 = 0.60 × 卡长；尺寸抖动仅缩放不改比例；
 *  羽叶长轴沿卡 v 轴、SDF 按此比例设计——材质-几何冻结接口） */
const BIPINNATE_WIDTH_RATIO = 0.6;

/** 干向挂点高度分级锥度（开展圆头剪影驱动：挂点低枝 ×1.08 → 高枝 ×0.76 的确定性线性
 *  分级，零 rng——低枝略长（冠基放张）/ 高枝短（圆头收拢）；与 rank 环内势差正交；
 *  广角 + 外弯漂移 + 本分级 = 开展圆头-伞形冠的骨架侧驱动链，Spec §3 冠形 per 终审
 *  裁决 3。幅度工程设定（外泄回调记档见 shapeProfile crownWidthRatio 注释） */
const SCAFFOLD_LENGTH_TAPER = [1.08, 0.76] as const;
/** 干向挂点高度角度梯度（圆头闭合第二驱动——低枝 +8…+10° 平展（冠基放张）× 高枝
 *  −5…−7° 收角（圆头/伞形顶闭合——弱于银杏锥顶 −8…−10°）。确定性零 rng（作用于
 *  profile 角域两端，槽间角域差异保持）。幅度工程设定 */
const SCAFFOLD_ANGLE_TAPER = { minLow: 8, minHigh: -5, maxLow: 10, maxHigh: -7 } as const;
/** **ascending→arching 外弯漂移**（栾树枝姿身份，wiki EN「Branches are upright but
 *  bend down somewhat as the tree grows」Verified [8] + NC「branches may droop」[9]）：
 *  L1 骨架枝方向游走中沿 t 增强的确定性漂移——外向分量 ARCH_OUT × t（先直立后外弯）
 *  + 下垂分量 ARCH_DROOP × t（外弯下倾）+ 末级 upturn 微负（levels L5 −0.03，见
 *  profile）复合出「大枝先直立后外弯下倾、枝梢微下垂」；外向基向 = 枝基水平径向
 *  （outDir，逐枝常量）。零 rng（确定性）。幅度工程设定（探针回调定档，见
 *  shapeProfile crownWidthRatio 外泄记档） */
const SCAFFOLD_ARCH_OUT = 0.34;
const SCAFFOLD_ARCH_DROOP = 0.1;

// ── 夏花/秋果常量（Spec 判定均做——生产口径终版 ④-3/④-4；确定性挂点账目法：区域判据
//    + 位置散列排序 + 固定步长抽选，零 rng 消费——挂点口径槽间恒等（结构常数）──

/** 花带判据（冠上部——金黄团块集中位 ④-3）：**保留 L5 簇位 Y 排序的第 55 百分位以上
 *  （上部 45%）∧ q ≥ 0.30（内位弱滤——领导链顶区簇贴轴，外缘强滤会结构性饿死花位：
 *  探针实测簇带归一 ny 判带仅 13 序级；百分位口径自校准簇质量分布（实测 L5 簇带
 *  底重——78% 落带底 30%），序数稳定落 40–55）+ 卡心上抬高出叶幕（「上部外缘」的
 *  视觉读位由上抬 + 金黄团块色信号承载 [5][6][12]）；仅 L5 簇位（末级枝顶——顶生
 *  语义）资格 */
const FLOWER_PCTL = 0.55;
const FLOWER_ZONE_Q_MIN = 0.3;
/** 花序抽选步长（散列序每 2 取 1——冠面覆盖率 10–25% 的工程定档：实测 39–47 序/树
 *  （8 槽规范种子，2026-09-21 终测）——「冠面上部外缘金黄团块」中距可读 [12]、远距
 *  省略（Low 档）；无 rng
 *  roll——组 0 带不随 roll 浮动（platanus 果序 rng roll 组 0 带状浮动先例的规避记档） */
const FLOWER_STRIDE = 2;
/** 花卡参数：卡长域 0.52–0.82m（真圆锥花序 30–70cm Verified [2][4]（园艺观测下探
 *  20–30 [8][9]）× ≈1.2 工程映射）；宽/长比 **0.65 冻结**（主代理接口）；卡心上抬
 *  0.26–0.50m（「直立圆锥花序高出叶幕」[12]——顶生上抬） */
const FLOWER_CARD_LEN_MIN = 0.52;
const FLOWER_CARD_LEN_SPAN = 0.3;
const FLOWER_CARD_WIDTH_RATIO = 0.65;
const FLOWER_LIFT_MIN = 0.26;
const FLOWER_LIFT_SPAN = 0.24;
/** 花域 uv 常量：v ∈ [5.0, 5.95]（花域 v∈[5,6) 冻结口径的几何实现——顶边 5.95 < 6
 *  与果域 v ≥ 6.0 严格隔离；沿卡长根 5.0 → 尖 5.95）；u = 逐花序相位（位置散列，
 *  序内恒值——材质花序相位/变奏通道，冻结接口） */
const FLOWER_UV_V_BASE = 5.0;
const FLOWER_UV_V_TOP = 5.95;

/** 果带判据（冠缘中下——鲑粉-玫红团块偏冠缘位 ④-4）：**保留 L5 簇位 Y 排序的第 50
 *  百分位以下（下半）∧ q ≥ 0.50（冠外半——果串外缘滤；探针定档：q 0.60 下 Mid 总面
 *  贴家族行下沿（slot-6 ≈5.9K 越下），0.50 带回 ≈6.4–7.4K）——与花带（第 55 百分位
 *  以上）之间留 5 百分位中立带，**空间分工避免同点重叠**；仅 L5 簇位资格（果序顶生
 *  后下垂 [12]） */
const FRUIT_PCTL = 0.5;
const FRUIT_ZONE_Q_MIN = 0.5;
/** 果串抽选步长（散列序每 2 取 1——冠缘覆盖率 15–30% 的工程定档；零 rng 同花） */
const FRUIT_STRIDE = 2;
/** 灯笼参数（platanus 果球方法复制 + 串状挂点）：真蒴果 4–7 × 3.5–5cm 中值 5.5×4.2
 *  （Verified [2][4]——尺寸锚文献域 per 终审裁决 4）× 2 工程映射 → 径 8.4–14cm ⇒
 *  半径 0.042–0.070m；串 = 下垂弧链 5–6 灯笼（n = 5 + ⌊散列×2⌋ ∈ {5,6}）× 步距
 *  0.12–0.16m（串长 0.48–0.80m ≈ 大型果序 30–70cm 同级 [12]） */
const LANTERN_R_MIN = 0.042;
const LANTERN_R_SPAN = 0.028;
const LANTERN_COUNT_BASE = 5;
const LANTERN_COUNT_SPAN = 2;
const LANTERN_SPACING_MIN = 0.12;
const LANTERN_SPACING_SPAN = 0.04;
/** 果域 uv 常量：v ∈ [6.0, 6.97]（果域 v∈[6,7] 冻结口径——赤道顶点 6.0 / 面尖
 *  6.97 < 7）；u = 逐果色档随机（位置散列，果内恒值——材质果色档通道：色序绿→黄绿
 *  →鲑粉→玫红→褐同树并存 [2][4][12]，冻结接口） */
const FRUIT_UV_V_BASE = 6.0;
const FRUIT_UV_V_TIP = 6.97;

// ── LOD 三档发射计划（家族方法复制——档位只改「发射」，不改骨架决策/rng 消费序）──

/** LOD 发射档：三档共用同一条 rng 流与同一套骨架/簇位/花果决策，差异全在发射密度 */
interface LodEmissionPlan {
  /** 逐管径向段 [主干, L1..L5]（High = profile 原值；Mid/Low 为降段阶梯——粗枝保圆度、
   *  细枝三边管：中景圆度可辨层级以下径向 3 已足，再降破管面下限 3） */
  radial: number[];
  /** 逐管轴向发射站点抽取步长（1 = 全发射；>1 = 每隔 step 站发射一站 + 恒保末站——
   *  站点全算·游走 rng 全消费，路径逐位同 High，发射管为同一曲线的弦近似） */
  stationStep: number[];
  /** L1..L5 逐级是否发射管（false = 只递归不发射——子枝/簇位/花果/rng 照常派生；主干恒发射） */
  emitTube: boolean[];
  /** 簇内叶卡发射掩码（每簇 leavesPerCluster 候选中，仅 j % leafEmitEvery === leafEmitPhase
   *  者进烘焙；候选生成/通透过滤/rng 消费对全候选照常——Mid 存活卡 ⊂ High 存活卡；
   *  疏簇 3 候选 → j∈{1} 1 张（33%）） */
  leafEmitEvery: number;
  leafEmitPhase: number;
  /** Low 壳卡模式：不烘焙簇内叶卡与花果（候选/过滤/花果决策照常），逐保留簇发射交叉壳卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（结构依据见模块头 LOD 段；预算记账 = 8 槽实测口径，正式预算带
 * 锁定见 ../assets/asset_tree_koelreuteria.asset 模块头）：
 * - High 皮 20782（拓扑恒等不动：主干 406（14 段 ×14 + 底盖 14）+ L1 864（6 枝 ×9 段
 *   ×8）+ L2 2016（18 ×8 段 ×7）+ L3 3240（54 ×5 段 ×6）+ L4 6480（162 ×4 段 ×5）+
 *   L5 7776（324 ×3 段 ×4））；Mid 皮 3882 = 主干 90（7 段 ×6 + 底盖 6）+ L1 300
 *   （6 枝 ×5 段 ×5）+ L2 576（18 ×4 段 ×4）+ L3 972（54 ×3 段 ×3）+ L4 1944
 *   （162 ×2 段 ×3），L5 不发射；Low 皮 330 = 主干 90 + L1 240（6 枝 ×5 段 ×4）。
 * - Mid 叶 ≈ High 存活卡 × 掩码率（疏簇 3 选 1 = 33%）+ 花果全量；8 槽实测落 6–10K 带。
 * - Low 叶 = 保留簇数 × 2 壳卡 × 2 三角（花果省略记档）；8 槽实测落 1.5–3K 带。
 */
function lodPlanFor(profile: BroadleafShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    // 缺省档全发射：profile 原值直读 + 步长 1（thinStations 原数组透传）——皮面数
    // 20782 / rng 消费快照（koelreuteriaLod 测试锁）延续
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
    // 不发射（亚厘米径亚像素）+ 叶卡掩码 j%3===1（疏簇 3 选 1——8 槽实测 High 卡 →
    // Mid 总面落 6–10K 预算带的档率）+ 花果全量保留（身份信号 [12]）
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
  // L2–L5 不发射（递归照常走完消费 rng/派生簇位与花果）；冠层转壳卡模式（花果省略）
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

/** Low 壳卡半幅余量（米）：High 疏簇复叶大卡自簇心的最大伸出 ≈ 簇半径 + 卡长
 *  （≤0.93m 斜向——复叶大卡 0.63–0.93 长域），典型伸出（r̂≤1 壳位 + 互生平摊）中位 ≈
 *  半卡长 0.32–0.47m——取 0.58（悬铃木 0.16 的大卡放大档）使壳卡吞并簇半径 + 常态
 *  伸出域，且极值叶尖仍由 High 决定冠包络（Low 不涨出——8 槽实测 Low 水平跨恒窄于
 *  High，差 ≤1.0m：复叶大卡极值伸出，档间 bbox 一致性测试 Low 容差 1.1m 的依据） */
const LOW_SHELL_MARGIN = 0.58;
/** Low 每保留簇壳卡数（交叉双竖卡：任意水平方位至少一卡正面可读——确定性几何，非 billboard） */
const LOW_SHELL_CARDS_PER_CLUSTER = 2;

/** Low 壳卡逐卡身份（aLeafRand 契约值 ∈ [0,1)）：簇心 sin 散列 + 第二卡派生错相（零 rng
 *  ——簇位表跨档同源，壳卡身份随簇确定；同簇双卡色相微错开避免同色块读向） */
function shellCardRandOf(cx: number, cy: number, cz: number, derive: number): number {
  const base = fract01(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453);
  return derive === 0 ? base : fract01(base * 7.31 + 0.37);
}

/**
 * Low 壳卡发射：簇心交叉竖卡——宽轴 w（水平单位向量）× 宽半幅 = 0.60 × 半幅（**复叶卡
 * 比例 0.60 在 Low 壳卡延续**——档间剪影语义一致）、高轴 UP × 半幅；六顶点卡 / uv 0–1
 * 四边形域 / aLeafRand / aBend 契约与 High 叶卡同构（根边 v=0、尖边 v=1；aBend 根
 * 0.12·hw / 尖 0.52+0.44·hw 与 High 同公式同常数——档间风相位/摆幅语义一致，D19.7）；
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
  const halfW = half * BIPINNATE_WIDTH_RATIO; // 复叶卡比例 0.60 延续（宽轴）
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

// ── 顶生圆锥花序发射（交叉竖卡 billboard 十字——2 卡 × 2 tri；花域 uv v∈[5.0,5.95]）──

/**
 * 单花序发射：一对交叉竖卡（轴 1 = site.axis 水平单位向量 / 轴 2 = 其水平垂直；任意
 * 水平方位至少一卡正面可读）。uv 契约（冻结接口）：**u = 逐花序相位 ∈ [0,1)**（序内
 * 6 顶点同值——材质花序相位/变奏通道）、**v = 5.0（卡根/下缘）→ 5.95（卡尖/上缘）**
 * （花域 v∈[5,6) 的几何实现——顶边 < 6 与果域 v ≥ 6.0 严格隔离）；法线 = 轴 × UP
 * （水平——竖卡双面读向）；aLeafRand/aBend 随皮组恒 0（花穗刚性——下垂摆动未表达
 * 归缺口候选）。入皮组（组 0）——koelreuteriaMaterials（park-shader-agent 并行交付、
 * 签名冻结）按 v 域分流花色配方。
 */
function emitFlowerSite(sink: BarkSink, site: FlowerSite): void {
  const halfLen = site.length / 2;
  const halfWid = (site.length * FLOWER_CARD_WIDTH_RATIO) / 2;
  const axis2 = new THREE.Vector3(-site.axis.z, 0, site.axis.x); // 水平垂直（交叉轴）
  for (const axis of [site.axis, axis2]) {
    const n = axis.clone().cross(UP).normalize();
    const r0 = site.center.clone().addScaledVector(axis, -halfWid).addScaledVector(UP, -halfLen);
    const r1 = site.center.clone().addScaledVector(axis, halfWid).addScaledVector(UP, -halfLen);
    const t1 = r1.clone().addScaledVector(UP, site.length);
    const t0 = r0.clone().addScaledVector(UP, site.length);
    const verts: [THREE.Vector3, number, number][] = [
      [r0, site.phase, FLOWER_UV_V_BASE],
      [r1, site.phase, FLOWER_UV_V_BASE],
      [t1, site.phase, FLOWER_UV_V_TOP],
      [r0, site.phase, FLOWER_UV_V_BASE],
      [t1, site.phase, FLOWER_UV_V_TOP],
      [t0, site.phase, FLOWER_UV_V_TOP],
    ];
    for (const [v, u, vv] of verts) {
      sink.pos.push(v.x, v.y, v.z);
      sink.nrm.push(n.x, n.y, n.z);
      sink.uv.push(u, vv);
    }
  }
}

// ── 灯笼蒴果串发射（八面体最小面数——8 面/果 flat 法线；果域 uv v∈[6.0,6.97]）──

/** 八面体面表：[顶点三元组（± 轴单位索引）, 面法线]——顶点序 T/B/A/C/M/P = +Y/−Y/+X/+Z/
 *  −X/−Z；绕序外向（与管发射同为非索引三角流）；法线 = 面心向外单位向量（正八面体
 *  解析值，flat shading 逐面恒定） */
const OCTA_FACES: { v: [number, number, number]; n: THREE.Vector3 }[] = (() => {
  const T = [0, 1, 0], B = [0, -1, 0], A = [1, 0, 0], C = [0, 0, 1], M = [-1, 0, 0], P = [0, 0, -1];
  const V = [T, B, A, C, M, P];
  const mk = (a: number, b: number, c: number): { v: [number, number, number]; n: THREE.Vector3 } => {
    const [ax, ay, az] = V[a]!;
    const [bx, by, bz] = V[b]!;
    const [cx, cy, cz] = V[c]!;
    const n = new THREE.Vector3(
      (ax + bx + cx) / 3,
      (ay + by + cy) / 3,
      (az + bz + cz) / 3,
    ).normalize();
    return { v: [a, b, c], n };
  };
  // 顶四面上绕（外向 CCW）+ 底四面下绕
  return [
    mk(2, 0, 3), mk(3, 0, 4), mk(4, 0, 5), mk(5, 0, 2),
    mk(3, 1, 2), mk(4, 1, 3), mk(5, 1, 4), mk(2, 1, 5),
  ];
})();

/** 八面体单位顶点表（索引同 OCTA_FACES 注释：T/B/A/C/M/P） */
const OCTA_VERTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 0, -1),
];

/**
 * 单灯笼发射：八面体 8 面 × 3 顶点（24 顶点/果）；uv 三角 (u,6.0)(u,6.0)(u,6.97)——
 * **果域 v∈[6,7]**（几何身份标记：与叶卡 0–1 四边形域（组 1）及皮管弧长域（v = 累计
 * 弧长 × 0.5 ≤ ≈2.0）与花域 [5.0,5.95] 三重隔离）。**u = 逐果色档随机 ∈ [0,1)**
 * （位置散列、果内 24 顶点同值——材质果色档通道：淡紫红→玫红→褐多代并存 [2][4][12]，
 * 冻结接口）；**账目入皮组（组 0）**——koelreuteriaMaterials 按 v 域分流果色配方；
 * aLeafRand/aBend 随皮组恒 0（果串刚性悬垂——摆动语义归材质层/缺口候选）。
 */
function emitLantern(
  sink: BarkSink,
  center: THREE.Vector3,
  radius: number,
  colorRoll: number,
): void {
  for (const face of OCTA_FACES) {
    const [ia, ib, ic] = face.v;
    const uvs: [number, number][] = [
      [colorRoll, FRUIT_UV_V_BASE],
      [colorRoll, FRUIT_UV_V_BASE],
      [colorRoll, FRUIT_UV_V_TIP],
    ];
    const idxs = [ia!, ib!, ic!];
    for (let k = 0; k < 3; k++) {
      const v = OCTA_VERTS[idxs[k]!]!;
      sink.pos.push(center.x + v.x * radius, center.y + v.y * radius, center.z + v.z * radius);
      sink.nrm.push(face.n.x, face.n.y, face.n.z);
      sink.uv.push(uvs[k]![0], uvs[k]![1]);
    }
  }
}

/** 位置确定性散列（salt 分通道——花相位/果色档/抽选排序共用，零 rng） */
function posHash(px: number, py: number, pz: number, salt: number): number {
  return fract01(Math.sin(px * 12.9898 + py * 78.233 + pz * 37.719 + salt * 53.71) * 43758.5453);
}

// ── 树皮近景微起伏：固定形态常数（方法层，家族沿用）——非槽差异维度，可调面
//    全在 shapeProfile.barkRelief 三字段（栾树幅度/谐波/游走率见 koelreuteriaShapeProfile）──
/** 谐波权重基线（低次主导；按 harmonics 序循环取用后归一） */
const BARK_RELIEF_WEIGHT_BASE = [0.42, 0.33, 0.25];
/** 相位游走正弦项频率（rad/m）/幅度（rad）——沿轴缓变游走分量 */
const BARK_RELIEF_WANDER_FREQ = 1.6;
const BARK_RELIEF_WANDER_AMP = 0.5;
/** 脊深呼吸（权重沿轴调制）频率（rad/m）/幅度——起伏深浅沿干交错（栾树「浅色光滑 +
 *  局部浅细纵裂」的浅浮雕交错读向；幅度工程设定） */
const BARK_RELIEF_BREATHE_FREQ = 2.4;
const BARK_RELIEF_BREATHE_AMP = 0.3;
/** 亚视觉幅度地板（米，峰值）：管起径 × amplitudeRatio < 此值 → 该管整体跳过起伏
 *  （近景不可辨的亚毫米层，兼免低径向段细枝上高次谐波混叠成无意义计算——栾树
 *  amplitudeRatio 0.013 下起径 < 0.115m 的管（L2 以下细枝典型域）平滑发射，主干 +
 *  L1 粗枝端有效起伏（光滑干读向 [12] form-b 远观）、细枝光滑的读向自然涌现） */
const BARK_RELIEF_MIN_EFFECTIVE = 0.0015;

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
  /** 轴向游走率（±drift 域内确定性取值——栾树 drift 5：局部浅细纵裂的轴向连续性
   *  （轴向去相关 ≈2π/5 ≈ 1.26m）——光滑基底 + 局部细裂复合读向的工程映射；
   *  银杏 ±2.6 纵脊连续 / 悬铃木 ±11 断裂拼贴 / 榉树 ±11 斑驳断裂。速率值 =
   *  profile.barkRelief.drift） */
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
 * 半径；d_θ/d_s 为解析导数（法线修正源）。φₘ(s) = ψₘ + driftₘ·s + wander 正弦项（栾树
 * driftₘ ±5 rad/m——局部浅细纵裂的轴向连续性）、wₘ(s) = baseWₘ·(1 + breathe 正弦项)
 * （浅浮雕深浅呼吸）——均弧长 s 的缓变函数。amplitudeRatio ≤ 0（亚视觉地板跳过路径）时
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
  // 亚视觉地板：起径 × 幅度比 < 1.5mm 的管（栾树 0.013 幅度下 L2 以下细枝典型域）
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
 * 拓扑：主干（含根部 flare）→ 5 骨架枝 + 1 领导枝（L1）→ 逐级递归（L2×3 / L3×3 / L4×3 /
 * L5×2 末梢）；枝角/长度/粗度/曲率 rng 驱动（骨架枝起角 40–56° 对铅垂斜上开展 +
 * ascending→arching 外弯漂移（外向 0.34 + 下垂 0.10 随 t 增强——确定性零 rng）+
 * 干向挂点高度分级（长度 ×1.08→×0.76 / 角度 +8…10°→−5…−7°）——开展圆头-伞形冠的
 * 结构成因，Spec §3 per 终审裁决 3；领导枝 0.50 中庸续顶——圆头-伞形顶共构）。
 * 复叶卡挂点：末两级枝梢互生平展疏簇（大簇 + 3 候选整枚复叶大卡黄金角互生螺旋）+
 * 保留 L5 簇位花果确定性抽选（上部外缘花带 / 冠缘中下果带，见模块头）。主次分级与
 * 冠内通透规则见模块头。
 * profile 缺省 = slot-0 标准组合（锚点回落——单测直调便捷路径，资产路径显式传槽
 * profile）。level 缺省 = 'high'（三档同流派生——档位只改发射密度，不改骨架决策/
 * rng 消费序，见 lodPlanFor）。
 */
export function buildKoelreuteriaGeometry(
  rng: () => number,
  profile: BroadleafShapeProfile = KOELREUTERIA_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): KoelreuteriaGeometryResult {
  const lod = lodPlanFor(profile, level);
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    clusters: [],
    clustersCulled: 0,
    flowers: [],
    fruit: [],
    leafCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（shapeProfile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = 9.7 + rng() * 0.8; // 形态参数域 9.7–10.5m（≈10m 主代理裁定——8–12m 弱 Inferred 收口 9–11 默认 10，终审裁决 7；速生上探 12 变体入 slot-1 领导链）；实测涌现带 9.82–11.44（8 槽 2026-09-21 终测，领导/骨架链复利外伸 Δ 随 seed、各槽领导比回调研 slot-0 leaderLengthRatio 注释——先例银杏 ×1.8 于 8m 级、悬铃木 ×1.9 于 12m 级、栾树 10m 级居中，参数域收紧 0.8 收束槽带）
  const crownRadius = (totalHeight * profile.crownWidthRatio * 0.5) * (0.94 + rng() * 0.12); // 冠幅半径 = 冠幅比驱动（含 ±6% 抖动）——工程域 0.7–1.0 涌现（探针定档见 profile）
  const trunkBaseR = 0.24 + rng() * 0.06; // 根径 0.24–0.30m（DBH Unknown（终审后照片证据失效）——工程设定，速生比例瘦干读向；vs 悬铃木 12m 级 0.30–0.36）
  const trunkH = totalHeight * (0.26 + rng() * 0.06); // 干高 26–32%（trunk_height_ratio Unknown + form-b ≈2m 低分枝单源弱方向 Inferred 的工程域）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.05)); // 主干倾轴（≤2.9°——单干主导；多干栽培变体记档不建模）

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

  // ── L1 骨架枝 ×5（起角 42–58° 对铅垂斜上开展 + **ascending→arching 外弯漂移**
  //    （SCAFFOLD_ARCH——沿 t 外向 + 下垂，确定性零 rng）+ 方位 72° 均分 + asymmetry
  //    0.46 散布抖动 = 螺旋互生散布（骨架排列 Unknown [8]）；挂高 0.55–0.73 干高段
  //    span 0.18（低分枝弱方向）；rank 乘子承担环内势差 + 干向挂点高度分级
  //    SCAFFOLD_LENGTH_TAPER ×1.08→×0.76 + 角度梯度低枝 +8…10° 平展 / 高枝 −5…−7°
  //    圆头闭合）──
  const scaffoldCount = profile.scaffoldCount;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const rank = Math.min(i, profile.scaffoldRankLength.length - 1);
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, profile.asymmetry * 0.88); // 方位抖动 ±25°·(asymmetry/0.5)——互生散布
    const attachT = profile.scaffoldAttachMin + (i / scaffoldCount) * profile.scaffoldAttachSpan + jitter(rng, 0.06);
    // 干向挂点高度分级（开展圆头剪影）：挂点在挂高段内归一位置——低枝长且平展 / 高枝短且收角
    const attachNorm = THREE.MathUtils.clamp(
      (attachT - profile.scaffoldAttachMin) / Math.max(profile.scaffoldAttachSpan, 1e-4),
      0,
      1,
    );
    // 起角（对铅垂）→ 方向分量：水平 sin / 铅垂 cos；角度梯度：挂点低端平展
    // （+8…+10°——冠基放张）/ 高端收角（−5…−7°——圆头/伞形顶闭合），确定性随 attachNorm 插值
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
    growBranch(ctx, rng, profile, lod, 0, attach, bDir, length, startR, az, true);
    // 枝干通道②：骨架枝基段保护带（初方向直线近似——主干大枝进冠不被封死）
    ctx.channels.push(
      segOf(attach, attach.clone().addScaledVector(bDir, length * profile.channelLengthRatio), profile.channelRadius * profile.channelBranchScale),
    );
  }
  // ── L1 领导枝 ×1（中庸 0.50 续顶——幼-中龄枝直立随龄外弯 [8][9] 的中龄过渡位，
  //    leaderLengthRatio 表达强度，直立系数 0.92 为家族方法常量；**不参与外弯漂移**
  //    （领导链直立续顶——外弯为骨架枝语言））──
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
    false,
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

  // ── 花果挂点确定性抽选（零 rng——消费顺序契约不含花果；簇位表与档位无关 ⇒ 决策
  //    逐位同源；platanus 果序 rng roll 组 0 带状浮动先例的规避记档）：**百分位高度
  //    带**（保留 L5 簇位 Y 排序——簇质量分布底重的自校准口径；并列 Y 以位置散列
  //    决胜——排序确定性）——花带 = 第 55 百分位以上（上部 45% ∧ q ≥ 0.30 内位弱滤
  //    ——「集中冠面上部」④-3 + 卡心上抬高出叶幕）与果带 = 第 50 百分位以下（下半
  //    ∧ q ≥ 0.50 冠外半滤——「偏冠缘」④-4）之间留 5 百分位中立带 = **空间分工避免
  //    同点重叠**；资格 = 保留 L5 簇位（末级枝顶——花序顶生 [5][6]）；散列排序 +
  //    固定步长抽选 ──
  const l5Kept = ctx.clusters.filter((c) => c.level === 4);
  const l5ByY = [...l5Kept].sort(
    (a, b) =>
      a.center.y - b.center.y ||
      posHash(a.center.x, a.center.y, a.center.z, 23.1) - posHash(b.center.x, b.center.y, b.center.z, 23.1),
  );
  const flowerYMin = l5ByY[Math.min(l5ByY.length - 1, Math.floor(l5ByY.length * FLOWER_PCTL))]?.center.y ?? Infinity;
  const fruitYMax = l5ByY[Math.max(0, Math.floor(l5ByY.length * FRUIT_PCTL) - 1)]?.center.y ?? -Infinity;
  const flowerCands: { h: number; c: ClusterRecord }[] = [];
  const fruitCands: { h: number; c: ClusterRecord }[] = [];
  for (const c of l5Kept) {
    const q = qOf(c.center);
    const h = posHash(c.center.x, c.center.y, c.center.z, 1.7);
    if (c.center.y >= flowerYMin && q >= FLOWER_ZONE_Q_MIN) flowerCands.push({ h, c });
    else if (c.center.y <= fruitYMax && q >= FRUIT_ZONE_Q_MIN) fruitCands.push({ h, c });
  }
  flowerCands.sort((a, b) => a.h - b.h);
  fruitCands.sort((a, b) => a.h - b.h);
  for (let i = 0; i < flowerCands.length; i += FLOWER_STRIDE) {
    const { c } = flowerCands[i]!;
    // 花卡原料：上抬（高出叶幕 [12]）/ 卡长（真花序 30–70cm ×1.2）/ 交叉轴方位 / 相位 u
    const lift = FLOWER_LIFT_MIN + FLOWER_LIFT_SPAN * posHash(c.center.x, c.center.y, c.center.z, 3.3);
    const length = FLOWER_CARD_LEN_MIN + FLOWER_CARD_LEN_SPAN * posHash(c.center.x, c.center.y, c.center.z, 5.9);
    const az = posHash(c.center.x, c.center.y, c.center.z, 7.1) * Math.PI * 2;
    ctx.flowers.push({
      center: c.center.clone().addScaledVector(UP, lift),
      axis: new THREE.Vector3(Math.cos(az), 0, Math.sin(az)),
      length,
      phase: posHash(c.center.x, c.center.y, c.center.z, 7.7),
    });
  }
  for (let i = 0; i < fruitCands.length; i += FRUIT_STRIDE) {
    const { c } = fruitCands[i]!;
    // 果串原料：冠缘径向外向（树轴水平径向——近干簇的确定性回退）+ 下垂弧链
    const outward = new THREE.Vector3(c.center.x, 0, c.center.z);
    if (outward.lengthSq() < 1e-6) outward.set(1, 0, 0);
    outward.normalize();
    const count = LANTERN_COUNT_BASE + Math.floor(posHash(c.center.x, c.center.y, c.center.z, 9.1) * LANTERN_COUNT_SPAN);
    const spacing = LANTERN_SPACING_MIN + LANTERN_SPACING_SPAN * posHash(c.center.x, c.center.y, c.center.z, 11.3);
    let fp = c.center
      .clone()
      .addScaledVector(outward, c.radius * 0.7)
      .addScaledVector(UP, -0.05);
    const lanterns: FruitLantern[] = [];
    for (let k = 0; k < count; k++) {
      if (k > 0) {
        // 下垂弧链方向：外向随 k 衰减 + 下垂随 k 增强（果序后转下垂 [12]）
        const step = outward
          .clone()
          .multiplyScalar(0.55 - 0.08 * k)
          .add(UP.clone().multiplyScalar(-(0.6 + 0.1 * k)))
          .normalize();
        fp = fp.clone().addScaledVector(step, spacing);
      }
      lanterns.push({
        center: fp.clone(),
        radius: LANTERN_R_MIN + LANTERN_R_SPAN * posHash(fp.x, fp.y, fp.z, 17.9),
        colorRoll: posHash(fp.x, fp.y, fp.z, 19.3),
      });
    }
    ctx.fruit.push({ lanterns });
  }

  // ── 烘焙名单：High = 全存活卡；Mid = 簇内候选序掩码子集（j % every === phase——
  //    疏簇 3 候选 1 张；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位
  //    同位）；Low 壳卡模式不烘焙簇内叶卡与花果（候选生成/通透过滤已照常走完——
  //    花果决策零 rng、决策表档间同源）──
  const bakedCards: LeafCard[] = lod.shellCards
    ? []
    : leafCards.filter((c) => c.emitOrdinal % lod.leafEmitEvery === lod.leafEmitPhase);
  /** 烘焙叶卡数（Low = 保留簇 × 每簇壳卡数——叶组三角 = 该数 × 2） */
  const bakedLeafCount = lod.shellCards
    ? ctx.clusters.length * LOW_SHELL_CARDS_PER_CLUSTER
    : bakedCards.length;
  /** 烘焙花卡数（High/Mid 全量保留——身份信号；Low 省略记档） */
  const bakedFlowerCards = lod.shellCards ? 0 : ctx.flowers.length * 2;
  /** 烘焙灯笼数（High/Mid 全量保留——身份信号；Low 省略记档） */
  const bakedFruitBalls = lod.shellCards ? 0 : ctx.fruit.reduce((s, f) => s + f.lanterns.length, 0);

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
    //    半幅吞并簇半径（LOW_SHELL_MARGIN 校准依据见常量注释）；花果不发射（省略记档）──
    for (const cluster of ctx.clusters) {
      const half = cluster.radius + LOW_SHELL_MARGIN;
      let h = cluster.dir.clone();
      h.y = 0; // 簇切向（挂点枝切向）水平投影
      if (h.lengthSq() < 1e-6) h.set(1, 0, 0); // 近铅垂切向的确定性回退（L5 下垂末梢）
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

  // ── 花果烘焙（High/Mid 全量：花 = 交叉竖卡（emitFlowerSite）/ 果 = 下垂弧链灯笼
  //    （emitLantern）——**入皮组（组 0）**：花 uv u = 逐序相位 / v∈[5.0,5.95]、果
  //    uv u = 逐果色档 / v∈[6.0,6.97] 域身份标记 + aLeafRand/aBend 随皮组恒 0（材质
  //    侧冻结接口——按 v 域分流花/果配方，见 emitFlowerSite/emitLantern 注释）；
  //    「冠面上部外缘金黄团块 + 冠缘灯笼串」Spec 判定做的几何侧表达；Low 省略记档 ──
  if (!lod.shellCards) {
    for (const site of ctx.flowers) emitFlowerSite(bark, site);
    for (const site of ctx.fruit) {
      for (const lantern of site.lanterns) {
        emitLantern(bark, lantern.center, lantern.radius, lantern.colorRoll);
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

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 叶 1——花果入皮组）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_koelreuteria 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  /** 组 0 = 皮拓扑 + 花 + 果（花果入皮组——材质接口约定）；皮拓扑面数 = 组 0 三角 −
   *  花 − 果（结构锁 20782 口径不变） */
  const group0Tris = (groups[0]?.count ?? 0) / 3;
  const flowerTris = bakedFlowerCards * 2;
  const fruitTris = bakedFruitBalls * 8;
  return {
    geometry,
    stats: {
      barkTriangles: group0Tris - flowerTris - fruitTris,
      leafTriangles: bakedLeafCount * 2,
      leafCards: bakedLeafCount,
      flowerSites: lod.shellCards ? 0 : ctx.flowers.length,
      flowerCards: bakedFlowerCards,
      flowerTriangles: flowerTris,
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
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上举/下垂偏置（栾树
 * upturn 链 [0.12,0.10,0.07,0.03,−0.02]——**七实例首个含负链**：ascending→arching
 * 外弯漂移（L1 骨架，SCAFFOLD_ARCH）主导开展 + L4 平伸 + L5 微负下垂「枝梢微下垂」
 * [8][9]）；起径 = 父径 × profile.radiusRatio[level]、末径 = 起径 ×
 * profile.endRatio[level]；子枝挂点内埋父径内（起点回退 2.5×子径，杜绝接缝黑洞——
 * 树皮微起伏幅度 ≈ 1.3% 局部半径，≪ 内埋余量，接缝安全不变）；末两级 = **复叶卡
 * 挂点**（疏簇挂枝梢簇位——簇位表同时为花果承载位表）；通透过滤在收冠后统一执行，
 * 内层稀疏由密度场接管。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划
 * 抽稀（径向降段 + 站点隔 1 抽 1 + 未发射级跳过 emitTube）；簇决策/簇内候选生成/
 * 花果抽选与档位无关（花果零 rng、簇位表驱动——发射省略不省略消费）。
 * arch（仅 L1 骨架枝 true）：ascending→arching 外弯漂移——沿 t 增强的外向 + 下垂
 * 分量（外向基向 = 枝基水平径向 outDir，逐枝常量；确定性零 rng）；领导枝与子级
 * false（领导链直立续顶；子级姿态由 upturn 链 + 游走承载）。
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
  arch: boolean,
): void {
  const spec = profile.levels[level]!;
  const endR = Math.max(startR * profile.endRatio[level]!, 0.004);
  const pts: THREE.Vector3[] = [];
  const radii: number[] = [];
  let d = dirIn.clone().normalize();
  // 外弯漂移外向基向（枝基水平径向——近铅垂骨架的确定性回退）
  const outDir = new THREE.Vector3(dirIn.x, 0, dirIn.z);
  if (outDir.lengthSq() < 1e-6) outDir.set(1, 0, 0);
  outDir.normalize();
  // 子枝起点内埋（回退进父枝体内；末级细枝回退量加大遮梢孔）
  const p0 = start.clone().addScaledVector(d, -(startR * 2.5 + 0.015));
  let p = p0;
  for (let i = 0; i <= spec.segs; i++) {
    const t = i / spec.segs;
    pts.push(p.clone());
    radii.push(startR + (endR - startR) * t); // 线性锥度（连续到子级）
    if (i < spec.segs) {
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize();
      // ascending→arching：外弯漂移随 t 增强（先直立后外弯下倾 [8][9]——确定性零 rng）
      // + 上举/下垂偏置随 t 增强（upturn 链——L5 微负 = 枝梢微下垂）
      if (arch) {
        d.addScaledVector(outDir, SCAFFOLD_ARCH_OUT * t).addScaledVector(UP, -SCAFFOLD_ARCH_DROOP * t);
      }
      d.add(UP.clone().multiplyScalar(spec.upturn * t * 0.5)).normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  // 管发射按档位计划：未发射级（Mid L5 / Low L2–L5）只递归不发射——站点/簇位/花果/rng 照常
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

  // ── 复叶卡挂点（末两级 L4/L5）──
  // 疏簇（家族「枝梢驱动叶簇」的栾树语义）：枝梢 → 簇空间（⊥ 枝切向平面）→ 互生
  // 螺旋稀排复叶大卡——L4 外段 1 簇 / L5 沿途外段 + 枝端共 2 簇（大型羽叶互生沿枝
  // 散布 [2][6]——簇 = 末级枝羽叶组的卡布置球）；簇间大间隙 = 「簇只挂枝梢离散位 +
  // 大间距抑制」（拓扑相关处的父子/兄弟共位由簇级距离抑制保险，见下）；L5 簇位表
  // 同时为花果承载位表（冠参考系区域判据 + 散列抽选——主生成段，零 rng）
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
      // 疏簇平面基（⊥ 簇方向 = 挂点枝切向——复叶平展分层摊开的簇平面 [2]）
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0); // 近铅垂切向的确定性回退
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      for (let j = 0; j < leavesPerCluster; j++) {
        // 互生螺旋方位：黄金角步进 + 抖动（「叶互生」属级 [6] 的簇内方位语言——语言
        // 继承 platanus：互生叶序的螺旋错位，vs 银杏莲座均分 2π/n）
        const phi = j * GOLDEN_ANGLE + jitter(rng, 0.45); // 1 次
        const wobble = randUnit(rng); // 2 次（互生自然不齐的弱球面抖动）
        // 外壳偏置：r̂ = mix(1−shellBias, 1, rng^γ)——互生羽叶位宽域平摊分布（簇心 = 枝梢位）
        const rhat =
          1 - profile.clusterShellBias + profile.clusterShellBias * Math.pow(rng(), profile.clusterShellGamma); // 1 次
        // 互生偏移方向：簇平面辐射 + 沿枝向前倾（FORWARD_TILT）+ 弱抖动
        const offsetDir = u1
          .clone()
          .multiplyScalar(Math.cos(phi))
          .add(u2.clone().multiplyScalar(Math.sin(phi)))
          .add(tangent.clone().multiplyScalar(ALT_FORWARD_TILT))
          .add(wobble.clone().multiplyScalar(ALT_WOBBLE))
          .normalize();
        const cardCenter = center.clone().addScaledVector(offsetDir, rhat * radius);
        // 卡尖方向：辐射外向 + 平展上举（「叶平展」[2]——PLANE_LIFT 低于悬铃木平展端）
        const cardDir = offsetDir.clone().add(UP.clone().multiplyScalar(PLANE_LIFT)).normalize();
        let side = cardDir.clone().cross(UP);
        if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
        side.normalize();
        const roll = rng() * Math.PI; // 卡面滚转（取向随机——打散规则感；家族共性沿用）1 次
        side.applyAxisAngle(cardDir, roll).normalize();
        // 卡根朝内：cardDir 与簇内偏移方向反向时 dir/side 同取负（卡面不变、根尖互换、
        // 法线不变），叶尖恒指簇外——「羽叶自枝梢节位向外生长」读向（根边 uv v=0 =
        // aBend 低端 = 复叶卡羽叶轴基端）
        if (cardDir.dot(offsetDir) < 0) {
          cardDir.negate();
          side.negate();
        }
        // 尺寸/aLeafRand 抽样无条件消费（含被剔除簇位——消费次数与 kept 分支无关，
        // 调 clusterMinSeparation 等参数时保留簇随机流不重排——确定性纪律）；
        // 高度抽样恒比例消费（leafAspectSpan = 0——冻结比例 0.60 的纪律位，消费不减）
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
        // branch_angle 度数 Unknown（「先直立后外弯下倾」定性 Verified [8][9]，读向由
        // 外弯漂移 + upturn 链承担），家族方法常量承载）
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
        false, // 外弯漂移仅 L1 骨架枝（领导/子级由 upturn 链 + 游走承载姿态）
      );
    }
  }
}
