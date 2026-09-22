/**
 * runtime/procedural/tree/fraxinus/fraxinusShapeProfile —— 白蜡树 shapeProfile 数值面
 * （T011.10 Step 2，阔叶家族契约第十一实例——方法复制自夏栎第一实例经朴树（T011.1）/
 * 香樟（T011.2）/榉树（T011.3）/银杏（T011.4）/悬铃木（T011.5）/栾树（T011.6 复叶
 * 首例）/乌桕（T011.7）/重阳木（T011.8）/国槐（T011.9 一回羽叶第一实例——最直接
 * 模板）十次验证的通路 ../sophora/sophoraShapeProfile 同构）。
 *
 * 职责：白蜡树（**Fraxinus chinensis subsp. chinensis 白蜡树原亚种本尊**——种定名
 *      终审裁决 1：FRPS 61:30 独立种口径 + FOC Vol.15 两亚种口径收口 subsp. chinensis
 *      （subsp. rhynchophylla 花曲柳北方原生不含长江流域 + 属级「白蜡树最常见于
 *      栽培」）；「白蜡」命源 = 白蜡虫产蜡经济用途非叶背蜡感（叶背不做蜡白过度
 *      引申）〕，木犀科（Oleaceae）梣属落叶乔木——**长江流域城市公园夏绿落叶单干
 *      中龄个体 ≈10m**（志书「落叶乔木，高10-12米」直给罕见体量锚——终审裁决 2，
 *      slot-0 锚 ≈10m 卵圆开展冠不宜取高端）、**一回奇数羽状复叶 + 三重对生结构
 *      （复叶在枝上对生（属级「叶对生」Verified [5][6]）+ 小叶沿叶轴对生（照片级
 *      双问确认）+ 对生芽序（双问确认）——终审裁决 8 白蜡身份结构）+ 卵圆-圆头
 *      开展冠（冠幅比 0.7–1.0，比国槐 0.9–1.2 窄一档——裁决 7）+ 中位分歧 scaffold
 *      + 开展外斜大枝 + 匙形单翅果帘幕簇（夏末盛挂身份信号——做，裁决 4/5）+ 灰褐
 *      浅-中纵裂树皮（第 11 语言，裁决 6）**语言）枝干/冠层结构的形态参数**数值面**
 *      ——类型契约 = 阔叶家族契约 ../broadleaf/broadleafShapeProfile
 *      （BroadleafShapeProfile，**零修改第十一实例化**）。**十先例的数值是证据不是
 *      家族真理**，本文件全部数值依据 docs/research/fraxinus-reference.md（Spec
 *      Version 1.0——生产一律以文末「终审记档」③ 终审裁决八项为准）白蜡树自己的
 *      现实事实重定；下方逐字段标注【家族共性候选】沿用 /【白蜡特有】新证据 /
 *      工程设定（无现实基准不编造依据）。方法恒同纪律（T011.10 任务书）：五级拓扑
 *      L1–L5、叶簇挂末两级 L4/L5、结构计数类跨槽恒等、rng 无条件消费、LOD 三档
 *      同流派生整体复制自 sophora 第十实例化，白蜡只换数值与算法细节（几何侧差异
 *      点归 fraxinusGeometry Step 3 交付）。
 * 边界：白蜡资产私有数值面——不进 ProceduralBuild 公共签名（build 只负责把 morphSeed
 *      路由到对应槽的 profile，见 assets/asset_tree_fraxinus.asset）；比率字段以
 *      totalHeight（形态参数域树高）或实际涌现高度为基；角度字段以度存、弧度算。
 *
 * ── Step 1 结构分析（Spec 1.0（含终审记档）× sophora 一回羽叶第一实例对照，主代理
 *    Step 1 判定为执行依据：一回奇数羽状复叶沿 011.9 国槐路径（1 卡整枚、2 tri、
 *    窗列单级化）——同型不同数值对照 + 挂点语言对生化（本树核心分化位，文件内最小
 *    扩展）；三栏落档）──
 *
 * ■ 可继承项（家族方法原样沿用，白蜡证据同向）：
 *   1. 五级拓扑 L1–L5 + 叶簇挂末两级 L4/L5——白蜡分枝 3–4 级可见（Spec §4
 *      branching_levels Inferred [12] form-c 冬态细枝疏网）落在家族五级口径内；
 *   2. 主次分级（rank 乘子 / radiusRatio / endRatio 梯度）——Spec 无反证（衰减数值
 *      Unknown，域扩展节 A 全组 Unknown），家族方法沿用；
 *   3. 枝梢驱动叶簇——家族「簇挂末两级枝梢」映射同向（挂点语言的白蜡分化见改写项 1）；
 *   4. 锥度管状枝干 + 树皮近景微起伏机制（纯确定性谐波函数、幅度 ∝ 局部半径、零 rng）；
 *   5. LOD 三档同流（同 rng 流 / Mid⊂High 掩码 / Low 簇位壳卡 / 附加元素 Low 省略
 *      档间连续记档——triadica/sophora 果处理先例）；
 *   6. rng 无条件消费、slot-0 锚点 + 7 槽差量展开（009.3 语法）、结构计数类跨槽恒等；
 *   7. 尺度锚中龄公园 ≈10m（志书「高10-12米」直给——裁决 2 罕见志书级体量锚；与
 *      国槐 ≈10/栾树 ≈10/重阳木 ≈10 同量级）。
 *      （跨会话重验记档 2026-09-22：原列表编号跳 3 系上会话编辑残留——国槐版第 3 条
 *      「冠内通透三规则」的白蜡对应内容已并入改写项 8（密度语言中通透），机制沿用
 *      不变，重编号 1–7 修正；数值面零改动。）
 *
 * ■ 按白蜡改写项（每条映射实现面）：
 *   1. **一回羽叶卡 + 对生挂点语言（家族复叶第四型 / 对生系首例核心，Spec §4/
 *      域扩展节 B 复叶形态组 + 终审裁决 8）**：卡路径沿 011.9（1 卡 2 tri 承载整枚
 *      一回奇数羽叶；窗列单级化——小叶对生窗列 + 顶生小叶独立窗位 + 裸轴基段全部
 *      归材质 SDF 层），**同型不同数值对照**（vs 国槐）：①小叶 **5–7 枚（2–3 对 +
 *      顶生，vs 国槐 9–15 枚）严格对生窗列**（vs 国槐「对生或近互生」的 0.18·space
 *      降列——白蜡对生严格，材质 SDF 无降列）；②顶生小叶独立窗位**近等大或稍大**
 *      （FRPS「顶生小叶与侧生小叶近等大或稍大」Verified [1]）；③**裸柄段更长**——
 *      叶柄 4–6cm 占复叶 15–25cm 约 **1/4–1/3**（「叶柄长4-6厘米，基部不增厚」
 *      Verified [1]——bare 段占比高于国槐，材质 SDF bare 门控定档依据）；④缘整齐
 *      锐锯齿（vs 国槐全缘——复叶系缘齿对照轴，归材质 SDF）。**挂点语言对生化**
 *      （本树核心分化位）：簇内复叶卡方位 = **decussate 对生对**（相邻叶对交互
 *      ±90°：φ_j = ⌊j/2⌋×90° + (j mod 2)×180° + 抖动——「叶对生」属级 Verified
 *      [5][6] 的几何落地，vs 国槐黄金角互生螺旋）；卡 = 2 tri 整枚复叶，**卡宽/长比
 *      冻结 0.36**（主代理冻结接口——小叶更大更少（5–7 枚 3–10cm vs 国槐 9–15 枚
 *      2.5–6cm）故横向展开略宽于国槐 0.34）；尺寸抖动仅缩放；**卡 uv 约定（冻结
 *      接口）：v=0 复叶基部（裸柄段）→ v=1 顶端（顶生小叶尖），u=0.5 叶轴中轴，
 *      宽/长 0.36**；每簇 10 候选（对生叶节位合并抽象——15–25cm 羽叶细碎层叠冠面
 *      的工程映射，国槐同款小卡高数量）；小簇（0.15–0.22）+ 中间距抑制；
 *   2. 树形语言：**卵圆-圆头开展冠 + 中位分歧 scaffold + 开展外斜大枝 + 弱-中庸
 *      领导枝**（Spec §3 冠形重点问题：form-a 双问「主枝中位分歧 + 大枝开展外斜」
 *      + form-c「大骨架枝伸展→圆润开敞冠」+ fruit-c「主枝自主干向上外斜伸」三源
 *      Inferred [12]；**vs 国槐主枝低位放射**——挂高段 0.58–0.78 中位（vs 国槐
 *      0.52–0.74 低位），单段角域直接消费（无国槐两段角带——中位分歧无低位放射
 *      身份））+ 领导枝弱-中庸 0.50（域扩展节 A apical_dominance「中庸-失去领导」
 *      Inferred [12]——圆头开展冠读向）+ 散布方位（骨架排列 Unknown [12]）；
 *      **嫩枝交互扁平**（属级「嫩枝在上下节间交互呈两侧扁平状」Verified [5]——
 *      几何侧不表达记档：亚厘米级近景信号、末级管径向 4–5 段下椭圆化不可读且改
 *      变管发射法线机制，归缺口候选，取舍见 fraxinusGeometry 模块头）；
 *   3. 冠幅比：Spec §3/终审裁决 7 **0.7–1.0（卵圆-圆头开展冠——form-a 双问「冠幅
 *      ≈高或略大」读向落上段 + 弱 Inferred 如实；比国槐 0.9–1.2 族内最开展档窄一
 *      档）**；8 槽 w/h 涌现落 0.65–1.05 带读向（crownWidthRatio 参数探针定档——
 *      T009.3 口径外泄系数实测回写，见字段注释）；
 *   4. 干高占比：域扩展节 A trunk_height_ratio **Unknown**（无整树标定——Spec 结构
 *      缺口记档）；中位分歧读向（form-a [12]）→ 干高参数域 0.26–0.34 + 挂高段
 *      0.58–0.78 承载；低端/高端变体走 slot-4/slot-5 槽位化记档（带内展开非两相
 *      栽培证据——与国槐 NC 两相 Verified 不同级，如实）；
 *   5. 骨架数：域扩展节 A scaffold_branch_count Unknown → **6 骨架枝 + 1 领导枝**
 *      （拓扑 L1=7 → 枝数 [7,21,63,189,378]、簇位 945（L4 189×1 + L5 378×2）、
 *      皮面 24178——10m 开展冠小卡高数量 + 翅果簇组 0 预算留带内余量，账目见
 *      clusterLeaves 注释；国槐同拓扑——族内预算行沿用）；
 *   6. **翅果簇（Spec 判定做——终审裁决 4/5：匙形单翅果家族独有造型 + 可见窗口极长
 *      （7–9 月盛挂 + 宿存至翌年 2 月照片双源）+ 满冠帘幕显著（fruit-c 双问）+
 *      覆盖 9–10 月主语境）**：**簇 10 枚级下垂密簇、满冠帘幕分布**（fruit-a「每簇
 *      10 枚级下垂簇」+ fruit-c「满冠帘幕 very conspicuous」[12]——vs 国槐念珠串
 *      冠缘散点：**资格门槛更宽（q≥0.30 vs 国槐 0.42——覆盖满冠外-中部）**）——
 *      **零 rng 确定性挂点账目法**（011.6/011.7/011.9 先例：保留 L5 簇位冠带判据 +
 *      位置散列排序 + 固定步长抽选——账目恒等可断言）；**主域单果 3–4cm × 宽
 *      4–6mm 匙形（「翅果匙形，长3-4厘米，宽4-6毫米」FRPS Verified [1]——裁决 5）
 *      × 2 家族工程映射 → 果长 0.06–0.08m 级、果宽 0.008–0.012m**；每簇 8–12 果
 *      （簇 10 枚级 [12] 的全域确定性分布）；几何 = **扁平 quad 面片果，正反双 quad
 *      = 4 tri/果**（双面由几何侧承担〔材质组 0 FrontSide〕——「双 tri 双面渲染」
 *      冻结接口的最终实现口径：正面 quad 2 tri + 反面顶点序反转 2 tri，冠下仰观
 *      （fruit-c 主视角）背面可见；vs 国槐八面体珠 8 tri/珠：翅果为扁平翼片造型、
 *      实心八面体不适型——选型记档见 fraxinusGeometry）；**uv 果域标记
 *      v∈[4,5]**（sophora/triadica 冻结口径：面基 4.0 / 面尖 4.97——果内归一长轴
 *      坐标 = (v−4.0)/0.97，坚果端 v=4.0 / 翼尖 v=4.97）+ **u 逐果色档**（嫩绿→
 *      黄绿→淡褐色序 [12]，冻结接口）；数量级定档 **400–900 果/树（40–90 簇）**
 *      （任务书口径——按 Mid 预算带内定档：STRIDE 5 实测 **501–678 果/50–67 簇**
 *      （8 槽，2026-09-22 终测），记档见 fraxinusGeometry/asset）；Low 档省略
 *      （先例）；花不做
 *      （裁决 3——无花冠 + 毫米级 + 淡色 + 窗口短，身份四信号已足）；
 *   7. 树皮（第 11 语言，终审裁决 6）：**灰褐浅-中纵裂（浅细脊沟）+ 幼干-大枝近
 *      光滑 + 皮孔小不明显**（「树皮灰褐色，纵裂」FRPS Verified [1] + 多源中景照片
 *      合并 [12]——幼干光滑浅灰褐带皮孔 → 中龄浅-中纵脊沟 → 老干渐深；无剥落无
 *      碎翘）——几何只管浅细纵裂浮雕 → amplitudeRatio **0.020**（**浮雕幅度比国槐
 *      0.032 低一档**——浅细脊沟 vs 厚脊深沟；vs 先例樟 0.036/夏栎 0.033/重阳
 *      0.028/乌桕 0.027/朴 0.016/栾 0.013——中低档）+ 谐波 **{4,6}**（浅细脊 =
 *      次低谐波量级——比国槐厚脊 {3,4,6} 细一档、留奈奎斯特边际）+ drift **3.6
 *      rad/m 顺直档**（纵脊长程连续为主——顺直脊沟族（银杏 2.6/乌桕 2.8/樟 3.2）
 *      带内，无国槐局部交叉读向）+ **细枝光滑**（起伏幅度地板 3.5mm（011.8/011.9
 *      同款）：0.020 下起径 < 0.175m 的管平滑发射 → **仅主干有效起伏**（L1 骨架
 *      起径 0.09–0.11 在地板下）、全部分枝管光滑——「幼干-大枝近光滑 + 浅裂显于
 *      主干」裁决 6 读向；**皮孔/灰褐色调/地衣绿斑主体在材质侧**（fraxinusMaterials
 *      配方层——并行交付））；
 *   8. 密度语言：**中通透**（空隙 ≈25–40% Inferred [12]——fruit-c「airy 开放」+
 *      form-c「细枝疏网」弱双源；**vs 国槐 10–20% 致密端——两树通透度对照为族门
 *      密度横向定量第二对样本（裁决 7 记档）**）→ canopyDensity 0.86（vs 国槐
 *      0.94——通透端带）+ crownShellStart 0.48 + coreDensityFloor 0.07（芯层可
 *      空透）+ 空腔 3 个中域 0.46–0.80（vs 国槐 2 个小域——通透相空腔多而大）+
 *      疏密差异归槽 6/7；
 *   9. 8 槽形态向量沿 Spec §6 幅度轴展开（差异轴：**冠幅比 0.7–1.0 两端（卵圆窄端
 *      ↔ 圆头开张宽端）/ 干高端 / 偏冠 / 疏密端（空隙 25–40% 带两端）**——主代理
 *      指定）：slot-1 卵圆窄端（冠幅比域下段 0.7 读向个体）/ slot-2 圆头开张宽端
 *      （域上段 ≈1.0 读向——form-a「冠幅≈高或略大」）/ slot-3 偏冠（骨架排列
 *      Unknown [12] 散布口径的方位势差承载）/ slot-4/5 干低端/干高端（中位分歧域
 *      两侧带内展开）/ slot-6/7 疏密端（空隙 25–40% 带两端——**翅果承载轴间接
 *      承载**：资格簇数随密度参数增减，确定性步长抽选下簇数随槽平滑变化——家族
 *      契约无果序参数位，连续参数承载的实现口径记档同 011.6/011.9）。**山地暴露
 *      gnarled 相（form-b 岩坡扭曲 [12]）不进 8 槽**（变体端——结构差异不落连续
 *      参数，家族同款纪律记档）；subsp. rhynchophylla 北方亚种差分（顶生小叶显著
 *      更大/翅果更窄/果期 9–10 月）记档不建模（Spec §6——生产锚定 subsp.
 *      chinensis）；秋色黄记档不建模（任务书口径）。
 *
 * ■ Unknown 项（Spec Unknown，工程设定不编造依据）：
 *   1. trunk_taper_ratio / basal_flare_ratio（域扩展节 A 均 Unknown）——干形锥度与
 *      根部 flare 沿家族常量（Step 3 geometry），工程设定；
 *   2. DBH / 干径典型值 Unknown（照片不可标定——Spec §2 记档）——根径 0.24–0.30m
 *      工程设定（「材理通直」[1] 细干读向 + 10m 中龄量级，家族带内偏细档，Step 3
 *      探针校）；
 *   3. scaffold 角域数值 = 定性 Inferred（中位分歧/开展外斜 [12]）/ 度数工程默认
 *      ——分级记档（Unknown 域 + 方向带内）；
 *   4. branch_length_decay / branch_radius_decay / branch_attachment_t /
 *      allometry_exponent——家族量级工程设定；
 *   5. 小叶窗列细节（对生严格窗位/顶生小叶窗位/裸轴基段比例 1/4–1/3/小叶卵形-
 *      倒卵状长圆形-披针形三相/先端锐尖至渐尖/缘整齐锐锯齿/小叶柄 3–5mm/硬纸质/
 *      侧脉 8–10 对/两面色差弱于国槐——Verified [1][2][3]）——归材质 SDF 层（几何
 *      不建模）；芽形态（对生黑褐阔卵形芽 [1][5][12]——冬态-早春近景独有信号，
 *      夏绿主相不建模记档）；果色细档（归材质 u 通道）；
 *   6. 冠层密度梯度 crown_fill_gradient Unknown——通透只调整体密度与空腔（家族口径）。
 *
 * 不建模记档（Spec 有事实、工程不表达）：一回羽叶内部结构（小叶 5–7 枚对生窗列/
 * 顶生近等大/裸柄段/小叶三相/锐锯齿/两面色差——Verified [1][2][3][12]，归
 * fraxinusMaterials 复叶 SDF 层）；**花**（圆锥花序 5–10cm/无花冠/萼 1–3mm——
 * Verified [1][2][12]，终审裁决 3 不做：无瓣最弱信号 + 窗口短 + 身份四信号已足）；
**嫩枝交互扁平**（属级 Verified [5]——亚厘米级近景信号，几何侧不表达记档归缺口
 *      候选）；对生芽序（照片双问确认 [12]——冬态-早春信号，夏绿相不建模）；
 *      翅果色序细档与宿存冬态（归材质 u 通道/风格层）；秋色黄（记档不建模）；
 *      山地 gnarled 相（form-b [12]）；subsp. rhynchophylla 北方亚种差分（Spec §6）；
 *      树皮皮孔/地衣绿斑（归材质层）；多干萌生相（萌发力强 [1]——频率 Unknown，
 *      变体端不进 8 槽）。
 */
import type { BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';

/** 一回羽叶卡宽/长比冻结值的倒数（宽/长 = 0.36 主代理冻结（材质冻结接口）⇒ 长/宽
 *  aspect = 1/0.36 ≈ 2.7778——家族 leafAspect 语义 = 卡长/卡宽；leafAspectSpan = 0：
 *  尺寸抖动仅缩放不改比例（SDF 按此比例设计窗列） */
const LEAF_ASPECT_IMPARIPINNATE_OPPOSITE = 1 / 0.36;

/**
 * slot-0 标准组合初值（锚点形态）：长江流域公园夏绿单干中龄个体 ≈10m 量级（志书
 * 「高10-12米」直给——终审裁决 2 罕见志书级体量锚，slot-0 锚 ≈10m 卵圆开展冠不取
 * 高端）、**卵圆-圆头开展冠**（中位分歧 scaffold 挂高段 0.58–0.78 + 开展外斜角域
 * 单段直读 + 领导枝弱-中庸 + 散布方位——无国槐两段角带（中位分歧无低位放射身份））、
 * **一回羽叶小卡 decussate 对生簇**（卡宽 0.076–0.126 × 长/宽 2.7778 恒比例冻结
 * 0.36；每簇 10 候选对生对——相邻叶对交互 ±90°）、冠内通透中通透带（空隙 25–40%）、
 * **匙形翅果帘幕簇**（保留 L5 簇位冠带确定性抽选——零 rng 账目，果域 uv v∈[4,5]
 * + u 逐果色档，扁平 quad 正反双面 4 tri/果）、无花资产（裁决 3）。T009.3 教训沿用：视觉冠底
 * 由挂高段 + 横展角 + upturn + 领导枝链涌现，不由 crownCenterRatio。结构计数类
 * （trunk/levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）
 * 全槽恒等；**复叶卡比例 0.36 结构性恒定**（冻结接口）；卡宽域槽间不动（叶身份）。
 */
export const FRAXINUS_SLOT0_PROFILE: BroadleafShapeProfile = {
  // 冠形
  /** Spec §3 / 域扩展节 / 终审裁决 7：冠幅/树高比 **≈0.7–1.0（卵圆-圆头开展冠——
   *  form-a 双问「冠幅≈高或略大」读向落上段 + form-c 开展圆冠读向；弱 Inferred
   *  （志书无冠幅句、无标定样木）如实记档；比国槐 0.9–1.2 族内最开展档窄一档——
   *  裁决 7）**。**Step 3 探针回推定档（2026-09-22 实测，三轮）**：单段角域直读的
   *  横向伸长外泄系数仅 ×~1.19（vs 国槐两段带 ×~1.63——无近水平下带的横展泄压），
   *  初值 0.52 + 角域 46–62 实测 w/h 全带偏窄（0.53–1.16 且锚点 0.61 出域下沿）；
   *  回调参数终值 **0.63** + 角域 **44–66** 后终测涌现 **w/h = 0.763** 落域下中段、
   *  8 槽带 **0.715–1.037** 落 Spec 域读向带（见 asset 模块头）。
   *  【冠幅比类 = 家族共性候选沿用；锚值 = 白蜡特有（工程域 + 实测外泄系数回推）】 */
  crownWidthRatio: 0.63,
  /** 工程设定（消费语义 T009.3：不动几何只进密度场参考系；卵圆-圆头冠体中心中带
   *  ——中位分歧的冠体读向参考系，实际由挂高段 + 角域 + 领导链驱动）。 */
  crownCenterRatio: 0.58,
  /** 工程设定（同上；卵圆冠纵域参考系——中高带）。 */
  crownHeightRatio: 0.64,
  /** Spec 域扩展节 A branch_orientation：骨架排列 Unknown（无轮生/对生口径证据——
   *  复叶/芽对生为末级结构证据 [5][6][12]，不外推骨架）；散布方位沿用九实例主流
   *  读向。slot-0 = 0.40（散布端——方位均分步进 + 大抖动 → 互生散布读向）。
   *  【散布机制 = 家族共性候选沿用；幅度 = 白蜡特有（骨架 Unknown + 工程默认）】 */
  asymmetry: 0.4,
  /** Spec §3 冠形「卵圆-圆头开展形」（form-a/c/fruit-c 三源 Inferred [12]）——
   *  圆头微圆顶的密度场高度向近平偏置；几何侧顶圆化由角域 + 领导链承载。【白蜡
   *  特有定档依据 = Spec §3 冠形重点问题 Inferred [12]（志书无冠形句如实）；
   *  幅度工程设定】 */
  crownTopBias: -0.02,

  // 骨架
  /** Spec 域扩展节 A scaffold_branch_count Unknown（无标定整树样木）→ slot-0 =
   *  **6 骨架枝 + 1 领导枝**（拓扑 L1=7 → 簇位 945 / 皮面 24178——10m 开展冠小卡
   *  高数量 + 翅果簇组 0 预算余量，账目见 clusterLeaves 注释；国槐同拓扑族内预算
   *  行沿用）。【结构计数类：槽间恒等；取 6 = 工程默认（Unknown 域 + 开展冠多枝
   *  读向带内）】 */
  scaffoldCount: 6,
  /** Spec 域扩展节 A scaffold_angle Unknown（度数）；定性 = **开展外斜、自中上部
   *  向上外斜伸展**（form-a 双问「主枝中位分歧、大枝开展外斜」+ fruit-c「主枝自
   *  主干向上外斜伸、冠圆润开张」+ form-c「大骨架枝伸展→圆润开敞冠」三源
   *  Inferred [12]）——**单段角域直读**（**44–66°**：斜上-开展的外斜中带（初值
   *  46–62 探针回调放宽——横展外泄系数 ×1.19 偏窄的角域侧补偿，见 crownWidthRatio
   *  注释）；**无国槐两段角带**——中位分歧无主枝低位放射身份，槽间角域差异整体
   *  平移）。【白蜡特有
   *  （定性 Inferred [12] 三源；度数工程默认——分级记档）】 */
  scaffoldAngleMin: 44,
  scaffoldAngleMax: 66,
  /** Spec 域扩展节 A trunk_height_ratio Unknown（无整树标定）+ 中位分歧读向
   *  （form-a 双问 [12]）——挂高段实现：挂点 **0.58–0.78** 干高段 span 0.20
   *  （**中位分歧——vs 国槐 0.52–0.74 低位**：挂高段下缘上抬一档；trunk 参数域
   *  0.26–0.34 × H × 0.58–0.78 ≈ 离地 1.5–2.9m 中位带）；低端/高端变体槽位化
   *  （slot-4 低冠 / slot-5 高冠——带内展开非两相栽培证据，与国槐 NC Verified
   *  不同级如实记档）；T009.3：挂高段下缘 + 角域 + upturn + 领导链共同涌现视觉
   *  冠底。【白蜡特有（中位分歧 Inferred [12] 双问 + Unknown 域带内映射）】 */
  scaffoldAttachMin: 0.58,
  scaffoldAttachSpan: 0.2,
  /** 工程设定（branch_radius_decay Unknown、DBH Unknown（照片不可标定 [12]）；
   *  「材理通直」[1] 细干读向 + 10m 中龄量级取 0.52 家族带内偏细档，待视觉验收校）。 */
  scaffoldThickness: 0.52,
  /** rank 长度乘子（6 枝方位序递减，rank0 首枝主导）。工程设定（主次分级家族方法
   *  沿用；散布骨架的环内势差——偏冠槽加大首枝势差承载）。 */
  scaffoldRankLength: [1.12, 1.04, 0.97, 0.91, 0.87, 0.83],
  /** rank 起径乘子（与长度同向）。工程设定。 */
  scaffoldRankRadius: [1.04, 0.97, 0.93, 0.9, 0.88, 0.86],
  /** Spec 域扩展节 A apical_dominance：**中庸-失去领导**（开展圆冠读向 [12]——
   *  form-c 冠顶由骨架链共构）——领导枝 0.50（弱-中庸带（国槐 0.48 / 栾 0.50 同带
   *  ——圆头顶由上段骨架链共构、领导不翻转树顶（T009.3 弱领导翻转警示的安全带内；
   *  **Step 3 探针记档（2026-09-21）**：初值实测涌现树高偏锚域则回调，记档见字段
   *  注释与 asset 模块头）。【白蜡特有定档依据 = Spec apical_dominance Inferred
   *  [12]；幅度工程设定 + 探针回推】 */
  leaderLengthRatio: 0.5,

  // 逐级分级（主次分级；低级陡、末级缓——家族方法沿用）
  /** 工程设定（branch_radius_decay Unknown，无现实基准；7 L1 下起径落差由
   *  scaffoldThickness/rank 承载，逐级比沿用家族量级）。 */
  radiusRatio: [0.48, 0.54, 0.6, 0.65],
  /** 工程设定（branch_length_decay Unknown；末级枝长比沿用家族量级——白蜡无国槐
   *  zigzag 证据（Spec 无原句），细级形态由 wander 梯度承载）。 */
  lengthRatioBase: 0.42,
  lengthRatioSpan: 0.15,
  /** L1 0.60 通体锥度（大枝外斜开展——中庸锥度）。工程设定（Spec 无白蜡锥度数值）。 */
  endRatio: [0.6, 0.58, 0.58, 0.58, 0.58],

  // 冠内通透（中通透基调——空隙 ≈25–40%：fruit-c「airy 开放」+ form-c「细枝疏网」
  // 弱双源 Inferred [12]；vs 国槐 10–20% 致密端——裁决 7 族门密度横向对照第二对样本）
  /** Spec §3 / 域扩展节 B crown_transparency：**中通透**——空隙 ≈25–40%（弱双源
   *  Inferred [12]）。slot-0 = 0.86（**通透带基准——vs 国槐 0.94 致密 / 重阳 0.90
   *  中带**；疏密差异归槽 6/7；空隙量级由密度参数 + 中壳带 + 中大空腔域承载）。
   *  【canopyDensity 类 = 家族共性候选；基调读向 = 白蜡特有（中通透弱双源）】 */
  canopyDensity: 0.86,
  /** Spec §3 冠面「细碎均质绿面 + airy 开放」[12]——外密内疏为家族方向沿用；白蜡
   *  壳带取 0.48（**中壳带**——通透相的外密读向带（vs 国槐厚壳 0.46 / 重阳栾 0.50
   *  中带邻档））。【连续形态参数；值 = 白蜡特有】 */
  crownShellStart: 0.48,
  /** 芯层起点与地板值：通透相 → 芯层地板 0.07（**芯层可空透**——疏朗读向（vs 国槐
   *  0.10 不空透 / 重阳 0.07 开网同档））。工程设定幅度（Spec 只给定性方向）。 */
  crownCoreStart: 0.11,
  coreDensityFloor: 0.07,
  /** 规则①（枝干通道：主干大枝进冠不被封死——通透相同样需要「透」侧保险；通透相
   *  通道不是空隙来源）；数值工程设定（10m 开展冠通道带随冠尺度，比例沿家族量级）。 */
  channelRadius: 0.5,
  /** 规则①骨架枝通道；工程设定。 */
  channelBranchScale: 0.75,
  channelLengthRatio: 0.45,
  /** 规则③（局部空腔：通透相的冠内空隙表达——**数量多而中大**（3 个 0.46–0.80：
   *  vs 国槐致密相 2 个 0.42–0.72 小域——通透相空腔多而大一档）。【结构计数类：
   *  槽间恒等】数量与域 = 白蜡特有（中通透读向）；机制 = 家族共性候选。 */
  voidCount: 3,
  /** 空腔半径域中档（0.46–0.80：通透相中空隙）。值 = 白蜡特有；半径域机制 = 家族
   *  共性候选。 */
  voidRadiusMin: 0.46,
  voidRadiusMax: 0.8,
  /** 工程设定（空腔聚冠心、避冠壳——家族沿用）。 */
  voidCenterBias: 0.6,

  // 叶簇与拓扑预算（叶簇挂末两级 L4/L5——家族语义沿用；白蜡「叶簇」= **末级枝
  // decussate 对生平展小卡簇**（小簇 0.15–0.22 + 每簇 10 候选一回羽叶小卡对生对
  // 散布平摊）= 一回羽叶对生挂点语言；L5 簇位表同时为翅果簇承载位表（确定性账目
  // ——fraxinusGeometry 常数与判据））
  /** Spec §4/域扩展节 B leaf_attachment_rule：**复叶在枝上对生**（属级「叶对生」
   *  Verified [5][6]——decussate 几何落地在 fraxinusGeometry 簇内方位）；着生于
   *  末级枝（当年生黄褐小枝 Verified [1]）——叶沿末级枝全长散布。簇位数 L5=2 +
   *  L4=1（家族沿用——「末级枝外段 + 枝端」的散布位点，外段下限 0.42 起）。 */
  clustersL5: 2,
  clustersL4: 1,
  /** 工程设定（「外段」幅度的家族沿用——末级枝叶组挂外段受光区；平展层叠的站位带）。 */
  clusterInnerStartL5: 0.42,
  clusterInnerStartL4: 0.38,
  /** Spec §2/域扩展节 B leaf_size + clump_scale：真复叶总长 15–25cm（「羽状复叶长
   *  15-25厘米」FRPS Verified [1][2][3]）× ≈1.4 工程映射（011.6/011.8/011.9 复叶
   *  映射系数沿用——复叶 SDF 满幅绘制窗列、无单叶卡叶缘余量需求）→ 卡长
   *  0.21–0.35 / 卡宽 0.076–0.126（**比例 0.36 冻结——小叶更大更少（5–7 枚
   *  3–10cm vs 国槐 9–15 枚 2.5–6cm）故略宽于国槐 0.34**）⇒ **小簇半径
   *  0.15–0.22**（末级枝羽叶组布置球——簇半径 ≈ 卡长 0.6–0.7 量级带（国槐同档）；
   *  卡体伸出球外由卡本体覆盖）；L4 簇 ×1.15 承接更粗末级枝——家族沿用。【簇半径
   *  比类 = 家族共性候选；绝对量级 = 白蜡特有（一回羽叶小卡小簇同国槐档）】 */
  clusterRadiusMinL5: 0.15,
  clusterRadiusSpanL5: 0.07,
  clusterRadiusScaleL4: 1.15,
  /** 工程设定（家族沿用——短枝梢簇随之缩小的 cap 语义：L5 枝长 ~0.4–0.6m 下 cap
   *  0.22–0.33，簇半径实际由 cap 主导）。 */
  clusterRadiusLengthCap: 0.55,
  /** Spec 域扩展节 B leaf_cluster_density「1 枚羽叶/挂点」+ 细碎层叠冠面——簇级
   *  显式剔除的间距保险：0.55（小卡中距（国槐同档）：簇心距 ≥ 0.55×(ri+rj) ≈
   *  0.17–0.25m；挂点 rng/复叶卡 rng 无条件消费后丢弃，确定性不破；**Step 3 探针
   *  定档**：Mid 总面贴预算带则回调，记档）。【间距机制 = 家族共性候选；值 = 白蜡
   *  特有（小卡小簇中距）】 */
  clusterMinSeparation: 0.58,
  /** 工程设定（簇-枝梢生长关系幅度项，家族沿用）。 */
  clusterForwardOffset: 0.2,
  /** 每簇叶量 10 = **小卡簇候选数**（对生叶节位语言的卡尺度合并抽象：真羽叶沿枝
   *  对生节距 ~3–6cm × 卡长 0.21–0.35 ⇒ ≈4–8 节/卡长的连续节位合并，每簇 10 候选
   *  = 5 个对生对（decussate 对生对——相邻对交互 ±90°，fraxinusGeometry 簇内
   *  方位语言）的小卡高数量档（国槐同档——「细碎均质绿面」Spec §3 [12] 的工程
   *  映射；通透过滤后逐簇存活典型 5–9 枚））；8 槽簇位 945（L4 189×1 + L5 378×2，
   *  7 L1 拓扑）× 10 卡的 High 实测带见 asset 模块头（2026-09-21 终测记档）。
   *  【每簇叶量类 = 家族共性候选；绝对值 = 白蜡特有（对生小卡高数量抽象）】 */
  clusterLeavesL5: 10,
  clusterLeavesL4: 10,
  /** 外壳偏置 ∈ (0,1]：小卡平摊——簇内叶位归一化半径 r̂ = mix(1−shellBias, 1, rng^γ)
   *  取 0.42（对生羽叶沿末级枝散布非壳聚团——r̂ ∈ [0.58, 1] 的宽域均匀分布，簇心即
   *  枝梢位；「平展层叠」域扩展节 B 的平摊读向——国槐 0.44 邻档）。【壳偏置机制 =
   *  家族共性候选；值 = 白蜡特有（对生散布平摊读向）】 */
  clusterShellBias: 0.42,
  clusterShellGamma: 0.9,
  /** Spec §2/域扩展节 B leaf_size + 材质冻结接口：真复叶总长 15–25cm（Verified
   *  [1][2][3]）× ≈1.4 工程映射 → **卡宽 0.076–0.126m**（真复叶 ×≈1.4 的一回羽叶
   *  小卡档；国槐 0.07–0.12 邻档——小叶更大故略宽）。【卡尺寸域类 = 家族共性候选；
   *  绝对量级 = 白蜡特有（复叶第四型整叶卡）；卡宽域槽间不动（叶身份）】 */
  leafWidthMin: 0.076,
  leafWidthSpan: 0.05,
  /** **一回羽叶卡宽/长比冻结 0.36（主代理接口冻结——材质冻结接口）** → 长/宽
   *  aspect = 1/0.36 ≈ 2.7778 恒定、span = 0（尺寸抖动仅缩放不改比例——卡 v 轴 =
   *  复叶基部（裸柄段）0 → 顶生小叶尖 1、u = 0.5 叶轴中轴，一回羽叶 SDF 按此比例
   *  设计对生窗列（**对生严格 + 顶生近等大 + 裸柄段占比 1/4–1/3**——vs 国槐近对
   *  生降列 + 裸柄更短，Spec [1] 数值对照）——材质-几何冻结接口）。【长宽比域类 =
   *  家族共性候选；恒值 = 白蜡特有（冻结接口——复叶系恒比例卡：0.60 二回 → 0.75
   *  三出 → 0.34 国槐一回 → **0.36 白蜡一回对生（小叶更大更少）**的展幅分化）】 */
  leafAspectMin: LEAF_ASPECT_IMPARIPINNATE_OPPOSITE,
  leafAspectSpan: 0,

  // 树皮近景微起伏（白蜡特有分化：**灰褐浅-中纵裂（浅细脊沟、无剥落无碎翘）+
  // 幼干-大枝近光滑 + 皮孔小不明显**——第 11 树皮语言，终审裁决 6；FRPS「树皮灰褐
  // 色，纵裂」Verified [1] + 多源中景照片合并 [12]（bark-a 幼干光滑浅灰褐带皮孔/
  // fruit-c 中龄浅纵脊沟/ form-c 老干暗灰褐渐深——主干特写缺失如实记档）——建模
  // 取中龄浅-中纵裂端；vs 国槐 0.032/樟 0.036/夏栎 0.033/银杏 0.030/重阳 0.028/
  // 乌桕 0.027/朴 0.016/榉-悬 0.014–0.015/栾 0.013 十分化中**中低档（0.020）——
  // 浮雕幅度比国槐档低一档（浅细脊沟 vs 厚脊深沟）**；**皮孔/灰褐色调/地衣绿斑/
  // 幼干近光滑带主体在材质侧**（fraxinusMaterials 配方层——并行交付），geometry
  // 只管浅细纵裂浮雕）
  /** 浅细纵裂中低档锚定 0.020（浅细脊沟读向 [1][12]——「纵裂」定性承托 + 照片
   *  浅-中端；主干基环半径 ≈0.24–0.30m（Step 3 域）→ 峰幅度 ≈4.8–6.0mm（浅细
   *  量级域——vs 国槐厘米级沟脊 [6] 低一档）。亚视觉地板联动（fraxinusGeometry
   *  3.5mm——011.8/011.9 同款）：0.020 下起径 < 0.175m 的管平滑发射——L1 骨架
   *  起径 0.09–0.11 亦在地板下：**仅主干有效起伏**、全部分枝管光滑（「幼干-大枝
   *  近光滑 + 浅裂显于主干」裁决 6 的几何侧读向——皮孔/色序归材质层）。【幅度 ∝
   *  半径量级挂钩 = 家族共性候选沿用；绝对值 = 白蜡特有（中低档浅细纵裂）】槽间
   *  恒等（barkRelief 非形态差异维度——slot-0 定义、其余槽 spread 继承） */
  barkRelief: {
    amplitudeRatio: 0.02,
    /** 浅细脊次低谐波：k∈{4,6}（浅细纵裂 = 比国槐厚脊 {3,4,6} 细一档的次低谐波
     *  语言（周向 4–6 条浅细脊）；≤ 主干 radial 14 的奈奎斯特域 7 留 1 档边际——
     *  家族同款边际纪律）。【谐波语言 = 白蜡特有定档（浅细脊次低谐波）】 */
    harmonics: [4, 6],
    /** 轴向游走基率 3.6 rad/m（**顺直档**——纵脊长程连续为主（轴向去相关 ≈2π/3.6 ≈
     *  1.75m）：顺直脊沟族带内（银杏 2.6/乌桕 2.8/樟 3.2 邻档），无国槐「纵为主
     *  局部交叉」5.5 的交叉读向、无重阳 6.5 扭转——白蜡浅细纵裂顺直长程读向
     *  [1][12]）。【游走机制 = 家族共性候选；速率值 = 白蜡特有（顺直档）】 */
    drift: 3.6,
  },

  /** 主干拓扑（径向 14：奈奎斯特域容纳谐波 6（14/2=7 ≥ 6+1 边际）+ 近景圆度；环段 14
   *  承载根部 flare 与挂点插值。工程设定（trunk_taper_ratio / basal_flare_ratio 均
   *  Unknown——flare 1.18 轻度沿家族常量，Step 3 微调归几何））。 */
  trunk: { radial: 14, segs: 14, wander: 0.05, upturn: 0.05 },

  /** 五级枝拓扑（L1 骨架枝 → L5 末梢）——结构层级 3–4 级可见（Spec §4 Inferred
   *  [12]）的家族五级方法沿用，级数槽间不动。姿态分级为白蜡开展外斜语言：upturn
   *  [0.08,0.07,0.05,0.04,0.03] 单调递减低正链（端部小枝斜上收口——圆头冠顶
   *  闭合由角域 + 领导链承载主剪影；**Step 3 探针回调记档（2026-09-22）**：初值
   *  [0.09,…,0.04] 实测树高正外泄（+1.0–1.5，slot-1 出 12m 上界）——单段角域直读
   *  无两段带横展泄压，降档对齐国槐低链）；wander 骨架级 0.08 顺直带（大枝较顺直
   *  外斜——「叶轴挺直/材理通直」[1] 的枝姿同向读向）+ 末级乱幅 0.40（细枝疏网
   *  [12] 的游走承载）；**无国槐 zigzag 交替偏置**（Spec 无白蜡 zigzag 证据——细级
   *  形态差异记档）。各级数值工程设定（方向 Inferred [12]）。 */
  levels: [
    { radial: 8, segs: 9, wander: 0.08, upturn: 0.08 },
    { radial: 7, segs: 8, wander: 0.13, upturn: 0.07 },
    { radial: 6, segs: 5, wander: 0.22, upturn: 0.05 },
    { radial: 5, segs: 4, wander: 0.3, upturn: 0.04 },
    { radial: 4, segs: 3, wander: 0.4, upturn: 0.03 },
  ],
  /** 子枝挂点计划 L1→L2 / L2→L3 / L3→L4 / L4→L5（结构计数类：改值即改面数——槽间
   *  恒等；挂点分布沿用家族拓扑（国槐同款）——L3→L4 三挂点承载 6 骨架下的簇位量
   *  945）。工程设定。 */
  childPlan: [
    { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
    { ts: [0.62, 1.0], phaseStep: Math.PI },
  ],
};

/**
 * slot-1 卵圆窄端组合（009.3 语法复制）：**冠幅比 0.7–1.0 域下段**——卵圆形窄冠
 * 个体（Spec §3 弱 Inferred 域下段读向；变体轴无 NC 两相栽培文献承托（白蜡
 * Unknown）——幅度轴带内展开如实记档）。组合：冠幅比降（0.46）+ 冠高比升（0.72
 * 卵圆纵域长）+ 角域上移收窄（52–68——外斜更斜上）+ 挂高段上移收窄（0.64–0.78
 * span 0.14）+ 领导枝中庸（0.50——**Step 3 探针回调记档（2026-09-22）**：初值
 * 0.56 + upturn ×1.25 实测槽高 12.16 出 12m 生产域上界（正外泄主因）——回调 0.50
 * + ×1.1 后终测 10.47 落域）+ crownTopBias 转正（0.04 顶密）+ upturn 链 ×1.1
 * （直立相）。
 */
const FRAXINUS_SLOT1_PROFILE: BroadleafShapeProfile = {
  ...FRAXINUS_SLOT0_PROFILE,
  crownWidthRatio: 0.56,
  crownCenterRatio: 0.62,
  crownHeightRatio: 0.72,
  crownTopBias: 0.04,
  scaffoldAngleMin: 52,
  scaffoldAngleMax: 68,
  scaffoldAttachMin: 0.64,
  scaffoldAttachSpan: 0.14,
  scaffoldRankLength: [1.06, 1.01, 0.96, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.5,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.09 },
    { radial: 7, segs: 8, wander: 0.11, upturn: 0.08 },
    { radial: 6, segs: 5, wander: 0.18, upturn: 0.06 },
    { radial: 5, segs: 4, wander: 0.24, upturn: 0.05 },
    { radial: 4, segs: 3, wander: 0.32, upturn: 0.04 },
  ],
};

/**
 * slot-2 圆头开张宽端组合（009.3 语法复制）：**冠幅比 0.7–1.0 域上段**——form-a
 *  双问「冠幅≈高或略大」的开展圆头宽端读向 [12]。组合：冠幅比升（0.58）+ 冠高比
 *  降（0.58 扁宽端）+ 冠心降（0.54——冠最宽带下压）+ 角域下移放宽（52–68 → 开展
 *  外斜更平展）+ 挂高段下移放宽（0.50–0.74 span 0.24）+ 首枝 rank 主导强（×1.30）
 * + crownTopBias 负（−0.08 顶部缓圆宽圆头）+ 领导枝 0.46（开张宽端更弱顶——探针
 * 回调 +0.02 压 wh 上沿，同轮 crownWidthRatio 0.58→0.53 终测 wh 1.037 = form-a
 * 「冠幅≈高或略大」宽端读向）。
 */
const FRAXINUS_SLOT2_PROFILE: BroadleafShapeProfile = {
  ...FRAXINUS_SLOT0_PROFILE,
  crownWidthRatio: 0.53,
  crownCenterRatio: 0.54,
  crownHeightRatio: 0.6,
  crownTopBias: -0.08,
  scaffoldAngleMin: 52,
  scaffoldAngleMax: 68,
  scaffoldAttachMin: 0.5,
  scaffoldAttachSpan: 0.24,
  scaffoldRankLength: [1.3, 1.05, 0.95, 0.87, 0.81, 0.77],
  scaffoldRankRadius: [1.06, 0.97, 0.91, 0.87, 0.84, 0.81],
  leaderLengthRatio: 0.46,
  clusterMinSeparation: 0.58, // 扁宽冠簇位横向拥挤——回调间距保 Mid 预算余量（国槐 slot-2 同款记档）
};

/**
 * slot-3 偏冠组合（009.3 语法复制）：冠不对称——一侧枝展显著强于对侧（现实依据：
 * 散布骨架的方位强弱分化（骨架排列 Unknown [12]——散布口径使偏侧势差更自由）+
 * 冠形个体幅度（Spec §6）——方向采信；幅度工程设定）。组合：asymmetry 升（0.50
 * ——散布骨架的方位大抖动；偏侧相干性由 rank 主导承载）+ scaffoldRankLength 首枝
 * ×1.66 / 弱势 ×0.74（一侧枝展压倒性——首枝质量占比 ≈0.31，配 5 弱枝近均分 →
 * 质心稳定指向首枝方位；国槐 ×1.72/悬 ×1.62/栾 ×1.78 同构量级带）+
 * scaffoldRankRadius 同向（×1.10）+ 冠幅比 0.47 容纳域 + 角域贴标准微扩（48–64）。
 * 其余维度贴标准（偏冠 = 方位维差异）。
 */
const FRAXINUS_SLOT3_PROFILE: BroadleafShapeProfile = {
  ...FRAXINUS_SLOT0_PROFILE,
  crownWidthRatio: 0.52,
  crownCenterRatio: 0.58,
  asymmetry: 0.5,
  scaffoldAngleMin: 48,
  scaffoldAngleMax: 64,
  scaffoldAttachMin: 0.6,
  scaffoldAttachSpan: 0.22,
  scaffoldRankLength: [1.66, 1.02, 0.92, 0.84, 0.77, 0.72],
  scaffoldRankRadius: [1.1, 0.96, 0.92, 0.88, 0.85, 0.82],
  leaderLengthRatio: 0.52,
};

/**
 * slot-4 低冠组合（009.3 语法复制）：低分枝点个体——中位分歧域下侧展开（trunk_height
 * ratio Unknown 带内下段端记档——非国槐 NC 两相栽培证据级，如实）。组合：挂高段
 * 下移放宽（attachMin 0.48 + span 0.26）+ 冠心降（0.52）+ crownTopBias 负（−0.06
 * 底密）+ 角域下移（50–66 更平展）+ 姿态下压（levels upturn ×0.65——开展弱化端、
 * 冠缘摊平；分级单调性保持）+ 簇半径微升（0.16–0.23 低开张小簇偏大）+ 领导枝
 * 0.46（低冠槽弱顶同向）+ 冠幅比 0.50（涌现带内）。高冠槽冠底差同 seed 实测记档
 * 见测试。
 */
const FRAXINUS_SLOT4_PROFILE: BroadleafShapeProfile = {
  ...FRAXINUS_SLOT0_PROFILE,
  crownWidthRatio: 0.55,
  crownCenterRatio: 0.52,
  crownHeightRatio: 0.64,
  asymmetry: 0.4,
  crownTopBias: -0.06,
  scaffoldAngleMin: 50,
  scaffoldAngleMax: 66,
  scaffoldAttachMin: 0.48,
  scaffoldAttachSpan: 0.26,
  scaffoldRankLength: [1.14, 1.03, 0.96, 0.9, 0.86, 0.82],
  scaffoldRankRadius: [1.03, 0.96, 0.92, 0.89, 0.87, 0.85],
  leaderLengthRatio: 0.46,
  clusterRadiusMinL5: 0.16,
  clusterRadiusSpanL5: 0.07,
  levels: [
    { radial: 8, segs: 9, wander: 0.09, upturn: 0.06 },
    { radial: 7, segs: 8, wander: 0.14, upturn: 0.05 },
    { radial: 6, segs: 5, wander: 0.22, upturn: 0.04 },
    { radial: 5, segs: 4, wander: 0.3, upturn: 0.03 },
    { radial: 4, segs: 3, wander: 0.4, upturn: 0.03 },
  ],
};

/**
 * slot-5 高冠组合（009.3 语法复制）：高分枝清干个体——中位分歧域上侧展开（公园
 * 清干修剪语境的自然变体带内上端——Unknown 域的带内上侧展开记档）。组合：挂高段
 * 上移收窄（attachMin 0.74 + span 0.10——高挂点 + 挂高段集中）+ 冠心升（0.64）+
 * crownTopBias 转正（0.04 顶密）+ 领导枝 0.50（高冠槽树高读向偏高与身份同向——
 * 探针回调自 0.54 记档）+
 * 角域上移（42–58 更斜上）+ 姿态上举（levels upturn ×1.3；分级单调性保持）+
 * 冠高比降（0.60 高挂点纵域收窄）+ 冠幅比 0.47（涌现带内）+ asymmetry 降（0.34）。
 */
const FRAXINUS_SLOT5_PROFILE: BroadleafShapeProfile = {
  ...FRAXINUS_SLOT0_PROFILE,
  crownWidthRatio: 0.56,
  crownCenterRatio: 0.64,
  crownHeightRatio: 0.6,
  asymmetry: 0.34,
  crownTopBias: 0.04,
  scaffoldAngleMin: 42,
  scaffoldAngleMax: 58,
  scaffoldAttachMin: 0.74,
  scaffoldAttachSpan: 0.1,
  scaffoldRankLength: [1.08, 1.02, 0.96, 0.92, 0.89, 0.86],
  scaffoldRankRadius: [1.02, 0.97, 0.93, 0.91, 0.89, 0.87],
  leaderLengthRatio: 0.5,
  levels: [
    { radial: 8, segs: 9, wander: 0.07, upturn: 0.12 },
    { radial: 7, segs: 8, wander: 0.11, upturn: 0.1 },
    { radial: 6, segs: 5, wander: 0.18, upturn: 0.08 },
    { radial: 5, segs: 4, wander: 0.24, upturn: 0.06 },
    { radial: 4, segs: 3, wander: 0.32, upturn: 0.05 },
  ],
};

/**
 * slot-6 疏松组合（009.3 语法复制）：通透疏端——空隙 ≈25–40% 带疏端（Spec §3
 * crown_transparency 弱双源 Inferred [12]——40% 空隙读向个体；**翅果承载轴的疏端
 * ——资格簇数随密度参数收缩，果簇随槽平滑减少（确定性步长抽选的间接承载，家族
 * 契约无果序参数位记档同 011.6/011.9）**）。组合：canopyDensity 0.72（通透带疏端
 * ——**Step 3 探针定档：Mid 总面保 6000 下沿余量**）+ crownShellStart ↑（0.54
 * 壳带更薄）+ crownCoreStart ↓（0.09）+ coreDensityFloor ↓（0.04——疏端）+
 * 空腔半径域 ↑（0.54–0.92 大空隙）+ clusterMinSeparation ↑（0.58 疏簇更散）+
 * clusterShellBias ↓（0.36 散布更宽）+ 领导枝弱（0.46——多枝共构开张端）+ 冠幅比
 * 0.48（涌现带内）。
 */
const FRAXINUS_SLOT6_PROFILE: BroadleafShapeProfile = {
  ...FRAXINUS_SLOT0_PROFILE,
  crownWidthRatio: 0.53,
  canopyDensity: 0.72,
  crownShellStart: 0.54,
  crownCoreStart: 0.09,
  coreDensityFloor: 0.04,
  voidRadiusMin: 0.54,
  voidRadiusMax: 0.92,
  clusterMinSeparation: 0.58,
  clusterShellBias: 0.36,
  leaderLengthRatio: 0.46,
};

/**
 * slot-7 丰满组合（009.3 语法复制）：密团冠端——空隙 ≈25–40% 带密端（Spec §3
 * 弱双源 Inferred [12] 密侧 + 生长季满冠个体；**翅果承载轴的密端——果簇随槽平滑
 * 增多（间接承载记档同 slot-6）**）。组合：canopyDensity 0.92（通透带密端上限——
 * 先例同款预算校准流程：朴 0.93/樟 0.94/国槐 0.94 定档带内）+ crownShellStart ↓
 * （0.42 满密壳带更厚）+ crownCoreStart ↑（0.13）+ coreDensityFloor ↑（0.10
 * 团冠感——仍低于国槐 0.13 致密端，中通透域内）+ 空腔半径域 ↓（0.38–0.64）+
 * clusterMinSeparation ↓（0.50 簇更密）+ clusterShellBias ↑（0.48 簇更实）+
 * 冠幅/冠高比 0.50 / 0.66（团冠体量）+ 领导枝 0.48（团冠顶密带内）。
 */
const FRAXINUS_SLOT7_PROFILE: BroadleafShapeProfile = {
  ...FRAXINUS_SLOT0_PROFILE,
  crownWidthRatio: 0.55,
  crownHeightRatio: 0.66,
  canopyDensity: 0.92,
  crownShellStart: 0.42,
  crownCoreStart: 0.13,
  coreDensityFloor: 0.1,
  voidRadiusMin: 0.38,
  voidRadiusMax: 0.64,
  clusterMinSeparation: 0.5,
  clusterShellBias: 0.48,
  leaderLengthRatio: 0.48,
};

/**
 * 形态槽路由表：索引 = shapeSlot（009.3 八槽语法复制——标准 / 卵圆窄 / 开张宽 /
 * 偏冠 / 低冠 / 高冠 / 疏松 / 丰满；方向名仅为标签，槽身份 = 多维取值整体组合；
 * 白蜡沿 Spec §6 幅度轴展开：冠幅比 0.7–1.0 两端（slot-1 卵圆窄端 / slot-2 圆头
 * 开张宽端）/ 偏冠端（slot-3）/ 干低端/高端（slot-4/5——中位分歧域两侧，Unknown
 * 域带内展开记档）/ 疏密端（slot-6/7——空隙 25–40% 带两端 + 翅果承载轴间接承载）。
 * slot-1…7 以 slot-0 锚点为底的差量展开定义——**结构计数类字段（trunk/levels
 * radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/
 * 长宽比域由展开继承逐位恒等**（皮面数恒等 24178 与 rng 消费次数恒等的结构性保证；
 * **翅果挂点 = 确定性账目零 rng**（fraxinusGeometry 常数与判据）——槽间恒等无消费
 * 口径问题）；**一回羽叶卡比例 0.36 全槽恒定**（冻结接口）；barkRelief 槽间恒等
 * （spread 继承）。morphSeed 路由见 assets/asset_tree_fraxinus.asset。
 */
export const FRAXINUS_SHAPE_PROFILES: BroadleafShapeProfile[] = [
  FRAXINUS_SLOT0_PROFILE,
  FRAXINUS_SLOT1_PROFILE,
  FRAXINUS_SLOT2_PROFILE,
  FRAXINUS_SLOT3_PROFILE,
  FRAXINUS_SLOT4_PROFILE,
  FRAXINUS_SLOT5_PROFILE,
  FRAXINUS_SLOT6_PROFILE,
  FRAXINUS_SLOT7_PROFILE,
];
