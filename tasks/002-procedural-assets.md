# T002 Procedural Assets

## Goal

程序化资产全链路：从代码自描述注册、资产库浏览、Ghost 预览、点击放置到烘焙式实例变体（D6/D7/D13）——用户体验与 GLB 资产完全一致，底层由 generator 代码生成。

## Requirements

- **代码自描述注册（D7）**：`*.asset.ts` 模块同文件导出 `{meta, build}`；启动自动扫描注册；新增资产 = 加一个文件，零注册代码
- **统一资产描述符**：注册表层 `AssetDescriptor{kind: 'file' | 'procedural'}`；GLB（磁盘 manifest）与程序化（代码注册）同库混排，ContentBrowser 分类/搜索/标签/收藏对两者一视同仁
- **生成契约**：`build(params) → InstanceSource`（geometry + material，代码生成，天然单 Mesh）；结果缓存复用，重复构建零浪费
- **缩略图**：程序化源离屏快照批量生成 + 缓存（与 GLB 缩略图同管线）
- **放置链路**：Ghost 预览（异步生成天然兼容占位先行）→ 点击放置 → 连续批次；撤销/重做与 GLB 资产同语义
- **烘焙式实例变体（D6）**：放置时 seed 掷骰——缩放/旋转抖动烘进 transform、色相微差烘进实例色（instanceColor 通路）、seed 存 `asset.seed`；同 seed 同结果可复盘；变体范围由 asset meta 声明（如 scaleJitter: 0.15）
- **验收货品（D15 设施包 5 种）**：路灯 / 长椅 / 垃圾桶 / 消防栓 / 标识牌——几何 + 材质全代码生成，观感达到「一眼认出是什么」水准

## Scope

- 新建：程序化资产模块目录（`*.asset.ts` + 扫描注册）、程序化源 provider（并列于 GLB 加载器注入实例化管线）、5 个设施 generator
- 预期触碰：资产注册表（统一描述符）、资产浏览器（kind 混排 + 缩略图源）、放置工具（seed 变体注入）、ModelObject（`asset.seed?` 可选字段 + 序列化放行）
- 宿主集成事实参考：`docs/architecture-audit/06_ASSET_SYSTEM.md`、`13_EXTENSION_POINTS.md` 方向 B（事实参考，非设计论据）

## Acceptance

- 5 种设施资产可浏览（缩略图正确）/ 可搜索 / 可放置（Ghost 正常）/ 可撤销
- 同一资产连放 20 个：draw call 不随实例数线性增长（合批生效）
- 每实例变体肉眼可辨（大小/朝向/色相微差），同 seed 撤销重做后结果一致
- 删除对象/清空场景后资源正确释放，无新增 console error
- `npm test` / `check:layers` / `typecheck` 全绿（新增测试覆盖注册/变体/序列化）

## Constraints

- three 只允许出现在 `src/runtime` / `src/app`；实例化池保持「源无关」（不感知资产来源差异）
- 不新增重量级 npm 依赖（three 内建除外）；着色器需要贴图时可用（D13）
- 渲染任务按 AGENTS.md 路由派发子代理（本 epic 以几何与基础材质为主，默认 `threejs-expert`；出现自写 shader 时改派 `park-shader-agent`）；主代理 diff 审查 + MCP/截图视觉验收

## 子任务（2026-09-16 会话粒度拆分，D16）

- [x] T002.1 注册与生成契约（grill 拷问门 2026-09-16 过，裁定 D17；+24 测试 → 2013 全绿）→ [002.1-asset-contract.md](002.1-asset-contract.md)
- [x] T002.2 资产库混排+缩略图（done 2026-09-16；+19 测试 → 2032 全绿）→ [002.2-browser-mixing.md](002.2-browser-mixing.md)
- [x] T002.3 放置+烘焙式变体（done 2026-09-16；+48 测试 → 2080 全绿）→ [002.3-placement-variation.md](002.3-placement-variation.md)
- [x] T002.4 设施资产包 5 种（done 2026-09-16；两阶段派发 threejs-expert+park-shader-agent，+63 测试 → 2143 全绿）→ [002.4-facility-assets.md](002.4-facility-assets.md)
- [x] T002.5 T002 验收门（done 2026-09-16；GUI 全链路取证 14 图 + 合批实测 + 撤销链字节级验证，2143 全绿）→ [002.5-acceptance.md](002.5-acceptance.md)

依赖：002.1 → 002.2 → 002.3 顺序刚性；002.4 仅依赖 002.1（可穿插）；002.5 依赖全部。

## 进度

- 2026-09-16 拆分立项，0/5。
- 2026-09-16 增设前置拷问门：T002.1 开工前过 grill-me（议题回写 002.1 任务书，含 003.1 撒点算法顺风车议题）。
- 2026-09-16 **T002.1 done**（1/5）：grill 门 6 项裁定入 D17；契约全链路落地（glob 自描述注册 / 无参 build + assetId 缓存 / 统一 AssetDescriptor 混排 / 会话私有缓存 / 冒烟垃圾桶）；+24 测试 → 2013 全绿。runtime 侧由 threejs-expert 交付。下一任务：T002.2。
- 2026-09-16 **T002.2 done**（2/5）：资产库混排 + 缩略图落地——ContentBrowser 按统一 AssetDescriptor 混排（分类/搜索/标签/收藏一视同仁，kind 角标仅标注不隔离）；程序化源离屏快照管线（一次性 build → 复用 GLB 快照渲染器 → 内存+IndexedDB 两级缓存，启动自动生成，失败 toast+占位降级）；+19 测试 → 2032 全绿。runtime 侧由 threejs-expert 交付（diff 审查通过），浏览器实测缓存命中（刷新零重生成）。下一任务：T002.3。
- 2026-09-16 **T002.3 done**（3/5）：放置 + 烘焙式变体落地——AssetSourceRouter 复合源分派（池与 Ghost 统一接入，修程序化 Ghost 永远占位盒）、ProceduralSourceCache 接进 Renderer.dispose 链（002.1 遗留项①）、variants 消费（002.1 遗留项③：mulberry32 确定性掷骰，scale/rotation 烘 transform、hue 烘 instanceColor）、池源无关 setColor 通路（扩容缓冲对齐/分裂槽位迁移）、Inspector seed 只读行；+48 测试 → 2080 全绿。runtime 侧由 threejs-expert 交付（diff 审查通过）。下一任务：T002.4。
- 2026-09-16 **T002.4 done**（4/5）：设施资产包 5 种落地——路灯/公园长椅/垃圾桶升级/消防栓/标识牌，几何全代码生成（84–644 面，贴地基准一致）；材质经用户裁定升级 shader 级（拆分派发：threejs-expert 几何+底材 → park-shader-agent 纯 onBeforeCompile 注入 9 配方，零纹理零 uniform，instanceColor 通路完整）；长椅 id 避让 GLB 撞名改 `asset_parkbench`；+63 测试 → 2143 全绿；浏览器冒烟 12 对象 9 配方编译零错误。下一任务：T002.5 验收门。
- 2026-09-16 **T002.5 done → T002 epic 收官**（5/5）：验收门全项通过——5 资产 41 对象 GUI 全链路取证（14 图存 `docs/acceptance/t002/`）；合批实测「同资产 8→12 实例 draw 调用零增长、20 连放仅池级 +6、删光后回基线」；撤销链抽查（批次撤销/重做往返两帧逐字节相等、seed 命令存档不变、跨资产绑定隔离）；资源纪律（全程 console 零错误、新建清场、重放 1.1ms 缓存命中、缩略图清库重生成+热载 2.7s 就位——遗留①关闭）；三重门槛 2143/401/干净，对账 1989+154=2143。视觉模型服务当日断连：近观材质观感以截图留档待用户过目。MCP 金丝雀失败按细则回退浏览器取证。
