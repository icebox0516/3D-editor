// dusk 机位朝向验证：同参数下 视向近太阳（az35）vs 背太阳（az240）——背太阳侧若为深蓝/暖渐变无白洗 ⇒ 白区=正对低太阳的自然眩光，非预设缺陷
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
    const band = (y0f, y1f) => {
      const y0 = 66 + Math.floor(932 * y0f), y1 = 66 + Math.floor(932 * y1f);
      let white = 0, sat = 0, n = 0, r = 0, g = 0, b = 0;
      for (let y = y0; y < y1; y++) for (let x = 308; x < 1600; x++) {
        const i = (y * W + x) * 4;
        const mx = Math.max(d[i], d[i+1], d[i+2]), mn = Math.min(d[i], d[i+1], d[i+2]);
        if (mn >= 240) white++;
        sat += mx === 0 ? 0 : (mx - mn) / mx;
        r += d[i]; g += d[i+1]; b += d[i+2]; n++;
      }
      return { rgb: [Math.round(r/n), Math.round(g/n), Math.round(b/n)], white: +(white/n).toFixed(3), sat: +(sat/n).toFixed(3) };
    };
    return { upper: band(0.03, 0.20), mid: band(0.20, 0.33) };
  })`;
  const { writeFileSync } = await import('node:fs');
  const log = { views: [] };
  for (const [label, az] of [['toward-sun', 35], ['away-sun', 240]]) {
    await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: ${az}, elevationDeg: 8 })`);
    await sleep(700);
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`../daz-${label}.png`, Buffer.from(r.data, 'base64'));
    log.views.push({ label, az, metrics: await evalJs(`${METRIC}(${JSON.stringify(r.data)})`) });
    console.log(`[${label}] done`);
  }
  await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 }); window.__envProbe.setPreset('day'); window.__tree3a.unfreezeTime(); true`);
  return log;
};
