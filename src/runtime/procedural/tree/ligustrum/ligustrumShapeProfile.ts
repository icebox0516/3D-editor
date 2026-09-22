/**
 * runtime/procedural/tree/ligustrum/ligustrumShapeProfile —— 女贞 shapeProfile 数值面
 * （T011.11 Step 2，阔叶家族契约第十二实例——方法复制自夏栎第一实例经朴树（T011.1）/
 * 香樟（T011.2 常绿第一例——**常绿密冠参数面最直接模板**）/榉树（T011.3）/银杏（T011.4）/
 * 悬铃木（T011.5）/栾树（T011.6）/乌桕（T011.7）/重阳木（T011.8）/国槐（T011.9）/
 * 白蜡（T011.10——**decussate 对生挂点机制的直接模板**）十一次验证的通路
 * ../fraxinus/fraxinusShapeProfile 同构）。
 *
 * 职责：女贞（**Ligustrum lucidum W. T. Aiton 女贞原变型本尊 f. lucidum**——种定名
 *      三源裁定：FRPS 61:153 独立种两变型 + FOC Vol.15 Comment 常绿 (4–)5–6(–9) 脉 =
 *      f. lucidum（落叶变型 f. latifolium 江苏特有不入相）+ GBIF ACCEPTED；近缘日本女贞
 *      L. japonicum（大灌木 3–5m + 果椭圆形）非长江流域城市绿化对象不混〔Spec §1
 *      Verified [1][2][5][7]〕），木犀科女贞属**常绿乔木**——**长江流域城市公园/行道
 *      中龄单干个体 ≈8m**（Spec §2 + 终审记档裁决 2：form-d 单整树样木 ≈8m〔三层砖楼
 *      建筑参照、双系统一致〕+ NC State 栽培域 4.6–15.2m + 25m 志书上限口径——中档
 *      证据如实，slot-0 ≈8m 锚维持）+ **对生单叶全缘革质光亮（女贞属身份结构——
 *      「叶对生，单叶……全缘」属级 Verified [3][4][7] + 照片 leaf-a/leaf-winter 双问；
 *      家族首例对生单叶挂点语言：与白蜡（对生复叶）共享「对生」位、叶层面为单叶）**
 *      + **卵圆-广卵满密常绿冠**（form-d 单样木主锚 0.75–0.85 + canopy-b 圆头侧证——
 *      终审记档 1 修正后口径；香樟广卵法端稍紧）+ 中低分枝（干高占比 ≈0.30 三样本
 *      双问）+ 中角骨架（30–60°）+ **肾形核果满冠下垂密簇**（果期 7 月至翌年 5 月
 *      完全覆盖 9–10 月主语境——做，任务书裁决 1）+ **灰褐细窄纵脊浅沟低浮雕树皮**
 *      （第 12 语言，裁决 7：沟深低于樟深纵裂、脊细于白蜡、干面细纹浅色「fine
 *      maple-like」质感）语言）枝干/冠层结构的形态参数**数值面**——类型契约 = 阔叶
 *      家族契约 ../broadleaf/broadleafShapeProfile（BroadleafShapeProfile，**零修改
 *      第十二实例化**）。**十一先例的数值是证据不是家族真理**，本文件全部数值依据
 *      docs/research/ligustrum-reference.md（Spec Version 1.0——**生产一律以文末
 *      「主代理终审记档」修正后口径为准**：form-cn 整树主张已否证、整树锚 = form-d
 *      单样木）女贞自己的现实事实重定；下方逐字段标注【家族共性候选】沿用 /
 *      【女贞特有】新证据 / 【工程设定无现实基准】（工程设定明确标注不编造现实依据）。
 *      方法恒同纪律（T011.11 任务书）：五级拓扑 L1–L5、叶簇挂末两级 L4/L5、结构计数类
 *      跨槽恒等、rng 无条件消费、LOD 三档同流派生整体复制自 fraxinus 第十一实例化，
 *      女贞只换数值与算法细节（几何侧差异点归 ligustrumGeometry Step 3 交付）。
 * 边界：女贞资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_ligustrum.asset）；比率字段以
 *      totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0（含终审记档修正口径）× fraxinus/camphor 双模板对照，
 *    主代理「待裁决位」10 条为执行依据；三栏落档）──
 *
 * ■ 可继承项（家族方法原样沿用，女贞证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——女贞分枝 ≥3 级可见（Spec §4 Inferred
 *      [10]）落家族五级口径内；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——衰减数值 Unknown（域
 *      扩展节 A 全组 Unknown），家族方法沿用；
 *   3. 枝梢驱动叶簇 + 冠内通透三规则 + 锥度管状枝干 + 树皮近景微起伏机制（纯确定性
 *      谐波、幅度 ∝ 局部半径、零 rng）；
 *   4. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡 / 果簇 Low 省略 Mid
 *      全量——triadica/sophora/fraxinus 果处理先例）；
 *   5. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   6. 尺度锚中龄公园 ≈8m（终审裁决 2 维持——与夏栎 ≈8/朴树 ≈8.5/香樟 ≈8.6/榉树 ≈8
 *      同语境混植档）。
 *
 * ■ 按女贞改写项（每条映射实现面，主代理裁决 1–10）：
 *   1. **对生单叶卡 + decussate 对生挂点（家族首例对生单叶挂点语言——裁决 5：沿
 *      fraxinus decussate 机制直接继承，单叶卡替代复叶卡）**：卡 = 2 tri 承载单叶
 *      （卵形-长卵形-椭圆形-宽椭圆形包络归 ligustrumMaterials 单叶 SDF 层——并行
 *      交付）；簇内卡方位 = **对生对 + 相邻对交互 90°**（φ_j = ⌊j/2⌋×90° +
 *      (j mod 2)×180° + 抖动——「叶对生」属级 Verified [3][4][7] 的几何落地）+ **
 *      对内共享节位 r̂**（同节对生语义：对首卡消费 rng、对次卡复用——消费次数由 j
 *      奇偶确定性决定）；对生抖动 ±0.20 rad 小档（leaf-a「opposite pairs」+ 顶芽单叶
 *      双问 [10]——对生规整读向可读优先）；**卡尺寸域 = 真叶 6–17 × 3–8cm（FRPS
 *      Verified [1][2]）× 2 家族工程映射 → 卡宽 0.06–0.16m；卡长宽比域 1.7–2.8**
 *      （Spec 域扩展节 B leaf_aspect_ratio Verified [1][10]——变比例非冻结：单叶系
 *      卡（vs 白蜡复叶卡恒比例冻结 0.36——单叶无窗列整幅约束）。
 *   2. 树形语言：**卵圆-广卵满密冠（camphor 广卵法端稍紧——裁决改写映射）+ 单干
 *      典型 + 中低分枝 0.30 + 中角骨架 30–60° + 领导枝中庸-弱**（Spec §3/§4/域扩展
 *      节 A：form-d「broad-ovate 0.75–0.85 / 分枝 0.30」双系统一致 + bark-b 分枝
 *      0.3 侧证 + scaffold_angle 中角三源双问 [10] + apical_dominance「中庸-弱」
 *      Inferred [10]）；**单段角域直读**（36–58° 中角中带——无国槐两段角带/无白蜡
 *      修正史，槽间角域整体平移）；挂高段 0.56–0.74（中低分枝——干高参数域
 *      0.36–0.42 承载干高占比 ≈0.30 涌现）；丛生多干端（form-b [10]）记档不建模
 *      （结构差异不落连续参数，家族同款纪律）。
 *   3. 冠幅比：**0.75–0.85 主档（form-d 单样木双系统一致——终审记档 1 修正后口径）
 *      + 开展端 1.0 读向（form-a「开展不规则 1.0–1.2」变体端——Spec §3 Inferred
 *      [10]）**；8 槽 w/h 涌现带 = 0.72–1.02 目标（参数探针定档，见 crownWidthRatio
 *      注释）；比香樟（0.7–0.85）同带、端稍紧（卵圆读向上收快于樟广卵）。
 *   4. 干高占比：域扩展节 A trunk_height_ratio **≈0.30**（form-cn/form-d/bark-b
 *      三样本双问 [10]——终审记档 1：form-cn 侧证撤除后 = form-d + bark-b 双证）
 *      ——挂高段 0.56–0.74 + 干高参数域 0.36–0.42 承载；低/高端变体走 slot-4/slot-5
 *      槽位化（带内展开——行道提干修剪相无样本，园艺推断如实记档）。
 *   5. 骨架数：域扩展节 A scaffold_branch_count **Unknown**（整树照片未计数判读——
 *      任务书裁决 9）→ **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 枝数 [7,21,63,189,378]、
 *      簇位 945（L4 189×1 + L5 378×2）、皮面 24236——**族典型域取值【工程设定无现实
 *      基准】**；白蜡同拓扑、预算行沿用，账目见 clusterLeaves 注释）。
 *   6. **核果满冠下垂密簇（Spec 判定做——任务书裁决 1：属相内显著性（FRPS 裁定句
 *      直接以果形定种——肾形 = 种级身份）+ 生长季主语境全覆盖（果期 7 月至翌年 5 月
 *      [1][2] + 照片四点色序链 9 月绿果→10 月紫黑→12 月冠内→2 月宿存 [10]）+ 家族
 *      独有性（家族果谱：翅果/念珠荚/灯笼囊/三裂果/绿闭果/球形核果/橡子——肾形白粉
 *      浆果核果独立位））**：**满冠下垂密簇分布**（fruit-b/c「满冠下垂密簇」[10]——
 *      资格门槛 = **满冠带 q ≥ 0.30**（fraxinus 帘幕型同判据直接沿用——满冠显著 vs
 *      国槐 0.42 冠缘散点））——**零 rng 确定性挂点账目法**（011.6/011.7/011.9/
 *      011.10 先例：保留 L5 簇位冠带判据 + 位置散列排序 + 固定步长抽选（DRUPE_STRIDE）
 *      ——账目恒等可断言）；**每簇 8–12 果卡**（真实「每簇 20–80 果/序」[10] 的
 *      视觉密度档映射——绝对数不承重（终审记档 5 口径）；**肾形核果 7–10 × 4–6mm
 *      （FRPS Verified [1][2]）× 2 家族工程映射 → 果长 0.014–0.020m / 果宽
 *      0.008–0.012m**）；果序轴下垂 0.12–0.26m + 果沿轴散布、果长轴斜下外姿态
 *      （「熟果自枝端下垂悬挂」[10]——簇卡朝向弱表达）；几何 = **扁平 quad 果卡
 *      正反双 quad = 4 tri/果卡**（fraxinus 翅果选型沿用——双面由几何侧承担，冠下
 *      仰观（fruit-b/c 主视角）背面可见）；**uv 果域标记 v∈[4.0,4.97]**（族冻结
 *      接口：果域在 **v 轴**——果梗端 v=4.0 / 果尖 v=4.97，**u = 逐果色档随机
 *      ∈ [0,1)**（绿-白绿未熟→紫黑蓝黑被白粉色序 [10]，材质果色档通道）——fraxinus
 *      果域模式（轴 + 色档双编码）同轴同位（**2026-09-22 主代理终审裁定：派遣简报
 *      u 轴系误写，对齐 triadica/sophora/fraxinus 族冻结口径 v 轴**））；**入皮组
 *      （组 0）**——ligustrumMaterials（park-shader-agent 并行交付）按 v 域分流核果配方；
 *      aLeafRand/aBend 随皮组恒 0（果簇刚性悬垂——摆动语义归材质层）；数量级定档
 *      **DRUPE_STRIDE 5 实测落带见 ligustrumGeometry/asset 模块头终测记档**（Mid
 *      预算带（10000 − 皮 4514 − Mid 叶面）下 4 tri/果卡的簇数-果数平衡）；**Low 档
 *      省略（先例）；花不做**（任务书裁决 2：花期 5–7 月不覆盖 9–10 月主语境——
 *      对照栾 7–9 月覆盖而做 / 国槐 7–8 月弱信号不做，时窗错位即不做）。
 *   7. 树皮（第 12 语言，裁决 7）：**灰褐基 + 细窄纵脊浅沟低浮雕 + 干面细纹浅色质感**
 *      （「树皮灰褐色」FRPS Verified [1] + bark-a「灰褐、细窄脊 + 浅沟、纵行大体平行
 *      （少量横向连接）、fine maple-like 细纹浅色质感」+ bark-b「浅灰-灰褐细鳞片状
 *      微翘、纵裂轻微」双问 [10]——**沟深低于樟深纵裂（0.036）、脊细于白蜡（{4,6}
 *      0.020）**）——amplitudeRatio **0.016**（低浮雕档——vs 先例樟 0.036/夏栎
 *      0.033/银杏 0.030/重阳 0.028/乌桕 0.027/白蜡 0.020/朴 0.016 同档低带）+ 谐波
 *      **{5,7}**（细窄脊——主干 radial 16 的奈奎斯特域 8 内留 1 档边际；比白蜡 {4,6}
 *      细一档、比樟 {3,4,6} 宽脊细两档）+ drift **3.4 rad/m 顺直档**（「纵行大体
 *      平行」[10]——轴向去相关 ≈2π/3.4 ≈ 1.85m，顺直脊沟族带内（樟 3.2/白蜡 3.6
 *      邻档），少量横向连接由呼吸项承载）+ **细枝光滑**（起伏幅度地板 3.0mm：
 *      0.016 下起径 < 0.1875m 的管平滑发射 → **仅主干有效起伏**——「皮孔在枝不在干」
 *      FRPS [1] + 中龄细浅纹显于主干的读向；灰褐色调/细纹浅色质感/细鳞微翘主体在
 *      材质侧（ligustrumMaterials 配方层——并行交付））。
 *   8. 密度语言：**常绿密档（沿香樟——任务书裁决 4）**——空隙 **5–15%**（canopy-a
 *      5–10% / canopy-b 10–15% 双问 [10]；樟 10–15% 同密档——女贞密端更深一档）+
 *      团块 **1/6–1/4 冠宽**（canopy-a 1/4–1/5 大团块 / canopy-b 1/6–1/8 [10]——
 *      **较樟 1/8–1/10 团块略大、冠面更整块**——簇参数承载）→ canopyDensity 0.95
 *      （vs 樟 1.0 起步——大叶（卡宽 0.06–0.16 vs 樟 0.06–0.095）覆盖率高、卡数取
 *      带内中段）+ crownShellStart 0.46（厚壳——空隙收束读向）+ coreDensityFloor
 *      0.08（内膛不空透——「冠内偶见空细枝」弱二源 [10]）+ 空腔 3 个收窄域 0.38–0.66
 *      （vs 樟 0.42–0.72 微收——空隙 5–15% 的小空隙读向）+ 簇半径 0.13–0.18 大簇
 *      （团块略大于樟 0.11–0.15）+ shellBias 0.46（樟 0.66 壳聚与白蜡 0.42 平摊之间
 *      ——大卡整块团簇感）。
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开（主代理指定差异轴：**冠幅比 0.75–1.0 两端
 *      （卵圆窄端 ↔ 开展宽端）/ 偏冠 / 干低端/高端 / 疏密端（空隙 5–15% 带两端）**）：
 *      slot-1 卵圆窄端（冠幅比域下段 0.75 读向个体）/ slot-2 开展宽端（form-a 开展
 *      端 1.0 读向）/ slot-3 偏冠（骨架排列 Unknown [10] 散布口径的方位势差承载）/
 *      slot-4/5 干低端/干高端（0.30 域两侧带内展开——行道提干相无样本如实记档）/
 *      slot-6/7 疏密端（空隙 5–15% 带两端——**果簇承载轴间接承载**：资格簇数随密度
 *      参数增减，确定性步长抽选下簇数随槽平滑变化——家族契约无果序参数位，连续参数
 *      承载的实现口径记档同 011.6/011.9/011.10）。**丛生多干相（form-b 归化林地
 *      [10]）不进 8 槽**（结构差异不落连续参数，家族同款纪律记档）；f. latifolium
 *      落叶变型（江苏特有 [1][2]）记档不建模；花低频变体档不做（裁决 2——家族无
 *      季节变体基础设施，不为此单树扩展）；新叶红铜调（flower-b 弱单源 [10]）归
 *      材质层变体轴。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据——裁决 9）：
 *   1. trunk_taper_ratio / basal_flare_ratio（域扩展节 A 均 Unknown）——干形锥度与
 *      根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. DBH / 干径典型值 Unknown（照片不可标定）——根径 0.22–0.28m 工程设定（8m
 *      中龄量级家族带内偏细档——vs 樟 0.26–0.32 / 白蜡 0.24–0.30，Step 3 探针校）；
 *   3. scaffold 角域数值 = 定性 Inferred（中角 30–60° 三源双问 [10]）/ 度数带内
 *      取值工程默认——分级记档（Unknown 域 + 方向带内）；
 *   4. branch_length_decay / branch_radius_decay / branch_attachment_t /
 *      allometry_exponent——家族量级工程设定；
 *   5. 单叶近景细节（卵形-长卵形-椭圆-宽椭圆包络三相 / 先端锐尖-渐尖或钝 / 基部
 *      圆形-宽楔形 / 全缘平坦 / 上面光亮下面淡绿 / 侧脉 4–9 对细弱不显 / 叶柄 1–3cm
 *      具沟——Verified [1][2][7][10]）——归材质 SDF 层（几何不建模）；芽形态
 *      （Spec Unknown——常绿密冠语境信号弱不建模）；果色细档（归材质 v 通道）；
 *   6. 冠层密度梯度 crown_fill_gradient Unknown（弱二源外密内疏 [10]）——通透只调
 *      整体密度与空腔（家族口径）。
 *
 * 不建模记档（Spec 有事实、工程不表达）：单叶内部结构（形/缘/先端/脉/柄/两面色——
 *      Verified [1][2][3][7][10]，归 ligustrumMaterials 单叶 SDF 层）；**花**（圆锥
 *      花序 8–20 × 8–25cm 顶生白色 5–7 月——Verified [1][2][3][10]，任务书裁决 2
 *      不做：时窗错位 + 常绿身份由密冠/革质光泽/果序三信号承托 + 家族无季节变体基础
 *      设施；uv 花域 v∈[5,7) 空）；果色序细档与宿存冬态（归材质 u 通道（翻转后
 *      自由轴）/风格层）；
 *      芽（Spec Unknown）；丛生多干相（form-b [10]）；f. latifolium 落叶变型；
 *      新叶红铜调（归材质变体轴）；树皮灰褐色调/细纹浅色质感/细鳞微翘（归材质层）；
 *      「大叶女贞」俗名（命名口径记档非形态）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/**
 * slot-0 标准组合初值（锚点形态）：长江流域城市公园/行道中龄单干个体 ≈8m 量级（终审
 * 裁决 2 维持——form-d 单整树样木双系统一致 + NC 栽培域，中档证据如实）、**卵圆-广卵
 * 满密常绿冠**（单段角域直读 36–58° 中角中带 + 挂高段 0.56–0.74 中低分枝 + 领导枝
 * 中庸-弱 + 散布方位）、**单叶卡 decussate 对生簇**（卡宽 0.06–0.16 × 长宽比 1.7–2.8
 * 变比例；每簇 10 候选 = 5 对生对——相邻叶对交互 ±90°）、常绿密档（空隙 5–15%）+ 大
 * 团块（簇 0.13–0.18）、**肾形核果满冠下垂密簇**（保留 L5 簇位满冠带确定性抽选——零
 * rng 账目，果域 uv v∈[4.0,4.97] + u 逐果色档，扁平 quad 正反双面 4 tri/果卡）、无花
 * 资产（裁决 2）。T009.3 教训沿用：视觉冠底由挂高段 + 横展角 + upturn + 领导枝链涌现，
 * 不由 crownCenterRatio。结构计数类（trunk/levels radial/segs、childPlan、簇位数、
 * 每簇叶量、voidCount、scaffoldCount）全槽恒等；**单叶卡尺寸/长宽比域槽间不动（叶
 * 身份——变比例域整体继承，非白蜡式恒值冻结）**。
 */
export const LIGUSTRUM_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 终审记档 1：冠幅/树高比 **≈0.75–0.85 主档（form-d 单样木双系统一致——
   *  0.8/0.8–0.9 两读合一）+ 开展端 1.0（form-a「开展不规则」变体读向）**；比香樟
   *  （0.7–0.85）同带端稍紧。**Step 3 探针回推定档（2026-09-22 实测，两轮）**：大卡
   *  （0.06–0.16 宽 × 1.7–2.8 变比例 → 卡长至 0.34m）的叶尖极值外泄使 bbox 冠幅显著
   *  大于骨架冠半径（横向外泄系数 ≈ ×1.45——大卡档 vs 白蜡小卡 ×1.19），初值 0.64
   *  实测 slot-0 涌现 w/h 0.949 出主档上沿；回调 **0.54** 后终测涌现 **≈0.80** 落主档
   *  中带、8 槽带落 0.72–1.10 读向带（见 asset 模块头）。【冠幅比类 = 家族共性候选
   *  沿用；锚值 = 女贞特有（form-d 单样木 + 大卡外泄系数回推）】 */
  crownWidthRatio: 0.54,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；卵圆-广卵冠体中心中带——
   *  中低分枝的冠体读向参考系，实际由挂高段 + 角域 + 领导链驱动）。 */
  crownCenterRatio: 0.6,
  /** 工程设定（同上；广卵冠纵域参考系——中高带（端稍紧读向上收快于樟 0.72）。 */
  crownHeightRatio: 0.7,
  /** Spec 域扩展节 A branch_orientation：骨架排列 Unknown（照片未见可判轮生/对生
   *  模式 [10]——叶/枝对生为末级结构证据 [3][4][10]，不外推骨架）；散布方位沿用
   *  先例主流读向。slot-0 = 0.42（散布端——方位均分步进 + 大抖动 → 互生散布读向）。
   *  【散布机制 = 家族共性候选沿用；幅度 = 女贞特有（骨架 Unknown + 工程默认）】 */
  asymmetry: 0.42,
  /** Spec §3 冠形「卵圆-广卵、顶部圆钝」+ apical_dominance「中庸-弱」Inferred [10]
   *  ——顶密读向（顶部叶量保留使冠顶圆钝闭合——团块冠面整块读向的密度场配合；樟
   *  0.1 端稍紧取 0.06）。【女贞特有定档依据 = Spec §3/域扩展节 A Inferred [10]；
   *  幅度工程设定】 */
  crownTopBias: 0.06,

  // 骨架
  /** Spec 域扩展节 A scaffold_branch_count **Unknown**（整树照片未计数判读——任务书
   *  裁决 9）→ slot-0 = **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 簇位 945 / 皮面 24236
   *  ——8m 满密冠大卡中数量 + 核果簇组 0 预算留带内余量，账目见 clusterLeaves
   *  注释；白蜡同拓扑族内预算行沿用）。【结构计数类：槽间恒等；取 6 = 【工程设定无
   *  现实基准】（Unknown 域 + 族典型域取值）】 */
  scaffoldCount: 6,
  /** Spec 域扩展节 A scaffold_angle：**中角（30–60° 对铅垂）**（form-a/form-cn/
   *  form-d 三源双问 medium [10]）；定量 Unknown。**单段角域直读 36–58°**（中角域
   *  中带——女贞无低位放射/两段角带身份（vs 国槐）/无白蜡开展外斜高端（vs 白蜡
   *  44–66），槽间角域差异整体平移单段域）。【女贞特有（定性 Inferred [10] 三源；
   *  度数带内取值工程默认——分级记档）】 */
  scaffoldAngleMin: 36,
  scaffoldAngleMax: 58,
  /** Spec 域扩展节 A trunk_height_ratio **≈0.30**（form-d 主锚 0.30 + bark-b 侧证
   *  0.3，双问 [10]——终审记档 1 修正后 = 双证）——挂高段实现：挂点 **0.56–0.74**
   *  干高段 span 0.18（**中低分枝**——冠下压、干较矮读向，与樟 0.58–0.76 邻档）×
   *  干高参数域 0.36–0.42 ≈ 离地 1.4–2.6m 中低带；行道提干修剪相（更高分枝点）无
   *  样本属园艺推断——低端/高端变体槽位化（slot-4 低冠 / slot-5 高冠）带内展开
   *  如实记档；T009.3：挂高段下缘 + 角域 + upturn + 领导链共同涌现视觉冠底。【女贞
   *  特有（≈0.30 双证 Inferred [10] + Unknown 定量域的带内映射）】 */
  scaffoldAttachMin: 0.56,
  scaffoldAttachSpan: 0.18,
  /** 工程设定（branch_radius_decay Unknown、DBH Unknown（照片不可标定 [10]）——8m
   *  中龄常绿乔木取家族带内偏细档 0.50（vs 樟 0.58 / 白蜡 0.52），待视觉验收校）。 */
  scaffoldThickness: 0.5,
  /** rank 长度乘子（6 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法
   *  沿用；散布骨架的环内势差——偏冠槽加大首枝势差承载）。 */
  scaffoldRankLength: [1.12, 1.04, 0.97, 0.91, 0.87, 0.83],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.04, 0.97, 0.93, 0.9, 0.88, 0.86],
  /** Spec 域扩展节 A apical_dominance：**中庸-弱**（卵圆冠顶部圆钝、无强领导枝读向
   *  Inferred [10]）——领导枝 0.48（中庸-弱带（国槐 0.48 同档）——圆钝顶由上段骨架
   *  链共构、领导不翻转树顶（T009.3 弱领导翻转警示的安全带内）；**Step 3 探针回调
   *  记档（2026-09-22）**：初值 0.50 实测 slot-0 涌现 8.82 偏 ≈8m 锚 +0.8，回调
   *  0.48（配树高域 −0.2）终测落锚域中带——记档见 asset 模块头）。【女贞特有定档
   *  依据 = Spec apical_dominance Inferred [10]；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.48,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；7 L1 下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝长比沿用家族量级——女贞无 zigzag
   *  证据（Spec 无原句），细级形态由 wander 梯度承载）。 */
  lengthRatioBase: 0.42,
  lengthRatioSpan: 0.15,
  /** L1 0.62 通体锥度（中低分枝冠链粗壮中带——樟 0.68 / 白蜡 0.60 之间）。工程设定
   *  （Spec 无女贞锥度数值，branch_curvature Unknown——常绿未获裸枝照）。 */
  endRatio: [0.62, 0.58, 0.58, 0.58, 0.58],

  // 冠内通透（常绿密档基调——沿香樟先例数值面（任务书裁决 4）：空隙 5–15% 收束 +
  // 团块 1/6–1/4 冠宽略大于樟）
  /** Spec §3 / 域扩展节 B crown_transparency：**常绿满密——空隙 ≈5–15%**（canopy-a
   *  5–10% / canopy-b 10–15% 双问 [10]；与樟 10–15% 同密档——密端更深一档）。
   *  slot-0 = 0.95（**密档带中段**——大卡（0.06–0.16 宽 × 1.7–2.8 长宽比）单卡
   *  覆盖率高，卡数取带内中段即满密观感（vs 樟 1.0 × 小卡 18/簇——大卡中数量的
   *  女贞口径）；疏密差异归槽 6/7（0.78 ↔ 0.97 展开空隙 5–15% 带两端）。【canopyDensity
   *  类 = 家族共性候选；基调读向 = 女贞特有（常绿满密多源 [10]）】 */
  canopyDensity: 0.95,
  /** Spec §3 冠面「离散团块融合的外壳 + 冠内偶见空细枝」[10]——外密内疏家族方向
   *  沿用；密档厚壳 0.46（vs 樟 0.48 同带——空隙收束读向）。【连续形态参数；值 =
   *  女贞特有】 */
  crownShellStart: 0.46,
  /** 芯层起点与地板值：密档内膛不空透（「冠内偶见空细枝」幅度小 [10]——同樟口径
   *  0.08）。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.12,
  coreDensityFloor: 0.08,
  /** 规则①（枝干通道：主干大枝进冠不被封死——满密冠型尤其需要，樟同款）；数值
   *  工程设定（8m 冠通道带随冠尺度，比例沿家族量级）。 */
  channelRadius: 0.42,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：密档的冠内小空隙——空隙 5–15% 的小空隙读向）。【结构计数类：
   *  槽间恒等】数量工程设定（与樟同为 3——空隙尺度差异由半径域承载）。 */
  voidCount: 3,
  /** 空腔半径域收窄（0.38–0.66 vs 樟 0.42–0.72 微收——密端 5% 更深、疏端 15% 同樟
   *  上沿的折中域）。值 = 女贞特有（空隙 5–15% [10]）；半径域机制 = 家族共性候选。 */
  voidRadiusMin: 0.38,
  voidRadiusMax: 0.66,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；女贞「叶簇」= **末级枝
  // decussate 对生单叶卡簇**（大簇 0.13–0.18 + 每簇 10 候选 = 5 对生对散布）= 对生
  // 单叶挂点语言；L5 簇位表同时为核果簇承载位表（确定性账目——ligustrumGeometry
  // 常数与判据））
  /** Spec §4/域扩展节 B leaf_attachment_rule：**单叶对生于枝**（属级「叶对生」
   *  Verified [3][4][7]——decussate 几何落地在 ligustrumGeometry 簇内方位）；叶集中
   *  末级枝外段（canopy 读向 Inferred [10]）——沿末级枝外段散布。簇位数 L5=2 + L4=1
   *  （家族沿用——「末级枝外段 + 枝端」的散布位点，外段下限 0.46/0.42 起）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——末级枝叶组挂外段受光区；对生单叶的站位带）。 */
  clusterInnerStartL5: 0.46,
  clusterInnerStartL4: 0.42,
  /** Spec §2/域扩展节 B leaf_size + clump_scale：真叶 6–17 × 3–8cm（FRPS/FOC 逐字
   *  一致 Verified [1][2]）× 2 家族工程映射（夏栎/朴树/樟单叶系先例口径）→ 卡长
   *  0.12–0.34 典型 / 卡宽 0.06–0.16 ⇒ **簇半径 0.13–0.18**（**女贞团块略大于樟
   *  （0.11–0.15）**——团块 1/6–1/4 冠宽读向 [10] 的簇参数承载：簇半径 ≈ 典型卡长
   *  0.5–0.7 量级带（樟同法）；卡体伸出球外由卡本体覆盖）；L4 簇 ×1.15 承接更粗
   *  末级枝——家族沿用。【簇半径比类 = 家族共性候选；绝对量级 = 女贞特有（大叶大簇
   *  略大于樟档）】 */
  clusterRadiusMinL5: 0.13,
  clusterRadiusSpanL5: 0.05,
  clusterRadiusScaleL4: 1.15,
  /** 工程设定（家族沿用——短枝梢簇随之缩小的 cap 语义：L5 枝长 ~0.4–0.6m 下 cap
   *  0.22–0.33，簇半径实际由 cap 主导）。 */
  clusterRadiusLengthCap: 0.55,
  /** Spec 域扩展节 B leaf_cluster_density Unknown（定性：末级枝叶量中-高密观感
   *  Inferred [10]）——簇级显式剔除的间距保险：0.52（大簇中距：簇心距 ≥ 0.52×(ri+rj)
   *  ≈ 0.14–0.24m；挂点 rng/单叶卡 rng 无条件消费后丢弃，确定性不破；**Step 3 探针
   *  定档**：Mid 总面贴预算带则回调，记档）。【间距机制 = 家族共性候选；值 = 女贞
   *  特有（大簇中距）】 */
  clusterMinSeparation: 0.52,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 10 = **对生单叶卡候选数**（对生叶节位语言的卡尺度合并抽象：真叶沿枝
   *  对生节距数 cm 级 × 卡长 0.12–0.34 ⇒ 连续节位合并，每簇 10 候选 = 5 个对生对
   *  （decussate——相邻对交互 ±90°，ligustrumGeometry 簇内方位语言）的中数量档
   *  （大卡中数量——vs 樟小卡 18/簇：单卡覆盖率高故候选减半；通透过滤后逐簇存活
   *  典型 6–10 枚））；8 槽簇位 945（L4 189×1 + L5 378×2，7 L1 拓扑）× 10 卡的 High
   *  实测带见 asset 模块头（终测记档）。【每簇叶量类 = 家族共性候选；绝对值 = 女贞
   *  特有（大卡中数量抽象）】 */
  clusterLeavesL5: 10,
  clusterLeavesL4: 10,
  /** 外壳偏置 ∈ (0,1]：大卡整块团簇感——樟 0.66 壳聚与白蜡 0.42 平摊之间取 0.46
   *  （密档团块「冠面更整块」[10] 读向：卡沿簇域中外部布置、簇内适度成团；r̂ ∈
   *  [0.54, 1] 分布）。【壳偏置机制 = 家族共性候选；值 = 女贞特有（团块整块读向）】 */
  clusterShellBias: 0.46,
  clusterShellGamma: 0.85,
  /** Spec §2/域扩展节 B leaf_size + 任务书冻结口径：真叶 6–17 × 3–8cm（Verified
   *  [1][2]）× 2 家族工程映射 → **卡宽 0.06–0.16m**（真叶宽 3–8cm ×2 全域——大叶
   *  常绿档，vs 樟 0.06–0.095 / 白蜡复叶卡 0.076–0.126）。【卡尺寸域类 = 家族共性
   *  候选；绝对量级 = 女贞特有（真叶全域 ×2 映射）；卡宽域槽间不动（叶身份）】 */
  leafWidthMin: 0.06,
  leafWidthSpan: 0.1,
  /** Spec §2/域扩展节 B leaf_aspect_ratio：**≈1.7–2.8**（文献域 6–17/3–8 推算 +
   *  照片椭圆-卵形读向 Verified [1][10]）——**变比例域**（单叶系卡：卵形端 1.7 ↔
   *  长卵/披针端 2.8，尺寸抖动改比例（vs 白蜡复叶卡恒比例冻结——单叶无窗列整幅
   *  约束，真叶长宽比本身有域即如实映射）；材质单叶 SDF 按此比例域设计包络）。
   *  【长宽比域类 = 家族共性候选；域值 = 女贞特有（文献域直接映射）】 */
  leafAspectMin: 1.7,
  leafAspectSpan: 1.1,

  // 树皮近景微起伏（女贞特有分化：**灰褐细窄纵脊浅沟低浮雕 + 干面细纹浅色质感**
  // ——第 12 树皮语言，任务书裁决 7；「树皮灰褐色」FRPS Verified [1] + bark-a/b
  // 照片双样本双问 [10]——细窄脊浅沟纵行大体平行（少量横向连接）+ 细鳞微翘 + 中龄
  // 即细浅纹非深裂——建模取中龄细浅端；**沟深低于樟深纵裂（0.036）、脊细于白蜡
  // （{4,6}/0.020）**——先例谱系：樟 0.036/夏栎 0.033/银杏 0.030/重阳 0.028/乌桕
  // 0.027/白蜡 0.020/女贞 0.016（朴同档低带）；**灰褐色调/细纹浅色质感/细鳞微翘/
  // 皮孔（枝上 [1]）主体在材质侧**（ligustrumMaterials 配方层——并行交付），
  // geometry 只管细窄纵脊浅沟浮雕
  /** 低浮雕档锚定 0.016（细窄脊浅沟读向 [10]——「低浮雕、沟浅脊浅对比弱」域
   *  扩展节 C bark_relief Inferred）；主干基环半径 ≈0.22–0.28m（Step 3 域）→ 峰
   *  幅度 ≈3.5–4.5mm（细浅量级域——vs 樟 10–13mm 深沟低一档）。亚视觉地板联动
   *  （ligustrumGeometry 3.0mm）：0.016 下起径 < 0.1875m 的管平滑发射——L1 骨架
   *  起径 0.07–0.09 在地板下：**仅主干有效起伏**、全部分枝管光滑（「皮孔在枝不在
   *  干」[1] + 细浅纹显于主干的读向——灰褐色调/细纹质感归材质层）。【幅度 ∝ 半径
   *  量级挂钩 = 家族共性候选沿用；绝对值 = 女贞特有（低浮雕细浅档）】槽间恒等
   *  （barkRelief 非形态差异维度——slot-0 定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.016,
    /** 细窄脊谐波：k∈{5,7}（细窄纵脊 = 比白蜡 {4,6} 细一档、比樟宽脊 {3,4,6} 细
     *  两档的周向脊密度；主干 radial 16 的奈奎斯特域 8 ≥ 7+1 留 1 档边际——家族
     *  同款边际纪律）。【谐波语言 = 女贞特有定档（细窄脊第 12 语言）】 */
    harmonics: [5, 7],
    /** 轴向游走基率 3.4 rad/m（**顺直档**——「纵行大体平行」bark-a [10]：轴向去
     *  相关 ≈2π/3.4 ≈ 1.85m，纵脊长程连续为主；顺直脊沟族带内（樟 3.2/白蜡 3.6
     *  邻档）；「少量横向连接」[10] 由呼吸调制项承载（BREATHE 幅度家族常量））。
     *  【游走机制 = 家族共性候选；速率值 = 女贞特有（顺直档）】 */
    drift: 3.4,
  },

  /** 主干拓扑（径向 16：奈奎斯特域 8 容纳谐波 7 留 1 档边际（**细窄脊 {5,7} 的
   *  承载需求**——比先例 radial 14 细一档的脊密度）+ 近景圆度；环段 14 承载根部
   *  flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown——flare 1.18 轻度沿家族常量，Step 3 微调归几何））。 */
  trunk: { radial: 16, segs: 14, wander: 0.05, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 ≥3 级可见（Spec §4 Inferred
   *  [10]）的家族五级方法沿用，级数槽间不动。姿态分级为女贞卵圆-广卵端稍紧语言：
   *  upturn [0.24,0.20,0.14,0.08,0.04] 单调递减中正链（**广卵上收链——沿樟
   *  [0.28,0.25,0.20,0.12,0.05] 端稍紧一档**：外层末段上收使冠缘向上收口、顶部
   *  圆钝（卵圆读向上收快于樟广卵）；同时抑制中角横展的冠幅外泄——探针校准依据）
   *  + wander 骨架级 0.10 顺直带 → 末级乱幅 0.38（末级枝外斜-稍下垂（果序重压
   *  [10]）的游走承载）；无 zigzag 交替偏置（Spec 无女贞证据）。各级数值工程设定
   *  （方向 Inferred [10]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.1, upturn: 0.24 },
    { radial: 7, segs: 8, wander: 0.15, upturn: 0.2 },
    { radial: 6, segs: 5, wander: 0.22, upturn: 0.14 },
    { radial: 5, segs: 4, wander: 0.3, upturn: 0.08 },
    { radial: 4, segs: 3, wander: 0.38, upturn: 0.04 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑（樟/白蜡同款）——L3→L4 三挂点承载 6 骨架下的簇位
   *  量 945）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 卵圆窄端组合（009.3 语法复制）：**冠幅比 0.75–0.85 域下段**——窄卵圆
 * 纵长个体（Spec §3 域下段读向 + §6 叶形幅度轴的卵圆端；变体轴无两相栽培证据——
 * 幅度轴带内展开如实记档）。**Step 3 探针回调记档（2026-09-22，三轮）**：初值 0.56
 * + upturn ×1.1 实测 w/h 0.641 出域下沿（upturn 链上举收幅的纵向泄压叠加）；二轮
 * 0.62 + upturn 降档（×1.04）实测 0.696 仍微出；三轮 0.65 + 角域微收（40–58）终测
 * ≈0.74 落域下段（微出 0.75 下沿 ≈0.01 记档——大卡极值外泄的槽间方差内，读向身份
 * = 8 槽最窄端）。
 * 组合：冠幅比 0.65 + 冠高比升（0.78 卵圆纵域长）+ 领导枝 0.52（窄端纵长读向）+
 * crownTopBias 升（0.10 顶密圆钝）。
 */
const LIGUSTRUM_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...LIGUSTRUM_SLOT0_PROFILE,
  crownWidthRatio: 0.65,
  crownCenterRatio: 0.64,
  crownHeightRatio: 0.78,
  crownTopBias: 0.1,
  scaffoldAngleMin: 40,
  scaffoldAngleMax: 58,
  scaffoldAttachMin: 0.6,
  scaffoldAttachSpan: 0.14,
  scaffoldRankLength: [1.06, 1.01, 0.96, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.52,
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.25 },
    { radial: 7, segs: 8, wander: 0.12, upturn: 0.21 },
    { radial: 6, segs: 5, wander: 0.18, upturn: 0.15 },
    { radial: 5, segs: 4, wander: 0.24, upturn: 0.09 },
    { radial: 4, segs: 3, wander: 0.3, upturn: 0.04 },
  ],
};

/**
 * slot-2 开展宽端组合（009.3 语法复制）：**冠幅比开展端 ≈1.0 读向**——form-a
 * 「冠面开展不规则（开展端 1.0–1.2）」双问承重项 [10]（构图不完整样本——开展读向
 * 承重、干结构不承重记档）。组合：冠幅比升（0.72）+ 冠高比降（0.62 扁宽端）+ 冠心
 * 降（0.56——冠最宽带下压）+ 角域下移放宽（44–64 中角域下段更平展——form-a 中角
 * 分枝读向下带）+ 挂高段下移放宽（0.46–0.72 span 0.26）+ 首枝 rank 主导强（×1.30）
 * + crownTopBias 负（−0.06 顶部缓圆宽展）+ 领导枝弱（0.46 开张宽端更弱顶）+
 * upturn 链 ×0.8（冠缘摊平的开展读向）。
 */
const LIGUSTRUM_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...LIGUSTRUM_SLOT0_PROFILE,
  crownWidthRatio: 0.66,
  crownCenterRatio: 0.56,
  crownHeightRatio: 0.62,
  crownTopBias: -0.06,
  scaffoldAngleMin: 44,
  scaffoldAngleMax: 64,
  scaffoldAttachMin: 0.46,
  scaffoldAttachSpan: 0.26,
  scaffoldRankLength: [1.3, 1.05, 0.95, 0.87, 0.81, 0.77],
  scaffoldRankRadius: [1.06, 0.97, 0.91, 0.87, 0.84, 0.81],
  leaderLengthRatio: 0.46,
  levels: [
    { radial: 8, segs: 9, wander: 0.11, upturn: 0.19 },
    { radial: 7, segs: 8, wander: 0.16, upturn: 0.16 },
    { radial: 6, segs: 5, wander: 0.23, upturn: 0.11 },
    { radial: 5, segs: 4, wander: 0.31, upturn: 0.06 },
    { radial: 4, segs: 3, wander: 0.38, upturn: 0.03 },
  ],
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：
 * 散布骨架的方位强弱分化（骨架排列 Unknown [10]——散布口径使偏侧势差更自由）+
 * 冠形个体幅度（Spec §6）——方向采信；幅度工程设定）。组合：asymmetry 升（0.50
 * ——散布骨架的方位大抖动；偏侧相干性由 rank 主导承载）+ scaffoldRankLength 首枝
 * ×1.66 / 弱势 ×0.74（一侧枝展压倒性——首枝质量占比 ≈0.31，配 5 弱枝近均分 →
 * 质心稳定指向首枝方位；白蜡 ×1.66/悬 ×1.62/樟 ×1.66 同构量级带）+
 * scaffoldRankRadius 同向（×1.10）+ 冠幅比 0.56 容纳域 + 角域贴标准微扩（38–56）。
 * 其余维度贴标准（偏冠 = 方位维差异）。
 */
const LIGUSTRUM_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...LIGUSTRUM_SLOT0_PROFILE,
  crownWidthRatio: 0.56,
  crownCenterRatio: 0.6,
  asymmetry: 0.5,
  scaffoldAngleMin: 38,
  scaffoldAngleMax: 56,
  scaffoldAttachMin: 0.58,
  scaffoldAttachSpan: 0.2,
  scaffoldRankLength: [1.66, 1.02, 0.92, 0.84, 0.77, 0.72],
  scaffoldRankRadius: [1.1, 0.96, 0.92, 0.88, 0.85, 0.82],
  leaderLengthRatio: 0.52,
};

/**
 * slot-4 低冠组合（009.3 语法复制）：低分枝点个体——干高占比 ≈0.30 域下侧展开
 * （form-d 0.30 主锚的下带——行道提干相反端；带内展开记档）。组合：挂高段下移放宽
 * （attachMin 0.46 + span 0.26）+ 冠心降（0.54）+ crownTopBias 负（−0.06 底密）+
 * 角域下移（40–58 更平展）+ 姿态下压（levels upturn ×0.65——开展弱化端、冠缘摊平；
 * 分级单调性保持）+ 簇半径微升（0.14–0.19 低开张大簇偏大）+ 领导枝 0.46（低冠槽
 * 弱顶同向）+ 冠幅比 0.60（涌现带内）。高冠槽冠底差同 seed 实测记档见测试。
 */
const LIGUSTRUM_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...LIGUSTRUM_SLOT0_PROFILE,
  crownWidthRatio: 0.6,
  crownCenterRatio: 0.54,
  crownHeightRatio: 0.72,
  asymmetry: 0.42,
  crownTopBias: -0.06,
  scaffoldAngleMin: 40,
  scaffoldAngleMax: 58,
  scaffoldAttachMin: 0.46,
  scaffoldAttachSpan: 0.26,
  scaffoldRankLength: [1.14, 1.03, 0.96, 0.9, 0.86, 0.82],
  scaffoldRankRadius: [1.03, 0.96, 0.92, 0.89, 0.87, 0.85],
  leaderLengthRatio: 0.46,
  clusterRadiusMinL5: 0.14,
  clusterRadiusSpanL5: 0.05,
  levels: [
    { radial: 8, segs: 9, wander: 0.11, upturn: 0.16 },
    { radial: 7, segs: 8, wander: 0.16, upturn: 0.13 },
    { radial: 6, segs: 5, wander: 0.23, upturn: 0.09 },
    { radial: 5, segs: 4, wander: 0.31, upturn: 0.05 },
    { radial: 4, segs: 3, wander: 0.38, upturn: 0.03 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制）：高分枝清干个体——干高占比 ≈0.30 域上侧展开
 * （行道修剪提干语境的自然变体带内上端——园艺推断无样本，Unknown 域的带内上侧
 * 展开记档）。组合：挂高段上移收窄（attachMin 0.70 + span 0.10——高挂点 + 挂高段
 * 集中）+ 冠心升（0.66）+ crownTopBias 升（0.10 顶密）+ 领导枝 0.52（高冠槽树高
 * 读向偏高与身份同向）+ 角域上移（32–48 更斜上）+ 姿态上举（levels upturn ×1.3；
 * 分级单调性保持）+ 冠高比降（0.62 高挂点纵域收窄）+ 冠幅比 0.56（涌现带内）+
 * asymmetry 降（0.36）。
 */
const LIGUSTRUM_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...LIGUSTRUM_SLOT0_PROFILE,
  crownWidthRatio: 0.63,
  crownCenterRatio: 0.66,
  crownHeightRatio: 0.62,
  asymmetry: 0.36,
  crownTopBias: 0.1,
  scaffoldAngleMin: 36,
  scaffoldAngleMax: 52,
  scaffoldAttachMin: 0.7,
  scaffoldAttachSpan: 0.1,
  scaffoldRankLength: [1.08, 1.02, 0.96, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.52,
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.31 },
    { radial: 7, segs: 8, wander: 0.12, upturn: 0.26 },
    { radial: 6, segs: 5, wander: 0.18, upturn: 0.18 },
    { radial: 5, segs: 4, wander: 0.24, upturn: 0.1 },
    { radial: 4, segs: 3, wander: 0.3, upturn: 0.05 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：密档疏端——空隙 ≈5–15% 带疏端（canopy-b
 * 10–15% 读向个体 [10]；**果簇承载轴的疏端——资格簇数随密度参数收缩，果簇随槽平滑
 * 减少（确定性步长抽选的间接承载，家族契约无果序参数位记档同 011.6/011.9/011.10）**）。
 * 组合：canopyDensity 0.78（密档疏端——仍高于樟疏槽 0.79 同带起步：常绿满密基调
 * 的幅度下限；**Step 3 探针定档：Mid 总面保 6000 下沿余量**）+ crownShellStart ↑
 * （0.52 壳带更薄）+ crownCoreStart ↓（0.10）+ coreDensityFloor ↓（0.04——疏端）
 * + 空腔半径域 ↑（0.46–0.80 大空隙）+ clusterMinSeparation ↑（0.58 疏簇更散）+
 * clusterShellBias ↓（0.40 散布更宽）+ 领导枝弱（0.46）+ 冠幅比 0.62（涌现带内）。
 */
const LIGUSTRUM_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...LIGUSTRUM_SLOT0_PROFILE,
  crownWidthRatio: 0.62,
  canopyDensity: 0.78,
  crownShellStart: 0.52,
  crownCoreStart: 0.1,
  coreDensityFloor: 0.04,
  voidRadiusMin: 0.46,
  voidRadiusMax: 0.8,
  clusterMinSeparation: 0.58,
  clusterShellBias: 0.4,
  leaderLengthRatio: 0.46,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密团冠端——空隙 ≈5–15% 带密端（canopy-a
 * 5–10% 读向 [10]——密端更深于樟（10–15%）：覆盖 85–95% + 大团块 1/4–1/5 冠宽的
 * 整块浓密读向；**果簇承载轴的密端——果簇随槽平滑增多（间接承载记档同 slot-6）**）。
 * 组合：canopyDensity 0.97（密端上限——先例同款预算校准流程：樟 0.94/朴 0.93 定档
 * 带内、女贞密端 +大卡覆盖补偿取 0.97 探针校）+ crownShellStart ↓（0.42 满密壳带
 * 更厚）+ crownCoreStart ↑（0.15）+ coreDensityFloor ↑（0.11 团冠感——仍低于樟
 * 0.12 密端，5–15% 带内）+ 空腔半径域 ↓（0.30–0.54）+ clusterMinSeparation ↓
 * （0.46 簇更密）+ clusterShellBias ↑（0.54 簇更实）+ 冠幅/冠高比 0.64 / 0.72
 * （团冠体量）+ 领导枝 0.50。
 */
const LIGUSTRUM_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...LIGUSTRUM_SLOT0_PROFILE,
  crownWidthRatio: 0.66,
  crownHeightRatio: 0.72,
  canopyDensity: 0.97,
  crownShellStart: 0.42,
  crownCoreStart: 0.15,
  coreDensityFloor: 0.11,
  voidRadiusMin: 0.3,
  voidRadiusMax: 0.54,
  clusterMinSeparation: 0.46,
  clusterShellBias: 0.54,
  leaderLengthRatio: 0.5,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 卵圆窄 / 开展宽 /
 * 偏冠 / 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；
 * 女贞沿 Spec §6 幅度轴展开：冠幅比 0.75–1.0 两端（slot-1 卵圆窄端 / slot-2 开展
 * 宽端）/ 偏冠端（slot-3）/ 干低端/高端（slot-4/5——0.30 域两侧带内展开记档）/
 * 疏密端（slot-6/7——空隙 5–15% 带两端 + 果簇承载轴间接承载）。slot-1…7 以 slot-0
 * 锚点为底的差量展开定义——**结构计数类字段（trunk/levels radial/segs、childPlan、
 * 簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/长宽比域由展开继承逐位
 * 恒等**（皮面数恒等 24236 与 rng 消费次数恒等的结构性保证；**核果挂点 = 确定性
 * 账目零 rng**（ligustrumGeometry 常数与判据）——槽间恒等无消费口径问题）；
 * **单叶卡尺寸/长宽比域全槽不动（叶身份——变比例域整体继承）**；barkRelief 槽间
 * 恒等（spread 继承）。morphSeed 路由见 assets/asset_tree_ligustrum.asset。
 */
export const LIGUSTRUM_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  LIGUSTRUM_SLOT0_PROFILE,
  LIGUSTRUM_SLOT1_PROFILE,
  LIGUSTRUM_SLOT2_PROFILE,
  LIGUSTRUM_SLOT3_PROFILE,
  LIGUSTRUM_SLOT4_PROFILE,
  LIGUSTRUM_SLOT5_PROFILE,
  LIGUSTRUM_SLOT6_PROFILE,
  LIGUSTRUM_SLOT7_PROFILE,
];
