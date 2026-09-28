/**
 * tests/runtime/procedural/assets/assetColorPresets.test.ts —— 程序化资产色卡契约测试（T024.1，D44 #2 双钩之②）。
 *
 * 覆盖：
 * - 19 资产色卡声明整表锁定：新资产不登记映射 = 测试红（配合 presets 必填的编译
 *   约束，双闸——忘声明过不了 typecheck，声明了不登表过不了本测试；assetTaxonomy
 *   式先例）；
 * - 卡 id 纪律：资产内唯一、default 卡必在且居首（DEFAULT_COLOR_PRESET_ID 单一真相源）；
 * - 乔木族（family broadleaf）非空断言——「至少 default 卡」的族级下限在现役 13 树上
 *   锁定（植物/车辆各族族门承接此断言，D44 #2 / D30 不预防性泛化——本表只锁现役）；
 * - 三字段浏览语义：label 非空、swatch 合法 hex 数据色（缩略图不随卡重渲——swatch
 *   即色点唯一视觉来源）；
 * - 秋卡声明面与 canopy 冠色覆写表同源（broadleafCanopyMaterials 私有表 11 行 = ginkgo
 *   试点 + 批一 6 树 + 批二 4 树——两处卡集一致防漂移；camphor/ligustrum 常绿无冠卡行）。
 * 边界：本文件只锁声明面值域与映射，不测行为（渲染/缓存/放置归各自测试）；色值配方
 *      归各树材质工厂私有域（D44 #2），本文件不断言配方数值。
 * 隔离：collectProceduralAssetMetas 只含插件文件收割清单（seam 注入不进清单，
 *      routes.test 已锁），本文件不注册任何临时路由 → 收割数恒 = 产品资产数。
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_COLOR_PRESET_ID } from '../../../../src/domain/assets';
import { collectProceduralAssetMetas } from '../../../../src/runtime/procedural/routes';
import { BROADLEAF_CANOPY_CROWN_PRESETS } from '../../../../src/runtime/procedural/tree/broadleafCanopyMaterials';

/** 19 资产色卡映射整表（值域依据 docs/procedural-assets/metadata-taxonomy.md §2.1；T024.3 批二收官 = **13 树卡集全量终态**：11 树双卡 default+autumn + camphor/ligustrum 常绿单卡终态；设施/DEV 空数组显式无卡；卡 id 域 024.2 定稿 = {'default','autumn'}） */
const EXPECTED_PRESETS: Record<string, readonly string[]> = {
  asset_tree_3a: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.3 批二：秋·黄褐（Forestry England + Spec §6）
  asset_tree_celtis: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.3 批二：秋·黄（OSU + 温州照片——黄主相不入橙红）
  asset_tree_camphor: [DEFAULT_COLOR_PRESET_ID],
  asset_tree_zelkova: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.3 批二：秋·橙-铜橙（OSU 变幅 + 双样木）
  asset_tree_ginkgo: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.1 试点真卡：秋·金黄（Spec §6 五源交叉 + fall 样木复证）；id 域 024.2 定稿 'autumn' 保持
  asset_tree_platanus: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.2 批一：秋·黄褐（NC + form-c 第三眼）
  asset_tree_koelreuteria: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.2 批一：秋·金黄（NC + wiki）
  asset_tree_triadica: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.2 批一：秋·绯红（NC + wiki + autumn-a/b 色占比）
  asset_tree_bischofia: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.3 批二：秋·红-红橙（Spec 1.1 增量文献四源红相裁决——峰相基调，黄主导 = 过渡态不作卡）
  asset_tree_sophora: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.2 批一：秋·金黄（NC 单源权威——有据非多源裁定）
  asset_tree_fraxinus: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.2 批一：秋·金黄（Spec 1.1 增量：主相金黄 + iNat 双照）
  asset_tree_ligustrum: [DEFAULT_COLOR_PRESET_ID],
  asset_tree_salix: [DEFAULT_COLOR_PRESET_ID, 'autumn'], // T024.2 批一：秋·黄绿（Spec 1.1 增量：NC greenish-yellow 主相——弱秋色不造金黄）
  asset_signpost: [],
  asset_trashbin: [],
  asset_streetlamp: [],
  asset_parkbench: [],
  asset_hydrant: [],
  asset_seedstack: [], // DEV 管线验证资产：显式无卡
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

describe('程序化资产色卡契约（T024.1，D44 #2 整表锁）', () => {
  const metas = collectProceduralAssetMetas();

  it('19 资产色卡映射整表：卡 id 集合与 EXPECTED_PRESETS 逐资产全等', () => {
    expect(metas.length).toBe(Object.keys(EXPECTED_PRESETS).length); // 双向：多登/漏登皆红
    for (const meta of metas) {
      expect(Object.keys(EXPECTED_PRESETS)).toContain(meta.id);
      expect(meta.presets.map((p) => p.id)).toEqual(EXPECTED_PRESETS[meta.id]);
    }
  });

  it('卡 id 资产内唯一（重复 id = 声明笔误）', () => {
    for (const meta of metas) {
      const ids = meta.presets.map((p) => p.id);
      expect(new Set(ids).size, meta.id).toBe(ids.length);
    }
  });

  it('非空卡集的 default 卡必在且居首（DEFAULT_COLOR_PRESET_ID 单一真相源）', () => {
    for (const meta of metas) {
      if (meta.presets.length === 0) continue; // 空数组 = 显式无卡（合法态）
      expect(meta.presets[0]!.id, meta.id).toBe(DEFAULT_COLOR_PRESET_ID);
    }
  });

  it('乔木族（family broadleaf）非空断言——至少 default 卡（族门承接面在现役 13 树上锁定）', () => {
    const trees = metas.filter((m) => m.taxonomy.family === 'broadleaf');
    expect(trees.length).toBe(13);
    for (const meta of trees) {
      expect(meta.presets.length > 0, meta.id).toBe(true);
    }
  });

  it('浏览语义三字段：label 非空、swatch 合法 hex 数据色（色点 UI 唯一视觉来源——缩略图不随卡重渲）', () => {
    for (const meta of metas) {
      for (const preset of meta.presets) {
        expect(typeof preset.label === 'string' && preset.label !== '', `${meta.id}:${preset.id} label`).toBe(true);
        expect(preset.swatch, `${meta.id}:${preset.id} swatch`).toMatch(HEX_COLOR);
      }
    }
  });

  it('canopy 冠色覆写表与声明卡集同源：只覆盖已声明树种卡（11 行终态——ginkgo 试点 + 批一 6 树 + 批二 4 树，防两处卡集漂移）', () => {
    for (const [assetId, cards] of Object.entries(BROADLEAF_CANOPY_CROWN_PRESETS)) {
      const declared = EXPECTED_PRESETS[assetId];
      expect(declared, `canopy 覆写表含未声明资产: ${assetId}`).toBeDefined();
      for (const presetId of Object.keys(cards)) {
        expect(declared, `canopy 覆写卡未声明: ${assetId}:${presetId}`).toContain(presetId);
      }
    }
  });
});
