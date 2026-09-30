// T012.4 白皮松 Step 3c 取证批次（GLSL 真编译 + M25 基线帧 + 冠带绿量化原料 + 观察项帧）
// 复用 012.2 cdp.mjs 管线（Chrome CDP 直驱 1920×1080）；vite 5183（本会话自建自清）
// 流程：console 捕获（全程）→ 金丝雀（__bungeana 存在性 + WebGL2 + canvas ≈ 主视口）
//      → 空场 M25 帧（差分掩膜原料）→ mount 锚点冻结 M25 基线帧 + stats + 组1 冠域
//      Y 探针（VIEW_TARGET_Y=7.5 验证）→ 转台 1.5s 旋转检视（console 零噪声证据）
//      → mountLevels 三档（mid/low 材质 + 深度材质编译覆盖）→ slot-2 空场/挂树帧对
//      （伞形平顶观察项）→ M75 侧机位（白干可辨性观察项）→ M12 近景（束卡质感观察项）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0124log = [];
      const push = (kind) => (...args) => window.__t0124log.push(kind + ':' + args.map(String).join(' '));
      const origError = console.error, origWarn = console.warn;
      console.error = push('error'), console.warn = push('warn');
      window.__t0124restore = () => { console.error = origError; console.warn = origWarn; return window.__t0124log; };
    })()
  `, { awaitPromise: false });

  // ── 金丝雀：句柄存在（vite 服务最新代码）+ WebGL2 上下文 + canvas 尺寸 ≈ 主视口 ──
  const canary = await evalJs(`(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    return {
      hasBungeana: typeof window.__bungeana === 'object' && window.__bungeana !== null,
      hasJuniperus: typeof window.__juniperus === 'object',
      webgl2: !!gl,
      webglVendor: gl ? gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL) : null,
      mainCanvas: (() => { const cv = document.querySelector('canvas'); return cv ? [cv.width, cv.height, cv.clientWidth, cv.clientHeight] : null; })(),
    };
  })()`);
  if (!canary.hasBungeana || !canary.webgl2) {
    return { ABORT: 'canary failed', canary, consoleNoise: await evalJs('window.__t0124restore()') };
  }
  const baseNoise = (await evalJs('window.__t0124log.length'));

  // ── 空场 M25 帧（差分掩膜原料——同机位对 baseline）──
  await evalJs(`window.__bungeana.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(400);
  await screenshot('diag-empty.png');

  // ── 锚点 mount + freeze + M25 基线帧 + 账目 + 冠域 Y 探针 ──
  await evalJs('window.__bungeana.mount()');
  await evalJs('window.__bungeana.freezeTime()');
  await evalJs(`window.__bungeana.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(1000);
  await screenshot('baseline.png');
  const anchorStats = await evalJs('window.__bungeana.stats()');
  // 组 1（束卡）Y 域探针：VIEW_TARGET_Y=7.5 定档依据复核（页内直 build 锚点源，按 index
  // 群范围逐顶点 min/max——与 bungeanaStage 模块头「树高参考」同口径；探针资源即时释放）
  const yProbe = await evalJs(`(async () => {
    const mod = await import('/src/runtime/procedural/assets/asset_tree_bungeana.asset.ts');
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
  await evalJs('window.__bungeana.turntable(0.4)');
  await sleep(1500);
  await evalJs('window.__bungeana.turntable(0)');
  await evalJs(`window.__bungeana.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`);
  await sleep(400);
  const noiseAfterTurntable = (await evalJs('window.__t0124log.length')) - baseNoise;

  // ── mountLevels 三档（mid/low 材质 + 深度材质编译覆盖）──
  await evalJs('window.__bungeana.unmount()');
  await evalJs('window.__bungeana.mountLevels()');
  await evalJs('window.__bungeana.viewLevels()');
  await sleep(1200);
  await screenshot('lod-levels.png');
  const levelsStats = await evalJs('window.__bungeana.stats()');
  await evalJs('window.__bungeana.unmount()');

  // ── slot-2 老树伞形平顶观察项：空场/挂树 M25 帧对（bandwindow 分层读数原料）──
  await evalJs('window.__bungeana.unmount()');
  await evalJs('window.__bungeana.viewSlot(2, { distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(400);
  await screenshot('slot2-empty.png');
  await evalJs('window.__bungeana.mountSlots()');
  await evalJs('window.__bungeana.viewSlot(2, { distance: 25, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(1000);
  await screenshot('slot2-m25.png');
  await evalJs('window.__bungeana.unmount()');

  // ── M75 侧机位（白干中距可辨性——身份承重观察项 Unknown ⑤）──
  await evalJs('window.__bungeana.mount()');
  await evalJs('window.__bungeana.freezeTime()');
  await evalJs('window.__bungeana.view({ distance: 75, azimuthDeg: 110, elevationDeg: 8 })');
  await sleep(800);
  await screenshot('m75-side.png');

  // ── M12 近景（束卡中距质感——3 针小扇放射刷状读向观察项）──
  await evalJs('window.__bungeana.view({ distance: 12, azimuthDeg: 35, elevationDeg: 8 })');
  await sleep(800);
  await screenshot('m12-near.png');
  await evalJs('window.__bungeana.unmount()');

  const log = await evalJs('window.__t0124restore()');
  return { canary, baseNoise, noiseAfterTurntable, anchorStats, yProbe, levelsStats, consoleNoise: log };
};
