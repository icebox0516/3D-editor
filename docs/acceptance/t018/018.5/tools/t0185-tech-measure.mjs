// tech 候选量化：金属球区（左/中/右 x 三区）纯白占比 + 地面带亮度——选 ibl 终值
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const out = {};
  for (const f of ['tf-tech-metal-d020-i070.png', 'tf-tech-metal-d020-i035.png']) {
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
      const region = (x0, x1, y0, y1) => {
        let white = 0, n = 0, luma = 0;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          if (Math.min(d[i], d[i+1], d[i+2]) >= 240) white++;
          luma += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]; n++;
        }
        return { white: +(white/n).toFixed(3), luma: Math.round(luma/n) };
      };
      return {
        sphereL: region(600, 780, 460, 620),
        sphereM: region(870, 1050, 460, 620),
        sphereR: region(1140, 1320, 460, 620),
        ground: region(308, 1600, 800, 1000),
      };
    })(${JSON.stringify(b64)})`);
  }
  return out;
};
