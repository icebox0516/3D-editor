// T011.11 疑点③香樟对照帧补拍（同 session 同灯光同机位——常绿密度横向对照定量基准）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__camphor.mount()');
  await evalJs('window.__camphor.freezeTime()');
  await evalJs('window.__camphor.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/ref-camphor-m25.png');
  await evalJs('window.__camphor.view({ distance: 25, azimuthDeg: 275, elevationDeg: 8 })');
  await sleep(1200);
  await screenshot('docs/acceptance/t011/011.11/ref-camphor-b25.png');
  await evalJs('window.__camphor.unmount()');
  return 'ok';
};
