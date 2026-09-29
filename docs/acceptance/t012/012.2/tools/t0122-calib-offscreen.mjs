// T012.2 Step 4 离屏隔离探针：M25 等效正面机位——basic 绿卡（几何足迹）vs 真羽材质（SDF+光照）
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  return await evalJs(`(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const asset = await import('/src/runtime/procedural/assets/asset_tree_metasequoia.asset.ts');
    const W = 640, H = 720; // 竖幅——20m 树全高入画
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8080ff); // 品红底? 不——用蓝紫非绿底
    scene.background = new THREE.Color(0x5040a0);
    const cam = new THREE.PerspectiveCamera(50, W/H, 0.1, 300);
    cam.position.set(0, 10, 25); cam.lookAt(0, 10, 0);
    scene.add(new THREE.HemisphereLight(0xdfeaf5, 0x50565e, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(30, 40, 20); scene.add(sun);
    const source = asset.build({ seed: 12345 });
    const mesh = new THREE.Mesh(source.geometry, source.material);
    scene.add(mesh);
    const results = {};
    const shoot = (label, matsArr) => {
      mesh.material = matsArr;
      renderer.render(scene, cam);
      const gl = renderer.getContext();
      const px = new Uint8Array(W * H * 4);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let green = 0, bg = 0;
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i+1], b = px[i+2];
        if (Math.abs(r-0x50)<20 && Math.abs(g-0x40)<20 && Math.abs(b-0xa0)<25) bg++;
        else if (g > r + 8 && g > b + 8) green++;
      }
      results[label] = { bgPct: +(100*bg/(W*H)).toFixed(1), greenPx: green, greenPct: +(100*green/(W*H)).toFixed(1),
        coverOfNonBg: +(100*green/(W*H-bg)).toFixed(1) };
    };
    // A: basic 绿（组 1 = 羽卡全填充；组 0 隐形）——几何足迹
    shoot('basic-geom', [new THREE.MeshBasicMaterial({ visible: false }), new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })]);
    // B: 真材质（alphaTest SDF + 光照）
    shoot('real', source.material);
    renderer.dispose();
    return results;
  })()`);
};
