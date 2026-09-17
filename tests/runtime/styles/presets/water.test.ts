/**
 * tests/runtime/styles/presets/water.test.ts —— 水面三套插件契约（T6.3 迁移）。
 *
 * 覆盖：通用契约（helpers.assertCommonContract）+ 水面专属行为——
 * color/opacity 落材质（opacity<1 自动 transparent）、flowSpeed 仅存档不映射、
 * tech 套 emissive 固定基线。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, updateStyle } from '../../../../src/runtime/styles/engine';
import type { StyleInstance } from '../../../../src/runtime/styles/types';
import { assertCommonContract, surfaceGeometry } from './helpers';

function waterInstance(presetId: string): StyleInstance {
  // 默认值覆写 → 独享材质，直改断言不污染共享模板
  const instance = createStyle(surfaceGeometry(), 'polygon', 'water', presetId, { color: '#3f8fc4' });
  return instance;
}

describe('water.standard 标准水面', () => {
  it('通用契约（meta/实例形态/update 不换 object/setGeometry/dispose 零泄漏）', () => {
    assertCommonContract({ id: 'water.standard', shape: 'polygon', semantic: 'water' });
  });

  it('默认参数落材质：色 #3f8fc4 / 透明 0.8（transparent）', () => {
    const instance = waterInstance('water.standard');
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('3f8fc4');
    expect(mat.opacity).toBe(0.8);
    expect(mat.transparent).toBe(true);
    disposeStyle(instance);
  });

  it('update：color/opacity 生效（transparent 跟随），flowSpeed 仅存档不映射', () => {
    const instance = waterInstance('water.standard');
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { color: '#00ff00', opacity: 1, flowSpeed: 1.5 });
    expect(mat.color.getHexString()).toBe('00ff00');
    expect(mat.opacity).toBe(1);
    expect(mat.transparent).toBe(false);
    const before = { roughness: mat.roughness, metalness: mat.metalness, emissive: mat.emissive.getHexString() };
    updateStyle(instance, { flowSpeed: 2 });
    expect(mat.roughness).toBe(before.roughness);
    expect(mat.metalness).toBe(before.metalness);
    expect(mat.emissive.getHexString()).toBe(before.emissive);
    disposeStyle(instance);
  });
});

describe('water.dynamic 动态水面', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'water.dynamic', shape: 'polygon', semantic: 'water' });
  });

  it('默认参数落材质：#4aa3d9 / 0.75 / roughness 0.08 / metalness 0.2', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'water', 'water.dynamic', { flowSpeed: 0.8 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('4aa3d9');
    expect(mat.opacity).toBe(0.75);
    expect(mat.roughness).toBe(0.08);
    expect(mat.metalness).toBe(0.2);
    disposeStyle(instance);
  });
});

describe('water.tech 科技水面', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'water.tech', shape: 'polygon', semantic: 'water' });
  });

  it('默认参数落材质：#0e5f7a / 0.85 + emissive #00d5ff × 0.6 固定基线', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'water', 'water.tech', { flowSpeed: 1.2 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('0e5f7a');
    expect(mat.opacity).toBe(0.85);
    expect(mat.emissive.getHexString()).toBe('00d5ff');
    expect(mat.emissiveIntensity).toBe(0.6);
    updateStyle(instance, { color: '#112233' }); // 改底色不动 emissive 基线
    expect(mat.color.getHexString()).toBe('112233');
    expect(mat.emissive.getHexString()).toBe('00d5ff');
    disposeStyle(instance);
  });
});
