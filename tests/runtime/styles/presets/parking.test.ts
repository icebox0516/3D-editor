/**
 * tests/runtime/styles/presets/parking.test.ts —— 停车场两套插件契约（T6.3 迁移）。
 *
 * 覆盖：通用契约 + 停车场专属行为——baseColor → color 映射、lineColor 仅存档
 * （tech 套 emissive #23e0ff 为固定基线，不随 lineColor 联动，沿旧路径同貌）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, updateStyle } from '../../../../src/runtime/styles/engine';
import { assertCommonContract, surfaceGeometry } from './helpers';

describe('parking.standard 标准停车区', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'parking.standard', shape: 'polygon', semantic: 'parking' });
  });

  it('默认参数落材质：底色 #6e7178 / 不透明 / roughness 0.9', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'parking', 'parking.standard', { lineColor: '#e8e8ea' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('6e7178');
    expect(mat.transparent).toBe(false);
    expect(mat.roughness).toBe(0.9);
    disposeStyle(instance);
  });

  it('update：baseColor 改底色；lineColor 仅存档（emissive 恒黑）', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'parking', 'parking.standard', { baseColor: '#6e7178' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { baseColor: '#808488', lineColor: '#ff0000' });
    expect(mat.color.getHexString()).toBe('808488');
    expect(mat.emissive.getHexString()).toBe('000000'); // lineColor 不映射 emissive
    disposeStyle(instance);
  });
});

describe('parking.tech 科技停车区', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'parking.tech', shape: 'polygon', semantic: 'parking' });
  });

  it('默认参数落材质：底色 #1c2733 + emissive #23e0ff × 0.4 / roughness 0.5 / metalness 0.2', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'parking', 'parking.tech', { lineColor: '#23e0ff' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('1c2733');
    expect(mat.emissive.getHexString()).toBe('23e0ff');
    expect(mat.emissiveIntensity).toBe(0.4);
    expect(mat.roughness).toBe(0.5);
    expect(mat.metalness).toBe(0.2);
    disposeStyle(instance);
  });

  it('update：baseColor 改底色；lineColor 不动 emissive 基线（沿旧路径别名表行为）', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'parking', 'parking.tech', { baseColor: '#1c2733' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { baseColor: '#223344', lineColor: '#00ff00' });
    expect(mat.color.getHexString()).toBe('223344');
    expect(mat.emissive.getHexString()).toBe('23e0ff');
    disposeStyle(instance);
  });
});
