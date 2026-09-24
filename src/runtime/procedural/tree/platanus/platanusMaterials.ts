/**
 * runtime/procedural/tree/platanus/platanusMaterials —— 悬铃木（asset_tree_platanus）
 * 叶/树皮材质 + 风动 + 叶影深度材质（T011.5，阔叶族第六材质实例）。
 *
 * 职责：复制五先例已验收的配方方法（onBeforeCompile 注入工厂 L2 全套纪律：
 *   replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 *   <color_fragment> 绝不触碰），物种配方按悬铃木自己的 Reference Spec 换装——
 *   Spec docs/research/platanus-reference.md **1.0**（任务书锚点 1.0，开工前已校验一致，含
 *   2026-09-20 终审记档：文献轴 16/16 逐字通过；**终审降级口径执行**——①「中龄 ≈12–14m」
 *   由照片带参照实测降级为弱 Inferred（form-a/b 作废、form-c/d 无参照粗估同量级），树高/
 *   冠基类工程锚按弱 Inferred 记档；②裂深典型 1/2、深端可至 2/3（leaf-a 单点低权重）——
 *   生产域 0.19–0.26 覆盖；③树皮斑块 ≈干径 1/8–1/12 主口径、细碎端至 1/20 带宽保留）。
 *   消费冻结几何契约（与五先例同款）：组 0 树皮 FrontSide / 组 1 叶卡 DoubleSide，叶卡固有
 *   attribute aLeafRand / aBend + 实例 aSeed；树皮组 aLeafRand 恒 0、aBend 恒 0。
 *
 * 【掌状裂 SDF——本任务核心，银杏先例的推广性结论与新路径】
 *   银杏先例 = 「半周期包络（扇形单调张开）+ 顶端宽边半平面 + min 合成 + 顶端缺刻 dip」。
 *   推广性评估结论：**dip 减法机制可推广、缺刻的顶边挂载不可推广**——银杏缺刻（深 0.02–
 *   0.30、集中顶边、侧缘平直）是「边缘局部刻痕」；悬铃木掌状 5 裂（裂深典型 1/2 深端 2/3、
 *   sinus 分布侧缘全长、裂片自叶中带向外放射张开）是「轮廓的多裂重组」，两者不是同量级
 *   的边缘扰动。顶边挂载的三处失效：①裂深 1/2 远超顶边 dip 的可表达域（顶边半平面自身
 *   高度 <1）；②sinus 在侧缘全长分布而非集中于顶边；③裂片「自掌心放射张开」的方向性
 *   （中央裂片向上、侧裂片向斜上外）无法由顶边调制产生。新路径 = **叶基放射角窗 dip 族**
 *   （本文件内最小扩展，不扩公共抽象）：
 *   ① 阔卵形基底包络回归先例全周期框架 sin(π·v^0.85)（峰 v≈0.42 偏基——宽>长阔卵读向，
 *     Spec §2「叶阔卵形，宽12-25厘米，长10-24厘米」建模域宽 15–22×长 12–18 Verified
 *     [1][3]+Inferred [9]；宽高比归几何侧）+ 变指数收口（基 0.60 急张 ≈ 截形-微心形基
 *     Verified [1][3]，上段 1.22 中央裂片先端渐尖 Verified [1][3][4][8][9]）。
 *   ② 放射角坐标 t = |x|/max(v, 0.10)（免 atan 的射线族代理——沿自叶基放射线恒定，银杏
 *     二叉脉同款坐标）：dip 窗在 t 域开窗 = 在叶缘的放射扇区开窗，窗内沿放射方向把边缘
 *     向内推进 depth——裁出的谷线自动倾斜（跟随包络弧线下行），谷两翼连续张开 = 裂片
 *     三角形侧缘的形状发生器（窗 mask 从中心向两翼衰减 = 中央裂片自谷底向先端渐宽再
 *     收尖，正是「中央裂片阔三角形宽≈长、先端渐尖」Verified 的发生学表达）。
 *   ③ 主 sinus 窗 ×2 对称（t0=0.55、半宽 0.30、pow 1.6 圆底谷）：深度逐叶 0.19–0.26
 *     （裂深 1/2 典型 / 深端 2/3——终审处置 2 域）。数值自洽锚：D=0.20 时谷底落
 *     (0.275, 0.50)——中央裂片半宽 0.275 × 2 = 0.55 ≈ 裂片长 0.50（宽≈长 ±10%）。
 *   ④ 下侧 sinus 窗 ×2 对称（t0=1.10、半宽 0.38、深 0.09）：浅于主 sinus——「5 裂 vs
 *     3 裂」的分化所在（下侧 sinus 有一定深度但浅于主 sinus = 侧裂片与基角分化读向）；
 *     裂数分型按 rand 统计近似（5 主相 75% / 3 裂 15%（下侧 sinus 压灭 + 主 sinus ×0.85
 *     偏浅——Spec §6「3 裂偏浅」）/ 7 裂 10%（下侧 sinus ×1.8 加深——7 裂记为统计近似
 *     读向不精确复现第三窗，分布定量 Unknown Spec §6 记档）。
 *   ⑤ v 门控 smoothstep(0.28, 0.42, v)：FRPS「**上部**掌状5裂」Verified [1][3]（裂片
 *     系统在上部）+ 叶下部穿洞保护（门控满深点 v=0.42 处放射线余量 ≥0.008 > 0——最大
 *     深端 0.26 下仍正，JS 数值锚测试覆盖）。
 *   ⑥ 裂片疏粗齿（Spec §4「裂片全缘或有1-2个粗大锯齿」Verified [1][3]+照片 [9]「全缘
 *     为主偶 1–2 粗齿」）：角向低频载波 cos(t·8.0)（≈1.3 齿/侧裂片带——疏）、pow 2.0
 *     钝头粗齿（vs 榉树 pow 2.6 尖头——悬铃木粗齿阔钝）、幅度逐叶 0.008–0.022 变奏
 *     （「全缘为主偶有」的统计近似——低幅端 ≈ 全缘类）；峰值 0.022 < 坡宽 0.04 的 75%
 *     裁切闪烁纪律。全 ALU 零噪声（窗/载波全 pow+cos——沿榉树 011.3「齿载波 ALU 化 =
 *     深度零噪声」组合先例）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - 【离基掌状 3 脉——前例脉型库推广】樟树「离基三出脉」（离基点 v=0.10 分离、先端前
 *     吻合内收 0.42·(v−0.10)^0.55·(1−0.52v)）为最近先例；悬铃木「掌状脉3条，稀为5条，
 *     常离基部数毫米，或为基出」Verified [1][3] 的分化 = 侧脉**外展伸入侧裂片**（掌状
 *     辐射读向，不吻合内收）——轨迹 max(v−v0,0)·(1.25−0.50·smoothstep(0.30,0.55,v))：
 *     下段斜率 1.25 外张、上段内收贴侧裂片中轴（v=0.50 处 |x|≈0.37——t≈0.74 恰在主
 *     sinus 窗外缘的侧裂片体内）；离基点 v0 按 rand 两型统计（离基型 75% v0=0.10 / 基出
 *     型 25% v0=0.0——「常离基部数毫米，或为基出」两型 Verified [1] 的统计近似）；脉端
 *     渐隐 0.52–0.66（达侧裂片中带——掌状脉达裂片不达缘，subpalmate 口径）。「稀 5」第
 *     二对 15% 叶出现（step 门控整对开关——FRPS「稀为5条」统计近似，更上位 v0+0.14、
 *     权重 0.35 弱层）。中脉带平顶加宽（先例口径）延中央裂片。非逐齿/逐裂片相位锁定
 *     记档（对齐需 rand 相位耦合，收益亚像素——沿榉树口径）。
 *   - 两面区分（Spec §5「medium to dark green……undersides of the leaf are a paler
 *     green」NC Verified [7]+背面色浅照片 Inferred [9]）：底色 #527e39 中绿（工程设定
 *     ——NC "medium green" + 照片中绿无粉感 [9] 交叉；亮度 111.6 六树链：银杏 161.6 >
 *     朴树 117.4 > **悬铃木 111.6** > 夏栎 105.7 > 榉树 93.4 > 香樟 84.9——中绿中档；
 *     G−B 69 与朴树 67 同档黄绿量级）；叶背 ×(1.08, 1.10, 1.02) R/G 主导提亮 B 低抬
 *     ——浅绿暖读向**无粉感**（vs 香樟 ×(1.06,1.05,1.16) B 主导 glaucous 分化）、幅度
 *     略弱于榉树 ×(1.10,1.12,1.04)（两面差中等可辨）；两面糙度差 +0.06（夏成叶近无毛
 *     两面趋光滑——差六树最小）。
 *   - 背脉腋残毛（FRPS「以后变秃净，**仅在背脉腋内有毛**」Verified [1]+Wikipedia
 *     "hairless by late summer" [5]+照片 [9]）：High 专属亚视觉弱表达——背脉腋（离基
 *     点腋 v≈0.13、|x|≈0.05 椭圆域）轻暗暖点 ×(0.94, 0.92, 0.87)，仅背面（香樟脉腋
 *     腺窝 domatia 同位同款表达；正面隆起不做记档——近景预算留背面，沿樟口径）。
 *   - 大叶纹理频率相对卡尺度（任务书「叶面尺度感」）：叶片大（15–22cm，六树最大一个
 *     量级）→ 同卡面内脉络/齿/变奏的频率取低（齿 ≈1.3 齿/裂片带 vs 榉 10 齿/侧全缘、
 *     叶团波长 ≈0.95m 大团块）——「大叶 = 粗质低频」读向（Spec §3「叶质极粗 coarse」
 *     Inferred [9]）。
 *   - 叶面哑光-半光泽（Spec §5「大叶厚实挺括（thick and stiff）」Verified [5]+哑光-
 *     半光泽 Inferred [9]）：roughness 0.66（厚实挺括微光——介于榉树 0.62 与朴树
 *     0.72 之间偏榉）。
 *   - 背光透光中等（Spec §5「背光透光中等（大叶面积 + 裂缺）」Inferred [9]——厚实叶
 *     面透光弱、裂缺让背光破碎，综合中等偏弱）：峰值 0.28（厚于朴树纸质 0.30 略弱——
 *     "thick and stiff" Verified [5]；裂缺补偿不加强峰值，记档）+ 透射色 (0.56,0.90,
 *     0.36) 中绿基调；逐叶变奏 pltTransVar ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand：色相两端冷中绿↔暖黄绿（Spec §6 变体读向；通道摆幅 ≤15%
 *     纪律）+ 明度 ±8%（去相关取样）+ 裂深 0.19–0.26 / 裂数 75/15/10 / 齿幅 0.008–
 *     0.022 / 脉离基两型 75/25 / 稀 5 脉 15%（多通道复用同一 rand——aLeafRand 单属性
 *     的统计近似是家族契约下的最大表达，裂数/叶位分化归几何侧——契约缺口候选①）。
 *   - 冠内竖向自遮蔽（冠基 ≈3.6m——干高占比 0.25–0.35 Spec §3/§A Inferred [9] ×
 *     树高 12m 弱 Inferred 终审降级口径的中值，工程记档无实证）+ 中频叶团斑块（High，
 *     波长 ≈0.95m ≈ 团块 1/10–1/15 冠幅 8–10m Spec §B Inferred [9]——六树最大团块）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent——实例化 +
 *     深度排序灾难）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值微调记档）：整树缓摆 ~0.18Hz / 顶部 ~4.5cm
 *     （aSeed 相位，hash 常数换 81.273——与朴 78.233/樟 79.193/榉 77.669/银杏 82.537
 *     相位流去相关）+ 叶片快颤 8–14 rad/s（≈1.3–2.2Hz **六树最低频**）/ ≤15mm（**六树
 *     最大幅度**——大叶长柄重摆：柄 3–10cm ≈ 叶宽同量级 Verified [1][3]+照片 ≈0.8–
 *     1.1× 叶宽 Inferred [9]，叶片 15–22cm 大且厚实挺括 → 摆锤质量最大、周期最长：
 *     幅度 > 银杏长柄扇叶 13mm > 樟 11mm > 榉 8mm、频率 < 银杏 10–17）；aBend 权重；
 *     树高锚 12m（×0.0833——中龄 12–14m 照片域下沿**弱 Inferred 终审降级口径**记档；
 *     若混植年轻化 8–10m 个体顶部权重 0.67–0.83，摆幅相应缩——方向正确记档）。
 *
 * 皮（组 0）配方（**第六种树皮语言：光滑基底大片地图状斑块剥落 + 冷调三色带多代拼贴**——
 *   vs 夏栎脊沟浮雕 / 朴树平滑-浅裂小斑 / 香樟纵裂深沟 / 榉树光滑+暖色小片斑驳 / 银杏
 *   灰褐纵裂脊沟；与榉树同「光滑剥落」族的**三重分化**：①色温（榉暖褐锈橙单色系 /
 *     悬**冷调含灰绿**三色并存——OSU "cream, olive, light brown" 原句 Verified [8]；
 *     ②斑尺度（悬 ≈干径 1/8–1/12 **大片地图状** Inferred [9]+细端 1/20 终审带宽 /
 *     榉小片斑驳）；③对比（悬多代高对比拼贴——新露奶油白 1.32 vs 老斑灰褐 0.78 极差
 *     ×1.7 / 榉柔和）——Spec §5 六资产树皮语言分化定位 Verified+Inferred [7][8][9]）：
 *   - 光滑基底无脊沟系统（FRPS「树皮光滑，大片块状脱落」Verified [1]+FOC 科级
 *     "smooth, exfoliating in plates" [4]）：零 tri 剖面零裂线游走（沿榉树无脊沟先例
 *     ——光滑由均匀基底 + 斑块色差直读）。
 *   - 主调 #787e6f 灰绿-灰褐（工程设定——Wikipedia "pale grey-green" [5]+OSU olive
 *     [8]+照片灰绿-灰褐 [9] 交叉；G−R = +6 六树最绿读向（榉 +4 灰绿弱、樟 +11 暖褐）
 *     ——冷调灰绿基底与榉树灰白基底的色温分化点①）。
 *   - 三色带多代拼贴（身份核心，剥落型全干拼贴——中龄活跃期剥落代占干面主导 ≈55–60%
 *     / 老斑 ≈35–40% / 沟缝深褐细线，无「未剥落基底」概念——Spec §5「中龄斑块剥落
 *     活跃期（干面斑块已占主导）」Inferred [1][8][9]）：**满干型**（非门控型——幼树
 *     基段先起斑不建模，目标龄级中龄满干活跃，取证机位无需门控处理、缺口 D 按「非门
 *     控型」记录）。代场 tone 低频 (3.2, 2.8)（主斑 ≈干径 1/8–1/12 大片地图状——
 *     vs 榉 (6,5) 更低频更大斑，分化点②）分三带：
 *     新露带 tone>0.65 ≈27%：奶油白 (1.32,1.28,1.14) - 浅黄绿 (1.24,1.27,1.05)
 *       （OSU cream / NC "creamy olive inner bark" Verified [7][8]——新露光滑高亮）
 *     过渡带 0.44–0.65 ≈30%：灰绿 (1.06,1.11,0.96) - 橄榄 (1.00,1.06,0.92)
 *       （OSU olive 原句——**冷调含灰绿**与榉锈橙互斥，分化点①核心）
 *     老斑带 <0.44 ≈40%：灰褐 (0.88,0.86,0.82) - 浅褐 (0.78,0.74,0.70)
 *       （OSU light brown / FOC "pale brown, gray" Verified [4][8]）
 *   - 破碎场 fine (7.5, 6.5)（High 专属第二采样）：带内二级色变（每斑内部两色微变）
 *     + 细碎小斑（细端 1/20 干径带宽——终审处置 3「最小斑块留此带宽」）+ 代块边缘
 *     扰曲（地图状不规则边缘——tone 阈值被 fine 高频扰曲，零额外采样的曲折边）。
 *   - 代块边缘翘曲缝深褐（贴片感）：tone 带间过渡带（0.44/0.65 两侧 0.06 三角窗）×
 *     ×(0.66,0.62,0.58) 深褐缝 × fine 门控曲折（bark-a「沟缝近黑」终审判读 [9]——
 *     剥落块缘翘曲阴影读向，榉树斑缘缝暗同族表达）；中距拼贴贴片感保留（Mid 保留
 *     直缝版）。
 *   - 干上部/细枝：拼贴向红褐均匀收敛 mix 0.85（斑径 < 枝径不可辨 + FRPS「老枝秃净，
 *     红褐色」Verified [1][3]——红褐偏色 ×(1.06,0.94,0.84)；嫩枝灰黄绒毛（FRPS
 *     「嫩枝密生灰黄色绒毛」Verified [1][3]）亚视觉不单独表达记档——灰黄绒毛为当年
 *     生枝近景细节，并入红褐偏色的暖向）；高度门控 smoothstep(3.0, 5.5)（冠基 3.6m
 *     上方渐入——结构剪影项三档保留）。
 *   - 苔藓/地衣**不做**记档：Spec §5「无苔藓/地衣附着判读（三源，低置信）」——不做
 *     不编造（沿榉/银杏先例）。
 *   - 微起伏已归几何层（剥落块翘曲的浮雕表达在几何侧皮组起伏语言，任务书口径），
 *     材质只管色层。
 *   - 风动：整树缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用）。
 *
 * 果序材质分工说明（现行配方：**果序域 v≥4 主动绿褐着色**，含梗）：果序并入皮组（组 0
 *   ——emitFruitBall 冻结接口：顶点 uv v∈[4,5] 果序域，与皮管弧长域 v ≤ ≈3.1 双重隔离），
 *   皮材质三档 map_fragment 注入体尾部整域门控（step(4.0, vUv.y)）——diffuseColor 直接
 *   覆盖为绿褐密刺球读向（显示色 #6a7245 级 = 线性 (0.144, 0.168, 0.060)，sRGB 编码往返
 *   (106,114,69)；三色带拼贴 / 红褐收敛对果序域让位——冠上部红褐染果球的褐系近似旧案
 *   废止）+ 逐球变奏（0.5m 格 xz 量化散列 facHash21 纯 ALU、幅度 ±5% ≤10% 上限——避免
 *   均一塑料球感；零新噪声采样，Mid/Low 1× vnoise 成本账不超标）+ 果序域 roughness →
 *   0.95 高糙（简色高糙记档口径）。Low 几何不发射果序（域内无顶点、门控恒 0 零成本），
 *   分支保留——三档 GLSL 一致，契约日后 Low 发射果序时材质侧免改。深度侧无需改动：皮组
 *   aLeafRand=0 实心守卫天然覆盖果序（果影实心不变）。密刺浮雕（宿存花柱刺状）归几何
 *   顶点（八面体 flat 面读向）；若族级需独立果序光照/刺状表面着色 = 第三材质组契约扩展，
 *   记候选④。
 *
 * 深度材质（叶影裁切，customDepthMaterial 契约通道——沿 SOP §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与叶表面
 *     材质共享同一 GLSL 字符串（表面改叶形深度自动同步，不复制粘贴）。
 *   - **零噪声库注入**：掌状裂窗/齿载波全 ALU（pow 窗 + cos——沿榉树 011.3「齿载波
 *     ALU 化 = 深度零噪声」+ 银杏 011.4 缺刻 ALU 化组合先例）→ SDF 零 facVnoise 引用
 *     → 深度片元不挂 FACILITY_GLSL_NOISE。保护性约束：SDF 字符串内不得引入 facVnoise
 *     ——引入即深度材质编译暴雷（未声明函数），防复制粘贴漂移。
 *   - 多材质网格守卫：皮组以恒等 attribute（aLeafRand=0）走实心分支，防叶形 SDF 在圆柱
 *     uv 域上误裁出洞。
 *   - 档位匹配：Mid = High SDF 同源全形（含 dip 裂系统与齿——档间剪影一致，多裂 ALU
 *     成本可忽略）/ Low = SDF_LOW 零裂版（远距「掌状裂轮廓不可辨」Spec §7 牺牲顺序
 *     「叶脉细节与裂片齿 → 果序刺状表面 → 掌状裂轮廓与裂深」——裂形细化先于阔卵轮廓
 *     牺牲；包络/收口与 High 逐字同源——去细节不改形原则，沿朴/榉/银杏 SDF_LOW 体例）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T011.5，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去离基掌状脉三件（中脉带/侧脉对/稀 5 第二对）/背脉腋残毛/中频叶团（Spec
 *     §7 叶脉仅近距可辨，Mid 观距不可辨）+ 糙度叶团项；SDF 全形（含 dip 裂 + 齿——
 *     档间剪影一致）/透光/叶背/hue·luma/shade/两面糙度差保留（颜色层次档间连续保留面）。
 *   - 叶 Low：SDF 换 PLATANUS_LEAF_SDF_LOW（去 dip 裂系统/齿/分型——裂形细化；包络/
 *     收口与 High 逐字同源）+ 去透光（远距逆光透射不可辨）/叶脉/残毛/叶团；hue·luma/
 *     shade/叶背保留；片元零噪声。
 *   - 皮 Mid：去破碎场 fine（带内二级色变均值化 + 细碎小斑去采样）、缝改直缝（去 fine
 *     扰曲——中距贴片感保留）；三色带拼贴本体 + 上部红褐保留——**中距「干面三色带
 *     地图状斑块剥落」= 最强身份信号**（Spec §7 中距保留面，OSU "best asset"）。
 *   - 皮 Low：三色带拼贴保留（**远距「干面奶油/灰绿/灰褐斑驳拼贴剪影可辨」Spec §7
 *     远距保留面——vs 榉树 Low 斑驳全去的分化：悬铃木远距斑驳是保留项**）+ 上部红褐；
 *     去缝/去 fine；1× vnoise（tone）。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；platanus 前缀不与五先例混缓存）：
 *     'platanus:leaf' / 'platanus:leaf:mid' / 'platanus:leaf:low'；'platanus:bark' /
 *     'platanus:bark:mid' / 'platanus:bark:low'；'platanus:leaf-depth' /
 *     'platanus:leaf-depth:mid' / 'platanus:leaf-depth:low'（9 键全异）。
 *   - 风动（PLATANUS_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分
 *     （同公式同常数同 aBend 语义，D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团斑块；dip 窗/齿载波 ALU 化免噪声）= 3× + SDF（包络
 *     sin/pow + 双 dip 窗 pow×2 + 齿 cos——多裂比先例 SDF +2×）≈ 7× + 离基掌状脉
 *     （4 距离场 + 两型 mix）≈ 3× + 透光/两面/残毛/hue·shade ≈ 2× ≈ **12×**（高于
 *     银杏 8×、低于朴树 11.5× 上限同档——多裂 SDF + 双窗的账，掌状裂身份核心接受）；
 *   - 叶 Mid 片元 = 0× 噪声（噪声库死码编译消除）+ 简化 ALU ≈ 3×；
 *   - 叶 Low 片元 = 0× 噪声 + SDF_LOW 简化 ALU ≈ 2×；
 *   - 皮 High 片元 = 2× vnoise（代场 + 破碎场）= 6× + 三带 mix 链/缝/门控纯 ALU
 *     ≈ 2× + 果序域分支（step 门控 + facHash21 ≈1× + mix）≈ 1× ≈ 9×；
 *   - 皮 Mid/Low 片元 = 1× vnoise（代场）= 3× + 三带/缝(ALU) ≈ 1.5× + 果序域分支
 *     ≈ 1× ≈ 5.5×（Low 去缝 ≈ 5×）；
 *   - 深度片元 = SDF 纯 ALU ≈ 6×（多裂双窗高于先例 1.5×——多裂 SDF 的账记档），
 *     **零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——放射角窗 dip/离基掌状脉
 * 全部限定文件内）：
 *   ① 裂数/裂深/齿幅/脉型分型共用 aLeafRand 单属性统计近似（多通道复用同一 rand——
 *     裂数 75/15/10 与叶位/树势的相关性无法表达）：几何侧若有叶位语义通道可精确分型
 *     （候选：叶位 attribute 或挂点组语义）；
 *   ② 掌状裂「叶基放射角窗 dip 族」SDF：本文件内实现，若族内再现多裂深裂叶形（枫/梧桐
 *     类）可提炼为家族公共 SDF 模式（暂不动公共抽象）；
 *   ③ 离基掌状脉（外展辐射型）装饰层：与樟离基三出（内收吻合型）同族不同向，脉层五型
 *     （中轴/三出/离基三出/羽状/辐射/掌状辐射）公共抽象待族级收口评估；
 *   ④ 果序（成对绿褐密刺球）色已由皮材质果序域 v≥4 整域绿褐着色承担（球+梗、简色高糙
 *     #6a7245 级——见「果序材质分工说明」）；剩余缺口：密刺表面细节/独立果序光照无
 *     通道（若族级需要 → 第三材质组契约扩展）；
 *   ⑤ 大叶长柄重摆的树高锚 12m 为弱 Inferred（终审降级）：树高/冠基类锚与几何侧实际
 *     建树高度的联动无跨层通道（风动锚与 shade 冠基各自硬编码——若 profile 侧树高
 *     变更需材质侧同步，候选：锚点常量上提到 profile 或 build 传参）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与 celtis/camphor/
 *   zelkova/ginkgo/tree3a 的通用段（风动公式等）为复制改造非 import（资产私有，跨资产
 *   不耦合——organization.md 边界）。
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
  if (!source.includes(target)) throw new Error(`platanus 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，树皮恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值微调记档：
 * hash 常数 81.273/57.431（与朴/樟/榉/银杏相位流去相关）+ 树高锚 12m（×0.0833——中龄
 * 12–14m 照片域下沿**弱 Inferred 终审降级口径**：混植年轻化 8–10m 个体顶部权重 0.67–
 * 0.83 记档）；快颤 8–14 rad/s（≈1.3–2.2Hz **六树最低频**）/ ≤15mm（**六树最大幅度**
 * ——大叶长柄重摆：柄 3–10cm ≈ 叶宽同量级 Verified [1][3]，叶 15–22cm 大且厚实挺括
 * Verified [5] → 摆锤质量最大周期最长：幅度 > 银杏 13mm > 樟 11mm > 榉 8mm、频率 <
 * 银杏 10–17 rad/s）。
 */
const PLATANUS_WIND = /* glsl */ `
// platanus wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float pltWindPhase = fract(sin(aSeed * 81.273 + 4.15) * 43758.5453);
float pltWindH = clamp(position.y * 0.0833, 0.0, 1.0); // /12m 锚点树高（弱 Inferred 终审降级口径——缩放抖动下权重近似）
float pltSway = pltWindH * pltWindH * 0.045 * sin(uTime * 1.15 + pltWindPhase * 6.28318 + pltWindH * 1.4);
// 叶片快颤：ω = 8 + 6φ（8–14 rad/s ≈ 1.3–2.2Hz 六树最低——大叶厚实摆锤周期最长），幅度 ≤15mm 六树最大（柄 3–10cm ≈ 叶宽同量级 + 大叶质量）；权重 = aBend（卡根≈0 尖大）
float pltFlutterPhase = fract(sin((aSeed + aLeafRand) * 57.431 + 6.2) * 43758.5453);
float pltFlutter = aBend * 0.015 * sin(uTime * (8.0 + 6.0 * pltFlutterPhase) + pltFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (pltSway + pltFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(pltSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * pltFlutter * 0.9; // 叶面沿卡法线微扑（树皮 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——皮组 aLeafRand/aBend 恒 0 契约） */
const PLATANUS_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 悬铃木掌状裂叶形覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶顶 1；宽>长比例归几何侧）：
 * 阔卵形基底包络 sin(π·v^0.85)（峰 v≈0.42 偏基——宽>长阔卵读向，Spec §2 Verified
 * [1][3]+Inferred [9]）× 变指数收口（基 0.60 急张 ≈ 截形基 / 上段 1.22 中央裂片先端
 * 渐尖——Spec §4 Verified [1][3][4][8][9]）× **叶基放射角窗 dip 族**（掌状裂新路径：
 * t = |x|/max(v,0.10) 免 atan 射线族代理，主 sinus 窗 t0=0.55 半宽 0.30 深 0.19–0.26
 * （裂深 1/2 典型深端 2/3——终审处置 2）×2 对称 + 下侧 sinus 窗 t0=1.10 半宽 0.38 深
 * 0.09（5 裂 vs 3 裂分化）×2 对称 + v 门控 0.28–0.42（FRPS「上部掌状5裂」+ 叶下部穿洞
 * 保护）+ 裂数分型 75/15/10（rand 统计近似——分布定量 Unknown Spec §6））× 裂片疏粗
 * 齿载波 cos(t·8.0)（≈1.3 齿/侧裂片带、pow 2.0 钝头、幅度 0.008–0.022 逐叶变奏——
 * 「全缘为主偶 1–2 粗齿」Verified [1][3] 统计近似）；**零 facVnoise 引用是深度材质
 * 不挂噪声库的前提（引入即深度编译暴雷——保护性约束；窗/载波全 ALU——沿榉 011.3 +
 * 银杏 011.4 组合先例）**；返回近似符号距离的覆盖率坡（edge/0.04——alphaToCoverage
 * 的 fwidth smoothstep 吃这条坡抗锯边；坡宽 0.04 沿先例 AA 口径）。
 */
const PLATANUS_LEAF_SDF = /* glsl */ `
float pltLeafAlpha(vec2 pltUv, float pltRand) {
  vec2 pltP = vec2(pltUv.x - 0.5, pltUv.y);
  float pltAbsX = abs(pltP.x);
  // 阔卵形包络：v^0.85 峰 v≈0.42 偏基（宽>长阔卵）+ 变指数收口（基 0.60 急张 ≈ 截形-微心形基 → 上段 1.22 中央裂片先端渐尖）
  float pltEnvSin = sin(3.14159 * pow(clamp(pltP.y, 0.001, 0.999), 0.85));
  float pltEnv = pow(pltEnvSin, mix(0.60, 1.22, smoothstep(0.35, 0.95, pltP.y)));
  // 裂数分型（rand 统计近似 5 裂主相 75% / 3 裂 15%（下侧 sinus 压灭 + 主 sinus ×0.85 偏浅）/ 7 裂 10%（下侧 sinus ×1.8 加深读向）——分布定量 Unknown Spec §6 记档）
  float pltR2 = fract(pltRand * 6.917 + 0.53);
  float pltLobe3 = 1.0 - step(0.15, pltR2);
  float pltLobe7 = step(0.90, pltR2);
  // 叶基放射角坐标（免 atan——沿自叶基放射线恒定的射线族代理，银杏二叉脉同款）
  float pltT = pltAbsX / max(pltP.y, 0.10);
  float pltGate = smoothstep(0.28, 0.42, pltP.y); // 裂片系统门控：FRPS「上部掌状5裂」Verified + 叶下部穿洞保护（满深点 v=0.42 放射线余量 >0——JS 数值锚测试覆盖）
  // 主 sinus（中央/上侧裂片间，×2 对称）：窗 t0=0.55 半宽 0.30 pow 1.6 圆底谷；深度逐叶 0.19–0.26（裂深 1/2 典型深端 2/3——终审处置 2）；D=0.20 时谷底 (0.275, 0.50) = 中央裂片半宽×2 ≈ 裂片长（宽≈长 Verified 数值自洽锚）
  float pltDepth1 = (0.19 + 0.07 * fract(pltRand * 4.517 + 0.27)) * mix(1.0, 0.85, pltLobe3) * mix(1.0, 1.06, pltLobe7);
  float pltDip1 = pltDepth1 * pow(max(0.0, 1.0 - abs(pltT - 0.55) / 0.30), 1.6) * pltGate;
  // 下侧 sinus（浅——「5 裂 vs 3 裂」分化所在，×2 对称）：窗 t0=1.10 半宽 0.38；三裂压灭 0 / 五裂 1 / 七裂 ×1.8（7 裂 = 统计近似读向不精确复现第三窗，记档）
  float pltDepth2 = 0.09 * mix(mix(1.0, 1.8, pltLobe7), 0.0, pltLobe3);
  float pltDip2 = pltDepth2 * pow(max(0.0, 1.0 - abs(pltT - 1.10) / 0.38), 1.6) * pltGate;
  // 裂片疏粗齿（0–2 枚/裂片、全缘为主 Verified）：角向低频载波（≈1.3 齿/侧裂片带——大叶低频粗质读向）、pow 2.0 钝头（vs 榉 pow 2.6 尖头——粗齿阔钝）、幅度逐叶 0.008–0.022（「全缘为主偶有」统计近似）
  float pltTooth = pow(0.5 + 0.5 * cos(pltT * 8.0 - pltRand * 6.28), 2.0);
  float pltSerr = (pltTooth - 0.5) * 2.0 * (0.008 + 0.014 * fract(pltRand * 5.317 + 0.19)) * pltGate;
  float pltEdge = 0.5 * pltEnv + pltSerr - pltAbsX - pltDip1 - pltDip2;
  return clamp(pltEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.04（沿先例 AA 口径）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档取用）：
 * 阔卵形包络 + 变指数收口即可——去 dip 裂系统/齿/分型（**裂形细化**：远距掌状裂轮廓
 * 不可辨，Spec §7 牺牲顺序「叶脉细节与裂片齿 → 果序刺状表面 → 掌状裂轮廓与裂深」；
 * 片元零噪声先天成立）。包络/收口两项与 High 逐字同源（档间叶形身份一致的去细节不改形
 * 原则，沿朴/榉/银杏 SDF_LOW 体例——远距保留阔卵大叶轮廓色块）。
 */
const PLATANUS_LEAF_SDF_LOW = /* glsl */ `
float pltLeafAlpha(vec2 pltUv, float pltRand) {
  vec2 pltP = vec2(pltUv.x - 0.5, pltUv.y);
  float pltEnvSin = sin(3.14159 * pow(clamp(pltP.y, 0.001, 0.999), 0.85)); // 阔卵包络（与 High 逐字同源）
  float pltEnv = pow(pltEnvSin, mix(0.60, 1.22, smoothstep(0.35, 0.95, pltP.y)));
  float pltEdge = 0.5 * pltEnv - abs(pltP.x); // 去 dip 裂系统/齿（pltRand 保留双参签名沿家族契约、Low 不用）
  return clamp(pltEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/叶脉三件/残毛——叶团乘子 0.94+0.12×pltClump 均值化 = 1.0 消去，值噪声
 *  均值 0.5 精确保均）。 */
const PLATANUS_LEAF_HEAD = /* glsl */ `
// platanus:leaf —— SDF 掌状裂叶覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float pltAlpha = pltLeafAlpha(vUv, vLeafRand);
diffuseColor.a = pltAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷中绿 ↔ 暖黄绿——Spec §5 中绿无粉感 + §6 变体读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 pltHue = mix(vec3(0.94, 1.00, 1.04), vec3(1.07, 1.04, 0.90), fract(vLeafRand * 6.517 + 0.33));
float pltLuma = 0.92 + 0.16 * fract(vLeafRand * 3.883 + 0.45);`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const PLATANUS_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.95m ≈ 团块 1/10–1/15 冠幅 8–10m Spec §B——六树最大团块；
// 大叶疏簇粗质读向 Spec §3 Inferred [9]；采样偏移与五先例去相关）
float pltClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 1.05 + vec2(25.1, 14.8));`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const PLATANUS_LEAF_SHADE = /* glsl */ `
float pltShade = clamp((vTreePos.y - 3.6) / 3.2, 0.0, 1.0); // 冠基 ≈3.6m（干高占比 0.25–0.35 Spec §3/§A Inferred [9] × 树高 12m 弱 Inferred 终审降级口径——工程中值记档无实证）`;

/** High 专属：离基掌状 3 脉（侧脉外展伸入侧裂片——樟离基三出先端吻合内收的推广分化）
 *  + 稀 5 第二对 + 背脉腋残毛因子，纯 ALU 零采样 */
const PLATANUS_LEAF_VEIN = /* glsl */ `
// 叶脉：中脉亮带（延中央裂片）+ 离基掌状 3 脉侧脉对（自中脉近基离基点分离、**外展伸入
// 侧裂片**——掌状辐射读向，vs 樟离基三出先端吻合内收：下段斜率 1.25 外张、上段内收贴
// 侧裂片中轴；脉端 0.52–0.66 渐隐 = 达裂片中带不达缘 subpalmate 口径）——FRPS「掌状脉
// 3条，稀为5条，常离基部数毫米，或为基出」Verified [1][3]；离基点两型统计（离基 75%
// v0=0.10 / 基出 25% v0=0.0——「常离基……或为基出」两型 Verified 的统计近似）；
// 稀 5 第二对 15% 叶出现（step 整对开关——FRPS「稀为5条」统计近似，更上位 v0+0.14
// 弱 0.35）；浅黄绿脉色（可见度沿朴树 Step 4b sRGB 编码压缩教训定标）；纯 ALU 零采样
vec2 pltP = vec2(vUv.x - 0.5, vUv.y);
float pltVeinMid = 1.0 - smoothstep(0.012, 0.040, abs(pltP.x)); // 中脉带（平顶加宽——先例口径）
float pltSupra = mix(0.10, 0.0, step(0.75, fract(vLeafRand * 6.613 + 0.47))); // 离基型 75% / 基出型 25%
float pltVeinPath = max(pltP.y - pltSupra, 0.0) * (1.25 - 0.50 * smoothstep(0.30, 0.55, pltP.y)); // 外展轨迹（伸入侧裂片体内——掌状辐射）
float pltVeinTri = (1.0 - pltVeinMid)
  * (1.0 - smoothstep(0.014, 0.050, abs(abs(pltP.x) - pltVeinPath))) // 两侧对称一对（±|x| 距离场）
  * smoothstep(0.08, 0.18, pltP.y) * (1.0 - smoothstep(0.52, 0.66, pltP.y)); // 离基点渐显、裂片中带渐隐（不达缘）
float pltVeinPath2 = max(pltP.y - pltSupra - 0.14, 0.0) * (1.30 - 0.55 * smoothstep(0.35, 0.60, pltP.y)); // 稀 5 型第二对轨迹（更上位离基）
float pltVeinTri2 = (1.0 - pltVeinMid)
  * (1.0 - smoothstep(0.012, 0.044, abs(abs(pltP.x) - pltVeinPath2)))
  * smoothstep(0.24, 0.34, pltP.y) * (1.0 - smoothstep(0.44, 0.56, pltP.y))
  * step(0.85, fract(vLeafRand * 8.417 + 0.63)); // 15% 五脉型整对开关
// 背脉腋残毛（FRPS「仅在背脉腋内有毛」Verified [1]——近景亚视觉弱表达，仅背面应用见 MUL_HIGH；
// 正面隆起不做记档——近景预算留背面，沿樟腺窝口径）
float pltFuzz = 1.0 - smoothstep(0.030, 0.085, length(vec2(abs(pltP.x) - 0.05, (pltP.y - 0.13) * 0.70)));
`;

/** High 专属：合成（叶团乘子 + 离基掌状脉调制 + 背脉腋残毛背面暗点） */
const PLATANUS_LEAF_MUL_HIGH = /* glsl */ `
vec3 pltMul = pltHue * pltLuma * (0.80 + 0.20 * pltShade) * (0.94 + 0.12 * pltClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
pltMul = mix(pltMul, pltMul * vec3(1.58, 1.36, 1.02), pltVeinMid * 1.00 + pltVeinTri * 0.75 + pltVeinTri2 * 0.35); // 离基掌状 3 脉身份核心 0.75（樟离基对 0.78 同级）；稀 5 第二对 0.35 守弱层
pltMul *= mix(vec3(1.0), vec3(0.94, 0.92, 0.87), pltFuzz * (1.0 - float(gl_FrontFacing)) * 0.8); // 背脉腋残毛轻暗暖（亚视觉——仅背面）
diffuseColor.rgb *= pltMul;`;

/** Mid/Low：合成（去叶团/叶脉/残毛项——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const PLATANUS_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 pltMul = pltHue * pltLuma * (0.80 + 0.20 * pltShade); // Mid/Low：叶团乘子均值化消去（T011.5）
diffuseColor.rgb *= pltMul;`;

/** 叶背浅绿无粉感（三档共用，纯 ALU 零采样零分支） */
const PLATANUS_LEAF_BACK = /* glsl */ `
// 叶背浅绿（Spec §5 NC "undersides paler green" Verified [7]+背面色浅照片 Inferred [9]）：
// gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，背面法线由 three 双面光照
// 自动翻转，此处只调固有色）——背面 R/G 主导提亮（浅绿 = 亮暖绿读向）、B 低抬（**无
// 冷灰粉感**——与香樟 ×(1.06,1.05,1.16) B 主导 glaucous 分化），幅度略弱于榉树
// ×(1.10,1.12,1.04)（两面差中等可辨）；两面糙度差 +0.06（夏成叶近无毛两面趋光滑——
// 差六树最小，见 roughnessmap 注入）；纯 ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.08, 1.10, 1.02), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  中等偏弱版：厚实挺括大叶（"thick and stiff" Verified [5]）透光中等偏弱——裂缺的
 *  背光破碎由 SDF alpha 天然给出（谷区透空），不加强峰值（记档）。 */
const PLATANUS_LEAF_TRANSLUCENCY = /* glsl */ `
// platanus:leaf —— 背光透射（中等偏弱）：视线与阳光反向时叶背透亮黄绿（叶绿素吸收红蓝 →
// 透射偏黄绿；厚实挺括叶面透光弱于朴树纸质——峰值 0.28 vs 朴树 0.30 / 银杏 0.34 / 榉树
// 0.40，Spec §5 [5][9]；裂缺背光破碎由 SDF alpha 承担）
#if NUM_DIR_LIGHTS > 0
  float pltBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float pltTransVar = 0.55 + 0.45 * fract(vLeafRand * 7.613 + 0.51); // 逐叶透光强度变奏
  outgoingLight += vec3(0.56, 0.90, 0.36) * directionalLights[0].color
    * pow(pltBack, 3.0) * pltTransVar * pltAlpha * 0.28;
#endif
`;

/** 树皮配方主体（<map_fragment> 后注入；uv 域 u=环绕一周 v=累计弧长 ×0.5 + 位置域门控）。
 *  分段拼装（沿先例体例）：High = HEAD + TONE + MUL；Mid = HEAD_MID + TONE_SIMPLE +
 *  MUL_MID（去破碎场 fine——带内二级色变均值化；缝改直缝）；Low = HEAD_LOW +
 *  TONE_SIMPLE + MUL_LOW（三色带保留——远距斑驳剪影 Spec §7 保留面；去缝）。 */
const PLATANUS_BARK_HEAD = /* glsl */ `
// platanus:bark —— 光滑基底大片地图状斑块剥落 + 冷调三色带多代拼贴（vs 夏栎脊沟 / 朴浅斑 / 樟纵裂 / 榉暖色小片 / 银杏灰褐纵裂——第六种语言：与榉三重分化 = 冷调含灰绿 / 大片地图状 / 多代高对比）`;

/** Mid 档头注释（内容面与 High 的差仅记档一行） */
const PLATANUS_BARK_HEAD_MID = /* glsl */ `
// platanus:bark:mid —— 三色带多代拼贴 + 直缝贴片感 + 上部红褐（T011.5 Mid：去破碎场 fine——带内二级色变均值化/细碎小斑去采样；三色带拼贴本体保留——中距最强身份信号 Spec §7）`;

/** Low 档头注释 */
const PLATANUS_BARK_HEAD_LOW = /* glsl */ `
// platanus:bark:low —— 三色带拼贴 + 上部红褐（T011.5 Low：远距「干面奶油/灰绿/灰褐斑驳拼贴剪影可辨」Spec §7 **保留面**——vs 榉树 Low 斑驳全去的分化；去缝/去 fine，1× vnoise）`;

/** 干上部/细枝高度门控（三档共用——结构剪影项三档保留，沿先例体例） */
const PLATANUS_BARK_HIGH = /* glsl */ `
// 干上部/细枝：拼贴向红褐收敛（斑径 < 枝径不可辨 + 老枝红褐秃净 FRPS Verified [1][3]）
float pltBarkHigh = smoothstep(3.0, 5.5, vTreePos.y); // 冠基 3.6m 上方渐入（12m 树工程锚——弱 Inferred 记档）`;

/** 代场采样（三档共用——Low 保留面的唯一采样）：低频大块多代拼贴主结构。
 *  频率 (3.2, 2.8)：主斑 ≈干径 1/8–1/12 大片地图状（vs 榉 (6,5) 更低频更大斑——分化点②；
 *  Spec §5 斑块尺度七读数 Inferred [9] + 终审处置 3 细端 1/20 带宽由 fine 场承担）。 */
const PLATANUS_BARK_TONE = /* glsl */ `
float pltBarkTone = facVnoise(vec2(vUv.x * 3.2, vUv.y * 2.8) + vec2(19.4, 11.2)); // 代场（低频大块——新露/过渡/老斑三带主结构）
// 破碎场（High 专属）：带内二级色变 + 细碎小斑（细端 1/20 干径带宽——终审处置 3）+ 代块边缘扰曲（地图状曲折边——tone 阈值被高频扰曲，零额外阈值的曲折边）
float pltBarkFine = facVnoise(vec2(vUv.x * 7.5, vUv.y * 6.5) + vec2(33.6, 21.7));`;

/** Mid/Low 代场采样（1× vnoise——去 fine） */
const PLATANUS_BARK_TONE_SIMPLE = /* glsl */ `
float pltBarkTone = facVnoise(vec2(vUv.x * 3.2, vUv.y * 2.8) + vec2(19.4, 11.2)); // 代场（与 High 逐字同源）`;

/** High：合成（三色带带内二级色变 + fine 扰曲缝 + 代块边缘翘曲缝深褐 + 上部红褐收敛） */
const PLATANUS_BARK_MUL = /* glsl */ `
// 三色带（tone 分带 + fine 带内二级色变——OSU "cream, olive, light brown" 原句 Verified [8] +
// NC "creamy olive inner bark" [7] + Wikipedia "pale grey-green" [5]；冷调含灰绿——与榉锈橙互斥）：
// 新露 ≈27%（奶油白-浅黄绿）/ 过渡 ≈30%（灰绿-橄榄）/ 老斑 ≈40%（灰褐-浅褐）——剥落代 ≈57%
// 占主导（中龄活跃期 Spec §5 Inferred [1][8][9]）
vec3 pltFresh = mix(vec3(1.32, 1.28, 1.14), vec3(1.24, 1.27, 1.05), smoothstep(0.35, 0.65, pltBarkFine)); // 新露：奶油白-浅黄绿（新露光滑高亮）
vec3 pltOlive = mix(vec3(1.06, 1.11, 0.96), vec3(1.00, 1.06, 0.92), smoothstep(0.35, 0.65, pltBarkFine)); // 过渡：灰绿-橄榄（冷调含灰绿——分化点①核心）
vec3 pltOld = mix(vec3(0.88, 0.86, 0.82), vec3(0.78, 0.74, 0.70), smoothstep(0.35, 0.65, pltBarkFine)); // 老斑：灰褐-浅褐（light brown / pale brown gray）
vec3 pltPlate = mix(mix(pltOld, pltOlive, smoothstep(0.38, 0.50, pltBarkTone)), pltFresh, smoothstep(0.60, 0.70, pltBarkTone));
// 代块边缘翘曲缝深褐（剥落块缘阴影——贴片感；bark-a「沟缝近黑」终审判读 [9]；fine 门控使缝走向曲折——地图状拼贴贴片感）
float pltSeam = clamp(max(1.0 - abs(pltBarkTone - 0.44) / 0.06, 1.0 - abs(pltBarkTone - 0.65) / 0.06), 0.0, 1.0)
  * smoothstep(0.40, 0.62, pltBarkFine);
pltPlate *= mix(vec3(1.0), vec3(0.66, 0.62, 0.58), pltSeam * 0.85);
// 干上部/细枝：拼贴向红褐均匀收敛（老枝红褐秃净 Verified [1][3]；嫩枝灰黄绒毛并入暖向——亚视觉不单独表达记档）
vec3 pltBarkMul = mix(pltPlate, vec3(1.06, 0.94, 0.84) * (0.90 + 0.10 * pltBarkTone), pltBarkHigh * 0.85);
diffuseColor.rgb *= pltBarkMul;
`;

/** Mid：合成（三色带 fine 均值化 + 直缝（去 fine 扰曲）+ 上部红褐——三色带阈值与 High 同源） */
const PLATANUS_BARK_MUL_MID = /* glsl */ `
vec3 pltFresh = vec3(1.28, 1.275, 1.095); // 新露均值（fine 0.5 两端中点——带内二级色变均值化）
vec3 pltOlive = vec3(1.03, 1.085, 0.94); // 过渡均值
vec3 pltOld = vec3(0.83, 0.80, 0.76); // 老斑均值
vec3 pltPlate = mix(mix(pltOld, pltOlive, smoothstep(0.38, 0.50, pltBarkTone)), pltFresh, smoothstep(0.60, 0.70, pltBarkTone));
float pltSeam = clamp(max(1.0 - abs(pltBarkTone - 0.44) / 0.06, 1.0 - abs(pltBarkTone - 0.65) / 0.06), 0.0, 1.0); // 直缝（无 fine 扰曲——中距贴片感保留）
pltPlate *= mix(vec3(1.0), vec3(0.66, 0.62, 0.58), pltSeam * 0.85);
vec3 pltBarkMul = mix(pltPlate, vec3(1.06, 0.94, 0.84) * (0.90 + 0.10 * pltBarkTone), pltBarkHigh * 0.85); // 上部红褐保留
diffuseColor.rgb *= pltBarkMul;
`;

/** Low：合成（三色带 fine 均值化 + 上部红褐；去缝——远距缝不可辨；三色带保留 = Spec §7
 *  远距「斑驳拼贴剪影可辨」保留面，vs 榉树 Low 全均值化的分化记档）。 */
const PLATANUS_BARK_MUL_LOW = /* glsl */ `
vec3 pltFresh = vec3(1.28, 1.275, 1.095); // 新露均值（与 Mid 逐字同源）
vec3 pltOlive = vec3(1.03, 1.085, 0.94);
vec3 pltOld = vec3(0.83, 0.80, 0.76);
vec3 pltPlate = mix(mix(pltOld, pltOlive, smoothstep(0.38, 0.50, pltBarkTone)), pltFresh, smoothstep(0.60, 0.70, pltBarkTone)); // 三色带拼贴保留（远距剪影保留面）
vec3 pltBarkMul = mix(pltPlate, vec3(1.06, 0.94, 0.84) * (0.90 + 0.10 * pltBarkTone), pltBarkHigh * 0.85); // 上部红褐（结构剪影项三档保留）
diffuseColor.rgb *= pltBarkMul;
`;

/** 宿存果序域着色（三档共用，拼装段末位——拼贴/红褐收敛先算后让位）：uv v∈[4,5] =
 *  果序域几何身份标记（emitFruitBall 冻结接口，球+梗整域；皮管弧长域 v ≤ ≈3.1 双重
 *  隔离——硬门 step 无过渡带，域间无几何）。绿褐密刺球显示色 #6a7245 级 = 线性
 *  (0.144, 0.168, 0.060)（sRGB EOTF 编码往返 (106,114,69)——直接覆盖不乘皮基色，
 *  与「简色高糙球面 color 0x6a7245」记档口径同源）+ 逐球变奏：0.5m 格 xz 量化散列
 *  （球径 0.048–0.064m ≈ 格 1/8——整球同格为主、成对球常同格；facHash21 纯 ALU
 *  零新采样）幅度 ±5%（≤10% 上限——避免均一塑料球感）。roughness 分支见
 *  PLATANUS_BARK_FRUIT_ROUGHNESS。 */
const PLATANUS_BARK_FRUIT = /* glsl */ `
// 宿存果序域（v∈[4,5]——球+梗整域身份标记，果序入皮组接口）：绿褐密刺球直接覆盖——
// 三色带拼贴/红褐收敛对果序域让位（真果序绿褐非红褐——冠缘「黄褐横条」误读修正）
float pltFruitGate = step(4.0, vUv.y);
float pltFruitRnd = facHash21(floor(vTreePos.xz * 2.0) + vec2(7.31, 3.17)); // 逐球量化散列（0.5m 格 xz；确定性 ALU）
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.144, 0.168, 0.060) * (0.95 + 0.10 * pltFruitRnd), pltFruitGate);
`;

/** 果序域高糙（三档共用）：果球 roughness → 0.95（密刺球哑光——简色高糙记档口径；
 *  pltFruitGate 由 map_fragment 注入体先定义，同 main 作用域可见） */
const PLATANUS_BARK_FRUIT_ROUGHNESS = /* glsl */ `
roughnessFactor = mix(roughnessFactor, 0.95, pltFruitGate); // 果序域高糙（皮管光滑微泽不进果球）`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 掌状裂叶 alphaTest 裁切 + 离基掌状 3 脉/稀 5/背脉腋残毛（High）+
 * 两面区分 + 中等偏弱透光 + 逐叶变奏 + 风动。level 分档（T011.5，缺省 'high'）：Mid 去
 * 叶脉三件/残毛/叶团 + 糙度叶团项（Spec §7 叶脉仅近距可辨；SDF 全形含 dip 裂 + 齿保留
 * ——档间剪影一致），透光/叶背/hue·luma/shade/两面糙度差保留；Low 换
 * PLATANUS_LEAF_SDF_LOW（去 dip 裂系统/齿/分型——裂形细化；包络/收口与 High 逐字同源）
 * + 去透光/叶脉/残毛/叶团，片元零噪声采样。风动三档同源不动（PLATANUS_WIND 同一常量
 * ——档间风相位一致 = 身份一致）。
 * 底参：中绿 #527e39（工程设定——NC "medium green"+照片中绿无粉感 [9] 交叉；六树亮度
 * 链：银杏 > 朴树 > **悬铃木** > 夏栎 > 榉 > 樟——中绿中档）/ m 0 / r 0.66（哑光-半光泽
 * ——大叶厚实挺括微光 Spec §5 "thick and stiff" Verified [5]；介于榉 0.62 与朴 0.72
 * 之间偏榉）/ DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createPlatanusLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x527e39, // 中绿（工程设定：NC medium green [7] + 照片中绿无粉感 [9] 交叉——六树亮度链中档；中距色块与银杏淡绿/樟浓绿区分）
    metalness: 0,
    roughness: 0.66, // 哑光-半光泽（Spec §5 厚实挺括微光 Verified [5]；介于榉树 0.62 与朴树 0.72 之间偏榉）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? PLATANUS_LEAF_SDF_LOW : PLATANUS_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含 dip 裂 + 齿）
  const leafBody = level === 'high'
    ? PLATANUS_LEAF_HEAD + PLATANUS_LEAF_CLUMP + PLATANUS_LEAF_SHADE + PLATANUS_LEAF_VEIN + PLATANUS_LEAF_MUL_HIGH + PLATANUS_LEAF_BACK
    : PLATANUS_LEAF_HEAD + PLATANUS_LEAF_SHADE + PLATANUS_LEAF_MUL_SIMPLE + PLATANUS_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (pltClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.06, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.06, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面光泽差保留——近无毛两面趋光滑，差六树最小）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${PLATANUS_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${PLATANUS_WIND}`,
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
        `${PLATANUS_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `platanus:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 树皮材质（组 0）：光滑基底大片地图状斑块剥落 + 冷调三色带多代拼贴（代场三带 + 破碎场
 * 二级色变/细碎斑/曲折缝（High）+ 代块缝深褐 + 上部红褐收敛）+ 整树缓摆（与叶同公式同
 * 相位；aBend 恒 0 快颤层天然不作用）。level 分档（T011.5，缺省 'high'）：Mid 去破碎场
 * fine（带内均值化 + 直缝），三色带拼贴 + 缝 + 上部红褐保留——中距「干面三色带地图状
 * 斑块剥落」= 最强身份信号（Spec §7、OSU "best asset"）；Low 三色带拼贴 + 上部红褐保留
 * （**远距斑驳剪影是保留面** Spec §7——vs 榉树 Low 全去的分化），去缝/去 fine，1×
 * vnoise。满干型剥落（中龄活跃期——非门控型，取证机位无需门控处理）。风动三档同源不动。
 * 果序域 v≥4 整域绿褐着色（PLATANUS_BARK_FRUIT——球+梗，果序入皮组冻结接口；绿褐
 * #6a7245 级 + 逐球散列变奏 + roughness 0.95 高糙；Low 几何不发射果序但分支保留）。
 * 底参：灰绿-灰褐主调 #787e6f（工程设定——Wikipedia "pale grey-green" [5] + OSU olive
 * [8] + 照片 [9] 交叉；G−R = +6 六树最绿读向——冷调灰绿基底与榉灰白基底的色温分化）/
 * m 0 / r 0.86（光滑基底微泽——剥落新皮光滑哑光读向）/ FrontSide。
 */
export function createPlatanusBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x787e6f, // 灰绿-灰褐（工程设定：pale grey-green [5] + olive [8] + 照片 [9] 交叉；G>R 冷调灰绿——vs 榉 #787c72 灰白的色温分化点①）
    metalness: 0,
    roughness: 0.86, // 光滑基底微泽（FRPS「树皮光滑」Verified [1]——vs 纵裂族高糙哑光）
    side: THREE.FrontSide,
  });
  material.defines = { USE_UV: '' }; // 拼贴域 = 圆柱 uv（u=环绕一周、v=累计弧长）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'low'
    ? PLATANUS_BARK_HEAD_LOW + PLATANUS_BARK_HIGH + PLATANUS_BARK_TONE_SIMPLE + PLATANUS_BARK_MUL_LOW + PLATANUS_BARK_FRUIT
    : level === 'mid'
      ? PLATANUS_BARK_HEAD_MID + PLATANUS_BARK_HIGH + PLATANUS_BARK_TONE_SIMPLE + PLATANUS_BARK_MUL_MID + PLATANUS_BARK_FRUIT
      : PLATANUS_BARK_HEAD + PLATANUS_BARK_HIGH + PLATANUS_BARK_TONE + PLATANUS_BARK_MUL + PLATANUS_BARK_FRUIT; // 果序域分支三档共用（Low 几何不发射果序——域内无顶点，门控恒 0 零成本）
  const barkRoughnessBase = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor - smoothstep(0.60, 0.70, pltBarkTone) * 0.14 + pltSeam * 0.05 + pltBarkHigh * 0.02, 0.05, 1.0); // 新露斑光滑（smooth 新皮层哑光微泽——OSU best asset 读向）+ 缝内微糙 + 上部小枝微糙'
    : level === 'mid'
      ? 'roughnessFactor = clamp(roughnessFactor - smoothstep(0.60, 0.70, pltBarkTone) * 0.14 + pltSeam * 0.05 + pltBarkHigh * 0.02, 0.05, 1.0); // Mid：新露光滑/直缝糙/上部项保留（fine 均值化无采样差）'
      : 'roughnessFactor = clamp(roughnessFactor - smoothstep(0.60, 0.70, pltBarkTone) * 0.12 + pltBarkHigh * 0.02, 0.05, 1.0); // Low：新露光滑/上部项保留（缝糙度项随段去）';
  const barkRoughness = barkRoughnessBase + '\n' + PLATANUS_BARK_FRUIT_ROUGHNESS; // 果序域高糙三档共用
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${PLATANUS_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${PLATANUS_WIND}`,
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
  material.customProgramCacheKey = () => `platanus:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（同源全形
 * 含 dip 裂 + 齿——档间剪影一致）；Low = PLATANUS_LEAF_SDF_LOW（表面/影档内一致——
 * 去裂版）。**深度片元不挂噪声库**——SDF 零 facVnoise 引用（dip 窗/齿载波全 ALU——沿
 * 榉 011.3 + 银杏 011.4 组合先例；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 树皮组守卫：aLeafRand=0（树皮恒 0）→ alpha=1 实心——多材质网格共用本深度材质时皮组
 * 不被叶形 SDF 误裁（若几何侧将果序球并入皮组，同样走实心分支安全）。风动位移不进
 * depth pass（静态影取舍，沿先例）；影 pass 侧向由 shadowMap 按主材质 DoubleSide 覆写
 * 为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap 按主材质 alphaToCoverage 覆写为
 * 0.5（与本值一致）。
 */
export function createPlatanusLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  const leafSdf = level === 'low' ? PLATANUS_LEAF_SDF_LOW : PLATANUS_LEAF_SDF; // Mid 深度 = High SDF（同源全形含 dip 裂 + 齿）
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
diffuseColor.a = mix(1.0, pltLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 皮组 aLeafRand=0 → 实心`,
    );
  };
  material.customProgramCacheKey = () => `platanus:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
