// ②-E 补充：单树 fade 带尾 + cull 终态 + 影同步消失帧（celtis seedBase 1 变体 r≈5.3，
// fade 带 d∈[670,850]、cull 线 d≈850——序列延伸到 950 确保 culled 终态入帧）
const OUT = 'docs/acceptance/t021/021.8/acceptance';
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  const log = { frames: [] };
  await run(`window.__tree3aPerf.place({ count: 1, seedBase: 1, assetId: 'asset_tree_celtis' })`);
  await sleep(800);
  for (const d of [795, 820, 850, 880, 920, 960]) {
    await run(`window.__tree3aPerf.view({ distance: ${d}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(600);
    const reading = await run(`(() => {
      const p = window.__tree3aPerf;
      const dd = p.distribution(), s = p.stats();
      return { distribution: { instances: { ...dd.instances }, transitionInstances: dd.transitionInstances, shadowCasterInstances: dd.shadowCasterInstances }, stats: { drawCalls: s.drawCalls, triangles: s.triangles } };
    })()`);
    await screenshot(`${OUT}/02-cull-celtis-d${d}.png`);
    log.frames.push({ file: `02-cull-celtis-d${d}.png`, distance: d, ...reading });
    console.log(`[shot] d${d}`, JSON.stringify(reading));
  }
  await run(`window.__tree3aPerf.clear()`);
  return log;
};
