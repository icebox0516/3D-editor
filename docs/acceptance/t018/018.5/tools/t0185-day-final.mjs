// day 终值金属机位验证：d0.22/i0.15 组合下金属三球反射可辨性（vs 018.0 legacy 近黑）
export default async ({ navigate, setViewport, evalJs, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  // 金属机位（018.0 同款注入）
  await evalJs(`window.__tree3a.freezeTime(); (async () => {
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
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(900);
  // 表值基线帧
  await send('Page.captureScreenshot', { format: 'png' }).then(async (r) => {
    const { writeFileSync } = await import('node:fs');
    writeFileSync('../final-day-metal-base.png', Buffer.from(r.data, 'base64'));
  });
  // 终值组合帧
  await evalJs(`window.__sky.setDisplayIntensity(0.22); window.__sky.setIblIntensity(0.15); true`);
  await sleep(650);
  await send('Page.captureScreenshot', { format: 'png' }).then(async (r) => {
    const { writeFileSync } = await import('node:fs');
    writeFileSync('../final-day-metal-d022-i015.png', Buffer.from(r.data, 'base64'));
  });
  await evalJs(`window.__t0185_metal?.removeFromParent(); window.__envProbe.setPreset('day'); window.__tree3a.unfreezeTime(); true`);
  return { ok: true };
};
