export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5173');
  return evalJs(`(() => {
    const c = document.querySelector('canvas');
    const r = c.getBoundingClientRect();
    return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, dpr: window.devicePixelRatio, vw: [innerWidth, innerHeight] };
  })()`);
};
