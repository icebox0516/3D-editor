// T024.3 Contact Sheet 拼图：13 树 × 2 列（default | autumn）网格 → file:// HTML → 全页截图。
// 生成 montage-src.html 后由 shot-montage.mjs 截全页（captureBeyondViewport）。
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../..'); // 仓库根
const frames = resolve(here, '../frames');

const members = [
  ['夏栎 tree3a', 'asset_tree_3a'],
  ['朴 celtis', 'asset_tree_celtis'],
  ['樟 camphor', 'asset_tree_camphor'],
  ['榉 zelkova', 'asset_tree_zelkova'],
  ['银杏 ginkgo', 'asset_tree_ginkgo'],
  ['悬铃木 platanus', 'asset_tree_platanus'],
  ['栾 koelreuteria', 'asset_tree_koelreuteria'],
  ['乌桕 triadica', 'asset_tree_triadica'],
  ['重阳木 bischofia', 'asset_tree_bischofia'],
  ['国槐 sophora', 'asset_tree_sophora'],
  ['白蜡 fraxinus', 'asset_tree_fraxinus'],
  ['女贞 ligustrum', 'asset_tree_ligustrum'],
  ['垂柳 salix', 'asset_tree_salix'],
];

const cell = (label, frameName, placeholder) => {
  const img = frameName && existsSync(resolve(frames, frameName))
    ? `<img src="../frames/${frameName}" loading="eager">`
    : `<div class="ph">${placeholder ?? '缺帧'}</div>`;
  return `<figure><figcaption>${label}</figcaption>${img}</figure>`;
};

const rows = members.map(([label, id]) => {
  const d = cell(`${label} · default`, `${id}-default.png`);
  const a = cell(`${label} · autumn`, `${id}-autumn.png`, '无秋卡（常绿终态 / 不建卡记档）');
  return `<div class="row">${d}${a}</div>`;
}).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #d8d8d8; font-family: sans-serif; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 8px 0; }
  figure { margin: 0; background: #eee; }
  img { width: 100%; height: 300px; object-fit: contain; background: #cfd4d8; display: block; }
  .ph { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center;
        background: #e8e8e4; color: #777; font-size: 15px; }
  figcaption { font-size: 15px; padding: 4px 6px; color: #222; text-align: center; }
</style></head><body>${rows}</body></html>`;

mkdirSync(here, { recursive: true });
writeFileSync(resolve(here, 'montage-src.html'), html);
console.log(`montage-src.html written (${members.length} rows × 2 cols)`);
