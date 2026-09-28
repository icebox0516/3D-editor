// T024.5 冒烟用例 1（handle 路径）：撤销重做带卡。
// place ginkgo autumn → M25 帧A → Ctrl+Z（合成键盘）→ objects===0 帧B →
// Ctrl+Shift+Z 重做 → objects===1 帧C（须与帧A 逐位相同）→ 追加 Ctrl+Y 裁定
// （undo → Ctrl+Y → objects===1）——两快捷键各自生效性记档。
// 会话末预置 t3d-editor.asset-presets（S2 的 UI 路径变体 boot 前存储就位）。
// 用法：node cdp.mjs smoke1-undo-redo.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, shootFrame, waitForHandleObjects,
  undoKeys, redoShiftZKeys, redoYKeys, historyButtons, handleStats,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);

  // 冻结在先（放置期新建材质拿到确定 uTime——shot-regression 同口径）
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');
  const placeOk = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_tree_ginkgo', count: 1, preset: 'autumn', seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(M25_VIEW);

  // ── 帧A：带卡放置态 ──
  const frameA = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameA-place-carded.png`, { wantHandleObjects: 1 });
  const histA = await historyButtons(evalJs);

  // ── Ctrl+Z 撤销 → 帧B（无树）──
  await undoKeys(send);
  const afterUndo = await waitForHandleObjects(evalJs, sleep, 0);
  const histB = await historyButtons(evalJs);
  const frameB = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameB-undo-empty.png`, { wantHandleObjects: 0, allowZeroTriangles: true });
  const statsAfterUndo = await handleStats(evalJs);

  // ── Ctrl+Shift+Z 重做 → 帧C（对象带卡复活）──
  await redoShiftZKeys(send);
  const afterShiftZ = await waitForHandleObjects(evalJs, sleep, 1);
  let frameC = null;
  let histC = null;
  if (afterShiftZ.ok) {
    frameC = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameC-redo-carded.png`, { wantHandleObjects: 1 });
    histC = await historyButtons(evalJs);
  }

  // ── Ctrl+Y 裁定：再撤销一轮 → Ctrl+Y → objects===1 ──
  await undoKeys(send);
  const beforeY = await waitForHandleObjects(evalJs, sleep, 0);
  await redoYKeys(send);
  const afterY = await waitForHandleObjects(evalJs, sleep, 1);
  const finalStats = await handleStats(evalJs);

  // ── 预置色点存储（S2 UI 变体 boot 前就位：ginkgo → autumn）──
  await evalJs(`localStorage.setItem('t3d-editor.asset-presets', JSON.stringify({ asset_tree_ginkgo: 'autumn' })); 'preseeded'`);

  return {
    placeOk: placeOk === true,
    frameA, frameB, frameC,
    histA, histB, histC,
    undo: { objectsAfterUndo: statsAfterUndo.objects, sceneObjectsAtB: frameB.sceneObjects, ok: afterUndo.ok },
    redoCtrlShiftZ: { effective: afterShiftZ.ok, objects: afterShiftZ.stats.objects },
    redoCtrlY: { undoFirstOk: beforeY.ok, effective: afterY.ok, objects: afterY.stats.objects },
    finalObjects: finalStats.objects,
    presetStore: await evalJs(`localStorage.getItem('t3d-editor.asset-presets')`),
  };
};
