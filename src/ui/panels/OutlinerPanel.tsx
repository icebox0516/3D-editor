/**
 * ui/panels/OutlinerPanel —— Scene Outliner 双标签面板（T5.3；T6.7 语义分组翻转；
 * T8.5 场景大纲升级层级树 + 拖拽调整层级）。
 *
 * 职责：左面板「场景大纲 + 图层管理」共用容器（需求 8.2）——
 *   场景大纲（T8.5 起双视图切换，层级树为默认）：
 *     层级树视图（T8.5）：parentId 真实层级（组壳可折叠/成员缩进/组行直接成员计数；
 *     拖拽调整层级——行上/下区 1px 插入线排序、组行体高亮挂入、根区上提根级，
 *     非法落点禁止态 + 环拒绝 toast；拖拽 hover 折叠组 800ms 自动展开；
 *     组行双击/右键「选中组内对象」= 仅选成员不选壳；单击组行 = 选壳（多选语义）；
 *     组行不提供 visible/locked 开关（组为纯组织节点，可见性走图层体系））；
 *     分类视图（T5.3 既有，并列保留）：region 对象按语义类型虚分组（组序/命名对齐
 *     domain/regions/semanticDefinitions——单一真相源；模型对象归「模型」组，其余落
 *     「未分层」；组壳不入分类视图），组行（展开折叠 / 全组选中 / 组级显隐·锁定 =
 *     状态不一致成员逐对象 UpdateObjectCommand 经 BatchCommand 合一条历史）+
 *     对象行（单选 / Ctrl 加选 / Shift 范围选（T7.5 起跨组连续）/ 双击·F2 行内重命名 /
 *     hover 浮显 eye·lock·定位）；
 *     顶部工具：搜索 + 类型筛选 + 筛选激活时「选中全部结果」图标钮（T7.5）+
 *     展开/收起全部 + 创建对象下拉（toolIA 的 SHAPE_CREATE_ENTRIES/enterDraw 直连
 *     绘制工具）+ 更多（P1 占位禁用）；搜索激活时命中路径自动展开；空场景显示引导文案。
 *   图层管理：自 LayerPanel 等价迁入（显隐/锁定/透明度松手提交/双击重命名/
 *     拖拽排序 BatchCommand 合一条历史/成员计数）+ 新建图层 + 删除图层
 *     （行内两步确认；非空删除成员 layerId 置 null 落「未分层」，契约语义）+
 *     合并图层（T8.3：源行「合并」钮 → 目标选择行内条（排除源自身，真实图层
 *     清单）→ MergeLayerCommand 成员迁移+删源一条可撤销历史）。
 * 边界：数据按 sceneVersion 从门面重读（SceneManager 唯一数据源）；一切可见修改
 *   经 Command（新建/删除图层为 SceneManager 专用路径，不可撤销——任务书授权）；
 *   定位经 store 注入的相机 Port（非数据操作）；锁定行不可选不可拖（与 SelectTool
 *   同源，亦不开右键菜单——解锁走行内 LockIcon）；行右键 → 四类上下文菜单之一
 *   （T5.8：重命名/复制/删除/隐藏/锁定/聚焦/移动至图层；T8.5 增分组段与组行
 *   「选中组内对象」，菜单模型在 ui/menus/contextMenus）；
 *   ui 层零 runtime/io 依赖；一切拖拽层级修改经 ReparentCommand（T8.5）。
 *   T6.7：ElementRegistry label 注入路径移除，组名以语义定义为准（T6.9 注册表本体已删除）。
 */
import { useEffect, useRef, useState } from 'react';
import type { Dispatch, DragEvent, KeyboardEvent, MouseEvent, SetStateAction } from 'react';
import { Combine, ListChecks } from 'lucide-react';
import { createId } from '../../core/id';
import type { ID } from '../../core/types';
import type { Layer } from '../../scene/Layer';
import type { SceneObject } from '../../scene/SceneObject';
import { isGroupObject } from '../../scene/GroupObject';
import type { EditorFacade } from '../../editor/EditorFacade';
import { BatchCommand } from '../../editor/commands/BatchCommand';
import { MergeLayerCommand } from '../../editor/commands/MergeLayerCommand';
import { UpdateLayerCommand } from '../../editor/commands/UpdateLayerCommand';
import { UpdateObjectCommand } from '../../editor/commands/UpdateObjectCommand';
import { PanelFrame } from '../components/PanelFrame';
import { TabStrip } from '../components/TabStrip';
import { AnchoredPopup } from '../components/AnchoredPopup';
import { EyeIcon, FocusIcon, IconToggle, LockIcon } from '../components/IconToggle';
import { pushToast } from '../feedback/toastStore';
import { SHAPE_CREATE_ENTRIES, toggleShapeDraw } from '../tools/toolIA';
import type { ShapeType } from '../../domain/regions';
import { useEditorStore } from '../store';
import {
  buildGroupToggleCommand,
  buildOutlinerTree,
  collapseAllGroups,
  describeOutlinerEmpty,
  expandAllGroups,
  filterOutlinerTree,
  resolveGroupExpanded,
  toggleGroupExpanded,
  typeFilterOptions,
} from './outlinerModel';
import type { ExpandState, OutlinerGroup } from './outlinerModel';
import {
  buildHierarchyRows,
  buildReparentCommand,
  evaluateDrop,
  hierarchyFilterIds,
  hierarchyTypeFilterOptions,
  isNodeExpanded,
  resolveDropZone,
  selectGroupMemberIds,
  toggleNodeExpanded,
} from './hierarchyModel';
import type {
  DropRejectReason,
  DropTargetPayload,
  HierarchyExpandState,
  HierarchyRow as HierarchyRowData,
} from './hierarchyModel';

/** 面板标签（T5.4 TabStrip 复用同一形态） */
const TABS = [
  { id: 'outline', label: '场景大纲' },
  { id: 'layers', label: '图层管理' },
] as const;

/** 创建下拉弹层 DOM id（键盘展开后聚焦首项；portal 后按 id 全局取，沿 MenuBar 先例） */
const CREATE_POPUP_ID = 'ed-outliner-create-popup';

type OutlinerTabId = (typeof TABS)[number]['id'];

interface OutlinerPanelProps {
  /** 隐藏所在面板组（左列整组收起；恢复经上下文条开关）。由装配层注入 */
  onHideZone?: () => void;
}

export function OutlinerPanel({ onHideZone }: OutlinerPanelProps) {
  const facade = useEditorStore((s) => s.facade);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  const [tab, setTab] = useState<OutlinerTabId>('outline');

  if (!facade) {
    return (
      <PanelFrame sectionKey="left.outliner" title="大纲" className="ed-panel--fill" onHide={onHideZone}>
        <div className="ed-panel__body" />
      </PanelFrame>
    );
  }

  void sceneVersion; // 订阅版本号：场景/图层变更时标签页各自重读
  const objectCount = facade.scene.getObjects().length;
  const layerCount = facade.scene.getLayers().length;

  return (
    <PanelFrame
      sectionKey="left.outliner"
      title="大纲"
      className="ed-panel--fill"
      titleExtra={
        <span className="ed-readout">{tab === 'outline' ? objectCount : layerCount}</span>
      }
      onHide={onHideZone}
    >
      <TabStrip
        tabs={TABS}
        activeId={tab}
        onChange={(id) => setTab(id as OutlinerTabId)}
        ariaLabel="左面板视图"
      />
      {tab === 'outline' ? <OutlineTab facade={facade} /> : <LayersTab facade={facade} />}
    </PanelFrame>
  );
}

// ── 场景大纲标签 ────────────────────────────────────────────

/** 对象锁定判定（与 SelectTool 同源：对象 locked ∨ 所属图层 locked） */
function isLockedRow(obj: SceneObject, layers: readonly Layer[]): boolean {
  if (obj.locked) return true;
  if (obj.layerId === null) return false;
  return layers.find((l) => l.id === obj.layerId)?.locked === true;
}

/** 场景大纲内容视图（T8.5：层级树为默认，分类虚分组并列保留） */
type OutlineViewId = 'tree' | 'category';

/** 拖拽 hover 折叠组的自动展开延时（毫秒；树形 dnd 惯例，任务书 800ms） */
export const TREE_HOVER_EXPAND_MS = 800;

/** 非法落点 toast 文案（环拒绝提示；与 hierarchyModel.DropRejectReason 同源） */
const DROP_REJECT_MESSAGES: Record<DropRejectReason, string> = {
  self: '不能把对象拖到它自身',
  cycle: '不能把对象拖入它自己的后代（会形成环）',
  'into-non-group': '只有分组节点可以被挂入对象',
  'missing-drag': '拖拽源对象已不存在',
  'missing-target': '放置目标已不存在',
};

/** 筛选谓词：名称模糊（不区分大小写）∧ 类型匹配（all = 不过滤） */
function matchesOutlineFilter(obj: SceneObject, query: string, typeFilter: string): boolean {
  const q = query.trim().toLowerCase();
  if (q !== '' && !obj.name.toLowerCase().includes(q)) return false;
  if (typeFilter !== 'all' && obj.type !== typeFilter) return false;
  return true;
}

function OutlineTab({ facade }: { facade: EditorFacade }) {
  const camera = useEditorStore((s) => s.camera);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);

  const [view, setView] = useState<OutlineViewId>('tree');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  /** 分类视图：语义虚分组折叠集（T5.3 既有语义） */
  const [collapsedGroups, setCollapsedGroups] = useState<ExpandState>(() => new Set());
  /** 层级树视图：折叠节点 id 集（缺省全展开，T8.5） */
  const [collapsedNodes, setCollapsedNodes] = useState<HierarchyExpandState>(() => new Set());
  /** Shift 范围选择锚点（最近一次非 Shift 点选的对象 id；两视图共用） */
  const anchorRef = useRef<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const createRootRef = useRef<HTMLDivElement | null>(null);
  const createButtonRef = useRef<HTMLButtonElement | null>(null);

  void sceneVersion; // 订阅版本号：场景变更时重读
  const layers = facade.scene.getLayers();
  const objects = facade.scene.getObjects();
  const lockedIds = new Set(objects.filter((o) => isLockedRow(o, layers)).map((o) => o.id));

  const searchActive = query.trim() !== '';
  const filterActive = searchActive || typeFilter !== 'all';

  // ── 层级树视图数据派生（T8.5）──
  const visibleIds = filterActive
    ? hierarchyFilterIds(objects, (o) => matchesOutlineFilter(o, query, typeFilter))
    : null;
  const treeRows = buildHierarchyRows(
    objects,
    filterActive ? new Set<ID>() : collapsedNodes, // 筛选激活时强制展开命中路径
    visibleIds,
  );
  const selectableTreeResults = treeRows
    .filter((row) => !lockedIds.has(row.obj.id))
    .map((row) => row.obj.id);
  const treeEmpty = describeOutlinerEmpty(objects.length, treeRows.length, query);
  const treeFilterOptions = hierarchyTypeFilterOptions(objects);

  // ── 分类视图数据派生（T5.3 既有；组壳不入分类视图）──
  const contentObjects = objects.filter((o) => !isGroupObject(o));
  const fullTree = buildOutlinerTree(contentObjects);
  const tree = filterOutlinerTree(fullTree, { search: query, typeFilter });
  const filterOptions = typeFilterOptions(fullTree);
  const empty = describeOutlinerEmpty(contentObjects.length, tree.length, query);
  const selectableResults = filterActive
    ? tree.flatMap((g) => g.objects).filter((o) => !lockedIds.has(o.id))
    : [];
  /** 分类视图可见行 id 序（Shift 范围选基线，T7.5 跨组连续） */
  const categoryVisibleIds = tree.flatMap((g) => g.objects.map((o) => o.id));

  /** 组级显隐/锁定：状态不一致成员逐对象命令合一条历史（分类视图既有） */
  const toggleGroupField = (group: OutlinerGroup, field: 'visible' | 'locked') => {
    const cmd = buildGroupToggleCommand(group.objects, field);
    if (cmd) facade.history.execute(cmd);
  };

  /** 点击组行标签 = 选中全组成员（锁定成员跳过，与行点选同源） */
  const selectGroup = (group: OutlinerGroup) => {
    const ids = group.objects.filter((o) => !lockedIds.has(o.id)).map((o) => o.id);
    if (ids.length > 0) facade.selection.selectMany(ids);
  };

  /** 选中全部当前过滤结果（T7.5：筛选行内「选中全部结果」操作；两视图各自结果集） */
  const selectAllResults = () => {
    const ids = view === 'tree' ? selectableTreeResults : selectableResults.map((o) => o.id);
    if (ids.length > 0) facade.selection.selectMany(ids);
  };
  const activeResultCount = view === 'tree' ? selectableTreeResults.length : selectableResults.length;

  /** 行点选（两视图共用）：Shift 范围选（可见行序闭区间）；Ctrl/Cmd 加选切换；否则单选并记锚点 */
  const pickRow = (
    obj: SceneObject,
    e: Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'>,
    visibleIds: readonly ID[] | null,
  ) => {
    if (lockedIds.has(obj.id)) return;
    if (e.shiftKey) {
      const anchor = anchorRef.current;
      if (anchor !== null && visibleIds !== null) {
        const anchorIndex = visibleIds.indexOf(anchor);
        const focusIndex = visibleIds.indexOf(obj.id);
        if (anchorIndex >= 0 && focusIndex >= 0) {
          const from = Math.min(anchorIndex, focusIndex);
          const to = Math.max(anchorIndex, focusIndex);
          facade.selection.selectMany(
            visibleIds.slice(from, to + 1).filter((id) => !lockedIds.has(id)),
          );
          return;
        }
      }
      facade.selection.select(obj.id); // 无锚点 / 锚点不在当前结果：退化为单选
      anchorRef.current = obj.id;
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (facade.selection.isSelected(obj.id)) facade.selection.remove(obj.id);
      else facade.selection.add(obj.id);
      return;
    }
    facade.selection.select(obj.id);
    anchorRef.current = obj.id;
  };

  /** 行右键 → 上下文菜单（T5.8）：未选中先单选归一（菜单动作作用于选中集）；
   *  锁定行不开菜单（与锁定不可选同源，解锁走行内 LockIcon） */
  const openRowMenu = (obj: SceneObject, e: MouseEvent): void => {
    if (lockedIds.has(obj.id)) return;
    if (!facade.selection.isSelected(obj.id)) facade.selection.select(obj.id);
    useEditorStore
      .getState()
      .openContextMenu({ source: 'outliner-row', x: e.clientX, y: e.clientY, objectId: obj.id });
  };

  /** 创建对象下拉项 = 七形状新流程入口（T6.5；toolIA SHAPE_CREATE_ENTRIES 同源） */
  const createEntries = SHAPE_CREATE_ENTRIES;

  /** 进入对应形状绘制工具（toolIA 共享入口：激活 + drawTarget 记账） */
  const startCreate = (shapeType: ShapeType) => {
    toggleShapeDraw(facade.tools, shapeType);
    setCreateOpen(false);
    createButtonRef.current?.focus();
  };

  const onCreateKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setCreateOpen(true);
      window.setTimeout(() => {
        // T9.1：弹层 portal 至根浮层容器后不在 createRootRef 子树内——按 id 全局取
        const first = document
          .getElementById(CREATE_POPUP_ID)
          ?.querySelector<HTMLButtonElement>('[role="menuitem"]');
        first?.focus();
      }, 0);
    } else if (e.key === 'Escape' && createOpen) {
      setCreateOpen(false);
    }
  };

  const onMenuItemKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'Escape') {
      setCreateOpen(false);
      createButtonRef.current?.focus();
    }
  };

  const viewEmpty = view === 'tree' ? treeEmpty : empty;

  return (
    <div className="ed-outliner">
      <div className="ed-outliner__toolbar">
        <div className="ed-outliner__seek">
          <input
            className="ed-input ed-outliner__search"
            type="search"
            value={query}
            placeholder="搜索对象名称"
            aria-label="搜索场景对象"
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="ed-input ed-select ed-outliner__type"
            value={typeFilter}
            aria-label="按类型筛选"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {(view === 'tree' ? treeFilterOptions : filterOptions).map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}（{opt.count}）
              </option>
            ))}
          </select>
          {filterActive ? (
            <button
              type="button"
              className="ed-outliner__select-all"
              aria-label={`选中全部结果（${activeResultCount} 个对象）`}
              title={`选中当前筛选/搜索的全部结果（${activeResultCount} 个，锁定对象跳过）`}
              disabled={activeResultCount === 0}
              onClick={selectAllResults}
            >
              <ListChecks size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="ed-outliner__tools">
          {/* 视图切换（T8.5）：层级树（真实 parentId 分组）↔ 分类（语义虚分组） */}
          <div className="ed-outliner__view-switch" role="group" aria-label="大纲视图">
            <button
              type="button"
              className={`ed-btn ed-btn--ghost${view === 'tree' ? ' ed-btn--ghost-active' : ''}`}
              aria-pressed={view === 'tree'}
              title="层级树视图（分组层级 + 拖拽排序）"
              onClick={() => setView('tree')}
            >
              层级
            </button>
            <button
              type="button"
              className={`ed-btn ed-btn--ghost${view === 'category' ? ' ed-btn--ghost-active' : ''}`}
              aria-pressed={view === 'category'}
              title="分类视图（按业务类型虚分组）"
              onClick={() => setView('category')}
            >
              分类
            </button>
          </div>
          <button
            type="button"
            className="ed-btn ed-btn--ghost"
            title="展开全部分组"
            onClick={() =>
              view === 'tree'
                ? setCollapsedNodes(new Set())
                : setCollapsedGroups(expandAllGroups())
            }
          >
            展开
          </button>
          <button
            type="button"
            className="ed-btn ed-btn--ghost"
            title="收起全部分组"
            onClick={() =>
              view === 'tree'
                ? setCollapsedNodes(new Set(objects.filter(isGroupObject).map((o) => o.id)))
                : setCollapsedGroups(collapseAllGroups(fullTree))
            }
          >
            收起
          </button>
          <div className="ed-outliner__spacer" />
          <div className="ed-menu ed-outliner__create" ref={createRootRef}>
            <button
              ref={createButtonRef}
              type="button"
              className={`ed-btn ed-btn--ghost${createOpen ? ' ed-outliner__create-btn--open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={createOpen}
              title="创建对象（进入绘制工具）"
              onClick={() => setCreateOpen((open) => !open)}
              onKeyDown={onCreateKeyDown}
            >
              创建 ▾
            </button>
            {createOpen ? (
              // T9.1：弹层 portal 至根浮层容器——逃逸 .ed-panel/.ed-side 的
              // overflow:hidden 垂直裁剪（右缘贴锚 + 顶贴锚底，语义不变）；
              // 点击外部关闭归 AnchoredPopup；键盘展开首项聚焦按 id 全局取
              <AnchoredPopup
                anchorRef={createRootRef}
                placement="below-right"
                role="menu"
                ariaLabel="创建对象"
                id={CREATE_POPUP_ID}
                className="ed-outliner__create-popup"
                onOutsidePointerDown={() => setCreateOpen(false)}
              >
                {createEntries.map((entry) => (
                  <button
                    key={entry.shapeType}
                    type="button"
                    className="ed-menu__item"
                    role="menuitem"
                    title={entry.hint}
                    onClick={() => startCreate(entry.shapeType)}
                    onKeyDown={onMenuItemKeyDown}
                  >
                    <span className="ed-menu__label">{entry.label}</span>
                  </button>
                ))}
              </AnchoredPopup>
            ) : null}
          </div>
          {/* P1 占位：更多操作（T5.8 行右键菜单已交付移动至图层等，此钮留 P1） */}
          <button type="button" className="ed-btn ed-btn--ghost" disabled title="更多操作（后续版本提供）">
            ⋯
          </button>
        </div>
      </div>
      {view === 'tree' ? (
        <HierarchyTreeBody
          facade={facade}
          objects={objects}
          rows={treeRows}
          lockedIds={lockedIds}
          selectedIds={selectedIds}
          collapsed={collapsedNodes}
          setCollapsed={setCollapsedNodes}
          visibleRowIds={treeRows.map((row) => row.obj.id)}
          anchorRef={anchorRef}
          pickRow={pickRow}
          openRowMenu={openRowMenu}
          camera={camera}
          empty={treeEmpty}
        />
      ) : viewEmpty.kind !== 'hidden' ? (
        <div className="ed-panel__body">
          <div className="ed-empty">
            <strong>{viewEmpty.title}</strong>
            {viewEmpty.hint}
          </div>
        </div>
      ) : (
        <div className="ed-panel__body" role="tree" aria-label="场景对象分类">
          {tree.map((group) => {
            const expanded = resolveGroupExpanded(collapsedGroups, group.key, searchActive);
            const allVisible = group.objects.every((o) => o.visible);
            const allLocked = group.objects.every((o) => o.locked);
            return (
              <div className="ed-tree__group" key={group.key}>
                <div
                  className={`ed-tree__group-row${expanded ? '' : ' ed-tree__group-row--collapsed'}`}
                  data-group-type={group.type ?? 'ungrouped'}
                >
                  <button
                    type="button"
                    className="ed-tree__group-toggle"
                    aria-expanded={expanded}
                    aria-label={`${expanded ? '收起' : '展开'}分组 ${group.label}`}
                    onClick={() => setCollapsedGroups((s) => toggleGroupExpanded(s, group.key))}
                  >
                    <span className="ed-tree__caret" aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ed-tree__group-label"
                    title={`选择 ${group.label} 全部 ${group.objects.length} 个对象（${group.layerName}）`}
                    onClick={() => selectGroup(group)}
                  >
                    {group.label}
                  </button>
                  <span className="ed-readout">{group.objects.length}</span>
                  <IconToggle
                    checked={allVisible}
                    label={`${allVisible ? '隐藏' : '显示'}分组 ${group.label} 全部对象`}
                    onChange={() => toggleGroupField(group, 'visible')}
                  >
                    <EyeIcon off={!allVisible} />
                  </IconToggle>
                  <IconToggle
                    checked={allLocked}
                    label={`${allLocked ? '解锁' : '锁定'}分组 ${group.label} 全部对象`}
                    onChange={() => toggleGroupField(group, 'locked')}
                  >
                    <LockIcon open={!allLocked} />
                  </IconToggle>
                </div>
                {expanded
                  ? group.objects.map((obj) => (
                      <TreeRow
                        key={obj.id}
                        obj={obj}
                        locked={lockedIds.has(obj.id)}
                        selected={selectedIds.includes(obj.id)}
                        onPick={(obj2, e) => pickRow(obj2, e, categoryVisibleIds)}
                        onContextMenu={(e) => openRowMenu(obj, e)}
                        onToggleVisible={() =>
                          facade.history.execute(new UpdateObjectCommand(obj.id, { visible: !obj.visible }))
                        }
                        onToggleLocked={() =>
                          facade.history.execute(new UpdateObjectCommand(obj.id, { locked: !obj.locked }))
                        }
                        onRename={(name) => facade.history.execute(new UpdateObjectCommand(obj.id, { name }))}
                        onFocus={() => camera?.focusObjects([obj.id])}
                      />
                    ))
                  : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 层级树视图（T8.5：真实 parentId 分组 + 拖拽调整层级）────────

/** 拖拽会话中的活动落点（含合法性判定结果，驱动 drop indicator 三态） */
interface ActiveDrop extends DropTargetPayload {
  valid: boolean;
  reason?: DropRejectReason;
}

interface HierarchyTreeBodyProps {
  facade: EditorFacade;
  objects: readonly SceneObject[];
  rows: readonly HierarchyRowData[];
  lockedIds: ReadonlySet<ID>;
  selectedIds: readonly ID[];
  collapsed: HierarchyExpandState;
  setCollapsed: Dispatch<SetStateAction<HierarchyExpandState>>;
  visibleRowIds: readonly ID[];
  anchorRef: { current: string | null };
  pickRow(
    obj: SceneObject,
    e: Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'>,
    visibleIds: readonly ID[] | null,
  ): void;
  openRowMenu(obj: SceneObject, e: MouseEvent): void;
  camera: { focusObjects(ids: ID[]): void } | null;
  empty: ReturnType<typeof describeOutlinerEmpty>;
}

function HierarchyTreeBody(props: HierarchyTreeBodyProps) {
  const { facade, objects, rows, lockedIds, selectedIds, collapsed, setCollapsed } = props;
  /** 拖拽源对象 id（dragstart 置位；dragend/drop 清零） */
  const [dragId, setDragId] = useState<ID | null>(null);
  /** 当前活动落点（dragover 持续更新；三态 indicator 数据源） */
  const [drop, setDrop] = useState<ActiveDrop | null>(null);
  /** 折叠组 hover 自动展开计时（目标 id + timer 句柄；拖离/换目标重置） */
  const hoverId = useRef<ID | null>(null);
  const hoverTimer = useRef<number | null>(null);

  const clearHoverTimer = (): void => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    hoverId.current = null;
  };
  useEffect(() => clearHoverTimer, []); // 卸载清理计时器

  const finishDrag = (): void => {
    setDragId(null);
    setDrop(null);
    clearHoverTimer();
  };

  /** 落点合法性求值 + 去抖更新（同落点不重复 setState） */
  const applyPayload = (payload: DropTargetPayload): void => {
    if (dragId === null) return;
    const evaluation = evaluateDrop(objects, dragId, payload);
    const next: ActiveDrop = {
      ...payload,
      valid: evaluation.valid,
      reason: evaluation.valid ? undefined : evaluation.reason,
    };
    setDrop((prev) =>
      prev !== null &&
      prev.zone === next.zone &&
      prev.targetId === next.targetId &&
      prev.valid === next.valid &&
      prev.reason === next.reason
        ? prev
        : next,
    );
  };

  /** 行内落点计算（上半/下半插入线 · 组行中段挂入） */
  const rowPayload = (row: HierarchyRowData, e: DragEvent<HTMLDivElement>): DropTargetPayload => {
    const rect = e.currentTarget.getBoundingClientRect();
    const zone = resolveDropZone(e.clientY - rect.top, rect.height, row.isGroup);
    return { zone, targetId: row.obj.id };
  };

  const commitDrop = (payload: DropTargetPayload): void => {
    if (dragId === null) return;
    const evaluation = evaluateDrop(objects, dragId, payload);
    if (!evaluation.valid) {
      // 环拒绝等非法落点提示（reason 在 valid=false 时必在——模型契约）
      pushToast('error', DROP_REJECT_MESSAGES[evaluation.reason ?? 'missing-target']);
      return;
    }
    const cmd = buildReparentCommand(objects, dragId, payload);
    if (cmd) facade.history.execute(cmd); // 一条可撤销历史（含数组顺序复原）
  };

  const onRowDragOver = (row: HierarchyRowData, e: DragEvent<HTMLDivElement>): void => {
    if (dragId === null) return;
    e.preventDefault(); // 允许落点
    e.dataTransfer.dropEffect = 'move';
    const payload = rowPayload(row, e);
    applyPayload(payload);
    // 折叠组 hover 800ms 自动展开（合法落点才算悬停目标；换目标/拖离重置计时）
    if (
      row.isGroup &&
      payload.zone === 'into' &&
      !isNodeExpanded(collapsed, row.obj.id) &&
      evaluateDrop(objects, dragId, payload).valid
    ) {
      if (hoverId.current !== row.obj.id) {
        clearHoverTimer();
        hoverId.current = row.obj.id;
        const groupId = row.obj.id;
        hoverTimer.current = window.setTimeout(() => {
          setCollapsed((s) => {
            const next = new Set(s);
            next.delete(groupId);
            return next;
          });
          clearHoverTimer();
        }, TREE_HOVER_EXPAND_MS);
      }
    } else if (hoverId.current !== null && hoverId.current !== row.obj.id) {
      clearHoverTimer();
    }
  };

  const onRowDrop = (row: HierarchyRowData, e: DragEvent<HTMLDivElement>): void => {
    if (dragId === null) return;
    e.preventDefault();
    e.stopPropagation();
    commitDrop(rowPayload(row, e));
    finishDrag();
  };

  /** 容器根区（行间隙）：上提根级 / 根级排序（子元素冒泡的 dragover 归行处理器） */
  const onBodyDragOver = (e: DragEvent<HTMLDivElement>): void => {
    if (dragId === null || e.target !== e.currentTarget) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    applyPayload({ zone: 'root', targetId: null });
  };
  const onBodyDrop = (e: DragEvent<HTMLDivElement>): void => {
    if (dragId === null || e.target !== e.currentTarget) return;
    e.preventDefault();
    commitDrop({ zone: 'root', targetId: null });
    finishDrag();
  };

  if (props.empty.kind !== 'hidden') {
    return (
      <div className="ed-panel__body">
        <div className="ed-empty">
          <strong>{props.empty.title}</strong>
          {props.empty.hint}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ed-panel__body ed-tree__hierarchy${drop !== null && drop.zone === 'root' ? ' ed-tree__hierarchy--root-drop' : ''}`}
      role="tree"
      aria-label="场景对象层级"
      onDragOver={onBodyDragOver}
      onDrop={onBodyDrop}
    >
      {rows.map((row) => (
        <HierarchyRowView
          key={row.obj.id}
          row={row}
          locked={lockedIds.has(row.obj.id)}
          selected={selectedIds.includes(row.obj.id)}
          expanded={isNodeExpanded(collapsed, row.obj.id)}
          dragging={dragId === row.obj.id}
          dropState={
            drop !== null && drop.targetId === row.obj.id
              ? { zone: drop.zone, valid: drop.valid }
              : null
          }
          onToggleExpand={() => setCollapsed((s) => toggleNodeExpanded(s, row.obj.id))}
          onPick={(e) => props.pickRow(row.obj, e, props.visibleRowIds)}
          onDoubleClickMembers={() => {
            // 组行双击 = 仅选成员不选壳（深层成员收全、嵌套组壳剔除、锁定跳过）
            const ids = selectGroupMemberIds(objects, row.obj.id).filter((id) => !lockedIds.has(id));
            if (ids.length > 0) facade.selection.selectMany(ids);
          }}
          onContextMenu={(e) => props.openRowMenu(row.obj, e)}
          onRename={(name) => facade.history.execute(new UpdateObjectCommand(row.obj.id, { name }))}
          onToggleVisible={() =>
            facade.history.execute(
              new UpdateObjectCommand(row.obj.id, { visible: !row.obj.visible }),
            )
          }
          onToggleLocked={() =>
            facade.history.execute(
              new UpdateObjectCommand(row.obj.id, { locked: !row.obj.locked }),
            )
          }
          onFocusMembers={() => {
            const ids = selectGroupMemberIds(objects, row.obj.id);
            if (ids.length > 0) props.camera?.focusObjects(ids);
          }}
          onFocusObject={() => props.camera?.focusObjects([row.obj.id])}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', row.obj.id);
            setDragId(row.obj.id);
          }}
          onDragEnd={finishDrag}
          onDragOver={(e) => onRowDragOver(row, e)}
          onDragLeave={() => {
            if (hoverId.current === row.obj.id) clearHoverTimer(); // 拖离重置展开计时
          }}
          onDrop={(e) => onRowDrop(row, e)}
        />
      ))}
    </div>
  );
}

// ── 层级树行（组行 / 成员行统一组件，T8.5）───────────────────

interface HierarchyRowViewProps {
  row: HierarchyRowData;
  locked: boolean;
  selected: boolean;
  expanded: boolean;
  dragging: boolean;
  dropState: { zone: DropTargetPayload['zone']; valid: boolean } | null;
  onToggleExpand(): void;
  onPick(e: Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'>): void;
  /** 组行双击：仅选成员；成员行双击：行内重命名（沿既有语义） */
  onDoubleClickMembers(): void;
  onContextMenu(e: MouseEvent): void;
  onRename(name: string): void;
  onToggleVisible(): void;
  onToggleLocked(): void;
  onFocusMembers(): void;
  onFocusObject(): void;
  onDragStart(e: DragEvent<HTMLDivElement>): void;
  onDragEnd(): void;
  onDragOver(e: DragEvent<HTMLDivElement>): void;
  onDragLeave(): void;
  onDrop(e: DragEvent<HTMLDivElement>): void;
}

function HierarchyRowView(props: HierarchyRowViewProps) {
  const { row, locked, selected, expanded, dragging, dropState } = props;
  const obj = row.obj;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(obj.name);

  const startEdit = () => {
    setDraft(obj.name);
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== '' && next !== obj.name) props.onRename(next);
  };
  const onNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    else if (e.key === 'Escape') {
      setDraft(obj.name);
      setEditing(false);
      e.currentTarget.blur();
    }
  };
  const onRowKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (editing) return;
    if (e.key === 'Enter') props.onPick(e);
    else if (e.key === 'F2') {
      e.preventDefault();
      startEdit();
    }
  };

  const dropClass =
    dropState !== null
      ? dropState.valid
        ? dropState.zone === 'into'
          ? ' ed-tree__row--drop-into'
          : dropState.zone === 'before'
            ? ' ed-tree__row--drop-before'
            : ' ed-tree__row--drop-after'
        : ' ed-tree__row--drop-forbidden'
      : '';

  return (
    <div
      className={`ed-tree__row${row.isGroup ? ' ed-tree__row--group' : ''}${selected ? ' ed-tree__row--selected' : ''}${locked ? ' ed-tree__row--locked' : ''}${dragging ? ' ed-tree__row--dragging' : ''}${dropClass}`}
      data-object-id={obj.id}
      data-depth={row.depth}
      style={{ paddingLeft: `calc(var(--sp-3) + ${row.depth * 14}px)` }}
      role="treeitem"
      aria-selected={selected}
      aria-level={row.depth + 1}
      aria-expanded={row.isGroup ? expanded : undefined}
      tabIndex={0}
      onClick={props.onPick}
      onDoubleClick={row.isGroup ? props.onDoubleClickMembers : startEdit}
      onContextMenu={(e) => {
        e.preventDefault(); // 抑制浏览器默认菜单（T5.8 右键菜单体系）
        props.onContextMenu(e);
      }}
      onKeyDown={onRowKeyDown}
      draggable={!editing && !locked}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}
      onDrop={props.onDrop}
      title={row.isGroup ? '分组（纯组织节点）· 双击选中组内对象 · 拖拽挂入/排序' : undefined}
    >
      {row.isGroup ? (
        <button
          type="button"
          className="ed-tree__group-toggle"
          aria-expanded={expanded}
          aria-label={`${expanded ? '收起' : '展开'}分组 ${obj.name}`}
          onClick={(e) => {
            e.stopPropagation();
            props.onToggleExpand();
          }}
        >
          <span className={`ed-tree__caret${expanded ? '' : ' ed-tree__caret--closed'}`} aria-hidden="true">
            ▾
          </span>
        </button>
      ) : (
        <span className="ed-tree__leaf-dot" aria-hidden="true" />
      )}
      {!row.isGroup ? (
        <IconToggle
          checked={obj.visible}
          label={`${obj.visible ? '隐藏' : '显示'} ${obj.name}`}
          onChange={() => props.onToggleVisible()}
        >
          <EyeIcon off={!obj.visible} />
        </IconToggle>
      ) : null}
      {!row.isGroup ? (
        <IconToggle
          checked={obj.locked}
          label={`${obj.locked ? '解锁' : '锁定'} ${obj.name}`}
          onChange={() => props.onToggleLocked()}
        >
          <LockIcon open={!obj.locked} />
        </IconToggle>
      ) : null}
      {editing ? (
        <input
          className="ed-input ed-tree__rename"
          value={draft}
          autoFocus
          aria-label={`重命名 ${obj.name}`}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onNameKeyDown}
        />
      ) : (
        <span className="ed-tree__name" title={`${obj.name} · ${row.isGroup ? '分组' : obj.type}`}>
          {obj.name}
        </span>
      )}
      {row.isGroup ? <span className="ed-readout">{row.childCount}</span> : null}
      <button
        type="button"
        className="ed-tree__focus"
        aria-label={`定位 ${obj.name}`}
        title={row.isGroup ? '定位（聚焦组内全部成员）' : '定位（聚焦相机）'}
        onClick={(e) => {
          e.stopPropagation();
          if (row.isGroup) props.onFocusMembers();
          else props.onFocusObject();
        }}
      >
        <FocusIcon />
      </button>
    </div>
  );
}

// ── 对象行 ──────────────────────────────────────────────────

interface TreeRowProps {
  obj: SceneObject;
  locked: boolean;
  selected: boolean;
  onPick: (obj: SceneObject, e: Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'>) => void;
  onContextMenu(e: MouseEvent): void;
  onToggleVisible(): void;
  onToggleLocked(): void;
  onRename(name: string): void;
  onFocus(): void;
}

function TreeRow({ obj, locked, selected, onPick, onContextMenu, onToggleVisible, onToggleLocked, onRename, onFocus }: TreeRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(obj.name);

  const startEdit = () => {
    setDraft(obj.name);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== '' && next !== obj.name) onRename(next);
  };

  const onNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    else if (e.key === 'Escape') {
      setDraft(obj.name);
      setEditing(false);
      e.currentTarget.blur();
    }
  };

  const onRowKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (editing) return;
    if (e.key === 'Enter') onPick(obj, e);
    else if (e.key === 'F2') {
      e.preventDefault();
      startEdit();
    }
  };

  return (
    <div
      className={`ed-tree__row${selected ? ' ed-tree__row--selected' : ''}${locked ? ' ed-tree__row--locked' : ''}`}
      data-object-id={obj.id}
      onClick={(e) => onPick(obj, e)}
      onDoubleClick={startEdit}
      onContextMenu={(e) => {
        e.preventDefault(); // 抑制浏览器默认菜单（T5.8 右键菜单体系）
        onContextMenu(e);
      }}
      role="treeitem"
      aria-selected={selected}
      tabIndex={0}
      onKeyDown={onRowKeyDown}
    >
      <IconToggle
        checked={obj.visible}
        label={`${obj.visible ? '隐藏' : '显示'} ${obj.name}`}
        onChange={() => onToggleVisible()}
      >
        <EyeIcon off={!obj.visible} />
      </IconToggle>
      <IconToggle
        checked={obj.locked}
        label={`${obj.locked ? '解锁' : '锁定'} ${obj.name}`}
        onChange={() => onToggleLocked()}
      >
        <LockIcon open={!obj.locked} />
      </IconToggle>
      {editing ? (
        <input
          className="ed-input ed-tree__rename"
          value={draft}
          autoFocus
          aria-label={`重命名 ${obj.name}`}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onNameKeyDown}
        />
      ) : (
        <span className="ed-tree__name" title={`${obj.name} · ${obj.type}`}>
          {obj.name}
        </span>
      )}
      <button
        type="button"
        className="ed-tree__focus"
        aria-label={`定位 ${obj.name}`}
        title="定位（聚焦相机）"
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
      >
        <FocusIcon />
      </button>
    </div>
  );
}

// ── 图层管理标签（LayerPanel 等价迁入 + 新建/删除）─────────────

function LayersTab({ facade }: { facade: EditorFacade }) {
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  /** 拖拽排序中的源图层 id（HTML5 dnd） */
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  /** 行内两步删除确认中的图层 id（面板层无 notice/Toast 通道，T5.3 选定行内确认） */
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  /** 合并目标选择展开中的源图层 id（T8.3；与删除确认互斥） */
  const [mergingId, setMergingId] = useState<string | null>(null);

  void sceneVersion; // 订阅版本号：图层变更时重读
  const layers = [...facade.scene.getLayers()].sort((a, b) => a.order - b.order);

  /** 新建图层：SceneManager.addLayer 专用路径（任务书授权，P0 不可撤销） */
  const addLayer = () => {
    const existing = new Set(layers.map((l) => l.name));
    let n = layers.length + 1;
    let name = `图层 ${n}`;
    while (existing.has(name)) {
      n += 1;
      name = `图层 ${n}`;
    }
    const order = layers.length > 0 ? Math.max(...layers.map((l) => l.order)) + 1 : 0;
    facade.scene.addLayer({
      id: createId('layer'),
      name,
      visible: true,
      locked: false,
      opacity: 1,
      order,
      objectIds: [],
    });
  };

  /** 删除图层：成员 layerId 置 null 落「未分层」（契约语义；P0 不可撤销） */
  const removeLayer = (layerId: string) => {
    facade.scene.removeLayer(layerId);
    setConfirmingId(null);
  };

  /** 合并图层（T8.3）：成员迁移 + 删源，一条可撤销历史（MergeLayerCommand） */
  const mergeLayer = (sourceId: string, targetId: string) => {
    facade.history.execute(new MergeLayerCommand(sourceId, targetId));
    setMergingId(null);
  };

  /** 重排：把 dragging 移到 target 之前，所有 order 变化经一条 BatchCommand */
  const commitReorder = (dragging: string, target: string) => {
    if (dragging === target) return;
    const from = layers.findIndex((l) => l.id === dragging);
    const to = layers.findIndex((l) => l.id === target);
    if (from === -1 || to === -1) return;
    const next = [...layers];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const commands = next
      .map((layer, order) => ({ layer, order }))
      .filter(({ layer, order }) => layer.order !== order)
      .map(({ layer, order }) => new UpdateLayerCommand(layer.id, { order }));
    if (commands.length > 0) facade.history.execute(new BatchCommand(commands));
  };

  return (
    <div className="ed-layers">
      <div className="ed-layers__toolbar">
        <span className="ed-readout">{layers.length} 层</span>
        <div className="ed-outliner__spacer" />
        <button type="button" className="ed-btn ed-btn--ghost" title="新建图层" onClick={addLayer}>
          ＋ 新建图层
        </button>
      </div>
      <div className="ed-panel__body">
        {layers.length === 0 ? (
          <div className="ed-empty">
            <strong>暂无图层</strong>
            点击「新建图层」创建
          </div>
        ) : (
          layers.map((layer) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              dragging={draggingId === layer.id}
              dropTarget={dropTargetId === layer.id}
              confirming={confirmingId === layer.id}
              mergeOpen={mergingId === layer.id}
              mergeTargets={layers
                .filter((l) => l.id !== layer.id)
                .map((l) => ({ id: l.id, name: l.name, count: l.objectIds.length }))}
              onDragStart={() => setDraggingId(layer.id)}
              onDragEnd={() => {
                setDraggingId(null);
                setDropTargetId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTargetId(layer.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId !== null) commitReorder(draggingId, layer.id);
                setDraggingId(null);
                setDropTargetId(null);
              }}
              onToggleVisible={() =>
                facade.history.execute(new UpdateLayerCommand(layer.id, { visible: !layer.visible }))
              }
              onToggleLocked={() =>
                facade.history.execute(new UpdateLayerCommand(layer.id, { locked: !layer.locked }))
              }
              onOpacity={(opacity) => facade.history.execute(new UpdateLayerCommand(layer.id, { opacity }))}
              onRename={(name) => facade.history.execute(new UpdateLayerCommand(layer.id, { name }))}
              onDelete={() => {
                setMergingId(null); // 与合并目标选择互斥
                setConfirmingId(layer.id);
              }}
              onCancelDelete={() => setConfirmingId(null)}
              onConfirmDelete={() => removeLayer(layer.id)}
              onMerge={() => {
                setConfirmingId(null); // 与删除确认互斥
                setMergingId(layer.id);
              }}
              onMergeTo={(targetId) => mergeLayer(layer.id, targetId)}
              onCancelMerge={() => setMergingId(null)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface LayerRowProps {
  layer: Layer;
  dragging: boolean;
  dropTarget: boolean;
  confirming: boolean;
  /** 合并目标选择展开态（T8.3） */
  mergeOpen: boolean;
  /** 可合并目标（排除源自身；「未分类」哨兵不出现在面板、天然不可作目标） */
  mergeTargets: ReadonlyArray<{ id: string; name: string; count: number }>;
  onDragStart(): void;
  onDragEnd(): void;
  onDragOver(e: DragEvent): void;
  onDrop(e: DragEvent): void;
  onToggleVisible(): void;
  onToggleLocked(): void;
  onOpacity(opacity: number): void;
  onRename(name: string): void;
  onDelete(): void;
  onCancelDelete(): void;
  onConfirmDelete(): void;
  onMerge(): void;
  onMergeTo(targetId: string): void;
  onCancelMerge(): void;
}

function LayerRow(props: LayerRowProps) {
  const { layer, dragging, dropTarget, confirming, mergeOpen, mergeTargets } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(layer.name);
  /** 拖动中的透明度草稿（松手才提交命令） */
  const [opacityDraft, setOpacityDraft] = useState<number | null>(null);
  const opacity = opacityDraft ?? layer.opacity;

  useEffect(() => {
    if (opacityDraft === null) return;
    // 草稿与已提交值一致时收敛（外部撤销/重做回写）
    if (Math.abs(opacityDraft - layer.opacity) < 1e-6) setOpacityDraft(null);
  }, [layer.opacity, opacityDraft]);

  const startEdit = () => {
    setDraft(layer.name);
    setEditing(true);
  };
  const commitName = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== '' && next !== layer.name) props.onRename(next);
  };
  const onNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    else if (e.key === 'Escape') {
      setDraft(layer.name);
      setEditing(false);
      e.currentTarget.blur();
    }
  };

  const commitOpacity = () => {
    if (opacityDraft !== null && Math.abs(opacityDraft - layer.opacity) > 1e-6) {
      props.onOpacity(opacityDraft);
    }
    setOpacityDraft(null);
  };

  return (
    <div
      className={`ed-layer__row${dragging ? ' ed-layer__row--dragging' : ''}${dropTarget ? ' ed-layer__row--drop' : ''}${confirming ? ' ed-layer__row--confirming' : ''}`}
      data-layer-id={layer.id}
      draggable={!editing}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      onDoubleClick={startEdit}
      title="拖拽调整叠放顺序 · 双击重命名"
    >
      <div className="ed-layer__head">
        <IconToggle
          checked={layer.visible}
          label={`${layer.visible ? '隐藏' : '显示'}图层 ${layer.name}`}
          onChange={props.onToggleVisible}
        >
          <EyeIcon off={!layer.visible} />
        </IconToggle>
        <IconToggle
          checked={layer.locked}
          label={`${layer.locked ? '解锁' : '锁定'}图层 ${layer.name}`}
          onChange={props.onToggleLocked}
        >
          <LockIcon open={!layer.locked} />
        </IconToggle>
        {editing ? (
          <input
            className="ed-input ed-tree__rename"
            value={draft}
            autoFocus
            aria-label={`重命名图层 ${layer.name}`}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={onNameKeyDown}
          />
        ) : (
          <span className="ed-layer__name" title={layer.name}>
            {layer.name}
          </span>
        )}
        <span className="ed-readout">{layer.objectIds.length}</span>
        <button
          type="button"
          className={`ed-layer__merge-btn${mergeOpen ? ' ed-layer__merge-btn--open' : ''}`}
          aria-label={`合并图层 ${layer.name} 到其他图层`}
          aria-expanded={mergeOpen}
          title={
            mergeTargets.length === 0
              ? '合并图层（当前仅一层，无合并目标）'
              : `把「${layer.name}」全部成员迁移到另一图层并删除本层（一条可撤销历史）`
          }
          disabled={mergeTargets.length === 0}
          onClick={props.onMerge}
        >
          <Combine size={12} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ed-layer__delete"
          aria-label={`删除图层 ${layer.name}`}
          title={
            layer.objectIds.length > 0
              ? `删除图层 ${layer.name}（${layer.objectIds.length} 个对象将移至「未分层」）`
              : `删除空图层 ${layer.name}`
          }
          onClick={props.onDelete}
        >
          ×
        </button>
      </div>
      <div className="ed-layer__opacity">
        <span className="ed-field__label">透明度</span>
        <input
          type="range"
          className="ed-slider__range"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          aria-label={`图层 ${layer.name} 透明度`}
          onChange={(e) => setOpacityDraft(Number(e.target.value))}
          onPointerUp={commitOpacity}
          onKeyUp={commitOpacity}
        />
        <span className="ed-readout">{opacity.toFixed(2)}</span>
      </div>
      {mergeOpen ? (
        <div className="ed-layer__merge" role="group" aria-label={`选择「${layer.name}」的合并目标`}>
          <span className="ed-layer__confirm-text">
            「{layer.name}」{layer.objectIds.length > 0 ? `（${layer.objectIds.length} 个对象）` : '（空层）'}合并到：
          </span>
          <div className="ed-layer__merge-targets">
            {mergeTargets.map((target) => (
              <button
                type="button"
                className="ed-btn ed-btn--ghost"
                key={target.id}
                title={`成员并入「${target.name}」并删除「${layer.name}」（一条历史，可撤销）`}
                onClick={() => props.onMergeTo(target.id)}
              >
                {target.name}
                <span className="ed-readout">×{target.count}</span>
              </button>
            ))}
          </div>
          <button type="button" className="ed-btn ed-btn--ghost" onClick={props.onCancelMerge}>
            取消
          </button>
        </div>
      ) : null}
      {confirming ? (
        <div className="ed-layer__confirm" role="group" aria-label={`确认删除图层 ${layer.name}`}>
          <span className="ed-layer__confirm-text">
            {layer.objectIds.length > 0
              ? `${layer.objectIds.length} 个对象将移至「未分层」`
              : '删除空图层？'}
          </span>
          <button
            type="button"
            className="ed-btn ed-layer__confirm-delete"
            autoFocus
            onClick={props.onConfirmDelete}
          >
            删除
          </button>
          <button type="button" className="ed-btn ed-btn--ghost" onClick={props.onCancelDelete}>
            取消
          </button>
        </div>
      ) : null}
    </div>
  );
}
