// T010.5 —— 8 槽形态向量 stats 逐位记录（对照 lod-spec §5.3 实测带）
export default async ({ navigate, setViewport, evalJs }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3aPerf.clear()');
  await evalJs('window.__tree3a.mountSlots()');
  const s = await evalJs('window.__tree3a.stats()');
  await evalJs('window.__tree3a.unmount()');
  return s;
};
