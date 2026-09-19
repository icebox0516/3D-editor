// T006.5 换档点序列取证（D27.10 机器 diff 口径：连续相机移动截图序列，帧间无闪烁/无
// 整屏突变）+ LOD 分布 DEV 可视化（D27.14：DOM overlay 实时分布数字随截图入画留档）。
// 场景：2 万夏栎散布（同 acceptance-park.mjs TREE 参数）；推拉 d=60→600 穿越 high→mid→
// low→culled 全档边界。相邻帧 diff 归 tools/pixel-diff.mjs（node 侧后处理）。
// 用法：cd tools && node cdp.mjs relevel-sequence.mjs
export default async ({ evalJs, screenshot, navigate, sleep }) => {
  const BASE = 'http://localhost:5173';
  const TREE = {
    polygon: [
      { x: -1000, y: -1000 }, { x: 1000, y: -1000 },
      { x: 1000, y: 1000 }, { x: -1000, y: 1000 },
    ],
    densityPerM2: 0.005,
    assets: [{ assetId: 'asset_tree_3a', weight: 1 }],
    seed: 20260920,
    scaleRange: { min: 0.85, max: 1.15 },
  };
  const log = { frames: [] };

  // LOD 分布 DEV 可视化 overlay（D27.14）：取证注入的临时 DOM，不进产品代码
  await navigate(BASE + '/?lod=on');
  await sleep(2500);
  await evalJs(`(function () {
    if (window.__lodOverlay) return 'kept';
    const el = document.createElement('div');
    el.id = '__lod_overlay_dev__';
    el.style.cssText = 'position:fixed;top:8px;right:8px;z-index:99999;background:rgba(0,0,0,0.72);' +
      'color:#7fe27f;font:11px/1.45 Consolas,monospace;padding:8px 10px;border-radius:6px;' +
      'pointer-events:none;white-space:pre;border:1px solid #2e5c2e';
    document.body.appendChild(el);
    window.__lodOverlay = el;
    const refresh = () => {
      try {
        const s = window.__scatterSmoke.stats();
        const i = s.lod.instances, b = s.lod.buckets;
        el.textContent =
          'LOD DEV  calls ' + s.drawCalls + '  tris ' + s.triangles +
          '\\ninst H/M/L/C ' + i.high + '/' + i.mid + '/' + i.low + '/' + i.culled +
          '\\nbkt  H/M/L/C ' + b.high + '/' + b.mid + '/' + b.low + '/' + b.culled;
      } catch (e) { el.textContent = 'LOD DEV (stats unavailable)'; }
      requestAnimationFrame(refresh);
    };
    refresh();
    return 'injected';
  })()`);
  await evalJs('window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0');
  await evalJs(`window.__scatterSmoke.scatter({ id: 'park-20k-tree', params: ${JSON.stringify(TREE)} })`);
  await sleep(8000);

  // 推拉序列：d=60→600 步长 30（19 帧；az/el 固定，纯视距轴——穿越全部档界）
  for (let step = 0; step <= 18; step++) {
    const d = 60 + step * 30;
    await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: d, azimuthDeg: 35, elevationDeg: 12 })})`);
    await sleep(450); // 换档收敛 + overlay 刷新
    await screenshot(`../screenshots/seq-d${String(d).padStart(3, '0')}.png`);
    const s = await evalJs(`window.__scatterSmoke.stats()`);
    log.frames.push({ d, stats: { drawCalls: s.drawCalls, triangles: s.triangles, lod: s.lod } });
  }
  return log;
};
