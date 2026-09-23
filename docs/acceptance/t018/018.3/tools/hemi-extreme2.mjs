// 决定性实验（单脚本单 tab）：day 基线帧 → 注入红色 skyColor ×50 Hemi（全 layer）→ 帧对比 → 清理
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(800);
  await screenshot('../hemi-extreme-base.png');
  const r = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const h = new THREE.HemisphereLight(0xff0000, 0x0000ff, 50);
    h.layers.enableAll();
    window.__envProbe.scene.add(h);
    await new Promise((resolve) => setTimeout(resolve, 500));
    let stillThere = false;
    window.__envProbe.scene.traverse((n) => { if (n === h) stillThere = true; });
    return { stillInScene: stillThere };
  })()`);
  await sleep(400);
  await screenshot('../hemi-extreme-red.png');
  await evalJs(`(() => {
    for (const n of [...window.__envProbe.scene.children]) {
      if (n.isHemisphereLight) n.removeFromParent();
    }
    return 'cleaned';
  })()`);
  await sleep(400);
  await screenshot('../hemi-extreme-cleaned.png');
  return r;
};
