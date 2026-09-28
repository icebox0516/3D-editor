// T021.8 ③ Fade 专项——产品路径抽查（远离/往返）+ 四面状态同步（main/depth/shadow/picking）
// 场景：3 树种各 1（celtis x=-11 / camphor x=0 / salix x=11，spacing 11 网格 i=0,1,2）
// 四面：
//  - main render：dither 带帧 DC/tri 账目完整 + dualSubmitBuckets 客座入账（DC 差 ≈ 桶差）
//  - depth：过渡中点 shadowRepresentation 切换（shadowCasterInstances 带内逐帧读——per-tree 恒 1）
//  - shadow：shadowCasterInstances 全程连续无跳变、cull 后归 0
//  - picking：过渡帧命中（pin → instances.high 增）+ cull 后不可命中（同帧对照存活树可命中）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await evalJs(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))`);
  await sleep(800);
  const run = (expression) => evalJs(expression);
  const log = {};

  await run(`window.__tree3aPerf.place({ count: 3, seedBase: 1, spacing: 11, jitter: true, assetIds: ['asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_salix'] })`);
  await sleep(1200);

  const readDist = `(() => {
    const p = window.__tree3aPerf;
    const d = p.distribution(), s = p.stats();
    return { instances: { ...d.instances }, buckets: { ...d.buckets }, tInst: d.transitionInstances, dual: d.transition.dualSubmitBuckets, shadow: d.shadowCasterInstances, dc: s.drawCalls, tri: s.triangles, geo: s.geometries, tex: s.textures, prog: s.programs };
  })()`;

  // ── 远离序列（d 60→1000，步 25；穿 6/16/60 三线与两带）──
  log.recede = [];
  for (let d = 60; d <= 1000; d += 25) {
    await run(`window.__tree3aPerf.view({ distance: ${d} })`);
    await sleep(260);
    log.recede.push({ d, ...(await run(readDist)) });
  }
  console.log('[fade-product] recede done');

  // ── 往返序列（1000→60）──
  log.roundtrip = [];
  for (let d = 1000; d >= 60; d -= 25) {
    await run(`window.__tree3aPerf.view({ distance: ${d} })`);
    await sleep(260);
    log.roundtrip.push({ d, ...(await run(readDist)) });
  }
  console.log('[fade-product] roundtrip done');

  // ── main render 账目：dither 带帧 vs 带外帧（找 dual>0 的 d）──
  log.dualAccounting = [];
  for (const d of [160, 180, 200, 220, 240, 260]) {
    await run(`window.__tree3aPerf.view({ distance: ${d} })`);
    await sleep(400);
    log.dualAccounting.push({ d, ...(await run(readDist)) });
  }
  const dualFrame = log.dualAccounting.find((r) => r.dual > 0);
  if (dualFrame) await screenshot('docs/acceptance/t021/021.8/acceptance/03-product-dither-band.png');

  // ── picking 面三测（页面内投影计算 + 真实 InputController pointerdown 路径）──
  // 页内投影 + 点击一体（避免多趟）：projectAndPick(distance, q)
  const projectAndPick = async (distance, q) => {
    return await run(`(async () => {
      const p = window.__tree3aPerf;
      p.view({ distance: ${distance} });
      await new Promise(r => setTimeout(r, 600));
      // 机位重算（view() 同式）
      const az = 35 * Math.PI / 180, el = 16 * Math.PI / 180;
      const D = ${distance};
      const camPos = [D * Math.cos(el) * Math.cos(az), 3.6 + D * Math.sin(el), D * Math.cos(el) * Math.sin(az)];
      const target = [0, 3.6, 0];
      // three lookAt 基（up=+Y）
      const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
      const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const zA = norm(sub(camPos, target));
      const xA = norm(cross([0, 1, 0], zA));
      const yA = cross(zA, xA);
      const canvas = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
      const rect = canvas.getBoundingClientRect();
      const tan = Math.tan(25 * Math.PI / 180);
      const aspect = rect.width / rect.height;
      const q = [${q[0]}, ${q[1]}, ${q[2]}];
      const v = sub(q, camPos);
      const cx = dot(v, xA), cy = dot(v, yA);
      const cz = -dot(v, zA); // three 视空间前向 = −zA（zA 是 target→cam 后向）
      const ndcX = cx / (cz * tan * aspect), ndcY = cy / (cz * tan);
      const sx = rect.x + (ndcX + 1) / 2 * rect.width;
      const sy = rect.y + (1 - ndcY) / 2 * rect.height;
      const before = p.distribution().instances.high;
      canvas.dispatchEvent(new PointerEvent('pointerdown', { button: 0, screenX: sx, screenY: sy, clientX: sx, clientY: sy, bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 450));
      const after = p.distribution().instances.high;
      return { sx: +sx.toFixed(1), sy: +sy.toFixed(1), before, after, hit: after > before, dist: p.distribution() };
    })()`);
  };
  const blankClick = async () => {
    await run(`(async () => {
      const canvas = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
      canvas.dispatchEvent(new PointerEvent('pointerdown', { button: 0, screenX: 60, screenY: 60, clientX: 60, clientY: 60, bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 400));
    })()`);
  };

  log.picking = {};
  // 测 1：canopy 距离拾取（pin 生效 = selected → 强制 high——选中身份可跨表示保持的机制面）
  log.picking.canopyPick = await projectAndPick(300, [0, 4.5, 0]);
  await screenshot('docs/acceptance/t021/021.8/acceptance/03-product-pick-pin-canopy.png');
  await blankClick();
  // 测 2：dither 过渡带拾取（双表示期可拾取）
  log.picking.ditherPick = await projectAndPick(185, [0, 4.5, 0]);
  await blankClick();
  // 测 3：cull 距离——celtis(x=-11) 已 culled 应不可命中；salix(x=+11) 存活对照应可命中（同帧双测）
  log.picking.cullMissCeltis = await projectAndPick(880, [-11, 4.5, 0]);
  await blankClick();
  log.picking.cullAliveSalix = await projectAndPick(880, [11, 4.5, 0]);
  await blankClick();
  await screenshot('docs/acceptance/t021/021.8/acceptance/03-product-cull-distance.png');
  console.log('[fade-product] picking:', JSON.stringify({
    canopyPick: { hit: log.picking.canopyPick.hit, before: log.picking.canopyPick.before, after: log.picking.canopyPick.after },
    ditherPick: { hit: log.picking.ditherPick.hit, before: log.picking.ditherPick.before, after: log.picking.ditherPick.after },
    cullMissCeltis: { hit: log.picking.cullMissCeltis.hit },
    cullAliveSalix: { hit: log.picking.cullAliveSalix.hit },
  }));

  // ── 撤销选中收尾 + 清场 ──
  await blankClick();
  await run(`window.__tree3aPerf.clear()`);
  return log;
};
