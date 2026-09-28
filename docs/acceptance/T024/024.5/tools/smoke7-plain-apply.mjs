// T024.5 冒烟用例 4 后半（存量场景重载应用侧）：刷新 → freezeTime(2.5) → 应用
// t0245-smoke-plain → 场景对象数===1 → M25 帧H（须与帧G 逐位相同）。
// 用法：node cdp.mjs smoke7-plain-apply.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, ensureBrowserCollapsed, shootFrame, applyTemplateVia, handleStats,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const layout = await ensureBrowserCollapsed(evalJs, sleep);
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');

  const apply = await applyTemplateVia(evalJs, sleep, 't0245-smoke-plain');
  const statsAfterApply = await handleStats(evalJs);

  await evalJs(M25_VIEW);
  const frameH = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameH-reload-apply-plain.png`, { wantSceneObjects: 1 });

  return {
    layout,
    apply, statsAfterApply,
    sceneObjectsAtH: frameH.sceneObjects,
    frameH,
  };
};
