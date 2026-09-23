// T018.2 增量视觉验证（D30 口径——非资产任务）：IBL 挂接探针 + 金属/GLB/路灯 env 反射
// 对照（018.0 同款注入对称取证）+ 预设循环 growth（PMREM RT 释放）+ 切换耗时 + p95。
// 改前对照源 = docs/acceptance/t018/018.0/（视觉/性能）；p95 直接对照 = 018.1 实测 4.50ms。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, enableConsole }) => {
  await enableConsole();
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const log = {};

  // ── ① IBL 挂接探针：scene.environment = PMREM RT 纹理 + mapping + intensity ──
  // CubeUVReflectionMapping = 306（three 常量表）；RT texture.image 携 PMREM mip 面尺寸
  await evalJs(`window.__tree3a.freezeTime()`);
  log.ibl = await evalJs(`(() => {
    const env = window.__envProbe.scene.environment;
    const tex = env && env.isTexture ? env : null;
    return {
      environmentNull: env === null || env === undefined,
      isTexture: !!tex,
      mapping: tex ? tex.mapping : null,
      cubeUVMapping: tex ? tex.mapping === 306 : false,
      environmentIntensity: window.__envProbe.scene.environmentIntensity,
      imageWidth: tex && tex.image ? tex.image.width : null,
    };
  })()`);

  // ── ② 金属三球（018.0 同款注入：metalness=1 × roughness 0.15/0.45/0.75，r=0.5 @ x=-1.4/0/1.4）
  //    对照 018.0 day/night-metal（无 env：金属近乎黑 + 直射高光点）→ 本帧应见天空色反射 ──
  await evalJs(`(async () => {
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
    (window.__t0182_injected ??= []).push(group);
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return true;
  })()`);
  await sleep(900);
  for (const p of ['day', 'dusk', 'night', 'tech']) {
    await evalJs(`window.__envProbe.setPreset('${p}')`);
    await sleep(700);
    await screenshot(`../${p}-metal-ibl.png`);
  }
  // IBL 开关对照（同机位 day，environmentIntensity 1 → 0 → 1）：反射差分归因 IBL（非直射光）
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(700);
  await screenshot(`../day-metal-ibl.png`);
  await evalJs(`(() => { window.__envProbe.scene.environmentIntensity = 0; return true; })()`);
  await sleep(600);
  await screenshot(`../day-metal-ibl-off.png`);
  await evalJs(`(() => { window.__envProbe.scene.environmentIntensity = 1; return true; })()`);

  // ── ③ GLB 注入（018.0 同款：sensor.glb 归一化 1.2m 高 @ 原点，机位 (3.2,1.1,3.6)→(0,0.6,0)）──
  await evalJs(`(async () => { for (const o of (window.__t0182_injected ?? [])) o.removeFromParent(); window.__t0182_injected = []; })()`);
  await evalJs(`(async () => {
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
    (window.__t0182_injected ??= []).push(gltf.scene);
    const { camera, controls } = window.__envProbe;
    camera.position.set(3.2, 1.1, 3.6); controls.target.set(0, 0.6, 0); controls.update();
    return true;
  })()`);
  await sleep(900);
  for (const p of ['day', 'night']) {
    await evalJs(`window.__envProbe.setPreset('${p}')`);
    await sleep(700);
    await screenshot(`../${p}-glb-ibl.png`);
  }

  // ── ④ 路灯（产品路径 place；机位 12 / 35° / 6°，对照 018.0 day-streetlamp）──
  await evalJs(`(async () => { for (const o of (window.__t0182_injected ?? [])) o.removeFromParent(); window.__t0182_injected = []; })()`);
  await evalJs(`window.__tree3aPerf.place({ count: 1, seedBase: 1, spacing: 11, jitter: false, assetId: 'asset_streetlamp' }); window.__tree3aPerf.view({ distance: 12, azimuthDeg: 35, elevationDeg: 6 })`);
  await sleep(900);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(700);
  await screenshot(`../day-streetlamp-ibl.png`);
  await evalJs(`window.__tree3aPerf.clear()`);

  // ── ⑤ 预设循环 growth（018.0/018.1 同协议 10 轮：PMREM RT 新建/释放平衡 → tex 零增长）──
  await sleep(500);
  const marks = [];
  for (let i = 0; i < 10; i++) {
    await evalJs(`window.__envProbe.setPreset(${i % 2 ? "'dusk'" : "'day'"})`);
    await sleep(400);
    marks.push(await evalJs(`(() => { const x = window.__envProbe.info(); return { geo: x.memory.geometries, tex: x.memory.textures, prog: x.programs }; })()`));
  }
  log.growth10 = marks;

  // ── ⑥ 切换耗时（含整组重建 + PMREM 初烘 + generator 重编译——用户可感知口径；
  //    epic 验收第 10 条 PMREM 单次 ≤100ms 参考门的量级对照）──
  const switchTimes = [];
  for (let i = 0; i < 8; i++) {
    const t = await evalJs(`(() => {
      const t0 = performance.now();
      window.__envProbe.setPreset(${i % 2 ? "'day'" : "'dusk'"});
      return performance.now() - t0;
    })()`);
    switchTimes.push(t);
    await sleep(350);
  }
  log.switchTimesMs = switchTimes;

  // ── ⑦ p95 抽检（day × 1000 棵，vsync-off 5000ms；对照 018.1 实测 4.50ms / 018.0 基线 4.40ms）──
  await evalJs(`window.__tree3a.unfreezeTime()`);
  await evalJs(`window.__tree3aPerf.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
  await sleep(1200);
  log.perf1000Day = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
  await evalJs(`window.__tree3aPerf.clear()`);

  return log;
};
