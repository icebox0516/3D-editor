// T011.2 香樟固定机位视觉取证主批次（DEV 舞台，风冻结；console 全程收集）
// 机位口径 = shadow-visual-sop §3：N12/M25/F50/B25/L35/C7/T26×2/BS22/SC15/P42×2 + LOD 档间 + 风动双帧
// （沿 011.1 t0111-visual.mjs 结构，__celtis→__camphor；宽幅全景+低位背阴树皮直接进主批次——011.1 补拍教训）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 收集（SOP §2 纪律：零错误零警告——注入桥接收集，页面侧还原时取回）
  await evalJs(`
    (function () {
      window.__t0112log = [];
      const push = (kind) => (...args) => window.__t0112log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0112restore = () => { console.error = origError; console.warn = origWarn; return window.__t0112log; };
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）视觉六要素 ──
  await evalJs('window.__camphor.mount()');
  await evalJs('window.__camphor.freezeTime()');
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
    ['bark-low-shaded-3p2m-az215', { distance: 3.2, azimuthDeg: 215, elevationDeg: -22 }], // 低位背阴（011.1 补拍位直接入列）
  ]) {
    await evalJs(`window.__camphor.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0112/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__camphor.stats()');

  // ── 风动双帧（008.3 三证据之 ①②：运转像素变化>0 / 冻结逐位 0）──
  await evalJs('window.__camphor.unfreezeTime()');
  await evalJs('window.__camphor.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t011-0112/wind-run-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0112/wind-run-frame-b.png');
  await evalJs('window.__camphor.freezeTime()');
  await sleep(200);
  await screenshot('screenshots/t011-0112/wind-frozen-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0112/wind-frozen-frame-b.png');
  await evalJs('window.__camphor.unmount()');

  // ── 风动相位互异（③：三棵同槽树 aSeed 相位差——拍存档照，机器断言在 camphorStage 测试）──
  await evalJs('window.__camphor.mountWindDemo(3)');
  await evalJs('window.__camphor.freezeTime()');
  await evalJs('window.__camphor.view({ distance: 30, azimuthDeg: 90, elevationDeg: 6 })');
  await sleep(500);
  await screenshot('screenshots/t011-0112/wind-demo-3trees.png');
  await evalJs('window.__camphor.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅——011.1 右缘裁切教训：双距直接拍）──
  await evalJs('window.__camphor.mountSlots()');
  await evalJs('window.__camphor.freezeTime()');
  await evalJs('window.__camphor.viewSlots()');
  await sleep(700);
  await screenshot('screenshots/t011-0112/slots-panorama-42m.png');
  await evalJs('window.__camphor.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(700);
  await screenshot('screenshots/t011-0112/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__camphor.stats()');
  await evalJs('window.__camphor.unmount()');

  // ── LOD 档间连续（32m 全景 + 60m 远距 + 逐档 25m + Low 50m）──
  await evalJs('window.__camphor.mountLevels({ slot: 0 })');
  await evalJs('window.__camphor.freezeTime()');
  for (const [name, fn] of [
    ['levels-32m', 'window.__camphor.viewLevels({ distance: 32, elevationDeg: 16 })'],
    ['levels-far-60m', 'window.__camphor.viewLevels({ distance: 60, elevationDeg: 16 })'],
    ['level-high-25m', 'window.__camphor.viewLevel("high", { distance: 25, elevationDeg: 8 })'],
    ['level-mid-25m', 'window.__camphor.viewLevel("mid", { distance: 25, elevationDeg: 8 })'],
    ['level-low-25m', 'window.__camphor.viewLevel("low", { distance: 25, elevationDeg: 8 })'],
    ['level-low-50m', 'window.__camphor.viewLevel("low", { distance: 50, elevationDeg: 8 })'],
  ]) {
    await evalJs(fn);
    await sleep(500);
    await screenshot(`screenshots/t011-0112/lod-${name}.png`);
  }
  log.levelsStats = await evalJs('window.__camphor.stats()');
  await evalJs('window.__camphor.unmount()');

  log.consoleErrors = await evalJs('window.__t0112restore()');
  return log;
};
