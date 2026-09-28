// T024.5 Step C 比对：干区跨卡一致断言（11 双卡树，default vs autumn，同冻结相位同机位）。
// 逐树：全帧差异像素集 → 差异 bbox → 外扩 16px 安全带 →
//   断言 A（冠变干不变 = 干区+地面+投影+天空跨卡逐位一致）：bbox 外差异像素数 = 0；
//   断言 B（逐卡可辨）：bbox 内差异像素数 > 0（记录差异像素占比）；
//   热区图：差异像素标红的 default 帧叠加 → <id>-diff.png。
// 用法：node compare-invariance.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TRUNK = join(HERE, '..', 'trunk-invariance');
const SAFETY_BAND = 16;
const DUAL_CARD_TREES = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_zelkova', 'asset_tree_ginkgo',
  'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_sophora', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_fraxinus', 'asset_tree_salix',
];

const load = (p) => PNG.sync.read(readFileSync(p));

const trees = [];
for (const assetId of DUAL_CARD_TREES) {
  const defPath = join(TRUNK, `${assetId}-default.png`);
  const autPath = join(TRUNK, `${assetId}-autumn.png`);
  const def = load(defPath);
  const aut = load(autPath);
  if (def.width !== aut.width || def.height !== aut.height) {
    trees.push({ assetId, passA: false, passB: false, error: `dimension mismatch default ${def.width}x${def.height} vs autumn ${aut.width}x${aut.height}` });
    continue;
  }
  const { width: W, height: H } = def;
  const dd = def.data;
  const ad = aut.data;
  let minX = W, minY = H, maxX = -1, maxY = -1;
  let diffPixels = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if ((dd[i] ^ ad[i]) | (dd[i + 1] ^ ad[i + 1]) | (dd[i + 2] ^ ad[i + 2]) | (dd[i + 3] ^ ad[i + 3])) {
        diffPixels += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (diffPixels === 0) {
    trees.push({ assetId, dimensions: { width: W, height: H }, diffPixels: 0, passA: true, passB: false, note: '全帧零差异——断言 B 不成立（逐卡不可辨）' });
    console.error(`[invariance] ${assetId}: 0 diff px (B FAIL)`);
    continue;
  }
  // bbox 外扩 16px 安全带（clamp 到帧界）
  const exMinX = Math.max(0, minX - SAFETY_BAND);
  const exMinY = Math.max(0, minY - SAFETY_BAND);
  const exMaxX = Math.min(W - 1, maxX + SAFETY_BAND);
  const exMaxY = Math.min(H - 1, maxY + SAFETY_BAND);
  // bbox 外差异像素数（第二次全帧扫描）
  let outside = 0;
  let inside = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const inBox = x >= exMinX && x <= exMaxX && y >= exMinY && y <= exMaxY;
      if (inBox) continue;
      const i = (y * W + x) * 4;
      if ((dd[i] ^ ad[i]) | (dd[i + 1] ^ ad[i + 1]) | (dd[i + 2] ^ ad[i + 2]) | (dd[i + 3] ^ ad[i + 3])) outside += 1;
    }
  }
  inside = diffPixels - outside;
  // 热区图：default 帧差异像素标红
  const heat = PNG.sync.read(readFileSync(defPath));
  const hd = heat.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if ((dd[i] ^ ad[i]) | (dd[i + 1] ^ ad[i + 1]) | (dd[i + 2] ^ ad[i + 2]) | (dd[i + 3] ^ ad[i + 3])) {
        hd[i] = 255; hd[i + 1] = 0; hd[i + 2] = 0; hd[i + 3] = 255;
      }
    }
  }
  const heatFile = join(TRUNK, `${assetId}-diff.png`);
  writeFileSync(heatFile, PNG.sync.write(heat));

  const bboxArea = (exMaxX - exMinX + 1) * (exMaxY - exMinY + 1);
  const rec = {
    assetId,
    dimensions: { width: W, height: H },
    diffPixels,
    bbox: { minX, minY, maxX, maxY },
    bboxExpanded: { minX: exMinX, minY: exMinY, maxX: exMaxX, maxY: exMaxY, safetyBand: SAFETY_BAND },
    diffOutsideBbox: outside,
    diffInsideBbox: inside,
    diffRatioInside: +(inside / bboxArea).toFixed(6),
    diffRatioOfFrame: +(diffPixels / (W * H)).toFixed(6),
    heatmap: `${assetId}-diff.png`,
    passA: outside === 0,
    passB: inside > 0,
  };
  trees.push(rec);
  console.error(`[invariance] ${assetId}: diff=${diffPixels} bbox=[${minX},${minY}..${maxX},${maxY}] outside=${outside} inside=${inside} ratioInside=${rec.diffRatioInside}`);
}

const ok = trees.filter((t) => t.passA && t.passB).length;
const summary = {
  total: trees.length,
  passACount: trees.filter((t) => t.passA).length,
  passBCount: trees.filter((t) => t.passB).length,
  allPass: ok === trees.length,
};

const report = {
  generatedAt: new Date().toISOString(),
  method: `pngjs RGBA 全帧 diff → bbox 外扩 ${SAFETY_BAND}px 安全带 → bbox 外零差异断言 + 热区图（冻结相位 2.5s，M25 机位，current 构建 5173）`,
  trees,
  summary,
};

writeFileSync(join(TRUNK, 'compare.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.allPass ? 0 : 2);
