// DOM 取证：canvas 清单（数量/尺寸/上下文类型/z-index/rect）+ 主视口识别
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  return evalJs(`(() => {
    const canvases = [...document.querySelectorAll('canvas')].map((c) => {
      const r = c.getBoundingClientRect();
      const style = getComputedStyle(c);
      return {
        w: c.width, h: c.height,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        zIndex: style.zIndex, position: style.position, visibility: style.visibility, opacity: style.opacity,
        parentClass: c.parentElement ? c.parentElement.className.toString().slice(0, 60) : null,
      };
    });
    return { canvasCount: canvases.length, canvases };
  })()`);
};
