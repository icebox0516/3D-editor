// T011.10 fraxinusStage 合并后真实编译验证 CDP 驱动（011.9 tools/stage-check-driver.mjs
// 同构复制——自持 ws 事件流：Runtime.consoleAPICalled / exceptionThrown 全量捕获，供
// 三档 GLSL 零错误零警告判定；端口约定沿本树材质编译取证：vite 5198 + CDP 9334）。
// 用法：
//   node docs/acceptance/t011/011.10/tools/t01110-stage-check-driver.mjs
// 前置：① npx vite --port 5198 --strictPort（repo 根）② headless Chrome --remote-debugging-port=9334
import { writeFileSync } from 'node:fs';

const DEBUG_PORT = 9334;
const APP_URL = 'http://localhost:5198/';
const SHOT = 'D:/3D-editor/screenshots/t01110-fraxinus-stage-m25-tmp.png';

async function getWsUrl() {
  const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
  const tab = await res.json();
  return tab.webSocketDebuggerUrl;
}

async function main() {
  const ws = new WebSocket(await getWsUrl());
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0;
  const pending = new Map();
  /** console / exception 全量事件流（判定证据） */
  const consoleEvents = [];
  const markers = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ');
      consoleEvents.push({ type: msg.params.type, text: String(text).slice(0, 500) });
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      consoleEvents.push({ type: 'exception', text: String(d?.exception?.description ?? d?.text ?? '').slice(0, 500) });
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evalJs = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error('page eval failed: ' + JSON.stringify(result.exceptionDetails, null, 2));
    }
    return result.result.value;
  };
  const mark = async (name) => {
    markers.push({ name, at: consoleEvents.length });
    await evalJs(`console.log('__MARK__${name}')`);
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false });
  await mark('navigate');
  await send('Page.navigate', { url: APP_URL });
  await sleep(3000);

  // 等待 app 启动挂出 __fraxinus（DEV 守卫 + Renderer 装配）
  let booted = false;
  for (let i = 0; i < 40; i++) {
    booted = await evalJs('typeof window.__fraxinus !== "undefined"');
    if (booted) break;
    await sleep(500);
  }
  if (!booted) {
    return { ok: false, reason: 'window.__fraxinus 未出现（app 未启动或 DEV 守卫未过）', consoleEvents };
  }

  // Phase 1：slot-0 单树 mount（High 档 + 树影 shadow pass——customDepthMaterial 真实编译）
  await mark('mount');
  await evalJs('window.__fraxinus.mount()');
  await sleep(2000); // 连续渲染循环逐帧出画——程序编译并执行

  // Phase 2：三档横排 mountLevels（Mid/Low 材质 + 深度材质档位变体编译——含 shadow pass 同源深度）
  await mark('mountLevels');
  await evalJs('window.__fraxinus.mountLevels()');
  await sleep(2500);
  const levelStats = await evalJs('JSON.stringify(window.__fraxinus.stats())');

  // Phase 3：回到 slot-0 单树 M25 基线取证（freezeTime 固定风相位）
  await mark('m25');
  await evalJs('window.__fraxinus.mount(); window.__fraxinus.view(); window.__fraxinus.freezeTime()');
  await sleep(800);
  const mountStats = await evalJs('JSON.stringify(window.__fraxinus.stats())');

  // 树高实测：页内动态 import 同一 asset build（与 mount() 同缺省 seed = slot-0 锚点，
  // 确定性逐位一致 → 即挂载树的实际组包围盒；测后资源即释放）
  const height = await evalJs(`(async () => {
    const m = await import('/src/runtime/procedural/assets/asset_tree_fraxinus.asset');
    const s = m.build();
    s.geometry.computeBoundingBox();
    const bb = s.geometry.boundingBox;
    const pos = s.geometry.getAttribute('position');
    const leaf = s.geometry.groups[1];
    let leafMinY = Infinity;
    for (let i = leaf.start; i < leaf.start + leaf.count; i++) leafMinY = Math.min(leafMinY, pos.getY(i));
    const out = { maxY: bb.max.y, minY: bb.min.y, maxX: bb.max.x, maxZ: bb.max.z, minX: bb.min.x, minZ: bb.min.z, leafMinY };
    s.geometry.dispose();
    for (const mat of s.material) mat.dispose();
    s.customDepthMaterial.dispose();
    return out;
  })()`);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(SHOT, Buffer.from(shot.data, 'base64'));

  // 挂载态收尾（不留运行态）+ 判定汇总
  await evalJs('window.__fraxinus.unmount()');
  await sleep(300);
  await mark('end');
  const allText = consoleEvents.map((e) => `${e.type}: ${e.text}`);
  const errors = consoleEvents.filter((e) => e.type === 'error' || e.type === 'exception').map((e) => e.text);
  const warnings = consoleEvents.filter((e) => e.type === 'warning').map((e) => e.text);
  const x4000 = warnings.filter((w) => String(w).includes('X4000')); // FXC 保守误报——011.6 终裁口径接受记档（归 011.13 复叶系议题）
  const realWarnings = warnings.filter((w) => !String(w).includes('X4000'));
  ws.close();
  return {
    ok: errors.length === 0 && realWarnings.length === 0,
    verdict: errors.length === 0 && realWarnings.length === 0 ? 'PASS' : 'FAIL',
    errors,
    realWarnings,
    x4000,
    markers,
    levelStats: levelStats ? JSON.parse(levelStats) : null,
    mountStats: mountStats ? JSON.parse(mountStats) : null,
    height,
    screenshot: SHOT,
    consoleTotal: consoleEvents.length,
    consoleSample: allText.slice(0, 40),
  };
}

main()
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .catch((err) => { console.error('CDP driver error:', err.message); process.exit(1); });
