export default async ({ navigate, setViewport, evalJs }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3aPerf.clear()');
  await evalJs('window.__tree3a.mount()');
  const s = await evalJs('window.__tree3a.stats()');
  await evalJs('window.__tree3a.unmount()');
  return s;
};
