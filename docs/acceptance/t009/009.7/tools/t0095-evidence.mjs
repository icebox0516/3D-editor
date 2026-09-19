// T009.5 取证：产品路径影裁切 + DEV 同源对照 + Ghost 契约
export default async ({ navigate, setViewport, evalJs, screenshot, send, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');

  const log = {};

  // ── 1) 产品路径 3 树 + 影全景（逆光位：影朝相机） ──
  log.place3 = await evalJs(`(async () => {
    const p = window.__tree3aPerf;
    window.__tree3a.freezeTime();
    p.place({ count: 3, seedBase: 1 });
    p.view({ distance: 22, azimuthDeg: 215, elevationDeg: 14 });
    await new Promise(r => setTimeout(r, 600));
    return { stats: p.stats() };
  })()`);
  await screenshot('screenshots/t009-0095/prod-3trees-shadow-22m-az215.png');

  // ── 2) 影近景（低机位贴地看影内叶形） ──
  await evalJs(`(async () => {
    window.__tree3aPerf.view({ distance: 15, azimuthDeg: 215, elevationDeg: 3 });
    await new Promise(r => setTimeout(r, 400));
  })()`);
  await screenshot('screenshots/t009-0095/prod-shadow-closeup-15m-el3.png');

  // ── 3) 产品单树 25m 标准机位 ──
  await evalJs(`(async () => {
    const p = window.__tree3aPerf;
    p.place({ count: 1, seedBase: 1 });
    p.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    await new Promise(r => setTimeout(r, 600));
    return p.stats();
  })()`).then((s) => { log.prodSingleStats = s; });
  await screenshot('screenshots/t009-0095/prod-single-25m-az35.png');

  // ── 4) DEV 舞台单树同机位（同源对照） ──
  await evalJs(`(async () => {
    const p = window.__tree3aPerf;
    p.clear();
    window.__tree3a.mount();
    window.__tree3a.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    await new Promise(r => setTimeout(r, 600));
  })()`);
  await screenshot('screenshots/t009-0095/dev-single-25m-az35.png');
  await evalJs('window.__tree3a.unmount()');

  // ── 5) Ghost 契约：放置模式激活 → ghost 随指针 → 影无破坏 ──
  await evalJs(`(async () => {
    const p = window.__tree3aPerf;
    p.place({ count: 1, seedBase: 1 });
    p.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    await new Promise(r => setTimeout(r, 500));
    // 进入放置模式（产品路径：资产卡点击）
    const card = document.querySelector('[data-asset-id="asset_tree_3a"] button');
    if (!card) return { error: 'asset card not found' };
    card.click();
    await new Promise(r => setTimeout(r, 300));
    return { stats: p.stats() };
  })()`).then((r) => { log.beforeGhost = r; });
  // 指针移入画布左中 → ghost 出现
  const canvas = await evalJs('(() => { const c = document.querySelector("canvas"); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()');
  const px = Math.round(canvas.x + canvas.w * 0.32);
  const py = Math.round(canvas.y + canvas.h * 0.55);
  for (let i = 0; i <= 6; i++) {
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: px - 60 + i * 20,
      y: py,
      button: 'none',
      pointerType: 'mouse',
    });
    await sleep(60);
  }
  await sleep(500);
  await screenshot('screenshots/t009-0095/ghost-active-shadow-intact-25m.png');
  log.ghostEval = await evalJs(`(() => {
    const p = window.__tree3aPerf;
    const card = document.querySelector('[data-asset-id="asset_tree_3a"]');
    return { placingCardActive: card.classList.contains('ed-card--active'), stats: p.stats() };
  })()`);
  // 退出放置模式（Escape）
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(400);

  return log;
};
