// PNG 像素探针（零依赖）：解码 RGBA PNG（zlib inflate + unfilter）→ 绿色覆盖率 /
// 非背景覆盖率 / 绿色像素 bbox 宽高 / 两帧 diff / 分块均匀度。用于远景十条离线判读。
// 用法：node png-probe.mjs green a.png [cropY cropH]  |  node png-probe.mjs diff a.png b.png
//      node png-probe.mjs bbox a.png [cropY cropH]    |  node png-probe.mjs blocks a.png [cropY cropH] [nx ny]
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  let palette = null, trns = null;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`unsupported bitDepth ${bitDepth}`);
  if (interlace !== 0) throw new Error('interlaced PNG unsupported');
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported colorType ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 4);
  const bpp = channels;
  let p = 0;
  let prev = Buffer.alloc(stride);
  let cur = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    cur.fill(0);
    for (let x = 0; x < stride; x++) {
      const b = raw[p + x];
      const a = x >= bpp ? cur[x - bpp] : 0;
      const c = prev[x];
      let v;
      switch (filter) {
        case 0: v = b; break;
        case 1: v = b + a; break;
        case 2: v = b + c; break;
        case 3: v = b + ((a + c) >> 1); break;
        case 4: {
          const left = a, up = c, upleft = x >= bpp ? prev[x - bpp] : 0;
          const pp = left + up - upleft;
          const pa = Math.abs(pp - left), pb = Math.abs(pp - up), pc = Math.abs(pp - upleft);
          v = b + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upleft);
          break;
        }
        default: throw new Error(`bad filter ${filter}`);
      }
      cur[x] = v & 0xff;
    }
    p += stride;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (colorType === 6) { out[o] = cur[x * 4]; out[o + 1] = cur[x * 4 + 1]; out[o + 2] = cur[x * 4 + 2]; out[o + 3] = cur[x * 4 + 3]; }
      else if (colorType === 2) { out[o] = cur[x * 3]; out[o + 1] = cur[x * 3 + 1]; out[o + 2] = cur[x * 3 + 2]; out[o + 3] = 255; }
      else if (colorType === 3) { const pi = cur[x] * 3; out[o] = palette[pi]; out[o + 1] = palette[pi + 1]; out[o + 2] = palette[pi + 2]; out[o + 3] = trns && trns[cur[x]] < 255 ? trns[cur[x]] : 255; }
      else if (colorType === 0) { out[o] = out[o + 1] = out[o + 2] = cur[x]; out[o + 3] = 255; }
      else if (colorType === 4) { out[o] = out[o + 1] = out[o + 2] = cur[x * 2]; out[o + 3] = cur[x * 2 + 1]; }
    }
    const t = prev; prev = cur; cur = t;
  }
  return { width, height, rgba: out };
}

const isGreen = (r, g, b) => g > r * 1.08 && g > b * 1.08 && g > 40;

/** 裁剪到 3D 画布区（顶栏 UI 条剔除——cropY/cropH 由 canvas rect 提供） */
export function probe(file, cropY = 0, cropH = null, ref = null) {
  const { width, height, rgba } = decodePng(readFileSync(file));
  const y0 = cropY, y1 = cropH === null ? height : cropY + cropH;
  let green = 0, nonBg = 0, gx0 = 1e9, gx1 = -1, gy0 = 1e9, gy1 = -1;
  // 背景参考：顶部中央（天空）与左下（地面）——021.7 同式
  const at = (x, y) => { const i = (y * width + x) * 4; return [rgba[i], rgba[i + 1], rgba[i + 2]]; };
  const sky = at(width >> 1, Math.max(y0 + 4, 4));
  const ground = at(4, y1 - 4);
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      if (isGreen(r, g, b)) { green++; if (x < gx0) gx0 = x; if (x > gx1) gx1 = x; if (y < gy0) gy0 = y; if (y > gy1) gy1 = y; }
      const skyDist = Math.abs(r - sky[0]) + Math.abs(g - sky[1]) + Math.abs(b - sky[2]);
      const gDist = Math.abs(r - ground[0]) + Math.abs(g - ground[1]) + Math.abs(b - ground[2]);
      if (skyDist > 30 && gDist > 30) nonBg++;
    }
  }
  const total = width * (y1 - y0);
  return {
    file: file.split(/[\\/]/).pop(),
    greenPct: +(100 * green / total).toFixed(4),
    nonBgPct: +(100 * nonBg / total).toFixed(4),
    greenBBox: green > 0 ? { x0: gx0, x1: gx1, y0: gy0, y1: gy1, w: gx1 - gx0 + 1, h: gy1 - gy0 + 1 } : null,
  };
}

export function diff(aFile, bFile, cropY = 0, cropH = null, thresh = 12) {
  const a = decodePng(readFileSync(aFile));
  const b = decodePng(readFileSync(bFile));
  const y0 = cropY, y1 = cropH === null ? a.height : cropY + cropH;
  let changed = 0, deltaSum = 0, maxDelta = 0;
  const n = a.width * (y1 - y0);
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * 4;
      const d = Math.abs(a.rgba[i] - b.rgba[i]) + Math.abs(a.rgba[i + 1] - b.rgba[i + 1]) + Math.abs(a.rgba[i + 2] - b.rgba[i + 2]);
      if (d > thresh) changed++;
      deltaSum += d / 3;
      if (d / 3 > maxDelta) maxDelta = d / 3;
    }
  }
  return { a: aFile.split(/[\\/]/).pop(), b: bFile.split(/[\\/]/).pop(), changedPct: +(100 * changed / n).toFixed(4), meanChannelDelta: +(deltaSum / n / 3).toFixed(4), maxChannelDelta: +maxDelta.toFixed(1) };
}

/** 分块绿色覆盖均匀度（空洞判读）：nx×ny 块各块 greenPct 的 min/max/mean/std */
export function blocks(file, cropY = 0, cropH = null, nx = 4, ny = 4) {
  const { width, height, rgba } = decodePng(readFileSync(file));
  const y0 = cropY, y1 = cropH === null ? height : cropY + cropH;
  const bw = Math.floor(width / nx), bh = Math.floor((y1 - y0) / ny);
  const cells = [];
  for (let by = 0; by < ny; by++) {
    for (let bx = 0; bx < nx; bx++) {
      let green = 0, total = 0;
      for (let y = y0 + by * bh; y < y0 + (by + 1) * bh; y++) {
        for (let x = bx * bw; x < (bx + 1) * bw; x++) {
          const i = (y * width + x) * 4;
          if (isGreen(rgba[i], rgba[i + 1], rgba[i + 2])) green++;
          total++;
        }
      }
      cells.push(+(100 * green / total).toFixed(2));
    }
  }
  const mean = cells.reduce((s, v) => s + v, 0) / cells.length;
  const std = Math.sqrt(cells.reduce((s, v) => s + (v - mean) ** 2, 0) / cells.length);
  return { file: file.split(/[\\/]/).pop(), nx, ny, cells, mean: +mean.toFixed(2), std: +std.toFixed(2), min: Math.min(...cells), max: Math.max(...cells) };
}

// ── CLI ──
if (process.argv[2]) {
  const [, , cmd, a, b, c, d, e] = process.argv;
  const cropY = b !== undefined ? +b : 0;
  const cropH = c !== undefined ? +c : null;
  if (cmd === 'green' || cmd === 'bbox') console.log(JSON.stringify(probe(a, cropY, cropH)));
  else if (cmd === 'diff') console.log(JSON.stringify(diff(a, b, cropY, cropH)));
  else if (cmd === 'blocks') console.log(JSON.stringify(blocks(a, cropY, cropH, d !== undefined ? +d : 4, e !== undefined ? +e : 4)));
}
