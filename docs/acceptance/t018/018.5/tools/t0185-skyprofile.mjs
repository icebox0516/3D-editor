// 天空带色彩剖面：新/旧四预设 tree3a 帧，视口天空区按水平条带（4 层）取 RGB 均值 + 通道饱和占比
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const list = [];
  for (const p of ['day', 'dusk', 'night', 'tech']) { list.push(['new', p, '../' + p + '-tree3a.png']); list.push(['old', p, '../../018.0/' + p + '-tree3a.png']); }
  const out = {};
  for (const [side, preset, path] of list) {
    const b64 = readFileSync(path).toString('base64');
    out[side + '-' + preset] = await evalJs(`(async (b64) => {
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
      const SKY_H = Math.floor(R.h * 0.30); // 天空能覆盖到地平线（本机位地平线约 35%）
      const strips = [];
      for (let s = 0; s < 6; s++) {
        const y0 = R.y + Math.floor(SKY_H * s / 6), y1 = R.y + Math.floor(SKY_H * (s + 1) / 6);
        let r = 0, g = 0, b = 0, n = 0, clip = 0;
        for (let y = y0; y < y1; y++) for (let x = R.x; x < R.x + R.w; x++) {
          const i = (y * W + x) * 4;
          if (Math.max(d[i], d[i+1], d[i+2]) >= 252) clip++;
          r += d[i]; g += d[i+1]; b += d[i+2]; n++;
        }
        strips.push({ yf: +(s / 6).toFixed(2), rgb: [Math.round(r/n), Math.round(g/n), Math.round(b/n)], clip: +(clip/n).toFixed(3) });
      }
      return strips;
    })(${JSON.stringify(b64)})`);
  }
  return out;
};
