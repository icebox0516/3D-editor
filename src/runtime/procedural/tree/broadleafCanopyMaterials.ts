/**
 * runtime/procedural/tree/broadleafCanopyMaterials —— BroadleafCanopyProxy 材质面（T021.6）。
 *
 * 职责：canopy 几何（./broadleafCanopyProxy，几何面交付）的成套材质工厂——按 assetId 交付
 *   [干柱材质, 冠卡材质] 两材质组（组序 0=干柱 / 1=冠卡，恰 2 组契约）+ Canopy Depth
 *   Material（customDepthMaterial 用），representation-runtime.md §6.4 材质光照模型 /
 *   §6.3 风动契约 / §七末段 Canopy Depth Material 的材质面落点。
 *
 * ── 受光模型（§6.4）──
 * MeshStandardMaterial 族（冠卡 + 干柱）：主光 lambert 由标准着色吃场景 DirectionalLight，
 *   IBL 环境项自动吃 scene.environment / environmentIntensity（T018 共享域——材质不 override
 *   envMap / envMapIntensity，预设切换 day/dusk/night/tech 全跟随，禁 unlit）。树种级冠色 =
 *   各树种叶材质构造色（crownColor，按 assetId 查表）；内外明暗梯度消费 aCrownQ（壳亮芯暗
 *   0.74+0.26·q——外密内疏的受光读向，替代高中档的竖向自遮蔽）；aLeafRand 逐卡变奏 =
 *   色相 / 明度（同该树种叶材质 hue·luma 公式同常数——共享簇与 Low 卡逐位同 tint，dither
 *   过渡连续）+ 背光透光微扰（transVar 同式 + 壳层加权 cnShell = 0.35+0.65·vCrownQ：薄叶
 *   透射假设只对冠壳成立，冠心体量不发光——canopy 独有精化，高中档无此通道）。
 *   不做：SDF 叶形（canopy 卡 = 整簇抽象，无单叶细节——§六「不保留单叶细节」）；叶背粉绿
 *   （近观双面身份读向，远景不可辨——Low 档保留是叶级身份，canopy 卡背面 = 冠质量另一侧，
 *   DoubleSide 光照已翻法线）；粗糙度注入（远景掠射高光不可辨，底参直用）。
 *
 * ── 风动契约（§6.3，档间同相位 = 身份一致）──
 * 同一 uTime 驱动 + 消费 aSeed / aBend / aLeafRand，**与该树种高中低档叶材质同公式同常数**
 *   （表 BROADLEAF_CANOPY_MATERIAL_SPECIES 逐树种转录 13 套风常数 / hue·luma·transVar 常数 /
 *   冠色 / 皮色——测试 broadleafCanopyMaterials.test.ts 以假 shader 注入逐数对账 species
 *   材质真实 GLSL，drift 即红：树种侧调参未同步 canopy 时 CI 拦截）。aSeed 恒 0 时相位 =
 *   常数相位且与该树种 High/Mid/Low 逐位相等（0=0 同相成立，散布链缺属性 GL 缺省 0 同口径）；
 *   未来 D20.4 修复落地池挂逐实例 InstancedBufferAttribute('aSeed') 后三档零改动同享——
 *   禁坐标哈希等第三套相位机制。flutter 相位 = hash(aSeed + aLeafRand)（同 High 叶材质机制）。
 *   注入方式与现有风动同构：onBeforeCompile + <begin_vertex> 后作用 transformed（物体空间，
 *   实例矩阵带着转）+ replaceOnce 缺失即抛 + customProgramCacheKey 唯一（canopy:card/trunk/
 *   depth:<assetId>——配方逐树种异，键逐树种异）。
 * uTime 桥接（业界标准模式，沿 tree3a 先例）：成套三材质共享同一 uTime 对象引用——
 *   card/trunk 挂材质级 uniforms.uTime（TimeUniformService 扫描面），depth 不挂材质级
 *   （服务只扫 node.material，customDepthMaterial 不在遍历面）而只在 onBeforeCompile 里把
 *   shader.uniforms.uTime 绑到同一共享对象——服务写主材质一次，深度程序 uniform 即时同值，
 *   影 pass 风摆与主渲染同相同帧。**成套消费契约：三材质必须同一工厂产物一起用**（拆开挂
 *   depth 会失去 uTime 更新源——021.7 接线注意）。
 *
 * ── Canopy Depth Material（§七末段：仅保冠层轮廓 + 主要空隙 + 基本体量）──
 * MeshDepthMaterial + RGBADepthPacking，**无 SDF / 无 alphaTest / 无噪声采样**——canopy 卡
 *   本身即冠层壳带（双卡交叉 + 单卡内层），卡间空隙 = 主要空隙，由几何排布天然保留，深度
 *   片元零分支零采样（禁远景 Shadow Pass 叶片级 SDF 的落点即此）。干柱组 aBend 恒 0 → 深度
 *   风摆只剩整树缓摆（与冠卡同相——影与主渲染同摆，杜绝「树冠摆影子不摆」）。法向微扑项
 *   （objectNormal × flutter）不进深度路径：MeshDepthMaterial 顶点着色器无 beginnormal 链、
 *   objectNormal 未定义，且该分量 ≤1cm 级在影 texel ~16cm 下不可辨（记档取舍，同 tree3a
 *   「静态影」取舍的放宽版：canopy 保留 xz 风摆进影）。所有权契约同规：Source/Cache 拥有
 *   并释放（D41 §10.3），本工厂只 new（每次调用全新材质，D17），Pool 只挂引用——Runtime
 *   接线归 021.7。
 *
 * ── 成本记账（10 万实例纪律）──
 *   - 冠卡片元 = 0× 噪声采样 / 0× 贴图；hue·luma·shade mix + 透光 dot+pow 纯 ALU ≈ 1×；
 *   - 干柱片元 = 0（底参直出）；顶点 = 两次 sin + 一次法线乘（同 species）；
 *   - 深度片元 = 0（零采样零分支）；深度顶点 = 两次 sin。
 *
 * 边界：材质面 only——不接 Runtime（RepresentationSourceRouter / CanopySourceCache /
 *   provideSource 演化归 021.7）；不动几何 / 不动 T018 环境 / Shadow Camera 常量；零贴图
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0 路径相位退化为正常数
 *   （hash 无除法无 NaN）。
 */
import * as THREE from 'three';

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`canopy 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** GLSL float 字面量（全带小数点——整数补 .0） */
const f = (x: number): string => (Number.isInteger(x) ? `${x}.0` : String(x));

/** vec3 字面量 */
const f3 = (v: readonly [number, number, number]): string => `vec3(${v.map(f).join(', ')})`;

// ── 树种材质参数表（13 树种逐树种转录自各 *Materials.ts；drift-lock 见测试）──────────

/** 风动参数（与该树种高中低档叶材质同公式同常数——逐数对账锁定） */
export interface BroadleafCanopyWindSpec {
  /** 整树缓摆高度归一尺度（1/树种锚高） */
  heightScale: number;
  /** 整树相位 hash：fract(sin(aSeed·K + C)·43758.5453) */
  swayPhaseK: number;
  swayPhaseC: number;
  /** 缓摆幅度（米） / 频率（rad/s） */
  swayAmplitude: number;
  swayFrequency: number;
  /** 快颤相位 hash：fract(sin((aSeed+aLeafRand)·K + C)·43758.5453) */
  flutterPhaseK: number;
  flutterPhaseC: number;
  /** 快颤幅度（米）/ 频率基值与跨度（rad/s） */
  flutterAmplitude: number;
  flutterFrequencyBase: number;
  flutterFrequencySpan: number;
}

/** aLeafRand 逐卡变奏参数（色相 / 明度 / 透光——同该树种叶材质公式同常数） */
export interface BroadleafCanopyVariationSpec {
  hueCold: readonly [number, number, number];
  hueWarm: readonly [number, number, number];
  hueK: number;
  hueC: number;
  lumaBase: number;
  lumaSpan: number;
  lumaK: number;
  lumaC: number;
  transBase: number;
  transSpan: number;
  transK: number;
  transC: number;
  /** 背光透射色（同该树种叶材质） */
  transColor: readonly [number, number, number];
  /** 透射峰值系数（同该树种叶材质） */
  transPeak: number;
}

/** 单树种 canopy 材质参数（assetId → 本表；几何面契约：树种级冠色不进几何属性） */
export interface BroadleafCanopySpeciesMaterialSpec {
  wind: BroadleafCanopyWindSpec;
  /** 树种级冠色（= 该树种叶材质构造色） */
  crownColor: number;
  /** 干柱色（= 该树种皮材质构造色——远景剪影读向） */
  trunkColor: number;
  variation: BroadleafCanopyVariationSpec;
}

/** 13 树种接入表（T011 全量；键序与 broadleafCanopyProxy 接入表一致） */
export const BROADLEAF_CANOPY_MATERIAL_SPECIES: Readonly<Record<string, BroadleafCanopySpeciesMaterialSpec>> = {
  asset_tree_3a: {
    wind: { heightScale: 0.1333, swayPhaseK: 78.233, swayPhaseC: 1.37, swayAmplitude: 0.045, swayFrequency: 1.15, flutterPhaseK: 51.171, flutterPhaseC: 4.7, flutterAmplitude: 0.011, flutterFrequencyBase: 14, flutterFrequencySpan: 9 },
    crownColor: 0x4e7c33,
    trunkColor: 0x5c534a,
    variation: { hueCold: [0.88, 1.0, 1.1], hueWarm: [1.1, 1.03, 0.82], hueK: 5.391, hueC: 0.23, lumaBase: 0.9, lumaSpan: 0.2, lumaK: 3.117, lumaC: 0.61, transBase: 0.45, transSpan: 0.55, transK: 7.717, transC: 0.44, transColor: [0.62, 0.94, 0.34], transPeak: 0.65 },
  },
  asset_tree_camphor: {
    wind: { heightScale: 0.125, swayPhaseK: 79.193, swayPhaseC: 2.61, swayAmplitude: 0.045, swayFrequency: 1.15, flutterPhaseK: 49.337, flutterPhaseC: 3.9, flutterAmplitude: 0.011, flutterFrequencyBase: 14, flutterFrequencySpan: 9 },
    crownColor: 0x33612e,
    trunkColor: 0x6e6352,
    variation: { hueCold: [0.94, 1.0, 1.04], hueWarm: [1.06, 1.03, 0.9], hueK: 4.723, hueC: 0.31, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.511, lumaC: 0.53, transBase: 0.55, transSpan: 0.45, transK: 8.317, transC: 0.37, transColor: [0.46, 0.84, 0.36], transPeak: 0.22 },
  },
  asset_tree_celtis: {
    wind: { heightScale: 0.1333, swayPhaseK: 78.233, swayPhaseC: 1.37, swayAmplitude: 0.045, swayFrequency: 1.15, flutterPhaseK: 51.171, flutterPhaseC: 4.7, flutterAmplitude: 0.011, flutterFrequencyBase: 14, flutterFrequencySpan: 9 },
    crownColor: 0x5a8340,
    trunkColor: 0x7a746a,
    variation: { hueCold: [0.92, 1.0, 1.06], hueWarm: [1.1, 1.04, 0.84], hueK: 5.391, hueC: 0.23, lumaBase: 0.9, lumaSpan: 0.2, lumaK: 3.117, lumaC: 0.61, transBase: 0.55, transSpan: 0.45, transK: 7.717, transC: 0.44, transColor: [0.58, 0.9, 0.38], transPeak: 0.3 },
  },
  asset_tree_zelkova: {
    wind: { heightScale: 0.125, swayPhaseK: 77.669, swayPhaseC: 1.94, swayAmplitude: 0.045, swayFrequency: 1.15, flutterPhaseK: 53.419, flutterPhaseC: 2.8, flutterAmplitude: 0.008, flutterFrequencyBase: 16, flutterFrequencySpan: 9 },
    crownColor: 0x3e6c2c,
    trunkColor: 0x787c72,
    variation: { hueCold: [0.93, 1.0, 1.05], hueWarm: [1.07, 1.03, 0.91], hueK: 6.147, hueC: 0.17, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 4.213, lumaC: 0.42, transBase: 0.55, transSpan: 0.45, transK: 9.133, transC: 0.29, transColor: [0.6, 0.92, 0.34], transPeak: 0.4 },
  },
  asset_tree_ginkgo: {
    wind: { heightScale: 0.125, swayPhaseK: 82.537, swayPhaseC: 3.37, swayAmplitude: 0.045, swayFrequency: 1.15, flutterPhaseK: 58.219, flutterPhaseC: 5.1, flutterAmplitude: 0.013, flutterFrequencyBase: 10, flutterFrequencySpan: 7 },
    crownColor: 0x8ab45d,
    trunkColor: 0x6b665c,
    variation: { hueCold: [0.94, 1.0, 1.03], hueWarm: [1.08, 1.05, 0.88], hueK: 5.871, hueC: 0.23, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.917, lumaC: 0.37, transBase: 0.55, transSpan: 0.45, transK: 8.913, transC: 0.33, transColor: [0.66, 0.95, 0.38], transPeak: 0.34 },
  },
  asset_tree_bischofia: {
    wind: { heightScale: 0.1011, swayPhaseK: 88.217, swayPhaseC: 6.8, swayAmplitude: 0.04, swayFrequency: 1.15, flutterPhaseK: 65.443, flutterPhaseC: 8.9, flutterAmplitude: 0.011, flutterFrequencyBase: 9, flutterFrequencySpan: 6 },
    crownColor: 0x517c35,
    trunkColor: 0x675a4b,
    variation: { hueCold: [0.95, 1.0, 1.03], hueWarm: [1.05, 1.05, 0.93], hueK: 7.213, hueC: 0.33, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 4.417, lumaC: 0.55, transBase: 0.55, transSpan: 0.45, transK: 7.613, transC: 0.57, transColor: [0.55, 0.89, 0.34], transPeak: 0.31 },
  },
  asset_tree_fraxinus: {
    wind: { heightScale: 0.09526, swayPhaseK: 93.847, swayPhaseC: 5.7, swayAmplitude: 0.042, swayFrequency: 1.15, flutterPhaseK: 70.913, flutterPhaseC: 6.4, flutterAmplitude: 0.011, flutterFrequencyBase: 9, flutterFrequencySpan: 6 },
    crownColor: 0x548840,
    trunkColor: 0x7a746b,
    variation: { hueCold: [0.95, 1.0, 1.02], hueWarm: [1.05, 1.04, 0.94], hueK: 7.517, hueC: 0.33, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 4.619, lumaC: 0.57, transBase: 0.55, transSpan: 0.45, transK: 7.913, transC: 0.63, transColor: [0.54, 0.9, 0.36], transPeak: 0.318 },
  },
  asset_tree_koelreuteria: {
    wind: { heightScale: 0.1015, swayPhaseK: 84.913, swayPhaseC: 5.3, swayAmplitude: 0.042, swayFrequency: 1.15, flutterPhaseK: 61.157, flutterPhaseC: 7.8, flutterAmplitude: 0.011, flutterFrequencyBase: 9, flutterFrequencySpan: 6 },
    crownColor: 0x527d37,
    trunkColor: 0x90928a,
    variation: { hueCold: [0.95, 1.0, 1.03], hueWarm: [1.05, 1.05, 0.93], hueK: 7.213, hueC: 0.29, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 4.417, lumaC: 0.51, transBase: 0.55, transSpan: 0.45, transK: 7.613, transC: 0.51, transColor: [0.55, 0.9, 0.35], transPeak: 0.32 },
  },
  asset_tree_ligustrum: {
    wind: { heightScale: 0.11896, swayPhaseK: 96.441, swayPhaseC: 4.8, swayAmplitude: 0.044, swayFrequency: 1.15, flutterPhaseK: 73.521, flutterPhaseC: 5.6, flutterAmplitude: 0.011, flutterFrequencyBase: 12, flutterFrequencySpan: 7 },
    crownColor: 0x31592c,
    trunkColor: 0x7b776f,
    variation: { hueCold: [0.94, 1.0, 1.05], hueWarm: [1.06, 1.03, 0.9], hueK: 6.723, hueC: 0.27, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.911, lumaC: 0.55, transBase: 0.55, transSpan: 0.45, transK: 8.917, transC: 0.43, transColor: [0.47, 0.83, 0.35], transPeak: 0.21 },
  },
  asset_tree_platanus: {
    wind: { heightScale: 0.0833, swayPhaseK: 81.273, swayPhaseC: 4.15, swayAmplitude: 0.045, swayFrequency: 1.15, flutterPhaseK: 57.431, flutterPhaseC: 6.2, flutterAmplitude: 0.015, flutterFrequencyBase: 8, flutterFrequencySpan: 6 },
    crownColor: 0x527e39,
    trunkColor: 0x787e6f,
    variation: { hueCold: [0.94, 1.0, 1.04], hueWarm: [1.07, 1.04, 0.9], hueK: 6.517, hueC: 0.33, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.883, lumaC: 0.45, transBase: 0.55, transSpan: 0.45, transK: 7.613, transC: 0.51, transColor: [0.56, 0.9, 0.36], transPeak: 0.28 },
  },
  asset_tree_salix: {
    wind: { heightScale: 0.10172, swayPhaseK: 98.127, swayPhaseC: 5.2, swayAmplitude: 0.052, swayFrequency: 0.92, flutterPhaseK: 76.317, flutterPhaseC: 6.1, flutterAmplitude: 0.009, flutterFrequencyBase: 17, flutterFrequencySpan: 9 },
    crownColor: 0x47782d,
    trunkColor: 0x56534d,
    variation: { hueCold: [0.94, 1.0, 1.04], hueWarm: [1.08, 1.05, 0.9], hueK: 6.913, hueC: 0.21, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 4.117, lumaC: 0.53, transBase: 0.55, transSpan: 0.45, transK: 8.517, transC: 0.39, transColor: [0.62, 0.93, 0.33], transPeak: 0.44 },
  },
  asset_tree_sophora: {
    wind: { heightScale: 0.0967, swayPhaseK: 91.523, swayPhaseC: 4.9, swayAmplitude: 0.042, swayFrequency: 1.15, flutterPhaseK: 68.137, flutterPhaseC: 7.3, flutterAmplitude: 0.011, flutterFrequencyBase: 9, flutterFrequencySpan: 6 },
    crownColor: 0x568a3e,
    trunkColor: 0x6d675d,
    variation: { hueCold: [0.95, 1.0, 1.03], hueWarm: [1.05, 1.05, 0.93], hueK: 7.213, hueC: 0.29, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 4.417, lumaC: 0.51, transBase: 0.55, transSpan: 0.45, transK: 7.613, transC: 0.51, transColor: [0.56, 0.92, 0.38], transPeak: 0.325 },
  },
  asset_tree_triadica: {
    wind: { heightScale: 0.1053, swayPhaseK: 86.531, swayPhaseC: 3.4, swayAmplitude: 0.044, swayFrequency: 1.15, flutterPhaseK: 63.917, flutterPhaseC: 5.1, flutterAmplitude: 0.012, flutterFrequencyBase: 11, flutterFrequencySpan: 7 },
    crownColor: 0x507c34,
    trunkColor: 0x6f6a62,
    variation: { hueCold: [0.94, 1.0, 1.05], hueWarm: [1.07, 1.04, 0.9], hueK: 6.317, hueC: 0.37, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 4.117, lumaC: 0.43, transBase: 0.55, transSpan: 0.45, transK: 7.613, transC: 0.51, transColor: [0.55, 0.91, 0.34], transPeak: 0.33 },
  },
};

/** canopy 材质可用树种 assetId 清单（与几何面接入表同序；接线 / 测试枚举面） */
export const BROADLEAF_CANOPY_MATERIAL_ASSET_IDS: readonly string[] = Object.keys(BROADLEAF_CANOPY_MATERIAL_SPECIES);

// ── GLSL 配方（参数化拼装——数值来自上表；公式逐字同 species 风动/hue·luma 形态）──────

/** 风动顶点声明（干柱 / 冠卡共用——aLeafRand 进 flutter 相位，干柱 aBend=0 免颤） */
const CANOPY_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

/**
 * 风动顶点核心（与该树种高中低档叶材质同公式同常数）：整树缓摆（aSeed 个体相位，权重 =
 * 归一物体高度²）+ 卡尖快颤（aBend 权重，相位 = hash(aSeed + aLeafRand)）。withNormalFlap：
 * 主渲染路径含叶面沿卡法线微扑（objectNormal 在 Standard 顶点链可用）；深度路径 false
 * （MeshDepthMaterial 顶点链无 beginnormal——objectNormal 未定义，且 ≤1cm 级影不可辨）。
 */
function canopyWindGlsl(wind: BroadleafCanopyWindSpec, withNormalFlap: boolean): string {
  return /* glsl */ `
// canopy wind —— 与该树种高中低档叶材质同公式同常数（档间同相位 = 身份一致，D19.7 / D41 §6.3）
// uTime = 全局风帧；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float cnWindPhase = fract(sin(aSeed * ${f(wind.swayPhaseK)} + ${f(wind.swayPhaseC)}) * 43758.5453);
float cnWindH = clamp(position.y * ${f(wind.heightScale)}, 0.0, 1.0);
float cnSway = cnWindH * cnWindH * ${f(wind.swayAmplitude)} * sin(uTime * ${f(wind.swayFrequency)} + cnWindPhase * 6.28318 + cnWindH * 1.4);
// 卡尖快颤：相位 = hash(aSeed + aLeafRand)（同 High 叶材质机制）；权重 = aBend（干柱恒 0 免颤）
float cnFlutterPhase = fract(sin((aSeed + aLeafRand) * ${f(wind.flutterPhaseK)} + ${f(wind.flutterPhaseC)}) * 43758.5453);
float cnFlutter = aBend * ${f(wind.flutterAmplitude)} * sin(uTime * (${f(wind.flutterFrequencyBase)} + ${f(wind.flutterFrequencySpan)} * cnFlutterPhase) + cnFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (cnSway + cnFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(cnSway) * 0.18; // 摆动弧线下垂分量
${withNormalFlap
    ? 'transformed += objectNormal * cnFlutter * 0.9; // 卡面沿法线微扑（干柱 aBend=0 → 恒 0）'
    : '// 深度路径：法向微扑不进影（MeshDepthMaterial 顶点链无法线变量；≤1cm 级影 texel 不可辨）'}
`;
}

/** 冠卡配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb；<color_fragment> 不触碰） */
function canopyCardBodyGlsl(v: BroadleafCanopyVariationSpec): string {
  return /* glsl */ `
// canopy:card —— 树种级冠色 × aCrownQ 内外明暗 × aLeafRand 逐卡变奏
vec3 cnHue = mix(${f3(v.hueCold)}, ${f3(v.hueWarm)}, fract(vLeafRand * ${f(v.hueK)} + ${f(v.hueC)}));
float cnLuma = ${f(v.lumaBase)} + ${f(v.lumaSpan)} * fract(vLeafRand * ${f(v.lumaK)} + ${f(v.lumaC)});
float cnShade = 0.74 + 0.26 * vCrownQ; // 壳亮芯暗（aCrownQ 0=冠心 / 1=冠壳——外密内疏受光读向）
diffuseColor.rgb *= cnHue * cnLuma * cnShade;
`;
}

/** 背光透光微扰（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线） */
function canopyTransmissionGlsl(v: BroadleafCanopyVariationSpec): string {
  return /* glsl */ `
// canopy:card —— 背光透光微扰（aLeafRand 逐卡强度变奏；壳层加权——薄叶透射只对冠壳成立）
#if NUM_DIR_LIGHTS > 0
  float cnBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float cnTransVar = ${f(v.transBase)} + ${f(v.transSpan)} * fract(vLeafRand * ${f(v.transK)} + ${f(v.transC)});
  float cnShell = 0.35 + 0.65 * vCrownQ; // 冠壳全量透光 / 冠心压至 0.35（体量不发光）
  outgoingLight += ${f3(v.transColor)} * directionalLights[0].color
    * pow(cnBack, 3.0) * cnTransVar * cnShell * ${f(v.transPeak)};
#endif
`;
}

// ── 工厂（每次调用 new 全部材质 + 独立注入闭包；D17 所有权随调用移交）────────────────

/** canopy 成套材质（组序 [0=干柱, 1=冠卡] 直喂 mesh.material；depth 挂 customDepthMaterial） */
export interface BroadleafCanopyMaterialSet {
  /** 组 0 干柱材质（树种皮色 Flat 受光 + 整树缓摆；aBend 恒 0 免颤） */
  trunkMaterial: THREE.MeshStandardMaterial;
  /** 组 1 冠卡材质（树种冠色 + aCrownQ 梯度 + aLeafRand 变奏 + 风动；DoubleSide 双面读向） */
  cardMaterial: THREE.MeshStandardMaterial;
  /** Canopy Depth Material（轮廓-only 无 SDF；风摆与主渲染同相同帧——uTime 共享对象） */
  depthMaterial: THREE.MeshDepthMaterial;
  /** 组序成套数组（[干柱, 冠卡]——直接喂 mesh.material，与几何恰 2 组契约对齐） */
  materials: [THREE.MeshStandardMaterial, THREE.MeshStandardMaterial];
}

/**
 * BroadleafCanopyProxy 成套材质工厂（全乔木共用，按 assetId 取树种参数）。
 * 输入 = assetId（散布链 assetId 粒度语义，无 shapeSlot 维度）；输出 = 干柱 + 冠卡 + 深度
 * 三材质，共享同一 uTime 对象（TimeUniformService 扫主材质即三材质同帧——影 pass 风摆与
 * 主渲染同相）。未知 assetId 即抛（可用清单见错误信息）。Runtime 接线归 021.7；所有权随
 * 调用移交调用方（Source/Cache 拥有释放，Pool 只挂引用——D41 §10.3）。
 */
export function createBroadleafCanopyMaterials(assetId: string): BroadleafCanopyMaterialSet {
  const spec = BROADLEAF_CANOPY_MATERIAL_SPECIES[assetId];
  if (!spec) {
    throw new Error(`BroadleafCanopyProxy 材质无此树种接入: ${assetId}（可用: ${BROADLEAF_CANOPY_MATERIAL_ASSET_IDS.join(', ')}）`);
  }
  const uTime = { value: 0 };

  // ── 干柱（组 0）：树种皮色 + 整树缓摆（远景剪影读向——纹理细节观距不可辨，§六不保留近景树皮）──
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: spec.trunkColor,
    metalness: 0,
    roughness: 0.93,
    side: THREE.FrontSide,
  });
  (trunkMaterial as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  trunkMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CANOPY_WIND_DECLARE}`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
${canopyWindGlsl(spec.wind, true)}`,
    );
  };
  trunkMaterial.customProgramCacheKey = () => `canopy:trunk:${assetId}`;

  // ── 冠卡（组 1）：树种冠色 + aCrownQ 内外明暗 + aLeafRand 变奏 + 透光微扰 + 风动 ──
  const cardMaterial = new THREE.MeshStandardMaterial({
    color: spec.crownColor,
    metalness: 0,
    roughness: 0.85,
    side: THREE.DoubleSide, // 卡面水平法线双面读向（几何面契约建议）
  });
  (cardMaterial as TimeBridgedMaterial).uniforms = { uTime };
  cardMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CANOPY_WIND_DECLARE}attribute float aCrownQ;
varying float vLeafRand;
varying float vCrownQ;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vCrownQ = aCrownQ;
${canopyWindGlsl(spec.wind, true)}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying float vCrownQ;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${canopyCardBodyGlsl(spec.variation)}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <opaque_fragment>',
      `${canopyTransmissionGlsl(spec.variation)}
#include <opaque_fragment>`,
    );
  };
  cardMaterial.customProgramCacheKey = () => `canopy:card:${assetId}`;

  // ── 深度（customDepthMaterial）：轮廓-only 无 SDF + 风摆同相（干柱 / 冠卡两共用一）──
  const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    side: THREE.DoubleSide, // 卡面双面投影（影 pass 侧向由 shadowMap 按主材质覆写，此处显式对齐）
  });
  depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 共享对象——服务写主材质即深度程序同帧（成套消费契约）
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CANOPY_WIND_DECLARE}`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
${canopyWindGlsl(spec.wind, false)}`,
    );
  };
  depthMaterial.customProgramCacheKey = () => `canopy:depth:${assetId}`;

  return {
    trunkMaterial,
    cardMaterial,
    depthMaterial,
    materials: [trunkMaterial, cardMaterial],
  };
}
