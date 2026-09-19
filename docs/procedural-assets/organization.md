# 程序化资产文件组织与三级职责边界

> T010.1 产出（2026-09-19）。适用范围：一切程序化资产（`*.asset.ts` 插件体系，D17）；GLB 导入资产不适用。
> 姊妹规范（均已落档 2026-09-19）：元数据与分类契约（010.2）→ [metadata-taxonomy.md](metadata-taxonomy.md)；LOD 声明规范（010.3）→ [lod-spec.md](lod-spec.md)；Shadow 公共能力与视觉验收 SOP（010.4）→ [shadow-visual-sop.md](shadow-visual-sop.md)。
> 决策锚：D17（插件契约）、D19（形态身份/sourceKey）、D20.3（不预抽象/四文件为推荐结构）、D22（大类+family+asset 三级可寻址）、D23.5（职责边界不重划）。

## 1. 三级职责边界

程序化植物资产的能力分三级，**新增能力先问归属哪级，归错级是评审问题**：

| 级 | 位置 | 拥有 | 禁止 |
|---|---|---|---|
| **Plant Runtime**（资产运行时） | `src/runtime/procedural/`（types / routes / ProceduralSourceCache）+ `src/runtime/instancing/InstancedAssetPool` + Renderer 接线 | 插件契约签名、构建路由、Source 生命周期（含 sourceKey+level 双维缓存）、实例化与合批、风动 uTime 接线、Shadow 挂载点 | 感知任何具体树种；承载植物语义（crownWidth 等归 Family/Asset，D20.6） |
| **Family**（家族契约层） | `src/runtime/procedural/tree/<family>/`（现例：`tree/broadleaf/broadleafShapeProfile.ts`） | 家族**类型契约**（shapeProfile 字段语义、共性/特有标注、消费语义、槽间恒等纪律）；纯类型零运行时 | 任何运行时代码（工厂/默认值/算法）；无真实消费者的投机字段 |
| **Asset**（资产实现层） | `src/runtime/procedural/tree/<assetId>/`（现例：`tree/tree3a/`）+ 入口 `assets/asset_*.asset.ts` | 树种特有算法（几何生成/材质配方/LOD 派生）、**全部数值依据**（Reference Spec 锚点、锚定值、实测校准记录）、槽组合、DEV 出图面 | 植物语义进公共协议（`ProceduralBuild` 公共签名/D22 大类 enum）；模块级共享可变对象（每次 build 全部 new，D17） |

判定口诀：**换一个树种还需要的能力 → Family 或 Runtime；只有这棵树用的事实（数值/算法/配方）→ Asset；跟资产无关的机制（缓存/池/调度）→ Runtime。**

## 2. 文件组织规范

### 2.1 两档结构（推荐结构不是契约，D20.3）

**最小结构 = 单文件**（现行 10 个简单资产均为此档）：

```
src/runtime/procedural/assets/<name>.asset.ts   // meta + build 同文件（~65–130 行）
```

材质可直接复用共享配方库 `procedural/materials/`（plantMaterials / facilityMaterials），不必自建。

**推荐结构 = 四文件**（复杂资产：多级结构生成器、专属 Shader 配方、形态参数面、LOD 派生——以夏栎为第一实例）：

```
src/runtime/procedural/
  assets/asset_tree_3a.asset.ts    // ① asset：入口（meta + build + slot→profile 路由）——必须在 assets/（routes glob 契约）
  tree/tree3a/
    tree3aGeometry.ts              // ② geometry：几何生成器（算法私有）
    tree3aMaterials.ts             // ③ materials：材质/Shader 工厂（配方私有）
    tree3aShapeProfile.ts          // ④ config：形态参数数值面（槽组合 + 全部数值依据）
    tree3aStage.ts                 //   （可选）DEV 出图面：window.__* 句柄，import.meta.env.DEV 守卫，生产零痕迹
```

拆分判据：**文件职责能用一句话说清**（生成几何 / 造材质 / 存数值）。几何生成器超 ~1000 行、材质带成段配方记账时拆；拆了反而要跨文件追上下文时不拆。单文件资产升级为四文件是纯机械迁移 + import 更新（T010.1 夏栎先例：三门槛全绿 + 逐位回归锁全过即证零行为变化）。

### 2.2 目录与命名

- `tree/` = 木本植物域（家族契约 + 资产实现）；草本/地被族（T015）落地时另定目录，不提前建。
- **家族契约**：`tree/<family>/<family><Thing>.ts`（如 `tree/broadleaf/broadleafShapeProfile.ts`）。
- **资产实现**：`tree/<assetShortId>/<assetShortId><Role>.ts`（如 `tree/tree3a/tree3aGeometry.ts`）。
- **命名规范（强约束）**：家族泛化前缀（`broadleaf*`）**专属家族契约层**；资产实现层一律用资产自己的前缀（夏栎 = `tree3a*`）。T010.1 起 `broadleafGeometry` 已更名 `tree3aGeometry` 让出家族名——目的是让后来者从 import 路径与符号名直接分辨「家族公共可复用」与「某资产私有可参考复制」。
- 入口文件名不变式：`assets/asset_<id>.asset.ts`（`import.meta.glob` 收割契约，routes.ts）。

## 3. 家族契约方法论（提炼纪律）

家族契约从**真实消费者**提炼，不从设想提炼（D20.3 / T010.1 约束）：

1. **无投机字段**：契约字段必须有第一实例的真实消费点（broadleafGeometry 全字段消费，grep 可证）。未经真实消费者验证的算法级抽象不进契约。
2. **类型层零运行时**：契约文件只有 interface 与文档——无工厂、无默认值对象、无常量。
3. **语义与数值分离**：家族契约承载字段语义、【阔叶共性候选】/【夏栎特有】标注、消费语义、槽间恒等纪律；**数值依据（Spec 数值域、锚定值、校准记录）永远留在资产 config**——第一实例的 Spec 数值是证据不是家族真理，后续树种以自己的 Reference Spec（D26 Research Gate）为数值依据。
4. **增量修订**：T011 新树种消费契约后发现缺口，通过增量任务修订（如 per-level 字段映射化），**不做预防性泛化**；修订时保持已验收资产逐位零回退。
5. **消费语义必须记档**：字段「实际驱动什么」与直觉不符时（先例：T009.3 发现——crownCenterRatio/crownHeightRatio/crownTopBias 不动几何只进密度场参考系，冠垂直摆放由挂高段+横展角+upturn+领导枝链驱动，弱领导枝翻转树顶决定因素），写入契约字段注释，防止后来者按字段名望文生义调参。
6. **结构计数类纪律**：多形态槽资产的结构计数字段（radial/segs/childPlan/簇位数/每簇叶量/voidCount/scaffoldCount）跨槽恒定——维持皮面数恒等与 rng 消费次数恒等；槽差异全部落在连续形态参数上。契约字段注释逐字段标注计数类/连续。

## 4. 新增一个程序化资产（路径速查）

1. Reference Research 前置（D26：每树种独立参考，结论落 `docs/research/<asset>-reference.md`，不沿用他树）。
2. 选结构：简单 → 单文件 `assets/<name>.asset.ts`；复杂 → 四文件（§2.1）。
3. 家族已有契约（如阔叶）→ 实例化契约字段填自己的数值（数值依据引自自己的 Spec）；家族无契约 → 单资产先行，**不主动建家族层**（等真实第二消费者，D20.3）。
4. LOD 声明、Shadow 通道、视觉验收按姊妹规范（010.3 / 010.4）执行。
5. 回归门槛：`npm test` / `npm run check:layers` / `npm run typecheck` 全绿。

## 5. 先例索引

- **夏栎（asset_tree_3a）= 家族契约第一实例**（T008/T009 验收资产）：`tree/broadleaf/broadleafShapeProfile.ts`（契约）+ `tree/tree3a/` 四文件 + `assets/asset_tree_3a.asset.ts`（入口）。8 槽形态向量、LOD 三档、SDF 叶影、风动全链路已验收，T011 树种以它为可复制「方法」参考（复制代码时改数值与算法细节，契约字段语义不变）。
- **简单资产单文件先例**：`assets/hydrant.asset.ts`（设施，共享 facilityMaterials 配方）、`assets/asset_oak.asset.ts`（旧版植物，T003.4 冻结）。
