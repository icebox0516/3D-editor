/**
 * tests/runtime/styles/presets/grass.test.ts —— 绿地三套插件契约（T6.3 迁移）。
 *
 * 覆盖：通用契约 + 绿地专属行为——不透明基线（无 opacity 参数 → transparent false）、
 * reliefStrength 仅存档不映射、tech 套 emissive 固定基线。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, updateStyle } from '../../../../src/runtime/styles/engine';
import type { StyleInstance } from '../../../../src/runtime/styles/types';
import { assertCommonContract, surfaceGeometry } from './helpers';

function grassInstance(presetId: string, firstOverride: Record<string, unknown>): StyleInstance {
  return createStyle(surfaceGeometry(), 'polygon', 'grass', presetId, firstOverride);
}

describe('grass.lawn 草地', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'grass.lawn', shape: 'polygon', semantic: 'grass' });
  });

  it('默认参数落材质：#5da45a / 不透明 / roughness 0.95 / metalness 0', () => {
    const instance = grassInstance('grass.lawn', { reliefStrength: 0 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('5da45a');
    expect(mat.opacity).toBe(1);
    expect(mat.transparent).toBe(false);
    expect(mat.roughness).toBe(0.95);
    expect(mat.metalness).toBe(0);
    disposeStyle(instance);
  });

  it('update：color 生效；reliefStrength 仅存档（粗糙度/金属度不动）', () => {
    const instance = grassInstance('grass.lawn', { color: '#5da45a' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { color: '#65b565', reliefStrength: 1 });
    expect(mat.color.getHexString()).toBe('65b565');
    expect(mat.roughness).toBe(0.95);
    expect(mat.metalness).toBe(0);
    disposeStyle(instance);
  });
});

describe('grass.landscape 景观', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'grass.landscape', shape: 'polygon', semantic: 'grass' });
  });

  it('默认参数落材质：#86b95c / roughness 0.9；reliefStrength=0.4 存档', () => {
    const instance = grassInstance('grass.landscape', { reliefStrength: 0.4 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('86b95c');
    expect(mat.roughness).toBe(0.9);
    expect(mat.metalness).toBe(0);
    disposeStyle(instance);
  });
});

describe('grass.tech 科技绿地', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'grass.tech', shape: 'polygon', semantic: 'grass' });
  });

  it('默认参数落材质：#0e3f46 + emissive #00e5a0 × 0.5 / roughness 0.6 / metalness 0.2', () => {
    const instance = grassInstance('grass.tech', { reliefStrength: 0 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('0e3f46');
    expect(mat.emissive.getHexString()).toBe('00e5a0');
    expect(mat.emissiveIntensity).toBe(0.5);
    expect(mat.roughness).toBe(0.6);
    expect(mat.metalness).toBe(0.2);
    disposeStyle(instance);
  });
});
