// 裁剪统计自检：d0.2 与 d0.15 帧，逐 strip 输出 max-channel 直方图桶 + 高像素占比
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const out = {};
  for (const f of ['dt-tech-d02.png', 'dt-tech-d015.png']) {
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
      const W = c.width, H = c.height;
      const R = { x: 308, y: 66, w: 1292, h: 932 };
      const SKY_H = Math.floor(R.h * 0.30);
      const strips = [];
      for (let s = 0; s < 6; s++) {
        const y0 = R.y + Math.floor(SKY_H * s / 6), y1 = R.y + Math.floor(SKY_H * (s + 1) / 6);
        let n = 0, ge252 = 0, ge200 = 0, ge150 = 0, maxSeen = 0;
        for (let y = y0; y < y1; y++) for (let x = R.x; x < R.x + R.w; x++) {
          const i = (y * W + x) * 4;
          const m = Math.max(d[i], d[i+1], d[i+2]);
          if (m >= 252) ge252++; else if (m >= 200) ge200++; else if (m >= 150) ge150++;
          maxSeen = Math.max(maxSeen, m); n++;
        }
        strips.push({ yRange: [y0, y1], n, ge252: +(ge252/n).toFixed(3), ge200: +(ge200/n).toFixed(3), ge150: +(ge150/n).toFixed(3), maxSeen });
      }
      return { size: [W, H], strips };
    })(${JSON.stringify(b64)})`);
  }
  return out;
};
