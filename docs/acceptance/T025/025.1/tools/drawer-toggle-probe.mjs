// 抽屉 toggle 语义探针（数据定案）：全新加载原始态 → 点 .ed-browser__toggle →
// 再点一次，逐步记录 toggle 文案与抽屉可视性，解释主冒烟 ui-01 帧的抽屉视觉态。
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5199');
  await setViewport(1920, 1080);
  await sleep(3500);

  const probe = (tag) => evalJs(`(() => {
    const t = document.querySelector('.ed-browser__toggle');
    const card = document.querySelector('.ed-card[data-asset-id="asset_trafficcone"]');
    return {
      toggleText: t ? t.textContent.trim() : null,
      ariaExpanded: t ? t.getAttribute('aria-expanded') : null,
      cardInDom: !!card,
      cardVisible: !!card && card.offsetParent !== null,
      cardRectH: card ? Math.round(card.getBoundingClientRect().height) : null,
      bodyRectH: (() => {
        const b = document.querySelector('.ed-browser__body');
        return b ? Math.round(b.getBoundingClientRect().height) : null;
      })(),
    };
  })()`);

  const fresh = await probe('fresh-load');
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(800);
  const after1 = await probe('after-toggle-click-1');
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(800);
  const after2 = await probe('after-toggle-click-2');
  return { fresh, after1, after2 };
};
