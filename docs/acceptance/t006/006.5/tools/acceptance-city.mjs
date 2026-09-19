// T006.5 城市档验收取证（独显）：10 万路灯散布（asset_streetlamp，D27.11 独立测试资产）
// 七项观测报表（D27.9：FPS / frame time p50·p95·p99·max / drawCalls / triangles / visible
// instances / LOD 分布双口径 / 各 Representation 桶数）+ LOD on/off 对照（D27.13）。
// p99 采样器页面侧注入（sampleFrames 只有 p95——不改 src，验收工具口径）。
// 用法：cd tools && node cdp.mjs acceptance-city.mjs（Chrome CDP 9333 直连 + vite dev 5173）
export default async ({ evalJs, screenshot, navigate, sleep }) => {
  const BASE = 'http://localhost:5173';
  const SCATTER = {
    polygon: [
      { x: -1000, y: -1000 },
      { x: 1000, y: -1000 },
      { x: 1000, y: 1000 },
      { x: -1000, y: 1000 },
    ],
    densityPerM2: 0.026, // ≈103,988 实例（006.4 同参可复跑对账）
    assets: [{ assetId: 'asset_streetlamp', weight: 1 }],
    seed: 20260919,
    scaleRange: { min: 0.9, max: 1.1 },
  };
  const log = { env: {}, canary: {}, stages: [], ab: {} };

  // p99 帧间隔采样器注入（nearest-rank 百分位；30 帧预热不进统计窗）
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
  // 防御式注入：navigate 会冲掉 window 挂载——采样前确保在场（幂等）
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

  await navigate(BASE + '/?lod=on');
  log.canary = await evalJs(`(function () {
    const canvases = [...document.querySelectorAll('canvas')].map((c) => ({
      cls: c.className || c.parentElement?.className || '', w: c.clientWidth, h: c.clientHeight }));
    const main = canvases.slice().sort((a, b) => b.w * b.h - a.w * b.h)[0];
    return { canvases, main, dpr: window.devicePixelRatio, inner: [innerWidth, innerHeight] };
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

  await evalJs(`window.__scatterSmoke.scatter({ id: 'city-100k', params: ${JSON.stringify(SCATTER)} })`);
  await sleep(5000);

  const viewpoints = [
    { name: 'near-mixed', distance: 90, azimuthDeg: 35, elevationDeg: 14 },
    { name: 'mid', distance: 260, azimuthDeg: 30 },
    { name: 'high-far', distance: 520, azimuthDeg: 55 },
  ];
  for (const vp of viewpoints) {
    await evalJs(`window.__tree3aPerf.view(${JSON.stringify(vp)})`);
    await sleep(2500);
    const stats = await readStats();
    const frames = await sample(4000);
    await screenshot(`../screenshots/city-${vp.name}.png`);
    log.stages.push({ viewpoint: vp, stats, frames });
  }

  // LOD on/off 对照（D27.13 同场景同机位；off = 全 High 全保真无 cull 的回退形态）
  await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: 230, azimuthDeg: 35, elevationDeg: 18 })})`);
  await sleep(2500);
  log.ab.on = { stats: await readStats(), frames: await sample(4000) };
  await screenshot('../screenshots/city-ab-on.png');
  await navigate(BASE + '/?lod=off');
  await sleep(2000);
  await evalJs('window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0');
  await evalJs(`window.__scatterSmoke.scatter({ id: 'city-100k', params: ${JSON.stringify(SCATTER)} })`);
  await sleep(5000);
  await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: 230, azimuthDeg: 35, elevationDeg: 18 })})`);
  await sleep(2500);
  log.ab.off = { stats: await readStats(), frames: await sample(4000) };
  await screenshot('../screenshots/city-ab-off.png');
  return log;
};
