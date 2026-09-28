/**
 * tests/runtime/InstancedAssetPool.editingPin.test.ts —— 放置链编辑态优先级 pin 层
 * 测试（T021.7，D41 §十二）。
 *
 * 覆盖（信号装配形态 = runtime/services/EditingPinHub：四类目标在组合根并集成
 * ReadonlySet<ID> 注入 frameLod 第三参——本文件用 fake pin 集直接测池行为；四信号
 * 源各自的并集语义由 EditingPinHub.test.ts 锁定）：
 * - 四类目标（selected / transforming / gizmo attach / focus 窗口）各自 pin 集均
 *   强制链内 high（canopy 起点沿既有硬切路径升档；与规范「编辑态优先级」逐类断言）；
 * - pin 期 Shadow full + Fade 1：迁入 high 桶后 cast/receive true（high 策略承载）、
 *   零 aFadeOut 写出（硬切位满呈现）；同场未 pin 的 canopy 对象保持 receive=false
 *   （pin 强制 full 只作用于被 pin 对象——canopy receive=false 策略不变更）；
 * - dither 中 pin：客座原子拆除 + 属主硬切上 high（决策改向路径）；
 * - 终态 cull 解除：被 pin 的超远对象恢复满矩阵并升 high；
 * - unpin 恢复正常调度：退出 pin 集下一帧按当帧距离重判（远机位回 canopy）；
 * - pin 每帧派生：多帧 pin 稳定无震荡（零多余源请求）；
 * - pin 与 LOD 总开关正交（off 恒 high 下 pin 同值幂等）；
 * - 空 pin 集 / 未知 id = 零行为变化；
 * - pin 期 Scene 数据零改动（ModelObject 深比较逐位不变——§十五.10 每帧派生态）。
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

// ── 构造工具（对齐 InstancedAssetPool.lod.test.ts 同源 harness）──────────

const SLOTS = 8;
const LEVEL_CENTER: Record<RuntimeRepresentation, THREE.Vector3> = {
  high: new THREE.Vector3(0, 3, 0),
  mid: new THREE.Vector3(0, 3, 0.5),
  low: new THREE.Vector3(0, 3, -0.5),
  canopy: new THREE.Vector3(0, 3, 0.25),
};
const SOURCE_CENTER = LEVEL_CENTER.high;
const LEVEL_RADIUS: Record<RuntimeRepresentation, number> = {
  high: 2,
  mid: 1.92,
  low: 1.96,
  canopy: 2.02,
};
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

function leveledSource(level: RuntimeRepresentation): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingSphere = new THREE.Sphere(LEVEL_CENTER[level].clone(), LEVEL_RADIUS[level]);
  return { geometry, material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) };
}

const slotPoolKey = (assetId: string, seed?: number): string =>
  `${assetId}:slot-${(seed ?? 0) % SLOTS}`;

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

function cameraForM(m: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(0, SOURCE_CENTER.y, -m * SOURCE_RADIUS);
  camera.lookAt(0, SOURCE_CENTER.y, 10);
  return camera;
}

/** canopy 带末（dither 完成线外——稳定落 canopy 桶的机位） */
function canopyStableM(): number {
  return LOD_THRESHOLDS.midToCanopy * (1 + TRANSITION_BAND_RATIO) * 1.01;
}

function cullTerminalM(): number {
  return LOD_THRESHOLDS.canopyToCulled * (1 + TRANSITION_BAND_RATIO) * 1.02;
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

function fadeOf(mesh: THREE.InstancedMesh, slot: number): number | undefined {
  const attr = mesh.geometry.getAttribute('aFadeOut') as THREE.InstancedBufferAttribute | undefined;
  if (!attr || !attr.isInstancedBufferAttribute) return undefined;
  return (attr.array as Float32Array)[slot];
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

/** 假想 canopy 池（representations ['high','mid','canopy']——真实 13 树种同链） */
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

/** 把对象驱到 canopy 稳定桶（band 末完成迁移；两帧 + flush 覆盖冷源排队） */
async function driveToCanopy(pool: InstancedAssetPool): Promise<void> {
  pool.frameLod(cameraForM(canopyStableM()), true);
  await flush();
  pool.frameLod(cameraForM(canopyStableM()), true);
  await flush();
}

// ── 四类目标强制高档（§十二编辑态优先级）─────────────────────

describe('InstancedAssetPool 编辑态 pin：四类目标强制高档', () => {
  it.each(['selected', 'transforming', 'gizmo-attach', 'focus-window'] as const)(
    'pin 集（%s 形态——单 id）内对象从 canopy 沿硬切路径升 high',
    async (category) => {
      const { provider, sources } = makeLeveledProvider();
      const pool = makeCanopyPool(provider);
      const id = `o-${category}`;
      const model = makeModel(id, 'asset_canopy_tree', transformAt(0, 0, 0), 1);
      pool.attach(model);
      await flush();

      await driveToCanopy(pool);
      const canopyMesh = meshHolding(
        pool,
        sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry,
      )!;
      expect(canopyMesh).toBeDefined(); // 前置：远机位下稳定 canopy
      const callsBeforePin = provider.mock.calls.length;

      // pin（每帧派生集——四类目标在组合根并集成同一形态注入）
      pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>([id]));
      await flush();
      const highMesh = meshHolding(
        pool,
        sourceOf(sources, 'asset_canopy_tree', 1, 'high').geometry,
      )!;
      expect(highMesh).toBeDefined(); // 强制 high（canopy→high 硬切）
      expect(highMesh.count).toBe(1);
      expect(
        meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
      ).toBeUndefined(); // canopy 桶拆空
      // 矩阵真值保持（升档不改实例数据）
      const probe = new THREE.Matrix4();
      highMesh.getMatrixAt(0, probe);
      expect(probe.equals(expectedMatrix(model.transform))).toBe(true);
      // 源请求零浪费：唯一新请求 = high 桶重建（若已拆）——canopy/mid 无重复请求
      expect(provider.mock.calls.length - callsBeforePin).toBeLessThanOrEqual(1);
      pool.dispose();
    },
  );

  it('四目标并集（选中 ∪ 变换中 ∪ gizmo ∪ focus）同帧全部升 high、未 pin 旁观者保持 canopy', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    const ids = ['o-selected', 'o-transforming', 'o-gizmo', 'o-focus'];
    ids.forEach((id, i) => pool.attach(makeModel(id, 'asset_canopy_tree', transformAt(i * 3, 0, 0), i)));
    const bystander = makeModel('o-bystander', 'asset_canopy_tree', transformAt(20, 0, 0), 7);
    pool.attach(bystander);
    await flush();

    await driveToCanopy(pool);
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(ids));
    await flush();

    // 四目标全部迁入各自槽的 high 桶；旁观者留 canopy
    for (let slot = 0; slot < 4; slot++) {
      expect(
        meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', slot, 'high').geometry),
      ).toBeDefined();
    }
    const bystanderCanopy = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 7, 'canopy').geometry,
    )!;
    expect(bystanderCanopy).toBeDefined();
    expect(bystanderCanopy.count).toBe(1); // 未 pin：保持 canopy 调度
    pool.dispose();
  });
});

// ── pin 期 Shadow full + Fade 1（§十二规范要求）──────────────

describe('InstancedAssetPool 编辑态 pin：Shadow full + Fade 满值', () => {
  it('pin 升 high 后 cast/receive true（high 策略承载 Shadow full）、零 aFadeOut 写出（满呈现）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    const model = makeModel('pin-me', 'asset_canopy_tree', transformAt(0, 0, 0), 2);
    pool.attach(model);
    await flush();

    await driveToCanopy(pool);
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(['pin-me']));
    await flush();

    const highMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 2, 'high').geometry,
    )!;
    // Shadow full：high 档策略 {cast, receive, depth:'full'} + renderable
    expect(highMesh.castShadow).toBe(true);
    expect(highMesh.receiveShadow).toBe(true);
    // Fade 1：硬切位不写 fade（无 aFadeOut 缓冲 = 满呈现——021.3 契约）
    expect(fadeOf(highMesh, 0)).toBeUndefined();
    // 分布口径：无过渡残留、caster 计入
    const dist = pool.getLodDistribution();
    expect(dist.transition.instances).toBe(0);
    expect(dist.shadowCasterInstances).toBe(1);
    expect(dist.instances.high).toBe(1);
    pool.dispose();
  });

  it('canopy receive=false 策略不变更：同场未 pin 对象保持 receiveShadow=false（pin 只作用于被 pin 对象）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('pinned', 'asset_canopy_tree', transformAt(0, 0, 0), 3));
    pool.attach(makeModel('far-away', 'asset_canopy_tree', transformAt(30, 0, 0), 4));
    await flush();

    await driveToCanopy(pool);
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(['pinned']));
    await flush();

    const canopyMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 4, 'canopy').geometry,
    )!;
    expect(canopyMesh.receiveShadow).toBe(false); // canopy 策略原样（未随 pin 全局翻转）
    expect(canopyMesh.visible).toBe(true); // 旁观者照常提交
    pool.dispose();
  });

  it('dither 中 pin：客座原子拆除 + 属主硬切上 high、过渡计数清零', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('mid-fade', 'asset_canopy_tree', transformAt(0, 0, 0), 5));
    await flush();
    const t = LOD_THRESHOLDS;

    // 到 mid（硬切）→ 进 canopy 带 f=0.25（dither 双表示）
    pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    const mQuarter = t.midToCanopy * (1 + TRANSITION_BAND_RATIO * 0.25);
    pool.frameLod(cameraForM(mQuarter), true);
    await flush();
    pool.frameLod(cameraForM(mQuarter), true);
    await flush();
    const canopyGuest = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 5, 'canopy').geometry,
    )!;
    expect(canopyGuest).toBeDefined(); // 前置：客座在场
    expect(pool.getLodDistribution().transition.instances).toBe(1);

    // pin：决策改向 high → 硬切完成（客座随迁原子拆除）
    pool.frameLod(cameraForM(mQuarter), true, new Set<ID>(['mid-fade']));
    await flush();
    const highMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 5, 'high').geometry,
    )!;
    expect(highMesh).toBeDefined();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 5, 'canopy').geometry),
    ).toBeUndefined(); // 客座桶拆空
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 5, 'mid').geometry),
    ).toBeUndefined();
    expect(fadeOf(highMesh, 0)).toBeUndefined(); // 满呈现（无退场残留）
    expect(pool.getLodDistribution().transition.instances).toBe(0);
    pool.dispose();
  });
});

// ── 终态 cull 解除 + unpin 恢复 ──────────────────────────────

describe('InstancedAssetPool 编辑态 pin：cull 解除与恢复调度', () => {
  it('超远终态 cull 的对象被 pin：解除零缩放、恢复真值矩阵并升 high', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    const model = makeModel('far-culled', 'asset_canopy_tree', transformAt(0, 0, 0), 6);
    pool.attach(model);
    await flush();

    // 到 canopy 稳定 → 推过终态线（fade-out 完 → culled 零缩放）
    await driveToCanopy(pool);
    pool.frameLod(cameraForM(cullTerminalM()), true);
    await flush();
    const canopyMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 6, 'canopy').geometry,
    )!;
    const probe = new THREE.Matrix4();
    canopyMesh.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(true); // 前置：终态

    // pin（超远机位不变）：强制 high → 解除裁剪 + 升档
    pool.frameLod(cameraForM(cullTerminalM()), true, new Set<ID>(['far-culled']));
    await flush();
    const highMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 6, 'high').geometry,
    )!;
    expect(highMesh).toBeDefined();
    highMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(model.transform))).toBe(true); // 真值恢复
    expect(highMesh.visible).toBe(true); // 整桶恢复提交
    pool.dispose();
  });

  it('unpin 恢复正常调度：退出 pin 集下一帧按当帧距离重判（远机位回 canopy）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('resume', 'asset_canopy_tree', transformAt(0, 0, 0), 1));
    await flush();

    await driveToCanopy(pool);
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(['resume']));
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'high').geometry),
    ).toBeDefined(); // 前置：pin 中 high

    // unpin（空集）+ 同远机位 → 恢复 canopy 调度（high→canopy 硬切）
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>());
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
    ).toBeDefined();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'high').geometry),
    ).toBeUndefined();
    pool.dispose();
  });

  it('pin 多帧稳定无震荡（连续 pin 帧保持 high、零多余源请求）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('stable', 'asset_canopy_tree', transformAt(0, 0, 0), 2));
    await flush();

    await driveToCanopy(pool);
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(['stable']));
    await flush();
    const callsAfterPin = provider.mock.calls.length;
    const meshesAfterPin = pool.root.children.length;

    for (let i = 0; i < 5; i++) {
      pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(['stable']));
      await flush();
      expect(
        meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 2, 'high').geometry),
      ).toBeDefined();
    }
    expect(provider.mock.calls.length).toBe(callsAfterPin); // 零源请求 churn
    expect(pool.root.children.length).toBe(meshesAfterPin); // 桶集稳定
    pool.dispose();
  });
});

// ── 正交性与零行为面 ────────────────────────────────────────

describe('InstancedAssetPool 编辑态 pin：正交性与零行为变化', () => {
  it('pin 与 LOD 总开关正交：off（恒 high）下 pin 同值幂等', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('ortho', 'asset_canopy_tree', transformAt(0, 0, 0), 4));
    await flush();

    await driveToCanopy(pool);
    pool.frameLod(cameraForM(cullTerminalM()), false, new Set<ID>(['ortho']));
    await flush();
    const highMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 4, 'high').geometry,
    )!;
    expect(highMesh).toBeDefined(); // off 语义恒 high（pin 覆盖同值）
    const probe = new THREE.Matrix4();
    highMesh.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(false); // culled 旁路
    pool.dispose();
  });

  it('空 pin 集 / 未知 id = 零行为变化（canopy 保持 canopy、无异常）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('keep', 'asset_canopy_tree', transformAt(0, 0, 0), 5));
    await flush();

    await driveToCanopy(pool);
    const callsBefore = provider.mock.calls.length;
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>());
    await flush();
    pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(['nonexistent-id']));
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 5, 'canopy').geometry),
    ).toBeDefined(); // 未 pin：调度不变
    expect(provider.mock.calls.length).toBe(callsBefore); // 零源请求
    pool.dispose();
  });

  it('pin 期 Scene 数据零改动：ModelObject 深比较逐位不变（§十五.10 每帧派生态）', async () => {
    const { provider } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    const model = makeModel('scene-clean', 'asset_canopy_tree', transformAt(1, 2, 3, 1.5), 6);
    const snapshot = JSON.stringify(model);
    pool.attach(model);
    await flush();

    await driveToCanopy(pool);
    for (let i = 0; i < 3; i++) {
      pool.frameLod(cameraForM(canopyStableM()), true, new Set<ID>(['scene-clean']));
      await flush();
    }
    expect(JSON.stringify(model)).toBe(snapshot); // 池只读业务数据（pin 全程零写入）
    // transform/visible/seed 逐字段直证（防 JSON 序列化盲区）
    expect(model.transform).toEqual(transformAt(1, 2, 3, 1.5));
    expect(model.visible).toBe(true);
    expect(model.asset.seed).toBe(6);
    pool.dispose();
  });

  it('未传 pinIds（旧调用形态）：行为与空集一致（向后兼容）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('legacy-call', 'asset_canopy_tree', transformAt(0, 0, 0), 7));
    await flush();

    await driveToCanopy(pool);
    pool.frameLod(cameraForM(canopyStableM()), true); // 第三参缺省
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 7, 'canopy').geometry),
    ).toBeDefined();
    pool.dispose();
  });
});
