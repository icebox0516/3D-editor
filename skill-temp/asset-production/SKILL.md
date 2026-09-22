---
name: asset-production
description: 程序化资产生产方法入口与流程编排：启动判定 → Workflow 路由 → read-set 指引 → 验收条款。程序化资产立项 / 预立任务书时，或任务书头部声明 workflow: <name> 时加载。不含资产知识与工程契约正文（归 docs/procedural-assets 与各 Workflow 文件，D36）。
---

# Asset Production

> 定位（DECISIONS D36）：程序化资产生产方法的**入口与路由层**。本技能只回答「怎么启动并运行一次资产生产流程」——完整生产流程正文在 `workflows/`，工程契约在 `docs/procedural-assets/`，现实研究方法论在 asset-research 技能。
>
> 边界：不承载 taxonomy（D22，路由按生产方法不按资产分类）；不得覆盖 AGENTS / DECISIONS / 工程规范（D31 第 10 条）；不含执行模式位与任务排程（D36 第 9 条 / 第 11 条）。与 asset-research 分工闭合：**asset-research = 研究现实对象的方法论；asset-production = 生产程序化资产的方法论**。

## 1. 启动判定

- 触发：①程序化资产立项 / 起草预立任务书时；②读到任务书头部 `workflow: <name>` 声明时（会话确定性加载锚，不赌触发器）。
- 启动校验：任务书 Spec Version 锚点与当前 Reference Spec 一致（不一致开发代理有权打回）；Research Gate 判定留痕在任务书（D26）。

## 2. Workflow 路由

按「生产方法」路由，不按资产分类：

| workflow | 正文 | 当前真实消费者 |
|---|---|---|
| `tree` | `workflows/tree.md` | 阔叶乔木族（Family 参数位：broadleaf） |

- 无匹配 workflow 时**不预建、不临时发明**：形态域超出既有 Workflow 且无法以参数位 / 局部扩展承载（分裂判据 D36 第 5 条：Step 集合 / Agent 派遣职责面 / 验收结构）→ 回报主代理走立项裁定，新 Workflow 由真实消费者触发（D20.3 同构）。
- Workflow 文件正文数值零出现（流程参数化，非参数数据库）；Family 差异通过 Workflow 内 Family 参数位承载，不改变公共生产脊柱（Step 集合 / 派遣面 / 验收结构）。

## 3. read-set 消费链（D36 第 6 条）

```
Workflow 定义各 Step 必读集 → 主代理解析为 resolved paths
  → 派遣简报只传 resolved paths → 专业代理自读正文
```

派遣路由按 AGENTS.md「多 Agent 按 Step 派遣」（调研 = 通用子代理 · asset-research；几何 / 参数面 / 入口 = procedural-asset-agent；材质 / 深度材质 = park-shader-agent；Stage / DEV 面 = threejs-runtime-agent）；主代理不直接写渲染实现。

## 4. 验收与同步

- **三类变更各归其主载体（D36 第 12 条）**：生产方法规范正文 → Workflow；工程规范正文 → docs/procedural-assets；执行模式裁定 → DECISIONS（需升格的方法 / 规范变更，其决策原因按流程教训评估留痕于 DECISIONS）；**任何一类变更均不得要求批量同步预立任务书**。
- 单资产完成执行对应 Workflow 的同步机制（先例 / 知识索引同步〔如该生产方法存在对应索引〕+ 流程教训评估 + 完成记录收口）。
- 工程完成定义 = 项目三重门槛全绿（定义见 AGENTS.md「工程硬约束」，不在此重复）；执行模式按 DECISIONS 当前有效裁定。
