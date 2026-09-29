// T012.2 Step 4 密度校准自检帧（procedural-asset-agent）：mount→freezeTime→M25 基线机位
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5181');
  await setViewport(1920, 1080);
  await evalJs('window.__metasequoia.mount()');
  await evalJs('window.__metasequoia.freezeTime()');
  await evalJs('window.__metasequoia.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(400);
  await screenshot('../calib-selfcheck.png');
  // 附带近景一帧供羽列近景身份自检（3m）
  await evalJs('window.__metasequoia.view({ distance: 3, azimuthDeg: 35, elevationDeg: 10 })');
  await sleep(300);
  await screenshot('../calib-selfcheck-closeup-3m.png');
  await evalJs('window.__metasequoia.unmount()');
  return { done: true };
};
