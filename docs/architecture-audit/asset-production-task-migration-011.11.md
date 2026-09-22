# asset-production 任务书迁移审计 —— 011.11 女贞（试点）

> 一次性迁移证据（DECISIONS D36 落点），不是长期生产文件。作用：证明旧任务书模板每一字段的信息在新模型（lean Task + workflow + docs + precedent index）中无丢失；每种结果三选一——**→ lean Task / → Workflow·docs·precedent / → 废弃（注明依据）**。
> 迁移对象：`tasks/011.11-ligustrum.md`（D35.1 还原版 → D36 lean 版）。基线 commit：4c15a0a（Commit A 架构层）。

## 字段映射表

| # | 旧字段（D35.1 版） | 内容 | 去向 | 说明 |
|---|---|---|---|---|
| 1 | 头部归属/状态/前置/D34 注记 | 本树事实 | → lean Task 头部 | 原样保留；新增 `workflow: tree` 与 `spec: @1.0` 两个声明字段（D36 第 4 条加载锚） |
| 2 | Goal 流程链句（Research Gate → Spec → 契约实例化 → 几何/材质/8槽/LOD/Shadow → D30 增量视觉验证） | 流程复述 | → 废弃（workflow §2 生产脊柱承载） | D36 第 4 条：不复制稳定生产流程 |
| 3 | Goal 身份句（常绿第二例/革质/花果/长江以南） | 本树差异 | → lean Task §Goal | 保留；先例口径引用改指 precedent index |
| 4 | Research Gate 判定（命中情形①②⑤） | 本树法定留痕 | → lean Task §Research Gate | 逐树独立判定是任务书事实状态，非方法论（grilling Q7 裁定） |
| 5 | Research Gate 执行细则（asset-research 技能/硬数值抽查 ≥12 条/照片双问 008.6 规程/分歧取中庸/Spec Version 校验） | 流程复述 | → Workflow §Step 0 + asset-research/references/photo-verification.md | photo-verification.md 为本轮新增落点（D36 第 7 条） |
| 6 | Step 0 骨架要求（八节骨架/plant 域扩展/两轴标注/来源路由） | 流程复述 | → workflow §Step 0（指针到 asset-research spec-template/plant-schema） | 数值（抽查条数下限）随流程正文迁入 workflow，不再逐书复制 |
| 7 | Step 0 重点调研面（女贞九条：种定名/常绿性/革质叶/花/核果/冠形体量/树皮/枝姿/叶色 + FRPS 61:153/FOC Vol.15 卷页锚） | 本树特有调研检查单 | → lean Task §重点调研面 | 全量保留——真正树种特有的信息 |
| 8 | Step 1 结构分析（先例基线对照/可继承/改写/Unknown + 革质路径判定 + 花果路径判定） | 流程 + 本树裁决位 | 流程 → workflow §Step 1；本树裁决项 → lean Task §待裁决位 + §先例基线 | 先例检索入口改指 precedent index（camphor 行） |
| 9 | Step 2 参数化（BroadleafShapeProfile 填值/逐字段三标注/计数恒等/slot-0 锚 + 文件路径） | 流程复述 + 文件集 | 流程 → workflow §Step 2；文件路径 → lean Task §Asset Scope | 数值纪律（三标注/恒等）属方法正文，迁 workflow |
| 10 | Step 3 几何/材质/DEV 三段（方法复制 + 女贞算法细节 + LOD 三档 + meta 契约 + Stage 同构 + VIEW_TARGET_Y + 缺口 D） | 流程复述 + 派遣路由 | → workflow §Step 3a/3b/3c + §4 read-set 表 | 女贞特有要点（革质 specular 档位 vs 香樟校准值、常绿密度沿先例）已由 §Goal 身份句 + §待裁决位承载 |
| 11 | Step 4 视觉验证（三必做 + 疑点触发 + 校准两轮封顶） | 流程复述 | → workflow §Step 4 | 女贞疑点专项（光泽读向/密度读向 vs 香樟/花果可见性）→ lean Task §Acceptance |
| 12 | 测试（对称 platanus 五件组织） | 流程复述 + 文件集 | 流程 → workflow 测试节；文件集 → lean Task §Asset Scope | 分件类别（Structure/Lod/ShapeSlots/Materials/Stage）为家族先例组织惯例，workflow 表述为「分件组织对称家族先例」 |
| 13 | 验收基线（预算 = 家族行 High ≤40000 / Mid 6000–10000 / Low 1500–3000；先例与 GLB 零变化） | 工程契约引用 | → workflow §1 Family 参数位 → lod-spec §5.2 | 数值本体在 lod-spec 家族预算行（唯一事实源），任务书不再复述数值（D36 数值纪律） |
| 14 | Acceptance 三门槛行（基线 3245 零回归） | 实例参数 | → lean Task §Acceptance，**数值修正为 3689/566/零错** | 旧值 3245 为 011.6 时代基线，011.7–011.10 逐树累积后已过时（迁移时发现的复述层过时实例，与 D36 背景「epic 异系统交叉漂移」同型——复述必腐） |
| 15 | Acceptance D30 三必做 / Spec 终审 / 缺口记档 | 流程复述 + 本树重点 | 流程 → workflow §Step 4；本树终审重点（证据中档轴）→ lean Task §Acceptance 保留 | |
| 16 | Constraints 通用四条（不扩 ProceduralBuild / D19 契约第一锁 / 每次 build 全部 new / 家族契约默认零触碰 + D31.2 阻塞例外 / 不碰先例·tree3a·GLB·家族契约·T006） | 通用契约红线 | → workflow §1/§3 + epic 族级契约规则（epic 瘦身后保留节） | 「不碰先例清单」属族级规则，归 epic（本轮 epic 瘦身在审核后续步执行，迁移如实记录该暂态） |
| 17 | Constraints 参考图（ref-tmp/ref-ligustrum-*.jpg 不进 git/运行时） | 通用边界 + 本树命名 | 边界 → workflow §Step 0；命名惯例 → lean Task §Constraints 保留 | |
| 18 | Constraints 主代理不写渲染 / 视觉裁定机器判定 | 项目级规则 | → AGENTS.md（已存在）/ workflow §Step 4 | 不复制 |
| 19 | Constraints 女贞特有（常绿语义沿 011.2 口径 / 花果按 Spec 判定记档） | 本树特殊约束 | → lean Task §Constraints | 保留 |
| 20 | 完成记录（待填） | 状态位 | → lean Task §完成记录 | 附 D36 第 10 条语义规则提醒（记结果与偏离，不重复方法论） |

## 废弃项汇总（均注明依据）

- Goal 流程链句、Research Gate 执行细则、Step 0–4 全部流程形状、派遣路由、测试组织流程、验收基线数值复述、通用 Constraints——依据：D36 第 4 条（不复制稳定生产流程）+ 第 2 条（workflow 为流程正文唯一落点）。
- 旧书无「历史废止规则复活」情形（011.11 为 D35.1 还原版，无 X4000 预期条、无异系统交叉条——该两项仅存在于 011.8–011.10 done 书，属历史不回改范围）。

## 数值修正项

- 三门槛基线：3245（旧，011.6 时代）→ **3689 / 566 / typecheck 零错**（011.10 done 后现值）。

## 迁移后校验

- 旧模板信息无丢失：上表 20 项全覆盖，无「未去向」项。
- 新模板新增字段：`workflow: tree`、`spec: @1.0`、§先例基线（precedent index 指针）、§Asset Scope、§待裁决位——均为 D36 裁定结构。
- 本文件后续 011.12 迁移可引用本表结构，不逐字段重复展开（迁移方法已定档）。
