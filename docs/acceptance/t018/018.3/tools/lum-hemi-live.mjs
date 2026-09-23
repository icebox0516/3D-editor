// hemi-live-before vs hemi-live-after 分带亮度 diff
import { readFileSync } from 'node:fs';
const a = readFileSync(new URL('../hemi-live-before.png', import.meta.url)).toString('base64');
const b = readFileSync(new URL('../hemi-live-after.png', import.meta.url)).toString('base64');
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  return evalJs(`(async () => {
    const load = async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.getContext('2d').getImageData(0, 0, img.width, img.height);
    };
    const A = await load(${JSON.stringify(a)}), B = await load(${JSON.stringify(b)});
    const W = A.width, H = A.height;
    const rows = [];
    for (let band = 0; band < 6; band++) {
      const y0 = Math.floor(H * band / 6), y1 = Math.floor(H * (band + 1) / 6);
      let diffSum = 0, n = 0, lumaA = 0;
      for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const la = 0.2126*A.data[i] + 0.7152*A.data[i+1] + 0.0722*A.data[i+2];
        const lb = 0.2126*B.data[i] + 0.7152*B.data[i+1] + 0.0722*B.data[i+2];
        diffSum += Math.abs(la - lb); n++; lumaA += la;
      }
      rows.push({ band, meanLumaBefore: +(lumaA / n).toFixed(1), meanAbsDiff: +(diffSum / n).toFixed(2) });
    }
    return rows;
  })()`);
};
