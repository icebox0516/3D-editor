// 探针 B3（只读）：InstanceSource → 真 Mesh → 离屏 A/B + 注入后 shader 捕获
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  const out = await evalJs(`(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const asset = await import('/src/runtime/procedural/assets/asset_tree_metasequoia.asset.ts');
    const mats = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaMaterials.ts');
    const W = 320, H = 320;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101010);
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    cam.position.set(16, 12, 16); cam.lookAt(0, 11, 0);
    // 光照（Standard 材质需要）
    scene.add(new THREE.HemisphereLight(0xdfeaf5, 0x50565e, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(30, 40, 20); scene.add(sun);
    const source = asset.build({ seed: 12345 });
    const mesh = new THREE.Mesh(source.geometry, source.material);
    scene.add(mesh);
    const results = {};
    const shoot = (label, matsArr) => {
      mesh.material = matsArr;
      renderer.info.reset();
      renderer.render(scene, cam);
      const gl = renderer.getContext();
      const px = new Uint8Array(W * H * 4);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let lit = 0, green = 0;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i] + px[i+1] + px[i+2] > 60) lit++;
        if (px[i+1] > px[i] + 10 && px[i+1] > px[i+2] + 10) green++;
      }
      results[label] = {
        tris: renderer.info.render.triangles, calls: renderer.info.render.calls,
        litPct: +(100*lit/(W*H)).toFixed(2), greenPct: +(100*green/(W*H)).toFixed(2),
      };
    };
    shoot('basic-solid', [new THREE.MeshBasicMaterial({ visible: false }), new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })]);
    const needle = mats.createMetasequoiaNeedleMaterial();
    shoot('needle-real', [new THREE.MeshBasicMaterial({ visible: false }), needle]);
    const n2 = mats.createMetasequoiaNeedleMaterial();
    n2.alphaTest = 0; n2.alphaToCoverage = false;
    shoot('needle-noAlphaTest', [new THREE.MeshBasicMaterial({ visible: false }), n2]);
    // 注入后 fragmentShader 捕获（needle 已在上文编译——重编译捕获）
    let captured = null;
    const n3 = mats.createMetasequoiaNeedleMaterial();
    const orig = n3.onBeforeCompile;
    n3.onBeforeCompile = function (shader) {
      window.__msqFs = shader.fragmentShader; window.__msqVs = shader.vertexShader;
      captured = { fsLen: shader.fragmentShader.length, hasSdf: shader.fragmentShader.includes('msq') };
      return orig ? orig.call(this, shader) : undefined;
    };
    shoot('needle-capture', [new THREE.MeshBasicMaterial({ visible: false }), n3]);
    results.captured = captured;
    renderer.dispose();
    return results;
  })()`);
  return out;
};
