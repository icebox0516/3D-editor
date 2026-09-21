// T011.7 树皮/果序专项批（疑点⑧树皮近距满干 + 疑点②绿闭果可见性专项机位）
// 机位纪律（011.5 教训）：view() 负仰角被 clamp 至水平——近距帧一律 el=0 + 1200ms 阻尼收敛
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0117log = [];
      const push = (kind) => (...args) => window.__t0117log.push(kind + ':' + args.map(String).join(' '));
      window.__t0117origError = console.error; window.__t0117origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};
  await evalJs('window.__triadica.mount()');
  await evalJs('window.__triadica.freezeTime()');
  for (const [name, view] of [
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 8 }],       // 中近距满干（暗灰-灰褐窄纵裂+窄条翘皮 vs 前六语言）
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 110, elevationDeg: 0 }],     // 冠内干面近距（el=0 水平 + 1200ms 收敛）
    ['bark-trunk-1p2m-az35', { distance: 1.2, azimuthDeg: 35, elevationDeg: 0 }], // 双方位一致
    ['fruit-crown-edge-6m', { distance: 6, azimuthDeg: 35, elevationDeg: 8 }],    // 冠缘绿闭果近读（弯垂轴散挂）
    ['fruit-under-crown-8m', { distance: 8, azimuthDeg: 110, elevationDeg: 0 }],  // 冠缘水平机位（果序下垂读向）
    ['fruit-crown-edge-6m-az200', { distance: 6, azimuthDeg: 200, elevationDeg: 12 }],// 异方位果分布稳定（真实 3D 分布）
  ]) {
    await evalJs(`window.__triadica.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.7/${name}.png`);
  }
  log.console = await evalJs('(function(){ console.error = window.__t0117origError; console.warn = window.__t0117origWarn; return window.__t0117log })()');
  await evalJs('window.__triadica.unmount()');
  return log;
};
