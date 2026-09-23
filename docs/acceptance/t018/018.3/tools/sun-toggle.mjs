// 判别实验：① 应用太阳灯 intensity 2.4→0（像素应显著变暗）② 恢复 ③ 注入红 DirectionalLight×50
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(800);
  await screenshot('../sun-toggle-base.png');
  const lights = await evalJs(`(() => {
    const found = [];
    window.__envProbe.scene.traverse((n) => {
      if (n.isDirectionalLight || n.isHemisphereLight) {
        found.push({ type: n.isDirectionalLight ? 'dir' : 'hemi', intensity: n.intensity, castShadow: !!n.castShadow, layersMask: n.layers.mask });
      }
    });
    return found;
  })()`);
  const off = await evalJs(`(() => {
    let changed = 0;
    window.__envProbe.scene.traverse((n) => {
      if (n.isDirectionalLight && n.intensity > 0) { n.userData.__orig = n.intensity; n.intensity = 0; changed++; }
    });
    return changed;
  })()`);
  await sleep(900);
  await screenshot('../sun-toggle-off.png');
  await evalJs(`(() => {
    window.__envProbe.scene.traverse((n) => {
      if (n.isDirectionalLight && n.userData.__orig !== undefined) { n.intensity = n.userData.__orig; delete n.userData.__orig; }
    });
    return 'restored';
  })()`);
  await sleep(600);
  await screenshot('../sun-toggle-restored.png');
  const injected = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const d = new THREE.DirectionalLight(0xff0000, 50);
    d.layers.enableAll();
    window.__envProbe.scene.add(d);
    return 'dir-added';
  })()`);
  await sleep(900);
  await screenshot('../sun-toggle-red-dir.png');
  await evalJs(`(() => {
    for (const n of [...window.__envProbe.scene.children]) { if (n.isDirectionalLight && n.intensity === 50) n.removeFromParent(); }
    return 'cleaned';
  })()`);
  return { lights, off, injected };
};
