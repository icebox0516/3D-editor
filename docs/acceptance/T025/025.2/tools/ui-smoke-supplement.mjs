// T025.2 补充取证（沿 025.1 ui-smoke-supplement.mjs 体例）：
// ① 激活态补读——主冒烟 afterClick 读到 React 渲染滞后旧态（store 已实证 dark-green），
//    重载后补读激活 class（应 [false,true,false]）；
// ② 持久化墨绿卡端到端——重载 → 点卡片放置 → Home 近景（storage → preset → 池分桶 → 渲染全链）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5200');
  await setViewport(1920, 1080);
  await sleep(3500);

  await evalJs(`(() => {
    window.__t02502Console = [];
    const push = (level) => (...a) => window.__t02502Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  // ── 1. 展开浏览器 + 激活态补读（存储 warm 态：dark-green 应激活第二点）──
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
  await sleep(600);
  const activeState = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_parasol"]');
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    return {
      store: localStorage.getItem('t3d-editor.asset-presets'),
      active: dots.map((d) => d.className.includes('--on')),
      titles: dots.map((d) => d.title),
    };
  })()`);
  await screenshot('docs/acceptance/T025/025.2/frames/ui-05-darkgreen-active-reload.png');

  // ── 2. 持久化墨绿卡 UI 放置 → Home 近景（端到端）──
  await evalJs(`document.querySelector('.ed-card[data-asset-id="asset_parasol"] .ed-card__main').click()`);
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
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'escaped';
  })()`);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    return 'home';
  })()`);
  await sleep(1200);
  const placeStats = await evalJs(`window.__tree3aPerf.stats()`);
  await screenshot('docs/acceptance/T025/025.2/frames/ui-06-placed-darkgreen-close.png');

  const consoleLog = await evalJs('window.__t02502Console');
  return { toggleRetry, activeState, placeStats, consoleLog };
};
