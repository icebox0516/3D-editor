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
 * - 选档稳定基准（T006.6，D28.2）：三档真实差异化包围球下选档度量恒按 High 档派生
 *   基准——同一实例经不同换档历史到达任意当前档后，同机位选档结果一致（读数不随
 *   档位平移）；迁档后同机位零二次换档；临界推拉零 churn；单档资产基准 = 唯一源
 *   （行为不变，既有单档测试即回归面）。
 * - canopy 产出持有（T021.2）：假想声明 canopy 能力资产（representations
 *   ['high','mid','canopy']——真实 13 树种未声明、canopy 不可达是正确行为）在 canopy
 *   名义带的调度产出 canopy——021.7 接线前持有现状（不迁移、当档桶持续渲染、
 *   canopy 源零请求、迟滞参考已记录）。
 * - 分布 §十三升级位（T021.4）：transitionInstances（顶层镜像）、transitionTargets
 *   （目标表示口径——dither 期按 SelectionState.target 归档）、shadowCasterInstances
 *   （T021.5 策略驱动真值口径：caster = renderable ∧ isShadowCasterFor(桶表示,
 *   阴影表示)——中点切换后当侧不计、目标侧客座计；零提交 = 0）。放置链
 *   无密度抽稀消费面（T021.4 核实）——密度职责废止对本池零行为改动。
 *
 * T021.2 改写记档（原断言 → 新断言 → 为何等价）：
 * - getDeclaredLevels 直查 → getRepresentationCapability levels 投影（派生链
 *   [high,mid,low] 等价；representations 声明优先分支归 domain 组合测试覆盖）；
 * - T.midToLow → T.midToCanopy、T.lowToCulled → T.canopyToCulled（候选初值同值直承
 *   16/60——全部数值断言与档位断言不变；low 环 = canopy 名义带跳档承接，逐位等价）。
 * T021.5 改写记档（现值口径断言升级为策略驱动真值口径）：
 * - 「dither f=0.25 期 shadowCasterInstances = 2」→「= 1」：原口径 cast 统一 true
 *   双侧都计；策略口径下 canopy 客座阴影表示 = mid（中点前）≠ 桶表示 canopy → 不计
 *   ——恰一侧 caster 是 §5.4 中点切换的本意行为（非回归），同断言点的 mesh 级
 *   castShadow 翻转由 InstancedAssetPool.shadow.test.ts 锁定；
 * - 「零提交 = 0」「high 稳态 = 2」数值不变（稳态下真值口径 = 现值口径），仅注释
 *   从「现值口径」升级为「策略驱动真值口径」。
 * 边界：fake 源提供者按 (assetId × 槽 × level) 分源；几何包围手工钉死——选档输入
 *      确定性（High 球心 (0,3,0) = 机位定标口径；Mid/Low 球心沿视轴（Z）偏移 ±0.5
 *      ——档间球心差的放大应力：选档若误取当档球心，读数平移 ±0.25（m 口径）≫ 迟滞
 *      带 15%，判别机位即可捕捉；半径按档差异化 High 2 / Mid 1.92 / Low 1.96——真实
 *      档间轮廓差 2~5% 量级，High ≥ Mid/Low；镜像树木底原点几何）；评估器语义由
 *      006.1 测试锁定。
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

// ── 构造工具 ────────────────────────────────────────────────

/** 槽数（镜像夏栎 shapeFamily size=8——多 source × level 交叉桶的 source 维度） */
const SLOTS = 8;
/**
 * 三档源几何包围球球心：High (0,3,0)（机位定标口径 = 稳定基准球心）；Mid/Low 沿
 * 视轴（Z）偏移 ±0.5——档间球心差的放大应力（真实差 ~厘米级）：选档若误取当档
 * 球心，读数平移 ±0.25（m 口径）≫ 迟滞带 15%，档位结果必翻转（判别机位即可捕捉）。
 */
const LEVEL_CENTER: Record<RuntimeRepresentation, THREE.Vector3> = {
  high: new THREE.Vector3(0, 3, 0),
  mid: new THREE.Vector3(0, 3, 0.5),
  low: new THREE.Vector3(0, 3, -0.5),
  canopy: new THREE.Vector3(0, 3, 0.25), // T021.3 假想 canopy 源（真实资产 021.7 前不可达）
};
/** 相机定标基准球心（= High 档；机位与期望读数的折算口径） */
const SOURCE_CENTER = LEVEL_CENTER.high;
/**
 * 三档源几何包围球半径（真实差异化——档间轮廓差实测量级 2~5%）：High 基准 2.0、
 * Mid −4%、Low −2%，High ≥ Mid/Low（高档包络最全、低档壳卡不涨出 High）。T006.6
 * 起选档基准 = High 档派生的稳定 referenceSphere（Runtime 冻结缓存，不随迁档换源）
 * ——差异化半径是「基准不得随档平移」的应力输入：机位一律按 High 半径定标
 * （cameraForM），读数与条目当前档位无关。
 */
const LEVEL_RADIUS: Record<RuntimeRepresentation, number> = {
  high: 2,
  mid: 1.92,
  low: 1.96,
  canopy: 2.02, // 冠层代理包络 ≥ high（Union 剔除的判别应力位）
};
/** 相机定标基准半径（= High 档；cameraForM 的机位口径） */
const SOURCE_RADIUS = LEVEL_RADIUS.high;

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

/** (assetId × 槽 × 档) 源：几何身份即桶标签（按调用现场 key 缓存于 provider）；包围按档钉死 */
function leveledSource(level: RuntimeRepresentation): InstanceSource {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  geometry.boundingSphere = new THREE.Sphere(LEVEL_CENTER[level].clone(), LEVEL_RADIUS[level]);
  return { geometry, material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }) };
}

/** 槽路由池键（镜像 Renderer 注入形态：seed → slot-N sourceKey） */
const slotPoolKey = (assetId: string, seed?: number): string =>
  `${assetId}:slot-${(seed ?? 0) % SLOTS}`;

/** fake 源提供者：按 (assetId × 槽 × 档) 共享源（镜像缓存 sourceKey::level 去重语义） */
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
 * 目标度量 m 的机位（High 档基准定标；fov 90° → m = 视距 / R_high）：对象沿 +Z 排布，
 * 相机在 (0, 3, camZ) 沿 −Z 看；对象基准球心世界位 = (x, 3·scale, z) → 视距 =
 * z − camZ，camZ = −m × R_high。T006.6 稳定基准下选档恒按 High 口径折算——机位
 * 定标与条目当前档位无关（任意档下读数即目标 m）。
 */
function cameraForM(m: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, 1, 0.5, 100000);
  camera.position.set(0, SOURCE_CENTER.y, -m * SOURCE_RADIUS);
  camera.lookAt(0, SOURCE_CENTER.y, 10);
  return camera;
}

/** 三档距离环的目标 m（相对阈值构造；T021.2 新链字段名——候选值同 legacy 直承，对象
 *  z=0、scale=1 → m = (z − camZ)/R 恒定；low 环 = canopy 名义带经跳档承接） */
/** fade-out 退场带终态线（canopyToCulled × (1 + W)——T021.3 metric 过渡带） */
function cullTerminalM(): number {
  return LOD_THRESHOLDS.canopyToCulled * (1 + TRANSITION_BAND_RATIO) * 1.02;
}

function ringM(): { high: number; mid: number; low: number } {
  const t = LOD_THRESHOLDS;
  return {
    high: t.highToMid * 0.5,
    mid: t.highToMid + (t.midToCanopy - t.highToMid) * 0.5,
    low: t.midToCanopy + (t.canopyToCulled - t.midToCanopy) * 0.5,
  };
}

/** 同源几何判（fade 包装后 mesh.geometry ≠ 源几何——position 属性对象身份判） */
function holdsSource(
  mesh: THREE.InstancedMesh,
  geometry: THREE.BufferGeometry,
): boolean {
  return (
    mesh.geometry === geometry ||
    mesh.geometry.attributes.position === geometry.attributes.position
  );
}

/** 找持有指定源几何的渲染网格（桶按几何身份定位；T021.3 起 fade 包装安全） */
function meshHolding(
  pool: InstancedAssetPool,
  geometry: THREE.BufferGeometry,
): THREE.InstancedMesh | undefined {
  return pool.root.children.find(
    (c) => (c as THREE.InstancedMesh).isInstancedMesh && holdsSource(c as THREE.InstancedMesh, geometry),
  ) as THREE.InstancedMesh | undefined;
}

/** 桶网格的 aFadeOut 槽值（无缓冲 → undefined——硬切位不建缓冲的断言依据） */
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

function makeLodPool(provider: ReturnType<typeof makeLeveledProvider>['provider']) {
  return new InstancedAssetPool({
    provideSource: provider,
    resolvePoolKey: slotPoolKey,
    // T021.2 表示能力驱动：13 树种真实形态 = levels 声明（未声明 representations），
    // 派生链 [high, mid, low] 与旧 getDeclaredLevels 直查语义等价
    getRepresentationCapability: () => ({ levels: ['high', 'mid', 'low'] }),
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

    // 带内往返：机位按 High 基准定标（cameraForM——稳定基准下读数与当前档无关）
    // 使读数精确落带内；名义线 ×(1−band) ~ 名义线 振荡多次保持 mid
    const bandLow = t.highToMid * (1 - t.hysteresisBand);
    for (const frac of [0.05, 0.5, 0.95, 0.3, 0.8]) {
      const inBandM = bandLow + (t.highToMid - bandLow) * frac;
      pool.frameLod(cameraForM(inBandM), true);
      await flush();
      expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'mid').geometry)).toBeDefined();
    }
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade); // 零新源请求
    expect(pool.root.children.length).toBe(meshesAfterDowngrade); // 桶集零变化

    // 越升档线（High 口径读数 < 名义线 ×(1−band)）→ 单次回 high
    pool.frameLod(cameraForM(bandLow * 0.97), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'high').geometry)).toBeDefined();
    pool.dispose();
  });
});

// ── 选档稳定基准（T006.6：High 档派生，与当前渲染档位解耦）─────────

describe('InstancedAssetPool LOD：选档稳定基准（High 档派生）', () => {
  it('档间半径差（High ≥ Mid/Low，2~5% 量级）下临界推拉零 churn：读数名义线 ±~3% 来回跨线保持 mid', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('a', 'asset_tree', transformAt(0, 0, 0), 4));
    await flush();
    const t = LOD_THRESHOLDS;

    // 跨出名义线（High 口径读数 6.05）→ 立即降 mid；迁移后桶源换 mid 几何（半径 1.92
    // / 球心 +0.5z）——选档基准不跟随（恒 High 派生冻结球）
    pool.frameLod(cameraForM(t.highToMid + 0.05), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 4, 'mid').geometry)).toBeDefined();
    const callsAfterDowngrade = provider.mock.calls.length;
    const meshesAfterDowngrade = pool.root.children.length;

    // 同机位下一帧：读数仍 6.05（基准不随迁档换源——无平移）→ mid 带内保持，
    // 零二次换档、零源请求
    pool.frameLod(cameraForM(t.highToMid + 0.05), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 4, 'mid').geometry)).toBeDefined();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 4, 'high').geometry)).toBeUndefined();
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade);

    // 临界推拉：读数（High 口径）在名义线 ±~3%（≥ 档间半径差量级）来回跨线多次再
    // 返回——全部被迟滞吸收：保持 mid、桶集与源请求零 churn
    for (const reading of [6.2, 5.8, 6.15, 5.85, 6.1, 5.9]) {
      pool.frameLod(cameraForM(reading), true);
      await flush();
      expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 4, 'mid').geometry)).toBeDefined();
      expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 4, 'high').geometry)).toBeUndefined();
    }
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade); // 零源请求 churn
    expect(pool.root.children.length).toBe(meshesAfterDowngrade); // 桶集零变化

    // 决定性越过升档线（High 口径读数 < 名义线 ×(1−band)）：单次回 high
    pool.frameLod(cameraForM(t.highToMid * (1 - t.hysteresisBand) * 0.97), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 4, 'high').geometry)).toBeDefined();
    pool.dispose();
  });

  it('迁档后读数不随档位平移：High 口径越升档线机位即时回 high（Step 1「平移被吸收停留 mid」语义的反转点）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('a', 'asset_tree', transformAt(0, 0, 0), 6));
    await flush();
    const t = LOD_THRESHOLDS;

    // High 口径读数 6.2 → 立即降 mid（迁移后当档源 = mid 几何：半径 1.92 / 球心 +0.5z）
    pool.frameLod(cameraForM(t.highToMid + 0.2), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 6, 'mid').geometry)).toBeDefined();

    // 判别机位（High 口径读数 5.05 < 升档线 5.1）：稳定基准下即时升回 high。若选档
    // 仍取当前档输入，读数按 mid 半径 = 5.05 × 2/1.92 ≈ 5.26、按 mid 球心 ≈ 5.30，
    // 均 > 5.1 会停留 mid（Step 1 现状语义正是停留 mid）。回 high = 度量与当前档
    // 完全解耦的直接证据（半径/球心双口径泄漏一网打尽）
    pool.frameLod(cameraForM(t.highToMid * (1 - t.hysteresisBand) - 0.05), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 6, 'high').geometry)).toBeDefined();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 6, 'mid').geometry)).toBeUndefined();
    pool.dispose();
  });

  it('mid→low 迁档后同机位读数不变（无回缩）：low 桶同机位零二次换档、升档线内机位即时回 mid', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('a', 'asset_tree', transformAt(0, 0, 0), 2));
    await flush();
    const t = LOD_THRESHOLDS;

    // 读数 6.2 → mid；读数 16.05 → low（均 High 口径）
    pool.frameLod(cameraForM(t.highToMid + 0.2), true);
    await flush();
    pool.frameLod(cameraForM(t.midToCanopy + 0.05), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'low').geometry)).toBeDefined();
    const callsAfterDowngrade = provider.mock.calls.length;

    // 同机位下一帧：读数仍 16.05（稳定基准——旧语义此处按 low 半径回缩 ≈ 15.72 落回
    // mid 名义带）→ 名义仍 low 带，零二次换档、零源请求（「无回缩」的可观测面）
    pool.frameLod(cameraForM(t.midToCanopy + 0.05), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'low').geometry)).toBeDefined();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'mid').geometry)).toBeUndefined();
    expect(provider.mock.calls.length).toBe(callsAfterDowngrade);

    // low 档基准泄漏判别：High 口径读数 13.55 < low→mid 升档线 13.6 → 即时回 mid；
    // 若误按 low 半径（1.96）评估，读数 = 13.55 × 2/1.96 ≈ 13.83 > 13.6 会停留 low
    pool.frameLod(cameraForM(t.midToCanopy * (1 - t.hysteresisBand) - 0.05), true);
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'mid').geometry)).toBeDefined();
    pool.dispose();
  });

  it('同一实例经不同换档历史到达任意当前档后：同机位选档结果一致（度量与当前档解耦）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('a', 'asset_tree', transformAt(0, 0, 0), 6));
    await flush();
    const t = LOD_THRESHOLDS;

    // 到达器：把实例置于指定当前档（从任意档出发确定性收敛——名义线方向性 + 单边
    // 迟滞保证；跨步升档直达 resolved，无逐档爬）
    const reach = async (tier: RuntimeRepresentation): Promise<void> => {
      const cameraOf: Record<RuntimeRepresentation, THREE.PerspectiveCamera> = {
        high: cameraForM(t.highToMid * 0.5),
        mid: cameraForM(t.highToMid * 1.5),
        low: cameraForM(t.midToCanopy * 1.25),
        canopy: cameraForM(t.midToCanopy * 1.25), // 本测试资产无 canopy——占位不可达
      };
      pool.frameLod(cameraOf[tier], true);
      await flush();
    };
    /** 实例当前所在档（桶按几何身份反查——恰一桶持有实例） */
    const tierOf = (): RuntimeRepresentation | undefined => {
      for (const level of ['high', 'mid', 'low'] as const) {
        if (meshHolding(pool, sourceOf(sources, 'asset_tree', 6, level).geometry)) return level;
      }
      return undefined;
    };
    // 机位站（期望档只依赖机位）：high 带 / mid 带 / low→mid 升档线内侧（low 档半径
    // 泄漏判别位：若基准随档换源，low 档读数 ≈ 13.83 > 13.6 会停留 low，与其他起径
    // 的结果分裂）/ low 带
    const stations: { m: number; tier: RuntimeRepresentation }[] = [
      { m: t.highToMid * 0.5, tier: 'high' },
      { m: t.highToMid + 0.5, tier: 'mid' },
      { m: t.midToCanopy * (1 - t.hysteresisBand) - 0.05, tier: 'mid' },
      { m: t.midToCanopy * 1.25, tier: 'low' },
    ];
    for (const station of stations) {
      for (const start of ['high', 'mid', 'low'] as const) {
        await reach(start);
        pool.frameLod(cameraForM(station.m), true);
        await flush();
        expect(tierOf()).toBe(station.tier);
      }
    }
    pool.dispose();
  });
});

// ── culled（超远调度结果）──────────────────────────────────

describe('InstancedAssetPool LOD：culled', () => {
  it('Low 退场 fade：决策线到终态线间正常渲染 + aFadeOut 渐进；终态零缩放、回视经退场带自然回升', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    const model = makeModel('far', 'asset_tree', transformAt(0, 0, 0), 7); // slot-7（seed 池恒实例化）
    pool.attach(model);
    await flush();
    const t = LOD_THRESHOLDS;

    // 先经 low 带（换档迁移到 low 桶），再推过 cull 名义线 → fade-out 退场带内（T021.3：
    // Low→Culled 走 fade out——既有链 fade 机制验证载体）
    pool.frameLod(cameraForM(t.midToCanopy + (t.canopyToCulled - t.midToCanopy) * 0.5), true);
    await flush();
    pool.frameLod(cameraForM(t.canopyToCulled * 1.1), true);
    await flush();
    // 退场带内（f = (66−60)/(60×W)）：实例留在 low 桶、矩阵真值（非零缩放）、
    // aFadeOut = f（退场度——呈现度 1−f）
    const lowMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 7, 'low').geometry)!;
    const probe = new THREE.Matrix4();
    lowMesh.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(false); // 未终态
    expect(lowMesh.count).toBe(1);
    expect(fadeOf(lowMesh, 0)).toBeCloseTo(
      (t.canopyToCulled * 1.1 - t.canopyToCulled) /
        (t.canopyToCulled * TRANSITION_BAND_RATIO),
      6,
    );
    expect(lowMesh.visible).toBe(true); // 退场带内正常提交

    // 终态线（canopyToCulled × (1+W) 之上）：零缩放提交（真值保留）
    pool.frameLod(cameraForM(cullTerminalM()), true);
    await flush();
    lowMesh.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(true); // 槽零缩放
    expect(fadeOf(lowMesh, 0)).toBe(1); // 完全退场
    expect(lowMesh.count).toBe(1); // 实例仍登记（真值在 entry）

    // 回视：退场带内 fade 自然回升（无独立锁存）、名义线下侧满呈现、矩阵恢复真值
    pool.frameLod(cameraForM(t.canopyToCulled * 1.05), true);
    await flush();
    lowMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(model.transform))).toBe(true);
    expect(fadeOf(lowMesh, 0)).toBeCloseTo(
      (t.canopyToCulled * 1.05 - t.canopyToCulled) /
        (t.canopyToCulled * TRANSITION_BAND_RATIO),
      6,
    );
    pool.frameLod(cameraForM(t.midToCanopy + (t.canopyToCulled - t.midToCanopy) * 0.5), true);
    await flush();
    expect(fadeOf(lowMesh, 0)).toBe(0); // 迟滞线下侧恒满呈现（无跳变回退）

    // 单例路径（无 seed 池单实例退化普通 Mesh）：high 起点 cull = 硬切 → 瞬时 visible=false
    const single = makeModel('solo', 'asset_tree', transformAt(0, 0, 0)); // 无 seed
    pool.attach(single);
    await flush();
    const soloMesh = pool.root.children.find(
      (c) => (c as THREE.Mesh).isMesh && !(c as THREE.InstancedMesh).isInstancedMesh,
    ) as THREE.Mesh;
    expect(soloMesh).toBeDefined();
    pool.frameLod(cameraForM(t.canopyToCulled * 1.2), true);
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

    pool.frameLod(cameraForM(t.midToCanopy + (t.canopyToCulled - t.midToCanopy) * 0.5), true);
    await flush();
    const lowMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'low').geometry)!;
    expect(lowMesh.count).toBe(2);
    expect(lowMesh.visible).toBe(true); // 部分渲染中（都未 culled）

    // T021.3：决策线内退场带（1.1×名义线）→ fade 中不整桶跳过；终态线外 → 全 culled
    pool.frameLod(cameraForM(t.canopyToCulled * 1.1), true);
    await flush();
    expect(lowMesh.count).toBe(2);
    expect(lowMesh.visible).toBe(true); // 退场带内正常提交（fade 渐进，非零提交）
    pool.frameLod(cameraForM(cullTerminalM()), true);
    await flush();
    expect(lowMesh.count).toBe(2); // 实例仍登记（真值在 entry）
    expect(lowMesh.visible).toBe(false); // 全 culled → 整桶零提交（T006.4）

    // 回视：越过退场带 → 同帧恢复提交与真值矩阵
    pool.frameLod(cameraForM(t.midToCanopy + (t.canopyToCulled - t.midToCanopy) * 0.5), true);
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
    pool.frameLod(cameraForM(t.canopyToCulled * 1.1), true); // far 对象超远 culled（near 也超远！）
    await flush();
    // 两对象同位同机位——都 culled：桶全隐藏计 culled、实例计 culled
    let dist = pool.getLodDistribution();
    expect(dist.instances.culled).toBe(2);
    expect(dist.buckets.culled).toBe(2); // slot-0/slot-1 两 high 桶各自整桶跳过
    expect(dist.buckets.high).toBe(0);
    expect(dist.shadowCasterInstances).toBe(0); // T021.5：零提交 = 零阴影投射（策略驱动真值口径）

    // 回近：near 桶与 far 桶都恢复 high 提交
    pool.frameLod(cameraForM(t.highToMid * 0.5), true);
    await flush();
    dist = pool.getLodDistribution();
    expect(dist.instances.high).toBe(2);
    expect(dist.buckets.high).toBe(2);
    expect(dist.buckets.culled).toBe(0);
    expect(dist.shadowCasterInstances).toBe(2); // renderable ∧ 稳态阴影表示 = 桶表示（策略驱动真值口径——稳态下同现值）
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
    pool.frameLod(cameraForM(t.canopyToCulled * 1.5), false);
    await flush();
    const highMesh0 = meshHolding(pool, sourceOf(sources, 'asset_tree', 0, 'high').geometry)!;
    const highMesh1 = meshHolding(pool, sourceOf(sources, 'asset_tree', 1, 'high').geometry)!;
    expect(highMesh0.count).toBe(1);
    expect(highMesh1.count).toBe(1);
    const probe = new THREE.Matrix4();
    highMesh0.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(near.transform))).toBe(true); // culled 旁路：非零缩放

    // 再开（同超远机位）：重新 culled（zero 缩放）
    pool.frameLod(cameraForM(t.canopyToCulled * 1.5), true);
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

    pool.frameLod(cameraForM(t.midToCanopy * 1.1), true); // 名义 low 带 → 单档跳档回 high
    await flush();
    expect(meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'high').geometry)).toBeDefined();
    expect(provider).toHaveBeenCalledTimes(1);

    pool.frameLod(cameraForM(cullTerminalM()), true);
    await flush();
    const mesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 2, 'high').geometry)!;
    const probe = new THREE.Matrix4();
    mesh.getMatrixAt(0, probe);
    expect(probe.equals(new THREE.Matrix4().makeScale(0, 0, 0))).toBe(true); // culled（非声明档位也可裁）
    expect(fadeOf(mesh, 0)).toBeUndefined(); // 硬切 cull 零 fade 缓冲（GLB 同路径）
    pool.dispose();
  });
});

// ── canopy 目标位过渡执行（T021.3：假想声明资产——真实 canopy 表示 021.7 前不可达）──

describe('InstancedAssetPool LOD：canopy dither 执行（假想声明资产）', () => {
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

  it('降档 dither：canopy 带内双表示共存（属主留 mid + canopy 客座）、双侧 aFadeOut 互补、带末完成迁移', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1));
    await flush();
    const t = LOD_THRESHOLDS;

    // mid 带 → 硬切迁移 mid 桶
    pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    const midMesh = meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'mid').geometry)!;
    expect(midMesh.count).toBe(1);

    // canopy 带内（f = 0.25）：dither 双表示——canopy 客座桶建立（冷源：首帧排队，
    // flush 到达后下一帧建客座）
    const m1 = t.midToCanopy + t.midToCanopy * TRANSITION_BAND_RATIO * 0.25;
    pool.frameLod(cameraForM(m1), true);
    await flush();
    pool.frameLod(cameraForM(m1), true);
    await flush();
    const canopyMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry,
    )!;
    expect(canopyMesh).toBeDefined(); // 客座桶（canopy 源已请求——执行路径落代码）
    expect(canopyMesh.count).toBe(1);
    // 属主留 mid（未迁移）：mid 桶仍在、实例矩阵真值
    expect(midMesh.count).toBe(1);
    const probe = new THREE.Matrix4();
    midMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(makeModel('hypo', '', transformAt(0, 0, 0)).transform))).toBe(true);
    // 双侧 aFadeOut 互补：mid 退场度 = f、canopy 退场度 = 1 − f
    expect(fadeOf(midMesh, 0)).toBeCloseTo(0.25, 6);
    expect(fadeOf(canopyMesh, 0)).toBeCloseTo(0.75, 6);
    // 拾取：客座命中 → 同一业务 id（fade 期仍可拾取 §12）
    expect(
      pool.resolvePick({ object: canopyMesh, instanceId: 0 } as unknown as THREE.Intersection),
    ).toBe('hypo');
    // 分布计数面：过渡实例 1、双表示客座桶 1（DC 增量可观测）
    const dist = pool.getLodDistribution();
    expect(dist.transition.instances).toBe(1);
    expect(dist.transition.dualSubmitBuckets).toBe(1);
    expect(dist.instances.canopy).toBe(0); // 实例不双计：属主单计展示表示（current=mid）
    expect(dist.instances.mid).toBe(1);
    expect(dist.buckets.canopy).toBe(1); // 客座桶按 canopy 计（桶口径）
    // T021.4 §十三升级位：顶层镜像同值 + 目标表示口径 + 阴影投射现值口径
    expect(dist.transitionInstances).toBe(1); // 镜像位 = transition.instances（存储单点）
    expect(dist.transitionTargets.canopy).toBe(1); // 过渡中实例按 SelectionState.target 归档
    expect(dist.shadowCasterInstances).toBe(1); // T021.5 真值口径：恰一侧 caster——属主 mid（阴影表示 mid=桶表示）计；canopy 客座阴影表示 mid ≠ canopy 不计（中点前，§5.4）

    // 带末（f=1）：完成迁移——客座拆除、属主入 canopy 桶、mid 桶拆空
    const m2 = t.midToCanopy * (1 + TRANSITION_BAND_RATIO) * 1.01;
    pool.frameLod(cameraForM(m2), true);
    await flush();
    const canopyAfter = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry,
    )!;
    expect(canopyAfter.count).toBe(1); // 属主在 canopy 桶
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'mid').geometry),
    ).toBeUndefined(); // mid 桶拆空
    expect(fadeOf(canopyAfter, 0)).toBe(0); // 完成后满呈现
    const distAfter = pool.getLodDistribution();
    expect(distAfter.transition.instances).toBe(0);
    expect(distAfter.transition.dualSubmitBuckets).toBe(0);
    expect(distAfter.instances.canopy).toBe(1);
    expect(distAfter.instances.mid).toBe(0);
    pool.dispose();
  });

  it('带内回退：f 回落至 0 → 客座拆除、属主留 mid 满呈现（迟滞带内无迁移 churn）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1));
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    // 进带（f=0.5）建客座，再回退名义线下侧（f=0）
    const half = t.midToCanopy * (1 + TRANSITION_BAND_RATIO * 0.5);
    pool.frameLod(cameraForM(half), true);
    await flush();
    pool.frameLod(cameraForM(half), true);
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
    ).toBeDefined();
    const callsInTransition = provider.mock.calls.length;

    pool.frameLod(cameraForM(t.midToCanopy * 0.99), true);
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
    ).toBeUndefined(); // 客座拆除（f=0）
    const midMesh = meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'mid').geometry)!;
    expect(fadeOf(midMesh, 0)).toBe(0); // 满呈现
    expect(midMesh.count).toBe(1);
    expect(provider.mock.calls.length).toBe(callsInTransition); // 零新源请求（无 churn）
    pool.dispose();
  });

  it('升档 dither：canopy 承诺后靠近——迟滞线下客座（mid 侧）渐入、深入完成迁回 mid', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1));
    await flush();
    const t = LOD_THRESHOLDS;

    // 到达 canopy 承诺（带末完成迁移；canopy 源冷：首帧排队 → flush 到达 → 次帧完成）
    pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    const bandEnd = t.midToCanopy * (1 + TRANSITION_BAND_RATIO) * 1.01;
    pool.frameLod(cameraForM(bandEnd), true);
    await flush();
    pool.frameLod(cameraForM(bandEnd), true);
    await flush();
    const canopyMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry,
    )!;
    expect(canopyMesh.count).toBe(1);

    // 靠近过迟滞线（m < midToCanopy×(1−band)）：升档 dither——mid 客座建立、f = (线−m)/带宽
    const upline = t.midToCanopy * (1 - t.hysteresisBand);
    const m = upline - t.midToCanopy * TRANSITION_BAND_RATIO * 0.5;
    pool.frameLod(cameraForM(m), true);
    await flush();
    pool.frameLod(cameraForM(m), true);
    await flush();
    const midGuest = meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'mid').geometry)!;
    expect(midGuest).toBeDefined(); // mid 客座（目标桶）
    expect(fadeOf(canopyMesh, 0)).toBeCloseTo(0.5, 6); // canopy 退场度 = f
    expect(fadeOf(midGuest, 0)).toBeCloseTo(0.5, 6); // mid 退场度 = 1 − f
    // canopy 属主未迁移
    expect(canopyMesh.count).toBe(1);

    // 深入（m 低于带底）：完成迁回 mid、canopy 桶拆空
    const deep = upline - t.midToCanopy * TRANSITION_BAND_RATIO * 1.5;
    pool.frameLod(cameraForM(deep), true);
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'mid').geometry),
    ).toBeDefined();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
    ).toBeUndefined();
    pool.dispose();
  });

  it('总开关 off：dither 双表示收敛拆除（客座清空、属主硬切回 high）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    pool.attach(makeModel('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1));
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    const half = t.midToCanopy * (1 + TRANSITION_BAND_RATIO * 0.5);
    pool.frameLod(cameraForM(half), true);
    await flush();
    pool.frameLod(cameraForM(half), true);
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
    ).toBeDefined();

    // off：同机位 → 决策恒 high → 硬切完成 → 客座拆除、属主迁回 high
    pool.frameLod(cameraForM(half), false);
    await flush();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'high').geometry),
    ).toBeDefined();
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
    ).toBeUndefined();
    expect(pool.getLodDistribution().transition.dualSubmitBuckets).toBe(0);
    pool.dispose();
  });

  it('拖拽中镜像：dither 期更新属主变换 → 客座矩阵所见即所得；detach 属主 → 客座随拆', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeCanopyPool(provider);
    const model = makeModel('hypo', 'asset_canopy_tree', transformAt(0, 0, 0), 1);
    pool.attach(model);
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.highToMid * 1.1), true);
    await flush();
    const half = t.midToCanopy * (1 + TRANSITION_BAND_RATIO * 0.5);
    pool.frameLod(cameraForM(half), true);
    await flush();
    pool.frameLod(cameraForM(half), true);
    await flush();
    const canopyMesh = meshHolding(
      pool,
      sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry,
    )!;

    // 过渡中拖拽：新变换镜像到客座槽
    const moved = transformAt(3, 1, 2, 1.5);
    pool.update('hypo', moved);
    const probe = new THREE.Matrix4();
    canopyMesh.getMatrixAt(0, probe);
    expect(probe.equals(expectedMatrix(moved))).toBe(true);

    // 过渡中删除属主：客座随拆（无残留、无孤儿桶）
    pool.detach('hypo');
    expect(
      meshHolding(pool, sourceOf(sources, 'asset_canopy_tree', 1, 'canopy').geometry),
    ).toBeUndefined();
    pool.dispose();
  });

  it('硬切位不写 fade（High↔Mid / Mid↔Low 全程无 aFadeOut 缓冲——无消费者不写占位数据）', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    pool.attach(makeModel('a', 'asset_tree', transformAt(0, 0, 0), 5));
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.highToMid * 1.1), true); // high → mid（硬切）
    await flush();
    pool.frameLod(cameraForM(t.midToCanopy * 1.1), true); // mid → low（硬切）
    await flush();
    for (const level of ['high', 'mid', 'low'] as const) {
      const mesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 5, level).geometry);
      if (mesh) expect(fadeOf(mesh, 0)).toBeUndefined(); // 无缓冲（硬切位零 fade）
    }
    pool.dispose();
  });

  it('逐实例 fade 独立（per-object 粒度，§5.3）：同桶两实例各处不同过渡进度', async () => {
    const { provider, sources } = makeLeveledProvider();
    const pool = makeLodPool(provider);
    // 两对象同槽（合桶）、不同 z → 同机位下不同 m（远者退场更深）
    const near = makeModel('near', 'asset_tree', transformAt(0, 0, 0), 5);
    pool.attach(near);
    const far = makeModel('far', 'asset_tree', transformAt(0, 0, 8), 5 + SLOTS);
    pool.attach(far);
    await flush();
    const t = LOD_THRESHOLDS;

    pool.frameLod(cameraForM(t.midToCanopy * 1.02), true); // 双双硬切到 low 桶
    await flush();
    // 推到退场带内：near 读数 = 63（fade 0.2）、far 读数 = 63 + 8/2 = 67（fade 0.47）
    pool.frameLod(cameraForM(t.canopyToCulled * 1.05), true);
    await flush();
    const lowMesh = meshHolding(pool, sourceOf(sources, 'asset_tree', 5, 'low').geometry)!;
    const nearFade = fadeOf(lowMesh, 0); // slot 0 = near（attach 序）
    const farFade = fadeOf(lowMesh, 1); // slot 1 = far
    expect(nearFade).toBeCloseTo(
      (t.canopyToCulled * 1.05 - t.canopyToCulled) / (t.canopyToCulled * TRANSITION_BAND_RATIO),
      6,
    );
    expect(farFade).toBeCloseTo(
      (t.canopyToCulled * 1.05 + 8 / SOURCE_RADIUS - t.canopyToCulled) /
        (t.canopyToCulled * TRANSITION_BAND_RATIO),
      6,
    );
    expect(nearFade!).toBeLessThan(farFade!); // 同桶两槽值不同——逐实例 fade 独立
    pool.dispose();
  });
});
