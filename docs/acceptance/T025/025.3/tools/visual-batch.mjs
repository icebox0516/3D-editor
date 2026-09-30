// T025.3 视觉取证批：设备 P1 三件 Contact Sheet + 逐资产近景帧。
// 机位：Contact Sheet 沿 024.3/025.1/025.2 统一基线帧口径（view 16m / 方位 35° / 仰角 12°）；
// 近景帧 = place 1 件 → view 设标准观察方向 → Home 全景键（camera.focusAll，产品键位
// ——批 A/B 同款，小件不触 near 裁剪）。
// 冻结：freezeTime(25)（T024.5 DEV 面）确定性相位；设施静态无风动，冻结为取证口径统一。
// 判据：逐件可辨 + console 全批零错误零警告（024.3 体例）。
// 近景帧同时承担 Step 2 材质复核六个观察项的像素判读面（O-C1 法兰拉丝向 / O-C2 遮阳罩
// 橘皮密度 / O-C3 柜体拼合褪色梯度 / O-C4 握把颗粒 / O-C5 踢脚砂粒 / O-C6 井盖混合 uv 域
// ——井盖另见 manhole-reshoot.mjs 高仰角补图）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5201');
  await setViewport(1920, 1080);
  await sleep(3500); // 程序化缩略图离屏快照回填

  // console 收集（全批覆盖）
  await evalJs(`(() => {
    window.__t02503Console = [];
    const push = (level) => (...a) => window.__t02503Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  // 金丝雀：主 canvas 尺寸 ≈ 视口才可信（AGENTS 调试纪律）
  const canary = await evalJs(`(() => {
    const c = document.querySelector('canvas');
    return { cw: c.clientWidth, ch: c.clientHeight, iw: innerWidth, ih: innerHeight };
  })()`);

  const ASSETS = [
    'asset_cctv_camera', 'asset_ev_charger', 'asset_manhole',
  ];
  const pressHome = () => evalJs(
    `document.querySelector('canvas').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))`,
  );

  // ── 1. Contact Sheet：三件同场景（assetIds round-robin ×3 = 每件 1 件，间距 4m）──
  const placedSheet = await evalJs(
    `window.__tree3aPerf.place({ assetIds: ${JSON.stringify(ASSETS)}, count: 3, spacing: 4, jitter: false, seedBase: 7 })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 12 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1600);
  const sheetStats = await evalJs(`window.__tree3aPerf.stats()`);
  await screenshot('docs/acceptance/T025/025.3/frames/contact-3.png');
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
    const file = `docs/acceptance/T025/025.3/frames/close-${id}.png`;
    await screenshot(file);
    closeups.push({ id, ok, file });
  }
  await evalJs('window.__tree3aPerf.clear()');

  const consoleLog = await evalJs('window.__t02503Console');
  return { canary, placedSheet, sheetStats, closeups, consoleLog };
};
