// T018.5 验收取证②：p95 增量（对照 018.0 基线 + 同实例 IBL on/off 增量口径）
// + 资源账循环（epic 第 4 条：pmremStats owned=1/旧=0/无增长）+ PMREM 单次耗时（第 10 条）
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const log = { probe: await evalJs(`(() => ({ perf: !!window.__tree3aPerf, env: !!window.__envProbe, sky: !!window.__sky }))()`) };
  if (!log.probe.perf || !log.probe.env || !log.probe.sky) throw new Error('probes missing');
  const setPreset = (p) => evalJs(`window.__envProbe.setPreset('${p}')`);
  await evalJs(`window.__tree3a && window.__tree3a.unmount(); true`);

  // ── ① p95：四预设 × {空场景, 100 棵}（018.0 同款协议）──
  log.perf = {};
  for (const p of ['day', 'dusk', 'night', 'tech']) {
    await setPreset(p);
    await sleep(900);
    const empty = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    await evalJs(`window.__tree3aPerf.place({ count: 100, seedBase: 1, spacing: 11, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
    await sleep(1200);
    const trees100 = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    log.perf[p] = { empty, trees100 };
    await evalJs(`window.__tree3aPerf.clear()`);
    console.log(`[perf] ${p} done`);
  }

  // ── ② p95：1000 棵 × 四预设（018.0-perf1000 同款）──
  log.perf1000 = {};
  for (const p of ['day', 'dusk', 'night', 'tech']) {
    await setPreset(p);
    await evalJs(`window.__tree3aPerf.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
    await sleep(1200);
    log.perf1000[p] = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    await evalJs(`window.__tree3aPerf.clear()`);
    console.log(`[perf1000] ${p} done`);
  }

  // ── ③ 同实例 IBL on/off 增量（018.2 建议口径：day + 1000 棵，on → envNull → on'）──
  await setPreset('day');
  await evalJs(`window.__tree3aPerf.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
  await sleep(1200);
  log.iblOnOff = { on: await evalJs(`window.__tree3aPerf.sampleFrames(5000)`) };
  await evalJs(`(() => { window.__t0185_envHold = window.__envProbe.scene.environment; window.__envProbe.scene.environment = null; return true; })()`);
  await sleep(400);
  log.iblOnOff.off = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
  await evalJs(`(() => { window.__envProbe.scene.environment = window.__t0185_envHold; return true; })()`);
  await sleep(400);
  log.iblOnOff.on2 = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
  await evalJs(`window.__tree3aPerf.clear()`);
  console.log('[iblOnOff] done');

  // ── ④ 资源账：day→dusk→night→tech 循环 6 轮（≥5 轮口径）──
  await sleep(600);
  log.cycles = [];
  for (let round = 1; round <= 6; round++) {
    const row = { round, perPreset: {} };
    for (const p of ['day', 'dusk', 'night', 'tech']) {
      await setPreset(p);
      await sleep(350);
      row.perPreset[p] = {
        pmrem: await evalJs(`window.__sky.pmremStats()`),
        info: await evalJs(`window.__envProbe.info()`),
      };
    }
    log.cycles.push(row);
    console.log(`[cycles] round ${round} done`);
  }

  // ── ⑤ PMREM 单次耗时（rebake flush，3 次样本）──
  log.rebakeMs = await evalJs(`(() => {
    const t = [];
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      window.__sky.rebake();
      t.push(+(performance.now() - t0).toFixed(2));
    }
    return t;
  })()`);
  log.finalInfo = await evalJs(`window.__envProbe.info()`);
  log.finalPmrem = await evalJs(`window.__sky.pmremStats()`);
  return log;
};
