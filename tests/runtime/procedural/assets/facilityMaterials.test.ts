/**
 * tests/runtime/procedural/assets/facilityMaterials.test.ts —— 设施资产包材质阶段测试（T002.4 阶段二）。
 *
 * 覆盖（table-driven，五资产同口径；真实 THREE 对象，零 mock——onBeforeCompile 用
 * 含 three 注入点标记的桩源组装，静态字符串断言，无需 WebGL）：
 * - 注入存在性：升级槽位挂自有 onBeforeCompile + defines.USE_UV（无贴图材质的
 *   vUv 通路）+ facility 前缀 program 缓存键；未升级槽位（路灯发光板/垃圾桶底座环
 *   与投口内衬）保持纯参数化（无自有 onBeforeCompile、无 USE_UV）；
 * - 合批与变体通路：全部材质仍是 MeshStandardMaterial（InstancedMesh + instanceColor
 *   前提）；同配方跨资产共享 program 键（9 个注入 program 收敛）、异配方键互异；
 * - 无共享：两次 build 材质实例互不相同（缓存会 dispose 所持资源）；
 * - 零纹理资源：纯注入路线不挂任何 map——材质 dispose 无遗留可释放物
 *   （three 材质 dispose 不自动释放纹理，故以零纹理从根上免除联动释放义务）；
 * - shader 源完整性：组装后含配方标记与噪声函数（facHash21/fac 配方变量）、
 *   roughness/metalness delta 回收语句；原生 chunk 原句保留（map/roughness/
 *   metalness/color_fragment 各恰一次）、注入代码零 vColor 介入（instanceColor
 *   乘算链不被触碰）；旋压配方顶点含 vFacNormal 物体法线 varying，非旋压配方无；
 * - 缓存冒烟：真实 ProceduralSourceCache load 五资产各成功一次并 dispose
 *   （注入材质走完整缓存生命周期不炸）。
 * 边界：测试内 build 出的 geometry/material 登记后由 afterEach 统一 dispose 兜底，
 *      不跨测试泄漏 GPU 资源；同槽共享材质实例 Set 去重后只 dispose 一次。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';
import type { ProceduralBuild } from '../../../../src/runtime/procedural/types';
import { ProceduralSourceCache } from '../../../../src/runtime/procedural/ProceduralSourceCache';
import { build as buildStreetlamp, meta as streetlampMeta } from '../../../../src/runtime/procedural/assets/streetlamp.asset';
import { build as buildParkbench, meta as parkbenchMeta } from '../../../../src/runtime/procedural/assets/parkbench.asset';
import { build as buildTrashbin, meta as trashbinMeta } from '../../../../src/runtime/procedural/assets/trashbin.asset';
import { build as buildHydrant, meta as hydrantMeta } from '../../../../src/runtime/procedural/assets/hydrant.asset';
import { build as buildSignpost, meta as signpostMeta } from '../../../../src/runtime/procedural/assets/signpost.asset';

interface MaterialCase {
  label: string;
  metaId: string;
  build: ProceduralBuild;
  /** 各 materialIndex 是否应挂程序化注入（阶段二升级范围） */
  injected: boolean[];
}

/** 5 资产注入范围（与资产头部分层表一一对应）：路灯 0–4 升级、5 发光板不动；垃圾桶 11/14 不动；其余全升级 */
const cases: MaterialCase[] = [
  { label: '路灯', metaId: streetlampMeta.id, build: buildStreetlamp, injected: [true, true, true, true, true, false] },
  {
    label: '公园长椅',
    metaId: parkbenchMeta.id,
    build: buildParkbench,
    injected: Array.from({ length: 17 }, () => true), // 木 0–6 + 金属 7–16 全升级
  },
  {
    label: '垃圾桶',
    metaId: trashbinMeta.id,
    build: buildTrashbin,
    injected: [...Array.from({ length: 11 }, () => true), false, true, true, false, true], // 11 底座环 / 14 内衬不动
  },
  { label: '消防栓', metaId: hydrantMeta.id, build: buildHydrant, injected: Array.from({ length: 8 }, () => true) },
  { label: '标识牌', metaId: signpostMeta.id, build: buildSignpost, injected: [true, true, true, true] },
];

const built: InstanceSource[] = [];

/** 跟踪式构建：产物登记进 built，afterEach 统一 dispose 兜底 */
function buildTracked(build: ProceduralBuild): InstanceSource {
  const source = build();
  built.push(source);
  return source;
}

/** material 统一为数组形态 */
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

describe('设施材质阶段（T002.4 阶段二）：注入存在性', () => {
  it.each(cases)('$label：升级槽位挂 onBeforeCompile + USE_UV + facility 缓存键，未升级槽位保持纯参数化', ({ build, injected }) => {
    const materials = materialsOf(buildTracked(build));
    expect(materials.length).toBe(injected.length);
    materials.forEach((material, index) => {
      if (injected[index]) {
        expect(isInjected(material), `槽位 ${index} 应挂注入`).toBe(true);
        expect(material.defines?.USE_UV, `槽位 ${index} 应打开 vUv 通路`).toBe('');
        expect(material.customProgramCacheKey().startsWith('facility:'), `槽位 ${index} 应有 facility program 键`).toBe(true);
      } else {
        expect(isInjected(material), `槽位 ${index} 不应挂注入`).toBe(false);
        expect(material.defines?.USE_UV, `槽位 ${index} 不应有 USE_UV`).toBeUndefined();
      }
    });
  });
});

describe('设施材质阶段（T002.4 阶段二）：合批与变体通路', () => {
  it.each(cases)('$label：全部材质仍是 MeshStandardMaterial（InstancedMesh/instanceColor 前提）', ({ build }) => {
    for (const material of materialsOf(buildTracked(build))) {
      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    }
  });

  it('五资产共收敛 9 个注入 program；同配方跨资产共享键、异配方互异', () => {
    const lamp = materialsOf(buildTracked(buildStreetlamp));
    const bench = materialsOf(buildTracked(buildParkbench));
    const bin = materialsOf(buildTracked(buildTrashbin));
    const hydrant = materialsOf(buildTracked(buildHydrant));
    const sign = materialsOf(buildTracked(buildSignpost));
    const keys = new Set(
      [...lamp, ...bench, ...bin, ...hydrant, ...sign].filter(isInjected).map((m) => m.customProgramCacheKey()),
    );
    // wood / pole-metal / worn-frame / bin-shell / lathe / fine-grain / edge-worn / cast-iron / matte-fade
    expect(keys.size).toBe(9);
    expect(lamp[0]!.customProgramCacheKey()).toBe(sign[1]!.customProgramCacheKey()); // 杆件拉丝：路灯 ↔ 标识牌立柱
    expect(sign[2]!.customProgramCacheKey()).toBe(sign[3]!.customProgramCacheKey()); // 哑光漆：牌面 ↔ 指路带
    expect(bin[15]!.customProgramCacheKey()).toBe(lamp[4]!.customProgramCacheKey()); // 细颗粒：翻盖板 ↔ 灯壳
    expect(bench[0]!.customProgramCacheKey()).not.toBe(bench[7]!.customProgramCacheKey()); // 木纹 ≠ 金属
  });
});

describe('设施材质阶段（T002.4 阶段二）：无共享与零纹理资源', () => {
  it.each(cases)('$label：两次调用材质均为新实例（无模块级共享）', ({ build }) => {
    const matsA = new Set(materialsOf(buildTracked(build)));
    for (const material of materialsOf(buildTracked(build))) expect(matsA.has(material)).toBe(false);
  });

  it('纯注入路线零纹理资源：五资产全部材质不挂任何 map（dispose 无遗留可释放物）', () => {
    const textureSlots = ['map', 'roughnessMap', 'metalnessMap', 'normalMap', 'aoMap', 'emissiveMap', 'alphaMap'] as const;
    for (const { build } of cases) {
      for (const material of materialsOf(buildTracked(build))) {
        for (const slot of textureSlots) expect(material[slot], `${slot} 应为空`).toBeNull();
      }
    }
  });
});

describe('设施材质阶段（T002.4 阶段二）：shader 源完整性（对 three 真实源组装）', () => {
  /** 用真实 THREE.ShaderLib.physical 源组装（onBeforeCompile 在 include 解析前运行于该源——真实环境形态，
   *  比stub更能暴露注入点漂移） */
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

  it.each(cases)('$label：升级材质组装后含噪声库/配方标记与 delta 回收，原生 chunk 原句保留', ({ build, injected }) => {
    const materials = materialsOf(buildTracked(build));
    materials.forEach((material, index) => {
      if (!injected[index]) return;
      const { fragmentShader } = assemble(material);
      expect(fragmentShader).toContain('facHash21'); // 公共噪声库注入
      expect(fragmentShader).toContain('float facVnoise'); // 库完整性（非仅标记）
      expect(fragmentShader).toContain('vec3 facColorMul'); // 配方调制量声明
      expect(fragmentShader).toContain('roughnessFactor = clamp(roughnessFactor + facRoughDelta'); // 糙度回收
      expect(fragmentShader).toContain('metalnessFactor = clamp(metalnessFactor + facMetalDelta'); // 金属度回收
      // 原生 chunk 原句保留（各恰一次——替换式注入未删改原句）
      expect(countOccurrences(fragmentShader, '#include <map_fragment>')).toBe(1);
      expect(countOccurrences(fragmentShader, '#include <color_fragment>')).toBe(1);
      expect(countOccurrences(fragmentShader, '#include <roughnessmap_fragment>')).toBe(1);
      expect(countOccurrences(fragmentShader, '#include <metalnessmap_fragment>')).toBe(1);
      // instanceColor 乘算链不被触碰：注入代码零 vColor 介入（桩源未展开 chunk，vColor 只可能来自注入）
      expect(fragmentShader).not.toContain('vColor');
    });
  });

  it('长椅木纹：组装后含年轮/纤维/板差配方变量与配方标记', () => {
    const wood = materialsOf(buildTracked(buildParkbench))[0]!;
    const { fragmentShader } = assemble(wood);
    expect(fragmentShader).toContain('// facility-pattern:wood-slats');
    expect(fragmentShader).toContain('facWoodRing');
    expect(fragmentShader).toContain('facWoodFiber');
    expect(fragmentShader).toContain('facWoodTint');
    expect(fragmentShader).toContain('vUv'); // 程序化纹理域为部件 uv
  });

  it('长椅板条 uv 错域：相邻坐板/坐板与靠背的 uv 域互异（板间差异来源）', () => {
    const { geometry } = buildTracked(buildParkbench);
    const groups = geometry.groups;
    expect(groups.length).toBe(17);
    // 各板条 BoxGeometry 顶点构造序一致——取各组首索引顶点（同基础 uv），黄金比步进错域后必互异
    const uvAtGroupStart = (groupIndex: number): [number, number] => {
      const vertex = geometry.getIndex()!.getX(groups[groupIndex]!.start);
      const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
      return [uv.getX(vertex), uv.getY(vertex)];
    };
    const seatFirst = uvAtGroupStart(0);
    const seatSecond = uvAtGroupStart(1);
    const backFirst = uvAtGroupStart(4); // 靠背首条（组 4–6 为木质）
    expect(seatFirst).not.toEqual(seatSecond);
    expect(seatFirst).not.toEqual(backFirst);
    expect(seatSecond).not.toEqual(backFirst);
  });

  it('垃圾桶盖旋压件：顶点注入物体法线 varying；非旋压配方顶点保持原样', () => {
    const bin = materialsOf(buildTracked(buildTrashbin));
    const lid = assemble(bin[12]!);
    expect(lid.vertexShader).toContain('varying vec3 vFacNormal;');
    expect(lid.vertexShader).toContain('vFacNormal = objectNormal;');
    expect(lid.fragmentShader).toContain('vFacNormal');

    const benchWood = assemble(materialsOf(buildTracked(buildParkbench))[0]!);
    expect(benchWood.vertexShader).not.toContain('vFacNormal');
  });

  it('未升级槽位组装为 no-op（真实源不变）', () => {
    const lamp = materialsOf(buildTracked(buildStreetlamp));
    const assembled = assemble(lamp[5]!); // 发光板
    expect(assembled.vertexShader).toBe(THREE.ShaderLib.physical.vertexShader);
    expect(assembled.fragmentShader).toBe(THREE.ShaderLib.physical.fragmentShader);
  });

  it.each(cases)('$label：升级材质注入后的完整片元源 include 全展开、结构配平差值为零', ({ build, injected }) => {
    // three 自身 chunk 存在注释/宏内的孤立花括号（如 lights_physical_pars_fragment 计 24/23），
    // 裸配平不成立——改为断言注入前后配平差值不变（只隔离本注入的结构完整性）
    const braceDelta = (source: string): number => countOccurrences(source, '{') - countOccurrences(source, '}');
    const pristineFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristineVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    materialsOf(buildTracked(build)).forEach((material, index) => {
      if (!injected[index]) return;
      const assembled = assemble(material);
      const expanded = expandIncludes(assembled.fragmentShader);
      expect(expanded).not.toContain('#include <'); // 展开完备（无未知/残留 chunk）
      expect(braceDelta(expanded)).toBe(pristineFragment); // 片元结构配平差值不变
      expect(braceDelta(assembled.vertexShader)).toBe(pristineVertex); // 顶点同口径
      expect(expanded).toContain('facColorMul'); // 配方代码在最终源内
    });
  });
});

describe('设施材质阶段（T002.4 阶段二）：缓存兼容冒烟（真实 ProceduralSourceCache）', () => {
  it('五资产各 load 成功一次并 dispose（注入材质走完整缓存生命周期）', async () => {
    const cache = new ProceduralSourceCache();
    try {
      for (const { metaId } of cases) {
        const source = await cache.load(metaId);
        expect(source.geometry.getAttribute('uv')).toBeTruthy();
        expect(materialsOf(source).length).toBeGreaterThan(0);
      }
      expect(cache.size).toBe(cases.length);
    } finally {
      cache.dispose(); // 内部对全部注入材质执行 dispose——注入闭包/无纹理下不炸
    }
    expect(cache.size).toBe(0);
  });
});
