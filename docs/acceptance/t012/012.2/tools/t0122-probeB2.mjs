// 探针 B2（只读）：renderer.info 三角形计数为判据 + preserveDrawingBuffer readback
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
    const mesh = asset.build({ seed: 12345 });
    const info = {
      meshCtor: mesh.constructor.name,
      children: mesh.children.length,
      isMeshRaw: mesh.isMesh === true,
    };
    mesh.frustumCulled = false;
    if (mesh.children.length) { mesh.children.forEach(c => c.frustumCulled = false); }
    const needle = mats.createMetasequoiaNeedleMaterial();
    const results = {};
    const shoot = (label, matsArr) => {
      mesh.material = matsArr;
      scene.add(mesh);
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
      scene.remove(mesh);
    };
    shoot('basic-solid', [new THREE.MeshBasicMaterial({ visible: false }), new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })]);
    shoot('needle-real', [new THREE.MeshBasicMaterial({ visible: false }), needle]);
    const n2 = mats.createMetasequoiaNeedleMaterial();
    n2.alphaTest = 0; n2.alphaToCoverage = false;
    shoot('needle-noAlphaTest', [new THREE.MeshBasicMaterial({ visible: false }), n2]);
    // 捕获注入后 shader（needle-real 材质已编译过）
    renderer.dispose();
    return { info, results };
  })()`);
  return out;
};
