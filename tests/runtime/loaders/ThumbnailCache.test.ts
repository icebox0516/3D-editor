/**
 * tests/runtime/loaders/ThumbnailCache.test.ts —— 缩略图两级缓存测试（先测后码）。
 *
 * 覆盖（T2.1 验收标准 3：首次点击出现真实缩略图，第二次从缓存取）：
 * - 内存缓存命中：producer 只调用一次（加载计数断言）；
 * - 并发去重：同 key 并发 get 共享一次生产；
 * - 持久层（注入 fake store）：命中 store 不再生产；生产结果 best-effort 写入 store，
 *   key = assetId + 文件尺寸（尺寸变化 → 缓存失效重新生产）；
 * - 降级：producer 返回 null / 抛错、store.get / store.set 抛错 → 均不冒泡（best-effort）。
 * - 程序化源分支（T002.2 混排）：thumbnailKey 泛化（无 metadata.bytes → id@?）、
 *   getProcedural 与 get 同构语义（内存/并发/持久层/降级）且共享 key 空间；
 *   OffscreenSnapshotter.captureProcedural 在 node 无 document → null 不抛错。
 * 边界：不测真实 WebGL 离屏渲染（node 无 WebGL，阶段门裁定 3）——
 *      快照生产者一律注入 fake；OffscreenSnapshotter 属浏览器运行时路径（仅测降级分支）。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import * as THREE from 'three';
import type { ModelAsset, ProceduralAssetMeta } from '../../../src/domain/assets';
import {
  IndexedDbThumbnailStore,
  OffscreenSnapshotter,
  ThumbnailCache,
  thumbnailKey,
} from '../../../src/runtime/loaders/ThumbnailCache';
import type { ThumbnailSnapshotProducer, ThumbnailStore } from '../../../src/runtime/loaders/ThumbnailCache';
import { registerProceduralRoute, unregisterProceduralRoute } from '../../../src/runtime/procedural/routes';

function makeAsset(partial: Partial<ModelAsset> = {}): ModelAsset {
  return {
    id: 'asset_tree',
    name: '行道树',
    category: 'plant',
    file: 'assets/models/plant/tree.glb',
    tags: [],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    metadata: { bytes: 1024 },
    ...partial,
  };
}

/** fake 程序化资产 meta（结构对齐 ProceduralAssetMeta：无 file/metadata/thumbnail 字段） */
function makeProceduralMeta(partial: Partial<ProceduralAssetMeta> = {}): ProceduralAssetMeta {
  return {
    id: 'asset_trashbin',
    name: '垃圾桶',
    category: 'facility',
    tags: [],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    ...partial,
  };
}

/** fake 快照生产者：calls 属性为调用计数 */
function fakeProducer(result: string | null = 'data:image/png;base64,SNAP'): ThumbnailSnapshotProducer & {
  calls: number;
} {
  let count = 0;
  return {
    capture: async (_asset: ModelAsset): Promise<string | null> => {
      count += 1;
      return result;
    },
    get calls() {
      return count;
    },
  };
}

/** 内存 fake 持久层（可单独替换 get/set 注入故障） */
function fakeStore(): { store: ThumbnailStore; data: Map<string, string>; get: Mock; set: Mock } {
  const data = new Map<string, string>();
  const get = vi.fn(async (key: string): Promise<string | null> => data.get(key) ?? null);
  const set = vi.fn(async (key: string, value: string): Promise<void> => {
    data.set(key, value);
  });
  return { store: { get, set }, data, get, set };
}

/** 简写：固定结果的生产者 */
function producerOf(result: string | null): ThumbnailSnapshotProducer {
  return { capture: async () => result };
}

/** fake 程序化快照生产者：calls 属性为 captureProcedural 调用计数（capture 与用例无关，恒 null） */
function fakeProceduralProducer(
  result: string | null = 'data:image/png;base64,SNAP',
): ThumbnailSnapshotProducer & { calls: number } {
  let count = 0;
  return {
    capture: async (): Promise<string | null> => null,
    captureProcedural: async (_meta: ProceduralAssetMeta): Promise<string | null> => {
      count += 1;
      return result;
    },
    get calls() {
      return count;
    },
  };
}

describe('thumbnailKey：assetId + 文件尺寸', () => {
  it('metadata.bytes 参与 key；缺失时也有稳定 key', () => {
    expect(thumbnailKey(makeAsset())).toBe('asset_tree@1024');
    expect(thumbnailKey(makeAsset({ metadata: undefined }))).toBe('asset_tree@?');
    expect(thumbnailKey(makeAsset({ id: 'asset_car', metadata: { bytes: 8 } }))).toBe('asset_car@8');
  });

  it('ProceduralAssetMeta（无 metadata）→ id@?（T002.2 泛化；全库 id 唯一不撞 key）', () => {
    expect(thumbnailKey(makeProceduralMeta())).toBe('asset_trashbin@?');
    expect(thumbnailKey(makeProceduralMeta({ id: 'asset_probe' }))).toBe('asset_probe@?');
  });
});

describe('ThumbnailCache：内存命中与生产去重', () => {
  it('首次 miss → 生产一次并缓存；再次 get 不再生产（加载计数）', async () => {
    const cache = new ThumbnailCache();
    const producer = fakeProducer();
    const asset = makeAsset();

    const first = await cache.get(asset, producer);
    expect(first).toBe('data:image/png;base64,SNAP');
    expect(producer.calls).toBe(1);

    const second = await cache.get(asset, producer);
    expect(second).toBe(first);
    expect(producer.calls).toBe(1); // 只生产一次
  });

  it('并发 get 同 key 共享一次生产（in-flight 去重）', async () => {
    const cache = new ThumbnailCache();
    const producer = fakeProducer();
    const [a, b] = await Promise.all([cache.get(makeAsset(), producer), cache.get(makeAsset(), producer)]);
    expect(a).toBe(b);
    expect(producer.calls).toBe(1);
  });

  it('文件尺寸变化 → key 变化 → 重新生产（旧快照不串用）', async () => {
    const cache = new ThumbnailCache();
    const producer = fakeProducer();
    await cache.get(makeAsset({ metadata: { bytes: 100 } }), producer);
    await cache.get(makeAsset({ metadata: { bytes: 200 } }), producer);
    expect(producer.calls).toBe(2);
  });

  it('peek 只读内存：未生产返回 null，不触发生产', async () => {
    const cache = new ThumbnailCache();
    const producer = fakeProducer();
    expect(cache.peek(makeAsset())).toBeNull();
    await cache.get(makeAsset(), producer);
    expect(cache.peek(makeAsset())).toBe('data:image/png;base64,SNAP');
    expect(producer.calls).toBe(1);
  });

  it('clear 只清内存：无持久层时重新生产；有持久层时回退读 store', async () => {
    // 无 store：clear 后内存为空 → 重新生产
    const bare = new ThumbnailCache();
    const producer = fakeProducer();
    await bare.get(makeAsset(), producer);
    bare.clear();
    await bare.get(makeAsset(), producer);
    expect(producer.calls).toBe(2);

    // 有 store：clear 后内存为空但持久层命中 → 不再生产
    const { store } = fakeStore();
    const persisted = new ThumbnailCache({ store });
    await persisted.get(makeAsset(), producerOf('data:image/png;base64,KEPT'));
    persisted.clear();
    expect(await persisted.get(makeAsset(), fakeProducer())).toBe('data:image/png;base64,KEPT');
  });
});

describe('ThumbnailCache：持久层（store 注入）', () => {
  it('生产后 best-effort 写入 store（key = assetId@bytes）', async () => {
    const { store, set } = fakeStore();
    const cache = new ThumbnailCache({ store });
    await cache.get(makeAsset(), producerOf('data:image/png;base64,REAL'));
    expect(set).toHaveBeenCalledWith('asset_tree@1024', 'data:image/png;base64,REAL');
  });

  it('内存未命中但 store 命中 → 直接返回，不生产；并回填内存', async () => {
    const { store, data, get } = fakeStore();
    data.set('asset_tree@1024', 'data:image/png;base64,PERSISTED');
    const cache = new ThumbnailCache({ store });
    const producer = fakeProducer();

    expect(await cache.get(makeAsset(), producer)).toBe('data:image/png;base64,PERSISTED');
    expect(producer.calls).toBe(0);
    expect(await cache.get(makeAsset(), producer)).toBe('data:image/png;base64,PERSISTED');
    expect(get).toHaveBeenCalledTimes(1); // 第二次走内存
  });

  it('store.get 抛错 → 降级走生产，不冒泡', async () => {
    const { store, get } = fakeStore();
    get.mockImplementation(async () => {
      throw new Error('IndexedDB 不可用');
    });
    const cache = new ThumbnailCache({ store });
    expect(await cache.get(makeAsset(), producerOf('data:image/png;base64,FALLBACK'))).toBe(
      'data:image/png;base64,FALLBACK',
    );
  });

  it('store.set 抛错 → 吞错（内存缓存仍有效）', async () => {
    const { store, set } = fakeStore();
    set.mockImplementation(async () => {
      throw new Error('quota');
    });
    const cache = new ThumbnailCache({ store });
    const producer = fakeProducer();
    const url = await cache.get(makeAsset(), producer);
    expect(url).toBe('data:image/png;base64,SNAP');
    expect(await cache.get(makeAsset(), producer)).toBe(url);
    expect(producer.calls).toBe(1);
  });
});

describe('ThumbnailCache：生产者降级（离屏渲染不可用）', () => {
  it('producer 返回 null → get 解析 null，不写 store', async () => {
    const { store, set } = fakeStore();
    const cache = new ThumbnailCache({ store });
    expect(await cache.get(makeAsset(), fakeProducer(null))).toBeNull();
    expect(set).not.toHaveBeenCalled();
  });

  it('producer 抛错 → get 解析 null（best-effort 不冒泡）；下次可重试', async () => {
    const cache = new ThumbnailCache();
    const bad: ThumbnailSnapshotProducer = { capture: () => Promise.reject(new Error('WebGL 上下文丢失')) };
    expect(await cache.get(makeAsset(), bad)).toBeNull();
    expect(await cache.get(makeAsset(), producerOf('data:image/png;base64,RETRY'))).toBe(
      'data:image/png;base64,RETRY',
    );
  });
});

describe('IndexedDbThumbnailStore：无 indexedDB 环境降级', () => {
  it('node 环境（无 indexedDB 全局）：get → null，set 不抛错', async () => {
    const store = new IndexedDbThumbnailStore();
    expect(await store.get('k')).toBeNull();
    await expect(store.set('k', 'v')).resolves.toBeUndefined();
  });
});

describe('ThumbnailCache.getProcedural：程序化资产缩略图（T002.2）', () => {
  it('首次 miss → 生产一次并缓存；再次 getProcedural 不再生产（加载计数）', async () => {
    const cache = new ThumbnailCache();
    const producer = fakeProceduralProducer();
    const meta = makeProceduralMeta();

    const first = await cache.getProcedural(meta, producer);
    expect(first).toBe('data:image/png;base64,SNAP');
    expect(producer.calls).toBe(1);

    const second = await cache.getProcedural(meta, producer);
    expect(second).toBe(first);
    expect(producer.calls).toBe(1); // 只生产一次
  });

  it('并发 getProcedural 同 key 共享一次生产（in-flight 去重）', async () => {
    const cache = new ThumbnailCache();
    const producer = fakeProceduralProducer();
    const [a, b] = await Promise.all([
      cache.getProcedural(makeProceduralMeta(), producer),
      cache.getProcedural(makeProceduralMeta(), producer),
    ]);
    expect(a).toBe(b);
    expect(producer.calls).toBe(1);
  });

  it('生产后 best-effort 写入 store（key = id@?，无 bytes）', async () => {
    const { store, set } = fakeStore();
    const cache = new ThumbnailCache({ store });
    await cache.getProcedural(makeProceduralMeta(), fakeProceduralProducer('data:image/png;base64,PROC'));
    expect(set).toHaveBeenCalledWith('asset_trashbin@?', 'data:image/png;base64,PROC');
  });

  it('内存未命中但 store 命中 → 直接返回不生产，并回填内存', async () => {
    const { store, data, get } = fakeStore();
    data.set('asset_trashbin@?', 'data:image/png;base64,PERSISTED');
    const cache = new ThumbnailCache({ store });
    const producer = fakeProceduralProducer();

    expect(await cache.getProcedural(makeProceduralMeta(), producer)).toBe('data:image/png;base64,PERSISTED');
    expect(producer.calls).toBe(0);
    expect(await cache.getProcedural(makeProceduralMeta(), producer)).toBe('data:image/png;base64,PERSISTED');
    expect(get).toHaveBeenCalledTimes(1); // 第二次走内存
  });

  it('producer 未实现 captureProcedural → 解析 null，不写 store（可换生产者重试）', async () => {
    const { store, set } = fakeStore();
    const cache = new ThumbnailCache({ store });
    expect(await cache.getProcedural(makeProceduralMeta(), fakeProducer())).toBeNull();
    expect(set).not.toHaveBeenCalled();
  });

  it('captureProcedural 返回 null → 解析 null；下次可重试（失败不缓存）', async () => {
    const cache = new ThumbnailCache();
    expect(await cache.getProcedural(makeProceduralMeta(), fakeProceduralProducer(null))).toBeNull();
    expect(await cache.getProcedural(makeProceduralMeta(), fakeProceduralProducer('data:image/png;base64,RETRY'))).toBe(
      'data:image/png;base64,RETRY',
    );
  });

  it('captureProcedural 抛错 → 解析 null（best-effort 不冒泡）；下次可重试', async () => {
    const cache = new ThumbnailCache();
    const bad: ThumbnailSnapshotProducer = {
      capture: async () => null,
      captureProcedural: () => Promise.reject(new Error('build 抛错')),
    };
    expect(await cache.getProcedural(makeProceduralMeta(), bad)).toBeNull();
    expect(await cache.getProcedural(makeProceduralMeta(), fakeProceduralProducer('data:image/png;base64,RETRY'))).toBe(
      'data:image/png;base64,RETRY',
    );
  });

  it('与 get 共享 key 空间：同 id 的 bytes 缺失 ModelAsset 与程序化 meta 视为同 key（只生产一次）', async () => {
    const cache = new ThumbnailCache();
    const glbProducer = fakeProducer('data:image/png;base64,GLB');
    const procProducer = fakeProceduralProducer('data:image/png;base64,PROC');
    const model = makeAsset({ id: 'asset_trashbin', metadata: undefined }); // bytes 缺失 → asset_trashbin@?

    expect(thumbnailKey(model)).toBe(thumbnailKey(makeProceduralMeta())); // 同 key 前置
    expect(await cache.get(model, glbProducer)).toBe('data:image/png;base64,GLB');
    expect(await cache.getProcedural(makeProceduralMeta(), procProducer)).toBe('data:image/png;base64,GLB'); // 内存命中
    expect(glbProducer.calls).toBe(1);
    expect(procProducer.calls).toBe(0);
  });

  it('peekProcedural 只读内存：未生产返回 null，不触发生产', async () => {
    const cache = new ThumbnailCache();
    const producer = fakeProceduralProducer();
    expect(cache.peekProcedural(makeProceduralMeta())).toBeNull();
    await cache.getProcedural(makeProceduralMeta(), producer);
    expect(cache.peekProcedural(makeProceduralMeta())).toBe('data:image/png;base64,SNAP');
    expect(producer.calls).toBe(1);
  });
});

describe('OffscreenSnapshotter.captureProcedural：node 环境降级（不测真实 WebGL）', () => {
  const tempId = 'test.thumb_probe'; // routes seam 注入的临时路由（测试后注销）

  afterEach(() => {
    unregisterProceduralRoute(tempId);
  });

  it('未注册 id → null（路由 miss，不触碰渲染器）', async () => {
    const snapshotter = new OffscreenSnapshotter();
    await expect(snapshotter.captureProcedural(makeProceduralMeta({ id: 'test.unregistered' }))).resolves.toBeNull();
  });

  it('路由已注册但无 document（node）→ null 不抛错', async () => {
    registerProceduralRoute(tempId, () => ({
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: new THREE.MeshStandardMaterial(),
    }));
    const snapshotter = new OffscreenSnapshotter();
    expect(typeof document).toBe('undefined'); // 前置：node 无 DOM 全局（typeof 探针，裸引用会 ReferenceError）
    await expect(snapshotter.captureProcedural(makeProceduralMeta({ id: tempId }))).resolves.toBeNull();
  });
});
