/**
 * tests/editor/objectLayerCommands.test.ts —— 对象字段 / 图层属性命令测试（T2.4，先测后码）。
 *
 * 覆盖（任务书：图层操作、重命名、显隐/锁定全部经命令且可撤销）：
 * - UpdateObjectCommand（name/visible/locked 顶层字段）：execute 生效 → undo 完全回 before →
 *   redo 回 after；对象不存在 execute false；快照隔离；
 * - UpdateLayerCommand（name/visible/locked/opacity/order）：execute → layer:updated + scene:changed →
 *   undo/redo 往返；图层不存在 execute false；opacity/order 数值字段完整往返；
 * - 两命令均可经 HistoryManager 入栈（一条历史，一次 undo 恢复）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { Layer } from '../../src/scene/Layer';
import type { SceneObject } from '../../src/scene/SceneObject';
import type { CommandContext } from '../../src/editor/commands/CommandContext';
import { UpdateLayerCommand } from '../../src/editor/commands/UpdateLayerCommand';
import { UpdateObjectCommand } from '../../src/editor/commands/UpdateObjectCommand';
import { HistoryManager } from '../../src/editor/history/HistoryManager';

function makeObject(overrides: Partial<SceneObject> = {}): SceneObject {
  return {
    id: createId('element'),
    type: 'building',
    name: '建筑',
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

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const ctx: CommandContext = { sceneManager, selection, eventBus };
  const history = new HistoryManager(ctx);
  return { ctx, eventBus, sceneManager, selection, history };
}

describe('UpdateObjectCommand（name/visible/locked）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('重命名：经历史执行生效 → undo 回原名 → redo 回新名（一条历史）', () => {
    const obj = makeObject();
    fx.sceneManager.addObject(obj);
    const cmd = new UpdateObjectCommand(obj.id, { name: '总部大楼' });
    expect(cmd.canExecute()).toBe(true);

    expect(fx.history.execute(cmd)).toBe(true);
    expect(fx.sceneManager.getObject(obj.id)?.name).toBe('总部大楼');

    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObject(obj.id)?.name).toBe('建筑');

    expect(fx.history.redo()).toBe(true);
    expect(fx.sceneManager.getObject(obj.id)?.name).toBe('总部大楼');
  });

  it('visible/locked 开关往返', () => {
    const obj = makeObject();
    fx.sceneManager.addObject(obj);
    const cmd = new UpdateObjectCommand(obj.id, { visible: false, locked: true });
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(fx.sceneManager.getObject(obj.id)).toMatchObject({ visible: false, locked: true });

    cmd.undo(fx.ctx);
    expect(fx.sceneManager.getObject(obj.id)).toMatchObject({ visible: true, locked: false });

    cmd.redo(fx.ctx);
    expect(fx.sceneManager.getObject(obj.id)).toMatchObject({ visible: false, locked: true });
  });

  it('execute 后发 scene:changed(source=命令名)；patch 不越界改其他字段', () => {
    const obj = makeObject();
    fx.sceneManager.addObject(obj);
    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);

    expect(new UpdateObjectCommand(obj.id, { locked: true }).execute(fx.ctx)).toBe(true);
    expect(changed).toHaveBeenCalledWith({ source: 'UpdateObjectCommand' });

    const after = fx.sceneManager.getObject(obj.id)!;
    expect(after.name).toBe('建筑');
    expect(after.visible).toBe(true);
    expect(after.transform).toEqual(obj.transform);
  });

  it('对象不存在：execute false 且零事件；undo/redo 幂等', () => {
    const cmd = new UpdateObjectCommand('element_ghost', { name: 'x' });
    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    expect(cmd.execute(fx.ctx)).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    expect(() => {
      cmd.undo(fx.ctx);
      cmd.redo(fx.ctx);
    }).not.toThrow();
  });

  it('快照隔离：构造后修改 patch 不影响执行内容', () => {
    const obj = makeObject();
    fx.sceneManager.addObject(obj);
    const patch: { name: string } = { name: 'A' };
    const cmd = new UpdateObjectCommand(obj.id, patch);
    patch.name = 'B';
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(fx.sceneManager.getObject(obj.id)?.name).toBe('A');
  });
});

describe('UpdateLayerCommand（name/visible/locked/opacity/order）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('可见性开关：execute → layer:updated + scene:changed；undo/redo 往返', () => {
    const layer = makeLayer();
    fx.sceneManager.addLayer(layer);
    const layerUpdated = vi.fn();
    const changed = vi.fn();
    fx.eventBus.on('layer:updated', layerUpdated);
    fx.eventBus.on('scene:changed', changed);

    const cmd = new UpdateLayerCommand(layer.id, { visible: false });
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(fx.sceneManager.getLayer(layer.id)?.visible).toBe(false);
    expect(layerUpdated).toHaveBeenCalledWith({ layerId: layer.id });
    expect(changed).toHaveBeenCalledWith({ source: 'UpdateLayerCommand' });

    cmd.undo(fx.ctx);
    expect(fx.sceneManager.getLayer(layer.id)?.visible).toBe(true);
    cmd.redo(fx.ctx);
    expect(fx.sceneManager.getLayer(layer.id)?.visible).toBe(false);
  });

  it('透明度 / 排序 / 重命名数值与字符串字段完整往返', () => {
    const layer = makeLayer({ opacity: 1, order: 3, name: 'Roads' });
    fx.sceneManager.addLayer(layer);
    const cmd = new UpdateLayerCommand(layer.id, { opacity: 0.4, order: 7, name: '道路' });
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(fx.sceneManager.getLayer(layer.id)).toMatchObject({ opacity: 0.4, order: 7, name: '道路' });

    cmd.undo(fx.ctx);
    expect(fx.sceneManager.getLayer(layer.id)).toMatchObject({ opacity: 1, order: 3, name: 'Roads' });

    cmd.redo(fx.ctx);
    expect(fx.sceneManager.getLayer(layer.id)).toMatchObject({ opacity: 0.4, order: 7, name: '道路' });
  });

  it('只 patch 给定键：其余图层字段不动', () => {
    const layer = makeLayer({ opacity: 0.8 });
    fx.sceneManager.addLayer(layer);
    new UpdateLayerCommand(layer.id, { locked: true }).execute(fx.ctx);
    expect(fx.sceneManager.getLayer(layer.id)).toMatchObject({ opacity: 0.8, locked: true, visible: true });
  });

  it('图层不存在：execute false；undo/redo 幂等不抛错', () => {
    const cmd = new UpdateLayerCommand('layer_ghost', { visible: false });
    expect(cmd.execute(fx.ctx)).toBe(false);
    expect(() => {
      cmd.undo(fx.ctx);
      cmd.redo(fx.ctx);
    }).not.toThrow();
  });

  it('经 HistoryManager：一次 undo 恢复（一条历史）', () => {
    const layer = makeLayer();
    fx.sceneManager.addLayer(layer);
    expect(fx.history.execute(new UpdateLayerCommand(layer.id, { opacity: 0.25 }))).toBe(true);
    expect(fx.sceneManager.getLayer(layer.id)?.opacity).toBe(0.25);

    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getLayer(layer.id)?.opacity).toBe(1);

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    expect(depth).toBe(0); // 只有一条历史
  });
});
