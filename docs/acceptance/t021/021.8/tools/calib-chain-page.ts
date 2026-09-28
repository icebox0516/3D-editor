/**
 * T021.8 Phase A 标定 harness——chain 页（阈值三数 / 迟滞带 / 过渡带宽度实测）。
 *
 * 装配 = 021.7 chain-smoke 同款「真实调度路径」逐行同构（AssetRegistry 真注册表 →
 * AssetLoader + ProceduralSourceCache + CanopySourceCache → AssetSourceRouter →
 * RepresentationSourceRouter 门面 → InstancedAssetPool 三注入），本页零手工摆材质；
 * 编辑态 pin = 真实 EditingPinHub + selected 集活源。差异仅三处（021.8 标定需要）：
 *  1. 树种换 { celtis, camphor, salix }（三种冠形——阈值判读的形态多样性面）；
 *  2. LOD_THRESHOLDS **运行时覆写通道**（同 m A/B 强制 mid/canopy 的对照帧来源）——
 *     经 import 同一模块对象就地改属性（ES 活引用；lodEvaluation 逐帧读属性，改后
 *     下一次 frameLod 即生效）。只在本页会话内改、用毕恢复，不触任何 src 文件；
 *  3. 逐对象状态直读面（pool.pools entries → current/target/transition/culled/fade）
 *     + 帧捕获/像素 diff + zoom 判读 overlay——平移量与带端判读的读数来源。
 *
 * 环境域照抄先例：T018 day 真实链（SkyCore → PmremEnvironment 初烘 →
 * environmentIntensity、day 太阳方向主光、地面大平面）；uTime 恒 0 静态帧；
 * 无 shadow pass（阴影面 A/B 归 calib-ab 页）。
 *
 * window.__calibChain 驱动面（全部异步，返回后渲染/统计已就绪）：
 *  - ready / treeInfo / thresholds / consoleDump / stats / distribution
 *  - step(m, label?)：相机到 m（celtis 口径）→ frameLod 一帧 → 渲染 → 全量快照
 *  - stepCompact(m)：细扫用——只回逐树 [id, m, current, target, t, active, culled, fade]
 *  - sweep(from, to, n)：from 起步顺次步进到 to（n 步），逐步 stepCompact
 *  - oscillate(nominal, ampPct, cycles, from)：名义线 ±amp% 往返 cycles 轮，逐帧
 *    current 记录 + 翻转计数（相对上一步的变化即翻转）
 *  - setSelected(ids) / clearSelected()：编辑态 pin（强制 high）
 *  - overrideThresholds(patch) / restoreThresholds()：A/B 覆写通道（记档用）
 *  - capture(label) / diff(a, b)：帧捕获与像素 diff（变更像素数 / 占比 / 均值差）
 *  - showZoom(label, cx, cy, half, scale) / hideZoom()：对已捕获帧的放大判读 overlay
 *  - abHighMid(m)：同 m A/B——(pinned-high 帧, natural-mid 帧) 捕获并回读
 *  - abMidCanopy(m)：同 m A/B——(mid 帧[覆写阈值], canopy 帧[覆写阈值]) 捕获并回读
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
const TAN_HALF_FOV = Math.tan(((FOV_DEG / 2) * Math.PI) / 180);
/** 取景射线（球坐标方向，021.3/021.6/021.7 同角：azimuth 35° / elevation 8°） */
const AZ = (35 * Math.PI) / 180;
const EL = (8 * Math.PI) / 180;
const DIR = new THREE.Vector3(
  Math.cos(EL) * Math.sin(AZ),
  Math.sin(EL),
  Math.cos(EL) * Math.cos(AZ),
);

/** 3 树种 × 不同对象 seed（不同槽）：celtis 居中（m 读数口径），camphor/salix 两侧 */
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

  // ── T018 环境域（day 预设真实链——照抄 021.3/021.6/021.7）──
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

  // ── 真实调度链装配（Renderer.ts L449-L511 同构——021.7 chain-smoke 逐行同款）──
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

  // ── 编辑态 pin（真实 EditingPinHub + selected 集活源 live 读）──
  const editingPins = new EditingPinHub();
  const selected = new Set<string>();
  editingPins.addSource((into) => {
    for (const id of selected) into.add(id);
  });

  // ── 3 树 attach ──
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

  // ── 像素探针 / 帧捕获（021.7 同式 + capture/diff 扩展）──
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = WIDTH;
  probeCanvas.height = HEIGHT;
  const pctx = probeCanvas.getContext('2d', { willReadFrequently: true })!;
  let skyRef: [number, number, number] = [0, 0, 0];
  let groundRef: [number, number, number] = [0, 0, 0];
  const frameData = (): ImageData => {
    pctx.clearRect(0, 0, WIDTH, HEIGHT);
    pctx.drawImage(renderer.domElement, 0, 0);
    return pctx.getImageData(0, 0, WIDTH, HEIGHT);
  };
  const probe = (): { greenCoverage: number; nonBgCoverage: number } => {
    const img = frameData();
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

  /** 帧捕获仓（label → 像素 + 当时读数） */
  const captures = new Map<string, { data: Uint8ClampedArray; mPerTree: Record<string, number>; render: unknown; pixels: unknown }>();
  const capture = (label: string): unknown => {
    const img = frameData();
    const mPerTree: Record<string, number> = {};
    for (const tree of trees) {
      mPerTree[tree.def.label] = +((camera.position.distanceTo(tree.center) / tree.radius) * TAN_HALF_FOV).toFixed(3);
    }
    captures.set(label, {
      data: new Uint8ClampedArray(img.data),
      mPerTree,
      render: stats(),
      pixels: lastPixels,
    });
    return { label, mPerTree };
  };
  const diff = (a: string, b: string): unknown => {
    const ca = captures.get(a);
    const cb = captures.get(b);
    if (!ca || !cb) return { error: `missing capture ${!ca ? a : b}` };
    const da = ca.data;
    const db = cb.data;
    let changed = 0;
    let deltaSum = 0;
    let maxDelta = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d =
        Math.abs(da[i]! - db[i]!) + Math.abs(da[i + 1]! - db[i + 1]!) + Math.abs(da[i + 2]! - db[i + 2]!);
      if (d > 12) changed++;
      deltaSum += d / 3;
      if (d / 3 > maxDelta) maxDelta = d / 3;
    }
    const total = WIDTH * HEIGHT;
    return {
      a,
      b,
      changedPixels: changed,
      changedPct: +(changed / total).toFixed(6),
      meanChannelDelta: +(deltaSum / total / 3).toFixed(4),
      maxChannelDelta: +maxDelta.toFixed(1),
    };
  };

  // ── zoom 判读 overlay（对最近一次 probe 帧的裁剪放大；截图走外层 CDP）──
  const zoomCanvas = document.getElementById('zoomOverlay') as HTMLCanvasElement;
  const zctx = zoomCanvas.getContext('2d')!;
  const showZoom = (cx: number, cy: number, half: number, scaleNote = ''): unknown => {
    zoomCanvas.style.display = 'block';
    zctx.imageSmoothingEnabled = false;
    zctx.clearRect(0, 0, WIDTH, HEIGHT);
    const side = half * 2;
    zctx.drawImage(probeCanvas, cx - half, cy - half, side, side, 0, 0, WIDTH, HEIGHT);
    zctx.strokeStyle = '#ff4';
    zctx.lineWidth = 2;
    zctx.strokeRect(1, 1, WIDTH - 2, HEIGHT - 2);
    return { center: [cx, cy], half, note: scaleNote };
  };
  const hideZoom = (): void => {
    zoomCanvas.style.display = 'none';
  };

  const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

  let lastPixels: unknown = {};
  const stats = (): unknown => ({
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    programs: renderer.info.programs?.length ?? 0,
    errors: (window as unknown as Record<string, unknown>).__CALIB_ERRORS.length,
    warnings: (window as unknown as Record<string, unknown>).__CALIB_WARNINGS.length,
  });

  /** 逐对象状态直读（TS private 仅编译期——运行时诊断读数，021.7 __debug 先例） */
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

  /** 相机移位（celtis 口径 m）——不动状态机（纯取景） */
  const placeCamera = (m: number): void => {
    const anchor = trees[0]!;
    const d = (m * anchor.radius) / TAN_HALF_FOV;
    camera.position.set(
      anchor.center.x + DIR.x * d,
      anchor.center.y + DIR.y * d,
      anchor.center.z + DIR.z * d,
    );
    camera.lookAt(anchor.center.x, anchor.center.y, anchor.center.z);
  };

  /** 树心屏幕坐标（zoom 定位用） */
  const screenPosOf = (label: string): [number, number] => {
    const tree = trees.find((t) => t.def.label === label) ?? trees[0]!;
    const ndc = tree.center.clone().project(camera);
    return [((ndc.x + 1) / 2) * WIDTH, ((1 - ndc.y) / 2) * HEIGHT];
  };

  let frameIndex = 0;
  /** 一步 = 取景 m → frameLod 一帧 → 微任务落定 → 渲染 → 快照（021.7 同款） */
  const step = async (m: number, label = ''): Promise<unknown> => {
    frameIndex += 1;
    placeCamera(m);
    const pins = editingPins.getIds();
    pool.frameLod(camera, true, pins);
    await settle();
    renderer.render(scene, camera);
    const perTreeM: Record<string, number> = {};
    const perTreeD: Record<string, number> = {};
    for (const tree of trees) {
      const di = camera.position.distanceTo(tree.center);
      perTreeD[tree.def.label] = +di.toFixed(1);
      perTreeM[tree.def.label] = +((di / tree.radius) * TAN_HALF_FOV).toFixed(3);
    }
    const pixels = probe();
    lastPixels = pixels;
    return {
      frame: frameIndex,
      label,
      mTarget: m,
      distance: { ...perTreeD },
      mPerTree: { ...perTreeM },
      pins: [...pins],
      trees: perTree(),
      distribution: pool.getLodDistribution(),
      render: stats(),
      pixels,
    };
  };
  /** 细扫紧凑步（平移量测量——只回逐树态 + m） */
  const stepCompact = async (m: number): Promise<unknown> => {
    frameIndex += 1;
    placeCamera(m);
    pool.frameLod(camera, true, editingPins.getIds());
    await settle();
    renderer.render(scene, camera);
    const perTreeM: Record<string, number> = {};
    for (const tree of trees) {
      perTreeM[tree.def.label] = +((camera.position.distanceTo(tree.center) / tree.radius) * TAN_HALF_FOV).toFixed(3);
    }
    return { m: perTreeM, trees: perTree() };
  };
  const sweep = async (from: number, to: number, n: number): Promise<unknown[]> => {
    const out: unknown[] = [];
    for (let i = 0; i <= n; i++) {
      const m = from + ((to - from) * i) / n;
      out.push(await stepCompact(+m.toFixed(3)));
    }
    return out;
  };
  /** 名义线 ±amp% 往返 cycles 轮：from='below' 从下侧表示稳态起步（先行稳 3 帧） */
  const oscillate = async (nominal: number, ampPct: number, cycles: number, from: 'below' | 'above'): Promise<unknown> => {
    const amp = nominal * ampPct;
    const lo = nominal - amp;
    const hi = nominal + amp;
    const start = from === 'below' ? lo : hi;
    for (let i = 0; i < 3; i++) await step(start, 'osc-pre');
    const steps: Array<Record<string, unknown>> = [];
    let flips = 0;
    let prev = JSON.stringify(perTree().map((t) => [t.id, t.current]));
    for (let c = 0; c < cycles; c++) {
      for (const m of [hi, lo]) {
        frameIndex += 1;
        placeCamera(m);
        pool.frameLod(camera, true, editingPins.getIds());
        await settle();
        renderer.render(scene, camera);
        const perTreeM: Record<string, number> = {};
        for (const tree of trees) {
          perTreeM[tree.def.label] = +((camera.position.distanceTo(tree.center) / tree.radius) * TAN_HALF_FOV).toFixed(3);
        }
        const snap = JSON.stringify(perTree().map((t) => [t.id, t.current]));
        const changed = snap !== prev;
        if (changed) flips++;
        prev = snap;
        steps.push({ cycle: c, m: { ...perTreeM }, trees: perTree(), flip: changed });
      }
    }
    return { nominal, ampPct, lo: +lo.toFixed(3), hi: +hi.toFixed(3), cycles, flips, steps };
  };

  // ── 阈值覆写通道（同 m A/B——仅本页会话，用毕恢复）──
  const DEFAULTS = { ...LOD_THRESHOLDS } as Record<string, number>;
  const overrideThresholds = (patch: Record<string, number>): unknown => {
    const prev: Record<string, number> = {};
    for (const [k, v] of Object.entries(patch)) {
      prev[k] = (LOD_THRESHOLDS as unknown as Record<string, number>)[k]!;
      (LOD_THRESHOLDS as unknown as Record<string, number>)[k] = v;
    }
    return { applied: patch, prev };
  };
  const restoreThresholds = (): unknown => {
    Object.assign(LOD_THRESHOLDS, DEFAULTS);
    return { restored: DEFAULTS };
  };

  /** 同 m A/B：highToMid 位——pinned-high 帧 vs natural-mid 帧（m 需 >6 使 natural=mid） */
  const abHighMid = async (m: number): Promise<unknown> => {
    clearSel();
    await step(m, 'ab-pre');
    const natural = await step(m, 'ab-h2m-mid');
    capture(`h2m-mid@${m}`);
    for (const t of trees) selected.add(t.def.id);
    const pinned = await step(m, 'ab-h2m-high');
    capture(`h2m-high@${m}`);
    clearSel();
    return {
      m,
      natural: { trees: (natural as { trees: unknown }).trees, render: (natural as { render: unknown }).render, pixels: (natural as { pixels: unknown }).pixels },
      pinned: { trees: (pinned as { trees: unknown }).trees, render: (pinned as { render: unknown }).render, pixels: (pinned as { pixels: unknown }).pixels },
      diff: diff(`h2m-mid@${m}`, `h2m-high@${m}`),
    };
  };

  /**
   * 同 m A/B：midToCanopy 位——
   *  mid 帧：覆写 midToCanopy=1.5m → 先 goto(m×0.6) 让升档完成（躲开升档迟滞带）
   *          → 回 m（稳态 mid）→ 捕获；
   *  canopy 帧：覆写 midToCanopy=0.7m（带末 0.875m < m → f=1 直接完成）→ 捕获；
   *  两帧同机位同 m，仅表示不同。结束恢复阈值。
   */
  const abMidCanopy = async (m: number): Promise<unknown> => {
    overrideThresholds({ midToCanopy: +(m * 1.5).toFixed(2) });
    await step(+(m * 0.6).toFixed(2), 'ab-mc-settle');
    await step(+(m * 0.6).toFixed(2), 'ab-mc-settle2');
    const midFrame = await step(m, 'ab-mc-mid');
    capture(`mc-mid@${m}`);
    overrideThresholds({ midToCanopy: +(m * 0.7).toFixed(2) });
    const canFrame = await step(m, 'ab-mc-canopy');
    capture(`mc-canopy@${m}`);
    restoreThresholds();
    return {
      m,
      mid: { trees: (midFrame as { trees: unknown }).trees, render: (midFrame as { render: unknown }).render, pixels: (midFrame as { pixels: unknown }).pixels },
      canopy: { trees: (canFrame as { trees: unknown }).trees, render: (canFrame as { render: unknown }).render, pixels: (canFrame as { pixels: unknown }).pixels },
      diff: diff(`mc-mid@${m}`, `mc-canopy@${m}`),
    };
  };

  const clearSel = (): void => {
    selected.clear();
  };

  // ── init：源预热（9 源）+ prime（021.7 同款）──
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
    await step(8, 'prime-mid');
    await step(22, 'prime-canopy-queue');
    await step(22, 'prime-canopy-commit');
    await step(3, 'prime-back-high');
  };

  const w = (window as unknown as Record<string, unknown>).__calibChain = {
    ready: false,
    __debug: { pool, camera, scene, renderer, trees },
    camera: { fovDeg: FOV_DEG, width: WIDTH, height: HEIGHT, azimuthDeg: 35, elevationDeg: 8 },
    bandRatioConstant: TRANSITION_BAND_RATIO,
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
    thresholds: (): unknown => ({ ...LOD_THRESHOLDS, bandRatio: TRANSITION_BAND_RATIO }),
    setSelected: (ids: string[]): void => {
      clearSel();
      for (const id of ids) selected.add(id);
    },
    clearSelected: clearSel,
    step,
    stepCompact,
    sweep,
    oscillate,
    overrideThresholds,
    restoreThresholds,
    capture,
    diff,
    showZoom,
    hideZoom,
    screenPosOf,
    abHighMid,
    abMidCanopy,
    distribution: (): unknown => pool.getLodDistribution(),
    stats,
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
