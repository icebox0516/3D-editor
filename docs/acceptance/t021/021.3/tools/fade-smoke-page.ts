/**
 * T021.3 过渡 dither 材质面冒烟页（最小渲染 harness——InstancedMesh 真实消费路径，
 * 无 Runtime 接线：不经 Renderer / SceneManager / InstancedAssetPool / SourceCache）。
 *
 * 验证对象（021.3 交付面）：
 *  - runtime/instancing/fadeGeometry 的 aFadeOut 属性缝（本页按契约直挂 InstancedMesh 的
 *    geometry：InstancedBufferAttribute / Float32 / itemSize 1 / 非 normalized /
 *    DynamicDrawUsage——单实例桶的最小消费形态，不建 FadeGeometryPool 包装〔几何不共享，
 *    池语义非本页验证面〕）；
 *  - runtime/procedural/tree/treeFadeDither 注入（工厂内已自动应用：celtis 叶/皮 = direct 侧，
 *    canopy card/trunk = mirrored 侧——本页零手动注入，纯消费）。
 *
 * 场景 = celtis（朴树）LOW 档整树（皮+叶成套材质 + 叶影深度材质挂载面）与同位 canopy
 * （broadleafCanopyProxy 几何 + broadleafCanopyMaterials 成套）同原点 (0,0,0) 摆放。
 * 环境域 = T018 真实链（照抄 021.6 canopy-baseline 页）：SkyCore(day 预设大气) →
 * PmremEnvironment 初烘 → scene.environment / environmentIntensity = preset.iblIntensity；
 * 主光 = day 太阳方向 × LEGACY_SUN_DISTANCE 的 DirectionalLight；uTime 恒 0（静态帧）。
 * 机位照抄 021.6 单树口径：球坐标 distance 60 / azimuth 35° / elevation 8°，
 * 目标 = (0, 树高×0.55, 0)——树高取 low 档几何 bbox 高，**全部帧共用同一机位**（像素级
 * 帧间可比的前提）。
 *
 * window.__fadeSmoke 驱动面：
 *  - setFade(p)：low 树单独，aFadeOut = p（Low→Cull 退场路径；p=0 即零回退参考态）
 *  - setCrossfade(p)：low 树 fade=p（direct）+ 同位 canopy fade=1−p（mirrored）——
 *    dither 交叉（p=0.25/0.5/0.75）
 *  - setCanopyOnly(p)：canopy 单独，aFadeOut = p（incoming 单侧参考 / 50% 单侧证据帧）
 *  - setNoBuffer(side)：删除该侧 geometry 的 aFadeOut 属性（GL 顶点属性缺省 0 路径——
 *    零回退「缺属性 = 完整呈现」契约的像素级验证态）
 *  - zeroFallback(side)：页内自动跑「带缓冲 0 vs 缺属性」全帧校验和对比（位同 = 逐像素一致）
 *  - probe()：当前帧像素探针——全帧绿色覆盖率（021.6 同式）+ 树冠区域覆盖率（区域 = 启动时
 *    low(fade 0) 与 canopy(fade 0) 两参考帧绿色像素 bbox 的并集，页内先算后冻结）
 *  - stats()：渲染账目（drawCalls / triangles / programs / memory）+ 挂载材质参数快照
 *    （零回退「材质参数未动」证据）+ console 捕获
 *  - checksum()：全帧 FNV-1a（RGBA）——任意两态位同即逐像素一致
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
import { FADE_ATTRIBUTE } from '/src/runtime/instancing/fadeGeometry';
import { SkyCore } from '/src/runtime/environment/skyCore';
import { PmremEnvironment, LazyPmremBackend } from '/src/runtime/environment/pmremEnvironment';
import { environmentPresetOf, skyAtmosphereOfPreset } from '/src/runtime/environment/environmentPresets';
import { LEGACY_SUN_DISTANCE } from '/src/runtime/environment/sunDirection';
import { mulberry32 } from '/src/core/random';
import { morphSeedOf } from '/src/domain/assets';

const WIDTH = 1920;
const HEIGHT = 1080;
const ASSET_ID = 'asset_tree_celtis';

interface BBox { x0: number; y0: number; x1: number; y1: number }

function main(): void {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); // preserve：页内像素探针直读（021.6 同款）
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9db8d2'); // 纯色天空底（同 021.6——不经 displaySky 显示链）

  // ── T018 环境域（day 预设真实链——照抄 021.6）──
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

  const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 1, 10000);

  /** 球坐标取景（view 语义：az 方位 / el 仰角，水平为 0——021.6 同式） */
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

  // ── 装配：celtis LOW 整树 + 同位 canopy（InstancedMesh 真实消费路径，各 1 实例）──
  const seed = morphSeedOf(ASSET_ID, 0); // slot-0 锚点（canopy 构建内部同种子同口径——同源形态）
  const lowBuilt = buildCeltisGeometry(mulberry32(seed), CELTIS_SHAPE_PROFILES[0]!, 'low');
  const lowMaterials = [createCeltisBarkMaterial('low'), createCeltisLeafMaterial('low')]; // 契约序 [皮, 叶]
  const lowDepth = createCeltisLeafDepthMaterial('low');
  const lowTree = new THREE.InstancedMesh(lowBuilt.geometry, lowMaterials, 1);
  lowTree.setMatrixAt(0, new THREE.Matrix4()); // 实例矩阵 = 单位阵（原点摆位）
  lowTree.instanceMatrix.needsUpdate = true;
  lowTree.customDepthMaterial = lowDepth; // 深度材质同套挂载面（无 shadow pass——挂载零冲突验证，021.6 同款）
  scene.add(lowTree);

  const canopyBuilt = buildBroadleafCanopyGeometry(ASSET_ID); // 缺省 seed = morphSeedOf(id, 0) 同槽
  const canopySet = createBroadleafCanopyMaterials(ASSET_ID);
  const canopy = new THREE.InstancedMesh(canopyBuilt.geometry, canopySet.materials, 1);
  canopy.setMatrixAt(0, new THREE.Matrix4());
  canopy.instanceMatrix.needsUpdate = true;
  canopy.customDepthMaterial = canopySet.depthMaterial;
  scene.add(canopy);

  // aFadeOut 属性缝（fadeGeometry 契约：Float32 / itemSize 1 / 非 normalized / DynamicDrawUsage）
  const makeFadeBuffer = (): THREE.InstancedBufferAttribute => {
    const buffer = new THREE.InstancedBufferAttribute(new Float32Array(1), 1);
    buffer.setUsage(THREE.DynamicDrawUsage);
    return buffer;
  };
  const lowFade = makeFadeBuffer();
  const canopyFade = makeFadeBuffer();
  lowBuilt.geometry.setAttribute(FADE_ATTRIBUTE, lowFade);
  canopyBuilt.geometry.setAttribute(FADE_ATTRIBUTE, canopyFade);

  /** 写退场度（值变化才写 + needsUpdate——writeFadeRange 纪律的最小形态） */
  const writeFade = (buffer: THREE.InstancedBufferAttribute, p: number): void => {
    (buffer.array as Float32Array)[0] = p;
    buffer.needsUpdate = true;
  };

  // 机位冻结：树高 = low 档 bbox 高（全部帧共用——帧间像素可比前提）
  lowBuilt.geometry.computeBoundingBox();
  const bb = lowBuilt.geometry.boundingBox!;
  const treeH = bb.max.y - bb.min.y;
  frameCamera(60, 35, 8, new THREE.Vector3(0, treeH * 0.55, 0));

  const renderOnce = (): void => {
    renderer.render(scene, camera);
  };

  // ── 页内像素探针（2D canvas 直读——preserveDrawingBuffer；顶左原点）──
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = WIDTH;
  probeCanvas.height = HEIGHT;
  const pctx = probeCanvas.getContext('2d', { willReadFrequently: true })!;
  const frameData = (): ImageData => {
    renderOnce(); // 探针前强制同步渲染一帧（状态刚改即读的确定性）
    pctx.clearRect(0, 0, WIDTH, HEIGHT);
    pctx.drawImage(renderer.domElement, 0, 0);
    return pctx.getImageData(0, 0, WIDTH, HEIGHT);
  };

  /** 021.6 绿色判据同式：G>R×1.08 ∧ G>B×1.08 ∧ G>40 */
  const isGreen = (r: number, g: number, b: number): boolean => g > r * 1.08 && g > b * 1.08 && g > 40;

  /** 绿色像素 bbox（无绿色返回 null） */
  const greenBBox = (img: ImageData): BBox | null => {
    const d = img.data;
    let x0 = WIDTH, y0 = HEIGHT, x1 = -1, y1 = -1;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const i = (y * WIDTH + x) * 4;
        if (isGreen(d[i]!, d[i + 1]!, d[i + 2]!)) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    return x1 < 0 ? null : { x0, y0, x1, y1 };
  };

  // ── 树冠区域冻结（low(fade 0) 与 canopy(fade 0) 两参考帧绿色 bbox 并集 + 8px 余量）──
  lowTree.visible = true;
  canopy.visible = false;
  writeFade(lowFade, 0);
  writeFade(canopyFade, 0);
  renderOnce();
  const lowBBox = greenBBox(frameData());
  lowTree.visible = false;
  canopy.visible = true;
  renderOnce();
  const canopyBBox = greenBBox(frameData());
  const boxes = [lowBBox, canopyBBox].filter((b): b is BBox => b !== null);
  if (boxes.length === 0) throw new Error('冒烟初始化失败：两参考帧均无绿色像素');
  const M = 8;
  const crownRegion: BBox = {
    x0: Math.max(0, Math.min(...boxes.map((b) => b.x0)) - M),
    y0: Math.max(0, Math.min(...boxes.map((b) => b.y0)) - M),
    x1: Math.min(WIDTH - 1, Math.max(...boxes.map((b) => b.x1)) + M),
    y1: Math.min(HEIGHT - 1, Math.max(...boxes.map((b) => b.y1)) + M),
  };

  /** 背景参考色（从 fade-0 参考帧实测采样：顶中 = 天空底色，左下 = 地面） */
  lowTree.visible = true;
  canopy.visible = false;
  const refImg = frameData();
  const pxAt = (img: ImageData, x: number, y: number): [number, number, number] => {
    const i = (y * WIDTH + x) * 4;
    return [img.data[i]!, img.data[i + 1]!, img.data[i + 2]!];
  };
  const skyRef = pxAt(refImg, WIDTH >> 1, 4);
  const groundRef = pxAt(refImg, 4, HEIGHT - 4);

  /** 探针：全帧绿色覆盖率 + 树冠区域树体覆盖率（非天空/非地面像素占比） */
  const probe = (): unknown => {
    const img = frameData();
    const d = img.data;
    let green = 0;
    for (let i = 0; i < d.length; i += 4) if (isGreen(d[i]!, d[i + 1]!, d[i + 2]!)) green++;
    let regionTree = 0;
    let regionTotal = 0;
    for (let y = crownRegion.y0; y <= crownRegion.y1; y++) {
      for (let x = crownRegion.x0; x <= crownRegion.x1; x++) {
        const i = (y * WIDTH + x) * 4;
        const r = d[i]!, g = d[i + 1]!, b = d[i + 2]!;
        const skyDist = Math.abs(r - skyRef[0]) + Math.abs(g - skyRef[1]) + Math.abs(b - skyRef[2]);
        const groundDist = Math.abs(r - groundRef[0]) + Math.abs(g - groundRef[1]) + Math.abs(b - groundRef[2]);
        regionTotal++;
        if (skyDist > 30 && groundDist > 30) regionTree++; // 树体像素（绿/皮/AA 边一致口径）
      }
    }
    return {
      greenCoverage: +(green / (WIDTH * HEIGHT)).toFixed(6),
      crownRegion: { ...crownRegion },
      regionPixels: regionTotal,
      regionTreeCoverage: +(regionTree / regionTotal).toFixed(4),
      skyRef,
      groundRef,
    };
  };

  /** 全帧 FNV-1a（RGBA 字节）——位同判据 */
  const checksum = (): string => {
    const d = frameData().data;
    let h = 0x811c9dc5;
    for (let i = 0; i < d.length; i++) {
      h ^= d[i]!;
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16);
  };

  // ── 驱动面状态函数（每态同步渲染一帧）──
  let mode = 'fade-low-000';
  const setFade = (p: number): unknown => {
    lowTree.visible = true;
    canopy.visible = false;
    if (!lowBuilt.geometry.getAttribute(FADE_ATTRIBUTE)) lowBuilt.geometry.setAttribute(FADE_ATTRIBUTE, lowFade);
    writeFade(lowFade, p);
    renderOnce();
    mode = `low-only fade=${p}`;
    return { mode, lowFade: p, canopy: 'hidden' };
  };
  const setCrossfade = (p: number): unknown => {
    lowTree.visible = true;
    canopy.visible = true;
    if (!lowBuilt.geometry.getAttribute(FADE_ATTRIBUTE)) lowBuilt.geometry.setAttribute(FADE_ATTRIBUTE, lowFade);
    if (!canopyBuilt.geometry.getAttribute(FADE_ATTRIBUTE)) canopyBuilt.geometry.setAttribute(FADE_ATTRIBUTE, canopyFade);
    writeFade(lowFade, p);
    writeFade(canopyFade, 1 - p); // 互补恒和 1（dither 交叉语义）
    renderOnce();
    mode = `crossfade p=${p}`;
    return { mode, lowFade: p, canopyFade: 1 - p };
  };
  const setCanopyOnly = (p: number): unknown => {
    lowTree.visible = false;
    canopy.visible = true;
    if (!canopyBuilt.geometry.getAttribute(FADE_ATTRIBUTE)) canopyBuilt.geometry.setAttribute(FADE_ATTRIBUTE, canopyFade);
    writeFade(canopyFade, p);
    renderOnce();
    mode = `canopy-only fade=${p}`;
    return { mode, lowFade: 'hidden', canopyFade: p };
  };
  /** 删 aFadeOut 属性 → GL 顶点属性缺省 0（「缺属性 = 完整呈现」零回退契约验证态） */
  const setNoBuffer = (side: 'low' | 'canopy'): unknown => {
    if (side === 'low') {
      lowTree.visible = true;
      canopy.visible = false;
      lowBuilt.geometry.deleteAttribute(FADE_ATTRIBUTE);
      renderOnce();
      mode = 'low-only no-aFadeOut (GL default 0)';
    } else {
      lowTree.visible = false;
      canopy.visible = true;
      canopyBuilt.geometry.deleteAttribute(FADE_ATTRIBUTE);
      renderOnce();
      mode = 'canopy-only no-aFadeOut (GL default 0)';
    }
    return { mode };
  };
  /** 零回退位同校验：带缓冲值 0 vs 缺属性（GL 缺省 0）→ 逐像素一致即 PASS */
  const zeroFallback = (side: 'low' | 'canopy'): unknown => {
    if (side === 'low') {
      setFade(0);
      const withBuffer = checksum();
      setNoBuffer('low');
      const withoutBuffer = checksum();
      setFade(0); // 复位（截图态）
      return { side, withBuffer, withoutBuffer, bitIdentical: withBuffer === withoutBuffer };
    }
    setCanopyOnly(0);
    const withBuffer = checksum();
    setNoBuffer('canopy');
    const withoutBuffer = checksum();
    setCanopyOnly(0);
    return { side: 'canopy', withBuffer, withoutBuffer, bitIdentical: withBuffer === withoutBuffer };
  };

  // ── 材质参数快照（零回退「材质参数未动」证据）──
  const matSnap = (m: THREE.Material): unknown => {
    const s = m as THREE.MeshStandardMaterial;
    return {
      cacheKey: m.customProgramCacheKey ? m.customProgramCacheKey() : '(none)',
      color: s.color ? '#' + s.color.getHexString() : undefined,
      alphaTest: s.alphaTest,
      alphaToCoverage: s.alphaToCoverage,
      side: s.side === THREE.FrontSide ? 'Front' : s.side === THREE.DoubleSide ? 'Double' : String(s.side),
      roughness: s.roughness,
      metalness: s.metalness,
    };
  };

  const renderLoop = (): void => {
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  };
  requestAnimationFrame(renderLoop);

  setFade(0); // 初始态 = 帧 1（fade-low-000 零回退参考帧）

  // ── 驱动面 ──
  (window as unknown as Record<string, unknown>).__fadeSmoke = {
    ready: true,
    assetId: ASSET_ID,
    seed,
    treeHeight: +treeH.toFixed(3),
    lowTriangles: lowBuilt.stats.barkTriangles + lowBuilt.stats.leafTriangles,
    canopyTriangles: canopyBuilt.stats.totalTriangles,
    camera: { distance: 60, azimuthDeg: 35, elevationDeg: 8, target: [0, +(treeH * 0.55).toFixed(3), 0] },
    setFade,
    setCrossfade,
    setCanopyOnly,
    setNoBuffer,
    zeroFallback,
    probe,
    checksum,
    stats: (): unknown => ({
      mode,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      programs: renderer.info.programs?.length ?? 0,
      memoryGeometries: renderer.info.memory.geometries,
      memoryTextures: renderer.info.memory.textures,
      environment: scene.environment !== null,
      environmentIntensity: scene.environmentIntensity,
      materials: {
        lowTree: lowMaterials.map(matSnap),
        lowDepth: matSnap(lowDepth),
        canopyTrunk: matSnap(canopySet.trunkMaterial),
        canopyCard: matSnap(canopySet.cardMaterial),
        canopyDepth: matSnap(canopySet.depthMaterial),
      },
      errors: (window as unknown as Record<string, unknown>).__FADE_ERRORS,
      warnings: (window as unknown as Record<string, unknown>).__FADE_WARNINGS,
    }),
  };
}

main();
