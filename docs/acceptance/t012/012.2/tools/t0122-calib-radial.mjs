// T012.2 Step 4 簇位径向/高度分布诊断：内空 vs 预算顶
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  return await evalJs(`(async () => {
    const { mulberry32 } = await import('/src/core/random.ts');
    const { morphSeedOf } = await import('/src/domain/assets/shapeFamily.ts');
    const { buildMetasequoiaGeometry } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaGeometry.ts');
    const { METASEQUOIA_SHAPE_PROFILES } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaShapeProfile.ts');
    const r = buildMetasequoiaGeometry(mulberry32(morphSeedOf('asset_tree_metasequoia', 0)), METASEQUOIA_SHAPE_PROFILES[0], 'high');
    const s = r.stats;
    // 簇位按高度分 10 带的簇数 + 带内平均半径
    const bands = Array.from({length:10}, () => ({n:0, rSum:0}));
    for (const c of s.clusters) {
      const b = Math.min(9, Math.max(0, Math.floor(c.cy / 20.5 * 10)));
      bands[b].n++; bands[b].rSum += Math.hypot(c.cx, c.cz);
    }
    const maxR = Math.max(...s.clusters.map(c => Math.hypot(c.cx, c.cz)));
    // 径向分 5 环（r/maxR）的簇数
    const rings = Array.from({length:5}, () => 0);
    for (const c of s.clusters) rings[Math.min(4, Math.floor(Math.hypot(c.cx, c.cz) / maxR * 5))]++;
    r.geometry.dispose();
    return { maxR: +maxR.toFixed(2),
      heightBands: bands.map((b,i) => ({ h: (i*2.05).toFixed(1)+'-'+((i+1)*2.05).toFixed(1)+'m', clusters: b.n, meanR: b.n ? +(b.rSum/b.n).toFixed(2) : 0 })),
      radialRings_rPct: rings.map((n) => Math.round(100*n/s.clusters.length)) };
  })()`);
};
