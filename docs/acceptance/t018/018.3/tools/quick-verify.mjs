// T018.3 收尾复验：实验后干净 tab 恢复确认（sky 态单一开关不变式 + programs + console）
export default async (api) => {
  await api.setViewport(1920, 1080);
  await api.navigate('http://localhost:5173/');
  const ready = await api.evalJs(`(async () => {
    for (let i = 0; i < 60; i++) { if (window.__envProbe?.scene) return true; await new Promise(r => setTimeout(r, 500)); }
    return false;
  })()`);
  if (!ready) return { error: 'probe not ready' };
  await new Promise((r) => setTimeout(r, 800));

  return api.evalJs(`(() => {
    let env = null, hemi = 0, skyMesh = 0, dirLight = 0, toneMapping = -1, exposure = -1;
    const scene = window.__envProbe.scene;
    scene.traverse((o) => {
      if (o.isLight) { if (o.type === 'HemisphereLight') hemi++; if (o.type === 'DirectionalLight') dirLight++; }
      if (o.isMesh && /Sky/i.test(o.material?.type || '')) skyMesh++;
    });
    env = scene.environment;
    const r = window.__envProbe.webgl;
    return {
      hasEnvironment: !!env,
      backgroundIsNull: scene.background === null,
      hemiCount: hemi,
      skyShaderMeshes: skyMesh,
      dirLightCount: dirLight,
      toneMapping: r.toneMapping, // 期望 NoToneMapping=0
      toneMappingExposure: r.toneMappingExposure,
      programs: window.__envProbe.info().programs,
      frameTriangles: window.__envProbe.info().render.triangles,
    };
  })()`);
};
