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
  resampleVariantTransform,
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

describe('resampleVariantTransform：重掷重采样（T008.4）', () => {
  const VARIANTS: ProceduralVariants = { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 };
  const CURRENT = {
    position: { x: 3, y: 0.03, z: -2 },
    rotation: { x: 0.1, y: 0.5, z: -0.2 },
    scale: { x: 2.2, y: 2.31, z: 2.2 }, // 用户 gizmo 后的非均匀缩放（含手调痕迹）
  };

  it('确定性：同入参逐位一致；返回新对象（不与 current 引用共享）', () => {
    const a = resampleVariantTransform(VARIANTS, 41, 87, CURRENT);
    const b = resampleVariantTransform(VARIANTS, 41, 87, CURRENT);
    expect(a).toEqual(b);
    expect(a.position).not.toBe(CURRENT.position);
    expect(a.rotation).not.toBe(CURRENT.rotation);
    expect(a.scale).not.toBe(CURRENT.scale);
    expect(CURRENT.rotation.y).toBe(0.5); // 原值未被改动
  });

  it('采样差换算精确：scale ×(new/old)、rotY +(new−old)、位置与 X/Z 旋转不动', () => {
    const oldSeed = 41;
    const newSeed = 87;
    const oldSample = applyAssetVariants(VARIANTS, oldSeed);
    const newSample = applyAssetVariants(VARIANTS, newSeed);
    const next = resampleVariantTransform(VARIANTS, oldSeed, newSeed, CURRENT);
    const ratio = newSample.scaleFactor / oldSample.scaleFactor;
    expect(next.scale.x).toBeCloseTo(CURRENT.scale.x * ratio, 12);
    expect(next.scale.y).toBeCloseTo(CURRENT.scale.y * ratio, 12);
    expect(next.scale.z).toBeCloseTo(CURRENT.scale.z * ratio, 12);
    expect(next.rotation.y).toBeCloseTo(
      CURRENT.rotation.y + (newSample.rotationYOffset - oldSample.rotationYOffset),
      12,
    );
    expect(next.rotation.x).toBe(CURRENT.rotation.x);
    expect(next.rotation.z).toBe(CURRENT.rotation.z);
    expect(next.position).toEqual(CURRENT.position);
  });

  it('同 seed 重掷 → 恒等（值等；重掷落回同 seed 时 transform 不变）', () => {
    const next = resampleVariantTransform(VARIANTS, 42, 42, CURRENT);
    expect(next).toEqual(CURRENT);
  });

  it('variants 缺省 / 全 0 → 两采样恒等 → 原值拷贝（新 seed 只改 hue/slot 侧）', () => {
    expect(resampleVariantTransform(undefined, 1, 2, CURRENT)).toEqual(CURRENT);
    expect(
      resampleVariantTransform({ scaleJitter: 0, rotationJitter: 0, hueJitter: 0 }, 1, 2, CURRENT),
    ).toEqual(CURRENT);
  });

  it('往返对合：old→new 再 new→old 回到原值（撤销语义的数学根基）', () => {
    const next = resampleVariantTransform(VARIANTS, 41, 87, CURRENT);
    const back = resampleVariantTransform(VARIANTS, 87, 41, next);
    expect(back.scale.x).toBeCloseTo(CURRENT.scale.x, 12);
    expect(back.rotation.y).toBeCloseTo(CURRENT.rotation.y, 12);
  });
});
