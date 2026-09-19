// T010.5 零回退复核——性能对照主测量（口径与 T009.7 tools/perf-main.mjs 逐项一致）
// 档位 1/20/100/500/1000；帧采样 5000ms；Shadow A/B；资源契约五条
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');

  const run = async (expression) => evalJs(expression);
  const log = {};

  // 环境
  log.env = await run(`(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      disjointTimerAvailable: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
      viewport: [window.innerWidth, window.innerHeight],
      dpr: window.devicePixelRatio,
      ua: navigator.userAgent,
    };
  })()`);

  // 基线（空场景）
  log.baseline = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.clear();
    await new Promise(r => setTimeout(r, 500));
    const s = await p.sampleFrames(3000);
    return { sample: s, stats: p.stats() };
  })()`);

  // 档位测量（幂等 place：每档自动清上批）
  const tiers = [
    { count: 1, spacing: 11 },
    { count: 20, spacing: 11 },
    { count: 100, spacing: 11 },
    { count: 500, spacing: 11 },
    { count: 1000, spacing: 10 }, // 320m 见方 ⊂ shadow camera ±160m
  ];
  log.tiers = [];
  for (const tier of tiers) {
    const r = await run(`(async () => {
      const p = window.__tree3aPerf;
      p.place({ count: ${tier.count}, seedBase: 1, spacing: ${tier.spacing}, jitter: true });
      p.view({});
      await new Promise(r => setTimeout(r, 1200));
      const s = await p.sampleFrames(5000);
      return { count: ${tier.count}, sample: s, stats: p.stats() };
    })()`);
    log.tiers.push(r);
  }

  // Shadow A/B（1000 棵）
  log.shadowAB = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.setSunShadow(false);
    await new Promise(r => setTimeout(r, 1500));
    const off = await p.sampleFrames(4000);
    p.setSunShadow(true);
    await new Promise(r => setTimeout(r, 1500));
    const on = await p.sampleFrames(4000);
    return { sunShadowOff: off, sunShadowOn: on };
  })()`);

  // 资源契约：clear 后实例缓冲/对象清零（几何随缓存保留 = 设计内）
  log.afterClear = await run(`(async () => {
    const p = window.__tree3aPerf;
    const cleared = p.clear();
    await new Promise(r => setTimeout(r, 800));
    return { cleared, stats: p.stats() };
  })()`);

  // 连续 10 次放置/删除无持续增长（100 棵档）
  log.cycles10 = await run(`(async () => {
    const p = window.__tree3aPerf;
    const marks = [];
    for (let i = 0; i < 10; i++) {
      p.place({ count: 100, seedBase: 1, spacing: 11, jitter: true });
      await new Promise(r => setTimeout(r, 350));
      const mid = p.stats();
      p.clear();
      await new Promise(r => setTimeout(r, 250));
      marks.push({ geometries: mid.geometries, afterClearGeometries: p.stats().geometries, textures: p.stats().textures, programs: p.stats().programs });
    }
    return marks;
  })()`);

  return log;
};
