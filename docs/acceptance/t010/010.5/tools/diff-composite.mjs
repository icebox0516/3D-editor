// T010.5 —— 生成三联对照图：基线 | 复测 | 差异热图（diff×6，红=强度）
// 用法：node diff-composite.mjs <a.png> <b.png> <out.png>
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import { crc32 } from 'node:zlib';

function decodePng(buf) {
  let pos = 8;
  let width = 0, height = 0, colorType = 0;
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
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = raw.subarray(src, src + stride); src += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = x >= bpp && prev ? prev[x - bpp] : 0;
      let v = row[x];
      switch (filter) {
        case 1: v = (v + a) & 0xff; break;
        case 2: v = (v + b) & 0xff; break;
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break;
        case 4: { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff; break; }
      }
      cur[x] = v;
    }
  }
  return { width, height, data: out, bpp };
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

function encodePngRgb(width, height, rgb) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter none
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

const [aPath, bPath, outPath] = process.argv.slice(2);
const A = decodePng(readFileSync(aPath));
const B = decodePng(readFileSync(bPath));
const { width, height } = A;
const px = (img, x, y, c) => img.data[(y * width + x) * img.bpp + c];
const outW = width * 3;
const rgb = Buffer.alloc(outW * height * 3);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // 左：基线
    let o = (y * outW + x) * 3;
    rgb[o] = px(A, x, y, 0); rgb[o + 1] = px(A, x, y, 1); rgb[o + 2] = px(A, x, y, 2);
    // 中：复测
    o = (y * outW + width + x) * 3;
    rgb[o] = px(B, x, y, 0); rgb[o + 1] = px(B, x, y, 1); rgb[o + 2] = px(B, x, y, 2);
    // 右：差异热图（黑=一致，红=差异，×6 增强）
    const d = Math.max(
      Math.abs(px(A, x, y, 0) - px(B, x, y, 0)),
      Math.abs(px(A, x, y, 1) - px(B, x, y, 1)),
      Math.abs(px(A, x, y, 2) - px(B, x, y, 2)),
    );
    const hot = Math.min(255, d * 6);
    o = (y * outW + width * 2 + x) * 3;
    rgb[o] = hot; rgb[o + 1] = Math.round(hot * 0.25); rgb[o + 2] = Math.round(hot * 0.2);
  }
}
writeFileSync(outPath, encodePngRgb(outW, height, rgb));
console.log('written', outPath, outW + 'x' + height);
