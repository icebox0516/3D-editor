// T025.3 井盖疑点补图：标准机位（12° 仰角）下盖面纹样近乎侧视不可辨——高仰角俯视帧
// 验证「宽边框环 + 内沉盖盘 + 十字网格纹 + 字章/字样槽」语义（身份疑点触发补图 +
// Step 2 观察项 O-C6 混合 uv 域判读面；批 B 花箱 planter-reshoot 先例同位）。
// 两档：50° 两件（同景语境）→ 55° 单件 d=8（盖面特写）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5201');
  await setViewport(1920, 1080);
  await sleep(3500);

  await evalJs(`(() => {
    window.__t02503Console = [];
    const push = (level) => (...a) => window.__t02503Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  const ok2 = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_manhole', count: 2, spacing: 2.0, jitter: false, seedBase: 5 })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 50 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1200);
  await screenshot('docs/acceptance/T025/025.3/frames/close-asset_manhole-elevated.png');

  const ok1 = await evalJs(`window.__tree3aPerf.clear()`);
  await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_manhole', count: 1, seedBase: 1, spacing: 4, jitter: false })`,
  );
  await evalJs(`window.__tree3aPerf.view({ distance: 8, azimuthDeg: 35, elevationDeg: 55 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1200);
  await screenshot('docs/acceptance/T025/025.3/frames/close-asset_manhole-top.png');
  const stats = await evalJs(`window.__tree3aPerf.stats()`);

  const consoleLog = await evalJs('window.__t02503Console');
  return { ok2, ok1, stats, consoleLog };
};
