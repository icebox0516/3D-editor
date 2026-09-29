
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5181');
  await setViewport(1920, 1080);
  await sleep(1500);
  // 同机位空景 → 挂树 → 双帧（相机完全不动）
  await evalJs('window.__metasequoia.view ? null : null');
  // 空景也要先有一个 view——句柄 mount 前 view 依赖 mount？先 mount 再 view 再截图，再 unmount 再截图
  await evalJs('window.__metasequoia.mount()');
  await evalJs('window.__metasequoia.freezeTime()');
  await evalJs('window.__metasequoia.view({ distance: 8, azimuthDeg: 35, elevationDeg: 24 })');
  await sleep(600);
  await screenshot('mask-mounted.png');
  await evalJs('window.__metasequoia.unmount()');
  await sleep(600);
  await screenshot('mask-empty.png');
  return 'ok';
};