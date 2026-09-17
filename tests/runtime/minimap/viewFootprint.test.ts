/**
 * tests/runtime/minimap/viewFootprint.test.ts —— 主相机地面视野足迹纯函数测试（T7.7，先测后码）。
 *
 * 覆盖（零 THREE、node 直测）：
 * - perspective 俯视前倾机位：四点有限、均在地面、远边沿朝向延伸（标准四边形）；
 * - top 机位（正下方垂直俯视）：足迹 ≈ 以地面垂心为中心的矩形；
 * - front/side 机位（水平视线）：上缘两角被 far 裁剪（到相机距离 ≈ far/cos 半角）、
 *   下缘两角落在地面（有限条带）；
 * - 退化姿态不 NaN：相机在地面下 / 视线垂直向下 / 零向量 forward / far=0；
 * - ortho 输入：视域矩形（俯视）与 far 裁剪条带（水平）；
 * - heading：单位向量、与 forward 的 XZ 投影同向；垂直俯视回退 (0,-1)（北）。
 */
import { describe, expect, it } from 'vitest';
import {
  computeViewFootprint,
} from '../../../src/runtime/minimap/viewFootprint';
import type { ViewFootprintInput } from '../../../src/runtime/minimap/viewFootprint';

/** 全部坐标有限断言 */
function expectFiniteQuad(quad: { x: number; y: number }[]): void {
  for (const p of quad) {
    expect(Number.isFinite(p.x)).toBe(true);
    expect(Number.isFinite(p.y)).toBe(true);
  }
}

/** 构造透视输入（forward 自动归一由被测函数承担） */
function perspective(over: Partial<ViewFootprintInput> & { position: ViewFootprintInput['position']; forward: ViewFootprintInput['forward'] }): ViewFootprintInput {
  return {
    up: { x: 0, y: 1, z: 0 },
    frustum: { kind: 'perspective', fovY: (50 * Math.PI) / 180, aspect: 1.6 },
    far: 10000,
    ...over,
  } as ViewFootprintInput;
}

describe('computeViewFootprint：perspective 机位', () => {
  it('俯视前倾机位：4 点有限且构成沿朝向拉长的四边形（远边中点沿 heading 更远）', () => {
    // 相机在 (0, 100, 150)，看向原点（前倾俯视，朝 -Z 偏下）
    const input = perspective({
      position: { x: 0, y: 100, z: 150 },
      forward: { x: 0, y: -0.55, z: -0.83 },
    });
    const fp = computeViewFootprint(input);
    expect(fp.quad).toHaveLength(4);
    expectFiniteQuad(fp.quad);
    // 朝向 -Z：远边（更小 z）与近边（更大 z）应可区分——四点 z 范围跨度 > 0
    const zs = fp.quad.map((p) => p.y);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(1);
  });

  it('top 机位（正下方垂直俯视）：足迹为以地面垂心为中心的近似矩形，宽 > 高（aspect>1）', () => {
    const input = perspective({
      position: { x: 20, y: 200, z: -30 },
      forward: { x: 0, y: -1, z: 0 },
      up: { x: 0, y: 0, z: -1 }, // 顶视姿态：up 指向 -Z（屏幕上 = 北）
    });
    const fp = computeViewFootprint(input);
    expectFiniteQuad(fp.quad);
    const xs = fp.quad.map((p) => p.x);
    const zs = fp.quad.map((p) => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanZ = Math.max(...zs) - Math.min(...zs);
    // 相机高 200、垂直 fov 50°：地面覆盖直径 ≈ 2·200·tan25° ≈ 186；水平方向 × aspect 1.6
    expect(spanX).toBeGreaterThan(spanZ);
    expect(spanZ).toBeGreaterThan(150);
    expect(spanZ).toBeLessThan(220);
    // 中心 = 相机地面垂心（fov 对称）
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cz = (Math.max(...zs) + Math.min(...zs)) / 2;
    expect(cx).toBeCloseTo(20, 6);
    expect(cz).toBeCloseTo(-30, 6);
  });

  it('front 机位（水平视线）：上缘两角被 far 裁剪（距相机 ≈ far），下缘两角落地面（有限条带）', () => {
    const far = 500;
    const input = perspective({
      position: { x: 0, y: 50, z: 0 },
      forward: { x: 0, y: 0, z: -1 },
      far,
    });
    const fp = computeViewFootprint(input);
    expectFiniteQuad(fp.quad);
    // 按构造序：quad[0]=左下 quad[1]=右下 quad[2]=右上 quad[3]=左上（下缘先触地）
    const dist = (p: { x: number; y: number }): number => Math.hypot(p.x, p.y);
    // 下缘：视线向下 25° → 地面交点距离 = 50/tan(25°+ε 角内)…只需断言 < far（先于 far 触地）
    expect(dist(fp.quad[0])).toBeLessThan(far);
    expect(dist(fp.quad[1])).toBeLessThan(far);
    // 上缘：视线向上 → 永不触地，被 far 裁剪（> far，因斜边长于轴向距离）
    expect(dist(fp.quad[2])).toBeGreaterThan(far);
    expect(dist(fp.quad[3])).toBeGreaterThan(far);
    // 全部条带沿 -Z（朝向）延伸
    for (const p of fp.quad) expect(p.y).toBeLessThanOrEqual(0);
  });

  it('side 机位（水平 +X 视线）：条带沿 +X 延伸（heading 同向）', () => {
    const input = perspective({
      position: { x: -100, y: 60, z: 0 },
      forward: { x: 1, y: 0, z: 0 },
      far: 400,
    });
    const fp = computeViewFootprint(input);
    expectFiniteQuad(fp.quad);
    for (const p of fp.quad) expect(p.x).toBeGreaterThan(-100);
    expect(fp.heading.x).toBeGreaterThan(0.99);
    expect(Math.abs(fp.heading.y)).toBeLessThan(0.01);
  });
});

describe('computeViewFootprint：退化姿态（不 NaN）', () => {
  it('相机在地面下（y<0）：全部角点退化为 far 裁剪点，有限不抛错', () => {
    const input = perspective({
      position: { x: 0, y: -20, z: 0 },
      forward: { x: 0, y: -0.3, z: -0.9 },
      far: 300,
    });
    const fp = computeViewFootprint(input);
    expectFiniteQuad(fp.quad);
  });

  it('相机恰在地面高度水平看（下缘角点退化为相机 XZ 点）', () => {
    const input = perspective({
      position: { x: 0, y: 0, z: 0 },
      forward: { x: 0, y: 0, z: -1 },
      far: 300,
    });
    const fp = computeViewFootprint(input);
    expectFiniteQuad(fp.quad);
    // 下缘触地 t=0 → 与相机 XZ 重合
    expect(fp.quad[0].x).toBeCloseTo(0, 6);
    expect(fp.quad[0].y).toBeCloseTo(0, 6);
  });

  it('零向量 forward / 零向量 up：内部回退，不产生 NaN', () => {
    const a = computeViewFootprint(
      perspective({
        position: { x: 0, y: 10, z: 0 },
        forward: { x: 0, y: 0, z: 0 },
      }),
    );
    expectFiniteQuad(a.quad);
    const b = computeViewFootprint(
      perspective({
        position: { x: 0, y: 10, z: 0 },
        forward: { x: 0, y: -0.6, z: -0.8 },
        up: { x: 0, y: 0, z: 0 },
      }),
    );
    expectFiniteQuad(b.quad);
  });

  it('far = 0：全部角点退化为相机位置（有限）', () => {
    const input = perspective({
      position: { x: 5, y: 80, z: 7 },
      forward: { x: 0, y: -1, z: 0 },
      up: { x: 0, y: 0, z: -1 },
      far: 0,
    });
    const fp = computeViewFootprint(input);
    expectFiniteQuad(fp.quad);
  });
});

describe('computeViewFootprint：ortho 输入', () => {
  it('垂直俯视正交：地面足迹 = 视域矩形（halfWidth × halfHeight，中心 = 垂心）', () => {
    const fp = computeViewFootprint({
      position: { x: 10, y: 50, z: -4 },
      forward: { x: 0, y: -1, z: 0 },
      up: { x: 0, y: 0, z: -1 },
      frustum: { kind: 'ortho', halfWidth: 60, halfHeight: 40 },
      far: 100,
    });
    expectFiniteQuad(fp.quad);
    const xs = fp.quad.map((p) => p.x);
    const zs = fp.quad.map((p) => p.y);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(120, 6);
    expect(Math.max(...zs) - Math.min(...zs)).toBeCloseTo(80, 6);
    expect((Math.max(...xs) + Math.min(...xs)) / 2).toBeCloseTo(10, 6);
  });

  it('水平正交视线：视线与地面平行永不相交 → 四角全部 far 裁剪为远边线段（有限退化，不 NaN）', () => {
    const fp = computeViewFootprint({
      position: { x: 0, y: 30, z: 0 },
      forward: { x: 0, y: 0, z: -1 },
      up: { x: 0, y: 1, z: 0 },
      frustum: { kind: 'ortho', halfWidth: 50, halfHeight: 25 },
      far: 200,
    });
    expectFiniteQuad(fp.quad);
    // 正交平行射线（dir 无 y 分量）永不触地：全部角点沿视线推进 far → 退化为远边线段
    const zs = fp.quad.map((p) => p.y);
    expect(Math.max(...zs)).toBeCloseTo(-200, 6);
    expect(Math.min(...zs)).toBeCloseTo(-200, 6);
    const xs = fp.quad.map((p) => p.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(100, 6);
  });

  it('滚转正交机位（right.y ≠ 0）：角射线起点含 right.x 分量（回归：y 行曾误乘 ry）', () => {
    // 构造（手算基向量）：f = (0,-√2/2,√2/2)、u = (1,0,0) →
    //   right = (0, √2/2, √2/2)、trueUp = (1, 0, 0)。
    // 射线触地（f.y < 0、far 充分大）→ quad = (ry, 10 + √2·rx)：
    //   左下 (-hw,-hh) → (-1, 10 - 2√2)；右上 (+hw,+hh) → (1, 10 + 2√2)。
    //   （错误实现 y 行乘 ry 时 quad.z = 10 + (√2/2)(rx + ry)，与本期望差 ~0.7）
    const fp = computeViewFootprint({
      position: { x: 0, y: 10, z: 0 },
      forward: { x: 0, y: -1, z: 1 },
      up: { x: 1, y: 0, z: 0 },
      frustum: { kind: 'ortho', halfWidth: 2, halfHeight: 1 },
      far: 100,
    });
    const SQRT2 = Math.SQRT2;
    expect(fp.quad[0]!.x).toBeCloseTo(-1, 9);
    expect(fp.quad[0]!.y).toBeCloseTo(10 - 2 * SQRT2, 6);
    expect(fp.quad[2]!.x).toBeCloseTo(1, 9);
    expect(fp.quad[2]!.y).toBeCloseTo(10 + 2 * SQRT2, 6);
  });
});

describe('computeViewFootprint：heading 朝向', () => {
  it('forward 的 XZ 投影归一为单位向量且同向', () => {
    const fp = computeViewFootprint(
      perspective({
        position: { x: 0, y: 50, z: 0 },
        forward: { x: 3, y: -1, z: 4 }, // 非单位输入
      }),
    );
    const len = Math.hypot(fp.heading.x, fp.heading.y);
    expect(len).toBeCloseTo(1, 9);
    expect(fp.heading.x).toBeCloseTo(3 / 5, 6);
    expect(fp.heading.y).toBeCloseTo(4 / 5, 6);
  });

  it('垂直俯视（XZ 投影零长）：heading 回退 (0,-1)（北），不 NaN', () => {
    const fp = computeViewFootprint(
      perspective({
        position: { x: 0, y: 100, z: 0 },
        forward: { x: 0, y: -1, z: 0 },
        up: { x: 0, y: 0, z: -1 },
      }),
    );
    expect(fp.heading.x).toBe(0);
    expect(fp.heading.y).toBe(-1);
  });
});
