/**
 * tests/domain/assets/colorPresets.test.ts —— 色卡读侧归一纯函数测试（T024.1，D44 #4）。
 *
 * 覆盖（resolveDeclaredPreset 四路语义：缺省 / 合法 / 未知 / 空表）：
 * - preset 缺省 / 空串 → undefined（默认卡——不进 sourceKey 的缺省路径）；
 * - 声明表内的卡 id → 原值返回；
 * - 声明表外的 id（已删卡 / 脏数据）→ undefined（读侧宽容回退 default，不抛错）；
 * - 空表 / 表缺省（无色卡资产）→ 任何非空 preset 均归一 undefined；
 * - 表内存在 id 相同的重复声明时按「存在即合法」返回（卡 id 唯一性归整表锁断言，
 *   本函数不做去重判定）。
 */
import { describe, expect, it } from 'vitest';
import { resolveDeclaredPreset } from '../../../src/domain/assets';
import type { AssetColorPresetMeta } from '../../../src/domain/assets';

const GINKGO_PRESETS: readonly AssetColorPresetMeta[] = [
  { id: 'default', label: '默认', swatch: '#8ab45d' },
  { id: 'autumn', label: '秋·金黄', swatch: '#e0b34a' },
];

describe('resolveDeclaredPreset：色卡读侧归一', () => {
  it('preset 缺省 / 空串 → undefined（默认卡）', () => {
    expect(resolveDeclaredPreset(GINKGO_PRESETS, undefined)).toBeUndefined();
    expect(resolveDeclaredPreset(GINKGO_PRESETS, '')).toBeUndefined();
  });

  it('声明表内的卡 id → 原值返回（default 与季相卡同权）', () => {
    expect(resolveDeclaredPreset(GINKGO_PRESETS, 'default')).toBe('default');
    expect(resolveDeclaredPreset(GINKGO_PRESETS, 'autumn')).toBe('autumn');
  });

  it('声明表外的 id → undefined（已删卡/脏数据宽容回退 default，不抛错）', () => {
    expect(resolveDeclaredPreset(GINKGO_PRESETS, 'spring')).toBeUndefined();
    expect(resolveDeclaredPreset(GINKGO_PRESETS, 'autumn ')).toBeUndefined(); // 无 trim——逐值判定
  });

  it('空表 / 表缺省（无色卡资产）→ 非空 preset 一律归一 undefined', () => {
    expect(resolveDeclaredPreset([], 'autumn')).toBeUndefined();
    expect(resolveDeclaredPreset([], 'default')).toBeUndefined();
    expect(resolveDeclaredPreset(undefined, 'autumn')).toBeUndefined();
  });

  it('缺省 preset 在空表 / 表缺省下同样 undefined（全组合安全）', () => {
    expect(resolveDeclaredPreset([], undefined)).toBeUndefined();
    expect(resolveDeclaredPreset(undefined, undefined)).toBeUndefined();
  });

  it('表内重复 id 按存在即合法返回（唯一性归整表锁，本函数不去重）', () => {
    const dup: readonly AssetColorPresetMeta[] = [
      { id: 'default', label: '默认', swatch: '#8ab45d' },
      { id: 'default', label: '默认（重复声明）', swatch: '#8ab45d' },
    ];
    expect(resolveDeclaredPreset(dup, 'default')).toBe('default');
  });
});
