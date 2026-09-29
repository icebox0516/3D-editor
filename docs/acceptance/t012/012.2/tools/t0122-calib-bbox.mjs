// T012.2 Step 4 校准后 8 槽 High 包围盒实测（taxonomy 声明带更新依据）
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  return await evalJs(`(async () => {
    const { mulberry32 } = await import('/src/core/random.ts');
    const { morphSeedOf } = await import('/src/domain/assets/shapeFamily.ts');
    const { buildMetasequoiaGeometry } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaGeometry.ts');
    const { METASEQUOIA_SHAPE_PROFILES } = await import('/src/runtime/procedural/tree/metasequoia/metasequoiaShapeProfile.ts');
    const out = [];
    for (let slot = 0; slot < 8; slot++) {
      const r = buildMetasequoiaGeometry(mulberry32(morphSeedOf('asset_tree_metasequoia', slot)), METASEQUOIA_SHAPE_PROFILES[slot], 'high');
      r.geometry.computeBoundingBox();
      const b = r.geometry.boundingBox;
      out.push({ slot, h: +b.max.y.toFixed(3), w: +(2 * Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2).toFixed(3) });
      r.geometry.dispose();
    }
    return out;
  })()`);
};
