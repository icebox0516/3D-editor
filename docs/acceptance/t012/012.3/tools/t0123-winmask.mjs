// T012.3 Step 4 第二轮终态三口径量化（硬窗口 [874,421,1018,767]——与水杉 34.2%/65.1%
// 完全同画面坐标；绿判据同 crownband g>r+8 && g>b+8，mask = 空场/挂树差分 >24）：
// 输出 ①窗口绿（绿/窗面积——同式冠带窗口口径）②窗口内 mask 像素 ③窗口内绿/mask
//（树本体实体率——vs 水杉 65.1%）④全帧绿像素与全帧 mask（绿/树剪影口径）。
// 用法：node t0123-winmask.mjs <empty.png> <mounted.png>
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

const W = [874, 421, 1018, 767]; // 与水杉完全相同画面坐标（硬编码同窗——族横向可比）
const [emptyFile, mountedFile] = process.argv.slice(2);
const a = decodePng(readFileSync(emptyFile));
const b = decodePng(readFileSync(mountedFile));
let winGreen = 0, winMask = 0, frameGreen = 0, frameMask = 0;
for (let y = 0; y < a.height; y++) {
  for (let x = 0; x < a.width; x++) {
    const i = (y * a.width + x) * 3;
    const mask = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 24;
    const green = b.data[i + 1] > b.data[i] + 8 && b.data[i + 1] > b.data[i + 2] + 8;
    if (mask) frameMask++;
    if (green) frameGreen++;
    if (x >= W[0] && x < W[2] && y >= W[1] && y < W[3]) {
      if (mask) winMask++;
      if (green) winGreen++;
    }
  }
}
const winArea = (W[2] - W[0]) * (W[3] - W[1]);
console.log(JSON.stringify({
  window: W,
  winGreenPx: winGreen,
  winGreenPct: +(100 * winGreen / winArea).toFixed(1),
  winMaskPx: winMask,
  winGreenOverMaskPct: +(100 * winGreen / Math.max(1, winMask)).toFixed(1),
  frameGreenPx: frameGreen,
  frameMaskPx: frameMask,
  frameGreenOverMaskPct: +(100 * frameGreen / Math.max(1, frameMask)).toFixed(1),
}));
