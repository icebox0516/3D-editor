// T011.7 stats 落盘（main-stats.json——锚点/8槽/三档账目原始回读）
export default async ({ navigate, setViewport, evalJs }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  const out = {};
  await evalJs('window.__triadica.mount()');
  out.anchor = await evalJs('window.__triadica.stats()');
  await evalJs('window.__triadica.unmount()');
  await evalJs('window.__triadica.mountSlots()');
  out.slots = await evalJs('window.__triadica.stats()');
  await evalJs('window.__triadica.unmount()');
  await evalJs('window.__triadica.mountLevels({ slot: 0 })');
  out.levels = await evalJs('window.__triadica.stats()');
  await evalJs('window.__triadica.unmount()');
  return out;
};
