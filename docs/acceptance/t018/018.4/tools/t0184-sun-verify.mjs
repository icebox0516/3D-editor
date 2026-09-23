// T018.4 太阳角三一致疑点复核：新 tab 从干净 day 开始——受控机位下
// setSunAngles(8,240) 立即/延迟双帧 + uniforms/灯位读数（判定判读幻觉 vs 渲染未生效）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, enableConsole }) => {
  await enableConsole();
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const log = {};

  await evalJs(`window.__tree3aPerf.place({ count: 1, seedBase: 7, spacing: 11, jitter: false, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({ distance: 15, azimuthDeg: 30, elevationDeg: 9 })`);
  await evalJs(`window.__tree3a.freezeTime()`);
  await sleep(900);

  log.before = await evalJs(`(() => {
    let sunLightPos = null, skySun = null;
    window.__envProbe.scene.traverse((n) => {
      if (n.isDirectionalLight && n.castShadow) sunLightPos = { x: n.position.x, y: n.position.y, z: n.position.z };
      if (n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition && n.material.uniforms.uDisplayIntensity) {
        const p = n.material.uniforms.sunPosition.value;
        skySun = { x: p.x, y: p.y, z: p.z };
      }
    });
    return { sun: window.__sky.params().sun, sunLightPos, skySun };
  })()`);
  await screenshot('../sun-verify-day-baseline.png');

  // setSunAngles → 立即读数 + 立即截帧（displaySky sunPosition 应已更新——零延迟路径）
  log.afterImmediate = await evalJs(`(() => {
    window.__sky.setSunAngles(8, 240);
    let sunLightPos = null, skySun = null;
    window.__envProbe.scene.traverse((n) => {
      if (n.isDirectionalLight && n.castShadow) sunLightPos = { x: n.position.x, y: n.position.y, z: n.position.z };
      if (n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition && n.material.uniforms.uDisplayIntensity) {
        const p = n.material.uniforms.sunPosition.value;
        skySun = { x: p.x, y: p.y, z: p.z };
      }
    });
    return { sun: window.__sky.params().sun, sunLightPos, skySun, stats: window.__sky.pmremStats() };
  })()`);
  await screenshot('../sun-verify-immediate.png');
  await sleep(450); // debounce 重烘落地
  log.afterSettled = await evalJs(`window.__sky.pmremStats()`);
  await screenshot('../sun-verify-settled.png');

  return { log };
};
