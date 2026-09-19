# 程序化资产元数据与分类契约

> T010.2 产出（2026-09-19）。适用范围：一切程序化资产（`*.asset.ts` 插件体系，D17）的 meta 分类声明；GLB 侧为映射策略预留（T016 消费，§6）。
> 姊妹规范：文件组织与三级职责边界（T010.1）→ `organization.md`；LOD 声明规范（010.3）→ `lod-spec.md`；Shadow 公共能力与视觉验收 SOP（010.4）→ `shadow-visual-sop.md`。
> 决策锚：D22（大类+family+asset 三级可寻址）、D20.6（植物语义不进公共协议）、D21（nature 预留依据）、D17（插件契约）、D23.4（category 暂不动，T010.2 一次定契约）。

## 1. 契约总览：两个正交的分类维度

| 维度 | 字段 | 值域形态 | 消费者 | 现状 |
|---|---|---|---|---|
| 现行分组键 | `meta.category: string` | 自由字符串（GLB 目录 slug / 程序化显式声明） | 资产栏/浏览器分组（`ui/panels/browserModel`） | **不动**——UI 分组行为不变（D23.4） |
| 分类契约 | `meta.taxonomy: AssetTaxonomy` | 大类 enum + 可选 family enum | T016 资产管理器「大类 → 小类/族 → 具体资产」浏览 | 本规范落地，程序化资产**必填** |

判定口诀：**category 管「现在浏览器怎么分栏」，taxonomy 管「T16 时代怎么三级寻址」——互不替代、互不派生**。`meta.taxonomy.category` 与 `meta.category` 同名不同物，读代码时以访问路径分辨。

另一对易混概念：**`taxonomy.family` ≠ `shapeFamily`**。前者是浏览分类层级（本规范），后者是 D19 形态槽随机路由声明（`{ size }`，seed→槽）；一个资产有 8 个形态槽不影响它只属于一个族。

## 2. 类型契约（真相源：`src/domain/assets/`）

```ts
// taxonomy.ts —— 值域真相源（const 元组 + 派生联合，供契约测试运行时校验）
export const ASSET_TAXONOMY_CATEGORIES = ['plant','building','vehicle','character','facility','device','nature','dev'] as const;
export const ASSET_TAXONOMY_FAMILIES   = ['broadleaf','conifer','shrub','public-facility','road-facility','fire-safety'] as const;
export interface AssetTaxonomy { category: AssetTaxonomyCategory; family?: AssetTaxonomyFamily }

// AssetDescriptor.ts —— ProceduralAssetMeta 增量
taxonomy: AssetTaxonomy;                 // 必填（一次定契约，避免资产二次迁移，D22）
proceduralProfile?: {                    // 可选；只收通用维度语义（米）
  heightRange?: Range;                   // 总高带：minY=0 → maxY；跨形态槽取实测 min/max
  widthRange?: Range;                    // 水平展幅带：max(X 展幅, Z 展幅)；跨槽实测
};
```

设计理由（为什么是这形态）：

- **必填 taxonomy + 可选 family**：大类是浏览第一级，缺了三级寻址断链；族归属可以诚实缺席（如花卉待 T015 定草本/地被族值）——「无诚实族归属不占位」优于「投机占位」。
- **enum 用 const 元组而非纯联合**：契约测试（`tests/runtime/procedural/assets/assetTaxonomy.test.ts`）需运行时值域校验全部收割 meta；元组即类型即校验源，单一真相。
- **profile 是尺寸不是形态**：数值全部来自细模档源几何包围盒实测（跨槽取带），两位小数；只服务浏览筛选/排序，不参与任何生成算法。

## 3. 大类值域（8 值，每个值有消费者证据）

| 值 | 中文 | 现有消费者 | 证据来源 |
|---|---|---|---|
| `plant` | 植物 | 程序化 5（flower/shrub/oak/pine/tree_3a）+ GLB 3（plant 目录） | 11 资产 meta + manifest.json |
| `building` | 建筑 | GLB 4（building 目录） | manifest.json |
| `vehicle` | 车辆 | GLB 1（car.glb） | manifest.json |
| `character` | 人物 | GLB 1（person.glb） | manifest.json |
| `facility` | 公共设施 | 程序化 5（signpost/trashbin/streetlamp/parkbench/hydrant）+ GLB 三目录归并（§6） | 11 资产 meta + manifest.json |
| `device` | 设备 | GLB 1（sensor.glb） | manifest.json |
| `nature` | 自然 | **预留值，当前 0 资产** | D21 点名近期消费者（固定尺寸湖泊，T016/T017 引入）——扩展依据 = 决策记录 |
| `dev` | DEV | 程序化 1（asset_seedstack；浏览器产品栏按 category 'dev' 过滤） | 11 资产 meta + ui/panels/browserModel |

值域纪律：**新增大类必须有现实或近期能指出的消费者**（现存资产、GLB 目录、或决策/任务记录点名）——「将来可能有用」不构成依据。`nature` 是唯一零资产值，保留理由仅为 D21 决策点名；T017 立项变更有变则随候修订。

## 4. family 值域与配对约束

| 值 | 中文 | 唯一合法大类 | 现有消费者 | 近期消费者 |
|---|---|---|---|---|
| `broadleaf` | 阔叶乔木 | plant | tree_3a（家族契约第一实例，`tree/broadleaf/`）、oak | T011 朴树/香樟/榉树/银杏 |
| `conifer` | 针叶 | plant | pine | T012 针叶族 |
| `shrub` | 灌木 | plant | shrub | T014 灌木族 |
| `public-facility` | 公共设施 | facility | parkbench、trashbin | GLB public-facility 目录（bench） |
| `road-facility` | 道路设施 | facility | streetlamp、signpost | GLB road-facility 目录（streetlight） |
| `fire-safety` | 消防设施 | facility | hydrant | GLB fire-safety 目录（extinguisher） |

- 设施三 family 的粒度 = GLB models 目录既有粒度（`scripts/scan-assets.mjs` CATEGORY_LABELS 同源）：大类层归并为 `facility`，family 层保住细分——T016 三级浏览（设施 → 消防设施 → 消防栓）直接成立。
- 配对约束锁在契约测试 `FAMILY_MAJOR` 表（`Record<AssetTaxonomyFamily, AssetTaxonomyCategory>` 完整性 = 新增 family 不同步配对即编译红）。
- 植物族值与家族契约层目录名对齐（`broadleaf` ↔ `tree/broadleaf/`）；T013 花木族、T015 地被/草本族落地时各自新增 family 值（花卉 asset_flower 现不填 family，届时补）。

## 5. 11 资产归类映射（含实测尺寸声明）

| 资产 id | 大类 | family | heightRange | widthRange | 备注 |
|---|---|---|---|---|---|
| asset_flower | plant | — | 0.39 | 0.33 | family 待 T015 |
| asset_shrub | plant | shrub | 0.90 | 1.69 | 头注「丛幅≈1.9」为估算，以实测为准 |
| asset_oak | plant | broadleaf | 6.12 | 5.15 | 003.4 旧实现冻结返工中；分类只认树种不认实现代际 |
| asset_pine | plant | conifer | 7.00 | 3.77 | |
| asset_tree_3a | plant | broadleaf | 7.39–9.12 | 4.44–9.80 | 跨 8 槽实测带；模块头 7.4–8.5/5.4–6.6 为 slot-0 锚点描述（T008.2 口径），slot-3 展开型宽 9.80 如实入带 |
| asset_signpost | facility | road-facility | 2.04 | 0.60 | 宽 = 牌面 |
| asset_trashbin | facility | public-facility | 0.90 | 0.68 | 宽含投口翻盖前伸 |
| asset_streetlamp | facility | road-facility | 4.21 | 0.89 | 宽含悬臂外伸与灯头 |
| asset_parkbench | facility | public-facility | 0.81 | 1.70 | 宽 = 座长向 |
| asset_hydrant | facility | fire-safety | 0.73 | 0.38 | 宽含两侧横伸栓口 |
| asset_seedstack | dev | — | — | — | DEV 资产不进产品浏览，不声明 profile（不投机造数） |

数值纪律：全部为细模档（level 'high'）源几何包围盒实测（T010.2 探针，2026-09-19，逐资产跨槽取证），两位小数舍入；单形态资产 min=max。契约测试以 ε=0.01 容差锁「实测落带」——几何演化导致越带即测试红，逼声明同步。

## 6. GLB 侧映射策略（T016 消费预留，本任务不实装）

GLB 文件资产不声明 taxonomy——由 manifest 目录分类（一级目录 slug）在 **T016 资产管理器装配时映射派生**，manifest.json 与 `scripts/scan-assets.mjs` 现状不动。映射表（目录 slug → taxonomy）：

| GLB 目录 slug | taxonomy |
|---|---|
| plant / building / vehicle / character / device | 同名大类，无 family |
| public-facility / road-facility / fire-safety | `{ category: 'facility', family: <slug> }` |
| 未知目录 | T016 实装时裁定：可映射进现有值域则映射（登记 §3 证据），否则走 §7 扩展流程新增大类 |

实现口径建议（T016 参考，非本任务交付）：映射发生在 bootstrap 灌注 AssetRegistry 前（或 registry 查询侧派生），`ModelAsset` 增可选 taxonomy 字段或查询函数——**不改 GLB 文件与扫描脚本**，保持「目录即分类」的既有事实源。

## 7. 扩展流程（新增大类 / family / 资产归类）

新增一个值的固定动作（漏一步即三门槛或契约测试红）：

1. **依据先行**：值必须有消费者证据（现存资产 / GLB 目录 / 决策或任务记录点名）——写进本文档对应表的证据列。
2. **值域落型**：`src/domain/assets/taxonomy.ts` 元组加值（派生联合自动跟上）。
3. **配对登记**（family）：契约测试 `FAMILY_MAJOR` 加配对（漏加编译红）；本文档 §4 表同步。
4. **映射登表**（资产）：契约测试 `EXPECTED_TAXONOMY` 登记新资产；本文档 §5 表同步。
5. **三门槛全绿**：`npm test` / `npm run check:layers` / `npm run typecheck`。

新资产归类速查：植物按族（阔叶→broadleaf / 针叶→conifer / 灌木→shrub，族未落地不填）；园区设施按细分（道路附属→road-facility / 大众休憩与环卫→public-facility / 消防→fire-safety，拿不准先问「GLB 三目录哪个会收它」）；管线验证资产→dev。

## 8. 禁则（评审即拦）

- **分类不承载行为**：渲染、放置、LOD、Shadow 代码禁止按 taxonomy 值 if-else（D22）——分类只回答「这是什么」，不回答「怎么画/怎么摆」。
- **植物术语不进公共协议**：crownWidth（冠幅）等植物专属语义禁止成为 `AssetCommonMeta` / `AssetDescriptor` 公共字段（D20.6——消防车/建筑/路灯不应被迫回答冠幅）；冠幅语义归家族契约层（`tree/broadleaf` 契约已有 crown* 字段），浏览侧一律换 `widthRange` 通用语。
- **不投机**：大类/family 值、profile 数值，没有消费者证据或实测依据就不落——必填的只有大类，其余全部可缺席。
- **不迁移 category**：现行 UI 分组键与浏览器行为维持现状；category→taxonomy 的归并消费是 T016 的活，不是资产 meta 的活。
