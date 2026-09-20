// T011.6 根因取证 2（9338 已污染——此版改用 9339 跑）：hook 存转译原文，node 侧落盘分析
import { writeFileSync } from 'node:fs';
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`(function () {
    window.__koeShaders = [];
    window.__diag = [];
    const proto = WebGL2RenderingContext.prototype;
    const orig = proto.compileShader;
    proto.compileShader = function (sh) {
      orig.call(this, sh);
      try {
        const src = this.getShaderSource(sh) || '';
        if (src.includes('koeDepthAlpha')) {
          const dbg = this.getExtension('WEBGL_debug_shaders');
          let translated = null;
          if (dbg && typeof dbg.getTranslatedShaderSource === 'function') {
            translated = dbg.getTranslatedShaderSource(sh);
          } else {
            window.__diag.push('dbg-methods:' + (dbg ? Object.getOwnPropertyNames(Object.getPrototypeOf(dbg)).join(',') : 'null'));
          }
          window.__koeShaders.push({ translated: translated, log: this.getShaderInfoLog(sh) });
        }
      } catch (e) { window.__diag.push('hook-err:' + String(e)); }
    };
  })()`, { awaitPromise: false });

  await evalJs('window.__koelreuteria.mount()');
  await sleep(2000);

  const raw = await evalJs('JSON.stringify({ diag: window.__diag, n: window.__koeShaders.length, shaders: window.__koeShaders.map(function (r) { return r; }) })');
  const parsed = JSON.parse(raw);
  writeFileSync('docs/acceptance/t011/011.6/tools/hlsl-capture.json', JSON.stringify(parsed, null, 1));
  return { diag: parsed.diag, n: parsed.n, firstLog: parsed.shaders[0] && parsed.shaders[0].log, translatedLen: parsed.shaders.map((s) => (s.translated ? s.translated.length : 0)) };
};
