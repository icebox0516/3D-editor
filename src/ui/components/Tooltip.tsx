/**
 * ui/components/Tooltip —— 轻量悬停提示（T5.6；T9.1 换边避让增补）。
 *
 * 职责：为单个交互子元素（按钮等）提供 hover / 键盘 focus 触发的延迟提示浮层：
 *   - 内容 = 名称（必填）+ 键帽（可选）+ 一句提示（可选），面向垂直工具条等图标按钮；
 *   - 延迟 ≤300ms（缺省 250ms 出现，离开立即消失），CSS 过渡 160ms；
 *   - 换边避让（T9.1 门裁定：保留 CSS 贴靠方案、不逃逸宿主）：展开后测量宿主与
 *     浮层尺寸，贴靠边在屏幕边缘放不下时翻到对侧（近缘向内弹；垂直条右贴不受
 *     影响），两侧皆放不下维持原边——决策归 popupLayer.resolveTooltipSide 纯函数；
 *     测量期隐藏渲染防闪（ContextMenu 测量期先例）；
 *   - 无障碍：浮层 role=tooltip + id，经 cloneElement 注入子元素 aria-describedby，
 *     使屏幕阅读器在子元素聚焦时播报提示内容。
 * 边界：纯展示组件（受控内容无内部状态机之外的逻辑）；定位为纯 CSS（side 变体，
 *      缺省 right 贴靠垂直条），不引入第三方定位库；node 测试不渲染组件壳
 *      （沿 tests/ui 既有形态），GUI 效果留浏览器验收。
 */
import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { resolveTooltipSide } from './popupLayer';
import type { TooltipSide } from './popupLayer';

export type { TooltipSide };

export interface TooltipProps {
  /** 提示主体（名称 / 动作） */
  label: string;
  /** 键帽提示（如 "1"、"W"）；缺省不渲染 */
  keys?: string;
  /** 一句补充说明；缺省不渲染 */
  hint?: string;
  /** 浮层贴靠方向（缺省 right，垂直工具条右贴）；屏幕边缘放不下时自动换对侧 */
  side?: TooltipSide;
  /** 出现延迟毫秒（≤300；缺省 250） */
  delay?: number;
  /** 唯一交互子元素（提示事件的宿主与 aria-describedby 注入目标） */
  children: ReactElement;
}

export function Tooltip({ label, keys, hint, side = 'right', delay = 250, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  /** 换边避让测量结果（null = 测量期：隐藏渲染取尺寸，防换边闪跳） */
  const [resolvedSide, setResolvedSide] = useState<TooltipSide | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const scheduleShow = () => {
    clearTimer();
    timer.current = setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    clearTimer();
    setOpen(false);
  };

  useEffect(clearTimer, []);

  // 换边避让（T9.1）：展开后测量——贴靠边越屏幕缘翻对侧（popupLayer 纯函数决策）；
  // 内容变化（label/keys/hint 改宽度）随依赖重测；关闭即复位
  useLayoutEffect(() => {
    if (!open) {
      setResolvedSide(null);
      return;
    }
    const host = hostRef.current;
    const tooltip = tooltipRef.current;
    if (!host || !tooltip) return;
    const next = resolveTooltipSide(
      host.getBoundingClientRect(),
      tooltip.getBoundingClientRect(),
      { width: window.innerWidth, height: window.innerHeight },
      side,
    );
    setResolvedSide(next);
  }, [open, side, label, keys, hint]);

  // aria-describedby 注入：聚焦 / 悬停子元素时读屏器可播报浮层内容
  const host = open
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': tooltipId,
      })
    : children;

  const effectiveSide = resolvedSide ?? side;

  return (
    <span
      ref={hostRef}
      className={`ed-tooltip__host ed-tooltip__host--${effectiveSide}`}
      onPointerEnter={scheduleShow}
      onPointerLeave={hide}
      onFocus={scheduleShow}
      onBlur={hide}
    >
      {host}
      {open ? (
        <span
          ref={tooltipRef}
          className="ed-tooltip"
          role="tooltip"
          id={tooltipId}
          style={resolvedSide === null ? { visibility: 'hidden' } : undefined}
        >
          <span className="ed-tooltip__label">
            {label}
            {keys ? <kbd className="ed-kbd">{keys}</kbd> : null}
          </span>
          {hint ? <span className="ed-tooltip__hint">{hint}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
