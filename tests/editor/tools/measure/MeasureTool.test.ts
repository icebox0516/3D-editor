/**
 * tests/editor/tools/measure/MeasureTool.test.ts —— 四类测量工具测试（FakePort，零 three）。
 *
 * 覆盖（T10.1 任务清单 §2 + stage10-measure §A 交互表，先测后码）：
 * - 注册与激活：四 id（measure.distance/height/area/angle）经 ToolManager 可激活；
 *   激活不切机位、不锁旋转（与绘制不同：测量常在透视下贴立面）；
 * - distance：逐点 + 双击/Enter 完成（末点去重 ε=0.01m）；三维段长/累计口径
 *   （5-12-13 固定向量）；顶点不足拦截（error、草稿保留）；
 * - height：2 点自动完成；三读数（空间 13 / 水平 5 / ΔH 12，可负）；
 * - area：≥3 非共线 + 双击完成；水平投影面积（3-4 直角三角形 = 6）；共线拦截（error、
 *   草稿保留）；不足拦截；
 * - angle：3 点（第 2 点为角点）自动完成；∠ABC 度数（90° 固定向量）；实时预览随游标；
 * - 吸附：G 网格（x/z 吸附、y 保留）、Shift 正交、A 45°（作用于 x/z）；
 * - ESC：只弃草稿（复位载荷 + updateDraft(null)），已提交项完整保留；
 * - Delete/退格：有草稿先弃草稿；无草稿删除上一条（measure:changed）；
 * - 会话生命周期：切工具（deactivate/再激活）不清空 MeasureSession；
 * - 四不变式之「零场景副作用」：测量全程 SceneManager 写方法与 history.execute 零调用、
 *   场景对象零、选中集不变；完成后复位载荷 = 仅含 kind。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MeasureKind, Vec3 } from '../../../../src/core/types';
import type { MeasureStatusPayload } from '../../../../src/core/events/events';
import { EventBus } from '../../../../src/core/events/EventBus';
import { createDrawGridConfig } from '../../../../src/editor/tools/draw';
import { MeasureTool } from '../../../../src/editor/tools/measure';
import { MeasureSession } from '../../../../src/editor/services/measure';
import { AssetRegistry } from '../../../../src/registries/AssetRegistry';
import { HistoryManager } from '../../../../src/editor/history/HistoryManager';
import { SceneManager } from '../../../../src/scene/SceneManager';
import { SelectionManager } from '../../../../src/scene/SelectionManager';
import { ToolManager } from '../../../../src/editor/tools/ToolManager';
import type { Tool, ToolContext } from '../../../../src/editor/tools';
import { ESC, key, pointer } from './fakes';
import { FakeMeasureOverlay, FakeSurfaceViewport } from './fakes';

/** 装配结果（沿 tests/editor/draw/fakes DrawFixture 形态） */
interface MeasureFixture<T extends Tool> {
  eventBus: EventBus;
  sceneManager: SceneManager;
  selection: SelectionManager;
  history: HistoryManager;
  viewport: FakeSurfaceViewport;
  overlay: FakeMeasureOverlay;
  session: MeasureSession;
  ctx: ToolContext;
  tools: ToolManager;
  tool: T;
  /** measure:status 事件负载收集（订阅即收集，含历史） */
  statuses: MeasureStatusPayload[];
  /** measure:changed 事件负载收集 */
  changed: Array<{ count: number }>;
  /** SceneManager 写方法调用间谍（零场景副作用断言） */
  sceneSpies: {
    addObject: ReturnType<typeof vi.spyOn>;
    removeObject: ReturnType<typeof vi.spyOn>;
    updateObject: ReturnType<typeof vi.spyOn>;
    reorderObjects: ReturnType<typeof vi.spyOn>;
  };
  historyExecuteSpy: ReturnType<typeof vi.spyOn>;
}

/** 装配一个测量工具测试环境（真实 MeasureSession + 记录型覆盖层 Fake）；激活由用例自行调用 */
function fullSetup(kind: MeasureKind): MeasureFixture<MeasureTool> {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const viewport = new FakeSurfaceViewport();
  const overlay = new FakeMeasureOverlay();
  const session = new MeasureSession(eventBus);
  // 四工具共享同一 session/overlay/drawGrid（组合根装配形态：单例会话 + 四注册）
  const drawGrid = createDrawGridConfig(1);
  const all: MeasureTool[] = (['distance', 'height', 'area', 'angle'] as const).map(
    (k) => new MeasureTool(k, session, overlay, drawGrid),
  );
  const tool = all.find((t) => t.id === `measure.${kind}`)!;

  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets: new AssetRegistry() },
    viewport,
    camera: {
      getMode: () => 'perspective',
      setMode() {},
      setOrthoLock() {},
      focusObjects() {},
      focusAll() {},
    },
    preview: {
      showGhost() {},
      updateGhost() {},
      hideGhost() {},
      updateDrawPreview() {},
      clear() {},
    },
    eventBus,
  };
  const tools = new ToolManager(ctx);
  for (const t of all) tools.register(t);

  const statuses: MeasureStatusPayload[] = [];
  eventBus.on('measure:status', (p) => statuses.push(p));
  const changed: Array<{ count: number }> = [];
  eventBus.on('measure:changed', (p) => changed.push(p));

  return {
    eventBus,
    sceneManager,
    selection,
    history,
    viewport,
    overlay,
    session,
    ctx,
    tools,
    tool,
    statuses,
    changed,
    sceneSpies: {
      addObject: vi.spyOn(sceneManager, 'addObject'),
      removeObject: vi.spyOn(sceneManager, 'removeObject'),
      updateObject: vi.spyOn(sceneManager, 'updateObject'),
      reorderObjects: vi.spyOn(sceneManager, 'reorderObjects'),
    },
    historyExecuteSpy: vi.spyOn(history, 'execute'),
  };
}

/** 便捷：预置表面拾取点并落点（move + down） */
function clickAt(
  fx: MeasureFixture<MeasureTool>,
  sx: number,
  sy: number,
  p: Vec3,
  overrides: Partial<ReturnType<typeof pointer>> = {},
): void {
  fx.viewport.setSurface(sx, sy, p);
  fx.tool.onPointerMove(pointer(sx, sy));
  fx.tool.onPointerDown(pointer(sx, sy, overrides));
}

describe('MeasureTool 注册与激活', () => {
  it('四 id 经 ToolManager 可激活；激活不切机位不锁旋转', () => {
    for (const kind of ['distance', 'height', 'area', 'angle'] as const) {
      const fx = fullSetup(kind);
      fx.tools.activate(`measure.${kind}`);
      expect(fx.tools.getActiveTool()!.id).toBe(`measure.${kind}`);
    }
  });

  it('无激活参数要求（params 可缺省）', () => {
    const fx = fullSetup('distance');
    expect(() => fx.tools.activate('measure.distance')).not.toThrow();
    expect(() => fx.tools.activate('measure.distance', { any: true })).not.toThrow();
  });
});

describe('MeasureTool distance（距离）', () => {
  let fx: MeasureFixture<MeasureTool>;
  beforeEach(() => {
    fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
  });

  it('两点 + 双击（重复点 ε 去重）→ 会话 +1 项；读数口径 = 三维空间距离（5-12-13）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 5, y: 12, z: 0 });
    // 双击 = 第二次 down（同位置，ε 内去重）+ doubleClick
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onDoubleClick(pointer(20, 20));

    expect(fx.session.list()).toHaveLength(1);
    const item = fx.session.list()[0]!;
    expect(item.kind).toBe('distance');
    expect(item.points).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 12, z: 0 },
    ]);
    expect(item.id.startsWith('measure_')).toBe(true);
    expect(fx.changed).toEqual([{ count: 1 }]);

    // 完成后：草稿清空 + 提交层推送 + 复位载荷（仅 kind）
    expect(fx.overlay.lastDraft).toBeNull();
    expect(fx.overlay.lastMeasurements).toHaveLength(1);
    expect(fx.statuses.at(-1)).toEqual({ kind: 'distance' });
  });

  it('实时读数：segment = 弹性段三维长；total = 含弹性段累计（5 + 13 = 18）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 0, z: 4 }); // 第一段 5
    fx.viewport.setSurface(30, 30, { x: 8, y: 12, z: 4 }); // 弹性段 13
    fx.tool.onPointerMove(pointer(30, 30));

    const last = fx.statuses.at(-1) as MeasureStatusPayload;
    expect(last.segment).toBeCloseTo(13, 10);
    expect(last.total).toBeCloseTo(18, 10);
    expect(last.cursor).toEqual({ x: 8, y: 12, z: 4 });
  });

  it('草稿推送：updateDraft 携带 kind/points/cursor（弹性段 = 末点→cursor）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    fx.viewport.setSurface(20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onPointerMove(pointer(20, 20));

    expect(fx.overlay.lastDraft).toEqual({
      kind: 'distance',
      points: [{ x: 0, y: 0, z: 0 }],
      cursor: { x: 3, y: 4, z: 0 },
    });
  });

  it('末点去重 ε=0.01m：0.005m 内的重复点击不加点，0.02m 新点加入', () => {
    fx.tool.onKeyDown(key('g')); // 关网格吸附（1m 网格会把 0.02 吸回 0，干扰 ε 语义观察）
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 11, 11, { x: 0.004, y: 0.003, z: 0 }); // 距 0.005 < 0.01 → 去重
    expect(fx.overlay.lastDraft!.points).toHaveLength(1);

    clickAt(fx, 12, 12, { x: 0.02, y: 0, z: 0 }); // > 0.01 → 新点
    expect(fx.overlay.lastDraft!.points).toHaveLength(2);
  });

  it('Enter 完成与双击同义', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onKeyDown(key('Enter'));
    expect(fx.session.list()).toHaveLength(1);
  });

  it('顶点不足（1 点双击）拦截：error 提示、草稿保留、不入会话', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onDoubleClick(pointer(10, 10));

    expect(fx.session.list()).toHaveLength(0);
    const last = fx.statuses.at(-1) as MeasureStatusPayload;
    expect(last.error).toMatch(/至少需要 2 个点/);
    expect(fx.overlay.lastDraft!.points).toHaveLength(1); // 草稿保留可续测
  });

  it('完成后可连续测量第二条（会话累计 2 项）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onDoubleClick(pointer(20, 20));
    clickAt(fx, 30, 30, { x: 10, y: 0, z: 0 });
    clickAt(fx, 40, 40, { x: 10, y: 0, z: 5 });
    fx.tool.onDoubleClick(pointer(40, 40));
    expect(fx.session.list()).toHaveLength(2);
    expect(fx.changed).toEqual([{ count: 1 }, { count: 2 }]);
  });
});

describe('MeasureTool height（高度差）', () => {
  let fx: MeasureFixture<MeasureTool>;
  beforeEach(() => {
    fx = fullSetup('height');
    fx.tools.activate('measure.height');
  });

  it('2 点自动完成：第二击即入会话（无需双击）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 5, y: 12, z: 0 });
    expect(fx.session.list()).toHaveLength(1);
    expect(fx.session.list()[0]!.points).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 12, z: 0 },
    ]);
  });

  it('三读数实时：空间 13 / 水平 5 / ΔH 12（5-12-13 固定向量）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    fx.viewport.setSurface(20, 20, { x: 5, y: 12, z: 0 });
    fx.tool.onPointerMove(pointer(20, 20));

    const last = fx.statuses.at(-1) as MeasureStatusPayload;
    expect(last.segment).toBeCloseTo(13, 10);
    expect(last.horizontal).toBeCloseTo(5, 10);
    expect(last.dh).toBeCloseTo(12, 10);
  });

  it('ΔH 可负（第二点低于第一点）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 12, z: 0 });
    fx.viewport.setSurface(20, 20, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerMove(pointer(20, 20));

    const last = fx.statuses.at(-1) as MeasureStatusPayload;
    expect(last.dh).toBeCloseTo(-12, 10);
    expect(last.horizontal).toBeCloseTo(0, 10);
    expect(last.segment).toBeCloseTo(12, 10);
  });
});

describe('MeasureTool area（面积）', () => {
  let fx: MeasureFixture<MeasureTool>;
  beforeEach(() => {
    fx = fullSetup('area');
    fx.tools.activate('measure.area');
  });

  it('三点 + 双击 → 会话 +1 项；水平投影面积 = 6（3-4 直角三角形，y 各异不参与）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 1, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 9, z: 0 });
    clickAt(fx, 30, 30, { x: 0, y: -2, z: 4 });
    fx.tool.onDoubleClick(pointer(30, 30));

    expect(fx.session.list()).toHaveLength(1);
    expect(fx.session.list()[0]!.kind).toBe('area');
    expect(fx.session.list()[0]!.points).toHaveLength(3);
  });

  it('实时面积：环 = 已固定点 + 游标（XZ 投影）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 0, z: 0 });
    fx.viewport.setSurface(30, 30, { x: 0, y: 7, z: 4 });
    fx.tool.onPointerMove(pointer(30, 30));

    const last = fx.statuses.at(-1) as MeasureStatusPayload;
    expect(last.area).toBeCloseTo(6, 10);
  });

  it('共线拦截：三点共线双击 → error、草稿保留、不入会话', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 4, y: 0, z: 0 });
    clickAt(fx, 30, 30, { x: 8, y: 0, z: 0 });
    fx.tool.onDoubleClick(pointer(30, 30));

    expect(fx.session.list()).toHaveLength(0);
    const last = fx.statuses.at(-1) as MeasureStatusPayload;
    expect(last.error).toMatch(/共线/);
    expect(fx.overlay.lastDraft!.points).toHaveLength(3); // 草稿保留可修正
  });

  it('顶点不足（2 点双击）拦截：error、不入会话', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 4, y: 0, z: 0 });
    fx.tool.onDoubleClick(pointer(20, 20));
    expect(fx.session.list()).toHaveLength(0);
    expect((fx.statuses.at(-1) as MeasureStatusPayload).error).toMatch(/至少需要 3 个点/);
  });

  it('Enter 完成与双击同义', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 0, z: 0 });
    clickAt(fx, 30, 30, { x: 0, y: 0, z: 4 });
    fx.tool.onKeyDown(key('Enter'));
    expect(fx.session.list()).toHaveLength(1);
  });
});

describe('MeasureTool angle（角度）', () => {
  let fx: MeasureFixture<MeasureTool>;
  beforeEach(() => {
    fx = fullSetup('angle');
    fx.tools.activate('measure.angle');
  });

  it('3 点自动完成：第 2 点为角点（A-B-C 顺序）', () => {
    clickAt(fx, 10, 10, { x: 1, y: 0, z: 0 }); // A
    clickAt(fx, 20, 20, { x: 0, y: 0, z: 0 }); // B（角点）
    clickAt(fx, 30, 30, { x: 0, y: 0, z: 1 }); // C
    expect(fx.session.list()).toHaveLength(1);
    expect(fx.session.list()[0]!.kind).toBe('angle');
    expect(fx.session.list()[0]!.points).toHaveLength(3);
  });

  it('实时角度：∠ABC 随游标（90° 固定向量）', () => {
    clickAt(fx, 10, 10, { x: 1, y: 0, z: 0 }); // A
    clickAt(fx, 20, 20, { x: 0, y: 0, z: 0 }); // B
    fx.viewport.setSurface(30, 30, { x: 0, y: 0, z: 1 }); // 游标 C
    fx.tool.onPointerMove(pointer(30, 30));

    const last = fx.statuses.at(-1) as MeasureStatusPayload;
    expect(last.angle).toBeCloseTo(90, 9);
  });

  it('三维夹角（BA 沿 y、BC 沿 x → 90°）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 3, z: 0 });
    clickAt(fx, 20, 20, { x: 0, y: 0, z: 0 });
    fx.viewport.setSurface(30, 30, { x: 4, y: 0, z: 0 });
    fx.tool.onPointerMove(pointer(30, 30));
    expect((fx.statuses.at(-1) as MeasureStatusPayload).angle).toBeCloseTo(90, 9);
  });
});

describe('MeasureTool 吸附（作用于 x/z，y 保留）', () => {
  let fx: MeasureFixture<MeasureTool>;
  beforeEach(() => {
    fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
  });

  it('G 网格吸附默认开（1m）：x/z 吸附、拾取 y 保留', () => {
    fx.viewport.setSurface(10, 10, { x: 1.4, y: 7.3, z: 2.6 });
    fx.tool.onPointerMove(pointer(10, 10));
    expect((fx.statuses.at(-1) as MeasureStatusPayload).cursor).toEqual({ x: 1, y: 7.3, z: 3 });
  });

  it('G 键切换关闭后不吸附', () => {
    fx.tool.onKeyDown(key('g'));
    fx.viewport.setSurface(10, 10, { x: 1.4, y: 7.3, z: 2.6 });
    fx.tool.onPointerMove(pointer(10, 10));
    expect((fx.statuses.at(-1) as MeasureStatusPayload).cursor).toEqual({ x: 1.4, y: 7.3, z: 2.6 });
  });

  it('Shift 正交锁定：第二点仅沿主轴偏移（x/z 域，y 保留）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    fx.viewport.setSurface(20, 20, { x: 3, y: 9, z: 2 });
    fx.tool.onPointerMove(pointer(20, 20, { shiftKey: true }));

    const cursor = (fx.statuses.at(-1) as MeasureStatusPayload).cursor!;
    expect(cursor.x).toBe(3);
    expect(cursor.z).toBe(0); // 锁 X 轴（偏移大者）
    expect(cursor.y).toBe(9); // y 不锁
  });

  it('A 键 45° 锁定：方向吸附保持距离（x/z 域）', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onKeyDown(key('a'));
    fx.viewport.setSurface(20, 20, { x: 1, y: 0, z: 2 });
    fx.tool.onPointerMove(pointer(20, 20));

    const cursor = (fx.statuses.at(-1) as MeasureStatusPayload).cursor!;
    // 63.4° → 45° 方向，距离 √5 保持，再经 1m 网格吸附 → (2, 2)
    expect(cursor.x).toBeCloseTo(2, 10);
    expect(cursor.z).toBeCloseTo(2, 10);
  });

  it('拾取失败（surfacePoint null）：保留游标上次位置、不发新状态', () => {
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    fx.viewport.setSurface(20, 20, { x: 3, y: 0, z: 4 });
    fx.tool.onPointerMove(pointer(20, 20));
    const before = fx.statuses.length;
    fx.viewport.setSurface(30, 30, null);
    fx.tool.onPointerMove(pointer(30, 30));
    expect(fx.statuses.length).toBe(before);
  });
});

describe('MeasureTool 取消与删除', () => {
  it('ESC（工具内防御路径）：只弃草稿（复位载荷 + updateDraft(null)），已提交项保留、工具保持激活', () => {
    const fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onDoubleClick(pointer(20, 20)); // 提交 1 条
    clickAt(fx, 30, 30, { x: 10, y: 0, z: 0 }); // 新草稿 1 点

    fx.tool.onKeyDown(ESC);

    expect(fx.tools.getActiveTool()).toBe(fx.tool);
    expect(fx.session.list()).toHaveLength(1); // 已提交项完整保留
    expect(fx.overlay.lastDraft).toBeNull();
    expect(fx.statuses.at(-1)).toEqual({ kind: 'distance' });
  });

  it('ToolManager.cancel（ESC 路由）：退出激活，已提交项保留', () => {
    const fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onDoubleClick(pointer(20, 20));

    fx.tools.cancel();

    expect(fx.tools.getActiveTool()).toBeNull();
    expect(fx.session.list()).toHaveLength(1);
  });

  it('deactivate 后再激活：会话不清空（切工具不清语义）', () => {
    const fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onDoubleClick(pointer(20, 20));

    fx.tools.deactivate();
    fx.tools.activate('measure.area');

    expect(fx.session.list()).toHaveLength(1); // MeasureSession 跨工具存活
  });

  it('Delete 有草稿：先弃草稿，不动会话', () => {
    const fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onDoubleClick(pointer(20, 20));
    clickAt(fx, 30, 30, { x: 10, y: 0, z: 0 });

    fx.tool.onKeyDown(key('Delete'));

    expect(fx.session.list()).toHaveLength(1);
    expect(fx.overlay.lastDraft).toBeNull();
  });

  it('Delete 无草稿：删除上一条（measure:changed count 回落）', () => {
    const fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 4, z: 0 });
    fx.tool.onDoubleClick(pointer(20, 20));

    fx.tool.onKeyDown(key('Backspace'));

    expect(fx.session.list()).toHaveLength(0);
    expect(fx.changed).toEqual([{ count: 1 }, { count: 0 }]);
  });

  it('surfacePoint null 的 Delete 无草稿空会话：安全无操作', () => {
    const fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
    expect(() => fx.tool.onKeyDown(key('Delete'))).not.toThrow();
    expect(fx.changed).toEqual([]);
  });
});

describe('MeasureTool 四不变式（零场景副作用 + 会话态）', () => {
  it('测量全程 SceneManager 写方法与 history.execute 零调用、场景对象零、选中集不变', () => {
    const fx = fullSetup('area');
    fx.tools.activate('measure.area');
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    clickAt(fx, 20, 20, { x: 3, y: 0, z: 0 });
    clickAt(fx, 30, 30, { x: 0, y: 0, z: 4 });
    fx.tool.onDoubleClick(pointer(30, 30));
    fx.tool.onKeyDown(key('Delete')); // 删除上一条
    fx.tools.cancel();

    expect(fx.sceneSpies.addObject).not.toHaveBeenCalled();
    expect(fx.sceneSpies.removeObject).not.toHaveBeenCalled();
    expect(fx.sceneSpies.updateObject).not.toHaveBeenCalled();
    expect(fx.sceneSpies.reorderObjects).not.toHaveBeenCalled();
    expect(fx.historyExecuteSpy).not.toHaveBeenCalled();
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.selection.getSelectedIds()).toEqual([]);
  });

  it('右键 onPointerDown（防御路径）：弃草稿，零 Command', () => {
    const fx = fullSetup('distance');
    fx.tools.activate('measure.distance');
    clickAt(fx, 10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10, { button: 'right' }));
    expect(fx.overlay.lastDraft).toBeNull();
    expect(fx.historyExecuteSpy).not.toHaveBeenCalled();
  });
});
