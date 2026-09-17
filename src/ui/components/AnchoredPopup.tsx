/**
 * ui/components/AnchoredPopup —— 锚定弹层（T9.1 层叠治理核心载体）。
 *
 * 职责：把工具条/面板内的下拉与子弹层 portal 到 App 根部浮层容器
 * （.ed-popup-root，z 取 --z-popover），逃逸宿主层叠上下文——五大工具条/面板
 * 均为带 z-index 的 grid/flex item，内联弹层的 z100 只在宿主内有效、对外等效
 * z10，再按 DOM 序与后来者比拼（被 contextbar 盖顶 / 压不过视口 HUD 等）。
 * 行为约定：
 *   - 锚定语义不变：贴锚展开、对齐、翻边逻辑照旧（定位计算归 popupLayer
 *     纯函数，四种策略与改造前 CSS 锚定一一对应）；
 *   - 测量期隐藏渲染（visibility:hidden）取弹层实尺寸后定位（ContextMenu 先例）；
 *     window resize / 锚与弹层尺寸变化（ResizeObserver）重测；
 *   - 统一「点击外部关闭」：点击锚与根浮层容器之外回调 onOutsidePointerDown
 *     （同层其他弹层视作内部——两层弹层并开时互不误关），各组件原有
 *     document 监听据此移除；
 *   - 事件冒泡沿 React 树：portal 内键盘事件仍冒泡到宿主组件的 onKeyDown
 *     （Esc 关闭等既有手势不变）。
 * 边界：React 组件壳不进 node 测试（沿 Tooltip.tsx 注释先例）；挂载目标解析与
 *      定位纯逻辑在 popupLayer.ts 单测锁定；不引入定位库（自研 CSS 先例延续）。
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from 'react';
import { computeAnchoredPopupRect, findPopupRoot, resolvePopupContainer } from './popupLayer';
import type { PopupPlacement } from './popupLayer';

export interface AnchoredPopupProps {
  /** 定位锚（宿主包装元素或触发钮；其 rect 即锚框） */
  anchorRef: RefObject<HTMLElement | null>;
  /** 锚定策略（贴锚语义见 popupLayer.PopupPlacement） */
  placement: PopupPlacement;
  /** 附加类名（拼接在通用弹层原语 .ed-menu__popup 之后，如 ed-layout__popup） */
  className?: string;
  id?: string;
  role?: string;
  ariaLabel?: string;
  onKeyDown?: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  /** 点击锚与根浮层容器之外时回调（关闭语义；组件接管 document pointerdown 监听） */
  onOutsidePointerDown?: () => void;
  children: ReactNode;
}

export function AnchoredPopup({
  anchorRef,
  placement,
  className,
  id,
  role,
  ariaLabel,
  onKeyDown,
  onOutsidePointerDown,
  children,
}: AnchoredPopupProps) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  /** 测量前 null：先隐藏渲染取尺寸，再定位（ContextMenu 测量期先例） */
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  /** 关闭回调经 ref 持有：渲染闭包更新不重挂 document 监听 */
  const outsideRef = useRef(onOutsidePointerDown);
  outsideRef.current = onOutsidePointerDown;

  // 定位：锚 rect + 弹层实测尺寸 → 纯函数求视口坐标（收边/翻边在内）；
  // 等值收敛守卫防「setState 新对象 → 重渲染 → 再测量」死循环（ContextMenu 先例）
  useLayoutEffect(() => {
    const el = popupRef.current;
    const anchorEl = anchorRef.current;
    if (!el || !anchorEl) return;
    const measure = (): void => {
      const next = computeAnchoredPopupRect(
        anchorEl.getBoundingClientRect(),
        el.getBoundingClientRect(),
        { width: window.innerWidth, height: window.innerHeight },
        placement,
      );
      setPos((prev) => (prev && prev.left === next.left && prev.top === next.top ? prev : next));
    };
    measure();
    window.addEventListener('resize', measure);
    const observer = new ResizeObserver(measure); // 锚移动 / 弹层内容尺寸变化重测
    observer.observe(anchorEl);
    observer.observe(el);
    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, [anchorRef, placement]);

  // 点击外部关闭（各组件原 document 监听的统一接替）：锚内 / 本弹层内 /
  // 根浮层容器内（同层其他弹层，两层并开互不误关）不算外部
  useEffect(() => {
    if (!onOutsidePointerDown) return;
    const onDocPointerDown = (e: Event): void => {
      if (!(e.target instanceof Node)) return;
      if (anchorRef.current?.contains(e.target)) return;
      if (popupRef.current?.contains(e.target)) return;
      if (findPopupRoot(document)?.contains(e.target)) return;
      outsideRef.current?.();
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 回调经 ref 持有，仅挂卸一次
  }, [anchorRef]);

  const anchor = anchorRef.current;
  if (anchor === null) return null; // 锚未挂载（首开即锚已在：弹层总在用户交互后展开）
  return createPortal(
    <div
      ref={popupRef}
      id={id}
      role={role}
      aria-label={ariaLabel}
      className={className ? `ed-menu__popup ${className}` : 'ed-menu__popup'}
      style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>,
    resolvePopupContainer(document),
  );
}
