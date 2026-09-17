/**
 * DrawSession 单元测试 —— 绘制会话纯逻辑。
 * 覆盖：临时状态管理（addPoint/moveCursor/cancel/state 快照）、三类几何 complete 规则
 * （Point 1 点；LineString ≥2 点；Polygon ≥3 点 + 首环自动闭合 + validateGeometry 拦截）、
 * 非法输入抛 DrawValidationError（含 ValidationError 列表）。
 * 纯逻辑：零 three、零 DOM、零 SceneManager。
 */
import { describe, expect, it } from 'vitest';
import { DrawSession } from '../../../src/editor/tools/draw/DrawSession';
import { DrawValidationError } from '../../../src/editor/tools/draw/DrawValidationError';
import type { Vec2 } from '../../../src/core/types';
import { isPolygonGeometry } from '../../../src/domain/geometry';
import type { ValidationError } from '../../../src/domain/validate/validateGeometry';

const p = (x: number, y: number): Vec2 => ({ x, y });

/** 断言 fn 抛 DrawValidationError 且错误列表含指定 code */
function expectDrawError(fn: () => void, code: ValidationError['code']): DrawValidationError {
  try {
    fn();
    expect.unreachable('应当抛出 DrawValidationError');
  } catch (e) {
    expect(e).toBeInstanceOf(DrawValidationError);
    const err = e as DrawValidationError;
    expect(err.code).toBe(code);
    expect(err.errors.length).toBeGreaterThan(0);
    expect(err.errors.some((v) => v.code === code)).toBe(true);
    return err;
  }
}

describe('DrawSession · 临时状态管理', () => {
  it('初始 state：空点列、无游标', () => {
    const s = new DrawSession('LineString');
    expect(s.state).toEqual({
      geometryType: 'LineString',
      points: [],
      cursor: null,
      closed: false,
    });
  });

  it('addPoint 累加点并复制入参；moveCursor 更新游标', () => {
    const s = new DrawSession('LineString');
    const pt = p(1, 2);
    s.addPoint(pt);
    pt.x = 99; // 入参后续被篡改不影响会话内部
    s.moveCursor(p(3, 4));
    expect(s.state.points).toEqual([p(1, 2)]);
    expect(s.state.cursor).toEqual(p(3, 4));
  });

  it('state 为快照：外部篡改不污染会话内部', () => {
    const s = new DrawSession('LineString');
    s.addPoint(p(0, 0));
    const snap = s.state;
    snap.points.push(p(9, 9));
    snap.cursor = p(8, 8);
    expect(s.state.points).toEqual([p(0, 0)]);
    expect(s.state.cursor).toBeNull();
  });

  it('Polygon 会话 state.closed 为 true（预览含闭合边语义）', () => {
    const s = new DrawSession('Polygon');
    expect(s.state.closed).toBe(true);
  });

  it('cancel 清空点与游标（半成品丢弃）', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(1, 0));
    s.moveCursor(p(2, 2));
    s.cancel();
    expect(s.state.points).toEqual([]);
    expect(s.state.cursor).toBeNull();
  });
});

describe('DrawSession · Point complete', () => {
  it('1 点通过，返回 PointGeometryData', () => {
    const s = new DrawSession('Point');
    s.addPoint(p(5, -3));
    expect(s.complete()).toEqual({ type: 'Point', coordinates: p(5, -3) });
  });

  it('多余点取首点（点工具一次点击即完成）', () => {
    const s = new DrawSession('Point');
    s.addPoint(p(1, 1));
    s.addPoint(p(2, 2));
    expect(s.complete()).toEqual({ type: 'Point', coordinates: p(1, 1) });
  });

  it('0 点抛 DrawValidationError(TOO_FEW_VERTICES)', () => {
    const s = new DrawSession('Point');
    expectDrawError(() => s.complete(), 'TOO_FEW_VERTICES');
  });
});

describe('DrawSession · LineString complete', () => {
  it('≥2 点通过，返回 LineStringGeometryData', () => {
    const s = new DrawSession('LineString');
    s.addPoint(p(0, 0));
    s.addPoint(p(1, 0));
    s.addPoint(p(1, 1));
    expect(s.complete()).toEqual({
      type: 'LineString',
      coordinates: [p(0, 0), p(1, 0), p(1, 1)],
    });
  });

  it('1 点抛 DrawValidationError(TOO_FEW_VERTICES)', () => {
    const s = new DrawSession('LineString');
    s.addPoint(p(0, 0));
    expectDrawError(() => s.complete(), 'TOO_FEW_VERTICES');
  });

  it('0 点抛 DrawValidationError(TOO_FEW_VERTICES)', () => {
    const s = new DrawSession('LineString');
    expectDrawError(() => s.complete(), 'TOO_FEW_VERTICES');
  });

  it('非法坐标（NaN）经 validateGeometry 抛 INVALID_COORD', () => {
    const s = new DrawSession('LineString');
    s.addPoint(p(Number.NaN, 0));
    s.addPoint(p(1, 1));
    expectDrawError(() => s.complete(), 'INVALID_COORD');
  });

  it('自相交折线（十字交叉）抛 SELF_INTERSECT', () => {
    const s = new DrawSession('LineString');
    s.addPoint(p(0, 0));
    s.addPoint(p(2, 2));
    s.addPoint(p(2, 0));
    s.addPoint(p(0, 2)); // (0,0)-(2,2) 与 (2,0)-(0,2) 交于 (1,1)
    expectDrawError(() => s.complete(), 'SELF_INTERSECT');
  });
});

describe('DrawSession · Polygon complete', () => {
  it('三角形通过且首环自动闭合（首尾点补齐）', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(4, 0));
    s.addPoint(p(0, 4));
    const geo = s.complete();
    expect(isPolygonGeometry(geo)).toBe(true);
    if (!isPolygonGeometry(geo)) throw new Error('应当返回 Polygon');
    const ring = geo.coordinates[0]!;
    expect(ring).toEqual([p(0, 0), p(4, 0), p(0, 4), p(0, 0)]);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it('顺时针输入自动反转为逆时针（顶点顺序自动修复）', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(0, 4));
    s.addPoint(p(4, 0)); // 顺时针
    const geo = s.complete();
    if (!isPolygonGeometry(geo)) throw new Error('应当返回 Polygon');
    const ring = geo.coordinates[0]!;
    expect(ring).toEqual([p(0, 0), p(4, 0), p(0, 4), p(0, 0)]);
  });

  it('手动点击首点闭合时不重复补点', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(4, 0));
    s.addPoint(p(0, 4));
    s.addPoint(p(0, 0)); // 用户手动闭合
    const geo = s.complete();
    if (!isPolygonGeometry(geo)) throw new Error('应当返回 Polygon');
    expect(geo.coordinates[0]!).toHaveLength(4);
  });

  it('2 点抛 DrawValidationError(TOO_FEW_VERTICES)', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(1, 0));
    expectDrawError(() => s.complete(), 'TOO_FEW_VERTICES');
  });

  it('0 点抛 DrawValidationError(TOO_FEW_VERTICES)', () => {
    const s = new DrawSession('Polygon');
    expectDrawError(() => s.complete(), 'TOO_FEW_VERTICES');
  });

  it('手动闭合但有效顶点仅 2 个（a→b→a）仍按有效顶点数拦截', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(4, 0));
    s.addPoint(p(0, 0));
    expectDrawError(() => s.complete(), 'TOO_FEW_VERTICES');
  });

  it('八字形自相交抛 DrawValidationError(code=SELF_INTERSECT)', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(1, 1));
    s.addPoint(p(1, 0));
    s.addPoint(p(0, 1)); // 闭合后 (0,0)-(1,1) 与 (1,0)-(0,1) 交于 (0.5,0.5)
    const err = expectDrawError(() => s.complete(), 'SELF_INTERSECT');
    expect(err.message).not.toBe('');
  });
});

describe('DrawSession · 会话生命周期', () => {
  it('complete 成功后自动复位，可连续绘制（点工具连续落点）', () => {
    const s = new DrawSession('Point');
    s.addPoint(p(1, 1));
    s.moveCursor(p(9, 9));
    s.complete();
    expect(s.state.points).toEqual([]);
    expect(s.state.cursor).toBeNull();
    s.addPoint(p(2, 2));
    expect(s.complete()).toEqual({ type: 'Point', coordinates: p(2, 2) });
  });

  it('complete 抛错时保留已绘点（用户可继续修正）', () => {
    const s = new DrawSession('Polygon');
    s.addPoint(p(0, 0));
    s.addPoint(p(1, 1));
    s.addPoint(p(1, 0));
    s.addPoint(p(0, 1));
    expect(() => s.complete()).toThrow(DrawValidationError);
    expect(s.state.points).toHaveLength(4);
  });

  it('返回的几何与后续会话操作互不影响（深拷贝）', () => {
    const s = new DrawSession('LineString');
    s.addPoint(p(0, 0));
    s.addPoint(p(1, 1));
    const geo = s.complete();
    s.cancel();
    s.addPoint(p(5, 5));
    expect(geo).toEqual({ type: 'LineString', coordinates: [p(0, 0), p(1, 1)] });
  });
});
