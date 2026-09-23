// T018.0 补充：legacy 预设切换资源增长探针——10 轮 day→dusk 循环观察 renderer.info
// 计数趋势（改前事实：若线性增长即 legacy 每次重建泄漏，新实现验收项 4 的「无增长」
// 对照面）。空场景态。
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2000);
  const marks = [];
  for (let i = 0; i < 10; i++) {
    await evalJs(`window.__envProbe.setPreset(i % 2 ? 'dusk' : 'day')`.replace('i % 2', String(i % 2)));
    await sleep(400);
    marks.push(await evalJs(`(() => { const x = window.__envProbe.info(); return { geo: x.memory.geometries, tex: x.memory.textures, prog: x.programs }; })()`));
  }
  return { marks };
};
