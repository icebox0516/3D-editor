/**
 * runtime/procedural/tree/ginkgo/ginkgoMaterials —— 银杏（asset_tree_ginkgo）叶/树皮材质
 * + 风动 + 叶影深度材质（T011.4）。
 *
 * 职责：复制朴树/香樟/榉树已验收的配方方法（onBeforeCompile 注入工厂 L2 全套纪律：
 *   replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 *   <color_fragment> 绝不触碰），物种配方按银杏自己的 Reference Spec 换装——
 *   Spec docs/research/ginkgo-reference.md **1.0**（任务书锚点 1.0，开工前已校验一致，含
 *   2026-09-20 终审记档：文献轴 100% 逐字通过；**终审 C 节降级条件适用本材质参数——比例类
 *   数值以文献轴为准**：叶宽 5–8cm/叶柄 3–10cm/裂刻分布 60/30/10 维持（叶系主张另有
 *   FRPS/FOC Verified 承重），干高占比降级 Unknown（冠基门控取工程默认域记档），树皮裂深
 *   取浅-中端（C-6 中庸处置））。
 *   消费冻结几何契约（与四先例同款）：组 0 树皮 FrontSide / 组 1 叶卡 DoubleSide，叶卡固有
 *   attribute aLeafRand / aBend + 实例 aSeed；树皮组 aLeafRand 恒 0、aBend 恒 0。
 *
 * 叶（组 1）配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - 【SDF 全新叶形族——本任务核心】扇形包络推导与框架适配结论：前四例框架为
 *     sin(π·v^p) 全周期包络（基部 0 宽 → 内部最宽 v=0.5^(1/p) → 先端收 0 的「卵形/披针形
 *     + 中轴」连续轮廓），扇形「基部窄楔 → 顶端最宽且顶端是全宽边」的单调张开轮廓在全周期
 *     sin 下**不可表达**（v=1 处必然收 0）。文件内最小扩展 = 三件组合（不扩公共抽象）：
 *     ① 半周期正弦包络 sin(π/2·v^1.10)——单调递增至 v=1 处达最大半宽（vs 先例 v=1 收 0）：
 *     基部线性张开 = 宽楔形 cuneate（Spec §4「基部宽楔形」Verified [1][2][3]），指数 1.10
 *     使基部略圆肩后直线张开、上半部近满宽（v=0.5 处 ≈67% / v=0.9 处 ≈98% 半宽——扇形张开
 *     读向，Spec §4「扇形、上部宽」Verified + §B leaf_aspect_ratio 宽>高 1.1–1.6 Inferred
 *     [7]）；宽高比归几何侧（卡面比例），SDF 只管包络。
 *     ② 顶端宽边半平面 0.965−v——扇形顶边（Spec §4「顶端宽 5–8cm」Verified [1][2][3]——
 *     顶端是全宽边而非收尖点，先例「变指数收口」项不适用）；边缘斜率 1 保持 /0.04 坡的
 *     AA 锐度（若靠包络自身在 v→1 收口，sin 顶点导数趋 0 → 顶边过渡带宽 ≈0.4 卡宽不可用）。
 *     ③ 侧缘 × 顶边 min() 双半平面合成（交角圆化可忽略）；侧缘全缘平直**无齿载波**
 *     （Spec §4「边缘全缘（margin entire）、平直」Verified [1][2][3]——vs 朴树圆钝齿/
 *     夏栎裂片/榉树尖齿，四例齿通道全部不启用，全缘先例看香樟）。
 *     ④ 顶端缺刻系统（Spec §4「上半部波状缺刻 ≈60% / 明显 2 裂 ≈30% / 近全缘 ≈10%」——
 *     照片 leaf-a 定量 Inferred [7] + FRPS「短枝上常具波状缺刻，长枝上常 2 裂」叶位分化
 *     Verified [1][2]；60/30/10 以 aLeafRand 统计近似，叶位分化归几何侧——契约缺口候选①）：
 *     侧向波状载波 cos(x·25.13)（2π·4——全宽 4 周期 ≈2 波谷/侧，pow 1.6 谷形）逐叶相位
 *     rand·2π 错开 + 中央缺刻 pow(max(0,1−|x|·3.2),1.6)（2 裂深缺刻读向），中央缺刻深度按
 *     rand 分型（<0.30 深裂 0.17–0.30 / 0.30–0.90 浅缺 0.02–0.08 / >0.90 近全缘——波状与
 *     中央双通道同步压灭）+ 侧缘门控 |x| 0.38–0.47 渐隐（缺刻只在上半部顶边，侧缘平直
 *     纪律）。全 ALU 零噪声（缺刻载波 ALU 化沿榉树 011.3 先例——SDF 零 facVnoise 引用 →
 *     深度材质不挂噪声库）。
 *   - 【二叉分歧脉——五例唯一非中轴脉型】辐射射线族 + 一次二叉：无中脉带无侧脉对（先例
 *     羽状/三出脉框架完全不适用——Spec §4「2 条脉入叶基后反复二叉分岔、辐射张开、不结网」/
 *     FOC 科级 "venation parallel, close, dichotomous, open but with rare anastomoses"
 *     Verified [1][3][5]）；射线族坐标 = x/max(v,0.10)（沿自叶基放射线恒定——免 atan 的角
 *     坐标代理）× 载波角频 5.5（顶端 ≈6 脉/侧、平行密脉读向）× 二叉因子 mix(1,2,
 *     smoothstep(0.30,0.52,v))（载波频率沿 v 翻倍 = 每脉上行分岔为二的二叉分歧读向）+
 *     基部收敛渐显 smoothstep(0.10,0.28)（防射线汇聚摩尔纹）+ **脉端开放渐隐 0.78–0.90**
 *     （FOC "open" = 脉不达缘 Verified [3]——装饰层不达缘可接受性以 Spec 为准：不达缘本身
 *     就是正确表达，记档）+ 侧缘肩部渐隐；权重 0.40 隐约可见（照片「辐射平行脉隐约可见」
 *     [7]）；纯 ALU 零采样。非逐缺刻相位锁定记档（对齐需 rand 相位耦合，收益亚像素——沿
 *     榉树口径）。
 *   - 两面同色无两面差（**五例首个无背面通道**；任务简报写「两面深浅差异」但 Spec §5 明确
 *     「两面同色、无粉感、无两面差（照片 canopy-b both sides same medium green）」Inferred
 *     [7] + FRPS「淡绿色，无毛」单面描述无上面/下面分化 Verified [1][2]——Spec 口径优先，
 *     vs 朴树/香樟/榉树均有背面乘子）：无 BACK 段、注入代码零 gl_FrontFacing 路径、两面
 *     糙度同值（无毛平滑——哑光-半光泽两面一致）。
 *   - 叶色淡绿-黄绿（**五资产最浅**：Spec §5「淡绿色」「嫩绿」Verified [1][2] + 照片中绿-
 *     黄绿调 Inferred [7]——中距色块与樟树深绿直接区分）：底色 #8ab45d（工程设定——五树
 *     最亮、黄绿差 G−B 87 最强黄向读向）。
 *   - 叶面哑光-半光泽（Spec §5「无毛平滑、哑光-半光泽（非蜡质亮面、非糙毛面）」Inferred
 *     [7]）：roughness 0.68（介于榉树 0.62 与朴树 0.72 之间——薄纸质-半肉质裸子叶微光
 *     读向）。
 *   - 薄纸质-半肉质透光中等偏强（Spec §5「薄纸质-半肉质、背光透光中等偏强」Inferred [7]）：
 *     峰值 0.34（介于朴树 0.30 与榉树 0.40 之间——弱于榉树薄纸质、强于朴树近革质）+ 透射色
 *     (0.66,0.95,0.38) 亮黄绿（淡绿叶透光最亮读向）；逐叶变奏 gkTransVar ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand：色相两端冷淡绿↔暖黄绿（Spec §6 变体幅度读向；通道摆幅 ≤15%
 *     纪律）+ 明度 ±8%（去相关取样）。
 *   - 冠内竖向自遮蔽（冠基 ≈2.8m——干高占比 0.30–0.40 工程默认域；**Spec 终审 C-3 该项
 *     降级 Unknown（form 系照片作废、文献无值）——工程默认沿用、无实证支撑记档**）+ 中频
 *     叶团斑块（High，波长 ≈0.85m ≈ 团块 1/8–1/10 冠径 Spec §B Inferred [7]）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent——实例化 + 深度
 *     排序灾难）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿先例，数值微调记档）：整树缓摆 ~0.18Hz / 顶部 ~4.5cm
 *     （aSeed 相位，hash 常数换 82.537——与朴树 78.233/香樟 79.193/榉树 77.669 相位流去
 *     相关）+ 叶片快颤 10–17 rad/s（≈1.6–2.7Hz 慢摆）/ ≤13mm（**长柄扇叶颤**——柄 3–10cm
 *     ≈叶宽同量级 Verified [1][2][7]：摆幅五树最大（>香樟 11mm >榉树 8mm）、频率偏低
 *     （长柄摆锤周期长）；aBend 权重）；树高锚 8m（×0.125——银杏目标 ≈8m，D19.7 同口径）。
 *
 * 皮（组 0）配方（**第五种树皮语言：灰褐纵裂脊沟（中龄浅-中裂相）**——vs 夏栎脊沟浮雕 /
 *   朴树平滑-浅裂小斑块 / 香樟纵裂深沟 / 榉树光滑剥落斑驳；与香樟同纵裂族的三个分化点：
 *   ①色调更灰（灰褐 vs 樟黄褐）②脊更窄密（9 vs 樟 7 宽脊）③无横断块状感通道（樟「局部
 *   横向纹连接成块状感」四照 Verified vs 银杏「纵脊连续」[7]）；另香樟皮孔类特征银杏文献
 *   未记（Unknown）不编造）：
 *   - 主调 #6b665c 灰褐（工程设定——文献「灰褐色」Verified [1][2] + 照片 grayish-brown
 *     Inferred [7] 交叉；R−G = +5 < 香樟 +11（更灰）、B 92 > 香樟 82（冷灰读向）——灰褐
 *     vs 黄褐与樟中距直接区分）。
 *   - 浅-中纵裂剖面（中龄 8m 相：Spec §5「幼树树皮浅纵裂，大树之皮呈灰褐色，深纵裂，粗糙」
 *     序列 Verified [1][2] + **终审 C-6 中庸处置：生产取浅-中端**、脊宽 ≈干径 1/10–1/15
 *     可向细端 1/20 微扩不失真）：沟底 0.64 + tri² 剖面（vs 香樟 0.50 深沟 / 朴树 0.76 浅
 *     裂——浅-中）+ 脊数 9（窄密——vs 香樟 7 宽脊 / 夏栎 14）+ 裂线游走 warp 0.70 ×
 *     (2.4,1.3)（纵向连续长脊、游走介于樟（更直缓）与朴树（更游走）之间）。
 *   - 树瘤伴生（银杏典型读向：照片 bark-a「burl 状树瘤可见」Inferred 单源 [7]——按 Spec
 *     弱证据做弱噪声细节）：低频高带域 ~8–12% → 域内脊沟扰动 + 细密乱纹 + 轻暗（High
 *     专属；幅度克制——单源低置信不做强表达）。
 *   - 干上部/细枝：裂深弱化（一年生长枝「淡褐黄色，二年生以上变为灰色，并有细纵裂纹」
 *     Verified [1][2]——细枝浅裂+趋平滑读向）+ 淡褐黄偏色 ×(1.08,1.03,0.92)；高度门控
 *     2.2–4.6m（结构剪影项三档保留，沿先例体例）。
 *   - 苔藓/地衣**不做**记档：Spec §5「少量、覆盖度低、弱于樟树」+ 单源低置信（bark-a）——
 *     不做不编造（沿榉树先例；vs 朴树/香樟有苔藓层）。
 *   - 短枝黑灰密叶痕（距状钉突——近景身份特征 Spec §4 Verified [1][2][7]）与叶柄（3–10cm
 *     长柄）均为几何语言，材质无通道不越界（记契约缺口候选④）。
 *   - 微起伏已归几何层（脊沟浮雕表达在几何侧皮组起伏语言，任务书口径），材质只管色层。
 *   - 风动：整树缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用）。
 *
 * 深度材质（叶影裁切，customDepthMaterial 契约通道——沿 SOP §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与叶表面
 *     材质共享同一 GLSL 字符串（表面改叶形深度自动同步，不复制粘贴）。
 *   - **零噪声库注入**：扇形包络/缺刻载波/中央裂全 ALU → SDF 零 facVnoise 引用 → 深度
 *     片元不挂 FACILITY_GLSL_NOISE（沿榉树 011.3「齿载波 ALU 化 = 深度零噪声」组合先例）。
 *     保护性约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷（未声明函数），
 *     防复制粘贴漂移。
 *   - 多材质网格守卫：皮组以恒等 attribute（aLeafRand=0）走实心分支，防叶形 SDF 在圆柱
 *     uv 域上误裁出洞。
 *   - 档位匹配：Mid = High SDF 同源全形（含缺刻——档间剪影一致、缺刻 ALU 成本可忽略）/
 *     Low = SDF_LOW 零缺刻版（远距缺刻不可辨——Spec §7 牺牲顺序「缺刻/裂刻形态先于扇形
 *     轮廓牺牲」；包络/顶边与 High 逐字同源——去细节不改形原则，沿朴树/榉树 SDF_LOW 体例）。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿先例）。
 *
 * 分档记档（T011.4，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去二叉脉/中频叶团（Spec §7 叶脉仅近距可辨，Mid 观距不可辨）+ 糙度叶团项；
 *     SDF 全形（含缺刻）/透光/hue·luma/shade 保留（颜色层次档间连续保留面；两面同色无
 *     背面项）。
 *   - 叶 Low：SDF 换 GINKGO_LEAF_SDF_LOW（去缺刻系统——远距缺刻不可辨 Spec §7 牺牲顺序；
 *     包络/顶边与 High 逐字同源）+ 去透光（远距逆光透射不可辨）/叶脉/叶团；hue·luma/shade
 *     保留；片元零噪声。
 *   - 皮 Mid：去树瘤（近距细节——中距不可辨）；脊沟/沟内 AO/上部淡褐黄偏色保留。
 *   - 皮 Low：脊沟保留（裂线游走 vnoise + tri² 浅-中剖面 + 沟内冷灰 AO——中距「树干浅-
 *     中纵裂」Spec §7 可辨）；去树瘤/上部偏色外项；1× vnoise。
 *   - 深度：Mid = High SDF；Low = SDF_LOW（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；ginkgo 前缀不与四先例混缓存）：
 *     'ginkgo:leaf' / 'ginkgo:leaf:mid' / 'ginkgo:leaf:low'；'ginkgo:bark' /
 *     'ginkgo:bark:mid' / 'ginkgo:bark:low'；'ginkgo:leaf-depth' /
 *     'ginkgo:leaf-depth:mid' / 'ginkgo:leaf-depth:low'（9 键全异）。
 *   - 风动（GINKGO_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分
 *     （同公式同常数同 aBend 语义，D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿先例记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团斑块；缺刻载波 ALU 化免噪声）= 3× + SDF（半周期 sin +
 *     缺刻载波 cos + 中央裂 pow）/二叉射线族脉/透光/hue·shade 纯 ALU ≈ 5× ≈ 8×（与榉树
 *     同账）；
 *   - 叶 Mid/Low 片元 = 0× 噪声（噪声库死码编译消除）+ 简化 ALU ≈ 3× / 2×；
 *   - 皮 High 片元 = 2× vnoise（裂线游走 + 树瘤域）= 6× + 剖面/门控纯 ALU ≈ 1.5× ≈ 7.5×；
 *   - 皮 Mid/Low 片元 = 1× vnoise（裂线游走）= 3× + 脊沟 ALU ≈ 1× ≈ 4×；
 *   - 深度片元 = SDF 纯 ALU ≈ 1.5×，**零噪声采样**；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * 契约缺口候选（归 011.13 族级收口；本文件零公共抽象扩展——扇形/辐射脉全部限定文件内）：
 *   ① 长短枝叶位分化无 attribute：Spec §4「短枝叶常具波状缺刻、长枝叶常 2 裂」Verified
 *     叶位×裂刻分化，材质侧只能以 aLeafRand 统计近似 60/30/10——几何侧若有叶位语义通道
 *     可精确分型（候选：叶位 attribute 或挂点组语义）；
 *   ② 顶端宽边叶形（扇形/截形）的「包络+顶边」双半平面 SDF：本文件内 min() 组合表达，
 *     若族内再现顶宽叶形可提炼为家族公共 SDF 模式（暂不动公共抽象）；
 *   ③ 辐射/二叉脉装饰层：x/v 射线族 + 频率翻倍 fork 为文件内实现，脉层四型（中轴/三出/
 *     羽状/辐射）公共抽象待族级收口评估；
 *   ④ 短枝距状钉突（黑灰密叶痕）与长柄（3–10cm）的几何表达通道归属几何侧（材质无通道
 *     不越界）。
 *
 * uTime 接线（业界标准模式，沿先例）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与 celtis/camphor/
 *   zelkova/tree3a 的通用段（风动公式等）为复制改造非 import（资产私有，跨资产不耦合——
 *   organization.md 边界）。
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
  if (!source.includes(target)) throw new Error(`ginkgo 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，树皮恒 0 免颤）。
 * 公式方法沿先例验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值微调记档：
 * hash 常数 82.537/58.219（与朴树/香樟/榉树相位流去相关）+ 树高锚 8m（×0.125——银杏目标
 * ≈8m，D19.7）；快颤 10–17 rad/s（≈1.6–2.7Hz 慢摆）/ ≤13mm 五树最大幅度（叶柄 3–10cm
 * ≈叶宽同量级 Verified——长柄摆锤周期长、幅度大、频率偏低）。
 */
const GINKGO_WIND = /* glsl */ `
// ginkgo wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float gkWindPhase = fract(sin(aSeed * 82.537 + 3.37) * 43758.5453);
float gkWindH = clamp(position.y * 0.125, 0.0, 1.0); // /8m 锚点树高（缩放抖动 ±16% 下权重近似）
float gkSway = gkWindH * gkWindH * 0.045 * sin(uTime * 1.15 + gkWindPhase * 6.28318 + gkWindH * 1.4);
// 叶片快颤：ω = 10 + 7φ（10–17 rad/s ≈ 1.6–2.7Hz 慢摆——长柄摆锤周期长），幅度 ≤13mm 五树最大（柄 3–10cm ≈ 叶宽同量级）；权重 = aBend（卡根≈0 尖大）
float gkFlutterPhase = fract(sin((aSeed + aLeafRand) * 58.219 + 5.1) * 43758.5453);
float gkFlutter = aBend * 0.013 * sin(uTime * (10.0 + 7.0 * gkFlutterPhase) + gkFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (gkSway + gkFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(gkSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * gkFlutter * 0.9; // 叶面沿卡法线微扑（树皮 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——皮组 aLeafRand/aBend 恒 0 契约） */
const GINKGO_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 银杏叶形覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶顶 1）：
 * 扇形包络 = 半周期正弦 sin(π/2·v^1.10)（单调张开——基部 0 宽直线张开 = 宽楔形 cuneate，
 * v=1 处达最大半宽；vs 先例全周期 sin(π·v^p) 顶端收 0 不可表达扇形。Spec §4「扇形……基部
 * 宽楔形」Verified [1][2][3]）× 顶端宽边半平面 0.965−v（顶端全宽边——Spec §4「顶端宽
 * 5–8cm」Verified；斜率 1 保 AA 锐度）min() 合成 × 顶端缺刻系统（侧向波状载波 cos(x·25.13)
 * ≈2 波谷/侧 + 中央缺刻 2 裂读向，rand 分型 60/30/10——照片 leaf-a 定量 Inferred [7] +
 * FRPS 叶位分化 Verified [1][2]；侧缘门控——缺刻只在上半部顶边，侧缘全缘平直 Verified
 * [1][2][3]）；**零 facVnoise 引用是深度材质不挂噪声库的前提（引入即深度编译暴雷——
 * 保护性约束；缺刻载波 ALU 化沿榉树 011.3 组合先例）**；返回近似符号距离的覆盖率坡
 * （edge/0.04——alphaToCoverage 的 fwidth smoothstep 吃这条坡抗锯边；坡宽 0.04 沿先例
 * AA 口径）。
 */
const GINKGO_LEAF_SDF = /* glsl */ `
float gkLeafAlpha(vec2 gkUv, float gkRand) {
  vec2 gkP = vec2(gkUv.x - 0.5, gkUv.y);
  float gkAbsX = abs(gkP.x);
  // 扇形楔状张开包络：sin(π/2·v^1.10)——半周期正弦单调张开（基部圆肩后直线张开 = 宽楔形；v=1 处最大半宽——vs 先例 v=1 收 0）
  float gkEnv = sin(1.5708 * pow(clamp(gkP.y, 0.001, 0.999), 1.10));
  // 顶端缺刻分型（aLeafRand 统计近似 60/30/10：波状 ~60% / 2 裂 ~30% / 近全缘 ~10%——照片 leaf-a Inferred [7]；叶位分化归几何侧，契约缺口候选①）
  float gkR2 = fract(gkRand * 7.713 + 0.41);
  float gkSinus = mix(mix(0.17, 0.30, gkR2 / 0.30), mix(0.02, 0.08, (gkR2 - 0.30) / 0.60), step(0.30, gkR2)); // 中央缺刻深度：<0.30 深裂（2 裂）/ 0.30–0.90 浅缺（波状）/ >0.90 近无
  float gkEntire = smoothstep(0.90, 0.97, gkR2); // 近全缘类：波状与中央缺刻同步渐灭
  float gkWave = 0.5 + 0.5 * cos(gkP.x * 25.13 + gkRand * 6.28); // 侧向波状载波：2π·4——全宽 4 周期 ≈2 波谷/侧，逐叶相位错开
  float gkDip = pow(1.0 - gkWave, 1.6) * 0.10 * (1.0 - smoothstep(0.38, 0.47, gkAbsX)); // 侧向波状缺刻（侧缘门控渐隐——侧缘全缘平直纪律）
  gkDip += pow(max(0.0, 1.0 - gkAbsX * 3.2), 1.6) * gkSinus; // 中央缺刻/深裂（2 裂读向——侧钟形，中央最深向两侧衰减）
  gkDip *= 1.0 - gkEntire;
  // 侧缘（全缘平直无齿载波）× 顶边（缺刻调制）双半平面 min 合成；顶边斜率 1 保持 /0.04 坡 AA 锐度
  float gkEdge = min(0.5 * gkEnv - gkAbsX, 0.965 - gkP.y - gkDip);
  return clamp(gkEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.04（沿先例 AA 口径）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档取用）：
 * 扇形包络 + 顶端宽边即可——去缺刻系统（波状载波/中央裂/分型——**缺刻细化**：远距不可辨，
 * Spec §7 牺牲顺序「缺刻/裂刻形态先于扇形轮廓牺牲」；片元零噪声先天成立）。包络/顶边两项
 * 与 High 逐字同源（档间叶形身份一致的去细节不改形原则，沿朴树/榉树 SDF_LOW 体例）。
 */
const GINKGO_LEAF_SDF_LOW = /* glsl */ `
float gkLeafAlpha(vec2 gkUv, float gkRand) {
  vec2 gkP = vec2(gkUv.x - 0.5, gkUv.y);
  float gkEnv = sin(1.5708 * pow(clamp(gkP.y, 0.001, 0.999), 1.10)); // 扇形楔状包络（与 High 逐字同源）
  float gkEdge = min(0.5 * gkEnv - abs(gkP.x), 0.965 - gkP.y); // 顶端宽边（与 High 同源；去缺刻系统）
  return clamp(gkEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿先例体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH；Mid/Low = HEAD + SHADE + MUL_SIMPLE（去叶团/
 *  叶脉——叶团乘子 0.94+0.12×gkClump 均值化 = 1.0 消去，值噪声均值 0.5 精确保均；
 *  **无 BACK 段——两面同色无两面差，五例首个无背面通道**，Spec §5）。 */
const GINKGO_LEAF_HEAD = /* glsl */ `
// ginkgo:leaf —— SDF 扇形缺刻叶覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float gkAlpha = gkLeafAlpha(vUv, vLeafRand);
diffuseColor.a = gkAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷淡绿 ↔ 暖黄绿——FRPS「淡绿色」+ 照片黄绿高光读向；通道摆幅 ≤15% 纪律）
// + 明度 ±8%（去相关取样）
vec3 gkHue = mix(vec3(0.94, 1.00, 1.03), vec3(1.08, 1.05, 0.88), fract(vLeafRand * 5.871 + 0.23));
float gkLuma = 0.92 + 0.16 * fract(vLeafRand * 3.917 + 0.37);`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const GINKGO_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.85m ≈ 团块 1/8–1/10 冠径 Spec §B；采样偏移与四先例去相关）
float gkClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 1.18 + vec2(21.3, 12.7));`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const GINKGO_LEAF_SHADE = /* glsl */ `
float gkShade = clamp((vTreePos.y - 2.8) / 3.0, 0.0, 1.0); // 冠基 ≈2.8m（干高占比 0.30–0.40 工程默认域——Spec 终审 C-3 降级 Unknown 无实证，工程沿用记档）`;

/** High 专属：二叉分歧辐射脉（无中脉带无侧脉对——先例中轴脉框架不适用），纯 ALU 零采样 */
const GINKGO_LEAF_VEIN = /* glsl */ `
// 二叉分歧辐射脉（五例唯一非中轴脉型）：2 脉入叶基反复二叉、辐射张开、不结网（FRPS「叉状
// 并列细脉」/FOC 科级 "venation parallel, close, dichotomous, open" Verified [1][3][5]）。
// 射线族坐标 = x/max(v,0.10)（沿自叶基放射线恒定——免反三角函数的角坐标代理）× 载波角频 5.5
// （顶端 ≈6 脉/侧——平行密脉读向）；二叉因子 mix(1,2) 沿 v 0.30–0.52 翻倍 = 每脉上行分岔
// 为二的二叉分歧读向；脉端开放渐隐 0.78–0.90（FOC "open" = 脉不达缘 Verified——不达缘
// 即正确表达，记档）；基部收敛渐显防汇聚摩尔纹 + 侧缘肩部渐隐；浅黄绿脉色（可见度沿朴树
// Step 4b sRGB 编码压缩教训定标）；纯 ALU 零采样。非逐缺刻相位锁定记档（对齐需 rand 相位
// 耦合，收益亚像素——沿榉树口径）
vec2 gkP = vec2(vUv.x - 0.5, vUv.y);
float gkVeinRatio = gkP.x / max(gkP.y, 0.10);
float gkVeinFork = mix(1.0, 2.0, smoothstep(0.30, 0.52, gkP.y));
float gkVeinBand = 1.0 - abs(fract(gkVeinRatio * 5.5 * gkVeinFork + (vLeafRand - 0.5) * 0.5) * 2.0 - 1.0);
float gkVein = pow(gkVeinBand, 3.0)
  * smoothstep(0.10, 0.28, gkP.y)
  * (1.0 - smoothstep(0.78, 0.90, gkP.y))
  * (1.0 - smoothstep(0.36, 0.48, abs(gkP.x)));
`;

/** High 专属：合成（叶团乘子 + 二叉辐射脉调制——隐约可见权重 0.40，弱于先例主脉层） */
const GINKGO_LEAF_MUL_HIGH = /* glsl */ `
vec3 gkMul = gkHue * gkLuma * (0.80 + 0.20 * gkShade) * (0.94 + 0.12 * gkClump); // shade 地板 0.80（沿先例宏距暗叶可读性口径）
gkMul = mix(gkMul, gkMul * vec3(1.55, 1.38, 1.05), gkVein * 0.40); // 二叉辐射脉隐约可见（照片「辐射平行脉隐约可见」[7]——无中脉满权层）
diffuseColor.rgb *= gkMul;`;

/** Mid/Low：合成（去叶团/叶脉项——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const GINKGO_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 gkMul = gkHue * gkLuma * (0.80 + 0.20 * gkShade); // Mid/Low：叶团乘子均值化消去（T011.4）
diffuseColor.rgb *= gkMul;`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  中等偏强版：薄纸质-半肉质透光中等偏强（Spec §5 Inferred [7]）——峰值 0.34 介于朴树
 *  0.30 与榉树 0.40 之间。 */
const GINKGO_LEAF_TRANSLUCENCY = /* glsl */ `
// ginkgo:leaf —— 背光透射（中等偏强）：视线与阳光反向时叶背透亮黄绿（叶绿素吸收红蓝 →
// 透射偏黄绿；薄纸质-半肉质透光中等偏强——峰值 0.34，介于朴树 0.30 与榉树 0.40 之间，Spec §5）
#if NUM_DIR_LIGHTS > 0
  float gkBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float gkTransVar = 0.55 + 0.45 * fract(vLeafRand * 8.913 + 0.33); // 逐叶透光强度变奏
  outgoingLight += vec3(0.66, 0.95, 0.38) * directionalLights[0].color
    * pow(gkBack, 3.0) * gkTransVar * gkAlpha * 0.34;
#endif
`;

/** 树皮配方主体（<map_fragment> 后注入；uv 域 u=环绕一周 v=累计弧长 ×0.5 + 位置域门控）。
 *  分段拼装（沿先例体例）：High = HEAD + RIDGE + BURL + MUL；Mid = HEAD_MID + RIDGE +
 *  MUL_MID（去树瘤——近距细节）；Low = HEAD_LOW + RIDGE + MUL_LOW（脊沟保留；去树瘤/
 *  上部偏色外项）。 */
const GINKGO_BARK_HEAD = /* glsl */ `
// ginkgo:bark —— 灰褐纵裂脊沟（中龄浅-中裂、脊窄密、纵脊连续无横断）+ 树瘤伴生 + 干上部淡褐黄（vs 夏栎脊沟浮雕 / 朴树浅斑 / 香樟纵裂深沟 / 榉树光滑剥落——第五种语言）`;

/** Mid 档头注释（内容面与 High 的差仅记档一行） */
const GINKGO_BARK_HEAD_MID = /* glsl */ `
// ginkgo:bark:mid —— 灰褐纵裂脊沟 + 干上部淡褐黄（T011.4 Mid：去树瘤——近距细节中距不可辨）`;

/** Low 档头注释 */
const GINKGO_BARK_HEAD_LOW = /* glsl */ `
// ginkgo:bark:low —— 灰褐纵裂脊沟（T011.4 Low：裂线游走 + tri² 浅-中剖面 + 沟内冷灰 AO 保留——中距「树干浅-中纵裂」Spec §7；去树瘤/上部偏色）`;

/** 脊-沟核心（三档共用——Low 保留面的唯一采样：裂线游走 vnoise；高度门控为结构剪影项三档保留） */
const GINKGO_BARK_RIDGE = /* glsl */ `
float gkBarkWarp = facVnoise(vec2(vUv.x * 2.4, vUv.y * 1.3) + vec2(7.3, 4.9)); // 裂线游走（纵向连续长脊——游走介于樟（更直缓）与朴树（更游走）之间）
float gkBarkTri = abs(fract(vUv.x * 9.0 + gkBarkWarp * 0.70) * 2.0 - 1.0); // 9 窄密脊（脊宽 ≈干径 1/10–1/15 可至 1/20——vs 香樟 7 宽脊 / 夏栎 14；「脊较窄密」Spec §5 分化点）
float gkBarkSmooth = smoothstep(2.2, 4.6, vTreePos.y); // 干上部/细枝裂深弱化（一年生长枝淡褐黄、老枝灰细纵裂——细枝浅裂趋平滑 Verified [1][2]）
// 浅-中纵裂剖面（中龄相：Spec §5「幼树浅纵裂→大树深纵裂」序列 Verified + 终审 C-6 中庸处置生产取浅-中端）：沟底 0.64（vs 香樟 0.50 深沟 / 朴树 0.76 浅裂）
float gkBarkRidge = mix(0.64 + 0.36 * gkBarkTri * gkBarkTri, 0.90 + 0.10 * gkBarkTri * gkBarkTri, gkBarkSmooth);`;

/** High 专属：树瘤域（1× vnoise——Mid/Low 去采样） */
const GINKGO_BARK_BURL = /* glsl */ `
// 树瘤伴生（银杏典型读向：照片 bark-a「burl 状树瘤可见」Inferred 单源 [7]——弱证据弱表达：
// 低频高带 ~8–12% 域内脊沟扰动 + 细密乱纹 + 轻暗；High 专属）
float gkBurlDomain = facVnoise(vec2(vUv.x * 3.2, vUv.y * 1.6) + vec2(27.9, 15.2));
float gkBurl = smoothstep(0.68, 0.80, gkBurlDomain);`;

/** High：合成（树瘤脊沟扰动 + 沟内深冷灰 AO + 树瘤轻暗 + 上部淡褐黄偏色） */
const GINKGO_BARK_MUL = /* glsl */ `
gkBarkRidge = mix(gkBarkRidge, 0.80 + 0.05 * sin(vUv.y * 90.0 + gkBurlDomain * 30.0), gkBurl * 0.60); // 树瘤：脊沟扰动 + 细密乱纹（半肉质隆起读向——弱表达）
vec3 gkBarkMul = gkBarkRidge
  * mix(vec3(0.88, 0.885, 0.92), vec3(1.07, 1.03, 0.93), smoothstep(0.20, 0.80, gkBarkTri)); // 沟内深冷灰 AO（沟脊对比中-高 Spec §5 [7]）
gkBarkMul = mix(gkBarkMul, gkBarkMul * vec3(0.95, 0.93, 0.91), gkBurl); // 树瘤域轻暗
gkBarkMul *= mix(vec3(1.0), vec3(1.08, 1.03, 0.92), gkBarkSmooth); // 干上部/细枝淡褐黄偏色（当年生枝淡褐黄 Verified [1][2]）
diffuseColor.rgb *= gkBarkMul;
`;

/** Mid：合成（去树瘤；脊沟 + 沟内 AO + 上部偏色保留——AO 式与 High 逐字同源） */
const GINKGO_BARK_MUL_MID = /* glsl */ `
vec3 gkBarkMul = gkBarkRidge
  * mix(vec3(0.88, 0.885, 0.92), vec3(1.07, 1.03, 0.93), smoothstep(0.20, 0.80, gkBarkTri)); // 沟内深冷灰 AO（与 High 逐字同源）
gkBarkMul *= mix(vec3(1.0), vec3(1.08, 1.03, 0.92), gkBarkSmooth); // 上部淡褐黄偏色保留
diffuseColor.rgb *= gkBarkMul;
`;

/** Low：合成（脊沟 + 沟内冷灰 AO——脊沟读向不破；去树瘤/上部偏色采样外项） */
const GINKGO_BARK_MUL_LOW = /* glsl */ `
vec3 gkBarkMul = gkBarkRidge
  * mix(vec3(0.88, 0.885, 0.92), vec3(1.07, 1.03, 0.93), smoothstep(0.20, 0.80, gkBarkTri)); // 沟内冷灰 AO（与 High 逐字同源）
diffuseColor.rgb *= gkBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 扇形缺刻叶 alphaTest 裁切 + 二叉辐射脉（High）+ 两面同色（无背面
 * 通道——五例首例）+ 中等偏强透光 + 逐叶变奏 + 风动。level 分档（T011.4，缺省 'high'）：
 * Mid 去二叉脉/叶团 + 糙度叶团项（Spec §7 叶脉仅近距可辨；SDF 全形含缺刻保留——档间剪影
 * 一致），透光/hue·luma/shade 保留；Low 换 GINKGO_LEAF_SDF_LOW（去缺刻系统——缺刻细化；
 * 包络/顶边与 High 逐字同源）+ 去透光/叶脉/叶团，片元零噪声采样。风动三档同源不动
 * （GINKGO_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：淡绿-黄绿 #8ab45d（工程设定——五树最浅最黄：FRPS「淡绿色」Verified + 照片中绿-
 * 黄绿调 Inferred [7] 交叉；中距色块与樟树深绿直接区分）/ m 0 / r 0.68（哑光-半光泽——
 * Spec §5「非蜡质亮面、非糙毛面」Inferred [7]；介于榉树 0.62 与朴树 0.72 之间）/ DoubleSide
 * （卡面双面可见，背面法线由 three 双面光照自动翻转；两面固有色同值——Spec §5 两面同色）。
 */
export function createGinkgoLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x8ab45d, // 淡绿-黄绿（工程设定：五树最浅——FRPS「淡绿色」Verified [1][2] + 照片黄绿调 Inferred [7] 交叉）
    metalness: 0,
    roughness: 0.68, // 哑光-半光泽（Spec §5「非蜡质亮面」Inferred [7]；介于榉树 0.62 与朴树 0.72 之间——薄纸质-半肉质微光）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? GINKGO_LEAF_SDF_LOW : GINKGO_LEAF_SDF; // Mid 表面 SDF = High 同源全形（含缺刻）
  const leafBody = level === 'high'
    ? GINKGO_LEAF_HEAD + GINKGO_LEAF_CLUMP + GINKGO_LEAF_SHADE + GINKGO_LEAF_VEIN + GINKGO_LEAF_MUL_HIGH
    : GINKGO_LEAF_HEAD + GINKGO_LEAF_SHADE + GINKGO_LEAF_MUL_SIMPLE; // Mid/Low 同体（档差在 SDF / 透光注入；无 BACK 段——两面同色）
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${GINKGO_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${GINKGO_WIND}`,
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
    if (level === 'high') { // 糙度注入仅 High（叶团微变——两面同色无背面糙度差，Mid/Low 无项不注入）
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + (gkClump - 0.5) * 0.06, 0.05, 1.0); // 叶团糙度微变（两面同值——Spec §5 无两面差）`,
      );
    }
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${GINKGO_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `ginkgo:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 树皮材质（组 0）：灰褐纵裂脊沟（浅-中剖面 + 9 窄密脊 + 纵向连续裂线）+ 树瘤伴生（High）+
 * 沟内冷灰 AO + 干上部淡褐黄偏色 + 整树缓摆（与叶同公式同相位；aBend 恒 0 快颤层天然不
 * 作用）。level 分档（T011.4，缺省 'high'）：Mid 去树瘤（近距细节——中距不可辨），脊沟/
 * 沟内 AO/上部偏色保留；Low 脊沟保留（中距「树干浅-中纵裂」Spec §7 可辨），去树瘤/上部
 * 偏色外项。风动三档同源不动。
 * 底参：灰褐主调 #6b665c（工程设定——文献「灰褐色」Verified [1][2] + 照片 grayish-brown
 * Inferred [7] 交叉；R−G = +5 < 香樟 +11 更灰、B 92 > 香樟 82 冷灰读向——灰褐 vs 黄褐与樟
 * 分化）/ m 0 / r 0.91（高糙哑光）/ FrontSide。
 */
export function createGinkgoBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x6b665c, // 灰褐（工程设定：文献灰褐 + 照片 grayish-brown 交叉；vs 香樟黄褐更灰更冷——Spec §5 Verified [1][2])
    metalness: 0,
    roughness: 0.91, // 高糙哑光（纵裂粗糙读向）
    side: THREE.FrontSide,
  });
  material.defines = { USE_UV: '' }; // 裂沟/树瘤域 = 圆柱 uv（u=环绕一周、v=累计弧长）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'low'
    ? GINKGO_BARK_HEAD_LOW + GINKGO_BARK_RIDGE + GINKGO_BARK_MUL_LOW
    : level === 'mid'
      ? GINKGO_BARK_HEAD_MID + GINKGO_BARK_RIDGE + GINKGO_BARK_MUL_MID
      : GINKGO_BARK_HEAD + GINKGO_BARK_RIDGE + GINKGO_BARK_BURL + GINKGO_BARK_MUL;
  const barkRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor - gkBarkTri * gkBarkTri * 0.05 + gkBurl * 0.06 - gkBarkSmooth * 0.03, 0.05, 1.0); // 脊面微光滑（纵裂脊顶磨蚀）+ 树瘤微糙（隆起乱纹）+ 上部细枝微光（淡褐黄一年生枝）'
    : level === 'mid'
      ? 'roughnessFactor = clamp(roughnessFactor - gkBarkTri * gkBarkTri * 0.05 - gkBarkSmooth * 0.03, 0.05, 1.0); // Mid：去树瘤糙度项（脊面/上部项保留）'
      : 'roughnessFactor = clamp(roughnessFactor - gkBarkTri * gkBarkTri * 0.05, 0.05, 1.0); // Low：脊面微光滑保留（树瘤/上部项去）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${GINKGO_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${GINKGO_WIND}`,
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
  material.customProgramCacheKey = () => `ginkgo:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（同源全形
 * 含缺刻——档间剪影一致）；Low = GINKGO_LEAF_SDF_LOW（表面/影档内一致——去缺刻版）。
 * **深度片元不挂噪声库**——SDF 零 facVnoise 引用（扇形包络/缺刻载波/中央裂全 ALU——沿
 * 榉树 011.3「缺刻 ALU 化 = 深度零噪声」组合先例；SDF 内引入噪声即编译暴雷——保护性
 * 约束）。
 * 树皮组守卫：aLeafRand=0（树皮恒 0）→ alpha=1 实心——多材质网格共用本深度材质时皮组
 * 不被叶形 SDF 误裁。风动位移不进 depth pass（静态影取舍，沿先例）；影 pass 侧向由
 * shadowMap 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap
 * 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createGinkgoLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  const leafSdf = level === 'low' ? GINKGO_LEAF_SDF_LOW : GINKGO_LEAF_SDF; // Mid 深度 = High SDF（同源全形含缺刻）
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
diffuseColor.a = mix(1.0, gkLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 皮组 aLeafRand=0 → 实心`,
    );
  };
  material.customProgramCacheKey = () => `ginkgo:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
