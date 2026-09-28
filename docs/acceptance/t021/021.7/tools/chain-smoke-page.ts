/**
 * T021.7 canopy 全链调度冒烟页（真实调度路径取证 harness）。
 *
 * 与 021.3 fade-smoke（纯材质面、手工摆 fade 值）不同：本页走 **真实调度链** ——
 * AssetRegistry（collectProceduralAssetMetas 真注册表）→ AssetLoader + ProceduralSourceCache
 * + CanopySourceCache → AssetSourceRouter → RepresentationSourceRouter 门面 →
 * InstancedAssetPool（provideSource / resolvePoolKey / getRepresentationCapability 三注入
 * 与 src/runtime/Renderer.ts 装配形态逐行对齐）。编辑态 pin 走真实 EditingPinHub
 * （bootstrap 同款活信号源：selected 集闭包 live 读）。
 *
 * 场景：3 树种（celtis / camphor / tree3a）各 1 实例（不同对象 seed → 不同槽），
 * X 轴 16m 间距；环境域 = T018 day 真实链（照抄 021.3 / 021.6）；相机 fov 50 /
 * 1920×1080 DPR1 / preserveDrawingBuffer。选档度量 m = (d/r)·tan(fov/2)，r = High 档
 * 源派生稳定基准球半径（与池内 LodReferenceSphereCache 冻结值同源同值——预热经同一
 * 缓存条目）。径向单调拉远驱动 frameLod（真状态机逐帧步进），每帧截图 + 分布统计。
 *
 * window.__chainSmoke 驱动面：
 *  - ready（init 完成：源预热 + 全池 prime 后置 true）
 *  - treeInfo()：静态装配信息（树种 / seed / 槽 / 基准球半径 / 表示链）
 *  - step(m, label)：移动相机到 m（celtis 口径）→ frameLod(camera, true, hub.getIds())
 *    → 微任务落定（源 .then 回调：建桶 / 迟到迁移——真实链路发生在下一帧前）→ 渲染
 *    → 返回 { 分布统计 / drawCalls / triangles / programs / 绿色覆盖率 / 非背景覆盖率 /
 *    逐树 m 读数 / console 计数 }
 *  - setSelected(ids) / clearSelected()：编辑态 pin 活源数据（hub 每帧 live 读）
 *  - distribution() / stats()：只读快照（不步进）
 *  - consoleDump()：errors / warnings 全文
 */
import * as THREE from 'three';
import { InstancedAssetPool } from '/src/runtime/instancing/InstancedAssetPool';
import { AssetLoader } from '/src/runtime/loaders/AssetLoader';
import { AssetSourceRouter } from '/src/runtime/loaders/AssetSourceRouter';
import { RepresentationSourceRouter } from '/src/runtime/loaders/RepresentationSourceRouter';
import { ProceduralSourceCache } from '/src/runtime/procedural/ProceduralSourceCache';
import { CanopySourceCache } from '/src/runtime/procedural/CanopySourceCache';
import { collectProceduralAssetMetas } from '/src/runtime/procedural/routes';
import { AssetRegistry } from '/src/registries/AssetRegistry';
import { EditingPinHub } from '/src/runtime/services/EditingPinHub';
import { sourceKeyOf, shapeSlotOf } from '/src/domain/assets';
import type { ModelObject } from '/src/domain/assets';
import type { RepresentationCapability, RuntimeRepresentation } from '/src/domain/lod/representation';
import { SkyCore } from '/src/runtime/environment/skyCore';
import { PmremEnvironment, LazyPmremBackend } from '/src/runtime/environment/pmremEnvironment';
import { environmentPresetOf, skyAtmosphereOfPreset } from '/src/runtime/environment/environmentPresets';
import { LEGACY_SUN_DISTANCE } from '/src/runtime/environment/sunDirection';

const WIDTH = 1920;
const HEIGHT = 1080;
const FOV_DEG = 50;
const TAN_HALF_FOV = Math.tan(((FOV_DEG / 2) * Math.PI) / 180);
/** 取景射线（球坐标方向，021.3 / 021.6 同角：azimuth 35° / elevation 8°） */
const AZ = (35 * Math.PI) / 180;
const EL = (8 * Math.PI) / 180;
const DIR = new THREE.Vector3(
  Math.cos(EL) * Math.sin(AZ),
  Math.sin(EL),
  Math.cos(EL) * Math.cos(AZ),
);

/** 3 树种 × 不同对象 seed（不同槽）：celtis 居中（m 读数口径），camphor / 3a 两侧 */
const TREE_DEFS = [
  { id: 'model_celtis', assetId: 'asset_tree_celtis', seed: 101, x: 0, label: 'celtis' },
  { id: 'model_camphor', assetId: 'asset_tree_camphor', seed: 202, x: 16, label: 'camphor' },
  { id: 'model_3a', assetId: 'asset_tree_3a', seed: 303, x: -16, label: '3a' },
] as const;

interface TreeRuntime {
  readonly def: (typeof TREE_DEFS)[number];
  /** High 档源派生稳定基准球（SelectionBounds——与池内冻结值同源） */
  center: THREE.Vector3;
  radius: number;
  slot: number;
  chain: readonly RuntimeRepresentation[];
}

function main(): void {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9db8d2'); // 纯色天空底（021.3 / 021.6 同款——不经 displaySky 显示链）

  // ── T018 环境域（day 预设真实链——照抄 021.3 fade-smoke / 021.6 canopy-baseline）──
  const preset = environmentPresetOf('day');
  const sky = new SkyCore(skyAtmosphereOfPreset(preset), {
    elevationDeg: preset.sun.elevationDeg,
    azimuthDeg: preset.sun.azimuthDeg,
  });
  const pmrem = new PmremEnvironment({
    scene,
    bakeScene: sky.bakeScene,
    backend: new LazyPmremBackend((): THREE.PMREMGenerator => new THREE.PMREMGenerator(renderer)),
  });
  pmrem.bake();
  scene.environmentIntensity = preset.iblIntensity;

  const sun = new THREE.DirectionalLight(preset.sun.color, preset.sun.intensity);
  const sd = sky.sunDirection;
  sun.position.set(sd.x * LEGACY_SUN_DISTANCE, sd.y * LEGACY_SUN_DISTANCE, sd.z * LEGACY_SUN_DISTANCE);
  sun.target.position.set(0, 0, 0);
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 8000),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(preset.groundColor), roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(FOV_DEG, WIDTH / HEIGHT, 1, 10000);

  // ── 真实调度链装配（形态对照 src/runtime/Renderer.ts L449-L511 逐行同构）──
  const assets = new AssetRegistry();
  for (const meta of collectProceduralAssetMetas()) assets.register({ kind: 'procedural', asset: meta });
  const loader = new AssetLoader(assets); // GLB 端（本页 3 树全程序化——loader 不被调用，装配完整性保留）
  const proceduralCache = new ProceduralSourceCache();
  const canopyCache = new CanopySourceCache();
  const assetRouter = new AssetSourceRouter({ assets, loader, procedural: proceduralCache });
  const representationRouter = new RepresentationSourceRouter({
    assetRouter,
    providers: { canopy: (assetId, seed) => canopyCache.load(assetId, seed) },
  });
  const representationCapabilityOf = (assetId: string): RepresentationCapability | undefined => {
    const descriptor = assets.get(assetId);
    if (!descriptor || descriptor.kind !== 'procedural') return undefined;
    const meta = descriptor.asset;
    return {
      representations: meta.representations,
      levels: meta.levels && meta.levels.length > 0 ? meta.levels.map((item) => item.id) : undefined,
    };
  };
  const pool = new InstancedAssetPool({
    provideSource: (assetId, seed, representation) =>
      representationRouter.provideRepresentationSource(assetId, seed, representation),
    resolvePoolKey: (assetId, seed) => {
      const descriptor = assets.get(assetId);
      if (!descriptor || descriptor.kind !== 'procedural') return assetId;
      const family = descriptor.asset.shapeFamily;
      return family ? sourceKeyOf(assetId, shapeSlotOf(seed ?? 0, family.size)) : assetId;
    },
    getRepresentationCapability: representationCapabilityOf,
  });
  scene.add(pool.root);

  // ── 编辑态 pin（真实 EditingPinHub + bootstrap 同款活信号源：selected 集 live 读）──
  const editingPins = new EditingPinHub();
  const selected = new Set<string>();
  editingPins.addSource((into) => {
    for (const id of selected) into.add(id);
  });

  // ── 3 树 attach（ModelObject 纯数据 → 池内 high 桶起步）──
  const trees: TreeRuntime[] = [];
  for (const def of TREE_DEFS) {
    const descriptor = assets.get(def.assetId);
    if (!descriptor || descriptor.kind !== 'procedural') throw new Error(`树种未注册: ${def.assetId}`);
    const family = descriptor.asset.shapeFamily!;
    const slot = shapeSlotOf(def.seed, family.size);
    const obj: ModelObject = {
      id: def.id,
      type: 'model',
      name: def.label,
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: {
        position: { x: def.x, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      properties: {},
      asset: { assetId: def.assetId, seed: def.seed },
    };
    pool.attach(obj);
    trees.push({
      def,
      center: new THREE.Vector3(def.x, 0, 0),
      radius: 1,
      slot,
      chain: descriptor.asset.representations ?? [],
    });
  }

  // ── 像素探针（2D canvas 直读——preserveDrawingBuffer；021.3 同款式）──
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = WIDTH;
  probeCanvas.height = HEIGHT;
  const pctx = probeCanvas.getContext('2d', { willReadFrequently: true })!;
  /** 背景参考色（首帧渲染后从帧内实测采样：顶中 = 天空底色，左下 = 地面——懒采样） */
  let skyRef: [number, number, number] = [0, 0, 0];
  let groundRef: [number, number, number] = [0, 0, 0];

  /** 全帧双探针：绿色覆盖率（021.6 同式）+ 非背景覆盖率（树体 = 逐像素与天空/地面参考色距离均 > 30） */
  const probe = (): { greenCoverage: number; nonBgCoverage: number } => {
    pctx.clearRect(0, 0, WIDTH, HEIGHT);
    pctx.drawImage(renderer.domElement, 0, 0);
    const img = pctx.getImageData(0, 0, WIDTH, HEIGHT);
    if (skyRef[0] === 0 && skyRef[1] === 0 && skyRef[2] === 0) {
      const pxAt = (x: number, y: number): [number, number, number] => {
        const i = (y * WIDTH + x) * 4;
        return [img.data[i]!, img.data[i + 1]!, img.data[i + 2]!];
      };
      skyRef = pxAt(WIDTH >> 1, 4);
      groundRef = pxAt(4, HEIGHT - 4);
    }
    const d = img.data;
    let green = 0;
    let nonBg = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i]!, g = d[i + 1]!, b = d[i + 2]!;
      if (g > r * 1.08 && g > b * 1.08 && g > 40) green++;
      const skyDist = Math.abs(r - skyRef[0]) + Math.abs(g - skyRef[1]) + Math.abs(b - skyRef[2]);
      const groundDist = Math.abs(r - groundRef[0]) + Math.abs(g - groundRef[1]) + Math.abs(b - groundRef[2]);
      if (skyDist > 30 && groundDist > 30) nonBg++;
    }
    const total = WIDTH * HEIGHT;
    return {
      greenCoverage: +(green / total).toFixed(6),
      nonBgCoverage: +(nonBg / total).toFixed(6),
    };
  };

  const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

  /** 渲染账目 + console 计数 */
  const stats = (): unknown => ({
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    programs: renderer.info.programs?.length ?? 0,
    errors: (window as unknown as Record<string, unknown>).__CHAIN_ERRORS.length,
    warnings: (window as unknown as Record<string, unknown>).__CHAIN_WARNINGS.length,
  });

  let frameIndex = 0;

  /** 一步 = 移动相机（celtis 口径 m）→ frameLod（真状态机步进一帧）→ 微任务落定 → 渲染 → 快照 */
  const step = async (m: number, label: string): Promise<unknown> => {
    frameIndex += 1;
    const anchor = trees[0]!;
    const d = (m * anchor.radius) / TAN_HALF_FOV;
    camera.position.set(
      anchor.center.x + DIR.x * d,
      anchor.center.y + DIR.y * d,
      anchor.center.z + DIR.z * d,
    );
    camera.lookAt(anchor.center.x, anchor.center.y, anchor.center.z);
    const pins = editingPins.getIds();
    pool.frameLod(camera, true, pins);
    await settle(); // 源 .then 回调（ensurePool 建桶 / applyPendingMigrations 迟到迁移）渲染前落定
    renderer.render(scene, camera);
    const perTreeM: Record<string, number> = {};
    const perTreeD: Record<string, number> = {};
    for (const tree of trees) {
      const di = camera.position.distanceTo(tree.center);
      perTreeD[tree.def.label] = +di.toFixed(1);
      perTreeM[tree.def.label] = +((di / tree.radius) * TAN_HALF_FOV).toFixed(3);
    }
    return {
      frame: frameIndex,
      label,
      mTarget: m,
      distance: { ...perTreeD },
      mPerTree: { ...perTreeM },
      pins: [...pins],
      distribution: pool.getLodDistribution(),
      render: stats(),
      pixels: probe(),
    };
  };

  // ── init：源预热（9 源 = 3 树 × high/mid/canopy，经门面→缓存同条目）+ 全池 prime ──
  const init = async (): Promise<void> => {
    const warm: Promise<void>[] = [];
    for (const tree of trees) {
      warm.push(
        representationRouter
          .provideRepresentationSource(tree.def.assetId, tree.def.seed, 'high')
          .then((source) => {
            if (!source.geometry.boundingSphere) source.geometry.computeBoundingSphere();
            const sphere = source.geometry.boundingSphere!;
            tree.center = new THREE.Vector3(
              tree.def.x + sphere.center.x,
              sphere.center.y,
              sphere.center.z,
            );
            tree.radius = sphere.radius;
          }),
      );
      warm.push(
        representationRouter.provideRepresentationSource(tree.def.assetId, tree.def.seed, 'mid').then(() => undefined),
      );
      warm.push(
        representationRouter.provideRepresentationSource(tree.def.assetId, tree.def.seed, 'canopy').then(() => undefined),
      );
    }
    await Promise.all(warm);
    // high 桶建网格（attach 后源到达）
    for (let i = 0; i < 100 && pool.getLodDistribution().buckets.high < trees.length; i++) await settle();
    // prime：依次触发 mid / canopy 池创建与迟到迁移语义，再回 high 稳态——证据序列起点干净
    await step(8, 'prime-mid'); // high→mid 硬切（mid 池冷建 → settle 迁移）
    await step(22, 'prime-canopy-queue'); // mid→canopy dither（canopy 池冷建 → 排队）
    await step(22, 'prime-canopy-commit'); // canopy 源就绪 → f≥1 完成迁移
    await step(3, 'prime-back-high'); // canopy→high 硬切回稳态
  };

  const w = (window as unknown as Record<string, unknown>).__chainSmoke = {
    ready: false,
    // 调试取证面（诊断用：TS private 仅编译期——运行时直读池内部核对网格/几何状态）
    __debug: { pool, camera, scene, renderer, trees },
    camera: { fovDeg: FOV_DEG, width: WIDTH, height: HEIGHT, azimuthDeg: 35, elevationDeg: 8 },
    treeInfo: (): unknown =>
      trees.map((tree) => ({
        id: tree.def.id,
        assetId: tree.def.assetId,
        seed: tree.def.seed,
        slot: tree.slot,
        positionX: tree.def.x,
        referenceSphere: { radius: +tree.radius.toFixed(3), centerY: +tree.center.y.toFixed(3) },
        chain: [...tree.chain],
      })),
    thresholds: { highToMid: 6, midToCanopy: 16, canopyToCulled: 60, hysteresisBand: 0.15, transitionBandRatio: 0.25 },
    setSelected: (ids: string[]): void => {
      selected.clear();
      for (const id of ids) selected.add(id);
    },
    clearSelected: (): void => {
      selected.clear();
    },
    step,
    distribution: (): unknown => pool.getLodDistribution(),
    stats,
    consoleDump: (): unknown => ({
      errors: (window as unknown as Record<string, unknown>).__CHAIN_ERRORS,
      warnings: (window as unknown as Record<string, unknown>).__CHAIN_WARNINGS,
    }),
  };

  init()
    .then(() => {
      w.ready = true;
    })
    .catch((err: unknown) => {
      (window as unknown as Record<string, unknown>).__CHAIN_ERRORS.push(`init failed: ${String(err)}`);
      w.ready = true; // 让自动化能读到错误清单
      w.initFailed = true;
    });
}

main();
