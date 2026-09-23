// tech 终值候选：display 0.2 × ibl {0.7 表值, 0.35} 金属机位 + 树机位对照
export default async ({ navigate, setViewport, evalJs, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  await evalJs(`window.__tree3a.freezeTime(); true`);
  const { writeFileSync } = await import('node:fs');
  const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`../tf-${name}.png`, Buffer.from(r.data, 'base64'));
  };
  // 树机位
  await evalJs(`(async () => {
    window.__tree3aPerf.clear();
    window.__tree3aPerf.place({ count: 1, seedBase: 1, spacing: 11, jitter: false, assetId: 'asset_tree_3a' });
    window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    return true;
  })()`);
  await sleep(900);
  await evalJs(`window.__envProbe.setPreset('tech')`);
  await sleep(900);
  await evalJs(`window.__sky.setDisplayIntensity(0.2); true`);
  await sleep(400);
  await shot('tech-tree-d020-i070');
  await evalJs(`window.__sky.setIblIntensity(0.35)`);
  await sleep(700);
  await shot('tech-tree-d020-i035');
  // 金属机位
  await evalJs(`(async () => {
    window.__tree3aPerf.clear();
    const THREE = await import('/node_modules/.vite/deps/three.js');
    (window.__t0185_metal ??= (() => {
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
      return group;
    })());
    window.__t0185_metal.removeFromParent();
    window.__envProbe.scene.add(window.__t0185_metal);
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return true;
  })()`);
  await sleep(900);
  await evalJs(`window.__envProbe.setPreset('tech')`);
  await sleep(900);
  await evalJs(`window.__sky.setDisplayIntensity(0.2); true`);
  await sleep(400);
  await shot('tech-metal-d020-i070');
  await evalJs(`window.__sky.setIblIntensity(0.35)`);
  await sleep(700);
  await shot('tech-metal-d020-i035');
  await evalJs(`window.__t0185_metal?.removeFromParent(); window.__envProbe.setPreset('day'); window.__tree3a.unfreezeTime(); true`);
  return { ok: true };
};
