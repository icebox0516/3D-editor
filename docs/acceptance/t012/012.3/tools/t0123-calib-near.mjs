// T012.3 Step 4 校准轮近景身份检查（M8 绳列/散生冠/果点——卡尺度上调后近景不稀释验证）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5183');
  await setViewport(1920, 1080);
  await evalJs('window.__juniperus.mount()');
  await evalJs('window.__juniperus.freezeTime()');
  await evalJs(`window.__juniperus.view({ distance: 8, azimuthDeg: 35, elevationDeg: 12 })`);
  await sleep(1000);
  await screenshot('calib-near-8m.png');
  const stats = await evalJs('window.__juniperus.stats()');
  await evalJs('window.__juniperus.unmount()');
  return { stats };
};
