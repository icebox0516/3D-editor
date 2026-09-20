/**
 * runtime/procedural/tree/zelkova/zelkovaMaterials —— 榉树（asset_tree_zelkova）叶/树皮材质
 * + 风动 + 叶影深度材质（T011.3）。
 *
 * 职责：复制朴树/香樟已验收的配方方法（onBeforeCompile 注入工厂 L2 全套纪律：
 *   replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 *   <color_fragment> 绝不触碰），物种配方按榉树自己的 Reference Spec 换装——
 *   Spec docs/research/zelkova-reference.md **1.0**（任务书锚点 1.0，开工前已校验一致，含
 *   2026-09-20 主代理终审记档：硬数值逐字抽查 + 照片第二视觉系统交叉通过；叶基偏斜程度/
 *   锯齿单重两处分歧以文献 Verified 口径优先——**稍偏斜 + 尖头单锯齿**，照片强读记变体噪声）。
 *   消费冻结几何契约（与三先例同款）：组 0 树皮 FrontSide / 组 1 叶卡 DoubleSide，叶卡固有
 *   attribute aLeafRand / aBend + 实例 aSeed；树皮组 aLeafRand 恒 0、aBend 恒 0。
 *
 * 叶（组 1）配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - SDF 卵形至卵状披针形包络：sin(π·v^0.70)——最宽点 v≈0.37 叶长（= 0.5^(1/0.70)），四树
 *     最偏基（vs 朴树 v^0.76→0.40 偏基卵形、香樟 v^0.90→0.46 近中部、夏栎 v^1.4→0.61 倒卵
 *     形——披针形细长 + 偏基最宽读向）——Spec §4「卵形、椭圆形或卵状披针形」Verified
 *     [1][2][3][4][7][8]。长宽比 1.8–2.4 归几何侧（Spec §6/B leaf_aspect_ratio），SDF 只管包络。
 *   - 先端渐尖至尾状渐尖（vs 香樟急尖、朴树急尖至短渐尖）：包络指数沿 v 变化
 *     mix(0.72, 1.22, smoothstep(0.38, 0.95, ↑v))——基部 0.72 圆形/浅心形收口（Spec §4
 *     「基部有的稍偏斜、圆形或浅心形」Verified [1][2][3][4]），上段 1.22 长尖收窄（尖头读向
 *     强于朴树 1.15 / 香樟 1.10——尾状渐尖 caudate-acuminate 最长，FOC Verified [3]）；起坡
 *     0.38 三树最低（渐尖自中段渐起——长尾读向）。沿先例 mix，纯 ALU 零分支。
 *   - 叶基稍偏斜（榆科核心辨识——vs 三先例全部对称/近对称）：中心线漂移
 *     0.030·(1−0.70v)——基部最强 0.030 向先端线性衰减至 0.009（「叶基偏斜」语义：偏斜在
 *     基部、中上恢复近对称；vs 朴树线性漂移 0.012 向先端渐强）。幅度 = 朴树峰值 2.5 倍
 *     （文献 Verified「稍偏斜」中等偏弱口径——强于朴树「几乎不偏斜或仅稍偏斜」、远小于榆属
 *     显著偏斜 ~0.06 记档域；终审照片读 strong 记变体噪声不采）。纯 ALU。
 *   - 叶缘尖头单锯齿 8–15 齿/侧（**三树首个全缘反例——齿载波回归**；vs 香樟全缘零齿、
 *     朴树上半部圆钝齿、夏栎裂片）：齿布全缘（无中部门控——vs 朴树 0.48 起，本项为与朴树
 *     的核心分化信号：榉树齿布全缘、尖头锐齿，Spec §4「边缘有圆齿状锯齿，具短尖头」+
 *     OSU "sharply serrate" Verified [1][2][3][4][7][8]）；载波 2π·10 = 62.83（10 齿/侧，
 *     域 8–15 取中）pow 2.6 尖头（vs 朴树 pow 2.0 圆钝、夏栎 pow 3.0 裂片锯齿——齿谷宽
 *     齿头锐的单尖齿形）+ 低频齿深调制 sin(v·9.42)（~1.5 周期沿叶长轻微起伏——次级调制
 *     ALU 化）；**单频载波 = 单锯齿非重锯齿**（文献口径：调制只调深度不调频率，不产生
 *     第二齿列）；幅度峰值 0.030 = 覆盖率坡宽 0.04 的 75% 顶格（alphaTest 0.5 裁切闪烁
 *     纪律，沿先例口径）；端部亚叶缘渐隐 gate smoothstep(0.02,0.10,v)·(1−smoothstep(0.94,
 *     0.99,v))——齿布全缘、仅两端收尾渐隐防 AA 边噪声。**齿调制 ALU 化是榉树组合首例：
 *     朴树齿抖动 20% vnoise 在榉树换 ALU sin → SDF 零噪声引用 → 深度材质不挂噪声库
 *     （沿香樟更优口径，免朴树齿噪声进 depth pass 的账）**。
 *   - 羽状脉直伸齿尖（脉型三分化第三型：朴树三出脉自叶基 / 香樟离基三出脉 / **榉树纯羽状
 *     脉无基出脉**）：中脉亮带 + 均匀侧脉对 10 对（域 7–15 对取中，Spec §2/§4 Verified
 *     [1][2][3][4][7][8]）——侧脉载波与齿载波**同频 62.83**（每对侧脉对应一齿的达缘统计
 *     读向——「脉端直达齿尖」FOC 属级 Verified [6]；非逐齿相位锁定记档：对齐需逐叶 rand
 *     相位耦合，收益亚像素）；侧脉全叶分布 smoothstep(0.035, 0.10) 起（vs 朴树特强基出对
 *     0.04 起 / 香樟离基对 0.06 渐显——榉树无特强单对、均匀网读向）斜伸直伸（斜率项 26.0
 *     → 侧脉与中脉夹角 ~67° 张开斜上——OSU "parallel veins" 直伸读向 [7]）、先端渐尖区渐隐；
 *     权重 0.55 均匀网身份（vs 朴树三出对主 0.75 / 香樟离基对主 0.78 + 弱二级 0.16/0.18
 *     ——榉树无主对、全网中强）。纯 ALU 淡脉影零采样。
 *   - 两面区分（Spec §5「叶面绿或深绿……叶背浅绿」Verified [1][2][3][4]——中等深浅对比、
 *     **无粉感**，vs 香樟背面 glaucous 粉感）：底色 #3e6c2c 深绿（工程设定——OSU "dark
 *     green" [7] + §5 冠层中绿-深绿 [8] 交叉；亮度介于香樟最暗与夏栎之间、黄绿量级近朴树
 *     但暗一档：G−B 64 vs 朴树 67）；叶背 ×(1.10, 1.12, 1.04) R/G 主导提亮 B 低抬——浅绿
 *     暖读向**无冷灰粉感**（vs 香樟 ×(1.06,1.05,1.16) B 主导 glaucous——三树背面三分化），
 *     幅度强于朴树 ×(1.02,1.00,1.10)（中等深浅对比可辨）；两面糙度差 +0.08（薄纸质毛被
 *     脱落两面趋光滑——差小于朴树 +0.12 / 香樟 +0.16）。
 *   - 叶面半光泽微糙（Spec §5「稀带光泽」+ OSU "dark green and somewhat rough above"
 *     Verified [1][2][7][8]）：roughness 0.62（介于香樟革质亮 0.50 与朴树半光泽 0.72 之间
 *     ——半光泽；微糙感由糙度高于香樟一档给出）。
 *   - 薄纸质透光最强（三资产中——Spec §5「薄纸质至厚纸质……背光透光在三资产中最强」
 *     质地 Verified [1][2][3] + 相对等级 Inferred）：峰值 0.40（vs 朴树 0.30 近革质 / 香樟
 *     0.22 革质——任务书「高于朴树/香樟」纪律顶格读向；夏栎 0.65 裂叶强透光另档）+ 透射色
 *     (0.60,0.92,0.34) 亮黄绿（薄纸亮透调，亮于朴树 (0.58,0.90,0.38) / 香樟浓绿 (0.46,
 *     0.84,0.36)）；逐叶变奏 zlkTransVar ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand：色相两端冷深绿↔暖黄绿（Spec §6「大小形状变异很大」变幅声明读向；
 *     通道摆幅 ≤15% 纪律）+ 明度 ±8%（去相关取样）。
 *   - 冠内竖向自遮蔽（冠基 ≈2.8m——干高占比 0.30–0.40 × ≈8m Spec §3/§A Inferred [7][8]，
 *     区间取值工程设定）+ 中频叶团斑块（High，波长 ≈0.83m ≈ 团块 1/8–1/10 冠幅 Spec §B）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent——实例化 + 深度
 *     排序灾难）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值微调记档）：整树缓摆 ~0.18Hz / 顶部 ~4.5cm
 *     （aSeed 相位，hash 常数换 77.669——与朴树 78.233/香樟 79.193 相位流去相关）+ 叶片
 *     快颤 16–25Hz / ≤8mm（**短柄硬叶颤**——幅度小于先例 11mm、频率偏高（柄短刚度高）：
 *     叶柄粗短 2–7mm Verified [1][2][3][4]，vs 香樟长柄 2–3cm 颤幅 11mm 自由度大；aBend
 *     权重）；树高锚 8m（×0.125——榉树目标 ≈8m，D19.7 同口径）。
 *
 * 皮（组 0）配方（**第四种树皮语言：光滑基底 + 暖色薄片剥落斑驳**——vs 夏栎脊沟浮雕 /
 *   朴树平滑-浅裂小斑块（单色系灰白-灰褐）/ 香樟纵裂深沟；唯一带橙锈色新斑的语言）：
 *   - 光滑基底无脊沟系统（Spec §5 bark_archetype「光滑-薄片剥落斑驳型」Verified
 *     [1][2][3][4][7]）：零 tri 剖面零裂线游走——「光滑灰皮」由均匀基底色直读（三先例均
 *     有 tri 脊沟系统，榉树首个无脊沟语言——结构分化最彻底的一树）。
 *   - 主调 #787c72 灰白-灰褐带灰绿（工程设定——文献「灰白色或褐灰色」[1][2][3][4] + 照片
 *     gray-green base [8] 两读向交叉；R−G = −4 四树唯一 G>R（灰绿读向——朴树 +6 / 香樟
 *     +11 / 夏栎 +9 全暖灰）；亮度 ≈朴树同级（光滑灰白亮基底 vs 香樟/夏栎深褐系））。
 *   - 暖色薄片剥落斑驳（身份核心，Spec §5 bark_color Inferred [8] + 终审「橙锈/cinnamon
 *     暖色薄片剥落斑 + 边缘翘曲」交叉确认）：斑域 = 值噪声高带软阈值 smoothstep(0.62, 0.72)
 *     （面积占比 ≈26%——Spec §5「新鲜剥落斑占可见干面 ≈15–30%」域中上；JS 复算
 *     P(x>0.67) ≈ 24–26% 工程标定）；斑域频率 (6,5)（晶胞 18–25cm ≈干径 26cm 的 1/4–1/2
 *     域——Spec §5 [8] 工程标定）；斑内三色带（同频偏移第二采样——每斑一色、斑间色异）：
 *     奶油白 (1.26,1.21,1.10) / 浅褐 (1.16,1.05,0.90) / 锈橙-橙褐 (1.35,0.92,0.64)——
 *     R>G>B 橙锈新斑（中-高对比 vs 灰绿基底：奶油/锈橙均高对比读向，Spec §5 Verified
 *     系统斜向）；色带阈值 (0.24,0.48)/(0.55,0.78)——锈橙带下移：锈橙读向斑面积 ~4%→
 *     ~6%（面积 ×1.4 + 斑径 ×3–4 + 对比微增——单斑屏幕像素量升约一个量级）。
 *     **Step 4b 校准 2026-09-20：屏幕可辨性校准**（T26 机位 2.6m 探针暖斑占比 0.0000 +
 *     1.2m 特写斑覆盖 5–8% 无锈橙 → 目标 15–30% 含锈橙）：旧频率 (11,14) 晶胞 ~7cm =
 *     干径 26cm 的 1/4、高带内有效斑径 ~4cm 在 2.6m 机位 ≈5px 被 MSAA/软边磨平——放大
 *     频率提斑径至可辨；占比取域中上（斑更大更少更醒目）；三色带阈值重排提锈橙出现率
 *     （E[s2] 0.16→0.25——s2 下沿 0.55 已贴 s1 上沿 0.48 的三色层次保持约束，无可再降
 *     余量；锈橙斑面积实测推算 ~6%，12–15% 预期需 P(tone>0.665)≈50% 超出值噪声分布
 *     能力——以单斑可辨度提升补足，视觉门 T26 复测裁判）。
 *   - 斑缘缝暗（贴片感）：斑域过渡带 ×0.14 暗——薄片翘曲边缝阴影读向（bark-a「薄片 lift
 *     and curl / 边缘翘曲」[8]）纯 ALU 复用斑域。
 *   - 暗色小块镶嵌（旧皮 dark mottling，Spec §5 [8]）：复用斑域噪声中低带（与斑域高带
 *     互斥——暗镶只在旧皮）×(0.90,0.88,0.87) 轻暗——零新增采样。
 *   - 干上部/细枝：斑驳弱化 ×0.55（斑径 < 枝径不可辨）+ 紫褐偏色 ×(1.05,0.99,0.97)
 *     （当年生枝紫褐色或棕褐色 Spec §4 twig_surface Verified [1][2][3][4]）；高度门控
 *     2.2–4.6m（结构剪影项三档保留，沿先例体例）。
 *   - 苔藓/地衣**不做**记档：Spec §5「少量、覆盖度低、弱于樟树」+ 入库照片未显著（单源
 *     低置信）——不做不编造（vs 朴树/香樟有苔藓层；榉树第四型无此通道）。
 *   - 微起伏已归几何层（片状剥落翘曲的浮雕表达在几何侧皮组起伏语言，任务书口径），材质
 *     只管色层。
 *   - 风动：整树缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用）。
 *
 * 深度材质（叶影裁切，customDepthMaterial 契约通道——沿 SOP §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与叶表面
 *     材质共享同一 GLSL 字符串（表面改叶形深度自动同步，不复制粘贴）。
 *   - **零噪声库注入**：齿调制 ALU 化 → SDF 零 facVnoise 引用 → 深度片元不挂
 *     FACILITY_GLSL_NOISE（影 pass 不吃噪声纪律的更优满足——**齿载波与深度零噪声的组合
 *     首例**：朴树齿载波随 20% 抖动噪声进 SDF、深度材质被迫挂噪声库，榉树齿 ALU 化先天
 *     免此账）。保护性约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷
 *     （未声明函数），防复制粘贴漂移。
 *   - 多材质网格守卫：皮组以恒等 attribute（aLeafRand=0）走实心分支，防叶形 SDF 在圆柱
 *     uv 域上误裁出洞。
 *   - 档位匹配：Mid = High SDF 同源全形（含齿——中距锯齿读向是榉树 vs 香樟全缘的辨识差）/
 *     Low = SDF_LOW 零齿版（表面/影档内一致，沿朴树 SDF 分档体例）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T011.3，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去叶脉三件（中脉带/羽状侧脉网/先端渐隐——Spec §7 叶脉仅近距可辨，Mid 观距
 *     不可辨）+ 去中频叶团斑块；SDF 全形（含齿载波）/透光/叶背/hue·luma/shade/两面糙度差
 *     保留（颜色层次档间连续保留面；中距齿读向保留——SDF 不动）。
 *   - 叶 Low：SDF 换 ZELKOVA_LEAF_SDF_LOW——去齿载波/齿调制（**锯齿细化**：远距齿不可辨，
 *     Spec §7 牺牲顺序「叶脉与锯齿细节最先牺牲」；包络/偏斜/渐尖三项与 High 逐字同源——
 *     档间叶形身份一致的去细节不改形原则，沿朴树 SDF_LOW 体例）+ 去透光（远距逆光透射
 *     不可辨）/叶脉/叶团；hue·luma/shade/叶背保留；片元零噪声。
 *   - 皮 Mid：去边缝暗线/暗色小块镶嵌（次级贴片细节——中距不可辨）；剥落斑驳本体（斑域+
 *     三色带）+ 上部紫褐偏色 + 细枝斑驳弱化保留——中距剥落斑驳色块是主要辨识特征
 *     （Spec §7 中距「树干暖色剥落斑驳」）。
 *   - 皮 Low：剥落斑远距不可辨（Spec §7 远距「剥落斑均不可辨，可全部牺牲」）——斑驳系统
 *     全部去采样，均值化常量乘子（斑域 ≈26% × 三色带均值 + 斑缘缝暗 + 暗镶均值合成——
 *     Step 4b 后按新阈值/色带 JS 采样重算）+ 上部紫褐偏色保留（结构剪影项三档保留）；
 *     零噪声采样（光滑皮语言天然无脊沟结构项——Low 最省的一树）。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；zelkova 前缀不与三先例混缓存）：
 *     'zelkova:leaf' / 'zelkova:leaf:mid' / 'zelkova:leaf:low'；'zelkova:bark' /
 *     'zelkova:bark:mid' / 'zelkova:bark:low'；'zelkova:leaf-depth' /
 *     'zelkova:leaf-depth:mid' / 'zelkova:leaf-depth:low'（9 键全异）。
 *   - 风动（ZELKOVA_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分
 *     （同公式同常数同 aBend 语义，D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团斑块；齿调制 ALU 化免齿噪声）= 3× + SDF（齿载波 cos/
 *     调制 sin/偏斜）/羽状脉网/两面/透光/hue·shade 纯 ALU ≈ 5× ≈ 8×（vs 朴树 11.5×——
 *     齿噪声 ALU 化 −3.5× 红利与香樟同账）；
 *   - 叶 Mid 片元 = 0× 噪声（噪声库死码编译消除）+ 简化 ALU ≈ 3×；
 *   - 叶 Low 片元 = 0× 噪声 + 简化 SDF ALU ≈ 2×；
 *   - 皮 High/Mid 片元 = 2× vnoise（斑域 + 斑色）= 6× + 边缝/暗镶/上部 smoothstep 纯 ALU
 *     ≈ 1.5× ≈ 7.5×（与先例皮同账）；
 *   - 皮 Low 片元 = 0× 噪声 + ALU ≈ 1×（光滑皮无脊沟——四树皮最省 Low）；
 *   - 深度片元 = SDF 纯 ALU ≈ 1.5×，**零噪声采样**（齿调制 ALU 化先天满足影 pass 不吃噪声）；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与 celtis/camphor/
 *   tree3a 的通用段（风动公式等）为复制改造非 import（资产私有，跨资产不耦合——
 *   organization.md 边界）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`zelkova 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，树皮恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值微调记档：
 * hash 常数 77.669/53.419（与朴树/香樟相位流去相关）+ 树高锚 8m（×0.125——榉树目标
 * ≈8m，D19.7）；快颤 16–25Hz / ≤8mm 短柄硬叶颤（叶柄粗短 2–7mm Verified——柄短刚度
 * 高：幅度小于先例 11mm、频率偏高）。
 */
const ZELKOVA_WIND = /* glsl */ `
// zelkova wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float zlkWindPhase = fract(sin(aSeed * 77.669 + 1.94) * 43758.5453);
float zlkWindH = clamp(position.y * 0.125, 0.0, 1.0); // /8m 锚点树高（缩放抖动 ±16% 下权重近似）
float zlkSway = zlkWindH * zlkWindH * 0.045 * sin(uTime * 1.15 + zlkWindPhase * 6.28318 + zlkWindH * 1.4);
// 叶片快颤：ω = 16 + 9φ（16–25Hz 偏高——柄短刚度高），幅度 ≤8mm 小于先例 11mm（叶柄 2–7mm 粗短）；权重 = aBend（卡根≈0 尖大）
float zlkFlutterPhase = fract(sin((aSeed + aLeafRand) * 53.419 + 2.8) * 43758.5453);
float zlkFlutter = aBend * 0.008 * sin(uTime * (16.0 + 9.0 * zlkFlutterPhase) + zlkFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (zlkSway + zlkFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(zlkSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * zlkFlutter * 0.9; // 叶面沿卡法线微扑（树皮 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——皮组 aLeafRand/aBend 恒 0 契约） */
const ZELKOVA_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 榉树叶形覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶尖 1）：
 * 卵形至卵状披针形包络（v^0.70 预扭曲把 sin 峰推到 v≈0.37 叶长——四树最偏基的披针形细长
 * 读向；vs 朴树 v^0.76→0.40 / 香樟 v^0.90→0.46 / 夏栎 v^1.4→0.61。Spec §4「卵形、椭圆形
 * 或卵状披针形」Verified [1][2][3][4][7][8]）× 变指数收口（基部 0.72 圆形/浅心形、上段
 * 1.22 尾状渐尖长尖——先端渐尖至尾状渐尖 FOC Verified [3]；起坡 0.38 三树最低）× 叶基
 * 稍偏斜（中心线漂移 0.030·(1−0.70v)——基部最强渐减：榆科核心辨识「稍偏斜」中等偏弱，
 * 终审文献 Verified 口径优先）× 尖头单锯齿载波（2π·10 = 62.83 同频 10 齿/侧 pow 2.6 尖头
 * + 低频 ALU 齿深调制 sin(v·9.42)——齿布全缘仅端部渐隐；**零 facVnoise 引用是深度材质
 * 不挂噪声库的前提（引入即深度编译暴雷——保护性约束；齿 ALU 化 = 齿载波 + 深度零噪声的
 * 组合首例）**）；返回近似符号距离的覆盖率坡（edge/0.04——alphaToCoverage 的 fwidth
 * smoothstep 吃这条坡抗锯边；坡宽 0.04 沿先例 AA 口径）。
 */
const ZELKOVA_LEAF_SDF = /* glsl */ `
float zlkLeafAlpha(vec2 zlkUv, float zlkRand) {
  vec2 zlkP = vec2(zlkUv.x - 0.5, zlkUv.y);
  zlkP.x -= 0.030 * (1.0 - 0.7 * zlkP.y); // 叶基稍偏斜：中心线基部最强 0.030 向先端衰减（纯 ALU；朴树线性 0.012 的 2.5 倍——「稍偏斜」中等偏弱）
  float zlkEnvSin = sin(3.14159 * pow(clamp(zlkP.y, 0.001, 0.999), 0.70)); // v^0.70：最宽点 v≈0.37（卵形至卵状披针形——四树最偏基）
  float zlkEnv = pow(zlkEnvSin, mix(0.72, 1.22, smoothstep(0.38, 0.95, zlkP.y))); // 基部圆形/浅心形 0.72 → 先端尾状渐尖 1.22（渐尖起坡 0.38 三树最低——长尾读向）
  // 尖头单锯齿：2π·10 ≈ 10 齿/侧，pow 2.6 尖头（vs 朴树 pow 2.0 圆钝——尖头读向），逐叶 -rand·2π 相位错开
  float zlkTooth = pow(0.5 + 0.5 * cos(zlkP.y * 62.83 - zlkRand * 6.28), 2.6);
  // 低频齿深调制（~1.5 周期沿叶长轻微起伏——次级调制 ALU 化，免朴树齿抖动噪声；单频载波 = 单锯齿非重锯齿）
  float zlkToothMod = 0.5 + 0.5 * sin(zlkP.y * 9.42 - zlkRand * 6.28);
  float zlkGate = smoothstep(0.02, 0.10, zlkP.y) * (1.0 - smoothstep(0.94, 0.99, zlkP.y)); // 齿布全缘（无中部门控——vs 朴树 0.48 起；仅端部亚叶缘渐隐防 AA 噪声）
  float zlkSerr = (zlkTooth * (0.72 + 0.28 * zlkToothMod) - 0.5) * 0.060 * zlkGate; // 峰值 0.030 = 坡宽 0.04 的 75% 顶格（沿先例纪律）
  float zlkEdge = 0.5 * zlkEnv + zlkSerr - abs(zlkP.x);
  return clamp(zlkEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.04（沿先例 AA 口径）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档取用）：
 * 卵形至卵状披针形包络 + 渐尖先端 + 叶基偏斜漂移即可——去齿载波/齿调制（**锯齿细化**：
 * 远距齿不可辨，Spec §7 牺牲顺序；片元零噪声先天成立）。包络/收口/漂移三项与 High 版
 * 逐字同源（档间叶形身份一致的去细节不改形原则，沿朴树 SDF_LOW 体例）。
 */
const ZELKOVA_LEAF_SDF_LOW = /* glsl */ `
float zlkLeafAlpha(vec2 zlkUv, float zlkRand) {
  vec2 zlkP = vec2(zlkUv.x - 0.5, zlkUv.y);
  zlkP.x -= 0.030 * (1.0 - 0.7 * zlkP.y); // 叶基稍偏斜（与 High 逐字同源）
  float zlkEnvSin = sin(3.14159 * pow(clamp(zlkP.y, 0.001, 0.999), 0.70)); // v^0.70：最宽点 v≈0.37（与 High 逐字同源）
  float zlkEnv = pow(zlkEnvSin, mix(0.72, 1.22, smoothstep(0.38, 0.95, zlkP.y)));
  float zlkEdge = 0.5 * zlkEnv - abs(zlkP.x);
  return clamp(zlkEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/叶脉三件——叶团乘子 0.94+0.12×zlkClump 均值化 = 1.0 消去，值噪声均值
 *  0.5 精确保均）。 */
const ZELKOVA_LEAF_HEAD = /* glsl */ `
// zelkova:leaf —— SDF 卵状披针形尖锯齿叶覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float zlkAlpha = zlkLeafAlpha(vUv, vLeafRand);
diffuseColor.a = zlkAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷深绿 ↔ 暖黄绿——Spec §6「大小形状变异很大」读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 zlkHue = mix(vec3(0.93, 1.00, 1.05), vec3(1.07, 1.03, 0.91), fract(vLeafRand * 6.147 + 0.17));
float zlkLuma = 0.92 + 0.16 * fract(vLeafRand * 4.213 + 0.42);`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const ZELKOVA_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.83m ≈ 团块 1/8–1/10 冠径 Spec §B；采样偏移与三先例去相关）
float zlkClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 1.20 + vec2(17.8, 9.4));`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const ZELKOVA_LEAF_SHADE = /* glsl */ `
float zlkShade = clamp((vTreePos.y - 2.8) / 3.0, 0.0, 1.0); // 冠基 ≈2.8m（干高占比 0.30–0.40 × ≈8m，Spec §3/§A Inferred [7][8]；区间取值工程设定）`;

/** High 专属：叶脉两件（中脉亮带 / 羽状侧脉网）纯 ALU 零采样 */
const ZELKOVA_LEAF_VEIN = /* glsl */ `
// 叶脉：中脉亮带 + 羽状侧脉对（纯羽状脉——三属脉型三分化第三型：朴树三出脉自叶基 / 香樟
// 离基三出脉 / 榉树纯羽状无基出脉。侧脉自中脉均匀发出斜伸直伸叶缘、脉端达缘入齿——载波
// 与齿载波同频 62.83（每对侧脉对应一齿的达缘统计读向——FOC 属级「脉端直达齿尖」Verified
// [6]；非逐齿相位锁定记档：对齐需逐叶 rand 相位耦合，收益亚像素）+ 先端渐尖区渐隐；浅黄绿
// 脉色（可见度沿朴树 Step 4b sRGB 编码压缩教训定标）；纯 ALU 零采样
vec2 zlkP = vec2(vUv.x - 0.5, vUv.y);
zlkP.x -= 0.030 * (1.0 - 0.7 * zlkP.y); // 与 SDF 同款叶基偏斜（中脉沿偏斜轴）
float zlkVeinMid = 1.0 - smoothstep(0.012, 0.040, abs(zlkP.x)); // 中脉带（平顶加宽——朴树 Step 4b 口径）
float zlkVeinLat = pow(max(0.0, sin(zlkP.y * 62.83 - abs(zlkP.x) * 26.0 + (vLeafRand - 0.5) * 0.6)), 5.0)
  * (1.0 - zlkVeinMid)
  * smoothstep(0.035, 0.10, zlkP.y) * (1.0 - smoothstep(0.86, 0.96, zlkP.y)); // 羽状侧脉：叶基上方即均匀分布（无特强基出对——vs 朴树/香樟主对），10 对斜伸直伸（与齿同频）
`;

/** High 专属：合成（叶团乘子 + 脉两件调制——羽状网身份核心权重 0.55 均匀中强，无主对） */
const ZELKOVA_LEAF_MUL_HIGH = /* glsl */ `
vec3 zlkMul = zlkHue * zlkLuma * (0.80 + 0.20 * zlkShade) * (0.94 + 0.12 * zlkClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
zlkMul = mix(zlkMul, zlkMul * vec3(1.62, 1.34, 1.00), zlkVeinMid * 1.00 + zlkVeinLat * 0.55); // 中脉满权 + 羽状网 0.55（vs 朴树三出对 0.75/香樟离基对 0.78——榉树无主对、全网均匀读向）
diffuseColor.rgb *= zlkMul;`;

/** Mid/Low：合成（去叶团/叶脉项——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const ZELKOVA_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 zlkMul = zlkHue * zlkLuma * (0.80 + 0.20 * zlkShade); // Mid/Low：叶团乘子均值化消去（T011.3）
diffuseColor.rgb *= zlkMul;`;

/** 叶背浅绿无粉感（三档共用，纯 ALU 零采样零分支） */
const ZELKOVA_LEAF_BACK = /* glsl */ `
// 叶背浅绿（Spec §5 Verified [1][2][3][4]：叶面绿或深绿、叶背浅绿——中等深浅对比、无粉感
// （vs 香樟背面 glaucous 粉感））：gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面
// 片元，背面法线由 three 双面光照自动翻转，此处只调固有色）——背面 R/G 主导提亮（浅绿 =
// 亮暖绿读向）、B 低抬（**无冷灰粉感**——与香樟 ×(1.06,1.05,1.16) B 主导 glaucous 分化），
// 幅度强于朴树 ×(1.02,1.00,1.10)（中等深浅对比可辨）；两面糙度差 +0.08（薄纸质毛被脱落
// 两面趋光滑——差小于朴树 +0.12 / 香樟 +0.16）；纯 ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.10, 1.12, 1.04), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  最强版：薄纸质至厚纸质透光三资产最强（Spec §5 质地 Verified [1][2][3] + 相对等级
 *  Inferred）——峰值 0.40 高于朴树 0.30 / 香樟 0.22。 */
const ZELKOVA_LEAF_TRANSLUCENCY = /* glsl */ `
// zelkova:leaf —— 背光透射（三资产最强）：视线与阳光反向时叶背透亮黄绿（叶绿素吸收红蓝 →
// 透射偏黄绿；薄纸质叶透光强——峰值 0.40 vs 朴树 0.30 / 香樟 0.22，Spec §5）
#if NUM_DIR_LIGHTS > 0
  float zlkBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float zlkTransVar = 0.55 + 0.45 * fract(vLeafRand * 9.133 + 0.29); // 逐叶透光强度变奏
  outgoingLight += vec3(0.60, 0.92, 0.34) * directionalLights[0].color
    * pow(zlkBack, 3.0) * zlkTransVar * zlkAlpha * 0.40;
#endif
`;

/** 树皮配方主体（<map_fragment> 后注入；uv 域 u=环绕一周 v=累计弧长 ×0.5 + 位置域门控）。
 *  分段拼装（沿先例体例）：High = HEAD + HIGH + FLAKE + MUL；Mid = HEAD_MID + HIGH +
 *  FLAKE + MUL_MID（去边缝/暗镶——次级贴片细节）；Low = HEAD_LOW + HIGH + MUL_LOW
 *  （斑驳系统全部去采样——均值化常量乘子 + 上部紫褐偏色保留）。 */
const ZELKOVA_BARK_HEAD = /* glsl */ `
// zelkova:bark —— 光滑灰白-灰褐/灰绿基底 + 暖色薄片剥落斑驳（vs 夏栎脊沟浮雕 / 朴树浅裂小斑块 / 香樟纵裂深沟——第四种树皮语言：无脊沟系统，唯一带橙锈色新斑）`;

/** Mid 档头注释（内容面与 High 的差仅记档一行） */
const ZELKOVA_BARK_HEAD_MID = /* glsl */ `
// zelkova:bark:mid —— 光滑基底 + 暖色剥落斑驳（T011.3 Mid：去边缝暗线/暗色镶嵌——次级贴片细节；斑驳色块本体 + 上部紫褐偏色保留——中距剥落斑驳是主要辨识特征 Spec §7）`;

/** Low 档头注释 */
const ZELKOVA_BARK_HEAD_LOW = /* glsl */ `
// zelkova:bark:low —— 光滑基底 + 斑驳均值化常量乘子（T011.3 Low：剥落斑远距不可辨 Spec §7 全部去采样——光滑皮语言天然零结构项）`;

/** 干上部/细枝高度门控（三档共用——结构剪影项三档保留，沿先例体例） */
const ZELKOVA_BARK_HIGH = /* glsl */ `
// 干上部/细枝：当年生枝紫褐色或棕褐色（Spec §4 twig_surface Verified [1][2][3][4]）+ 斑径 < 枝径不可辨
float zlkBarkHigh = smoothstep(2.2, 4.6, vTreePos.y);`;

/** 剥落斑驳系统核心（High/Mid 共用段——Low 整段不拼）：斑域 + 斑内三色带采样。
 *  Step 4b 校准 2026-09-20（屏幕可辨性校准）：频率 (11,14)→(6,5)——旧晶胞 ~7cm 在 2.6m
 *  机位 ≈5px 被 MSAA/软边磨平（T26 探针暖斑 0.0000），放大至晶胞 18–25cm ≈干径 26cm 的
 *  1/4–1/2 域屏幕可辨；占比 (0.60,0.68)→(0.62,0.72)——JS 复算 ≈33%→≈26%（Spec 15–30%
 *  域中上，斑更大更少更醒目）。 */
const ZELKOVA_BARK_FLAKE = /* glsl */ `
// 斑域 = 值噪声高带软阈值（面积 ≈26%——Spec §5「新鲜剥落斑 ≈15–30%」域中上；JS 复算
// P(x>0.67) ≈ 24–26% 工程标定，Step 4b 校准 2026-09-20）；斑域频率 (6,5)——晶胞 18–25cm
// ≈干径 26cm 的 1/4–1/2 域（Spec §5 [8] 工程标定；旧 (11,14) 晶胞 ~7cm 在 2.6m 机位 ≈5px
// 被 MSAA/软边磨平——放大提斑径至可辨，Step 4b）
float zlkBarkDomain = facVnoise(vec2(vUv.x * 6.0, vUv.y * 5.0) + vec2(15.7, 8.9));
float zlkBarkFlake = smoothstep(0.62, 0.72, zlkBarkDomain); // 软阈值斑域（边缘渐变 = 薄片剥落过渡读向；Step 4b：旧 (0.60,0.68) 占比 ≈33% 出域上沿 → 域中上 ≈26%）
// 斑内色分层（同频偏移第二采样——每斑一色、斑间色异）：奶油白 / 浅褐 / 锈橙-橙褐 三色带
float zlkBarkTone = facVnoise(vec2(vUv.x * 6.0, vUv.y * 5.0) + vec2(31.4, 22.6));
float zlkBarkFlakeW = zlkBarkFlake * mix(1.0, 0.55, zlkBarkHigh); // 细枝斑驳弱化（斑径 < 枝径不可辨）
`;

/** High：合成（三色带 + 斑缘缝暗 + 旧皮暗镶 + 上部紫褐偏色） */
const ZELKOVA_BARK_MUL = /* glsl */ `
vec3 zlkFlakeColor = mix(
  mix(vec3(1.26, 1.21, 1.10), vec3(1.16, 1.05, 0.90), smoothstep(0.24, 0.48, zlkBarkTone)),
  vec3(1.35, 0.92, 0.64), smoothstep(0.55, 0.78, zlkBarkTone)); // 奶油白→浅褐→锈橙-橙褐（唯一带橙锈色新斑的语言——Spec §5 [8] + 终审交叉确认；Step 4b 校准 2026-09-20：色带阈值下移 + 锈橙对比微增（R 升 G/B 降——锈橙读向更明），E[s2] 0.16→0.25、锈橙读向斑面积 ~4%→~6%）
vec3 zlkBarkMul = mix(vec3(1.0), zlkFlakeColor, zlkBarkFlakeW);
zlkBarkMul *= 1.0 - zlkBarkFlakeW * (1.0 - zlkBarkFlakeW) * 4.0 * 0.14; // 斑缘缝暗（薄片翘曲边缝阴影——贴片感，bark-a「边缘翘曲」[8]）
float zlkBarkDark = smoothstep(0.18, 0.26, zlkBarkDomain) * (1.0 - smoothstep(0.34, 0.44, zlkBarkDomain)); // 旧皮暗色小块镶嵌带（domain 中低带——与斑域高带互斥，复用零新增采样）
zlkBarkMul *= mix(vec3(1.0), vec3(0.90, 0.88, 0.87), zlkBarkDark * (1.0 - zlkBarkFlake));
zlkBarkMul *= mix(vec3(1.0), vec3(1.05, 0.99, 0.97), zlkBarkHigh); // 上部紫褐偏色（当年生枝紫褐/棕褐）
diffuseColor.rgb *= zlkBarkMul;
`;

/** Mid：合成（去边缝/暗镶；斑驳本体三色带 + 上部紫褐偏色 + 细枝弱化保留——三色带与 High
 *  逐字同源（Step 4b 校准随 High 同步）） */
const ZELKOVA_BARK_MUL_MID = /* glsl */ `
vec3 zlkFlakeColor = mix(
  mix(vec3(1.26, 1.21, 1.10), vec3(1.16, 1.05, 0.90), smoothstep(0.24, 0.48, zlkBarkTone)),
  vec3(1.35, 0.92, 0.64), smoothstep(0.55, 0.78, zlkBarkTone));
vec3 zlkBarkMul = mix(vec3(1.0), zlkFlakeColor, zlkBarkFlakeW); // 剥落斑暖色新露（中距身份保留）
zlkBarkMul *= mix(vec3(1.0), vec3(1.05, 0.99, 0.97), zlkBarkHigh); // 上部紫褐偏色保留
diffuseColor.rgb *= zlkBarkMul;
`;

/** Low：合成（斑驳均值化常量乘子 + 上部紫褐偏色保留——结构剪影项）。
 *  Step 4b 校准 2026-09-20 重算：按新阈值/色带 JS 采样（200 万样本复现 facVnoise）逐样本
 *  走 High 完整合成式 E[(1+F(C−1))·(1−F(1−F)·0.56)·(1+K(1−F)(D−1))]（干下部 zlkBarkHigh=0
 *  口径；F=smoothstep(0.62,0.72,domain) 均值 0.241、C=新三色带均值 (1.238,1.065,0.894)、
 *  K=暗镶带、D=(0.90,0.88,0.87)、缝暗 0.56 系数——旧式近似同法复算 (1.033,0.993,0.948)
 *  对旧值 (1.036,0.987,0.941) 偏差 ≤0.008 不可辨，口径自洽）→ (1.025, 0.980, 0.937)。 */
const ZELKOVA_BARK_MUL_LOW = /* glsl */ `
vec3 zlkBarkMul = vec3(1.025, 0.980, 0.937); // 斑驳均值化常量乘子（T011.3 Low——光滑基底 + 均值暖偏；Step 4b 校准 2026-09-20 按新分布重算）
zlkBarkMul *= mix(vec3(1.0), vec3(1.05, 0.99, 0.97), zlkBarkHigh); // 上部紫褐偏色（结构剪影项三档保留）
diffuseColor.rgb *= zlkBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 卵状披针形尖锯齿叶 alphaTest 裁切 + 羽状脉网（High）+ 两面区分
 * + 最强透光 + 逐叶变奏 + 风动。level 分档（T011.3，缺省 'high'）：Mid 去叶脉两件 +
 * 叶团斑块（Spec §7 叶脉仅近距可辨；SDF 全形含齿保留——中距锯齿读向是 vs 香樟全缘的
 * 辨识差），透光/叶背/hue·luma/shade/两面糙度差保留；Low 换 ZELKOVA_LEAF_SDF_LOW
 * （去齿载波/齿调制——锯齿细化；包络/偏斜/渐尖与 High 逐字同源）+ 去透光/叶脉/叶团，
 * 片元零噪声采样。风动三档同源不动（ZELKOVA_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：深绿 #3e6c2c（工程设定——OSU "dark green" + §5 冠层中绿-深绿交叉；亮度介于香樟
 * 最暗与朴树亮之间、黄绿量级近朴树暗一档）/ m 0 / r 0.62（半光泽微糙——Spec §5
 * "somewhat rough above" Verified [7][8]；介于香樟革质 0.50 与朴树半光泽 0.72 之间）/
 * DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createZelkovaLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x3e6c2c, // 深绿（工程设定：OSU dark green [7] + 冠层中绿-深绿 [8] 交叉；Spec §5 Verified [1][2][3][4]）
    metalness: 0,
    roughness: 0.62, // 半光泽微糙（Spec §5 "somewhat rough above" Verified [7][8]；vs 香樟 0.50 革质亮 / 朴树 0.72 半光泽）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? ZELKOVA_LEAF_SDF_LOW : ZELKOVA_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含齿）
  const leafBody = level === 'high'
    ? ZELKOVA_LEAF_HEAD + ZELKOVA_LEAF_CLUMP + ZELKOVA_LEAF_SHADE + ZELKOVA_LEAF_VEIN + ZELKOVA_LEAF_MUL_HIGH + ZELKOVA_LEAF_BACK
    : ZELKOVA_LEAF_HEAD + ZELKOVA_LEAF_SHADE + ZELKOVA_LEAF_MUL_SIMPLE + ZELKOVA_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (zlkClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.08, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.08, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面光泽差保留——薄纸质两面趋光滑）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${ZELKOVA_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${ZELKOVA_WIND}`,
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
        `${ZELKOVA_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `zelkova:leaf${levelKeySuffix(level)}`;
  return material;
}

/**
 * 树皮材质（组 0）：光滑灰白-灰褐/灰绿基底 + 暖色薄片剥落斑驳（斑域三色带 + 斑缘缝暗 +
 * 旧皮暗镶 + 上部紫褐偏色）+ 整树缓摆（与叶同公式同相位；aBend 恒 0 快颤层天然不作用）。
 * level 分档（T011.3，缺省 'high'）：Mid 去边缝暗线/暗色镶嵌（次级贴片细节），斑驳本体
 * （斑域 + 三色带）+ 上部紫褐偏色 + 细枝弱化保留——中距剥落斑驳色块是主要辨识特征
 * （Spec §7）；Low 剥落斑远距不可辨（Spec §7 牺牲顺序）——斑驳系统全部去采样，均值化
 * 常量乘子 + 上部紫褐偏色保留（结构剪影项），零噪声采样（光滑皮语言天然无脊沟结构项）。
 * 风动三档同源不动。
 * 底参：灰白-灰褐带灰绿主调 #787c72（工程设定——文献「灰白色或褐灰色」+ 照片 gray-green
 * base 交叉；R−G = −4 四树唯一 G>R 灰绿读向；Spec §5 bark_color Verified [1][2][3][4]）/
 * m 0 / r 0.88（光滑灰皮微弱光泽）/ FrontSide。
 */
export function createZelkovaBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x787c72, // 灰白-灰褐带灰绿（工程设定：文献灰白/褐灰 + 照片 gray-green 交叉；四树唯一 G>R）
    metalness: 0,
    roughness: 0.88, // 光滑灰皮微弱光泽（smooth-gray——OSU [7]；略低于三先例哑光系）
    side: THREE.FrontSide,
  });
  material.defines = { USE_UV: '' }; // 斑驳域 = 圆柱 uv（u=环绕一周、v=累计弧长）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'low'
    ? ZELKOVA_BARK_HEAD_LOW + ZELKOVA_BARK_HIGH + ZELKOVA_BARK_MUL_LOW
    : level === 'mid'
      ? ZELKOVA_BARK_HEAD_MID + ZELKOVA_BARK_HIGH + ZELKOVA_BARK_FLAKE + ZELKOVA_BARK_MUL_MID
      : ZELKOVA_BARK_HEAD + ZELKOVA_BARK_HIGH + ZELKOVA_BARK_FLAKE + ZELKOVA_BARK_MUL;
  const barkRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor - zlkBarkFlakeW * 0.10 + zlkBarkDark * 0.04 + zlkBarkHigh * 0.02, 0.05, 1.0); // 新剥露斑光滑（smooth 新皮层）+ 暗镶微糙 + 上部小枝微糙（疏柔毛）'
    : level === 'mid'
      ? 'roughnessFactor = clamp(roughnessFactor - zlkBarkFlakeW * 0.10, 0.05, 1.0); // Mid：去暗镶/上部糙度项（新斑光滑保留）'
      : 'roughnessFactor = clamp(roughnessFactor + zlkBarkHigh * 0.02, 0.05, 1.0); // Low：上部小枝微糙保留（剥落斑糙度项随段去）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${ZELKOVA_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${ZELKOVA_WIND}`,
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
  material.customProgramCacheKey = () => `zelkova:bark${levelKeySuffix(level)}`;
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（同源全形
 * 含齿——中距锯齿影读向保留）；Low = ZELKOVA_LEAF_SDF_LOW（表面/影档内一致——去齿版）。
 * **深度片元不挂噪声库**——SDF 零 facVnoise 引用（齿调制 ALU 化 = 齿载波 + 深度零噪声的
 * 组合首例：免朴树齿噪声进 depth pass 的账；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 树皮组守卫：aLeafRand=0（树皮恒 0）→ alpha=1 实心——多材质网格共用本深度材质时皮组
 * 不被叶形 SDF 误裁。风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由
 * shadowMap 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap
 * 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createZelkovaLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  const leafSdf = level === 'low' ? ZELKOVA_LEAF_SDF_LOW : ZELKOVA_LEAF_SDF; // Mid 深度 = High SDF（同源全形含齿）
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
diffuseColor.a = mix(1.0, zlkLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 皮组 aLeafRand=0 → 实心`,
    );
  };
  material.customProgramCacheKey = () => `zelkova:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
