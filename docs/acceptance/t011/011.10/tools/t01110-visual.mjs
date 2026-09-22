// T011.10 白蜡树视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集含转台段）——工具沿 011.9 t0119-visual.mjs（__sophora→__fraxinus，
// 视心 6.3 ≈10.50m 级中位分歧冠底上抬；本批疑点前置于脚本：
// ①羽状复叶对生专项〔小叶沿轴**严格对生**成对 + 顶生小叶 + 5–7 枚计数少而整齐 + 卵状披针
//   **锐锯齿**齿缘 + 裸柄段更长——vs 国槐 9–15 枚近对生全缘：同型不同数值对照轴〕
// ②翅果帘幕可见性〔裁决 4 做：匙形桨状果下垂密簇+黄绿-淡褐色序+**满冠帘幕**（vs 国槐冠缘
//   散点念珠——密度显著更高，裁决 5）〕
// ③冠层中通透〔Stage 观察项：M25 绿带 151px vs 国槐 243px——空隙 25–40% vs 国槐 10–20%
//   族门对照第二对样本读向裁定〕
// ④对生挂点近读（decussate 对生簇 vs 国槐互生螺旋横向对照）⑤当年生枝黄褐+皮孔小不明显
// ⑥树皮第 11 语言双机位（灰褐浅-中纵裂+幼干近光滑+皮孔小不明显）
// ⑦冠底裸干带读向（视觉冠底比 0.207 中位分歧 vs 国槐低位放射）并入 N12
// ⑧风动三证据 ⑨console（X4000 复叶系第四数据点）⑩LOD 档间/8 槽）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L3.5 / macro×2 / 树皮双机位
//        + 冠缘细枝（el30 仰拍）+ 翅果专项 × 2
//        + 风动双帧（M25 冠部质心漂移 + C7 叶颤近景）
//        + 8 槽 P42/P50 + LOD 32m 三档全景 + 逐档 25m + Low 50m
//        + 转台遍历段（console 零错误零警告——X4000 预期口径 = FXC 误报接受记档一次即止）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t01110log = [];
      const push = (kind) => (...args) => window.__t01110log.push(kind + ':' + args.map(String).join(' '));
      window.__t01110origError = console.error; window.__t01110origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__fraxinus.mount()');
  await evalJs('window.__fraxinus.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],        // M25 统一基线帧（D30 三必做之二——全族同参数）+ 中距身份（卵圆-圆头开展冠+一回羽叶细碎面+翅果帘幕+灰褐浅纵裂干）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],     // N12 结构/中位分歧 scaffold/视觉冠底裸干带（疑点⑦——冠底比 0.207 vs 国槐低位放射）
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],      // F50 卵圆-圆头开展冠远距剪影（冠幅比 0.7–1.0——冠幅≈高或略窄档）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 冠面中通透 vs 缺叶（疑点③裁定帧：背光透射 + 25–40% 空隙读向 + 透空见地）
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],         // C7 冠面细碎质感近读（细质均质 + 复叶结构感）
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10 }],// L3.5 羽状复叶对生专项疑点①（小叶沿轴成对对生+顶生单独小叶+5–7 枚+锐锯齿齿缘——vs 国槐 9–15 近对生全缘）
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],  // 宏观平视（复叶全结构 a：小叶对+更长裸轴基段+锯齿齿缘）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],// 宏观俯视（b：两面色差弱档+小叶对生读向）
    ['crown-edge-5m-el30', { distance: 5, azimuthDeg: 35, elevationDeg: 30 }],// 冠缘细枝（疑点④对生挂点 decussate 近读 + 疑点⑤当年生枝黄褐+皮孔 + 翅果簇垂挂）
    ['samaras-4m-el15', { distance: 4, azimuthDeg: 95, elevationDeg: 15 }],  // 翅果专项 a（疑点②：匙形桨状果+下垂密簇+黄绿-淡褐色序——冠外带换方位）
    ['samaras-6m-el8', { distance: 6, azimuthDeg: 305, elevationDeg: 8 }],   // 翅果专项 b（中距帘幕可辨性——满冠分布 vs 国槐冠缘散点密度对照）
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: 4 }], // 树皮第 11 语言机位 a（灰褐浅-中纵裂细脊沟+幼干近光滑——干中段）
    ['bark-trunk-1p2m-az35', { distance: 1.2, azimuthDeg: 125, elevationDeg: 10 }],// 机位 b（皮孔小不明显+浅细脊沟双机位一致判读）
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 2 }],  // 干整体（中位分歧大枝开展外斜+浅纵裂读向）
  ]) {
    await evalJs(`window.__fraxinus.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.10/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__fraxinus.stats()');

  // ── 风动双帧（三证据：run diff / 近景颤动 / frozen 零差）──
  await evalJs('window.__fraxinus.unfreezeTime()');
  await evalJs('window.__fraxinus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.10/wind-run-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.10/wind-run-frame-b.png');
  // C7 近景颤动读向（run 态近拍双帧——整树缓摆 + aBend 快颤两层）
  await evalJs('window.__fraxinus.view({ distance: 7, azimuthDeg: 35, elevationDeg: 12 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.10/wind-flutter-c7-a.png');
  await sleep(250);
  await screenshot('docs/acceptance/t011/011.10/wind-flutter-c7-b.png');
  await evalJs('window.__fraxinus.freezeTime()');
  await evalJs('window.__fraxinus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.10/wind-frozen-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.10/wind-frozen-frame-b.png');
  await evalJs('window.__fraxinus.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——8 槽同种语言一致性 + 卵圆开展等幅读向）──
  await evalJs('window.__fraxinus.mountSlots()');
  await evalJs('window.__fraxinus.freezeTime()');
  await evalJs('window.__fraxinus.viewSlots()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.10/slots-panorama-42m.png');
  await evalJs('window.__fraxinus.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.10/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__fraxinus.stats()');
  await evalJs('window.__fraxinus.unmount()');

  // ── LOD 档间连续（mountLevels 三档——轮廓连续 + Mid⊂High 大结构 + Low 细碎卡 + 翅果 Low 省略档间无断崖）──
  await evalJs('window.__fraxinus.mountLevels({ slot: 0 })');
  await evalJs('window.__fraxinus.freezeTime()');
  await evalJs('window.__fraxinus.viewLevels()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.10/lod-levels-32m.png');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__fraxinus.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.10/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__fraxinus.stats()');
  await evalJs('window.__fraxinus.unmount()');

  // ── 转台遍历段（console 全程口径：挂载+转台+档位遍历收集；X4000 预期 = FXC 误报接受记档）──
  await evalJs('window.__fraxinus.mount()');
  await evalJs('window.__fraxinus.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__fraxinus.turntable(0)');
  await evalJs('window.__fraxinus.dispose()');

  log.console = await evalJs('(function(){ console.error = window.__t01110origError; console.warn = window.__t01110origWarn; return window.__t01110log })()');
  return log;
};
