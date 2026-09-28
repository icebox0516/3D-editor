// T024.5 冒烟用例 4 前半（存量场景保存侧）：place ginkgo 无 preset → M25 帧G →
// 另存模板 t0245-smoke-plain → 断言 objects[0].asset 无 preset 键（默认卡省略不落盘）。
// 用法：node cdp.mjs smoke6-plain-save.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, ensureBrowserCollapsed, shootFrame, saveTemplateVia,
  readTemplatesRaw, templateEntryAssertions,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const layout = await ensureBrowserCollapsed(evalJs, sleep);
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');

  const placeOk = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_tree_ginkgo', count: 1, seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(M25_VIEW);
  const frameG = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameG-plain-save.png`, { wantHandleObjects: 1 });

  const save = await saveTemplateVia(evalJs, sleep, 't0245-smoke-plain');
  const entries = await readTemplatesRaw(evalJs);
  const assertions = templateEntryAssertions(entries ?? [], 't0245-smoke-plain');

  return {
    layout,
    placeOk: placeOk === true,
    frameG, save,
    templateNames: (entries ?? []).map((e) => e.name),
    assertions,
    assertNoPresetKey: assertions.hasPresetKey === false,
  };
};
