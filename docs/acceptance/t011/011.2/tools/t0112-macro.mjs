// T011.2 补充：叶宏观特写（深入冠壳 2.8m，单叶 200px+ 级）+ 前例对照（夏栎 __tree3a / 朴树 __celtis 同机位）
// 对照判读点：①全缘 vs 夏栎锯齿/朴树齿 ②离基三出脉 vs 朴树基出三出脉 ③常绿浓绿 vs 两落叶树种色
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__camphor.mount()');
  await evalJs('window.__camphor.freezeTime()');
  for (const [name, view] of [
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],
    ['macro-2p4m-el10', { distance: 2.4, azimuthDeg: 35, elevationDeg: 10 }],
  ]) {
    await evalJs(`window.__camphor.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0112/${name}.png`);
  }
  // 背光复拍（对照判读革质弱透射 vs 夏栎 0.65/朴树 0.30）
  await evalJs('window.__camphor.view({ distance: 25, azimuthDeg: 275, elevationDeg: 8 })');
  await sleep(400);
  await screenshot('screenshots/t011-0112/camphor-backlight-25m.png');
  await evalJs('window.__camphor.unmount()');

  // ── 前例对照（同灯光同机位）：朴树 macro+背光 / 夏栎 macro+背光 ──
  if (await evalJs('typeof window.__celtis')) {
    await evalJs('window.__celtis.mount()');
    await evalJs('window.__celtis.freezeTime()');
    await evalJs('window.__celtis.view({ distance: 2.8, azimuthDeg: 35, elevationDeg: 20 })');
    await sleep(500);
    await screenshot('screenshots/t011-0112/macro-celtis-2p8m-el20.png');
    await evalJs('window.__celtis.view({ distance: 25, azimuthDeg: 275, elevationDeg: 8 })');
    await sleep(400);
    await screenshot('screenshots/t011-0112/celtis-backlight-25m.png');
    await evalJs('window.__celtis.unmount()');
  }
  if (await evalJs('typeof window.__tree3a')) {
    await evalJs('window.__tree3a.mount()');
    await evalJs('window.__tree3a.freezeTime()');
    await evalJs('window.__tree3a.view({ distance: 2.8, azimuthDeg: 35, elevationDeg: 20 })');
    await sleep(500);
    await screenshot('screenshots/t011-0112/macro-oak-2p8m-el20.png');
    await evalJs('window.__tree3a.view({ distance: 25, azimuthDeg: 275, elevationDeg: 8 })');
    await sleep(400);
    await screenshot('screenshots/t011-0112/oak-backlight-25m.png');
    await evalJs('window.__tree3a.unmount()');
  }
  return { done: true };
};
