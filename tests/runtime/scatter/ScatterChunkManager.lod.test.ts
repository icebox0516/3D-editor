/**
 * tests/runtime/scatter/ScatterChunkManager.lod.test.ts —— 块×档分桶与换档测试（T006.3，D27.4/D27.6）。
 *
 * 覆盖（任务书验收清单；阈值一律经 LOD_THRESHOLDS 相对构造，不硬编码数值——后续锁值不碎测试）：
 * - 选档带：近 high → 中 mid → 远 low → 超远 culled（网格 visible=false、桶保留）→ 回视恢复；
 * - 迟滞防抖：降档过名义线立即执行；阈值带内往返不抖动换档（桶/源请求零churn）；
 *   升档越过 名义边界×(1−band) 才回档；
 * - 换档重建实例完整：确定性重撒（同 seed）跨档 count/矩阵/逐实例色逐位一致；桶 = 当档
 *   源 geometry/material 成套（D27.4「不做桶内换 Source」）；
 * - 拾取跨档一致：任意档网格命中 → 同一源 id；culled 网格不可拾取；
 * - 总开关：off = 全 High（mid/low 桶确定性重建回 high）+ culled 旁路；
 * - 块生命周期：局部重算保档（内容编辑不改档位状态）、区域扩块新块评估收敛同档、
 *   摘源重建（撤销重做模型）后同参确定性复原；
 * - 单档资产（无 levels 声明）：恒 high 但超远仍可 culled（culled 非声明档位）；
 * - frame 单参（无 LOD）= 既有行为：超远不裁剪、恒 high。
 * 边界：fake 源提供者按 (assetId × level) 分源（几何身份即档位标签）；几何包围
 *      手工钉死（半径 R / Y 顶 1）——选档输入确定性；评估器语义本身由 006.1 测试锁定。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { LOD_THRESHOLDS } from '../../../src/domain/lod/lodPolicy';
import type { ProceduralLevel } from '../../../src/domain/assets';
import type { ScatterInstance, ScatterParams } from '../../../src/domain/scatter';
import { scatterChunk } from '../../../src/domain/scatter';
import type { Vec2 } from '../../../src/core/types';
import { ScatterChunkManager } from '../../../src/runtime/scatter/ScatterChunkManager';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具 ────────────────────────────────────────────────

/** 源几何包围球半径（选档输入；fov 90° 下 m = 视距 / R） */
const SOURCE_RADIUS = 5;
/** 全部档位几何共享同一 Y 包围 [-1,1]（实例 scale=1、baseY=0 → 块盒 Y 顶 = 1） */
const GEO_HALF = 1;

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
    polygon: rect(0, 0, 20, 20),
    densityPerM2: 0.05,
    assets: [{ assetId: 'asset_tree', weight: 1 }],
    seed: 123456789,
    scaleRange: { min: 1, max: 1 }, // 确定性 scale=1：块内 max scale 恒 1，选档距离可精确构造
    ...overrides,
  };
}

/** 当档源：几何身份即 (assetId × level) 标签（按调用现场 key 缓存于 provider）；包围手工钉死（惰性计算被预设短路） */
function leveledSource(): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingBox = new THREE.Box3(
    new THREE.Vector3(-GEO_HALF, -GEO_HALF, -GEO_HALF),
    new THREE.Vector3(GEO_HALF, GEO_HALF, GEO_HALF),
  );
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), SOURCE_RADIUS);
  return {
    geometry,
    material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
    // 档位标签入 userData 仅供调试；断言按 geometry 身份
  };
}

/** fake 源提供者：每 (assetId × level) 一份共享源（镜像缓存 sourceKey::level 去重语义） */
function makeLeveledProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(async (assetId: string, level?: ProceduralLevel): Promise<InstanceSource> => {
    const key = `${assetId}::${level ?? 'high'}`;
    let source = sources.get(key);
    if (!source) {
      source = leveledSource();
      sources.set(key, source);
    }
    return source;
  });
  return { provider, sources };
}

function sourceOf(
  sources: Map<string, InstanceSource>,
  assetId: string,
  level: ProceduralLevel,
): InstanceSource {
  const source = sources.get(`${assetId}::${level}`);
  expect(source).toBeDefined();
  return source!;
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * 目标度量 m 处的俯视相机（fov 90° → tan(fovY/2)=1 → m = 视距 / (R×scale)，scale=1）：
 * 置于块 (0,0) 中心正上方，块盒 Y 顶 = baseY + GEO_HALF×maxScale = 1 → 最近点距离 = camY − 1。
 */
function cameraAtM(m: number, aspect = 1): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, aspect, 0.5, 100000);
  const distance = m * SOURCE_RADIUS;
  camera.position.set(10, GEO_HALF + distance, 10);
  camera.lookAt(10, 0, 10);
  return camera;
}

/** 块 (0,0) 内 assetId 的当档网格（按各档源几何身份反查）；返回 mesh 与其档位 */
function activeMeshOf(
  m: ScatterChunkManager,
  sources: Map<string, InstanceSource>,
  assetId: string,
  levels: readonly ProceduralLevel[] = ['high', 'mid', 'low'],
): { mesh: THREE.InstancedMesh; level: ProceduralLevel } | undefined {
  const group = m.root.children.find((c) => c.name === 'chunk:0:0');
  if (!group) return undefined;
  for (const level of levels) {
    const geometry = sources.get(`${assetId}::${level}`)?.geometry;
    const hit = group.children.find(
      (c) => (c as THREE.InstancedMesh).isInstancedMesh && (c as THREE.InstancedMesh).geometry === geometry,
    );
    if (hit) return { mesh: hit as THREE.InstancedMesh, level };
  }
  return undefined;
}

/** 期望实例列表（domain scatterChunk 作对照真相源；块 (0,0)、32m 块） */
function truthInstances(params: ScatterParams, assetId: string): ScatterInstance[] {
  return scatterChunk(params, { minX: 0, minZ: 0, maxX: 32, maxZ: 32 }).filter(
    (inst) => inst.assetId === assetId,
  );
}

/** 网格已用槽位矩阵快照（逐位比对用） */
function matrixSnapshot(mesh: THREE.InstancedMesh): Float32Array {
  return Float32Array.from(mesh.instanceMatrix.array.subarray(0, mesh.count * 16));
}

/** 网格已用槽位颜色快照（无颜色缓冲 → null） */
function colorSnapshot(mesh: THREE.InstancedMesh): Float32Array | null {
  if (!mesh.instanceColor) return null;
  return Float32Array.from(mesh.instanceColor.array.subarray(0, mesh.count * 3));
}

/** 换档评估 + 冷源落地（frame 触发调度，微任务冲刷后断档） */
async function settleAt(m: ScatterChunkManager, camera: THREE.PerspectiveCamera, lodEnabled = true) {
  m.frame(camera, lodEnabled);
  await flush();
}

// ── 选档带 ──────────────────────────────────────────────────

describe('ScatterChunkManager LOD：选档带与换档', () => {
  it('近 high → mid → low → 超远 culled（网格隐藏桶保留）→ 回视恢复', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();

    const t = LOD_THRESHOLDS;
    await settleAt(m, cameraAtM(t.highToMid * 0.9));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('high');

    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');

    const farM = t.midToLow + (t.lowToCulled - t.midToLow) / 2; // low 带内
    await settleAt(m, cameraAtM(farM));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('low');

    // 超远：culled = 网格 visible=false（块组与桶保留——回视即时恢复）
    await settleAt(m, cameraAtM(t.lowToCulled * 1.1));
    const culled = activeMeshOf(m, sources, 'asset_tree');
    expect(culled?.level).toBe('low'); // 桶保留在最后档
    expect(culled?.mesh.visible).toBe(false);

    // 回视（升档越过 culled 名义界 ×(1−band)）：恢复可见
    await settleAt(m, cameraAtM(farM));
    const restored = activeMeshOf(m, sources, 'asset_tree');
    expect(restored?.mesh.visible).toBe(true);
    expect(restored?.level).toBe('low');
    m.dispose();
  });

  it('源按 (assetId × level) 各加载一次（档位维度去重，跨档不重复请求）', async () => {
    const { provider } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    await settleAt(m, cameraAtM(t.midToLow * 1.1));
    await settleAt(m, cameraAtM(t.highToMid * 0.5)); // 回 high
    await settleAt(m, cameraAtM(t.midToLow * 1.1)); // 再 low
    expect(provider).toHaveBeenCalledTimes(3); // high/mid/low 各一次
    m.dispose();
  });
});

// ── 迟滞防抖 ────────────────────────────────────────────────

describe('ScatterChunkManager LOD：迟滞防抖', () => {
  it('降档过名义线立即执行；阈值带内往返不抖动（桶与源请求零 churn）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    // high → 略过名义线：立即降 mid
    await settleAt(m, cameraAtM(t.highToMid * 1.05));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    const callsAfterDowngrade = provider.mock.calls.length;

    // 带内往返（名义线 ×(1−band) ~ 名义线 开区间内振荡多次）：保持 mid、零新请求
    const bandLow = t.highToMid * (1 - t.hysteresisBand);
    for (const frac of [0.05, 0.5, 0.95, 0.3, 0.8]) {
      const inBandM = bandLow + (t.highToMid - bandLow) * frac;
      await settleAt(m, cameraAtM(inBandM));
      expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    }
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade);

    // 越过升档线（< 名义线 ×(1−band)）：回 high
    await settleAt(m, cameraAtM(bandLow * 0.97));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('high');
    m.dispose();
  });

  it('静止相机在带内：连续多帧零换档（无抖动源）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;
    await settleAt(m, cameraAtM(t.highToMid * 1.05));
    const camera = cameraAtM(t.highToMid * 1.01); // 带内静止
    for (let i = 0; i < 5; i++) {
      m.frame(camera, true);
      await flush();
      expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    }
    expect(provider).toHaveBeenCalledTimes(2);
    m.dispose();
  });
});

// ── 换档重建实例完整 ────────────────────────────────────────

describe('ScatterChunkManager LOD：换档重建实例完整（确定性重撒）', () => {
  it('跨档 count/矩阵/逐实例色逐位一致；桶 = 当档源 geometry/material 成套', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
      getAssetVariants: () => ({ hueJitter: 8 }),
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    const high = activeMeshOf(m, sources, 'asset_tree')!;
    expect(high.level).toBe('high');
    expect(high.mesh.geometry).toBe(sourceOf(sources, 'asset_tree', 'high').geometry);
    expect(high.mesh.material).toBe(sourceOf(sources, 'asset_tree', 'high').material);
    const matrices = matrixSnapshot(high.mesh);
    const colors = colorSnapshot(high.mesh);
    const truth = truthInstances(baseParams(), 'asset_tree');
    expect(high.mesh.count).toBe(truth.length);
    expect(colors).not.toBeNull(); // hueJitter → instanceColor 存在

    // high → mid → low：实例集合逐位一致（同 seed 确定性），只换当档成套源
    for (const level of ['mid', 'low'] as const) {
      const targetM = level === 'mid' ? t.highToMid * 1.1 : t.midToLow * 1.1;
      await settleAt(m, cameraAtM(targetM));
      const mesh = activeMeshOf(m, sources, 'asset_tree')!;
      expect(mesh.level).toBe(level);
      expect(mesh.mesh.geometry).toBe(sourceOf(sources, 'asset_tree', level).geometry);
      expect(mesh.mesh.material).toBe(sourceOf(sources, 'asset_tree', level).material);
      expect(mesh.mesh.count).toBe(truth.length);
      expect(matrixSnapshot(mesh.mesh)).toEqual(matrices);
      expect(colorSnapshot(mesh.mesh)).toEqual(colors);
    }
    m.dispose();
  });

  it('换档拆旧桶建新桶：旧档网格移除释放（块内该资产网格恒一个）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const group = m.root.children.find((c) => c.name === 'chunk:0:0')!;
    expect(group.children).toHaveLength(1);
    const t = LOD_THRESHOLDS;
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    expect(group.children).toHaveLength(1); // 拆旧建新后仍恰一个当档桶
    expect((group.children[0] as THREE.InstancedMesh).geometry).toBe(
      sourceOf(sources, 'asset_tree', 'mid').geometry,
    );
    m.dispose();
  });
});

// ── 拾取跨档一致 ────────────────────────────────────────────

describe('ScatterChunkManager LOD：拾取跨档一致', () => {
  function hitOf(mesh: THREE.Object3D): THREE.Intersection {
    return { object: mesh, instanceId: 0 } as unknown as THREE.Intersection;
  }

  it('任意档网格命中 → 同一源 id；culled 网格不可拾取', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('region_a', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    expect(m.resolvePick(hitOf(activeMeshOf(m, sources, 'asset_tree')!.mesh))).toBe('region_a');
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    expect(m.resolvePick(hitOf(activeMeshOf(m, sources, 'asset_tree')!.mesh))).toBe('region_a');
    await settleAt(m, cameraAtM(t.midToLow * 1.1));
    expect(m.resolvePick(hitOf(activeMeshOf(m, sources, 'asset_tree')!.mesh))).toBe('region_a');

    // culled：网格 visible=false → 挡板拦截（r186 raycaster 不跳 visible=false）
    await settleAt(m, cameraAtM(t.lowToCulled * 1.1));
    expect(m.resolvePick(hitOf(activeMeshOf(m, sources, 'asset_tree')!.mesh))).toBeNull();
    m.dispose();
  });
});

// ── LOD 总开关 ─────────────────────────────────────────────

describe('ScatterChunkManager LOD：总开关（off = 全 High + culled 旁路）', () => {
  it('mid/low 桶确定性重建回 high；超远不裁剪（culled 旁路）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    // 推到 low
    await settleAt(m, cameraAtM(t.midToLow * 1.1));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('low');

    // 超远 + 开关关：恒 high 且可见
    await settleAt(m, cameraAtM(t.lowToCulled * 1.5), false);
    const mesh = activeMeshOf(m, sources, 'asset_tree')!;
    expect(mesh.level).toBe('high');
    expect(mesh.mesh.visible).toBe(true);

    // 再开（同机位超远）：重新 culled——开旁路可逆
    await settleAt(m, cameraAtM(t.lowToCulled * 1.5), true);
    expect(activeMeshOf(m, sources, 'asset_tree')?.mesh.visible).toBe(false);
    m.dispose();
  });

  it('frame 单参（未接线 LOD）= 既有行为：超远不裁剪、恒 high', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const camera = cameraAtM(LOD_THRESHOLDS.lowToCulled * 2);
    m.frame(camera); // 缺省 lodEnabled=false
    await flush();
    const mesh = activeMeshOf(m, sources, 'asset_tree')!;
    expect(mesh.level).toBe('high');
    expect(mesh.mesh.visible).toBe(true);
    m.dispose();
  });
});

// ── 块生命周期（epic Requirements 点名：跨块编辑/重建复用/撤销重做）──

describe('ScatterChunkManager LOD：块生命周期', () => {
  it('局部重算保档：mid 桶上编辑密度 → 仍 mid、实例与新参数一致（内容编辑不改档位状态）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    const params = baseParams();
    m.setSource('s', params);
    await flush();
    const t = LOD_THRESHOLDS;
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');

    // 密度加倍（内容编辑）：局部重算保档、实例 = 新参数真相源
    const dense = baseParams({ densityPerM2: 0.1 });
    m.recomputeChunks('s', [{ i: 0, j: 0 }], dense);
    await flush();
    const mesh = activeMeshOf(m, sources, 'asset_tree')!;
    expect(mesh.level).toBe('mid');
    expect(mesh.mesh.count).toBe(truthInstances(dense, 'asset_tree').length);
    m.dispose();
  });

  it('区域扩块：新块评估收敛同档（同相机同带）；跨块编辑受影响块集齐换档', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams({ polygon: rect(0, 0, 20, 20) }));
    await flush();
    expect(m.root.children).toHaveLength(1);
    const t = LOD_THRESHOLDS;
    const camera = cameraAtM(t.highToMid * 1.1);
    await settleAt(m, camera);
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');

    // 区域扩到第二块（20→40 跨块）：新块建后同帧评估收敛 mid
    m.setSource('s', baseParams({ polygon: rect(0, 0, 40, 20), densityPerM2: 0.05 }));
    await flush();
    expect(m.root.children).toHaveLength(2);
    m.frame(camera, true);
    await flush();
    for (const name of ['chunk:0:0', 'chunk:1:0']) {
      const group = m.root.children.find((c) => c.name === name)!;
      const mesh = group.children[0] as THREE.InstancedMesh;
      expect(mesh.geometry).toBe(sourceOf(sources, 'asset_tree', 'mid').geometry);
    }
    m.dispose();
  });

  it('摘源重建（撤销重做模型）：同参确定性复原 + 档位状态重新收敛一致', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    const params = baseParams();
    m.setSource('s', params);
    await flush();
    const t = LOD_THRESHOLDS;
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    const before = matrixSnapshot(activeMeshOf(m, sources, 'asset_tree')!.mesh);

    // 撤销（摘源）→ 重做（同参重建）：实例逐位复原、档位收敛 mid
    m.removeSource('s');
    expect(m.root.children).toHaveLength(0);
    m.setSource('s', params);
    await flush();
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('high'); // 新块 high 起步
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    const after = activeMeshOf(m, sources, 'asset_tree')!;
    expect(after.level).toBe('mid');
    expect(matrixSnapshot(after.mesh)).toEqual(before);
    m.dispose();
  });
});

// ── 单档资产（缺省 levels 语义）─────────────────────────────

describe('ScatterChunkManager LOD：单档资产', () => {
  it('无 levels 声明：恒 high（无 mid/low 请求）、超远仍 culled', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({ provideSource: provider }); // 无 getAssetLevels
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    await settleAt(m, cameraAtM(t.midToLow * 1.1)); // 名义 low 带 → 单档跳档回 high
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('high');
    expect(provider).toHaveBeenCalledTimes(1); // 只有 high 源

    await settleAt(m, cameraAtM(t.lowToCulled * 1.1));
    expect(activeMeshOf(m, sources, 'asset_tree')?.mesh.visible).toBe(false); // culled 非声明档位，单档也可裁
    m.dispose();
  });
});
