# T008 程序化树木

## Goal

3A 级单棵程序化树全链路闭环：证明「一棵真的像树的程序化资产」从**生成**（CPU 拓扑 + 枝干几何 + 叶簇烘焙）、**Shader**（光照 / 色彩变化 / 透光 / 风动）、**实例化**（桶级整树 InstancedMesh）到**资产库**（入库 / 放置 / 撤销 / 存档 / 重掷）成立。树协议稳定后灌木 / 草地复用同一协议扩编（故 epic 收窄命名「树木」，不提前做大成「植被」）。

**立项背景（2026-09-17 grill 拷问门 → D19）**：用户裁定全部程序化资产观感 = v1 基线不达标，003.4 原「风格化低模 / 半写实」返工分叉作废；T003 剩余流程冻结挂起，全力做树。锁定规则链（D19 末条）：

```
一个 seed → shapeSlot 只选形态 → morphRng 只管该槽几何 → instanceRng 只管对象表现
→ sourceKey = assetId + preset + shapeSlot → 一个 sourceKey = 一份合并 Geometry Source
→ 一个桶 = 一个整树 InstancedMesh × 2 groups
```

**总原则（契约第一锁）**：对象 `asset.seed` 永远不直接参与 Source Geometry 生成——Source Geometry 只由 `assetId + preset + shapeSlot → morphSeed` 决定，`build.seed` 一律传 morphSeed、绝非对象 seed（细则与硬测试见 008.1）。

## Requirements

- **契约增量（D19.2–6）**：`build(params?: { seed?, preset? })` 可选参签名（旧资产零改动）；meta 增 `shapeFamily?: { size: number }`（类型不写死常量）；三流域 seed 域分离派生（shapeSlot 路由 / morphRng 形态 / instanceRng 表现）；sourceKey 缓存 + 池分桶；变体两级拆分（结构级进 build 按槽共享，实例级不建新几何）
- **树资产 `asset_tree_3a`**：阔叶（橡树系），`shapeFamily.size = 8`（008.2 先只做 slot-0 锚点形态）；单一合并几何、树皮/叶 2 材质组；叶卡片 build 阶段烘进几何，aLeafRand / aBend 为槽内固有顶点属性、不读对象 seed
- **叶材质（park-shader-agent 领域）**：SDF 程序化叶形、光照、色彩变化、透光、风动（`aBend × hash(aSeed) 相位 × uTime`）；instanceColor 色相通路保留
- **uTime 全局服务最小版（D12 拉前，D19.7）**：单一时间源、材质声明 uTime 即自动驱动、无树局部时钟
- **全链路**：入库+缩略图（一张，slot-0 代表）、点击放置（Ghost 即该 seed 形态）、撤销/重做（Command）、存档往返（seed 落盘重建逐位一致）、Inspector seed 只读+重掷；复制 = 保留 assetId+seed 孪生（仅 transform 独立）
- **观感定调**：008.3 尾锚点定调 = 唯一人工阻断门（详见 008.3 任务书）；参考基调由主代理先行确定，外部视觉基准不进产品资源与代码契约；「3A 级」仅作目标基调词，验收一律以固定机位截图 + 具体视觉判据为准

## Scope

- 新建：契约基建（types / SourceCache / Router / Pool 增量）、uTime 服务、`asset_tree_3a`、叶/树皮材质、放置集成与 Inspector 重掷
- 不碰：v1 九个程序化资产与 GLB 库（行为逐位不变）、散布体系（T003 冻结）、T005 / T006
- preset 仅协议扩展位，v1 不启用不进 UI

## Acceptance（epic 级，008.5 执行）

- 全链路验收：入库 → 放置 → 重掷换树 → 复制孪生 → undo/redo → 存档往返逐位一致
- **同 sourceKey 多实例一致性验证**：随机放置 ≥6 棵同槽树，确认 Geometry/Material 共享、实例间仅 instanceMatrix/instanceColor/aSeed 可异（不得以 per-instance uniform、独立 Geometry、独立 Material 或额外 Mesh 产生形态差异）、桶内单一 InstancedMesh × 2 draw calls（本契约设计的核心价值验证）
- 零错误五拆口径：运行时无异常 / 资源无重复 build / Ghost 不触发 dispose / 放置删除 Undo Redo 无资源泄漏 / 同 sourceKey 不重复创建 Geometry/Material
- 锚点定稿基准 + 固定机位/曝光/环境光/距离截图存档 `docs/acceptance/t008/`
- `npm test` / `check:layers` / `typecheck` 全绿

## Constraints

- three 只允许 `src/runtime` / `src/app`；seed 派生与 sourceKey 组装为纯函数落 domain（零 THREE）
- D13：零外部模型；叶形走 shader 内 SDF 程序化 alpha；参考图纯沟通不进库
- 派发路由：基建/几何 → threejs-expert；叶/树皮材质与风动 shader → park-shader-agent；主 agent 审查 + 锚点门取证
- **008.3 尾锚点门未过，008.4 / 008.5 不得启动**（唯一人工阻断门）
- 面数/叶卡数量为初始目标预算非验收门槛（枝干约 1.5–3 万面、叶卡数千级；以锚点观感 + 性能实测共同裁定）

## 子任务（2026-09-17 立项拆分，D16 会话粒度）

- [x] T008.1 契约增量 + uTime 基建（done 2026-09-17；+45 测试 → 2376 全绿；aSeed 因 r186 事实改 geometry 绑定、带 seed 池单实例仍 InstancedMesh 两处裁定落档，见任务书完成记录）→ [008.1-contract-infra.md](008.1-contract-infra.md)
- [x] T008.2 树几何生成器 · slot-0 锚点形态（done 2026-09-17；+21 测试 → 2397 全绿；皮 20724 面/叶卡 5670 张 = 32064 恒定、结构计数固定 ⇒ 任意 seed 面数恒等；aLeafRand/aBend/UV/恰 2 组几何数据契约冻结，DEV 出图面 `window.__tree3a`，3 截图存档 `docs/acceptance/t008/008.2/`，见任务书完成记录）→ [008.2-tree-geometry.md](008.2-tree-geometry.md)
- [ ] T008.3 叶/树皮材质 + 风动（尾接视觉锚点定调人工门）→ [008.3-leaf-shader-wind.md](008.3-leaf-shader-wind.md)
- 【视觉锚点定稿——人工阻断门：用户裁定近/中/远观感，1–2 轮微调上限】
- [ ] T008.4 放置全链路集成 → [008.4-placement-integration.md](008.4-placement-integration.md)
- [ ] T008.5 扩 8 槽 + 验收门 → [008.5-acceptance.md](008.5-acceptance.md)

依赖链：008.1 → 008.2 → 008.3 →【锚点门】→ 008.4 → 008.5。008.1 纯基础设施（008.2 起假定基建可用）；008.2 冻结几何数据契约（008.3 只碰材质）。

## 进度

- 2026-09-17 立项：grill 拷问门过（方向/交付边界/资产身份/契约修订/形态族/验收闭环/uTime/Inspector/任务拆分逐题裁定 + 六处修正），D19 落档，0/5。
- 2026-09-17 T008.1 完成（1/5）：三流域派生/sourceKey 缓存/池分桶/aSeed/uTime 服务全量落地，契约第一锁硬测试锁定（S1≠S2 同槽 → 同 Source 同引用）；偏离两处落档——aSeed 必 geometry 绑定（r186 仅 instanceMatrix/instanceColor 对象级）、带 seed 池单实例仍 InstancedMesh（aSeed 风动不因单棵失效）；DEV 验证资产 asset_seedstack（category 'dev' 不进产品栏）。与 T003 挂账变更交织未提交。下一步 008.2 slot-0 锚点几何。
- 2026-09-17 T008.2 完成（2/5）：夏栎（asset_tree_3a）slot-0 锚点形态——五级递归分枝 + 锥度管枝干（径向 12→4、主干底盖）+ 冠外层叶卡；**结构计数固定 ⇒ 任意 seed 面数恒定**（皮 20724 / 叶卡 5670 / 合 32064 = meta 实数）；aLeafRand/aBend/UV/恰 2 材质组几何数据契约冻结并 21 条测试锁定（同 seed 逐位复现 / 无参 = 锚点 / 同槽同引用）；DEV 出图面 `window.__tree3a`（runtime/tree3aStage 实现，bootstrap 只装配）；浏览器自检 3 截图 + console 零错误（agent-browser，server 5175 即用即停）；偏离两处落档（账目插入位实测在 asset_shrub 之后；DEV 句柄落 runtime 保 bootstrap 零 three）。下一步 008.3 叶/树皮材质 + 风动（几何契约只消费不修改）。
