/**
 * tests/runtime/styles/presets/road.test.ts —— 道路两套插件契约（T6.3 迁移；T6.4 R2 扩形）。
 *
 * 覆盖：通用契约（line 形状）+ 道路专属行为——面类五形状 + line（T6.4 R2：polygon 形状 +
 * road 语义走平面贴地渲染，width 忽略）、color 落材质、glow → emissiveIntensity 映射但
 * emissive 保持黑（旧路径同貌：视觉无效、参数存档）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, setStyleNotifier, updateStyle } from '../../../../src/runtime/styles/engine';
import type { StyleNotice } from '../../../../src/runtime/styles/engine';
import { assertCommonContract, surfaceGeometry } from './helpers';

describe('road.standard 标准道路', () => {
  it('通用契约（line 形状创建）', () => {
    assertCommonContract({ id: 'road.standard', shape: 'line', semantic: 'road' });
  });

  it('默认参数落材质：#4a4a4f / roughness 0.9 / emissive 黑 × glow 0', () => {
    const instance = createStyle(surfaceGeometry(), 'line', 'road', 'road.standard', { glow: 0 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('4a4a4f');
    expect(mat.roughness).toBe(0.9);
    expect(mat.metalness).toBe(0);
    expect(mat.emissive.getHexString()).toBe('000000');
    expect(mat.emissiveIntensity).toBe(0);
    disposeStyle(instance);
  });

  it('update：color 生效；glow 只改 emissiveIntensity，emissive 保持黑（旧貌）', () => {
    const instance = createStyle(surfaceGeometry(), 'line', 'road', 'road.standard', { color: '#4a4a4f' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { color: '#5a5a60', glow: 3 });
    expect(mat.color.getHexString()).toBe('5a5a60');
    expect(mat.emissiveIntensity).toBe(3);
    expect(mat.emissive.getHexString()).toBe('000000');
    disposeStyle(instance);
  });

  it('面类形状（polygon）同样可用：不降级、几何保持（T6.4 R2 扩形——贴地渲染，width 忽略）', () => {
    const notices: StyleNotice[] = [];
    setStyleNotifier((n) => notices.push(n));
    const geometry = surfaceGeometry();
    const instance = createStyle(geometry, 'polygon', 'road', 'road.standard');
    expect(instance.presetId).toBe('road.standard'); // 不降级
    expect((instance.object as THREE.Mesh).geometry).toBe(geometry); // 几何保持
    expect(notices).toEqual([]);
    setStyleNotifier(null);
    disposeStyle(instance);
  });
});

describe('road.asphalt 沥青道路', () => {
  it('通用契约（line 形状创建）', () => {
    assertCommonContract({ id: 'road.asphalt', shape: 'line', semantic: 'road' });
  });

  it('默认参数落材质：#333338 / roughness 0.95 / emissive 黑 × glow 0', () => {
    const instance = createStyle(surfaceGeometry(), 'line', 'road', 'road.asphalt', { glow: 0 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('333338');
    expect(mat.roughness).toBe(0.95);
    expect(mat.emissive.getHexString()).toBe('000000');
    expect(mat.emissiveIntensity).toBe(0);
    disposeStyle(instance);
  });
});
