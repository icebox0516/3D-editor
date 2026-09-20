// T011.4 树皮细节补充批次（第二轮 console 收集）——近干灰褐色调特写 + 仰视纵裂贯穿帧
// （银杏树皮 = 全干型无高度门控 [ginkgoStage 011.3 缺口 D 评估]——常规机位可拍全干）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0114log2 = [];
      const push = (kind) => (...args) => window.__t0114log2.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0114restore2 = () => { console.error = origError; console.warn = origWarn; return window.__t0114log2; };
    })()
  `, { awaitPromise: false });

  const log = {};
  await evalJs('window.__ginkgo.mount()');
  await evalJs('window.__ginkgo.freezeTime()');
  for (const [name, view] of [
    ['bark-trunk-1p2m', { distance: 1.2, azimuthDeg: 35, elevationDeg: -8 }],   // 近干特写：灰褐色调 + 浅-中纵裂 + 窄密脊
    ['trunk-upview-8m', { distance: 8, azimuthDeg: 35, elevationDeg: -35 }],    // 仰视：纵裂贯穿整干 + 分枝点
    ['bark-trunk-1p2m-az110', { distance: 1.2, azimuthDeg: 110, elevationDeg: -8 }], // 双方位
  ]) {
    await evalJs(`window.__ginkgo.view(${JSON.stringify(view)})`);
    await sleep(500);
    await screenshot(`screenshots/t011-0114/${name}.png`);
  }
  await evalJs('window.__ginkgo.unmount()');
  log.console = await evalJs('window.__t0114restore2()');
  return log;
};
