/**
 * tests/editor/commands.test.ts —— 通用命令的 execute/undo/redo 往返一致性测试。
 *
 * 覆盖（T1.5 验收标准；T6.7 删除 v1 ChangeStyle/ChangeGeometry 用例——已随旧要素
 * 体系退役，region 三件套用例见 tests/editor/regionCommands.test.ts）：
 * - 每条命令 execute → 生效 → undo → 完全回 before → redo → after（id 不变、逐字段比对）；
 * - execute 失败（对象不存在等）返回 false 且不产生任何命令级事件；
 * - 快照隔离：命令内部深拷贝 before/after，外部后续修改不影响撤销重放；
 * - 幂等重放：对已消失对象 undo/redo 不抛错（SceneManager 静默语义）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { Layer } from '../../src/scene/Layer';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { SceneObject } from '../../src/scene/SceneObject';
import type { CommandContext } from '../../src/editor/commands/CommandContext';
import { ChangeLayerCommand } from '../../src/editor/commands/ChangeLayerCommand';
import { ChangePropertyCommand } from '../../src/editor/commands/ChangePropertyCommand';
import { CreateObjectCommand } from '../../src/editor/commands/CreateObjectCommand';
import { DeleteObjectCommand } from '../../src/editor/commands/DeleteObjectCommand';
import { TransformCommand } from '../../src/editor/commands/TransformCommand';

/** 构造完整合法的通用对象夹具（可用 overrides 覆盖任意字段） */
function makeObject(overrides: Partial<SceneObject> = {}): SceneObject {
  return {
    id: createId('element'),
    type: 'region',
    name: '区域',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: { height: 10, baseHeight: 0, floors: 3 },
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

/** 组装 CommandContext（eventBus / sceneManager / selection 一体夹具） */
function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const ctx: CommandContext = { sceneManager, selection, eventBus };
  return { ctx, eventBus, sceneManager, selection };
}

describe('CreateObjectCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute 添加对象并发出 scene:changed(source=命令名)；undo 移除；redo 以同 id 恢复且内容一致', () => {
    const element = makeObject();
    const cmd = new CreateObjectCommand(element);
    expect(cmd.id).toMatch(/^cmd_/);
    expect(cmd.name).toBe('CreateObjectCommand');
    expect(cmd.canExecute()).toBe(true);

    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(fx.sceneManager.getObject(element.id)).toBeDefined();
    expect(changed).toHaveBeenCalledWith({ source: 'CreateObjectCommand' });

    cmd.undo(fx.ctx);
    expect(fx.sceneManager.getObject(element.id)).toBeUndefined();

    cmd.redo(fx.ctx);
    const restored = fx.sceneManager.getObject(element.id);
    expect(restored?.id).toBe(element.id);
    expect(restored).toEqual(element);
  });

  it('快照隔离：构造后修改原对象不影响 redo 内容', () => {
    const element = makeObject();
    const cmd = new CreateObjectCommand(element);
    element.name = '被外部篡改';
    (element.properties as Record<string, unknown>).height = 999;
    expect(cmd.execute(fx.ctx)).toBe(true);
    cmd.undo(fx.ctx);
    cmd.redo(fx.ctx);
    const restored = fx.sceneManager.getObject(element.id);
    expect(restored?.name).toBe('区域');
    expect((restored?.properties as Record<string, unknown>).height).toBe(10);
  });

  it('execute 失败：id 已存在返回 false，不发命令级 scene:changed', () => {
    const element = makeObject();
    fx.sceneManager.addObject(element);
    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    const cmd = new CreateObjectCommand(element);
    expect(cmd.execute(fx.ctx)).toBe(false);
    expect(changed).not.toHaveBeenCalledWith({ source: 'CreateObjectCommand' });
    expect(fx.sceneManager.getObjects().length).toBe(1);
  });
});

describe('DeleteObjectCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute 删除并清理选中；undo 恢复同 id 同内容；redo 再次删除', () => {
    const element = makeObject();
    fx.sceneManager.addObject(element);
    fx.selection.select(element.id);

    const cmd = new DeleteObjectCommand(element.id);
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(fx.sceneManager.getObject(element.id)).toBeUndefined();
    expect(fx.selection.isSelected(element.id)).toBe(false);

    cmd.undo(fx.ctx);
    const restored = fx.sceneManager.getObject(element.id);
    expect(restored?.id).toBe(element.id);
    expect(restored).toEqual(element);

    cmd.redo(fx.ctx);
    expect(fx.sceneManager.getObject(element.id)).toBeUndefined();
  });

  it('execute 失败：对象不存在返回 false 且无事件', () => {
    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    const cmd = new DeleteObjectCommand('element_missing');
    expect(cmd.execute(fx.ctx)).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });

  it('幂等重放：未 execute 直接 undo 无副作用不抛错', () => {
    const cmd = new DeleteObjectCommand('element_missing');
    expect(() => cmd.undo(fx.ctx)).not.toThrow();
    expect(fx.sceneManager.getObjects().length).toBe(0);
  });
});

describe('TransformCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  const after = {
    position: { x: 10, y: 2, z: -3 },
    rotation: { x: 0.1, y: 1.5, z: -0.2 },
    scale: { x: 2, y: 0.5, z: 3 },
  };

  it('execute 应用 after；undo 逐字段回到 before；redo 回到 after', () => {
    const element = makeObject();
    fx.sceneManager.addObject(element);
    const before = {
      position: { x: 1, y: 0, z: 2 },
      rotation: { x: 0, y: 0.5, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
    fx.sceneManager.updateObject(element.id, { transform: before });

    const cmd = new TransformCommand(element.id, before, after);
    expect(cmd.canExecute()).toBe(true);
    expect(cmd.execute(fx.ctx)).toBe(true);

    let t = fx.sceneManager.getObject(element.id)!.transform;
    expect(t.position).toEqual(after.position);
    expect(t.rotation).toEqual(after.rotation);
    expect(t.scale).toEqual(after.scale);

    cmd.undo(fx.ctx);
    t = fx.sceneManager.getObject(element.id)!.transform;
    expect(t.position).toEqual(before.position);
    expect(t.rotation).toEqual(before.rotation);
    expect(t.scale).toEqual(before.scale);

    cmd.redo(fx.ctx);
    t = fx.sceneManager.getObject(element.id)!.transform;
    expect(t.position.x).toBe(10);
    expect(t.position.y).toBe(2);
    expect(t.position.z).toBe(-3);
    expect(t.rotation.y).toBe(1.5);
    expect(t.scale.z).toBe(3);
  });

  it('execute 时以场景实际状态为 before（构造传入的过期 before 被忽略）', () => {
    const element = makeObject();
    fx.sceneManager.addObject(element);
    const actualBefore = {
      position: { x: 5, y: 0, z: 5 },
      rotation: { x: 0, y: 1, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
    };
    fx.sceneManager.updateObject(element.id, { transform: actualBefore });
    const staleBefore = {
      position: { x: 99, y: 99, z: 99 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };

    const cmd = new TransformCommand(element.id, staleBefore, after);
    expect(cmd.execute(fx.ctx)).toBe(true);
    cmd.undo(fx.ctx);
    const t = fx.sceneManager.getObject(element.id)!.transform;
    expect(t.position).toEqual(actualBefore.position);
    expect(t.scale).toEqual(actualBefore.scale);
  });

  it('execute 失败：对象不存在返回 false；canExecute 拒绝非法 after', () => {
    const bad = {
      position: { x: NaN, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
    const cmdBad = new TransformCommand('element_x', { ...after }, bad);
    expect(cmdBad.canExecute()).toBe(false);

    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    const cmd = new TransformCommand('element_missing', { ...after }, after);
    expect(cmd.execute(fx.ctx)).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });
});

describe('ChangePropertyCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute 合并 patch；undo 恢复全部键（含原本不存在的键被移除）；redo 重新应用', () => {
    const element = makeObject();
    fx.sceneManager.addObject(element);

    const cmd = new ChangePropertyCommand(element.id, { height: 25, tag: '重点' });
    expect(cmd.execute(fx.ctx)).toBe(true);
    let props = fx.sceneManager.getObject(element.id)!.properties as Record<string, unknown>;
    expect(props.height).toBe(25);
    expect(props.tag).toBe('重点');
    expect(props.floors).toBe(3);

    cmd.undo(fx.ctx);
    props = fx.sceneManager.getObject(element.id)!.properties as Record<string, unknown>;
    expect(props.height).toBe(10);
    expect('tag' in props).toBe(false);
    expect(props.floors).toBe(3);

    cmd.redo(fx.ctx);
    props = fx.sceneManager.getObject(element.id)!.properties as Record<string, unknown>;
    expect(props.height).toBe(25);
    expect(props.tag).toBe('重点');
  });

  it('execute 失败：对象不存在返回 false 且无事件', () => {
    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    const cmd = new ChangePropertyCommand('element_missing', { height: 1 });
    expect(cmd.execute(fx.ctx)).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });
});

describe('ChangeLayerCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute 迁移图层并同步成员索引；undo/redo 完整往返', () => {
    const element = makeObject();
    fx.sceneManager.addObject(element);
    const layer = makeLayer();
    fx.sceneManager.addLayer(layer);

    const cmd = new ChangeLayerCommand(element.id, layer.id);
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(fx.sceneManager.getObject(element.id)!.layerId).toBe(layer.id);
    expect(fx.sceneManager.getLayer(layer.id)!.objectIds).toContain(element.id);

    cmd.undo(fx.ctx);
    expect(fx.sceneManager.getObject(element.id)!.layerId).toBeNull();
    expect(fx.sceneManager.getLayer(layer.id)!.objectIds).not.toContain(element.id);

    cmd.redo(fx.ctx);
    expect(fx.sceneManager.getObject(element.id)!.layerId).toBe(layer.id);
    expect(fx.sceneManager.getLayer(layer.id)!.objectIds).toContain(element.id);
  });

  it('execute 失败：对象不存在返回 false 且无事件', () => {
    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    const cmd = new ChangeLayerCommand('element_missing', 'layer_1');
    expect(cmd.execute(fx.ctx)).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });
});
