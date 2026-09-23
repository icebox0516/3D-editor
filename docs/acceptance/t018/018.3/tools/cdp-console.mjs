// T018.1 取证 CDP 驱动（cdp.mjs + console 捕获）：Log.entryAdded /
// Runtime.consoleAPICalled 收集 error/warning 级条目，api.consoleLog() 读取。
// 用法：node cdp-console.mjs <script.mjs>
import { writeFileSync } from 'node:fs';

const DEBUG_PORT = 9333;

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
  const consoleEntries = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
      return;
    }
    if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      if (e.level === 'error' || e.level === 'warning') consoleEntries.push({ src: 'log', level: e.level, text: (e.text || '').slice(0, 300) });
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const { type, args } = msg.params;
      if (type === 'error' || type === 'warning') {
        consoleEntries.push({ src: 'console', level: type, text: args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300) });
      }
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const api = {
    send,
    async enableConsole() {
      await send('Log.enable');
      await send('Runtime.enable');
    },
    consoleLog: () => consoleEntries.slice(),
    async navigate(url) {
      await send('Page.enable');
      await send('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 2500));
    },
    async setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    },
    async evalJs(expression, { awaitPromise = true } = {}) {
      const result = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
      if (result.exceptionDetails) {
        throw new Error('page eval failed: ' + JSON.stringify(result.exceptionDetails, null, 2));
      }
      return result.result.value;
    },
    async screenshot(filePath) {
      const result = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(filePath, Buffer.from(result.data, 'base64'));
      return filePath;
    },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  };
  const mod = await import(new URL(process.argv[2], `file:///${process.cwd().replace(/\\/g, '/')}/`).href);
  const result = await mod.default(api);
  result.__console = api.consoleLog();
  console.log(JSON.stringify(result, null, 2));
  ws.close();
}

main().catch((err) => { console.error('CDP driver error:', err.message); process.exit(1); });
