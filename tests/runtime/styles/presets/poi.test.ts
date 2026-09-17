/**
 * tests/runtime/styles/presets/poi.test.ts —— POI 三套插件契约（T6.3 新增，按新设计验收）。
 *
 * 覆盖：通用契约（point 形状；Sprite/自建几何 → rebindsGeometry=false）+ poi 专属行为——
 * - billboard：Sprite 根 + SpriteMaterial（map/color/size；glow → 内容寻址贴图换绑）；
 * - beam：插件自建单位圆柱（半径 0.35）+ scale.y 供高（update 零几何重建）+ uniforms；
 * - marker：插件自建贴地圆环（内 0.6 外 1.0）+ emissive 发光 + scale 缩放；
 * 共同纪律：传入 point 几何存档不使用不释放；插件自建几何 dispose 时释放。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, updateStyle } from '../../../../src/runtime/styles/engine';
import { assertCommonContract, countDisposes, surfaceGeometry } from './helpers';

describe('poi.billboard 图标牌', () => {
  it('通用契约（Sprite 根、setGeometry 存档式）', () => {
    assertCommonContract({
      id: 'poi.billboard', shape: 'point', semantic: 'poi',
      objectType: THREE.Sprite, rebindsGeometry: false,
    });
  });

  it('Sprite + SpriteMaterial：默认尺寸 1.5、贴图就位（程序化生成，无外部资产）', () => {
    const instance = createStyle(surfaceGeometry(), 'point', 'poi', 'poi.billboard', { color: '#4ec9ff' });
    expect(instance.object).toBeInstanceOf(THREE.Sprite);
    const mat = instance.material as THREE.SpriteMaterial;
    expect(mat.map).toBeInstanceOf(THREE.Texture);
    expect(mat.color.getHexString()).toBe('4ec9ff');
    expect(instance.object.scale.x).toBe(1.5);
    expect(instance.object.scale.y).toBe(1.5);
    disposeStyle(instance);
  });

  it('update：color 着色、size 缩放、glow 换绑贴图（内容寻址缓存命中不换对象）', () => {
    const instance = createStyle(surfaceGeometry(), 'point', 'poi', 'poi.billboard', { color: '#4ec9ff' });
    const mat = instance.material as THREE.SpriteMaterial;
    const initialMap = mat.map;
    updateStyle(instance, { color: '#ffcc00', size: 3, glow: 3 });
    expect(mat.color.getHexString()).toBe('ffcc00');
    expect(instance.object.scale.x).toBe(3);
    expect(mat.map).not.toBe(initialMap); // 光晕强度变化 → 贴图内容变化
    const glowMap = mat.map;
    updateStyle(instance, { glow: 0.5 }); // 回到默认 glow → 缓存命中初始贴图
    expect(mat.map).toBe(initialMap);
    updateStyle(instance, { glow: 3 }); // 再回 3 → 同键缓存命中
    expect(mat.map).toBe(glowMap);
    disposeStyle(instance);
  });

  it('dispose：传入 point 几何与材质零释放（贴图为共享缓存不随实例释放）', () => {
    const geometry = surfaceGeometry();
    const geometryDisposes = countDisposes(geometry);
    const instance = createStyle(geometry, 'point', 'poi', 'poi.billboard', { color: '#4ec9ff' });
    const materialDisposes = countDisposes(instance.material);
    instance.dispose();
    expect(geometryDisposes.count()).toBe(0);
    expect(materialDisposes.count()).toBe(0);
    disposeStyle(instance);
  });
});

describe('poi.beam 光柱', () => {
  it('通用契约（Mesh 根、setGeometry 存档式）', () => {
    assertCommonContract({ id: 'poi.beam', shape: 'point', semantic: 'poi', rebindsGeometry: false });
  });

  it('插件自建单位圆柱（非传入几何）：底面贴 y=0、半径 0.35、默认柱高 8 经 scale.y', () => {
    const caller = surfaceGeometry();
    const instance = createStyle(caller, 'point', 'poi', 'poi.beam', { color: '#66d9ff' });
    const mesh = instance.object as THREE.Mesh;
    expect(mesh.geometry).not.toBe(caller); // 视觉几何为插件自建
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    expect(box.min.y).toBeCloseTo(0, 5); // 底面贴地
    expect(box.max.y).toBeCloseTo(1, 5); // 单位高（高度由缩放供给）
    expect(box.max.x - box.min.x).toBeCloseTo(0.7, 5); // 直径 2×0.35
    expect(mesh.scale.y).toBe(8); // 默认柱高
    disposeStyle(instance);
  });

  it('update 只改 uniforms 与 scale：height 变化零几何重建，color/opacity 落 uniforms', () => {
    const instance = createStyle(surfaceGeometry(), 'point', 'poi', 'poi.beam', { color: '#66d9ff' });
    const mesh = instance.object as THREE.Mesh;
    const geometry = mesh.geometry;
    const material = instance.material as THREE.ShaderMaterial;
    expect(material.blending).toBe(THREE.AdditiveBlending);
    expect(material.side).toBe(THREE.DoubleSide);
    updateStyle(instance, { color: '#ff8800', opacity: 0.9, height: 20 });
    expect(mesh.geometry).toBe(geometry); // 零几何重建
    expect(mesh.scale.y).toBe(20);
    expect((material.uniforms.uColor.value as THREE.Color).getHexString()).toBe('ff8800');
    expect(material.uniforms.uOpacity.value).toBe(0.9);
    disposeStyle(instance);
  });

  it('dispose：释放插件自建圆柱几何；传入几何与材质零释放', () => {
    const caller = surfaceGeometry();
    const callerDisposes = countDisposes(caller);
    const instance = createStyle(caller, 'point', 'poi', 'poi.beam', { color: '#66d9ff' });
    const beamDisposes = countDisposes((instance.object as THREE.Mesh).geometry);
    const materialDisposes = countDisposes(instance.material);
    instance.dispose();
    expect(beamDisposes.count()).toBe(1); // 插件自建几何释放
    expect(callerDisposes.count()).toBe(0);
    expect(materialDisposes.count()).toBe(0);
    disposeStyle(instance);
  });
});

describe('poi.marker 地面标记', () => {
  it('通用契约（Mesh 根、setGeometry 存档式）', () => {
    assertCommonContract({ id: 'poi.marker', shape: 'point', semantic: 'poi', rebindsGeometry: false });
  });

  it('插件自建贴地圆环（内 0.6 外 1.0，XZ 平面）：默认尺寸 1.5、emissive 同源发光', () => {
    const caller = surfaceGeometry();
    const instance = createStyle(caller, 'point', 'poi', 'poi.marker', { color: '#ffb454' });
    const mesh = instance.object as THREE.Mesh;
    expect(mesh.geometry).not.toBe(caller);
    const position = mesh.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i++) {
      expect(position.getY(i)).toBeCloseTo(0, 5); // 贴地（XZ 平面）
    }
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    expect(box.max.x - box.min.x).toBeCloseTo(2, 5); // 直径 2×外径 1.0
    expect(mesh.scale.x).toBe(1.5); // size 缩放
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.emissive.getHexString()).toBe('ffb454'); // 同源发光
    expect(mat.emissiveIntensity).toBe(1.2);
    disposeStyle(instance);
  });

  it('update：color 同源联动、size 等比缩放、glow 调强度', () => {
    const instance = createStyle(surfaceGeometry(), 'point', 'poi', 'poi.marker', { color: '#ffb454' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    updateStyle(instance, { color: '#4ec9ff', size: 2.5, glow: 3 });
    expect(mat.color.getHexString()).toBe('4ec9ff');
    expect(mat.emissive.getHexString()).toBe('4ec9ff');
    expect(instance.object.scale.x).toBe(2.5);
    expect(mat.emissiveIntensity).toBe(3);
    disposeStyle(instance);
  });

  it('dispose：释放插件自建圆环几何；传入几何与材质零释放', () => {
    const caller = surfaceGeometry();
    const callerDisposes = countDisposes(caller);
    const instance = createStyle(caller, 'point', 'poi', 'poi.marker', { color: '#ffb454' });
    const ringDisposes = countDisposes((instance.object as THREE.Mesh).geometry);
    const materialDisposes = countDisposes(instance.material);
    instance.dispose();
    expect(ringDisposes.count()).toBe(1);
    expect(callerDisposes.count()).toBe(0);
    expect(materialDisposes.count()).toBe(0);
    disposeStyle(instance);
  });
});
