// T011.13 族级验收门性能主测量（vsync 关闭口径——SOP §4 全流程 × 13 资产）
// 13 资产（夏栎基线 + 12 成员）× 档位 1/20/100/500/1000；帧采样 5000ms；
// 资源契约五条（3 代表成员）；Shadow A/B（1 代表成员）；与夏栎 009.7 基线同量级判读。
// 前置：__tree3aPerf.place 已支持 assetId 可选参数（T011.13 泛化，缺省夏栎逐位不变）。
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');

  const run = (expression) => evalJs(expression);
  const log = {};

  log.env = await run(`(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      disjointTimerAvailable: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
      viewport: [window.innerWidth, window.innerHeight],
      dpr: window.devicePixelRatio,
    };
  })()`);

  // 基线（空场景）
  log.baseline = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.clear();
    await new Promise(r => setTimeout(r, 500));
    const s = await p.sampleFrames(3000);
    return { sample: s, stats: p.stats() };
  })()`);

  // ── 13 资产 × 5 档（幂等 place：每档自动清上批；assetId 逐资产）──
  const assets = [
    'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
    'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
    'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
    'asset_tree_salix',
  ];
  const tiers = [
    { count: 1, spacing: 11 },
    { count: 20, spacing: 11 },
    { count: 100, spacing: 11 },
    { count: 500, spacing: 11 },
    { count: 1000, spacing: 10 }, // 320m 见方 ⊂ shadow camera ±160m
  ];
  log.perAsset = [];
  for (const assetId of assets) {
    const rows = [];
    for (const tier of tiers) {
      const r = await run(`(async () => {
        const p = window.__tree3aPerf;
        p.place({ count: ${tier.count}, seedBase: 1, spacing: ${tier.spacing}, jitter: true, assetId: '${assetId}' });
        p.view({});
        await new Promise(r => setTimeout(r, 1200));
        const s = await p.sampleFrames(5000);
        return { count: ${tier.count}, sample: s, stats: p.stats() };
      })()`);
      rows.push(r);
    }
    log.perAsset.push({ assetId, tiers: rows });
    console.log(`[perf] ${assetId} done`);
  }

  // ── 资源契约五条（代表成员：celtis 最大 High / sophora 最大 Mid / salix 最小 Low + 垂帘）──
  log.resourceContract = {};
  for (const assetId of ['asset_tree_celtis', 'asset_tree_sophora', 'asset_tree_salix']) {
    // 条 2/3：大数量 InstancedMesh 路径——drawCalls 恒定不随棵数涨（20 vs 500 vs 1000）
    log.resourceContract[assetId] = await run(`(async () => {
      const p = window.__tree3aPerf;
      const draws = [];
      for (const count of [20, 500, 1000]) {
        p.place({ count, seedBase: 1, spacing: 10, jitter: true, assetId: '${assetId}' });
        p.view({});
        await new Promise(r => setTimeout(r, 1000));
        draws.push({ count, drawCalls: p.stats().drawCalls, geometries: p.stats().geometries });
      }
      // 条 4：clear 后无残留
      const cleared = p.clear();
      await new Promise(r => setTimeout(r, 800));
      const afterClear = p.stats();
      // 条 5：连续 10 次放置/删除无持续增长（100 棵档）
      const marks = [];
      for (let i = 0; i < 10; i++) {
        p.place({ count: 100, seedBase: 1, spacing: 11, jitter: true, assetId: '${assetId}' });
        await new Promise(r => setTimeout(r, 350));
        const mid = p.stats();
        p.clear();
        await new Promise(r => setTimeout(r, 250));
        marks.push({ drawCalls: mid.drawCalls, geometries: mid.geometries, textures: mid.textures, programs: mid.programs, objects: mid.objects });
      }
      const first = marks[0], last = marks[marks.length - 1];
      return { draws, cleared, afterClearObjects: afterClear.objects, cycles10: { first, last, stable: JSON.stringify([first.geometries, first.textures, first.programs]) === JSON.stringify([last.geometries, last.textures, last.programs]) } };
    })()`);
    console.log(`[contract] ${assetId} done`);
  }

  // ── Shadow A/B（代表成员 celtis 1000 棵——其余沿 009.7 口径记档）──
  log.shadowAB = await run(`(async () => {
    const p = window.__tree3aPerf;
    p.place({ count: 1000, seedBase: 1, spacing: 10, jitter: true, assetId: 'asset_tree_celtis' });
    p.view({});
    await new Promise(r => setTimeout(r, 1200));
    p.setSunShadow(false);
    await new Promise(r => setTimeout(r, 1500));
    const off = await p.sampleFrames(4000);
    p.setSunShadow(true);
    await new Promise(r => setTimeout(r, 1500));
    const on = await p.sampleFrames(4000);
    p.clear();
    return { sunShadowOff: off, sunShadowOn: on };
  })()`);

  // 收尾清场
  await run(`window.__tree3aPerf.clear()`);
  return log;
};
