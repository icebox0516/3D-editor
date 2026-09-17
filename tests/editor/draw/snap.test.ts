/**
 * snap 单元测试 —— 绘制吸附三纯函数（正交锁定 / 角度锁定 / 网格吸附）。
 * 纯数值断言：输出坐标误差 < 1e-9（toBeCloseTo precision 9）。
 * 坐标约定：Vec2 = (x, 世界 z)，轴名 'z' 对应 Vec2.y 分量（CONTRACTS.md #8）。
 */
import { describe, expect, it } from 'vitest';
import { angleLock, gridSnap, orthoLock } from '../../../src/editor/tools/draw/snap';
import type { Vec2 } from '../../../src/core/types';

const p = (x: number, y: number): Vec2 => ({ x, y });

describe('orthoLock · 正交锁定（轴向投影）', () => {
  it('锁定 X 轴：x 取 to、z 取 from', () => {
    const r = orthoLock(p(0, 5), p(3, 9), 'x');
    expect(r).toEqual(p(3, 5));
  });

  it('锁定 Z 轴：x 取 from、z 取 to', () => {
    const r = orthoLock(p(0, 5), p(3, 9), 'z');
    expect(r).toEqual(p(0, 9));
  });

  it('不修改入参（纯函数）', () => {
    const from = p(1, 2);
    const to = p(7, 8);
    orthoLock(from, to, 'x');
    orthoLock(from, to, 'z');
    expect(from).toEqual(p(1, 2));
    expect(to).toEqual(p(7, 8));
  });
});

describe('angleLock · 角度锁定（方向吸附保持距离）', () => {
  it('默认 45°：126.87° 方向吸附到 135°，距离保持 5', () => {
    const r = angleLock(p(0, 0), p(-3, 4)); // atan2(4,-3) ≈ 126.87° → 135°
    const d = 5 * Math.SQRT1_2;
    expect(r.x).toBeCloseTo(-d, 9);
    expect(r.y).toBeCloseTo(d, 9);
  });

  it('stepDeg=90：53.13° 方向吸附到 90°', () => {
    const r = angleLock(p(0, 0), p(3, 4), 90);
    expect(r.x).toBeCloseTo(0, 9);
    expect(r.y).toBeCloseTo(5, 9);
  });

  it('已在吸附方向上（45°）时坐标不变', () => {
    const r = angleLock(p(10, -2), p(11, -1));
    expect(r.x).toBeCloseTo(11, 9);
    expect(r.y).toBeCloseTo(-1, 9);
  });

  it('第三象限（-135° 已是 45° 倍数）坐标不变（距离 √2 保持）', () => {
    const r = angleLock(p(0, 0), p(-1, -1));
    expect(r.x).toBeCloseTo(-1, 9);
    expect(r.y).toBeCloseTo(-1, 9);
  });

  it('任意方向：吸附前后与 from 的距离保持不变', () => {
    const from = p(2, 3);
    const to = p(-5, 7);
    const r = angleLock(from, to, 30);
    const before = Math.hypot(to.x - from.x, to.y - from.y);
    const after = Math.hypot(r.x - from.x, r.y - from.y);
    expect(after).toBeCloseTo(before, 9);
  });

  it('from === to（零距离）返回 from 坐标', () => {
    expect(angleLock(p(2, 3), p(2, 3))).toEqual(p(2, 3));
  });

  it('stepDeg 非法（≤0）时不吸附，返回 to 坐标', () => {
    expect(angleLock(p(0, 0), p(3, 4), 0)).toEqual(p(3, 4));
    expect(angleLock(p(0, 0), p(3, 4), -45)).toEqual(p(3, 4));
  });
});

describe('gridSnap · 网格吸附', () => {
  it('gridSize=1：吸附到最近整数网格点', () => {
    expect(gridSnap(p(0.4, 1.6), 1)).toEqual(p(0, 2));
  });

  it('gridSize=0.5：半格网格', () => {
    expect(gridSnap(p(0.3, -0.3), 0.5)).toEqual(p(0.5, -0.5));
  });

  it('负坐标四舍五入到最近网格点', () => {
    expect(gridSnap(p(-1.4, -2.6), 1)).toEqual(p(-1, -3));
  });

  it('已在网格点上不变', () => {
    expect(gridSnap(p(2, -3), 1)).toEqual(p(2, -3));
  });

  it('gridSize 非法（≤0 / 非有限值）返回原坐标副本', () => {
    const q = p(1.3, 2.7);
    expect(gridSnap(q, 0)).toEqual(q);
    expect(gridSnap(q, -2)).toEqual(q);
    expect(gridSnap(q, Number.POSITIVE_INFINITY)).toEqual(q);
    expect(gridSnap(q, Number.NaN)).toEqual(q);
  });
});
