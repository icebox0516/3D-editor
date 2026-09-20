// T011.3 疑点探针①：皮组斑驳色差像素统计（树皮 T26 机位 2.6m az35 el-15）
// 方法：从渲染帧直接统计树干矩形窗内暖色像素（R-G > 阈值）占比 + 灰基底均色——
// 判据：斑驳暖斑占比应落 Spec 域 15–30%（工程标定 25%）；基底应读灰绿（G≥R）
// （帧内树干位置由已知机位几何定位：25°方位俯角仰拍、干位于画面中央附近）
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function decodePng(file) {
  const buf = readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8, w = 0, h = 0, bitDepth = 0, colorType = 0, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) throw new Error(`unsupported ${bitDepth}/${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = colorType === 6 ? 4 : 3, stride = w * bpp, out = Buffer.alloc(h * stride);
  const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], rowIn = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), rowOut = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? rowOut[x - bpp] : 0, b = y > 0 ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v = rowIn[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) v += paeth(a, b, c);
      rowOut[x] = v;
    }
  }
  return { w, h, px: out };
}

const img = decodePng('screenshots/t011-0113/bark-2p6m-az35.png');
// 树干窗：T26 az35 机位主干居中偏下——取中央竖带（x 38%–62%，y 35%–92%）
const x0 = Math.floor(img.w * 0.38), x1 = Math.floor(img.w * 0.62);
const y0 = Math.floor(img.h * 0.35), y1 = Math.floor(img.h * 0.92);
let total = 0, warm = 0, greenBase = 0, sumR = 0, sumG = 0, sumB = 0;
const warmHist = [];
for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
  const i = (y * img.w + x) * 3, r = img.px[i], g = img.px[i + 1], b = img.px[i + 2];
  total++;
  sumR += r; sumG += g; sumB += b;
  const rg = r - g;
  if (rg > 8) { warm++; if (rg > 24) warmHist.push(rg); }
  else if (g >= r) greenBase++;
}
const res = {
  window: { x0, x1, y0, y1 }, total,
  warmFrac: +(warm / total).toFixed(4),
  greenBaseFrac: +(greenBase / total).toFixed(4),
  baseMean: [+(sumR / total).toFixed(1), +(sumG / total).toFixed(1), +(sumB / total).toFixed(1)],
  strongWarmFrac: +(warmHist.length / total).toFixed(4),
};
writeFileSync('docs/acceptance/t011/011.3/probe-barkwarm.json', JSON.stringify(res, null, 2));
console.log(JSON.stringify(res));
