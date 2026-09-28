/**
 * tests/runtime/procedural/assets/treePresetBatch.test.ts —— 色卡回补批
 * build 接线参数化集成测试（T024.2；024.3 回补批二只增表行）。
 *
 * 覆盖（零 mock——真实各树 build，资产入口级；ginkgoPresetPipeline 试点测试的
 * 批量参数化推广，机制面〔缓存/池/Ghost/序列化〕024.1 已通用全绿不重跑）：
 * - build 接线（批一 + 批二逐树）：params.preset 透传叶材质工厂——autumn → 该树秋卡
 *   基调、缺省 → 现行 default 基调；皮材质（组 0，含果序域）与深度材质不随卡
 *   （冠变干不变——D44 #1，果序归组 0 裁定 024.2 任务书；批二 4 树无果域同口径）；
 * - program 不增（逐树）：两卡叶材质 customProgramCacheKey 相等；
 * - 缓存贯通 spot（triadica 代表）：load 携 preset 叶色随卡 + 同槽两卡
 *   geometry/customDepthMaterial 同引用（共享层 D44 #3——机制树无关，批内单树抽检）。
 * 边界：材质 dispose 由测试自收（cache.dispose / material.dispose）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ProceduralSourceCache } from '../../../../src/runtime/procedural/ProceduralSourceCache';
import { build as buildPlatanus } from '../../../../src/runtime/procedural/assets/asset_tree_platanus.asset';
import { build as buildKoelreuteria } from '../../../../src/runtime/procedural/assets/asset_tree_koelreuteria.asset';
import { build as buildSophora } from '../../../../src/runtime/procedural/assets/asset_tree_sophora.asset';
import { build as buildTriadica } from '../../../../src/runtime/procedural/assets/asset_tree_triadica.asset';
import { build as buildFraxinus } from '../../../../src/runtime/procedural/assets/asset_tree_fraxinus.asset';
import { build as buildSalix } from '../../../../src/runtime/procedural/assets/asset_tree_salix.asset';
import { build as buildTree3a } from '../../../../src/runtime/procedural/assets/asset_tree_3a.asset';
import { build as buildCeltis } from '../../../../src/runtime/procedural/assets/asset_tree_celtis.asset';
import { build as buildZelkova } from '../../../../src/runtime/procedural/assets/asset_tree_zelkova.asset';
import { build as buildBischofia } from '../../../../src/runtime/procedural/assets/asset_tree_bischofia.asset';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

/** 批一 + 批二表行（024.3 批二在此表追加；autumn hex = 各树 *Materials.ts 秋卡私有域终审值） */
const BATCH: readonly {
  assetId: string;
  build: (params?: { preset?: string }) => InstanceSource;
  defaultLeaf: number;
  autumnLeaf: number;
}[] = [
  { assetId: 'asset_tree_platanus', build: buildPlatanus, defaultLeaf: 0x527e39, autumnLeaf: 0xa88a44 }, // 秋·黄褐（NC + form-c）
  { assetId: 'asset_tree_koelreuteria', build: buildKoelreuteria, defaultLeaf: 0x527d37, autumnLeaf: 0xd0bc46 }, // 秋·金黄（NC + wiki）
  { assetId: 'asset_tree_sophora', build: buildSophora, defaultLeaf: 0x568a3e, autumnLeaf: 0xc4a83a }, // 秋·金黄（NC 单源权威）
  { assetId: 'asset_tree_triadica', build: buildTriadica, defaultLeaf: 0x507c34, autumnLeaf: 0xc65e3e }, // 秋·绯红（NC + wiki + autumn-a/b）
  { assetId: 'asset_tree_fraxinus', build: buildFraxinus, defaultLeaf: 0x548840, autumnLeaf: 0xc8af3c }, // 秋·金黄（Spec 1.1 增量：主相金黄）
  { assetId: 'asset_tree_salix', build: buildSalix, defaultLeaf: 0x47782d, autumnLeaf: 0x789632 }, // 秋·黄绿（Spec 1.1 增量：弱秋色不造金黄）
  // —— 批二（T024.3；四树均无果域，冠变干不变口径同上；缓存 spot 机制树无关不重跑——批内参数化即接线证明）——
  { assetId: 'asset_tree_3a', build: buildTree3a, defaultLeaf: 0x4e7c33, autumnLeaf: 0x99792b }, // 秋·黄褐（Forestry England + Spec §6）
  { assetId: 'asset_tree_celtis', build: buildCeltis, defaultLeaf: 0x5a8340, autumnLeaf: 0xb89c38 }, // 秋·黄（OSU + 温州照片——黄主相不入橙红）
  { assetId: 'asset_tree_zelkova', build: buildZelkova, defaultLeaf: 0x3e6c2c, autumnLeaf: 0xc4804a }, // 秋·橙-铜橙（OSU 变幅 + 双样木）
  { assetId: 'asset_tree_bischofia', build: buildBischofia, defaultLeaf: 0x517c35, autumnLeaf: 0xc57551 }, // 秋·红-红橙（Spec 1.1 增量红相裁决——与 triadica 三轴分离）
];

function materialsOf(source: InstanceSource): THREE.Material[] {
  return Array.isArray(source.material) ? source.material : [source.material];
}

describe('色卡回补批 build 接线（T024.2/T024.3——冠变干不变：叶基调随卡，皮（含果序）与深度不随卡）', () => {
  const built: InstanceSource[] = [];

  afterEach(() => {
    for (const source of built) {
      source.geometry.dispose();
      materialsOf(source).forEach((m) => m.dispose());
      source.customDepthMaterial?.dispose();
    }
    built.length = 0;
  });

  for (const row of BATCH) {
    it(`${row.assetId}：preset 透传叶工厂——autumn ${'#' + row.autumnLeaf.toString(16)} / 缺省现行；皮与深度不随卡；两卡叶同键`, () => {
      const autumn = row.build({ preset: 'autumn' });
      const standard = row.build({});
      built.push(autumn, standard);
      const [barkA, leafA] = materialsOf(autumn) as THREE.MeshStandardMaterial[]; // 契约序 [皮(含果域), 叶]
      const [barkS, leafS] = materialsOf(standard) as THREE.MeshStandardMaterial[];
      expect(leafA.color.getHex(), `${row.assetId} autumn 叶基调`).toBe(row.autumnLeaf);
      expect(leafS.color.getHex(), `${row.assetId} default 叶基调`).toBe(row.defaultLeaf);
      // 冠变干不变：组 0 皮材质（果序域同在其中）两卡同色 + 深度材质色无关不随卡（同构造）
      expect(barkA.color.getHex()).toBe(barkS.color.getHex());
      // program 不增（D44 #3）：两卡叶材质同键
      expect(leafA.customProgramCacheKey!()).toBe(leafS.customProgramCacheKey!());
    });
  }

  it('缓存贯通 spot（triadica 代表批一）：load 携 preset 叶色随卡 + 同槽两卡 geometry/深度同引用（共享层）', async () => {
    const cache = new ProceduralSourceCache();
    try {
      const seed = 5;
      const autumn = await cache.load('asset_tree_triadica', { seed, preset: 'autumn' });
      const standard = await cache.load('asset_tree_triadica', { seed });
      const leafA = materialsOf(autumn)[1] as THREE.MeshStandardMaterial;
      const leafS = materialsOf(standard)[1] as THREE.MeshStandardMaterial;
      expect(leafA.color.getHex()).toBe(0xc65e3e);
      expect(leafS.color.getHex()).toBe(0x507c34);
      expect(standard.geometry).toBe(autumn.geometry); // D44 #3 跨卡共享（批一树走 024.1 通用机制）
      expect(standard.customDepthMaterial).toBe(autumn.customDepthMaterial);
      expect(cache.size).toBe(2); // 两卡两桶（材质不同必须分桶）
    } finally {
      cache.dispose();
    }
  });
});
