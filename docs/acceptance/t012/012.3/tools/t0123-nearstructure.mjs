// T012.3 Step 4 第二轮近景身份结构量化：M8 帧（同机位 freezeTime 确定性渲染）
// ①两帧逐像素差（r1 vs r2——迭代后期近景稳定性）②中心冠区横向游程统计
//（绳列身份 = 绿-隙交替高频横向结构；平均游程 px = 绳带宽读向）③绿判据同 crownband。
// 用法：node t0123-nearstructure.mjs <a.png> <b.png> [cx cy half]
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
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
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

const [fileA, fileB] = process.argv.slice(2);
const a = decodePng(readFileSync(fileA));
const b = decodePng(readFileSync(fileB));
// ①逐像素差（全帧，主画布 1292×932 内——忽略右侧/底部可能的 UI 条）
const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
let diffPx = 0, total = 0, diffSum = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const i = (y * w + x) * 3;
  const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
  total++;
  if (d > 24) diffPx++;
  diffSum += d;
}
// ②中心冠区横向游程（绿-隙交替结构 = 绳列读向；取样中心 300×300）
const cx = w / 2, cy = h / 2 + 60, half = 150;
const isGreen = (img, x, y) => {
  const i = (y * img.width + x) * 3;
  return img.data[i + 1] > img.data[i] + 8 && img.data[i + 1] > img.data[i + 2] + 8;
};
const runsOf = (img) => {
  const greenRuns = [], gapRuns = [];
  let transitions = 0;
  for (let y = cy - half; y < cy + half; y += 2) {
    let run = 0, prevGreen = isGreen(img, cx - half, y);
    for (let x = cx - half + 1; x < cx + half; x++) {
      const g = isGreen(img, x, y);
      if (g === prevGreen) run++;
      else {
        (prevGreen ? greenRuns : gapRuns).push(run + 1);
        transitions++;
        run = 0;
        prevGreen = g;
      }
    }
  }
  const avg = (arr) => arr.length ? +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(2) : 0;
  return { greenRunAvg: avg(greenRuns), gapRunAvg: avg(gapRuns), transitions, greenRunCount: greenRuns.length };
};
console.log(JSON.stringify({
  diffPct: +(100 * diffPx / total).toFixed(3),
  meanAbsDiff: +(diffSum / total / 3).toFixed(2),
  centerA: runsOf(a),
  centerB: runsOf(b),
}));
