/**
 * tests/editor/TransformTool.batch.test.ts —— 多对象手势聚合测试（T7.5 先测后码）。
 *
 * 覆盖（GizmoPort 同一手势 N 次 onDragEnd 回调 → 一条 BatchCommand）：
 * - 多对象手势：N 次同步回调 → 冲刷后一条历史（BatchCommand）；undo 一次全部
 *   对象还原各自 before；redo 全部回 after；
 * - 单对象手势：1 次回调 → 直接单条 TransformCommand（不包 Batch）；
 * - 两次独立手势（事件循环分隔）→ 两条历史逐次撤销；
 * - 回调期间（冲刷前）历史栈不变（预览隔离延伸）；
 * - 手势内含不存在对象 → BatchCommand 原子失败，不入历史不抛错；
 * - 工具停用后冲刷 → 丢弃（不产生命令）。
 * 边界：mock gizmo 注入（FakeGizmo 同 TransformTool.test.ts 形态）；冲刷机制 =
 * 微任务（同一手势的 N 次回调同步连发，事件循环轮转即手势边界）。
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

/** Fake gizmo：记录调用并允许测试手动发起拖拽结束回调；resync 计数（T8.6 缺陷①） */
class FakeGizmo implements GizmoPort {
  readonly attached: ID[][] = [];
  detachCount = 0;
  resyncCount = 0;
  private cb: ((info: { objectId: ID; before: Transform; after: Transform }) => void) | null = null;

  attach(ids: ID[]): void {
    this.attached.push([...ids]);
  }
  detach(): void {
    this.detachCount += 1;
  }
  resync(): void {
    this.resyncCount += 1;
  }
  setMode(): void {}
  onDragEnd(cb: (info: { objectId: ID; before: Transform; after: Transform }) => void): void {
    this.cb = cb;
  }
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

function makeObject(name: string, x: number): SceneObject {
  return {
    id: createId('element'),
    type: 'building',
    name,
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const objects = [makeObject('A', 0), makeObject('B', 10), makeObject('C', 20)];
  for (const obj of objects) sceneManager.addObject(obj);

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
  const gizmo = new FakeGizmo();
  const tool = new TransformTool(gizmo);
  tools.register(tool);

  return { sceneManager, selection, history, objects, tools, gizmo };
}

function afterOf(x: number): Transform {
  return {
    position: { x: x + 100, y: 5, z: 0 },
    rotation: { x: 0, y: 0.5, z: 0 },
    scale: { x: 2, y: 2, z: 2 },
  };
}

/** 等待微任务冲刷（同一手势 N 次回调同步连发后调用） */
function flush(): Promise<void> {
  return Promise.resolve();
}

describe('TransformTool 多对象手势聚合（一条 BatchCommand）', () => {
  let fx: ReturnType<typeof setup>;

  beforeEach(() => {
    fx = setup();
  });

  it('多对象手势：N 次回调 → 一条历史；undo 一次全部还原、redo 全部回 after', async () => {
    const [a, b, c] = fx.objects;
    fx.selection.selectMany([a.id, b.id, c.id]);
    fx.tools.activate('transform');

    const beforeA = { ...a.transform };
    const beforeB = { ...b.transform };
    const beforeC = { ...c.transform };
    const afterA = afterOf(0);
    const afterB = afterOf(10);
    const afterC = afterOf(20);

    // 同一手势：GizmoImpl 对每个目标各回调一次（同步连发）
    fx.gizmo.emitDragEnd({ objectId: a.id, before: beforeA, after: afterA });
    fx.gizmo.emitDragEnd({ objectId: b.id, before: beforeB, after: afterB });
    fx.gizmo.emitDragEnd({ objectId: c.id, before: beforeC, after: afterC });

    await flush(); // 手势冲刷（微任务）

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    for (let i = 0; i < depth; i++) fx.history.redo();
    expect(depth).toBe(1); // 一条历史

    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(afterA);
    expect(fx.sceneManager.getObject(b.id)?.transform).toEqual(afterB);
    expect(fx.sceneManager.getObject(c.id)?.transform).toEqual(afterC);

    fx.history.undo(); // 一次撤销 = 全部还原
    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(beforeA);
    expect(fx.sceneManager.getObject(b.id)?.transform).toEqual(beforeB);
    expect(fx.sceneManager.getObject(c.id)?.transform).toEqual(beforeC);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('回调期间（冲刷前）历史栈不变', async () => {
    const [a, b] = fx.objects;
    fx.selection.selectMany([a.id, b.id]);
    fx.tools.activate('transform');

    fx.gizmo.emitDragEnd({ objectId: a.id, before: { ...a.transform }, after: afterOf(0) });
    fx.gizmo.emitDragEnd({ objectId: b.id, before: { ...b.transform }, after: afterOf(10) });
    expect(fx.history.canUndo()).toBe(false); // 冲刷前零命令

    await flush();
    expect(fx.history.canUndo()).toBe(true);
  });

  it('单对象手势：1 次回调 → 直接单条 TransformCommand（不包 Batch）', async () => {
    const [a] = fx.objects;
    fx.selection.select(a.id);
    fx.tools.activate('transform');
    const before = { ...a.transform };

    fx.gizmo.emitDragEnd({ objectId: a.id, before, after: afterOf(0) });
    await flush();

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    for (let i = 0; i < depth; i++) fx.history.redo();
    expect(depth).toBe(1);
    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(afterOf(0));
    fx.history.undo();
    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(before);
  });

  it('两次独立手势（事件循环分隔）→ 两条历史，逐次撤销', async () => {
    const [a] = fx.objects;
    fx.selection.select(a.id);
    fx.tools.activate('transform');
    const before = { ...a.transform };

    fx.gizmo.emitDragEnd({ objectId: a.id, before, after: afterOf(0) });
    await flush();
    fx.gizmo.emitDragEnd({ objectId: a.id, before: afterOf(0), after: before });
    await flush();

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    for (let i = 0; i < depth; i++) fx.history.redo();
    expect(depth).toBe(2);
    fx.history.undo();
    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(afterOf(0));
    fx.history.undo();
    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(before);
  });

  it('手势内含不存在对象 → BatchCommand 原子失败，不入历史不抛错', async () => {
    const [a] = fx.objects;
    fx.selection.selectMany([a.id, createId('element')]);
    fx.tools.activate('transform');

    expect(() => {
      fx.gizmo.emitDragEnd({ objectId: a.id, before: { ...a.transform }, after: afterOf(0) });
      fx.gizmo.emitDragEnd({
        objectId: createId('element'),
        before: { ...a.transform },
        after: afterOf(0),
      });
    }).not.toThrow();
    await flush();

    expect(fx.history.canUndo()).toBe(false); // 整批拒绝（原子性）
    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(a.transform); // 已执行子命令回滚
  });

  it('工具停用后冲刷 → 丢弃待聚合回调，不产生命令', async () => {
    const [a, b] = fx.objects;
    fx.selection.selectMany([a.id, b.id]);
    fx.tools.activate('transform');

    fx.gizmo.emitDragEnd({ objectId: a.id, before: { ...a.transform }, after: afterOf(0) });
    fx.gizmo.emitDragEnd({ objectId: b.id, before: { ...b.transform }, after: afterOf(10) });
    fx.tools.deactivate();
    await flush();

    expect(fx.history.canUndo()).toBe(false);
    expect(fx.sceneManager.getObject(a.id)?.transform).toEqual(a.transform);
  });

  it('多选手势 undo（BatchCommand）→ gizmo.resync 被调用（多锚点代理重同步路径，T8.6 缺陷①）', async () => {
    const [a, b] = fx.objects;
    fx.selection.selectMany([a.id, b.id]);
    fx.tools.activate('transform');
    const attachCalls = fx.gizmo.attached.length;

    fx.gizmo.emitDragEnd({ objectId: a.id, before: { ...a.transform }, after: afterOf(0) });
    fx.gizmo.emitDragEnd({ objectId: b.id, before: { ...b.transform }, after: afterOf(10) });
    await flush(); // 冲刷 → BatchCommand.execute（2 子命令 + 批自身共 5 次 scene:changed）
    expect(fx.gizmo.resyncCount).toBe(5);
    expect(fx.gizmo.attached.length).toBe(attachCalls);

    fx.history.undo(); // 一次撤销整批 → 子命令逐个 undo + 批自身（5 次 scene:changed）
    expect(fx.gizmo.resyncCount).toBe(10);
    expect(fx.gizmo.attached.length).toBe(attachCalls); // 选中集未变：只重同步不重挂
  });
});
