/**
 * tests/runtime/RenderLoop.test.ts —— 渲染循环时序/容错契约测试。
 *
 * 覆盖：
 * - 启动/排程：start 排程恰好一帧；重复 start 不叠加；每帧执行后自动排程下一帧；
 * - 异常兜底：帧回调抛错 → 上报一次（final=false）且循环继续（下一帧照常执行）；
 *   成功一帧后连败计数复位，新一轮失败会再次上报（仍每轮一次）；
 * - 熔断：连败达到阈值 → 补一条终止上报（final=true）并停止排程，帧回调不再执行；
 *   阈值 <= 0 永不熔断；
 * - 生命周期：stop 取消已排程帧（迟到回调不执行帧）且幂等；dispose 后 start 永久 no-op。
 */
import { describe, expect, it, vi } from 'vitest';
import { RenderLoop } from '../../src/runtime/RenderLoop';

/** 假帧时钟：手动逐个触发已排程回调（模拟 requestAnimationFrame 手递手） */
function createFakeClock() {
  const pending: Array<{ id: number; callback: () => void; cancelled: boolean }> = [];
  let nextId = 1;
  const requestFrame = (callback: () => void): number => {
    const entry = { id: nextId++, callback, cancelled: false };
    pending.push(entry);
    return entry.id;
  };
  const cancelFrame = (handle: number): void => {
    const entry = pending.find((e) => e.id === handle);
    if (entry) entry.cancelled = true;
  };
  /** 触发最早一个未取消的回调；返回是否执行了帧 */
  const flushOne = (): boolean => {
    while (pending.length > 0) {
      const entry = pending.shift()!;
      if (!entry.cancelled) {
        entry.callback();
        return true;
      }
    }
    return false;
  };
  return {
    requestFrame,
    cancelFrame,
    flushOne,
    activeCount: () => pending.filter((e) => !e.cancelled).length,
  };
}

/** 组装被测循环（假时钟 + 收集上报） */
function assemble(frame: () => void, maxConsecutiveErrors?: number) {
  const clock = createFakeClock();
  const errors: Array<{ err: unknown; final: boolean }> = [];
  const loop = new RenderLoop({
    frame,
    requestFrame: clock.requestFrame,
    cancelFrame: clock.cancelFrame,
    reportError: (err, final) => errors.push({ err, final }),
    ...(maxConsecutiveErrors !== undefined ? { maxConsecutiveErrors } : {}),
  });
  return { loop, clock, errors };
}

describe('RenderLoop 启动与排程', () => {
  it('start 排程恰好一帧；帧执行后自动排程下一帧', () => {
    const frame = vi.fn();
    const { loop, clock } = assemble(frame);
    loop.start();
    expect(clock.activeCount()).toBe(1);

    expect(clock.flushOne()).toBe(true);
    expect(frame).toHaveBeenCalledTimes(1);
    expect(clock.activeCount()).toBe(1); // 下一帧已排程
    expect(loop.isRunning).toBe(true);
  });

  it('重复 start 不叠加排程（幂等）', () => {
    const { loop, clock } = assemble(vi.fn());
    loop.start();
    loop.start();
    expect(clock.activeCount()).toBe(1);
  });

  it('stop 取消已排程帧：迟到的回调不再执行帧；stop 幂等', () => {
    const frame = vi.fn();
    const { loop, clock } = assemble(frame);
    loop.start();
    loop.stop();
    loop.stop();
    expect(loop.isRunning).toBe(false);
    expect(clock.flushOne()).toBe(false); // 已取消
    expect(frame).not.toHaveBeenCalled();

    loop.start(); // stop 后可再次启动
    expect(clock.flushOne()).toBe(true);
    expect(frame).toHaveBeenCalledTimes(1);
  });

  it('dispose 后 start 永久 no-op', () => {
    const frame = vi.fn();
    const { loop, clock } = assemble(frame);
    loop.start();
    loop.dispose();
    expect(clock.activeCount()).toBe(0);
    loop.start();
    expect(clock.activeCount()).toBe(0);
    expect(loop.isRunning).toBe(false);
    expect(frame).not.toHaveBeenCalled();
  });
});

describe('RenderLoop 异常兜底与熔断', () => {
  it('帧抛错：上报一次（final=false）且循环继续', () => {
    const boom = new Error('frame boom');
    let calls = 0;
    const { loop, clock, errors } = assemble(() => {
      calls += 1;
      if (calls === 1) throw boom;
    });
    loop.start();

    clock.flushOne(); // 第 1 帧抛错
    expect(errors).toEqual([{ err: boom, final: false }]);
    expect(clock.activeCount()).toBe(1); // 循环未死：下一帧已排程

    clock.flushOne(); // 第 2 帧成功
    expect(calls).toBe(2);
    expect(errors).toHaveLength(1); // 不重复上报
  });

  it('成功一帧后计数复位：新一轮失败会再次上报（仍每轮一次）', () => {
    let calls = 0;
    const { loop, clock, errors } = assemble(() => {
      calls += 1;
      if (calls === 1 || calls === 3) throw new Error(`boom-${calls}`);
    });
    loop.start();
    clock.flushOne(); // 抛错 → 上报 1
    clock.flushOne(); // 成功 → 复位
    clock.flushOne(); // 再抛错 → 新一轮上报
    expect(errors.map((e) => (e.err as Error).message)).toEqual(['boom-1', 'boom-3']);
    expect(clock.activeCount()).toBe(1); // 循环仍活
  });

  it('连败达到阈值：补终止上报（final=true）并停止排程', () => {
    const boom = new Error('persistent boom');
    const frame = vi.fn(() => {
      throw boom;
    });
    const { loop, clock, errors } = assemble(frame, 3);
    loop.start();

    expect(clock.flushOne()).toBe(true); // 1 连败：上报
    expect(clock.flushOne()).toBe(true); // 2 连败：不重复上报
    expect(clock.flushOne()).toBe(true); // 3 连败：熔断 + 终止上报
    expect(errors).toEqual([
      { err: boom, final: false },
      { err: boom, final: true },
    ]);
    expect(loop.isRunning).toBe(false);
    expect(clock.activeCount()).toBe(0); // 不再排程
    expect(clock.flushOne()).toBe(false);
    expect(frame).toHaveBeenCalledTimes(3);
  });

  it('maxConsecutiveErrors <= 0：永不熔断，循环持续', () => {
    const frame = vi.fn(() => {
      throw new Error('forever');
    });
    const { loop, clock, errors } = assemble(frame, 0);
    loop.start();
    for (let i = 0; i < 10; i += 1) clock.flushOne();
    expect(frame).toHaveBeenCalledTimes(10);
    expect(loop.isRunning).toBe(true);
    expect(clock.activeCount()).toBe(1);
    expect(errors).toHaveLength(1); // 首错一次，不刷屏
  });
});
