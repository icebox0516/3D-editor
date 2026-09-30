// T012.4 白皮松风动三证据补采（Step 4 疑点触发——012.3 t0123-wind.mjs 同式）
// 配方（bungeanaMaterials 头注）：两成分——整冠低频慢摆 0.30Hz×幅 0.02m + 末级枝/束
// 高频颤 2.4Hz×幅 0.014m；树高锚 11.5。
// 载体：mountWindDemo(1)（单实例锚点树落原点 = aSeed 0.13 消费路径的正式风动排；
//       单树取景与 012.2/012.3 mount() 单树帧同口径，量化数值可直接对照）。
// 用法：node ../012.2/tools/cdp.mjs tools/t0124-wind.mjs
// 产出：wind-run-a/b.png（M25 · az35 · el8 · 运转，间隔 ≥1s——0.30Hz 相位差 ≥0.3 周期）
//       wind-flutter-a/b.png（M12 · az35 · el8 近景——与 Step 3c m12-near 同机位）
//       wind-frozen-a/b.png（freezeTime 后 M25 同机位两帧——须严格全零）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0124wlog = [];
      const push = (kind) => (...args) => window.__t0124wlog.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0124wrestore = () => { console.error = origError; console.warn = origWarn; return window.__t0124wlog; };
    })()
  `, { awaitPromise: false });
  const canary = await evalJs(`(() => ({
    hasBungeana: typeof window.__bungeana === 'object' && window.__bungeana !== null,
    mainCanvas: (() => { const cv = document.querySelector('canvas'); return cv ? [cv.width, cv.height] : null; })(),
  }))()`);
  if (!canary.hasBungeana) return { ABORT: 'canary failed', canary };

  // ── run 双帧（成分一：整冠低频慢摆 0.30Hz×0.02m——主成分）──
  await evalJs('window.__bungeana.mountWindDemo(1)');
  await evalJs('window.__bungeana.unfreezeTime()');
  await evalJs('window.__bungeana.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1200);
  await screenshot('wind-run-a.png');
  await sleep(1100); // ≥1s：0.30Hz 下相位差 ≥0.3 周期
  await screenshot('wind-run-b.png');

  // ── flutter 双帧（成分二：末级束高频颤 2.4Hz×0.014m——近景末级枝带）──
  await evalJs('window.__bungeana.view({ distance: 12, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(600);
  await screenshot('wind-flutter-a.png');
  await sleep(250); // 2.4Hz 下相位差 0.6 周期
  await screenshot('wind-flutter-b.png');

  // ── frozen 对照双帧（回 run 机位——证 run 差分来自风相位而非环境漂移；须全零）──
  await evalJs('window.__bungeana.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await evalJs('window.__bungeana.freezeTime()');
  await sleep(900);
  await screenshot('wind-frozen-a.png');
  await sleep(500);
  await screenshot('wind-frozen-b.png');
  await evalJs('window.__bungeana.unmount()');
  const log = await evalJs('window.__t0124wrestore()');
  return { canary, consoleNoise: log };
};
