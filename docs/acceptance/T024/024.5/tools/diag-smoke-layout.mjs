// T024.5 冒烟诊断：帧E 会话 canvas 高度 712 vs 其余会话 932——定位占掉 220px 的元素。
// 依次读：boot 时 canvas 矩形 → 视口下部元素清单 → 应用模板后再读。
import { PORT, waitReady, canvasClip, applyTemplateVia } from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const rectAtBoot = await canvasClip(evalJs);
  const bottomDwellers = JSON.parse(await evalJs(`JSON.stringify((() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.height > 4 && r.bottom > 800 && r.width > 200) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.position === 'absolute') continue;
        out.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), y: Math.round(r.y), h: Math.round(r.height), text: (el.textContent ?? '').slice(0, 30) });
      }
    }
    return out.slice(0, 20);
  })())`));
  const workspace = await evalJs(`localStorage.getItem('t3d-editor.workspace')`);
  const apply = await applyTemplateVia(evalJs, sleep, 't0245-smoke-card');
  await sleep(800);
  const rectAfterApply = await canvasClip(evalJs);
  const bottomAfter = JSON.parse(await evalJs(`JSON.stringify((() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.height > 4 && r.bottom > 800 && r.width > 200) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.position === 'absolute') continue;
        out.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), y: Math.round(r.y), h: Math.round(r.height), text: (el.textContent ?? '').slice(0, 30) });
      }
    }
    return out.slice(0, 20);
  })())`));
  return { rectAtBoot, bottomDwellers, workspacePreview: workspace ? workspace.slice(0, 400) : null, apply: apply.itemClicked, rectAfterApply, bottomAfter };
};
