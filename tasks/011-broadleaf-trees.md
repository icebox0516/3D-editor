# T011 第一批阔叶乔木（朴树 / 香樟 / 榉树 / 银杏）

> 立项：2026-09-19（TASKS.md 占位转正）。前置：T010 5/5 收官（启动条件确认见 010.5——SOP 六步 + asset-research 技能 + Spec 模板 + 家族契约与预算行 + taxonomy broadleaf 就绪）、T006 5/5 收官（Runtime LOD 调度就绪，族建设放量前调度已验收）。**状态：进行中（2/5，011.2 done 2026-09-20）**。

## Goal

阔叶家族从单实例（夏栎）扩到四树种生产资产：朴树 / 香樟 / 榉树 / 银杏——每树种独立 Reference Spec（D26 Research Gate，**不沿用他树**）+ 阔叶家族契约实例化（数值各自锚定各自 Spec）+ LOD 三档 + Shadow 通道 + 8 槽形态向量全链；SOP 六步（shadow-visual-sop §5）逐树种走全，epic 末统一验收门收官，家族契约按真实缺口增量修订。

## Requirements

- **逐树种 Research Gate 留痕（D26）**：每树种开工前 Gate 判定记入子任务书；四树种均命中强制情形（高真实要求 / 类型显著影响形态 / 资产将成同类生产基准）→ 通用子代理加载 asset-research 技能 → `docs/research/<asset>-reference.md`（Spec Version 头 + Evidence Status 两轴标注 + 来源可追溯；形态材质类事实以真实照片为直接视觉证据）；主代理硬数值独立抽查。**开发 Agent 开工前校验任务书引用的 Spec Version 与当前 Spec 一致**（不一致有权打回）。
- **家族契约实例化（organization.md §3）**：BroadleafShapeProfile 契约字段填各树数值（数值依据引自各自 Spec，夏栎数值不是家族真理）；契约缺口逐树记档，**增量修订统一归 011.5**（不做预防性泛化）；修订连带夏栎逐位零回退（回归锁全过即证）。
- **LOD 三档（lod-spec §7 路径速查）**：家族预算行 broadleaf High ≤ 40000 / Mid 6000–10000 / Low 1500–3000（已锁不重开）；build 透传 `params.level`（缺省 'high'）+ 档间不变量（同 rng 流 / 同骨架决策 / 轮廓体量颜色连续）+ `customProgramCacheKey` 档位唯一 + 深度材质随档成套；meta `levels` 三档 + `triangleCount` = High 实数。**选档 / 切换 / 分块 / 批次一行不写（T006 的）**。
- **Shadow 通道（shadow-visual-sop §1）**：`customDepthMaterial` 成套（SDF alpha 与表面材质共享同一 GLSL 字符串）；产品路径投影 + Ghost 分口径 + dispose 链（缓存/缩略图/舞台）同夏栎先例；多材质网格守卫（皮组恒等 attribute 走实心分支）。
- **8 槽形态向量**：结构计数类字段跨槽恒等（皮面数 / rng 消费次数恒等）；槽差异全部落连续形态参数；伪差异禁止项沿 009.3（仅缩放/仅旋转/仅轻微随机不合格）。
- **视觉验收默认口径（D23.7 默认，不设逐树用户门）**：机器判定（固定机位取证 + 视觉模型核验逐项过检）为判据，用户观感复核窗口开放（008.6/009.7 处置先例，可回溯取证目录重开微调）。理由：方法与视觉基调已由夏栎 T008/T009 验收确立；树种辨识度对照各自 Spec「身份/识别特征」节判定，判据客观化。

## Scope

- 预期触碰（新增）：`src/runtime/procedural/tree/<species>/` 四组（Geometry / Materials / ShapeProfile / Stage）+ `src/runtime/procedural/assets/asset_tree_<species>.asset.ts` 四入口（routes glob 自动收割）+ `tests/runtime/procedural/tree/` 新测试 + `docs/research/` 四份 Spec。
- 家族契约 `tree/broadleaf/broadleafShapeProfile.ts`：各树会话**默认不动**；缺口记档，修订归 011.5。
- 不碰：`tree/tree3a/*` 与 `asset_tree_3a.asset.ts`（零回退基线）、T003 散布功能（冻结）、Runtime 调度侧（T006 已收官）、GLB 路径。

## Acceptance（epic 级，011.5 执行）

- 四树种 × SOP 十项检查单（shadow-visual-sop §2）逐项过（每树固定机位取证落 `docs/acceptance/t011/<子任务>/`）
- 四树性能实测过 §4.3 阈值表（1/20/100/500/1000 棵 ≥60/60/60/45/30 FPS）+ 资源契约五条 + 与夏栎基线同量级
- 家族契约增量修订完成（真实缺口 → 修订 → 夏栎逐位零回退）或显式记档「无缺口」
- 资产库呈现（plant/broadleaf family 分组）+ 混植场景（四树 + 夏栎同场）检视
- 回归三门槛全绿；GLB 与旧资产零变化

## Constraints

- 派发按 AGENTS.md「多 Agent 按 Step 派遣」：调研 = 通用子代理（asset-research 技能）；几何/参数面/入口 = procedural-asset-agent；材质/深度材质 = park-shader-agent；Stage / DEV 面 = threejs-runtime-agent；主代理拆分派遣审查验收，不直接写渲染实现
- D19 契约第一锁不破（seed → shapeSlot → morphRng → sourceKey → Cache → Pool）；ProceduralBuild 公共签名不扩（slot 路由在 build 内）；材质/深度材质每次 build 全部 new
- 参考图仅用于定调/参数制定/开发对照/固定机位验收，不进产品运行时资源与代码契约（D13/D26）；`screenshots/ref-tmp/` 不入 git
- 尺度锚：各树种 Spec 的**中龄公园典型个体**（与夏栎 ≈8m 同语境的可混植量级；具体数值以各自 Spec 为准，不拿夏栎数值换色复用）

## 子任务（2026-09-19 立项拆分，D16 会话粒度——一树一档）

- [x] T011.1 朴树全链（done 2026-09-20 跨日会话：首树方法复制成立——BroadleafShapeProfile 零修改实例化无阻塞缺口；Spec 1.0（含主代理整树补验与硬数值抽查）+ 几何/材质/8 槽/LOD 三档/Shadow 全链 + 十项检查单适用项全过（齿/脉两轮校准 + 离屏探针终判 13.9%）+ 2746 零回归）→ [011.1-celtis.md](011.1-celtis.md)
- [x] T011.2 香樟全链（done 2026-09-20 跨会话：常绿阔叶首个实例——零修改第三实例化再证契约稳定；Spec 1.0 + 全缘 SDF 零齿载波 + 离基三出脉/腺窝（探针实证）+ Step 4b 革质光泽 0.62→0.50 一轮校准 + 十项适用项全过 + 2842 零回归；Step 3 交付后中断、恢复会话 Step 4/4b 收官）→ [011.2-camphor.md](011.2-camphor.md)
- [ ] T011.3 榉树全链（asset_tree_zelkova， vase 形冠/树皮光滑片状剥落）→ 011.3-zelkova.md
- [ ] T011.4 银杏全链（asset_tree_ginkgo，扇形叶/长短枝/冠形最特殊——方法最远端）→ 011.4-ginkgo.md
- [ ] T011.5 T011 验收门（四树十项 + 性能 + 契约增量修订 + 混植 + 回归）→ 011.5-acceptance.md

依赖链：011.1 → 011.2 → 011.3 → 011.4 → 011.5。011.1（首树）承担方法复制与契约缺口发现；后续树按固化流程走（顺序非硬功能依赖——各树文件集不相交，串行执行以维持会话粒度纪律与审查带宽；若 011.1 发现阻塞级契约缺口，先行增量修订再继续）。

## 进度

- 2026-09-19 立项：TASKS.md 占位转正，0/5；011.1 朴树开工（本会话）。
- 2026-09-20 011.1 done（1/5）：朴树全链交付，**方法复制路线成立**（家族契约零修改实例化 = 无阻塞缺口最强证据）；契约缺口三条记档归 011.5（偏冠相干方位偏置字段 / 干长比率字段化 / 冠幅比涌现映射口径——几何 agent 权威记档，见 011.1 完成记录）；跨日会话两起 agent 用量上限中断（材质校准轮编辑已落盘自洽、越权产物主代理覆盖处置——如实记档）；011.2 香樟解锁（常绿阔叶方法复制第二跑）。
- 2026-09-20 011.2 done（2/5）：香樟全链交付（跨会话——开工会话 Step 0–3 完成后意外中断，恢复会话验证/审查/Step 4 视觉/Step 4b 光泽校准/终态全批复拍收官）；常绿语义=密度参数+材质表达（家族无语义位——缺口 A 记档）；新增缺口候选 B 叶族公共 specular/envMap（革质锐高光结构上限）+ C 树皮沟内层次（归 011.5）；视觉核验通道升级记档（emitImage 正斜杠 URL 链路全通 + 中性提问防引导幻觉 + 两例疑读机器否证）；011.3 榉树解锁。
