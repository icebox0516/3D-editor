// T018.4 太阳角疑点复现：完整回放原 run ②③④⑤ 序列（turbidity 调参 → setPreset →
// 金属三球 + display/ibl 调参 + flush → 移除三球 → setSunAngles），每步后立即读
// displaySky sunPosition/灯位 + 构图锚（相机位置）——定位「读数对视觉错」是否可复现
// 及机位全景从何而来。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, enableConsole }) => {
  await enableConsole();
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const log = {};

  const snap = () => evalJs(`(() => {
    let sunLightPos = null, skySun = null;
    const cam = window.__envProbe.camera;
    window.__envProbe.scene.traverse((n) => {
      if (n.isDirectionalLight && n.castShadow) sunLightPos = { x: n.position.x, y: n.position.y, z: n.position.z };
      if (n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition && n.material.uniforms.uDisplayIntensity) {
        const p = n.material.uniforms.sunPosition.value;
        skySun = { x: p.x, y: p.y, z: p.z };
      }
    });
    return { sun: window.__sky.params().sun, sunLightPos, skySun, cam: { x: cam.position.x, y: cam.position.y, z: cam.position.z } };
  })()`);

  // ① place + view（全景机位锚）
  await evalJs(`window.__tree3aPerf.place({ count: 1, seedBase: 7, spacing: 11, jitter: false, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({ distance: 15, azimuthDeg: 30, elevationDeg: 9 })`);
  await evalJs(`window.__tree3a.freezeTime()`);
  await sleep(900);
  log.p1_panorama = await snap();

  // ② debounce 调参 + setPreset 恢复
  await evalJs(`(() => { for (let i = 1; i <= 20; i++) window.__sky.patchAtmosphere({ turbidity: 3 + i }); })()`);
  await sleep(350);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(700);
  log.p2_afterPreset = await snap();

  // ③ 金属三球注入 + 机位改近景
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
    (window.__t0184r_injected ??= []).push(group);
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return true;
  })()`);
  log.p3_closeup = await snap();

  // ④ display/ibl 调参 + flush + 移除三球（原 run ⑤ 前的完整状态）
  await evalJs(`window.__sky.setDisplayIntensity(0.35)`);
  await sleep(450);
  await evalJs(`window.__sky.setDisplayIntensity(1)`);
  await evalJs(`window.__sky.setIblIntensity(0.3)`);
  await sleep(450);
  await evalJs(`(() => { window.__sky.setIblIntensity(1); window.__sky.rebake(); return window.__sky.pmremStats(); })()`);
  await sleep(200);
  await evalJs(`(async () => { for (const o of (window.__t0184r_injected ?? [])) o.removeFromParent(); window.__t0184r_injected = []; })()`);
  await sleep(200);
  log.p4_beforeSun = await snap();
  await screenshot('../sun-repro-before.png');

  // ⑤ setSunAngles → 立即 + 450ms 双帧双读
  await evalJs(`window.__sky.setSunAngles(8, 240)`);
  log.p5_immediate = await snap();
  await screenshot('../sun-repro-immediate.png');
  await sleep(450);
  log.p5_settled = await snap();
  await screenshot('../sun-repro-settled.png');

  return { log };
};
