// T018.3 疑点闭 ⑥阴影假设验证：direct light 项被 shadow 采样 visibility(0) 清零的假设
//  注入中灰球（albedo 0.5 / roughness 0.5——对直射光高动态响应、远离饱和），
//  序列：base → sun.castShadow=false（去阴影采样重编译，若直射释放画面应大变）
//        → castShadow 恢复 → sun.color=红（直射漫射色响应）→ 恢复
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
    window.__sunColor0 = sun.color.getHex();
  })()`);
  await api.sleep(500);
  await api.screenshot('shadow-hyp-base.png');

  await api.evalJs(`(() => { window.__sun.castShadow = false; return 0; })()`);
  await api.sleep(600);
  await api.screenshot('shadow-hyp-castshadow-off.png');
  const programsNoShadow = await api.evalJs(`window.__envProbe.info().programs`);

  await api.evalJs(`(() => { window.__sun.castShadow = true; return 0; })()`);
  await api.sleep(600);
  await api.screenshot('shadow-hyp-castshadow-on.png');

  await api.evalJs(`(() => { window.__sun.color.setHex(0xff2020); return 0; })()`);
  await api.sleep(600);
  await api.screenshot('shadow-hyp-sunred.png');

  await api.evalJs(`(() => { window.__sun.color.setHex(window.__sunColor0); window.__ball.removeFromParent(); return 0; })()`);
  await api.sleep(400);

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
    programsNoShadow,
    diffs: {
      castShadowOffVsBase: await diff('shadow-hyp-base.png', 'shadow-hyp-castshadow-off.png'),
      castShadowOnVsBase: await diff('shadow-hyp-base.png', 'shadow-hyp-castshadow-on.png'),
      sunRedVsBase: await diff('shadow-hyp-base.png', 'shadow-hyp-sunred.png'),
    },
  };
};
