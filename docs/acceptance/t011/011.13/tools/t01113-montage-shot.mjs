// 拼图截图：file:// montage-src.html → contact-sheet-13.png（4×4 网格 1920 宽）
export default async ({ navigate, setViewport, screenshot, sleep }) => {
  await setViewport(1920, 1180);
  await navigate('file:///D:/3D-editor/docs/acceptance/t011/011.13/tools/montage-src.html');
  await sleep(2500);
  await screenshot('docs/acceptance/t011/011.13/contact-sheet-13.png');
  return 'shot ok';
};
