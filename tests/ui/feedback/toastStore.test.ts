/**
 * tests/ui/feedback/toastStore.test.ts —— Toast 队列 reducer 测试（T5.8，先测后码）。
 *
 * 需求第三十四章：轻量 Toast 反馈（替代顶部 notice 条）——TTL 4.5s 自动消失、
 * 上限 3 条（超出挤掉最旧）、dismiss(id) 手动关闭、tick(now) 驱逐过期。
 * 纯 reducer + 常量契约：node 环境零 React / 零 DOM。
 */
import { describe, expect, it } from 'vitest';
import {
  TOAST_MAX_VISIBLE,
  TOAST_TTL_MS,
  toastReducer,
} from '../../../src/ui/feedback/toastStore';
import type { ToastAction, ToastItem } from '../../../src/ui/feedback/toastStore';

const T0 = 1_000_000;

function push(kind: ToastItem['kind'], text: string, now = T0): ToastAction {
  return { type: 'push', kind, text, now };
}

describe('toastReducer 契约常量', () => {
  it('TTL 4.5s / 上限 3 条', () => {
    expect(TOAST_TTL_MS).toBe(4500);
    expect(TOAST_MAX_VISIBLE).toBe(3);
  });
});

describe('toastReducer：push', () => {
  it('入队分配 id 与过期时刻（now + TTL），保留 kind 与文本', () => {
    const state = toastReducer([], push('info', '已保存', T0));
    expect(state).toHaveLength(1);
    expect(state[0]!.kind).toBe('info');
    expect(state[0]!.text).toBe('已保存');
    expect(state[0]!.expiresAt).toBe(T0 + TOAST_TTL_MS);
    expect(typeof state[0]!.id).toBe('string');
  });

  it('多条依次入队（后进在尾）', () => {
    let state: ToastItem[] = [];
    state = toastReducer(state, push('info', 'a'));
    state = toastReducer(state, push('error', 'b'));
    state = toastReducer(state, push('info', 'c'));
    expect(state.map((t) => t.text)).toEqual(['a', 'b', 'c']);
    expect(state.map((t) => t.kind)).toEqual(['info', 'error', 'info']);
  });

  it('超出上限：挤掉最旧（先进先出）', () => {
    let state: ToastItem[] = [];
    state = toastReducer(state, push('info', 'a', T0));
    state = toastReducer(state, push('info', 'b', T0 + 100));
    state = toastReducer(state, push('info', 'c', T0 + 200));
    state = toastReducer(state, push('info', 'd', T0 + 300));

    expect(state.map((t) => t.text)).toEqual(['b', 'c', 'd']);
    expect(state).toHaveLength(3);
  });

  it('id 单调不重复（可作 React key 与 dismiss 句柄）', () => {
    let state: ToastItem[] = [];
    state = toastReducer(state, push('info', 'a'));
    state = toastReducer(state, push('info', 'b'));
    expect(state[0]!.id).not.toBe(state[1]!.id);
  });
});

describe('toastReducer：dismiss', () => {
  it('按 id 移除指定条目，其余保持', () => {
    let state: ToastItem[] = [];
    state = toastReducer(state, push('info', 'a'));
    state = toastReducer(state, push('error', 'b'));
    const target = state[0]!.id;

    state = toastReducer(state, { type: 'dismiss', id: target });
    expect(state.map((t) => t.text)).toEqual(['b']);
  });

  it('未知 id 安全无操作', () => {
    let state = toastReducer([], push('info', 'a'));
    state = toastReducer(state, { type: 'dismiss', id: 'toast_unknown' });
    expect(state).toHaveLength(1);
  });
});

describe('toastReducer：tick（过期驱逐）', () => {
  it('now ≥ expiresAt 的条目被驱逐，未过期保留', () => {
    let state: ToastItem[] = [];
    state = toastReducer(state, push('info', 'old-a', T0)); // 过期 T0+4500
    state = toastReducer(state, push('info', 'old-b', T0 + 100)); // 过期 T0+4600
    state = toastReducer(state, push('info', 'fresh', T0 + 4000)); // 过期 T0+8500

    state = toastReducer(state, { type: 'tick', now: T0 + 4600 });
    expect(state.map((t) => t.text)).toEqual(['fresh']);
  });

  it('过期边界：恰在 expiresAt 时刻驱逐（≥ 判定）', () => {
    let state = toastReducer([], push('info', 'a', T0));
    state = toastReducer(state, { type: 'tick', now: T0 + TOAST_TTL_MS });
    expect(state).toHaveLength(0);
  });

  it('未到过期时刻（now < expiresAt）保留', () => {
    let state = toastReducer([], push('info', 'a', T0));
    state = toastReducer(state, { type: 'tick', now: T0 + TOAST_TTL_MS - 1 });
    expect(state).toHaveLength(1);
  });

  it('全过期 → 空队列（不残留哨兵）', () => {
    let state: ToastItem[] = [];
    state = toastReducer(state, push('info', 'a', T0));
    state = toastReducer(state, push('error', 'b', T0 + 50));
    state = toastReducer(state, { type: 'tick', now: T0 + TOAST_TTL_MS + 100 });
    expect(state).toEqual([]);
  });
});

describe('toastReducer：不可变性', () => {
  it('返回新数组引用（原状态不被原地修改）', () => {
    const before: ToastItem[] = [];
    const after = toastReducer(before, push('info', 'a', T0));
    expect(before).toHaveLength(0);
    expect(after).not.toBe(before);
  });
});
