// T024.5 Step B 回归取证（单树单构建一会话——沿 024.4 通道记档「多 navigate 同 ws 有
// 挂起前科，单 navigate/会话」；驱动器每会话新建并回收标签页）。
// 序：navigate → 等 app 就绪 → freezeTime(2.5)（先冻结再放置——放置期新建材质拿到
// 确定 uTime）→ place 默认卡（不传 preset）→ view M25（25m/35°/8°，与 024.3 Contact
// Sheet 同口径）→ 池就绪轮询（objects===1 且 triangles>0 且连续两采样稳定）→
// 024.3 节奏 sleep(1100) → 截帧（clip 到 ed-viewport canvas 矩形 = 纯渲染面 + 确定性
// HUD 覆盖；排除状态栏 1Hz FPS 与跨构建 DOM 不同的停靠面板）。
// SANITY=1（首树一次）：连截 a/b 两帧（证冻结+稳定）→ unfreeze 3s 截帧（证冻结确实
// 生效非巧合）→ 再 freezeTime(2.5) 后截正式帧（证 seek 重定位确定性）。
// 用法：PORT=5173 OUTDIR=<dir> ASSET_ID=asset_tree_3a [SANITY=1] node cdp.mjs shot-regression.mjs
const PORT = process.env.PORT ?? '5173';
const OUTDIR = process.env.OUTDIR ?? '.';
const ASSET_ID = process.env.ASSET_ID;
const SANITY = process.env.SANITY === '1';
if (!ASSET_ID) throw new Error('ASSET_ID env required');

const READ_STATS = 'JSON.stringify(window.__tree3aPerf.stats())';

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

  await evalJs('window.__tree3aPerf.freezeTime(2.5)');
  const placeOk = await evalJs(
    `window.__tree3aPerf.place({ assetId: '${ASSET_ID}', count: 1, seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);

  // 池就绪：objects===1 且 triangles>0 且连续两次采样（400ms 间隔）triangles/drawCalls 稳定
  let prev = null;
  let stats = null;
  let stable = false;
  for (let i = 0; i < 60; i++) {
    stats = JSON.parse(await evalJs(READ_STATS));
    if (
      stats.objects === 1 && stats.triangles > 0 && prev !== null &&
      prev.triangles === stats.triangles && prev.drawCalls === stats.drawCalls
    ) { stable = true; break; }
    prev = stats;
    await sleep(400);
  }
  await sleep(1100); // 024.3 Contact Sheet 截帧节奏同口径

  const rect = JSON.parse(await evalJs(`JSON.stringify((() => {
    const r = document.querySelector('canvas.ed-viewport__canvas').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  })())`));
  const clip = { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.w), height: Math.round(rect.h), scale: 1 };

  let sanity = null;
  if (SANITY) {
    await screenshot(`${OUTDIR}/sanity-frozen-a.png`, { clip });
    await screenshot(`${OUTDIR}/sanity-frozen-b.png`, { clip });
    await evalJs('window.__tree3aPerf.unfreezeTime()');
    await sleep(3000);
    await screenshot(`${OUTDIR}/sanity-unfrozen.png`, { clip });
    await evalJs('window.__tree3aPerf.freezeTime(2.5)'); // 重定位同一相位
    await sleep(1100);
    sanity = { a: 'sanity-frozen-a.png', b: 'sanity-frozen-b.png', unfrozen: 'sanity-unfrozen.png' };
  }

  const file = `${OUTDIR}/${ASSET_ID}.png`;
  await screenshot(file, { clip });
  const finalStats = JSON.parse(await evalJs(READ_STATS));

  return {
    assetId: ASSET_ID, port: Number(PORT), placeOk: placeOk === true, poolStable: stable,
    clip, file: String(file), sanity,
    statsAtShot: finalStats,
  };
};
