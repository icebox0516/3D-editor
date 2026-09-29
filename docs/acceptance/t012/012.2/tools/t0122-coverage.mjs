// T012.2 冠区绿色覆盖率量化（密度疑点判据）：bbox = 全部绿像素的包围盒；coverage = 盒内绿像素/盒面积
// （盒内非绿 = 透天孔 + 皮/枝 + 少量地面——口径与 012.1 校准记档同型：冠区覆盖 % 越高冠越实）
// 用法：node t0122-coverage.mjs <a.png> [b.png ...]
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

for (const file of process.argv.slice(2)) {
  const { width, height, data } = decodePng(readFileSync(file));
  let minX = width, minY = height, maxX = 0, maxY = 0, green = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3, r = data[i], g = data[i + 1], b = data[i + 2];
    if (g > r + 8 && g > b + 8) { // 绿主导（叶/羽卡）
      green++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const box = Math.max(1, (maxX - minX + 1) * (maxY - minY + 1));
  console.log(JSON.stringify({
    file, greenPx: green, bbox: [minX, minY, maxX, maxY],
    coveragePct: +(100 * green / box).toFixed(1),
    frameGreenPct: +(100 * green / (width * height)).toFixed(1),
  }));
}
