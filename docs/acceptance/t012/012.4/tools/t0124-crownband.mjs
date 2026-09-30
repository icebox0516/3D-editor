// T012.4 白皮松冠带绿覆盖量化（T030 试行 P4——M25 基线帧像素量化数值列）
// 口径沿 012.2 终值带：冠带绿 = 冠带框内绿像素 / 框面积（012.2 metasequoia 冠带 34.3% /
// 012.1 cedrus 33.0%）；绿判据与 t0122-coverage.mjs 逐字同式（g > r+8 && g > b+8——
// 族先例工具复用，勿改判据常数）。冠带框 = 空场帧 vs 挂树帧差分掩膜的树像素 bbox
//（012.2 mask 法同型——bbox 被天空/地面/UI 稀释的问题由差分消除）。
// 用法：node t0124-crownband.mjs <empty.png> <mounted.png>
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
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const out = Buffer.alloc(width * height * 3);
  const prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (filter === 1) v += a; else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[i] = v & 0xff;
    }
    for (let x = 0; x < width; x++) {
      out[(y * width + x) * 3] = cur[x * bpp];
      out[(y * width + x) * 3 + 1] = cur[x * bpp + 1];
      out[(y * width + x) * 3 + 2] = cur[x * bpp + 2];
    }
    prev.set(cur);
  }
  return { width, height, data: out };
}

const [emptyFile, mountedFile] = process.argv.slice(2);
const a = decodePng(readFileSync(emptyFile));
const b = decodePng(readFileSync(mountedFile));
let minX = a.width, minY = a.height, maxX = 0, maxY = 0, changed = 0;
let bandGreen = 0;
let crownMinY = a.height, crownMaxY = 0;
for (let y = 0; y < a.height; y++) {
  for (let x = 0; x < a.width; x++) {
    const i = (y * a.width + x) * 3;
    const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (d > 24) { // 差分掩膜（树剪影 + 影子——012.2 mask 法同型阈值）
      changed++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
// 冠带 = 树掩膜 bbox 内逐像素绿判据（同 t0122-coverage 判据常数）；另记绿像素自包围盒
let gMinX = a.width, gMinY = a.height, gMaxX = 0, gMaxY = 0, green = 0;
for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    const i = (y * a.width + x) * 3, r = b.data[i], g = b.data[i + 1], bl = b.data[i + 2];
    if (g > r + 8 && g > bl + 8) {
      green++; bandGreen++;
      if (x < gMinX) gMinX = x; if (x > gMaxX) gMaxX = x;
      if (y < gMinY) gMinY = y; if (y > gMaxY) gMaxY = y;
    }
  }
}
const band = Math.max(1, (maxX - minX + 1) * (maxY - minY + 1));
const greenBox = (gMaxX >= gMinX && gMaxY >= gMinY) ? (gMaxX - gMinX + 1) * (gMaxY - gMinY + 1) : 1;
// 冠带内上半冠（y < 冠带中线——果/梢位）与下半冠分层读数
const mid = (minY + maxY) / 2;
let upperGreen = 0, upperBand = 0;
for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    const i = (y * a.width + x) * 3, r = b.data[i], g = b.data[i + 1], bl = b.data[i + 2];
    upperBand++;
    if (y < mid && g > r + 8 && g > bl + 8) upperGreen++;
  }
}
console.log(JSON.stringify({
  treeMaskPx: changed,
  treeBbox: [minX, minY, maxX, maxY],
  bandPct: [+(100 * (maxX - minX + 1) / a.width).toFixed(1), +(100 * (maxY - minY + 1) / a.height).toFixed(1)],
  crownBandGreenPct: +(100 * bandGreen / band).toFixed(1),
  greenPx: green,
  greenSelfBoxPct: +(100 * green / greenBox).toFixed(1),
  upperHalfGreenPct: +(100 * upperGreen / upperBand).toFixed(1),
}));
