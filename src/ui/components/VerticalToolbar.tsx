/**
 * ui/components/VerticalToolbar —— 左侧垂直工具条（T5.6 奠基；T6.5 形状驱动重构；
 * T7.1 模式置顶分组 +「更多」抽屉）。
 *
 * 职责（需求 §7.1 四分组 + T7.1 联动 3）：
 *   - 变换组 Q/W/E/R：选择/移动/旋转/缩放（与 ContextToolbar QWER 组同路共享入口，
 *     键位纯字母不变；激活态同源；任何模式可见——门 Q2 工具无模式闸门）；
 *   - 绘制组 1 区域（分裂按钮：主区激活记忆子工具 + 角标展开五子工具下拉
 *     多边形/矩形/圆形/椭圆/自由，Shift+1..5 直切；记忆归 store.lastAreaShape）/
 *     2 路径 / 3 点；资产组 4 放置（重放最近资产；无记忆时禁用并提示先去内容浏览器选择）；
 *   - T7.1 模式置顶：显示模式（combineMode）的 verticalGroup 组内工具常驻，
 *     其余绘制/资产入口折叠进「更多」抽屉（scene 模式 = 全部展开无折叠）；
 *     抽屉内点击可正常激活工具（保留可达性——门 Q3a 裁定）；
 *   - 测量分组（阶段 10 T10.2）：距离/高度差/面积/角度四子工具按钮（无数字键）；
 *     测量模式置顶本分组，其余模式经「更多」抽屉可达；激活琥珀高亮、再点退出
 *     （toggleMeasureTool 共享入口，与 ContextToolbar 芯片/工具菜单同路）；
 *   - 激活态琥珀左缘竖线 + soft 底（沿面板语言）；hover / focus 延迟 tooltip
 *     （名称 + 数字键 + 一句操作提示）；再次点击同项退出当前绘制（toggle 语义）。
 * 边界：只经 store（facade/activeToolId/drawTarget/lastAreaShape/lastAssetId +
 *      workspaceStore.mode）与 toolIA 共享入口；零 THREE、零 runtime；图标统一
 *      lucide-react；图标按钮 ≥40px 触达（「更多」抽屉钮为 40×28 文字钮，点击目标同级）。
 */
import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  Box,
  Check,
  ChevronDown,
  Circle,
  CircleDot,
  Ellipsis,
  MousePointer2,
  Move3d,
  MoveVertical,
  Pentagon,
  Rotate3d,
  Ruler,
  Scale3d,
  Shapes,
  SquareDashed,
  Spline,
  Square,
  Triangle,
  Ellipse as EllipseIcon,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { MeasureKind } from '../../core/types';
import { AREA_SUBTOOLS, MEASURE_SUBTOOLS, VERTICAL_TOOLS, combineMode, toggleMeasureTool, togglePlacement, toggleRegionDraw, toggleShapeDraw, workModeOf } from '../tools/toolIA';
import type { AreaSubtoolDef, VerticalIconKey } from '../tools/toolIA';
import { activateSelectTool, activateTransformTool } from '../tools/toolIA';
import type { GizmoMode } from '../tools/toolIA';
import { pushToast } from '../feedback/toastStore';
import { useEditorStore } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import { Tooltip } from './Tooltip';
import { AnchoredPopup } from './AnchoredPopup';

/** 垂直条图标渲染映射（lucide-react；区域主钮随记忆子工具换图标） */
const VERTICAL_ICONS: Record<string, ComponentType<{ size?: number | string }>> = {
  region: Shapes,
  line: Spline,
  point: CircleDot,
  placement: Box,
};

/** 测量四子工具图标（阶段 10 T10.2：距离/高度差/面积/角度，无数字键） */
const MEASURE_ICONS: Record<MeasureKind, ComponentType<{ size?: number | string }>> = {
  distance: Ruler,
  height: MoveVertical,
  area: SquareDashed,
  angle: Triangle,
};

/** 区域子工具图标（下拉项与主钮共用） */
const AREA_SUB_ICONS: Record<AreaSubtoolDef['shapeType'], ComponentType<{ size?: number | string }>> = {
  polygon: Pentagon,
  rectangle: Square,
  circle: Circle,
  ellipse: EllipseIcon,
  freehand: Spline,
};

/** 变换组四项（QWER；与 ContextToolbar 同路共享入口） */
const TRANSFORM_ITEMS: ReadonlyArray<{ id: 'select' | 'translate' | 'rotate' | 'scale'; label: string; key: string; mode: GizmoMode | null }> = [
  { id: 'select', label: '选择', key: 'Q', mode: null },
  { id: 'translate', label: '移动', key: 'W', mode: 'translate' },
  { id: 'rotate', label: '旋转', key: 'E', mode: 'rotate' },
  { id: 'scale', label: '缩放', key: 'R', mode: 'scale' },
];

/** 绘制/资产四入口的呈现序（垂直条既有顺序：区域 → 路径 → 点 → 放置） */
const DRAW_ENTRY_ORDER: readonly VerticalIconKey[] = ['region', 'line', 'point', 'placement'];

export function VerticalToolbar() {
  const facade = useEditorStore((s) => s.facade);
  const activeToolId = useEditorStore((s) => s.activeToolId);
  const gizmoMode = useEditorStore((s) => s.gizmoMode);
  const drawTarget = useEditorStore((s) => s.drawTarget);
  const lastAreaShape = useEditorStore((s) => s.lastAreaShape);
  const lastAssetId = useEditorStore((s) => s.lastAssetId);
  const mode = useWorkspaceStore((s) => s.mode);
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const areaMenuRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // 显示模式 → 置顶分组（scene = null 全部展开；其余本模式组置顶，余组进「更多」）
  const topGroup = workModeOf(combineMode(mode, activeToolId, drawTarget)).verticalGroup;

  const rememberedSub = AREA_SUBTOOLS.find((sub) => sub.shapeType === lastAreaShape) ?? AREA_SUBTOOLS[0]!;
  const regionActive = activeToolId !== null && activeToolId.startsWith('draw-') &&
    drawTarget !== null && AREA_SUBTOOLS.some((s) => s.shapeType === drawTarget.shapeType);

  /** 分组折叠判定：置顶组（或 scene 全展开）常驻，其余进「更多」抽屉 */
  const isPinned = (id: VerticalIconKey): boolean => topGroup === null || topGroup === id;
  const drawerEntries = DRAW_ENTRY_ORDER.filter((id) => !isPinned(id));

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'Escape') {
      setAreaMenuOpen(false);
      setDrawerOpen(false);
    }
  };

  /** 抽屉项激活（与常驻入口同路共享入口；点击后收起抽屉） */
  const activateDrawerEntry = (id: VerticalIconKey): void => {
    setDrawerOpen(false);
    if (!facade) return;
    if (id === 'region') toggleRegionDraw(facade.tools);
    else if (id === 'line') toggleShapeDraw(facade.tools, 'line');
    else if (id === 'point') toggleShapeDraw(facade.tools, 'point');
    else if (!togglePlacement(facade.tools, facade.scene, lastAssetId)) {
      pushToast('info', '先在底部内容浏览器选择资产，再按 4 或点击此钮放置');
    }
  };

  return (
    <aside className="ed-vtool" aria-label="垂直工具条">
      <div className="ed-vtool__items" role="group" aria-label="工具">
        {/* ── 变换组（QWER；任何模式常驻；键位纯字母不变，与上下文条同路） ── */}
        {TRANSFORM_ITEMS.map((item) => {
          const Icon = item.id === 'select' ? MousePointer2 : item.id === 'translate' ? Move3d : item.id === 'rotate' ? Rotate3d : Scale3d;
          const active =
            item.id === 'select' ? activeToolId === 'select' : activeToolId === 'transform' && gizmoMode === item.mode;
          return (
            <Tooltip key={item.id} label={item.label} keys={item.key} hint={item.id === 'select' ? '点选 / 框选对象' : 'Gizmo 变换（拖动手柄）'}>
              <button
                type="button"
                className={`ed-vtool__btn${active ? ' ed-vtool__btn--active' : ''}`}
                aria-pressed={active}
                aria-label={`${item.label}（${item.key}）`}
                disabled={!facade}
                onClick={() => {
                  if (!facade) return;
                  if (item.mode === null) activateSelectTool(facade.tools);
                  else activateTransformTool(facade.tools, item.mode);
                }}
              >
                <Icon size={17} />
              </button>
            </Tooltip>
          );
        })}

        <span className="ed-vtool__sep" role="separator" aria-label="绘制组" />

        {/* ── 区域组（1：分裂按钮 = 记忆子工具 + 五子工具下拉；非置顶时进抽屉） ── */}
        {isPinned('region') ? (
          <div className="ed-vtool__split" ref={areaMenuRef}>
            <Tooltip
              label={`绘制区域 · ${rememberedSub.label}`}
              keys="1"
              hint={rememberedSub.hint}
            >
              <button
                type="button"
                className={`ed-vtool__btn${regionActive ? ' ed-vtool__btn--active' : ''}`}
                aria-pressed={regionActive}
                aria-label={`绘制区域（1）· 当前子工具：${rememberedSub.label}`}
                aria-haspopup="menu"
                aria-expanded={areaMenuOpen}
                disabled={!facade}
                onClick={() => facade && toggleRegionDraw(facade.tools)}
              >
                {(() => {
                  const Icon = AREA_SUB_ICONS[rememberedSub.shapeType];
                  return <Icon size={17} />;
                })()}
              </button>
            </Tooltip>
            <button
              type="button"
              className={`ed-vtool__chevron${areaMenuOpen ? ' ed-vtool__chevron--open' : ''}`}
              aria-label="区域子工具（Shift+1..5 直切）"
              aria-haspopup="menu"
              aria-expanded={areaMenuOpen}
              title="区域子工具：多边形 / 矩形 / 圆形 / 椭圆 / 自由（⇧1–5 直切）"
              disabled={!facade}
              onClick={() => setAreaMenuOpen((open) => !open)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setAreaMenuOpen(false);
              }}
            >
              <ChevronDown size={11} aria-hidden="true" />
            </button>
            {areaMenuOpen ? (
              // T9.1：flyout 经根浮层容器挂载——逃逸垂直条列，覆盖 DOM 靠后的左面板列
              // （贴锚语义不变：列右缘外 4px / 顶对锚顶）；点击外部关闭归 AnchoredPopup
              <AnchoredPopup
                anchorRef={areaMenuRef}
                placement="flyout-right"
                role="menu"
                ariaLabel="区域子工具"
                className="ed-vtool__menu"
                onOutsidePointerDown={() => setAreaMenuOpen(false)}
              >
                {AREA_SUBTOOLS.map((sub) => {
                  const Icon = AREA_SUB_ICONS[sub.shapeType];
                  const active = drawTarget?.shapeType === sub.shapeType && activeToolId === sub.toolId;
                  return (
                    <button
                      key={sub.shapeType}
                      type="button"
                      className={`ed-menu__item${active ? ' ed-menu__item--current' : ''}`}
                      role="menuitem"
                      aria-checked={active}
                      title={sub.hint}
                      onClick={() => {
                        setAreaMenuOpen(false);
                        if (facade) toggleShapeDraw(facade.tools, sub.shapeType);
                      }}
                      onKeyDown={onMenuKeyDown}
                    >
                      <span className="ed-menu__check" aria-hidden="true">
                        {active ? <Check size={12} /> : null}
                      </span>
                      <Icon size={14} />
                      <span className="ed-menu__label">{sub.label}</span>
                      <kbd className="ed-kbd">⇧{sub.subKey}</kbd>
                    </button>
                  );
                })}
              </AnchoredPopup>
            ) : null}
          </div>
        ) : null}

        {/* ── 路径（2）/ 点（3）：非置顶时进抽屉 ── */}
        {VERTICAL_TOOLS.filter((item) => (item.id === 'line' || item.id === 'point') && isPinned(item.id)).map((item) => {
          const Icon = VERTICAL_ICONS[item.icon]!;
          const active = activeToolId === item.toolId && drawTarget?.shapeType === (item.id === 'line' ? 'line' : 'point');
          return (
            <Tooltip key={item.id} label={item.label} keys={item.key} hint={item.hint}>
              <button
                type="button"
                className={`ed-vtool__btn${active ? ' ed-vtool__btn--active' : ''}`}
                aria-pressed={active}
                aria-label={`${item.label}（${item.key}）`}
                disabled={!facade}
                onClick={() => facade && toggleShapeDraw(facade.tools, item.id === 'line' ? 'line' : 'point')}
              >
                <Icon size={17} />
              </button>
            </Tooltip>
          );
        })}

        {/* ── 资产放置（4：重放最近资产）；非置顶时进抽屉 ── */}
        {isPinned('placement') ? (
          <Tooltip
            label="资产放置"
            keys="4"
            hint={lastAssetId !== null ? '重放最近选择的资产，视口左键连续放置' : '先在内容浏览器选择资产后可用'}
          >
            <button
              type="button"
              className={`ed-vtool__btn${activeToolId === 'placement' ? ' ed-vtool__btn--active' : ''}`}
              aria-pressed={activeToolId === 'placement'}
              aria-label="资产放置（4）"
              disabled={!facade}
              onClick={() => {
                if (!facade) return;
                if (!togglePlacement(facade.tools, facade.scene, lastAssetId)) {
                  pushToast('info', '先在底部内容浏览器选择资产，再按 4 或点击此钮放置');
                }
              }}
            >
              <Box size={17} />
            </button>
          </Tooltip>
        ) : null}

        {/* ── 测量分组（阶段 10 T10.2）：四子工具按钮（无数字键——1–4 已占不扩位）；
             测量模式置顶本分组，其余模式经「更多」抽屉可达（模式是焦点非权限闸门） ── */}
        {isPinned('measure') ? (
          <>
            <span className="ed-vtool__sep" role="separator" aria-label="测量组" />
            {MEASURE_SUBTOOLS.map((sub) => {
              const Icon = MEASURE_ICONS[sub.kind];
              const active = activeToolId === sub.toolId;
              return (
                <Tooltip key={sub.kind} label={sub.label} hint={sub.hint}>
                  <button
                    type="button"
                    className={`ed-vtool__btn${active ? ' ed-vtool__btn--active' : ''}`}
                    aria-pressed={active}
                    aria-label={`${sub.label}测量`}
                    disabled={!facade}
                    onClick={() => facade && toggleMeasureTool(facade.tools, sub.kind)}
                  >
                    <Icon size={17} />
                  </button>
                </Tooltip>
              );
            })}
          </>
        ) : null}

        {/* ──「更多」抽屉（T7.1 联动 3）：本模式组外绘制/资产/测量入口折叠于此，抽屉内可激活 ── */}
        {drawerEntries.length > 0 || !isPinned('measure') ? (
          <div className="ed-vtool__drawer" ref={drawerRef}>
            <button
              type="button"
              className={`ed-vtool__drawer-btn${drawerOpen ? ' ed-vtool__drawer-btn--open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={drawerOpen}
              aria-label={`更多工具（本模式外的 ${drawerEntries.length + (!isPinned('measure') ? MEASURE_SUBTOOLS.length : 0)} 个绘制/资产/测量入口）`}
              title={`更多工具：${[
                ...drawerEntries.map((id) => VERTICAL_TOOLS.find((t) => t.id === id)!.label),
                ...(!isPinned('measure') ? MEASURE_SUBTOOLS.map((sub) => `${sub.label}测量`) : []),
              ].join(' / ')}（数字键 1–4 随时直达）`}
              disabled={!facade}
              onClick={() => setDrawerOpen((open) => !open)}
              onKeyDown={onMenuKeyDown}
            >
              <Ellipsis size={13} aria-hidden="true" />
              <span className="ed-vtool__drawer-label">更多</span>
            </button>
            {drawerOpen ? (
              // T9.1：「更多」抽屉同 flyout 经根浮层容器挂载（覆盖左面板列；贴锚不变）
              <AnchoredPopup
                anchorRef={drawerRef}
                placement="flyout-right"
                role="menu"
                ariaLabel="更多工具"
                className="ed-vtool__drawer-menu"
                onOutsidePointerDown={() => setDrawerOpen(false)}
              >
                {drawerEntries.map((id) => {
                  const def = VERTICAL_TOOLS.find((t) => t.id === id)!;
                  const Icon = VERTICAL_ICONS[def.icon]!;
                  const active =
                    activeToolId === def.toolId ||
                    (id === 'region' && regionActive) ||
                    (id === 'placement' && activeToolId === 'placement');
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`ed-menu__item${active ? ' ed-menu__item--current' : ''}`}
                      role="menuitem"
                      aria-checked={active}
                      title={id === 'region' ? rememberedSub.hint : def.hint}
                      onClick={() => activateDrawerEntry(id)}
                      onKeyDown={onMenuKeyDown}
                    >
                      <span className="ed-menu__check" aria-hidden="true">
                        {active ? <Check size={12} /> : null}
                      </span>
                      {(() => {
                        if (id === 'region') {
                          const SubIcon = AREA_SUB_ICONS[rememberedSub.shapeType];
                          return <SubIcon size={14} />;
                        }
                        return <Icon size={14} />;
                      })()}
                      <span className="ed-menu__label">
                        {id === 'region' ? `绘制区域 · ${rememberedSub.label}` : def.label}
                      </span>
                      <kbd className="ed-kbd">{def.key}</kbd>
                    </button>
                  );
                })}
                {/* 测量四子工具（阶段 10：非测量模式经抽屉可达——工具任何模式可用语义） */}
                {!isPinned('measure') ? (
                  <>
                    {drawerEntries.length > 0 ? <div className="ed-menu__sep" role="separator" /> : null}
                    {MEASURE_SUBTOOLS.map((sub) => {
                      const Icon = MEASURE_ICONS[sub.kind];
                      const active = activeToolId === sub.toolId;
                      return (
                        <button
                          key={sub.kind}
                          type="button"
                          className={`ed-menu__item${active ? ' ed-menu__item--current' : ''}`}
                          role="menuitem"
                          aria-checked={active}
                          title={sub.hint}
                          onClick={() => {
                            setDrawerOpen(false);
                            if (facade) toggleMeasureTool(facade.tools, sub.kind);
                          }}
                          onKeyDown={onMenuKeyDown}
                        >
                          <span className="ed-menu__check" aria-hidden="true">
                            {active ? <Check size={12} /> : null}
                          </span>
                          <Icon size={14} />
                          <span className="ed-menu__label">{`${sub.label}测量`}</span>
                        </button>
                      );
                    })}
                  </>
                ) : null}
              </AnchoredPopup>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
