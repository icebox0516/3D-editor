// T011.7 乌桕视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集含转台段）——工具沿 011.6 t0116-visual.mjs（__koelreuteria→__triadica，
// 视心 5.8 ≈9.5m 级；菱形叶中距质感 + 果序绿闭果可见性为点名疑点）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L3.5 / macro×2
//        + 风动双帧（M25 冠部质心漂移 + C7 叶颤近景——整树缓摆 + aBend 快颤两层口径）
//        + 8 槽 P42/P50 + LOD 32m 三档全景 + 逐档 25m + Low 50m
//        + 转台遍历段（console 零错误零警告——疑点⑥全程口径；X4000 预期口径 = FXC 误报接受记档）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0117log = [];
      const push = (kind) => (...args) => window.__t0117log.push(kind + ':' + args.map(String).join(' '));
      window.__t0117origError = console.error; window.__t0117origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__triadica.mount()');
  await evalJs('window.__triadica.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）+ 中距身份（开展圆头+菱形中卡+绿果点缀+暗灰纵裂干）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/互生散布挂点/骨架/视觉冠底构图
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 开展圆头远距剪影（冠幅比 0.8–1.0）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 冠面空隙 40–55% 通透 vs 缺叶 + 中细质轻盈冠面
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 冠面细碎质感/绿闭果近读（疑点②）
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L3.5 菱形叶身份（菱状卵形/全缘/骤尖尾头/近等宽/腺体尝试）
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（叶形+叶基腺点近拍 a）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b）
  ]) {
    await evalJs(`window.__triadica.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.7/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__triadica.stats()');

  // ── 风动双帧（疑点⑤三证据：run diff / 高层位移 / frozen 零差）──
  await evalJs('window.__triadica.unfreezeTime()');
  await evalJs('window.__triadica.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.7/wind-run-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.7/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——整树缓摆 + aBend 快颤两层）
  await evalJs('window.__triadica.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.7/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('docs/acceptance/t011/011.7/wind-flutter-c7-b.png');
  await evalJs('window.__triadica.freezeTime()');
  await evalJs('window.__triadica.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.7/wind-frozen-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.7/wind-frozen-frame-b.png');
  await evalJs('window.__triadica.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——8 槽同种语言一致性 + 开展等幅冠读向）──
  await evalJs('window.__triadica.mountSlots()');
  await evalJs('window.__triadica.freezeTime()');
  await evalJs('window.__triadica.viewSlots()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.7/slots-panorama-42m.png');
  await evalJs('window.__triadica.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.7/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__triadica.stats()');
  await evalJs('window.__triadica.unmount()');

  // ── LOD 档间连续（疑点⑦：mountLevels 三档——轮廓连续 + 中卡 Mid⊂High + 果序 Low 省略）──
  await evalJs('window.__triadica.mountLevels({ slot: 0 })');
  await evalJs('window.__triadica.freezeTime()');
  await evalJs('window.__triadica.viewLevels()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.7/lod-levels-32m.png');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__triadica.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.7/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__triadica.stats()');
  await evalJs('window.__triadica.unmount()');

  // ── 转台遍历段（疑点⑥全程口径：挂载+转台+档位遍历 console 收集）──
  await evalJs('window.__triadica.mount()');
  await evalJs('window.__triadica.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__triadica.turntable(0)');
  await evalJs('window.__triadica.dispose()');

  log.console = await evalJs('(function(){ console.error = window.__t0117origError; console.warn = window.__t0117origWarn; return window.__t0117log })()');
  return log;
};
