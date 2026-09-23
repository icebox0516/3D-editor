// T018.1 增量视觉验证（D30 口径——非资产任务：三一致取证 + 零漂移对照 + 跟随/诊断遍/
// 预设循环 + 泄漏修复复测 + p95 抽检）。改前对照源 = docs/acceptance/t018/018.0/。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, enableConsole }) => {
  await enableConsole();
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const log = {};

  // ── ① 三一致运行时探针（天空太阳位 / 灯位 / legacy 方向 同源核对）──
  await evalJs(`window.__tree3a.freezeTime()`);
  log.consistency = await evalJs(`(() => {
    let lightPos = null, skySun = null, showSunDisc = null, cloudSpeed = null, timeU = null, skyLayer = null, bg = 'unset';
    window.__envProbe.scene.traverse((n) => {
      if (n && n.isDirectionalLight && !lightPos) lightPos = [n.position.x, n.position.y, n.position.z];
      if (n && n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition && !skySun) {
        skySun = [n.material.uniforms.sunPosition.value.x, n.material.uniforms.sunPosition.value.y, n.material.uniforms.sunPosition.value.z];
        showSunDisc = n.material.uniforms.showSunDisc.value;
        cloudSpeed = n.material.uniforms.cloudSpeed.value;
        timeU = n.material.uniforms.time.value;
        skyLayer = n.layers.mask;
      }
    });
    const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
    const legacy = norm([80, 120, 60]);
    const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    return {
      lightPos, skySun, showSunDisc, cloudSpeed, timeU, skyLayerMask: skyLayer,
      lightDirDotLegacy: dot(norm(lightPos), legacy),
      skySunDotLegacy: dot(norm(skySun), legacy),
      lightPosMagnitude: Math.hypot(...lightPos),
    };
  })()`);

  // ── ② day 基线帧（018.0 同协议机位：tree3a count=1 jitter=false, view 25/35/8）──
  await evalJs(`window.__tree3aPerf.place({ count: 1, seedBase: 1, spacing: 11, jitter: false, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
  await sleep(1200);
  await screenshot('../day-tree3a-new.png');

  // ── ③ 预设循环（provisional 天空四态可见性 + 回 day）──
  for (const p of ['dusk', 'night', 'tech', 'day']) {
    await evalJs(`window.__envProbe.setPreset('${p}')`);
    await sleep(700);
    await screenshot(`../${p}-tree3a-new.png`);
  }

  // ── ④ 相机跟随（远距平移两机位——天空恒覆盖无错切；太阳盘方位世界一致）──
  await evalJs(`(() => { const { camera, controls } = window.__envProbe; camera.position.set(400, 12, 400); controls.target.set(400, 3.6, 400); controls.update(); })()`);
  await sleep(600);
  await screenshot('../follow-camera-far.png');
  await evalJs(`(() => { const { camera, controls } = window.__envProbe; camera.position.set(-1200, 300, -900); controls.target.set(-1200, 3.6, -900); controls.update(); })()`);
  await sleep(600);
  await screenshot('../follow-camera-extreme.png');

  // ── ⑤ 诊断模式（wireframe / clay）——环境遍天空照常 ──
  await evalJs(`(() => { const { camera, controls } = window.__envProbe; camera.position.set(10.5, 4.3, 12.6); controls.target.set(0, 3.6, 0); controls.update(); })()`);
  await evalJs(`window.__envProbe.setPreset('day', { renderMode: 'wireframe' })`);
  await sleep(700);
  await screenshot('../rendermode-wireframe.png');
  await evalJs(`window.__envProbe.setPreset('day', { renderMode: 'clay' })`);
  await sleep(700);
  await screenshot('../rendermode-clay.png');
  await evalJs(`window.__envProbe.setPreset('day')`);

  // ── ⑥ 泄漏修复复测（018.0 growth 同协议：10 轮切换零增长）──
  await evalJs(`window.__tree3aPerf.clear()`);
  await sleep(500);
  const marks = [];
  for (let i = 0; i < 10; i++) {
    await evalJs(`window.__envProbe.setPreset(${i % 2 ? "'dusk'" : "'day'"})`);
    await sleep(400);
    marks.push(await evalJs(`(() => { const x = window.__envProbe.info(); return { geo: x.memory.geometries, tex: x.memory.textures, prog: x.programs }; })()`));
  }
  log.growth10 = marks;

  // ── ⑦ p95 抽检（day × 1000 棵，vsync-off，对照 018.0 基线 4.40ms）──
  await evalJs(`window.__tree3a.unfreezeTime()`);
  await evalJs(`window.__tree3aPerf.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
  await sleep(1200);
  log.perf1000Day = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
  await evalJs(`window.__tree3aPerf.clear()`);

  return log;
};
