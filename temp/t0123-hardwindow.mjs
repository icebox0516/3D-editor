// 一次性补算：硬编码同窗 [874,421,1018,767]（与水杉 34.2% 完全同坐标）带绿——绿判据同 t0123-crownband（g>r+8 && g>b+8）
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
  const raw = inflateSync(Buffer.concat(idat)); const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp; const out = Buffer.alloc(width * height * 3); const prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]; const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (filter === 1) v += a; else if (filter === 2) v += b; else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 0xff;
    }
    for (let x = 0; x < width; x++) { out[(y * width + x) * 3] = cur[x * bpp]; out[(y * width + x) * 3 + 1] = cur[x * bpp + 1]; out[(y * width + x) * 3 + 2] = cur[x * bpp + 2]; }
    prev.set(cur);
  }
  return { width, height, data: out };
}
const W = [874, 421, 1018, 767];
for (const f of process.argv.slice(2)) {
  const img = decodePng(readFileSync(f));
  let green = 0;
  for (let y = W[1]; y < W[3]; y++) for (let x = W[0]; x < W[2]; x++) {
    const i = (y * img.width + x) * 3;
    if (img.data[i + 1] > img.data[i] + 8 && img.data[i + 1] > img.data[i + 2] + 8) green++;
  }
  const area = (W[2] - W[0]) * (W[3] - W[1]);
  console.log(f, JSON.stringify({ greenPx: green, bandPx: area, pct: +(green / area * 100).toFixed(1) }));
}
