// 修正过曝判据：whiteness = min(R,G,B) ≥ 240 的占比（真白色裁剪）；附饱和度 (max-min)/max 均值
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const files = [
    'day-tree3a.png', 'dusk-tree3a.png', 'night-tree3a.png', 'tech-tree3a.png',
    'dt-tech-d02.png', 'dt-tech-d015.png', 'dt-dusk-d07.png', 'dt-dusk-d05.png', 'dt-dusk-d035.png', 'dt-dusk-d025.png',
  ];
  const out = {};
  for (const f of files) {
    const b64 = readFileSync('../' + f).toString('base64');
    out[f] = await evalJs(`(async (b64) => {
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
      const SKY_H = Math.floor(R.h * 0.28);
      let white = 0, satSum = 0, n = 0, r = 0, g = 0, b = 0;
      for (let y = R.y; y < R.y + SKY_H; y++) for (let x = R.x; x < R.x + R.w; x++) {
        const i = (y * W + x) * 4;
        const mx = Math.max(d[i], d[i+1], d[i+2]), mn = Math.min(d[i], d[i+1], d[i+2]);
        if (mn >= 240) white++;
        satSum += mx === 0 ? 0 : (mx - mn) / mx;
        r += d[i]; g += d[i+1]; b += d[i+2]; n++;
      }
      return { meanRGB: [Math.round(r/n), Math.round(g/n), Math.round(b/n)], whiteFrac: +(white/n).toFixed(4), meanSat: +(satSum/n).toFixed(3) };
    })(${JSON.stringify(b64)})`);
  }
  return out;
};
