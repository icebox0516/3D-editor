// T025.2 UI 冒烟（沿 025.1 ui-smoke.mjs 体例，改资产 id 与色点数）：遮阳伞三色点渲染判据 →
// 点墨绿卡持久化 → UI 放置链带卡（Ghost + 落地墨绿伞像素）→ console 全动作零错误零警告。
// 墨绿卡落地像素 = 伞面色卡链 UI 入口端到端证据（色点 → localStorage → 放置 preset →
// 池分桶 → 渲染）；shapeFamily 声明在批 A 已由通用不变量锁（本卡集声明位在 meta）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5200');
  await setViewport(1920, 1080);
  await sleep(3500); // 程序化缩略图回填

  // 干净链：清色卡存储 → 重载（storeBefore 必为 null，「点击→变卡」才未被暖启动污染）
  await evalJs(`localStorage.removeItem('t3d-editor.asset-presets')`);
  await navigate('http://localhost:5200');
  await sleep(3000);

  // console 收集（全动作零错误零警告判据）——必须在重载之后安装（025.1 教训：先装被重载抹掉）
  await evalJs(`(() => {
    window.__t02502Console = [];
    const push = (level) => (...a) => window.__t02502Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  // ── 1. 展开浏览器 + 伞卡色点渲染判据（toggle 有界重试，025.1 同款）──
  const toggleRetry = await evalJs(`(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const tgl = document.querySelector('.ed-browser__toggle');
    const visible = () => {
      const card = document.querySelector('.ed-card[data-asset-id="asset_parasol"]');
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
  const dotsCheck = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_parasol"]');
    if (!card) return { found: false };
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    return {
      found: true,
      hasStrip: !!card.querySelector('.ed-card__presets'),
      dotCount: dots.length,
      dotTitles: dots.map((d) => d.title),
      storeBefore: localStorage.getItem('t3d-editor.asset-presets'),
    };
  })()`);
  await screenshot('docs/acceptance/T025/025.2/frames/ui-01-parasol-dots.png');

  // ── 2. 点墨绿卡（第二点）：持久化 + 激活态 ──
  const afterClick = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_parasol"]');
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    dots[1].click(); // presets 声明序 [default 米白, dark-green 墨绿, wine-red 酒红] → 第二点 = 墨绿
    return {
      activeAfter: [...card.querySelectorAll('.ed-card__preset-dot')].map((d) => d.className.includes('--on')),
    };
  })()`);
  await sleep(200);
  const storeAfterClick = await evalJs(`localStorage.getItem('t3d-editor.asset-presets')`);
  await screenshot('docs/acceptance/T025/025.2/frames/ui-02-darkgreen-selected.png');

  // ── 3. 点卡片进放置 + Ghost 带卡（视口中央）──
  await evalJs(`document.querySelector('.ed-card[data-asset-id="asset_parasol"] .ed-card__main').click()`);
  await sleep(400);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointermove', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
    return 'ghost-moved';
  })()`);
  await sleep(1500);
  await screenshot('docs/acceptance/T025/025.2/frames/ui-03-ghost-darkgreen.png');

  // ── 4. 左键落地（UI 放置链带卡）──
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
    c.dispatchEvent(new PointerEvent('pointerup', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
    return 'placed-ui';
  })()`);
  await sleep(1800);
  await screenshot('docs/acceptance/T025/025.2/frames/ui-04-placed-darkgreen.png');

  // ── 5. 退出放置 ──
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'escaped';
  })()`);
  await sleep(300);

  const consoleLog = await evalJs('window.__t02502Console');
  return { toggleRetry, dotsCheck, afterClick, storeAfterClick, consoleLog };
};
