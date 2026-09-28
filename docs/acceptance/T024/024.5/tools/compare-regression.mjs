// T024.5 Step B 比对：跨构建默认卡逐位对比（13 树，current=5173 vs baseline=5174）。
// 判据：RGBA 逐位相等（pngjs 解码，全像素扫描）；同时记录 PNG 字节级是否一致；
// 任何差异像素输出坐标与色差样例（≤8 例）。附带 sanity 判定（current 构建首树）：
// sanity-frozen-a === sanity-frozen-b（冻结+稳定）、asset_tree_3a.png === sanity-frozen-a
// （seek 重定位确定性）、sanity-unfrozen !== sanity-frozen-a（冻结确实生效非巧合）。
// 用法：node compare-regression.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REG = join(HERE, '..', 'regression-default');
const TREES = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_sophora',
  'asset_tree_triadica', 'asset_tree_bischofia', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
  'asset_tree_salix',
];

const load = (p) => {
  if (!existsSync(p)) throw new Error(`missing frame: ${p}`);
  return PNG.sync.read(readFileSync(p));
};

/** 全像素 RGBA 逐位比对：返回 { diffPixels, maxChannelDiff, samples } */
function bitwiseDiff(a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    return { dimensionMismatch: { a: { w: a.width, h: a.height }, b: { w: b.width, h: b.height } } };
  }
  let diffPixels = 0;
  let maxChannelDiff = 0;
  const samples = [];
  const da = a.data;
  const db = b.data;
  for (let i = 0; i < da.length; i += 4) {
    const d0 = da[i] ^ db[i];
    const d1 = da[i + 1] ^ db[i + 1];
    const d2 = da[i + 2] ^ db[i + 2];
    const d3 = da[i + 3] ^ db[i + 3];
    if ((d0 | d1 | d2 | d3) !== 0) {
      diffPixels += 1;
      if (samples.length < 8) {
        const px = (i >> 2) % a.width;
        const py = Math.floor((i >> 2) / a.width);
        const cd = Math.max(
          Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]),
          Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3]),
        );
        maxChannelDiff = Math.max(maxChannelDiff, cd);
        samples.push({ x: px, y: py, current: [da[i], da[i + 1], da[i + 2], da[i + 3]], baseline: [db[i], db[i + 1], db[i + 2], db[i + 3]] });
      } else {
        const d0a = Math.abs(da[i] - db[i]);
        const d1a = Math.abs(da[i + 1] - db[i + 1]);
        const d2a = Math.abs(da[i + 2] - db[i + 2]);
        const d3a = Math.abs(da[i + 3] - db[i + 3]);
        maxChannelDiff = Math.max(maxChannelDiff, d0a, d1a, d2a, d3a);
      }
    }
  }
  return { diffPixels, maxChannelDiff, samples };
}

const pairs = [];
for (const assetId of TREES) {
  const currentPath = join(REG, 'current', `${assetId}.png`);
  const baselinePath = join(REG, 'baseline', `${assetId}.png`);
  const cur = load(currentPath);
  const base = load(baselinePath);
  const pngBytesEqual = readFileSync(currentPath).equals(readFileSync(baselinePath));
  const diff = bitwiseDiff(cur, base);
  pairs.push({
    assetId,
    dimensions: { width: cur.width, height: cur.height },
    dimensionMatch: cur.width === base.width && cur.height === base.height,
    pngBytesEqual,
    bitwiseIdentical: !diff.dimensionMismatch && diff.diffPixels === 0,
    ...diff,
  });
  console.error(`[compare] ${assetId}: ${diff.dimensionMismatch ? 'DIM MISMATCH' : diff.diffPixels === 0 ? 'identical' : diff.diffPixels + ' diff px'} (pngBytesEqual=${pngBytesEqual})`);
}

// sanity（current 构建首树 asset_tree_3a）
let sanity = null;
try {
  const a = load(join(REG, 'current', 'sanity-frozen-a.png'));
  const b = load(join(REG, 'current', 'sanity-frozen-b.png'));
  const unfrozen = load(join(REG, 'current', 'sanity-unfrozen.png'));
  const official = load(join(REG, 'current', 'asset_tree_3a.png'));
  const ab = bitwiseDiff(a, b);
  const aOfficial = bitwiseDiff(a, official);
  const aUnfrozen = bitwiseDiff(a, unfrozen);
  sanity = {
    frozenStable: !ab.dimensionMismatch && ab.diffPixels === 0,
    reseekDeterministic: !aOfficial.dimensionMismatch && aOfficial.diffPixels === 0,
    unfrozenDiffers: aUnfrozen.dimensionMismatch ? true : aUnfrozen.diffPixels > 0,
    unfrozenDiffPixels: aUnfrozen.dimensionMismatch ? null : aUnfrozen.diffPixels,
    detail: { aVsB: ab.diffPixels ?? 'dim-mismatch', aVsOfficial: aOfficial.diffPixels ?? 'dim-mismatch', aVsUnfrozen: aUnfrozen.diffPixels ?? 'dim-mismatch' },
  };
} catch (e) {
  sanity = { error: String(e.message) };
}

const summary = {
  total: pairs.length,
  bitwiseIdenticalCount: pairs.filter((p) => p.bitwiseIdentical).length,
  pngBytesEqualCount: pairs.filter((p) => p.pngBytesEqual).length,
  allPass: pairs.every((p) => p.bitwiseIdentical),
  sanityPass: sanity !== null && sanity.frozenStable === true && sanity.reseekDeterministic === true && sanity.unfrozenDiffers === true,
};

const report = {
  generatedAt: new Date().toISOString(),
  method: 'pngjs RGBA 全像素逐位比对（viewport 1920x1080 DPR1，clip=ed-viewport canvas 矩形）',
  builds: { current: 'http://localhost:5173 (工作树)', baseline: 'http://localhost:5174 (1bc7035 + devface.patch)' },
  pairs,
  sanity,
  summary,
};

writeFileSync(join(REG, 'compare.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.allPass && summary.sanityPass ? 0 : 2);
