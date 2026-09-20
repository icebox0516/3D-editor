// T011.2 腺窝聚焦探针：t0112-leafprobe 发现屏幕 y 与材质 v 反向（vToY 行 = 1−材质v，
// 离基脉公式逐点反算已证）——本探针在正确位置（材质 v≈0.15 → 屏幕 my-v 0.85 行，
// |x|≈0.055 卡单位 → 中轴 ±14px）重扫背面暗点对，并对基/中/先端三行做正面 12px 细扫
// 验证全缘（去线性趋势后的边缘高频残差 ≈0 vs 朴树齿的带内抖动）。
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5173');
  const out = await evalJs(`(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const m = await import('/src/runtime/procedural/tree/camphor/camphorMaterials.ts');
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setSize(size, size, false);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    cam.position.set(0, 0, 1); cam.lookAt(0, 0, 0);
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(0.3, 0.5, 1);
    const amb = new THREE.AmbientLight(0xffffff, 1.6); scene.add(sun, amb);
    const geo = new THREE.PlaneGeometry(1, 1);
    const n = geo.attributes.position.count;
    geo.setAttribute('aLeafRand', new THREE.BufferAttribute(new Float32Array(n).fill(0.37), 1));
    geo.setAttribute('aBend', new THREE.BufferAttribute(new Float32Array(n).fill(0.2), 1));
    const mat = m.createCamphorLeafMaterial('high');
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const read = () => {
      renderer.render(scene, cam);
      const gl = renderer.getContext();
      const px = new Uint8Array(size * size * 4);
      gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return px;
    };
    const pxFront = read();
    mesh.rotation.y = Math.PI;
    const pxBack = read();
    renderer.dispose(); geo.dispose(); mat.dispose();
    const at = (px, x, y) => { const i = ((size - 1 - y) * size + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
    const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    // ① 腺窝：背面、材质 v 0.10–0.20（屏幕 my-v 0.80–0.90 行）、|x| 0–40px 全扫（步 1px，两侧）
    const dotScan = [];
    for (let myV = 0.80; myV <= 0.90; myV += 0.025) {
      const y = Math.round(myV * (size - 1));
      const row = [];
      for (let dx = 0; dx <= 40; dx += 2) {
        const l = (lum(at(pxBack, 128 + dx, y)) + lum(at(pxBack, 128 - dx, y))) / 2;
        row.push(+l.toFixed(1));
      }
      dotScan.push({ myV: +myV.toFixed(3), matV: +(1 - myV).toFixed(3), lumByDx0to40step2: row });
    }
    // ② 全缘：正面行内边缘亚像素剖面——对基(材质0.2)/中(0.5)/先端(0.8)三行，
    //    左右边缘各 12px 内 alpha 阈值穿越点的逐行变化（去趋势残差应 ≈0：无齿载波）
    const edge = (v) => {
      const y = Math.round(v * (size - 1)); let l = -1, r = -1;
      for (let x = 0; x < size; x++) { if (at(pxFront, x, y)[3] > 128) { if (l < 0) l = x; r = x; } }
      return { l, r };
    };
    const band = (matV0, matV1) => {
      const ls = [], rs = [];
      for (let matV = matV0; matV <= matV1; matV += 0.004) {
        const myV = 1 - matV; const e = edge(myV);
        if (e.l >= 0) { ls.push(e.l); rs.push(e.r); }
      }
      const detrend = (arr) => {
        const n = arr.length; const xs = arr.map((_, i) => i);
        const mx = xs.reduce((a, b) => a + b, 0) / n, my = arr.reduce((a, b) => a + b, 0) / n;
        let num = 0, den = 0;
        for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (arr[i] - my); den += (xs[i] - mx) ** 2; }
        const k = num / den;
        const res = arr.map((v, i) => v - (my + k * (i - mx)));
        const rms = Math.sqrt(res.reduce((a, b) => a + b * b, 0) / n);
        return +rms.toFixed(3);
      };
      return { rows: ls.length, leftRms: detrend(ls), rightRms: detrend(rs) };
    };
    return {
      domatiaScan: dotScan,
      entireBase: band(0.10, 0.35),
      entireMid: band(0.35, 0.60),
      entireTip: band(0.60, 0.88),
    };
  })()`);
  return out;
};
