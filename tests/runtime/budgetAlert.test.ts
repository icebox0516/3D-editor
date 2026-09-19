/**
 * tests/runtime/budgetAlert.test.ts —— draw call 预算超限节流告警测试（T006.4）。
 *
 * 覆盖：首个超限帧立即告警；节流窗口内连续超限只告警一次（不刷屏）；过窗口仍超限
 * 再告警；回到预算内静默；窗口边界（恰满 interval 可再告警）；预算内帧永不告警；
 * 缺省消费 BATCH_POLICY（预算候选值的策略消费锚点）。
 * 边界：纯计数模块（零 THREE 零 DOM）——时间源与告警通道注入假时钟/spy。
 */
import { describe, expect, it, vi } from 'vitest';
import { BATCH_POLICY } from '../../src/domain/lod/batchPolicy';
import { BudgetAlert } from '../../src/runtime/budgetAlert';

function makeAlert(overrides: Partial<ConstructorParameters<typeof BudgetAlert>[0]> = {}) {
  let now = 0;
  const warn = vi.fn();
  const alert = new BudgetAlert({ now: () => now, warn, ...overrides });
  return { alert, warn, advance: (ms: number) => (now += ms) };
}

describe('BudgetAlert 超限节流告警', () => {
  it('首个超限帧立即告警（携带超限值与预算）', () => {
    const { alert, warn } = makeAlert({ budget: 100 });
    alert.frame(101);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(101, 100);
  });

  it('节流窗口内连续超限只告警一次；过窗口仍超限再告警', () => {
    const { alert, warn, advance } = makeAlert({ budget: 100, intervalMs: 5000 });
    alert.frame(150);
    for (let i = 0; i < 60; i++) {
      advance(16);
      alert.frame(160 + i); // 连续超限帧（模拟 1s@60fps）
    }
    expect(warn).toHaveBeenCalledTimes(1);
    advance(5000); // 恰过节流窗口
    alert.frame(200);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenLastCalledWith(200, 100);
  });

  it('回到预算内静默；再超限若仍在窗口内也不告警', () => {
    const { alert, warn, advance } = makeAlert({ budget: 100, intervalMs: 5000 });
    alert.frame(150); // 告警一次
    advance(1000);
    alert.frame(90); // 回预算内——静默
    expect(warn).toHaveBeenCalledTimes(1);
    advance(1000); // 窗口内（2000 < 5000）
    alert.frame(150);
    expect(warn).toHaveBeenCalledTimes(1); // 仍静默
  });

  it('恰在窗口边界（= interval）可再告警', () => {
    const { alert, warn, advance } = makeAlert({ budget: 100, intervalMs: 5000 });
    alert.frame(150);
    advance(4999);
    alert.frame(150);
    expect(warn).toHaveBeenCalledTimes(1);
    advance(1); // 累计恰 5000
    alert.frame(150);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('预算内帧（含恰等于预算）永不告警', () => {
    const { alert, warn, advance } = makeAlert({ budget: 100 });
    for (let i = 0; i < 100; i++) {
      advance(100);
      alert.frame(i % 2 === 0 ? 100 : 42);
    }
    expect(warn).not.toHaveBeenCalled();
  });

  it('缺省消费 BATCH_POLICY 候选值（策略消费锚点）', () => {
    const { alert, warn } = makeAlert(); // 不传 budget → BATCH_POLICY.drawCallBudget
    alert.frame(BATCH_POLICY.drawCallBudget + 1);
    expect(warn).toHaveBeenCalledWith(BATCH_POLICY.drawCallBudget + 1, BATCH_POLICY.drawCallBudget);
  });
});
