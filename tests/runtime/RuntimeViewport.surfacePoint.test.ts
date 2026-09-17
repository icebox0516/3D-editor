/**
 * tests/runtime/RuntimeViewport.surfacePoint.test.ts —— 测量表面拾取三分支测试
 * （T10.1，先测后码；沿 RuntimeViewport.rect/instanced 形态）。
 *
 * 覆盖（contracts/stage10-measure.md §B surfacePoint 契约）：
 * - 表面优先：pickRoot 内 content 对象（Mesh）raycast 命中 → 返回交点世界坐标（y = 表面高度）；
 * - AUX/环境辅助不在拾取集：拾取根外的对象（如 __measure_overlay__/预览组同层兄弟）不参与；
 * - 地面兜底：未命中对象时射线交 y=0 平面 → 平面交点（y=0）；
 * - 近水平限距：地面交点距相机 > 2000m（近水平射线）→ null；射线背离地面 → null；
 * - 画布零尺寸 → null。
 * 环境：node（无 WebGL；真实 THREE.Raycaster 对纯构造场景图做拾取数学，
 * updateMatrixWorld 由测试显式执行——渲染循环等价）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { RuntimeObjectMap } from '../../src/runtime/RuntimeObjectMap';
import { RuntimeViewport } from '../../src/runtime/services/RuntimeViewport';
import { AUX_LAYER } from '../../src/runtime/RenderModeState';

/** 最小画布 fake：surfacePoint 只读 getBoundingClientRect */
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

interface Harness {
  viewport: RuntimeViewport;
  pickRoot: THREE.Group;
  camera: THREE.PerspectiveCamera;
  frame(): void;
}

function createHarness(): Harness {
  const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 20000);
  const pickRoot = new THREE.Group(); // contentGroup 等价（拾取根）
  const map = new RuntimeObjectMap();
  const viewport = new RuntimeViewport(fakeCanvas(), camera, pickRoot, map);
  return {
    viewport,
    pickRoot,
    camera,
    frame: () => pickRoot.updateMatrixWorld(true),
  };
}

/** 相机置于 pos 正对 target（画布中心 NDC 0,0 射线穿过 target） */
function aimCamera(camera: THREE.PerspectiveCamera, target: THREE.Vector3, offset = new THREE.Vector3(0, 6, 10)): void {
  camera.position.copy(target).add(offset);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
}

const center = { x: 400, y: 300 }; // 画布中心（NDC 0,0）

/** 放置一个盒子 content 对象（拾取根内；世界坐标 pos，尺寸 s） */
function placeBox(h: Harness, x: number, y: number, z: number, s = 4): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshStandardMaterial());
  mesh.position.set(x, y, z);
  h.pickRoot.add(mesh);
  return mesh;
}

describe('RuntimeViewport.surfacePoint 三分支', () => {
  it('表面优先：命中 content 对象 → 交点世界坐标（顶面高度 y）', () => {
    const h = createHarness();
    placeBox(h, 0, 2, 0, 4); // 盒中心 y=2 → 顶面 y=4
    h.frame();
    aimCamera(h.camera, new THREE.Vector3(0, 4, 0));

    const p = h.viewport.surfacePoint(center.x, center.y);
    expect(p).not.toBeNull();
    expect(p!.y).toBeCloseTo(4, 6); // 顶面交点（非地面 y=0）
    expect(p!.x).toBeCloseTo(0, 4);
    expect(p!.z).toBeCloseTo(0, 4);
  });

  it('表面交点取最近命中（两盒沿视线前后叠放 → 前盒表面）', () => {
    const h = createHarness();
    placeBox(h, 0, 1, 0, 4); // 后盒（前立面 z=2）
    placeBox(h, 0, 1, 6, 2); // 前盒（前立面 z=7），相机在 +z 侧水平正视
    h.frame();
    // 相机 y=1 水平正对：中心射线依次穿前盒前立面(z=7) → 后盒前立面(z=2)
    h.camera.position.set(0, 1, 20);
    h.camera.lookAt(new THREE.Vector3(0, 1, 0));
    h.camera.updateMatrixWorld(true);

    const p = h.viewport.surfacePoint(center.x, center.y);
    expect(p).not.toBeNull();
    expect(p!.z).toBeCloseTo(7, 6); // 前盒前立面（近者胜）
    expect(p!.y).toBeCloseTo(1, 6);
  });

  it('AUX 层辅助对象不在拾取集：拾取根外的对象不命中 → 落地面', () => {
    const h = createHarness();
    // 模拟覆盖层/预览组：不在 pickRoot（contentGroup）内的 AUX 对象
    const aux = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshBasicMaterial());
    aux.position.set(0, 2, 0);
    aux.layers.set(AUX_LAYER);
    // 不加入 pickRoot —— RuntimeViewport 只对 pickRoot.children 做 intersectObjects
    const scene = new THREE.Scene();
    scene.add(h.pickRoot);
    scene.add(aux);
    h.frame();
    scene.updateMatrixWorld(true);
    aimCamera(h.camera, new THREE.Vector3(0, 0, 0));

    const p = h.viewport.surfacePoint(center.x, center.y);
    expect(p).not.toBeNull();
    expect(p!.y).toBeCloseTo(0, 6); // 未命中对象 → 地面兜底
  });

  it('地面兜底：无对象命中 → y=0 平面交点', () => {
    const h = createHarness();
    h.frame();
    aimCamera(h.camera, new THREE.Vector3(12, 0, -8));

    const p = h.viewport.surfacePoint(center.x, center.y);
    expect(p).not.toBeNull();
    expect(p!.x).toBeCloseTo(12, 6);
    expect(p!.y).toBeCloseTo(0, 6);
    expect(p!.z).toBeCloseTo(-8, 6);
  });

  it('近水平限距：地面交点距相机 > 2000m → null', () => {
    const h = createHarness();
    h.frame();
    // 相机贴地(y=0.5)远望：与 y=0 平面交点在极远处（>2000m）
    h.camera.position.set(0, 0.5, 0);
    h.camera.lookAt(new THREE.Vector3(0, 0, -10000));
    h.camera.updateMatrixWorld(true);

    expect(h.viewport.surfacePoint(center.x, center.y)).toBeNull();
  });

  it('地面交点距相机恰在 2000m 内 → 返回交点（边界内不放空）', () => {
    const h = createHarness();
    h.frame();
    // 俯角构造交点距离 ~50m：正常返回
    h.camera.position.set(0, 30, 40);
    h.camera.lookAt(new THREE.Vector3(0, 0, 0));
    h.camera.updateMatrixWorld(true);

    const p = h.viewport.surfacePoint(center.x, center.y);
    expect(p).not.toBeNull();
    expect(p!.y).toBeCloseTo(0, 6);
  });

  it('射线背离地面（仰望天空）→ null', () => {
    const h = createHarness();
    h.frame();
    h.camera.position.set(0, 5, 0);
    h.camera.lookAt(new THREE.Vector3(0, 100, 0)); // 正上方
    h.camera.updateMatrixWorld(true);

    expect(h.viewport.surfacePoint(center.x, center.y)).toBeNull();
  });

  it('画布零尺寸 → null', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20000);
    const viewport = new RuntimeViewport(
      fakeCanvas(0, 0),
      camera,
      new THREE.Group(),
      new RuntimeObjectMap(),
    );
    expect(viewport.surfacePoint(10, 10)).toBeNull();
  });
});
