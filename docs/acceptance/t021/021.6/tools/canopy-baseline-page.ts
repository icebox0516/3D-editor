/**
 * T021.6 canopy 13 树种冠形基线帧页（最小渲染 harness——几何 + canopy 材质，无 Runtime
 * 接线：不经 Renderer / SceneManager / InstancedAssetPool / SourceCache）。
 *
 * 环境域 = T018 真实链：SkyCore(day 预设大气) → PmremEnvironment(LazyPmremBackend) 初烘
 * → scene.environment / scene.environmentIntensity = preset.iblIntensity（canopy 材质
 * MeshStandardMaterial 族自动吃——§6.4 共享域取证面）；主光 = day 预设太阳方向 ×
 * LEGACY_SUN_DISTANCE 的 DirectionalLight(intensity 2.4)。相机 = 主 Renderer 同参
 * (fov 50 / near 1 / far 10000)。uTime 恒 0（静态基线帧——材质消费 aSeed=0 常数相位，
 * 风摆冻结在相位 0 的静态倾斜，可复现）。
 *
 * 机位（同源口径，13 树种同规则）：单树帧 = 球坐标 distance 60 / azimuth 35° /
 * elevation 8°，目标 = (0, 树高×0.55, 0)（逐树归一构图——冠形横向可比）；全景帧 =
 * 13 树 X 轴一行（间距 16m），相机沿 +Z 垂直正视，距离按总宽自适应贴合。
 *
 * window.__canopyBaseline 驱动面：show(assetId)（单树挂载 + 自取景 + 账目）/
 * panorama()（13 树全景）/ stats()（渲染与环境账目 + console 捕获）。
 */
import * as THREE from 'three';
import { buildBroadleafCanopyGeometry, BROADLEAF_CANOPY_ASSET_IDS } from '/src/runtime/procedural/tree/broadleafCanopyProxy';
import { createBroadleafCanopyMaterials } from '/src/runtime/procedural/tree/broadleafCanopyMaterials';
import { SkyCore } from '/src/runtime/environment/skyCore';
import { PmremEnvironment, LazyPmremBackend } from '/src/runtime/environment/pmremEnvironment';
import { environmentPresetOf, skyAtmosphereOfPreset } from '/src/runtime/environment/environmentPresets';
import { LEGACY_SUN_DISTANCE } from '/src/runtime/environment/sunDirection';

const WIDTH = 1920;
const HEIGHT = 1080;

interface FrameStats {
  assetId: string;
  triangles: number;
  crownSpanXZ: number;
  crownSpanY: number;
}

/** 挂载树（geometry + 材质套 + 深度材质——所有权归本页，clearAll 统一释放） */
interface MountedTree {
  mesh: THREE.Mesh;
  materials: THREE.Material[];
  depthMaterial: THREE.Material;
}

function main(): void {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); // preserve：页面内像素探针（绿色覆盖率）直读
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9db8d2'); // 纯色天空底（最小 harness——不经 displaySky 显示链）

  // ── T018 环境域（day 预设真实链）──
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

  // ── 主光（day 太阳：方向 × LEGACY_SUN_DISTANCE，强度 / 色同预设）──
  const sun = new THREE.DirectionalLight(preset.sun.color, preset.sun.intensity);
  const sd = sky.sunDirection;
  sun.position.set(sd.x * LEGACY_SUN_DISTANCE, sd.y * LEGACY_SUN_DISTANCE, sd.z * LEGACY_SUN_DISTANCE);
  sun.target.position.set(0, 0, 0);
  scene.add(sun, sun.target);

  // ── 地面（day groundColor 大平面——剪影 / 绿色覆盖率的读向底）──
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 8000),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(preset.groundColor), roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 1, 10000);

  // ── 挂载面（每次全新 geometry + 材质套；clearAll 统一 dispose——所有权归本页）──
  const group = new THREE.Group();
  scene.add(group);
  const mounted: MountedTree[] = [];

  const clearAll = (): void => {
    for (const tree of mounted) {
      group.remove(tree.mesh);
      tree.mesh.geometry.dispose();
      for (const m of tree.materials) m.dispose();
      tree.depthMaterial.dispose();
    }
    mounted.length = 0;
  };

  const mountTree = (assetId: string, x: number): FrameStats => {
    const built = buildBroadleafCanopyGeometry(assetId);
    const set = createBroadleafCanopyMaterials(assetId);
    const mesh = new THREE.Mesh(built.geometry, set.materials);
    mesh.customDepthMaterial = set.depthMaterial; // 深度材质同套挂载（无 shadow pass——仅验证挂载面零冲突）
    mesh.position.x = x;
    group.add(mesh);
    mounted.push({ mesh, materials: set.materials, depthMaterial: set.depthMaterial });
    return {
      assetId,
      triangles: built.stats.totalTriangles,
      crownSpanXZ: built.stats.crownSpanXZ,
      crownSpanY: built.stats.crownSpanY,
    };
  };

  /** 球坐标取景（view 语义：az 方位 / el 仰角，水平为 0） */
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

  /** 单树挂载 + 同源机位自取景（distance 60 / az 35° / el 8°，目标 = 树高×0.55） */
  const show = (assetId: string): FrameStats => {
    clearAll();
    const stats = mountTree(assetId, 0);
    const h = stats.crownSpanY > 0 ? stats.crownSpanY : 8;
    frameCamera(60, 35, 8, new THREE.Vector3(0, h * 0.55, 0));
    return stats;
  };

  /** 13 树全景（X 轴一行 16m 间距，+Z 垂直正视自适应贴合） */
  const panorama = (): { count: number; span: number; distance: number } => {
    clearAll();
    const spacing = 16;
    const n = BROADLEAF_CANOPY_ASSET_IDS.length;
    for (let i = 0; i < n; i++) mountTree(BROADLEAF_CANOPY_ASSET_IDS[i]!, (i - (n - 1) / 2) * spacing);
    const totalW = (n - 1) * spacing + 14;
    const hFov = 2 * Math.atan(Math.tan((50 * Math.PI) / 360) * (WIDTH / HEIGHT));
    const distance = (totalW / 2 + 8) / Math.tan(hFov / 2);
    frameCamera(distance, 0, 8, new THREE.Vector3(0, 5, 0));
    return { count: n, span: totalW, distance: Math.round(distance) };
  };

  const renderLoop = (): void => {
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  };
  requestAnimationFrame(renderLoop);

  // ── 驱动面 ──
  (window as unknown as Record<string, unknown>).__canopyBaseline = {
    ready: true,
    assetIds: BROADLEAF_CANOPY_ASSET_IDS,
    show,
    panorama,
    stats: (): unknown => ({
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      programs: renderer.info.programs?.length ?? 0,
      environment: scene.environment !== null,
      environmentIntensity: scene.environmentIntensity,
      errors: (window as unknown as Record<string, unknown>).__CANOPY_ERRORS,
      warnings: (window as unknown as Record<string, unknown>).__CANOPY_WARNINGS,
    }),
  };
}

main();
