import { describe, expect, it } from 'vitest';
import { createId } from '../../src/core/id';

describe('createId', () => {
  it('携带给定前缀且仅含 base36 字符集', () => {
    const id = createId('scene');
    expect(id.startsWith('scene_')).toBe(true);
    expect(id).toMatch(/^scene_[0-9a-z]+$/);
  });

  it('支持全部业务前缀（CONTRACTS.md #7）', () => {
    const prefixes = ['scene', 'element', 'layer', 'style', 'asset', 'model', 'cmd', 'tool'];
    for (const prefix of prefixes) {
      expect(createId(prefix).startsWith(`${prefix}_`)).toBe(true);
    }
  });

  it('连发 1000 次无碰撞', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const id = createId('element');
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
    expect(ids.size).toBe(1000);
  });

  it('不同前缀生成互不相同的 ID', () => {
    expect(createId('scene')).not.toBe(createId('layer'));
  });
});
