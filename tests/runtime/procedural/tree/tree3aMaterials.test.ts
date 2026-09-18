/**
 * tests/runtime/procedural/tree/tree3aMaterials.test.ts —— 夏栎叶/树皮材质 + 风动测试（T008.3）。
 *
 * 覆盖（沿 plantMaterials.test.ts 范式：真实 THREE.ShaderLib 源组装，静态字符串断言，
 * 零 WebGL）：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用（服务写一次
 *   两边生效）；GLSL 声明 uniform float uTime；真实 build() 产物挂场景被 TimeUniformService
 *   逐帧驱动（frame 写值闭环）；
 * - 风动契约：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...)) 类
 *   hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   （uTime·hash(aSeed) 派生）叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入
 *   （逐实例色相微差乘算与注入乘法交换律安全）；
 * - SDF 叶形：alphaTest 0.5 + alphaToCoverage；片元含 t3aLeafAlpha 计算式与 alpha 写入；
 *   深度材质（叶影裁切）含同一 SDF 函数（单一来源）+ 树皮组守卫（aLeafRand=0 实心）+
 *   USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；
 * - 锚点门 R1 微调参数锚定（2026-09-18 四项）：树皮 tri³ 深沟剖面/沟内冷灰 AO/节疤核+
 *   愈伤环/苔痕方位门控；叶齿载波合成锯齿（噪声频率 42 不升——alphaTest 裁切闪烁纪律）/
 *   中脉沟侧翼/透光峰值 0.65；深度材质同一 SDF 齿形同步；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享）但键相同；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 2 处
 *   （锯齿+斑块；另 1 处为库定义）= 6×、皮 2 处 = 6×；顶点/深度零噪声；全源零循环/
 *   零纹理采样；
 * - 注入点缺失即抛（map_fragment/begin_vertex/roughnessmap_fragment/common 摘除各暴雷）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze/unfreeze：冻结忽略时间戳、解冻恢复累计（不回补）、幂等；
 * - 资产换装：build() 材质组序 [皮, 叶] 键对应、底参与侧向/透明裁切配置。
 * 边界：材质登记 afterEach 统一 dispose 兜底（含 build 产物），不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createTree3aBarkMaterial,
  createTree3aLeafDepthMaterial,
  createTree3aLeafMaterial,
} from '../../../../src/runtime/procedural/tree/tree3aMaterials';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_3a.asset';

/** afterEach 统一 dispose 的材质登记（工厂直建 + build 产物） */
const created: THREE.Material[] = [];
const built: InstanceSource[] = [];

function track<T extends THREE.Material>(material: T): T {
  created.push(material);
  return material;
}

/** 用真实 ShaderLib 源组装（onBeforeCompile 运行于 include 解析前的真实环境形态） */
function assemble(
  material: THREE.Material,
  lib: { vertexShader: string; fragmentShader: string },
): { vertexShader: string; fragmentShader: string; uniforms: Record<string, { value: unknown }> } {
  const shader = {
    vertexShader: lib.vertexShader,
    fragmentShader: lib.fragmentShader,
    uniforms: {} as Record<string, { value: unknown }>,
  };
  material.onBeforeCompile(
    shader as unknown as WebGLProgramParametersWithUniforms,
    {} as unknown as THREE.WebGLRenderer,
  );
  return shader;
}

/** 递归展开 #include（模拟 WebGLProgram 的 resolveIncludes） */
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

const count = (source: string, target: string): number => source.split(target).length - 1;
const braceDelta = (source: string): number => count(source, '{') - count(source, '}');
/** 材质级 uTime 桥接面（TimeUniformService 扫描面） */
const materialUniformsOf = (material: THREE.Material): Record<string, { value: unknown }> =>
  (material as unknown as { uniforms: Record<string, { value: unknown }> }).uniforms;

afterEach(() => {
  for (const material of created.splice(0)) material.dispose();
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    const material = source.material;
    if (Array.isArray(material)) for (const m of material) m.dispose();
    else material.dispose();
  }
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createTree3aLeafMaterial()), track(createTree3aBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('真实 build() 产物挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const source = build();
    built.push(source);
    const mats = (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
    const clock = new TimeUniformService();
    const scene = new THREE.Scene().add(new THREE.Mesh(source.geometry, source.material));
    clock.frame(0, scene);
    expect(materialUniformsOf(mats[0]!).uTime!.value).toBe(0);
    clock.frame(1000, scene);
    expect(materialUniformsOf(mats[0]!).uTime!.value).toBeCloseTo(1, 10); // 服务写一次两边生效
    expect(materialUniformsOf(mats[1]!).uTime!.value).toBeCloseTo(1, 10);
  });
});

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 78.233'); // 整树缓摆相位 = hash(aSeed)
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 51.171'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 't3aWindH * t3aWindH * 0.045 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 快颤权重 = aBend（树皮组恒 0 天然免颤）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createTree3aLeafMaterial()), track(createTree3aBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 叶形与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createTree3aLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float t3aLeafAlpha('); // 叶形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('t3aLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = t3aAlpha;'); // alphatest_fragment 上游写入
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + 树皮组守卫实心 + USE_UV + alphaTest', () => {
    const material = track(createTree3aLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('t3aLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 皮组 aLeafRand=0 → 实心（圆柱 uv 域不误裁）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('锚点门第 1 轮微调参数锚定（2026-09-18 四项，近观 8m）', () => {
  it('树皮：tri³ 深沟剖面 + 沟内冷灰 AO + 节疤核收紧/愈伤环 + 苔痕方位门控 + 脊顶糙度回落', () => {
    const { fragmentShader } = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.44 + 0.56 * t3aBarkTri * t3aBarkTri * t3aBarkTri'); // 沟底 0.55·tri² → 0.44·tri³
    expect(fragmentShader).toContain('smoothstep(0.08, 0.72, t3aBarkTri)'); // 沟内 AO 式冷灰压暗
    expect(fragmentShader).toContain('smoothstep(0.72, 0.84, t3aBarkKnotF)'); // 节疤核带收紧（0.66–0.84 → 0.72–0.84）
    expect(fragmentShader).toContain('1.0 - 0.42 * t3aBarkKnot + 0.14 * t3aBarkRim'); // 核加深 0.28→0.42 + 愈伤环 +0.14
    expect(fragmentShader).toContain('smoothstep(-0.15, 0.75, sin(vUv.x * 6.28318 + 1.2))'); // 苔痕方位门控（一侧干净一侧集中）
    expect(fragmentShader).toContain('t3aBarkTri * t3aBarkTri * t3aBarkTri * 0.10'); // 脊顶糙度 −0.10（高光骑脊深度线索）
  });

  it('叶：齿载波合成锯齿（噪声频率 42 不升防裁切闪烁）+ 中脉沟侧翼 + 透光峰值 0.65；深度同 SDF 同步', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float t3aTooth = pow(0.5 + 0.5 * cos(t3aP.y * 37.7 - t3aRand * 6.28), 3.0);'); // 齿载波（纯 ALU）
    expect(leaf.fragmentShader).toContain('t3aP.y * 42.0'); // 锯齿噪声频率维持（升频 → alphaTest 0.5 裁切闪烁）
    expect(leaf.fragmentShader).toContain('t3aVeinFlank'); // 中脉沟侧翼压暗（立体感）
    expect(leaf.fragmentShader).toContain('* t3aTransVar * t3aAlpha * 0.65;'); // 透光峰值 0.45 → 0.65
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('t3aTooth'); // SDF 单一来源——影裁切齿形自动同步
  });
});

describe('program 键纪律与工厂所有权（D17）', () => {
  it('叶/皮/深度三键互异；两次调用材质对象不同但键相同', () => {
    const leafA = track(createTree3aLeafMaterial());
    const leafB = track(createTree3aLeafMaterial());
    const barkA = track(createTree3aBarkMaterial());
    const barkB = track(createTree3aBarkMaterial());
    const depth = track(createTree3aLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
  });

  it('底参与侧向：叶 DoubleSide/缎面糙度/USE_UV；皮 FrontSide/高糙度/USE_UV', () => {
    const leaf = track(createTree3aLeafMaterial());
    const bark = track(createTree3aBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.75); // 叶面微缎面（不进塑料区间）
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.9); // 高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 ≤10× / 皮 ≤6×，hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：叶片元 2 处（6×）、皮 2 处（6×）、深度 1 处；顶点零噪声（库内 3 处为定义+未使用的 facFbm2 调用）', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（锯齿 + 叶团斑块）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（脊线游走 + 板块）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（锯齿）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）', () => {
    const shaders = [
      assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createTree3aLeafMaterial, createTree3aBarkMaterial, createTree3aLeafDepthMaterial]) {
      const material = track(make());
      const lib = material instanceof THREE.MeshDepthMaterial ? THREE.ShaderLib.depth : THREE.ShaderLib.physical;
      expect(() =>
        material.onBeforeCompile(
          {
            vertexShader: lib.vertexShader,
            fragmentShader: lib.fragmentShader.replace('#include <map_fragment>', ''),
            uniforms: {},
          } as unknown as WebGLProgramParametersWithUniforms,
          {} as unknown as THREE.WebGLRenderer,
        ),
      ).toThrow(/注入点缺失/);
    }
  });

  it('顶点 begin_vertex / common 摘除 → 抛「注入点缺失」', () => {
    const leaf = track(createTree3aLeafMaterial());
    expect(() =>
      leaf.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader.replace('#include <begin_vertex>', ''),
          fragmentShader: THREE.ShaderLib.physical.fragmentShader,
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);

    const depth = track(createTree3aLeafDepthMaterial());
    expect(() =>
      depth.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.depth.vertexShader.replace('#include <common>', ''),
          fragmentShader: THREE.ShaderLib.depth.fragmentShader,
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);
  });

  it('片元 roughnessmap_fragment / opaque_fragment 摘除 → 抛「注入点缺失」', () => {
    const bark = track(createTree3aBarkMaterial());
    expect(() =>
      bark.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader,
          fragmentShader: THREE.ShaderLib.physical.fragmentShader.replace('#include <roughnessmap_fragment>', ''),
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);

    const leaf = track(createTree3aLeafMaterial());
    expect(() =>
      leaf.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader,
          fragmentShader: THREE.ShaderLib.physical.fragmentShader.replace('#include <opaque_fragment>', ''),
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);
  });
});

describe('结构完整性（include 全展开后配平差值不变）', () => {
  it('叶/皮（physical）与深度（depth）注入后花括号配平差值与原版一致', () => {
    const pristinePhysicalFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristinePhysicalVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    const pristineDepthFragment = braceDelta(expandIncludes(THREE.ShaderLib.depth.fragmentShader));
    const pristineDepthVertex = braceDelta(THREE.ShaderLib.depth.vertexShader);

    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [leaf, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('TimeUniformService.freeze/unfreeze（008.3 锚点取证：冻结风相位）', () => {
  it('冻结忽略时间戳（时钟停走）；解冻恢复累计（不回补冻结期间时长）；幂等', () => {
    const clock = new TimeUniformService();
    clock.advance(1000);
    clock.advance(2000); // elapsed = 1
    clock.freeze();
    clock.freeze(); // 幂等
    expect(clock.advance(9000)).toBeCloseTo(1, 10); // 冻结：忽略时间戳
    expect(clock.elapsed).toBeCloseTo(1, 10);
    clock.unfreeze();
    clock.unfreeze(); // 幂等
    clock.advance(2500); // 从 last=2000 续走 0.5s（不回补冻结期间 7s）
    expect(clock.elapsed).toBeCloseTo(1.5, 10);
  });

  it('冻结期间广播仍写当前值（uTime 常量——树静止）；材质对象兼容', () => {
    const clock = new TimeUniformService();
    clock.advance(0);
    clock.advance(500); // 0.5
    clock.freeze();
    clock.advance(2000); // 忽略
    const material = track(createTree3aLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});

describe('资产换装（asset_tree_3a 双材质组）', () => {
  it('build() 材质组序 [皮, 叶]：键/侧向/uTime 接线与工厂一致', () => {
    const source = build();
    built.push(source);
    const mats = (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
    expect(mats).toHaveLength(2);
    expect(mats[0]!.customProgramCacheKey()).toBe('tree3a:bark'); // 组 0 树皮
    expect(mats[1]!.customProgramCacheKey()).toBe('tree3a:leaf'); // 组 1 叶卡（契约序）
    expect(mats[0]!.side).toBe(THREE.FrontSide);
    expect(mats[1]!.side).toBe(THREE.DoubleSide);
    expect(materialUniformsOf(mats[0]!).uTime).toBeDefined();
    expect(materialUniformsOf(mats[1]!).uTime).toBeDefined();
  }, 30000);
});
