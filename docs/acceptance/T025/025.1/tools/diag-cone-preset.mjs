// T025.1 诊断探针：锥黄卡链路二分（place 单枚 preset='yellow' 直拍 + 同卡/混卡 drawCalls 对比）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5199');
  await setViewport(1920, 1080);
  await sleep(3000);

  // A. 单枚黄卡（preset 直传，绕开 round-robin）
  await evalJs(`window.__tree3aPerf.place({ assetId: 'asset_trafficcone', count: 1, preset: 'yellow', spacing: 4, jitter: false })`);
  await evalJs(`window.__tree3aPerf.view({ distance: 16, azimuthDeg: 35, elevationDeg: 12 })`);
  await evalJs(`window.__tree3aPerf.freezeTime(25)`);
  await sleep(1000);
  await evalJs(`document.querySelector('canvas').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))`);
  await sleep(900);
  await screenshot('docs/acceptance/T025/025.1/frames/diag-single-yellow.png');

  // B. 同卡双枚（1 桶基线）vs 混卡双枚（2 桶则 drawCalls +1）
  const sameCard = await evalJs(`(() => {
    window.__tree3aPerf.place({ assetId: 'asset_trafficcone', count: 2, presets: ['yellow', 'yellow'], spacing: 1.2, jitter: false });
    return window.__tree3aPerf.stats().drawCalls;
  })()`);
  await sleep(1200);
  const sameCardAfter = await evalJs(`window.__tree3aPerf.stats().drawCalls`);
  const mixedCard = await evalJs(`(() => {
    window.__tree3aPerf.place({ assetId: 'asset_trafficcone', count: 2, presets: ['default', 'yellow'], spacing: 1.2, jitter: false });
    return window.__tree3aPerf.stats().drawCalls;
  })()`);
  await sleep(1200);
  const mixedCardAfter = await evalJs(`window.__tree3aPerf.stats().drawCalls`);
  await screenshot('docs/acceptance/T025/025.1/frames/diag-mixed-after.png');
  await evalJs('window.__tree3aPerf.clear()');
  return { sameCard, sameCardAfter, mixedCard, mixedCardAfter };
};
