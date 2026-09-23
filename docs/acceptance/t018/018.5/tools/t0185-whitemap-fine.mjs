// 24 行白色分布：dusk(1.0) / dusk(0.5) / dusk 无云(1.0) / day(0.22) 对照——定位白区垂直范围 + UI 行干扰
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const out = {};
  for (const f of ['dusk-tree3a.png', 'dt-dusk-d05.png', 'dz-clouds0.png', 'day-tree3a.png']) {
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
      const ROWH = Math.floor(932 / 24);
      const rows = [];
      for (let ry = 0; ry < 24; ry++) {
        const y0 = 66 + ry * ROWH, y1 = y0 + ROWH;
        let white = 0, n = 0, mnSum = 0;
        for (let y = y0; y < y1; y++) for (let x = 308; x < 1600; x++) {
          const i = (y * W + x) * 4;
          const mn = Math.min(d[i], d[i+1], d[i+2]);
          if (mn >= 240) white++;
          mnSum += mn; n++;
        }
        rows.push('r' + String(ry).padStart(2) + ' y' + String(Math.round(ry*100/24)).padStart(2) + '% w' + (white/n).toFixed(2) + ' mn' + Math.round(mnSum/n));
      }
      return rows;
    })(${JSON.stringify(b64)})`);
  }
  return out;
};
