// T010.5 零回退复核——PNG 像素差异统计（零依赖：zlib inflate + PNG unfilter）
// 用法：node pixel-diff.mjs <a.png> <b.png>
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error('unsupported bitDepth ' + bitDepth);
  if (colorType !== 6 && colorType !== 2) throw new Error('unsupported colorType ' + colorType + ' (need RGB/RGBA)');
  if (interlace !== 0) throw new Error('interlaced PNG unsupported');
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = raw.subarray(src, src + stride);
    src += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = x >= bpp && prev ? prev[x - bpp] : 0;
      let v = row[x];
      switch (filter) {
        case 0: break;
        case 1: v = (v + a) & 0xff; break;
        case 2: v = (v + b) & 0xff; break;
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
        default: throw new Error('bad filter ' + filter);
      }
      cur[x] = v;
    }
  }
  return { width, height, data: out, bpp };
}

const [aPath, bPath] = process.argv.slice(2);
const A = decodePng(readFileSync(aPath));
const B = decodePng(readFileSync(bPath));
if (A.width !== B.width || A.height !== B.height) {
  console.log(JSON.stringify({ sizeMismatch: true, a: [A.width, A.height], b: [B.width, B.height] }));
  process.exit(0);
}
const { width, height } = A;
const px = (img, x, y, c) => img.data[(y * width + x) * img.bpp + c];
const total = width * height;
let diffSum = 0, maxDiff = 0, changed = 0, changed8 = 0, changed32 = 0;
let sumX = 0, sumY = 0; // 差异质心（检测局部 vs 全局）
const rowChanged = new Array(height).fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const d = Math.max(
      Math.abs(px(A, x, y, 0) - px(B, x, y, 0)),
      Math.abs(px(A, x, y, 1) - px(B, x, y, 1)),
      Math.abs(px(A, x, y, 2) - px(B, x, y, 2)),
    );
    diffSum += d;
    if (d > maxDiff) maxDiff = d;
    if (d > 0) { changed++; sumX += x; sumY += y; rowChanged[y]++; }
    if (d > 8) changed8++;
    if (d > 32) changed32++;
  }
}
const rowsWithDiff = rowChanged.filter((c) => c > 8).length;
console.log(JSON.stringify({
  files: [aPath.split(/[\\/]/).pop(), bPath.split(/[\\/]/).pop()],
  size: [width, height],
  meanAbsDiff: +(diffSum / total).toFixed(3),
  maxAbsDiff: maxDiff,
  pctChangedAny: +((changed / total) * 100).toFixed(2),
  pctChangedGt8: +((changed8 / total) * 100).toFixed(2),
  pctChangedGt32: +((changed32 / total) * 100).toFixed(2),
  pctRowsWithDiffGt8: +((rowsWithDiff / height) * 100).toFixed(1),
  centroidOfChanges: changed ? [Math.round(sumX / changed), Math.round(sumY / changed)] : null,
}));
