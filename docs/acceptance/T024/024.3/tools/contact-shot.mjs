// T024.3 Contact Sheet 取证批：13 树 × 全卡统一基线帧（M25：25m / 方位 35° / 仰角 8°
// ——t011.13 基线帧同参数口径）。产品路径：__tree3aPerf.place({assetId, count:1, preset})
// → CreateObjectCommand → SceneSync → InstancedAssetPool → 缓存分桶（024.1 全链）。
// 风动 uTime 未冻结（perf 句柄无 freezeTime）——M25 距离缓摆 ≤4.5cm 顶部幅、帧间身份
// 与色相不受影响（色卡可辨性判据不受风相位影响，记档于 README）。
// 卡集清单 = 024.3 终态（与 tests assetColorPresets EXPECTED_PRESETS 同源——整表锁绿
// 即声明面可信；bischofia 视 Step R 补证结论，若建卡把 AUTUMN_TREES 相应行解注释）。
const TREES = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum', 'asset_tree_salix',
];
const AUTUMN_TREES = new Set([
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_salix',
  'asset_tree_bischofia', // Step R 裁定建卡（Spec 1.1 红相四源 Verified——峰相红-红橙基调）
]);

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 收集（全批覆盖：挂载/放置/渲染零错误零警告判据）
  await evalJs(`(() => {
    window.__t02403Console = [];
    const push = (level) => (...a) => window.__t02403Console.push(level + ':' + a.map(String).join(' '));
    console.error = push('error'); console.warn = push('warn');
    return 'collector-on';
  })()`);

  const shots = [];
  for (const assetId of TREES) {
    const presets = ['default', ...(AUTUMN_TREES.has(assetId) ? ['autumn'] : [])];
    for (const preset of presets) {
      const ok = await evalJs(
        `window.__tree3aPerf.place({ assetId: '${assetId}', count: 1, seedBase: 1, spacing: 11, jitter: false${preset !== 'default' ? `, preset: '${preset}'` : ''} })`,
      );
      await evalJs(`window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
      await sleep(1100);
      const file = `docs/acceptance/T024/024.3/frames/${assetId}-${preset}.png`;
      await screenshot(file);
      shots.push({ assetId, preset, file, ok });
    }
  }
  await evalJs('window.__tree3aPerf.clear()');

  const consoleLog = await evalJs('window.__t02403Console');
  return { shots, consoleLog };
};
