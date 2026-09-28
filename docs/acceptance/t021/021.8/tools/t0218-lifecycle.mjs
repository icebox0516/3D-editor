// T021.8 ⑤ 资源生命周期专项（§十四：sourceKey+representation 缓存边界下
// 生成→删除→再生成 ×10 轮，geometry/texture/program 无持续增长；Canopy Source
// 与 Canopy Depth Material 所有权 Source owns / Pool references 同规——renderer.info
// 计数恒定为代理判据）。
// 放置链：混植 13 乔木 count 520（40/种，seed 1..520 覆盖全 8 槽）place→clear ×10；
//   第 3/6/9 轮穿插 far 机位（canopy 表示参与构建——canopy 缓存维度的生命周期面）。
//   每轮记录 place 后与 clear 后双读数（泄漏信号 = clear 后计数逐轮增长）。
// 散布链：3 树种区域 scatter→clear ×5（chunk×asset×rep 桶全拆重建），同口径记录。
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
  const run = (e) => evalJs(e);
  const log = {};

  const readRes = () => run(`(() => {
    const p = window.__tree3aPerf.stats();
    const d = window.__tree3aPerf.distribution();
    return { geo: p.geometries, tex: p.textures, prog: p.programs, dc: p.drawCalls, tri: p.triangles,
      objects: p.objects, inst: { ...d.instances } };
  })()`);

  // ── 放置链 ×10 ──
  log.placement = [];
  for (let round = 1; round <= 10; round++) {
    const farRound = round === 3 || round === 6 || round === 9;
    const viewJs = farRound ? `{ distance: 449 }` : `{ distance: 150 }`;
    await run(`(async () => {
      const p = window.__tree3aPerf;
      p.place({ count: 520, seedBase: 1, spacing: 11, jitter: true, assetIds: ${JSON.stringify(ASSETS_13)} });
      p.view(${viewJs});
    })()`);
    await sleep(farRound ? 2600 : 1800); // 等表示构建/过渡收敛（far 轮 canopy 全量）
    const afterPlace = await readRes();
    await run(`window.__tree3aPerf.clear()`);
    await sleep(700);
    const afterClear = await readRes();
    log.placement.push({ round, farRound, afterPlace, afterClear });
    console.log(`[life] P${round}${farRound ? '(far)' : ''} place: geo=${afterPlace.geo} tex=${afterPlace.tex} prog=${afterPlace.prog} inst=${JSON.stringify(afterPlace.inst)} | clear: geo=${afterClear.geo} tex=${afterClear.tex} prog=${afterClear.prog}`);
  }

  // ── 散布链 ×5 ──
  log.scatter = [];
  for (let round = 1; round <= 5; round++) {
    await run(`window.__scatterSmoke.scatter({
      id: 't0218-life',
      params: {
        polygon: [{ x: -60, y: -45 }, { x: 60, y: -45 }, { x: 60, y: 45 }, { x: -60, y: 45 }],
        densityPerM2: 0.05,
        assets: [
          { assetId: 'asset_tree_3a', weight: 1 },
          { assetId: 'asset_tree_celtis', weight: 1 },
          { assetId: 'asset_tree_camphor', weight: 1 },
        ],
        seed: 20260924 + ${round},
        scaleRange: { min: 0.85, max: 1.15 },
      },
    })`);
    await run(`window.__tree3aPerf.view({ distance: 212 })`); // dither 带——过渡/客座桶参与
    await sleep(1600);
    const afterScatter = await readRes();
    await run(`window.__scatterSmoke.clear()`);
    await sleep(700);
    const afterClear = await readRes();
    log.scatter.push({ round, afterScatter, afterClear });
    console.log(`[life] S${round} scatter: geo=${afterScatter.geo} tex=${afterScatter.tex} prog=${afterScatter.prog} dc=${afterScatter.dc} | clear: geo=${afterClear.geo} tex=${afterClear.tex} prog=${afterClear.prog}`);
  }
  return log;
};
