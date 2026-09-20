/**
 * runtime/procedural/tree/camphor/camphorMaterials —— 香樟（asset_tree_camphor）叶/树皮材质
 * + 风动 + 叶影深度材质（T011.2）。
 *
 * 职责：复制朴树 celtisMaterials 已验收的配方方法（onBeforeCompile 注入工厂 L2 全套纪律：
 *   replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 *   <color_fragment> 绝不触碰），物种配方按香樟自己的 Reference Spec 换装——
 *   Spec docs/research/camphor-reference.md **1.0**（任务书锚点 1.0，开工前已校验一致，含
 *   2026-09-20 主代理终审记档：硬数值逐字抽查 + 照片第二视觉系统交叉通过）。
 *   消费冻结几何契约（与夏栎/朴树同款）：组 0 树皮 FrontSide / 组 1 叶卡 DoubleSide，叶卡固有
 *   attribute aLeafRand / aBend + 实例 aSeed；树皮组 aLeafRand 恒 0、aBend 恒 0。
 *
 * 叶（组 1）配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - SDF 卵状椭圆形包络：sin(π·v^0.90)——最宽点 v≈0.46（= 0.5^(1/0.9)），近中部微偏基
 *     （vs 朴树 v^0.76→0.40 偏基卵形、夏栎 v^1.4→0.61 倒卵形——三树包络三分化）——Spec §4
 *     「叶卵状椭圆形」+ 终审 leaf-a 判读「最宽中部」Verified [1][2][6]。长宽比 1.8–2.4 归
 *     几何侧（Spec §6/B leaf_aspect_ratio），SDF 只管包络。
 *   - 全缘（三树首个全缘叶种——身份核心）：**无齿载波通道、SDF 零噪声引用**——Spec §4
 *     「全缘，软骨质，有时微波状」Verified [1][2][6]。「微波状」记档不做：①Spec 主读向全缘
 *     （「有时」为次要变体）；②微波幅值在取证观距（100–130px 叶）为亚像素——朴树齿 0.030
 *     尚且仅 ±3px、微波须远低于该值，徒增 alpha 边噪声与成本；③纯净全缘边缘本身就是 vs
 *     朴树齿 / 夏栎锯齿的辨识差，不为「有时」的次要读向稀释主身份。红利：SDF 零噪声引用
 *     → 深度 pass 天然纯 ALU（影 pass 不吃噪声纪律的更优满足），High 叶片元噪声只剩叶团
 *     1 处（vs 朴树 2 处）。
 *   - 先端急尖 + 基部宽楔形至近圆形：包络指数沿 v 变化 mix(0.80, 1.10, ↑v)——基部 0.80
 *     宽楔收口（vs 朴树 0.70 圆钝：宽楔比圆钝略收），上半段 1.10 提速出尖（急尖 acute，
 *     略缓于朴树 1.15 的「急尖至短渐尖」上沿）；Spec §4 Verified [1][2][5]。沿朴树 mix 先例，
 *     纯 ALU 零分支。
 *   - 无基部偏斜项：Spec 无香樟叶基偏斜记载（「基部宽楔形至近圆形」对称读向 [1][2]）——
 *     中心线不漂移（vs 朴树 0.012 漂移——又一条与朴树的 SDF 分化点）。
 *   - 离基三出脉（身份核心，vs 朴树三出脉自叶基）：侧脉对轨迹 0.42·(v−0.10)^0.55·(1−0.52v)
 *     ——max(v−0.10, 0) 使侧脉对在**离基点 v=0.10**（中脉近基部上方）自中脉分离、斜展
 *     上行、先端前吻合渐隐（fade 0.80–0.92）；Spec §4「离基三出脉……一对粗侧脉自中脉近
 *     基部上方的离基点发出，斜展向先端方向」Verified [1][2][3][4][6]（照片双张「离基一对
 *     最强」+ 终审交叉「自中脉近基部斜出」）。中脉每侧另有侧脉 1–5 对弱读向（对比 0.16，
 *     门控 0.28 起——位于离基对上方，Spec §4「上部每边侧脉 1–3–5(–7) 条」[1][2]）。纯
 *     ALU 淡脉影零采样。
 *   - 脉腋腺窝 domatia（决定做）：叶背暗点对（|x|≈0.055、v≈0.15——离基侧脉与中脉交角
 *     腋窝处）×(0.70,0.74,0.66) 暗灰绿点，**仅背面**（gl_FrontFacing 门控）；Spec §4「侧脉
 *     及支脉脉腋上面明显隆起、下面有明显腺窝（窝内常被柔毛）」Verified [1][2][6]。成本
 *     1×length + smoothstep 纯 ALU（High 专属）——身份特征（§7 近景可辨维度）接受此账。
 *     **上面隆起不做**记档：隆起为弱浮雕读向、背面腺窝为强暗点读向，近景预算留给背面。
 *   - 两面区分（Spec §5「上面绿色或黄绿色、有光泽；下面黄绿色或灰绿色、晦暗带粉感
 *     （glaucous）」Verified [1][2][5][6]）：底色 #33612e 浓绿-深绿（工程设定——冠层照
 *     浓绿 75–85% 基调 + 叶照上面深绿交叉；较朴树 #5a8340 更深更冷：G−B 51 vs 67、相对
 *     亮度 ≈71%）；叶背 ×(1.06, 1.05, 1.16) 轻度提亮 + 去饱和 + 冷灰偏移（粉感 glaucous
 *     读向，幅度强于朴树 ×(1.02,1.00,1.10)——灰绿粉感更显著）；「晦暗」走糙度通道：
 *     背面 roughness +0.16 哑光差（vs 朴树 +0.12——革质两面差更大）。
 *   - 叶面光泽：革质 roughness 0.50（Spec §5「近革质至革质」+「上面……有光泽」Verified
 *     [1][2][5][6]——vs 朴树 0.72 半光泽；「亮于朴树」由 specular 承担：色更深 + 光泽更高
 *     = 革质亮叶读向）。Step 4b 校准记档（2026-09-20）：视觉三帧独立判读一致读作偏哑光、
 *     干燥感（革质光泽不足）→ 0.62→0.50；Spec §5 有光泽 Verified，vs 朴树 0.72 差距拉大
 *     到明确可辨一档。
 *   - 背光透射弱化：峰值 0.22 + 透射色 (0.46,0.84,0.36) 浓绿基调（vs 朴树 0.30 (0.58,0.90,
 *     0.38)——革质程度更高透光更弱；Spec §5 叶质 Verified + 朴树「厚纸质至近革质透光弱」
 *     读向沿用）；逐叶变奏 cmpTransVar ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand：色相两端冷深绿↔暖黄绿（FOC「绿或黄绿色」两端读向；通道摆幅
 *     ≤15% 纪律，幅度窄于朴树——常绿满密冠更均一，Spec §3/§5）+ 明度 ±8% 去相关（窄于
 *     朴树 ±10%）。
 *   - 冠内竖向自遮蔽（冠基 ≈2.6m——干高占比 0.30–0.35 × ≈8m Spec §3/§A Inferred [6]，
 *     区间取值工程设定）+ 中频叶团斑块（High，波长 ≈0.87m ≈ 团块 1/8–1/10 冠径 Spec §B）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent——实例化 + 深度
 *     排序灾难）；零贴图零 DataTexture（D13）。
 *   - 风动两层（GLSL 公式方法沿朴树，数值微调记档）：整树缓摆 ~0.18Hz / 顶部 ~4.5cm
 *     （aSeed 相位，hash 常数换 79.193——与朴树相位流去相关防同 seed 同步摆）+ 叶片快颤
 *     2.2–3.7Hz / ≤11mm（aBend 权重——长柄革质叶颤动自由度真实存在，Spec §2 叶柄 2–3cm
 *     明显长柄 Verified [1][2][6]）；树高锚 8m（×0.125——香樟目标 ≈8m，D19.7 同口径）。
 *
 * 皮（组 0）配方（vs 朴树平滑-浅裂小斑块、夏栎纵脊——三树皮语言三分化：**纵裂深沟**）：
 *   - 主调 #6e6352 黄褐-灰褐（工程设定——bark-a/b 脊面浅灰褐 / 沟底深褐近黑折中 + 文献
 *     「黄褐色」暖向；R−G=11 暖于朴树 6——黄褐读向；Spec §5 bark_color Verified [1][2][6]
 *     两读向并存如实取中）。
 *   - 脊宽沟深中-强浮雕（Spec §5 bark_archetype/bark_relief Verified [1][2][6]）：沟底
 *     0.50 + tri² 剖面（vs 朴树 0.76 浅裂、夏栎 0.44+tri³ 深沟——介于两者偏深，沟脊明暗
 *     对比显著强于朴树）+ 脊数 7（宽脊——vs 朴树 9 / 夏栎 14）+ 裂线游走更缓更直（warp
 *     0.75 × 低 v 频 1.1——**纵向连续长沟**读向，vs 朴树 1.1 × (2.4,1.8) 更游走）。
 *   - 局部横断成块状感（Spec §5「局部横向纹连接成块状感」四照一致 Verified [6]）：稀疏
 *     水平暗裂 sin(v·31.4 + warp·5) 峰带门控 × 块斑中带门控，横断处脊沟加深 22%（纯 ALU）；
 *     竖长块斑噪声 (10.0, 3.4)（u 密 v 疏——纵向长块）配色冷暖分层。
 *   - 干上部裂深弱化（smoothstep(1.2, 4.2)）：小枝圆柱形淡褐平滑读向（Spec §4 twig_surface
 *     Verified [1][2]）；弱化幅度小于朴树（樟纵裂中龄即充分发育、上干仍裂——Spec §5
 *     Inferred [6]：上部剖面 0.86+0.14·tri² vs 朴树 0.93+0.07），上部微提亮 ×1.04 +
 *     糙度回落（淡褐小枝微光读向）。
 *   - 苔藓少量**沟底**干下（Spec §5「苔藓/地衣少量，集中沟壑深处与树干下段」Verified
 *     [6]）：高度门控 (1.4, 3.2) + 噪声带 (0.60,0.84) + **沟底门控 (1−smoothstep(0.15,
 *     0.55,tri))**（vs 朴树无沟底门控——沟底集中是香樟特有读向）+ 方位门控；强度 0.50、
 *     灰绿 (0.80,0.95,0.66)。
 *   - 小枝语言：单皮组契约（恰 2 组冻结）枝干统一皮材质——「一年生枝淡褐 vs 老枝纵裂」
 *     分化记档为已知让步（朴树同项 #16 让步先例）。
 *   - 风动：整树缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用）。
 *
 * 深度材质（叶影裁切，customDepthMaterial 契约通道——沿朴树 §1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与叶表面
 *     材质共享同一 GLSL 字符串 CAMPHOR_LEAF_SDF（表面改叶形深度自动同步，不复制粘贴）。
 *   - **零噪声库注入**：SDF 全缘零噪声引用 → 深度片元不挂 FACILITY_GLSL_NOISE——影 pass
 *     不吃噪声纪律的更优满足（朴树齿抖动噪声随 SDF 单一来源进入 depth pass，香樟全缘先天
 *     免账）。保护性约束：SDF 字符串内不得引入 facVnoise——引入即深度材质编译暴雷（未
 *     声明函数），防复制粘贴漂移。
 *   - 多材质网格守卫：皮组以恒等 attribute（aLeafRand=0）走实心分支，防叶形 SDF 在圆柱
 *     uv 域上误裁出洞。
 *   - 档位坍缩记档：High SDF 本已零噪声全缘全形，「Low = Low SDF 零噪声版」沿朴树档位
 *     纪律**平凡成立**——三档深度共用同一 SDF 字符串（Low 叶表面差异全在片元主体：去叶
 *     团/叶脉/腺窝/透光）；customProgramCacheKey 三档仍分键（9 键契约），每实例只编译
 *     自身档位程序，无运行时浪费。
 *   - 风动不进 depth pass（静态影取舍已裁定，沿朴树）。
 *
 * 分档记档（T011.2，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去叶脉三件（中脉带/离基三出脉影/弱二级脉——Spec §7 叶脉与腺窝仅近距可辨，
 *     Mid 观距不可辨）+ 去脉腋腺窝 + 去中频叶团斑块；SDF 全形/透光/叶背/hue·luma/shade/
 *     两面糙度差保留（颜色层次档间连续保留面）。
 *   - 叶 Low：SDF 与 High 同一字符串（档位坍缩见上记档）；去叶脉/腺窝/叶团/透光（远距
 *     逆光透射不可辨）；hue·luma/shade/叶背保留。片元零噪声采样（Mid 亦零——全缘红利）。
 *   - 皮 Mid：去苔藓（中距不可辨）；脊沟/块斑/横断/干上部弱化保留。
 *   - 皮 Low：脊沟保留（裂线游走 vnoise + tri² 深沟剖面 + 高度门控 + 沟内冷灰 AO）；去块斑
 *     采样/横断/苔藓/上部提亮（块斑均值化常量乘子 vec3(0.985,0.95,0.915)——plate mix
 *     两端中点，值噪声均值 0.5 精确保均；横断均暗 ≈3% 记档为档间可忽略跳变）。
 *   - 深度：三档同一 SDF（见档位坍缩记档；表面/影裁切档内一致平凡成立）。
 *   - customProgramCacheKey 分档唯一（配方变即键变；camphor 前缀不与 celtis/tree3a 混缓存）：
 *     'camphor:leaf' / 'camphor:leaf:mid' / 'camphor:leaf:low'；'camphor:bark' /
 *     'camphor:bark:mid' / 'camphor:bark:low'；'camphor:leaf-depth' /
 *     'camphor:leaf-depth:mid' / 'camphor:leaf-depth:low'（9 键全异）。
 *   - 风动（CAMPHOR_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分
 *     （同公式同常数同 aBend 语义，D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿朴树记账体例）：
 *   - 叶 High 片元 = 1× vnoise（叶团斑块；全缘免齿抖动噪声）= 3× + SDF/离基脉三件/腺窝/
 *     两面/透光/hue·shade 纯 ALU ≈ 5×（离基轨迹 pow + 腺窝 length + 急尖变指数）≈ 8×
 *     （vs 朴树 11.5×——全缘红利 −3.5×）；
 *   - 叶 Mid 片元 = 0× 噪声（噪声库死码编译消除）+ 简化 ALU ≈ 3×；
 *   - 叶 Low 片元 = 0× 噪声 + 简化 ALU ≈ 2.5×；
 *   - 皮 High/Mid 片元 = 2× vnoise（裂线游走 + 块斑）= 6× + 横断 sin/门控/苔藓 smoothstep
 *     纯 ALU ≈ 1.5× ≈ 7.5×；
 *   - 皮 Low 片元 = 1× vnoise（裂线游走）= 3× + 脊沟 ALU ≈ 1× ≈ 4×；
 *   - 深度片元 = SDF 纯 ALU ≈ 1.5×，**零噪声采样**（全缘 SDF 先天满足影 pass 不吃噪声）；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环。
 *
 * uTime 接线（业界标准模式，沿朴树/tree3a）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与 celtis/tree3a 的
 *   通用段（风动公式等）为复制改造非 import（资产私有，跨资产不耦合——organization.md
 *   边界）。
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
  if (!source.includes(target)) throw new Error(`camphor 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，树皮恒 0 免颤）。
 * 公式方法沿朴树验收配方（频率/幅度/风标为逐树工程调参非物种事实）；数值微调记档：
 * hash 常数 79.193/49.337（与朴树相位流去相关）+ 树高锚 8m（×0.125——香樟目标 ≈8m，
 * D19.7）。
 */
const CAMPHOR_WIND = /* glsl */ `
// camphor wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float cmpWindPhase = fract(sin(aSeed * 79.193 + 2.61) * 43758.5453);
float cmpWindH = clamp(position.y * 0.125, 0.0, 1.0); // /8m 锚点树高（缩放抖动 ±16% 下权重近似）
float cmpSway = cmpWindH * cmpWindH * 0.045 * sin(uTime * 1.15 + cmpWindPhase * 6.28318 + cmpWindH * 1.4);
// 叶片快颤：ω = 14 + 9φ（2.2–3.7Hz），幅度 ≤11mm；权重 = aBend（卡根≈0 尖大）——长柄革质叶颤动自由度真实（叶柄 2–3cm）
float cmpFlutterPhase = fract(sin((aSeed + aLeafRand) * 49.337 + 3.9) * 43758.5453);
float cmpFlutter = aBend * 0.011 * sin(uTime * (14.0 + 9.0 * cmpFlutterPhase) + cmpFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (cmpSway + cmpFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(cmpSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * cmpFlutter * 0.9; // 叶面沿卡法线微扑（树皮 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——皮组 aLeafRand/aBend 恒 0 契约） */
const CAMPHOR_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 香樟叶形覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶尖 1）：
 * 卵状椭圆包络（v^0.90 预扭曲把 sin 峰推到 v≈0.46 叶长——近中部微偏基；vs 朴树 v^0.76→
 * 0.40 偏基卵形、夏栎 v^1.4→0.61 倒卵形。Spec §4「卵状椭圆形」+ 终审「最宽中部」Verified
 * [1][2][6]）× 变指数收口（基部 0.80 宽楔、上半段 1.10 急尖——Spec §4「先端急尖、基部宽
 * 楔形至近圆形」Verified [1][2][5]）× **全缘零扰动**（三树首个全缘叶种——无齿载波无噪声，
 * 「有时微波状」记档不做，见模块头；cmpRand 保留双参签名沿家族契约、全缘不用）；
 * 返回近似符号距离的覆盖率坡（edge/0.04——alphaToCoverage 的 fwidth smoothstep 吃这条坡
 * 抗锯边；坡宽 0.04 沿朴树 Step 4 口径）。**本函数零 facVnoise 引用是深度材质不挂噪声库的
 * 前提（引入即深度编译暴雷——保护性约束）**。
 */
const CAMPHOR_LEAF_SDF = /* glsl */ `
float cmpLeafAlpha(vec2 cmpUv, float cmpRand) {
  vec2 cmpP = vec2(cmpUv.x - 0.5, cmpUv.y);
  float cmpEnvSin = sin(3.14159 * pow(clamp(cmpP.y, 0.001, 0.999), 0.90)); // v^0.90：最宽点 v≈0.46（卵状椭圆近中部微偏基）
  float cmpEnv = pow(cmpEnvSin, mix(0.80, 1.10, smoothstep(0.45, 0.95, cmpP.y))); // 基部宽楔 0.80 → 先端急尖 1.10（全缘——无齿附加项）
  float cmpEdge = 0.5 * cmpEnv - abs(cmpP.x);
  return clamp(cmpEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.04（沿朴树 Step 4 AA 口径）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿朴树体例）：High =
 *  HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；Mid/Low = HEAD + SHADE + MUL_SIMPLE +
 *  BACK（去叶团/叶脉三件/腺窝——叶团乘子 0.94+0.12×cmpClump 均值化 = 1.0 消去，值噪声
 *  均值 0.5 精确保均）。 */
const CAMPHOR_LEAF_HEAD = /* glsl */ `
// camphor:leaf —— SDF 卵状椭圆全缘叶覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float cmpAlpha = cmpLeafAlpha(vUv, vLeafRand);
diffuseColor.a = cmpAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷深绿 ↔ 暖黄绿——FOC「绿或黄绿色」两端；通道摆幅 ≤15% 纪律，
// 幅度窄于朴树——常绿满密冠更均一）+ 明度 ±8%（去相关取样）
vec3 cmpHue = mix(vec3(0.94, 1.00, 1.04), vec3(1.06, 1.03, 0.90), fract(vLeafRand * 4.723 + 0.31));
float cmpLuma = 0.92 + 0.16 * fract(vLeafRand * 3.511 + 0.53);`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const CAMPHOR_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ≈0.87m ≈ 团块 1/8–1/10 冠径 Spec §B；采样偏移与朴树去相关）
float cmpClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 1.15 + vec2(11.9, 5.3));`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const CAMPHOR_LEAF_SHADE = /* glsl */ `
float cmpShade = clamp((vTreePos.y - 2.6) / 3.0, 0.0, 1.0); // 冠基 ≈2.6m（干高占比 0.30–0.35 × ≈8m，Spec §3/§A Inferred [6]；区间取值工程设定）`;

/** High 专属：叶脉三件（中脉亮带 / 离基三出脉侧脉对 / 弱二级脉）+ 脉腋腺窝因子，纯 ALU 零采样 */
const CAMPHOR_LEAF_VEIN = /* glsl */ `
// 叶脉：中脉亮带 + 离基三出脉侧脉对（自中脉近基部上方离基点 v=0.10 分离、斜展上行、先端前
// 吻合渐隐——Spec §4 离基三出脉 Verified [1][2][3][4][6]，照片「离基一对最强」双张 + 终审交叉）
// + 弱二级脉（中脉每侧 1–5 对弱读向——Spec §4「上部每边侧脉 1–3–5(–7) 条」[1][2]，门控 0.28 起
// 位于离基对上方）；浅黄绿脉色（脉比叶肉亮，可见度按朴树 Step 4b sRGB 编码压缩教训定标）；
// 纯 ALU 零采样。脉腋腺窝因子 cmpDomatia 在 MUL_HIGH 仅背面应用
vec2 cmpP = vec2(vUv.x - 0.5, vUv.y);
float cmpVeinMid = 1.0 - smoothstep(0.012, 0.040, abs(cmpP.x)); // 中脉带（平顶加宽——朴树 Step 4b 口径）
float cmpTriPath = 0.42 * pow(max(cmpP.y - 0.10, 0.0), 0.55) * (1.0 - 0.52 * cmpP.y); // 离基侧脉轨迹：v≤0.10 贴中脉，离基点分离后斜展、先端前内收吻合
float cmpVeinTri = (1.0 - cmpVeinMid)
  * (1.0 - smoothstep(0.012, 0.046, abs(abs(cmpP.x) - cmpTriPath))) // 两侧对称一对（±|x| 距离场）
  * smoothstep(0.06, 0.14, cmpP.y) * (1.0 - smoothstep(0.80, 0.92, cmpP.y)); // 离基点渐显、先端前吻合渐隐
float cmpVeinLat = pow(max(0.0, sin(cmpP.y * 20.0 - abs(cmpP.x) * 26.0 + (vLeafRand - 0.5) * 0.6)), 6.0)
  * (1.0 - cmpVeinMid) * smoothstep(0.28, 0.42, cmpP.y) * (1.0 - smoothstep(0.72, 0.90, cmpP.y));
// 脉腋腺窝（domatia，决定做）：叶背点状暗窝——离基侧脉与中脉交角腋窝处（v≈0.15、|x|≈0.055）
// 椭圆暗点（Spec §4「下面有明显腺窝」Verified [1][2][6]；仅背面应用见 MUL_HIGH——上面隆起不做记档）
float cmpDomatia = 1.0 - smoothstep(0.012, 0.042, length(vec2(abs(cmpP.x) - 0.055, (cmpP.y - 0.15) * 0.80)));`;

/** High 专属：合成（叶团乘子 + 脉三件调制 + 腺窝背面暗点） */
const CAMPHOR_LEAF_MUL_HIGH = /* glsl */ `
vec3 cmpMul = cmpHue * cmpLuma * (0.80 + 0.20 * cmpShade) * (0.94 + 0.12 * cmpClump); // shade 地板 0.80（沿朴树 Step 4 宏距暗叶可读性口径）
cmpMul = mix(cmpMul, cmpMul * vec3(1.58, 1.36, 1.02), cmpVeinMid * 1.00 + cmpVeinTri * 0.78 + cmpVeinLat * 0.16); // 离基三出脉为身份核心权重 0.78（≥朴树 0.75）；二级脉 0.16 守背景弱层
cmpMul *= mix(vec3(1.0), vec3(0.70, 0.74, 0.66), cmpDomatia * (1.0 - float(gl_FrontFacing))); // 腺窝暗灰绿点仅叶背（gl_FrontFacing 门控）
diffuseColor.rgb *= cmpMul;`;

/** Mid/Low：合成（去叶团/叶脉/腺窝项——叶团乘子均值化消去，值噪声均值 0.5 精确保均） */
const CAMPHOR_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 cmpMul = cmpHue * cmpLuma * (0.80 + 0.20 * cmpShade); // Mid/Low：叶团乘子均值化消去（T011.2）
diffuseColor.rgb *= cmpMul;`;

/** 叶背灰绿粉感 glaucous（三档共用，纯 ALU 零采样零分支） */
const CAMPHOR_LEAF_BACK = /* glsl */ `
// 叶背灰绿粉感晦暗（Spec §5 Verified [1][2][5][6]：上面有光泽 / 下面灰绿色 glaucous 晦暗）：
// gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，背面法线由 three 双面光照自动
// 翻转，此处只调固有色）——背面轻度提亮 + 去饱和 + 冷灰偏移（R/G 靠拢、B 相对抬升 = 粉感
// 灰绿读向），幅度强于朴树 ×(1.02,1.00,1.10)——glaucous 更显著；「晦暗」走糙度通道（背面
// +0.16 哑光差，见 roughnessmap 注入——革质两面差大于朴树 +0.12）；纯 ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.06, 1.05, 1.16), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  弱化版：革质透光弱（Spec §5「近革质至革质」Verified——透光弱于朴树厚纸质至近革质）。 */
const CAMPHOR_LEAF_TRANSLUCENCY = /* glsl */ `
// camphor:leaf —— 背光透射（弱）：视线与阳光反向时叶背透浓绿（叶绿素吸收红蓝 → 透射偏黄绿；
// 革质叶透光更弱——峰值 0.22 vs 朴树 0.30 / 夏栎 0.65，Spec §5）
#if NUM_DIR_LIGHTS > 0
  float cmpBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float cmpTransVar = 0.55 + 0.45 * fract(vLeafRand * 8.317 + 0.37); // 逐叶透光强度变奏
  outgoingLight += vec3(0.46, 0.84, 0.36) * directionalLights[0].color
    * pow(cmpBack, 3.0) * cmpTransVar * cmpAlpha * 0.22;
#endif
`;

/** 树皮配方主体（<map_fragment> 后注入；uv 域 u=环绕一周 v=累计弧长 ×0.5 + 位置域门控）。
 *  分段拼装（沿朴树体例）：High = HEAD + RIDGE + PLATE + MOSS + MUL；Mid = HEAD_MID +
 *  RIDGE + PLATE + MUL_MID（去苔藓——中距不可辨）；Low = HEAD_LOW + RIDGE + MUL_LOW
 *  （脊沟保留；去块斑采样/横断/苔藓/上部提亮——块斑均值化常量乘子）。 */
const CAMPHOR_BARK_HEAD = /* glsl */ `
// camphor:bark —— 纵裂深沟（脊宽沟深中-强浮雕）+ 局部横断块状感 + 干上部弱化 + 沟底苔藓（vs 朴树平滑-浅裂小斑块 / 夏栎纵脊三分化）`;

/** Mid 档头注释（内容面与 High 的差仅记档一行） */
const CAMPHOR_BARK_HEAD_MID = /* glsl */ `
// camphor:bark:mid —— 纵裂深沟 + 局部横断块状感 + 干上部弱化（T011.2 Mid：去苔藓——中距不可辨）`;

/** Low 档头注释 */
const CAMPHOR_BARK_HEAD_LOW = /* glsl */ `
// camphor:bark:low —— 纵裂脊沟（T011.2 Low：裂线游走 + tri² 深沟剖面 + 高度门控 + 沟内冷灰 AO 保留；块斑/横断/苔藓/上部提亮去采样）`;

/** 脊-沟核心（三档共用——Low 保留面的唯一采样：裂线游走 vnoise；高度门控为结构剪影项三档保留） */
const CAMPHOR_BARK_RIDGE = /* glsl */ `
float cmpBarkWarp = facVnoise(vec2(vUv.x * 2.2, vUv.y * 1.1) + vec2(9.1, 3.7)); // 裂线游走（低频缓走——纵向连续长沟读向，vs 朴树 (2.4,1.8) 更游走）
float cmpBarkTri = abs(fract(vUv.x * 7.0 + cmpBarkWarp * 0.75) * 2.0 - 1.0); // 整数脊数 → u 缝相位连续（7 宽脊——vs 朴树 9 / 夏栎 14）
// 干上部裂深弱化（Spec §4 小枝圆柱形淡褐平滑 Verified [1][2]；弱化小于朴树——樟纵裂中龄即充分发育 Spec §5 [6]）
float cmpBarkSmooth = smoothstep(1.2, 4.2, vTreePos.y);
// 深沟：沟底 0.50 + tri² 剖面（脊宽沟深中-强浮雕 Spec bark_relief Verified [6]——对比显著强于朴树 0.76 浅裂、缓于夏栎 0.44 深沟）
float cmpBarkRidge = mix(0.50 + 0.50 * cmpBarkTri * cmpBarkTri, 0.86 + 0.14 * cmpBarkTri * cmpBarkTri, cmpBarkSmooth);`;

/** High/Mid：竖长块斑（1× vnoise——Low 去采样）+ 局部横断（纯 ALU sin） */
const CAMPHOR_BARK_PLATE = /* glsl */ `
float cmpBarkBlock = facVnoise(vec2(vUv.x * 10.0, vUv.y * 3.4) + vec2(13.3, 7.1)); // 竖长块斑（u 密 v 疏——纵向长块读向）
float cmpBarkCut = smoothstep(0.72, 0.94, sin(vUv.y * 31.4 + cmpBarkWarp * 5.0) * 0.5 + 0.5)
  * smoothstep(0.35, 0.65, cmpBarkBlock); // 局部横断：稀疏水平暗裂（游走调制去规则感）× 块斑中带门控
cmpBarkRidge *= 1.0 - cmpBarkCut * 0.22; // 横断处脊沟加深——纵长沟被切分成块状感（Spec §5「局部横向纹连接成块状感」四照一致 Verified [6]）`;

/** High 专属：苔藓（少量集中**沟底**干下——竖向门控 × 收紧噪声高带 × 沟底门控 × 方位门控） */
const CAMPHOR_BARK_MOSS = /* glsl */ `
// 苔藓少量集中沟底干下（Spec §5「苔藓/地衣少量，集中沟壑深处与树干下段」Verified [6]）——
// 沟底门控 (1−smoothstep(0.15,0.55,tri)) 为香樟特有（朴树无此通道：沟深苔藓才藏得住）
float cmpBarkMoss = (1.0 - smoothstep(1.4, 3.2, vTreePos.y))
  * smoothstep(0.60, 0.84, cmpBarkWarp * 0.55 + cmpBarkBlock * 0.60)
  * (1.0 - smoothstep(0.15, 0.55, cmpBarkTri)) // 沟底集中
  * smoothstep(-0.15, 0.75, sin(vUv.x * 6.28318 + 2.3)); // 方位门控（一侧集中一侧干净）`;

/** High：合成（块斑冷暖 + 沟内深冷 AO + 上部微提亮 + 苔藓） */
const CAMPHOR_BARK_MUL = /* glsl */ `
vec3 cmpBarkMul = cmpBarkRidge
  * mix(vec3(0.89, 0.885, 0.93), vec3(1.08, 1.02, 0.90), cmpBarkBlock); // 竖长块斑冷暖（暖块黄褐向 / 冷块灰褐向）
cmpBarkMul *= mix(vec3(0.84, 0.82, 0.90), vec3(1.06, 1.01, 0.90), smoothstep(0.20, 0.78, cmpBarkTri)); // 沟内深冷灰 AO（沟底深褐近黑——沟脊对比显著强于朴树）
cmpBarkMul *= 1.0 + 0.04 * cmpBarkSmooth; // 干上部微提亮（小枝淡褐读向；幅度小于朴树 0.07）
cmpBarkMul = mix(cmpBarkMul, cmpBarkMul * vec3(0.80, 0.95, 0.66), cmpBarkMoss * 0.50); // 少量灰绿苔藓沟底（强度低于朴树 0.55）
diffuseColor.rgb *= cmpBarkMul;
`;

/** Mid：合成（去苔藓；块斑/沟内 AO/上部微提亮保留） */
const CAMPHOR_BARK_MUL_MID = /* glsl */ `
vec3 cmpBarkMul = cmpBarkRidge
  * mix(vec3(0.89, 0.885, 0.93), vec3(1.08, 1.02, 0.90), cmpBarkBlock);
cmpBarkMul *= mix(vec3(0.84, 0.82, 0.90), vec3(1.06, 1.01, 0.90), smoothstep(0.20, 0.78, cmpBarkTri)); // 沟内深冷灰 AO
cmpBarkMul *= 1.0 + 0.04 * cmpBarkSmooth; // 干上部微提亮
diffuseColor.rgb *= cmpBarkMul;
`;

/** Low：合成（块斑均值化常量乘子 = plate mix 两端中点（值噪声均值 0.5 精确保均）；脊沟读向不破） */
const CAMPHOR_BARK_MUL_LOW = /* glsl */ `
vec3 cmpBarkMul = cmpBarkRidge * vec3(0.985, 0.95, 0.915); // 块斑均值化常量乘子（T011.2 Low；横断均暗 ≈3% 档间跳变记档可忽略）
cmpBarkMul *= mix(vec3(0.84, 0.82, 0.90), vec3(1.06, 1.01, 0.90), smoothstep(0.20, 0.78, cmpBarkTri)); // 沟内深冷灰 AO
diffuseColor.rgb *= cmpBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 卵状椭圆全缘叶 alphaTest 裁切 + 离基三出脉/腺窝（High）+ 两面区分
 * + 弱透光 + 逐叶变奏 + 风动。level 分档（T011.2，缺省 'high'）：Mid 去叶脉三件 + 腺窝 +
 * 叶团斑块（Spec §7 叶脉与腺窝仅近距可辨），SDF 全形/透光/叶背/hue·luma/shade/两面糙度差
 * 保留；Low 同 Mid 体再去透光（远距逆光透射不可辨），SDF 与 High 同一字符串（档位坍缩——
 * High SDF 本已零噪声全缘全形，「Low = 零噪声版」平凡成立，见模块头记档）。风动三档同源
 * 不动（CAMPHOR_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：浓绿-深绿 #33612e（工程设定——冠层照浓绿基调 + 叶照上面深绿交叉；Spec §5 冠层
 * 色域 Verified [5][6]）/ m 0 / r 0.50（革质光泽——Spec §5「近革质至革质」Verified
 * [1][2][5][6]，vs 朴树 0.72；Step 4b 校准 0.62→0.50 见模块头记档）/ DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createCamphorLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x33612e, // 浓绿-深绿（工程设定：冠层照 + 叶照上面交叉标定——较朴树更深更冷；Spec §5 Verified [5][6]）
    metalness: 0,
    roughness: 0.50, // 革质亮泽（Spec §5「近革质至革质」+「有光泽」Verified；vs 朴树 0.72 半光泽——亮于朴树由 specular 承担；Step 4b 0.62→0.50 校准，见模块头记档）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafBody = level === 'high'
    ? CAMPHOR_LEAF_HEAD + CAMPHOR_LEAF_CLUMP + CAMPHOR_LEAF_SHADE + CAMPHOR_LEAF_VEIN + CAMPHOR_LEAF_MUL_HIGH + CAMPHOR_LEAF_BACK
    : CAMPHOR_LEAF_HEAD + CAMPHOR_LEAF_SHADE + CAMPHOR_LEAF_MUL_SIMPLE + CAMPHOR_LEAF_BACK; // Mid/Low 同体（档差全在段取舍——SDF 三档同一字符串）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (cmpClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.16, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.16, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面光泽差保留——叶背晦暗哑光）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CAMPHOR_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${CAMPHOR_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${CAMPHOR_LEAF_SDF}`,
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
        `${CAMPHOR_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `camphor:leaf${levelKeySuffix(level)}`;
  return material;
}

/**
 * 树皮材质（组 0）：纵裂深沟（脊宽沟深）+ 局部横断块状感 + 干上部弱化 + 沟底苔藓 +
 * 整树缓摆（与叶同公式同相位；aBend 恒 0 快颤层天然不作用）。level 分档（T011.2，缺省
 * 'high'）：Mid 去苔藓（脊沟/块斑/横断/干上部弱化保留）；Low 脊沟保留（裂线游走 vnoise +
 * tri² 深沟剖面 + 高度门控 + 沟内冷灰 AO），去块斑噪声采样/横断/苔藓/上部提亮（块斑均值化
 * 常量乘子——脊沟读向不破）。风动三档同源不动。
 * 底参：黄褐-灰褐主调 #6e6352（工程设定——bark-a/b 脊面浅灰褐/沟底深褐折中 + 文献黄褐暖向；
 * Spec §5 bark_color Verified [1][2][6] 两读向取中）/ m 0 / r 0.93（高糙哑光）/ FrontSide。
 */
export function createCamphorBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x6e6352, // 黄褐-灰褐主调（工程设定：文献黄褐 + 照片灰褐两读向折中；Spec §5 Verified [1][2][6])
    metalness: 0,
    roughness: 0.93,
    side: THREE.FrontSide,
  });
  material.defines = { USE_UV: '' }; // 裂沟/块斑域 = 圆柱 uv（u=环绕一周、v=累计弧长）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? CAMPHOR_BARK_HEAD + CAMPHOR_BARK_RIDGE + CAMPHOR_BARK_PLATE + CAMPHOR_BARK_MOSS + CAMPHOR_BARK_MUL
    : level === 'mid'
      ? CAMPHOR_BARK_HEAD_MID + CAMPHOR_BARK_RIDGE + CAMPHOR_BARK_PLATE + CAMPHOR_BARK_MUL_MID
      : CAMPHOR_BARK_HEAD_LOW + CAMPHOR_BARK_RIDGE + CAMPHOR_BARK_MUL_LOW;
  const barkRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (cmpBarkBlock - 0.5) * 0.04 + cmpBarkMoss * 0.03 - cmpBarkTri * cmpBarkTri * 0.05 - cmpBarkSmooth * 0.05, 0.05, 1.0); // 脊面/干上部微光滑（淡褐小枝微光）+ 苔藓微糙'
    : level === 'mid'
      ? 'roughnessFactor = clamp(roughnessFactor + (cmpBarkBlock - 0.5) * 0.04 - cmpBarkTri * cmpBarkTri * 0.05 - cmpBarkSmooth * 0.05, 0.05, 1.0); // Mid：去苔藓糙度项（脊面/上部光滑保留）'
      : 'roughnessFactor = clamp(roughnessFactor - cmpBarkTri * cmpBarkTri * 0.05, 0.05, 1.0); // Low：脊面微光滑保留（块斑/苔藓/上部项去）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CAMPHOR_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${CAMPHOR_WIND}`,
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
  material.customProgramCacheKey = () => `camphor:bark${levelKeySuffix(level)}`;
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（档位坍缩——High SDF 本已零噪声全缘全形，三档共用同一 SDF 字符串，「Low =
 * 零噪声版」沿朴树档位纪律平凡成立，见模块头记档；customProgramCacheKey 三档仍分键守
 * 9 键契约）。**深度片元不挂噪声库**——SDF 零 facVnoise 引用（影 pass 不吃噪声纪律的更优
 * 满足；SDF 内引入噪声即编译暴雷——保护性约束）。
 * 树皮组守卫：aLeafRand=0（树皮恒 0）→ alpha=1 实心——多材质网格共用本深度材质时皮组
 * 不被叶形 SDF 误裁。风动位移不进 depth pass（静态影取舍，沿朴树）；影 pass 侧向由
 * shadowMap 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap
 * 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createCamphorLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
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
${CAMPHOR_LEAF_SDF}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, cmpLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 皮组 aLeafRand=0 → 实心`,
    );
  };
  material.customProgramCacheKey = () => `camphor:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
