// T011.5 树皮/果序帧重拍（确定性版）：负仰角被 Renderer controls maxPolarAngle≈90° clamp 至水平
// （1500ms 收敛 A/B/C 实证 el-35=-20=0 同帧）——本批一律 el=0 + 1200ms 收敛，帧内容与原标签口径一致（水平机位）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__platanus.mount()');
  await evalJs('window.__platanus.freezeTime()');
  await evalJs('window.__platanus.view({ distance: 20, azimuthDeg: 200, elevationDeg: 10 })');
  await sleep(1200);
  for (const [name, view] of [
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: 0 }],
    ['bark-trunk-1p2m-az110', { distance: 1.2, azimuthDeg: 110, elevationDeg: 0 }],
    ['trunk-lower-10m', { distance: 10, azimuthDeg: 35, elevationDeg: 0 }],
    ['trunk-lower-10m-az110', { distance: 10, azimuthDeg: 110, elevationDeg: 0 }],
    ['fruit-under-crown-8m', { distance: 8, azimuthDeg: 35, elevationDeg: 0 }],
    ['fruit-under-crown-8m-az110', { distance: 8, azimuthDeg: 110, elevationDeg: 0 }],
    ['fruit-crown-edge-6m', { distance: 6, azimuthDeg: 35, elevationDeg: 0 }],
  ]) {
    await evalJs(`window.__platanus.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.5/${name}.png`);
  }
  await evalJs('window.__platanus.unmount()');
  return {};
};
