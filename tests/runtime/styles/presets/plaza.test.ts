/**
 * tests/runtime/styles/presets/plaza.test.ts —— 广场三套插件契约（T6.3 新增，按新设计验收）。
 *
 * 覆盖：通用契约 + plaza 专属行为——paving 透明度联动、stone 粗糙度参数直映射、
 * tech 深底发光（glow → emissiveIntensity，emissive #23e0ff 固定基线对齐 parking.tech）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, updateStyle } from '../../../../src/runtime/styles/engine';
import { assertCommonContract, surfaceGeometry } from './helpers';

describe('plaza.paving 铺装广场', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'plaza.paving', shape: 'polygon', semantic: 'plaza' });
  });

  it('默认参数落材质：#a8a29a / 不透明 / 高粗糙', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'plaza', 'plaza.paving', { color: '#a8a29a' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('a8a29a');
    expect(mat.opacity).toBe(1);
    expect(mat.transparent).toBe(false);
    expect(mat.roughness).toBeGreaterThan(0.8);
    disposeStyle(instance);
  });

  it('update：opacity < 1 自动开透明通道', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'plaza', 'plaza.paving', { color: '#a8a29a' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { opacity: 0.5 });
    expect(mat.opacity).toBe(0.5);
    expect(mat.transparent).toBe(true);
    disposeStyle(instance);
  });
});

describe('plaza.stone 石材广场', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'plaza.stone', shape: 'polygon', semantic: 'plaza' });
  });

  it('默认参数落材质：#b5a288 / roughness 0.8（参数即基线）', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'plaza', 'plaza.stone', { roughness: 0.8 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('b5a288');
    expect(mat.roughness).toBe(0.8);
    expect(mat.metalness).toBe(0);
    disposeStyle(instance);
  });

  it('update：roughness 参数直映射材质粗糙度', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'plaza', 'plaza.stone', { roughness: 0.8 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { roughness: 0.3 });
    expect(mat.roughness).toBe(0.3);
    disposeStyle(instance);
  });
});

describe('plaza.tech 科技广场', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'plaza.tech', shape: 'polygon', semantic: 'plaza' });
  });

  it('默认参数落材质：#101c2c + emissive #23e0ff × 0.5 / roughness 0.5 / metalness 0.2', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'plaza', 'plaza.tech', { glow: 0.5 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('101c2c');
    expect(mat.emissive.getHexString()).toBe('23e0ff');
    expect(mat.emissiveIntensity).toBe(0.5);
    expect(mat.roughness).toBe(0.5);
    expect(mat.metalness).toBe(0.2);
    disposeStyle(instance);
  });

  it('update：glow 调发光强度，底色独立可调', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'plaza', 'plaza.tech', { color: '#101c2c' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { color: '#001020', glow: 2.5 });
    expect(mat.color.getHexString()).toBe('001020');
    expect(mat.emissiveIntensity).toBe(2.5);
    expect(mat.emissive.getHexString()).toBe('23e0ff');
    disposeStyle(instance);
  });
});
