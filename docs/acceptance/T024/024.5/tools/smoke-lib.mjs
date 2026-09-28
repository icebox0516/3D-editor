// T024.5 冒烟面共用库（Step 4）——六用例共用的驱动原语。
// 体例沿 shot-regression.mjs（单 navigate/会话、freezeTime(2.5) 先于对象创建、
// M25 = {25m, 35°, 8°}、clip 到 ed-viewport canvas、池稳定轮询 + sleep(1100)）+
// ui-smoke*.mjs（合成事件 / 菜单与弹层 DOM 操作 / localStorage 读写）。
// 会话纪律：每个脚本一次 navigate（024.4 记档「多 navigate 同 ws 有挂起前科」），
// 驱动器每会话新建并回收标签页；localStorage 经 Chrome profile 跨会话保留。

export const PORT = process.env.PORT ?? '5173';
export const FRAMES_DIR = 'docs/acceptance/T024/024.5/smoke/frames';
export const M25_VIEW = `window.__tree3aPerf.view({ distance: 25, azimuthDeg: 35, elevationDeg: 8 })`;
export const READ_STATS = 'JSON.stringify(window.__tree3aPerf.stats())';

/** 等 app 就绪（__tree3aPerf 出现；40×500ms 上限沿 probe 先例） */
export async function waitReady(evalJs, sleep) {
  for (let i = 0; i < 40; i++) {
    const ok = await evalJs(
      `typeof window.__tree3aPerf !== 'undefined' && typeof window.__tree3aPerf.place === 'function'`,
    );
    if (ok) return true;
    await sleep(500);
  }
  throw new Error('app not ready: __tree3aPerf missing');
}

/** 状态栏产品路径对象计数（Objects 读数段——sceneVersion 派生，模板应用后仍准确） */
export async function statusbarObjects(evalJs) {
  const v = await evalJs(`(() => {
    const seg = [...document.querySelectorAll('.ed-statusbar__metrics .ed-statusbar__segment')]
      .find((s) => s.querySelector('.ed-statusbar__label')?.textContent === 'Objects');
    return seg ? seg.querySelector('.ed-statusbar__value').textContent : null;
  })()`);
  return v === null ? null : Number(v);
}

/** 句柄账目（stats().objects = 本句柄放置且存活的；模板应用后 id 重生成 → 恒 0，另配账读出） */
export async function handleStats(evalJs) {
  return JSON.parse(await evalJs(READ_STATS));
}

/** clip 参数 = ed-viewport canvas 矩形（逐位判据排除状态栏/停靠面板 DOM 差异） */
export async function canvasClip(evalJs) {
  const rect = JSON.parse(await evalJs(`JSON.stringify((() => {
    const r = document.querySelector('canvas.ed-viewport__canvas').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  })())`));
  return {
    x: Math.round(rect.x), y: Math.round(rect.y),
    width: Math.round(rect.w), height: Math.round(rect.h), scale: 1,
  };
}

/**
 * 布局归一（逐位判据前提）：内容浏览器 = 底部停靠面板（.ed-side--bottom，展开
 * 280px → canvas 高 712 / 收起 932），展开态随 t3d-editor.workspace 跨会话持久化
 * ——本批 mid-run 一次中断会话把 expanded 持久化，后续 boot 画布矮 220px。比对帧
 * 一律在「浏览器收起」布局截（与 Step-2 regression 基线 1292x932 同口径）：boot 后
 * 检测展开则点 toggle 收起。返回归一前后状态。
 */
export async function ensureBrowserCollapsed(evalJs, sleep) {
  const before = await evalJs(`(() => {
    const el = document.querySelector('.ed-browser');
    return el ? el.className.includes('ed-browser--expanded') : null;
  })()`);
  if (before === true) {
    await evalJs(`document.querySelector('.ed-browser__toggle').click()`);
    await sleep(500);
  }
  const after = await evalJs(`(() => {
    const el = document.querySelector('.ed-browser');
    return el ? el.className.includes('ed-browser--expanded') : null;
  })()`);
  return { expandedAtBoot: before, expandedAfterNormalize: after };
}

/**
 * 池稳定轮询（沿 shot-regression：两采样 400ms 间隔 triangles/drawCalls 稳定）。
 * wantHandleObjects：handle place 路径的句柄账目目标（模板应用路径传 null，改用
 * wantSceneObjects 轮询状态栏 Objects——openScene 重生成 id，句柄账目不跟踪）。
 */
export async function pollStable(evalJs, sleep, { wantHandleObjects = null, wantSceneObjects = null, allowZeroTriangles = false, rounds = 60 } = {}) {
  let prev = null;
  let stats = null;
  for (let i = 0; i < rounds; i++) {
    stats = await handleStats(evalJs);
    const sceneObjects = await statusbarObjects(evalJs);
    const handleOk = wantHandleObjects === null || stats.objects === wantHandleObjects;
    const sceneOk = wantSceneObjects === null || sceneObjects === wantSceneObjects;
    if (
      (allowZeroTriangles || stats.triangles > 0) && handleOk && sceneOk && prev !== null &&
      prev.triangles === stats.triangles && prev.drawCalls === stats.drawCalls
    ) return { stable: true, stats, sceneObjects };
    prev = stats;
    await sleep(400);
  }
  return { stable: false, stats, sceneObjects: await statusbarObjects(evalJs) };
}

/** 截帧：冻结相位已就绪前提下，稳定 → 024.3 节奏 sleep(1100) → clip 截帧 */
export async function shootFrame(evalJs, sleep, screenshot, file, { wantHandleObjects = null, wantSceneObjects = null, allowZeroTriangles = false } = {}) {
  const poll = await pollStable(evalJs, sleep, { wantHandleObjects, wantSceneObjects, allowZeroTriangles });
  if (!poll.stable) throw new Error(`pool not stable before ${file}: ${JSON.stringify(poll)}`);
  await sleep(1100);
  const clip = await canvasClip(evalJs);
  await screenshot(file, { clip });
  const statsAtShot = await handleStats(evalJs);
  return { file, clip, statsAtShot, sceneObjects: poll.sceneObjects };
}

/** 等句柄账目到达目标值（撤销/重做后轮询；60×150ms 上限） */
export async function waitForHandleObjects(evalJs, sleep, target, rounds = 40) {
  for (let i = 0; i < rounds; i++) {
    const s = await handleStats(evalJs);
    if (s.objects === target) return { ok: true, elapsedRounds: i, stats: s };
    await sleep(150);
  }
  return { ok: false, stats: await handleStats(evalJs) };
}

/** 等状态栏 Objects 到达目标值（模板应用 / UI 落地路径） */
export async function waitForSceneObjects(evalJs, sleep, target, rounds = 40) {
  for (let i = 0; i < rounds; i++) {
    const v = await statusbarObjects(evalJs);
    if (v === target) return { ok: true, elapsedRounds: i, sceneObjects: v };
    await sleep(150);
  }
  return { ok: false, sceneObjects: await statusbarObjects(evalJs) };
}

/**
 * 合成键盘组合（CDP Input.dispatchKeyEvent——trusted 事件直达 window keydown，
 * 024.4 键 4 重放同通道）。modifiers 位：Alt=1 / Ctrl=2 / Meta=4 / Shift=8。
 */
export async function keyCombo(send, { key, code, vkc, ctrl = false, shift = false }) {
  const mods = (ctrl ? 2 : 0) | (shift ? 8 : 0);
  if (ctrl) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Control', code: 'ControlLeft', windowsVirtualKeyCode: 17, nativeVirtualKeyCode: 17, modifiers: mods, isKeypad: false });
  }
  if (shift) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16, modifiers: mods });
  }
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vkc, nativeVirtualKeyCode: vkc, modifiers: mods });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vkc, nativeVirtualKeyCode: vkc, modifiers: mods });
  if (shift) {
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16, modifiers: mods });
  }
  if (ctrl) {
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Control', code: 'ControlLeft', windowsVirtualKeyCode: 17, nativeVirtualKeyCode: 17, modifiers: 0 });
  }
}

export const undoKeys = (send) => keyCombo(send, { key: 'z', code: 'KeyZ', vkc: 90, ctrl: true });
export const redoShiftZKeys = (send) => keyCombo(send, { key: 'Z', code: 'KeyZ', vkc: 90, ctrl: true, shift: true });
export const redoYKeys = (send) => keyCombo(send, { key: 'y', code: 'KeyY', vkc: 89, ctrl: true });

/** 顶栏「撤销/重做」按钮可用态（产品路径佐证：canUndo/canRedo 派生 disabled 位） */
export async function historyButtons(evalJs) {
  return JSON.parse(await evalJs(`JSON.stringify((() => {
    const btns = [...document.querySelectorAll('.ed-menubar__end .ed-btn')];
    const undo = btns.find((b) => b.title.includes('撤销'));
    const redo = btns.find((b) => b.title.includes('重做'));
    return { canUndo: undo ? !undo.disabled : null, canRedo: redo ? !redo.disabled : null };
  })())`));
}

/** 菜单「文件」展开 → 点指定 label 的菜单项（弹层 portal：#ed-menu-popup-file） */
export async function clickFileItem(evalJs, sleep, labelNeedle) {
  await evalJs(`(() => {
    const btn = [...document.querySelectorAll('.ed-menubar__nav .ed-menu__btn')]
      .find((b) => b.textContent.trim() === '文件');
    if (!btn) throw new Error('file menu button not found');
    btn.click(); return 'file-open';
  })()`);
  await sleep(300);
  const clicked = await evalJs(`(() => {
    const popup = document.getElementById('ed-menu-popup-file');
    if (!popup) return 'no-popup';
    const item = [...popup.querySelectorAll('button[role="menuitem"]')]
      .find((b) => (b.querySelector('.ed-menu__label')?.textContent ?? '').includes(${JSON.stringify(labelNeedle)}));
    if (!item) return 'no-item';
    if (item.getAttribute('aria-disabled') === 'true') return 'disabled';
    item.click();
    return 'clicked';
  })()`);
  if (clicked !== 'clicked') throw new Error(`menu item '${labelNeedle}' -> ${clicked}`);
  return clicked;
}

/** 「另存为模板…」产品路径全链：菜单 → 命名弹层（React 受控输入经原生 setter）→ 保存 */
export async function saveTemplateVia(evalJs, sleep, name) {
  await clickFileItem(evalJs, sleep, '另存为模板');
  await sleep(400);
  const typed = await evalJs(`(() => {
    const input = document.querySelector('input[aria-label="模板名称"]');
    if (!input) return 'no-input';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(name)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  })()`);
  if (typed !== 'typed') throw new Error(`naming dialog -> ${typed}`);
  await sleep(250);
  const saved = await evalJs(`(() => {
    const dlg = document.querySelector('.ed-dialog');
    if (!dlg) return 'no-dialog';
    const btn = [...dlg.querySelectorAll('.ed-scenedlg__actions .ed-btn--primary')]
      .find((b) => b.textContent.includes('保存'));
    if (!btn) return 'no-btn';
    if (btn.disabled) return 'disabled';
    btn.click();
    return 'saved';
  })()`);
  if (saved !== 'saved') throw new Error(`save template -> ${saved}`);
  await sleep(500);
  const toast = await readToasts(evalJs);
  return { typed, saved, toast };
}

/** 读右下 Toast 文本（模板应用/保存的产品路径回执） */
export async function readToasts(evalJs) {
  return evalJs(`JSON.stringify([...document.querySelectorAll('.ed-toast__text')].map((e) => e.textContent))`);
}

/**
 * 应用模板产品路径：文件 → 新建场景 ▾（父项 click 展开）→ 子菜单按模板名点选 →
 * dirty 确认弹层（非 dirty 直通零弹层；出现则点「新建」确认）。
 */
export async function applyTemplateVia(evalJs, sleep, templateName) {
  await evalJs(`(() => {
    const btn = [...document.querySelectorAll('.ed-menubar__nav .ed-menu__btn')]
      .find((b) => b.textContent.trim() === '文件');
    if (!btn) throw new Error('file menu button not found');
    btn.click(); return 'file-open';
  })()`);
  await sleep(300);
  const parentClicked = await evalJs(`(() => {
    const popup = document.getElementById('ed-menu-popup-file');
    if (!popup) return 'no-popup';
    const parent = [...popup.querySelectorAll('.ed-menu__item--parent')]
      .find((b) => (b.querySelector('.ed-menu__label')?.textContent ?? '').includes('新建场景'));
    if (!parent) return 'no-parent';
    parent.click();
    return 'parent-clicked';
  })()`);
  if (parentClicked !== 'parent-clicked') throw new Error(`new-scene submenu -> ${parentClicked}`);
  await sleep(400);
  const itemClicked = await evalJs(`(() => {
    const items = [...document.querySelectorAll('.ed-menu__sub button[role="menuitem"]')];
    const item = items.find((b) => (b.querySelector('.ed-menu__label')?.textContent ?? '').trim() === ${JSON.stringify(templateName)});
    if (!item) return 'no-item:' + items.map((b) => b.querySelector('.ed-menu__label')?.textContent).join('|');
    if (item.getAttribute('aria-disabled') === 'true') return 'disabled';
    item.click();
    return 'clicked';
  })()`);
  if (itemClicked !== 'clicked') throw new Error(`template item '${templateName}' -> ${itemClicked}`);
  await sleep(500);
  // dirty 确认弹层（非 dirty 场景不出现）：出现则点「新建」
  const confirmState = await evalJs(`(() => {
    const dlg = document.querySelector('.ed-dialog');
    if (!dlg) return 'no-confirm';
    const title = dlg.querySelector('.ed-dialog__title')?.textContent ?? '';
    if (!title.includes('新建场景') || !dlg.querySelector('.ed-scenedlg__summary')) return 'other-dialog:' + title;
    const btn = [...dlg.querySelectorAll('.ed-scenedlg__actions .ed-btn--primary')]
      .find((b) => b.textContent.trim() === '新建');
    if (!btn) return 'no-confirm-btn';
    btn.click();
    return 'confirmed';
  })()`);
  await sleep(600);
  const toast = await readToasts(evalJs);
  return { itemClicked, confirmState, toast };
}

/** 读 localStorage 模板表（TemplatePayload[]；损坏条目产品侧已静默跳过，这里原样解析） */
export async function readTemplatesRaw(evalJs) {
  const raw = await evalJs(`localStorage.getItem('t3d-editor.templates')`);
  return raw === null ? null : JSON.parse(raw);
}

/** 模板条目断言载荷：objects[0].asset.preset 与 preset 键存在性（省略规则面） */
export function templateEntryAssertions(entries, name) {
  const entry = entries.find((e) => e.name === name);
  if (!entry) return { found: false, names: entries.map((e) => e.name) };
  const obj = entry.scene?.objects?.[0] ?? null;
  return {
    found: true,
    id: entry.id,
    objectCount: entry.scene?.objects?.length ?? 0,
    assetId: obj?.asset?.assetId ?? null,
    hasSeed: obj?.asset ? Object.prototype.hasOwnProperty.call(obj.asset, 'seed') : null,
    seed: obj?.asset?.seed ?? null,
    // preset 落点 = objects[0].asset.preset（createModelObjectAt 省略规则：默认卡不落盘）
    hasPresetKey: obj?.asset ? Object.prototype.hasOwnProperty.call(obj.asset, 'preset') : null,
    preset: obj?.asset?.preset ?? null,
  };
}
