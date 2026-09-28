/**
 * tests/io/sceneSerializer.model-preset.test.ts —— model 对象色卡 preset 序列化往返
 * 测试（T024.1，D44 #4）。
 *
 * 覆盖（序列化契约锁定：model 对象不做结构校验、整体透传——asset.preset 天然放行）：
 * - 带 preset 的 model 对象 serialize → deserialize 往返无损（字符串逐位一致）；
 * - 无 preset 的 model 对象往返后 asset 结构不带 preset 键（不变字段零变化——
 *   默认卡省略不落盘的旧场景零迁移面）；
 * - preset + seed 并存对象往返两字段俱在（同层字段互不干扰）。
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
    id: 'model_preset_1',
    type: 'model',
    name: '银杏',
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
    id: 'scene_preset',
    name: '色卡往返',
    environment: { preset: 'day' },
    layers: [layer],
    objects,
  };
  const restored = serializer.deserialize(serializer.serialize(data));
  return restored.objects as ModelObject[];
}

describe('SceneSerializer：model 对象 asset.preset 往返', () => {
  it('带 preset 的 model 对象往返无损（字符串逐位一致；JSON 文本含 preset 字段）', () => {
    const [obj] = roundtrip([
      modelOf({ assetId: 'asset_tree_ginkgo', preset: 'autumn' }),
    ]);
    expect(obj.asset.preset).toBe('autumn');
    expect(obj.asset.assetId).toBe('asset_tree_ginkgo');
    expect(serializer.serialize({
      version: '2.0',
      id: 'scene_preset',
      name: '色卡往返',
      environment: { preset: 'day' },
      layers: [layer],
      objects: [modelOf({ assetId: 'a', preset: 'autumn' })],
    })).toContain('"preset"');
  });

  it('无 preset 的 model 对象往返后 asset 不带 preset 键（默认卡省略——旧场景结构零变化）', () => {
    const [obj] = roundtrip([modelOf({ assetId: 'asset_tree_ginkgo' })]);
    expect('preset' in obj.asset).toBe(false);
    expect(obj.asset).toEqual({ assetId: 'asset_tree_ginkgo' });
  });

  it('preset 与 seed 并存往返两字段俱在（同层字段互不干扰）', () => {
    const [obj] = roundtrip([
      modelOf({ assetId: 'asset_tree_ginkgo', seed: 20260928, preset: 'autumn' }),
    ]);
    expect(obj.asset.seed).toBe(20260928);
    expect(obj.asset.preset).toBe('autumn');
  });
});
