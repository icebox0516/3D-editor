// T024.5 冒烟用例 2 后半（重载应用侧）：刷新 → freezeTime(2.5) → 应用模板
// t0245-smoke-card（文件 → 新建场景 ▾ 子菜单产品路径）→ 场景对象数===1（状态栏
// Objects 读数——openScene 重生成 id，句柄账目不跟踪，账目读数另记档）→ M25 帧E
// （须与帧D 逐位相同：重载后带卡渲染保真）。
// 用法：node cdp.mjs smoke3-apply-carded.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, ensureBrowserCollapsed, shootFrame, applyTemplateVia, handleStats,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const layout = await ensureBrowserCollapsed(evalJs, sleep);
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');

  const apply = await applyTemplateVia(evalJs, sleep, 't0245-smoke-card');
  const statsAfterApply = await handleStats(evalJs); // 句柄账目预期 0（id 重生成）——记档

  await evalJs(M25_VIEW);
  const frameE = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameE-reload-apply-carded.png`, { wantSceneObjects: 1 });

  return {
    layout,
    apply,
    statsAfterApply,
    handleObjectsAfterApply: statsAfterApply.objects,
    sceneObjectsAtE: frameE.sceneObjects,
    frameE,
  };
};
