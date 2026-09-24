/**
 * runtime/procedural/tree/koelreuteria/koelreuteriaMaterials —— 栾树（复羽叶栾树
 * Koelreuteria bipinnata，asset_tree_koelreuteria）叶/皮（含花果域）/叶影深度材质
 * （T011.6，阔叶族第七材质实例——**复叶首例 + 夏花秋果双信号首例**）。
 *
 * 职责：复制六先例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：replaceOnce
 * 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 * <color_fragment> 绝不触碰），物种配方按栾树自己的 Reference Spec 换装——
 * Spec docs/research/koelreuteria-reference.md **1.0**（任务书锚点 1.0，开工前已校验
 * 一致；生产一律以文末「终审记档」④ 生产口径终版 + 「主代理补充证据记档」为准：
 * ①复叶计数域 = 羽片 4–5(–6) 对 × 每羽片小叶 5–7(–9) 枚（终审裁决 2，替代「小叶
 * 9–17 全叶总数」存疑口径）；②树皮 = 主代理补充证据终版「浅色光滑（灰白-灰褐粉
 * 质感）+ 密布深色皮孔麻点（1–3mm 圆点/短条、高密度）+ 局部浅细纵裂 + 无剥落、
 * 单色调」——第 7 树皮语言（bark-b 双系统一致 + FRPS「皮孔圆形至椭圆形」「枝具
 * 小疣点」Verified 原句的枝侧描述向干侧推广）；③花 = 金黄-橙黄团块 + 瓣基橙红点
 * 近景细节层（裁决 3）；④果 = 鲑粉-玫红多色并存（色序 绿→黄绿/乳白→鲑粉→玫红→
 * 褐 统计分档、主相鲑粉-玫红主导）+ 膜质网纹半透光质感）。
 *
 * 【与几何侧的冻结接口（主代理简报冻结，不得偏离）】
 *   - 三工厂签名与 zelkova/ginkgo/platanus 同构：(level: ProceduralLevel = 'high')
 *     => THREE.MeshStandardMaterial / MeshDepthMaterial；每次调用全部 new（D17）。
 *   - 恰两组语义：组 0 = 皮+花+果（本文件 createKoelreuteriaBarkMaterial 一材质
 *     分支三域）、组 1 = 复叶卡（createKoelreuteriaLeafMaterial）。
 *   - uv 域身份标记（几何侧冻结）：皮管弧长 v ≤ ≈2.9（profile 探针断言）；花卡
 *     v∈[5,6]（u∈[0,1) 花序相位变奏）；果 v∈[6,7]（u∈[0,1) 果色档随机）。材质侧
 *     域判据阈值 4.5 / 6.0（花果域与皮弧长域三重隔离——platanus v∈[2,3] 碰撞教训）。
 *   - 复叶卡：1 卡 = 整枚二回羽叶（几何 2 tri 四边形、宽/长比 **0.60 冻结**、羽叶
 *     长轴沿 v）；花卡宽/长比 **0.65 冻结**（每花序一对交叉竖卡）。
 *   - 顶点属性：aLeafRand/aBend 组 0（含花果）恒 0（几何侧契约——花果刚性，下垂
 *     摆动未表达归缺口候选③）；组 1 叶卡 aLeafRand ∈ (0,1]、aBend 卡根≈0 尖大。
 *
 * 【复叶 SDF——二回结构沿轴表达法（本任务核心新路径，限定文件内最小扩展）】
 *   家族前六例叶卡全部「单叶卡」（连续轮廓 + 边缘扰动：锯齿/掌状裂/顶缺刻）；复叶
 *   的结构信息是「小叶多枚沿轴排布」——离散重复 + 两级嵌套，不是边缘扰动，无法由
 *   任何单叶 SDF 变体表达。新路径 = **两级窗列 lift 折叠法**：
 *   ① 卡空间折算：物理横坐标 x = (u-0.5)·0.60（长为单位 1、半宽 0.30——宽/长比
 *     0.60 冻结接口）；v 沿主轴（0 基部 → 1 先端）。
 *   ② 全叶包络（第一层减法域）：0.30·pow(sin(π·v^0.80), mix(0.78,1.18,·))——阔卵-
 *     长卵整体剪影（峰 v≈0.42 偏中下：二回羽叶中下部最宽的真实观感；上段 1.18
 *     收口 = 先端渐尖 + 顶生小叶读向）。数值锚：包络最宽半宽恰达卡缘 0.300（卡
 *     利用率满、无外溢）。
 *   ③ 主轴窗列（二回第一级——羽片带）：把点 (x,y) 沿羽片上举角折算回「水平带列」
 *     帧：yb = y − 0.155 − |x|·0.78（tan 38° 上举——羽片自主轴斜上外伸，窗列随之
 *     倾斜 → 羽片间的缺口自动成 V 形张开 = 羽状复叶的「羽」读向）；右侧带列再降
 *     0.014 = 近对生（「羽片沿主轴近对生」照片读向 leaf-a，对生-近对生主力相）。
 *     带 = floor(yb/space+0.5) 最近带；间距 space = 0.145+0.028·rand ∈ [0.145,
 *     0.173] → 落在有效高度带内的带数 **4–6 对**（JS 数值锚扫描断言——生产口径
 *     「羽片 4–5(–6) 对」的统计实现；间距逐卡 rand 变奏）。
 *   ④ 小叶窗列（二回第二级）：沿羽片轴 a=|x| 重复小叶：s = a·freq + per-band 相位
 *     （freq = 21+6·rand → 周期 0.037–0.048）；小叶凸包 lob = sin(π·fract(s))^1.6
 *     （fr=0/1 谷 = 小叶间隙裁穿）；互生侧偏 c = ±0.40·len·(0.30+0.70·lob)（j 奇
 *     偶交替 = 互生「很少对生」FRPS Verified [2][4]；侧偏同时给出斜卵形「基部偏
 *     斜」的简化表达——叶片向一侧倾斜，brief 允许简化）；小叶半长 len = clamp
 *     (0.20·rem, 0.012, 0.046)（rem = 距包络余量 → 小叶向羽片先端渐小、羽片自然
 *     收尖）。数值自洽锚：每羽片小叶数（沿带中心行 |l|=0.02 上下两侧 run 扫描）
 *     **5–7 枚**（JS 镜像断言 rand 三点 6/7/7——生产口径「每羽片 5–7(–9) 枚」）；
 *     小叶长宽比 = 1.4·len·freq ≈ 1.3（Spec 1.7–2.0 的简化表达——卡分辨率下可读
 *     优先，记档）。
 *   ⑤ 羽轴细线 rachilla：|l| < 0.006−0.003·(a/0.30) 渐细——小叶间隙的连线（羽片的
 *     「轴」读向；去掉则小叶成孤立点列，中距羽片剪影散架）。
 *   ⑥ 主轴 rachis：|x| < 0.013·(1−0.5v) 渐细（工程放大：真实 rachis ≈3–4mm 在卡
 *     分辨率下不可读——JS 锚断言 x=0 处 alpha ≥0.5 全 v 连续，主轴永不裁穿）。
 *   ⑦ 缘相分型（生产口径冻结）：全缘主力 ~70% / 内弯细锯齿变体 ~30%——aLeafRand
 *     统计分档 step(0.70, fract(rand·6.113+0.37))；细齿 = 小叶边缘 ±0.005 微锯齿
 *     载波（cos((l−c)·620 + j 相位) ≈5 齿/小叶缘——真实齿 ~1mm 在卡上亚像素，
 *     Spec §7 牺牲顺序首位项，微幅统计近似记档；70/30 实测 29.4% JS 锚）。
 *   ⑧ 羽片基部 bare 门控 smoothstep(0.08,0.13,v)：第一对羽片以下 = 裸叶柄+叶轴
 *     （band −1 幻影带压灭——二回羽叶基部无小叶的真实结构）。
 *   合成：edge = max(rachis, min(包络, 羽片))——主轴恒连、羽片在包络内开窗、包络
 *   外恒裁。全 ALU 零噪声（floor/fract/pow/cos——深度材质同源不挂噪声库的前提）。
 *   ⑨ FXC 数据流拆分（011.6 收尾门校准·形态 A，2026-09-21）：两级窗列 + 羽轴/小叶
 *     边/锯齿/bare 整体封装为子函数 koePinna(koeX, koeY, koeEnv, koeRand)→float
 *     （单返回零 out 参——out 参为 X4000 已知触发形态），koeLeafAlpha 主函数体随
 *     之最小化（消元矩阵 P17/P23 实证：两级窗列的内联复杂度触发 FXC 保守误报，
 *     GLSL 语义全路径初始化、运行零错误）；**数学逐位等价**——表达式树与求值顺序
 *     零变化、纯函数调用引用透明；窗列变量段 KOE_PINNA_VARS 由 SDF 子函数与叶脉
 *     装饰层共享展开（单一来源纪律保持）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - 小叶羽状脉（中脉+侧脉读向，中距弱表达——任务简报口径）：每小叶中脉亮带
 *     （小叶中点窗 |fr−0.5| + 半长渐隐）权重 0.30 + 侧脉对角读向 0.15（弱层——
 *     NC "leaflets ovate with pinnate venation" [9]；近景小叶级细节，弱表达不承重）。
 *   - 两面区分（Spec §2 FRPS「上面中脉上被微柔毛，**下面密被短柔毛**」Verified
 *     [2][4] + §5 两面有色差 Inferred）：底色 #527d37 中绿偏深（工程设定——正面
 *     中绿（偏深）照片 leaf-a 深绿读向 [12]；六树亮度链：银杏 > 朴树 > 悬铃木 >
 *     **栾树** > 夏栎 > 榉 > 樟——中绿偏深档）；背面 ×(1.09, 1.10, 1.13) 浅绿-灰绿
 *     （B 抬高于 R/G = 灰向——柔毛灰绿读向；vs 香樟 ×(1.06,1.05,1.16) 强粉感 /
 *     悬铃木 ×(1.08,1.10,1.02) 无粉感——栾树居中偏灰）；两面糙度差 +0.08（密短
 *     柔毛背面糙于悬铃木近无毛的 +0.06）。
 *   - 叶面哑光（纸质叶——FRPS「纸质或近革质」Verified [2][4] 取纸质端）：roughness
 *     0.70（悬铃木厚实挺括 0.66 < 0.70 < 朴树近革质 0.72——纸质中庸）。
 *   - 背光透光中等（纸质叶中等透光——家族档位中庸，任务简报口径）：峰值 0.32
 *     （悬铃木厚叶 0.28 < 0.32 < 银杏纸质 0.34——家族透光链中庸档）+ 透射色
 *     (0.55,0.90,0.35) 黄绿基调；逐叶变奏 ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand：色相两端冷中绿↔暖黄绿（通道摆幅 ≤15% 纪律）+ 明度 ±8%
 *     （去相关取样）+ 缘相 70/30 + 羽片间距 + 小叶频 + 透光变奏（多通道复用同一
 *     rand——aLeafRand 单属性的统计近似是家族契约下的最大表达，复叶分型归几何侧
 *     ——契约缺口候选①）。
 *   - 冠内竖向自遮蔽（冠基 ≈1.906m——Stage 代理 slot-0 精确涌现实测〔T009.3 视觉
 *     冠底质心口径，2026-09-21 同步〕；渐入带宽 2.6m 按冠深等比重推导：2.8×7.948/
 *     8.67——旧 3.2m×11.87m 工程中值推算读数作废）+ 中频叶团斑块（High，波长 ≈0.85m
 *     ≈ 团块 1/8–1/15 冠幅——大羽叶层叠复合质感 Spec §3 Inferred [12]）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage；坡宽 0.02（复叶小叶间隙级结构——
 *     比单叶先例 0.04 细一档，alphaToCoverage 承担 AA）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值记档）：整树缓摆 ~0.18Hz / 顶部 ~4.2cm
 *     （aSeed 相位，hash 常数 84.913/61.157 与五先例相位流去相关）+ 复叶卡快颤
 *     9–15 rad/s（≈1.4–2.4Hz 中频）/ ≤11mm（中幅——**参照悬铃木大叶重摆量级下调**
 *     任务简报口径：15mm→11mm、8–14→9–15 rad/s——二回羽叶整体大（45–70cm）但小
 *     叶透风（羽状镂空风阻低），摆锤质量读向下调）；aBend 权重；树高锚 9.854m
 *     （×0.1015——几何侧 slot-0 精确涌现实测〔Stage 代理探针，2026-09-21 同步〕，材质-几何侧同源锚记档）。
 *
 * 皮（组 0）配方（**第七种树皮语言：浅色光滑 + 皮孔麻点 + 局部浅细纵裂——主代理
 *   补充证据终版**，vs 六先例：夏栎/樟/银杏深纵裂脊沟族、朴树平滑-浅裂小斑、榉光
 *   滑+暖色薄片剥落、悬铃木光滑大片地图状剥落三色带、tree3a 不规则纵裂。与最近邻
 *   朴树（平滑-浅裂小斑块单色系）的分化点 = ①密布皮孔麻点（1–3mm 深色点/短条高密
 *   度——朴无此层）；②浅色粉质感（灰白-灰褐更浅更粉——bark-b「浅灰白-灰褐基色、
 *   整体光滑-粉质感」双系统一致）；③局部浅细纵裂（更浅更细——朴浅裂小斑块更成片）：
 *   - 浅色光滑基底：主调 #90928a 灰白-灰褐（工程设定——bark-b 判读 [12 主代理补充]
 *     七树最浅读向）+ 单色调微变（1× vnoise ±5% 明暗——「无剥落、单色调」生产口径，
 *     无剥落代际拼贴、无三色带）。
 *   - 皮孔麻点场（身份核心，全 ALU 网格 hash）：52×78 格密度（圆点 42% / v 向短条
 *     58%——「皮孔圆形至椭圆形」FRPS Verified [2] 两型；格内 hash 抖动防阵列读向；
 *     82% 格有孔高密度；深色 ×(0.74,0.72,0.70) 1–3mm 级点/短条）。
 *   - 局部浅细纵裂（High）：u 向细线（≈28 线/周——浅细）× 低频门控（tone>0.58 局
 *     部片域——「局部」生产口径）× 微暗 ×(0.90,0.89,0.88)（浅——脊浅沟浅低浮雕，
 *     几何侧起伏最浅档配合）。
 *   - 干上部/细枝：向红褐均匀收敛（「一年生枝红褐色」照片双源 canopy-a/twig-b
 *     [12] + FRPS 小枝疣点 [2]——细枝皮孔并入红褐弱表达）；高度门控 smoothstep
 *     (1.906, 4.0)（冠基 1.906m 上方渐入；带宽 2.1m 按冠深等比重推导：2.3×7.948/
 *     8.67——Stage 代理 slot-0 实测同步）。
 *   - 苔藓/地衣不做（不做不编造，沿先例）；微起伏已归几何层（最浅档——bark-b
 *     「more or less smooth」双系统一致，任务简报冻结）。
 *
 * 花域（v∈[5,6]，组 0 分支——uv 域身份标记 ≧4 家族口径）：
 *   - alpha = 花序团块云包络 ∧ 细碎花簇格（6×8 格 stagger 抖动圆斑——inline sin-
 *     hash ALU；斑间裁穿 = 「细碎」读向；u 相位变奏 = 每卡花簇排布差异——「花序
 *     相位变奏」几何冻结接口）。JS 锚：卡面填充率 ≈37%（疏散花序——「圆锥花序
 *     大型，分枝广展」FRPS Verified [2]，非密团）。
 *   - 色：金黄-橙黄两端 per-floret 变奏（(1.00,0.72,0.24) 深金橙 ↔ (1.00,0.87,
 *     0.44) 浅金黄——「花瓣鲜黄」[12] + NC "yellow panicles" [9]；中距 = 金黄团块
 *     主相）+ 瓣基橙红点（High 近景细节层——floret 中心 ×(0.86,0.34,0.20)「瓣基
 *     小片橙红斑块」照片双源 [12] + NC "touch of red at the base" [9]）。
 *   - roughness 0.76（花瓣微泽）；风动 = 整树缓摆同公式（aBend 恒 0 无快颤——花
 *     序下垂摆动未表达归缺口候选③）。
 *
 * 果域（v∈[6,7]，组 0 分支——八面体灯笼 8 tri/果，几何侧交付）：
 *   - 五档色序按 u 分档（u = 果色档随机——几何冻结接口）：w = clamp(u + 0.09·sin
 *     (2π(u−0.1))) 权重倾斜（JS 锚实测 绿 16.5 / 黄绿乳白 14.8 / **鲑粉 28.8 /
 *     玫红 28.8** / 褐 11.2 %——鲑粉+玫红 57.5% 主导 = 生产口径「主相鲑粉-玫红主导」
 *     的统计实现；warp 单调无逆映射）+ 档内 ±5% 变奏。色序两端锚文献：绿（幼）/
 *     褐（老熟「老熟时褐色」FRPS Verified [2]）。
 *   - 膜质网纹半透光质感（High）：1× vnoise 网纹明暗 ±3% + 糙度变奏 + 弱背光透
 *     射 0.16（「果瓣膜质，有网状脉纹」属级 Verified [6]+纸质半透明感照片 [12]——
 *     灯笼膜微透光读向）；实体着色无 alpha。
 *   - roughness 0.70（膜质微泽）。
 *
 * 组 0 材质工程契约（材质侧定义，几何侧按此交付）：DoubleSide（花交叉竖卡双面读
 *   出保障；皮圆柱背面 z 遮挡成本可忽略——三域并存取舍记档）+ alphaTest 0.5 +
 *   alphaToCoverage（花卡裁切；皮/果域 alpha 恒 1 不受影响）。
 *
 * 深度材质（customDepthMaterial 契约通道——沿 SOP 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5；叶卡 SDF 与
 *     叶表面材质共享同一 GLSL 字符串、花卡 alpha 与皮表面共享同一 koeFlowerAlpha
 *     ——表面改形深度自动同步（禁复制粘贴）。
 *   - koeDepthAlpha 三分支：v<4.5 叶/皮域（aLeafRand>0 → 叶卡 SDF 裁切；组 0
 *     rand≡0 → 实心守卫——platanus 恒等 attribute 先例，皮圆柱 uv 域不误裁）；
 *     v∈[4.5,6) 花卡 alpha 裁切（域即身份——组 0 rand 恒 0 不参与）；v≥6 果实心。
 *   - **零噪声库注入**：复叶两级窗列/锯齿载波/花簇格全 ALU（inline sin-hash 非
 *     facVnoise）→ 深度片元不挂 FACILITY_GLSL_NOISE。保护性约束：SDF/花簇字符串
 *     内不得引入 facVnoise——引入即深度材质编译暴雷。
 *   - 档位匹配：Mid = High SDF 同源全形（档间剪影一致——复叶羽状剪影是中距身份，
 *     Spec §7 中距保留面）；Low = SDF_LOW 零窗列版（远距「复叶结构不可辨」Spec §7
 *     牺牲顺序——包络/主轴与 High 逐字同源，去羽片窗列/小叶/锯齿；几何侧 Low 花
 *     果省略档，花簇分支为无害死码）。
 *   - 风动不进 depth pass（静态影取舍，沿先例）。
 *
 * 分档记档（T011.6，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去小叶脉/叶团（Spec §7 叶脉仅近距可辨；SDF 全形含羽片窗列+小叶+锯齿
 *     ——档间剪影一致——复叶身份在中距即羽状剪影，去形 = 去身份）/透光/叶背/hue·
 *     luma/shade/两面糙度差保留；叶 Low：SDF 换 SDF_LOW（去两级窗列——复叶细化；
 *     包络/主轴逐字同源）+ 去透光；片元零噪声。
 *   - 皮 Mid：去浅细纵裂/果膜网纹/果透光/瓣基红点（近景细节层）；皮孔麻点/花簇
 *     alpha/金黄变奏/果五档保留——中距「皮孔麻点干 + 金黄花簇 + 鲑粉-玫红果团」
 *     = 身份信号（Spec §7 中距保留面）；皮 Low：再去皮孔麻点（远距亚像素），单色
 *     调微变 + 上部红褐 + 果五档 + 花簇金黄保留（几何 Low 花果省略时为死码）。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；koelreuteria 前缀不与六先例
 *     混缓存）：'koelreuteria:leaf' / ':mid' / ':low'；'koelreuteria:bark' …；
 *     'koelreuteria:leaf-depth' …（9 键全异）。
 *   - 风动（KOE_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团）= 3× + 复叶 SDF ALU（两级窗列 floor/fract/
 *     pow/cos ≈ 45 flop ≈ 4.5×——单叶先例 SDF ≈2× 的两倍余，**复叶两级结构的账**，
 *     方法里程碑接受）+ 小叶脉 ≈ 1.5× + 透光/两面/hue ≈ 2× ≈ **11×**（与悬铃木
 *     12× 同档）；叶 Mid ≈ 8×（0 噪声 + SDF 全形）；叶 Low ≈ 3×；
 *   - 皮 High 片元（三域取最重路径）= 皮路径 1× vnoise + 皮孔格 ALU ≈ 5× / 果路径
 *     1× vnoise + 五档链 ≈ 4× / 花路径纯 ALU ≈ 2×——域互斥执行，最重 ≈ **5×**；
 *     皮 Mid/Low ≈ 4×；
 *   - 深度片元 = 复叶 SDF + 花簇格纯 ALU ≈ 6×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——两级窗列/花簇格/皮孔
 *   格全部限定文件内）：
 *   ① 复叶分型（缘相 70/30 / 羽片间距 / 小叶频）+ 单叶变奏共用 aLeafRand 单属性
 *     统计近似（多通道复用同一 rand——分型间的相关性无法表达；几何侧若有叶位语义
 *     通道可精确分型）；**小叶颤（复叶内小叶独立颤动）单卡不可表达**——需 per-
 *     lealet 顶点通道或小叶分卡几何（任务简报冻结判定，家族复叶表达力缺口）；
 *   ② 复叶「两级窗列 lift 折叠」SDF：本文件内实现；011.8 重阳木（三出）/011.9 国
 *     槐 /011.10 白蜡（羽状）复叶三型将复现沿轴窗列语言——族级可提炼「复叶 SDF
 *     公共模式」（暂不动公共抽象，复叶三型到齐后评估）；
 *   ③ 花序/果序下垂摆动（「初直立后下垂」「果序下垂」照片 [12]）组 0 aBend≡0 未
 *     表达——附加元素无独立形变通道（恰 2 组冻结的连带限制，几何 profile 侧同源
 *     记档）；
 *   ④ 果色档与果序轴位置/成熟度无相关通道（真实色序沿序轴渐变 fruit-b 同序并存
 *     [12] vs 本例 u 独立随机统计分档）——需 per-fruit 序轴语义；
 *   ⑤ 花瓣计数/花瓣 4 近景结构为格点统计近似（细碎花簇无单花几何——家族「附加元
 *     素近景结构」同型缺口，悬铃木果序刺状表面同口径）；
 *   ⑥ 树高锚 9.854m/冠基 1.906m 材质侧硬编码（风动权重 + shade/红褐门控——Stage 代理
 *     slot-0 精确涌现实测同步，2026-09-21），与
 *     profile 侧无联动通道（同 platanus ⑤ 家族缺口——profile 变更需材质侧同步）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与 zelkova/camphor/
 *   celtis/ginkgo/platanus/tree3a 的通用段（风动公式等）为复制改造非 import（资产私有，
 *   跨资产不耦合——organization.md 边界）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`koelreuteria 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 复叶卡快颤（aBend 权重，组 0 恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值记档：
 * hash 常数 84.913/61.157（与朴/樟/榉/银杏/悬铃木相位流去相关）+ 树高锚 9.854m
 * （×0.1015——几何侧 slot-0 精确涌现实测锚〔Stage 代理探针，2026-09-21 同步〕）；快颤 9–15 rad/s（≈1.4–2.4Hz 中频）/ ≤11mm
 * （中幅——任务简报「参照悬铃木大叶重摆量级下调」：15mm→11mm、8–14→9–15 rad/s。
 * 二回羽叶整体大（45–70cm）但小叶透风（羽状镂空风阻低）——摆锤质量读向下调）。
 */
const KOE_WIND = /* glsl */ `
// koelreuteria wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float koeWindPhase = fract(sin(aSeed * 84.913 + 5.3) * 43758.5453);
float koeWindH = clamp(position.y * 0.1015, 0.0, 1.0); // /9.854m 精确涌现实测锚（Stage 代理 slot-0 探针，2026-09-21 同步——缩放抖动下权重近似）
float koeSway = koeWindH * koeWindH * 0.042 * sin(uTime * 1.15 + koeWindPhase * 6.28318 + koeWindH * 1.4);
// 复叶卡快颤：ω = 9 + 6φ（9–15 rad/s ≈ 1.4–2.4Hz 中频），幅度 ≤11mm 中幅（悬铃木大叶重摆 15mm 量级下调——羽叶镂空透风）；权重 = aBend（卡根≈0 尖大）
float koeFlutterPhase = fract(sin((aSeed + aLeafRand) * 61.157 + 7.8) * 43758.5453);
float koeFlutter = aBend * 0.011 * sin(uTime * (9.0 + 6.0 * koeFlutterPhase) + koeFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (koeSway + koeFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(koeSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * koeFlutter * 0.9; // 叶面沿卡法线微扑（组 0 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const KOE_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 复叶 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 坐标折算与包络/主轴段（koeLeafAlpha 主函数与叶面小叶脉装饰层共享的前段——同一名
 * 单：koeP/koeX/koeY/koeA/包络三件/主轴。变量注入位于不同作用域（函数体 vs 片元
 * main），无命名冲突）。
 */
const KOE_SCALLOP_HEAD = /* glsl */ `
  vec2 koeP = vec2(koeUv.x - 0.5, koeUv.y);
  float koeX = koeP.x * 0.60; // 物理横坐标（长为单位 1、半宽 0.30——宽/长比 0.60 冻结接口）
  float koeY = koeP.y;
  float koeA = abs(koeX);
  // 全叶包络：v^0.80 峰 v≈0.42 偏中下（二回羽叶中下部最宽）+ 变指数收口（基 0.78 → 上段 1.18 先端渐尖 = 顶生小叶读向）；最宽半宽 0.300 恰达卡缘
  float koeEnvSin = sin(3.14159 * pow(clamp(koeY, 0.001, 0.999), 0.80));
  float koeEnv = 0.30 * pow(koeEnvSin, mix(0.78, 1.18, smoothstep(0.30, 0.92, koeY)));
  float koeEnvEdge = koeEnv - koeA;
  // 主轴 rachis（工程放大——真实 ≈3–4mm 卡分辨率不可读）：基部 0.013 渐细至 0.0065，全 v 连续不裁穿
  float koeRachisEdge = 0.013 * (1.0 - 0.5 * koeY) - koeA;
`;

/**
 * 两级窗列变量段（二回第一级羽片带列 + 第二级小叶窗列，到互生侧偏——单一来源：
 * SDF 子函数 koePinna 与叶面小叶脉装饰层两处展开共享同一字符串）。依赖作用域内
 * 已有 koeX/koeY/koeA/koeEnv/koeRand。
 */
const KOE_PINNA_VARS = /* glsl */ `
  // 羽片带列（二回第一级）：lift 折算回水平带帧（tan38° 上举 → 羽片间 V 形缺口）+ 右侧降 0.014 近对生；间距 rand 变奏 → 4–6 对
  float koeSpace = 0.145 + 0.028 * fract(koeRand * 5.713 + 0.31);
  float koeYb = koeY - 0.155 - koeA * 0.78 - max(sign(koeX), 0.0) * 0.014;
  float koeBandT = koeYb / koeSpace;
  float koeBandIdx = floor(koeBandT + 0.5);
  float koeL = (koeBandT - koeBandIdx) * koeSpace; // 距最近带中心有符号距离
  // 小叶窗列（二回第二级）：沿羽轴 a 重复 + 每带相位；freq rand → 周期 0.037–0.048 → 每羽片 5–7 枚
  float koeLfFreq = 21.0 + 6.0 * fract(koeRand * 4.117 + 0.63);
  float koeS = koeA * koeLfFreq + fract(koeBandIdx * 0.371 + koeRand * 0.618) * 8.0;
  float koeJ = floor(koeS);
  float koeFr = fract(koeS);
  float koeLob = pow(sin(3.14159 * koeFr), 1.6); // 小叶凸包（fr=0/1 谷 = 小叶间隙）
  float koeAlt = mod(koeJ, 2.0) * 2.0 - 1.0; // 互生侧别（「互生，很少对生」FRPS Verified [2][4]）
  float koeRem = max(koeEnv - koeA, 0.0); // 距包络余量（小叶向羽片先端渐小）
  float koeLen = clamp(0.20 * koeRem, 0.012, 0.046);
  float koeHalf = koeLob * koeLen; // 小叶半长（垂直羽轴）
  float koeC = koeAlt * 0.40 * koeLen * (0.30 + 0.70 * koeLob); // 互生侧偏（斜卵形基部偏斜的简化表达）
`;

/**
 * 栾树二回羽叶卡覆盖率（uv：u 横 0–1、v 沿主轴 0 基 → 1 先端；宽/长比 0.60 冻结）：
 * 两级窗列 lift 折叠法（复叶首例新路径——见模块头方法记档）。羽轴细线 + 小叶缘
 * 内弯细锯齿变体（70/30 rand 分档）+ 羽片基部 bare 门控；合成 edge = max(主轴,
 * min(包络, 羽片))。**零 facVnoise 引用是深度材质不挂噪声库的前提（引入即深度
 * 编译暴雷——保护性约束；窗列/载波全 ALU）**；返回近似符号距离的覆盖率坡（edge/
 * 0.02——坡宽 0.02 为复叶小叶间隙级结构细一档口径，alphaToCoverage 承担 AA）。
 */
const KOE_LEAF_SDF = /* glsl */ `
// 两级窗列子函数（FXC X4000 数据流误报规避——011.6 收尾门校准形态 A）：两级窗列
// （羽片带列 + 小叶窗列）+ 羽轴细线 + 小叶边 + 锯齿 + bare 门控整体封装，单返回值
// 零 out 参（out 参为 X4000 已知触发形态）；koeLeafAlpha 主函数体随之最小化（消元
// 矩阵 P17/P23 实证：两级窗列的内联复杂度触发 FXC 保守误报）。数学逐位等价——表达
// 式树与求值顺序零变化，纯函数调用引用透明（koeA = abs(koeX) 与主函数同值重算）。
float koePinna(float koeX, float koeY, float koeEnv, float koeRand) {
  float koeA = abs(koeX);
${KOE_PINNA_VARS}
  // 羽轴细线 rachilla：小叶间隙连线（去则小叶孤立、中距羽片剪影散架）；向羽片先端渐细
  float koeRillEdge = 0.006 - 0.003 * clamp(koeA / 0.30, 0.0, 1.0) - abs(koeL);
  float koeFeatherEdge = koeHalf - abs(koeL - koeC);
  float koePinnaEdge = max(koeRillEdge, koeFeatherEdge);
  // 小叶缘内弯细锯齿变体（~30% 卡——生产口径 70 全缘主力 / 30 细齿；真实齿 ~1mm 亚像素，微幅统计近似 + Spec §7 牺牲顺序首位记档）
  float koeSerrOn = step(0.70, fract(koeRand * 6.113 + 0.37));
  float koeTooth = cos((koeL - koeC) * 620.0 + koeJ * 2.4) * 0.5 + 0.5;
  koePinnaEdge += koeSerrOn * (koeTooth - 0.5) * 0.010 * step(0.2, koeLob);
  koePinnaEdge *= smoothstep(0.08, 0.13, koeY); // 羽片基部 bare 门控（第一对羽片以下 = 裸叶柄+叶轴；band −1 幻影带压灭）
  return koePinnaEdge;
}
float koeLeafAlpha(vec2 koeUv, float koeRand) {
${KOE_SCALLOP_HEAD}
  float koePinnaEdge = koePinna(koeX, koeY, koeEnv, koeRand); // 两级窗列子函数（单一来源 KOE_PINNA_VARS——与叶脉装饰层共享）
  float koeEdge = max(koeRachisEdge, min(koeEnvEdge, koePinnaEdge));
  return clamp(koeEdge / 0.02 + 0.5, 0.0, 1.0); // 坡宽 0.02（复叶小叶间隙级——alphaToCoverage AA）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档取用）：
 * 包络 + 主轴即可——去两级窗列/锯齿/分型（**复叶细化**：远距复叶结构不可辨 Spec §7
 * 牺牲顺序「羽片对数结构 → 复叶层叠剪影（最后保留）」；片元零噪声先天成立）。包络/
 * 主轴两项与 High 逐字同源（档间叶形身份一致的去细节不改形原则——远距保留大羽叶
 * 层叠轮廓色块）。
 */
const KOE_LEAF_SDF_LOW = /* glsl */ `
float koeLeafAlpha(vec2 koeUv, float koeRand) {
  vec2 koeP = vec2(koeUv.x - 0.5, koeUv.y);
  float koeA = abs(koeP.x * 0.60);
  float koeEnvSin = sin(3.14159 * pow(clamp(koeP.y, 0.001, 0.999), 0.80)); // 包络（与 High 逐字同源）
  float koeEnv = 0.30 * pow(koeEnvSin, mix(0.78, 1.18, smoothstep(0.30, 0.92, koeP.y)));
  float koeEdge = max(0.013 * (1.0 - 0.5 * koeP.y), koeEnv) - koeA; // 主轴 ∪ 包络（去两级窗列/锯齿——koeRand 保留双参签名沿家族契约、Low 不用）
  return clamp(koeEdge / 0.02 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/**
 * 花卡 alpha（组 0 花域 v∈[5,6] 与深度材质共用——单一来源）：
 * 花序团块云包络 ∧ 细碎花簇格（stagger 抖动圆斑，inline sin-hash——**零 facVnoise**
 * 深度同源前提）。out 参：koeFCen = floret 中心近度（瓣基橙红点位）、koeFVar =
 * per-floret 金黄-橙黄深浅变奏（调用方取用；深度调用以哑元变量接收）。
 */
const KOE_FLOWER_ALPHA = /* glsl */ `
float koeFlowerAlpha(vec2 koeF, out float koeFCen, out float koeFVar) {
  vec2 koeFP = vec2((koeF.x - 0.5) * 0.65, koeF.y); // 花卡宽/长比 0.65 冻结接口
  float koeFEnv = sin(3.14159 * pow(clamp(koeFP.y, 0.001, 0.999), 0.90)); // 团块云包络（疏散圆锥花序——非密团）
  vec2 koeFC = vec2(koeFP.x * 6.0, koeFP.y * 8.0);
  vec2 koeFId = floor(koeFC);
  float koeFR = fract(sin(dot(koeFId, vec2(127.1, 311.7)) + koeF.x * 9.7) * 43758.5453); // u 相位变奏（每卡花簇排布差异——几何冻结接口）
  vec2 koeFOs = (vec2(fract(koeFR * 7.31), fract(koeFR * 3.17)) - 0.5) * 0.44;
  vec2 koeFF = fract(koeFC) - 0.5 - koeFOs;
  koeFF.x -= (mod(koeFId.y, 2.0) - 0.5) * 0.5; // 奇偶行错位（防阵列读向）
  float koeFRad = 0.38 + 0.18 * fract(koeFR * 9.13);
  koeFCen = 1.0 - smoothstep(0.05, 0.16, length(koeFF)); // floret 中心（瓣基点位）
  koeFVar = fract(koeFR * 5.31);
  float koeFBlob = koeFRad - length(koeFF);
  float koeFSide = 0.325 * pow(koeFEnv, 0.75) - abs(koeFP.x);
  return clamp(min(koeFSide, koeFBlob) / 0.03 + 0.5, 0.0, 1.0);
}
`;

/**
 * 深度 alpha 三分支（组 0+组 1 多材质网格共用叶影深度材质的域路由）：
 * v<4.5 叶/皮域（aLeafRand>0 → 叶卡 SDF；组 0 rand≡0 → 实心守卫——platanus 先例）；
 * v∈[4.5,6) 花卡 alpha 裁切（域即身份）；v≥6 果实心（八面体无裁切）。
 */
const KOE_DEPTH_ALPHA = /* glsl */ `
float koeDepthAlpha(vec2 koeUv, float koeRand) {
  if (koeUv.y < 4.5) {
    return mix(1.0, koeLeafAlpha(koeUv, koeRand), step(0.0001, koeRand)); // 皮/果实心守卫（组 0 aLeafRand 恒 0）
  }
  if (koeUv.y < 6.0) {
    float koeDCen = 0.0; float koeDVar = 0.0; // ANGLE X4000 冷启动「潜在未初始化」告警静默（哑元 out 参：callee 无条件覆写 + 深度路径零回读——零语义变化，验证轮校准项 2026-09-21）
    return koeFlowerAlpha(vec2(koeUv.x, koeUv.y - 5.0), koeDCen, koeDVar); // 花卡裁切（Color/Depth 同源 GLSL）
  }
  return 1.0; // 果八面体实心
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/小叶脉——叶团乘子 0.94+0.12×koeClump 均值化 = 1.0 消去，值噪声均值
 *  0.5 精确保均）。 */
const KOE_LEAF_HEAD = /* glsl */ `
// koelreuteria:leaf —— 二回羽叶 SDF 裁切 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float koeAlpha = koeLeafAlpha(vUv, vLeafRand);
diffuseColor.a = koeAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷中绿 ↔ 暖黄绿——Spec §5 正面中绿 + §6 变体读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 koeHue = mix(vec3(0.95, 1.00, 1.03), vec3(1.05, 1.05, 0.93), fract(vLeafRand * 7.213 + 0.29));
float koeLuma = 0.92 + 0.16 * fract(vLeafRand * 4.417 + 0.51);`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const KOE_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.85m ≈ 团块 1/8–1/15 冠幅——大羽叶层叠复合质感 Spec §3
// Inferred [12]；采样偏移与五先例去相关）
float koeClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.63, vTreePos.y - vTreePos.z * 0.77) * 1.18 + vec2(31.7, 19.3));`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const KOE_LEAF_SHADE = /* glsl */ `
float koeShade = clamp((vTreePos.y - 1.906) / 2.6, 0.0, 1.0); // 冠基 ≈1.906m（Stage 代理 slot-0 实测——T009.3 视觉冠底质心口径）；带宽 2.6 = 冠深等比重推导（2.8×7.948/8.67，旧 3.2×11.87 读数作废）`;

/** High 专属：小叶羽状脉（中脉 + 侧脉读向——中距弱表达，纯 ALU 零采样）。
 *  坐标段与 SDF 共享（KOE_SCALLOP_HEAD + KOE_PINNA_VARS 同源折算——同名单不同作用域）。 */
const KOE_LEAF_VEIN = /* glsl */ `
// 小叶羽状脉（NC "leaflets ovate with pinnate venation" [9] + Spec §7 近距——弱层不承重）：
// 每小叶中脉亮带（小叶中点窗 + 半长渐隐不达缘）+ 侧脉对角读向一对（自小叶基外斜）
vec2 koeUv = vUv;
float koeRand = vLeafRand;
${KOE_SCALLOP_HEAD}
${KOE_PINNA_VARS}
float koeVPeak = 1.0 - smoothstep(0.08, 0.22, abs(koeFr - 0.5)); // 小叶中点窗
float koeVMid = koeVPeak * (1.0 - smoothstep(0.45, 0.80, abs(koeL - koeC) / max(koeLen, 0.001))); // 中脉（半长渐隐）
float koeVLatD = abs(abs(koeL - koeC * 0.3) - (koeFr - 0.15) * koeLen * 1.2); // 侧脉对角距离场（自小叶基外斜）
float koeVLat = koeVPeak * (1.0 - smoothstep(0.010, 0.026, koeVLatD)) * smoothstep(0.15, 0.35, koeFr) * (1.0 - smoothstep(0.62, 0.85, koeFr));
`;

/** High 专属：合成（叶团乘子 + 小叶脉调制） */
const KOE_LEAF_MUL_HIGH = /* glsl */ `
vec3 koeMul = koeHue * koeLuma * (0.80 + 0.20 * koeShade) * (0.94 + 0.12 * koeClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
koeMul = mix(koeMul, koeMul * vec3(1.45, 1.30, 1.02), koeVMid * 0.30 + koeVLat * 0.15); // 小叶脉弱表达 0.30/0.15（中脉身份层 + 侧脉读向弱层）
diffuseColor.rgb *= koeMul;`;

/** Mid/Low：合成（去叶团/小叶脉——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const KOE_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 koeMul = koeHue * koeLuma * (0.80 + 0.20 * koeShade); // Mid/Low：叶团乘子均值化消去（T011.6）
diffuseColor.rgb *= koeMul;`;

/** 叶背浅绿-灰绿（三档共用，纯 ALU 零采样零分支） */
const KOE_LEAF_BACK = /* glsl */ `
// 叶背浅绿-灰绿（Spec §2 FRPS「下面密被短柔毛」Verified [2][4] + §5 两面有色差 Inferred）：
// gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，背面法线由 three 双面光照
// 自动翻转，此处只调固有色）——背面 R/G/B 依次抬升 1.09/1.10/1.13（B 抬高于 R/G =
// 灰向——柔毛灰绿读向；vs 香樟 ×(1.06,1.05,1.16) 强粉感 / 悬铃木 ×(1.08,1.10,1.02)
// 无粉感——栾树居中偏灰）；两面糙度差 +0.08（密短柔毛——糙于悬铃木近无毛 +0.06，
// 见 roughnessmap 注入）；纯 ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.09, 1.10, 1.13), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  中等版：纸质叶中等透光（家族档位中庸——任务简报口径）。 */
const KOE_LEAF_TRANSLUCENCY = /* glsl */ `
// koelreuteria:leaf —— 背光透射（中等）：视线与阳光反向时叶背透亮黄绿（叶绿素吸收红蓝 →
// 透射偏黄绿；纸质叶中等透光——峰值 0.32 家族中庸档：悬铃木厚叶 0.28 < 0.32 < 银杏
// 纸质 0.34，Spec §2「纸质或近革质」取纸质端 [2][4]；小叶间隙透空由 SDF alpha 承担）
#if NUM_DIR_LIGHTS > 0
  float koeBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float koeTransVar = 0.55 + 0.45 * fract(vLeafRand * 7.613 + 0.51); // 逐叶透光强度变奏
  outgoingLight += vec3(0.55, 0.90, 0.35) * directionalLights[0].color
    * pow(koeBack, 3.0) * koeTransVar * koeAlpha * 0.32;
#endif
`;

// ── 组 0（皮+花+果）配方主体（<map_fragment> 后注入；uv 域身份分支 4.5/6.0）──────

/** 皮域：浅色光滑基底 + 皮孔麻点格 + 局部浅细纵裂（High/Mid 共用段差异见各 MUL） */
const KOE_BARK_TONE = /* glsl */ `
float koeTone = facVnoise(vec2(vUv.x * 2.6, vUv.y * 2.2) + vec2(41.3, 27.9)); // 单色调微变 ±5%（「无剥落、单色调」生产口径——无代际拼贴无三色带）`;

/** 皮孔麻点场（High/Mid 共用——身份核心，全 ALU 网格 hash） */
const KOE_BARK_LENTICEL = /* glsl */ `
// 皮孔麻点（bark-b 双系统一致「密布深色皮孔点 1–3mm 圆点/短条高密度」+ FRPS「皮孔圆形
// 至椭圆形」Verified [2] 推广）：52×78 格 hash 抖动；圆点 42% / v 向短条 58%（两型）；
// 82% 格有孔（step 0.18 密度门）；深色 ×(0.74,0.72,0.70)
vec2 koeLc = vec2(vUv.x * 52.0, vUv.y * 78.0);
vec2 koeLId = floor(koeLc);
float koeLR = fract(sin(dot(koeLId, vec2(127.1, 311.7)) + 17.31) * 43758.5453);
vec2 koeLF = fract(koeLc) - 0.5 - (vec2(fract(koeLR * 7.31), fract(koeLR * 3.17)) - 0.5) * 0.44;
float koeLDash = step(0.42, fract(koeLR * 3.17)); // 短条型 58%（椭圆形——v 向压 0.62 拉长）
float koeLDist = length(vec2(koeLF.x, koeLF.y * mix(1.0, 0.62, koeLDash)));
float koeLRad = 0.10 + 0.08 * fract(koeLR * 9.13);
koeDot = (1.0 - smoothstep(koeLRad * 0.55, koeLRad, koeLDist)) * step(0.18, koeLR); // 赋值域变量（跨 include 供 roughness 消费——块内不重声明防作用域遮蔽）`;

/** 局部浅细纵裂（High 专属——浅：×0.90 微暗；细：≈28 线/周；局部：低频门控片域） */
const KOE_BARK_FISSURE = /* glsl */ `
koeFis = (1.0 - smoothstep(0.030, 0.058, abs(fract(vUv.x * 27.8) - 0.5))) * smoothstep(0.58, 0.78, koeTone); // 细线门控 × 低频局部门控（赋值域变量）`;

/** 干上部/细枝红褐收敛（三档共用——结构剪影项三档保留，沿先例体例） */
const KOE_BARK_HIGH = /* glsl */ `
float koeBarkHigh = smoothstep(1.906, 4.0, vTreePos.y); // 冠基 1.906m 上方渐入（9.854m 精确涌现锚；带宽 2.1 = 2.3×7.948/8.67 冠深等比重推导）`;

/** High 皮域合成 */
const KOE_BARK_MUL = /* glsl */ `
vec3 koeBarkMul = vec3(0.94 + 0.10 * koeTone); // 浅色光滑基底（灰白-灰褐单色调）
koeBarkMul *= mix(vec3(1.0), vec3(0.74, 0.72, 0.70), koeDot * 0.9); // 皮孔深色麻点
koeBarkMul *= mix(vec3(1.0), vec3(0.90, 0.89, 0.88), koeFis); // 局部浅细纵裂微暗（浅——脊浅沟浅低浮雕）
koeBarkMul = mix(koeBarkMul, vec3(1.12, 0.96, 0.84) * (0.92 + 0.08 * koeTone), koeBarkHigh * 0.85); // 上部红褐（一年生枝红褐照片双源 [12]；细枝疣点并入弱表达）
diffuseColor.rgb *= koeBarkMul;`;

/** Mid 皮域合成（去浅细纵裂——近景细节层；皮孔麻点保留 = 中距身份） */
const KOE_BARK_MUL_MID = /* glsl */ `
vec3 koeBarkMul = vec3(0.94 + 0.10 * koeTone);
koeBarkMul *= mix(vec3(1.0), vec3(0.74, 0.72, 0.70), koeDot * 0.9); // 皮孔麻点保留（中距身份信号）
koeBarkMul = mix(koeBarkMul, vec3(1.12, 0.96, 0.84) * (0.92 + 0.08 * koeTone), koeBarkHigh * 0.85);
diffuseColor.rgb *= koeBarkMul;`;

/** Low 皮域合成（再去皮孔麻点——远距亚像素；单色调微变 + 上部红褐保留） */
const KOE_BARK_MUL_LOW = /* glsl */ `
vec3 koeBarkMul = mix(vec3(0.94 + 0.10 * koeTone), vec3(1.12, 0.96, 0.84) * (0.92 + 0.08 * koeTone), koeBarkHigh * 0.85); // 上部红褐（结构剪影项三档保留）
diffuseColor.rgb *= koeBarkMul;`;

/** 花域体（三档共用——alpha 单一来源 + 金黄-橙黄变奏） */
const KOE_FLOWER_BODY = /* glsl */ `
  vec2 koeFUv = vec2(vUv.x, vUv.y - 5.0);
  float koeFCen; float koeFVar;
  diffuseColor.a = koeFlowerAlpha(koeFUv, koeFCen, koeFVar); // 花卡裁切（Color/Depth 同源）
  // 金黄-橙黄细碎花簇（「花瓣鲜黄」[12] + NC "yellow panicles" [9]——中距 = 金黄团块主相；per-floet 深浅变奏）
  diffuseColor.rgb = mix(vec3(1.00, 0.72, 0.24), vec3(1.00, 0.87, 0.44), koeFVar);`;

/** 花域瓣基橙红点（High 专属近景细节层） */
const KOE_FLOWER_RED = /* glsl */ `
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.34, 0.20), koeFCen * 0.75); // 瓣基橙红斑（「瓣基小片橙红斑块」[12] + NC "touch of red at the base" [9]——floret 中心）`;

/** 果域五档色序头（三档共用——u 果档随机 + 权重倾斜） */
const KOE_FRUIT_HEAD = /* glsl */ `
  // 五档色序按 u 分档（绿→黄绿/乳白→鲑粉→玫红→褐——FRPS「淡紫红色，老熟时褐色」Verified [2][4]
  // + fruit-b 同序并存 [12]）；warp 相位 −0.1 使密度峰落鲑粉/玫红界 0.6 → 双档并重
  // （JS 镜像实测 16.5/14.8/28.8/28.8/11.2%——鲑粉+玫红 57.5% 主导 = 「主相鲑粉-玫红主导」）
  float koeCu = clamp(vUv.x + 0.09 * sin(6.28318 * (vUv.x - 0.1)), 0.0, 0.999);
  float koeBin = floor(koeCu * 5.0);
  vec3 koeFruit = mix(mix(mix(mix(vec3(0.55, 0.64, 0.33), vec3(0.83, 0.83, 0.68), step(0.5, koeBin)), vec3(0.93, 0.64, 0.55), step(1.5, koeBin)), vec3(0.83, 0.46, 0.54), step(2.5, koeBin)), vec3(0.56, 0.43, 0.34), step(3.5, koeBin));
  diffuseColor.rgb = koeFruit * (0.95 + 0.10 * fract(vUv.x * 23.7)); // 档内 ±5% 变奏`;

/** 果域膜质网纹（High 专属——1× vnoise 网纹明暗） */
const KOE_FRUIT_MEMBRANE = /* glsl */ `
  koeRet = facVnoise(vUv * 6.0 + vec2(43.9, 29.1)); // 膜质网纹（「果瓣膜质，有网状脉纹」属级 Verified [6]——赋值域变量）
  diffuseColor.rgb *= 0.97 + 0.06 * (koeRet - 0.5);`;

/** 果域弱背光透射（High 专属——灯笼膜微透光；<opaque_fragment> 前注入） */
const KOE_FRUIT_TRANSLUCENCY = /* glsl */ `
// koelreuteria:bark —— 果域膜质微透光（「纸质半透明感」照片 [12]——弱背光 0.16，域门控 v≥6）
#if NUM_DIR_LIGHTS > 0
  if (vUv.y >= 6.0) {
    float koeFBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
    outgoingLight += vec3(1.00, 0.80, 0.78) * directionalLights[0].color * pow(koeFBack, 2.5) * 0.16;
  }
#endif
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 复叶卡材质（组 1）：二回羽叶两级窗列 SDF alphaTest 裁切 + 小叶羽状脉（High）+
 * 两面区分 + 中等透光 + 逐叶变奏 + 风动。level 分档（T011.6，缺省 'high'）：Mid 去
 * 小叶脉/叶团/糙度叶团项（Spec §7 叶脉仅近距可辨；**SDF 全形含两级窗列 + 锯齿保留
 * ——档间剪影一致：复叶羽状剪影是中距身份**），透光/叶背/hue·luma/shade/两面糙度差
 * 保留；Low 换 KOE_LEAF_SDF_LOW（去两级窗列/锯齿——复叶细化；包络/主轴与 High
 * 逐字同源）+ 去透光，片元零噪声采样。风动三档同源不动（KOE_WIND 同一常量——档间
 * 风相位一致 = 身份一致）。
 * 底参：中绿偏深 #527d37（工程设定——Spec §5 正面中绿（偏深）+ 照片 leaf-a 深绿 [12]
 * 交叉；六树亮度链：银杏 > 朴树 > 悬铃木 > **栾树** > 夏栎 > 榉 > 樟——中绿偏深档）/
 * m 0 / r 0.70（纸质叶哑光——「纸质或近革质」Verified [2][4] 取纸质端；悬铃木厚实
 * 0.66 < 0.70 < 朴树近革质 0.72）/ DoubleSide（卡面双面可见，背面法线由 three 双面
 * 光照自动翻转）。
 */
export function createKoelreuteriaLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x527d37, // 中绿偏深（工程设定：Spec §5 + leaf-a 深绿 [12] 交叉——六树链中绿偏深档；中距色块与悬铃木中绿/银杏淡绿区分）
    metalness: 0,
    roughness: 0.70, // 纸质叶哑光（「纸质或近革质」取纸质端——悬铃木 0.66 < 0.70 < 朴树 0.72）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 复叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? KOE_LEAF_SDF_LOW : KOE_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含两级窗列 + 锯齿）
  const leafBody = level === 'high'
    ? KOE_LEAF_HEAD + KOE_LEAF_CLUMP + KOE_LEAF_SHADE + KOE_LEAF_VEIN + KOE_LEAF_MUL_HIGH + KOE_LEAF_BACK
    : KOE_LEAF_HEAD + KOE_LEAF_SHADE + KOE_LEAF_MUL_SIMPLE + KOE_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (koeClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.08, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.08, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面糙度差保留——密短柔毛背糙）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${KOE_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${KOE_WIND}`,
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
        `${KOE_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `koelreuteria:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（皮+花+果一材质三域，uv 域身份分支 4.5/6.0）：皮域 = 第七树皮语言「浅色
 * 光滑 + 皮孔麻点 + 局部浅细纵裂」；花域 v∈[5,6] = 金黄-橙黄花簇 alpha 裁切（瓣基
 * 橙红点 High）；果域 v∈[6,7] = 五档色序灯笼实体（膜质网纹 + 微透光 High）。level
 * 分档（T011.6，缺省 'high'）：Mid 去浅细纵裂/果膜网纹/果透光/瓣基红点（近景细节
 * 层），皮孔麻点/花簇/果五档保留——中距「皮孔麻点干 + 金黄花簇 + 鲑粉-玫红果团」
 * 身份信号（Spec §7 中距保留面）；Low 再去皮孔麻点（远距亚像素），单色调微变 +
 * 上部红褐 + 果五档 + 花簇金黄保留（几何 Low 花果省略时为死码）。风动 = 整树缓摆
 * 与叶同公式同相位（aBend 恒 0 快颤层天然不作用——花果下垂摆动归缺口候选③）。
 * 组 0 工程契约（材质侧定义）：DoubleSide（花交叉竖卡双面读出保障；皮圆柱背面 z
 * 遮挡成本可忽略）+ alphaTest 0.5 + alphaToCoverage（花卡裁切；皮/果域 alpha 恒 1）。
 * 底参：灰白-灰褐主调 #90928a（工程设定——bark-b「浅灰白-灰褐基色」双系统一致
 * [12 主代理补充]——七树最浅读向）/ m 0 / r 0.87（光滑粉质感哑光）/ USE_UV。
 */
export function createKoelreuteriaBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x90928a, // 灰白-灰褐浅色（工程设定：bark-b 判读双系统一致——vs 悬铃木 #787e6f / 榉 #787c72 明显更浅 = 「浅色光滑」第 7 语言读向）
    metalness: 0,
    roughness: 0.87, // 光滑粉质感哑光（bark-b「整体光滑-粉质感」——vs 纵裂族 0.91–0.93 高糙）
    side: THREE.DoubleSide, // 花交叉竖卡双面读出（三域并存取舍——皮背面 z 遮挡成本可忽略，记档）
    alphaTest: 0.5, // 花卡 alpha 裁切（皮/果域 alpha 恒 1 不受影响）
    alphaToCoverage: true,
  });
  material.defines = { USE_UV: '' }; // 三域分支 = uv 域身份标记（皮圆柱 / 花卡 / 果八面体）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const flowerBody = KOE_FLOWER_BODY + (level === 'high' ? KOE_FLOWER_RED : '');
  const fruitBody = KOE_FRUIT_HEAD + (level === 'high' ? KOE_FRUIT_MEMBRANE : '');
  const barkBody = level === 'high'
    ? KOE_BARK_TONE + KOE_BARK_LENTICEL + KOE_BARK_FISSURE + KOE_BARK_HIGH + KOE_BARK_MUL
    : level === 'mid'
      ? KOE_BARK_TONE + KOE_BARK_LENTICEL + KOE_BARK_HIGH + KOE_BARK_MUL_MID
      : KOE_BARK_TONE + KOE_BARK_HIGH + KOE_BARK_MUL_LOW;
  // 跨 include 域变量预声明（map 注入分支内赋值 / roughnessmap 注入消费——块内赋值不重声明防作用域遮蔽；
  // 按档最小声明：Low 无近景细节项零声明）
  const domainVars = level === 'high'
    ? 'float koeRet = 0.5; float koeDot = 0.0; float koeFis = 0.0; // High：果膜网纹 + 皮孔麻点 + 浅细纵裂\n'
    : level === 'mid'
      ? 'float koeDot = 0.0; // Mid：皮孔麻点（近景纵裂/果膜随段去）\n'
      : '';
  const body = /* glsl */ `
// koelreuteria:bark —— 组 0 三域分支（皮 v<4.5 / 花 v∈[5,6] / 果 v∈[6,7)——uv 域身份标记，几何侧冻结契约）
${domainVars}if (vUv.y >= 6.0) {
${fruitBody}
} else if (vUv.y >= 4.5) {
${flowerBody}
} else {
${barkBody}
}`;
  const barkRoughness = level === 'high'
    ? `if (vUv.y >= 6.0) { roughnessFactor = 0.70 + (koeRet - 0.5) * 0.10; } // 果域膜质微泽 + 网纹糙度变奏
else if (vUv.y >= 4.5) { roughnessFactor = 0.76; } // 花瓣微泽
else { roughnessFactor = clamp(0.87 + koeDot * 0.03 - koeFis * 0.04, 0.05, 1.0); } // 皮孔微糙 + 裂线微滑（浅细纵裂的低浮雕读向）`
    : level === 'mid'
      ? `if (vUv.y >= 6.0) { roughnessFactor = 0.72; } // Mid：果膜均值糙度（网纹变奏随段去）
else if (vUv.y >= 4.5) { roughnessFactor = 0.76; }
else { roughnessFactor = clamp(0.87 + koeDot * 0.03, 0.05, 1.0); } // 皮孔微糙保留（裂线项随段去）`
      : `if (vUv.y >= 6.0) { roughnessFactor = 0.72; }
else if (vUv.y >= 4.5) { roughnessFactor = 0.76; }
else { roughnessFactor = 0.87; } // Low：单色调光滑基底（皮孔亚像素去）`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${KOE_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${KOE_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${KOE_FLOWER_ALPHA}`,
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
    if (level === 'high') { // 果域弱背光透射（High）；Mid/Low 不注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${KOE_FRUIT_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `koelreuteria:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：koeDepthAlpha 三分支（叶卡 SDF / 花
 * 卡 alpha / 皮果实体守卫）+ alphaTest 0.5。level 分档（SDF 单一来源分档——档间
 * 表面/影裁切叶形一致）：Mid = High SDF（同源全形含两级窗列 + 锯齿——档间剪影
 * 一致）；Low = KOE_LEAF_SDF_LOW（表面/影档内一致——去窗列版）。**深度片元不挂
 * 噪声库**——SDF/花簇零 facVnoise 引用（两级窗列/锯齿载波/花簇格全 ALU inline
 * sin-hash；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 组 0 守卫：皮/果域（aLeafRand 恒 0 且 v≥4.5 域判据）走实心分支，防叶形 SDF 在
 * 圆柱/八面体 uv 域上误裁出洞（platanus 恒等 attribute 实心守卫先例 + uv 域路由）。
 * 风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap 按主材
 * 质 DoubleSide 覆写为双面（叶卡/花卡两面皆可投影）；alphaTest 由 shadowMap 按主
 * 材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createKoelreuteriaLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡/花卡 uv
  const leafSdf = level === 'low' ? KOE_LEAF_SDF_LOW : KOE_LEAF_SDF; // Mid 深度 = High SDF（同源全形含两级窗列 + 锯齿）
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
${leafSdf}
${KOE_FLOWER_ALPHA}
${KOE_DEPTH_ALPHA}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = koeDepthAlpha(vUv, vLeafRand); // 三分支：叶 SDF / 花 alpha / 皮果实心`,
    );
  };
  material.customProgramCacheKey = () => `koelreuteria:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
