/**
 * tests/runtime/services/EditingPinHub.test.ts —— 编辑态 pin 信号聚合器单测
 * （T021.7，D41 §十二）。
 *
 * 覆盖：
 * - 多活源并集每帧派生（live 读：源数据变化下一次 getIds 即反映——零缓存零残留）；
 * - removeSource 撤源；
 * - focus 短窗口：登记期内并入、过期自动清除（注入假时钟）；重复 focus 刷新窗口；
 * - 全空 → 共享空集单例（帧路径零分配——size 0 快进的契约面）；
 * - 四类目标的装配形态语义（selected / transforming ⊆ gizmo target / gizmo attach /
 *   focus 窗口四源并集）。
 */
import { describe, expect, it } from 'vitest';
import { EditingPinHub, FOCUS_PIN_WINDOW_MS } from '../../../src/runtime/services/EditingPinHub';

/** 可拨假时钟（时间窗语义确定性测试——不依赖真实定时） */
function fakeClock() {
  let now = 1000;
  return {
    advance: (ms: number) => {
      now += ms;
    },
    now: () => now,
  };
}

describe('EditingPinHub：活源并集每帧派生', () => {
  it('多源并集 + live 读（源变化下一帧反映，零缓存）', () => {
    const hub = new EditingPinHub();
    const selection = new Set(['a', 'b']);
    const gizmoTargets = ['c'];
    hub.addSource((into) => {
      for (const id of selection) into.add(id);
    });
    hub.addSource((into) => {
      for (const id of gizmoTargets) into.add(id);
    });

    const ids = hub.getIds();
    expect(ids.size).toBe(3);
    expect(ids.has('a')).toBe(true);
    expect(ids.has('b')).toBe(true);
    expect(ids.has('c')).toBe(true);

    // live：选中集清空 + gizmo 换目标 → 下一次派生即反映（无残留）
    selection.clear();
    gizmoTargets.length = 0;
    gizmoTargets.push('d');
    const next = hub.getIds();
    expect(next.size).toBe(1);
    expect(next.has('d')).toBe(true);
  });

  it('removeSource 撤源后不再并入', () => {
    const hub = new EditingPinHub();
    const source = (into: Set<string>) => into.add('x');
    hub.addSource(source);
    expect(hub.getIds().has('x')).toBe(true);
    hub.removeSource(source);
    expect(hub.getIds().has('x')).toBe(false);
  });

  it('全空 → 空集单例（size 0——帧路径快进契约）', () => {
    const hub = new EditingPinHub();
    const empty = hub.getIds();
    expect(empty.size).toBe(0);
    expect(hub.getIds()).toBe(empty); // 同一引用（零分配）
  });

  it('四类目标装配形态：selected ∪ transforming(⊆ gizmo) ∪ gizmo-attach ∪ focus 窗口', () => {
    const clock = fakeClock();
    const hub = new EditingPinHub(clock.now);
    const selected = new Set(['sel-1']);
    const gizmoAttach = ['giz-1', 'giz-2'];
    hub.addSource((into) => {
      for (const id of selected) into.add(id);
    });
    hub.addSource((into) => {
      for (const id of gizmoAttach) into.add(id);
    });
    hub.pinFocus(['focus-1']);

    const ids = hub.getIds();
    expect([...ids].sort()).toEqual(['focus-1', 'giz-1', 'giz-2', 'sel-1']);
  });
});

describe('EditingPinHub：focus 短窗口（时间基）', () => {
  it('窗口内并入、窗口外自动清除', () => {
    const clock = fakeClock();
    const hub = new EditingPinHub(clock.now);
    hub.pinFocus(['f1', 'f2']);
    expect(hub.getIds().has('f1')).toBe(true);
    expect(hub.getIds().has('f2')).toBe(true);

    clock.advance(FOCUS_PIN_WINDOW_MS - 1); // 窗口内最后一刻
    expect(hub.getIds().has('f1')).toBe(true);

    clock.advance(1); // 恰过期
    expect(hub.getIds().has('f1')).toBe(false);
    expect(hub.getIds().has('f2')).toBe(false);
    expect(hub.getIds().size).toBe(0);
  });

  it('重复 focus 刷新窗口（deadline 覆盖）', () => {
    const clock = fakeClock();
    const hub = new EditingPinHub(clock.now);
    hub.pinFocus(['f1']);
    clock.advance(FOCUS_PIN_WINDOW_MS * 0.8);
    hub.pinFocus(['f1']); // 刷新
    clock.advance(FOCUS_PIN_WINDOW_MS * 0.8); // 首窗已过、次窗未过
    expect(hub.getIds().has('f1')).toBe(true);
    clock.advance(FOCUS_PIN_WINDOW_MS * 0.4); // 次窗也过
    expect(hub.getIds().has('f1')).toBe(false);
  });

  it('自定义窗口（毫秒注入）', () => {
    const clock = fakeClock();
    const hub = new EditingPinHub(clock.now);
    hub.pinFocus(['f1'], 100);
    clock.advance(99);
    expect(hub.getIds().has('f1')).toBe(true);
    clock.advance(1);
    expect(hub.getIds().has('f1')).toBe(false);
  });

  it('过期清理是惰性的：未消费不崩溃、再次消费自清', () => {
    const clock = fakeClock();
    const hub = new EditingPinHub(clock.now);
    hub.pinFocus(['f1']);
    clock.advance(FOCUS_PIN_WINDOW_MS * 10); // 长期未消费
    expect(hub.getIds().size).toBe(0); // 无异常、自清
  });
});
