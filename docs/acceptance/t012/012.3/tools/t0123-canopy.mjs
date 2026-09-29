// T012.3 圆柏 canopy 补拍（主批 d500 越过 canopyToCulled → culled——8.19m 树高换算：
// 包围球 r≈4.3m → canopy 带 m∈(16,60] ≈ 距离 (69,258]m；d170 ≈ m39 带中部，远离两侧边界）
// 多距 distribution 探针（d100/170/250 选档横读）+ canopy 帧截图 + console 续捕（与主批同页会话续跑）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0123log2 = [];
      const push = (kind) => (...args) => window.__t0123log2.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0123restore2 = () => { console.error = origError; console.warn = origWarn; return window.__t0123log2; };
    })()
  `, { awaitPromise: false });

  await evalJs(`window.__tree3aPerf.place({ count: 1, assetId: 'asset_tree_juniperus' })`);
  await sleep(600);
  await evalJs('window.__tree3aPerf.freezeTime(3.5)');

  const probes = {};
  for (const d of [100, 170, 250]) {
    await evalJs(`window.__tree3aPerf.view({ distance: ${d}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(700);
    probes[d] = await evalJs('window.__tree3aPerf.distribution()');
  }

  // canopy 帧（d170 探针确认 canopy:1 且 transition 0 后拍摄）
  await evalJs(`window.__tree3aPerf.view({ distance: 170, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(900);
  await screenshot('canopy-170m.png');
  const statsAt170 = await evalJs('window.__tree3aPerf.stats()');
  await evalJs('window.__tree3aPerf.clear()');

  const log = await evalJs('window.__t0123restore2()');
  return { probes, statsAt170, consoleNoise: log };
};
