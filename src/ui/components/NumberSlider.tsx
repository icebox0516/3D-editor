/**
 * ui/components/NumberSlider —— 滑杆 + 数值框（T2.4，设计系统 ed-slider）。
 *
 * 职责：number 类样式参数的标准控件（DESIGN.md §7：number → 滑杆+数值框）——
 *      range 拖动即时显示草稿，松手/键盘提交（避免逐帧命令刷爆历史）；
 *      数值框复用 NumberField 语义（Enter/失焦提交、钳制 min/max）。
 * 边界：纯受控组件；外部值变化（撤销/重做）在非拖动态同步回显；零编辑器依赖。
 */
import { useEffect, useRef, useState } from 'react';
import { NumberField } from '../panels/NumberField';

interface NumberSliderProps {
  value: number;
  onCommit: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 显示小数位（默认按 step 位数推断，无 step 时 2） */
  precision?: number;
  ariaLabel: string;
}

function precisionOf(step: number | undefined): number {
  if (!step || !Number.isFinite(step)) return 2;
  const s = String(step);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
}

export function NumberSlider({ value, onCommit, min, max, step, precision, ariaLabel }: NumberSliderProps) {
  const digits = precision ?? precisionOf(step);
  /** 拖动中的草稿（松手提交）；null = 未在拖动 */
  const [draft, setDraft] = useState<number | null>(null);
  /** 防止提交回调引发的外部值回写覆盖拖动草稿 */
  const draggingRef = useRef(false);
  const shown = draft ?? value;

  useEffect(() => {
    if (!draggingRef.current) setDraft(null);
  }, [value]);

  const clamp = (n: number): number =>
    Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

  const commitDraft = () => {
    draggingRef.current = false;
    if (draft === null) return;
    const next = clamp(draft);
    setDraft(null);
    if (Math.abs(next - value) > 10 ** -(digits + 2)) onCommit(next);
  };

  return (
    <span className="ed-slider">
      <input
        type="range"
        className="ed-slider__range"
        value={Number.isFinite(shown) ? shown : (min ?? 0)}
        min={min}
        max={max}
        step={step ?? 0.1}
        aria-label={`${ariaLabel}（滑杆）`}
        onChange={(e) => {
          draggingRef.current = true;
          setDraft(Number(e.target.value));
        }}
        onPointerUp={commitDraft}
        onKeyUp={commitDraft}
        onBlur={commitDraft}
      />
      <NumberField
        value={shown}
        precision={digits}
        step={step}
        min={min}
        max={max}
        ariaLabel={ariaLabel}
        onCommit={(next) => {
          if (!draggingRef.current) onCommit(next);
        }}
      />
    </span>
  );
}
