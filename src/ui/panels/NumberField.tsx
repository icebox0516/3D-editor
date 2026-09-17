/**
 * ui/panels/NumberField —— 数值输入（等宽 tabular 数字，提交式编辑）。
 *
 * 职责：本地草稿编辑，Enter / 失焦提交（值有效且变化才回调 onCommit），Escape 还原；
 *      外部值变化（撤销/重做/其他来源）在非编辑态同步回显示。
 * 边界：纯展示组件，不知晓命令；调用方在 onCommit 中构造 Command 交历史执行。
 */
import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface NumberFieldProps {
  value: number;
  onCommit: (next: number) => void;
  /** 显示小数位（默认 2） */
  precision?: number;
  step?: number;
  min?: number;
  max?: number;
  /** 轴标识（x/y/z），显示在输入框左侧 */
  axis?: string;
  ariaLabel: string;
}

function format(value: number, precision: number): string {
  return Number.isFinite(value) ? value.toFixed(precision) : '';
}

export function NumberField({ value, onCommit, precision = 2, step, min, max, axis, ariaLabel }: NumberFieldProps) {
  const [draft, setDraft] = useState(() => format(value, precision));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(format(value, precision));
  }, [value, precision, editing]);

  const commit = () => {
    setEditing(false);
    const next = Number(draft);
    if (!Number.isFinite(next)) {
      setDraft(format(value, precision));
      return;
    }
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next));
    if (Math.abs(clamped - value) < 10 ** -(precision + 2)) {
      setDraft(format(value, precision));
      return;
    }
    onCommit(clamped);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setDraft(format(value, precision));
      setEditing(false);
      e.currentTarget.blur();
    }
  };

  const input = (
    <input
      className="ed-input ed-input--num"
      type="number"
      inputMode="decimal"
      value={draft}
      step={step}
      min={min}
      max={max}
      aria-label={ariaLabel}
      onFocus={() => setEditing(true)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );

  return axis ? (
    <span className="ed-axis" data-axis={axis}>
      {input}
    </span>
  ) : (
    input
  );
}
