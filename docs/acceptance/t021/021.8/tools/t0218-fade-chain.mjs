// T021.8 ③ Fade 专项——chain harness（六运动模式 × 四判据；真实调度路径逐帧步进）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173/docs/acceptance/t021/021.8/tools/fade-chain.html');
  await setViewport(1920, 1080);
  // 就绪等待
  for (let i = 0; i < 60; i++) {
    const ready = await evalJs('window.__fadeChain && window.__fadeChain.ready');
    if (ready) break;
    await sleep(500);
  }
  const run = (expression) => evalJs(`window.__fadeChain.${expression}`);
  const log = {};
  log.treeInfo = await run('treeInfo()');
  log.thresholds = await run('thresholds()');
  log.canary = await evalJs(`(() => ({
    hasFadeChain: !!window.__fadeChain,
    ready: window.__fadeChain ? window.__fadeChain.ready : null,
    errors: window.__CALIB_ERRORS,
    warnings: window.__CALIB_WARNINGS,
    canvases: [...document.querySelectorAll('canvas')].map((c) => [c.width, c.height]),
    viewport: [window.innerWidth, window.innerHeight],
  }))()`);

  // 金丝雀：canvas 1920×1080 恰满视口
  const main = log.canary.canvases?.[0];
  if (!log.canary.ready || !main || main[0] !== 1920 || main[1] !== 1080) {
    throw new Error('fade-chain canary failed: ' + JSON.stringify(log.canary));
  }

  log.modes = {};
  for (const mode of ['recede', 'approach', 'roundtrip', 'fastDrag', 'slowMove', 'fovChange']) {
    log.modes[mode] = await run(`runNamed('${mode}')`);
    const s = log.modes[mode].summary;
    console.log(`[fade-chain] ${mode}: steps=${log.modes[mode].nSteps} rev=${JSON.stringify(s.reversals)} diffMax=${s.diffMax} baseline=${s.diffBaselineMean ?? s.diffMean} mem=${JSON.stringify(s.memoryDistinct)} pools=${JSON.stringify(s.poolCountSeriesDistinct ?? [])}`);
  }

  // 证据帧（模式跑完后取两个带中点静态帧）
  await evalJs('(async () => { await window.__fadeChain.step(18); })()');
  await screenshot('docs/acceptance/t021/021.8/acceptance/03-chain-dither-f050-m18.png');
  await evalJs('(async () => { await window.__fadeChain.step(67.5); })()');
  await screenshot('docs/acceptance/t021/021.8/acceptance/03-chain-fadeout-f050-m67.5.png');

  log.consoleDump = await run('consoleDump()');
  return log;
};
