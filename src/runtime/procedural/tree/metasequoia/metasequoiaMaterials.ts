/**
 * runtime/procedural/tree/metasequoia/metasequoiaMaterials —— 水杉（Metasequoia
 * glyptostroboides，asset_tree_metasequoia）羽卡/树皮/针影深度材质（T012.2 Step 3b，
 * 针叶族 conifer 第二例材质实例——组织照抄雪松先例 cedrus/cedrusMaterials，形态语言
 * 按水杉改写：羽状小枝卡三帧 SDF + 两面温和色差 + 第 15 树皮语言 + preset 双卡）。
 *
 * 职责：复制雪松已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce 缺失
 * 即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 / <color_fragment>
 * 绝不触碰）+ T024 preset 材质变体先例（ginkgo 双卡材质工厂模式），物种配方按水杉自己
 * 的 Reference Spec 换装——Spec docs/research/metasequoia-reference.md **@1.0**（任务书
 * 锚点 1.0，开工前已校验一致，含 2026-09-29 主代理终审记档——通过 + 3 处修正）。消费
 * 冻结契约（只读）：conifer/coniferShapeProfile（定稿）+ metasequoia/
 * metasequoiaShapeProfile（8 槽数值面）——needleMaterial / bark / wind / cone·strobili
 * 色字段为本文件消费面；**数值按家族先例以字面量 + 同源注释消费（硬编码，与 profile
 * 侧无联动通道——cedrus ⑥ 同型家族缺口，记缺口候选⑤）**。
 *
 * 【与几何侧（3a）的材质侧契约（**合并阶段已按 3a 落盘实际编码对齐**——metasequoia
 *   Geometry 模块头冻结面）】
 *   - 三工厂签名：羽卡材质（level: ProceduralLevel = 'high', preset?: string）——
 *     **针叶族首个 preset 双卡工厂**（T024 / D44——落叶证据建卡，default + autumn；
 *     ginkgo 先例签名形态）；皮 / 深度 = (level)；每次调用全部 new（D17）。
 *   - 恰两组：组 0 = **树皮 + 器官卡**（球果/枯穗卡入皮组——metasequoiaGeometry
 *     模块头冻结接口 + emitConeCard/emitStrobilusCard 实编码：皮 sink 内发射；
 *     皮材质按 v 域三分支〔皮条片 v<1.0 / 球果 [1,2) / 枯穗 [2,3)〕，vs 雪松组 0
 *     实体球果网格）；组 1 = 羽卡（DoubleSide + alphaTest 0.5 裁切）。
 *   - **uv v 帧域三级（冻结接口，3a 实编码核对）**：羽状叶卡 v∈[0, 0.99] 根→尖帧
 *     （FEATHER_V_TIP 0.99 = 1.0 判别阈值安全边距；u ∈ {0,1} 空间横向 = 左列-中轴-
 *     右列）；球果卡 v∈[1.0, 1.95] 沿弯垂轴根→尖（u = **逐果色档 ∈ [0.02,0.98]**
 *     常量——3a 契约，非空间横向坐标！）；雄序枯穗卡 v∈[2.0, 2.95] 沿穗轴根→尖
 *     （u = 逐穗色档）；判别阈值 v=1.0 / 2.0。
 *   - **皮管域 v ∈ [0, 0.92] 逐管归一**（TUBE_V_MAX——3a 冻结防线：皮管与器官域
 *     恒隔离，主干底盖盘 v ≤ 0.9 同守）；树皮条片纵向频率按**逐管归一口径**定档
 *     （96 段频率/管程——雪松 72 同型先例口径，见皮配方节）。
 *   - attribute 契约（3a 实编码）：aLeafRand = 羽卡逐卡 ∈ [0,1) 非零种子；**器官卡
 *     （球果/枯穗）随皮组恒 0**（器官刚性——aBend 亦恒 0）；aBend = 羽卡沿枝弧长
 *     0→1 末级最大（根边 (0.10+0.42t)×lf → 尖边 +0.28lf）；aSeed = 实例个体相位
 *     （Runtime 逐实例 InstancedBufferAttribute——几何零 aSeed 顶点属性）。**深度
 *     守卫单通道**：羽卡按 aLeafRand 非零裁切；器官卡随皮组 aLeafRand=0 → 影
 *     实心方卡剪影（cm 级器官在影贴图 ~16cm/texel 下不可辨——记档取舍，asset
 *     模块头同口径），见深度材质节。
 *   - swatch 对齐（3a meta 已落盘）：default #8ab65a（= profile needleColorSun——
 *     阳端锚定 ramp，暴露度 1.0 处即此色）✓ 对齐；autumn **#a55d2c**（3a swatch
 *     定值 = 锈橙 0xc07632 × 红褐 0x8b4526 中值——本文件构造色同值，CROWN_PRESETS
 *     冠卡行三处同源）。
 *
 * 【羽状小枝卡 SDF——针叶形态第二语言（本任务核心新路径，限定文件内最小扩展）】
 *   家族前例：雪松莲座簇卡 = 极坐标扇区窗列放射（离散放射重复）；阔叶 13 例 = 单叶
 *   连续轮廓 + 边缘扰动。水杉「叶」单位 = **脱落性侧生小枝系统**（FoC "Leaves
 *   deciduous together with lateral branchlet as a unit" Verified [1][2]）——结构信息
 *   是「中轴 + 两列对生条形叶羽列」的**平行窗列 + 逐对变奏**。新路径 = **对生羽列
 *   窗列法**（vs 雪松的轴改径向、vs 栾树两级窗列的轴向折叠）：
 *   ① 对生对坐标 s = v × N（N = 对生对数 = 叶元素数/2——22/14/8 元素 → 11/7/4 对；
 *      LOD 降档 = 叶元素递减派生归 3b，冻结单）；
 *   ② 逐对 hash（k 与 rand 的 inline sin-hash）→ 挂点竖向抖动 ±12% 带宽 + 叶角
 *      抖动（52° ± 6.3°——Spec「与小枝轴 45–60°」Verified [2] 带内）+ 逐叶长
 *      0.80–1.16 长短不规则交替（FoC "longer and shorter leaves alternating
 *      irregularly" Verified [2]）+ 逐叶半宽 0.030–0.037（条形叶 1.2–2mm 卡映射）；
 *   ③ 叶体 = **胶囊 SDF**（sqrt 距离）——先端钝圆（"obtuse" FRPS/FoC 先端钝圆或具
 *      透明小尖 Verified [1][2]——圆头胶囊表达，vs 雪松针形向尖收窄 55%）；
 *   ④ 卵状椭圆轮廓包络 pow(sin(π·yc), 0.6)（真羽 3–7 × 1.5–4 cm 卵状椭圆 Verified
 *      [1][2]——中部最宽、两端圆收；v≈0.9 处叶长仍 ≈49% → 先端钝圆读向）；
 *   ⑤ 中轴 = 基部 0.020 → 尖部 0.008 渐细条（小枝轴）——近连续不断裂；
 *   ⑥ 镜像对称求值 xA = |x|（对生成对主律——左右列一次求值双列覆盖）。
 *   全 ALU 零 facVnoise（窗列/抖动 hash 全 inline sin-hash）——深度材质不挂噪声库的
 *   前提；坡宽 0.02（羽列细结构口径——alphaToCoverage 承担 AA）。
 *   **器官帧（3a u 契约适配——色层归皮材质）**：u = 逐果/逐穗色档常量（非空间横向
 *   坐标）→ 轮廓为 **v 埧圆端带**（沿轴向两端圆收的 AA 肩——卡幅已由几何按器官尺寸
 *   + 15% 边距定幅〔CONE_CARD_SCALE 1.15 / 穗宽比 0.3〕，交叉双卡承载球体/细穗读向；
 *   横向盘形裁切与「4 列」盾鳞列纹在 u 色档契约下**不可表达**——弱化记档，缺口
 *   候选②）；器官色层 + 轮廓裁切在**组 0 皮材质** v 域三分支内（3a 冻结：器官卡
 *   入皮组——aLeafRand 恒 0，变奏源 = vUv.x 色档），SDF 与羽表面/深度共享同一
 *   生成器（单一来源）。皮材质因此开 alphaTest 0.5 + alphaToCoverage（皮域 alpha
 *   恒 1 实心不受裁）+ DoubleSide（器官单面卡交叉双卡的整向读向——背面剔除会留
 *   盲区角；皮管实心闭合由深度测试淘汰背面，微 overdraw 记档）。
 *   三帧同函数同签名（表面/深度同源取用——单一来源经生成器保证，SDF 随档变体 =
 *   羽列对数 11/7/4，器官帧三档同体）。
 *
 * 羽卡帧（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - **亮黄绿基色（身份）**：#8ab65a = needleColorSun（Spec §5.1 上面「bluish green
 *     or yellowish green」Verified [2] + 主语境 9 月末亮黄绿 s04 Pisa 2024-09-30
 *     Observed；**阳端锚定**——暴露度 1.0 处 = 此色，vs 雪松构造中点式：落叶双卡
 *     沿用阔叶「基色 = swatch」惯例〔ginkgo 0x8ab45d 同型〕）。
 *   - **受光色差 ramp（同源继承——冠层暴露度阳/荫 mix）**：冠基 8.0m =
 *     trunkHeightRatio 0.40 × 20 锚 + 6m 渐入带 + 逐卡 ±0.12 抖动破纯竖向梯度；
 *     荫端 = needleColorShade/Sun sRGB 比值 × 0.65 观感软化 → ×(0.708, 0.743,
 *     0.783)（阳端 ×(1,1,1)——基色即阳端）。
 *   - **两面温和色差（族内差异轴——判定 7）**：needleFaceContrast 0.22 上深下浅
 *     （Spec §5.1 判定①「两面色差存在、温和」："paler abaxially" Verified [2] + s02/
 *     s04 近距单一黄绿观感 Observed）：背面提亮端点 = 1 + 0.22 × (0.50, 0.64,
 *     0.27) → ×(1.110, 1.141, 1.059)（gl_FrontFacing 双面判定——**vs 雪松无两面差
 *     的反向分化**；卡随机滚转 → 中距单色读向、特写档微差；两面糙度同值）。
 *   - **叶龄梯度 needleJuvenility 0.15**（域内变体非季相卡——判定 7 注）：7% 卡
 *     （0.15 × 新梢少数相 0.45）幼叶淡绿 ×(1.12, 1.14, 1.06)——aLeafRand 统计近似，
 *     逐卡整卡表达（当年生小枝淡绿读向）。
 *   - 逐卡变奏 aLeafRand：色相两端冷绿↔暖黄绿（通道摆幅 ≤15% 纪律）+ 明度 ±8%
 *     （去相关取样）。
 *   - 中频簇团斑块（High）：密连续锥冠内簇聚尺度 ≈0.83m（频率 1.2——s01/s03 密冠
 *     Observed 读向）。
 *   - 糙度 0.70（软条形叶薄软哑光——family 链：樟 0.50 革质亮 < 雪松 0.66 角质 <
 *     ginkgo 0.68 薄纸质 < **水杉 0.70 软条形**；工程设定）；两面糙度同值。
 *   - **背光透射（细质地软叶·试探值 0.46）**：家族链 夏栎 0.65 > **水杉 0.46** >
 *     雪松 0.38 > 银杏 0.34——条形叶 flat/soft Verified [1][2]（薄软落叶叶背光本体
 *     透光强于角质硬针）；但条形 1.2–2mm 窄叶透光面小于宽薄阔叶 → 不取夏栎级。
 *     透射色 (0.72, 0.94, 0.38) 亮黄绿向（亮黄绿冠透光读向）；羽卡域门控（器官卡
 *     不透光）。**Step 4 校准回路开放**（判定 8 家族值域链带试探定档）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent）；
 *     零贴图零 DataTexture（D13）。
 *   - 白粉 needleGlaucousBloom 不消费（profile 占位 0——水杉无白粉读向，气孔带
 *     4–8 条仅下面 Verified [1] 不承色）。
 *
 * 【preset 双卡（T024 / D44——冠变干不变）】createMetasequoiaNeedleMaterial 可选
 *   preset 参（导出签名扩展 = 只追加可选参）：preset = 材质基调变体，只改羽卡基调
 *   构造色（METASEQUOIA_NEEDLE_PRESETS 模块私有表——default 行 = 现行数值单一定义
 *   源，缺省路径经表消费保证「default = 现行」由结构成立；autumn 行 = 锈橙-红褐
 *   #a55d2c = 3a meta swatch 同值（锈橙 0xc07632 × 红褐 0x8b4526 中值），证据链
 *   与数值推导见表注释）；皮/深度/风动/SDF/变奏域/透射色零改动。
 *   **program 不增红线（D44 #3）**：default 与 autumn 共享同一 customProgramCacheKey
 *   ⇒ GLSL 逐位同源——hue/luma 两端、两面差端点、透射色 (0.72, 0.94, 0.38)、峰值
 *   0.46 字面量跨卡冻结，秋相差异全部由构造色（uniform 通道）承载。未知卡 id 回退
 *   default（值域校验归 Renderer resolvePoolKey 单一 choke point）。取舍记档：秋卡
 *   球果维持绿近熟表征（器官色为 GLSL 字面量，分叉即 +1 program）；「残绿」以变奏
 *   冷端复合弱近似（hue 端点被程序红线冻结——ginkgo 同型取舍）；秋相透射偏金的
 *   解锁归后续统一决策。
 *
 * 皮（组 0）配方——**第 15 语言：纵长条片-纤维剥落**（判定 6；vs 雪松第 14 鳞状
 *   方块片——同科两语言轴；vs 阔叶 14 语言的纵裂脊沟族/平滑/剥落斑驳系）：
 *   - 主调 #7a5138 红褐-桂皮棕（barkBaseColor——s08 Observed 红褐/桂皮棕基调 +
 *     FoC "dark reddish brown" Verified [2]）。
 *   - 条片网格：周向 32 条片列 × 纵向 **96 段频率/管程**（v ∈ [0, 0.92] 逐管归一
 *     契约——主干全弧 ≈20m / 0.92×96 ≈ 88 段 → 段长 ≈0.23m ⊂ barkPlateMin/Span
 *     0.12–0.22m 近真域上缘；雪松 72 段/管程同型口径）+ 低频游走 warp（「不规则」+
 *     长纤维条纵裂）+ 逐条片/逐段 hash + 纵向段相位逐列错开（断口交错）。uv 契约
 *     （3a 冻结）：u = 环绕一周、v = **逐管归一 [0, 0.92]**（全弧长压缩——末级
 *     细管条段相应细化，亚像素噪点读向记档同雪松）；条片宽 ≈4cm @干周 ≈1.3m（32
 *     列）× 段长 ≈0.23m → **长宽比 4–6:1**（长纤维条读向——主干近真推导，枝管
 *     由归一自然缩尺）；**3c 出图面校准回路开放**。
 *   - 脊:沟 2–3:1（s08 Observed）：沟半宽 = 0.08 + 0.09 × barkGrooveDepth 0.68 =
 *     0.141 → 脊/沟 ≈ 2.5:1（vs 雪松浅-中窄沟）+ **深索状陡壁剖面**（深端——过渡带
 *     ±0.035 急变）。
 *   - **三调色**（s08 Observed：脊顶风化灰褐 / 脊侧中褐 / 沟底橙褐）：脊顶 =
 *     barkPlateColor 0x8f7a62 比值 × 0.70 软化 → ×(1.120, 1.354, 1.525)（脊心带
 *     de>0.26–0.40 渐入）；脊侧 = 基色 ×1.0；沟 = barkGrooveColor 0x452e1e 比值 ×
 *     0.90 软化 → ×(0.609, 0.611, 0.582)。
 *   - **长纤维条翘边**：条片缘区（de<0.02–0.10）高频纵向锯齿游走（缘区横向微扰
 *     ±0.05——翘边细须）+ 缘区微暗 ×0.88（翘边投影读向）。
 *   - 横向断口沟（条片分段剥落）：细于纵沟（半宽 0.025–0.065）×0.82 暗化。
 *   - 逐段深浅 hash（0.92 + 0.16×hash——剥落代际明暗）。
 *   - **幼淡橙褐→老暗红褐株内梯度**（FoC "pale orange-brown … finally dark
 *     reddish brown" Verified [2]）：上部幼龄域（9–14m 门）淡橙褐 ×(1.14, 1.05,
 *     0.86)；一年生小枝带（高位 × 小弧长双门控）淡红绿转褐灰 ×(1.12, 1.08, 0.98)
 *     （"pinkish green or pale purple in 1st year" FoC Verified [1] 淡端）。
 *   - 局部地衣灰绿斑（High——s08 Observed 弱表达：低频域门 ×(0.92, 0.98, 0.88)）。
 *   - 干基暗化弱档（家族惯例 ×0.35）。
 *   - 微起伏归几何层（契约记档——几何侧树皮轮廓层未进契约，同雪松）。
 *
 * 器官卡域（皮材质 v 域三分支——3a 冻结：器官卡入组 0，koelreuteria 花果同型 +
 *   雪松球果域先例的卡化变体；变奏源 = vUv.x 逐果/逐穗色档，aLeafRand 恒 0 不可用）：
 *   - 球果卡 v∈[1,2)：绿近熟 coneColorMature 0x55793f sRGB→线性 (0.091, 0.191,
 *     0.050)（主语境 9–10 月 = 绿色近成熟体——当年 10–11 月熟 Spec §5.3 Verified
 *     [1][2] + s04 Observed 绿幼果带柄）× (0.88 + 0.24×色档) ±12% 变奏；
 *     种鳞行带横沟纹（v 域 5 行 × 横沟 ×0.28 暗线 + 球缘收边微暗 ×0.18——s06
 *     Observed 盾面横沟「嘟唇」纹、种鳞 16–24 Verified [1]；「4 列」周向列纹需
 *     横向坐标，u 色档契约下不可表达——弱化记档缺口候选②）；
 *   - 枯穗卡域（v∈[2,3)）：枯褐 strobilusColor 0x9a7f4d 线性 (0.323, 0.212,
 *     0.074) × (0.88 + 0.24×色档) ±12% + 散生孢子囊痕（沿轴格点暗点 ×0.22——
 *     s04 Observed 9-30 残留上年雄花序枯穗 3–5cm 下垂，default 卡近景身份；穗轴
 *     中线同不可表达记档）。
 *   - 两域轮廓 = 三帧生成器 v 埧圆端带（单一来源——皮表面/羽表面/深度同串）；三档
 *     同体（ALU 成本可忽略——cedrus 球果域三档同体先例；Low 档几何省略器官 →
 *     分支死代码无害）。
 *
 * 风动（**两成分**——判定 8 + Spec §风动读向 Inferred；**顶梢成分分支不进本
 *   材质**——leader 通直无点头，族内可选·雪松消费位）：
 *   - 成分① 整冠低频小幅摆：0.32Hz（windTierFrequency）/ 幅 0.018m 顶——密尖塔冠 +
 *     通直骨干；高度权重² × 1/20 锚。
 *   - 成分② 末级羽枝高频细颤（**主成分**）：2.6Hz（windFringeFrequency）/ 幅 0.055m
 *     （aBend 权重沿枝弧长末级最大——皮组恒 0 免颤）；family 快颤链 9–23 rad/s
 *     内带（16.34 rad/s）；相位 = hash(aSeed + aLeafRand)——个体 + 逐卡双相位差。
 *   - **树高锚 20m**（METASEQUOIA_TREE_HEIGHT_NOMINAL = slot-0 totalHeight 同源——
 *     锚同步轮 18–25m 级；1/20 = 0.05000 命名常量注入 + 测试锚断言）。两成分皮/羽
 *     同公式同相位（不撕裂穿帮）；hash 常数 107.317/84.931 与先例相位流（sway
 *     77.669–96.441 / flutter 49.337–81.447）去相关。
 *
 * 深度材质（羽影裁切，customDepthMaterial 契约通道——沿 SOP §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与
 *     羽表面材质共享同一 GLSL 生成器输出（同档同串——表面改羽形深度自动同步）。
 *   - **零噪声库注入**：三帧 SDF 全 ALU（inline sin-hash 非 facVnoise）。保护性
 *     约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 多材质网格守卫：组 0（皮 + 器官卡）以恒等 attribute（aLeafRand=0）走实心
 *     分支，防羽形 SDF 在圆柱 uv 域上误裁出洞（triadica 恒等 attribute 先例）；
 *     **器官卡（球果/枯穗）随皮组 aLeafRand 恒 0（3a 冻结）→ 影 = 实心方卡剪影**
 *     （vs 表面圆端带裁切略大——cm 级器官在影贴图 ~16cm/texel 下不可辨，记档
 *     取舍沿 asset 模块头「皮组 aLeafRand=0 实心守卫覆盖器官影」口径）。
 *   - 档位匹配：Mid = Mid SDF（7 对）/ Low = Low SDF（4 对）——表面/影档内一致
 *     （SDF 随档变体 = 羽列对数递减）。customProgramCacheKey 三档分键（9 键契约）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T012.2，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build）：
 *   - 羽 Mid：SDF 羽列对数 11→7（叶元素 22→14——几何簇卡数同步降归 3a 档间不变量）；
 *     去簇团噪声/糙度簇团项；受光色差/两面差/幼叶/透光/hue·luma 三档保留（颜色
 *     层次档间连续保留面）。
 *   - 羽 Low：SDF 4 对（8 元素）+ 去透光（远距逆光透射不可辨）/簇团；受光色差/
 *     两面差/hue·luma 保留；片元零噪声。
 *   - 皮 Mid：去地衣/翘边微暗（近景细节）；条片网格/三色剖面/断口/逐段深浅/株内
 *     梯度/小枝淡红绿/干基暗化保留；器官帧三档同体（Mid 几何双器官全量保留——
 *     身份信号）。
 *   - 皮 Low：再去逐段深浅/株内梯度/小枝淡红绿/干基暗化（低调项）；条片三色剖面 +
 *     断口沟保留（远距「红褐纵长条片」剪影身份）；1× vnoise（游走）；器官分支
 *     保留（Low 几何省略器官发射 → 死代码无害）。
 *   - 深度：Mid/Low = 各自档 SDF（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；metasequoia 前缀不与先例混
 *     缓存）：'metasequoia:needle' / ':mid' / ':low'；'metasequoia:bark' …；
 *     'metasequoia:needle-depth' …（9 键全异；叶/皮经 applyTreeFadeDither 追加
 *     '+dither'）。**preset 不进键**（program 不增红线——同键不同源 = 复用错程序
 *     的暴雷路径）。
 *   - 风动（METASEQUOIA_WIND 同一常量）三档同源不动——档间风相位一致是身份一致
 *     的一部分（D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 羽 High 片元 = 1× vnoise（簇团）= 3× + SDF（羽列窗列双 hash + 胶囊 sqrt）
 *     ≈ 4× + 受光/两面/幼叶/hue ≈ 2× ≈ **9×**（羽列 + sqrt 略重于雪松莲座 8×）；
 *   - 羽 Mid/Low = 0 噪声 + ALU ≈ 5× / 4.5×（SDF 对数降档）；
 *   - 皮 High 片元 = 2× vnoise（游走 + 地衣）= 6× + 条片网格/翘边 ALU ≈ 2× ≈
 *     **8×**；器官卡路径纯 ALU（圆端带 SDF + 行带/格点色层）≈ 2×——皮/器官帧
 *     v 域互斥执行（器官卡面数 = 4 果 + 4 穗的 minority，皮域成本占主）；
 *   - 皮 Mid/Low = 1× vnoise + 皮 ALU ≈ 5×（器官分支 Mid 有效 / Low 死代码）；
 *   - 深度片元 = SDF 纯 ALU ≈ 3.5×（三帧路由 + 羽列），**零噪声采样**；
 *   - 顶点 = 两次 sin（两成分）+ 一次法线乘，无循环。
 *
 * 契约缺口候选（归 T012 族级验收门；本文件零公共抽象扩展——羽列窗列/条片网格/
 *   器官卡域全部限定文件内）：
 *   ① 羽卡三帧 v 域（[0,1)/[1,2)/[2,3) 阈值 1.0/2.0）为材质侧定义的并行契约——
 *      需与 3a 几何侧实际编码合并阶段对齐冻结（cedrus ③ 同型风险）；
 *   ② 羽状小枝「对生羽列窗列」SDF：本文件内实现（针叶族第二个簇卡语言——首个
 *      羽卡）；族内第三例（落叶松/落羽杉羽卡）出现后评估提炼家族公共 SDF 模式；
 *   ③ 器官卡（球果/枯穗）aLeafRand/aBend **已落定恒 0**（3a 冻结：随皮组实心
 *      刚性）→ 深度影 = 实心方卡剪影、表面变奏走 vUv.x 色档（3a posHash 编码）；
 *      「4 列」盾鳞列纹/穗轴中线在 u 色档契约下不可表达——弱化已记档（②同源），
 *      若后续需要横向结构 = 几何侧 u 契约变更（跨域，归主代理协调）；
 *   ④ 羽列分型（叶角/叶长/叶宽）与受光/两面差/幼叶/变奏共用 aLeafRand 单属性
 *      统计近似（多通道复用同一 rand——分型间相关性无法表达；家族共有缺口）；
 *   ⑤ 树高锚 20/冠基 8.0/渐入带 6.0/皮网格 uv 频率（32/5.5）材质侧硬编码——与
 *      profile 侧无联动通道（cedrus ⑥ 同型家族缺口；3c 出图面校准回路）；
 *   ⑥ 秋卡取舍：球果绿近熟表征跨卡冻结（program 红线）+ 残绿弱近似 + 透射偏金
 *      解锁——归后续统一决策（ginkgo 同型）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；
 *   零贴图/零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通
 *   Mesh 无该属性，WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；
 *   与雪松/银杏先例的通用段（风动公式等）为复制改造非 import（资产私有，跨资产不
 *   耦合——organization.md 边界）；**真实编译验证（console 零错误零警告）归 3c
 *   合并后执行**——本交付为可通过编译的同构 GLSL（X4000 纪律：单返回/零 out 参/
 *   全路径初始化）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import { DEFAULT_COLOR_PRESET_ID } from '../../../../domain/assets'; // 默认卡 id 单一真相源（值导入——ginkgo 先例）
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/**
 * 树高锚（T012.2 判定 8「树高锚换 18–25m 同步轮」：slot-0 totalHeight 20 同源——
 * profile 冻结值；材质-几何侧无联动通道记缺口候选⑤）。1/20 = 0.05000 命名常量
 * 注入风动 GLSL + 测试锚断言（cedrus CEDRUS_TREE_HEIGHT_NOMINAL 先例）。
 */
export const METASEQUOIA_TREE_HEIGHT_NOMINAL = 20;

/** 风动高度权重 = 1/树高锚（0.05000——注入 GLSL 字面量；5 位小数 = 家族同步轮精度口径） */
const METASEQUOIA_WIND_H_SCALE = (1.0 / METASEQUOIA_TREE_HEIGHT_NOMINAL).toFixed(5);

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿家族范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`metasequoia 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

/**
 * 羽卡 SDF 叶元素数分档（profile rosetteNeedles = 22 为 High 基准——契约注释「LOD
 * 降档 = 该值递减派生归 3b」；冻结单 22/14/8）：SDF 内以**对生对数** N = 元素/2
 *（11/7/4）为窗列频率（对生成对主律——左右列镜像一次求值）。
 */
const METASEQUOIA_FEATHER_LEAVES: Record<ProceduralLevel, number> = { high: 22, mid: 14, low: 8 };

// ── 风动 GLSL（羽/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：**两成分**（判定 8）——①整冠低频小幅摆（0.32Hz 密尖塔冠 + 通直骨干）
 * + ②末级羽枝高频细颤（2.6Hz 主成分，aBend 权重沿枝弧长末级最大，组 0 恒 0 免颤）。
 * **无顶梢成分**（leader 通直无点头——族内可选·雪松消费位，判定 4/8）。频率 =
 * windTier/FringeFrequency (Hz) × 2π（profile 契约「频率 Hz（uTime 驱动）」）；幅度
 * 为米（0.018/0.055——windTier/FringeAmplitude）。hash 常数 107.317/84.931 与先例
 * 相位流去相关；树高锚 20m（×0.05000——slot-0 totalHeight 同源，锚同步轮）。
 */
const METASEQUOIA_WIND = /* glsl */ `
// metasequoia wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float msqWindPhase = fract(sin(aSeed * 107.317 + 5.7) * 43758.5453);
float msqWindH = clamp(position.y * ${METASEQUOIA_WIND_H_SCALE}, 0.0, 1.0); // /20m 树高锚（slot-0 totalHeight 同源——METASEQUOIA_TREE_HEIGHT_NOMINAL；锚同步轮 18–25m 级）
// 成分① 整冠低频小幅摆：0.32Hz（2.0106 rad/s）× 幅 0.018m——密尖塔冠 + 通直骨干（Spec §风动读向 Inferred）
float msqTier = msqWindH * msqWindH * 0.018 * sin(uTime * 2.0106 + msqWindPhase * 6.28318 + msqWindH * 1.2);
// 成分② 末级羽枝高频细颤（主成分）：2.6Hz（16.3363 rad/s——family 快颤链 9–23 内带）× 幅 0.055m；权重 = aBend（沿枝弧长末级最大——组 0 恒 0 免颤）
float msqFlutterPhase = fract(sin((aSeed + aLeafRand) * 84.931 + 7.9) * 43758.5453);
float msqFlutter = aBend * 0.055 * sin(uTime * 16.3363 + msqFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (msqTier + msqFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(msqTier) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * msqFlutter * 0.9; // 羽卡沿卡法线微扑（皮组 aBend=0 → 恒 0）
`;

/** 顶点声明（羽/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const METASEQUOIA_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 三帧卡 SDF（表面材质与深度材质共用——单一来源生成器，禁复制粘贴）────────────────

/**
 * 水杉三帧卡覆盖率生成器（uv v 帧域三级——派遣简报冻结接口 + 3a 实编码对齐；见模块
 * 头【羽状小枝卡 SDF】节）：
 * - 羽状叶卡 v∈[0,0.99]：对生羽列窗列法（N 对生对 = 叶元素/2 分档 11/7/4；镜像求值
 *   xA=|x| 双列一次覆盖）+ 中轴渐细条 + 逐对 hash（挂点抖动/叶角 45–60° 带内/
 *   长短不规则交替/半宽变奏）+ 胶囊叶体（先端钝圆）+ 卵状椭圆包络（3–7 × 1.5–4 cm
 *   Verified [1][2] 的卡投影轮廓）；
 * - 球果卡 v∈[1.0,1.95]：v 域圆端带（u = 逐果色档常量——3a 契约下无横向坐标；
 *   卡幅 = 果径 × 1.15 边距已按几何定幅，交叉双卡承载近球体读向）；
 * - 雄序枯穗卡 v∈[2.0,2.95]：v 域圆端带（窄卡宽比 0.3 已按穗形定幅）。
 * **零 facVnoise 引用是深度材质不挂噪声库的前提（引入即深度编译暴雷——保护性
 * 约束；窗列/抖动全 inline sin-hash ALU）**；坡宽 0.02（羽列细结构口径——
 * alphaToCoverage AA；器官帧 0.08 cm 级器官的 AA 肩）；单返回 + 声明处初始化
 * （X4000 纪律）。
 */
function metasequoiaCardSdfSource(level: ProceduralLevel): string {
  const pairs = (METASEQUOIA_FEATHER_LEAVES[level] / 2).toFixed(1); // High 11.0 / Mid 7.0 / Low 4.0（22/14/8 元素 → 对生对）
  const pairsMax = (METASEQUOIA_FEATHER_LEAVES[level] / 2 - 1).toFixed(1); // 候选带上限（High 10.0 / Mid 6.0 / Low 3.0）
  return /* glsl */ `
float msqCardAlpha(vec2 msqUv, float msqRand) {
  float msqA = 1.0;
  if (msqUv.y < 1.0) {
    // 羽状叶卡（v∈[0,1) 根→尖——u = 左列-中轴-右列）：对生羽列 + 中轴（N = ${pairs} 对/侧，分档派生）
    // 【Step 4 缺陷修正（2026-09-29 视觉验收——叶卡运行时不可见）：窗列求值缺陷。原实现像素
    //  仅对「所属带」的单对叶求值，而长斜叶的 v 跨度 = 0.63×cos52°×N ≈ 5 带——~80% 叶长落在
    //  邻带不被求值 → 每卡覆盖 11.3%（逐对残桩 chevron）而非羽列设计 ≈55% → 冠部叶体积运行时
    //  近不可见（M25 绿 0.1% vs 雪松 33% 量级；3c 静态断言不覆盖数值行为故未拦截）。
    //  修正 = 最近叶投影定位 + 三候选求并：k0 = floor((y − x·cot52°)×N)（叶法向投影的最近挂点
    //  带），对 k0−1/k0/k0+1 三对叶求胶囊并集。充分性：叶角抖动 ±0.11 rad × 最长叶 0.73 的
    //  法向漂移 ≤ 0.88 带 < 2 → 三候选全覆盖（机制数值锚进单测）。vs 全邻带扫描（±5 带 ≈
    //  11 evals）成本 3 evals 与雪松莲座同量级（莲座为角向扇区窗列——针不出扇区无此缺陷；
    //  轴向窗列 + 长叶跨带是羽列语言的特有约束）。深度材质同串自动同步（单一来源）。】
    vec2 msqP = vec2(msqUv.x - 0.5, msqUv.y);
    float msqXa = abs(msqP.x); // 镜像求值——对生成对左右列一次覆盖（MoBot 对生对 Verified [3]）
    float msqBest = -1.0; // 三候选胶囊 SDF 并集（声明处初始化——X4000 纪律）
    float msqK0 = floor(clamp(msqP.y - msqXa * 0.78221, 0.0, 0.999) * ${pairs}); // 最近叶投影带（cot52° = cos0.907/sin0.907——长斜叶的正确最近带；0.999 带上限守卫沿旧式）
    for (int msqC = 0; msqC < 3; msqC++) {
      float msqK = clamp(msqK0 + float(msqC) - 1.0, 0.0, ${pairsMax}); // 三候选 k0−1/k0/k0+1（端带 clamp 重复求值无害）
      float msqH = fract(sin(msqK * 12.9898 + msqRand * 78.233) * 43758.5453); // 逐对 hash（inline sin-hash）
      float msqYc = (msqK + 0.5 + (msqH - 0.5) * 0.24) / ${pairs}; // 对生挂点（带心 + 竖向抖动 ±12%）
      vec2 msqD = vec2(msqXa, msqP.y - msqYc);
      float msqTh = 0.907 + (fract(msqH * 7.31) - 0.5) * 0.22; // 叶角 52° ± 6.3°（弧度——Spec「与小枝轴 45–60°」Verified [2] 带内）
      float msqT = msqD.x * sin(msqTh) + msqD.y * cos(msqTh); // 沿叶距离（自附着点向叶尖）
      float msqLat = abs(msqD.y * sin(msqTh) - msqD.x * cos(msqTh)); // 距叶轴横向距离
      float msqEnv = pow(sin(3.14159 * clamp(msqYc, 0.02, 0.98)), 0.6); // 卵状椭圆包络（中部最宽、两端圆收——先端钝圆读向）
      float msqLen = 0.63 * msqEnv * (0.80 + 0.36 * fract(msqH * 5.17)); // 逐叶长（长短叶不规则交替 FoC Verified [2] × 包络）
      float msqTC = clamp(msqT, 0.0, msqLen);
      float msqW = 0.030 + 0.007 * fract(msqH * 3.17); // 逐叶半宽（条形叶 1.2–2mm 卡映射）
      msqBest = max(msqBest, msqW - sqrt(msqLat * msqLat + (msqT - msqTC) * (msqT - msqTC))); // 胶囊 SDF——先端钝圆（圆头端帽）；三候选求并
    }
    float msqRachis = mix(0.020, 0.008, clamp(msqP.y, 0.0, 1.0)) - msqXa; // 中轴渐细条（基部 0.020 → 尖部 0.008）
    msqA = clamp(max(msqBest, msqRachis) / 0.02 + 0.5, 0.0, 1.0); // 羽列 ∪ 中轴；坡宽 0.02
  } else if (msqUv.y < 2.0) {
    // 球果卡（v∈[1.0,1.95] 沿弯垂轴根→尖；u = 逐果色档常量——3a 契约下无横向坐标）：
    // v 域圆端带（两端圆收 AA 肩——卡幅 = 果径 × 1.15 边距已定幅，交叉双卡承载近球体读向；
    // 熟时 1.4–2.5 × 1.6–2.3 cm Verified [1][2]，横向盘形裁切不可表达——弱化记档缺口候选②）
    float msqCn = clamp((msqUv.y - 1.0) / 0.95, 0.0, 1.0); // 卡内轴向帧
    msqA = clamp((0.5 - abs(msqCn - 0.5)) / 0.08 + 0.5, 0.0, 1.0); // 圆端带（器官 AA 肩 0.08——cm 级器官口径）
  } else {
    // 雄序枯穗卡（v∈[2.0,2.95] 沿穗轴根→尖；u = 逐穗色档常量）：v 域圆端带
    //（窄卡宽比 0.3 已按穗形定幅——3–5cm 枯穗 s04 Observed 的细穗读向由几何幅承担）
    float msqSk = clamp((msqUv.y - 2.0) / 0.95, 0.0, 1.0); // 卡内轴向帧
    msqA = clamp((0.5 - abs(msqSk - 0.5)) / 0.08 + 0.5, 0.0, 1.0); // 圆端带（器官 AA 肩 0.08）
  }
  return msqA;
}
`;
}

// ── 羽卡帧片元配方（<map_fragment> 后注入的三帧分支之羽卡分支段）──────────────────

/**
 * 羽卡帧配方头（<map_fragment> 后注入——乘性调制 diffuseColor.rgb；alpha 在三帧分支
 * 前统一写入 diffuseColor.a）。分段拼装（沿先例体例）：High = HEAD + CLUMP +
 * MUL_HIGH；Mid/Low = HEAD + MUL_SIMPLE（去簇团噪声——乘子 0.94+0.12×msqClump
 * 均值化 = 1.0 消去，值噪声均值 0.5 精确保均）。**两面温和色差在位**（gl_FrontFacing
 * 背面提亮——vs 雪松无两面差的反向分化，判定 7 族内差异轴）。
 */
const METASEQUOIA_NEEDLE_HEAD = /* glsl */ `
// metasequoia:needle 羽卡帧 —— 受光色差（阳亮荫深）+ 两面温和色差 + 幼叶 + 逐卡变奏（<color_fragment> 不触碰）
// 受光色差 ramp（同源继承——冠层暴露度阳/荫 mix）：冠基 8.0m = trunkHeightRatio 0.40 × 20 锚 + 6m 渐入带 + 逐卡 ±0.12 抖动破纯竖向梯度
float msqExp = clamp((vTreePos.y - 8.0) / 6.0, 0.0, 1.0);
msqExp = clamp(msqExp + (fract(vLeafRand * 5.317 + 0.31) - 0.5) * 0.24, 0.0, 1.0);
vec3 msqLight = mix(vec3(0.708, 0.743, 0.783), vec3(1.0), msqExp); // 荫深绿 ↔ 阳亮黄绿（阳端 = swatch 基色锚定 ×1.0；荫端 = needleColorShade/Sun sRGB 比值 × 0.65 观感软化）
// 两面温和色差（needleFaceContrast 0.22——上深下浅，族内差异轴）：下面（背面）提亮微去饱和「paler abaxially」
// Spec §5.1 Verified [2]；卡随机滚转 → 中距单色读向、特写档微差（判定 7）——端点 = 1 + 0.22 × (0.50, 0.64, 0.27)
float msqFaceBack = 1.0 - float(gl_FrontFacing);
vec3 msqFaceMul = mix(vec3(1.0), vec3(1.110, 1.141, 1.059), msqFaceBack);
msqLight = mix(msqLight, msqLight * vec3(1.12, 1.14, 1.06), step(fract(vLeafRand * 6.913 + 0.37), 0.07)); // 幼叶淡绿（needleJuvenility 0.15 × 新梢少数相 0.45 ≈ 7% 卡——域内变体非季相卡）
// 逐卡身份（aLeafRand）：色相两端（冷绿 ↔ 暖黄绿——亮黄绿基调 Spec §5.1；通道摆幅 ≤15% 纪律）+ 明度 ±8%（去相关取样）
vec3 msqHue = mix(vec3(0.97, 1.00, 1.02), vec3(1.04, 1.03, 0.94), fract(vLeafRand * 5.917 + 0.27));
float msqLuma = 0.92 + 0.16 * fract(vLeafRand * 3.613 + 0.53);
`;

/** High 专属：中频簇团斑块（位置域 1× vnoise——Mid/Low 去采样；赋值域变量） */
const METASEQUOIA_NEEDLE_CLUMP = /* glsl */ `
// 冠内：中频簇团斑块（波长 ≈0.83m——密连续锥冠内簇聚读向 s01/s03 Observed；采样偏移与先例去相关）
msqClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.73, vTreePos.y - vTreePos.z * 0.61) * 1.2 + vec2(49.7, 31.3));
`;

/** High 专属：合成（簇团乘子——均值 0.5 精确保均；受光/两面差在 msqLight·msqFaceMul——三档保留面） */
const METASEQUOIA_NEEDLE_MUL_HIGH = /* glsl */ `
vec3 msqMul = msqHue * msqLuma * msqLight * msqFaceMul * (0.94 + 0.12 * msqClump); // 簇团乘子
diffuseColor.rgb *= msqMul;
`;

/** Mid/Low：合成（去簇团项——乘子均值化消去，值噪声均值 0.5 精确保均） */
const METASEQUOIA_NEEDLE_MUL_SIMPLE = /* glsl */ `
vec3 msqMul = msqHue * msqLuma * msqLight * msqFaceMul; // Mid/Low：簇团乘子均值化消去（0.94 + 0.12×0.5 = 1.0）
diffuseColor.rgb *= msqMul;
`;

/** 羽卡背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  细质地软叶·试探值 0.46：条形叶 flat/soft Verified [1][2]——家族链 夏栎 0.65 >
 *  水杉 0.46 > 雪松 0.38 > 银杏 0.34（薄软落叶叶高于角质硬针、窄条形 1.2–2mm 低于
 *  宽薄阔叶）；透射色亮黄绿 (0.72, 0.94, 0.38)；羽卡域门控（器官卡不透光）——
 *  Step 4 校准回路开放（判定 8 家族值域链带试探定档）。 */
const METASEQUOIA_NEEDLE_TRANSLUCENCY = /* glsl */ `
// metasequoia:needle —— 背光透射（细质地软叶·试探档 0.46）：视线与阳光反向时羽叶透亮黄绿
//（亮黄绿冠透光读向；羽卡域门控 step(vUv.y, 0.999)——球果/枯穗帧不透光）
#if NUM_DIR_LIGHTS > 0
  float msqBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float msqTransVar = 0.55 + 0.45 * fract(vLeafRand * 9.317 + 0.43); // 逐卡透光强度变奏
  outgoingLight += vec3(0.72, 0.94, 0.38) * directionalLights[0].color
    * pow(msqBack, 3.0) * msqTransVar * msqAlpha * step(vUv.y, 0.999) * 0.46;
#endif
`;

// ── 器官帧片元配方（皮材质 v 域三分支之球果/枯穗段——实色赋值非乘性；
//    alpha = 同一 SDF 生成器圆端带——aLeafRand 恒 0 传常数，变奏源 = vUv.x 色档）──────

/** 球果卡帧体（皮材质三分支之一，三档共用——绿近熟 + 盾鳞行带横沟纹 + 逐果色档 + 圆端带轮廓） */
const METASEQUOIA_CONE_BODY = /* glsl */ `
  // 球果卡帧（v∈[1,2) 冻结域——沿弯垂轴根→尖；u = 逐果色档 ∈ [0.02,0.98]〔3a posHash 契约〕）：
  // 绿近熟（主语境 9–10 月 = 绿色近成熟体，当年 10–11 月熟——Spec §5.3 Verified [1][2]
  // + s04 Observed 绿幼果带柄）+ 盾鳞横沟纹（v 域行带——种鳞 16–24 对生 4 列 Verified [1]
  // + s06 盾面横沟「嘟唇」纹 Observed；「4 列」周向列纹需横向空间坐标，u 色档契约下不可表达——弱化记档缺口候选②）
  float msqCs = clamp((vUv.y - 1.0) / 0.95, 0.0, 1.0); // 卡内轴向帧
  float msqRow = fract(msqCs * 5.0); // 种鳞行带（5 行——交叉双卡复合读向）
  float msqEdge = min(msqRow, 1.0 - msqRow);
  float msqConeGroove = 1.0 - smoothstep(0.06, 0.14, msqEdge); // 横沟纹暗线（嘟唇纹）
  vec3 msqCone = vec3(0.091, 0.191, 0.050) * (0.88 + 0.24 * fract(vUv.x * 7.313 + 0.29)); // coneColorMature 0x55793f sRGB→线性 ±12%（u = 逐果色档——aLeafRand 恒 0 不可用）
  msqCone *= 1.0 - msqConeGroove * 0.28; // 种鳞沟纹暗线
  msqCone *= 1.0 - smoothstep(0.32, 0.50, abs(msqCs - 0.5)) * 0.18; // 两端收边暗（近球体明暗读向）
  diffuseColor.rgb = msqCone;
  msqAlpha = msqCardAlpha(vUv, 0.0); // 轮廓 = v 埧圆端带（三帧生成器单一来源——皮表面/羽表面/深度同串；器官帧不消费 rand）
`;

/** 雄序枯穗卡帧体（皮材质三分支之一，三档共用——枯褐 + 散生孢子囊痕 + 逐穗色档 + 圆端带轮廓） */
const METASEQUOIA_STROBILUS_BODY = /* glsl */ `
  // 雄序枯穗卡帧（v∈[2,3) 冻结域——沿穗轴根→尖；u = 逐穗色档〔3a posHash 契约〕）：枯褐 +
  // 散生孢子囊痕（v 域高频散点带——窄卡满幅读向；穗轴中线同 u 契约下不可表达记档）——
  // s04 Observed 9-30 残留上年雄花序枯穗 3–5cm 下垂（default 卡近景身份细节）
  float msqSk = clamp((vUv.y - 2.0) / 0.95, 0.0, 1.0); // 卡内轴向帧
  float msqCellId = floor(msqSk * 15.0 + vUv.x * 3.0); // 沿轴散点格（高频带 + 逐穗色档偏移去克隆）
  float msqSh = fract(sin(msqCellId * 91.7 + vUv.x * 47.3) * 43758.5453); // 逐痕 hash（inline sin-hash）
  float msqCell = fract(msqSk * 15.0 + vUv.x * 3.0);
  float msqScar = step(msqSh, 0.62) * (1.0 - smoothstep(0.35, 0.65, msqCell)); // 散生孢子囊痕（暗点带——62% 痕位）
  vec3 msqStro = vec3(0.323, 0.212, 0.074) * (0.88 + 0.24 * fract(vUv.x * 5.713 + 0.61)); // strobilusColor 0x9a7f4d sRGB→线性 ±12%（u = 逐穗色档）
  msqStro *= 1.0 - msqScar * 0.22; // 疤痕暗点
  diffuseColor.rgb = msqStro;
  msqAlpha = msqCardAlpha(vUv, 0.0); // 轮廓 = v 埧圆端带（单一来源同上）
`;

// ── 组 0（皮 + 器官卡）配方主体（<map_fragment> 后注入——工厂 body 内 v 域三分支：
//    皮条片 v<1.0〔本节〕/ 球果 [1,2) / 枯穗 [2,3)〔上节器官帧体〕）─────────────────

/**
 * 皮域：纵长条片-纤维剥落核心（三档共用——Low 保留面的唯一采样：低频游走 warp；
 * 皮域恒 alpha=1 实心——alphaTest 仅为器官卡裁切而开）。
 * 域变量赋值段（msqPlateau/msqSegH/msqCross/msqSmoothUp/msqTwig 在此赋值、合成段
 * 消费——跨 include 预声明见工厂内 domainVars）。
 */
const METASEQUOIA_BARK_STRIPS = /* glsl */ `
// 纵长条片-纤维剥落（第 15 语言，判定 6——vs 雪松第 14 鳞状方块片）：周向 32 条片列 × 纵向 96 段频率/管程
//（v ∈ [0,0.92] 逐管归一契约——主干全弧 ≈20m → ≈88 段、段长 ≈0.23m ⊂ barkPlateMin/Span 0.12–0.22m 近真域上缘；
// 雪松 72 段/管程同型口径，末级细管条段细化亚像素记档）
// + 低频游走 warp（「不规则」+ 长纤维条纵裂）+ 逐条片/逐段 hash + 横向断口沟（条片分段剥落）
// uv 契约（3a 冻结）：u = 环绕一周、v = 逐管归一 [0, 0.92]（TUBE_V_MAX——皮管与器官域恒隔离防线）；3c 校准回路开放
float msqBarkWarp = facVnoise(vec2(vUv.x * 2.2, vUv.y * 0.9) + vec2(67.3, 33.7)); // 条片列低频游走（缓歪防整齐阵列）
vec2 msqBg = vec2(vUv.x * 32.0 + msqBarkWarp * 1.6, vUv.y * 96.0 + msqBarkWarp * 0.6);
float msqStripId = floor(msqBg.x);
float msqStripH = fract(sin(msqStripId * 127.1 + 31.7) * 43758.5453); // 逐条片 hash（inline sin-hash）
msqBg.y += msqStripH * 7.31; // 纵向段相位逐列错开（条片断口交错——「不规则」剥落）
float msqSegId = floor(msqBg.y);
msqSegH = fract(sin(msqStripId * 311.7 + msqSegId * 74.7 + 17.3) * 43758.5453); // 逐段 hash（赋值域变量）
float msqF0 = fract(msqBg.x);
float msqDe0 = min(msqF0, 1.0 - msqF0); // 距条片缘初距（0 缘 → 0.5 心）
float msqEdgeZone = 1.0 - smoothstep(0.02, 0.10, msqDe0); // 翘边缘区（长纤维条）
float msqFray = msqEdgeZone * sin(msqBg.y * 47.0 + msqStripH * 6.28318) * 0.05; // 长纤维条翘边（缘区高频细须——横向微扰）
float msqFx = fract(msqBg.x + msqFray);
float msqDe = min(msqFx, 1.0 - msqFx); // 翘边扰动后的距缘距离
float msqGh = 0.08 + 0.09 * 0.68; // 沟半宽 0.141 → 脊:沟 ≈ 2.5:1（s08 Observed 2–3:1 深索；barkGrooveDepth 0.68 深端）
msqPlateau = 1.0 - smoothstep(msqGh - 0.035, msqGh + 0.035, msqDe); // 深索状陡壁剖面（±0.035 急变——深端；赋值域变量）
msqCross = 1.0 - smoothstep(0.025, 0.065, min(fract(msqBg.y), 1.0 - fract(msqBg.y))); // 横向断口沟（细于纵沟；赋值域变量）
msqSmoothUp = smoothstep(9.0, 14.0, vTreePos.y); // 上部幼龄域门（幼淡橙褐→老暗红褐株内梯度 FoC Verified [2]；赋值域变量）
msqTwig = smoothstep(12.0, 15.0, vTreePos.y) * (1.0 - smoothstep(0.5, 1.6, vUv.y)); // 一年生小枝带 = 高位 × 小弧长双门控（赋值域变量）
`;

/** High 专属：局部地衣灰绿斑（1× vnoise——Mid/Low 去采样；s08 Observed 弱表达） */
const METASEQUOIA_BARK_LICHEN = /* glsl */ `
float msqLichenDomain = facVnoise(vec2(vUv.x * 3.1, vUv.y * 1.4) + vec2(41.9, 19.3)); // 低频域门
msqLichen = smoothstep(0.66, 0.78, msqLichenDomain); // 地衣斑域（局部灰绿——弱表达；赋值域变量）
`;

/** High：合成（三色剖面 + 逐段深浅 + 翘边微暗 + 断口 + 地衣 + 株内梯度 + 小枝 + 干基暗化） */
const METASEQUOIA_BARK_MUL = /* glsl */ `
vec3 msqRidge = mix(vec3(1.0), vec3(1.120, 1.354, 1.525), smoothstep(0.26, 0.40, msqDe)); // 脊侧中褐（基色）→ 脊顶风化灰褐（barkPlateColor 0x8f7a62 比值 × 0.70 软化）
vec3 msqBarkMul = mix(vec3(0.609, 0.611, 0.582), msqRidge, msqPlateau); // 沟底橙褐深端（barkGrooveColor 0x452e1e 比值 × 0.90 软化）↔ 脊（s08 三调：脊顶灰褐/脊侧中褐/沟底橙褐）
msqBarkMul *= 0.92 + 0.16 * msqSegH; // 逐段深浅（剥落代际明暗——条片段间差）
msqBarkMul *= 1.0 - msqEdgeZone * 0.12; // 翘边缘区微暗（长纤维条翘边投影）
msqBarkMul *= 1.0 - msqCross * 0.18; // 横向断口沟
msqBarkMul = mix(msqBarkMul, msqBarkMul * vec3(0.92, 0.98, 0.88), msqLichen * 0.45); // 局部地衣灰绿斑（s08 Observed——弱表达）
msqBarkMul = mix(msqBarkMul, msqBarkMul * vec3(1.14, 1.05, 0.86), msqSmoothUp * 0.60); // 上部幼龄淡橙褐（「幼树皮淡橙褐」FoC Verified [2] 株内梯度）
msqBarkMul = mix(msqBarkMul, msqBarkMul * vec3(1.12, 1.08, 0.98), msqTwig * 0.65); // 一年生小枝淡红绿转褐灰（"pinkish green … in 1st year" FoC Verified [1] 淡端）
msqBarkMul *= mix(vec3(1.0), vec3(0.93, 0.92, 0.93), (1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35); // 干基暗化弱档（家族惯例）
diffuseColor.rgb *= msqBarkMul;
`;

/** Mid：合成（去地衣/翘边微暗——近景细节；三色剖面/段深浅/断口/株内梯度/小枝/干基保留） */
const METASEQUOIA_BARK_MUL_MID = /* glsl */ `
vec3 msqRidge = mix(vec3(1.0), vec3(1.120, 1.354, 1.525), smoothstep(0.26, 0.40, msqDe)); // 脊侧 → 脊顶风化灰褐（与 High 逐字同源）
vec3 msqBarkMul = mix(vec3(0.609, 0.611, 0.582), msqRidge, msqPlateau); // 沟 ↔ 脊三色剖面（中距「红褐纵长条片」身份）
msqBarkMul *= 0.92 + 0.16 * msqSegH; // 逐段深浅保留
msqBarkMul *= 1.0 - msqCross * 0.18; // 断口沟保留
msqBarkMul = mix(msqBarkMul, msqBarkMul * vec3(1.14, 1.05, 0.86), msqSmoothUp * 0.60); // 株内梯度保留
msqBarkMul = mix(msqBarkMul, msqBarkMul * vec3(1.12, 1.08, 0.98), msqTwig * 0.65); // 小枝淡红绿保留（冠缘细枝中距读向）
msqBarkMul *= mix(vec3(1.0), vec3(0.93, 0.92, 0.93), (1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35);
diffuseColor.rgb *= msqBarkMul;
`;

/** Low：合成（再去逐段深浅/株内梯度/小枝淡红绿/干基暗化——低调项；条片三色剖面 + 断口剪影保留） */
const METASEQUOIA_BARK_MUL_LOW = /* glsl */ `
vec3 msqRidge = mix(vec3(1.0), vec3(1.120, 1.354, 1.525), smoothstep(0.26, 0.40, msqDe)); // 脊侧 → 脊顶（与 High 逐字同源）
vec3 msqBarkMul = mix(vec3(0.609, 0.611, 0.582), msqRidge, msqPlateau); // 条片三色剖面剪影（远距「红褐纵长条片」保留面）
msqBarkMul *= 1.0 - msqCross * 0.18; // 断口沟保留（剥落段读向——条片分段身份）
diffuseColor.rgb *= msqBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/** 羽卡基调色卡配方行（T024 / D44 #2——色值配方归树材质工厂私有域） */
interface MetasequoiaNeedlePreset {
  /** 羽卡基调构造色（material.color = uniform 通道，不进 GLSL——program 不增的载体面） */
  color: number;
}

/**
 * 羽卡基调色卡配方表（模块私有；卡集与 meta.presets 声明对应——asset_tree_metasequoia
 * 双卡，**针叶族首个 preset 双卡**〔落叶证据建卡——D44 #1；雪松常绿单卡先例的反向
 * 应用〕）。default 行 = 现行数值的**单一定义源**（缺省路径经本表消费——「default =
 * 现行」由结构保证）；变奏域/两面差/透射色**不随卡**：program 不增红线（D44 #3）
 * 要求 autumn 与 default 同 customProgramCacheKey ⇒ GLSL 字面量不分叉 ⇒ hue 两端
 * (0.97,1.00,1.02)↔(1.04,1.03,0.94)、luma 0.92±0.08、两面差端点 (1.110,1.141,
 * 1.059)、透射色 (0.72,0.94,0.38)、峰值 0.46 跨卡冻结，秋相读向 = 锈橙红褐基色 ×
 * 现行变奏乘子复合（推导见 autumn 行注释）。未知卡 id 回退 default（值域校验归
 * Renderer resolvePoolKey 单一 choke point——工厂不做第二套校验）。
 */
const METASEQUOIA_NEEDLE_PRESETS: Readonly<Record<string, Readonly<MetasequoiaNeedlePreset>>> = {
  [DEFAULT_COLOR_PRESET_ID]: {
    // 现行数值（T012.2 工程设定）：亮黄绿 #8ab65a（= profile needleColorSun——Spec §5.1 上面
    // "bluish green or yellowish green" Verified [2] + 主语境 9 月末亮黄绿 s04 Pisa 2024-09-30
    // Observed）。**阳端锚定 ramp**：暴露度 1.0 处 = 此色（vs 雪松构造中点式——落叶双卡沿用
    // 阔叶「基色 = swatch」惯例，ginkgo 0x8ab45d 同型）；**swatch 对齐锚**：3a meta default
    // swatch 预期同值（派遣简报占位——不一致以 3a 报告为准，合并阶段对齐）。
    color: 0x8ab65a,
  },
  autumn: {
    // 秋·锈橙-红褐 #a55d2c（3a meta swatch 同值 = 锈橙 0xc07632 × 红褐 0x8b4526
    // 中值——三处同源：meta swatch ↔ 本构造色 ↔ CROWN_PRESETS 冠卡行；五源交叉：
    // FoC "turning orange or red in autumn" / MoBot "turns red-bronze in fall" /
    // NC "turns a brownish copper color" / Wikipedia "foxy reddish brown" + s10
    // 10-26 Observed 锈橙/琥珀约半 + 显著残绿〔终审：色值校准取中值偏红褐〕——
    // Spec §5.2 判定②结论）：
    // - hue ≈ 24.3°（sRGB）锈橙-红褐中值偏红褐（R−G 72 强暖向）——锈橙（>30° 橙域）与
    //   红褐（<20°）之间的中带，按终审「中值偏红褐」取下中带；不入金黄域（vs ginkgo
    //   48.9°/zelkova 橙铜——落叶杉类锈褐相与阔叶金橙谱直接区分）；
    // - 亮度 ≈ 109 < 夏相 ≈ 158（锈褐相深于亮黄绿——red-bronze/copper 读向；秋相更暗
    //   非更亮，vs ginkgo 秋亮金反向）；
    // - 「显著残绿」（s10 Observed 峰值转色中）取舍：变奏冷端复合 ×(0.97,1.00,1.02) ≈
    //   少数叶橄榄锈色弱近似（hue 端点被 program 红线冻结——残绿强度弱于证据，记档沿
    //   ginkgo 同型取舍）；
    // - 透射色维持亮黄绿 (0.72, 0.94, 0.38)：同程序红线的代价（透射字面量进 GLSL，分叉
    //   即 +1 program 违反 D44 #3）；秋相透射偏金的解锁归后续统一决策，不在本 Step；
    // - 球果维持绿近熟表征（器官色为 GLSL 字面量跨卡冻结——取舍记档见模块头 preset 节）。
    color: 0xa55d2c,
  },
};

/**
 * 羽卡材质（组 1——纯羽卡帧；器官卡归组 0 皮材质，3a 冻结）：SDF 生成器三帧同串
 * （组 1 顶点 v 恒 < 0.99 只命中羽列帧——单一来源纪律 + 深度共享）alphaTest 裁切 +
 * 受光色差（阳亮荫深）+ **两面温和色差**（gl_FrontFacing 背面提亮——vs 雪松无两面
 * 差）+ 幼叶 + 高档试探透光 0.46（羽卡域门控）+ 逐卡变奏 + 风动两成分。level 分档
 * （T012.2，缺省 'high'）：Mid 羽列 14 元素 + 去簇团噪声/糙度项（受光/两面差/幼叶/
 * 透光/hue·luma 保留——颜色层次档间连续保留面）；Low 8 元素 + 再去透光，片元零
 * 噪声。风动三档同源不动。
 * 底参：亮黄绿 #8ab65a（阳端锚定 swatch 基色）/ m 0 / r 0.70（软条形叶薄软哑光——
 * family 链樟 0.50 < 雪松 0.66 < ginkgo 0.68 < 水杉；两面糙度同值）/ DoubleSide
 * （羽卡双面可见——背面法线由 three 双面光照自动翻转，两面固有色经 msqFaceMul
 * 微差）。preset（T024 可选参，缺省 = 默认卡）：查 METASEQUOIA_NEEDLE_PRESETS 覆写
 * 基调构造色（autumn = 锈橙-红褐 #a55d2c = 3a swatch 同值）；缺省/'default'/未知
 * id = default 行 = 现行行为逐位一致；program 不增红线 = preset 只走构造色，
 * GLSL/defines/键与 default 全同（**preset 不进 customProgramCacheKey**）。
 */
export function createMetasequoiaNeedleMaterial(
  level: ProceduralLevel = 'high',
  preset?: string,
): THREE.MeshStandardMaterial {
  // 色卡解析（T024）：缺省 / 'default' / 未知 id → default 行（现行数值单一定义源）
  const recipe = (preset !== undefined ? METASEQUOIA_NEEDLE_PRESETS[preset] : undefined)
    ?? METASEQUOIA_NEEDLE_PRESETS[DEFAULT_COLOR_PRESET_ID]!;
  const material = new THREE.MeshStandardMaterial({
    color: recipe.color, // 基调随卡（default = 亮黄绿现行值 / autumn = 锈橙-红褐——表注释引 Spec）
    metalness: 0,
    roughness: 0.70, // 软条形叶薄软哑光（工程设定——family 链：樟 0.50 革质亮 < 雪松 0.66 角质 < ginkgo 0.68 薄纸质 < 水杉 0.70 软条形；两面糙度同值）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 三帧卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const cardSdf = metasequoiaCardSdfSource(level); // 单一来源（表面/深度共享同档同串）
  const featherBody = level === 'high'
    ? METASEQUOIA_NEEDLE_HEAD + METASEQUOIA_NEEDLE_CLUMP + METASEQUOIA_NEEDLE_MUL_HIGH
    : METASEQUOIA_NEEDLE_HEAD + METASEQUOIA_NEEDLE_MUL_SIMPLE; // Mid/Low 同体（档差在 SDF 对数 / 簇团段 / 透光注入）
  // 跨 include 域变量预声明（map 注入块内赋值 / roughnessmap 注入消费——块内纯赋值
  // 不重声明防作用域遮蔽；msqClump High 注入段赋值、Mid/Low 为无害死值 0.5）
  const domainVars = 'float msqClump = 0.5; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一）\n';
  const body = /* glsl */ `
// metasequoia:needle —— 组 1 纯羽卡帧（器官卡归组 0 皮材质——3a 冻结契约；SDF 三帧
// 路由保留为单一来源纪律 + 深度同串，组 1 顶点 v 恒 < 0.99 只命中羽列帧）
${domainVars}float msqAlpha = msqCardAlpha(vUv, vLeafRand); // 三帧 SDF 覆盖（单一来源生成器——深度材质同串）
diffuseColor.a = msqAlpha;
${featherBody}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${METASEQUOIA_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${METASEQUOIA_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${cardSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${body}`,
    );
    // 糙度注入（组 1 纯羽卡帧——器官帧定值归皮材质；簇团微变仅 High，两面糙度同值）
    const featherRough = level === 'high'
      ? '  roughnessFactor = clamp(roughnessFactor + (msqClump - 0.5) * 0.05, 0.05, 1.0); // 羽卡簇团糙度微变（High——两面同值；Mid/Low 无项）'
      : '  roughnessFactor = clamp(roughnessFactor, 0.05, 1.0); // 羽卡帧（Mid/Low 无簇团项——基糙度直通）';
    const needleRoughness = featherRough; // 纯羽卡帧无 v 域分支（器官定值在皮材质）
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${needleRoughness}`,
    );
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${METASEQUOIA_NEEDLE_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `metasequoia:needle${levelKeySuffix(level)}`; // preset 不进键（program 不增红线——同键必须同源 GLSL）
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（树皮 + 器官卡——3a 冻结：球果/枯穗卡入皮组，v 域三分支）：皮 = **第 15
 * 语言纵长条片-纤维剥落**（周向 32 条片列 × 纵向 96 段频率/管程〔v ∈ [0,0.92] 逐管
 * 归一契约〕+ 长宽比 4–6:1 + 脊:沟 2.5:1 深索陡壁 + 三调色〔脊顶风化灰褐/脊侧中褐/
 * 沟底橙褐〕+ 长纤维条翘边 + 横向断口 + 逐段深浅 + 幼淡橙褐→老暗红褐株内梯度 +
 * 一年生小枝淡红绿 + 局部地衣【High】+ 干基暗化）；球果 [1,2) = 绿近熟 + 种鳞行带
 * 横沟；枯穗 [2,3) = 枯褐 + 孢子囊痕——器官轮廓 = 三帧 SDF 圆端带（单一来源生成器
 * ——与羽表面/深度同串；aLeafRand 恒 0 传常数，变奏 = vUv.x 色档）。level 分档
 * （T012.2，缺省 'high'）：Mid 去地衣/翘边微暗（近景细节），条片/三色剖面/断口/
 * 段深浅/株内梯度/小枝保留、器官帧同体（Mid 几何双器官全量）；Low 再去逐段深浅/
 * 株内梯度/小枝淡红绿/干基暗化（低调项），条片三色剖面 + 断口剪影保留（远距「红褐
 * 纵长条片」身份），1× vnoise、器官分支死代码（Low 几何省略器官）。风动 = 两成分
 * 与羽卡同公式同相位（aBend 恒 0 高频颤层天然不作用；器官卡随整冠摆）。
 * 底参：红褐-桂皮棕主调 #7a5138（barkBaseColor——s08 Observed + FoC "dark reddish
 * brown" Verified [2]）/ m 0 / r 0.93（纤维条片高糙哑光；器官帧定值 0.62/0.88 覆写）/
 * DoubleSide + alphaTest 0.5 + alphaToCoverage（**器官单面卡交叉双卡需双面读向**
 * ——背面剔除留盲区角；皮域 alpha 恒 1 实心不受裁，皮管闭合由深度测试淘汰背面，
 * 微 overdraw 记档——vs 雪松皮 FrontSide〔实体球果网格无此需求〕）。
 */
export function createMetasequoiaBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x7a5138, // 红褐-桂皮棕（barkBaseColor——Spec §5.4 s08 Observed 三调基调 + FoC Verified [2]）
    metalness: 0,
    roughness: 0.93, // 纤维条片高糙哑光
    side: THREE.DoubleSide, // 器官单面卡双面读向（皮域实心闭合不受影响——见 docstring）
    alphaTest: 0.5, // 器官卡圆端带裁切（皮域 alpha 恒 1 实心——不裁）
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // 条片域 = 皮圆柱 uv + 器官卡 v 帧（u=环绕一周、v=逐管归一 [0,0.92]——契约见 STRIPS 注释）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const cardSdf = metasequoiaCardSdfSource(level); // 器官轮廓单一来源（与羽表面/深度同档同串）
  const barkBody = level === 'high'
    ? METASEQUOIA_BARK_STRIPS + METASEQUOIA_BARK_LICHEN + METASEQUOIA_BARK_MUL
    : level === 'mid'
      ? METASEQUOIA_BARK_STRIPS + METASEQUOIA_BARK_MUL_MID
      : METASEQUOIA_BARK_STRIPS + METASEQUOIA_BARK_MUL_LOW;
  // 跨 include 域变量预声明（map 注入块内赋值 / roughnessmap 注入消费；Mid/Low 未赋
  // 项为无害死值——msqLichen 0.0 / msqSegH 0.5 等）
  const domainVars = 'float msqPlateau = 1.0; float msqSegH = 0.5; float msqCross = 0.0; float msqSmoothUp = 0.0; float msqTwig = 0.0; float msqLichen = 0.0; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一）\n';
  const body = /* glsl */ `
// metasequoia:bark —— 组 0 皮 + 器官卡 v 埧三分支（皮 <1.0 / 球果 [1,2) / 枯穗 [2,3)
// ——3a 冻结：器官卡入皮组、aLeafRand/aBend 恒 0；判别阈值 1.0/2.0）
${domainVars}float msqAlpha = 1.0; // 皮域实心（分支内器官帧覆写为圆端带 SDF）
if (vUv.y >= 2.0) {
${METASEQUOIA_STROBILUS_BODY}
} else if (vUv.y >= 1.0) {
${METASEQUOIA_CONE_BODY}
} else {
${barkBody}
}
diffuseColor.a = msqAlpha;`;
  const barkRoughness = `if (vUv.y >= 2.0) {
  roughnessFactor = 0.88; // 枯穗干枯高糙（器官帧定值——三档同）
} else if (vUv.y >= 1.0) {
  roughnessFactor = 0.62; // 种鳞蜡质微泽（器官帧定值——三档同）
} else {
  roughnessFactor = clamp(0.93 + (1.0 - msqPlateau) * 0.04 - msqSmoothUp * 0.06 - msqLichen * 0.08, 0.05, 1.0); // 沟糙 + 纤维高糙哑光；上部幼龄/地衣微泽（三档同——Mid/Low 死值 0 无项）
}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${METASEQUOIA_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${METASEQUOIA_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${cardSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${body}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${barkRoughness}`,
    );
  };
  material.customProgramCacheKey = () => `metasequoia:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 羽影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（**SDF 随档变体**——羽列叶元素 22/14/8 递减即 LOD 内容）：Mid = Mid
 * SDF / Low = Low SDF（表面/影档内一致——表面/影裁切羽形同档同步）。**深度片元不挂
 * 噪声库**——三帧 SDF 全 ALU（inline sin-hash 非 facVnoise）。组 0 守卫：皮域 +
 * **器官卡（aLeafRand 恒 0——3a 冻结：器官卡随皮组）→ alpha=1 实心**——多材质网格
 * 共用本深度材质时组 0 不被羽形 SDF 误裁（triadica 恒等 attribute 先例）；器官影
 * = 实心方卡剪影（vs 表面圆端带略大——cm 级器官在影贴图 ~16cm/texel 下不可辨，
 * 记档取舍沿 asset 模块头口径）。风动位移不进 depth pass（静态影取舍，沿先例）；
 * 影 pass 侧向由 shadowMap 按主材质 DoubleSide 覆写为双面（羽卡/器官卡两面皆可
 * 投影）；alphaTest 由 shadowMap 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createMetasequoiaNeedleDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 三帧卡 uv
  const cardSdf = metasequoiaCardSdfSource(level); // 与羽表面同档同串（单一来源生成器）
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
attribute float aLeafRand;
varying float vLeafRand;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
${cardSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, msqCardAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱 uv 域不误裁）；器官卡非零 → 三帧 SDF 裁切`,
    );
  };
  material.customProgramCacheKey = () => `metasequoia:needle-depth${levelKeySuffix(level)}`;
  return material;
}
