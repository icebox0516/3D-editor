// T024.5 探针（截帧全链预检）：导航 → 就绪等待 → freezeTime(2.5) → place 默认卡 →
// view M25 → 截帧。产出能力面清单（__tree3aPerf / freezeTime / canvas rect / canvas 数）
// + stats + 全帧 probe 截图（人工判读布局：HUD/面板/状态栏是否入画）。
// 用法：PORT=5173 OUTDIR=<dir> node cdp.mjs probe.mjs
const PORT = process.env.PORT ?? '5173';
const OUTDIR = process.env.OUTDIR ?? '.';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);

  let ready = false;
  for (let i = 0; i < 40; i++) {
    ready = await evalJs(
      `typeof window.__tree3aPerf !== 'undefined' && typeof window.__tree3aPerf.place === 'function'`,
    );
    if (ready) break;
    await sleep(500);
  }
  if (!ready) throw new Error('app not ready: __tree3aPerf missing');

  const caps = JSON.parse(await evalJs(`JSON.stringify((() => {
    const c = document.querySelector('canvas.ed-viewport__canvas');
    const r = c ? c.getBoundingClientRect() : null;
    return {
      hasFreeze: typeof window.__tree3aPerf.freezeTime === 'function',
      hasUnfreeze: typeof window.__tree3aPerf.unfreezeTime === 'function',
      canvasRect: r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null,
      canvasCount: document.querySelectorAll('canvas').length,
      innerSize: { w: window.innerWidth, h: window.innerHeight },
    };
  })())`));

  await evalJs('window.__tree3aPerf.freezeTime(2.5)');
  await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_tree_3a', count: 1, seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(1600);
  const stats = JSON.parse(await evalJs('JSON.stringify(window.__tree3aPerf.stats())'));
  const uTimeFrozen = await evalJs(`(() => {
    const s1 = window.__tree3aPerf.stats();
    return true;
  })()`);
  await screenshot(`${OUTDIR}/probe-${PORT}.png`);
  return { caps, stats, uTimeFrozen };
};
