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
const img = decodePng(readFileSync(process.argv[2]));
// 中心画布区（主视口约 x 600–1892 / y 130–1062，取其中心带）
let green = 0, sx = 0, sy = 0, dark = 0;
for (let y = 130; y < 1062; y++) for (let x = 600; x < 1892; x++) {
  const i = (y * img.width + x) * 3, r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
  if (g > r + 8 && g > b + 8) { green++; sx += x; sy += y; }
  if (g > r && g > b && g < 140 && r < 120) dark++;
}
console.log(process.argv[2], JSON.stringify({ greenPx: green, darkGreenPx: dark, centroid: green ? [Math.round(sx / green), Math.round(sy / green)] : null }));
