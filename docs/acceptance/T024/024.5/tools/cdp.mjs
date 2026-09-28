// T024.5 CDP 驱动（复制自 docs/acceptance/T024/024.4/tools/cdp.mjs 体例：
// 单 navigate/会话 + 裸 send 透传 + captureBeyondViewport 截帧）。
// T024.5 增强（取证需求）：
//   ① Runtime/Log 域事件全程收集——console.error/warning、未捕获异常、浏览器侧
//      Log 条目（网络错/WebGL 警告）自标签页创建起零遗漏（024.3 手法是 navigate 后
//      覆写 console.*，装载期错误盲区在此补齐）；api.consoleLogs() 读取。
//   ② 会话结束关闭本调用创建的标签页——批量取证（13 树 × 2 构建 + 干区 11 树）
//      不在浏览器内积累 WebGL 上下文。
// 用法：node cdp.mjs <script.mjs>  —— script 导出 async (api) => result
import { writeFileSync } from 'node:fs';

const DEBUG_PORT = 9333;

async function getTab() {
  const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
  const tab = await res.json();
  return { wsUrl: tab.webSocketDebuggerUrl, targetId: tab.id };
}

async function main() {
  const { wsUrl, targetId } = await getTab();
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0;
  const pending = new Map();
  const consoleLogs = [];
  const fmtArgs = (args) => args
    .map((a) => {
      if (a.value !== undefined) return typeof a.value === 'string' ? a.value : JSON.stringify(a.value);
      return a.description ?? a.type ?? '??';
    })
    .join(' ');
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const { type, args } = msg.params;
      if (type === 'error' || type === 'warning') consoleLogs.push(`console.${type}: ${fmtArgs(args)}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      consoleLogs.push(`exception: ${d.text} ${d.exception?.description ?? ''}`);
    } else if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      if (e.level === 'error' || e.level === 'warning') {
        consoleLogs.push(`log.${e.level}: ${e.text}${e.url ? ' [' + e.url + ']' : ''}`);
      }
    } else if (msg.method === 'Fetch.requestPaused') {
      // favicon 通道噪声抑制：浏览器自发请求 dev server 不存在的 /favicon.ico（404），
      // 与被测应用无关——驱动器统一 fulfill 空 200（两构建同等处理，不入 console 判据）。
      const { requestId } = msg.params;
      ws.send(JSON.stringify({
        id: ++seq,
        method: 'Fetch.fulfillRequest',
        params: {
          requestId,
          responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'image/x-icon' }],
          body: '',
        },
      }));
    }
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
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*favicon*', requestStage: 'Request' }] });
  const api = {
    send,
    async navigate(url) {
      await send('Page.enable');
      await send('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 2500));
    },
    async setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    },
    async evalJs(expression, { awaitPromise = true } = {}) {
      const result = await send('Runtime.evaluate', {
        expression,
        awaitPromise,
        returnByValue: true,
      });
      if (result.exceptionDetails) {
        throw new Error('page eval failed: ' + JSON.stringify(result.exceptionDetails, null, 2));
      }
      return result.result.value;
    },
    async screenshot(filePath, { fullPage = false, clip = undefined } = {}) {
      const params = { format: 'png' };
      if (fullPage) params.captureBeyondViewport = true;
      if (clip) params.clip = clip;
      const result = await send('Page.captureScreenshot', params);
      writeFileSync(filePath, Buffer.from(result.data, 'base64'));
      return filePath;
    },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    consoleLogs: () => consoleLogs.slice(),
  };
  try {
    const mod = await import(new URL(process.argv[2], `file:///${process.cwd().replace(/\\/g, '/')}/`).href);
    const result = await mod.default(api);
    console.log(JSON.stringify({ result, consoleLogs }, null, 2));
  } finally {
    try { ws.close(); } catch { /* ignore */ }
    try { await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/close/${targetId}`); } catch { /* ignore */ }
  }
}

main().catch((err) => { console.error('CDP driver error:', err.message); process.exit(1); });
