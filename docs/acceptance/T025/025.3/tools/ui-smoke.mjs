// T025.3 UI 冒烟（沿 025.2 ui-smoke.mjs 体例，批 C 无色卡 → 面收窄为放置链真实消费）：
// 三卡片渲染判据（含缩略图离屏回填）→ 点卡片进放置 → Ghost → 左键落地（stats 对账
// TRIANGLES ≈ 契约 ×2 shadow 通道）→ Escape → 三件逐一 UI 放置链 → Home 近景 →
// console 全动作零错误零警告。批 C 全批 presets [] → 无色点/换卡面（任务书裁定 6）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5201');
  await setViewport(1920, 1080);
  await sleep(3500); // 程序化缩略图回填

  // console 收集（全动作零错误零警告判据）——安装后无重载动作（无色卡存储面）
  await evalJs(`(() => {
    window.__t02503Console = [];
    const push = (level) => (...a) => window.__t02503Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  // ── 1. 展开浏览器 + 三卡片在位判据（toggle 有界重试，025.1/025.2 同款）──
  const toggleRetry = await evalJs(`(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const tgl = document.querySelector('.ed-browser__toggle');
    const visible = () => {
      const card = document.querySelector('.ed-card[data-asset-id="asset_cctv_camera"]');
      return !!card && card.offsetParent !== null;
    };
    let attempts = 0;
    for (let i = 0; i < 3 && !visible(); i++) {
      tgl.click();
      attempts++;
      await sleep(700);
    }
    return { attempts, expanded: visible() };
  })()`);
  await sleep(400);
  const cardsCheck = await evalJs(`(() => {
    const ids = ['asset_cctv_camera', 'asset_ev_charger', 'asset_manhole'];
    return ids.map((id) => {
      const card = document.querySelector('.ed-card[data-asset-id="' + id + '"]');
      return { id, found: !!card, hasThumb: !!card?.querySelector('canvas, img'), presetDots: card?.querySelectorAll('.ed-card__preset-dot').length ?? null };
    });
  })()`);
  await screenshot('docs/acceptance/T025/025.3/frames/ui-01-cards.png');

  const pressEscape = () => evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'escaped';
  })()`);
  // 状态栏读数（批 A 口径——OBJECTS/TRIANGLES 为 WYSIWYG 证据；.ed-statusbar 段 label/value 对）
  const statusBar = () => evalJs(`(() => {
    const segs = [...document.querySelectorAll('.ed-statusbar__segment')];
    return segs.map((s) => {
      const l = s.querySelector('.ed-statusbar__label')?.textContent ?? '';
      const v = s.querySelector('.ed-statusbar__value')?.textContent ?? '';
      return l ? l + '=' + v : v;
    }).join(' | ');
  })()`);
  const placeViaUi = async (id) => {
    await evalJs(`document.querySelector('.ed-card[data-asset-id="' + '${id}' + '"] .ed-card__main').click()`);
    await sleep(400);
    await evalJs(`(() => {
      const c = document.querySelector('canvas');
      c.dispatchEvent(new PointerEvent('pointermove', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
      return 'ghost-moved';
    })()`);
    await sleep(1200);
    await evalJs(`(() => {
      const c = document.querySelector('canvas');
      c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
      c.dispatchEvent(new PointerEvent('pointerup', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
      return 'placed-ui';
    })()`);
    await sleep(1500);
    return evalJs(`window.__tree3aPerf.stats()`);
  };

  // ── 2. cctv 全链：Ghost 帧 → 落地帧（TRIANGLES 对账 = 契约 768×2 shadow + 地面）──
  await evalJs(`document.querySelector('.ed-card[data-asset-id="asset_cctv_camera"] .ed-card__main').click()`);
  await sleep(400);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointermove', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
    return 'ghost-moved';
  })()`);
  await sleep(1500);
  await screenshot('docs/acceptance/T025/025.3/frames/ui-02-ghost-cctv.png');
  const cctvPlaced = await placeViaUi('asset_cctv_camera');
  const cctvBar = await statusBar();
  await screenshot('docs/acceptance/T025/025.3/frames/ui-03-placed-cctv.png');
  await pressEscape();
  await sleep(300);

  // ── 3. ev_charger UI 放置链 ──
  const evPlaced = await placeViaUi('asset_ev_charger');
  const evBar = await statusBar();
  await screenshot('docs/acceptance/T025/025.3/frames/ui-04-placed-ev.png');
  await pressEscape();
  await sleep(300);

  // ── 4. manhole UI 放置链 + Home 近景（贴地圆盘件近景可辨判据）──
  const manholePlaced = await placeViaUi('asset_manhole');
  const manholeBar = await statusBar();
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    return 'home';
  })()`);
  await sleep(1200);
  await screenshot('docs/acceptance/T025/025.3/frames/ui-05-placed-manhole-close.png');
  await pressEscape();

  const consoleLog = await evalJs('window.__t02503Console');
  return { toggleRetry, cardsCheck, cctvPlaced, cctvBar, evPlaced, evBar, manholePlaced, manholeBar, consoleLog };
};
