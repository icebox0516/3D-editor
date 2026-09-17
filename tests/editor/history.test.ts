/**
 * tests/editor/history.test.ts —— HistoryManager 栈行为测试。
 *
 * 覆盖（T1.5 验收标准）：
 * - execute 成功入栈并清空 redo 栈；失败（execute 返回 false / canExecute false）不入栈、无事件；
 * - 空栈 undo()/redo() 返回 false；
 * - 每次栈变更 emit history:changed（canUndo/canRedo 参数正确）；
 * - clear() 清空两侧栈并广播；
 * - mergeBatch 选项：默认合并 BatchCommand 为一条历史，false 时按子命令逐条入栈。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { Transform } from '../../src/core/types';
import type { SceneObject } from '../../src/scene/SceneObject';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { Command, CommandContext } from '../../src/editor/commands';
import { BatchCommand } from '../../src/editor/commands';
import { CreateObjectCommand } from '../../src/editor/commands/CreateObjectCommand';
import { DeleteObjectCommand } from '../../src/editor/commands/DeleteObjectCommand';
import { TransformCommand } from '../../src/editor/commands/TransformCommand';
import { HistoryManager } from '../../src/editor/history/HistoryManager';

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

const T0: Transform = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};
const T1: Transform = {
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: 1, z: 0 },
  scale: { x: 2, y: 2, z: 2 },
};

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const ctx: CommandContext = { sceneManager, selection, eventBus };
  const history = new HistoryManager(ctx);
  return { ctx, eventBus, sceneManager, selection, history };
}

describe('HistoryManager.execute', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('成功入栈：返回 true，canUndo=true，history:changed 参数正确，命令发出 scene:changed(命令名)', () => {
    const historyChanged = vi.fn();
    const sceneChanged = vi.fn();
    fx.eventBus.on('history:changed', historyChanged);
    fx.eventBus.on('scene:changed', sceneChanged);

    const ok = fx.history.execute(new CreateObjectCommand(makeObject()));
    expect(ok).toBe(true);
    expect(fx.history.canUndo()).toBe(true);
    expect(fx.history.canRedo()).toBe(false);
    expect(historyChanged).toHaveBeenCalledTimes(1);
    expect(historyChanged).toHaveBeenCalledWith({ canUndo: true, canRedo: false });
    expect(sceneChanged).toHaveBeenCalledWith({ source: 'CreateObjectCommand' });
  });

  it('execute 失败（对象不存在）：返回 false，不入栈，不发 history:changed', () => {
    const historyChanged = vi.fn();
    fx.eventBus.on('history:changed', historyChanged);

    const ok = fx.history.execute(new DeleteObjectCommand('element_missing'));
    expect(ok).toBe(false);
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.history.canRedo()).toBe(false);
    expect(historyChanged).not.toHaveBeenCalled();
  });

  it('canExecute 为 false：直接拒绝，不调用 execute', () => {
    const executeSpy = vi.fn().mockReturnValue(true);
    const cmd: Command = {
      id: 'cmd_fake',
      name: 'FakeCommand',
      execute: executeSpy,
      undo: vi.fn(),
      redo: vi.fn(),
      canExecute: () => false,
    };
    expect(fx.history.execute(cmd)).toBe(false);
    expect(executeSpy).not.toHaveBeenCalled();
    expect(fx.history.canUndo()).toBe(false);
  });

  it('新 execute 清空 redo 栈：被撤销的命令不可再 redo', () => {
    const a = makeObject();
    const b = makeObject();
    fx.sceneManager.addObject(a);
    expect(fx.history.execute(new DeleteObjectCommand(a.id))).toBe(true);
    expect(fx.history.undo()).toBe(true); // a 恢复，进入 redo 栈

    expect(fx.history.execute(new CreateObjectCommand(b))).toBe(true);
    expect(fx.history.canRedo()).toBe(false);
    expect(fx.history.redo()).toBe(false);
    expect(fx.sceneManager.getObject(a.id)).toBeDefined();
  });
});

describe('HistoryManager.undo / redo', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('空栈：undo()/redo() 返回 false 且不发 history:changed', () => {
    const historyChanged = vi.fn();
    fx.eventBus.on('history:changed', historyChanged);
    expect(fx.history.undo()).toBe(false);
    expect(fx.history.redo()).toBe(false);
    expect(historyChanged).not.toHaveBeenCalled();
  });

  it('undo/redo 往返：状态与 canUndo/canRedo 交替正确，事件参数逐次正确', () => {
    const obj = makeObject();
    fx.sceneManager.addObject(obj);
    fx.history.execute(new TransformCommand(obj.id, T0, T1));

    const historyChanged = vi.fn();
    fx.eventBus.on('history:changed', historyChanged);

    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObject(obj.id)!.transform.position).toEqual(T0.position);
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.history.canRedo()).toBe(true);
    expect(historyChanged).toHaveBeenLastCalledWith({ canUndo: false, canRedo: true });

    expect(fx.history.redo()).toBe(true);
    expect(fx.sceneManager.getObject(obj.id)!.transform.position).toEqual(T1.position);
    expect(fx.history.canUndo()).toBe(true);
    expect(fx.history.canRedo()).toBe(false);
    expect(historyChanged).toHaveBeenLastCalledWith({ canUndo: true, canRedo: false });
  });

  it('多条命令按 LIFO 撤销（后进先出）', () => {
    const a = makeObject({ name: 'A' });
    const b = makeObject({ name: 'B' });
    fx.history.execute(new CreateObjectCommand(a));
    fx.history.execute(new CreateObjectCommand(b));
    expect(fx.sceneManager.getObjects().length).toBe(2);

    fx.history.undo(); // 撤销 B
    expect(fx.sceneManager.getObject(b.id)).toBeUndefined();
    expect(fx.sceneManager.getObject(a.id)).toBeDefined();
    fx.history.undo(); // 撤销 A
    expect(fx.sceneManager.getObjects().length).toBe(0);
  });
});

describe('HistoryManager.clear', () => {
  it('清空两侧栈并广播 { canUndo: false, canRedo: false }', () => {
    const fx = setup();
    fx.history.execute(new CreateObjectCommand(makeObject()));
    fx.history.undo();

    const historyChanged = vi.fn();
    fx.eventBus.on('history:changed', historyChanged);
    fx.history.clear();
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.history.canRedo()).toBe(false);
    expect(historyChanged).toHaveBeenCalledTimes(1);
    expect(historyChanged).toHaveBeenCalledWith({ canUndo: false, canRedo: false });
    expect(fx.history.undo()).toBe(false);
  });
});

describe('HistoryManager.mergeBatch', () => {
  it('默认合并：BatchCommand 为一条历史，一次 undo 全部撤销', () => {
    const fx = setup();
    const batch = new BatchCommand([
      new CreateObjectCommand(makeObject({ name: '1' })),
      new CreateObjectCommand(makeObject({ name: '2' })),
      new CreateObjectCommand(makeObject({ name: '3' })),
    ]);
    expect(fx.history.execute(batch)).toBe(true);
    expect(fx.sceneManager.getObjects().length).toBe(3);

    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObjects().length).toBe(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('mergeBatch:false：子命令逐条入栈，每次 undo 撤销一个', () => {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const ctx: CommandContext = { sceneManager, selection, eventBus };
    const history = new HistoryManager(ctx, { mergeBatch: false });

    const batch = new BatchCommand([
      new CreateObjectCommand(makeObject({ name: '1' })),
      new CreateObjectCommand(makeObject({ name: '2' })),
      new CreateObjectCommand(makeObject({ name: '3' })),
    ]);
    expect(history.execute(batch)).toBe(true);
    expect(sceneManager.getObjects().length).toBe(3);

    history.undo();
    expect(sceneManager.getObjects().length).toBe(2);
    history.undo();
    expect(sceneManager.getObjects().length).toBe(1);
    history.undo();
    expect(sceneManager.getObjects().length).toBe(0);
    expect(history.canUndo()).toBe(false);
  });
});
