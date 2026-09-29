# 程序化资产元数据与分类契约

> T010.2 产出（2026-09-19）。适用范围：一切程序化资产（`*.asset.ts` 插件体系，D17）的 meta 分类声明；GLB 侧为映射策略预留（§6——原消费方 T016 资产管理器已取消〔2026-09-24 共识，浏览器一行大分类即终态〕，该段降为纯策略记档）。
> 姊妹规范：文件组织与三级职责边界（T010.1）→ `organization.md`；LOD 声明规范（010.3）→ `lod-spec.md`；Shadow 公共能力与视觉验收 SOP（010.4）→ `shadow-visual-sop.md`。
> 决策锚：D22（大类+family+asset 三级可寻址）、D20.6（植物语义不进公共协议）、D21（nature 预留依据）、D17（插件契约）、D23.4（category 暂不动，T010.2 一次定契约）。
> T022 记档（2026-09-28）：v1 四低模植物（flower/shrub/oak/pine）删除；taxonomy 口径修正——大类仍经 `meta.category` 约束浏览器分栏值域，family 降为纯元数据（消费者 = 契约测试 + 必填声明），无三级浏览消费者。

## 1. 契约总览：两个正交的分类维度

| 维度 | 字段 | 值域形态 | 消费者 | 现状 |
|---|---|---|---|---|
| 现行分组键 | `meta.category: string` | 自由字符串（GLB 目录 slug / 程序化显式声明） | 资产栏/浏览器分组（`ui/panels/browserModel`） | **不动**——UI 分组行为不变（D23.4）；大类值域仍约束程序化声明 |
| 分类契约 | `meta.taxonomy: AssetTaxonomy` | 大类 enum + 可选 family enum | 契约测试（值域 + family↔大类配对 + 归类映射整表锁）；原 T016 三级浏览消费者已取消，family 无运行时消费者（纯元数据） | 本规范落地，程序化资产**必填** |

判定口诀：**category 管「现在浏览器怎么分栏」，taxonomy 管「归类正确性可测试」（消费者 = 契约测试，不驱动任何浏览 UI）——互不替代、互不派生**。`meta.taxonomy.category` 与 `meta.category` 同名不同物，读代码时以访问路径分辨。

另一对易混概念：**`taxonomy.family` ≠ `shapeFamily`**。前者是浏览分类层级（本规范），后者是 D19 形态槽随机路由声明（`{ size }`，seed→槽）；一个资产有 8 个形态槽不影响它只属于一个族。

## 2. 类型契约（真相源：`src/domain/assets/`）

```ts
// taxonomy.ts —— 值域真相源（const 元组 + 派生联合，供契约测试运行时校验）
export const ASSET_TAXONOMY_CATEGORIES = ['plant','building','vehicle','character','facility','device','nature','dev'] as const;
export const ASSET_TAXONOMY_FAMILIES   = ['broadleaf','conifer','shrub','public-facility','road-facility','fire-safety'] as const;
export interface AssetTaxonomy { category: AssetTaxonomyCategory; family?: AssetTaxonomyFamily }

// AssetDescriptor.ts —— ProceduralAssetMeta 增量
taxonomy: AssetTaxonomy;                 // 必填（一次定契约，避免资产二次迁移，D22）
presets: readonly AssetColorPresetMeta[];  // 必填（T024 / D44 #2——typecheck 闸；空数组 = 显式无卡）
proceduralProfile?: {                    // 可选；只收通用维度语义（米）
  heightRange?: Range;                   // 总高带：minY=0 → maxY；跨形态槽取实测 min/max
  widthRange?: Range;                    // 水平展幅带：max(X 展幅, Z 展幅)；跨槽实测
};
// AssetColorPresetMeta（浏览语义三字段——色值配方归各树材质工厂私有域，D44 #2）
// { id: string; label: string; swatch: string }   // swatch = UI 色点数据色（CSS 色串）
// DEFAULT_COLOR_PRESET_ID = 'default'             // 默认卡 id 全资产统一单一真相源
```

设计理由（为什么是这形态）：

- **必填 taxonomy + 可选 family**：大类保证归类正确性可测试（值域 + 配对 + 映射三闸整表锁）；族归属可以诚实缺席（待各族落地再定值）——「无诚实族归属不占位」优于「投机占位」（T022 后 family 纯元数据，消费者 = 契约测试 + 必填声明）。
- **enum 用 const 元组而非纯联合**：契约测试（`tests/runtime/procedural/assets/assetTaxonomy.test.ts`）需运行时值域校验全部收割 meta；元组即类型即校验源，单一真相。
- **profile 是尺寸不是形态**：数值全部来自细模档源几何包围盒实测（跨槽取带），两位小数；只服务浏览筛选/排序，不参与任何生成算法。
- **presets 必填（T024 / D44 #2）**：色卡是材质基调变体的声明面（浏览语义三字段），必填落在类型层 = 新资产不声明编译不过（「出生即带 preset」——跟随本节 taxonomy 必填先例）；色值配方不进 meta（归各树材质工厂私有域，D20.2 先例），本层只有 `id / label / swatch`。

### 2.1 色卡预设字段（presets，T024 / D44）

**语义**：preset（色卡）= 材质基调变体——**冠变干不变**（只改叶/冠材质基调，不改几何结构、不改树皮、不改风动；D44 #1。远景 canopy 冠卡随卡、干柱色不变）。默认卡 id 全资产统一 `'default'`（`DEFAULT_COLOR_PRESET_ID` 单一真相源）= 现行材质基调。

**声明纪律**：

- **必填 + 空数组合法**：空数组 = 显式声明「本资产无色卡」（设施 / DEV 资产合法态）；乔木 / 植物族「非空且含 default 卡」的族级断言归各自 epic 族门定义（D30 不预防性泛化）。
- **卡 id 纪律**：资产内唯一；**跨树同相卡 id 同名**（便于散布配方书写）。**id 域（T024.2 定稿，T025.1 增补）**：现役域 = `'default'`（全资产统一默认卡）+ `'autumn'`（秋相卡，跨树同名）+ `'yellow'`（设施色卡首例——T025.1 交通锥黄相副卡〔停车场语境，GB/T 24720 宜红为 default〕；后续设施色相卡跨资产同名复用）——试点 ginkgo `'autumn'` 保持不改名；后续新相（春/新叶相等）由引入它的任务增补，须同步更新本节记档与整表锁 EXPECTED_PRESETS。**13 树卡集终态（T024.2 批一 + T024.3 批二收官，2026-09-28）**：11 树双卡 `default`+`autumn`——ginkgo（秋·金黄）/ platanus（秋·黄褐）/ koelreuteria（秋·金黄）/ sophora（秋·金黄）/ triadica（秋·绯红）/ fraxinus（秋·金黄，Spec 1.1 补证）/ salix（秋·黄绿，Spec 1.1 补证·弱秋色晚相变体）/ tree3a（秋·黄褐）/ celtis（秋·黄）/ zelkova（秋·橙-铜橙）/ bischofia（秋·红-红橙，Spec 1.1 补证·文献四源红相裁决——与 triadica 绯红的种间分离轴记档于材质表注释）；camphor / ligustrum **default 单卡终态**（常绿不建秋卡——camphor 秋相证据为「基调不变 + 斑驳叠加信号」非基调变体、整冠移黄 = 误表达；ligustrum 无秋色相〔冬季四样木满叶浓绿 = 正面否定证据〕；裁定记档于各 asset meta 注释）；**cedrus default 单卡终态（T012.1，2026-09-29——conifer 首例同 camphor/ligustrum 常绿口径：FRPS「终年常绿」+ NC evergreen 无秋色字段〔阴性〕+ 冬季三点照片直证）**。秋色谱系横向读向：triadica 绯红 ↔ bischofia 红-红橙 ↔ zelkova 橙-铜橙 ↔ celtis 黄 ↔ ginkgo/koelreuteria/sophora/fraxinus 金黄段 ↔ tree3a/platanus 黄褐 ↔ salix 黄绿。色值与证据锚归各树材质工厂私有域 + Reference Spec。
- **证据纪律（D44 #7 无证据不建卡）**：每树至少 default 卡（= 现行生产相，天然有据）；季相卡逐树按 Reference Spec 季相记录定，卡数不设统一硬指标；缺证相先经 asset-research 补 Spec 增量再建卡——色值参数注释逐卡引 Spec 条目（同资产数值注释纪律）。
- **swatch = 数据色**：CSS 色串，仅服务浏览器色点 UI（T024.4）；**缩略图不随卡重渲**。

**消费链（运行面条款锚点 `lod-spec.md` §2.3–§2.5）**：preset 进 sourceKey 缓存分桶（材质不同必须分桶，硬要求）；geometry / customDepthMaterial 跨卡共享引用计数（D44 #3，D17 build 契约窄化）；`AssetReference.preset?` 默认卡省略不落盘（旧场景零迁移）；读侧未知卡 id 宽容回退 default（`resolveDeclaredPreset` 单一 choke point）；Ghost 携卡所见即所得；散布 `ScatterAssetWeight.preset?` 为 schema 预留位（消费归散布任务，D44 #6）；Inspector 换卡（已放对象切卡）不在 T024 范围——增补位记档于 D44 #4。

**契约测试**：`tests/runtime/procedural/assets/assetColorPresets.test.ts`——存量 13 乔木卡清单整表锁 + 卡 id 唯一性 + 乔木族非空（assetTaxonomy 式先例；与 typecheck 必填闸双钩并用，D44 #2）。

## 3. 大类值域（8 值，每个值有消费者证据）

| 值 | 中文 | 现有消费者 | 证据来源 |
|---|---|---|---|
| `plant` | 植物 | 程序化 14（tree_3a + T011 十二树种阔叶 + T012.1 雪松 conifer 首例；T022 删 v1 四低模后程序化 plant 面全为乔木）+ GLB 3（plant 目录） | 19→20 资产 meta + manifest.json |
| `building` | 建筑 | GLB 4（building 目录） | manifest.json |
| `vehicle` | 车辆 | GLB 1（car.glb） | manifest.json |
| `character` | 人物 | GLB 1（person.glb） | manifest.json |
| `facility` | 公共设施 | 程序化 11（signpost/trashbin/streetlamp/parkbench/hydrant + T025.1 批 A 六件：bollard/pedestrian_barrier/road_barrier/wheelstop/trafficcone/speedbump）+ GLB 三目录归并（§6） | 25 资产 meta + manifest.json |
| `device` | 设备 | GLB 1（sensor.glb） | manifest.json |
| `nature` | 自然 | **预留值，当前 0 资产** | D21 点名近期消费者（固定尺寸湖泊，T016/T017 引入）——扩展依据 = 决策记录 |
| `dev` | DEV | 程序化 1（asset_seedstack；浏览器产品栏按 category 'dev' 过滤） | 19 资产 meta + ui/panels/browserModel |

值域纪律：**新增大类必须有现实或近期能指出的消费者**（现存资产、GLB 目录、或决策/任务记录点名）——「将来可能有用」不构成依据。`nature` 是唯一零资产值，保留理由仅为 D21 决策点名；T017 立项变更有变则随候修订。

## 4. family 值域与配对约束

| 值 | 中文 | 唯一合法大类 | 现有消费者 | 近期消费者 |
|---|---|---|---|---|
| `broadleaf` | 阔叶乔木 | plant | tree_3a（家族契约第一实例，`tree/broadleaf/`）+ T011 十二树种 | —（T022 后家族现役 13 实例） |
| `conifer` | 针叶 | plant | tree_cedrus（T012.1 雪松——**conifer 家族契约第一实例** `tree/conifer/`，D37.2 草案首证；层状轮生骨架 + 长短枝双挂点 + 常绿 default 单卡） | T012 针叶族（后续树种） |
| `shrub` | 灌木 | plant | —（T022 删 shrub 后 0 资产） | T014 灌木族 |
| `public-facility` | 公共设施 | facility | parkbench、trashbin | GLB public-facility 目录（bench） |
| `road-facility` | 道路设施 | facility | streetlamp、signpost、T025.1 批 A 六件（bollard/pedestrian_barrier/road_barrier/wheelstop/trafficcone/speedbump） | GLB road-facility 目录（streetlight） |
| `fire-safety` | 消防设施 | facility | hydrant | GLB fire-safety 目录（extinguisher） |

- 设施三 family 的粒度 = GLB models 目录既有粒度（`scripts/scan-assets.mjs` CATEGORY_LABELS 同源）：大类层归并为 `facility`，family 层保住细分（原 T016 三级浏览依据；T016 取消后为纯元数据粒度）。
- 配对约束锁在契约测试 `FAMILY_MAJOR` 表（`Record<AssetTaxonomyFamily, AssetTaxonomyCategory>` 完整性 = 新增 family 不同步配对即编译红）。
- 植物族值与家族契约层目录名对齐（`broadleaf` ↔ `tree/broadleaf/`）；T013 花木族、T015 地被/草本族落地时各自新增 family 值（原 v1 花卉资产已随 T022 删除）。

## 5. 程序化资产归类映射（含实测尺寸声明）

> T010.2 实测快照表。T011 十二树种归类全为 `plant`/`broadleaf`（逐资产映射与实测带的真相源 = 契约测试 `EXPECTED_TAXONOMY` 及各资产文件 `proceduralProfile`，不入本表）；T022 删 v1 四低模植物（flower/shrub/oak/pine）四行移除。

| 资产 id | 大类 | family | heightRange | widthRange | 备注 |
|---|---|---|---|---|---|
| asset_tree_3a | plant | broadleaf | 7.39–9.12 | 4.44–9.80 | 跨 8 槽实测带；模块头 7.4–8.5/5.4–6.6 为 slot-0 锚点描述（T008.2 口径），slot-3 展开型宽 9.80 如实入带 |
| asset_signpost | facility | road-facility | 2.04 | 0.60 | 宽 = 牌面 |
| asset_trashbin | facility | public-facility | 0.90 | 0.68 | 宽含投口翻盖前伸 |
| asset_streetlamp | facility | road-facility | 4.21 | 0.89 | 宽含悬臂外伸与灯头 |
| asset_parkbench | facility | public-facility | 0.81 | 1.70 | 宽 = 座长向 |
| asset_hydrant | facility | fire-safety | 0.73 | 0.38 | 宽含两侧横伸栓口 |
| asset_bollard | facility | road-facility | 0.80 | 0.20 | T025.1；宽 = 法兰直径向（沪官方 φ114/露出 80cm 锚） |
| asset_pedestrian_barrier | facility | road-facility | 1.10 | 2.05 | T025.1；宽含基座板外凸（立柱外缘 2.00，GB 50688 净高锚） |
| asset_road_barrier | facility | road-facility | 1.10 | 3.12 | T025.1；宽含底座外缘（标称段长 3.0，GA/T 1567 中央档锚） |
| asset_wheelstop | facility | road-facility | 0.11 | 0.55 | T025.1；高含反光条（本体 0.10，聚簇 550×150×100） |
| asset_trafficcone | facility | road-facility | 0.70 | 0.38 | T025.1；**首个设施色卡资产**（default 红 + yellow 黄双卡）；宽 = 底座向 |
| asset_speedbump | facility | road-facility | 0.05 | 2.00 | T025.1；宽 = 4 段总长（段 0.5 黄黑交替，拱高 0.045 舍入） |
| asset_seedstack | dev | — | — | — | DEV 资产不进产品浏览，不声明 profile（不投机造数） |

数值纪律：全部为细模档（level 'high'）源几何包围盒实测（T010.2 探针，2026-09-19，逐资产跨槽取证），两位小数舍入；单形态资产 min=max。契约测试以 ε=0.01 容差锁「实测落带」——几何演化导致越带即测试红，逼声明同步。

## 6. GLB 侧映射策略（原 T016 消费预留——T016 已取消，降为策略记档）

> T016 资产管理器已取消（2026-09-24 共识，T022 记档）：本段无已立项实装消费者，保留为 GLB 侧若引入 taxonomy 派生时的策略依据。

GLB 文件资产不声明 taxonomy——由 manifest 目录分类（一级目录 slug）映射派生，manifest.json 与 `scripts/scan-assets.mjs` 现状不动。映射表（目录 slug → taxonomy）：

| GLB 目录 slug | taxonomy |
|---|---|
| plant / building / vehicle / character / device | 同名大类，无 family |
| public-facility / road-facility / fire-safety | `{ category: 'facility', family: <slug> }` |
| 未知目录 | 若实装时裁定：可映射进现有值域则映射（登记 §3 证据），否则走 §7 扩展流程新增大类 |

实现口径建议（§6 若引入时参考，当前无已立项消费者）：映射发生在 bootstrap 灌注 AssetRegistry 前（或 registry 查询侧派生），`ModelAsset` 增可选 taxonomy 字段或查询函数——**不改 GLB 文件与扫描脚本**，保持「目录即分类」的既有事实源。

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
- **不迁移 category**：现行 UI 分组键与浏览器行为维持现状；category→taxonomy 的归并消费无已立项消费者（T016 已取消），不是资产 meta 的活。
