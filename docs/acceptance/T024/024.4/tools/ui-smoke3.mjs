// T024.4 冒烟第三批（独立 tab 规避首轮二段 navigate 挂起通道）：刷新持久化断言 + 点回默认卡删条目。
// 前置：第二批结束态 localStorage = {"asset_tree_ginkgo":"autumn"}（同 profile 跨 tab 保留）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(3500);

  const storeOnBoot = await evalJs(`localStorage.getItem('t3d-editor.asset-presets')`);
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(600);
  const activeAfterReload = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    return { active: dots.map((d) => d.className.includes('--on')), titles: dots.map((d) => d.title) };
  })()`);
  await screenshot('docs/acceptance/T024/024.4/frames/14-persist-after-reload.png');

  // 点回默认卡：条目删除（默认卡省略不落盘）+ 激活环回默认
  const backToDefault = await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    card.querySelectorAll('.ed-card__preset-dot')[0].click();
    return {
      store: localStorage.getItem('t3d-editor.asset-presets'),
      activeAfter: [...card.querySelectorAll('.ed-card__preset-dot')].map((d) => d.className.includes('--on')),
    };
  })()`);
  await screenshot('docs/acceptance/T024/024.4/frames/15-back-to-default.png');

  return { storeOnBoot, activeAfterReload, backToDefault };
};
