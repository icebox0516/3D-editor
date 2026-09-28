/**
 * tests/domain/lod/editingPin.test.ts —— 编辑态优先级 pin 合成纯函数测试（T021.7，D41 §十二）。
 *
 * 覆盖：
 * - pinned=true：任意调度产出（mid/low/canopy/**culled**）→ 链内 high（含解除超远
 *   裁剪——选中/聚焦远处对象所见即所得）；high 原值恒等；
 * - pinned=true + 未声明 high 的奇异链 → resolveDeclaredRepresentation 最近已声明回落
 *   （「Runtime 只请求已声明表示」纪律，与 lodEnabled=false 分支同式）；
 * - pinned=false：identity（任何产出原样返回——既有调度路径零行为变化）；
 * - 空链防御：pinned 高档回落单档语义（resolveDeclaredRepresentation 契约）。
 */
import { describe, expect, it } from 'vitest';
import { pinnedSelectionOutcome } from '../../../src/domain/lod/editingPin';

const FULL_CHAIN = ['high', 'mid', 'canopy'] as const;
const LEGACY_CHAIN = ['high', 'mid', 'low'] as const;

describe('pinnedSelectionOutcome：pin 覆盖为链内 high', () => {
  it('pinned=true：远端表示（mid/low/canopy）→ high', () => {
    for (const chain of [FULL_CHAIN, LEGACY_CHAIN]) {
      expect(pinnedSelectionOutcome('mid', true, chain)).toBe('high');
      expect(pinnedSelectionOutcome('low', true, chain)).toBe('high');
      expect(pinnedSelectionOutcome('canopy', true, chain)).toBe('high');
    }
  });

  it('pinned=true：culled 提交终态同样覆盖为 high（解除超远裁剪）', () => {
    expect(pinnedSelectionOutcome('culled', true, FULL_CHAIN)).toBe('high');
    expect(pinnedSelectionOutcome('culled', true, LEGACY_CHAIN)).toBe('high');
  });

  it('pinned=true：high 原值恒等（无换档）', () => {
    expect(pinnedSelectionOutcome('high', true, FULL_CHAIN)).toBe('high');
  });

  it('pinned=false：identity——全部产出域原样返回（含 culled）', () => {
    for (const outcome of ['high', 'mid', 'low', 'canopy', 'culled'] as const) {
      expect(pinnedSelectionOutcome(outcome, false, FULL_CHAIN)).toBe(outcome);
    }
  });

  it('奇异链（未声明 high）→ 最近已声明回落（只请求已声明表示纪律）', () => {
    // high(0) 到 mid(1) 距 1、到 canopy(3) 距 3 → 最近 = mid（与 selection 无关——pin 恒求链内 high）
    expect(pinnedSelectionOutcome('canopy', true, ['mid', 'canopy'])).toBe('mid');
    expect(pinnedSelectionOutcome('low', true, ['mid', 'canopy'])).toBe('mid');
  });

  it('空链防御：回落单档 high 语义', () => {
    expect(pinnedSelectionOutcome('culled', true, [])).toBe('high');
    expect(pinnedSelectionOutcome('canopy', true, [])).toBe('high');
  });
});
