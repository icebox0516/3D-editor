# AGENTS.md — 项目规则

> 保持短：只放每次会话都必须知道的项目级规则。调试细则见 `docs/threejs-debugging.md`；任务看 `TASKS.md`；决策看 `DECISIONS.md`。

## 文档体系（怎么找东西）

- **AGENTS.md**（本文件）→ 项目规则 ｜ **TASKS.md** → 现在干哪个任务 ｜ **tasks/*.md** → 任务具体干什么
- **PROGRESS.md** → 目前做到哪（项目快照） ｜ **DECISIONS.md** → 为什么这样设计 ｜ **docs/** → 长期文档
- 启动流程：每次任务先读 AGENTS.md、TASKS.md 和当前任务对应的 tasks/*.md；PROGRESS.md、DECISIONS.md、docs/ 及源码按当前任务的 Dependencies / Scope 按需读取，不要求全量加载
- 程序化资产生产任务：按任务书头部 `workflow: <name>` 声明加载 asset-production 技能（`.zcode/skills/asset-production`——入口路由 → workflows/<name>.md 生产方法正文，D36；任务书只描述本资产差异，不复制稳定生产流程）；用户明确指定的新资产可直接立项（候选池是发现 / 分流参考，非立项前置），立项后仍须 Workflow 路由 + Family 判定 + Research Gate（D37）
- 文档规则优先级（D31）：AGENTS.md > DECISIONS.md 最新有效裁定 > Epic 任务书 > 子任务书 > TASKS.md / PROGRESS.md；子任务可具体化或收紧上级要求，但不得直接冲突，冲突以上级为准；TASKS.md 仅导航、PROGRESS.md 仅状态快照，完成记录不产生新的当前约束
- 任务粒度 = 会话粒度（D16）：子任务 `0XX.N-*.md` 一个会话一个，完成必写文件内「完成记录」；视觉验收分层（D30，细化 D23.7）：**单资产子任务做增量视觉验证**（身份判定 + 统一基线帧 + 契约缺口三必做、余按疑点触发；新 family 首例例外走完整 SOP 口径），**族级集体验收在 epic 末验收门执行**（横向一致性/混植/性能/契约收口/回归，不重跑单资产已完成项）；任务明确标注人工锚点/形态筛选门时例外（如 008.3 锚点门、009.3 逐槽裁定），可在子任务阶段做用户裁定，结果作为后续验收基线；epic 文件维护子任务勾选表
- 资产族 Epic 成员集合口径（D33）：Epic 规则面向「本 Epic 纳入的成员」表述、不写死数量；当前成员清单在 epic 内单独维护；新成员 = 新增一个子任务 + 族级验收门编号顺延为最后一环，Epic 规则文本零改动（顺延规则限族门未收官——收官后追加由后续增补子任务承接、不改已完成编号，需要时做一次增补后族级复核）；仅当形态域超出既有家族契约需新家族契约时才另立 Epic（各资产类型同理）

## 工程硬约束（完成定义）

- `npm test`、`npm run check:layers`、`npm run typecheck` 三重门槛全绿才算完成
- `three` 只允许出现在 `src/runtime` 与 `src/app`（分层检查强制）；editor/ui/domain 零 THREE
- 渲染循环为每帧连续渲染（有意决策，勿擅自改按需渲染）；`Renderer.dispose` 不得加 `forceContextLoss`（StrictMode 双挂载历史冻结 bug）
- Scene 是唯一数据源；一切持久变更经 Command（可撤销重做）；渲染层只读场景
- 新增依赖必须属于当前任务范围，使用 npm 最新稳定版并锁定版本，通过三重门槛；既有依赖（含 `three` / `@types/three`）未经任务书或用户明确授权不得升级；不新增重量级依赖（D31）
- UI 任务先读 frontend-design 技能；视觉遵循 `src/ui/styles/` 设计系统；图标 lucide-react
- 进程用完即清：视觉验收/调试拉起的 dev server、浏览器标签、后台任务在收尾前停掉，不留跨会话残留

## three.js 任务与调试

- **多 Agent 按 Step 派遣**：主代理启动 Task 后先按实际工作拆分为独立 Step，每个独立 Step 默认启动全新的子代理实例，避免跨 Step 上下文污染；生产渲染代码按 Step 实际职责固定路由：Three.js Runtime / Cache / Pool / Renderer / Runtime LOD 调度（选档/换档/分桶/批次/剔除接线）/ Shadow Runtime → `threejs-runtime-agent`；Procedural Geometry / 结构 / Shape / Morph / Asset LOD 内容（几何/材质/档位派生）→ `procedural-asset-agent`；Shader / Material / SDF / Wind / Depth Material → `park-shader-agent`；研究、通用实现、独立验证及不属于上述三类的工作 → 通用子代理自定；程序化资产的生产方法正文由 asset-production 当前 Workflow 提供——Workflow 定义各 Step 必读集（read-set），主代理解析为具体路径后随派遣简报下发（resolved paths），专业代理自读正文（D36）
- **Research Gate（资产现实调研，D26）**：新程序化资产先过 Research Gate 并在任务书留痕，**Gate 必须先于依赖现实对象定义的开发 Step**（纯技术测试/抽象效果除外）；需调研时由通用子代理加载 asset-research 技能执行，结论落盘 `docs/research/<asset>-reference.md`——Reference Spec 是资产现实事实的唯一来源，建造任务书只做带 Spec Version 锚点的执行快照（工程预算/面数/性能阈值归任务书），**开发 Agent 开工前确认任务书引用的 Spec Version 与当前 Spec 一致**；豁免的是调研动作而非 Spec 落盘；GLB 导入与纯技术/占位测试不触发
- 渲染实现的实质修改（`src/runtime`、Renderer、InstancedMesh、Source/Cache/Pool、LOD Runtime、Shadow Pipeline、程序化 Geometry、Shader/Material）主代理不得直接编写，必须由具备对应专业能力的子代理交付（上述三个，必要时可新增或临时使用具备相应 Skill 的专业 Agent）；纯机械性修改（格式修正、注释、日志、测试记录、任务文档）不受此限；主代理负责任务拆分、派遣、协调、审查、合并和最终验收
- 调试取证：先 MCP 结构化数据定位（按需拉起，先过金丝雀——canvas 尺寸 ≈ 主视口才可信，错绑小地图即弃用）→ 收尾浏览器截图验收；结论冲突以像素为准；MCP 拉不起/金丝雀失败直接回退截图。完整细则：`docs/threejs-debugging.md`
- 信息查询路由（D32）：答案现成在页面上（词条/文档页/清单）→ 主代理直查（WebFetch 静态页最轻；agent-browser 进 JS 渲染页与被拦站）；需多源综合 / 数值进代码参数 / 批量验证 / 落盘 → research 技能派子代理溯源——判据 = 答案是「抄下来的」还是「综合出来的」+ 答错代价；用户「要严谨 / 大概看看」可拨档，未指定时主代理自动路由

## 二期内容体系（设计共识摘要，全文见 DECISIONS.md）

- 三层模型：Feature（区域=是什么）/ Style（完整配方=表面+资产配比+散布规则）/ Asset（generator 资产）
- 散布 = 派生式（点树选区域、改参重算、可烘焙）；手放置 = 烘焙式变体（seed 存档）
- 程序化资产 = `*.asset.ts` 代码自描述注册；GLB 库并存同库混排
- "GPU Scatter" = CPU 撒点（种子化纯函数）+ GPU 分块实例化；能力按 10 万实例设计，双档验收（2万/核显 30fps、10万/独显 30fps）
- 资产验收三层原则（D30）：单资产增量验证（新 family 首例完整验收例外）；同 family 全部完成后族级集体验收；公共 Runtime 能力变化经三重门槛全量回归完成公共回归（不另设阶段级档期）；各资产类型门禁清单在各自 epic 立项时定义，不预防性泛化；**完整流程 ≠ 重复完整证据集，不重跑单资产已完成项**（D31）
- 设计论证不受一期实现/规范约束（第一性设计），逐子系统裁定渐进 or 重写并记 DECISIONS.md
