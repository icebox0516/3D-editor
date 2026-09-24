/**
 * tests/runtime/InstancedAssetPool.shadow.test.ts —— 放置链阴影策略驱动测试
 * （T021.5，D41 §七/§5.4；执行面 = 本池三建网格点 + 过渡 shadowRepresentation 消费）。
 *
 * 覆盖（阈值一律经 LOD_THRESHOLDS / TRANSITION_BAND_RATIO 相对构造——锁值不碎测试）：
 * - 各表示 mesh 三字段独立断言（cast/receive/customDepthMaterial 按表示策略落值）：
 *   high/mid = full（挂源 SDF 深度材质）；**low = simplified 且跳过源提供的 LOW SDF
 *   深度材质**（不挂 → three 缺省实心几何深度——本任务唯一生产可见行为变化的机制面：
 *   low 影从叶形裁切变实心壳卡影，021.8 A/B 复核位）；
 * - culled 提交终态 belt-and-braces：终态整桶 visible=false 之外 cast/receive 一并
 *   false（零残影）；回视同帧复原策略值；
 * - 假想 canopy 声明资产（021.3 先例——真实资产 021.7 前不可达）：canopy 稳态
 *   receive=false + 深度材质挂载（simplified = canopy 源深度材质本身即轮廓级构造）；
 *   dither 中点 caster 翻转**恰一侧**（mesh 级 castShadow：中点前 mid 桶 cast /
 *   canopy 客座不 cast，中点后反向——§5.4 不做双 Shadow 交叉渐变）；shadowCasterInstances
 *   两侧恒 1；fade-out 退场期 cast 持续到 culled（退场带内 visible=true + cast=true，
 *   终态双 false——无「树没了影子还在」）；
 * - 诊断分组 split 亮网格（三建网格点之一）：混合分组态主网格 + 亮网格各自按策略
 *   落值（cast/receive/depth 同 mid 策略）；撤除分组恢复统一形态。
 * 边界：fake 源提供者按 (assetId × 槽 × 档) 分源，**每档源均携带 customDepthMaterial**
 *      （比真实资产更严——low 跳过挂载的断言应力：源有也不挂）；几何包围与机位口径
 *      同 InstancedAssetPool.lod.test.ts（High 档基准定标 cameraForM）。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { ID, Transform } from '../../src/core/types';
import type { ModelObject } from '../../src/domain/assets';
import { LOD_THRESHOLDS } from '../../src/domain/lod/lodPolicy';
import { TRANSITION_BAND_RATIO } from '../../src/domain/lod/transition';
import type { RuntimeRepresentation } from '../../src/domain/lod/representation';
import { InstancedAssetPool } from '../../src/runtime/instancing/InstancedAssetPool';
import type { InstanceSource } from '../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具（口径同 InstancedAssetPool.lod.test.ts）──────────

/** 三档源几何包围球球心/半径（High 档基准定标口径，差异应力同 lod 测试） */
const LEVEL_CENTER: Record<RuntimeRepresentation, THREE.Vector3> = {
  high: new THREE.Vector3(0, 3, 0),
  mid: new THREE.Vector3(0, 3, 0.5),
  low: new THREE.Vector3(0, 3, -0.5),
  canopy: new THREE.Vector3(0, 3, 0.25), // 假想 canopy 源（真实资产 021.7 前不可达）
};
const LEVEL_RADIUS: Record<RuntimeRepresentation, number> = {
  high: 2,
  mid: 1.92,
  low: 1.96,
  canopy: 2.02,
};
const SOURCE_CENTER = LEVEL_CENTER.high;
const SOURCE_RADIUS = LEVEL_RADIUS.high;

function makeModel(id: ID, assetId: string, t: Transform, seed?: number): ModelObject {
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
    asset: seed === undefined ? { assetId } : { assetId, seed },
  };
}

/**
 * (assetId × 槽 × 档) 源：**每档均携带 customDepthMaterial**（比真实资产严——low
 * 跳过挂载的断言应力：策略语义 = 即便源提供也不挂，靠 three 缺省实心几何深度）。
 */
function leveledSource(level: RuntimeRepresentation): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingSphere = new THREE.Sphere(LEVEL_CENTER[level].clone(), LEVEL_RADIUS[level]);
  return {
    geometry,
    material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
    customDepthMaterial: new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
    }),
  };
}

const slotPoolKey = (assetId: string, seed?: number): string =>
  `${assetId}:slot-${(seed ?? 0) % 8}`;

function makeLeveledProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(
    async (assetId: string, seed?: number, level?: RuntimeRepresentation): Promise<InstanceSource> => {
      const key = `${assetId}::slot-${(seed ?? 0) % 8}::${level ?? 'high'}`;
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

function transformAt(x: number, y: number, z: number): Transform {
  return {
    position: { x, y, z },
    rotation: { x: 0, y: x * 0.1, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
}

/** 目标度量 m 的机位（High 档基准定标——读数与条目当前档位无关，lod 测试同口径） */
function cameraForM(m: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(0, SOURCE_CENTER.y, -m * SOURCE_RADIUS);
  camera.lookAt(0, SOURCE_CENTER.y, 10);
  return camera;
}

/** 同源几何判（fade 包装后 mesh.geometry ≠ 源几何——position 属性对象身份判） */
function holdsSource(mesh: THREE.Mesh, geometry: THREE.BufferGeometry): boolean {
  return (
    mesh.geometry === geometry ||
    mesh.geometry.attributes.position === geometry.attributes.position
  );
}

/** 找持有指定源几何的渲染网格（桶按几何身份定位） */
function meshHolding(
  pool: InstancedAssetPool,
  geometry: THREE.BufferGeometry,
): THREE.Mesh | undefined {
  return pool.root.children.find(
    (c) => (c as THREE.Mesh).isMesh && holdsSource(c as THREE.Mesh, geometry),
  ) as THREE.Mesh | undefined;
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

/** 三档带 seed 池（实例化路径 + levels 派生链） */
function makeLodPool(provider: ReturnType<typeof makeLeveledProvider>['provider']) {
  return new InstancedAssetPool({
    provideSource: provider,
    resolvePoolKey: slotPoolKey,
    getRepresentationCapability: () => ({ levels: ['high', 'mid', 'low'] }),
  });
}

/** 假想 canopy 池（representations 声明优先——真实 13 树种未声明 canopy） */
function makeCanopyPool(provider: ReturnType<typeof makeLeveledProvider>['provider']) {
  return new InstancedAssetPool({
    provideSource: provider,
    resolvePoolKey: slotPoolKey,
    getRepresentationCapability: (assetId) =>
      assetId === 'asset_canopy_tree'
        ? { representations: ['high', 'mid', 'canopy'] }
        : { levels: ['high', 'mid', 'low'] },
  });
}

const T = LOD_THRESHOLDS;
const W = TRANSITION_BAND_RATIO;

// ── 各表示三字段 + low 跳过源深度材质 + culled 零残影 ────────

describe('InstancedAssetPool 阴影策略：各表示三字段（策略驱动落值）', () => {
  it('high/mid = full（挂源 SDF 深度材质）；low = simplified 跳过源深度材质（实心几何深度）；culled 终态 cast/receive 一并 false（零残影）；回视复原', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('tree-1', 'asset_tree', transformAt(0, 0, 0), 3)); // slot-3
    await flush();

    // high：cast/receive true + 挂源深度材质（full——现状沿承）
    pool.frameLod(cameraForM(T.highToMid * 0.5), true);
    await flush();
    const highMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 3, 'high').geometry)!;
    expect(highMesh).toBeDefined();
    expect(highMesh.castShadow).toBe(true);
    expect(highMesh.receiveShadow).toBe(true);
    expect(highMesh.customDepthMaterial).toBe(sourceOf(sources, 'asset_tree', 3, 'high').customDepthMaterial);

    // mid：同 full 挂载（021.8 A/B 候选位——表值可调即断言跟随表）
    pool.frameLod(cameraForM(T.highToMid * 1.5), true);
    await flush();
    const midMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 3, 'mid').geometry)!;
    expect(midMesh.castShadow).toBe(true);
    expect(midMesh.receiveShadow).toBe(true);
    expect(midMesh.customDepthMaterial).toBe(sourceOf(sources, 'asset_tree', 3, 'mid').customDepthMaterial);

    // low：cast/receive true + **不挂**（源携带 LOW SDF 深度材质也跳过——simplified
    // = 实心壳卡影，本任务唯一生产可见行为变化，021.8 A/B 复核位）
    pool.frameLod(cameraForM(T.midToCanopy * 1.125), true);
    await flush();
    const lowMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 3, 'low').geometry)!;
    expect(lowMesh.castShadow).toBe(true);
    expect(lowMesh.receiveShadow).toBe(true);
    expect(sourceOf(sources, 'asset_tree', 3, 'low').customDepthMaterial).toBeDefined(); // 源确有
    expect(lowMesh.customDepthMaterial).toBeUndefined(); // 策略跳过（three 缺省深度）

    // culled 终态：visible=false 之外 cast/receive 一并 false（belt-and-braces，
    // §七 Cull=off——无残影）；shadowCaster 计数归零
    pool.frameLod(cameraForM(T.canopyToCulled * (1 + W) * 1.02), true);
    await flush();
    expect(lowMesh.visible).toBe(false);
    expect(lowMesh.castShadow).toBe(false);
    expect(lowMesh.receiveShadow).toBe(false);
    expect(pool.getLodDistribution().shadowCasterInstances).toBe(0);

    // 回视：同帧复原策略值（cast/receive/深度挂载不受终态历史影响）
    pool.frameLod(cameraForM(T.midToCanopy * 1.125), true);
    await flush();
    expect(lowMesh.visible).toBe(true);
    expect(lowMesh.castShadow).toBe(true);
    expect(lowMesh.receiveShadow).toBe(true);
    expect(lowMesh.customDepthMaterial).toBeUndefined();
    pool.dispose();
  });
});

// ── 假想 canopy 资产：receive=false + 深度挂载 + 中点恰一侧 + fade-out 零残影 ──

describe('InstancedAssetPool 阴影策略：canopy（假想声明资产，021.3 先例）', () => {
  it('dither 中点 caster 翻转恰一侧（mesh 级双侧断言）+ canopy receive=false + 深度材质挂载 + shadowCasterInstances 两侧恒 1', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1)); // slot-1
    await flush();

    // mid 桶起步（硬切）
    pool.frameLod(cameraForM(T.highToMid * 1.5), true);
    await flush();
    const midMesh = meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'mid').geometry)!;
    expect(midMesh.castShadow).toBe(true);

    // dither 中点前（f=0.25）：mid 桶 cast、canopy 客座不 cast（恰一侧 = current 侧）；
    // 客座 receive=false（canopy 策略）+ 挂 canopy 源深度材质（simplified 构造）
    const pre = T.midToCanopy * (1 + W * 0.25);
    pool.frameLod(cameraForM(pre), true);
    await flush();
    pool.frameLod(cameraForM(pre), true); // 冷源到达后次帧建客座
    await flush();
    const guest = meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry)!;
    expect(guest).toBeDefined();
    expect(midMesh.castShadow).toBe(true);
    expect(guest.castShadow).toBe(false);
    expect(guest.receiveShadow).toBe(false); // canopy 受影初始关闭（021.8 A/B 可开项）
    expect(guest.customDepthMaterial).toBe(
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').customDepthMaterial,
    );
    expect(midMesh.receiveShadow).toBe(true);
    expect(pool.getLodDistribution().shadowCasterInstances).toBe(1); // 恰一侧（mid 属主）

    // 中点后（f=0.75）：翻转——mid 桶不 cast、canopy 客座 cast（恰一侧 = target 侧）
    const post = T.midToCanopy * (1 + W * 0.75);
    pool.frameLod(cameraForM(post), true);
    await flush();
    expect(midMesh.castShadow).toBe(false);
    expect(guest.castShadow).toBe(true);
    expect(pool.getLodDistribution().shadowCasterInstances).toBe(1); // 仍恰一侧（canopy 客座）

    // 带末完成迁移：属主入 canopy 桶——稳态策略（cast true / receive false / 深度挂载）
    const bandEnd = T.midToCanopy * (1 + W) * 1.01;
    pool.frameLod(cameraForM(bandEnd), true);
    await flush();
    const canopyOwn = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry,
    )!;
    expect(canopyOwn).toBeDefined();
    expect(canopyOwn.castShadow).toBe(true);
    expect(canopyOwn.receiveShadow).toBe(false);
    expect(canopyOwn.customDepthMaterial).toBe(
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').customDepthMaterial,
    );
    pool.dispose();
  });

  it('fade-out 退场（canopy → culled）：退场带内 cast 持续（树影随树退场）；终态 cast/receive 一并 false 零残影', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1));
    await flush();

    // 到达 canopy 稳态（mid 硬切 → dither 带末完成；冷源两跳）
    pool.frameLod(cameraForM(T.highToMid * 1.5), true);
    await flush();
    const bandEnd = T.midToCanopy * (1 + W) * 1.01;
    pool.frameLod(cameraForM(bandEnd), true);
    await flush();
    pool.frameLod(cameraForM(bandEnd), true);
    await flush();
    const canopyMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry,
    )!;
    expect(canopyMesh.castShadow).toBe(true);

    // 退场带内（f = 0.2）：可见 + cast 持续（fade-out 期阴影表示恒 current——影子随
    // 树一起退场，不先消失也不残留）
    pool.frameLod(cameraForM(T.canopyToCulled * 1.05), true);
    await flush();
    expect(canopyMesh.visible).toBe(true);
    expect(canopyMesh.castShadow).toBe(true);
    expect(pool.getLodDistribution().shadowCasterInstances).toBe(1);

    // 终态线外：visible=false + cast/receive 一并 false（belt-and-braces——无「树没了
    // 影子还在」）
    pool.frameLod(cameraForM(T.canopyToCulled * (1 + W) * 1.02), true);
    await flush();
    expect(canopyMesh.visible).toBe(false);
    expect(canopyMesh.castShadow).toBe(false);
    expect(canopyMesh.receiveShadow).toBe(false);
    expect(pool.getLodDistribution().shadowCasterInstances).toBe(0);
    pool.dispose();
  });
});

// ── 诊断分组 split 亮网格（三建网格点之一）──────────────────

describe('InstancedAssetPool 阴影策略：诊断分组亮网格', () => {
  it('混合分组态主网格 + 亮网格各自按 mid 策略落值（cast/receive true + 深度挂载）；撤除分组恢复统一形态', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('dim', 'asset_tree', transformAt(0, 0, 0), 5));
    pool.attach(makeModel('bright', 'asset_tree', transformAt(2, 0, 0), 5 + 8)); // 同槽合桶
    await flush();
    pool.frameLod(cameraForM(T.highToMid * 1.5), true); // mid 桶
    await flush();
    const midSource = sourceOf(sources, 'asset_tree', 5, 'mid');

    pool.setDiagnosticGrouping((id) => id === 'dim', 20); // 混合：dim 暗侧 + bright 亮侧
    const main = meshHolding(pool, midSource.geometry)! as THREE.InstancedMesh;
    const highlight = pool.root.children.find(
      (c) => (c as THREE.InstancedMesh).isInstancedMesh && c !== main,
    ) as THREE.InstancedMesh;
    expect(highlight).toBeDefined();
    for (const mesh of [main, highlight]) {
      expect(mesh.castShadow).toBe(true); // mid 策略（两侧各自 OR——dim/bright 各含 renderable caster）
      expect(mesh.receiveShadow).toBe(true);
      expect(mesh.customDepthMaterial).toBe(midSource.customDepthMaterial);
    }

    pool.setDiagnosticGrouping(null, 0); // 撤除：恢复统一形态、策略值不变
    const mainAfter = meshHolding(pool, midSource.geometry)!;
    expect(mainAfter.castShadow).toBe(true);
    expect(mainAfter.receiveShadow).toBe(true);
    pool.dispose();
  });
});
