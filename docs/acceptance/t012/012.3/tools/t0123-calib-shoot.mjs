// T012.3 Step 4 密度校准轮实拍（复用 012.2 cdp.mjs 管线 + vite 5183 复用）
// 用法：node ../012.2/tools/cdp.mjs tools/t0123-calib-shoot.mjs <tag>
// 产出：<tag>-empty.png / <tag>-mounted.png（M25 · az35 · el8 · day · freezeTime 同族机位）
//       + anchor stats + console 噪声账目。量化用 t0123-crownband.mjs 同式复跑。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  const tag = (globalThis.process?.argv?.slice(2).find((a) => !a.endsWith('.mjs')) || 'calib');
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0123log = [];
      const push = (kind) => (...args) => window.__t0123log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0123restore = () => { console.error = origError; console.warn = origWarn; return window.__t0123log; };
    })()
  `, { awaitPromise: false });
  const canary = await evalJs(`(() => ({
    hasJuniperus: typeof window.__juniperus === 'object' && window.__juniperus !== null,
    mainCanvas: (() => { const cv = document.querySelector('canvas'); return cv ? [cv.width, cv.height] : null; })(),
  }))()`);
  if (!canary.hasJuniperus) return { ABORT: 'canary failed', canary };
  // 空场帧
  await evalJs(`window.__juniperus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(400);
  await screenshot(`${tag}-empty.png`);
  // 挂树冻结帧
  await evalJs('window.__juniperus.mount()');
  await evalJs('window.__juniperus.freezeTime()');
  await evalJs(`window.__juniperus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(1000);
  await screenshot(`${tag}-mounted.png`);
  const anchorStats = await evalJs('window.__juniperus.stats()');
  const log = await evalJs('window.__t0123restore()');
  return { tag, canary, anchorStats, consoleNoise: log };
};
