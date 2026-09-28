// T024.5 探针：far fade-out（→culled）过渡冻结判别 —— 双卡触发 or 当前构建单卡也现？
// 背景：perf-mixed v3 实测 far@449 clean 沉降门 60s 不达 tInst==0（冻结台 tInst 230/dual 41
//   恒定 60s），warmup 449/150 亦冻结（227/298）；而指向 high/mid/canopy 的级联正常完成
//   （mid 搜索 240→tInst 0 / 210→2 / 180→带稳态 85）。T021.8 旧构建同机位沉降态 tInst 0
//   （culled 216），且 tier far 扫描 849m 大规模 fade-out（culled 1858）900ms 内完成——
//   旧构建 fade-out 可正常收敛。本探针在当前构建判别触发面：
//   A 双卡级联（复现）：place@150 clean → view(449) → 10s 逐秒读
//   B 单卡对照：同 maneuvers，单 asset 无 presets → 若收敛 = 双卡触发（T024 回归信号）；
//     若同冻结 = 当前构建泛有（T021.8 后引入，卡无关），主代理裁决
//   C 双卡 spawn-at-target：view(449) 先行 → place → 5s 读（T021.8 far 有效语义——其 far
//     配置 place 时相机已在 449，对象首选档即沉降态，无级联）
//   D 冻结态回收：A 末态 → view(150) → 5s 读（判冻结对象是否可回收）
// 结论供 perf-mixed v4 远机位口径选择 + 主代理裁决引用。只读观测，零 src 改动。
const ASSETS_13 = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
  'asset_tree_salix',
];
const MIXED = `{ count: 2000, seedBase: 1, spacing: 10, jitter: true, assetIds: ${JSON.stringify(ASSETS_13)}, presets: ['default','autumn'] }`;
const SINGLE = `{ count: 2000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }`;

/** clean 沉降门（tInst==0 ∧ dual==0 ∧ 稳定 3 读，cap ms） */
const CLEAN_GATE = `(async (capMs) => {
  const p = window.__tree3aPerf;
  let last = null, stable = 0, polls = 0;
  for (;;) {
    await new Promise(r => setTimeout(r, 500));
    const d = p.distribution();
    const clean = d.transition.instances === 0 && d.transition.dualSubmitBuckets === 0;
    const key = JSON.stringify([d.transition.instances, d.transition.dualSubmitBuckets]);
    polls++;
    if (key === last && clean) { stable++; if (stable >= 3) return { settled: true, polls, settleMs: polls * 500 }; }
    else { stable = 0; last = key; }
    if (polls * 500 > capMs) return { settled: false, polls, settleMs: polls * 500, tInst: d.transition.instances };
  }
})`;

/** 级联追踪：每 1000ms 读一帧账目，共 nReads 次 */
const WATCH = `(async (nReads) => {
  const p = window.__tree3aPerf;
  const reads = [];
  for (let i = 0; i < nReads; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const s = p.stats(), d = p.distribution();
    reads.push({ t: (i + 1) * 1000, dc: s.drawCalls, tri: s.triangles, tInst: d.transition.instances, dual: d.transition.dualSubmitBuckets, culled: d.instances.culled, canopy: d.instances.canopy, mid: d.instances.mid, high: d.instances.high });
  }
  return reads;
})`;

export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  const log = {};

  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (await run(`typeof window.__tree3aPerf === 'object' && window.__tree3aPerf !== null`)) { ready = true; break; }
    await sleep(500);
  }
  if (!ready) throw new Error('__tree3aPerf 20s 未就绪');

  // ── A 双卡级联复现：place@150（spawn-at-target 建立 clean 近态）→ view(449) 级联 → 追踪 ──
  await run(`window.__tree3aPerf.place(${MIXED})`);
  await run(`window.__tree3aPerf.view({ distance: 150 })`);
  log.A_dualCascade_nearGate = await run(`${CLEAN_GATE}(30000)`);
  await run(`window.__tree3aPerf.view({ distance: 449 })`);
  log.A_dualCascade_watch = await run(`${WATCH}(10)`);
  console.log('[probe] A dual cascade tInst seq: ' + log.A_dualCascade_watch.map(r => r.tInst + '/' + r.culled).join(' '));

  // ── D 冻结态回收：A 末态（若冻结）→ view(150) → 5s 读 ──
  await run(`window.__tree3aPerf.view({ distance: 150 })`);
  log.D_frozenRecover_watch = await run(`${WATCH}(5)`);
  console.log('[probe] D frozen-recover tInst seq: ' + log.D_frozenRecover_watch.map(r => r.tInst).join(' '));

  // ── B 单卡对照（当前构建）：place@150 clean → view(449) 级联 → 追踪 ──
  await run(`window.__tree3aPerf.place(${SINGLE})`);
  await run(`window.__tree3aPerf.view({ distance: 150 })`);
  log.B_singleCascade_nearGate = await run(`${CLEAN_GATE}(30000)`);
  await run(`window.__tree3aPerf.view({ distance: 449 })`);
  log.B_singleCascade_watch = await run(`${WATCH}(10)`);
  console.log('[probe] B single cascade tInst seq: ' + log.B_singleCascade_watch.map(r => r.tInst + '/' + r.culled).join(' '));

  // ── C 双卡 spawn-at-target：view(449) 先行 → place → 5s 读（T021.8 far 有效语义）──
  await run(`window.__tree3aPerf.view({ distance: 449 })`);
  await run(`window.__tree3aPerf.place(${MIXED})`);
  log.C_spawnAtFar_watch = await run(`${WATCH}(5)`);
  console.log('[probe] C spawn-at-449 tInst/culled seq: ' + log.C_spawnAtFar_watch.map(r => r.tInst + '/' + r.culled).join(' '));
  log.C_final = await run(`(() => { const p = window.__tree3aPerf; return { stats: p.stats(), distribution: p.distribution() }; })()`);

  await run(`window.__tree3aPerf.clear()`);
  return log;
};
