// T018.5 终调取证 —— day/tech 过曝显示域压缩双旋钮扫描（displayIntensity × iblIntensity）
// 判据（018.3 定论「Preetham HDR × NoToneMapping 大面积 clamp 254」为处置对象）：
//  - 天空带（顶部 15% 行）：脱离饱和（satFrac↓）+ 渐变可见（lumaStd↑）
//  - 地面带（底部 25% 行）：脱离饱和平台（satFrac↓）且不过暗（meanLuma 合理）
//  - 全帧饱和占比 max(r,g,b) ≥ 250 逐帧记录
// 产物：tune-*.png + 定量读数（stdout JSON）——终值据此裁定后落预设表（runtime agent）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);

  const log = { probe: await evalJs(`(() => ({
    sky: !!window.__sky, envProbe: !!window.__envProbe, tree3aPerf: !!window.__tree3aPerf,
    tree3a: !!window.__tree3a, mode: window.__sky?.mode,
  }))()`) };
  if (!log.probe.sky || !log.probe.envProbe || !log.probe.tree3aPerf) {
    throw new Error('probes missing: ' + JSON.stringify(log.probe));
  }

  // 帧捕获 + 页内像素度量（Page.captureScreenshot 原始 base64 → Image 解码 → 分带统计）
  const METRIC_FN = `(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, W, H).data;
    const bandStats = (y0, y1) => {
      let sat = 0, lumaSum = 0, lumaSq = 0, n = 0;
      for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = d[i], g = d[i+1], b = d[i+2];
        const luma = 0.2126*r + 0.7152*g + 0.0722*b;
        if (Math.max(r, g, b) >= 250) sat++;
        lumaSum += luma; lumaSq += luma * luma; n++;
      }
      const mean = lumaSum / n;
      return { satFrac: +(sat / n).toFixed(4), meanLuma: +mean.toFixed(1), lumaStd: +Math.sqrt(lumaSq / n - mean * mean).toFixed(1) };
    };
    return {
      sky: bandStats(0, Math.floor(H * 0.15)),
      ground: bandStats(Math.floor(H * 0.75), H),
      full: bandStats(0, H),
    };
  })`;
  async function shotMetrics(name) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const b64 = res.data;
    const { writeFileSync } = await import('node:fs');
    writeFileSync(`../tune-${name}.png`, Buffer.from(b64, 'base64'));
    return evalJs(`${METRIC_FN}(${JSON.stringify(b64)})`);
  }

  // 场景 A：tree3a 机位（018.0 同款：distance 25 / az 35 / el 8）——天空带 + 地面带 + 树受光
  async function setupTreeView() {
    await evalJs(`window.__tree3a.freezeTime(); (async () => {
      window.__tree3aPerf.clear();
      window.__tree3aPerf.place({ count: 1, seedBase: 1, spacing: 11, jitter: false, assetId: 'asset_tree_3a' });
      window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
      return true;
    })()`);
    await sleep(900);
  }
  // 场景 B：金属三球机位（018.0 同款注入：(0,1.1,5.2)→(0,0.55,0)，roughness 0.15/0.45/0.75）
  async function setupMetalView() {
    await evalJs(`(async () => {
      window.__tree3aPerf.clear();
      const THREE = await import('/node_modules/.vite/deps/three.js');
      (window.__t0185_metal ??= (() => {
        const group = new THREE.Group();
        [0.15, 0.45, 0.75].forEach((roughness, i) => {
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 48, 32),
            new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness }),
          );
          m.position.set((i - 1) * 1.4, 0.5, 0);
          m.castShadow = true;
          group.add(m);
        });
        return group;
      })());
      window.__t0185_metal.removeFromParent();
      window.__envProbe.scene.add(window.__t0185_metal);
      const { camera, controls } = window.__envProbe;
      camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
      return true;
    })()`);
    await sleep(900);
  }
  async function clearMetal() {
    await evalJs(`window.__t0185_metal?.removeFromParent(); true`);
    await sleep(300);
  }
  // 双旋钮设定（ibl 借道 debounced 重烘——600ms settle 覆盖 200ms 窗 + 烘焙）
  async function apply(display, ibl) {
    await evalJs(`window.__sky.setDisplayIntensity(${display}); window.__sky.setIblIntensity(${ibl}); true`);
    await sleep(650);
  }

  log.sweeps = {};
  const sweep = async (preset, displayCandidates, iblCandidates, label) => {
    await evalJs(`window.__envProbe.setPreset('${preset}')`);
    await sleep(900);
    const entry = { baseline: null, display: [], ibl: [], final: null };
    // 基线（表值原样）
    entry.baseline = { params: await evalJs(`window.__sky.params()`), stats: await shotMetrics(`${label}-base`) };
    // display 扫描（ibl 保持表值——天空带只受 display 影响）
    for (const d of displayCandidates) {
      await apply(d, entry.baseline.params.iblIntensity);
      entry.display.push({ display: d, metrics: await shotMetrics(`${label}-disp-${String(d).replace('.', '')}`) });
    }
    // ibl 扫描（display 回基线 1.0——地面/受光物只受 ibl 影响；分离变量）
    for (const i of iblCandidates) {
      await apply(1, i);
      entry.ibl.push({ ibl: i, metrics: await shotMetrics(`${label}-ibl-${String(i).replace('.', '')}`) });
    }
    log.sweeps[label] = entry;
  };

  // ── day：display [0.6 0.45 0.35 0.28] / ibl [0.5 0.4 0.3 0.25]（tree 机位）──
  await setupTreeView();
  await sweep('day', [0.6, 0.45, 0.35, 0.28], [0.5, 0.4, 0.3, 0.25], 'day-tree');

  // ── tech：display [0.7 0.5 0.35] / ibl [0.5 0.4 0.3 0.25]（tree 机位）──
  await sweep('tech', [0.7, 0.5, 0.35], [0.5, 0.4, 0.3, 0.25], 'tech-tree');

  // ── dusk/night 终态复核（表值原样，预期无饱和嫌疑）──
  for (const p of ['dusk', 'night']) {
    await evalJs(`window.__envProbe.setPreset('${p}')`);
    await sleep(900);
    log.sweeps[`${p}-tree`] = { baseline: { params: await evalJs(`window.__sky.params()`), metrics: await shotMetrics(`${p}-tree-base`) } };
  }

  // ── 金属机位复核（day/tech 表值基线 vs 压缩候选——IBL 反射可辨性参照）──
  await clearMetal().then(setupMetalView);
  for (const [preset, label] of [['day', 'day'], ['tech', 'tech']]) {
    await evalJs(`window.__envProbe.setPreset('${preset}')`);
    await sleep(900);
    log.sweeps[`${label}-metal`] = {
      baseline: { params: await evalJs(`window.__sky.params()`), metrics: await shotMetrics(`${label}-metal-base`) },
      compressed: (() => null),
    };
  }
  // day/tech 压缩组合（初判值，终值由读数+目测定）——金属反射层次参照
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(900);
  await apply(0.35, 0.3);
  log.sweeps['day-metal'].compressed = { display: 0.35, ibl: 0.3, metrics: await shotMetrics('day-metal-d035-i030') };
  await evalJs(`window.__envProbe.setPreset('tech')`);
  await sleep(900);
  await apply(0.5, 0.4);
  log.sweeps['tech-metal'].compressed = { display: 0.5, ibl: 0.4, metrics: await shotMetrics('tech-metal-d050-i040') };

  // 恢复：清注入 + 表值 day + pmremStats 终读
  await clearMetal();
  await evalJs(`window.__envProbe.setPreset('day'); window.__tree3a.unfreezeTime(); true`);
  await sleep(600);
  log.finalProbe = {
    mode: await evalJs(`window.__sky.mode`),
    params: await evalJs(`window.__sky.params()`),
    pmrem: await evalJs(`window.__sky.pmremStats()`),
  };
  return log;
};
