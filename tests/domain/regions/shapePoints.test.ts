/**
 * tests/domain/regions/shapePoints.test.ts —— 参数化形状点生成纯函数测试（T6.1，先测后码）。
 *
 * 覆盖：
 * - rectanglePoints：4 角点、逆时针（鞋带面积为正）、缺省中心原点、自定义中心、非法入参抛错；
 * - circlePoints / ellipsePoints：默认分段数锁定、首点在正轴、逆时针、半径/半轴 respected、非法入参抛错；
 * - simplifyFreehand（道格拉斯-普克）：保端点、共线塌缩、偏移点保留、容差单调性、缺省容差、不改动入参；
 * - smoothFreehand（Chaikin 平滑）：端点保持、共线输入不越线、迭代次数与点数关系、0 次幂等拷贝。
 * 边界：纯函数输出 Vec2[]；参数（半径/长宽/分段等）存入调用方 shape.options 的纪律由文档注释声明，
 *      函数自身不构造 RegionShape。
 */
import { describe, expect, it } from 'vitest';
import {
  circlePoints,
  ellipsePoints,
  rectanglePoints,
  simplifyFreehand,
  smoothFreehand,
} from '../../../src/domain/regions';
import type { Vec2 } from '../../../src/core/types';

/** 鞋带有向面积（>0 逆时针 CCW） */
function signedArea(points: Vec2[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    const q = points[(i + 1) % points.length]!;
    sum += p.x * q.y - q.x * p.y;
  }
  return sum / 2;
}

describe('rectanglePoints（矩形 → 4 角点）', () => {
  it('缺省中心为原点，4 角点逆时针', () => {
    const pts = rectanglePoints(4, 2);
    expect(pts).toHaveLength(4);
    expect(pts).toEqual([
      { x: -2, y: -1 },
      { x: 2, y: -1 },
      { x: 2, y: 1 },
      { x: -2, y: 1 },
    ]);
    expect(signedArea(pts)).toBeGreaterThan(0);
  });

  it('自定义中心平移角点', () => {
    const pts = rectanglePoints(4, 2, { x: 10, y: 20 });
    expect(pts).toEqual([
      { x: 8, y: 19 },
      { x: 12, y: 19 },
      { x: 12, y: 21 },
      { x: 8, y: 21 },
    ]);
  });

  it('非法入参（宽/高 ≤ 0 或非有限值）抛错', () => {
    expect(() => rectanglePoints(0, 2)).toThrow();
    expect(() => rectanglePoints(4, -1)).toThrow();
    expect(() => rectanglePoints(Number.NaN, 2)).toThrow();
    expect(() => rectanglePoints(4, Number.POSITIVE_INFINITY)).toThrow();
  });
});

describe('circlePoints（圆 → 点列）', () => {
  it('缺省分段数锁定为 64（首测锁定缺省值）', () => {
    expect(circlePoints(5)).toHaveLength(64);
    expect(circlePoints(5, 8)).toHaveLength(8);
  });

  it('首点在正 X 轴、逆时针（角度递增方向）', () => {
    const pts = circlePoints(5, 8);
    expect(pts[0]).toEqual({ x: 5, y: 0 });
    // 第二点位于 45°： (√2/2·5, √2/2·5)
    expect(pts[1]!.x).toBeCloseTo((Math.sqrt(2) / 2) * 5, 10);
    expect(pts[1]!.y).toBeCloseTo((Math.sqrt(2) / 2) * 5, 10);
    expect(signedArea(pts)).toBeGreaterThan(0);
  });

  it('所有点到圆心距离等于半径（不重复闭合点）', () => {
    const pts = circlePoints(3);
    for (const p of pts) {
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(3, 9);
    }
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    expect(`${first.x},${first.y}`).not.toBe(`${last.x},${last.y}`);
  });

  it('非法入参（半径 ≤ 0、分段 < 3、非有限值）抛错', () => {
    expect(() => circlePoints(0)).toThrow();
    expect(() => circlePoints(-2)).toThrow();
    expect(() => circlePoints(5, 2)).toThrow();
    expect(() => circlePoints(Number.NaN)).toThrow();
  });
});

describe('ellipsePoints（椭圆 → 点列）', () => {
  it('缺省分段数 64，两半轴 respected', () => {
    const pts = ellipsePoints(4, 2);
    expect(pts).toHaveLength(64);
    expect(pts[0]).toEqual({ x: 4, y: 0 });
    // 90° 处（索引 16）的点为 (0, 2)
    expect(pts[16]!.x).toBeCloseTo(0, 9);
    expect(pts[16]!.y).toBeCloseTo(2, 9);
    expect(signedArea(pts)).toBeGreaterThan(0);
  });

  it('自定义分段', () => {
    expect(ellipsePoints(4, 2, 12)).toHaveLength(12);
  });

  it('非法入参（半轴 ≤ 0、分段 < 3）抛错', () => {
    expect(() => ellipsePoints(0, 2)).toThrow();
    expect(() => ellipsePoints(4, 0)).toThrow();
    expect(() => ellipsePoints(4, 2, 2)).toThrow();
  });
});

describe('simplifyFreehand（道格拉斯-普克简化）', () => {
  it('共线点列塌缩为两端点', () => {
    const collinear: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ];
    expect(simplifyFreehand(collinear, 0.5)).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ]);
  });

  it('超出容差的偏移点保留、端点恒保留', () => {
    const zigzag: Vec2[] = [
      { x: 0, y: 0 },
      { x: 2, y: 5 },
      { x: 4, y: 0 },
    ];
    const simplified = simplifyFreehand(zigzag, 0.1);
    expect(simplified).toEqual(zigzag);
    expect(simplified[0]).toEqual(zigzag[0]!);
    expect(simplified[simplified.length - 1]).toEqual(zigzag[zigzag.length - 1]!);
  });

  it('容差单调性：容差增大，保留点数单调不增', () => {
    const wavy: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0.3 },
      { x: 2, y: 0 },
      { x: 3, y: 0.9 },
      { x: 4, y: 0 },
      { x: 5, y: 0.2 },
      { x: 6, y: 0 },
      { x: 7, y: 1.5 },
      { x: 8, y: 0 },
    ];
    const counts = [0, 0.1, 0.5, 2, 10].map((t) => simplifyFreehand(wavy, t).length);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]!).toBeLessThanOrEqual(counts[i - 1]!);
    }
    // 容差 0：所有非精确共线的点全部保留
    expect(counts[0]).toBe(wavy.length);
    // 足够大容差：只剩两端点
    expect(counts[counts.length - 1]).toBe(2);
  });

  it('缺省容差存在且行为与显式 0.2 一致（缺省值锁定）', () => {
    const wavy: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0.15 },
      { x: 2, y: 0 },
    ];
    expect(simplifyFreehand(wavy)).toEqual(simplifyFreehand(wavy, 0.2));
  });

  it('纯函数：不改动入参点列', () => {
    const input: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 0 },
    ];
    const snapshot = input.map((p) => ({ ...p }));
    simplifyFreehand(input, 0.001);
    expect(input).toEqual(snapshot);
  });

  it('两 degenerate 输入（空/单点/两点）原样返回拷贝', () => {
    expect(simplifyFreehand([], 1)).toEqual([]);
    expect(simplifyFreehand([{ x: 1, y: 1 }], 1)).toEqual([{ x: 1, y: 1 }]);
    const two: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(simplifyFreehand(two, 100)).toEqual(two);
  });
});

describe('smoothFreehand（Chaikin 平滑，端点保持）', () => {
  it('端点精确保持', () => {
    const input: Vec2[] = [
      { x: 0, y: 0 },
      { x: 2, y: 3 },
      { x: 4, y: 0 },
      { x: 6, y: 2 },
    ];
    const out = smoothFreehand(input);
    expect(out[0]).toEqual(input[0]!);
    expect(out[out.length - 1]).toEqual(input[input.length - 1]!);
  });

  it('共线输入平滑后仍共线（不越线）', () => {
    const input: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];
    const out = smoothFreehand(input, 2);
    for (const p of out) expect(p.y).toBe(0);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[out.length - 1]).toEqual({ x: 3, y: 0 });
  });

  it('一次迭代点数翻倍（2 + 2×段数），缺省迭代 1 次（锁定）', () => {
    const input: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 1 },
      { x: 4, y: 0 },
    ];
    expect(smoothFreehand(input)).toHaveLength(2 * input.length);
    expect(smoothFreehand(input, 1)).toHaveLength(2 * input.length);
    expect(smoothFreehand(input, 2)).toHaveLength(4 * input.length);
  });

  it('0 次迭代返回等值拷贝；≤2 点输入原样返回拷贝', () => {
    const input: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 0 },
    ];
    const out = smoothFreehand(input, 0);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);

    const two: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(smoothFreehand(two, 3)).toEqual(two);
  });
});
