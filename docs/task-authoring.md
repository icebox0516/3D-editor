# Task Authoring — Lean Task 规范（D40）

> 任务书 = **本次实例差异的唯一载体**。稳定流程不复述——从当前 Workflow / Skill / docs 获取。本规范适用一切任务类型：程序化资产 / UI / 编辑器重构 / 调查任务同理。canonical 模板 = `tasks/_template.md`。

## 允许字段

| 字段 | 语义 |
|---|---|
| 头部状态行 | 状态（pending / in-progress / done）+ 立项日期 + 编号说明 / workflow 声明 / spec 锚点 |
| `workflow: <name>` | 生产方法路由键（程序化资产任务声明；其他任务省略） |
| `spec:`@版本 | Reference Spec 版本锚点（有 Spec 消费的任务必填，D26） |
| 前置 | 依赖任务 / 决策 |
| Goal | 本次差异——为什么立这个任务、交付什么变化 |
| Research Gate 留痕 | 强制 / 豁免判定（豁免留 `Status: waived + Reason + Evidence`，D26） |
| 重点调研面 | 本资产需重点确认的现实事实（仅程序化资产任务） |
| 待裁决位 | 已裁定差异点清单（执行时不再复议） |
| Asset Scope / Scope | 文件级改动范围 |
| 特殊 Acceptance | 仅写本任务特殊的验收条款 |
| 取证路径 | `docs/acceptance/<epic>/<子任务>/` |
| 完成记录 | 结果 / 偏离 / 事故 / 验证证据 / 遗留（D36 第 10 条：不重复稳定方法论） |

## 禁止复述清单

以下内容一律引用当前来源，不得复制进任务书：

| 禁止复述内容 | 唯一来源 |
|---|---|
| 标准 Step 流程（Step 0–4 形状等） | 当前 Workflow（`.zcode/skills/asset-production/workflows/`） |
| 通用派遣规则 | AGENTS.md「多 Agent 按 Step 派遣」 |
| 通用调研方法 | asset-research 技能 |
| 通用视觉 SOP | shadow-visual-sop.md + Workflow §Step 4 |
| 通用 LOD / Shadow / Runtime 方法 | docs/procedural-assets + 当前 Workflow |
| 三门槛定义 | AGENTS.md「工程硬约束」（判据式，D40） |
| 通用测试组织与测试纪律 | 当前 Workflow「测试与三门槛」（D40 五者判据） |

## 检查

`npm run check:tasks`（`scripts/check-task-authoring.mjs`）——**report-only 不硬失败**。信号集：①任务书出现 workflow / docs 规范同名固定段标题；②任务书与 AGENTS / workflow / docs 的行级重合字节占比；③`基线 NNNN` 按章节报告（Acceptance / Constraints → warning；完成记录 → normal；声明固定外部基线 → 允许）+ 同文件 ≥2 个不同基线数算术交叉；④DECISIONS「标题 D 号集合 == 索引 ID 集合」双向核对。不做跨任务书比对（防合法资产事实重复误报）。

历史任务书中的旧协议表述为当时事实，不回改（D40 历史任务隔离子节；D31.1 口径）。
