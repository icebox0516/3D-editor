// T024.5 冒烟用例 2 前半（保存侧）：place ginkgo autumn → M25 帧D →
// UI「另存为模板…」命名 t0245-smoke-card → 解析 localStorage 模板 JSON 断言
// objects[0].asset.preset === 'autumn'（对象级带卡落盘）。
// 用法：node cdp.mjs smoke2-save-carded.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, shootFrame, saveTemplateVia,
  readTemplatesRaw, templateEntryAssertions,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);

  await evalJs('window.__tree3aPerf.freezeTime(2.5)');
  const placeOk = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_tree_ginkgo', count: 1, preset: 'autumn', seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(M25_VIEW);
  const frameD = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameD-template-save.png`, { wantHandleObjects: 1 });

  const save = await saveTemplateVia(evalJs, sleep, 't0245-smoke-card');
  const entries = await readTemplatesRaw(evalJs);
  const assertions = templateEntryAssertions(entries ?? [], 't0245-smoke-card');

  return {
    placeOk: placeOk === true,
    frameD,
    save,
    templateNames: (entries ?? []).map((e) => e.name),
    assertions,
    assertPresetAutumn: assertions.preset === 'autumn',
  };
};
