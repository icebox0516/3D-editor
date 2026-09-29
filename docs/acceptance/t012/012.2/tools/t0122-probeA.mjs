// 探针 A（只读）：模块导入 → build → 检查 groups / uv 域 / 材质绑定与参数
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  const out = await evalJs(`(async () => {
    const mod = await import('/src/runtime/procedural/assets/asset_tree_metasequoia.asset.ts');
    const build = mod.build;
    const mesh = build({ seed: 12345 });
    const out = { meshType: mesh?.type, isMesh: !!mesh?.isMesh };
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    out.materials = mats.map(m => ({
      type: m?.type, cacheKey: m?.customProgramCacheKey?.() ?? null,
      alphaTest: m?.alphaTest, alphaToCoverage: m?.alphaToCoverage,
      side: m?.side, transparent: m?.transparent, opacity: m?.opacity,
      visible: m?.visible, color: m?.color?.getHexString?.(),
      definesKeys: m?.defines ? Object.keys(m.defines) : null,
    }));
    const g = mesh.geometry;
    out.groups = g.groups.map(gr => ({ start: gr.start, count: gr.count, materialIndex: gr.materialIndex }));
    const uv = g.attributes.uv, pos = g.attributes.position;
    out.attrNames = Object.keys(g.attributes);
    out.uvCount = uv.count; out.posCount = pos.count;
    // 逐 group 的 uv v 域统计 + u 域 + 位置包围盒
    out.groupUv = g.groups.map(gr => {
      let vmin = 1e9, vmax = -1e9, umin = 1e9, umax = -1e9, n = 0;
      let ymin = 1e9, ymax = -1e9;
      for (let i = gr.start; i < gr.start + gr.count && i < uv.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        if (u < umin) umin = u; if (u > umax) umax = u;
        if (v < vmin) vmin = v; if (v > vmax) vmax = v;
        const y = pos.getY(i);
        if (y < ymin) ymin = y; if (y > ymax) ymax = y;
        n++;
      }
      return { materialIndex: gr.materialIndex, verts: n, u: [umin, umax], v: [vmin, vmax], y: [ymin, ymax] };
    });
    return out;
  })()`);
  return out;
};
