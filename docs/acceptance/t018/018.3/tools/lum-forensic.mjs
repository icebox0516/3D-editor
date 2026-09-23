import { readFileSync } from 'node:fs';
const read = (f) => readFileSync(new URL('../' + f, import.meta.url)).toString('base64');
const base = read('forensic-ball-base.png'), sunoff = read('forensic-ball-sunoff.png'), restored = read('forensic-ball-sunrestored.png'), red = read('forensic-ball-redhemi.png');
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
    const A = await load(${JSON.stringify(base)}), B = await load(${JSON.stringify(sunoff)}), C = await load(${JSON.stringify(restored)}), D = await load(${JSON.stringify(red)});
    const W = A.width, H = A.height;
    const avg = (img, x, y, w, h) => {
      let r = 0, g = 0, bl = 0, n = 0;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
        const i = (yy * W + xx) * 4;
        r += img.data[i]; g += img.data[i+1]; bl += img.data[i+2]; n++;
      }
      return { r: Math.round(r/n), g: Math.round(g/n), b: Math.round(bl/n) };
    };
    // 球体中心区域（机位 (0,1.1,5.2)→(0,0.55,0)，球 r=0.5 @ (0,0.5,0)——约画面中心）
    return {
      baseBall: avg(A, Math.round(W*0.42), Math.round(H*0.42), Math.round(W*0.16), Math.round(H*0.16)),
      sunOffBall: avg(B, Math.round(W*0.42), Math.round(H*0.42), Math.round(W*0.16), Math.round(H*0.16)),
      restoredBall: avg(C, Math.round(W*0.42), Math.round(H*0.42), Math.round(W*0.16), Math.round(H*0.16)),
      redHemiBall: avg(D, Math.round(W*0.42), Math.round(H*0.42), Math.round(W*0.16), Math.round(H*0.16)),
      baseGround: avg(A, 0, Math.round(H*0.8), W, Math.round(H*0.15)),
      redHemiGround: avg(D, 0, Math.round(H*0.8), W, Math.round(H*0.15)),
    };
  })()`);
};
