// T012.2 Step 4 校准后全量复测探针：8 槽 × 3 档真实构建（无覆盖——读改后源文件）
// 输出：三档实测带 + Mid/High 卡数比（slot-0/6/7）+ rng 三档恒等复核（slot-0）
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  return await evalJs(`(async () => {
    const { mulberry32 } = await import('/src/core/random.ts');
    const { morphSeedOf } = await import('/src/domain/assets/shapeFamily.ts');
    const { buildMetasequoiaGeometry } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaGeometry.ts');
    const { METASEQUOIA_SHAPE_PROFILES } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaShapeProfile.ts');
    const rows = [];
    for (let slot = 0; slot < 8; slot++) {
      const prof = METASEQUOIA_SHAPE_PROFILES[slot];
      const per = {};
      for (const level of ['high', 'mid', 'low']) {
        let calls = 0;
        const stream = mulberry32(morphSeedOf('asset_tree_metasequoia', slot));
        const r = buildMetasequoiaGeometry(() => { calls++; return stream(); }, prof, level);
        const s = r.stats;
        per[level] = {
          total: s.barkTriangles + s.needleTriangles + s.coneTriangles + s.strobiliTriangles,
          cards: s.needleCards, kept: s.clusters.length, culled: s.clustersCulled,
          chRej: s.channelRejects, cones: s.conesBaked, stro: s.strobiliBaked, rng: calls,
        };
        r.geometry.dispose();
      }
      rows.push({ slot, ...per,
        midRatio: +(per.mid.cards / per.high.cards).toFixed(4),
        rngEq: per.high.rng === per.mid.rng && per.high.rng === per.low.rng });
    }
    const band = (k) => [Math.min(...rows.map(r => r[k].total)), Math.max(...rows.map(r => r[k].total))];
    return { rows, high: band('high'), mid: band('mid'), low: band('low'),
      slot0: rows[0], midRatios: { s0: rows[0].midRatio, s6: rows[6].midRatio, s7: rows[7].midRatio },
      rngAllEq: rows.every(r => r.rngEq) };
  })()`);
};
