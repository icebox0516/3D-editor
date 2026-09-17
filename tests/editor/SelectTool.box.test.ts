/**
 * tests/editor/SelectTool.box.test.ts —— 选择工具框选增强测试（T2.4，先测后码）。
 *
 * 覆盖（任务书验收标准 + 需求 §选择）：
 * - 空白处按下并拖拽超过阈值 → 框选：rect 拾取返回的 id 全部选中，selection:changed 恰一次；
 * - 拖拽期间经 PreviewPort.updateDrawPreview 绘制矩形预览（地面投影四角闭合多边形），
 *   结束后清除预览；
 * - 未超过阈值的空白点击仍是清空选中（原点击语义不回归）；
 * - Ctrl/Shift + 框选 → 追加（与既有选中集取并集，仍只发一次 selection:changed）；
 * - Ctrl + 点击 → 切换式多选（与 Shift 同义）；
 * - 锁定对象（对象 locked 或所属图层 locked）：点击视同空点；框选结果中被过滤；
 * - 框选过程中历史恒空（选择不是可见修改，零 Command）；
 * - 未注入框选端口（rectPick=null）：拖拽退化为清空，不抛错。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { ID } from '../../src/core/types';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { Layer } from '../../src/scene/Layer';
import type { SceneObject } from '../../src/scene/SceneObject';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { SelectTool } from '../../src/editor/tools/SelectTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type {
  CameraPort,
  DrawPreviewState,
  PointerEventInfo,
  PreviewPort,
  RectPickPort,
  ViewportPort,
} from '../../src/editor/services/ports';

/** 指针构造 */
function pointer(x: number, y: number, overrides: Partial<PointerEventInfo> = {}): PointerEventInfo {
  return { screenX: x, screenY: y, button: 'left', ctrlKey: false, shiftKey: false, altKey: false, ...overrides };
}

/** Fake 视口：点击拾取可设值（缺省空 → 框选起点为空白），矩形拾取返回预设集合 */
class FakeRectViewport implements ViewportPort, RectPickPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  readonly rectCalls: Array<[number, number, number, number]> = [];
  rectResult: ID[] = [];
  pickDefault: ID | null = null;

  pickObject(): ID | null {
    return this.pickDefault;
  }
  groundPoint(x: number, y: number) {
    // 框选预览角点投影：确定的地面点（x, 0, z）
    return { x, y: 0, z: y };
  }
  pickInRect(x0: number, y0: number, x1: number, y1: number): ID[] {
    this.rectCalls.push([x0, y0, x1, y1]);
    return [...this.rectResult];
  }
}

/** 记录绘制预览调用的 Fake PreviewPort */
class RecordingPreview implements PreviewPort {
  readonly drawStates: DrawPreviewState[] = [];
  showGhost(): void {}
  updateGhost(): void {}
  hideGhost(): void {}
  updateDrawPreview(state: DrawPreviewState): void {
    this.drawStates.push(state);
  }
  clear(): void {}
  /** 末次预览是否为清除态（空点集） */
  get cleared(): boolean {
    const last = this.drawStates[this.drawStates.length - 1];
    return last !== undefined && last.points.length === 0;
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

function makeObject(overrides: Partial<SceneObject> = {}): SceneObject {
  return {
    id: createId('element'),
    type: 'building',
    name: '对象',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    ...overrides,
  };
}

function makeLayer(overrides: Partial<Layer> = {}): Layer {
  return {
    id: createId('layer'),
    name: '图层',
    visible: true,
    locked: false,
    opacity: 1,
    order: 0,
    objectIds: [],
    ...overrides,
  };
}

function assemble(rectPick: RectPickPort | null, viewport: ViewportPort, preview: PreviewPort) {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });

  const obj1 = makeObject();
  const obj2 = makeObject();
  const lockedObj = makeObject({ locked: true });
  sceneManager.addObject(obj1);
  sceneManager.addObject(obj2);
  sceneManager.addObject(lockedObj);

  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets: new AssetRegistry() },
    viewport,
    camera: new NullCamera(),
    preview,
    eventBus,
  };
  const tools = new ToolManager(ctx);
  const tool = new SelectTool(rectPick);
  tools.register(tool);
  tools.activate('select');

  return { eventBus, sceneManager, selection, history, obj1, obj2, lockedObj, ctx, tools, tool };
}

function setup(withRectPick = true) {
  const viewport = new FakeRectViewport();
  const preview = new RecordingPreview();
  const fx = assemble(withRectPick ? viewport : null, viewport, preview);
  return { ...fx, viewport, preview };
}

/** 从 (x0,y0) 拖拽到 (x1,y1) 完成一次框选手势（含一次未过阈值的中间帧） */
function dragMarquee(
  tool: SelectTool,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  mods: Partial<PointerEventInfo> = {},
): void {
  tool.onPointerDown(pointer(x0, y0, mods));
  tool.onPointerMove(pointer(x0 + 1, y0 + 1, mods)); // 未过阈值
  tool.onPointerMove(pointer((x0 + x1) / 2, (y0 + y1) / 2, mods));
  tool.onPointerMove(pointer(x1, y1, mods));
  tool.onPointerUp(pointer(x1, y1, mods));
}

describe('SelectTool 框选（空白拖拽）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('框选：矩形内两个 id → 全部选中，selection:changed 恰一次', () => {
    fx.viewport.rectResult = [fx.obj1.id, fx.obj2.id];
    const changed = vi.fn();
    fx.eventBus.on('selection:changed', changed);

    dragMarquee(fx.tool, 10, 10, 200, 160);

    expect(fx.selection.getSelectedIds()).toEqual([fx.obj1.id, fx.obj2.id]);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({ selectedIds: [fx.obj1.id, fx.obj2.id] });
  });

  it('矩形按起终点调用拾取端口（反向拖拽同样一次）', () => {
    fx.viewport.rectResult = [];
    dragMarquee(fx.tool, 200, 160, 10, 10);
    expect(fx.viewport.rectCalls.length).toBe(1);
  });

  it('拖拽期间经 PreviewPort 绘制矩形预览，结束后清除', () => {
    fx.viewport.rectResult = [fx.obj1.id];
    dragMarquee(fx.tool, 10, 10, 100, 80);

    // 过程帧：闭合四角多边形；结束帧：清除
    expect(fx.preview.drawStates.length).toBeGreaterThanOrEqual(2);
    const during = fx.preview.drawStates[0];
    expect(during.geometryType).toBe('Polygon');
    expect(during.closed).toBe(true);
    expect(during.points).toHaveLength(4);
    expect(fx.preview.cleared).toBe(true);
  });

  it('拖拽中历史恒空（选择零 Command）', () => {
    fx.viewport.rectResult = [fx.obj1.id];
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerMove(pointer(60, 40));
    expect(fx.history.canUndo()).toBe(false);
    fx.tool.onPointerUp(pointer(60, 40));
    expect(fx.history.canUndo()).toBe(false);
  });

  it('阈值内空白点击仍是清空选中（点击语义不回归）', () => {
    fx.selection.selectMany([fx.obj1.id, fx.obj2.id]);
    fx.tool.onPointerDown(pointer(50, 50));
    fx.tool.onPointerMove(pointer(51, 51)); // 位移 1px：未过阈值
    fx.tool.onPointerUp(pointer(51, 51));

    expect(fx.selection.getSelectedIds()).toEqual([]);
    expect(fx.viewport.rectCalls.length).toBe(0);
  });

  it('Ctrl + 框选 → 与既有选中集取并集（按下清空一次 + 完成选择一次）', () => {
    fx.selection.select(fx.obj1.id);
    fx.viewport.rectResult = [fx.obj2.id, fx.lockedObj.id];
    const changed = vi.fn();
    fx.eventBus.on('selection:changed', changed);

    dragMarquee(fx.tool, 10, 10, 100, 80, { ctrlKey: true });

    expect(fx.selection.getSelectedIds()).toEqual([fx.obj1.id, fx.obj2.id]); // 锁定对象被过滤
    expect(changed).toHaveBeenCalledTimes(2); // 按下清空（原点击语义）+ 框选完成
  });

  it('Shift + 框选同样追加', () => {
    fx.selection.select(fx.obj2.id);
    fx.viewport.rectResult = [fx.obj1.id];
    dragMarquee(fx.tool, 10, 10, 100, 80, { shiftKey: true });
    expect(fx.selection.getSelectedIds()).toEqual([fx.obj2.id, fx.obj1.id]);
  });

  it('锁定对象在框选结果中被过滤', () => {
    fx.viewport.rectResult = [fx.obj1.id, fx.lockedObj.id, fx.obj2.id];
    dragMarquee(fx.tool, 10, 10, 100, 80);
    expect(fx.selection.getSelectedIds()).toEqual([fx.obj1.id, fx.obj2.id]);
  });

  it('点击锁定对象 → 视同空点：清空选中、不进入多选', () => {
    fx.selection.select(fx.obj2.id);
    fx.viewport.pickDefault = fx.lockedObj.id;
    fx.tool.onPointerDown(pointer(30, 30));
    fx.tool.onPointerUp(pointer(30, 30));
    expect(fx.selection.getSelectedIds()).toEqual([]);
  });

  it('Ctrl + 点击 → 切换式多选（追加未选）', () => {
    fx.viewport.pickDefault = fx.obj1.id;
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.pickDefault = fx.obj2.id;
    fx.tool.onPointerDown(pointer(20, 20, { ctrlKey: true }));
    expect(fx.selection.getSelectedIds()).toEqual([fx.obj1.id, fx.obj2.id]);
  });

  it('Ctrl + 点击已选对象 → 移除（切换语义）', () => {
    fx.viewport.pickDefault = fx.obj1.id;
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10, { ctrlKey: true }));
    expect(fx.selection.getSelectedIds()).toEqual([]);
  });

  it('未注入框选端口：拖拽退化为清空，不抛错、不画预览', () => {
    const bare = setup(false);
    bare.selection.select(bare.obj1.id);

    expect(() => dragMarquee(bare.tool, 10, 10, 100, 80)).not.toThrow();
    expect(bare.selection.getSelectedIds()).toEqual([]);
    expect(bare.preview.drawStates.length).toBe(0);
  });
});

describe('SelectTool 图层锁定', () => {
  it('框选命中锁定图层成员被过滤', () => {
    const viewport = new FakeRectViewport();
    const preview = new RecordingPreview();
    const fx = assemble(viewport, viewport, preview);
    const lockedLayer = makeLayer({ locked: true });
    fx.sceneManager.addLayer(lockedLayer);
    fx.sceneManager.updateObject(fx.obj1.id, { layerId: lockedLayer.id });

    viewport.rectResult = [fx.obj1.id, fx.obj2.id];
    dragMarquee(fx.tool, 10, 10, 100, 80);
    expect(fx.selection.getSelectedIds()).toEqual([fx.obj2.id]);
  });

  it('点击锁定图层成员 → 视同空点', () => {
    const viewport = new FakeRectViewport();
    const preview = new RecordingPreview();
    const fx = assemble(viewport, viewport, preview);
    const lockedLayer = makeLayer({ locked: true });
    fx.sceneManager.addLayer(lockedLayer);
    fx.sceneManager.updateObject(fx.obj1.id, { layerId: lockedLayer.id });
    fx.selection.select(fx.obj2.id);

    viewport.pickDefault = fx.obj1.id;
    fx.tool.onPointerDown(pointer(30, 30));
    fx.tool.onPointerUp(pointer(30, 30));
    expect(fx.selection.getSelectedIds()).toEqual([]);
  });
});
