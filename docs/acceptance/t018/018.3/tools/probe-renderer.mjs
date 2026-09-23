// T018.3 疑点闭 ③：__envProbe.webgl 的原型链与 render 方法来源检查
// （wrap 原型 render 0 命中 + 画面持续更新 ⇒ 实例覆盖/子类 override/bound 引用三候选）
export default async (api) => {
  await api.setViewport(1920, 1080);
  await api.navigate('http://localhost:5173/');
  const ready = await api.evalJs(`(async () => {
    for (let i = 0; i < 60; i++) { if (window.__envProbe?.webgl) return true; await new Promise(r => setTimeout(r, 500)); }
    return false;
  })()`);
  if (!ready) return { error: 'probe not ready' };

  return api.evalJs(`(async () => {
    const T = await import('/node_modules/.vite/deps/three.js');
    const r = window.__envProbe.webgl;
    const proto1 = Object.getPrototypeOf(r);
    const proto2 = Object.getPrototypeOf(proto1);
    return {
      ctorName: r.constructor?.name,
      instanceofWebGLRenderer: r instanceof T.WebGLRenderer,
      hasOwnRender: Object.prototype.hasOwnProperty.call(r, 'render'),
      renderLooksBound: String(r.render).replace(/\\s+/g, ' ').slice(0, 80),
      proto1Ctor: proto1?.constructor?.name,
      proto2Ctor: proto2?.constructor?.name,
      proto1RenderIsBase: proto1.render === T.WebGLRenderer.prototype.render,
      proto2IsBasePrototype: proto2 === T.WebGLRenderer.prototype,
      baseRenderSrc: String(T.WebGLRenderer.prototype.render).replace(/\\s+/g, ' ').slice(0, 100),
      isWebGL2: !!r.getContext?.()?.constructor?.name,
      glCtor: r.getContext?.()?.constructor?.name,
    };
  })()`);
};
