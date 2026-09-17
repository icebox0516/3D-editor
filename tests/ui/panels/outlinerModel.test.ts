/**
 * tests/ui/panels/outlinerModel.test.ts —— Scene Outliner 树模型纯函数测试
 * （T5.3 先测后码；T6.7 重写为语义分组形态）。
 *
 * 覆盖（vitest node 环境不渲染组件壳，沿 tests/ui 既有纯逻辑形态；GUI 效果留浏览器验收）：
 * - buildOutlinerTree：region 对象按 semantic.type 分十组（组序 = SEMANTIC_TYPES 序，
 *   组名 = 语义 label、layerName = defaultLayerName——单一真相源 semanticDefinitions）；
 *   model 对象归「模型」组（MODEL_LAYER_NAME）；未知类型 / 表外语义归「未分层」尾组；
 *   空组剔除；
 * - filterOutlinerTree：名称模糊（不区分大小写、trim）+ 类型筛选，二者可组合，空组剔除；
 * - 展开态纯函数：缺省全展开（折叠集合语义，新组自动展开）、toggleOne/collapseAll/
 *   expandAll、搜索激活时命中组一律展开（忽略手动折叠）；
 * - planGroupToggle / buildGroupToggleCommand：组级显隐/锁定 = 对状态不一致成员逐对象
 *   UpdateObjectCommand（BatchCommand 合一条历史——一次 undo 全恢复）；
 * - rangeSelection：同组 Shift 范围选择（组内顺序），跨组/未知 id 返回 null；
 * - typeFilterOptions / describeOutlinerEmpty：类型筛选下拉项与空态文案。
 */
import { describe, expect, it } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus';
import type { SceneObject } from '../../../src/scene/SceneObject';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import { createRegionObject } from '../../../src/domain/regions';
import type { SemanticType } from '../../../src/domain/regions';
import { getSemanticDefinition } from '../../../src/domain/regions';
import { MODEL_LAYER_NAME } from '../../../src/domain/assets';
import type { ModelObject } from '../../../src/domain/assets';
import {
  UNGROUPED_KEY,
  UNGROUPED_LABEL,
  buildGroupToggleCommand,
  buildOutlinerTree,
  collapseAllGroups,
  describeOutlinerEmpty,
  expandAllGroups,
  filterOutlinerTree,
  isGroupExpanded,
  planGroupToggle,
  rangeSelection,
  resolveGroupExpanded,
  toggleGroupExpanded,
  typeFilterOptions,
} from '../../../src/ui/panels/outlinerModel';

/** 三角形面形状（RegionShape 最小合法形态） */
const TRIANGLE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
] as const;

/** region 探针（语义类型驱动分组；name 供搜索） */
function makeRegion(semanticType: SemanticType, name: string): SceneObject {
  return createRegionObject({
    shape: { type: 'polygon', points: [...TRIANGLE], baseHeight: 0, closed: true },
    semanticType,
    name,
  });
}

/** model 探针（type 'model' + asset 引用） */
function makeModel(name: string): ModelObject {
  return {
    id: `model_${name}`,
    type: 'model',
    name,
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    asset: { assetId: 'asset_tree' },
  };
}

/** 未知类型探针（落「未分层」兜底组） */
function makeUnknown(type: string, name: string): SceneObject {
  return {
    id: `obj_${type}_${name}`,
    type,
    name,
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}

describe('buildOutlinerTree（语义虚分组）', () => {
  it('region 按语义分组、组序 = SEMANTIC_TYPES 序；model 归模型组；未知类型归「未分层」尾组', () => {
    // 乱序输入：building 在前也应按固定语义组序输出
    const tree = buildOutlinerTree([
      makeRegion('building', '办公楼'),
      makeRegion('water', '景观湖'),
      makeRegion('unclassified', '新区'),
      makeRegion('poi', '访客中心'),
      makeModel('行道树'),
      makeUnknown('zone', '未知类型'),
    ]);
    expect(tree.map((g) => g.key)).toEqual([
      'unclassified',
      'water',
      'building',
      'poi',
      'model',
      UNGROUPED_KEY,
    ]);
  });

  it('组名与 layerName 对齐语义注册表单一真相源；模型组锚定 MODEL_LAYER_NAME', () => {
    const tree = buildOutlinerTree([
      makeRegion('water', '湖'),
      makeRegion('road', '路'),
      makeModel('树'),
      makeUnknown('zone', '未知'),
    ]);
    for (const group of tree) {
      if (group.key === 'model') {
        expect(group.label).toBe(MODEL_LAYER_NAME);
        expect(group.layerName).toBe(MODEL_LAYER_NAME);
        continue;
      }
      if (group.key === UNGROUPED_KEY) {
        expect(group.label).toBe(UNGROUPED_LABEL);
        expect(group.layerName).toBe(UNGROUPED_LABEL);
        continue;
      }
      const def = getSemanticDefinition(group.key)!;
      expect(def).toBeDefined();
      expect(group.label).toBe(def.label);
      expect(group.layerName).toBe(def.defaultLayerName);
    }
    expect(tree.find((g) => g.key === 'water')!.layerName).toBe('水面');
    expect(tree.find((g) => g.key === 'road')!.layerName).toBe('道路');
  });

  it('组行显示语义中文名 + 成员计数；未分层组 type=null 不混入已知组', () => {
    const tree = buildOutlinerTree([
      makeRegion('building', 'B1'),
      makeRegion('building', 'B2'),
      makeUnknown('zone', 'Z'),
    ]);
    const building = tree.find((g) => g.key === 'building')!;
    expect(building.label).toBe('建筑'); // 语义 label
    expect(building.objects).toHaveLength(2);

    const ungrouped = tree.find((g) => g.key === UNGROUPED_KEY)!;
    expect(ungrouped.label).toBe(UNGROUPED_LABEL);
    expect(ungrouped.type).toBeNull();
    expect(ungrouped.objects.map((o) => o.type)).toEqual(['zone']);
  });

  it('空组剔除：空场景 → 空树；无对象的语义不占组头', () => {
    expect(buildOutlinerTree([])).toEqual([]);
    const tree = buildOutlinerTree([makeRegion('road', '路')]);
    expect(tree.map((g) => g.key)).toEqual(['road']); // 只有 road 一组
  });

  it('同语义对象保持输入顺序（组内稳定，供 Shift 范围选择依据）', () => {
    const objects = [makeRegion('road', 'B 街'), makeRegion('road', 'A 街')];
    const tree = buildOutlinerTree(objects);
    expect(tree[0]!.objects.map((o) => o.name)).toEqual(['B 街', 'A 街']);
  });
});

describe('filterOutlinerTree（搜索 + 类型筛选）', () => {
  const tree = buildOutlinerTree([
    makeRegion('building', '办公楼 A'),
    makeRegion('building', '厂房 B'),
    makeRegion('road', '主干道'),
    makeRegion('water', '景观湖'),
  ]);

  it('搜索：按名称包含匹配，不区分大小写、忽略首尾空白；未命中组剔除', () => {
    const hit = filterOutlinerTree(tree, { search: '  办公 ' });
    expect(hit.map((g) => g.key)).toEqual(['building']);
    expect(hit[0]!.objects.map((o) => o.name)).toEqual(['办公楼 A']);

    const upper = filterOutlinerTree(buildOutlinerTree([makeModel('Tree-01')]), { search: 'tree' });
    expect(upper).toHaveLength(1);

    expect(filterOutlinerTree(tree, { search: '不存在的名字' })).toEqual([]);
  });

  it('类型筛选：typeFilter=all 保留全部；指定组键只留该组；可与搜索组合', () => {
    expect(filterOutlinerTree(tree, { typeFilter: 'all' })).toHaveLength(3);
    const roads = filterOutlinerTree(tree, { typeFilter: 'road' });
    expect(roads.map((g) => g.key)).toEqual(['road']);

    const combined = filterOutlinerTree(tree, { search: '厂房', typeFilter: 'building' });
    expect(combined.map((g) => g.key)).toEqual(['building']);
    expect(combined[0]!.objects).toHaveLength(1);

    // 筛选指定组后再搜索未命中 → 空
    expect(filterOutlinerTree(tree, { search: '主干道', typeFilter: 'building' })).toEqual([]);
  });
});

describe('展开态纯函数（折叠集合语义：缺省全展开）', () => {
  const tree = buildOutlinerTree([
    makeRegion('building', 'B'),
    makeRegion('road', 'R'),
    makeRegion('water', 'W'),
  ]);

  it('缺省（空折叠集）全部展开；新出现的组自动展开', () => {
    expect(tree.every((g) => isGroupExpanded(expandAllGroups(), g.key))).toBe(true);
  });

  it('toggleGroupExpanded 切换单组；collapseAllGroups 全收；expandAllGroups 全开', () => {
    const toggled = toggleGroupExpanded(new Set(), 'road');
    expect(isGroupExpanded(toggled, 'road')).toBe(false);
    expect(isGroupExpanded(toggled, 'building')).toBe(true);
    expect(isGroupExpanded(toggleGroupExpanded(toggled, 'road'), 'road')).toBe(true);

    const collapsed = collapseAllGroups(tree);
    expect(tree.every((g) => !isGroupExpanded(collapsed, g.key))).toBe(true);
    expect(tree.every((g) => isGroupExpanded(expandAllGroups(), g.key))).toBe(true);
  });

  it('搜索激活时命中组一律展开（忽略手动折叠——命中路径自动展开）', () => {
    const collapsed = collapseAllGroups(tree);
    expect(resolveGroupExpanded(collapsed, 'water', true)).toBe(true);
    expect(resolveGroupExpanded(collapsed, 'water', false)).toBe(false);
    expect(resolveGroupExpanded(new Set(), 'water', false)).toBe(true);
  });
});

describe('组级显隐/锁定（虚分组批量命令）', () => {
  it('planGroupToggle：全开 → 全部关；存在关闭成员 → 补齐为开且只选状态不一致对象；空组 null', () => {
    const all = [makeRegion('road', 'R1'), makeRegion('road', 'R2')];
    expect(planGroupToggle(all, 'visible')).toEqual({ value: false, targets: all });

    const mixed = [
      makeRegion('road', 'R1'),
      makeRegion('road', 'R2'),
      makeRegion('road', 'R3'),
    ];
    mixed[0]!.visible = false;
    mixed[2]!.visible = false;
    const plan = planGroupToggle(mixed, 'visible')!;
    expect(plan.value).toBe(true);
    expect(plan.targets.map((o) => o.visible)).toEqual([false, false]); // 已开者不入批

    const lockedMixed = [makeRegion('road', 'R1'), makeRegion('road', 'R2')];
    lockedMixed[1]!.locked = true;
    const lockPlan = planGroupToggle(lockedMixed, 'locked')!;
    expect(lockPlan.value).toBe(true); // 任一未锁 → 拉齐为锁，只动未锁成员
    expect(lockPlan.targets).toEqual([lockedMixed[0]]);

    expect(planGroupToggle([], 'visible')).toBeNull();
  });

  it('buildGroupToggleCommand：多成员 → BatchCommand 一条历史，一次 undo 全恢复', () => {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });

    const objects = [
      makeRegion('grass', '草地 1'),
      makeRegion('grass', '草地 2'),
      makeRegion('grass', '草地 3'),
    ];
    for (const obj of objects) sceneManager.addObject(obj);

    const cmd = buildGroupToggleCommand(objects, 'visible');
    expect(cmd).not.toBeNull();
    expect(history.execute(cmd!)).toBe(true);
    expect(objects.every((o) => o.visible === false)).toBe(true); // 组显隐即时生效

    expect(history.undo()).toBe(true); // 一次撤销
    expect(objects.every((o) => o.visible === true)).toBe(true); // 全部恢复
    expect(history.canUndo()).toBe(false);
  });

  it('状态全一致时再切换 = 有命令；组内无差异成员时返回 null（不产生空历史）', () => {
    expect(buildGroupToggleCommand([], 'visible')).toBeNull();
    const one = [makeRegion('water', '湖')];
    one[0]!.visible = false;
    const cmd = buildGroupToggleCommand(one, 'visible')!;
    expect(cmd.name).toBe('UpdateObjectCommand'); // 单成员直接单命令（同为一条历史）
  });
});

describe('rangeSelection（Shift 范围选择；T7.5 起支持跨组连续区间）', () => {
  const objects = [
    makeRegion('building', 'B1'),
    makeRegion('building', 'B2'),
    makeRegion('building', 'B3'),
    makeRegion('road', 'R1'),
    makeRegion('road', 'R2'),
  ];
  // 组序 = 语义组序（road 在 building 前）→ 树序扁平化 = [R1, R2, B1, B2, B3]
  const tree = buildOutlinerTree(objects);

  it('同组锚点→焦点按组内顺序返回闭区间 id（旧路径回归）', () => {
    const ids = rangeSelection(tree, objects[0]!.id, objects[2]!.id)!;
    expect(ids).toEqual([objects[0]!.id, objects[1]!.id, objects[2]!.id]);
    // 反向点击同样闭区间
    expect(rangeSelection(tree, objects[2]!.id, objects[0]!.id)).toEqual(ids);
  });

  it('跨组：树序（组序×组内序）扁平化后取锚点→焦点闭区间，连续不漏', () => {
    // 锚点 B1（树序 2）↔ 焦点 R1（树序 0）：区间 = [R1, R2, B1]
    const ids = rangeSelection(tree, objects[0]!.id, objects[3]!.id)!;
    expect(ids).toEqual([objects[3]!.id, objects[4]!.id, objects[0]!.id]);
    // 反向同样闭区间
    expect(rangeSelection(tree, objects[3]!.id, objects[0]!.id)).toEqual(ids);
  });

  it('跨组只覆盖树序区间内成员（区间外对象不含）', () => {
    // 锚点 B2（树序 3）↔ 焦点 R2（树序 1）：区间 = [R2, B1, B2]，B3 不入选
    const ids = rangeSelection(tree, objects[1]!.id, objects[4]!.id)!;
    expect(ids).toEqual([objects[4]!.id, objects[0]!.id, objects[1]!.id]);
  });

  it('未知 id 返回 null', () => {
    expect(rangeSelection(tree, 'region_unknown', objects[0]!.id)).toBeNull();
    expect(rangeSelection(tree, objects[0]!.id, 'region_unknown')).toBeNull();
  });

  it('锚点 = 焦点返回单元素；空树 / 不在树中返回 null', () => {
    expect(rangeSelection(tree, objects[0]!.id, objects[0]!.id)).toEqual([objects[0]!.id]);
    expect(rangeSelection([], objects[0]!.id, objects[0]!.id)).toBeNull();
  });
});

describe('typeFilterOptions（类型筛选下拉项）', () => {
  it('首项「全部」带总数，其后按组序列出（label + 计数）', () => {
    const tree = buildOutlinerTree([
      makeRegion('building', 'B1'),
      makeRegion('building', 'B2'),
      makeRegion('road', 'R1'),
    ]);
    const options = typeFilterOptions(tree);
    expect(options[0]).toEqual({ key: 'all', label: '全部', count: 3 });
    expect(options.slice(1).map((o) => `${o.key}:${o.count}`)).toEqual(['road:1', 'building:2']); // 语义组序：road 在 building 前
  });
});

describe('describeOutlinerEmpty（空态文案）', () => {
  it('空场景 → 引导文案；有对象但筛选无命中 → 无匹配提示；否则隐藏', () => {
    const empty = describeOutlinerEmpty(0, 0, '');
    expect(empty.kind).toBe('empty-scene');
    expect(empty).toHaveProperty('title');
    expect(empty).toHaveProperty('hint');

    const noMatch = describeOutlinerEmpty(5, 0, ' 主干道 ');
    expect(noMatch.kind).toBe('no-match');
    expect(noMatch).toHaveProperty('query', '主干道');

    expect(describeOutlinerEmpty(5, 2, '').kind).toBe('hidden');
  });
});
