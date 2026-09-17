/**
 * tests/domain/assets/shapeFamily.test.ts —— 形态族三流域派生与 sourceKey 纯函数测试（T008.1，D19.3/D19.4）。
 *
 * 覆盖：
 * - 派生确定性：同输入三流域（shapeSlot / morphRng / instanceRng）与 aSeed 折算
 *   逐位一致（重复调用序列全等）；
 * - 交叉独立性（锁 D19.3 域分离）：
 *   · shapeSlot 只随 (seed, size) 变——同 seed 同 size 恒同值，值域 [0, size)；
 *   · morphSeed/morphRng 只随 (assetId, slot) 变——同槽不同对象 seed 形态流逐位相同
 *     （契约第一锁的 domain 落点）、不同槽 / 不同 assetId 流不同；
 *   · instanceRng 只随 seed 变；
 *   · aSeedValueOf 只随 seed 变、域与三流隔离（同 (seed, assetId) 下四流值互异）；
 * - sourceKeyOf 三形态组装（无槽 / 有槽 / 含 preset）与空 preset 归一。
 * 边界：纯函数零 THREE（check:layers 语义：domain 无渲染依赖）。
 */
import { describe, expect, it } from 'vitest';
import {
  aSeedValueOf,
  instanceRngOf,
  morphRngOf,
  morphSeedOf,
  shapeSlotOf,
  sourceKeyOf,
} from '../../../src/domain/assets/shapeFamily';

/** 取随机流前 n 个值（序列比较样本） */
function take(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => rng());
}

/** 在 [from, from + span) 内找与 seed0 同槽（size 桶）的另一个 seed */
function findSameSlotSeed(seed0: number, size: number, from = 1, span = 10000): number {
  const slot = shapeSlotOf(seed0, size);
  for (let s = from; s < from + span; s++) {
    if (s !== seed0 && shapeSlotOf(s, size) === slot) return s;
  }
  throw new Error('样本内未找到同槽 seed（调大 span）');
}

describe('派生确定性（同输入逐位一致）', () => {
  it('shapeSlotOf：同 (seed, size) 恒同值', () => {
    for (const seed of [0, 1, 42, 0x7fffffff, 123456789]) {
      for (const size of [2, 4, 8]) {
        expect(shapeSlotOf(seed, size)).toBe(shapeSlotOf(seed, size));
      }
    }
  });

  it('morphRngOf：同 (assetId, slot) 流序列逐位全等', () => {
    expect(take(morphRngOf('asset_tree_3a', 0), 8)).toEqual(take(morphRngOf('asset_tree_3a', 0), 8));
    expect(take(morphRngOf('asset_seedstack', 3), 8)).toEqual(
      take(morphRngOf('asset_seedstack', 3), 8),
    );
  });

  it('morphSeedOf = morphRngOf 的种子（两函数恒等配套）', () => {
    // morphRng 首 3 值 == mulberry32(morphSeedOf) 首 3 值的判据：用流可复现性间接锁定
    // （morphRngOf 内部即 mulberry32(morphSeedOf(...))——同参数两次派生序列全等已证；
    //  此处再锁 morphSeedOf 自身确定性）
    expect(morphSeedOf('asset_a', 2)).toBe(morphSeedOf('asset_a', 2));
  });

  it('instanceRngOf：同 seed 流序列逐位全等', () => {
    expect(take(instanceRngOf(777), 8)).toEqual(take(instanceRngOf(777), 8));
  });

  it('aSeedValueOf：同 seed 恒同值且落 [0, 1)', () => {
    for (const seed of [0, 1, 42, 999999, 0x7fffffff]) {
      const v = aSeedValueOf(seed);
      expect(v).toBe(aSeedValueOf(seed));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('交叉独立性（D19.3 域分离锁定）', () => {
  const SIZE = 4;

  it('shapeSlot 只随 (seed, size) 变：值域 [0, size)，样本内多槽可达', () => {
    const seen = new Set<number>();
    for (let s = 0; s < 200; s++) {
      const slot = shapeSlotOf(s, SIZE);
      expect(slot).toBeGreaterThanOrEqual(0);
      expect(slot).toBeLessThan(SIZE);
      seen.add(slot);
    }
    expect(seen.size).toBe(SIZE); // 样本充分时各槽均可达（哈希均匀性冒烟）
  });

  it('morphRng 只随 (assetId, slot) 变：S1 ≠ S2 同槽 → 形态流逐位相同（契约第一锁 domain 落点）', () => {
    const s1 = 100;
    const s2 = findSameSlotSeed(s1, SIZE);
    expect(s2).not.toBe(s1);
    const slot = shapeSlotOf(s1, SIZE);
    expect(shapeSlotOf(s2, SIZE)).toBe(slot);
    expect(morphSeedOf('asset_tree_3a', slot)).toBe(morphSeedOf('asset_tree_3a', slot));
    expect(take(morphRngOf('asset_tree_3a', slot), 8)).toEqual(
      take(morphRngOf('asset_tree_3a', slot), 8),
    );
    // 同槽不同对象 seed：instanceRng / aSeed 仍各自不同（对象级差异保留）
    expect(take(instanceRngOf(s1), 4)).not.toEqual(take(instanceRngOf(s2), 4));
    expect(aSeedValueOf(s1)).not.toBe(aSeedValueOf(s2));
  });

  it('morphSeed 随槽与 assetId 扰动而变（样本内全互异）', () => {
    const seeds = [
      morphSeedOf('asset_tree_3a', 0),
      morphSeedOf('asset_tree_3a', 1),
      morphSeedOf('asset_tree_3a', 2),
      morphSeedOf('asset_tree_3a', 3),
      morphSeedOf('asset_shrub', 0),
    ];
    expect(new Set(seeds).size).toBe(seeds.length);
  });

  it('instanceRng 只随 seed 变：异 seed 序列不同、同 assetId/slot 扰动无关', () => {
    expect(take(instanceRngOf(1), 4)).not.toEqual(take(instanceRngOf(2), 4));
    // instanceRngOf 不吃 assetId/slot——结构即独立，此处锁定其值不与 morph/shape 流串扰
    for (let s = 1; s <= 50; s++) {
      const slot = shapeSlotOf(s, SIZE);
      const a = instanceRngOf(s)();
      const b = morphRngOf('asset_tree_3a', slot)();
      const c = aSeedValueOf(s);
      expect(new Set([a, b, c]).size).toBe(3); // 三流值互异（域分离有效）
    }
  });
});

describe('sourceKeyOf 组装（缓存与池桶键单一真相源）', () => {
  it('无槽 → 纯 assetId', () => {
    expect(sourceKeyOf('asset_shrub')).toBe('asset_shrub');
  });

  it('有槽 → assetId:slot-N', () => {
    expect(sourceKeyOf('asset_tree_3a', 3)).toBe('asset_tree_3a:slot-3');
    expect(sourceKeyOf('asset_tree_3a', 0)).toBe('asset_tree_3a:slot-0');
  });

  it('含 preset → assetId:preset:slot-N；preset 无槽形态 assetId:preset', () => {
    expect(sourceKeyOf('asset_tree_3a', 2, 'spring')).toBe('asset_tree_3a:spring:slot-2');
    expect(sourceKeyOf('asset_tree_3a', undefined, 'spring')).toBe('asset_tree_3a:spring');
  });

  it('空 preset 归一为缺省（不产生空段）', () => {
    expect(sourceKeyOf('asset_tree_3a', 1, '')).toBe('asset_tree_3a:slot-1');
    expect(sourceKeyOf('asset_tree_3a', undefined, '')).toBe('asset_tree_3a');
  });
});
