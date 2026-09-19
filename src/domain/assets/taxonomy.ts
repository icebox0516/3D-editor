/**
 * domain/assets/taxonomy —— 资产分类契约：大类 + family 两级浏览语义枚举（T010.2，D22）。
 *
 * 职责：T016 资产管理器「大类 → 小类/族 → 具体资产」三级可寻址浏览的前两级值域真相源。
 *      大类 = 粗粒度浏览分组（植物/建筑/…），family = 可选族层级（broadleaf/conifer/…，
 *      与 GLB models 目录的设施细分粒度对齐）。值域只收「有现实或近期能指出的消费者」的
 *      值（D22 + T010.2 约束——不投机扩值），扩展流程见
 *      docs/procedural-assets/metadata-taxonomy.md。
 * 边界：零 THREE、纯数据（const 元组 + 派生联合类型，供契约测试运行时校验）；
 *      **浏览语义不承载行为分支**——渲染/放置代码禁止按 taxonomy 值 if-else（D22）；
 *      与 meta.category（现行 UI 分组键，自由字符串）正交，不互相替代；
 *      与 meta.shapeFamily（D19 形态槽路由）完全无关——同名「族」不同物：
 *      taxonomy.family = 浏览分类层级，shapeFamily = seed→槽 随机路由声明。
 * 值域依据（消费者证据，详表见 metadata-taxonomy.md）：
 *      - plant/building/vehicle/character/device：程序化 5 植物 + GLB manifest 8 目录分类
 *        中 6 个非设施分类（assets/manifest.json，scripts/scan-assets.mjs CATEGORY_LABELS）；
 *      - facility：程序化 5 设施资产（category 'facility'）+ GLB 三个设施细分目录
 *        （public-facility / road-facility / fire-safety）在大类层归并（family 保住细分粒度）；
 *      - nature：预留值——D21 明确点名近期消费者（固定尺寸湖泊，T016/T017 引入），
 *        当前 0 资产，扩展依据 = 决策记录而非现存资产；
 *      - dev：DEV 管线验证资产（asset_seedstack；浏览器产品栏按 category 'dev' 过滤）。
 */

/** 大类枚举值（浏览语义；新增值须过扩展流程——值域证据见模块头与契约文档） */
export const ASSET_TAXONOMY_CATEGORIES = [
  'plant',
  'building',
  'vehicle',
  'character',
  'facility',
  'device',
  'nature',
  'dev',
] as const;

/** 大类类型（= ASSET_TAXONOMY_CATEGORIES 值域；运行时校验用常量本体） */
export type AssetTaxonomyCategory = (typeof ASSET_TAXONOMY_CATEGORIES)[number];

/**
 * family 枚举值（族层级 = T016 三级浏览的中间层；可选声明）。
 * 配对约束：broadleaf/conifer/shrub 仅配 plant；public-facility/road-facility/
 * fire-safety 仅配 facility（配对表锁在契约测试，不另设运行时结构）。
 */
export const ASSET_TAXONOMY_FAMILIES = [
  // 植物（T011/T012/T014 各族落地时增量扩充；草本/地被 T015 落地时新增值）
  'broadleaf',
  'conifer',
  'shrub',
  // 设施（细分粒度 = GLB models 目录既有三目录，大类归并 family 保留）
  'public-facility',
  'road-facility',
  'fire-safety',
] as const;

/** family 类型（= ASSET_TAXONOMY_FAMILIES 值域） */
export type AssetTaxonomyFamily = (typeof ASSET_TAXONOMY_FAMILIES)[number];

/**
 * 分类声明（ProceduralAssetMeta.taxonomy 的形态）：大类必填 + 可选 family。
 * 程序化资产一次定契约（D22——避免资产二次迁移）；GLB 侧由 manifest 目录
 * 分类映射派生（T016 消费，策略见 metadata-taxonomy.md，不动 manifest 现状）。
 */
export interface AssetTaxonomy {
  /** 大类（浏览分组；值域 AssetTaxonomyCategory） */
  category: AssetTaxonomyCategory;
  /** 族（可选；值域 AssetTaxonomyFamily。无诚实族归属的资产不填——不投机占位） */
  family?: AssetTaxonomyFamily;
}
