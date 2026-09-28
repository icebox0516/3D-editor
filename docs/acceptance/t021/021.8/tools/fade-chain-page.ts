/**
 * T021.8 Phase C ③ Fade 专项 harness——chain 页（§十四：六运动模式 × 四判据）。
 *
 * 装配 = Phase A calib-chain 同款「真实调度路径」逐行同构（AssetRegistry 真注册表 →
 * 三缓存 → AssetSourceRouter → RepresentationSourceRouter → InstancedAssetPool 三注入
 * + 真实 EditingPinHub），树种 { celtis, camphor, salix }（三种冠形），零手工摆材质。
 * 本页新增（Fade 专项需要，calib-chain 没有）：
 *  1. FOV 驱动（setFov——m=(d/r)·tan(fov/2) 随 fov 平移，FOV 改变模式的选档输入）；
 *  2. 滚动相邻帧像素 diff（只保留上一帧像素——44-110 步序列不驻留全量帧）；
 *  3. 渲染器 memory 账目（geometries/textures/programs——无重复重建判据）；
 *  4. 桶结构 digest（pool 键集 + 条目数 + 客座数——teardown churn 判据）；
 *  5. runMode(name) 六运动模式预编程：远离/靠近/往返/快速拖拽/慢速移动/FOV 改变，
 *     每步记录 { m, 逐树 current/target/t/fade, transitionInstances, dualSubmitBuckets,
 *     DC, tri, memory, poolDigest, 相邻帧 diffPct, greenPct }。
 * 环境域照抄先例：T018 day 真实链；uTime 恒 0 静态帧；无 shadow pass（四面同步的
 * shadow/depth/picking 面归产品页抽查——本页只承状态机 + main render 像素面）。
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
import { LOD_THRESHOLDS } from '/src/domain/lod/lodPolicy';
import { TRANSITION_BAND_RATIO } from '/src/domain/lod/transition';
import { SkyCore } from '/src/runtime/environment/skyCore';
import { PmremEnvironment, LazyPmremBackend } from '/src/runtime/environment/pmremEnvironment';
import { environmentPresetOf, skyAtmosphereOfPreset } from '/src/runtime/environment/environmentPresets';
import { LEGACY_SUN_DISTANCE } from '/src/runtime/environment/sunDirection';

const WIDTH = 1920;
const HEIGHT = 1080;
const FOV_DEG = 50;
let tanHalfFov = Math.tan(((FOV_DEG / 2) * Math.PI) / 180);
const AZ = (35 * Math.PI) / 180;
const EL = (8 * Math.PI) / 180;
const DIR = new THREE.Vector3(
  Math.cos(EL) * Math.sin(AZ),
  Math.sin(EL),
  Math.cos(EL) * Math.cos(AZ),
);

const TREE_DEFS = [
  { id: 'model_celtis', assetId: 'asset_tree_celtis', seed: 101, x: 0, label: 'celtis' },
  { id: 'model_camphor', assetId: 'asset_tree_camphor', seed: 202, x: 16, label: 'camphor' },
  { id: 'model_salix', assetId: 'asset_tree_salix', seed: 303, x: -16, label: 'salix' },
] as const;

interface TreeRuntime {
  readonly def: (typeof TREE_DEFS)[number];
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
  scene.background = new THREE.Color('#9db8d2');

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

  // ── 真实调度链装配（calib-chain 逐行同款）──
  const assets = new AssetRegistry();
  for (const meta of collectProceduralAssetMetas()) assets.register({ kind: 'procedural', asset: meta });
  const loader = new AssetLoader(assets);
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

  const editingPins = new EditingPinHub();
  const selected = new Set<string>();
  editingPins.addSource((into) => {
    for (const id of selected) into.add(id);
  });

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

  // ── 像素探针 + 滚动相邻帧 diff ──
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = WIDTH;
  probeCanvas.height = HEIGHT;
  const pctx = probeCanvas.getContext('2d', { willReadFrequently: true })!;
  let skyRef: [number, number, number] = [0, 0, 0];
  let groundRef: [number, number, number] = [0, 0, 0];
  let prevPixels: Uint8ClampedArray | null = null;
  const framePixels = (): Uint8ClampedArray => {
    pctx.clearRect(0, 0, WIDTH, HEIGHT);
    pctx.drawImage(renderer.domElement, 0, 0);
    return new Uint8ClampedArray(pctx.getImageData(0, 0, WIDTH, HEIGHT).data);
  };
  /** 探针 + 相邻帧滚动 diff（changedPct: diff>12 的像素占比——calib-chain diff 同参） */
  const probeWithDiff = (): { greenCoverage: number; diff: { changedPct: number; meanDelta: number; maxDelta: number } | null } => {
    const data = framePixels();
    if (skyRef[0] === 0 && skyRef[1] === 0 && skyRef[2] === 0) {
      const pxAt = (x: number, y: number): [number, number, number] => {
        const i = (y * WIDTH + x) * 4;
        return [data[i]!, data[i + 1]!, data[i + 2]!];
      };
      skyRef = pxAt(WIDTH >> 1, 4);
      groundRef = pxAt(4, HEIGHT - 4);
    }
    let green = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
      if (g > r * 1.08 && g > b * 1.08 && g > 40) green++;
    }
    let diffResult: { changedPct: number; meanDelta: number; maxDelta: number } | null = null;
    if (prevPixels) {
      let changed = 0, deltaSum = 0, maxDelta = 0;
      for (let i = 0; i < data.length; i += 4) {
        const d =
          Math.abs(data[i]! - prevPixels[i]!) + Math.abs(data[i + 1]! - prevPixels[i + 1]!) + Math.abs(data[i + 2]! - prevPixels[i + 2]!);
        if (d > 12) changed++;
        deltaSum += d / 3;
        if (d / 3 > maxDelta) maxDelta = d / 3;
      }
      const total = WIDTH * HEIGHT;
      diffResult = { changedPct: +(changed / total).toFixed(6), meanDelta: +(deltaSum / total / 3).toFixed(4), maxDelta: +maxDelta.toFixed(1) };
    }
    prevPixels = data;
    return { greenCoverage: +(green / (WIDTH * HEIGHT)).toFixed(6), diff: diffResult };
  };
  const resetDiff = (): void => {
    prevPixels = null;
  };

  const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

  /** 渲染账目（含 memory——无重复重建判据） */
  const stats = (): unknown => ({
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
    programs: renderer.info.programs?.length ?? 0,
  });

  /** 桶结构 digest（teardown churn 判据：pool 键数只增不减、条目数守恒） */
  const digest = (): unknown => {
    const poolsInternal = (pool as unknown as { pools: Map<string, { entries: unknown[] }> }).pools;
    const pools: Array<Record<string, unknown>> = [];
    let guests = 0;
    let owners = 0;
    for (const [key, p] of poolsInternal) {
      let g = 0;
      for (const e of p.entries as Array<{ isTransitionGuest?: boolean }>) if (e.isTransitionGuest) g++;
      guests += g;
      owners += p.entries.length - g;
      pools.push({ key, entries: p.entries.length, guests: g });
    }
    return { poolCount: pools.length, ownerEntries: owners, guestEntries: guests, pools: pools.sort((a, b) => String(a.key).localeCompare(String(b.key))) };
  };

  const perTree = (): Array<Record<string, unknown>> => {
    const out: Array<Record<string, unknown>> = [];
    const labelOf = new Map<string, string>(TREE_DEFS.map((d) => [d.id, d.label]));
    const poolsInternal = (pool as unknown as { pools: Map<string, {
      level: RuntimeRepresentation;
      entries: Array<{
        id: string; isTransitionGuest: boolean; culled: boolean; currentLod: unknown;
        lodTransition: { current: RuntimeRepresentation; target: RuntimeRepresentation; transition: number; transitionActive: boolean } | null;
        fadeOut: number;
      }>;
    }> }).pools;
    for (const p of poolsInternal.values()) {
      for (const e of p.entries) {
        if (e.isTransitionGuest) continue;
        const current = e.culled ? 'culled' : (e.lodTransition?.current ?? e.currentLod ?? p.level);
        out.push({
          id: labelOf.get(e.id) ?? e.id,
          current,
          target: e.lodTransition?.target ?? current,
          t: e.lodTransition ? +e.lodTransition.transition.toFixed(4) : null,
          active: e.lodTransition?.transitionActive ?? false,
          culled: e.culled,
          fade: +e.fadeOut.toFixed(4),
        });
      }
    }
    return out;
  };

  /** 相机移位（celtis 口径 m；fov 可变——m=(d/r)·tan(fov/2)） */
  const placeCamera = (m: number): void => {
    const anchor = trees[0]!;
    const d = (m * anchor.radius) / tanHalfFov;
    camera.position.set(
      anchor.center.x + DIR.x * d,
      anchor.center.y + DIR.y * d,
      anchor.center.z + DIR.z * d,
    );
    camera.lookAt(anchor.center.x, anchor.center.y, anchor.center.z);
  };

  /** FOV 写入（FOV 改变模式——m 随 tan(fov/2) 平移；当前 m 以 celtis 锚重算） */
  const setFov = (deg: number): { fov: number; mAnchor: number } => {
    camera.fov = deg;
    camera.updateProjectionMatrix();
    tanHalfFov = Math.tan(((deg / 2) * Math.PI) / 180);
    const anchor = trees[0]!;
    const d = camera.position.distanceTo(anchor.center);
    return { fov: deg, mAnchor: +((d / anchor.radius) * tanHalfFov).toFixed(3) };
  };

  /** 一步 = 取景 → frameLod → 微任务落定 → 渲染 → 探针（含滚动 diff） */
  const step = async (m: number): Promise<unknown> => {
    placeCamera(m);
    pool.frameLod(camera, true, editingPins.getIds());
    await settle();
    renderer.render(scene, camera);
    const pixels = probeWithDiff();
    const dist = pool.getLodDistribution();
    return {
      m: +m.toFixed(3),
      trees: perTree(),
      tInst: dist.transitionInstances,
      dual: dist.transition.dualSubmitBuckets,
      render: stats(),
      digestCounts: { poolCount: (digest() as { poolCount: number }).poolCount, ownerEntries: (digest() as { ownerEntries: number }).ownerEntries, guestEntries: (digest() as { guestEntries: number }).guestEntries },
      pixels: pixels.greenCoverage,
      diff: pixels.diff,
    };
  };

  /**
   * 运行模式序列（每步 step；返回逐步记录 + 汇总）。
   * 无震荡汇总 = 逐树 current 序列的「方向逆转」数（单调模式应 = 0；往返两段各段内应 = 0）；
   * diff 基线 = 序列中带外步（m<12 或 m>24 且远离 55-80）的相邻帧 diff 均值（同 Δm 运动基线）。
   */
  const runMode = async (name: string, ms: number[]): Promise<unknown> => {
    resetDiff();
    // 预热帧（不入序列——建立 diff 基准帧）
    await step(ms[0]!);
    resetDiff();
    const steps: Array<Record<string, unknown>> = [];
    for (const m of ms) steps.push(await step(m) as Record<string, unknown>);
    // 汇总：逐树 current 序列
    const treeIds = (steps[0]!.trees as Array<{ id: string }>).map((t) => t.id);
    const reversals: Record<string, number> = {};
    for (const id of treeIds) {
      const seq = steps.map((s) => ((s.trees as Array<{ id: string; current: string }>).find((t) => t.id === id)?.current ?? '?'));
      const order: Record<string, number> = { high: 0, mid: 1, low: 1, canopy: 2, culled: 3 };
      let rev = 0;
      for (let i = 2; i < seq.length; i++) {
        const a = order[seq[i - 2]!] ?? -1, b = order[seq[i - 1]!] ?? -1, c = order[seq[i]!] ?? -1;
        if ((b > a && c < b) || (b < a && c > b)) rev++;
      }
      reversals[id] = rev;
    }
    const diffs = steps.map((s) => (s.diff as { changedPct: number } | null)?.changedPct ?? null).filter((v): v is number => v !== null);
    const inBand = (m: number): boolean => (m >= 13 && m <= 24) || (m >= 55 && m <= 80);
    const baselineDiffs: number[] = [];
    for (let i = 0; i < steps.length; i++) {
      const m = steps[i]!.m as number;
      if (!inBand(m) && !inBand(ms[Math.max(0, i - 1)]!)) baselineDiffs.push(diffs[i - 1] ?? diffs[i]!);
    }
    const mean = (arr: number[]): number => arr.length ? +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(6) : 0;
    const memories = steps.map((s) => { const r = s.render as { geometries: number; textures: number; programs: number }; return `${r.geometries}/${r.textures}/${r.programs}`; });
    const poolCounts = steps.map((s) => (s.digestCounts as { poolCount: number }).poolCount);
    const poolCountShrinks = poolCounts.slice(1).filter((v, i) => v < poolCounts[i]).length;
    return {
      mode: name,
      nSteps: steps.length,
      steps,
      summary: {
        reversals,
        diffMax: Math.max(...diffs),
        diffMean: mean(diffs),
        diffBaselineMean: mean(baselineDiffs),
        diffBaselineMax: baselineDiffs.length ? Math.max(...baselineDiffs) : null,
        memoryDistinct: [...new Set(memories)],
        poolCountSeriesDistinct: [...new Set(poolCounts)],
        poolCountShrinks,
      },
    };
  };

  const linspace = (from: number, to: number, n: number): number[] => {
    const out: number[] = [];
    for (let i = 0; i <= n; i++) out.push(+(from + ((to - from) * i) / n).toFixed(3));
    return out;
  };

  /** 六运动模式序列（快速拖拽 = 大步跳 m；慢速 = 0.05 细步穿两带；FOV = 定 d 变 fov） */
  const MODES: Record<string, () => Promise<unknown>> = {
    recede: () => runMode('recede', linspace(3, 90, 44)),
    approach: () => runMode('approach', linspace(90, 3, 44)),
    roundtrip: async () => {
      const out = await runMode('roundtrip', [...linspace(3, 90, 30), ...linspace(88, 3, 30)]);
      // 往返 = 单序列两段（外出降档段 + 回程升档段）；reversals 统计已含段转折（1 次合法）
      return out;
    },
    fastDrag: () => runMode('fastDrag', [3, 40, 8, 60, 15, 90, 5, 30, 80, 10, 70, 20, 3, 55, 35]),
    slowMove: () => runMode('slowMove', [...linspace(15.5, 21, 60), ...linspace(58, 76, 90)]),
    fovChange: async () => {
      // 定 d（celtis m@fov50 = 17——带内）；fov 50→35→50：m ∝ tan(fov/2) → 17→11.48→17
      camera.fov = 50;
      camera.updateProjectionMatrix();
      tanHalfFov = Math.tan(((50 / 2) * Math.PI) / 180);
      placeCamera(17);
      await settle();
      renderer.render(scene, camera);
      resetDiff();
      const steps: Array<Record<string, unknown>> = [];
      // 降 fov（远离等效——m 收缩 → 升档方向穿迟滞线 13.6）
      for (const fov of [50, 47.5, 45, 42.5, 40, 37.5, 35]) {
        const f = setFov(fov);
        pool.frameLod(camera, true, editingPins.getIds());
        await settle();
        renderer.render(scene, camera);
        const pixels = probeWithDiff();
        const dist = pool.getLodDistribution();
        steps.push({ fov: f.fov, m: f.mAnchor, trees: perTree(), tInst: dist.transitionInstances, dual: dist.transition.dualSubmitBuckets, render: stats(), pixels: pixels.greenCoverage, diff: pixels.diff });
      }
      // 升 fov（靠近等效——m 扩张 → 降档方向穿名义线 16）
      for (const fov of [37.5, 40, 42.5, 45, 47.5, 50]) {
        const f = setFov(fov);
        pool.frameLod(camera, true, editingPins.getIds());
        await settle();
        renderer.render(scene, camera);
        const pixels = probeWithDiff();
        const dist = pool.getLodDistribution();
        steps.push({ fov: f.fov, m: f.mAnchor, trees: perTree(), tInst: dist.transitionInstances, dual: dist.transition.dualSubmitBuckets, render: stats(), pixels: pixels.greenCoverage, diff: pixels.diff });
      }
      camera.fov = 50;
      camera.updateProjectionMatrix();
      tanHalfFov = Math.tan(((50 / 2) * Math.PI) / 180);
      const treeIds = (steps[0]!.trees as Array<{ id: string }>).map((t) => t.id);
      const reversals: Record<string, number> = {};
      for (const id of treeIds) {
        const seq = steps.map((s) => ((s.trees as Array<{ id: string; current: string }>).find((t) => t.id === id)?.current ?? '?'));
        const order: Record<string, number> = { high: 0, mid: 1, low: 1, canopy: 2, culled: 3 };
        let rev = 0;
        for (let i = 2; i < seq.length; i++) {
          const a = order[seq[i - 2]!] ?? -1, b = order[seq[i - 1]!] ?? -1, c = order[seq[i]!] ?? -1;
          if ((b > a && c < b) || (b < a && c > b)) rev++;
        }
        reversals[id] = rev;
      }
      const diffs = steps.map((s) => (s.diff as { changedPct: number } | null)?.changedPct ?? 0);
      const memories = steps.map((s) => { const r = s.render as { geometries: number; textures: number; programs: number }; return `${r.geometries}/${r.textures}/${r.programs}`; });
      return { mode: 'fovChange', nSteps: steps.length, steps, summary: { reversals, diffMax: Math.max(...diffs), diffMean: +(diffs.reduce((s, v) => s + v, 0) / diffs.length).toFixed(6), memoryDistinct: [...new Set(memories)] } };
    },
  };

  // ── init：源预热 + prime（calib-chain 同款）──
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
      warm.push(representationRouter.provideRepresentationSource(tree.def.assetId, tree.def.seed, 'mid').then(() => undefined));
      warm.push(representationRouter.provideRepresentationSource(tree.def.assetId, tree.def.seed, 'canopy').then(() => undefined));
    }
    await Promise.all(warm);
    for (let i = 0; i < 100 && pool.getLodDistribution().buckets.high < trees.length; i++) await settle();
    await step(8);
    await step(22);
    await step(22);
    await step(3);
    resetDiff();
  };

  const w = (window as unknown as Record<string, unknown>).__fadeChain = {
    ready: false,
    __debug: { pool, camera, scene, renderer, trees },
    treeInfo: (): unknown =>
      trees.map((tree) => ({
        id: tree.def.label,
        assetId: tree.def.assetId,
        seed: tree.def.seed,
        slot: tree.slot,
        referenceSphere: { radius: +tree.radius.toFixed(3), centerY: +tree.center.y.toFixed(3) },
        chain: [...tree.chain],
      })),
    thresholds: (): unknown => ({ ...LOD_THRESHOLDS, bandRatio: TRANSITION_BAND_RATIO }),
    stats,
    digest,
    step,
    setFov,
    runMode,
    /** 按名跑六模式之一（驱动面入口——MODES 预编程序列） */
    runNamed: (name: string): Promise<unknown> => {
      const fn = MODES[name];
      if (!fn) throw new Error(`未知模式: ${name}（可用: ${Object.keys(MODES).join(',')}）`);
      return fn();
    },
    consoleDump: (): unknown => ({
      errors: (window as unknown as Record<string, unknown>).__CALIB_ERRORS,
      warnings: (window as unknown as Record<string, unknown>).__CALIB_WARNINGS,
    }),
  };

  init()
    .then(() => {
      w.ready = true;
    })
    .catch((err: unknown) => {
      (window as unknown as Record<string, unknown>).__CALIB_ERRORS.push(`init failed: ${String(err)}`);
      w.ready = true;
      w.initFailed = true;
    });
}

main();
