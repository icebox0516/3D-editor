import { describe, expect, it } from 'vitest';
import { CommandRegistry } from '../../src/registries/CommandRegistry';

describe('CommandRegistry', () => {
  it('register 后 create 调用工厂并透传 data', () => {
    const registry = new CommandRegistry();
    registry.register('create_object', (data) => ({
      id: 'cmd_1',
      name: `新建-${(data as { label: string }).label}`,
    }));
    const cmd = registry.create('create_object', { label: '建筑' });
    expect(cmd.id).toBe('cmd_1');
    expect(cmd.name).toBe('新建-建筑');
  });

  it('create 未注册的 type 抛错', () => {
    const registry = new CommandRegistry();
    expect(() => registry.create('nope', {})).toThrow(/nope/);
  });

  it('重复注册同 type 抛错', () => {
    const registry = new CommandRegistry();
    registry.register('transform', () => ({ id: 'cmd_1', name: '变换' }));
    expect(() => registry.register('transform', () => ({ id: 'cmd_2', name: '变换2' }))).toThrow(
      /transform/,
    );
  });

  it('register 拒绝非法 type 或非函数工厂', () => {
    const registry = new CommandRegistry();
    expect(() => registry.register('', () => ({ id: 'cmd_1', name: 'x' }))).toThrow();
    expect(() =>
      registry.register('bad', undefined as unknown as () => { id: string; name: string }),
    ).toThrow();
  });
});
