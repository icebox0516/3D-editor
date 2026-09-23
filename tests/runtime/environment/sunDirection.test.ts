/**
 * tests/runtime/environment/sunDirection.test.ts —— 太阳方向纯函数测试（T018.1，
 * D29.1 双消费单一真相源；零 THREE 依赖，node 可测——D27.5 先例）。
 *
 * 覆盖：
 * - 单位性：任意角输出模长 1；
 * - 世界系约定：elevation = atan(y/√(x²+z²))、azimuth = atan2(x,z) 的逆映射恒等
 *   （正反往返一致，随机角网格抽样）；
 * - 象限覆盖：azimuth 0/90/180/270 → +Z/+X/−Z/−X；elevation 0 → y=0；90 → +Y；
 *   负仰角 → y<0；
 * - **day 派生断言（零漂移口径）**：(80,120,60) 精确派生角
 *   （atan(1.2)、atan2(80,60)）往返后与 (80,120,60) 归一方向夹角 < 1e-9（浮点恒等）；
 *   圆整候选 50.2°/53.1° 与之夹角 < 1e-3 rad（两位小数圆整预算 ~0.06°，视觉零漂移）；
 * - legacy 常量：LEGACY_SUN_DISTANCE = |(80,120,60)| = √24400 ≈ 156.205（同模长替换）。
 */
import { describe, expect, it } from 'vitest';
import {
  DAY_SUN_AZIMUTH_DEG,
  DAY_SUN_ELEVATION_DEG,
  LEGACY_SUN_DISTANCE,
  sunDirectionOf,
} from '../../../src/runtime/environment/sunDirection';

/** 两方向夹角（rad；输入须为单位向量） */
function angleBetween(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dot = a.x * b.x + a.y * b.y + a.z * b.z;
  return Math.acos(Math.min(1, Math.max(-1, dot)));
}

/** (80,120,60) 归一方向（day legacy 太阳方向） */
function legacyDayUnit(): { x: number; y: number; z: number } {
  const len = Math.hypot(80, 120, 60);
  return { x: 80 / len, y: 120 / len, z: 60 / len };
}

describe('sunDirectionOf · 单位性与世界系约定', () => {
  it('输出恒为单位向量（各象限 + 极值 + 随机网格抽样）', () => {
    const samples: Array<[number, number]> = [
      [0, 0], [0, 90], [0, 180], [0, 270], [90, 0], [-30, 45], [50.2, 53.1],
      [89.9, 359.9], [-89.9, 0.1], [23.5, 133.7], [66.6, 246.8],
    ];
    for (let e = -90; e <= 90; e += 15) {
      for (let a = -180; a < 180; a += 30) samples.push([e, a]);
    }
    for (const [e, a] of samples) {
      const d = sunDirectionOf(e, a);
      expect(Math.abs(Math.hypot(d.x, d.y, d.z) - 1)).toBeLessThan(1e-12);
    }
  });

  it('方位角象限：0→+Z、90→+X、180→−Z、270→−X（atan2(x,z) 约定）', () => {
    const z0 = sunDirectionOf(10, 0);
    expect(z0.z).toBeGreaterThan(0);
    expect(Math.abs(z0.x)).toBeLessThan(1e-12);
    const x90 = sunDirectionOf(10, 90);
    expect(x90.x).toBeGreaterThan(0);
    expect(Math.abs(x90.z)).toBeLessThan(1e-12);
    const z180 = sunDirectionOf(10, 180);
    expect(z180.z).toBeLessThan(0);
    const x270 = sunDirectionOf(10, 270);
    expect(x270.x).toBeLessThan(0);
  });

  it('仰角极值：0°→y=0（地平）；90°→+Y（天顶）；负仰角→y<0（地平下）', () => {
    const horizon = sunDirectionOf(0, 45);
    expect(Math.abs(horizon.y)).toBeLessThan(1e-12);
    const zenith = sunDirectionOf(90, 123);
    expect(zenith.y).toBeCloseTo(1, 12);
    expect(Math.abs(zenith.x)).toBeLessThan(1e-12);
    expect(Math.abs(zenith.z)).toBeLessThan(1e-12);
    const below = sunDirectionOf(-20, 45);
    expect(below.y).toBeLessThan(0);
  });

  it('正反往返恒等：输出反解 elevation/azimuth 与输入一致（网格抽样）', () => {
    const rad = Math.PI / 180;
    for (let e = -85; e <= 85; e += 17) {
      for (let a = 0; a < 360; a += 37) {
        const d = sunDirectionOf(e, a);
        // 正向公式（与 018.0 README ① 派生口径一致）
        const elevation = Math.atan(d.y / Math.hypot(d.x, d.z)) / rad;
        const azimuth = Math.atan2(d.x, d.z) / rad;
        expect(elevation).toBeCloseTo(e, 9);
        expect(azimuth).toBeCloseTo(((a + 180) % 360) - 180, 9); // 折回 (-180,180]
      }
    }
  });
});

describe('sunDirectionOf · day 派生断言（新旧阴影方向零漂移口径，D29.6）', () => {
  it('(80,120,60) 精确派生角往返：与 legacy 归一方向夹角 < 1e-9 rad（浮点恒等）', () => {
    // 派生公式（018.0 README ①）：elevation = atan(120/√(80²+60²))，azimuth = atan2(80,60)
    const elevationDeg = (Math.atan(120 / Math.hypot(80, 60)) * 180) / Math.PI; // ≈ 50.1944°
    const azimuthDeg = (Math.atan2(80, 60) * 180) / Math.PI; // ≈ 53.1301°
    const d = sunDirectionOf(elevationDeg, azimuthDeg);
    expect(angleBetween(d, legacyDayUnit())).toBeLessThan(1e-9);
  });

  it('圆整候选 50.2°/53.1°：与 legacy 归一方向夹角 < 1e-3 rad（两位小数圆整预算）', () => {
    expect(DAY_SUN_ELEVATION_DEG).toBe(50.2);
    expect(DAY_SUN_AZIMUTH_DEG).toBe(53.1);
    const d = sunDirectionOf(DAY_SUN_ELEVATION_DEG, DAY_SUN_AZIMUTH_DEG);
    // 圆整误差 ≤ 0.05°/角 → 方向偏差 ≤ ~2.4e-3°量级（弧度 < 5e-5 实测），1e-3 rad 为宽松上界
    expect(angleBetween(d, legacyDayUnit())).toBeLessThan(1e-3);
  });

  it('LEGACY_SUN_DISTANCE = |(80,120,60)| = √24400 ≈ 156.205（同向同模长替换的模长侧）', () => {
    expect(LEGACY_SUN_DISTANCE).toBeCloseTo(Math.sqrt(24400), 9);
    expect(LEGACY_SUN_DISTANCE).toBeCloseTo(156.205, 3);
  });
});
