// T024.4 冒烟第二轮（首轮 01-07 帧已证 UI 链通；本批补近机位同帧色相对照 + 断言 JSON 收敛）。
// 场景：A 点选秋卡→UI 放置（金）→ B 拖放 mime 带卡（金）→ C 清存储拖放无 mime（绿，默认卡
// 零变化）→ 近机位同帧对照 → 键 4 重放 Ghost（金）→ console 收敛。持久化断言独立批（2b）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(3500);

  await evalJs(`(() => {
    window.__t02404Console = [];
    const push = (level) => (...a) => window.__t02404Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    localStorage.removeItem('t3d-editor.asset-presets');
    return 'ready';
  })()`);

  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(600);

  // ── 1. 色点渲染判据（DOM 断言）──
  const renderCheck = await evalJs(`(() => {
    const cards = [...document.querySelectorAll('.ed-card[data-asset-id]')];
    const byId = (id) => cards.find((c) => c.dataset.assetId === id);
    const hasStrip = (id) => { const el = byId(id); return el ? !!el.querySelector('.ed-card__presets') : null; };
    const multiCardTrees = cards.filter((c) => c.dataset.assetId?.startsWith('asset_tree_') && c.querySelector('.ed-card__presets'));
    return {
      cardTotal: cards.length,
      stripCount: cards.filter((c) => c.querySelector('.ed-card__presets')).length,
      dotTotal: document.querySelectorAll('.ed-card__preset-dot').length,
      multiCardTreeCount: multiCardTrees.length,
      camphorStrip: hasStrip('asset_tree_camphor'),
      ligustrumStrip: hasStrip('asset_tree_ligustrum'),
      facilityStripSample: hasStrip('asset_trashbin'),
      storeBefore: localStorage.getItem('t3d-editor.asset-presets'),
    };
  })()`);
  await screenshot('docs/acceptance/T024/024.4/frames/10-dots-render.png');

  // ── 2. 点选秋卡 → UI 点击放置（树 A：金）──
  const selectCheck = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    dots[1].click();
    return {
      dotTitles: dots.map((d) => d.title),
      activeAfter: [...card.querySelectorAll('.ed-card__preset-dot')].map((d) => d.className.includes('--on')),
      store: localStorage.getItem('t3d-editor.asset-presets'),
    };
  })()`);
  await evalJs(`document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"] .ed-card__main').click()`);
  await sleep(400);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointermove', { clientX: 960, clientY: 420, button: 0, bubbles: true }));
    return 'moved';
  })()`);
  await sleep(1200);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 960, clientY: 420, button: 0, bubbles: true }));
    c.dispatchEvent(new PointerEvent('pointerup', { clientX: 960, clientY: 420, button: 0, bubbles: true }));
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'placed-A';
  })()`);
  await sleep(1200);

  // ── 3. 拖放 mime 带卡（树 B：金）——存储保持 ginkgo:autumn 也在，但 drop 只认 mime；
  //     为证明「读 mime 非读存储」，此处换 swatch 同为秋卡的银杏仍说明不了差异——
  //     改证法：存储清空后仅 mime → 仍金 = mime 通道成立 ──
  await evalJs(`localStorage.removeItem('t3d-editor.asset-presets'); 'cleared-for-mime-proof'`);
  const dropMime = await evalJs(`(() => {
    const c = document.querySelector('canvas');
    const dt = new DataTransfer();
    dt.setData('application/x-asset-id', 'asset_tree_ginkgo');
    dt.setData('text/plain', 'asset_tree_ginkgo');
    dt.setData('application/x-asset-preset', 'autumn');
    c.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, clientX: 880, clientY: 440, bubbles: true }));
    return 'dropped-B-mime-autumn';
  })()`);
  await sleep(1500);

  // ── 4. 拖放无 mime + 存储空（树 C：绿——默认卡零变化）──
  const dropDefault = await evalJs(`(() => {
    const c = document.querySelector('canvas');
    const dt = new DataTransfer();
    dt.setData('application/x-asset-id', 'asset_tree_ginkgo');
    dt.setData('text/plain', 'asset_tree_ginkgo');
    c.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, clientX: 1040, clientY: 440, bubbles: true }));
    return 'dropped-C-default';
  })()`);
  await sleep(1500);

  // ── 5. 近机位同帧对照（A/B 金 vs C 绿）──
  await evalJs(`window.__tree3aPerf.view({ distance: 17, azimuthDeg: 35, elevationDeg: 12 })`);
  await sleep(900);
  await screenshot('docs/acceptance/T024/024.4/frames/11-contrast-closeup.png');
  await evalJs(`window.__tree3aPerf.view({ distance: 13, azimuthDeg: 65, elevationDeg: 14 })`);
  await sleep(900);
  await screenshot('docs/acceptance/T024/024.4/frames/12-contrast-closeup-2.png');

  // ── 6. 键 4 重放带卡：重选秋卡 → 键 4 → Ghost 近景（金）──
  await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    card.querySelectorAll('.ed-card__preset-dot')[1].click();
    return 'reselected';
  })()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: '4', code: 'Digit4', windowsVirtualKeyCode: 52 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: '4', code: 'Digit4', windowsVirtualKeyCode: 52 });
  await sleep(400);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointermove', { clientX: 900, clientY: 380, button: 0, bubbles: true }));
    return 'ghost-moved';
  })()`);
  await sleep(1400);
  await screenshot('docs/acceptance/T024/024.4/frames/13-replay-ghost-closeup.png');
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'esc';
  })()`);
  await sleep(300);

  const consoleLog = await evalJs(`window.__t02404Console`);
  return { renderCheck, selectCheck, dropMime, dropDefault, consoleLog };
};
