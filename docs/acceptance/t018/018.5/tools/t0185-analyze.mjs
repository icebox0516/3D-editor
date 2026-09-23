// 离线重分析：tune-*.png 按渲染视口矩形（308,66,1292,932）分带——修正首版全窗带被 UI 污染
// sky 带 = 视口上部 18%（左/右两侧各 25% 列避开树冠 + 全宽对照）；ground 带 = 视口底部 20% 全宽
import { readdirSync, readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const files = readdirSync('..').filter((f) => f.startsWith('tune-') && f.endsWith('.png')).sort();
  const result = {};
  for (const f of files) {
    const b64 = readFileSync('../' + f).toString('base64');
    result[f] = await evalJs(`(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const W = c.width;
      const stats = (x0, x1, y0, y1) => {
        let sat = 0, lumaSum = 0, lumaSq = 0, n = 0;
        for (let y = Math.max(0, Math.floor(y0)); y < Math.min(c.height, Math.ceil(y1)); y++)
          for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x++) {
            const i = (y * W + x) * 4;
            const r = d[i], g = d[i+1], b = d[i+2];
            const luma = 0.2126*r + 0.7152*g + 0.0722*b;
            if (Math.max(r,g,b) >= 250) sat++;
            lumaSum += luma; lumaSq += luma*luma; n++;
          }
        const mean = lumaSum / n;
        return { satFrac: +(sat/n).toFixed(4), meanLuma: +mean.toFixed(1), lumaStd: +Math.sqrt(Math.max(0, lumaSq/n - mean*mean)).toFixed(1) };
      };
      const R = { x: 308, y: 66, w: 1292, h: 932 };
      const skyY0 = R.y, skyY1 = R.y + R.h * 0.18;
      const sideW = R.w * 0.25;
      return {
        skySides: { left: stats(R.x, R.x + sideW, skyY0, skyY1), right: stats(R.x + R.w - sideW, R.x + R.w, skyY0, skyY1) },
        skyFull: stats(R.x, R.x + R.w, skyY0, skyY1),
        ground: stats(R.x, R.x + R.w, R.y + R.h * 0.80, R.y + R.h),
      };
    })(${JSON.stringify(b64)})`);
  }
  return result;
};
