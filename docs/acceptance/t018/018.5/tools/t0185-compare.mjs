// 新旧对照表：018.5/<preset>-<subject>.png vs 018.0/<preset>-<subject>.png 视口分带（skyTop/groundBottom）
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const pairs = [];
  for (const p of ['day', 'dusk', 'night', 'tech'])
    for (const s of ['tree3a', 'celtis', 'camphor', 'streetlamp', 'glb', 'metal']) pairs.push(`${p}-${s}`);
  const out = {};
  for (const name of pairs) {
    const a = readFileSync('../../018.0/' + name + '.png').toString('base64');
    const b = readFileSync('../' + name + '.png').toString('base64');
    out[name] = await evalJs(`(async () => {
      const load = async (b64) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, c.width, c.height).data;
      };
      const A = await load(${JSON.stringify(a)}), B = await load(${JSON.stringify(b)});
      const R = { x: 308, y: 66, w: 1292, h: 932 };
      const band = (y0f, y1f) => {
        const y0 = R.y + Math.floor(R.h * y0f), y1 = R.y + Math.ceil(R.h * y1f);
        let la = 0, lb = 0, n = 0, d = 0, dp = 0;
        for (let y = y0; y < y1; y++) for (let x = R.x; x < R.x + R.w; x++) {
          const i = (y * R.w * 0 + i0(x, y)) * 4;
          const va = 0.2126*A[i] + 0.7152*A[i+1] + 0.0722*A[i+2];
          const vb = 0.2126*B[i] + 0.7152*B[i+1] + 0.0722*B[i+2];
          la += va; lb += vb; n++;
          const dd = Math.abs(va - vb);
          d += dd; if (dd > 2) dp++;
        }
        return { oldLuma: +(la/n).toFixed(1), newLuma: +(lb/n).toFixed(1), meanAbsDiff: +(d/n).toFixed(2), diffFrac: +(dp/n).toFixed(4) };
      };
      function i0(x, y) { return y * 1920 + x; }
      return { skyTop: band(0, 0.15), groundBottom: band(0.80, 1) };
    })()`);
  }
  return out;
};
