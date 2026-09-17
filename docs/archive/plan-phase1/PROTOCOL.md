# 执行协议（仅主代理阅读与遵循；子代理不需要读本文件）

> 🏁 **一期收官横幅（2026-09-15，决策日志留痕）**：用户裁定一期完成，`docs/plan/tasks/` 61 份任务书已整体 git mv 至 `docs/plan/archive/tasks-v1/`（冻结，含 T10.3–T10.5 三份未执行任务书）。本协议自即日起转为**历史记录**，不再指导任务派发；二期如重启须重新过门立项并另立执行协议。CONTRACTS.md 与 contracts/ 分域契约作为工程契约资产继续有效。

> 任务内容在 `docs/plan/tasks/T*.md`；跨任务约束与接口契约在 `docs/plan/CONTRACTS.md`；进度唯一真相源是 `docs/plan/STATUS.md`。旧单文件主计划已归档至 `docs/plan/archive/`，仅作设计论证存档，**不作为执行依据**。

## 文件拓扑与读写权限

| 文件 | 读者 | 写者 |
|---|---|---|
| `docs/plan/PROTOCOL.md`（本文件） | 主代理（每执行会话开始读一次） | 仅重大协议变更时修改，须在 STATUS 决策日志留痕 |
| `docs/plan/CONTRACTS.md` | **所有子代理必读**（基础契约 + 分域索引） + 主代理 | 仅主代理；契约变更须同步决策日志；任务文件与源码禁止重定义契约 |
| `docs/plan/contracts/*.md`（分域契约） | 任务书「必读」节指定的任务子代理 + 主代理 | 仅主代理；与基础契约冲突时由主代理裁决；新增分域文件须在 CONTRACTS 索引登记 |
| `docs/plan/STATUS.md` | 主代理（每会话开始必读；仅当前快照与活跃任务表） | **仅主代理**（单一写者原则） |
| `docs/plan/history/`（tasks-done / decisions / sessions） | 主代理按需查阅（归档全文） | **仅主代理**，append-only，不回改历史 |
| `docs/plan/METHODOLOGY.md` | 主代理（**里程碑验收前必读**） | 仅主代理，验收会话追加经验 |
| `docs/plan/tasks/T*.md` | 对应任务的子代理 + 主代理 | 仅主代理（勾选步骤 checkbox、更新头部状态字段） |
| `docs/plan/archive/*.md` | 按任务文件指定章节读取（提示词原文已嵌入任务文件，一般无需再读） | 冻结，永不修改 |
| `docs/plan/screenshots/` | — | 主代理里程碑验收时写入 |

## 角色分工

| 角色 | 职责 |
|---|---|
| **主代理（编排者）** | 每会话开始读 STATUS.md 定位进度；维护 todolist；**过分级拷问门（阶段门/设计门/按需门）与用户确认**；派发任务子代理；每任务后运行守护检查；勾选任务 checkbox 并更新 STATUS；执行浏览器 GUI 验收（browser-use 技能仅主代理可用，禁止下放）；失败时派发修复子代理；写会话日志 |
| **任务子代理** | 每任务一个全新 general-purpose 子代理：读 CONTRACTS + 自己的任务文件 + 指定需求文档章节 → TDD 实现 → 自测 → commit → 返回报告。**禁止写任何 docs/plan/ 文件**；禁止顺手改其他任务的文件 |
| **修复子代理** | 携带失败输出（测试日志 / 检查脚本输出 / 验收截图问题清单）的定向修复代理，同样禁止写计划文件 |

## 任务状态机

`pending` → `in_progress` → `done`；异常：`blocked`（需用户决策）、`failed`（2 次修复未过）。

状态由**仅主代理**记录在三处（每任务完成/变更时同步）：
1. `docs/plan/STATUS.md` 总表（唯一真相源）；
2. 对应 `tasks/T*.md` 头部「状态」字段 + 步骤 checkbox；
3. 当前会话 todolist（镜像本阶段任务）。

## 任务前置拷问门（grilling gate · 用户指定 · 分级制）

拷问确认按**分级门禁**执行（2026-09-09 与用户确认，取代早前「每任务必检」方案——契约锁死的任务逐个拷问只会造成仪式性确认与警报疲劳）。技能：`mattpocock-skills:grilling`（`C:\Users\admin\.zcode\cli\plugins\cache\claude-plugins-official\mattpocock-skills\1.2.3\skills\productivity\grilling\SKILL.md`）。**带门任务未过门不得派发。**

| 门 | 触发任务 | 拷问内容 |
|---|---|---|
| 阶段门 ×10 | T0.1 / T1.1 / T2.1 / T3.1 / **T5.1 / T6.1 / T7.1 / T8.1 / T9.1 / T10.1** 派发前 | 本阶段目标、任务序列、验收标准、风险；按 grilling 格式一轮摆出全部前沿问题，每问附 ➡️ 推荐答案。（T5.1 门已于 2026-09-10 随 UI 重构计划编制一并过门；T6.1 门已于 2026-09-11 随「绘制需求变更」grilling 过门；T7.1 门已于 2026-09-12 过门；T8.1 门已于 2026-09-13 过门——网络调研先行 + 选择式 grilling 8 问，阶段 8 任务书 T8.1–T8.6 全量定稿，决策日志留痕；**T9.1 门已于 2026-09-15 过门——用户定时任务常设预授权「决策门调研社区成熟方案+按主代理推荐自决无需确认」，社区调研先行+门内五问自决，决策日志留痕**；**T10.1 门已于 2026-09-15 过门——沿同常设预授权自决：测量/分析为已交付产品唯一显式预留「后续版本」功能（toolIA 禁用占位第 7/8 位），调研先行（archive/research-phase10-measure-analysis.md）+门内八问自决，阶段 10 任务书 T10.1–T10.5 全量定稿，第十一次契约修订，决策日志留痕**） |
| 设计门 ×1 | T1.8 派发前 | 全编辑器美学方向给出 2-3 个候选（各附方向描述：色板气质/字体取向/密度），用户选定后再派发 |
| 按需门 | 任意任务任意时刻触发：①子代理报告提出改契约 ②验收项 2 轮修复失败 ③超出任务书授权的偏差决策 | 当次具体决策，附推荐答案，用户拍板后继续 |

规则：
1. 带门任务在用户回复前不得派发；用户修正若影响契约或验收，先更新任务书并记 STATUS 决策日志，再派发。
2. 其余 14 个任务（无开放决策、契约与验收断言已锁死）直接派发，无需拷问。
3. 按需门由主代理在触发条件出现时**主动**发起，不得自行代答或静默吞掉。
4. 每次过门（含按需门）在 STATUS 会话日志留一行记录。

## 子代理派发模板

```
你是执行任务 T{id} 的子代理。工作目录：D:\3D editor（Windows，Git Bash）。

必读（按序，读完再动手，禁止读取 docs/plan/ 下其他任务文件）：
1. docs/plan/CONTRACTS.md（全局约束 + 基础契约 + 分域索引，唯一权威）**及任务书头行「分域契约」指定的 contracts/*.md 分域文件**
2. docs/plan/tasks/T{id}.md（你的任务书，含注入提示词与偏差说明）
3. 任务书「必读上下文」列出的需求文档章节与前置源码

硬性要求：
- TDD：先写失败测试 → 运行确认失败 → 最小实现 → 通过
- 严格遵守 CONTRACTS.md 的分层 DAG 与 three 导入白名单，禁止越层
- {UI 任务时追加}：先完整阅读 C:\Users\admin\.agents\skills\frontend-design\SKILL.md 并遵循其准则与任务书中设计系统要求
- 禁止修改 docs/plan/ 下任何文件
- 完成后依次运行：npm test、npm run check:layers、npm run typecheck，全绿才算完成
- git add 相关文件并 commit，提交信息用任务书给定的信息

返回报告（纯文本，勿改文件）：变更文件清单 / 测试结果摘要 / 与任务书偏差说明
```

## 守护检查（任何任务完成的定义）

```bash
npm test                 # 全部通过
npm run check:layers     # 无越层导入、three 白名单无违规
npm run typecheck        # tsc --noEmit 无错误
```

里程碑任务（T1.9 / T2.5 / T3.4 / **T5.9 / T6.10 / T7.8 / T8.5 / T9.3 / T10.5**）额外由主代理做浏览器验收：`npm run dev` 启动，按任务书验收清单用 browser-use 实操，截图存 `docs/plan/screenshots/<phase>/`。

## UI 任务设计规则

- 所有涉及 `.tsx` / 样式产出的任务（T1.8、T2.1、T2.4、T3.3，以及 UI 重构阶段 **T5.1–T5.6、T5.8 与 T6.x/T7.x 中的 UI 部分**）：执行代理必须先完整阅读 frontend-design 技能（`C:\Users\admin\.agents\skills\frontend-design\SKILL.md`）并遵循其设计准则——确立鲜明美学方向、拒绝通用 AI 风格（禁 Inter/Roboto/system 字体、紫色渐变等）、CSS 变量管理主题、注重排版与微交互。
- **T1.8 是设计系统奠基任务**：在该任务中确定整个编辑器的美学方向（2026-09-09 设计门用户选定方向 A「夜间制图台」），产出 `src/ui/styles/tokens.css` 与 `src/ui/styles/DESIGN.md`。
- **后续 UI 任务禁止另起炉灶**：一律复用 tokens.css 与 DESIGN.md 的既定语言；新增视觉元素需在 DESIGN.md 补记（该补记由子代理在返回报告中提出、主代理确认后落文件）。**UI 重构阶段沿用此规则（2026-09-10 阶段门 Q3 裁定：需求文档 36.2 建议色板不采纳、不重定调）**。
- **UI 重构阶段附加规则（2026-09-10）**：①图标统一 lucide-react（T5.6 起引入，npm 最新稳定版锁定）+ 园区特有图标自绘 SVG 登记 DESIGN.md，禁 emoji 图标；②UX 底线检查项（源自 ui-ux-pro-max 技能速查，写入各任务书验收）：可点元素 cursor-pointer、hover/active/focus 状态可辨、过渡 150–300ms、图标按钮 ≥40px 触达、等宽数字读数、aria 标注；③**含 runtime/three 变更的任务（T5.7、T5.8，阶段 6 的 T6.2 / T6.3 / T6.4 / T6.8，及 T7.5 / T7.6 / T7.7 / T8.1 / T8.4 / T9.2 / T10.1 / T10.4）派发 threejs-expert 子代理**（AGENTS.md 约定；T7.5/T7.6/T8.1 为派发路由裁定补正，见决策日志），纯 UI 任务派 general-purpose。
- **测试边界**：node 环境纯逻辑模块覆盖（无 jsdom），组件 GUI 行为留阶段验收任务（沿 T2.1 先例）。

## 修复循环

1. 任务子代理返回后，主代理运行守护检查；
2. 失败 → 派发修复子代理，提示词附：任务书路径 + 失败输出全文 + 复现命令；
3. 同一任务最多 2 次修复；仍失败 → STATUS 该任务标 `blocked`，整理问题清单向用户呈报；
4. 修复期间该任务保持 `in_progress`。

## 里程碑验收（T1.9 / T2.5 / T3.4，主代理亲自执行）

- **验收前必读 `docs/plan/METHODOLOGY.md`**（GUI 实操方法学，历次验收经验沉淀；新经验随验收追加）；
- 用 browser-use 技能操控浏览器逐项过验收清单；
- 每项截图留证至 `docs/plan/screenshots/<phase>/`；
- 不过项按修复循环处理（带截图与复现步骤）；
- 全过后：勾选任务 checkbox、STATUS 标 done、commit 截图目录。

## 依赖版本策略（执行 T0.1 时生效）

安装时一律取 npm 最新稳定版并提交 lockfile；2026-09 快照与回退规则见 `tasks/T0.1.md`。
