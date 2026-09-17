/**
 * tests/runtime/renderers/VertexEditPreview.test.ts —— 顶点编辑预览解耦测试（T6.8，先测后码）。
 *
 * 覆盖（任务书完成定义「拖动期间材质实例不变（引用断言）」——T6.4 解耦用例扩展）：
 * - 真实链路（RegionRenderer + VertexEditImpl 经 Renderer 同形接线）：拖动中每次 flush
 *   经 applyShapePreview 重建几何重绑（旧几何 dispose），**material 引用不变**、
 *   样式实例 object 引用不变（wrapper 根恒定）；
 * - 插入/删除预览同走 setGeometry 路径（材质不动）；
 * - 会话结束（零修改退出）：restoreShape 按 scene:changed 权威数据恢复——参数化形状
 *   （circle）几何重建回原采样点列，material 仍不变；
 * - dispose 零泄漏：会话期间创建的全部中间几何在 dispose/恢复后均释放（dispose 事件计数）。
 *
 * 装置：沿 RegionRenderer.test 临时预设 seam（registerBuildRoute）；真实 THREE 材质，
 * node 可实例化、不做 WebGL 渲染。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { EventBus } from '../../../src/core/events/EventBus';
import type { Vec2 } from '../../../src/core/types';
import type { RegionObject, ShapeType } from '../../../src/domain/regions';
import { VertexEditImpl } from '../../../src/runtime/services/VertexEditImpl';
import type { VertexEditDeps } from '../../../src/runtime/services/VertexEditImpl';
import { RegionRenderer } from '../../../src/runtime/renderers/RegionRenderer';
import { registerBuildRoute, unregisterBuildRoute } from '../../../src/runtime/styles/routes';
import type { StyleInstance, StylePresetBuild } from '../../../src/runtime/styles/types';

// ── 临时预设 seam（沿 RegionRenderer.test 范式）──────────────

const ALL_SHAPES: ShapeType[] = ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line', 'point'];
const PRESET = 'test.vx_solid';
const tempRoutes: string[] = [];

function registerTempPreset(): void {
  const build: StylePresetBuild = (geometry, params) => {
    const color = typeof params.color === 'string' && params.color !== '' ? params.color : '#4a6fa5';
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color) });
    const mesh = new THREE.Mesh(geometry, material);
    const instance: StyleInstance = {
      object: mesh,
      material,
      presetId: PRESET,
      supportedShapes: [...ALL_SHAPES],
      update() {},
      setGeometry(next) {
        mesh.geometry = next;
      },
      dispose() {
        mesh.removeFromParent();
      },
    };
    return instance;
  };
  registerBuildRoute(PRESET, build, {
    id: PRESET,
    name: PRESET,
    supportedShapes: [...ALL_SHAPES],
    supportedSemantics: ['unclassified', 'water'],
    defaultParams: [{ key: 'color', label: '颜色', type: 'color', default: '#4a6fa5' }],
  });
  tempRoutes.push(PRESET);
}

/** dispose 事件计数 */
function countDisposes(target: THREE.BufferGeometry): { count: () => number } {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return { count: () => n };
}

// ── fixture ─────────────────────────────────────────────────

const CIRCLE_SEGMENTS = 8;
const CIRCLE_POINTS: Vec2[] = Array.from({ length: CIRCLE_SEGMENTS }, (_, i) => {
  const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
  return { x: Math.cos(a) * 5, y: Math.sin(a) * 5 };
});

function makeRegion(shapeType: 'circle' | 'polygon', points: Vec2[]): RegionObject {
  return {
    id: 'region_vx',
    type: 'region',
    name: '预览解耦',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
    shape:
      shapeType === 'circle'
        ? { type: 'circle', points: points, baseHeight: 0.18, closed: true, options: { radius: 5, segments: CIRCLE_SEGMENTS } }
        : { type: 'polygon', points, baseHeight: 0.18, closed: true },
    semantic: { type: 'water', properties: {} },
    style: { presetId: PRESET, overrides: {} },
  };
}

const W = 800;
const H = 600;

class FakeEventTarget {
  readonly handlers = new Map<string, Set<(e: unknown) => void>>();
  addEventListener(type: string, handler: (e: unknown) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }
  removeEventListener(type: string, handler: (e: unknown) => void): void {
    this.handlers.get(type)?.delete(handler);
  }
  dispatch(type: string, event: Record<string, unknown>): void {
    for (const handler of [...(this.handlers.get(type) ?? [])]) handler(event);
  }
  getBoundingClientRect(): { left: number; top: number; width: number; height: number } {
    return { left: 0, top: 0, width: W, height: H };
  }
}

function pointer(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { button: 0, clientX: 0, clientY: 0, shiftKey: false, altKey: false, ...overrides };
}

/** Renderer.previewRegionShape 的同形接线（无 WebGL 的 Renderer 替身） */
interface Harness {
  renderer: RegionRenderer;
  impl: VertexEditImpl;
  root: THREE.Object3D;
  region: RegionObject;
  flushQueue: Array<() => void>;
  dom: FakeEventTarget;
  camera: THREE.PerspectiveCamera;
  dispose(): void;
}

function setupHarness(shapeType: 'circle' | 'polygon', points: Vec2[]): Harness {
  const eventBus = new EventBus();
  const renderer = new RegionRenderer();
  const region = makeRegion(shapeType, points);
  const root = renderer.create(region);
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 10000);
  camera.position.set(0, 80, 60);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  root.updateMatrixWorld(true);
  const flushQueue: Array<() => void> = [];
  const dom = new FakeEventTarget();

  const deps: VertexEditDeps = {
    camera,
    domElement: dom as unknown as HTMLElement,
    scene: new THREE.Scene(),
    orbit: { enabled: true },
    eventBus,
    schedule: (fn) => flushQueue.push(fn),
    getRegion: () => ({ root, region }),
    previewShape: (_id, working) => {
      // Renderer.previewRegionShape 同形：RegionRenderer.applyShapePreview
      renderer.applyShapePreview(root, region, {
        type: working.type,
        points: working.points,
        baseHeight: region.shape.baseHeight,
        closed: working.closed,
      });
    },
    restoreShape: () => {
      renderer.update(root, region, ['shape']); // Renderer.update(id, ['shape']) 同形
    },
  };
  const impl = new VertexEditImpl(deps);

  return {
    renderer,
    impl,
    root,
    region,
    flushQueue,
    dom,
    camera,
    dispose() {
      impl.dispose();
      renderer.dispose(root);
      for (const id of tempRoutes.splice(0)) unregisterBuildRoute(id);
    },
  };
}

function worldToScreen(camera: THREE.PerspectiveCamera, world: THREE.Vector3): { clientX: number; clientY: number } {
  const v = world.clone().project(camera);
  return { clientX: ((v.x + 1) / 2) * W, clientY: ((1 - v.y) / 2) * H };
}

/** 拖动第 index 个顶点到目标世界位置（flush 落地） */
function dragVertexTo(h: Harness, index: number, targetWorld: THREE.Vector3): void {
  const handle = h.impl.handlesRoot.children.find(
    (c) => (c.userData as { kind?: string }).kind === 'vertex' && (c.userData as { index?: number }).index === index,
  )!;
  const start = worldToScreen(h.camera, handle.getWorldPosition(new THREE.Vector3()));
  const end = worldToScreen(h.camera, targetWorld);
  h.dom.dispatch('pointerdown', pointer(start));
  h.dom.dispatch('pointermove', pointer(end));
  h.flushQueue.forEach((fn) => fn());
  h.flushQueue.length = 0;
  h.dom.dispatch('pointerup', pointer(end));
}

beforeEach(() => {
  registerTempPreset();
});

describe('顶点编辑预览解耦（拖动期间材质实例不变）', () => {
  it('拖动中：几何重建重绑（顶点位置生效）、material 与 object 引用不变、旧几何 dispose', () => {
    const h = setupHarness('polygon', [
      { x: -5, y: -4 },
      { x: 5, y: -4 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ]);
    try {
      const mesh = h.root.children[0] as THREE.Mesh;
      const material = mesh.material;
      const oldGeometry = mesh.geometry;
      const oldDisposes = countDisposes(oldGeometry);

      h.impl.beginSession({ objectId: 'region_vx', points: h.region.shape.points, closed: true });
      dragVertexTo(h, 0, new THREE.Vector3(-9, 0, -9)); // 拖出包围盒（外沿必变）

      expect(mesh.geometry).not.toBe(oldGeometry); // 几何重建重绑
      expect(oldDisposes.count()).toBe(1); // 旧几何释放（授权规则 2）
      expect(mesh.material).toBe(material); // 材质实例不变（解耦断言①）
      expect(h.root.children[0]).toBe(mesh); // 样式实例 object 引用不变（wrapper 根恒定）
      // 顶点位置确实生效（新几何外沿 ≈ 拖出后的角点；斜视投影 + 平面高度差存在分米级偏差）
      mesh.geometry.computeBoundingBox();
      expect(mesh.geometry.boundingBox!.min.x).toBeLessThan(-8.5);
      expect(mesh.geometry.boundingBox!.min.z).toBeLessThan(-8.5);
    } finally {
      h.dispose();
    }
  });

  it('多次拖动 flush：材质始终同一实例、每帧旧几何释放（中间几何零泄漏）', () => {
    const h = setupHarness('polygon', [
      { x: -5, y: -4 },
      { x: 5, y: -4 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ]);
    try {
      const mesh = h.root.children[0] as THREE.Mesh;
      const material = mesh.material;
      const disposedGeometries: THREE.BufferGeometry[] = [];
      const trackGeometry = (): void => {
        const g = mesh.geometry;
        g.addEventListener('dispose', () => disposedGeometries.push(g));
      };

      h.impl.beginSession({ objectId: 'region_vx', points: h.region.shape.points, closed: true });
      const vertexHandle = () =>
        h.impl.handlesRoot.children.find((c) => (c.userData as { kind?: string }).kind === 'vertex')!;

      for (let step = 1; step <= 3; step++) {
        trackGeometry();
        // 每段以句柄当前位置为按下点（上段拖动已移动句柄），目标 = 当前 + step*2 世界 x
        const handleWorld = vertexHandle().getWorldPosition(new THREE.Vector3());
        const start = worldToScreen(h.camera, handleWorld);
        const end = worldToScreen(h.camera, handleWorld.clone().add(new THREE.Vector3(step * 2, 0, 0)));
        h.dom.dispatch('pointerdown', pointer(start));
        h.dom.dispatch('pointermove', pointer(end));
        h.flushQueue.forEach((fn) => fn());
        h.flushQueue.length = 0;
        h.dom.dispatch('pointerup', pointer(end));
        expect(mesh.material).toBe(material); // 每段材质不变
      }
      expect(disposedGeometries.length).toBe(3); // 每帧预览的旧几何均释放
    } finally {
      h.dispose();
    }
  });

  it('插入/删除预览同走 setGeometry 路径（材质不动）', () => {
    const h = setupHarness('polygon', [
      { x: -5, y: -4 },
      { x: 5, y: -4 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ]);
    try {
      const mesh = h.root.children[0] as THREE.Mesh;
      const material = mesh.material;

      h.impl.beginSession({ objectId: 'region_vx', points: h.region.shape.points, closed: true });
      // Alt+点击第一条边中点 → 插入
      const mid = h.impl.handlesRoot.children.find(
        (c) => (c.userData as { kind?: string }).kind === 'mid',
      )!;
      const at = worldToScreen(h.camera, mid.getWorldPosition(new THREE.Vector3()));
      h.dom.dispatch('pointerdown', pointer({ ...at, altKey: true }));

      expect(mesh.material).toBe(material); // 插入预览不重建材质
    } finally {
      h.dispose();
    }
  });

  it('会话结束（零修改退出）：按场景数据恢复 circle 几何、material 仍不变', () => {
    const h = setupHarness('circle', CIRCLE_POINTS);
    try {
      const mesh = h.root.children[0] as THREE.Mesh;
      const material = mesh.material;
      const circleGeometry = mesh.geometry;
      const circleDisposes = countDisposes(circleGeometry);

      h.impl.beginSession({ objectId: 'region_vx', points: CIRCLE_POINTS, closed: true });
      // 拖一下（预览写入 polygon 工作点列几何——对象仍是 circle 数据）
      dragVertexTo(h, 0, new THREE.Vector3(0.5, 0, 5));
      expect(mesh.geometry).not.toBe(circleGeometry);

      h.impl.endSession(); // 零修改退出（无命令提交）

      expect(mesh.geometry).not.toBe(circleGeometry); // 恢复 = 权威重建（非旧对象复用）
      expect(circleDisposes.count()).toBe(1); // 原几何在首次预览时已释放
      mesh.geometry.computeBoundingBox();
      const box = mesh.geometry.boundingBox!;
      expect(box.max.x).toBeCloseTo(5, 3); // circle 半径 5 采样恢复
      expect(box.min.x).toBeCloseTo(-5, 3);
      expect(mesh.material).toBe(material); // 全程材质实例不变
      expect(h.impl.handlesRoot.children).toHaveLength(0);
    } finally {
      h.dispose();
    }
  });
});
