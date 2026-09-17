/**
 * ui/menus/LayoutMenu —— 顶栏「布局」弹层（T7.3；T5.2 占位转正）。
 *
 * 职责（需求 29/30 章）：
 *   - 四布局预设 radio 呈现（default/minimal/build/analysis）：当前布局经
 *     matchPreset 命中项高亮，未命中显「自定义」态；点击 = applyLayout 一次性应用
 *     （预设不含 mode——工作态非布局态，T7.1 裁定）；
 *   - 个人布局列表：点击应用；每项行尾图标钮（T8.3：重命名 Pencil / 导出 Download /
 *     删除 X，hover 浮显）；空列表友好占位；命名布局持久化走 layoutPresets CRUD
 *     （localStorage，重名覆盖）；行内重命名（T8.3：撞名拒绝、保序、Enter/Esc 手势，
 *     沿行内命名保存交互先例）；导出 = name + 布局字段 JSON 文件下载（serializeLayoutExport）；
 *   - 动作：「保存当前布局…」（行内命名输入；空名禁用保存、重名显「将覆盖」提示）/
 *     「导入布局…」（T8.3：文件上传经 parseLayoutImport 校验——结构非法整体拒收
 *     Toast 提示、成功存入个人布局表）与「恢复默认」（唯一例外组合：default 预设 +
 *     setMode('scene')，T7.3 门裁定）。
 * 交互（沿 MenuBar 先例）：点击开合 / 点击外部 / Esc 关闭并回焦触发钮；弹层复用
 *   .ed-menu__popup 浮层原语 + .ed-menu__item 行样式（零新美学方向，DESIGN.md §5.5）；
 *   预设组 ↑↓ 循环聚焦（radiogroup 键盘惯例）；过渡 150–300ms、等宽数字读数。
 * 边界：布局是 ui 本地状态（不依赖 facade ready，按钮恒可用）——本组件为 MenuBar
 *   「状态全经 props」边界的**局部放宽**：直连 useWorkspaceStore 与 layout 持久化纯
 *   模块（与 ContextToolbar/ZoneToggle 直读 workspaceStore 同先例），不触碰
 *   EditorFacade / EventBus / io；菜单 actionId 体系不经此层；导入反馈走 Toast
 *   （ui/feedback/toastStore 现有通道）。
 */
import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Check, Download, Pencil, Upload, X } from 'lucide-react';
import {
  LAYOUT_PRESETS,
  deleteNamedLayout,
  listNamedLayouts,
  matchPreset,
  parseLayoutImport,
  renameNamedLayout,
  saveNamedLayout,
  serializeLayoutExport,
} from '../layout/layoutPresets';
import type { LayoutFields, NamedLayout } from '../layout/layoutPresets';
import { pushToast } from '../feedback/toastStore';
import { useWorkspaceStore } from '../layout/workspaceStore';
import { AnchoredPopup } from '../components/AnchoredPopup';

const POPUP_ID = 'ed-layout-popup';

/** 三区尺寸读数（等宽数字，弹层行尾仪表注记） */
function sizeReadout(leftWidth: number, rightWidth: number, bottomHeight: number): string {
  return `${leftWidth}·${rightWidth}·${bottomHeight}`;
}

export function LayoutMenu() {
  const [open, setOpen] = useState(false);
  const [named, setNamed] = useState<NamedLayout[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  /** 行内重命名目标布局名（T8.3；null = 非重命名态） */
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const presetRefs = useRef<HTMLButtonElement[]>([]);
  /** 导入文件选择（T8.3；隐藏 input 受控触发） */
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 布局字段（matchPreset 命中判定的输入；逐字段订阅避免对象选择器引用不稳定）
  const leftWidth = useWorkspaceStore((s) => s.leftWidth);
  const rightWidth = useWorkspaceStore((s) => s.rightWidth);
  const bottomHeight = useWorkspaceStore((s) => s.bottomHeight);
  const hiddenPanels = useWorkspaceStore((s) => s.hiddenPanels);
  const collapsedSections = useWorkspaceStore((s) => s.collapsedSections);
  const inspectorTab = useWorkspaceStore((s) => s.inspectorTab);
  const browser = useWorkspaceStore((s) => s.browser);
  const layout = { leftWidth, rightWidth, bottomHeight, hiddenPanels, collapsedSections, inspectorTab, browser };
  const currentPreset = matchPreset(layout);

  const trimmed = saveName.trim();
  const nameValid = trimmed !== '';
  const duplicate = nameValid && named.some((entry) => entry.name === trimmed);

  // 展开期间点击外部关闭（T9.1 起归 AnchoredPopup 统一监听：锚与根浮层容器之外即外部）
  const closePopup = useCallback((): void => {
    setOpen(false);
    setSaveOpen(false);
    setRenaming(null); // 行内重命名随弹层关闭一并取消（T8.3）
    buttonRef.current?.focus();
  }, []);

  /** 开合：打开时重读个人布局表（会话内其他入口可能已改动）并聚焦首个预设项 */
  const toggle = useCallback((): void => {
    if (open) {
      closePopup();
      return;
    }
    setNamed(listNamedLayouts());
    setSaveOpen(false);
    setOpen(true);
    window.setTimeout(() => presetRefs.current[0]?.focus(), 0); // 等弹层 commit 后聚焦（MenuBar 先例）
  }, [open, closePopup]);

  const applyPreset = useCallback((layoutToApply: LayoutFields): void => {
    useWorkspaceStore.getState().applyLayout(layoutToApply); // mode 不动（工作态非布局态）
  }, []);

  /** 「恢复默认」：唯一例外组合——default 预设 + 显式模式回落 scene（T7.3 门裁定） */
  const restoreDefault = useCallback((): void => {
    const store = useWorkspaceStore.getState();
    store.applyLayout(LAYOUT_PRESETS[0]!.layout);
    store.setMode('scene');
  }, []);

  const removeNamed = useCallback((name: string): void => {
    deleteNamedLayout(name);
    setNamed(listNamedLayouts());
  }, []);

  // ── T8.3：重命名 / 导出 / 导入 ──

  const renameTrimmed = renameDraft.trim();
  const renameDuplicate =
    renaming !== null &&
    renameTrimmed !== renaming &&
    named.some((entry) => entry.name === renameTrimmed);

  const startRename = useCallback((name: string): void => {
    setRenaming(name);
    setRenameDraft(name);
  }, []);

  const submitRename = useCallback((): void => {
    if (renaming === null) return;
    if (renameTrimmed === '' || renameDuplicate) return; // 空名/撞名禁用（按钮已禁用，Enter 同守卫）
    if (renameNamedLayout(renaming, renameTrimmed)) {
      setNamed(listNamedLayouts());
      setRenaming(null);
      setRenameDraft('');
    } else {
      pushToast('error', `重命名失败：「${renameTrimmed}」不可用`);
    }
  }, [renameDuplicate, renameTrimmed, renaming]);

  const exportNamed = useCallback((entry: NamedLayout): void => {
    const raw = serializeLayoutExport(entry.name, entry.layout);
    if (raw === null) {
      pushToast('error', '导出失败：布局名为空');
      return;
    }
    try {
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `t3d-layout-${entry.name}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      pushToast('error', '导出失败：浏览器不支持文件下载');
    }
  }, []);

  const onImportFile = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = ''; // 同文件可重复选择
    if (!file) return;
    void file
      .text()
      .then((text) => {
        const payload = parseLayoutImport(text);
        if (payload === null) {
          pushToast('error', `布局文件无效：${file.name}（应为「布局」弹层导出的 JSON）`);
          return;
        }
        if (!saveNamedLayout(payload.name, payload.layout)) {
          pushToast('error', `导入失败：布局「${payload.name}」写入本浏览器失败`);
          return;
        }
        setNamed(listNamedLayouts());
        pushToast('info', `已导入布局「${payload.name}」——点击列表项应用`);
      })
      .catch(() => pushToast('error', `导入失败：${file.name} 读取错误`));
  }, []);

  const submitSave = useCallback((): void => {
    if (!nameValid) return; // 空名拒绝（按钮已禁用，键盘 Enter 同守卫）
    if (saveNamedLayout(trimmed, layout)) {
      setNamed(listNamedLayouts());
      setSaveOpen(false);
      setSaveName('');
    }
  }, [layout, nameValid, trimmed]);

  // ── 键盘：Esc 关闭回焦（弹层内任意位置，含输入框）；输入框 Enter 提交 ──
  const onRootKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault(); // 不外溢到全局 ESC 退出手势（右键菜单同约定）
      closePopup();
    }
  };

  /** 预设组 ↑↓ 循环聚焦（radiogroup 键盘惯例；Tab 顺序自然流转其余段） */
  const onPresetKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const count = LAYOUT_PRESETS.length;
    const next = (index + (e.key === 'ArrowDown' ? 1 : -1) + count) % count;
    presetRefs.current[next]?.focus();
  };

  return (
    <div
      className="ed-menu ed-layout"
      ref={rootRef}
      onKeyDown={onRootKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`ed-btn ed-btn--ghost ed-layout__btn${open ? ' ed-layout__btn--open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={POPUP_ID}
        title="工作区布局：预设切换 · 个人布局 · 恢复默认（随浏览器自动记忆）"
        onClick={toggle}
      >
        布局
      </button>

      {open ? (
        // T9.1：弹层 portal 至根浮层容器（逃逸 menubar 的 z10 层叠上下文）；右缘贴锚
        // （顶栏右端）+ 顶贴锚底，Esc/键盘沿 React 树冒泡回本组件处理（不变）
        <AnchoredPopup
          anchorRef={rootRef}
          placement="below-right"
          role="dialog"
          ariaLabel="工作区布局"
          id={POPUP_ID}
          className="ed-layout__popup"
          onOutsidePointerDown={closePopup}
        >
          {/* ① 四预设（radio；当前 matchPreset 命中项高亮，未命中 = 自定义态） */}
          <div className="ed-layout__title">预设</div>
          <div className="ed-layout__presets" role="radiogroup" aria-label="布局预设">
            {LAYOUT_PRESETS.map((preset, index) => {
              const active = currentPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`ed-menu__item ed-layout__preset${active ? ' ed-layout__preset--current' : ''}`}
                  title={preset.hint}
                  ref={(el) => {
                    if (el) presetRefs.current[index] = el;
                  }}
                  onClick={() => applyPreset(preset.layout)}
                  onKeyDown={(e) => onPresetKeyDown(e, index)}
                >
                  <span className="ed-menu__check" aria-hidden="true">
                    {active ? <Check size={12} /> : null}
                  </span>
                  <span className="ed-menu__label">{preset.label}</span>
                  <span className="ed-layout__meta ed-readout" aria-hidden="true">
                    {sizeReadout(preset.layout.leftWidth, preset.layout.rightWidth, preset.layout.bottomHeight)}
                  </span>
                </button>
              );
            })}
            {currentPreset === null ? <div className="ed-layout__custom">当前为自定义布局</div> : null}
          </div>

          <div className="ed-menu__sep" role="separator" />

          {/* ② 个人布局（点击应用；行尾重命名/导出/删除图标钮；空列表占位） */}
          <div className="ed-layout__title">个人布局</div>
          {named.length === 0 ? (
            <div className="ed-layout__empty">暂无已保存布局——调整面板后在下方「保存当前布局」</div>
          ) : (
            <div className="ed-layout__list">
              {named.map((entry) => (
                <div className="ed-layout__item" key={entry.name}>
                  {renaming === entry.name ? (
                    /* T8.3 行内重命名：沿保存命名卡交互语言（空名/撞名禁用、Enter/Esc） */
                    <div className="ed-layout__save ed-layout__rename">
                      <input
                        type="text"
                        className="ed-input ed-layout__save-input"
                        value={renameDraft}
                        aria-label={`重命名布局「${entry.name}」`}
                        autoFocus
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            submitRename();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setRenaming(null);
                          }
                        }}
                      />
                      <div className="ed-layout__save-actions">
                        <button
                          type="button"
                          className="ed-btn ed-btn--primary"
                          disabled={renameTrimmed === '' || renameDuplicate}
                          onClick={submitRename}
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          className="ed-btn ed-btn--ghost"
                          onClick={() => setRenaming(null)}
                        >
                          取消
                        </button>
                      </div>
                      <div className="ed-layout__hint" role="status">
                        {renameTrimmed === ''
                          ? '请输入布局名称'
                          : renameDuplicate
                            ? `同名布局「${renameTrimmed}」已存在`
                            : '改名后条目顺序保持不变'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="ed-layout__apply"
                        title={`应用布局「${entry.name}」`}
                        onClick={() => applyPreset(entry.layout)}
                      >
                        <span className="ed-layout__name">{entry.name}</span>
                        <span className="ed-layout__meta ed-readout" aria-hidden="true">
                          {sizeReadout(entry.layout.leftWidth, entry.layout.rightWidth, entry.layout.bottomHeight)}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="ed-layout__iconbtn"
                        aria-label={`重命名布局「${entry.name}」`}
                        title={`重命名「${entry.name}」`}
                        onClick={() => startRename(entry.name)}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        className="ed-layout__iconbtn"
                        aria-label={`导出布局「${entry.name}」为 JSON 文件`}
                        title={`导出「${entry.name}」（JSON 文件下载）`}
                        onClick={() => exportNamed(entry)}
                      >
                        <Download size={12} />
                      </button>
                      <button
                        type="button"
                        className="ed-layout__delete"
                        aria-label={`删除布局「${entry.name}」`}
                        title={`删除布局「${entry.name}」`}
                        onClick={() => removeNamed(entry.name)}
                      >
                        <X size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ③ 动作：保存当前布局（行内命名）/ 恢复默认 */}
          {saveOpen ? (
            <div className="ed-layout__save">
              <input
                type="text"
                className="ed-input ed-layout__save-input"
                value={saveName}
                placeholder="布局名称"
                aria-label="布局名称"
                autoFocus
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitSave();
                  }
                }}
              />
              <div className="ed-layout__save-actions">
                <button
                  type="button"
                  className="ed-btn ed-btn--primary"
                  disabled={!nameValid}
                  onClick={submitSave}
                >
                  保存{duplicate ? '（覆盖）' : ''}
                </button>
                <button
                  type="button"
                  className="ed-btn ed-btn--ghost"
                  onClick={() => {
                    setSaveOpen(false);
                    setSaveName('');
                  }}
                >
                  取消
                </button>
              </div>
              <div className="ed-layout__hint" role="status">
                {!nameValid
                  ? '请输入布局名称'
                  : duplicate
                    ? `同名布局「${trimmed}」将被覆盖`
                    : '保存当前面板尺寸 / 显隐 / 标签与浏览器状态'}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="ed-menu__item ed-layout__action"
              title="把当前面板配置保存为个人布局（存于本浏览器）"
              onClick={() => {
                setSaveOpen(true);
                setSaveName('');
              }}
            >
              <span className="ed-menu__check" aria-hidden="true" />
              <span className="ed-menu__label">保存当前布局…</span>
            </button>
          )}

          <div className="ed-menu__sep" role="separator" />

          {/* T8.3：导入布局（文件上传 → parseLayoutImport 校验；隐藏 file input） */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="ed-layout__file-input"
            aria-hidden="true"
            tabIndex={-1}
            onChange={onImportFile}
          />
          <button
            type="button"
            className="ed-menu__item ed-layout__action"
            title="从导出的布局 JSON 文件导入为个人布局（存于本浏览器）"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="ed-menu__check" aria-hidden="true">
              <Upload size={12} />
            </span>
            <span className="ed-menu__label">导入布局…</span>
          </button>

          <button
            type="button"
            className="ed-menu__item ed-layout__action"
            title="恢复默认布局，工作模式回到「场景」"
            onClick={restoreDefault}
          >
            <span className="ed-menu__check" aria-hidden="true" />
            <span className="ed-menu__label">恢复默认</span>
          </button>
        </AnchoredPopup>
      ) : null}
    </div>
  );
}
