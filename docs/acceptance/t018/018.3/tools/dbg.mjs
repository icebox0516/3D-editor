export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const step1 = await evalJs(`window.__envProbe ? 'probe-ok' : 'probe-missing'`);
  const step2 = await evalJs(`(async () => { const THREE = await import('/node_modules/.vite/deps/three.js'); return typeof THREE.HemisphereLight; })()`);
  const step3 = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const h = new THREE.HemisphereLight(0xbfd6ea, 0x8a8f96, 0.9);
    h.layers.enableAll();
    window.__envProbe.scene.add(h);
    return 'hemi-added';
  })()`);
  return { step1, step2, step3 };
};
