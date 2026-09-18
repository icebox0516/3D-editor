# AGENTS.md — 项目规则

> 保持短：只放每次会话都必须知道的项目级规则。调试细则见 `docs/threejs-debugging.md`；任务看 `TASKS.md`；决策看 `DECISIONS.md`。

## 文档体系（怎么找东西）

- **AGENTS.md**（本文件）→ 项目规则 ｜ **TASKS.md** → 现在干哪个任务 ｜ **tasks/*.md** → 任务具体干什么
- **PROGRESS.md** → 目前做到哪（项目快照） ｜ **DECISIONS.md** → 为什么这样设计 ｜ **docs/** → 长期文档
- 启动流程：每次任务先读 AGENTS.md、TASKS.md 和当前任务对应的 tasks/*.md；PROGRESS.md、DECISIONS.md、docs/ 及源码按当前任务的 Dependencies / Scope 按需读取，不要求全量加载
- 任务粒度 = 会话粒度（D16）：子任务 `0XX.N-*.md` 一个会话一个，完成必写文件内「完成记录」；常规视觉验收在 epic 末验收门执行——任务明确标注人工锚点/形态筛选门时例外（如 008.3 锚点门、009.3 逐槽裁定），可在子任务阶段做用户裁定，结果作为后续验收基线（D23.7）；epic 文件维护子任务勾选表

## 工程硬约束（完成定义）

- `npm test`、`npm run check:layers`、`npm run typecheck` 三重门槛全绿才算完成
- `three` 只允许出现在 `src/runtime` 与 `src/app`（分层检查强制）；editor/ui/domain 零 THREE
- 渲染循环为每帧连续渲染（有意决策，勿擅自改按需渲染）；`Renderer.dispose` 不得加 `forceContextLoss`（StrictMode 双挂载历史冻结 bug）
- Scene 是唯一数据源；一切持久变更经 Command（可撤销重做）；渲染层只读场景
- 依赖安装 npm 最新稳定版并锁定；不新增重量级依赖（决策 D13）
- UI 任务先读 frontend-design 技能；视觉遵循 `src/ui/styles/` 设计系统；图标 lucide-react
- 进程用完即清：视觉验收/调试拉起的 dev server、浏览器标签、后台任务在收尾前停掉，不留跨会话残留

## three.js 任务与调试

- **多 Agent 按 Step 派遣**：主代理启动 Task 后先按实际工作拆分为独立 Step，每个独立 Step 默认启动全新的子代理实例，避免跨 Step 上下文污染；生产渲染代码按 Step 实际职责固定路由：Three.js Runtime / Cache / Pool / Renderer / LOD Runtime / Shadow Runtime → `threejs-runtime-agent`；Procedural Geometry / 结构 / Shape / Morph / Asset LOD 内容 → `procedural-asset-agent`；Shader / Material / SDF / Wind / Depth Material → `park-shader-agent`；研究、通用实现、独立验证及不属于上述三类的工作 → 通用子代理自定
- **Research Gate（资产现实调研，D26）**：所有新程序化资产开工前必过 Gate 并在任务书留痕；需调研时由通用子代理加载 asset-research 技能执行，结论落盘 `docs/research/<asset>-reference.md`——Reference Spec 是资产现实事实的唯一来源，建造任务书只做带 Spec Version 锚点的执行快照（工程预算/面数/性能阈值归任务书）；豁免的是调研动作而非 Spec 落盘；GLB 导入与纯技术测试不触发
- 渲染实现的实质修改（`src/runtime`、Renderer、InstancedMesh、Source/Cache/Pool、LOD Runtime、Shadow Pipeline、程序化 Geometry、Shader/Material）主代理不得直接编写，必须由具备对应专业能力的子代理交付（上述三个，必要时可新增或临时使用具备相应 Skill 的专业 Agent）；纯机械性修改（格式修正、注释、日志、测试记录、任务文档）不受此限；主代理负责任务拆分、派遣、协调、审查、合并和最终验收
- 调试取证：先 MCP 结构化数据定位（按需拉起，先过金丝雀——canvas 尺寸 ≈ 主视口才可信，错绑小地图即弃用）→ 收尾浏览器截图验收；结论冲突以像素为准；MCP 拉不起/金丝雀失败直接回退截图。完整细则：`docs/threejs-debugging.md`

## 二期内容体系（设计共识摘要，全文见 DECISIONS.md）

- 三层模型：Feature（区域=是什么）/ Style（完整配方=表面+资产配比+散布规则）/ Asset（generator 资产）
- 散布 = 派生式（点树选区域、改参重算、可烘焙）；手放置 = 烘焙式变体（seed 存档）
- 程序化资产 = `*.asset.ts` 代码自描述注册；GLB 库并存同库混排
- "GPU Scatter" = CPU 撒点（种子化纯函数）+ GPU 分块实例化；能力按 10 万实例设计，双档验收（2万/核显 30fps、10万/独显 30fps）
- 设计论证不受一期实现/规范约束（第一性设计），逐子系统裁定渐进 or 重写并记 DECISIONS.md
