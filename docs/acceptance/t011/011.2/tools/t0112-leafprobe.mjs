// T011.2 决定性诊断：香樟叶材质着色器离屏像素探针（不依赖视觉模型）
// 单片 1×1 平面 + createCamphorLeafMaterial('high')，正交相机满幅渲染 → readPixels：
// ① alpha 掩码逐行边缘抖动：全缘身份——基半部与端半部抖动均应 ≈0（vs 朴树齿=端半部抖动）
// ② 正面亮度剖面网格：中脉亮带（中轴抬升）+ 离基三出脉侧脉对（v≥0.15 起离轴对称亮斑，
//    v≤0.08 基部无侧脉——离基点 v=0.10 的分离语义）
// ③ 背面 pass（平面翻 180°）：两面区分（背面 glaucous 提亮偏冷）+ 脉腋腺窝暗点对（近基轴侧）
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
    mesh.rotation.y = Math.PI; // 背面 pass（gl_FrontFacing=false 分支）
    const pxBack = read();
    renderer.dispose(); geo.dispose(); mat.dispose();
    const at = (px, x, y) => { const i = ((size - 1 - y) * size + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
    const vToY = (v) => Math.round(v * (size - 1));
    const rowEdge = (px, v) => {
      const y = vToY(v); let l = -1, r = -1;
      for (let x = 0; x < size; x++) { if (at(px, x, y)[3] > 128) { if (l < 0) l = x; r = x; } }
      return l < 0 ? null : { l, r, half: (r - l) / 2, center: (l + r) / 2 };
    };
    const jitter = (rows) => {
      const es = rows.filter(Boolean).map((e) => e.l);
      if (es.length < 2) return null;
      const mean = es.reduce((a, b) => a + b, 0) / es.length;
      return Math.sqrt(es.reduce((a, b) => a + (b - mean) ** 2, 0) / es.length);
    };
    const baseRows = []; const tipRows = [];
    for (let v = 0.10; v <= 0.32; v += 0.01) baseRows.push(rowEdge(pxFront, v));
    for (let v = 0.58; v <= 0.92; v += 0.01) tipRows.push(rowEdge(pxFront, v));
    const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    // 亮度剖面网格：行 v × 侧向偏移 f（0=中轴，1=叶缘；两侧对称取样均值）
    const profileGrid = (px) => {
      const rows = [];
      for (let v = 0.05; v <= 0.95; v += 0.05) {
        const y = vToY(+v.toFixed(2)); const e = rowEdge(px, +v.toFixed(2));
        if (!e) continue;
        const cells = [];
        for (let f = 0; f <= 1.0001; f += 0.125) {
          const dx = (e.r - e.l) / 2 * f;
          const xr = Math.round(e.center + dx), xl = Math.round(e.center - dx);
          cells.push(+(lum(at(px, xr, y)) + lum(at(px, xl, y))) / 2);
        }
        rows.push({ v: +v.toFixed(2), edgeHalf: +(e.half).toFixed(1), lum: cells.map((c) => +c.toFixed(1)) });
      }
      return rows;
    };
    // 背面暗点扫描：近基行（v=0.10–0.22）中轴两侧 |x|≈4–20px 的最小亮度 vs 远基对照行（v=0.40–0.55）
    const backDots = () => {
      const scan = (v) => {
        const y = vToY(v); const e = rowEdge(pxBack, v);
        if (!e) return null;
        let minL = 999, minAt = 0;
        for (let dx = 4; dx <= 22; dx++) {
          for (const x of [Math.round(e.center - dx), Math.round(e.center + dx)]) {
            const l = lum(at(pxBack, x, y));
            if (l < minL) { minL = l; minAt = dx; }
          }
        }
        return { minL: +minL.toFixed(1), atDx: minAt };
      };
      return { nearBase: [0.12, 0.15, 0.18, 0.20].map(scan), control: [0.42, 0.50].map(scan) };
    };
    // 两面色对比（v=0.5 叶肉 f=0.6 处 RGB）
    const colorAt = (px, v, f) => {
      const y = vToY(v); const e = rowEdge(px, v);
      const x = Math.round(e.center + (e.r - e.l) / 2 * f);
      return at(px, x, y).slice(0, 3);
    };
    return {
      alphaClear: at(pxFront, 2, 2).slice(0, 4),
      baseJitterPx: jitter(baseRows), tipJitterPx: jitter(tipRows),
      baseHalfPx: baseRows.filter(Boolean).map((e) => +e.half.toFixed(1)).slice(0, 4),
      tipHalfPx: tipRows.filter(Boolean).map((e) => +e.half.toFixed(1)).slice(0, 4),
      frontGrid: profileGrid(pxFront),
      backGrid: profileGrid(pxBack),
      backDots: backDots(),
      frontFleshRgb: colorAt(pxFront, 0.5, 0.6), backFleshRgb: colorAt(pxBack, 0.5, 0.6),
    };
  })()`);
  return out;
};
