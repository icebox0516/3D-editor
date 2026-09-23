// T018.3 疑点闭 ⑦饱和假设验证：Preetham HDR 天空 → PMREM irradiance >> 1 →
// NoToneMapping clamp 254 饱和 → 直射增量被吞。验证：
//  A. ACESFilmic toneMapping 打开（全部材质重编译）→ 画面应出现层次；
//     且此后太阳 intensity 0/50 应产生大像素变化（脱离饱和区后直射光可见）
//  B. day 地面/球在 NoToneMapping 下读数应 ~254（饱和），ACES 下显著降低
//  C. 环境恢复原 toneMapping，无残留
import { readFileSync } from 'node:fs';

const T_URL = '/node_modules/.vite/deps/three.js';

export default async (api) => {
  await api.setViewport(1920, 1080);
  await api.navigate('http://localhost:5173/');
  const ready = await api.evalJs(`(async () => {
    for (let i = 0; i < 60; i++) { if (window.__envProbe?.scene) return true; await new Promise(r => setTimeout(r, 500)); }
    return false;
  })()`);
  if (!ready) return { error: 'probe not ready' };

  await api.evalJs(`(async () => {
    window.__envProbe.camera.position.set(10, 4, 14);
    window.__envProbe.controls.target.set(0, 2, 0);
    window.__envProbe.controls.update();
    const T = await import('${T_URL}');
    const ball = new T.Mesh(
      new T.SphereGeometry(1.6, 48, 24),
      new T.MeshStandardMaterial({ color: 0x808080, roughness: 0.5, metalness: 0 }),
    );
    ball.position.set(0, 2, 0);
    ball.castShadow = true;
    window.__envProbe.scene.add(ball);
    window.__ball = ball;
    let sun = null;
    window.__envProbe.scene.traverse((o) => { if (o.type === 'DirectionalLight') sun = o; });
    window.__sun = sun;
    const r = window.__envProbe.webgl;
    window.__toneMapping0 = r.toneMapping;
    window.__exposure0 = r.toneMappingExposure;
  })()`);
  await api.sleep(500);
  await api.screenshot('sat-base-notonemap.png');

  // 地面中心读数（页内 decode 截图不行——截图在 node 侧；改为直接看 diff 数值即可）

  // A1: 打开 ACES
  await api.evalJs(`(() => {
    const r = window.__envProbe.webgl;
    r.toneMapping = 4 /* ACESFilmicToneMapping */;
    r.toneMappingExposure = 1.0;
    return 0;
  })()`);
  await api.sleep(800); // 重编译 + 数帧
  await api.screenshot('sat-aces-on.png');

  // A2: ACES 下太阳 0
  await api.evalJs(`(() => { window.__sun.intensity = 0; return 0; })()`);
  await api.sleep(600);
  await api.screenshot('sat-aces-sun0.png');

  // A3: ACES 下太阳 50
  await api.evalJs(`(() => { window.__sun.intensity = 50; return 0; })()`);
  await api.sleep(600);
  await api.screenshot('sat-aces-sun50.png');

  // 恢复
  await api.evalJs(`(() => {
    const r = window.__envProbe.webgl;
    window.__sun.intensity = 2.4;
    r.toneMapping = window.__toneMapping0;
    r.toneMappingExposure = window.__exposure0;
    window.__ball.removeFromParent();
    return 0;
  })()`);
  await api.sleep(600);

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
      let diffSum = 0, maxD = 0, changed = 0, n = 0, lumaA = 0, lumaB = 0;
      for (let i = 0; i < A.data.length; i += 4) {
        const la = 0.2126*A.data[i] + 0.7152*A.data[i+1] + 0.0722*A.data[i+2];
        const lb = 0.2126*B.data[i] + 0.7152*B.data[i+1] + 0.0722*B.data[i+2];
        const d = Math.abs(la - lb);
        diffSum += d; if (d > maxD) maxD = d; if (d > 2) changed++; n++; lumaA += la; lumaB += lb;
      }
      return { meanLumaA: +(lumaA/n).toFixed(1), meanLumaB: +(lumaB/n).toFixed(1), meanAbsDiff: +(diffSum/n).toFixed(3), maxAbsDiff: +maxD.toFixed(1), changedPct: +(100*changed/n).toFixed(3) };
    })()`);
  };

  return {
    diffs: {
      acesVsBase: await diff('sat-base-notonemap.png', 'sat-aces-on.png'),
      acesSun0VsAces: await diff('sat-aces-on.png', 'sat-aces-sun0.png'),
      acesSun50VsAces: await diff('sat-aces-on.png', 'sat-aces-sun50.png'),
    },
  };
};
