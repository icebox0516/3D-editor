import { describe, expect, it } from 'vitest';
import { ToolRegistry } from '../../src/registries/ToolRegistry';

const selectTool = { id: 'tool_select', name: '选择工具' } as const;
const drawTool = { id: 'tool_draw_polygon', name: '面绘制工具' } as const;

describe('ToolRegistry', () => {
  it('register 后 get/list 正确', () => {
    const registry = new ToolRegistry();
    registry.register(selectTool);
    registry.register(drawTool);
    expect(registry.get('tool_select')).toBe(selectTool);
    expect(registry.list().map((t) => t.id)).toEqual(['tool_select', 'tool_draw_polygon']);
  });

  it('重复注册同 id 抛错', () => {
    const registry = new ToolRegistry();
    registry.register(selectTool);
    expect(() => registry.register({ ...selectTool })).toThrow(/tool_select/);
  });

  it('unregister 后 get 返回 undefined', () => {
    const registry = new ToolRegistry();
    registry.register(selectTool);
    registry.unregister('tool_select');
    expect(registry.get('tool_select')).toBeUndefined();
    expect(registry.list()).toHaveLength(0);
  });

  it('get 未注册 id 返回 undefined', () => {
    const registry = new ToolRegistry();
    expect(registry.get('tool_none')).toBeUndefined();
  });

  it('register 拒绝缺失 id 的非法工具', () => {
    const registry = new ToolRegistry();
    expect(() => registry.register({ id: '', name: 'x' })).toThrow();
  });
});
