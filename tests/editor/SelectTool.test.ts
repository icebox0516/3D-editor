/**
 * tests/editor/SelectTool.test.ts —— 选择工具测试。
 *
 * 覆盖（T1.6 验收标准）：
 * - 命中 → select（单选替换整个选择集，emit selection:changed）；
 * - shift 点击未选中对象 → add（追加多选）；
 * - shift 点击已选中对象 → remove（切换式多选）；
 * - 点空处 → clear；
 * - 非 left 按钮不产生任何选择变化（不调用拾取）；
 * - 工具停用后收到指针事件安全无操作（不抛错、不越权访问上下文）；
 * - 选择变更零 Command（不经历史，history.canUndo 恒 false）；
 * - cancel() 无临时状态可清理：选中集保留（供跨工具使用），零 Command。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { ID } from '../../src/core/types';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { SceneObject } from '../../src/scene/SceneObject';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { SelectTool } from '../../src/editor/tools/SelectTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type { CameraPort, PointerEventInfo, PreviewPort, ViewportPort } from '../../src/editor/services/ports';

/** 预置拾取结果的 Fake 视口：pickAt 按屏幕坐标映射命中 id，缺省返回 pickDefault */
class FakeViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  readonly pickCalls: Array<[number, number]> = [];
  private readonly pickAt = new Map<string, ID | null>();
  pickDefault: ID | null = null;

  setPick(x: number, y: number, id: ID | null): void {
    this.pickAt.set(`${x},${y}`, id);
  }

  pickObject(x: number, y: number): ID | null {
    this.pickCalls.push([x, y]);
    return this.pickAt.get(`${x},${y}`) ?? this.pickDefault;
  }

  groundPoint() {
    return null;
  }
}

class FakeCamera implements CameraPort {
  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return 'perspective';
  }
  setMode(): void {}
  setOrthoLock(): void {}
  focusObjects(): void {}
  focusAll(): void {}
}
class FakePreview implements PreviewPort {
  showGhost(): void {}
  updateGhost(): void {}
  hideGhost(): void {}
  updateDrawPreview(): void {}
  clear(): void {}
}

function makeObject(): SceneObject {
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
  };
}

function pointer(x: number, y: number, overrides: Partial<PointerEventInfo> = {}): PointerEventInfo {
  return { screenX: x, screenY: y, button: 'left', ctrlKey: false, shiftKey: false, altKey: false, ...overrides };
}

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const obj1 = makeObject();
  const obj2 = makeObject();
  sceneManager.addObject(obj1);
  sceneManager.addObject(obj2);

  const viewport = new FakeViewport();
  viewport.setPick(10, 10, obj1.id);
  viewport.setPick(20, 20, obj2.id);
  viewport.setPick(99, 99, null); // 空点

  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets: new AssetRegistry() },
    viewport,
    camera: new FakeCamera(),
    preview: new FakePreview(),
    eventBus,
  };
  const tools = new ToolManager(ctx);
  const tool = new SelectTool();
  tools.register(tool);

  return { eventBus, sceneManager, selection, history, obj1, obj2, viewport, ctx, tools, tool };
}

describe('SelectTool 选择逻辑', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    fx.tools.activate('select');
  });

  it('命中对象 → select：选中集替换为该对象，emit selection:changed 一次', () => {
    const changed = vi.fn();
    fx.eventBus.on('selection:changed', changed);

    fx.tool.onPointerDown(pointer(10, 10));

    expect(fx.selection.getSelectedIds()).toEqual([fx.obj1.id]);
    expect(fx.selection.isSelected(fx.obj1.id)).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({ selectedIds: [fx.obj1.id] });
  });

  it('点击另一对象 → 替换选择（单选语义）', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));

    expect(fx.selection.getSelectedIds()).toEqual([fx.obj2.id]);
  });

  it('shift 点击未选中对象 → add（多选追加）', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));

    expect(fx.selection.getSelectedIds()).toEqual([fx.obj1.id, fx.obj2.id]);
  });

  it('shift 点击已选中对象 → remove（切换式多选）', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));
    fx.tool.onPointerDown(pointer(10, 10, { shiftKey: true }));

    expect(fx.selection.getSelectedIds()).toEqual([fx.obj2.id]);
  });

  it('点空处 → clear：清空选中集', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));
    expect(fx.selection.getSelectedIds().length).toBe(2);

    fx.tool.onPointerDown(pointer(99, 99));

    expect(fx.selection.getSelectedIds()).toEqual([]);
  });

  it('shift 点击空处 → clear（空点优先于切换语义）', () => {
    fx.tool.onPointerDown(pointer(10, 10));

    fx.tool.onPointerDown(pointer(99, 99, { shiftKey: true }));

    expect(fx.selection.getSelectedIds()).toEqual([]);
  });

  it('非 left 按钮不产生选择变化（不调用拾取；T5.8 起输入层也不再转发右键/中键）', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    const before = fx.selection.getSelectedIds();

    fx.tool.onPointerDown(pointer(20, 20, { button: 'right' }));
    fx.tool.onPointerDown(pointer(20, 20, { button: 'middle' }));

    expect(fx.selection.getSelectedIds()).toEqual(before);
    expect(fx.viewport.pickCalls.length).toBe(1);
  });
});

describe('SelectTool 生命周期与边界', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('未激活时收到指针事件安全无操作（不抛错、无选择变化）', () => {
    expect(() => fx.tool.onPointerDown(pointer(10, 10))).not.toThrow();
    expect(fx.selection.getSelectedIds()).toEqual([]);
  });

  it('deactivate 后收到指针事件安全无操作', () => {
    fx.tools.activate('select');
    fx.tools.deactivate();

    expect(() => fx.tool.onPointerDown(pointer(10, 10))).not.toThrow();
    expect(fx.selection.getSelectedIds()).toEqual([]);
  });

  it('cancel() 保留选中集（跨工具状态）且零 Command', () => {
    fx.tools.activate('select');
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));

    fx.tool.cancel();

    expect(fx.selection.getSelectedIds()).toEqual([fx.obj1.id, fx.obj2.id]);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('选择变更全程零 Command：多次点击后历史恒空', () => {
    fx.tools.activate('select');
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));
    fx.tool.onPointerDown(pointer(99, 99));

    expect(fx.history.canUndo()).toBe(false);
    expect(fx.history.canRedo()).toBe(false);
  });
});
