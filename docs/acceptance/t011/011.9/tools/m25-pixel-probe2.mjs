// canvas 矩形内采样版（M25 观感复核）
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
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const rows = new Array(height);
  let p = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[p++]; const out = Buffer.alloc(stride);
    const prev = y > 0 ? rows[y - 1] : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? out[i - bpp] : 0, b = prev ? prev[i] : 0, c = i >= bpp && prev ? prev[i - bpp] : 0;
      let v = raw[p + i];
      if (f === 1) v = (v + a) & 255; else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; }
      out[i] = v;
    }
    p += stride; rows[y] = out;
  }
  return { width, height, bpp, rows };
}
const { width, height, bpp, rows } = decodePng(readFileSync(process.argv[2]));
const RX = 308, RY = 66, RW = 972, RH = 752;
const px = (cx, cy) => { const r = rows[RY + Math.min(Math.max(cy, 0), RH - 1)]; const i = (RX + Math.min(Math.max(cx, 0), RW - 1)) * bpp; return [r[i], r[i + 1], r[i + 2]]; };
const isGreen = ([r, g, b]) => g > 55 && g > r + 10 && g > b + 10;
const isBark = ([r, g, b]) => r > 45 && r < 150 && Math.abs(r - g) < 25 && r - b > 2 && r - b < 45;
let topGreen = -1, botGreen = -1;
for (let y = 0; y < RH; y++) {
  let cnt = 0;
  for (let x = 120; x < RW - 120; x += 4) if (isGreen(px(x, y))) cnt++;
  if (cnt > 5) { if (topGreen < 0) topGreen = y; botGreen = y; }
}
let topBark = -1, botBark = -1;
for (let y = Math.max(botGreen - 30, 0); y < RH; y++) {
  let cnt = 0;
  for (let x = Math.round(RW / 2 - 90); x < RW / 2 + 90; x += 2) if (isBark(px(x, y))) cnt++;
  if (cnt > 3) { if (topBark < 0) topBark = y; botBark = y; }
}
const mid = (a, b) => Math.round((a + b) / 2);
console.log(JSON.stringify({
  canvas: { RX, RY, RW, RH },
  crownBandCanvasY: { topGreen, botGreen },
  barkBandCanvasY: { topBark, botBark },
  crownTopMarginPct: +(topGreen / RH * 100).toFixed(1),
  trunkBottomMarginPct: +((RH - 1 - botBark) / RH * 100).toFixed(1),
  samples: {
    sky: px(Math.round(RW / 2), 20),
    crownMid: px(Math.round(RW / 2), mid(topGreen, botGreen)),
    trunkMid: px(Math.round(RW / 2), mid(topBark, botBark)),
    groundNearBase: px(Math.round(RW / 2) - 200, RH - 60),
  },
}, null, 2));
