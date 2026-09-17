/**
 * ui/components/PanelFrame —— 统一面板壳（T5.1）：标题条（折叠 + 可选隐藏）+ 内容区。
 *
 * 职责：面板分区折叠（workspaceStore.collapsedSections 按 sectionKey 记账，
 *      折叠收成 28px 标题条，内容区 display:none 挂起——保留滚动位置与草稿）；
 *      区域级隐藏（onHide 由装配层提供：整列/整行收起归零，视口自动扩展）。
 * 边界：纯展示 + workspaceStore 订阅，不感知面板内容；沿用 .ed-panel 视觉语言
 *      （小型大写标题 / hairline / 零新装饰，DESIGN.md §5）；折叠/隐藏按钮用
 *      字符方案（▾ 旋转 caret / ×），不引入图标库（lucide-react 归 T5.6）。
 */
import type { ReactNode } from 'react';
import { useWorkspaceStore } from '../layout/workspaceStore';

interface PanelFrameProps {
  /** 折叠分区键（命名「区域.面板」，如 'left.scene' / 'browser.assets'） */
  sectionKey: string;
  /** 面板名（标题条展示 + aria-label） */
  title: string;
  /** 标题条右侧只读附注（计数 / 提示读数，沿 .ed-readout） */
  titleExtra?: ReactNode;
  /** 区域隐藏回调（传入才渲染 × 按钮；整组收起，恢复经上下文条开关） */
  onHide?: () => void;
  /** 追加尺寸类（ed-panel--fill / --layers / --draw / --grid / --environment） */
  className?: string;
  /** 标题条以下的完整内容（面板自带 .ed-panel__body 等，壳不侵入） */
  children: ReactNode;
}

export function PanelFrame({
  sectionKey,
  title,
  titleExtra,
  onHide,
  className = '',
  children,
}: PanelFrameProps) {
  const collapsed = useWorkspaceStore((s) => s.collapsedSections[sectionKey] === true);
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleCollapsed);

  return (
    <aside
      className={`ed-panel ed-frame${collapsed ? ' ed-frame--collapsed' : ''}${className ? ` ${className}` : ''}`}
      aria-label={title}
    >
      <div className="ed-panel__title ed-frame__head">
        <button
          type="button"
          className="ed-frame__toggle"
          aria-expanded={!collapsed}
          title={collapsed ? `展开${title}` : `折叠${title}`}
          onClick={() => toggleCollapsed(sectionKey)}
        >
          <span className="ed-frame__caret" aria-hidden="true">
            ▾
          </span>
          <span className="ed-frame__name">{title}</span>
        </button>
        {titleExtra}
        {onHide ? (
          <button
            type="button"
            className="ed-frame__hide"
            aria-label={`隐藏${title}面板组`}
            title={`隐藏${title}面板组（上下文条可恢复）`}
            onClick={onHide}
          >
            ×
          </button>
        ) : null}
      </div>
      <div className="ed-frame__content">{children}</div>
    </aside>
  );
}
