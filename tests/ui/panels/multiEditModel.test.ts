/**
 * tests/ui/panels/multiEditModel.test.ts —— Inspector 多选批量编辑模型纯函数测试
 * （T7.5 先测后码）。
 *
 * 覆盖：
 * - convergeValues：全同 → 收敛值；有异 → MIXED；空输入 → undefined；
 * - multiEditFieldsOf：通用组字段（图层/可见/锁定）求取与 Mixed 差异检测；
 *   region+model 混选 → region 组 null；同语义 region 多选 → region 组收敛
 *  （semanticType / 语义参数逐键 / baseHeight / presetId）；异语义 region → null；
 * - convergePresetParams：presetId 收敛 → 逐键收敛值（默认 < overrides 合成语义）；
 *   presetId 有异 → null（面板不显示预设参数表单）；
 * - 批量命令序列（一条历史，一次 undo 全恢复）：图层 / 可见（复用组级开关规划）/
 *   语义参数（逐键提交，其余键各自保留）/ 基准高度（点列原样保留）/ 预设（同一
 *   RegionStyle 应用到全部）/ 语义类型切换（默认参数 + 自动归层 + 预设重置）；
 *   N=1 → 直接单命令（不包 Batch）。
 * 边界：node 环境纯逻辑（无 jsdom）；GUI 行为留阶段验收。
 */
import { describe, expect, it } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import type { Layer } from '../../../src/scene/Layer';
import { createRegionObject } from '../../../src/domain/regions';
import type { RegionObject, SemanticType } from '../../../src/domain/regions';
import type { StyleParameter } from '../../../src/domain/styles';
import type { ModelObject } from '../../../src/domain/assets';
import {
  MIXED,
  convergePresetParams,
  convergeValues,
  multiEditFieldsOf,
  multiRegionSectionsOf,
  batchBaseHeightCommand,
  batchLayerCommand,
  batchPresetCommand,
  batchPresetOverrideCommand,
  batchSemanticPropertyCommand,
  batchSemanticTypeCommand,
} from '../../../src/ui/panels/multiEditModel';
import { buildGroupToggleCommand } from '../../../src/ui/panels/outlinerModel';

const TRIANGLE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
] as const;

function makeRegion(semanticType: SemanticType, name: string): RegionObject {
  return createRegionObject({
    shape: { type: 'polygon', points: [...TRIANGLE], baseHeight: 0, closed: true },
    semanticType,
    name,
  });
}

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

/** 计数历史深度（undo 到底）后全部 redo 还原 */
function historyDepth(history: HistoryManager): number {
  let depth = 0;
  while (history.undo()) depth += 1;
  for (let i = 0; i < depth; i++) history.redo();
  return depth;
}

function makeLayer(name: string): Layer {
  return { id: `layer_${name}`, name, visible: true, locked: false, opacity: 1, order: 0, objectIds: [] };
}

describe('convergeValues（差异检测）', () => {
  it('全同 → 收敛值', () => {
    expect(convergeValues([3, 3, 3])).toBe(3);
    expect(convergeValues(['a', 'a'])).toBe('a');
    expect(convergeValues([true])).toBe(true);
    expect(convergeValues([null, null])).toBe(null);
  });

  it('有异 → MIXED', () => {
    expect(convergeValues([3, 3, 4])).toBe(MIXED);
    expect(convergeValues([null, 'layer_1'])).toBe(MIXED);
    expect(convergeValues([false, true, false])).toBe(MIXED);
  });

  it('空输入 → undefined', () => {
    expect(convergeValues([])).toBeUndefined();
  });
});

describe('multiEditFieldsOf（公共字段求取）', () => {
  it('通用组：图层/可见/锁定全同收敛、有异 MIXED', () => {
    const a = makeRegion('building', 'A');
    const b = makeRegion('building', 'B');
    a.layerId = 'layer_1';
    b.layerId = 'layer_1';
    a.visible = false;
    const fields = multiEditFieldsOf([a, b]);
    expect(fields.count).toBe(2);
    expect(fields.layerId).toBe('layer_1');
    expect(fields.visible).toBe(MIXED);
    expect(fields.locked).toBe(false);
  });

  it('region + model 混选：region 组 null（只显示通用组）', () => {
    const fields = multiEditFieldsOf([makeRegion('building', 'A'), makeModel('树')]);
    expect(fields.region).toBeNull();
    expect(fields.layerId).toBe(null); // 均 null → 收敛
  });

  it('同语义 region 多选：semanticType 收敛 + 语义参数逐键 + baseHeight + presetId', () => {
    const a = makeRegion('building', 'A');
    const b = makeRegion('building', 'B');
    a.semantic.properties.height = 20;
    a.shape.baseHeight = 0.5;
    a.style.presetId = 'building.tower';

    const fields = multiEditFieldsOf([a, b]);
    const region = fields.region!;
    expect(region).not.toBeNull();
    expect(region.semanticType).toBe('building');
    expect(region.semanticParams.map((p) => `${p.key}:${p.value === MIXED ? 'MIXED' : p.value}`)).toEqual(['height:MIXED']);
    expect(region.baseHeight).toBe(MIXED);
    expect(region.presetId).toBe(MIXED);
  });

  it('同语义全同：各字段收敛（无 MIXED）', () => {
    const a = makeRegion('road', '路 1');
    const b = makeRegion('road', '路 2');
    const fields = multiEditFieldsOf([a, b]);
    const region = fields.region!;
    expect(region.semanticType).toBe('road');
    expect(region.semanticParams[0]!.value).toBe(6); // road.width 默认
    expect(region.baseHeight).toBe(0);
    expect(region.presetId).toBe('road.standard');
  });

  it('异语义 region 多选：region 组 null', () => {
    const fields = multiEditFieldsOf([makeRegion('building', 'A'), makeRegion('road', 'B')]);
    expect(fields.region).toBeNull();
  });

  it('语义参数缺失键按定义默认值参与收敛（有效值语义）', () => {
    const a = makeRegion('building', 'A');
    a.semantic.properties.height = 10; // 显式等于默认
    const b = makeRegion('building', 'B');
    delete b.semantic.properties.height; // 缺失 → 有效值 = 默认 10
    const fields = multiEditFieldsOf([a, b]);
    expect(fields.region!.semanticParams[0]!.value).toBe(10); // 收敛而非 MIXED
  });
});

describe('convergePresetParams（预设参数逐键收敛）', () => {
  const params: StyleParameter[] = [
    { key: 'color', label: '颜色', type: 'color', default: '#ff0000' },
    { key: 'intensity', label: '强度', type: 'number', default: 1, min: 0, max: 5 },
  ];

  it('presetId 收敛：逐键按 默认 < overrides 合成后收敛', () => {
    const a = makeRegion('water', 'A');
    const b = makeRegion('water', 'B');
    a.style.overrides = { color: '#00ff00' };
    b.style.overrides = { color: '#00ff00' };
    const fields = convergePresetParams([a, b], params)!;
    expect(fields).not.toBeNull();
    expect(fields[0]!.value).toBe('#00ff00'); // 双方同覆写 → 收敛覆写值
    expect(fields[1]!.value).toBe(1); // 双方未覆写 → 收敛默认值
  });

  it('presetId 有异 → null（不显示预设参数表单）', () => {
    const a = makeRegion('water', 'A');
    const b = makeRegion('water', 'B');
    b.style.presetId = 'water.flow';
    expect(convergePresetParams([a, b], params)).toBeNull();
  });
});

describe('批量命令序列（BatchCommand 一条历史，一次 undo 全恢复）', () => {
  function setup() {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    sceneManager.addLayer(makeLayer('建筑'));
    sceneManager.addLayer(makeLayer('图层 2'));
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });
    return { sceneManager, history };
  }

  it('batchLayerCommand：多对象改图层 → 一条历史；undo 一次全部还原（含各自不同 before）', () => {
    const { sceneManager, history } = setup();
    const a = makeRegion('building', 'A');
    const b = makeRegion('building', 'B');
    a.layerId = null;
    b.layerId = 'layer_建筑';
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    expect(history.execute(batchLayerCommand([a, b], 'layer_图层 2')!)).toBe(true);
    expect(a.layerId).toBe('layer_图层 2');
    expect(b.layerId).toBe('layer_图层 2');
    expect(historyDepth(history)).toBe(1); // 一条历史

    expect(history.undo()).toBe(true);
    expect(a.layerId).toBeNull(); // 各自 before 还原
    expect(b.layerId).toBe('layer_建筑');
    expect(history.canUndo()).toBe(false);
  });

  it('可见批量（组级开关规划复用）：一条历史，一次 undo 全恢复', () => {
    const { sceneManager, history } = setup();
    const objects = [makeRegion('grass', 'G1'), makeRegion('grass', 'G2'), makeRegion('grass', 'G3')];
    objects[0]!.visible = false;
    for (const obj of objects) sceneManager.addObject(obj);

    const cmd = buildGroupToggleCommand(objects, 'visible')!;
    expect(history.execute(cmd)).toBe(true);
    expect(objects.every((o) => o.visible)).toBe(true); // 任一未开 → 拉齐为开
    expect(historyDepth(history)).toBe(1);

    history.undo();
    expect(objects.map((o) => o.visible)).toEqual([false, true, true]);
  });

  it('batchSemanticPropertyCommand：逐键提交，其余键各自保留；undo 还原各对象原参数', () => {
    const { sceneManager, history } = setup();
    const a = makeRegion('building', 'A');
    const b = makeRegion('building', 'B');
    a.semantic.properties = { height: 10, floors: 3 };
    b.semantic.properties = { height: 20 };
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    const cmd = batchSemanticPropertyCommand([a, b], 'height', 30)!;
    expect(history.execute(cmd)).toBe(true);
    expect(a.semantic.properties).toEqual({ height: 30, floors: 3 }); // 其余键保留
    expect(b.semantic.properties).toEqual({ height: 30 });
    expect(a.semantic.type).toBe('building'); // 类型不动
    expect(historyDepth(history)).toBe(1);

    history.undo();
    expect(a.semantic.properties).toEqual({ height: 10, floors: 3 });
    expect(b.semantic.properties).toEqual({ height: 20 });
  });

  it('batchBaseHeightCommand：只替换 baseHeight，点列原样保留；一条历史', () => {
    const { sceneManager, history } = setup();
    const a = makeRegion('water', 'A');
    const b = makeRegion('water', 'B');
    a.shape.baseHeight = 0.18;
    b.shape.baseHeight = 0;
    const pointsA = a.shape.points.map((p) => ({ ...p }));
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    expect(history.execute(batchBaseHeightCommand([a, b], 0.5)!)).toBe(true);
    expect(a.shape.baseHeight).toBe(0.5);
    expect(b.shape.baseHeight).toBe(0.5);
    expect(a.shape.points).toEqual(pointsA); // 点列不动
    expect(b.shape.points).toEqual([...TRIANGLE]);
    expect(historyDepth(history)).toBe(1);

    history.undo();
    expect(a.shape.baseHeight).toBe(0.18);
    expect(b.shape.baseHeight).toBe(0);
  });

  it('batchPresetCommand：同一 RegionStyle 应用到全部；undo 还原各自原样式', () => {
    const { sceneManager, history } = setup();
    const a = makeRegion('plaza', 'A');
    const b = makeRegion('plaza', 'B');
    b.style.overrides = { color: '#123456' };
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    const next = { presetId: 'plaza.granite', overrides: { roughness: 0.4 } };
    expect(history.execute(batchPresetCommand([a, b], next)!)).toBe(true);
    expect(a.style).toEqual(next);
    expect(b.style).toEqual(next); // 同一份样式（深拷贝隔离）
    expect(a.style.overrides).not.toBe(next.overrides);
    expect(historyDepth(history)).toBe(1);

    history.undo();
    expect(a.style).toEqual({ presetId: 'plaza.paving', overrides: {} });
    expect(b.style).toEqual({ presetId: 'plaza.paving', overrides: { color: '#123456' } });
  });

  it('batchPresetOverrideCommand：逐键覆写，其余覆写键各自保留', () => {
    const { sceneManager, history } = setup();
    const a = makeRegion('grass', 'A');
    const b = makeRegion('grass', 'B');
    a.style.overrides = { color: '#00ff00' };
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    expect(history.execute(batchPresetOverrideCommand([a, b], 'density', 2)!)).toBe(true);
    expect(a.style.presetId).toBe('grass.lawn');
    expect(a.style.overrides).toEqual({ color: '#00ff00', density: 2 });
    expect(b.style.overrides).toEqual({ density: 2 });
    expect(historyDepth(history)).toBe(1);
  });

  it('batchPresetCommand / batchPresetOverrideCommand：各对象继承自身 seed（D18：批量换预设不洗散布种子）', () => {
    const { sceneManager, history } = setup();
    const a = makeRegion('grass', 'A');
    const b = makeRegion('grass', 'B');
    a.style.seed = 111;
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    // 换预设：载荷无 seed → a 保 111、b 无 seed（走派生）
    expect(history.execute(batchPresetCommand([a, b], { presetId: 'grass.woodland', overrides: {} })!)).toBe(true);
    expect(a.style).toEqual({ presetId: 'grass.woodland', overrides: {}, seed: 111 });
    expect(b.style).toEqual({ presetId: 'grass.woodland', overrides: {} });
    expect('seed' in b.style).toBe(false);

    history.undo();
    expect(a.style.seed).toBe(111);

    // 逐键覆写：seed 各自保留
    expect(history.execute(batchPresetOverrideCommand([a, b], 'scatter.densityPerM2', 0.05)!)).toBe(true);
    expect(a.style).toEqual({ presetId: 'grass.lawn', overrides: { 'scatter.densityPerM2': 0.05 }, seed: 111 });
    expect(b.style).toEqual({ presetId: 'grass.lawn', overrides: { 'scatter.densityPerM2': 0.05 } });

    // 载荷显式带 seed（如 seed 重掷批量）→ 以载荷为准
    expect(history.execute(batchPresetCommand([a, b], { presetId: 'x.y', overrides: {}, seed: 9 })!)).toBe(true);
    expect(a.style.seed).toBe(9);
    expect(b.style.seed).toBe(9);
  });

  it('batchSemanticTypeCommand：默认参数 + 自动归层 + 预设重置，一条历史整体回退', () => {
    const { sceneManager, history } = setup();
    sceneManager.addLayer(makeLayer('道路')); // 语义默认图层（按名查找归层）
    const a = makeRegion('unclassified', 'A');
    const b = makeRegion('unclassified', 'B');
    a.layerId = 'layer_建筑'; // 归层前各不相同
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    expect(history.execute(batchSemanticTypeCommand([a, b], 'road')!)).toBe(true);
    expect(a.semantic.type).toBe('road');
    expect(b.semantic.type).toBe('road');
    expect(a.semantic.properties).toEqual({ width: 6 }); // 新类型默认参数
    expect(a.layerId).toBe('layer_道路'); // 归入语义默认图层（按名查找）
    expect(a.style).toEqual({ presetId: 'road.standard', overrides: {} });
    expect(historyDepth(history)).toBe(1);

    history.undo();
    expect(a.semantic.type).toBe('unclassified');
    expect(a.layerId).toBe('layer_建筑');
    expect(b.layerId).toBeNull();
  });

  it('N=1 → 直接单命令（不包 Batch）', () => {
    const a = makeRegion('building', 'A');
    expect(batchLayerCommand([a], 'layer_x')!.name).toBe('ChangeLayerCommand');
    expect(batchSemanticPropertyCommand([a], 'height', 5)!.name).toBe('ChangeSemanticCommand');
    expect(batchBaseHeightCommand([a], 1)!.name).toBe('ChangeShapeCommand');
    expect(batchPresetCommand([a], { presetId: 'p', overrides: {} })!.name).toBe('ChangePresetCommand');
  });

  it('空对象列表 → null（不产生空历史）', () => {
    expect(batchLayerCommand([], null)).toBeNull();
    expect(batchSemanticPropertyCommand([], 'height', 5)).toBeNull();
    expect(batchBaseHeightCommand([], 1)).toBeNull();
    expect(batchPresetCommand([], { presetId: 'p', overrides: {} })).toBeNull();
    expect(batchPresetOverrideCommand([], 'k', 1)).toBeNull();
    expect(batchSemanticTypeCommand([], 'road')).toBeNull();
  });
});

// ── T8.3：异类型多选按 semantic.type 分节 ────────────────────

describe('multiRegionSectionsOf（异类型多选分节，T8.3）', () => {
  it('建筑×2 + 道路×1 → 两节：节头 label + 计数 + 节内字段各自收敛', () => {
    const b1 = makeRegion('building', '楼 1');
    const b2 = makeRegion('building', '楼 2');
    const r1 = makeRegion('road', '路 1');
    b1.semantic.properties.height = 20; // 建筑节高度 MIXED（20 vs 默认 10）
    b1.shape.baseHeight = 0.5; // 建筑节基准高度 MIXED（0.5 vs 0）

    const sections = multiRegionSectionsOf([b1, b2, r1]);
    expect(sections.map((s) => [s.semanticType, s.label, s.regions.length])).toEqual([
      ['building', '建筑', 2],
      ['road', '道路', 1],
    ]);
    // 节内字段 = 该节对象集的收敛（作用域不含其他节）
    expect(sections[0]!.fields.semanticType).toBe('building');
    expect(sections[0]!.fields.semanticParams[0]!.value).toBe(MIXED);
    expect(sections[0]!.fields.baseHeight).toBe(MIXED);
    expect(sections[0]!.regions).toEqual([b1, b2]);
    expect(sections[1]!.fields.semanticType).toBe('road');
    expect(sections[1]!.fields.semanticParams[0]!.value).toBe(6); // road.width 默认
    expect(sections[1]!.fields.baseHeight).toBe(0); // 道路节自身值收敛
  });

  it('节序 = 选中集中类型首次出现序（道路在前则道路节居首）', () => {
    const sections = multiRegionSectionsOf([
      makeRegion('road', '路'),
      makeRegion('building', '楼'),
      makeRegion('road', '路 2'),
    ]);
    expect(sections.map((s) => s.semanticType)).toEqual(['road', 'building']);
    expect(sections[0]!.regions.length).toBe(2);
    expect(sections[1]!.regions.length).toBe(1);
  });

  it('纯同类型多选 → 单节（与 T7.5 单 region 组行为等价，只多节头）', () => {
    const sections = multiRegionSectionsOf([
      makeRegion('building', '楼 1'),
      makeRegion('building', '楼 2'),
      makeRegion('building', '楼 3'),
    ]);
    expect(sections.length).toBe(1);
    expect(sections[0]!.label).toBe('建筑');
    expect(sections[0]!.regions.length).toBe(3);
    expect(sections[0]!.fields.semanticParams[0]!.value).toBe(10); // 全默认 → 收敛
  });

  it('region + model 混选 → 空节数组（语义节仅对全 region 选中集产出）', () => {
    expect(multiRegionSectionsOf([makeRegion('building', 'A'), makeModel('树')])).toEqual([]);
    expect(multiRegionSectionsOf([makeModel('树')])).toEqual([]);
    expect(multiRegionSectionsOf([])).toEqual([]);
  });

  it('multiEditFieldsOf 兼容：全 region 同类型仍产出单 region 组（等价单节）', () => {
    const fields = multiEditFieldsOf([makeRegion('road', '路 1'), makeRegion('road', '路 2')]);
    expect(fields.region).not.toBeNull();
    expect(fields.region!.semanticType).toBe('road');
  });

  it('multiEditFieldsOf：异语义 region 多选 region 组 null（分节归 multiRegionSectionsOf）', () => {
    const fields = multiEditFieldsOf([makeRegion('building', 'A'), makeRegion('road', 'B')]);
    expect(fields.region).toBeNull();
  });

  it('节作用域隔离：节 A 批量改参数不动节 B 对象（一条历史，undo 各自还原）', () => {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });
    const b1 = makeRegion('building', '楼 1');
    const b2 = makeRegion('building', '楼 2');
    const r1 = makeRegion('road', '路 1');
    for (const obj of [b1, b2, r1]) sceneManager.addObject(obj);

    const sections = multiRegionSectionsOf([b1, b2, r1]);
    const building = sections[0]!;
    // 建筑节改高度 → 只作用建筑节两对象
    expect(history.execute(batchSemanticPropertyCommand(building.regions, 'height', 50)!)).toBe(true);
    expect(b1.semantic.properties.height).toBe(50);
    expect(b2.semantic.properties.height).toBe(50);
    expect(r1.semantic.properties.width).toBe(6); // 道路节不动
    expect(historyDepth(history)).toBe(1); // 单条历史

    history.undo();
    expect(b1.semantic.properties.height).toBe(10);
    expect(b2.semantic.properties.height).toBe(10);
  });

  it('节内基准高度批量：作用域限节内对象', () => {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });
    const b1 = makeRegion('building', '楼 1');
    const r1 = makeRegion('road', '路 1');
    sceneManager.addObject(b1);
    sceneManager.addObject(r1);

    const [building] = multiRegionSectionsOf([b1, r1]);
    expect(history.execute(batchBaseHeightCommand(building!.regions, 2)!)).toBe(true);
    expect(b1.shape.baseHeight).toBe(2);
    expect(r1.shape.baseHeight).toBe(0); // 道路对象未被触碰（fixture 值原样）
    expect(historyDepth(history)).toBe(1);
  });
});
