// T018.5 聚焦复测：① 同实例 IBL on/off 交替 ×3（增量口径稳定性）② rebake 计时（先 trigger 再 flush，baked 递增核验）
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  await evalJs(`window.__tree3a && window.__tree3a.unmount(); true`);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await evalJs(`window.__tree3aPerf.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
  await sleep(1500);

  const log = { alternation: [] };
  for (let i = 0; i < 3; i++) {
    const on = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    await evalJs(`(() => { window.__t0185_envHold = window.__envProbe.scene.environment; window.__envProbe.scene.environment = null; return true; })()`);
    await sleep(400);
    const off = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    await evalJs(`(() => { window.__envProbe.scene.environment = window.__t0185_envHold; return true; })()`);
    await sleep(400);
    log.alternation.push({ i, on: on.p95, off: off.p95, onFps: on.fps, offFps: off.fps });
    console.log(`[alt] ${i}: on ${on.p95?.toFixed?.(2)} off ${off.p95?.toFixed?.(2)}`);
  }
  await evalJs(`window.__tree3aPerf.clear()`);
  await sleep(600);

  // rebake 计时：patchAtmosphere（trigger）→ 立即 rebake()（flush 同步执行）→ pmremStats 核验 +1
  log.rebake = await evalJs(`(() => {
    const samples = [];
    const before = window.__sky.pmremStats().baked;
    for (let i = 0; i < 5; i++) {
      window.__sky.patchAtmosphere({ turbidity: 3 + i * 0.01 });
      const t0 = performance.now();
      window.__sky.rebake();
      samples.push(+(performance.now() - t0).toFixed(2));
    }
    const after = window.__sky.pmremStats();
    return { samples, before, after };
  })()`);
  log.finalPmrem = await evalJs(`window.__sky.pmremStats()`);
  return log;
};
