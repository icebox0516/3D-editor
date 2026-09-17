import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';

describe('EventBus', () => {
  it('emit 将类型化负载投递给订阅者', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('object:created', handler);
    bus.emit('object:created', { objectId: 'element_1' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ objectId: 'element_1' });
  });

  it('同一事件支持多个订阅者且全部收到', () => {
    const bus = new EventBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('selection:changed', a);
    bus.on('selection:changed', b);
    bus.emit('selection:changed', { selectedIds: ['element_1', 'element_2'] });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledWith({ selectedIds: ['element_1', 'element_2'] });
  });

  it('on 返回退订函数，调用后不再收事件', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const off = bus.on('history:changed', handler);
    off();
    bus.emit('history:changed', { canUndo: true, canRedo: false });
    expect(handler).not.toHaveBeenCalled();
  });

  it('off 之后不再收事件', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('scene:changed', handler);
    bus.emit('scene:changed', { source: 'init' });
    bus.off('scene:changed', handler);
    bus.emit('scene:changed', { source: 'command' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenLastCalledWith({ source: 'init' });
  });

  it('off 未注册的处理函数或空事件为幂等操作', () => {
    const bus = new EventBus();
    expect(() => bus.off('scene:changed', () => {})).not.toThrow();
    expect(() => bus.off('style:changed', vi.fn())).not.toThrow();
  });

  it('emit 无订阅者的事件不抛错', () => {
    const bus = new EventBus();
    expect(() => bus.emit('asset:registered', { assetId: 'asset_1' })).not.toThrow();
  });

  it('不同事件类型相互隔离', () => {
    const bus = new EventBus();
    const created = vi.fn();
    const removed = vi.fn();
    bus.on('object:created', created);
    bus.on('object:removed', removed);
    bus.emit('object:created', { objectId: 'element_1' });
    expect(created).toHaveBeenCalledTimes(1);
    expect(removed).not.toHaveBeenCalled();
  });

  it('emit 期间退订不影响本轮后续分发，但下轮生效', () => {
    const bus = new EventBus();
    const calls: string[] = [];
    bus.on('tool:changed', () => calls.push('a'));
    const offB = bus.on('tool:changed', () => calls.push('b'));
    bus.on('tool:changed', () => {
      offB();
      calls.push('c');
    });
    bus.emit('tool:changed', { toolId: 'select' });
    expect(calls).toEqual(['a', 'b', 'c']);
    bus.emit('tool:changed', { toolId: null });
    expect(calls).toEqual(['a', 'b', 'c', 'a', 'c']);
  });
});
