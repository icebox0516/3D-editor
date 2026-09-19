// T006.3 诊断：单棵细步扫距 20→1200m（25m 步）+ 冷跳复现，读 triangles 边界图
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  const log = { sweep: [], jumpTest: {} };
  const view = (distance) =>
    `window.__tree3aPerf.view(${JSON.stringify({ distance, azimuthDeg: 35, elevationDeg: 12 })})`;
  const stats = () => evalJs('window.__tree3aPerf.stats()');
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(600);
  await evalJs('window.__tree3a.freezeTime()');
  await evalJs('window.__tree3aPerf.place({ count: 1, spacing: 11, jitter: false })');
  await sleep(1200);
  const base = await stats();
  log.initialCamera = { triangles: base.triangles, geometries: base.geometries };

  for (let d = 20; d <= 1200; d += 25) {
    await evalJs(view(d));
    await sleep(450);
    const s = await stats();
    log.sweep.push({ d, triangles: s.triangles, geometries: s.geometries, drawCalls: s.drawCalls });
  }

  // 冷跳复现：回近（全 high）后再直接跳 1100
  await evalJs(view(20));
  await sleep(800);
  const near = await stats();
  await evalJs(view(1100));
  await sleep(1200);
  const far = await stats();
  log.jumpTest = { near: { triangles: near.triangles, geometries: near.geometries }, far1100: { triangles: far.triangles, geometries: far.geometries } };
  return log;
};
