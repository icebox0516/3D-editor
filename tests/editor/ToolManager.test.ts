/**
 * tests/editor/ToolManager.test.ts —— 工具管理器互斥与生命周期测试。
 *
 * 覆盖（T1.6 验收标准）：
 * - register 后 activate：激活正确工具、透传 ToolContext 与 params、emit tool:changed{toolId}；
 * - activate 未注册工具抛错（activeTool 保持不变、不 emit）；
 * - 重复 register 同 id 抛错；
 * - 切换工具自动 deactivate 上一个，同一时刻仅一个激活（tool:changed 按序 A→B）；
 * - deactivate()：activeTool=null、emit tool:changed{toolId:null}；无激活时无事件；
 * - cancel()：调用工具 cancel（清理临时状态）并自动退出（activeTool=null），全程零 Command；
 * - 重复激活同一工具：先 deactivate 再重新 activate（参数可更新）；
 * - 工具 activate 抛错：activeTool 复位 null、emit tool:changed{null}、错误上抛。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID } from '../../src/core/types';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import type { Tool } from '../../src/editor/tools/Tool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type { CameraPort, PointerEventInfo, PreviewPort, ViewportPort } from '../../src/editor/services/ports';

/** 最小桩工具：记录生命周期调用 */
class StubTool implements Tool {
  readonly id: string;
  readonly name: string;
  activateCount = 0;
  deactivateCount = 0;
  cancelCount = 0;
  lastCtx: ToolContext | null = null;
  lastParams: unknown = undefined;
  failOnActivate = false;

  constructor(id: string, name = id) {
    this.id = id;
    this.name = name;
  }

  activate(ctx: ToolContext, params?: unknown): void {
    this.activateCount += 1;
    this.lastCtx = ctx;
    this.lastParams = params;
    if (this.failOnActivate) throw new Error('activate 失败（测试注入）');
  }
  deactivate(): void {
    this.deactivateCount += 1;
  }
  onPointerDown(_e: PointerEventInfo): void {}
  onPointerMove(_e: PointerEventInfo): void {}
  onPointerUp(_e: PointerEventInfo): void {}
  cancel(): void {
    this.cancelCount += 1;
  }
}

/** 零渲染 Fake Ports（视口/相机/预览各留空实现） */
class FakeViewport implements ViewportPort {

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
    viewport: new FakeViewport(),
    camera: new FakeCamera(),
    preview: new FakePreview(),
    eventBus,
  };
  const tools = new ToolManager(ctx);
  return { eventBus, sceneManager, selection, history, ctx, tools };
}

describe('ToolManager 注册与激活', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('activate 激活已注册工具：activeTool 正确、ctx 与 params 透传、emit tool:changed{toolId}', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    const tool = new StubTool('stub');
    fx.tools.register(tool);
    const params = { assetId: 'asset_x' };
    fx.tools.activate('stub', params);

    expect(fx.tools.getActiveTool()).toBe(tool);
    expect(tool.activateCount).toBe(1);
    expect(tool.lastCtx).toBe(fx.ctx);
    expect(tool.lastParams).toBe(params);
    expect(toolChanged).toHaveBeenCalledTimes(1);
    expect(toolChanged).toHaveBeenCalledWith({ toolId: 'stub' });
  });

  it('activate 未注册工具：抛错且 activeTool 不变、不 emit', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    const tool = new StubTool('stub');
    fx.tools.register(tool);
    fx.tools.activate('stub');

    expect(() => fx.tools.activate('ghost')).toThrow(/未注册/);
    expect(fx.tools.getActiveTool()).toBe(tool);
    expect(toolChanged).toHaveBeenCalledTimes(1);
  });

  it('重复 register 同 id 抛错', () => {
    fx.tools.register(new StubTool('stub'));
    expect(() => fx.tools.register(new StubTool('stub'))).toThrow(/重复注册/);
  });

  it('重复激活同一工具：先 deactivate 上一次再重新 activate（可携带新参数）', () => {
    const tool = new StubTool('stub');
    fx.tools.register(tool);
    fx.tools.activate('stub', { round: 1 });
    fx.tools.activate('stub', { round: 2 });

    expect(fx.tools.getActiveTool()).toBe(tool);
    expect(tool.deactivateCount).toBe(1);
    expect(tool.activateCount).toBe(2);
    expect(tool.lastParams).toEqual({ round: 2 });
  });
});

describe('ToolManager 互斥与切换', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('切换工具自动 deactivate 上一个，同一时刻仅一个激活', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    const a = new StubTool('a');
    const b = new StubTool('b');
    fx.tools.register(a);
    fx.tools.register(b);

    fx.tools.activate('a');
    fx.tools.activate('b');

    expect(fx.tools.getActiveTool()).toBe(b);
    expect(a.deactivateCount).toBe(1);
    expect(b.deactivateCount).toBe(0);
    expect(toolChanged).toHaveBeenCalledTimes(2);
    expect(toolChanged).toHaveBeenNthCalledWith(1, { toolId: 'a' });
    expect(toolChanged).toHaveBeenNthCalledWith(2, { toolId: 'b' });
  });

  it('deactivate()：activeTool=null、调用工具 deactivate、emit tool:changed{toolId:null}', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    const tool = new StubTool('stub');
    fx.tools.register(tool);
    fx.tools.activate('stub');
    toolChanged.mockClear();

    fx.tools.deactivate();

    expect(fx.tools.getActiveTool()).toBeNull();
    expect(tool.deactivateCount).toBe(1);
    expect(toolChanged).toHaveBeenCalledTimes(1);
    expect(toolChanged).toHaveBeenCalledWith({ toolId: null });
  });

  it('无激活工具时 deactivate() 为无操作（不发事件、不抛错）', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    expect(() => fx.tools.deactivate()).not.toThrow();
    expect(toolChanged).not.toHaveBeenCalled();
  });
});

describe('ToolManager.cancel', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('cancel()：调用工具 cancel 清理临时状态并自动退出（activeTool=null、emit null）', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    const tool = new StubTool('stub');
    fx.tools.register(tool);
    fx.tools.activate('stub');
    toolChanged.mockClear();

    fx.tools.cancel();

    expect(tool.cancelCount).toBe(1);
    expect(fx.tools.getActiveTool()).toBeNull();
    expect(toolChanged).toHaveBeenCalledTimes(1);
    expect(toolChanged).toHaveBeenCalledWith({ toolId: null });
  });

  it('cancel() 零 Command：历史栈全程为空（canUndo=false）', () => {
    const tool = new StubTool('stub');
    fx.tools.register(tool);
    fx.tools.activate('stub');

    fx.tools.cancel();
    fx.tools.cancel(); // 幂等：无激活工具时不再产生任何副作用

    expect(fx.history.canUndo()).toBe(false);
    expect(fx.history.canRedo()).toBe(false);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('无激活工具时 cancel() 为无操作（不抛错、不发事件）', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    expect(() => fx.tools.cancel()).not.toThrow();
    expect(toolChanged).not.toHaveBeenCalled();
  });
});

describe('ToolManager 异常防护', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('工具 activate 抛错：activeTool 复位 null、emit tool:changed{null}、错误上抛', () => {
    const toolChanged = vi.fn();
    fx.eventBus.on('tool:changed', toolChanged);

    const bad = new StubTool('bad');
    bad.failOnActivate = true;
    fx.tools.register(bad);

    expect(() => fx.tools.activate('bad')).toThrow('activate 失败（测试注入）');
    expect(fx.tools.getActiveTool()).toBeNull();
    expect(toolChanged).toHaveBeenCalledWith({ toolId: null });
  });

  it('activate 失败后仍可正常激活其他工具', () => {
    const bad = new StubTool('bad');
    bad.failOnActivate = true;
    const good = new StubTool('good');
    fx.tools.register(bad);
    fx.tools.register(good);

    expect(() => fx.tools.activate('bad')).toThrow();
    fx.tools.activate('good');

    expect(fx.tools.getActiveTool()).toBe(good);
  });
});
