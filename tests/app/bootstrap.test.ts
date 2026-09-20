/**
 * tests/app/bootstrap.test.ts —— 组合根 createEditor 装配测试。
 *
 * 覆盖（T6.9 v2 收口：ElementRegistry/StyleRegistry 已随旧契约类型面删除，注册表
 * 装配仅余资产/工具/命令/预设；默认图层翻转断言见 tests/app/defaultLayers.semantic.test.ts；
 * v1 拒读与对象类型 fail-fast 见 tests/io/SceneSerializer.test.ts）：
 * - createDefaultSceneData：version 2.0、默认环境「白天」(day)、11 个默认图层
 *   （十类语义 + 模型；layer_ 前缀 + order 递增）；
 * - ENVIRONMENT_PRESETS：白天/傍晚/夜景/科技 四预设表，默认 day；
 * - createEditor：注册表装配（资产 / 11 工具 / 命令工厂 / 预设注册表）、
 *   EditorFacade 结构齐全；环境预设可配置；eventBus 注入后
 *   可观察 tool:changed / history:changed；七形状绘制工具可激活；网格配置走环境通道
 *   （getGrid/setGrid ↔ environment.grid ↔ 绘制吸附步长共享对象）；
 * - 缺省 Port（无头且未注入）：工具可激活、放置在无地面投影时不落对象且不抛错；
 * - resolveLayerFor / importElements：metadata.layerName 优先 → 类型默认表（仅 model）→
 *   null；批量导入合并为一条历史；
 * - registerAssets：幂等（重复 id 跳过）；
 * - openScene：全量替换（对象/图层/环境/场景 id·name）、清历史与选中；saveScene 可被
 *   SceneSerializer 反解；
 * - dispose：幂等。
 */
import { describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { ID } from '../../src/core/types';
import type { ModelAsset } from '../../src/domain/assets';
import type { SceneData } from '../../src/scene/SceneData';
import { coerceRenderMode } from '../../src/scene/SceneData';
import type { SceneObject } from '../../src/scene/SceneObject';
import type { Command } from '../../src/editor/commands/Command';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import {
  DEFAULT_ENVIRONMENT_PRESET,
  DEFAULT_LAYER_NAMES,
  ENVIRONMENT_PRESETS,
  createDefaultSceneData,
  createEditor,
  defaultLayerIdFor,
  importElements,
  registerAssets,
  resolveLayerFor,
} from '../../src/app/bootstrap';

const treeAsset: ModelAsset = {
  id: 'asset_tree',
  name: '树',
  category: 'plant',
  file: 'models/plant/tree.glb',
  tags: ['tree'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
};

/** 构造通用 SceneObject 夹具（type 可换；History/选中联动等通用路径消费） */
function makeObject(type = 'region', overrides: Partial<SceneObject> = {}): SceneObject {
  const obj: SceneObject = {
    id: createId('region'),
    type,
    name: '对象',
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
    ...overrides,
  };
  // v2（T6.9）：region 对象须 shape/semantic/style 三层齐备（SceneSerializer 反序列化
  // fail-fast 校验；serialize→deserialize 往返的用例依赖本夹具结构合法）
  if (type === 'region') {
    Object.assign(obj, {
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 3 },
          { x: 0, y: 0 },
        ],
        baseHeight: 0,
        closed: true,
      },
      semantic: { type: 'unclassified', properties: {} },
      style: { presetId: 'default_solid', overrides: {} },
    });
  }
  return obj;
}

/** 构造非 region 类型对象夹具（归层规则的外部类型路径；T6.9：v1 Element 已删） */
function makeElement(type = 'external_import', layerId: ID | null = null): SceneObject {
  return {
    ...makeObject(type),
    id: createId('element'),
    layerId,
  };
}

describe('createDefaultSceneData', () => {
  it('version 2.0 + 默认环境 day + 11 个默认图层（十语义 + 模型；order 递增、layer_ 前缀）', () => {
    const data = createDefaultSceneData('测试场景');
    expect(data.version).toBe('2.0');
    expect(data.id).toMatch(/^scene_/);
    expect(data.name).toBe('测试场景');
    expect(data.environment).toEqual({ preset: 'day' });
    expect(data.objects).toEqual([]);
    expect(data.layers.map((l) => l.name)).toEqual([
      '未分类', '水面', '绿地', '广场', '停车场', '裸地', '道路', '建筑', 'POI', '自定义', '模型',
    ]);
    data.layers.forEach((layer, i) => {
      expect(layer.id).toMatch(/^layer_/);
      expect(layer.order).toBe(i);
      expect(layer.objectIds).toEqual([]);
      expect(layer).toMatchObject({ visible: true, locked: false, opacity: 1 });
    });
    expect(DEFAULT_LAYER_NAMES).toHaveLength(11);
  });

  it('每次调用生成全新 id（图层/场景不共享）', () => {
    const a = createDefaultSceneData();
    const b = createDefaultSceneData();
    expect(a.id).not.toBe(b.id);
    expect(a.layers[0].id).not.toBe(b.layers[0].id);
  });
});

describe('ENVIRONMENT_PRESETS', () => {
  it('白天/傍晚/夜景/科技 四预设，默认 day', () => {
    expect(ENVIRONMENT_PRESETS.map((p) => p.id)).toEqual(['day', 'dusk', 'night', 'tech']);
    expect(ENVIRONMENT_PRESETS.map((p) => p.label)).toEqual(['白天', '傍晚', '夜景', '科技']);
    expect(DEFAULT_ENVIRONMENT_PRESET).toBe('day');
  });
});

describe('createEditor（无头装配）', () => {
  it('EditorFacade 结构齐全，注册表装配（资产 + 工具 + 命令 + 预设；T6.9 删 elements/styles）', () => {
    const facade = createEditor(null, { assets: [treeAsset] });
    expect(facade.scene).toBeDefined();
    expect(facade.selection).toBeDefined();
    expect(facade.history).toBeDefined();
    expect(facade.tools).toBeDefined();
    expect(facade.registries.assets.get('asset_tree')).toEqual({ kind: 'file', asset: treeAsset });
    expect(facade.registries.tools.list().map((t) => t.id).sort()).toEqual([
      'draw-circle',
      'draw-ellipse',
      'draw-freehand',
      'draw-line',
      'draw-point',
      'draw-polygon',
      'draw-rectangle',
      'measure.angle',
      'measure.area',
      'measure.distance',
      'measure.height',
      'placement',
      'road-split',
      'select',
      'transform',
      'vertex-edit',
    ]);
    // 预设注册表：插件 meta eager 收割（21 套）
    expect(facade.registries.presets.list().length).toBeGreaterThan(0);
    // 命令工厂：全部注册类型均可经 CommandRegistry 构造
    const created = facade.registries.commands.create('ChangePropertyCommand', {
      objectId: 'element_x',
      patch: { height: 1 },
    }) as Command;
    expect(created.name).toBe('ChangePropertyCommand');
    expect(typeof created.execute).toBe('function');
    for (const type of [
      'CreateObjectCommand', 'DeleteObjectCommand', 'TransformCommand', 'ChangePropertyCommand',
      'ChangeLayerCommand', 'BatchCommand', 'UpdateObjectCommand', 'UpdateLayerCommand',
      'ChangeShapeCommand', 'ChangeSemanticCommand', 'ChangePresetCommand',
    ]) {
      expect(() => facade.registries.commands.create(type, minimalCommandData(type))).not.toThrow();
    }
    // 未注册命令类型抛错（v1 两条 Element 语义命令已于 T6.7 退役——未注册即落入本规则）
    expect(() => facade.registries.commands.create('ChangeLegacyStyleCommand', {})).toThrow();
    facade.dispose();
  });

  it('环境预设可配置并随保存写出', () => {
    const facade = createEditor(null, { environment: { preset: 'night' } });
    const data = JSON.parse(facade.saveScene()) as SceneData;
    expect(data.environment.preset).toBe('night');
    facade.dispose();
  });

  it('注入 eventBus 后可观察 tool:changed 与 history:changed', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus, assets: [treeAsset] });
    const toolEvents: Array<string | null> = [];
    const historyEvents: boolean[] = [];
    eventBus.on('tool:changed', (p) => toolEvents.push(p.toolId));
    eventBus.on('history:changed', (p) => historyEvents.push(p.canUndo));

    facade.tools.activate('select');
    facade.tools.deactivate();
    expect(toolEvents).toEqual(['select', null]);

    importElements(facade, [makeElement()]);
    expect(historyEvents).toEqual([true]);
    facade.dispose();
  });

  it('缺省 Port：工具可激活；放置在无地面投影处不落对象、不抛错', () => {
    const facade = createEditor(null, { assets: [treeAsset] });
    facade.tools.activate('placement', { assetId: 'asset_tree' });
    const tool = facade.tools.getActiveTool()!;
    expect(() => {
      tool.onPointerMove({ screenX: 1, screenY: 1, button: 'left', ctrlKey: false, shiftKey: false, altKey: false });
      tool.onPointerDown({ screenX: 1, screenY: 1, button: 'left', ctrlKey: false, shiftKey: false, altKey: false });
    }).not.toThrow();
    expect(facade.scene.getObjects()).toEqual([]);
    facade.tools.cancel();
    expect(facade.tools.getActiveTool()).toBeNull();
    facade.dispose();
  });
});

describe('归层规则 resolveLayerFor / importElements', () => {
  it('metadata.layerName 命中图层名优先；否则按类型默认表（仅 model）；未知类型 → null', () => {
    const facade = createEditor(null);
    const layers = facade.scene.getLayers();
    const byName = (name: string) => layers.find((l) => l.name === name)!.id;

    // metadata.layerName 命中：任意类型对象按名归层
    const named = makeElement('external_import');
    named.metadata = { layerName: '水面' };
    expect(resolveLayerFor(facade.scene, named)).toBe(byName('水面'));

    // 名称未命中 → 类型默认表回退：外部导入类型无表项 → null
    const miss = makeElement('external_import');
    miss.metadata = { layerName: '不存在的图层' };
    expect(resolveLayerFor(facade.scene, miss)).toBeNull();

    // 类型默认表直查（UI 激活放置工具时传入 PlacementParams.layerId）
    expect(defaultLayerIdFor(facade.scene, 'model')).toBe(byName('模型'));
    expect(defaultLayerIdFor(facade.scene, 'alien')).toBeNull();

    // 已有 layerId 的对象保持原图层
    const kept = makeElement('external_import', byName('建筑'));
    expect(resolveLayerFor(facade.scene, kept)).toBe(byName('建筑'));
    facade.dispose();
  });

  it('importElements：空数组返回 false；多对象合并为一条历史；对象按 metadata.layerName 归层入场景', () => {
    const facade = createEditor(null);
    expect(importElements(facade, [])).toBe(false);
    expect(facade.history.canUndo()).toBe(false);

    const els: SceneObject[] = [
      makeElement('external_import'),
      { ...makeElement('external_import'), metadata: { layerName: '建筑' } },
    ];
    expect(importElements(facade, els)).toBe(true);
    expect(facade.scene.getObjects()).toHaveLength(2);
    const layerNames = facade.scene
      .getObjects()
      .map((o) => (o.layerId === null ? '未分层' : facade.scene.getLayer(o.layerId)!.name))
      .sort();
    expect(layerNames).toEqual(['建筑', '未分层']); // codepoint 序（建筑 U+5EFA < 未 U+672A）

    expect(facade.history.undo()).toBe(true); // 一次撤销整批
    expect(facade.scene.getObjects()).toEqual([]);
    expect(facade.history.undo()).toBe(false);
    facade.dispose();
  });
});

describe('绘制工具接线（T3.3；T6.5 七形状 { shape } 参数）', () => {
  it('七形状工具经 ToolManager 可激活（params { shape }），完成即回选择（三步流钩子）', () => {
    const facade = createEditor(null);
    facade.tools.activate('draw-line', { shape: 'line' });
    expect(facade.tools.getActiveTool()!.id).toBe('draw-line');
    facade.tools.activate('draw-rectangle', { shape: 'rectangle' });
    expect(facade.tools.getActiveTool()!.id).toBe('draw-rectangle');
    for (const shape of ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line'] as const) {
      const toolId = `draw-${shape === 'line' ? 'line' : shape}`;
      facade.tools.activate(toolId, { shape });
      expect(facade.tools.getActiveTool()!.id).toBe(toolId);
    }
    facade.dispose();
  });

  it('面/线工具完成提交后经钩子回选择工具（T6.5 三步流：创建 + 选中 + 回选择）', () => {
    // 注入可投影的 Fake viewport：三点击 + 双击闭合 → 场景 +1 RegionObject、
    // 自动选中、激活工具切回 select（组合根 setExitToSelect 钩子端到端）
    const points = new Map<string, { x: number; y: number; z: number }>([
      ['10,10', { x: 0, y: 0, z: 0 }],
      ['20,20', { x: 4, y: 0, z: 0 }],
      ['30,30', { x: 4, y: 0, z: 4 }],
    ]);
    const facade = createEditor(null, {
      ports: {
        viewport: {
          pickObject: () => null,
          groundPoint: (x: number, y: number) => points.get(`${x},${y}`) ?? null,
          surfacePoint: () => null,
        },
      },
    });
    facade.tools.activate('draw-polygon', { shape: 'polygon' });
    const info = (x: number, y: number) => ({
      screenX: x,
      screenY: y,
      button: 'left' as const,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    });
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerDown(info(10, 10));
    tool.onPointerDown(info(20, 20));
    tool.onDoubleClick?.(info(30, 30));

    const regions = facade.scene.getObjects((o) => o.type === 'region');
    expect(regions).toHaveLength(1);
    expect(facade.selection.getSelectedIds()).toEqual([regions[0]!.id]);
    expect(facade.tools.getActiveTool()!.id).toBe('select'); // 完成即回选择工具
    facade.dispose();
  });
});

describe('网格配置（环境通道，T3.3 主代理裁定）', () => {
  it('getGrid 缺省：environment.grid 未写入时回退 { visible, size, spacing=吸附步长 }', () => {
    const facade = createEditor(null);
    expect(facade.getEnvironment().grid).toBeUndefined();
    expect(facade.getGrid()).toEqual({ visible: true, size: 2000, spacing: 5 });
    facade.dispose();
  });

  it('setGrid：写入 environment.grid（随场景保存）并同步绘制吸附步长', () => {
    const facade = createEditor(null);
    facade.setGrid({ visible: false, size: 1000, spacing: 5 });
    expect(facade.getGrid()).toEqual({ visible: false, size: 1000, spacing: 5 });
    expect(facade.getEnvironment().grid).toEqual({ visible: false, size: 1000, spacing: 5 });
    expect(facade.drawGrid.spacing).toBe(5);
    const saved = JSON.parse(facade.saveScene()) as SceneData;
    expect(saved.environment.grid).toEqual({ visible: false, size: 1000, spacing: 5 });
    facade.dispose();
  });

  it('setGrid 非法值钳制：spacing/size 非法回退安全范围，不抛错', () => {
    const facade = createEditor(null);
    expect(() => facade.setGrid({ visible: true, size: Number.NaN, spacing: -3 })).not.toThrow();
    const grid = facade.getGrid();
    expect(Number.isFinite(grid.size)).toBe(true);
    expect(grid.spacing).toBeGreaterThan(0);
    facade.dispose();
  });

  it('openScene 恢复网格配置并同步吸附步长；缺 grid 键回退默认', () => {
    const facade = createEditor(null);
    const incoming = createDefaultSceneData('带网格');
    incoming.environment = { preset: 'night', grid: { visible: true, size: 600, spacing: 2 } };
    facade.openScene(incoming);
    expect(facade.getGrid()).toEqual({ visible: true, size: 600, spacing: 2 });
    expect(facade.drawGrid.spacing).toBe(2);

    const bare = createDefaultSceneData('无网格键');
    facade.openScene(bare);
    expect(facade.getGrid()).toEqual({ visible: true, size: 2000, spacing: 5 });
    expect(facade.drawGrid.spacing).toBe(5);
    facade.dispose();
  });
});

describe('程序化资产收割接线（T002.1，D7/D17）', () => {
  it('createEditor 自动注册 *.asset.ts 冒烟资产（kind=procedural），与 manifest GLB 同库混排', () => {
    const facade = createEditor(null, { assets: [treeAsset] });
    const descriptor = facade.registries.assets.get('asset_trashbin');
    expect(descriptor?.kind).toBe('procedural');
    expect(descriptor?.asset).toMatchObject({
      id: 'asset_trashbin',
      name: '垃圾桶',
      category: 'facility',
      tags: ['设施', '垃圾桶', 'trashbin'],
      variants: { scaleJitter: 0.1, rotationJitter: 180, hueJitter: 6 }, // D17：最大偏离半宽语义，002.3 消费
    });
    // GLB 条目回归零变化：同库可查、kind 正确
    expect(facade.registries.assets.get('asset_tree')?.kind).toBe('file');
    facade.dispose();
  });
});

describe('registerAssets', () => {
  it('幂等：重复 id 跳过，返回新增数量', () => {
    const facade = createEditor(null, { assets: [treeAsset] });
    // 假 GLB id 须避开真实资产 id 命名空间（manifest 的 asset_bench 与程序化的 asset_parkbench 等）
    const other: ModelAsset = { ...treeAsset, id: 'asset_pergola', name: '凉亭', category: 'public-facility' };
    expect(registerAssets(facade, [treeAsset, other])).toBe(1);
    // createEditor 内 manifest→procedural 收割先行（glob 按文件名序：植物 asset_* 前缀 < 设施裸名 h/p/s/t；
    // T008.1 增 DEV 资产 asset_seedstack——seedstack < shrub 字典序；T008.2 增 asset_tree_3a——
    // shrub < tree_3a 字典序；T011.1 增 asset_tree_celtis——tree_3a < tree_celtis 字典序；
    // T011.2 增 asset_tree_camphor——tree_3a < tree_camphor < tree_celtis 字典序），追加注册在后
    expect(facade.registries.assets.list().map((d) => d.asset.id)).toEqual([
      'asset_tree',
      'asset_flower',
      'asset_oak',
      'asset_pine',
      'asset_seedstack',
      'asset_shrub',
      'asset_tree_3a',
      'asset_tree_camphor',
      'asset_tree_celtis',
      'asset_hydrant',
      'asset_parkbench',
      'asset_signpost',
      'asset_streetlamp',
      'asset_trashbin',
      'asset_pergola',
    ]);
    facade.dispose();
  });
});

describe('openScene / saveScene', () => {
  it('openScene 全量替换：对象/图层/环境/场景 id·name；清历史与选中；再次保存一致', () => {
    const facade = createEditor(null);
    // 先制造脏状态
    const stray = makeObject('region');
    importElements(facade, [stray]);
    facade.selection.select(stray.id);
    expect(facade.history.canUndo()).toBe(true);

    // 构造外部场景文件
    const incoming = createDefaultSceneData('来自文件');
    incoming.environment = { preset: 'tech' };
    const obj = makeObject('region', { layerId: incoming.layers[0].id, name: '文件区域' });
    incoming.objects.push(obj);
    const json = new SceneSerializer().serialize(incoming);
    const parsed = new SceneSerializer().deserialize(json);

    facade.openScene(parsed);
    expect(facade.scene.getObjects().map((o) => o.name)).toEqual(['文件区域']);
    expect(facade.scene.getLayers().map((l) => l.id)).toEqual(incoming.layers.map((l) => l.id));
    expect(facade.scene.getLayer(incoming.layers[0].id)!.objectIds).toEqual([obj.id]);
    expect(facade.history.canUndo()).toBe(false);
    expect(facade.history.canRedo()).toBe(false);
    expect(facade.selection.getSelectedIds()).toEqual([]);

    const saved = JSON.parse(facade.saveScene()) as SceneData;
    expect(saved.id).toBe(incoming.id);
    expect(saved.name).toBe('来自文件');
    expect(saved.environment).toEqual({ preset: 'tech' });
    expect(saved.objects).toHaveLength(1);
    expect(new SceneSerializer().deserialize(facade.saveScene())).toEqual(saved);
    facade.dispose();
  });

  it('saveScene 产物与调用方数据不共享引用（后续修改不回写文件字符串）', () => {
    const facade = createEditor(null);
    const first = facade.saveScene();
    importElements(facade, [makeElement()]);
    expect(facade.saveScene()).not.toBe(first);
    expect(JSON.parse(first).objects).toEqual([]);
    facade.dispose();
  });

  it('诊断渲染档（T8.4 明确不做 #4）：会话级视口态不入场景文件——保存剥离 renderMode，重开回退 shaded；常规三态照旧往返', () => {
    const facade = createEditor(null);
    // 诊断三档：保存产物剥离 renderMode 键（JSON.stringify 自然丢弃 undefined）
    for (const mode of ['clay', 'normals', 'islands'] as const) {
      facade.setEnvironment({ ...facade.getEnvironment(), renderMode: mode });
      expect(facade.getEnvironment().renderMode).toBe(mode); // 会话态保留（视口当前诊断档）
      const saved = JSON.parse(facade.saveScene()) as SceneData;
      expect(saved.environment.renderMode).toBeUndefined();
      // 反序列化 → 归一回退 shaded
      const reopened = new SceneSerializer().deserialize(facade.saveScene());
      expect(coerceRenderMode(reopened.environment.renderMode)).toBe('shaded');
    }
    // 常规三态：照旧随场景文件往返
    for (const mode of ['shaded', 'wireframe', 'xray'] as const) {
      facade.setEnvironment({ ...facade.getEnvironment(), renderMode: mode });
      const reopened = new SceneSerializer().deserialize(facade.saveScene());
      expect(coerceRenderMode(reopened.environment.renderMode)).toBe(mode);
    }
    facade.dispose();
  });
});

describe('dispose（StrictMode 双挂载安全）', () => {
  it('dispose 幂等：重复调用不抛错', () => {
    const facade = createEditor(null);
    facade.dispose();
    expect(() => facade.dispose()).not.toThrow();
  });

  it('A→dispose(A)→B 序列（模拟 dev 下 StrictMode 双挂载）：B 完整可用，A 的销毁不殃及 B', () => {
    // 先建 A 并制造脏状态（有对象、有历史），随后彻底销毁
    const busA = new EventBus();
    const a = createEditor(null, { eventBus: busA });
    importElements(a, [makeElement()]);
    expect(a.scene.getObjects()).toHaveLength(1);
    a.dispose();
    a.dispose(); // 幂等

    // B 是全新装配：注册表/历史/选中/保存全部独立且功能完好
    const busB = new EventBus();
    const b = createEditor(null, { eventBus: busB });
    expect(b.scene.getObjects()).toHaveLength(0); // 不残留 A 的对象
    expect(b.history.canUndo()).toBe(false);

    const drawn = makeElement();
    expect(importElements(b, [drawn])).toBe(true);
    b.selection.select(drawn.id);
    expect(b.selection.getSelectedIds()).toEqual([drawn.id]);
    expect(JSON.parse(b.saveScene()).objects).toHaveLength(1);
    b.dispose();
  });
});

describe('对象消失清选中联动（T4.1 B2：组合根订阅 object:removed）', () => {
  /** 制造一个已入场景并选中的对象，返回其 id */
  function selectedObject(facade: ReturnType<typeof createEditor>): ID {
    const obj = makeObject('region');
    importElements(facade, [obj]);
    const id = facade.scene.getObjects()[0].id;
    facade.selection.select(id);
    expect(facade.selection.getSelectedIds()).toEqual([id]);
    return id;
  }

  it('裸 removeObject（非命令路径）→ 选中集同步清除 + 发 selection:changed（事件级断言）', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    const events: ID[][] = [];
    eventBus.on('selection:changed', (p) => events.push([...p.selectedIds]));

    const id = selectedObject(facade);
    facade.scene.removeObject(id); // 不经命令的移除路径（此前选中残留的缺口）

    expect(facade.selection.getSelectedIds()).toEqual([]);
    expect(events.at(-1)).toEqual([]); // store 桥据此回「未选中」
    facade.dispose();
  });

  it('撤销创建（history.undo → CreateObjectCommand.undo 移除对象）→ 选中集不含消失 id', () => {
    const facade = createEditor(null);
    selectedObject(facade);
    expect(facade.history.undo()).toBe(true);
    expect(facade.scene.getObjects()).toEqual([]);
    expect(facade.selection.getSelectedIds()).toEqual([]);
    facade.dispose();
  });

  it('多选时仅移除消失者，其余选中保留', () => {
    const facade = createEditor(null);
    const first = makeObject('region');
    const second = makeObject('model');
    importElements(facade, [first, second]);
    const ids = facade.scene.getObjects().map((o) => o.id);
    facade.selection.selectMany(ids);
    facade.scene.removeObject(ids[0]);
    expect(facade.selection.getSelectedIds()).toEqual([ids[1]]);
    facade.dispose();
  });

  it('未选中对象的移除 → 不发 selection:changed（无抖动）', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    let changed = 0;
    eventBus.on('selection:changed', () => {
      changed += 1;
    });
    importElements(facade, [makeObject('region')]);
    const id = facade.scene.getObjects()[0].id;
    facade.scene.removeObject(id); // 从未选中
    expect(changed).toBe(0);
    facade.dispose();
  });

  it('openScene 既有 selection.clear() 语义不回归（clear 不逐对象发事件，联动不干扰）', () => {
    const facade = createEditor(null);
    selectedObject(facade);
    facade.openScene(createDefaultSceneData('新场景'));
    expect(facade.selection.getSelectedIds()).toEqual([]);
    expect(facade.scene.getObjects()).toEqual([]);
    facade.dispose();
  });

  it('dispose 后订阅成对退订：裸移除不再清选中', () => {
    const facade = createEditor(null);
    const id = selectedObject(facade);
    facade.dispose();
    facade.scene.removeObject(id); // 订阅已随 dispose 移除
    expect(facade.selection.getSelectedIds()).toEqual([id]);
  });

  it('store 桥联动：object:removed → selection:changed → useEditorStore.selectedIds 回空（组件零改动）', async () => {
    const { useEditorStore } = await import('../../src/ui/store');
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    const detach = useEditorStore.getState().attach(facade, eventBus);

    const id = selectedObject(facade);
    expect(useEditorStore.getState().selectedIds).toEqual([id]);
    facade.scene.removeObject(id);
    expect(useEditorStore.getState().selectedIds).toEqual([]); // 属性面板数据源随之回「未选中」

    detach();
    facade.dispose();
  });
});

describe('无头 camera 空桩（T4.1 B3：NOOP Port 补 getMode）', () => {
  it('getMode 缺省返回 perspective；绘制工具激活/退出全程不抛错', () => {
    const facade = createEditor(null); // 无 Renderer 且未注入 ports → NOOP camera
    expect(facade.camera.getMode()).toBe('perspective');
    expect(() => {
      facade.tools.activate('draw-point', { shape: 'point' });
      facade.tools.deactivate();
    }).not.toThrow();
    facade.dispose();
  });
});

describe('无头 setMinimapVisible 空桩（T7.7：EditorHandle 超集小地图开关）', () => {
  it('无 Renderer 时安全 no-op 不抛错（浏览器形态接线归 GUI 验收 T7.8）', () => {
    const facade = createEditor(null);
    expect(typeof facade.setMinimapVisible).toBe('function');
    expect(() => facade.setMinimapVisible(false)).not.toThrow();
    expect(() => facade.setMinimapVisible(true)).not.toThrow();
    facade.dispose();
  });
});

/** 各命令工厂的最小合法数据（仅用于构造可行性断言，不执行） */
function minimalCommandData(type: string): unknown {
  const obj = {
    id: 'region_1',
    type: 'region',
    name: 'r',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
  };
  const regionExtras = {
    shape: { type: 'point', points: [], baseHeight: 0, closed: false },
    semantic: { type: 'unclassified', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
  };
  const region = { ...obj, ...regionExtras };
  switch (type) {
    case 'CreateObjectCommand':
      return { object: region };
    case 'DeleteObjectCommand':
      return { objectId: 'region_1' };
    case 'TransformCommand':
      return { objectId: 'region_1', before: obj.transform, after: obj.transform };
    case 'ChangePropertyCommand':
      return { objectId: 'region_1', patch: {} };
    case 'ChangeLayerCommand':
      return { objectId: 'region_1', layerId: null };
    case 'BatchCommand':
      return { commands: [] };
    case 'UpdateObjectCommand':
      return { objectId: 'region_1', patch: {} };
    case 'UpdateLayerCommand':
      return { layerId: 'layer_1', patch: {} };
    case 'ChangeShapeCommand':
      return { objectId: 'region_1', shape: regionExtras.shape };
    case 'ChangeSemanticCommand':
      return { objectId: 'region_1', semantic: regionExtras.semantic };
    case 'ChangePresetCommand':
      return { objectId: 'region_1', style: regionExtras.style };
    default:
      return {};
  }
}
