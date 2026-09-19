/**
 * tests/domain/lod/batchPolicy.test.ts —— 批次控制策略常量与确定性抽稀规则测试（T006.4）。
 *
 * 覆盖：
 * - 策略常量：BATCH_POLICY 一次锁全量候选值（候选值变更须走 006.5 实测锁定记档，
 *   并连带更新本断言——沿 LOD_THRESHOLDS 锁值先例）；
 * - 确定性抽稀规则 keepThinnedInstance：比例域（1 全保真 / ≤0 全剔除）、保留数 =
 *   ⌈n·r⌉（Bresenham 式均匀步进）、首实例恒保留（r>0）、纯函数性（同输入逐位同输出）、
 *   比例钳制边界（非法输入防御）、high 档 keep=1 全保真（近处全保真硬约束的策略表达）。
 * 边界：纯函数零 THREE（check:layers 语义：domain 无渲染依赖）。
 */
import { describe, expect, it } from 'vitest';
import { BATCH_POLICY, keepThinnedInstance } from '../../../src/domain/lod/batchPolicy';

describe('BATCH_POLICY 策略常量', () => {
  it('字段齐全且当前候选一次锁全量（候选值变更须走 006.5 实测锁定记档，并连带更新本断言；drawCallBudget = 006.4 实测峰值 531 + ~20% 余量）', () => {
    expect(BATCH_POLICY).toEqual({
      drawCallBudget: 650,
      budgetAlertIntervalMs: 5000,
      levelInstanceKeep: { high: 1, mid: 1, low: 0.5 },
      sparseMergeMaxInstances: 32,
      mergeGroupFactor: 2,
    });
  });

  it('high 档恒全保真（近处全保真硬约束的策略表达）；抽稀只作用于降档方向', () => {
    expect(BATCH_POLICY.levelInstanceKeep.high).toBe(1);
    expect(BATCH_POLICY.levelInstanceKeep.mid).toBe(1);
    expect(BATCH_POLICY.levelInstanceKeep.low).toBeLessThan(1);
  });

  it('合并阈值与超块因子构成有效合并（因子 ≥ 2、阈值 > 0）', () => {
    expect(BATCH_POLICY.mergeGroupFactor).toBeGreaterThanOrEqual(2);
    expect(BATCH_POLICY.sparseMergeMaxInstances).toBeGreaterThan(0);
  });
});

describe('keepThinnedInstance 确定性抽稀规则', () => {
  it('比例 1 = 全保真；比例 ≤ 0 = 全剔除（比例域防御）', () => {
    for (let i = 0; i < 8; i++) expect(keepThinnedInstance(i, 1)).toBe(true);
    for (let i = 0; i < 8; i++) expect(keepThinnedInstance(i, 0)).toBe(false);
    expect(keepThinnedInstance(0, Number.NaN)).toBe(false);
  });

  it('比例 ≥ 1 按全保真处理（钳制上界）', () => {
    expect(keepThinnedInstance(7, 1.5)).toBe(true);
  });

  it('保留数 ≈ n·r（±1 内——均匀步进摊开，无边缘聚集；边界等值项剔除方向保守）', () => {
    for (const [n, r] of [
      [19, 0.5],
      [20, 0.5],
      [10, 0.3],
      [33, 0.25],
      [7, 0.9],
      [1, 0.5],
      [64, 0.5],
      [15, 0.5],
    ] as const) {
      let kept = 0;
      for (let i = 0; i < n; i++) if (keepThinnedInstance(i, r)) kept += 1;
      expect(kept).toBeGreaterThanOrEqual(Math.floor(n * r));
      expect(kept).toBeLessThanOrEqual(Math.ceil(n * r));
    }
    // r = 0.5 的精确锚点：恰一半（偶数 n）
    for (const n of [20, 64] as const) {
      let kept = 0;
      for (let i = 0; i < n; i++) if (keepThinnedInstance(i, 0.5)) kept += 1;
      expect(kept).toBe(n / 2);
    }
  });

  it('首实例恒保留（r > 0）；半数比例 = 偶数序保留（空间均匀性直觉锚点）', () => {
    expect(keepThinnedInstance(0, 0.5)).toBe(true);
    expect(keepThinnedInstance(0, 0.01)).toBe(true);
    for (let i = 0; i < 6; i++) {
      expect(keepThinnedInstance(i, 0.5)).toBe(i % 2 === 0);
    }
  });

  it('纯函数性：同输入重复调用逐位同输出', () => {
    for (let i = 0; i < 12; i++) {
      const first = keepThinnedInstance(i, 0.4);
      for (let k = 0; k < 3; k++) expect(keepThinnedInstance(i, 0.4)).toBe(first);
    }
  });

  it('保留结果与邻居实例无关（索引即身份——同 (seed,块,档) 结果逐位一致的规则根基）', () => {
    // 任意两个列表中同下标实例的保留判定一致（规则只消费 index 与比例）
    const a = [0, 1, 2, 3].map((i) => keepThinnedInstance(i, 0.5));
    const b = [99, 98, 97, 96].map((_, i) => keepThinnedInstance(i, 0.5));
    expect(a).toEqual(b);
  });
});
