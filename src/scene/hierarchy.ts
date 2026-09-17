/**
 * scene/hierarchy —— parentId 层级派生纯函数（T8.5）。
 *
 * 职责：平铺对象数组（SceneData.objects，同父兄弟顺序 = 数组内顺序，JSON 序列化天然
 *      保序）→ 层级结构的派生计算：
 *   - childrenIndexOf：parentId → 直接子对象列表（桶内序 = 数组序）；
 *   - descendantsOf / isAncestorOf：后代全集 / 祖先判定（reparent 环检测的数据基础）；
 *   - buildHierarchyForest / flattenHierarchy：根集（parentId null 或悬空引用）→ 前序
 *     平铺（UI 树行渲染与排序落点计算共用）；
 *   - 森林结构搬移原语（siblingIndexOf / detachSubtreeNode / appendChildNode / insertSiblingNode /
 *     insertChildNodesAt / flattenHierarchyIds）：分组/解散/换父命令的「新数组顺序」
 *     计算底座——搬移只重组节点引用与 children 数组，不改对象数据。
 * 边界：纯函数；搬移原语对传入 forest 做结构变异（调用方传 buildHierarchyForest 的
 *      新鲜产物，不与外部共享）；环状脏数据（a→b→a）防御不死循环（访问集截断，孤儿
 *      按根处理）；depth 在搬移后不再维护（消费方需深度请重平铺）；
 *      零渲染；scene 层只依赖 core。
 */
import type { ID } from '../core/types';
import type { SceneObject } from './SceneObject';

/** 直接子对象索引：parentId（null = 根）→ 子对象列表（数组序） */
export function childrenIndexOf(objects: readonly SceneObject[]): Map<ID | null, SceneObject[]> {
  const index = new Map<ID | null, SceneObject[]>();
  for (const obj of objects) {
    const bucket = index.get(obj.parentId);
    if (bucket) bucket.push(obj);
    else index.set(obj.parentId, [obj]);
  }
  return index;
}

/**
 * 全部后代 id 集（不含自身）：沿 children 索引广度收集；环状脏数据（a→b→a）由
 * visited 截断防御——已访问节点不再入队，不死循环。
 */
export function descendantsOf(objects: readonly SceneObject[], rootId: ID): Set<ID> {
  const children = childrenIndexOf(objects);
  const out = new Set<ID>();
  let frontier: ID[] = [rootId];
  while (frontier.length > 0) {
    const next: ID[] = [];
    for (const id of frontier) {
      for (const child of children.get(id) ?? []) {
        if (out.has(child.id)) continue; // 环防御
        out.add(child.id);
        next.push(child.id);
      }
    }
    frontier = next;
  }
  return out;
}

/** ancestorId 是否为 id 的（严格）祖先：沿 parentId 链上溯，环状数据由步数上限截断 */
export function isAncestorOf(
  objects: readonly SceneObject[],
  ancestorId: ID,
  id: ID,
): boolean {
  const byId = new Map(objects.map((o) => [o.id, o] as const));
  let cursor = byId.get(id);
  for (let hops = 0; cursor && cursor.parentId !== null && hops < objects.length; hops++) {
    if (cursor.parentId === ancestorId) return true;
    cursor = byId.get(cursor.parentId);
  }
  return false;
}

/** 层级森林节点（children 为数组序的直接子节点递归结构） */
export interface HierarchyNode {
  obj: SceneObject;
  depth: number;
  children: HierarchyNode[];
}

/**
 * 对象数组 → 层级森林：根集 = parentId null 或悬空引用（孤儿按根处理，不崩不错序）；
 * 子节点序 = 数组序；环状脏数据（无根环）由入森林访问集截断——已在某子树中的节点
 * 不再重复作根/子（防御性，正常数据无此形态）。
 */
export function buildHierarchyForest(objects: readonly SceneObject[]): HierarchyNode[] {
  const children = childrenIndexOf(objects);
  const ids = new Set(objects.map((o) => o.id));
  const placed = new Set<ID>();

  const build = (obj: SceneObject, depth: number): HierarchyNode => {
    placed.add(obj.id);
    const kids: HierarchyNode[] = [];
    for (const child of children.get(obj.id) ?? []) {
      if (placed.has(child.id)) continue; // 环防御
      kids.push(build(child, depth + 1));
    }
    return { obj, depth, children: kids };
  };

  const roots: HierarchyNode[] = [];
  for (const obj of objects) {
    const isRoot = obj.parentId === null || !ids.has(obj.parentId);
    if (isRoot && !placed.has(obj.id)) roots.push(build(obj, 0));
  }
  // 无根环（脏数据兜底）：未入树的节点按根级追加，保序不丢
  for (const obj of objects) {
    if (!placed.has(obj.id)) roots.push(build(obj, 0));
  }
  return roots;
}

/** 前序平铺行（深度供缩进；根序 = 数组序） */
export interface HierarchyFlatRow {
  obj: SceneObject;
  depth: number;
}

/** 森林 → 前序平铺（父节点先于其子树；兄弟序 = 数组序） */
export function flattenHierarchy(nodes: readonly HierarchyNode[]): HierarchyFlatRow[] {
  const out: HierarchyFlatRow[] = [];
  const walk = (node: HierarchyNode): void => {
    out.push({ obj: node.obj, depth: node.depth });
    for (const child of node.children) walk(child);
  };
  for (const node of nodes) walk(node);
  return out;
}

// ── 森林结构搬移原语（命令层新数组顺序计算共用；对 forest 做结构变异）──

/** 在森林中查找包含指定 id 节点的兄弟列表（根级返回根数组；未找到返回 null） */
function findSiblingList(nodes: HierarchyNode[], id: ID): HierarchyNode[] | null {
  for (const node of nodes) {
    if (node.obj.id === id) return nodes;
  }
  for (const node of nodes) {
    const found = findSiblingList(node.children, id);
    if (found !== null) return found;
  }
  return null;
}

/** 节点在其兄弟列表中的位置（-1 = 不在森林中） */
export function siblingIndexOf(nodes: readonly HierarchyNode[], id: ID): number {
  const list = findSiblingList([...nodes], id);
  return list === null ? -1 : list.findIndex((n) => n.obj.id === id);
}

/** 摘下指定 id 的整棵子树节点（连后代；未找到返回 null） */
export function detachSubtreeNode(nodes: HierarchyNode[], id: ID): HierarchyNode | null {
  const list = findSiblingList(nodes, id);
  if (list === null) return null;
  const index = list.findIndex((n) => n.obj.id === id);
  if (index < 0) return null;
  return list.splice(index, 1)[0] ?? null;
}

/** 目标父级的子列表（parentId null = 根数组；父级不存在返回 null） */
function childListOf(nodes: HierarchyNode[], parentId: ID | null): HierarchyNode[] | null {
  if (parentId === null) return nodes;
  const list = findSiblingList(nodes, parentId);
  return list === null ? null : (list.find((n) => n.obj.id === parentId)?.children ?? null);
}

/** 把若干节点插入目标父级子列表的 index 位（越界钳到末尾；parentId null = 根级） */
export function insertChildNodesAt(
  nodes: HierarchyNode[],
  parentId: ID | null,
  index: number,
  inserts: readonly HierarchyNode[],
): void {
  const list = childListOf(nodes, parentId);
  if (list === null) return;
  const slot = Math.min(Math.max(index, 0), list.length);
  list.splice(slot, 0, ...inserts);
}

/** 追加为目标父级的末位子级（parentId null = 根级末尾） */
export function appendChildNode(
  nodes: HierarchyNode[],
  parentId: ID | null,
  node: HierarchyNode,
): void {
  insertChildNodesAt(nodes, parentId, Number.POSITIVE_INFINITY, [node]);
}

/** 作为锚点的兄弟插入（before = 锚点前；after = 锚点后——前序上即锚点整棵子树之后；
 *  锚点不在森林中返回 false 不变异） */
export function insertSiblingNode(
  nodes: HierarchyNode[],
  anchorId: ID,
  node: HierarchyNode,
  position: 'before' | 'after',
): boolean {
  const list = findSiblingList(nodes, anchorId);
  if (list === null) return false;
  const index = list.findIndex((n) => n.obj.id === anchorId);
  if (index < 0) return false;
  list.splice(position === 'before' ? index : index + 1, 0, node);
  return true;
}

/** 森林 → 前序 id 序（搬移后新数组顺序） */
export function flattenHierarchyIds(nodes: readonly HierarchyNode[]): ID[] {
  return flattenHierarchy(nodes).map((row) => row.obj.id);
}
