// 量化判读：四预设帧 + 018.2 Hemi 对照帧的分区平均亮度（node 读文件 → 页内 canvas 解码）
import { readFileSync } from 'node:fs';
const dir = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const imgs = ['day-tree-preset.png','dusk-tree-preset.png','night-tree-preset.png','tech-tree-preset.png',
  'day-metal-nohemi.png','fallback-legacy-dusk.png','recovery-dusk.png'];
const payload = Object.fromEntries(imgs.map(f => [f, readFileSync(dir + f).toString('base64')]));
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  return evalJs(`(async () => {
    const imgs = ${JSON.stringify(payload)};
    const out = {};
    for (const [name, b64] of Object.entries(imgs)) {
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
      out[name] = {
        full: region(0, 0, W, H),
        skyTop: region(0, 0, W, Math.round(H*0.25)),
        mid: region(0, Math.round(H*0.35), W, Math.round(H*0.25)),
        bottom: region(0, Math.round(H*0.7), W, Math.round(H*0.3)),
      };
    }
    return out;
  })()`);
};
