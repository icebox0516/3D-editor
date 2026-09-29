// T012.2 水杉视觉取证主批次（D30 增量口径——三必做 + 疑点触发；console 全程收集）
// 疑点来源：任务书 Unknown（羽卡中距可辨性/密冠透天/雄序枯穗近景）+ 3c 一帧信号（冠密度偏低）
// 机位集：baseline(M25 冻结——全族同参数) / N12 / F50 / B25 逆光 / C8 密冠 / 羽卡近景 3m /
//        树皮 2.6m / 干特写 1.4m / 上冠仰视 8m（球果+枯穗）/ 8 槽全景 55m / LOD 35m 三档 + Low 50m /
//        双卡产品路径 place autumn 25m / canopy 400m / 风动 run·frozen 双帧对（M25 冠部 + 近景颤）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5181');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0122log = [];
      const push = (kind) => (...args) => window.__t0122log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0122restore = () => { console.error = origError; console.warn = origWarn; return window.__t0122log; };
    })()
  `, { awaitPromise: false });

  // ── 单树锚点（slot-0）冻结帧：baseline 必做 + 身份判定支撑机位 ──
  await evalJs('window.__metasequoia.mount()');
  await evalJs('window.__metasequoia.freezeTime()');
  for (const [name, view] of [
    ['baseline', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],
    ['vis-near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],
    ['vis-far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],
    ['vis-backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }],
    ['crown-8m', { distance: 8, azimuthDeg: 35, elevationDeg: 12 }],
    ['feather-closeup-3m', { distance: 3, azimuthDeg: 35, elevationDeg: 10 }],
    ['bark-2p6m', { distance: 2.6, azimuthDeg: 35, elevationDeg: -15 }],
    ['bark-trunk-1p4m', { distance: 1.4, azimuthDeg: 35, elevationDeg: -5 }],
    ['cone-strobilus-8m-el24', { distance: 8, azimuthDeg: 35, elevationDeg: 24 }],
  ]) {
    await evalJs(`window.__metasequoia.view(${JSON.stringify(view)})`);
    await sleep(250);
    await screenshot(`${name}.png`);
  }

  // ── 8 槽全景（横向变体 sanity）──
  await evalJs('window.__metasequoia.unmount()');
  await evalJs('window.__metasequoia.mountSlots()');
  await evalJs('window.__metasequoia.viewSlots()');
  await sleep(350);
  await screenshot('slots-panorama-55m.png');

  // ── LOD 三档（档间连续 + 密度疑点：High/Mid vs Low 对比）──
  await evalJs('window.__metasequoia.unmount()');
  await evalJs('window.__metasequoia.mountLevels()');
  await evalJs('window.__metasequoia.viewLevels()');
  await sleep(350);
  await screenshot('lod-levels-35m.png');
  await evalJs('window.__metasequoia.view({ distance: 50, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(250);
  await screenshot('lod-level-low-50m.png');
  await evalJs('window.__metasequoia.unmount()');

  // ── 双卡产品路径（place preset autumn——T024 链）+ canopy 400m ──
  await evalJs(`window.__tree3aPerf.place({ count: 1, assetId: 'asset_tree_metasequoia', preset: 'autumn' })`);
  await sleep(400);
  await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(300);
  await screenshot('autumn-25m.png');
  await evalJs(`window.__tree3aPerf.view({ distance: 400, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(400);
  await screenshot('canopy-400m.png');

  // ── 风动三证据（产品路径之外回到 Stage 冻结对照组）──
  await evalJs('window.__metasequoia.mount()');
  await evalJs('window.__metasequoia.unfreezeTime()');
  await evalJs('window.__metasequoia.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1200);
  await screenshot('wind-run-frame-a.png');
  await sleep(400);
  await screenshot('wind-run-frame-b.png');
  await evalJs('window.__metasequoia.view({ distance: 6, azimuthDeg: 35, elevationDeg: 10 })');
  await sleep(600);
  await screenshot('wind-flutter-c6-a.png');
  await sleep(250);
  await screenshot('wind-flutter-c6-b.png');
  await evalJs('window.__metasequoia.freezeTime()');
  await sleep(900);
  await screenshot('wind-frozen-frame-a.png');
  await sleep(500);
  await screenshot('wind-frozen-frame-b.png');
  await evalJs('window.__metasequoia.unmount()');

  const log = await evalJs('window.__t0122restore()');
  return { consoleNoise: log };
};
