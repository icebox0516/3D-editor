// T011.3 Step 4b 校准终态复拍（D30 纪律：只拍受影响机位 + 一张基线帧）+ console 回读
// 受影响：T26 双方位（斑驳主判读位）+ 1.2m 干腰特写（探针位）+ baseline（基线帧）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0113log = [];
      const push = (kind) => (...args) => window.__t0113log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0113restore2 = () => { console.error = origError; console.warn = origWarn; return window.__t0113log; };
    })()
  `, { awaitPromise: false });
  await evalJs('window.__zelkova.mount()');
  await evalJs('window.__zelkova.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],
    ['bark-2p6m-az35', { distance: 2.6, azimuthDeg: 35, elevationDeg: -15 }],
    ['bark-2p6m-az110', { distance: 2.6, azimuthDeg: 110, elevationDeg: -15 }],
    ['probe-bark-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: 2 }],
  ]) {
    await evalJs(`window.__zelkova.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0113/${name}.png`);
  }
  await evalJs('window.__zelkova.unmount()');
  const consoleLog = await evalJs('window.__t0113restore2()');
  return { console: consoleLog };
};
