/**
 * ui/components/Splitter —— 区域分隔拖柄（T5.1）：pointer 拖拽调面板列宽 / 浏览器行高。
 *
 * 职责：命中区 4px + 视觉 1px hairline（::after 绘制，hover/active 高亮）；
 *      pointerdown 捕获指针并取拖拽基准（getValue），move 按净位移回调
 *      onResize（基准 ± 净位移，invert 用于右侧列：拖右 = 变窄）；
 *      键盘 ←→（x 轴）/ ↑↓（y 轴）步进 16px；拖拽期间 body 加 ed-dragging
 *      禁止文本选择并统一 resize 光标（app.css）。
 * 边界：纯指针换算，不含钳制（越界一律由 workspaceStore.setPanelSize 折回表内）；
 *      值的读写经回调闭包走 store 最新态（getState），组件自身零布局状态。
 */
import { useRef } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

interface SplitterProps {
  /** 拖拽轴：'x' = 列宽（左右拖，竖直分隔线），'y' = 行高（上下拖，水平分隔线） */
  axis: 'x' | 'y';
  /** 拖拽起始时读取当前尺寸（拖拽期间不重读，保证净位移换算稳定） */
  getValue(): number;
  /** 尺寸回调：基准值 ± 净位移（invert 时反向）；越界由 store 钳制 */
  onResize(px: number): void;
  /** 无障碍名（如「调整左面板宽度」） */
  label: string;
  /** 反向量纲（右侧面板列：拖右 = 变窄） */
  invert?: boolean;
}

/** 键盘步进（px）：一次方向键的增减量 */
const KEY_STEP_PX = 16;

export function Splitter({ axis, getValue, onResize, label, invert = false }: SplitterProps) {
  /** 拖拽会话：起始指针坐标 + 起始基准尺寸 */
  const drag = useRef<{ start: number; base: number } | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    drag.current = { start: axis === 'x' ? e.clientX : e.clientY, base: getValue() };
    e.currentTarget.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.classList.add('ed-dragging', axis === 'x' ? 'ed-dragging--x' : 'ed-dragging--y');
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const session = drag.current;
    if (!session) return;
    const delta = (axis === 'x' ? e.clientX : e.clientY) - session.start;
    onResize(session.base + (invert ? -delta : delta));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    document.body.classList.remove('ed-dragging', 'ed-dragging--x', 'ed-dragging--y');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === (axis === 'x' ? 'ArrowRight' : 'ArrowUp')) delta = KEY_STEP_PX;
    else if (e.key === (axis === 'x' ? 'ArrowLeft' : 'ArrowDown')) delta = -KEY_STEP_PX;
    else return;
    e.preventDefault();
    onResize(getValue() + (invert ? -delta : delta));
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      className={`ed-splitter ed-splitter--${axis}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    />
  );
}
