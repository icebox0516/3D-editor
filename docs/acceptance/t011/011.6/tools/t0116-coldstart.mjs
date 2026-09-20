export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs(`(function () {
    window.__t0116log = [];
    const push = (kind) => (...args) => window.__t0116log.push(kind + ':' + args.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
  })()`, { awaitPromise: false });
  await evalJs('window.__koelreuteria.mount()');
  await sleep(800);
  return await evalJs('(function(){ return window.__t0116log })()');
};
