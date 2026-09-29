// 探针 C（只读）：羽卡几何尺寸统计——逐四边形世界跨度 + 卡心分布
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  const out = await evalJs(`(async () => {
    const asset = await import('/src/runtime/procedural/assets/asset_tree_metasequoia.asset.ts');
    const source = asset.build({ seed: 12345 });
    const g = source.geometry;
    const pos = g.attributes.position;
    const grp = g.groups.find(x => x.materialIndex === 1);
    // 非索引流（4 顶点/卡 × 2 tri？先看 index 有无）
    const indexed = !!g.index;
    const quads = [];
    const start = grp.start, count = grp.count; // 顶点序号（非索引）或索引序号
    const P = (i) => { const k = indexed ? g.index.getX(i) : i; return [pos.getX(k), pos.getY(k), pos.getZ(k)]; };
    // 非索引两 tri 六顶点/卡 或 四顶点两 tri —— 按统计步长探测：先假设 6 顶点/卡（两三角分离）
    let sizes = [], cx = [], cz = [], cy = [];
    const step = 6;
    for (let i = start; i + step <= start + count; i += step) {
      const pts = [P(i), P(i+1), P(i+2), P(i+3), P(i+4), P(i+5)];
      let mn = [1e9,1e9,1e9], mx = [-1e9,-1e9,-1e9];
      for (const p of pts) for (let d = 0; d < 3; d++) { if (p[d] < mn[d]) mn[d] = p[d]; if (p[d] > mx[d]) mx[d] = p[d]; }
      const diag = Math.hypot(mx[0]-mn[0], mx[1]-mn[1], mx[2]-mn[2]);
      sizes.push(diag);
      cx.push((mn[0]+mx[0])/2); cy.push((mn[1]+mx[1])/2); cz.push((mn[2]+mx[2])/2);
    }
    sizes.sort((a,b)=>a-b);
    const q = (f) => sizes[Math.floor(f*(sizes.length-1))];
    const arrstat = (a) => { const s=[...a].sort((x,y)=>x-y); return [s[0], s[Math.floor(s.length/2)], s[s.length-1]]; };
    return {
      indexed, quadCount: sizes.length,
      diagM: { p5: +q(0.05).toFixed(3), p50: +q(0.5).toFixed(3), p95: +q(0.95).toFixed(3), max: +q(1).toFixed(3) },
      centerX: arrstat(cx).map(v=>+v.toFixed(2)), centerY: arrstat(cy).map(v=>+v.toFixed(2)), centerZ: arrstat(cz).map(v=>+v.toFixed(2)),
      xzSpread: +Math.hypot(Math.max(...cx)-Math.min(...cx), Math.max(...cz)-Math.min(...cz)).toFixed(2),
    };
  })()`);
  return out;
};
