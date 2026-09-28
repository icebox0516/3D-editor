// T024.5 Step C 干区跨卡一致取证（单树一会话，current 构建 5173）。
// 序：navigate → 等 app 就绪 → freezeTime(2.5) → place 默认卡（不传 preset）→ view M25 →
// 池就绪稳定 → sleep(1100) → 截 <id>-default.png → place autumn（place 幂等自动换场景，
// 同冻结相位/同机位/同几何）→ 池就绪稳定 → sleep(1100) → 截 <id>-autumn.png。
// 截帧 clip 到 ed-viewport canvas 矩形（同 shot-regression 口径）。
// 用法：PORT=5173 OUTDIR=<dir> ASSET_ID=asset_tree_ginkgo node cdp.mjs shot-invariance.mjs
const PORT = process.env.PORT ?? '5173';
const OUTDIR = process.env.OUTDIR ?? '.';
const ASSET_ID = process.env.ASSET_ID;
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

  const rect = JSON.parse(await evalJs(`JSON.stringify((() => {
    const r = document.querySelector('canvas.ed-viewport__canvas').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  })())`));
  const clip = { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.w), height: Math.round(rect.h), scale: 1 };

  await evalJs('window.__tree3aPerf.freezeTime(2.5)');

  const waitPoolStable = async () => {
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
    await sleep(1100); // 024.3 节奏
    return { stable, stats };
  };

  const shoot = async (suffix) => {
    const file = `${OUTDIR}/${ASSET_ID}-${suffix}.png`;
    await screenshot(file, { clip });
    return String(file);
  };

  // 默认卡（不传 preset）
  const placeDefault = await evalJs(
    `window.__tree3aPerf.place({ assetId: '${ASSET_ID}', count: 1, seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  const defPool = await waitPoolStable();
  const defaultFile = await shoot('default');

  // autumn 卡（幂等 place 自动清上一次；同冻结相位 2.5s / 同机位 / 同几何）
  const placeAutumn = await evalJs(
    `window.__tree3aPerf.place({ assetId: '${ASSET_ID}', count: 1, seedBase: 1, spacing: 11, jitter: false, preset: 'autumn' })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  const autPool = await waitPoolStable();
  const autumnFile = await shoot('autumn');

  const finalStats = JSON.parse(await evalJs(READ_STATS));

  return {
    assetId: ASSET_ID, port: Number(PORT), clip,
    placeDefaultOk: placeDefault === true, placeAutumnOk: placeAutumn === true,
    defaultStable: defPool.stable, autumnStable: autPool.stable,
    defaultFile, autumnFile,
    statsAtShot: finalStats,
  };
};
