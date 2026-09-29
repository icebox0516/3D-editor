// T012.1 雪松视觉取证主批次（新 Family 首例完整首例验收——D30/D43 + D37；console 全程收集）
// 工具沿 011.4 t0114-visual.mjs（__ginkgo→__cedrus）+ 本任务触发点：
//   层状轮生枝姿（身份核心）/ 顶梢点头 / 球果如烛近景 / 层隙天光（B25 逆光）/ 针卡远距闪烁观察（F50/Low）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L35 / macro×2 / T26×2 / T12 干特写
//        + cone-leader 顶部机位（球果带 + 顶梢点头——3a 触发点）
//        + 风动双帧（M25 冠部 + C7 针簇颤近景）+ 8 槽全景（P55 + P50 宽幅）+ LOD 41m 三档全景 + 逐档 25m + Low 50m
//        + canopy 远景（产品路径 place → 拉远 400m——canopy 表示帧）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 收集（SOP §2 纪律：零错误零警告）
  await evalJs(`
    (function () {
      window.__t0121log = [];
      const push = (kind) => (...args) => window.__t0121log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0121restore = () => { console.error = origError; console.warn = origWarn; return window.__t0121log; };
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__cedrus.mount()');
  await evalJs('window.__cedrus.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 层状轮生枝姿/层板/垂帘缘（身份核心）
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 尖塔剪影 + 针卡远距闪烁观察（3a 触发点）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 逆光：针簇通透/层隙天光带（3a 触发点）
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 莲座簇结构/层板填充
    ['needle-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L35 针簇身份：灰绿蓝粉调/放射莲座
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（针簇/受光色差近拍 a）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b——阳银荫深读向）
    ['bark-2p6m-az35', { distance: 2.6, azimuthDeg: 35, elevationDeg: -15 }],  // T26 a 鳞状块片
    ['bark-2p6m-az110', { distance: 2.6, azimuthDeg: 110, elevationDeg: -15 }],// T26 b 双方位浮雕读
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: -5 }], // T12 干特写（块片沟浅-中近黑/块顶浅灰褐）
    ['cone-leader-10m-el28', { distance: 10, azimuthDeg: 35, elevationDeg: 28 }], // 上半冠仰视：球果如烛带 + 顶梢点头（3a 触发点）
  ]) {
    await evalJs(`window.__cedrus.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t012-0121/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__cedrus.stats()');

  // ── 风动三证据（判定 7：整层慢摆 + 垂帘/针簇颤 + 顶梢摆三成分）──
  await evalJs('window.__cedrus.unfreezeTime()');
  await evalJs('window.__cedrus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t012-0121/wind-run-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t012-0121/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——针簇高频颤 + 层缘垂帘摆幅像素读向）
  await evalJs('window.__cedrus.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(400);
  await screenshot('screenshots/t012-0121/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('screenshots/t012-0121/wind-flutter-c7-b.png');
  await evalJs('window.__cedrus.freezeTime()');
  await evalJs('window.__cedrus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t012-0121/wind-frozen-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t012-0121/wind-frozen-frame-b.png');
  await evalJs('window.__cedrus.unmount()');

  // ── 8 槽全景（P55 + P50 宽幅双距——年龄轴/疏密轴/偏冠横向读向）──
  await evalJs('window.__cedrus.mountSlots()');
  await evalJs('window.__cedrus.freezeTime()');
  await evalJs('window.__cedrus.viewSlots()');
  await sleep(700);
  await screenshot('screenshots/t012-0121/slots-panorama-55m.png');
  await evalJs('window.__cedrus.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(700);
  await screenshot('screenshots/t012-0121/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__cedrus.stats()');
  await evalJs('window.__cedrus.unmount()');

  // ── LOD 档间连续（mountLevels 三档——档间轮廓体量连续性 + Low 针卡闪烁观察）──
  await evalJs('window.__cedrus.mountLevels({ slot: 0 })');
  await evalJs('window.__cedrus.freezeTime()');
  await evalJs('window.__cedrus.viewLevels()');
  await sleep(700);
  await screenshot('screenshots/t012-0121/lod-levels-41m.png');
  // 011.3 教训：viewLevel 自带绕该档树位机位——不叠加 view()
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__cedrus.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(500);
    await screenshot(`screenshots/t012-0121/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__cedrus.stats()');
  await evalJs('window.__cedrus.unmount()');

  // ── canopy 远景（产品路径 place → 拉远 400m——canopy 表示帧，3c 通道复证）──
  await evalJs(`window.__tree3aPerf.place({ assetId: 'asset_tree_cedrus', count: 1 })`);
  await sleep(600);
  await evalJs(`window.__tree3aPerf.view({ distance: 400, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(700);
  await screenshot('screenshots/t012-0121/canopy-400m.png');
  log.canopyDistribution = await evalJs('window.__tree3aPerf.distribution ? window.__tree3aPerf.distribution() : "no-distribution-api"');
  await evalJs(`window.__tree3aPerf.clear ? window.__tree3aPerf.clear() : null`);
  await sleep(300);

  // console 回读（零错误零警告）
  log.console = await evalJs('window.__t0121restore()');

  return log;
};
