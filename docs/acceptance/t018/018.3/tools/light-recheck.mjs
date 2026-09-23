// T018.3 疑点闭 ②光照贡献复核（唯一 three 实例已由 instance-check.mjs 坐实）：
//  A. wrap WebGLRenderer.prototype.render 计数——验证主循环确实经过原型 render
//     （上会话 wrap 0 条日志与此矛盾，需在本会话可信复测）
//  B. 场景灯清单（type/intensity/visible/layers）+ scene.environment/intensity 状态
//  C. 注入红 HemisphereLight ×50（唯一实例）→ 截图；应泛红，若零变化 = 直射/环境光零贡献坐实
//  D. app 太阳 DirectionalLight intensity 0 ↔ 50 → 两截图；应显著变暗/爆亮
//  E. 注入 castShadow 白杆 + roughness1 白球（固定机位）→ 截图；影应可见、球应有明暗渐变
//  全程 CDP 截图 + 页内 decode 像素 diff（meanAbsDiff / maxAbsDiff / changedPct）
import { readFileSync } from 'node:fs';

const T_URL = '/node_modules/.vite/deps/three.js'; // 已证与 app ?v=5d480239 同一模块实例

export default async (api) => {
  await api.setViewport(1920, 1080);
  await api.navigate('http://localhost:5173/');
  const ready = await api.evalJs(`(async () => {
    for (let i = 0; i < 60; i++) { if (window.__envProbe?.scene) return true; await new Promise(r => setTimeout(r, 500)); }
    return false;
  })()`);
  if (!ready) return { error: '__envProbe not ready after 30s' };

  // 固定取证机位（正对原点前方地面带）
  await api.evalJs(`(async () => {
    window.__envProbe.camera.position.set(14, 6, 18);
    window.__envProbe.controls.target.set(2, 2, 2);
    window.__envProbe.controls.update();
  })()`);
  await api.sleep(300);

  // A. wrap render 计数（600ms 窗口）
  const wrapCount = await api.evalJs(`(async () => {
    const T = await import('${T_URL}');
    const orig = T.WebGLRenderer.prototype.render;
    let n = 0; const sample = [];
    T.WebGLRenderer.prototype.render = function (...a) {
      n++;
      if (sample.length < 3) sample.push({ scene: a[0]?.type || String(a[0]?.constructor?.name), cam: a[1]?.type || String(a[1]?.constructor?.name), thisCtor: this.constructor?.name });
      return orig.apply(this, a);
    };
    await new Promise(r => setTimeout(r, 600));
    T.WebGLRenderer.prototype.render = orig;
    return { count: n, sample };
  })()`);

  // B. 灯清单 + 环境状态
  const survey = await api.evalJs(`(() => {
    const lights = [];
    window.__envProbe.scene.traverse((o) => {
      if (o.isLight) lights.push({
        type: o.type, intensity: o.intensity, color: '#' + o.color.getHexString(),
        visible: o.visible, layersMask: o.layers.mask, castShadow: !!o.castShadow,
        parentType: o.parent?.type,
      });
    });
    let sun = null;
    window.__envProbe.scene.traverse((o) => { if (o.type === 'DirectionalLight') sun = o; });
    window.__sun = sun;
    window.__sunIntensity0 = sun ? sun.intensity : null;
    return {
      lights,
      sunPosition: sun ? sun.position.toArray().map(v => +v.toFixed(2)) : null,
      cameraLayersMask: window.__envProbe.camera.layers.mask,
      hasEnvironment: !!window.__envProbe.scene.environment,
      environmentIntensity: window.__envProbe.scene.environmentIntensity,
      backgroundCtor: window.__envProbe.scene.background ? String(window.__envProbe.scene.background.constructor?.name) : null,
      programsBefore: window.__envProbe.info().programs,
    };
  })()`);

  await api.screenshot('light-recheck-base.png');

  // C. 红 Hemi ×50
  await api.evalJs(`(async () => {
    const T = await import('${T_URL}');
    const h = new T.HemisphereLight(0xff0000, 0xff0000, 50);
    h.layers.enableAll();
    window.__redHemi = h;
    window.__envProbe.scene.add(h);
  })()`);
  await api.sleep(400);
  await api.screenshot('light-recheck-redhemi.png');
  const programsAfterHemi = await api.evalJs(`window.__envProbe.info().programs`);
  await api.evalJs(`(() => { window.__redHemi.removeFromParent(); return 0; })()`);

  // D. 太阳 intensity 0 → 50 → 恢复
  await api.evalJs(`(() => { window.__sun.intensity = 0; return 0; })()`);
  await api.sleep(400);
  await api.screenshot('light-recheck-sun0.png');
  await api.evalJs(`(() => { window.__sun.intensity = 50; return 0; })()`);
  await api.sleep(400);
  await api.screenshot('light-recheck-sun50.png');
  await api.evalJs(`(() => { window.__sun.intensity = window.__sunIntensity0; return 0; })()`);
  await api.sleep(300);

  // E. castShadow 白杆 + roughness1 白球
  await api.evalJs(`(async () => {
    const T = await import('${T_URL}');
    const g = new T.Group();
    const pole = new T.Mesh(
      new T.BoxGeometry(0.15, 8, 0.15),
      new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }),
    );
    pole.position.set(2, 4, 2);
    pole.castShadow = true;
    const ball = new T.Mesh(
      new T.SphereGeometry(0.9, 32, 16),
      new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 }),
    );
    ball.position.set(5, 1.2, 5);
    ball.castShadow = true;
    g.add(pole, ball);
    window.__envProbe.scene.add(g);
    window.__probeObjs = g;
  })()`);
  await api.sleep(400);
  await api.screenshot('light-recheck-pole.png');

  // 球区域亮度采样（球心投影附近 60×60 窗）：判断「纯平无渐变」
  const ballLuma = await api.evalJs(`(() => {
    // 球世界位 (5,1.2,5) → 粗略按机位估算不可靠，改为全帧找最亮 254 集中带：
    // 这里直接返回固定机位下画面中带 (y 500..700, x 700..1200) 的 luma 直方图
    return 'skipped';
  })()`);
  await api.evalJs(`(() => { window.__probeObjs.removeFromParent(); return 0; })()`);

  // 页内 decode 像素 diff
  const diff = async (fa, fb) => {
    const a = readFileSync(fa).toString('base64');
    const b = readFileSync(fb).toString('base64');
    return api.evalJs(`(async () => {
      const load = async (b64) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        return c.getContext('2d').getImageData(0, 0, img.width, img.height);
      };
      const A = await load(${JSON.stringify(a)}), B = await load(${JSON.stringify(b)});
      let diffSum = 0, maxD = 0, changed = 0, n = 0;
      for (let i = 0; i < A.data.length; i += 4) {
        const la = 0.2126*A.data[i] + 0.7152*A.data[i+1] + 0.0722*A.data[i+2];
        const lb = 0.2126*B.data[i] + 0.7152*B.data[i+1] + 0.0722*B.data[i+2];
        const d = Math.abs(la - lb);
        diffSum += d; if (d > maxD) maxD = d; if (d > 2) changed++; n++;
      }
      return { meanAbsDiff: +(diffSum/n).toFixed(3), maxAbsDiff: +maxD.toFixed(1), changedPct: +(100*changed/n).toFixed(3) };
    })()`);
  };

  return {
    wrapCount,
    survey,
    programsAfterHemi,
    diffs: {
      redHemiVsBase: await diff('light-recheck-base.png', 'light-recheck-redhemi.png'),
      sun0VsBase: await diff('light-recheck-base.png', 'light-recheck-sun0.png'),
      sun50VsBase: await diff('light-recheck-base.png', 'light-recheck-sun50.png'),
      poleVsBase: await diff('light-recheck-base.png', 'light-recheck-pole.png'),
    },
  };
};
