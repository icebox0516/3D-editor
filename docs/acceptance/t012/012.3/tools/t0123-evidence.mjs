// T012.3 圆柏 Step 3c 中断恢复取证批次（3c 补缺三件：GLSL 真编译 + M25 基线帧 + 冠带绿量化原料）
// 复用 012.2 cdp.mjs 管线（Chrome CDP 直驱 1920×1080）；vite 复用前次会话实例 5183（N4——HMR 已含 22:26 后全部源码）
// 流程：console 捕获（全程）→ 金丝雀（__juniperus 存在性 + WebGL2）→ 空场 M25 帧（差分掩膜原料）
//      → mount 锚点冻结 M25 基线帧 + stats + 组1 冠域 Y 探针（VIEW_TARGET_Y 验证）
//      → 转台 1.5s 旋转检视（console 零噪声证据）→ mountLevels 三档（mid/low 材质编译覆盖）
//      → 产品路径 place×1 + d500 canopy 帧 + distribution 读出（canopy program 编译 + 选档实证）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0123log = [];
      const push = (kind) => (...args) => window.__t0123log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0123restore = () => { console.error = origError; console.warn = origWarn; return window.__t0123log; };
    })()
  `, { awaitPromise: false });

  // ── 金丝雀：句柄存在（vite 服务最新代码）+ WebGL2 上下文 ──
  const canary = await evalJs(`(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    return {
      hasJuniperus: typeof window.__juniperus === 'object' && window.__juniperus !== null,
      hasMetasequoia: typeof window.__metasequoia === 'object',
      webgl2: !!gl,
      webglVendor: gl ? gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL) : null,
      mainCanvas: (() => { const cv = document.querySelector('canvas'); return cv ? [cv.width, cv.height] : null; })(),
    };
  })()`);
  if (!canary.hasJuniperus || !canary.webgl2) {
    return { ABORT: 'canary failed', canary, consoleNoise: await evalJs('window.__t0123restore()') };
  }
  const baseNoise = (await evalJs('window.__t0123log.length'));

  // ── 空场 M25 帧（差分掩膜原料——同机位对 baseline）──
  await evalJs(`window.__juniperus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(400);
  await screenshot('diag-empty.png');

  // ── 锚点 mount + freeze + M25 基线帧 + 账目 + 冠域 Y 探针 ──
  await evalJs('window.__juniperus.mount()');
  await evalJs('window.__juniperus.freezeTime()');
  await evalJs(`window.__juniperus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(1000);
  await screenshot('baseline.png');
  const anchorStats = await evalJs('window.__juniperus.stats()');
  // 组 1（绳/刺卡）Y 域探针：VIEW_TARGET_Y=4.5 定档依据复核（页内直 build 锚点源，按 index
  // 群范围逐顶点 min/max——与 juniperusStage 模块头「树高参考」同口径；探针资源即时释放）
  const yProbe = await evalJs(`(async () => {
    const mod = await import('/src/runtime/procedural/assets/asset_tree_juniperus.asset.ts');
    const src = mod.build();
    const geo = src.geometry;
    const pos = geo.attributes.position;
    const idx = geo.index; // 非索引几何 index = null——组 start/count 即顶点范围
    const groups = [];
    for (const g of geo.groups) {
      let mn = Infinity, mx = -Infinity;
      const n = g.start + g.count;
      for (let i = g.start; i < n; i++) {
        const y = pos.getY(idx ? idx.getX(i) : i);
        if (y < mn) mn = y;
        if (y > mx) mx = y;
      }
      groups.push({ start: g.start, count: g.count, minY: +mn.toFixed(3), maxY: +mx.toFixed(3) });
    }
    let allMin = Infinity, allMax = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < allMin) allMin = y;
      if (y > allMax) allMax = y;
    }
    geo.dispose();
    const mats = Array.isArray(src.material) ? src.material : [src.material];
    for (const m of mats) m.dispose();
    src.customDepthMaterial?.dispose();
    return { groups, allY: [+allMin.toFixed(3), +allMax.toFixed(3)] };
  })()`);

  // ── 转台旋转检视（console 零噪声证据）──
  await evalJs('window.__juniperus.turntable(0.4)');
  await sleep(1500);
  await evalJs('window.__juniperus.turntable(0)');
  await evalJs(`window.__juniperus.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(400);
  const noiseAfterTurntable = (await evalJs('window.__t0123log.length')) - baseNoise;

  // ── mountLevels 三档（mid/low 材质 + 深度材质编译覆盖）──
  await evalJs('window.__juniperus.unmount()');
  await evalJs('window.__juniperus.mountLevels()');
  await evalJs('window.__juniperus.viewLevels()');
  await sleep(1200);
  await screenshot('lod-levels.png');
  const levelsStats = await evalJs('window.__juniperus.stats()');
  await evalJs('window.__juniperus.unmount()');

  // ── 产品路径 canopy：place×1 + d500（canopy program 编译 + 选档实证）──
  await evalJs(`window.__tree3aPerf.place({ count: 1, assetId: 'asset_tree_juniperus' })`);
  await sleep(600);
  await evalJs(`window.__tree3aPerf.freezeTime(3.5)`);
  await evalJs(`window.__tree3aPerf.view({ distance: 500, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(1000);
  await screenshot('canopy-500m.png');
  const distribution = await evalJs('window.__tree3aPerf.distribution()');
  const perfStats = await evalJs('window.__tree3aPerf.stats()');
  await evalJs('window.__tree3aPerf.clear()');

  const log = await evalJs('window.__t0123restore()');
  return { canary, baseNoise, noiseAfterTurntable, anchorStats, yProbe, levelsStats, distribution, perfStats, consoleNoise: log };
};
