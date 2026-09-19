// T009.7 视觉/结构/变体取证批次（DEV 舞台 slot-0 锚点树，风冻结）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3aPerf.clear()');
  const t = () => evalJs('window.__tree3a');
  const log = {};

  // ── 视觉验收：近/中/远 × 六要素（slot-0 锚点树；机位沿 009.1 约定 12/25/50m az35 el8） ──
  await evalJs('window.__tree3a.mount()');
  await evalJs('window.__tree3a.freezeTime()');
  for (const [name, view] of [
    ['near-12m', { distance: 12, azimuthDeg: 35, elevationDeg: 8 }],
    ['mid-25m', { distance: 25, azimuthDeg: 35, elevationDeg: 8 }],
    ['far-50m', { distance: 50, azimuthDeg: 35, elevationDeg: 8 }],
    ['backlight-25m', { distance: 25, azimuthDeg: 275, elevationDeg: 8 }], // 冠内通透（逆光）
  ]) {
    await evalJs(`window.__tree3a.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t009-0095/vis-${name}.png`);
  }
  log.anchorStats = await evalJs('window.__tree3a.stats()');

  // ── 009.6 遗留复核项：Low 档远距口径（对比含蓄 → 远距是否成立） ──
  await evalJs('window.__tree3a.unmount()');
  await evalJs('window.__tree3a.mountLevels({ slot: 0 })');
  await evalJs('window.__tree3a.freezeTime()');
  for (const [name, fn] of [
    ['levels-far-60m', 'window.__tree3a.viewLevels({ distance: 60, elevationDeg: 16 })'],
    ['low-50m', 'window.__tree3a.viewLevel("low", { distance: 50, elevationDeg: 8 })'],
    ['low-25m', 'window.__tree3a.viewLevel("low", { distance: 25, elevationDeg: 8 })'],
  ]) {
    await evalJs(fn);
    await sleep(500);
    await screenshot(`screenshots/t009-0095/lod-${name}.png`);
  }

  // ── 变体验收：8 槽全景（引用 009.3 详证，此处补 009.7 存档照） ──
  await evalJs('window.__tree3a.unmount()');
  await evalJs('window.__tree3a.mountSlots()');
  await evalJs('window.__tree3a.freezeTime()');
  await evalJs('window.__tree3a.viewSlots()');
  await sleep(700);
  await screenshot('screenshots/t009-0095/slots-panorama-42m.png');
  log.slotsStats = await evalJs('window.__tree3a.stats()');
  await evalJs('window.__tree3a.unmount()');

  return log;
};
