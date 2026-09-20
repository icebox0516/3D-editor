// T011.6 树皮/花果专项批（疑点⑧树皮近距满干 + 疑点②花果可见性专项机位）
// 机位纪律（011.5 教训）：view() 负仰角被 clamp 至水平——近距帧一律 el=0 + 1200ms 阻尼收敛
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0116log = [];
      const push = (kind) => (...args) => window.__t0116log.push(kind + ':' + args.map(String).join(' '));
      window.__t0116origError = console.error; window.__t0116origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};
  await evalJs('window.__koelreuteria.mount()');
  await evalJs('window.__koelreuteria.freezeTime()');
  for (const [name, view] of [
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 8 }],       // 中近距满干（浅色光滑+皮孔麻点+无剥落 vs 前六语言）
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 110, elevationDeg: 0 }],     // 冠内干面近距（el=0 水平 + 1200ms 收敛）
    ['bark-trunk-1p2m-az35', { distance: 1.2, azimuthDeg: 35, elevationDeg: 0 }], // 双方位一致
    ['fruit-under-crown-8m', { distance: 8, azimuthDeg: 110, elevationDeg: 0 }],  // 冠缘中下灯笼果串（水平机位仰观读向）
    ['fruit-crown-edge-6m', { distance: 6, azimuthDeg: 35, elevationDeg: 8 }],    // 冠缘果/花团块近读
    ['flower-crown-7m-az200', { distance: 7, azimuthDeg: 200, elevationDeg: 12 }],// 异方位花团块（冠面上部外缘 vs 果冠缘分工）
  ]) {
    await evalJs(`window.__koelreuteria.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.6/${name}.png`);
  }
  log.console = await evalJs('(function(){ console.error = window.__t0116origError; console.warn = window.__t0116origWarn; return window.__t0116log })()');
  await evalJs('window.__koelreuteria.unmount()');
  return log;
};
