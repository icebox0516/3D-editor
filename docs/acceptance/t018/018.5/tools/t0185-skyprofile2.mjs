// 复用 strip 剖面：分析已有 tech display 扫描帧（run1 显式 setDisplayIntensity，帧有效）
import { readFileSync, existsSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const files = ['tune-tech-tree-disp-07.png', 'tune-tech-tree-disp-05.png', 'tune-tech-tree-disp-035.png', 'tune-night-tree-base.png', 'tune-dusk-tree-base.png'];
  const out = {};
  for (const f of files) {
    if (!existsSync('../' + f)) continue;
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
    })(${JSON.stringify(b64)})`);
  }
  return out;
};
