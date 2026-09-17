/**
 * tests/io/sceneSerializer.region.test.ts —— RegionObject v2 序列化测试
 * （T6.1 过渡壳测试的 T6.9 v2 版：正式 v2 格式接管）。
 *
 * 锁定（任务书 A：v2 往返无损）：
 * - region 对象含 options 参数缓存、style.overrides、semantic.properties 业务参数、
 *   shape.baseHeight/closed、transform、metadata → serialize→deserialize 深相等；
 * - model 对象往返（持久化语义不变）；
 * - 环境（preset / grid / renderMode 扩展键）与图层往返；
 * - isRegionObject 守卫对往返产物判真（结构校验）。
 */
import { describe, expect, it } from 'vitest';
import { createId } from '../../src/core/id';
import type { ModelObject } from '../../src/domain/assets';
import { isRegionObject } from '../../src/domain/regions';
import type { RegionObject } from '../../src/domain/regions';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import type { SceneData } from '../../src/scene/SceneData';
import type { SceneObject } from '../../src/scene/SceneObject';

function makeRegion(): RegionObject {
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
      type: 'circle',
      points: [
        { x: 5, y: 0 },
        { x: 0, y: 5 },
        { x: -5, y: 0 },
        { x: 0, y: -5 },
      ],
      baseHeight: 0.18,
      closed: true,
      options: { radius: 5, segments: 64 },
    },
    semantic: { type: 'water', properties: {} },
    style: { presetId: 'water.standard', overrides: { opacity: 0.6 } },
  };
}

/** 含业务参数与 metadata 的建筑 region */
function makeBuildingRegion(): RegionObject {
  return {
    ...makeRegion(),
    id: createId('region'),
    name: '总部大楼',
    metadata: { layerName: '建筑' },
    transform: {
      position: { x: 3, y: 0.5, z: -7 },
      rotation: { x: 0, y: Math.PI / 6, z: 0 },
      scale: { x: 1, y: 2, z: 1 },
    },
    shape: {
      type: 'freehand',
      points: [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 40, y: 20 },
        { x: 0, y: 20 },
        { x: 0, y: 0 },
      ],
      baseHeight: 0,
      closed: true,
    },
    semantic: { type: 'building', properties: { height: 36 } },
    style: { presetId: 'building.default', overrides: { color: '#445566' } },
  };
}

/** model 对象（ModelObject 扩展 asset 引用字段；持久化语义不变） */
function makeModel(): ModelObject {
  return {
    id: 'model_tree_1',
    type: 'model',
    name: '行道树',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 1, y: 0, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    asset: { assetId: 'asset_tree' },
  };
}

function makeSceneData(objects: SceneObject[]): SceneData {
  return {
    version: '2.0',
    id: createId('scene'),
    name: '含区域的场景',
    environment: {
      preset: 'night',
      grid: { visible: false, size: 600, spacing: 2 },
      renderMode: 'wireframe',
    },
    layers: [
      {
        id: createId('layer'),
        name: '水面',
        visible: true,
        locked: false,
        opacity: 0.8,
        order: 0,
        objectIds: [],
      },
    ],
    objects,
  };
}

describe('SceneSerializer：RegionObject v2 往返无损', () => {
  it('三层字段（含 options 缓存 / overrides / 业务参数 / baseHeight / closed）深相等往返', () => {
    const region = makeRegion();
    const serializer = new SceneSerializer();

    const restored = serializer.deserialize(serializer.serialize(makeSceneData([region])));

    expect(restored.version).toBe('2.0');
    expect(restored.objects).toHaveLength(1);
    const restoredRegion = restored.objects[0] as RegionObject;
    expect(restoredRegion.type).toBe('region');
    expect(restoredRegion.id).toBe(region.id);
    expect(restoredRegion.name).toBe(region.name);
    expect(restoredRegion.shape).toEqual(region.shape);
    expect(restoredRegion.semantic).toEqual(region.semantic);
    expect(restoredRegion.style).toEqual(region.style);
    // options 缓存参数（JSON 对象形态）往返保持
    expect(restoredRegion.shape.options).toEqual({ radius: 5, segments: 64 });
  });

  it('含 transform / metadata / semantic.properties 业务参数的 region 深相等往返', () => {
    const building = makeBuildingRegion();
    const serializer = new SceneSerializer();
    const restored = serializer.deserialize(serializer.serialize(makeSceneData([building]))) as SceneData;
    expect(restored.objects[0]).toEqual(building);
    const restoredBuilding = restored.objects[0] as RegionObject;
    expect(restoredBuilding.transform).toEqual(building.transform);
    expect(restoredBuilding.metadata).toEqual({ layerName: '建筑' });
    expect(restoredBuilding.semantic.properties).toEqual({ height: 36 });
  });

  it('model 对象往返（持久化语义不变）', () => {
    const serializer = new SceneSerializer();
    const restored = serializer.deserialize(serializer.serialize(makeSceneData([makeModel()])));
    expect(restored.objects).toHaveLength(1);
    expect(restored.objects[0]).toEqual(makeModel());
  });

  it('环境（preset / grid / renderMode）与图层往返', () => {
    const serializer = new SceneSerializer();
    const data = makeSceneData([makeRegion()]);
    const restored = serializer.deserialize(serializer.serialize(data));
    expect(restored.environment).toEqual(data.environment);
    expect(restored.layers).toEqual(data.layers);
  });

  it('往返产物经 isRegionObject 结构校验判真；model 判假', () => {
    const serializer = new SceneSerializer();
    const restored = serializer.deserialize(
      serializer.serialize(makeSceneData([makeRegion(), makeModel()])),
    );
    expect(isRegionObject(restored.objects[0]!)).toBe(true);
    expect(isRegionObject(restored.objects[1]!)).toBe(false);
  });
});
