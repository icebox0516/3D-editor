# T021 LOD → Representation 运行体系重构

> 状态：**active（021.0–021.4 / 021.6 done——021.3/021.4 done 2026-09-24；下一步 021.5，其后 021.7 → 021.8）** ｜ 前置：T018 收官（✅ 2026-09-23）+ T011 收官（✅ 基线资产库）+ T006.6 Step 1/2（✅ 稳定基准球基线）｜ 非程序化资产生产任务（Runtime 架构重构）——无 `workflow:` / `spec:` 声明；Research Gate 豁免（非新程序化资产：BroadleafCanopyProxy 从现有 T008/T011 族派生，现实事实源 = 既有各树 Reference Spec，D26 不触发，豁免记档于此）｜ **设计真相源 = `docs/procedural-assets/representation-runtime.md`（D41）**；声明面真相源 = `lod-spec.md` ｜ 编号说明：**T019 为颜色管线任务语义保留**（D29.3 / D39 引用），本 epic 顺延 T021。

## Goal

T006 的 level 统一语义（单链 High→Mid→Low→Culled、几何档位与远景表示混一、密度抽稀绑定档位）已不能承载下一阶段需求。本 epic 以六概念分离（Selection / Representation / Transition / Shadow / Density / Batch）重建 Asset Runtime 表示体系，新增 Canopy Proxy 远景冠层表示，首轮以 T011 阔叶 13 树种库验证。T006 既有交付保留为技术基线，不回滚；T006.6 Step 3 迁入 021.8。

## 待裁决位（D41 已裁定，执行时不再复议；规范正文见 representation-runtime.md 对应节）

- 表示联合第一阶段四值，impostor 不进类型、culled 转提交状态；ProceduralLevel 三值收窄为构建能力语义
- 能力声明驱动有效链：声明面新增独立 representations 字段，levels 三值不污染
- 屏占比解释口径 = 1/m；旧阈值三数仅为对照基线
- 选档粒度：放置逐对象、散布四维（区域×块×资产）；代表 scale 取桶内最大（保守偏高档）
- 过渡分型：高中档间硬切、入 canopy 走 dither、canopy 退场 fade out；阴影过渡中点切换不做双影交叉；双表示桶 DC 增量红线 +30
- canopy 预算 ≤500 面、含简化树干；必须接同一风动体系，aSeed 属性首日声明（散布缺属性按缺省零、与现状逐位一致；D20.4 修复落地后自动生效；禁坐标哈希第三套相位）
- 阴影三字段 cast/receive/depth；canopy 受影初始关闭、归 A/B 复核；Shadow Camera 与 T018 环境全冻结
- 密度默认全表示 100%、与表示解耦；降密度只走 021.8 独立 A/B
- 批次策略绑表示；32m 块与 2×2 稀疏合并第一版保留；draw call 预算 650 降格为 legacy 对照
- 状态体 SelectionState 按粒度实例化、阴影密度为派生视图；缓存键统一 sourceKey+representation、源缓存三分支收敛为二
- 路由出 RepresentationSourceRouter 门面、不重写既有链；Source 契约增 bounds（球形）、Cache 拥有池引用
- 编辑态 pin 集 = 选中 / 变换 / gizmo / 相机聚焦飞行目标；Ghost 与预览沿用固定高档现状；零 Scene 数据改动
- 拾取身份跨表示不变；过渡期可拾取、真剔除后不可拾取

## Requirements

- 六概念完整语义、验收口径、禁止清单（15 条）以 representation-runtime.md 为唯一依据，各任务书不复制。
- 子任务一会话一个（D16）；执行路由按 AGENTS「多 Agent 按 Step 派遣」：运行时调度 / 选档 / 分桶 / 批次 / 接线 → threejs-runtime-agent；共享冠层场契约与 canopy 几何 → procedural-asset-agent；dither×alphaTest 合成 / canopy 材质 / Canopy Depth Material → park-shader-agent。
- lod-spec.md 声明面修订随对应子任务增量落地（021.1 声明字段与枚举条款改写、021.6 预算表 canopy 行、021.7 接缝表与缓存键条款改写）。

## Scope

- 预期触碰：`src/domain/lod/`（类型与策略）、`src/domain/assets/AssetDescriptor.ts`（能力声明）、`src/runtime/`（instancing / scatter / procedural / Renderer / lodReference 接线）、`docs/procedural-assets/` 两份规范增量、`tests/`（语义变更同步改写，见 Constraints 授权口径）。
- 不碰：T018 环境与 Sky、Shadow Camera 常量、three 版本、T003 冻结域（散布 aSeed 修复仍归 D20.4 独立任务）、`tree3a` 零回退基线（021.6 消费侧接入除外）。

## Acceptance（epic 级——021.8 验收门执行，口径 = representation-runtime.md §十四）

- 六概念职责分离落位；远景十项全过；连续相机运动无震荡、无明显 pop、无重复重建；阴影近景真实、远景成本下降、剔除无残影；性能梯队全档（含 2000 与高密度混植）验证；资源生命周期循环零增长；GLB / 旧资产 / Ghost / Preview / 拾取 / 撤销重做 / 渲染模式零回归；三门槛按 AGENTS 判据式口径。

## Constraints

- 测试面授权（D41）：既有 LOD / 迟滞 / 稳定基准 / 键碰撞断言随表示语义变更同步改写属授权范围——T020 R6「66 树测试文件不迁移」指组织等价重构、非语义断言冻结；改写逐条记档于各子任务完成记录。
- check:tasks 对待口径（D41）：任务书待裁决位写差异摘要、不复述规范原文；representation-runtime.md 已入检查参考集，任务书禁用其节标题；新文件预期信号在完成记录记档（report-only 不阻断）。
- 密度默认不降、canopy 受影默认关：二者只经 021.8 A/B 改动，中途子任务不得擅自变更默认值。
- 禁止事项清单 = representation-runtime.md §十五（15 条），不在此复制。

## 子任务

- [x] 021.0 立项与文档迁移（done 2026-09-23）→ [021.0-project-migration.md](021.0-project-migration.md)
- [x] 021.1 Representation 契约层（done 2026-09-23：RuntimeRepresentation 四值 / culled 转提交终态 / representations 声明 / bounds 契约 / 有效链纯函数 / streetlamp 收编，4041 全绿）→ [021.1-representation-contract.md](021.1-representation-contract.md)
- [x] 021.2 Selection Runtime（done 2026-09-23：新链候选阈值 {6,16,60}+band0.15 全候选化 / canopy 名义区间落位 / 有效链输入迁移 / 散布四维粒度核实 + 代表 scale 全集口径收紧，4073 全绿）→ [021.2-selection-runtime.md](021.2-selection-runtime.md)
- [x] 021.3 Transition Runtime（done 2026-09-24：metric 步进过渡状态机 / aFadeOut 属性缝 + 包装几何池 / 两链客座双表示 + Union 剔除 / dither×alphaTest 合成必答题〔A2C 不吃 fade、IGN 镜像互补〕/ 中点切换钩子 / 计数面，视觉冒烟互补公式逐点吻合，4129 全绿）→ [021.3-transition-runtime.md](021.3-transition-runtime.md)
- [x] 021.4 Density / Batch 解耦（done 2026-09-24：levelInstanceKeep 废止 + 密度恒全量接缝 / 批次键迁移 representation / 分布 §十三口径〔transitionTargets + shadowCasterInstances 现值口径〕，low 桶恢复全量 ×2 性能结论归 021.8，4141 全绿）→ [021.4-density-batch.md](021.4-density-batch.md)
- [ ] 021.5 Shadow Representation（**并行裁定 2026-09-23：延后至 021.3 后启动**——与 021.6 在 Canopy Depth Material〔工厂产出 vs 契约消费〕及 Source 契约面文件相交；其验收项「过渡中点切换钩子接通」消费 021.3 产物。仍满足本 epic 并行窗口〔与 021.2–021.4 并行〕，021.6 完成后无产出交叠）→ [021.5-shadow-representation.md](021.5-shadow-representation.md)
- [x] 021.6 Broadleaf Canopy Proxy（done 2026-09-23：共享冠层场契约收编 13 文件 / 统一工厂恒 487 面 / 预算表回写 / 材质+深度材质工厂 drift-lock / 13 树种基线帧取证，与 021.2 并行，4073 全绿）→ [021.6-canopy-proxy.md](021.6-canopy-proxy.md)
- [ ] 021.7 两链接线 + 编辑态 pin → [021.7-wiring-editing-pin.md](021.7-wiring-editing-pin.md)
- [ ] 021.8 标定与验收门 → [021.8-calibration-acceptance.md](021.8-calibration-acceptance.md)

依赖链：021.1 →（021.2 → 021.3 → 021.4 串行；021.5 与 021.6 可与 021.2–021.4 并行）→ 021.7（全前置）→ 021.8（吸收 T006.6 Step 3）。串行为会话粒度纪律默认；文件集不相交的并行对由主代理按带宽裁定。
