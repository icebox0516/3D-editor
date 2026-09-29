// T012.2 Step 4 密度校准探针（procedural-asset-agent）：变体矩阵 → 8 槽 High 实测面数/簇账/rng
// 用法：node cdp.mjs t0122-calib-probe.mjs —— 参数经 profile spread 覆盖（不动源文件），
// Mid/低档先按解析式估算（every=3 / stride=5），定档后改文件再实测。
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  const variants = [
    { name: 'W1b-s6-004', cardMin: 0.18, cardSpan: 0.12, c5: 12, c4: 8, sepBase: 0.02, sep6: 0.04, sep7: 0.0 },
  ];
  return await evalJs(`(async () => {
    const { mulberry32 } = await import('/src/core/random.ts');
    const { morphSeedOf } = await import('/src/domain/assets/shapeFamily.ts');
    const { buildMetasequoiaGeometry } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaGeometry.ts');
    const { METASEQUOIA_SHAPE_PROFILES } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaShapeProfile.ts');
    const variants = ${JSON.stringify(variants)};
    const out = [];
    for (const v of variants) {
      const rows = [];
      for (let slot = 0; slot < 8; slot++) {
        const base = METASEQUOIA_SHAPE_PROFILES[slot];
        const sep = slot === 6 ? v.sep6 : slot === 7 ? v.sep7 : v.sepBase;
        const prof = { ...base, rosetteCardMin: v.cardMin, rosetteCardSpan: v.cardSpan,
          clustersL5: v.c5, clustersL4: v.c4, clusterMinSeparation: sep };
        let calls = 0;
        const stream = mulberry32(morphSeedOf('asset_tree_metasequoia', slot));
        const r = buildMetasequoiaGeometry(() => { calls++; return stream(); }, prof, 'high');
        const s = r.stats;
        const total = s.barkTriangles + s.needleTriangles + s.coneTriangles + s.strobiliTriangles;
        const kept = s.clusters.length;
        // Mid(every=3)/Low(stride=5) 解析估算：Mid 卡 ≈ 存活卡 × 1/3（每簇双卡同序）
        const midEst3 = 2874 + s.coneTriangles + s.strobiliTriangles + Math.round(s.needleCards / 3) * 2;
        const midEst2 = 2874 + s.coneTriangles + s.strobiliTriangles + Math.round(s.needleCards / 2) * 2;
        const lowEst5 = 786 + Math.ceil(kept / 5) * 2;
        rows.push({ slot, total, cards: s.needleCards, kept, culled: s.clustersCulled,
          chRej: s.channelRejects, cones: s.conesBaked, stro: s.strobiliBaked, rng: calls,
          midEst3, midEst2, lowEst5 });
        r.geometry.dispose();
      }
      out.push({ variant: v.name, rows,
        hi: [Math.min(...rows.map(x => x.total)), Math.max(...rows.map(x => x.total))],
        midEst3: [Math.min(...rows.map(x => x.midEst3)), Math.max(...rows.map(x => x.midEst3))],
        midEst2: [Math.min(...rows.map(x => x.midEst2)), Math.max(...rows.map(x => x.midEst2))],
        lowEst5: [Math.min(...rows.map(x => x.lowEst5)), Math.max(...rows.map(x => x.lowEst5))] });
    }
    return out;
  })()`);
};
