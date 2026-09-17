/**
 * tests/editor/mergeLayerCommand.test.ts —— 图层合并命令测试（T8.3 §4，先测后码）。
 *
 * 覆盖（任务书 + 边界裁定）：
 * - execute：源图层全部成员迁移到目标（目标 objectIds 计数正确）+ 删源图层
 *   （getLayers 不再含源），一条历史；
 * - undo：一次完整复原——成员回迁 + 源图层复活（name/order/visible/locked/opacity 全保留）；
 * - redo：再次合并；
 * - 空图层合并 = 等价删除（仅删源；undo 复活空层）；
 * - source === target → canExecute false（HistoryManager 拒绝）；
 * - 源/目标图层不存在 → execute false 零副作用；
 * - 经 HistoryManager 一条历史（undo 到底恰 1 步）。
 * 边界：node 纯逻辑；与 SceneManager 派生索引（objectIds）协同正确性。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { Layer } from '../../src/scene/Layer';
import type { SceneObject } from '../../src/scene/SceneObject';
import type { CommandContext } from '../../src/editor/commands/CommandContext';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import { MergeLayerCommand } from '../../src/editor/commands/MergeLayerCommand';

function makeObject(layerId: string | null, name: string): SceneObject {
  return {
    id: createId('element'),
    type: 'region',
    name,
    parentId: null,
    layerId,
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

describe('MergeLayerCommand（图层合并，T8.3）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute：成员迁移 + 删源图层，目标计数正确，一条历史', () => {
    const source = makeLayer({ id: 'layer_a', name: '临时层', order: 2, opacity: 0.6 });
    const target = makeLayer({ id: 'layer_b', name: '主层', order: 1 });
    fx.sceneManager.addLayer(source);
    fx.sceneManager.addLayer(target);
    const a1 = makeObject('layer_a', '甲1');
    const a2 = makeObject('layer_a', '甲2');
    const b1 = makeObject('layer_b', '乙1');
    for (const obj of [a1, a2, b1]) fx.sceneManager.addObject(obj);

    expect(fx.history.execute(new MergeLayerCommand('layer_a', 'layer_b'))).toBe(true);
    expect(fx.sceneManager.getLayer('layer_a')).toBeUndefined(); // 源已删
    expect(a1.layerId).toBe('layer_b');
    expect(a2.layerId).toBe('layer_b');
    expect(fx.sceneManager.getLayer('layer_b')!.objectIds).toHaveLength(3); // 计数正确
    expect(fx.sceneManager.getObjects().every((o) => o.layerId === 'layer_b')).toBe(true);

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    expect(depth).toBe(1); // 一条历史
  });

  it('undo：一次完整复原——成员回迁 + 源图层复活（name/order/visible/locked/opacity 全保留）', () => {
    const source = makeLayer({
      id: 'layer_src',
      name: '源层',
      order: 5,
      visible: false,
      locked: true,
      opacity: 0.4,
    });
    const target = makeLayer({ id: 'layer_dst', name: '目标层', order: 0 });
    fx.sceneManager.addLayer(source);
    fx.sceneManager.addLayer(target);
    const a1 = makeObject('layer_src', '甲1');
    const a2 = makeObject('layer_src', '甲2');
    const b1 = makeObject('layer_dst', '乙1');
    for (const obj of [a1, a2, b1]) fx.sceneManager.addObject(obj);

    fx.history.execute(new MergeLayerCommand('layer_src', 'layer_dst'));
    expect(fx.history.undo()).toBe(true);

    const revived = fx.sceneManager.getLayer('layer_src');
    expect(revived).toMatchObject({
      id: 'layer_src',
      name: '源层',
      order: 5,
      visible: false,
      locked: true,
      opacity: 0.4,
    });
    expect(a1.layerId).toBe('layer_src'); // 成员回迁
    expect(a2.layerId).toBe('layer_src');
    expect(b1.layerId).toBe('layer_dst');
    expect(revived!.objectIds).toHaveLength(2); // 派生索引正确
    expect(fx.sceneManager.getLayer('layer_dst')!.objectIds).toEqual([b1.id]);
  });

  it('redo：再次合并（目标计数 / 源消失复原现）', () => {
    const source = makeLayer({ id: 'layer_src', name: '源' });
    const target = makeLayer({ id: 'layer_dst', name: '目标' });
    fx.sceneManager.addLayer(source);
    fx.sceneManager.addLayer(target);
    const a1 = makeObject('layer_src', '甲1');
    fx.sceneManager.addObject(a1);

    fx.history.execute(new MergeLayerCommand('layer_src', 'layer_dst'));
    fx.history.undo();
    expect(fx.history.redo()).toBe(true);
    expect(fx.sceneManager.getLayer('layer_src')).toBeUndefined();
    expect(a1.layerId).toBe('layer_dst');
    expect(fx.sceneManager.getLayer('layer_dst')!.objectIds).toHaveLength(1);
  });

  it('空图层合并 = 等价删除（零成员迁移；undo 复活空层）', () => {
    const empty = makeLayer({ id: 'layer_empty', name: '空层', order: 3 });
    const target = makeLayer({ id: 'layer_dst', name: '目标' });
    fx.sceneManager.addLayer(empty);
    fx.sceneManager.addLayer(target);

    expect(fx.history.execute(new MergeLayerCommand('layer_empty', 'layer_dst'))).toBe(true);
    expect(fx.sceneManager.getLayer('layer_empty')).toBeUndefined();

    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getLayer('layer_empty')).toMatchObject({ name: '空层', order: 3 });
    expect(fx.sceneManager.getLayer('layer_empty')!.objectIds).toEqual([]);
  });

  it('source === target → canExecute false（HistoryManager 拒绝执行）', () => {
    const layer = makeLayer({ id: 'layer_x' });
    fx.sceneManager.addLayer(layer);
    const cmd = new MergeLayerCommand('layer_x', 'layer_x');
    expect(cmd.canExecute()).toBe(false);
    expect(fx.history.execute(cmd)).toBe(false);
    expect(fx.sceneManager.getLayer('layer_x')).toBeDefined();
  });

  it('源或目标图层不存在 → execute false 零副作用', () => {
    const target = makeLayer({ id: 'layer_dst' });
    fx.sceneManager.addLayer(target);
    const a1 = makeObject(null, '无层');
    fx.sceneManager.addObject(a1);

    expect(new MergeLayerCommand('layer_ghost', 'layer_dst').execute(fx.ctx)).toBe(false);
    expect(new MergeLayerCommand('layer_dst', 'layer_ghost').execute(fx.ctx)).toBe(false);
    expect(fx.sceneManager.getLayer('layer_dst')).toBeDefined();
    expect(fx.sceneManager.getObjects()).toHaveLength(1);
  });

  it('命令入历史后可继续与其他命令叠加（互不干扰）', () => {
    const source = makeLayer({ id: 'layer_src' });
    const target = makeLayer({ id: 'layer_dst' });
    fx.sceneManager.addLayer(source);
    fx.sceneManager.addLayer(target);
    fx.sceneManager.addObject(makeObject('layer_src', '甲'));

    expect(fx.history.execute(new MergeLayerCommand('layer_src', 'layer_dst'))).toBe(true);
    fx.history.undo();
    fx.history.redo();
    expect(fx.history.canUndo()).toBe(true);
    expect(fx.history.canRedo()).toBe(false);
  });
});
