/**
 * tests/editor/TransformTool.test.ts —— 变换工具命令化测试（T2.4，先测后码）。
 *
 * 覆盖（任务书验收标准）：
 * - Fake gizmo 下：拖拽结束（onDragEnd 回调）生成一条 TransformCommand 入历史；
 *   undo 后对象 transform 回 before；redo 回 after（T7.5 起 onDragEnd 经微任务冲刷
 *   聚合——单对象手势冲刷后仍是一条 TransformCommand；测试 await flush 模拟手势
 *   边界，多对象聚合见 TransformTool.batch.test.ts）；
 * - 拖拽过程中（未触发 onDragEnd）历史栈长度不变（预览隔离：中间帧不经命令）；
 * - activate：setMode(参数) + attach(当前选中集)；W/E/R 三模式参数路由；
 * - deactivate / cancel：gizmo detach；
 * - 工具激活期间 selection:changed → gizmo 重新 attach 新选中集（场景树 ↔ gizmo 同步）；
 * - onDragEnd 携带不存在对象 → 命令执行失败不入历史，不抛错；
 * - gizmo 为 null（无头装配）：activate/deactivate/事件均安全无操作；
 * - 代理重同步（T8.6 缺陷①）：激活期间 scene:changed → gizmo.resync（undo/redo 漂移
 *   修复；不重挂、拖拽会话中按 port 契约无操作、deactivate 解除订阅）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { ID, Transform } from '../../src/core/types';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { SceneObject } from '../../src/scene/SceneObject';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { TransformTool } from '../../src/editor/tools/TransformTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type { CameraPort, GizmoPort, PreviewPort, ViewportPort } from '../../src/editor/services/ports';

/**
 * Fake gizmo：记录调用并允许测试手动发起一次拖拽结束。
 * resync 按 GizmoPort 契约建模（T8.6 缺陷①）：拖拽会话中（dragging 态）无操作——
 * 真实现的守卫在 GizmoImpl 内部读 TransformControls dragging 态，浏览器验收覆盖。
 */
class FakeGizmo implements GizmoPort {
  readonly attached: ID[][] = [];
  readonly modes: string[] = [];
  detachCount = 0;
  resyncCount = 0;
  resyncSuppressed = 0;
  /** 模拟 TransformControls dragging 态（测试置位） */
  dragging = false;
  private cb: ((info: { objectId: ID; before: Transform; after: Transform }) => void) | null = null;

  attach(ids: ID[]): void {
    this.attached.push([...ids]);
  }
  detach(): void {
    this.detachCount += 1;
  }
  setMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.modes.push(mode);
  }
  resync(): void {
    if (this.dragging) {
      this.resyncSuppressed += 1;
      return;
    }
    this.resyncCount += 1;
  }
  onDragEnd(cb: (info: { objectId: ID; before: Transform; after: Transform }) => void): void {
    this.cb = cb;
  }
  /** 模拟一次拖拽结束回调 */
  emitDragEnd(info: { objectId: ID; before: Transform; after: Transform }): void {
    this.cb?.(info);
  }
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

function makeObject(name = '对象'): SceneObject {
  return {
    id: createId('element'),
    type: 'building',
    name,
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}

const AFTER: Transform = {
  position: { x: 10, y: 2, z: 30 },
  rotation: { x: 0, y: Math.PI / 4, z: 0 },
  scale: { x: 2, y: 2, z: 2 },
};

function setup(gizmo: GizmoPort | null = new FakeGizmo()) {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const obj = makeObject();
  sceneManager.addObject(obj);

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
  const tool = new TransformTool(gizmo);
  tools.register(tool);

  return { eventBus, sceneManager, selection, history, obj, ctx, tools, tool, gizmo };
}

describe('TransformTool 命令化（Fake gizmo）', () => {
  let fx: ReturnType<typeof setup>;
  let gizmo: FakeGizmo;

  beforeEach(() => {
    gizmo = new FakeGizmo();
    fx = setup(gizmo);
  });

  it('activate：setMode(缺省 translate) + attach(当前选中集)', () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');

    expect(gizmo.modes).toEqual(['translate']);
    expect(gizmo.attached).toEqual([[fx.obj.id]]);
  });

  it('activate 携带模式参数：rotate / scale 透传 setMode', () => {
    fx.tools.activate('transform', { mode: 'rotate' });
    expect(gizmo.modes).toEqual(['rotate']);
    fx.tools.activate('transform', { mode: 'scale' });
    expect(gizmo.modes).toEqual(['rotate', 'scale']);
  });

  it('拖拽结束 → 一条 TransformCommand 入历史；undo 回 before、redo 回 after', async () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');

    const before = { ...fx.obj.transform };
    gizmo.emitDragEnd({ objectId: fx.obj.id, before, after: AFTER });
    await Promise.resolve(); // 手势冲刷（微任务）

    // 一条历史
    let depth = 0;
    while (fx.history.undo()) depth += 1;
    for (let i = 0; i < depth; i++) fx.history.redo();
    expect(depth).toBe(1);

    // 生效为 after
    expect(fx.sceneManager.getObject(fx.obj.id)?.transform).toEqual(AFTER);

    // undo 回 before
    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObject(fx.obj.id)?.transform).toEqual(before);

    // redo 回 after
    expect(fx.history.redo()).toBe(true);
    expect(fx.sceneManager.getObject(fx.obj.id)?.transform).toEqual(AFTER);
  });

  it('拖拽过程中（未 onDragEnd）历史栈长度不变', () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');

    // 模拟拖拽中间帧：工具不产生任何命令
    fx.tool.onPointerMove({ screenX: 10, screenY: 10, button: 'left', ctrlKey: false, shiftKey: false, altKey: false });
    fx.tool.onPointerUp({ screenX: 12, screenY: 12, button: 'left', ctrlKey: false, shiftKey: false, altKey: false });

    expect(fx.history.canUndo()).toBe(false);
    // 场景数据未被中间帧污染
    expect(fx.sceneManager.getObject(fx.obj.id)?.transform).toEqual({
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
  });

  it('连续两次拖拽结束 → 两条历史，逐次撤销', async () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    const before = { ...fx.obj.transform };
    gizmo.emitDragEnd({ objectId: fx.obj.id, before, after: AFTER });
    await Promise.resolve(); // 手势边界（事件循环轮转）
    gizmo.emitDragEnd({ objectId: fx.obj.id, before: AFTER, after: before });
    await Promise.resolve();

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    for (let i = 0; i < depth; i++) fx.history.redo();
    expect(depth).toBe(2);
    expect(fx.sceneManager.getObject(fx.obj.id)?.transform).toEqual(before);
  });

  it('onDragEnd 指向不存在对象 → 命令失败不入历史、不抛错', async () => {
    fx.tools.activate('transform');
    const ghost = createId('element');
    expect(() =>
      gizmo.emitDragEnd({
        objectId: ghost,
        before: { ...fx.obj.transform },
        after: AFTER,
      }),
    ).not.toThrow();
    await Promise.resolve(); // 冲刷后仍不入历史
    expect(fx.history.canUndo()).toBe(false);
  });

  it('deactivate → gizmo detach 且拖拽回调不再产生命令', async () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    const detachBefore = gizmo.detachCount;
    fx.tools.deactivate();
    expect(gizmo.detachCount).toBe(detachBefore + 1);

    expect(() =>
      gizmo.emitDragEnd({ objectId: fx.obj.id, before: { ...fx.obj.transform }, after: AFTER }),
    ).not.toThrow();
    await Promise.resolve(); // 停用后冲刷丢弃
    expect(fx.history.canUndo()).toBe(false);
  });

  it('cancel → gizmo detach（拖拽中退出手势零 Command）', () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    const detachBefore = gizmo.detachCount;
    fx.tools.cancel();
    expect(gizmo.detachCount).toBeGreaterThan(detachBefore);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('激活期间 selection:changed → gizmo 重新 attach 新选中集', () => {
    const other = makeObject('另一个');
    fx.sceneManager.addObject(other);
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    expect(gizmo.attached).toEqual([[fx.obj.id]]);

    fx.selection.selectMany([fx.obj.id, other.id]);
    expect(gizmo.attached).toEqual([[fx.obj.id], [fx.obj.id, other.id]]);

    fx.selection.clear();
    expect(gizmo.attached).toEqual([[fx.obj.id], [fx.obj.id, other.id], []]);
  });

  it('deactivate 后 selection:changed 不再触发 attach', () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    fx.tools.deactivate();
    const count = gizmo.attached.length;
    fx.selection.clear();
    expect(gizmo.attached.length).toBe(count);
  });

  it('非法模式参数抛错（activate 快速失败）', () => {
    expect(() => fx.tools.activate('transform', { mode: 'warp' })).toThrow();
    expect(fx.tools.getActiveTool()).toBeNull();
  });
});

describe('TransformTool 无 gizmo 桩（无头装配）', () => {
  it('gizmo=null：activate/deactivate/cancel/事件全部安全无操作', () => {
    const fx = setup(null);
    expect(() => {
      fx.selection.select(fx.obj.id);
      fx.tools.activate('transform');
      fx.tool.onPointerDown({ screenX: 1, screenY: 1, button: 'left', ctrlKey: false, shiftKey: false, altKey: false });
      fx.tool.cancel();
      fx.tools.deactivate();
    }).not.toThrow();
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('gizmo=null：scene:changed 不触发任何 gizmo 调用、不抛错（重同步订阅安全）', () => {
    const fx = setup(null);
    fx.tools.activate('transform');
    expect(() => {
      fx.sceneManager.updateObject(fx.obj.id, { transform: AFTER });
    }).not.toThrow();
  });
});

describe('TransformTool gizmo 代理重同步（T8.6 缺陷①：undo/redo 漂移）', () => {
  let fx: ReturnType<typeof setup>;
  let gizmo: FakeGizmo;

  beforeEach(() => {
    gizmo = new FakeGizmo();
    fx = setup(gizmo);
  });

  it('激活期间场景 transform 变化（scene:changed）→ gizmo.resync 被调用、不重挂', () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    const attachCalls = gizmo.attached.length;
    expect(gizmo.resyncCount).toBe(0);

    // 场景数据被外部路径修改（属性面板批量改值 / 贴地 / 阵列 / 对齐等）→ scene:changed
    fx.sceneManager.updateObject(fx.obj.id, { transform: AFTER });

    expect(gizmo.resyncCount).toBe(1); // SceneManager.updateObject 发一次 scene:changed
    expect(gizmo.attached.length).toBe(attachCalls); // 不重挂（选中集未变，仅重同步）
  });

  it('undo/redo 真实路径：拖拽提交 → undo/redo 均触发 resync（缺陷①核心场景）', async () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    const attachCalls = gizmo.attached.length;

    const before = { ...fx.obj.transform };
    gizmo.emitDragEnd({ objectId: fx.obj.id, before, after: AFTER });
    await Promise.resolve(); // 手势冲刷 → TransformCommand.execute
    const afterExecute = gizmo.resyncCount;
    expect(afterExecute).toBe(2); // updateObject + TransformCommand 双发 scene:changed
    expect(gizmo.attached.length).toBe(attachCalls); // 自反馈不重挂

    fx.history.undo();
    expect(gizmo.resyncCount).toBe(afterExecute + 2); // undo 双发同样触发
    expect(gizmo.attached.length).toBe(attachCalls);

    fx.history.redo();
    expect(gizmo.resyncCount).toBe(afterExecute + 4);
    expect(gizmo.attached.length).toBe(attachCalls);
  });

  it('拖拽会话中 scene:changed → resync 无操作（port 契约：拖拽中不打断手势）', () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    const attachCalls = gizmo.attached.length;

    gizmo.dragging = true; // 模拟 TransformControls 拖拽进行中
    fx.sceneManager.updateObject(fx.obj.id, { transform: AFTER });

    expect(gizmo.resyncCount).toBe(0); // 抑制：不打断进行中的拖拽
    expect(gizmo.resyncSuppressed).toBe(1);
    expect(gizmo.attached.length).toBe(attachCalls);
  });

  it('deactivate 后 scene:changed 不再触发 resync（订阅随停用解除）', () => {
    fx.selection.select(fx.obj.id);
    fx.tools.activate('transform');
    fx.tools.deactivate();
    const count = gizmo.resyncCount;

    fx.sceneManager.updateObject(fx.obj.id, { transform: AFTER });
    expect(gizmo.resyncCount).toBe(count);
  });
});
