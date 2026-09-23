// T018.3 疑点闭 ①双实例排查（一次定论）：
//  A. 列出页面实际加载的 three 相关资源 URL（确认 vite 预构建 URL 是否带 ?v= query）
//  B. 对「不带 query」与「app 实际 URL」两个模块实例分别打原型标记
//     （__probeNoV / __probeApp），遍历 __envProbe.scene 子对象 + webgl 检查归属
//     —— 若仅 __probeNoV 为 false 而 __probeApp 为 true，则「双实例」实为
//     动态 import 不带 query URL 造成的模块记录分裂假阳性（wrap-render 实验无效的直接解释）
//  C. fetch vite 转换后的 /src/runtime/Renderer.ts，确认其 three import 重写形态
export default async (api) => {
  await api.setViewport(1920, 1080);
  await api.navigate('http://localhost:5173/');
  // 等 app 挂载 + __envProbe 就绪（dev 首次编译可能慢）
  const probeReady = await api.evalJs(`(async () => {
    for (let i = 0; i < 60; i++) {
      if (window.__envProbe && window.__envProbe.scene) return true;
      await new Promise(r => setTimeout(r, 500));
    }
    return false;
  })()`);
  if (!probeReady) return { error: '__envProbe not ready after 30s' };

  // A. three 相关资源 URL
  const threeUrls = await api.evalJs(`performance.getEntriesByType('resource')
    .map(e => e.name).filter(n => n.includes('three')).slice(0, 20)`);

  // B. 双标记实验
  const mark = await api.evalJs(`(async () => {
    // 1) 不带 query 的模块实例
    const bare = await import('/node_modules/.vite/deps/three.js');
    bare.Object3D.prototype.__probeNoV = 'bare';
    // 2) app 实际加载的 URL（资源列表里第一个 /node_modules/.vite/deps/three.js?... 变体）
    const res = performance.getEntriesByType('resource').map(e => e.name)
      .filter(n => /\\/node_modules\\/\\.vite\\/deps\\/three.*v=/.test(n));
    const appUrl = res.find(n => /\\/three(\\.js)?\\?/.test(n)) || res[0] || null;
    let appMod = null;
    if (appUrl) {
      appMod = await import(appUrl);
      appMod.Object3D.prototype.__probeApp = 'app';
    }
    // 场景子对象归属统计
    const tally = { noV: 0, app: 0, neither: 0, total: 0 };
    const examples = [];
    window.__envProbe.scene.traverse((o) => {
      tally.total++;
      const proto = o && o.constructor && o.constructor.prototype;
      const tag = proto && (proto.__probeNoV || proto.__probeApp);
      if (tag === 'bare') tally.noV++;
      else if (tag === 'app') tally.app++;
      else {
        tally.neither++;
        if (examples.length < 5 && o && o.type) examples.push(o.type);
      }
    });
    const webglTag = (() => {
      const proto = window.__envProbe.webgl.constructor.prototype;
      return proto.__probeNoV || proto.__probeApp || 'neither';
    })();
    // bare 实例的 WebGLRenderer.prototype.render 是否被 app 实例共享（关键判定）
    const renderShared = appMod
      ? bare.WebGLRenderer.prototype.render === appMod.WebGLRenderer.prototype.render
      : null;
    return {
      appUrl,
      bareObject3DIsAppObject3D: appMod ? bare.Object3D === appMod.Object3D : null,
      renderShared,
      tally,
      neitherExamples: examples,
      webglTag,
      sceneCtorName: window.__envProbe.scene.constructor.name,
    };
  })()`);

  // C. vite 转换后的 Renderer.ts import 形态（three import 行）
  const rendererImports = await api.evalJs(`fetch('/src/runtime/Renderer.ts')
    .then(r => r.text())
    .then(t => t.split('\\n').filter(l => l.includes('from') && (l.includes('three') || l.includes('environment/'))).slice(0, 12))`);

  return { threeUrls, mark, rendererImports };
};
