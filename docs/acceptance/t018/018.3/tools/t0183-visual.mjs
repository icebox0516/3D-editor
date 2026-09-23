// T018.3 增量视觉验证（D30 口径——非资产任务）：① 四预设差异化探针（environmentIntensity
// 按预设 + 单一开关不变式）② 四预设同机位（夏栎 + 阴影方向/长度 + 天空/IBL 差异——太阳角
// 差异化首次生效）③ day 删 Hemi 对照（018.2 同款金属三球注入同机位——偏亮中间态应消除）
// ④ fallback 取证（monkey-patch fromScene 抛错 → legacy 渐变 + Hemi 完整路径 + console.error
// 记档 + 恢复不粘死）⑤ 单一开关交替循环 growth10（sky↔legacy 交替——事务清理零泄漏）。
export default async ({ navigate, setViewport, evalJs, screenshot, sleep, enableConsole }) => {
  await enableConsole();
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const log = {};

  // ── ① 四预设探针：environmentIntensity 按预设值（1.0/0.85/0.35/0.7）+ 单一开关不变式
  //    （sky 态：environment 非空 / background null / 零 Hemi / displaySky 存在）──
  const probe = async (preset) => evalJs(`(async () => {
    window.__envProbe.setPreset('${preset}');
    await new Promise((r) => setTimeout(r, 100));
    const scene = window.__envProbe.scene;
    let hemi = 0, skyMesh = 0;
    scene.traverse((n) => {
      if (n.isHemisphereLight) hemi++;
      if (n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition) skyMesh++;
    });
    return {
      preset: '${preset}',
      environmentNonNull: scene.environment !== null && scene.environment !== undefined,
      environmentIntensity: scene.environmentIntensity,
      backgroundNull: scene.background === null,
      hemiCount: hemi, skyMeshCount: skyMesh,
    };
  })()`);
  log.probes = [];
  for (const p of ['day', 'dusk', 'night', 'tech']) log.probes.push(await probe(p));

  // ── ② 四预设同机位（夏栎产品路径 1 棵：天空/太阳角阴影/IBL/地面配色差异）──
  await evalJs(`window.__envProbe.setPreset('day')`);
  await evalJs(`window.__tree3aPerf.place({ count: 1, seedBase: 7, spacing: 11, jitter: false, assetId: 'asset_tree_3a' }); window.__tree3aPerf.view({ distance: 15, azimuthDeg: 30, elevationDeg: 9 })`);
  await evalJs(`window.__tree3a.freezeTime()`);
  await sleep(900);
  for (const p of ['day', 'dusk', 'night', 'tech']) {
    await evalJs(`window.__envProbe.setPreset('${p}')`);
    await sleep(700);
    await screenshot(`../${p}-tree-preset.png`);
  }
  await evalJs(`window.__tree3aPerf.clear()`);

  // ── ③ day 删 Hemi 对照（018.2 同款金属三球注入同机位：(0,1.1,5.2)→(0,0.55,0)）──
  await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const group = new THREE.Group();
    [0.15, 0.45, 0.75].forEach((roughness, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 48, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness }),
      );
      m.position.set((i - 1) * 1.4, 0.5, 0);
      m.castShadow = true;
      group.add(m);
    });
    window.__envProbe.scene.add(group);
    (window.__t0183_injected ??= []).push(group);
    const { camera, controls } = window.__envProbe;
    camera.position.set(0, 1.1, 5.2); controls.target.set(0, 0.55, 0); controls.update();
    return true;
  })()`);
  await evalJs(`window.__envProbe.setPreset('day')`);
  await sleep(800);
  await screenshot(`../day-metal-nohemi.png`);
  await evalJs(`(async () => { for (const o of (window.__t0183_injected ?? [])) o.removeFromParent(); window.__t0183_injected = []; })()`);

  // ── ④ fallback 取证：monkey-patch PMREMGenerator.fromScene 抛错 → setPreset →
  //    legacy 完整路径（单一开关不变式 legacy 侧 + console.error）→ 解除 patch → 恢复 sky ──
  await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    window.__origFromScene = THREE.PMREMGenerator.prototype.fromScene;
    THREE.PMREMGenerator.prototype.fromScene = function () { throw new Error('T018.3 取证注入：初烘失败'); };
    return true;
  })()`);
  await evalJs(`window.__envProbe.setPreset('dusk')`);
  await sleep(600);
  log.fallbackProbe = await evalJs(`(() => {
    const scene = window.__envProbe.scene;
    let hemi = 0, skyMesh = 0;
    scene.traverse((n) => {
      if (n.isHemisphereLight) hemi++;
      if (n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition) skyMesh++;
    });
    const bg = scene.background;
    return {
      environmentNull: scene.environment === null,
      backgroundIsTexture: !!(bg && bg.isTexture),
      backgroundIsCanvas: !!(bg && bg.image && bg.image.tagName === 'CANVAS'),
      hemiCount: hemi, skyMeshCount: skyMesh,
    };
  })()`);
  await screenshot(`../fallback-legacy-dusk.png`);
  // 恢复（fallback 不粘死——每次 applyEnvironment 重新尝试新路径）
  await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    THREE.PMREMGenerator.prototype.fromScene = window.__origFromScene;
    delete window.__origFromScene;
    return true;
  })()`);
  await evalJs(`window.__envProbe.setPreset('dusk')`);
  await sleep(600);
  log.recoveryProbe = await evalJs(`(() => {
    const scene = window.__envProbe.scene;
    let hemi = 0, skyMesh = 0;
    scene.traverse((n) => {
      if (n.isHemisphereLight) hemi++;
      if (n.isMesh && n.material && n.material.uniforms && n.material.uniforms.sunPosition) skyMesh++;
    });
    return {
      environmentNonNull: scene.environment !== null && scene.environment !== undefined,
      backgroundNull: scene.background === null,
      hemiCount: hemi, skyMeshCount: skyMesh,
    };
  })()`);
  await screenshot(`../recovery-dusk.png`);

  // ── ⑤ 单一开关交替循环 growth10（sky↔legacy 交替：事务清理 + Hemi/background/sky
  //    全释放链的零泄漏检验——交替 10 轮 info 账目恒定）──
  const marks = [];
  for (let i = 0; i < 10; i++) {
    await evalJs(`(async () => {
      const THREE = await import('/node_modules/.vite/deps/three.js');
      if (${i % 2 === 1}) {
        window.__origFromScene = THREE.PMREMGenerator.prototype.fromScene;
        THREE.PMREMGenerator.prototype.fromScene = function () { throw new Error('growth 注入'); };
      } else if (window.__origFromScene) {
        THREE.PMREMGenerator.prototype.fromScene = window.__origFromScene;
        delete window.__origFromScene;
      }
      window.__envProbe.setPreset(${i % 4 === 3 ? "'night'" : "'day'"});
      return true;
    })()`);
    await sleep(400);
    marks.push(await evalJs(`(() => { const x = window.__envProbe.info(); return { geo: x.memory.geometries, tex: x.memory.textures, prog: x.programs }; })()`));
  }
  log.growth10Alternating = marks;

  return log;
};
