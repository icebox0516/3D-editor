// T012.4 白干可辨性消歧帧：M75 主方位 az35（近受光面——day 太阳 az53.1°；vs 侧机位
// az110 的受光差读向，判定「偏暗」是光照面还是材质面）——console 续捕
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);
  await evalJs(`
    (function () {
      window.__t0124log3 = [];
      const push = (kind) => (...args) => window.__t0124log3.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0124restore3 = () => { console.error = origError; console.warn = origWarn; return window.__t0124log3; };
    })()
  `, { awaitPromise: false });
  await evalJs('window.__bungeana.mount()');
  await evalJs('window.__bungeana.freezeTime()');
  await evalJs('window.__bungeana.view({ distance: 75, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(900);
  await screenshot('m75-az35.png');
  await evalJs('window.__bungeana.unmount()');
  const log = await evalJs('window.__t0124restore3()');
  return { consoleNoise: log };
};
