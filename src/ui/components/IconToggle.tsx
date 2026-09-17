/**
 * ui/components/IconToggle —— 图标开关（T2.4，设计系统 ed-icon-toggle）。
 *
 * 职责：小图标二态按钮（role=switch）——场景大纲/图层的眼睛（显示）、锁（锁定）行内开关，
 *      以及样式参数 boolean 类型的开关控件；点击切换并回调（stopPropagation，不触发
 *      所在行的点选等父级行为），琥珀高亮 = 当前开启。
 * 边界：纯受控展示组件（checked 由外部数据源驱动）；图标以内联 SVG 子元素传入；
 *      一切颜色/字号经 tokens.css 变量（DESIGN.md §5.2）。
 */
import type { ReactNode } from 'react';

interface IconToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** 无障碍名称（aria-label；缺省用 title） */
  label: string;
  title?: string;
  children: ReactNode;
}

export function IconToggle({ checked, onChange, label, title, children }: IconToggleProps) {
  return (
    <button
      type="button"
      className={`ed-icon-toggle${checked ? ' ed-icon-toggle--on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={title ?? label}
      onClick={(e) => {
        e.stopPropagation(); // 行内开关点击不触发所在行的点选/展开等父级行为
        onChange(!checked);
      }}
    >
      {children}
    </button>
  );
}

/** 眼睛图标（显示开关）：开=实心描边，关=斜杠 */
export function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
      <path
        d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4S1.5 8 1.5 8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      {off ? <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.3" /> : null}
    </svg>
  );
}

/** 锁图标（锁定开关）：开=闭合锁，关=开锁（锁梁抬起） */
export function LockIcon({ open }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1" fill="currentColor" />
      {open ? (
        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
      ) : (
        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      )}
    </svg>
  );
}

/** 定位图标（场景树搜索定位 → focusObjects） */
export function FocusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <line x1="8" y1="1" x2="8" y2="4" stroke="currentColor" strokeWidth="1.3" />
      <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.3" />
      <line x1="1" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="1.3" />
      <line x1="12" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
