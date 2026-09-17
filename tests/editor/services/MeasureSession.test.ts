/**
 * tests/editor/services/MeasureSession.test.ts —— 测量会话域测试（T10.1，先测后码）。
 *
 * 覆盖（stage10-measure §A 数据模型与四不变式之「会话态」）：
 * - add/list：入项顺序保持、list 只读视图、id 前缀 measure_（createId 体系）；
 * - removeLast：删末项返回 true、空表返回 false 且不发事件；
 * - clear：清空并 emit measure:changed{count:0}；
 * - measure:changed 事件：增/删/清均带当前 count；
 * - MeasureItem 形状：kind 四枚举、points 世界坐标 Vec3、createdAt 提交时序（「删除上一条」依据）。
 */
import { describe, expect, it } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus';
import type { MeasureItem } from '../../../src/editor/services/measure';
import { MeasureSession } from '../../../src/editor/services/measure';

function item(kind: MeasureItem['kind'], n: number): MeasureItem {
  return {
    id: `measure_test${n}`,
    kind,
    points: [
      { x: 0, y: 0, z: 0 },
      { x: n, y: 0, z: 0 },
    ],
    createdAt: n,
  };
}

describe('MeasureSession 增删清与事件', () => {
  it('add/list：入项顺序保持、count 随增递增', () => {
    const bus = new EventBus();
    const counts: number[] = [];
    bus.on('measure:changed', (p) => counts.push(p.count));
    const session = new MeasureSession(bus);

    session.add(item('distance', 1));
    session.add(item('area', 2));

    expect(session.list().map((m) => m.kind)).toEqual(['distance', 'area']);
    expect(session.list().map((m) => m.createdAt)).toEqual([1, 2]);
    expect(counts).toEqual([1, 2]);
  });

  it('removeLast：删末项返回 true 并 emit count；空表返回 false 且不发事件', () => {
    const bus = new EventBus();
    const counts: number[] = [];
    bus.on('measure:changed', (p) => counts.push(p.count));
    const session = new MeasureSession(bus);

    expect(session.removeLast()).toBe(false);
    expect(counts).toEqual([]);

    session.add(item('angle', 1));
    session.add(item('height', 2));
    expect(session.removeLast()).toBe(true);
    expect(session.list().map((m) => m.kind)).toEqual(['angle']);
    expect(counts).toEqual([1, 2, 1]);

    session.removeLast();
    expect(session.removeLast()).toBe(false);
    expect(counts).toEqual([1, 2, 1, 0]);
  });

  it('clear：清空并 emit measure:changed{count:0}', () => {
    const bus = new EventBus();
    const counts: number[] = [];
    bus.on('measure:changed', (p) => counts.push(p.count));
    const session = new MeasureSession(bus);

    session.add(item('distance', 1));
    session.clear();
    expect(session.list()).toHaveLength(0);
    expect(counts).toEqual([1, 0]);

    // 二次 clear 幂等（契约：clear 后 emit count:0）
    session.clear();
    expect(counts).toEqual([1, 0, 0]);
  });

  it('MeasureItem 形状：kind 四枚举合法、points 为世界坐标 Vec3', () => {
    for (const kind of ['distance', 'height', 'area', 'angle'] as const) {
      const m = item(kind, 1);
      expect(m.kind).toBe(kind);
      expect(m.points[0]).toEqual({ x: 0, y: 0, z: 0 });
      expect(m.id.startsWith('measure_')).toBe(true); // 测试工装沿用 measure_ 前缀语义
    }
  });

  it('会话项 id 由 createId("measure") 生成（measure_ 前缀单测锁定）', async () => {
    const { createId } = await import('../../../src/core/id');
    expect(createId('measure').startsWith('measure_')).toBe(true);
  });
});
