// T012.4 Step 4 疑点仲裁：树干「上白下深」梯度像素验证
// 用法 A（差分模式）：node t0124-trunkband.mjs diff <empty.png> <mounted.png> <半带宽px>
// 用法 B（启发式模式）：node t0124-trunkband.mjs heuristic <mounted.png> <半带宽px>
// 输出：树干条带逐带亮度/亮斑占比（自下而上），底部 vs 顶部仲裁行
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function decodePng(path) {
  const buf = readFileSync(path);
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
    out.set(cur, y * stride); prev.fill(0); prev.set(cur);
  }
  return { w: width, h: height, d: out };
}

const mode = process.argv[2];
let emptyPath = null, mountedPath = null, half = 45;
if (mode === 'diff') { emptyPath = process.argv[3]; mountedPath = process.argv[4]; half = parseInt(process.argv[5], 10) || 45; }
else { mountedPath = process.argv[3]; half = parseInt(process.argv[4], 10) || 45; }

const mounted = decodePng(mountedPath);
const empty = emptyPath ? decodePng(emptyPath) : null;

const px = (img, x, y) => { const i = (y * img.w + x) * 3; return [img.d[i], img.d[i + 1], img.d[i + 2]]; };
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const isGreen = ([r, g, b]) => g > r + 8 && g > b + 8;
const isTrunkish = (c) => !isGreen(c) && Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) < 46 && lum(c) > 40;

const inMask = (x, y) => {
  const a = px(mounted, x, y);
  if (mode !== 'diff') return isTrunkish(a);
  const b = px(empty, x, y);
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 36 && isTrunkish(a);
};

const cx = Math.round(mounted.w / 2);
let yTop = -1, yBot = -1;
for (let y = Math.floor(mounted.h * 0.30); y < mounted.h - 4; y++) {
  let n = 0;
  for (let x = cx - half; x < cx + half; x++) if (inMask(x, y)) n++;
  if (n > half * 0.35) { if (yBot < 0) yBot = y; yTop = y; }
}
if (yTop < 0) { console.log('未检出树干条带'); process.exit(1); }
const bands = 8;
console.log(`[${mode}] 树干条带 y∈[${yBot}, ${yTop}]（${yTop - yBot}px）× 中心±${half}px，${bands} 带`);
console.log('band | y范围 | 像素数 | 平均亮度 | 亮斑占比(lum>175) | 平均min通道');
const rows = [];
for (let b = 0; b < bands; b++) {
  const y0 = Math.round(yBot + ((yTop - yBot) * b) / bands), y1 = Math.round(yBot + ((yTop - yBot) * (b + 1)) / bands);
  let n = 0, sl = 0, nb = 0, sm = 0;
  for (let y = y0; y < y1; y++) for (let x = cx - half; x < cx + half; x++) {
    if (!inMask(x, y)) continue;
    const c = px(mounted, x, y); const L = lum(c); n++; sl += L; sm += Math.min(c[0], c[1], c[2]);
    if (L > 175) nb++;
  }
  rows.push({ b, y0, y1, n, L: n ? (sl / n).toFixed(1) : '-', B: n ? ((nb / n) * 100).toFixed(1) : '-', M: n ? (sm / n).toFixed(1) : '-' });
}
rows.reverse().forEach(r => console.log(`${r.b} | ${r.y0}-${r.y1} | ${r.n} | ${r.L} | ${r.B}% | ${r.M}`));
const valid = rows.filter(r => r.n > 0);
if (valid.length >= 4) {
  const bottom = valid[valid.length - 1], top = valid[0];
  console.log(`\n仲裁：底部带 亮度 ${bottom.L}/亮斑 ${bottom.B}%  vs  顶部带 亮度 ${top.L}/亮斑 ${top.B}%`);
  console.log(`→ ${parseFloat(top.L) > parseFloat(bottom.L) ? '上亮下暗（上白下深 ✓ Spec）' : parseFloat(top.L) < parseFloat(bottom.L) ? '上暗下亮（与 Spec 相反 ✗——疑冠层投影遮上干，查光照）' : '无向'}`);
}
