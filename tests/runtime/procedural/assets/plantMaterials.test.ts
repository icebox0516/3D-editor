/**
 * tests/runtime/procedural/assets/plantMaterials.test.ts —— 植物资产包材质阶段测试（T003.4 阶段二）。
 *
 * 覆盖（table-driven，四资产同口径；真实 THREE 对象，零 mock——onBeforeCompile 用
 * 含 three 注入点标记的真实 ShaderLib 源组装，静态字符串断言，无需 WebGL）：
 * - 注入存在性与形态：每槽挂自有 onBeforeCompile + customProgramCacheKey ===
 *   `plant:<配方>`；USE_UV 仅树皮槽（uv 域配方），位置域配方（冠层/花卉）不打开
 *   （噪声域走 vPlantPos，不吃异构 uv）；橡/松/花数组形态、灌木单值形态（工厂与
 *   缓存 dispose 对 Material | Material[] 两形态兼容的设计点）；
 * - program 键区分与共享：注册表 7 配方键唯一；同配方重复构建键稳定（同资产全部
 *   实例共享单 program）；异配方互异（两树皮/三冠层按资产尺度调参不共享）；
 * - 底材参数透传：7 工厂 color/metalness/roughness 原样落材质（注入只叠加不改底参）；
 * - 无共享：两次 build 材质实例互不相同（缓存会 dispose 所持资源）；
 * - shader 源完整性：组装后含 facility 噪声库（单一来源 import，非复制粘贴）与
 *   plant 配方变量、roughness/metalness delta 回收语句；原生 chunk 原句保留
 *   （map/roughness/metalness/color_fragment 各恰一次）、注入代码零 vColor 介入
 *   （instanceColor 的 hueJitter 乘算链不被触碰）；位置域配方顶点注入 vPlantPos
 *   物体空间位置 varying（<begin_vertex> 后取 transformed），树皮配方顶点保持原样；
 *   include 全展开后结构配平差值不变；
 * - 成本纪律（10 万实例每像素预算）：注册表每配方折算 ALU ≤6×（hash21=1 /
 *   vnoise=3 / fbm2=6 计数折算）、非树皮配方 ≤4×；配方主体零循环/零纹理采样/
 *   零 uniform（确定性纯函数）；域纪律——uv 配方只碰 vUv、位置配方只碰 vPlantPos；
 * - 缺失即抛：片元 map_fragment / 顶点注入点被移除 → 抛「注入点缺失」（首次
 *   渲染前暴雷，不静默失效）；
 * - 缓存冒烟：真实 ProceduralSourceCache load 四资产各成功一次并 dispose（含
 *   单值形态灌木——注入材质走完整缓存生命周期不炸）。
 * 边界：测试内 build 出的 geometry/material 登记后由 afterEach 统一 dispose 兜底，
 *      不跨测试泄漏 GPU 资源；同槽共享材质实例 Set 去重后只 dispose 一次；工厂
 *      直建的材质（透传/缺失即抛用例）在用例内即建即弃。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';
import type { ProceduralBuild } from '../../../../src/runtime/procedural/types';
import { ProceduralSourceCache } from '../../../../src/runtime/procedural/ProceduralSourceCache';
import {
  createFlowerBloomMaterial,
  createFlowerStemLeafMaterial,
  createOakBarkMaterial,
  createOakCanopyMaterial,
  createPineBarkMaterial,
  createPineCanopyMaterial,
  createShrubCanopyMaterial,
  PLANT_RECIPES,
} from '../../../../src/runtime/procedural/materials/plantMaterials';
import { build as buildOak, meta as oakMeta } from '../../../../src/runtime/procedural/assets/asset_oak.asset';
import { build as buildPine, meta as pineMeta } from '../../../../src/runtime/procedural/assets/asset_pine.asset';
import { build as buildShrub, meta as shrubMeta } from '../../../../src/runtime/procedural/assets/asset_shrub.asset';
import { build as buildFlower, meta as flowerMeta } from '../../../../src/runtime/procedural/assets/asset_flower.asset';

interface PlantMaterialCase {
  label: string;
  metaId: string;
  build: ProceduralBuild;
  /** 各材质槽期望配方 key（customProgramCacheKey 去 plant: 前缀，与资产头部分层表一一对应） */
  recipeKeys: string[];
  /** 各槽是否为 uv 域配方（USE_UV）——树皮 true，位置域（冠层/花卉）false */
  uvSlots: boolean[];
  /** 单值 material 形态（灌木：高密度散布刻意单组省 draw call） */
  single?: boolean;
}

/** 4 资产注入范围（与各资产头部分层表一一对应）：植物无「未升级槽位」，全部挂注入 */
const cases: PlantMaterialCase[] = [
  { label: '橡树', metaId: oakMeta.id, build: buildOak, recipeKeys: ['bark-oak', 'canopy-oak'], uvSlots: [true, false] },
  { label: '松树', metaId: pineMeta.id, build: buildPine, recipeKeys: ['bark-pine', 'canopy-pine'], uvSlots: [true, false] },
  { label: '灌木', metaId: shrubMeta.id, build: buildShrub, recipeKeys: ['canopy-shrub'], uvSlots: [false], single: true },
  { label: '花卉', metaId: flowerMeta.id, build: buildFlower, recipeKeys: ['flower-green', 'flower-bloom'], uvSlots: [false, false] },
];

const built: InstanceSource[] = [];

/** 跟踪式构建：产物登记进 built，afterEach 统一 dispose 兜底 */
function buildTracked(build: ProceduralBuild): InstanceSource {
  const source = build();
  built.push(source);
  return source;
}

/** material 统一为数组形态（灌木单值形态转单元素数组） */
function materialsOf(source: InstanceSource): THREE.MeshStandardMaterial[] {
  return (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
}

/** 是否挂了注入（自有 onBeforeCompile；原生材质只有原型上的 no-op 方法） */
function isInjected(material: THREE.Material): boolean {
  return Object.prototype.hasOwnProperty.call(material, 'onBeforeCompile');
}

afterEach(() => {
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    for (const material of new Set(materialsOf(source))) material.dispose(); // 同槽共享实例只释放一次
  }
});

describe('植物材质阶段（T003.4 阶段二）：注入存在性与形态', () => {
  it.each(cases)('$label：每槽挂注入 + plant 键 + USE_UV 仅树皮槽；形态与槽数吻合', ({ build, recipeKeys, uvSlots, single }) => {
    const source = buildTracked(build);
    const materials = materialsOf(source);
    expect(materials.length).toBe(recipeKeys.length);
    expect(Array.isArray(source.material)).toBe(!single); // 灌木单值 / 其余数组
    materials.forEach((material, index) => {
      expect(isInjected(material), `槽位 ${index} 应挂注入`).toBe(true);
      expect(material.customProgramCacheKey(), `槽位 ${index} 配方键`).toBe(`plant:${recipeKeys[index]}`);
      if (uvSlots[index]) {
        expect(material.defines?.USE_UV, `槽位 ${index}（uv 域配方）应打开 vUv 通路`).toBe('');
      } else {
        expect(material.defines?.USE_UV, `槽位 ${index}（位置域配方）不应有 USE_UV`).toBeUndefined();
      }
    });
  });

  it('program 键区分与共享：注册表 7 键唯一；同配方键稳定共享；异配方互异（按资产尺度调参）', () => {
    expect(PLANT_RECIPES).toHaveLength(7);
    expect(new Set(PLANT_RECIPES.map((r) => r.key)).size).toBe(7);

    const oakA = materialsOf(buildTracked(buildOak));
    const oakB = materialsOf(buildTracked(buildOak));
    expect(oakB[0]!.customProgramCacheKey()).toBe(oakA[0]!.customProgramCacheKey()); // 同配方键稳定 ⇒ 同资产全实例共享 program

    const pine = materialsOf(buildTracked(buildPine));
    const shrub = materialsOf(buildTracked(buildShrub));
    const flower = materialsOf(buildTracked(buildFlower));
    expect(oakA[0]!.customProgramCacheKey()).not.toBe(pine[0]!.customProgramCacheKey()); // 橡树皮 ≠ 松树皮（深沟灰褐 / 鳞状红褐）
    expect(oakA[1]!.customProgramCacheKey()).not.toBe(pine[1]!.customProgramCacheKey()); // 橡冠层 ≠ 松冠层（团簇 / 层叠锥）
    expect(oakA[1]!.customProgramCacheKey()).not.toBe(shrub[0]!.customProgramCacheKey()); // 频率按团径调参，不跨资产共享
    expect(flower[0]!.customProgramCacheKey()).not.toBe(flower[1]!.customProgramCacheKey()); // 茎叶 ≠ 花层
  });

  it('底材参数透传：7 工厂 color/metalness/roughness 原样落材质（注入叠加不改底参）', () => {
    const made = [
      createOakBarkMaterial({ color: 0x5a4633, metalness: 0, roughness: 0.95 }),
      createOakCanopyMaterial({ color: 0x4a7a33, metalness: 0, roughness: 0.9 }),
      createPineBarkMaterial({ color: 0x5c4130, metalness: 0, roughness: 0.95 }),
      createPineCanopyMaterial({ color: 0x2f5e3e, metalness: 0, roughness: 0.9 }),
      createShrubCanopyMaterial({ color: 0x3f7034, metalness: 0, roughness: 0.9 }),
      createFlowerStemLeafMaterial({ color: 0x4c7d3f, metalness: 0, roughness: 0.9 }),
      createFlowerBloomMaterial({ color: 0xd2738f, metalness: 0, roughness: 0.8 }),
    ];
    try {
      const expectBase = (material: THREE.MeshStandardMaterial, hex: number, roughness: number): void => {
        expect(material.color.getHex()).toBe(hex); // 底色走材质 color（program 共享，不占 program 数）
        expect(material.metalness).toBe(0); // 有机材质全介质电
        expect(material.roughness).toBe(roughness); // 哑光底材（运行时缎面走注入 delta）
      };
      expectBase(made[0]!, 0x5a4633, 0.95);
      expectBase(made[1]!, 0x4a7a33, 0.9);
      expectBase(made[2]!, 0x5c4130, 0.95);
      expectBase(made[3]!, 0x2f5e3e, 0.9);
      expectBase(made[4]!, 0x3f7034, 0.9);
      expectBase(made[5]!, 0x4c7d3f, 0.9);
      expectBase(made[6]!, 0xd2738f, 0.8);
    } finally {
      for (const material of made) material.dispose(); // 工厂直建材质即建即弃
    }
  });

  it.each(cases)('$label：两次调用材质均为新实例（无模块级共享）', ({ build }) => {
    const matsA = new Set(materialsOf(buildTracked(build)));
    for (const material of materialsOf(buildTracked(build))) expect(matsA.has(material)).toBe(false);
  });
});

describe('植物材质阶段（T003.4 阶段二）：shader 源完整性（对 three 真实源组装）', () => {
  /** 用真实 THREE.ShaderLib.physical 源组装（onBeforeCompile 在 include 解析前运行于该源——真实环境形态，
   *  比桩更能暴露注入点漂移） */
  function assemble(material: THREE.Material): { vertexShader: string; fragmentShader: string } {
    const shader = {
      vertexShader: THREE.ShaderLib.physical.vertexShader,
      fragmentShader: THREE.ShaderLib.physical.fragmentShader,
    };
    material.onBeforeCompile(
      shader as unknown as WebGLProgramParametersWithUniforms,
      {} as unknown as THREE.WebGLRenderer,
    );
    return shader;
  }

  /** 递归展开 #include（模拟 WebGLProgram 的 resolveIncludes），供花括号配平与最终源检查 */
  function expandIncludes(source: string): string {
    let out = source;
    for (let guard = 0; out.includes('#include <') && guard < 10; guard++) {
      out = out.replace(/#include <([\w\d_]+)>/g, (_match, name: string) => {
        const chunk = (THREE.ShaderChunk as unknown as Record<string, string>)[name];
        if (chunk === undefined) throw new Error(`未知 chunk: ${name}`);
        return chunk;
      });
    }
    return out;
  }

  const countOccurrences = (source: string, target: string): number => source.split(target).length - 1;

  it.each(cases)('$label：组装后含噪声库/配方变量与 delta 回收，原生 chunk 原句保留、零 vColor 介入', ({ build }) => {
    for (const material of materialsOf(buildTracked(build))) {
      const { fragmentShader } = assemble(material);
      expect(fragmentShader).toContain('facHash21'); // facility 噪声库注入（import 单一来源）
      expect(fragmentShader).toContain('float facVnoise'); // 库完整性（非仅标记）
      expect(fragmentShader).toContain('// plant-pattern:'); // 配方标记
      expect(fragmentShader).toContain('vec3 plantColorMul'); // 配方调制量声明
      expect(fragmentShader).toContain('roughnessFactor = clamp(roughnessFactor + plantRoughDelta'); // 糙度回收
      expect(fragmentShader).toContain('metalnessFactor = clamp(metalnessFactor + plantMetalDelta'); // 金属度回收
      // 原生 chunk 原句保留（各恰一次——替换式注入未删改原句）
      expect(countOccurrences(fragmentShader, '#include <map_fragment>')).toBe(1);
      expect(countOccurrences(fragmentShader, '#include <color_fragment>')).toBe(1);
      expect(countOccurrences(fragmentShader, '#include <roughnessmap_fragment>')).toBe(1);
      expect(countOccurrences(fragmentShader, '#include <metalnessmap_fragment>')).toBe(1);
      // instanceColor 乘算链不被触碰：注入代码零 vColor 介入（源未展开 chunk，vColor 只可能来自注入）
      expect(fragmentShader).not.toContain('vColor');
    }
  });

  it('位置域配方（冠层/花卉）顶点注入 vPlantPos 物体空间位置 varying；树皮配方顶点保持原样', () => {
    const oak = materialsOf(buildTracked(buildOak));
    const canopy = assemble(oak[1]!);
    expect(canopy.vertexShader).toContain('varying vec3 vPlantPos;');
    expect(canopy.vertexShader).toContain('vPlantPos = transformed;'); // <begin_vertex> 后取物体空间位置（实例矩阵前的属性）
    expect(canopy.fragmentShader).toContain('vPlantPos');

    const bark = assemble(oak[0]!);
    expect(bark.vertexShader).not.toContain('vPlantPos'); // uv 域配方无位置 varying
    expect(bark.fragmentShader).not.toContain('vPlantPos');
    expect(bark.fragmentShader).toContain('vUv'); // 树皮噪声域为部件 uv（圆柱环绕/高度）

    const shrub = materialsOf(buildTracked(buildShrub));
    expect(assemble(shrub[0]!).vertexShader).toContain('vPlantPos = transformed;'); // 单值形态槽位同口径
  });

  it.each(cases)('$label：注入后的完整片元源 include 全展开、结构配平差值为零变化', ({ build }) => {
    // three 自身 chunk 存在注释/宏内的孤立花括号，裸配平不成立——断言注入前后配平差值不变
    const braceDelta = (source: string): number => countOccurrences(source, '{') - countOccurrences(source, '}');
    const pristineFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristineVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    for (const material of materialsOf(buildTracked(build))) {
      const assembled = assemble(material);
      const expanded = expandIncludes(assembled.fragmentShader);
      expect(expanded).not.toContain('#include <'); // 展开完备（无未知/残留 chunk）
      expect(braceDelta(expanded)).toBe(pristineFragment); // 片元结构配平差值不变
      expect(braceDelta(assembled.vertexShader)).toBe(pristineVertex); // 顶点同口径
      expect(expanded).toContain('plantColorMul'); // 配方代码在最终源内
    }
  });
});

describe('植物材质阶段（T003.4 阶段二）：配方成本纪律（10 万实例每像素预算）', () => {
  const count = (source: string, target: string): number => source.split(target).length - 1;

  it('注册表 7 配方：折算 ALU ≤6×（hash21=1 / vnoise=3 / fbm2=6），非树皮配方 ≤4×', () => {
    for (const recipe of PLANT_RECIPES) {
      const cost = count(recipe.body, 'facFbm2(') * 6 + count(recipe.body, 'facVnoise(') * 3 + count(recipe.body, 'facHash21(');
      expect(cost, `配方 ${recipe.key} 超每像素预算`).toBeLessThanOrEqual(6);
      if (!recipe.key.startsWith('bark')) {
        expect(cost, `配方 ${recipe.key}（叶团/花卉）应 ≤4×`).toBeLessThanOrEqual(4);
      }
    }
  });

  it('配方主体零循环/零纹理采样/零 uniform（确定性纯函数，无时间依赖）', () => {
    for (const recipe of PLANT_RECIPES) {
      expect(recipe.body).not.toContain('for (');
      expect(recipe.body).not.toContain('while');
      expect(recipe.body).not.toContain('texture'); // 零采样（零纹理资源，D13）
      expect(recipe.body).not.toContain('uniform'); // 零 uniform（常量烘进 GLSL）
    }
  });

  it('域纪律：uv 配方只碰 vUv、位置域配方只碰 vPlantPos（异构 uv 域不吃）', () => {
    for (const recipe of PLANT_RECIPES) {
      expect(recipe.body.includes('vUv'), `${recipe.key} 的 vUv 使用应与 uv 声明一致`).toBe(Boolean(recipe.uv));
      expect(recipe.body.includes('vPlantPos'), `${recipe.key} 的 vPlantPos 使用应与 objectPosition 声明一致`).toBe(Boolean(recipe.objectPosition));
    }
  });
});

describe('植物材质阶段（T003.4 阶段二）：注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 缺失 → 抛「注入点缺失」', () => {
    const material = createOakBarkMaterial({ color: 0x5a4633, metalness: 0, roughness: 0.95 });
    try {
      const fragmentShader = THREE.ShaderLib.physical.fragmentShader.replace('#include <map_fragment>', '');
      expect(() =>
        material.onBeforeCompile(
          { vertexShader: THREE.ShaderLib.physical.vertexShader, fragmentShader } as unknown as WebGLProgramParametersWithUniforms,
          {} as unknown as THREE.WebGLRenderer,
        ),
      ).toThrow(/注入点缺失/);
    } finally {
      material.dispose();
    }
  });

  it('位置域配方顶点注入点缺失 → 抛「注入点缺失」', () => {
    const material = createShrubCanopyMaterial({ color: 0x3f7034, metalness: 0, roughness: 0.9 });
    try {
      expect(() =>
        material.onBeforeCompile(
          { vertexShader: 'void main() {}', fragmentShader: THREE.ShaderLib.physical.fragmentShader } as unknown as WebGLProgramParametersWithUniforms,
          {} as unknown as THREE.WebGLRenderer,
        ),
      ).toThrow(/注入点缺失/);
    } finally {
      material.dispose();
    }
  });
});

describe('植物材质阶段（T003.4 阶段二）：缓存兼容冒烟（真实 ProceduralSourceCache）', () => {
  it('四资产各 load 成功一次并 dispose（注入材质 + 单值形态走完整缓存生命周期）', async () => {
    const cache = new ProceduralSourceCache();
    try {
      for (const { metaId } of cases) {
        const source = await cache.load(metaId);
        expect(source.geometry.getAttribute('position')).toBeTruthy();
        expect(materialsOf(source).length).toBeGreaterThan(0);
      }
      expect(cache.size).toBe(cases.length);
    } finally {
      cache.dispose(); // 内部对全部注入材质（数组与单值两形态）执行 dispose——注入闭包/无纹理下不炸
    }
    expect(cache.size).toBe(0);
  });
});
