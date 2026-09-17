/**
 * tests/runtime/groundMaterial.test.ts —— 地面材质深度偏置配置测试
 * （T9.2 贴地共面 z-fighting 消除双保险的地面侧，先测后码）。
 *
 * 覆盖：
 * - makeGroundMaterial：MeshStandardMaterial 基线观感参数（roughness 0.95 / metalness 0）；
 * - polygonOffset 正偏置开启且 factor/units 为正——共面平局时地面深度被推离相机一侧，
 *   稳定败给模型面（手动 y=0 输入的兜底；主方案 = 模型底面微抬 MODEL_BASE_HEIGHT）；
 * - 量级锁定 1/1：与网格线 -1/-1（拉向相机）先例对称的最小共面分离量（OpenGL 红皮书
 *   共面消冲突推荐量级：units 提供常量分离、factor 覆盖共面坡度差）。
 * 边界：材质工厂为纯构造（零 WebGL 依赖，node 可测；Renderer 类含 WebGL 初始化不做
 *      node 单测——沿 Renderer.ts 头注约定，本测试只触模块级导出工厂）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { makeGroundMaterial } from '../../src/runtime/Renderer';

describe('makeGroundMaterial · 地面材质 polygonOffset（T9.2 双保险地面侧）', () => {
  it('基线观感参数保持：MeshStandardMaterial / roughness 0.95 / metalness 0', () => {
    const m = makeGroundMaterial('#e6e4de');
    expect(m).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(m.roughness).toBeCloseTo(0.95, 10);
    expect(m.metalness).toBe(0);
    m.dispose();
  });

  it('polygonOffset 开启且为正偏置（推离相机——共面时地面败给模型面）', () => {
    const m = makeGroundMaterial('#e6e4de');
    expect(m.polygonOffset).toBe(true);
    expect(m.polygonOffsetFactor).toBeGreaterThan(0);
    expect(m.polygonOffsetUnits).toBeGreaterThan(0);
    m.dispose();
  });

  it('偏置量级锁定 1/1（与网格线 -1/-1 先例对称的最小分离量）', () => {
    const m = makeGroundMaterial('#e6e4de');
    expect(m.polygonOffsetFactor).toBe(1);
    expect(m.polygonOffsetUnits).toBe(1);
    m.dispose();
  });
});
