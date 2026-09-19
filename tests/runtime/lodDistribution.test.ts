/**
 * tests/runtime/lodDistribution.test.ts —— LOD 分布双口径计数器测试（T006.4，D27.9）。
 *
 * 覆盖：双口径独立累加（实例/桶）；四表示档键恒全；addDistribution 两链聚合；
 * snapshot 深冻结只读（内部继续累计不影响已发快照）；reset 清零口径重启。
 * 边界：纯计数模块（零 THREE 零 DOM，node 可测——renderLoopStats 先例同构）。
 */
import { describe, expect, it } from 'vitest';
import { LodDistributionCounter, emptyLodDistribution } from '../../src/runtime/lodDistribution';

describe('LodDistributionCounter 双口径计数', () => {
  it('双口径独立累加；四表示档键恒全（零值键不缺）', () => {
    const counter = new LodDistributionCounter();
    counter.add('high', 10, 2);
    counter.add('high', 5); // buckets 缺省 0
    counter.add('low', 100, 30);
    counter.add('culled', 7, 1);
    const snap = counter.snapshot();
    expect(snap.instances).toEqual({ high: 15, mid: 0, low: 100, culled: 7 });
    expect(snap.buckets).toEqual({ high: 2, mid: 0, low: 30, culled: 1 });
  });

  it('addDistribution 聚合两链分布（Renderer 出口语义）', () => {
    const counter = new LodDistributionCounter();
    counter.addDistribution({
      instances: { high: 3, mid: 4, low: 5, culled: 6 },
      buckets: { high: 1, mid: 1, low: 1, culled: 1 },
    });
    counter.addDistribution({
      instances: { high: 30, mid: 0, low: 50, culled: 0 },
      buckets: { high: 10, mid: 0, low: 5, culled: 0 },
    });
    const snap = counter.snapshot();
    expect(snap.instances).toEqual({ high: 33, mid: 4, low: 55, culled: 6 });
    expect(snap.buckets).toEqual({ high: 11, mid: 1, low: 6, culled: 1 });
  });

  it('snapshot 深冻结只读——快照后继续累计不影响已发快照', () => {
    const counter = new LodDistributionCounter();
    counter.add('high', 1, 1);
    const snap = counter.snapshot();
    counter.add('high', 100, 100);
    expect(snap.instances.high).toBe(1);
    expect(snap.buckets.high).toBe(1);
    expect(Object.isFrozen(snap.instances)).toBe(true);
    expect(Object.isFrozen(snap.buckets)).toBe(true);
  });

  it('reset 清零（口径重启）', () => {
    const counter = new LodDistributionCounter();
    counter.add('mid', 8, 3);
    counter.reset();
    expect(counter.snapshot()).toEqual(emptyLodDistribution());
  });
});
