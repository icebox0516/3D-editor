/**
 * runtime/procedural/materials/facilityMaterials —— 设施资产 shader 级程序化材质（T002.4 阶段二）。
 *
 * 技术路线：纯 onBeforeCompile 注入（L2）——MeshStandardMaterial 不换血，保留
 *   InstancedMesh 合批（instanceMatrix）、instanceColor 变体乘算（three r186 通路：
 *   fragment 侧 instancingColor → define USE_COLOR → <color_fragment> 的 diffuse × vColor）、
 *   内建 PBR 光照/阴影/雾/色调映射。零纹理资源（无 DataTexture/map），材质 dispose
 *   无遗留可释放物；零 uniform（配方常量烘进 GLSL），渲染循环零额外开销。
 *
 * 注入结构（静态确定性：同 uv 同输出，无时间动画）：
 *   - material.defines.USE_UV 打开 three 内建 vUv 通路（无贴图材质默认不带该 define）；
 *   - 片元 <common> 后追加公共噪声库（facilityGlsl.ts，单一来源）；
 *   - 片元 <map_fragment> 后注入配方主体：计算三个调制量——facColorMul(vec3) /
 *     facRoughDelta(float) / facMetalDelta(float)，只做明度/细节调制，随即乘回
 *     diffuseColor.rgb。注入点位于 <color_fragment> 之前且绝不触碰该 chunk——
 *     vColor 变体乘算链完整，木纹/磨损等细节被色相变体按分量叠加（乘法交换）；
 *   - 片元 <roughnessmap_fragment> / <metalnessmap_fragment> 后把 delta 加回并 clamp；
 *   - 需要区分端面/侧面的配方（旋压件）额外顶点注入物体空间法线 varying vFacNormal
 *     （<beginnormal_vertex> 后取 objectNormal，实例矩阵不影响物体空间属性）。
 *
 * 纹理域契约：部件默认几何展开——Box 每面 uv 0–1（pz 面 v=1 在几何上方），
 *   圆柱 u=环绕一周、v=高度（v=1 在顶端）。配方统一按「v = 长度/高度轴」设计
 *   条纹方向；已知取舍：横长盒件的 ±Y 面条纹方向随 u 轴旋转（如长椅纵梁顶面，
 *   视线不可达，不做轴向检测）。
 *
 * 性能：每配方主体 ≤ 6× hash21 等效成本（≈2 次 vnoise + 若干 hash，无循环/分支/
 *   纹理采样）；customProgramCacheKey 按配方区分（默认键 = onBeforeCompile.toString()
 *   无法区分不同闭包烘进的常量，不写会串 program）——同配方跨资产/跨材质共享
 *   同一 program（底材 color/roughness/metalness 差异走材质 uniform，不占 program）。
 *
 * 边界：工厂每次调用 new 全部材质（所有权随调用移交调用方，ProceduralSourceCache
 *   会 dispose，禁止模块级共享）；注入点缺失即抛错（onBeforeCompile 首次渲染前
 *   暴雷，不留静默失效）；不替换/删除任何原生 chunk（原句保留后追加）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from './facilityGlsl';

/** 设施材质配方：一次 onBeforeCompile 注入的完整描述 */
interface FacilityPattern {
  /** program 缓存键（同配方同键 ⇒ 多材质共享一个编译 program） */
  readonly key: string;
  /** 配方主体：写 facColorMul / facRoughDelta / facMetalDelta（引擎负责声明与回收） */
  readonly body: string;
  /** true = 顶点注入物体空间法线 varying vFacNormal（端面/侧面区分） */
  readonly objectNormal?: boolean;
}

/** 设施材质底材参数（阶段一参数化底材即接口，注入只在其上叠加细节） */
export interface FacilityBaseParams {
  color: THREE.ColorRepresentation;
  metalness: number;
  roughness: number;
}

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`facility 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 把配方注入 MeshStandardMaterial（defines + onBeforeCompile + program 缓存键） */
function injectFacilityPattern(material: THREE.MeshStandardMaterial, pattern: FacilityPattern): THREE.MeshStandardMaterial {
  material.defines = { USE_UV: '' }; // 无贴图材质默认无 USE_UV —— 程序化采样需显式打开 vUv 通路
  material.onBeforeCompile = (shader) => {
    const prefix = `// facility-pattern:${pattern.key}\n${pattern.objectNormal ? 'varying vec3 vFacNormal;\n' : ''}${FACILITY_GLSL_NOISE}`;
    shader.fragmentShader = replaceOnce(shader.fragmentShader, '#include <common>', `#include <common>\n${prefix}`);
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
// facility-pattern:${pattern.key} (luminance/detail modulation only; native color chunk untouched)
vec3 facColorMul = vec3(1.0);
float facRoughDelta = 0.0;
float facMetalDelta = 0.0;
{
${pattern.body}
}
diffuseColor.rgb *= facColorMul;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + facRoughDelta, 0.05, 1.0);`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <metalnessmap_fragment>',
      `#include <metalnessmap_fragment>
metalnessFactor = clamp(metalnessFactor + facMetalDelta, 0.0, 1.0);`,
    );
    if (pattern.objectNormal) {
      shader.vertexShader = replaceOnce(shader.vertexShader, '#include <common>', '#include <common>\nvarying vec3 vFacNormal;');
      shader.vertexShader = replaceOnce(
        shader.vertexShader,
        '#include <beginnormal_vertex>',
        '#include <beginnormal_vertex>\nvFacNormal = objectNormal;',
      );
    }
  };
  material.customProgramCacheKey = () => `facility:${pattern.key}`; // 默认键无法区分闭包常量，必写防串 program
  return material;
}

// ── 配方（GLSL 域：vUv；物体法线配方另有 vFacNormal）──────────────

/** 木板条（长椅）：v 轴年轮环带（fbm 域扭曲）+ 沿 u 纤维细条 + 板间色差（板 uv 烘偏移错域） */
const PATTERN_WOOD: FacilityPattern = {
  key: 'wood-slats',
  body: /* glsl */ `
// growth rings across v (fbm-warped) + fiber streaks along u; per-slat tint via asset-baked uv shift
float facWoodWarp = facFbm2(vUv * vec2(2.1, 1.4)) * 1.4 + facVnoise(vec2(vUv.x * 2.4, 5.2)) * 1.1;
float facWoodRingTri = abs(fract(vUv.y * 9.0 + facWoodWarp) * 2.0 - 1.0);
float facWoodRing = 0.68 + 0.32 * facWoodRingTri * facWoodRingTri;
float facWoodFiber = facVnoise(vec2(vUv.x * 7.0, vUv.y * 96.0));
float facWoodTint = facVnoise(vUv * 0.8 + vec2(13.7, 4.1));
facColorMul = facWoodRing * (0.96 + 0.08 * facWoodFiber) * mix(vec3(0.90, 0.84, 0.78), vec3(1.10, 1.04, 0.94), facWoodTint);
facRoughDelta = (1.0 - facWoodRing) * 0.09 + (facWoodFiber - 0.5) * 0.07;`,
};

/** 杆件金属（路灯/标识牌）：沿长度（v）各向异性拉丝糙度条纹 + 微磨砂颗粒 */
const PATTERN_POLE_METAL: FacilityPattern = {
  key: 'metal-brush-pole',
  body: /* glsl */ `
// brushed metal: anisotropic roughness streaks along the length axis (v) + micro matte grain
float facBrushLine = facVnoise(vec2(vUv.x * 72.0, vUv.y * 2.2));
float facBrushMicro = facHash21(vUv * 613.0);
facColorMul = vec3(0.985 + 0.03 * (facBrushLine - 0.5) + 0.02 * (facBrushMicro - 0.5));
facRoughDelta = (facBrushLine - 0.5) * 0.16 + (facBrushMicro - 0.5) * 0.05;`,
};

/** 框架金属（长椅腿架）：拉丝 + 面缘窄带磨损（噪声破碎斑 → 微提亮降糙，棱线常被磨蹭） */
const PATTERN_FRAME_METAL_WORN: FacilityPattern = {
  key: 'metal-brush-worn',
  body: /* glsl */ `
// brushed frame metal + rubbed edges: uv-edge band gated by broken noise -> brighter, lower roughness
float facBrushLine = facVnoise(vec2(vUv.x * 72.0, vUv.y * 2.2));
float facBrushMicro = facHash21(vUv * 613.0);
float facWearEdgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
float facWear = (1.0 - smoothstep(0.015, 0.09, facWearEdgeDist)) * smoothstep(0.36, 0.74, facVnoise(vUv * vec2(23.0, 46.0)));
facColorMul = vec3(0.985 + 0.03 * (facBrushLine - 0.5) + 0.02 * (facBrushMicro - 0.5) + facWear * 0.14);
facRoughDelta = (facBrushLine - 0.5) * 0.14 + (facBrushMicro - 0.5) * 0.05 - facWear * 0.18;`,
};

/** 桶身金属漆（垃圾桶）：漆面斑驳 + 竖向使用划痕（露亮金属）+ v 缘接触暗带（竖棱/桶沿 AO 感） */
const PATTERN_BIN_SHELL: FacilityPattern = {
  key: 'paint-bin-shell',
  body: /* glsl */ `
// painted shell: mottled paint + vertical usage scratches (exposed bright metal) + contact dark band at v rims
float facPatch = facFbm2(vUv * vec2(3.2, 1.9));
float facScratch = smoothstep(0.66, 0.9, facVnoise(vec2(vUv.x * 46.0, vUv.y * 3.4)));
float facContact = (1.0 - smoothstep(0.0, 0.14, min(vUv.y, 1.0 - vUv.y))) * 0.2;
facColorMul = vec3((0.92 + 0.16 * facPatch + facScratch * 0.3) * (1.0 - facContact));
facRoughDelta = (facPatch - 0.5) * 0.16 - facScratch * 0.12 + facContact * 0.3;`,
};

/** 旋压盖件金属（垃圾桶盖）：侧面环向细纹；端面（|ny|≈1）径向同心环——车削纹理 */
const PATTERN_LID_LATHE: FacilityPattern = {
  key: 'metal-lathe-lid',
  objectNormal: true,
  body: /* glsl */ `
// lathe-turned lid: circumferential lines on the side; concentric rings on end caps (object-normal gated)
float facLatheSide = facVnoise(vec2(vUv.x * 2.6, vUv.y * 64.0));
float facLatheCap = facVnoise(vec2(length(vUv - 0.5) * 80.0, 3.7));
float facLathe = mix(facLatheSide, facLatheCap, step(0.8, abs(vFacNormal.y)));
float facLatheMicro = facHash21(vUv * 631.0);
facColorMul = vec3(0.99 + 0.06 * (facLathe - 0.5) + 0.02 * (facLatheMicro - 0.5));
facRoughDelta = (facLathe - 0.5) * 0.15 + (facLatheMicro - 0.5) * 0.05;`,
};

/** 细颗粒（灯壳塑料/投口翻盖板）：橘皮微起伏（中频）+ 白噪微点（高频） */
const PATTERN_FINE_SPECKLE: FacilityPattern = {
  key: 'grain-fine',
  body: /* glsl */ `
// fine grain: orange-peel micro relief (mid freq) + white-noise specks (high freq)
float facPeel = facVnoise(vUv * 90.0);
float facSpeck = facHash21(vUv * 640.0);
facColorMul = vec3(0.985 + 0.03 * (facPeel - 0.5) + 0.02 * (facSpeck - 0.5));
facRoughDelta = (facPeel - 0.5) * 0.1 + (facSpeck - 0.5) * 0.06;`,
};

/** 边缘磨损漆（消防栓红漆）：v 缘（凸筋端面/栓口端面）破碎磨损露暗金属底 + 漆面细颗粒 */
const PATTERN_EDGE_WORN_PAINT: FacilityPattern = {
  key: 'paint-edge-worn',
  body: /* glsl */ `
// painted hydrant: broken wear at v rims (bevel/outlet ends -> dark bare metal, higher metalness) + paint grain
float facPaintEdge = 1.0 - smoothstep(0.02, 0.16, min(vUv.y, 1.0 - vUv.y));
float facPaintWear = facPaintEdge * smoothstep(0.42, 0.72, facFbm2(vUv * vec2(5.0, 11.0)));
float facPaintGrain = facHash21(vUv * 580.0);
facColorMul = vec3((0.93 + 0.07 * facPaintGrain) * (1.0 - facPaintWear * 0.45));
facRoughDelta = (facPaintGrain - 0.5) * 0.07 - facPaintWear * 0.1;
facMetalDelta = facPaintWear * 0.28;`,
};

/** 铸铁（消防栓底座）：粗砂高频颗粒（调糙为主）+ 低频浇铸色斑 */
const PATTERN_CAST_IRON: FacilityPattern = {
  key: 'cast-iron',
  body: /* glsl */ `
// cast iron: coarse sand-grain specks (roughness driven) + low-freq casting mottle
float facSand = facHash21(vUv * 340.0);
float facMottle = facVnoise(vUv * vec2(4.0, 2.6));
facColorMul = vec3(0.9 + 0.1 * facMottle + 0.08 * (facSand - 0.5));
facRoughDelta = (facSand - 0.5) * 0.22 + (facMottle - 0.5) * 0.1;`,
};

/** 哑光褪色漆（标识牌面）：橘皮颗粒 + 极轻日晒褪色（v 向梯度 + 低频褪色斑） */
const PATTERN_MATTE_PAINT: FacilityPattern = {
  key: 'paint-matte-fade',
  body: /* glsl */ `
// matte paint: orange-peel grain + faint sun-fade gradient along v + low-freq fade patches
float facFade = (vUv.y - 0.5) * 0.07 + (facVnoise(vUv * vec2(2.8, 1.6)) - 0.5) * 0.05;
float facPeel = facVnoise(vUv * vec2(70.0, 40.0));
float facSpeck = facHash21(vUv * 590.0);
facColorMul = (1.0 + facFade) * vec3(0.97 + 0.03 * facPeel + 0.02 * (facSpeck - 0.5));
facRoughDelta = (facPeel - 0.5) * 0.08 + (facSpeck - 0.5) * 0.05;`,
};

// ── 材质工厂（每次调用 new 材质 + 独立注入闭包；配方 key 不变则共享 program）──

/** 长椅木条：底材暖褐 + 木纹配方（板间差异依赖资产侧板条 uv 烘偏移） */
export function createFacilityWoodMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_WOOD);
}

/** 杆件金属（路灯杆/标识牌柱与基座）：底材 + 竖向拉丝配方 */
export function createFacilityPoleMetalMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_POLE_METAL);
}

/** 框架金属（长椅腿架）：底材 + 拉丝带面缘磨损配方 */
export function createFacilityWornFrameMetalMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_FRAME_METAL_WORN);
}

/** 桶身金属漆（垃圾桶身/竖棱）：底材 + 斑驳/划痕/接触暗带配方 */
export function createFacilityBinShellPaintMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_BIN_SHELL);
}

/** 旋压盖件金属（垃圾桶盖沿/凸顶）：底材 + 车削环纹配方（端面/侧面区分） */
export function createFacilityLatheMetalMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_LID_LATHE);
}

/** 细颗粒面（灯壳塑料/投口翻盖板）：底材 + 橘皮微颗粒配方 */
export function createFacilityFineGrainMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_FINE_SPECKLE);
}

/** 边缘磨损漆（消防栓红漆件）：底材 + 凸缘磨损露金属底配方 */
export function createFacilityEdgeWornPaintMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_EDGE_WORN_PAINT);
}

/** 铸铁（消防栓底座）：底材 + 粗砂颗粒配方 */
export function createFacilityCastIronMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_CAST_IRON);
}

/** 哑光褪色漆（标识牌面/指路带）：底材 + 漆颗粒与轻褪色配方 */
export function createFacilityMattePaintMaterial(params: FacilityBaseParams): THREE.MeshStandardMaterial {
  return injectFacilityPattern(new THREE.MeshStandardMaterial(params), PATTERN_MATTE_PAINT);
}
