// T018.4 增量视觉验证（D30 口径）：① __sky 可用性探针（mode/params day 读回/pmremStats）
// ② debounce 合并（连续 20 次写入口 → 立即 0 重烘 / 停手 350ms 后恰 1 + turbidity 观感帧）
// ③ displayIntensity 压暗即时生效 + env 反射不随动（跨 debounce 窗口 baked 零增长——018.3
//    移交「显示域压缩」工具面实证）④ setIblIntensity 刷新路径（immediate 帧近零变化 /
//    settled 帧整体变暗 + baked +1 借道重烘）+ rebake() flush 立即生效 ⑤ 太阳角三一致
// （params 读回 = 灯位方向 = 天空 sunPosition + 低角长影观感帧）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, enableConsole }) => {
  await enableConsole();
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const log = {};

  // ── ① __sky 可用性：mode / day params 读回 / pmremStats 初始 ──
  log.skyReady = await evalJs(`(() => ({
    mode: window.__sky.mode,
    params: window.__sky.params(),
    stats: window.__sky.pmremStats(),
  }))()`);

  // 夏栎产品路径 1 棵（018.3 同款机位协议）
  await evalJs(`window.__tree3aPerf.place({ count: 1, seedBase: 7, spacing: 11, jitter: false, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({ distance: 15, azimuthDeg: 30, elevationDeg: 9 })`);
  await evalJs(`window.__tree3a.freezeTime()`);
  await sleep(900);
  await screenshot('../day-baseline.png');

  // ── ② debounce 合并：连续 20 次 patchAtmosphere（turbidity 3→23）──
  const bakedBefore = log.skyReady.stats.baked;
  log.debounceImmediate = await evalJs(`(() => {
    for (let i = 1; i <= 20; i++) window.__sky.patchAtmosphere({ turbidity: 3 + i });
    return { turbidityReadback: window.__sky.params().atmosphere.turbidity, stats: window.__sky.pmremStats(), bakedBefore: ${bakedBefore} };
  })()`);
  await sleep(350); // 停手 > REBAKE_DEBOUNCE_MS(200)
  log.debounceSettled = await evalJs(`window.__sky.pmremStats()`);
  await sleep(150); // 重烘后的帧落盘
  await screenshot('../turbidity-23-rebaked.png');
  // 恢复 day（产品路径 setPreset，整组重建重置调参）
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(700);

  // ── ③ displayIntensity：注入金属三球（018.3 同款）→ baseline → 0.35 → 跨窗口零重烘 ──
  await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
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
    window.__envProbe.scene.add(group);
    (window.__t0184_injected ??= []).push(group);
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return true;
  })()`);
  await sleep(900);
  await screenshot('../display-baseline.png');
  log.displayProbe = await evalJs(`(() => {
    const before = window.__sky.pmremStats();
    window.__sky.setDisplayIntensity(0.35);
    return { displayReadback: window.__sky.params().displayIntensity, statsBefore: before };
  })()`);
  await sleep(450); // 跨 debounce 窗口：baked 应零增长（display-only 零重烘）
  log.displaySettled = await evalJs(`window.__sky.pmremStats()`);
  await screenshot('../display-035.png');
  // 恢复显示强度（即时，零重烘）
  await evalJs(`window.__sky.setDisplayIntensity(1)`);
  await sleep(150);

  // ── ④ setIblIntensity 刷新路径：0.3 → immediate 帧（uniform 未重传近零变化）→ settled ──
  log.iblImmediate = await evalJs(`(() => {
    const before = window.__sky.pmremStats();
    window.__sky.setIblIntensity(0.3);
    return { iblReadback: window.__sky.params().iblIntensity, statsBefore: before };
  })()`);
  await screenshot('../ibl-030-immediate.png'); // debounce 窗口内（<200ms）——uniform 未重传
  await sleep(450); // 借道重烘落地（baked +1）+ 材质刷新
  log.iblSettled = await evalJs(`window.__sky.pmremStats()`);
  await screenshot('../ibl-030-settled.png');
  // 恢复 + flush 实证：rebake() 强制立即（baked 即刻 +1，不等 200ms）
  log.flushProbe = await evalJs(`(() => {
    window.__sky.setIblIntensity(1);
    const before = window.__sky.pmremStats().baked;
    window.__sky.rebake(); // flush：同步执行
    const after = window.__sky.pmremStats();
    return { before, after, delta: after.baked - before };
  })()`);
  await sleep(200);
  await screenshot('../ibl-restored-flush.png');
  await evalJs(`(async () => { for (const o of (window.__t0184_injected ?? [])) o.removeFromParent(); window.__t0184_injected = []; })()`);

  // ── ⑤ 太阳角三一致：setSunAngles(8,240) → 读回/灯位/天空 sunPosition 同源 + 低角长影帧 ──
  log.sunAngles = await evalJs(`(() => {
    window.__sky.setSunAngles(8, 240);
    const params = window.__sky.params();
    // 灯位（envProbe 太阳灯遍历）与 Sky sunPosition uniforms 现场读
    let sunLightPos = null, skySun = null;
    window.__envProbe.scene.traverse((n) => {
      if (n.isDirectionalLight && n.castShadow) sunLightPos = { x: n.position.x, y: n.position.y, z: n.position.z };
      if (n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition && n.material.uniforms.uDisplayIntensity) {
        const p = n.material.uniforms.sunPosition.value;
        skySun = { x: p.x, y: p.y, z: p.z };
      }
    });
    const len = Math.hypot(sunLightPos.x, sunLightPos.y, sunLightPos.z);
    const dot = (sunLightPos.x * skySun.x + sunLightPos.y * skySun.y + sunLightPos.z * skySun.z) / len;
    return { paramsSun: params.sun, sunLightPos, lightLen: len, skySun, dotLightSky: dot };
  })()`);
  await sleep(450); // 低角重烘 + 长影落地
  await screenshot('../sunlow-8-240.png');
  // 收尾恢复 day
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(600);
  log.finalProbe = await evalJs(`(() => ({ mode: window.__sky.mode, params: { sun: window.__sky.params().sun, turbidity: window.__sky.params().atmosphere.turbidity, ibl: window.__sky.params().iblIntensity }, stats: window.__sky.pmremStats() }))()`);
  await evalJs(`window.__tree3aPerf.clear()`);

  return { log };
};
