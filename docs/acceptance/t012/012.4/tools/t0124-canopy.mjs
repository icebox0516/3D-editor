// T012.4 白皮松 canopy 取证机位（任务书「过渡带外 + 包围球体量校验」——本树距离带与先例不同）：
// 白皮松包围球 r≈6.4m（slot-0 bbox 实测 11.376 高 × 9.758 宽，Step 3c 探针）→ canopy 带
// m∈(16,60] ≈ 距离 (103,385]；多距 distribution 探针（d80/150/250/350/500 选档横读）+
// canopy 帧截图（带中部）+ console 续捕（与主批同页会话续跑）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0124log2 = [];
      const push = (kind) => (...args) => window.__t0124log2.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0124restore2 = () => { console.error = origError; console.warn = origWarn; return window.__t0124log2; };
    })()
  `, { awaitPromise: false });

  await evalJs(`window.__tree3aPerf.place({ count: 1, assetId: 'asset_tree_bungeana' })`);
  await sleep(600);
  await evalJs('window.__tree3aPerf.freezeTime(3.5)');

  const probes = {};
  for (const d of [80, 150, 250, 350, 500]) {
    await evalJs(`window.__tree3aPerf.view({ distance: ${d}, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(700);
    probes[d] = await evalJs('window.__tree3aPerf.distribution()');
  }

  // canopy 帧（净 canopy 态拍帧——d250 实测 = dual-submit 过渡带不可用作取证帧，
  // d350 实测 canopy:1 且 transition 0 = 过渡带外净态）
  await evalJs('window.__tree3aPerf.view({ distance: 350, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(900);
  await screenshot('canopy-350m.png');
  const statsAt350 = await evalJs('window.__tree3aPerf.stats()');
  await evalJs('window.__tree3aPerf.clear()');

  const log = await evalJs('window.__t0124restore2()');
  return { probes, statsAt350, consoleNoise: log };
};
