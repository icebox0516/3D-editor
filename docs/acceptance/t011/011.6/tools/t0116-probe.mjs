// T011.6 canary + 挂载探针：canvas 尺寸 ≈ 主视口确认（金丝雀）+ 挂载/stats/console 首轮
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  const out = {};
  out.canary = await evalJs(`(function () {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    return { viewport: { w: innerWidth, h: innerHeight }, dpr: devicePixelRatio,
      canvases: canvases.map(c => ({ w: c.width, h: c.height, cssW: c.clientWidth, cssH: c.clientHeight })) };
  })()`);
  await evalJs(`(function () {
    window.__t0116log = [];
    const push = (kind) => (...args) => window.__t0116log.push(kind + ':' + args.map(String).join(' '));
    window.__t0116origError = console.error; window.__t0116origWarn = console.warn;
    console.error = push('error'); console.warn = push('warn');
  })()`, { awaitPromise: false });
  out.hasHandle = await evalJs(`typeof window.__koelreuteria`);
  await evalJs('window.__koelreuteria.mount()');
  await sleep(800);
  out.stats = await evalJs('window.__koelreuteria.stats()');
  await evalJs('window.__koelreuteria.freezeTime()');
  await evalJs('window.__koelreuteria.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.6/probe-m25.png');
  out.console = await evalJs('(function(){ return window.__t0116log })()');
  return out;
};
