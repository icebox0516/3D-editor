// T025.1 锥卡修复复验：黄卡单枚 + 红黄双卡两帧（shapeFamily 声明修复后黄卡应生效）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5199');
  await setViewport(1920, 1080);
  await sleep(3500);

  await evalJs(`window.__tree3aPerf.place({ assetId: 'asset_trafficcone', count: 1, preset: 'yellow', spacing: 4, jitter: false })`);
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 12 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1000);
  await evalJs(`document.querySelector('canvas').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))`);
  await sleep(900);
  await screenshot('docs/acceptance/T025/025.1/frames/verify-single-yellow.png');

  await evalJs(`window.__tree3aPerf.place({ assetId: 'asset_trafficcone', count: 2, presets: ['default', 'yellow'], spacing: 1.2, jitter: false, seedBase: 3 })`);
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 12 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(900);
  await evalJs(`document.querySelector('canvas').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))`);
  await sleep(900);
  await screenshot('docs/acceptance/T025/025.1/frames/verify-dual-preset.png');

  const stats = await evalJs(`window.__tree3aPerf.stats()`);
  await evalJs('window.__tree3aPerf.clear()');
  return { stats };
};
