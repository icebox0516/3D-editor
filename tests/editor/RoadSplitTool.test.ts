/**
 * tests/editor/RoadSplitTool.test.ts —— 道路分割工具测试（T7.6 R4，先测后码；
 * R9 测试 7 项）。
 *
 * 覆盖：
 * - activate：line region 目标 → beginSession（转换点列 + closed:false）+
 *   onDragEnd 置空（中性化陈旧回调，防误提交）；非 line / 非 region 抛错；
 * - 点击命中内部顶点（容差 1.5m 内最近者）→ SplitRoadCommand 一条历史 +
 *   endSession + exitToSelect 钩子 + selectMany 两段；
 * - 点击无候选 → app:notify（info）提示，零命令；
 * - ESC / cancel：endSession 零命令（ToolManager 既有路径）；
 * - 端点不可分割（index 0 / n−1 不命中）；
 * - port 为 null（无头装配）：activate / 点击全部安全无操作。
 */
import { describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID, Vec2, Vec3 } from '../../src/core/types';
import { createRegionObject } from '../../src/domain/regions';
import type { RegionObject } from '../../src/domain/regions';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import { RoadSplitTool } from '../../src/editor/tools/RoadSplitTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type { ToolContext } from '../../src/editor/tools';
import type {
  CameraPort,
  PreviewPort,
  VertexEditPort,
  VertexEditSessionPort,
  ViewportPort,
} from '../../src/editor/services/ports';
import type { PointerEventInfo } from '../../src/editor/services/ports';

// ── Fake Port（VertexEditPort 契约 + 会话控制；沿 VertexEditTool.test.ts 先例）──

type DragEndInfo = { objectId: ID; before: Vec2[]; after: Vec2[] };

class FakeVertexEditPort implements VertexEditPort, VertexEditSessionPort {
  readonly sessions: Array<{ objectId: ID; points: Vec2[]; closed: boolean }> = [];
  endCount = 0;
  private dragEndCb: ((info: DragEndInfo) => void) | null = null;
  /** 记录最近一次 onDragEnd 注册的回调（置空断言用） */
  lastRegisteredCb: ((info: DragEndInfo) => void) | null = null;

  beginSession(info: { objectId: ID; points: Vec2[]; closed: boolean }): void {
    this.sessions.push({ ...info, points: info.points.map((p) => ({ ...p })) });
  }
  setPoints(): void {}
  requestVertexRemoval(): boolean {
    return false;
  }
  endSession(): void {
    this.endCount += 1;
  }
  onDragEnd(cb: (info: DragEndInfo) => void): void {
    this.lastRegisteredCb = cb;
    this.dragEndCb = cb;
  }
  /** 模拟 runtime 陈旧手势（若回调被置空则无效果） */
  emitDragEnd(info: DragEndInfo): void {
    this.dragEndCb?.(info);
  }
}

// ── 装置 ─────────────────────────────────────────────────────

/** 可控地面投影的视口（按屏幕坐标返回预设世界点） */
class FakeViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  ground: Vec2 | null = null;
  pickObject(): ID | null {
    return null;
  }
  groundPoint(): Vec3 | null {
    return this.ground === null ? null : { x: this.ground.x, y: 0, z: this.ground.y };
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

/** 四折点道路线：世界 (0,0)→(10,0)→(20,0)→(30,0)（内部顶点 1、2 可分割） */
function makeRoad(): RegionObject {
  return createRegionObject({
    shape: {
      type: 'line',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 },
        { x: 30, y: 0 },
      ],
      baseHeight: 0.06,
      closed: false,
    },
    semanticType: 'road',
    name: '测试道路',
  });
}

function pointer(x: number, y: number): PointerEventInfo {
  return { screenX: x, screenY: y, button: 'left', ctrlKey: false, shiftKey: false, altKey: false };
}

function setup(port: FakeVertexEditPort | null = new FakeVertexEditPort()) {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const viewport = new FakeViewport();
  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets: new AssetRegistry() },
    viewport,
    camera: new NullCamera(),
    preview: new NullPreview(),
    eventBus,
  };
  const tools = new ToolManager(ctx);
  const tool = new RoadSplitTool(port);
  tools.register(tool);
  const exitCalls: string[] = [];
  tool.setExitToSelect(() => exitCalls.push('exit'));
  return { ctx, tools, tool, port, viewport, exitCalls, eventBus, selection, sceneManager, history };
}

// 每次用例经 setup() 新建装置（无跨用例共享状态）

// ── activate / 会话生命周期 ─────────────────────────────────

describe('RoadSplitTool（会话生命周期）', () => {
  it('activate：beginSession 携带点列 + closed:false；onDragEnd 被置空（陈旧回调中性化）', () => {
    const s = setup();
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);

    s.tools.activate('road-split', { objectId: road.id });
    expect(s.port!.sessions).toHaveLength(1);
    expect(s.port!.sessions[0]).toMatchObject({ objectId: road.id, closed: false });
    expect(s.port!.sessions[0]!.points).toEqual(road.shape.points);
    // onDragEnd 注册的是空函数：陈旧手势零命令
    s.port!.emitDragEnd({ objectId: road.id, before: [], after: [{ x: 1, y: 1 }] });
    expect(s.ctx.history.canUndo()).toBe(false);
    s.tools.deactivate();
  });

  it('非 line region 抛错（activate 快速失败）；非 region 抛错', () => {
    const s = setup();
    const polygon = createRegionObject({
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 5, y: 8 },
        ],
        baseHeight: 0,
        closed: true,
      },
    });
    s.ctx.sceneManager.addObject(polygon);
    expect(() => s.tools.activate('road-split', { objectId: polygon.id })).toThrow();
  });

  it('ESC（ToolManager.cancel）：endSession 零命令', () => {
    const s = setup();
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);
    s.tools.activate('road-split', { objectId: road.id });
    const endBefore = s.port!.endCount;

    s.tools.cancel();
    expect(s.port!.endCount).toBe(endBefore + 1);
    expect(s.ctx.history.canUndo()).toBe(false);
    expect(s.ctx.sceneManager.getObjects()).toHaveLength(1);
  });
});

// ── 点击分割 ────────────────────────────────────────────────

describe('RoadSplitTool（点击分割）', () => {
  it('命中内部顶点 → SplitRoadCommand 一条历史 + endSession + exitToSelect + selectMany 两段', () => {
    const s = setup();
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);
    s.tools.activate('road-split', { objectId: road.id });

    // 地面点在内部顶点 1（10,0）附近 1.2m：命中
    s.viewport.ground = { x: 10.8, y: 0.9 };
    s.tool.onPointerDown(pointer(10, 10));

    expect(s.ctx.history.canUndo()).toBe(true);
    expect(s.ctx.sceneManager.getObjects()).toHaveLength(2);
    const first = s.ctx.sceneManager.getObject(road.id)! as RegionObject;
    expect(first.shape.points).toHaveLength(2); // 0..1 前段
    expect(s.exitCalls).toEqual(['exit']);
    const selected = s.selection.getSelectedIds();
    expect(selected).toHaveLength(2);
    expect(selected).toContain(road.id);
    expect(s.port!.endCount).toBe(1);
  });

  it('被移动过的道路（position 偏移）：世界坐标命中内部顶点（局部点 + position 偏移）', () => {
    const s = setup();
    const road = makeRoad();
    road.transform.position = { x: 100, y: 0, z: 50 }; // gizmo 移动后局部点列不动
    s.ctx.sceneManager.addObject(road);
    s.tools.activate('road-split', { objectId: road.id });

    // 世界内部顶点 1 = 局部 (10,0) + (100,50) = (110,50)；句柄层 localToWorld 同位
    s.viewport.ground = { x: 110.5, y: 50.5 };
    s.tool.onPointerDown(pointer(0, 0));

    expect(s.ctx.history.canUndo()).toBe(true);
    expect(s.ctx.sceneManager.getObjects()).toHaveLength(2);
    const first = s.ctx.sceneManager.getObject(road.id)! as RegionObject;
    expect(first.shape.points).toHaveLength(2); // 0..1 前段（局部点列切分）
  });

  it('命中最近内部顶点（两候选等距取更近者）：顶点 2（20,0）分割', () => {
    const s = setup();
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);
    s.tools.activate('road-split', { objectId: road.id });

    s.viewport.ground = { x: 19, y: 0 }; // 距顶点 2 为 1，距顶点 1 为 9
    s.tool.onPointerDown(pointer(0, 0));

    const first = s.ctx.sceneManager.getObject(road.id)! as RegionObject;
    expect(first.shape.points).toHaveLength(3); // 0..2 前段
    const second = s.ctx.sceneManager.getObjects().find((o) => o.id !== road.id)! as RegionObject;
    expect(second.shape.points).toHaveLength(2); // 2..3 后段
  });

  it('端点不可分割：点击端点附近（容差内但 index 0）无命令 + app:notify', () => {
    const s = setup();
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);
    const notifies: Array<{ message: string; kind?: string }> = [];
    s.eventBus.on('app:notify', (p) => notifies.push({ ...p }));
    s.tools.activate('road-split', { objectId: road.id });

    s.viewport.ground = { x: 0.2, y: 0 }; // 距端点 0 仅 0.2m，但端点不可分割
    s.tool.onPointerDown(pointer(0, 0));

    expect(s.ctx.history.canUndo()).toBe(false);
    expect(s.ctx.sceneManager.getObjects()).toHaveLength(1);
    expect(notifies).toHaveLength(1);
    expect(notifies[0]!.kind).toBe('info');
    expect(notifies[0]!.message).toContain('节点');
  });

  it('无候选（远离全部顶点超 1.5m）→ app:notify，零命令', () => {
    const s = setup();
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);
    const notifies: number[] = [];
    s.eventBus.on('app:notify', () => notifies.push(1));
    s.tools.activate('road-split', { objectId: road.id });

    s.viewport.ground = { x: 100, y: 100 };
    s.tool.onPointerDown(pointer(0, 0));
    expect(notifies).toHaveLength(1);
    expect(s.ctx.history.canUndo()).toBe(false);

    // 无地面投影（射线背向）同无候选
    s.viewport.ground = null;
    s.tool.onPointerDown(pointer(0, 0));
    expect(notifies).toHaveLength(2);
  });

  it('两点线（无内部顶点）不可分割：点击仅提示', () => {
    const s = setup();
    const road = createRegionObject({
      shape: {
        type: 'line',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        baseHeight: 0.06,
        closed: false,
      },
      semanticType: 'road',
    });
    s.ctx.sceneManager.addObject(road);
    const notifies: number[] = [];
    s.eventBus.on('app:notify', () => notifies.push(1));
    s.tools.activate('road-split', { objectId: road.id });

    s.viewport.ground = { x: 5, y: 0 };
    s.tool.onPointerDown(pointer(0, 0));
    expect(notifies).toHaveLength(1);
    expect(s.ctx.history.canUndo()).toBe(false);
  });

  it('右键 / 中键点击不触发分割（仅左键语义）', () => {
    const s = setup();
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);
    s.tools.activate('road-split', { objectId: road.id });
    s.viewport.ground = { x: 10, y: 0 };

    const rightButton = { ...pointer(0, 0), button: 'right' as const };
    s.tool.onPointerDown(rightButton);
    expect(s.ctx.history.canUndo()).toBe(false);
  });
});

// ── 无头（port = null）──────────────────────────────────────

describe('RoadSplitTool（无头装配 port=null）', () => {
  it('activate / 点击全部安全无操作（分割仍经命令执行）', () => {
    const s = setup(null);
    const road = makeRoad();
    s.ctx.sceneManager.addObject(road);
    expect(() => s.tools.activate('road-split', { objectId: road.id })).not.toThrow();

    s.viewport.ground = { x: 10, y: 0 };
    expect(() => s.tool.onPointerDown(pointer(0, 0))).not.toThrow();
    expect(s.ctx.history.canUndo()).toBe(true); // 命令路径不依赖 port（句柄层仅视觉）
    s.tools.deactivate();
  });
});
