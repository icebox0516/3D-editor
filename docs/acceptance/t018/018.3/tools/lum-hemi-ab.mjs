// day 删 Hemi 对照：018.2 day-metal-ibl.png（Hemi+IBL 偏亮中间态）vs 018.3 day-metal-nohemi.png（纯 IBL）
import { readFileSync } from 'node:fs';
const a = readFileSync(new URL('../../018.2/day-metal-ibl.png', import.meta.url)).toString('base64');
const b = readFileSync(new URL('../day-metal-nohemi.png', import.meta.url)).toString('base64');
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  return evalJs(`(async () => {
    const out = {};
    for (const [name, b64] of [['t0182_hemi_ibl', ${JSON.stringify(a)}], ['t0183_ibl_only', ${JSON.stringify(b)}]]) {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const region = (x, y, w, h) => {
        const d = ctx.getImageData(x, y, w, h).data;
        let sum = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { sum += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]; n++; }
        return +(sum / n).toFixed(1);
      };
      const W = img.width, H = img.height;
      // 金属三球主体区（注入机位 (0,1.1,5.2)→(0,0.55,0)，球带约在画面中部横带）
      out[name] = { full: region(0,0,W,H), balls: region(Math.round(W*0.2), Math.round(H*0.35), Math.round(W*0.6), Math.round(H*0.35)), skyTop: region(0,0,W,Math.round(H*0.2)) };
    }
    return out;
  })()`);
};
