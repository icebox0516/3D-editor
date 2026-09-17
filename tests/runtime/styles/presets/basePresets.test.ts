/**
 * tests/runtime/styles/presets/basePresets.test.ts —— base 通用三套插件契约（T6.3 新增）。
 *
 * 覆盖：通用契约 + base 专属行为——flat 冷灰蓝双面、holo 同源发光恒透明、
 * grid ShaderMaterial 网格 uniforms（update 只改 uniforms 不换对象/材质/几何）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, updateStyle } from '../../../../src/runtime/styles/engine';
import { assertCommonContract, surfaceGeometry } from './helpers';

describe('base.flat 纯色', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'base.flat', shape: 'polygon', semantic: 'custom' });
  });

  it('默认参数落材质：冷灰蓝 #8f98a8（区别于 default_solid 中性灰 #909399）/ DoubleSide', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'custom', 'base.flat', { color: '#8f98a8' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('8f98a8');
    expect(mat.color.getHexString()).not.toBe('909399');
    expect(mat.side).toBe(THREE.DoubleSide);
    expect(mat.opacity).toBe(1);
    disposeStyle(instance);
  });
});

describe('base.holo 全息', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'base.holo', shape: 'polygon', semantic: 'custom' });
  });

  it('默认参数落材质：#66d9ff 同源 emissive × glow 0.6 / 恒 transparent / DoubleSide', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'custom', 'base.holo', { color: '#66d9ff' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('66d9ff');
    expect(mat.emissive.getHexString()).toBe('66d9ff'); // 同源
    expect(mat.emissiveIntensity).toBe(0.6);
    expect(mat.transparent).toBe(true);
    expect(mat.opacity).toBe(0.45);
    expect(mat.side).toBe(THREE.DoubleSide);
    disposeStyle(instance);
  });

  it('update：color 同源联动 color+emissive；opacity 调节不关透明通道；glow 调强度', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'custom', 'base.holo', { color: '#66d9ff' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { color: '#ff8800', opacity: 1, glow: 2 });
    expect(mat.color.getHexString()).toBe('ff8800');
    expect(mat.emissive.getHexString()).toBe('ff8800'); // 同源联动
    expect(mat.opacity).toBe(1);
    expect(mat.transparent).toBe(true); // 恒透明
    expect(mat.emissiveIntensity).toBe(2);
    disposeStyle(instance);
  });
});

describe('base.grid 网格', () => {
  it('通用契约', () => {
    assertCommonContract({ id: 'base.grid', shape: 'polygon', semantic: 'custom' });
  });

  it('ShaderMaterial：默认 uniforms 落位（线色/单元格/透明度），transparent', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'custom', 'base.grid', { lineColor: '#66d9ff' });
    const mat = instance.material as THREE.ShaderMaterial;
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(mat.transparent).toBe(true);
    expect((mat.uniforms.uLineColor.value as THREE.Color).getHexString()).toBe('66d9ff');
    expect(mat.uniforms.uCellSize.value).toBe(2);
    expect(mat.uniforms.uOpacity.value).toBe(0.6);
    disposeStyle(instance);
  });

  it('update 只改 uniforms：object/material/geometry 身份不变', () => {
    const instance = createStyle(surfaceGeometry(), 'polygon', 'custom', 'base.grid', { lineColor: '#66d9ff' });
    const object = instance.object;
    const material = instance.material;
    const geometry = (object as THREE.Mesh).geometry;
    updateStyle(instance, { lineColor: '#00ff88', cellSize: 5, opacity: 0.9 });
    const mat = instance.material as THREE.ShaderMaterial;
    expect(instance.object).toBe(object);
    expect(instance.material).toBe(material);
    expect((object as THREE.Mesh).geometry).toBe(geometry);
    expect((mat.uniforms.uLineColor.value as THREE.Color).getHexString()).toBe('00ff88');
    expect(mat.uniforms.uCellSize.value).toBe(5);
    expect(mat.uniforms.uOpacity.value).toBe(0.9);
    disposeStyle(instance);
  });
});
