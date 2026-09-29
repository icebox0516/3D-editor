// T012.1 校准轮终态复拍（D30：只拍受影响机位 + 一张基线帧，不整套重拍）
// 受影响面 = 冠层密度观感（散生针卡线密度 4→9/m）——复拍：baseline(M25) / B25 逆光（透天主证帧）/
// N12 中距 / C7 近景 / F50 远距 + slots 全景（密度横向确认）+ 风动 frozen 双帧（快照变更后逐位复核）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0121log2 = [];
      const push = (kind) => (...args) => window.__t0121log2.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0121restore2 = () => { console.error = origError; console.warn = origWarn; return window.__t0121log2; };
    })()
  `, { awaitPromise: false });
  const log = {};
  await evalJs('window.__cedrus.mount()');
  await evalJs('window.__cedrus.freezeTime()');
  for (const [name, view] of [
    ['r2-baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],
    ['r2-vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],
    ['r2-vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],
    ['r2-vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],
    ['r2-crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],
    ['r2-needle-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],
  ]) {
    await evalJs(`window.__cedrus.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t012-0121/${name}.png`);
  }
  // frozen 逐位复核（快照变更后）
  await evalJs('window.__cedrus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t012-0121/r2-wind-frozen-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t012-0121/r2-wind-frozen-frame-b.png');
  log.anchorStats = await evalJs('window.__cedrus.stats()');
  await evalJs('window.__cedrus.unmount()');
  // slots 全景（密度横向）
  await evalJs('window.__cedrus.mountSlots()');
  await evalJs('window.__cedrus.freezeTime()');
  await evalJs('window.__cedrus.viewSlots()');
  await sleep(700);
  await screenshot('screenshots/t012-0121/r2-slots-panorama-55m.png');
  log.slotsStats = await evalJs('window.__cedrus.stats()');
  await evalJs('window.__cedrus.unmount()');
  log.console = await evalJs('window.__t0121restore2()');
  return log;
};
