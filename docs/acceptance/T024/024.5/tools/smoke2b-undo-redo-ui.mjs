// T024.5 冒烟用例 1 追加（UI 路径变体）：色点点选 autumn（boot 前已预置
// t3d-editor.asset-presets）→ 点击卡片进放置 → canvas 落地（placementPreset 读存储）
// → Ctrl+Z / 重做 → 落地帧与重做帧逐位一致（带卡复活渲染一致，UI 产品链）。
// 附对象级带卡证明：落地对象经「另存为模板」断言 asset.preset === 'autumn'。
// 用法：node cdp.mjs smoke2b-undo-redo-ui.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, ensureBrowserCollapsed, shootFrame, waitForSceneObjects,
  undoKeys, redoShiftZKeys, historyButtons, saveTemplateVia, readTemplatesRaw,
  templateEntryAssertions, statusbarObjects,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const layout = await ensureBrowserCollapsed(evalJs, sleep);
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');
  await evalJs(M25_VIEW); // 先定机位：落地屏幕中心 → 树必在 M25 画幅内

  // ── 色点：boot 读取预置存储 + 真实点选 autumn ──
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(600);
  const dotState = JSON.parse(await evalJs(`JSON.stringify((() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    const dots = [...card.querySelectorAll('.ed-card__preset-dot')];
    return {
      storeOnBoot: localStorage.getItem('t3d-editor.asset-presets'),
      activeOnBoot: dots.map((d) => d.className.includes('--on')),
      titles: dots.map((d) => d.title),
    };
  })())`));
  await evalJs(`(() => {
    const card = document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"]');
    card.querySelectorAll('.ed-card__preset-dot')[1].click(); // 声明序 [default, autumn]
    return 'autumn-clicked';
  })()`);
  await sleep(250);
  const storeAfterDot = await evalJs(`localStorage.getItem('t3d-editor.asset-presets')`);

  // ── 点击卡片进放置 → canvas 中心落地（浏览器面板开时的画布矩形中心）──
  // 落地用 trusted CDP 鼠标事件（Input.dispatchMouseEvent——浏览器自动派生带活跃
  // pointer 的 pointerdown/up；合成 PointerEvent 无活跃 pointer，会触发
  // OrbitControls/TransformControls setPointerCapture NotFoundError——通道噪声，
  // 024.4 的 console.* 覆写收集器看不到、本任务 Runtime.exceptionThrown 收集器可见）。
  await evalJs(`document.querySelector('.ed-card[data-asset-id="asset_tree_ginkgo"] .ed-card__main').click()`);
  await sleep(400);
  const landCoords = JSON.parse(await evalJs(`JSON.stringify((() => {
    const c = document.querySelector('canvas.ed-viewport__canvas');
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  })())`));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: landCoords.x, y: landCoords.y, button: 'none', buttons: 0 });
  await sleep(1500); // Ghost 源取用 + 材质就绪（024.4 节奏）
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: landCoords.x, y: landCoords.y, button: 'left', buttons: 1, clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: landCoords.x, y: landCoords.y, button: 'left', buttons: 0, clickCount: 1 });
  // ESC 退出放置工具（trusted 键事件）
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await sleep(400);
  // 收起浏览器 → 帧A'/B'/C' 同默认布局（clip 矩形一致）
  await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
  await sleep(500);

  // ── 帧A'：UI 落地带卡态 ──
  const landed = await waitForSceneObjects(evalJs, sleep, 1);
  const histA2 = await historyButtons(evalJs);
  const frameA2 = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameA2-ui-land-autumn.png`, { wantSceneObjects: 1 });

  // ── Ctrl+Z → 帧B'（无树）──
  await undoKeys(send);
  const afterUndo = await waitForSceneObjects(evalJs, sleep, 0);
  const histB2 = await historyButtons(evalJs);
  const frameB2 = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameB2-ui-undo-empty.png`, { wantSceneObjects: 0, allowZeroTriangles: true });

  // ── 重做（handle 路径已裁定 Ctrl+Shift+Z 生效）→ 帧C' ──
  await redoShiftZKeys(send);
  const afterRedo = await waitForSceneObjects(evalJs, sleep, 1);
  const histC2 = await historyButtons(evalJs);
  const frameC2 = afterRedo.ok
    ? await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frameC2-ui-redo-autumn.png`, { wantSceneObjects: 1 })
    : null;

  // ── 对象级带卡证明：落地对象另存模板 → asset.preset === 'autumn' ──
  const save = await saveTemplateVia(evalJs, sleep, 't0245-smoke-ui-autumn');
  const entries = await readTemplatesRaw(evalJs);
  const assertions = templateEntryAssertions(entries ?? [], 't0245-smoke-ui-autumn');

  return {
    layout,
    dotState, storeAfterDot, landCoords,
    landed: { ok: landed.ok, sceneObjects: landed.sceneObjects },
    frameA2, frameB2, frameC2, histA2, histB2, histC2,
    undo: { ok: afterUndo.ok, sceneObjects: afterUndo.sceneObjects },
    redo: { ok: afterRedo.ok, sceneObjects: afterRedo.sceneObjects },
    save, assertions,
    assertPresetAutumn: assertions.preset === 'autumn',
    statusbarObjectsFinal: await statusbarObjects(evalJs),
  };
};
