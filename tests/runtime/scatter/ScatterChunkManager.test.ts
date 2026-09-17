/**
 * tests/runtime/scatter/ScatterChunkManager.test.ts —— 分块实例化管线测试（T003.2，D9）。
 *
 * 覆盖（任务书验收清单，node 下统计断言、无需 WebGL——three 场景图对象可纯构造）：
 * - 块划分：跨块多边形 → 覆盖块数正确（含负坐标块）、每块实例位置都在自己块矩形内、
 *   多边形空洞块不建；
 * - 合批：每 (源×块×资产) 恰一个 InstancedMesh；多资产配比分布合理；矩阵与 scatterChunk
 *   输出逐位一致（含 baseY / rotationY / uniform scale）；拾取隔离（网格不携带 userData.objectId）；
 * - 生命周期：块空了 → 块 Group 回收、实例缓冲释放；区域回来 → 重建且确定性复原；
 *   removeSource 全清；dispose 零残留；mesh 对象引用稳定（扩容换缓冲不换对象、缩容保留容量）；
 * - 局部重算：recomputeChunks 子集 → 未列块 instanceMatrix 快照逐位不变、被列块与新参数
 *   全量重建逐位一致；computeAffectedChunks 纯函数各情形（完全相等 / 顶点移动 / 全局参数变 /
 *   密度变 / 聚簇与衰减外扩 / 退化多边形）；
 * - 确定性：同 seed 双跑全量重建逐位一致；单块重撒 == 全量重建对应块逐位一致（manager 层）；
 * - 剔除：构造相机 frustum 外块 visible=false、内块 true；frame 无源 O(1) 早退；
 * - 逐实例色：hueJitter 资产 → instanceColor 存在、非全白、逐槽与 applyAssetVariants +
 *   hueOffsetToMultiplier 换算一致、容量对齐矩阵缓冲；无 hueJitter → 不建颜色缓冲；
 * - 异步源：未就绪登记（块 Group 先建、网格零）、到达后建网格（总数 = 全量撒点）；
 *   失败告警一次不崩、同资产只加载一次。
 * 边界：GLB 加载用注入的 fake 源提供者替代（仿 InstancedAssetPool.test.ts），
 *      本文件不触碰 AssetLoader / WebGL / Renderer。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { applyAssetVariants } from '../../../src/domain/assets';
import type { ProceduralVariants } from '../../../src/domain/assets';
import { scatterChunk, scatterPolygon } from '../../../src/domain/scatter';
import type { ScatterChunk, ScatterInstance, ScatterParams } from '../../../src/domain/scatter';
import type { Vec2 } from '../../../src/core/types';
import {
  CHUNK_SIZE_M,
  ScatterChunkManager,
  computeAffectedChunks,
} from '../../../src/runtime/scatter/ScatterChunkManager';
import type { ScatterChunkKey } from '../../../src/runtime/scatter/ScatterChunkManager';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';
import { hueOffsetToMultiplier } from '../../../src/runtime/instancing/instanceTint';

// ── 构造工具 ────────────────────────────────────────────────

/** 矩形环（XZ 平面，绕向无关） */
function rect(minX: number, minZ: number, maxX: number, maxZ: number): Vec2[] {
  return [
    { x: minX, y: minZ },
    { x: maxX, y: minZ },
    { x: maxX, y: maxZ },
    { x: minX, y: maxZ },
  ];
}

function baseParams(overrides: Partial<ScatterParams> = {}): ScatterParams {
  return {
    polygon: rect(0, 0, 64, 64),
    densityPerM2: 0.2,
    assets: [{ assetId: 'asset_tree', weight: 1 }],
    seed: 123456789,
    ...overrides,
  };
}

function fakeSource(): InstanceSource {
  return {
    geometry: new THREE.BoxGeometry(1, 2, 1),
    material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
  };
}

/** fake 源提供者：每 assetId 一份共享源（geometry 身份即资产标签，测试按几何反查网格） */
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

/** 冲刷微任务队列（源 Promise 与后续 .then 链全部落地） */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** 撒点实例 → 期望矩阵（与管内组合逻辑一致：baseY + rotationY + uniform scale；
 *  缓冲为 Float32Array，期望值同过 float32 舍入后做精确比较——沿池测试先例） */
function expectedMatrix(inst: ScatterInstance, baseY: number): THREE.Matrix4 {
  const composed = new THREE.Matrix4().compose(
    new THREE.Vector3(inst.position.x, baseY, inst.position.y),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, inst.rotationY, 0)),
    new THREE.Vector3(inst.scale, inst.scale, inst.scale),
  );
  return new THREE.Matrix4().fromArray(Float32Array.from(composed.elements));
}

function chunkRect(key: ScatterChunkKey, size = CHUNK_SIZE_M): ScatterChunk {
  return { minX: key.i * size, minZ: key.j * size, maxX: (key.i + 1) * size, maxZ: (key.j + 1) * size };
}

/** 取块 Group（name = chunk:i:j；不存在返回 undefined） */
function chunkGroupOf(m: ScatterChunkManager, key: ScatterChunkKey): THREE.Group | undefined {
  const hit = m.root.children.find((c) => c.name === `chunk:${key.i}:${key.j}`);
  return hit as THREE.Group | undefined;
}

/** 取块内某资产的 InstancedMesh（按共享几何身份反查——provider 每 assetId 一份源） */
function meshOf(
  m: ScatterChunkManager,
  sources: Map<string, InstanceSource>,
  key: ScatterChunkKey,
  assetId: string,
): THREE.InstancedMesh | undefined {
  const group = chunkGroupOf(m, key);
  const geometry = sources.get(assetId)?.geometry;
  if (!group || !geometry) return undefined;
  return group.children.find(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && (c as THREE.InstancedMesh).geometry === geometry,
  ) as THREE.InstancedMesh | undefined;
}

/** 网格已用槽位的矩阵缓冲快照（逐位比对用） */
function matrixSnapshot(mesh: THREE.InstancedMesh): Float32Array {
  return Float32Array.from(mesh.instanceMatrix.array.subarray(0, mesh.count * 16));
}

/** 参数 → 期望的 (块 → 资产 → 实例列表)（直接调 domain scatterChunk 作为对照真相源） */
function expectedByAsset(params: ScatterParams, key: ScatterChunkKey): Map<string, ScatterInstance[]> {
  const byAsset = new Map<string, ScatterInstance[]>();
  for (const inst of scatterChunk(params, chunkRect(key))) {
    let list = byAsset.get(inst.assetId);
    if (!list) {
      list = [];
      byAsset.set(inst.assetId, list);
    }
    list.push(inst);
  }
  return byAsset;
}

/** 断言某块网格与 scatterChunk 输出逐位一致（count / 矩阵序列） */
function expectChunkMatchesScatter(
  m: ScatterChunkManager,
  sources: Map<string, InstanceSource>,
  params: ScatterParams,
  key: ScatterChunkKey,
  baseY: number,
): void {
  const expected = expectedByAsset(params, key);
  const group = chunkGroupOf(m, key);
  if (expected.size === 0) {
    expect(group).toBeUndefined(); // 空块不建
    return;
  }
  expect(group).toBeDefined();
  expect(group!.children).toHaveLength(expected.size); // 每 (块×资产) 恰一个网格
  const probe = new THREE.Matrix4();
  for (const [assetId, list] of expected) {
    const mesh = meshOf(m, sources, key, assetId)!;
    expect(mesh).toBeDefined();
    expect(mesh.count).toBe(list.length);
    for (let slot = 0; slot < list.length; slot++) {
      mesh.getMatrixAt(slot, probe);
      expect(probe.equals(expectedMatrix(list[slot]!, baseY))).toBe(true);
    }
  }
}

// ── 块划分 ──────────────────────────────────────────────────

describe('ScatterChunkManager：块划分', () => {
  it('跨块多边形 → 覆盖块数正确（含负坐标块）、每块实例位置都在自己块矩形内', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    // bbox x[-70,30] z[-40,50] → i∈[-3,0] j∈[-2,1]（floor 边界闭含）→ 4×4 = 16 块
    m.setSource('s', baseParams({ polygon: rect(-70, -40, 30, 50), densityPerM2: 0.5 }), 0);
    await flush();

    expect(m.root.children).toHaveLength(16);
    const names = new Set(m.root.children.map((c) => c.name));
    for (let i = -3; i <= 0; i++) {
      for (let j = -2; j <= 1; j++) expect(names.has(`chunk:${i}:${j}`)).toBe(true);
    }
    // 每块实例位置（矩阵平移分量）都在自己块矩形内（半开 [min,max)）
    const probe = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    for (const group of m.root.children) {
      const [i, j] = group.name.split(':').slice(1).map(Number) as [number, number];
      const bounds = chunkRect({ i, j });
      for (const child of group.children) {
        const mesh = child as THREE.InstancedMesh;
        expect(mesh.isInstancedMesh).toBe(true);
        for (let slot = 0; slot < mesh.count; slot++) {
          mesh.getMatrixAt(slot, probe);
          probe.decompose(position, quaternion, scale);
          expect(position.x).toBeGreaterThanOrEqual(bounds.minX);
          expect(position.x).toBeLessThan(bounds.maxX);
          expect(position.z).toBeGreaterThanOrEqual(bounds.minZ);
          expect(position.z).toBeLessThan(bounds.maxZ);
        }
      }
    }
    expect(provider).toHaveBeenCalledTimes(1); // 单资产只加载一次
    expect(sources.size).toBe(1);
    m.dispose();
  });

  it('L 形凹多边形：完全落在缺口里的覆盖块撒点为空 → 不建块 Group', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    const lShape: Vec2[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 100 },
      { x: 0, y: 100 },
    ];
    const params = baseParams({ polygon: lShape, densityPerM2: 0.5 });
    m.setSource('s', params);
    await flush();

    // 期望块集 = coverage 中 scatterChunk 非空的块（domain API 作对照真相源）
    const expectedChunks: string[] = [];
    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        if (scatterChunk(params, chunkRect({ i, j })).length > 0) expectedChunks.push(`chunk:${i}:${j}`);
      }
    }
    expect(expectedChunks.length).toBeLessThan(16); // 确认缺口确实吞掉了块
    expect(m.root.children.map((c) => c.name).sort()).toEqual([...expectedChunks].sort());
    m.dispose();
  });

  it('构造可覆写 chunkSizeM：16m 块 → 同区域块数翻倍', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider, chunkSizeM: 16 });
    m.setSource('s', baseParams({ polygon: rect(0, 0, 32, 32), densityPerM2: 0.5 }));
    await flush();
    // bbox [0,32]² → floor 边界闭含 i,j∈{0,1,2} → 最多 9 块；右/上边块面积零几乎必空，
    // 断言下界 4（至少左下 2×2 实块）与上界 9
    expect(m.root.children.length).toBeGreaterThanOrEqual(4);
    expect(m.root.children.length).toBeLessThanOrEqual(9);
    m.dispose();
  });
});

// ── 合批 ────────────────────────────────────────────────────

describe('ScatterChunkManager：合批', () => {
  it('多资产配比：每 (块×资产) 恰一个 InstancedMesh、各资产实例数分布合理、矩阵逐位一致', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    const params = baseParams({
      polygon: rect(0, 0, 64, 64),
      densityPerM2: 0.5,
      assets: [
        { assetId: 'oak', weight: 40 },
        { assetId: 'pine', weight: 30 },
        { assetId: 'bush', weight: 20 },
      ],
    });
    m.setSource('s', params, 2.5);
    await flush();

    const counts = new Map<string, number>();
    for (const group of m.root.children) {
      expect(group.children).toHaveLength(3); // 每块恰 3 个网格（每资产一个）
      const [i, j] = group.name.split(':').slice(1).map(Number) as [number, number];
      // 该块全部 (资产×槽位) 矩阵与 scatterChunk 输出逐位一致（含 baseY=2.5）
      expectChunkMatchesScatter(m, sources, params, { i, j }, 2.5);
      for (const assetId of ['oak', 'pine', 'bush']) {
        const mesh = meshOf(m, sources, { i, j }, assetId)!;
        counts.set(assetId, (counts.get(assetId) ?? 0) + mesh.count);
      }
    }
    // 配比统计（40/30/20 → 区间断言；64×64×0.5 ≈ 2048 实例大样本）
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(1500);
    expect(counts.get('oak')! / total).toBeGreaterThan(0.33);
    expect(counts.get('oak')! / total).toBeLessThan(0.47);
    expect(counts.get('pine')! / total).toBeGreaterThan(0.23);
    expect(counts.get('bush')! / total).toBeGreaterThan(0.13);
    expect(total).toBe(scatterPolygon(params).length); // 分块合批不丢不重
    expect(provider).toHaveBeenCalledTimes(3);
    m.dispose();
  });

  it('拾取隔离：网格不携带 userData.objectId、root 为场景兄弟组（D5 管线内部数据）', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('s', baseParams());
    await flush();
    expect(m.root.name).toBe('__scatter_chunks__');
    for (const group of m.root.children) {
      for (const child of group.children) {
        expect((child as THREE.Mesh).userData.objectId).toBeUndefined();
        expect((child as THREE.InstancedMesh).isInstancedMesh).toBe(true);
      }
    }
    m.dispose();
  });
});

// ── 生命周期 ────────────────────────────────────────────────

describe('ScatterChunkManager：生命周期', () => {
  it('多边形缩走 → 旧块 Group 回收、实例缓冲释放；区域回来 → 重建且矩阵逐位复原', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    const params = baseParams({ polygon: rect(0, 0, 64, 64) });
    m.setSource('s', params);
    await flush();
    expect(m.root.children).toHaveLength(4);

    // 快照：块组 + 网格引用 + 矩阵缓冲 + dispose 侦听（缓冲释放可观测）
    const groupsBefore = [...m.root.children];
    const meshBefore = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    const snapshot = matrixSnapshot(meshBefore);
    const disposeSpies = m.root.children.flatMap((g) =>
      g.children.map((c) => vi.spyOn(c as THREE.InstancedMesh, 'dispose')),
    );

    // 缩走：同一源换到远处 → 旧块全回收
    m.setSource('s', baseParams({ polygon: rect(100, 100, 116, 116) }));
    await flush();
    for (const group of groupsBefore) expect(group.parent).toBeNull();
    for (const spy of disposeSpies) expect(spy).toHaveBeenCalledTimes(1);
    for (const spy of disposeSpies) spy.mockRestore();
    expect(m.root.children).toHaveLength(1); // 新区域 1 块

    // 回来：重建（新网格对象），矩阵与首建逐位一致（同 seed 确定性）
    m.setSource('s', params);
    await flush();
    expect(m.root.children).toHaveLength(4);
    const meshAfter = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    expect(meshAfter).not.toBe(meshBefore); // 旧网格已释放，重建为新对象
    expect(matrixSnapshot(meshAfter)).toEqual(snapshot);
    m.dispose();
  });

  it('recomputeChunks 列块撒空（多边形挪走）→ 该块回收、其余块不动', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    const params = baseParams({ polygon: rect(0, 0, 64, 64) });
    m.setSource('s', params);
    await flush();
    expect(m.root.children).toHaveLength(4);

    const kept = meshOf(m, sources, { i: 1, j: 1 }, 'asset_tree')!;
    const keptSnapshot = matrixSnapshot(kept);
    m.recomputeChunks('s', [{ i: 0, j: 0 }], baseParams({ polygon: rect(100, 100, 116, 116) }));
    expect(chunkGroupOf(m, { i: 0, j: 0 })).toBeUndefined(); // 列出块撒空 → 回收
    expect(chunkGroupOf(m, { i: 1, j: 1 })).toBeDefined(); // 未列块不拆（调用方契约：computeAffectedChunks 负责列全）
    expect(matrixSnapshot(meshOf(m, sources, { i: 1, j: 1 }, 'asset_tree')!)).toEqual(keptSnapshot);
    m.dispose();
  });

  it('removeSource → 全清；dispose → 零残留（root 无子、后续操作 no-op）', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('a', baseParams({ polygon: rect(0, 0, 64, 64) }));
    m.setSource('b', baseParams({ polygon: rect(0, 0, 64, 64), seed: 42 }));
    await flush();
    expect(m.root.children).toHaveLength(8); // 两源各 4 块
    expect(m.getStats().totalChunks).toBe(8);
    expect(m.getStats().instances).toBeGreaterThan(0);

    m.removeSource('a');
    expect(m.root.children).toHaveLength(4);
    m.removeSource('a'); // 幂等
    expect(m.root.children).toHaveLength(4);

    m.dispose();
    expect(m.root.children).toHaveLength(0);
    expect(m.getStats()).toEqual({ totalChunks: 0, visibleChunks: 0, instances: 0 });
    m.setSource('late', baseParams()); // dispose 后 no-op
    await flush();
    expect(m.root.children).toHaveLength(0);
    expect(() => m.frame(new THREE.PerspectiveCamera())).not.toThrow();
  });

  it('mesh 对象引用稳定：扩容换矩阵缓冲不换对象、缩容保留容量', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    const key: ScatterChunkKey = { i: 0, j: 0 };
    const params = baseParams({ polygon: rect(0, 0, 32, 32), densityPerM2: 0.2 });
    m.setSource('s', params);
    await flush();
    const mesh = meshOf(m, sources, key, 'asset_tree')!;
    const countBefore = mesh.count;
    const capacityBefore = mesh.instanceMatrix.count;

    // 密度翻数倍 → 同一 mesh 对象、缓冲扩容、矩阵与新撒点逐位一致
    const dense = baseParams({ polygon: rect(0, 0, 32, 32), densityPerM2: 1.2 });
    m.recomputeChunks('s', [key], dense);
    expect(chunkGroupOf(m, key)!.children[0]).toBe(mesh);
    expect(mesh.count).toBeGreaterThan(countBefore);
    expect(mesh.instanceMatrix.count).toBeGreaterThanOrEqual(mesh.count);
    expect(mesh.instanceMatrix.count).toBeGreaterThan(capacityBefore);
    expectChunkMatchesScatter(m, sources, dense, key, 0);

    // 密度回降 → mesh 对象不变、容量保留（instanceMatrix.count 不缩）
    const capacityDense = mesh.instanceMatrix.count;
    m.recomputeChunks('s', [key], params);
    expect(chunkGroupOf(m, key)!.children[0]).toBe(mesh);
    expect(mesh.count).toBe(countBefore);
    expect(mesh.instanceMatrix.count).toBe(capacityDense);
    expectChunkMatchesScatter(m, sources, params, key, 0);
    m.dispose();
  });
});

// ── 局部重算与受影响块 ──────────────────────────────────────

describe('ScatterChunkManager：局部重算', () => {
  it('recomputeChunks 子集：未列块 instanceMatrix 快照逐位不变、被列块与新参数全量重建逐位一致', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    const params = baseParams({ polygon: rect(0, 0, 96, 96), densityPerM2: 0.3 });
    m.setSource('s', params);
    await flush();
    const allKeys: ScatterChunkKey[] = [];
    for (const group of m.root.children) {
      const [i, j] = group.name.split(':').slice(1).map(Number) as [number, number];
      allKeys.push({ i, j });
    }
    expect(allKeys.length).toBe(9); // 3×3 块

    // 快照全部块矩阵
    const before = new Map<string, Float32Array>();
    for (const key of allKeys) {
      before.set(`${key.i}:${key.j}`, matrixSnapshot(meshOf(m, sources, key, 'asset_tree')!));
    }

    // 只重算中心块（机制锁定：keys 由调用方给，最小子集 = 单块）
    const dense = baseParams({ polygon: rect(0, 0, 96, 96), densityPerM2: 0.9 });
    m.recomputeChunks('s', [{ i: 1, j: 1 }], dense);

    // 未列块：矩阵缓冲逐位不变（Float32Array 快照精确比对）
    for (const key of allKeys) {
      if (key.i === 1 && key.j === 1) continue;
      expect(matrixSnapshot(meshOf(m, sources, key, 'asset_tree')!)).toEqual(before.get(`${key.i}:${key.j}`));
    }
    // 被列块：与新参数全量重建的对应块逐位一致（对照管理器）
    const { provider: refProvider, sources: refSources } = makeProvider();
    const ref = new ScatterChunkManager({ provideSource: refProvider });
    ref.setSource('ref', dense);
    await flush();
    expectChunkMatchesScatter(m, sources, dense, { i: 1, j: 1 }, 0);
    expect(matrixSnapshot(meshOf(m, sources, { i: 1, j: 1 }, 'asset_tree')!)).toEqual(
      matrixSnapshot(meshOf(ref, refSources, { i: 1, j: 1 }, 'asset_tree')!),
    );
    // 未列块仍是旧参数的结果（与旧参数对照管理器一致——未被新参数污染）
    const { provider: oldProvider, sources: oldSources } = makeProvider();
    const oldRef = new ScatterChunkManager({ provideSource: oldProvider });
    oldRef.setSource('old', params);
    await flush();
    expect(matrixSnapshot(meshOf(m, sources, { i: 0, j: 2 }, 'asset_tree')!)).toEqual(
      matrixSnapshot(meshOf(oldRef, oldSources, { i: 0, j: 2 }, 'asset_tree')!),
    );
    m.dispose();
    ref.dispose();
    oldRef.dispose();
  });

  it('同 seed 双跑全量重建逐位一致；单块重撒 == 全量重建对应块（manager 层确定性锁）', async () => {
    const params = baseParams({
      polygon: rect(-32, -32, 32, 32),
      densityPerM2: 0.3,
      clustering: 0.5,
      edgeFalloffM: 4,
    });
    // 独立管理器双跑（跨负坐标原点 + 两层混合 + 衰减复合场景）：逐块矩阵快照一致
    const m1 = new ScatterChunkManager({ provideSource: makeProvider().provider });
    const m2 = new ScatterChunkManager({ provideSource: makeProvider().provider });
    m1.setSource('s', params);
    m2.setSource('s', baseParams(params)); // 深拷贝参数对象（双跑不共享可变引用）
    await flush();
    const names1 = m1.root.children.map((c) => c.name).sort();
    expect(names1).toEqual(m2.root.children.map((c) => c.name).sort());
    for (const name of names1) {
      const mesh1 = m1.root.children.find((c) => c.name === name)!.children[0] as THREE.InstancedMesh;
      const mesh2 = m2.root.children.find((c) => c.name === name)!.children[0] as THREE.InstancedMesh;
      expect(mesh1.count).toBe(mesh2.count);
      expect(matrixSnapshot(mesh1)).toEqual(matrixSnapshot(mesh2));
    }

    // 单块重撒 == 全量重建对应块：m1 重撒一块（参数不变）后仍与 m2 逐位一致
    const center = { i: -1, j: 0 };
    m1.recomputeChunks('s', [center]);
    const mesh1 = m1.root.children.find((c) => c.name === `chunk:${center.i}:${center.j}`)!.children[0] as THREE.InstancedMesh;
    const mesh2 = m2.root.children.find((c) => c.name === `chunk:${center.i}:${center.j}`)!.children[0] as THREE.InstancedMesh;
    expect(matrixSnapshot(mesh1)).toEqual(matrixSnapshot(mesh2));
    m1.dispose();
    m2.dispose();
  });

  it('recomputeChunks 未知 id 安全 no-op；空 keys no-op', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('s', baseParams());
    await flush();
    const before = m.root.children.length;
    expect(() => m.recomputeChunks('ghost', [{ i: 0, j: 0 }])).not.toThrow();
    expect(() => m.recomputeChunks('s', [])).not.toThrow();
    expect(m.root.children).toHaveLength(before);
    m.dispose();
  });
});

describe('computeAffectedChunks：受影响块纯函数', () => {
  it('参数完全相等 → 空集', () => {
    const params = baseParams({ polygon: rect(1, 1, 21, 21) });
    expect(computeAffectedChunks(params, baseParams(params))).toEqual([]);
  });

  it('顶点移动（整体平移）：受影响 = 旧 ∪ 新覆盖块（去重、(i,j) 升序）', () => {
    const oldParams = baseParams({ polygon: rect(0, 0, 20, 20) });
    const newParams = baseParams({ polygon: rect(90, 0, 110, 20) });
    const keys = computeAffectedChunks(oldParams, newParams);
    // 旧块 (0,0)；新块 floor(90/32)=2..floor(110/32)=3, j=0 → (2,0),(3,0)
    expect(keys).toEqual([
      { i: 0, j: 0 },
      { i: 2, j: 0 },
      { i: 3, j: 0 },
    ]);
  });

  it('多边形逐点相等但全局参数变（density/seed）→ 全部覆盖块（外扩并集 ⊇ bbox 覆盖）', () => {
    const polygon = rect(1, 1, 61, 33); // 覆盖 i∈{0,1} j∈{0,1}
    for (const mutate of [
      (p: ScatterParams) => ({ ...p, densityPerM2: p.densityPerM2 * 2 }),
      (p: ScatterParams) => ({ ...p, seed: p.seed + 1 }),
      (p: ScatterParams) => ({ ...p, assets: [{ assetId: 'other', weight: 1 }] }),
      (p: ScatterParams) => ({ ...p, scaleRange: { min: 0.5, max: 1.5 } }),
    ]) {
      const keys = computeAffectedChunks(baseParams({ polygon }), mutate(baseParams({ polygon })));
      const strs = keys.map((k) => `${k.i}:${k.j}`);
      for (const expected of ['0:0', '1:0', '0:1', '1:1']) expect(strs).toContain(expected);
      expect(keys.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('聚簇参数 → bbox 外扩 clusterRadius + clusterStep 的覆盖块；关聚簇不外扩', () => {
    const polygon = rect(0, 0, 20, 20);
    // 聚簇开（clustering 0.5）：pad = R + H = 5 + 5·√(4π) ≈ 22.7 → i,j ∈ {-1,0,1} → 9 块
    const clustered = baseParams({ polygon, densityPerM2: 0.5, clustering: 0.5 });
    const keys = computeAffectedChunks(clustered, { ...clustered, seed: clustered.seed + 1 });
    expect(keys).toHaveLength(9);
    expect(keys.map((k) => `${k.i}:${k.j}`)).toContain('-1:-1');
    expect(keys.map((k) => `${k.i}:${k.j}`)).toContain('1:1');
    // 聚簇关（clustering 0）：pad 0 → 1 块
    const uniform = baseParams({ polygon, densityPerM2: 0.5, clustering: 0 });
    expect(computeAffectedChunks(uniform, { ...uniform, seed: uniform.seed + 1 })).toEqual([{ i: 0, j: 0 }]);
  });

  it('边缘衰减 → bbox 外扩 falloff 的覆盖块', () => {
    const polygon = rect(0, 0, 20, 20);
    const p = baseParams({ polygon, edgeFalloffM: 40 });
    const keys = computeAffectedChunks(p, { ...p, seed: p.seed + 1 });
    // pad 40 → floor(-40/32) = -2 .. floor(60/32) = 1 → 4×4 = 16 块
    expect(keys).toHaveLength(16);
  });

  it('退化多边形（<3 顶点）一侧 → 只剩另一侧覆盖块；双侧退化 → 空集', () => {
    const valid = baseParams({ polygon: rect(0, 0, 20, 20) });
    const degenerate = baseParams({ polygon: [{ x: 0, y: 0 }, { x: 1, y: 1 }] });
    expect(computeAffectedChunks(valid, degenerate)).toEqual([{ i: 0, j: 0 }]);
    expect(computeAffectedChunks(degenerate, degenerate)).toEqual([]);
  });
});

// ── 逐块视锥剔除 ───────────────────────────────────────────

describe('ScatterChunkManager：逐块视锥剔除', () => {
  it('frame：frustum 外块 visible=false、内块 true（俯视窄视场只罩住左下块）', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('s', baseParams({ polygon: rect(0, 0, 64, 64), densityPerM2: 0.3 }));
    await flush();
    expect(m.root.children).toHaveLength(4);
    for (const group of m.root.children) expect(group.visible).toBe(true); // frame 前恒可见

    // 相机在 (10,200,10) 垂直向下、fov 5° → 地面视场半径 ≈ 200·tan(2.5°) ≈ 8.7m，
    // 只罩住含 (10,10) 的块 (0,0)；far 300 防止金字塔越过地面继续展宽
    const camera = new THREE.PerspectiveCamera(5, 1, 1, 300);
    camera.position.set(10, 200, 10);
    camera.lookAt(10, 0, 10);
    m.frame(camera);

    expect(chunkGroupOf(m, { i: 0, j: 0 })!.visible).toBe(true);
    expect(chunkGroupOf(m, { i: 0, j: 1 })!.visible).toBe(false);
    expect(chunkGroupOf(m, { i: 1, j: 0 })!.visible).toBe(false);
    expect(chunkGroupOf(m, { i: 1, j: 1 })!.visible).toBe(false);

    // 相机拉远罩住全部 → 全可见
    camera.position.set(32, 500, 32);
    camera.lookAt(32, 0, 32);
    camera.far = 2000;
    camera.updateProjectionMatrix();
    m.frame(camera);
    for (const group of m.root.children) expect(group.visible).toBe(true);
    m.dispose();
  });

  it('frame 无源 O(1) 早退：不抛错、不触碰任何可见状态', () => {
    const m = new ScatterChunkManager({ provideSource: makeProvider().provider });
    expect(() => m.frame(new THREE.PerspectiveCamera())).not.toThrow();
    m.dispose();
    expect(() => m.frame(new THREE.PerspectiveCamera())).not.toThrow(); // dispose 后同样安全
  });
});

// ── 逐实例色（散布只吃色相，同 T002.3 语义）────────────────

describe('ScatterChunkManager：逐实例色', () => {
  it('hueJitter 资产 → instanceColor 存在、逐槽与 applyAssetVariants + hueOffsetToMultiplier 一致、非全白', async () => {
    const { provider, sources } = makeProvider();
    const variants: ProceduralVariants = { hueJitter: 8 };
    const m = new ScatterChunkManager({ provideSource: provider, getAssetVariants: () => variants });
    const params = baseParams({ polygon: rect(0, 0, 32, 32), densityPerM2: 0.4 });
    m.setSource('s', params);
    await flush();
    const mesh = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    expect(mesh).toBeDefined();
    expect(mesh.instanceColor).not.toBeNull();
    expect(mesh.instanceColor!.count).toBe(mesh.instanceMatrix.count); // 容量对齐（防越界静默丢失）

    // 逐槽换算一致（slot 序 = scatterChunk 输出序）+ 非全白（大样本必有偏移 ≠ 0）
    const expected = scatterChunk(params, chunkRect({ i: 0, j: 0 }));
    let nonWhite = 0;
    const got = new THREE.Color();
    const f32 = (v: number): number => Float32Array.from([v])[0]!;
    for (let slot = 0; slot < expected.length; slot++) {
      const { hueOffset } = applyAssetVariants(variants, expected[slot]!.variantSeed);
      const tint = hueOffsetToMultiplier(hueOffset);
      mesh.getColorAt(slot, got);
      expect([got.r, got.g, got.b]).toEqual([f32(tint.r), f32(tint.g), f32(tint.b)]);
      if (hueOffset !== 0) nonWhite += 1;
    }
    expect(nonWhite).toBeGreaterThan(0);
    m.dispose();
  });

  it('无 hueJitter 声明 → 不建 instanceColor 缓冲（GLB 资产行为零变化）', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider }); // 无 getAssetVariants
    m.setSource('s', baseParams());
    await flush();
    const mesh = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    expect(mesh.instanceColor).toBeNull();
    // 声明存在但 hueJitter=0 / 缺省 → 同样不建
    const m2 = new ScatterChunkManager({
      provideSource: makeProvider().provider,
      getAssetVariants: () => ({ scaleJitter: 0.1, rotationJitter: 30 }),
    });
    m2.setSource('s', baseParams());
    await flush();
    const mesh2 = m2.root.children[0]!.children[0] as THREE.InstancedMesh;
    expect(mesh2.instanceColor).toBeNull();
    m.dispose();
    m2.dispose();
  });
});

// ── 源级显隐 + 拾取反查（T003.3）────────────────────────────

describe('ScatterChunkManager：源级显隐', () => {
  it('setSourceVisible(false) → 整片块组 visible=false（不待帧）；恢复可见由 frame 视锥判定接管', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('s', baseParams({ polygon: rect(0, 0, 64, 64), densityPerM2: 0.3 }));
    await flush();
    expect(m.root.children).toHaveLength(4);
    expect(m.getStats().visibleChunks).toBe(4);

    m.setSourceVisible('s', false);
    for (const group of m.root.children) expect(group.visible).toBe(false);
    expect(m.getStats().visibleChunks).toBe(0);
    m.setSourceVisible('s', false); // 幂等
    expect(m.getStats().visibleChunks).toBe(0);

    m.setSourceVisible('s', true); // 不立即改写（视锥归 frame 管）
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 5000);
    camera.position.set(32, 200, 32);
    camera.lookAt(32, 0, 32);
    m.frame(camera);
    for (const group of m.root.children) expect(group.visible).toBe(true);

    m.setSourceVisible('ghost', false); // 未知 id 安全 no-op
    m.dispose();
  });

  it('隐藏源重建（setSource 同 id）→ 继承隐藏态；隐藏期间局部重算扩出的新块不闪现', async () => {
    const { provider } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('s', baseParams({ polygon: rect(0, 0, 32, 32), densityPerM2: 0.3 }));
    await flush();
    m.setSourceVisible('s', false);

    // 全量重建：继承 hidden
    m.setSource('s', baseParams({ polygon: rect(0, 0, 64, 64), densityPerM2: 0.3 }));
    await flush();
    expect(m.root.children).toHaveLength(4);
    for (const group of m.root.children) expect(group.visible).toBe(false);

    // 局部重算扩块（覆盖新 territory）：新块保持不可见
    m.recomputeChunks('s', [{ i: 2, j: 0 }], baseParams({ polygon: rect(0, 0, 96, 64), densityPerM2: 0.3 }));
    await flush();
    const added = m.root.children.find((c) => c.name === 'chunk:2:0');
    expect(added).toBeDefined();
    expect(added!.visible).toBe(false);
    m.dispose();
  });
});

describe('ScatterChunkManager：拾取反查（resolvePick，D18.7）', () => {
  /** 构造以命中网格为 object 的伪 Intersection（resolvePick 只读 object/instanceId） */
  function hitOf(mesh: THREE.Object3D): THREE.Intersection {
    return { object: mesh, instanceId: 0 } as unknown as THREE.Intersection;
  }

  it('散布网格命中 → 所属源 id；跨源不串；非实例/未知网格 → null', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('region_a', baseParams({ polygon: rect(0, 0, 32, 32) }));
    m.setSource('region_b', baseParams({ polygon: rect(100, 0, 132, 32) }));
    await flush();
    const meshA = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    const meshB = meshOf(m, sources, { i: 3, j: 0 }, 'asset_tree')!;
    expect(m.resolvePick(hitOf(meshA))).toBe('region_a');
    expect(m.resolvePick(hitOf(meshB))).toBe('region_b');
    expect(m.resolvePick(hitOf(new THREE.Mesh()))).toBeNull(); // 非本管网格
    expect(m.resolvePick(hitOf(new THREE.Group()))).toBeNull(); // 非实例
    m.dispose();
  });

  it('网格绝不携带 userData.objectId（D5 红线：不进对象表/大纲误收路径）', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('region_a', baseParams());
    await flush();
    const mesh = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    expect(mesh.userData.objectId).toBeUndefined();
    m.dispose();
  });

  it('源隐藏 / 视锥剔除的块组 → 命中不可选（r186 raycaster 不跳 visible=false，须显式挡）', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('region_a', baseParams({ polygon: rect(0, 0, 32, 32) }));
    await flush();
    const mesh = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    expect(m.resolvePick(hitOf(mesh))).toBe('region_a');

    m.setSourceVisible('region_a', false); // 源隐藏 → 不可拾取
    expect(m.resolvePick(hitOf(mesh))).toBeNull();
    m.setSourceVisible('region_a', true);

    const camera = new THREE.PerspectiveCamera(60, 1, 1, 200);
    camera.position.set(0, 120, -500); // 相机背对区域（在远处看向 -z 反侧）
    camera.lookAt(0, 0, -1000);
    m.frame(camera); // 视锥剔除 → 块组 visible=false
    expect(m.resolvePick(hitOf(mesh))).toBeNull();
    m.dispose();
  });

  it('摘源 / dispose 后网格不可再反查（映射随网格生灭严格成对清理）', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    m.setSource('region_a', baseParams({ polygon: rect(0, 0, 32, 32) }));
    await flush();
    const mesh = meshOf(m, sources, { i: 0, j: 0 }, 'asset_tree')!;
    expect(m.resolvePick(hitOf(mesh))).toBe('region_a');
    m.removeSource('region_a');
    expect(m.resolvePick(hitOf(mesh))).toBeNull();
    m.dispose();
  });
});

// ── 异步源 ─────────────────────────────────────────────────

describe('ScatterChunkManager：异步源', () => {
  it('源未就绪：块 Group 先建、网格零（登记实例数据）；到达后建网格、总数 = 全量撒点', async () => {
    const { provider, sources } = makeProvider();
    const m = new ScatterChunkManager({ provideSource: provider });
    const params = baseParams({ polygon: rect(0, 0, 64, 64), densityPerM2: 0.3 });
    m.setSource('s', params);
    // 未冲刷微任务：源在路上 → 块组已建、无任何网格
    expect(m.root.children.length).toBe(4);
    let meshes = 0;
    m.root.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) meshes += 1;
    });
    expect(meshes).toBe(0);

    await flush();
    meshes = 0;
    let instances = 0;
    for (const group of m.root.children) {
      for (const child of group.children) {
        const mesh = child as THREE.InstancedMesh;
        expect(mesh.isInstancedMesh).toBe(true);
        meshes += 1;
        instances += mesh.count;
      }
    }
    expect(meshes).toBe(4);
    expect(instances).toBe(scatterPolygon(params).length);
    expect(sources.get('asset_tree')).toBeDefined();
    m.dispose();
  });

  it('源加载失败：告警一次、渲染根零网格、后续操作不崩；同资产不重试', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const good = fakeSource();
      const provider = vi.fn(async (assetId: string): Promise<InstanceSource> => {
        if (assetId === 'bad') throw new Error('GLB 404');
        return good;
      });
      const m = new ScatterChunkManager({ provideSource: provider });
      m.setSource('s', baseParams({ assets: [{ assetId: 'bad', weight: 1 }] }));
      m.setSource('t', baseParams({ assets: [{ assetId: 'good', weight: 1 }] }));
      await flush();

      let meshes = 0;
      m.root.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) meshes += 1;
      });
      expect(meshes).toBe(4); // 只有 good 源的 4 块网格
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        '[ScatterChunkManager] 散布资产源加载失败，实例不渲染',
        'bad',
        expect.anything(),
      );

      // 失败资产的再次登记不重试（provider 只被调用一次）、不崩
      m.setSource('u', baseParams({ assets: [{ assetId: 'bad', weight: 1 }] }));
      await flush();
      expect(provider.mock.calls.filter((c) => c[0] === 'bad')).toHaveLength(1);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(() => m.frame(new THREE.PerspectiveCamera())).not.toThrow();
      m.dispose();
    } finally {
      warn.mockRestore();
    }
  });
});
