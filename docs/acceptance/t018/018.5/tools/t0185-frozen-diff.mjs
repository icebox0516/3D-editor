// 冻结云双帧一致性（epic 第 12 条视觉侧）：frozen-cloud-a/b 视口全区域逐像素 diff
export default async ({ navigate, evalJs }) => {
  await navigate('about:blank');
  const read = (f) => evalJs(`(async () => {
    const { readFileSync } = {};
    return null;
  })()`).catch(() => null);
  const b64a = (await import('node:fs')).readFileSync('../frozen-cloud-a.png').toString('base64');
  const b64b = (await import('node:fs')).readFileSync('../frozen-cloud-b.png').toString('base64');
  return evalJs(`(async () => {
    const load = async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, c.width, c.height);
    };
    const A = await load(${JSON.stringify(b64a)}), B = await load(${JSON.stringify(b64b)});
    const R = { x: 308, y: 66, w: 1292, h: 932 };
    let diff = 0, maxD = 0, n = 0, diffPx = 0;
    for (let y = R.y; y < R.y + R.h; y++) for (let x = R.x; x < R.x + R.w; x++) {
      const i = (y * A.width + x) * 4;
      const d = Math.abs(A.data[i]-B.data[i]) + Math.abs(A.data[i+1]-B.data[i+1]) + Math.abs(A.data[i+2]-B.data[i+2]);
      if (d > 0) diffPx++;
      maxD = Math.max(maxD, d); diff += d; n++;
    }
    return { pixels: n, diffPixels: diffPx, meanAbsDiff: +(diff/(n*3)).toFixed(6), maxAbsDiffSum: maxD };
  })()`);
};
