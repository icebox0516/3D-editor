import { describe, expect, it } from 'vitest';
import { clamp, deepClone, degToRad } from '../../src/core/utils';

describe('deepClone', () => {
  it('深克隆嵌套对象：修改副本不影响原对象', () => {
    const original = { a: 1, nested: { list: [1, 2, { deep: true }], flag: true } };
    const copy = deepClone(original);
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.nested).not.toBe(original.nested);

    copy.a = 99;
    copy.nested.flag = false;
    copy.nested.list.push(4);
    (copy.nested.list[2] as { deep: boolean }).deep = false;

    expect(original).toEqual({ a: 1, nested: { list: [1, 2, { deep: true }], flag: true } });
  });

  it('深克隆数组：副本变更不影响原数组', () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const copy = deepClone(original);
    copy[0].push(9);
    expect(original[0]).toEqual([1, 2]);
    expect(copy[0]).toEqual([1, 2, 9]);
  });

  it('支持循环引用（克隆后自引用指向副本自身）', () => {
    const original: Record<string, unknown> = { name: 'root' };
    original.self = original;
    const copy = deepClone(original);
    expect(copy.self).toBe(copy);
    expect(copy.self).not.toBe(original);
    expect(copy.name).toBe('root');
  });

  it('按值克隆 Date / Map / Set', () => {
    const original = {
      date: new Date(Date.UTC(2026, 0, 1)),
      map: new Map([['k', { v: 1 }]]),
      set: new Set([1, 2]),
    };
    const copy = deepClone(original);
    expect(copy.date).toEqual(original.date);
    expect(copy.date).not.toBe(original.date);

    copy.date.setTime(Date.UTC(2027, 5, 1));
    copy.map.set('k', { v: 2 });
    copy.set.add(3);
    expect(original.date.getTime()).toBe(Date.UTC(2026, 0, 1));
    expect(original.map.get('k')).toEqual({ v: 1 });
    expect(original.set.has(3)).toBe(false);
  });

  it('原始值按原样返回', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('x')).toBe('x');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBeNull();
    expect(deepClone(undefined)).toBeUndefined();
  });
});

describe('clamp', () => {
  it('低于下界时钳制到 min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it('高于上界时钳制到 max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
  it('区间内的值保持不变（含边界）', () => {
    expect(clamp(7, 0, 10)).toBe(7);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('degToRad', () => {
  it('将角度转换为弧度', () => {
    expect(degToRad(0)).toBe(0);
    expect(degToRad(180)).toBeCloseTo(Math.PI, 12);
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2, 12);
    expect(degToRad(-45)).toBeCloseTo(-Math.PI / 4, 12);
  });
});
