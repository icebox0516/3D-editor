/**
 * ui/components/ContextActions —— 上下文工具矩阵渲染（T7.1 门 Q4；T7.6 占位转正：
 * 对齐弹层 / 阵列 popover / 分割 / 合并）。
 *
 * 职责：消费 toolIA.contextActionsFor 纯模型（数据表驱动注册制），渲染 Context
 * Toolbar 中段两类项：
 *   - 动作钮：复制（onAction('edit.duplicate')——Ctrl+D 既有路由同源）/ 轮廓编辑·
 *     节点编辑（toggleVertexEdit 既有入口）/ 分割（激活 road-split 工具，携带目标）/
 *     合并（恰选 2 条相邻 road line 时可见——MergeRoadCommand 一条历史，执行后选中
 *     合并结果）/ 对齐（弹层八菜单，ModeSelector 弹层惯例：外点关闭、Esc 关层）；
 *   - 步进器（内联小组件）：楼层 ±1 / 宽度 ±0.5m——读数等宽 tabular、长按连续步进、
 *     每次步进经 ChangeSemanticCommand 写 semantic.properties，一次一条历史可撤销；
 *   - 对齐弹层：八菜单项（均布 <3 对象 disabled 可见）；hover 菜单项 → 足迹预览口
 *     （FootprintGhostPort）显示全部选中对象目标位置足迹框，移开清除；点击执行
 *     alignCommand（BatchCommand 一条历史）后清除预览；
 *   - 阵列 popover：数量 stepper（1..99）/ 间距输入（0.1..1000）/ 8 方向芯片 /
 *     确认/取消；参数变化 → 实时足迹预览（副本集）；取消/Esc（stopPropagation 防全局
 *     退出）清除预览零命令；确认执行 arrayCommand 后 selectMany 副本集（粘贴先例）。
 * 边界：纯 UI 组件（零 THREE、零 runtime/io——足迹预览经 store.footprintGhost 结构化
 *      Port）；命令组装归 ui/tools/alignArrayModel 纯模块；目标对象按点击时门面现值
 *      重读（SceneManager 唯一数据源）。
 */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  Check,
  Copy,
  CopyPlus,
  Merge,
  Minus,
  Plus,
  Scissors,
  Waypoints,
} from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import type { EditorFacade } from '../../editor/EditorFacade';
import { ChangeSemanticCommand } from '../../editor/commands/ChangeSemanticCommand';
import { MergeRoadCommand } from '../../editor/commands/MergeRoadCommand';
import type { ID } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import { isRegionObject } from '../../domain/regions';
import { toggleVertexEdit } from '../tools/toolIA';
import { ROAD_SPLIT_TOOL_ID, alignMenuModel } from '../tools/toolIA';
import type { ContextActionModel, ContextStepperItem } from '../tools/toolIA';
import {
  ARRAY_COUNT_MAX,
  ARRAY_COUNT_MIN,
  ARRAY_DIRECTIONS,
  ARRAY_DEFAULT_COUNT,
  ARRAY_DEFAULT_SPACING,
  ARRAY_SPACING_MAX,
  ARRAY_SPACING_MIN,
  alignCommand,
  alignGhostFootprints,
  arrayGhostFootprints,
  clampArrayPlan,
  planArrayExecution,
} from '../tools/alignArrayModel';
import type { AlignMode, ArrayDirection } from '../tools/alignArrayModel';
import { semanticPropertyChange } from '../panels/regionInspectorModel';
import { useEditorStore } from '../store';
import { AnchoredPopup } from './AnchoredPopup';

export interface ContextActionsProps {
  facade: EditorFacade;
  /** contextActionsFor 产出的矩阵模型（objectId 为单选目标） */
  model: ContextActionModel;
  /** 选中集对象快照（对齐/阵列/合并的命令与预览数据源；ContextToolbar 按版本号重读） */
  selection: readonly SceneObject[];
  /** 统一动作路由（复制复用 Ctrl+D 既有路由——app 层 EditorActionsCore） */
  onAction: (actionId: string) => void;
}

/** 长按连续步进参数：按住 350ms 后进入连续档，每 130ms 一步（UX 微交互档位） */
const HOLD_INITIAL_MS = 350;
const HOLD_REPEAT_MS = 130;

/** 对齐模式 → 图标（弹层菜单项图标映射） */
const ALIGN_ICONS: Record<AlignMode, ComponentType<{ size?: number | string }>> = {
  'min-x': AlignStartVertical,
  'center-x': AlignCenterVertical,
  'max-x': AlignEndVertical,
  'min-z': AlignStartHorizontal,
  'center-z': AlignCenterHorizontal,
  'max-z': AlignEndHorizontal,
  'distribute-x': AlignHorizontalDistributeCenter,
  'distribute-z': AlignVerticalDistributeCenter,
};

export function ContextActions({ facade, model, selection, onAction }: ContextActionsProps) {
  return (
    <div className="ed-ctx__group ed-ctx__actions" role="group" aria-label="上下文工具">
      {model.items.map((item) => {
        if (item.kind === 'action') {
          if (item.id === 'duplicate') {
            return (
              <button
                key={item.id}
                type="button"
                className="ed-ctx__btn"
                title={item.hint}
                aria-label={item.label}
                onClick={() => onAction('edit.duplicate')}
              >
                <Copy size={14} aria-hidden="true" />
                <span className="ed-ctx__btn-label">{item.label}</span>
              </button>
            );
          }
          if (item.id === 'vertex-edit') {
            return (
              <button
                key={item.id}
                type="button"
                className="ed-ctx__btn"
                disabled={model.objectId === null}
                title={item.hint}
                aria-label={item.label}
                onClick={() =>
                  model.objectId !== null && toggleVertexEdit(facade.tools, model.objectId)
                }
              >
                <Waypoints size={14} aria-hidden="true" />
                <span className="ed-ctx__btn-label">{item.label}</span>
              </button>
            );
          }
          if (item.id === 'align') {
            return <AlignButton key={item.id} facade={facade} selection={selection} hint={item.hint} />;
          }
          if (item.id === 'array') {
            return <ArrayButton key={item.id} facade={facade} selection={selection} hint={item.hint} />;
          }
          if (item.id === 'road-split') {
            return (
              <button
                key={item.id}
                type="button"
                className="ed-ctx__btn"
                disabled={model.objectId === null}
                title={item.hint}
                aria-label={item.label}
                onClick={() =>
                  model.objectId !== null &&
                  facade.tools.activate(ROAD_SPLIT_TOOL_ID, { objectId: model.objectId })
                }
              >
                <Scissors size={14} aria-hidden="true" />
                <span className="ed-ctx__btn-label">{item.label}</span>
              </button>
            );
          }
          // road-merge：恰选 2 条相邻 road line（canMergeRoads 已在矩阵侧把关）
          return (
            <button
              key={item.id}
              type="button"
              className="ed-ctx__btn"
              title={item.hint}
              aria-label={item.label}
              onClick={() => {
                const ids = facade.selection.getSelectedIds();
                if (ids.length !== 2) return;
                const command = new MergeRoadCommand(ids[0]!, ids[1]!);
                if (facade.history.execute(command)) {
                  facade.selection.select(ids[0]!); // 执行后选中合并结果
                }
              }}
            >
              <Merge size={14} aria-hidden="true" />
              <span className="ed-ctx__btn-label">{item.label}</span>
            </button>
          );
        }
        return <Stepper key={item.id} facade={facade} objectId={model.objectId} item={item} />;
      })}
    </div>
  );
}

// ── 对齐弹层（八菜单 + hover 足迹预览）─────────────────────

interface AlignButtonProps {
  facade: EditorFacade;
  selection: readonly SceneObject[];
  hint: string;
}

function AlignButton({ facade, selection, hint }: AlignButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const footprintGhost = useEditorStore((s) => s.footprintGhost);
  /** 当前 hover 的菜单模式（预览数据源；null = 无预览） */
  const [previewMode, setPreviewMode] = useState<AlignMode | null>(null);

  // 弹层关闭 / 组件卸载 → 清除预览（open=true 期间不干预 hover 驱动的显示）
  useEffect(() => {
    if (!open) return;
    return () => footprintGhost?.clearFootprints();
  }, [open, footprintGhost]);

  // hover 菜单项 → 全部选中对象目标位置足迹框（移开清除）
  const preview = (mode: AlignMode | null): void => {
    setPreviewMode(mode);
    if (mode === null) {
      footprintGhost?.clearFootprints();
      return;
    }
    const ghosts = alignGhostFootprints(selection, mode);
    if (ghosts.length > 0) footprintGhost?.showFootprints(ghosts);
    else footprintGhost?.clearFootprints();
  };

  const executeAlign = (mode: AlignMode): void => {
    footprintGhost?.clearFootprints();
    setPreviewMode(null);
    setOpen(false);
    const command = alignCommand(selection, mode);
    if (command) facade.history.execute(command);
  };

  const menu = alignMenuModel(selection.length);

  return (
    <div className="ed-menu ed-ctx__action-menu" ref={rootRef}>
      <button
        type="button"
        className={`ed-ctx__btn${open ? ' ed-ctx__mode-btn--open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={hint}
        aria-label="对齐"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(e: ReactKeyboardEvent<HTMLButtonElement>) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation(); // 关层不退出工具（防全局 Esc 路由）
            setOpen(false);
          }
        }}
      >
        <AlignCenterVertical size={14} aria-hidden="true" />
        <span className="ed-ctx__btn-label">对齐</span>
      </button>
      {open ? (
        // T9.1：弹层 portal 至根浮层容器——逃逸 contextbar 的 z10 层叠上下文，
        // 压过视口内 z20 的 HUD 芯片；点击外部关闭归 AnchoredPopup，Esc 关层不变
        <AnchoredPopup
          anchorRef={rootRef}
          placement="below-left"
          role="menu"
          ariaLabel="对齐方式"
          className="ed-ctx__align-popup"
          onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
            }
          }}
          onOutsidePointerDown={() => setOpen(false)}
        >
          {menu.map((entry) => {
            const Icon = ALIGN_ICONS[entry.mode];
            return (
              <button
                key={entry.mode}
                type="button"
                className={`ed-menu__item${entry.disabled ? ' ed-menu__item--disabled' : ''}`}
                role="menuitem"
                aria-disabled={entry.disabled}
                title={entry.hint}
                onMouseEnter={() => !entry.disabled && preview(entry.mode)}
                onMouseLeave={() => preview(null)}
                onFocus={() => !entry.disabled && preview(entry.mode)}
                onBlur={() => preview(null)}
                onClick={() => !entry.disabled && executeAlign(entry.mode)}
              >
                <span className="ed-menu__check" aria-hidden="true">
                  {previewMode === entry.mode ? <Check size={12} /> : null}
                </span>
                <Icon size={13} aria-hidden="true" />
                <span className="ed-menu__label">{entry.label}</span>
              </button>
            );
          })}
        </AnchoredPopup>
      ) : null}
    </div>
  );
}

// ── 阵列 popover（参数实时预览 + 确认一条历史）──────────────

interface ArrayButtonProps {
  facade: EditorFacade;
  selection: readonly SceneObject[];
  hint: string;
}

function ArrayButton({ facade, selection, hint }: ArrayButtonProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(ARRAY_DEFAULT_COUNT);
  const [spacingDraft, setSpacingDraft] = useState(`${ARRAY_DEFAULT_SPACING}`);
  const [direction, setDirection] = useState<ArrayDirection>('east');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const footprintGhost = useEditorStore((s) => s.footprintGhost);

  const plan = clampArrayPlan({
    count,
    spacing: Number(spacingDraft),
    direction,
  });

  // 实时足迹预览：open + 参数变化 → 副本集足迹框；关闭/卸载清除
  useEffect(() => {
    if (!open) return;
    const ghosts = arrayGhostFootprints(selection, plan);
    if (ghosts.length > 0) footprintGhost?.showFootprints(ghosts);
    return () => footprintGhost?.clearFootprints();
  });

  const close = (): void => {
    setOpen(false);
    footprintGhost?.clearFootprints();
  };

  const confirm = (): void => {
    // 副本一次规划：命令与副本集同源（二次规划会生成新 id，选中集将找不到对象）
    const { command, copies } = planArrayExecution(selection, plan);
    footprintGhost?.clearFootprints();
    setOpen(false);
    if (!command || !facade.history.execute(command)) return;
    // 执行后选中副本集（粘贴选中新副本先例；copies.id 即创建对象的 id）
    const createdIds = copies.map((copy) => copy.id);
    if (createdIds.length > 0) facade.selection.selectMany(createdIds);
  };

  const stepStyle = { '--stepper-w': `${Math.max(2, String(count).length)}em` } as CSSProperties;

  return (
    <div className="ed-menu ed-ctx__action-menu" ref={rootRef}>
      <button
        type="button"
        className={`ed-ctx__btn${open ? ' ed-ctx__mode-btn--open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={hint}
        aria-label="阵列"
        onClick={() => setOpen((value) => !value)}
      >
        <CopyPlus size={14} aria-hidden="true" />
        <span className="ed-ctx__btn-label">阵列</span>
      </button>
      {open ? (
        // T9.1：弹层 portal 至根浮层容器（同对齐弹层——逃逸 contextbar 层叠上下文，
        // 压过视口 HUD 芯片）；点击外部关闭 = 取消语义（清预览零命令），Esc 关层不变
        <AnchoredPopup
          anchorRef={rootRef}
          placement="below-left"
          role="dialog"
          ariaLabel="线性阵列"
          className="ed-ctx__array-popover"
          onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Escape') {
              e.stopPropagation(); // popover 内 Esc = 取消，不触发全局退出
              close();
            }
          }}
          onOutsidePointerDown={close}
        >
          <div className="ed-ctx__field">
            <span className="ed-ctx__field-label" id="array-count-label">
              数量
            </span>
            <span
              className="ed-ctx__stepper"
              style={stepStyle}
              role="group"
              aria-label="副本数量（不含原件）"
            >
              <button
                type="button"
                className="ed-ctx__stepper-btn"
                disabled={count <= ARRAY_COUNT_MIN}
                aria-label="数量减一"
                onClick={() => setCount((v) => Math.max(ARRAY_COUNT_MIN, v - 1))}
              >
                <Minus size={12} aria-hidden="true" />
              </button>
              <span className="ed-ctx__stepper-value" aria-live="polite">
                {count}
              </span>
              <button
                type="button"
                className="ed-ctx__stepper-btn"
                disabled={count >= ARRAY_COUNT_MAX}
                aria-label="数量加一"
                onClick={() => setCount((v) => Math.min(ARRAY_COUNT_MAX, v + 1))}
              >
                <Plus size={12} aria-hidden="true" />
              </button>
            </span>
          </div>
          <div className="ed-ctx__field">
            <label className="ed-ctx__field-label" htmlFor="array-spacing">
              间距
            </label>
            <span className="ed-ctx__field-value">
              <input
                id="array-spacing"
                className="ed-input ed-input--num"
                type="number"
                min={ARRAY_SPACING_MIN}
                max={ARRAY_SPACING_MAX}
                step={0.5}
                value={spacingDraft}
                aria-label="相邻副本步距（米）"
                onChange={(e) => setSpacingDraft(e.target.value)}
                onBlur={() => setSpacingDraft(`${plan.spacing}`)}
              />
              <span className="ed-field__unit">m</span>
            </span>
          </div>
          <div className="ed-ctx__field">
            <span className="ed-ctx__field-label" id="array-dir-label">
              方向
            </span>
            <span className="ed-ctx__dir-grid" role="group" aria-labelledby="array-dir-label">
              {ARRAY_DIRECTIONS.map((dir) => (
                <button
                  key={dir.id}
                  type="button"
                  className={`ed-chip ed-ctx__dir-chip${direction === dir.id ? ' ed-chip--active' : ''}`}
                  aria-pressed={direction === dir.id}
                  title={`方向：${dir.label}（${dirDeltasLabel(dir.id)}）`}
                  onClick={() => setDirection(dir.id)}
                >
                  {dir.label}
                </button>
              ))}
            </span>
          </div>
          <div className="ed-ctx__array-foot">
            <span className="ed-ctx__draw-hint">
              {count} × {plan.spacing} m · {directionLabel(direction)}
            </span>
            <span className="ed-ctx__array-actions">
              <button type="button" className="ed-btn ed-btn--ghost" onClick={close}>
                取消
              </button>
              <button
                type="button"
                className="ed-btn ed-btn--primary"
                aria-label="确认阵列（一条历史）"
                onClick={confirm}
              >
                <Check size={12} aria-hidden="true" />
                阵列
              </button>
            </span>
          </div>
        </AnchoredPopup>
      ) : null}
    </div>
  );
}

/** 方向 → 中文标签（读数同源） */
function directionLabel(direction: ArrayDirection): string {
  return ARRAY_DIRECTIONS.find((d) => d.id === direction)?.label ?? '东';
}

/** 方向 → 轴分量说明（tooltip 用；东=+X、北=−Z） */
function dirDeltasLabel(direction: ArrayDirection): string {
  const dir = ARRAY_DIRECTIONS.find((d) => d.id === direction);
  if (!dir) return '';
  const fmt = (v: number): string => (v === 0 ? '0' : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
  return `X ${fmt(dir.dx)} · Z ${fmt(dir.dz)}`;
}

// ── 步进器（等宽读数 + 长按连续 + min/max 截断） ────────────

interface StepperProps {
  facade: EditorFacade;
  objectId: ID | null;
  item: ContextStepperItem;
}

function Stepper({ facade, objectId, item }: StepperProps) {
  const holdRef = useRef<{ delay: number; repeat: number } | null>(null);
  const deltaRef = useRef(1);

  // 卸载清定时器（长按中卸载防泄漏）
  useEffect(
    () => () => {
      stopHold();
    },
    [],
  );

  /** 单次步进提交：目标现值经门面重读 → 钳制 → ChangeSemanticCommand 一条历史 */
  const commitStep = (delta: number): void => {
    if (objectId === null) return;
    const target = facade.scene.getObject(objectId);
    if (!target || !isRegionObject(target)) return;
    const next = clampStep(item, target.semantic.properties[item.paramKey], delta);
    facade.history.execute(
      new ChangeSemanticCommand(objectId, semanticPropertyChange(target.semantic, item.paramKey, next)),
    );
  };

  /** 长按连续：延迟档进入 → 连续档重复（原生 click 已提交第一步，长按接管续步） */
  const startHold = (delta: number): void => {
    stopHold();
    deltaRef.current = delta;
    const delay = window.setTimeout(() => {
      const repeat = window.setInterval(() => commitStep(deltaRef.current), HOLD_REPEAT_MS);
      holdRef.current = { delay: 0, repeat };
    }, HOLD_INITIAL_MS);
    holdRef.current = { delay, repeat: 0 };
  };
  const stopHold = (): void => {
    const hold = holdRef.current;
    if (hold) {
      window.clearTimeout(hold.delay);
      window.clearInterval(hold.repeat);
      holdRef.current = null;
    }
  };

  const minusDisabled = objectId === null || item.value <= item.min;
  const plusDisabled = objectId === null || (item.max !== undefined && item.value >= item.max);
  const stepStyle = {
    '--stepper-w': `${Math.max(3, item.value.toFixed(item.precision).length)}em`,
  } as CSSProperties;

  return (
    <span className="ed-ctx__stepper" style={stepStyle} role="group" aria-label={`${item.label}步进`}>
      <span className="ed-ctx__stepper-label">{item.label}</span>
      <button
        type="button"
        className="ed-ctx__stepper-btn"
        disabled={minusDisabled}
        aria-label={`${item.label}减 ${item.step}`}
        title={`${item.label} −${item.step}（长按连续）`}
        onClick={() => commitStep(-1)}
        onPointerDown={() => startHold(-1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
      >
        <Minus size={12} aria-hidden="true" />
      </button>
      <span className="ed-ctx__stepper-value" aria-live="polite">
        {item.value.toFixed(item.precision)}
      </span>
      <button
        type="button"
        className="ed-ctx__stepper-btn"
        disabled={plusDisabled}
        aria-label={`${item.label}加 ${item.step}`}
        title={`${item.label} +${item.step}（长按连续）`}
        onClick={() => commitStep(1)}
        onPointerDown={() => startHold(1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
      >
        <Plus size={12} aria-hidden="true" />
      </button>
      {item.unit ? <span className="ed-ctx__stepper-unit">{item.unit}</span> : null}
    </span>
  );
}

/** 现值 + 方向步数 → 钳制后的下一档（min/max 来自矩阵模型 = 语义定义截断） */
function clampStep(item: ContextStepperItem, raw: unknown, delta: number): number {
  const current = typeof raw === 'number' && Number.isFinite(raw) ? raw : item.value;
  const next = current + delta * item.step;
  // 显示值低于定义下界（导入数据等来源）时不反向抬升，仅在原值上步进
  const lower = Math.min(item.min, current);
  const upper = item.max ?? Number.POSITIVE_INFINITY;
  return Math.min(upper, Math.max(lower, Number(next.toFixed(4))));
}
