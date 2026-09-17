/**
 * tests/runtime/RuntimeViewport.instanced.test.ts —— 实例池模型射线拾取测试（T5.9 缺陷修复，先测后码）。
 *
 * 复现两类实测缺陷（2026-09-11 浏览器实测：视口点击模型全部不命中，框选正常）：
 * - 单例池（count===1 普通 Mesh）：射线命中渲染体，但业务 id 只在离树锚点上，
 *   findId 沿父链（mesh → 池根 → contentGroup）找不到 objectId → pickObject 恒 null；
 * - 实例化池（InstancedMesh）：远离原点的实例不被命中（疑似 raycast 的
 *   boundingSphere 粗剔除未覆盖全部实例矩阵）。
 *
 * 复刻 Renderer 装配（attachModel/poolAttach/resyncAll-syncAll 时序）：
 * - drop：pool.attach → pool.update（图层感知可见性重写）→ map.set(id, anchor)；
 * - openScene：先全量 detach（池拆到 0），再同步循环 attach 全部（源 Promise 尚
 *   pending、矩阵先登记），微任务落地后源就绪一次性建网格。
 * 环境：node（无 WebGL；真实 THREE.Raycaster 对纯构造的场景图做拾取数学，
 * 渲染循环的 updateMatrixWorld 由 harness 显式执行）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { ID, Transform } from '../../src/core/types';
import type { ModelObject } from '../../src/domain/assets';
import { InstancedAssetPool } from '../../src/runtime/instancing/InstancedAssetPool';
import type { InstanceSource } from '../../src/runtime/instancing/InstancedAssetPool';
import { RuntimeObjectMap } from '../../src/runtime/RuntimeObjectMap';
import { RuntimeViewport } from '../../src/runtime/services/RuntimeViewport';

// ── 构造工具（对齐 InstancedAssetPool.test.ts / RuntimeViewport.rect.test.ts）─────

/** 最小画布 fake：pickObject 只读 getBoundingClientRect */
function fakeCanvas(width = 800, height = 600): HTMLCanvasElement {
  return {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width,
      height,
      x: 0,
      y: 0,
      right: width,
      bottom: height,
      toJSON: () => ({}),
    }),
  } as unknown as HTMLCanvasElement;
}

function transformAt(x: number, y: number, z: number, scale = 1): Transform {
  return {
    position: { x, y, z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: scale, y: scale, z: scale },
  };
}

function makeModel(id: ID, assetId: string, t: Transform, visible = true): ModelObject {
  return {
    id,
    type: 'model',
    name: `模型-${id}`,
    parentId: null,
    layerId: null,
    visible,
    locked: false,
    transform: t,
    properties: {},
    asset: { assetId },
  };
}

function fakeSource(): InstanceSource {
  return {
    geometry: new THREE.BoxGeometry(1, 2, 1),
    material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
  };
}

/** fake 源提供者：每 assetId 一份共享源（模板缓存去重），异步解析 */
function makeProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(async (assetId: string): Promise<InstanceSource> => {
    let source = sources.get(assetId);
    if (!source) {
      source = fakeSource();
      sources.set(assetId, source);
    }
    return source;
  });
  return { provider, sources };
}

/** 冲刷微任务队列（源 Promise 与池内 then 链全部落地） */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * 复刻 Renderer 装配的最小拾取 harness：
 * contentGroup（pickRoot）→ 池根；锚点进 RuntimeObjectMap；
 * RuntimeViewport 注入池 resolvePick（与 Renderer.ts 同构）。
 */
function createHarness() {
  const { provider } = makeProvider();
  const pool = new InstancedAssetPool({ provideSource: provider });
  const map = new RuntimeObjectMap();
  const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 2000);
  const pickRoot = new THREE.Group(); // contentGroup 等价
  pickRoot.add(pool.root);
  const viewport = new RuntimeViewport(fakeCanvas(), camera, pickRoot, map, (hit) =>
    pool.resolvePick(hit),
  );

  /** Renderer.attachModel + poolAttach：attach 后立即以图层感知可见性重写实例矩阵 */
  const drop = (id: ID, assetId: string, t: Transform, visible = true): void => {
    const model = makeModel(id, assetId, t, visible);
    const anchor = pool.attach(model);
    pool.update(model.id, model.transform, visible);
    map.set(model.id, anchor);
  };

  /** 渲染循环等价：拾取前刷新世界矩阵（浏览器中每帧 render 做） */
  const frame = (): void => {
    pickRoot.updateMatrixWorld(true);
  };

  /** 相机移到 pos 前方斜上方正对 pos，pick 画布中心（NDC 0,0 射线穿过 pos） */
  const pickAt = (x: number, y: number, z: number): ID | null => {
    camera.position.set(x, y + 6, z + 10);
    camera.lookAt(x, y, z);
    camera.updateMatrixWorld(true);
    return viewport.pickObject(400, 300);
  };

  return { pool, map, viewport, drop, frame, pickAt };
}

// ── 测试 ────────────────────────────────────────────────────

describe('RuntimeViewport 实例池射线拾取：单例路径', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('单实例普通 Mesh：射线命中渲染体 → pickObject 返回该实例业务 id', async () => {
    const h = createHarness();
    h.drop('single_far', 'asset_pavilion', transformAt(60, 0, -40)); // 远离原点
    await flush();
    h.frame();
    expect(h.pickAt(60, 0, -40)).toBe('single_far');
    h.pool.dispose();
  });

  it('同资产第二实例加入升级 InstancedMesh 后：两个实例均可命中', async () => {
    const h = createHarness();
    h.drop('origin', 'asset_pavilion', transformAt(0, 0, 0));
    await flush(); // 先落单例（drop 增量时序）
    h.drop('far', 'asset_pavilion', transformAt(60, 0, -40));
    h.frame();
    expect(h.pickAt(0, 0, 0)).toBe('origin');
    expect(h.pickAt(60, 0, -40)).toBe('far');
    h.pool.dispose();
  });

  it('实例化后回到单例（detach 第二实例）：仍可命中且 id 正确', async () => {
    const h = createHarness();
    h.drop('keep', 'asset_pavilion', transformAt(30, 0, 20));
    h.drop('gone', 'asset_pavilion', transformAt(0, 0, 0));
    await flush();
    h.pool.detach('gone');
    h.frame();
    expect(h.pickAt(30, 0, 20)).toBe('keep');
    h.pool.dispose();
  });
});

describe('RuntimeViewport 实例池射线拾取：实例化路径（boundingSphere 覆盖）', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('多实例任意分布：原点与远处实例均可被射线命中', async () => {
    const h = createHarness();
    const spots: Array<[ID, number, number, number]> = [
      ['at_origin', 0, 0, 0],
      ['at_right', 60, 0, -40],
      ['at_back', -35, 0, -70],
    ];
    for (const [id, x, y, z] of spots) h.drop(id, 'asset_pavilion', transformAt(x, y, z));
    await flush();
    h.frame();
    for (const [id, x, y, z] of spots) {
      expect(h.pickAt(x, y, z), `pick ${id}@(${x},${y},${z})`).toBe(id);
    }
    h.pool.dispose();
  });

  it('openScene 全量重建时序（先全 detach 再同步 attach 全部，源 Promise 后落地）：全部实例可命中', async () => {
    const h = createHarness();
    // 预热源缓存（首次 openScene 前该资产已被用过）——openScene 期间 Promise 仍异步
    h.drop('warmup', 'asset_pavilion', transformAt(0, 0, 0));
    await flush();

    // syncAll 语义：全量卸载（池拆到 0）→ 同步循环重挂 10 个（矩阵先登记、源 pending）
    for (const id of h.map.ids()) {
      h.map.delete(id);
      h.pool.detach(id);
    }
    const spots: Array<[ID, number, number, number]> = [
      ['p0', 0, 0, 0],
      ['p1', 0, 5, 0], // 原点上 y=5（凉亭甲布局）
      ['p2', 12, 0, -18],
      ['p3', -25, 0, 8],
      ['p4', 48, 0, -33],
      ['p5', -60, 0, -52],
      ['p6', 90, 0, 15],
      ['p7', -85, 0, 40],
      ['p8', 33, 0, 65],
      ['p9', -12, 0, -90],
    ];
    for (const [id, x, y, z] of spots) h.drop(id, 'asset_pavilion', transformAt(x, y, z));
    await flush(); // 源就绪 → 池内 then → reconcile 一次性建网格
    h.frame();
    for (const [id, x, y, z] of spots) {
      expect(h.pickAt(x, y, z), `pick ${id}@(${x},${y},${z})`).toBe(id);
    }
    h.pool.dispose();
  });

  it('扩容换矩阵缓冲（capacity 4 → 8）：新增实例可命中', async () => {
    const h = createHarness();
    for (let i = 0; i < 4; i++) h.drop(`m${i}`, 'asset_tree', transformAt(i * 10, 0, 0));
    await flush();
    for (let i = 4; i < 9; i++) h.drop(`m${i}`, 'asset_tree', transformAt(0, 0, -i * 15));
    h.frame();
    expect(h.pickAt(0, 0, -60)).toBe('m4');
    expect(h.pickAt(0, 0, -120)).toBe('m8');
    h.pool.dispose();
  });

  it('单槽 update 移动实例到远处：新位置可命中、旧位置不再命中', async () => {
    const h = createHarness();
    h.drop('a', 'asset_tree', transformAt(0, 0, 0));
    h.drop('b', 'asset_tree', transformAt(10, 0, 0));
    await flush();
    h.pool.update('a', transformAt(70, 0, -50)); // 只写对应槽
    h.frame();
    expect(h.pickAt(70, 0, -50)).toBe('a');
    expect(h.pickAt(0, 0, 0)).toBeNull();
    h.pool.dispose();
  });

  it('隐藏实例零缩放：该位置不命中（保持「隐藏不可拾取」语义）', async () => {
    const h = createHarness();
    h.drop('shown', 'asset_tree', transformAt(0, 0, 0));
    h.drop('hidden', 'asset_tree', transformAt(0, 0, -30), false);
    await flush();
    h.frame();
    expect(h.pickAt(0, 0, 0)).toBe('shown');
    expect(h.pickAt(0, 0, -30)).toBeNull();
    h.pool.dispose();
  });

  it('同 id 换资产迁移到新池：两池渲染体各自可命中', async () => {
    const h = createHarness();
    h.drop('t0', 'asset_tree', transformAt(0, 0, 0));
    h.drop('t1', 'asset_tree', transformAt(20, 0, 0));
    h.drop('l0', 'asset_lamp', transformAt(-20, 0, 0));
    await flush();
    // t0 换成路灯：tree 池退单例、lamp 池 InstancedMesh
    h.pool.attach(makeModel('t0', 'asset_lamp', transformAt(-40, 0, -20)));
    h.frame();
    expect(h.pickAt(20, 0, 0)).toBe('t1'); // tree 池单例
    expect(h.pickAt(-20, 0, 0)).toBe('l0'); // lamp 池实例 0
    expect(h.pickAt(-40, 0, -20)).toBe('t0'); // lamp 池实例 1（迁移者）
    h.pool.dispose();
  });

  it('放大实例（scale=2）：命中返回该实例 id', async () => {
    const h = createHarness();
    h.drop('origin', 'asset_pavilion', transformAt(0, 0, 0));
    h.drop('big', 'asset_pavilion', transformAt(0, 0, -45, 2)); // 原点北 45 处 scale=2
    await flush();
    h.frame();
    expect(h.pickAt(0, 0, -45)).toBe('big');
    h.pool.dispose();
  });
});
