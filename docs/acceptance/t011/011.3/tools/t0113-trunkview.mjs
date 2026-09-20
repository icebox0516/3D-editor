// T011.3 疑点探针③：干腰入画机位（view 注视点恒 5.3m 冠心——T26/1.2m 特写画面覆盖
// 均为 3m+ 门控弱化区+细枝，满斑干腰 0.5–2.5m 从未入画）。el−35° R8m：相机 y≈−1.25m
// 仰视、画面覆盖 ~0.3–10m——干腰入画面下段
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__zelkova.mount()');
  await evalJs('window.__zelkova.freezeTime()');
  for (const [name, view] of [
    ['probe-bark-trunk-el35d8', { distance: 8, azimuthDeg: 35, elevationDeg: -35 }],
    ['probe-bark-trunk-el30d5', { distance: 5, azimuthDeg: 110, elevationDeg: -30 }],
  ]) {
    await evalJs(`window.__zelkova.view(${JSON.stringify(view)})`);
    await sleep(600);
    await screenshot(`screenshots/t011-0113/${name}.png`);
  }
  await evalJs('window.__zelkova.unmount()');
  return 'ok';
};
