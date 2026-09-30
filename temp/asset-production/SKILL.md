---
name: asset-production
description: 程序化资产生产方法入口与流程编排：启动判定 → Workflow 路由 → read-set 指引 → 验收条款。程序化资产立项 / 预立任务书时，或任务书头部声明 workflow: <name> 时加载。生产规则两层（D43）：spine.md 跨方法共性规则 + workflows/<name>.md 方法剖面；不含资产知识与工程契约正文（归 docs/procedural-assets）。
---

# Asset Production

> 定位（DECISIONS D36 / D43）：程序化资产生产方法的**入口与路由层**。本技能只回答「怎么启动并运行一次资产生产流程」——生产规则分两层（D43）：**`spine.md` = 跨 Workflow 生产脊柱**（共性执行规则：编排骨架 / read-set 链 / 测试纪律 / 视觉三必做 / 族门骨架 / 新族首例 / 同步机制）；**`workflows/<name>.md` = 生产方法剖面**（方法差异正文）。工程契约在 `docs/procedural-assets/`，现实研究方法论在 asset-research 技能。
>
> 边界：不承载 taxonomy（D22，路由按生产方法不按资产分类）；不得覆盖 AGENTS / DECISIONS / 工程规范（D31 第 10 条）；不含执行模式位与任务排程（D36 第 9 条 / 第 11 条）。与 asset-research 分工闭合：**asset-research = 研究现实对象的方法论；asset-production = 生产程序化资产的方法论**。

## 1. 启动判定

- 触发：①程序化资产立项 / 起草预立任务书时；②读到任务书头部 `workflow: <name>` 声明时（会话确定性加载锚，不赌触发器）。
- 启动校验：任务书 Spec Version 锚点与当前 Reference Spec 一致（不一致开发代理有权打回）；Research Gate 判定留痕在任务书（D26）。

## 2. Workflow 路由（两步化，D43）

**①判生产复杂度 / 生产方法 → ②选 workflow**（无匹配时分裂判据兜底）。生产复杂度仅是路由判据——不建「简单 / 标准 / 完整」全局枚举、不成为流程实体（命名避让 `ProceduralLevel` LOD 档位语义）；复杂资产与轻量资产的差异体现为所选 Workflow 的方法剖面与验收深度（D30 最低可信证据原则）。

| workflow | 正文 | 当前真实消费者 |
|---|---|---|
| （共性规则） | `spine.md` | 所有 workflow 公共基座（D43） |
| `tree` | `workflows/tree.md` | 乔木族（Family 参数位：broadleaf / conifer；复杂方法——完整首例流程） |
| `simple-asset` | `workflows/simple-asset.md` | 轻量简单资产批（静态设施件等——T025 批 A 首例 2026-09-28 创建；轻量方法——轻量但完整首例验收，D30） |

- 无匹配 workflow 时**不预建、不临时发明**：形态域超出既有 Workflow 且无法以参数位 / 局部扩展承载（分裂判据 D36 第 5 条：Step 集合 / Agent 派遣职责面 / 验收结构）→ 回报主代理走立项裁定，新 Workflow 由真实消费者触发（D20.3 同构，不预建——simple-asset 即此纪律首例：T025 批 A 立项时创建）。
- Workflow 文件正文数值零出现（流程参数化，非参数数据库）；Family 差异通过 Workflow 内 Family 参数位承载，不改变公共生产脊柱（Step 集合 / 派遣面 / 验收结构）。

### 新 Workflow 创建纪律（D43）

- 正文 = **方法差异剖面 + spine 引用锚**；禁复制 spine 已载规则（提取完整性：与 spine 逐段 diff 无同文重复）。
- read-set 表仅列该方法真实差异所需（防新 Workflow 长出自己的膨胀 read-set 表）；表格格式与消费链按 spine §2。
- 首例验收深度在 Workflow 内声明（D30 最低可信证据原则——轻量方法 = 轻量但完整的首例验收）。
- 中等等级不预建实体：边界资产（如灌木）立项时按 D36 第 5 条分裂判据裁定路由到既有 Workflow 或新建。

## 3. read-set 消费链（D36 第 6 条）

消费链四环节与表格规范正文 = `spine.md` §2。

派遣路由按 AGENTS.md「多 Agent 按 Step 派遣」（调研 = 通用子代理 · asset-research；几何 / 参数面 / 入口 = procedural-asset-agent；材质 / 深度材质 = park-shader-agent；Stage / DEV 面 = threejs-runtime-agent）；主代理不直接写渲染实现。

## 4. 验收与同步

- **三类变更各归其主载体（D36 第 12 条）**：生产方法规范正文 → Workflow（跨方法共性执行规则 → spine.md，D43）；工程规范正文 → docs/procedural-assets；执行模式裁定 → DECISIONS（需升格的方法 / 规范变更，其决策原因按流程教训评估留痕于 DECISIONS）；**任何一类变更均不得要求批量同步预立任务书**。
- 单资产完成执行所属 Workflow 的同步机制（机制正文 = spine §7：先例 / 知识索引同步〔如该生产方法存在对应索引〕+ 流程教训评估 + 完成记录收口）。
- 工程完成定义 = 项目三重门槛全绿（定义见 AGENTS.md「工程硬约束」，不在此重复）；执行模式按 DECISIONS 当前有效裁定。
