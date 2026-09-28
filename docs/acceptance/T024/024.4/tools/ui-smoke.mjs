// T024.4 浏览器色点 UI 冒烟取证批（工具沿 024.3 cdp.mjs 体例）。
// 场景：色点渲染判据（多卡显/单卡空卡 GLB 不显）→ 点选持久化 → 刷新保持 →
//       四放置入口带卡（点击 Ghost+落地 / 键 4 重放 / 合成拖放 mime 读写 / 默认卡零变化）。
// 像素证据 = 银杏 default（绿基调）vs autumn（金黄 #d4b737）对照，色差明确不可误读。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(3500); // 程序化缩略图离屏快照回填

  // console 收集（全批零错误零警告判据）
  await evalJs(`(() => {
    window.__t02404Console = [];
    const push = (level) => (...a) => window.__t02404Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  const readStore = () => evalJs(`localStorage.getItem('t3d-editor.asset-presets')`);

  // ── 1. 展开浏览器 + 色点渲染判据 ──
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(600);
  const renderCheck = await evalJs(`(() => {
    const cards = [...document.querySelectorAll('.ed-card[data-asset-id]')];
    const strips = cards.filter((c) => c.querySelector('.ed-card__presets'));
    const dotCount = document.querySelectorAll('.ed-card__preset-dot').length;
    const byId = (id) => cards.find((c) => c.dataset.assetId === id);
    const hasStrip = (id) => { const el = byId(id); return el ? !!el.querySelector('.ed-card__presets') : null; };
    return {
      cardTotal: cards.length,
      stripCount: strips.length,
      dotTotal: dotCount,
      ginkgoStrip: hasStrip('asset_tree_ginkgo'),
      camphorStrip: hasStrip('asset_tree_camphor'),
      ligustrumStrip: hasStrip('asset_tree_ligustrum'),
      salixStrip: hasStrip('asset_tree_salix'),
      facilityStripSample: hasStrip('asset_trashbin'),
      storeBefore: localStorage.getItem('t3d-editor.asset-presets'),
    };
  })()`);
  await screenshot('docs/acceptance/T024/024.4/frames/01-dots-render.png');

  // ── 2. 点选秋卡：持久化 + 激活态 ──
  const afterClick = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    dots[1].click(); // presets 声明序 [default, autumn] → 第二点 = 秋卡
    return {
      dotTitles: dots.map((d) => d.title),
      activeAfter: [...card.querySelectorAll('.ed-card__preset-dot')].map((d) => d.className.includes('--on')),
    };
  })()`);
  await sleep(200);
  const storeAfterClick = await readStore();
  await screenshot('docs/acceptance/T024/024.4/frames/02-autumn-selected.png');

  // ── 3. 点击卡片进入放置 + Ghost 带卡（视口中央 pointermove）──
  await evalJs(`document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"] .ed-card__main').click()`);
  await sleep(400);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointermove', { clientX: 960, clientY: 400, button: 0, bubbles: true }));
    return 'ghost-moved';
  })()`);
  await sleep(1500); // Ghost 源取用 + 材质就绪
  await screenshot('docs/acceptance/T024/024.4/frames/03-ghost-autumn.png');

  // ── 4. 左键落地（UI 放置链带卡）──
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 960, clientY: 400, button: 0, bubbles: true }));
    c.dispatchEvent(new PointerEvent('pointerup', { clientX: 960, clientY: 400, button: 0, bubbles: true }));
    return 'placed-ui';
  })()`);
  await sleep(1800);
  await screenshot('docs/acceptance/T024/024.4/frames/04-placed-autumn.png');
  // 退出放置（ESC → tool cancel）
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'esc';
  })()`);
  await sleep(300);

  // ── 5. 键 4 重放带卡（placementPreset 读存储）──
  // 放置工具已退出；键 4 重放 lastAssetId（ginkgo）+ 存储内 autumn 卡 → Ghost 应仍金黄
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: '4', code: 'Digit4', windowsVirtualKeyCode: 52 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: '4', code: 'Digit4', windowsVirtualKeyCode: 52 });
  await sleep(400);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointermove', { clientX: 1150, clientY: 430, button: 0, bubbles: true }));
    return 'ghost-moved-2';
  })()`);
  await sleep(1200);
  await screenshot('docs/acceptance/T024/024.4/frames/05-replay-ghost-autumn.png');
  // 落地第二枚（重放链带卡）后退出
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 1150, clientY: 430, button: 0, bubbles: true }));
    c.dispatchEvent(new PointerEvent('pointerup', { clientX: 1150, clientY: 430, button: 0, bubbles: true }));
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'replay-placed';
  })()`);
  await sleep(1500);

  // ── 6. 拖放 mime 通道：清存储后仅凭 mime 带卡（证明读侧走 mime 非存储）──
  await evalJs(`localStorage.removeItem('t3d-editor.asset-presets'); 'store-cleared'`);
  const dropWithMime = await evalJs(`(() => {
    const c = document.querySelector('canvas');
    const dt = new DataTransfer();
    dt.setData('application/x-asset-id', 'asset_tree_ginkgo');
    dt.setData('text/plain', 'asset_tree_ginkgo');
    dt.setData('application/x-asset-preset', 'autumn');
    c.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, clientX: 800, clientY: 470, bubbles: true }));
    return 'dropped-mime-autumn';
  })()`);
  await sleep(1800);
  await screenshot('docs/acceptance/T024/024.4/frames/06-drop-mime-autumn.png');
  // 默认卡零变化：无 preset mime 的拖放 → 绿基调（现状路径）
  const dropNoMime = await evalJs(`(() => {
    const c = document.querySelector('canvas');
    const dt = new DataTransfer();
    dt.setData('application/x-asset-id', 'asset_tree_ginkgo');
    dt.setData('text/plain', 'asset_tree_ginkgo');
    c.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, clientX: 1080, clientY: 500, bubbles: true }));
    return 'dropped-default';
  })()`);
  await sleep(1800);
  await screenshot('docs/acceptance/T024/024.4/frames/07-drop-nomime-default.png');

  // ── 7. 刷新持久化：重载后存储与激活态保持 ──
  await navigate('http://localhost:5173');
  await sleep(3500);
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(600);
  // 存储已随步骤 6 清掉——重新点秋卡（真实点击路径）再刷新验证持久化
  await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    card.querySelectorAll('.ed-card__preset-dot')[1].click();
    return 'reselected';
  })()`);
  const storeBeforeReload = await readStore();
  await navigate('http://localhost:5173');
  await sleep(3500);
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(600);
  const persistAfterReload = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    return {
      store: localStorage.getItem('t3d-editor.asset-presets'),
      activeAfterReload: dots.map((d) => d.className.includes('--on')),
    };
  })()`);
  await screenshot('docs/acceptance/T024/024.4/frames/08-persist-after-reload.png');

  // ── 8. 点回默认卡：条目删除（默认卡省略不落盘）──
  const backToDefault = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    card.querySelectorAll('.ed-card__preset-dot')[0].click();
    return {
      store: localStorage.getItem('t3d-editor.asset-presets'),
      activeAfter: [...card.querySelectorAll('.ed-card__preset-dot')].map((d) => d.className.includes('--on')),
    };
  })()`);

  const consoleLog = await evalJs(`window.__t02404Console`);
  return {
    renderCheck,
    afterClick,
    storeAfterClick,
    dropWithMime,
    dropNoMime,
    persistBefore: { storeBeforeReload },
    persistAfterReload,
    backToDefault,
    consoleLog,
  };
};
