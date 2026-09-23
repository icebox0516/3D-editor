// T018.5 验收取证①：四预设 × 六主体固定机位新侧快照（018.0 同款协议对称取证）
// + 新表值接线 live 确认 + 冻结云双帧（epic 验收第 12 条视觉侧）+ renderMode clay 抽查
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const log = { probe: await evalJs(`(() => ({
    envProbe: !!window.__envProbe, tree3aPerf: !!window.__tree3aPerf, tree3a: !!window.__tree3a, sky: !!window.__sky,
  }))()`) };
  if (!log.probe.envProbe || !log.probe.tree3aPerf || !log.probe.sky) throw new Error('probes missing');

  const PRESETS = ['day', 'dusk', 'night', 'tech'];
  const setPreset = (p) => evalJs(`window.__envProbe.setPreset('${p}')`);

  // 新表值接线 live 确认（每预设 params 读回 displayIntensity/iblIntensity）
  log.presetParams = {};
  for (const p of PRESETS) {
    await setPreset(p);
    await sleep(700);
    log.presetParams[p] = await evalJs(`(() => {
      const q = window.__sky.params();
      return { displayIntensity: q.displayIntensity, iblIntensity: q.iblIntensity, sun: [q.sun.elevationDeg, +q.sun.azimuthDeg.toFixed(2)], mode: window.__sky.mode };
    })()`);
  }

  // ── 四预设 × 六主体（主体外环一次布置，预设内环切换）──
  log.shots = [];
  const shot = async (subject, preset) => {
    await screenshot(`../${preset}-${subject}.png`);
    log.shots.push(`${preset}-${subject}.png`);
  };
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

  // GLB 注入（018.0 同款：sensor.glb 归一化 1.2m @ 原点，机位 (3.2,1.1,3.6)→(0,0.6,0)）
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
    (window.__t0185_injected ??= []).push(gltf.scene);
    return { sourceSize: [size.x, size.y, size.z], scale };
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

  // 金属参照组（018.0 同款：metalness 1 × roughness 0.15/0.45/0.75，机位 (0,1.1,5.2)→(0,0.55,0)）
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
    (window.__t0185_injected ??= []).push(group);
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return { spheres: 3 };
  })()`);
  await sleep(900);
  for (const p of PRESETS) {
    await setPreset(p);
    await sleep(700);
    await shot('metal', p);
  }

  // ── 冻结云双帧（第 12 条视觉侧：cloudSpeed=0 无 time 驱动 → 双帧逐位一致）──
  await evalJs(`(async () => {
    for (const obj of (window.__t0185_injected ?? [])) obj.removeFromParent();
    window.__t0185_injected = [];
    return true;
  })()`);
  await setPreset('day');
  await sleep(900);
  await screenshot('../frozen-cloud-a.png');
  await sleep(2000);
  await screenshot('../frozen-cloud-b.png');
  // 云可见性对照（帧内云已由 day display 0.22 组合帧多次实证，双帧一致性离线分析）

  // ── renderMode clay 抽查（诊断遍天空照常——018.1 机制零回归 spot）──
  await evalJs(`window.__envProbe.setPreset('day', { renderMode: 'clay' })`);
  await sleep(900);
  await screenshot('../rendermode-clay.png');
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(600);

  // 收尾恢复
  await evalJs(`window.__tree3a.unfreezeTime(); true`);
  log.finalProbe = {
    mode: await evalJs(`window.__sky.mode`),
    pmrem: await evalJs(`window.__sky.pmremStats()`),
  };
  return log;
};
