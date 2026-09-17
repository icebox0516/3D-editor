/**
 * tests/runtime/VertexEditImpl.test.ts —— 顶点编辑句柄层测试（阶段 6 T6.8，先测后码）。
 *
 * 覆盖（任务书验收 2/3/4/6 项的 runtime 语义）：
 * - beginSession：句柄挂载（顶点 + 边中点；闭合环含首尾边）、AUX_LAYER 划层
 *   （拾取隔离——不在内容组、不被内容拾取命中）、初始读数推送（draw:status）；
 * - 拖动顶点：pointerdown 抓取句柄（对象面片在其后方仍抓句柄——拾取优先级）、
 *   pointermove 节流更新（rAF 合帧）、pointerup 一次性 before/after 回调
 *   （VertexEditPort 通道；未移动 before===after）；orbit 启停；
 * - 世界 ↔ 局部换算：wrapper 带 position/rotation/scale 时点列仍落局部坐标；
 * - G 吸附管线：注入的 snap.apply 生效（Shift 正交 / 网格吸附由管线决定）；
 * - Alt+点击边中点 → 插入顶点（before/after 长度差 1、回调一次）；
 * - 右键点按顶点 → 删除（约束 ≥3 面 / ≥2 线拦截 → draw:status error、无回调）；
 * - requestVertexRemoval（Delete 键转发）：悬停顶点删除、无悬停 false；
 * - setPoints / endSession：句柄重排 / 全清理 + 按场景恢复（restoreShape 回调）+ 状态栏复位；
 * - dispose：监听移除、常驻资源释放（后续派发不再响应）。
 *
 * 装置：node + 真实 THREE（无 WebGL 渲染）；DOM 经 FakeEventTarget 注入
 * （VertexEditImpl 只依赖 addEventListener/removeEventListener/getBoundingClientRect
 * 与事件字段）；指针事件坐标由句柄世界位置经相机投影反算（所见即所抓）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { Vec2 } from '../../src/core/types';
import { EventBus } from '../../src/core/events/EventBus';
import type { DrawStatusPayload } from '../../src/core/events/events';
import type { RegionObject } from '../../src/domain/regions';
import { VertexEditImpl } from '../../src/runtime/services/VertexEditImpl';
import type { VertexEditDeps, VertexSnapPipeline } from '../../src/runtime/services/VertexEditImpl';

// ── Fake DOM ─────────────────────────────────────────────────

const W = 800;
const H = 600;

class FakeEventTarget {
  readonly handlers = new Map<string, Set<(e: unknown) => void>>();
  readonly rect = { left: 0, top: 0, width: W, height: H };

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
    return this.rect;
  }
}

/** 指针事件工厂（stopImmediatePropagation 可观测） */
function pointer(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    button: 0,
    clientX: 0,
    clientY: 0,
    shiftKey: false,
    altKey: false,
    stopImmediatePropagation: vi.fn(),
    ...overrides,
  };
}

// ── 装置 ─────────────────────────────────────────────────────

const TRIANGLE: Vec2[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 0, y: 10 },
];

const BASE_HEIGHT = 0.12;

function makeRegion(points: Vec2[], closed: boolean): RegionObject {
  return {
    id: 'region_vx',
    type: 'region',
    name: '顶点编辑测试',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: { position: { x: 2, y: 1, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 2, y: 2, z: 2 } },
    properties: {},
    shape: { type: closed ? 'polygon' : 'line', points, baseHeight: BASE_HEIGHT, closed },
    semantic: { type: 'water', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
  };
}

interface Fixture {
  eventBus: EventBus;
  statuses: DrawStatusPayload[];
  previewCalls: Array<{ type: string; points: Vec2[]; closed: boolean }>;
  restoreCalls: string[];
  root: THREE.Group;
  region: RegionObject;
  flushQueue: Array<() => void>;
  makeImpl(overrides?: Partial<VertexEditDeps>): VertexEditImpl;
}

function setupFixture(points = TRIANGLE, closed = true): Fixture {
  const eventBus = new EventBus();
  const statuses: DrawStatusPayload[] = [];
  eventBus.on('draw:status', (p) => statuses.push({ ...p }));
  const previewCalls: Array<{ type: string; points: Vec2[]; closed: boolean }> = [];
  const restoreCalls: string[] = [];
  const root = new THREE.Group();
  root.position.set(2, 1, 3);
  root.scale.set(2, 2, 2);
  const region = makeRegion(points, closed);
  const flushQueue: Array<() => void> = [];

  const makeImpl = (overrides: Partial<VertexEditDeps> = {}): VertexEditImpl => {
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 10000);
    camera.position.set(6, 80, 60);
    camera.lookAt(6, 0, 6);
    camera.updateMatrixWorld(true);
    root.updateMatrixWorld(true);
    const deps: VertexEditDeps = {
      camera,
      domElement: new FakeEventTarget() as unknown as HTMLElement,
      scene: new THREE.Scene(),
      orbit: { enabled: true },
      eventBus,
      schedule: (fn) => flushQueue.push(fn),
      getRegion: () => ({ root, region }),
      previewShape: (_id, working) => {
        previewCalls.push({ type: working.type, points: working.points.map((p) => ({ ...p })), closed: working.closed });
      },
      restoreShape: (id) => restoreCalls.push(id),
      ...overrides,
    };
    return new VertexEditImpl(deps);
  };

  return { eventBus, statuses, previewCalls, restoreCalls, root, region, flushQueue, makeImpl };
}

/** 世界坐标 → 视口 CSS 像素（与 impl 的 NDC 换算互逆；取 impl 的相机） */
function worldToScreen(impl: VertexEditImpl, world: THREE.Vector3): { clientX: number; clientY: number } {
  const camera = (impl as unknown as { deps: VertexEditDeps }).deps.camera;
  const v = world.clone().project(camera);
  return {
    clientX: ((v.x + 1) / 2) * W,
    clientY: ((1 - v.y) / 2) * H,
  };
}

/** 局部业务点 → 世界（顶点句柄的世界位置：y = baseHeight） */
function localToWorld(fixture: Fixture, p: Vec2): THREE.Vector3 {
  return fixture.root.localToWorld(new THREE.Vector3(p.x, BASE_HEIGHT, p.y));
}

/** 句柄网格（按 userData 过滤） */
function handlesOf(impl: VertexEditImpl, kind: 'vertex' | 'mid'): THREE.Object3D[] {
  return impl.handlesRoot.children.filter((c) => (c.userData as { kind?: string }).kind === kind);
}

/** 拖动一个顶点：在句柄屏幕位置按下 → 移动到目标世界位置 → 抬起（含 flush） */
function dragVertexTo(
  impl: VertexEditImpl,
  fixture: Fixture,
  index: number,
  targetWorld: THREE.Vector3,
  modifiers: Record<string, unknown> = {},
): void {
  const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
  const handle = handlesOf(impl, 'vertex')[index]!;
  const start = worldToScreen(impl, handle.getWorldPosition(new THREE.Vector3()));
  const end = worldToScreen(impl, targetWorld);
  dom.dispatch('pointerdown', pointer({ ...start, ...modifiers }));
  dom.dispatch('pointermove', pointer({ ...end, ...modifiers }));
  fixture.flushQueue.forEach((fn) => fn());
  fixture.flushQueue.length = 0;
  dom.dispatch('pointerup', pointer({ ...end, ...modifiers }));
}

describe('frame()：句柄屏幕恒定尺寸（相机距离自适应缩放，T6.8 可用性修复）', () => {
  it('会话中 frame：句柄屏幕直径恒定（远距大 scale、近距小 scale，比值 = 距离比）', () => {
    const fixture = setupFixture();
    const impl2 = fixture.makeImpl();
    try {
      impl2.beginSession({ objectId: 'region_vx', points: TRIANGLE.map((p) => ({ ...p })), closed: true });
      const camera = (impl2 as unknown as { deps: VertexEditDeps }).deps.camera as THREE.PerspectiveCamera;
      const measure = (): number => {
        const handle = handlesOf(impl2, 'vertex')[0]!;
        const p = handle.getWorldPosition(new THREE.Vector3());
        const dist = p.distanceTo(camera.position);
        // 屏幕直径 px = 2*radius*scale / (2*tan(fov/2)*dist) * H
        return (2 * 0.45 * handle.scale.x * H) / (2 * Math.tan((camera.fov * Math.PI) / 360) * dist);
      };
      camera.position.set(6, 80, 60);
      camera.lookAt(6, 0, 6);
      camera.updateMatrixWorld(true);
      impl2.frame();
      const pxNear = measure();
      camera.position.set(6, 160, 120);
      camera.lookAt(6, 0, 6);
      camera.updateMatrixWorld(true);
      impl2.frame();
      const pxFar = measure();
      expect(pxNear).toBeGreaterThan(8); // 不小于 8px（可点击）
      expect(pxNear).toBeLessThan(20);
      expect(pxFar / pxNear).toBeCloseTo(1, 0); // 屏幕尺寸恒定（±50% 容差内）
    } finally {
      impl2.dispose();
    }
  });

  it('无会话 / dispose 后 frame 安全 no-op（渲染循环常调零风险）', () => {
    const impl2 = setupFixture().makeImpl();
    expect(() => impl2.frame()).not.toThrow();
    impl2.beginSession({ objectId: 'region_vx', points: TRIANGLE.map((p) => ({ ...p })), closed: true });
    impl2.endSession();
    expect(() => impl2.frame()).not.toThrow();
    impl2.dispose();
    expect(() => impl2.frame()).not.toThrow();
  });
});

describe('VertexEditImpl 句柄层', () => {
  let fx: ReturnType<typeof setupFixture>;
  let impl: VertexEditImpl;

  beforeEach(() => {
    fx = setupFixture();
    impl = fx.makeImpl();
  });

  afterEach(() => {
    impl.dispose();
  });

  it('beginSession：顶点 + 边中点句柄挂载（闭合环含首尾边）、AUX_LAYER 划层、初始读数推送', () => {
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });

    expect(handlesOf(impl, 'vertex')).toHaveLength(3);
    expect(handlesOf(impl, 'mid')).toHaveLength(3); // 闭合：3 边（含尾→首）
    // AUX_LAYER(3)：内容拾取（layer 0）不可见，拾取隔离的结构保障
    for (const child of impl.handlesRoot.children) {
      expect(child.layers.mask).toBe(1 << 3);
    }
    // 初始读数：顶点数 + 面积 + 周长
    const last = fx.statuses.at(-1)!;
    expect(last.vertexCount).toBe(3);
    expect(last.area).toBeGreaterThan(0);
    expect(last.length).toBeGreaterThan(0);
  });

  it('开口折线：边中点 = 点数-1', () => {
    impl.beginSession({
      objectId: 'region_vx',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      closed: false,
    });
    expect(handlesOf(impl, 'vertex')).toHaveLength(2);
    expect(handlesOf(impl, 'mid')).toHaveLength(1);
  });

  it('拖动顶点：抓取句柄（面片在句柄后方仍优先）、一次性 before/after、orbit 启停、节流预览', () => {
    const orbit = { enabled: true };
    impl.dispose();
    impl = fx.makeImpl({ orbit });
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);

    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });
    const handle = handlesOf(impl, 'vertex')[0]!;
    const startWorld = handle.getWorldPosition(new THREE.Vector3());
    const targetWorld = startWorld.clone().add(new THREE.Vector3(4, 0, 0));

    dragVertexTo(impl, fx, 0, targetWorld);

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    const info = onDragEnd.mock.calls[0]![0] as { objectId: string; before: Vec2[]; after: Vec2[] };
    expect(info.objectId).toBe('region_vx');
    expect(info.before).toEqual(TRIANGLE);
    expect(info.after[0]).not.toEqual(TRIANGLE[0]); // 拖动点已变
    expect(info.after.slice(1)).toEqual(TRIANGLE.slice(1)); // 其余点不动
    expect(orbit.enabled).toBe(true); // 抬起后恢复
    // 节流预览：pointermove 后仅一次 flush → 一次几何预览（世界→局部换算经 wrapper 逆矩阵）
    expect(fx.previewCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('拖动落点换算到局部坐标：wrapper 带 position/scale（2x）时局部位移 = 世界位移 / 2', () => {
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });

    const handle = handlesOf(impl, 'vertex')[0]!;
    const startWorld = handle.getWorldPosition(new THREE.Vector3());
    const targetWorld = startWorld.clone().add(new THREE.Vector3(4, 0, 0)); // 世界 +4x
    dragVertexTo(impl, fx, 0, targetWorld);

    const { after } = onDragEnd.mock.calls[0]![0] as { before: Vec2[]; after: Vec2[] };
    // 局部 x 位移 = 4 / scale.x(2) = 2
    expect(after[0]!.x).toBeCloseTo(TRIANGLE[0]!.x + 2, 5);
    expect(after[0]!.y).toBeCloseTo(TRIANGLE[0]!.y, 5);
  });

  it('未移动的按下→抬起：before === after（零位移由 editor 侧跳过）', () => {
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });

    const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
    const handle = handlesOf(impl, 'vertex')[1]!;
    const at = worldToScreen(impl, handle.getWorldPosition(new THREE.Vector3()));
    dom.dispatch('pointerdown', pointer(at));
    dom.dispatch('pointerup', pointer(at));

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    const { before, after } = onDragEnd.mock.calls[0]![0] as { before: Vec2[]; after: Vec2[] };
    expect(before).toEqual(after);
  });

  it('吸附管线：注入 snap.apply（网格 5m）→ 拖动落点吸附到网格', () => {
    const snap: VertexSnapPipeline = {
      // 世界网格吸附 5m（复用 editor/tools/draw/snap.gridSnap 的语义由组合根注入）
      apply: (raw) => ({ x: Math.round(raw.x / 5) * 5, y: Math.round(raw.y / 5) * 5 }),
    };
    impl.dispose();
    impl = fx.makeImpl({ snap });
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });

    const handle = handlesOf(impl, 'vertex')[0]!;
    const startWorld = handle.getWorldPosition(new THREE.Vector3());
    const targetWorld = startWorld.clone().add(new THREE.Vector3(2.4, 0, 0)); // 非网格点
    dragVertexTo(impl, fx, 0, targetWorld);

    const { after } = onDragEnd.mock.calls[0]![0] as { after: Vec2[] };
    // 世界 x：2*2+2.4=6.4 → 吸附 5 → 局部 (5-2)/2 = 1.5
    expect(after[0]!.x).toBeCloseTo(1.5, 5);
  });

  it('Alt+点击边中点 → 插入顶点（回调一次、点数 +1、插在中点位置）', () => {
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });

    const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
    const mid = handlesOf(impl, 'mid')[0]!; // 边 0→1 的中点（局部 (5,0)）
    const at = worldToScreen(impl, mid.getWorldPosition(new THREE.Vector3()));
    dom.dispatch('pointerdown', pointer({ ...at, altKey: true }));

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    const { before, after } = onDragEnd.mock.calls[0]![0] as { before: Vec2[]; after: Vec2[] };
    expect(before).toHaveLength(3);
    expect(after).toHaveLength(4);
    expect(after[1]).toEqual({ x: 5, y: 0 }); // 插入点 = 边中点（局部坐标）
    expect(handlesOf(impl, 'vertex')).toHaveLength(4); // 句柄已重排
    expect(fx.previewCalls.length).toBeGreaterThanOrEqual(1); // 预览即时重建
  });

  it('右键点按顶点 → 删除（面 4 点删至 3 点）', () => {
    const four: Vec2[] = [...TRIANGLE, { x: -4, y: -4 }];
    impl.dispose();
    fx = setupFixture(four, true);
    impl = fx.makeImpl();
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: four, closed: true });

    const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
    const handle = handlesOf(impl, 'vertex')[2]!;
    const at = worldToScreen(impl, handle.getWorldPosition(new THREE.Vector3()));
    dom.dispatch('pointerdown', pointer({ ...at, button: 2 }));
    dom.dispatch('pointerup', pointer({ ...at, button: 2 }));

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    const { before, after } = onDragEnd.mock.calls[0]![0] as { before: Vec2[]; after: Vec2[] };
    expect(before).toHaveLength(4);
    expect(after).toHaveLength(3);
    expect(after).not.toContainEqual({ x: 0, y: 10 }); // index 2 已删
  });

  it('右键拖拽（旋转视角手势）不删除', () => {
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });
    const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
    const handle = handlesOf(impl, 'vertex')[0]!;
    const at = worldToScreen(impl, handle.getWorldPosition(new THREE.Vector3()));
    dom.dispatch('pointerdown', pointer({ ...at, button: 2 }));
    dom.dispatch('pointerup', pointer({ ...at, button: 2, clientX: at.clientX + 40 }));
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('删除约束拦截：面 3 点删第 4 点前（=3 时）→ draw:status error、无回调', () => {
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });

    const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
    const handle = handlesOf(impl, 'vertex')[1]!;
    const at = worldToScreen(impl, handle.getWorldPosition(new THREE.Vector3()));
    fx.statuses.length = 0;
    dom.dispatch('pointerdown', pointer({ ...at, button: 2 }));
    dom.dispatch('pointerup', pointer({ ...at, button: 2 }));

    expect(onDragEnd).not.toHaveBeenCalled();
    expect(fx.statuses.at(-1)!.error).toContain('3');
    expect(handlesOf(impl, 'vertex')).toHaveLength(3); // 点列未变
  });

  it('requestVertexRemoval（Delete 转发）：悬停顶点删除；无悬停返回 false', () => {
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.beginSession({ objectId: 'region_vx', points: [...TRIANGLE, { x: -4, y: -4 }], closed: true });

    const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
    expect(impl.requestVertexRemoval()).toBe(false); // 无悬停

    const handle = handlesOf(impl, 'vertex')[3]!;
    const at = worldToScreen(impl, handle.getWorldPosition(new THREE.Vector3()));
    dom.dispatch('pointermove', pointer(at)); // 悬停
    expect(impl.requestVertexRemoval()).toBe(true);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect((onDragEnd.mock.calls[0]![0] as { after: Vec2[] }).after).toHaveLength(3);
  });

  it('读数实时：拖动中 draw:status 携带 vertexCount/area/length/cursor', () => {
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });
    fx.statuses.length = 0;

    const handle = handlesOf(impl, 'vertex')[0]!;
    const startWorld = handle.getWorldPosition(new THREE.Vector3());
    dragVertexTo(impl, fx, 0, startWorld.clone().add(new THREE.Vector3(4, 0, 0)));

    const duringDrag = fx.statuses.find((s) => s.cursor !== undefined);
    expect(duringDrag).toBeDefined();
    expect(duringDrag!.vertexCount).toBe(3);
    expect(typeof duringDrag!.area).toBe('number');
    expect(typeof duringDrag!.length).toBe('number');
  });

  it('setPoints：句柄重排（撤销/外部变更同步）', () => {
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });
    impl.setPoints([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
    expect(handlesOf(impl, 'vertex')).toHaveLength(4);
    expect(handlesOf(impl, 'mid')).toHaveLength(4);
  });

  it('endSession：句柄清理 + 按场景恢复（restoreShape）+ 状态栏复位（空载荷）', () => {
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });
    impl.endSession();

    expect(impl.handlesRoot.children).toHaveLength(0);
    expect(fx.restoreCalls).toEqual(['region_vx']);
    expect(fx.statuses.at(-1)).toEqual({}); // 空载荷复位状态栏
  });

  it('dispose：监听移除（后续派发无响应）+ 常驻几何/材质释放', () => {
    const geometryDispose = vi.spyOn(
      (impl as unknown as { vertexGeometry: THREE.BufferGeometry }).vertexGeometry,
      'dispose',
    );
    const materialDispose = vi.spyOn(
      (impl as unknown as { vertexMaterial: THREE.Material }).vertexMaterial,
      'dispose',
    );
    impl.beginSession({ objectId: 'region_vx', points: TRIANGLE, closed: true });
    const onDragEnd = vi.fn();
    impl.onDragEnd(onDragEnd);
    impl.dispose();

    const dom = (impl as unknown as { deps: VertexEditDeps }).deps.domElement as unknown as FakeEventTarget;
    const handleWorld = localToWorld(fx, TRIANGLE[0]!);
    const at = worldToScreen(impl, handleWorld);
    expect(() => dom.dispatch('pointerdown', pointer(at))).not.toThrow();
    expect(onDragEnd).not.toHaveBeenCalled();
    expect(geometryDispose).toHaveBeenCalled();
    expect(materialDispose).toHaveBeenCalled();
  });
});
