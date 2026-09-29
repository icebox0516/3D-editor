
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5181');
  await setViewport(1920, 1080);
  await sleep(1200);
  const shot = async (asset, file) => {
    await evalJs("window.__tree3aPerf.place({ count: 1, assetId: '" + asset + "' })");
    await sleep(500);
    await evalJs('window.__tree3aPerf.view(' + JSON.stringify({ distance: 500, azimuthDeg: 35, elevationDeg: 8 }) + ')');
    await sleep(2500);
    const dist = await evalJs('JSON.stringify(window.__tree3aPerf.distribution().instances)');
    await screenshot(file);
    return dist;
  };
  const msq = await shot('asset_tree_metasequoia', 'canopy-500m.png');
  const ced = await shot('asset_tree_cedrus', 'canopy-cedrus-500m.png');
  return { msq, ced };
};