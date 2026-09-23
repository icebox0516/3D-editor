// 活体实验：018.3 现态（无 Hemi）注入临时 Hemi（day 参数 + 全 layer）→ 地面像素是否变
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const cleanup = await evalJs(`(() => {
    // 清理 dbg 残留（若有）
    for (const n of [...window.__envProbe.scene.children]) if (n.isHemisphereLight) n.removeFromParent();
    return 'cleaned';
  })()`);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(800);
  await screenshot('../hemi-live-before.png');
  await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const h = new THREE.HemisphereLight(0xbfd6ea, 0x8a8f96, 0.9);
    h.layers.enableAll();
    window.__envProbe.scene.add(h);
    return 'hemi-added';
  })()`);
  await sleep(800);
  await screenshot('../hemi-live-after.png');
  const removed = await evalJs(`(() => {
    for (const n of [...window.__envProbe.scene.children]) if (n.isHemisphereLight) n.removeFromParent();
    return 'hemi-removed';
  })()`);
  return { cleanup, removed };
};
