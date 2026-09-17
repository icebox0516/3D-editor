import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { SceneObject } from '../../src/scene/SceneObject';
import { SceneManager } from '../../src/scene/SceneManager';
import { SceneSync } from '../../src/runtime/SceneSync';
import type { SceneSyncHandlers } from '../../src/runtime/SceneSync';

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

describe('SceneSync（事件驱动同步纯逻辑）', () => {
  let bus: EventBus;
  let sceneManager: SceneManager;
  let handlers: SceneSyncHandlers & {
    attach: ReturnType<typeof vi.fn<(obj: SceneObject) => void>>;
    update: ReturnType<typeof vi.fn<(id: string, keys: string[]) => void>>;
    detach: ReturnType<typeof vi.fn<(id: string) => void>>;
    resyncAll: ReturnType<typeof vi.fn<() => void>>;
    onLayerUpdated: ReturnType<typeof vi.fn<(layerId: string) => void>>;
  };
  let sync: SceneSync;

  beforeEach(() => {
    bus = new EventBus();
    sceneManager = new SceneManager(bus);
    handlers = {
      attach: vi.fn<(obj: SceneObject) => void>(),
      update: vi.fn<(id: string, keys: string[]) => void>(),
      detach: vi.fn<(id: string) => void>(),
      resyncAll: vi.fn<() => void>(),
      onLayerUpdated: vi.fn<(layerId: string) => void>(),
    };
    sync = new SceneSync(bus, sceneManager, handlers);
  });

  it('start 前 emits 不触发任何处理器', () => {
    sceneManager.addObject(makeObject());
    expect(handlers.attach).not.toHaveBeenCalled();
  });

  it('object:created → attach(完整 SceneObject)', () => {
    sync.start();
    const obj = makeObject();
    sceneManager.addObject(obj);
    expect(handlers.attach).toHaveBeenCalledTimes(1);
    expect(handlers.attach).toHaveBeenCalledWith(obj);
  });

  it('object:updated → update(id, keys)', () => {
    sync.start();
    const obj = makeObject();
    sceneManager.addObject(obj); // created 事件同步触发 attach
    sceneManager.updateObject(obj.id, { name: '改名' });
    expect(handlers.update).toHaveBeenCalledWith(obj.id, ['name']);
  });

  it('object:removed → detach(id)', () => {
    sync.start();
    const obj = makeObject();
    sceneManager.addObject(obj);
    sceneManager.removeObject(obj.id);
    expect(handlers.detach).toHaveBeenCalledWith(obj.id);
  });

  it('scene:changed(source=clear) → resyncAll；普通 source 不触发', () => {
    sync.start();
    const obj = makeObject();
    sceneManager.addObject(obj); // source=addObject → 不触发 resyncAll
    expect(handlers.resyncAll).not.toHaveBeenCalled();

    sceneManager.clear();
    expect(handlers.resyncAll).toHaveBeenCalledTimes(1);
  });

  it('layer:updated → onLayerUpdated(layerId)', () => {
    sync.start();
    sceneManager.addLayer({
      id: createId('layer'),
      name: '图层',
      visible: true,
      locked: false,
      opacity: 1,
      order: 0,
      objectIds: [],
    });
    // addLayer 只发 scene:changed；updateLayer 才发 layer:updated
    const layer = sceneManager.getLayers()[0];
    sceneManager.updateLayer(layer.id, { visible: false });
    expect(handlers.onLayerUpdated).toHaveBeenCalledWith(layer.id);
  });

  it('stop 后退订，不再接收事件（幂等）', () => {
    sync.start();
    sync.stop();
    sync.stop(); // 幂等
    sceneManager.addObject(makeObject());
    expect(handlers.attach).not.toHaveBeenCalled();
  });

  it('resync 用 sceneManager 当前全量对象驱动 attach（重建视图）', () => {
    sync.start();
    const a = makeObject();
    const b = makeObject();
    sceneManager.addObject(a);
    sceneManager.addObject(b);
    handlers.attach.mockClear();

    sync.resync();

    expect(handlers.detach).toHaveBeenCalledTimes(2); // 先清空旧视图
    expect(handlers.attach).toHaveBeenCalledTimes(2);
    const attached = handlers.attach.mock.calls.map((c) => c[0] as SceneObject);
    expect(attached.map((o) => o.id).sort()).toEqual([a.id, b.id].sort());
  });
});
