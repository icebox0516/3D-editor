// day 组合微调：display × ibl 小网格（tree 机位）+ 度量（视口分带 + rOverB 蓝主导 + 地面 std 阴影代理）
export default async ({ navigate, setViewport, evalJs, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const probe = await evalJs(`(() => ({ sky: !!window.__sky, perf: !!window.__tree3aPerf }))()`);
  if (!probe.sky || !probe.perf) throw new Error('probes missing');

  await evalJs(`window.__tree3a.freezeTime(); (async () => {
    window.__tree3aPerf.clear();
    window.__tree3aPerf.place({ count: 1, seedBase: 1, spacing: 11, jitter: false, assetId: 'asset_tree_3a' });
    window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    return true;
  })()`);
  await sleep(900);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(900);

  const METRIC_FN = `(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const W = c.width;
    const stats = (x0, x1, y0, y1) => {
      let lumaSum = 0, lumaSq = 0, n = 0, rSum = 0, bSum = 0, sat = 0;
      for (let y = Math.max(0, Math.floor(y0)); y < Math.min(c.height, Math.ceil(y1)); y++)
        for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x++) {
          const i = (y * W + x) * 4;
          const luma = 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
          if (Math.max(d[i], d[i+1], d[i+2]) >= 250) sat++;
          lumaSum += luma; lumaSq += luma*luma; rSum += d[i]; bSum += d[i+2]; n++;
        }
      const mean = lumaSum / n;
      return { satFrac: +(sat/n).toFixed(4), meanLuma: +mean.toFixed(1), lumaStd: +Math.sqrt(Math.max(0, lumaSq/n - mean*mean)).toFixed(1), rOverB: +(rSum/bSum).toFixed(3) };
    };
    const R = { x: 308, y: 66, w: 1292, h: 932 };
    return {
      skyTop: stats(R.x, R.x + R.w, R.y, R.y + R.h * 0.15),
      groundBottom: stats(R.x, R.x + R.w, R.y + R.h * 0.80, R.y + R.h),
    };
  })`;
  const { writeFileSync } = await import('node:fs');
  async function shotMetrics(name) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`../combo-${name}.png`, Buffer.from(res.data, 'base64'));
    return evalJs(`${METRIC_FN}(${JSON.stringify(res.data)})`);
  }

  const log = { combos: [] };
  for (const display of [0.28, 0.22]) {
    for (const ibl of [0.30, 0.25, 0.20, 0.15]) {
      await evalJs(`window.__sky.setDisplayIntensity(${display}); window.__sky.setIblIntensity(${ibl}); true`);
      await sleep(650);
      const name = `d${String(display).replace('.', '')}-i${String(ibl).replace('.', '')}`;
      log.combos.push({ display, ibl, metrics: await shotMetrics(name) });
    }
  }
  // 恢复表值
  await evalJs(`window.__envProbe.setPreset('day'); window.__tree3a.unfreezeTime(); true`);
  return log;
};
