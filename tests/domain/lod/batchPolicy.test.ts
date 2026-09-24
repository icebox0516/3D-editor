/**
 * tests/domain/lod/batchPolicy.test.ts —— 批次与密度策略常量 + 确定性抽稀规则测试
 * （T006.4；T021.4 批次键迁移与密度职责废止改写）。
 *
 * 覆盖：
 * - 策略常量：BATCH_POLICY 一次锁全量锁定值（T006.5 实测锁定；数值变更须重开实测记档，
 *   并连带更新本断言——沿 LOD_THRESHOLDS 锁值先例；drawCallBudget 语义降格 Legacy
 *   Baseline 不改数值——T021.4 记档）；
 * - 密度职责废止（T021.4，D41 §八）：BATCH_POLICY 无 levelInstanceKeep 字段（旧
 *   Record<ProceduralLevel, number> 联动模型整体废除——断言键缺席防静默回潮）；
 * - 合批允许面（§九 isBatchMergeAllowed）：默认面 = legacy 等值（high 恒否、
 *   mid/low/canopy 允许）+ 按表示可配置（注入 policy 翻转断言）；
 * - 确定性抽稀规则 keepThinnedInstance：比例域（1 全保真 / ≤0 全剔除）、保留数 =
 *   ⌈n·r⌉（Bresenham 式均匀步进）、首实例恒保留（r>0）、纯函数性（同输入逐位同输出）、
 *   比例钳制边界（非法输入防御）；
 * - 密度输入面 thinInstances（§八 Density 与表示解耦的注入面）：**密度可独立变化**
 *   （同表示不同密度——density 输入显式变化、实例数单调跟随；签名不感知表示 =
 *   「表示不再触发抽稀」的结构表达）；100% 全保真零拷贝；与 keepThinnedInstance
 *   同规则；确定性。运行时密度恒 DENSITY_FULL_KEEP（021.8 A/B 通道位——不实装旋钮）。
 * 边界：纯函数零 THREE（check:layers 语义：domain 无渲染依赖）。
 */
import { describe, expect, it } from 'vitest';
import {
  BATCH_POLICY,
  DENSITY_FULL_KEEP,
  isBatchMergeAllowed,
  keepThinnedInstance,
  thinInstances,
} from '../../../src/domain/lod/batchPolicy';
import type { BatchControlPolicy } from '../../../src/domain/lod/batchPolicy';
import type { RuntimeRepresentation } from '../../../src/domain/lod/representation';

describe('BATCH_POLICY 策略常量', () => {
  it('字段齐全且锁定值一次锁全量（T006.5 实测锁定 + T021.4 批次键迁移重定义；数值变更须重开实测记档并连带更新本断言；drawCallBudget = 006.4 实测峰值 531 + ~20% 余量，Legacy Baseline 语义标注不改值）', () => {
    expect(BATCH_POLICY).toEqual({
      drawCallBudget: 650,
      budgetAlertIntervalMs: 5000,
      batchMergeAllowed: { high: false, mid: true, low: true, canopy: true },
      sparseMergeMaxInstances: 32,
      mergeGroupFactor: 2,
    });
  });

  it('levelInstanceKeep 密度职责废止（T021.4，D41 §八）：键缺席断言——旧「按档位配置保留比例」模型不得静默回潮（历史记档见模块头注：T006.4 low=0.5 被 D41 六概念分离取代）', () => {
    expect('levelInstanceKeep' in BATCH_POLICY).toBe(false);
  });

  it('Density Policy 现值：全表示默认密度 100%（唯一运行时密度；75%/50% 归 021.8 A/B 通道，不实装档位旋钮）', () => {
    expect(DENSITY_FULL_KEEP).toBe(1);
  });

  it('合并阈值与超块因子构成有效合并（因子 ≥ 2、阈值 > 0）', () => {
    expect(BATCH_POLICY.mergeGroupFactor).toBeGreaterThanOrEqual(2);
    expect(BATCH_POLICY.sparseMergeMaxInstances).toBeGreaterThan(0);
  });
});

describe('isBatchMergeAllowed 合批允许面（§九：批次键绑 representation）', () => {
  it('默认面 = legacy 等值：high 恒否（近处全保真 + 细粒度视锥剔除）、mid/low/canopy 允许（canopy 天然适合远景合批）', () => {
    expect(isBatchMergeAllowed('high')).toBe(false);
    expect(isBatchMergeAllowed('mid')).toBe(true);
    expect(isBatchMergeAllowed('low')).toBe(true);
    expect(isBatchMergeAllowed('canopy')).toBe(true);
  });

  it('按表示可配置：注入 policy 翻转逐键断言（canopy 关 / high 开——策略面重定义的消费锚点，021.8 重锁通道）', () => {
    const canopyOff: BatchControlPolicy = {
      ...BATCH_POLICY,
      batchMergeAllowed: { high: false, mid: true, low: true, canopy: false },
    };
    expect(isBatchMergeAllowed('canopy', canopyOff)).toBe(false);
    expect(isBatchMergeAllowed('low', canopyOff)).toBe(true);

    const highOn: BatchControlPolicy = {
      ...BATCH_POLICY,
      batchMergeAllowed: { high: true, mid: true, low: true, canopy: true },
    };
    expect(isBatchMergeAllowed('high', highOn)).toBe(true);

    // JS 侧手写脏表防御：缺键 / 非布尔值收 false
    const dirty = { ...BATCH_POLICY, batchMergeAllowed: { high: 1 } as never };
    expect(isBatchMergeAllowed('high', dirty)).toBe(false);
    expect(isBatchMergeAllowed('canopy', dirty)).toBe(false);
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

  it('保留结果与邻居实例无关（索引即身份——同 (seed,块,密度) 结果逐位一致的规则根基）', () => {
    // 任意两个列表中同下标实例的保留判定一致（规则只消费 index 与比例）
    const a = [0, 1, 2, 3].map((i) => keepThinnedInstance(i, 0.5));
    const b = [99, 98, 97, 96].map((_, i) => keepThinnedInstance(i, 0.5));
    expect(a).toEqual(b);
  });
});

describe('thinInstances 密度输入面（§八：Density 与 Representation 解耦）', () => {
  /** 判别用实例稳定序列（内容任意——密度规则只消费索引） */
  const list = Array.from({ length: 20 }, (_, i) => ({ id: i }));

  it('100% 全保真：DENSITY_FULL_KEEP 零拷贝返回原列表（默认行为 = 不抽稀——运行时写入路径恒本值）', () => {
    expect(thinInstances(list, DENSITY_FULL_KEEP)).toBe(list);
    expect(thinInstances(list, 1)).toBe(list);
  });

  it('密度 ≤ 0 全剔除（比例域防御）', () => {
    expect(thinInstances(list, 0)).toEqual([]);
    expect(thinInstances(list, Number.NaN)).toEqual([]);
  });

  it('【密度可独立变化 · 同表示不同密度】density 输入显式变化 → 实例数单调跟随（签名不感知表示——换表示不再触发抽稀的结构表达；75%/50% = 021.8 A/B 通道值，此处仅注入面论证）', () => {
    const full = thinInstances(list, 1);
    const threeQuarters = thinInstances(list, 0.75);
    const half = thinInstances(list, 0.5);
    expect(full.length).toBe(20);
    expect(threeQuarters.length).toBe(15); // ⌈20×0.75⌉
    expect(half.length).toBe(10); // ⌈20×0.5⌉
    expect(full.length).toBeGreaterThan(threeQuarters.length);
    expect(threeQuarters.length).toBeGreaterThan(half.length);
    // 降密结果 ⊂ 全量（索引保序——Bresenham 均匀步进）
    expect(half.every((item) => full.includes(item))).toBe(true);
  });

  it('与 keepThinnedInstance 同规则（保留集 = 索引过滤；确定性双跑逐位一致）', () => {
    const byRule = list.filter((_, index) => keepThinnedInstance(index, 0.5));
    expect(thinInstances(list, 0.5)).toEqual(byRule);
    expect(thinInstances(list, 0.5)).toEqual(thinInstances(list, 0.5));
  });

  it('【同密度不同表示 · 结构断言】密度输入对四个表示无差异化通路：同一密度值下 thinInstances 输出与表示无关（消费面差异只存在于几何档本身——运行时各表示桶实例数一致性由 ScatterChunkManager 测试断言）', () => {
    const representations: RuntimeRepresentation[] = ['high', 'mid', 'low', 'canopy'];
    const outputs = representations.map(() => thinInstances(list, DENSITY_FULL_KEEP));
    // 全表示同一（默认）密度输入 → 逐位同一输出——密度不随表示变化即解耦定义
    for (const output of outputs) expect(output).toBe(list);
    const halfOutputs = representations.map(() => thinInstances(list, 0.5));
    for (const output of halfOutputs) expect(output).toEqual(halfOutputs[0]!);
  });
});
