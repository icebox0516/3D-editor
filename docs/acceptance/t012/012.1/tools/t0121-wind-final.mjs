// T012.1 终态风动证据补拍（校准后代码：run 双帧 M25 + flutter 双帧 C7——回调不改风动面，
// 但证据帧应出自终态构建；frozen 已在 r2 复拍内逐位复核）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0121log3 = [];
      const push = (kind) => (...args) => window.__t0121log3.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0121restore3 = () => { console.error = origError; console.warn = origWarn; return window.__t0121log3; };
    })()
  `, { awaitPromise: false });
  await evalJs('window.__cedrus.mount()');
  await evalJs('window.__cedrus.unfreezeTime()');
  await evalJs('window.__cedrus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t012-0121/r2-wind-run-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t012-0121/r2-wind-run-frame-b.png');
  await evalJs('window.__cedrus.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(400);
  await screenshot('screenshots/t012-0121/r2-wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('screenshots/t012-0121/r2-wind-flutter-c7-b.png');
  await evalJs('window.__cedrus.unmount()');
  return { console: await evalJs('window.__t0121restore3()') };
};
