/**
 * runtime/procedural/tree/ligustrum/ligustrumMaterials —— 女贞（Ligustrum
 * lucidum，asset_tree_ligustrum）叶/皮（含肾形核果域）/叶影深度材质
 * （T011.11，阔叶族第十二材质实例——**全缘革质卵形单叶 SDF（樟路径改写：先端
 * 变指数域拓宽 + 脉序近零信号 + 无腺窝无离基三出）+ 树皮第 12 语言 + 蓝黑白粉
 * 核果域 + 小枝两档**）。
 *
 * 职责：复制十一先例已验收的配方方法（onBeforeCompile 注入工厂全套纪律：
 * replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句
 * 保留后追加 / <color_fragment> 绝不触碰），物种配方按女贞自己的 Reference
 * Spec 换装——Spec docs/research/ligustrum-reference.md **1.0**（任务书锚点
 * 1.0，开工前已校验一致；消费以文末「主代理终审记档」修正后口径为准：form-cn
 * 整树主张否证 → 整树证据基础 = form-d 单样木主锚〔冠幅比 0.75–0.85 / 分枝
 * ≈0.30 / ≈8m〕；生产口径 = 任务书「待裁决位」十项裁决）。消费冻结几何契约
 * （与十一先例同款）：组 0 树皮+果簇卡 FrontSide / 组 1 叶卡 DoubleSide，叶卡
 * 固有 attribute aLeafRand / aBend + 实例 aSeed；组 0 aLeafRand/aBend 恒 0。
 *
 * 【与几何侧的冻结接口（主代理简报冻结，不得偏离）】
 *   - 三工厂签名与 fraxinus/sophora 等同构：(level: ProceduralLevel =
 *     'high') => THREE.MeshStandardMaterial / MeshDepthMaterial；每次调用全部
 *     new（D17）。**三工厂 = 叶 / 皮（含果域）/ 叶影深度**——核果按冻结接口归
 *     组 0（「果簇卡入皮组 + uv 果域标记」待裁决位 1），材质数组序 [皮, 叶]；
 *     9 程序键 = 3 工厂 × 3 档（核果域由组 0 皮材质 uv 域路由承载，第三工厂为
 *     深度材质，记档——sophora/fraxinus 同款解释）。
 *   - 叶卡：v=0 叶基 → v=1 叶尖；u=0.5 中脉；1 卡 = 单叶（几何 2 tri）。
 *     **卡长宽比域 1.7–2.8 归几何侧**（Spec §B leaf_aspect_ratio Verified
 *     推算），SDF 只管包络（沿樟「长宽比归几何侧」分工）。组 1 aLeafRand ∈
 *     (0,1] 同卡同值、aBend 卡根≈0 尖大。**无裸柄段**（樟路径全叶面包络自
 *     v=0 起——叶柄表达归几何挂点，SDF 无 bare 段 → 无需 bare 门控，记档）。
 *   - 果域（组 0 内）：**brief 冻结「uv 果域 u∈[4,5]」与先例（triadica/
 *     sophora/fraxinus 三重隔离）「v∈[4,5]」不一致**——材质侧取**双轴容错
 *     判据**：标记轴 = max(u,v) ≥ 3.5 即果域（阈值 3.5 = 果域 4.0 下探 0.5
 *     隔离带，皮域 u 环绕 [0,1]、v 累计弧长 ≤≈2.9 家族隔离纪律——两轴均
 *     <3.5 不误判）；**自由轴 = 非标记轴**（逐果/逐簇随机编码，fraxinus
 *     「u 自由」先例同构）——几何侧无论按 brief u 域或按先例 v 域出卡均正确
 *     路由；**u/v 轴向契约待主代理与 3a 收口记档（缺口候选③）**。
 *
 * 【全缘革质卵形单叶 SDF——樟 camphor 路径的物种改写（待裁决位 6；单叶系，
 *   全缘零齿载波零噪声引用沿樟——深度 pass 天然纯 ALU）】四处差分（每处与
 *   樟的直接对照——两常绿革质树互为近邻对照样本）：
 *   ① 包络：sin(π·v^0.84)——最宽点 v≈0.438（卵形-长卵形读向偏基，略低于樟
 *      v^0.90→0.46 卵状椭圆近中；Spec §2「卵形、长卵形或椭圆形至宽椭圆形」
 *      Verified [1][2][7][10]——卵形端为主相）。
 *   ② 基部圆形-宽楔形：包络指数基段 0.72（vs 樟 0.80 宽楔——女贞「基部圆形
 *      或近圆形，有时宽楔形」圆形为主，基段指数低 = 圆钝收口更圆；vs 朴 0.70
 *      圆钝同档）；JS 锚：v=0.10 行半宽 0.276 > 樟同位 0.233（基段更圆读向
 *      的量化面）。
 *   ③ 先端锐尖至渐尖**变指数域宽于樟**：上半段指数 = 1.18+0.42·fract(rand)
 *      ∈ [1.18, 1.60] 逐叶（「先端锐尖至渐尖或钝」FRPS Verified——锐尖端
 *      1.18 已强于樟固定 1.10 急尖、渐尖端 1.60 尾长更长；待裁决位 6「域宽
 *      于樟急尖」）；rand 进 SDF（樟全缘不用 rand——女贞先端域是物种内变体
 *      轴，双参签名消费化记档）；JS 锚：v=0.90 行半宽域 [0.061, 0.105] 全段
 *      锐于樟同位 0.125。
 *   ④ 全缘平坦零载波（「叶缘平坦」FRPS Verified [1][3][4]——vs 樟「软骨质
 *      有时微波状」记档不做更无需做：女贞连微波状次要读向都无）；**SDF 零
 *      facVnoise 引用 + 零 cos**（樟组合先例——深度材质不挂噪声库）。
 *
 * 叶（组 1）其余配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - **脉序近零信号**（身份差分核心——vs 樟离基三出粗显）：中脉弱亮带
 *     （「中脉在上面凹入，下面凸起」FRPS——在场但弱化）权重 0.12 + 侧脉
 *     细弱弧曲近零纹（「侧脉 4-9 对，两面稍凸起或有时不明显」+ 照片「细弱
 *     弧曲不显」Spec §5 Verified [1][7][10]）权重 0.04、频率 2π·6.5 ≈ 40.8
 *     （4–9 对统计中值读向）；**无腺窝、无离基三出**（樟身份件全不复制——
 *     叶材质面较樟简化）。vs 樟三层 1.00/0.78/0.16：近距淡信号不承重身份，
 *     High 专属纯 ALU。
 *   - **革质光泽（待裁决位 3——沿 011.2 缺口 B 口径下限内）**：front
 *     roughness **0.44** ∈ [0.42, 0.50] 域（「high-gloss polished」leaf-b
 *     双问 +「glossy at street scale」canopy-b + NC "Glossy" 多照片读向
 *     Verified [1][7][10]——较樟 0.50〔Step 4b 校准档〕更强光泽一档）；
 *     metalness 0；**不引入 envMap/公共 specular 方案**（缺口维持归 011.13）。
 *   - **两面色差弱档 +「单面镜」分化**（待裁决位 3：女贞上面强光泽 + 背面
 *     **无 glaucous**——FRPS「两面无毛」无粉被句 [1][2]，vs 樟「亮面+粉背」
 *     组合）：底色 #31592c 深绿（工程设定——NC "dark green" + 照片深绿四源
 *     [7][10]；略深于樟 #33612e——常绿深绿档再压暗一档）；背面 ×(1.08,
 *     1.11, 1.04)（**G 主导提亮 + B 最小抬升 = 淡绿非灰白粉感**——「背面
 *     不提亮偏冷」；vs 樟 ×(1.06,1.05,1.16) B 主导粉感：分化点）；两面糙度
 *     差 **+0.18**（家族最大档——樟 +0.16：单面镜 = 上面 0.44 亮镜 vs 背面
 *     0.62 哑光，对比更强一档；背面 roughness 绝对值 ≈0.62 落樟背面 0.66
 *     同档哑光域）。
 *   - 背光透射 **0.21**（家族值域内取——樟 0.22 < 悬 0.28 < 朴 0.30 < …：
 *     女贞「革质」纯粹〔樟「近革质至革质」混合相〕+ 上面更强镜面 = 透光略
 *     弱于樟一档；透射色 (0.47,0.83,0.35) 深绿基调）+ 逐叶变奏 ∈[0.55,1.0]。
 *     〔简报「樟 0.30 附近」记档修正：樟先例实际峰值 0.22（camphorMaterials
 *     模块头 + Step 4b 校准记档），0.30 为朴树值——按「先例事实回原文件核对」
 *     纪律锚樟真实值 0.22，女贞 0.21 落其下，主代理复核〕。
 *   - 逐叶变奏 aLeafRand 多通道复用：色相两端冷深绿↔暖黄绿（通道摆幅 ≤15%
 *     纪律——常绿满密冠均一沿樟）+ 明度 ±8% 去相关 + 先端指数（进 SDF）+
 *     透光变奏（统计近似是家族契约下的最大表达，缺口候选①）。
 *   - 冠内竖向自遮蔽（冠基 ≈2.4m **nominal 工程锚**——干高占比 ≈0.30 ×
 *     ≈8m 待裁决位 10；几何实测涌现后同步轮记缺口候选⑤）+ 中频叶团斑块
 *     （High，波长 ≈1/0.80 ≈ 1.25m ≈ 团块 1/6–1/4 冠宽 Spec §3/B Inferred
 *     [10]——**女贞团块略大于樟 1/8–1/10**：频率 0.80 < 樟 1.15）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent）；
 *     坡宽 0.04（沿樟单叶口径）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式沿先例，数值记档）：整树缓摆 ~0.18Hz / 顶部 ~4.4cm
 *     （aSeed 相位，hash 常数 96.441/73.521 与十一先例〔sway 77.669–93.847 /
 *     flutter 49.337–70.913〕去相关——新值在两域外）+ 叶片快颤 12–19 rad/s
 *     （≈1.9–3.0Hz——**大单叶 6–17cm 摆锤略慢于樟 14–23**）/ ≤11mm 家族档
 *     （aBend 权重卡根≈0 尖大；长柄 1–3cm 革质叶颤动自由度真实，Spec §2
 *     Verified [1][10]）；**树高锚 1/8.4064 = 0.11896**（命名常量
 *     LIGUSTRUM_TREE_HEIGHT_NOMINAL = 8.4064 + 测试锚断言——待裁决位 10）。
 *     同步轮 2026-09-22：Stage 实测 8.4064〔3c 探针〕，nominal 8.0 → 8.4064。
 *
 * 皮（组 0 皮域）配方——**第 12 树皮语言「灰褐基调 + 细窄纵脊浅沟低浮雕 +
 * 大体平行少量横连 + 干面细纹浅色（fine maple-like）+ 幼干-大枝更平滑」**
 * （待裁决位 7；vs 十一先例：夏栎/樟/银杏深纵裂族、朴平滑浅裂、榉光滑暖剥、
 * 悬地图剥落三色带、栾浅色密麻点、乌桕暗灰窄裂碎翘、重阳木褐宽脊扭转、国槐
 * 板状厚脊瘤突、白蜡灰褐浅-中纵裂细脊）。分化点：①**脊细**（10 细窄脊/周
 * ——细于白蜡 8 一档〔vs 樟 7 宽脊〕）；②**沟浅低浮雕**（沟深剖面 0.74 vs
 * 白蜡 0.68 / 樟 0.50——浅一档；浅宽坡剖面 smoothstep(0.30,0.62)）；③**
 * 大体平行少量横连**（bark-a 双问——横连稀疏门控高带 × 幅度 0.12，弱于樟
 * 0.22 块状横断）；④**细纹浅色槭树状质感**（脊面高频细亮线 26/u 纯 ALU——
 * 「fine maple-like texture」bark-a 双问）；⑤**幼干-大枝更平滑**（上部弱化
 * 门控 smoothstep(2.8,5.0) → 0.96+0.04 近光滑——弱化幅度大于白蜡）：
 *   - 主调 #7b776f 灰褐-浅灰褐（工程设定——FRPS「树皮灰褐色」Verified [1] +
 *     bark-a「灰褐」/bark-b「浅灰-灰褐」/form-d「干灰褐-浅灰细纵浅纹」照片
 *     交叉 [10]；R−G=4 中性灰褐向；十一树链：国槐 #6d675d < 白蜡 #7a746b <
 *     **女贞** < 栾 #90928a——浅白蜡一档〔bark-b 浅灰读向〕）。
 *   - 竖向脊沟：裂线游走低频场（1× vnoise 复用为单色微变 ±4%——「灰褐色」
 *     单色系无剥落无三色带；drift 0.85 纵为主缓游走 =「大体平行」）+ 沟内
 *     弱 AO（低浮雕弱档）+ 上部弱化门控。
 *   - 干基暗化弱档（家族惯例 ×(0.92,0.92,0.93) 权重 0.4）。
 *   - **小枝两档**（待裁决位 8——fraxinus 当年生枝两档法，v 域/轴向编码沿
 *     先例）：当年生枝黄褐-红铜调 ×(1.20, 1.00, 0.74)（FRPS「枝黄褐色、灰色
 *     或紫红色」Verified [1] + 照片红铜新梢 [10]——R 主导红铜向，重于白蜡
 *     黄褐 ×(1.16,1.04,0.76) 一档）/ 老枝灰褐弱收敛 ×(1.02, 1.00, 0.95)。
 *   - **小枝皮孔**（FRPS「疏生圆形或长圆形皮孔」+ NC "Conspicuous"
 *     Verified [1][7]——**归两档表达**：当年生带内稀疏浅点场，非主干场）：
 *     26×30 格 ALU hash、30% 格有孔（step 0.70 稀疏门）、微长圆（圆/长圆形
 *     双读向）、×(1.14,1.13,1.08) 浅微亮（High 专属近景）。
 *   - 苔藓/地衣不做（Spec §C bark_epiphytes 阴性弱记不承重——不做不编造）；
 *     微起伏已归几何层。
 *
 * 果域（uv 标记轴 ∈ [4,5]，组 0 分支——fraxinus 果域结构对齐 + 待裁决位 1/
 *   Spec §5 果实表面 Verified [1][2][7][10]）：
 *   - **蓝黑-紫黑底 + 白粉霜（glaucous bloom）哑光覆粉感**：底色两端
 *     (0.13,0.12,0.19) 深蓝黑 ↔ (0.17,0.11,0.15) 成熟红黑（FRPS「深蓝黑
 *     色，成熟时呈红黑色，被白粉」双端——9–10 月主语境紫黑盛挂为主、红黑
 *     端逐簇微变）按自由轴 warp 分档 + 白粉霜覆层 mix(底, (0.52,0.55,0.60),
 *     0.40+0.25·rand)（照片三源双问「白粉霜感显著」——蓝灰冷粉覆霜；果域
 *     冷粉与叶背无粉不冲突——信号在果不在叶）+ 档内 ±8% 变奏。
 *   - **熟果下垂簇读向弱表达**：果端微暗线 ×(0.88,0.86,0.90)·0.55（自由轴
 *     两端——**果 uv 轴向契约为材质侧假设**，错位时降级为果面边缘纹理，
 *     缺口候选③）；果簇卡双面渲染归几何侧（fraxinus 缺口③同型）。
 *   - 果面**白粉霜哑光** roughness 0.64/0.66/0.68（逐档微升——粉霜哑光非
 *     肉质光润：vs 国槐肉质荚果 0.45 / 白蜡干翅 0.52 显著哑一档）；**无果
 *     透亮**（紫黑成熟果不透明——vs 白蜡嫩绿半透明翅果 High 微透亮不做，
 *     记档）。
 *
 * 深度材质（叶影裁切，customDepthMaterial 契约通道——沿 SOP 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF
 *     alpha 与叶表面材质共享同一 GLSL 字符串 LIGUSTRUM_LEAF_SDF（表面改叶形
 *     深度自动同步，不复制粘贴）。
 *   - **零噪声库注入**：SDF 全缘零噪声零 cos 引用 → 深度片元不挂
 *     FACILITY_GLSL_NOISE（樟全缘先例）。保护性约束：SDF 字符串内不得引入
 *     facVnoise/cos——引入即深度材质编译暴雷。
 *   - 多材质网格守卫：组 0（皮+果簇卡）以恒等 attribute（aLeafRand=0）走
 *     实心分支，防叶形 SDF 误裁（triadica 恒等 attribute 先例；果域无需域
 *     路由——rand=0 即守卫）。
 *   - **档位坍缩记档（沿樟）**：High SDF 本已零噪声全缘全形，「Low = Low
 *     SDF 零噪声版」沿家族档位纪律**平凡成立**——三档深度共用同一 SDF 字符
 *     串（Low 叶表面差异全在片元主体：去脉弱层/叶团/透光）；Mid=High 同源
 *     全形；customProgramCacheKey 三档仍分键（9 键契约）。
 *   - 风动不进 depth pass（静态影取舍已裁定）；**无 bare 门控**（本 SDF 无
 *     裸柄段——双减法门控不适用，记档；乘法门控伪覆盖禁令天然无关）。
 *
 * 分档记档（T011.11，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset
 *   build 路由）：
 *   - 叶 Mid：去脉弱层（中脉带/侧脉纹）+ 去叶团 + 糙度叶团项（Spec §7 脉序
 *     近距淡信号——Mid 观距不可辨）；SDF 全形（含先端变指数）/透光/叶背/
 *     hue·luma/shade/两面糙度差保留（颜色层次档间连续保留面）。
 *   - 叶 Low：SDF 与 High 同一字符串（档位坍缩见上记档）；去脉弱层/叶团/
 *     透光（远距逆光透射不可辨）；hue·luma/shade/叶背保留；片元零噪声。
 *   - 皮 Mid：去细纹亮线/皮孔点（近景细节层）；脊沟低浮雕/横连/沟内 AO/
 *     干基暗化/细枝两档保留——中距「灰褐细纵脊浅沟 + 冠缘红铜细枝」身份。
 *   - 皮 Low：再去横连/干基暗化/老枝灰褐档（低调项）；脊沟 + 沟内 AO +
 *     当年生黄褐-红铜档保留（远距「细纵脊剪影」保留面）；1× vnoise。
 *   - 果域：三档同体色序 + 白粉霜 + 果端暗线（中距身份信号——紫黑白粉果簇
 *     满冠下垂读向）；果面哑光档逐档微升（0.64/0.66/0.68）。
 *   - 深度：三档同一 SDF（见档位坍缩记档）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；ligustrum 前缀不与十一
 *     先例混缓存）：'ligustrum:leaf' / ':mid' / ':low'；'ligustrum:bark' …；
 *     'ligustrum:leaf-depth' …（9 键全异）。
 *   - 风动（LIGUSTRUM_WIND 同一常量）三档同源不动——档间风相位一致是身份
 *     一致的一部分（D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团）= 3× + SDF 纯 ALU ≈ 1.5×（变指数 pow +
 *     fract）+ 脉弱层 ALU ≈ 0.5× + 透光/两面/hue ≈ 2× ≈ **7×**（vs 樟 8×
 *     ——去离基三出/腺窝 −1×：全缘近零脉的红利）；
 *   - 叶 Mid 片元 = 0× 噪声 + 简化 ALU ≈ 3×；叶 Low ≈ 2.5×；
 *   - 皮 High 片元（两域取最重路径）= 皮路径 1× vnoise（游走场）= 3× +
 *     脊沟/横连/细纹/皮孔/细枝 ALU ≈ 1.5× ≈ **4.5×** / 果路径纯 ALU ≈ 1.5×
 *     ——域互斥执行，最重 ≈ 4.5×；皮 Mid ≈ 4× / 皮 Low ≈ 3.5×；
 *   - 深度片元 = SDF 纯 ALU ≈ 1.5×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——先端变指数/近零
 *   脉层/双轴果域判据/细纹亮线全部限定文件内）：
 *   ① 先端指数/透光/色相/明度共用 aLeafRand 单属性统计近似（多通道复用同一
 *      rand——变奏间相关性无法表达；家族共有缺口）；
 *   ② 全缘卵形单叶 SDF 樟变体：本文件内实现（樟路径第 2 消费者——单叶全缘
 *      谱系樟/女贞双样本；公共模式族级提炼评估归 011.13，沿 koe ② / sophora ②
 *      / fraxinus ②）；
 *   ③ 果簇卡 uv 域标记轴契约（brief u∈[4,5] vs 先例 v∈[4,5] 不一致）与果端
 *      暗线轴向假设：材质侧双轴容错判据缓解路由风险；果端暗线/色档编码在轴
 *      向错位时降级为果面边缘纹理，不破果簇剪影；需主代理与几何侧收口冻结
 *      （fraxinus ③ 同型）；
 *   ④ 果序下垂摆动（「熟果下垂簇」Spec §5 读向）组 0 aBend≡0 未表达——
 *      附加元素无独立形变通道（恰 2 组冻结的连带限制，koe ③/sophora ④/
 *      fraxinus ④ 同型）；
 *   ⑤ 冠基 2.4m 材质侧工程锚（几何实测不同步——沿 fraxinus 冠基 2.8 工程锚
 *      vs 实测 2.17 不同步先例维持）+ **树高锚 8.4064 已同步**（slot-0 Stage
 *      实测 2026-09-22 ×0.11896；与 profile 侧无联动通道——triadica ⑤/
 *      sophora ⑤/fraxinus ⑤ 同型家族缺口，冠基部分仍开口）；
 *   ⑥ 皮孔/脊沟龄级的干龄判别以「高度 × 弧长 v」双门控近似（皮管 v = 累计
 *      弧长契约注记——细枝管 v 小，bischofia ⑥/sophora ⑥/fraxinus ⑥ 同型）；
 *      树皮裂型照片双样本其一为美国语境（Spec 结构性缺口「中国语境中龄主干
 *      特写仅 1 张」如实记档——族门横向对照复核）。
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
 *   法无 NaN；与十一先例的通用段（风动公式等）为复制改造非 import（资产私有，
 *   跨资产不耦合——organization.md 边界）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';
import { applyTreeFadeDither } from '../treeFadeDither';

/**
 * 树高锚（T011.11 待裁决位 10：slot-0——form-d 单整树样木主锚〔双系统一致
 * 建筑参照〕+ NC State 栽培域 + 族量级锚；Spec §2「高可达 25 米」上限口径无
 * 典型值直给）。**同步轮 2026-09-22：Stage 实测 8.4064〔3c 探针，经正式
 * build() 路径 bbox minY 精确 0〕，nominal 8.0 → 8.4064**（风动 GLSL 与测试
 * 锚断言同源消费——1/8.4064 = 0.11896；fraxinus 011.10 同步轮同款流程）。
 */
export const LIGUSTRUM_TREE_HEIGHT_NOMINAL = 8.4064;

/** 风动高度权重 = 1/实测树高（0.11896——注入 GLSL 字面量；5 位小数 = fraxinus 0.09526 同步轮精度口径） */
const LIGUSTRUM_WIND_H_SCALE = (1.0 / LIGUSTRUM_TREE_HEIGHT_NOMINAL).toFixed(5);

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`ligustrum 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，组 0 恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值记档：
 * hash 常数 96.441/73.521（与十一先例相位流〔sway 77.669–93.847 / flutter
 * 49.337–70.913〕去相关——新值在两域外）+ **树高锚 8.4064m（×0.11896——
 * LIGUSTRUM_WIND_H_SCALE 注入，待裁决位 10；slot-0 Stage 实测同步轮
 * 2026-09-22）**；缓摆
 * ~0.18Hz / 顶部 ~4.4cm；快颤 12–19 rad/s（≈1.9–3.0Hz——大单叶 6–17cm 摆锤
 * 略慢于樟 14–23 rad/s）/ ≤11mm 家族档。
 */
const LIGUSTRUM_WIND = /* glsl */ `
// ligustrum wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float lguWindPhase = fract(sin(aSeed * 96.441 + 4.8) * 43758.5453);
float lguWindH = clamp(position.y * ${LIGUSTRUM_WIND_H_SCALE}, 0.0, 1.0); // /8.4064m 树高锚（slot-0 Stage 实测同步轮 2026-09-22〔3c 探针〕；1/8.4064 = 0.11896 命名常量注入）
float lguSway = lguWindH * lguWindH * 0.044 * sin(uTime * 1.15 + lguWindPhase * 6.28318 + lguWindH * 1.4);
// 叶片快颤：ω = 12 + 7φ（12–19 rad/s ≈ 1.9–3.0Hz——大单叶摆锤略慢于樟），幅度 ≤11mm 家族档；权重 = aBend（卡根≈0 尖大——长柄 1–3cm 革质叶颤动自由度真实）
float lguFlutterPhase = fract(sin((aSeed + aLeafRand) * 73.521 + 5.6) * 43758.5453);
float lguFlutter = aBend * 0.011 * sin(uTime * (12.0 + 7.0 * lguFlutterPhase) + lguFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (lguSway + lguFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(lguSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * lguFlutter * 0.9; // 叶面沿卡法线微扑（组 0 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——组 0 aLeafRand/aBend 恒 0 契约） */
const LIGUSTRUM_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 女贞单叶覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶尖 1）：樟全缘路径物种改写
 * （待裁决位 6）——卵形包络 sin(π·v^0.84)（最宽点 v≈0.438 偏基卵形，略低于樟
 * 0.46 卵状椭圆——Spec §2「卵形、长卵形或椭圆形至宽椭圆形」Verified [1][2][7]
 * [10]）× 变指数收口（基段 0.72 圆形-宽楔形〔「基部圆形或近圆形，有时宽楔形」
 * Verified——较樟 0.80 宽楔更圆〕→ 上半段 1.18+0.42·fract(rand) ∈ [1.18,1.60]
 * 先端锐尖至渐尖**逐叶变体域**〔Verified——锐尖端已强于樟固定 1.10 急尖、渐
 * 尖端尾更长，域宽于樟〕）× **全缘平坦零载波**（「叶缘平坦」Verified [1][3]
 * [4]——无齿载波无噪声无 cos，女贞连樟「有时微波状」级次要读向都无）；返回
 * 近似符号距离的覆盖率坡（edge/0.04——alphaToCoverage 的 fwidth smoothstep
 * 吃这条坡抗锯边；坡宽 0.04 沿樟 Step 4 口径）。**本函数零 facVnoise 引用 +
 * 零 cos 是深度材质不挂噪声库的前提（引入即深度编译暴雷——保护性约束）**。
 */
const LIGUSTRUM_LEAF_SDF = /* glsl */ `
float lguLeafAlpha(vec2 lguUv, float lguRand) {
  vec2 lguP = vec2(lguUv.x - 0.5, lguUv.y);
  float lguEnvSin = sin(3.14159 * pow(clamp(lguP.y, 0.001, 0.999), 0.84)); // v^0.84：最宽点 v≈0.438（卵形-长卵形偏基——vs 樟 v^0.90→0.46）
  float lguApex = 1.18 + 0.42 * fract(lguRand * 5.317 + 0.29); // 先端变指数逐叶 [1.18, 1.60]（锐尖 → 渐尖——域宽于樟固定 1.10 急尖；rand 进 SDF 记档）
  float lguEnv = pow(lguEnvSin, mix(0.72, lguApex, smoothstep(0.45, 0.95, lguP.y))); // 基部圆形-宽楔 0.72（圆于樟 0.80 宽楔）→ 先端锐尖-渐尖
  float lguEdge = 0.5 * lguEnv - abs(lguP.x);
  return clamp(lguEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.04（沿樟 AA 口径——全缘零载波零噪声）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿樟体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/脉弱层——叶团乘子 0.94+0.12×lguClump 均值化 = 1.0 消去，值噪声
 *  均值 0.5 精确保均）。 */
const LIGUSTRUM_LEAF_HEAD = /* glsl */ `
// ligustrum:leaf —— SDF 卵形全缘叶覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float lguAlpha = lguLeafAlpha(vUv, vLeafRand);
diffuseColor.a = lguAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷深绿 ↔ 暖黄绿——常绿满密冠均一沿樟；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 lguHue = mix(vec3(0.94, 1.00, 1.05), vec3(1.06, 1.03, 0.90), fract(vLeafRand * 6.723 + 0.27));
float lguLuma = 0.92 + 0.16 * fract(vLeafRand * 3.911 + 0.55);
`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const LIGUSTRUM_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈1/0.80 ≈ 1.25m ≈ 团块 1/6–1/4 冠宽 Spec §3/B Inferred——女贞团块略大于樟 1/8–1/10：频率 0.80 < 樟 1.15；采样偏移与先例去相关）
float lguClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.67, vTreePos.y - vTreePos.z * 0.62) * 0.80 + vec2(47.3, 71.9));
`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const LIGUSTRUM_LEAF_SHADE = /* glsl */ `
float lguShade = clamp((vTreePos.y - 2.4) / 2.6, 0.0, 1.0); // 冠基 ≈2.4m nominal 工程锚（干高占比 ≈0.30 × ≈8m 待裁决位 10 Spec §3/§A；几何实测后同步轮记缺口候选⑤）`;

/** High 专属：脉序近零信号（中脉弱亮带 + 侧脉细弱弧曲近零纹，纯 ALU 零采样）。
 *  vs 樟三层 1.00/0.78/0.16 粗显——女贞「侧脉 4-9 对，两面稍凸起或有时不明显」+
 *  照片「细弱弧曲不显」Spec §5 Verified [1][7][10]：近距淡信号不承重身份。 */
const LIGUSTRUM_LEAF_VEIN = /* glsl */ `
// 叶脉近零信号（无腺窝、无离基三出——樟身份件全不复制，待裁决位 6 叶材质面较樟简化）：
// 中脉弱亮带（「中脉在上面凹入，下面凸起」FRPS——在场但弱化）+ 侧脉细弱弧曲近零纹
//（频率 2π·6.5 ≈ 40.8——4-9 对统计中值读向；纤细 pow^6 不达缘）；纯 ALU 零采样
vec2 lguP = vec2(vUv.x - 0.5, vUv.y);
float lguVeinMid = 1.0 - smoothstep(0.008, 0.034, abs(lguP.x)); // 中脉弱带（窄于樟 0.012–0.040）
float lguVeinLat = pow(max(0.0, sin(lguP.y * 40.8 - abs(lguP.x) * 30.0 + (vLeafRand - 0.5) * 0.6)), 6.0)
  * (1.0 - lguVeinMid) * smoothstep(0.10, 0.24, lguP.y) * (1.0 - smoothstep(0.70, 0.88, lguP.y));
`;

/** High 专属：合成（叶团乘子 + 脉弱层调制——近零权重 0.12/0.04） */
const LIGUSTRUM_LEAF_MUL_HIGH = /* glsl */ `
vec3 lguMul = lguHue * lguLuma * (0.80 + 0.20 * lguShade) * (0.94 + 0.12 * lguClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
lguMul = mix(lguMul, lguMul * vec3(1.42, 1.36, 1.04), lguVeinMid * 0.12 + lguVeinLat * 0.04); // 脉近零信号（vs 樟 1.00/0.78/0.16 粗显——身份差分核心）
diffuseColor.rgb *= lguMul;
`;

/** Mid/Low：合成（去叶团/脉弱层——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const LIGUSTRUM_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 lguMul = lguHue * lguLuma * (0.80 + 0.20 * lguShade); // Mid/Low：叶团乘子均值化消去（T011.11）
diffuseColor.rgb *= lguMul;
`;

/** 叶背淡绿（三档共用，纯 ALU 零采样零分支）——「单面镜」分化（待裁决位 3） */
const LIGUSTRUM_LEAF_BACK = /* glsl */ `
// 叶背淡绿（两面色差弱档——「单面镜」：上面深绿强光泽 / 背面淡绿哑光；FRPS「两面无毛」
// 无 glaucous 粉被句 [1][2]——**不提亮偏冷**（vs 樟 ×(1.06,1.05,1.16) B 主导粉感）：
// G 主导提亮 + B 最小抬升 = 淡绿非灰白粉感；gl_FrontFacing 区分背面（WebGL2 内建；
// DoubleSide 双面片元，背面法线由 three 双面光照自动翻转，此处只调固有色）；
// 「哑光」走糙度通道（背面 +0.18 家族最大差——单面镜对比，见 roughnessmap 注入）
diffuseColor.rgb *= mix(vec3(1.08, 1.11, 1.04), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  家族值域内取：樟 0.22 < 悬 0.28 < 朴 0.30 < …——女贞革质纯粹〔樟「近革质至革质」
 *  混合相〕+ 上面更强镜面 → 透光略弱于樟一档（0.21）。 */
const LIGUSTRUM_LEAF_TRANSLUCENCY = /* glsl */ `
// ligustrum:leaf —— 背光透射（弱）：视线与阳光反向时叶背透深绿（叶绿素吸收红蓝 → 透射偏
// 黄绿；革质大叶透光弱——峰值 0.21 vs 樟 0.22 / 朴 0.30 / 夏栎 0.65，Spec §5 革质 Verified）
#if NUM_DIR_LIGHTS > 0
  float lguBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float lguTransVar = 0.55 + 0.45 * fract(vLeafRand * 8.917 + 0.43); // 逐叶透光强度变奏
  outgoingLight += vec3(0.47, 0.83, 0.35) * directionalLights[0].color
    * pow(lguBack, 3.0) * lguTransVar * lguAlpha * 0.21;
#endif
`;

// ── 组 0（皮+果）配方主体（<map_fragment> 后注入；双轴域判据 3.5）────────────────

/** 皮域：裂线游走 + 10 细窄脊浅沟低浮雕 + 上部弱化（三档共用——Low 保留面的唯一采样：裂线游走） */
const LIGUSTRUM_BARK_WARP = /* glsl */ `
// 裂线游走低频场（1× vnoise 复用为单色微变 ±4%——「树皮灰褐色」单色系无剥落无三色带；
// drift 0.85 纵为主缓游走 =「纵行大体平行」bark-a 双问）
float lguWarp = facVnoise(vec2(vUv.x * 2.6, vUv.y * 1.05) + vec2(37.9, 83.2));
// 10 细窄脊/周（细于白蜡 8 一档——待裁决位 7「脊细于白蜡」；vs 樟 7 宽脊）
float lguTri = abs(fract(vUv.x * 10.0 + lguWarp * 0.85) * 2.0 - 1.0);
float lguPlate = smoothstep(0.30, 0.62, lguTri); // 浅宽坡剖面（低浮雕）
lguBarkSmooth = smoothstep(2.8, 5.0, vTreePos.y); // 幼干-大枝上部弱化门控（更平滑一档——赋值域变量，roughness 注入跨 include 消费）
float lguRidge = mix(0.74 + 0.26 * lguPlate, 0.96 + 0.04 * lguPlate, lguBarkSmooth); // 沟深 0.74 低浮雕（vs 白蜡 0.68 / 樟 0.50——浅一档）+ 上部近光滑
`;

/** High/Mid：少量横连（纯 ALU sin——游走高带稀疏门控，弱于樟块状横断；Low 随段去） */
const LIGUSTRUM_BARK_CROSS = /* glsl */ `
// 少量横连（bark-a「纵行大体平行（少量横向连接）」双问）：稀疏水平微裂 × 游走高带门控
//（单噪声场复用省采样——vs 樟第二块斑噪声场；横连处脊沟微加深，幅度 0.12 弱于樟 0.22）
float lguCut = smoothstep(0.80, 0.95, sin(vUv.y * 31.4 + lguWarp * 5.0) * 0.5 + 0.5)
  * smoothstep(0.62, 0.86, lguWarp);
lguRidge *= 1.0 - lguCut * 0.12;
`;

/** High 专属：干面细纹浅色（fine maple-like——脊面高频细亮线，纯 ALU 零采样） */
const LIGUSTRUM_BARK_FINE = /* glsl */ `
// 细纹浅色槭树状质感（bark-a「fine maple-like」双问——英文原句见模块头）：与脊列同源平行的高频细亮线
//（26/u——细窄脊的次级细分读向；脊面加权、沟底弱）
float lguFineLine = 1.0 - smoothstep(0.0, 0.30, abs(fract(vUv.x * 26.0 + lguWarp * 0.55) * 2.0 - 1.0));
`;

/** 干基暗化弱档（High/Mid 共用——低调项，Low 随段去） */
const LIGUSTRUM_BARK_BASEDARK = /* glsl */ `
float lguBarkBase = 1.0 - smoothstep(0.5, 2.2, vTreePos.y); // 干基暗带门控（家族惯例——老干渐深读向，弱档权重）`;

/** 细枝两档门控（三档共用——结构剪影项；fraxinus 当年生枝两档法沿承） */
const LIGUSTRUM_BARK_TWIG = /* glsl */ `
// 细枝段门控（高位 × 小弧长 v 双门控——「细枝管 v 小」几何契约注记）：当年生枝黄褐-红铜 / 老枝灰褐两档
//（树高锚 8.4064 已同步、门控高度沿 nominal 8m 尺度设计维持不同步——缺口候选⑤）
float lguTwigHi = smoothstep(4.8, 6.4, vTreePos.y) * (1.0 - smoothstep(0.45, 0.95, vUv.y));
float lguTwigMid = smoothstep(3.6, 4.8, vTreePos.y) * (1.0 - smoothstep(0.40, 0.90, vUv.y));
`;

/** 小枝皮孔场（High 专属近景——ALU 网格 hash；疏生圆形/长圆形浅点，归两档表达） */
const LIGUSTRUM_BARK_LENTICEL = /* glsl */ `
// 小枝皮孔（FRPS「疏生圆形或长圆形皮孔」+ NC "Conspicuous" Verified [1][7]——待裁决位 8 归两档表达：
// 当年生带内稀疏浅点场，非主干场）：26×30 格 hash 抖动、30% 格有孔（step 0.70 稀疏门——「疏生」）、
// 微长圆（x 压 y 拉——「圆形或长圆形」双读向）、×(1.14,1.13,1.08) 浅微亮；域 = 当年生枝带
vec2 lguLc = vec2(vUv.x * 26.0, vUv.y * 30.0);
vec2 lguLId = floor(lguLc);
float lguLR = fract(sin(dot(lguLId, vec2(127.1, 311.7)) + 41.3) * 43758.5453);
vec2 lguLF = fract(lguLc) - 0.5 - (vec2(fract(lguLR * 7.31), fract(lguLR * 3.17)) - 0.5) * 0.44;
float lguLRad = 0.07 + 0.05 * fract(lguLR * 9.31);
lguLenticel = (1.0 - smoothstep(lguLRad * 0.5, lguLRad, length(vec2(lguLF.x * 0.85, lguLF.y * 1.15))))
  * step(0.70, lguLR) * lguTwigHi; // 赋值域变量（跨 include 供 roughness 消费——块内不重声明防遮蔽）
`;

/** High：合成（基底灰褐微变 + 沟内弱 AO + 细纹浅色 + 干基暗化 + 细枝两档 + 皮孔浅点） */
const LIGUSTRUM_BARK_MUL = /* glsl */ `
vec3 lguBarkMul = vec3(lguRidge) * (0.95 + 0.08 * lguWarp); // 基底灰褐单色微变 ±4%（「树皮灰褐色」FRPS Verified——单色系；vec3(lguRidge) 显式广播——011.8 编译事故修复形态）
lguBarkMul *= mix(vec3(0.90, 0.89, 0.88), vec3(1.0), smoothstep(0.24, 0.66, lguTri)); // 沟内弱 AO（低浮雕——沟浅 AO 弱档，弱于白蜡 0.87）
lguBarkMul *= 1.0 + 0.035 * lguFineLine * (0.35 + 0.65 * lguPlate); // 细纹浅色（脊面高频亮线——fine maple-like）
lguBarkMul *= mix(vec3(1.0), vec3(0.92, 0.92, 0.93), lguBarkBase * 0.4); // 干基暗化弱档（老干渐深读向——家族惯例低调项）
lguBarkMul = mix(lguBarkMul, lguBarkMul * vec3(1.20, 1.00, 0.74), lguTwigHi * 0.70); // 当年生枝黄褐-红铜（FRPS「枝黄褐色、灰色或紫红色」+ 照片红铜新梢——R 主导红铜向，重于白蜡黄褐一档）
lguBarkMul = mix(lguBarkMul, lguBarkMul * vec3(1.02, 1.00, 0.95), lguTwigMid * 0.30); // 老枝灰褐弱收敛
lguBarkMul *= mix(vec3(1.0), vec3(1.14, 1.13, 1.08), lguLenticel * 0.6); // 小枝皮孔浅微亮点
diffuseColor.rgb *= lguBarkMul;
`;

/** Mid：合成（去细纹亮线/皮孔点——近景细节层；脊沟/横连/沟内 AO/干基暗化/细枝两档保留） */
const LIGUSTRUM_BARK_MUL_MID = /* glsl */ `
vec3 lguBarkMul = vec3(lguRidge) * (0.95 + 0.08 * lguWarp); // 基底灰褐微变保留（中距「灰褐细纵脊浅沟」色块身份）
lguBarkMul *= mix(vec3(0.90, 0.89, 0.88), vec3(1.0), smoothstep(0.24, 0.66, lguTri)); // 沟内弱 AO 保留
lguBarkMul *= mix(vec3(1.0), vec3(0.92, 0.92, 0.93), lguBarkBase * 0.4); // 干基暗化保留
lguBarkMul = mix(lguBarkMul, lguBarkMul * vec3(1.20, 1.00, 0.74), lguTwigHi * 0.70); // 细枝红铜过渡保留（冠缘红铜细枝中距读向）
lguBarkMul = mix(lguBarkMul, lguBarkMul * vec3(1.02, 1.00, 0.95), lguTwigMid * 0.30);
diffuseColor.rgb *= lguBarkMul;
`;

/** Low：合成（再去横连/干基暗化/老枝灰褐档——低调项；脊沟 + 沟内 AO + 当年生红铜档保留） */
const LIGUSTRUM_BARK_MUL_LOW = /* glsl */ `
vec3 lguBarkMul = vec3(lguRidge) * (0.95 + 0.08 * lguWarp); // 脊沟低浮雕基底（远距「灰褐细纵脊剪影」保留面）
lguBarkMul *= mix(vec3(0.90, 0.89, 0.88), vec3(1.0), smoothstep(0.24, 0.66, lguTri)); // 沟内 AO（细纵脊两带剪影）
lguBarkMul = mix(lguBarkMul, lguBarkMul * vec3(1.20, 1.00, 0.74), lguTwigHi * 0.70); // 当年生红铜档（结构剪影项三档保留）
diffuseColor.rgb *= lguBarkMul;
`;

/** 果域体（三档共用——肾形核果：蓝黑-紫黑底 + 白粉霜 + 逐簇色档微变 + 果端微暗线） */
const LIGUSTRUM_FRUIT_BODY = /* glsl */ `
  // 果域（标记轴 ∈ [4,5]，双轴容错判据见域分支；自由轴 = 非标记轴——逐果/逐簇随机编码）：
  // 蓝黑-紫黑底 + 白粉霜哑光覆粉（待裁决位 1 / Spec §5 果实表面 Verified [1][2][7][10]——
  // 照片三源双问「白粉霜感显著」）+ 熟果下垂簇果端微暗线（弱表达）
  float lguFree = vUv.x >= 3.5 ? vUv.y : vUv.x; // 自由轴 = 非标记轴（fraxinus「u 自由」先例同构；轴向契约记缺口候选③）
  float lguFu = clamp(lguFree + 0.06 * sin(6.28318 * lguFree), 0.0, 0.999); // 逐簇色档微变 warp（相位 0 中域微放大）
  vec3 lguFruitBase = mix(vec3(0.13, 0.12, 0.19), vec3(0.17, 0.11, 0.15), lguFu); // 深蓝黑 ↔ 成熟红黑（FRPS「深蓝黑色，成熟时呈红黑色」双端——紫黑盛挂为主、红黑端微变）
  float lguBloom = 0.40 + 0.25 * fract(lguFree * 7.317 + 0.41); // 白粉霜强度逐果变奏（显著覆粉——照片三源）
  vec3 lguFruit = mix(lguFruitBase, vec3(0.52, 0.55, 0.60), lguBloom); // 蓝灰白粉覆霜（B ≥ R 冷向粉霜——果域专属冷粉，与叶背无粉不冲突）
  float lguFEdge = max(smoothstep(0.86, 0.985, lguFree), smoothstep(0.015, 0.14, lguFree)); // 果端微暗线（自由轴两端——uv 轴向契约为材质侧假设，错位降级果面边缘纹理，缺口候选③）
  diffuseColor.rgb = lguFruit * (0.92 + 0.16 * fract(lguFree * 31.3)) * mix(vec3(1.0), vec3(0.88, 0.86, 0.90), lguFEdge * 0.55); // 档内 ±8% 变奏 + 下垂簇果端微暗
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 卵形全缘叶 alphaTest 裁切 + 脉弱层（High）+ 两面淡绿弱差
 * + 家族值域透光 + 逐叶变奏 + 风动。level 分档（T011.11，缺省 'high'）：Mid 去
 * 脉弱层/叶团/糙度叶团项（Spec §7 脉序近距淡信号——Mid 观距不可辨），SDF 全形
 * （含先端变指数）/透光/叶背/hue·luma/shade/两面糙度差保留；Low 同 Mid 体再去
 * 透光（远距逆光透射不可辨），SDF 与 High 同一字符串（档位坍缩——零噪声全缘
 * 全形下「Low = 零噪声版」平凡成立，见模块头记档）。风动三档同源不动
 * （LIGUSTRUM_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：深绿 #31592c（工程设定——NC "dark green" + 照片深绿四源 [7][10]；略深
 * 于樟 #33612e——常绿深绿档再压暗一档）/ m 0 / r **0.44**（革质强光泽——待裁决位
 * 3 ∈ [0.42, 0.50] 域选值：「high-gloss polished」多照片读向，较樟 0.50 更强
 * 光泽一档）/ DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createLigustrumLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x31592c, // 深绿（工程设定：NC "dark green" + 照片深绿四源——略深于樟 #33612e；Spec §5 Verified [1][7][10]）
    metalness: 0,
    roughness: 0.44, // 革质强光泽（待裁决位 3——[0.42, 0.50] 域内：leaf-b「high-gloss polished」+ canopy-b 街距可读 + NC "Glossy" 多照片读向；较樟 0.50 强一档；不引入 envMap——缺口 B 下限口径）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafBody = level === 'high'
    ? LIGUSTRUM_LEAF_HEAD + LIGUSTRUM_LEAF_CLUMP + LIGUSTRUM_LEAF_SHADE + LIGUSTRUM_LEAF_VEIN + LIGUSTRUM_LEAF_MUL_HIGH + LIGUSTRUM_LEAF_BACK
    : LIGUSTRUM_LEAF_HEAD + LIGUSTRUM_LEAF_SHADE + LIGUSTRUM_LEAF_MUL_SIMPLE + LIGUSTRUM_LEAF_BACK; // Mid/Low 同体（档差全在段取舍——SDF 三档同一字符串）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (lguClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.18, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.18, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面糙度差保留——单面镜：背面 0.62 哑光）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${LIGUSTRUM_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${LIGUSTRUM_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${LIGUSTRUM_LEAF_SDF}`,
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
        `${LIGUSTRUM_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `ligustrum:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 组 0 材质（皮+果一材质两域，**双轴域判据** max(u,v) ≥ 3.5——brief「u∈[4,5]」
 * 与先例「v∈[4,5]」不一致的容错实现，自由轴 = 非标记轴）：皮域 = 第 12 树皮
 * 语言「灰褐基调 + 细窄纵脊浅沟低浮雕 + 大体平行少量横连 + 干面细纹浅色 +
 * 幼干-大枝更平滑」（10 细脊 + 沟深 0.74 低浮雕 + 横连 0.12 弱档 + 细纹亮线
 * 【High】+ 上部弱化门控 + 沟内弱 AO + 干基暗化弱档 + 细枝黄褐红铜-灰褐两档
 * + 小枝皮孔浅点【High——归两档表达】）；果域 = 肾形核果蓝黑-紫黑底 + 白粉霜
 * 覆粉 + 逐簇色档微变 + 果端微暗线 + 果面白粉霜哑光（无果透亮——紫黑熟果不
 * 透明，记档）。level 分档（T011.11，缺省 'high'）：Mid 去细纹亮线/皮孔点
 * （近景细节层），脊沟/横连/沟内 AO/干基暗化/细枝两档/果域全保留——中距
 * 「灰褐细纵脊浅沟 + 冠缘红铜细枝 + 紫黑白粉果簇」身份（Spec §7 中距保留
 * 面）；Low 再去横连/干基暗化/老枝灰褐档（低调项），脊沟 + 沟内 AO + 当年生
 * 红铜档 + 果域保留（远距「细纵脊剪影 + 果簇色块」保留面），1× vnoise。风动
 * = 整树缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用——果序下垂摆动归
 * 缺口候选④）。
 * 底参：灰褐-浅灰褐主调 #7b776f（工程设定——FRPS「树皮灰褐色」Verified [1] +
 * bark-a/b、form-d 照片交叉 [10]；R−G=4 中性灰褐向；十一树链：国槐 < 白蜡 <
 * 女贞 < 栾——浅白蜡一档）/ m 0 / r 0.88（细纹浅色低浮雕族中低糙——浅于白蜡
 * 0.90 一档）/ FrontSide（皮管闭合实体；果簇卡双面渲染归几何侧——fraxinus
 * 缺口③同型）。
 */
export function createLigustrumBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x7b776f, // 灰褐-浅灰褐（工程设定：FRPS 灰褐 [1] + bark-a「灰褐」/bark-b「浅灰-灰褐」/form-d「浅灰细纹」[10] 交叉——浅白蜡 #7a746b 一档、深于栾 #90928a）
    metalness: 0,
    roughness: 0.88, // 细纹浅色低浮雕族中低糙哑光（vs 白蜡 0.90——细纹浅色读向微泽一档）
    side: THREE.FrontSide, // 皮管闭合实体（果簇卡双面渲染归几何侧——缺口候选③）
  });
  material.defines = { USE_UV: '' }; // 两域分支 = uv 域身份标记（皮圆柱 / 果簇卡）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? LIGUSTRUM_BARK_WARP + LIGUSTRUM_BARK_CROSS + LIGUSTRUM_BARK_FINE + LIGUSTRUM_BARK_BASEDARK + LIGUSTRUM_BARK_TWIG + LIGUSTRUM_BARK_LENTICEL + LIGUSTRUM_BARK_MUL
    : level === 'mid'
      ? LIGUSTRUM_BARK_WARP + LIGUSTRUM_BARK_CROSS + LIGUSTRUM_BARK_BASEDARK + LIGUSTRUM_BARK_TWIG + LIGUSTRUM_BARK_MUL_MID
      : LIGUSTRUM_BARK_WARP + LIGUSTRUM_BARK_TWIG + LIGUSTRUM_BARK_MUL_LOW;
  // 跨 include 域变量预声明（roughnessmap 注入在 main 顶层消费 lguBarkSmooth/lguLenticel——
  // map 注入的 if/else 块内声明在该注入点作用域已关闭〔triadica Step 4 实证事故形态〕；
  // 块内改纯赋值防遮蔽。三档统一声明：WARP 段三档均赋值 lguBarkSmooth（Mid/Low 未消费的
  // 预声明为无害死值——triadica domainVars 同款处置；lguLenticel High 注入段赋值、
  // Mid/Low 未消费零赋值）
  const domainVars = 'float lguLenticel = 0.0; float lguBarkSmooth = 0.0; // 跨 include 预声明（roughness 注入消费；map 块内赋值不重声明——三档统一，未消费档为无害死值）\n';
  const body = /* glsl */ `
// ligustrum:bark —— 组 0 两域分支（皮 / 果簇卡——双轴域判据 max(u,v) ≥ 3.5：果域标记轴 ∈ [4,5]
// brief「u 域」与先例「v 域」不一致的容错实现；皮域 u 环绕 [0,1]、v 弧长 ≤≈2.9 家族隔离纪律两轴均 <3.5 不误判）
${domainVars}if (max(vUv.x, vUv.y) >= 3.5) {
${LIGUSTRUM_FRUIT_BODY}
} else {
${barkBody}
}`;
  const barkRoughness = level === 'high'
    ? `if (max(vUv.x, vUv.y) >= 3.5) { roughnessFactor = 0.64; } // 果域白粉霜哑光（glaucous bloom——粉霜哑非肉质光润）
else { roughnessFactor = clamp(0.88 - lguBarkSmooth * 0.04 - lguLenticel * 0.05, 0.05, 1.0); } // 皮域：幼干-大枝微泽 + 皮孔点微泽`
    : level === 'mid'
      ? `if (max(vUv.x, vUv.y) >= 3.5) { roughnessFactor = 0.66; } // Mid：果域白粉霜哑光
else { roughnessFactor = clamp(0.88 - lguBarkSmooth * 0.04, 0.05, 1.0); } // Mid：幼干-大枝微泽保留（皮孔项随段去）`
      : `if (max(vUv.x, vUv.y) >= 3.5) { roughnessFactor = 0.68; } // Low：果域哑光（远距果色读向保留）
else { roughnessFactor = 0.88; } // Low：细纹族中低糙基底（横连/皮孔/上部项随段去）`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${LIGUSTRUM_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${LIGUSTRUM_WIND}`,
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
  material.customProgramCacheKey = () => `ligustrum:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（档位坍缩——沿樟记档：High SDF 本已零噪声全缘全形，三档共用同一
 * SDF 字符串，「Low = 零噪声版」沿家族档位纪律平凡成立；Mid = High 同源全形；
 * customProgramCacheKey 三档仍分键守 9 键契约）。**深度片元不挂噪声库**——SDF
 * 零 facVnoise 引用 + 零 cos（影 pass 不吃噪声纪律的更优满足；SDF 内引入噪声
 * 即编译暴雷——保护性约束）。
 * 组 0 守卫：皮/果域（aLeafRand 恒 0）→ alpha=1 实心——多材质网格共用本深度
 * 材质时组 0 不被叶形 SDF 误裁（triadica 恒等 attribute 先例；果域无需域路由
 * ——rand=0 即守卫）。风动位移不进 depth pass（静态影取舍，沿先例）；影 pass
 * 侧向由 shadowMap 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；
 * alphaTest 由 shadowMap 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createLigustrumLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  void level; // 档位坍缩：三档同一 SDF 字符串（键仍分档——见模块头记档）
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
${LIGUSTRUM_LEAF_SDF}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, lguLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 组 0 aLeafRand=0 → 实心（皮圆柱/果簇卡 uv 域不误裁）`,
    );
  };
  material.customProgramCacheKey = () => `ligustrum:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
