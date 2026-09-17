/**
 * tests/editor/factories/modelFactory.test.ts —— 模型对象共享工厂测试（先测后码，T5.5）。
 *
 * 覆盖：
 * - 对象结构确定性：type='model'、name=asset.name、visible=true、locked=false、
 *   properties={}、asset={assetId}、parentId=null、layerId 透传（含 null）；
 * - id 前缀 model_（CONTRACTS.md #7 ID 前缀表）；
 * - transform 透传：显式 transform 原样深拷贝入对象（外部后续修改不影响产物）；
 * - transform 缺省 = 单位变换（rotation 0 / scale 1 / position = 给定值，显式基准不抬升；
 *   两者皆缺省 = 原点 XZ + 贴地抬升 y = MODEL_BASE_HEIGHT，T9.2）；
 * - defaultAssetTransform：确定性资产默认姿态（defaultRotation + defaultScale 副本 +
 *   承托面落点 y + MODEL_BASE_HEIGHT）——拖放路径用（无随机采样）；产物与资产默认值
 *   解耦（改产物不动资产）。
 * 边界：editor 层纯函数（零 THREE / 零 DOM）；PlacementTool 既有测试守护点击路径零回归。
 */
import { describe, expect, it } from 'vitest';
import { MODEL_BASE_HEIGHT } from '../../../src/domain/assets';
import type { ModelAsset } from '../../../src/domain/assets';
import {
  MODEL_OBJECT_TYPE,
  createModelObjectAt,
  defaultAssetTransform,
} from '../../../src/editor/factories/modelFactory';

function makeAsset(overrides: Partial<ModelAsset> = {}): ModelAsset {
  return {
    id: 'asset_tree',
    name: '行道树',
    category: 'plant',
    file: 'models/plant/tree.glb',
    tags: ['植物'],
    defaultScale: { x: 2, y: 2, z: 2 },
    defaultRotation: { x: 0, y: Math.PI / 2, z: 0 },
    ...overrides,
  };
}

describe('createModelObjectAt：对象结构确定性', () => {
  it('字段全集符合契约：type=model / name=资产名 / visible / locked / properties / asset 引用 / parentId=null', () => {
    const asset = makeAsset();
    const obj = createModelObjectAt({ asset, layerId: 'layer_models' });
    expect(obj.type).toBe('model');
    expect(obj.name).toBe('行道树');
    expect(obj.parentId).toBeNull();
    expect(obj.layerId).toBe('layer_models');
    expect(obj.visible).toBe(true);
    expect(obj.locked).toBe(false);
    expect(obj.properties).toEqual({});
    expect(obj.asset).toEqual({ assetId: 'asset_tree' });
  });

  it('id 带 model_ 前缀且每次发号不同（createId 唯一性）', () => {
    const a = createModelObjectAt({ asset: makeAsset(), layerId: null });
    const b = createModelObjectAt({ asset: makeAsset(), layerId: null });
    expect(a.id).toMatch(/^model_/);
    expect(b.id).toMatch(/^model_/);
    expect(a.id).not.toBe(b.id);
  });

  it('MODEL_OBJECT_TYPE 常量 = "model"（SceneObject.type，场景只存 assetId 引用）', () => {
    expect(MODEL_OBJECT_TYPE).toBe('model');
  });

  it('layerId 透传 null（无归属图层语义）', () => {
    const obj = createModelObjectAt({ asset: makeAsset(), layerId: null });
    expect(obj.layerId).toBeNull();
  });
});

describe('createModelObjectAt：transform 语义', () => {
  it('显式 transform 原样采用（PlacementTool 随机采样路径）；产物与传入对象解耦', () => {
    const transform = {
      position: { x: 3, y: 0, z: -2 },
      rotation: { x: 0, y: 1.23, z: 0 },
      scale: { x: 1.5, y: 1.5, z: 1.5 },
    };
    const obj = createModelObjectAt({ asset: makeAsset(), layerId: null, transform });
    expect(obj.transform).toEqual(transform);

    transform.position.x = 99; // 外部修改不回写产物（深拷贝入对象）
    expect(obj.transform.position.x).toBe(3);
  });

  it('transform 缺省 = 单位变换：rotation 0 / scale 1 / position = 给定值（显式基准不抬升）', () => {
    const obj = createModelObjectAt({
      asset: makeAsset(), // defaultScale=2 / defaultRotation.y=π/2 不掺入缺省路径
      layerId: null,
      position: { x: 5, y: 0, z: 7 },
    });
    expect(obj.transform).toEqual({
      position: { x: 5, y: 0, z: 7 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
  });

  it('transform 与 position 皆缺省 → 原点 XZ + 贴地抬升 y（T9.2）', () => {
    const obj = createModelObjectAt({ asset: makeAsset(), layerId: null });
    expect(obj.transform.position).toEqual({ x: 0, y: MODEL_BASE_HEIGHT, z: 0 });
    expect(obj.transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
    expect(obj.transform.scale).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('产物不受资产后续修改影响（快照语义，与 CreateObjectCommand 深拷贝一致）', () => {
    const asset = makeAsset();
    const obj = createModelObjectAt({ asset, layerId: null, transform: defaultAssetTransform(asset, { x: 1, y: 2, z: 3 }) });
    asset.name = '改名';
    asset.defaultScale.x = 99;
    expect(obj.name).toBe('行道树');
    expect(obj.transform.scale).toEqual({ x: 2, y: 2, z: 2 });
  });
});

describe('defaultAssetTransform：资产默认姿态（拖放路径，确定性无随机）', () => {
  it('rotation/scale 取资产默认值副本 + 承托面落点（y + MODEL_BASE_HEIGHT，T9.2）', () => {
    const asset = makeAsset();
    const t = defaultAssetTransform(asset, { x: -4, y: 0, z: 8 });
    expect(t.position).toEqual({ x: -4, y: MODEL_BASE_HEIGHT, z: 8 });
    expect(t.rotation).toEqual({ x: 0, y: Math.PI / 2, z: 0 });
    expect(t.scale).toEqual({ x: 2, y: 2, z: 2 });
  });

  it('返回值与资产解耦（改产物不动资产默认值）', () => {
    const asset = makeAsset();
    const t = defaultAssetTransform(asset, { x: 0, y: 0, z: 0 });
    t.rotation.y = 42;
    t.scale.x = 42;
    expect(asset.defaultRotation.y).toBe(Math.PI / 2);
    expect(asset.defaultScale.x).toBe(2);
  });
});

describe('贴地抬升落点（T9.2）：五路一致性之工厂两路', () => {
  it('defaultAssetTransform（拖放路径）：y = position.y + MODEL_BASE_HEIGHT（承托面 + lift）', () => {
    const t = defaultAssetTransform(makeAsset(), { x: -4, y: 0, z: 8 });
    expect(t.position.y).toBeCloseTo(MODEL_BASE_HEIGHT, 10);
    // XZ 透传不受抬升影响
    expect(t.position.x).toBe(-4);
    expect(t.position.z).toBe(8);
  });

  it('工厂缺省（position / transform 皆缺省）：y = MODEL_BASE_HEIGHT（原点 XZ + 贴地抬升）', () => {
    const obj = createModelObjectAt({ asset: makeAsset(), layerId: null });
    expect(obj.transform.position).toEqual({ x: 0, y: MODEL_BASE_HEIGHT, z: 0 });
    expect(obj.transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
    expect(obj.transform.scale).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('显式 position 透传不抬升（调用方已定基准；抬升归放置/拖放两条承托面路径）', () => {
    const obj = createModelObjectAt({
      asset: makeAsset(),
      layerId: null,
      position: { x: 5, y: 0.5, z: 7 },
    });
    expect(obj.transform.position.y).toBe(0.5);
  });
});
