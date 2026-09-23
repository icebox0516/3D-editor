// T018.2 p95 归因复测：day × 1000 棵三态 A/B——① IBL on（默认）② environment=null（材质
// 回退无 env 变体，分离 IBL 采样每帧 GPU 成本）③ setPreset 恢复（重烘后复测）。
// 目的：Δ+1.10ms（vs 018.1 基线 4.50）的归因——PMREM 烘焙成本（非帧路径）vs IBL 采样成本（帧路径）。
export default async ({ navigate, setViewport, evalJs, sleep, enableConsole }) => {
  await enableConsole();
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const log = {};

  const place = `window.__tree3aPerf.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({})`;
  const sample = `window.__tree3aPerf.sampleFrames(5000)`;

  // ① IBL on（默认 day）
  await evalJs(place);
  await sleep(1200);
  log.iblOn = await evalJs(sample);

  // ② environment=null（探针直写取证——材质回退无 env 变体）
  await evalJs(`(() => { window.__envProbe.scene.environment = null; return true; })()`);
  await sleep(1200);
  log.envNull = await evalJs(sample);

  // ③ setPreset 恢复（走产品路径重烘 → environment 重新挂接）
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(1200);
  log.restored = await evalJs(sample);
  log.restoredEnvOk = await evalJs(`(() => { const e = window.__envProbe.scene.environment; return !!(e && e.isTexture && e.mapping === 306); })()`);

  await evalJs(`window.__tree3aPerf.clear()`);
  return log;
};
