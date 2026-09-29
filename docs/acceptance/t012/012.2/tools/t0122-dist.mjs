
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5181');
  await setViewport(1920, 1080);
  await sleep(1200);
  await evalJs("window.__tree3aPerf.place({ count: 1, assetId: 'asset_tree_metasequoia', preset: 'default' })");
  await sleep(600);
  const at = async (d) => {
    await evalJs('window.__tree3aPerf.view(' + JSON.stringify({ distance: d, azimuthDeg: 35, elevationDeg: 8 }) + ')');
    await sleep(900);
    return await evalJs('JSON.stringify(window.__tree3aPerf.distribution ? window.__tree3aPerf.distribution() : null)');
  };
  return { d25: await at(25), d100: await at(100), d200: await at(200), d300: await at(300), d400: await at(400) };
};