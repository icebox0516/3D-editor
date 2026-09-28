// T021.8 ③ picking 面重测（blob 瞄准版）：截图 → node 侧绿色 blob 聚类求质心 → 派发真实
// pointerdown → distribution.high 变化判命中。解析投影在近距有偏差（y 基/机位微差），
// blob 瞄准以像素为准。三测：canopy 拾取（pin）/ dither 过渡帧拾取 / cull 距离对照
// （存活树命中 + 已 cull 树原位落空）。
import { readFileSync, unlinkSync } from 'node:fs';
import { decodePng } from './png-probe.mjs';

const TMP = 'docs/acceptance/t021/021.8/acceptance/.pick-tmp.png';
const CROP_Y = 32; // pure3d 顶栏条
const CROP_H = 1048;

/** 绿色 blob 聚类：返回 [{ cx, cy, x0, x1, n }]（按 x 排序）；聚类 = x 直方图间隙 > 18px */
function greenBlobs(file) {
  const { width, rgba } = decodePng(readFileSync(file));
  const isGreen = (i) => rgba[i + 1] > rgba[i] * 1.08 && rgba[i + 1] > rgba[i + 2] * 1.08 && rgba[i + 1] > 40;
  const cols = new Array(width).fill(0);
  const colYsum = new Array(width).fill(0);
  for (let y = CROP_Y; y < CROP_Y + CROP_H; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isGreen(i)) { cols[x]++; colYsum[x] += y; }
    }
  }
  const clusters = [];
  let cur = null;
  for (let x = 0; x < width; x++) {
    if (cols[x] > 0) {
      if (!cur) cur = { x0: x, x1: x, n: 0, ySum: 0 };
      cur.x1 = x; cur.n += cols[x]; cur.ySum += colYsum[x];
    } else if (cur && x - cur.x1 > 18) {
      clusters.push(cur); cur = null;
    }
  }
  if (cur) clusters.push(cur);
  return clusters
    .filter((c) => c.n > 40)
    .map((c) => ({ cx: +((c.x0 + c.x1) / 2).toFixed(1), cy: +(c.ySum / c.n).toFixed(1), x0: c.x0, x1: c.x1, n: c.n }));
}

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  const log = { tests: {} };

  await run(`window.__tree3aPerf.place({ count: 3, seedBase: 1, spacing: 11, jitter: true, assetIds: ['asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_salix'] })`);
  await sleep(1200);

  const dispatch = (px, py) => run(`(async () => {
    const canvas = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
    canvas.dispatchEvent(new PointerEvent('pointerdown', { button: 0, screenX: ${px}, screenY: ${py}, clientX: ${px}, clientY: ${py}, bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 500));
    return window.__tree3aPerf.distribution().instances.high;
  })()`);
  const blank = () => run(`(async () => {
    const canvas = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
    canvas.dispatchEvent(new PointerEvent('pointerdown', { button: 0, screenX: 60, screenY: 60, clientX: 60, clientY: 60, bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 400));
  })()`);

  /** 到位 + 截图 + blob 列表 */
  const frame = async (distance) => {
    await run(`window.__tree3aPerf.view({ distance: ${distance} })`);
    await sleep(700);
    await screenshot(TMP);
    return greenBlobs(TMP);
  };

  // ── 测 1：canopy 距离拾取 camphor（中央 blob——|cx−960| 最小）──
  {
    const blobs = await frame(300);
    const target = blobs.reduce((a, b) => (Math.abs(b.cx - 960) < Math.abs(a.cx - 960) ? b : a), blobs[0]);
    const before = 0;
    const after = await dispatch(target.cx, target.cy);
    log.tests.canopyPick = { distance: 300, blobs, target, before, after, hit: after > before };
    await screenshot('docs/acceptance/t021/021.8/acceptance/03-product-pick-pin-canopy.png');
    await blank();
    console.log('[pick] canopy:', JSON.stringify(log.tests.canopyPick.hit), 'at', target.cx, target.cy);
  }
  // ── 测 2：dither 过渡帧拾取（camphor 中央 blob；d=185 处 own m≈16-17 双表示带）──
  {
    const dist = await run(`(() => { const d = window.__tree3aPerf.distribution(); return { tInst: d.transitionInstances, dual: d.transition.dualSubmitBuckets, instances: { ...d.instances } }; })()`);
    const blobs = await frame(185);
    const tState = await run(`(() => { const d = window.__tree3aPerf.distribution(); return { tInst: d.transitionInstances, dual: d.transition.dualSubmitBuckets, instances: { ...d.instances } }; })()`);
    const target = blobs.reduce((a, b) => (Math.abs(b.cx - 960) < Math.abs(a.cx - 960) ? b : a), blobs[0]);
    const after = await dispatch(target.cx, target.cy);
    log.tests.ditherPick = { distance: 185, blobs, target, transitionState: tState, after, hit: after > 0 };
    await screenshot('docs/acceptance/t021/021.8/acceptance/03-product-pick-dither.png');
    await blank();
    console.log('[pick] dither:', JSON.stringify(log.tests.ditherPick.hit), 'tInst=' + tState.tInst, 'dual=' + tState.dual);
  }
  // ── 测 3：cull 距离对照（d=880：唯一存活 salix blob 命中；其镜像位（celtis 已 cull）落空）──
  {
    const blobs = await frame(880);
    const state = await run(`(() => { const d = window.__tree3aPerf.distribution(); return { instances: { ...d.instances }, shadow: d.shadowCasterInstances }; })()`);
    const alive = blobs[0]; // 唯一 blob
    const mirrorX = +(2 * 960 - alive.cx).toFixed(1);
    const afterAlive = await dispatch(alive.cx, alive.cy);
    await blank();
    const afterMirror = await dispatch(mirrorX, alive.cy);
    await blank();
    log.tests.cullDistance = { distance: 880, blobs, state, alivePick: { at: [alive.cx, alive.cy], after: afterAlive, hit: afterAlive > 0 }, culledSpotPick: { at: [mirrorX, alive.cy], after: afterMirror, hit: afterMirror > 0 } };
    await screenshot('docs/acceptance/t021/021.8/acceptance/03-product-cull-distance.png');
    console.log('[pick] cull: alive.hit=' + log.tests.cullDistance.alivePick.hit + ' culledSpot.hit=' + log.tests.cullDistance.culledSpotPick.hit);
  }

  try { unlinkSync(TMP); } catch { /* best effort */ }
  await run(`window.__tree3aPerf.clear()`);
  return log;
};
