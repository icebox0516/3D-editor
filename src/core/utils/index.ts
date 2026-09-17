/**
 * core/utils —— 基础工具函数。
 *
 * 职责：deepClone（结构化克隆语义的深拷贝）、clamp（数值钳制）、degToRad（角度转弧度）。
 * 边界：通用无业务语义的小工具；core 层零依赖（不调用浏览器/Node 专有 API，手工实现克隆）。
 */

/**
 * 深拷贝（结构化克隆语义）：
 * - 递归克隆普通对象、数组、Map、Set，按值克隆 Date / RegExp；
 * - 支持循环引用（WeakMap 记忆已克隆对象，克隆后的自引用指向副本自身）；
 * - 原始值原样返回；函数与 Symbol 键按原样携带（场景数据不应包含）。
 */
export function deepClone<T>(value: T): T {
  return clone(value, new WeakMap<object, unknown>()) as T;
}

function clone(value: unknown, cache: WeakMap<object, unknown>): unknown {
  if (value === null || typeof value !== 'object') return value;

  if (cache.has(value)) return cache.get(value);

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (Array.isArray(value)) {
    const arr: unknown[] = [];
    cache.set(value, arr);
    for (let i = 0; i < value.length; i++) arr[i] = clone(value[i], cache);
    return arr;
  }

  if (value instanceof Map) {
    const map = new Map<unknown, unknown>();
    cache.set(value, map);
    for (const [key, val] of value) map.set(clone(key, cache), clone(val, cache));
    return map;
  }

  if (value instanceof Set) {
    const set = new Set<unknown>();
    cache.set(value, set);
    for (const item of value) set.add(clone(item, cache));
    return set;
  }

  // 普通对象：结构化克隆语义不保留自定义原型，按普通对象处理
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  cache.set(value, out);
  for (const key of Object.keys(source)) {
    out[key] = clone(source[key], cache);
  }
  return out;
}

/** 将 value 钳制到 [min, max]（min > max 时结果为 max，调用方需自行保证区间有效） */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 角度 → 弧度（Transform.rotation 等契约一律使用弧度） */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
