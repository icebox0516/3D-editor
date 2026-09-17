/**
 * tests/runtime/renderLoopStats.test.ts —— 1s 滑动窗口帧计数纯模块测试（T5.7，先测后码）。
 *
 * 覆盖（任务书「fps 由 RenderLoop 维护的 1s 滑动窗口帧计数（纯计数模块，node 可测）」）：
 * - 无帧 → fps 0；
 * - 区间速率口径：(帧数-1) 间隔 / 跨度折算每秒帧率（60fps 流 → 60，满窗/未满窗一致）；
 * - 滑动语义：新帧进入后 windowMs 前的旧帧出窗（不累计无限增长、旧样本不稀释读数）；
 * - 自定义窗口宽度与 now 注入（假时钟，不依赖 performance.now）。
 */
import { describe, expect, it } from 'vitest';
import { SlidingFrameCounter } from '../../src/runtime/renderLoopStats';

/** 以 60fps（16.666ms 间隔）驱动 n 帧；返回推进后的假时钟当前值 */
function tick60fps(counter: SlidingFrameCounter, frames: number, start = 0): number {
  let t = start;
  for (let i = 0; i < frames; i += 1) {
    counter.tick(t);
    t += 1000 / 60;
  }
  return t;
}

describe('SlidingFrameCounter：1s 滑动窗口帧计数', () => {
  it('无帧 → fps 0', () => {
    const counter = new SlidingFrameCounter({ now: () => 0 });
    expect(counter.fps()).toBe(0);
  });

  it('满窗：窗口内帧数即 fps（60fps 流 → 60）', () => {
    const counter = new SlidingFrameCounter({ now: () => 0 });
    let now = tick60fps(counter, 61, 0); // 0..1000ms 共 61 帧
    counter.tick(now); // 第 62 帧（t≈1016.7）：出窗 0ms 旧帧
    now += 1000 / 60;
    expect(counter.fps(now)).toBe(60); // 窗口 (16.7, 1016.7] 内恰 60 帧
  });

  it('未满窗：按已历经时间折算（前 31 帧 / 0.5s → ≈61fps，不显示 31）', () => {
    const counter = new SlidingFrameCounter({ now: () => 0 });
    const now = tick60fps(counter, 31, 0); // 0..500ms
    const fps = counter.fps(now);
    expect(fps).toBeGreaterThanOrEqual(59);
    expect(fps).toBeLessThanOrEqual(63);
  });

  it('滑动出窗：1s 前的帧不再计入（低帧率恢复后读数随窗口滑动）', () => {
    const counter = new SlidingFrameCounter({ now: () => 0 });
    // 前 1s 只有 5 帧（5fps）
    let now = 0;
    for (let i = 0; i < 5; i += 1) {
      counter.tick(now);
      now += 200;
    }
    expect(counter.fps(now)).toBe(5); // 满窗 5 帧
    // 之后 1s 恢复 60fps：旧 5 帧滑出，读数收敛到新窗口
    now = tick60fps(counter, 60, now);
    const fps = counter.fps(now);
    expect(fps).toBeGreaterThanOrEqual(59); // 旧帧已出窗，不被稀释
    expect(fps).toBeLessThanOrEqual(60);
  });

  it('自定义窗口宽度（500ms 窗口）：速率口径仍为每秒帧率（60fps 流 → 60，不因窗口减半）', () => {
    const counter = new SlidingFrameCounter({ windowMs: 500, now: () => 0 });
    let now = 0;
    for (let i = 0; i < 31; i += 1) {
      counter.tick(now);
      now += 1000 / 60;
    }
    expect(counter.fps(now)).toBe(60); // fps 是每秒速率：窗口只决定样本范围，不缩放读数
  });

  it('reset 清空计数', () => {
    const counter = new SlidingFrameCounter({ now: () => 0 });
    tick60fps(counter, 30, 0);
    counter.reset();
    expect(counter.fps()).toBe(0);
  });
});
