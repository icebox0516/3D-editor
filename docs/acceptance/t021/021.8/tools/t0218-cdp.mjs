// T021.8 Phase C CDP 驱动（011.13 cdp.mjs 增强版）：
//  - 直连手动 Chrome（vsync-off 口径：--disable-gpu-vsync --disable-frame-rate-limit）
//  - 被动 console/exception 捕获（Runtime.consoleAPICalled + exceptionThrown + Log.entryAdded）
//    ——产品页无内置捕获面（harness 页自带 __CALIB 面，两路并存去重）
//  - evalJs / navigate / setViewport / screenshot / dumpConsole / clearConsole
// 用法：node t0218-cdp.mjs <script.mjs> [outFile.json]
//   script.mjs 导出 async (api) => result；返回值 + consoleLog 一并写入 outFile（缺省打印）
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

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
  /** 被动捕获面：console 消息（按级别）+ 未捕获异常 + Log 条目 */
  const consoleLog = [];
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
      const { type, args, timestamp } = msg.params;
      const text = args.map((a) => (a.value !== undefined ? String(a.value) : (a.description ?? a.type))).join(' ');
      consoleLog.push({ kind: 'console', type, text, timestamp });
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      consoleLog.push({ kind: 'exception', type: 'error', text: (d.exception?.description ?? d.text ?? 'exception'), timestamp: msg.params.timestamp });
    } else if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      consoleLog.push({ kind: 'log', type: e.level, text: `[${e.source}] ${e.text}`, timestamp: e.timestamp });
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  const api = {
    send,
    consoleLog,
    async navigate(url) {
      await send('Page.enable');
      await send('Runtime.enable');
      await send('Log.enable');
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
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, Buffer.from(result.data, 'base64'));
      return filePath;
    },
    /** 页内控制台面（harness 页 __CALIB_* 数组）——与驱动侧捕获合并读数 */
    async pageConsole() {
      return send('Runtime.evaluate', {
        expression: '(() => ({ errors: window.__CALIB_ERRORS ?? null, warnings: window.__CALIB_WARNINGS ?? null }))()',
        returnByValue: true,
      }).then((r) => r.result.value);
    },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  };
  const mod = await import(new URL(process.argv[2], `file:///${process.cwd().replace(/\\/g, '/')}/`).href);
  const result = await mod.default(api);
  const out = { result, driverConsoleLog: consoleLog };
  if (process.argv[3]) {
    mkdirSync(dirname(process.argv[3]), { recursive: true });
    writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
    console.log(`written: ${process.argv[3]}`);
  } else {
    console.log(JSON.stringify(out, null, 1));
  }
  ws.close();
}

main().catch((err) => { console.error('CDP driver error:', err.message); process.exit(1); });
