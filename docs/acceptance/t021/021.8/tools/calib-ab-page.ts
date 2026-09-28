/**
 * T021.8 Phase A 标定 harness——AB 页（④乔木链 low 回插 / ⑤canopy receive / ⑥mid depth）。
 *
 * 三项都是「同 m 同树、仅一个变量」的直挂对照（调度可达性不属本页验证面——low 可达性
 * 已有测试覆盖；本页问题本质 = 视觉与成本）。源全部经真实路由供给
 * （RepresentationSourceRouter：low → ProceduralSourceCache、canopy → CanopySourceCache）
 * ——与 chain 页 / Renderer 装配同一套缓存与工厂，仅不进池（直挂 Mesh，021.5 先例形态）。
 * 策略面：cast/receive/depth 挂载经 SHADOW_POLICY / shadowDepthMaterialOf 交付原语，
 * A/B 位（canopy receive、mid depth）为页内显式开关——对应 021.8 点名复核位。
 *
 * 环境域照抄先例（T018 day 真实链、uTime 恒 0）；**Shadow 全链照抄 Renderer.ts
 * 1036-1055 冻结常量**（021.5 shadow-smoke 同款：2048² / ±160 / near 1 / far 400 /
 * bias −0.0004 + PCFShadowMap——一个数不改）。三个舞台均布在原点 ~80m 内（±160
 * shadow 视锥覆盖范围内）：
 *  - ④ low/canopy 直挂舞台：celtis(−60,0,0) / camphor(0,0,0) / salix(+60,0,0)，
 *    每树种 low 与 canopy 同位双 Mesh、按帧只亮一个（shadow off——纯几何/材质对照）；
 *  - ⑤ receive 舞台：(0,0,−80) canopy celtis 接收树 + 上风向 3 棵 high celtis caster
 *    （caster 位 = 太阳方向反推，冠层高度差 ~2m → 影横距 ~1.7m，散布 1.5–5.5m）；
 *  - ⑥ mid depth 舞台：(0,0,60) mid celtis + customDepthMaterial 挂/不挂（full=SDF /
 *    simplified=three 缺省实心深度——shadowPolicy.ts 头注语义）。
 *
 * window.__calibAB 驱动面：
 *  - ready / info（树种基准球 / 各 rep 三角账） / consoleDump / stats / setShadow
 *  - showAB4(species, rep, m)：④ 帧——单树种单 rep 可见，m 按该树种基准球取距
 *  - showAB5(receive, m)：⑤ 帧——caster+receiver，receiver.receiveShadow=receive
 *  - showAB6(depth, m, azDeg)：⑥ 帧——mid 树 + 深度材质 A/B，azDeg 取景方位
 *  - capture(label) / diff(a,b) / showZoom(cx,cy,half) / hideZoom / probe 工具面
 */
import * as THREE from 'three';
import { AssetLoader } from '/src/runtime/loaders/AssetLoader';
import { AssetSourceRouter } from '/src/runtime/loaders/AssetSourceRouter';
import { RepresentationSourceRouter } from '/src/runtime/loaders/RepresentationSourceRouter';
import { ProceduralSourceCache } from '/src/runtime/procedural/ProceduralSourceCache';
import { CanopySourceCache } from '/src/runtime/procedural/CanopySourceCache';
import { collectProceduralAssetMetas } from '/src/runtime/procedural/routes';
import { AssetRegistry } from '/src/registries/AssetRegistry';
import { shadowDepthMaterialOf } from '/src/runtime/instancing/InstancedAssetPool';
import type { InstanceSource } from '/src/runtime/instancing/InstancedAssetPool';
import { SHADOW_POLICY, shadowPolicyOf } from '/src/domain/lod/shadowPolicy';
import type { RuntimeRepresentation } from '/src/domain/lod/representation';
import { SkyCore } from '/src/runtime/environment/skyCore';
import { PmremEnvironment, LazyPmremBackend } from '/src/runtime/environment/pmremEnvironment';
import { environmentPresetOf, skyAtmosphereOfPreset } from '/src/runtime/environment/environmentPresets';
import { LEGACY_SUN_DISTANCE } from '/src/runtime/environment/sunDirection';

const WIDTH = 1920;
const HEIGHT = 1080;
const FOV_DEG = 50;
const TAN_HALF_FOV = Math.tan(((FOV_DEG / 2) * Math.PI) / 180);

const SPECIES = [
  { key: 'celtis', assetId: 'asset_tree_celtis', seed: 101, pos: new THREE.Vector3(-60, 0, 0) },
  { key: 'camphor', assetId: 'asset_tree_camphor', seed: 202, pos: new THREE.Vector3(0, 0, 0) },
  { key: 'salix', assetId: 'asset_tree_salix', seed: 303, pos: new THREE.Vector3(60, 0, 0) },
] as const;

/** ⑤ 舞台 / ⑥ 舞台锚点（±160 shadow 视锥内） */
const STAGE5 = new THREE.Vector3(0, 0, -80);
const STAGE6 = new THREE.Vector3(0, 0, 60);

interface Rig {
  species: string;
  rep: RuntimeRepresentation;
  mesh: THREE.Mesh;
  worldBox: THREE.Box3;
  triangles: number;
}

function triOf(geometry: THREE.BufferGeometry): number {
  return geometry.index ? geometry.index.count / 3 : geometry.attributes.position!.count / 3;
}

function main(): void {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ── Shadow 全局开关 + 冻结常量（Renderer.ts 照抄，一个数不改——021.5 同款）──
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9db8d2');

  // ── T018 day 环境链（照抄先例）──
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
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -160;
  sun.shadow.camera.right = 160;
  sun.shadow.camera.top = 160;
  sun.shadow.camera.bottom = -160;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 400;
  sun.shadow.bias = -0.0004;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 8000),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(preset.groundColor), roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(FOV_DEG, WIDTH / HEIGHT, 1, 10000);

  // ── 真实源路由装配（chain 页同款，无池）──
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

  /** 直挂 rig 构造（源经真实路由；cast/receive/depth 全经交付原语） */
  const makeRig = (species: string, rep: RuntimeRepresentation, source: InstanceSource, pos: THREE.Vector3): Rig => {
    const mesh = new THREE.Mesh(source.geometry, source.material);
    const depth = shadowDepthMaterialOf(rep, source);
    if (depth) mesh.customDepthMaterial = depth;
    const policy = shadowPolicyOf(rep);
    mesh.castShadow = policy.cast;
    mesh.receiveShadow = policy.receive;
    mesh.position.copy(pos);
    mesh.visible = false;
    scene.add(mesh);
    source.geometry.computeBoundingBox();
    const bb = source.geometry.boundingBox!;
    const worldBox = new THREE.Box3(
      new THREE.Vector3(bb.min.x + pos.x, bb.min.y + pos.y, bb.min.z + pos.z),
      new THREE.Vector3(bb.max.x + pos.x, bb.max.y + pos.y, bb.max.z + pos.z),
    );
    return { species, rep, mesh, worldBox, triangles: triOf(source.geometry) };
  };

  const allRigs: Rig[] = [];
  const radii = new Map<string, { radius: number; center: THREE.Vector3 }>();

  const init = async (): Promise<void> => {
    // ④ 舞台：3 树种 × {low, canopy}（+ high 基准球读数）
    for (const sp of SPECIES) {
      const highSource = await representationRouter.provideRepresentationSource(sp.assetId, sp.seed, 'high');
      if (!highSource.geometry.boundingSphere) highSource.geometry.computeBoundingSphere();
      const sphere = highSource.geometry.boundingSphere!;
      radii.set(sp.key, { radius: sphere.radius, center: sphere.center.clone() });
      const lowSource = await representationRouter.provideRepresentationSource(sp.assetId, sp.seed, 'low');
      allRigs.push(makeRig(sp.key, 'low', lowSource, sp.pos));
      const canopySource = await representationRouter.provideRepresentationSource(sp.assetId, sp.seed, 'canopy');
      allRigs.push(makeRig(sp.key, 'canopy', canopySource, sp.pos));
    }
    // ⑤ 舞台：receiver canopy celtis + 3 high caster（上风向散布）
    const celtis = SPECIES[0]!;
    const receiverSource = await representationRouter.provideRepresentationSource(celtis.assetId, celtis.seed, 'canopy');
    allRigs.push(makeRig('stage5-receiver', 'canopy', receiverSource, STAGE5));
    const upSun = new THREE.Vector3(sd.x, 0, sd.z).normalize();
    const lateral = new THREE.Vector3(-upSun.z, 0, upSun.x);
    const casterSlots = [
      { d: 1.6, l: 0.5 },
      { d: 3.4, l: -2.2 },
      { d: 5.2, l: 2.4 },
    ];
    const highSources: InstanceSource[] = [];
    for (let i = 0; i < casterSlots.length; i++) {
      highSources.push(await representationRouter.provideRepresentationSource(celtis.assetId, celtis.seed + i * 17, 'high'));
    }
    casterSlots.forEach((slot, i) => {
      const pos = STAGE5.clone().addScaledVector(upSun, slot.d).addScaledVector(lateral, slot.l);
      allRigs.push(makeRig(`stage5-caster${i}`, 'high', highSources[i]!, pos));
    });
    // ⑥ 舞台：mid celtis（深度材质 A/B 位）
    const midSource = await representationRouter.provideRepresentationSource(celtis.assetId, celtis.seed, 'mid');
    allRigs.push(makeRig('stage6-mid', 'mid', midSource, STAGE6));
  };

  // ── 探针 / 捕获 / zoom（chain 页同式）──
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = WIDTH;
  probeCanvas.height = HEIGHT;
  const pctx = probeCanvas.getContext('2d', { willReadFrequently: true })!;
  const frameData = (): ImageData => {
    pctx.clearRect(0, 0, WIDTH, HEIGHT);
    pctx.drawImage(renderer.domElement, 0, 0);
    return pctx.getImageData(0, 0, WIDTH, HEIGHT);
  };
  const lum = (r: number, g: number, b: number): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;

  const captures = new Map<string, { data: Uint8ClampedArray }>();
  const stats = (): unknown => ({
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    programs: renderer.info.programs?.length ?? 0,
    errors: (window as unknown as Record<string, unknown>).__CALIB_ERRORS.length,
    warnings: (window as unknown as Record<string, unknown>).__CALIB_WARNINGS.length,
  });
  const capture = (label: string): unknown => {
    const img = frameData();
    captures.set(label, { data: new Uint8ClampedArray(img.data) });
    return { label };
  };
  const diff = (a: string, b: string): unknown => {
    const ca = captures.get(a);
    const cb = captures.get(b);
    if (!ca || !cb) return { error: `missing capture ${!ca ? a : b}` };
    let changed = 0;
    let deltaSum = 0;
    for (let i = 0; i < ca.data.length; i += 4) {
      const d =
        Math.abs(ca.data[i]! - cb.data[i]!) +
        Math.abs(ca.data[i + 1]! - cb.data[i + 1]!) +
        Math.abs(ca.data[i + 2]! - cb.data[i + 2]!);
      if (d > 12) changed++;
      deltaSum += d / 3;
    }
    const total = WIDTH * HEIGHT;
    return {
      a,
      b,
      changedPixels: changed,
      changedPct: +(changed / total).toFixed(6),
      meanChannelDelta: +(deltaSum / total / 3).toFixed(4),
    };
  };
  const zoomCanvas = document.getElementById('zoomOverlay') as HTMLCanvasElement;
  const zctx = zoomCanvas.getContext('2d')!;
  const showZoom = (cx: number, cy: number, half: number): unknown => {
    zoomCanvas.style.display = 'block';
    zctx.imageSmoothingEnabled = false;
    zctx.clearRect(0, 0, WIDTH, HEIGHT);
    zctx.drawImage(probeCanvas, cx - half, cy - half, half * 2, half * 2, 0, 0, WIDTH, HEIGHT);
    zctx.strokeStyle = '#ff4';
    zctx.lineWidth = 2;
    zctx.strokeRect(1, 1, WIDTH - 2, HEIGHT - 2);
    return { center: [cx, cy], half };
  };
  const hideZoom = (): void => {
    zoomCanvas.style.display = 'none';
  };

  /** 世界点 → 屏幕 */
  const toScreen = (p: THREE.Vector3): { x: number; y: number } => {
    const ndc = p.clone().project(camera);
    return { x: ((ndc.x + 1) / 2) * WIDTH, y: ((1 - ndc.y) / 2) * HEIGHT };
  };
  /** box → 屏幕 bbox 矩形（整数 clamp） */
  const rectOf = (box: THREE.Box3): { x0: number; y0: number; x1: number; y1: number } => {
    const corners = [
      box.min,
      box.max,
      new THREE.Vector3(box.min.x, box.min.y, box.max.z),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    ].map(toScreen);
    return {
      x0: Math.max(0, Math.floor(Math.min(...corners.map((c) => c.x)))),
      y0: Math.max(0, Math.floor(Math.min(...corners.map((c) => c.y)))),
      x1: Math.min(WIDTH - 1, Math.ceil(Math.max(...corners.map((c) => c.x)))),
      y1: Math.min(HEIGHT - 1, Math.ceil(Math.max(...corners.map((c) => c.y)))),
    };
  };
  /** 矩形亮度统计（均值 / σ / 暗像素 < thr 占比） */
  const rectLum = (img: ImageData, rect: { x0: number; y0: number; x1: number; y1: number }, thr: number): unknown => {
    const d = img.data;
    let n = 0;
    let sum = 0;
    let sq = 0;
    let dark = 0;
    for (let y = rect.y0; y <= rect.y1; y++) {
      for (let x = rect.x0; x <= rect.x1; x++) {
        const i = (y * WIDTH + x) * 4;
        const l = lum(d[i]!, d[i + 1]!, d[i + 2]!);
        n++;
        sum += l;
        sq += l * l;
        if (l < thr) dark++;
      }
    }
    const mean = n > 0 ? sum / n : 0;
    return {
      rect,
      pixels: n,
      meanLum: +mean.toFixed(2),
      stdLum: n > 0 ? +Math.sqrt(Math.max(0, sq / n - mean * mean)).toFixed(2) : 0,
      darkPct: n > 0 ? +(dark / n).toFixed(4) : 0,
    };
  };
  /** 影足迹外接屏幕矩形（021.5 式：bbox 角点沿光向投 y=0） */
  const groundProject = (p: THREE.Vector3): THREE.Vector3 => {
    const t = p.y / sd.y;
    return new THREE.Vector3(p.x - sd.x * t, 0, p.z - sd.z * t);
  };
  const shadowRectOf = (box: THREE.Box3): { x0: number; y0: number; x1: number; y1: number } => {
    const pts: THREE.Vector3[] = [];
    for (const cx of [box.min.x, box.max.x]) {
      for (const cy of [box.min.y, box.max.y]) {
        for (const cz of [box.min.z, box.max.z]) {
          const p = new THREE.Vector3(cx, cy, cz);
          pts.push(p, groundProject(p));
        }
      }
    }
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    for (const p of pts) {
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
      z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z);
    }
    const corners = [
      new THREE.Vector3(x0, 0, z0), new THREE.Vector3(x1, 0, z0),
      new THREE.Vector3(x0, 0, z1), new THREE.Vector3(x1, 0, z1),
    ].map(toScreen);
    return {
      x0: Math.max(0, Math.floor(Math.min(...corners.map((c) => c.x)))),
      y0: Math.max(0, Math.floor(Math.min(...corners.map((c) => c.y)))),
      x1: Math.min(WIDTH - 1, Math.ceil(Math.max(...corners.map((c) => c.x)))),
      y1: Math.min(HEIGHT - 1, Math.ceil(Math.max(...corners.map((c) => c.y)))),
    };
  };

  /** 取景：目标点 + m（按给定基准球半径）+ 方位/俯角 */
  const frameAt = (target: THREE.Vector3, radius: number, m: number, azDeg: number, elDeg: number): void => {
    const az = (azDeg * Math.PI) / 180;
    const el = (elDeg * Math.PI) / 180;
    const d = (m * radius) / TAN_HALF_FOV;
    camera.position.set(
      target.x + d * Math.cos(el) * Math.sin(az),
      target.y + d * Math.sin(el),
      target.z + d * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(target);
  };

  const rigOf = (species: string, rep: RuntimeRepresentation): Rig => {
    const rig = allRigs.find((r) => r.species === species && r.rep === rep);
    if (!rig) throw new Error(`rig 不存在: ${species}/${rep}`);
    return rig;
  };
  const setVisibleOnly = (predicate: (rig: Rig) => boolean): void => {
    for (const rig of allRigs) rig.mesh.visible = predicate(rig);
  };

  /** ④ low/canopy 同 m 对照帧 */
  const showAB4 = (species: string, rep: 'low' | 'canopy', m: number): unknown => {
    sun.castShadow = false; // ④ = 纯几何/材质对照（阴影面归 ⑤）
    const rig = rigOf(species, rep);
    setVisibleOnly((r) => r === rig);
    const info = radii.get(species)!;
    const target = new THREE.Vector3(
      rig.mesh.position.x + info.center.x,
      info.center.y,
      rig.mesh.position.z + info.center.z,
    );
    frameAt(target, info.radius, m, 35, 8);
    renderer.render(scene, camera);
    const img = frameData();
    let green = 0;
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 1]! > d[i]! * 1.08 && d[i + 1]! > d[i + 2]! * 1.08 && d[i + 1]! > 40) green++;
    }
    return {
      mode: 'ab4',
      species,
      rep,
      m,
      actualM: +((camera.position.distanceTo(target) / info.radius) * TAN_HALF_FOV).toFixed(3),
      triangles: rig.triangles,
      render: stats(),
      greenCoverage: +(green / (WIDTH * HEIGHT)).toFixed(6),
      treeScreenRect: rectOf(rig.worldBox),
    };
  };

  /** ⑤ canopy receive A/B 帧（caster 群 + receiver；receiver.receiveShadow = receive） */
  const showAB5 = (receive: boolean, m: number): unknown => {
    sun.castShadow = true;
    setVisibleOnly((r) => r.species.startsWith('stage5'));
    const receiver = rigOf('stage5-receiver', 'canopy');
    receiver.mesh.receiveShadow = receive; // A/B 位（生产默认 false——SHADOW_POLICY.canopy）
    // m 口径 = High 派生稳定基准球（SelectionBounds 同源——rep 无关，D28.4）
    const info = radii.get('celtis')!;
    const target = STAGE5.clone().add(info.center);
    frameAt(target, info.radius, m, 145, 10);
    renderer.render(scene, camera);
    const img = frameData();
    const rect = rectOf(receiver.worldBox);
    return {
      mode: 'ab5',
      receive,
      m,
      crown: rectLum(img, rect, 1e9),
      crownRect: rect,
      render: stats(),
      policyCanopy: SHADOW_POLICY.canopy,
      receiverFlags: { castShadow: receiver.mesh.castShadow, receiveShadow: receiver.mesh.receiveShadow },
    };
  };

  /** ⑥ mid depth A/B 帧（'full' = 挂源 SDF；'simplified' = 不挂 → three 缺省实心深度） */
  const showAB6 = (depth: 'full' | 'simplified', m: number, azDeg = 215): unknown => {
    sun.castShadow = true;
    setVisibleOnly((r) => r.species === 'stage6-mid');
    const rig = rigOf('stage6-mid', 'mid');
    const sourceDepth = shadowDepthMaterialOf('mid', {
      geometry: rig.mesh.geometry,
      material: rig.mesh.material,
      customDepthMaterial: midDepthStash,
    } as InstanceSource);
    if (depth === 'full') {
      if (sourceDepth) rig.mesh.customDepthMaterial = sourceDepth;
    } else {
      rig.mesh.customDepthMaterial = undefined as unknown as THREE.Material;
    }
    const target = STAGE6.clone().add(radii.get('celtis')!.center);
    const radius = radii.get('celtis')!.radius; // m 口径 = High 派生稳定基准球（rep 无关）
    frameAt(target, radius, m, azDeg, 16);
    renderer.render(scene, camera);
    const img = frameData();
    // 影足迹暗阈参考：影矩形旁亮地中位数 ×0.75（021.5 式简化——固定采样列）
    const litSample: number[] = [];
    const d = img.data;
    const sRect = shadowRectOf(rig.worldBox);
    for (let y = sRect.y0; y <= sRect.y1; y += 2) {
      const x = Math.min(WIDTH - 1, sRect.x1 + 60);
      const i = (y * WIDTH + x) * 4;
      if (i < d.length) litSample.push(lum(d[i]!, d[i + 1]!, d[i + 2]!));
    }
    litSample.sort((a, b) => a - b);
    const litMedian = litSample.length > 0 ? litSample[litSample.length >> 1]! : 200;
    return {
      mode: 'ab6',
      depth,
      m,
      shadow: rectLum(img, sRect, litMedian * 0.75),
      shadowRect: sRect,
      litMedian: +litMedian.toFixed(1),
      render: stats(),
      mountedDepth: rig.mesh.customDepthMaterial
        ? (rig.mesh.customDepthMaterial as THREE.Material).customProgramCacheKey?.() ?? '(no-key)'
        : null,
    };
  };
  /** mid 源深度材质 stash（showAB6 复挂用——rig 构造时从源捕获） */
  let midDepthStash: THREE.Material | undefined;

  const w = (window as unknown as Record<string, unknown>).__calibAB = {
    ready: false,
    __debug: { scene, camera, renderer, allRigs: () => allRigs, sun },
    shadowConstants: {
      mapSize: '2048x2048',
      ortho: '+/-160',
      near: 1,
      far: 400,
      bias: -0.0004,
      type: 'PCFShadowMap',
      sunDirectionUnit: [sd.x, sd.y, sd.z].map((v) => +v.toFixed(4)),
    },
    info: (): unknown => ({
      species: SPECIES.map((sp) => ({
        key: sp.key,
        assetId: sp.assetId,
        seed: sp.seed,
        position: sp.pos.toArray(),
        referenceSphere: radii.get(sp.key)
          ? { radius: +radii.get(sp.key)!.radius.toFixed(3), centerY: +radii.get(sp.key)!.center.y.toFixed(3) }
          : null,
        triangles: {
          low: allRigs.find((r) => r.species === sp.key && r.rep === 'low')?.triangles ?? null,
          canopy: allRigs.find((r) => r.species === sp.key && r.rep === 'canopy')?.triangles ?? null,
        },
      })),
      stage5: { receiver: STAGE5.toArray(), casters: allRigs.filter((r) => r.species.startsWith('stage5-caster')).map((r) => r.mesh.position.toArray()) },
      stage6: STAGE6.toArray(),
    }),
    setShadow: (on: boolean): void => {
      sun.castShadow = on;
    },
    showAB4,
    showAB5,
    showAB6,
    capture,
    diff,
    showZoom,
    hideZoom,
    screenCenterOf: (species: string, rep: RuntimeRepresentation): unknown => {
      const rig = rigOf(species, rep);
      return rectOf(rig.worldBox);
    },
    stats,
    consoleDump: (): unknown => ({
      errors: (window as unknown as Record<string, unknown>).__CALIB_ERRORS,
      warnings: (window as unknown as Record<string, unknown>).__CALIB_WARNINGS,
    }),
  };

  init()
    .then(async () => {
      // mid 深度材质 stash：源构造时捕获（rig.customDepthMaterial 初值即源 SDF）
      const midRig = allRigs.find((r) => r.species === 'stage6-mid');
      midDepthStash = midRig?.mesh.customDepthMaterial;
      w.ready = true;
    })
    .catch((err: unknown) => {
      (window as unknown as Record<string, unknown>).__CALIB_ERRORS.push(`init failed: ${String(err)}`);
      w.ready = true;
      w.initFailed = true;
    });
}

main();
