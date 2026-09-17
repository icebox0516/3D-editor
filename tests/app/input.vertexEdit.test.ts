/**
 * tests/app/input.vertexEdit.test.ts —— 顶点编辑输入路由测试（阶段 6 T6.8，先测后码）。
 *
 * 覆盖：
 * - Delete/Backspace 路由：vertex-edit 工具激活时归工具（onKeyDown 收到，删除选中
 *   的常规路径不触发——对象不消失）；非 vertex-edit 时保持既有「删除选中对象」回归；
 * - G 键落点：vertex-edit 激活时落到工具 onKeyDown（会话吸附开关），不被全局表拦截。
 * 边界：node + FakeEventTarget（沿 input.shortcuts.test 先例）；Fake port 工具。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID } from '../../src/core/types';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import { VertexEditTool } from '../../src/editor/tools/VertexEditTool';
import type {
  CameraPort,
  PreviewPort,
  VertexEditPort,
  VertexEditSessionPort,
  ViewportPort,
} from '../../src/editor/services/ports';
import { InputController } from '../../src/app/input';

class FakeEventTarget {
  private readonly handlers = new Map<string, Set<(e: unknown) => void>>();
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
}

function keyEvent(e: Record<string, unknown>): Record<string, unknown> {
  return {
    key: '',
    code: '',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: vi.fn(),
    target: null,
    ...e,
  };
}

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

/** 记录 onKeyDown 的 VertexEditPort 桩 */
class RecordingVertexPort implements VertexEditPort, VertexEditSessionPort {
  beginSession(): void {}
  setPoints(): void {}
  requestVertexRemoval(): boolean {
    return true;
  }
  endSession(): void {}
  onDragEnd(): void {}
}

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
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
  const tools = new ToolManager(ctx);
  const snapSession = { enabled: true, angleLock: false };
  const vertexTool = new VertexEditTool(new RecordingVertexPort(), snapSession);
  const onKeyDownSpy = vi.spyOn(vertexTool, 'onKeyDown');
  tools.register(vertexTool);

  const keyboardTarget = new FakeEventTarget();
  const input = new InputController({
    viewportElement: new FakeEventTarget() as unknown as HTMLElement,
    keyboardTarget: keyboardTarget as unknown as Window,
    tools,
    history,
    sceneManager,
    selection,
    camera: new NullCamera(),
  });
  input.attach();

  const press = (e: Record<string, unknown>) => keyboardTarget.dispatch('keydown', keyEvent(e));
  return { eventBus, sceneManager, selection, history, tools, vertexTool, snapSession, onKeyDownSpy, press };
}

describe('InputController：顶点编辑 Delete 路由', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('vertex-edit 激活：Delete 归工具（onKeyDown 收到），对象不被整删', () => {
    const created = {
      id: 'region_keep',
      type: 'region',
      name: '保留',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      properties: {},
      shape: { type: 'polygon', points: [], baseHeight: 0, closed: true },
      semantic: { type: 'unclassified', properties: {} },
      style: { presetId: 'default_solid', overrides: {} },
    };
    fx.sceneManager.addObject(created);
    fx.selection.select(created.id);
    fx.tools.activate('vertex-edit', { objectId: created.id });
    fx.onKeyDownSpy.mockClear();

    fx.press({ key: 'Delete' });
    fx.press({ key: 'Backspace' });

    expect(fx.onKeyDownSpy).toHaveBeenCalledTimes(2);
    expect(fx.sceneManager.getObject(created.id)).toBeDefined(); // 对象未被删除
  });

  it('vertex-edit 激活：G 落到工具（会话吸附开关切换）', () => {
    const created = {
      id: 'region_g',
      type: 'region',
      name: 'G',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      properties: {},
      shape: { type: 'polygon', points: [], baseHeight: 0, closed: true },
      semantic: { type: 'unclassified', properties: {} },
      style: { presetId: 'default_solid', overrides: {} },
    };
    fx.sceneManager.addObject(created);
    fx.tools.activate('vertex-edit', { objectId: created.id });
    fx.onKeyDownSpy.mockClear();

    fx.press({ key: 'g' });
    expect(fx.onKeyDownSpy).toHaveBeenCalledTimes(1);
    expect(fx.snapSession.enabled).toBe(false);
  });

  it('非 vertex-edit（select 激活）：Delete 保持既有「删除选中」行为回归', () => {
    const created = {
      id: 'region_del',
      type: 'region',
      name: '删除',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      properties: {},
      shape: { type: 'polygon', points: [], baseHeight: 0, closed: true },
      semantic: { type: 'unclassified', properties: {} },
      style: { presetId: 'default_solid', overrides: {} },
    };
    fx.sceneManager.addObject(created);
    fx.selection.select(created.id);
    // 无激活工具（非 vertex-edit）：Delete 走常规「删除选中」路径

    fx.press({ key: 'Delete' });
    expect(fx.sceneManager.getObject(created.id)).toBeUndefined(); // 常规删除仍生效
  });
});
