/**
 * tests/runtime/styles/presets/building.test.ts —— 建筑两套挤出插件契约（T6.3 改造，按新设计验收）。
 *
 * 覆盖（任务书 F.1 building 专项）：
 * - 挤出立体：build 按语义 height 自建挤出几何（mesh.geometry ≠ 调用方轮廓），
 *   height 越高 Y 向顶点越大；默认 height 回退 10；
 * - height 经 update（semantic 通路）变化 → 重建插件挤出几何且调用方轮廓未释放、
 *   object 引用不变；同值不重建；
 * - setGeometry 重存轮廓后按当前 height 重新挤出（旧插件几何释放、调用方几何不动）；
 * - 凹形轮廓（L 形）正确挤出；病态轮廓退用调用方几何平铺（owns=false 不释放）；
 * - 墙体材质基线（default/modern）与参数映射（primaryColor/opacity/glow 同貌策略）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createStyle, disposeStyle, updateStyle } from '../../../../src/runtime/styles/engine';
import type { StyleInstance } from '../../../../src/runtime/styles/types';
import { assertCommonContract, countDisposes, xzOutlineGeometry, yExtents } from './helpers';

const RECT: ReadonlyArray<readonly [number, number]> = [
  [-5, -5], [5, -5], [5, 5], [-5, 5],
];
const L_SHAPE: ReadonlyArray<readonly [number, number]> = [
  [-6, -4], [6, -4], [6, 2], [0, 2], [0, 6], [-6, 6],
];

function building(
  presetId: string,
  semanticProperties?: Record<string, unknown>,
  outline: ReadonlyArray<readonly [number, number]> = RECT,
): { instance: StyleInstance; outline: THREE.BufferGeometry } {
  const geometry = xzOutlineGeometry(outline);
  const instance = createStyle(
    geometry,
    'polygon',
    'building',
    presetId,
    { primaryColor: presetId === 'building.modern' ? '#d8d8dc' : '#b0a99f' }, // 同默认值覆写 → 独享
    semanticProperties,
  );
  return { instance, outline: geometry };
}

describe('挤出立体（building.default）', () => {
  it('通用契约（update 不换 object、dispose 零泄漏；setGeometry 专项另测）', () => {
    assertCommonContract({
      id: 'building.default', shape: 'polygon', semantic: 'building',
      semanticProperties: { height: 10 }, rebindsGeometry: false,
    });
  });

  it('build 按语义 height 自建挤出几何：mesh.geometry ≠ 调用方轮廓，Y ∈ [0, 10]', () => {
    const { instance, outline } = building('building.default', { height: 10 });
    const mesh = instance.object as THREE.Mesh;
    expect(mesh.geometry).not.toBe(outline);
    const extents = yExtents(mesh.geometry);
    expect(extents.minY).toBeCloseTo(0, 5);
    expect(extents.maxY).toBeCloseTo(10, 5);
    const footprint = mesh.geometry.boundingBox!;
    expect(footprint.min.x).toBeCloseTo(-5, 5);
    expect(footprint.max.x).toBeCloseTo(5, 5);
    expect(footprint.min.z).toBeCloseTo(-5, 5);
    expect(footprint.max.z).toBeCloseTo(5, 5);
    disposeStyle(instance);
  });

  it('height 越高 Y 向顶点越大（10 vs 25）', () => {
    const low = building('building.default', { height: 10 }).instance;
    const high = building('building.default', { height: 25 }).instance;
    const lowY = yExtents((low.object as THREE.Mesh).geometry).maxY;
    const highY = yExtents((high.object as THREE.Mesh).geometry).maxY;
    expect(highY).toBeGreaterThan(lowY);
    expect(highY).toBeCloseTo(25, 5);
    disposeStyle(low);
    disposeStyle(high);
  });

  it('缺省语义属性 → height 回退 10（semanticDefinitions 默认）', () => {
    const { instance } = building('building.default');
    expect(yExtents((instance.object as THREE.Mesh).geometry).maxY).toBeCloseTo(10, 5);
    disposeStyle(instance);
  });

  it('凹形轮廓（L 形）正确挤出：包围盒匹配 L 外沿', () => {
    const { instance } = building('building.default', { height: 6 }, L_SHAPE);
    const mesh = instance.object as THREE.Mesh;
    const extents = yExtents(mesh.geometry); // 同时计算包围盒
    expect(extents.maxY).toBeCloseTo(6, 5);
    const box = mesh.geometry.boundingBox!;
    expect(box.min.x).toBeCloseTo(-6, 5);
    expect(box.max.x).toBeCloseTo(6, 5);
    expect(box.max.z).toBeCloseTo(6, 5);
    expect(box.max.y).toBeCloseTo(6, 5);
    // L 形缺口（x > 0 且 z > 2 的右上区块）无顶点：采样验证内凹存在
    const position = mesh.geometry.getAttribute('position');
    let hasNotchVertex = false;
    for (let i = 0; i < position.count; i++) {
      if (position.getX(i) > 0.5 && position.getZ(i) > 2.5) hasNotchVertex = true;
    }
    expect(hasNotchVertex).toBe(false);
    disposeStyle(instance);
  });

  it('病态轮廓（空几何）退用调用方几何平铺：owns=false，dispose 不释放调用方几何', () => {
    const empty = new THREE.BufferGeometry();
    const emptyDisposes = countDisposes(empty);
    const instance = createStyle(empty, 'polygon', 'building', 'building.default', { primaryColor: '#b0a99f' }, { height: 10 });
    expect((instance.object as THREE.Mesh).geometry).toBe(empty); // 平铺退用
    disposeStyle(instance);
    expect(emptyDisposes.count()).toBe(0);
  });

  it.each(['building.default', 'building.modern'])('%s：自建 Mesh castShadow=true（插件对立体表达自决投影，两条挤出路径均生效）', (presetId) => {
    const { instance } = building(presetId, { height: 10 });
    expect((instance.object as THREE.Mesh).castShadow).toBe(true); // 挤出立体路径（owns=true）
    disposeStyle(instance);
    // 平铺退用路径（owns=false，病态轮廓）同为建筑立体表达，同样投影
    const flat = createStyle(new THREE.BufferGeometry(), 'polygon', 'building', presetId, { primaryColor: '#b0a99f' }, { height: 10 });
    expect((flat.object as THREE.Mesh).castShadow).toBe(true);
    disposeStyle(flat);
  });
});

describe('R6 基座偏移（baseHeight 高度合成：最终 y = baseHeight + position.y）', () => {
  /** 轮廓几何抬到 baseHeight（模拟 GeometryBuilder 产出：elevation = shape.baseHeight） */
  function elevatedOutline(
    outline: ReadonlyArray<readonly [number, number]>,
    baseHeight: number,
  ): THREE.BufferGeometry {
    return xzOutlineGeometry(outline).translate(0, baseHeight, 0);
  }

  it('baseHeight=1.2 轮廓 → 挤出底面 y=1.2、顶面 y=1.2+height', () => {
    const outline = elevatedOutline(RECT, 1.2);
    const instance = createStyle(
      outline,
      'polygon',
      'building',
      'building.default',
      { primaryColor: '#b0a99f' },
      { height: 10 },
    );
    const extents = yExtents((instance.object as THREE.Mesh).geometry);
    expect(extents.minY).toBeCloseTo(1.2, 5);
    expect(extents.maxY).toBeCloseTo(11.2, 5);
    disposeStyle(instance);
  });

  it('baseHeight=0 轮廓 → 挤出底面贴地 y=0（既有行为不回归）', () => {
    const outline = elevatedOutline(RECT, 0);
    const instance = createStyle(
      outline,
      'polygon',
      'building',
      'building.default',
      { primaryColor: '#b0a99f' },
      { height: 10 },
    );
    const extents = yExtents((instance.object as THREE.Mesh).geometry);
    expect(extents.minY).toBeCloseTo(0, 5);
    expect(extents.maxY).toBeCloseTo(10, 5);
    disposeStyle(instance);
  });

  it('setGeometry 换不同 baseHeight 的轮廓 → 重挤出按新轮廓偏移', () => {
    const outline = elevatedOutline(RECT, 1.2);
    const instance = createStyle(
      outline,
      'polygon',
      'building',
      'building.default',
      { primaryColor: '#b0a99f' },
      { height: 8 },
    );
    instance.setGeometry(elevatedOutline(RECT, 0.6));
    const extents = yExtents((instance.object as THREE.Mesh).geometry);
    expect(extents.minY).toBeCloseTo(0.6, 5);
    expect(extents.maxY).toBeCloseTo(8.6, 5);
    disposeStyle(instance);
  });
});

describe('height 变化通路（update / setGeometry）', () => {  it('update 语义 height 变化 → 重建插件挤出几何：object 不变、旧插件几何释放、调用方轮廓未释放', () => {
    const { instance, outline } = building('building.default', { height: 10 });
    const mesh = instance.object as THREE.Mesh;
    const oldExtrusion = mesh.geometry;
    const oldDisposes = countDisposes(oldExtrusion);
    const outlineDisposes = countDisposes(outline);
    updateStyle(instance, { semantic: { height: 20 } });
    expect(instance.object).toBe(mesh); // object 引用不变
    expect(mesh.geometry).not.toBe(oldExtrusion); // 插件几何已重建
    expect(oldDisposes.count()).toBe(1); // 旧插件几何释放
    expect(outlineDisposes.count()).toBe(0); // 调用方轮廓未释放
    expect(yExtents(mesh.geometry).maxY).toBeCloseTo(20, 5);
    disposeStyle(instance);
  });

  it('update 语义 height 同值 → 不重建（几何身份保持）', () => {
    const { instance } = building('building.default', { height: 12 });
    const mesh = instance.object as THREE.Mesh;
    const geometry = mesh.geometry;
    updateStyle(instance, { semantic: { height: 12 } });
    expect(mesh.geometry).toBe(geometry);
    disposeStyle(instance);
  });

  it('setGeometry 重存轮廓后按当前 height 重挤出（先改高再换轮廓）', () => {
    const { instance } = building('building.default', { height: 10 });
    updateStyle(instance, { semantic: { height: 15 } }); // 当前高度变为 15
    const mesh = instance.object as THREE.Mesh;
    const oldExtrusion = mesh.geometry;
    const oldDisposes = countDisposes(oldExtrusion);
    const newOutline = xzOutlineGeometry(L_SHAPE);
    const newOutlineDisposes = countDisposes(newOutline);
    instance.setGeometry(newOutline);
    expect(mesh.geometry).not.toBe(oldExtrusion);
    expect(oldDisposes.count()).toBe(1); // 旧插件挤出几何释放
    expect(newOutlineDisposes.count()).toBe(0); // 新轮廓归调用方，不释放
    expect(yExtents(mesh.geometry).maxY).toBeCloseTo(15, 5); // 保持当前 height
    const box = mesh.geometry.boundingBox!;
    expect(box.max.x).toBeCloseTo(6, 5); // 新轮廓外沿
    disposeStyle(instance);
    expect(newOutlineDisposes.count()).toBe(0); // dispose 也不碰调用方轮廓
  });

  it('材质参数随 update 生效（引擎写时复制路径），挤出几何不受材质通道影响', () => {
    const { instance } = building('building.default', { height: 10 });
    const mesh = instance.object as THREE.Mesh;
    const geometry = mesh.geometry;
    updateStyle(instance, { primaryColor: '#ff8800', opacity: 0.6 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('ff8800');
    expect(mat.opacity).toBe(0.6);
    expect(mat.transparent).toBe(true);
    expect(mesh.geometry).toBe(geometry); // 材质通道零几何重建
    disposeStyle(instance);
  });
});

describe('building 两套墙体材质基线', () => {
  it('building.default：#b0a99f / roughness 0.85 / metalness 0；glow 同貌策略（emissive 黑 × intensity）', () => {
    const { instance } = building('building.default', { height: 10 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('b0a99f');
    expect(mat.roughness).toBe(0.85);
    expect(mat.metalness).toBe(0);
    expect(mat.emissive.getHexString()).toBe('000000');
    expect(mat.emissiveIntensity).toBe(0); // glow 默认 0
    updateStyle(instance, { glow: 2 });
    expect(mat.emissiveIntensity).toBe(2);
    expect(mat.emissive.getHexString()).toBe('000000'); // emissive 保持黑（旧貌）
    disposeStyle(instance);
  });

  it('building.modern：#d8d8dc / roughness 0.5 / metalness 0.15', () => {
    const { instance } = building('building.modern', { height: 10 });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('d8d8dc');
    expect(mat.roughness).toBe(0.5);
    expect(mat.metalness).toBe(0.15);
    expect(yExtents((instance.object as THREE.Mesh).geometry).maxY).toBeCloseTo(10, 5); // 挤出同样生效
    disposeStyle(instance);
  });

  it('building.modern 通用契约', () => {
    assertCommonContract({
      id: 'building.modern', shape: 'polygon', semantic: 'building',
      semanticProperties: { height: 10 }, rebindsGeometry: false,
    });
  });
});
