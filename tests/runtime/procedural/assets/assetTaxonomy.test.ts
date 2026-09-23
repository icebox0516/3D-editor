/**
 * tests/runtime/procedural/assets/assetTaxonomy.test.ts —— 程序化资产分类契约测试（T010.2，D22）。
 *
 * 覆盖：
 * - 枚举值域约束：全部收割 meta 的 taxonomy.category ∈ ASSET_TAXONOMY_CATEGORIES、
 *   family（如有）∈ ASSET_TAXONOMY_FAMILIES——锁「所有程序化资产 meta 满足新枚举约束」；
 * - 23 资产归类映射整表锁定：新资产不登记映射 = 测试红（配合 taxonomy 必填的编译
 *   约束，双闸——忘声明过不了 typecheck，声明了不登表过不了本测试）；
 * - family ↔ 大类配对约束（broadleaf/conifer/shrub → plant；三个设施细分 → facility）；
 * - proceduralProfile 数值纪律：min ≤ max、正数、有限；实测包围盒落带（细模档、
 *   跨形态槽，ε=0.01 容纳两位小数舍入差）——防几何演化后声明带静默失真；
 * - 跨资产程序键全局唯一（T020 阶段二收容断言）：全部声明 proceduralProfile 的注册
 *   资产 × 全部槽位 × high 档的 customProgramCacheKey（含 customDepthMaterial）逐资产
 *   去重后物种自键系零碰撞——替代原各树 Materials 测试的逐对碰撞 it（继承默认键与
 *   plant:/facility: 共享配方键 = 设计内 program 去重不参与；mid/low 收窄论证见
 *   「实测落带」it 内记档）。
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
import * as THREE from 'three';

/** 23 资产归类映射表（整表锁——值域依据与 GLB 侧映射见 docs/procedural-assets/metadata-taxonomy.md；计数注释 011.12 随本资产登记校正） */
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
  asset_tree_ligustrum: { category: 'plant', family: 'broadleaf' }, // T011.11 女贞——阔叶家族第十二实例（木犀科常绿阔叶第二例（香樟后）、家族首例**对生单叶挂点语言**——Ligustrum lucidum f. lucidum 原变型本尊，常绿密冠 + 肾形核果满冠下垂密簇记档见资产模块头）
  asset_tree_salix: { category: 'plant', family: 'broadleaf' }, // T011.12 垂柳——阔叶家族第十三实例（杨柳科落叶阔叶第九例、家族首例**垂枝冠**（契约应力位①档实证——upturn 强负链域内表达）——Salix babylonica，喷泉状垂帘冠 + 狭披针细叶互生沿索簇记档见资产模块头）
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

  it('实测落带 + 跨资产程序键全局唯一：细模档包围盒落在声明带内（跨形态槽全枚举； minY = 0 贴地前提）；全部程序键零碰撞', () => {
    // 跨资产程序键收容断言（T020 阶段二第 10 条，替代原 11 个 Materials 测试的逐对「零碰撞」it）：
    // 一次遍历收集全部声明 proceduralProfile 的注册资产 × 全部槽位 × high 档的全部
    // customProgramCacheKey（materialsOf 数组/单值两形态逐材质 + customDepthMaterial 若有），
    // 逐资产 Set 去重后跨资产比对——任一物种键系资产对碰撞在此一次暴露（O(n²) 逐对收窄
    // 为 O(n) 单遍）。口径记档：
    // - 槽位维度先逐资产去重（键不含 seed——同资产跨槽重开材质 = 同配方重实例，非碰撞）；
    // - 继承默认键的材质不收集（无注入标准材质，键 = onBeforeCompile 源码自证身份，
    //   同键 ⟺ 同码——如 streetlamp 发光板 / trashbin 参数化底座共享默认 program 属正确行为）；
    // - plant:/facility: 前缀 = 共享配方注册表键（recipe ↔ key 单射，「配方 key 不变则共享
    //   program」——跨资产共享是设计内去重，如 facility:metal-brush-pole 见 signpost 与
    //   streetlamp），不参与唯一性断言；物种自键系（<species>:* / tree3a:*）须全局唯一；
    // - 档位口径：键 = 前缀 + ':mid'/':low' 后缀保序拼接 ⟹ 带后缀碰撞 ⟺ 前缀碰撞 ⟹
    //   high 档已暴露；各资产 Materials 测试内「3 工厂 × 3 档 = 9 键互异」继续覆盖档间
    //   互异——mid/low 跨资产碰撞由二者共同等价覆盖，零覆盖损失。
    const hasCustomKey = (material: THREE.Material): boolean =>
      material.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey;
    const programKeysByAsset = new Map<string, Set<string>>();
    for (const meta of collectProceduralAssetMetas()) {
      const profile = meta.proceduralProfile;
      if (profile === undefined) continue; // 可选字段：无声明不校验（seedstack 等无浏览语义需求）
      const build = getProceduralBuild(meta.id)!;
      expect(build, `${meta.id} 路由缺失`).toBeDefined();
      const slots = meta.shapeFamily?.size ?? 1;
      const keys = programKeysByAsset.get(meta.id) ?? new Set<string>();
      programKeysByAsset.set(meta.id, keys);
      for (let slot = 0; slot < slots; slot++) {
        // 有形态族 → 逐槽 morphSeed（声明带 = 跨槽实测带）；无 → 无参缺省路径
        const source = meta.shapeFamily ? build({ seed: morphSeedOf(meta.id, slot), level: 'high' }) : build();
        try {
          // 程序键收集在 dispose 前完成（字符串取出后不受 finally 释放影响）
          for (const material of Array.isArray(source.material) ? source.material : [source.material]) {
            if (hasCustomKey(material)) keys.add(material.customProgramCacheKey());
          }
          if (source.customDepthMaterial !== undefined && hasCustomKey(source.customDepthMaterial)) {
            keys.add(source.customDepthMaterial.customProgramCacheKey());
          }
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
    // 跨资产唯一性：物种自键系键全局零碰撞（plant:/facility: 共享配方键除外——键 = 配方
    // 身份，同键必然同注入 GLSL，跨资产共享是设计内 program 去重而非混缓存）
    const ownerOfKey = new Map<string, string>();
    const collisions: string[] = [];
    for (const [assetId, keys] of programKeysByAsset) {
      for (const key of keys) {
        if (key.startsWith('plant:') || key.startsWith('facility:')) continue;
        const owner = ownerOfKey.get(key);
        if (owner !== undefined) collisions.push(`${key}（${owner} ↔ ${assetId}）`);
        else ownerOfKey.set(key, assetId);
      }
    }
    expect(collisions, '跨资产程序键应全局唯一（碰撞 = 混缓存风险；plant:/facility: 共享配方键设计内共享除外）').toEqual([]);
  }, 60000); // T011.2：香樟加入（8 槽 × High 实测构建）后越 5s 默认超时，提至 30s——断言语义零变化（celtis 测试同款先例）；2026-09-22：十树后全量满核并行下 30s 再饿超（隔离 12s 全绿——负载敏感非回归，011.10 机械加固先例同型），提至 60s
});
