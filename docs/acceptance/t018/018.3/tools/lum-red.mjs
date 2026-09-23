import { readFileSync } from 'node:fs';
const a = readFileSync(new URL('../hemi-live-before.png', import.meta.url)).toString('base64');
const b = readFileSync(new URL('../hemi-extreme-red.png', import.meta.url)).toString('base64');
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
    const stats = (img, x, y, w, h) => {
      let r = 0, g = 0, bl = 0, n = 0;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
        const i = (yy * W + xx) * 4;
        r += img.data[i]; g += img.data[i+1]; bl += img.data[i+2]; n++;
      }
      return { r: Math.round(r/n), g: Math.round(g/n), b: Math.round(bl/n) };
    };
    return {
      beforeGroundRGB: stats(A, 0, Math.round(H*0.75), W, Math.round(H*0.2)),
      redHemiGroundRGB: stats(B, 0, Math.round(H*0.75), W, Math.round(H*0.2)),
      beforeSkyRGB: stats(A, 0, 0, W, Math.round(H*0.15)),
      redHemiSkyRGB: stats(B, 0, 0, W, Math.round(H*0.15)),
    };
  })()`);
};
