// T011.3 疑点探针②：树干 1.2m 特写（判定斑驳「渲染缺失」vs「尺度不可辨」——
// 1.2m 距离下 7cm 晶胞斑 ≈ 60px，若存在则可见；若仍无 → 渲染缺失）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__zelkova.mount()');
  await evalJs('window.__zelkova.freezeTime()');
  // 干腰特写：目标高 ≈2m（主干中段），1.2m 距离平视
  await evalJs('window.__zelkova.view({ distance: 1.2, azimuthDeg: 35, elevationDeg: 2 })');
  await sleep(600);
  await screenshot('screenshots/t011-0113/probe-bark-1p2m.png');
  await evalJs('window.__zelkova.unmount()');
  return 'ok';
};
