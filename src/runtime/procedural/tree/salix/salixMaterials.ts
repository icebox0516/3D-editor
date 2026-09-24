/**
 * runtime/procedural/tree/salix/salixMaterials —— 垂柳（Salix babylonica，
 * asset_tree_salix）叶/皮/叶影深度材质（T011.12，阔叶族第十三材质实例——
 * **狭披针形单叶 SDF（窄域极端长宽比包络 + 先端长渐尖变指数域上探 + 高频细齿
 * 载波）+ 树皮第 13 语言 + 垂帘风动两层**）。
 *
 * 职责：复制十二先例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：
 * replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句
 * 保留后追加 / <color_fragment> 绝不触碰），物种配方按垂柳自己的 Reference
 * Spec 换装——Spec docs/research/salix-reference.md **1.0**（任务书锚点 1.0，
 * 开工前已校验一致，含 2026-09-22 主代理采样终审记档 3 项直写修正：冠幅比上
 * 沿 1.3 / 垂幕域并集 2/5–2/3 / 叶沿垂索取向补强）。消费冻结几何契约（与十二
 * 先例同款）：组 0 树皮 FrontSide / 组 1 叶卡 DoubleSide，叶卡固有 attribute
 * aLeafRand / aBend + 实例 aSeed；组 0 aLeafRand/aBend 恒 0。
 *
 * 【与几何侧的冻结接口（主代理简报冻结，不得偏离）】
 *   - 三工厂签名与 ligustrum/fraxinus 等同构：(level: ProceduralLevel =
 *     'high') => THREE.MeshStandardMaterial / MeshDepthMaterial；每次调用全部
 *     new（D17）。三工厂 = 叶 / 皮 / 叶影深度，材质数组序 [皮, 叶]；9 程序键
 *     = 3 工厂 × 3 档。
 *   - 叶卡：v=0 叶基 → v=1 叶尖；u=0.5 中脉；1 卡 = 单叶（几何 2 tri）。
 *     **卡长宽比域 8–18 归几何侧**（Spec §5「狭披针形或线状披针形 9–16 ×
 *     0.5–1.5cm、长宽比文献域 ≈6–32 典型 ≈10–15 照片读 8–12」Verified
 *     [1][3][6]——窄域极端长宽比卡由几何承载，SDF 只管包络沿先例「长宽比归
 *     几何侧」分工，峰行满卡 0.5）。组 1 aLeafRand ∈ (0,1] 同卡同值、aBend
 *     卡根≈0 尖大（**垂索根→尖摆幅放大消费语义**——见风动记档）。
 *   - **无果域**：垂柳柔荑花序先叶开放（花期 3–4 月、果期 4–5 月）不覆盖
 *     9–10 月主语境，记档不建模（待裁决位 2，ligustrum 时窗错位判据直接
 *     适用）——组 0 = 纯皮域，**无 uv 域身份分支**（vs ligustrum/fraxinus/
 *     sophora 两域分支——无果域资产的组织简化记档）。
 *
 * 【狭披针形单叶 SDF——zelkova 卵形-披针路径的窄域极端化改写（待裁决位 5；
 *   单叶系，齿载波回归 zelkova 单频 ALU 法】四处差分（每处与 zelkova 直接
 *   对照——两锯齿单叶系互为近邻对照样本）：
 *   ① 包络：sin(π·v^0.68)——最宽点 v≈0.361（= 0.5^(1/0.68)）狭披针形偏基
 *      （vs zelkova v^0.70→0.371 卵状披针——更偏基更细长读向；Spec §5
 *      「狭披针形或线状披针形」Verified [1][3]）。
 *   ② 基部楔形：包络指数基段 0.88（vs zelkova 0.72 圆形/浅心形、女贞 0.72
 *      圆形-宽楔——「基部楔形」cuneate = 基段收窄快于圆形系；JS 锚：v=0.10
 *      行半宽 0.324 < zelkova 镜像同位 0.341〔基段更窄收的量化面〕）。
 *   ③ 先端长渐尖**变指数域上探**：上半段指数 = 1.85+0.75·fract(rand) ∈
 *      [1.85, 2.60] 逐叶（「先端长渐尖」FRPS/FOC Verified——vs zelkova 固定
 *      1.22 尾状渐尖、ligustrum 1.18–1.60 渐尖域：垂柳域整体上探一档 = 尾
 *      更长更细；起坡 0.34（vs zelkova 0.38）——渐尖自中下段渐起 = 长尾读
 *      向；rand 进 SDF 沿 ligustrum 先端域先例）；JS 锚：v=0.90 行半宽域
 *      [0.009, 0.030] 全段锐于 zelkova 镜像 0.081。
 *   ④ **高频细齿载波**（「锯齿缘、照片近全缘观感、齿极细密」Spec §5
 *      Verified [1][3][4][6] = 高频小幅值单频载波）：2π·13 = 81.68 → 13 齿/
 *      侧（zelkova 10 齿频率上探——「极细密」）pow 2.2 微尖细齿（vs zelkova
 *      2.6 尖头——细齿尖头更弱 = 近全缘观感）；幅度 ±0.022 = 坡宽 0.04 的
 *      55%（fraxinus 细齿同比例口径——小幅值顶格下探）且**包络窄区随叶宽按
 *      比例缩**（amp = min(0.044, 0.72·env)——长渐尖尾区齿幅 ≤ 叶宽比例，
 *      齿谷恒留 0.14·env〔= 半宽的 28%——谷端下探 0.36·env〕中脉带：防尖端齿谷裁穿中脉的断裂碎片，测试数值锚
 *      首跑实证缺陷的修复形态）；端部渐隐 gate smoothstep(0.02,0.10)·(1−
 *      smoothstep(0.94,0.99))——**亚像素齿防碎片**（011.10 顶栏门控斜坡亚像
 *      素齿缘碎片教训：渐隐门内碎片视觉不承重记档，测试以齿纹在场门锚定不
 *      逐门断碎片）；单频零抖动（「近全缘观感」= 规则单频近无齿读向）。
 *      **SDF 零 facVnoise 引用**（齿载波 cos 为 ALU——zelkova 齿载波 + 深度
 *      零噪声组合先例）。
 *   - **无叶基偏斜**（FRPS 原句无偏斜描述——vs zelkova 榆科「稍偏斜」
 *     0.030 漂移：柳属对称叶，零漂移项记档）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - **脉序近零信号**（待裁决位 5——ligustrum 近零脉路径邻档：中脉清晰 +
 *     侧脉羽状近零信号〔「羽状脉，中脉清晰、侧脉羽状、近梢渐弱」Spec §5
 *     Verified [6]，侧脉计数 Unknown 不消费〕）：中脉弱亮带权重 0.12 +
 *     侧脉近零纹 0.03（ligustrum 0.04 更近零一档——「近零侧脉」裁决位口径）
 *     频率 69.1（≈2π·11 对——细长叶统计读向，不承重）；纯 ALU 零采样。
 *   - **叶色黄绿调**（身份色调）：底色 #47782d 中绿-中深绿（工程设定——
 *     FRPS「上面绿色」+ NC "light green above" + 照片「中绿 + 阳面/幼叶黄
 *     绿调」多槽一致 Verified [1][3][4][6]；亮度链：zelkova #3e6c2c < **垂柳**
 *     < triadica #507c34——中绿-中深绿档；G−R = 49 黄绿向中上）；hue 暖端
 *     ×(1.08, 1.05, 0.90)（**暖端黄绿强调**——「阳面/幼叶黄绿调」变奏读向
 *     主导端，通道摆幅 ≤15% 纪律内）+ 明度 ±8% 去相关。
 *   - **两面色差 = 浅绿微银弱档**（待裁决位 9——fraxinus 弱档先例；「下面
 *     浅绿（微银光）」带绿非苍白 Spec §5 Verified [1][3][4][6]——**与旱柳
 *     系「苍白色-带白色」叶背的差分是定名判据**，非苍白不提亮偏冷）：背面
 *     ×(1.06, 1.10, 1.08)（G+0.10 主导浅绿 + B+0.08 微银 + R+0.06 最小——
 *     浅绿微银读向；vs 国槐苍白 ×(1.16,1.18,1.28) / 樟粉 ×(1.06,1.05,1.16)
 *     / 白蜡灰向 ×(1.09,1.11,1.17) 全分化）；两面糙度差 +0.06（弱档——
 *     sophora 同档）。
 *   - roughness 0.60（工程设定——薄细叶半光泽中上档：triadica 0.58 <
 *     **垂柳 0.60** < zelkova 0.62；「两面无毛」光滑面）；metalness 0。
 *   - **背光透射上探 0.44**（待裁决位 9——「背光透光强（细叶发光观感）」
 *     Spec §5/leaf-b 双问 Verified；家族透射值域链上沿试探：女贞 0.21 < 樟
 *     0.22 < 悬 0.28 < 朴 0.30 < 重阳木 0.31 < 白蜡 0.318 < 栾 0.32 < 国槐
 *     0.325 < 乌桕 0.33 < 银杏 0.34 < zelkova 0.40 < **垂柳 0.44** < 夏栎
 *     0.65〔裂叶另档〕——细叶高透高于 zelkova 薄纸质端、低于夏栎裂叶档）
 *     + 透射色 (0.62, 0.93, 0.33) 亮黄绿（细叶背光发光观感——亮于 zelkova
 *     (0.60,0.92,0.34)）+ 逐叶变奏 ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand 多通道复用：色相两端（冷中绿 ↔ 暖黄绿——黄绿调
 *     身份变奏）+ 明度 ±8% + 先端指数（进 SDF）+ 透光变奏（统计近似是家族
 *     契约下的最大表达，缺口候选①）。
 *   - 冠内竖向自遮蔽（冠基 ≈3.0m **nominal 工程锚**——干高占比 ≈0.25–0.35
 *     × ≈10m Spec §3 Inferred [6] 域中值；几何实测涌现后同步轮记缺口候选⑤）
 *     + 中频叶团斑块（High，波长 ≈1/0.90 ≈ 1.11m——垂帘细束纹理读向，频率
 *     0.90 略细于 ligustrum 0.80 团块）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent）；
 *     坡宽 0.04（单叶系沿先例口径）；零贴图零 DataTexture（D13）。
 *   - **垂帘风动两层**（待裁决位 10——悬垂结构特性；GLSL 公式沿先例，数值
 *     记档）：整帘低频摆 **0.92 rad/s ≈ 0.146Hz**（大冠垂帘质量分布摆慢于
 *     先例 1.15 ≈ 0.183Hz）+ 顶部 ~5.2cm（垂帘端梢摆幅大一档——0.052 vs
 *     ligustrum 0.044/zelkova 0.045）+ 垂索**高频低幅颤动 17–26 rad/s ≈
 *     2.7–4.1Hz**（细索弹性高频——频域上探 zelkova 16–25 之上）/ 幅度 9mm
 *     （低幅档——细叶轻摆，vs 11mm 家族中幅档）；**aBend 根→尖权重 = 摆幅
 *     沿索长放大语义**（冻结接口「梢端摆幅大」——卡根≈0 尖大天然承载垂索
 *     悬臂放大读向）；hash 常数 98.127/76.317 与十一先例（sway 77.669–
 *     96.441 / flutter 49.337–73.521）去相关——新值在两域外上侧；**树高锚
 *     1/9.8306 = 0.10172**（命名常量 SALIX_TREE_HEIGHT_NOMINAL +
 *     测试锚断言——待裁决位 4 slot-0 ≈10m 生产锚；**同步轮 2026-09-23 已落**：
 *     10.0 初值 → 9.8306（Stage 探针经正式 build() 路径 slot-0 High 涌现实测，
 *     ligustrum 8.0→8.4064 同款流程））。
 *
 * 皮（组 0）配方——**第 13 树皮语言「暗灰黑基（灰黑-近黑）+ 波状不规则纵沟
 *   脊 + 沟深、脊浅褐 vs 沟近黑强对比 + 修剪残桩点缀 + 皮孔不显」**（待裁决
 *   位 7；vs 十二先例：近国槐暗色深裂系但更波状不规则——语言谱系独立位；
 *   国槐 6 板状厚脊+瘤突 / 白蜡 8 细脊浅-中纵裂 / 女贞 10 细脊浅沟低浮雕 / 樟
 *   深纵裂 / 栾浅色密麻点）。分化点：①**波状不规则**（裂线游走 drift 1.30
 *   大幅——vs 女贞 0.85 缓游走 / 白蜡 0.80：「波状不规则纵沟脊」bark-a 双问
 *   ——脊列沿干强游走）；②**沟深档**（沟深剖面 0.48——深于樟 0.50/国槐
 *   0.52 全家族最深档；「沟深」Spec §5 Verified）+ 陡坡剖面 smoothstep(0.18,
 *   0.44)（vs 女贞浅宽坡 0.30–0.62）；③**脊浅褐 vs 沟近黑强对比**（双色
 *   系统——vs 先例单色系 + 单 AO：脊面浅褐暖乘 ×(1.14,1.05,0.86) + 沟内近
 *   黑强 AO ×(0.58,0.57,0.56)——脊亮暖褐带 vs 沟暗近黑带的两带强对比是垂
 *   柳皮身份读向）；④**修剪残桩点缀**（「常见修剪残桩与愈疤」bark-a 双问
 *   ——暗色短斑：22×26 格 ALU hash、22% 格有斑、横向短椭圆〔残桩截面读向〕
 *   ×(0.62,0.58,0.55) 暗色，High 专属近景）；⑤**皮孔不显不做**（FRPS/FOC
 *   垂柳条目无皮孔记载——vs ligustrum 皮孔场/白蜡皮孔弱对比点：不记不编造）：
 *   - 主调 #56534d 暗灰-灰黑（工程设定——FRPS「树皮灰黑色，不规则开裂」+
 *     FOC "grayish black" + NC "gray-black with irregular furrows" Verified
 *     [1][3][4] + bark-a「暗灰褐-近黑」双问 [6]；亮度链：**垂柳** < 国槐
 *     #6d675d < 白蜡 #7a746b——暗于国槐一档 = 全家族最暗皮）。
 *   - 竖向脊沟：裂线游走低频场（1× vnoise 复用为单色微变 ±6%——暗灰黑单
 *     色系无剥落无三色带）+ 7 波状纵沟脊/周 + 沟内近黑强 AO + 上部弱化门控
 *     smoothstep(3.4,6.0) → 0.90+0.10（上部大枝弱化——幼干-大枝浅纹读向）。
 *   - 干基暗化弱档（家族惯例 ×(0.90,0.90,0.91) 权重 0.45）。
 *   - **小枝单档**（待裁决位 8——Spec §1/§5「小枝淡褐黄色、淡褐色或带紫色」
 *     单句色域**无龄级两档信号，不做两档**——vs fraxinus/ligustrum 两档先例
 *     的差异记档）：淡褐黄-淡褐带紫端微调 ×(1.24, 1.10, 0.86)（R 主导淡褐
 *     黄 + B 端 0.86 高于白蜡 0.76/女贞 0.74 = 「或带紫色」端微调；高位 ×
 *     小弧长 v 双门控——「细枝管 v 小」几何契约注记）。
 *   - 苔藓/地衣不做（Spec 无记载不承重——不做不编造）；微起伏已归几何层。
 *
 * 深度材质（叶影裁切，customDepthMaterial 契约通道——沿 SOP 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF
 *     alpha 与叶表面材质共享同一 GLSL 字符串 SALIX_LEAF_SDF（表面改叶形深度
 *     自动同步，不复制粘贴）。
 *   - **零噪声库注入**：SDF 零 facVnoise 引用（齿载波 cos 为 ALU 非噪声——
 *     zelkova 齿载波 + 深度零噪声组合先例）。保护性约束：SDF 字符串内不得
 *     引入 facVnoise——引入即深度材质编译暴雷。
 *   - 多材质网格守卫：组 0（皮管）以恒等 attribute（aLeafRand=0）走实心分支
 *     ，防叶形 SDF 在圆柱 uv 域上误裁出洞（triadica 恒等 attribute 先例）。
 *   - 档位匹配：Mid = High SDF 同源全形（含细齿——档间剪影一致）/ Low =
 *     SALIX_LEAF_SDF_LOW 零齿版（**亚像素齿 Low 消去**——zelkova/fraxinus
 *     「Low 去齿」先例 + 011.10 亚像素齿牺牲记档；包络/渐尖与 High 逐字同源）
 *     ；customProgramCacheKey 三档分键。
 *   - 风动不进 depth pass（静态影取舍已裁定——不要自行给深度材质加风动同步
 *     ）。
 *
 * 分档记档（T011.12，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset
 *   build 路由）：
 *   - 叶 Mid：去脉弱层（中脉带/侧脉纹）+ 去叶团 + 糙度叶团项（Spec §7 近距
 *     淡信号——Mid 观距不可辨）；SDF 全形（含细齿）/透光/叶背/hue·luma/
 *     shade/两面糙度差保留（颜色层次档间连续保留面）。
 *   - 叶 Low：SDF 换 SALIX_LEAF_SDF_LOW——**去齿载波**（亚像素齿远距不可辨
 *     牺牲首位 + 防碎片）；包络/楔形基/长渐尖与 High 逐字同源 + 去透光（远距
 *     逆光透射不可辨）；hue·luma/shade/叶背保留；片元零噪声。
 *   - 皮 Mid：去修剪残桩点（近景细节层）；脊沟波状/双色对比/沟内近黑 AO/干
 *     基暗化/小枝单档保留——中距「暗灰黑波状深沟 + 冠缘淡褐黄细枝」身份。
 *   - 皮 Low：再去干基暗化（低调项）；脊沟 + 沟内 AO + 脊浅褐 + 小枝档保留
 *     （远距「暗色深沟强对比剪影」保留面）；1× vnoise。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；salix 前缀不与十二先例
 *     混缓存）：'salix:leaf' / ':mid' / ':low'；'salix:bark' …；
 *     'salix:leaf-depth' …（9 键全异）。
 *   - 风动（SALIX_WIND 同一常量）三档同源不动——档间风相位一致是身份一致
 *     的一部分（D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团）= 3× + SDF 纯 ALU（齿载波 cos + 双 pow
 *     ）≈ 2× + 脉弱层 ALU ≈ 0.5× + 透光/两面/hue ≈ 2× ≈ **7.5×**（与
 *     zelkova 8× 同档——齿载波账）；
 *   - 叶 Mid 片元 = 0× 噪声 + SDF 全形 ALU + 简化 ≈ 4.5×；叶 Low ≈ 2.5×
 *     （单包络去齿）；
 *   - 皮 High 片元 = 1× vnoise（游走场）= 3× + 脊沟/双色/残桩/细枝 ALU ≈
 *     1.5× ≈ **4.5×**（无果域分支——单域最重路径）；皮 Mid ≈ 4.5× / 皮
 *     Low ≈ 4×；
 *   - 深度片元 = SDF 纯 ALU ≈ 2×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——狭披针包络/高频
 *   细齿载波/脊浅褐沟近黑双色/残桩场全部限定文件内）：
 *   ① 先端指数/透光/色相/明度/齿相位共用 aLeafRand 单属性统计近似（多通道
 *      复用同一 rand——变奏间相关性无法表达；家族共有缺口）；
 *   ② 狭披针形单叶 SDF zelkova 路径窄域极端化变体：本文件内实现（单叶齿载
 *      波谱系 zelkova/fraxinus/垂柳三样本——「高频细齿」频率上探首例；公共
 *      模式族级提炼评估归 011.13，沿 koe ②/sophora ②/fraxinus ②）；
 *   ③ 无（无果域——果域轴向契约类缺口天然不存在，vs ligustrum ③/fraxinus ③
 *      同型缺口位在垂柳空缺记档）；
 *   ④ 垂索整体摆动（整条垂索低频甩摆——悬垂索的二阶摆动模态）组 0 aBend≡0
 *      未表达 + 组 1 flutter 为高频颤动层，垂索中低频索形摆动无独立通道
 *      （恰 2 组冻结的连带限制，koe ③/sophora ④/fraxinus ④ 同型；几何侧
 *      索形弯垂已承载静态姿态，材质侧缺动态摆）；
 *   ⑤ 冠基 3.0m 材质侧工程锚 + **树高锚同步轮已落（2026-09-23：10.0 初值 →
 *      9.8306 = Stage 探针经正式 build() 路径 slot-0 High 实测涌现，GLSL 字面量
 *      随 SALIX_WIND_H_SCALE 派生自动同步 0.10172 + 测试锚同步——ligustrum
 *      8.0→8.4064 同款流程）**；冠基 3.0m 锚与 profile 侧无联动通道仍为缺口
 *      （triadica ⑤/sophora ⑤/fraxinus ⑤ 同型家族缺口）；
 *   ⑥ 脊沟/残桩的干龄判别以「高度 × 弧长 v」双门控近似（皮管 v = 累计弧长
 *      契约注记——细枝管 v 小，bischofia ⑥/sophora ⑥/fraxinus ⑥ 同型）；
 *      皮孔不显不做（FRPS 无记载——若族门横向对照发现需要可后续增补）。
 *
 * X4000 口径（011.6 终裁带入 + 简报注记）：单叶系**预期不触发**（无窗列无
 *   复叶分支）；console X4000 警告若出现 = FXC 数据流保守误报预期口径——按
 *   误报记档归 011.13，不逐树变体消元追逐；GLSL 全路径初始化运行零错误为准。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；
 *   零贴图/零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV
 *   普通 Mesh 无该属性，WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除
 *   法无 NaN；与十二先例的通用段（风动公式等）为复制改造非 import（资产私有，
 *   跨资产不耦合——organization.md 边界）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/**
 * 树高锚（T011.12 待裁决位 4：slot-0 ≈10m 生产锚——喷泉冠体量感 + form-a
 * 岸线粗估 10–12m 佐证，8–12m 带中值偏上）。**同步轮已落（2026-09-23）：
 * 10.0 初值 → 9.8306**（Stage 探针经正式 build() 路径 slot-0 High 涌现实测
 * maxY——bbox minY 精确 0；nominal 涌现值三处同步：本常量 + GLSL 字面量
 * （随 SALIX_WIND_H_SCALE 派生自动流入）+ 测试锚断言，ligustrum 8.0→8.4064 /
 * fraxinus 10.4973 同款流程；风动 GLSL 与测试锚同源消费——1/9.8306 = 0.10172）。
 */
export const SALIX_TREE_HEIGHT_NOMINAL = 9.8306;

/** 风动高度权重 = 1/nominal 树高（0.10172——注入 GLSL 字面量；5 位小数 = fraxinus 0.09526 同步轮精度口径） */
const SALIX_WIND_H_SCALE = (1.0 / SALIX_TREE_HEIGHT_NOMINAL).toFixed(5);

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`salix 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 垂帘风动顶点核心：整帘低频摆（aSeed 个体相位）+ 垂索高频低幅颤动（aBend
 * 权重沿索长放大，组 0 恒 0 免颤）。公式方法沿先例验收配方（频率/幅度/风标
 * 为逐树工程调参非物种事实）；数值记档：hash 常数 98.127/76.317（与十一先例
 * 相位流〔sway 77.669–96.441 / flutter 49.337–73.521〕去相关——新值在两域外
 * 上侧）+ **树高锚 9.8306m（×0.10172——SALIX_WIND_H_SCALE 注入；同步轮
 * 2026-09-23 Stage 实测 slot-0 High 涌现值）**；整帘低频摆 0.92 rad/s ≈ 0.146Hz（大冠垂帘
 * 质量分布摆慢于先例 1.15）/ 顶部 ~5.2cm（垂帘端梢摆幅大一档）；垂索颤动
 * 17–26 rad/s（≈2.7–4.1Hz 高频——细索弹性，频域上探 zelkova 16–25 之上）/
 * 9mm 低幅档（细叶轻摆，vs 11mm 家族中幅）。
 */
const SALIX_WIND = /* glsl */ `
// salix wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float slxWindPhase = fract(sin(aSeed * 98.127 + 5.2) * 43758.5453);
float slxWindH = clamp(position.y * ${SALIX_WIND_H_SCALE}, 0.0, 1.0); // /9.8306m 树高锚（同步轮 2026-09-23：Stage 实测 slot-0 High 涌现值；1/9.8306 = 0.10172 命名常量注入）
float slxSway = slxWindH * slxWindH * 0.052 * sin(uTime * 0.92 + slxWindPhase * 6.28318 + slxWindH * 1.4); // 整帘低频摆 ~0.146Hz（大冠垂帘质量摆慢——vs 先例 1.15 ≈ 0.183Hz）+ 顶部 ~5.2cm（垂帘端梢大一档）
// 垂索高频低幅颤动：ω = 17 + 9φ（17–26 rad/s ≈ 2.7–4.1Hz 高频——细索弹性，频域上探 zelkova 16–25 之上），幅度 9mm 低幅档（细叶轻摆）；权重 = aBend（卡根≈0 尖大——摆幅沿索长放大语义匹配「梢端摆幅大」悬垂特性）
float slxFlutterPhase = fract(sin((aSeed + aLeafRand) * 76.317 + 6.1) * 43758.5453);
float slxFlutter = aBend * 0.009 * sin(uTime * (17.0 + 9.0 * slxFlutterPhase) + slxFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (slxSway + slxFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(slxSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * slxFlutter * 0.9; // 叶面沿卡法线微扑（组 0 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const SALIX_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 垂柳单叶覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶尖 1）：zelkova 卵形-披针
 * 路径的窄域极端化改写（待裁决位 5）——狭披针形包络 sin(π·v^0.68)（最宽点
 * v≈0.361 狭披针偏基细长——Spec §5「狭披针形或线状披针形」Verified）× 变指
 * 数收口（基段 0.88 楔形收窄〔「基部楔形」cuneate——窄于圆形系 0.72 档〕→
 * 上半段 1.85+0.75·fract(rand) ∈ [1.85, 2.60] **先端长渐尖逐叶变体域上探**
 * 〔「先端长渐尖」FRPS/FOC Verified——尾长于 zelkova 固定 1.22 / ligustrum
 * 1.18–1.60 一档；起坡 0.34 渐尖自中下段渐起〕）× **高频细齿载波**（2π·13
 * = 81.68 → 13 齿/侧 zelkova 10 频率上探、pow 2.2 微尖细齿、幅度 ±0.022 =
 * 坡宽 55% 小幅值、端部渐隐门控防亚像素碎片——「锯齿缘、照片近全缘观感、
 * 齿极细密」Spec §5 Verified；单频零抖动近全缘读向）× **零偏斜**（柳属对
 * 称叶——vs zelkova 榆科偏斜漂移）；返回近似符号距离的覆盖率坡（edge/0.04
 * ——alphaToCoverage 的 fwidth smoothstep 吃这条坡抗锯边；坡宽 0.04 单叶系
 * 沿先例 AA 口径）。**本函数零 facVnoise 引用是深度材质不挂噪声库的前提
 * （cos 为齿载波 ALU——引入噪声即深度编译暴雷，保护性约束）**。峰行半宽
 * 0.5 满卡——真实长宽比 8–18 由几何卡承载（冻结接口分工）。
 */
const SALIX_LEAF_SDF = /* glsl */ `
float slxLeafAlpha(vec2 slxUv, float slxRand) {
  vec2 slxP = vec2(slxUv.x - 0.5, slxUv.y); // 无偏斜漂移项（柳属对称叶——vs zelkova 榆科 0.030 基部偏斜）
  float slxEnvSin = sin(3.14159 * pow(clamp(slxP.y, 0.001, 0.999), 0.68)); // v^0.68：最宽点 v≈0.361（狭披针形偏基细长——vs zelkova v^0.70→0.371 卵状披针）
  float slxApex = 1.85 + 0.75 * fract(slxRand * 5.713 + 0.37); // 先端长渐尖变指数逐叶 [1.85, 2.60]（「先端长渐尖」Verified——域上探 zelkova 固定 1.22 / ligustrum 1.18–1.60 一档；rand 进 SDF 记档）
  float slxEnv = pow(slxEnvSin, mix(0.88, slxApex, smoothstep(0.34, 0.92, slxP.y))); // 基部楔形 0.88（窄收于圆形系 0.72）→ 先端长渐尖（起坡 0.34 中下段渐起——长尾读向）
  // 高频细齿：2π·13 ≈ 13 齿/侧（zelkova 10 频率上探——「齿极细密」），pow 2.2 微尖细齿（近全缘观感），逐叶 -rand·2π 相位错开
  float slxTooth = pow(0.5 + 0.5 * cos(slxP.y * 81.68 - slxRand * 6.28), 2.2);
  // 端部亚叶缘渐隐（防 AA 边噪声 + 亚像素齿碎片——011.10 顶栏门控斜坡教训口径：渐隐门内碎片视觉不承重记档）
  float slxGate = smoothstep(0.02, 0.10, slxP.y) * (1.0 - smoothstep(0.94, 0.99, slxP.y));
  // 幅度 ±0.022 满幅 = 坡宽 0.04 的 55%（小幅值防碎片——fraxinus 细齿同比例口径）；**包络窄区（长渐尖尾）
  // 齿幅随叶宽按比例缩**：amp = min(0.044, 0.72·env) → 齿谷恒留 0.14·env（= 半宽的 28%——谷端下探 0.36·env）中脉带（env < 0.061 即 hw < 0.031
  // 的先端尾区齿随叶宽缩——真实柳叶叶尖齿缩小读向 + 防尖端齿谷裁穿中脉的断裂碎片：测试数值锚 R=0.13
  // 首跑实证触发该缺陷后的修复形态）
  float slxSerr = (slxTooth - 0.5) * min(0.044, 0.72 * slxEnv) * slxGate;
  float slxEdge = 0.5 * slxEnv + slxSerr - abs(slxP.x);
  return clamp(slxEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.04（单叶系沿先例 AA 口径）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按
 * 档取用）：狭披针形包络 + 楔形基 + 长渐尖收口即可——**去齿载波**（亚像素
 * 齿远距不可辨牺牲首位 + 防碎片——zelkova/fraxinus「Low 去齿」先例 + 011.10
 * 亚像素齿记档；片元零噪声先天成立）。包络/收口与 High 版逐字同源（档间叶
 * 形身份一致的去细节不改形原则，沿 zelkova SDF_LOW 体例）。
 */
const SALIX_LEAF_SDF_LOW = /* glsl */ `
float slxLeafAlpha(vec2 slxUv, float slxRand) {
  vec2 slxP = vec2(slxUv.x - 0.5, slxUv.y); // 无偏斜（与 High 逐字同源）
  float slxEnvSin = sin(3.14159 * pow(clamp(slxP.y, 0.001, 0.999), 0.68)); // v^0.68 包络（与 High 逐字同源）
  float slxApex = 1.85 + 0.75 * fract(slxRand * 5.713 + 0.37); // 先端变指数（与 High 逐字同源——rand Low 同样消费：先端域逐叶变体档间一致，双参签名沿家族契约）
  float slxEnv = pow(slxEnvSin, mix(0.88, slxApex, smoothstep(0.34, 0.92, slxP.y)));
  float slxEdge = 0.5 * slxEnv - abs(slxP.x); // 去齿载波（亚像素齿 Low 消去）
  return clamp(slxEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/脉弱层——叶团乘子 0.94+0.12×slxClump 均值化 = 1.0 消去，值噪声
 *  均值 0.5 精确保均）。 */
const SALIX_LEAF_HEAD = /* glsl */ `
// salix:leaf —— SDF 狭披针细齿叶覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float slxAlpha = slxLeafAlpha(vUv, vLeafRand);
diffuseColor.a = slxAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷中绿 ↔ 暖黄绿——「阳面/幼叶黄绿调」身份变奏主导端；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 slxHue = mix(vec3(0.94, 1.00, 1.04), vec3(1.08, 1.05, 0.90), fract(vLeafRand * 6.913 + 0.21));
float slxLuma = 0.92 + 0.16 * fract(vLeafRand * 4.117 + 0.53);
`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const SALIX_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈1/0.90 ≈ 1.11m——垂帘细束纹理读向，频率 0.90 略细于 ligustrum 0.80 团块；采样偏移与先例去相关）
float slxClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.69, vTreePos.y - vTreePos.z * 0.58) * 0.90 + vec2(41.7, 78.2));
`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const SALIX_LEAF_SHADE = /* glsl */ `
float slxShade = clamp((vTreePos.y - 3.0) / 2.8, 0.0, 1.0); // 冠基 ≈3.0m nominal 工程锚（干高占比 ≈0.25–0.35 × ≈10m 待裁决位 4 Spec §3 Inferred [6] 域中值；几何实测后同步轮记缺口候选⑤）`;

/** High 专属：脉序近零信号（中脉弱亮带 + 侧脉羽状近零纹，纯 ALU 零采样）。
 *  ligustrum 近零脉路径邻档（待裁决位 5——「中脉清晰、侧脉羽状、近梢渐弱」
 *  Spec §5 Verified [6]，侧脉计数 Unknown 不消费）：中脉 0.12 + 侧脉 0.03
 *  （较 ligustrum 0.04 更近零一档——近零侧脉裁决口径）。 */
const SALIX_LEAF_VEIN = /* glsl */ `
// 叶脉近零信号：中脉弱亮带（「中脉清晰」——细叶中脉窄带）+ 侧脉羽状近零纹（频率 ≈2π·11 对——细长叶统计读向不承重；
// 近梢渐弱 = 上端门控收窄；纤细 pow^6 不达缘）；纯 ALU 零采样
vec2 slxP = vec2(vUv.x - 0.5, vUv.y);
float slxVeinMid = 1.0 - smoothstep(0.008, 0.032, abs(slxP.x)); // 中脉弱带（细叶窄带——窄于 ligustrum 0.008–0.034）
float slxVeinLat = pow(max(0.0, sin(slxP.y * 69.1 - abs(slxP.x) * 24.0 + (vLeafRand - 0.5) * 0.6)), 6.0)
  * (1.0 - slxVeinMid) * smoothstep(0.12, 0.26, slxP.y) * (1.0 - smoothstep(0.68, 0.86, slxP.y));
`;

/** High 专属：合成（叶团乘子 + 脉弱层调制——近零权重 0.12/0.03） */
const SALIX_LEAF_MUL_HIGH = /* glsl */ `
vec3 slxMul = slxHue * slxLuma * (0.80 + 0.20 * slxShade) * (0.94 + 0.12 * slxClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
slxMul = mix(slxMul, slxMul * vec3(1.42, 1.36, 1.04), slxVeinMid * 0.12 + slxVeinLat * 0.03); // 脉近零信号（中脉清晰弱亮 + 侧脉近零纹——「羽状脉中脉清晰侧脉近零」裁决位 5）
diffuseColor.rgb *= slxMul;
`;

/** Mid/Low：合成（去叶团/脉弱层——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const SALIX_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 slxMul = slxHue * slxLuma * (0.80 + 0.20 * slxShade); // Mid/Low：叶团乘子均值化消去（T011.12）
diffuseColor.rgb *= slxMul;
`;

/** 叶背浅绿微银（三档共用，纯 ALU 零采样零分支）——弱色差档（待裁决位 9） */
const SALIX_LEAF_BACK = /* glsl */ `
// 叶背浅绿微银（**弱色差档**——「下面浅绿（微银光）」带绿非苍白 Spec §5 Verified：
// 与旱柳系「苍白色-带白色」叶背的差分是定名判据——非苍白不提亮偏冷）：
// gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，背面法线由 three
// 双面光照自动翻转，此处只调固有色）——背面 ×(1.06, 1.10, 1.08)（G+0.10 主导
// 浅绿 + B+0.08 微银 + R+0.06 最小 = 浅绿微银读向；vs 国槐苍白 ×(1.16,1.18,
// 1.28) / 樟粉 ×(1.06,1.05,1.16) / 白蜡灰向 ×(1.09,1.11,1.17) 全分化——幅度
// 弱档）；两面糙度差 +0.06（sophora 同档弱档——「两面无毛」光滑面弱分化）
diffuseColor.rgb *= mix(vec3(1.06, 1.10, 1.08), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  **家族值域链上沿试探**（待裁决位 9——「背光透光强（细叶发光观感）」Spec
 *  §5/leaf-b 双问 Verified）：女贞 0.21 < 樟 0.22 < 悬 0.28 < 朴 0.30 < 重阳木
 *  0.31 < 白蜡 0.318 < 栾 0.32 < 国槐 0.325 < 乌桕 0.33 < 银杏 0.34 < zelkova
 *  0.40 < **垂柳 0.44** < 夏栎 0.65〔裂叶另档〕——细叶高透高于 zelkova 薄纸
 *  质端、低于夏栎裂叶档。 */
const SALIX_LEAF_TRANSLUCENCY = /* glsl */ `
// salix:leaf —— 背光透射（家族值域链上沿试探）：视线与阳光反向时叶背透亮黄绿（叶绿素
// 吸收红蓝 → 透射偏黄绿；细叶高透发光观感——峰值 0.44 vs zelkova 0.40 / 银杏 0.34 /
// 夏栎 0.65〔裂叶另档〕，Spec §5 Verified）
#if NUM_DIR_LIGHTS > 0
  float slxBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float slxTransVar = 0.55 + 0.45 * fract(vLeafRand * 8.517 + 0.39); // 逐叶透光强度变奏
  outgoingLight += vec3(0.62, 0.93, 0.33) * directionalLights[0].color
    * pow(slxBack, 3.0) * slxTransVar * slxAlpha * 0.44;
#endif
`;

// ── 组 0（纯皮域——无果域）配方主体（<map_fragment> 后注入）──────────────────

/** 皮域：裂线游走大幅波状 + 7 纵沟脊 + 沟深陡坡 + 上部弱化（三档共用——Low 保留面的唯一采样：裂线游走） */
const SALIX_BARK_WARP = /* glsl */ `
// 裂线游走低频场（1× vnoise 复用为单色微变 ±6%——「树皮灰黑色」暗灰黑单色系无剥落无三色带；
// drift 1.30 大幅游走 =「波状不规则纵沟脊」bark-a 双问〔vs 女贞 0.85 缓游走 / 白蜡 0.80 纵为主〕）
float slxWarp = facVnoise(vec2(vUv.x * 2.2, vUv.y * 1.30) + vec2(67.8, 24.3));
// 7 波状纵沟脊/周（vs 国槐 6 板状厚脊 / 白蜡 8 细脊——独立位；波状读向由 drift 1.30 承载）
float slxTri = abs(fract(vUv.x * 7.0 + slxWarp * 1.30) * 2.0 - 1.0);
float slxPlate = smoothstep(0.18, 0.44, slxTri); // 陡坡剖面（沟深——vs 女贞浅宽坡 0.30–0.62 / 国槐窄深 0.16–0.42）
float slxRidge = mix(0.48 + 0.52 * slxPlate, 0.90 + 0.10 * slxPlate, smoothstep(3.4, 6.0, vTreePos.y)); // 沟深 0.48 全家族最深档（vs 樟 0.50/国槐 0.52——「沟深」）+ 上部大枝弱化
`;

/** 干基暗化弱档（High/Mid 共用——低调项，Low 随段去） */
const SALIX_BARK_BASEDARK = /* glsl */ `
float slxBarkBase = 1.0 - smoothstep(0.5, 2.4, vTreePos.y); // 干基暗带门控（家族惯例——老干渐深读向，弱档权重）`;

/** 小枝单档门控（三档共用——结构剪影项；高位 × 小弧长 v 双门控——「细枝管 v 小」几何契约注记） */
const SALIX_BARK_TWIG = /* glsl */ `
// 小枝段门控（单档——Spec 单句色域无龄级两档信号，不做两档：vs fraxinus/ligustrum 两档先例差异记档）
float slxTwig = smoothstep(5.8, 7.6, vTreePos.y) * (1.0 - smoothstep(0.45, 0.95, vUv.y));
`;

/** 修剪残桩场（High 专属近景——ALU 网格 hash；暗色短斑点缀——「常见修剪残桩与愈疤」bark-a 双问） */
const SALIX_BARK_STUMP = /* glsl */ `
// 修剪残桩暗色短斑（bark-a「修剪残桩与愈疤」双问——公园修剪痕迹读向）：22×26 格 hash 抖动、
// 22% 格有斑（step 0.78 稀疏门——「点缀」）、横向短椭圆（x 拉宽 y 压扁——残桩截面横向读向）、
// ×(0.62,0.58,0.55) 暗色（愈疤暗斑）
vec2 slxSt = vec2(vUv.x * 22.0, vUv.y * 26.0);
vec2 slxSId = floor(slxSt);
float slxSR = fract(sin(dot(slxSId, vec2(127.1, 311.7)) + 57.9) * 43758.5453);
vec2 slxSF = fract(slxSt) - 0.5 - (vec2(fract(slxSR * 8.31), fract(slxSR * 3.77)) - 0.5) * 0.42;
float slxSRad = 0.10 + 0.05 * fract(slxSR * 9.71);
float slxStump = (1.0 - smoothstep(slxSRad * 0.5, slxSRad, length(vec2(slxSF.x * 1.3, slxSF.y * 0.7))))
  * step(0.78, slxSR); // 赋值域变量（跨 include 供 roughness 消费——map 注入段平铺 main 顶层无块包裹， zelkova 同款）
`;

/** High：合成（基底暗灰黑微变 + 脊浅褐沟近黑双色强对比 + 沟内近黑强 AO + 干基暗化 + 小枝单档 + 残桩暗斑） */
const SALIX_BARK_MUL = /* glsl */ `
vec3 slxBarkMul = vec3(slxRidge) * (0.92 + 0.12 * slxWarp); // 基底暗灰黑单色微变 ±6%（「树皮灰黑色」FRPS Verified——暗灰黑单色系；vec3(slxRidge) 显式广播——011.8 编译事故修复形态）
slxBarkMul *= mix(vec3(1.0), vec3(1.14, 1.05, 0.86), smoothstep(0.30, 0.70, slxTri)); // 脊面浅褐暖乘（「脊浅褐」——脊亮带暖褐读向，双色对比的亮端）
slxBarkMul *= mix(vec3(0.58, 0.57, 0.56), vec3(1.0), smoothstep(0.10, 0.52, slxTri)); // 沟内近黑强 AO（「沟近黑」——深沟暗底，双色对比的暗端；vs 国槐沟内冷中性弱档 ×0.7x 强一档）
slxBarkMul *= mix(vec3(1.0), vec3(0.90, 0.90, 0.91), slxBarkBase * 0.45); // 干基暗化弱档（老干渐深读向——家族惯例低调项）
slxBarkMul = mix(slxBarkMul, slxBarkMul * vec3(1.24, 1.10, 0.86), slxTwig * 0.75); // 小枝淡褐黄-淡褐带紫端单档（FRPS「淡褐黄色、淡褐色或带紫色」——R 主导淡褐黄 + B 端 0.86 高于白蜡 0.76/女贞 0.74 = 「带紫色」端微调）
slxBarkMul *= mix(vec3(1.0), vec3(0.62, 0.58, 0.55), slxStump * 0.8); // 修剪残桩暗色短斑点缀
diffuseColor.rgb *= slxBarkMul;
`;

/** Mid：合成（去残桩点——近景细节层；脊沟波状/双色对比/沟内近黑 AO/干基暗化/小枝单档保留） */
const SALIX_BARK_MUL_MID = /* glsl */ `
vec3 slxBarkMul = vec3(slxRidge) * (0.92 + 0.12 * slxWarp); // 基底暗灰黑微变保留（中距「暗灰黑波状深沟」色块身份）
slxBarkMul *= mix(vec3(1.0), vec3(1.14, 1.05, 0.86), smoothstep(0.30, 0.70, slxTri)); // 脊浅褐保留（双色对比中距读向）
slxBarkMul *= mix(vec3(0.58, 0.57, 0.56), vec3(1.0), smoothstep(0.10, 0.52, slxTri)); // 沟内近黑 AO 保留
slxBarkMul *= mix(vec3(1.0), vec3(0.90, 0.90, 0.91), slxBarkBase * 0.45); // 干基暗化保留
slxBarkMul = mix(slxBarkMul, slxBarkMul * vec3(1.24, 1.10, 0.86), slxTwig * 0.75); // 小枝淡褐黄档保留（冠缘淡褐黄细枝中距读向）
diffuseColor.rgb *= slxBarkMul;
`;

/** Low：合成（再去干基暗化——低调项；脊沟 + 沟内 AO + 脊浅褐 + 小枝档保留——远距「暗色深沟强对比剪影」保留面） */
const SALIX_BARK_MUL_LOW = /* glsl */ `
vec3 slxBarkMul = vec3(slxRidge) * (0.92 + 0.12 * slxWarp); // 脊沟深档基底（远距「暗灰黑波状深沟」剪影保留面）
slxBarkMul *= mix(vec3(1.0), vec3(1.14, 1.05, 0.86), smoothstep(0.30, 0.70, slxTri)); // 脊浅褐（强对比剪影两带——远距保留）
slxBarkMul *= mix(vec3(0.58, 0.57, 0.56), vec3(1.0), smoothstep(0.10, 0.52, slxTri)); // 沟内近黑 AO（两带剪影）
slxBarkMul = mix(slxBarkMul, slxBarkMul * vec3(1.24, 1.10, 0.86), slxTwig * 0.75); // 小枝淡褐黄档（结构剪影项三档保留）
diffuseColor.rgb *= slxBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 狭披针细齿叶 alphaTest 裁切 + 脉弱层（High）+ 两面
 * 浅绿微银弱差 + 家族值域链上沿透光 + 逐叶变奏 + 垂帘风动。level 分档
 * （T011.12，缺省 'high'）：Mid 去脉弱层/叶团/糙度叶团项（Spec §7 近距淡
 * 信号——Mid 观距不可辨），SDF 全形（含细齿）/透光/叶背/hue·luma/shade/两面
 * 糙度差保留；Low 换 SALIX_LEAF_SDF_LOW（去齿载波——亚像素齿远距牺牲 + 防
 * 碎片；包络/楔形基/长渐尖与 High 逐字同源）+ 去透光（远距逆光透射不可辨）
 * ，片元零噪声采样。风动三档同源不动（SALIX_WIND 同一常量——档间风相位
 * 一致 = 身份一致）。
 * 底参：中绿-中深绿 #47782d（工程设定——FRPS「上面绿色」+ NC "light green
 * above" + 照片中绿黄绿调多槽交叉；亮度链 zelkova < **垂柳** < triadica——
 * 中绿-中深绿档、G−R=49 黄绿向中上）/ m 0 / r 0.60（薄细叶半光泽中上档——
 * triadica 0.58 与 zelkova 0.62 之间；「两面无毛」光滑面）/ DoubleSide（卡面
 * 双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createSalixLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x47782d, // 中绿-中深绿黄绿向（工程设定：FRPS「上面绿色」[1] + NC light green above [4] + 照片中绿+黄绿调 [6] 交叉——阳面黄绿调由 hue 暖端变奏承载）
    metalness: 0,
    roughness: 0.60, // 薄细叶半光泽中上档（工程设定——triadica 0.58 < 0.60 < zelkova 0.62；「两面无毛」光滑面）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? SALIX_LEAF_SDF_LOW : SALIX_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含细齿）
  const leafBody = level === 'high'
    ? SALIX_LEAF_HEAD + SALIX_LEAF_CLUMP + SALIX_LEAF_SHADE + SALIX_LEAF_VEIN + SALIX_LEAF_MUL_HIGH + SALIX_LEAF_BACK
    : SALIX_LEAF_HEAD + SALIX_LEAF_SHADE + SALIX_LEAF_MUL_SIMPLE + SALIX_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (slxClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.06, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.06, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面糙度差保留）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${SALIX_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${SALIX_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${leafSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${leafBody}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${leafRoughness}`,
    );
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${SALIX_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `salix:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（**纯皮域——无果域无 uv 域分支**，垂柳柔荑花序生长季不可见记档
 * 不建模）：第 13 树皮语言「暗灰黑基（灰黑-近黑）+ 波状不规则纵沟脊 + 沟深、
 * 脊浅褐 vs 沟近黑强对比 + 修剪残桩点缀 + 皮孔不显」（7 波状纵沟脊〔drift
 * 1.30 大幅游走〕+ 沟深 0.48 全家族最深档陡坡剖面 + 脊浅褐暖乘 ×(1.14,
 * 1.05,0.86) vs 沟内近黑强 AO ×(0.58,0.57,0.56) 双色强对比 + 上部弱化门控
 * + 干基暗化弱档 + 小枝淡褐黄带紫端**单档** + 修剪残桩暗色短斑【High】）
 * 。level 分档（T011.12，缺省 'high'）：Mid 去残桩点（近景细节层），脊沟
 * 波状/双色对比/沟内 AO/干基暗化/小枝档全保留——中距「暗灰黑波状深沟 +
 * 冠缘淡褐黄细枝」身份（Spec §7 中距保留面）；Low 再去干基暗化（低调项）
 * ，脊沟 + 沟内 AO + 脊浅褐 + 小枝档保留（远距「暗色深沟强对比剪影」保留
 * 面），1× vnoise。风动 = 整帘低频摆与叶同公式同相位（aBend 恒 0 垂索颤动
 * 层天然不作用——垂索整体摆动归缺口候选④）。
 * 底参：暗灰-灰黑主调 #56534d（工程设定——FRPS「树皮灰黑色」+ FOC
 * "grayish black" + NC "gray-black" Verified [1][3][4] + bark-a「暗灰褐-近黑」
 * 双问 [6]；亮度链：**垂柳** < 国槐 #6d675d——全家族最暗皮）/ m 0 / r 0.93
 * （深沟深裂族高糙哑光——国槐 0.93 同档）/ FrontSide（皮管闭合实体）。
 */
export function createSalixBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x56534d, // 暗灰-灰黑（工程设定：FRPS 灰黑 [1] + FOC/NC gray(ish) black [3][4] + bark-a「暗灰褐-近黑」[6] 交叉——暗于国槐一档，全家族最暗皮）
    metalness: 0,
    roughness: 0.93, // 深沟深裂族高糙哑光（国槐 0.93 同档）
    side: THREE.FrontSide, // 皮管闭合实体（无果域——无第二域分支）
  });
  material.defines = { USE_UV: '' }; // 脊沟域 = 皮圆柱 uv（u=环绕一周、v=累计弧长）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? SALIX_BARK_WARP + SALIX_BARK_BASEDARK + SALIX_BARK_TWIG + SALIX_BARK_STUMP + SALIX_BARK_MUL
    : level === 'mid'
      ? SALIX_BARK_WARP + SALIX_BARK_BASEDARK + SALIX_BARK_TWIG + SALIX_BARK_MUL_MID
      : SALIX_BARK_WARP + SALIX_BARK_TWIG + SALIX_BARK_MUL_LOW;
  const barkRoughness = level === 'high'
    ? 'roughnessFactor = clamp(0.93 + (slxWarp - 0.5) * 0.04 - slxStump * 0.05, 0.05, 1.0); // 残桩愈疤截面微糙（暗斑带糙度差）'
    : 'roughnessFactor = 0.93; // Mid/Low：高糙哑光基底（残桩糙度项随段去）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${SALIX_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${SALIX_WIND}`,
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
${barkBody}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${barkRoughness}`,
    );
  };
  material.customProgramCacheKey = () => `salix:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF
 * （同源全形含细齿——档间剪影一致）；Low = SALIX_LEAF_SDF_LOW（表面/影档内
 * 一致——去齿版，亚像素齿影读向无意义）。**深度片元不挂噪声库**——SDF 零
 * facVnoise 引用（齿载波 cos 为 ALU 非噪声——zelkova 组合先例；SDF 内引入
 * 噪声即编译暴雷——保护性约束）。
 * 组 0 守卫：皮域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度
 * 材质时组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例）。风动位移不进
 * depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap 按主材质
 * DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap 按主
 * 材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createSalixLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  const leafSdf = level === 'low' ? SALIX_LEAF_SDF_LOW : SALIX_LEAF_SDF; // Mid 深度 = High SDF（同源全形含细齿）
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
${leafSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, slxLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱 uv 域不误裁）`,
    );
  };
  material.customProgramCacheKey = () => `salix:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
