/**
 * tests/runtime/lodDistribution.test.ts —— LOD 分布双口径计数器测试（T006.4，D27.9；
 * T021.3 过渡计数面升级）。
 *
 * 覆盖：双口径独立累加（实例/桶）；表示键恒全（T021.1 键联合随 LodSelectionOutcome
 * 补 'canopy' 键位——canopy 恒 0 直至 021.2/021.6 接线，断言连带机械补键）；addDistribution
 * 两链聚合（T021.3：过渡计数面一并合并）；snapshot 深冻结只读（内部继续累计不影响已发
 * 快照）；reset 清零口径重启；T021.3 过渡计数面（addTransition 独立累加 / 缺省 0 /
 * DC 增量可观测字段）。
 * 边界：纯计数模块（零 THREE 零 DOM，node 可测——renderLoopStats 先例同构）。
 */
import { describe, expect, it } from 'vitest';
import { LodDistributionCounter, emptyLodDistribution } from '../../src/runtime/lodDistribution';

describe('LodDistributionCounter 双口径计数', () => {
  it('双口径独立累加；表示键恒全（零值键不缺；canopy 接线前恒 0）', () => {
    const counter = new LodDistributionCounter();
    counter.add('high', 10, 2);
    counter.add('high', 5); // buckets 缺省 0
    counter.add('low', 100, 30);
    counter.add('culled', 7, 1);
    const snap = counter.snapshot();
    expect(snap.instances).toEqual({ high: 15, mid: 0, low: 100, canopy: 0, culled: 7 });
    expect(snap.buckets).toEqual({ high: 2, mid: 0, low: 30, canopy: 0, culled: 1 });
    expect(snap.transition).toEqual({ instances: 0, buckets: 0, dualSubmitBuckets: 0 }); // T021.3 缺省
  });

  it('addDistribution 聚合两链分布（Renderer 出口语义；过渡计数面一并合并）', () => {
    const counter = new LodDistributionCounter();
    counter.addDistribution({
      instances: { high: 3, mid: 4, low: 5, canopy: 0, culled: 6 },
      buckets: { high: 1, mid: 1, low: 1, canopy: 0, culled: 1 },
      transition: { instances: 9, buckets: 2, dualSubmitBuckets: 1 },
    });
    counter.addDistribution({
      instances: { high: 30, mid: 0, low: 50, canopy: 0, culled: 0 },
      buckets: { high: 10, mid: 0, low: 5, canopy: 0, culled: 0 },
      transition: { instances: 4, buckets: 1, dualSubmitBuckets: 0 },
    });
    const snap = counter.snapshot();
    expect(snap.instances).toEqual({ high: 33, mid: 4, low: 55, canopy: 0, culled: 6 });
    expect(snap.buckets).toEqual({ high: 11, mid: 1, low: 6, canopy: 0, culled: 1 });
    expect(snap.transition).toEqual({ instances: 13, buckets: 3, dualSubmitBuckets: 1 });
  });

  it('addDistribution 容缺过渡字段的旧形分布（防御——缺 transition 不炸、按 0 并入）', () => {
    const counter = new LodDistributionCounter();
    counter.addDistribution({
      instances: { high: 1, mid: 0, low: 0, canopy: 0, culled: 0 },
      buckets: { high: 1, mid: 0, low: 0, canopy: 0, culled: 0 },
    } as Parameters<typeof counter.addDistribution>[0]);
    expect(counter.snapshot().transition).toEqual({
      instances: 0,
      buckets: 0,
      dualSubmitBuckets: 0,
    });
  });

  it('T021.3 addTransition：过渡计数三字段独立累加（DC 增量可观测面）', () => {
    const counter = new LodDistributionCounter();
    counter.addTransition(12, 3, 2); // 12 过渡实例 / 3 过渡桶 / 2 双表示客座桶
    counter.addTransition(1); // 仅实例（缺省 0）
    counter.addTransition(0, 0, 5); // 仅 dual
    const snap = counter.snapshot();
    expect(snap.transition).toEqual({ instances: 13, buckets: 3, dualSubmitBuckets: 7 });
    expect(Object.isFrozen(snap.transition)).toBe(true);
  });

  it('snapshot 深冻结只读——快照后继续累计不影响已发快照', () => {
    const counter = new LodDistributionCounter();
    counter.add('high', 1, 1);
    counter.addTransition(1, 1, 1);
    const snap = counter.snapshot();
    counter.add('high', 100, 100);
    counter.addTransition(100, 100, 100);
    expect(snap.instances.high).toBe(1);
    expect(snap.buckets.high).toBe(1);
    expect(snap.transition.instances).toBe(1);
    expect(Object.isFrozen(snap.instances)).toBe(true);
    expect(Object.isFrozen(snap.buckets)).toBe(true);
    expect(Object.isFrozen(snap.transition)).toBe(true);
  });

  it('reset 清零（口径重启）', () => {
    const counter = new LodDistributionCounter();
    counter.add('mid', 8, 3);
    counter.addTransition(8, 3, 3);
    counter.reset();
    expect(counter.snapshot()).toEqual(emptyLodDistribution());
  });
});
