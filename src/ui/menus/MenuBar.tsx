/**
 * ui/menus/MenuBar —— 主菜单条 + 顶部右侧常驻区（T5.2）。
 *
 * 职责：呈现 buildMenus 纯数据模型的七菜单（文件/编辑/场景/资产/工具/视图/帮助），
 *      菜单项点击只发 actionId 回调（onAction → app/actions 统一路由），不感知
 *      io / 门面；右侧常驻「撤销 / 重做｜保存 ● 状态｜布局（T7.3 起启用：LayoutMenu
 *      弹层——四预设 / 个人布局 / 恢复默认）｜设置」；帮助弹层（快捷键静态表 / 关于）
 *      为纯 UI 数据呈现。
 *      T5.8：顶部提示条（.ed-notice）随 Toast 体系（ui/feedback/toastStore +
 *      components/Toasts 右下角浮层）退役——AppNotice 通道撤销，类名登记退役。
 * 交互（UX 检查项）：点击开合 / 点击外部 / Esc 关闭；展开态 hover 顶层切换；
 *      键盘可达——顶层 ←→ 切换、↓/Enter 展开、菜单内 ↑↓ 循环、Enter 触发、Esc 关闭；
 *      role="menubar"/"menu"/"menuitem(checkbox/radio)"、aria-haspopup、aria-expanded、
 *      aria-disabled；快捷键键帽右对齐等宽（.ed-kbd）；禁用项灰显可见 + tooltip
 *      「后续版本提供」（不隐藏，需求 §39）。
 * 边界：ui 层零 runtime / io；状态全经 props（App 从 store/actions 汇总 MenuState）；
 *      组件不做 DOM 之外的副作用（选文件/下载全在 app 层）。唯一局部放宽：右侧
 *      「布局」入口的弹层（LayoutMenu，T7.3）直连 useWorkspaceStore 与 layout 持久化
 *      纯模块——布局是 ui 本地状态、不依赖 facade ready，与 ContextToolbar 直读
 *      workspaceStore 同先例（不触碰 EditorFacade / EventBus / actionId 体系）。
 */
import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import { ABOUT_INFO, SHORTCUT_HELP, buildMenus } from './menuModel';
import type { MenuId, MenuItemDef, MenuState, MenuSubmenuDef } from './menuModel';
import { LayoutMenu } from './LayoutMenu';
import { SAVE_STATE_LABEL } from '../saveStatus';
import type { SaveState } from '../saveStatus';
import { AnchoredPopup } from '../components/AnchoredPopup';

/** 帮助弹层种类（app 层 help.shortcuts / help.about 动作驱动） */
export type HelpDialog = 'shortcuts' | 'about' | null;

export interface MenuBarProps {
  /** 菜单状态（enabled/checked 矩阵输入；App 汇总各 store） */
  state: MenuState;
  saveState: SaveState;
  /** 唯一出口：菜单/常驻区动作统一发 actionId（app/actions 路由） */
  onAction: (actionId: string) => void;
  /** 菜单展开时回调（App 据此重读无事件通道的会话态：机位/吸附开关——上下文条
   *  视图按钮直连相机 Port 改机位时不发事件，checked 位须在展开时刷新） */
  onMenuOpen?: () => void;
  /** 帮助弹层开关（受控；App 持有） */
  helpDialog: HelpDialog;
  onHelpClose: () => void;
}

const MENU_ORDER: MenuId[] = ['file', 'edit', 'scene', 'asset', 'tool', 'view', 'help'];

/** 快捷键表分组呈现顺序 */
const SHORTCUT_GROUP_ORDER = ['全局', '变换', '绘制中'] as const;

export function MenuBar({
  state,
  saveState,
  onAction,
  onMenuOpen,
  helpDialog,
  onHelpClose,
}: MenuBarProps) {
  const menus = buildMenus(state);
  const [openId, setOpenId] = useState<MenuId | null>(null);
  const topButtons = useRef(new Map<MenuId, HTMLButtonElement>());
  const itemButtons = useRef(new Map<string, HTMLButtonElement>());
  /** 各菜单弹层锚 ref（.ed-menu 包装元素；T9.1 弹层 portal 后贴此锚定位） */
  const menuAnchors = useRef(new Map<MenuId, RefObject<HTMLDivElement | null>>());

  /** 取（或建）菜单锚 ref——稳定引用供 AnchoredPopup 依赖 */
  const menuAnchorRef = (id: MenuId): RefObject<HTMLDivElement | null> => {
    const map = menuAnchors.current;
    let ref = map.get(id);
    if (!ref) {
      ref = { current: null };
      map.set(id, ref);
    }
    return ref;
  };

  const closeMenu = useCallback(
    (refocus: boolean) => {
      const current = openId;
      setOpenId(null);
      if (refocus && current !== null) topButtons.current.get(current)?.focus();
    },
    [openId],
  );

  const openMenu = useCallback(
    (id: MenuId, focusFirst = false) => {
      onMenuOpen?.(); // 展开前刷新会话态（机位等无事件通道位）
      setOpenId(id);
      if (focusFirst) {
        // 等待弹层提交后聚焦首个可聚焦项（键盘展开路径）
        window.setTimeout(() => {
          const menu = document.getElementById(menuPopupId(id));
          const first = menu?.querySelector<HTMLButtonElement>('button[role^="menuitem"]');
          first?.focus();
        }, 0);
      }
    },
    [onMenuOpen],
  );

  /** 触发菜单项：关闭菜单 → 发 actionId → 焦点回顶层 */
  const trigger = useCallback(
    (menuId: MenuId, item: MenuItemDef) => {
      setOpenId(null);
      topButtons.current.get(menuId)?.focus();
      onAction(item.id);
    },
    [onAction],
  );

  // ── 键盘导航：顶层按钮 ──
  const onTopKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, id: MenuId): void => {
    const index = MENU_ORDER.indexOf(id);
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        openMenu(id, true);
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusTop(index + 1);
        if (openId !== null) setOpenId(MENU_ORDER[(index + 1) % MENU_ORDER.length]!);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusTop(index - 1);
        if (openId !== null) setOpenId(MENU_ORDER[(index - 1 + MENU_ORDER.length) % MENU_ORDER.length]!);
        break;
      case 'Escape':
        if (openId !== null) {
          e.preventDefault();
          closeMenu(false);
        }
        break;
      default:
        break;
    }
  };

  const focusTop = (index: number): void => {
    const id = MENU_ORDER[(index + MENU_ORDER.length) % MENU_ORDER.length]!;
    topButtons.current.get(id)?.focus();
  };

  // ── 键盘导航：菜单项 ──
  const onItemKeyDown = (
    e: ReactKeyboardEvent<HTMLButtonElement>,
    menuId: MenuId,
    item: MenuItemDef,
  ): void => {
    const menu = menus.find((m) => m.id === menuId);
    const items = (menu?.items ?? []).filter((i): i is MenuItemDef => !('separator' in i));
    const index = items.findIndex((i) => i.id === item.id);
    const focusItem = (next: number): void => {
      const target = items[(next + items.length) % items.length];
      if (target) itemButtons.current.get(`${menuId}:${target.id}`)?.focus();
    };
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem(index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        switchMenu(menuId, 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        switchMenu(menuId, -1);
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu(true);
        break;
      case 'Tab':
        // T7.4：阻断冒泡到 window 级 Tab 纯三维路由（InputController）——菜单开着时
        // Tab 只关菜单（焦点自然移出菜单体系），不切纯三维
        e.stopPropagation();
        setOpenId(null);
        break;
      default:
        break;
    }
  };

  /** 左右切换相邻菜单（菜单内 → 打开相邻并聚焦其首项） */
  const switchMenu = (menuId: MenuId, direction: 1 | -1): void => {
    const index = MENU_ORDER.indexOf(menuId);
    const next = MENU_ORDER[(index + direction + MENU_ORDER.length) % MENU_ORDER.length]!;
    setOpenId(next);
    window.setTimeout(() => {
      const popup = document.getElementById(menuPopupId(next));
      popup?.querySelector<HTMLButtonElement>('button[role^="menuitem"]')?.focus();
    }, 0);
  };

  const saving = saveState === 'saving';
  const canUndo = state.ready && state.canUndo;
  const canRedo = state.ready && state.canRedo;

  return (
    <>
      <header className="ed-menubar">
        <div className="ed-brand">
          <span className="ed-brand__mark" aria-hidden="true" />
          <span className="ed-brand__name">园区编辑器</span>
          <span className="ed-brand__tag">phase 5</span>
        </div>

        <nav className="ed-menubar__nav" aria-label="主菜单">
          {menus.map((menu) => {
            const open = openId === menu.id;
            return (
              <div className="ed-menu" key={menu.id} ref={menuAnchorRef(menu.id)}>
                <button
                  type="button"
                  ref={(el) => {
                    if (el) topButtons.current.set(menu.id, el);
                    else topButtons.current.delete(menu.id);
                  }}
                  className={`ed-menu__btn${open ? ' ed-menu__btn--open' : ''}`}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => (open ? closeMenu(false) : openMenu(menu.id))}
                  onMouseEnter={() => {
                    if (openId !== null && openId !== menu.id) {
                      onMenuOpen?.();
                      setOpenId(menu.id);
                    }
                  }}
                  onKeyDown={(e) => onTopKeyDown(e, menu.id)}
                >
                  {menu.label}
                </button>
                {open ? (
                  // T9.1：弹层 portal 至根浮层容器（逃逸 menubar 的 z10 层叠上下文——
                  // 否则被 DOM 靠后的 contextbar 盖顶约一项）；贴锚/点击外部关闭归
                  // AnchoredPopup，键盘与条目交互不变
                  <AnchoredPopup
                    anchorRef={menuAnchorRef(menu.id)}
                    placement="below-left"
                    role="menu"
                    ariaLabel={menu.label}
                    id={menuPopupId(menu.id)}
                    onOutsidePointerDown={() => setOpenId(null)}
                  >
                    {menu.items.map((entry, index) =>
                      'separator' in entry ? (
                        // key 含 index：同菜单多分隔线（file/edit）不重 key（T7.8 观察项，T8.3 清扫）
                        <div className="ed-menu__sep" key={`${menu.id}-sep-${index}`} role="separator" />
                      ) : 'submenu' in entry ? (
                        <SubmenuRow
                          key={entry.id}
                          menuId={menu.id}
                          submenu={entry}
                          onTrigger={trigger}
                          registerRef={(el) => {
                            const key = `${menu.id}:${entry.id}`;
                            if (el) itemButtons.current.set(key, el);
                            else itemButtons.current.delete(key);
                          }}
                        />
                      ) : (
                        <MenuRow
                          key={entry.id}
                          menuId={menu.id}
                          item={entry}
                          onTrigger={trigger}
                          onKeyDown={onItemKeyDown}
                          registerRef={(el) => {
                            const key = `${menu.id}:${entry.id}`;
                            if (el) itemButtons.current.set(key, el);
                            else itemButtons.current.delete(key);
                          }}
                        />
                      ),
                    )}
                  </AnchoredPopup>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="ed-menubar__spacer" />

        <div className="ed-menubar__end">
          <div className="ed-menubar__group">
            <button
              type="button"
              className="ed-btn ed-btn--ghost"
              disabled={!canUndo}
              onClick={() => onAction('edit.undo')}
              title="撤销（Ctrl+Z）"
            >
              撤销 <kbd className="ed-kbd">Ctrl Z</kbd>
            </button>
            <button
              type="button"
              className="ed-btn ed-btn--ghost"
              disabled={!canRedo}
              onClick={() => onAction('edit.redo')}
              title="重做（Ctrl+Shift+Z / Ctrl+Y）"
            >
              重做 <kbd className="ed-kbd">Ctrl ⇧ Z</kbd>
            </button>
          </div>

          <div className="ed-menubar__group">
            <button
              type="button"
              className="ed-btn ed-btn--primary"
              disabled={!state.ready || saving}
              onClick={() => onAction('file.save')}
              title="保存场景为 JSON（下载到本地）"
            >
              保存
            </button>
            <span className={`ed-savestate ed-savestate--${saveState}`} role="status">
              <span className="ed-savestate__dot" aria-hidden="true" />
              {SAVE_STATE_LABEL[saveState]}
            </span>
          </div>

          <div className="ed-menubar__group">
            {/* T7.3：布局入口解禁——LayoutMenu 弹层（四预设 / 个人布局 / 恢复默认；
                ui 本地状态，不依赖 facade ready，恒可用） */}
            <LayoutMenu />
            {/* T5.4：设置入口解禁——定位到 Inspector「全局设置」标签（面板隐藏时恢复显示） */}
            <button
              type="button"
              className="ed-btn ed-btn--ghost"
              disabled={!state.ready}
              onClick={() => onAction('file.scene-settings')}
              title="打开全局设置"
            >
              设置
            </button>
          </div>
        </div>
      </header>

      {helpDialog !== null ? (
        <HelpOverlay which={helpDialog} onClose={onHelpClose} />
      ) : null}
    </>
  );
}

/** 弹层 DOM id（键盘展开后聚焦首项用） */
function menuPopupId(menuId: MenuId): string {
  return `ed-menu-popup-${menuId}`;
}

/** 单个菜单项行（可点/禁用/勾选/键帽）；禁用用 aria-disabled 保留键盘可聚焦 */
function MenuRow({
  menuId,
  item,
  onTrigger,
  onKeyDown,
  registerRef,
}: {
  menuId: MenuId;
  item: MenuItemDef;
  onTrigger: (menuId: MenuId, item: MenuItemDef) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>, menuId: MenuId, item: MenuItemDef) => void;
  registerRef: (el: HTMLButtonElement | null) => void;
}) {
  const checkable = item.checked !== undefined;
  const role = checkable ? 'menuitemcheckbox' : 'menuitem';
  const cls = [
    'ed-menu__item',
    item.enabled ? '' : ' ed-menu__item--disabled',
    item.danger && item.enabled ? ' ed-menu__item--danger' : '',
    checkable ? ' ed-menu__item--check' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      role={role}
      aria-checked={checkable ? Boolean(item.checked) : undefined}
      aria-disabled={!item.enabled}
      className={cls}
      title={item.enabled ? undefined : '后续版本提供'}
      tabIndex={-1}
      ref={registerRef}
      onClick={() => {
        if (item.enabled) onTrigger(menuId, item);
      }}
      onKeyDown={(e) => onKeyDown(e, menuId, item)}
    >
      <span className="ed-menu__check" aria-hidden="true">
        {item.checked ? '✓' : ''}
      </span>
      <span className="ed-menu__label">{item.label}</span>
      {item.shortcut ? <kbd className="ed-kbd">{item.shortcut}</kbd> : null}
    </button>
  );
}

/**
 * 子菜单行（T7.1「视图 → 工作模式」）：父项 hover/→ 键展开子弹层，Esc/← 收起并回焦
 * 父项；子项为常规菜单项（触发走统一 trigger——关闭整棵菜单并发 actionId）。
 * T8.2：items 放宽为 MenuEntry[]——separator 分区渲染（不可聚焦不占键盘索引）；
 * 嵌套子菜单递归渲染（当前无嵌套用例，类型完备性支持）。
 */
function SubmenuRow({
  menuId,
  submenu,
  onTrigger,
  registerRef,
}: {
  menuId: MenuId;
  submenu: MenuSubmenuDef;
  onTrigger: (menuId: MenuId, item: MenuItemDef) => void;
  registerRef: (el: HTMLButtonElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const parentRef = useRef<HTMLButtonElement | null>(null);
  /** 子弹层锚（.ed-menu__item-wrap；T9.1 portal 后贴此锚定位） */
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const childButtons = useRef(new Map<string, HTMLButtonElement>());

  /** 可聚焦子项 id 序（separator 不聚焦不占位；键盘 ↑↓ 循环只在可点项间流转） */
  const focusableIds = submenu.items
    .filter((entry): entry is MenuItemDef | MenuSubmenuDef => !('separator' in entry))
    .map((entry) => entry.id);

  const focusChild = (index: number): void => {
    if (focusableIds.length === 0) return;
    const id = focusableIds[(index + focusableIds.length) % focusableIds.length];
    if (id) childButtons.current.get(id)?.focus();
  };

  const registerChild = (id: string, el: HTMLButtonElement | null): void => {
    if (el) childButtons.current.set(id, el);
    else childButtons.current.delete(id);
  };

  const onParentKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'ArrowRight' && submenu.enabled) {
      e.preventDefault();
      e.stopPropagation(); // 不外溢到父菜单的「切换相邻菜单」语义
      setOpen(true);
      window.setTimeout(() => focusChild(0), 0);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  const onChildKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, focusIndex: number): void => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        focusChild(focusIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        focusChild(focusIndex - 1);
        break;
      case 'ArrowLeft':
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        parentRef.current?.focus();
        break;
      case 'Tab':
        // T7.4：同 onItemKeyDown——阻断冒泡到 window 级 Tab 纯三维路由，只收子菜单
        e.stopPropagation();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="ed-menu__item-wrap" ref={wrapRef}>
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-disabled={!submenu.enabled}
        className={`ed-menu__item ed-menu__item--parent${submenu.enabled ? '' : ' ed-menu__item--disabled'}`}
        tabIndex={-1}
        ref={(el) => {
          parentRef.current = el;
          registerRef(el);
        }}
        onClick={() => submenu.enabled && setOpen((value) => !value)}
        onMouseEnter={() => submenu.enabled && setOpen(true)}
        onKeyDown={onParentKeyDown}
      >
        <span className="ed-menu__check" aria-hidden="true" />
        <span className="ed-menu__label">{submenu.label}</span>
        <span className="ed-menu__caret" aria-hidden="true">
          ▸
        </span>
      </button>
      {open && submenu.enabled ? (
        // T9.1：子弹层独立 portal——不再被父弹层 max-height:70vh/overflow-y:auto
        // 滚动容器裁剪/挤出滚动条（锚右缘外 4px、顶上移 4px 抵消 padding，语义同前）
        <AnchoredPopup
          anchorRef={wrapRef}
          placement="submenu-right"
          role="menu"
          ariaLabel={submenu.label}
          className="ed-menu__sub"
        >
          {submenu.items.map((entry, index) =>
            'separator' in entry ? (
              <div className="ed-menu__sep" role="separator" key={`${submenu.id}-sep-${index}`} />
            ) : 'submenu' in entry ? (
              <SubmenuRow
                key={entry.id}
                menuId={menuId}
                submenu={entry}
                onTrigger={onTrigger}
                registerRef={(el) => registerChild(entry.id, el)}
              />
            ) : (
              <MenuRow
                key={entry.id}
                menuId={menuId}
                item={entry}
                onTrigger={onTrigger}
                onKeyDown={(e) => onChildKeyDown(e, focusableIds.indexOf(entry.id))}
                registerRef={(el) => registerChild(entry.id, el)}
              />
            ),
          )}
        </AnchoredPopup>
      ) : null}
    </div>
  );
}

/** 帮助弹层（快捷键静态表 / 关于）——scrim 点击与 Esc 关闭 */
function HelpOverlay({ which, onClose }: { which: Exclude<HelpDialog, null>; onClose: () => void }) {
  const title = which === 'shortcuts' ? '快捷键' : '关于';
  return (
    <>
      <div className="ed-dialog__scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="ed-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ed-dialog-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
          }
        }}
      >
        <div className="ed-dialog__head">
          <span className="ed-dialog__title" id="ed-dialog-title">
            {title}
          </span>
          <button type="button" className="ed-btn ed-btn--ghost" onClick={onClose} autoFocus>
            关闭
          </button>
        </div>
        <div className="ed-dialog__body">
          {which === 'shortcuts' ? (
            <div className="ed-shortcuts">
              {SHORTCUT_GROUP_ORDER.map((group) => {
                const entries = SHORTCUT_HELP.filter((e) => e.group === group);
                if (entries.length === 0) return null;
                return (
                  <div className="ed-shortcuts__group" key={group}>
                    <div className="ed-shortcuts__group-title">{group}</div>
                    {entries.map((entry) => (
                      <div className="ed-shortcuts__row" key={`${entry.group}-${entry.label}`}>
                        <span className="ed-shortcuts__label">{entry.label}</span>
                        <kbd className="ed-kbd">{entry.keys}</kbd>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ed-about">
              <div className="ed-about__name">{ABOUT_INFO.product}</div>
              <dl className="ed-about__facts">
                <div className="ed-field">
                  <span className="ed-field__label">版本</span>
                  <span className="ed-readout">{ABOUT_INFO.version}</span>
                </div>
                <div className="ed-field">
                  <span className="ed-field__label">技术栈</span>
                  <span className="ed-readout">{ABOUT_INFO.stack}</span>
                </div>
              </dl>
              <p className="ed-about__desc">{ABOUT_INFO.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
