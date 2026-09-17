import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { Layer } from '../../src/scene/Layer';
import type { SceneObject } from '../../src/scene/SceneObject';
import { SceneManager } from '../../src/scene/SceneManager';

/** 构造一个完整合法的 SceneObject 夹具（可用 overrides 覆盖任意字段） */
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

describe('SceneManager', () => {
  let bus: EventBus;
  let manager: SceneManager;

  beforeEach(() => {
    bus = new EventBus();
    manager = new SceneManager(bus);
  });

  describe('addObject / getObject / getObjects', () => {
    it('添加后可按 id 取回同一对象引用', () => {
      const obj = makeObject();
      manager.addObject(obj);
      expect(manager.getObject(obj.id)).toBe(obj);
    });

    it('addObject 依次发出 object:created 与 scene:changed（各恰好一次）', () => {
      const created = vi.fn();
      const changed = vi.fn();
      bus.on('object:created', created);
      bus.on('scene:changed', changed);
      const obj = makeObject();
      manager.addObject(obj);
      expect(created).toHaveBeenCalledTimes(1);
      expect(created).toHaveBeenCalledWith({ objectId: obj.id });
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith({ source: 'addObject' });
    });

    it('重复 id 的 addObject 抛错且不发出任何事件', () => {
      const obj = makeObject({ id: 'element_dup' });
      manager.addObject(obj);
      const created = vi.fn();
      const changed = vi.fn();
      bus.on('object:created', created);
      bus.on('scene:changed', changed);
      expect(() => manager.addObject(makeObject({ id: 'element_dup' }))).toThrow();
      expect(created).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
      expect(manager.getObjects()).toHaveLength(1);
    });

    it('getObjects 返回全部对象的快照数组（外部改数组不影响内部）', () => {
      const a = makeObject();
      const b = makeObject();
      manager.addObject(a);
      manager.addObject(b);
      const all = manager.getObjects();
      expect(all).toHaveLength(2);
      all.pop();
      expect(manager.getObjects()).toHaveLength(2);
    });

    it('getObjects 支持谓词过滤', () => {
      manager.addObject(makeObject({ name: '建筑', type: 'building' }));
      manager.addObject(makeObject({ name: '绿地', type: 'green' }));
      const greens = manager.getObjects((o) => o.type === 'green');
      expect(greens).toHaveLength(1);
      expect(greens[0]!.name).toBe('绿地');
    });

    it('getObject 未命中返回 undefined', () => {
      expect(manager.getObject('element_missing')).toBeUndefined();
    });
  });

  describe('removeObject', () => {
    it('移除后取不回、返回被移除对象', () => {
      const obj = makeObject();
      manager.addObject(obj);
      const removed = manager.removeObject(obj.id);
      expect(removed).toBe(obj);
      expect(manager.getObject(obj.id)).toBeUndefined();
    });

    it('removeObject 发出 object:removed 与 scene:changed 各恰好一次', () => {
      const obj = makeObject();
      manager.addObject(obj);
      const removedEvent = vi.fn();
      const changed = vi.fn();
      bus.on('object:removed', removedEvent);
      bus.on('scene:changed', changed);
      manager.removeObject(obj.id);
      expect(removedEvent).toHaveBeenCalledTimes(1);
      expect(removedEvent).toHaveBeenCalledWith({ objectId: obj.id });
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith({ source: 'removeObject' });
    });

    it('移除不存在的 id 返回 undefined 且不发事件', () => {
      const removedEvent = vi.fn();
      const changed = vi.fn();
      bus.on('object:removed', removedEvent);
      bus.on('scene:changed', changed);
      expect(manager.removeObject('element_missing')).toBeUndefined();
      expect(removedEvent).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('updateObject', () => {
    it('浅合并 patch 并发出 object:updated(keys) 与 scene:changed 各一次', () => {
      const obj = makeObject({ name: '旧名' });
      manager.addObject(obj);
      const updated = vi.fn();
      const changed = vi.fn();
      bus.on('object:updated', updated);
      bus.on('scene:changed', changed);
      manager.updateObject(obj.id, { name: '新名', locked: true });
      expect(obj.name).toBe('新名');
      expect(obj.locked).toBe(true);
      expect(updated).toHaveBeenCalledTimes(1);
      expect(updated).toHaveBeenCalledWith({ objectId: obj.id, keys: ['name', 'locked'] });
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith({ source: 'updateObject' });
    });

    it('patch 携带不同 id 时抛错且不修改对象、不发事件', () => {
      const obj = makeObject();
      manager.addObject(obj);
      const updated = vi.fn();
      const changed = vi.fn();
      bus.on('object:updated', updated);
      bus.on('scene:changed', changed);
      expect(() => manager.updateObject(obj.id, { id: 'element_other', name: 'x' })).toThrow();
      expect(obj.id).toBe(obj.id);
      expect(obj.name).toBe('对象');
      expect(updated).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
    });

    it('patch 携带与当前相同的 id 视为无变化，不抛错', () => {
      const obj = makeObject();
      manager.addObject(obj);
      expect(() => manager.updateObject(obj.id, { id: obj.id, name: '改名' })).not.toThrow();
      expect(obj.name).toBe('改名');
    });

    it('更新不存在的 id 静默忽略、不发事件', () => {
      const updated = vi.fn();
      const changed = vi.fn();
      bus.on('object:updated', updated);
      bus.on('scene:changed', changed);
      expect(() => manager.updateObject('element_missing', { name: 'x' })).not.toThrow();
      expect(updated).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
    });

    it('空 patch 不发任何事件', () => {
      const obj = makeObject();
      manager.addObject(obj);
      const updated = vi.fn();
      const changed = vi.fn();
      bus.on('object:updated', updated);
      bus.on('scene:changed', changed);
      manager.updateObject(obj.id, {});
      expect(updated).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('图层（Layer）', () => {
    it('addLayer/getLayer/getLayers 基本增查', () => {
      const layer = makeLayer({ name: '建筑层' });
      manager.addLayer(layer);
      expect(manager.getLayer(layer.id)).toBe(layer);
      expect(manager.getLayers()).toEqual([layer]);
      expect(manager.getLayer('layer_missing')).toBeUndefined();
    });

    it('对象加入时若 layerId 已存在图层，则自动登记进 layer.objectIds', () => {
      const layer = makeLayer();
      manager.addLayer(layer);
      const obj = makeObject({ layerId: layer.id });
      manager.addObject(obj);
      expect(layer.objectIds).toContain(obj.id);
    });

    it('updateObject 变更 layerId 时在两图层的 objectIds 间迁移', () => {
      const l1 = makeLayer();
      const l2 = makeLayer();
      manager.addLayer(l1);
      manager.addLayer(l2);
      const obj = makeObject({ layerId: l1.id });
      manager.addObject(obj);
      expect(l1.objectIds).toEqual([obj.id]);

      manager.updateObject(obj.id, { layerId: l2.id });
      expect(l1.objectIds).toEqual([]);
      expect(l2.objectIds).toEqual([obj.id]);
    });

    it('removeObject 时从所属图层 objectIds 中移除', () => {
      const layer = makeLayer();
      manager.addLayer(layer);
      const obj = makeObject({ layerId: layer.id });
      manager.addObject(obj);
      manager.removeObject(obj.id);
      expect(layer.objectIds).toEqual([]);
    });

    it('updateLayer 发出 layer:updated 与 scene:changed 各一次，objectIds 派生字段不可直改', () => {
      const layer = makeLayer({ visible: true, opacity: 1 });
      manager.addLayer(layer);
      const layerEvent = vi.fn();
      const changed = vi.fn();
      bus.on('layer:updated', layerEvent);
      bus.on('scene:changed', changed);
      manager.updateLayer(layer.id, { visible: false, opacity: 0.5, objectIds: ['element_fake'] });
      expect(layer.visible).toBe(false);
      expect(layer.opacity).toBe(0.5);
      expect(layer.objectIds).toEqual([]); // objectIds 由成员关系派生，patch 中被忽略
      expect(layerEvent).toHaveBeenCalledTimes(1);
      expect(layerEvent).toHaveBeenCalledWith({ layerId: layer.id });
      expect(changed).toHaveBeenCalledTimes(1);
    });

    it('updateLayer 携带不同 id 抛错', () => {
      const layer = makeLayer();
      manager.addLayer(layer);
      expect(() => manager.updateLayer(layer.id, { id: 'layer_other' })).toThrow();
    });

    it('removeLayer 后成员对象 layerId 置空，且只发一次 scene:changed', () => {
      const layer = makeLayer();
      manager.addLayer(layer);
      const obj = makeObject({ layerId: layer.id });
      manager.addObject(obj);
      const removed = vi.fn();
      const changed = vi.fn();
      bus.on('object:removed', removed);
      bus.on('scene:changed', changed);
      const returned = manager.removeLayer(layer.id);
      expect(returned).toBe(layer);
      expect(obj.layerId).toBeNull();
      expect(manager.getLayer(layer.id)).toBeUndefined();
      expect(manager.getObject(obj.id)).toBe(obj); // 对象本体保留
      expect(removed).not.toHaveBeenCalled();
      expect(changed).toHaveBeenCalledTimes(1);
    });

    it('先加对象后加图层时，addLayer 回填 objectIds', () => {
      const layerId = createId('layer');
      const obj = makeObject({ layerId });
      manager.addObject(obj); // 图层尚不存在
      const layer = makeLayer({ id: layerId });
      manager.addLayer(layer);
      expect(layer.objectIds).toEqual([obj.id]);
    });
  });

  describe('clear', () => {
    it('清空全部对象与图层，scene:changed 恰好一次', () => {
      const layer = makeLayer();
      manager.addLayer(layer);
      manager.addObject(makeObject({ layerId: layer.id }));
      manager.addObject(makeObject());
      const changed = vi.fn();
      bus.on('scene:changed', changed);
      manager.clear();
      expect(manager.getObjects()).toEqual([]);
      expect(manager.getLayers()).toEqual([]);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith({ source: 'clear' });
    });
  });
});
