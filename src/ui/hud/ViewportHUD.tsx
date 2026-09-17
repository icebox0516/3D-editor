/**
 * ui/hud/ViewportHUD —— 视口四角 HUD（T5.7，需求 §12；T7.1 模式徽标升级）。
 *
 * 职责与布局（绝对定位于视口容器四角，pointer-events:none——下拉容器除外，不遮挡中心）：
 *  - 左上（T7.1 两行）：芯片行 = 模式徽标（combineMode 显示模式全名 + 模式专属色
 *    --mode-*；显式模式经 workspaceStore.mode，绘制/放置期间临时切派生态）· 机位
 *    （store.cameraMode 会话记账）· 场景名（session.getSceneName，随 sceneVersion
 *    重读）；其下一行 hudHint 操作引导（toolIA MODES 同源）；场景内渲染零改动（门 Q3b）；
 *  - 右上控制排：Perspective ▼（四机位单选，camera.setMode 不抢工具）、Shaded ▼
 *    （六渲染模式两组下拉 → session.setEnvironment({ renderMode })，与主菜单同源环境通道；
 *    T8.4 诊断三档常规组下分隔呈现）+ islands 计数角标芯片（孤岛高亮激活期间
 *    「未归类对象：N」，sceneVersion 驱动幂等重读）、
 *    齿轮 Viewport Options（网格 toggle / 坐标轴 toggle / 小地图 toggle——T7.7 转正：
 *    workspaceStore.minimapVisible，随工作区快照持久化）；
 *  - 右下：园区导航小地图为 runtime 产物（MinimapRenderer 自建 canvas 挂
 *    .ed-viewport__minimap，非 React 节点，沿坐标轴指示器先例）；左下坐标轴指示器同；
 *  - 底部居中（T7.4）：纯三维模式专用基础操作提示芯片（.ed-hud--bc，仅 pure3d 渲染
 *    ——订阅 workspaceStore.pure3d）。
 * 边界：零 THREE、零 runtime；机位/环境/网格读取均幂等快照（sceneVersion 订阅驱动重读）；
 *      下拉交互沿 ContextToolbar Scene ▼ 模式（外部点击关闭 / ↓ 展开 / ESC 关闭）。
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Check, ChevronDown, Settings } from 'lucide-react';
import { combineMode, workModeOf } from '../tools/toolIA';
import { useEditorStore } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import type { CameraModeId } from '../store';
import { coerceSceneAxes } from '../../scene/SceneData';
import type { ViewportRenderMode } from '../../scene/SceneData';
import { CAMERA_MODES, DIAGNOSTIC_RENDER_MODES, RENDER_MODES, countUnclassified, describeIslandCount, formatCameraMode, formatRenderMode, renderModeOfEnvironment } from './hudModel';

/** 下拉选项通用形状 */
interface HudOption<T extends string> {
  value: T;
  label: string;
}

/** 下拉分组分隔条目（T8.4 渲染模式下拉常规/诊断两组；非交互不占键） */
interface HudOptionSeparator {
  separator: true;
}

type HudEntry<T extends string> = HudOption<T> | HudOptionSeparator;

/** 渲染模式下拉条目（常规三态 | 分隔 | 诊断三档；三路菜单同源分组） */
const RENDER_MODE_ENTRIES: ReadonlyArray<HudEntry<ViewportRenderMode>> = [
  ...RENDER_MODES.map((m) => ({ value: m.id, label: m.label })),
  { separator: true },
  ...DIAGNOSTIC_RENDER_MODES.map((m) => ({ value: m.id, label: m.label })),
];

export function ViewportHUD() {
  const activeToolId = useEditorStore((s) => s.activeToolId);
  const drawTarget = useEditorStore((s) => s.drawTarget);
  const cameraMode = useEditorStore((s) => s.cameraMode);
  const camera = useEditorStore((s) => s.camera);
  const session = useEditorStore((s) => s.session);
  const facade = useEditorStore((s) => s.facade);
  const setCameraMode = useEditorStore((s) => s.setCameraMode);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  const mode = useWorkspaceStore((s) => s.mode);
  /** 纯三维工作模式（T7.4）：仅此模式下渲染底部居中基础操作提示芯片 */
  const pure3d = useWorkspaceStore((s) => s.pure3d);

  // 左上：模式徽标 = combineMode（与 ContextToolbar 徽标同一数据源，T7.1 全名+专属色）
  const currentMode = workModeOf(combineMode(mode, activeToolId, drawTarget));
  const modeAccent = `var(${currentMode.accent ?? '--accent'})`;
  // 场景名随 sceneVersion 重读（openScene / 新建 / 保存通道均发 scene:changed）
  void sceneVersion;
  const sceneName = session?.getSceneName() ?? '';
  // 渲染模式（幂等快照；环境键变化经 sceneVersion 订阅驱动重读）与
  // islands 计数角标数据源（T8.4：layerId === null 的对象计数，沿 StatusBar 幂等快照先例）
  const renderMode = renderModeOfEnvironment(session?.getEnvironment().renderMode);
  const unclassified = renderMode === 'islands' ? countUnclassified(facade?.scene.getObjects() ?? []) : 0;

  const pickCameraMode = (mode: CameraModeId): void => {
    camera?.setMode(mode);
    setCameraMode(camera?.getMode() ?? mode);
  };

  return (
    <>
      <div className="ed-hud ed-hud--tl" aria-live="polite">
        <div className="ed-hud__row">
          <span
            className="ed-hud__chip ed-hud__chip--mode"
            style={{ '--mode-accent': modeAccent } as CSSProperties}
            title={`当前工作模式：${currentMode.label}（${currentMode.hint}）`}
          >
            <span className="ed-hud__dot" aria-hidden="true" />
            <span className="ed-hud__label">{currentMode.label}</span>
          </span>
          <span className="ed-hud__chip" title="相机机位（右上 Perspective ▼ 切换）">
            {formatCameraMode(cameraMode)}
          </span>
          <span className="ed-hud__chip ed-hud__chip--name" title="当前场景名">
            {sceneName}
          </span>
        </div>
        {/* T7.1 联动 5：徽标下一行操作引导（仅 HUD 文案，场景内渲染零改动） */}
        <span className="ed-hud__mode-hint">{currentMode.hudHint}</span>
      </div>

      <div className="ed-hud ed-hud--tr" role="group" aria-label="视口选项">
        {/* T8.4 islands 计数角标：孤岛高亮激活期间显示「未归类对象：N」（N=0 → 全部已归类）；
            数据卫生验收量化——归层操作（object:updated → sceneVersion）实时收敛 */}
        {renderMode === 'islands' ? (
          <span
            className="ed-hud__chip ed-hud__chip--islands"
            title="孤岛高亮：未归入任何图层的对象计数（归层后实时更新）"
          >
            {describeIslandCount(unclassified)}
          </span>
        ) : null}
        <HudMenu
          label={formatCameraMode(cameraMode)}
          title="相机机位"
          options={CAMERA_MODES.map((m) => ({ value: m.id, label: m.label }))}
          current={cameraMode}
          disabled={camera === null}
          onPick={pickCameraMode}
        />
        <HudMenu
          label={formatRenderMode(renderMode)}
          title="渲染模式（常规 / 诊断）"
          options={RENDER_MODE_ENTRIES}
          current={renderMode}
          disabled={session === null}
          onPick={(mode: ViewportRenderMode) =>
            session?.setEnvironment({ ...session.getEnvironment(), renderMode: mode })
          }
        />
        <ViewportOptionsGear />
      </div>

      {/* 右下角园区导航小地图（T7.7）：runtime MinimapRenderer 自建 canvas
          （.ed-viewport__minimap，沿左下坐标轴指示器先例）——此处无 React 节点 */}

      {/* T7.4 纯三维模式底部居中基础操作提示（唯一退出手势 + 手势速查；仅 pure3d 渲染） */}
      {pure3d ? (
        <div className="ed-hud ed-hud--bc" aria-live="polite">
          <span className="ed-hud__chip">Tab 退出纯三维 · 左键选择 · 右键旋转 · 中键平移 · 滚轮缩放 · W/E/R 变换</span>
        </div>
      ) : null}
    </>
  );
}

// ── HUD 下拉（沿 ContextToolbar Scene ▼ 交互模式） ──────────

interface HudMenuProps<T extends string> {
  label: string;
  title: string;
  /** 选项条目（T8.4 起可含 separator 分组分隔——渲染模式下拉常规/诊断两组） */
  options: ReadonlyArray<HudEntry<T>>;
  current: T;
  disabled: boolean;
  onPick: (value: T) => void;
}

function HudMenu<T extends string>({ label, title, options, current, disabled, onPick }: HudMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // 展开期间点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: Event): void => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [open]);

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
    <div className="ed-hud__menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`ed-hud__btn${open ? ' ed-hud__btn--open' : ''}`}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        title={title}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKeyDown}
      >
        <span className="ed-hud__btn-label">{label}</span>
        <ChevronDown size={12} className={open ? 'ed-hud__caret--open' : undefined} aria-hidden="true" />
      </button>
      {open ? (
        <div className="ed-menu__popup" role="menu" aria-label={title}>
          {options.map((option, index) =>
            'separator' in option ? (
              <div className="ed-menu__sep" key={`sep-${index}`} role="separator" />
            ) : (
              <button
                key={option.value}
                type="button"
                className="ed-menu__item"
                role="menuitemradio"
                aria-checked={option.value === current}
                onClick={() => {
                  setOpen(false);
                  onPick(option.value);
                }}
                onKeyDown={onItemKeyDown}
              >
                <span className="ed-menu__check" aria-hidden="true">
                  {option.value === current ? <Check size={12} /> : null}
                </span>
                <span className="ed-menu__label">{option.label}</span>
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

// ── 齿轮 Viewport Options（网格 / 坐标轴 / 小地图 toggle） ──────

function ViewportOptionsGear() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const session = useEditorStore((s) => s.session);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  /** 小地图开关（T7.7 转正）：workspaceStore 记账 + 随工作区快照持久化；
   *  生效经 App 装配层 → EditorHandle.setMinimapVisible（ui 层零 runtime 导入） */
  const minimapVisible = useWorkspaceStore((s) => s.minimapVisible);
  const setMinimapVisible = useWorkspaceStore((s) => s.setMinimapVisible);

  void sceneVersion; // 环境键变化（scene:changed）时重读勾选位
  const gridVisible = session?.getGrid().visible ?? true;
  const axesVisible = coerceSceneAxes(session?.getEnvironment().axes).visible;

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: Event): void => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [open]);

  const toggleGrid = (): void => {
    if (!session) return;
    const grid = session.getGrid();
    session.setGrid({ ...grid, visible: !grid.visible });
  };

  const toggleAxes = (): void => {
    if (!session) return;
    const env = session.getEnvironment();
    session.setEnvironment({ ...env, axes: { visible: !coerceSceneAxes(env.axes).visible } });
  };

  return (
    <div className="ed-hud__menu" ref={rootRef}>
      <button
        type="button"
        className={`ed-hud__btn${open ? ' ed-hud__btn--open' : ''}`}
        disabled={session === null}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Viewport Options（网格 / 坐标轴 / 小地图）"
        aria-label="视口选项"
        onClick={() => setOpen((value) => !value)}
      >
        <Settings size={13} aria-hidden="true" />
        <ChevronDown size={12} className={open ? 'ed-hud__caret--open' : undefined} aria-hidden="true" />
      </button>
      {open ? (
        <div className="ed-menu__popup" role="menu" aria-label="视口选项">
          <button type="button" className="ed-menu__item" role="menuitemcheckbox" aria-checked={gridVisible} onClick={toggleGrid}>
            <span className="ed-menu__check" aria-hidden="true">
              {gridVisible ? <Check size={12} /> : null}
            </span>
            <span className="ed-menu__label">网格</span>
          </button>
          <button type="button" className="ed-menu__item" role="menuitemcheckbox" aria-checked={axesVisible} onClick={toggleAxes}>
            <span className="ed-menu__check" aria-hidden="true">
              {axesVisible ? <Check size={12} /> : null}
            </span>
            <span className="ed-menu__label">坐标轴</span>
          </button>
          <button
            type="button"
            className="ed-menu__item"
            role="menuitemcheckbox"
            aria-checked={minimapVisible}
            title="右下角园区导航小地图（随工作区布局记忆）"
            onClick={() => setMinimapVisible(!minimapVisible)}
          >
            <span className="ed-menu__check" aria-hidden="true">
              {minimapVisible ? <Check size={12} /> : null}
            </span>
            <span className="ed-menu__label">小地图</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
