/**
 * tests/runtime/ViewportResizePolicy.test.ts —— 视口尺寸重设判定契约测试。
 *
 * 覆盖：
 * - 非正尺寸（0 / 负值，对应布局未稳或元素隐藏）一律不应用——等待重试；
 * - 首个正尺寸应用；重复同值不应用（幂等，避免重复 setSize 清屏）；尺寸变化再应用；
 * - applied 反映已应用尺寸（未应用为 null）；
 * - reset 强制下一次重新应用（上下文恢复后全量重建路径）；
 * - 「布局未稳 → 稳定」重试链：先 0×0 后真实尺寸仍能应用。
 */
import { describe, expect, it } from 'vitest';
import { ViewportResizePolicy } from '../../src/runtime/ViewportResizePolicy';

describe('ViewportResizePolicy', () => {
  it('非正尺寸不应用（0×0 / 负值：布局未稳或隐藏）', () => {
    const policy = new ViewportResizePolicy();
    expect(policy.shouldApply(0, 0)).toBe(false);
    expect(policy.shouldApply(300, 0)).toBe(false);
    expect(policy.shouldApply(0, 150)).toBe(false);
    expect(policy.shouldApply(-1, 100)).toBe(false);
    expect(policy.applied).toBeNull();
  });

  it('首个正尺寸应用；重复同值不应用（幂等）；变化再应用', () => {
    const policy = new ViewportResizePolicy();
    expect(policy.shouldApply(300, 150)).toBe(true);
    policy.apply(300, 150);
    expect(policy.applied).toEqual({ width: 300, height: 150 });

    expect(policy.shouldApply(300, 150)).toBe(false); // 同值：不重复 setSize
    expect(policy.shouldApply(760, 682)).toBe(true);
    policy.apply(760, 682);
    expect(policy.shouldApply(760, 682)).toBe(false);
    expect(policy.shouldApply(300, 150)).toBe(true); // 变回旧值同样视为变化
  });

  it('apply 拒绝非正尺寸（不产生非法已应用态）', () => {
    const policy = new ViewportResizePolicy();
    policy.apply(0, 0);
    policy.apply(-5, 100);
    expect(policy.applied).toBeNull();
    expect(policy.shouldApply(300, 150)).toBe(true);
  });

  it('reset 后强制重新应用（上下文恢复路径）', () => {
    const policy = new ViewportResizePolicy();
    policy.apply(760, 682);
    expect(policy.shouldApply(760, 682)).toBe(false);
    policy.reset();
    expect(policy.shouldApply(760, 682)).toBe(true);
    expect(policy.applied).toBeNull();
  });

  it('重试链：布局未稳（0×0）期间不应用，稳定后真实尺寸可应用', () => {
    const policy = new ViewportResizePolicy();
    // 模拟逐帧自检：前若干轮布局未稳
    expect(policy.shouldApply(0, 0)).toBe(false);
    expect(policy.shouldApply(0, 0)).toBe(false);
    // 布局稳定（canvas 默认 300×150 也如实应用，等待下一轮变化纠正）
    expect(policy.shouldApply(300, 150)).toBe(true);
    policy.apply(300, 150);
    // 布局最终稳定到真实视口
    expect(policy.shouldApply(760, 682)).toBe(true);
    policy.apply(760, 682);
    expect(policy.applied).toEqual({ width: 760, height: 682 });
  });
});
