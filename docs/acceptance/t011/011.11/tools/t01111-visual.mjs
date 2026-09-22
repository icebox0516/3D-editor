// T011.11 女贞视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集含转台段）——工具沿 011.10 t01110-visual.mjs（__fraxinus→__ligustrum，
// 视心 5.6 ≈8.41m 级常绿密冠中低分枝；本批疑点前置：
// ①对生单叶专项〔对生成对 + 顶芽单叶 + 全缘平坦 + 革质光亮卵形-椭圆——vs 香樟互生：家族首例
//   对生单叶挂点语言画面验证；与白蜡对生复叶共享「对生」位〕
// ②核果帘幕可见性〔裁决 1 做：肾形紫黑-蓝黑被白粉 + 下垂密簇 + 满冠分布（vs 白蜡翅果帘幕
//   同型密度档）——果期 7 月至翌年 5 月覆盖 9–10 月主语境〕
// ③常绿密冠读向〔Stage 观察项：空隙 5–15% 密档 vs 香樟 10–15% 横向对照——B25 背光裁定帧〕
// ④革质光泽读向〔裁决 3：front roughness 0.44 强光泽「单面镜」vs 香樟 0.50「亮面+粉背」〕
// ⑤当年生枝两档（黄褐-红调新梢 vs 灰褐老枝）⑥树皮第 12 语言双机位（灰褐细窄纵脊浅沟低浮雕）
// ⑦中低分枝裸干带（视觉冠底 ≈0.32 vs 白蜡 0.21 中位分歧）并入 N12
// ⑧风动三证据 ⑨console（X4000 单叶系预期不触发）⑩LOD 档间/8 槽）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L3.5 / macro×2 / 树皮双机位
//        + 冠缘细枝（el30 仰拍）+ 核果专项 × 2
//        + 风动双帧（M25 冠部质心漂移 + C7 叶颤近景）
//        + 8 槽 P42/P50 + LOD 32m 三档全景 + 逐档 25m + Low 50m
//        + 转台遍历段（console 零错误零警告——X4000 预期口径 = 单叶系不触发）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t01111log = [];
      const push = (kind) => (...args) => window.__t01111log.push(kind + ':' + args.map(String).join(' '));
      window.__t01111origError = console.error; window.__t01111origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__ligustrum.mount()');
  await evalJs('window.__ligustrum.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）+ 中距身份（卵圆-广卵常绿密冠+革质光泽深绿+紫黑果簇+灰褐细纹干）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/中低分枝 scaffold/视觉冠底裸干带（疑点⑦——冠底比 ≈0.32 vs 白蜡 0.21）+ 12m 果簇可辨性
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 卵圆-广卵满密深绿远距剪影（常绿色块 + 冠幅比 0.75–0.85 主档）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 常绿密冠通透裁定帧（疑点③：空隙 5–15% 密档 vs 香樟 10–15% 横向对照 + 背光透射 0.21）
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 冠面质感近读（大叶革质光亮 vs 白蜡细碎复叶——疑点④光泽读向 + 团块 1/6–1/4 冠宽）
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L3.5 对生单叶专项疑点①（对生成对+顶芽单叶+全缘平坦+革质光亮+卵形-椭圆——vs 香樟互生）
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（单叶全结构 a：卵形-椭圆全缘锐尖渐尖+近零侧脉+光泽镜面）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b：两面色差弱档淡绿级+革质光亮/背面无粉感）
    ['crown-edge-5m-el30', { distance: 5, azimuthDeg: 35, elevationDeg: 30 }],// 冠缘细枝（疑点①decussate 对生挂点近读 + 疑点⑤当年生枝两档 + 果簇垂挂）
    ['drupes-4m-el15', { distance: 4, azimuthDeg: 95, elevationDeg: 15 }],   // 核果专项 a（疑点②：紫黑-蓝黑被白粉+下垂密簇——冠外带换方位）
    ['drupes-6m-el8', { distance: 6, azimuthDeg: 305, elevationDeg: 8 }],    // 核果专项 b（中距满冠帘幕可辨性——满冠分布 vs 白蜡翅果同型对照）
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: 4 }], // 树皮第 12 语言机位 a（灰褐细窄纵脊浅沟低浮雕+细纹浅色质感——干中段）
    ['bark-trunk-1p2m-az125', { distance: 1.2, azimuthDeg: 125, elevationDeg: 10 }],// 机位 b（低浮雕双机位一致判读 + 小枝皮孔带）
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 2 }],  // 干整体（中低分枝 0.30 + 大枝中角开展 + 细纹读向）
  ]) {
    await evalJs(`window.__ligustrum.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.11/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__ligustrum.stats()');

  // ── 风动双帧（三证据：run diff / 近景颤动 / frozen 零差）──
  await evalJs('window.__ligustrum.unfreezeTime()');
  await evalJs('window.__ligustrum.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.11/wind-run-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——整树缓摆 + aBend 快颤两层）
  await evalJs('window.__ligustrum.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('docs/acceptance/t011/011.11/wind-flutter-c7-b.png');
  await evalJs('window.__ligustrum.freezeTime()');
  await evalJs('window.__ligustrum.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.11/wind-frozen-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/wind-frozen-frame-b.png');
  await evalJs('window.__ligustrum.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——8 槽同种语言一致性 + 卵圆-广卵等幅读向）──
  await evalJs('window.__ligustrum.mountSlots()');
  await evalJs('window.__ligustrum.freezeTime()');
  await evalJs('window.__ligustrum.viewSlots()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/slots-panorama-42m.png');
  await evalJs('window.__ligustrum.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__ligustrum.stats()');
  await evalJs('window.__ligustrum.unmount()');

  // ── LOD 档间连续（mountLevels 三档——轮廓连续 + Mid⊂High 大结构 + Low 壳卡 + 果簇 Low 省略档间无断崖）──
  await evalJs('window.__ligustrum.mountLevels({ slot: 0 })');
  await evalJs('window.__ligustrum.freezeTime()');
  await evalJs('window.__ligustrum.viewLevels()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/lod-levels-32m.png');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__ligustrum.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.11/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__ligustrum.stats()');
  await evalJs('window.__ligustrum.unmount()');

  // ── 转台遍历段（console 全程口径：挂载+转台+档位遍历收集；X4000 预期 = 单叶系不触发）──
  await evalJs('window.__ligustrum.mount()');
  await evalJs('window.__ligustrum.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__ligustrum.turntable(0)');
  await evalJs('window.__ligustrum.dispose()');

  log.console = await evalJs('(function(){ console.error = window.__t01111origError; console.warn = window.__t01111origWarn; return window.__t01111log })()');
  return log;
};
