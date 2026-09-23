// 渲染管线直接仪表：wrap WebGLRenderer.prototype.render——scene 身份 / 灯光计数 / camera layers mask
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);
  await sleep(2500);
  const setup = await evalJs(`(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const orig = THREE.WebGLRenderer.prototype.render;
    window.__renderLog = [];
    THREE.WebGLRenderer.prototype.render = function (scene, camera) {
      let lights = 0, dirLights = 0, hemiLights = 0;
      scene.traverse((n) => {
        if (n.isLight) {
          lights++;
          if (n.isDirectionalLight) dirLights++;
          if (n.isHemisphereLight) hemiLights++;
        }
      });
      const entry = {
        sceneIsProbeScene: scene === window.__envProbe.scene,
        cameraLayersMask: camera.layers.mask,
        objects: scene.children.length,
        lights, dirLights, hemiLights,
        overrideMaterial: scene.overrideMaterial ? 'set' : null,
        environment: scene.environment ? 'set' : null,
      };
      if (window.__renderLog.length < 400) window.__renderLog.push(entry);
      return orig.call(this, scene, camera);
    };
    return 'wrapped';
  })()`);
  await sleep(600);
  const before = await evalJs(`(() => { const log = window.__renderLog; return { count: log.length, sample: log.slice(-3) }; })()`);
  // 太阳归零 → 观察后续 render 日志（灯计数应不变——被 traverse 到的是同一盏灯；uniform 是否上传看不到，但看 scene 身份与 override）
  await evalJs(`(() => {
    window.__envProbe.scene.traverse((n) => { if (n.isDirectionalLight && n.intensity > 0) { n.userData.__orig = n.intensity; n.intensity = 0; } });
    return 'sun-off';
  })()`);
  await sleep(600);
  const afterOff = await evalJs(`(() => { const log = window.__renderLog; return { count: log.length, sample: log.slice(-3) }; })()`);
  await evalJs(`(() => {
    window.__envProbe.scene.traverse((n) => { if (n.isDirectionalLight && n.userData.__orig !== undefined) { n.intensity = n.userData.__orig; delete n.userData.__orig; } });
    return 'sun-restored';
  })()`);
  return { setup, before, afterOff };
};
