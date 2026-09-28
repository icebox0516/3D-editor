// T024.5 补测：shadow A/B @ far449（§九原锚风格——T021.8 混植 far off↔on 316↔270 = −15%）。
// 背景：perf-mixed 主测 A/B 锚 = 真近@150（简报指定最重机位，56.4% 破线）——但 §九 15% 线的
//   T021.8 两锚（tier1000-near@319 / mixed-far@449）阴影投射体以简化 canopy 为主；真近锚的
//   投射体含 791 high/mid 全深度。本补测给主代理同一构建 × §九原锚机位的可比读数（裁决上下文）。
// 方法：spawn-at-target（view(449) → place）→ clean 门 → off 1500ms → sample(4000) →
//   on 1500ms → sample(4000)；costRatio = (off−on)/off（fps 口径，与帧时代数恒等）。
const ASSETS_13 = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
  'asset_tree_salix',
];
const PLACE_JS = `{ count: 2000, seedBase: 1, spacing: 10, jitter: true, assetIds: ${JSON.stringify(ASSETS_13)}, presets: ['default','autumn'] }`;

export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (await run(`typeof window.__tree3aPerf === 'object' && window.__tree3aPerf !== null`)) { ready = true; break; }
    await sleep(500);
  }
  if (!ready) throw new Error('__tree3aPerf 20s 未就绪');

  const log = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.view({ distance: 449 });
    const placed = p.place(${PLACE_JS});
    if (!placed) return { error: 'place failed' };
    let last = null, stable = 0, polls = 0, clean = false;
    for (;;) {
      await new Promise(r => setTimeout(r, 500));
      const s = p.stats(), d = p.distribution();
      clean = d.transition.instances === 0 && d.transition.dualSubmitBuckets === 0;
      const key = JSON.stringify([s.drawCalls, s.triangles, d.transition.instances, d.transition.dualSubmitBuckets]);
      polls++;
      if (key === last && clean) { stable++; if (stable >= 3) break; } else { stable = 0; last = key; }
      if (polls > 120) break;
    }
    const pre = { stats: p.stats(), distribution: p.distribution(), programs: p.stats().programs };
    p.setSunShadow(false);
    await new Promise(r => setTimeout(r, 1500));
    const off = await p.sampleFrames(4000);
    const offStats = p.stats();
    p.setSunShadow(true);
    await new Promise(r => setTimeout(r, 1500));
    const on = await p.sampleFrames(4000);
    const onStats = p.stats();
    const post = { programs: p.stats().programs };
    return {
      camera: { distance: 449, order: 'view-then-place (spawn-at-target)' },
      settle: { settled: clean, polls, settleMs: polls * 500 },
      pre, off: { sample: off, stats: offStats }, on: { sample: on, stats: onStats }, post,
      costRatio: (off.fps - on.fps) / off.fps,
    };
  })()`);
  console.log('[addendum] shadowAB@far449 costRatio=' + (log.costRatio * 100).toFixed(1) + '%'
    + ' (off ' + log.off.sample.fps.toFixed(1) + ' / on ' + log.on.sample.fps.toFixed(1) + ')');
  return log;
};
