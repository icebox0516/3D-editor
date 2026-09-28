/**
 * tests/runtime/RuntimeViewport.representation-pick.test.ts —— 表示过渡期拾取核对
 * 测试（T021.7，D41 §十二「拾取身份不变」——真实 THREE.Raycaster 端到端路径）。
 *
 * 核对结论落测试（resolvePick 槽位映射面已由 InstancedAssetPool.lod.test.ts 覆盖
 * ——mid 网格命中同 id（:336）与 dither 期 canopy 客座命中同 id（:804）；本文件补
 * **真实射线**端到端缺口）：
 * - dither 双表示共存期（属主 mid 桶 + canopy 客座桶并存）：pickObject 命中返回
 *   同一业务 id（两桶实例都映射回同一对象——fade 期仍可拾取）；
 * - fade-out 退场带内（aFadeOut ∈ (0,1)、矩阵真值）：射线照常命中（退场带内可
 *   拾取、终态线外才不可拾取——021.3 记档口径复核）；
 * - 真 cull 终态（零缩放槽 + 整桶 visible=false）：射线不可命中（r186 raycaster
 *   不跳 visible=false——零缩放退化三角形是真实挡板）；同场可拾取对象不受影响；
 * - pin 解除 cull 后恢复可拾取（编辑态所见即所得的拾取面）。
 * 环境：node（无 WebGL；真实 Raycaster 对纯构造场景图做拾取数学，世界矩阵由
 * harness 显式刷新）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { ID, Transform } from '../../src/core/types';
import type { ModelObject } from '../../src/domain/assets';
import { LOD_THRESHOLDS } from '../../src/domain/lod/lodPolicy';
import { TRANSITION_BAND_RATIO } from '../../src/domain/lod/transition';
import type { RuntimeRepresentation } from '../../src/domain/lod/representation';
import { InstancedAssetPool } from '../../src/runtime/instancing/InstancedAssetPool';
import type { InstanceSource } from '../../src/runtime/instancing/InstancedAssetPool';
import { RuntimeObjectMap } from '../../src/runtime/RuntimeObjectMap';
import { RuntimeViewport } from '../../src/runtime/services/RuntimeViewport';

// ── 构造工具（leveled 源对齐 InstancedAssetPool.lod.test.ts；拾取 harness 对齐
//    RuntimeViewport.instanced.test.ts）────────────────────────

const SLOTS = 8;
const SOURCE_CENTER = new THREE.Vector3(0, 3, 0);
const SOURCE_RADIUS = 2;

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

function makeModel(id: ID, assetId: string, t: Transform, seed: number): ModelObject {
  return {
    id,
    type: 'model',
    name: `模型-${id}`,
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: t,
    properties: {},
    asset: { assetId, seed },
  };
}

/** (assetId × 槽 × 档) 分源（几何平移到声明球心 (0,3,0) 同心——拾取射线预剔用声明球） */
function leveledSource(level: RuntimeRepresentation): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 4, 2); // 底原点抬半高：占据 y∈[1,5]
  geometry.translate(0, 3, 0);
  geometry.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(0, 3, 0),
    level === 'canopy' ? 2.02 : 2,
  );
  return { geometry, material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) };
}

function makeLeveledProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(
    async (assetId: string, seed?: number, level?: RuntimeRepresentation): Promise<InstanceSource> => {
      const key = `${assetId}::slot-${(seed ?? 0) % SLOTS}::${level ?? 'high'}`;
      let source = sources.get(key);
      if (!source) {
        source = leveledSource(level ?? 'high');
        sources.set(key, source);
      }
      return source;
    },
  );
  return { provider, sources };
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function cameraForM(m: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(0, SOURCE_CENTER.y, -m * SOURCE_RADIUS);
  camera.lookAt(0, SOURCE_CENTER.y, 10);
  return camera;
}

function holdsSource(mesh: THREE.InstancedMesh, geometry: THREE.BufferGeometry): boolean {
  return (
    mesh.geometry === geometry ||
    mesh.geometry.attributes.position === geometry.attributes.position
  );
}

function meshHolding(
  pool: InstancedAssetPool,
  geometry: THREE.BufferGeometry,
): THREE.InstancedMesh | undefined {
  return pool.root.children.find(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && holdsSource(c as THREE.InstancedMesh, geometry),
  ) as THREE.InstancedMesh | undefined;
}

function sourceOf(
  sources: Map<string, InstanceSource>,
  assetId: string,
  slot: number,
  level: RuntimeRepresentation,
): InstanceSource {
  const source = sources.get(`${assetId}::slot-${slot}::${level}`);
  expect(source).toBeDefined();
  return source!;
}

/**
 * 拾取 harness：RuntimeViewport 装配复刻（Renderer 同构——resolvePick 注入）+ 表示
 * 驱动机位。pickAt 把相机摆到目标点前上方正视（NDC 中心射线穿过目标）后拾取。
 */
function createHarness() {
  const { provider, sources } = makeLeveledProvider();
  const pool = new InstancedAssetPool({
    provideSource: provider,
    resolvePoolKey: (assetId, seed) => `${assetId}:slot-${(seed ?? 0) % SLOTS}`,
    getRepresentationCapability: (assetId) =>
      assetId === 'asset_canopy_tree'
        ? { representations: ['high', 'mid', 'canopy'] }
        : { levels: ['high', 'mid', 'low'] },
  });
  const map = new RuntimeObjectMap();
  const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 100000);
  const pickRoot = new THREE.Group();
  pickRoot.add(pool.root);
  const viewport = new RuntimeViewport(fakeCanvas(), camera, pickRoot, map, (hit) =>
    pool.resolvePick(hit),
  );

  const drop = (id: ID, assetId: string, t: Transform, seed: number): void => {
    const anchor = pool.attach(makeModel(id, assetId, t, seed));
    map.set(id, anchor);
  };
  const frame = (): void => {
    pickRoot.updateMatrixWorld(true);
  };
  /** 拾取瞄准视觉中心（几何平移后 y=3——与声明球心一致，见 leveledSource） */
  const pickAt = (x: number, y: number, z: number): ID | null => {
    camera.position.set(x, y + 8, z + 12);
    camera.lookAt(x, y, z);
    camera.updateMatrixWorld(true);
    return viewport.pickObject(400, 300);
  };
  return { pool, map, viewport, sources, drop, frame, pickAt };
}

// ── 测试 ────────────────────────────────────────────────────

describe('表示过渡期拾取（真实 Raycaster 端到端）', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('dither 双表示共存期：属主 mid 桶与 canopy 客座桶并存，pickObject 命中返回同一业务 id', async () => {
    const h = createHarness();
    h.drop('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1);
    await flush();
    const t = LOD_THRESHOLDS;

    // 到 mid → 进 canopy 带 f=0.25（两帧 + flush：冷源排队后建客座）
    h.pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    const mQuarter = t.midToCanopy * (1 + TRANSITION_BAND_RATIO * 0.25);
    h.pool.frameLod(cameraForM(mQuarter), true);
    await flush();
    h.pool.frameLod(cameraForM(mQuarter), true);
    await flush();
    const midMesh = meshHolding(h.pool, sourceOf(h.sources, 'asset_canopy_tree', 1, 'mid').geometry)!;
    const canopyMesh = meshHolding(
      h.pool,
      sourceOf(h.sources, 'asset_canopy_tree', 1, 'canopy').geometry,
    )!;
    expect(midMesh).toBeDefined(); // 双桶并存前置
    expect(canopyMesh).toBeDefined();
    // 槽位映射面双侧同 id（对齐 §十二「两桶实例都映射回同一 objectId」）
    expect(h.pool.resolvePick({ object: midMesh, instanceId: 0 } as unknown as THREE.Intersection)).toBe('hypo');
    expect(h.pool.resolvePick({ object: canopyMesh, instanceId: 0 } as unknown as THREE.Intersection)).toBe('hypo');
    // 真实射线：命中（无论先撞哪一侧）→ 同一业务 id（fade 期仍可拾取）
    h.frame();
    expect(h.pickAt(0, 3, 0)).toBe('hypo');
    h.pool.dispose();
  });

  it('fade-out 退场带内可拾取（aFadeOut ∈ (0,1)、矩阵真值）', async () => {
    const h = createHarness();
    h.drop('fading', 'asset_tree', transformAt(0, 0, 0), 2); // legacy 链：low 桶 fade-out 载体
    await flush();
    const t = LOD_THRESHOLDS;

    h.pool.frameLod(cameraForM(t.midToCanopy + 0.5), true); // 到 low
    await flush();
    h.pool.frameLod(cameraForM(t.canopyToCulled * 1.05), true); // 退场带内 f≈0.2
    await flush();
    const lowMesh = meshHolding(h.pool, sourceOf(h.sources, 'asset_tree', 2, 'low').geometry)!;
    expect(lowMesh).toBeDefined();
    const attr = lowMesh.geometry.getAttribute('aFadeOut') as THREE.InstancedBufferAttribute;
    const fade = (attr.array as Float32Array)[0];
    expect(fade).toBeGreaterThan(0);
    expect(fade).toBeLessThan(1); // 前置：退场带内（非终态）
    h.frame();
    expect(h.pickAt(0, 3, 0)).toBe('fading'); // 带内照常命中
    h.pool.dispose();
  });

  it('真 cull 终态不可拾取（零缩放 + 整桶 visible=false）；近处对照对象不受影响', async () => {
    const h = createHarness();
    h.drop('gone', 'asset_tree', transformAt(0, 0, 0), 3);
    h.drop('kept', 'asset_tree', transformAt(15, 0, 0), 3 + SLOTS); // 同槽合桶：终态后整桶隐藏的对照位
    // 近处对照：紧邻终态机位（相机 z = -m×R 处）——m≈6.5 恒 high 带不被裁
    h.drop('control', 'asset_tree', transformAt(0, 0, -140), 4);
    await flush();
    const t = LOD_THRESHOLDS;

    // 先经 low 带（fade-out 分型起点）→ 推过终态线 → 全 culled（整桶 visible=false + 槽零缩放）
    h.pool.frameLod(cameraForM((t.midToCanopy + t.canopyToCulled) / 2), true);
    await flush();
    h.pool.frameLod(cameraForM(t.canopyToCulled * (1 + TRANSITION_BAND_RATIO) * 1.02), true);
    await flush();
    const culledMesh = meshHolding(h.pool, sourceOf(h.sources, 'asset_tree', 3, 'low').geometry)!;
    expect(culledMesh.visible).toBe(false); // 整桶零提交前置
    h.frame();
    expect(h.pickAt(0, 3, 0)).toBeNull(); // 零缩放不可命中（真 cull 后不可拾取）
    expect(h.pickAt(15, 3, 0)).toBeNull(); // 同桶另一终态实例同判
    expect(h.pickAt(0, 3, -140)).toBe('control'); // 对照：可拾取对象不受影响
    h.pool.dispose();
  });

  it('pin 解除 cull 后恢复可拾取（编辑态所见即所得的拾取面）', async () => {
    const h = createHarness();
    h.drop('revive', 'asset_canopy_tree', transformAt(0, 0, 0), 5);
    await flush();
    const t = LOD_THRESHOLDS;

    // 到 canopy 稳定 → 终态 cull → pin 强制 high（解除裁剪）
    const canopyStable = t.midToCanopy * (1 + TRANSITION_BAND_RATIO) * 1.01;
    h.pool.frameLod(cameraForM(canopyStable), true);
    await flush();
    h.pool.frameLod(cameraForM(canopyStable), true);
    await flush();
    h.pool.frameLod(cameraForM(t.canopyToCulled * (1 + TRANSITION_BAND_RATIO) * 1.02), true);
    await flush();
    h.frame();
    expect(h.pickAt(0, 3, 0)).toBeNull(); // 前置：终态不可拾取

    h.pool.frameLod(
      cameraForM(t.canopyToCulled * (1 + TRANSITION_BAND_RATIO) * 1.02),
      true,
      new Set<ID>(['revive']),
    );
    await flush();
    h.frame();
    expect(h.pickAt(0, 3, 0)).toBe('revive'); // pin 恢复满矩阵 → 恢复可拾取
    h.pool.dispose();
  });
});
