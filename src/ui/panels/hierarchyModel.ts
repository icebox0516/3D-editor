/**
 * ui/panels/hierarchyModel —— Outliner 层级树模型纯函数（T8.5 §3）。
 *
 * 职责：parentId 层级树（scene/hierarchy 派生）之上的 UI 纯逻辑——
 *   - buildHierarchyRows：前序平铺行（depth 缩进 / childCount 直接成员计数 /
 *     isGroup）+ 折叠集过滤（折叠组隐藏整棵子树）+ 搜索/类型筛选（保留命中祖先链）；
 *   - resolveDropZone：拖拽落点行内分区——组行上/下四分位 = before/after 插入线、
 *     中段 = into 挂入；非组行无 into（上/下半区二分）；
 *   - evaluateDrop：落点合法性（拖到自身 / 挂入自身后代（环）/ 挂入非组行 /
 *     锚点在自身子树内 → invalid + reason，UI 据此出禁止态与环拒绝 toast）；
 *   - buildReparentCommand：合法落点 → ReparentCommand（into/before/after/root
 *     四形态与命令 target 同构）；非法 → null；
 *   - selectGroupMemberIds：组内全部后代成员（不含任何组壳——仅选成员不选壳）；
 *     ungroupableIds：选中集中的组壳清单（解散组作用域）；
 *   - 展开态集合运算（缺省全展开 / toggle）与筛选辅助（hierarchyFilterIds /
 *     hierarchyTypeFilterOptions）。
 * 边界：纯数据/纯逻辑，零渲染零 React（800ms 计时归组件，纯函数只管集合运算）；
 *      ui 层只依赖 core/scene/editor（分层 DAG）。
 */
import type { ID } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import { GROUP_OBJECT_TYPE, isGroupObject } from '../../scene/GroupObject';
import { childrenIndexOf, descendantsOf, isAncestorOf } from '../../scene/hierarchy';
import { ReparentCommand } from '../../editor/commands/ReparentCommand';
import type { ReparentTarget } from '../../editor/commands/ReparentCommand';

// ── 树行派生（含折叠与筛选）──────────────────────────────────

/** 层级树行（渲染与落点计算的原子单位） */
export interface HierarchyRow {
  obj: SceneObject;
  /** 树深度（0 = 根级；缩进用） */
  depth: number;
  /** 直接子级数（组行计数徽标；非组行通常 0） */
  childCount: number;
  /** 组壳行（折叠箭头 / into 落点 / 双击选成员等组行专属行为） */
  isGroup: boolean;
}

/**
 * 对象数组 → 可见层级行（前序）：
 * - 折叠集（collapsed）内的组隐藏整棵子树；缺省全展开；
 * - visibleIds 提供时（搜索/类型筛选激活）只保留命中行与命中行的祖先链
 *  （祖先行仅作上下文展示，仍受折叠集管辖）。
 */
export function buildHierarchyRows(
  objects: readonly SceneObject[],
  collapsed: ReadonlySet<ID>,
  visibleIds?: ReadonlySet<ID> | null,
): HierarchyRow[] {
  const children = childrenIndexOf(objects);
  const rows: HierarchyRow[] = [];
  const walked = new Set<ID>();

  const walk = (obj: SceneObject, depth: number, hidden: boolean): void => {
    walked.add(obj.id);
    const kids = children.get(obj.id) ?? [];
    const filteredOut = visibleIds !== undefined && visibleIds !== null && !visibleIds.has(obj.id);
    if (!hidden && !filteredOut) {
      rows.push({ obj, depth, childCount: kids.length, isGroup: obj.type === GROUP_OBJECT_TYPE });
    }
    // 子树隐藏判定：祖先隐藏 / 自身被筛除 / 自身折叠（折叠组整棵子树不可见）
    const hideChildren = hidden || filteredOut || collapsed.has(obj.id);
    for (const kid of kids) walk(kid, depth + 1, hideChildren);
  };

  const ids = new Set(objects.map((o) => o.id));
  for (const obj of objects) {
    if (obj.parentId === null || !ids.has(obj.parentId)) {
      if (!walked.has(obj.id)) walk(obj, 0, false);
    }
  }
  // 无根环脏数据兜底：未入树节点按根级补走（保序不丢）
  for (const obj of objects) {
    if (!walked.has(obj.id)) walk(obj, 0, false);
  }
  return rows;
}

/** 展开态：折叠中的节点 id 集合（缺省空集 = 全展开；语义沿 outlinerModel.ExpandState） */
export type HierarchyExpandState = ReadonlySet<ID>;

/** 节点是否展开（折叠集外即展开） */
export function isNodeExpanded(state: HierarchyExpandState, id: ID): boolean {
  return !state.has(id);
}

/** 切换节点展开/折叠（返回新集合） */
export function toggleNodeExpanded(state: HierarchyExpandState, id: ID): HierarchyExpandState {
  const next = new Set(state);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/**
 * 筛选命中集：命中对象 + 其全部祖先链（树上命中行的上下文保留）。
 * pred 任意返回 true 即命中；空结果 = 全不命中（调用方显空态）。
 */
export function hierarchyFilterIds(
  objects: readonly SceneObject[],
  pred: (obj: SceneObject) => boolean,
): Set<ID> {
  const byId = new Map(objects.map((o) => [o.id, o] as const));
  const visible = new Set<ID>();
  for (const obj of objects) {
    if (!pred(obj)) continue;
    visible.add(obj.id);
    let cursor = obj.parentId;
    while (cursor !== null && byId.has(cursor) && !visible.has(cursor)) {
      visible.add(cursor);
      cursor = byId.get(cursor)!.parentId;
    }
  }
  return visible;
}

/** 类型筛选下拉项（全部 / 分组 / 区域 / 模型——按现有对象计数，零计数项剔除） */
export interface HierarchyTypeFilterOption {
  key: string;
  label: string;
  count: number;
}

export function hierarchyTypeFilterOptions(
  objects: readonly SceneObject[],
): HierarchyTypeFilterOption[] {
  const counts = new Map<string, number>();
  for (const obj of objects) counts.set(obj.type, (counts.get(obj.type) ?? 0) + 1);
  const labels: Record<string, string> = {
    [GROUP_OBJECT_TYPE]: '分组',
    region: '区域',
    model: '模型',
  };
  return [
    { key: 'all', label: '全部', count: objects.length },
    ...[...counts.entries()].map(([type, count]) => ({
      key: type,
      label: labels[type] ?? type,
      count,
    })),
  ];
}

// ── 拖拽落点（drop indicator 三态的数据面）────────────────────

/** 行内落点分区（before/after = 1px 插入线；into = 行体高亮挂入） */
export type DropZone = 'before' | 'into' | 'after';

/**
 * 指针在行内的纵向位置 → 落点分区：
 * - 组行：上四分位 before / 中段 into / 下四分位 after（Unity Hierarchy 先例）；
 * - 非组行：无 into（上半 before / 下半 after——挂入非组是非法落点）。
 */
export function resolveDropZone(offsetY: number, rowHeight: number, isGroupRow: boolean): DropZone {
  if (isGroupRow) {
    const quarter = rowHeight / 4;
    if (offsetY < quarter) return 'before';
    if (offsetY > rowHeight - quarter) return 'after';
    return 'into';
  }
  return offsetY < rowHeight / 2 ? 'before' : 'after';
}

/** 拖拽落点载荷（zone root = 容器根区——上提根级/根级排序） */
export interface DropTargetPayload {
  zone: DropZone | 'root';
  targetId: ID | null;
}

/** 非法落点原因（UI 禁止态样式与环拒绝 toast 的文案依据） */
export type DropRejectReason = 'missing-drag' | 'missing-target' | 'self' | 'cycle' | 'into-non-group';

/** 落点合法性求值结果（valid=false 时携带 reason） */
export interface DropEvaluation {
  valid: boolean;
  reason?: DropRejectReason;
}

/** 落点合法性（纯函数）：环检测 = 挂入/排序锚点落在拖拽子树内即拒绝 */
export function evaluateDrop(
  objects: readonly SceneObject[],
  dragId: ID,
  drop: DropTargetPayload,
): DropEvaluation {
  const byId = new Map(objects.map((o) => [o.id, o] as const));
  if (!byId.has(dragId)) return { valid: false, reason: 'missing-drag' };
  if (drop.zone === 'root') return { valid: true }; // 根区：上提/根级排序恒合法（无环可能）

  const targetId = drop.targetId;
  if (targetId === null || !byId.has(targetId)) {
    return { valid: false, reason: 'missing-target' };
  }
  if (targetId === dragId) return { valid: false, reason: 'self' };
  if (drop.zone === 'into') {
    if (isAncestorOf(objects, dragId, targetId)) return { valid: false, reason: 'cycle' };
    if (!isGroupObject(byId.get(targetId)!)) return { valid: false, reason: 'into-non-group' };
    return { valid: true };
  }
  // before / after：锚点在自身子树内（含跨层）→ 环
  if (isAncestorOf(objects, dragId, targetId)) return { valid: false, reason: 'cycle' };
  return { valid: true };
}

/** 合法落点 → ReparentCommand（root 归并为 into parentId=null；非法 → null 不产生命令） */
export function buildReparentCommand(
  objects: readonly SceneObject[],
  dragId: ID,
  drop: DropTargetPayload,
): ReparentCommand | null {
  const evalResult = evaluateDrop(objects, dragId, drop);
  if (!evalResult.valid) return null;
  let target: ReparentTarget;
  if (drop.zone === 'root') {
    target = { kind: 'into', parentId: null };
  } else if (drop.zone === 'into') {
    target = { kind: 'into', parentId: drop.targetId };
  } else {
    target = { kind: drop.zone, anchorId: drop.targetId! };
  }
  return new ReparentCommand(dragId, target);
}

// ── 组行次级动作 ─────────────────────────────────────────────

/** 组内全部后代成员 id（不含任何组壳——深层成员收全、嵌套组壳剔除；数组序） */
export function selectGroupMemberIds(objects: readonly SceneObject[], groupId: ID): ID[] {
  const descendants = descendantsOf(objects, groupId);
  return objects.filter((o) => descendants.has(o.id) && !isGroupObject(o)).map((o) => o.id);
}

/** 选中集中的组壳 id 清单（解散组作用域；保持选中序） */
export function ungroupableIds(objects: readonly SceneObject[], selectedIds: readonly ID[]): ID[] {
  const byId = new Map(objects.map((o) => [o.id, o] as const));
  return selectedIds.filter((id) => {
    const obj = byId.get(id);
    return obj !== undefined && isGroupObject(obj);
  });
}
