// T021.8 Phase C ② 远景视觉验收取证（十条证据帧）
// 场景选择：2000 混植（13 乔木 round-robin，spacing 10）——记档：较 1000 密植远景覆盖更实，
// 冠幅 9m vs 间距 10m 无显著交叠、树种可辨性保留。
// 机位组：M25/F50 单树帧（az35 el8 SOP）+ 远景园区总览（far/mid）+ representation transition
// probe（径向 25→800m，含 6/16/60 三线与两过渡带穿线帧）+ 单树 dither 细扫（冠幅连续 ③）
// + 单树 fade/cull 序列（⑦⑧）。
// 像素判读离线归 png-probe.mjs；本脚本只产帧 + 逐帧 distribution/stats 读数。
const SPECIES = [
  '3a', 'celtis', 'camphor', 'zelkova', 'ginkgo', 'platanus', 'koelreuteria', 'triadica',
  'bischofia', 'sophora', 'fraxinus', 'ligustrum', 'salix',
];
const OUT = 'docs/acceptance/t021/021.8/acceptance';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);

  const run = (expression) => evalJs(expression);
  const log = { frames: [] };
  const canvasRect = await run(`(() => {
    const c = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  })()`);
  log.canvasRect = canvasRect;

  /** 单帧：view → settle → 读数 → 截图 */
  const shot = async (file, viewJs, settleMs = 700) => {
    await run(`window.__tree3aPerf.view(${viewJs})`);
    await sleep(settleMs);
    const reading = await run(`(() => {
      const p = window.__tree3aPerf;
      const d = p.distribution(), s = p.stats();
      return { distribution: { instances: { ...d.instances }, buckets: { ...d.buckets }, transitionInstances: d.transitionInstances, shadowCasterInstances: d.shadowCasterInstances, transition: { ...d.transition } }, stats: { drawCalls: s.drawCalls, triangles: s.triangles } };
    })()`);
    await screenshot(`${OUT}/${file}`);
    log.frames.push({ file, view: viewJs, ...reading });
    console.log(`[shot] ${file} DC=${reading.stats.drawCalls} inst=${JSON.stringify(reading.distribution.instances)}`);
  };
  const place = (placeJs) => run(`window.__tree3aPerf.place(${placeJs})`);

  // ── A. 单树基准（SOP az35 el8）──
  // M25 × 3 代表种（Phase A 三种冠形）
  for (const sp of ['celtis', 'camphor', 'salix']) {
    await place(`{ count: 1, seedBase: 1, assetId: 'asset_tree_${sp}' }`);
    await shot(`02-M25-${sp}.png`, `{ distance: 25, azimuthDeg: 35, elevationDeg: 8 }`, 900);
  }
  // F50 × 13 全树种
  for (const sp of SPECIES) {
    await place(`{ count: 1, seedBase: 1, assetId: 'asset_tree_${sp}' }`);
    await shot(`02-F50-${sp}.png`, `{ distance: 50, azimuthDeg: 35, elevationDeg: 8 }`, 700);
  }

  // ── B. 混植 2000 总览（far / mid；view 缺省 el16 与 ① 同口径）──
  await place(`{ count: 2000, seedBase: 1, spacing: 10, jitter: true, assetIds: ${JSON.stringify(SPECIES.map((s) => `asset_tree_${s}`))} }`);
  await sleep(2000);
  await shot(`02-overview-far.png`, `{ distance: 449 }`, 1200);
  await shot(`02-overview-mid.png`, `{ distance: 180 }`, 1200);

  // ── C. representation transition probe（径向连续拉远，25→800m）──
  for (const d of [25, 60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 449, 500, 560, 620, 660, 700, 760, 800]) {
    await shot(`02-probe-d${d}.png`, `{ distance: ${d} }`, 650);
  }

  // ── D. 单树 dither 细扫（冠幅连续 ③——celtis，d 140→250 穿 m=16 带全宽）──
  await place(`{ count: 1, seedBase: 1, assetId: 'asset_tree_celtis' }`);
  await sleep(800);
  for (const d of [140, 150, 158, 165, 172, 180, 190, 200, 210, 220, 235, 250]) {
    await shot(`02-crown-celtis-d${d}.png`, `{ distance: ${d}, azimuthDeg: 35, elevationDeg: 8 }`, 550);
  }

  // ── E. 单树 fade/cull 序列（⑦⑧——celtis，d 600→780 穿 60 线与 fade 带全宽）──
  for (const d of [600, 620, 640, 655, 670, 690, 710, 740, 780]) {
    await shot(`02-cull-celtis-d${d}.png`, `{ distance: ${d}, azimuthDeg: 35, elevationDeg: 8 }`, 550);
  }

  await run(`window.__tree3aPerf.clear()`);
  return log;
};
