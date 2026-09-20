// T011.6 校准复判·终轮（9337 全新 profile 冷启动）：三档首编译遍历 + 转台 + 分阶段 console 快照
// + WEBGL_debug_shaders 能力检查（转译源取证可行性）+ mount 时点模块源校验（修复版在场证明）
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`
    (function () {
      window.__t0116log = [];
      const push = (kind) => (...args) => window.__t0116log.push(kind + ':' + args.map(String).join(' '));
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const out = {};
  // 能力 + 模块源在场证明（修复版进 GPU 前的最后一跳）
  out.env = await evalJs(`(async function () {
    const canvas = document.querySelector('canvas');
    const gl = document.createElement('canvas').getContext('webgl2');
    const exts = gl ? gl.getSupportedExtensions() : [];
    const res = await fetch('/src/runtime/procedural/tree/koelreuteria/koelreuteriaMaterials.ts');
    const text = await res.text();
    return {
      webgl2: !!gl,
      hasDebugShaders: exts.includes('WEBGL_debug_shaders'),
      moduleHasFix: text.includes('koeDCen = 0.0'),
      moduleHasL523bare: /float koeFCen; float koeFVar;/.test(text),
    };
  })()`);

  const snapshot = () => evalJs('(function(){ return window.__t0116log.slice() })()');

  // handle 就绪轮询（vite 冷启动首次转换可超 navigate 固定 2.5s 等待——最小改造记档 2026-09-21）
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    if (await evalJs('!!window.__koelreuteria', { awaitPromise: false })) break;
    await sleep(500);
  }

  // 阶段 1：单树 mount（High 皮/叶颜色材质 + 深度材质首编译）
  await evalJs('window.__koelreuteria.mount()');
  await sleep(1500);
  out.stage1_highFirstCompile = await snapshot();

  // 阶段 2：三档 mountLevels（Mid/Low 颜色/深度首编译——L523 颜色侧观察位）
  await evalJs('window.__koelreuteria.unmount()');
  await evalJs('window.__koelreuteria.mountLevels({ slot: 0 })');
  await evalJs('window.__koelreuteria.viewLevels()');
  await sleep(1500);
  out.stage2_levelsMidLowFirstCompile = await snapshot();

  // 阶段 3：转台一轮
  await evalJs('window.__koelreuteria.unmount()');
  await evalJs('window.__koelreuteria.mount()');
  await evalJs('window.__koelreuteria.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__koelreuteria.turntable(0)');
  await evalJs('window.__koelreuteria.dispose()');
  out.stage3_turntable = await snapshot();

  out.finalVerdict = (out.stage3_turntable.length === 0 && out.stage2_levelsMidLowFirstCompile.length === 0 && out.stage1_highFirstCompile.length === 0) ? 'ZERO_ERROR_ZERO_WARN' : 'VIOLATION';
  return out;
};
