// T012.4 风动 flutter 行分化剖面——帧对逐行差分像素计数按横向 12 带汇总
// （高频颤证据的行空间分化读数：冠区行带变化 / 干·地面行带零变化）
// 用法：node tools/t0124-windrows.mjs a.png b.png
// 复用 pixel-diff.mjs 的 PNG 解码逻辑（零依赖 zlib inflate + unfilter，逐字同款）
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
if (A.width !== B.width || A.height !== B.height) throw new Error('size mismatch');
const { width, height } = A;
const px = (img, x, y, c) => img.data[(y * width + x) * img.bpp + c];

// 逐行差分像素计数（行内任一通道差 >0 计 1；另计 >8 强差行判定口径与 pixel-diff 一致）
const rowAny = new Array(height).fill(0);
const rowGt8 = new Array(height).fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const d = Math.max(
      Math.abs(px(A, x, y, 0) - px(B, x, y, 0)),
      Math.abs(px(A, x, y, 1) - px(B, x, y, 1)),
      Math.abs(px(A, x, y, 2) - px(B, x, y, 2)),
    );
    if (d > 0) rowAny[y]++;
    if (d > 8) rowGt8[y]++;
  }
}

// 横向 12 带（画面自上而下 band 0..11）：行像素总量 = width；带内求和 + 带内占比
const BANDS = 12;
const bandH = height / BANDS;
const bands = [];
for (let b = 0; b < BANDS; b++) {
  const y0 = Math.floor(b * bandH), y1 = Math.floor((b + 1) * bandH);
  let any = 0, gt8 = 0;
  for (let y = y0; y < y1; y++) { any += rowAny[y]; gt8 += rowGt8[y]; }
  const pxTotal = (y1 - y0) * width;
  bands.push({
    band: b,
    rows: [y0, y1 - 1],
    changedAny: any,
    changedAnyPctOfBand: +((any / pxTotal) * 100).toFixed(2),
    changedGt8: gt8,
    changedGt8PctOfBand: +((gt8 / pxTotal) * 100).toFixed(2),
  });
}
const rowsAnyWithDiff = rowAny.filter((c) => c > 0).length;
const rowsGt8WithDiff = rowGt8.filter((c) => c > 8).length;
console.log(JSON.stringify({
  files: [aPath.split(/[\\/]/).pop(), bPath.split(/[\\/]/).pop()],
  size: [width, height],
  rowsAnyWithDiffPct: +((rowsAnyWithDiff / height) * 100).toFixed(1),
  rowsGt8WithDiffPct: +((rowsGt8WithDiff / height) * 100).toFixed(1),
  bands,
}, null, 1));
