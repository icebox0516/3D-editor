// T021.8 ③ picking 面复核 v2 —— dither 带拾取失败重测（真实鼠标事件 + 带内搜索确认）
// v1 教训：单树 seed=1 的变体 scale 使 m 偏出带（preState tInst=0/dual=0 = 稳态 canopy），
// 点击的是 canopy 树不是 dither 树——测试无效。v2 修正：
//   - seedBase=2 复现中断版 ditherPick 目标同株 camphor（中断版 3 树场景 object i=1 seed=2）
//   - 机位不写死：d ∈ [170..230] 步进搜索，读 dual=1（双提交在带内铁证）才截图瞄准点击
//   - CDP Input.dispatchMouseEvent 真实 trusted 事件（消除合成 PointerEvent setPointerCapture 伪影）
//   - 对照：canopy 距离同机制复证
import { readFileSync, unlinkSync } from 'node:fs';
import { decodePng } from './png-probe.mjs';

const TMP = 'docs/acceptance/t021/021.8/acceptance/.pick3-tmp.png';
const CROP_Y = 32;
const CROP_H = 1048;

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

export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  const log = { tests: {} };

  // 中断版 ditherPick 目标同株：camphor seed=2（3 树场景 i=1）
  await run(`window.__tree3aPerf.place({ count: 1, seedBase: 2, assetId: 'asset_tree_camphor' })`);
  await sleep(1000);

  const readState = () => run(`(() => {
    const d = window.__tree3aPerf.distribution();
    return { tInst: d.transitionInstances, dual: d.transition.dualSubmitBuckets,
      instances: { ...d.instances }, shadow: d.shadowCasterInstances };
  })()`);
  const highCount = () => run(`window.__tree3aPerf.distribution().instances.high`);

  const realClick = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', buttons: 0, clickCount: 0 });
    await sleep(60);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
    await sleep(60);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
    await sleep(500);
    return highCount();
  };

  // ── 对照 A：canopy 距离（d=280 稳态 canopy；真实事件机制复证）──
  {
    await run(`window.__tree3aPerf.view({ distance: 280 })`);
    await sleep(700);
    const preState = await readState();
    await screenshot(TMP);
    const blobs = greenBlobs(TMP);
    const target = blobs[0];
    const after = target ? await realClick(target.cx, target.cy) : null;
    log.tests.canopyPick280 = { distance: 280, preState, blobs, target, highAfter: after, hit: after !== null && after > 0 };
    console.log('[pick3] canopy280: pre=' + JSON.stringify(preState) + ' hit=' + log.tests.canopyPick280.hit);
    await realClick(60, 60); // 撤选
  }

  // ── 主测 B v4：带内就位 + 活跃窗口内点击。
  //    机制判明（v3 数据）：transition 时间驱动 ~1s 完成（130 发起 dual=1 → 150 已沉降）；
  //    穿 16 线须从 m<16 一侧 recede。camphor seed2 r_eff≈3.79 → 带 d∈[130,162]。
  //    流程：D*=145 预热截图定 blob 坐标 → 跳 d=120（mid 态）→ 跳回 D*（跨 16 重触发）
  //    → 尽快确认 dual=1 → 立即真实点击（落在活跃 dither 窗口内）。──
  const D_STAR = 130;
  const log_b = {};
  {
    // 预热：settle 于 D* 取瞄准坐标
    await run(`window.__tree3aPerf.view({ distance: ${D_STAR} })`);
    await sleep(1200);
    await screenshot(TMP);
    const blobs = greenBlobs(TMP);
    const target = blobs[0];
    log_b.aimBlobs = blobs;
    if (!target) throw new Error('no blob at d=' + D_STAR);
    // 重触发（v5）：从远距 canopy 直跳回 D*——v3 实测该路径 dual 窗口 ≥1.3s；
    // 跳近再跳回（v4）的反向转换会被即刻取消，落不进窗口。
    await run(`window.__tree3aPerf.view({ distance: 280 })`);
    await sleep(1300); // 远距 canopy 沉降
    const farState = await readState();
    await run(`window.__tree3aPerf.view({ distance: ${D_STAR} })`);
    await sleep(200); // 跨 16 线触发，抢在窗口内
    const stBefore = await readState();
    const after = await realClick(target.cx, target.cy);
    const stAfter = await readState();
    log.tests.ditherPick = {
      distance: D_STAR, aim: target, farState, preState: stBefore, highAfter: after, postState: stAfter,
      hit: after !== null && after > 0,
      inBandWhenClicked: stBefore.dual > 0,
    };
    await screenshot('docs/acceptance/t021/021.8/acceptance/03-pick3-dither-real-event.png');
    console.log('[pick3] dither@' + D_STAR + ' pre.dual=' + stBefore.dual + ' hit=' + log.tests.ditherPick.hit + ' after=' + after);
    await realClick(60, 60); // 撤选
    const stDeselected = await readState();
    log.tests.ditherPick.postDeselect = stDeselected;
  }

  try { unlinkSync(TMP); } catch { /* best effort */ }
  await run(`window.__tree3aPerf.clear()`);
  return log;
};
