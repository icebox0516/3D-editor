/**
 * runtime/procedural/materials/plantMaterials —— 植物资产 shader 级程序化材质（T003.4 阶段二）。
 *
 * 技术路线：纯 onBeforeCompile 注入（L2，沿 facilityMaterials T002.4 阶段二范式全套照搬）——
 *   MeshStandardMaterial 不换血，保留 InstancedMesh 合批（instanceMatrix）、instanceColor
 *   变体乘算（hueJitter 通路：fragment 侧 instancingColor → USE_COLOR → <color_fragment>
 *   的 diffuse × vColor）、内建 PBR 光照/阴影/雾/色调映射。零纹理资源（无 DataTexture/map）；
 *   零 uniform（配方常量烘进 GLSL，渲染循环零额外开销）；确定性纯函数（无时间依赖——
 *   风摆等动态属 LOD/动画层职责，不入材质）。
 *
 * 纹理域契约（与几何阶段交付的 uv 契约对齐）：
 *   - 树皮（uv 域）：圆柱 u = 环绕一周、v = 高度（v=1 顶端）——沟脊条纹沿 v 轴；环绕脊数
 *     取整 → u 缝两侧 fract 相位连续（缝上噪声游走仍有一次折角，低边数干面 + 园区视距
 *     下不可辨，已知取舍，同 facility 木纹口径）；
 *   - 叶团/花卉（物体空间位置域）：Icosahedron 的 uv 是球面方位角/仰角域、叠锥是环绕/
 *     高度域——异构 uv 域不吃，统一注入顶点 varying vPlantPos（<begin_vertex> 后取
 *     transformed，实例矩阵不影响物体空间属性；vFacNormal 同模式），噪声域 = 位置的斜切
 *     2D 投影（线性投影必有恒值方向——波长按团径调到远大于该伪影可辨尺度，读作团间色差
 *     而非条纹）。团簇几何天然分离：中频噪声在团心间去相关 → 团间色相/明度差与团内斑块
 *     一噪两用（省一次采样的取舍点），这正是中看体量感的关键。
 *
 * 注入结构：与 facility 同构——片元 <common> 后追加噪声库（import facilityGlsl 单一来源，
 *   复用 2D hash/值噪声，不复制粘贴）；片元 <map_fragment> 后注入配方主体（plantColorMul /
 *   plantRoughDelta / plantMetalDelta，只做明度/细节调制乘回 diffuseColor.rgb），注入点位于
 *   <color_fragment> 之前且绝不触碰该 chunk——vColor 逐实例色相微差乘算链完整，与注入乘法
 *   交换律安全；<roughnessmap_fragment> / <metalnessmap_fragment> 后回收 delta。植物为有机
 *   介质电：配方 metalDelta 恒 0，保留回收语句仅为注入器与 facility 单态对齐。
 *
 * 性能（植物按 10 万实例设计，每像素纪律严于设施）：配方主体 ≤ 6× hash21 等效成本——
 *   树皮 2× facVnoise = 6×；叶团/花卉 1× facVnoise + 1× facHash21 = 4×；无循环/分支/
 *   纹理采样。customProgramCacheKey 按配方区分（默认键 = onBeforeCompile.toString()
 *   无法区分闭包烘进的常量，不写会串 program）。噪声频率按各资产真实尺度（米）烘焙——
 *   橡树团径 ~1.8m / 松树层距 ~1.3m / 灌木团径 ~0.5m / 花卉瓣长 ~0.1m 各自调参 →
 *   配方按资产区分、不跨资产共享（几何尺度差约 20 倍，共享频率必有一头失真；program
 *   按资产收敛，同资产全部实例仍共享单 program）。
 *
 * 边界：工厂每次调用 new 全部材质（所有权随调用移交调用方，ProceduralSourceCache 会
 *   dispose，禁止模块级共享对象）；注入点缺失即抛错（首次渲染前暴雷，不留静默失效）；
 *   不替换/删除任何原生 chunk（原句保留后追加）。PLANT_RECIPES 注册表导出：测试据此
 *   锁成本纪律与键唯一，未来资产按 key 复用配方。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from './facilityGlsl';

/** 植物材质配方：一次 onBeforeCompile 注入的完整描述（注册表 PLANT_RECIPES 供测试与资产复用） */
export interface PlantPattern {
  /** program 缓存键（同配方同键 ⇒ 多材质共享一个编译 program） */
  readonly key: string;
  /** 配方主体：写 plantColorMul / plantRoughDelta / plantMetalDelta（引擎负责声明与回收） */
  readonly body: string;
  /** true = 需要 vUv 域（树皮：圆柱 u=环绕一周、v=高度）——显式打开 USE_UV 通路 */
  readonly uv?: boolean;
  /** true = 注入物体空间位置 varying vPlantPos（叶团/花卉：异构 uv 域不吃，位置域做噪声） */
  readonly objectPosition?: boolean;
}

/** 植物材质底材参数（阶段一参数化底材即接口，注入只在其上叠加细节、不改底参） */
export interface PlantBaseParams {
  color: THREE.ColorRepresentation;
  metalness: number;
  roughness: number;
}

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`plant 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** GLSL float 字面量（toFixed 强制小数点——整数进 GLSL 按 int 参与运算会编译失败） */
const f = (n: number): string => n.toFixed(2);
/** vec3 字面量（三元组 → 三个逗号分隔 float） */
const v3 = (c: readonly [number, number, number]): string => `${f(c[0])}, ${f(c[1])}, ${f(c[2])}`;

/** 把配方注入 MeshStandardMaterial（defines + onBeforeCompile + program 缓存键） */
function injectPlantPattern(material: THREE.MeshStandardMaterial, pattern: PlantPattern): THREE.MeshStandardMaterial {
  if (pattern.uv) material.defines = { USE_UV: '' }; // 无贴图材质默认无 USE_UV —— uv 域配方显式打开 vUv 通路
  material.onBeforeCompile = (shader) => {
    const prefix = `// plant-pattern:${pattern.key}\n${pattern.objectPosition ? 'varying vec3 vPlantPos;\n' : ''}${FACILITY_GLSL_NOISE}`;
    shader.fragmentShader = replaceOnce(shader.fragmentShader, '#include <common>', `#include <common>\n${prefix}`);
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
// plant-pattern:${pattern.key} (luminance/detail modulation only; native color chunk untouched)
vec3 plantColorMul = vec3(1.0);
float plantRoughDelta = 0.0;
float plantMetalDelta = 0.0; // 有机材质全介质电，配方恒 0——保留仅为注入器与 facility 单态对齐
{
${pattern.body}
}
diffuseColor.rgb *= plantColorMul;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + plantRoughDelta, 0.05, 1.0);`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <metalnessmap_fragment>',
      `#include <metalnessmap_fragment>
metalnessFactor = clamp(metalnessFactor + plantMetalDelta, 0.0, 1.0);`,
    );
    if (pattern.objectPosition) {
      shader.vertexShader = replaceOnce(shader.vertexShader, '#include <common>', '#include <common>\nvarying vec3 vPlantPos;');
      shader.vertexShader = replaceOnce(
        shader.vertexShader,
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvPlantPos = transformed;',
      );
    }
  };
  material.customProgramCacheKey = () => `plant:${pattern.key}`; // 默认键无法区分闭包常量，必写防串 program
  return material;
}

// ── 树皮配方（uv 域：u=环绕一周、v=高度——沟脊沿 v 轴；2× facVnoise = 6×）──────────

/** 树皮调参：两树种共用「脊-沟-板」结构、尺度与色调各调（橡树深沟灰褐 / 松树鳞状红褐） */
interface BarkTune {
  /** 环绕脊线数（整数 → u 缝两侧 fract 相位连续；随径粗读作板条/细密幼皮） */
  readonly ridges: number;
  /** 脊线游走域频率（u=环绕、v=高度）与幅度——去平行等距感 */
  readonly warpFreq: readonly [number, number];
  readonly warpAmp: number;
  /** 沟底亮度（越小沟壑越深；橡>松的沟深差） */
  readonly ridgeFloor: number;
  /** 板块斑驳域频率（u,v 各向异性 → 长条板 / 近方鳞） */
  readonly plateFreq: readonly [number, number];
  /** 色斑两端乘子（暗端/亮端——树种底色差异走材质 color，这里只调相对冷暖） */
  readonly dark: readonly [number, number, number];
  readonly light: readonly [number, number, number];
  readonly seed: readonly [number, number];
}

/** 树皮配方：整数脊数纵向沟脊（平方三角波 → 沟底收暗读作沟内 occlusion）+ 低频游走
 *  + 各向异性板块斑驳（明暗摆动 ≤15% 纪律内）。粗端/侧枝同脊数 → 细径上密度更高，
 *  读作幼嫩枝皮（真实树皮规律：越细的枝纹理越密越浅） */
function barkPattern(key: string, tune: BarkTune): PlantPattern {
  return {
    key,
    uv: true,
    body: /* glsl */ `
// vertical ridges/furrows along v: integer ridge count (u-seam phase-continuous), squared tri profile (dark furrow AO), warp wander, plate mottle
float plantBarkWarp = facVnoise(vec2(vUv.x * ${f(tune.warpFreq[0])}, vUv.y * ${f(tune.warpFreq[1])}) + vec2(${f(tune.seed[0])}, ${f(tune.seed[1])}));
float plantBarkRidgeTri = abs(fract(vUv.x * ${f(tune.ridges)} + plantBarkWarp * ${f(tune.warpAmp)}) * 2.0 - 1.0);
float plantBarkRidge = ${f(tune.ridgeFloor)} + ${f(1 - tune.ridgeFloor)} * plantBarkRidgeTri * plantBarkRidgeTri;
float plantBarkPlate = facVnoise(vec2(vUv.x * ${f(tune.plateFreq[0])}, vUv.y * ${f(tune.plateFreq[1])}));
plantColorMul = plantBarkRidge * mix(vec3(${v3(tune.dark)}), vec3(${v3(tune.light)}), plantBarkPlate);
plantRoughDelta = (plantBarkPlate - 0.5) * 0.06 - (plantBarkRidge - 0.8) * 0.05;`,
  };
}

// ── 冠层配方（位置域 vPlantPos；1× facVnoise + 1× facHash21 = 4×）──────────────────

/** 冠层调参：频率按资产团径/层距（米）调——共享频率在 20 倍尺度差下必有一头失真 */
interface CanopyTune {
  /** 位置域投影频率（1/m；波长 ≈ 团心距 → 团间身份差与团内斑块一噪两用） */
  readonly freq: readonly [number, number];
  readonly seed: readonly [number, number];
  /** 色相摆动两端乘子（冷蓝绿 ↔ 暖黄绿；通道幅度 ≤15% 纪律，超过即风格化） */
  readonly hueA: readonly [number, number, number];
  readonly hueB: readonly [number, number, number];
  /** 自遮蔽梯度：冠底乘子与跨度（乘 albedo 伪装 AO）+ 冠层高度带（梯度定义域） */
  readonly shadeLow: number;
  readonly shadeSpan: number;
  readonly yBase: number;
  readonly ySpan: number;
  /** 微斑频率（1/m）与叶面缎面糙度基偏移（阔叶微光泽 / 针叶哑光） */
  readonly microFreq: number;
  readonly sheen: number;
}

/** 冠层配方：单一中频噪声兼作团间身份差与团内斑块（波长 ≈ 团径/团距的取频取舍）；
 *  竖向乘性梯度伪装冠层自遮蔽（树下部叶被上部遮挡，真实树冠底暗顶亮）；高频 hash
 *  微斑打散均匀底色抗「塑料球」感。糙度基偏移给阔叶一点缎面（留 ≥0.78 不进塑料区间） */
function canopyPattern(key: string, tune: CanopyTune): PlantPattern {
  return {
    key,
    objectPosition: true,
    body: /* glsl */ `
// one mid-freq position noise doubles as clump identity + within-clump mottle; vertical shade gradient fakes self-occlusion; hash micro speckle
vec2 plantLeafP = vec2(vPlantPos.x + vPlantPos.z, vPlantPos.y - vPlantPos.z * 0.63);
float plantLeafMottle = facVnoise(plantLeafP * vec2(${f(tune.freq[0])}, ${f(tune.freq[1])}) + vec2(${f(tune.seed[0])}, ${f(tune.seed[1])}));
float plantLeafMicro = facHash21(plantLeafP * ${f(tune.microFreq)});
float plantLeafShade = clamp((vPlantPos.y - ${f(tune.yBase)}) / ${f(tune.ySpan)}, 0.0, 1.0);
plantColorMul = mix(vec3(${v3(tune.hueA)}), vec3(${v3(tune.hueB)}), plantLeafMottle) * (${f(tune.shadeLow)} + ${f(tune.shadeSpan)} * plantLeafShade) * (0.97 + 0.06 * plantLeafMicro);
plantRoughDelta = ${f(tune.sheen)} + (plantLeafMottle - 0.5) * 0.08 + (plantLeafMicro - 0.5) * 0.04;`,
  };
}

// ── 花卉配方（位置域 vPlantPos；4×）────────────────────────────────────────────

/** 花卉茎叶：径向门控分叶/茎（外圈叶偏蓝深、内圈茎偏黄浅——茎叶同材质同组内的天然分区），
 *  植株尺度斑驳（两片基叶去相关）+ 茎顶新芽偏浅的竖向梯度 + 高频微斑 */
const PATTERN_FLOWER_GREEN: PlantPattern = {
  key: 'flower-green',
  objectPosition: true,
  body: /* glsl */ `
// radial gate splits leaf (outer, cooler darker) vs stem (inner, paler yellowish); plant-scale mottle + pale-tip gradient + micro speckle
vec2 plantGreenP = vec2(vPlantPos.x + vPlantPos.z * 0.8, vPlantPos.y);
float plantGreenMottle = facVnoise(plantGreenP * 16.00 + vec2(3.70, 9.20));
float plantGreenMicro = facHash21(plantGreenP * 90.00);
float plantGreenIsLeaf = smoothstep(0.025, 0.05, length(vPlantPos.xz));
plantColorMul = mix(vec3(1.06, 1.05, 0.94), vec3(0.90, 0.98, 0.86), plantGreenIsLeaf)
  * (0.92 + 0.14 * clamp(vPlantPos.y / 0.36, 0.0, 1.0))
  * (0.95 + 0.10 * plantGreenMottle + 0.05 * (plantGreenMicro - 0.5));
plantRoughDelta = -0.05 + (plantGreenMottle - 0.5) * 0.06;`,
};

/** 花卉花层：径向坐标 = 沿瓣长度（r 自花轴向：瓣根聚拢 → 瓣尖展开），瓣根暗晕→瓣尖提亮；
 *  逐瓣身份斑驳（投影域频率 ≈ 瓣间距 → 相邻瓣去相关）；花心 dome 门控（r 小且高于瓣面）
 *  → 暖亮乘子 + 绒面糙度。已知取舍：同组同色乘法近似给不出真黄芯（粉底 × 暖乘子 =
 *  鲑橙芯），避免第 3 组倍增 draw——观感可接受，真黄芯须几何分组的后续升级点 */
const PATTERN_FLOWER_BLOOM: PlantPattern = {
  key: 'flower-bloom',
  objectPosition: true,
  body: /* glsl */ `
// radial petal coordinate (r from flower axis = base -> tip): dark throat -> bright rim; per-petal identity mottle;
// core dome gate (small r AND above petal plane) -> warm bright fuzzy center (multiplicative, same-group approximation)
vec2 plantPetalP = vec2(vPlantPos.x + vPlantPos.z * 0.8, vPlantPos.y);
float plantPetalR = length(vPlantPos.xz);
float plantPetalMottle = facVnoise(plantPetalP * 11.00 + vec2(14.90, 6.60));
float plantPetalMicro = facHash21(plantPetalP * 70.00);
float plantPetalTip = smoothstep(0.03, 0.13, plantPetalR);
float plantCoreGate = (1.0 - smoothstep(0.024, 0.034, plantPetalR)) * smoothstep(0.35, 0.36, vPlantPos.y);
plantColorMul = mix(vec3(0.72, 0.62, 0.66), vec3(1.12, 1.06, 1.05), plantPetalTip)
  * (0.95 + 0.10 * plantPetalMottle + 0.04 * (plantPetalMicro - 0.5));
plantColorMul = mix(plantColorMul, vec3(1.50, 1.35, 0.80), plantCoreGate * 0.85);
plantRoughDelta = -0.06 + (plantPetalMottle - 0.5) * 0.05 + plantCoreGate * 0.08;`,
};

// ── 配方注册表（按资产尺度调参，键即资产配方；导出供测试锁纪律与未来资产复用）──────

/** 植物配方全集：7 配方 / 7 program（橡 2 + 松 2 + 灌 1 + 花 2），同资产全部实例共享 */
export const PLANT_RECIPES: readonly PlantPattern[] = [
  barkPattern('bark-oak', {
    ridges: 12, // Ø0.24–0.48 干身 → 脊距 6–12cm 粗板条沟壑（橡树成熟皮）
    warpFreq: [2.6, 2.2],
    warpAmp: 1.1,
    ridgeFloor: 0.62, // 深沟：沟底收到 0.62（× 板块暗端 ≈0.53，强明暗读作凹槽 occlusion）
    plateFreq: [5.0, 14.0], // 环向疏/纵向密 → 竖长板块（橡树皮矩形龟裂）
    dark: [0.86, 0.85, 0.84], // 相对冷灰（底色 #5a4633 走材质 color）
    light: [1.12, 1.09, 1.05],
    seed: [7.3, 2.9],
  }),
  barkPattern('bark-pine', {
    ridges: 15, // 细径密脊：Ø0.18–0.40 → 脊距 4–8cm 鳞状细纹（松树皮）
    warpFreq: [3.1, 3.0],
    warpAmp: 0.85,
    ridgeFloor: 0.72, // 浅沟：松皮片状剥落为主、沟壑不深
    plateFreq: [7.0, 8.0], // 近方各向同性 → 圆鳞片
    dark: [0.88, 0.8, 0.74], // 相对暖红（底色 #5c4130 走材质 color）
    light: [1.14, 1.04, 0.96],
    seed: [19.7, 8.1],
  }),
  canopyPattern('canopy-oak', {
    freq: [1.05, 1.05], // 波长 ~0.95m：团径 0.85–1.8m 内 2–4 斑块 / 团心距 1.5–2.5m 去相关
    seed: [37.2, 11.8],
    hueA: [0.86, 0.95, 0.74], // 冷蓝绿
    hueB: [1.08, 1.04, 0.9], // 暖黄绿（阔叶冠典型的黄绿高光 ↔ 蓝绿纵深）
    shadeLow: 0.78,
    shadeSpan: 0.24, // 冠底 22% 自遮蔽暗化——阔冠下缘明显背阴
    yBase: 2.7,
    ySpan: 3.3, // 冠层高度带 2.69–6.1m（主团底 → 顶团顶）
    microFreq: 42,
    sheen: -0.06, // 阔叶面微缎面：0.9 底 −0.06 → ~0.84（不进塑料区间）
  }),
  canopyPattern('canopy-pine', {
    freq: [0.8, 0.95], // y 向波长 ~1.05m ≈ 锥层距 1.25–1.5m → 层间身份差 + 层内轮生枝带状
    seed: [8.4, 3.1],
    hueA: [0.88, 0.96, 0.8],
    hueB: [1.05, 1.03, 0.92], // 针叶色相摆幅收窄（暗冷绿为基调，少黄绿高光）
    shadeLow: 0.8,
    shadeSpan: 0.2,
    yBase: 1.5,
    ySpan: 5.4, // 冠层高度带 1.5–7.0m（首层底 → 顶锥尖）
    microFreq: 38,
    sheen: 0.0, // 针叶哑光：无缎面偏移
  }),
  canopyPattern('canopy-shrub', {
    freq: [2.3, 2.3], // 波长 ~0.43m ≈ 团半径 0.38–0.6m / 团心距 0.5–0.9m 去相关
    seed: [21.6, 5.3],
    hueA: [0.87, 0.96, 0.75],
    hueB: [1.07, 1.03, 0.9],
    shadeLow: 0.88,
    shadeSpan: 0.12, // 低矮丛自遮蔽弱：梯度幅度小于乔木
    yBase: 0.0,
    ySpan: 0.9,
    microFreq: 55,
    sheen: -0.04,
  }),
  PATTERN_FLOWER_GREEN,
  PATTERN_FLOWER_BLOOM,
];

const recipeByKey = new Map(PLANT_RECIPES.map((pattern) => [pattern.key, pattern]));

/** 按 key 取配方（注册表缺项 = 配方改名未同步，启动即暴） */
function recipe(key: string): PlantPattern {
  const pattern = recipeByKey.get(key);
  if (!pattern) throw new Error(`plant 配方未注册: ${key}`);
  return pattern;
}

// ── 材质工厂（每次调用 new 材质 + 独立注入闭包；配方 key 不变则共享 program）────────

/** 橡树树皮（干 + 3 侧枝）：暖褐底 + bark-oak 深沟灰褐配方（uv 域） */
export function createOakBarkMaterial(params: PlantBaseParams): THREE.MeshStandardMaterial {
  return injectPlantPattern(new THREE.MeshStandardMaterial(params), recipe('bark-oak'));
}

/** 橡树冠层（6 球团）：叶绿底 + canopy-oak 团间色差/自遮蔽配方（位置域） */
export function createOakCanopyMaterial(params: PlantBaseParams): THREE.MeshStandardMaterial {
  return injectPlantPattern(new THREE.MeshStandardMaterial(params), recipe('canopy-oak'));
}

/** 松树树皮（干）：红褐底 + bark-pine 鳞状配方（uv 域） */
export function createPineBarkMaterial(params: PlantBaseParams): THREE.MeshStandardMaterial {
  return injectPlantPattern(new THREE.MeshStandardMaterial(params), recipe('bark-pine'));
}

/** 松树针叶层（4 叠锥）：冷绿底 + canopy-pine 层间色差配方（位置域） */
export function createPineCanopyMaterial(params: PlantBaseParams): THREE.MeshStandardMaterial {
  return injectPlantPattern(new THREE.MeshStandardMaterial(params), recipe('canopy-pine'));
}

/** 灌木冠丛（5 球团，单值形态槽位）：叶绿底 + canopy-shrub 团间色差配方（位置域） */
export function createShrubCanopyMaterial(params: PlantBaseParams): THREE.MeshStandardMaterial {
  return injectPlantPattern(new THREE.MeshStandardMaterial(params), recipe('canopy-shrub'));
}

/** 花卉茎叶（茎 + 2 基叶）：茎绿底 + flower-green 径向门控配方（位置域） */
export function createFlowerStemLeafMaterial(params: PlantBaseParams): THREE.MeshStandardMaterial {
  return injectPlantPattern(new THREE.MeshStandardMaterial(params), recipe('flower-green'));
}

/** 花卉花层（6 瓣环 + 花心 dome）：花色底 + flower-bloom 瓣晕/暖芯配方（位置域） */
export function createFlowerBloomMaterial(params: PlantBaseParams): THREE.MeshStandardMaterial {
  return injectPlantPattern(new THREE.MeshStandardMaterial(params), recipe('flower-bloom'));
}
