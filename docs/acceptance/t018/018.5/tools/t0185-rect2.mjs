export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(1500);
  return evalJs(`(() => {
    const c = document.querySelector('canvas');
    const r = c.getBoundingClientRect();
    return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, dpr: window.devicePixelRatio, vw: [innerWidth, innerHeight] };
  })()`);
};
