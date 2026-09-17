/**
 * tests/runtime/scatter/RegionScatterSync.test.ts —— region ↔ 散布管线绑定测试（T003.3，D18）。
 *
 * 覆盖（真 manager + fake 源提供者，沿 ScatterChunkManager.test.ts 先例；方法调用经
 * vi.spyOn 断言，行为经 root 子树 / 矩阵快照断言）：
 * - 建源：attach 散布型 preset 区域 → setSource（composeScatterParams 组装：配方值、
 *   overrides 覆写、显式/缺省派生 seed、baseY = baseHeight + position.y）；表面型 preset
 *   → 零调用零源；
 * - 换装：散布型 → 表面型 removeSource；表面型 → 散布型 setSource（换入即散、换出即清）；
 * - 局部路由：同 preset 改 overrides / seed / 顶点 → recomputeChunks（mesh 身份稳定 =
 *   无整片重建闪烁）且矩阵与新参数全量重建逐位一致；无关 update 幂等 no-op；
 * - 基面：baseHeight / transform.position.y 变 → setSource 全量（Y 属矩阵值）；
 * - 世界多边形：shape.points 逐点叠加 transform.position（XZ）——建源落点偏移、
 *   gizmo 平移走旧∪新覆盖块局部重算（主代理审查修正：表面与散布同口径跟随）；
 * - 显隐：对象 visible=false / 图层 visible=false（onLayerUpdated）→ 源级 setSourceVisible，
 *   块组整片不可见；场景数组原地变异（快照防御）仍被检出重算；
 * - 生命周期：detach / resyncAll 孤儿清理 / dispose 全摘，后续操作 no-op。
 * 边界：preset meta 经 registerBuildRoute seam 注入（getRouteMeta 同源可查，测试不依赖
 *      dev 文件）；不触碰 WebGL / Renderer。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { EventBus } from '../../../src/core/events/EventBus';
import { hashString } from '../../../src/core/random';
import type { ID, Vec2 } from '../../../src/core/types';
import type { RegionObject } from '../../../src/domain/regions';
import type { ScatterRecipe } from '../../../src/domain/scatter';
import { scatterChunk } from '../../../src/domain/scatter';
import type { ScatterChunk, ScatterInstance, ScatterParams } from '../../../src/domain/scatter';
import { SceneManager } from '../../../src/scene/SceneManager';
import type { SceneObject } from '../../../src/scene/SceneObject';
import { RegionScatterSync } from '../../../src/runtime/scatter/RegionScatterSync';
import { ScatterChunkManager } from '../../../src/runtime/scatter/ScatterChunkManager';
import type { ScatterChunkKey } from '../../../src/runtime/scatter/ScatterChunkManager';
import { registerBuildRoute, unregisterBuildRoute } from '../../../src/runtime/styles/routes';
import type { StyleInstance, StylePresetBuild } from '../../../src/runtime/styles/types';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具 ────────────────────────────────────────────────

/** 矩形环（XZ 平面） */
function rect(minX: number, minZ: number, maxX: number, maxZ: number): Vec2[] {
  return [
    { x: minX, y: minZ },
    { x: maxX, y: minZ },
    { x: maxX, y: maxZ },
    { x: minX, y: maxZ },
  ];
}

function recipeOf(over: Partial<ScatterRecipe> = {}): ScatterRecipe {
  return {
    assets: [{ assetId: 'asset_tree', weight: 1 }],
    densityPerM2: 0.2,
    ...over,
  };
}

interface RegionOverrides {
  points?: Vec2[];
  baseHeight?: number;
  posX?: number;
  posY?: number;
  posZ?: number;
  visible?: boolean;
  seed?: number;
  overrides?: Record<string, unknown>;
  presetId?: string;
  layerId?: ID | null;
}

function makeRegion(id: ID, presetId: string, over: RegionOverrides = {}): RegionObject {
  return {
    id,
    type: 'region',
    name: `区域-${id}`,
    parentId: null,
    layerId: over.layerId ?? null,
    visible: over.visible ?? true,
    locked: false,
    transform: {
      position: { x: over.posX ?? 0, y: over.posY ?? 0, z: over.posZ ?? 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    shape: {
      type: 'polygon',
      points: over.points ?? rect(0, 0, 64, 64),
      baseHeight: over.baseHeight ?? 0,
      closed: true,
    },
    semantic: { type: 'grass', properties: {} },
    style: { presetId, overrides: over.overrides ?? {}, ...(over.seed !== undefined ? { seed: over.seed } : {}) },
  };
}

/** fake 源提供者：每 assetId 一份共享源（geometry 身份即资产标签，按几何反查网格） */
function makeProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(async (assetId: string): Promise<InstanceSource> => {
    let source = sources.get(assetId);
    if (!source) {
      source = {
        geometry: new THREE.BoxGeometry(1, 2, 1),
        material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
      };
      sources.set(assetId, source);
    }
    return source;
  });
  return { provider, sources };
}

/** 冲刷微任务队列（源 Promise 与 then 链全部落地） */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function chunkRect(key: ScatterChunkKey, size = 32): ScatterChunk {
  return { minX: key.i * size, minZ: key.j * size, maxX: (key.i + 1) * size, maxZ: (key.j + 1) * size };
}

/** 撒点实例 → 期望矩阵（baseY + rotationY + uniform scale；float32 舍入后精确比对，沿 manager 测试先例） */
function expectedMatrix(inst: ScatterInstance, baseY: number): THREE.Matrix4 {
  const composed = new THREE.Matrix4().compose(
    new THREE.Vector3(inst.position.x, baseY, inst.position.y),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, inst.rotationY, 0)),
    new THREE.Vector3(inst.scale, inst.scale, inst.scale),
  );
  return new THREE.Matrix4().fromArray(Float32Array.from(composed.elements));
}

/**
 * 测试 harness：真 manager + spy + SceneManager 支撑的 sync。
 * effectiveVisible 复刻 Renderer 实现（对象 visible ∧ 图层 visible）。
 */
function createHarness() {
  const { provider, sources } = makeProvider();
  const manager = new ScatterChunkManager({ provideSource: provider });
  const sceneManager = new SceneManager(new EventBus());
  const effectiveVisible = (obj: SceneObject): boolean => {
    const layer = obj.layerId !== null ? sceneManager.getLayer(obj.layerId) : undefined;
    return obj.visible && (!layer || layer.visible !== false);
  };
  const sync = new RegionScatterSync({ manager, sceneManager, effectiveVisible });
  const spies = {
    setSource: vi.spyOn(manager, 'setSource'),
    recomputeChunks: vi.spyOn(manager, 'recomputeChunks'),
    removeSource: vi.spyOn(manager, 'removeSource'),
    setSourceVisible: vi.spyOn(manager, 'setSourceVisible'),
  };
  const meshOf = (key: ScatterChunkKey, assetId = 'asset_tree'): THREE.InstancedMesh | undefined => {
    const group = manager.root.children.find((c) => c.name === `chunk:${key.i}:${key.j}`);
    const geometry = sources.get(assetId)?.geometry;
    if (!group || !geometry) return undefined;
    return group.children.find(
      (c) => (c as THREE.InstancedMesh).isInstancedMesh && (c as THREE.InstancedMesh).geometry === geometry,
    ) as THREE.InstancedMesh | undefined;
  };
  return { manager, sceneManager, sync, spies, meshOf, sources };
}

/** 临时预设注册（seam：getRouteMeta 同源可查；afterEach 清理） */
const presetIds: string[] = [];
function registerPreset(id: string, scatter?: ScatterRecipe): void {
  presetIds.push(id);
  const build: StylePresetBuild = (geometry) => {
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const instance: StyleInstance = {
      object: mesh,
      material,
      presetId: id,
      supportedShapes: [],
      update() {},
      setGeometry() {},
      dispose() {},
    };
    return instance;
  };
  registerBuildRoute(
    id,
    build,
    {
      id,
      name: id,
      supportedShapes: ['polygon'],
      supportedSemantics: ['grass'],
      defaultParams: [],
      ...(scatter ? { scatter } : {}),
    },
  );
}

afterEach(() => {
  for (const id of presetIds.splice(0)) unregisterBuildRoute(id);
});

// ── 建源与参数组装 ──────────────────────────────────────────

describe('RegionScatterSync：建源与参数组装', () => {
  it('attach 散布型 preset 区域 → setSource：配方值/覆写/seed 派生/baseY 组装正确', async () => {
    registerPreset('t.scatter', recipeOf({ densityPerM2: 0.1, clustering: 0.5 }));
    const h = createHarness();
    const region = makeRegion('r1', 't.scatter', {
      baseHeight: 0.12,
      posY: 2,
      seed: 42,
      overrides: { 'scatter.densityPerM2': 0.3, 'color': '#ffffff' }, // 表面裸键被忽略
    });
    h.sync.attach(region);
    await flush();

    expect(h.spies.setSource).toHaveBeenCalledTimes(1);
    const [id, params, baseY] = h.spies.setSource.mock.calls[0]! as [string, ScatterParams, number];
    expect(id).toBe('r1');
    expect(baseY).toBe(2.12); // baseHeight + position.y
    expect(params.densityPerM2).toBe(0.3); // 白名单覆写生效
    expect(params.clustering).toBe(0.5); // 未覆写用配方值
    expect(params.assets).toEqual([{ assetId: 'asset_tree', weight: 1 }]);
    expect(params.seed).toBe(42); // 显式 seed 优先
    expect(params.polygon).toEqual(region.shape.points); // 世界多边形 = 点列 + (0,0) 偏移（值等价；XZ 偏移见专测）
    expect(manager_rootChildren(h.manager).length).toBe(4); // 64×64 → 2×2 块
    expect(h.spies.setSourceVisible).toHaveBeenCalledWith('r1', true);
    h.manager.dispose();
  });

  it('缺省 seed → hashString(regionId) 派生（同区域恒同值）', () => {
    registerPreset('t.scatter', recipeOf());
    const h = createHarness();
    h.sync.attach(makeRegion('region_xyz', 't.scatter'));
    expect(h.spies.setSource.mock.calls[0]![1].seed).toBe(hashString('region_xyz'));
    h.manager.dispose();
  });

  it('attach 表面型 preset（无 scatter 段）→ 零源零调用', () => {
    registerPreset('t.plain');
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.plain'));
    expect(h.spies.setSource).not.toHaveBeenCalled();
    expect(manager_rootChildren(h.manager)).toHaveLength(0);
    h.sync.attach(makeRegion('r2', 'missing.preset')); // 未注册预设（表面降级同理）：无散布
    expect(h.spies.setSource).not.toHaveBeenCalled();
    h.manager.dispose();
  });

  it('非 region 对象忽略（model 直传 attach 安全 no-op）', () => {
    registerPreset('t.scatter', recipeOf());
    const h = createHarness();
    h.sync.attach({ type: 'model', id: 'm1' } as unknown as SceneObject);
    expect(h.spies.setSource).not.toHaveBeenCalled();
    h.manager.dispose();
  });
});

// ── 换装（换入即散、换出即清）──────────────────────────────

describe('RegionScatterSync：换装路由', () => {
  it('散布型 → 表面型：removeSource，散布随换而清', async () => {
    registerPreset('t.scatter', recipeOf());
    registerPreset('t.plain');
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter'));
    await flush();
    expect(manager_rootChildren(h.manager).length).toBeGreaterThan(0);

    h.sceneManager.addObject(makeRegion('r1', 't.plain'));
    h.sync.update('r1'); // 换出
    expect(h.spies.removeSource).toHaveBeenCalledWith('r1');
    expect(manager_rootChildren(h.manager)).toHaveLength(0);
    h.manager.dispose();
  });

  it('表面型 → 散布型：setSource 建源（换入即散）', () => {
    registerPreset('t.scatter', recipeOf());
    registerPreset('t.plain');
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.plain'));
    h.sync.attach(makeRegion('r1', 't.scatter')); // 无记录 → 全量建源
    expect(h.spies.setSource).toHaveBeenCalledTimes(1);
    h.manager.dispose();
  });
});

// ── 局部路由（overrides / seed / 顶点）─────────────────────

describe('RegionScatterSync：局部重算路由', () => {
  beforeEach(() => {
    registerPreset('t.scatter', recipeOf({ densityPerM2: 0.2 }));
  });

  it('改 density 覆写 → recomputeChunks（mesh 身份稳定不整片重建）且矩阵与新参数全量重建一致', async () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter'));
    await flush();
    const meshBefore = h.meshOf({ i: 0, j: 0 })!;
    expect(meshBefore).toBeDefined();
    h.spies.setSource.mockClear();

    h.sceneManager.addObject(
      makeRegion('r1', 't.scatter', { overrides: { 'scatter.densityPerM2': 0.6 } }),
    );
    h.sync.update('r1');
    await flush();

    expect(h.spies.setSource).not.toHaveBeenCalled(); // 无整片重建（无全局闪烁）
    expect(h.spies.recomputeChunks).toHaveBeenCalledTimes(1);
    const [id, keys, params] = h.spies.recomputeChunks.mock.calls[0]! as [string, ScatterChunkKey[], ScatterParams];
    expect(id).toBe('r1');
    expect(params.densityPerM2).toBe(0.6);
    // 受影响块 = 覆盖块全集（含零面积边界块 9 个——computeAffectedChunks 保守列出，重撒幂等）
    // 且 mesh 对象不变（扩容换缓冲不换对象）
    expect(keys).toHaveLength(9);
    expect(keys).toContainEqual({ i: 0, j: 0 });
    expect(keys).toContainEqual({ i: 1, j: 1 });
    const meshAfter = h.meshOf({ i: 0, j: 0 })!;
    expect(meshAfter).toBe(meshBefore);
    // 矩阵与新参数的期望撒点逐位一致（对照 domain 直撒）
    const expected = scatterChunk(params, chunkRect({ i: 0, j: 0 }));
    expect(meshAfter.count).toBe(expected.length);
    h.manager.dispose();
  });

  it('重掷 seed → recomputeChunks（同覆盖块全量键）', () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter', { seed: 1 }));
    h.spies.setSource.mockClear();

    h.sceneManager.addObject(makeRegion('r1', 't.scatter', { seed: 2 }));
    h.sync.update('r1');
    expect(h.spies.setSource).not.toHaveBeenCalled();
    expect(h.spies.recomputeChunks).toHaveBeenCalledTimes(1);
    expect(h.spies.recomputeChunks.mock.calls[0]![2]!.seed).toBe(2);
    h.manager.dispose();
  });

  it('无关 update（参数未变）→ 幂等 no-op（零重算）', () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter'));
    h.spies.setSource.mockClear();
    h.spies.setSourceVisible.mockClear();

    h.sceneManager.addObject(makeRegion('r1', 't.scatter'));
    h.sync.update('r1'); // 同参数重放
    h.sync.update('r1');
    expect(h.spies.setSource).not.toHaveBeenCalled();
    expect(h.spies.recomputeChunks).not.toHaveBeenCalled();
    expect(h.spies.setSourceVisible).toHaveBeenCalledTimes(2); // 仅幂等显隐重申（每次 update 一次）
    h.manager.dispose();
  });

  it('顶点编辑（points 变）→ 局部重算：新覆盖块补建、原块矩阵随新参数', async () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter', { points: rect(0, 0, 64, 64) }));
    await flush();
    expect(h.meshOf({ i: 1, j: 1 })).toBeDefined();
    h.spies.setSource.mockClear();

    // 右扩一格（64→96）：新增覆盖块 2:0/2:1，旧块保持
    h.sceneManager.addObject(
      makeRegion('r1', 't.scatter', { points: rect(0, 0, 96, 64) }),
    );
    h.sync.update('r1');
    await flush();

    expect(h.spies.setSource).not.toHaveBeenCalled();
    expect(h.spies.recomputeChunks).toHaveBeenCalledTimes(1);
    const keys = h.spies.recomputeChunks.mock.calls[0]![1]! as ScatterChunkKey[];
    expect(keys).toContainEqual({ i: 2, j: 0 }); // 新 territory 在受影响集内
    expect(h.meshOf({ i: 2, j: 0 })).toBeDefined(); // 补建
    expect(h.meshOf({ i: 0, j: 0 })).toBeDefined(); // 原块仍在
    h.manager.dispose();
  });

  it('场景数组原地变异（快照防御）：比对基准不被别名污染，变化仍被检出', () => {
    const h = createHarness();
    const region = makeRegion('r1', 't.scatter');
    h.sync.attach(region);
    h.spies.setSource.mockClear();

    region.shape.points[0] = { x: 16, y: 16 }; // 原地变异（未经命令深拷的旁路）
    h.sceneManager.addObject(region);
    h.sync.update('r1');
    expect(h.spies.recomputeChunks).toHaveBeenCalledTimes(1); // 快照 ≠ 现场 → 检出
    h.manager.dispose();
  });
});

// ── 基面（baseHeight / transform.position.y）───────────────

describe('RegionScatterSync：基面路由', () => {
  beforeEach(() => {
    registerPreset('t.scatter', recipeOf());
  });

  it('baseHeight 变 → setSource 全量（Y 属矩阵值，局部重算覆盖不了）', () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter', { baseHeight: 0 }));
    h.spies.setSource.mockClear();

    h.sceneManager.addObject(makeRegion('r1', 't.scatter', { baseHeight: 3 }));
    h.sync.update('r1');
    expect(h.spies.setSource).toHaveBeenCalledTimes(1);
    expect(h.spies.setSource.mock.calls[0]![2]).toBe(3);
    expect(h.spies.recomputeChunks).not.toHaveBeenCalled();
    h.manager.dispose();
  });

  it('transform.position.y 变 → setSource，baseY = baseHeight + position.y 合成', () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter', { baseHeight: 0.12 }));
    h.spies.setSource.mockClear();

    h.sceneManager.addObject(makeRegion('r1', 't.scatter', { baseHeight: 0.12, posY: 1.5 }));
    h.sync.update('r1');
    expect(h.spies.setSource).toHaveBeenCalledTimes(1);
    expect(h.spies.setSource.mock.calls[0]![2]).toBeCloseTo(1.62);
    h.manager.dispose();
  });
});

// ── 世界多边形（gizmo XZ 平移跟随，主代理审查修正）─────────

describe('RegionScatterSync：世界多边形（XZ 偏移跟随）', () => {
  beforeEach(() => {
    registerPreset('t.scatter', recipeOf({ densityPerM2: 0.3 }));
  });

  it('建源：带 XZ transform 的区域 → 块落在世界偏移处，实例矩阵 = 点列 + 偏移', async () => {
    const h = createHarness();
    const region = makeRegion('r1', 't.scatter', { points: rect(0, 0, 64, 64), posX: 100, posZ: 50 });
    h.sync.attach(region);
    await flush();

    // 世界 bbox [100,164]×[50,114]（偏移非块对齐）→ 覆盖 i∈{3,4,5} × j∈{1,2,3}，
    // 边界条带（[160,164) 等）面积非零 → 全部 9 块有实例（世界分块按偏移后坐标判）
    const names = manager_rootChildren(h.manager).map((c) => c.name);
    expect(names).toHaveLength(9);
    for (const name of ['chunk:3:1', 'chunk:5:1', 'chunk:3:3', 'chunk:5:3']) expect(names).toContain(name);

    // 实例落点 = setSource 收到的偏移多边形在世界块上的确定性撒点（矩阵逐位一致）
    const params = h.spies.setSource.mock.calls[0]![1]!;
    expect(params.polygon).toEqual(rect(100, 50, 164, 114));
    const mesh = h.meshOf({ i: 3, j: 1 })!;
    const expected = scatterChunk(params, chunkRect({ i: 3, j: 1 }));
    expect(mesh.count).toBe(expected.length);
    const probe = new THREE.Matrix4();
    for (let slot = 0; slot < expected.length; slot++) {
      mesh.getMatrixAt(slot, probe);
      expect(probe.equals(expectedMatrix(expected[slot]!, 0))).toBe(true);
    }
    h.manager.dispose();
  });

  it('平移 transform（update）→ 受影响块重算（旧 ∪ 新覆盖并集），mesh 身份稳定且新领土补建', async () => {
    const h = createHarness();
    const region = makeRegion('r1', 't.scatter', { points: rect(0, 0, 64, 64) });
    h.sceneManager.addObject(region);
    h.sync.attach(region);
    await flush();
    expect(manager_rootChildren(h.manager)).toHaveLength(4);
    const meshBefore = h.meshOf({ i: 1, j: 1 })!;
    h.spies.setSource.mockClear();

    // gizmo 平移 (32, 32)：世界多边形 → [32,96]²
    region.transform.position.x = 32;
    region.transform.position.z = 32;
    h.sync.update('r1');
    await flush();

    expect(h.spies.setSource).not.toHaveBeenCalled(); // 走局部重算（无整片重建闪烁）
    expect(h.spies.recomputeChunks).toHaveBeenCalledTimes(1);
    const [id, keys, params] = h.spies.recomputeChunks.mock.calls[0]! as [string, ScatterChunkKey[], ScatterParams];
    expect(id).toBe('r1');
    expect(params.polygon).toEqual(rect(32, 32, 96, 96));
    // 受影响 = 旧 {0,1,2}² ∪ 新 {1,2,3}² 覆盖块（保守并集；{0..3}² 去掉 (0,3)/(3,0) 两角 = 14）
    expect(keys).toHaveLength(14);
    expect(keys).toContainEqual({ i: 0, j: 0 });
    expect(keys).toContainEqual({ i: 3, j: 3 });

    // 行为：旧领土块回收（(0,0) 已空）、新领土块补建（(2,2) 有实例）、跨新旧块 mesh 身份稳定
    expect(h.meshOf({ i: 0, j: 0 })).toBeUndefined();
    expect(h.meshOf({ i: 2, j: 2 })).toBeDefined();
    expect(h.meshOf({ i: 1, j: 1 })).toBe(meshBefore);
    // 跨新旧块矩阵 = 偏移后参数的期望撒点
    const expected = scatterChunk(params, chunkRect({ i: 1, j: 1 }));
    const probe = new THREE.Matrix4();
    const mesh = h.meshOf({ i: 1, j: 1 })!;
    expect(mesh.count).toBe(expected.length);
    for (let slot = 0; slot < expected.length; slot++) {
      mesh.getMatrixAt(slot, probe);
      expect(probe.equals(expectedMatrix(expected[slot]!, 0))).toBe(true);
    }
    h.manager.dispose();
  });
});

// ── 源级显隐 ────────────────────────────────────────────────

describe('RegionScatterSync：源级显隐', () => {
  beforeEach(() => {
    registerPreset('t.scatter', recipeOf());
  });

  it('对象 visible=false → setSourceVisible(false)：块组整片不可见', async () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter'));
    await flush();
    for (const c of manager_rootChildren(h.manager)) expect(c.visible).toBe(true);

    h.sceneManager.addObject(makeRegion('r1', 't.scatter', { visible: false }));
    h.sync.update('r1');
    expect(h.spies.setSourceVisible).toHaveBeenLastCalledWith('r1', false);
    for (const c of manager_rootChildren(h.manager)) expect(c.visible).toBe(false);
    h.manager.dispose();
  });

  it('图层 visible=false（onLayerUpdated）→ 源级隐藏；图层恢复 + frame → 视锥判定回归', async () => {
    const h = createHarness();
    const layer = {
      id: 'layer_1' as ID,
      name: '绿地',
      visible: true,
      locked: false,
      opacity: 1,
      order: 0,
      objectIds: [],
    };
    h.sceneManager.addLayer(layer);
    const region = makeRegion('r1', 't.scatter', { layerId: layer.id });
    h.sceneManager.addObject(region); // 入场景（onLayerUpdated 经 layer.objectIds 遍历成员）
    h.sync.attach(region);
    await flush();

    h.sceneManager.updateLayer(layer.id, { visible: false });
    h.sync.onLayerUpdated(layer.id);
    expect(h.spies.setSourceVisible).toHaveBeenLastCalledWith('r1', false);
    for (const c of manager_rootChildren(h.manager)) expect(c.visible).toBe(false);

    h.sceneManager.updateLayer(layer.id, { visible: true });
    h.sync.onLayerUpdated(layer.id);
    expect(h.spies.setSourceVisible).toHaveBeenLastCalledWith('r1', true);
    // 恢复可见由 frame 的视锥判定接管（连续渲染语义）
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 5000);
    camera.position.set(32, 200, 32);
    camera.lookAt(32, 0, 32);
    h.manager.frame(camera);
    for (const c of manager_rootChildren(h.manager)) expect(c.visible).toBe(true);
    h.manager.dispose();
  });

  it('隐藏源上的 setSource 全量重建 → 继承隐藏态（新块不闪现）', async () => {
    const h = createHarness();
    const region = makeRegion('r1', 't.scatter');
    h.sceneManager.addObject(region);
    h.sync.attach(region);
    await flush();

    region.visible = false;
    h.sync.update('r1'); // 隐藏
    region.shape.baseHeight = 5;
    h.sync.update('r1'); // 隐藏期间触发全量重建（基面移动）
    for (const c of manager_rootChildren(h.manager)) expect(c.visible).toBe(false);
    h.manager.dispose();
  });
});

// ── 生命周期 ────────────────────────────────────────────────

describe('RegionScatterSync：生命周期', () => {
  beforeEach(() => {
    registerPreset('t.scatter', recipeOf());
  });

  it('detach → removeSource 整片回收；重 attach 重建', async () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter'));
    await flush();
    expect(manager_rootChildren(h.manager).length).toBeGreaterThan(0);

    h.sync.detach('r1');
    expect(h.spies.removeSource).toHaveBeenCalledWith('r1');
    expect(manager_rootChildren(h.manager)).toHaveLength(0);

    h.sync.attach(makeRegion('r1', 't.scatter'));
    await flush();
    expect(manager_rootChildren(h.manager).length).toBe(4);
    h.manager.dispose();
  });

  it('resyncAll：场景已消失的孤儿记录被清理（clear 不逐对象发事件的兜底）', async () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter'));
    await flush();
    expect(manager_rootChildren(h.manager).length).toBeGreaterThan(0);

    h.sync.resyncAll(); // r1 仍在场景外（从未入 sceneManager）→ 孤儿
    expect(h.spies.removeSource).toHaveBeenCalledWith('r1');
    expect(manager_rootChildren(h.manager)).toHaveLength(0);
    h.manager.dispose();
  });

  it('dispose → 全部源摘除，后续钩子 no-op（幂等）', async () => {
    const h = createHarness();
    h.sync.attach(makeRegion('r1', 't.scatter'));
    h.sync.attach(makeRegion('r2', 't.scatter', { points: rect(100, 100, 132, 132) }));
    await flush();
    h.sync.dispose();
    expect(manager_rootChildren(h.manager)).toHaveLength(0);
    h.spies.removeSource.mockClear();

    h.sync.attach(makeRegion('r3', 't.scatter'));
    h.sync.update('r1');
    h.sync.detach('r2');
    expect(h.spies.setSource).toHaveBeenCalledTimes(2); // 仅 r1/r2 首 attach
    expect(h.spies.removeSource).not.toHaveBeenCalled();
    h.manager.dispose();
  });
});

/** manager.root.children 访问助手（命名避开与 harness 局部混淆） */
function manager_rootChildren(m: ScatterChunkManager): THREE.Object3D[] {
  return m.root.children;
}
