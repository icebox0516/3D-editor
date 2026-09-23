// T011.12 垂柳视觉取证主批次（D30 增量口径：baseline 必做 + 身份判定支撑机位 + 疑点触发项；
// console 全程收集含转台段）——工具沿 011.11 t01111-visual.mjs（__ligustrum→__salix，
// 视心 4.9 = 垂枝冠 bbox 中心〔垂枝冠心偏低——vs 女贞冠域中心法，Stage 定档记档〕；
// 本批疑点前置（任务书 Step 4 触发清单 + 3a/3b/3c 交付疑点）：
// ①垂枝垂帘姿态读出（身份核心：喷泉轮廓 + 骨架外展拱起 + 末级垂帘 + 簇沿切向——三距离链）
// ②狭披针细叶近读（长宽比 8–15 域 + 高频细齿近全缘观感 + 近零侧脉 + 叶背浅绿微银 + 黄绿调变奏）
// ③树皮第 13 语言（暗灰黑波状纵沟脊 + 沟深脊浅褐双色 + 修剪残桩〔3b 椭圆轴向翻转 Step 4 复核位〕）
// ④垂幕动态（风动三证据：整帘低频摆 + 垂索高频低幅颤 + frozen 全零）
// ⑤细叶远距读向（F50：细叶冠面纹理 vs 稀疏缺陷判读）
// ⑥console（X4000 单叶系预期不触发）⑦LOD 档间（Low 单竖卡垂帘窄剪影〔3a 分化〕+ Low maxY 微越 +0.24m 视觉档间连续性）
// 机位集：baseline.png(M25 冻结) / N12 / F50 / B25 / C7 / L3.5(targetY5.8 叶幕带) / macro×2 /
//         垂幕带 18m(targetY4.0) + 树皮双机位(targetY1.5 干段) + 干整体
//         + 风动双帧（M25 冠部漂移 + 5m 垂索颤动近景）
//         + 8 槽 P42/P50（spacing 12——3c 防交叠定档）+ LOD 32m 三档 + 逐档 25m + Low 50m
//         + 转台遍历段（console 零错误零警告）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t01112log = [];
      const push = (kind) => (...args) => window.__t01112log.push(kind + ':' + args.map(String).join(' '));
      window.__t01112origError = console.error; window.__t01112origWarn = console.warn;
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const log = {};

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__salix.mount()');
  await evalJs('window.__salix.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],          // M25 统一基线帧（D30 三必做之二——全族同参数）+ 中距身份（喷泉伞状垂帘+狭披针细叶+暗灰黑干）
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],      // N12 喷泉骨架/低叉干形/垂帘挂点结构（骨架外展-拱起 vs 末级近垂直分层）
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],       // F50 喷泉剪影 + 细叶远距读向（疑点⑤：细叶冠面纹理 vs 稀疏缺陷）
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],// B25 垂帘通透（间隙 0.1–0.25）+ 背光透射 0.44 家族上沿（细叶发光观感）
    ['crown-7m', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],          // C7 冠面质感（细叶密度/外密内疏/团块读向）
    ['leaf-closeup-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: 10, targetY: 5.8 }],  // L3.5 狭披针细叶专项疑点②（长宽比 8–15 + 细齿近全缘 + 近零侧脉——叶幕带 targetY 5.8）
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0, targetY: 5.8 }],     // 宏观平视（单叶全结构 a：狭披针全缘观感+长渐尖+叶沿索轴取向）
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20, targetY: 5.8 }],   // 宏观俯视（b：两面色差浅绿微银弱档+黄绿调变奏）
    ['curtain-band-18m', { distance: 18, azimuthDeg: 35, elevationDeg: 14, targetY: 4.0 }],   // 垂幕带（喷泉腰 ≈0.5h → 帘缘纵跨——垂幕段腰口径 0.33–0.40 判读）
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: 4, targetY: 1.5 }],    // 树皮第 13 语言机位 a（暗灰黑波状纵沟脊+沟深脊浅褐双色+残桩椭圆翻转复核——干段 target）
    ['bark-trunk-1p2m-az125', { distance: 1.2, azimuthDeg: 125, elevationDeg: 10, targetY: 1.5 }], // 机位 b（双色对比+浮雕双机位一致判读）
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 2 }],   // 干整体（低叉单干中间型 + 微倾 + 暗色干读向）
  ]) {
    await evalJs(`window.__salix.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.12/${name}.png`);
  }
  log.anchorStats = await evalJs('window.__salix.stats()');

  // ── 风动双帧（三证据：run diff / 垂索颤动近景 / frozen 零差——疑点④垂幕动态）──
  await evalJs('window.__salix.unfreezeTime()');
  await evalJs('window.__salix.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.12/wind-run-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.12/wind-run-frame-b.png');
  // 5m 垂索颤动近景（run 态近拍双帧——整帘低频摆 0.146Hz + 垂索高频颤 2.7–4.1Hz 两层）
  await evalJs('window.__salix.view({ distance: 5, azimuthDeg: 35, elevationDeg: 8, targetY: 5.8 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.12/wind-flutter-5m-a.png');
  await sleep(250);
  await screenshot('docs/acceptance/t011/011.12/wind-flutter-5m-b.png');
  await evalJs('window.__salix.freezeTime()');
  await evalJs('window.__salix.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('docs/acceptance/t011/011.12/wind-frozen-frame-a.png');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.12/wind-frozen-frame-b.png');
  await evalJs('window.__salix.unmount()');

  // ── 8 槽全景（P42 + P50 宽幅双距——8 槽同种语言一致性 + 垂幕长/垂坠度/冠幅比差异主轴读向；spacing 12 防交叠定档）──
  await evalJs('window.__salix.mountSlots()');
  await evalJs('window.__salix.freezeTime()');
  await evalJs('window.__salix.viewSlots()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.12/slots-panorama-42m.png');
  await evalJs('window.__salix.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.12/slots-panorama-50m-wide.png');
  log.slotsStats = await evalJs('window.__salix.stats()');
  await evalJs('window.__salix.unmount()');

  // ── LOD 档间连续（mountLevels 三档——轮廓连续 + Mid⊂High + Low 单竖卡垂帘窄剪影〔3a 分化〕+ Low maxY 微越 +0.24m 视觉连续性）──
  await evalJs('window.__salix.mountLevels({ slot: 0 })');
  await evalJs('window.__salix.freezeTime()');
  await evalJs('window.__salix.viewLevels()');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.12/lod-levels-32m.png');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__salix.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.12/${name}.png`);
  }
  log.levelsStats = await evalJs('window.__salix.stats()');
  await evalJs('window.__salix.unmount()');

  // ── 转台遍历段（console 全程口径：挂载+转台+档位遍历收集；X4000 预期 = 单叶系不触发）──
  await evalJs('window.__salix.mount()');
  await evalJs('window.__salix.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__salix.turntable(0)');
  await evalJs('window.__salix.dispose()');

  log.console = await evalJs('(function(){ console.error = window.__t01112origError; console.warn = window.__t01112origWarn; return window.__t01112log })()');
  return log;
};
