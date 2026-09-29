
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5181');
  await setViewport(1920, 1080);
  await sleep(1500);
  await screenshot('diag-empty.png');
  await evalJs('window.__metasequoia.mount()');
  await sleep(500);
  await evalJs('window.__metasequoia.freezeTime()');
  await evalJs('window.__metasequoia.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(500);
  await screenshot('diag-mounted.png');
  const stats = await evalJs('JSON.stringify(window.__metasequoia.stats ? (window.__metasequoia.stats.call ? window.__metasequoia.stats() : window.__metasequoia.stats) : null)');
  return { stats };
};