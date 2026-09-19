// T006.3 放置链换档取证 —— 产品放置路径（__tree3aPerf.place 真实命令管线 →
// InstancedAssetPool source×level 桶），固定风相位，近→远→近穿越阈值带序列 +
// 带内静止防抖 + 换档点前后帧（LOD on/off 同机位对照，D27.13）。
// 用法：node cdp.mjs placement-evidence.mjs（cwd = 仓库根）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  const log = { steps: [], holds: [], switchAB: {} };
  const URL_ON = 'http://localhost:5173';
  const view = (distance, elevationDeg = 12) =>
    `window.__tree3aPerf.view(${JSON.stringify({ distance, azimuthDeg: 35, elevationDeg })})`;
  const stats = () => evalJs('window.__tree3aPerf.stats()');

  await navigate(URL_ON);
  await setViewport(1920, 1080);
  await sleep(600);
  // 金丝雀式核对：canvas 尺寸 ≈ 主视口（错绑小地图即弃用——本取证直接整页截图，
  // 此处记录 canvas 实际布局尺寸供 README 记档）
  log.canvas = await evalJs(
    `(() => { const c = document.querySelector('canvas'); return c ? { w: c.clientWidth, h: c.clientHeight } : null; })()`,
  );
  await evalJs('window.__tree3a.freezeTime()'); // 冻结全局风时钟（像素等同判定前提）
  // 产品放置路径 9 棵夏栎（jitter:false → transform 确定性，跨页重载可复现同画面）
  log.place = await evalJs('window.__tree3aPerf.place({ count: 9, spacing: 11, jitter: false })');
  await sleep(1000);

  const step = async (name, distance) => {
    await evalJs(view(distance));
    await sleep(750); // 连续渲染数帧：帧内 LOD 评估 + 冷源微任务迁移落地
    const s = await stats();
    await screenshot(`docs/acceptance/t006/006.3/screenshots/placement-${name}.png`);
    log.steps.push({ name, distance, triangles: s.triangles, drawCalls: s.drawCalls, geometries: s.geometries });
  };

  // ── 近 → 远穿越 high|mid / mid|low / low|culled 阈值带 ──
  for (const d of [20, 40, 55, 62, 66, 72, 90, 120, 150, 165, 175, 200, 260, 350, 500, 750, 900]) {
    await step(`far-${d}m`, d);
  }
  // ── 远 → 近回程（迟滞：回档距离应显著更近；culled 恢复可见）──
  for (const d of [750, 500, 350, 260, 200, 170, 150, 120, 90, 70, 62, 55, 45, 30, 20]) {
    await step(`back-${d}m`, d);
  }

  // ── 带内静止防抖：停在首个降档名义线 ×0.93（迟滞带内），连拍 4 帧 ──
  const base = log.steps[0].triangles; // 20m 全 high 参考
  const dropStep = log.steps.find((s) => s.name.startsWith('far-') && s.triangles < base * 0.7);
  const nominalD = dropStep ? dropStep.distance : 66;
  log.band = { baseTriangles: base, nominalD };
  await evalJs(view(nominalD * 0.93));
  await sleep(900);
  for (let i = 1; i <= 4; i++) {
    const s = await stats();
    await screenshot(`docs/acceptance/t006/006.3/screenshots/placement-hold-${i}.png`);
    log.holds.push({ frame: i, triangles: s.triangles, drawCalls: s.drawCalls });
    await sleep(350);
  }

  // ── 换档点前后帧 + 总开关对照（D27.13）：mid 带机位，on（mid）vs off（全 High）──
  await evalJs(view(150));
  await sleep(900);
  log.switchAB.on = await stats();
  await screenshot('docs/acceptance/t006/006.3/screenshots/placement-switch-on-mid-150m.png');

  await navigate(`${URL_ON}/?lod=off`);
  await setViewport(1920, 1080);
  await sleep(600);
  await evalJs('window.__tree3a.freezeTime()');
  await evalJs('window.__tree3aPerf.place({ count: 9, spacing: 11, jitter: false })');
  await sleep(1000);
  await evalJs(view(150));
  await sleep(900);
  log.switchAB.off = await stats();
  await screenshot('docs/acceptance/t006/006.3/screenshots/placement-switch-off-high-150m.png');
  log.switchAB.offUrlLodQuery = '?lod=off';

  // off 状态下超远不裁剪（culled 旁路）：900m 仍全 High 渲染
  await evalJs(view(900));
  await sleep(900);
  log.switchAB.offFar = await stats();
  await screenshot('docs/acceptance/t006/006.3/screenshots/placement-switch-off-far-900m.png');

  await evalJs('window.__tree3aPerf.clear()');
  return log;
};
