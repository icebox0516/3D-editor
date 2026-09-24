/**
 * tests/runtime/procedural/tree/treeFadeDither.test.ts —— T021.3 共享 dither fade 注入测试。
 *
 * 覆盖（真实 THREE.ShaderLib 源组装 + JS 数值复算，零 WebGL）：
 * - 缝契约对齐：FADE_DITHER_ATTRIBUTE ≡ runtime/instancing/fadeGeometry FADE_ATTRIBUTE
 *   （材质面字符串契约与 runtime 属性缝同步——不 import 耦合的替代锁定面）；
 * - 注入存在性与合成顺序（必答题断言面）：顶点 attribute/varying 声明与赋值、片元
 *   alphatest_fragment 之后 discard 门——fade 段不触碰 diffuseColor（alpha 通道零介入，
 *   alphaTest 0.5 + alphaToCoverage 的 A2C 输入值流逐位不变）、不触碰 color_fragment；
 * - dither 图案：IGN 屏幕域字面量、无时间项、零 uniform（fade 段零 'uniform'）、
 *   uniforms 集合无 fade 增项；
 * - 零回退机制：严格小于 + 退场度在右侧（vFadeOut=0 ⟹ ign<0 恒假 ⟹ 零 discard）；
 *   JS 复算 IGN / 镜像值域 [0,1)；材质参数（alphaTest/alphaToCoverage/side）不因注入改；
 * - 镜像互补（双表示交叉无空洞无双绘的数学面）：JS 复算 direct/mirrored 存活集在
 *   互补恒和（outgoing f / incoming 1−f）下恰一侧存活（边界等值除外）；
 * - 缓存键：'+dither' / '+dither:mirror' 后缀、重复应用即抛；
 * - 注入点缺失即抛（alphatest_fragment / common 锚点摘除暴雷）；
 * - 应用面扫描：13 树种 × {leaf, bark} × 3 档注入存在 + 键后缀 + direct 变体；canopy
 *   13 树种 card/trunk 镜像变体；**深度材质零注入**（物种 customDepthMaterial 三档 +
 *   canopy depth——阴影走中点切换 §5.4）；canopy 注入后 uTime 桥接不破坏。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { FADE_ATTRIBUTE } from '../../../../src/runtime/instancing/fadeGeometry';
import {
  applyTreeFadeDither,
  FADE_DITHER_ATTRIBUTE,
  FADE_DITHER_CACHE_MARKER,
} from '../../../../src/runtime/procedural/tree/treeFadeDither';
import {
  BROADLEAF_CANOPY_MATERIAL_ASSET_IDS,
  createBroadleafCanopyMaterials,
} from '../../../../src/runtime/procedural/tree/broadleafCanopyMaterials';
import { createTree3aLeafMaterial, createTree3aBarkMaterial, createTree3aLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/tree3a/tree3aMaterials';
import { createCamphorLeafMaterial, createCamphorBarkMaterial, createCamphorLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/camphor/camphorMaterials';
import { createCeltisLeafMaterial, createCeltisBarkMaterial, createCeltisLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/celtis/celtisMaterials';
import { createZelkovaLeafMaterial, createZelkovaBarkMaterial, createZelkovaLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/zelkova/zelkovaMaterials';
import { createGinkgoLeafMaterial, createGinkgoBarkMaterial, createGinkgoLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoMaterials';
import { createBischofiaLeafMaterial, createBischofiaBarkMaterial, createBischofiaLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaMaterials';
import { createFraxinusLeafMaterial, createFraxinusBarkMaterial, createFraxinusLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusMaterials';
import { createKoelreuteriaLeafMaterial, createKoelreuteriaBarkMaterial, createKoelreuteriaLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaMaterials';
import { createLigustrumLeafMaterial, createLigustrumBarkMaterial, createLigustrumLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumMaterials';
import { createPlatanusLeafMaterial, createPlatanusBarkMaterial, createPlatanusLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/platanus/platanusMaterials';
import { createSalixLeafMaterial, createSalixBarkMaterial, createSalixLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/salix/salixMaterials';
import { createSophoraLeafMaterial, createSophoraBarkMaterial, createSophoraLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/sophora/sophoraMaterials';
import { createTriadicaLeafMaterial, createTriadicaBarkMaterial, createTriadicaLeafDepthMaterial } from '../../../../src/runtime/procedural/tree/triadica/triadicaMaterials';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { assemble, count } from '../../../support/procedural-tree/materialHarness';

// ── 工具 ─────────────────────────────────────────────────────────────────────

/** 提取 fade 注入段（首行标记到 discard 行——合成顺序/零介入断言的解析面） */
function fadeSegment(fragmentShader: string): string {
  const start = fragmentShader.indexOf('// tree fade dither');
  expect(start, 'fade 段应存在').toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('discard;', start);
  expect(end, 'fade 段应有 discard').toBeGreaterThan(start);
  return fragmentShader.slice(start, end + 'discard;'.length);
}

/** JS 复算 IGN（GLSL fract = v − floor(v)；GPU float32 与 JS double 有低位差——断言值域与互补结构，非逐位对账） */
const fract = (v: number): number => v - Math.floor(v);
const ignAt = (x: number, y: number): number => fract(52.9829189 * fract(0.06711056 * x + 0.00583715 * y));

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];

const SPECIES_LEAF: Record<string, (level?: ProceduralLevel) => THREE.MeshStandardMaterial> = {
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

const SPECIES_BARK: Record<string, (level?: ProceduralLevel) => THREE.MeshStandardMaterial> = {
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

const SPECIES_DEPTH: Record<string, (level?: ProceduralLevel) => THREE.MeshDepthMaterial> = {
  asset_tree_3a: createTree3aLeafDepthMaterial,
  asset_tree_camphor: createCamphorLeafDepthMaterial,
  asset_tree_celtis: createCeltisLeafDepthMaterial,
  asset_tree_zelkova: createZelkovaLeafDepthMaterial,
  asset_tree_ginkgo: createGinkgoLeafDepthMaterial,
  asset_tree_bischofia: createBischofiaLeafDepthMaterial,
  asset_tree_fraxinus: createFraxinusLeafDepthMaterial,
  asset_tree_koelreuteria: createKoelreuteriaLeafDepthMaterial,
  asset_tree_ligustrum: createLigustrumLeafDepthMaterial,
  asset_tree_platanus: createPlatanusLeafDepthMaterial,
  asset_tree_salix: createSalixLeafDepthMaterial,
  asset_tree_sophora: createSophoraLeafDepthMaterial,
  asset_tree_triadica: createTriadicaLeafDepthMaterial,
};

// ── 缝契约对齐 ───────────────────────────────────────────────────────────────

describe('缝契约对齐（runtime/instancing/fadeGeometry）', () => {
  it('FADE_DITHER_ATTRIBUTE ≡ FADE_ATTRIBUTE（aFadeOut——字符串契约跨面同步）', () => {
    expect(FADE_DITHER_ATTRIBUTE).toBe(FADE_ATTRIBUTE);
    expect(FADE_DITHER_ATTRIBUTE).toBe('aFadeOut');
  });
});

// ── 注入存在性与合成顺序（必答题断言面）──────────────────────────────────────

describe('注入存在性与合成顺序（alphatest_fragment 之后的独立 discard 门）', () => {
  it('顶点声明 attribute/varying 并在 begin_vertex 后赋值；片元声明 varying', () => {
    const shader = assemble(createCeltisLeafMaterial(), THREE.ShaderLib.physical);
    expect(shader.vertexShader).toContain('attribute float aFadeOut;');
    expect(shader.vertexShader).toContain('varying float vFadeOut;');
    expect(shader.vertexShader).toContain('vFadeOut = aFadeOut;');
    expect(shader.vertexShader.indexOf('#include <begin_vertex>')).toBeLessThan(shader.vertexShader.indexOf('vFadeOut = aFadeOut;'));
    expect(shader.fragmentShader).toContain('varying float vFadeOut;');
  });

  it('discard 门位于 #include <alphatest_fragment> 之后（three 随机 alpha 裁切的 alphahash 槽位）；锚点原句保留', () => {
    const shader = assemble(createCeltisLeafMaterial(), THREE.ShaderLib.physical);
    const anchorAt = shader.fragmentShader.indexOf('#include <alphatest_fragment>');
    const discardAt = shader.fragmentShader.indexOf('if (tfdNoise < vFadeOut) discard;');
    expect(anchorAt).toBeGreaterThanOrEqual(0);
    expect(discardAt).toBeGreaterThan(anchorAt); // 必答题：fade 在既有 alphaTest 裁切之后（AND 门——次序不改变存活集合，占 three 原生槽位）
    expect(count(shader.fragmentShader, '#include <alphatest_fragment>')).toBe(1); // 原句保留（append-only）
    expect(count(shader.fragmentShader, '#include <color_fragment>')).toBe(1); // vColor 乘算链零触碰
  });

  it('fade 段零介入 alpha 通道：段内无 diffuseColor；片元 alpha 写入仍只来自 SDF（count = 1）', () => {
    const shader = assemble(createCeltisLeafMaterial(), THREE.ShaderLib.physical);
    const segment = fadeSegment(shader.fragmentShader);
    expect(segment).not.toContain('diffuseColor'); // A2C 输入值流零改动——坡宽 0.04 / 75% 齿幅纪律的输入面不变
    expect(count(shader.fragmentShader, 'diffuseColor.a =')).toBe(1); // 唯一 alpha 写 = 物种 SDF 覆盖率（fade 不加写不缩放）
  });

  it('无 alphaTest 的消费方（树皮）同门注入——纯 fade 单门形态', () => {
    const shader = assemble(createCeltisBarkMaterial(), THREE.ShaderLib.physical);
    expect(shader.fragmentShader).toContain('if (tfdNoise < vFadeOut) discard;');
    expect(fadeSegment(shader.fragmentShader)).not.toContain('diffuseColor');
  });

  it('既有工厂注入共存（hook 链）：SDF / 风动 / 透光段完整保留', () => {
    const shader = assemble(createCeltisLeafMaterial(), THREE.ShaderLib.physical);
    expect(shader.fragmentShader).toContain('float t3cLeafAlpha('); // SDF 完整
    expect(shader.vertexShader).toContain('t3cWindH'); // 风动完整
    expect(shader.fragmentShader).toContain('outgoingLight +='); // 透光完整
    expect((shader.uniforms as Record<string, unknown>).uTime).toBeDefined(); // uTime 桥接不破坏
  });
});

// ── dither 图案与零 uniform ─────────────────────────────────────────────────

describe('dither 图案（IGN 屏幕域）与零 uniform', () => {
  it('图案 = 交错梯度噪声 on gl_FragCoord（屏幕域字面量锁定）；无时间项；fade 段零 uniform 零采样零循环', () => {
    const shader = assemble(createCeltisLeafMaterial(), THREE.ShaderLib.physical);
    expect(shader.fragmentShader).toContain('fract(52.9829189 * fract(0.06711056 * gl_FragCoord.x + 0.00583715 * gl_FragCoord.y))');
    const segment = fadeSegment(shader.fragmentShader);
    expect(segment).toContain('gl_FragCoord');
    expect(segment).not.toContain('uTime'); // 无时间项——静止相机逐像素逐帧稳定
    expect(segment).not.toContain('uniform');
    expect(segment).not.toContain('texture');
    expect(segment).not.toContain('for (');
  });

  it('uniforms 集合无 fade 增项（零渲染循环开销——沿 plantMaterials 纪律）', () => {
    const shader = assemble(createCeltisLeafMaterial(), THREE.ShaderLib.physical);
    expect(Object.keys(shader.uniforms)).toEqual(['uTime']); // 仅既有 uTime
    const canopy = assemble(createBroadleafCanopyMaterials('asset_tree_3a').cardMaterial, THREE.ShaderLib.physical);
    expect(Object.keys(canopy.uniforms)).toEqual(['uTime']);
  });
});

// ── 零回退机制（vFadeOut = 0 ⟹ 行为逐位不变的根据）─────────────────────────

describe('零回退机制（aFadeOut 缺省 0 / 稳态零写）', () => {
  it('比较方向锁定：严格小于 + 退场度在右侧——vFadeOut=0 时 ign<0 恒假 ⟹ 零 discard', () => {
    const shader = assemble(createCeltisLeafMaterial(), THREE.ShaderLib.physical);
    expect(shader.fragmentShader).toContain('if (tfdNoise < vFadeOut) discard;'); // 图案常量在左、varying 退场度在右（互补性方向）
    expect(shader.fragmentShader).not.toContain('<= vFadeOut');
    expect(shader.fragmentShader).not.toContain('vFadeOut < tfdNoise');
  });

  it('JS 复算 IGN 值域 [0,1)：对采样像素格全值不越界（fract 双层包络的数学保证）', () => {
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const v = ignAt(x + 0.5, y + 0.5); // gl_FragCoord 像素中心
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1); // < 0 恒假 ⟹ vFadeOut=0 永不触发 discard
        const mirrored = 1 - v;
        expect(mirrored).toBeGreaterThan(0);
        expect(mirrored).toBeLessThanOrEqual(1); // 镜像 ∈ (0,1]：< 0 恒假同理
      }
    }
  });

  it('材质参数不因注入改（守卫路径——底参契约逐位保持）', () => {
    for (const id of Object.keys(SPECIES_LEAF)) {
      const leaf = SPECIES_LEAF[id]!();
      expect(leaf.alphaTest, `${id} 叶 alphaTest 应 0.5`).toBe(0.5);
      expect(leaf.alphaToCoverage, `${id} 叶 A2C 应开`).toBe(true);
      expect(leaf.side, `${id} 叶 DoubleSide`).toBe(THREE.DoubleSide);
      expect(leaf.map, `${id} 零贴图`).toBeNull();
      const bark = SPECIES_BARK[id]!();
      expect(bark.transparent, `${id} 皮不透明（fade 不引入透明度——§5.3 不用普通透明度）`).toBe(false);
    }
  });
});

// ── 镜像互补（双表示交叉无透底空洞 / 无同像素双绘）──────────────────────────

describe('镜像互补（direct 物种侧 × mirrored canopy 侧）', () => {
  it('交叉期（互补恒和 f + (1−f) = 1）同像素恰一侧存活：无「双侧全死」透底空洞，无双绘重叠（边界等值除外）', () => {
    for (const p of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const ign = ignAt(x + 0.5, y + 0.5);
          const directDead = ign < p; // species（outgoing fadeOut=p）
          const mirroredDead = 1 - ign < 1 - p; // canopy（incoming fadeOut=1−p）⟺ ign > p
          expect(directDead && mirroredDead, `p=${p} 不应双侧全死（透底空洞）`).toBe(false);
          if (!directDead && !mirroredDead) {
            // 双活仅允许边界等值（测度零）
            expect(ign === p || ign >= p === ign > p, `p=${p} 双活仅边界等值`).toBe(true);
          }
        }
      }
    }
  });

  it('单侧退场单调：direct 与 mirrored 的 presence = 1 − fadeOut（Low→Cull / Canopy→Cull 各自独立正确）', () => {
    for (const fade of [0, 0.25, 0.5, 0.75, 1]) {
      let directAlive = 0;
      let mirroredAlive = 0;
      const n = 32 * 32;
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const ign = ignAt(x + 0.5, y + 0.5);
          if (!(ign < fade)) directAlive++;
          if (!(1 - ign < fade)) mirroredAlive++;
        }
      }
      expect(directAlive / n).toBeCloseTo(1 - fade, 1); // 密度 ≈ presence（IGN 低差异）
      expect(mirroredAlive / n).toBeCloseTo(1 - fade, 1);
    }
  });
});

// ── 缓存键与重复应用 ─────────────────────────────────────────────────────────

describe('缓存键（配方变即键变）与重复应用守卫', () => {
  it('键追加后缀：species direct / canopy mirrored；direct 与 mirrored 互异', () => {
    expect(createCeltisLeafMaterial().customProgramCacheKey()).toBe(`celtis:leaf${FADE_DITHER_CACHE_MARKER}`);
    expect(createCeltisBarkMaterial('mid').customProgramCacheKey()).toBe('celtis:bark:mid+dither');
    const set = createBroadleafCanopyMaterials('asset_tree_3a');
    expect(set.cardMaterial.customProgramCacheKey()).toBe('canopy:card:asset_tree_3a+dither:mirror');
    expect(set.trunkMaterial.customProgramCacheKey()).toBe('canopy:trunk:asset_tree_3a+dither:mirror');
    expect(set.cardMaterial.customProgramCacheKey()).not.toBe(createCeltisLeafMaterial().customProgramCacheKey());
  });

  it('重复应用即抛（双注入会产生重复声明）', () => {
    const material = new THREE.MeshStandardMaterial();
    applyTreeFadeDither(material);
    expect(() => applyTreeFadeDither(material)).toThrow(/重复应用/);
    material.dispose();
  });

  it('无既有注入的裸材质可独立应用（standalone 鲁棒性）', () => {
    const material = new THREE.MeshStandardMaterial({ alphaTest: 0.5, alphaToCoverage: true });
    applyTreeFadeDither(material);
    expect(material.customProgramCacheKey().endsWith(FADE_DITHER_CACHE_MARKER)).toBe(true);
    const shader = assemble(material, THREE.ShaderLib.physical);
    expect(shader.fragmentShader).toContain('if (tfdNoise < vFadeOut) discard;');
    material.dispose();
  });
});

// ── 注入点缺失即抛 ───────────────────────────────────────────────────────────

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 alphatest_fragment 摘除 → 抛「注入点缺失」', () => {
    const material = applyTreeFadeDither(new THREE.MeshStandardMaterial());
    expect(() =>
      material.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader,
          fragmentShader: THREE.ShaderLib.physical.fragmentShader.replace('#include <alphatest_fragment>', ''),
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);
    material.dispose();
  });

  it('顶点 begin_vertex / common 摘除 → 抛「注入点缺失」', () => {
    for (const anchor of ['#include <begin_vertex>', '#include <common>']) {
      const material = applyTreeFadeDither(new THREE.MeshStandardMaterial());
      expect(() =>
        material.onBeforeCompile(
          {
            vertexShader: THREE.ShaderLib.physical.vertexShader.replace(anchor, ''),
            fragmentShader: THREE.ShaderLib.physical.fragmentShader,
            uniforms: {},
          } as unknown as WebGLProgramParametersWithUniforms,
          {} as unknown as THREE.WebGLRenderer,
        ),
      ).toThrow(/注入点缺失/);
      material.dispose();
    }
  });
});

// ── 应用面扫描（13 树种 × {leaf, bark} × 3 档 + canopy；深度材质零注入）──────

describe('应用面扫描', () => {
  const SPECIES_IDS = Object.keys(SPECIES_LEAF);

  it('13 树种叶/皮全档注入：标记存在 + 键 +dither 后缀（非 mirror）+ direct 图案', () => {
    for (const id of SPECIES_IDS) {
      for (const level of LEVELS) {
        for (const make of [SPECIES_LEAF[id]!, SPECIES_BARK[id]!]) {
          const material = make(level);
          const shader = assemble(material, THREE.ShaderLib.physical);
          expect(shader.vertexShader, `${id}:${level} 顶点应声明 aFadeOut`).toContain('attribute float aFadeOut;');
          expect(shader.vertexShader, `${id}:${level} 顶点应赋值 vFadeOut`).toContain('vFadeOut = aFadeOut;');
          expect(shader.fragmentShader, `${id}:${level} 片元应含 discard 门`).toContain('if (tfdNoise < vFadeOut) discard;');
          expect(shader.fragmentShader, `${id}:${level} direct 变体（无镜像项）`).not.toContain('1.0 - fract(52.9829189');
          expect(material.customProgramCacheKey(), `${id}:${level} 键应含 +dither`).toContain('+dither');
          expect(material.customProgramCacheKey(), `${id}:${level} 键不应含 mirror`).not.toContain(':mirror');
          material.dispose();
        }
      }
    }
  });

  it('canopy 13 树种 card/trunk 镜像注入：1−IGN 图案 + 键 +dither:mirror', () => {
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const set = createBroadleafCanopyMaterials(id);
      for (const material of [set.cardMaterial, set.trunkMaterial]) {
        const shader = assemble(material, THREE.ShaderLib.physical);
        expect(shader.fragmentShader, `${id} 应含镜像图案`).toContain('1.0 - fract(52.9829189');
        expect(shader.fragmentShader, `${id} 应含 discard 门`).toContain('if (tfdNoise < vFadeOut) discard;');
        expect(shader.vertexShader, `${id} 顶点应声明 aFadeOut`).toContain('attribute float aFadeOut;');
        expect(material.customProgramCacheKey(), `${id} 键应为 mirror 变体`).toContain('+dither:mirror');
        material.dispose();
      }
      set.depthMaterial.dispose(); // 深度材质登记 dispose（不注入——下方断言）
    }
  });

  it('深度材质零注入（阴影走中点切换 §5.4，不做双 Shadow 交叉渐变）：物种三档 + canopy depth 无 fade 面、键无后缀', () => {
    for (const id of SPECIES_IDS) {
      for (const level of LEVELS) {
        const material = SPECIES_DEPTH[id]!(level);
        const shader = assemble(material, THREE.ShaderLib.depth);
        expect(shader.vertexShader + shader.fragmentShader, `${id}:${level} 深度不应含 fade 属性`).not.toContain('aFadeOut');
        expect(shader.vertexShader + shader.fragmentShader, `${id}:${level} 深度不应含 fade discard`).not.toContain('tfdNoise');
        expect(material.customProgramCacheKey(), `${id}:${level} 深度键应无 dither 后缀`).not.toContain('+dither');
        material.dispose();
      }
    }
    for (const id of BROADLEAF_CANOPY_MATERIAL_ASSET_IDS) {
      const set = createBroadleafCanopyMaterials(id);
      const shader = assemble(set.depthMaterial, THREE.ShaderLib.depth);
      expect(shader.vertexShader + shader.fragmentShader, `${id} canopy 深度不应含 fade 面`).not.toContain('aFadeOut');
      expect(set.depthMaterial.customProgramCacheKey(), `${id} canopy 深度键应无 dither 后缀`).not.toContain('+dither');
      set.cardMaterial.dispose();
      set.trunkMaterial.dispose();
      set.depthMaterial.dispose();
    }
  });
});
