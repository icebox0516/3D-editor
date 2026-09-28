/**
 * tests/runtime/loaders/RepresentationSourceRouter.test.ts —— 表示感知源路由门面测试（T021.7，D41 §十一）。
 *
 * 覆盖（node 结构化 fake + 真实树种集成，无 GLTFLoader / WebGL）：
 * - h/m/l 透传：high/mid/low → assetRouter.provideInstanceSource（{ seed, level } 同参），
 *   canopy provider 不被触碰；representation 缺省归一 'high'（与旧窄化闭包 level 缺省
 *   语义逐位一致）；
 * - canopy 分流：providers.canopy 行被调（assetId/seed/representation 同参透传）同引用返回；
 * - 防御路径：canopy 请求但未注册 canopy 行 → reject 且 assetRouter 不被调
 *   （不静默回 high——调用方 sourceReady 保持 false、对象停留当前表示）；
 * - 真实接线集成（Renderer 装配形态）：真实 AssetSourceRouter + 真实 CanopySourceCache——
 *   GLB file 分支忽略 level 恒 high（D28.5）；真实树种（asset_tree_3a）canopy 源走
 *   CanopySourceCache（成套材质 + 深度材质 + bounds）且**不进 ProceduralSourceCache**
 *   （canopy 非构建档——门面在构建缓存之外分流）；h/m/l 源进 ProceduralSourceCache
 *   双维键、canopy 缓存互不干扰。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { AssetRegistry } from '../../../src/registries/AssetRegistry';
import { AssetSourceRouter } from '../../../src/runtime/loaders/AssetSourceRouter';
import { RepresentationSourceRouter } from '../../../src/runtime/loaders/RepresentationSourceRouter';
import type { RepresentationSourceProvider } from '../../../src/runtime/loaders/RepresentationSourceRouter';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';
import { CanopySourceCache } from '../../../src/runtime/procedural/CanopySourceCache';
import { ProceduralSourceCache } from '../../../src/runtime/procedural/ProceduralSourceCache';
import { meta as tree3aMeta } from '../../../src/runtime/procedural/assets/asset_tree_3a.asset';
import type { ModelAsset } from '../../../src/domain/assets';

const caches: { dispose(): void }[] = [];

afterEach(() => {
  for (const cache of caches.splice(0)) cache.dispose();
});

/** fake 复合路由：记录调用并返回可控源 */
function makeFakeAssetRouter() {
  const source: InstanceSource = {
    geometry: new THREE.BoxGeometry(1, 1, 1),
    material: new THREE.MeshStandardMaterial(),
  };
  const provideInstanceSource = vi.fn(
    async (assetId: string): Promise<InstanceSource> => {
      if (assetId !== 'asset_proc') throw new Error(`源 404: ${assetId}`);
      return source;
    },
  );
  return { provideInstanceSource, source };
}

describe('h/m/l 透传（构建档位表示直落既有路由）', () => {
  it('mid 请求 → assetRouter 收 (id, { seed, level: "mid" })；canopy provider 不被触碰', async () => {
    const assetRouter = makeFakeAssetRouter();
    const canopy = vi.fn();
    const router = new RepresentationSourceRouter({
      assetRouter,
      providers: { canopy: canopy as unknown as RepresentationSourceProvider },
    });
    const got = await router.provideRepresentationSource('asset_proc', 42, 'mid');
    expect(got).toBe(assetRouter.source);
    expect(assetRouter.provideInstanceSource).toHaveBeenCalledWith('asset_proc', { seed: 42, level: 'mid' });
    expect(canopy).not.toHaveBeenCalled();
  });

  it('representation 缺省 → 归一 high（level: "high"，与旧窄化闭包缺省语义逐位一致）', async () => {
    const assetRouter = makeFakeAssetRouter();
    const router = new RepresentationSourceRouter({ assetRouter });
    await router.provideRepresentationSource('asset_proc');
    expect(assetRouter.provideInstanceSource).toHaveBeenCalledWith('asset_proc', { seed: undefined, level: 'high' });
  });

  it('preset 透传（T024.1）：h/m/l → assetRouter opts.preset 同参到达', async () => {
    const assetRouter = makeFakeAssetRouter();
    const router = new RepresentationSourceRouter({ assetRouter });
    await router.provideRepresentationSource('asset_proc', 42, 'mid', 'autumn');
    expect(assetRouter.provideInstanceSource).toHaveBeenCalledWith('asset_proc', {
      seed: 42,
      preset: 'autumn',
      level: 'mid',
    });
    // 未携卡 → opts.preset 为 undefined（默认卡缺省路径）
    await router.provideRepresentationSource('asset_proc', 42, 'mid');
    expect(assetRouter.provideInstanceSource).toHaveBeenLastCalledWith('asset_proc', {
      seed: 42,
      preset: undefined,
      level: 'mid',
    });
  });
});

describe('canopy 分流（providers 路由表 canopy 行）', () => {
  it('canopy 请求 → provider 被调（assetId/seed/representation/preset 同参透传）、同引用返回；assetRouter 不被调', async () => {
    const assetRouter = makeFakeAssetRouter();
    const canopySource: InstanceSource = {
      geometry: new THREE.BufferGeometry(),
      material: new THREE.MeshStandardMaterial(),
    };
    const canopy = vi.fn(async () => canopySource);
    const router = new RepresentationSourceRouter({ assetRouter, providers: { canopy } });
    const got = await router.provideRepresentationSource('asset_tree_3a', 7, 'canopy');
    expect(got).toBe(canopySource);
    expect(canopy).toHaveBeenCalledWith('asset_tree_3a', 7, 'canopy', undefined);
    expect(assetRouter.provideInstanceSource).not.toHaveBeenCalled();

    // T024.1：preset 第四参透传（canopy 冠色随卡——归一在 Renderer 侧 choke point）
    await router.provideRepresentationSource('asset_tree_3a', 7, 'canopy', 'autumn');
    expect(canopy).toHaveBeenLastCalledWith('asset_tree_3a', 7, 'canopy', 'autumn');
  });

  it('防御路径：未注册 canopy 行的 canopy 请求 → reject 且错误含 assetId、assetRouter 不被调（不静默回 high）', async () => {
    const assetRouter = makeFakeAssetRouter();
    const router = new RepresentationSourceRouter({ assetRouter });
    await expect(
      router.provideRepresentationSource('asset_tree_3a', undefined, 'canopy'),
    ).rejects.toThrow(/asset_tree_3a/);
    expect(assetRouter.provideInstanceSource).not.toHaveBeenCalled();
  });
});

describe('真实接线集成（Renderer 装配形态：真实 AssetSourceRouter + 真实 CanopySourceCache）', () => {
  /** 真实装配：注册表（GLB + tree3a procedural meta）+ fake GLB loader + 两真缓存 + 门面 */
  function makeRealAssembly() {
    const assets = new AssetRegistry();
    const file: ModelAsset = {
      id: 'asset_file',
      name: 'GLB 树',
      category: 'tree',
      file: 'models/tree.glb',
      tags: [],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
    };
    assets.register({ kind: 'file', asset: file });
    assets.register({ kind: 'procedural', asset: tree3aMeta });
    const fileSource: InstanceSource = {
      geometry: new THREE.BoxGeometry(2, 2, 2),
      material: new THREE.MeshStandardMaterial(),
    };
    const loader = {
      loadInstanceSource: vi.fn(async (assetId: string): Promise<InstanceSource> => {
        if (assetId !== 'asset_file') throw new Error(`GLB 404: ${assetId}`);
        return fileSource;
      }),
      instantiate: vi.fn(async () => new THREE.Group()),
    };
    const procedural = new ProceduralSourceCache();
    const canopy = new CanopySourceCache();
    caches.push(procedural, canopy);
    const assetRouter = new AssetSourceRouter({ assets, loader, procedural });
    const router = new RepresentationSourceRouter({
      assetRouter,
      providers: { canopy: (assetId, seed) => canopy.load(assetId, seed) },
    });
    return { router, procedural, canopy, loader, fileSource };
  }

  it('GLB 恒 high（D28.5）：file 资产请求 mid → loader 直供（level 被忽略），同引用返回', async () => {
    const { router, loader, fileSource } = makeRealAssembly();
    const got = await router.provideRepresentationSource('asset_file', undefined, 'mid');
    expect(got).toBe(fileSource);
    expect(loader.loadInstanceSource).toHaveBeenCalledWith('asset_file');
  });

  it('真实树种 canopy：canopy 源走 CanopySourceCache（材质数组 + 深度材质 + bounds 成套）且不进 ProceduralSourceCache；high 源反之', async () => {
    const { router, procedural, canopy } = makeRealAssembly();
    const canopySource = await router.provideRepresentationSource('asset_tree_3a', 123, 'canopy');
    expect(canopy.size).toBe(1);
    expect(procedural.size).toBe(0); // canopy 非构建档——构建缓存零条目（门面分流）
    expect(Array.isArray(canopySource.material)).toBe(true);
    expect((canopySource.material as THREE.Material[])).toHaveLength(2); // [干柱, 冠卡]
    expect(canopySource.customDepthMaterial).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(canopySource.bounds).toBeDefined(); // RenderBounds 随几何成套（§四.3/§十一）
    const highSource = await router.provideRepresentationSource('asset_tree_3a', 123, 'high');
    expect(procedural.size).toBe(1); // high → 构建缓存双维键条目
    expect(canopy.size).toBe(1); // canopy 缓存不受影响
    expect(highSource.geometry).not.toBe(canopySource.geometry);
    expect(highSource.bounds).toBeUndefined(); // 既有程序化源不填 bounds（行为零变化）
  });

  it('未支持资产的 canopy 请求（非 13 乔木）→ reject 且两缓存零条目（不缓存坏结果）', async () => {
    const { router, procedural, canopy } = makeRealAssembly();
    await expect(
      router.provideRepresentationSource('asset_file', undefined, 'canopy'),
    ).rejects.toThrow(/asset_file/);
    expect(canopy.size).toBe(0);
    expect(procedural.size).toBe(0);
  });
});
