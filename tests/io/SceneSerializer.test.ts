/**
 * tests/io/SceneSerializer.test.ts —— 场景序列化/反序列化测试（T1.7 验收标准；T6.9 v2 重写）。
 *
 * 覆盖（v2 格式，version '2.0' 唯一支持）：
 * - serialize→deserialize 往返深度一致（transform 逐字段 / properties / metadata / environment 扩展字段）；
 * - 版本门：v1 '1.0' 等旧版本拒读（错误含版本号、当前支持版本与「v1 旧格式已停止支持」提示）；
 *   未知版本（9.9）报错含版本号；缺少 version 抛错；
 * - v2 对象类型 fail-fast：type 合法值 region/model（消息含非法值与合法类型清单，路径定位）；
 * - region 三层结构校验：缺 shape/semantic/style、shape.type 非法 ShapeType、
 *   semantic.type 非法 SemanticType、shape.points 非数组 → 路径化错误；
 * - model 对象不做结构校验（持久化语义不变）；
 * - 缺 objects / layers 字段抛定位错误；类型错误（非数组/元素非对象）同样定位；
 * - 非法 JSON / 根不是对象抛错；
 * - 缺省字段（id/name/environment）宽容回退（v2 容器语义保持）。
 */
import { describe, expect, it } from 'vitest';
import type { ModelObject } from '../../src/domain/assets';
import type { RegionObject } from '../../src/domain/regions';
import type { Layer } from '../../src/scene/Layer';
import type { SceneData } from '../../src/scene/SceneData';
import { SceneSerializer } from '../../src/io';

/** 富场景夹具：2 图层 + 1 region + 1 model（region 含三层结构/非平凡 transform/metadata） */
function makeScene(): SceneData {
  const layerA: Layer = {
    id: 'layer_1', name: '建筑', visible: true, locked: false, opacity: 1, order: 0,
    objectIds: ['region_1'],
  };
  const layerB: Layer = {
    id: 'layer_2', name: '道路', visible: false, locked: true, opacity: 0.5, order: 1,
    objectIds: [],
  };
  const region: RegionObject = {
    id: 'region_1',
    type: 'region',
    name: '总部大楼',
    parentId: null,
    layerId: 'layer_1',
    visible: true,
    locked: false,
    transform: {
      position: { x: 1.5, y: 2, z: -2 },
      rotation: { x: 0, y: Math.PI / 4, z: 0 },
      scale: { x: 2, y: 1, z: 0.5 },
    },
    properties: { source: 'import', batch: 7 },
    shape: {
      type: 'circle',
      points: [{ x: 5, y: 0 }, { x: 0, y: 5 }, { x: -5, y: 0 }, { x: 0, y: -5 }],
      baseHeight: 0.06,
      closed: true,
      options: { radius: 5, segments: 64 },
    },
    semantic: { type: 'building', properties: { height: 36 } },
    style: { presetId: 'building.default', overrides: { color: '#334455', height: 30 } },
    metadata: { layerName: '建筑' },
  };
  const model: ModelObject = {
    id: 'model_tree_1',
    type: 'model',
    name: '行道树',
    parentId: null,
    layerId: null,
    visible: false,
    locked: true,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
    asset: { assetId: 'asset_tree' },
  };
  return {
    version: '2.0',
    id: 'scene_abc',
    name: '演示园区',
    environment: { preset: 'sunset', sunIntensity: 1.2, fog: { color: '#8899aa', near: 10 } },
    layers: [layerA, layerB],
    objects: [region, model],
  };
}

/** 构造一条 v2 合法 region 对象的原始 JSON 记录（供篡改字段的非法用例） */
function regionJson(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'region_x',
    type: 'region',
    name: '区域',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
    shape: { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }], baseHeight: 0, closed: true },
    semantic: { type: 'unclassified', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
    ...over,
  };
}

/** 场景 JSON 文本构造（objects 可为任意原始记录；version 缺省 '2.0'） */
function sceneJson(objects: unknown[], over: Record<string, unknown> = {}): string {
  return JSON.stringify({
    version: '2.0',
    id: 'scene_abc',
    name: '演示园区',
    environment: { preset: 'day' },
    layers: [],
    objects,
    ...over,
  });
}

describe('SceneSerializer · 往返一致性（验收标准）', () => {
  const serializer = new SceneSerializer();

  it('serialize → deserialize 整场景深度相等', () => {
    const restored = serializer.deserialize(serializer.serialize(makeScene()));
    expect(restored).toEqual(makeScene());
  });

  it('往返逐字段保持：transform 三个分量 / style.overrides / semantic.properties / metadata / 图层', () => {
    const restored = serializer.deserialize(serializer.serialize(makeScene()));
    const region = restored.objects[0] as RegionObject;
    expect(restored.version).toBe('2.0');
    expect(restored.id).toBe('scene_abc');
    expect(restored.name).toBe('演示园区');
    expect(region.transform.position).toEqual({ x: 1.5, y: 2, z: -2 });
    expect(region.transform.rotation).toEqual({ x: 0, y: Math.PI / 4, z: 0 });
    expect(region.transform.scale).toEqual({ x: 2, y: 1, z: 0.5 });
    expect(region.style.overrides).toEqual({ color: '#334455', height: 30 });
    expect(region.semantic.properties).toEqual({ height: 36 });
    expect(region.properties).toEqual({ source: 'import', batch: 7 });
    expect(region.metadata).toEqual({ layerName: '建筑' });
    expect(restored.layers).toEqual([
      { id: 'layer_1', name: '建筑', visible: true, locked: false, opacity: 1, order: 0, objectIds: ['region_1'] },
      { id: 'layer_2', name: '道路', visible: false, locked: true, opacity: 0.5, order: 1, objectIds: [] },
    ]);
  });

  it('environment 扩展字段（嵌套对象）完整保留', () => {
    const restored = serializer.deserialize(serializer.serialize(makeScene()));
    expect(restored.environment).toEqual({
      preset: 'sunset',
      sunIntensity: 1.2,
      fog: { color: '#8899aa', near: 10 },
    });
  });

  it('序列化产物是含 version "2.0" 的标准场景 JSON（对象/图层齐全）', () => {
    const json = JSON.parse(serializer.serialize(makeScene()));
    expect(json.version).toBe('2.0');
    expect(Array.isArray(json.objects)).toBe(true);
    expect(json.objects).toHaveLength(2);
    expect(json.layers).toHaveLength(2);
  });

  it('两次反序列化结果互不共享引用', () => {
    const json = serializer.serialize(makeScene());
    const a = serializer.deserialize(json);
    const b = serializer.deserialize(json);
    expect(a).toEqual(b);
    expect(a.objects[0]).not.toBe(b.objects[0]);
    expect(a.layers[0]).not.toBe(b.layers[0]);
  });
});

describe('SceneSerializer · 版本门（v1 拒读，T6.9 按需门裁决）', () => {
  const serializer = new SceneSerializer();

  it('v1 版本 "1.0" 拒读：错误含版本号、当前支持 2.0 与「v1 旧格式已停止支持」提示', () => {
    const v1 = sceneJson([regionJson()], { version: '1.0' });
    expect(() => serializer.deserialize(v1)).toThrow(/1\.0/);
    expect(() => serializer.deserialize(v1)).toThrow(/2\.0/);
    expect(() => serializer.deserialize(v1)).toThrow(/版本/);
    expect(() => serializer.deserialize(v1)).toThrow(/v1 旧格式已停止支持/);
  });

  it('其他未知版本（9.9）报错且信息包含版本号', () => {
    const bad = sceneJson([regionJson()], { version: '9.9' });
    expect(() => serializer.deserialize(bad)).toThrow(/9\.9/);
    expect(() => serializer.deserialize(bad)).toThrow(/版本/);
  });

  it('缺少 version 字段抛错（信息含 version）', () => {
    const bad = JSON.stringify({ ...JSON.parse(sceneJson([regionJson()])), version: undefined });
    expect(() => serializer.deserialize(bad)).toThrow(/version/);
  });
});

describe('SceneSerializer · v2 对象类型 fail-fast 校验（T6.9）', () => {
  const serializer = new SceneSerializer();

  it('未知对象类型（v1 旧要素 building）→ 报错：消息含非法值与合法类型清单，路径定位', () => {
    const bad = sceneJson([{ ...regionJson(), type: 'building' }]);
    expect(() => serializer.deserialize(bad)).toThrow(/building/);
    expect(() => serializer.deserialize(bad)).toThrow(/region\/model/);
    expect(() => serializer.deserialize(bad)).toThrow(/objects\[0\]\.type/);
  });

  it('marker 等其余旧类型同样拒读', () => {
    for (const type of ['road', 'green', 'water', 'parking', 'marker']) {
      expect(() => serializer.deserialize(sceneJson([{ ...regionJson(), type }]))).toThrow(
        /objects\[0\]\.type/,
      );
    }
  });

  it('objects 数组元素非对象 → 报错定位到下标', () => {
    expect(() => serializer.deserialize(sceneJson([null]))).toThrow(/objects\[0\]/);
    expect(() => serializer.deserialize(sceneJson([regionJson(), 42]))).toThrow(/objects\[1\]/);
  });

  it('model 对象不做结构校验：任意扩展字段原样透传（持久化语义不变）', () => {
    const model = {
      id: 'model_x',
      type: 'model',
      name: '模型',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      properties: {},
      asset: { assetId: 'asset_tree' },
      extra: { custom: true },
    };
    const restored = serializer.deserialize(sceneJson([model]));
    expect(restored.objects[0]).toEqual(model);
  });
});

describe('SceneSerializer · region 三层结构校验（路径化错误）', () => {
  const serializer = new SceneSerializer();

  it('缺 shape → 错误定位 objects[0].shape', () => {
    const { shape: _s, ...noShape } = regionJson();
    expect(() => serializer.deserialize(sceneJson([noShape]))).toThrow(/objects\[0\]\.shape/);
  });

  it('缺 semantic / style → 错误分别定位到对应字段', () => {
    const { semantic: _sem, ...noSemantic } = regionJson();
    expect(() => serializer.deserialize(sceneJson([noSemantic]))).toThrow(/objects\[0\]\.semantic/);
    const { style: _st, ...noStyle } = regionJson();
    expect(() => serializer.deserialize(sceneJson([noStyle]))).toThrow(/objects\[0\]\.style/);
  });

  it('shape.type 非法 ShapeType → 错误含非法值与合法值清单，路径 objects[0].shape.type', () => {
    const bad = regionJson({ shape: { type: 'circular', points: [], baseHeight: 0, closed: true } });
    expect(() => serializer.deserialize(sceneJson([bad]))).toThrow(/circular/);
    expect(() => serializer.deserialize(sceneJson([bad]))).toThrow(/objects\[0\]\.shape\.type/);
    expect(() => serializer.deserialize(sceneJson([bad]))).toThrow(/polygon/);
  });

  it('semantic.type 非法 SemanticType → 错误含非法值与合法值清单，路径 objects[0].semantic.type', () => {
    const bad = regionJson({ semantic: { type: 'river', properties: {} } });
    expect(() => serializer.deserialize(sceneJson([bad]))).toThrow(/river/);
    expect(() => serializer.deserialize(sceneJson([bad]))).toThrow(/objects\[0\]\.semantic\.type/);
    expect(() => serializer.deserialize(sceneJson([bad]))).toThrow(/unclassified/);
  });

  it('shape.points 非数组 → 错误定位 objects[0].shape.points', () => {
    const bad = regionJson({ shape: { type: 'polygon', points: '不是数组', baseHeight: 0, closed: true } });
    expect(() => serializer.deserialize(sceneJson([bad]))).toThrow(/objects\[0\]\.shape\.points/);
  });

  it('校验按序定位：第二个对象报 objects[1].type', () => {
    const bad = sceneJson([regionJson(), { ...regionJson(), id: 'region_y', type: 'marker' }]);
    expect(() => serializer.deserialize(bad)).toThrow(/objects\[1\]\.type/);
  });
});

describe('SceneSerializer · 缺字段定位错误（验收标准）', () => {
  const serializer = new SceneSerializer();

  it('缺少 objects 字段抛错，信息定位到 objects', () => {
    const bad = JSON.stringify({ ...JSON.parse(sceneJson([regionJson()])), objects: undefined });
    expect(() => serializer.deserialize(bad)).toThrow(/objects/);
  });

  it('缺少 layers 字段抛错，信息定位到 layers', () => {
    const bad = JSON.stringify({ ...JSON.parse(sceneJson([regionJson()])), layers: undefined });
    expect(() => serializer.deserialize(bad)).toThrow(/layers/);
  });

  it('objects / layers 类型错误（非数组）同样定位报错', () => {
    expect(() =>
      serializer.deserialize(sceneJson({ a: 1 } as unknown as unknown[])),
    ).toThrow(/objects/);
    expect(() =>
      serializer.deserialize(sceneJson([regionJson()], { layers: 42 })),
    ).toThrow(/layers/);
  });

  it('非法 JSON 字符串抛错', () => {
    expect(() => serializer.deserialize('这不是 JSON {{{')).toThrow(/JSON/);
  });

  it('根不是 JSON 对象抛错', () => {
    expect(() => serializer.deserialize('"hello"')).toThrow(/对象/);
    expect(() => serializer.deserialize('[1,2,3]')).toThrow(/对象/);
  });
});

describe('SceneSerializer · 缺省字段宽容回退', () => {
  const serializer = new SceneSerializer();

  it('缺 id/name/environment 时回退默认值（id 为 scene_ 前缀）', () => {
    const restored = serializer.deserialize(
      JSON.stringify({ version: '2.0', layers: [], objects: [] }),
    );
    expect(restored.version).toBe('2.0');
    expect(restored.id).toMatch(/^scene_/);
    expect(restored.name).toBe('未命名场景');
    expect(restored.environment).toEqual({ preset: 'day' });
    expect(restored.layers).toEqual([]);
    expect(restored.objects).toEqual([]);
  });

  it('environment 缺 preset 时同样回退默认环境', () => {
    const restored = serializer.deserialize(
      JSON.stringify({ version: '2.0', environment: {}, layers: [], objects: [] }),
    );
    expect(restored.environment).toEqual({ preset: 'day' });
  });
});
