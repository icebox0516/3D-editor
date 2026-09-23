// 白区归因隔离：dusk 云量 0（其余参数不动，display 1.0）——白区消失 ⇒ 白=云团；仍在 ⇒ 白=Mie/天空自身
export default async ({ navigate, setViewport, evalJs, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  await evalJs(`window.__tree3a.freezeTime(); (async () => {
    window.__tree3aPerf.clear();
    window.__tree3aPerf.place({ count: 1, seedBase: 1, spacing: 11, jitter: false, assetId: 'asset_tree_3a' });
    window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    return true;
  })()`);
  await sleep(900);
  await evalJs(`window.__envProbe.setPreset('dusk')`);
  await sleep(900);
  const METRIC = `(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const W = c.width;
    const R = { x: 308, y: 66, w: 1292, h: 932 };
    const band = (y0f, y1f) => {
      const y0 = R.y + Math.floor(R.h * y0f), y1 = R.y + Math.floor(R.h * y1f);
      let white = 0, sat = 0, n = 0, r = 0, g = 0, b = 0;
      for (let y = y0; y < y1; y++) for (let x = R.x; x < R.x + R.w; x++) {
        const i = (y * W + x) * 4;
        const mx = Math.max(d[i], d[i+1], d[i+2]), mn = Math.min(d[i], d[i+1], d[i+2]);
        if (mn >= 240) white++;
        sat += mx === 0 ? 0 : (mx - mn) / mx;
        r += d[i]; g += d[i+1]; b += d[i+2]; n++;
      }
      return { rgb: [Math.round(r/n), Math.round(g/n), Math.round(b/n)], white: +(white/n).toFixed(3), sat: +(sat/n).toFixed(3) };
    };
    return { upper: band(0.03, 0.20), mid: band(0.20, 0.33), horizon: band(0.33, 0.40) };
  })`;
  const { writeFileSync } = await import('node:fs');
  const log = { variants: [] };
  const VARIANTS = [
    { id: 'clouds0', patch: { cloudCoverage: 0 }, display: 1.0 },
    { id: 'clouds0-d05', patch: { cloudCoverage: 0 }, display: 0.5 },
  ];
  for (const v of VARIANTS) {
    await evalJs(`window.__envProbe.setPreset('dusk')`);
    await sleep(700);
    await evalJs(`window.__sky.patchAtmosphere(${JSON.stringify(v.patch)}); window.__sky.setDisplayIntensity(${v.display}); true`);
    await sleep(600);
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`../dz-${v.id}.png`, Buffer.from(r.data, 'base64'));
    log.variants.push({ ...v, metrics: await evalJs(`${METRIC}(${JSON.stringify(r.data)})`) });
    console.log(`[${v.id}] done`);
  }
  await evalJs(`window.__envProbe.setPreset('day'); window.__tree3a.unfreezeTime(); true`);
  return log;
};
