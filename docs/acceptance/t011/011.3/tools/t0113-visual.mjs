// T011.3 榉树视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集）——机位口径 = shadow-visual-sop §3，工具沿 011.2 t0112-visual.mjs（__camphor→__zelkova）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / L35 / macro×2 / T26×2 / B25 / C7
//        + 风动双帧（新短柄快颤参数疑点）+ 8 槽 P42/P50 + LOD 32m 三档 + Low 50m（Mid 含齿新降档语义）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 收集（SOP §2 纪律：零错误零警告）
  await evalJs(`
    (function () {
      window.__t0113log = [];
      const push = (kind) => (...args) => window.__t0113log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0113restore = () => { console.error = origError; console.warn = origWarn; return window.__t0113log; };
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__zelkova.mount()');
  await evalJs('window.__zelkova.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/材质/叶簇
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 vase 剪影
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 细质密叶/透光最强
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 叶簇结构/细密小卡
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L35 叶形身份
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（齿载波回归近拍 a）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b）
    ['bark-2p6m-az35', { distance: 2.6, azimuthDeg: 35, elevationDeg: -15 }],  // T26 a 剥落斑驳
    ['bark-2p6m-az110', { distance: 2.6, azimuthDeg: 110, elevationDeg: -15 }],// T26 b 双方位浮雕读
  ]) {
    await evalJs(`window.__zelkova.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0113/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__zelkova.stats()');

  // ── 风动双帧（疑点触发：榉树新参数——短柄硬叶快颤 16–25Hz/≤8mm vs 先例 2.2–3.7Hz）──
  await evalJs('window.__zelkova.unfreezeTime()');
  await evalJs('window.__zelkova.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t011-0113/wind-run-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0113/wind-run-frame-b.png');
  await evalJs('window.__zelkova.freezeTime()');
  await sleep(200);
  await screenshot('screenshots/t011-0113/wind-frozen-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0113/wind-frozen-frame-b.png');
  await evalJs('window.__zelkova.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——011.1 右缘裁切教训）──
  await evalJs('window.__zelkova.mountSlots()');
  await evalJs('window.__zelkova.freezeTime()');
  await evalJs('window.__zelkova.viewSlots()');
  await sleep(700);
  await screenshot('screenshots/t011-0113/slots-panorama-42m.png');
  await evalJs('window.__zelkova.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(700);
  await screenshot('screenshots/t011-0113/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__zelkova.stats()');
  await evalJs('window.__zelkova.unmount()');

  // ── LOD 档间连续（疑点触发：Mid 含齿 SDF 新降档语义——32m 三档全景 + Low 50m 远距）──
  await evalJs('window.__zelkova.mountLevels({ slot: 0 })');
  await evalJs('window.__zelkova.freezeTime()');
  await evalJs('window.__zelkova.viewLevels()');
  await sleep(700);
  await screenshot('screenshots/t011-0113/lod-levels-32m.png');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__zelkova.viewLevel('${level}')`);
    await evalJs(`window.__zelkova.view({ distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(500);
    await screenshot(`screenshots/t011-0113/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__zelkova.stats()');
  await evalJs('window.__zelkova.unmount()');

  // console 回读（零错误零警告）
  log.console = await evalJs('window.__t0113restore()');

  return log;
};
