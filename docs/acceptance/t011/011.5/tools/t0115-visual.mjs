// T011.5 悬铃木视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集）——机位口径 = shadow-visual-sop §3，工具沿 011.4 t0114-visual.mjs（__ginkgo→__platanus，
// 悬铃木 12m 纚上层大乔：视心 7.5 族内最高；掌状裂近景 + 大叶疏簇冠读向为点名疑点）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L35 / macro×2
//        + 风动双帧（M25 冠部质心漂移 + C7 大叶快颤近景——8–14 rad/s 六树最低 × ≤15mm 六树最大口径）
//        + 8 槽 P42/P50（12m 级族内体量对比读向记档——供 011.13 混植）+ LOD 32m 三档全景 + 逐档 25m + Low 50m
//        （mountLevels；果序 Low 省略档间连续性读向点名疑点）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 收集（SOP §2 纪律：零错误零警告——第一轮）
  await evalJs(`
    (function () {
      window.__t0115log = [];
      const push = (kind) => (...args) => window.__t0115log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0115restore = () => { console.error = origError; console.warn = origWarn; return window.__t0115log; };
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__platanus.mount()');
  await evalJs('window.__platanus.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）+ 满干拼贴 M25 主干 + 12m 构图完整性
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/大叶疏簇挂点/骨架广角/果球冠底缘
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 阔卵-圆头开张剪影（冠幅比 0.6–0.75 中偏窄大冠）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 冠面空隙 20–30% + 大叶粗质读向（vs 前例细密冠）
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 末枝簇状团块/外密内疏/果球叶幕下
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L35 掌状 5 裂身份（裂深约半/中央裂片阔三角渐尖/疏粗齿）
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（裂片读出近拍 a）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b）
  ]) {
    await evalJs(`window.__platanus.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.5/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__platanus.stats()');

  // ── 风动双帧（疑点触发：大叶快颤 8–14 rad/s 六树最低 × 幅度 ≤15mm 六树最大）──
  await evalJs('window.__platanus.unfreezeTime()');
  await evalJs('window.__platanus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.5/wind-run-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.5/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——大叶快颤摆幅像素读向）
  await evalJs('window.__platanus.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.5/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('docs/acceptance/t011/011.5/wind-flutter-c7-b.png');
  await evalJs('window.__platanus.freezeTime()');
  await evalJs('window.__platanus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.5/wind-frozen-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.5/wind-frozen-frame-b.png');
  await evalJs('window.__platanus.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——12m 级族内体量对比读向记档 + 8 槽同种语言一致性）──
  await evalJs('window.__platanus.mountSlots()');
  await evalJs('window.__platanus.freezeTime()');
  await evalJs('window.__platanus.viewSlots()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.5/slots-panorama-42m.png');
  await evalJs('window.__platanus.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.5/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__platanus.stats()');
  await evalJs('window.__platanus.unmount()');

  // ── LOD 档间连续（疑点触发：mountLevels 三档——轮廓连续 + 果序 Low 省略档间连续性读向）──
  await evalJs('window.__platanus.mountLevels({ slot: 0 })');
  await evalJs('window.__platanus.freezeTime()');
  await evalJs('window.__platanus.viewLevels()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.5/lod-levels-32m.png');
  // 011.3 教训：viewLevel 自带绕该档树位机位——不叠加 view()（首轮 API 误用致同帧）
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__platanus.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.5/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__platanus.stats()');
  await evalJs('window.__platanus.unmount()');

  // console 回读（零错误零警告——第一轮）
  log.console = await evalJs('window.__t0115restore()');

  return log;
};
