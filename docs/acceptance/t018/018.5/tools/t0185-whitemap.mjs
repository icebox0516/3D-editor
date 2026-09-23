// 白色像素粗分布图（视口 24×12 网格）：判定「白」是云团局部还是全天空均匀
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const out = {};
  for (const f of ['dt-dusk-d07.png', 'dt-dusk-d05.png', 'dt-dusk-d035.png', 'dt-dusk-d025.png']) {
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
      const COLS = 24, ROWS = 12;
      const rows = [];
      for (let ry = 0; ry < ROWS; ry++) {
        let line = '';
        for (let rx = 0; rx < COLS; rx++) {
          const x0 = R.x + Math.floor(R.w * rx / COLS), x1 = R.x + Math.floor(R.w * (rx + 1) / COLS);
          const y0 = R.y + Math.floor(R.h * ry / ROWS), y1 = R.y + Math.floor(R.h * (ry + 1) / ROWS);
          let w = 0, n = 0;
          for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
            const i = (y * W + x) * 4;
            if (Math.min(d[i], d[i+1], d[i+2]) >= 240) w++;
            n++;
          }
          const f = w / n;
          line += f > 0.85 ? '#' : f > 0.5 ? '+' : f > 0.15 ? '.' : ' ';
        }
        rows.push(line);
      }
      return rows;
    })(${JSON.stringify(b64)})`);
  }
  return out;
};
