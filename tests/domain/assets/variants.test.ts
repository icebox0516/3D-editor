/**
 * tests/domain/assets/variants.test.ts —— 烘焙式变体确定性掷骰测试（T002.3，D6/D17）。
 *
 * 覆盖：
 * - 确定性：同 seed 同结果逐位一致（多 seed 采样、含 0 / 负 seed / 大 seed）；
 * - D17 半宽语义：scaleJitter 乘性 ×U[1-j,1+j]、rotationJitter 绕 Y ±deg（弧度返回）、
 *   hueJitter ±deg——多 seed 批量采样全部命中区间且双侧都出现；
 * - 缺省恒等：variants undefined / 空对象 / 全 0 → 恒等采样（1 / 0 / 0）；
 * - 值域边界：负值 / 非有限 jitter 按 0（防御）；单通道启用时其余通道恒等；
 * - rollVariantSeed：非负有限整数（可 JSON 落盘），多次採骰不全同；
 * - hasVariantJitter：启用判定（任一 jitter > 0；全 0 / 缺省 = false）。
 */
import { describe, expect, it } from 'vitest';
import {
  applyAssetVariants,
  hasVariantJitter,
  rollVariantSeed,
} from '../../../src/domain/assets';
import type { ProceduralVariants } from '../../../src/domain/assets';

const DEG = Math.PI / 180;

/** 批量采样（seed 0..n-1）：批量断言的通用夹具 */
function samplesOf(variants: ProceduralVariants, n = 400): Array<ReturnType<typeof applyAssetVariants>> {
  const out = [];
  for (let seed = 0; seed < n; seed++) out.push(applyAssetVariants(variants, seed));
  return out;
}

describe('applyAssetVariants：确定性', () => {
  it('同 seed 同结果逐位一致（0 / 负 / 大 seed ×3 通道）', () => {
    const variants: ProceduralVariants = { scaleJitter: 0.15, rotationJitter: 180, hueJitter: 8 };
    for (const seed of [0, 1, 42, -7, 2147483647, 1234567890]) {
      const a = applyAssetVariants(variants, seed);
      const b = applyAssetVariants(variants, seed);
      expect(b).toEqual(a); // 深比较逐位一致
      expect(b.scaleFactor).toBe(a.scaleFactor);
      expect(b.rotationYOffset).toBe(a.rotationYOffset);
      expect(b.hueOffset).toBe(a.hueOffset);
    }
  });

  it('不同 seed 产出不同采样（随机流覆盖，非恒定值）', () => {
    const variants: ProceduralVariants = { scaleJitter: 0.5, rotationJitter: 180, hueJitter: 30 };
    const distinct = new Set(samplesOf(variants, 50).map((s) => JSON.stringify(s)));
    expect(distinct.size).toBeGreaterThan(40); // 近全异：随机流有效
  });
});

describe('applyAssetVariants：D17 半宽语义', () => {
  it('scaleJitter = 0.15 → scaleFactor ∈ [0.85, 1.15]（乘性相对半宽，双侧出现）', () => {
    const samples = samplesOf({ scaleJitter: 0.15 });
    for (const s of samples) {
      expect(s.scaleFactor).toBeGreaterThanOrEqual(0.85);
      expect(s.scaleFactor).toBeLessThanOrEqual(1.15);
      expect(s.rotationYOffset).toBe(0); // 未启用通道恒等
      expect(s.hueOffset).toBe(0);
    }
    expect(samples.some((s) => s.scaleFactor < 1)).toBe(true);
    expect(samples.some((s) => s.scaleFactor > 1)).toBe(true);
  });

  it('rotationJitter = 15（度）→ rotationYOffset ∈ [-15°, 15°]（弧度返回，双侧出现）', () => {
    const samples = samplesOf({ rotationJitter: 15 });
    for (const s of samples) {
      expect(s.rotationYOffset).toBeGreaterThanOrEqual(-15 * DEG);
      expect(s.rotationYOffset).toBeLessThanOrEqual(15 * DEG);
      expect(s.scaleFactor).toBe(1);
      expect(s.hueOffset).toBe(0);
    }
    expect(samples.some((s) => s.rotationYOffset < 0)).toBe(true);
    expect(samples.some((s) => s.rotationYOffset > 0)).toBe(true);
  });

  it('hueJitter = 8（度）→ hueOffset ∈ [-8, 8]（度，双侧出现）', () => {
    const samples = samplesOf({ hueJitter: 8 });
    for (const s of samples) {
      expect(s.hueOffset).toBeGreaterThanOrEqual(-8);
      expect(s.hueOffset).toBeLessThanOrEqual(8);
      expect(s.scaleFactor).toBe(1);
      expect(s.rotationYOffset).toBe(0);
    }
    expect(samples.some((s) => s.hueOffset < 0)).toBe(true);
    expect(samples.some((s) => s.hueOffset > 0)).toBe(true);
  });

  it('rotationJitter = 180（全向）→ 覆盖 [0, 2π) 整圈（含四象限）', () => {
    const samples = samplesOf({ rotationJitter: 180 }, 800);
    const quadrants = new Set(samples.map((s) => Math.floor(((s.rotationYOffset / DEG) + 180) / 90)));
    expect(quadrants.size).toBe(4);
  });
});

describe('applyAssetVariants：缺省与防御', () => {
  it('variants undefined / 空对象 / 全 0 → 恒等采样（1 / 0 / 0）', () => {
    for (const variants of [undefined, {}, { scaleJitter: 0, rotationJitter: 0, hueJitter: 0 }]) {
      expect(applyAssetVariants(variants, 12345)).toEqual({
        scaleFactor: 1,
        rotationYOffset: 0,
        hueOffset: 0,
      });
    }
  });

  it('负值 / 非有限 jitter 按 0（防御：不产出非法缩放与角度）', () => {
    expect(applyAssetVariants({ scaleJitter: -0.5 }, 1).scaleFactor).toBe(1);
    expect(applyAssetVariants({ rotationJitter: Number.NaN }, 1).rotationYOffset).toBe(0);
    expect(applyAssetVariants({ hueJitter: Number.POSITIVE_INFINITY }, 1).hueOffset).toBe(0);
  });
});

describe('rollVariantSeed', () => {
  it('非负有限整数（JSON 无损落盘口径）', () => {
    for (let i = 0; i < 20; i++) {
      const seed = rollVariantSeed();
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(Number.isSafeInteger(seed)).toBe(true);
    }
  });

  it('多次採骰不全同（真随机源，非恒定）', () => {
    const seeds = new Set(Array.from({ length: 50 }, () => rollVariantSeed()));
    expect(seeds.size).toBeGreaterThan(40);
  });
});

describe('hasVariantJitter：掷骰启用判定', () => {
  it('任一 jitter > 0 → true；缺省 / 全 0 / 全非有限 → false', () => {
    expect(hasVariantJitter({ scaleJitter: 0.01 })).toBe(true);
    expect(hasVariantJitter({ rotationJitter: 0.01 })).toBe(true);
    expect(hasVariantJitter({ hueJitter: 0.01 })).toBe(true);
    expect(hasVariantJitter(undefined)).toBe(false);
    expect(hasVariantJitter({})).toBe(false);
    expect(hasVariantJitter({ scaleJitter: 0, rotationJitter: 0, hueJitter: 0 })).toBe(false);
    expect(hasVariantJitter({ scaleJitter: -1, hueJitter: Number.NaN })).toBe(false);
  });
});
