/**
 * ui/panels/outlinerModel —— Scene Outliner 树模型纯函数（T5.3；T6.7 翻转为语义分组）。
 *
 * 职责：对象列表 → 虚分组树——region 对象按 semantic.type 分十组（组序 = SEMANTIC_TYPES
 *      序、组名 = 语义 label、layerName = defaultLayerName，全部自 domain/regions/
 *      semanticDefinitions 取——单一真相源，不重复字面量）；model 对象归「模型」组
 *      （domain/assets.MODEL_LAYER_NAME）；其余落「未分层」兜底组。搜索/类型筛选；
 *      展开态纯函数（折叠集合语义，缺省全展开、新组自动展开、搜索激活时命中组强制
 *      展开）；组级显隐/锁定的批量补丁规划与命令构造（状态不一致成员逐对象
 *      UpdateObjectCommand，多成员经 BatchCommand 合一条历史——一次 undo 全恢复）；
 *      Shift 范围选择（T7.5 起跨组连续）；类型筛选下拉项与空态文案。
 * 边界：纯数据/纯逻辑，零渲染零 React；组是虚分组（不建真实父对象，真实 parentId
 *      层级归 P1）；ui 层只依赖 core/scene/domain/editor（分层 DAG）。
 *      T6.7：旧「按要素类型分组」（旧按类型默认图层名表键序）已随旧要素体系删除。
 */
import type { ID } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import { MODEL_LAYER_NAME } from '../../domain/assets';
import { isRegionObject } from '../../domain/regions';
import { SEMANTIC_DEFINITIONS } from '../../domain/regions';
import type { Command } from '../../editor/commands';
import { BatchCommand } from '../../editor/commands/BatchCommand';
import { UpdateObjectCommand } from '../../editor/commands/UpdateObjectCommand';

/** 未分层（region 表外语义 / 未知类型）兜底组键 */
export const UNGROUPED_KEY = '__ungrouped__';

/** 未分层组行显示名 */
export const UNGROUPED_LABEL = '未分层';

/** 模型组键（model 对象默认分组；组名与 layerName = MODEL_LAYER_NAME） */
export const MODEL_GROUP_KEY = 'model';

/**
 * 类型中文名兜底表（T6.7 收缩；T8.5 增 group）：region 组名按语义 label 取（语义
 * 注册表为真相源），本表仅剩 model/region/group 兜底项——多选汇总（describeSelection）
 * 等场景消费；region 的类型级中文名兜底为「区域」、group 为「分组」。
 */
export const DEFAULT_TYPE_LABELS: Readonly<Record<string, string>> = {
  model: '模型',
  region: '区域',
  group: '分组',
};

/** 组节点：虚分组（region 组键 = semantic.type；模型组键 = 'model'；兜底 = UNGROUPED_KEY） */
export interface OutlinerGroup {
  key: string;
  /** 组标识（语义类型 / 'model'；null = 未分层兜底组，可能混有多种表外类型） */
  type: string | null;
  /** 组行显示名（语义 label / 模型 / 未分层） */
  label: string;
  /** 对齐语义 defaultLayerName 的图层名（未分层组为「未分层」） */
  layerName: string;
  objects: SceneObject[];
}

/** 语义分组固定组序与命名（SEMANTIC_DEFINITIONS 顺序即展示顺序，单一真相源） */
function semanticGroupSpecs(): Array<{ key: string; label: string; layerName: string }> {
  return SEMANTIC_DEFINITIONS.map((def) => ({
    key: def.type,
    label: def.label,
    layerName: def.defaultLayerName,
  }));
}

/**
 * 对象列表 → 语义分组树（只有非空组；组内保持输入顺序）。
 * region 按 semantic.type 归语义组（表外语义落「未分层」）；model 归「模型」组；
 * 其余类型落「未分层」尾组。
 */
export function buildOutlinerTree(objects: readonly SceneObject[]): OutlinerGroup[] {
  const specs = semanticGroupSpecs();
  const groups = new Map<string, OutlinerGroup>();
  for (const spec of specs) {
    groups.set(spec.key, { key: spec.key, type: spec.key, label: spec.label, layerName: spec.layerName, objects: [] });
  }
  const modelGroup: OutlinerGroup = {
    key: MODEL_GROUP_KEY,
    type: 'model',
    label: MODEL_LAYER_NAME,
    layerName: MODEL_LAYER_NAME,
    objects: [],
  };
  const ungrouped: OutlinerGroup = {
    key: UNGROUPED_KEY,
    type: null,
    label: UNGROUPED_LABEL,
    layerName: UNGROUPED_LABEL,
    objects: [],
  };

  for (const obj of objects) {
    if (isRegionObject(obj)) {
      const group = groups.get(obj.semantic.type);
      if (group) group.objects.push(obj);
      else ungrouped.objects.push(obj); // 表外语义（异常数据）兜底
    } else if (obj.type === 'model') {
      modelGroup.objects.push(obj);
    } else {
      ungrouped.objects.push(obj);
    }
  }

  return [...specs.map((s) => groups.get(s.key)!), modelGroup, ungrouped].filter(
    (g) => g.objects.length > 0,
  );
}

/** 筛选条件：search = 名称模糊（不区分大小写、trim）；typeFilter = 'all' 或组键 */
export interface OutlinerFilter {
  search?: string;
  typeFilter?: string;
}

/** 树筛选：先类型后名称；未命中的对象剔除、空组整组剔除（返回新结构，不改入参） */
export function filterOutlinerTree(
  tree: readonly OutlinerGroup[],
  filter: OutlinerFilter,
): OutlinerGroup[] {
  const { typeFilter = 'all', search = '' } = filter;
  const q = search.trim().toLowerCase();
  let source = tree;
  if (typeFilter !== 'all') source = tree.filter((g) => g.key === typeFilter);
  if (q === '') return source.map((g) => ({ ...g, objects: [...g.objects] }));
  return source
    .map((g) => ({ ...g, objects: g.objects.filter((o) => o.name.toLowerCase().includes(q)) }))
    .filter((g) => g.objects.length > 0);
}

/** 展开态：折叠中的组键集合（缺省空集 = 全展开；新出现的组自动展开） */
export type ExpandState = ReadonlySet<string>;

/** 组是否展开 */
export function isGroupExpanded(state: ExpandState, key: string): boolean {
  return !state.has(key);
}

/** 切换单组展开/折叠 */
export function toggleGroupExpanded(state: ExpandState, key: string): ExpandState {
  const next = new Set(state);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/** 展开全部（清空折叠集） */
export function expandAllGroups(): ExpandState {
  return new Set();
}

/** 收起全部（当前树的全部组键入折叠集） */
export function collapseAllGroups(tree: readonly OutlinerGroup[]): ExpandState {
  return new Set(tree.map((g) => g.key));
}

/** 生效展开判定：搜索激活时命中组一律展开（命中路径自动展开，忽略手动折叠） */
export function resolveGroupExpanded(
  state: ExpandState,
  key: string,
  searchActive: boolean,
): boolean {
  return searchActive || isGroupExpanded(state, key);
}

/** 组级批量补丁规划：目标值 = 把组拉齐到统一态（任一未开 → 开；全开 → 关），只动不一致成员 */
export interface GroupTogglePlan {
  value: boolean;
  targets: SceneObject[];
}

/** 规划组级显隐/锁定补丁（空组返回 null） */
export function planGroupToggle(
  objects: readonly SceneObject[],
  field: 'visible' | 'locked',
): GroupTogglePlan | null {
  if (objects.length === 0) return null;
  const value = !objects.every((o) => o[field]);
  const targets = objects.filter((o) => o[field] !== value);
  return { value, targets };
}

/**
 * 组级显隐/锁定 → 单条 Command：状态不一致成员逐对象 UpdateObjectCommand，
 * 多成员经 BatchCommand 合并（HistoryManager 默认 mergeBatch 下为一条历史，
 * 一次 undo 全恢复）；组空或无差异成员返回 null（不产生空历史）。
 */
export function buildGroupToggleCommand(
  objects: readonly SceneObject[],
  field: 'visible' | 'locked',
): Command | null {
  const plan = planGroupToggle(objects, field);
  if (!plan || plan.targets.length === 0) return null;
  const commands: Command[] = plan.targets.map(
    (o) => new UpdateObjectCommand(o.id, { [field]: plan.value }),
  );
  return commands.length === 1 ? commands[0]! : new BatchCommand(commands);
}

/**
 * Shift 范围选择（T7.5 起支持跨组）：树序（组序 × 组内序）扁平化后取锚点→焦点闭区间，
 * 跨组连续选择；任一 id 不在树中返回 null。锚点 = 焦点且在树中时返回单元素。
 */
export function rangeSelection(
  tree: readonly OutlinerGroup[],
  anchorId: ID,
  focusId: ID,
): ID[] | null {
  const flat: ID[] = [];
  for (const group of tree) {
    for (const obj of group.objects) flat.push(obj.id);
  }
  const anchorIndex = flat.indexOf(anchorId);
  const focusIndex = flat.indexOf(focusId);
  if (anchorIndex === -1 || focusIndex === -1) return null;
  const from = Math.min(anchorIndex, focusIndex);
  const to = Math.max(anchorIndex, focusIndex);
  return flat.slice(from, to + 1);
}

/** 类型筛选下拉项（首项「全部」带总数，其后按组序：label + 计数） */
export interface TypeFilterOption {
  key: string;
  label: string;
  count: number;
}

export function typeFilterOptions(tree: readonly OutlinerGroup[]): TypeFilterOption[] {
  const total = tree.reduce((sum, g) => sum + g.objects.length, 0);
  return [
    { key: 'all', label: '全部', count: total },
    ...tree.map((g) => ({ key: g.key, label: g.label, count: g.objects.length })),
  ];
}

/** 空态文案：空场景引导 / 筛选无匹配提示；正常显示树时 kind='hidden' */
export type OutlinerEmpty =
  | { kind: 'hidden' }
  | { kind: 'empty-scene'; title: string; hint: string }
  | { kind: 'no-match'; title: string; hint: string; query: string };

export function describeOutlinerEmpty(
  totalObjects: number,
  visibleGroups: number,
  rawQuery: string,
): OutlinerEmpty {
  if (totalObjects === 0) {
    return {
      kind: 'empty-scene',
      title: '空场景',
      hint: '绘制区域或放置模型开始',
    };
  }
  if (visibleGroups === 0) {
    const query = rawQuery.trim();
    return { kind: 'no-match', title: '无匹配对象', hint: `未命中「${query}」`, query };
  }
  return { kind: 'hidden' };
}
