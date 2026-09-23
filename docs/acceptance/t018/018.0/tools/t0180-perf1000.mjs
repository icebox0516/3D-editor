// T018.0 补充：1000 棵夏栎代表档帧时基线（对应 T006.5 抽检口径——10% 判据在重负载帧
// 上才有可判读的分母；四预设 × 1000 棵 vsync-off 5000ms）。主体快照与空场景/100 棵
// 基线见 t0180-baseline.mjs。
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  await evalJs(`window.__tree3a && window.__tree3a.unmount()`);
  const log = { probe: await evalJs(`!!window.__tree3aPerf && !!window.__envProbe`) };
  if (!log.probe) throw new Error('probes missing');
  log.perf1000 = {};
  for (const p of ['day', 'dusk', 'night', 'tech']) {
    await evalJs(`window.__envProbe.setPreset('${p}')`);
    await evalJs(`window.__tree3aPerf.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`);
    await sleep(1200);
    log.perf1000[p] = await evalJs(`window.__tree3aPerf.sampleFrames(5000)`);
    console.log(`[perf1000] ${p} done`);
  }
  await evalJs(`window.__tree3aPerf.clear()`);
  return log;
};
