// T021.8 ④ 散布链 fade 包装视觉抽查（021.7 遗留——D1 修复的散布侧像素面实证）
// __scatterSmoke 撒乔木 3 树种区域（120×90m @ 原点，density 0.05 ≈ 540 实例），
// 相机取 dither 带（m∈[16,20]，D≈190-235）与 fade-out 带（m∈[60,75]，D≈760-820）
// 各三机位取证帧；判读树渐进溶解/退场、无整树缺失。散布链 instances/buckets 与 DC 逐帧记录。
const OUT = 'docs/acceptance/t021/021.8/acceptance';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  const log = {};

  // ── 撒乔木 3 树种区域（散布链真实路径：region → chunk → 桶）──
  // 参数形状：{ id, params: ScatterParams, baseY? }（ScatterSmokeOptions——params 嵌套；
  // v1 教训：平铺传参被静默忽略、跑的是缺省 trashbin 冒烟）
  await run(`window.__scatterSmoke.scatter({
    id: 't0218-fade',
    params: {
      polygon: [{ x: -60, y: -45 }, { x: 60, y: -45 }, { x: 60, y: 45 }, { x: -60, y: 45 }],
      densityPerM2: 0.05,
      assets: [
        { assetId: 'asset_tree_3a', weight: 1 },
        { assetId: 'asset_tree_celtis', weight: 1 },
        { assetId: 'asset_tree_camphor', weight: 1 },
      ],
      seed: 20260924,
      scaleRange: { min: 0.85, max: 1.15 },
    },
  })`);
  await sleep(2000);
  log.scatterSetup = await run(`(() => {
    const s = window.__scatterSmoke.stats();
    const d = window.__tree3aPerf.distribution();
    const p = window.__tree3aPerf.stats();
    return { stats: s, dist: d, perf: { dc: p.drawCalls, tri: p.triangles, geo: p.geometries, prog: p.programs } };
  })()`);
  console.log('[scatter-fade] setup:', JSON.stringify({
    instances: log.scatterSetup.stats.instances,
    chunks: log.scatterSetup.stats.totalChunks,
    visible: log.scatterSetup.stats.visibleChunks,
    lod: log.scatterSetup.stats.lod,
    dc: log.scatterSetup.perf.dc,
  }));

  /** 单帧：view → settle → 读数 → 截图（读数 = 散布 stats + 全链 distribution + perf DC）*/
  const shot = async (file, distance, settleMs = 800) => {
    await run(`window.__tree3aPerf.view({ distance: ${distance}, azimuthDeg: 35, elevationDeg: 16 })`);
    await sleep(settleMs);
    const reading = await run(`(() => {
      const s = window.__scatterSmoke.stats();
      const d = window.__tree3aPerf.distribution();
      const p = window.__tree3aPerf.stats();
      return {
        scatter: { instances: s.instances, visibleChunks: s.visibleChunks, lod: s.lod, dc: s.drawCalls, tri: s.triangles },
        dist: { instances: { ...d.instances }, buckets: { ...d.buckets }, tInst: d.transitionInstances, dual: d.transition.dualSubmitBuckets, shadow: d.shadowCasterInstances },
        perf: { dc: p.drawCalls, tri: p.triangles },
      };
    })()`);
    await screenshot(`${OUT}/${file}`);
    log.frames = log.frames || [];
    log.frames.push({ file, distance, ...reading });
    console.log(`[shot] ${file} dc=${reading.perf.dc} scatterInst=${reading.scatter.instances} dist=${JSON.stringify(reading.dist.instances)} tInst=${reading.dist.tInst} dual=${reading.dist.dual}`);
  };

  // ── dither 带（region 中心 m 跨 [16,20]；近缘 mid / 远缘 canopy、中带 dither 双提交）──
  await shot('04-scatter-dither-d190.png', 190, 1000);
  await shot('04-scatter-dither-d212.png', 212, 800);
  await shot('04-scatter-dither-d235.png', 235, 800);
  // 穿带触发帧（近→远跨 16 线落带内——激活期 dual 提交面）
  await run(`window.__tree3aPerf.view({ distance: 150, azimuthDeg: 35, elevationDeg: 16 })`);
  await sleep(900);
  await shot('04-scatter-dither-cross.png', 200, 350);

  // ── fade-out 带（region 中心 m 跨 [60,75]；近缘 canopy / 远缘 culled、中带渐进退场）──
  await shot('04-scatter-fadeout-d760.png', 760, 900);
  await shot('04-scatter-fadeout-d790.png', 790, 800);
  await shot('04-scatter-fadeout-d820.png', 820, 800);

  // ── 收尾清场 + 复核归零 ──
  await run(`window.__scatterSmoke.clear()`);
  await sleep(900);
  log.afterClear = await run(`(() => {
    const s = window.__scatterSmoke.stats();
    const p = window.__tree3aPerf.stats();
    return { scatter: s, perf: { dc: p.drawCalls, tri: p.triangles, geo: p.geometries, tex: p.textures, prog: p.programs } };
  })()`);
  console.log('[scatter-fade] after clear:', JSON.stringify({ chunks: log.afterClear.scatter.totalChunks, inst: log.afterClear.scatter.instances, dc: log.afterClear.perf.dc }));
  return log;
};
