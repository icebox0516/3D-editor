// T011.1 补充：叶宏观特写（深入冠壳 2.8m，单叶 200px+ 级）+ 橡树同机位对照
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__celtis.mount()');
  await evalJs('window.__celtis.freezeTime()');
  for (const [name, view] of [
    ['macro-2p8m-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],
    ['macro-2p8m-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],
    ['macro-2p4m-el10', { distance: 2.4, azimuthDeg: 35, elevationDeg: 10 }],
  ]) {
    await evalJs(`window.__celtis.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0111/${name}.png`);
  }
  // 橡树同口径对照（同灯光同机位——暗叶读向是树种配方差还是共性光照）
  await evalJs('window.__celtis.unmount()');
  if (await evalJs('typeof window.__tree3a')) {
    await evalJs('window.__tree3a.mount()');
    await evalJs('window.__tree3a.freezeTime()');
    await evalJs('window.__tree3a.view({ distance: 2.8, azimuthDeg: 35, elevationDeg: 20 })');
    await sleep(500);
    await screenshot('screenshots/t011-0111/macro-oak-2p8m-el20.png');
    await evalJs('window.__tree3a.view({ distance: 25, azimuthDeg: 275, elevationDeg: 8 })');
    await sleep(400);
    await screenshot('screenshots/t011-0111/oak-backlight-25m.png');
    await evalJs('window.__tree3a.unmount()');
  }
  // 朴树背光复拍（对照判读透射幅度差）
  await evalJs('window.__celtis.mount()');
  await evalJs('window.__celtis.freezeTime()');
  await evalJs('window.__celtis.view({ distance: 25, azimuthDeg: 275, elevationDeg: 8 })');
  await sleep(400);
  await screenshot('screenshots/t011-0111/celtis-backlight-25m.png');
  await evalJs('window.__celtis.unmount()');
  return { done: true };
};
