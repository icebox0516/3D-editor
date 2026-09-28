// 调试：检查 fade-chain 页加载状态（__CALIB_ERRORS / __fadeChain / canvas）
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173/docs/acceptance/t021/021.8/tools/fade-chain.html');
  await setViewport(1920, 1080);
  await sleep(6000);
  return await evalJs(`(() => ({
    hasFadeChain: !!window.__fadeChain,
    ready: window.__fadeChain ? window.__fadeChain.ready : null,
    initFailed: window.__fadeChain ? window.__fadeChain.initFailed ?? false : null,
    errors: window.__CALIB_ERRORS,
    warnings: window.__CALIB_WARNINGS,
    canvases: [...document.querySelectorAll('canvas')].map(c => [c.width, c.height]),
    viewport: [window.innerWidth, window.innerHeight],
  }))()`);
};
