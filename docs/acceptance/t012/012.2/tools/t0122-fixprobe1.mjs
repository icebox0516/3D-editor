// T012.2 Step4 诊断 1：静态探针——build() 产物几何/材质绑定 + uv/attribute 抽样 + SDF JS 移植求值
export default async ({ evalJs, navigate }) => {
  await navigate('http://localhost:5181');
  return await evalJs(`(async () => {
    const mod = await import('/src/runtime/procedural/assets/asset_tree_metasequoia.asset.ts');
    const src = mod.build();
    const g = src.geometry;
    const out = {};
    // 1. 材质绑定
    out.materialIsArray = Array.isArray(src.material);
    out.materialCount = src.material.length;
    out.materialMeta = src.material.map(m => ({
      type: m.type,
      color: '#' + m.color.getHexString(),
      side: m.side, // 0 Front 1 Back 2 Double
      alphaTest: m.alphaTest,
      alphaToCoverage: m.alphaToCoverage,
      transparent: m.transparent,
      defines: Object.keys(m.defines || {}),
      cacheKey: m.customProgramCacheKey ? m.customProgramCacheKey() : null,
      hasOnBeforeCompile: typeof m.onBeforeCompile === 'function',
      uniformsKeys: Object.keys(m.uniforms || {}),
    }));
    out.depthMaterial = src.customDepthMaterial ? {
      type: src.customDepthMaterial.type,
      alphaTest: src.customDepthMaterial.alphaTest,
      defines: Object.keys(src.customDepthMaterial.defines || {}),
    } : null;
    // 2. 几何组
    out.groups = g.groups.map(gr => ({ start: gr.start, count: gr.count, materialIndex: gr.materialIndex }));
    // 3. 组 1（羽卡）attribute 抽样
    const uv = g.getAttribute('uv');
    const rand = g.getAttribute('aLeafRand');
    const bend = g.getAttribute('aBend');
    const pos = g.getAttribute('position');
    const g1 = g.groups[1];
    const vStart = g1.start, vCount = g1.count; // 顶点域 = 索引域（非索引几何 count=顶点数）
    let uvMin = [1e9, 1e9], uvMax = [-1e9, -1e9], uvHist = {};
    let randMin = 1e9, randMax = -1e9, randNonZero = 0;
    let bendMin = 1e9, bendMax = -1e9;
    let yMin = 1e9, yMax = -1e9, xMin = 1e9, xMax = -1e9, zMin = 1e9, zMax = -1e9;
    const uvSamples = [], randSamples = [];
    for (let i = vStart; i < vStart + vCount; i++) {
      const u = uv.getX(i), v = uv.getY(i);
      uvMin[0] = Math.min(uvMin[0], u); uvMin[1] = Math.min(uvMin[1], v);
      uvMax[0] = Math.max(uvMax[0], u); uvMax[1] = Math.max(uvMax[1], v);
      const key = u.toFixed(2) + ',' + v.toFixed(2);
      uvHist[key] = (uvHist[key] || 0) + 1;
      const r = rand.getX(i);
      randMin = Math.min(randMin, r); randMax = Math.max(randMax, r);
      if (r > 0.0001) randNonZero++;
      const b = bend.getX(i);
      bendMin = Math.min(bendMin, b); bendMax = Math.max(bendMax, b);
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      xMin = Math.min(xMin, x); xMax = Math.max(xMax, x);
      yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
      zMin = Math.min(zMin, z); zMax = Math.max(zMax, z);
      if (i % 997 === 0) { uvSamples.push([+u.toFixed(3), +v.toFixed(3)]); randSamples.push(+r.toFixed(4)); }
    }
    out.group1 = {
      vertexCount: vCount,
      uvMin: uvMin.map(n => +n.toFixed(3)), uvMax: uvMax.map(n => +n.toFixed(3)),
      uvHistKeys: Object.keys(uvHist).length,
      uvHistTop: Object.entries(uvHist).sort((a, b) => b[1] - a[1]).slice(0, 12),
      randMin: +randMin.toFixed(4), randMax: +randMax.toFixed(4), randNonZero,
      bendMin: +bendMin.toFixed(4), bendMax: +bendMax.toFixed(4),
      posBBox: { x: [+xMin.toFixed(2), +xMax.toFixed(2)], y: [+yMin.toFixed(2), +yMax.toFixed(2)], z: [+zMin.toFixed(2), +zMax.toFixed(2)] },
      uvSamples, randSamples,
    };
    // 组 0（皮+器官卡）uv 顶部带（器官卡 v≥1 证据）
    const g0 = g.groups[0];
    let organV = 0, organU = [];
    for (let i = g0.start; i < g0.start + g0.count; i++) {
      const v = uv.getY(i);
      if (v >= 1.0) { organV++; if (organU.length < 8) organU.push(+uv.getX(i).toFixed(3)); }
    }
    out.group0Organic = { verticesVge1: organV, uSamples: organU };
    // 4. SDF JS 移植（high 档 pairs=11）——用真实 rand 值网格求值
    const pairs = 11.0;
    const fract = (x) => x - Math.floor(x);
    function sdfAlpha(u, v, r) {
      let A = 1.0;
      if (v < 1.0) {
        const px = u - 0.5, py = v;
        const xa = Math.abs(px);
        const S = Math.min(Math.max(py, 0.0), 0.999) * pairs;
        const K = Math.floor(S);
        const H = fract(Math.sin(K * 12.9898 + r * 78.233) * 43758.5453);
        const Yc = (K + 0.5 + (H - 0.5) * 0.24) / pairs;
        const dx = xa, dy = py - Yc;
        const Th = 0.907 + (fract(H * 7.31) - 0.5) * 0.22;
        const T = dx * Math.sin(Th) + dy * Math.cos(Th);
        const Lat = Math.abs(dy * Math.sin(Th) - dx * Math.cos(Th));
        const Env = Math.pow(Math.sin(3.14159 * Math.min(Math.max(Yc, 0.02), 0.98)), 0.6);
        const Len = 0.63 * Env * (0.80 + 0.36 * fract(H * 5.17));
        const TC = Math.min(Math.max(T, 0.0), Len);
        const W = 0.030 + 0.007 * fract(H * 3.17);
        const Leaf = W - Math.sqrt(Lat * Lat + (T - TC) * (T - TC));
        const Rach = (0.020 + (0.008 - 0.020) * Math.min(Math.max(py, 0.0), 1.0)) - xa;
        A = Math.min(Math.max(Math.max(Leaf, Rach) / 0.02 + 0.5, 0.0), 1.0);
      }
      return A;
    }
    // 用前 24 个真实 rand 值，64×64 网格覆盖率
    const rvals = [];
    for (let i = vStart; i < vStart + vCount && rvals.length < 24; i += 41) rvals.push(rand.getX(i));
    const grid = 64;
    const perCard = rvals.map(rv => {
      let cov = 0;
      for (let yi = 0; yi < grid; yi++) for (let xi = 0; xi < grid; xi++) {
        if (sdfAlpha((xi + 0.5) / grid, (yi + 0.5) / grid * 0.99, rv) >= 0.5) cov++;
      }
      return +(100 * cov / (grid * grid)).toFixed(1);
    });
    out.sdfJsCoveragePerCard = perCard;
    out.sdfJsCoverageMean = +(perCard.reduce((a, b) => a + b, 0) / perCard.length).toFixed(1);
    // 逐顶点 alpha（几何实际 uv 值）
    let vertPass = 0, vertTot = 0;
    for (let i = vStart; i < vStart + vCount; i += 7) {
      vertTot++;
      if (sdfAlpha(uv.getX(i), uv.getY(i), rand.getX(i)) >= 0.5) vertPass++;
    }
    out.sdfJsVertexPassRate = +(100 * vertPass / vertTot).toFixed(1);
    return out;
  })()`);
};
