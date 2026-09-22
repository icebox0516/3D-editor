/**
 * tests/runtime/procedural/assets/assetTaxonomy.test.ts —— 程序化资产分类契约测试（T010.2，D22）。
 *
 * 覆盖：
 * - 枚举值域约束：全部收割 meta 的 taxonomy.category ∈ ASSET_TAXONOMY_CATEGORIES、
 *   family（如有）∈ ASSET_TAXONOMY_FAMILIES——锁「所有程序化资产 meta 满足新枚举约束」；
 * - 11 资产归类映射整表锁定：新资产不登记映射 = 测试红（配合 taxonomy 必填的编译
 *   约束，双闸——忘声明过不了 typecheck，声明了不登表过不了本测试）；
 * - family ↔ 大类配对约束（broadleaf/conifer/shrub → plant；三个设施细分 → facility）；
 * - proceduralProfile 数值纪律：min ≤ max、正数、有限；实测包围盒落带（细模档、
 *   跨形态槽，ε=0.01 容纳两位小数舍入差）——防几何演化后声明带静默失真。
 * 边界：分类为浏览语义，本文件只锁值域与映射，不测行为（D22：渲染/放置禁止按
 *      taxonomy 值 if-else）；与 meta.category（现行 UI 分组键）正交，本文件不断言 category。
 * 隔离：collectProceduralAssetMetas 只含插件文件收割清单（seam 注入不进清单，
 *      routes.test 已锁），本文件不注册任何临时路由 → 收割数恒 = 产品资产数。
 */
import { describe, expect, it } from 'vitest';
import {
  ASSET_TAXONOMY_CATEGORIES,
  ASSET_TAXONOMY_FAMILIES,
  morphSeedOf,
  type AssetTaxonomyCategory,
  type AssetTaxonomyFamily,
} from '../../../../src/domain/assets';
import { collectProceduralAssetMetas, getProceduralBuild } from '../../../../src/runtime/procedural/routes';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

/** 20 资产归类映射表（整表锁——值域依据与 GLB 侧映射见 docs/procedural-assets/metadata-taxonomy.md；011.8 前计数注释滞后一笔并校正） */
const EXPECTED_TAXONOMY: Record<string, { category: AssetTaxonomyCategory; family?: AssetTaxonomyFamily }> = {
  asset_flower: { category: 'plant' }, // family 不填：草本/地被族（T015）落地时再定值
  asset_shrub: { category: 'plant', family: 'shrub' },
  asset_oak: { category: 'plant', family: 'broadleaf' },
  asset_pine: { category: 'plant', family: 'conifer' },
  asset_tree_3a: { category: 'plant', family: 'broadleaf' },
  asset_tree_celtis: { category: 'plant', family: 'broadleaf' }, // T011.1 朴树——阔叶家族第二实例
  asset_tree_camphor: { category: 'plant', family: 'broadleaf' }, // T011.2 香樟——阔叶家族第三实例（常绿阔叶首个）
  asset_tree_zelkova: { category: 'plant', family: 'broadleaf' }, // T011.3 榉树——阔叶家族第四实例（落叶阔叶第二实例）
  asset_tree_ginkgo: { category: 'plant', family: 'broadleaf' }, // T011.4 银杏——阔叶家族第五实例（裸子植物按家族形态域归 broadleaf，记档见资产模块头）
  asset_tree_platanus: { category: 'plant', family: 'broadleaf' }, // T011.5 悬铃木——阔叶家族第六实例（落叶阔叶第三例，公园自然冠单干中龄个体）
  asset_tree_koelreuteria: { category: 'plant', family: 'broadleaf' }, // T011.6 栾树——阔叶家族第七实例（无患子科落叶阔叶第四例、复叶首例）
  asset_tree_triadica: { category: 'plant', family: 'broadleaf' }, // T011.7 乌桕——阔叶家族第八实例（大戟科落叶阔叶第五例、菱形叶首例——Triadica sebifera FOC 现口径，旧口径 Sapium sebiferum 记档见 Spec §1）
  asset_tree_bischofia: { category: 'plant', family: 'broadleaf' }, // T011.8 重阳木——阔叶家族第九实例（大戟科落叶阔叶第六例、复叶第二型（三出放射对称）——Bischofia polycarpa，无花果资产记档见资产模块头）
  asset_tree_sophora: { category: 'plant', family: 'broadleaf' }, // T011.9 国槐——阔叶家族第十实例（豆科落叶阔叶第七例、复叶第三型（一回奇数羽状窗列单级化）——Styphnolobium japonicum 现用名口径（FRPS/FOC 传统口径 Sophora japonica 同实体），无花资产 + 念珠荚果串记档见资产模块头）
  asset_tree_fraxinus: { category: 'plant', family: 'broadleaf' }, // T011.10 白蜡——阔叶家族第十一实例（木犀科落叶阔叶第八例、复叶第四型（一回奇数羽状**对生系首例**——Fraxinus chinensis subsp. chinensis 原亚种本尊，三重对生 + 匙形翅果帘幕簇记档见资产模块头）
  asset_signpost: { category: 'facility', family: 'road-facility' },
  asset_trashbin: { category: 'facility', family: 'public-facility' },
  asset_streetlamp: { category: 'facility', family: 'road-facility' },
  asset_parkbench: { category: 'facility', family: 'public-facility' },
  asset_hydrant: { category: 'facility', family: 'fire-safety' },
  asset_seedstack: { category: 'dev' }, // DEV 管线验证资产：无族可归，不填 family / proceduralProfile
};

/** family → 唯一合法大类（配对约束表；Record 完整性 = 新增 family 值必须同步本表，编译期强制） */
const FAMILY_MAJOR: Record<AssetTaxonomyFamily, AssetTaxonomyCategory> = {
  broadleaf: 'plant',
  conifer: 'plant',
  shrub: 'plant',
  'public-facility': 'facility',
  'road-facility': 'facility',
  'fire-safety': 'facility',
};

/** 声明带舍入容差（声明值两位小数 = 实测值四舍五入，ε 覆盖半位舍入差） */
const RANGE_EPSILON = 0.01;

/** 释放一次 build 产物的全部资源（含 tree_3a 的 customDepthMaterial，T009.5 契约通道） */
function disposeSource(source: InstanceSource): void {
  source.geometry.dispose();
  if (Array.isArray(source.material)) {
    for (const material of source.material) material.dispose();
  } else {
    source.material.dispose();
  }
  (source as { customDepthMaterial?: { dispose(): void } }).customDepthMaterial?.dispose();
}

describe('大类 / family 枚举契约（全部程序化资产 meta）', () => {
  it('每个收割 meta 声明合法 taxonomy：category / family 均在枚举值域内', () => {
    const metas = collectProceduralAssetMetas();
    expect(metas.length).toBeGreaterThan(0);
    for (const meta of metas) {
      expect(meta.taxonomy, `${meta.id} 缺 taxonomy 声明`).toBeDefined();
      expect(ASSET_TAXONOMY_CATEGORIES).toContain(meta.taxonomy.category);
      if (meta.taxonomy.family !== undefined) {
        expect(ASSET_TAXONOMY_FAMILIES, `${meta.id} family 不在值域`).toContain(meta.taxonomy.family);
      }
    }
  });

  it('归类映射整表锁定：收割清单与 EXPECTED_TAXONOMY 逐资产一致（新资产必须登表）', () => {
    const metas = collectProceduralAssetMetas();
    expect(metas.map((m) => m.id).sort()).toEqual(Object.keys(EXPECTED_TAXONOMY).sort());
    for (const meta of metas) {
      expect(meta.taxonomy, `${meta.id} taxonomy 与映射表不一致`).toEqual(EXPECTED_TAXONOMY[meta.id]);
    }
  });

  it('family ↔ 大类配对约束：family 值只配其唯一合法大类', () => {
    for (const meta of collectProceduralAssetMetas()) {
      const family = meta.taxonomy.family;
      if (family === undefined) continue;
      expect(meta.taxonomy.category, `${meta.id} family '${family}' 配错大类`).toBe(FAMILY_MAJOR[family]);
    }
  });
});

describe('proceduralProfile 尺寸声明（数值纪律 + 实测落带）', () => {
  it('数值纪律：声明的 Range 均 min ≤ max、正数、有限', () => {
    for (const meta of collectProceduralAssetMetas()) {
      const ranges = [
        ['heightRange', meta.proceduralProfile?.heightRange],
        ['widthRange', meta.proceduralProfile?.widthRange],
      ] as const;
      for (const [label, range] of ranges) {
        if (range === undefined) continue;
        expect(Number.isFinite(range.min) && Number.isFinite(range.max), `${meta.id} ${label} 含非有限值`).toBe(true);
        expect(range.min, `${meta.id} ${label} min ≤ max`).toBeLessThanOrEqual(range.max);
        expect(range.min, `${meta.id} ${label} 为正`).toBeGreaterThan(0);
      }
    }
  });

  it('实测落带：细模档包围盒落在声明带内（跨形态槽全枚举； minY = 0 贴地前提）', () => {
    for (const meta of collectProceduralAssetMetas()) {
      const profile = meta.proceduralProfile;
      if (profile === undefined) continue; // 可选字段：无声明不校验（seedstack 等无浏览语义需求）
      const build = getProceduralBuild(meta.id)!;
      expect(build, `${meta.id} 路由缺失`).toBeDefined();
      const slots = meta.shapeFamily?.size ?? 1;
      for (let slot = 0; slot < slots; slot++) {
        // 有形态族 → 逐槽 morphSeed（声明带 = 跨槽实测带）；无 → 无参缺省路径
        const source = meta.shapeFamily ? build({ seed: morphSeedOf(meta.id, slot), level: 'high' }) : build();
        try {
          source.geometry.computeBoundingBox();
          const bb = source.geometry.boundingBox!;
          // 高度定义前提：原点 = 底面中心（minY = 0）
          expect(bb.min.y, `${meta.id} slot-${slot} minY 应为 0（贴地语义）`).toBeCloseTo(0, 5);
          const height = bb.max.y - bb.min.y;
          const width = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
          const h = profile.heightRange;
          if (h !== undefined) {
            expect(height, `${meta.id} slot-${slot} 实测高 ${height.toFixed(4)} 越出声明带 [${h.min}, ${h.max}]`).toBeGreaterThanOrEqual(h.min - RANGE_EPSILON);
            expect(height).toBeLessThanOrEqual(h.max + RANGE_EPSILON);
          }
          const w = profile.widthRange;
          if (w !== undefined) {
            expect(width, `${meta.id} slot-${slot} 实测宽 ${width.toFixed(4)} 越出声明带 [${w.min}, ${w.max}]`).toBeGreaterThanOrEqual(w.min - RANGE_EPSILON);
            expect(width).toBeLessThanOrEqual(w.max + RANGE_EPSILON);
          }
        } finally {
          disposeSource(source);
        }
      }
    }
  }, 30000); // T011.2：香樟加入（8 槽 × High 实测构建）后越 5s 默认超时，提至 30s——断言语义零变化（celtis 测试同款先例）
});
