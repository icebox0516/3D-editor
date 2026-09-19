// T011.1 决定性诊断：叶材质着色器效果离屏像素探针（不依赖视觉模型）
// 单片 1×1 平面 + createCeltisLeafMaterial('high')，正交相机满幅渲染 → readPixels：
// ① alpha 掩码逐行边缘位置（v=0.1–0.3 基半部 vs v=0.6–0.9 端半部的摆动幅度对比 = 齿限上半部）
// ② RGB 亮度剖面：中轴（x≈0）vs 叶肉（|x|≈0.2）沿 v——中脉亮带应抬升（脉对比校准后 ≈+16%）
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5173');
  const out = await evalJs(`(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const m = await import('/src/runtime/procedural/tree/celtis/celtisMaterials.ts');
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setSize(size, size, false);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    cam.position.set(0, 0, 1); cam.lookAt(0, 0, 0);
    // 光照近似舞台：正面平行光 + 环境光（探针测调制项，非光照绝对值）
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(0.3, 0.5, 1);
    const amb = new THREE.AmbientLight(0xffffff, 1.6); scene.add(sun, amb);
    const geo = new THREE.PlaneGeometry(1, 1);
    // 补齐材质期望的逐叶属性（aLeafRand / aBend——叶卡冻结契约属性）
    const n = geo.attributes.position.count;
    geo.setAttribute('aLeafRand', new THREE.BufferAttribute(new Float32Array(n).fill(0.37), 1));
    geo.setAttribute('aBend', new THREE.BufferAttribute(new Float32Array(n).fill(0.2), 1));
    const mat = m.createCeltisLeafMaterial('high');
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    renderer.render(scene, cam);
    const gl = renderer.getContext();
    const px = new Uint8Array(size * size * 4);
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, px);
    renderer.dispose(); geo.dispose(); mat.dispose();
    const at = (x, y) => { const i = ((size - 1 - y) * size + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
    // ① alpha 掩码逐行边缘：v 行（y 像素）上 alpha>128 的最左/最右 → 半宽与边缘位置
    const vToY = (v) => Math.round(v * (size - 1));
    const rowEdge = (v) => {
      const y = vToY(v); let l = -1, r = -1;
      for (let x = 0; x < size; x++) { if (at(x, y)[3] > 128) { if (l < 0) l = x; r = x; } }
      return l < 0 ? null : { l, r, half: (r - l) / 2, center: (l + r) / 2 };
    };
    const jitter = (rows) => {
      const es = rows.filter(Boolean).map((e) => e.l);
      if (es.length < 2) return null;
      const mean = es.reduce((a, b) => a + b, 0) / es.length;
      return Math.sqrt(es.reduce((a, b) => a + (b - mean) ** 2, 0) / es.length);
    };
    const baseRows = []; const tipRows = [];
    for (let v = 0.10; v <= 0.32; v += 0.01) baseRows.push(rowEdge(v));
    for (let v = 0.58; v <= 0.92; v += 0.01) tipRows.push(rowEdge(v));
    // ② 中脉亮度剖面：lum(x, v) 沿固定 v 行扫描（叶面亮带应在中轴处抬升）
    const lum = (x, y) => { const c = at(x, y); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const profile = [];
    for (let v = 0.15; v <= 0.85; v += 0.05) {
      const y = vToY(v); const e = rowEdge(v);
      if (!e) continue;
      const cxs = Math.round(e.center), xs = Math.round(e.center + (e.r - e.l) * 0.30);
      profile.push({ v: +v.toFixed(2), mid: lum(cxs, y), flesh: lum(xs, y) });
    }
    return {
      alphaClear: at(2, 2).slice(0, 4),
      baseJitterPx: jitter(baseRows), tipJitterPx: jitter(tipRows),
      baseHalfPx: baseRows.filter(Boolean).map((e) => +e.half.toFixed(1)).slice(0, 4),
      tipHalfPx: tipRows.filter(Boolean).map((e) => +e.half.toFixed(1)).slice(0, 4),
      midribProfile: profile.map((p) => ({ ...p, deltaPct: p.flesh ? +(((p.mid - p.flesh) / p.flesh) * 100).toFixed(1) : null })),
    };
  })()`);
  return out;
};
