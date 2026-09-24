/**
 * runtime/procedural/tree/tree3a/tree3aMaterials —— 夏栎（asset_tree_3a）叶/树皮 3A 材质 + 风动（T008.3）。
 *
 * 职责：冻结几何契约（008.2）双材质组的 onBeforeCompile 注入工厂（L2，沿 plantMaterials
 *   范式全套纪律：replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk
 *   原句保留后追加 / <color_fragment> 绝不触碰——instanceColor 逐实例色相乘算链安全，
 *   注入乘法与 vColor 乘法交换律安全）：
 *   - 叶（组 1）：SDF 程序化橡树叶形 alpha（uv 域 0–1 四边形，零贴图 D13）——倒卵形包络
 *     （T009.2：v^1.4 预扭曲，最宽点 ≈61% 叶长）+ 5 对圆裂（cos 波内切）+ 基部耳形
 *     （v∈[0,0.15] sin 钟形外扩）+ 叶缘锯齿（齿载波+噪声合成 ±0.022 半宽）+ 中脉/沟侧翼/
 *     侧脉明暗（纯 ALU）+ 叶背粉绿（gl_FrontFacing 双面区分）；
 *     裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent——实例化 +
 *     深度排序灾难）；背光透射项（太阳在冠后时叶背透暖绿——近观层级感）；逐叶 aLeafRand
 *     变奏（色相通道摆幅 ≤15% 纪律内）+ 冠内竖向自遮蔽梯度 + 中频叶团斑块（位置域）。
 *   - 皮（组 0）：脊-沟-板结构语言（整数脊数纵向沟脊 + 立方三角剖面沟底 AO + 低频游走 +
 *     各向异性竖长板块斑驳）新调参针对真实锥度管几何，另加节疤（低频噪声高带——同噪两用
 *     零额外采样，暗斑 + 愈伤环 + 脊线局部压平 + 粗糙上翘）与苔痕（冠下竖向门控 × 双噪声
 *     高带 × 方位门控，乘性偏绿）。
 *   - 风动（D19.7 分工语义：uTime = 全局风刮到哪一帧，aSeed = 每棵树各吹各的）：两材质
 *     共用同一公式同一常数（皮不动叶动会撕裂穿帮）——整树缓摆 ~0.18Hz / 顶部 ~4.5cm，
 *     权重 = 归一物体高度²（干基钉地）、相位 = hash(aSeed)；叶片快颤 2.2–3.7Hz / ≤11mm，
 *     权重 = aBend（卡根≈0 尖大；树皮组 aBend 恒 0 天然免颤）、相位 = hash(aSeed+aLeafRand)。
 *     位移在 <begin_vertex> 后作用于 transformed（物体空间，实例矩阵带着转——实例旋转
 *     相位随机化后读作阵风差异，最便宜方案；不整段替换 project_vertex）。
 * uTime 接线（业界标准模式）：材质级 material.uniforms.uTime（TimeUniformService 的扫描
 *   面——服务只认材质对象上的 uniforms 属性）与 onBeforeCompile 里 shader.uniforms.uTime
 *   挂同一对象引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 * 深度材质（叶影裁切）：createTree3aLeafDepthMaterial() = MeshDepthMaterial + 同一 SDF
 *   alpha 函数（单一来源字符串，表面/深度不复制粘贴）+ 树皮组守卫（aLeafRand=0 → 实心，
 *   否则多材质网格的皮组会被叶形 SDF 在圆柱 uv 域上误裁出洞）。**通道记档（T009.5
 *   契约立契）**：InstanceSource 契约已含 customDepthMaterial——夏栎 build 返回本工厂
 *   产物（档位匹配），产品路径 InstancedAssetPool 桶网格/单例网格/诊断亮网格三创建点
 *   挂载（池路径桶网格自 2026-09-18 起统一 castShadow/receiveShadow=true），DEV 舞台
 *   （tree3aStage）消费同源 source.customDepthMaterial（fake build 注入不带字段时
 *   回退自建）——DEV 出图面 = 正式场景，影 pass 均为 SDF 裁切影。风动位移不进 depth
 *   pass（静态影，摆幅 cm 级 + 影贴图 ~16cm/_texel 下不可辨，已知取舍维持）。
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径；模块头记账；Mid/Low 档
 *   记账行见下方 T009.6 分档记档）：
 *   - 叶片元 = 6× 噪声（叶缘锯齿 1× vnoise + 叶团斑块 1× vnoise）+ SDF/叶脉/透光/叶背
 *     粉绿纯 ALU（sin/cos/smoothstep 折算 ≈ 4.5×——R1 加齿载波与脉侧翼，T009.2 加倒卵
 *     形预扭曲 pow、耳形 sin、叶背粉绿 mix 三项纯 ALU，零新采样）≈ 10.5× 压线预算（再增先降载）；
 *   - 皮片元 = 2× vnoise = 6× + 脊沟强化/愈伤环/苔痕门控 smoothstep 纯 ALU ≈ 1.5× ≈ 7.5×
 *     （节疤/苔痕为既有噪声高带/门控复用，零额外采样）；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环；深度片元 = SDF 纯 ALU（影 pass 不吃噪声）。
 * **2026-09-18 锚点门第 1 轮微调记档（用户裁定四项，近观 8m「可感知但不夸张」）**：
 *   1) 树皮沟壑加深：脊剖面 0.55+0.45·tri² → 0.44+0.56·tri³（沟底均值 0.70→0.58、暗端
 *      0.46→0.33）+ 沟内 AO 式冷灰压暗/脊顶微暖（smoothstep(0.08,0.72,tri) 双端 mix）+
 *      脊顶糙度 −0.10（掠射高光骑脊 → 深度线索）。未做切线空间法线扰动——管状几何 TBN
 *      近似跨干/枝姿态不可靠，脊对比走反照率+粗糙度通道（零新 varying 零新采样）。
 *   2) 节疤/苔痕：节疤核带 0.66–0.84 → 0.72–0.84 收紧 + darkening 0.28→0.42 + 新增愈伤环
 *      t3aBarkRim（核外亮带 +0.14，同场 smoothstep 复用零采样）+ 粗糙上翘 0.06→0.09；
 *      苔痕方位 0.55+0.45·sin → smoothstep(−0.15,0.75,·)（一侧干净一侧集中）、强度
 *      0.75→0.82、绿偏移 (0.82,0.98,0.62)→(0.80,0.99,0.58)。
 *   3) 叶形细节：锯齿 ±0.015 纯噪声 → ±0.022 齿载波 pow³(0.5+0.5·cos)·0.7 + 噪声·0.3
 *      合成 ×taper 两端全缘（齿形可辨、噪声频率 42 不升——alphaTest 0.5 下升频会裁切闪烁，
 *      振幅 ≤ 覆盖率坡宽 0.03 的 75% 保证齿沿干净穿越 0 等值线）；中脉带 0.006–0.018 →
 *      0.008–0.024、对比 0.45→0.58、脉色 (1.24,1.15,0.72)→(1.28,1.17,0.68)，新增中脉沟
 *      侧翼压暗 −0.07（限中段）；侧脉 pow 8→7、对比 0.35→0.42。SDF 单一来源，深度材质
 *      影裁切齿形自动同步。
 *   4) 透光：峰值系数 0.45→0.65（区间 0.6–0.75 取中偏低）——透射色 (0.62,0.94,0.34) 绿分量
 *      最先触顶、红蓝余量大 → 冠缘读作暖绿而非泛白；NoToneMapping 白化风险有界，
 *      t3aTransVar∈[0.45,1.0] 逐叶变奏压住均值叶不过曝。
 * **T009.2 叶形 SDF 重构 + 叶背粉绿记档（Spec docs/research/tree3a-reference.md 1.0，
 *   附录 #13/#14 偏差收敛；卡长宽比域 1.6–2.7（典型 ≈2）下适配——Step 1 几何重构后）**：
 *   1) 倒卵形包络：sin(π·v)^0.75 → sin(π·v^1.4)^0.75——最宽点 v=0.50 → ≈0.61 叶长（自
 *      基部计，= 0.5^(1/1.4)；任务域 60–65%），基部爬升变缓收窄、顶端下降变陡钝圆收口
 *      （Spec「长倒卵形至椭圆形、顶端圆钝」Verified [1][2][5]）；两端仍收零（v=0 贴枝
 *      /v=1 闭合），指数 0.75 圆钝度维持；
 *   2) 裂对数 4 → 5（25.13 → 31.42 = 2π·5；Spec 域 4–7 取中典型；新卡长 ≈0.13–0.35m
 *      （≈真叶 2×）下 5 对 ≈4.6cm/对，匹配真叶换算域 2.8–5cm/对；逐叶相位错开保持）；
 *   3) 基部耳形 t3aEar：v∈[0,0.15] sin 钟形两侧外扩、峰值 v≈0.075、振幅 0.02（u 域归一，
 *      ≈2mm@0.1m 宽卡/侧——真叶耳 mm 级；≤ 覆盖率坡宽 0.03 的 75% 裁切闪烁纪律，梯度
 *      ≈0.42/v 与齿载波同量级有界无高频），v=0 仍收零——中脉收口两侧读作一对「耳」
 *      （Spec「基部耳形、叶柄极短 2–5mm」Verified [1][2][5]）；纯 ALU 零采样；
 *   4) 齿载波维持 6 齿（37.7）/锯齿噪声频率 42 不升（锚点门 R1 纪律）：新卡长中位较旧仅
 *      +15%，6 齿齿距 ≈33–38mm 读作裂缘圆钝细齿密度仍合；升齿数会推高边缘梯度逼近
 *      alphaTest 0.5 裁切闪烁红线；裂:齿 = 5:6 近频拍自然产生裂幅「深浅不等」的逐叶变化
 *      （Spec「深浅不等的圆钝锯齿」Verified [1]）——维持即最优解；
 *   5) 叶背粉绿：gl_FrontFacing 区分背面（WebGL2 内建 bool；DoubleSide 双面片元，背面
 *      法线由 three 双面光照翻转），背面 diffuseColor ×(0.94,1.05,1.16)（底色 #4e7c33 上
 *      亮度 +3%/饱和度 −6%/冷绿偏移 R:B 1.53→1.29——FRPS「叶背粉绿色」Verified [1][2]，
 *      幅度克制读得出不跳色）；mix 线性混合零分支零采样；不触碰 <color_fragment>/vColor；
 *      透射项暖绿（背光透射语义）不动。
 * **T009.4 树皮底色灰度校正记档（Spec docs/research/tree3a-reference.md 1.0，bark_color
 *   Verified [6] / 附录 #15：灰褐色、灰为主调、受光局部偏暖褐；2026-09-18）**：底色
 *   暖灰褐 #63513f → 灰主调灰褐 #5c534a（等亮度去饱和 k=0.5，只动 color 一值、GLSL 配方
 *   零改动）：R−G 18→9 / R−B 36→18（暖差减半，R≈G 微暖保留）、饱和度 0.364→0.196
 *   （参考照 ref-oak-bark-a 一般表面中带 0.152 对照）、相对亮度 0.0890→0.0896（+0.7%，
 *   整树明度无跳变）。乘性调制下灰底不改变色相方向且读感更准：苔痕绿偏移读作灰绿苔
 *   （苔区 R−G +10→+1，旧底偏橄榄褐）、沟内冷灰 AO 压暖更有效（沟 R−B +20→+8 读冷灰）、
 *   脊顶受光仍暖褐（R−G +13，Spec「受光局部偏暖褐」维持）。
 * **T009.6 Shader 档位分档记档（三工厂可选 level 参数，缺省 'high' 现行为不变；档位
 *   配套传参归 asset build 路由，几何档见 ./tree3aGeometry lodPlanFor）**：
 *   - 叶 Mid：片元降复杂度——去叶脉三线（中脉亮带/沟侧翼/侧脉）+ 去中频叶团斑块
 *     （t3aClump vnoise）；保留 SDF 完整叶形（倒卵形+裂+耳+齿）/透光/叶背粉绿/hue·luma
 *     逐叶变奏/冠内竖向自遮蔽（颜色层次档间连续的保留面）；
 *   - 叶 Low：SDF 简化——倒卵形包络 + 5 对圆裂（去齿载波/锯齿噪声/基部耳形——片元
 *     零噪声采样）、去叶脉/叶团、去透光项（远距逆光透射不可辨）；保留 hue·luma/shade/
 *     叶背（颜色层次保留面）；
 *   - 皮 Mid：去节疤（核带 + 愈伤环 ALU；中距不可辨）；脊沟/板块/苔痕保留；
 *   - 皮 Low：脊沟保留（脊线游走 vnoise + tri³ 剖面 + 沟内冷灰 AO）；去板块噪声采样/
 *     节疤/苔痕（板块斑驳均值化为常量乘子——脊沟读向不破）；
 *   - 深度材质（叶影裁切，DEV 舞台）：SDF 单一来源原则分档延续——Mid 深度 = High SDF
 *     （Mid 表面 SDF 与 High 同源全形）；Low 深度 = Low SDF（表面/影裁切叶形档内一致）；
 *   - **customProgramCacheKey 分档唯一**（配方变即键变——配方变键不变共享 program 是
 *     纪律违约）：叶 'tree3a:leaf'（High 沿用原键，零既有消费者破坏）/ 'tree3a:leaf:mid'
 *     / 'tree3a:leaf:low'；皮 'tree3a:bark' / 'tree3a:bark:mid' / 'tree3a:bark:low'；
 *     深度 'tree3a:leaf-depth' / 'tree3a:leaf-depth:mid' / 'tree3a:leaf-depth:low'；
 *   - 风动（TREE3A_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分
 *     （同公式同常数同 aBend 语义，D19.7）。
 * 分档成本记账（同口径续行）：
 *   - 叶 Mid 片元 = 3× 噪声（锯齿维持）+ SDF/hue/shade/透光/叶背 ALU ≈ 3.5× ≈ 6.5×
 *     （去叶团斑块 1× vnoise + 脉三线 ALU）；
 *   - 叶 Low 片元 = 0× 噪声 + 简化 SDF（倒卵形+裂）/hue/shade/叶背 ALU ≈ 2× ≈ 2×
 *     （去锯齿噪声 1× vnoise + 齿/耳/透光 ALU）；
 *   - 皮 Mid 片元 = 6× + 去节疤核/愈伤环 ALU ≈ 1.2× ≈ 7.2×（脊沟/板块/苔痕保留）；
 *   - 皮 Low 片元 = 1× vnoise（脊线游走）= 3× + 脊沟/沟内 AO ALU ≈ 1× ≈ 4.0×
 *     （去板块采样 1× vnoise + 节疤/苔痕门控 ALU）。
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN。
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
  if (!source.includes(target)) throw new Error(`tree3a 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（T009.6：High 空——三键沿用原键零既有消费者破坏；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/** 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，树皮恒 0 免颤） */
const TREE3A_WIND = /* glsl */ `
// tree3a wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float t3aWindPhase = fract(sin(aSeed * 78.233 + 1.37) * 43758.5453);
float t3aWindH = clamp(position.y * 0.1333, 0.0, 1.0); // /7.5m 锚点树高（缩放抖动 ±16% 下权重近似）
float t3aSway = t3aWindH * t3aWindH * 0.045 * sin(uTime * 1.15 + t3aWindPhase * 6.28318 + t3aWindH * 1.4);
// 叶片快颤：ω = 14 + 9φ（2.2–3.7Hz），幅度 ≤11mm；权重 = aBend（卡根≈0 尖大）
float t3aFlutterPhase = fract(sin((aSeed + aLeafRand) * 51.171 + 4.7) * 43758.5453);
float t3aFlutter = aBend * 0.011 * sin(uTime * (14.0 + 9.0 * t3aFlutterPhase) + t3aFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (t3aSway + t3aFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(t3aSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * t3aFlutter * 0.9; // 叶面沿卡法线微扑（树皮 aBend=0 → 恒 0）
`;

/** 顶点声明（叶形态：叶比皮多 vLeafRand varying） */
const TREE3A_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 橡树叶形覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶尖 1）：
 * 倒卵形包络（T009.2：sin(π·v^1.4)^0.75——v^1.4 预扭曲把 sin 峰推到 v≈0.61 叶长（自基部），
 * 基部爬升段变缓收窄、顶端下降段变陡钝圆收口，两端仍收零=贴枝/闭合；Spec「长倒卵形至
 * 椭圆形、顶端圆钝」Verified [1][2][5]）× 5 对圆裂（cos 波 42% 内切，裂幅两端收敛为全缘；
 * 31.42 = 2π·5——Spec 域 4–7 取中典型）× 基部耳形（t3aEar：v∈[0,0.15] sin 钟形两侧外扩、
 * 峰值 v≈0.075、振幅 0.02 ≤ 覆盖率坡宽 0.03 的 75%（裁切闪烁纪律，与齿载波同款约束），
 * v=0 仍收零——中脉收口两侧读作一对「耳」；Spec 基部耳形 Verified [1][2][5]）× 叶缘锯齿
 * （齿载波 0.7 + 值噪声抖动 0.3 合成 ±0.022 半宽；载波 pow³ 锐化齿尖使齿形可辨，噪声频率
 * 42 维持不升——alphaTest 0.5 下更高频会裁切闪烁，×taper 两端收敛全缘）；返回近似符号
 * 距离的覆盖率坡（edge/0.03 —— alphaToCoverage 的 fwidth smoothstep 吃这条坡抗锯边）。
 */
const TREE3A_LEAF_SDF = /* glsl */ `
float t3aLeafAlpha(vec2 t3aUv, float t3aRand) {
  vec2 t3aP = vec2(t3aUv.x - 0.5, t3aUv.y);
  float t3aEnv = pow(sin(3.14159 * pow(clamp(t3aP.y, 0.001, 0.999), 1.4)), 0.75); // v^1.4：最宽点 v≈0.61（倒卵形）
  float t3aTaper = smoothstep(0.04, 0.32, t3aP.y) * (1.0 - smoothstep(0.70, 0.96, t3aP.y));
  float t3aLobe = 0.5 + 0.5 * cos(t3aP.y * 31.42 + (t3aRand - 0.5) * 0.9); // 31.42 = 2π·5 圆裂（域 4–7 取中）
  float t3aMargin = 0.5 * t3aEnv * (1.0 - 0.42 * t3aTaper * t3aLobe);
  float t3aEar = sin(3.14159 * clamp(t3aP.y / 0.15, 0.0, 1.0)) * 0.02; // 基部耳形：带 [0,0.15] 钟形外扩，纯 ALU
  // 齿载波：2π·6 ≈ 6 齿/叶，pow³ 出窄峰宽谷（齿尖外凸/齿缺内凹），逐叶 -rand·2π 相位错开
  float t3aTooth = pow(0.5 + 0.5 * cos(t3aP.y * 37.7 - t3aRand * 6.28), 3.0);
  float t3aSerr = (t3aTooth * 0.7 + facVnoise(vec2(t3aP.y * 42.0, t3aRand * 13.0)) * 0.3 - 0.5) * 0.045 * t3aTaper;
  float t3aEdge = t3aMargin + t3aEar + t3aSerr - abs(t3aP.x);
  return clamp(t3aEdge / 0.03 + 0.5, 0.0, 1.0);
}
`;

/**
 * Low 档叶形覆盖率（T009.6，SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档
 * 取用）：倒卵形包络 + 5 对圆裂即可——去齿载波/锯齿噪声（片元零噪声采样）/基部耳形/
 * 叶脉；Low 壳卡为大尺度叶团读向（单卡 = 整簇抽象），齿/耳细节在 Low 观距不可辨。
 * 包络与裂项与 High 版逐字同源（档间叶形身份一致的去细节不改形原则）。
 */
const TREE3A_LEAF_SDF_LOW = /* glsl */ `
float t3aLeafAlpha(vec2 t3aUv, float t3aRand) {
  vec2 t3aP = vec2(t3aUv.x - 0.5, t3aUv.y);
  float t3aEnv = pow(sin(3.14159 * pow(clamp(t3aP.y, 0.001, 0.999), 1.4)), 0.75); // v^1.4：最宽点 v≈0.61（倒卵形）
  float t3aTaper = smoothstep(0.04, 0.32, t3aP.y) * (1.0 - smoothstep(0.70, 0.96, t3aP.y));
  float t3aLobe = 0.5 + 0.5 * cos(t3aP.y * 31.42 + (t3aRand - 0.5) * 0.9); // 31.42 = 2π·5 圆裂
  float t3aMargin = 0.5 * t3aEnv * (1.0 - 0.42 * t3aTaper * t3aLobe);
  float t3aEdge = t3aMargin - abs(t3aP.x);
  return clamp(t3aEdge / 0.03 + 0.5, 0.0, 1.0);
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。T009.6 分段拼装：每段段首 \n、
 *  段尾无换行（段间单换行拼接），High 全段拼回与旧单体 TREE3A_LEAF_BODY 逐位一致；Mid/Low
 *  = HEAD + SHADE + MUL_SIMPLE + BACK（去叶脉三线/叶团斑块——叶团乘子 0.94+0.12×t3aClump
 *  均值化 = 1.0，值噪声均值 0.5 精确保均，乘子直接消去）。 */
const TREE3A_LEAF_HEAD = /* glsl */ `
// tree3a:leaf —— SDF 叶形覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float t3aAlpha = t3aLeafAlpha(vUv, vLeafRand);
diffuseColor.a = t3aAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷蓝绿 ↔ 暖黄绿，通道摆幅 ≤15% 纪律）+ 明度 ±10%（去相关取样）
vec3 t3aHue = mix(vec3(0.88, 1.00, 1.10), vec3(1.10, 1.03, 0.82), fract(vLeafRand * 5.391 + 0.23));
float t3aLuma = 0.90 + 0.20 * fract(vLeafRand * 3.117 + 0.61);`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const TREE3A_LEAF_CLUMP = /* glsl */ `
// 冠内：竖向自遮蔽（底暗顶亮，伪装冠层 AO）+ 中频叶团斑块（波长 ~1.1m ≈ 叶团身份差）
float t3aClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 0.9 + vec2(9.4, 3.1));`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const TREE3A_LEAF_SHADE = /* glsl */ `
float t3aShade = clamp((vTreePos.y - 2.6) / 3.6, 0.0, 1.0);`;

/** High 专属：叶脉三线（中脉亮带/沟侧翼/侧脉，纯 ALU 零采样） */
const TREE3A_LEAF_VEIN = /* glsl */ `
// 叶脉明暗：中脉亮带（加宽锐化）+ 中脉沟侧翼压暗（立体感）+ 斜出侧脉（幂次锐化），
// 浅黄绿（叶脉比叶肉亮）；纯 ALU 零采样
vec2 t3aP = vec2(vUv.x - 0.5, vUv.y);
float t3aVeinMid = 1.0 - smoothstep(0.008, 0.024, abs(t3aP.x));
float t3aVeinFlank = (1.0 - t3aVeinMid) * (1.0 - smoothstep(0.024, 0.070, abs(t3aP.x))); // 中脉两侧沟影带
float t3aVeinLat = pow(max(0.0, sin(t3aP.y * 34.0 - abs(t3aP.x) * 26.0 + (vLeafRand - 0.5) * 0.6)), 7.0)
  * (1.0 - t3aVeinMid) * smoothstep(0.03, 0.20, t3aP.y) * (1.0 - smoothstep(0.78, 0.97, t3aP.y));`;

/** High 专属：合成（叶团乘子 + 脉三线调制） */
const TREE3A_LEAF_MUL_HIGH = /* glsl */ `
vec3 t3aMul = t3aHue * t3aLuma * (0.76 + 0.24 * t3aShade) * (0.94 + 0.12 * t3aClump);
t3aMul *= 1.0 - 0.07 * t3aVeinFlank * smoothstep(0.05, 0.28, t3aP.y) * (1.0 - smoothstep(0.74, 0.96, t3aP.y)); // 沟影限中段（两端收）
t3aMul = mix(t3aMul, t3aMul * vec3(1.28, 1.17, 0.68), t3aVeinMid * 0.58 + t3aVeinLat * 0.42);
diffuseColor.rgb *= t3aMul;`;

/** Mid/Low：合成（去叶团/叶脉项——叶团乘子 0.94+0.12×0.5 = 1.0 均值化消去，值噪声均值 0.5 精确保均） */
const TREE3A_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 t3aMul = t3aHue * t3aLuma * (0.76 + 0.24 * t3aShade); // Mid/Low：叶团乘子均值化消去（T009.6）
diffuseColor.rgb *= t3aMul;`;

/** 叶背粉绿（三档共用，纯 ALU 零采样零分支） */
const TREE3A_LEAF_BACK = /* glsl */ `
// 叶背粉绿（T009.2）：gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 材质双面片元，
// 背面法线由 three 双面光照自动翻转，此处只调固有色）——FRPS「叶背粉绿色」Verified [1][2]：
// 背面比叶面略浅、轻度去饱和、冷绿偏移（红蓝相对绿抬升），幅度克制（读得出双面差异不跳色）；
// 纯 ALU 零采样零分支；透光项暖绿为背光透射语义，与背面固有色区分不冲突
diffuseColor.rgb *= mix(vec3(0.94, 1.05, 1.16), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线） */
const TREE3A_LEAF_TRANSLUCENCY = /* glsl */ `
// tree3a:leaf —— 背光透射：视线与阳光反向时叶背透暖绿（叶绿素吸收红蓝 → 透射偏黄绿）
#if NUM_DIR_LIGHTS > 0
  float t3aBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float t3aTransVar = 0.45 + 0.55 * fract(vLeafRand * 7.717 + 0.44); // 逐叶透光强度变奏
  // 峰值 0.65（锚点门 R1：0.45 → 0.65）——透射色绿分量最先触顶、红蓝余量大，
  // 冠缘读作暖绿而非白（NoToneMapping 白化风险有界；t3aTransVar 下限 0.45 压住均值叶）
  outgoingLight += vec3(0.62, 0.94, 0.34) * directionalLights[0].color
    * pow(t3aBack, 3.0) * t3aTransVar * t3aAlpha * 0.65;
#endif
`;

/** 树皮配方主体（<map_fragment> 后注入；uv 域 u=环绕一周 v=累计弧长×0.5 + 位置域苔痕门控）。
 *  T009.6 分段拼装（同叶体例：段首 \n 段尾无换行，High 拼回与旧单体 TREE3A_BARK_BODY
 *  逐位一致）：Mid = HEAD_MID + RIDGE + PLATE + MOSS + MUL_MID（去节疤核/愈伤环——中距
 *  不可辨）；Low = HEAD_LOW + RIDGE + MUL_LOW（脊沟保留；去板块采样/节疤/苔痕——板块
 *  斑驳均值化为常量乘子 mix 两端中点 vec3(0.985, 0.965, 0.94)，脊沟读向不破）。 */
const TREE3A_BARK_HEAD = /* glsl */ `
// tree3a:bark —— 脊-沟-板 + 节疤 + 苔痕（成熟橡皮矩形龟裂；整数脊数 → u 缝相位连续）`;

/** Mid 档头注释（内容面与 High 的差仅记档一行） */
const TREE3A_BARK_HEAD_MID = /* glsl */ `
// tree3a:bark:mid —— 脊-沟-板 + 苔痕（T009.6 Mid：去节疤核带/愈伤环——中距不可辨）`;

/** Low 档头注释 */
const TREE3A_BARK_HEAD_LOW = /* glsl */ `
// tree3a:bark:low —— 脊-沟（T009.6 Low：脊线游走 + tri³ 剖面 + 沟内冷灰 AO 保留；板块/节疤/苔痕去采样）`;

/** 脊-沟核心（三档共用——Low 保留面的唯一采样：脊线游走 vnoise） */
const TREE3A_BARK_RIDGE = /* glsl */ `
float t3aBarkWarp = facVnoise(vec2(vUv.x * 2.7, vUv.y * 2.1) + vec2(11.7, 3.9)); // 脊线游走（低频）
float t3aBarkTri = abs(fract(vUv.x * 14.0 + t3aBarkWarp * 1.35) * 2.0 - 1.0);
// 深沟：tri³ 剖面（脊更窄亮/坡更暗）+ 沟底 0.44（× 板块暗端 × 沟内冷灰 ≈ 0.33 —— 深沟灰褐）
float t3aBarkRidge = 0.44 + 0.56 * t3aBarkTri * t3aBarkTri * t3aBarkTri;`;

/** High/Mid：各向异性竖长板块（1× vnoise——Low 去采样） */
const TREE3A_BARK_PLATE = /* glsl */ `
float t3aBarkPlate = facVnoise(vec2(vUv.x * 4.6, vUv.y * 13.5) + vec2(23.1, 8.3)); // 环疏纵密 → 竖长板`;

/** High 专属：节疤（核带 + 愈伤环，纯 ALU 复用两噪声零额外采样——Mid/Low 去） */
const TREE3A_BARK_KNOT = /* glsl */ `
// 节疤：低频游走噪声高带（稀疏圆斑；同噪两用零额外采样）——核带收紧（更清晰）+ 愈伤环
float t3aBarkKnotF = t3aBarkWarp + t3aBarkPlate * 0.2;
float t3aBarkKnot = smoothstep(0.72, 0.84, t3aBarkKnotF); // 核：暗斑 + 脊线压平 + 粗糙上翘
float t3aBarkRim = smoothstep(0.62, 0.72, t3aBarkKnotF) * (1.0 - smoothstep(0.80, 0.90, t3aBarkKnotF)); // 愈伤环：核外亮带`;

/** High/Mid：苔痕（冠下竖向门控 × 双噪声高带 × 方位门控——Low 去） */
const TREE3A_BARK_MOSS = /* glsl */ `
// 苔痕：冠下竖向门控（树冠 ~2.7m 起，其下背阴）× 双噪声高带 × 方位门控（一侧集中一侧干净）
float t3aBarkMoss = (1.0 - smoothstep(2.0, 5.2, vTreePos.y))
  * smoothstep(0.56, 0.86, t3aBarkWarp * 0.6 + t3aBarkPlate * 0.55)
  * smoothstep(-0.15, 0.75, sin(vUv.x * 6.28318 + 1.2));`;

/** High：合成（节疤核压平 + 板块冷暖 + 沟内 AO + 节疤/愈伤环 + 苔痕） */
const TREE3A_BARK_MUL = /* glsl */ `
vec3 t3aBarkMul = mix(t3aBarkRidge, 0.74 + 0.2 * t3aBarkRidge, t3aBarkKnot)
  * mix(vec3(0.84, 0.86, 0.88), vec3(1.13, 1.07, 1.00), t3aBarkPlate);
t3aBarkMul *= mix(vec3(0.89, 0.87, 0.97), vec3(1.05, 1.02, 0.98), smoothstep(0.08, 0.72, t3aBarkTri)); // 沟内 AO 式冷灰压暗、脊顶微暖
t3aBarkMul *= 1.0 - 0.42 * t3aBarkKnot + 0.14 * t3aBarkRim; // 节疤核加深 + 愈伤环微亮
t3aBarkMul = mix(t3aBarkMul, t3aBarkMul * vec3(0.80, 0.99, 0.58), t3aBarkMoss * 0.82);
diffuseColor.rgb *= t3aBarkMul;
`;

/** Mid：合成（去节疤两行；板块/沟内 AO/苔痕保留） */
const TREE3A_BARK_MUL_MID = /* glsl */ `
vec3 t3aBarkMul = t3aBarkRidge
  * mix(vec3(0.84, 0.86, 0.88), vec3(1.13, 1.07, 1.00), t3aBarkPlate);
t3aBarkMul *= mix(vec3(0.89, 0.87, 0.97), vec3(1.05, 1.02, 0.98), smoothstep(0.08, 0.72, t3aBarkTri)); // 沟内 AO 式冷灰压暗、脊顶微暖
t3aBarkMul = mix(t3aBarkMul, t3aBarkMul * vec3(0.80, 0.99, 0.58), t3aBarkMoss * 0.82);
diffuseColor.rgb *= t3aBarkMul;
`;

/** Low：合成（板块均值化常量乘子 = plate mix 两端中点（值噪声均值 0.5 精确保均）；脊沟读向不破） */
const TREE3A_BARK_MUL_LOW = /* glsl */ `
vec3 t3aBarkMul = t3aBarkRidge * vec3(0.985, 0.965, 0.94); // 板块均值化常量乘子（T009.6 Low）
t3aBarkMul *= mix(vec3(0.89, 0.87, 0.97), vec3(1.05, 1.02, 0.98), smoothstep(0.08, 0.72, t3aBarkTri)); // 沟内 AO 式冷灰压暗、脊顶微暖
diffuseColor.rgb *= t3aBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 叶形 alphaTest 裁切 + 透光 + 逐叶变奏 + 风动。
 * level 分档（T009.6，缺省 'high' = 现行为逐位不变——既有无参调用方零影响）：Mid 去叶脉
 * 三线 + 叶团斑块（SDF 全形/透光/叶背/hue·luma/shade 保留）；Low 换 TREE3A_LEAF_SDF_LOW
 * （倒卵形+裂，片元零噪声采样）+ 去透光项（远距逆光透射不可辨）。风动三档同源不动
 * （TREE3A_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：叶绿 #4e7c33 / m 0 / r 0.85（注入 -0.05 → ~0.80 微缎面域）/ DoubleSide
 * （卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createTree3aLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x4e7c33,
    metalness: 0,
    roughness: 0.85,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? TREE3A_LEAF_SDF_LOW : TREE3A_LEAF_SDF; // Mid 表面 SDF = High 同源全形
  const leafBody = level === 'high'
    ? TREE3A_LEAF_HEAD + TREE3A_LEAF_CLUMP + TREE3A_LEAF_SHADE + TREE3A_LEAF_VEIN + TREE3A_LEAF_MUL_HIGH + TREE3A_LEAF_BACK
    : TREE3A_LEAF_HEAD + TREE3A_LEAF_SHADE + TREE3A_LEAF_MUL_SIMPLE + TREE3A_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor - 0.05 + (t3aClump - 0.5) * 0.08 + (t3aVeinMid + t3aVeinLat) * 0.05, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor - 0.05, 0.05, 1.0); // Mid/Low：叶团（均值 0 精确）/叶脉糙度项随段去';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${TREE3A_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${TREE3A_WIND}`,
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
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入（High 产物逐位不变）
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${TREE3A_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `tree3a:leaf${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 树皮材质（组 0）：脊-沟-板 + 节疤 + 苔痕 + 整树缓摆（与叶同公式同相位；aBend 恒 0
 * 快颤层天然不作用）。level 分档（T009.6，缺省 'high' = 现行为逐位不变）：Mid 去节疤
 * （核带 + 愈伤环 ALU——中距不可辨；脊沟/板块/苔痕保留）；Low 脊沟保留（脊线游走 vnoise +
 * tri³ 剖面 + 沟内冷灰 AO），去板块噪声采样/节疤/苔痕（板块斑驳均值化为常量乘子——脊沟
 * 读向不破）。风动三档同源不动。
 * 底参：灰主调灰褐 #5c534a（T009.4 灰度校正——Spec bark_color Verified [6] / 附录 #15：
 * 灰为主调；旧暖灰褐 #63513f 灰味低于真实）/ m 0 / r 0.93（高糙哑光）/ FrontSide。
 */
export function createTree3aBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x5c534a, // 灰主调灰褐（T009.4 灰度校正，Spec bark_color Verified [6] / 附录 #15，2026-09-18；旧 #63513f 偏暖褐）
    metalness: 0,
    roughness: 0.93,
    side: THREE.FrontSide,
  });
  material.defines = { USE_UV: '' }; // 沟脊/板块域 = 圆柱 uv（u=环绕一周、v=累计弧长）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? TREE3A_BARK_HEAD + TREE3A_BARK_RIDGE + TREE3A_BARK_PLATE + TREE3A_BARK_KNOT + TREE3A_BARK_MOSS + TREE3A_BARK_MUL
    : level === 'mid'
      ? TREE3A_BARK_HEAD_MID + TREE3A_BARK_RIDGE + TREE3A_BARK_PLATE + TREE3A_BARK_MOSS + TREE3A_BARK_MUL_MID
      : TREE3A_BARK_HEAD_LOW + TREE3A_BARK_RIDGE + TREE3A_BARK_MUL_LOW;
  const barkRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (t3aBarkPlate - 0.5) * 0.05 + t3aBarkKnot * 0.09 + t3aBarkMoss * 0.05 - t3aBarkTri * t3aBarkTri * t3aBarkTri * 0.10, 0.05, 1.0); // 脊顶 -0.10 光滑（掠射高光骑脊 → 深度线索）'
    : level === 'mid'
      ? 'roughnessFactor = clamp(roughnessFactor + (t3aBarkPlate - 0.5) * 0.05 + t3aBarkMoss * 0.05 - t3aBarkTri * t3aBarkTri * t3aBarkTri * 0.10, 0.05, 1.0); // Mid：去节疤粗糙上翘项（脊顶光滑保留）'
      : 'roughnessFactor = clamp(roughnessFactor - t3aBarkTri * t3aBarkTri * t3aBarkTri * 0.10, 0.05, 1.0); // Low：脊顶光滑保留（脊沟读向）；板块（均值 0）/节疤/苔痕项去';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${TREE3A_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${TREE3A_WIND}`,
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
  material.customProgramCacheKey = () => `tree3a:bark${levelKeySuffix(level)}`;
  applyTreeFadeDither(material); // T021.3 dither fade（direct 侧；aFadeOut 缺省 0 = 行为逐位不变，键 +dither）
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（T009.6 SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（Mid
 * 表面 SDF 与 High 同源全形）；Low = TREE3A_LEAF_SDF_LOW（表面/影裁切档内一致）。
 * 树皮组守卫：aLeafRand=0（树皮恒 0）→ alpha=1 实心——多材质网格共用本深度材质时
 * 皮组不被叶形 SDF 误裁。风动位移不进 depth pass（静态影取舍，见模块头记档）。
 * 影 pass 侧向由 shadowMap 按 [主材质 DoubleSide] 覆写为双面（叶卡两面皆可投影）；
 * alphaTest 由 shadowMap 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createTree3aLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  const leafSdf = level === 'low' ? TREE3A_LEAF_SDF_LOW : TREE3A_LEAF_SDF; // Mid 深度 = High SDF（同源全形）
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
${FACILITY_GLSL_NOISE}
${leafSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, t3aLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 皮组 aLeafRand=0 → 实心`,
    );
  };
  material.customProgramCacheKey = () => `tree3a:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
