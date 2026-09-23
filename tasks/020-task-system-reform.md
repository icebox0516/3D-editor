# T020 任务执行体系收敛（第二批：执行协议整体切换）

> 状态：**pending（2026-09-23 立项）** ｜ 前置：T018 收官（✅ `91c9a31`）+ 第一批历史卫生（✅ `5aa70e1` / `bcd7f04` / `0bc08ae`）｜ 非程序化资产任务——治理任务，无 `workflow:` 声明（生产流程类规则不适用；本任务书即 Lean Task 首例：只装本次差异与裁定记档，不复述稳定流程）｜ **编号说明：T019 为颜色管线语义保留**（D29「独立立 T019 颜色管线任务 / Tone Mapping 应急出口」与 D39「ACES 证据留 T019 素材指针」已引用，TASKS/PROGRESS 同步），本任务顺延 T020

## Goal

把任务系统收敛 grilling 会话（2026-09-23，两会话逐题裁定）定案的新执行协议一次性切换落地：**唯一来源（Workflow / Spec）→ 最小上下文（read-set 白名单）→ 新增语义验证（测试纪律）**。

**总原则（最高优先）**：第一批只修错误指针 / 双源 / 历史脏数据（已完成）；本任务切换当前执行规则；**两批之间与切换中途不得存在"已生效但未同步到所有消费方"的新规则**。

## 结构（两阶段 = 两会话，完成记录按阶段各 appended 于本文件——011.12 两会话先例）

- **阶段一 rule 层原子切换**：**一个同步时点**落盘下列 1–8（tracked 文件一次提交；第 3、4 项中的 `.zcode/` 文件不入库〔R1〕、与提交同刻本地改毕——批次一 `5aa70e1` 同款处理；任何一项单独先行都会造成规则分裂）
- **阶段二 code 面**：独立会话、独立提交，9–12（改的是 13 个资产的回归锁，不与 rule 层绑定）

## 阶段一：承载文件清单（原子提交范围）

1. `DECISIONS.md` — **D40 任务执行体系收敛**（D39 已被过曝处置占用，顺延）：子节 = 任务书 / Read-set / 测试 / 三门槛 / 历史任务隔离；**细则不占独立 D 号**（未来单点修订走新 D 号 + 索引行整体指向——防两级地址歧义：D35.1 形态已是独立决策号、`asset-research/references/photo-verification.md` 引用「D35.1 第 4 条」两级地址，细则再占号不可读）；**D40 自带承载文件清单**（正文列出它生效依赖的每个文件路径，使"漏改载体"可机械核对）；D16 / D30 索引行 Note 改「部分取代」（正文不回写——npm test 触发条件类子条被 D40 改，历史原文保留）；同步索引行（同步规则第二次实测——首次失败例已记档于 D39 行 Note）
2. `AGENTS.md` — 四句判据式硬约束，正文不下沉不展开：①三门槛改「**代码执行面变化（`src/**`、`tests/**`、`package.json`/lock、vite/vitest/tsconfig、构建·测试脚本）才必须 `npm test`；`check:layers` 与 `typecheck` 恒跑**」②「任务书不得复述稳定生产流程；流程从当前 Workflow / Skill / docs 获取，任务书只描述本次实例差异」③read-set 白名单口径（默认上下文 = AGENTS + 当前任务书 + 本 Step resolved read-set + Step 显式指定的 Skill/reference；Workflow 显式授权的按需先例读取不算违规；禁"可能相关"自行扩大；缺口先报主代理裁决）④DECISIONS 定向读取（索引定位 → 只读该条；由主代理点名）
3. `.zcode/agents/*.md` ×3 — read-set 统一为「AGENTS.md + 当前任务书 + 当前 Step 的 resolved read-set」；**删「遵循 TASKS.md」**（与 D31.1「TASKS 仅导航不产生规则」冲突）；`park-shader-agent.md` 的「DECISIONS.md 中相关决策」改「主代理派遣简报点名 Dxx → 按点名定向读取，不全量加载」；Agent 定义只管职责边界 / Skill 路由 / 交付格式 / 停止条件，不重定义任务体系
4. `.zcode/skills/asset-production/workflows/tree.md` — ①read-set 表三列化 `Path | Section | Mode`（**Section = 读取上限**；不设每 Step 文件数硬上限——无证据基础）②Step 1 读取顺序：先例索引（方法 / 差异 / 先例选择）→ 需承重数值才定点读 Spec / 任务书对应节 → 仍不足报主代理授权扩大；**观察钩子**：完成记录记 `index-only / point-read / full-read + reason`（记档非门槛、不设自动触发线）③测试纪律：新测试须对应五者之一（新增行为 / 新增结构·参数·材质语义 / 新任务新契约 / 新风险 / 公共能力新场景边界首现）；已覆盖公共能力不得因"新增资产"复制测试；结构可参考先例、内容按新增语义裁定 ④**Family Acceptance Gate 骨架节**：七项骨架（横向一致性 / 真实差异 / 混合场景 / 预算·LOD / 性能 / 家族契约收口 / 回归）；family-specific 检查项归各 Epic 定义（Broadleaf 实现留在 011.13 完成记录，不复制进 workflow）⑤先例索引定位句改为「方法摘要 + 导航」（既非纯导航、也非事实源——数值与细节仍回原任务书 / Spec）
5. `docs/task-authoring.md`（新建）— Lean Task 规范：允许字段（Epic / `workflow:` / `spec:`@版本 / 前置 / Goal=本次差异 / Research Gate 留痕 / 重点调研面 / 待裁决位 / Asset Scope / 特殊 Acceptance / 取证路径 / 完成记录）；禁止复述清单（标准 Step 流程 / 通用派遣 / 通用调研方法 / 通用视觉 SOP / 通用 LOD·Shadow·Runtime 方法 / 三门槛定义 / 通用测试组织——一律引用当前 Workflow / Skill / docs）；适用一切任务类型（非程序化资产专属——T016 UI / T017 编辑器 / 调查任务同理）
6. `tasks/_template.md`（新建）— canonical 模板：上述字段骨架，**无 Step 0–4 复制区**
7. `scripts/check-task-authoring.mjs`（新建）+ `package.json` 加 `check:tasks` — **v1 report-only 不硬失败**，信号集：①任务书内出现 workflow/docs 规范同名固定段标题 ②任务书与 AGENTS/workflow/docs 的行级重合字节占比 ③`基线 NNNN` 按章节报告（Acceptance/Constraints → warning；完成记录 → normal；声明固定外部基线 → 允许）+ **同文件 ≥2 个不同基线数 → warning 并列行号**（011.12「3245 vs 3803」实证腐例，纯算术零语义）④DECISIONS「标题 D 号集合 == 索引 ID 集合」双向核对（D39 漏登失败例）⑤**不做跨任务书比对**（防合法资产事实重复误报）
8. `TASKS.md` / `PROGRESS.md` — 按 D24 口径压缩：TASKS 删完成叙事 / 测试数 / 性能实测 / 验收过程（保留 `[x]/[~]/[ ]` + 一行摘要 + 链接；候选池占位行按 D34.5 保留）；PROGRESS 维持极短快照

## 阶段二：code 面（其后独立会话）

9. `tests/support/procedural-tree/` 共享 harness：`makeFakeBuild` / `track` / `assemble` / `expandIncludes` / `leafCardXZ` / Stage fixture（13 份重复脚手架合一；**不建 treeTestEverything.ts 大一统**）；资产自有断言留在资产测试
10. O(n²) 跨资产程序键碰撞断言集中化：**11 个「键零碰撞」逐对 it 块**（10 资产 Materials 各一 + ligustrum；celtis 作为外键在他资产块内断言、tree3a 无块）收进表驱动家族测试（`tests/runtime/procedural/assets/plantMaterials.test.ts` 为 it.each 形态 / `assetTaxonomy.test.ts` 为表驱动 for…of 遍历——一次遍历全部注册资产即覆盖全部资产对），删逐对副本
11. 16 处 `expect(true).toBe(true)` 软跳过清除（12 ShapeSlots + 4 Lod——真缺陷：失败被静默吞掉）
12. **既有 66 个树测试文件不迁移**（等价重构 33.9k 行是独立大任务，另行立项）；三门槛全绿收口

## 裁定记档（grilling 逐题结论浓缩——执行时不再复议）

| 题 | 裁定 |
|---|---|
| R1 | `.zcode/` 保持本地私有不入库、`temp/` 仅审阅镜像（用户最终裁定，推翻此前纳管方案）；**D23.7 两门程序文本随之只有本地一份，接受** |
| R2 | 先例数值层不建（防第二事实源）；索引定位 + 定点节读取 + 观察钩子（记档非门槛，不设自动触发线） |
| R3 | 单条 D40 + 子节组织；细则不占 D 号；索引粒度 = 可独立被取代的决策单元；Status 四值含「部分取代」 |
| R4 | read-set 可观察面 = 派遣简报三列 + Agent 完成时报 `Additional Read: N (+ reason)`；不做阅读审计日志、不做独立 audit |
| R5 | 检查脚本信号集如上第 7 条；基线信号 = 章节报告 + 同文件算术交叉，不判合法性 |
| R6 | 测试第一阶段 = 建立新消费面（新资产走新模式），不动旧 66 文件 |
| R7 | Family Gate 升骨架不升全 SOP（仅 Broadleaf 一族执行过，不足以泛化家族特有检查项） |
| R8 | 时序两批；agent 定义与 D39/D40 同属执行协议面同步落（本次 D40）；「已生效未同步」窗口为零 |
| Q-B/E | 基线算术交叉采纳；第一批于 grilling 会话直接执行（已完成） |
| 两待裁 | checker 收紧选 B（删 `src/main.tsx` 白名单，✅ `0bc08ae`）；README grilling 门选删（✅ 同提交） |

## Acceptance

- **D40 草案经用户过目后才落盘**（阶段一会话先出草案）
- rule 层一个同步时点落盘（tracked 一次提交 + `.zcode/` 同刻改毕）；收尾扫描三条：①三个 agent 文件 `grep -c "TASKS.md" .zcode/agents/*.md` 全部归零（现行句式为「遵循仓库 AGENTS.md / TASKS.md / 当前 task」与「遵循仓库：」列表，**不是**字面「遵循 TASKS.md」——扫 TASKS.md 字样本身）②`grep -rn "SOP §5"` 活文件命中**仅余** `shadow-visual-sop.md` 墓碑节自身一处（:159 有意保留；历史验收记录按 D31.1 不回写）③AGENTS 旧三门槛整句「三重门槛全绿才算完成」已被判据式句替换
- `check:tasks` 首跑产出报告（report-only，不进失败路径）
- 阶段二三门槛全绿（npm test / check:layers / typecheck）
- 索引同步：D40 行随决策同 commit（第二次实测）

## 完成记录

（待执行会话按阶段填写）
