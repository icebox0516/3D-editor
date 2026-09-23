// 决定性实验：红色 skyColor × 50 强度 Hemi（全 layer）→ 页面是否出现红色
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(800);
  const info = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const h = new THREE.HemisphereLight(0xff0000, 0x000000, 50);
    h.layers.enableAll();
    window.__envProbe.scene.add(h);
    window.__extremeHemi = h;
    await new Promise((r) => setTimeout(r, 500));
    const scene = window.__envProbe.scene;
    let stillThere = false;
    scene.traverse((n) => { if (n === window.__extremeHemi) stillThere = true; });
    return { added: true, stillInSceneAfter500ms: stillThere };
  })()`);
  await sleep(400);
  await screenshot('../hemi-extreme-red.png`);
  const cleaned = await evalJs(`(() => { window.__extremeHemi.removeFromParent(); return true; })()`);
  return { info, cleaned };
};
