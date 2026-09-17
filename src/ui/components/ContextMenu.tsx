/**
 * ui/components/ContextMenu —— 右键上下文菜单呈现（T5.8）。
 *
 * 职责：消费 store.contextMenu（四类目标，右键点按/大纲行/资产卡片写入），经
 *      buildContextMenu 纯模型构建条目树后呈现：
 *   - 定位：fixed 挂载于 (x, y)（client CSS 像素），越界翻转/收边（视口右/下缘内收）；
 *   - 子菜单：hover / → 展开（右缘翻转），← 收起回到父项；
 *   - 键盘：↑↓ 循环（含子菜单层级内）、Enter/Space 触发、Esc 关闭（preventDefault——
 *     不外溢到全局 ESC 退出手势）、Tab 关闭；
 *   - 点击外部关闭（document pointerdown，沿 MenuBar 模式）；
 *   - 无障碍：role="menu"/"menuitem(checkbox)"、aria-haspopup、aria-disabled；
 *     danger 项 --danger 着色；禁用项可见不隐藏（需求 §39）。
 * 边界：纯呈现 + 键盘/指针交互；动作派发只经 onAction(item)（(id, arg) 为派发单元），
 *      路由归 App 层（通用 id 走 actions.dispatch，ctx.* 走上下文处理器）。
 *      弹层原语复用 .ed-menu__popup/__item（DESIGN.md §5.9 通用下拉原语）。
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { ContextMenuEntry, ContextMenuItemDef } from '../menus/contextMenus';
import { buildContextMenu, isContextMenuItem } from '../menus/contextMenus';
import type { ContextMenuState } from '../menus/contextMenus';
import { useEditorStore } from '../store';

/** 条目唯一键（id:arg——参数化子项复用父 id，arg 区分） */
function entryKey(item: ContextMenuItemDef): string {
  return item.arg !== undefined ? `${item.id}:${item.arg}` : item.id;
}

export interface ContextMenuProps {
  /** 菜单状态输入（App 汇总各 store / 门面） */
  state: ContextMenuState;
  /** 唯一出口：条目派发（含子项）；组件负责先关闭菜单 */
  onAction: (item: ContextMenuItemDef) => void;
}

export function ContextMenu({ state, onAction }: ContextMenuProps) {
  const target = useEditorStore((s) => s.contextMenu);
  const close = useEditorStore((s) => s.closeContextMenu);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  /** 展开中的子菜单（父条目 entryKey）；子弹层位置（相对视口，右缘翻转） */
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [subPos, setSubPos] = useState<{ left: number; top: number } | null>(null);

  // 目标变化 → 复位定位与子菜单，聚焦首个可聚焦项
  const targetKey = target ? `${target.source}:${'objectId' in target ? target.objectId : 'assetId' in target ? target.assetId : ''}:${target.x},${target.y}` : null;
  useEffect(() => {
    if (!target) return;
    setPos(null);
    setOpenSub(null);
    setSubPos(null);
    // 注意：不在此处 clear itemRefs——effect 在 commit 之后运行，此时新条目 ref 已
    // 注册，clear 会误清；卸载条目的引用经 registerRef(null) 自然移除，残留键查无元素安全。
    // 等待弹层挂载后聚焦首项（键盘可达入口）
    const timer = window.setTimeout(() => {
      const first = rootRef.current?.querySelector<HTMLButtonElement>('.ed-context__item:not(.ed-menu__item--disabled)');
      first?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  // 点击外部关闭（沿 MenuBar 模式）
  useEffect(() => {
    if (!target) return;
    const onDocPointerDown = (e: Event): void => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [target, close]);

  const menu = target ? buildContextMenu(target.source, state) : null;
  const items = (menu?.entries ?? []).filter((e): e is ContextMenuItemDef => !('separator' in e));
  const parent = openSub !== null ? items.find((i) => entryKey(i) === openSub) : undefined;
  /** 子层全量条目（T8.4 渲染模式子菜单含常规/诊断分组 separator——呈现用）；键盘导航用可聚焦子集 */
  const subEntries: ContextMenuEntry[] = parent?.children ?? [];
  const subItems = subEntries.filter(isContextMenuItem);

  // 根弹层越界翻转（右/下缘内收 8px，最小 8px）。等值收敛守卫：menu 为每渲染新对象，
  // 直接入依赖会「setPos 新对象 → 重渲染 → 效应再跑」死循环；等值复用 prev 引用打断。
  useLayoutEffect(() => {
    if (!target || !rootRef.current) return;
    const el = rootRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = target.x + rect.width > vw - 8 ? Math.max(8, vw - rect.width - 8) : target.x;
    const top = target.y + rect.height > vh - 8 ? Math.max(8, vh - rect.height - 8) : target.y;
    setPos((prev) => (prev && prev.left === left && prev.top === top ? prev : { left, top }));
  }, [target, menu]);

  // 子菜单定位：父项右侧展开，右缘越界翻到左侧；下缘内收。弹层常驻渲染
  // （subPos 未算出前离屏 + 隐藏，保证本效应可测量），等值收敛同上。
  useLayoutEffect(() => {
    if (openSub === null) return;
    const parentBtn = itemRefs.current.get(openSub);
    const el = rootRef.current?.querySelector<HTMLElement>('.ed-context__sub');
    if (!parentBtn || !el) return;
    const rect = parentBtn.getBoundingClientRect();
    const subRect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = rect.right + subRect.width > vw - 8 ? Math.max(8, rect.left - subRect.width - 2) : rect.right + 2;
    const top = rect.top + subRect.height > vh - 8 ? Math.max(8, vh - subRect.height - 8) : rect.top - 4;
    setSubPos((prev) => (prev && prev.left === left && prev.top === top ? prev : { left, top }));
  }, [openSub, subItems.length]);

  /** 触发条目：先派发 (id, arg) 再关闭——App 侧上下文处理器读取 store.contextMenu
   *  目标（assetId/objectId），close() 会同步置空目标，先关后发会让处理器读到 null */
  const trigger = useCallback(
    (item: ContextMenuItemDef) => {
      onAction(item);
      close();
    },
    [close, onAction],
  );

  /** 在给定清单内循环聚焦（offset ±1，环绕；禁用项保持可聚焦——aria-disabled 模式，沿 MenuBar 先例） */
  const focusIn = (list: ContextMenuItemDef[], from: string, delta: 1 | -1): void => {
    const keys = list.map(entryKey);
    const index = keys.indexOf(from);
    if (index === -1) return;
    const next = keys[(index + delta + keys.length) % keys.length]!;
    itemRefs.current.get(next)?.focus();
  };

  /** 条目键盘导航（根/子层共用；level 区分循环范围） */
  const onItemKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, item: ContextMenuItemDef, level: 'root' | 'sub'): void => {
    const list = level === 'root' ? items : subItems;
    const inSub = level === 'sub';
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusIn(list, entryKey(item), 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusIn(list, entryKey(item), -1);
        break;
      case 'ArrowRight':
        if (item.children?.length) {
          e.preventDefault();
          setOpenSub(entryKey(item));
          window.setTimeout(() => {
            const first = rootRef.current?.querySelector<HTMLButtonElement>('.ed-context__sub .ed-context__item');
            first?.focus();
          }, 0);
        }
        break;
      case 'ArrowLeft':
        if (inSub) {
          e.preventDefault();
          setOpenSub(null);
          itemRefs.current.get(openSub ?? '')?.focus();
        }
        break;
      case 'Escape':
        // 关菜单不外溢：preventDefault 使 app/input 的全局 ESC（工具退出）跳过本事件
        e.preventDefault();
        close();
        break;
      case 'Tab':
        // T7.4：阻断冒泡到 window 级 Tab 纯三维路由（InputController）——菜单开着时
        // Tab 只关菜单（与 MenuBar 两处 case 'Tab' 同型处理），不切纯三维
        e.stopPropagation();
        close();
        break;
      default:
        break;
    }
  };

  if (!target || !menu) return null;

  return (
    <div
      ref={rootRef}
      className="ed-menu__popup ed-context__popup"
      role="menu"
      aria-label="上下文菜单"
      style={pos ? { left: pos.left, top: pos.top } : { left: target.x, top: target.y, visibility: 'hidden' }}
    >
      {menu.entries.map((entry, index) =>
        'separator' in entry ? (
          <div className="ed-menu__sep" key={`sep-${index}`} role="separator" />
        ) : (
          <MenuRow
            key={entryKey(entry)}
            item={entry}
            submenuOpen={openSub === entryKey(entry)}
            registerRef={(el) => {
              if (el) itemRefs.current.set(entryKey(entry), el);
              else itemRefs.current.delete(entryKey(entry));
            }}
            onTrigger={trigger}
            onOpenSub={() => {
              setOpenSub(entryKey(entry));
              window.setTimeout(() => {
                const first = rootRef.current?.querySelector<HTMLButtonElement>('.ed-context__sub .ed-context__item');
                first?.focus();
              }, 0);
            }}
            onKeyDown={(e) => onItemKeyDown(e, entry, 'root')}
            onHover={(hasChildren) => {
              // 根层 hover：父项开子菜单，普通项收子菜单（标准菜单行为）
              if (hasChildren) {
                if (openSub !== entryKey(entry)) setOpenSub(entryKey(entry));
              } else if (openSub !== null) {
                setOpenSub(null);
              }
            }}
          />
        ),
      )}
      {parent && subEntries.length > 0 ? (
        <div
          className="ed-menu__popup ed-context__popup ed-context__sub"
          role="menu"
          aria-label={parent.label}
          style={
            subPos
              ? { left: subPos.left, top: subPos.top }
              : { left: -9999, top: -9999, visibility: 'hidden' } // 测量期离屏占位（可布局不可见）
          }
        >
          {subEntries.map((child, index) =>
            'separator' in child ? (
              <div className="ed-menu__sep" key={`sub-sep-${index}`} role="separator" />
            ) : (
              <MenuRow
                key={entryKey(child)}
                item={child}
                submenuOpen={false}
                registerRef={(el) => {
                  if (el) itemRefs.current.set(entryKey(child), el);
                  else itemRefs.current.delete(entryKey(child));
                }}
                onTrigger={trigger}
                onKeyDown={(e) => onItemKeyDown(e, child, 'sub')}
                onHover={() => undefined}
              />
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

/** 单个菜单项行（复用 .ed-menu__item 原语；子菜单父项带 ▸ 指示） */
function MenuRow({
  item,
  submenuOpen,
  onTrigger,
  onOpenSub,
  onKeyDown,
  onHover,
  registerRef,
}: {
  item: ContextMenuItemDef;
  submenuOpen: boolean;
  onTrigger: (item: ContextMenuItemDef) => void;
  /** 父项展开子菜单（→ 键与点击共用；触屏无 hover 的兜底） */
  onOpenSub?: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onHover: (hasChildren: boolean) => void;
  registerRef: (el: HTMLButtonElement | null) => void;
}) {
  const checkable = item.checked !== undefined;
  const role = checkable ? 'menuitemcheckbox' : 'menuitem';
  const hasChildren = (item.children?.length ?? 0) > 0;
  const cls = [
    'ed-menu__item',
    'ed-context__item',
    item.enabled ? '' : ' ed-menu__item--disabled',
    item.danger && item.enabled ? ' ed-menu__item--danger' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      role={role}
      aria-checked={checkable ? Boolean(item.checked) : undefined}
      aria-disabled={!item.enabled}
      aria-haspopup={hasChildren ? 'menu' : undefined}
      aria-expanded={hasChildren ? submenuOpen : undefined}
      className={cls}
      title={item.enabled ? undefined : '后续版本提供'}
      tabIndex={-1}
      ref={registerRef}
      onMouseEnter={() => onHover(hasChildren)}
      onClick={() => {
        if (!item.enabled) return;
        if (hasChildren) {
          onOpenSub?.();
          return;
        }
        onTrigger(item);
      }}
      onKeyDown={onKeyDown}
    >
      <span className="ed-menu__check" aria-hidden="true">
        {item.checked ? '✓' : ''}
      </span>
      <span className="ed-menu__label">{item.label}</span>
      {item.shortcut ? <kbd className="ed-kbd">{item.shortcut}</kbd> : null}
      {hasChildren ? (
        <span className="ed-context__expand" aria-hidden="true">
          ▸
        </span>
      ) : null}
    </button>
  );
}
