/**
 * tests/runtime/InstancedAssetPool.lod.test.ts —— 放置链 source × level 分桶与跨桶
 * 迁移测试（T006.3，D27.4/D27.6/D27.8——多 source × level 交叉桶在本链验证）。
 *
 * 覆盖（阈值一律经 LOD_THRESHOLDS 相对构造，不硬编码数值——后续锁值不碎测试）：
 * - 交叉桶：8 形态槽（镜像夏栎 shapeFamily size=8 的槽路由）× 3 距离环 → 8×3 桶各
 *   一网格、桶 = 当档源 geometry/material 成套（D27.4「不做桶内换 Source」）；
 * - 换档迁移实例完整：跨桶后 count/矩阵/逐实例色逐位保持（渲染表示变化不改实例数据）；
 *   锚点对象身份跨迁移稳定（attach 幂等返回同引用）；
 * - 迟滞防抖：阈值带内往返不换桶（桶集与源请求零 churn）、越线单次换档；
 * - 拾取跨档一致：任意档网格命中 → 同一业务 id；
 * - culled：超远实例槽写零缩放（复用隐藏实例语义）、单例 Mesh visible=false；回视恢复原矩阵；
 * - 桶级提交跳过（T006.4，006.3 遗留治理面）：桶内全实例零像素（全 culled / 全隐藏）
 *   → InstancedMesh 整体 visible=false（省整桶 draw call，画面零变化）；部分 renderable
 *   → 保持提交；回视恢复同帧回 true；拾取语义不变（零缩放实例本就不可命中）；
 * - LOD 分布双口径（T006.4，D27.9）：实例按当前展示表示、桶按提交口径（整桶隐藏计
 *   culled）；
 * - 总开关：off = 全 High（跨桶迁移回 high）+ culled 旁路（超远不裁剪）；
 * - 单档资产（无 levels 声明）：恒 high、无 mid/low 源请求。
 * 边界：fake 源提供者按 (assetId × 槽 × level) 分源；几何包围手工钉死——选档输入
 *      确定性（球心 (0,3,0)/半径 2，镜像树木底原点几何）；评估器语义由 006.1 测试锁定。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { ID, Transform } from '../../src/core/types';
import type { ModelObject, ProceduralLevel } from '../../src/domain/assets';
import { LOD_THRESHOLDS } from '../../src/domain/lod/lodPolicy';
import { InstancedAssetPool } from '../../src/runtime/instancing/InstancedAssetPool';
import type { InstanceSource } from '../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具 ────────────────────────────────────────────────

/** 槽数（镜像夏栎 shapeFamily size=8——多 source × level 交叉桶的 source 维度） */
const SLOTS = 8;
/** 源几何包围球：球心 (0,3,0)（底原点树形）、半径 2 */
const SOURCE_RADIUS = 2;
const SOURCE_CENTER = new THREE.Vector3(0, 3, 0);

function makeModel(
  id: ID,
  assetId: string,
  t: Transform,
  seed?: number,
  visible = true,
): ModelObject {
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
    asset: seed === undefined ? { assetId } : { assetId, seed },
  };
}

/** (assetId × 槽 × 档) 源：几何身份即桶标签（按调用现场 key 缓存于 provider）；包围手工钉死 */
function leveledSource(): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingSphere = new THREE.Sphere(SOURCE_CENTER.clone(), SOURCE_RADIUS);
  return { geometry, material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) };
}

/** 槽路由池键（镜像 Renderer 注入形态：seed → slot-N sourceKey） */
const slotPoolKey = (assetId: string, seed?: number): string =>
  `${assetId}:slot-${(seed ?? 0) % SLOTS}`;

/** fake 源提供者：按 (assetId × 槽 × 档) 共享源（镜像缓存 sourceKey::level 去重语义） */
function makeLeveledProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(
    async (assetId: string, seed?: number, level?: ProceduralLevel): Promise<InstanceSource> => {
      const key = `${assetId}::slot-${(seed ?? 0) % SLOTS}::${level ?? 'high'}`;
      let source = sources.get(key);
      if (!source) {
        source = leveledSource();
        sources.set(key, source);
      }
      return source;
    },
  );
  return { provider, sources };
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** 通道值过 float32 舍入（instanceColor 为 Float32Array——期望值同舍入后精确比较） */
function f32(v: number): number {
  return Float32Array.of(v)[0];
}

/** 与池内组合逻辑一致的期望矩阵（Float32 舍入后精确比较） */
function expectedMatrix(t: Transform, visible = true): THREE.Matrix4 {
  const scale = visible ? t.scale : { x: 0, y: 0, z: 0 };
  const composed = new THREE.Matrix4().compose(
    new THREE.Vector3(t.position.x, t.position.y, t.position.z),
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(t.rotation.x, t.rotation.y, t.rotation.z),
    ),
    new THREE.Vector3(scale.x, scale.y, scale.z),
  );
  return new THREE.Matrix4().fromArray(Float32Array.from(composed.elements));
}

function transformAt(x: number, y: number, z: number, scale = 1): Transform {
  return {
    position: { x, y, z },
    rotation: { x: 0, y: x * 0.1, z: 0 },
    scale: { x: scale, y: scale, z: scale },
  };
}

/**
 * 目标度量 m 的对象位置（fov 90° → m = 视距 / R）：对象沿 +Z 排布，相机在
 * (0, 3, camZ) 沿 −Z 看；对象球心世界位 = (x, 3·scale, z) → 视距 = z − camZ。
 * 取 camZ = −R·mRef（远处参考线），对象 z = 0 → m = R·mRef/R… 简化：camZ = −m×R。
 */
function cameraForM(m: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(0, SOURCE_CENTER.y, -m * SOURCE_RADIUS);
  camera.lookAt(0, SOURCE_CENTER.y, 10);
  return camera;
}

/** 三档距离环的目标 m（相对阈值构造；对象 z=0、scale=1 → m = (z − camZ)/R 恒定） */
function ringM(): { high: number; mid: number; low: number } {
  const t = LOD_THRESHOLDS;
  return {
    high: t.highToMid * 0.5,
    mid: t.highToMid + (t.midToLow - t.highToMid) * 0.5,
    low: t.midToLow + (t.lowToCulled - t.midToLow) * 0.5,
  };
}

/** 找持有指定源几何的渲染网格（桶按几何身份定位） */
function meshHolding(
  pool: InstancedAssetPool,
  geometry: THREE.BufferGeometry,
): THREE.InstancedMesh | undefined {
  return pool.root.children.find(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && (c as THREE.InstancedMesh).geometry === geometry,
  ) as THREE.InstancedMesh | undefined;
}

function sourceOf(
  sources: Map<string, InstanceSource>,
  assetId: string,
  slot: number,
  level: ProceduralLevel,
): InstanceSource {
  const source = sources.get(`${assetId}::slot-${slot}::${level}`);
  expect(source).toBeDefined();
  return source!;
}

function makeLodPool(provider: ReturnType<typeof makeLeveledProvider>['provider']) {
  return new InstancedAssetPool({
    provideSource: provider,
    resolvePoolKey: slotPoolKey,
    getDeclaredLevels: () => ['high', 'mid', 'low'],
  });
}

// ── 交叉桶（D27.8：多 source × level 在放置链验证）─────────

describe('InstancedAssetPool LOD：8 槽 × 3 档交叉桶', () => {
  it('24 对象（8 槽 × 3 距离环）→ 24 桶各一网格、桶 = 当档源成套、同槽同档合桶', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    const rings = ringM();

    // 8 槽 × 3 环（seed = slot 确定性槽路由）；对象 z = 环 m × R、x=0——相机在
    // (0, 3, 0) 沿 +Z 看：球心世界位 (0,3,z) → 视距 = z → m = 环值（精确可控）。
    // 同 (槽,环) 第二对象（seed = slot + SLOTS → 同槽异 seed）验证同桶合批。
    for (let slot = 0; slot < SLOTS; slot++) {
      for (const ring of ['high', 'mid', 'low'] as const) {
        const z = rings[ring] * SOURCE_RADIUS;
        pool.attach(makeModel(`o-${slot}-${ring}`, 'asset_tree', transformAt(0, 0, z), slot));
        if (ring === 'mid') {
          pool.attach(
            makeModel(`o-${slot}-${ring}-b`, 'asset_tree', transformAt(0, 0, z), slot + SLOTS),
          );
        }
      }
    }
    await flush();
    expect(pool.root.children).toHaveLength(SLOTS); // 起步：每槽一个 high 桶

    const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
    camera.position.set(0, SOURCE_CENTER.y, 0);
    camera.lookAt(0, SOURCE_CENTER.y, 1000);
    pool.frameLod(camera, true);
    await flush();

    // 24 桶（8 槽 × 3 档）各恰一网格、几何 = 当档源（成套：geometry 绑定桶创建）
    expect(pool.root.children).toHaveLength(SLOTS * 3);
    for (let slot = 0; slot < SLOTS; slot++) {
      for (const level of ['high', 'mid', 'low'] as const) {
        const mesh = meshHolding(pool, sourceOf(sources, 'asset_tree', slot, level).geometry);
        expect(mesh).toBeDefined();
        // mid 环两对象同槽同档 → 合桶 count=2；其余环 count=1
        expect(mesh!.count).toBe(level === 'mid' ? 2 : 1);
      }
    }
    pool.dispose();
  });
});

// ── 换档迁移实例完整 ────────────────────────────────────────

describe('InstancedAssetPool LOD：换档跨桶迁移', () => {
  it('迁移后矩阵/颜色逐位保持、锚点身份稳定、旧桶拆除、拾取跨档一致', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    const model = makeModel('tree-1', 'asset_tree', transformAt(0, 0, 0), 3); // slot-3
    const anchor = pool.attach(model);
    const tint = new THREE.Color(f32(0.9), f32(1.0), f32(0.8));
    pool.setColor('tree-1', tint);
    await flush();
    const t = LOD_THRESHOLDS;

    // near：high 桶（起步即 high；frameLod 维持）
    pool.frameLod(cameraForM(t.highToMid * 0.5), true);
    await flush();
    const highMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 3, 'high').geometry)!;
    expect(highMesh.count).toBe(1);
    const probe = new THREE.Matrix4();
    highMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(model.transform))).toBe(true);
    const colorProbe = new THREE.Color();
    highMesh.getColorAt(0, colorProbe);
    expect(colorProbe.equals(tint)).toBe(true);

    // 远到 mid 带：迁移到 mid 桶——矩阵/颜色逐位随迁
    pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    const midMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 3, 'mid').geometry)!;
    expect(midMesh.count).toBe(1);
    midMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(model.transform))).toBe(true);
    midMesh.getColorAt(0, colorProbe);
    expect(colorProbe.equals(tint)).toBe(true);
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 3, 'high').geometry)).toBeUndefined(); // 旧桶拆空移除

    // 锚点身份跨迁移稳定（attach 幂等同 sourceKey 返回同一锚点）
    expect(pool.attach(makeModel('tree-1', 'asset_tree', model.transform, 3))).toBe(anchor);

    // 拾取跨档一致：mid 网格命中 → 同一业务 id
    expect(
      pool.resolvePick({ object: midMesh, instanceId: 0 } as unknown as THREE.Intersection),
    ).toBe('tree-1');
    pool.dispose();
  });

  it('迟滞防抖：阈值带内往返零换桶（桶集/源请求稳定）、越线单次换档', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('a', 'asset_tree', transformAt(0, 0, 0), 5));
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.highToMid * 1.05), true); // 过名义线立即降 mid
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'mid').geometry)).toBeDefined();
    const callsAfterDowngrade = provider.mock.calls.length;
    const meshesAfterDowngrade = pool.root.children.length;

    const bandLow = t.highToMid * (1 - t.hysteresisBand);
    for (const frac of [0.05, 0.5, 0.95, 0.3, 0.8]) {
      pool.frameLod(cameraForM(bandLow + (t.highToMid - bandLow) * frac), true);
      await flush();
      expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'mid').geometry)).toBeDefined();
    }
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade); // 零新源请求
    expect(pool.root.children.length).toBe(meshesAfterDowngrade); // 桶集零变化

    pool.frameLod(cameraForM(bandLow * 0.97), true); // 越升档线 → 回 high
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'high').geometry)).toBeDefined();
    pool.dispose();
  });
});

// ── culled（超远调度结果）──────────────────────────────────

describe('InstancedAssetPool LOD：culled', () => {
  it('超远实例槽写零缩放（真值保留）、回视恢复原矩阵；单例 Mesh visible=false', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    const model = makeModel('far', 'asset_tree', transformAt(0, 0, 0), 7); // slot-7（seed 池恒实例化）
    pool.attach(model);
    await flush();
    const t = LOD_THRESHOLDS;

    // 先经 low 带（换档迁移到 low 桶），再推超远 → culled（实例留在 low 桶）
    pool.frameLod(cameraForM(t.midToLow + (t.lowToCulled - t.midToLow) * 0.5), true);
    await flush();
    pool.frameLod(cameraForM(t.lowToCulled * 1.1), true);
    await flush();
    // culled：实例留在 low 桶
    const lowMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 7, 'low').geometry)!;
    const probe = new THREE.Matrix4();
    lowMesh.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(true); // 槽零缩放
    expect(lowMesh.count).toBe(1); // 实例仍登记（真值在 entry）

    // 回视（越过 culled 升档线）：恢复可见且矩阵 = 真值
    pool.frameLod(cameraForM(t.midToLow + (t.lowToCulled - t.midToLow) * 0.5), true);
    await flush();
    lowMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(model.transform))).toBe(true);

    // 单例路径（无 seed 池单实例退化普通 Mesh）：culled → visible=false
    const single = makeModel('solo', 'asset_tree', transformAt(0, 0, 0)); // 无 seed
    pool.attach(single);
    await flush();
    const soloMesh = pool.root.children.find(
      (c) => (c as THREE.Mesh).isMesh && !(c as THREE.InstancedMesh).isInstancedMesh,
    ) as THREE.Mesh;
    expect(soloMesh).toBeDefined();
    pool.frameLod(cameraForM(t.lowToCulled * 1.2), true);
    await flush();
    expect(soloMesh.visible).toBe(false);
    pool.frameLod(cameraForM(t.highToMid * 0.5), true);
    await flush();
    expect(soloMesh.visible).toBe(true);
    pool.dispose();
  });
});

// ── 桶级提交跳过（T006.4，006.3 遗留治理面）────────────────

describe('InstancedAssetPool LOD：桶级提交跳过', () => {
  it('桶内全 culled → InstancedMesh visible=false（整桶零提交）；回视恢复同帧回 true', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    // 同槽两对象（合桶）：都推超远 → 全 culled → 整桶跳过提交
    const a = makeModel('a', 'asset_tree', transformAt(0, 0, 0), 5);
    pool.attach(a);
    pool.attach(makeModel('b', 'asset_tree', transformAt(2, 0, 0), 5 + SLOTS));
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.midToLow + (t.lowToCulled - t.midToLow) * 0.5), true);
    await flush();
    const lowMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'low').geometry)!;
    expect(lowMesh.count).toBe(2);
    expect(lowMesh.visible).toBe(true); // 部分渲染中（都未 culled）

    pool.frameLod(cameraForM(t.lowToCulled * 1.1), true);
    await flush();
    expect(lowMesh.count).toBe(2); // 实例仍登记（真值在 entry）
    expect(lowMesh.visible).toBe(false); // 全 culled → 整桶零提交（T006.4）

    // 回视：越过 culled 升档线 → 同帧恢复提交与真值矩阵
    pool.frameLod(cameraForM(t.midToLow + (t.lowToCulled - t.midToLow) * 0.5), true);
    await flush();
    expect(lowMesh.visible).toBe(true);
    const probe = new THREE.Matrix4();
    lowMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(a.transform))).toBe(true);
    pool.dispose();
  });

  it('部分 culled 保持提交（renderable 实例仍在）；全隐藏（visible=false）同样整桶跳过', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    const a = makeModel('a', 'asset_tree', transformAt(0, 0, 0), 5);
    const b = makeModel('b', 'asset_tree', transformAt(2, 0, 0), 5 + SLOTS);
    pool.attach(a);
    pool.attach(b);
    await flush();
    const t = LOD_THRESHOLDS;

    // b 隐藏（图层/对象级）、a 可见：桶保持提交
    pool.update('b', b.transform, false);
    pool.frameLod(cameraForM(t.highToMid * 0.5), true);
    await flush();
    const highMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'high').geometry)!;
    expect(highMesh.visible).toBe(true);

    // a 也隐藏 → 全桶零像素 → 整桶跳过
    pool.update('a', a.transform, false);
    expect(highMesh.visible).toBe(false);

    // a 恢复 → 整桶恢复提交
    pool.update('a', a.transform, true);
    expect(highMesh.visible).toBe(true);
    pool.dispose();
  });

  it('LOD 分布双口径：实例按展示表示、桶按提交口径（整桶隐藏计 culled）', async () => {
    const { provider } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('near', 'asset_tree', transformAt(0, 0, 0), 0)); // slot-0：恒 high 带
    pool.attach(makeModel('far', 'asset_tree', transformAt(0, 0, 0), 1)); // slot-1：推 low → culled
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.highToMid * 0.5), true); // near high
    await flush();
    pool.frameLod(cameraForM(t.lowToCulled * 1.1), true); // far 对象超远 culled（near 也超远！）
    await flush();
    // 两对象同位同机位——都 culled：桶全隐藏计 culled、实例计 culled
    let dist = pool.getLodDistribution();
    expect(dist.instances.culled).toBe(2);
    expect(dist.buckets.culled).toBe(2); // slot-0/slot-1 两 high 桶各自整桶跳过
    expect(dist.buckets.high).toBe(0);

    // 回近：near 桶与 far 桶都恢复 high 提交
    pool.frameLod(cameraForM(t.highToMid * 0.5), true);
    await flush();
    dist = pool.getLodDistribution();
    expect(dist.instances.high).toBe(2);
    expect(dist.buckets.high).toBe(2);
    expect(dist.buckets.culled).toBe(0);
    pool.dispose();
  });
});

// ── 总开关（off = 全 High + culled 旁路）───────────────────

describe('InstancedAssetPool LOD：总开关', () => {
  it('off：mid/low 实例迁回 high 桶、超远不裁剪（culled 旁路）；再开恢复调度', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    const near = makeModel('near', 'asset_tree', transformAt(0, 0, 0), 0);
    const midObj = makeModel('mid', 'asset_tree', transformAt(0, 0, 0), 1);
    pool.attach(near);
    pool.attach(midObj);
    await flush();
    const t = LOD_THRESHOLDS;

    // 先建立 mixed 状态：near=high、mid 对象在 mid 带（对象同位，逐个机位评估）
    pool.frameLod(cameraForM(t.highToMid * 0.5), true);
    await flush();
    pool.frameLod(cameraForM(t.highToMid * 1.1), true); // 两对象同带 → 都 mid（同机位同档）
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 0, 'mid').geometry)).toBeDefined();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 1, 'mid').geometry)).toBeDefined();

    // off + 超远机位：全部回 high、无零缩放
    pool.frameLod(cameraForM(t.lowToCulled * 1.5), false);
    await flush();
    const highMesh0 = meshHolding(pool, sourceOf(sources, 'asset_tree', 0, 'high').geometry)!;
    const highMesh1 = meshHolding(pool, sourceOf(sources, 'asset_tree', 1, 'high').geometry)!;
    expect(highMesh0.count).toBe(1);
    expect(highMesh1.count).toBe(1);
    const probe = new THREE.Matrix4();
    highMesh0.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(near.transform))).toBe(true); // culled 旁路：非零缩放

    // 再开（同超远机位）：重新 culled（zero 缩放）
    pool.frameLod(cameraForM(t.lowToCulled * 1.5), true);
    await flush();
    highMesh0.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(true);
    pool.dispose();
  });
});

// ── 单档资产（缺省 levels 语义）────────────────────────────

describe('InstancedAssetPool LOD：单档资产', () => {
  it('无 levels 声明：恒 high（无 mid/low 源请求）、超远仍 culled', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = new InstancedAssetPool({ provideSource: provider, resolvePoolKey: slotPoolKey });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0, 0, 0), 2));
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.midToLow * 1.1), true); // 名义 low 带 → 单档跳档回 high
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'high').geometry)).toBeDefined();
    expect(provider).toHaveBeenCalledTimes(1);

    pool.frameLod(cameraForM(t.lowToCulled * 1.1), true);
    await flush();
    const mesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'high').geometry)!;
    const probe = new THREE.Matrix4();
    mesh.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(true); // culled（非声明档位也可裁）
    pool.dispose();
  });
});
