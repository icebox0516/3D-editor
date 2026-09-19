/**
 * tests/runtime/loaders/AssetSourceRouter.test.ts —— 复合源路由测试（T002.3 接线）。
 *
 * 覆盖（node 结构化 fake + registerProceduralRoute seam，无 GLTFLoader / WebGL）：
 * - 三分派：kind:'file' → loader.loadInstanceSource / loader.instantiate；
 *   kind:'procedural' → ProceduralSourceCache.load（真实缓存，seam 注入 build）；
 *   未注册 → 两通道均 reject；
 * - 程序化源缓存语义保持：同 id 两调同引用（路由不破坏缓存去重）；
 * - Ghost 程序化分派：返回 Mesh 且 geometry/material 与缓存源同一引用
 *   （共享缓存所持资源——Ghost 方永不 dispose 的所有权契约基础）；
 * - Ghost 失败语义：未注册 reject（调用方保留占位盒）；
 * - 对象 seed 透传（T008.1 槽路由）：provideInstanceSource(id, { seed }) 与同槽
 *   cache.load 命中同条目；provideGhostObject(id, seed) 同槽共享缓存条目
 *   （Ghost 不 dispose 契约不变）。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { AssetRegistry } from '../../../src/registries/AssetRegistry';
import { AssetSourceRouter } from '../../../src/runtime/loaders/AssetSourceRouter';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';
import { ProceduralSourceCache } from '../../../src/runtime/procedural/ProceduralSourceCache';
import {
  registerProceduralRoute,
  unregisterProceduralRoute,
} from '../../../src/runtime/procedural/routes';
import { shapeSlotOf } from '../../../src/domain/assets';
import type { ModelAsset } from '../../../src/domain/assets';

const tempIds: string[] = [];
const caches: ProceduralSourceCache[] = [];

afterEach(() => {
  for (const cache of caches.splice(0)) cache.dispose();
  for (const id of tempIds.splice(0)) unregisterProceduralRoute(id);
});

/** fake GLB loader：记录调用并返回可控源/克隆对象（结构化最小面） */
function makeFakeLoader() {
  const fileSource: InstanceSource = {
    geometry: new THREE.BoxGeometry(1, 1, 1),
    material: new THREE.MeshStandardMaterial(),
  };
  const ghostClone = new THREE.Group();
  const loadInstanceSource = vi.fn(async (assetId: string): Promise<InstanceSource> => {
    if (assetId !== 'asset_file') throw new Error(`GLB 404: ${assetId}`);
    return fileSource;
  });
  const instantiate = vi.fn(async (assetId: string): Promise<THREE.Object3D> => {
    if (assetId !== 'asset_file') throw new Error(`GLB 404: ${assetId}`);
    return ghostClone;
  });
  return { loadInstanceSource, instantiate, fileSource, ghostClone };
}

function makeRegistry(): { assets: AssetRegistry; registerFile: () => void; registerProcedural: () => void } {
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
  const registerFile = () => assets.register({ kind: 'file', asset: file });
  const registerProcedural = () =>
    assets.register({
      kind: 'procedural',
      asset: {
        id: 'asset_proc',
        name: '程序化垃圾桶',
        category: 'facility',
        tags: [],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        variants: { scaleJitter: 0.1, rotationJitter: 180, hueJitter: 6 },
        taxonomy: { category: 'facility' }, // T010.2 必填分类（测试替身按垃圾桶原型归类）
      },
    });
  return { assets, registerFile, registerProcedural };
}

function makeRouter(assets: AssetRegistry) {
  const loader = makeFakeLoader();
  const cache = new ProceduralSourceCache();
  caches.push(cache);
  const router = new AssetSourceRouter({ assets, loader, procedural: cache });
  return { router, loader, cache };
}

describe('AssetSourceRouter：实例化源三分派', () => {
  it("kind:'file' → loader.loadInstanceSource（同引用透传）", async () => {
    const { assets, registerFile } = makeRegistry();
    registerFile();
    const { router, loader } = makeRouter(assets);
    const source = await router.provideInstanceSource('asset_file');
    expect(source).toBe(loader.fileSource);
    expect(loader.loadInstanceSource).toHaveBeenCalledWith('asset_file');
    expect(loader.instantiate).not.toHaveBeenCalled();
  });

  it("kind:'procedural' → ProceduralSourceCache.load（缓存去重保持：两调同引用）", async () => {
    const id = 'asset_proc';
    tempIds.push(id);
    let builds = 0;
    registerProceduralRoute(
      id,
      () => {
        builds++;
        return { geometry: new THREE.CylinderGeometry(), material: new THREE.MeshStandardMaterial() };
      },
    );
    const { assets, registerProcedural } = makeRegistry();
    registerProcedural();
    const { router, loader } = makeRouter(assets);
    const a = await router.provideInstanceSource(id);
    const b = await router.provideInstanceSource(id);
    expect(b).toBe(a);
    expect(builds).toBe(1);
    expect(loader.loadInstanceSource).not.toHaveBeenCalled();
  });

  it('未注册 id → reject（错误含 id）', async () => {
    const { assets } = makeRegistry();
    const { router } = makeRouter(assets);
    await expect(router.provideInstanceSource('asset_ghost')).rejects.toThrow(/asset_ghost/);
  });
});

describe('AssetSourceRouter：Ghost 对象分派', () => {
  it("kind:'file' → loader.instantiate（克隆语义透传，同对象）", async () => {
    const { assets, registerFile } = makeRegistry();
    registerFile();
    const { router, loader } = makeRouter(assets);
    const ghost = await router.provideGhostObject('asset_file');
    expect(ghost).toBe(loader.ghostClone);
    expect(loader.loadInstanceSource).not.toHaveBeenCalled();
  });

  it("kind:'procedural' → 共享缓存源的 Mesh（geometry/material 同引用；Ghost 方不 dispose 契约）", async () => {
    const id = 'asset_proc';
    tempIds.push(id);
    const source: InstanceSource = {
      geometry: new THREE.BoxGeometry(0.6, 0.9, 0.6),
      material: [
        new THREE.MeshStandardMaterial(),
        new THREE.MeshStandardMaterial(),
        new THREE.MeshStandardMaterial(),
      ],
    };
    registerProceduralRoute(id, () => source);
    const { assets, registerProcedural } = makeRegistry();
    registerProcedural();
    const { router } = makeRouter(assets);
    const ghost = await router.provideGhostObject(id);
    expect(ghost).toBeInstanceOf(THREE.Mesh);
    const mesh = ghost as THREE.Mesh;
    expect(mesh.geometry).toBe(source.geometry); // 共享缓存所持资源（所有权在缓存）
    expect(mesh.material).toBe(source.material); // 材质数组形态原样共享
  });

  it('未注册 id → reject（调用方保留占位盒）', async () => {
    const { assets } = makeRegistry();
    const { router } = makeRouter(assets);
    await expect(router.provideGhostObject('asset_ghost')).rejects.toThrow(/asset_ghost/);
  });
});

describe('AssetSourceRouter：对象 seed 透传（T008.1 槽路由）', () => {
  /** 注册声明 shapeFamily 的程序化资产（路由 seam + 注册表各一份——kind 分派与槽路由两通路） */
  function setupFamilyAsset(id: string, size: number): AssetRegistry {
    tempIds.push(id);
    registerProceduralRoute(
      id,
      () => ({ geometry: new THREE.BoxGeometry(1, 2, 1), material: new THREE.MeshStandardMaterial() }),
      {
        id,
        name: `形态族资产 ${id}`,
        category: 'test',
        taxonomy: { category: 'dev' }, // T010.2 必填分类（临时管线测试资产 → dev）
        tags: [],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        shapeFamily: { size },
      },
    );
    const { assets } = makeRegistry();
    assets.register({
      kind: 'procedural',
      asset: {
        id,
        name: `形态族资产 ${id}`,
        category: 'test',
        taxonomy: { category: 'dev' }, // T010.2 必填分类（临时管线测试资产 → dev）
        tags: [],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        shapeFamily: { size },
      },
    });
    return assets;
  }

  it('provideInstanceSource(id, { seed }) 与同槽 cache.load 命中同一条目（seed 只参与路由）', async () => {
    const size = 4;
    const assets = setupFamilyAsset('asset_proc', size);
    const { router, cache } = makeRouter(assets);
    const s1 = 10;
    let s2 = 11;
    while (shapeSlotOf(s2, size) !== shapeSlotOf(s1, size)) s2++;
    const viaRouter = await router.provideInstanceSource('asset_proc', { seed: s1 });
    const viaCache = await cache.load('asset_proc', { seed: s2 });
    expect(viaRouter).toBe(viaCache); // 同槽同 sourceKey 同条目
    expect(cache.size).toBe(1);
  });

  it('provideGhostObject(id, seed)：同槽 Ghost 与实例源共享缓存条目（Ghost 不 dispose 契约不变）', async () => {
    const size = 4;
    const assets = setupFamilyAsset('asset_proc2', size);
    const { router } = makeRouter(assets);
    const seed = 7;
    const ghost = await router.provideGhostObject('asset_proc2', seed);
    const source = await router.provideInstanceSource('asset_proc2', { seed });
    expect(ghost).toBeInstanceOf(THREE.Mesh);
    expect((ghost as THREE.Mesh).geometry).toBe(source.geometry); // 借缓存所持 Source
    expect((ghost as THREE.Mesh).material).toBe(source.material);
  });
});
