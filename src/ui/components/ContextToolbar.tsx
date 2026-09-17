/**
 * ui/components/ContextToolbar —— 上下文工具条（T5.6 奠基；T6.5 形状驱动重构；T7.1
 * 显式工作模式体系 + 上下文工具矩阵）。
 *
 * 职责（需求第六章 + T5.6 方案 + T6.5 三步流 + T7.1 门裁定）：
 *   - 左段 QWER 组：选择 Q / 移动 W / 旋转 E / 缩放 R（gizmo 模式）——点击经共享
 *     入口 activateTransformTool / activateSelectTool（与键盘 W/E/R/Q 同路，store
 *     gizmoMode 记账保证三钮激活态与最后激活模式一致）；
 *   - 吸附 / 网格 toggle：勾选位由装配层注入（snapEnabled / gridVisible），点击只发
 *     actionId（tool.snap / view.grid，T5.2 统一路由）；网格 toggle 不配快捷键；
 *   - 中段（互斥优先级）：绘制态（contextToolsFor 动态派生：面类五形状切换芯片 +
 *     完成提示 + 退出）＞ 顶点编辑态指引（T6.8）＞ 道路分割态指引（T7.6）＞ 测量态
 *     （T10.2：四 kind 芯片即切 + 删除上一条 / 清除全部，计数与动作经 store 的
 *     measureCount / measure 端口）＞ 上下文工具矩阵（T7.1 contextActionsFor +
 *     T7.6 转正：复制 / 轮廓·节点编辑 / 楼层·宽度步进 / 分割 / 对齐 / 阵列 / 合并）
 *     ＞ 三步流快选条（unclassified 单选，RegionQuickApply）＞ 模式引导芯片（无选中，
 *     显示模式 + 一行引导）；
 *   - 右段：模式徽标（combineMode 显示模式全名 + 模式专属色）+ Scene ▼ 模式选择器
 *     （T7.1 六模式转正可手选，measure/analysis 灰显占位；选择经 activateWorkMode
 *     三路同源共享入口——含激活绘制/放置工具的 cancel 语义）。
 * 边界：只经 store（facade/activeToolId/gizmoMode/drawTarget/selectedIds/sceneVersion）、
 *      toolIA 纯模型与共享入口、ContextActions/RegionQuickApply 渲染件、actionId 回调；
 *      ui 禁 io/runtime——吸附/网格/复制动作的实际执行在 app 层路由。
 */
import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Check, ChevronDown, Eraser, Grid3x3, Magnet, MousePointer2, Move3d, Rotate3d, Scale3d, Trash2, X } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import type { MeasureKind } from '../../core/types';
import { isRegionObject } from '../../domain/regions';
import {
  MODES,
  activateSelectTool,
  activateTransformTool,
  activateWorkMode,
  combineMode,
  contextActionsFor,
  contextToolsFor,
  toggleMeasureTool,
  toggleShapeDraw,
  workModeOf,
} from '../tools/toolIA';
import type { ContextToolItem, GizmoMode, WorkModeId } from '../tools/toolIA';
import type { ShapeType } from '../../domain/regions';
import { useEditorStore } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import { ContextActions } from './ContextActions';
import { RegionQuickApply } from './RegionQuickApply';
import { AnchoredPopup } from './AnchoredPopup';

/** lucide 图标键 → 组件（toolIA 的 icon 字段渲染映射） */
const LUCIDE_ICONS: Record<ContextToolItem['icon'], ComponentType<{ size?: number | string }>> = {
  select: MousePointer2,
  translate: Move3d,
  rotate: Rotate3d,
  scale: Scale3d,
  snap: Magnet,
  grid: Grid3x3,
};

/** QWER 工具项点击路由（mode 为 null = 选择工具；translate/rotate/scale 即 GizmoMode） */
function pickTool(item: ContextToolItem, activate: (mode: GizmoMode | null) => void): void {
  activate(item.id === 'select' ? null : (item.id as GizmoMode));
}

export interface ContextToolbarProps {
  /** 网格吸附全局开关（菜单 tool.snap 同源状态） */
  snapEnabled: boolean;
  /** 环境网格可见（environment.grid.visible） */
  gridVisible: boolean;
  /** 统一动作路由（与主菜单同源；吸附/网格/复制 toggle 只发 actionId） */
  onAction: (actionId: string) => void;
}

export function ContextToolbar({ snapEnabled, gridVisible, onAction }: ContextToolbarProps) {
  const facade = useEditorStore((s) => s.facade);
  const activeToolId = useEditorStore((s) => s.activeToolId);
  const gizmoMode = useEditorStore((s) => s.gizmoMode);
  const drawTarget = useEditorStore((s) => s.drawTarget);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  const measureCount = useEditorStore((s) => s.measureCount);
  const measurePort = useEditorStore((s) => s.measure);
  const explicitMode = useWorkspaceStore((s) => s.mode);
  void sceneVersion; // 应用命令后经版本号重读选中对象（矩阵/快选段数据源）

  const model = contextToolsFor({
    activeToolId,
    gizmoMode,
    snapEnabled,
    gridVisible,
    drawTarget,
  });

  // 显示模式 = 显式模式 ⊕ 绘制/放置派生（徽标 / 引导芯片 / HUD 同一数据源）
  const displayModeId = combineMode(explicitMode, activeToolId, drawTarget);
  const currentMode = workModeOf(displayModeId);
  const modeStyle = {
    '--mode-accent': `var(${currentMode.accent ?? '--accent'})`,
  } as CSSProperties;

  const activate = (m: GizmoMode | null): void => {
    if (!facade) return;
    if (m === null) activateSelectTool(facade.tools);
    else activateTransformTool(facade.tools, m);
  };

  // 上下文工具矩阵：选中集对象快照（sceneVersion 驱动重读；门面未装配为空）
  const selection =
    facade !== null
      ? selectedIds
          .map((id) => facade.scene.getObject(id))
          .filter((o): o is NonNullable<typeof o> => o !== undefined)
      : [];
  const matrix = contextActionsFor(selection, activeToolId);

  // 三步流快选目标：单选 + 未分类 RegionObject（选中即浮出，赋型后隐去）
  const quickTarget = selection.length === 1 ? selection[0] : undefined;
  const quickApply =
    quickTarget !== undefined &&
    isRegionObject(quickTarget) &&
    quickTarget.semantic.type === 'unclassified'
      ? { objectId: quickTarget.id, shapeType: quickTarget.shape.type, semanticType: quickTarget.semantic.type }
      : null;

  return (
    <div className="ed-ctx" role="group" aria-label="上下文工具">
      <div className="ed-ctx__group" role="group" aria-label="变换工具">
        {model.tools
          .filter((item) => item.kind === 'tool')
          .map((item) => {
            const Icon = LUCIDE_ICONS[item.icon];
            return (
              <button
                key={item.id}
                type="button"
                className={`ed-ctx__btn${item.active ? ' ed-ctx__btn--active' : ''}`}
                aria-pressed={item.active}
                disabled={!facade}
                aria-label={`${item.label}（${item.key.toUpperCase()}）`}
                title={`${item.label}（${item.key.toUpperCase()}）`}
                onClick={() => pickTool(item, activate)}
              >
                <Icon size={15} />
                <kbd className="ed-kbd">{item.key.toUpperCase()}</kbd>
              </button>
            );
          })}
      </div>

      <div className="ed-ctx__group" role="group" aria-label="绘制辅助开关">
        {model.tools
          .filter((item) => item.kind === 'toggle')
          .map((item) => {
            const Icon = LUCIDE_ICONS[item.icon];
            return (
              <button
                key={item.id}
                type="button"
                className={`ed-ctx__btn ed-ctx__toggle${item.checked ? ' ed-ctx__toggle--on' : ''}`}
                aria-pressed={item.checked}
                disabled={!facade}
                aria-label={`${item.label}${item.checked ? '：开' : '：关'}`}
                title={
                  item.id === 'grid'
                    ? '环境网格显示（间距与吸附步长见场景设置）'
                    : '吸附总开关（网格/对象/角度/高度；Ctrl 拖拽临时反转；不影响绘制 Shift/A/G 三键）'
                }
                onClick={() => onAction(item.id === 'grid' ? 'view.grid' : 'tool.snap')}
              >
                <Icon size={15} />
                <span className="ed-ctx__btn-label">{item.label}</span>
                {item.key ? <kbd className="ed-kbd">{item.key.toUpperCase()}</kbd> : null}
              </button>
            );
          })}
      </div>

      {/* 中段（互斥优先级，T7.6 增 road-split；T10.2 增 measure）：绘制态 ＞ 顶点编辑态 ＞
          道路分割态 ＞ 测量态 ＞ 上下文工具矩阵 ＞ 三步流快选 ＞ 模式引导芯片 */}
      {model.draw ? (
        <DrawSection
          shapeOptions={model.draw.shapeOptions}
          hint={model.draw.hint}
          onSwitchShape={(shape) => facade && toggleShapeDraw(facade.tools, shape)}
          onExit={() => facade?.tools.cancel()}
        />
      ) : model.vertexEdit ? (
        <VertexEditSection hint={model.vertexEdit.hint} onExit={() => facade?.tools.cancel()} />
      ) : model.roadSplit ? (
        <RoadSplitSection hint={model.roadSplit.hint} onExit={() => facade?.tools.cancel()} />
      ) : model.measure ? (
        <MeasureSection
          kindOptions={model.measure.kindOptions}
          hint={model.measure.hint}
          count={measureCount}
          disabled={!facade}
          onSwitchKind={(kind) => facade && toggleMeasureTool(facade.tools, kind)}
          onRemoveLast={() => measurePort?.removeLast()}
          onClearAll={() => measurePort?.clear()}
        />
      ) : matrix !== null && facade ? (
        <ContextActions facade={facade} model={matrix} selection={selection} onAction={onAction} />
      ) : quickApply !== null && facade ? (
        <RegionQuickApply
          facade={facade}
          objectId={quickApply.objectId}
          shapeType={quickApply.shapeType}
          semanticType={quickApply.semanticType}
        />
      ) : (
        <ModeGuideChip label={currentMode.label} hint={currentMode.hudHint} style={modeStyle} />
      )}

      {matrix !== null && quickApply !== null && facade ? (
        <RegionQuickApply
          facade={facade}
          objectId={quickApply.objectId}
          shapeType={quickApply.shapeType}
          semanticType={quickApply.semanticType}
        />
      ) : null}

      <div className="ed-ctx__end">
        <span
          className="ed-ctx__mode-badge"
          style={modeStyle}
          title={`当前工作模式：${currentMode.label}（${currentMode.hint}）`}
        >
          <span className="ed-ctx__mode-dot" aria-hidden="true" />
          {currentMode.label}
        </span>
        <ModeSelector
          currentId={displayModeId}
          disabled={!facade}
          onPick={(modeId) => facade && activateWorkMode(modeId, facade.tools)}
        />
      </div>
    </div>
  );
}

// ── 无选中时中段模式引导芯片（T7.1 联动 1）──────────────────

interface ModeGuideChipProps {
  label: string;
  hint: string;
  style: CSSProperties;
}

function ModeGuideChip({ label, hint, style }: ModeGuideChipProps) {
  return (
    <span className="ed-ctx__guide" style={style} title={`${label}模式：${hint}`}>
      <span className="ed-ctx__guide-dot" aria-hidden="true" />
      <span className="ed-ctx__guide-hint">
        {label} · {hint}
      </span>
    </span>
  );
}

// ── 绘制上下文中段（面类形状切换 + 提示 + 退出） ────────────

interface DrawSectionProps {
  shapeOptions: ReadonlyArray<{ value: string; label: string; active: boolean }>;
  hint: string;
  onSwitchShape: (shape: ShapeType) => void;
  onExit: () => void;
}

function DrawSection(props: DrawSectionProps) {
  const { shapeOptions, hint } = props;
  return (
    <div className="ed-ctx__group ed-ctx__draw" role="group" aria-label="绘制上下文">
      {shapeOptions.length > 1 ? (
        <span className="ed-ctx__switch" role="group" aria-label="形状切换">
          {shapeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`ed-chip ed-ctx__chip${option.active ? ' ed-chip--active' : ''}`}
              aria-pressed={option.active}
              title={`切换形状：${option.label}（重绘新形状）`}
              onClick={() => props.onSwitchShape(option.value as ShapeType)}
            >
              {option.label}
            </button>
          ))}
        </span>
      ) : null}

      <span className="ed-ctx__draw-hint">{hint}</span>
      <button
        type="button"
        className="ed-ctx__btn ed-ctx__exit"
        aria-label="退出绘制（ESC）"
        title="退出绘制（ESC）"
        onClick={props.onExit}
      >
        <X size={14} />
        <span className="ed-ctx__btn-label">退出</span>
      </button>
    </div>
  );
}

// ── 顶点编辑上下文中段（提示 + 退出，T6.8） ─────────────────

interface VertexEditSectionProps {
  hint: string;
  onExit: () => void;
}

function VertexEditSection({ hint, onExit }: VertexEditSectionProps) {
  return (
    <div className="ed-ctx__group ed-ctx__draw" role="group" aria-label="顶点编辑上下文">
      <span className="ed-ctx__draw-hint">{hint}</span>
      <button
        type="button"
        className="ed-ctx__btn ed-ctx__exit"
        aria-label="退出顶点编辑（ESC）"
        title="退出顶点编辑（ESC）"
        onClick={onExit}
      >
        <X size={14} />
        <span className="ed-ctx__btn-label">退出</span>
      </button>
    </div>
  );
}

// ── 道路分割上下文中段（提示 + 退出，T7.6；VertexEditSection 同构） ──

interface RoadSplitSectionProps {
  hint: string;
  onExit: () => void;
}

function RoadSplitSection({ hint, onExit }: RoadSplitSectionProps) {
  return (
    <div className="ed-ctx__group ed-ctx__draw" role="group" aria-label="道路分割上下文">
      <span className="ed-ctx__draw-hint">{hint}</span>
      <button
        type="button"
        className="ed-ctx__btn ed-ctx__exit"
        aria-label="退出道路分割（ESC）"
        title="退出道路分割（ESC）"
        onClick={onExit}
      >
        <X size={14} />
        <span className="ed-ctx__btn-label">退出</span>
      </button>
    </div>
  );
}

// ── 测量上下文中段（阶段 10 T10.2：四 kind 芯片 + 删除上一条 / 清除全部） ──

interface MeasureSectionProps {
  kindOptions: ReadonlyArray<{ value: string; label: string; active: boolean }>;
  hint: string;
  /** 会话测量条目数（measure:changed 驱动；空表两按钮禁用） */
  count: number;
  disabled: boolean;
  onSwitchKind: (kind: MeasureKind) => void;
  onRemoveLast: () => void;
  onClearAll: () => void;
}

function MeasureSection(props: MeasureSectionProps) {
  const { kindOptions, hint, count } = props;
  const empty = count === 0;
  return (
    <div className="ed-ctx__group ed-ctx__draw" role="group" aria-label="测量上下文">
      <span className="ed-ctx__switch" role="group" aria-label="测量类型切换">
        {kindOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`ed-chip ed-ctx__chip${option.active ? ' ed-chip--active' : ''}`}
            aria-pressed={option.active}
            title={`切换测量类型：${option.label}（草稿弃、已提交测量保留）`}
            disabled={props.disabled}
            onClick={() => props.onSwitchKind(option.value as MeasureKind)}
          >
            {option.label}
          </button>
        ))}
      </span>

      <span className="ed-ctx__draw-hint">{hint}</span>
      <span
        className="ed-ctx__measure-count ed-readout"
        title={`当前测量条目数（会话态，不入场景）`}
      >
        {count} 条
      </span>
      <button
        type="button"
        className="ed-ctx__btn"
        aria-label={`删除上一条测量（当前 ${count} 条）`}
        title={`删除上一条测量（Delete；测量工具激活时——有草稿先弃草稿）`}
        disabled={props.disabled || empty}
        onClick={props.onRemoveLast}
      >
        <Trash2 size={14} />
        <span className="ed-ctx__btn-label">删除上一条</span>
      </button>
      <button
        type="button"
        className="ed-ctx__btn"
        aria-label={`清除全部测量（当前 ${count} 条）`}
        title="清除全部测量（会话态可重测，无需确认）"
        disabled={props.disabled || empty}
        onClick={props.onClearAll}
      >
        <Eraser size={14} />
        <span className="ed-ctx__btn-label">清除全部</span>
      </button>
    </div>
  );
}

// ── Scene ▼ 模式选择器（T7.1 六模式转正可手选） ─────────────

interface ModeSelectorProps {
  currentId: string;
  disabled: boolean;
  onPick: (modeId: WorkModeId) => void;
}

function ModeSelector({ currentId, disabled, onPick }: ModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const current = MODES.find((m) => m.id === currentId)!;

  const onButtonKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Escape' && open) {
      setOpen(false);
    }
  };

  const onItemKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'Escape') {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className="ed-menu ed-ctx__mode" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`ed-ctx__btn ed-ctx__mode-btn${open ? ' ed-ctx__mode-btn--open' : ''}`}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        title="工作模式（Alt+1..7 直切；模式为工作域焦点，全部工具任何模式可用）"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKeyDown}
      >
        <span className="ed-ctx__btn-label">Scene</span>
        <ChevronDown size={13} className={open ? 'ed-ctx__caret--open' : undefined} aria-hidden="true" />
      </button>
      {open ? (
        // T9.1：弹层 portal 至根浮层容器——逃逸 contextbar 的 z10 层叠上下文，
        // 压过视口内 z20 的 HUD 芯片（下拉正下方恰为 HUD 区）；点击外部关闭归 AnchoredPopup
        <AnchoredPopup
          anchorRef={rootRef}
          placement="below-left"
          role="menu"
          ariaLabel="工作模式"
          onOutsidePointerDown={() => setOpen(false)}
        >
          {MODES.map((option) => {
            const isCurrent = option.id === current.id;
            return (
              <button
                key={option.id}
                type="button"
                className={`ed-menu__item${option.enabled ? '' : ' ed-menu__item--disabled'}`}
                role="menuitemradio"
                aria-checked={isCurrent}
                aria-disabled={!option.enabled}
                title={option.hint}
                onClick={() => {
                  setOpen(false);
                  if (option.enabled) onPick(option.id);
                }}
                onKeyDown={onItemKeyDown}
              >
                <span className="ed-menu__check" aria-hidden="true">
                  {isCurrent ? <Check size={12} /> : null}
                </span>
                <span className="ed-menu__label">{option.label}</span>
              </button>
            );
          })}
        </AnchoredPopup>
      ) : null}
    </div>
  );
}
