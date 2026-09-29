// T012.3 风动三证据补采（恢复会话主代理——012.2 先例同式：run / flutter / frozen 三帧对）
// C3-c 前置已满足：叶可见性经像素量化确认（冠带绿 6.5% / 同窗 22.8%）后采集。
// 用法：node ../012.2/tools/cdp.mjs tools/t0123-wind.mjs
// 产出：wind-run-frame-a/b.png（M25 · az35 · el8 · day · 运转）
//       wind-flutter-c8-a/b.png（M8 · az35 · el10 近景颤）
//       wind-frozen-frame-a/b.png（freezeTime 对照——须全零）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0123wlog = [];
      const push = (kind) => (...args) => window.__t0123wlog.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0123wrestore = () => { console.error = origError; console.warn = origWarn; return window.__t0123wlog; };
    })()
  `, { awaitPromise: false });
  const canary = await evalJs(`(() => ({
    hasJuniperus: typeof window.__juniperus === 'object' && window.__juniperus !== null,
    mainCanvas: (() => { const cv = document.querySelector('canvas'); return cv ? [cv.width, cv.height] : null; })(),
  }))()`);
  if (!canary.hasJuniperus) return { ABORT: 'canary failed', canary };
  // ── run 双帧（整冠低频摆——主成分）──
  await evalJs('window.__juniperus.mount()');
  await evalJs('window.__juniperus.unfreezeTime()');
  await evalJs('window.__juniperus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1200);
  await screenshot('wind-run-frame-a.png');
  await sleep(400);
  await screenshot('wind-run-frame-b.png');
  // ── 近景颤双帧（末级鳞枝细幅微颤——第二成分）──
  await evalJs('window.__juniperus.view({ distance: 8, azimuthDeg: 35, elevationDeg: 10 })');
  await sleep(600);
  await screenshot('wind-flutter-c8-a.png');
  await sleep(250);
  await screenshot('wind-flutter-c8-b.png');
  // ── frozen 对照双帧（须全零——排除云动/光照漂移假信号）──
  await evalJs('window.__juniperus.freezeTime()');
  await sleep(900);
  await screenshot('wind-frozen-frame-a.png');
  await sleep(500);
  await screenshot('wind-frozen-frame-b.png');
  await evalJs('window.__juniperus.unmount()');
  const log = await evalJs('window.__t0123wrestore()');
  return { canary, consoleNoise: log };
};
