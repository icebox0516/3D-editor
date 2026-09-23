// dusk/tech 显示域压缩补扫（重启后新接线；strip 剖面 + 帧留档）
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
  const PROFILE = `(async (b64) => {
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
    const SKY_H = Math.floor(R.h * 0.30);
    const strips = [];
    for (let s = 0; s < 6; s++) {
      const y0 = R.y + Math.floor(SKY_H * s / 6), y1 = R.y + Math.floor(SKY_H * (s + 1) / 6);
      let r = 0, g = 0, b = 0, n = 0, clip = 0;
      for (let y = y0; y < y1; y++) for (let x = R.x; x < R.x + R.w; x++) {
        const i = (y * W + x) * 4;
        if (Math.max(d[i], d[i+1], d[i+2]) >= 252) clip++;
        r += d[i]; g += d[i+1]; b += d[i+2]; n++;
      }
      strips.push({ rgb: [Math.round(r/n), Math.round(g/n), Math.round(b/n)], clip: +(clip/n).toFixed(3) });
    }
    return strips;
  })`;
  const { writeFileSync } = await import('node:fs');
  const log = { sweeps: {} };
  for (const [preset, displays] of [['dusk', [0.7, 0.5, 0.35, 0.25]], ['tech', [0.4, 0.3, 0.2, 0.15]]]) {
    await evalJs(`window.__envProbe.setPreset('${preset}')`);
    await sleep(900);
    const rows = [];
    for (const disp of displays) {
      await evalJs(`window.__sky.setDisplayIntensity(${disp}); true`);
      await sleep(250);
      const r = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(`../dt-${preset}-d${String(disp).replace('.', '')}.png`, Buffer.from(r.data, 'base64'));
      rows.push({ disp, strips: await evalJs(`${PROFILE}(${JSON.stringify(r.data)})`) });
    }
    log.sweeps[preset] = rows;
    console.log(`[${preset}] done`);
  }
  await evalJs(`window.__envProbe.setPreset('day'); window.__tree3a.unfreezeTime(); true`);
  return log;
};
