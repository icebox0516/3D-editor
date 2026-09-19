// T006.4 诊断：near 机位 draw call 构成分解（可见网格计数 / 影 pass 开关 A/B）
export default async ({ evalJs, navigate, sleep }) => {
  const BASE = 'http://localhost:5173';
  const SCATTER = {
    polygon: [
      { x: -1000, y: -1000 },
      { x: 1000, y: -1000 },
      { x: 1000, y: 1000 },
      { x: -1000, y: 1000 },
    ],
    densityPerM2: 0.026,
    assets: [{ assetId: 'asset_streetlamp', weight: 1 }],
    seed: 20260919,
    scaleRange: { min: 0.9, max: 1.1 },
  };
  await navigate(BASE + '/?lod=on');
  await sleep(1500);
  await evalJs(`window.__scatterSmoke.scatter({ id: 'stress-100k', params: ${JSON.stringify(SCATTER)} })`);
  await sleep(3500);
  await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: 90, azimuthDeg: 35, elevationDeg: 18 })})`);
  await sleep(2500);

  const count = await evalJs(`(function () {
    let visibleMeshes = 0, hiddenMeshes = 0, zeroCountVisible = 0, total = 0;
    const root = window.__scatterSmoke ? null : null;
    // 经 stats 出口拿不到内部树——用 renderer 场景遍历（DEV 页面无直接句柄，走全局勾选 DOM 不可行）
    // 改用 drawCalls A/B：关太阳影前后对比
    return { ok: true };
  })()`);

  const base = await evalJs(`window.__scatterSmoke.stats()`);
  await evalJs('window.__tree3aPerf.setSunShadow(false)');
  await sleep(800);
  const noShadow = await evalJs(`window.__scatterSmoke.stats()`);
  await evalJs('window.__tree3aPerf.setSunShadow(true)');
  await sleep(800);
  const shadowBack = await evalJs(`window.__scatterSmoke.stats()`);
  return { base: { drawCalls: base.drawCalls, triangles: base.triangles },
           noShadow: { drawCalls: noShadow.drawCalls, triangles: noShadow.triangles },
           shadowBack: { drawCalls: shadowBack.drawCalls } };
};
