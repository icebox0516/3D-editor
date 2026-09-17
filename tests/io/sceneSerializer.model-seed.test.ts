/**
 * tests/io/sceneSerializer.model-seed.test.ts —— model 对象变体 seed 序列化往返测试（T002.3）。
 *
 * 覆盖（序列化契约锁定：model 对象不做结构校验、整体透传——asset.seed 天然放行）：
 * - 带 seed 的 model 对象 serialize → deserialize 往返无损（数值逐位一致）；
 * - 无 seed 的 model 对象往返后 asset 结构不带 seed 键（不变字段零变化）；
 * - 负数 / 非整数 seed 同样透传（结构自由，语义归 domain/渲染侧）。
 */
import { describe, expect, it } from 'vitest';
import type { ModelObject } from '../../src/domain/assets';
import type { Layer } from '../../src/scene/Layer';
import type { SceneData } from '../../src/scene/SceneData';
import { SceneSerializer } from '../../src/io';

const serializer = new SceneSerializer();

const layer: Layer = {
  id: 'layer_models', name: '模型', visible: true, locked: false, opacity: 1, order: 0, objectIds: [],
};

function modelOf(asset: ModelObject['asset']): ModelObject {
  return {
    id: 'model_seed_1',
    type: 'model',
    name: '垃圾桶',
    parentId: null,
    layerId: 'layer_models',
    visible: true,
    locked: false,
    transform: {
      position: { x: 3, y: 0.03, z: -2 },
      rotation: { x: 0, y: 1.234, z: 0 },
      scale: { x: 0.97, y: 1.04, z: 0.97 },
    },
    properties: {},
    asset,
  };
}

function roundtrip(objects: ModelObject[]): ModelObject[] {
  const data: SceneData = {
    version: '2.0',
    id: 'scene_seed',
    name: 'seed 往返',
    environment: { preset: 'day' },
    layers: [layer],
    objects,
  };
  const restored = serializer.deserialize(serializer.serialize(data));
  return restored.objects as ModelObject[];
}

describe('SceneSerializer：model 对象 asset.seed 往返', () => {
  it('带 seed 的 model 对象往返无损（数值逐位一致；JSON 文本含 seed 字段）', () => {
    const [obj] = roundtrip([modelOf({ assetId: 'asset_trashbin', seed: 20260916 })]);
    expect(obj.asset.seed).toBe(20260916);
    expect(obj.asset.assetId).toBe('asset_trashbin');
    expect(serializer.serialize({
      version: '2.0',
      id: 'scene_seed',
      name: 'seed 往返',
      environment: { preset: 'day' },
      layers: [layer],
      objects: [modelOf({ assetId: 'a', seed: 7 })],
    })).toContain('"seed"');
  });

  it('无 seed 的 model 对象往返后 asset 不带 seed 键（GLB / 拖放对象结构零变化）', () => {
    const [obj] = roundtrip([modelOf({ assetId: 'asset_tree' })]);
    expect('seed' in obj.asset).toBe(false);
    expect(obj.asset).toEqual({ assetId: 'asset_tree' });
  });

  it('负数 / 非整数 seed 结构透传（结构自由——语义归渲染侧确定性复算）', () => {
    const [a, b] = roundtrip([
      modelOf({ assetId: 'x', seed: -42 }),
      modelOf({ assetId: 'y', seed: 3.5 }),
    ]);
    expect(a.asset.seed).toBe(-42);
    expect(b.asset.seed).toBe(3.5);
  });
});
