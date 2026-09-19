// 换档序列运动基线：LOD off（恒 High 无换档）同款推拉 3 对采样——纯运动视差 diff 基线
export default async ({ evalJs, screenshot, navigate, sleep }) => {
  const BASE = 'http://localhost:5173';
  const TREE = {
    polygon: [{ x: -1000, y: -1000 }, { x: 1000, y: -1000 }, { x: 1000, y: 1000 }, { x: -1000, y: 1000 }],
    densityPerM2: 0.005,
    assets: [{ assetId: 'asset_tree_3a', weight: 1 }],
    seed: 20260920,
    scaleRange: { min: 0.85, max: 1.15 },
  };
  await navigate(BASE + '/?lod=off');
  await sleep(2500);
  await evalJs('window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0');
  await evalJs(`window.__scatterSmoke.scatter({ id: 'park-20k-tree', params: ${JSON.stringify(TREE)} })`);
  await sleep(9000);
  const ds = [60, 90, 270, 300, 570, 600];
  for (const d of ds) {
    await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: d, azimuthDeg: 35, elevationDeg: 12 })})`);
    await sleep(700); // off 侧帧时高（全 High ~17fps），拉长收敛
    await screenshot(`../screenshots/seqoff-d${String(d).padStart(3, '0')}.png`);
  }
  return { done: true };
};
