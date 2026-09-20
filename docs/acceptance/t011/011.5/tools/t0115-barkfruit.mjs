// T011.5 树皮拼贴 + 果序可见性补充批次（第二轮 console 收集）——
// 悬铃木树皮 = 满干型三色带拼贴（platanusStage 011.3 缺口 D 评估：整干有效无高度门控——
// M25 主干读向在 baseline 帧，本批补近干特写 + 仰视整干）；果序 = 中近距叶幕下成对小球
// （球径工程域 4.8–6.4cm——不达可辨则如实记档不磨）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0115log2 = [];
      const push = (kind) => (...args) => window.__t0115log2.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0115restore2 = () => { console.error = origError; console.warn = origWarn; return window.__t0115log2; };
    })()
  `, { awaitPromise: false });

  const log = {};
  await evalJs('window.__platanus.mount()');
  await evalJs('window.__platanus.freezeTime()');
  for (const [name, view] of [
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: -8 }],   // 近干特写：三色带（奶油白/灰绿橄榄/灰褐）大片地图状 + 与榉树小片暖斑区分度
    ['trunk-upview-8m', { distance: 8, azimuthDeg: 35, elevationDeg: -35 }],    // 仰视：满干拼贴贯穿整干 + 分枝点（满干型验证）
    ['bark-trunk-1p2m-az110', { distance: 1.2, azimuthDeg: 110, elevationDeg: -8 }], // 双方位
    ['fruit-under-crown-8m', { distance: 8, azimuthDeg: 35, elevationDeg: -20 }],    // 冠下仰视：成对小球悬垂叶幕下（球径可辨性主判读）
    ['fruit-under-crown-8m-az110', { distance: 8, azimuthDeg: 110, elevationDeg: -20 }], // 双方位
    ['fruit-crown-edge-6m', { distance: 6, azimuthDeg: 35, elevationDeg: -12 }],     // 冠底缘近拍：果球-叶簇相对尺度
  ]) {
    await evalJs(`window.__platanus.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`docs/acceptance/t011/011.5/${name}.png`);
  }
  await evalJs('window.__platanus.unmount()');
  log.console = await evalJs('window.__t0115restore2()');
  return log;
};
