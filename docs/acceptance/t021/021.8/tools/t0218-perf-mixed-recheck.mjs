// T021.8 Phase C 续作 —— ① mixed near/far 异常复核 + 真近机位补测 + A/A 重复性
// 背景结论（中断版 perf-measurement.raw.json 判读）：
//  - 中断版 mixed.near 用 view() 缺省自适应距离 = 网格 extent 449m，与 far 搜索选中距离
//    逐位相同 → 两机位是同一位置，stats 逐位相同非捕获 bug（449m 机位最近树 ~136m
//    → m≈11 = mid 带，故 near 无 high 只有 15 mid —— 「near 实际很远」分支成立）。
//  - 本脚本：① 真近机位（D=150，相机进网格上空 45m，最近树 m<6 = high 带）补测；
//            ② far@449 重测（成对一致性 + 验证中断版 348fps）；
//            ③ A/A 同机位连采 ×2（量化同机位方差——解释 tier1000 far 658 vs near 1002 疑点）；
//            ④ tier1000@319 A/A ×2（同上，直接对中断版同机位不同 fps 疑点）。
const ASSETS_13 = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
  'asset_tree_salix',
];

export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  const log = {};

  // ── 环境复核（GPU / viewport / DPR 与中断版一致）──
  log.env = await run(`(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const canvas = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
    return {
      gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      viewport: [window.innerWidth, window.innerHeight],
      dpr: window.devicePixelRatio,
      canvasClient: [canvas.clientWidth, canvas.clientHeight],
      pure3d: !!document.querySelector('.ed-app--pure3d'),
      userAgent: navigator.userAgent,
    };
  })()`);

  /** 单配置：place → view → settle → sampleFrames + stats + distribution（同 t0218-perf.mjs 语义）*/
  const sampleConfig = (placeJs, viewJs, settleMs) => run(`(async () => {
    const p = window.__tree3aPerf;
    p.place(${placeJs});
    p.view(${viewJs});
    await new Promise(r => setTimeout(r, ${settleMs}));
    const sample = await p.sampleFrames(5000);
    return { sample, stats: p.stats(), distribution: p.distribution() };
  })()`);

  /** 同机位连采 A/A（不重 place——纯采样重复性）*/
  const sampleAgain = () => run(`(async () => {
    const p = window.__tree3aPerf;
    const sample = await p.sampleFrames(5000);
    return { sample, stats: p.stats(), distribution: p.distribution() };
  })()`);

  const mixedPlaceJs = `{ count: 2000, seedBase: 1, spacing: 10, jitter: true, assetIds: ${JSON.stringify(ASSETS_13)} }`;

  // ── ① mixed 真近机位（D=150；记录原始中断版 near 参数于 JSON 注记）──
  log.mixedNearClose = await sampleConfig(mixedPlaceJs, `{ distance: 150 }`, 2500);
  console.log('[recheck] mixed nearClose D=150 fps=' + log.mixedNearClose.sample.fps.toFixed(0)
    + ' inst=' + JSON.stringify(log.mixedNearClose.distribution.instances));

  // ── ② mixed far@449 重测（中断版 chosenDistance 口径）──
  log.mixedFar449 = await sampleConfig(mixedPlaceJs, `{ distance: 449 }`, 2500);
  console.log('[recheck] mixed far449 fps=' + log.mixedFar449.sample.fps.toFixed(0));

  // ── ③ A/A 同机位连采（far@449 原地再采一次）──
  log.mixedFar449AA = await sampleAgain();
  console.log('[recheck] mixed far449 A/A fps=' + log.mixedFar449AA.sample.fps.toFixed(0));

  // ── ④ tier1000（夏栎单种）@319 A/A：中断版 near(1002fps) 与 far(658fps) 同机位不同值的直接复核 ──
  const tier1000PlaceJs = `{ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_3a' }`;
  log.tier1000At319 = await sampleConfig(tier1000PlaceJs, `{ distance: 319 }`, 1200);
  console.log('[recheck] tier1000@319 fps=' + log.tier1000At319.sample.fps.toFixed(0));
  log.tier1000At319AA = await sampleAgain();
  console.log('[recheck] tier1000@319 A/A fps=' + log.tier1000At319AA.sample.fps.toFixed(0));

  // 记档注记：中断版 near 机位实参（供 README 异常记档引用）
  log.interruptedRunNotes = {
    mixedNearOriginalParams: 'view({}) 缺省自适应 → distance = max(lastExtent,25) = 449（2000 网格 extent）, az 35°, el 16°',
    mixedNearOriginalResult: { fps: 324.6, dc: 445, tri: 1905804, instances: { mid: 15, canopy: 1769, culled: 216 } },
    mixedFarChosen: 449,
    identityExplanation: 'near 缺省距离与 far 搜索选中距离同为 449 → 两机位同一位置，stats 逐位相同是必然，非捕获时序 bug',
  };

  await run(`window.__tree3aPerf.clear()`);
  return log;
};
