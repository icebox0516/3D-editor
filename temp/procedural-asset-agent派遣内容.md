你是 procedural-asset-agent，执行 T012.4 白皮松 Step 2 参数化：ConiferShapeProfile 家族契约定稿态实例化 → bungeanaShapeProfile.ts。

## read-set（必读，按序）

1. `D:\3D-editor\.zcode\skills\asset-production\workflows\tree.md` §Step 2（point-read——本 Step 方法正文）
2. `D:\3D-editor\docs\procedural-assets\organization.md` §2–§3（point-read——文件组织与实例化纪律）
3. `D:\3D-editor\src\runtime\procedural\tree\conifer\coniferShapeProfile.ts` **全文**（家族契约定稿态 80 位——本次实例化的对象）
4. `D:\3D-editor\tasks\012.4-bungeana.md` §待裁决位 + §Step 1 判定记档 + §Scope（point-read——**Step 1 判定 12 条是你的结构输入**）
5. `D:\3D-editor\docs\research\bungeana-reference.md` 消费摘要区（point-read——@1.1 终审后口径，数值唯一来源；含「尺度锚」节参数面直采行）
6. 主代理授权扩大（D40）：`D:\3D-editor\src\runtime\procedural\tree\juniperus\juniperusShapeProfile.ts`（point-read——**仅 slot 组织与差量展开语法参照**，组织形式学、数值不抄）

## 交付物

1. `D:\3D-editor\src\runtime\procedural\tree\bungeana\bungeanaShapeProfile.ts`——契约定稿态实例化：
   - 逐字段 **Spec 依据 + Evidence Status + 三标注**（【家族共性候选】/【本资产特有】/【工程设定无现实基准】——工程设定明确标注不编造现实依据）
   - **数值依据全部留本资产 config**（家族契约不落数值——organization.md §3）
   - slot-0 锚 + 其余槽差量；槽差异全部落连续形态参数（伪差异禁止）
   - **结构计数类字段跨槽恒等**（皮面数恒等 + rng 消费次数恒等且无条件消费——消费次数与数据分支无关）
   - **消费差异记档**：契约定稿态 80 位中本资产真实消费/零消费/不适用逐类清点（Step 1 判定的结构差异如何落位；【族内可选】字段消费与否逐个记——族门第四数据点）；**多干双态表达路径评估**（主干链 vs 低位粗枝上举近似 vs 需 D31.2 新字段——给结论与理由）；**年龄皮色轴**（幼灰绿→斑驳→白）在契约现有字段下的承载判定（可承载位 or 消费差异归族门）
2. 参数面自检断言测试 `D:\3D-editor\tests\runtime\procedural\tree\bungeanaShapeProfile.test.ts`（命名与组织对称族先例，按 organization.md §2）：模块头算术摘要 vs 数据行一致性断言 + 拓扑展开断言（皮面数等跨槽恒等）——拦截笔误类缺陷

## 关键初值（Step 1 判定 + Spec 承重锚）

- slot-0 锚 = 开阔公园中龄开张卵圆型单干 ~11–12 m / 冠幅比 ~0.8–0.9 / 裸干比 ~0.3 / 干基膨大 ≤1.3 / 冠形谱系（宽塔幼态→开张卵圆→伞形平顶老端）
- 束聚合卡：卡尺度初值 **0.24–0.32 m 带**起步（族内最新终值带）；束真实尺度 5–10cm×1.5–2mm、3 针 15–45° 扇形、束间距 ≈针长 1/3–1/2、螺旋排列
- 密度类初值从 M25 冠带绿终值带 33.0/34.3% 起步（**疏散冠 caveat 附注**——Spec 承重半透光疏散结构，低于带不必然缺陷）
- 骨架 = 散生连续冠（层位字段退化消费——012.3 路径直承，高 tier 密度 + tierGapBand 0 + 大 jitter）
- 果账目 = 双态低量近景点彩级（一年生绿幼果主导 + 少量近熟淡绿-黄褐）；雄球花不做
- LOD 预算行 = 已锁 conifer 行（High ≤40000 / Mid 6000–10000 / Low 1500–3000 / Canopy ≤500）

## 硬边界

- **不碰**：coniferShapeProfile.ts（消费差异只记档报告，不改契约文件——D31.2 阻塞级需求报主代理留痕裁定）、cedrus/metasequoia/juniperus 全部文件、broadleaf、Geometry/Materials/Stage（后续 Step 的事）
- 面数/预算字段按 lod-spec 已锁行声明（不实测——实测归 3a/3c）
- 完成后可跑：`npx vitest run tests/runtime/procedural/tree/bungeanaShapeProfile.test.ts` 自验 + `npm run typecheck`（允许新增文件自洽）

## 回传格式（压缩：usage 时长 + 计数表 + 结论为主）

1. 用时
2. 计数表：契约 80 位消费清点（真实消费 N / 零值消费 N / 不适用 N）/ 三标注分布 / slot 数 / 自检断言条数与结果
3. 关键结论：多干路径评估结论 / 年龄皮色轴承载判定 / 消费差异要点（新增需求字段有无——D31.2 候选清单）/ 与 012.3 消费面对比一行
4. 交付文件路径 + 行数 + 自验结果