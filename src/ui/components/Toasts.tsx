/**
 * ui/components/Toasts —— 右下角 Toast 浮层呈现（T5.8，需求第三十四章）。
 *
 * 职责：消费 useToastStore 队列渲染右下角浮层——
 *   - 周期 tick（250ms）驱动过期驱逐（TTL 4.5s，归 toastReducer）；
 *   - 手动关闭（× 钮 → dismiss）；
 *   - 无障碍：容器 aria-live="polite"（追加即播报、不打断）、条目 role="status"；
 *   - 不抢焦点（无 autofocus/focus 调用——提示不得打断键盘流）。
 * 边界：纯呈现；视觉复用「夜间制图台」令牌（--z-toast / --danger / 琥珀 info 左线，
 *      沿 .ed-notice 先例语义），类名登记 DESIGN.md §5.11。
 */
import { useEffect } from 'react';
import { useToastStore } from '../feedback/toastStore';

/** 过期驱逐轮询间隔（毫秒；< TTL/2 保证视觉及时性） */
const TICK_INTERVAL_MS = 250;

export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const tick = useToastStore((s) => s.tick);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (toasts.length === 0) return; // 空队列不挂定时器
    const timer = window.setInterval(() => tick(), TICK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [toasts.length, tick]);

  if (toasts.length === 0) return null;

  return (
    <div className="ed-toasts" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className={`ed-toast ed-toast--${toast.kind}`}>
          <span className="ed-toast__text">{toast.text}</span>
          <button
            type="button"
            className="ed-toast__close"
            aria-label="关闭提示"
            tabIndex={-1}
            onClick={() => dismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
