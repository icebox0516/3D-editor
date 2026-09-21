// T011.9 国槐视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集含转台段）——工具沿 011.8 t0118-visual.mjs（__bischofia→__sophora，
// 视心 5.9 ≈10.34m 级；本批疑点前置于脚本：①羽状复叶近读专项〔小叶沿轴对生+顶生小叶——
// 与 011.8 三出专项反向判别：无三小叶同点放射品字单位〕②念珠荚果串可见性〔裁决 4 做〕
// ③冠层覆盖密度〔Stage 代理 M25 观察项：正面覆盖 ~10–20%——vs Spec「冠大荫浓」读向裁定〕
// ④当年生枝绿色+皮孔 ⑤树皮第 10 语言双机位（板状厚脊+瘤突+交叉网状）⑥风动三证据）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L3.5 / macro×2 / 树皮双机位
//        + 冠缘细枝（el30 仰拍）+ 荚果串专项 × 2
//        + 风动双帧（M25 冠部质心漂移 + C7 叶颤近景）
//        + 8 槽 P42/P50 + LOD 32m 三档全景 + 逐档 25m + Low 50m
//        + 转台遍历段（console 零错误零警告——X4000 预期口径 = FXC 误报接受记档一次即止）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0119log = [];
      const push = (kind) => (...args) => window.__t0119log.push(kind + ':' + args.map(String).join(' '));
      window.__t0119origError = console.error; window.__t0119origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__sophora.mount()');
  await evalJs('window.__sophora.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）+ 中距身份（开展宽圆头+一回羽叶细碎面+念珠果+灰褐厚脊干）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/低位放射 scaffold/视觉冠底
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 开展宽圆头远距剪影（冠幅比 0.9–1.2——族内最开展档）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 冠面通透 vs 缺叶（疑点③密度裁定帧 a：背光透射 + 覆盖读向）
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 冠面细碎质感近读（细质均质 vs 粗质）
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L3.5 羽状复叶身份专项疑点①（小叶沿轴对生排列+顶生小叶；无三小叶同点放射品字单位）
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（复叶全结构 a：小叶对+裸轴基段+全缘）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b：两面色差/小叶对生读向）
    ['crown-edge-5m-el30', { distance: 5, azimuthDeg: 35, elevationDeg: 30 }],// 冠缘细枝（疑点④：当年生枝绿色+皮孔近读 + 冠缘念珠串垂挂）
    ['pods-4m-el15', { distance: 4, azimuthDeg: 95, elevationDeg: 15 }],     // 荚果串专项 a（疑点②：念珠串下垂+珠节+绿黄色序——冠外带换方位）
    ['pods-6m-el8', { distance: 6, azimuthDeg: 305, elevationDeg: 8 }],      // 荚果串专项 b（中距可辨性——果/叶比读向）
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: 4 }], // 树皮第 10 语言机位 a（灰褐深纵裂板状厚脊+沟深——干中段）
    ['bark-trunk-1p2m-az35', { distance: 1.2, azimuthDeg: 125, elevationDeg: 10 }],// 机位 b（老干交叉网状+瘤突+干基暗化——双机位一致判读）
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 2 }],  // 干整体（低位放射大枝低角 + 厚脊纵裂读向）
  ]) {
    await evalJs(`window.__sophora.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.9/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__sophora.stats()');

  // ── 风动双帧（三证据：run diff / 近景颤动 / frozen 零差）──
  await evalJs('window.__sophora.unfreezeTime()');
  await evalJs('window.__sophora.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.9/wind-run-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.9/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——整树缓摆 + aBend 快颤两层）
  await evalJs('window.__sophora.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.9/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('docs/acceptance/t011/011.9/wind-flutter-c7-b.png');
  await evalJs('window.__sophora.freezeTime()');
  await evalJs('window.__sophora.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.9/wind-frozen-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.9/wind-frozen-frame-b.png');
  await evalJs('window.__sophora.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——8 槽同种语言一致性 + 开展宽冠等幅读向）──
  await evalJs('window.__sophora.mountSlots()');
  await evalJs('window.__sophora.freezeTime()');
  await evalJs('window.__sophora.viewSlots()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.9/slots-panorama-42m.png');
  await evalJs('window.__sophora.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.9/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__sophora.stats()');
  await evalJs('window.__sophora.unmount()');

  // ── LOD 档间连续（mountLevels 三档——轮廓连续 + Mid⊂High 大结构 + Low 细碎卡 + 荚果 Low 省略档间无断崖）──
  await evalJs('window.__sophora.mountLevels({ slot: 0 })');
  await evalJs('window.__sophora.freezeTime()');
  await evalJs('window.__sophora.viewLevels()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.9/lod-levels-32m.png');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__sophora.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.9/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__sophora.stats()');
  await evalJs('window.__sophora.unmount()');

  // ── 转台遍历段（console 全程口径：挂载+转台+档位遍历收集；X4000 预期 = FXC 误报接受记档）──
  await evalJs('window.__sophora.mount()');
  await evalJs('window.__sophora.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__sophora.turntable(0)');
  await evalJs('window.__sophora.dispose()');

  log.console = await evalJs('(function(){ console.error = window.__t0119origError; console.warn = window.__t0119origWarn; return window.__t0119log })()');
  return log;
};
