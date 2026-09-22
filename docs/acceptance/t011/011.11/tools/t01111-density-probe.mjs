// T011.11 冠层密度定量探针 v2（疑点③）：先由绿像元定冠包围盒，盒内统计绿覆盖/天光空隙——
// 树只占画幅中央带的帧适用（v1 全行宽稀释 bug 修正；绿阈值放宽容纳背光深绿）。
// 用法：node t01111-density-probe.mjs <a.png> <b.png> ...
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
function decodePng(buf) {
  let pos = 8, width = 0, height = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const rows = new Array(height);
  let p = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[p++]; const out = Buffer.alloc(stride);
    const prev = y > 0 ? rows[y - 1] : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? out[i - bpp] : 0, b = prev ? prev[i] : 0, c = i >= bpp && prev ? prev[i - bpp] : 0;
      let v = raw[p + i];
      if (f === 1) v = (v + a) & 255; else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; }
      out[i] = v;
    }
    p += stride; rows[y] = out;
  }
  return { width, height, bpp, rows };
}
const pxAt = (img, x, y) => [img.rows[y][x * img.bpp], img.rows[y][x * img.bpp + 1], img.rows[y][x * img.bpp + 2]];
const isGreen = ([r, g, b]) => g > 35 && g > r + 5 && g > b + 5;
const isSky = ([r, g, b]) => r > 140 && g > 160 && b > 170 && b >= r - 10;
// 编辑器视口 canvas 固定区域（011.10 t01110-m25-pixel-probe 同界——1920×1080 窗口内主视口画布，UI 面板不入场）
const RX = 308, RY = 66, RW = 972, RH = 752;
for (const file of process.argv.slice(2)) {
  const img = decodePng(readFileSync(file));
  // 冠包围盒（canvas 区域内）：绿像元行列范围（步长采样）
  let topG = -1, botG = -1, minX = RW, maxX = 0;
  for (let y = 0; y < RH; y += 2) for (let x = 0; x < RW; x += 4) {
    if (isGreen(pxAt(img, RX + x, RY + y))) {
      if (topG < 0) topG = y;
      botG = y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  // 盒内统计（绿像元包围盒全域；步长 2）
  let green = 0, sky = 0, total = 0;
  for (let y = topG; y <= botG; y += 2) for (let x = minX; x <= maxX; x += 2) {
    const px = pxAt(img, RX + x, RY + y);
    total++;
    if (isGreen(px)) green++;
    else if (isSky(px)) sky++;
  }
  console.log(JSON.stringify({
    file: file.split(/[\\/]/).pop(),
    crownBBox: { y: [topG, botG], x: [minX, maxX], w: maxX - minX, h: botG - topG },
    greenCoverPct: +(green / total * 100).toFixed(1),
    skyGapPct: +(sky / total * 100).toFixed(1),
    otherPct: +((1 - green / total - sky / total) * 100).toFixed(1),
  }));
}
