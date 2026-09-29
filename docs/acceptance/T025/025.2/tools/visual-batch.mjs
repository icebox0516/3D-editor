// T025.2 视觉取证批：休憩四件 Contact Sheet + 逐资产近景帧 + 伞三卡帧。
// 机位：Contact Sheet 沿 024.3/025.1 统一基线帧口径（view 16m / 方位 35° / 仰角 12°）；
// 近景帧 = place 1 件 → view 设标准观察方向 → Home 全景键（camera.focusAll，产品键位
// ——批 A 同款，小件不触 near 裁剪）。
// 冻结：freezeTime(25)（T024.5 DEV 面）确定性相位；设施静态无风动，冻结为取证口径统一。
// 判据：逐件可辨 + console 全批零错误零警告（024.3 体例）。
// 近景帧同时承担 Step 2 材质复核四个观察项的像素判读面（O-1 桌面颗粒 / O-2 伞顶条纹 /
// O-3 花箱底沿共面 / O-4 配重盘金属度）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5200');
  await setViewport(1920, 1080);
  await sleep(3500); // 程序化缩略图离屏快照回填

  // console 收集（全批覆盖）
  await evalJs(`(() => {
    window.__t02502Console = [];
    const push = (level) => (...a) => window.__t02502Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  // 金丝雀：主 canvas 尺寸 ≈ 视口才可信（AGENTS 调试纪律）
  const canary = await evalJs(`(() => {
    const c = document.querySelector('canvas');
    return { cw: c.clientWidth, ch: c.clientHeight, iw: innerWidth, ih: innerHeight };
  })()`);

  const ASSETS = [
    'asset_planter', 'asset_leisure_table', 'asset_parasol', 'asset_bike_rack',
  ];
  const pressHome = () => evalJs(
    `document.querySelector('canvas').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))`,
  );

  // ── 1. Contact Sheet：四件同场景（assetIds round-robin ×4 = 每件 1 件，间距 4m）──
  const placedSheet = await evalJs(
    `window.__tree3aPerf.place({ assetIds: ${JSON.stringify(ASSETS)}, count: 4, spacing: 4, jitter: false, seedBase: 7 })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 12 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1600);
  const sheetStats = await evalJs(`window.__tree3aPerf.stats()`);
  await screenshot('docs/acceptance/T025/025.2/frames/contact-4.png');
  await evalJs('window.__tree3aPerf.clear()');

  // ── 2. 逐资产近景帧（Home 全景聚焦唯一对象）──
  const closeups = [];
  for (const id of ASSETS) {
    const ok = await evalJs(
      `window.__tree3aPerf.place({ assetId: '${id}', count: 1, seedBase: 1, spacing: 4, jitter: false })`,
    );
    await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 12 })`);
    await evalJs(`window.__tree3aPerf.freezeTime(25)`);
    await sleep(1000);
    await pressHome();
    await sleep(1000);
    const file = `docs/acceptance/T025/025.2/frames/close-${id}.png`;
    await screenshot(file);
    closeups.push({ id, ok, file });
  }

  // ── 3. 伞三卡帧：default（米白）/dark-green（墨绿）/wine-red（酒红）round-robin 各一枚 ──
  const placedTriple = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_parasol', count: 3, presets: ['default', 'dark-green', 'wine-red'], spacing: 2.0, jitter: false, seedBase: 3 })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 12 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(800);
  await pressHome();
  await sleep(1000);
  await screenshot('docs/acceptance/T025/025.2/frames/parasol-triple-preset.png');
  const tripleStats = await evalJs(`window.__tree3aPerf.stats()`);
  await evalJs('window.__tree3aPerf.clear()');

  const consoleLog = await evalJs('window.__t02502Console');
  return { canary, placedSheet, sheetStats, closeups, placedTriple, tripleStats, consoleLog };
};
