// 诊断：树是否真的挂进场景 / 相机在哪 / group 包围盒
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5181');
  await setViewport(1920, 1080);
  await sleep(1500);
  const info = await evalJs(`(async () => {
    const h = window.__metasequoia;
    const out = { hasHandle: !!h };
    if (!h) return out;
    h.mount();
    await new Promise(r => setTimeout(r, 300));
    h.freezeTime();
    out.mountOk = true;
    // 句柄内省：从 stats / view 读状态；直接扒 scene（经 renderer 不暴露——尝试常见通道）
    out.stats = typeof h.stats === 'function' ? h.stats() : (h.stats ?? null);
    // 视图后回读 canvas 尺寸
    h.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 });
    await new Promise(r => setTimeout(r, 400));
    const cv = document.querySelector('canvas');
    out.canvas = cv ? [cv.width, cv.height, cv.clientWidth, cv.clientHeight] : null;
    return out;
})()`);
  await screenshot('diag-baseline.png');
  return info;
};
