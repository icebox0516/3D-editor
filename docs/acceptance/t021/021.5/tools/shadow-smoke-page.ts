/**
 * T021.5 Shadow Representation 冒烟页（最小渲染 harness——Shadow Policy 策略层直消费，
 * 无 Runtime 接线：不经 Renderer / SceneManager / InstancedAssetPool 池路径 / SourceCache；
 * canopy 生产路径 021.7 前不可达，沿 021.3 / 021.6 先例以工厂直消费验证执行面语义）。
 *
 * 验证对象（021.5 交付面三件事）：
 *  1. depth 三档映射（shadowDepthMaterialOf 原语直消费）：
 *     high = 挂源 SDF 叶影裁切深度材质（full）；low = **不挂**（simplified = three 缺省
 *     实心几何深度——源有 LOW SDF 深度材质也不挂）；canopy = 挂 021.6 Canopy Depth
 *     Material（无 SDF 轮廓级）；
 *  2. receive 按表示（shadowPolicyOf：high/low receive=true、canopy receive=false）；
 *  3. 中点切换（isShadowCasterFor 原语直消费）：dither 双表示共存期恰一侧 cast
 *     （中点前 current 侧 = mid、中点后 target 侧 = canopy——TransitionCommit.
 *     shadowRepresentation 语义手工摆位，021.3「帧值按 commit 语义摆位」先例）。
 *
 * 场景 = celtis（朴树，021.3 同款）三棵并排（X 轴 -25 / 0 / +25，间距 25m 防影交叠）：
 *   high(-25) = buildCeltisGeometry(seed, profiles[0], 'high') + 皮/叶材质 + 挂
 *               createCeltisLeafDepthMaterial('high')；
 *   low(0)    = 同 seed 'low' 档 + 材质 + **不挂任何 customDepthMaterial**（源仍构造
 *               LOW SDF 深度材质传入 shadowDepthMaterialOf——验证「提供也不挂」）；
 *   canopy(+25) = buildBroadleafCanopyGeometry('asset_tree_celtis') +
 *               createBroadleafCanopyMaterials 成套（depth 挂载）；
 *   mid(+25)  = 同 seed 'mid' 档（midpoint 帧专用，与 canopy 同位双表示）。
 * 普通Mesh 各 1 棵直挂（无池）；aFadeOut 缺省 = 完整呈现（021.3 已证「带缓冲 0 ≡ 缺属性」
 * 位同，midpoint 帧双侧满呈现即缺省形态）。
 *
 * 环境域 = T018 day 真实链（照抄 021.3 / 021.6）：SkyCore(day) → PmremEnvironment 初烘 →
 * environmentIntensity 0.15 + day 太阳方向主光；uTime 恒 0（无 TimeUniformService——静态帧）。
 * **主光 castShadow + D29.1 冻结常量照抄 Renderer.ts 1030-1060**：mapSize 2048² /
 * ±160 / near 1 / far 400 / bias −0.0004 + PCFShadowMap + shadowMap.enabled（一个数不改）；
 * day 太阳 elevation 50.2° / azimuth 53.1° × LEGACY_SUN_DISTANCE ≈ 156.2 → 影长约 0.84×树高
 * （≈7.2m），三树位与影区均在 ±160 视锥内（横侧向最远 ≈ 21m）。
 *
 * window.__shadowSmoke 驱动面：
 *  - setOverview() / setDetail(rep) / setMidpoint('before'|'after'|'both') /
 *    setMidSingle() / setCulled()——每态同步渲染一帧并冻结机位；
 *  - probe()：页内像素探针——各目标树影区（世界域影足迹 = 树 bbox 沿光向投到 y=0 的
 *    外接矩形 → 屏幕域矩形）暗像素覆盖率 + 影区均值亮度 + 影内灰度标准差 + 影外亮底参考；
 *  - checksum() / regionChecksum(rect)：全帧 / 区域 FNV-1a（位同判据）；
 *  - stats()：渲染账目（drawCalls / triangles / programs）+ 策略表与挂载面快照 + console 捕获。
 */
import * as THREE from 'three';
import { buildCeltisGeometry } from '/src/runtime/procedural/tree/celtis/celtisGeometry';
import { CELTIS_SHAPE_PROFILES } from '/src/runtime/procedural/tree/celtis/celtisShapeProfile';
import {
  createCeltisBarkMaterial,
  createCeltisLeafMaterial,
  createCeltisLeafDepthMaterial,
} from '/src/runtime/procedural/tree/celtis/celtisMaterials';
import { buildBroadleafCanopyGeometry } from '/src/runtime/procedural/tree/broadleafCanopyProxy';
import { createBroadleafCanopyMaterials } from '/src/runtime/procedural/tree/broadleafCanopyMaterials';
import { shadowDepthMaterialOf } from '/src/runtime/instancing/InstancedAssetPool';
import type { InstanceSource } from '/src/runtime/instancing/InstancedAssetPool';
import { SHADOW_POLICY, isShadowCasterFor, shadowPolicyOf } from '/src/domain/lod/shadowPolicy';
import type { RuntimeRepresentation } from '/src/domain/lod/representation';
import { SkyCore } from '/src/runtime/environment/skyCore';
import { PmremEnvironment, LazyPmremBackend } from '/src/runtime/environment/pmremEnvironment';
import { environmentPresetOf, skyAtmosphereOfPreset } from '/src/runtime/environment/environmentPresets';
import { LEGACY_SUN_DISTANCE } from '/src/runtime/environment/sunDirection';
import { mulberry32 } from '/src/core/random';
import { morphSeedOf } from '/src/domain/assets';

const WIDTH = 1920;
const HEIGHT = 1080;
const ASSET_ID = 'asset_tree_celtis';
const SPACING = 25; // 三树间距（防影交叠——影长 ≈7.2m + 冠半径 < 25/2）
const X_HIGH = -SPACING;
const X_LOW = 0;
const X_PAIR = SPACING; // canopy 与 mid 同位（midpoint 双表示）

// 机位常量（detail 三帧同尺度口径；overview 全景）——首屏后按可视迭代定值
const DETAIL = { distance: 26, azimuthDeg: 140, elevationDeg: 24, tx: -1.5, ty: 2.2, tz: -1.1 };
const OVERVIEW = { distance: 62, azimuthDeg: 215, elevationDeg: 16, target: new THREE.Vector3(0, 4, 0) };

interface Rect { x0: number; y0: number; x1: number; y1: number }

/** 树装配（策略层直消费——cast/receive/depth 全部经 shadowPolicyOf / shadowDepthMaterialOf） */
interface TreeRig {
  rep: RuntimeRepresentation;
  mesh: THREE.Mesh;
  tris: number;
  /** 世界域 bbox（摆位后）——影足迹计算基准 */
  worldBox: THREE.Box3;
  /** 源提供的 customDepthMaterial cacheKey（low：提供但不挂的证据面） */
  sourceDepthKey: string;
  /** 实际挂载的 customDepthMaterial cacheKey（null = 未挂 → three 缺省实心深度） */
  mountedDepthKey: string | null;
}

function main(): void {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); // preserve：页内像素探针直读（先例同款）
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ── Shadow 全局开关（Renderer.ts 382-384 照抄：enabled + PCFShadowMap）──
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9db8d2'); // 纯色天空底（先例同款——不经 displaySky）

  // ── T018 day 环境链（照抄 021.3 / 021.6）──
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

  // ── 主光：day 太阳方向 × LEGACY_SUN_DISTANCE + D29.1 冻结常量（Renderer.ts 1036-1055 一个数不改）──
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
  sun.shadow.camera.updateProjectionMatrix(); // 显式定稿（r186 首帧建图时亦会执行——双保险）
  scene.add(sun, sun.target);

  // ── 地面（day groundColor 大平面，receiveShadow=true——影落读向底）──
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 8000),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(preset.groundColor), roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 1, 10000);

  /** 球坐标取景（view 语义：az 方位 / el 仰角，水平为 0——先例同式） */
  const frameCamera = (distance: number, azimuthDeg: number, elevationDeg: number, target: THREE.Vector3): void => {
    const az = (azimuthDeg * Math.PI) / 180;
    const el = (elevationDeg * Math.PI) / 180;
    camera.position.set(
      target.x + distance * Math.cos(el) * Math.sin(az),
      target.y + distance * Math.sin(el),
      target.z + distance * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(target);
  };
  const detailCamera = (bx: number, bz = 0): void =>
    frameCamera(DETAIL.distance, DETAIL.azimuthDeg, DETAIL.elevationDeg, new THREE.Vector3(bx + DETAIL.tx, DETAIL.ty, bz + DETAIL.tz));

  // ── 装配：celtis 三档 + canopy + mid（策略层直消费——每树 cast/receive/depth 全经交付原语）──
  const seed = morphSeedOf(ASSET_ID, 0); // slot-0 锚点（canopy 构建内部同种子同口径——同源形态）

  const makeCeltisRig = (rep: 'high' | 'mid' | 'low', x: number): TreeRig => {
    const built = buildCeltisGeometry(mulberry32(seed), CELTIS_SHAPE_PROFILES[0]!, rep);
    const materials: THREE.Material[] = [createCeltisBarkMaterial(rep), createCeltisLeafMaterial(rep)]; // 契约序 [皮, 叶]
    const sourceDepth = createCeltisLeafDepthMaterial(rep); // 源提供（low 也提供——「提供也不挂」验证面）
    const source: InstanceSource = {
      geometry: built.geometry,
      material: materials,
      customDepthMaterial: sourceDepth,
    };
    const mesh = new THREE.Mesh(built.geometry, materials);
    const depth = shadowDepthMaterialOf(rep, source); // ← 交付原语：depth 三档映射
    if (depth) mesh.customDepthMaterial = depth; // undefined 不赋值（three 缺省实心几何深度）
    const policy = shadowPolicyOf(rep); // ← 交付原语：cast / receive
    mesh.castShadow = policy.cast;
    mesh.receiveShadow = policy.receive;
    mesh.position.set(x, 0, 0);
    scene.add(mesh);
    built.geometry.computeBoundingBox();
    const bb = built.geometry.boundingBox!;
    const worldBox = new THREE.Box3(
      new THREE.Vector3(bb.min.x + x, bb.min.y, bb.min.z),
      new THREE.Vector3(bb.max.x + x, bb.max.y, bb.max.z),
    );
    return {
      rep,
      mesh,
      tris: built.stats.barkTriangles + built.stats.leafTriangles,
      worldBox,
      sourceDepthKey: sourceDepth.customProgramCacheKey(),
      mountedDepthKey: depth ? (depth.customProgramCacheKey ? depth.customProgramCacheKey() : '(no-key)') : null,
    };
  };

  const makeCanopyRig = (x: number): TreeRig => {
    const built = buildBroadleafCanopyGeometry(ASSET_ID); // 缺省 seed = morphSeedOf(id, 0) 同槽
    const set = createBroadleafCanopyMaterials(ASSET_ID);
    const source: InstanceSource = {
      geometry: built.geometry,
      material: set.materials,
      customDepthMaterial: set.depthMaterial,
    };
    const mesh = new THREE.Mesh(built.geometry, set.materials);
    const depth = shadowDepthMaterialOf('canopy', source); // ← simplified：canopy 挂专属轮廓级深度材质
    if (depth) mesh.customDepthMaterial = depth;
    const policy = shadowPolicyOf('canopy'); // cast=true / receive=false
    mesh.castShadow = policy.cast;
    mesh.receiveShadow = policy.receive;
    mesh.position.set(x, 0, 0);
    scene.add(mesh);
    built.geometry.computeBoundingBox();
    const bb = built.geometry.boundingBox!;
    const worldBox = new THREE.Box3(
      new THREE.Vector3(bb.min.x + x, bb.min.y, bb.min.z),
      new THREE.Vector3(bb.max.x + x, bb.max.y, bb.max.z),
    );
    return {
      rep: 'canopy',
      mesh,
      tris: built.stats.totalTriangles,
      worldBox,
      sourceDepthKey: set.depthMaterial.customProgramCacheKey(),
      mountedDepthKey: depth ? (depth.customProgramCacheKey ? depth.customProgramCacheKey() : '(no-key)') : null,
    };
  };

  const highRig = makeCeltisRig('high', X_HIGH);
  const lowRig = makeCeltisRig('low', X_LOW);
  const canopyRig = makeCanopyRig(X_PAIR);
  const midRig = makeCeltisRig('mid', X_PAIR);
  midRig.mesh.visible = false; // midpoint 帧专用（默认隐）

  const renderOnce = (): void => {
    renderer.render(scene, camera);
  };

  // ── 页内像素探针（2D canvas 直读——preserveDrawingBuffer；顶左原点）──
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = WIDTH;
  probeCanvas.height = HEIGHT;
  const pctx = probeCanvas.getContext('2d', { willReadFrequently: true })!;
  const frameData = (): ImageData => {
    renderOnce();
    pctx.clearRect(0, 0, WIDTH, HEIGHT);
    pctx.drawImage(renderer.domElement, 0, 0);
    return pctx.getImageData(0, 0, WIDTH, HEIGHT);
  };
  const lum = (r: number, g: number, b: number): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;

  /** 世界点 → 屏幕像素坐标 */
  const toScreen = (p: THREE.Vector3): { x: number; y: number } => {
    const ndc = p.clone().project(camera);
    return { x: ((ndc.x + 1) / 2) * WIDTH, y: ((1 - ndc.y) / 2) * HEIGHT };
  };

  /** 树 bbox 角点沿光向投到 y=0 的世界点（影足迹上限——凸包 ⊇ 实影） */
  const groundProject = (p: THREE.Vector3): THREE.Vector3 => {
    const t = p.y / sd.y;
    return new THREE.Vector3(p.x - sd.x * t, 0, p.z - sd.z * t);
  };

  /** 影足迹屏幕域矩形：树 bbox 8 角 ∪ 各角地面投影 的 xz 外接矩形 → 4 角投屏取整 bbox */
  const shadowRectOf = (rig: TreeRig): Rect => {
    const b = rig.worldBox;
    const pts: THREE.Vector3[] = [];
    for (const cx of [b.min.x, b.max.x]) {
      for (const cy of [b.min.y, b.max.y]) {
        for (const cz of [b.min.z, b.max.z]) {
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
    const rx0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.x))));
    const rx1 = Math.min(WIDTH - 1, Math.ceil(Math.max(...corners.map((c) => c.x))));
    const ry0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.y))));
    const ry1 = Math.min(HEIGHT - 1, Math.ceil(Math.max(...corners.map((c) => c.y))));
    return { x0: rx0, y0: ry0, x1: rx1, y1: ry1 };
  };

  /**
   * 亮底参考：无影地面锚点投影采样（24×12 邻域亮度中位数）。锚点 = 目标树影心 +
   * 相机右向 ×18m（影宽 ≤ 树冠 ~8m，18m 侧向恒在影外；detail 机位半宽 ≈21.5m 恒在
   * 画内）。色彩判别不可靠（IBL 冷调 b−r 判据失效）+ 固定世界点会出画（detail 机位
   * 实测）——几何锚点机位无关。出画回退左向 −18m。
   */
  const litGroundLum = (img: ImageData, anchor: THREE.Vector3): { median: number; samples: number } => {
    const d = img.data;
    const lums: number[] = [];
    const center = toScreen(anchor);
    for (let dy = -6; dy <= 6; dy += 2) {
      for (let dx = -12; dx <= 12; dx += 3) {
        const x = Math.round(center.x) + dx;
        const y = Math.round(center.y) + dy;
        if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) continue;
        const i = (y * WIDTH + x) * 4;
        lums.push(lum(d[i]!, d[i + 1]!, d[i + 2]!));
      }
    }
    if (lums.length === 0) return { median: -1, samples: 0 };
    lums.sort((a, b) => a - b);
    return { median: lums[lums.length >> 1]!, samples: lums.length };
  };

  /** 当前相机右向（水平化） */
  const cameraRightFlat = (): THREE.Vector3 => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    return new THREE.Vector3().crossVectors(dir, camera.up).setY(0).normalize();
  };

  /** 影区探针：暗像素覆盖率 + 影区均值亮度 + 影内灰度 σ + 影外亮底均值 */
  const probeRect = (img: ImageData, rect: Rect, threshold: number): unknown => {
    const d = img.data;
    let shadow = 0;
    let lit = 0;
    let shadowLumSum = 0;
    let shadowLumSq = 0;
    let litLumSum = 0;
    for (let y = rect.y0; y <= rect.y1; y++) {
      for (let x = rect.x0; x <= rect.x1; x++) {
        const i = (y * WIDTH + x) * 4;
        const l = lum(d[i]!, d[i + 1]!, d[i + 2]!);
        if (l < threshold) {
          shadow++;
          shadowLumSum += l;
          shadowLumSq += l * l;
        } else {
          lit++;
          litLumSum += l;
        }
      }
    }
    const total = shadow + lit;
    const mean = shadow > 0 ? shadowLumSum / shadow : 0;
    const variance = shadow > 0 ? Math.max(0, shadowLumSq / shadow - mean * mean) : 0;
    return {
      rect: { ...rect },
      pixels: total,
      shadowPixels: shadow,
      shadowCoverage: +(shadow / Math.max(1, total)).toFixed(4),
      meanShadowLum: +mean.toFixed(1),
      stdShadowLum: +Math.sqrt(variance).toFixed(1),
      meanLitLum: lit > 0 ? +(litLumSum / lit).toFixed(1) : 0,
    };
  };

  /** 探针主口：lit 参考自动采样（影心 + 相机右向 18m 锚，出画回退左向）+ 目标树影足迹逐 Rect 统计 */
  const probe = (reps: RuntimeRepresentation[]): unknown => {
    const img = frameData();
    const byRep = new Map<string, TreeRig>([
      ['high', highRig],
      ['mid', midRig],
      ['low', lowRig],
      ['canopy', canopyRig],
    ]);
    const rig0 = byRep.get(reps[0]!)!;
    const shadowCenter = groundProject(rig0.worldBox.getCenter(new THREE.Vector3()));
    const right = cameraRightFlat();
    let ref = litGroundLum(img, shadowCenter.clone().addScaledVector(right, 18));
    if (ref.samples === 0) ref = litGroundLum(img, shadowCenter.clone().addScaledVector(right, -18));
    const threshold = ref.median * 0.75;
    return {
      litGroundLumMedian: +ref.median.toFixed(1),
      litSamples: ref.samples,
      shadowThreshold: +threshold.toFixed(1),
      targets: reps.map((rep) => {
        const rig = byRep.get(rep)!;
        return { rep, visible: rig.mesh.visible, castShadow: rig.mesh.castShadow, ...probeRect(img, shadowRectOf(rig), threshold) };
      }),
    };
  };

  /** 全帧 FNV-1a（RGBA 字节）——位同判据（021.3 同式） */
  const checksumOf = (d: Uint8ClampedArray, rect?: Rect): string => {
    let h = 0x811c9dc5;
    const x0 = rect ? rect.x0 : 0;
    const y0 = rect ? rect.y0 : 0;
    const x1 = rect ? rect.x1 : WIDTH - 1;
    const y1 = rect ? rect.y1 : HEIGHT - 1;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = (y * WIDTH + x) * 4;
        h ^= d[i]!; h = Math.imul(h, 0x01000193);
        h ^= d[i + 1]!; h = Math.imul(h, 0x01000193);
        h ^= d[i + 2]!; h = Math.imul(h, 0x01000193);
        h ^= d[i + 3]!; h = Math.imul(h, 0x01000193);
      }
    }
    return (h >>> 0).toString(16);
  };
  const checksum = (): string => checksumOf(frameData().data);
  const regionChecksum = (rep: RuntimeRepresentation): unknown => {
    const rig = rep === 'high' ? highRig : rep === 'mid' ? midRig : rep === 'low' ? lowRig : canopyRig;
    const rect = shadowRectOf(rig);
    return { rep, rect, regionChecksum: checksumOf(frameData().data, rect) };
  };

  // ── 状态机（每态全量指定四树 visible + cast——帧间无残留）──
  let mode = 'init';
  const applySteady = (): void => {
    // 稳态：cast = policy(rep).cast（isShadowCasterFor 稳态式 shadowRepresentation === current）
    for (const rig of [highRig, midRig, lowRig, canopyRig]) {
      rig.mesh.castShadow = isShadowCasterFor(rig.rep, rig.rep);
      rig.mesh.receiveShadow = shadowPolicyOf(rig.rep).receive;
    }
  };
  const setOverview = (): unknown => {
    applySteady();
    highRig.mesh.visible = true;
    lowRig.mesh.visible = true;
    canopyRig.mesh.visible = true;
    midRig.mesh.visible = false;
    frameCamera(OVERVIEW.distance, OVERVIEW.azimuthDeg, OVERVIEW.elevationDeg, OVERVIEW.target);
    renderOnce();
    mode = 'overview';
    return { mode };
  };
  const setDetail = (rep: RuntimeRepresentation): unknown => {
    applySteady();
    highRig.mesh.visible = true;
    lowRig.mesh.visible = true;
    canopyRig.mesh.visible = true;
    midRig.mesh.visible = false;
    const bx = rep === 'high' ? X_HIGH : rep === 'low' ? X_LOW : X_PAIR;
    detailCamera(bx);
    renderOnce();
    mode = `detail-${rep}`;
    return { mode, cameraTargetX: bx };
  };
  /**
   * 中点切换摆位（TransitionCommit.shadowRepresentation 手工摆位，021.3 先例）：
   * mid + canopy 同位双表示、双侧满呈现（aFadeOut 缺省 0）——
   *  - before：shadowRepresentation = current = 'mid' → 恰 mid cast；
   *  - after：shadowRepresentation = target = 'canopy' → 恰 canopy cast；
   *  - both：双侧 cast（反事实标定帧——双影形态的对照样本，非生产语义）。
   */
  const setMidpoint = (phase: 'before' | 'after' | 'both'): unknown => {
    applySteady();
    highRig.mesh.visible = true;
    lowRig.mesh.visible = true;
    canopyRig.mesh.visible = true;
    midRig.mesh.visible = true;
    if (phase === 'both') {
      midRig.mesh.castShadow = true;
      canopyRig.mesh.castShadow = true;
    } else {
      const shadowRep: RuntimeRepresentation = phase === 'after' ? 'canopy' : 'mid';
      midRig.mesh.castShadow = isShadowCasterFor('mid', shadowRep);
      canopyRig.mesh.castShadow = isShadowCasterFor('canopy', shadowRep);
    }
    detailCamera(X_PAIR);
    renderOnce();
    mode = `midpoint-${phase}`;
    return {
      mode,
      midCast: midRig.mesh.castShadow,
      canopyCast: canopyRig.mesh.castShadow,
    };
  };
  /** mid 单侧参考（canopy 隐藏——mid 单 caster 的影形态基线，对比 midpoint-before） */
  const setMidSingle = (): unknown => {
    applySteady();
    highRig.mesh.visible = true;
    lowRig.mesh.visible = true;
    canopyRig.mesh.visible = false;
    midRig.mesh.visible = true;
    midRig.mesh.castShadow = shadowPolicyOf('mid').cast;
    detailCamera(X_PAIR);
    renderOnce();
    mode = 'mid-single';
    return { mode };
  };
  /** cull 终态（canopy visible=false 零提交 + CULLED_SHADOW_POLICY belt-and-braces）——地面无残影反向验证 */
  const setCulled = (): unknown => {
    applySteady();
    highRig.mesh.visible = true;
    lowRig.mesh.visible = true;
    midRig.mesh.visible = false;
    canopyRig.mesh.visible = false; // runtime 终态零提交机制（visible）
    canopyRig.mesh.castShadow = false; // CULLED_SHADOW_POLICY：cast/receive 一并置 false
    canopyRig.mesh.receiveShadow = false;
    detailCamera(X_PAIR); // 与 detail-canopy 同机位（像素可比）
    renderOnce();
    mode = 'culled';
    return { mode };
  };

  const renderLoop = (): void => {
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  };
  requestAnimationFrame(renderLoop);

  setOverview(); // 初始态 = 帧 1（overview）

  const rigSnap = (rig: TreeRig): unknown => ({
    rep: rig.rep,
    positionX: rig.mesh.position.x,
    visible: rig.mesh.visible,
    castShadow: rig.mesh.castShadow,
    receiveShadow: rig.mesh.receiveShadow,
    triangles: rig.tris,
    policy: shadowPolicyOf(rig.rep),
    sourceDepthKey: rig.sourceDepthKey,
    mountedDepthKey: rig.mountedDepthKey, // null = 未挂（three 缺省实心深度）
  });

  // ── 驱动面 ──
  (window as unknown as Record<string, unknown>).__shadowSmoke = {
    ready: true,
    assetId: ASSET_ID,
    seed,
    shadowConstants: {
      mapSize: '2048x2048',
      ortho: '+/-160',
      near: 1,
      far: 400,
      bias: -0.0004,
      type: 'PCFShadowMap',
      shadowMapEnabled: renderer.shadowMap.enabled,
      sunPosition: sun.position.toArray().map((v) => +v.toFixed(3)),
      sunDirectionUnit: [sd.x, sd.y, sd.z].map((v) => +v.toFixed(4)),
    },
    policyTable: { SHADOW_POLICY, culled: shadowPolicyOf('culled') },
    setOverview,
    setDetail,
    setMidpoint,
    setMidSingle,
    setCulled,
    probe,
    checksum,
    regionChecksum,
    debug: {
      cameraPos: (): number[] => camera.position.toArray().map((v) => +v.toFixed(2)),
      project: (x: number, y: number, z: number): number[] => {
        const s = toScreen(new THREE.Vector3(x, y, z));
        return [Math.round(s.x), Math.round(s.y)];
      },
      boxes: (): unknown => ({
        high: highRig.worldBox,
        mid: midRig.worldBox,
        low: lowRig.worldBox,
        canopy: canopyRig.worldBox,
      }),
    },
    stats: (): unknown => {
      renderer.info.reset();
      renderOnce();
      return {
        mode,
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        programs: renderer.info.programs?.length ?? 0,
        rigs: [rigSnap(highRig), rigSnap(midRig), rigSnap(lowRig), rigSnap(canopyRig)],
        errors: (window as unknown as Record<string, unknown>).__SHADOW_ERRORS,
        warnings: (window as unknown as Record<string, unknown>).__SHADOW_WARNINGS,
      };
    },
  };
}

main();
