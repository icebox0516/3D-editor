// T011.3 LOD 逐档重拍（修正 viewLevel API 误用：不叠加 view()——viewLevel 自带绕该档树位机位；
// 25m 三档 + Low 50m 远距）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__zelkova.mountLevels({ slot: 0 })');
  await evalJs('window.__zelkova.freezeTime()');
  for (const [name, level, dist] of [
    ['lod-level-high-25m', 'high', 25],
    ['lod-level-mid-25m', 'mid', 25],
    ['lod-level-low-25m', 'low', 25],
    ['lod-level-low-50m', 'low', 50],
  ]) {
    await evalJs(`window.__zelkova.viewLevel('${level}', { distance: ${dist}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(500);
    await screenshot(`screenshots/t011-0113/${name}.png`);
  }
  await evalJs('window.__zelkova.unmount()');
  return 'ok';
};
