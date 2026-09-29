// T009 性能验收 CDP 驱动：直连手动 Chrome（vsync 关闭口径），eval + 截图
// 用法：node cdp.mjs <script.js>  —— script.js 导出 async ({evalJs, screenshot, navigate, setViewport, sleep}) => result
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
    async screenshot(filePath) {
      const result = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(filePath, Buffer.from(result.data, 'base64'));
      return filePath;
    },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  };
  const mod = await import(new URL(process.argv[2], `file:///${process.cwd().replace(/\\/g, '/')}/`).href);
  const result = await mod.default(api);
  console.log(JSON.stringify(result, null, 2));
  ws.close();
}

main().catch((err) => { console.error('CDP driver error:', err.message); process.exit(1); });
