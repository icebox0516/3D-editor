/**
 * tests/domain/lod/shadowPolicy.test.ts —— 阴影策略常量与判定纯函数测试（T021.5，D41 §七）。
 *
 * 覆盖：
 * - 初始策略表「一次锁全量」：四表示三字段逐表示断言（数值变更须记档并连带更新本
 *   断言——沿 LOD_THRESHOLDS / BATCH_POLICY 锁值先例；mid depth 与 canopy receive
 *   是 021.8 A/B 点名复核位，模块头注生产足迹记档同文）；
 * - culled 提交终态 = off：CULLED_SHADOW_POLICY 三字段 + 不进 byRepresentation 表
 *   （终态非表示，D41 §三.1——经查询函数宽化入参映射到达）；
 * - shadowPolicyOf 查询：逐表示查表返回表值（零克隆同引用）；入参宽化
 *   LodSelectionOutcome（'culled' → off）；覆盖注入（021.8 A/B 通道形态——mid
 *   depth simplified / canopy receive 开）；JS 侧手写脏表防御收 off（batchPolicy
 *   isBatchMergeAllowed 收 false 先例——缺键 / 非布尔 / 非法 depth）；
 * - isShadowCasterFor 过渡期 cast 判定原语（统一规则 = policy.cast ∧ 表示 ===
 *   阴影表示）：稳态四表示全 caster；dither 中点两侧恰一侧（mid 桶在阴影表示
 *   mid/canopy 两侧翻转、canopy 桶反向）；cast=false 注入恒不 caster；纯函数性；
 *   fade-out 语义锚点（阴影表示恒 current → caster 持续——终态零提交归 runtime
 *   机制，域函数不感知提交态）。
 * 边界：纯函数零 THREE（check:layers 语义：domain 无渲染依赖）。midpointCrossed
 *      边沿事件不被消费（留诊断面——无状态推导优先，记档口径）由 transition 域
 *      测试锁定事件面本身。
 */
import { describe, expect, it } from 'vitest';
import {
  CULLED_SHADOW_POLICY,
  isShadowCasterFor,
  SHADOW_POLICY,
  shadowPolicyOf,
} from '../../../src/domain/lod/shadowPolicy';
import type { ShadowPolicyTable } from '../../../src/domain/lod/shadowPolicy';
import type { RuntimeRepresentation } from '../../../src/domain/lod/representation';

const REPRESENTATIONS: readonly RuntimeRepresentation[] = ['high', 'mid', 'low', 'canopy'];

describe('SHADOW_POLICY 初始策略表（D41 §七 + T021.5 裁定）', () => {
  it('一次锁全量：四表示三字段（mid depth simplified 化与 canopy receive=false 是 021.8 A/B 复核位——改值须记档并连带更新本断言）', () => {
    expect(SHADOW_POLICY).toEqual({
      high: { cast: true, receive: true, depth: 'full' },
      mid: { cast: true, receive: true, depth: 'full' },
      low: { cast: true, receive: true, depth: 'simplified' },
      canopy: { cast: true, receive: false, depth: 'simplified' },
    });
  });

  it('culled 提交终态 = off：三字段全关 + 不进 byRepresentation 表（终态非表示——经宽化入参映射，D41 §三.1）', () => {
    expect(CULLED_SHADOW_POLICY).toEqual({ cast: false, receive: false, depth: 'none' });
    expect('culled' in SHADOW_POLICY).toBe(false);
    expect(shadowPolicyOf('culled')).toBe(CULLED_SHADOW_POLICY);
  });
});

describe('shadowPolicyOf 查询（入参宽化 LodSelectionOutcome；覆盖注入沿 batchPolicy 先例）', () => {
  it('逐表示查表返回表值（零克隆——同对象引用）', () => {
    for (const rep of REPRESENTATIONS) {
      expect(shadowPolicyOf(rep)).toBe(SHADOW_POLICY[rep]);
    }
  });

  it('覆盖注入：021.8 A/B 通道形态——mid depth simplified（表值候选位）与 canopy receive 开', () => {
    const ab: ShadowPolicyTable = {
      ...SHADOW_POLICY,
      mid: { cast: true, receive: true, depth: 'simplified' },
      canopy: { cast: true, receive: true, depth: 'simplified' },
    };
    expect(shadowPolicyOf('mid', ab)).toEqual({ cast: true, receive: true, depth: 'simplified' });
    expect(shadowPolicyOf('canopy', ab).receive).toBe(true);
    // 缺省表不受注入影响
    expect(shadowPolicyOf('mid').depth).toBe('full');
    expect(shadowPolicyOf('canopy').receive).toBe(false);
  });

  it('JS 侧手写脏表防御收 off（缺键 / 非布尔 / 非法 depth——保守方向，isBatchMergeAllowed 先例）', () => {
    const dirty = {
      high: { cast: 1, receive: true, depth: 'full' }, // cast 非布尔
      mid: undefined, // 缺键
      low: { cast: true, receive: true, depth: 'ultra' }, // 非法 depth
      canopy: null, // 非对象
    } as unknown as ShadowPolicyTable;
    for (const rep of REPRESENTATIONS) {
      expect(shadowPolicyOf(rep, dirty)).toBe(CULLED_SHADOW_POLICY);
    }
    // 'culled' 不经表（脏表不影响终态映射）
    expect(shadowPolicyOf('culled', dirty)).toBe(CULLED_SHADOW_POLICY);
  });
});

describe('isShadowCasterFor 过渡期 cast 判定（统一规则原语：policy.cast ∧ 表示 === 阴影表示）', () => {
  it('稳态：四表示（表初值全 cast）下表示 === 阴影表示 → caster', () => {
    for (const rep of REPRESENTATIONS) {
      expect(isShadowCasterFor(rep, rep)).toBe(true);
    }
  });

  it('dither 中点两侧恰一侧：mid↔canopy 双向——mid 桶在阴影表示 mid（中点前）cast / canopy（中点后）不 cast；canopy 桶反向', () => {
    // 降档 dither（current=mid, target=canopy）：中点前 shadowRepresentation=mid、后 = canopy
    expect(isShadowCasterFor('mid', 'mid')).toBe(true); // 中点前 current 侧
    expect(isShadowCasterFor('canopy', 'mid')).toBe(false); // 中点前 target 侧（客座不 cast）
    expect(isShadowCasterFor('mid', 'canopy')).toBe(false); // 中点后 current 侧让棒
    expect(isShadowCasterFor('canopy', 'canopy')).toBe(true); // 中点后 target 侧
    // 升档 dither（current=canopy, target=mid）同规则反向成立
    expect(isShadowCasterFor('canopy', 'canopy')).toBe(true);
    expect(isShadowCasterFor('mid', 'mid')).toBe(true);
  });

  it('不匹配表示恒不 cast（跨表示无 caster——shadowRepresentation 唯一性）', () => {
    for (const rep of REPRESENTATIONS) {
      for (const shadow of REPRESENTATIONS) {
        if (rep === shadow) continue;
        expect(isShadowCasterFor(rep, shadow)).toBe(false);
      }
    }
  });

  it('cast=false 注入 → 恒不 caster（即便表示匹配——策略门优先）', () => {
    const castOff: ShadowPolicyTable = {
      high: { cast: false, receive: true, depth: 'full' },
      mid: { cast: false, receive: true, depth: 'full' },
      low: { cast: false, receive: true, depth: 'simplified' },
      canopy: { cast: false, receive: false, depth: 'simplified' },
    };
    for (const rep of REPRESENTATIONS) {
      expect(isShadowCasterFor(rep, rep, castOff)).toBe(false);
    }
  });

  it('fade-out 语义锚点：退场期阴影表示恒 current（= 桶表示）→ caster 持续到 culled（终态零提交归 runtime visible/零缩放机制 + cast/receive belt-and-braces——域函数不感知提交态）', () => {
    // Low/Canopy → Culled 退场带内：shadowRepresentation = current 不变
    expect(isShadowCasterFor('low', 'low')).toBe(true);
    expect(isShadowCasterFor('canopy', 'canopy')).toBe(true);
  });

  it('纯函数性：同输入重复调用逐位同输出', () => {
    for (const rep of REPRESENTATIONS) {
      const first = isShadowCasterFor(rep, 'canopy');
      for (let i = 0; i < 3; i++) expect(isShadowCasterFor(rep, 'canopy')).toBe(first);
    }
  });
});
