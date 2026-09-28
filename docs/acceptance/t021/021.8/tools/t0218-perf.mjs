// T021.8 Phase C ① 性能梯队 + 高密度园区混植（§十四必记指标全量）
// 梯队 count ∈ {1,20,100,500,1000,2000}（夏栎单种）+ 2000 混植（13 乔木 round-robin）。
// 机位：near = view() 缺省自适应；far = 自适应搜索 canopy 占比 >90% 的最近距离（记实际占比）；
//       混植档加中景（过渡带内，transitionInstances > 20 为准）。
// 每配置：sampleFrames(5000) + stats() + distribution() 全量快照。空场景基线先行。
// Shadow A/B：1000 near + 2000 混植 far 两配置 setSunShadow(false/true)（切换后重预热再采样）。
// 环境口径：RTX 2080 Ti / WebGL2 / Chromium headless CDP / 1920×1080 / DPR 1 / Shadow ON /
//          T018 day 预设 / vsync-off（--disable-gpu-vsync --disable-frame-rate-limit，严格保守）。
const OUT_DIR = 'docs/acceptance/t021/021.8/acceptance';
const ASSETS_13 = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
  'asset_tree_salix',
];

export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()'); // 摘除默认锚点树舞台（011.13 同款）
  // Tab → pure3d（input.ts 产品路径）：canvas 恰满视口（1920×1048，金丝雀已验）——§十四 1920×1080 口径
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);

  const run = (expression) => evalJs(expression);
  const log = {};

  // ── env（GPU 串 / viewport / DPR / vsync 口径记档）──
  log.env = await run(`(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const canvas = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
    return {
      gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      disjointTimerAvailable: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
      viewport: [window.innerWidth, window.innerHeight],
      dpr: window.devicePixelRatio,
      canvasClient: [canvas.clientWidth, canvas.clientHeight],
      pure3d: !!document.querySelector('.ed-app--pure3d'),
      userAgent: navigator.userAgent,
    };
  })()`);

  // ── 注册表 dump 校验（13 乔木 id 以页内实际为准）──
  log.assetDump = await run(`(() => {
    const p = window.__tree3aPerf;
    // place(1) 逐 id 试探校验注册（幂等、便宜）；分布读出在下一配置统一覆盖
    const ids = ${JSON.stringify(ASSETS_13)};
    const ok = [], bad = [];
    for (const id of ids) {
      try { p.place({ count: 1, seedBase: 1, assetId: id }); ok.push(id); }
      catch (e) { bad.push({ id, err: String(e.message || e) }); }
    }
    p.clear();
    return { ok, bad };
  })()`);

  // ── 空场景基线 ──
  log.baseline = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.clear();
    await new Promise(r => setTimeout(r, 500));
    const sample = await p.sampleFrames(3000);
    return { sample, stats: p.stats(), distribution: p.distribution() };
  })()`);

  /** 单配置采样：place → view → settle → sampleFrames + stats + distribution */
  const sampleConfig = (placeJs, viewJs, settleMs) => run(`(async () => {
    const p = window.__tree3aPerf;
    p.place(${placeJs});
    p.view(${viewJs});
    await new Promise(r => setTimeout(r, ${settleMs}));
    const sample = await p.sampleFrames(5000);
    return { sample, stats: p.stats(), distribution: p.distribution() };
  })()`);

  /** far 机位自适应搜索：从远到近找第一个 canopy 占比 >90% 的距离（记实际占比与尝试序列） */
  const findFar = (placeJs, tries, settleMs) => run(`(async () => {
    const p = window.__tree3aPerf;
    p.place(${placeJs});
    const attempts = [];
    for (const d of ${JSON.stringify(tries)}) {
      p.view({ distance: d });
      await new Promise(r => setTimeout(r, ${settleMs}));
      const dist = p.distribution();
      const i = dist.instances;
      const total = i.high + i.mid + i.low + i.canopy + i.culled;
      const canopyShare = total > 0 ? i.canopy / total : 0;
      attempts.push({ distance: d, instances: { ...i }, canopyShare: +canopyShare.toFixed(4), transitionInstances: dist.transitionInstances });
      if (canopyShare > 0.9) return { chosen: d, attempts };
    }
    // 宽网格物理上无法全落 canopy 窗（带外两侧 mid/culled 不可避免）——取 canopy 占比最高者并如实记档
    const best = attempts.reduce((a, b) => (b.canopyShare > a.canopyShare ? b : a), attempts[0]);
    return { chosen: best.distance, attempts };
  })()`);

  const spacingFor = (count) => (count >= 1000 ? 10 : 11);
  const settleFor = (count) => (count >= 2000 ? 2500 : 1200);
  /** far 搜索距离序列：extent+400 起步向近收（extent 由 place 参数推算——cols=ceil(√n)） */
  const farTries = (count, spacing) => {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const extent = Math.max((cols - 1) * spacing, (rows - 1) * spacing) + 9;
    const cand = [extent + 400, extent + 300, extent + 200, extent + 120, extent + 60, extent];
    return [...new Set(cand.filter((d) => d >= 60))];
  };

  // ── 梯队（夏栎单种 × {near, far}）──
  log.tiers = [];
  for (const count of [1, 20, 100, 500, 1000, 2000]) {
    const spacing = spacingFor(count);
    const settle = settleFor(count);
    const placeJs = `{ count: ${count}, seedBase: 1, spacing: ${spacing}, jitter: true, assetId: 'asset_tree_3a' }`;
    const near = await sampleConfig(placeJs, '{}', settle);
    const far = await findFar(placeJs, farTries(count, spacing), 900);
    const farSample = await sampleConfig(placeJs, `{ distance: ${far.chosen} }`, settle);
    log.tiers.push({ count, spacing, near, far: { chosenDistance: far.chosen, searchAttempts: far.attempts, ...farSample } });
    console.log(`[perf] tier ${count} done (far@${far.chosen}m canopyShare=${(far.attempts.find(a => a.distance === far.chosen) || {}).canopyShare})`);
  }

  // ── 2000 混植（13 乔木 round-robin）× {near, far, mid} ──
  const mixedPlaceJs = `{ count: 2000, seedBase: 1, spacing: 10, jitter: true, assetIds: ${JSON.stringify(ASSETS_13)} }`;
  log.mixed = {};
  log.mixed.near = await sampleConfig(mixedPlaceJs, '{}', 2500);
  const mixedFar = await findFar(mixedPlaceJs, farTries(2000, 10), 1200);
  log.mixed.far = { chosenDistance: mixedFar.chosen, searchAttempts: mixedFar.attempts, ...(await sampleConfig(mixedPlaceJs, `{ distance: ${mixedFar.chosen} }`, 2500)) };
  console.log(`[perf] mixed far@${mixedFar.chosen}m`);
  // 中景：过渡带内（transitionInstances > 20 为准），尝试序列记录
  log.mixed.mid = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.place(${mixedPlaceJs});
    const attempts = [];
    for (const d of [240, 210, 180, 260, 300, 160, 140]) {
      p.view({ distance: d });
      await new Promise(r => setTimeout(r, 1200));
      const dist = p.distribution();
      attempts.push({ distance: d, transitionInstances: dist.transitionInstances, instances: { ...dist.instances }, transition: { ...dist.transition } });
      if (dist.transitionInstances > 20) {
        const sample = await p.sampleFrames(5000);
        return { chosen: d, attempts, sample, stats: p.stats(), distribution: p.distribution() };
      }
    }
    return { chosen: null, attempts };
  })()`);
  console.log(`[perf] mixed mid@${log.mixed.mid.chosen}m`);

  // ── Shadow A/B（1000 near 与 2000 混植 far；切换后重预热再采样——t01113 先例）──
  const shadowAB = (placeJs, viewJs) => run(`(async () => {
    const p = window.__tree3aPerf;
    p.place(${placeJs});
    p.view(${viewJs});
    await new Promise(r => setTimeout(r, 2000));
    p.setSunShadow(false);
    await new Promise(r => setTimeout(r, 1500));
    const off = await p.sampleFrames(4000);
    const offDist = p.distribution();
    const offStats = p.stats();
    p.setSunShadow(true);
    await new Promise(r => setTimeout(r, 1500));
    const on = await p.sampleFrames(4000);
    const onDist = p.distribution();
    const onStats = p.stats();
    return { off: { sample: off, stats: offStats, distribution: offDist }, on: { sample: on, stats: onStats, distribution: onDist } };
  })()`);
  log.shadowAB = {
    tier1000Near: await shadowAB(`{ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }`, '{}'),
  };
  console.log('[perf] shadowAB tier1000 done');
  log.shadowAB.mixed2000Far = await shadowAB(mixedPlaceJs, `{ distance: ${mixedFar.chosen} }`);
  console.log('[perf] shadowAB mixed done');

  // 收尾清场（保持 shadow ON 状态由 setSunShadow(true) 收口）
  await run(`window.__tree3aPerf.clear()`);
  return log;
};
