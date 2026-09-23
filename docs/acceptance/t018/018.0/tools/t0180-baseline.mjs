// T018.0 Preflight Baseline —— legacy 渐变天空环境的唯一改前基线（D31.7）
// 产出：① 四预设 × 六主体（夏栎/朴/樟/路灯/GLB sensor/金属球组）固定机位 PNG
//       ② 帧时 p95（四预设 × {空场景, 100 棵夏栎}，vsync-off 口径 5000ms 采样）
//       ③ renderer.info 资源账目 + 运行时太阳/环境灯参数实测（代码表核对）
// 驱动：__envProbe（setPreset 产品路径 / scene 注入 / info）+ __tree3aPerf（产品放置路径
// place/view/clear + sampleFrames）+ __tree3a.freezeTime（风相位确定性）。
// 018.5 新旧视觉对比 / FrameTime Δ / 资源账目以本目录为唯一改前源。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const log = {};

  // 前置：探针可用性（金丝雀——探针缺失即中止，不产出半套基线）
  log.probe = await evalJs(`(() => ({
    envProbe: !!window.__envProbe, tree3aPerf: !!window.__tree3aPerf, tree3a: !!window.__tree3a,
    url: location.href,
  }))()`);
  if (!log.probe.envProbe || !log.probe.tree3aPerf) throw new Error('DEV probes missing: ' + JSON.stringify(log.probe));

  log.env = await evalJs(`(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      viewport: [window.innerWidth, window.innerHeight], dpr: window.devicePixelRatio,
      fov: window.__envProbe.camera.fov,
      initialPreset: 'day (default scene)',
    };
  })()`);

  const PRESETS = ['day', 'dusk', 'night', 'tech'];
  const setPreset = (p) => evalJs(`window.__envProbe.setPreset('${p}')`);

  // ── ① 空场景态：灯位实测 + renderer.info（代码参数表的运行时核对）──
  await evalJs(`window.__tree3aPerf.clear()`);
  await sleep(600);
  log.lights = {};
  log.info = {};
  for (const p of PRESETS) {
    await setPreset(p);
    await sleep(800);
    log.lights[p] = await evalJs(`(() => {
      const out = { directional: null, hemisphere: null };
      window.__envProbe.scene.traverse((n) => {
        if (n && n.isDirectionalLight && !out.directional) {
          out.directional = { position: [n.position.x, n.position.y, n.position.z], color: '#' + n.color.getHexString(), intensity: n.intensity, castShadow: n.castShadow, mapSize: [n.shadow.mapSize.x, n.shadow.mapSize.y], bias: n.shadow.bias };
        }
        if (n && n.isHemisphereLight && !out.hemisphere) {
          out.hemisphere = { sky: '#' + n.color.getHexString(), ground: '#' + n.groundColor.getHexString(), intensity: n.intensity };
        }
      });
      return out;
    })()`);
    log.info[p] = await evalJs(`window.__envProbe.info()`);
  }

  // ── ② 四预设 × 六主体固定机位快照（主体外环：布置一次，预设内环切换）──
  log.shots = [];
  const shot = async (subject, preset) => {
    const path = await screenshot(`../${preset}-${subject}.png`);
    log.shots.push(`${preset}-${subject}.png`);
    return path;
  };

  // 风相位确定性：冻结全局 uTime 后再放置/注入
  await evalJs(`window.__tree3a.freezeTime()`);

  const treeSubjects = [
    { id: 'asset_tree_3a', name: 'tree3a', view: `{ distance: 25, azimuthDeg: 35, elevationDeg: 8 }` },
    { id: 'asset_tree_celtis', name: 'celtis', view: `{ distance: 25, azimuthDeg: 35, elevationDeg: 8 }` },
    { id: 'asset_tree_camphor', name: 'camphor', view: `{ distance: 25, azimuthDeg: 35, elevationDeg: 8 }` },
    { id: 'asset_streetlamp', name: 'streetlamp', view: `{ distance: 12, azimuthDeg: 35, elevationDeg: 6 }` },
  ];
  for (const t of treeSubjects) {
    await evalJs(`(async () => {
      window.__tree3aPerf.clear();
      window.__tree3aPerf.place({ count: 1, seedBase: 1, spacing: 11, jitter: false, assetId: '${t.id}' });
      window.__tree3aPerf.view(${t.view});
      return true;
    })()`);
    await sleep(900);
    for (const p of PRESETS) {
      await setPreset(p);
      await sleep(700);
      await shot(t.name, p);
    }
  }
  await evalJs(`window.__tree3aPerf.clear()`);

  // GLB 注入（sensor.glb 归一化到 1.2m 高 @ 原点）——产品路径不走命令注入，取证注入与 018.5 对称复用
  log.glb = await evalJs(`(async () => {
    const { GLTFLoader } = await import('/node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js');
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/assets/models/device/sensor.glb');
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const scale = 1.2 / size.y;
    gltf.scene.scale.setScalar(scale);
    gltf.scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    gltf.scene.traverse((n) => { if (n.isMesh) n.castShadow = true; });
    window.__envProbe.scene.add(gltf.scene);
    (window.__t0180_injected ??= []).push(gltf.scene);
    return { sourceSize: [size.x, size.y, size.z], scale, meshes: (window.__t0180_injected[0].children ?? []).length };
  })()`);
  await evalJs(`(() => {
    const { camera, controls } = window.__envProbe;
    camera.position.set(3.2, 1.1, 3.6); controls.target.set(0, 0.6, 0); controls.update();
  })()`);
  await sleep(900);
  for (const p of PRESETS) {
    await setPreset(p);
    await sleep(700);
    await shot('glb', p);
  }

  // 金属参照组（metalness=1 × roughness 0.15/0.45/0.75 三球，白噪底反射可辨）
  log.metal = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const group = new THREE.Group();
    [0.15, 0.45, 0.75].forEach((roughness, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 48, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness }),
      );
      m.position.set((i - 1) * 1.4, 0.5, 0);
      m.castShadow = true;
      group.add(m);
    });
    window.__envProbe.scene.add(group);
    (window.__t0180_injected ??= []).push(group);
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return { spheres: 3, roughness: [0.15, 0.45, 0.75], metalness: 1 };
  })()`);
  await sleep(900);
  for (const p of PRESETS) {
    await setPreset(p);
    await sleep(700);
    await shot('metal', p);
  }

  // ── ③ 帧时 p95 基线（vsync-off；四预设 × {空场景, 100 棵夏栎}）──
  await evalJs(`(async () => {
    for (const obj of (window.__t0180_injected ?? [])) obj.removeFromParent();
    window.__t0180_injected = [];
    window.__tree3aPerf.clear();
    window.__tree3a.unfreezeTime();
    return true;
  })()`);
  await sleep(600);
  log.perf = {};
  for (const p of PRESETS) {
    await setPreset(p);
    await sleep(900);
    const empty = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    await evalJs(`window.__tree3aPerf.place({ count: 100, seedBase: 1, spacing: 11, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
    await sleep(1200);
    const trees100 = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    log.perf[p] = { empty, trees100, stats100: await evalJs(`window.__tree3aPerf.stats()`) };
  }
  await evalJs(`window.__tree3aPerf.clear()`);

  return log;
};
