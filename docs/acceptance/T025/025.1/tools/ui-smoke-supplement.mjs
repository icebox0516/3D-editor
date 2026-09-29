// T025.1 UI 冒烟补充取证（主冒烟 ui-smoke.mjs 之后的二次链）：
// ① 抽屉 DOM 态探针——解释主冒烟 ui-01 帧中抽屉视觉收起而 DOM 全通的现象；
// ② 展开抽屉帧——内容浏览器卡片网格可视证据（对照 024.4 体例帧）；
// ③ 持久化黄卡（主冒烟点击后留存）→ 重载 → UI 点击放置 → Home 近景帧 =
//    「UI 放置链 + localStorage 黄卡 → 黄锥像素」端到端补强（主冒烟默认机位锥仅 2px）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5199');
  await setViewport(1920, 1080);
  await sleep(3500);

  // ── ① 抽屉态探针（不做任何点击前的原始态）──
  const drawerProbe = await evalJs(`(() => {
    const toggle = document.querySelector('.ed-browser__toggle');
    const card = document.querySelector('.ed-card[data-asset-id="asset_trafficcone"]');
    return {
      store: localStorage.getItem('t3d-editor.asset-presets'),
      toggleClass: toggle ? toggle.className : null,
      toggleText: toggle ? toggle.textContent.trim() : null,
      cardInDom: !!card,
      cardVisible: !!card && card.offsetParent !== null,
      stripRectH: (() => {
        const el = document.querySelector('.ed-card[data-asset-id="asset_trafficcone"]');
        if (!el) return null;
        let n = el, h = 0;
        while (n && n !== document.body) { h = n.getBoundingClientRect().height; if (h > 0) break; n = n.parentElement; }
        return h;
      })(),
    };
  })()`);

  // ── ② 展开抽屉（.ed-browser__toggle）→ 卡片网格可视帧 ──
  //（修正记档：曾用 textContent==='展开' 全页扫描——命中的是左栏大纲树同名钮；
  // 浏览器 toggle 文案为『▼展开』（色标字符+文字拼接），精确等值扫描必然错过。
  // 改用 toggle 直选 + 可视性有界重试，与主冒烟同判据）
  const expandState = await evalJs(`(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const tgl = document.querySelector('.ed-browser__toggle');
    const card = document.querySelector('.ed-card[data-asset-id="asset_trafficcone"]');
    const visible = () => !!card && card.offsetParent !== null;
    let attempts = 0;
    for (let i = 0; i < 3 && !visible(); i++) { tgl.click(); attempts++; await sleep(700); }
    return { attempts, expanded: visible() };
  })()`);
  await sleep(400);
  await screenshot('docs/acceptance/T025/025.1/frames/ui-05-drawer-expanded.png');

  // ── ③ 持久化黄卡 → UI 点击放置 → Escape 退出 → Home 全景近景 ──
  await evalJs(`document.querySelector('.ed-card[data-asset-id="asset_trafficcone"] .ed-card__main').click()`);
  await sleep(400);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new PointerEvent('pointermove', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
    c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
    c.dispatchEvent(new PointerEvent('pointerup', { clientX: 960, clientY: 480, button: 0, bubbles: true }));
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return 'placed-and-escaped';
  })()`);
  await sleep(1500);
  await evalJs(`(() => {
    const c = document.querySelector('canvas');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    return 'home-focus';
  })()`);
  await sleep(1500);
  await screenshot('docs/acceptance/T025/025.1/frames/ui-06-placed-yellow-close.png');

  const storeEnd = await evalJs(`localStorage.getItem('t3d-editor.asset-presets')`);
  return { drawerProbe, expandState, storeEnd };
};
