// 单树 cull 边界定位：celtis seedBase 1，d 600→900 步 10，找 fade 起坡与 cull 终态距离
// （诊断两次会话读数不一致：visual-run fade∈(655,670] 未 cull@780 vs cull-ext 已 cull@795）
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const out = await evalJs(`(async () => {
    const p = window.__tree3aPerf;
    p.place({ count: 1, seedBase: 1, assetId: 'asset_tree_celtis' });
    // 先从远处起步（canopy 稳态）再逐档拉近——与 E 序列同向
    p.view({ distance: 550, azimuthDeg: 35, elevationDeg: 8 });
    await new Promise(r => setTimeout(r, 800));
    const rows = [];
    for (let d = 600; d <= 900; d += 10) {
      p.view({ distance: d, azimuthDeg: 35, elevationDeg: 8 });
      await new Promise(r => setTimeout(r, 250));
      const dd = p.distribution();
      rows.push({ d, t: dd.transitionInstances, canopy: dd.instances.canopy, culled: dd.instances.culled, shadow: dd.shadowCasterInstances });
    }
    return rows;
  })()`);
  await evalJs('window.__tree3aPerf.clear()');
  return { sweep: out };
};
