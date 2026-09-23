/**
 * tests/domain/lod/representation.test.ts —— Runtime 表示与提交状态契约测试（T021.1，D41）。
 *
 * 覆盖：
 * - 类型联合锁：RuntimeRepresentation 恰为四值（含 canopy、不含 impostor/culled——
 *   D27.7/D27.12 防幽灵字段 + D41 §三.1 culled 独立建模）；LodSubmitState = 'culled'
 *   字面量；LodSelectionOutcome = 表示 ∪ 提交终态（旧 LodRepresentation 的语义槽位）；
 * - 有效链三态（任务书验收）：canopy 能力链 / 无 canopy 链 / 单档链；
 * - 声明优先级：representations 优先于 levels 派生；未声明从 levels 派生；均未声明 =
 *   单档 high（lod-spec §2.2 缺省语义）；
 * - 乱序归一：声明乱序输入按固定序（high → mid → low → canopy）排列；重复去重；
 *   越类型脏值（JS 侧手写声明）防御过滤、全滤空回单档；
 * - 状态与策略类型形状：SelectionState（D41 §10.1 原文逐字段）/ ShadowPolicy（§七
 *   三字段）/ RenderBounds（球形 center + radius，与选档度量同形）；
 * - 固定序常量：REPRESENTATION_ORDER 锁序（有效链与调度序数的共同基准）。
 * 边界：纯类型 + 纯函数零 THREE（check:layers 语义：domain 无渲染依赖）。
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  effectiveRepresentationChain,
  REPRESENTATION_ORDER,
} from '../../../src/domain/lod/representation';
import type {
  LodSelectionOutcome,
  LodSubmitState,
  RenderBounds,
  RuntimeRepresentation,
  SelectionState,
  ShadowPolicy,
} from '../../../src/domain/lod/representation';
import type { Vec3 } from '../../../src/core/types';

describe('类型联合锁（D41 §三.1）', () => {
  it('RuntimeRepresentation 恰为四值：含 canopy、不含 impostor、不含 culled', () => {
    expectTypeOf<RuntimeRepresentation>().toEqualTypeOf<'high' | 'mid' | 'low' | 'canopy'>();
  });

  it("LodSubmitState = 'culled' 字面量（提交终态独立建模，非表示成员）", () => {
    expectTypeOf<LodSubmitState>().toEqualTypeOf<'culled'>();
  });

  it('LodSelectionOutcome = 表示 ∪ 提交终态（旧 LodRepresentation 的语义槽位承接）', () => {
    expectTypeOf<LodSelectionOutcome>().toEqualTypeOf<
      'high' | 'mid' | 'low' | 'canopy' | 'culled'
    >();
  });

  it('REPRESENTATION_ORDER 固定序 = high → mid → low → canopy（有效链与序数的共同基准）', () => {
    expect(REPRESENTATION_ORDER).toEqual(['high', 'mid', 'low', 'canopy']);
  });
});

describe('有效链三态（任务书验收：能力驱动，不硬编码全链）', () => {
  it('canopy 能力链：声明含 canopy → canopy 进链且居固定序末位', () => {
    expect(
      effectiveRepresentationChain({ representations: ['high', 'mid', 'canopy'] }),
    ).toEqual(['high', 'mid', 'canopy']);
    expect(
      effectiveRepresentationChain({ representations: ['high', 'mid', 'low', 'canopy'] }),
    ).toEqual(['high', 'mid', 'low', 'canopy']);
  });

  it('无 canopy 链：旧资产三档声明 → high → mid → low（canopy 不是必经表示）', () => {
    expect(effectiveRepresentationChain({ representations: ['high', 'mid', 'low'] })).toEqual([
      'high',
      'mid',
      'low',
    ]);
  });

  it('单档链：均未声明 / levels 空 / representations 空（无 levels 可派）→ 单档 high（缺省单档语义 §2.2）', () => {
    expect(effectiveRepresentationChain({})).toEqual(['high']);
    expect(effectiveRepresentationChain({ levels: [] })).toEqual(['high']);
    expect(effectiveRepresentationChain({ representations: [] })).toEqual(['high']);
    // 空 representations = 病态声明视同未声明 → 回退 levels 派生
    expect(effectiveRepresentationChain({ representations: [], levels: ['high', 'low'] })).toEqual([
      'high',
      'low',
    ]);
  });
});

describe('声明优先级与派生（representations 声明优先，levels 派生兜底）', () => {
  it('未声明 representations → 从 levels 派生（构建档位即表示能力；不完整链原样保留）', () => {
    expect(effectiveRepresentationChain({ levels: ['high', 'mid', 'low'] })).toEqual([
      'high',
      'mid',
      'low',
    ]);
    expect(effectiveRepresentationChain({ levels: ['high', 'low'] })).toEqual(['high', 'low']);
  });

  it('representations 优先于 levels（两字段并存时以 representations 为准）', () => {
    expect(
      effectiveRepresentationChain({
        representations: ['high', 'canopy'],
        levels: ['high', 'mid', 'low'],
      }),
    ).toEqual(['high', 'canopy']);
  });

  it('levels 值结构兼容 ProceduralLevel 声明（meta.levels id 集可直接投影传入）', () => {
    const levelIds: ('high' | 'mid' | 'low')[] = ['low', 'high'];
    expect(effectiveRepresentationChain({ levels: levelIds })).toEqual(['high', 'low']);
  });
});

describe('乱序归一与防御（非法序容错）', () => {
  it('声明乱序输入按固定序归一（high → mid → low → canopy）', () => {
    expect(
      effectiveRepresentationChain({
        representations: ['canopy', 'high', 'low', 'mid'],
      }),
    ).toEqual(['high', 'mid', 'low', 'canopy']);
    expect(
      effectiveRepresentationChain({ representations: ['low', 'high'] }),
    ).toEqual(['high', 'low']);
  });

  it('重复声明去重（链内每个表示至多一次）', () => {
    expect(effectiveRepresentationChain({ representations: ['low', 'low', 'high'] })).toEqual([
      'high',
      'low',
    ]);
  });

  it('越类型脏值防御过滤（JS 侧手写声明）；全滤空回单档 high', () => {
    // @ts-expect-error 运行时防御面：类型外的脏值（'impostor' 占位 / 拼错）不进链
    expect(effectiveRepresentationChain({ representations: ['impostor', 'high'] })).toEqual([
      'high',
    ]);
    // @ts-expect-error 全脏输入 = 未声明语义
    expect(effectiveRepresentationChain({ representations: ['impostor'] })).toEqual(['high']);
  });

  it('纯函数性：同输入重复调用逐位同输出', () => {
    const capability = { representations: ['canopy', 'mid', 'high'] } as const;
    expect(effectiveRepresentationChain(capability)).toEqual(
      effectiveRepresentationChain(capability),
    );
  });
});

describe('状态与策略类型形状（021.2/021.3/021.5 消费的契约面）', () => {
  it('SelectionState 形状 = D41 §10.1 原文（五字段逐位；Shadow/Density 不进状态体）', () => {
    expectTypeOf<SelectionState>().toEqualTypeOf<{
      current: RuntimeRepresentation;
      target: RuntimeRepresentation;
      sourceReady: boolean;
      transition: number;
      transitionActive: boolean;
    }>();
    const state: SelectionState = {
      current: 'high',
      target: 'mid',
      sourceReady: false,
      transition: 0,
      transitionActive: false,
    };
    expect(state).toEqual({
      current: 'high',
      target: 'mid',
      sourceReady: false,
      transition: 0,
      transitionActive: false,
    });
  });

  it('ShadowPolicy 三字段（§七：cast / receive / depth 三值）', () => {
    expectTypeOf<ShadowPolicy>().toEqualTypeOf<{
      cast: boolean;
      receive: boolean;
      depth: 'full' | 'simplified' | 'none';
    }>();
    const policy: ShadowPolicy = { cast: true, receive: true, depth: 'full' };
    expect(policy.depth).toBe('full');
  });

  it('RenderBounds 球形：center + radius（与选档度量输入同形，零 THREE 纯数据）', () => {
    expectTypeOf<RenderBounds>().toEqualTypeOf<{ center: Vec3; radius: number }>();
    const bounds: RenderBounds = { center: { x: 0, y: 1, z: 0 }, radius: 5.2 };
    expect(bounds.radius).toBeCloseTo(5.2, 12);
  });
});
