// T011.13 族级验收门——13 树基线帧拼图（contact sheet）：file:// HTML 网格 → CDP 截图
// 10 帧复用各树取证目录 baseline.png + 3 帧本目录补拍（tree3a/celtis/camphor）
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../..'); // 仓库根

const members = [
  ['夏栎 tree3a（基线）', '011.13/baseline-tree3a.png'],
  ['朴 celtis', '011.13/baseline-celtis.png'],
  ['樟 camphor', '011.13/baseline-camphor.png'],
  ['榉 zelkova', '011.3/baseline.png'],
  ['银杏 ginkgo', '011.4/baseline.png'],
  ['悬铃木 platanus', '011.5/baseline.png'],
  ['栾 koelreuteria', '011.6/baseline.png'],
  ['乌桕 triadica', '011.7/baseline.png'],
  ['重阳木 bischofia', '011.8/baseline.png'],
  ['国槐 sophora', '011.9/baseline.png'],
  ['白蜡 fraxinus', '011.10/baseline.png'],
  ['女贞 ligustrum', '011.11/baseline.png'],
  ['垂柳 salix', '011.12/baseline.png'],
];

const cells = members.map(([label, rel]) => `
  <figure>
    <img src="../../${rel}" loading="eager">
    <figcaption>${label}</figcaption>
  </figure>`).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #d8d8d8; font-family: sans-serif; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px; }
  figure { margin: 0; background: #eee; }
  img { width: 100%; height: 260px; object-fit: contain; background: #cfd4d8; display: block; }
  figcaption { font-size: 15px; padding: 4px 6px; color: #222; text-align: center; }
</style></head><body><div class="grid">${cells}</div></body></html>`;

mkdirSync(here, { recursive: true });
writeFileSync(resolve(here, 'montage-src.html'), html);
console.log('montage-src.html written (4×4 grid, 13 cells)');
