import { readFileSync } from 'node:fs';
const read = (f) => readFileSync(new URL('../' + f, import.meta.url)).toString('base64');
const night = read('liveness-night.png'), base = read('liveness-day-base.png'), red = read('liveness-day-redhemi.png');
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  return evalJs(`(async () => {
    const load = async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      cv.getContext('2d').drawImage(img, 0, 0);
      return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);
    };
    const N = await load(${JSON.stringify(night)}), B = await load(${JSON.stringify(base)}), R = await load(${JSON.stringify(red)});
    const W = B.width, H = B.height;
    const avg = (img, x, y, w, h) => {
      let r = 0, g = 0, bl = 0, n = 0;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
        const i = (yy * W + xx) * 4;
        r += img.data[i]; g += img.data[i+1]; bl += img.data[i+2]; n++;
      }
      return { r: Math.round(r/n), g: Math.round(g/n), b: Math.round(bl/n) };
    };
    return {
      nightGround: avg(N, 0, Math.round(H*0.75), W, Math.round(H*0.2)),
      dayBaseGround: avg(B, 0, Math.round(H*0.75), W, Math.round(H*0.2)),
      redHemiGround: avg(R, 0, Math.round(H*0.75), W, Math.round(H*0.2)),
    };
  })()`);
};
