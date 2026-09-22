// T011.10 fraxinus 真实编译验证 CDP 驱动脚本（自含 CDP 客户端——端口约定 9334，
// 沿 011.9 tools/compile-check-driver.mjs + 011.8 tools/cdp.mjs 模式合体；
// vite dev 5198 服务 docs/ 静态页 + /src 模块）。
// 用法：node docs/acceptance/t011/011.10/tools/t01110-compile-check-driver.mjs
// 前置：① npx vite --port 5198 --strictPort（repo 根）② headless Chrome --remote-debugging-port=9334
const DEBUG_PORT = 9334;
const PAGE_URL = 'http://localhost:5198/docs/acceptance/t011/011.10/tools/compile-check.html'; // vite 默认绑 localhost（IPv6）——127.0.0.1 不通

async function getWsUrl() {
  const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
  const tab = await res.json();
  return tab.webSocketDebuggerUrl;
}

async function main() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evalJs = async (expression, { awaitPromise = true } = {}) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error('page eval failed: ' + JSON.stringify(result.exceptionDetails, null, 2));
    }
    return result.result.value;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  await send('Page.enable');
  await send('Page.navigate', { url: PAGE_URL });
  await sleep(2500);

  let result = null;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    result = await evalJs('typeof window.__FRAXINUS_COMPILE_CHECK !== "undefined" ? window.__FRAXINUS_COMPILE_CHECK : null', { awaitPromise: false });
    if (result) break;
  }
  ws.close();
  if (!result) {
    const errs = await Promise.resolve(await evalJs('window.__FRAXINUS_ERRORS ?? []', { awaitPromise: false }).catch(() => []));
    console.log(JSON.stringify({ ok: false, errors: ['result missing — page did not set __FRAXINUS_COMPILE_CHECK', ...errs] }, null, 2));
    process.exit(1);
  }
  // X4000 = FXC 保守误报（011.6 终裁口径——接受记档不追逐，归 011.13 复叶系议题）；其余 warning 视为真实告警
  const realWarnings = (result.warnings ?? []).filter((w) => !String(w).includes('X4000'));
  const x4000 = (result.warnings ?? []).filter((w) => String(w).includes('X4000'));
  console.log(JSON.stringify({ ...result, warnings: realWarnings, x4000, verdict: result.ok && realWarnings.length === 0 ? 'PASS' : 'FAIL' }, null, 2));
  process.exit(result.ok && realWarnings.length === 0 ? 0 : 1);
}

main().catch((err) => { console.error('CDP driver error:', err.message); process.exit(1); });
