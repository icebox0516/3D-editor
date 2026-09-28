// T024.4 冒烟补读：点回默认卡后的重渲染态（上批为点击后同步读，React 渲染滞后读旧态）。
export default async ({ navigate, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await sleep(3500);
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(500);
  return evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    return {
      store: localStorage.getItem('t3d-editor.asset-presets'),
      active: [...card.querySelectorAll('.ed-card__preset-dot')].map((d) => d.className.includes('--on')),
    };
  })()`);
};
