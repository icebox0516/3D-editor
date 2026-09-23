// 决定性实验：白漫反射球（content layer）+ 太阳开关 + 灯注入时 programs/calls 计数变化
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(700);
  // 白色漫反射球（roughness 1 / metalness 0——纯 diffuse 受光体）置于相机前
  await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 48, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 1 }),
    );
    m.position.set(0, 0.5, 0);
    m.castShadow = true;
    window.__envProbe.scene.add(m);
    window.__diffuseBall = m;
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return 'ball-added';
  })()`);
  await sleep(900);
  const info0 = await evalJs(`(() => { const x = window.__envProbe.info(); return { calls: x.render.calls, programs: x.programs, fps: null }; })()`);
  await screenshot('../forensic-ball-base.png');
  // 太阳归零
  await evalJs(`(() => {
    window.__envProbe.scene.traverse((n) => { if (n.isDirectionalLight && n.intensity > 0) { n.userData.__orig = n.intensity; n.intensity = 0; } });
    return 'sun-off';
  })()`);
  await sleep(900);
  const info1 = await evalJs(`(() => { const x = window.__envProbe.info(); return { calls: x.render.calls, programs: x.programs }; })()`);
  await screenshot('../forensic-ball-sunoff.png');
  // 恢复太阳 + 注入红 Hemi（programs 若增加 = 灯进入了渲染状态触发重编译）
  await evalJs(`(() => {
    window.__envProbe.scene.traverse((n) => { if (n.isDirectionalLight && n.userData.__orig !== undefined) { n.intensity = n.userData.__orig; delete n.userData.__orig; } });
    return 'sun-restored';
  })()`);
  await sleep(500);
  const info2 = await evalJs(`(() => { const x = window.__envProbe.info(); return { calls: x.render.calls, programs: x.programs }; })()`);
  await screenshot('../forensic-ball-sunrestored.png');
  const added = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const h = new THREE.HemisphereLight(0xff0000, 0x0000ff, 50);
    h.layers.enableAll();
    window.__envProbe.scene.add(h);
    return 'hemi-added';
  })()`);
  await sleep(1200);
  const info3 = await evalJs(`(() => { const x = window.__envProbe.info(); return { calls: x.render.calls, programs: x.programs }; })()`);
  await screenshot('../forensic-ball-redhemi.png');
  await evalJs(`(() => {
    for (const n of [...window.__envProbe.scene.children]) { if (n.isHemisphereLight) n.removeFromParent(); }
    if (window.__diffuseBall) { window.__diffuseBall.removeFromParent(); }
    return 'cleaned';
  })()`);
  return { info0, info1, info2, info3, added };
};
