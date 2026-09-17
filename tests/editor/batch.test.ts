/**
 * tests/editor/batch.test.ts —— BatchCommand 原子性与合并历史测试。
 *
 * 覆盖（T1.5 验收标准）：
 * - 3 个 CreateObject 合并为一条历史：一次 undo 全消失、一次 redo 全恢复（id 不变）；
 * - 半路失败：回滚已执行子命令、后续子命令不执行、返回 false 且不入栈；
 * - canExecute 聚合子命令结果；
 * - 混合命令批的原子撤销重做。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { Transform } from '../../src/core/types';
import type { SceneObject } from '../../src/scene/SceneObject';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { CommandContext } from '../../src/editor/commands/CommandContext';
import { BatchCommand } from '../../src/editor/commands/BatchCommand';
import { ChangePropertyCommand } from '../../src/editor/commands/ChangePropertyCommand';
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
    properties: { height: 10 },
    ...overrides,
  };
}

const T0: Transform = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};
const T1: Transform = {
  position: { x: 4, y: 0, z: 4 },
  rotation: { x: 0, y: 0.5, z: 0 },
  scale: { x: 1, y: 2, z: 1 },
};

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const ctx: CommandContext = { sceneManager, selection, eventBus };
  const history = new HistoryManager(ctx);
  return { ctx, eventBus, sceneManager, selection, history };
}

describe('BatchCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('id 为 cmd_ 前缀，name 为 BatchCommand', () => {
    const batch = new BatchCommand([new CreateObjectCommand(makeObject())]);
    expect(batch.id).toMatch(/^cmd_/);
    expect(batch.name).toBe('BatchCommand');
  });

  it('execute 成功后统一发出 scene:changed(source=BatchCommand)', () => {
    const sceneChanged = vi.fn();
    fx.eventBus.on('scene:changed', sceneChanged);
    const batch = new BatchCommand([new CreateObjectCommand(makeObject())]);
    expect(batch.execute(fx.ctx)).toBe(true);
    expect(sceneChanged).toHaveBeenCalledWith({ source: 'BatchCommand' });
  });

  it('3 个 CreateObject：execute 全部生效，一次 undo 全消失，一次 redo 全恢复且 id 不变', () => {
    const objs = [makeObject({ name: '1' }), makeObject({ name: '2' }), makeObject({ name: '3' })];
    const batch = new BatchCommand(objs.map((o) => new CreateObjectCommand(o)));
    expect(batch.canExecute()).toBe(true);
    expect(fx.history.execute(batch)).toBe(true);
    expect(fx.sceneManager.getObjects().length).toBe(3);

    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObjects().length).toBe(0);

    expect(fx.history.redo()).toBe(true);
    const restoredIds = fx.sceneManager.getObjects().map((o) => o.id).sort();
    expect(restoredIds).toEqual(objs.map((o) => o.id).sort());
  });

  it('半路失败：回滚已执行子命令，后续子命令不执行，返回 false 且不入栈', () => {
    const a = makeObject({ name: 'A' });
    const b = makeObject({ name: 'B' });
    const batch = new BatchCommand([
      new CreateObjectCommand(a), // 1. 成功
      new DeleteObjectCommand('element_missing'), // 2. 失败（对象不存在）
      new CreateObjectCommand(b), // 3. 不应执行
    ]);
    const historyChanged = vi.fn();
    fx.eventBus.on('history:changed', historyChanged);

    expect(fx.history.execute(batch)).toBe(false);
    expect(fx.sceneManager.getObject(a.id)).toBeUndefined(); // 已回滚
    expect(fx.sceneManager.getObject(b.id)).toBeUndefined(); // 未执行
    expect(fx.sceneManager.getObjects().length).toBe(0);
    expect(fx.history.canUndo()).toBe(false);
    expect(historyChanged).not.toHaveBeenCalled();
  });

  it('canExecute：任一子命令 canExecute 为 false 则整体为 false，执行被拒', () => {
    const bad = new TransformCommand('element_x', T0, {
      position: { x: NaN, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    const batch = new BatchCommand([new CreateObjectCommand(makeObject()), bad]);
    expect(batch.canExecute()).toBe(false);
    expect(fx.history.execute(batch)).toBe(false);
    expect(fx.sceneManager.getObjects().length).toBe(0);
  });

  it('空批 canExecute 为 false', () => {
    const batch = new BatchCommand([]);
    expect(batch.canExecute()).toBe(false);
    expect(batch.execute(fx.ctx)).toBe(false);
  });

  it('混合命令批：一次 undo 同时撤销 transform 与属性修改，redo 同时恢复', () => {
    const obj = makeObject({ properties: { height: 10 } });
    fx.sceneManager.addObject(obj);
    const batch = new BatchCommand([
      new TransformCommand(obj.id, T0, T1),
      new ChangePropertyCommand(obj.id, { height: 88 }),
    ]);
    expect(fx.history.execute(batch)).toBe(true);
    const applied = fx.sceneManager.getObject(obj.id)!;
    expect(applied.transform.position).toEqual(T1.position);
    expect((applied.properties as Record<string, unknown>).height).toBe(88);

    fx.history.undo();
    const undone = fx.sceneManager.getObject(obj.id)!;
    expect(undone.transform.position).toEqual(T0.position);
    expect(undone.transform.scale).toEqual(T0.scale);
    expect((undone.properties as Record<string, unknown>).height).toBe(10);

    fx.history.redo();
    const redone = fx.sceneManager.getObject(obj.id)!;
    expect(redone.transform.rotation).toEqual(T1.rotation);
    expect((redone.properties as Record<string, unknown>).height).toBe(88);
  });
});
