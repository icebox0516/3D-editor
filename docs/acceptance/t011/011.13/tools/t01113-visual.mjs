// T011.13 族级验收门视觉取证批：①补拍 celtis/camphor/tree3a M25 统一基线帧（011.1/011.2
// 完整口径时代无 baseline.png；夏栎基线对照同法补拍——三帧入本任务目录不回填已收口子任务）
// ②混植场景（12 成员 + 夏栎 13 树同场网格挂载——检视口径）。
// 拼图（13 基线 contact sheet）由 t01113-montage.mjs 以 file:// HTML 单独出图。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  const log = {};

  // ── ① 补拍三帧 M25 基线（各自 Stage view() 缺省 = 25/35/8 + 自有视心——全族同参数口径）──
  for (const [name, handle] of [
    ['baseline-tree3a', 'window.__tree3a'],
    ['baseline-celtis', 'window.__celtis'],
    ['baseline-camphor', 'window.__camphor'],
  ]) {
    await evalJs(`${handle}.mount()`);
    await evalJs(`${handle}.freezeTime()`);
    await evalJs(`${handle}.view({})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.13/${name}.png`);
    log[name] = await evalJs(`${handle}.stats()`);
    await evalJs(`${handle}.unmount()`);
  }

  // ── ② 混植场景：13 树 5×3 网格（间距 12——防交叠判据带）同场 ──
  // 布局：夏栎居中 (0,0)；12 成员环绕（列 x=-24..24 步 12，行 z=-12/0/12）
  const layout = [
    ['window.__tree3a', 0, 0],
    ['window.__celtis', -24, -12], ['window.__camphor', -12, -12], ['window.__zelkova', 0, -12], ['window.__ginkgo', 12, -12],
    ['window.__platanus', -24, 0], ['window.__koelreuteria', -12, 0], ['window.__triadica', 12, 0], ['window.__bischofia', 24, 0],
    ['window.__sophora', -24, 12], ['window.__fraxinus', -12, 12], ['window.__ligustrum', 12, 12], ['window.__salix', 24, 12],
  ];
  for (const [handle, x, z] of layout) {
    await evalJs(`${handle}.mount({ x: ${x}, z: ${z} })`);
  }
  for (const [handle] of layout) {
    await evalJs(`${handle}.freezeTime()`);
  }
  // 相机：以居中夏栎为 target 的全景（树高 8–12m 级、网格 60×36m → 46m 距 16° 仰覆盖）
  await evalJs('window.__tree3a.view({ distance: 46, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(1500);
  await screenshot('docs/acceptance/t011/011.13/mixed-planting-46m.png');
  await evalJs('window.__tree3a.view({ distance: 90, azimuthDeg: 35, elevationDeg: 22 })');
  await sleep(1500);
  await screenshot('docs/acceptance/t011/011.13/mixed-planting-90m.png');
  log.mixed = layout.map(([h]) => h.replace('window.__', ''));

  // console 全程收集（挂载遍历含 13 树）
  log.consoleErrors = await evalJs(`(() => {
    const errs = [];
    const orig = console.error, origW = console.warn;
    console.error = (...a) => errs.push('error:' + a.map(String).join(' '));
    console.warn = (...a) => errs.push('warn:' + a.map(String).join(' '));
    window.__t01113mixedLog = errs;
    return 'collector-on';
  })()`);
  // 卸载全部
  for (const [handle] of layout) {
    await evalJs(`${handle}.unmount()`);
  }
  await sleep(600);
  log.consoleAfter = await evalJs('window.__t01113mixedLog');
  return log;
};
