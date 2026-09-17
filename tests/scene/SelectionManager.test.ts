import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { SelectionManager } from '../../src/scene/SelectionManager';

describe('SelectionManager', () => {
  let bus: EventBus;
  let selection: SelectionManager;

  beforeEach(() => {
    bus = new EventBus();
    selection = new SelectionManager(bus);
  });

  it('select 单选替换原有选择并发事件', () => {
    const handler = vi.fn();
    bus.on('selection:changed', handler);
    selection.select('element_1');
    selection.select('element_2');
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenLastCalledWith({ selectedIds: ['element_2'] });
    expect(selection.getSelectedIds()).toEqual(['element_2']);
  });

  it('add 追加不重复的 id，重复 add 不发事件', () => {
    const handler = vi.fn();
    bus.on('selection:changed', handler);
    selection.select('element_1');
    selection.add('element_2');
    expect(selection.getSelectedIds()).toEqual(['element_1', 'element_2']);
    expect(handler).toHaveBeenCalledTimes(2);
    selection.add('element_2');
    expect(handler).toHaveBeenCalledTimes(2);
    expect(selection.getSelectedIds()).toEqual(['element_1', 'element_2']);
  });

  it('remove 移除已选 id，未选中时为无操作不发事件', () => {
    selection.selectMany(['element_1', 'element_2']);
    const handler = vi.fn();
    bus.on('selection:changed', handler);
    selection.remove('element_missing');
    expect(handler).not.toHaveBeenCalled();
    selection.remove('element_1');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ selectedIds: ['element_2'] });
    expect(selection.getSelectedIds()).toEqual(['element_2']);
  });

  it('selectMany 整体替换并去重（保序）', () => {
    selection.selectMany(['element_1', 'element_2']);
    selection.selectMany(['element_3', 'element_1', 'element_3']);
    expect(selection.getSelectedIds()).toEqual(['element_3', 'element_1']);
  });

  it('clear 清空并发事件；空选择时 clear 不发事件', () => {
    const handler = vi.fn();
    bus.on('selection:changed', handler);
    selection.clear();
    expect(handler).not.toHaveBeenCalled();
    selection.select('element_1');
    selection.clear();
    expect(handler).toHaveBeenCalledTimes(2); // select 一次 + clear 一次
    expect(handler).toHaveBeenLastCalledWith({ selectedIds: [] });
    expect(selection.getSelectedIds()).toEqual([]);
  });

  it('isSelected 反映当前选择状态', () => {
    selection.select('element_1');
    expect(selection.isSelected('element_1')).toBe(true);
    expect(selection.isSelected('element_2')).toBe(false);
  });

  it('重复 select 同一 id 不发事件（无变化）', () => {
    selection.select('element_1');
    const handler = vi.fn();
    bus.on('selection:changed', handler);
    selection.select('element_1');
    expect(handler).not.toHaveBeenCalled();
  });

  it('getSelectedIds 返回副本，外部修改不影响内部状态', () => {
    selection.selectMany(['element_1', 'element_2']);
    const ids = selection.getSelectedIds();
    ids.push('element_hacked');
    ids.pop();
    ids.pop();
    expect(selection.getSelectedIds()).toEqual(['element_1', 'element_2']);
  });

  it('selectMany 顺序不同视为变更并发事件', () => {
    selection.selectMany(['element_1', 'element_2']);
    const handler = vi.fn();
    bus.on('selection:changed', handler);
    selection.selectMany(['element_2', 'element_1']);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ selectedIds: ['element_2', 'element_1'] });
  });
});
