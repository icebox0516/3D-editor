/**
 * tests/editor/services/snapTiersConfig.test.ts —— 吸附分级共享配置测试（T8.1，先测后码）。
 *
 * 覆盖：
 * - 缺省构造：总开关开 / 角度分项开 / 步长 15°（Unity 默认档）/ 高度分项开；
 * - angleSnapToRadians：合法角度 → 弧度（degToRad）；非法（≤0 / 非有限）→ null（不吸附）；
 *   预设档 5/15/45 → π/36 / π/12 / π/4；
 * - 结构约定：纯数据共享可变对象（沿 ObjectSnapConfig 先例；会话级偏好不入历史不持久化）。
 */
import { describe, expect, it } from 'vitest';
import {
  ANGLE_STEP_PRESETS_DEG,
  DEFAULT_ANGLE_STEP_DEG,
  angleSnapToRadians,
  createSnapTiersConfig,
} from '../../../src/editor/services/snapTiersConfig';

describe('createSnapTiersConfig · 缺省值', () => {
  it('总开关开 / 角度开 / 步长 15° / 高度开', () => {
    const cfg = createSnapTiersConfig();
    expect(cfg.masterEnabled).toBe(true);
    expect(cfg.angleEnabled).toBe(true);
    expect(cfg.angleStepDeg).toBe(15);
    expect(cfg.elevationEnabled).toBe(true);
  });

  it('预设档为 5 / 15 / 45（下拉固定档）', () => {
    expect(ANGLE_STEP_PRESETS_DEG).toEqual([5, 15, 45]);
    expect(DEFAULT_ANGLE_STEP_DEG).toBe(15);
  });
});

describe('angleSnapToRadians · 步长换算（弧度）', () => {
  it('预设档：5°→π/36、15°→π/12、45°→π/4', () => {
    expect(angleSnapToRadians(5)).toBeCloseTo(Math.PI / 36, 12);
    expect(angleSnapToRadians(15)).toBeCloseTo(Math.PI / 12, 12);
    expect(angleSnapToRadians(45)).toBeCloseTo(Math.PI / 4, 12);
  });

  it('自由数值：30° → π/6', () => {
    expect(angleSnapToRadians(30)).toBeCloseTo(Math.PI / 6, 12);
  });

  it('非法步长（≤0 / NaN / Infinity）→ null（不吸附）', () => {
    expect(angleSnapToRadians(0)).toBeNull();
    expect(angleSnapToRadians(-15)).toBeNull();
    expect(angleSnapToRadians(Number.NaN)).toBeNull();
    expect(angleSnapToRadians(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
