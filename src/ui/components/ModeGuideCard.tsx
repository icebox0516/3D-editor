/**
 * ui/components/ModeGuideCard —— Inspector 空态模式引导卡（T7.1 联动 4）。
 *
 * 职责：无选中对象时 Inspector「对象属性」标签的引导卡——按显示模式（combineMode =
 * workspaceStore.mode ⊕ 工具派生）呈现 toolIA.MODES.inspectorGuide 元数据（模式
 * 说明 + 快速开始），随模式切换更新；模式专属色经 --mode-accent 注入（圆点 + 顶线）。
 * 数据驱动纯展示组件（无动作、无命令）；需求 15.2「空态无系统设置混入」保持——
 * 仅模式引导 + 选择提示。
 * 边界：只读订阅 store（workspaceStore.mode / editorStore.activeToolId·drawTarget），
 *      零 THREE、零 runtime/io；引导文案单一真相源 = toolIA.MODES。
 */
import type { CSSProperties } from 'react';
import { combineMode, workModeOf } from '../tools/toolIA';
import { useEditorStore } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import { INSPECTOR_EMPTY } from '../panels/inspectorModel';

export function ModeGuideCard() {
  const mode = useWorkspaceStore((s) => s.mode);
  const activeToolId = useEditorStore((s) => s.activeToolId);
  const drawTarget = useEditorStore((s) => s.drawTarget);

  const current = workModeOf(combineMode(mode, activeToolId, drawTarget));
  const guide = current.inspectorGuide;
  const style = { '--mode-accent': `var(${current.accent ?? '--accent'})` } as CSSProperties;

  return (
    <div className="ed-panel__body">
      <div className="ed-guide" style={style} aria-label={`${current.label}模式引导`}>
        <div className="ed-guide__head">
          <span className="ed-guide__dot" aria-hidden="true" />
          <span className="ed-guide__title">{guide.title}</span>
        </div>
        <p className="ed-guide__desc">{guide.description}</p>
        <div className="ed-guide__quick">
          <span className="ed-guide__quick-title">快速开始</span>
          <span>{guide.quickStart}</span>
        </div>
      </div>
      <p className="ed-guide__empty-hint">{INSPECTOR_EMPTY.hint}</p>
    </div>
  );
}
