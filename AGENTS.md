# AGENTS.md — 项目规则

> 保持短：只放每次会话都必须知道的项目级规则。调试细则见 `docs/threejs-debugging.md`；任务看 `TASKS.md`；决策看 `DECISIONS.md`。

## 文档体系（怎么找东西）

- **AGENTS.md**（本文件）→ 项目规则 ｜ **TASKS.md** → 现在干哪个任务 ｜ **tasks/*.md** → 任务具体干什么
- **PROGRESS.md** → 目前做到哪（项目快照） ｜ **DECISIONS.md** → 为什么这样设计 ｜ **docs/** → 长期文档
- 启动流程：读 TASKS.md 定位当前任务 → 读对应 tasks/*.md → 按需读 docs/ 主题文件
- 任务粒度 = 会话粒度（D16）：子任务 `0XX.N-*.md` 一个会话一个，完成必写文件内「完成记录」；视觉验收只在 epic 末验收门做；epic 文件维护子任务勾选表

## 工程硬约束（完成定义）

- `npm test`、`npm run check:layers`、`npm run typecheck` 三重门槛全绿才算完成
- `three` 只允许出现在 `src/runtime` 与 `src/app`（分层检查强制）；editor/ui/domain 零 THREE
- 渲染循环为每帧连续渲染（有意决策，勿擅自改按需渲染）；`Renderer.dispose` 不得加 `forceContextLoss`（StrictMode 双挂载历史冻结 bug）
- Scene 是唯一数据源；一切持久变更经 Command（可撤销重做）；渲染层只读场景
- 依赖安装 npm 最新稳定版并锁定；不新增重量级依赖（决策 D13）
- UI 任务先读 frontend-design 技能；视觉遵循 `src/ui/styles/` 设计系统；图标 lucide-react
- 进程用完即清：视觉验收/调试拉起的 dev server、浏览器标签、后台任务在收尾前停掉，不留跨会话残留

## three.js 任务与调试

- 渲染层任务一律派子代理，按任务核心路由：**材质表现/着色器实现/材质资产**（水面/草地/柏油/玻璃等真实感材质、ShaderMaterial/onBeforeCompile 的 GLSL、GPU 程序化纹理与法线、Shader 资产化、大规模材质性能）派 `park-shader-agent`；其余渲染实现/诊断/优化（架构、相机、后期、实例化管线）仍派 `threejs-expert`；同一任务横跨两者时按子系统拆分各自派发
- 主代理只做简报、diff 审查、视觉验收
- 调试取证：先 MCP 结构化数据定位（按需拉起，先过金丝雀——canvas 尺寸 ≈ 主视口才可信，错绑小地图即弃用）→ 收尾浏览器截图验收；结论冲突以像素为准；MCP 拉不起/金丝雀失败直接回退截图。完整细则：`docs/threejs-debugging.md`

## 二期内容体系（设计共识摘要，全文见 DECISIONS.md）

- 三层模型：Feature（区域=是什么）/ Style（完整配方=表面+资产配比+散布规则）/ Asset（generator 资产）
- 散布 = 派生式（点树选区域、改参重算、可烘焙）；手放置 = 烘焙式变体（seed 存档）
- 程序化资产 = `*.asset.ts` 代码自描述注册；GLB 库并存同库混排
- "GPU Scatter" = CPU 撒点（种子化纯函数）+ GPU 分块实例化；能力按 10 万实例设计，双档验收（2万/核显 30fps、10万/独显 30fps）
- 设计论证不受一期实现/规范约束（第一性设计），逐子系统裁定渐进 or 重写并记 DECISIONS.md
