/**
 * tests/runtime/procedural/assets/ginkgoPresetPipeline.test.ts —— 银杏试点色卡全链
 * 集成测试（T024.1）。
 *
 * 覆盖（零 mock——真实 ginkgo build + 真实 ProceduralSourceCache，资产入口级）：
 * - build 接线：params.preset 透传叶材质工厂（autumn → 叶基调 #d4b737；缺省/default →
 *   #8ab45d），皮材质与深度材质不随卡（冠变干不变——D44 #1）；
 * - 缓存贯通：ProceduralSourceCache.load 携 preset 返回条目叶色随卡、同槽两卡
 *   geometry 与 customDepthMaterial 同引用（共享层，D44 #3）——试点树端到端断言
 *   （池/路由/Ghost 各链归各自单测，Renderer 装配闭包归 024.5 冒烟）；
 * - program 不增：两卡叶材质 customProgramCacheKey 相等。
 * 边界：材质 dispose 由测试自收（cache.dispose / material.dispose）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ProceduralSourceCache } from '../../../../src/runtime/procedural/ProceduralSourceCache';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_ginkgo.asset';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const LEAF_DEFAULT = new THREE.Color('#8ab45d').getHex();
const LEAF_AUTUMN = new THREE.Color('#d4b737').getHex();

function leafColorOf(materials: InstanceSource['material']): number {
  const arr = Array.isArray(materials) ? materials : [materials];
  const leaf = arr[1] as THREE.MeshStandardMaterial; // 契约序 [皮, 叶]
  return leaf.color.getHex();
}

describe('银杏试点色卡全链（T024.1——build 接线 + 缓存贯通）', () => {
  const built: InstanceSource[] = [];

  afterEach(() => {
    for (const source of built) {
      source.geometry.dispose();
      const material = source.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material.dispose();
      source.customDepthMaterial?.dispose();
    }
    built.length = 0;
  });

  it('build 接线：preset 透传叶工厂——autumn 叶 #d4b737、缺省 #8ab45d；皮与深度不随卡', () => {
    const autumn = build({ preset: 'autumn' });
    const standard = build({});
    built.push(autumn, standard);
    expect(leafColorOf(autumn.material)).toBe(LEAF_AUTUMN);
    expect(leafColorOf(standard.material)).toBe(LEAF_DEFAULT);
    // 冠变干不变：皮材质（组 0）两卡同色
    const barkOf = (s: InstanceSource) =>
      (Array.isArray(s.material) ? s.material[0] : s.material) as THREE.MeshStandardMaterial;
    expect(barkOf(autumn).color.getHex()).toBe(barkOf(standard).color.getHex());
    // program 不增（D44 #3）：两卡叶材质同键
    const leafKeyOf = (s: InstanceSource) =>
      (Array.isArray(s.material) ? s.material[1] : s.material).customProgramCacheKey!();
    expect(leafKeyOf(autumn)).toBe(leafKeyOf(standard));
  });

  it('缓存贯通：load 携 preset 叶色随卡 + 同槽两卡 geometry/深度同引用（共享层）', async () => {
    const cache = new ProceduralSourceCache();
    try {
      const seed = 3; // 对象 seed（缓存内槽路由）
      const autumn = await cache.load('asset_tree_ginkgo', { seed, preset: 'autumn' });
      const standard = await cache.load('asset_tree_ginkgo', { seed });
      expect(leafColorOf(autumn.material)).toBe(LEAF_AUTUMN);
      expect(leafColorOf(standard.material)).toBe(LEAF_DEFAULT);
      expect(standard.geometry).toBe(autumn.geometry); // D44 #3 跨卡共享
      expect(standard.customDepthMaterial).toBe(autumn.customDepthMaterial);
      expect(cache.size).toBe(2); // 两卡两桶（材质不同必须分桶）
    } finally {
      cache.dispose();
    }
  });
});
