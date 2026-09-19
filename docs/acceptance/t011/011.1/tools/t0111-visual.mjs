// T011.1 朴树固定机位视觉取证批次（DEV 舞台，风冻结；console 全程收集）
// 机位口径 = shadow-visual-sop §3：N12/M25/F50/B25/L35/C7/T26×2/BS22/SC15/P42 + LOD 档间 + 风动双帧
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 收集（SOP §2 纪律：零错误零警告——注入桥接收集，页面侧还原时取回）
  await evalJs(`
    (function () {
      window.__t0111log = [];
      const push = (kind) => (...args) => window.__t0111log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0111restore = () => { console.error = origError; console.warn = origWarn; return window.__t0111log; };
    })()
  `, { awaitPromise: false });

  const t = () => evalJs('window.__celtis');
  const log = {};

  // ── 单树锚点（slot-0）视觉六要素 ──
  await evalJs('window.__celtis.mount()');
  await evalJs('window.__celtis.freezeTime()');
  for (const [name, view] of [
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],      // N12
    ['vis-mid-25m', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],       // M25
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],       // F50
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L35
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],          // C7
    ['bark-2p6m-az35', { distance: 2.6, azimuthDeg: 35, elevationDeg: -15 }], // T26 a
    ['bark-2p6m-az110', { distance: 2.6, azimuthDeg: 110, elevationDeg: -15 }],// T26 b
    ['shadow-22m-az215', { distance: 22, azimuthDeg: 215, elevationDeg: 14 }],// BS22
    ['shadow-closeup-15m-el3', { distance: 15, azimuthDeg: 215, elevationDeg: 3 }],// SC15
  ]) {
    await evalJs(`window.__celtis.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0111/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__celtis.stats()');

  // ── 风动双帧（008.3 三证据之 ①②：运转像素变化>0 / 冻结逐位 0）──
  await evalJs('window.__celtis.unfreezeTime()');
  await evalJs('window.__celtis.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t011-0111/wind-run-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0111/wind-run-frame-b.png');
  await evalJs('window.__celtis.freezeTime()');
  await sleep(200);
  await screenshot('screenshots/t011-0111/wind-frozen-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0111/wind-frozen-frame-b.png');
  await evalJs('window.__celtis.unmount()');

  // ── 风动相位互异（③：三棵同槽树 aSeed 相位差——拍存档照，机器断言在 celtisStage 测试）──
  await evalJs('window.__celtis.mountWindDemo(3)');
  await evalJs('window.__celtis.freezeTime()');
  await evalJs('window.__celtis.view({ distance: 30, azimuthDeg: 90, elevationDeg: 6 })');
  await sleep(500);
  await screenshot('screenshots/t011-0111/wind-demo-3trees.png');
  await evalJs('window.__celtis.unmount()');

  // ── 8 槽全景（P42）──
  await evalJs('window.__celtis.mountSlots()');
  await evalJs('window.__celtis.freezeTime()');
  await evalJs('window.__celtis.viewSlots()');
  await sleep(700);
  await screenshot('screenshots/t011-0111/slots-panorama-42m.png');
  log.slotsStats = await evalJs('window.__celtis.stats()');
  await evalJs('window.__celtis.unmount()');

  // ── LOD 档间连续（32m 全景 + 60m 远距 + 逐档 25m + Low 50m）──
  await evalJs('window.__celtis.mountLevels({ slot: 0 })');
  await evalJs('window.__celtis.freezeTime()');
  for (const [name, fn] of [
    ['levels-32m', 'window.__celtis.viewLevels({ distance: 32, elevationDeg: 16 })'],
    ['levels-far-60m', 'window.__celtis.viewLevels({ distance: 60, elevationDeg: 16 })'],
    ['level-high-25m', 'window.__celtis.viewLevel("high", { distance: 25, elevationDeg: 8 })'],
    ['level-mid-25m', 'window.__celtis.viewLevel("mid", { distance: 25, elevationDeg: 8 })'],
    ['level-low-25m', 'window.__celtis.viewLevel("low", { distance: 25, elevationDeg: 8 })'],
    ['level-low-50m', 'window.__celtis.viewLevel("low", { distance: 50, elevationDeg: 8 })'],
  ]) {
    await evalJs(fn);
    await sleep(500);
    await screenshot(`screenshots/t011-0111/lod-${name}.png`);
  }
  log.levelsStats = await evalJs('window.__celtis.stats()');
  await evalJs('window.__celtis.unmount()');

  log.consoleErrors = await evalJs('window.__t0111restore()');
  return log;
};
