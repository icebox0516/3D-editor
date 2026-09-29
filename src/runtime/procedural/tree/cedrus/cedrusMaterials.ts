/**
 * runtime/procedural/tree/cedrus/cedrusMaterials —— 雪松（Cedrus deodara，
 * asset_tree_cedrus）针叶/树皮（含球果域）/针影深度材质（T012.1 Step 3b，针叶族
 * conifer **首例材质实例**——跨族方法复制阔叶管线，形态语言按雪松改写）。
 *
 * 职责：复制阔叶 13 树已验收的配方方法（onBeforeCompile 注入工厂全套纪律：
 * replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后
 * 追加 / <color_fragment> 绝不触碰），物种配方按雪松自己的 Reference Spec 换装——
 * Spec docs/research/cedrus-reference.md **@1.0**（任务书锚点 1.0，开工前已校验一致，
 * 含 2026-09-29 主代理终审记档）。消费冻结契约（只读）：conifer/coniferShapeProfile
 * （草案）+ cedrus/cedrusShapeProfile（8 槽数值面）——needleMaterial / bark / wind /
 * cone 色字段为本文件消费面；**数值按家族先例以字面量 + 同源注释消费（硬编码，
 * 与 profile 侧无联动通道——koelreuteria ⑥ 同型家族缺口，记缺口候选⑥）**。
 * 几何契约（与 3a 并行冻结）：组 0 树皮+球果 FrontSide / 组 1 针卡 DoubleSide，
 * 针卡固有 attribute aLeafRand / aBend + 实例 aSeed；组 0 aLeafRand/aBend 恒 0。
 *
 * 【与几何侧（3a）的材质侧契约声明（并行冻结面，合并阶段对齐）】
 *   - 三工厂签名沿 camphor/ligustrum 常绿单卡先例（无 preset 尾参——D44 常绿无卡）：
 *     (level: ProceduralLevel = 'high') => MeshStandardMaterial / MeshDepthMaterial；
 *     每次调用全部 new（D17）。
 *   - 恰两组：组 0 = 皮 + 球果（本文件 createCedrusBarkMaterial 一材质按 uv v 域
 *     分流四域）；组 1 = 针卡（createCedrusNeedleMaterial）。
 *   - **球果卡 uv 域冻结（派遣简报冻结接口 3）**：v∈[4.0,5.0) 隔离带（配方空——
 *     几何不产出，材质侧落皮分支为无害死码）；v∈[5.0,6.0) 将熟球果（u = 色档 0–1
 *     绿→红褐，coneColorMature 域）；v∈[6.0,7.0) 当年幼果（淡绿，coneColorYoung
 *     域，u = 色档）；v∈[7.0,8.0) 宿存中轴（coneAxisColor 淡入）。皮组球果区
 *     **实心（无 alpha 透切）**——组 0 材质不设 alphaTest。
 *   - **针卡双帧 uv 域（材质侧定义，3a 对齐）**：散生单针卡 v∈[0,1)（v=0 针基 →
 *     v=1 针尖——家族叶卡经典帧，aBend 卡根≈0 尖大）；莲座簇卡 v∈[2,3)（卡内帧 =
 *     (u, v−2) ∈ [0,1]² 方形卡，中心 (0.5, 0.5) 放射）；判据阈值 1.5（0.5 隔离带
 *     沿家族域纪律）。v∈[1,2) 为隔离带（不产出）。
 *
 * 【莲座簇卡 SDF——针叶形态新语言（本任务核心新路径，限定文件内最小扩展）】
 *   家族前 13 例叶卡全部「单叶连续轮廓 + 边缘扰动」；短枝针簇的结构信息是
 *   「15–25 针自中心放射」——离散放射重复，非边缘扰动。新路径 = **极坐标扇区窗列
 *   放射法**（vs 栾树两级窗列 lift 折叠法的轴改径向）：
 *   ① 扇区坐标 s = atan(y,x)·(N/2π) + rand·N（针心位整数；N 整数保证 ±π 接缝
 *      fract 连续——无缝线伪影）；整卡相位旋转 = 逐卡莲座方位差。
 *   ② 逐针 hash（k 与 rand 的 inline sin-hash）→ 角位抖动 ±21% 扇区（近轮生非机械
 *      规整——「假轮生」读向）+ 逐针长 0.33–0.47（外缘参差——莲座放射直径非正圆）
 *      + 逐针半宽 0.030–0.038。
 *   ③ 针体横向距离场 lat = 距针轴角位差 × (2π/N) × r（笛卡尔化——近中心自然汇聚
 *      成实心 = 短枝顶读向；远端展开成离散针——莲座「放射」读向）；宽度向针尖收
 *      0.55 倍（「先端锐尖」FRPS Verified 的逐针表达）。
 *   ④ 中心 hub 盘 r < 0.075 恒实心（短枝顶芽/叶枕——防中心裁穿 + atan(0,0) NaN
 *      守卫双保险，x 轴 +0.00001 偏置）。
 *   ⑤ 针数分档派生（profile rosetteNeedles 20 为 High 基准——「LOD 降档 = 针数
 *      递减派生归 3b」）：Mid 14 / Low 8「近似星点」（判定 2）。三档同函数名同
 *      签名（表面/深度同源取用——单一来源经生成器保证）。
 *   ⑥ 散生单针卡（长枝螺旋散生辐射伸展）：sin(π·v^1.55) 包络——最宽 v≈0.64 上部
 *      较宽 + v=1 收 0 先端锐尖 + v→0 收窄下部渐窄（FRPS「上部较宽，先端锐尖，
 *      下部渐窄」Verified [1]）；rand 保留双参签名沿家族契约、单针不用。三棱横截面
 *      卡分辨率不可读——记档不表达（Step 1 判定口径）。
 *   全 ALU 零 facVnoise（扇区窗列/抖动 hash 全 inline sin-hash）——深度材质不挂
 *   噪声库的前提；坡宽 0.02（针形细结构口径——alphaToCoverage 承担 AA）。
 *
 * 针叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - **灰绿-蓝绿-银灰粉调基色（身份）**：构造中点 #6b8273 = (needleColorSun
 *     0x9db3a6 + needleColorShade 0x39503f)/2 严格中点（profile 冻结值推导；
 *     三处同源 swatch 已按此回写——meta/canopy/测试锚同值 0x6b8273）。
 *   - **阳银荫深受光色差（身份核心——crown-b 承重）**：冠层暴露度 ramp（冠基
 *     4.1m = trunkHeightRatio 0.25 × 16.5 锚 + 5m 渐入带 + 逐卡 ±0.12 抖动破纯
 *     竖向梯度）mix(荫深绿 ×(0.696,0.750,0.706), 阳银灰蓝 ×(1.304,1.245,1.288))
 *     ——端点 = needleColorShade/Sun 对构造中点的 sRGB 比值 × 0.65 观感软化（严格
 *     中点下两端互补对称，暴露度 0.5 处 = 中点色）。Spec §5「阳面银灰-蓝绿 vs
 *     荫面深绿」Verified [4][5][6]。**无两面色差**（针叶辐射着生——vs 阔叶两面
 *     色差语言分化）：无 BACK 段、色路零 gl_FrontFacing、两面糙度同值（契约不含
 *     两面字段 = 语义本身——coniferShapeProfile 模块头）。
 *   - **白粉 needleGlaucousBloom 0.35**：银灰粉调随暴露度 ×(1.10,1.07,1.14)
 *     （B ≥ R > G 去饱和冷灰 = 银灰粉；「幼时气孔线有白粉」FRPS——气孔线白粉的
 *     工程映射：白粉读向集中在受光面）。
 *   - **叶龄梯度 needleJuvenility 0.40**（域内变体非季相卡——判定 8）：18% 卡
 *     （0.40 × 新梢少数相 0.45）幼叶淡绿银灰 ×(1.15,1.13,1.18)（FOC "initially
 *     pale green" Verified [3]）——aLeafRand 统计近似，逐卡整卡表达。
 *   - 逐卡变奏 aLeafRand：色相两端冷灰绿↔暖绿（通道摆幅 ≤15% 纪律——常绿冠均一）
 *     + 明度 ±8%（去相关取样）。
 *   - 中频簇团斑块（High）：层板簇群尺度 ≈0.95m（频率 1.05——层板内簇聚读向
 *     Spec §3 层板密实 Inferred [6]）。
 *   - 糙度 0.66（针形坚硬角质 + 白粉蜡质——哑光-半光泽；family 链：樟 0.50 革质
 *     亮 < ginkgo 0.68 薄纸质；工程设定）；无两面糙度差。
 *   - **背光透射高（试探值 0.38）**：家族链 夏栎 0.65 > **雪松 0.38** > 银杏
 *     0.34 > 朴树 0.30 > 悬铃木 0.28 > 樟 0.22 > 女贞 0.21——单针 1–1.5mm 细薄
 *     针体背光本体透光强（Spec §5 针尺度 Verified 四源）；针间透空由 SDF alpha
 *     承担、本项补针体本体；坚硬角质 + 蓝灰粉调 → 不取夏栎 0.65 级。透射色
 *     (0.60,0.92,0.46) 青绿向（灰绿针透光非黄绿透明感）。**Step 4 校准回路
 *     开放**（判定 6「家族透射值域链上带试探定档」）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent）；
 *     零贴图零 DataTexture（D13）。
 *
 * 皮（组 0 皮域）配方——**鳞状方块片系（阔叶 13 语言后独立新语言位，判定 5）**：
 *   vs 13 先例（深纵裂脊沟族 ×3 / 平滑浅裂 / 光滑剥落 / 地图状剥落三色带 / 浅色
 *   皮孔麻点 / 暗灰窄裂碎翘 / 褐宽脊扭转 / 板状厚脊瘤突 / 灰褐浅中纵裂细脊 /
 *   细窄纵脊浅沟）——雪松 = **砖错位方形/长方形鳞块网格**（蜥皮状鳞片镶嵌）：
 *   - 主调 #555049 暗灰-灰褐（barkBaseColor——Spec「深灰色，裂成不规则的鳞状
 *     块片」FRPS Verified [1][4][5][6]）。
 *   - 鳞块网格：周向 26 × 纵向 72 + 低频游走 warp（「不规则」）+ 奇偶行半格错位
 *     （砖缝——防整齐阵列读向）+ 块内 hash 抖动 ±0.15 + **方 ↔ 长方两型**（「3–8cm
 *     不规则方-长方形」bark-a Verified [6]——barkPlateMin/Span 0.03–0.08 近真域）。
 *     uv 契约假设：u = 环绕一周（干周 ≈1.6m @16.5m 树）、v 压缩至 [0,4)（球果
 *     隔离带兼容）→ ≈6cm 近方块；**3c 出图面校准回路开放**。
 *   - 块顶 ↔ 沟剖面：平顶块片（块心 plateau）+ 块缘沟；沟半宽 = 0.10 + 0.25 ×
 *     barkGrooveDepth 0.45（浅-中端 → 窄沟）；色端 = barkPlateColor 0x7a7468 /
 *     barkGrooveColor 0x2b2823 对基色 sRGB 比值 × 观感软化 0.80/0.85 →
 *     ×(1.348,1.360,1.340) ↔ ×(0.580,0.575,0.557)（块顶浅灰褐 / 沟浅-中近黑）。
 *   - 每块深浅 hash 单色变奏（0.92+0.16×hash）+ 块面细粒（High 1× vnoise——鳞片
 *     表面微颗粒）。
 *   - **不剥落**：无剥落代际拼贴、无三色带（Spec「块状纹理不剥落」bark-a [6]）。
 *   - 上部渐光滑（smoothstep(6.0,10.0)）：「幼树皮灰色光滑渐开裂」TSO/NC [4][5]
 *     的株内梯度映射（上部枝 = 幼龄生长域）→ 单色灰 + 二三年生枝灰色（FRPS [1]）。
 *   - 一年生小枝淡灰黄 ×(1.16,1.12,0.90)（FRPS「一年生长枝淡灰黄色，密生短绒毛，
 *     微有白粉」Verified [1] + 照片新枝金黄褐→二年转灰 [6]）——高位 × 小弧长 v
 *     双门控（ligustrum 细枝两档先例）。
 *   - 干基暗化弱档（家族惯例 ×0.35）。
 *   - 苔藓/地衣不做（Spec 无记载——不做不编造，沿榉/ginkgo 先例）；微起伏归
 *     几何层（契约草案记档——几何侧树皮轮廓层未进草案）。
 *
 * 球果域（uv v 域分流，koelreuteria 花果同型先例——冻结域表）：
 *   - 将熟球果 v∈[5,6)：u 色档 **四档量化**（floor(u×4)/3——绿→黄绿→转褐→红褐；
 *     「成熟前淡绿色微有白粉，熟时红褐色」FRPS Verified [1]）+ 未熟端微白粉覆层
 *     （High——「微有白粉」）+ 档内 ±8% 变奏。端点：淡绿 (0.340,0.480,0.240)
 *     工程色 ↔ 红褐 (0.254,0.144,0.072) = coneColorMature 0x8a6a4c sRGB→线性。
 *   - 当年幼果 v∈[6,7)：淡绿 (0.366,0.521,0.287) = coneColorYoung 0xa3bf92
 *     sRGB→线性（「淡绿带粉」cone-b [6]）× ±10% 变奏。
 *   - 宿存中轴 v∈[7,8)：淡褐 (0.332,0.254,0.162) = coneAxisColor 0x9c8a70 线性
 *     （「熟时与种鳞一同从宿存的中轴上脱落」FRPS 属级 [2]——中轴留枝淡入端）。
 *   - 三域实心着色（无 alpha 透切——冻结接口）；种鳞蜡质微泽 roughness 0.62。
 *
 * 风动（两层三成分——判定 7 + Spec §4 风动读向 Inferred [5][6]）：
 *   - 成分① 整层低频慢摆：0.35Hz（windTierFrequency）/ 幅 0.025m 顶——层状大枝
 *     massive 粗刚（「整层小幅慢摆」）；高度权重² × 1/16.5 锚。
 *   - 成分② 层缘垂帘/针簇高频颤：2.4Hz（windFringeFrequency）/ 幅 0.05m（aBend
 *     权重卡根≈0 尖大——皮组恒 0 免颤）——末级细柔（「层缘垂帘与簇高频颤动」）；
 *     family 快颤链 9–23 rad/s 内带（15.08 rad/s）。
 *   - 成分③ 顶梢明显摆幅：0.9Hz / 幅 0.09m——上 1/4 渐尖区门控
 *     smoothstep(0.70,0.95,H)（顶梢专路下垂点头段 leaderDroop 0.5 的动态面；
 *     幅度 ≈0.5% 树高与 family 缓摆同量级 = 「明显」档）。
 *   - **树高锚 16.5m**（CEDRUS_TREE_HEIGHT_NOMINAL = slot-0 totalHeight 同源——
 *     锚同步轮 15–18m 级；1/16.5 = 0.06061 命名常量注入 + 测试锚断言，ligustrum
 *     先例）。三成分皮/叶同公式同相位（不撕裂穿帮）；hash 常数 103.719/81.447
 *     与 13 先例相位流（sway 77.669–96.441 / flutter 49.337–73.521）去相关。
 *
 * 深度材质（针影裁切，customDepthMaterial 契约通道——沿 SOP §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha
 *     与针表面材质共享同一 GLSL 生成器输出（同档同串——表面改针形深度自动同步）。
 *   - **零噪声库注入**：莲座/散生 SDF 全 ALU（inline sin-hash 非 facVnoise）。
 *     保护性约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 多材质网格守卫：组 0（皮+球果）以恒等 attribute（aLeafRand=0）走实心分支，
 *     防针形 SDF 在圆柱/球果 uv 域上误裁出洞（triadica 恒等 attribute 先例）。
 *   - 档位匹配：Mid = Mid SDF（14 针）/ Low = Low SDF（8 针）——表面/影档内一致
 *     （SDF 随档变体 = 针数递减，vs 樟「档位坍缩」记档的分化点：莲座针数本身是
 *     LOD 内容）。customProgramCacheKey 三档分键（9 键契约）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T012.1，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build）：
 *   - 针 Mid：SDF 莲座针数 20→14（几何簇卡数同步降——剪影连续归 3a 档间不变量）；
 *     去簇团噪声/糙度簇团项（Spec §7 近距细节）；受光色差/白粉/幼叶/透光/
 *     hue·luma 三档保留（颜色层次档间连续保留面）。
 *   - 针 Low：SDF 8 针「近似星点」+ 去透光（远距逆光透射不可辨）/簇团；受光色差/
 *     白粉/hue·luma 保留；片元零噪声。
 *   - 皮 Mid：去块面细粒（1× vnoise——中距不可辨）；鳞块网格/沟剖面/每块深浅/
 *     上部光滑/小枝淡灰黄/干基暗化保留。
 *   - 皮 Low：再去每块深浅（均值 1.0 精确消去）/小枝淡灰黄/干基暗化（低调项）；
 *     鳞块网格 + 沟剖面 + 上部光滑保留（远距「深灰鳞状方块片」剪影身份）；
 *     1× vnoise（游走）。
 *   - 球果域：Mid 去未熟白粉覆层（近景细节）；Low 同 Mid——三域色档/变奏三档
 *     同体（中距「直立绿果顶生短枝」身份信号）。
 *   - 深度：Mid/Low = 各自档 SDF（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；cedrus 前缀不与 13 先例混
 *     缓存）：'cedrus:needle' / ':mid' / ':low'；'cedrus:bark' …；'cedrus:needle-
 *     depth' …（9 键全异；叶/皮经 applyTreeFadeDither 追加 '+dither'）。
 *   - 风动（CEDRUS_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一
 *     部分（D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 针 High 片元 = 1× vnoise（簇团）= 3× + 莲座 SDF（atan + 扇区窗列 + 双 hash）
 *     ≈ 3× + 受光色差/白粉/幼叶/hue ≈ 2× ≈ **8×（与樟同档——放射窗列的账）**；
 *   - 针 Mid/Low = 0 噪声 + ALU ≈ 4× / 3.5×；
 *   - 皮 High 片元（四域取最重路径）= 皮路径 2× vnoise（游走 + 块面细粒）= 6× +
 *     网格 hash ALU ≈ 1.5× ≈ **7.5×** / 球果路径纯 ALU ≈ 1.5×——域互斥执行；
 *   - 皮 Mid/Low = 1× vnoise ≈ 4.5×；
 *   - 深度片元 = SDF 纯 ALU ≈ 3×，**零噪声采样**；
 *   - 顶点 = 三次 sin（三成分）+ 一次法线乘，无循环。
 *
 * 契约缺口候选（归 T012 族级验收门；本文件零公共抽象扩展——莲座放射窗列/鳞块
 *   网格/球果域分流全部限定文件内）：
 *   ① 莲座簇卡针数分型（角位抖动/针长/针宽）与受光色差/幼叶/变奏共用 aLeafRand
 *      单属性统计近似（多通道复用同一 rand——分型间相关性无法表达；家族共有缺口，
 *      ginkgo ① 同型）；
 *   ② 莲座簇「极坐标扇区窗列放射」SDF：本文件内实现（针叶族首个簇卡语言）；
 *      族内第二例（云杉/冷杉簇卡）出现后评估提炼家族公共 SDF 模式（暂不动公共
 *      抽象——真实消费者触发）；
 *   ③ 针卡双帧 uv 域（散生 [0,1) / 莲座 [2,3)）为材质侧定义的并行契约——需与
 *      3a 几何侧实际编码合并阶段对齐冻结（koelreuteria ③ 轴向契约同型风险）；
 *   ④ 球果/簇卡无独立形变通道（组 0 aBend≡0——球果刚性正确；簇卡颤动已由组 1
 *      aBend 承载，莲座簇内逐针独立颤不可表达——单卡抽象的连带限制，家族复叶
 *      「小叶颤」同型缺口 koe ①）；
 *   ⑤ 受光色差「阳面/荫面」的冠层方位语义（crown-b 证据面）以高度暴露度 ramp +
 *      逐卡抖动近似——无冠层方位/径深通道（vTreePos 单点位无冠心参考系）；
 *   ⑥ 树高锚 16.5/冠基 4.1/渐入带 5.0/皮网格 uv 频率（26/72）材质侧硬编码——与
 *      profile 侧无联动通道（koelreuteria ⑥ 同型家族缺口；3c 出图面校准回路）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；
 *   零贴图/零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通
 *   Mesh 无该属性，WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；
 *   与 13 阔叶先例的通用段（风动公式等）为复制改造非 import（资产私有，跨资产不
 *   耦合——organization.md 边界）；**真实编译验证（console 零错误零警告）归 3c
 *   合并后执行**——本交付为可通过编译的同构 GLSL（X4000 纪律：单返回/零 out 参/
 *   全路径初始化）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/**
 * 树高锚（T012.1 判定 7「锚同步轮换锚 15–18m」：slot-0 totalHeight 16.5 同源——
 * profile 冻结值；材质-几何侧无联动通道记缺口候选⑥）。1/16.5 = 0.06061 命名常量
 * 注入风动 GLSL + 测试锚断言（ligustrum LIGUSTRUM_TREE_HEIGHT_NOMINAL 先例）。
 */
export const CEDRUS_TREE_HEIGHT_NOMINAL = 16.5;

/** 风动高度权重 = 1/树高锚（0.06061——注入 GLSL 字面量；5 位小数 = ligustrum 同步轮精度口径） */
const CEDRUS_WIND_H_SCALE = (1.0 / CEDRUS_TREE_HEIGHT_NOMINAL).toFixed(5);

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`cedrus 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

/**
 * 莲座簇针数分档派生（profile rosetteNeedles = 20 为 High 基准——契约注释「LOD
 * 降档 = 该值递减派生归 3b」；判定 2「Low 档近似星点」）：Mid 14 / Low 8。
 */
const CEDRUS_ROSETTE_NEEDLES: Record<ProceduralLevel, number> = { high: 20, mid: 14, low: 8 };

// ── 风动 GLSL（针/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：两层三成分（判定 7）——①整层低频慢摆（0.35Hz massive 层枝）+
 * ②层缘垂帘/针簇高频颤（2.4Hz 末级细柔，aBend 权重组 0 恒 0 免颤）+ ③顶梢明显
 * 摆幅（0.9Hz 上 1/4 渐尖区门控）。频率 = windTier/Fringe/LeaderFrequency (Hz) ×
 * 2π（profile 契约「频率 Hz（uTime 驱动）」）；幅度为米（0.025/0.05/0.09——
 * profile windTier/Fringe/LeaderAmplitude）。hash 常数 103.719/81.447 与 13 先例
 * 相位流去相关；树高锚 16.5m（×0.06061——slot-0 totalHeight 同源，锚同步轮）。
 */
const CEDRUS_WIND = /* glsl */ `
// cedrus wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float cedWindPhase = fract(sin(aSeed * 103.719 + 4.2) * 43758.5453);
float cedWindH = clamp(position.y * ${CEDRUS_WIND_H_SCALE}, 0.0, 1.0); // /16.5m 树高锚（slot-0 totalHeight 同源——CEDRUS_TREE_HEIGHT_NOMINAL；锚同步轮 15–18m 级）
// 成分① 整层低频慢摆：0.35Hz（2.1991 rad/s）× 幅 0.025m 顶——层状大枝 massive 粗刚（Spec §4「整层小幅慢摆」Inferred）
float cedTier = cedWindH * cedWindH * 0.025 * sin(uTime * 2.1991 + cedWindPhase * 6.28318 + cedWindH * 1.2);
// 成分③ 顶梢明显摆幅：0.9Hz × 幅 0.09m——上 1/4 渐尖区门控（顶梢专路下垂点头段的动态面；皮/叶同公式防撕裂）
float cedLeadW = smoothstep(0.70, 0.95, cedWindH);
float cedLeader = cedLeadW * 0.09 * sin(uTime * 5.6549 + cedWindPhase * 4.1 + cedWindH * 2.2);
// 成分② 层缘垂帘/针簇高频颤：2.4Hz（15.0796 rad/s——family 快颤链内带）× 幅 0.05m；权重 = aBend（卡根≈0 尖大——组 0 恒 0 免颤）
float cedFlutterPhase = fract(sin((aSeed + aLeafRand) * 81.447 + 6.8) * 43758.5453);
float cedFlutter = aBend * 0.05 * sin(uTime * 15.0796 + cedFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (cedTier + cedLeader + cedFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(cedTier + cedLeader) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * cedFlutter * 0.9; // 针卡沿卡法线微扑（皮组 aBend=0 → 恒 0）
`;

/** 顶点声明（针/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const CEDRUS_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 针形 SDF（表面材质与深度材质共用——单一来源生成器，禁复制粘贴）────────────────

/**
 * 雪松针卡覆盖率生成器（uv 域双帧——材质侧契约，见模块头）：
 * - 散生单针卡 v∈[0,1)：sin(π·v^1.55) 包络（最宽 v≈0.64 上部较宽 + 先端锐尖 +
 *   下部渐窄——FRPS Verified [1]；三棱截面卡分辨率不可读记档不表达）；
 * - 莲座簇卡 v∈[2,3)：极坐标扇区窗列放射法（N 针自中心放射 + 逐针 hash 抖动 +
 *   逐针长/宽变奏 + 先端收窄 + 中心 hub 实心——「短枝之叶成簇生状（每年生出新叶
 *   约 15-20 枚）」FRPS Verified [1] 的单卡整簇抽象；N 整数保证 ±π 接缝连续）。
 * **零 facVnoise 引用是深度材质不挂噪声库的前提（引入即深度编译暴雷——保护性
 * 约束；窗列/抖动全 inline sin-hash ALU）**；坡宽 0.02（针形细结构——alphaToCoverage
 * AA）；单返回 + 声明处初始化（X4000 纪律，koe ⑨ 家族口径）。
 */
function cedrusNeedleSdfSource(level: ProceduralLevel): string {
  const n = CEDRUS_ROSETTE_NEEDLES[level].toFixed(1); // High 20.0 / Mid 14.0 / Low 8.0（针数分档派生）
  return /* glsl */ `
float cedNeedleAlpha(vec2 cedUv, float cedRand) {
  float cedA = 1.0;
  if (cedUv.y >= 1.5) {
    // 莲座簇卡（v∈[2,3)——卡内帧 (u, v−2)，中心 (0.5,0.5) 放射；N = ${n}（分档派生）
    vec2 cedP = vec2(cedUv.x, cedUv.y - 2.0) - 0.5;
    float cedR = length(cedP);
    float cedAng = atan(cedP.y, cedP.x + 0.00001); // x 轴微偏置——atan(0,0) NaN 守卫（hub 实心带覆盖双保险）
    float cedS = cedAng * (${n} * 0.159155) + cedRand * ${n}; // 扇区坐标（针心位整数——±π 接缝 fract 连续）+ 整卡相位旋转（逐卡莲座方位差）
    float cedK = floor(cedS);
    float cedH = fract(sin(cedK * 12.9898 + cedRand * 78.233) * 43758.5453); // 逐针 hash（inline sin-hash——非噪声库）
    cedS += (cedH - 0.5) * 0.42; // 角位抖动 ±21% 扇区（近轮生非机械规整——「假轮生」读向）
    float cedD = 0.5 - abs(fract(cedS) - 0.5); // 0 沟心 → 0.5 针心（距最近针轴的扇区相位距离）
    float cedLen = 0.40 + 0.14 * (fract(cedH * 7.31) - 0.5); // 逐针长 0.33–0.47（外缘参差——莲座放射直径非正圆）
    float cedW = 0.030 + 0.008 * fract(cedH * 5.17); // 逐针半宽 0.030–0.038（针形抽象——真针 1–1.5mm 卡分辨率收窄记档）
    cedW *= 1.0 - 0.55 * smoothstep(0.55, 1.0, cedR / max(cedLen, 0.001)); // 先端锐尖——宽度向针尖收 55%（FRPS Verified 逐针表达）
    float cedLat = cedD * (6.28318 / ${n}) * cedR; // 距针轴横向距离（笛卡尔化——近中心汇聚成实心、远端离散针）
    cedA = clamp(max(min(cedW - cedLat, cedLen - cedR), 0.075 - cedR) / 0.02 + 0.5, 0.0, 1.0); // 针域 ∪ 中心 hub（短枝顶芽——r<0.075 恒实心）；坡宽 0.02
  } else {
    // 散生单针卡（v∈[0,1)：v=0 针基 → v=1 针尖——长枝螺旋散生辐射伸展；rand 保留双参签名沿家族契约、单针不用）
    float cedEnv = sin(3.14159 * pow(clamp(cedUv.y, 0.001, 0.999), 1.55)); // 上部较宽（最宽 v≈0.64）+ 先端锐尖（v=1 收 0）+ 下部渐窄（FRPS Verified [1]）
    cedA = clamp((0.5 * cedEnv - abs(cedUv.x - 0.5)) / 0.02 + 0.5, 0.0, 1.0); // 坡宽 0.02（针形细结构口径）
  }
  return cedA;
}
`;
}

/** 针片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写
 *  diffuseColor.a；位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装
 *  （沿先例体例）：High = HEAD + CLUMP + MUL_HIGH；Mid/Low = HEAD + MUL_SIMPLE（去
 *  簇团噪声——乘子 0.94+0.12×cedClump 均值化 = 1.0 消去，值噪声均值 0.5 精确保均）。
 *  **无 BACK 段——针叶辐射着生无两面色差（契约语义本身）**：色路零 gl_FrontFacing、
 *  两面糙度同值（vs 阔叶两面差语言分化——判定 6）。 */
const CEDRUS_NEEDLE_HEAD = /* glsl */ `
// cedrus:needle —— SDF 针形/莲座簇覆盖 + 受光色差（阳银荫深）+ 逐卡变奏（<color_fragment> 不触碰）
float cedAlpha = cedNeedleAlpha(vUv, vLeafRand);
diffuseColor.a = cedAlpha;
// 受光色差（身份核心——crown-b 承重）：阳面银灰-蓝绿 ↔ 荫面深绿。工程映射 = 冠层暴露度 ramp
// （冠基 4.1m = trunkHeightRatio 0.25 × 16.5 锚 + 5m 渐入带；逐卡 ±0.12 抖动破纯竖向梯度）
// + 实时光照响应复合——非叶面腹背语义（针叶辐射着生无两面色差——契约语义本身）
float cedExp = clamp((vTreePos.y - 4.1) / 5.0, 0.0, 1.0);
cedExp = clamp(cedExp + (fract(vLeafRand * 4.913 + 0.19) - 0.5) * 0.24, 0.0, 1.0);
vec3 cedLight = mix(vec3(0.696, 0.750, 0.706), vec3(1.304, 1.245, 1.288), cedExp); // 荫深绿 ↔ 阳银灰蓝（端点 = needleColorShade/Sun 对构造中点 sRGB 比值 × 0.65 观感软化——严格中点下两端互补对称）
cedLight *= mix(vec3(1.0), vec3(1.10, 1.07, 1.14), cedExp * 0.35); // 白粉（needleGlaucousBloom 0.35——气孔线白粉工程映射：银灰粉调随暴露度，B ≥ R > G 去饱和冷灰）
cedLight = mix(cedLight, cedLight * vec3(1.15, 1.13, 1.18), step(fract(vLeafRand * 7.317 + 0.41), 0.18)); // 幼叶淡绿银灰（needleJuvenility 0.40 × 新梢少数相 0.45 ≈ 18% 卡——域内变体非季相卡）
// 逐卡身份（aLeafRand）：色相两端（冷灰绿 ↔ 暖绿——灰绿基调 Spec §5 Verified；通道摆幅 ≤15% 纪律）+ 明度 ±8%（去相关取样）
vec3 cedHue = mix(vec3(0.95, 1.00, 1.02), vec3(1.05, 1.03, 0.92), fract(vLeafRand * 5.913 + 0.23));
float cedLuma = 0.92 + 0.16 * fract(vLeafRand * 3.719 + 0.57);
`;

/** High 专属：中频簇团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const CEDRUS_NEEDLE_CLUMP = /* glsl */ `
// 冠内：中频簇团斑块（波长 ≈1/1.05 ≈ 0.95m——层板内簇聚读向 Spec §3「层板内部密实」Inferred [6]；采样偏移与先例去相关）
float cedClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.69, vTreePos.y - vTreePos.z * 0.58) * 1.05 + vec2(57.1, 23.8));
`;

/** High 专属：合成（簇团乘子——均值 0.5 精确保均） */
const CEDRUS_NEEDLE_MUL_HIGH = /* glsl */ `
vec3 cedMul = cedHue * cedLuma * cedLight * (0.94 + 0.12 * cedClump); // 簇团乘子（受光色差在 cedLight——三档保留面）
diffuseColor.rgb *= cedMul;
`;

/** Mid/Low：合成（去簇团项——乘子均值化消去，值噪声均值 0.5 精确保均） */
const CEDRUS_NEEDLE_MUL_SIMPLE = /* glsl */ `
vec3 cedMul = cedHue * cedLuma * cedLight; // Mid/Low：簇团乘子均值化消去（0.94 + 0.12×0.5 = 1.0）
diffuseColor.rgb *= cedMul;
`;

/** 针背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  高档（试探值）：单针 1–1.5mm 细薄针体背光本体透光强（针间透空由 SDF alpha 承担）；
 *  坚硬角质 + 蓝灰粉调 → 不取夏栎 0.65 级。家族链：夏栎 0.65 > **雪松 0.38** > 银杏
 *  0.34 > 朴 0.30 > 悬 0.28 > 樟 0.22 > 女贞 0.21——Step 4 校准回路开放（判定 6）。 */
const CEDRUS_NEEDLE_TRANSLUCENCY = /* glsl */ `
// cedrus:needle —— 背光透射（高·试探档 0.38）：视线与阳光反向时针体透青绿（灰绿针透光
// 非黄绿透明感——白粉角质读向；透射色 (0.60,0.92,0.46) 青绿向 vs 阔叶黄绿向分化）
#if NUM_DIR_LIGHTS > 0
  float cedBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float cedTransVar = 0.55 + 0.45 * fract(vLeafRand * 9.117 + 0.47); // 逐卡透光强度变奏
  outgoingLight += vec3(0.60, 0.92, 0.46) * directionalLights[0].color
    * pow(cedBack, 3.0) * cedTransVar * cedAlpha * 0.38;
#endif
`;

// ── 组 0（皮+球果）配方主体（<map_fragment> 后注入；uv 域身份分支 5.0/6.0/7.0 冻结）──

/** 皮域：鳞块网格核心（三档共用——Low 保留面的唯一采样：低频游走 warp） */
const CEDRUS_BARK_PLATE = /* glsl */ `
// 鳞块网格（身份核心）：周向 26 × 纵向 72 + 低频游走 + 奇偶行砖缝错位 + 块内 hash 抖动 + 方↔长方两型
//（「3–8cm 不规则方-长方形鳞状块片」bark-a Verified [6]——barkPlateMin/Span 0.03–0.08 近真域；
//  uv 契约假设 u=环绕一周（干周 ≈1.6m）、v 压缩 [0,4)（球果隔离带兼容）→ ≈6cm 近方块——3c 校准回路开放）
float cedWarp = facVnoise(vec2(vUv.x * 2.0, vUv.y * 1.0) + vec2(63.7, 29.1)); // 鳞块列低频游走（「不规则」鳞状——缓歪防整齐阵列）
vec2 cedG = vec2(vUv.x * 26.0 + cedWarp * 1.4, vUv.y * 72.0 + cedWarp * 0.8);
cedG.x += mod(floor(cedG.y), 2.0) * 0.5; // 奇偶行半格错位（砖缝——26.0 整数周向 → u 接缝连续）
vec2 cedGId = floor(cedG);
float cedGR = fract(sin(dot(cedGId, vec2(127.1, 311.7)) + 71.3) * 43758.5453); // 每块 hash（inline sin-hash）
vec2 cedGF = fract(cedG) - 0.5 - (vec2(fract(cedGR * 7.31), fract(cedGR * 3.17)) - 0.5) * 0.30; // 块心抖动 ±0.15
vec2 cedAsp = mix(vec2(1.0, 0.70), vec2(0.70, 1.0), step(0.5, fract(cedGR * 9.13))); // 方 ↔ 长方两型（「方-长方形」双读向）
float cedGd = max(abs(cedGF.x) * cedAsp.x, abs(cedGF.y) * cedAsp.y); // 块距场（0 块心 → ~0.5 块界）
cedPlateau = 1.0 - smoothstep(0.2275, 0.2875, cedGd); // 沟→块顶剖面：平顶块片（沟半宽 0.10 + 0.25 × barkGrooveDepth 0.45 = 0.2125 + 0.06 过渡——浅-中端窄沟；赋值域变量供 roughness 消费）
cedSmoothUp = smoothstep(6.0, 10.0, vTreePos.y); // 上部渐光滑（「幼树皮灰色光滑渐开裂」TSO/NC 株内梯度映射——上部枝幼龄域；赋值域变量）
float cedTwig = smoothstep(9.0, 11.5, vTreePos.y) * (1.0 - smoothstep(0.45, 0.95, vUv.y)); // 一年生带 = 高位 × 小弧长细管双门控（ligustrum 先例）
`;

/** High 专属：块面细粒（1× vnoise——Mid/Low 去采样；鳞片表面微颗粒） */
const CEDRUS_BARK_GRAIN = /* glsl */ `
cedGrain = facVnoise(cedGF * 6.0 + vec2(cedGR * 13.7, cedGR * 7.3)); // 块面细粒（块内高频 + 每块 hash 去相关；赋值域变量）
`;

/** High：合成（沟↔块顶 + 每块深浅 + 块面细粒 + 上部光滑 + 小枝淡灰黄 + 干基暗化） */
const CEDRUS_BARK_MUL = /* glsl */ `
vec3 cedBarkMul = mix(vec3(0.580, 0.575, 0.557), vec3(1.348, 1.360, 1.340), cedPlateau); // 沟近黑 ↔ 块顶浅灰褐（barkGrooveColor/barkPlateColor 对基色 sRGB 比值 × 0.85/0.80 观感软化）
cedBarkMul *= 0.92 + 0.16 * cedGR; // 每块深浅（hash 单色变奏——块间明暗差）
cedBarkMul *= 0.97 + 0.06 * cedGrain; // 块面细粒（鳞片表面微颗粒——High）
cedBarkMul = mix(cedBarkMul, vec3(0.97, 0.98, 1.00) * (0.94 + 0.10 * cedGR), cedSmoothUp * 0.75); // 上部渐光滑灰（幼干光滑端 + 二三年生枝灰色 FRPS [1]）
cedBarkMul = mix(cedBarkMul, cedBarkMul * vec3(1.16, 1.12, 0.90), cedTwig * 0.65); // 一年生小枝淡灰黄（FRPS「淡灰黄色…微有白粉」Verified [1]）
cedBarkMul *= mix(vec3(1.0), vec3(0.93, 0.93, 0.94), (1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35); // 干基暗化弱档（家族惯例）
diffuseColor.rgb *= cedBarkMul;
`;

/** Mid：合成（去块面细粒——中距不可辨；其余保留） */
const CEDRUS_BARK_MUL_MID = /* glsl */ `
vec3 cedBarkMul = mix(vec3(0.580, 0.575, 0.557), vec3(1.348, 1.360, 1.340), cedPlateau); // 沟↔块顶（中距「深灰鳞状方块片」身份）
cedBarkMul *= 0.92 + 0.16 * cedGR; // 每块深浅保留
cedBarkMul = mix(cedBarkMul, vec3(0.97, 0.98, 1.00) * (0.94 + 0.10 * cedGR), cedSmoothUp * 0.75); // 上部光滑保留
cedBarkMul = mix(cedBarkMul, cedBarkMul * vec3(1.16, 1.12, 0.90), cedTwig * 0.65); // 小枝淡灰黄保留（冠缘淡灰黄细枝帘中距读向）
cedBarkMul *= mix(vec3(1.0), vec3(0.93, 0.93, 0.94), (1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35);
diffuseColor.rgb *= cedBarkMul;
`;

/** Low：合成（再去每块深浅〔均值 1.0 精确消去〕/小枝淡灰黄/干基暗化——低调项；鳞块沟剪影保留） */
const CEDRUS_BARK_MUL_LOW = /* glsl */ `
vec3 cedBarkMul = mix(vec3(0.580, 0.575, 0.557), vec3(1.348, 1.360, 1.340), cedPlateau); // 鳞块沟剖面剪影（远距「深灰鳞状方块片」保留面）
diffuseColor.rgb *= cedBarkMul;
`;

/** 将熟球果域体（三档共用——u 色档四档量化 + 档内变奏） */
const CEDRUS_CONE_MATURE = /* glsl */ `
  // 将熟球果（v∈[5,6) 冻结域）：u = 色档 0–1 四档量化（绿→黄绿→转褐→红褐——「成熟前淡绿色
  // 微有白粉，熟时红褐色」FRPS Verified [1] + 两类并存判定 4；量化防卡内梯度——逐果色档归几何 u 编码）
  float cedCu = floor(clamp(vUv.x, 0.0, 0.999) * 4.0) * 0.3333;
  vec3 cedConeM = mix(vec3(0.340, 0.480, 0.240), vec3(0.254, 0.144, 0.072), cedCu); // 淡绿（工程端）→ 红褐（coneColorMature 0x8a6a4c sRGB→线性）
  diffuseColor.rgb = cedConeM * (0.92 + 0.16 * fract(vUv.x * 17.3)); // 档内 ±8% 变奏
`;

/** 将熟球果未熟端微白粉（High 专属近景细节——「微有白粉」FRPS [1]） */
const CEDRUS_CONE_MATURE_BLOOM = /* glsl */ `
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.420, 0.480, 0.460), (1.0 - cedCu) * 0.14); // 未熟端微白粉覆层（转褐端褪粉）
`;

/** 当年幼果域体（三档共用——coneColorYoung 淡绿） */
const CEDRUS_CONE_YOUNG = /* glsl */ `
  // 当年幼果（v∈[6,7) 冻结域）：淡绿（coneColorYoung 0xa3bf92 sRGB→线性 (0.366,0.521,0.287)——
  // 「成熟前淡绿色，微有白粉」+ cone-b 淡绿带粉 Verified [1][6]；色值已含粉调不再覆层）
  diffuseColor.rgb = vec3(0.366, 0.521, 0.287) * (0.90 + 0.20 * fract(vUv.x * 19.7)); // ±10% 变奏（u 色档）
`;

/** 宿存中轴域体（三档共用——coneAxisColor 淡褐淡入端） */
const CEDRUS_CONE_AXIS = /* glsl */ `
  // 宿存中轴（v∈[7,8) 冻结域）：淡褐（coneAxisColor 0x9c8a70 sRGB→线性 (0.332,0.254,0.162)——
  // 「熟时与种鳞一同从宿存的中轴上脱落」FRPS 属级 [2]：种鳞散落后中轴留枝的淡入表征）
  diffuseColor.rgb = vec3(0.332, 0.254, 0.162) * (0.90 + 0.18 * fract(vUv.x * 13.1)); // ±9% 变奏
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 针卡材质（组 1）：SDF 双帧覆盖（莲座簇卡 20/14/8 针放射 + 散生单针卡）alphaTest
 * 裁切 + 受光色差（阳银荫深——**无两面色差**：无 BACK 段、零 gl_FrontFacing）+
 * 白粉/幼叶 + 高档试探透光 0.38 + 逐卡变奏 + 风动三成分。level 分档（T012.1，缺省
 * 'high'）：Mid 莲座针数 14 + 去簇团噪声/糙度项（受光色差/白粉/幼叶/透光/hue·luma
 * 保留——颜色层次档间连续保留面）；Low 针数 8「近似星点」+ 再去透光，片元零噪声。
 * 风动三档同源不动（CEDRUS_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：构造中点 #6b8273（= needleColorSun 0x9db3a6 + needleColorShade 0x39503f
 *  严格中点——暴露度 0.5 处即此色；三处同源 swatch 同值）/ m 0 / r 0.66（针形坚硬
 *  角质 + 白粉蜡质——哑光-半光泽；无两面糙度差）/
 *  DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转——两面固有色同值）。
 */
export function createCedrusNeedleMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x6b8273, // 构造中点（受光色差 ramp 基点——严格中点下 sun/shade 端互补对称；Spec §5 灰绿-蓝绿-银灰粉调身份）
    metalness: 0,
    roughness: 0.66, // 针形坚硬角质 + 白粉蜡质（工程设定——family 链：樟 0.50 革质亮 < ginkgo 0.68 薄纸质；无两面糙度差）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 针卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const needleSdf = cedrusNeedleSdfSource(level); // 单一来源（表面/深度共享同档同串）
  const needleBody = level === 'high'
    ? CEDRUS_NEEDLE_HEAD + CEDRUS_NEEDLE_CLUMP + CEDRUS_NEEDLE_MUL_HIGH
    : CEDRUS_NEEDLE_HEAD + CEDRUS_NEEDLE_MUL_SIMPLE; // Mid/Low 同体（档差在 SDF 针数 / 簇团段 / 透光注入）
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CEDRUS_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${CEDRUS_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${needleSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${needleBody}`,
    );
    if (level === 'high') { // 糙度注入仅 High（簇团微变——无两面糙度差，Mid/Low 无项不注入）
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + (cedClump - 0.5) * 0.05, 0.05, 1.0); // 簇团糙度微变（两面同值——无两面语义）`,
      );
    }
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${CEDRUS_NEEDLE_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `cedrus:needle${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（皮 + 球果一材质四域，uv v 域身份分支 5.0/6.0/7.0——冻结域表）：皮域 =
 * 鳞状方块片（砖错位网格 + 方↔长方两型 + 块顶浅灰褐/沟近黑剖面 + 每块深浅 + 块面
 * 细粒【High】+ 上部渐光滑 + 一年生小枝淡灰黄 + 干基暗化）；球果三域 = 将熟四档
 * 色序（未熟端微白粉【High】）/ 当年幼果淡绿 / 宿存中轴淡褐——实心着色无 alpha
 * 透切（冻结接口）。level 分档（T012.1，缺省 'high'）：Mid 去块面细粒/未熟白粉
 * （近景细节），鳞块/色序/变奏保留——中距「深灰鳞状干 + 直立绿果」身份（Spec §7
 * 中距保留面）；Low 再去每块深浅/小枝淡灰黄/干基暗化（低调项），鳞块沟剖面剪影 +
 * 球果色序保留（远距保留面），1× vnoise。风动 = 三成分整层/顶梢与针同公式同相位
 * （aBend 恒 0 高频颤层天然不作用）。
 * 底参：暗灰-灰褐主调 #555049（barkBaseColor——「深灰色」FRPS Verified [1][4][5]
 * [6]）/ m 0 / r 0.92（鳞块粗糙高糙哑光）/ FrontSide（皮管+球果实心闭合实体——
 * 无 alpha 裁切不需 DoubleSide；组 0 工程契约）。
 */
export function createCedrusBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x555049, // 暗灰-灰褐（barkBaseColor——Spec「深灰色，裂成不规则的鳞状块片」Verified）
    metalness: 0,
    roughness: 0.92, // 鳞块粗糙高糙哑光
    side: THREE.FrontSide, // 皮管/球果实心闭合实体（无 alpha 裁切）
  });
  material.defines = { USE_UV: '' }; // 四域分支 = uv 域身份标记（皮圆柱 / 球果三域——冻结域表）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? CEDRUS_BARK_PLATE + CEDRUS_BARK_GRAIN + CEDRUS_BARK_MUL
    : level === 'mid'
      ? CEDRUS_BARK_PLATE + CEDRUS_BARK_MUL_MID
      : CEDRUS_BARK_PLATE + CEDRUS_BARK_MUL_LOW;
  const coneMatureBody = CEDRUS_CONE_MATURE + (level === 'high' ? CEDRUS_CONE_MATURE_BLOOM : '');
  // 跨 include 域变量预声明（map 注入 if/else 块内赋值 / roughnessmap 注入消费——块内
  // 纯赋值不重声明防作用域遮蔽；cedGrain High 注入段赋值、Mid/Low 为无害死值 0.5）
  const domainVars = 'float cedPlateau = 1.0; float cedSmoothUp = 0.0; float cedGrain = 0.5; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一）\n';
  const body = /* glsl */ `
// cedrus:bark —— 组 0 四域分支（皮 v<5.0 / 将熟球果 v∈[5,6) / 当年幼果 v∈[6,7) / 宿存中轴 v≥7.0
// ——uv 域身份标记（派遣简报冻结域表）；v∈[4,5) 隔离带落皮分支 = 无害死码（几何不产出）
${domainVars}if (vUv.y >= 7.0) {
${CEDRUS_CONE_AXIS}
} else if (vUv.y >= 6.0) {
${CEDRUS_CONE_YOUNG}
} else if (vUv.y >= 5.0) {
${coneMatureBody}
} else {
${barkBody}
}`;
  const barkRoughness = `if (vUv.y >= 5.0) { roughnessFactor = 0.62; } // 球果域种鳞蜡质微泽（三档同）
else { roughnessFactor = clamp(0.92 + (1.0 - cedPlateau) * 0.05 - cedSmoothUp * 0.05, 0.05, 1.0); } // 沟糙 + 块顶/上部微泽（鳞块浮雕糙度响应）`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CEDRUS_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${CEDRUS_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}`,
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
  material.customProgramCacheKey = () => `cedrus:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 针影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（**SDF 随档变体**——莲座针数 20/14/8 递减即 LOD 内容，vs 樟「档位坍缩」
 * 记档的分化点）：Mid = Mid SDF / Low = Low SDF（表面/影档内一致——表面/影裁切针形
 * 同档同步）。**深度片元不挂噪声库**——SDF 零 facVnoise 引用（扇区窗列/抖动 hash
 * 全 inline sin-hash ALU；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 组 0 守卫：皮/球果域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度材质
 * 时组 0 不被针形 SDF 误裁（triadica 恒等 attribute 先例；球果实心无透切冻结接口）。
 * 风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap 按主材质
 * DoubleSide 覆写为双面（针卡两面皆可投影）；alphaTest 由 shadowMap 按主材质
 * alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createCedrusNeedleDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 针卡 uv（双帧）
  const needleSdf = cedrusNeedleSdfSource(level); // 与针表面同档同串（单一来源生成器）
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
${needleSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, cedNeedleAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱/球果 uv 域不误裁）`,
    );
  };
  material.customProgramCacheKey = () => `cedrus:needle-depth${levelKeySuffix(level)}`;
  return material;
}
