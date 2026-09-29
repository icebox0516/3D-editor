// T012.3 冠带窗口量化（与 012.2 水杉 34.3% 同式口径：冠密段窗口内绿像素/窗口面积）
// 窗口语义对齐 012.2「x 45.5–53% × y 39–71%」：取树冠投影中带——宽 = 树宽 62%、
// 高 = 树高 1/3 的中带；树 bbox = 差分掩膜（排除影子行：掩膜行密度 ≥ 8% 的连续区）。
// 输出：窗口带绿 + 上/下冠带（次级读数）+ 差分 bbox 口径（012.3 工具原口径对照）。
// 用法：node t0123-bandwindow.mjs <empty.png> <mounted.png>
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
const isMask = (x, y) => {
  const i = (y * a.width + x) * 3;
  return Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 24;
};
const isGreen = (x, y) => {
  const i = (y * a.width + x) * 3;
  return b.data[i + 1] > b.data[i] + 8 && b.data[i + 1] > b.data[i + 2] + 8;
};
// 树本体行集（行掩膜密度 ≥ 8% —— 排除影子：影子行密度低于实体行）
const rowDensity = [];
for (let y = 0; y < a.height; y++) {
  let n = 0;
  for (let x = 0; x < a.width; x++) if (isMask(x, y)) n++;
  rowDensity.push(n);
}
let treeRows = [];
for (let y = 0; y < a.height; y++) if (rowDensity[y] >= a.width * 0.008) treeRows.push(y);
const treeMinY = Math.min(...treeRows), treeMaxY = Math.max(...treeRows);
let treeMinX = a.width, treeMaxX = 0;
for (let y = treeMinY; y <= treeMaxY; y++) for (let x = 0; x < a.width; x++) {
  if (isMask(x, y)) { if (x < treeMinX) treeMinX = x; if (x > treeMaxX) treeMaxX = x; }
}
const treeW = treeMaxX - treeMinX + 1, treeH = treeMaxY - treeMinY + 1;
const cx = (treeMinX + treeMaxX) / 2;
// 冠带窗口（012.2 同语义）：宽 62% 树宽 × 中带 1/3 树高（树高上 1/3 至 2/3）
const winW = Math.round(treeW * 0.62);
const winY0 = Math.round(treeMinY + treeH / 3), winY1 = Math.round(treeMinY + (2 * treeH) / 3);
const winX0 = Math.round(cx - winW / 2), winX1 = winX0 + winW;
const band = (x0, x1, y0, y1) => {
  let g = 0, t = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { t++; if (isGreen(x, y)) g++; }
  return { greenPx: g, bandPx: t, pct: +(100 * g / t).toFixed(1) };
};
const result = {
  treeBodyBox: [treeMinX, treeMinY, treeMaxX, treeMaxY],
  treeBodySize: [treeW, treeH],
  crownBandWindow: [winX0, winY0, winX1, winY1],
  crownBand: band(winX0, winX1, winY0, winY1),
  upperBand: band(winX0, winX1, treeMinY, winY0),
  lowerBand: band(winX0, winX1, winY1, treeMaxY),
};
console.log(JSON.stringify(result));
