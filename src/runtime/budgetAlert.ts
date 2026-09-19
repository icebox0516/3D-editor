/**
 * runtime/budgetAlert —— draw call 预算超限节流告警（纯计数模块，node 可测；T006.4）。
 *
 * 职责：为「超预算运行时告警（console 日志侧）」提供节流判定——每帧喂入最近一帧 draw call
 *      数（renderer.info.render.calls 口径），超预算且距上次告警 ≥ intervalMs 才触发一次
 *      告警回调（缺省 console.warn；首个超限帧立即告警）。不做任何运行时降级——预算是
 *      治理观测面，降级手段归档位策略（006.5 验收门裁定）。
 * 边界：零 THREE / 零 DOM（时间源与告警通道经构造注入；缺省 performance.now / console.warn
 *      ——测试注入假时钟与 spy）。行为契约由 tests/runtime/budgetAlert.test.ts 固定。
 *      沿 renderLoopStats 先例：Renderer 持有实例（会话私有，D17），绝不模块级单例。
 */

import { BATCH_POLICY } from '../domain/lod/batchPolicy';

export interface BudgetAlertOptions {
  /** 预算上限（缺省 BATCH_POLICY.drawCallBudget） */
  budget?: number;
  /** 告警最小间隔毫秒（缺省 BATCH_POLICY.budgetAlertIntervalMs） */
  intervalMs?: number;
  /** 时间源（毫秒；缺省 performance.now；测试注入假时钟） */
  now?: () => number;
  /** 告警通道（缺省 console.warn；测试注入 spy） */
  warn?: (drawCalls: number, budget: number) => void;
}

export class BudgetAlert {
  private readonly budget: number;
  private readonly intervalMs: number;
  private readonly now: () => number;
  private readonly warn: (drawCalls: number, budget: number) => void;
  /** 上次告警时刻（毫秒；undefined = 尚未告警过——首个超限帧立即告警） */
  private lastWarnAt: number | undefined;

  constructor(options: BudgetAlertOptions = {}) {
    this.budget = options.budget ?? BATCH_POLICY.drawCallBudget;
    this.intervalMs = options.intervalMs ?? BATCH_POLICY.budgetAlertIntervalMs;
    this.now = options.now ?? (() => performance.now());
    this.warn =
      options.warn ??
      ((drawCalls, budget) =>
        console.warn(
          `[Renderer] draw calls 超预算：${drawCalls} > ${budget}（BATCH_POLICY.drawCallBudget 候选值，待 006.5 实测锁定）——批次治理观测告警，非降级`,
        ));
  }

  /** 喂入一帧 draw call 数：超预算且过节流间隔 → 告警一次（其余帧静默） */
  frame(drawCalls: number): void {
    if (drawCalls <= this.budget) return;
    const t = this.now();
    if (this.lastWarnAt !== undefined && t - this.lastWarnAt < this.intervalMs) return;
    this.lastWarnAt = t;
    this.warn(drawCalls, this.budget);
  }
}
