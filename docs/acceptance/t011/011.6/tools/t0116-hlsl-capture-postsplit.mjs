// T011.6 形态 A 落地后取证（2026-09-21）：hook 转译原文（改用 handle 轮询 + 独立落盘
// hlsl-capture-postsplit.json，不覆写前任 hlsl-capture.json）——验证 ANGLE 转译层保留
// koePinna 子函数（拆分在 GLSL→HLSL 层成立）、FXC 优化内联后数据流回填（X4000 复现的机理证据）
import { writeFileSync } from 'node:fs';
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  for (let i = 0; i < 60; i++) {
    if (await evalJs('!!window.__koelreuteria', { awaitPromise: false })) break;
    await sleep(500);
  }
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
          }
          window.__koeShaders.push({ translated: translated, log: this.getShaderInfoLog(sh) });
        }
      } catch (e) { window.__diag.push('hook-err:' + String(e)); }
    };
  })()`, { awaitPromise: false });

  // hook 挂在已有 handle 的页面上——unmount/remount 触发新深度材质编译（program cache 会命中 program，
  // 但 compileShader 每材质构建必经；全新 tab + 首次 mount 已编译过则用 unmount→mount 重编译路径取证）
  await evalJs('window.__koelreuteria.mount()');
  await sleep(2000);

  const raw = await evalJs('JSON.stringify({ diag: window.__diag, n: window.__koeShaders.length, shaders: window.__koeShaders.map(function (r) { return r; }) })');
  const parsed = JSON.parse(raw);
  writeFileSync('docs/acceptance/t011/011.6/tools/hlsl-capture-postsplit.json', JSON.stringify(parsed, null, 1));
  const s0 = parsed.shaders[0] || {};
  const t = s0.translated || '';
  return {
    diag: parsed.diag, n: parsed.n, firstLog: s0.log, translatedLen: t.length,
    hasPinnaFnInHlsl: t.includes('koePinna('),
    fKoeDepthAlphaCount: t.split('f_koeDepthAlpha').length - 1,
    line111: t.split('\n')[110] || '(short)',
  };
};
