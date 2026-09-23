// T018.3 疑点闭 ④联合实验（修正前序实验设计缺陷——太阳开关必须在受光物入画时做）：
//  注入 castShadow 白杆 + standard 白球 + basic 白球（对照），固定机位，然后：
//  base(sun 2.4) → sun 0 → sun 50 → 恢复 → env null → 恢复
//  逐帧截图 + 像素 diff——杆/球明暗与影子随太阳变化 = 直射光管线正常，
//  此前「零贡献」全部为「画面无受光物」的实验设计假象。
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
    window.__envProbe.camera.position.set(14, 6, 18);
    window.__envProbe.controls.target.set(2, 2, 2);
    window.__envProbe.controls.update();
    const T = await import('${T_URL}');
    const g = new T.Group();
    const pole = new T.Mesh(new T.BoxGeometry(0.15, 8, 0.15), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    pole.position.set(2, 4, 2); pole.castShadow = true;
    const stdBall = new T.Mesh(new T.SphereGeometry(0.9, 48, 24), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 }));
    stdBall.position.set(6, 1.2, 2); stdBall.castShadow = true;
    const basicBall = new T.Mesh(new T.SphereGeometry(0.9, 48, 24), new T.MeshBasicMaterial({ color: 0xffffff }));
    basicBall.position.set(6, 1.2, -2);
    g.add(pole, stdBall, basicBall);
    window.__envProbe.scene.add(g);
    window.__probeObjs = g;
    // 环境引用保存
    window.__savedEnv = window.__envProbe.scene.environment;
    // 找太阳
    let sun = null;
    window.__envProbe.scene.traverse((o) => { if (o.type === 'DirectionalLight') sun = o; });
    window.__sun = sun; window.__sun0 = sun.intensity;
  })()`);
  await api.sleep(500);
  await api.screenshot('joint-base.png');

  await api.evalJs(`(() => { window.__sun.intensity = 0; return 0; })()`);
  await api.sleep(500);
  await api.screenshot('joint-sun0.png');

  await api.evalJs(`(() => { window.__sun.intensity = 50; return 0; })()`);
  await api.sleep(500);
  await api.screenshot('joint-sun50.png');

  await api.evalJs(`(() => { window.__sun.intensity = window.__sun0; return 0; })()`);
  await api.sleep(500);
  await api.screenshot('joint-sunrestore.png');

  await api.evalJs(`(() => { window.__envProbe.scene.environment = null; return 0; })()`);
  await api.sleep(500);
  await api.screenshot('joint-envnull.png');

  await api.evalJs(`(() => { window.__envProbe.scene.environment = window.__savedEnv; return 0; })()`);
  await api.sleep(500);
  await api.screenshot('joint-envrestore.png');

  await api.evalJs(`(() => { window.__probeObjs.removeFromParent(); return 0; })()`);

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
    diffs: {
      sun0VsBase: await diff('joint-base.png', 'joint-sun0.png'),
      sun50VsBase: await diff('joint-base.png', 'joint-sun50.png'),
      sunRestoreVsBase: await diff('joint-base.png', 'joint-sunrestore.png'),
      envNullVsBase: await diff('joint-base.png', 'joint-envnull.png'),
      envRestoreVsBase: await diff('joint-base.png', 'joint-envrestore.png'),
    },
  };
};
