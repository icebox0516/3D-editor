// T006.3 放置链 culled 补充取证 —— 900m 恰在夏栎（r≈7m@fov50）culled 线下，
// 补 1100m 超远裁剪 + 300m 回视恢复序列（产品放置路径同参复放）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  const log = {};
  const view = (distance) =>
    `window.__tree3aPerf.view(${JSON.stringify({ distance, azimuthDeg: 35, elevationDeg: 12 })})`;
  const stats = () => evalJs('window.__tree3aPerf.stats()');
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(600);
  await evalJs('window.__tree3a.freezeTime()');
  await evalJs('window.__tree3aPerf.place({ count: 9, spacing: 11, jitter: false })');
  await sleep(1000);

  const step = async (name, distance) => {
    await evalJs(view(distance));
    await sleep(900);
    const s = await stats();
    await screenshot(`docs/acceptance/t006/006.3/screenshots/placement-${name}.png`);
    log[name] = { distance, triangles: s.triangles, drawCalls: s.drawCalls, objects: s.objects };
  };
  await step('culled-far-1100m', 1100); // m ≈ (1100/7)×0.4663 ≈ 73 > 60 → 超远裁剪
  await step('culled-back-300m', 300); // 回视恢复（升档越过 60×0.85 线）
  await evalJs('window.__tree3aPerf.clear()');
  return log;
};
