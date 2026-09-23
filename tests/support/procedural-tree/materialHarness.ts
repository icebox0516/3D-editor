/**
 * tests/support/procedural-tree/materialHarness.ts —— 材质测试共享脚手架
 * （T020 阶段二 Step A：13 树资产 xxxMaterials.test.ts 工具合一——原各文件本地定义
 * 逐字节同源；断言语义零变化，纯脚手架迁移）。
 *
 * 约束：真实 THREE.ShaderLib 源组装 + 静态字符串断言，零 WebGL；材质登记走工厂化
 * tracker（严禁模块级共享数组——每个测试文件实例化自己的 tracker，D17 无模块级共享）。
 */
import { expect } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';

/** 材质登记 tracker（afterEach 统一 dispose 兜底——每测试文件一个实例，不跨文件共享） */
export interface MaterialTracker {
  track: <T extends THREE.Material>(material: T) => T;
  disposeAll: () => void;
}

/** afterEach 统一 dispose 的材质登记（工厂化：测试文件内 const { track, disposeAll } = createMaterialTracker()） */
export function createMaterialTracker(): MaterialTracker {
  const created: THREE.Material[] = [];
  return {
    track<T extends THREE.Material>(material: T): T {
      created.push(material);
      return material;
    },
    disposeAll() {
      for (const material of created.splice(0)) material.dispose();
    },
  };
}

/** 用真实 ShaderLib 源组装（onBeforeCompile 运行于 include 解析前的真实环境形态） */
export function assemble(
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
export function expandIncludes(source: string): string {
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

export const count = (source: string, target: string): number => source.split(target).length - 1;
export const braceDelta = (source: string): number => count(source, '{') - count(source, '}');
/** 材质级 uTime 桥接面（TimeUniformService 扫描面） */
export const materialUniformsOf = (material: THREE.Material): Record<string, { value: unknown }> =>
  (material as unknown as { uniforms: Record<string, { value: unknown }> }).uniforms;

/** 材质关键属性快照（缺省 vs 显式 high 逐位一致的比较面） */
export const propsOf = (material: THREE.Material): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    type: material.type,
    side: material.side,
    alphaTest: material.alphaTest,
    alphaToCoverage: material.alphaToCoverage,
    transparent: material.transparent,
    defines: material.defines,
  };
  if (material instanceof THREE.MeshStandardMaterial) {
    base.color = material.color.getHex();
    base.roughness = material.roughness;
    base.metalness = material.metalness;
  }
  return base;
};

/** 提取注入后的 SDF 函数全文（单一来源分档比对用；首个 \n} 即函数闭合）——
 *  签名由调用侧传入（各资产自家 SDF 函数签名，如 'float t3cLeafAlpha(vec2 t3cUv, float t3cRand)'） */
export const sdfOf = (fragmentShader: string, signature: string): string => {
  const start = fragmentShader.indexOf(signature);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};
