// T011.1 收尾补充：宽幅 8 槽全景（修正右缘裁切）+ 低位背阴方位树皮（苔痕复核）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__celtis.mountSlots()');
  await evalJs('window.__celtis.freezeTime()');
  await evalJs('window.__celtis.viewSlots({ distance: 50, azimuthDeg: 35, elevationDeg: 16 })');
  await sleep(700);
  await screenshot('screenshots/t011-0111/slots-panorama-50m-wide.png');
  await evalJs('window.__celtis.unmount()');
  await evalJs('window.__celtis.mount()');
  await evalJs('window.__celtis.freezeTime()');
  await evalJs('window.__celtis.view({ distance: 3.2, azimuthDeg: 215, elevationDeg: -22 })');
  await sleep(500);
  await screenshot('screenshots/t011-0111/bark-low-shaded-3p2m-az215.png');
  await evalJs('window.__celtis.unmount()');
  return { done: true };
};
