// T018.5 补正取证：tech 预设终值（display 0.2 / ibl 0.15，14:45 定案）复拍六主体帧
// 背景：t0185-visual.mjs 的 24 帧拍摄于 tech 终值定案前（时值 display 1 / ibl 0.7，
// 见 t0185-visual.log presetParams.tech）——本脚本以同款协议复拍 tech × 6 主体覆盖 tech-*.png，
// 供 t0185-compare.mjs 重跑出新旧对照表（day/dusk/night 三组终值帧不受影响不重拍）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const log = { probe: await evalJs(`(() => ({
    envProbe: !!window.__envProbe, tree3aPerf: !!window.__tree3aPerf, tree3a: !!window.__tree3a, sky: !!window.__sky,
  }))()`) };
  if (!log.probe.envProbe || !log.probe.tree3aPerf || !log.probe.sky) throw new Error('probes missing');

  const setPreset = (p) => evalJs(`window.__envProbe.setPreset('${p}')`);

  // tech 终值接线 live 确认（预设表 day 0.22/0.15 · tech 0.2/0.15 已落 src，此处读回）
  await setPreset('tech');
  await sleep(700);
  log.techParams = await evalJs(`(() => {
    const q = window.__sky.params();
    return { displayIntensity: q.displayIntensity, iblIntensity: q.iblIntensity, sun: [q.sun.elevationDeg, +q.sun.azimuthDeg.toFixed(2)], mode: window.__sky.mode };
  })()`);
  if (log.techParams.displayIntensity !== 0.2 || log.techParams.iblIntensity !== 0.15) {
    throw new Error('tech final values not live: ' + JSON.stringify(log.techParams));
  }

  // ── 六主体同款协议（与 t0185-visual.mjs 一致：freezeTime + place/view + 同机位常量）──
  log.shots = [];
  const shot = async (subject) => {
    await screenshot(`../tech-${subject}.png`);
    log.shots.push(`tech-${subject}.png`);
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
    await shot(t.name);
  }
  await evalJs(`window.__tree3aPerf.clear()`);

  // GLB 注入（018.0/018.5 同款：sensor.glb 归一化 1.2m @ 原点，机位 (3.2,1.1,3.6)→(0,0.6,0)）
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
  await shot('glb');

  // 金属参照组（同款：metalness 1 × roughness 0.15/0.45/0.75，机位 (0,1.1,5.2)→(0,0.55,0)）
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
  await shot('metal');

  // 收尾清理注入物 + 恢复
  await evalJs(`(async () => {
    for (const obj of (window.__t0185_injected ?? [])) obj.removeFromParent();
    window.__t0185_injected = [];
    return true;
  })()`);
  await evalJs(`window.__tree3a.unfreezeTime(); true`);
  log.finalProbe = {
    mode: await evalJs(`window.__sky.mode`),
    pmrem: await evalJs(`window.__sky.pmremStats()`),
  };
  return log;
};
