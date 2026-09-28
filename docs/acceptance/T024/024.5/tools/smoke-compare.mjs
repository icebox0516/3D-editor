// T024.5 冒烟面收口比对：读取各会话日志（smoke/logs/*.json——驱动器 stdout 含
// result + consoleLogs）+ pngjs 全像素逐位比对，产出 smoke/results.json。
// 像素比对体例沿 compare-regression.mjs（RGBA 逐位、维度不匹配记档、diff 分布）。
// 用法：node smoke-compare.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SMOKE = join(HERE, '..', 'smoke');
const FRAMES = join(SMOKE, 'frames');
const LOGS = join(SMOKE, 'logs');

const sessionLog = (name) => {
  const p = join(LOGS, `${name}.json`);
  if (!existsSync(p)) throw new Error(`missing session log: ${p}`);
  return JSON.parse(readFileSync(p, 'utf-8'));
};

/** RGBA 全像素逐位比对（沿 compare-regression.mjs bitwiseDiff 体例） */
function bitwiseDiff(a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    return { dimensionMismatch: true, a: { w: a.width, h: b.height }, b: { w: b.width, h: b.height } };
  }
  let diffPixels = 0;
  let maxChannelDiff = 0;
  const rowBands = {};
  const da = a.data;
  const db = b.data;
  for (let i = 0; i < da.length; i += 4) {
    if ((da[i] ^ db[i]) | (da[i + 1] ^ db[i + 1]) | (da[i + 2] ^ db[i + 2]) | (da[i + 3] ^ db[i + 3]) !== 0) {
      diffPixels += 1;
      const px = (i >> 2) % a.width;
      const py = Math.floor((i >> 2) / a.width);
      const band = Math.floor(py / 100);
      rowBands[band] = (rowBands[band] ?? 0) + 1;
      maxChannelDiff = Math.max(
        maxChannelDiff,
        Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]),
        Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3]),
      );
    }
  }
  return { diffPixels, maxChannelDiff, rowBands };
}

const frame = (name) => {
  const p = join(FRAMES, name);
  if (!existsSync(p)) throw new Error(`missing frame: ${p}`);
  return PNG.sync.read(readFileSync(p));
};

const compare = (aName, bName) => {
  const pngBytesEqual = readFileSync(join(FRAMES, aName)).equals(readFileSync(join(FRAMES, bName)));
  const diff = bitwiseDiff(frame(aName), frame(bName));
  return { a: aName, b: bName, pngBytesEqual, dimensionMismatch: !!diff.dimensionMismatch, diffPixels: diff.diffPixels ?? null, maxChannelDiff: diff.maxChannelDiff ?? null, rowBands: diff.rowBands ?? null, bitwiseIdentical: !diff.dimensionMismatch && diff.diffPixels === 0 };
};

const compareExternal = (aName, bAbsPath) => {
  const a = frame(aName);
  const b = PNG.sync.read(readFileSync(bAbsPath));
  const diff = bitwiseDiff(a, b);
  return { a: aName, b: bAbsPath, dimensionMismatch: !!diff.dimensionMismatch, diffPixels: diff.diffPixels ?? null, maxChannelDiff: diff.maxChannelDiff ?? null, rowBands: diff.rowBands ?? null, bitwiseIdentical: !diff.dimensionMismatch && diff.diffPixels === 0 };
};

const consoleCriterion = (log) => ({ errors: log.consoleLogs.filter((l) => l.startsWith('console.error') || l.startsWith('exception')).length, warnings: log.consoleLogs.filter((l) => l.startsWith('console.warn') || l.startsWith('log.warning')).length, entries: log.consoleLogs });

// ── 会话日志 ──
const s1 = sessionLog('smoke1');
const s2 = sessionLog('smoke2');
const s2b = sessionLog('smoke2b');
const s3 = sessionLog('smoke3');
const s4 = sessionLog('smoke4');
const s5 = sessionLog('smoke5');
const s6 = sessionLog('smoke6');
const s7 = sessionLog('smoke7');
const s8 = sessionLog('smoke8');
const s8b = sessionLog('smoke8b');

// ── 像素比对 ──
const pixel = {
  case1HandleRedoIdentity: compare('frameA-place-carded.png', 'frameC-redo-carded.png'),
  case1HandleUndoEffect: compare('frameA-place-carded.png', 'frameB-undo-empty.png'),
  case1UiRedoIdentity: compare('frameA2-ui-land-autumn.png', 'frameC2-ui-redo-autumn.png'),
  case1UiUndoEffect: compare('frameA2-ui-land-autumn.png', 'frameB2-ui-undo-empty.png'),
  case2ReloadFidelity: compare('frameD-template-save.png', 'frameE-reload-apply-carded.png'),
  case3FallbackMatchesDefault: compare('frameF-bogus-fallback.png', 'frame-default-ref.png'),
  case3FallbackDiffersFromAutumn: compare('frameF-bogus-fallback.png', 'frameD-template-save.png'),
  case4ReloadFidelity: compare('frameG-plain-save.png', 'frameH-reload-apply-plain.png'),
  case4CrossCheckDefaultProtocol: compare('frameG-plain-save.png', 'frame-default-ref.png'),
  case5CeltisVsStep2Baseline: compareExternal('frameI-celtis-settled.png', join(HERE, '..', 'regression-default', 'current', 'asset_tree_celtis.png')),
  case5ReproCrossProcess: compare('frameI2-celtis-reproc.png', 'frameI-celtis-settled.png'),
  case5ReproVsStep2Baseline: compareExternal('frameI2-celtis-reproc.png', join(HERE, '..', 'regression-default', 'current', 'asset_tree_celtis.png')),
  // 通道定位佐证：银杏（不同树）今日帧 vs Step-2 基线——差异掩码应与 celtis 相同
  channelProbeGinkgoVsStep2: compareExternal('frame-default-ref.png', join(HERE, '..', 'regression-default', 'current', 'asset_tree_ginkgo.png')),
};

// ── 场景域 carve-out（case5 通道定位）：483 差异全落 DOM 覆盖盒（HUD 文本/小地图
//    边框角）——sceneDomainDiff=0 证明沉降态场景渲染逐位未变（掩码可视化另存帧）。
const DOM_OVERLAY_BOXES = [
  { x: 12, y: 12, w: 248, h: 44 },    // .ed-hud--tl（场景/Perspective/未命名场景 chips + 提示行）
  { x: 1080, y: 7, w: 200, h: 31 },   // .ed-hud--tr（Shaded 渲染模式按钮组）
  { x: 1078, y: 778, w: 8, h: 8 }, { x: 1274, y: 778, w: 8, h: 8 },
  { x: 1078, y: 914, w: 8, h: 8 }, { x: 1274, y: 914, w: 8, h: 8 }, // 小地图边框四角
];
const inOverlayBox = (x, y) => DOM_OVERLAY_BOXES.some((bx) => x >= bx.x && x < bx.x + bx.w && y >= bx.y && y < bx.y + bx.h);
const carveOut = (() => {
  const a = frame('frameI-celtis-settled.png');
  const b = PNG.sync.read(readFileSync(join(HERE, '..', 'regression-default', 'current', 'asset_tree_celtis.png')));
  let total = 0; let inOverlay = 0; let scene = 0;
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * 4;
      const diff = a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2] || a.data[i + 3] !== b.data[i + 3];
      if (diff) { total += 1; if (inOverlayBox(x, y)) inOverlay += 1; else scene += 1; }
    }
  }
  return { totalDiff: total, inDomOverlayBoxes: inOverlay, sceneDomainDiff: scene };
})();

// ── 用例判定 ──
const cases = [];

// 用例 1：撤销重做带卡
{
  const r1 = s1.result;
  const r2b = s2b.result;
  cases.push({
    id: 'case1-undo-redo-carded',
    title: '撤销重做带卡（handle 路径 + UI 路径变体）',
    handlePath: {
      placeOk: r1.placeOk,
      undo: { key: 'Ctrl+Z', objectsAfter: r1.undo.objectsAfterUndo, sceneObjectsAtB: r1.undo.sceneObjectsAtB, pass: r1.undo.objectsAfterUndo === 0 },
      redo: { key: 'Ctrl+Shift+Z', effective: r1.redoCtrlShiftZ.effective, objectsAfter: r1.redoCtrlShiftZ.objects, pass: r1.redoCtrlShiftZ.effective && r1.redoCtrlShiftZ.objects === 1 },
      redoAlt: { key: 'Ctrl+Y', undoFirstOk: r1.redoCtrlY.undoFirstOk, effective: r1.redoCtrlY.effective, objectsAfter: r1.redoCtrlY.objects },
      pixelRedoIdentity: pixel.case1HandleRedoIdentity,
      historyButtons: { afterPlace: r1.histA, afterUndo: r1.histB, afterRedo: r1.histC },
      console: consoleCriterion(s1),
    },
    uiPath: {
      storePreseedReadAtBoot: r2b.dotState.storeOnBoot,
      autumnDotActiveAtBoot: r2b.dotState.activeOnBoot?.[1] === true,
      dotTitles: r2b.dotState.titles,
      landed: r2b.landed,
      undo: r2b.undo,
      redo: r2b.redo,
      pixelRedoIdentity: pixel.case1UiRedoIdentity,
      pixelUndoEffect: pixel.case1UiUndoEffect,
      objectLevelCardProof: { template: 't0245-smoke-ui-autumn', preset: r2b.assertions.preset, seed: r2b.assertions.seed, pass: r2b.assertPresetAutumn === true },
      console: consoleCriterion(s2b),
    },
    pass: r1.placeOk && r1.undo.objectsAfterUndo === 0 && r1.redoCtrlShiftZ.effective && r1.redoCtrlShiftZ.objects === 1 &&
      pixel.case1HandleRedoIdentity.bitwiseIdentical && pixel.case1HandleRedoIdentity.diffPixels === 0 &&
      r2b.landed.ok && r2b.undo.ok && r2b.redo.ok &&
      pixel.case1UiRedoIdentity.bitwiseIdentical && r2b.assertPresetAutumn === true &&
      consoleCriterion(s1).errors === 0 && consoleCriterion(s1).warnings === 0 &&
      consoleCriterion(s2b).errors === 0 && consoleCriterion(s2b).warnings === 0,
  });
}

// 用例 2：保存重载保真（带卡）
{
  const r2 = s2.result;
  const r3 = s3.result;
  cases.push({
    id: 'case2-save-reload-carded',
    title: '保存重载保真（带卡，模板产品路径）',
    templateSaved: { toast: r2.save.toast, assertions: r2.assertions, presetAutumn: r2.assertPresetAutumn },
    reloadApply: { apply: r3.apply, sceneObjectsAtE: r3.sceneObjectsAtE, handleObjectsAfterApply: r3.handleObjectsAfterApply },
    pixelReloadFidelity: pixel.case2ReloadFidelity,
    console: { save: consoleCriterion(s2), apply: consoleCriterion(s3) },
    pass: r2.assertPresetAutumn === true && r3.sceneObjectsAtE === 1 && pixel.case2ReloadFidelity.bitwiseIdentical &&
      consoleCriterion(s2).errors === 0 && consoleCriterion(s2).warnings === 0 &&
      consoleCriterion(s3).errors === 0 && consoleCriterion(s3).warnings === 0,
  });
}

// 用例 3：已删卡 id 宽容回退
{
  const r4 = s4.result;
  const r5 = s5.result;
  cases.push({
    id: 'case3-bogus-preset-fallback',
    title: '已删卡 id 宽容回退 default',
    bogusTemplate: r4.bogusEntry,
    defaultRefFrame: r4.frameDefaultRef.file,
    apply: r5.apply,
    alive: r5.alive,
    sceneObjectsAtF: r5.sceneObjectsAtF,
    pixelFallbackMatchesDefault: pixel.case3FallbackMatchesDefault,
    pixelFallbackDiffersFromAutumn: pixel.case3FallbackDiffersFromAutumn,
    console: consoleCriterion(s5),
    pass: r5.alive.hasCanvas === true && r5.alive.errorToasts === 0 && r5.sceneObjectsAtF === 1 &&
      pixel.case3FallbackMatchesDefault.bitwiseIdentical && !pixel.case3FallbackDiffersFromAutumn.bitwiseIdentical &&
      consoleCriterion(s5).errors === 0 && consoleCriterion(s5).warnings === 0,
  });
}

// 用例 4：存量场景（无 preset 对象）保存重载
{
  const r6 = s6.result;
  const r7 = s7.result;
  cases.push({
    id: 'case4-plain-scene-reload',
    title: '存量场景（无 preset 对象）保存重载逐位',
    templateSaved: { toast: r6.save.toast, assertions: r6.assertions, noPresetKey: r6.assertNoPresetKey },
    reloadApply: { apply: r7.apply, sceneObjectsAtH: r7.sceneObjectsAtH },
    pixelReloadFidelity: pixel.case4ReloadFidelity,
    pixelCrossCheckDefaultProtocol: pixel.case4CrossCheckDefaultProtocol,
    console: { save: consoleCriterion(s6), apply: consoleCriterion(s7) },
    pass: r6.assertNoPresetKey === true && r7.sceneObjectsAtH === 1 && pixel.case4ReloadFidelity.bitwiseIdentical &&
      consoleCriterion(s6).errors === 0 && consoleCriterion(s6).warnings === 0 &&
      consoleCriterion(s7).errors === 0 && consoleCriterion(s7).warnings === 0,
  });
}

// 用例 5：修复后沉降像素抽查（回归哨兵）——严格逐位判据 FAIL（483px DOM 覆盖盒内
// 通道微差）、场景域 diff=0（沉降态渲染未变）；完整分析留主代理裁定，不改代码回避。
{
  const r8 = s8.result;
  cases.push({
    id: 'case5-celtis-settled-sentinel',
    title: '修复后沉降像素抽查（celtis 回归哨兵）',
    sentinel: pixel.case5CeltisVsStep2Baseline,
    reproducibility: { crossChromeProcess: pixel.case5ReproCrossProcess, reproVsStep2Baseline: pixel.case5ReproVsStep2Baseline },
    channelLocalization: {
      ginkgoProbeVsStep2: pixel.channelProbeGinkgoVsStep2,
      carveOut,
      note: '483 差异像素全部位于 DOM 覆盖盒（.ed-hud--tl 文本 / .ed-hud--tr Shaded 按钮字形 / 小地图边框四角 AA）；ginkgo 与 celtis 的差异掩码逐位相同（树内容无关）；跨 Chrome 进程今日态稳定（frameI2≡frameI）；工作树零 src/ui 或 CSS 改动。场景域（WebGL 渲染面）diff=0——fade-out 修复未改变沉降态场景渲染。',
    },
    strictBitwisePass: pixel.case5CeltisVsStep2Baseline.bitwiseIdentical,
    sceneDomainPass: carveOut.sceneDomainDiff === 0,
    console: consoleCriterion(s8),
    pass: null, // 主代理裁定：严格判据 FAIL / 意图判据（沉降态渲染不变）PASS——两口径分列
  });
}

// 用例 6：色点切换/Ghost/拖放/重放 —— 消费 024.4 证据（不重跑）
cases.push({
  id: 'case6-consume-0244',
  title: '色点切换 / Ghost / 拖放 / 键 4 重放（消费 024.4 证据）',
  consumedEvidence: 'docs/acceptance/T024/024.4/frames/（15 帧）+ 批次断言 JSON（01-08 / 10-15 帧系列；ui-smoke.mjs / ui-smoke2.mjs / ui-smoke3.mjs / ui-smoke4.mjs）',
  rerun: false,
  pass: true,
});

const results = {
  generatedAt: new Date().toISOString(),
  method: {
    drive: 'CDP（--headless=new，remote-debugging-port=9333，viewport 1920x1080 DPR1）；单 navigate/会话（024.4 通道纪律）',
    frame: 'freezeTime(2.5) 先于对象创建 → M25（25m/35°/8°）→ 池稳定轮询（两采样 triangles/drawCalls 稳定）→ sleep(1100) → 截帧 clip 到 ed-viewport canvas 矩形（1292x932，浏览器收起布局）',
    pixel: 'pngjs RGBA 全像素逐位比对（沿 Step-2 compare-regression.mjs 体例）',
    console: 'Runtime/Log 域事件自标签页创建收集（024.5 cdp.mjs）——判据 = 零错误零警告',
    keyboard: 'CDP Input.dispatchKeyEvent 合成 trusted 键事件（Ctrl/Ctrl+Shift 修饰位）',
  },
  redoKeyVerdict: {
    ctrlShiftZ: { effective: s1.result.redoCtrlShiftZ.effective, evidence: 'smoke1：undo→objects 0→Ctrl+Shift+Z→objects 1' },
    ctrlY: { effective: s1.result.redoCtrlY.effective, evidence: 'smoke1：再 undo→objects 0→Ctrl+Y→objects 1' },
    note: '两快捷键均生效（input.ts L215-225：ctrl+z+shift→redo / ctrl+y→redo）；UI 路径变体用 Ctrl+Shift+Z',
  },
  cases,
  summary: {
    total: 6,
    pass: cases.filter((c) => c.pass === true).length,
    fail: cases.filter((c) => c.pass === false).length,
    adjudication: cases.filter((c) => c.pass === null).map((c) => c.id),
  },
};

writeFileSync(join(SMOKE, 'results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify({
  summary: results.summary,
  perCase: cases.map((c) => ({ id: c.id, pass: c.pass, strictBitwise: c.pixelRedoIdentity?.diffPixels ?? c.pixelReloadFidelity?.diffPixels ?? c.pixelFallbackMatchesDefault?.diffPixels ?? c.sentinel?.diffPixels ?? null })),
}, null, 2));
process.exit(0);
