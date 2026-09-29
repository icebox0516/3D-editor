// T012.2 Step4 诊断 2：在页实况 A/B——捕获场景 + 基础材质替换（验证光栅化）+ alpha 场可视化（验证 SDF）
export default async ({ evalJs, navigate, screenshot, sleep }) => {
  await navigate('http://localhost:5181');
  const setup = await evalJs(`(async () => {
    // three URL 从资源时序条目拿（Vite deps 缓存路径）
    const res = performance.getEntriesByType('resource').map(r => r.name).filter(u => /\\/node_modules\\/\\.vite\\/deps\\/three\\.js/.test(u));
    const THREE = await import(res[0]);
    window.__T = THREE;
    // 捕获 scene：hook Object3D.add
    let scene = null;
    const orig = THREE.Object3D.prototype.add;
    THREE.Object3D.prototype.add = function (...a) { if (!scene && this.isScene) scene = this; return orig.apply(this, a); };
    window.__metasequoia.mount();
    THREE.Object3D.prototype.add = orig;
    window.__scene = scene;
    window.__metasequoia.freezeTime();
    window.__metasequoia.view({ distance: 8, azimuthDeg: 35, elevationDeg: 24 });
    const grp = scene.children.find(c => c.name === 'metasequoia-dev-stage');
    const mesh = grp && grp.children[0];
    window.__mesh = mesh;
    return {
      threeUrl: res[0],
      meshFound: !!mesh,
      meshType: mesh ? mesh.type : null,
      matCount: mesh && mesh.material ? (Array.isArray(mesh.material) ? mesh.material.length : -2) : null,
      matKeys: mesh && Array.isArray(mesh.material) ? mesh.material.map(m => m.customProgramCacheKey()) : null,
      childrenNames: grp ? grp.children.map(c => c.name || c.type) : null,
    };
  })()`);
  await sleep(600);
  await screenshot('D:/3D-editor/docs/acceptance/t012/012.2/fixdiag-baseline.png');
  // 实验 A：组 1 换 MeshBasicMaterial 纯绿
  const expA = await evalJs(`(() => {
    const THREE = window.__T;
    const mesh = window.__mesh;
    if (!mesh) return { error: 'no mesh' };
    const basic = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    mesh.material[1] = basic;
    return { swapped: true };
  })()`);
  await sleep(400);
  await screenshot('D:/3D-editor/docs/acceptance/t012/012.2/fixdiag-expA-basicgreen.png');
  // 实验 B：恢复原材质 + wrap 可视化 msqAlpha
  const expB = await evalJs(`(async () => {
    const mesh = window.__mesh;
    const mod = await import('/src/runtime/procedural/assets/asset_tree_metasequoia.asset.ts');
    const src = mod.build();
    mesh.material[1] = src.material[1];
    const needle = mesh.material[1];
    const prev = needle.onBeforeCompile;
    needle.onBeforeCompile = function (shader, renderer) {
      prev.call(needle, shader, renderer);
      const before = shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'diffuseColor.a = msqAlpha;',
        'diffuseColor.rgb = vec3(msqAlpha); diffuseColor.a = 1.0;',
      );
      if (before === shader.fragmentShader) throw new Error('alpha 注入失败——注入点漂移');
    };
    needle.customProgramCacheKey = () => 'msq-debug-alpha';
    needle.needsUpdate = true;
    return { wrapped: true, key: needle.customProgramCacheKey() };
  })()`);
  await sleep(600);
  await screenshot('D:/3D-editor/docs/acceptance/t012/012.2/fixdiag-expB-alphavis.png');
  return { setup, expA, expB };
};
