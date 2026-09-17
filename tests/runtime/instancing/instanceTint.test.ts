/**
 * tests/runtime/instancing/instanceTint.test.ts —— 变体色相偏移 → 实例颜色乘子测试（T002.3）。
 *
 * 覆盖（node 纯函数直测，无 WebGL）：
 * - 恒等：0 / 非有限偏移 → 精确白 (1,1,1)（恒等乘子）；
 * - 确定性：同输入同输出（含与 domain applyAssetVariants 按 seed 串联复算的链路）；
 * - 冷暖对称可见：±偏移产出不同乘子、通道值全在 [0,1]、微差量级肉眼可辨
 *   （8° 偏移 ≥ 5% 通道调制）且不整体过暗（min ≥ 0.5）；
 * - 大偏移封顶：|offset| ≥ 15° 饱和度满格，乘子稳定不越界。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { applyAssetVariants } from '../../../src/domain/assets';
import { hueOffsetToMultiplier } from '../../../src/runtime/instancing/instanceTint';

const WHITE = new THREE.Color(1, 1, 1);

describe('hueOffsetToMultiplier：恒等与确定性', () => {
  it('0 / NaN / Infinity → 精确白（1,1,1）', () => {
    expect(hueOffsetToMultiplier(0).equals(WHITE)).toBe(true);
    expect(hueOffsetToMultiplier(Number.NaN).equals(WHITE)).toBe(true);
    expect(hueOffsetToMultiplier(Number.POSITIVE_INFINITY).equals(WHITE)).toBe(true);
  });

  it('同输入同输出（确定性纯函数）', () => {
    for (const offset of [-30, -8, -0.5, 3, 8, 15, 179.9]) {
      const a = hueOffsetToMultiplier(offset);
      const b = hueOffsetToMultiplier(offset);
      expect(b.r).toBe(a.r);
      expect(b.g).toBe(a.g);
      expect(b.b).toBe(a.b);
    }
  });

  it('seed → 采样 → 乘子链路确定性（渲染侧复算同 seed 同色的根基）', () => {
    const variants = { hueJitter: 8 };
    for (const seed of [0, 7, 999, -13]) {
      const first = hueOffsetToMultiplier(applyAssetVariants(variants, seed).hueOffset);
      const second = hueOffsetToMultiplier(applyAssetVariants(variants, seed).hueOffset);
      expect(second.equals(first)).toBe(true);
    }
  });
});

describe('hueOffsetToMultiplier：冷暖对称与可见量级', () => {
  it('±偏移产出不同乘子；通道全在 [0,1]', () => {
    for (const offset of [4, 8, 15, 30]) {
      const plus = hueOffsetToMultiplier(offset);
      const minus = hueOffsetToMultiplier(-offset);
      expect(plus.equals(minus)).toBe(false);
      for (const color of [plus, minus]) {
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(1);
        expect(color.g).toBeLessThanOrEqual(1);
        expect(color.b).toBeLessThanOrEqual(1);
      }
    }
  });

  it('暖冷对向分裂：正偏移 r > b（暖向）、负偏移 b > r（冷向）——微差方向肉眼可辨', () => {
    for (const offset of [4, 8, 15, 30, 90]) {
      expect(hueOffsetToMultiplier(offset).r).toBeGreaterThan(hueOffsetToMultiplier(offset).b);
      expect(hueOffsetToMultiplier(-offset).b).toBeGreaterThan(hueOffsetToMultiplier(-offset).r);
    }
  });

  it('8° 微差量级肉眼可辨（对绿材质 ≥ 1% 通道差）且不整体过暗（min ≥ 0.5）', () => {
    const plus = hueOffsetToMultiplier(8);
    const minus = hueOffsetToMultiplier(-8);
    for (const color of [plus, minus]) {
      const min = Math.min(color.r, color.g, color.b);
      expect(min).toBeLessThanOrEqual(0.95); // 至少一个通道被调制 ≥ 5%
      expect(min).toBeGreaterThanOrEqual(0.5); // 染色不吞亮度（亮侧锚定）
    }
    // 微差对绿材质（垃圾桶桶身 0x4d7a5f 量级）乘算后通道差可辨
    const green = new THREE.Color(0x4d7a5f);
    const tintedPlus = green.clone().multiply(plus);
    const tintedMinus = green.clone().multiply(minus);
    const delta = Math.max(
      Math.abs(tintedPlus.r - tintedMinus.r),
      Math.abs(tintedPlus.g - tintedMinus.g),
      Math.abs(tintedPlus.b - tintedMinus.b),
    );
    expect(delta).toBeGreaterThan(0.01);
  });

  it('|offset| ≥ 15° 饱和度满格：通道稳定在亮侧区间 [0.5, 1]（不过暗、不越界）', () => {
    for (const offset of [15, 30, 90, 180, -15, -30, -90, -180]) {
      const color = hueOffsetToMultiplier(offset);
      for (const channel of [color.r, color.g, color.b]) {
        expect(channel).toBeGreaterThanOrEqual(0.5);
        expect(channel).toBeLessThanOrEqual(1);
      }
    }
  });
});
