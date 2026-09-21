// T011.8 重阳木视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集含转台段）——工具沿 011.7 t0117-visual.mjs（__triadica→__bischofia，
// 视心 5.8 ≈9.9m 级；本批疑点前置于脚本：①三出 vs 羽状判别〔调研双问混读教训——三小叶放射
// 近读专项〕②细枝绿色+皮孔〔材质代理点名〕③老干交叉网状〔材质代理点名〕④树皮第 9 语言
// 双机位；无花果资产——无果序机位）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L3.5 / macro×2 / 树皮双机位
//        + 冠缘细枝（el30 仰拍）
//        + 风动双帧（M25 冠部质心漂移 + C7 叶颤近景——整树缓摆 + aBend 快颤两层口径）
//        + 8 槽 P42/P50 + LOD 32m 三档全景 + 逐档 25m + Low 50m
//        + 转台遍历段（console 零错误零警告——X4000 预期口径 = FXC 误报接受记档一次即止）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0118log = [];
      const push = (kind) => (...args) => window.__t0118log.push(kind + ':' + args.map(String).join(' '));
      window.__t0118origError = console.error; window.__t0118origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__bischofia.mount()');
  await evalJs('window.__bischofia.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）+ 中距身份（伞形开展圆头+三出复叶宽卵中卡+褐纵裂干）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/散布挂点/两段 scaffold（下带近水平-上带斜上）/视觉冠底构图
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 伞形-开展圆头远距剪影（冠幅比 0.8–1.0）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 冠面通透 vs 缺叶 + 中细质大叶层叠冠面
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 冠面中细质/复叶大叶层叠近读
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L3.5 三出复叶身份（三小叶放射/顶大侧小/侧叶近无柄）——三出 vs 羽状专项疑点①
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（复叶全结构近拍 a：三叶间隙透空+裸总柄）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b）
    ['crown-edge-5m-el30', { distance: 5, azimuthDeg: 35, elevationDeg: 30 }],// 冠缘细枝（疑点②：当年生枝绿色+皮孔灰白→锈色近读——细枝高位 4.4–7.8m 仰拍）
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: 4 }], // 树皮第 9 语言机位 a（褐纵裂深沟宽脊+扭转——干中段）
    ['bark-trunk-1p2m-az35', { distance: 1.2, azimuthDeg: 125, elevationDeg: 10 }],// 机位 b（老干交叉网状疑点③ + 干基暗化——双机位一致判读）
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 2 }],  // 干整体（纵裂读向 + 伞形大枝两段姿低角）
  ]) {
    await evalJs(`window.__bischofia.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.8/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__bischofia.stats()');

  // ── 风动双帧（三证据：run diff / 近景颤动 / frozen 零差）──
  await evalJs('window.__bischofia.unfreezeTime()');
  await evalJs('window.__bischofia.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.8/wind-run-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.8/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——整树缓摆 + aBend 快颤两层）
  await evalJs('window.__bischofia.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.8/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('docs/acceptance/t011/011.8/wind-flutter-c7-b.png');
  await evalJs('window.__bischofia.freezeTime()');
  await evalJs('window.__bischofia.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.8/wind-frozen-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.8/wind-frozen-frame-b.png');
  await evalJs('window.__bischofia.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——8 槽同种语言一致性 + 伞形开展等幅冠读向）──
  await evalJs('window.__bischofia.mountSlots()');
  await evalJs('window.__bischofia.freezeTime()');
  await evalJs('window.__bischofia.viewSlots()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.8/slots-panorama-42m.png');
  await evalJs('window.__bischofia.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.8/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__bischofia.stats()');
  await evalJs('window.__bischofia.unmount()');

  // ── LOD 档间连续（mountLevels 三档——轮廓连续 + 中卡 Mid⊂High + Low 宽卵壳卡）──
  await evalJs('window.__bischofia.mountLevels({ slot: 0 })');
  await evalJs('window.__bischofia.freezeTime()');
  await evalJs('window.__bischofia.viewLevels()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.8/lod-levels-32m.png');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__bischofia.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.8/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__bischofia.stats()');
  await evalJs('window.__bischofia.unmount()');

  // ── 转台遍历段（console 全程口径：挂载+转台+档位遍历收集；X4000 预期 = FXC 误报接受记档）──
  await evalJs('window.__bischofia.mount()');
  await evalJs('window.__bischofia.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__bischofia.turntable(0)');
  await evalJs('window.__bischofia.dispose()');

  log.console = await evalJs('(function(){ console.error = window.__t0118origError; console.warn = window.__t0118origWarn; return window.__t0118log })()');
  return log;
};
