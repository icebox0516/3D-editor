/**
 * tests/io/AssetManifest.test.ts —— 资产清单读取与 AssetRegistry 灌注测试（先测后码）。
 *
 * 覆盖（T2.1 接口 Produces：loadManifest(json): { assets: ModelAsset[] }）：
 * - 合法清单：解析产出 ModelAsset[]；可选字段缺省时归一（tags→[]、defaultScale→{1,1,1}、
 *   defaultRotation→{0,0,0}）；metadata 原样保留（含收藏类字段）；
 * - 非法结构：非对象 / 缺 assets 数组 / 版本非 1.0 / 条目缺 id·name·category·file /
 *   字段类型错误 / id 重复 → 抛 AssetManifestError（信息含定位）；
 * - 灌注：registerManifestAssets 幂等（重复 id 跳过），返回新增数量，
 *   灌注后 AssetRegistry.findByCategory / search 可用。
 * 边界：io 层纯数据，不做路径解析（相对→URL 由组合根 bootstrap 负责，见阶段门裁定 1）。
 */
import { describe, expect, it } from 'vitest';
import type { ModelAsset } from '../../src/domain/assets';
import { AssetManifestError, loadManifest, registerManifestAssets } from '../../src/io/AssetManifest';
import { AssetRegistry } from '../../src/registries/AssetRegistry';

function validEntry(partial: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'asset_tree',
    name: '行道树',
    category: 'plant',
    file: 'models/plant/tree.glb',
    thumbnail: 'thumbnails/tree.svg',
    tags: ['植物', 'tree'],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    metadata: { categoryLabel: '植物', bytes: 100, favorite: true },
    ...partial,
  };
}

function validManifest(assets: unknown[]): unknown {
  return { version: '1.0', generator: 'scripts/scan-assets.mjs', assets };
}

describe('loadManifest：合法清单', () => {
  it('解析产出 { assets }，字段与 metadata 完整透传', () => {
    const { assets } = loadManifest(validManifest([validEntry()]));
    expect(assets).toHaveLength(1);
    expect(assets[0]).toEqual({
      id: 'asset_tree',
      name: '行道树',
      category: 'plant',
      file: 'models/plant/tree.glb',
      thumbnail: 'thumbnails/tree.svg',
      tags: ['植物', 'tree'],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
      metadata: { categoryLabel: '植物', bytes: 100, favorite: true },
    } satisfies ModelAsset);
  });

  it('可选字段缺省归一：tags→[]、scale/rotation 缺轴补默认、metadata 可省略', () => {
    const { assets } = loadManifest(
      validManifest([
        validEntry({
          thumbnail: undefined,
          tags: undefined,
          metadata: undefined,
          defaultScale: { x: 2 },
          defaultRotation: { y: Math.PI },
        }),
      ]),
    );
    const a = assets[0];
    expect(a.thumbnail).toBeUndefined();
    expect(a.tags).toEqual([]);
    expect(a.defaultScale).toEqual({ x: 2, y: 1, z: 1 });
    expect(a.defaultRotation).toEqual({ x: 0, y: Math.PI, z: 0 });
    expect(a.metadata).toBeUndefined();
  });

  it('tags 中的非字符串项被过滤（手工编辑容错）', () => {
    const { assets } = loadManifest(validManifest([validEntry({ tags: ['植物', 42, null, 'tree'] })]));
    expect(assets[0].tags).toEqual(['植物', 'tree']);
  });

  it('空清单合法（models 目录为空时 scan-assets 的产物）', () => {
    expect(loadManifest(validManifest([])).assets).toEqual([]);
  });
});

describe('loadManifest：非法结构抛 AssetManifestError', () => {
  it.each([
    ['null', null],
    ['数组', [validEntry()]],
    ['缺 assets', { version: '1.0' }],
    ['assets 非数组', { version: '1.0', assets: {} }],
  ])('%s → 抛错', (_label, json) => {
    expect(() => loadManifest(json)).toThrow(AssetManifestError);
  });

  it('版本非 1.0：错误信息含实际版本号（对齐 SceneSerializer 语义）', () => {
    expect(() => loadManifest({ version: '2.0', assets: [] })).toThrow(/2\.0/);
  });

  it.each([
    ['缺 id', validEntry({ id: undefined })],
    ['缺 name', validEntry({ name: '' })],
    ['缺 category', validEntry({ category: undefined })],
    ['缺 file', validEntry({ file: '' })],
    ['name 非字符串', validEntry({ name: 42 })],
    ['tags 非数组', validEntry({ tags: '植物' })],
    ['scale 非对象', validEntry({ defaultScale: 'big' })],
    ['scale 轴非数值', validEntry({ defaultScale: { x: '2' } })],
    ['thumbnail 非字符串', validEntry({ thumbnail: 3 })],
  ])('条目 %s → 抛错', (_label, entry) => {
    expect(() => loadManifest(validManifest([validEntry(), entry]))).toThrow(AssetManifestError);
  });

  it('重复 id → 抛错（避免灌注时 AssetRegistry 重复注册）', () => {
    expect(() =>
      loadManifest(validManifest([validEntry(), validEntry({ file: 'models/plant/tree2.glb' })])),
    ).toThrow(/asset_tree/);
  });

  it('错误信息含条目定位（index / 字段路径）', () => {
    try {
      loadManifest(validManifest([validEntry(), validEntry({ id: 'asset_car', file: '' })]));
      expect.unreachable('应当抛错');
    } catch (err) {
      expect(err).toBeInstanceOf(AssetManifestError);
      expect((err as Error).message).toMatch(/assets\[1\]/);
    }
  });
});

describe('registerManifestAssets：灌注 AssetRegistry', () => {
  it('注册新条目返回数量；重复调用幂等跳过；registry 检索可用', () => {
    const registry = new AssetRegistry();
    const { assets } = loadManifest(
      validManifest([
        validEntry(),
        validEntry({
          id: 'asset_car',
          name: '轿车',
          category: 'vehicle',
          file: 'models/vehicle/car.glb',
          tags: ['车辆', 'car'],
          thumbnail: 'thumbnails/car.svg',
          metadata: { categoryLabel: '车辆' },
        }),
      ]),
    );

    expect(registerManifestAssets(registry, assets)).toBe(2);
    expect(registerManifestAssets(registry, assets)).toBe(0); // 幂等
    expect(registry.list()).toHaveLength(2);
    expect(registry.findByCategory('plant').map((a) => a.asset.id)).toEqual(['asset_tree']);
    expect(registry.search('轿车').map((a) => a.asset.id)).toEqual(['asset_car']);
    expect(registry.search('tree').map((a) => a.asset.id)).toEqual(['asset_tree']);
  });

  it('空清单灌注返回 0', () => {
    expect(registerManifestAssets(new AssetRegistry(), [])).toBe(0);
  });
});
