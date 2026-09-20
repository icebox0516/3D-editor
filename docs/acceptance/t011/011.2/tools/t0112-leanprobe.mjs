// T011.2 偏冠方位一致性解析核查（回应视觉系统「8 树一致偏侧」观察）：
// 逐槽构建 slot 几何 → 叶组顶点质心 (x,z) 相对树轴偏移 → 世界方位角 + 幅度。
// 若 8 槽方位角随机分布（无一致偏侧）则观察为 50m 透视误读；slot-3 偏冠幅度测试已锁。
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5173');
  return await evalJs(`(async () => {
    const geo = await import('/src/runtime/procedural/tree/camphor/camphorGeometry.ts');
    const prof = await import('/src/runtime/procedural/tree/camphor/camphorShapeProfile.ts');
    const core = await import('/src/core/random.ts');
    const assets = await import('/src/domain/assets/shapeFamily.ts');
    const id = 'asset_tree_camphor';
    const rows = [];
    for (let slot = 0; slot < 8; slot++) {
      const seed = assets.morphSeedOf(id, slot);
      const rng = core.mulberry32(seed);
      const { geometry, stats } = geo.buildCamphorGeometry(rng, prof.CAMPHOR_SHAPE_PROFILES[slot], 'high');
      // 叶组 = group 1（皮 0 / 叶 1——D15 契约序）；groupRanges 非索引几何按 drawRange 或分组计数
      // 稳健口径：aBend>0 的顶点属叶卡（树皮组 aBend 恒 0——模块头契约）
      const pos = geometry.attributes.position, bend = geometry.attributes.aBend;
      let sx = 0, sz = 0, n = 0;
      for (let i = 0; i < pos.count; i++) {
        if (bend.getX(i) > 0) { sx += pos.getX(i); sz += pos.getZ(i); n++; }
      }
      const cx = sx / n, cz = sz / n;
      const az = (Math.atan2(cx, cz) * 180 / Math.PI + 360) % 360; // 世界方位（0=+Z 北）
      rows.push({ slot, cards: stats.leafCards, centroidX: +cx.toFixed(3), centroidZ: +cz.toFixed(3), offsetM: +Math.hypot(cx, cz).toFixed(3), leanAzDeg: +az.toFixed(0) });
      geometry.dispose();
    }
    return rows;
  })()`);
};
