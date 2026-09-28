// 拼图截图：file:// montage-src.html → contact-sheet-13.png（全页 captureBeyondViewport）
export default async ({ navigate, setViewport, screenshot, sleep }) => {
  await setViewport(1920, 1180);
  await navigate('file:///D:/3D-editor/docs/acceptance/T024/024.3/tools/montage-src.html');
  await sleep(2500);
  await screenshot('docs/acceptance/T024/024.3/contact-sheet-13.png', { fullPage: true });
  return 'shot ok';
};
