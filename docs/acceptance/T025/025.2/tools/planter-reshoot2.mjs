// T025.2 花箱疑点补图第二档：d=8 / 仰角 55° 近距俯视（土面 vs 内腔阴影分辨档）。
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
    `window.__tree3aPerf.place({ assetId: 'asset_planter', count: 1, spacing: 2.0, jitter: false, seedBase: 5 })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 8, azimuthDeg: 35, elevationDeg: 55 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1200);
  await screenshot('docs/acceptance/T025/025.2/frames/close-asset_planter-soil.png');

  const consoleLog = await evalJs('window.__t02502Console');
  return { ok, consoleLog };
};
