// T024.5 验收门 —— 混卡包络性能实测（epic「资源与性能」面，D44 #3）v2
// 包络：13 树 × {default, autumn} 双卡 round-robin × 2000 实例（spacing 10 沿 T021.8 混植档）。
//   place 语义：对象 i 资产 = assetIds[i%13]、卡 = presets[i%2]（bootstrap.ts Tree3aPerfPlaceOptions.presets）。
//   声明 26 组合；camphor/ligustrum 常绿 default 单卡（T024.3 裁定），autumn 读侧归一 default → 有效桶 24。
// 机位（逐位沿用 T021.8 混植 2000 档；az/el 沿 view() 缺省 35°/16°）：
//   nearClose@150（真近，DC/p95 预算锚）｜ mid 过渡带搜索（tri 预算锚，§九「中景过渡带」）
//   ｜ far@449（canopy 稳态）。
// 采样口径（t0218-perf.mjs / t0218-perf-mixed-recheck.mjs 同款 + 沉降门）：
//   **每配置重新 place**（T021.8 sampleConfig/shadowAB 语义——place 幂等同参重建，选择从
//   新态直接向目标机位收敛；v1 单 place 跨机位跳档的过渡在途污染实测见
//   logs/perf-mixed-v1-singleplace-contaminated.json：far 采样吃进 fade-out 在途
//   tInst 239/culled 27（T021.8 沉降态 216）、shadowAB off 分支读到 far 态 165.9fps）。
//   place → view 紧邻（T021.8 同序：对象首个选档即发生在目标机位）→ clean 沉降门
//   （(DC,tri,tInst,dual) 连续 3 读 ×500ms 稳定 ∧ tInst==0，上限 60s）→ sampleFrames(5000)
//   （内置 30 帧预热）→ stats+dist。
//   **v3 增补（v2 首跑两处协议缺陷修复，无效帧留存 logs/perf-mixed-v2-noview-invalid.json）**：
//   ① sampleConfig 漏调 view()（nearClose/far 均采在缺省机位——两机位账目逐位同即铁证）；
//   ② 独立会话首配置 pending-source 假沉降：T021.8 mixed 在 tiers 12 配置后跑（13×3 表示源
//   已全量热），本会话独立拉起时首配置 196 枚对象 sourceReady=false 账目冻结 ≥2s、gate 于
//   冻结台上误判 settled（nearClose 采到 h76+m810+c1114 过渡中态，v1 同值复现）——v3 增
//   源预热（449→150 各等 clean 门，只建源不采样）+ clean 沉降门（tInst==0 必要条件）。
//   ③ v4：far 改 spawn-at-target（view 先行 → place）——T021.8 far 有效语义（其 far 配置
//   place 时相机已在 449，对象首选档即沉降态）。判别依据 probe-fadeout.mjs：当前构建跨距
//   级联中 →culled fade-out 永久冻结（单卡双卡皆冻结，卡无关；T021.8 构建同 maneuver
//   ≤900ms 完成 tInst 0/culled 1858），冻结台非沉降态不可采；spawn-at-target 沉降态逐实例
//   复现 T021.8 far（m15+c1769+cul216 tInst 0）。预热同步改 spawn-at-target（~2s/步）。
//   mid 搜索沿 T021.8 尝试序列 [240,210,180,260,300,160,140]（tInst>20 为准，1200ms/attempt，
//   选定后补沉降门再采样）。
// shadow A/B（T024.5 简报指定最重机位 nearClose@150；T021.8 §九方法）：
//   place → view(150) → 沉降门 → setSunShadow(false)→1500ms→sampleFrames(4000)
//   → setSunShadow(true)→1500ms→sampleFrames(4000)；成本比 = (off−on)/off
//   （fps 口径；与帧时口径 (on−off)ms/on 代数恒等）。
// 预算四线（representation-runtime.md §九 021.8 重锁）：DC ≤1500 ｜ frame p95 ≤10ms ｜
//   tri ≤12M ｜ shadow cost ≤15%。判定锚按 §九：DC/p95 @真近、tri @中景过渡带
//   （tri@真近另行记档——T021.8 复测同机位 17.8M 为既有基线非本档新回归）。
// console：cdp.mjs 自标签页创建起 Runtime+Log 域全程收集；DC>650 观测告警按 T021.8
//   README 异常记档 8 先例归类为已知产品观测噪声（非缺陷），单独分类不上「未预期噪声」。
// 用法：node cdp.mjs perf-mixed.mjs > logs/perf-mixed-raw.json（先拉起 5173 dev server + 9333 Chrome）

const ASSETS_13 = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
  'asset_tree_salix',
];
const PRESETS_2 = ['default', 'autumn'];
/** §九 021.8 重锁预算四线（真相源 docs/procedural-assets/representation-runtime.md） */
const BUDGET = { drawCalls: 1500, frameP95Ms: 10, triangles: 12_000_000, shadowCostRatio: 0.15 };
/** 常绿 default 单卡（声明面归一——T024.3 裁定，asset 文件 presets 字段核实） */
const EVERGREEN_SINGLE_CARD = ['asset_tree_camphor', 'asset_tree_ligustrum'];

const PLACE_JS = `{ count: 2000, seedBase: 1, spacing: 10, jitter: true, assetIds: ${JSON.stringify(ASSETS_13)}, presets: ${JSON.stringify(PRESETS_2)} }`;

export default async ({ navigate, setViewport, evalJs, sleep, consoleLogs }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  // T021.8 复测同款前导：卸 demo 树 + Tab 进 pure3d（canvas 1920×1048）
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);

  const run = (expression) => evalJs(expression);
  const log = { protocol: 'v4-warmup-spawn-target-clean-settle-gate' };

  // 就绪等待：__tree3aPerf 可用（500ms 步进，上限 20s——024.5 截帧协议同款）
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (await run(`typeof window.__tree3aPerf === 'object' && window.__tree3aPerf !== null`)) { ready = true; break; }
    await sleep(500);
  }
  if (!ready) throw new Error('__tree3aPerf 20s 未就绪');

  // ── env（GPU / viewport / DPR / canvas / pure3d 金丝雀口径，T021.8 同面）──
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
  if (!log.env.pure3d) throw new Error('pure3d 未激活（金丝雀失败——Tab 未进入纯 3D 模式），弃用本会话');

  /** 沉降门片段（页内 IIFE）：(DC,tri,tInst,dual) 连续 3 读 ×500ms 稳定（上限 60s）。
   *  requireClean=true（warmup/near/far/shadowAB 用）：稳定读数还须 tInst==0 ∧ dual==0——
   *  防 pending-source 假沉降（v2 首跑实测：独立会话首配置源未预热，196 枚待转对象
   *  sourceReady=false 账目冻结 ≥2s，gate 误判 settled，nearClose 采到 h76+m810+c1114
   *  过渡中态而非 T021.8 沉降态 h107+m684+c1209；同会话末配置源热后同机位 tInst==0）。
   *  mid 档 requireClean=false：过渡带稳态本就持续双提交（T021.8 mid@180 dual85 稳态）。 */
  const settleGateJs = (requireClean) => `(async () => {
    const p = window.__tree3aPerf, requireClean = ${requireClean};
    let last = null, stable = 0, polls = 0;
    const trace = [];
    for (;;) {
      await new Promise(r => setTimeout(r, 500));
      const s = p.stats(), d = p.distribution();
      const clean = !requireClean || (d.transition.instances === 0 && d.transition.dualSubmitBuckets === 0);
      const key = JSON.stringify([s.drawCalls, s.triangles, d.transition.instances, d.transition.dualSubmitBuckets]);
      polls++;
      if (polls <= 8) trace.push({ t: polls * 500, dc: s.drawCalls, tri: s.triangles, tInst: d.transition.instances, dual: d.transition.dualSubmitBuckets });
      if (key === last && clean) { stable++; if (stable >= 3) return { settled: true, clean, polls, settleMs: polls * 500, trace, endStats: s, endTInst: d.transition.instances }; }
      else { stable = 0; last = key; }
      if (polls > 120) return { settled: false, clean, polls, settleMs: polls * 500, trace, endStats: s, endTInst: d.transition.instances };
    }
  })()`;

  // ── 源预热（T021.8 同位等价：T021.8 mixed 三机位在 tiers 12 配置之后跑，13×3 表示源
  //  已全量热；本会话独立拉起，不预热则首配置撞 pending-source 假沉降——v2 首跑实测）。
  //  v4：预热改 spawn-at-target（view 先行 → place），449 建 canopy 源 → 150 建 high/mid
  //  源，各等 clean 门即收（~2s/步）——不走跨距级联（当前构建 →culled fade-out 冻结，
  //  见 probe-fadeout.json；v3 预热两级联门各撞 60s 超时且留下冻结对象，由后续 place 清除）。──
  log.warmup = {};
  await run(`window.__tree3aPerf.view({ distance: 449 })`);
  log.warmup.farPlaceAccepted = await run(`window.__tree3aPerf.place(${PLACE_JS})`);
  if (!log.warmup.farPlaceAccepted) throw new Error('warmup far place 返回 false');
  log.warmup.far = await run(settleGateJs(true));
  await run(`window.__tree3aPerf.view({ distance: 150 })`);
  log.warmup.nearPlaceAccepted = await run(`window.__tree3aPerf.place(${PLACE_JS})`);
  if (!log.warmup.nearPlaceAccepted) throw new Error('warmup near place 返回 false');
  log.warmup.near = await run(settleGateJs(true));
  console.log('[perf-mixed] warmup far settled=' + log.warmup.far.settled + '/' + log.warmup.far.settleMs + 'ms tInst=' + log.warmup.far.endTInst
    + ' | near settled=' + log.warmup.near.settled + '/' + log.warmup.near.settleMs + 'ms tInst=' + log.warmup.near.endTInst);

  /** 单配置（T021.8 sampleConfig 语义 + clean 沉降门）：place → view 紧邻 → 门 → sample(5000) → stats+dist */
  const sampleConfig = async (viewJs) => {
    const placed = await run(`window.__tree3aPerf.place(${PLACE_JS})`);
    if (!placed) throw new Error('place 返回 false（命令批失败）');
    await run(`window.__tree3aPerf.view(${viewJs})`);
    const settle = await run(settleGateJs(true));
    const r = await run(`(async () => {
      const p = window.__tree3aPerf;
      const sample = await p.sampleFrames(5000);
      return { sample, stats: p.stats(), distribution: p.distribution() };
    })()`);
    return { view: viewJs, placeAccepted: placed, settle, ...r };
  };

  // ── 机位 1：真近 nearClose@150（DC/p95 锚；T021.8 复测 D150 同位先采）──
  log.nearClose150 = await sampleConfig(`{ distance: 150 }`);
  if (log.nearClose150.stats.objects !== 2000) throw new Error('池未就绪：objects=' + log.nearClose150.stats.objects + ' ≠ 2000');
  console.log('[perf-mixed] nearClose@150 fps=' + log.nearClose150.sample.fps.toFixed(1)
    + ' dc=' + log.nearClose150.stats.drawCalls + ' tri=' + log.nearClose150.stats.triangles
    + ' settle=' + JSON.stringify(log.nearClose150.settle.settled) + '/' + log.nearClose150.settle.settleMs + 'ms');

  // ── 机位 2：far@449（spawn-at-target：view 先行 → place——T021.8 far 有效语义：其 far
  //  配置 place 时相机已在 449，对象首选档即沉降态无级联；沉降态逐实例复现 T021.8 far
  //  m15+c1769+cul216 tInst 0，probe-fadeout.json C 实证。跨距级联路径在当前构建存在
  //  →culled fade-out 永久冻结（单卡双卡皆冻结，卡无关——probe A/B），冻结台不是沉降态
  //  不可采；该行为差异另列 README 发现节报主代理裁决。）──
  log.far449 = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.view({ distance: 449 });
    const placed = p.place(${PLACE_JS});
    if (!placed) return { error: 'place failed' };
    let last = null, stable = 0, polls = 0, clean = false;
    for (;;) {
      await new Promise(r => setTimeout(r, 500));
      const s = p.stats(), d = p.distribution();
      clean = d.transition.instances === 0 && d.transition.dualSubmitBuckets === 0;
      const key = JSON.stringify([s.drawCalls, s.triangles, d.transition.instances, d.transition.dualSubmitBuckets]);
      polls++;
      if (key === last && clean) { stable++; if (stable >= 3) break; } else { stable = 0; last = key; }
      if (polls > 120) break;
    }
    const sample = await p.sampleFrames(5000);
    return {
      view: { distance: 449, order: 'view-then-place (spawn-at-target, T021.8 far 有效语义)' },
      placeAccepted: placed,
      settle: { settled: clean, cleanGate: true, polls, settleMs: polls * 500 },
      sample, stats: p.stats(), distribution: p.distribution(),
    };
  })()`);
  console.log('[perf-mixed] far@449 fps=' + log.far449.sample.fps.toFixed(1)
    + ' dc=' + log.far449.stats.drawCalls + ' settle=' + JSON.stringify(log.far449.settle.settled));

  // ── 机位 3：mid 过渡带搜索（T021.8 尝试序列，tInst>20 为准；选定后补沉降门）──
  log.mid = await run(`(async () => {
    const p = window.__tree3aPerf;
    const placed = p.place(${PLACE_JS});
    if (!placed) return { error: 'place failed' };
    const attempts = [];
    for (const d of [240, 210, 180, 260, 300, 160, 140]) {
      p.view({ distance: d });
      await new Promise(r => setTimeout(r, 1200));
      const dist = p.distribution();
      attempts.push({ distance: d, transitionInstances: dist.transitionInstances, instances: { ...dist.instances }, transition: { ...dist.transition } });
      if (dist.transitionInstances > 20) {
        // 选定后补沉降门（稳定性而非 tInst==0——过渡带稳态可持续带内双提交）
        let last = null, stable = 0, polls = 0, settled = false;
        for (;;) {
          await new Promise(r => setTimeout(r, 500));
          const s = p.stats(), dd = p.distribution();
          const key = JSON.stringify([s.drawCalls, s.triangles, dd.transition.instances, dd.transition.dualSubmitBuckets]);
          polls++;
          if (key === last) { stable++; if (stable >= 3) { settled = true; break; } } else { stable = 0; last = key; }
          if (polls > 120) break;
        }
        const sample = await p.sampleFrames(5000);
        return { chosen: d, attempts, settleGate: { settled, polls, settleMs: polls * 500 }, view: { distance: d }, sample, stats: p.stats(), distribution: p.distribution() };
      }
    }
    return { chosen: null, attempts };
  })()`);
  console.log('[perf-mixed] mid@' + log.mid.chosen + ' fps=' + (log.mid.sample ? log.mid.sample.fps.toFixed(1) : 'n/a'));

  // ── shadow A/B @ 最重机位 nearClose@150（T021.8 §九方法 + 沉降门 + 前后一致性 sanity）──
  log.shadowAB = await run(`(async () => {
    const p = window.__tree3aPerf;
    const placed = p.place(${PLACE_JS});
    if (!placed) return { error: 'place failed' };
    p.view({ distance: 150 });
    // 沉降门（同 sampleConfig，clean 口径：150m 无过渡带稳态，tInst==0 为沉降必要条件）
    let last = null, stable = 0, polls = 0;
    for (;;) {
      await new Promise(r => setTimeout(r, 500));
      const s = p.stats(), d = p.distribution();
      const clean = d.transition.instances === 0 && d.transition.dualSubmitBuckets === 0;
      const key = JSON.stringify([s.drawCalls, s.triangles, d.transition.instances, d.transition.dualSubmitBuckets]);
      polls++;
      if (key === last && clean) { stable++; if (stable >= 3) break; } else { stable = 0; last = key; }
      if (polls > 120) break;
    }
    const pre = { stats: p.stats(), distribution: p.distribution(), programs: p.stats().programs };
    p.setSunShadow(false);
    await new Promise(r => setTimeout(r, 1500));
    const off = await p.sampleFrames(4000);
    p.setSunShadow(true);
    await new Promise(r => setTimeout(r, 1500));
    const on = await p.sampleFrames(4000);
    const post = { programs: p.stats().programs };
    return {
      camera: { distance: 150 },
      settle: { polls, settleMs: polls * 500 },
      pre, off, on, post,
      costRatio: (off.fps - on.fps) / off.fps,
    };
  })()`);
  console.log('[perf-mixed] shadowAB costRatio=' + (log.shadowAB.costRatio * 100).toFixed(1) + '%'
    + ' (off ' + log.shadowAB.off.fps.toFixed(1) + ' / on ' + log.shadowAB.on.fps.toFixed(1) + ')');

  // ── 清场 ──
  await run(`window.__tree3aPerf.clear()`);

  // ── 有效桶点账（place 语义静态推演：asset = i%13、card = i%2；常绿 autumn → default 归一）──
  const perCombo = {};
  for (let i = 0; i < 2000; i++) {
    const asset = ASSETS_13[i % 13];
    let card = PRESETS_2[i % 2];
    if (EVERGREEN_SINGLE_CARD.includes(asset) && card === 'autumn') card = 'default'; // 声明面归一
    const k = asset + '::' + card;
    perCombo[k] = (perCombo[k] ?? 0) + 1;
  }
  log.validBuckets = {
    declaredCombos: ASSETS_13.length * PRESETS_2.length,
    effectiveBuckets: Object.keys(perCombo).length,
    note: 'camphor/ligustrum 常绿 default 单卡（T024.3 裁定），autumn 请求声明面归一 default → 26 声明 − 2 归一 = 24 有效桶',
    perCombo,
  };

  // ── 四线判定（§九锚：DC/p95 @真近、tri @中景过渡带、shadow @A/B）──
  const dcMeasured = log.nearClose150.stats.drawCalls;
  const p95Measured = log.nearClose150.sample.p95;
  const triMeasuredAnchor = log.mid.chosen !== null ? log.mid.stats.triangles : null;
  const shadowMeasured = log.shadowAB.costRatio;
  log.verdict = {
    budgetSource: 'docs/procedural-assets/representation-runtime.md §九（021.8 重锁）',
    lines: {
      drawCalls: { budget: BUDGET.drawCalls, measured: dcMeasured, anchor: '真近 nearClose@150', pass: dcMeasured <= BUDGET.drawCalls },
      frameP95: { budget: BUDGET.frameP95Ms, measured: p95Measured, anchor: '真近 nearClose@150', pass: p95Measured <= BUDGET.frameP95Ms },
      triangles: { budget: BUDGET.triangles, measured: triMeasuredAnchor, anchor: '中景过渡带 mid@' + log.mid.chosen, pass: triMeasuredAnchor !== null && triMeasuredAnchor <= BUDGET.triangles },
      shadowCost: { budget: BUDGET.shadowCostRatio, measured: shadowMeasured, anchor: '真近 nearClose@150 A/B（简报指定最重机位；§九方法）', pass: shadowMeasured <= BUDGET.shadowCostRatio },
    },
    memo: {
      trianglesAtNearClose: { measured: log.nearClose150.stats.triangles, note: '§九 tri 锚 = 中景过渡带（T021.8 复测真近 17.8M 为既有基线）；真近读数记档不判线' },
    },
    allPass: dcMeasured <= BUDGET.drawCalls && p95Measured <= BUDGET.frameP95Ms
      && triMeasuredAnchor !== null && triMeasuredAnchor <= BUDGET.triangles
      && shadowMeasured <= BUDGET.shadowCostRatio,
  };

  // ── console 判据（未预期 = 全部条目去掉已知 DC 观测告警后应为空）──
  const logs = consoleLogs();
  const KNOWN_DC_WARN = /draw.?call/i;
  log.consoleSummary = {
    total: logs.length,
    unexpected: logs.filter((s) => !KNOWN_DC_WARN.test(s)),
    knownDcObservation: logs.filter((s) => KNOWN_DC_WARN.test(s)),
    note: 'DC>650 legacy 观测告警 = T021.8 README 异常记档 8 先例（产品观测噪声非缺陷）；未预期条目应为空',
  };
  return log;
};
