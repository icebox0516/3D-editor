// ⑥ 补跑：GLB UI 放置（先展开内容浏览器——v1 教训：默认折叠卡片点击落空）+ streetlamp 中距补帧
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await sleep(1200);
  const run = (e) => evalJs(e);
  const log = { steps: {} };

  const realClick = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', buttons: 0, clickCount: 0 });
    await sleep(80);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
    await sleep(70);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
    await sleep(450);
  };
  const hover = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', buttons: 0, clickCount: 0 });
    await sleep(280);
  };
  const readOut = () => run(`(() => {
    const p = window.__tree3aPerf.stats();
    const outliner = document.querySelector('[class*=outliner]')?.textContent ?? '';
    return { dc: p.drawCalls, tri: p.triangles, objects: p.objects, outlinerHasPavilion: outliner.includes('凉亭') };
  })()`);

  // ── GLB：展开内容浏览器 → 点 asset_pavilion 卡片 → canvas 落点 ──
  {
    // 展开钮（折叠时 title=「展开内容浏览器」）
    const expand = await run(`(() => {
      const el = document.querySelector('[title="展开内容浏览器"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    })()`);
    if (expand) { await realClick(expand.x, expand.y); await sleep(700); }
    const card = await run(`(() => {
      const el = document.querySelector('[data-asset-id="asset_pavilion"]');
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    })()`);
    if (!card) throw new Error('asset_pavilion card not found after expand');
    await realClick(card.x, card.y);
    await sleep(500);
    const canvas = await run(`(() => {
      const c = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height * 0.62) };
    })()`);
    await hover(canvas.x, canvas.y);
    await screenshot('docs/acceptance/t021/021.8/acceptance/06-glb-ghost-preview.png');
    const ghostState = await readOut();
    await realClick(canvas.x, canvas.y);
    await sleep(600);
    await screenshot('docs/acceptance/t021/021.8/acceptance/06-glb-placed.png');
    const placed = await readOut();
    log.steps.glb = { expand, card, canvas, ghostState, placed, ok: placed.outlinerHasPavilion && placed.dc > 3 };
    console.log('[smoke2] glb placed: outliner=' + placed.outlinerHasPavilion + ' dc=' + placed.dc + ' tri=' + placed.tri);
    await realClick(canvas.x + 30, canvas.y - 130); // 撤选
    await sleep(300);
  }

  // ── streetlamp：中距（d=120 渲染态）+ 远（d=400 culled 态）补帧 ──
  {
    await run(`(async () => {
      const p = window.__tree3aPerf;
      p.place({ count: 3, seedBase: 1, spacing: 11, jitter: true, assetId: 'asset_streetlamp' });
      p.view({ distance: 120, azimuthDeg: 35, elevationDeg: 8 });
    })()`);
    await sleep(1300);
    const mid = await run(`(() => { const p = window.__tree3aPerf; const d = p.distribution(); const s = p.stats(); return { inst: { ...d.instances }, dc: s.drawCalls, tri: s.triangles }; })()`);
    await screenshot('docs/acceptance/t021/021.8/acceptance/06-streetlamp-mid-d120.png');
    await run(`window.__tree3aPerf.view({ distance: 400 })`);
    await sleep(900);
    const far = await run(`(() => { const p = window.__tree3aPerf; const d = p.distribution(); const s = p.stats(); return { inst: { ...d.instances }, dc: s.drawCalls, tri: s.triangles }; })()`);
    await screenshot('docs/acceptance/t021/021.8/acceptance/06-streetlamp-far-d400.png');
    log.steps.streetlamp = { mid, far };
    console.log('[smoke2] streetlamp mid d120: ' + JSON.stringify(mid) + ' | far d400: ' + JSON.stringify(far));
    await run(`window.__tree3aPerf.clear()`);
    await sleep(400);
  }
  return log;
};
