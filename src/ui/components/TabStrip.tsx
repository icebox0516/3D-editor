/**
 * ui/components/TabStrip —— 通用标签条（T5.3，T5.4 复用）。
 *
 * 职责：面板内双/多标签切换（Scene Outliner「场景大纲 / 图层管理」）——
 *      role=tablist/tab、←→ 键盘切换（焦点跟随选择）、Home/End 跳边界；
 *      激活态琥珀下划线（沿用面板语言「琥珀 = 正在被操作」，零新令牌）。
 * 边界：纯受控展示组件（activeId 由外部驱动，onChange 回调上抛）；
 *      无路由、无持久化；标签内容渲染归各面板。
 */
import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

export interface TabStripTab {
  id: string;
  label: string;
}

interface TabStripProps {
  tabs: readonly TabStripTab[];
  activeId: string;
  onChange(id: string): void;
  /** tablist 无障碍名（如「左面板视图」） */
  ariaLabel: string;
}

export function TabStrip({ tabs, activeId, onChange, ariaLabel }: TabStripProps) {
  const buttonsRef = useRef(new Map<string, HTMLButtonElement>());

  const focusTab = (id: string): void => {
    buttonsRef.current.get(id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string): void => {
    const index = tabs.findIndex((t) => t.id === id);
    if (index === -1) return;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next]!.id); // 焦点跟随选择（工具型面板的高频切换习惯）
    focusTab(tabs[next]!.id);
  };

  return (
    <div className="ed-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) buttonsRef.current.set(tab.id, el);
              else buttonsRef.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            className={`ed-tabs__tab${active ? ' ed-tabs__tab--active' : ''}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
