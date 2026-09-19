// T006.4 批次控制压力取证：10 万实例散布（asset_streetlamp，D27.11 独立测试资产口径——
// 不依赖 T003 样式链）+ 远近混合视角 draw call / LOD 分布 / FPS 采样 + 抽稀 A/B 截图。
// 用法：node cdp.mjs stress-evidence.mjs（Chrome CDP 9333 直连 + vite dev 5173）
// 口径：renderer.info（提交口径）；lod 分布 = window.__scatterSmoke.stats().lod（两链聚合）。
export default async ({ evalJs, screenshot, navigate, sleep }) => {
  const BASE = 'http://localhost:5173';
  const SCATTER = {
    polygon: [
      { x: -1000, y: -1000 },
      { x: 1000, y: -1000 },
      { x: 1000, y: 1000 },
      { x: -1000, y: 1000 },
    ],
    densityPerM2: 0.026, // 2000×2000 → ≈104,000 实例（≥ 10 万压力线）
    assets: [{ assetId: 'asset_streetlamp', weight: 1 }],
    seed: 20260919,
    scaleRange: { min: 0.9, max: 1.1 },
  };
  const log = { env: {}, canary: {}, stages: [], ab: {} };

  const readStats = () =>
    evalJs(`(function () {
      const s = window.__scatterSmoke.stats();
      return { drawCalls: s.drawCalls, triangles: s.triangles, totalChunks: s.totalChunks,
               visibleChunks: s.visibleChunks, instances: s.instances, lod: s.lod };
    })()`);

  // 金丝雀：主视口 canvas 布局尺寸 ≈ 主视口（非 minimap/轴指示器小 canvas）才可信
  await navigate(BASE + '/?lod=on');
  log.canary = await evalJs(`(function () {
    const canvases = [...document.querySelectorAll('canvas')].map((c) => ({
      cls: c.className || c.parentElement?.className || '',
      w: c.clientWidth, h: c.clientHeight,
    }));
    const main = canvases.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
    return { canvases, main, dpr: window.devicePixelRatio, inner: [innerWidth, innerHeight] };
  })()`);
  const mainCanvas = log.canary.main;
  if (!mainCanvas || mainCanvas.w < 800 || mainCanvas.h < 500) {
    throw new Error('金丝雀失败：主 canvas 尺寸异常 ' + JSON.stringify(mainCanvas));
  }

  log.env = await evalJs(`(function () {
    const gl = document.createElement('canvas').getContext('webgl2');
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown',
             viewport: [innerWidth, innerHeight], dpr: window.devicePixelRatio };
  })()`);

  // 冻结风相位（截图像素稳定前提；路灯材质无 uTime 亦无害）
  await evalJs('window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0');

  // 散布 10 万路灯（同步撒点 + 微任务源就绪）
  await evalJs(`window.__scatterSmoke.scatter({ id: 'stress-100k', params: ${JSON.stringify(SCATTER)} })`);
  await sleep(4000); // 块建立 + 首帧 LOD 收敛 + 冷源编译

  // 视角序列（远近混合；__tree3aPerf.view 球坐标机位——与放置对象无关的全局相机驱动）
  const viewpoints = [
    { name: 'near-mixed', distance: 90, azimuthDeg: 35, elevationDeg: 14, sampleFps: true },
    { name: 'mid', distance: 260, azimuthDeg: 35, elevationDeg: 30 },
    { name: 'high-far', distance: 520, azimuthDeg: 35, elevationDeg: 55, sampleFps: true },
  ];
  for (const vp of viewpoints) {
    await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: vp.distance, azimuthDeg: vp.azimuthDeg, elevationDeg: vp.elevationDeg })})`);
    await sleep(2500); // 换档收敛（迟滞 + 合并组重建）
    const stats = await readStats();
    await screenshot(`../screenshots/stress-${vp.name}.png`);
    const stage = { viewpoint: vp, stats };
    if (vp.sampleFps) {
      stage.fps = await evalJs(`window.__tree3aPerf.sampleFrames(4000)`);
    }
    log.stages.push(stage);
  }

  // 抽稀 A/B：同机位（mid 远景带）LOD on（low 档 + 0.5 抽稀 + 合并）vs off（全 High 全保真）
  await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: 230, azimuthDeg: 35, elevationDeg: 18 })})`);
  await sleep(2500);
  log.ab.on = await readStats();
  await screenshot('../screenshots/thinning-on-lod.png');
  await navigate(BASE + '/?lod=off');
  await sleep(1500);
  await evalJs(`window.__tree3a && window.__tree3a.freezeTime ? window.__tree3a.freezeTime() : 0`);
  await evalJs(`window.__scatterSmoke.scatter({ id: 'stress-100k', params: ${JSON.stringify(SCATTER)} })`);
  await sleep(4000);
  await evalJs(`window.__tree3aPerf.view(${JSON.stringify({ distance: 230, azimuthDeg: 35, elevationDeg: 18 })})`);
  await sleep(2500);
  log.ab.off = await readStats();
  await screenshot('../screenshots/thinning-off-full.png');

  return log;
};
