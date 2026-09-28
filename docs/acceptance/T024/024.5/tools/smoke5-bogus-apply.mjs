// T024.5 冒烟用例 3（已删卡 id 宽容回退）：刷新 → freezeTime(2.5) → 应用
// t0245-smoke-bogus（objects[0].asset.preset='no_such_card'）→ 不崩溃、console
// 零错误零警告（驱动器全程收集）→ 场景对象数===1 → M25 帧F（须与默认卡参照帧
// 逐位相同：读侧宽容归一 default 渲染）。
// 用法：node cdp.mjs smoke5-bogus-apply.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, ensureBrowserCollapsed, shootFrame, applyTemplateVia, handleStats,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const layout = await ensureBrowserCollapsed(evalJs, sleep);
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');

  const apply = await applyTemplateVia(evalJs, sleep, 't0245-smoke-bogus');
  const statsAfterApply = await handleStats(evalJs);

  // 不崩溃面：文档可交互 + 渲染循环存活（canvas 仍在上帧）+ toast 无 error 类
  const alive = JSON.parse(await evalJs(`JSON.stringify((() => {
    const canvas = document.querySelector('canvas.ed-viewport__canvas');
    const errToast = [...document.querySelectorAll('.ed-toast--error__text, .ed-toast.ed-toast--error')].length;
    return { hasCanvas: !!canvas, errorToasts: errToast };
  })())`));

  await evalJs(M25_VIEW);
  const frameF = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameF-bogus-fallback.png`, { wantSceneObjects: 1 });

  return {
    layout,
    apply, alive, statsAfterApply,
    sceneObjectsAtF: frameF.sceneObjects,
    frameF,
  };
};
