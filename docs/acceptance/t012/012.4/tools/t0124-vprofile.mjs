// T012.4 观察项辅助：slot-2 M25 帧纵向绿剖面（树本体 bbox 逐十分位带绿%——伞形平顶
// 端顶带 vs 中带直接读数；绿判据同 crownband g>r+8 && g>b+8，树 bbox = 差分掩膜行密度法）
// 用法：node t0124-vprofile.mjs <empty.png> <mounted.png>
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function decodePng(buf) {
  let pos = 8, width = 0, height = 0, colorType = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
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
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (filter === 1) v += a; else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 0xff;
    }
    for (let x = 0; x < width; x++) {
      out[(y * width + x) * 3] = cur[x * bpp]; out[(y * width + x) * 3 + 1] = cur[x * bpp + 1]; out[(y * width + x) * 3 + 2] = cur[x * bpp + 2];
    }
    prev.set(cur);
  }
  return { width, height, data: out };
}

const [emptyFile, mountedFile] = process.argv.slice(2);
const a = decodePng(readFileSync(emptyFile));
const b = decodePng(readFileSync(mountedFile));
const isMask = (x, y) => {
  const i = (y * a.width + x) * 3;
  return Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 24;
};
const isGreen = (x, y) => {
  const i = (y * a.width + x) * 3;
  return b.data[i + 1] > b.data[i] + 8 && b.data[i + 1] > b.data[i + 2] + 8;
};
const rowDensity = [];
for (let y = 0; y < a.height; y++) {
  let n = 0;
  for (let x = 0; x < a.width; x++) if (isMask(x, y)) n++;
  rowDensity.push(n);
}
const treeRows = [];
for (let y = 0; y < a.height; y++) if (rowDensity[y] >= a.width * 0.008) treeRows.push(y);
const treeMinY = Math.min(...treeRows), treeMaxY = Math.max(...treeRows);
let treeMinX = a.width, treeMaxX = 0;
for (let y = treeMinY; y <= treeMaxY; y++) for (let x = 0; x < a.width; x++) {
  if (isMask(x, y)) { if (x < treeMinX) treeMinX = x; if (x > treeMaxX) treeMaxX = x; }
}
const treeH = treeMaxY - treeMinY + 1;
// 逐十分位带（树顶 → 树基）绿% + mask%（mask 为占空参照——带内树实体占比）
const deciles = [];
for (let d = 0; d < 10; d++) {
  const y0 = treeMinY + Math.floor((treeH * d) / 10);
  const y1 = treeMinY + Math.floor((treeH * (d + 1)) / 10);
  let g = 0, m = 0, t = 0;
  for (let y = y0; y < Math.max(y0 + 1, y1); y++) for (let x = treeMinX; x <= treeMaxX; x++) {
    t++;
    if (isGreen(x, y)) g++;
    if (isMask(x, y)) m++;
  }
  deciles.push({ band: `${d * 10}-${(d + 1) * 10}%`, y: [y0, y1], greenPct: +(100 * g / t).toFixed(1), maskPct: +(100 * m / t).toFixed(1), greenOverMaskPct: +(100 * g / Math.max(1, m)).toFixed(1) });
}
console.log(JSON.stringify({ treeBodyBox: [treeMinX, treeMinY, treeMaxX, treeMaxY], deciles }));
