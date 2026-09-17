/**
 * tests/ui/panels/regionInspectorModel.test.ts —— RegionObject 四分组面板模型测试（T6.6，先测后码）。
 *
 * 覆盖（任务书四分组规格 + 解耦断言，纯逻辑层锁定命令载荷/模型函数）：
 * - sectionsForRegion：基础信息/几何/业务类型/表现样式 + 变换组（通用组保留），组头附注
 *   （几何 = 形状中文名、业务类型 = 语义中文名）；sectionsFor 按 isRegionObject 分派
 *   （region 走四分组，非 region 对象走通用组——T6.7 旧要素分支已删）；
 * - geometryFieldsFor：参数化编辑字段（矩形长宽/圆半径/椭圆两半轴，options 优先·bbox 反推）+
 *   基准高度 + 派生只读（顶点数/面积/周长——面类 polygonArea+闭合周长、线 polylineLength 作
 *   周长语义、点坐标只读）；
 * - 语义选项与载荷：semanticTypeOptions 十类下拉（SEMANTIC_DEFINITIONS 驱动）、
 *   semanticTypeChange（类型切换 = 默认参数整体替换）、semanticPropertyChange（参数变更 =
 *   仅 properties，类型不变走 ② 路径）；
 * - 预设选项与载荷：regionPresetOptions（find 双维过滤 + default_solid 兜底 + 缩略图/色样）、
 *   presetSelect（切换 = overrides 清空）、presetOverrideUpdate（改参 = presetId 不变的 update 路径）；
 * - resolvePresetValues：defaultParams 默认 < overrides 合成 + 数值 min/max 钳制；
 * - resolveRegionStyleTargets：四档作用域（当前对象/同类型=semantic.type/当前图层=layerId·
 *   未分层退化仅自身/同预设=presetId；仅 RegionObject 参与批量，非 region 对象排除；
 *   当前对象恒含且居首）；
 * - REGION_STYLE_SCOPE_OPTIONS：四档、第四档标签「同预设」；
 * - 解耦断言：①切类型载荷不含 shape 键（几何派生读数不变）；②切预设载荷不含 shape 键；
 *   ③参数改动保持 presetId 不变。
 * 边界：vitest node 纯逻辑（组件壳不渲染，GUI 行为留 T6.10 验收）。
 */
import { describe, expect, it } from 'vitest';
import { createId } from '../../../src/core/id';
import type { Layer } from '../../../src/scene/Layer';
import type { SceneObject } from '../../../src/scene/SceneObject';
import type { RegionObject, RegionShape, SemanticType, ShapeType } from '../../../src/domain/regions';
import { SEMANTIC_DEFINITIONS } from '../../../src/domain/regions';
import { getSemanticDefinition } from '../../../src/domain/regions';
import { sectionsFor } from '../../../src/ui/panels/inspectorModel';
import type { InspectorParamField } from '../../../src/ui/panels/inspectorModel';
import {
  REGION_STYLE_SCOPE_OPTIONS,
  geometryFieldsFor,
  parametricFieldsOf,
  presetOverrideUpdate,
  presetSeedUpdate,
  presetSelect,
  regionPresetOptions,
  resolvePresetValues,
  resolveRegionStyleTargets,
  semanticPropertyChange,
  semanticTypeChange,
  semanticTypeOptions,
  sectionsForRegion,
  withTargetSeed,
} from '../../../src/ui/panels/regionInspectorModel';
import type { RegionPresetSource } from '../../../src/ui/panels/regionInspectorModel';

// ── 夹具 ────────────────────────────────────────────────────

function makeRegion(overrides: Partial<RegionObject> = {}): RegionObject {
  return {
    id: createId('region'),
    type: 'region',
    name: '未命名区域 1',
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
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ],
      baseHeight: 0,
      closed: true,
    },
    semantic: { type: 'unclassified', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
    ...overrides,
  };
}

/** 非 region 探针对象（model：作用域过滤「仅 RegionObject」语义的对照基准） */
function makeModel(): SceneObject {
  return {
    id: createId('model'),
    type: 'model',
    name: '对照模型',
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
  } as unknown as SceneObject;
}

function makeLayer(id: string, name: string): Layer {
  return { id, name, visible: true, locked: false, opacity: 1, order: 0, objectIds: [] };
}

/** 预设注册表最小结构探针（find 双维过滤语义同 StylePresetRegistry） */
interface FakePreset {
  id: string;
  name: string;
  thumbnail?: string;
  supportedShapes: ShapeType[];
  supportedSemantics: SemanticType[];
  defaultParams: { key: string; default: unknown }[];
}

function makePresetSource(presets: FakePreset[]): RegionPresetSource {
  return {
    find: (shapeType: ShapeType, semanticType: SemanticType) =>
      presets.filter(
        (p) => p.supportedShapes.includes(shapeType) && p.supportedSemantics.includes(semanticType),
      ),
    get: (id: string) => presets.find((p) => p.id === id),
  };
}

/** 几何组字段按键取 */
function fieldOf(fields: InspectorParamField[], key: string): InspectorParamField | undefined {
  return fields.find((f) => f.key === key);
}

// ── 分组模型 ────────────────────────────────────────────────

describe('sectionsForRegion：region 四分组 + 变换组', () => {
  it('组序 = 基础信息/几何/业务类型/表现样式/变换；几何附注 = 形状中文名、业务类型附注 = 语义中文名', () => {
    const region = makeRegion();
    const sections = sectionsForRegion(region);
    expect(sections.map((s) => s.id)).toEqual([
      'region-basic',
      'region-geometry',
      'region-semantic',
      'region-style',
      'transform',
    ]);
    expect(sections.map((s) => s.label)).toEqual(['基础信息', '几何', '业务类型', '表现样式', '变换']);
    expect(sections.find((s) => s.id === 'region-geometry')!.hint).toBe('多边形');
    expect(sections.find((s) => s.id === 'region-semantic')!.hint).toBe('未分类');
    expect(sections.find((s) => s.id === 'transform')!.hint).toBe('m · deg');
  });

  it('形状/语义切换 → 组头附注跟随', () => {
    const circle = makeRegion({
      shape: { type: 'circle', points: [], baseHeight: 0, closed: true, options: { radius: 5 } },
      semantic: { type: 'road', properties: { width: 6 } },
    });
    const sections = sectionsForRegion(circle);
    expect(sections.find((s) => s.id === 'region-geometry')!.hint).toBe('圆形');
    expect(sections.find((s) => s.id === 'region-semantic')!.hint).toBe('道路');
  });

  it('几何组携带字段清单（fields），其余组无 fields', () => {
    const sections = sectionsForRegion(makeRegion());
    expect(sections.find((s) => s.id === 'region-geometry')!.fields).toBeDefined();
    for (const id of ['region-basic', 'region-semantic', 'region-style', 'transform'] as const) {
      expect(sections.find((s) => s.id === id)!.fields).toBeUndefined();
    }
  });
});

describe('sectionsFor：按 isRegionObject 分派', () => {
  it('region 对象 → 四分组模型（不走通用组分支；model 等走通用组见 inspectorModel.test）', () => {
    const sections = sectionsFor(makeRegion());
    expect(sections.map((s) => s.id)).toEqual([
      'region-basic',
      'region-geometry',
      'region-semantic',
      'region-style',
      'transform',
    ]);
  });
});

// ── 几何字段 ────────────────────────────────────────────────

describe('geometryFieldsFor / parametricFieldsOf：按形状类型产出', () => {
  it('矩形：宽度/长度参数 + 基准高度 + 顶点数/面积/周长派生', () => {
    const shape: RegionShape = {
      type: 'rectangle',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ],
      baseHeight: 0.18,
      closed: true,
      options: { width: 4, height: 3, centerX: 2, centerY: 1.5 },
    };
    const fields = geometryFieldsFor(shape);
    expect(fields.map((f) => f.key)).toEqual([
      'width',
      'height',
      'baseHeight',
      'derived:vertexCount',
      'derived:area',
      'derived:perimeter',
    ]);
    expect(fields[0]).toMatchObject({ kind: 'shape-param-number', label: '宽度', value: 4, min: 0.1, unit: 'm' });
    expect(fields[1]).toMatchObject({ kind: 'shape-param-number', label: '长度', value: 3 });
    expect(fieldOf(fields, 'baseHeight')).toMatchObject({
      kind: 'base-height-number',
      label: '基准高度',
      value: 0.18,
      min: 0,
      unit: 'm',
    });
    expect(fieldOf(fields, 'derived:vertexCount')).toMatchObject({
      kind: 'derived-number',
      label: '顶点数',
      value: 4,
      precision: 0,
    });
    expect(fieldOf(fields, 'derived:area')).toMatchObject({ kind: 'derived-number', label: '面积', value: 12, unit: 'm²' });
    // 闭合周长：折线长 + 闭合边
    expect(fieldOf(fields, 'derived:perimeter')).toMatchObject({ kind: 'derived-number', label: '周长', value: 14, unit: 'm' });
  });

  it('圆：半径参数（options 优先）；椭圆：长半轴/短半轴', () => {
    const circle = geometryFieldsFor({
      type: 'circle',
      points: [],
      baseHeight: 0,
      closed: true,
      options: { radius: 5, segments: 64 },
    });
    expect(parametricFieldsOf(circle).map((f) => `${f.key}:${f.label}`)).toEqual(['radius:半径']);

    const ellipse = geometryFieldsFor({ type: 'ellipse', points: [], baseHeight: 0, closed: true, options: { radiusX: 4, radiusY: 2, segments: 64 } });
    expect(parametricFieldsOf(ellipse).map((f) => `${f.key}:${f.label}`)).toEqual([
      'radiusX:长半轴',
      'radiusY:短半轴',
    ]);
  });

  it('多边形/自由形状：无参数化字段，仅基准高度 + 派生只读', () => {
    for (const type of ['polygon', 'freehand'] as const) {
      const fields = geometryFieldsFor({ type, points: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }], baseHeight: 0, closed: true });
      expect(parametricFieldsOf(fields)).toEqual([]);
      expect(fields.map((f) => f.key)).toEqual(['baseHeight', 'derived:vertexCount', 'derived:area', 'derived:perimeter']);
    }
  });

  it('路径（line）：无面积，周长 = polylineLength（周长语义）；点：坐标只读 x/z', () => {
    const line = geometryFieldsFor({
      type: 'line',
      points: [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ],
      baseHeight: 0,
      closed: false,
    });
    expect(line.map((f) => f.key)).toEqual(['baseHeight', 'derived:vertexCount', 'derived:perimeter']);
    expect(fieldOf(line, 'derived:perimeter')).toMatchObject({ value: 5 });

    const point = geometryFieldsFor({ type: 'point', points: [{ x: 12.5, y: -3.25 }], baseHeight: 0, closed: false });
    expect(point.map((f) => f.key)).toEqual(['baseHeight', 'derived:vertexCount', 'derived:coord']);
    expect(fieldOf(point, 'derived:coord')).toMatchObject({ kind: 'coord', label: '坐标', x: 12.5, y: -3.25 });
  });

  it('参数化初值缺失时按点列包围盒反推（options 优先）', () => {
    const circle = geometryFieldsFor({
      type: 'circle',
      points: [
        { x: -2, y: -1.5 },
        { x: 2, y: -1.5 },
        { x: 2, y: 1.5 },
        { x: -2, y: 1.5 },
      ],
      baseHeight: 0,
      closed: true,
    });
    expect(fieldOf(circle, 'radius')).toMatchObject({ value: 2 }); // max(4,3)/2
  });
});

// ── 业务类型 ────────────────────────────────────────────────

describe('业务类型：选项与命令载荷', () => {
  it('semanticTypeOptions：十类全量（SEMANTIC_DEFINITIONS 驱动，含未分类/自定义）', () => {
    const options = semanticTypeOptions();
    expect(options).toHaveLength(10);
    expect(options.map((o) => o.value)).toEqual(SEMANTIC_DEFINITIONS.map((d) => d.type));
    expect(options[0]).toEqual({ value: 'unclassified', label: '未分类' });
    expect(options).toContainEqual({ value: 'road', label: '道路' });
    expect(options).toContainEqual({ value: 'custom', label: '自定义' });
  });

  it('semanticTypeChange：类型切换载荷 = 新类型 + 该类默认参数（road.width=6 / building.height=10）', () => {
    expect(semanticTypeChange('road')).toEqual({ type: 'road', properties: { width: 6 } });
    expect(semanticTypeChange('building')).toEqual({ type: 'building', properties: { height: 10 } });
    expect(semanticTypeChange('water')).toEqual({ type: 'water', properties: {} });
  });

  it('semanticPropertyChange：参数变更载荷 = 类型不变 + properties 整体替换（② 路径）', () => {
    const semantic = { type: 'road' as SemanticType, properties: { width: 6 } };
    expect(semanticPropertyChange(semantic, 'width', 8)).toEqual({ type: 'road', properties: { width: 8 } });
    // 多参数类型整体替换（未提及键丢弃——面板以当前值集全量提交）
    const building = { type: 'building' as SemanticType, properties: { height: 10 } };
    expect(semanticPropertyChange(building, 'height', 24)).toEqual({ type: 'building', properties: { height: 24 } });
  });
});

// ── 表现样式 ────────────────────────────────────────────────

describe('表现样式：预设选项与命令载荷', () => {
  it('regionPresetOptions：find 双维过滤 + 缩略图/色样（defaultParams 的 color 默认值）', () => {
    const source = makePresetSource([
      {
        id: 'water.flow',
        name: '流动水面',
        thumbnail: 'data:image/svg+xml,…',
        supportedShapes: ['polygon', 'rectangle'],
        supportedSemantics: ['water'],
        defaultParams: [{ key: 'color', default: '#3a7ca5' }],
      },
      { id: 'water.standard', name: '标准水面', supportedShapes: ['polygon'], supportedSemantics: ['water'], defaultParams: [] },
    ]);
    const options = regionPresetOptions(source, 'polygon', 'water');
    expect(options).toEqual([
      { id: 'water.flow', name: '流动水面', thumbnail: 'data:image/svg+xml,…', color: '#3a7ca5' },
      { id: 'water.standard', name: '标准水面', color: undefined },
    ]);
  });

  it('regionPresetOptions：无命中回退 default_solid（沿快选条先例）；兜底也未注册 → 空数组', () => {
    const source = makePresetSource([
      {
        id: 'default_solid',
        name: '纯色',
        supportedShapes: [],
        supportedSemantics: [],
        defaultParams: [{ key: 'color', default: '#888888' }],
      },
    ]);
    expect(regionPresetOptions(source, 'line', 'poi')).toEqual([
      { id: 'default_solid', name: '纯色', color: '#888888' },
    ]);
    expect(regionPresetOptions(makePresetSource([]), 'line', 'poi')).toEqual([]);
  });

  it('presetSelect：切换预设 = overrides 清空', () => {
    expect(presetSelect('water.flow')).toEqual({ presetId: 'water.flow', overrides: {} });
  });

  it('presetSelect：seed 保留（D18：换 preset 不动 seed——undo 换回散布复原）；无 seed 不造键', () => {
    expect(presetSelect('grass.woodland', { presetId: 'grass.lawn', overrides: { color: '#111' }, seed: 42 })).toEqual({
      presetId: 'grass.woodland',
      overrides: {},
      seed: 42,
    });
    expect(presetSelect('water.flow', { presetId: 'grass.lawn', overrides: {} })).toEqual({
      presetId: 'water.flow',
      overrides: {},
    });
    // 非有限 seed（异常数据）不透传
    expect(
      presetSelect('water.flow', { presetId: 'x', overrides: {}, seed: Number.NaN }),
    ).toEqual({ presetId: 'water.flow', overrides: {} });
  });

  it('presetOverrideUpdate：参数改动 = presetId 不变（update 路径）+ overrides 合并', () => {
    const style = { presetId: 'base.flat', overrides: { color: '#ffffff', opacity: 0.8 } };
    expect(presetOverrideUpdate(style, 'opacity', 0.5)).toEqual({
      presetId: 'base.flat',
      overrides: { color: '#ffffff', opacity: 0.5 },
    });
    expect(presetOverrideUpdate({ presetId: 'base.flat', overrides: {} }, 'color', '#123456')).toEqual({
      presetId: 'base.flat',
      overrides: { color: '#123456' },
    });
  });

  it('presetOverrideUpdate：seed 原样透传（D18）；无 seed 不造键', () => {
    expect(
      presetOverrideUpdate({ presetId: 'grass.woodland', overrides: {}, seed: 7 }, 'scatter.densityPerM2', 0.03),
    ).toEqual({ presetId: 'grass.woodland', overrides: { 'scatter.densityPerM2': 0.03 }, seed: 7 });
    expect(presetOverrideUpdate({ presetId: 'a.b', overrides: {} }, 'color', '#fff')).toEqual({
      presetId: 'a.b',
      overrides: { color: '#fff' },
    });
  });

  it('presetSeedUpdate：seed 重掷载荷 = presetId/overrides 不动 + 新 seed（D18-5）', () => {
    expect(presetSeedUpdate({ presetId: 'grass.woodland', overrides: { 'scatter.clustering': 0.5 } }, 99)).toEqual({
      presetId: 'grass.woodland',
      overrides: { 'scatter.clustering': 0.5 },
      seed: 99,
    });
  });

  it('withTargetSeed：作用域应用继承目标自身 seed；payload 的 seed（当前对象透传）被丢弃（D18 区域私有）', () => {
    const payload = { presetId: 'grass.woodland', overrides: {}, seed: 1 };
    expect(withTargetSeed(payload, { presetId: 'x', overrides: {}, seed: 2 })).toEqual({
      presetId: 'grass.woodland',
      overrides: {},
      seed: 2,
    });
    // 目标无 seed → 省 key（走派生）
    expect(withTargetSeed(payload, { presetId: 'x', overrides: {} })).toEqual({
      presetId: 'grass.woodland',
      overrides: {},
    });
    // 目标 seed 非有限 → 同无 seed
    expect(withTargetSeed(payload, { presetId: 'x', overrides: {}, seed: Number.NaN })).toEqual({
      presetId: 'grass.woodland',
      overrides: {},
    });
  });

  it('resolvePresetValues：默认 < overrides 合成，数值受 min/max 钳制', () => {
    const params = [
      { key: 'color', label: '颜色', type: 'color' as const, default: '#3a7ca5' },
      { key: 'opacity', label: '不透明度', type: 'number' as const, default: 1, min: 0, max: 1, step: 0.05 },
      { key: 'segments', label: '分段', type: 'number' as const, default: 24, min: 8, max: 96 },
    ];
    expect(resolvePresetValues(params, undefined)).toEqual({ color: '#3a7ca5', opacity: 1, segments: 24 });
    expect(resolvePresetValues(params, { opacity: 0.4, color: '#111111' })).toEqual({
      color: '#111111',
      opacity: 0.4,
      segments: 24,
    });
    // 越界覆写钳制回区间
    expect(resolvePresetValues(params, { opacity: 2, segments: 4 })).toEqual({
      color: '#3a7ca5',
      opacity: 1,
      segments: 8,
    });
  });

  it('REGION_STYLE_SCOPE_OPTIONS：四档、第四档标签「同预设」（区别于 v1「全部使用该样式」）', () => {
    expect(REGION_STYLE_SCOPE_OPTIONS).toEqual([
      { value: 'object', label: '当前对象' },
      { value: 'type', label: '同类型对象' },
      { value: 'layer', label: '当前图层' },
      { value: 'style', label: '同预设' },
    ]);
  });
});

describe('resolveRegionStyleTargets：四档作用域（region 版过滤映射）', () => {
  const layerA = makeLayer('layer_a', '水面');
  const layerB = makeLayer('layer_b', '绿地');

  function scene(): SceneObject[] {
    return [
      makeRegion({ name: '当前·水面A·flow', layerId: layerA.id, semantic: { type: 'water', properties: {} }, style: { presetId: 'water.flow', overrides: {} } }),
      makeRegion({ name: '同类·水面B·std', layerId: layerB.id, semantic: { type: 'water', properties: {} }, style: { presetId: 'water.standard', overrides: {} } }),
      makeRegion({ name: '异类·草地A·flow', layerId: layerA.id, semantic: { type: 'grass', properties: {} }, style: { presetId: 'water.flow', overrides: {} } }),
      makeRegion({ name: '未分层·水面C', layerId: null, semantic: { type: 'water', properties: {} }, style: { presetId: 'water.standard', overrides: {} } }),
      makeModel(), // 非 region 对象：无 semantic 三层 → 一律排除
    ];
  }

  it('当前对象 = 仅自身', () => {
    const current = scene()[0]!;
    expect(resolveRegionStyleTargets('object', current, scene())).toEqual([current.id]);
  });

  it('同类型 = 过滤 semantic.type 相同（仅 RegionObject）；当前对象恒含且居首', () => {
    const objects = scene();
    const current = objects[0]!;
    const ids = resolveRegionStyleTargets('type', current, objects);
    const b = objects[1]!;
    const c = objects[3]!;
    expect(ids[0]).toBe(current.id);
    expect(ids).toEqual(expect.arrayContaining([current.id, b.id, c.id]));
    expect(ids).toHaveLength(3); // 草地对象与非 region 对象排除
  });

  it('当前图层 = 过滤 layerId 相同（仅 RegionObject）；未分层退化为仅自身', () => {
    const objects = scene();
    const current = objects[0]!; // layerA：自身 + 草地A（同层）
    const ids = resolveRegionStyleTargets('layer', current, objects);
    expect(ids).toEqual([current.id, objects[2]!.id]);

    const unlayered = objects[3]!;
    expect(resolveRegionStyleTargets('layer', unlayered, objects)).toEqual([unlayered.id]);
  });

  it('同预设 = 过滤 style.presetId 相同（仅 RegionObject）', () => {
    const objects = scene();
    const current = objects[0]!; // water.flow：自身 + 草地A
    expect(resolveRegionStyleTargets('style', current, objects)).toEqual([current.id, objects[2]!.id]);
  });
});

// ── 解耦断言（UI 级，纯逻辑层锁定）──────────────────────────

describe('解耦断言：三层互不触碰', () => {
  it('① 切类型载荷只含 type/properties——形状派生读数（几何组字段）不变', () => {
    const region = makeRegion({
      shape: {
        type: 'rectangle',
        points: [
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 3 },
          { x: 0, y: 3 },
        ],
        baseHeight: 0.12,
        closed: true,
        options: { width: 4, height: 3, centerX: 2, centerY: 1.5 },
      },
    });
    const before = geometryFieldsFor(region.shape);
    const payload = semanticTypeChange('water');
    // 载荷不含 shape/layerId/style 键（自动归层与样式重置由 ChangeSemanticCommand 内部完成）
    expect(Object.keys(payload)).toEqual(['type', 'properties']);
    // 模拟命令落库后（仅 semantic 层被替换）：几何字段逐值不变
    const after = makeRegion({ ...region, semantic: { type: payload.type, properties: payload.properties } });
    expect(geometryFieldsFor(after.shape)).toEqual(before);
  });

  it('② 切预设载荷只含 presetId/overrides——几何派生值不变', () => {
    const region = makeRegion();
    const before = geometryFieldsFor(region.shape);
    const payload = presetSelect('water.flow');
    expect(Object.keys(payload).sort()).toEqual(['overrides', 'presetId']);
    const after = makeRegion({ ...region, style: payload });
    expect(geometryFieldsFor(after.shape)).toEqual(before);
  });

  it('③ 参数改动保持 presetId 不变（update 路径而非重建）', () => {
    const style = { presetId: 'water.flow', overrides: { opacity: 0.9 } };
    const next = presetOverrideUpdate(style, 'opacity', 0.4);
    expect(next.presetId).toBe(style.presetId);
    expect(next.overrides).toEqual({ opacity: 0.4 });
  });

  it('语义定义完备：十类均可取到 label 与默认参数载荷（注册制驱动）', () => {
    for (const def of SEMANTIC_DEFINITIONS) {
      expect(getSemanticDefinition(def.type)).toBeDefined();
      expect(semanticTypeChange(def.type).type).toBe(def.type);
    }
  });
});
