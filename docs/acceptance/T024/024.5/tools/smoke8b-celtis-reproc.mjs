// T024.5 冒烟用例 5（修复后沉降像素抽查 / 回归哨兵）：place asset_tree_celtis
// 无 preset（Step-2 shot-regression 同参数）→ freezeTime(2.5) → M25 截帧 →
// 与 regression-default/current/asset_tree_celtis.png 逐位比对（运行时 fade-out
// 修复不得改变沉降态渲染）。
// 用法：node cdp.mjs smoke8-celtis-sentinel.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, ensureBrowserCollapsed, shootFrame,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const layout = await ensureBrowserCollapsed(evalJs, sleep);
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');

  const placeOk = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_tree_celtis', count: 1, seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(M25_VIEW);
  const frameI = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameI2-celtis-reproc.png`, { wantHandleObjects: 1 });

  return {
    layout, placeOk: placeOk === true, frameI };
};
