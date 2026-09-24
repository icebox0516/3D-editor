/**
 * tests/runtime/procedural/tree/broadleafCanopyMaterials.test.ts —— BroadleafCanopyProxy
 * 材质面不变量测试（T021.6）。
 *
 * 覆盖（零 GPU——假 shader 注入提取 onBeforeCompile 产物 GLSL 逐数对账，无需真实编译）：
 * - 两材质成套：工厂按 assetId 交付 [干柱, 冠卡] + 深度三材质（恰 2 组契约对齐）；
 *   干柱 FrontSide / 冠卡 DoubleSide（水平法线双面读向）；未知 assetId 即抛；13 树种全覆盖；
 * - 受光模型非 unlit（T018 envMap 域联动断言）：MeshStandardMaterial 族（自动吃
 *   scene.environment / environmentIntensity）+ envMap / envMapIntensity 零 override
 *   （共享 T018 域不被材质私有化）+ emissive 恒黑（无假发光 unlit 形态）；
 * - 风动消费：注入 GLSL 含 uTime / aSeed / (aSeed + aLeafRand) 快颤相位 / aBend 权重；
 *   成套三材质共享同一 uTime 对象（TimeUniformService 扫主材质 → 影 pass 同帧）；
 * - **风相位一致 drift-lock（§6.3「与高中档同相位」的断言面）**：canopy 参数表逐数对账
 *   各树种叶材质真实注入 GLSL——风动 10 常数 / hue·luma·transVar 散列常数 / 透射色与峰值
 *   全等；树种侧调参未同步 canopy 时本测试红（0=0 同相 = 常数逐位一致的推论，另以
 *   aSeed=0 相位数值直接复核）；冠色 / 皮色对账树种材质构造色；
 * - 深度材质轮廓-only（§七末段）：alphaTest 0 / 无 SDF / 无噪声采样 / 无 discard；
 *   aBend 风摆进深度顶点且与主渲染同常数（objectNormal 微扑不进——深度链无该变量）；
 * - customProgramCacheKey 13 树种 × 3 角色两两互异。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  BROADLEAF_CANOPY_MATERIAL_ASSET_IDS,
  BROADLEAF_CANOPY_MATERIAL_SPECIES,
  createBroadleafCanopyMaterials,
} from '../../../../src/runtime/procedural/tree/broadleafCanopyMaterials';
import { BROADLEAF_CANOPY_ASSET_IDS } from '../../../../src/runtime/procedural/tree/broadleafCanopyProxy';
import { createTree3aLeafMaterial, createTree3aBarkMaterial } from '../../../../src/runtime/procedural/tree/tree3a/tree3aMaterials';
import { createCamphorLeafMaterial, createCamphorBarkMaterial } from '../../../../src/runtime/procedural/tree/camphor/camphorMaterials';
import { createCeltisLeafMaterial, createCeltisBarkMaterial } from '../../../../src/runtime/procedural/tree/celtis/celtisMaterials';
import { createZelkovaLeafMaterial, createZelkovaBarkMaterial } from '../../../../src/runtime/procedural/tree/zelkova/zelkovaMaterials';
import { createGinkgoLeafMaterial, createGinkgoBarkMaterial } from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoMaterials';
import { createBischofiaLeafMaterial, createBischofiaBarkMaterial } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaMaterials';
import { createFraxinusLeafMaterial, createFraxinusBarkMaterial } from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusMaterials';
import { createKoelreuteriaLeafMaterial, createKoelreuteriaBarkMaterial } from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaMaterials';
import { createLigustrumLeafMaterial, createLigustrumBarkMaterial } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumMaterials';
import { createPlatanusLeafMaterial, createPlatanusBarkMaterial } from '../../../../src/runtime/procedural/tree/platanus/platanusMaterials';
import { createSalixLeafMaterial, createSalixBarkMaterial } from '../../../../src/runtime/procedural/tree/salix/salixMaterials';
import { createSophoraLeafMaterial, createSophoraBarkMaterial } from '../../../../src/runtime/procedural/tree/sophora/sophoraMaterials';
import { createTriadicaLeafMaterial, createTriadicaBarkMaterial } from '../../../../src/runtime/procedural/tree/triadica/triadicaMaterials';

// ── 假 shader 注入（onBeforeCompile 只做字符串替换与 uniforms 挂接——锚点全集喂入即可提取产物）──

interface InjectedShader {
  uniforms: Record<string, { value: number }>;
  vertexShader: string;
  fragmentShader: string;
}

/** 注入提取：全锚点假 shader 过 onBeforeCompile（species 与 canopy 同一提取面，零 GPU） */
function inject(material: THREE.Material): InjectedShader {
  const shader = {
    uniforms: {} as Record<string, { value: number }>,
    vertexShader: '#include <common>\n#include <begin_vertex>\n',
    fragmentShader:
      '#include <common>\n#include <map_fragment>\n#include <alphatest_fragment>\n#include <roughnessmap_fragment>\n#include <opaque_fragment>\n', // alphatest 锚点：card/trunk 的 T021.3 fade dither 注入位（同步记档——注入后测试假 shader 需含该锚点）
  };
  const hook = (material as { onBeforeCompile?: (s: unknown, r: unknown) => void }).onBeforeCompile;
  if (!hook) throw new Error('材质无 onBeforeCompile（应已注入）');
  hook(shader, undefined);
  return shader as unknown as InjectedShader;
}

// ── species 材质工厂表（drift-lock 对账参照——High 缺省档）──

const SPECIES_LEAF: Record<string, () => THREE.MeshStandardMaterial> = {
  asset_tree_3a: createTree3aLeafMaterial,
  asset_tree_camphor: createCamphorLeafMaterial,
  asset_tree_celtis: createCeltisLeafMaterial,
  asset_tree_zelkova: createZelkovaLeafMaterial,
  asset_tree_ginkgo: createGinkgoLeafMaterial,
  asset_tree_bischofia: createBischofiaLeafMaterial,
  asset_tree_fraxinus: createFraxinusLeafMaterial,
  asset_tree_koelreuteria: createKoelreuteriaLeafMaterial,
  asset_tree_ligustrum: createLigustrumLeafMaterial,
  asset_tree_platanus: createPlatanusLeafMaterial,
  asset_tree_salix: createSalixLeafMaterial,
  asset_tree_sophora: createSophoraLeafMaterial,
  asset_tree_triadica: createTriadicaLeafMaterial,
};

const SPECIES_BARK: Record<string, () => THREE.MeshStandardMaterial> = {
  asset_tree_3a: createTree3aBarkMaterial,
  asset_tree_camphor: createCamphorBarkMaterial,
  asset_tree_celtis: createCeltisBarkMaterial,
  asset_tree_zelkova: createZelkovaBarkMaterial,
  asset_tree_ginkgo: createGinkgoBarkMaterial,
  asset_tree_bischofia: createBischofiaBarkMaterial,
  asset_tree_fraxinus: createFraxinusBarkMaterial,
  asset_tree_koelreuteria: createKoelreuteriaBarkMaterial,
  asset_tree_ligustrum: createLigustrumBarkMaterial,
  asset_tree_platanus: createPlatanusBarkMaterial,
  asset_tree_salix: createSalixBarkMaterial,
  asset_tree_sophora: createSophoraBarkMaterial,
  asset_tree_triadica: createTriadicaBarkMaterial,
};

// ── 注入 GLSL 数值提取器（species 与 canopy 同式——逐数对账的解析面）──

/** 单捕获组数值提取（缺失即抛——label 记档定位） */
function num1(pattern: RegExp, source: string, label: string): number {
  const m = pattern.exec(source);
  if (!m) throw new Error(`注入 GLSL 缺少 ${label}`);
  return Number(m[1]!);
}

/** 逗号分隔数字串解析（vec3 字面量组） */
function parseNums(raw: string): number[] {
  return raw.split(',').map((t) => Number(t.trim()));
}

/** 风动 10 常数（species / canopy 同构提取） */
function windOf(glsl: string): Record<string, number> {
  return {
    phaseK: num1(/WindPhase = fract\(sin\(aSeed \* ([\d.]+) \+ [\d.]+\)/, glsl, 'windPhase K'),
    phaseC: num1(/WindPhase = fract\(sin\(aSeed \* [\d.]+ \+ ([\d.]+)\)/, glsl, 'windPhase C'),
    heightScale: num1(/WindH = clamp\(position\.y \* ([\d.]+)/, glsl, 'windH'),
    swayAmp: num1(/Sway = \w+WindH \* \w+WindH \* ([\d.]+)/, glsl, 'sway 幅度'),
    swayFreq: num1(/Sway = \w+WindH \* \w+WindH \* [\d.]+ \* sin\(uTime \* ([\d.]+)/, glsl, 'sway 频率'),
    flutterK: num1(/FlutterPhase = fract\(sin\(\(aSeed \+ aLeafRand\) \* ([\d.]+)/, glsl, 'flutterPhase K'),
    flutterC: num1(/FlutterPhase = fract\(sin\(\(aSeed \+ aLeafRand\) \* [\d.]+ \+ ([\d.]+)\)/, glsl, 'flutterPhase C'),
    flutterAmp: num1(/Flutter = aBend \* ([\d.]+)/, glsl, 'flutter 幅度'),
    flutterF0: num1(/Flutter = aBend \* [\d.]+ \* sin\(uTime \* \(([\d.]+)/, glsl, 'flutter 频率基值'),
    flutterFSpan: num1(/Flutter = aBend \* [\d.]+ \* sin\(uTime \* \([\d.]+ \+ ([\d.]+)/, glsl, 'flutter 频率跨度'),
  };
}

/** hue / luma / transVar 散列常数（4 元组：base span k c） */
function hash4Of(linePattern: RegExp, source: string, label: string): [number, number, number, number] {
  const m = linePattern.exec(source);
  if (!m) throw new Error(`注入 GLSL 缺少 ${label}`);
  return [Number(m[1]!), Number(m[2]!), Number(m[3]!), Number(m[4]!)];
}

/** hue 行解析：两端点 vec3 + 散列 k/c（canopy 表对账消费面） */
function hueOf(source: string, label: string): { cold: number[]; warm: number[]; k: number; c: number } {
  const m = /Hue = mix\(vec3\(([^)]*)\), vec3\(([^)]*)\), fract\(vLeafRand \* ([\d.]+) \+ ([\d.]+)\)\)/.exec(source);
  if (!m) throw new Error(`注入 GLSL 缺少 ${label}`);
  return {
    cold: parseNums(m[1]!),
    warm: parseNums(m[2]!),
    k: Number(m[3]!),
    c: Number(m[4]!),
  };
}

// ── 两材质成套（几何恰 2 组契约对齐）──

describe('两材质成套', () => {
  it('工厂按 assetId 交付干柱 + 冠卡 + 深度；干柱 FrontSide / 冠卡 DoubleSide；materials 元组与组序对齐；未知 assetId 即抛', () => {
    expect(BROADLEAF_CANOPY_MATERIAL_ASSET_IDS).toHaveLength(13);
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const set = createBroadleafCanopyMaterials(id);
      expect(set.materials, `${id} 应两材质成套`).toHaveLength(2);
      expect(set.materials[0]).toBe(set.trunkMaterial);
      expect(set.materials[1]).toBe(set.cardMaterial);
      expect(set.trunkMaterial.side, `${id} 干柱应 FrontSide`).toBe(THREE.FrontSide);
      expect(set.cardMaterial.side, `${id} 冠卡应 DoubleSide（水平法线双面读向）`).toBe(THREE.DoubleSide);
    }
    expect(() => createBroadleafCanopyMaterials('asset_unknown')).toThrow(/无此树种接入/);
  });

  it('材质表与几何面接入表同 13 树种同序（assetId 粒度派生对齐）', () => {
    expect([...BROADLEAF_CANOPY_MATERIAL_ASSET_IDS]).toEqual([...BROADLEAF_CANOPY_ASSET_IDS]);
  });

  it('customProgramCacheKey 13 树种 × 3 角色两两互异', () => {
    const keys = new Set<string>();
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const set = createBroadleafCanopyMaterials(id);
      for (const m of [set.trunkMaterial, set.cardMaterial, set.depthMaterial]) {
        const key = m.customProgramCacheKey!();
        expect(keys.has(key), `键应互异: ${key}`).toBe(false);
        keys.add(key);
      }
    }
    expect(keys.size).toBe(39);
  });
});

// ── 受光模型非 unlit（§6.4：MeshStandardMaterial 族 + T018 envMap / intensity 共享域）──

describe('受光模型（非 unlit / T018 域联动）', () => {
  it('冠卡与干柱均 MeshStandardMaterial 族；envMap / envMapIntensity 零 override（scene 级共享域）；emissive 恒黑；metalness 0', () => {
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const set = createBroadleafCanopyMaterials(id);
      for (const m of [set.trunkMaterial, set.cardMaterial]) {
        expect(m instanceof THREE.MeshStandardMaterial, `${id} 应 MeshStandardMaterial 族（lambert + IBL 受光）`).toBe(true);
        expect(m.envMap, `${id} 不应私有 envMap（共享 scene.environment T018 域）`).toBeNull();
        expect(m.envMapIntensity, `${id} 不应 override envMapIntensity（scene.environmentIntensity 共享域）`).toBe(1);
        expect(m.emissive!.getHex(), `${id} emissive 应恒黑（无假发光 unlit 形态）`).toBe(0x000000);
        expect(m.metalness, `${id} 介电质`).toBe(0);
      }
    }
  });
});

// ── 风动消费（uTime / aSeed / aBend / aLeafRand + 共享 uTime 对象）──

describe('风动消费', () => {
  it('注入 GLSL 消费 uTime·aSeed·aBend（快颤相位 = hash(aSeed + aLeafRand)）；成套三材质共享同一 uTime 对象（影 pass 同帧）', () => {
    const id = 'asset_tree_3a';
    const set = createBroadleafCanopyMaterials(id);
    const card = inject(set.cardMaterial);
    const trunk = inject(set.trunkMaterial);
    const depth = inject(set.depthMaterial);
    for (const [name, s] of [['card', card], ['trunk', trunk], ['depth', depth]] as const) {
      expect(s.vertexShader, `${name} 应消费 uTime`).toContain('uTime *');
      expect(s.vertexShader, `${name} 应消费 aSeed`).toMatch(/aSeed \* [\d.]+/);
      expect(s.vertexShader, `${name} 应消费 aBend`).toMatch(/aBend \* [\d.]+/);
      expect(s.vertexShader, `${name} 快颤相位应 = hash(aSeed + aLeafRand)`).toContain('(aSeed + aLeafRand)');
      expect(s.uniforms.uTime, `${name} shader.uniforms.uTime 应存在`).toBeDefined();
    }
    // 材质级 uniforms（TimeUniformService 扫描面）
    const cardU = (set.cardMaterial as unknown as { uniforms?: Record<string, { value: number }> }).uniforms;
    const trunkU = (set.trunkMaterial as unknown as { uniforms?: Record<string, { value: number }> }).uniforms;
    expect(cardU?.uTime, '冠卡应挂材质级 uniforms.uTime（服务扫描面）').toBeDefined();
    expect(trunkU?.uTime, '干柱应挂材质级 uniforms.uTime（服务扫描面）').toBeDefined();
    expect(cardU!.uTime).toBe(trunkU!.uTime);
    expect(cardU!.uTime).toBe(card.uniforms.uTime);
    expect(cardU!.uTime).toBe(depth.uniforms.uTime); // 深度程序绑同一对象——服务写主材质即影 pass 同帧
  });
});

// ── 风相位一致 drift-lock（§6.3 断言面：canopy 参数表 ↔ species 材质真实注入 GLSL 逐数对账）──

describe('风相位一致 drift-lock（与高中低档同公式同常数）', () => {
  it('13 树种风动 10 常数逐数对账 species 叶材质注入 GLSL；aSeed=0 相位数值直接复核（0=0 同相）', () => {
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const speciesWind = windOf(inject(SPECIES_LEAF[id]!()).vertexShader);
      const canopyWind = windOf(inject(createBroadleafCanopyMaterials(id).cardMaterial).vertexShader);
      const table = BROADLEAF_CANOPY_MATERIAL_SPECIES[id]!.wind;
      expect(canopyWind.phaseK, `${id} 相位 K`).toBe(table.swayPhaseK);
      expect(canopyWind.phaseC, `${id} 相位 C`).toBe(table.swayPhaseC);
      expect(canopyWind.heightScale, `${id} 高度尺度`).toBe(table.heightScale);
      expect(canopyWind.swayAmp, `${id} 缓摆幅度`).toBe(table.swayAmplitude);
      expect(canopyWind.swayFreq, `${id} 缓摆频率`).toBe(table.swayFrequency);
      expect(canopyWind.flutterK, `${id} 快颤相位 K`).toBe(table.flutterPhaseK);
      expect(canopyWind.flutterC, `${id} 快颤相位 C`).toBe(table.flutterPhaseC);
      expect(canopyWind.flutterAmp, `${id} 快颤幅度`).toBe(table.flutterAmplitude);
      expect(canopyWind.flutterF0, `${id} 快颤频率基值`).toBe(table.flutterFrequencyBase);
      expect(canopyWind.flutterFSpan, `${id} 快颤频率跨度`).toBe(table.flutterFrequencySpan);
      // 对账 species
      expect(canopyWind.phaseK, `${id} 相位 K 应与 species 一致`).toBe(speciesWind.phaseK);
      expect(canopyWind.phaseC, `${id} 相位 C 应与 species 一致`).toBe(speciesWind.phaseC);
      expect(canopyWind.heightScale, `${id} 高度尺度应与 species 一致`).toBe(speciesWind.heightScale);
      expect(canopyWind.swayAmp, `${id} 缓摆幅度应与 species 一致`).toBe(speciesWind.swayAmp);
      expect(canopyWind.swayFreq, `${id} 缓摆频率应与 species 一致`).toBe(speciesWind.swayFreq);
      expect(canopyWind.flutterK, `${id} 快颤相位 K 应与 species 一致`).toBe(speciesWind.flutterK);
      expect(canopyWind.flutterC, `${id} 快颤相位 C 应与 species 一致`).toBe(speciesWind.flutterC);
      expect(canopyWind.flutterAmp, `${id} 快颤幅度应与 species 一致`).toBe(speciesWind.flutterAmp);
      expect(canopyWind.flutterF0, `${id} 快颤频率基值应与 species 一致`).toBe(speciesWind.flutterF0);
      expect(canopyWind.flutterFSpan, `${id} 快颤频率跨度应与 species 一致`).toBe(speciesWind.flutterFSpan);
      // 0=0 同相数值复核：aSeed 缺省 0 时相位 = fract(sin(C)·43758.5453)，两边常数相等即逐位相等
      const phase0 = (c: number): number => {
        const v = Math.sin(c) * 43758.5453;
        return v - Math.floor(v);
      };
      expect(phase0(canopyWind.phaseC), `${id} aSeed=0 相位应与 species 逐位相等`).toBe(phase0(speciesWind.phaseC));
    }
  });

  it('hue·luma·transVar 散列常数与透射色 / 峰值逐数对账 species 叶材质（共享簇逐位同 tint / 透光变奏）', () => {
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const species = inject(SPECIES_LEAF[id]!());
      const canopy = inject(createBroadleafCanopyMaterials(id).cardMaterial);
      const sHue = hueOf(species.fragmentShader, `${id} species hue`);
      const cHue = hueOf(canopy.fragmentShader, `${id} canopy hue`);
      expect(cHue.k, `${id} hue K 应与 species 一致`).toBe(sHue.k);
      expect(cHue.c, `${id} hue C 应与 species 一致`).toBe(sHue.c);
      expect(cHue.cold, `${id} hue 冷端应与 species 一致`).toEqual(sHue.cold);
      expect(cHue.warm, `${id} hue 暖端应与 species 一致`).toEqual(sHue.warm);
      const table = BROADLEAF_CANOPY_MATERIAL_SPECIES[id]!.variation;
      expect(cHue.cold, `${id} 表 hue 冷端一致`).toEqual([...table.hueCold]);
      expect(cHue.warm, `${id} 表 hue 暖端一致`).toEqual([...table.hueWarm]);
      const luma = /Luma = ([\d.]+) \+ ([\d.]+) \* fract\(vLeafRand \* ([\d.]+) \+ ([\d.]+)\)/;
      expect(hash4Of(luma, canopy.fragmentShader, `${id} canopy luma`), `${id} luma 应与 species 一致`).toEqual(hash4Of(luma, species.fragmentShader, `${id} species luma`));
      const transVar = /TransVar = ([\d.]+) \+ ([\d.]+) \* fract\(vLeafRand \* ([\d.]+) \+ ([\d.]+)\)/;
      expect(hash4Of(transVar, canopy.fragmentShader, `${id} canopy transVar`), `${id} transVar 应与 species 一致`).toEqual(hash4Of(transVar, species.fragmentShader, `${id} species transVar`));
      const trans = /outgoingLight \+= vec3\(([^)]*)\) \* directionalLights\[0\]\.color[\s\S]*?\* ([\d.]+);/;
      const sT = trans.exec(species.fragmentShader);
      const cT = trans.exec(canopy.fragmentShader);
      expect(sT, `${id} species 应有透射项`).toBeTruthy();
      expect(cT, `${id} canopy 应有透射项`).toBeTruthy();
      expect(parseNums(cT![1]!), `${id} 透射色应与 species 一致`).toEqual(parseNums(sT![1]!));
      expect(Number(cT![2]), `${id} 透射峰值应与 species 一致`).toBe(Number(sT![2]));
    }
  });

  it('13 树种冠色 / 皮色对账 species 材质构造色（树种级冠色按 assetId 取各树种叶色）', () => {
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const table = BROADLEAF_CANOPY_MATERIAL_SPECIES[id]!;
      const set = createBroadleafCanopyMaterials(id);
      expect(set.cardMaterial.color.getHex(), `${id} 冠色应 = species 叶色`).toBe(SPECIES_LEAF[id]!().color.getHex());
      expect(set.trunkMaterial.color.getHex(), `${id} 皮色应 = species 皮色`).toBe(SPECIES_BARK[id]!().color.getHex());
      expect(set.cardMaterial.color.getHex(), `${id} 表冠色一致`).toBe(table.crownColor);
      expect(set.trunkMaterial.color.getHex(), `${id} 表皮色一致`).toBe(table.trunkColor);
    }
    const crowns = BROADLEAF_CANOPY_MATERIAL_ASSET_IDS.map((id) => BROADLEAF_CANOPY_MATERIAL_SPECIES[id]!.crownColor);
    expect(new Set(crowns).size, '13 树种冠色应两两互异（中距色块横向可辨）').toBe(13);
  });
});

// ── aCrownQ 梯度与 aLeafRand 变奏采样路径（§6.4 材质消费面）──

describe('aCrownQ / aLeafRand 消费', () => {
  it('冠卡片元消费 vCrownQ（内外明暗梯度 + 透光壳层加权）与 vLeafRand（hue / luma / transVar）；干柱不消费 aCrownQ', () => {
    const set = createBroadleafCanopyMaterials('asset_tree_camphor');
    const card = inject(set.cardMaterial);
    expect(card.vertexShader).toContain('vCrownQ = aCrownQ;');
    expect(card.fragmentShader).toMatch(/cnShade = [\d.]+ \+ [\d.]+ \* vCrownQ/);
    expect(card.fragmentShader).toMatch(/vLeafRand \* [\d.]+ \+ [\d.]+\)/);
    expect(card.fragmentShader).toContain('vCrownQ'); // 透光壳层加权 cnShell 同源消费
    expect(card.fragmentShader).toMatch(/cnShell = [\d.]+ \+ [\d.]+ \* vCrownQ/);
    const trunk = inject(set.trunkMaterial);
    expect(trunk.vertexShader).not.toContain('aCrownQ'); // 干柱恒 0 通道不声明不消费
    expect(trunk.fragmentShader).not.toContain('vCrownQ');
  });
});

// ── Canopy Depth Material（§七末段：轮廓-only 无 SDF）──

describe('Canopy Depth Material（轮廓-only）', () => {
  it('alphaTest 0；注入产物无 SDF / 无噪声采样 / 无 discard；风摆进深度顶点与主渲染同常数；objectNormal 微扑不进深度链', () => {
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const set = createBroadleafCanopyMaterials(id);
      const depth = set.depthMaterial;
      expect(depth instanceof THREE.MeshDepthMaterial, `${id} 深度应 MeshDepthMaterial`).toBe(true);
      expect(depth.depthPacking, `${id} RGBADepthPacking`).toBe(THREE.RGBADepthPacking);
      expect(depth.alphaTest, `${id} 深度应无 alphaTest（轮廓-only，卡即壳）`).toBe(0);
      const injected = inject(depth);
      expect(injected.fragmentShader, `${id} 深度片元应零注入（无 SDF 路径；fade dither 亦不进深度——阴影走中点切换）`).toBe(
        '#include <common>\n#include <map_fragment>\n#include <alphatest_fragment>\n#include <roughnessmap_fragment>\n#include <opaque_fragment>\n',
      );
      expect(injected.vertexShader, `${id} 深度应含 aBend 风摆`).toMatch(/aBend \* [\d.]+/);
      expect(injected.vertexShader, `${id} 深度链不应引用 objectNormal（未定义变量）`).not.toContain('objectNormal');
      // 深度风摆与主渲染同常数（同相）
      const windDepth = windOf(injected.vertexShader);
      const windCard = windOf(inject(set.cardMaterial).vertexShader);
      expect(windDepth).toEqual(windCard);
      // 全产物无 SDF / 噪声采样面
      expect(injected.vertexShader).not.toMatch(/facVnoise|SDF|Alpha\(/i);
      expect(injected.fragmentShader).not.toMatch(/facVnoise|discard|Alpha\(/i);
    }
  });
});
