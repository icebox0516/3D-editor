// 018.0 legacy day 基线帧的视口分带参考读数（同一视口矩形——同窗口同布局）
import { readFileSync } from 'node:fs';
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const files = ['day-tree3a.png', 'day-metal.png', 'night-tree3a.png'];
  const result = {};
  for (const name of files) {
    const b64 = readFileSync('../../018.0/' + name).toString('base64');
    result[name] = await evalJs(`(async (b64) => {
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
        let lumaSum = 0, lumaSq = 0, n = 0, rSum = 0, bSum = 0;
        for (let y = Math.max(0, Math.floor(y0)); y < Math.min(c.height, Math.ceil(y1)); y++)
          for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x++) {
            const i = (y * W + x) * 4;
            const luma = 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
            lumaSum += luma; lumaSq += luma*luma; rSum += d[i]; bSum += d[i+2]; n++;
          }
        const mean = lumaSum / n;
        return { meanLuma: +mean.toFixed(1), lumaStd: +Math.sqrt(Math.max(0, lumaSq/n - mean*mean)).toFixed(1), rOverB: +(rSum/bSum).toFixed(3) };
      };
      const R = { x: 308, y: 66, w: 1292, h: 932 };
      return {
        skyTop: stats(R.x, R.x + R.w, R.y, R.y + R.h * 0.15),
        groundBottom: stats(R.x, R.x + R.w, R.y + R.h * 0.80, R.y + R.h),
      };
    })(${JSON.stringify(b64)})`);
  }
  return result;
};
