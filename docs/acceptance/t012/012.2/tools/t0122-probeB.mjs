// 探针 B（只读，页内离屏）：Basic 对照 vs 真羽材质 vs alphaTest=0 变体 + 注入后 fragmentShader 捕获
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  const out = await evalJs(`(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const asset = await import('/src/runtime/procedural/assets/asset_tree_metasequoia.asset.ts');
    const mats = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaMaterials.ts');
    const W = 320, H = 320;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setSize(W, H);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    cam.position.set(14, 14, 14); cam.lookAt(0, 12, 0);
    const mesh = asset.build({ seed: 12345 });
    // 只留羽组：把组 0 材质换 invisible 占位（保留 groups）
    const needle = mats.createMetasequoiaNeedleMaterial();
    const results = {};
    const shoot = (label, mat) => {
      mesh.material = [new THREE.MeshBasicMaterial({ visible: false }), mat];
      scene.add(mesh); renderer.render(scene, cam);
      const px = new Uint8Array(W * H * 4);
      renderer.readRenderTargetPixels ? null : null;
      const gl = renderer.getContext();
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let lit = 0, green = 0;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i] + px[i+1] + px[i+2] > 30) lit++;
        if (px[i+1] > px[i] + 10 && px[i+1] > px[i+2] + 10) green++;
      }
      results[label] = { litPct: +(100*lit/(W*H)).toFixed(2), greenPct: +(100*green/(W*H)).toFixed(2) };
      scene.remove(mesh);
    };
    // ① 对照：Basic 实心（几何可见性）
    shoot('basic-solid', new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }));
    // ② 真羽材质
    shoot('needle-real', needle);
    // ③ 真羽材质 alphaTest=0 + alphaToCoverage=false（若出现淡绿=alpha∈(0,0.5)；仍黑=alpha≈0/NaN）
    const n2 = mats.createMetasequoiaNeedleMaterial();
    n2.alphaTest = 0; n2.alphaToCoverage = false;
    shoot('needle-noAlphaTest', n2);
    // ④ 羽材质的注入后 shader 源捕获（onBeforeCompile 包装）
    let captured = null;
    const n3 = mats.createMetasequoiaNeedleMaterial();
    const orig = n3.onBeforeCompile;
    n3.onBeforeCompile = function (shader, ...rest) {
      captured = { uniforms: Object.keys(shader.uniforms), fsLen: shader.fragmentShader.length };
      window.__msqFs = shader.fragmentShader; window.__msqVs = shader.vertexShader;
      return orig ? orig.call(this, shader, ...rest) : undefined;
    };
    shoot('needle-capture', n3);
    results.captured = captured;
    renderer.dispose();
    return results;
  })()`);
  const fs = await evalJs('window.__msqFs ? window.__msqFs.length : -1');
  return { results: out, fsLen: fs };
};
