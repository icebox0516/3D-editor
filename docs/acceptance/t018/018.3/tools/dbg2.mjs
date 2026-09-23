export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const r1 = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const h = new THREE.HemisphereLight(0xff0000, 0x000000, 50);
    h.layers.enableAll();
    window.__envProbe.scene.add(h);
    window.__extremeHemi = h;
    await new Promise((r) => setTimeout(r, 300));
    let stillThere = false;
    window.__envProbe.scene.traverse((n) => { if (n === window.__extremeHemi) stillThere = true; });
    return { stillInScene: stillThere };
  })()`);
  return { r1 };
};
