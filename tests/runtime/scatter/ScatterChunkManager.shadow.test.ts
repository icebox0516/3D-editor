/**
 * tests/runtime/scatter/ScatterChunkManager.shadow.test.ts —— 散布链阴影策略驱动测试
 * （T021.5，D41 §七/§5.4；执行面 = 本管三建网格点〔自有桶/客座桶/合并桶〕+
 * chunk×asset 过渡 shadowRepresentation 消费）。
 *
 * 覆盖（阈值一律经 LOD_THRESHOLDS / TRANSITION_BAND_RATIO 相对构造——锁值不碎测试）：
 * - 各表示 mesh 三字段独立断言（自有桶）：high/mid = full（挂源 SDF 深度材质）；
 *   **low = simplified 且跳过源提供的 LOW SDF 深度材质**（three 缺省实心几何深度——
 *   本任务唯一生产可见行为变化的机制面，021.8 A/B 复核位）；culled 终态
 *   visible=false 之外 cast/receive 一并 false（belt-and-braces 零残影）+ 回视复原；
 * - 假想 canopy 声明资产（021.3 先例——真实资产 021.7 前不可达）：canopy 稳态
 *   receive=false + 深度材质挂载（simplified = canopy 源深度材质即轮廓级构造）；
 *   dither 中点 caster 翻转恰一侧（自有 mid 桶 / incoming 客座桶 mesh 级双侧断言）；
 *   shadowCasterInstances 两侧恒 = 全量实例数；fade-out 退场期 cast 持续到 culled
 *   零残影；
 * - 合并桶 cast **成员 OR 语义**（主代理裁定）：合并桶内各 chunk×asset 的 midpoint
 *   可能错开数帧——任一成员该表示仍是 shadowRepresentation 则整桶 cast（短暂双投
 *   在远场影 texel ~16cm 下不可辨，021.8 观察点）；全员中点后整桶不 cast；
 *   客座桶（免合并）per-chunk 精确不受合并桶 OR 影响。
 * 边界：fake 源提供者按 (assetId × 档) 分源，**每档源均携带 customDepthMaterial**
 *      （比真实资产严——low 跳过挂载的断言应力：源有也不挂）；几何包围与机位口径
 *      同 ScatterChunkManager.lod.test.ts（High 档基准定标、块盒最近点度量）。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { LOD_THRESHOLDS } from '../../../src/domain/lod/lodPolicy';
import { TRANSITION_BAND_RATIO } from '../../../src/domain/lod/transition';
import type { RuntimeRepresentation } from '../../../src/domain/lod/representation';
import type { ScatterInstance, ScatterParams } from '../../../src/domain/scatter';
import { scatterChunk } from '../../../src/domain/scatter';
import type { Vec2 } from '../../../src/core/types';
import { ScatterChunkManager } from '../../../src/runtime/scatter/ScatterChunkManager';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具（口径同 ScatterChunkManager.lod.test.ts）────────

const LEVEL_RADIUS: Record<RuntimeRepresentation, number> = {
  high: 5,
  mid: 4.8,
  low: 4.9,
  canopy: 5.05,
};
const SOURCE_RADIUS = LEVEL_RADIUS.high;
const GEO_HALF = 1;
/** 注入的合并策略（测试常量——与 BATCH_POLICY 数值解耦，batch 测试同口径） */
const MERGE = { maxInstancesPerChunk: 32, groupFactor: 2 };

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
    scaleRange: { min: 1, max: 1 }, // 确定性 scale=1：块内 max scale 恒 1，读数可精确构造
    ...overrides,
  };
}

/** 64×64m（2×2 超块）稀疏参数（~15 实例/块 ≤ 32——合并桶 OR 测试用） */
function sparseParams(overrides: Partial<ScatterParams> = {}): ScatterParams {
  return {
    polygon: rect(0, 0, 64, 64),
    densityPerM2: 0.015,
    assets: [{ assetId: 'asset_canopy_tree', weight: 1 }],
    seed: 424242,
    scaleRange: { min: 1, max: 1 },
    ...overrides,
  };
}

/** 当档源：几何身份即 (assetId × 档) 标签；**每档均携带 customDepthMaterial**
 *  （low 跳过挂载的断言应力——源有也不挂） */
function leveledSource(level: RuntimeRepresentation): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingBox = new THREE.Box3(
    new THREE.Vector3(-GEO_HALF, -GEO_HALF, -GEO_HALF),
    new THREE.Vector3(GEO_HALF, GEO_HALF, GEO_HALF),
  );
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), LEVEL_RADIUS[level]);
  return {
    geometry,
    material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
    customDepthMaterial: new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }),
  };
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

const settle = async (m: ScatterChunkManager, camera: THREE.PerspectiveCamera, lod = true) => {
  m.frame(camera, lod);
  await flush();
};

/** 块 (0,0) 中心正上方目标读数 m 的相机（High 基准定标；块盒 Y 顶 = 1） */
function cameraAtM(m: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(10, GEO_HALF + m * SOURCE_RADIUS, 10);
  camera.lookAt(10, 0, 10);
  return camera;
}

/** 任意点相机（合并桶 OR 测试的错开机位——块间读数分裂由最近点几何自然产生） */
function cameraAt(x: number, y: number, z: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(x, y, z);
  camera.lookAt(32, 0, 32);
  return camera;
}

/** 块 (0,0) 内 assetId 的当档自有网格（按各档源几何身份反查块组子网格） */
function ownMeshOf(
  m: ScatterChunkManager,
  sources: Map<string, InstanceSource>,
  assetId: string,
): { mesh: THREE.InstancedMesh; level: RuntimeRepresentation } | undefined {
  const group = m.root.children.find((c) => c.name === 'chunk:0:0');
  if (!group) return undefined;
  for (const level of ['high', 'mid', 'low', 'canopy'] as const) {
    const geometry = sources.get(`${assetId}::${level}`)?.geometry;
    const hit = group.children.find(
      (c) =>
        (c as THREE.InstancedMesh).isInstancedMesh &&
        geometry &&
        ((c as THREE.InstancedMesh).geometry === geometry ||
          (c as THREE.InstancedMesh).geometry.attributes.position === geometry.attributes.position),
    );
    if (hit) return { mesh: hit as THREE.InstancedMesh, level };
  }
  return undefined;
}

/** 块 (0,0) 内 incoming 客座网格（name 前缀 incoming: 定位） */
function incomingMeshOf(m: ScatterChunkManager): THREE.InstancedMesh | undefined {
  const group = m.root.children.find((c) => c.name === 'chunk:0:0');
  return group?.children.find(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && c.name.startsWith('incoming:'),
  ) as THREE.InstancedMesh | undefined;
}

/** 指定块组的 incoming 客座网格（合并桶 OR 测试按块定位） */
function incomingOfChunk(m: ScatterChunkManager, i: number, j: number): THREE.InstancedMesh | undefined {
  const group = m.root.children.find((c) => c.name === `chunk:${i}:${j}`);
  return group?.children.find(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && c.name.startsWith('incoming:'),
  ) as THREE.InstancedMesh | undefined;
}

/** root 直下的合并桶网格（name merge: 前缀） */
function mergedMeshes(m: ScatterChunkManager): THREE.InstancedMesh[] {
  return m.root.children.filter(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && c.name.startsWith('merge:'),
  ) as THREE.InstancedMesh[];
}

/** 期望实例数（domain scatterChunk 真相源；块 (0,0)、32m 块） */
function truthCount(params: ScatterParams, assetId: string): number {
  return scatterChunk(params, { minX: 0, minZ: 0, maxX: 32, maxZ: 32 }).filter(
    (inst: ScatterInstance) => inst.assetId === assetId,
  ).length;
}

const T = LOD_THRESHOLDS;
const W = TRANSITION_BAND_RATIO;

/** 假想 canopy 管理器（representations 声明优先——真实 13 树种未声明 canopy，021.3 先例） */
function makeCanopyManager(
  provider: ReturnType<typeof makeLeveledProvider>['provider'],
  options: Partial<ConstructorParameters<typeof ScatterChunkManager>[0]> = {},
): ScatterChunkManager {
  return new ScatterChunkManager({
    provideSource: provider,
    getRepresentationCapability: (assetId) =>
      assetId === 'asset_canopy_tree'
        ? { representations: ['high', 'mid', 'canopy'] }
        : { levels: ['high', 'mid', 'low'] },
    ...options,
  });
}

// ── 各表示三字段（自有桶）+ low 跳过 + culled 零残影 ─────────

describe('ScatterChunkManager 阴影策略：各表示三字段（自有桶）', () => {
  it('high/mid = full（挂源 SDF 深度材质）；low = simplified 跳过源深度材质；culled 终态 cast/receive 一并 false；回视复原', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getRepresentationCapability: () => ({ levels: ['high', 'mid', 'low'] }),
    });
    m.setSource('s', baseParams());
    await flush();

    // high：cast/receive true + 挂源深度材质（full——现状沿承）
    await settle(m, cameraAtM(T.highToMid * 0.5));
    let entry = ownMeshOf(m, sources, 'asset_tree')!;
    expect(entry.level).toBe('high');
    expect(entry.mesh.castShadow).toBe(true);
    expect(entry.mesh.receiveShadow).toBe(true);
    expect(entry.mesh.customDepthMaterial).toBe(sourceOf(sources, 'asset_tree', 'high').customDepthMaterial);

    // mid：同 full 挂载（021.8 A/B 候选位——表值可调即断言跟随表）
    await settle(m, cameraAtM(T.highToMid * 1.5));
    entry = ownMeshOf(m, sources, 'asset_tree')!;
    expect(entry.level).toBe('mid');
    expect(entry.mesh.castShadow).toBe(true);
    expect(entry.mesh.receiveShadow).toBe(true);
    expect(entry.mesh.customDepthMaterial).toBe(sourceOf(sources, 'asset_tree', 'mid').customDepthMaterial);

    // low：cast/receive true + **不挂**（源携带 LOW SDF 深度材质也跳过——实心几何
    // 深度，本任务唯一生产可见行为变化，021.8 A/B 复核位）
    await settle(m, cameraAtM(T.midToCanopy * 1.125));
    entry = ownMeshOf(m, sources, 'asset_tree')!;
    expect(entry.level).toBe('low');
    expect(entry.mesh.castShadow).toBe(true);
    expect(entry.mesh.receiveShadow).toBe(true);
    expect(sourceOf(sources, 'asset_tree', 'low').customDepthMaterial).toBeDefined(); // 源确有
    expect(entry.mesh.customDepthMaterial).toBeUndefined(); // 策略跳过（three 缺省深度）

    // culled 终态：visible=false 之外 cast/receive 一并 false（belt-and-braces 零残影）
    await settle(m, cameraAtM(T.canopyToCulled * (1 + W) * 1.02));
    expect(entry.mesh.visible).toBe(false);
    expect(entry.mesh.castShadow).toBe(false);
    expect(entry.mesh.receiveShadow).toBe(false);
    expect(m.getLodDistribution().shadowCasterInstances).toBe(0);

    // 回视：同帧复原策略值
    await settle(m, cameraAtM(T.midToCanopy * 1.125));
    expect(entry.mesh.visible).toBe(true);
    expect(entry.mesh.castShadow).toBe(true);
    expect(entry.mesh.receiveShadow).toBe(true);
    expect(entry.mesh.customDepthMaterial).toBeUndefined();
    m.dispose();
  });
});

// ── 假想 canopy 资产：receive=false + 深度挂载 + 中点恰一侧 + fade-out 零残影 ──

describe('ScatterChunkManager 阴影策略：canopy（假想声明资产，021.3 先例）', () => {
  it('dither 中点 caster 翻转恰一侧（自有 mid 桶 / 客座桶 mesh 级双侧）+ canopy receive=false + 深度挂载 + 计数两侧恒全量', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeCanopyManager(provider);
    const params = baseParams({ assets: [{ assetId: 'asset_canopy_tree', weight: 1 }] });
    m.setSource('s', params);
    await flush();
    const count = truthCount(params, 'asset_canopy_tree');
    expect(count).toBeGreaterThan(0);

    // mid 桶起步（硬切）
    await settle(m, cameraAtM(T.highToMid * 1.5));
    const own = ownMeshOf(m, sources, 'asset_canopy_tree')!;
    expect(own.level).toBe('mid');
    expect(own.mesh.castShadow).toBe(true);

    // dither 中点前（f=0.25）：自有 mid 桶 cast、客座桶不 cast（恰一侧 = current 侧）；
    // 客座 receive=false（canopy 策略）+ 挂 canopy 源深度材质（simplified 构造）
    const pre = T.midToCanopy * (1 + W * 0.25);
    await settle(m, cameraAtM(pre));
    await settle(m, cameraAtM(pre)); // 冷源到达后次帧建客座
    const guest = incomingMeshOf(m);
    expect(guest).toBeDefined();
    expect(own.mesh.castShadow).toBe(true);
    expect(guest!.castShadow).toBe(false);
    expect(guest!.receiveShadow).toBe(false); // canopy 受影初始关闭（021.8 A/B 可开项）
    expect(guest!.customDepthMaterial).toBe(
      sourceOf(sources, 'asset_canopy_tree', 'canopy').customDepthMaterial,
    );
    expect(own.mesh.receiveShadow).toBe(true);
    expect(m.getLodDistribution().shadowCasterInstances).toBe(count); // 恰一侧（mid 当档桶）

    // 中点后（f=0.75）：翻转——自有 mid 桶不 cast、客座桶 cast（恰一侧 = target 侧）
    const post = T.midToCanopy * (1 + W * 0.75);
    await settle(m, cameraAtM(post));
    expect(own.mesh.castShadow).toBe(false);
    expect(guest!.castShadow).toBe(true);
    expect(m.getLodDistribution().shadowCasterInstances).toBe(count); // 仍恰一侧（canopy 客座）

    // 带末完成迁移：canopy 成当档桶——稳态策略（cast true / receive false / 深度挂载）
    const bandEnd = T.midToCanopy * (1 + W) * 1.05; // 裕量：Union 抬盒使完成线按并集折算（lod 测试同口径）
    await settle(m, cameraAtM(bandEnd));
    await settle(m, cameraAtM(bandEnd));
    expect(incomingMeshOf(m)).toBeUndefined();
    const canopyOwn = ownMeshOf(m, sources, 'asset_canopy_tree')!;
    expect(canopyOwn.level).toBe('canopy');
    expect(canopyOwn.mesh.castShadow).toBe(true);
    expect(canopyOwn.mesh.receiveShadow).toBe(false);
    expect(canopyOwn.mesh.customDepthMaterial).toBe(
      sourceOf(sources, 'asset_canopy_tree', 'canopy').customDepthMaterial,
    );
    m.dispose();
  });

  it('fade-out 退场（canopy → culled）：退场带内 cast 持续（树影随树退场）；终态 cast/receive 一并 false 零残影', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeCanopyManager(provider);
    const params = baseParams({ assets: [{ assetId: 'asset_canopy_tree', weight: 1 }] });
    m.setSource('s', params);
    await flush();

    // 到达 canopy 稳态（mid 硬切 → dither 带末完成；冷源两跳）
    await settle(m, cameraAtM(T.highToMid * 1.5));
    const bandEnd = T.midToCanopy * (1 + W) * 1.05;
    await settle(m, cameraAtM(bandEnd));
    await settle(m, cameraAtM(bandEnd));
    const canopyOwn = ownMeshOf(m, sources, 'asset_canopy_tree')!;
    expect(canopyOwn.level).toBe('canopy');
    expect(canopyOwn.mesh.castShadow).toBe(true);

    // 退场带内（f = 0.2）：可见 + cast 持续（阴影表示恒 current——影子随树退场）
    await settle(m, cameraAtM(T.canopyToCulled * 1.05));
    expect(canopyOwn.mesh.visible).toBe(true);
    expect(canopyOwn.mesh.castShadow).toBe(true);
    expect(m.getLodDistribution().shadowCasterInstances).toBe(truthCount(params, 'asset_canopy_tree'));

    // 终态线外：visible=false + cast/receive 一并 false（无「树没了影子还在」）
    await settle(m, cameraAtM(T.canopyToCulled * (1 + W) * 1.02));
    expect(canopyOwn.mesh.visible).toBe(false);
    expect(canopyOwn.mesh.castShadow).toBe(false);
    expect(canopyOwn.mesh.receiveShadow).toBe(false);
    expect(m.getLodDistribution().shadowCasterInstances).toBe(0);
    m.dispose();
  });
});

// ── 合并桶 cast 成员 OR 语义（主代理裁定）───────────────────

describe('ScatterChunkManager 阴影策略：合并桶成员 OR 语义', () => {
  /**
   * 机位构造（块盒最近点度量 = 欧氏距离 / R_high，fov 90、块盒 Y 顶 1）：
   * - 起步/回退 (32, 76, 32)：四块最近点同为 (32,1,32) → m = 75/5 = 15 ∈ 稳态 mid 带
   *   （升档迟滞线 16×0.85=13.6 之上 → dither f=0 客座全拆）；
   * - 错开机位 (10, 88, 10)：块 (0,0) 视点在其盒内 → 最近点 (10,1,10) → m=87/5=17.4
   *   （f=0.35 中点前）；块 (1,1) 最近点 (32,1,32) → 水平 √(22²+22²) → m≈18.4~18.5
   *   （f≈0.60~0.62 中点后）——同桶成员跨中点错开；(0,1)/(1,0) f≈0.49 居中点前侧；
   * - 全后机位 (32, 94, 32)：四块 m = 93/5 = 18.6（f=0.65 全员中点后、未完成）。
   */
  it('mid 合并桶：错开机位任一成员中点前 → 整桶 cast（OR）；全员中点后 → 整桶不 cast；客座桶 per-chunk 精确不受 OR 影响；回退复原', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = makeCanopyManager(provider, { sparseMerge: MERGE });
    const params = sparseParams();
    m.setSource('s', params);
    await flush();

    // 起步：稳态 mid → 2×2 稀疏块并入一个 mid 合并桶（mid 允许合批）
    await settle(m, cameraAt(32, 76, 32));
    const merged = mergedMeshes(m);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.geometry).toBe(sourceOf(sources, 'asset_canopy_tree', 'mid').geometry);
    expect(merged[0]!.castShadow).toBe(true); // 稳态全员 caster（OR 全真）
    expect(merged[0]!.receiveShadow).toBe(true);
    expect(merged[0]!.customDepthMaterial).toBe(
      sourceOf(sources, 'asset_canopy_tree', 'mid').customDepthMaterial,
    );

    // 错开机位（块 (0,0) 中点前 / 块 (1,1) 中点后）：合并桶 cast 保持（OR——任一成员
    // 该表示仍是 shadow 表示）；(1,1) 客座 cast、(0,0) 客座不 cast（per-chunk 精确）
    await settle(m, cameraAt(10, 88, 10));
    await settle(m, cameraAt(10, 88, 10)); // 冷源到达后次帧建客座
    expect(merged[0]!.castShadow).toBe(true); // OR：块 (0,0) 仍是 mid caster
    const guestNear = incomingOfChunk(m, 0, 0);
    const guestFar = incomingOfChunk(m, 1, 1);
    expect(guestFar).toBeDefined();
    expect(guestNear!.castShadow).toBe(false); // 中点前客座不 cast
    expect(guestFar!.castShadow).toBe(true); // 中点后客座 cast

    // 全后机位（四块 f=0.65 全员中点后）：合并桶 OR 空 → 整桶不 cast；客座全 cast
    await settle(m, cameraAt(32, 94, 32));
    await settle(m, cameraAt(32, 94, 32));
    expect(merged[0]!.castShadow).toBe(false);
    for (const [i, j] of [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ] as const) {
      expect(incomingOfChunk(m, i, j)!.castShadow).toBe(true);
    }

    // 回退稳态 mid：客座全拆、合并桶 cast 复原（OR 全真）
    await settle(m, cameraAt(32, 76, 32));
    await settle(m, cameraAt(32, 76, 32));
    expect(incomingOfChunk(m, 0, 0)).toBeUndefined();
    expect(merged[0]!.castShadow).toBe(true);
    m.dispose();
  });
});
