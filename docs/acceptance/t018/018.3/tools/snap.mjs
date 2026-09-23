export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await sleep(600);
  await screenshot('../hemi-extreme-red.png');
  const cleaned = await evalJs(`(() => { if (window.__extremeHemi) { window.__extremeHemi.removeFromParent(); } return 'ok'; })()`);
  return { cleaned };
};
