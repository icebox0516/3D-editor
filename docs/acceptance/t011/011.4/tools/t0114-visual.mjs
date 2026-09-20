// T011.4 银杏视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集）——机位口径 = shadow-visual-sop §3，工具沿 011.3 t0113-visual.mjs（__zelkova→__ginkgo）
// 机位集：baseline.png(M25 冻结) / N12 / F50（冠形剪影疑点）/ B25 / C7 / L35 / macro×2 / T26×2
//        + 风动双帧（M25 冠部质心漂移 + C7 长柄扇叶颤近景——五树最大 ≤13mm 口径）
//        + 8 槽 P42/P50（偏冠稀释缺口复核）+ LOD 29m 三档全景 + 逐档 25m + Low 50m（mountLevels）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 收集（SOP §2 纪律：零错误零警告）
  await evalJs(`
    (function () {
      window.__t0114log = [];
      const push = (kind) => (...args) => window.__t0114log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0114restore = () => { console.error = origError; console.warn = origWarn; return window.__t0114log; };
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__ginkgo.mount()');
  await evalJs('window.__ginkgo.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/长短枝挂点/冠面粒状
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 圆锥-广卵剪影（疑点：冠最宽环位置）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 细质密叶/透光/淡绿色块
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 莲座簇结构/钉状凸起
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L35 扇形叶身份
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（缺刻/二叉脉近拍 a）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b）
    ['bark-2p6m-az35', { distance: 2.6, azimuthDeg: 35, elevationDeg: -15 }],  // T26 a 纵裂脊沟
    ['bark-2p6m-az110', { distance: 2.6, azimuthDeg: 110, elevationDeg: -15 }],// T26 b 双方位浮雕读
  ]) {
    await evalJs(`window.__ginkgo.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0114/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__ginkgo.stats()');

  // ── 风动双帧（疑点触发：长柄扇叶颤——幅度 ≤13mm 五树最大 / 频率 1.6–2.7Hz 偏低）──
  await evalJs('window.__ginkgo.unfreezeTime()');
  await evalJs('window.__ginkgo.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t011-0114/wind-run-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0114/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——扇叶摆幅像素读向）
  await evalJs('window.__ginkgo.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(400);
  await screenshot('screenshots/t011-0114/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('screenshots/t011-0114/wind-flutter-c7-b.png');
  await evalJs('window.__ginkgo.freezeTime()');
  await evalJs('window.__ginkgo.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(300);
  await screenshot('screenshots/t011-0114/wind-frozen-frame-a.png');
  await sleep(400);
  await screenshot('screenshots/t011-0114/wind-frozen-frame-b.png');
  await evalJs('window.__ginkgo.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——excurrent 偏冠稀释缺口复核：slot-3 偏冠读向）──
  await evalJs('window.__ginkgo.mountSlots()');
  await evalJs('window.__ginkgo.freezeTime()');
  await evalJs('window.__ginkgo.viewSlots()');
  await sleep(700);
  await screenshot('screenshots/t011-0114/slots-panorama-42m.png');
  await evalJs('window.__ginkgo.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(700);
  await screenshot('screenshots/t011-0114/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__ginkgo.stats()');
  await evalJs('window.__ginkgo.unmount()');

  // ── LOD 档间连续（疑点触发：mountLevels 三档——档间轮廓体量连续性）──
  await evalJs('window.__ginkgo.mountLevels({ slot: 0 })');
  await evalJs('window.__ginkgo.freezeTime()');
  await evalJs('window.__ginkgo.viewLevels()');
  await sleep(700);
  await screenshot('screenshots/t011-0114/lod-levels-29m.png');
  // 011.3 教训：viewLevel 自带绕该档树位机位——不叠加 view()（首轮 API 误用致同帧）
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__ginkgo.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(500);
    await screenshot(`screenshots/t011-0114/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__ginkgo.stats()');
  await evalJs('window.__ginkgo.unmount()');

  // console 回读（零错误零警告）
  log.console = await evalJs('window.__t0114restore()');

  return log;
};
