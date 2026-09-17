/**
 * runtime/renderLoopStats —— 1s 滑动窗口帧计数（纯计数模块，node 可测；T5.7）。
 *
 * 职责：为 getViewportStats().fps 提供数据源——只记帧时间戳，不做任何渲染逻辑；
 *      fps 口径 = 滑动窗口内的帧数（满窗时窗口内计数即每秒帧率；未满窗按已历经
 *      时间折算，避免启动初期读数偏低）。
 * 边界：零 three / 零 DOM（时间源经构造注入，缺省 performance.now）；
 *      由 Renderer 在每帧成功渲染后 tick；行为契约由 tests/runtime/renderLoopStats.test.ts 固定。
 */

export interface SlidingFrameCounterOptions {
  /** 窗口宽度（毫秒；缺省 1000） */
  windowMs?: number;
  /** 时间源（毫秒；缺省 performance.now；测试注入假时钟） */
  now?: () => number;
}

export class SlidingFrameCounter {
  private readonly windowMs: number;
  private readonly now: () => number;
  /** 窗口内帧时间戳（升序；tick 时滑出过期项） */
  private stamps: number[] = [];

  constructor(options: SlidingFrameCounterOptions = {}) {
    this.windowMs = options.windowMs ?? 1000;
    this.now = options.now ?? (() => performance.now());
  }

  /** 记录一帧（nowMs 缺省取时间源；按当前时刻滑出窗口外旧帧） */
  tick(nowMs: number = this.now()): void {
    this.stamps.push(nowMs);
    this.prune(nowMs - this.windowMs);
  }

  /** 当前帧率估计（区间速率：(帧数-1) 间隔 / 跨度 → 每秒折算；无帧 0） */
  fps(nowMs: number = this.now()): number {
    this.prune(nowMs - this.windowMs);
    const frames = this.stamps.length;
    if (frames <= 1) return frames; // 0 → 0；单帧零跨度无法估计区间率，按已发生帧数兜底
    const span = this.stamps[frames - 1]! - this.stamps[0]!;
    if (span <= 0) return frames;
    return Math.round(((frames - 1) * 1000) / span); // 每秒帧率（与窗口宽度无关的速率口径）
  }

  /** 清空计数（重启统计口径） */
  reset(): void {
    this.stamps = [];
  }

  /** 滑出 ≤ cutoff 的旧帧（滑动窗口左边界） */
  private prune(cutoff: number): void {
    if (this.stamps.length === 0 || this.stamps[0]! > cutoff) return;
    let drop = 0;
    while (drop < this.stamps.length && this.stamps[drop]! <= cutoff) drop += 1;
    this.stamps.splice(0, drop);
  }
}
