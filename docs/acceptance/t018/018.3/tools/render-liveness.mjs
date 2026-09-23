// 渲染活性对照：单 tab 内 setPreset night 是否反映（rAF 是否活着）+ 红 Hemi 是否无效
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  // ① 夜景切换——若截图变暗则渲染循环活着
  await evalJs(`window.__envProbe.setPreset('night')`);
  await sleep(800);
  await screenshot('../liveness-night.png');
  // ② 回 day + 红 Hemi
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(600);
  await screenshot('../liveness-day-base.png');
  await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const h = new THREE.HemisphereLight(0xff0000, 0x0000ff, 50);
    h.layers.enableAll();
    window.__envProbe.scene.add(h);
    return 'added';
  })()`);
  await sleep(900);
  await screenshot('../liveness-day-redhemi.png');
  await evalJs(`(() => {
    for (const n of [...window.__envProbe.scene.children]) { if (n.isHemisphereLight) n.removeFromParent(); }
    return 'cleaned';
  })()`);
  return 'done';
};
