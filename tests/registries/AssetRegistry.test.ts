import { describe, expect, it } from 'vitest';
import type { ModelAsset, ProceduralAssetMeta } from '../../src/domain/assets';
import { AssetRegistry } from '../../src/registries/AssetRegistry';

function makeAsset(id: string, overrides?: Partial<ModelAsset>): ModelAsset {
  return {
    id,
    name: `资产-${id}`,
    category: 'tree',
    file: `models/tree/${id}.glb`,
    tags: [],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    ...overrides,
  };
}

function makeProcedural(id: string, overrides?: Partial<ProceduralAssetMeta>): ProceduralAssetMeta {
  return {
    id,
    name: `程序化-${id}`,
    category: 'facility',
    tags: ['设施'],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    variants: { scaleJitter: 0.1, rotationJitter: 180, hueJitter: 6 },
    ...overrides,
  };
}

describe('AssetRegistry（统一描述符，T002.1）', () => {
  it('register 后 get/list 正确（描述符原样存取）', () => {
    const registry = new AssetRegistry();
    const descriptor = { kind: 'file', asset: makeAsset('asset_tree_001') } as const;
    registry.register(descriptor);
    expect(registry.get('asset_tree_001')).toBe(descriptor);
    expect(registry.list()).toHaveLength(1);
    expect(registry.list()[0]).toBe(descriptor);
  });

  it('file 与 procedural 同库混排：检索公共字段两 kind 通吃', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1', { category: 'plant', name: '行道树' }) });
    registry.register({ kind: 'procedural', asset: makeProcedural('asset_2', { category: 'plant', name: '灌木 generator' }) });
    registry.register({ kind: 'file', asset: makeAsset('asset_3', { category: 'vehicle' }) });
    // 分类检索跨 kind 命中（002.2 ContentBrowser 混排的数据基础）
    expect(registry.findByCategory('plant').map((d) => d.asset.id)).toEqual(['asset_1', 'asset_2']);
    expect(registry.search('灌木').map((d) => d.asset.id)).toEqual(['asset_2']);
  });

  it('findByKind 按 kind 过滤（保持注册顺序）', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1') });
    registry.register({ kind: 'procedural', asset: makeProcedural('asset_2') });
    registry.register({ kind: 'procedural', asset: makeProcedural('asset_3') });
    expect(registry.findByKind('procedural').map((d) => d.asset.id)).toEqual(['asset_2', 'asset_3']);
    expect(registry.findByKind('file').map((d) => d.asset.id)).toEqual(['asset_1']);
  });

  it('findByCategory 按分类过滤', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1', { category: 'plant' }) });
    registry.register({ kind: 'file', asset: makeAsset('asset_2', { category: 'vehicle' }) });
    registry.register({ kind: 'file', asset: makeAsset('asset_3', { category: 'plant' }) });
    expect(registry.findByCategory('plant').map((d) => d.asset.id)).toEqual(['asset_1', 'asset_3']);
    expect(registry.findByCategory('none')).toEqual([]);
  });

  it('search 按 name 关键词匹配且不区分大小写', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1', { name: '办公楼 A' }) });
    registry.register({ kind: 'file', asset: makeAsset('asset_2', { name: 'Office Tower' }) });
    registry.register({ kind: 'file', asset: makeAsset('asset_3', { name: '消防栓' }) });
    expect(registry.search('办公楼').map((d) => d.asset.id)).toEqual(['asset_1']);
    expect(registry.search('office').map((d) => d.asset.id)).toEqual(['asset_2']);
  });

  it('search 按 tags 匹配', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1', { tags: ['消防', '红色'] }) });
    registry.register({ kind: 'file', asset: makeAsset('asset_2', { tags: ['public'] }) });
    expect(registry.search('消防').map((d) => d.asset.id)).toEqual(['asset_1']);
    expect(registry.search('public').map((d) => d.asset.id)).toEqual(['asset_2']);
  });

  it('search 空白关键词返回空数组、无匹配返回空数组', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1', { name: '办公楼' }) });
    expect(registry.search('')).toEqual([]);
    expect(registry.search('   ')).toEqual([]);
    expect(registry.search('不存在')).toEqual([]);
  });

  it('重复注册同 id 抛错（同 kind 与跨 kind 一律拒绝——全库共享命名空间）', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1') });
    expect(() => registry.register({ kind: 'file', asset: makeAsset('asset_1') })).toThrow(/asset_1/);
    expect(() => registry.register({ kind: 'procedural', asset: makeProcedural('asset_1') })).toThrow(
      /asset_1.*file.*procedural|asset_1/,
    );
  });

  it('非法描述符拒绝：缺 kind / kind 越界 / 缺 id / 空对象', () => {
    const registry = new AssetRegistry();
    expect(() => registry.register(null as never)).toThrow(/不能为空/);
    // @ts-expect-error 运行时防御：缺 kind 的裸 ModelAsset（旧调用形态）
    expect(() => registry.register(makeAsset('asset_1'))).toThrow(/kind/);
    // @ts-expect-error 运行时防御：未知 kind
    expect(() => registry.register({ kind: 'magic', asset: makeAsset('asset_2') })).toThrow(/kind/);
    // id:'' 类型合法（ID = string）——纯运行时防御，无需指令
    expect(() => registry.register({ kind: 'file', asset: { ...makeAsset('asset_3'), id: '' } })).toThrow(/id/);
    expect(registry.list()).toHaveLength(0);
  });

  it('unregister 后 get 返回 undefined', () => {
    const registry = new AssetRegistry();
    registry.register({ kind: 'file', asset: makeAsset('asset_1') });
    registry.register({ kind: 'file', asset: makeAsset('asset_2') });
    registry.unregister('asset_1');
    expect(registry.get('asset_1')).toBeUndefined();
    expect(registry.list().map((d) => d.asset.id)).toEqual(['asset_2']);
  });
});
