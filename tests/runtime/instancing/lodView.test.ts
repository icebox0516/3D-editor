/**
 * tests/runtime/instancing/lodView.test.ts —— THREE 相机 → LodView 翻译测试（T006.3）。
 *
 * 覆盖：透视口径（fov 度→弧度、世界位）、挂父节点相机的世界位、正交口径
 * （top−bottom，不消费位姿）、未知 Camera 形态防御抛错。
 * 边界：纯 three 场景图对象，无 WebGL；评估器侧的度量语义由 006.1 测试锁定，
 * 此处只锁「翻译」——两种相机形态各自字段的取值口径。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { lodViewOfCamera } from '../../../src/runtime/instancing/lodView';

describe('lodViewOfCamera：相机口径翻译', () => {
  it('透视：fovY = fov 度转弧度、cameraPosition = 世界位', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
    camera.position.set(1, 2, 3);
    camera.updateMatrixWorld();
    const view = lodViewOfCamera(camera);
    expect(view).toEqual({
      kind: 'perspective',
      cameraPosition: { x: 1, y: 2, z: 3 },
      fovY: (50 * Math.PI) / 180,
    });
  });

  it('透视相机挂父节点：世界位含父变换（getWorldPosition 口径）', () => {
    const parent = new THREE.Group();
    parent.position.set(10, 0, 0);
    const camera = new THREE.PerspectiveCamera(90, 1, 1, 1000);
    camera.position.set(1, 2, 3);
    parent.add(camera);
    parent.updateMatrixWorld(true);
    const view = lodViewOfCamera(camera);
    expect(view.kind).toBe('perspective');
    if (view.kind === 'perspective') {
      expect(view.cameraPosition).toEqual({ x: 11, y: 2, z: 3 });
      expect(view.fovY).toBeCloseTo(Math.PI / 2, 12);
    }
  });

  it('正交：orthoHeight = top − bottom、不消费相机位姿', () => {
    const camera = new THREE.OrthographicCamera(-12, 12, 12, -8, -100, 100);
    camera.position.set(999, 999, 999); // 位姿不应进视图口径
    camera.updateMatrixWorld();
    const view = lodViewOfCamera(camera);
    expect(view).toEqual({ kind: 'orthographic', orthoHeight: 20 });
  });

  it('裸 Camera（非透视非正交）→ 防御抛错', () => {
    expect(() => lodViewOfCamera(new THREE.Camera())).toThrow();
  });
});
