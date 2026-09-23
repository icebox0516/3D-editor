// T018.1 验证帧拼图截图：file:// montage-src.html → montage-verify.png（2 列网格 1920 宽）
export default async ({ navigate, setViewport, screenshot, sleep }) => {
  await setViewport(1920, 2050);
  await navigate('file:///D:/3D-editor/docs/acceptance/t018/018.1/tools/montage-src.html');
  await sleep(2500);
  await screenshot('docs/acceptance/t018/018.1/montage-verify.png');
  return 'shot ok';
};
