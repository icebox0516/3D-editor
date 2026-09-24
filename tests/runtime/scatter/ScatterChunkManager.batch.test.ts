/**
 * tests/runtime/scatter/ScatterChunkManager.batch.test.ts —— 批次控制测试（T006.4）。
 *
 * 覆盖（任务书工作项清单；阈值/比例一律经 LOD_THRESHOLDS / BATCH_POLICY 相对构造——
 * 后续锁值不碎测试）：
 * - 缺省关闭合并：无 sparseMerge 注入 = 既有「每 (块×资产) 一桶」行为（沿 frame
 *   lodEnabled 缺省 false 先例）；
 * - 稀疏合并触发：粗档（low）下 2×2 超块稀疏块并入一个合并桶（root 直下 merge:*），
 *   块组内无自有网格；实例序 = 成员 (i,j) 升序 × 块内撒点序（确定性）；矩阵与逐块
 *   真相源逐位一致（合并 = 同批实例同矩阵重写——建立/拆除零像素变化）；
 * - 密集不合并：超阈值 (块×资产) 保持自有细块桶（无合并桶建立）；
 * - high 恒不合并（近处全保真 + 细粒度剔除）；
 * - 档位升降：合并组建立/拆除可逆（low 合并 → high 自有细桶全保真 → low 复建逐位一致）；
 * - 跨档混合：同超块不同档 → 按档分桶（mid 桶 + low 桶并存）；
 * - 合并成员 culled：实例退出合并桶当帧写入（count 不含该块）；回视恢复重入；全组
 *   culled → 合并桶零提交（count=0 / visible=false，桶保留）；
 * - 局部重算：合并成员块重撒 → 合并桶重建，实例与新参数一致（同档保档语义）；
 * - 摘源重建（撤销重做模型）：同参确定性复原 + 合并组重建一致（矩阵逐位）；
 * - 远距密度降级：low 抽稀确定性（双跑逐位一致）、high/mid 全保真（keep=1）、
 *   合并桶与自有桶同规则；
 * - LOD 分布双口径（D27.9）：各档实例数 + 桶数（提交口径；culled 成员实例计 culled）；
 * - 拾取：合并桶命中 → 源 id。
 * 边界：fake 源提供者按 (assetId × level) 分源（几何身份即档位标签）；几何包围手工
 *      钉死（半径按档差异化 High 5 / Mid 4.8 / Low 4.9——真实档间轮廓差 2~5% 量级，
 *      High ≥ Mid/Low；Y ±1）；合并阈值经注入 { maxInstancesPerChunk, groupFactor } 构造
 *      （不依赖 BATCH_POLICY 数值——候选锁值不碎测试）。
 * 机位口径（fov 90° → m = 最近点距离 / R_high；块盒 Y = [−1,1]、XZ = 块矩形闭盒）：
 *      超块中心正上方 (32, 1+m·R_high, 32) → 四块最近点同距 → 全块同档（均匀档位机位）；
 *      超块角点 (0, h, 0) → 四块最近点分距 → 跨档/culled 分离机位（§4.3 解析构造）。
 *      升档迟滞方向已计入（回 low 用带内 m=38 < canopyToCulled·(1−band) 保证回档）；
 *      T006.6 起选档基准 = High 档派生稳定半径——机位与 mOfChunk 折算统一按 High
 *      半径（与块当前档位无关；稳定基准不变量由 ScatterChunkManager.lod 测试锁定）。
 * T021.2 改写记档：getAssetLevels 直查 → getRepresentationCapability levels 投影（派生链
 *      等价）；midToLow/lowToCulled → midToCanopy/canopyToCulled（候选初值同值直承 16/60，
 *      全部数值断言不变——canopy 名义带跳档承接 low）。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { BATCH_POLICY, keepThinnedInstance } from '../../../src/domain/lod/batchPolicy';
import { LOD_THRESHOLDS } from '../../../src/domain/lod/lodPolicy';
import { TRANSITION_BAND_RATIO } from '../../../src/domain/lod/transition';
import type { RuntimeRepresentation } from '../../../src/domain/lod/representation';
import type { ScatterInstance, ScatterParams } from '../../../src/domain/scatter';
import { scatterChunk } from '../../../src/domain/scatter';
import type { Vec2 } from '../../../src/core/types';
import { ScatterChunkManager } from '../../../src/runtime/scatter/ScatterChunkManager';
import type { ScatterChunkManagerOptions } from '../../../src/runtime/scatter/ScatterChunkManager';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具（镜像 006.3 测试口径）──────────────────────────

/**
 * 三档源几何包围球半径（真实差异化，不再三档 pin 同球）：High 基准 5.0、Mid −4%、
 * Low −2%——档间轮廓差实测量级 2~5%（口径同 ScatterChunkManager.lod 测试）。
 */
const LEVEL_RADIUS: Record<RuntimeRepresentation, number> = { high: 5, mid: 4.8, low: 4.9, canopy: 5.05 };
/** 相机定标基准半径（= High 档；cameraAboveCenter 的机位口径） */
const SOURCE_RADIUS = LEVEL_RADIUS.high;
const GEO_HALF = 1;
/** 注入的合并策略（测试常量——与 BATCH_POLICY 数值解耦） */
const MERGE = { maxInstancesPerChunk: 32, groupFactor: 2 };
/** 全部四块同 low 带的均匀档位 m（带内中点——升档回视也安全：m < canopyToCulled·(1−band)） */
const LOW_BAND_M = LOD_THRESHOLDS.midToCanopy + (LOD_THRESHOLDS.canopyToCulled - LOD_THRESHOLDS.midToCanopy) / 2;
/** 全部四块同 high 带的均匀档位 m（< highToMid·(1−band)——升档迟滞安全） */
const HIGH_BAND_M = LOD_THRESHOLDS.highToMid * 0.5;

function rect(minX: number, minZ: number, maxX: number, maxZ: number): Vec2[] {
  return [
    { x: minX, y: minZ },
    { x: maxX, y: minZ },
    { x: maxX, y: maxZ },
    { x: minX, y: maxZ },
  ];
}

/** 64×64m（2×2 超块 = 块 (0,0)(0,1)(1,0)(1,1)）稀疏参数：~15 实例/块 ≤ 32 */
function sparseParams(overrides: Partial<ScatterParams> = {}): ScatterParams {
  return {
    polygon: rect(0, 0, 64, 64),
    densityPerM2: 0.015,
    assets: [{ assetId: 'asset_tree', weight: 1 }],
    seed: 424242,
    scaleRange: { min: 1, max: 1 },
    ...overrides,
  };
}

/** 密集参数：~100 实例/块 > 32（合并阈值之上） */
const denseParams = (): ScatterParams => sparseParams({ densityPerM2: 0.1 });

function leveledSource(level: RuntimeRepresentation): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingBox = new THREE.Box3(
    new THREE.Vector3(-GEO_HALF, -GEO_HALF, -GEO_HALF),
    new THREE.Vector3(GEO_HALF, GEO_HALF, GEO_HALF),
  );
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), LEVEL_RADIUS[level]);
  return { geometry, material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) };
}

function makeLeveledProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(async (assetId: string, level?: RuntimeRepresentation): Promise<InstanceSource> => {
    const key = `${assetId}::${level ?? 'high'}`;
    let source = sources.get(key);
    if (!source) {
      source = leveledSource(level ?? 'high');
      sources.set(key, source);
    }
    return source;
  });
  return { provider, sources };
}

function sourceOf(
  sources: Map<string, InstanceSource>,
  assetId: string,
  level: RuntimeRepresentation,
): InstanceSource {
  const source = sources.get(`${assetId}::${level}`);
  expect(source).toBeDefined();
  return source!;
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function makeManager(
  provider: ReturnType<typeof makeLeveledProvider>['provider'],
  options: Partial<ScatterChunkManagerOptions> = {},
): ScatterChunkManager {
  return new ScatterChunkManager({
    provideSource: provider,
    getRepresentationCapability: () => ({ levels: ['high', 'mid', 'low'] }),
    ...options,
  });
}

/** 超块中心正上方相机：四块最近点同距 → 全块同档（m = (h−1)/R，h = 1 + m·R） */
function cameraAboveCenter(m: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(32, 1 + m * SOURCE_RADIUS, 32);
  camera.lookAt(32, 0, 32);
  return camera;
}

/** 超块角点相机 (0, h, 0)：块间最近点分距 → 跨档/culled 分离（h > 1） */
function cameraAboveCorner(h: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(0, h, 0);
  camera.lookAt(32, 0, 32);
  return camera;
}

/**
 * 角点相机下块 (i,j) 的度量 m（§4.3 代表点 = 块盒最近点；Y∈[−1,1] → dy = h−1，h>1）。
 * radius = 选档基准半径（T006.6 稳定基准恒为 High 半径——缺省即 High，与块当前档位
 * 无关；参数保留供调用处显式表达口径）。
 */
function mOfChunk(i: number, j: number, h: number, radius: number = SOURCE_RADIUS): number {
  const x = Math.min(Math.max(0, i * 32), (i + 1) * 32);
  const z = Math.min(Math.max(0, j * 32), (j + 1) * 32);
  const dy = h - 1;
  return Math.sqrt(x * x + z * z + dy * dy) / radius;
}

/** root 直下的合并桶网格（name merge: 前缀；不含块组子网格） */
function mergedMeshes(m: ScatterChunkManager): THREE.InstancedMesh[] {
  return m.root.children.filter(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && c.name.startsWith('merge:'),
  ) as THREE.InstancedMesh[];
}

/** 持有指定源几何的全部 InstancedMesh（自有桶 + 合并桶——按几何身份定位） */
function meshesHolding(
  m: ScatterChunkManager,
  geometry: THREE.BufferGeometry,
): THREE.InstancedMesh[] {
  const found: THREE.InstancedMesh[] = [];
  for (const group of m.root.children) {
    for (const child of [group, ...group.children]) {
      const mesh = child as THREE.InstancedMesh;
      if (
        mesh.isInstancedMesh &&
        (mesh.geometry === geometry ||
          mesh.geometry.attributes.position === geometry.attributes.position)
      ) {
        found.push(mesh);
      }
    }
  }
  return found;
}

/** 块 (i,j) 该资产的真相源实例（抽稀前） */
function truthOf(params: ScatterParams, i: number, j: number): ScatterInstance[] {
  return scatterChunk(params, {
    minX: i * 32,
    minZ: j * 32,
    maxX: (i + 1) * 32,
    maxZ: (j + 1) * 32,
  }).filter((inst) => inst.assetId === 'asset_tree');
}

/** 档位抽稀后的期望保留集（domain 规则——与实现共用同一纯函数契约） */
function thinned(list: ScatterInstance[], level: RuntimeRepresentation): ScatterInstance[] {
  const keep = level === 'canopy' ? 1 : BATCH_POLICY.levelInstanceKeep[level];
  return list.filter((_, index) => keepThinnedInstance(index, keep));
}

const ALL_MEMBERS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

/** 期望合并桶实例序（成员 (i,j) 升序 × 块内撒点序 × 档位抽稀） */
function expectedMerged(params: ScatterParams, members: [number, number][], level: RuntimeRepresentation): ScatterInstance[] {
  const out: ScatterInstance[] = [];
  for (const [i, j] of members.sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    out.push(...thinned(truthOf(params, i, j), level));
  }
  return out;
}

/** 实例 → 期望矩阵（与管线同式：pos + rotY + scale=1；Float32 舍入后精确比较——
 *  instanceMatrix 为 Float32Array，期望值同舍入，沿 006.3 expectedMatrix 先例） */
function matrixOf(inst: ScatterInstance): THREE.Matrix4 {
  const composed = new THREE.Matrix4().compose(
    new THREE.Vector3(inst.position.x, 0, inst.position.y),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, inst.rotationY, 0)),
    new THREE.Vector3(1, 1, 1),
  );
  return new THREE.Matrix4().fromArray(Float32Array.from(composed.elements));
}

function expectMeshInstances(mesh: THREE.InstancedMesh, expected: ScatterInstance[]): void {
  expect(mesh.count).toBe(expected.length);
  const probe = new THREE.Matrix4();
  for (let slot = 0; slot < expected.length; slot++) {
    mesh.getMatrixAt(slot, probe);
    expect(probe.equals(matrixOf(expected[slot]!))).toBe(true);
  }
}

const settle = async (m: ScatterChunkManager, camera: THREE.PerspectiveCamera, lod = true) => {
  m.frame(camera, lod);
  await flush();
};

// ── 缺省关闭（既有行为锚点）────────────────────────────────

describe('ScatterChunkManager 批次控制：缺省关闭合并', () => {
  it('无 sparseMerge 注入：粗档稀疏块仍每 (块×资产) 一桶（管线独立使用既有行为）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeManager(provider); // 不注入 sparseMerge
    m.setSource('s', sparseParams());
    await flush();
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    expect(mergedMeshes(m)).toHaveLength(0); // 无合并桶
    const lowGeometry = sourceOf(sources, 'asset_tree', 'low').geometry;
    expect(meshesHolding(m, lowGeometry)).toHaveLength(4); // 4 块各自有桶
    m.dispose();
  });
});

// ── 稀疏合并 / 密集不合并 / high 不合并 ─────────────────────

describe('ScatterChunkManager 批次控制：块自适应合并', () => {
  it('稀疏粗档块并入 2×2 合并桶：块组无自有网格、实例序确定性、矩阵与真相源逐位一致', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();
    await settle(m, cameraAboveCenter(LOW_BAND_M));

    // 一个 low 合并桶（4 块同超块），块组内无该资产自有网格
    const merged = mergedMeshes(m);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.geometry).toBe(sourceOf(sources, 'asset_tree', 'low').geometry);
    expect(merged[0]!.visible).toBe(true);
    for (const name of ['chunk:0:0', 'chunk:0:1', 'chunk:1:0', 'chunk:1:1']) {
      const group = m.root.children.find((c) => c.name === name)!;
      expect(group.children).toHaveLength(0); // 全部实例在合并桶
    }
    // 实例序 = 成员 (i,j) 升序 × 撒点序 × low 抽稀；矩阵逐位一致
    const expected = expectedMerged(params, [...ALL_MEMBERS], 'low');
    expectMeshInstances(merged[0]!, expected);
    expect(m.getStats().instances).toBe(expected.length); // stats 提交口径含合并实例
    m.dispose();
  });

  it('密集块不合并：超阈值 (块×资产) 保持自有细块桶（无合并桶建立；抽稀仍生效）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = denseParams();
    m.setSource('s', params);
    await flush();
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    expect(mergedMeshes(m)).toHaveLength(0);
    const lowGeometry = sourceOf(sources, 'asset_tree', 'low').geometry;
    const own = meshesHolding(m, lowGeometry);
    expect(own).toHaveLength(4); // 密集 4 块各自有桶
    // 抽稀与合并正交：低档密度降级照常（同规则确定性）
    for (const [i, j] of ALL_MEMBERS) {
      const mesh = own.find((candidate) => candidate.parent!.name === `chunk:${i}:${j}`)!;
      expectMeshInstances(mesh, thinned(truthOf(params, i, j), 'low'));
    }
    m.dispose();
  });

  it('high 档恒不合并：近处稀疏块仍自有细块桶且全保真（keep=1）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();
    await settle(m, cameraAboveCenter(HIGH_BAND_M));
    expect(mergedMeshes(m)).toHaveLength(0);
    const highGeometry = sourceOf(sources, 'asset_tree', 'high').geometry;
    const own = meshesHolding(m, highGeometry);
    expect(own).toHaveLength(4);
    for (const [i, j] of ALL_MEMBERS) {
      const mesh = own.find((candidate) => candidate.parent!.name === `chunk:${i}:${j}`)!;
      expectMeshInstances(mesh, truthOf(params, i, j)); // high 全保真（无抽稀）
    }
    m.dispose();
  });
});

// ── 档位升降：合并组建立与拆除 ─────────────────────────────

describe('ScatterChunkManager 批次控制：档位升降', () => {
  it('low 合并 → high 拆组自有细桶全保真 → low 复建逐位一致（合并/拆除零实例变化）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();
    const lowCamera = cameraAboveCenter(LOW_BAND_M);
    await settle(m, lowCamera);
    const first = mergedMeshes(m);
    expect(first).toHaveLength(1);
    const lowSnapshot = Float32Array.from(
      first[0]!.instanceMatrix.array.subarray(0, first[0]!.count * 16),
    );

    // 升档到 high：合并组拆除、4 块自有细桶、全保真（HIGH_BAND_M < 升档迟滞线）
    await settle(m, cameraAboveCenter(HIGH_BAND_M));
    expect(mergedMeshes(m)).toHaveLength(0);
    const highGeometry = sourceOf(sources, 'asset_tree', 'high').geometry;
    expect(meshesHolding(m, highGeometry)).toHaveLength(4);
    const totalHigh = ALL_MEMBERS.reduce((sum, [i, j]) => sum + truthOf(params, i, j).length, 0);
    expect(m.getStats().instances).toBe(totalHigh); // 全保真计数

    // 回 low：合并组复建，矩阵与首次逐位一致（确定性——无可见跳变）
    await settle(m, lowCamera);
    const again = mergedMeshes(m);
    expect(again).toHaveLength(1);
    expect(
      Float32Array.from(again[0]!.instanceMatrix.array.subarray(0, again[0]!.count * 16)),
    ).toEqual(lowSnapshot);
    m.dispose();
  });

  it('同超块跨档混合：按档分桶（mid 桶 + low 桶并存，成员各归其档）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();
    const t = LOD_THRESHOLDS;
    // 角点机位：块 (0,0) 落 mid 带、其余三块落 low 带（§4.3 最近点解析构造）
    const h = 1 + t.midToCanopy * 0.95 * SOURCE_RADIUS; // m(0,0) = 0.95·midToCanopy ∈ mid 带
    expect(mOfChunk(0, 0, h)).toBeGreaterThan(t.highToMid);
    expect(mOfChunk(0, 0, h)).toBeLessThanOrEqual(t.midToCanopy);
    expect(mOfChunk(0, 1, h)).toBeGreaterThan(t.midToCanopy);
    expect(mOfChunk(1, 1, h)).toBeLessThanOrEqual(t.canopyToCulled);
    await settle(m, cameraAboveCorner(h));

    const merged = mergedMeshes(m);
    expect(merged).toHaveLength(2); // mid 桶（块 0:0）+ low 桶（块 0:1/1:0/1:1）
    const midMesh = merged.find(
      (mesh) => mesh.geometry === sourceOf(sources, 'asset_tree', 'mid').geometry,
    )!;
    const lowMesh = merged.find(
      (mesh) => mesh.geometry === sourceOf(sources, 'asset_tree', 'low').geometry,
    )!;
    expect(midMesh).toBeDefined();
    expect(lowMesh).toBeDefined();
    expectMeshInstances(midMesh, expectedMerged(params, [[0, 0]], 'mid')); // mid keep=1 全保真
    expectMeshInstances(
      lowMesh,
      expectedMerged(params, [
        [0, 1],
        [1, 0],
        [1, 1],
      ], 'low'),
    );
    m.dispose();
  });
});

// ── 合并成员 culled ────────────────────────────────────────

describe('ScatterChunkManager 批次控制：合并成员 culled', () => {
  /**
   * T021.3 改写记档：Low→Cull 自决策线瞬时 cull 变为退场带 fade（终态线 = 名义线 ×
   * (1+W)）。角点机位下「单成员超线而余员未超」在 32m 块 + 带宽 0.25 的几何下不可达
   * （角点最近点距离比随高度收敛 →1，决策线 60 与终态线 75 的 1.25 比分不动）；单成员
   * 退出改经 **scale 不对称双源**构造（同 2×2 超块：far 源仅覆盖 (1,1) 且 scale 0.6
   * ——读数 = 距离/(R×scale) 折算放大 5/3 倍，与 near 源两块拉开 1.25+ 比分）；两源
   * 各自合并桶独立退出 / 重入（memberCulled 机制面等价——同代码路径）。
   */
  it('far 源合并成员超终态线退出合并桶；near 源成员保留；回视恢复重入（确定性）；拾取语义不变', async () => {
    const { provider } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const nearParams = sparseParams({ polygon: rect(0, 0, 64, 32) }); // 块 (0,0)(1,0)
    const farParams = sparseParams({
      polygon: rect(32, 32, 64, 64),
      scaleRange: { min: 0.7, max: 0.7 },
    }); // 块 (1,1)
    m.setSource('near', nearParams);
    m.setSource('far', farParams);
    await flush();
    const t = LOD_THRESHOLDS;
    const cullTerminal = t.canopyToCulled * (1 + TRANSITION_BAND_RATIO);
    // 先全部 low（两源各一合并桶）
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    expect(mergedMeshes(m)).toHaveLength(2);
    const nearFull = mergedMeshes(m).find((mesh) => mesh.name.includes(':near:'))!;
    const farFull = mergedMeshes(m).find((mesh) => mesh.name.includes(':far:'))!;
    expect(nearFull).toBeDefined();
    expect(farFull).toBeDefined();
    const nearFullCount = nearFull.count;
    const farFullCount = farFull.count;
    const farSnapshot = Float32Array.from(
      farFull.instanceMatrix.array.subarray(0, farFull.count * 16),
    );

    // 角点机位 (0, h, 0)：near 块最近点 ≈ h−1（读数 = (h−1)/5 ≤ 决策线）；far 块 (1,1)
    // 距离 √(2·32² + (h−1)²)、scale 0.7 → 读数 = 距离/(5×0.7) ≥ 终态线（scale 折算放大
    // 拉开与 near 的比分；0.7 同时保证均匀机位下 far 读数 54 仍落 low 带）
    const h = 291;
    const nearReading = (h - 1) / SOURCE_RADIUS;
    const farReading = Math.sqrt(2 * 32 * 32 + (h - 1) ** 2) / (SOURCE_RADIUS * 0.7);
    expect(nearReading).toBeLessThan(t.canopyToCulled); // near 未超决策线（退场带外）
    expect(farReading).toBeGreaterThan(cullTerminal); // far 超终态线
    await settle(m, cameraAboveCorner(h));
    // far 源合并桶：成员终态 cull 退出 → 零实例零提交（桶保留）
    const farCulled = mergedMeshes(m).find((mesh) => mesh.name.includes(':far:'))!;
    expect(farCulled.count).toBe(0);
    expect(farCulled.visible).toBe(false);
    // near 源合并桶：成员保留（未超线）、实例完整
    const nearKept = mergedMeshes(m).find((mesh) => mesh.name.includes(':near:'))!;
    expect(nearKept.count).toBe(nearFullCount);
    expectMeshInstances(nearKept, expectedMerged(nearParams, [[0, 0], [1, 0]], 'low'));
    // 拾取：near 合并桶命中 → 源 id
    expect(
      m.resolvePick({ object: nearKept, instanceId: 0 } as unknown as THREE.Intersection),
    ).toBe('near');

    // 回视（回落 low 带内）：far 成员重入，逐位复原（确定性）
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    const farRestored = mergedMeshes(m).find((mesh) => mesh.name.includes(':far:'))!;
    expect(farRestored.count).toBe(farFullCount);
    expect(
      Float32Array.from(farRestored.instanceMatrix.array.subarray(0, farRestored.count * 16)),
    ).toEqual(farSnapshot);
    m.dispose();
  });

  it('全组 culled：合并桶零提交（count=0 / visible=false），桶保留回视恢复', async () => {
    const { provider } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    m.setSource('s', sparseParams());
    await flush();
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    expect(mergedMeshes(m)).toHaveLength(1);
    // 全部块超退场带终态线（均匀机位；1.2·名义线在带内——不整桶消失）
    await settle(
      m,
      cameraAboveCenter(LOD_THRESHOLDS.canopyToCulled * (1 + TRANSITION_BAND_RATIO) * 1.02),
    );
    const all = mergedMeshes(m);
    expect(all).toHaveLength(1); // 桶保留（调度结果非拆除）
    expect(all[0]!.count).toBe(0);
    expect(all[0]!.visible).toBe(false); // 零提交
    // 回视恢复（m=38 < 迟滞升档线）
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    expect(mergedMeshes(m)[0]!.visible).toBe(true);
    expect(mergedMeshes(m)[0]!.count).toBeGreaterThan(0);
    m.dispose();
  });
});

// ── 局部重算与撤销重做 ─────────────────────────────────────

describe('ScatterChunkManager 批次控制：块生命周期', () => {
  it('合并成员局部重算：合并桶重建、实例与当前源参数确定性一致（同档保档）', async () => {
    const { provider } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    // 只列块 (0,0) 重算但 params 置换：合并组 = 组级重撒单元——未列成员按新源参数确定性
    // 重撒（与全量重算终态一致，无陈旧实例；「未列块不触碰」粒度在合并态记档为组级）
    const dense00 = sparseParams({ densityPerM2: 0.03 });
    m.recomputeChunks('s', [{ i: 0, j: 0 }], dense00);
    await flush();
    const merged = mergedMeshes(m);
    expect(merged).toHaveLength(1);
    expectMeshInstances(merged[0]!, expectedMerged(dense00, [...ALL_MEMBERS], 'low'));
    // 同参幂等：再全量重算一遍逐位不变
    m.recomputeChunks(
      's',
      ALL_MEMBERS.map(([i, j]) => ({ i, j })),
      dense00,
    );
    await flush();
    expectMeshInstances(mergedMeshes(m)[0]!, expectedMerged(dense00, [...ALL_MEMBERS], 'low'));
    m.dispose();
  });

  it('摘源重建（撤销重做模型）：同参确定性复原 + 合并组重建一致（矩阵逐位）', async () => {
    const { provider } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();
    const camera = cameraAboveCenter(LOW_BAND_M);
    await settle(m, camera);
    const before = mergedMeshes(m)[0]!;
    const beforeSnapshot = Float32Array.from(
      before.instanceMatrix.array.subarray(0, before.count * 16),
    );

    m.removeSource('s'); // 撤销（摘源）
    expect(m.root.children.filter((c) => c.name.startsWith('merge:'))).toHaveLength(0); // 合并桶随源全拆
    m.setSource('s', params); // 重做（同参重建）
    await flush();
    await settle(m, camera); // 新块 high 起步 → 同机位评估收敛 low 合并
    const after = mergedMeshes(m)[0]!;
    expect(after.count).toBe(before.count);
    expect(Float32Array.from(after.instanceMatrix.array.subarray(0, after.count * 16))).toEqual(
      beforeSnapshot,
    );
    m.dispose();
  });
});

// ── LOD 分布双口径（D27.9）─────────────────────────────────

describe('ScatterChunkManager 批次控制：LOD 分布双口径', () => {
  it('各档实例数 + 桶数（提交口径）；culled 成员实例计 culled；自有/合并不双计', async () => {
    const { provider } = makeLeveledProvider();
    const m = makeManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();
    // near high：4 自有桶全保真
    await settle(m, cameraAboveCenter(HIGH_BAND_M));
    let dist = m.getLodDistribution();
    expect(dist.buckets.high).toBe(4);
    expect(dist.buckets.mid + dist.buckets.low + dist.buckets.culled).toBe(0);
    expect(dist.instances.high).toBe(
      ALL_MEMBERS.reduce((sum, [i, j]) => sum + truthOf(params, i, j).length, 0),
    );

    // low 合并：1 合并桶 + 抽稀实例（提交口径）
    await settle(m, cameraAboveCenter(LOW_BAND_M));
    dist = m.getLodDistribution();
    expect(dist.buckets.low).toBe(1);
    expect(dist.buckets.high + dist.buckets.mid).toBe(0);
    expect(dist.instances.low).toBe(expectedMerged(params, [...ALL_MEMBERS], 'low').length);

    // 全组 culled：桶计 culled（零提交口径）、实例计 culled（终态线外——退场带内
    // 实例仍计 low 且 transition.instances 计过渡中）
    await settle(
      m,
      cameraAboveCenter(LOD_THRESHOLDS.canopyToCulled * (1 + TRANSITION_BAND_RATIO) * 1.02),
    );
    dist = m.getLodDistribution();
    expect(dist.buckets.culled).toBe(1);
    expect(dist.instances.culled).toBe(expectedMerged(params, [...ALL_MEMBERS], 'low').length);
    expect(dist.transition.instances).toBe(0); // 终态后无过渡中实例
    m.dispose();
  });
});
