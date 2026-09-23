// T018.3 疑点闭 ⑤program 层取证：
//  A. wrap renderer 实例 render（own property，非原型！）——数每帧渲染次数 + 各次 scene/camera
//  B. renderer.info.programs 各 program 的 fragmentShader prefix 中灯 defines
//     （NUM_DIR_LIGHTS / NUM_HEMI_LIGHTS / NUM_POINT_LIGHTS / NUM_SPOT_LIGHTS）
//     —— defines=0 ⇒ lights state 收集/program 缓存键问题；defines 正常 ⇒ uniform 值问题
export default async (api) => {
  await api.setViewport(1920, 1080);
  await api.navigate('http://localhost:5173/');
  const ready = await api.evalJs(`(async () => {
    for (let i = 0; i < 60; i++) { if (window.__envProbe?.webgl) return true; await new Promise(r => setTimeout(r, 500)); }
    return false;
  })()`);
  if (!ready) return { error: 'probe not ready' };

  // A. wrap 实例 render（600ms 窗口）
  const wrapCount = await api.evalJs(`(async () => {
    const r = window.__envProbe.webgl;
    const orig = r.render;
    let n = 0; const scenes = {};
    r.render = function (scene, camera) {
      n++;
      const k = (scene?.type || '?') + '|' + (camera?.type || '?');
      scenes[k] = (scenes[k] || 0) + 1;
      return orig.apply(this, arguments);
    };
    await new Promise(r2 => setTimeout(r2, 600));
    r.render = orig;
    return { count: n, scenes };
  })()`);

  // B. program 灯 defines + C. 灯清单复核
  const defines = await api.evalJs(`(() => {
    const r = window.__envProbe.webgl;
    const progs = r.info.programs || [];
    const rows = progs.map((p, i) => {
      const fs = typeof p.fragmentShader === 'string' ? p.fragmentShader : '';
      const pick = (re) => (typeof fs === 'string' && fs.match ? (fs.match(re) || [])[0] : null);
      return {
        i,
        dir: pick(/#define NUM_DIR_LIGHTS \\d+/),
        hemi: pick(/#define NUM_HEMI_LIGHTS \\d+/),
        point: pick(/#define NUM_POINT_LIGHTS \\d+/),
        spot: pick(/#define NUM_SPOT_LIGHTS \\d+/),
        shadowMaps: pick(/#define NUM_DIR_LIGHT_SHADOWS \\d+/),
        fsHead: fs.replace(/\\s+/g, ' ').slice(0, 90),
        keysOfP: Object.keys(p).slice(0, 12),
      };
    });
    // 场景灯复核（此刻）
    const lights = [];
    window.__envProbe.scene.traverse((o) => {
      if (o.isLight) lights.push({ type: o.type, intensity: o.intensity, visible: o.visible });
    });
    return { programCount: progs.length, rows, lights };
  })()`);

  return { wrapCount, defines };
};
