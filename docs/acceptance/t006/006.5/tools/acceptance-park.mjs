// T006.5 园区档验收取证：2 万夏栎散布（真实园区负载主口径）+ 2 万路灯对照（独立测试资产）。
// ⚠ 本机核显 BIOS 禁用（设备级确认：仅 OrayIddDriver + 2080 Ti）——园区档核显验收无法本机
//   执行，本脚本在 2080 Ti 实测留档（保守外推判读 + 遗留核显环境复验，README 记档）。
// 七项观测报表（D27.9）+ 树场景 LOD on/off 对照（D27.13）。
// 用法：cd tools && node cdp.mjs acceptance-park.mjs（Chrome CDP 9333 + vite dev 5173）
export default async ({ evalJs, screenshot, navigate, setViewport, sleep }) => {
  const BASE = 'http://localhost:5173';
  const POLY = [
    { x: -1000, y: -1000 },
    { x: 1000, y: -1000 },
    { x: 1000, y: 1000 },
    { x: -1000, y: 1000 },
  ];
  const TREE = {
    polygon: POLY,
    densityPerM2: 0.005, // 2000×2000 → ≈20,000 棵（园区档压力线）
    assets: [{ assetId: 'asset_tree_3a', weight: 1 }],
    seed: 20260920,
    scaleRange: { min: 0.85, max: 1.15 },
  };
  const LAMP = {
    polygon: POLY,
    densityPerM2: 0.005, // 同域对照 ≈20,000 盏
    assets: [{ assetId: 'asset_streetlamp', weight: 1 }],
    seed: 20260920,
    scaleRange: { min: 0.9, max: 1.1 },
  };
  const log = { env: {}, canary: {}, tree: { stages: [], ab: {} }, lamp: { stages: [] } };

  const SAMPLER = `(sampleMs) => new Promise((resolve) => {
    const deltas = []; let last = 0, warmed = 0, elapsed = 0;
    const step = (t) => {
      if (last) {
        const d = t - last;
        if (warmed >= 30) {
          deltas.push(d); elapsed += d;
          if (elapsed >= sampleMs) {
            const sorted = [...deltas].sort((a, b) => a - b);
            const rank = (p) => sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)];
            const mean = elapsed / deltas.length;
            resolve({ frames: deltas.length, mean: +mean.toFixed(2), p50: +rank(0.5).toFixed(2),
                      p95: +rank(0.95).toFixed(2), p99: +rank(0.99).toFixed(2),
                      max: +sorted[sorted.length - 1].toFixed(2), fps: Math.round(1000 / mean) });
            return;
          }
        } else warmed++;
      }
      last = t; requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  })`;
  const ensureSampler = () =>
    evalJs(`(function () { if (typeof window.__sample99 !== 'function') { window.__sample99 = ${SAMPLER}; return 'injected'; } return 'kept'; })()`);
  const sample = async (ms) => {
    await ensureSampler();
    return evalJs(`window.__sample99(${ms})`);
  };

  const readStats = () =>
    evalJs(`(function () {
      const s = window.__scatterSmoke.stats();
      const vis = s.lod.instances.high + s.lod.instances.mid + s.lod.instances.low;
      return { drawCalls: s.drawCalls, triangles: s.triangles, totalChunks: s.totalChunks,
               visibleChunks: s.visibleChunks, instances: s.instances,
               visibleInstances: vis, lod: s.lod };
    })()`);

  await setViewport(1920, 1080); // 1080p 口径（D10 园区档；实际 canvas 尺寸记档）
  await navigate(BASE + '/?lod=on');
  await sleep(2500);
  log.canary = await evalJs(`(function () {
    const canvases = [...document.querySelectorAll('canvas')].map((c) => ({
      cls: c.className || c.parentElement?.className || '', w: c.clientWidth, h: c.clientHeight }));
    const main = canvases.slice().sort((a, b) => b.w * b.h - a.w * b.h)[0];
    return { main, dpr: window.devicePixelRatio, inner: [innerWidth, innerHeight] };
  })()`);
  if (!log.canary.main || log.canary.main.w < 800 || log.canary.main.h < 500) {
    throw new Error('金丝雀失败：主 canvas 尺寸异常 ' + JSON.stringify(log.canary.main));
  }
  log.env = await evalJs(`(function () {
    const gl = document.createElement('canvas').getContext('webgl2');
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown',
             viewport: [innerWidth, innerHeight], dpr: window.devicePixelRatio };
  })()`);
  await evalJs('window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0');

  // ── 场景 A：2 万夏栎（真实园区负载）─────────
  await evalJs(`window.__scatterSmoke.scatter({ id: 'park-20k-tree', params: ${JSON.stringify(TREE)} })`);
  await sleep(8000); // 树三档源冷编译 + 4,096 块建立
  const treeViews = [
    { name: 'near-mixed', distance: 80, azimuthDeg: 35, elevationDeg: 8 },
    { name: 'mid', distance: 200, azimuthDeg: 35, elevationDeg: 20 },
    { name: 'overview', distance: 500, azimuthDeg: 35, elevationDeg: 45 },
  ];
  for (const vp of treeViews) {
    await evalJs(`window.__tree3aPerf.view(${JSON.stringify(vp)})`);
    await sleep(3000); // 换档收敛（迟滞 + 合并重建 + 树重撒）
    const stats = await readStats();
    const frames = await sample(5000);
    await screenshot(`../screenshots/park-tree-${vp.name}.png`);
    log.tree.stages.push({ viewpoint: vp, stats, frames });
  }

  // 树场景 LOD on/off 对照（D27.13；off = 全 High 无 cull——2 万棵全 High 的回退形态）
  await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: 150, azimuthDeg: 35, elevationDeg: 16 })})`);
  await sleep(3000);
  log.tree.ab.on = { stats: await readStats(), frames: await sample(5000) };
  await screenshot('../screenshots/park-tree-ab-on.png');
  await navigate(BASE + '/?lod=off');
  await sleep(2500);
  await evalJs('window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0');
  await evalJs(`window.__scatterSmoke.scatter({ id: 'park-20k-tree', params: ${JSON.stringify(TREE)} })`);
  await sleep(8000);
  await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: 150, azimuthDeg: 35, elevationDeg: 16 })})`);
  await sleep(3000);
  log.tree.ab.off = { stats: await readStats(), frames: await sample(5000) };
  await screenshot('../screenshots/park-tree-ab-off.png');

  // ── 场景 B：2 万路灯（独立测试资产同域对照）─────────
  await navigate(BASE + '/?lod=on');
  await sleep(2500);
  await evalJs('window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0');
  await evalJs(`window.__scatterSmoke.scatter({ id: 'park-20k-lamp', params: ${JSON.stringify(LAMP)} })`);
  await sleep(5000);
  for (const vp of treeViews) {
    await evalJs(`window.__tree3aPerf.view(${JSON.stringify(vp)})`);
    await sleep(2500);
    const stats = await readStats();
    const frames = await sample(4000);
    await screenshot(`../screenshots/park-lamp-${vp.name}.png`);
    log.lamp.stages.push({ viewpoint: vp, stats, frames });
  }
  return log;
};
