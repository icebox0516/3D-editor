// T024.5 冒烟诊断：帧I vs Step-2 基线的 483 差异像素 = 固定 HUD 覆盖差异（两树差异
// 掩码逐位相同）。定位 clip 域内顶部条与右下角覆盖的 DOM 身份与文本内容。
import { PORT, waitReady, ensureBrowserCollapsed } from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  await ensureBrowserCollapsed(evalJs, sleep);
  const rect = JSON.parse(await evalJs(`JSON.stringify((() => {
    const r = document.querySelector('canvas.ed-viewport__canvas').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  })())`));
  const probe = await evalJs(`JSON.stringify((() => {
    // 差异簇的 canvas 内坐标 → 视口坐标（clip 原点 = canvas 矩形）
    const cx = ${Math.round(rect.x)}, cy = ${Math.round(rect.y)};
    const pts = [[13,12],[68,12],[1232,12],[1279,12],[12,38],[257,38],[1080,780],[1279,780],[1080,917],[1279,917]];
    return pts.map(([px,py]) => {
      const el = document.elementFromPoint(cx + px, cy + py);
      return { at: px + ',' + py, tag: el?.tagName ?? null, cls: String(el?.className ?? '').slice(0, 70), text: (el?.textContent ?? '').slice(0, 60), canvas: el?.tagName === 'CANVAS' };
    });
  })())`);
  const overlays = JSON.parse(await evalJs(`JSON.stringify((() => {
    // canvas 矩形内 absolute/fixed 覆盖元素清单
    const r = document.querySelector('canvas.ed-viewport__canvas').getBoundingClientRect();
    const out = [];
    for (const el of document.querySelectorAll('.ed-viewport *')) {
      if (el.tagName === 'CANVAS') continue;
      const b = el.getBoundingClientRect();
      if (b.width > 0 && b.height > 0 && b.bottom > r.y && b.top < r.bottom && b.right > r.x && b.left < r.right) {
        out.push({ cls: String(el.className).slice(0, 70), x: Math.round(b.x - r.x), y: Math.round(b.y - r.y), w: Math.round(b.width), h: Math.round(b.height), text: (el.textContent ?? '').slice(0, 80) });
      }
    }
    return out.slice(0, 25);
  })())`));
  return { canvasRect: rect, probe: JSON.parse(probe), overlays };
};
