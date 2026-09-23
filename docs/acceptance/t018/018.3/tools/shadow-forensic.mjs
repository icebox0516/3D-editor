// 阴影取证：day-tree 帧地面区域（树下投影带）vs 天空带的亮度分布——投影应显著低于周围地面
import { readFileSync } from 'node:fs';
const day = readFileSync(new URL('../day-tree-preset.png', import.meta.url)).toString('base64');
const dusk = readFileSync(new URL('../dusk-tree-preset.png', import.meta.url)).toString('base64');
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
    const D = await load(${JSON.stringify(day)}), K = await load(${JSON.stringify(dusk)});
    const W = D.width, H = D.height;
    // 树影取证：地面带（y 60%-80%）逐列平均亮度——阴影应在特定列形成低谷
    const colAvg = (img, y0, y1) => {
      const cols = [];
      for (let x = 0; x < W; x += 24) {
        let s = 0, n = 0;
        for (let y = y0; y < y1; y++) { const i = (y * W + x) * 4; s += 0.2126*img.data[i] + 0.7152*img.data[i+1] + 0.0722*img.data[i+2]; n++; }
        cols.push(Math.round(s / n));
      }
      return cols;
    };
    const dayCols = colAvg(D, Math.round(H*0.62), Math.round(H*0.78));
    const duskCols = colAvg(K, Math.round(H*0.62), Math.round(H*0.78));
    const minMax = (a) => ({ min: Math.min(...a), max: Math.max(...a), spread: Math.max(...a) - Math.min(...a) });
    return {
      dayGroundCols: dayCols,
      dayGroundStats: minMax(dayCols),
      duskGroundCols: duskCols,
      duskGroundStats: minMax(duskCols),
    };
  })()`);
};
