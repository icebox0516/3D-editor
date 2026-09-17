/**
 * tests/editor/VertexEditTool.test.ts —— 顶点编辑编辑会话测试（阶段 6 T6.8，先测后码）。
 *
 * 覆盖（任务书验收 1/3/5 项的 editor 层语义）：
 * - activate：目标解析（params.objectId / 选中集兜底）→ beginSession 携带转换后点列
 *   （circle → polygon 自由点列、options 丢弃）；非 region 目标抛错（activate 快速失败）；
 * - onDragEnd（VertexEditPort 契约通道）→ ChangeShapeCommand 一条历史：
 *   · 拖动/插删的 after 点列落库，类型转 polygon（首次提交时随 after 落库）、
 *     baseHeight 取 live、semantic/style 全程不动（解耦断言）；
 *   · 零位移（before === after）不入历史；
 *   · objectId 不匹配（迟到回调）丢弃；
 * - 撤销粒度：两段拖动 → 两条历史；undo 逐步回到原始 circle（含 options 恢复）；
 * - 会话内场景同步：object:updated(shape)（提交/撤销）→ port.setPoints 重排点列；
 * - 对象消失（object:removed）→ 会话清理（endSession）；
 * - deactivate / cancel → endSession，零 Command；
 * - G 键切换会话吸附开关（共享 snap 会话对象）；
 * - port 为 null（无头装配）：activate/事件全部安全无操作；
 * - isEditing：目标判定（面板按钮 / 双击退出路由的数据源）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { ID, Vec2 } from '../../src/core/types';
import type { RegionObject } from '../../src/domain/regions';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { VertexEditTool } from '../../src/editor/tools/VertexEditTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type {
  CameraPort,
  PreviewPort,
  VertexEditPort,
  VertexEditSessionPort,
  ViewportPort,
} from '../../src/editor/services/ports';

// ── Fake Port（VertexEditPort 契约 + 会话控制）────────────────

type DragEndInfo = { objectId: ID; before: Vec2[]; after: Vec2[] };

class FakeVertexEditPort implements VertexEditPort, VertexEditSessionPort {
  readonly sessions: Array<{ objectId: ID; points: Vec2[]; closed: boolean }> = [];
  readonly pointPushes: Vec2[][] = [];
  readonly removalRequests: number[] = [];
  endCount = 0;
  private cb: ((info: DragEndInfo) => void) | null = null;

  beginSession(info: { objectId: ID; points: Vec2[]; closed: boolean }): void {
    this.sessions.push({ ...info, points: info.points.map((p) => ({ ...p })) });
  }
  setPoints(points: Vec2[]): void {
    this.pointPushes.push(points.map((p) => ({ ...p })));
  }
  requestVertexRemoval(): boolean {
    this.removalRequests.push(this.removalRequests.length);
    return true;
  }
  endSession(): void {
    this.endCount += 1;
  }
  onDragEnd(cb: (info: DragEndInfo) => void): void {
    this.cb = cb;
  }
  /** 模拟一次 runtime 顶点手势结束（拖动/插删共用通道） */
  emitDragEnd(info: DragEndInfo): void {
    this.cb?.(info);
  }
}

// ── 装置 ─────────────────────────────────────────────────────

class NullViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  pickObject(): ID | null {
    return null;
  }
  groundPoint() {
    return null;
  }
}
class NullCamera implements CameraPort {
  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return 'perspective';
  }
  setMode(): void {}
  setOrthoLock(): void {}
  focusObjects(): void {}
  focusAll(): void {}
}
class NullPreview implements PreviewPort {
  showGhost(): void {}
  updateGhost(): void {}
  hideGhost(): void {}
  updateDrawPreview(): void {}
  clear(): void {}
}

function makeRegion(overrides: Partial<RegionObject> = {}): RegionObject {
  return {
    id: createId('region'),
    type: 'region',
    name: '测试区域',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
    shape: {
      type: 'circle',
      points: [
        { x: 5, y: 0 },
        { x: 0, y: 5 },
        { x: -5, y: 0 },
        { x: 0, y: -5 },
      ],
      baseHeight: 0.18,
      closed: true,
      options: { radius: 5, segments: 4 },
    },
    semantic: { type: 'water', properties: { depth: 2 } },
    style: { presetId: 'water.flow', overrides: { color: '#3f7f9f' } },
    ...overrides,
  };
}

function setup(port: FakeVertexEditPort | null = new FakeVertexEditPort()) {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const region = makeRegion();
  sceneManager.addObject(region);

  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets: new AssetRegistry() },
    viewport: new NullViewport(),
    camera: new NullCamera(),
    preview: new NullPreview(),
    eventBus,
  };
  const snapSession = { enabled: true, angleLock: false };
  const tools = new ToolManager(ctx);
  const tool = new VertexEditTool(port, snapSession);
  tools.register(tool);
  return { eventBus, sceneManager, selection, history, region, ctx, tools, tool, port, snapSession };
}

const AFTER_DRAG: Vec2[] = [
  { x: 6, y: 0 },
  { x: 0, y: 5 },
  { x: -5, y: 0 },
  { x: 0, y: -5 },
];

describe('VertexEditTool 编辑会话（Fake port）', () => {
  let fx: ReturnType<typeof setup>;
  let port: FakeVertexEditPort;

  beforeEach(() => {
    port = new FakeVertexEditPort();
    fx = setup(port);
  });

  it('activate：beginSession 携带转换后点列（circle → polygon 点列、closed），选中集兜底', () => {
    fx.selection.select(fx.region.id);
    fx.tools.activate('vertex-edit');

    expect(port.sessions).toHaveLength(1);
    expect(port.sessions[0]!.objectId).toBe(fx.region.id);
    expect(port.sessions[0]!.closed).toBe(true);
    expect(port.sessions[0]!.points).toEqual(fx.region.shape.points);
  });

  it('activate 携带 objectId 参数：不经选中集直达目标', () => {
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    expect(port.sessions[0]!.objectId).toBe(fx.region.id);
  });

  it('目标非 RegionObject → activate 抛错快速失败', () => {
    expect(() => {
      fx.tools.activate('vertex-edit', { objectId: createId('element') });
    }).toThrow();
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('onDragEnd → 一条 ChangeShapeCommand：points=after、类型转 polygon、options 落库为无、样式与语义不动', () => {
    fx.selection.select(fx.region.id);
    fx.tools.activate('vertex-edit');
    port.emitDragEnd({ objectId: fx.region.id, before: fx.region.shape.points, after: AFTER_DRAG });

    const live = fx.sceneManager.getObject(fx.region.id) as RegionObject;
    expect(live.shape.type).toBe('polygon'); // 首次提交时随 after 落库为 polygon
    expect(live.shape.points).toEqual(AFTER_DRAG);
    expect(live.shape.options).toBeUndefined(); // 参数化 options 失效丢弃
    expect(live.shape.baseHeight).toBe(0.18); // 保留
    expect(live.semantic).toEqual({ type: 'water', properties: { depth: 2 } }); // 全程不动
    expect(live.style).toEqual({ presetId: 'water.flow', overrides: { color: '#3f7f9f' } });
    expect(fx.history.canUndo()).toBe(true);
  });

  it('零位移（before === after）不入历史', () => {
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    port.emitDragEnd({ objectId: fx.region.id, before: fx.region.shape.points, after: fx.region.shape.points });
    expect(fx.history.canUndo()).toBe(false);
  });

  it('objectId 不匹配（迟到/陈旧回调）丢弃：场景与历史不动', () => {
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    port.emitDragEnd({ objectId: createId('region'), before: fx.region.shape.points, after: AFTER_DRAG });
    expect(fx.history.canUndo()).toBe(false);
    expect((fx.sceneManager.getObject(fx.region.id) as RegionObject).shape.type).toBe('circle');
  });

  it('撤销粒度：两段拖动两条历史；undo 逐步回到原始 circle（含 options 恢复）', () => {
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    port.emitDragEnd({ objectId: fx.region.id, before: fx.region.shape.points, after: AFTER_DRAG });
    const SECOND: Vec2[] = AFTER_DRAG.map((p, i) => (i === 1 ? { x: 0, y: 8 } : p));
    port.emitDragEnd({ objectId: fx.region.id, before: AFTER_DRAG, after: SECOND });

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    for (let i = 0; i < depth; i++) fx.history.redo();
    expect(depth).toBe(2);

    fx.history.undo();
    expect((fx.sceneManager.getObject(fx.region.id) as RegionObject).shape.points).toEqual(AFTER_DRAG);
    fx.history.undo();
    const restored = (fx.sceneManager.getObject(fx.region.id) as RegionObject).shape;
    expect(restored.type).toBe('circle');
    expect(restored.options).toEqual({ radius: 5, segments: 4 }); // 原参数化形状完整回退
  });

  it('line 会话：after 保持 line 类型与 closed=false', () => {
    const line = makeRegion({
      id: 'region_line',
      shape: {
        type: 'line',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        baseHeight: 0.06,
        closed: false,
      },
      semantic: { type: 'road', properties: { width: 6 } },
    });
    fx.sceneManager.addObject(line);
    fx.tools.activate('vertex-edit', { objectId: line.id });
    expect(port.sessions[0]!.closed).toBe(false);

    port.emitDragEnd({
      objectId: line.id,
      before: line.shape.points,
      after: [
        { x: 0, y: 0 },
        { x: 12, y: 3 },
      ],
    });
    const live = fx.sceneManager.getObject(line.id) as RegionObject;
    expect(live.shape.type).toBe('line');
    expect(live.shape.closed).toBe(false);
    expect(live.shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 12, y: 3 },
    ]);
  });

  it('point 会话：单点拖动更新坐标', () => {
    const point = makeRegion({
      id: 'region_point',
      shape: { type: 'point', points: [{ x: 1, y: 2 }], baseHeight: 0, closed: false },
    });
    fx.sceneManager.addObject(point);
    fx.tools.activate('vertex-edit', { objectId: point.id });
    port.emitDragEnd({ objectId: point.id, before: [{ x: 1, y: 2 }], after: [{ x: 7, y: 9 }] });
    expect((fx.sceneManager.getObject(point.id) as RegionObject).shape.points).toEqual([{ x: 7, y: 9 }]);
  });

  it('会话内 object:updated(shape)（提交回环/撤销/重做）→ port.setPoints 重排', () => {
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    port.emitDragEnd({ objectId: fx.region.id, before: fx.region.shape.points, after: AFTER_DRAG });
    expect(port.pointPushes.length).toBeGreaterThanOrEqual(1);
    expect(port.pointPushes.at(-1)).toEqual(AFTER_DRAG);

    fx.history.undo();
    expect(port.pointPushes.at(-1)).toEqual(fx.region.shape.points); // 撤销 → 原点列重排
  });

  it('对象消失（object:removed）→ 会话自动退出清理（endSession）', () => {
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    fx.sceneManager.removeObject(fx.region.id);
    expect(port.endCount).toBe(1);
    expect(fx.tool.isEditing(fx.region.id)).toBe(false);
  });

  it('deactivate / cancel → endSession，零 Command', () => {
    fx.selection.select(fx.region.id);
    fx.tools.activate('vertex-edit');
    fx.tools.cancel();
    expect(port.endCount).toBe(1);
    expect(fx.history.canUndo()).toBe(false);

    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    fx.tools.deactivate();
    expect(port.endCount).toBe(2);
  });

  it('G 键切换会话吸附开关（共享 snap 会话对象）', () => {
    const snapSession = { enabled: true, angleLock: false };
    const tools = new ToolManager(fx.ctx);
    const tool = new VertexEditTool(new FakeVertexEditPort(), snapSession);
    tools.register(tool);
    tools.activate('vertex-edit', { objectId: fx.region.id });

    tool.onKeyDown({ key: 'g', ctrlKey: false, shiftKey: false, altKey: false });
    expect(snapSession.enabled).toBe(false);
    tool.onKeyDown({ key: 'g', ctrlKey: false, shiftKey: false, altKey: false });
    expect(snapSession.enabled).toBe(true);
  });

  it('A 键切换 45° 角度锁定会话开关（T8.1；activate 复位为关）', () => {
    const snapSession = { enabled: true, angleLock: true }; // 预置脏值验证 activate 复位
    const tools = new ToolManager(fx.ctx);
    const tool = new VertexEditTool(new FakeVertexEditPort(), snapSession);
    tools.register(tool);
    tools.activate('vertex-edit', { objectId: fx.region.id });
    expect(snapSession.angleLock).toBe(false); // 会话开始复位

    tool.onKeyDown({ key: 'a', ctrlKey: false, shiftKey: false, altKey: false });
    expect(snapSession.angleLock).toBe(true);
    tool.onKeyDown({ key: 'a', ctrlKey: false, shiftKey: false, altKey: false });
    expect(snapSession.angleLock).toBe(false);

    // Ctrl/Alt 组合键不触发（归浏览器/应用级，与 G 键同守护）
    tool.onKeyDown({ key: 'a', ctrlKey: true, shiftKey: false, altKey: false });
    expect(snapSession.angleLock).toBe(false);
  });

  it('Delete/Backspace → port.requestVertexRemoval（删除悬停顶点转发）', () => {
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    fx.tool.onKeyDown({ key: 'Delete', ctrlKey: false, shiftKey: false, altKey: false });
    fx.tool.onKeyDown({ key: 'Backspace', ctrlKey: false, shiftKey: false, altKey: false });
    expect(port.removalRequests.length).toBe(2);
  });

  it('isEditing：仅会话目标为 true；退出后为 false', () => {
    expect(fx.tool.isEditing(fx.region.id)).toBe(false);
    fx.tools.activate('vertex-edit', { objectId: fx.region.id });
    expect(fx.tool.isEditing(fx.region.id)).toBe(true);
    fx.tools.deactivate();
    expect(fx.tool.isEditing(fx.region.id)).toBe(false);
  });
});

describe('VertexEditTool 无 port 桩（无头装配）', () => {
  it('port=null：activate/deactivate/事件全部安全无操作', () => {
    const fx = setup(null);
    expect(() => {
      fx.selection.select(fx.region.id);
      fx.tools.activate('vertex-edit');
      fx.tool.onKeyDown({ key: 'Delete', ctrlKey: false, shiftKey: false, altKey: false });
      fx.tool.cancel();
      fx.tools.deactivate();
    }).not.toThrow();
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.tools.getActiveTool()).toBeNull();
  });
});
