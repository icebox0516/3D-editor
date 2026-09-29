// T025.2 花箱疑点补图：标准机位（12° 仰角）下土面被近壁遮挡不可辨——高仰角俯视帧
// 验证「顶部开口 + 土面下沉」语义（身份疑点触发补图，校准护栏第一轮内）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5200');
  await setViewport(1920, 1080);
  await sleep(3500);

  await evalJs(`(() => {
    window.__t02502Console = [];
    const push = (level) => (...a) => window.__t02502Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  const ok = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_planter', count: 2, spacing: 2.0, jitter: false, seedBase: 5 })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 50 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1200);
  await screenshot('docs/acceptance/T025/025.2/frames/close-asset_planter-elevated.png');

  const consoleLog = await evalJs('window.__t02502Console');
  return { ok, consoleLog };
};
