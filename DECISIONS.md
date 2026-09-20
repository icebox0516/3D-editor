# DECISIONS

> 关键架构决策记录（append-only，新决策追加文末）。每条含日期、背景、决策与理由；推翻旧决策时保留原文并注明被哪条取代。

---

## 2026-09-16 · 二期内容体系设计共识（grilling 会话逐题裁定）

**背景**：二期启动「Feature / Style / Asset 三层程序化内容体系」。以下 15 条决策经用户逐题确认，5 条默认假设按最合理默认执行（可随时否决后修订）。

### D1 · 设计基准换轨：第一性设计 + 逐子系统裁决

设计论证完全脱离一期实现与规范文件，只认成熟编辑器架构与性能优劣；每个子系统「渐进改造还是局部重写」在设计定型后单独裁定。一期 PLAN 体系（PROTOCOL / STATUS / 61 份任务书）整体归档至 `docs/archive/plan-phase1/`，不作为二期论据。

### D2 · 文档体系：五件套轻量记忆

`AGENTS.md`（短，只放每次都要知道的项目规则）→ `TASKS.md`（任务索引板）→ `tasks/*.md`（单任务：Goal/Requirements/Scope/Acceptance/Constraints）→ `PROGRESS.md`（项目快照）→ `DECISIONS.md`（本文件）。启动加载保持短小，详细内容拆主题文件按需读取（如 `docs/threejs-debugging.md`）。

### D3 · 三层内容模型

**Feature**（区域：这里是什么）+ **Style**（这个区域长什么样的完整配方 = 表面材质 + 资产配比 + 散布规则）+ **Asset**（可放置资产：generator / 几何 / 材质 / 参数 / LOD 位 / 预览）。Style 与 Asset 互相复用：同一 generator 既可被样式配方引用，也可单独放置。

### D4 · 散布配方属于 Style

样式预设 = 表面材质 + 资产配比（assetId × weight）+ 散布参数（密度/聚簇/边缘衰减/尺寸范围）的完整套餐；区域对象只存 `presetId + 参数覆写 + seed`。换样式一步换整副面孔（林地 → 草坪，树自动消失）。理由：核心 UX「换样式不重画区域」要求配方跟随 Style；配方在注册表单份存储，多区域共享不膨胀。

### D5 · 散布产物 = 派生式 + 可烘焙

散布实例是「区域 × 配方 × seed」的确定性渲染派生物，**不是场景对象**：点树选中所属区域、改参数/种子重算受影响分块；场景文件 / 撤销栈 / 大纲保持轻量。另提供「烘焙」操作（T007，后置可选）：把散布转成与手动放置同构的逐棵活对象。

### D6 · 手动放置 = 烘焙式实例变体

放置瞬间 seed 掷骰：缩放/旋转抖动烘进 transform（Gizmo 所见即所编、可手工微调）、色相微差烘进实例色（instanceColor 通路）、seed 存进对象（`asset.seed`）保证可复盘。风摆相位等装饰性效果将来由 shader 从 seed 派生，不占数据。渲染池保持「源无关」。

### D7 · 程序化资产 = 代码自描述注册

`*.asset.ts` 文件同文件导出 `{meta, build}`（身份证 + 生成器），启动自动扫描注册；GLB 照旧磁盘 manifest；注册表统一为 `AssetDescriptor{kind: 'file' | 'procedural'}` 同库混排。理由：程序化资产真相源是 generator 代码，走 JSON 清单会产生影子副本与双源漂移；新增资产 = 加一个文件。

### D8 · "GPU Scatter" = CPU 撒点 + GPU 实例化

种子化 CPU 撒点（纯函数、可单测、只在区域/配方/种子变更时重算）+ GPU InstancedMesh 合批渲染（每帧大头在 GPU）。WebGL2 无 compute；WebGPU / compute 不立项，留作远期渲染后端话题。

### D9 · 实例化架构：分块优先

空间分块（chunk）为剔除 / LOD / 局部重撒 / 拾取反查的基本单元，能力上限按 10 万实例设计。理由：分块是承重墙——逐块视锥剔除、逐块 LOD、跨块编辑只重算受影响块、将来分区加载有现成单元；小规模下代价仅几十个批次，预算内。

### D10 · 双档性能验收

交付门槛 = 园区级：散布 ≤ 2 万实例、核显 1080p 连续渲染 ≥ 30fps；压力线 = 城市级：≤ 10 万实例、独显 ≥ 30fps（证明架构兑现）。新增 draw call 预算另在 T006 细化。

### D11 · LOD 本期完整交付

分块 + 相机距离动态分档 + 粗/中/细模切换（generator 提供 levels）整体进本期（T006，排在散布跑通之后）。风险已知：块生命周期（跨块编辑/重建/复用）靠块级单测锁定；10 万级需块尺寸自适应与远处合并策略防「块×资产」批次数爆炸。

### D12 · 动画：轻通路 + 全套表现

渲染循环维护全局时钟 + uTime 广播服务（材质声明 uTime 即自动驱动）；本期交付水面流动 + 植被风摆（顶点着色器按 seed/实例相位摆动，散布与手放置实例统一生效）。不做 JS 逐实例 tick（重契约，本期用不上）。**（2026-09-17 切分修订：uTime 服务拉前至 T008.1 落地——首个真实消费者 = 树叶风动，见 D19.7；T005.1 瘦身为只剩水面）**

### D13 · "0 外部资产"边界

新功能不引用外部**模型**文件——程序化内容纯代码/着色器实现；着色器需要贴图时**可用**；现有 GLB 资产库模式**并存**，库里既有 GLB 也有写死的程序化资产，均可放置。

### D14 · 样式选择 = 可视化画廊

缩略图卡片网格、按要素类型过滤、悬停实时预览（预览态可丢弃）、点击应用（经命令、可撤销）；缩略图由离屏快照批量生成 + 缓存。理由：选视觉的东西靠看（油漆色卡，不是 SKU 号）；UE/SketchUp 通行形态。

### D15 · v1 内容清单

**绿地全家桶**（普通草地 / 修剪草坪 / 花卉绿地 / 灌木绿地 / 自然林地，后三者为散布型——全链路验金石）+ 所需程序化植物资产（橡树/松树/灌木/花卉等 4–5 种）；**设施资产包**（路灯/长椅/垃圾桶/消防栓/标识牌——验证单独放置链路）。道路表面包、车辆包不进 v1。

### 默认假设（未单独提问，按最合理默认执行，可否决）

1. 样式画廊入口复用现有资产浏览器区域（双 Tab：资产 / 样式），不新开独立面板；
2. 「林地」作为绿地的样式预设，不新增要素类型；
3. 一期 1989 测试基线与三重门槛（`npm test` / `check:layers` / `typecheck` 全绿）继续作为完成定义，写入 AGENTS.md；
4. 渲染实现派发 `threejs-expert` 子代理，主代理负责简报、diff 审查与视觉验收；
5. 「水面系统」不单独立项，流动水面并入 T005 动画任务交付。

---

## 2026-09-16 · D16 任务粒度 = 会话粒度（grilling 会话裁定）

**背景**：T002–T007 单任务周期过长，一个会话跑不完。用户裁定拆分。

- **两级编号**：T002–T007 保留为 epic（大任务），拆为 21 个会话粒度子任务（`0XX.N` 两级编号，`tasks/` 平铺，一文件一会话）。经验锚点：一期单会话容量 ≈ +15~83 测试。
- **验收分级**：子任务完成底线 = 三重门槛全绿（`npm test` 实测约 7s，全量回归不构成负担）+ 子任务自带 Acceptance（单测级）；**视觉验收在每个 epic 末尾的独立「验收门」子任务执行**（用户原话"每个大任务完成再验收"）。
- **进度记录**：子任务文件头部状态字段（not-started / in-progress / done）+ 会话结束必写「完成记录」（交付物、测试增量、门槛结果、遗留）；epic 文件维护子任务勾选表；TASKS.md epic 行带 (n/m)；PROGRESS.md 同步快照。
- **拆分结构**：T002×5（契约/混排缩略图/放置变体/设施包/验收门）、T003×6（撒点函数/分块管线/配方序列化/植物资产/绿地样式/验收门）、T004×3（缩略图/画廊预览/验收门）、T005×3（uTime+水面/风摆/验收门）、T006×4（levels/分桶换档/批次控制/验收门）；T007 烘焙后置可选不拆。
- 依赖见 TASKS.md 末尾速查；内容类子任务（002.4 / 003.4）仅依赖契约层，可提前穿插。

---

## 2026-09-16 · D17 程序化资产注册与生成契约（T002.1 grill 拷问门裁定）

**背景**：契约是二期地基（002.3 变体 / 003.4 植物 generator / 005.2 风摆 / 006.1 levels 全吃这份契约），开工前 6 项议题经点选式 grilling 逐项裁定。

1. **扫描机制 = Vite `import.meta.glob` eager**：扫 `src/runtime/procedural/assets/**/*.asset.ts`，模块副作用注册 + `collectProceduralAssetMetas()` 收割口复刻 styles/routes.ts 模式；中央注册文件（违背零注册承诺）与代码生成 manifest（D7 已否决影子副本）落选。
2. **`build` = 无参同步 `build(): {geometry, material}`，缓存键 `assetId`**：近期消费者（放置变体 D6 烘 transform/instanceColor、风摆 D12 shader uTime）都不需要参数；LOD（T006）届时扩展签名；异步包装是 provider 层（002.3）的事。**（2026-09-17 修订：D19.2 将 build 扩为可选参数 `{seed?, preset?}` 支持结构级形态变体，无参调用语义不变，缓存键升级 sourceKey——见 D19）**
3. **jitter 语义 = 最大偏离半宽**（值 = 围绕标称值的最大偏离，均匀分布半宽）：`scaleJitter: 0.15` → ×U[0.85, 1.15]（相对）；`rotationJitter: 15` → 绕 Y ±15°（度）；`hueJitter: 8` → 色相 ±8°（度）。一个心智模型，仅 scale 特殊为相对量。
4. **dispose = build 缓存渲染器会话私有 + meta 注册表模块级**：缓存随 `Renderer.dispose` 链与 assetLoader 相邻释放，绝不模块级单例（StrictMode 双挂载 A→dispose(A)→B 互不伤害）；不碰 `forceContextLoss`（一期冻结 bug 教训）。
5. **meta/目录**：目录 `src/runtime/procedural/assets/`、分类不靠目录推导（meta 显式 `category`，值域对齐 manifest 英文小写）；字段 `id/name/category/tags/defaultScale/defaultRotation/variants?(三 jitter 可选默认 0)`；注册表统一可辨识联合 `AssetDescriptor{kind:'file'|'procedural'}`；不设 `file`/`thumbnail` 字段。
6. **撒点算法（003.1 顺风车）= 抖动网格为 v1 唯一采样器**：密度直控 + chunk 对齐 + 聚簇/边缘衰减叠加实现；泊松盘留 sampler 抽象位作后续可选增强。已回写 003.1 任务书。

---

## 2026-09-16 · D18 Style 配方结构与序列化（T003.3 grill 拷问门裁定）

**背景**：配方结构是 T003 中枢分叉（003.5 五种绿地样式、T004 画廊、序列化往返全压在上面）。四项议题出点选面板后未获应答，按预标注推荐默认执行（沿 D15「默认假设」惯例，**可否决后修订**）；下游衍生决策按最合理默认一并裁定。

1. **配方结构 = 同构单结构、两段可选**：`StylePresetMeta` 扩可选 `scatter` 配方块（纯数据：assets 配比 + densityPerM2 + clustering/clusterRadiusM/edgeFalloffM/scaleRange）；表面段沿用现有 `defaultParams + build` 双轨不动。修剪草坪 = 仅 surface；自然林地 = surface(草地) + scatter(树配比)；纯散布 = 仅 scatter（v1 所有散布型样式均带表面段——纯散布透底留待真需要时再接引擎缺构建分支，现状缺 build 降级 default_solid）。
2. **配比 = 相对权重归一化**：概率 = wᵢ/Σw，任意正数书写等价（4/2/3/1 ≡ 40/20/30/10）；≤0/非有限条目剔除；全无效 → 空散布（003.1 已内建此语义，零改动）；Inspector 显示折算百分比。
3. **序列化 = 默认值省略、版本保持 2.0**：`RegionStyle.seed` 可选字段（深字段整体透传天然放行，旧场景无 seed 宽容回退）；未来 preset 参数增删靠「未声明 overrides 键忽略」消化；不建版本迁移设施（为尚未发生的破坏性变更不预付成本）。
4. **overrides 白名单 = 全参减簇半径**：可覆写 `scatter.densityPerM2 / scatter.clustering / scatter.edgeFalloffM / scatter.scaleRange / scatter.assets`（配比为**整表替换**语义，不做逐 assetId 增量合并）；`clusterRadiusM` 与 `sampler` 不开放（配方内部参）；散布覆写键一律 `scatter.` 前缀（防与表面参数裸键撞名；表面键保持裸名，存量场景兼容）；`seed` 不进 overrides（独立位）。白名单后续扩展天然向后兼容。
5. **seed 语义 = region 私有、换 preset 保留、缺省派生**：`style.seed?: number` 缺省时消费端派生 `hash(objectId)`（确定性，旧场景/未重掷区域不闪变）；换 preset 不动 seed（undo/redo 换回原样式散布逐位复原，D5 确定性的根基）；Inspector「重掷」按钮经命令显式写入新 seed（可撤销，随机源同 T002.3 rollVariantSeed 定义域）。
6. **散布实例变体合成 = 全由撒点侧决定**：scale/rotationY 来自配方 scaleRange 与撒点随机流、hue 微差走 instanceColor（003.2 现状）；资产级 variants（T002.3 三 jitter）仅手放置通路，散布不叠加（避免双重抖动）。
7. **拾取反查 = 散布实例纳入拾取、映射回所属区域**（D5「点树选区域」落地）：raycast 命中散布 InstancedMesh → instanceId → 块 → 源(regionId) → 走既有区域选中链路；散布实例仍不进对象表/撤销栈/大纲。
8. **003.3 配比覆写只做数据层**：Inspector 散布参数组 = 密度/聚簇/边缘衰减/尺寸范围/seed 重掷；配比表编辑 UI 留 003.5/T004 按需。

---

## 2026-09-17 · D19 程序化形态变体契约与 3A 树木路线（T008 开工 grill 拷问门裁定）

**背景**：用户裁定全部程序化资产（植物 4 种 + 设施 5 种）观感 = v1 功能基线不达标；003.4 原「风格化低模 / 半写实 alpha 卡片」返工分叉**作废**，改为 **3A 级单棵程序化树开路**（T008 程序化树木 epic）。T003 剩余流程（003.3 验收续走 / 003.5 / 003.6 / 设施返工）**全部冻结挂起**，41 项未提交变更原状挂账。本次 grilling 逐题裁定（方向 → 交付边界 → 资产身份 → 契约修订 → 形态族语义 → 验收闭环 → uTime → Inspector → 任务拆分 + 六处修正）。**本条修订 D17 第 2 项与 D12 任务切分。**

1. **方向与范围**：3A 级单树全链路（入库+缩略图 / 点击放置 Ghost 即所见形态 / 撤销重做 / 存档往返逐位一致 / Inspector seed 重掷）；森林、大规模散布、复杂 LOD 明确出第一阶段。阔叶树（橡树系）新增独立资产 `asset_tree_3a`，v1 四植物与设施资产不动。epic 收窄命名「程序化树木」不叫「植被」——树协议稳定后灌木/草地复用同一协议再扩编。
2. **D17.2 修订——build 参数化 + 变体两级拆分**：`build(params?: { seed?: number; preset?: string })` 统一可选参签名，旧资产 `build()` 天然兼容零改动。变体正式两级：**结构级变体**（分枝结构/树冠形态等几何差异）允许进 build、按 sourceKey 缓存共享；**实例级变体**（缩放/旋转/色相/风相位）不建新几何，走 instanceMatrix / instanceColor / aSeed。`preset` 仅协议扩展位，T008 v1 不启用——asset_tree_3a 固定单一树种与单一材质基调，不进 Inspector（防子代理顺手做「春季/秋季/幼树」）。
3. **三流域 seed 派生域分离**：对象只存单 seed S（沿用 T002.3 `asset.seed`，schema 零改动）。①`shapeSlot = hash32(S ∥ 'shape') mod N`——只负责路由选槽，绝不喂随机流复用；②`morphRng = mulberry32(hash32(assetId ∥ shapeSlot ∥ 'morph'))`——只负责该槽形态几何，形态算法演化只动这条流；③`instanceRng = mulberry32(hash32(S ∥ 'instance'))`——只负责对象表现（缩放/旋转Y/色相/风相位）。**稳定性承诺口径**：实例级参数对形态生成算法演化保持稳定；形态结果的稳定性由 shapeSlot + morphRng 与版本化生成算法共同保证——v1 只承诺**当前版本内确定性**，不承诺跨算法版本视觉逐位一致。
4. **sourceKey 与缓存/池分桶**：`sourceKey = assetId[:preset]:slot-N`；一个 sourceKey = 一份合并 Geometry Source（缓存键，有限形态族 ⇒ 天然有界）。缓存**不淘汰**（无 LRU/引用计数——Ghost 借缓存 Source 不 dispose 的既有契约原样保留）。InstancedAssetPool 按 sourceKey 分桶，一个桶 = 一个整树 InstancedMesh × 2 材质组（树皮/叶）。
5. **meta 增量**：只加 `shapeFamily?: { size: number }`——类型不写死常量（8 是 asset_tree_3a 的资产配置，非协议常量；T008 任务约束 `asset_tree_3a.shapeFamily.size = 8`）；不建 enabled/performance 推测字段。
6. **树几何 = 单一合并几何 + 烘焙属性**：叶实例化只存在于 build 阶段（CPU 拓扑 → 枝干几何 → 叶簇布点 → 叶卡片烘进合并几何，2 材质组）；场景实例化发生在整树桶级。`aLeafRand` / `aBend` 属 **Source/Geometry 固有数据**，只由该槽 build 结果决定、**不读取对象 seed**（防实例 seed 混入导致同槽几何不可共享）；对象级差异只经 aSeed / instanceColor / instanceMatrix 注入。
7. **uTime 拉前（D12 切分修订）**：T008.1 落 D12 最小版全局 uTime 服务——渲染循环单一时间源、材质声明 uTime 即自动驱动、不为树做局部时钟。分工语义：uTime 管「全局风刮到哪一帧」，aSeed 管「每棵树怎么各吹各的」。T005.1 瘦身为只剩水面。
8. **交互边界**：Inspector 最小面——seed 只读 + 「重掷」按钮（走 Command 可撤销）。**复制 = 保留原 assetId + seed**（完全相同形态与实例参数，仅 transform 可独立编辑，不自动换 seed）；**重掷 = 新 seed**（同时重算 shapeSlot + instanceRng）。结构参数留代码侧不产品化；面数/叶卡数量为初始目标预算**非验收门槛**（最终以锚点阶段固定机位观感与性能实测共同裁定）。
9. **观感定调门**：008.3 任务尾锚点定调为**唯一人工阻断门**——主代理先行确定参考基调（外部视觉基准，不进产品资源与代码契约）；首棵只验 slot-0 一个形态；近/中/远三距离固定机位分别检查 枝干分枝真实度 / 树冠体积与空隙 / 整体轮廓自然度；1–2 轮微调上限；取证固定机位 + 固定曝光/环境光 + 固定相机距离（防渲染条件变化误导迭代）。门未过 008.4/008.5 不得启动。
10. **任务结构**：008.1 纯基建（不生任何树几何）→ 008.2 slot-0 锚点几何（可复现基准，aLeafRand/aBend 几何数据契约在此冻结）→ 008.3 材质/风动 →【视觉锚点定稿·人工门】→ 008.4 放置全链路集成 → 008.5 扩 8 槽 + 验收门（含**同 sourceKey 多实例一致性验证**：≥6 棵同槽树共享 Geometry/Material、仅实例参数不同、单桶 1 InstancedMesh × 2 draw calls；「零错误」拆为 运行时无异常 / 资源无重复 build / Ghost 不触发 dispose / 放置删除 Undo Redo 无泄漏 / 同 sourceKey 不重复创建资源）。

**锁定规则链**：一个 seed → shapeSlot 只选形态 → morphRng 只管该槽几何 → instanceRng 只管对象表现 → sourceKey = assetId + preset + shapeSlot → 一个 sourceKey = 一份合并 Geometry Source → 一个桶 = 一个整树 InstancedMesh × 2 groups。此链支撑后续 树 → 灌木 → 草地 扩展，无需重设资产基础协议。

---

## 2026-09-18 · D20 植物资产路线立项（T008 增补 + T009/T010 立项 grill，三轮拷问 + 两轮修正）

**背景**：用户提出《植物资产延伸》总需求（夏栎优化 → 植物资产库 → 植物资产平台），经 grill 三轮（含资产管理器构想重构一轮）+ 两轮修正落定任务树：**（008.4 ∥ 008.6）→ T009 → 008.5**（008.6 参考研究不依赖放置链路，锚点门后与 008.4 并行、T009 等二者；008.5 修订为收官验证门、后置于 T009，形态设计职责移 009.3——避免 8 槽质量对齐做两遍）→ T010 → T011+ 族建设。

1. **8 Slot = 8 组完整形态向量**（shapeProfile 预设组合，crownCenter/crownHeight/crownWidth/mainBranchSpread/asymmetry/canopyDensity/crownTopBias 等多维度整体取值），方向名（标准/挺拔/展开/偏冠/低冠/高冠/疏松/丰满）仅为标签；禁止仅缩放/旋转/轻微随机的伪差异。
2. **夏栎结构参数面为资产私有**，不扩展 ProceduralBuild 公共参数；build 仅做 slot → 结构配置路由。
3. **公共能力从真实第二消费者提炼、不预抽象**：叶簇生成保持夏栎私有命名与实现（家族契约提炼归 T010.1）；四文件（asset/geometry/materials/config）为推荐结构非契约（最小 = asset.ts 单文件）；不建完整 BroadleafTreeGenerator 框架，只提炼 Family Contract。
4. **Shadow = 程序化资产公共契约能力**：核心链 ProceduralSourceCache → InstanceSource → InstancedAssetPool → 正式场景；正式放置对象必须支持 Shadow，Ghost 不要求投影仅要求不破坏契约（两者分开验收），ScatterChunkManager 仅契约兼容验证（T003 冻结口径 = 契约级小触碰）；散布侧 aSeed 同相位修复留 T003 解冻后独立任务。
5. **LOD = 统一 Asset Runtime 能力**（非「植物 LOD」），家族预算制；LOD Source 在 Runtime 增独立 level 维度，**不得改变 D19 sourceKey 形态身份语义**；夏栎预算候选 High 30–40K / Mid 6–10K / Low 1.5–3K 三角形，结合最终结构/性能/观感实测锁定（预算非验收门槛，延续 D19.8）。
6. **植物语义不进公共 AssetDescriptor**：分类（大类 enum + 可选 family）进公共层；heightRange/crownWidthRange 等放 proceduralProfile / family 层（见 D22）。
7. **性能验收 = RTX 2080 Ti 开发档**（1920×1080 / DPR=1 / Chromium / WebGL2 / 固定场景相机灯光 / Shadow 开启）：1/20/100 棵 ≥60 FPS、500 ≥45 FPS、1000 ≥30 FPS；资源契约五条（同 sourceKey 不重复创建、保持 InstancedMesh 路径、不退化逐对象 Mesh、删除无残留、连续 10 次放置删除无持续增长）；本机基准不作全平台承诺。
8. **夏栎视觉参考基准回溯补建**（T008.6）；所有未来植物 Reference Research 前置（每树种独立参考，不沿用他树，「像一棵树」不作真实性验收标准）。

本条兼作 T009 / T010 立项拷问门记录（T010 启动时若 T009 实际形态与预期偏差大可补轻量门）。

---

## 2026-09-18 · D21 双通路原则：固定资产放置 vs 边界驱动生成

**背景**：用户明确终局构想——资产管理器是整个编辑器的通用资产入口（大类 → 小类/族 → 具体资产，GLB 本地模型与程序化资产只是两种资产来源，点击放置固定形态）；「按用户绘制边界生成对象」是另一套独立的 Feature Generator 体系（绘制闭合区域 + 样式预设 → 按边界生成）。裁定：

- **样式 / Shader / Material 等底层表现能力可以共享**（同一湖水配方可用于固定资产与边界生成）；
- **固定资产放置与 Boundary 驱动生成属于两条独立业务通路**，不合并、不互相替代；
- 自然分类下的固定资产（如固定尺寸湖泊）与未来多边形湖面生成均不进植物任务树；后续 T016（资产管理器重构，前置 T010）与 T017（多边形区域生成重构 · Feature Generator，前置 T016）分别立项、分别过各自需求拷问门。

---

## 2026-09-18 · D22 资产分类契约方向：大类 + family + asset 三级可寻址

程序化资产元数据按「大类 enum + 可选 family + 具体 asset」三级可寻址结构扩展（T010.2 落地）：

- **大类** = 浏览语义枚举（植物 / 建筑 / 车辆 / 自然 / 人 / 公共设施 / 设备 …），不承载渲染/放置行为分支；
- **family** = 族层级（broadleaf / conifer / shrub …），支撑植物库三级树（Trees → Broadleaf → 夏栎）与非植物族扩展；
- 支撑 T016 资产管理器「大类 → 小类/族 → 具体资产」浏览直接消费，一次定契约避免资产二次迁移；
- 尺寸类植物语义（heightRange / crownWidthRange）放 proceduralProfile / family 层，禁止植物术语进公共协议（D20.6）。

---

## 2026-09-18 · D23 LOD 职责澄清与契约注释纪律（修正 D17/D11 历史表述，append-only 不回改）

**背景**：D17 曾表述「LOD 到 T006 再扩展 build 签名」、D11 曾表述「LOD 本期完整交付（T006）」；植物资产路线立项（D20）后 LOD 职责重划，为免后续读取冲突追加本条澄清——历史决策原文保留，本条为后续执行依据。

1. **LOD 职责切分**：T009.6 负责首次真实资产的 level 内容落地与 Runtime level 维度验证（夏栎 High/Mid/Low 从占位变实装）；T006 负责距离切换、Chunk 分块、Batch 消费。**LOD 内容属资产/Runtime，切换属 T006。**
2. **level 契约**：level 为 Procedural Build 可选 Runtime 参数（`build({ seed?, preset?, level? })`），**不参与 shapeSlot / morphSeed / sourceKey 形态身份计算**；sourceKey 只表达形态身份（assetId + preset + shapeSlot），Runtime Cache 以「sourceKey + level」为档位缓存维度——双维缓存语义：形态身份由 sourceKey 定义、具体几何 Source 由 sourceKey + level 决定；`sourceKeyOf()` 本身不改，level 不掺入形态身份（与 D19 不冲突）。
3. **triangleCount 语义**：实际内容统计值/预算记录字段，具体预算由资产族与 LOD 验收锁定；旧「单株 ≤2000」为 003.4 旧小植物时期口径，仅存历史任务记录，**不构成公共硬契约**。
4. **公共分类边界维持现状**：`category: string` 暂不动，T010.2 一次性完成「大类 enum + 可选 family」公共分类契约；**不提前引入 PlantAssetDescriptor / TreeAssetDescriptor 联合类型**（防植物专属平台提前成形，与 D20.3 一致）。
5. **职责边界不重划**：Router（file/procedural 分派）/ Cache（程序化 Source 生命周期）/ Pool（实例化与桶）/ Scatter（区域派生实例）现行边界与「Asset / Feature 两通路分离」（D21）一致，不重构——只补 Shadow/LOD 契约（T009.5/T009.6）；T009.5 对 Scatter 仅契约兼容的限制继续保持。
6. **核心 Runtime 注释纪律**：InstancedAssetPool 等核心 Runtime 文件类头只保留**稳定契约**（aSeed 必须 geometry 绑定、池不 dispose Source、Ghost 不走本池等）；实现事实（材质未声明 aSeed 时的行为、诊断 split 具体细节、单实例 hue 出现时机等）落任务完成记录，不继续向类头堆积——防止核心 Runtime 文件演变为第二份任务板。
7. **AGENTS 人工门例外（D16 补充）**：常规视觉验收在 epic 末验收门执行；任务明确标注人工锚点/形态筛选门时（如 008.3 锚点门、009.3 逐槽裁定），可在子任务阶段进行用户裁定，结果作为后续验收基线。

---

## 2026-09-18 · D24 文档五件套职责收敛：状态与依赖的单一真相源

**背景**：五件套运行后复查，同一事实出现三份维护（TASKS.md 跨 epic 依赖速查、任务书前置 + epic 勾选表、PROGRESS.md 历史流水），修改依赖要动三处、漂移风险高。按社区成熟实践收敛：稳定规则进 AGENTS、任务状态真相进任务/计划文件、其余文件只做索引或摘要。

1. **tasks/*.md 是任务执行唯一真相源**：状态字段、前置依赖、完成记录只写在这里；epic 文件维护本 epic 子任务勾选表与内部依赖（既有约定不变）。修改依赖 = 改任务书「前置」（epic 内依赖同步 epic 文件），不动 TASKS.md。
2. **TASKS.md 只做任务地图**：Current / Next / Done + 任务状态 + 文件链接；不维护跨 epic 依赖速查（原速查段已删，依赖看各任务书与 epic 文件）。
3. **PROGRESS.md 只做极短快照**：当前 Epic / 当前子任务 / 最近完成 / 下一步 / 已知阻塞 / 测试基线；任务完成时的「PROGRESS 同步」= 更新快照字段，不追加历史流水（历史在完成记录、原因在 DECISIONS）。
4. **AGENTS.md 维持短而稳定**：只放永久规则/边界/命令/完成定义，不吸收任务级细节与实现细节。
5. **同一知识多处出现的前提是职责不同**：DECISIONS 解释为什么、任务书解释这次怎么做、源码注释只述稳定契约；完整实现细节禁止复制进 AGENTS / TASKS / PROGRESS。
6. **TASKS.md 的状态标识 = 导航摘要，非事实源（细化第 1/2 条）**：保留 [x]/[~]/[ ]、(n/m) 进度与一行级状态摘要（done 日期、冻结、待门裁定等），因对人重进项目有用；详细状态、完成记录、阻塞细节以任务文件为准，冲突时以任务文件为准——「同步 TASKS」= 更新摘要行，不复制细节。
7. **占位任务（尚无任务书）的依赖以立项决策记录为准**（如 D20 任务树、D21 的 T016/T017 前置），不在 TASKS.md 维护前置；立项建任务书时写入「前置」字段后即由任务书接管。

---

## 2026-09-18 · D25 多 Agent 按 Step 动态派发

D15「渲染实现派发 threejs-expert」默认假设 4 失效。后续由主代理先将 Task 拆为独立 Step，每个独立 Step 默认启动全新子代理实例；生产渲染代码必须由具备对应专业能力的子代理交付，分别由 threejs-runtime-agent、procedural-asset-agent、park-shader-agent 覆盖 Runtime、Procedural、Shader 三类专业域；研究、通用实现、独立验证使用通用子代理。D15 保留为历史记录，不再作为当前派发依据。具体调度规则见 AGENTS.md「three.js 任务与调试」。

---

## 2026-09-18 · D26 资产调研机制：Research Gate + Reference Spec（grilling 逐题裁定）

**背景**：D25 派遣体系有「搭建者」无「调研者」——T008 夏栎的外观知识实际来自主代理一句话定调 + 不入 git 的外链图 + 锚点门用户裁定 + 代码常量，依据链不可复现（7–9m 尺寸带只存在于派发简报口头转述）；三个专业 agent 的「真实参考驱动」是消费义务而非生产职责；T009.1 已显式等待 008.6 参考分析。经 grilling 逐题裁定建立**通用机制**（适用万物：植物/设施/水体…）。

1. **零新增角色与子任务**：不设第 4 个 agent、调研永不立子任务。机制 = `asset-research` 技能 + 通用子代理调研 Step（D25「研究→通用子代理」路由不变）+ 双层规则：AGENTS.md Research Gate 强制点（主代理侧）；procedural-asset-agent / park-shader-agent 定义前置条件（**凡实现依赖现实对象定义的生产 Step，缺有效 Reference Spec 有权打回**；纯技术测试、抽象效果、已有 Spec 的派生任务除外）。
2. **Research Gate**：所有新程序化资产开工前必过 Gate 并在任务书留痕。可豁免四情形——已有 spec 的派生变体 / 用户已提供充分参考 / 占位测试资产 / 低不确定性低风险**且核心现实特征已有可靠依据**；豁免必留 `Status: waived + Reason + Evidence`，不许凭「常识够用」跳过。不得豁免六情形——高真实要求 / 类型显著影响形态 / 需基于现实规律生成自然变体 / 缺可靠结构比例材质依据 / 资产将成同类生产基准 / spec 关键事实含 Unknown。**豁免的是调研动作而非 Spec 落盘**：用户提供的参考须转写薄 spec（来源记「用户提供」），唯占位/测试资产可零留痕。GLB 导入不触发。
3. **Reference Spec = 资产现实事实唯一来源**：落盘 `docs/research/<asset>-reference.md`，通用骨架八节（身份 / 主要尺度〔不强制高宽深，按对象选关键尺度〕/ 轮廓与比例 / 结构层级 / 材质与表面 / 变体范围〔含联动关系〕/ 远近景保留优先级〔写到视觉显著性为止，工程映射归任务书〕/ 来源证据）+ 域扩展节。域 Schema（植物/水体/设施…）放 `.zcode/skills/asset-research/references/`：结构化、禁自由文本、独立演进**不被当前实现反向绑死**；新域首次调研起草草案、主代理审阅合入。
4. **来源与两轴标注**：来源不限图片（论文/官方资料/产品页/技术手册/百科/图库），数量按复杂度定、不硬编码配额，核心结论必须可追溯（来源 + 检索日期 + 提取内容）。表达形式阶梯：可验证数值 > 结构关系 > 相对范围 > 可观察特征 > 泛化形容词（允许「纵向沟槽明显」式可观察描述，**禁止伪精确**编造 roughness=0.78 类无来源数值）；关键事实标 **Evidence Status：Verified / Inferred / Unknown**——事实状态与表达形式两轴正交（Range 是形式不是置信度）。
5. **spec 与任务书分工**：任务书不得重新定义现实参数，只提取本 Step 必需关键参数作**执行快照**——标明来源、带 **Spec Version 版本锚点**（spec 顶部必填 Version，修订递增，任务书引用时注明所锚版本）、不得独立演化；工程预算、LOD 面数、性能阈值等项目约束由任务书单独维护，不写入 spec。
6. **验收**：调研交付时主代理做廉价抽查（硬数值独立核对），不设独立用户门；渲染侧验收仍走锚点门（D23.7）。**008.6 保留为机制首跑试点**（技能首跑 + 夏栎回溯补档 + 植物域 Schema 起草，产出改落 `docs/research/tree3a-reference.md`），不因此恢复「调研立子任务」惯例。

### D26 修订 · Unknown Gate 收窄与执行细则精修（2026-09-18 同日，用户复核裁定）

D26.2 六情形末条「spec 关键事实含 Unknown」收窄为：**关键事实存在 Unknown，且该未知影响当前生产目标的结构、形态、材质或变体实现决策时，不得豁免；边缘性 Unknown 在 Spec 中记录但不阻塞**。同日配套精修（生效文件为准）：Gate 前置于依赖现实对象定义的开发 Step、开发 Agent 开工前校验任务书引用的 Spec Version 与当前 Spec 一致（AGENTS.md）；来源按事实类型选择——结构/尺度/专业事实→论文/官方/技术文献，型号/规格→官方产品资料，形态/材质/变体→真实照片（直接视觉证据）/现场资料/专业数据库，3D/CG 案例仅作实现参考不作现实事实依据（T008 的 TurboSquid 渲染图据此降级，008.6 首跑换真实照片）；Evidence Status 正面定义 + 事实表达形式枚举 Value/Range/Relative/Qualitative、spec 模板增「用户提供」来源类型与关键事实统一块状写法（asset-research 技能）；008.6 明示「不作为后续资产任务的标准子任务结构」。

---

## 2026-09-19 · D27 通用 Asset Runtime LOD 架构（grilling 两轮 + 对抗审核，Q1–Q10 逐题裁定）

**背景**：用户提供《LOD方案参考.md》主张建「通用 Asset Runtime Representation System」（LOD 非植物专属、屏幕空间选档、RenderBucket、Proxy/Impostor、Shader LOD、Shadow LOD、拾取跨档一致）。经 grilling 两轮 + 独立审核子代理对抗审查逐题裁定，修正 T006/D11 旧口径（植物专属 ≤300/800/2000 tri + 统一距离阈值），与 D20.5/D23 连续。参考文档归档 `docs/lod-reference.md`（输入材料，不再更新；LOD 规范真相源 = T010.3 产出）。已裁定与候选待实测分栏，防候选值被误读为锁定值。

**已裁定**：

1. **职责切分（延续 D23.1）**：资产声明 Representation（档位内容），Runtime 调度（选档/切换/分桶/裁剪/批量）。夏栎三档 = T009.6；Runtime 调度 = T006；规范固化 = T010.3。禁止 TreeLOD / VegetationLOD 类资产域专属 LOD 系统。
2. **选档度量 = 归一化视距 d/资产包围球半径**（等价资产对相机张角/屏幕占比，与分辨率、DPR、视口尺寸解耦）；像素口径仅用于验收报表与调试显示；禁止全资产统一距离阈值。阈值数值候选待 T006 实测锁定。
3. **Representation 语义集六档**（High/Mid/Low/Proxy/Impostor/Culled）规范面全集收录、支持不完整 LOD 链；本期实装只到 High/Mid/Low + Culled，Proxy/Impostor 接口预留不实装。**范围门**：十万实例压力下 triangles / draw calls / frame time p95 任一超预算 → Impostor 升级必做（判定绑定观测指标）。GLB Proxy 语义收录但显式标注「未经验证」。
4. **桶键一律含 level**：散布 = chunk × source × level，放置 = source × level；换档复用既有机制——散布 = 确定性重撒重建、放置 = 实例跨桶迁移（池已有跨池迁移）；不引入「桶键不含 level、桶内换 Source」新机制。geometry + material 随 sourceKey + level 的 InstanceSource 整体成套（Shader LOD 天然成立）。
5. **选档评估器 = 公共纯函数**：纯数据输入（相机位姿 / fovY / 正交标志 + 包围球与代表距离），落 `src/domain` 零 THREE（与 shapeSlotOf 纯函数先例同构，node 可测）；正交退化口径（正交时按几何尺寸/正交视高判）；两链共享同一选档语义不复制逻辑。
6. **档位为每帧派生态**：相机状态的纯函数，不进 Scene、不进 Command、不缓存进持久状态；帧内时序 = 块剔除之后、render 之前。
7. **level 枚举本期定死三值 `'high' | 'mid' | 'low'`**：009.6 将代码占位 `'medium'` 改为 `'mid'`（含 types.ts 注释同步；当前零消费者，改名零成本）；proxy/impostor 只留规范语义位不进类型（防幽灵字段），实装时再扩；culled 是调度结果非资产声明档位，不进枚举。
8. **两链验证分工**：散布链验证 chunk×level 桶机制（当前散布不带 seed 全路由 slot-0，单 source 限制接受——多 source × level 交叉桶验证归放置链）；散布 seed 路由修复维持 D20.4 留 T003 解冻后独立任务。
9. **性能验收观测七项**：FPS / frame time（p95/p99 长尾口径——均值会平均掉换档尖刺）/ draw calls / triangles / visible instances / LOD 分布双口径（各档实例数 + 各档桶数）/ 各 Representation 桶数；GPU 耗时可选不承诺（Chromium 默认禁用 disjoint timer query）；renderLoopStats 保持零 THREE 零 DOM 边界。
10. **换档跳变验收口径**：机器 diff（连续相机移动截图序列，帧间无闪烁/无整屏突变）+ 换档点前后帧人工复核（D23.7 例外）；判「无 pop/无闪烁」，不判「两档图像一致」（轮廓差客观存在）。
11. **T006 排期 = T010 之后、T011 族建设之前**（族建设放量前 Runtime 必须就绪）；006.1 前置 T003.4（冻结、已被 D19/D20 路线取代）废止，新前置 = T009.6 + T010.3；验收场景走独立压力测试资产（epic 原有口径），不依赖 T003 解冻。原 006.1（植物三档实装，职责已被 T009.6 承担）重构拆分为「006.1 公共语义层」+「006.2 非植物第二资产验证」，后续子任务顺延重编号（006.3 分桶换档 / 006.4 批次控制 / 006.5 验收门）。
12. **Profile 首版最小化**：沿用 `levels: [{id}]` 声明形态，不引入 screenSize / maxDistance / triangleBudget / castShadow / pickable 等无实际消费者的字段；调度阈值归 Runtime 全局策略常量，不进资产 Profile。
13. **009.7 基线不回溯**（其在 T009 语境有效）；T006 验收加同场景 LOD 开/关对照组留档。
14. **默认（可否决）**：缩略图 / Ghost / Preview 固定取 High 档；T007 烘焙「取当前档几何」语义保留原句、细化留 T007 立项拷问门；LOD 分布 DEV 可视化并入 006.5 取证。

**候选待实测（不作锁定值）**：张角/归一化视距分档阈值数值；chunk 代表距离取块最近点、代表 scale 取块内 max 的保守策略实际效果；各家族各档面数预算（010.3 家族预算表规范给出区间与锁定流程）。

---

## 2026-09-20 · D28 LOD 选档基准稳定化方向与 GLB LOD 消费硬约束（grilling 五题裁定）

**背景**：用户检查 LOD 系统提出两项疑点（选档基准稳定性 / GLB 未来接入路径）。经只读事实探查（两链选档输入、三档 bounds 实测差异、GLB 链路、规范记档现状）+ grilling 五题逐题裁决（Q1 无观察病症定性卫生债 / Q2 GLB 已共享 Runtime / Q3 稳定基准 = High 档派生 / Q4 T011 后修 + 测试先行 / Q5 GLB 原则升格硬约束）。

1. **现状定性（卫生债，非缺陷）**：两链选档度量 `m = d/(r·scale)` 的 `r` 均取**当前档位**几何 boundingSphere（放置链 `InstancedAssetPool.frameLod` 随桶迁档换源；散布链 `ScatterChunkManager.frame` 按当前档位键取缓存半径）；三档几何 bounds 实际不等（档间轮廓连续性容差 ≤0.4m，折算半径差 ~2-5%）——「迁档→半径换源→读数平移」反馈环存在，但被 15% 迟滞带（hysteresisBand）吸收，无观察病症。`ScatterChunkManager`「档间轮廓连续不变量下各档近似同值」此前仅为注释级假设，未被测试锁定。
2. **演进方向锁定：选档基准 = High 档派生的稳定资产级半径**。Runtime 在源解析时一次计算 High 档几何包围球并缓存为资产级选档半径，两链恒用；**剔除不跟随**（逐桶视锥剔除继续用各档真实几何球——剔除用真实包围是正确语义）；`sourceKey` 形态身份、桶键、迟滞、批次控制语义零变化。实装归 **T006.6**，排期 = T011 族建设后（不阻塞当前 epic）。仓库此前无任何稳定资产级基准概念（`proceduralProfile` h/w 为 T016 浏览语义、运行时零消费者）。
3. **阈值重锁判定义务**：统一到 High 半径后有效换档点整体平移 ≤~5%（`m = d/r` 反比），处于迟滞带内；按 006.5 常量纪律（数值变更须重开实测记档），T006.6 须带 A/B 对照实测记档，判定 LOD_THRESHOLDS 6/16/60/0.15 是否触发重锁。
4. **D27.12 边界澄清**：稳定基准是 Runtime 从 High 档几何**派生的缓存值**，不是资产声明字段——不违反「调度阈值归 Runtime 全局策略常量、不进资产 Profile」（D27.12）；`proceduralProfile` h/w 保持浏览语义不进选档。
5. **GLB LOD 消费硬约束（D27.3 GLB Proxy 条目升格）**：GLB 资产未来接入多档时**必须直接消费现有 Asset Runtime LOD**——扩展点 = `ModelAsset` levels 声明契约 + `Renderer.declaredLevelsOf` + `AssetSourceRouter` file 分支 level 透传；**禁止另建 GLB 专用 LOD 体系**（D27.1 资产域专属 LOD 禁令的延续，GLBLOD 类平行系统同样禁止）。现状记档：GLB 已走共享链（file 分支忽略 level → 无声明档位恒 High + 超远 culled），仓库零 GLB 专用 LOD 代码；Proxy/Impostor 规范预留位语义不变（lod-spec §3）。
6. **测试先行（本裁定会话执行）**：`InstancedAssetPool.lod.test.ts` 三档硬 pin 同一 boundingSphere 的假前提修复 + 现状语义不变量锁定（档间半径差被迟滞带吸收、迁档半径换源不触发反向换档）——假前提不修则 T006.6 改造无可证明的验收面；交付记档归 T006.6 Step 1。
