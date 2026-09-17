/**
 * tests/runtime/RuntimeViewport.rect.test.ts —— 框选拾取（pickInRect）测试（T2.4，先测后码）。
 *
 * 覆盖（任务书：屏幕矩形投影相交选中）：
 * - 对象包围盒的屏幕投影与矩形相交 → 返回其业务 id；
 * - 矩形外的对象不返回；空矩形区域 / 无命中 → 空数组；
 * - 反向拖拽（x0>x1）归一化处理；
 * - 画布尺寸为零 → 空数组（布局未稳守卫）。
 * 几何布置：相机 (0,0,50) 正对原点（fov50, 800×600）——中央盒（原点，边 4）投影
 * 屏幕约 [374..426]×[274..326]；右侧盒（x=15，边 4）投影约 [588..618]×[274..326]。
 * 环境：node（无 WebGL；仅构造 Object3D/相机做投影数学，画布用最小 fake）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { RuntimeObjectMap } from '../../src/runtime/RuntimeObjectMap';
import { RuntimeViewport } from '../../src/runtime/services/RuntimeViewport';

/** 最小画布 fake：pickInRect 只读 getBoundingClientRect */
function fakeCanvas(width = 800, height = 600): HTMLCanvasElement {
  return {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width,
      height,
      x: 0,
      y: 0,
      right: width,
      bottom: height,
      toJSON: () => ({}),
    }),
  } as unknown as HTMLCanvasElement;
}

/** 相机置于 (0,0,50) 正对 -Z */
function frontCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 1000);
  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  return camera;
}

function setup() {
  const map = new RuntimeObjectMap();
  const camera = frontCamera();
  const root = new THREE.Group();
  const viewport = new RuntimeViewport(fakeCanvas(), camera, root, map);

  const center = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshBasicMaterial());
  center.position.set(0, 0, 0);
  const side = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshBasicMaterial());
  side.position.set(15, 0, 0);
  root.add(center, side);
  map.set('element_center', center);
  map.set('element_side', side);

  return { viewport, map, root, camera };
}

describe('RuntimeViewport.pickInRect', () => {
  it('矩形套住中央对象 → 只返回中央对象 id', () => {
    const { viewport } = setup();
    expect(viewport.pickInRect(350, 250, 450, 350)).toEqual(['element_center']);
  });

  it('矩形只覆盖右侧对象 → 只返回右侧对象', () => {
    const { viewport } = setup();
    expect(viewport.pickInRect(500, 200, 700, 400)).toEqual(['element_side']);
  });

  it('大矩形覆盖两者 → 两个 id', () => {
    const { viewport } = setup();
    expect(viewport.pickInRect(0, 0, 800, 600).sort()).toEqual(['element_center', 'element_side']);
  });

  it('反向拖拽（x0>x1）归一化', () => {
    const { viewport } = setup();
    expect(viewport.pickInRect(450, 350, 350, 250)).toEqual(['element_center']);
  });

  it('不相交区域 → 空数组', () => {
    const { viewport } = setup();
    expect(viewport.pickInRect(0, 0, 10, 10)).toEqual([]);
  });

  it('零尺寸画布 → 空数组（布局未稳守卫）', () => {
    const map = new RuntimeObjectMap();
    const camera = frontCamera();
    const viewport = new RuntimeViewport(fakeCanvas(0, 0), camera, new THREE.Group(), map);
    expect(viewport.pickInRect(0, 0, 100, 100)).toEqual([]);
  });
});
