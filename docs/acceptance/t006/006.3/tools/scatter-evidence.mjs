// T006.3 散布链换档取证 —— ScatterChunkManager chunk×source×level 桶（asset_tree_3a
// 三档夏栎散布 320×320m 场），固定风相位，近→远→近穿越阈值带序列 + 带内静止防抖。
// 机器证据：__scatterSmoke.stats().instances 跨档恒定（确定性重撒不丢实例）、
// triangles 随距离单调降档、无中间消失帧。
// 用法：node cdp.mjs scatter-evidence.mjs（cwd = 仓库根）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  const log = { steps: [], holds: [] };
  const params = {
    polygon: [
      { x: -160, y: -160 },
      { x: 160, y: -160 },
      { x: 160, y: 160 },
      { x: -160, y: 160 },
    ],
    densityPerM2: 0.003,
    assets: [{ assetId: 'asset_tree_3a', weight: 1 }],
    seed: 20260919,
    scaleRange: { min: 0.9, max: 1.1 },
  };
  const view = (distance) =>
    `window.__tree3aPerf.view(${JSON.stringify({ distance, azimuthDeg: 35, elevationDeg: 25 })})`;
  const scatterStats = () => evalJs('window.__scatterSmoke.stats()');

  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(600);
  log.canvas = await evalJs(
    `(() => { const c = document.querySelector('canvas'); return c ? { w: c.clientWidth, h: c.clientHeight } : null; })()`,
  );
  await evalJs('window.__tree3a.freezeTime()');
  await evalJs(`window.__scatterSmoke.scatter({ params: ${JSON.stringify(params)} })`);
  await sleep(2000); // 首帧全块 high 建源（~300 棵 × 40K 面）

  const step = async (name, distance) => {
    await evalJs(view(distance));
    await sleep(1000); // 帧内块级评估 + 冷档重撒重建落地
    const s = await scatterStats();
    await screenshot(`docs/acceptance/t006/006.3/screenshots/scatter-${name}.png`);
    log.steps.push({
      name,
      distance,
      triangles: s.triangles,
      drawCalls: s.drawCalls,
      totalChunks: s.totalChunks,
      visibleChunks: s.visibleChunks,
      instances: s.instances,
    });
  };

  // ── 近 → 远（块级分档：远块先降 mid/low，超远块 culled 不渲染）──
  for (const d of [80, 120, 180, 260, 400, 650, 1000]) {
    await step(`far-${d}m`, d);
  }
  // ── 远 → 近回程 ──
  for (const d of [650, 400, 260, 180, 120, 80]) {
    await step(`back-${d}m`, d);
  }

  // ── 带内静止防抖：首个显著降档距离 ×0.93 处连拍 4 帧 ──
  const base = log.steps[0].triangles;
  const dropStep = log.steps.find((s) => s.name.startsWith('far-') && s.triangles < base * 0.7);
  const nominalD = dropStep ? dropStep.distance : 260;
  log.band = { baseTriangles: base, nominalD };
  await evalJs(view(nominalD * 0.93));
  await sleep(1200);
  for (let i = 1; i <= 4; i++) {
    const s = await scatterStats();
    await screenshot(`docs/acceptance/t006/006.3/screenshots/scatter-hold-${i}.png`);
    log.holds.push({ frame: i, triangles: s.triangles, drawCalls: s.drawCalls, instances: s.instances });
    await sleep(400);
  }

  await evalJs('window.__scatterSmoke.clear()');
  return log;
};
