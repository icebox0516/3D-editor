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
 *   （表 BROADLEAF_CANOPY_MATERIAL_SPECIES 逐树种转录 15 套风常数 / hue·luma·transVar 常数 /
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
 *   depth 会失去 uTime 更新源——CanopySourceCache 整体成套持有三材质，021.7 按此接线）。
 *
 * ── 色卡 preset + uTime 注入（T024.1，D44 #1/#3——「冠变干不变」推广到远景表示）──
 * createBroadleafCanopyMaterials 追加两个可选尾参（导出签名冻结的扩展，向后兼容）：
 *   - preset：查种子级冠色覆写表 BROADLEAF_CANOPY_CROWN_PRESETS（模块私有）——命中行
 *     覆写冠卡 crownColor（构造色 = uniform 通道，program 不增；远景不随卡会破所见即
 *     所得——秋银杏拉远变绿）；transColor/transPeak 可选覆写进 GLSL 字面量（填充即
 *     card 键加 `:${preset}` 后缀分叉 = +1 program 的显式选择；024.1 无填充——与
 *     ginkgoMaterials 叶材质透射冻结口径一致，近远景背光观感不背离）。未命中（缺省 /
 *     'default' / 无行树种 / 未知 id）= 物种表行为逐位一致；干柱色/风动/变奏参数不随卡。
 *     024.1 填 ginkgo autumn 一行（与 GINKGO_LEAF_PRESETS.autumn 同源同值——远近
 *     基调一致）；**024.2 批一/批二已回填 platanus/koelreuteria/sophora/triadica/
 *     fraxinus/salix 六行 autumn**（各与该树 *_LEAF_PRESETS.autumn 同源同值——
 *     fraxinus/salix 经 Step R 补证 Spec 1.1 增量后建卡）；**024.3 批二回补
 *     tree3a/celtis/zelkova 三行 autumn**（Verified 秋相证据直接建卡——Spec §6 季相
 *     记录）+ **bischofia 一行**（Step R 补证 Spec 1.1 秋色增量后建卡——峰相红-红橙，
 *     文献四源 Verified + iNat 照片直证）。
 *   - uTime：缓存共享层成套契约的接口（几何/深度跨卡共享后，注入同一 uTime、丢弃自建
 *     深度材质改用共享份）。缺省 = 工厂自建（现行行为）；提供时三材质（干柱/冠卡/深度）
 *     统一绑定该对象——TimeUniformService 广播语义不变（写任一主材质即同值到深度程序），
 *     三材质成套释放契约窄化为「uTime 引用同源」（CanopySourceCache 头注释随改，另 Step）。
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
 *   接线已由 021.7 落位（CanopySourceCache）。
 *
 * ── 成本记账（10 万实例纪律）──
 *   - 冠卡片元 = 0× 噪声采样 / 0× 贴图；hue·luma·shade mix + 透光 dot+pow 纯 ALU ≈ 1×；
 *   - 干柱片元 = 0（底参直出）；顶点 = 两次 sin + 一次法线乘（同 species）；
 *   - 深度片元 = 0（零采样零分支）；深度顶点 = 两次 sin。
 *
 * 边界：材质面 only——不接 Runtime（RepresentationSourceRouter / CanopySourceCache /
 *   provideSource 演化已由 021.7 落位）；不动几何 / 不动 T018 环境 / Shadow Camera 常量；零贴图
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0 路径相位退化为正常数
 *   （hash 无除法无 NaN）。
 */
import * as THREE from 'three';
import { applyTreeFadeDither } from './treeFadeDither';

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

// ── 树种材质参数表（17 树种逐树种转录自各 *Materials.ts；drift-lock 见测试）──────────

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

/** 17 树种接入表（T011 阔叶 13 全量 + T012.1 conifer 首例 cedrus + T012.2 conifer 转正例 metasequoia + T012.3 conifer 第三例 juniperus + T012.4 conifer 第四例 bungeana；键序与 broadleafCanopyProxy 接入表一致） */
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
  asset_tree_cedrus: {
    // conifer 首例行（T012.1 Step 3c——逐数转录 cedrusMaterials CEDRUS_WIND / CEDRUS_NEEDLE_
    // HEAD / TRANSLUCENCY，drift-lock 见 broadleafCanopyMaterials.test）：风动三成分 → proxy
    // 两槽的远距退化映射——sway 槽 = 成分① 整层低频慢摆（0.35Hz=2.1991 rad/s × 幅 0.025m，
    // 语义同源逐数转录）；flutter 槽 = 成分② 层缘垂帘/针簇高频颤（2.4Hz=15.0796 × 幅 0.05，
    // 常频率——span 0 = cedrus 快颤无相位调频项，canopy 公式 0 系数退化逐位一致）；成分③
    // 顶梢摆幅（0.9Hz × 0.09m，上 1/4 渐尖区门控）= 近景身份读向（cedrusMaterials「顶梢专路
    // 下垂点头——近景身份读向」），§六远景不保留面——记档不入槽（proxy H² 顶部权重已集中
    // 冠顶运动）。相位 hash 103.719/4.2 与 81.447/6.8、高度锚 1/16.5=0.06061 逐数同源；
    // sway 相位-高度耦合系数（近景 1.2 vs proxy 固定 1.4）= proxy 公式结构性简化记档。
    // 冠色 0x6b8273 = 针叶构造色 sun/shade 严格中点（三处同源之一，default 覆写行同值）。
    wind: { heightScale: 0.06061, swayPhaseK: 103.719, swayPhaseC: 4.2, swayAmplitude: 0.025, swayFrequency: 2.1991, flutterPhaseK: 81.447, flutterPhaseC: 6.8, flutterAmplitude: 0.05, flutterFrequencyBase: 15.0796, flutterFrequencySpan: 0 },
    crownColor: 0x6b8273,
    trunkColor: 0x555049,
    variation: { hueCold: [0.95, 1.0, 1.02], hueWarm: [1.05, 1.03, 0.92], hueK: 5.913, hueC: 0.23, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.719, lumaC: 0.57, transBase: 0.55, transSpan: 0.45, transK: 9.117, transC: 0.47, transColor: [0.6, 0.92, 0.46], transPeak: 0.38 },
  },
  asset_tree_metasequoia: {
    // conifer 转正例行（T012.2 Step 3c——逐数转录 metasequoiaMaterials METASEQUOIA_WIND /
    // NEEDLE_HEAD / TRANSLUCENCY，drift-lock 见 broadleafCanopyMaterials.test）：风动**两成分
    // → 两槽直录**（vs cedrus 三成分退化映射——水杉无顶梢成分〔windLeader* 零占位，leader
    // 通直无点头——族内可选·雪松消费位〕，无需退化记档）：sway 槽 = 成分① 整冠低频小幅摆
    //（windTierFrequency 0.32Hz = 2.0106 rad/s × windTierAmplitude 0.018m——密尖塔冠 + 通直
    // 骨干）；flutter 槽 = 成分② 末级羽枝高频细颤主成分（windFringeFrequency 2.6Hz =
    // 16.3363 rad/s——family 快颤链 9–23 内带 × windFringeAmplitude 0.055m，常频率——span 0
    // = 水杉快颤无相位调频项，canopy 公式 0 系数退化逐位一致〔与 cedrus 同型〕）。相位 hash
    // 107.317/5.7 与 84.931/7.9（与先例相位流去相关）、高度锚 1/20 = 0.05（GLSL 注入
    // 0.05000 五位小数口径 = METASEQUOIA_TREE_HEIGHT_NOMINAL slot-0 totalHeight 同源）
    // 逐数同源；sway 相位-高度耦合系数（近景 1.2 vs proxy 固定 1.4）= proxy 公式结构性简化
    // 记档（与 cedrus 同位）。冠色 0x8ab65a = 羽卡构造色 default 行（= needleColorSun——
    // 阳端锚定，三处同源之一：meta swatch ↔ 羽卡构造色 ↔ CROWN_PRESETS default 行）；皮色
    // 0x7a5138 = 皮构造色（红褐-桂皮棕 barkBaseColor）。
    wind: { heightScale: 0.05, swayPhaseK: 107.317, swayPhaseC: 5.7, swayAmplitude: 0.018, swayFrequency: 2.0106, flutterPhaseK: 84.931, flutterPhaseC: 7.9, flutterAmplitude: 0.055, flutterFrequencyBase: 16.3363, flutterFrequencySpan: 0 },
    crownColor: 0x8ab65a,
    trunkColor: 0x7a5138,
    variation: { hueCold: [0.97, 1.0, 1.02], hueWarm: [1.04, 1.03, 0.94], hueK: 5.917, hueC: 0.27, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.613, lumaC: 0.53, transBase: 0.55, transSpan: 0.45, transK: 9.317, transC: 0.43, transColor: [0.72, 0.94, 0.38], transPeak: 0.46 },
  },
  asset_tree_juniperus: {
    // conifer 第三例行（T012.3 Step 3c——逐数转录 juniperusMaterials JUNIPERUS_WIND /
    // NEEDLE_HEAD / TRANSLUCENCY，drift-lock 见 broadleafCanopyMaterials.test）：风动
    // **两成分直录两槽**（同 metasequoia——圆柏无顶梢成分〔windLeader* 零占位，主干
    // 通直无点头第三例〕，无需退化记档）：sway 槽 = 成分① 整冠低频小幅摆**主成分**
    //（windTierFrequency 0.30Hz = 1.8850 rad/s × windTierAmplitude 0.022m——密实圆柱/
    // 卵圆质量冠读向）；flutter 槽 = 成分② 末级鳞枝细幅微颤（windFringeFrequency
    // 1.9Hz = 11.9381 rad/s——family 快颤链 9–23 内带 × windFringeAmplitude 0.018m，
    // 幅度频率均低于水杉羽状〔硬质密质读向〕，常频率——span 0 = 圆柏快颤无相位调频项，
    // canopy 公式 0 系数退化逐位一致〔与 cedrus/metasequoia 同型〕）。相位 hash
    // 111.413/6.3 与 88.523/8.4（与先例相位流去相关）、高度锚 1/8 = 0.125（GLSL 注入
    // 0.12500 五位小数口径 = JUNIPERUS_TREE_HEIGHT_NOMINAL slot-0 totalHeight 8 同源
    //——6–10m 级锚同步轮）逐数同源；sway 相位-高度耦合系数（近景 1.2 vs proxy 固定
    // 1.4）= proxy 公式结构性简化记档（与两先例同位）。冠色 0x4a5d47 = 绳卡构造色
    // needleColorSun 0x64785e / needleColorShade 0x2f4230 **严格中点**（cedrus 常绿
    // 构造中点式——三处同源之一：meta presets swatch #4a5d47 ↔ juniperusMaterials
    // 绳卡构造色 ↔ CROWN_PRESETS default 行；覆写值 = 物种表同值，default 命中与未
    // 命中行为逐位一致）；皮色 0x595955 = 皮构造色（barkBaseColor 深灰——FRPS「树皮
    // 深灰色，纵裂，成条片开裂」第 16 语言基调）。
    wind: { heightScale: 0.125, swayPhaseK: 111.413, swayPhaseC: 6.3, swayAmplitude: 0.022, swayFrequency: 1.885, flutterPhaseK: 88.523, flutterPhaseC: 8.4, flutterAmplitude: 0.018, flutterFrequencyBase: 11.9381, flutterFrequencySpan: 0 },
    crownColor: 0x4a5d47,
    trunkColor: 0x595955,
    variation: { hueCold: [0.96, 1.0, 1.03], hueWarm: [1.04, 1.03, 0.94], hueK: 5.913, hueC: 0.23, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.719, lumaC: 0.57, transBase: 0.55, transSpan: 0.45, transK: 9.117, transC: 0.47, transColor: [0.42, 0.7, 0.48], transPeak: 0.28 },
  },
  asset_tree_bungeana: {
    // conifer 第四例行（T012.4 Step 3c——逐数转录 bungeanaMaterials BUNGEANA_WIND /
    // needleHead / NEEDLE_TRANSLUCENCY，drift-lock 见 broadleafCanopyMaterials.test）：
    // 风动**两成分直录两槽**（同 metasequoia/juniperus——白皮松无顶梢成分〔windLeader*
    // 零占位，主干直立刚硬无点头第三例〕，无需退化记档）：sway 槽 = 成分① 整冠低频
    // 慢摆（windTierFrequency 0.30Hz = 1.8850 rad/s × windTierAmplitude 0.02m——细长
    // 斜展枝整冠质量体读向）；flutter 槽 = 成分② 末级枝/束高频小幅颤
    //（windFringeFrequency 2.4Hz = 15.0796 rad/s——family 快颤链 9–23 内带 ×
    // windFringeAmplitude 0.014m，**频 > 圆柏鳞枝 1.9Hz / 幅 < 其 0.018——硬针束
    // 惯量小读向**，常频率——span 0 = 白皮松快颤无相位调频项，canopy 公式 0 系数
    // 退化逐位一致〔与三先例同型〕）。相位 hash 95.137/5.7 与 72.311/7.9（与先例
    // 相位流去相关）、高度锚 1/11.5 = 0.08696（GLSL 注入 0.08696 五位小数口径 =
    // BUNGEANA_TREE_HEIGHT_NOMINAL slot-0 totalHeight 11.5 同源——锚同步轮 11–12m
    // 域）逐数同源；sway 相位-高度耦合系数（近景 1.2 vs proxy 固定 1.4）= proxy
    // 公式结构性简化记档（与三先例同位）。冠色 0x606d47 = 束卡构造色 needleColorSun
    // 0x77864f / needleColorShade 0x49543e **严格中点**（cedrus/juniperus 常绿构造
    // 中点式第三例——三处同源之一：meta presets swatch #606d47 ↔ bungeanaMaterials
    // 束卡构造色 ↔ CROWN_PRESETS default 行；覆写值 = 物种表同值，default 命中与
    // 未命中行为逐位一致）；皮色 0x6f675c = 皮构造色（barkBaseColor 灰褐——第 17
    // 语言白基调多色斑驳的次要色带基面，远景剪影白干读向归光照非基色）。
    wind: { heightScale: 0.08696, swayPhaseK: 95.137, swayPhaseC: 5.7, swayAmplitude: 0.02, swayFrequency: 1.885, flutterPhaseK: 72.311, flutterPhaseC: 7.9, flutterAmplitude: 0.014, flutterFrequencyBase: 15.0796, flutterFrequencySpan: 0 },
    crownColor: 0x606d47,
    trunkColor: 0x6f675c,
    variation: { hueCold: [0.96, 1.0, 1.03], hueWarm: [1.05, 1.04, 0.93], hueK: 5.913, hueC: 0.23, lumaBase: 0.92, lumaSpan: 0.16, lumaK: 3.719, lumaC: 0.57, transBase: 0.55, transSpan: 0.45, transK: 9.117, transC: 0.47, transColor: [0.54, 0.82, 0.42], transPeak: 0.42 },
  },
};

/** canopy 材质可用树种 assetId 清单（与几何面接入表同序；接线 / 测试枚举面） */
export const BROADLEAF_CANOPY_MATERIAL_ASSET_IDS: readonly string[] = Object.keys(BROADLEAF_CANOPY_MATERIAL_SPECIES);

// ── 种子级冠色覆写表（T024.1，D44 #1——「冠变干不变」推广到远景表示）────────────────

/** 冠色卡覆写行（assetId → preset id → 行；模块私有） */
interface BroadleafCanopyCrownPreset {
  /** 冠卡基调色（= 该卡叶材质构造色——远近同源一致） */
  crownColor: number;
  /** 透射色覆写（可选；进 GLSL 字面量——填充即 card 键随卡分叉 = +1 program 显式选择） */
  transColor?: readonly [number, number, number];
  /** 透射峰值覆写（可选；进 GLSL 字面量——填充即 card 键随卡分叉） */
  transPeak?: number;
}

/**
 * 种子级冠色覆写表（024.1 ginkgo 试点一行 + 024.2 批一/批二已回填 platanus/
 * koelreuteria/sophora/triadica/fraxinus/salix 六行 autumn + 024.3 批二回补
 * tree3a/celtis/zelkova 三行 autumn + bischofia 一行〔Step R 补证 Spec 1.1 秋色
 * 增量后建卡——峰相红-红橙〕——各与该树 *Materials.ts 叶卡表 autumn 基调
 * **同源同值**；fraxinus/salix/bischofia 行经 024.2/024.3 Step R 补证 Spec 1.1
 * 增量〔秋色单面〕后建卡）。
 * 未命中 = 现行物种表行为逐位一致；干柱色/风动/变奏参数不随卡。transColor/transPeak
 * 为透射覆写预留位——**至今无填充**（与各树叶材质透射字面量冻结口径一致：近景叶透射
 * 不随卡则远景冠透射亦不随卡，否则近远景背光观感背离；填充时走 GLSL 字面量分叉
 * + card 键 `:${preset}` 后缀，program 增量为显式选择）。
 */
export const BROADLEAF_CANOPY_CROWN_PRESETS: Readonly<
  Record<string, Readonly<Record<string, Readonly<BroadleafCanopyCrownPreset>>>>
> = {
  asset_tree_ginkgo: {
    autumn: {
      // 秋·金黄冠卡（Spec §6 五源交叉：FRPS「秋季落叶前变为黄色」/ FOC "bright yellow" /
      // Wikipedia "deep saffron yellow" / OSU "bright yellow to gold" / NC "golden yellow" +
      // fall 样木「≈90%+ 纯金黄、<10% 残绿、无橙红混入」[1][2][4][5][6][7]）——与
      // ginkgoMaterials GINKGO_LEAF_PRESETS.autumn 基调**同源同值**（#d4b737：hue ≈48.9°
      // 金黄、R−G 29 不入橙红、亮度 > 夏相——推导见该表注释）：远景冠色块与近景叶基调
      // 一致是档间身份一致的色面；远景不随卡会破所见即所得（秋银杏拉远变绿）。
      crownColor: 0xd4b737,
    },
  },
  asset_tree_platanus: {
    autumn: {
      // 秋·黄褐冠卡（NC "Fall color yellow-brown" Verified [7] + form-c 黄褐秋末相第三眼
      // 判读——Spec §6 终审记档 6 补强；观感平庸黄褐读向）——与 platanusMaterials
      // PLATANUS_LEAF_PRESETS.autumn 基调**同源同值**（#a88a44：hue ≈42° 黄褐、R−G 30
      // 入褐向、G−B 70 中弱黄向、亮度 ≈139 暗于银杏秋金——推导见该表注释）。
      crownColor: 0xa88a44,
    },
  },
  asset_tree_koelreuteria: {
    autumn: {
      // 秋·金黄冠卡（NC "almost transparent yellow in fall" / "clear, golden yellow" [9] +
      // wiki "green turns yellow in fall" [8]——亮端读向、更亮更淡于银杏）——与
      // koelreuteriaMaterials KOE_LEAF_PRESETS.autumn 基调**同源同值**（#d0bc46：
      // hue ≈51.3° 淡金黄、R−G 20 不入橙、亮度 ≈181 亮于银杏 #d4b737——推导见该表注释）。
      crownColor: 0xd0bc46,
    },
  },
  asset_tree_sophora: {
    autumn: {
      // 秋·金黄冠卡（NC "fall color Gold/Yellow, short-lived" Verified [4]——单源权威，
      // 024.2 立项裁定建卡；Gold 深于栾一档）——与 sophoraMaterials SOPHORA_LEAF_PRESETS.
      // autumn 基调**同源同值**（#c4a83a：hue ≈47.8° 金黄、R−G 28、G−B 110、亮度 ≈164
      // 深于栾 #d0bc46——推导见该表注释）。
      crownColor: 0xc4a83a,
    },
  },
  asset_tree_triadica: {
    autumn: {
      // 秋·绯红冠卡（NC "turn an attractive bright red in the fall" + 色域 Red/Burgundy
      // Verified [5] + wiki "bright yellows, oranges, purples and reds" [6] + autumn-a
      // 红族 ~55–60% 主导色占比 Inferred [7]——多色并存/垂直分带不可表达记档）——与
      // triadicaMaterials TRIADICA_LEAF_PRESETS.autumn 基调**同源同值**（#c65e3e：
      // hue ≈14.1° 猩红-红橙、R−G 104 强红向、亮度 ≈121——推导见该表注释）。
      crownColor: 0xc65e3e,
    },
  },
  asset_tree_fraxinus: {
    autumn: {
      // 秋·金黄冠卡（Spec 1.1 增量节：百度百科「秋叶金黄」定性 [13] + autumn-b 张家口
      // 金黄 hue 40–60° 直证 [15] + form-b/c 韩国早秋黄化 [12]——主相金黄 45–55°、
      // 中饱和中-中亮；盛末褐黄 25–45° 末端不入主相记档）——与 fraxinusMaterials
      // FRAXINUS_LEAF_PRESETS.autumn 基调**同源同值**（#c8af3c：hue ≈49.3° 金黄、
      // R−G 25 不入橙、G−B 115、亮度 ≈169.4 亮半档于 sophora 秋金 #c4a83a——推导见
      // 该表注释）。
      crownColor: 0xc8af3c,
    },
  },
  asset_tree_salix: {
    autumn: {
      // 秋·黄绿冠卡（Spec 1.1 增量节：NC "greenish-yellow or sometimes golden yellow"
      // [7] 主相黄绿——"sometimes golden yellow" 弱频度无照片直证不采 + 长江三点
      // 11 月末 95%+ 绿零星黄绿 75–85° [9]——弱秋色晚相变体记档）——与 salixMaterials
      // SALIX_LEAF_PRESETS.autumn 基调**同源同值**（#789632：hue ≈78.0° 黄绿、R<G
      // 绿向主导、G−B 100、亮度 ≈129.6 亮于夏相——推导见该表注释）。
      crownColor: 0x789632,
    },
  },
  asset_tree_3a: {
    autumn: {
      // 秋·黄褐（russet）冠卡（Spec §5「秋季叶色：转黄褐色后脱落」Verified [3]（Forestry
      // England）+ §6「秋黄褐（季节联动）」Verified [3][6] + form-b 老树秋色整树照 [6]
      // 沉稳暗端读向）——与 tree3aMaterials TREE3A_LEAF_PRESETS.autumn 基调**同源同值**
      //（#99792b：hue ≈42.5° 黄褐、R−G 32 入褐向、G−B 78、亮度 ≈121.7 暗于 platanus
      // 秋黄褐 #a88a44 一档——推导见该表注释）。
      crownColor: 0x99792b,
    },
  },
  asset_tree_celtis: {
    autumn: {
      // 秋·黄冠卡（Spec §6「秋黄至橙色（OSU "yellow leaf fall color" + 温州秋色照片
      // 黄橙棕）后脱落」Verified [5][6]——黄主相读向，橙端不入基色）——与 celtisMaterials
      // CELTIS_LEAF_PRESETS.autumn 基调**同源同值**（#b89c38：hue ≈46.9° 黄主相、R−G 28
      // 不入橙红、G−B 100、亮度 ≈153 亮于 platanus 黄褐、深于 sophora 秋金 #c4a83a 一档
      // ——推导见该表注释）。
      crownColor: 0xb89c38,
    },
  },
  asset_tree_zelkova: {
    autumn: {
      // 秋·橙-铜橙冠卡（Spec §6「秋色联动：OSU 秋色变幅宽——黄、黄/橙铜、橙、红、红紫 +
      // 11 月双样木主体橙-橙红 60–70% + 色系以橙-铜橙-红为主，非朴树的黄-橙」Verified
      // [7][8]——主相橙-铜橙读向）——与 zelkovaMaterials ZELKOVA_LEAF_PRESETS.autumn 基调
      // **同源同值**（#c4804a：hue ≈26.6° 橙-铜橙、R−G 68 强橙向、G−B 54、亮度 ≈142——
      // 推导见该表注释；变幅宽/残绿不可表达记档同源）。
      crownColor: 0xc4804a,
    },
  },
  asset_tree_bischofia: {
    autumn: {
      // 秋·红-红橙冠卡（Spec @1.1 增量节主相读向裁决：红相（红-红橙）为园艺/期刊主流
      // 峰值读向——[8]《浙江农林大学学报》2014 表 4「红」+ 时序窗口「11月中旬-12月上旬」
      // + [9] 百度百科园艺「秋叶转红，艳丽夺目」+ [10] 浦东发布「转变为红色」+ [11] 江苏网
      // 「红橙明艳」四源 Verified + iNat [12] autumn-c/c2 杭州 12-07 双帧红相直证；
      // 1.0 照片「黄主导」重定位为 11 月中旬变色中段过渡态不作卡基调）——与
      // bischofiaMaterials BISCHOFIA_LEAF_PRESETS.autumn 基调**同源同值**（#c57551：
      // hue ≈18.6° 红橙端、R−G 80、G−B 36、亮度 ≈136.8 中亮；与乌桕猩红 #c65e3e 三轴
      // 分离〔hue/R−G/亮度〕——推导见该表注释；个体差异/内膛滞绿/黄绿过渡不可表达
      // 记档同源）。
      crownColor: 0xc57551,
    },
  },
  asset_tree_cedrus: {
    default: {
      // 雪松 default 冠卡（T012.1 Step 3a 先锁色，Step 3c 物种表行已回填——drift-lock
      // 测试随之覆盖 cedrus；default 覆写值 = 物种表 crownColor 同值 0x6b8273，命中与
      // 未命中行为逐位一致）：常绿 default 单卡终态：FRPS「终年常绿」+ NC evergreen 无
      // 秋色字段〔阴性〕+ 冬季三点照片直证，全年叶色稳定无季相卡）。冠色 = 灰绿-蓝绿
      // 中调（Spec §5 叶色身份）**三处同源**之一（cedrusMaterials 针叶构造色 sun
      // 0x9db3a6 / shade 0x39503f 严格中点 ↔ meta presets swatch #6b8273 ↔ 本行——
      // 合并阶段自工程初值 0x6b8a72 ΔG 8 回写，T024 swatch = 叶构造色同源纪律）。
      crownColor: 0x6b8273,
    },
  },
  asset_tree_metasequoia: {
    default: {
      // 水杉 default 冠卡（T012.2 Step 3a 先锁色——沿 cedrus inert 锚先例；**物种表行
      // 随 metasequoiaMaterials 合并阶段落地回填**，drift-lock 测试随之覆盖）：主语境
      // 9 月末**亮黄绿**（Spec §5.2 s04 Pisa 2024-09-30 Observed 实证 + FoC
      // "yellowish green" Verified——default 卡时点锚）。冠色 0x8ab65a = **三处同源**
      // 之一（meta presets swatch #8ab65a ↔ metasequoiaMaterials 羽卡构造色中心〔3b
      // 对齐，冻结接口〕↔ 本行——swatch = needleColorSun 同值亮黄绿端中心，T024 纪律）。
      crownColor: 0x8ab65a,
    },
    autumn: {
      // 水杉 autumn 冠卡（落叶杉类秋相——012.2 待裁决位 4 + Spec §5.2 四源：FoC
      // "turning orange or red" / MoBot "red-bronze" / NC "brownish copper" / Wiki
      // "foxy reddish brown" 措辞中值偏红褐 + s10 10-26 锈橙/琥珀约半 Observed〔峰值
      // 转色中、顶部先染、冠仍满〕）。冠色 0xa55d2c = 锈橙 0xc07632 × 红褐 0x8b4526
      // 中值（hue ≈22° 锈橙红褐、暗于 zelkova 橙铜 / triadica 绯红的秋末深调）——与
      // metasequoiaMaterials autumn 卡基调**同源同值**（远景冠色块与近景羽卡基调一致
      // = 档间身份一致的色面；远景不随卡会破所见即所得）。
      crownColor: 0xa55d2c,
    },
  },
  asset_tree_juniperus: {
    default: {
      // 圆柏 default 冠卡（T012.3 Step 3a 先锁色——沿 cedrus 常绿单卡 inert 锚先例；
      // **物种表行随 3c 合并阶段落地回填**〔沿 cedrus/metasequoia 接线先例〕，
      // drift-lock 测试随之覆盖）：常绿 default 单卡终态（012.3 待裁决位 4——常绿
      // 无季相证据不建卡：FRPS/FoC/NC 三源无秋色语句〔阴性〕+「deep green」全年稳定
      // 〔NC Verified〕）。冠色 0x4a5d47 = **深绿-暗绿带灰蓝霜调**（Spec §5.1
      // Verified+Observed——「密实无层冠体 + 深绿-蓝绿灰色调」远景第一读向）=
      // needleColorSun 0x64785e / needleColorShade 0x2f4230 **严格中点**（cedrus
      // 常绿构造中点式——阳灰绿亮/荫深绿暗受光 ramp 的中距积分读向）——**三处同源**
      // 之一（meta presets swatch #4a5d47 ↔ juniperusMaterials 绳卡构造色 0x4a5d47
      // 〔3b 已同值交付〕↔ 本行，T024 纪律）。
      crownColor: 0x4a5d47,
    },
  },
  asset_tree_bungeana: {
    default: {
      // 白皮松 default 冠卡（T012.4 Step 3a 先锁色——沿 cedrus/juniperus 常绿单卡
      // inert 锚先例；**物种表行已随 3c 合并阶段回填**〔沿 cedrus/metasequoia/
      // juniperus 接线先例〕，drift-lock 测试随之覆盖）：常绿 default 单卡终态
      //（012.4 待裁决位 4——常绿无季相证据不建卡：FRPS/FoC/NC 三源无秋色语句
      // 〔阴性〕+ 深绿-中绿带黄绿/灰绿全年稳定〔NC Verified + 照片 Observed〕）。
      // 冠色 0x606d47 = **深绿-中绿带黄绿调**（Spec §5.2——「疏散半透光冠体 +
      // 黄绿-灰绿域」远景第一读向）= needleColorSun 0x77864f / needleColorShade
      // 0x49543e **严格中点**（cedrus/juniperus 常绿构造中点式第三例——阳黄绿亮/
      // 阴灰绿暗受光 ramp 的中距积分读向）——**三处同源**之一（meta presets
      // swatch #606d47 ↔ bungeanaMaterials 束卡构造色 0x606d47〔3b 已同值交付——
      // 对账一致〕↔ 本行，T024 纪律）。
      crownColor: 0x606d47,
    },
  },
};

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
 * 主渲染同相）。未知 assetId 即抛（可用清单见错误信息）。Runtime 接线已由 021.7 落位
 * （CanopySourceCache）；所有权随调用移交调用方（Source/Cache 拥有释放，Pool 只挂引用
 * ——D41 §10.3）。
 * 可选尾参（T024.1，向后兼容）：preset = 色卡 id——查 BROADLEAF_CANOPY_CROWN_PRESETS
 * 覆写冠卡基调色（构造色通道，program 不增；干柱色/风动/变奏参数不随卡；未命中 = 物种
 * 表行为逐位一致）；uTime = 外部注入的共享时间对象（缺省工厂自建；提供时三材质统一
 * 绑定该对象——成套契约窄化为「uTime 引用同源」）。
 */
export function createBroadleafCanopyMaterials(
  assetId: string,
  preset?: string,
  uTime?: { value: number },
): BroadleafCanopyMaterialSet {
  const spec = BROADLEAF_CANOPY_MATERIAL_SPECIES[assetId];
  if (!spec) {
    throw new Error(`BroadleafCanopyProxy 材质无此树种接入: ${assetId}（可用: ${BROADLEAF_CANOPY_MATERIAL_ASSET_IDS.join(', ')}）`);
  }
  // 冠色卡覆写（T024.1）：未命中（缺省/'default'/无行树种/未知 id）= undefined = 物种表行为
  const crownOverride = preset === undefined ? undefined : BROADLEAF_CANOPY_CROWN_PRESETS[assetId]?.[preset];
  // 透射覆写（预留位消费——024.1 无填充）：字面量进 GLSL ⇒ 键随卡分叉（+1 program 显式选择）
  let cardVariation: BroadleafCanopyVariationSpec = spec.variation;
  let cardKeySuffix = '';
  if (crownOverride?.transColor !== undefined || crownOverride?.transPeak !== undefined) {
    cardVariation = { ...spec.variation };
    if (crownOverride?.transColor !== undefined) cardVariation.transColor = crownOverride.transColor;
    if (crownOverride?.transPeak !== undefined) cardVariation.transPeak = crownOverride.transPeak;
    cardKeySuffix = `:${preset}`;
  }
  const uTimeShared = uTime ?? { value: 0 }; // 缺省自建（现行行为）；注入 = 三材质同源同帧

  // ── 干柱（组 0）：树种皮色 + 整树缓摆（远景剪影读向——纹理细节观距不可辨，§六不保留近景树皮）──
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: spec.trunkColor, // 干柱色不随卡（冠变干不变）
    metalness: 0,
    roughness: 0.93,
    side: THREE.FrontSide,
  });
  (trunkMaterial as TimeBridgedMaterial).uniforms = { uTime: uTimeShared }; // 材质级（TimeUniformService 扫描面）
  trunkMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTimeShared; // 同一对象引用——服务写一次两边生效
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
  applyTreeFadeDither(trunkMaterial, { mirrored: true }); // T021.3 dither fade（incoming 镜像侧——aFadeOut 缺省 0 = 行为逐位不变；深度材质不注入：阴影走中点切换）

  // ── 冠卡（组 1）：冠色（随卡覆写——远景所见即所得）+ aCrownQ 内外明暗 + aLeafRand 变奏 + 透光微扰 + 风动 ──
  const cardMaterial = new THREE.MeshStandardMaterial({
    color: crownOverride !== undefined ? crownOverride.crownColor : spec.crownColor, // 色卡覆写走构造色（program 不增）
    metalness: 0,
    roughness: 0.85,
    side: THREE.DoubleSide, // 卡面水平法线双面读向（几何面契约建议）
  });
  (cardMaterial as TimeBridgedMaterial).uniforms = { uTime: uTimeShared };
  cardMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTimeShared;
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
${canopyCardBodyGlsl(cardVariation)}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <opaque_fragment>',
      `${canopyTransmissionGlsl(cardVariation)}
#include <opaque_fragment>`,
    );
  };
  // 键后缀仅在透射覆写（GLSL 字面量分叉）时出现——crownColor 走构造色不分键（program 不增）
  cardMaterial.customProgramCacheKey = () => `canopy:card:${assetId}${cardKeySuffix}`;
  applyTreeFadeDither(cardMaterial, { mirrored: true }); // T021.3 dither fade（incoming 镜像侧——与树种 direct 侧同屏精确互补，模块头注推导）

  // ── 深度（customDepthMaterial）：轮廓-only 无 SDF + 风摆同相（干柱 / 冠卡两共用一）──
  const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    side: THREE.DoubleSide, // 卡面双面投影（影 pass 侧向由 shadowMap 按主材质覆写，此处显式对齐）
  });
  depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTimeShared; // 共享对象——服务写主材质即深度程序同帧（成套消费契约）
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
