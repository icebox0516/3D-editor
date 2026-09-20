/**
 * tests/runtime/scatter/ScatterChunkManager.lod.test.ts —— 块×档分桶与换档测试（T006.3，D27.4/D27.6）。
 *
 * 覆盖（任务书验收清单；阈值一律经 LOD_THRESHOLDS 相对构造，不硬编码数值——后续锁值不碎测试）：
 * - 选档带：近 high → 中 mid → 远 low → 超远 culled（网格 visible=false、桶保留）→ 回视恢复；
 * - 迟滞防抖：降档过名义线立即执行；阈值带内往返不抖动换档（桶/源请求零churn）；
 *   升档越过 名义边界×(1−band) 才回档；
 * - 换档重建实例完整（T006.4 语义更新——抽稀只作用于降档方向）：确定性重撒（同 seed
 *   同档逐位一致）；high/mid 全保真（keep=1，count/矩阵/逐实例色跨档逐位一致）；low 档
 *   按 BATCH_POLICY.levelInstanceKeep.low 确定性抽稀（保留集 = 实例稳定序过滤，矩阵/色
 *   与真相源对应下标逐位一致——subset 断言不绕开）；桶 = 当档源 geometry/material
 *   成套（D27.4「不做桶内换 Source」）；
 * - 拾取跨档一致：任意档网格命中 → 同一源 id；culled 网格不可拾取；
 * - 总开关：off = 全 High（mid/low 桶确定性重建回 high）+ culled 旁路；
 * - 块生命周期：局部重算保档（内容编辑不改档位状态）、区域扩块新块评估收敛同档、
 *   摘源重建（撤销重做模型）后同参确定性复原；
 * - 单档资产（无 levels 声明）：恒 high 但超远仍可 culled（culled 非声明档位）；
 * - frame 单参（无 LOD）= 既有行为：超远不裁剪、恒 high；
 * - 档间半径差不变量（真实差异化包围球）：三档半径不再 pin 同球（High ≥ Mid/Low，
 *   差 2~5% 量级）——半径差被 15% 迟滞带吸收（highToMid 临界推拉零 churn）；换档后
 *   半径换源（下一帧读数用新档半径、读数平移不触发反向换档——现状语义锁定）。
 * 边界：fake 源提供者按 (assetId × level) 分源（几何身份即档位标签）；几何包围
 *      手工钉死（半径按档差异化 High 5 / Mid 4.8 / Low 4.9——真实档间轮廓差 2~5%
 *      量级，High ≥ Mid/Low；Y 顶 1）——选档输入确定性；评估器语义本身由 006.1 测试锁定。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { BATCH_POLICY, keepThinnedInstance } from '../../../src/domain/lod/batchPolicy';
import { LOD_THRESHOLDS } from '../../../src/domain/lod/lodPolicy';
import type { ProceduralLevel } from '../../../src/domain/assets';
import type { ScatterInstance, ScatterParams } from '../../../src/domain/scatter';
import { scatterChunk } from '../../../src/domain/scatter';
import type { Vec2 } from '../../../src/core/types';
import { ScatterChunkManager } from '../../../src/runtime/scatter/ScatterChunkManager';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具 ────────────────────────────────────────────────

/**
 * 三档源几何包围球半径（真实差异化，不再三档 pin 同球）：High 基准 5.0、Mid −4%、
 * Low −2%——档间轮廓差实测量级 2~5%（celtisLod 跨档容差实测折算口径同放置链），
 * High ≥ Mid/Low（高档包络最全）。选档读数随「当前档位」半径换源（frame 取当档
 * assetStates 惰性缓存的源几何包围球半径）——换档后 m 随新档半径平移是现状语义
 * （已定性卫生债，稳定 High 派生半径另立任务治理）：本文件按真实差异锁定该现状
 * 语义的不变量。
 */
const LEVEL_RADIUS: Record<ProceduralLevel, number> = { high: 5, mid: 4.8, low: 4.9 };
/** 相机定标基准半径（= High 档；cameraAtM 的机位口径），fov 90° 下 m = 视距 / R */
const SOURCE_RADIUS = LEVEL_RADIUS.high;
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

/** 当档源：几何身份即 (assetId × level) 标签（按调用现场 key 缓存于 provider）；包围按档钉死（惰性计算被预设短路） */
function leveledSource(level: ProceduralLevel): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingBox = new THREE.Box3(
    new THREE.Vector3(-GEO_HALF, -GEO_HALF, -GEO_HALF),
    new THREE.Vector3(GEO_HALF, GEO_HALF, GEO_HALF),
  );
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), LEVEL_RADIUS[level]);
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
  level: ProceduralLevel,
): InstanceSource {
  const source = sources.get(`${assetId}::${level}`);
  expect(source).toBeDefined();
  return source!;
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * 目标读数 m 处的俯视相机（按指定档半径定标；fov 90° → tan(fovY/2)=1 →
 * m = 视距 / (R×scale)，scale=1）：置于块 (0,0) 中心正上方，块盒 Y 顶 =
 * baseY + GEO_HALF×maxScale = 1 → 最近点距离 = camY − 1 = m × radius。
 * cameraAtM（按 high 半径定标）适用于评估 high 档内条目；块迁 mid/low 档后读数
 * 按当档半径换算（半径换源平移），评估时须按实际档半径定标。
 */
function cameraAtMeasuredM(m: number, radius: number, aspect = 1): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, aspect, 0.5, 100000);
  const distance = m * radius;
  camera.position.set(10, GEO_HALF + distance, 10);
  camera.lookAt(10, 0, 10);
  return camera;
}

/** 目标读数 m 处的俯视相机（high 档半径定标——起步 / high 档内评估用） */
function cameraAtM(m: number, aspect = 1): THREE.PerspectiveCamera {
  return cameraAtMeasuredM(m, SOURCE_RADIUS, aspect);
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

    // 带内往返（名义线 ×(1−band) ~ 名义线 开区间内振荡多次）：块已迁 mid 档 → 机位
    // 按 mid 半径定标（cameraAtMeasuredM）使读数精确落带内：保持 mid、零新请求
    const bandLow = t.highToMid * (1 - t.hysteresisBand);
    for (const frac of [0.05, 0.5, 0.95, 0.3, 0.8]) {
      const inBandM = bandLow + (t.highToMid - bandLow) * frac;
      await settleAt(m, cameraAtMeasuredM(inBandM, LEVEL_RADIUS.mid));
      expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    }
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade);

    // 越过升档线（mid 半径口径读数 < 名义线 ×(1−band)）：回 high
    await settleAt(m, cameraAtMeasuredM(bandLow * 0.97, LEVEL_RADIUS.mid));
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
    // 块已迁 mid 档 → 机位按 mid 半径定标（读数 6.06，名义线上侧的迟滞保持区内静止）
    const camera = cameraAtMeasuredM(t.highToMid * 1.01, LEVEL_RADIUS.mid);
    for (let i = 0; i < 5; i++) {
      m.frame(camera, true);
      await flush();
      expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    }
    expect(provider).toHaveBeenCalledTimes(2);
    m.dispose();
  });
});

// ── 档间半径差（真实差异化包围球下的现状语义不变量）─────────

describe('ScatterChunkManager LOD：档间半径差与迟滞吸收', () => {
  it('档间半径差（High ≥ Mid/Low，2~5% 量级）被 15% 迟滞带吸收：highToMid 临界推拉零 churn', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    // 跨出名义线（high 档读数 6.05）→ 立即降 mid；重建后当档源换 mid 几何（半径 4.8）
    await settleAt(m, cameraAtM(t.highToMid + 0.05));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    const callsAfterDowngrade = provider.mock.calls.length;

    // 同机位下一帧：读数 = 6.05 × R_high/R_mid ≈ 6.30（半径换源平移 +4.2%）——仍在
    // mid 名义带，零换档（平移量被迟滞带吞没）
    await settleAt(m, cameraAtM(t.highToMid + 0.05));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade);

    // 临界推拉：读数在名义线 ±~3%（≥ 半径差量级）来回跨线多次再返回——全部被迟滞
    // 吸收：保持 mid、零重建 / 零源请求
    for (const reading of [6.2, 5.8, 6.15, 5.85, 6.1, 5.9]) {
      await settleAt(m, cameraAtMeasuredM(reading, LEVEL_RADIUS.mid));
      expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    }
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade); // 零源请求 churn

    // 决定性越过升档线（mid 半径口径读数 < 名义线 ×(1−band)）：单次回 high
    await settleAt(
      m,
      cameraAtMeasuredM(t.highToMid * (1 - t.hysteresisBand) * 0.97, LEVEL_RADIUS.mid),
    );
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('high');
    m.dispose();
  });

  it('high→mid 换档后半径换源：下一帧读数用新档半径、平移被迟滞吸收不回弹', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    // high 档读数 6.2 → 立即降 mid（重建后当档源 = mid 几何，半径 4.8）
    await settleAt(m, cameraAtM(t.highToMid + 0.2));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    const callsAfterDowngrade = provider.mock.calls.length;

    // 半径换源判别机位：mid 半径口径读数 5.2 ∈ [升档线 5.1, 名义线 6)——被迟滞吸收停留
    // mid；若仍用旧档（high）半径评估，读数 = 5.2 × R_mid/R_high = 4.99 < 5.1 会回
    // high。停留 mid = 「下一帧读数已用新档半径」且平移不触发反向换档的双证据
    const holdReading = t.highToMid * (1 - t.hysteresisBand) + 0.1;
    await settleAt(m, cameraAtMeasuredM(holdReading, LEVEL_RADIUS.mid));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('mid');
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade);
    m.dispose();
  });

  it('mid→low 换档读数回缩（Low 半径 > Mid）同样被吸收：名义线回读不立即回弹', async () => {
    const { provider, sources } = makeLeveledProvider();
    const m = new ScatterChunkManager({
      provideSource: provider,
      getAssetLevels: () => ['high', 'mid', 'low'],
    });
    m.setSource('s', baseParams());
    await flush();
    const t = LOD_THRESHOLDS;

    // 推过 highToMid（high 档读数 6.2）→ mid；再推过 midToLow（mid 半径口径 16.05）→ low
    await settleAt(m, cameraAtM(t.highToMid + 0.2));
    await settleAt(m, cameraAtMeasuredM(t.midToLow + 0.05, LEVEL_RADIUS.mid));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('low');
    const callsAfterDowngrade = provider.mock.calls.length;

    // 同机位下一帧：读数 = 16.05 × R_mid/R_low ≈ 15.72——名义上已回 mid 带（< 16），
    // 但升档线 = 16 × (1−band) = 13.6，回缩量（−2%）远小于迟滞带宽 → 不回弹 mid。
    // 换档 → 半径换源 → 读数平移 → 被迟滞吸收，整链在「读数朝升档线方向回缩」的
    // 不利方向下同样成立
    await settleAt(m, cameraAtMeasuredM(t.midToLow + 0.05, LEVEL_RADIUS.mid));
    expect(activeMeshOf(m, sources, 'asset_tree')?.level).toBe('low');
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade);
    m.dispose();
  });
});

// ── 换档重建实例完整 ────────────────────────────────────────

describe('ScatterChunkManager LOD：换档重建实例完整（确定性重撒 + T006.4 降档抽稀）', () => {
  it('high/mid 全保真逐位一致；low 按 BATCH_POLICY 确定性抽稀（保留集 ⊂ 真相源、同档双跑逐位一致）', async () => {
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

    // high → mid：keep=1（BATCH_POLICY.levelInstanceKeep.mid 全保真）——count/矩阵/色逐位一致
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    const mid = activeMeshOf(m, sources, 'asset_tree')!;
    expect(mid.level).toBe('mid');
    expect(mid.mesh.geometry).toBe(sourceOf(sources, 'asset_tree', 'mid').geometry);
    expect(mid.mesh.material).toBe(sourceOf(sources, 'asset_tree', 'mid').material);
    expect(mid.mesh.count).toBe(truth.length);
    expect(matrixSnapshot(mid.mesh)).toEqual(matrices);
    expect(colorSnapshot(mid.mesh)).toEqual(colors);

    // mid → low：远档抽稀（T006.4 语义——密度降级只作用于降档方向）
    await settleAt(m, cameraAtM(t.midToLow * 1.1));
    const low = activeMeshOf(m, sources, 'asset_tree')!;
    expect(low.level).toBe('low');
    expect(low.mesh.geometry).toBe(sourceOf(sources, 'asset_tree', 'low').geometry);
    expect(low.mesh.material).toBe(sourceOf(sources, 'asset_tree', 'low').material);
    // 期望保留集：按实例稳定序的确定性规则（domain keepThinnedInstance——测试与实现共用
    // 同一纯函数契约，规则本身的性质由 batchPolicy 测试锁定）
    const keep = BATCH_POLICY.levelInstanceKeep.low;
    const keptIndices: number[] = [];
    for (let i = 0; i < truth.length; i++) if (keepThinnedInstance(i, keep)) keptIndices.push(i);
    expect(low.mesh.count).toBe(keptIndices.length);
    // 保留集实例 = 真相源对应下标（矩阵与色逐位一致——subset 断言，非绕开）
    const keptMatrices = Float32Array.from(
      keptIndices.flatMap((i) => Array.from(matrices.subarray(i * 16, (i + 1) * 16))),
    );
    const keptColors = Float32Array.from(
      keptIndices.flatMap((i) => Array.from(colors!.subarray(i * 3, (i + 1) * 3))),
    );
    expect(matrixSnapshot(low.mesh)).toEqual(keptMatrices);
    expect(colorSnapshot(low.mesh)).toEqual(keptColors);

    // 同档确定性：low → mid → low 双跑，抽稀结果逐位一致
    await settleAt(m, cameraAtM(t.highToMid * 1.1));
    await settleAt(m, cameraAtM(t.midToLow * 1.1));
    const lowAgain = activeMeshOf(m, sources, 'asset_tree')!;
    expect(lowAgain.level).toBe('low');
    expect(matrixSnapshot(lowAgain.mesh)).toEqual(keptMatrices);
    expect(colorSnapshot(lowAgain.mesh)).toEqual(keptColors);
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
