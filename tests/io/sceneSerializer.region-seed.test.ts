/**
 * tests/io/sceneSerializer.region-seed.test.ts —— RegionStyle.seed 与散布覆写
 * 序列化测试（T003.3，D18：默认值省略、版本保持 2.0）。
 *
 * 锁定：
 * - style.seed 与 scatter.* 覆写（含 assets 整表 / scaleRange 嵌套对象）往返深相等；
 * - 旧场景（style 无 seed 键）反序列化宽容通过、seed 为 undefined（增量放行不破坏存量）；
 * - seed 缺省省略：序列化产物不含 "seed" 键（默认值省略通道）；
 * - 版本保持 '2.0'（不升版本、不建迁移）。
 */
import { describe, expect, it } from 'vitest';
import { createId } from '../../src/core/id';
import { isRegionObject } from '../../src/domain/regions';
import type { RegionObject } from '../../src/domain/regions';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import type { SceneData } from '../../src/scene/SceneData';

function makeScatterRegion(style: RegionObject['style']): RegionObject {
  return {
    id: createId('region'),
    type: 'region',
    name: '林地',
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
        { x: 60, y: 0 },
        { x: 60, y: 40 },
        { x: 0, y: 40 },
      ],
      baseHeight: 0,
      closed: true,
    },
    semantic: { type: 'grass', properties: {} },
    style,
  };
}

function makeSceneData(objects: SceneData['objects']): SceneData {
  return {
    version: '2.0',
    id: createId('scene'),
    name: '散布场景',
    environment: { preset: 'day' },
    layers: [],
    objects,
  };
}

describe('SceneSerializer：RegionStyle.seed 与散布覆写（D18）', () => {
  it('seed + scatter.* 覆写（含 assets 整表 / scaleRange）往返深相等', () => {
    const style = {
      presetId: 'grass.woodland',
      overrides: {
        'scatter.densityPerM2': 0.03,
        'scatter.clustering': 0.6,
        'scatter.assets': [
          { assetId: 'asset_oak', weight: 40 },
          { assetId: 'asset_pine', weight: 20 },
        ],
        'scatter.scaleRange': { min: 0.8, max: 1.2 },
      },
      seed: 812743,
    };
    const serializer = new SceneSerializer();
    const restored = serializer.deserialize(
      serializer.serialize(makeSceneData([makeScatterRegion(style)])),
    );
    expect(restored.version).toBe('2.0');
    const region = restored.objects[0] as RegionObject;
    expect(region.style).toEqual(style);
    expect(isRegionObject(region)).toBe(true);
  });

  it('旧场景（style 无 seed、无 scatter 覆写）宽容加载，seed 为 undefined', () => {
    const legacyJson = JSON.stringify({
      version: '2.0',
      id: 'scene_old',
      name: '存量场景',
      environment: { preset: 'day' },
      layers: [],
      objects: [
        {
          id: 'region_old',
          type: 'region',
          name: '旧区域',
          parentId: null,
          layerId: null,
          visible: true,
          locked: false,
          transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
          properties: {},
          shape: {
            type: 'rectangle',
            points: [
              { x: 0, y: 0 },
              { x: 30, y: 0 },
              { x: 30, y: 20 },
              { x: 0, y: 20 },
            ],
            baseHeight: 0,
            closed: true,
          },
          semantic: { type: 'grass', properties: {} },
          style: { presetId: 'grass.lawn', overrides: { color: '#5da45a' } },
          metadata: {},
        },
      ],
    });
    const restored = new SceneSerializer().deserialize(legacyJson);
    const region = restored.objects[0] as RegionObject;
    expect(region.style.seed).toBeUndefined();
    expect(region.style.overrides).toEqual({ color: '#5da45a' });
  });

  it('seed 缺省省略：无 seed 的 style 序列化产物不含 "seed" 键', () => {
    const serializer = new SceneSerializer();
    const json = serializer.serialize(
      makeSceneData([makeScatterRegion({ presetId: 'grass.lawn', overrides: {} })]),
    );
    expect(json).not.toContain('"seed"');
    // 往返后仍无 seed（undefined 不落盘）
    const restored = serializer.deserialize(json);
    expect((restored.objects[0] as RegionObject).style.seed).toBeUndefined();
  });
});
