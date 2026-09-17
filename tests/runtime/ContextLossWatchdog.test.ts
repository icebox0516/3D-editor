/**
 * tests/runtime/ContextLossWatchdog.test.ts —— WebGL 上下文丢失看门狗契约测试。
 *
 * 覆盖：
 * - webglcontextlost：preventDefault（保留浏览器恢复通道）+ 上报恰好一次（重复事件与
 *   轮询 notifyLost 汇入同一去重）；
 * - webglcontextrestored：触发 onRestored、复位丢失态与上报标记（再丢失会重新上报）；
 * - attach 幂等（双挂载不会重复监听/重复上报）；detach 移除监听（事件不再生效）。
 */
import { describe, expect, it, vi } from 'vitest';
import { ContextLossWatchdog } from '../../src/runtime/ContextLossWatchdog';

function dispatch(target: EventTarget, type: string): Event {
  const event = new Event(type, { cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('ContextLossWatchdog', () => {
  it('丢失事件：preventDefault + 上报一次；重复事件与轮询 notifyLost 去重', () => {
    const target = new EventTarget();
    const reportLost = vi.fn();
    const watchdog = new ContextLossWatchdog({ target, reportLost });
    watchdog.attach();

    const event = dispatch(target, 'webglcontextlost');
    expect(event.defaultPrevented).toBe(true); // 允许后续恢复
    expect(reportLost).toHaveBeenCalledTimes(1);
    expect(watchdog.isLost).toBe(true);

    dispatch(target, 'webglcontextlost');
    watchdog.notifyLost(); // 轮询通道兜底
    expect(reportLost).toHaveBeenCalledTimes(1);
  });

  it('恢复事件：触发 onRestored 并复位标记；再丢失重新上报', () => {
    const target = new EventTarget();
    const reportLost = vi.fn();
    const onRestored = vi.fn();
    const watchdog = new ContextLossWatchdog({ target, reportLost, onRestored });
    watchdog.attach();

    dispatch(target, 'webglcontextlost');
    dispatch(target, 'webglcontextrestored');
    expect(onRestored).toHaveBeenCalledTimes(1);
    expect(watchdog.isLost).toBe(false);

    dispatch(target, 'webglcontextlost');
    expect(reportLost).toHaveBeenCalledTimes(2); // 新一轮丢失重新上报
  });

  it('attach 幂等：重复挂载只登记一组监听（单轮丢失只上报一次）', () => {
    const target = new EventTarget();
    const reportLost = vi.fn();
    const watchdog = new ContextLossWatchdog({ target, reportLost });
    watchdog.attach();
    watchdog.attach();

    dispatch(target, 'webglcontextlost');
    expect(reportLost).toHaveBeenCalledTimes(1);
  });

  it('detach 移除监听：detach 后事件不再上报；再 attach 恢复监听', () => {
    const target = new EventTarget();
    const reportLost = vi.fn();
    const watchdog = new ContextLossWatchdog({ target, reportLost });
    watchdog.attach();

    dispatch(target, 'webglcontextlost');
    expect(reportLost).toHaveBeenCalledTimes(1);

    watchdog.detach();
    watchdog.detach(); // 幂等
    dispatch(target, 'webglcontextlost');
    dispatch(target, 'webglcontextrestored');
    expect(reportLost).toHaveBeenCalledTimes(1);

    watchdog.attach();
    dispatch(target, 'webglcontextrestored'); // 重挂后先收到恢复（复位标记）
    dispatch(target, 'webglcontextlost');
    expect(reportLost).toHaveBeenCalledTimes(2);
  });

  it('detach 不复位去重标记：同一丢失周期内重挂不重复上报', () => {
    const target = new EventTarget();
    const reportLost = vi.fn();
    const watchdog = new ContextLossWatchdog({ target, reportLost });
    watchdog.attach();
    dispatch(target, 'webglcontextlost');
    watchdog.detach();
    watchdog.attach();
    dispatch(target, 'webglcontextlost'); // 仍处同一丢失周期（未收到恢复）
    expect(reportLost).toHaveBeenCalledTimes(1);
  });
});
