// 金丝雀预检 v2：默认布局读数 + Tab→pure3d（产品路径）后 canvas 恰满 1920×1080 验证
export default async ({ navigate, setViewport, evalJs, screenshot }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await new Promise((r) => setTimeout(r, 1500));
  const readCanvas = `(() => {
    const canvases = [...document.querySelectorAll('canvas')].map(c => ({ client: [c.clientWidth, c.clientHeight], cls: c.className || c.id || '(anon)' }));
    const main = canvases.reduce((a, b) => (b.client[0] * b.client[1] > a.client[0] * a.client[1] ? b : a), canvases[0]);
    return { viewport: [window.innerWidth, window.innerHeight], dpr: window.devicePixelRatio, canvases, main };
  })()`;
  const before = await evalJs(readCanvas);
  // Tab → pure3d（input.ts 产品路径：window keydown）
  await evalJs(`(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })); })()`);
  await new Promise((r) => setTimeout(r, 800));
  const after = await evalJs(readCanvas);
  await screenshot('docs/acceptance/t021/021.8/acceptance/canary-pure3d.png');
  // 驱动面演练（pure3d 下）
  const drive = await evalJs(`(async () => {
    const p = window.__tree3aPerf;
    p.place({ count: 1, seedBase: 1, assetId: 'asset_tree_3a' });
    p.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    await new Promise(r => setTimeout(r, 1200));
    const s = p.stats(), d = p.distribution();
    return { stats: s, instances: d.instances, shadowCasterInstances: d.shadowCasterInstances };
  })()`);
  await screenshot('docs/acceptance/t021/021.8/acceptance/canary-M25.png');
  await evalJs(`window.__tree3aPerf.clear()`);
  return { before, after, drive };
};
