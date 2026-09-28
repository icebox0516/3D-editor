// T021.8 ⑥ 兼容回归冒烟（浏览器面；测试面 4243 已覆盖——每项一帧 + 一句话 + 全程 console 清洁）
//  1 GLB 资产 UI 放置渲染（ContentBrowser 卡片 → placement 工具 → canvas 落点；含 Ghost 预览帧）
//  2 streetlamp 放置 + 拉远（程序化两档资产）
//  3 拾取跨表示身份保持（近距选中 → 拉远 canopy → 拉回；pin 高保 + outline 连续）
//  4 撤销重做（place 5 → Ctrl+Z → Ctrl+Y；objects 计数核验）
//  5 渲染模式切换（wireframe/xray/clay 三代表态，__envProbe.setPreset renderMode =
//    ViewportHUD 同款键同源环境通道——UI 下拉等价，方法记档）
// 布局：默认编辑器布局（不切 pure3d——UI 面板须在场驱动）；canvas 为主视口非满幅，冒烟口径如实记档。
const OUT = 'docs/acceptance/t021/021.8/acceptance';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep, send }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await evalJs('window.__tree3a && window.__tree3a.unmount()');
  await sleep(1200);
  const run = (e) => evalJs(e);
  const log = { steps: {} };

  const realClick = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', buttons: 0, clickCount: 0 });
    await sleep(80);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
    await sleep(70);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
    await sleep(450);
  };
  const hover = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', buttons: 0, clickCount: 0 });
    await sleep(250);
  };
  const key = async (k, mods = {}) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: k.charCodeAt(0), ...mods });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: k.charCodeAt(0), ...mods });
    await sleep(350);
  };
  const readOut = () => run(`(() => {
    const p = window.__tree3aPerf.stats();
    const d = window.__tree3aPerf.distribution();
    const outliner = document.querySelector('[class*=outliner]')?.textContent ?? '';
    return { dc: p.drawCalls, tri: p.triangles, objects: p.objects, inst: { ...d.instances },
      outlinerHasPavilion: outliner.includes('凉亭') };
  })()`);

  // ── 1. GLB UI 放置（asset_pavilion 凉亭）+ Ghost 预览 ──
  {
    const card = await run(`(() => {
      const el = document.querySelector('[data-asset-id="asset_pavilion"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    })()`);
    if (!card) throw new Error('asset_pavilion card not found');
    await realClick(card.x, card.y); // 激活 placement 工具
    const canvas = await run(`(() => {
      const c = [...document.querySelectorAll('canvas')].reduce((a, b) => (b.clientWidth * b.clientHeight > a.clientWidth * a.clientHeight ? b : a));
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height * 0.62) };
    })()`);
    await hover(canvas.x, canvas.y); // Ghost 预览（高档）
    await screenshot(`${OUT}/06-glb-ghost-preview.png`);
    const ghostState = await readOut();
    await realClick(canvas.x, canvas.y); // 落点放置
    await screenshot(`${OUT}/06-glb-placed.png`);
    const placed = await readOut();
    log.steps.glb = { card, canvas, ghostState, placed, ok: placed.outlinerHasPavilion && placed.dc > 3 };
    console.log('[smoke] glb placed: outliner=' + placed.outlinerHasPavilion + ' dc=' + placed.dc + ' tri=' + placed.tri);
    // 撤选（点击空白 canvas 角落）
    await realClick(canvas.x + 30, canvas.y - 120);
  }

  // ── 2. streetlamp 放置 + 拉远 ──
  {
    await run(`(async () => {
      const p = window.__tree3aPerf;
      p.place({ count: 3, seedBase: 1, spacing: 11, jitter: true, assetId: 'asset_streetlamp' });
      p.view({ distance: 30 });
    })()`);
    await sleep(1200);
    const near = await readOut();
    await run(`window.__tree3aPerf.view({ distance: 400 })`);
    await sleep(900);
    const far = await readOut();
    await screenshot(`${OUT}/06-streetlamp-far-d400.png`);
    log.steps.streetlamp = { near, far };
    console.log('[smoke] streetlamp near dc=' + near.dc + ' inst=' + JSON.stringify(near.inst) + ' | far dc=' + far.dc + ' inst=' + JSON.stringify(far.inst));
    await run(`window.__tree3aPerf.clear()`);
    await sleep(500);
  }

  // ── 3. 拾取跨表示（近选中 → canopy → 回近；身份保持 = pin 高保 + outline 连续）──
  {
    await run(`window.__tree3aPerf.place({ count: 1, seedBase: 2, assetId: 'asset_tree_camphor' })`);
    await sleep(800);
    // 近距：blob 瞄准（页内投影简化——用 tree3aPerf.view 后树在画面中心附近，点击画面中央）
    await run(`window.__tree3aPerf.view({ distance: 55, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(700);
    const cv = await run(`(() => { const c = [...document.querySelectorAll('canvas')].reduce((a,b)=>(b.clientWidth*b.clientHeight>a.clientWidth*a.clientHeight?b:a)); const r = c.getBoundingClientRect(); return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height*0.55) }; })()`);
    await realClick(cv.x, cv.y);
    const nearSel = await readOut();
    await screenshot(`${OUT}/06-pick-near-selected.png`);
    await run(`window.__tree3aPerf.view({ distance: 300 })`);
    await sleep(800);
    const farSel = await readOut(); // pin：selected → 强制 high（canopy 距离）
    await screenshot(`${OUT}/06-pick-far-canopy-pinned.png`);
    await run(`window.__tree3aPerf.view({ distance: 55, azimuthDeg: 35, elevationDeg: 8 })`);
    await sleep(800);
    const backSel = await readOut();
    await screenshot(`${OUT}/06-pick-back-near.png`);
    log.steps.pickAcrossRep = { nearSel, farSel, backSel, identityHeld: farSel.inst.high === 1 && nearSel.inst.high === 1 };
    console.log('[smoke] pick across: near.high=' + nearSel.inst.high + ' far.high=' + farSel.inst.high + ' back.high=' + backSel.inst.high);
    // 撤选 + 清场
    await realClick(cv.x - 200, cv.y - 160);
    await run(`window.__tree3aPerf.clear()`);
    await sleep(500);
  }

  // ── 4. 撤销重做（place 5 → Ctrl+Z 批撤 → Ctrl+Y 重做）──
  {
    await run(`window.__tree3aPerf.place({ count: 5, seedBase: 7, assetId: 'asset_tree_3a' })`);
    await sleep(900);
    const placed = await readOut();
    await key('z', { modifiers: 2 }); // Ctrl
    const undone = await readOut();
    await screenshot(`${OUT}/06-undo-after.png`);
    await key('y', { modifiers: 2 }); // Ctrl
    const redone = await readOut();
    await screenshot(`${OUT}/06-redo-after.png`);
    log.steps.undoRedo = { placed, undone, redone, ok: placed.objects === 5 && undone.objects === 0 && redone.objects === 5 };
    console.log('[smoke] undo/redo: ' + placed.objects + ' → ' + undone.objects + ' → ' + redone.objects);
    await run(`window.__tree3aPerf.clear()`);
    await sleep(400);
  }

  // ── 5. 渲染模式切换（wireframe / xray / clay 三代表态；envProbe setPreset renderMode = HUD 同源通道）──
  {
    await run(`window.__tree3aPerf.place({ count: 60, seedBase: 1, spacing: 11, jitter: true, assetId: 'asset_tree_celtis' })`);
    await run(`window.__tree3aPerf.view({ distance: 90 })`);
    await sleep(1300);
    log.steps.renderModes = [];
    for (const mode of ['wireframe', 'xray', 'clay', 'shaded']) {
      await run(`window.__envProbe.setPreset('day', { renderMode: '${mode}' })`);
      await sleep(1100);
      const st = await readOut();
      await screenshot(`${OUT}/06-mode-${mode}.png`);
      log.steps.renderModes.push({ mode, dc: st.dc, tri: st.tri });
      console.log('[smoke] mode ' + mode + ' dc=' + st.dc + ' tri=' + st.tri);
    }
    await run(`window.__tree3aPerf.clear()`);
    await sleep(400);
  }
  return log;
};
