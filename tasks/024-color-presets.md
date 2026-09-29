# T024 资产色卡预设

> 状态：**done（epic 收官 2026-09-28）**：立项 done 2026-09-28（D44）；024.1–024.4 done 2026-09-28；**024.5 验收门 done 2026-09-28——五面全 PASS**（契约收口 / 横向一致性〔Contact Sheet + 干区 11/11〕/ 资源与性能〔共享断言 + 混卡包络——DC 重锁 2000·D45〕/ 回归〔跨构建 13/13 逐位 + 存量场景〕/ 冒烟〔六用例〕），裁决 = D44 + **D45**（fade-out 定性更正与修复语义 / DC 重锁 / p95·shadow 双卡包络档 / 场景域像素口径）｜ 前置：T011 收官（✅ 13 乔木基线资产库）+ T021 收官（✅ representation 缓存键体系）｜ 非程序化资产生产任务（公共能力扩展 + 存量回补）——无 `workflow:` 声明（色卡回补只动材质层不走生产 SOP；缺证相补证时按 asset-research 技能补 Spec 增量）；Research Gate 豁免（非新资产：色卡现实事实源 = 既有 13 份 Reference Spec 季相记录，立项核实 13/13 有叶色基调记录，D26 不触发，豁免记档于此）｜ **裁定真相源 = DECISIONS.md D44 + D45**（执行时不再复议）。

## Goal

激活 D19.2 preset 协议扩展位为**材质基调色卡**（冠变干不变）：声明契约（meta `presets` 必填）+ 缓存几何跨卡共享 + 13 乔木全量回补（色卡以各 Spec 季相记录为证据）+ 浏览器名旁色点切换 + 手动放置带 preset + 配方 schema 预留位。默认卡 = 现行材质基调——**回补是纯增量，存量场景观感零变化**（硬回归断言）。instanceColor 继续管 hueJitter 群内微差（与色卡正交，机制零改动）。

## 待裁决位（D44 已裁定，执行时不再复议；差异摘要不复述全文）

- preset 语义 = 材质基调变体（冠变干不变、不动树皮、不改结构）；D19.4 sourceKey preset 段收窄为色卡位；默认卡 id 全资产统一 `'default'`
- 硬钩子双钩：meta `presets: readonly AssetColorPresetMeta[]` 必填（空数组 = 显式无卡）+ 契约测试整表锁（13 树清单 / 卡 id 唯一 / 乔木族非空）；公共 meta 只放 `{id, label, swatch}`，色值配方归各树材质工厂私有域
- preset 进 sourceKey（分桶硬要求）；geometry 与 customDepthMaterial 按「无卡 sourceKey + representation」跨卡共享、引用计数释放（D17「每次调用 new 全部资源」条款窄化——主 material 仍按条目私有新建）；缓存不淘汰维持；DC 典型混卡包络 ≤1500
- `AssetReference.preset?`（默认卡省略不落盘，旧场景零迁移）；Inspector 换卡不在本期（增补位）
- `ScatterAssetWeight.preset?` 预留位；散布链不接、消费归散布任务
- 无证据不建卡（每树至少 default 卡；季相卡逐树按 Spec 证据定）；跨树同相卡 id 同名，id 域 024.2 首批定稿记档
- Ghost 带卡（所见即所得）；缩略图不随卡重渲（swatch 数据色点）

## Requirements

- 子任务一会话一个（D16）；执行路由按 AGENTS「多 Agent 按 Step 派遣」：缓存共享机制 / 放置链 preset 流 / 序列化接线 → threejs-runtime-agent；树材质工厂 preset 参数化（试点与回补批的材质侧）→ park-shader-agent；契约测试 / 色卡数据声明 / 文档 → 主代理与通用子代理；UI（024.4）先读 frontend-design 技能。
- 声明面规范增量随子任务落地：`metadata-taxonomy.md` 增 presets 字段节（024.1）、`lod-spec.md` sourceKey/缓存条款 preset 段修订（024.1）。
- 各植物族 / 车辆 epic 立项时在族门清单承接「presets 非空断言」（typecheck 必填已全局生效；族级断言不预防性泛化，D30）。
- 卡色值证据锚：色值参数注释逐卡引 Spec 条目（同资产数值注释纪律）；补证走 asset-research → Spec 增量版本升级，开发 Agent 开工前核对任务书 Spec Version 与当前一致（D26 口径）。

## Scope

- 预期触碰：`src/domain/assets/`（AssetDescriptor / AssetReference / 契约测试）、`src/domain/scatter/recipe.ts`（预留位）、`src/runtime/procedural/`（types 注释 / ProceduralSourceCache / CanopySourceCache 共享接线 / 13 树材质工厂 + 18 资产 meta 声明）、放置链与 Ghost（preset 注入）、`src/ui/panels/ContentBrowser.tsx` + browserModel（色点 UI）、`docs/procedural-assets/` 两规范增量、`tests/`（新整表锁 + 缓存/序列化测试扩展）。
- 不碰：散布份额消费（T003 域，冻结）、Inspector 换卡（增补位）、representation 调度语义与阈值（T021 锁定域）、T018 环境 / Shadow Camera / three 版本、树几何生成器（冠变干不变——几何零改动）、instanceTint / instanceColor 通路（正交维持）。

## Acceptance（epic 级——024.5 验收门执行）

- 契约收口：presets 整表锁全绿；typecheck 闸生效（必填字段层证明）；卡 id 域记档。
- 横向一致性：13 树 × 全卡 Contact Sheet（统一基线帧，逐卡可辨）；冠变干不变（像素断言：干区跨卡一致）。
- 资源与性能：同树跨卡 geometry 同引用 + customDepthMaterial 同引用 + programs 不增 + 切卡不重建几何；典型混卡包络（13 树各 default + 1 季相卡、混植 2000）DC ≤1500、p95/tri/shadow 四线不破（T021.8 预算）。预算行为立项口径——收官实测 DC 1677 / p95 12.4ms / shadow 56.4% 三线按原文不达，经 **D45 #2/#3** 收口（DC 重锁 2000 + p95/shadow 单卡口径维持·双卡包络档记档；tri 10.96M PASS），证据 = 024.5 完成记录 + `docs/acceptance/T024/024.5/perf-mixed/`。
- 回归：**默认卡基线帧与现状逐位一致**（13 树）；存量场景（无 preset 对象）保存重载渲染逐位一致；三门槛按 AGENTS 判据式口径。
- 冒烟：色点切换 / 放置带卡（Ghost 所见即所得）/ 撤销重做 / 保存重载保真 / 已删卡 id 场景宽容回退 default。

## Constraints

- 默认卡零变化红线：13 树 default 卡 = 现行材质配方逐位一致（回补只增不改；材质工厂 preset 参缺省 = 现行行为）。
- 材质工厂导出签名冻结的扩展 = 追加可选参（向后兼容，13 树导出签名现状见各 asset 文件头注释）。
- 测试面授权：新增 presets 整表锁 / 缓存共享 / 序列化 preset 透传测试；既有测试仅因必填字段与签名扩展的机械适配而改，逐条记档于子任务完成记录。
- check:tasks 口径：待裁决位写差异摘要（上文已按此）；024.2/024.3 同法批内不复制。
- 无证据不建卡：卡集设计时 Spec 缺证的相（如部分常绿树秋色）不投机造色，补证或跳过并记档。

## 子任务

- [x] 024.1 契约层 + 缓存几何共享 + 试点树全链（done 2026-09-28：五 Step〔契约/材质/缓存共享/接线/整表锁+规范〕；ginkgo 双卡 default+autumn #d4b737；共享层引用计数落地；4209 全绿——**024.2 注意位**：车辆族（有卡无形态族）须扩 resolvePoolKey〔记 T26〕、试点卡 id 'autumn' 待 id 域定稿、canopy 覆写表回补行随批填）→ [024.1-contract-cache-pilot.md](024.1-contract-cache-pilot.md)
- [x] 024.2 回补批一（done 2026-09-28：6 树真卡〔platanus 黄褐 #a88a44 / koelreuteria 金黄 #d0bc46 / sophora 金黄 #c4a83a / triadica 绯红 #c65e3e / fraxinus 金黄 #c8af3c〔Spec 1.1 补证〕/ salix 黄绿 #789632〔Spec 1.1 补证·弱秋色不造金黄〕〕+ **卡 id 域定稿 {'default','autumn'}**〔试点名保持零改名，taxonomy §2.1 记档〕+ 果序不随卡裁定〔组 0 字面域〕+ 整表锁/canopy 覆写表/批量集成测试〔024.3 只增行〕；4240 全绿）→ [024.2-rebatch-1.md](024.2-rebatch-1.md)
- [x] 024.3 回补批二（done 2026-09-28：批二 4 树真卡〔tree3a 黄褐 #99792b / celtis 黄 #b89c38 / zelkova 橙-铜橙 #c4804a / bischofia 红-红橙 #c57551〔Spec 1.1 补证：红相文献四源裁决 + 与 triadica 三轴分离专项〕〕+ **13 树卡集全量终态收口**（camphor/ligustrum 常绿 default 单卡终态记档，材质文件零 diff）+ Contact Sheet 13 树 × 全卡交付（24 帧 + 拼图 + console 零错误零警告）；4263 全绿）→ [024.3-rebatch-2.md](024.3-rebatch-2.md)
- [x] 024.4 浏览器色点 UI + 放置入口接线（done 2026-09-28：卡片右下色点条〔presets.length>1 才渲染；swatch 数据色 + 琥珀激活环〕+ localStorage 选中持久〔默认卡省略不落盘〕+ 四放置入口注入〔点击/右键 onPick / 拖放 mime / 键 4 重放〕缺省路径逐位一致 + 13 帧冒烟取证〔原记 15 帧，2026-09-28 复核更正〕console 零噪声；4279 全绿）→ [024.4-browser-ui.md](024.4-browser-ui.md)
- [x] 024.5 验收门（done 2026-09-28：五面全 PASS——契约收口〔typecheck 闸现场演示 TS2322 + 整表锁/共享断言面索引〕/ 横向一致性〔024.3 Contact Sheet 消费 + 干区跨卡 11/11 bbox 外零差异〕/ 资源与性能〔混卡 2000 三机位：tri PASS、DC 1677→**D45 #2 重锁 2000**、p95 12.4ms·shadow 56.4%→**D45 #3 双卡包络档记档单卡口径不重锁**；共享引用/programs 不增测试面收口〕/ 回归〔**默认卡 13/13 跨构建（1bc7035）逐位相等且 PNG 字节级全等** + 存量场景保存重载逐位〕/ 冒烟〔撤销重做带卡帧A≡C / 保存重载保真帧D≡E / 已删卡回退帧F≡默认 / 沉降哨兵场景域口径 D45 #4 / 024.4 证据消费〕；**附带交付**：fade-out 静止冻结诊断修复〔定性翻案 T021.3 设计缺口基线同现 + 池层墙钟收敛 +2 测〕+ DEV 取证面〔seekTo/freezeTime/presets +10 测〕；4291 全绿）→ [024.5-acceptance.md](024.5-acceptance.md)

依赖链：024.1 → 024.2 → 024.3 → 024.4 → 024.5。024.4 仅依赖 024.1（可提前开发），但排 024.3 后吃全量真卡数据冒烟；024.2/024.3 文件集为各树私有目录、可并行——主代理按带宽裁定（整表锁文件 024.2 落位后 024.3 只增行）。

## 完成记录

（epic 立项 2026-09-28：D44 八项裁定 + 本任务书 + TASKS/PROGRESS 同步；纯文档零代码，npm test 判据不触发〔D40〕，layers/typecheck/check:tasks 见提交记录。）

（**epic 收官 2026-09-28**：024.1–024.5 五子任务全会话完成；验收门五面全 PASS（逐面证据 = 024.5 完成记录 + `docs/acceptance/T024/024.5/`）；两附带交付 = fade-out 静止冻结修复（D45 #1，T021.3 设计缺口非 T024 回归）+ drawCallBudget 重锁 2000（D45 #2）；遗留消费方 = 散布链 fade-out 随动〔T003〕/ 双卡包络档〔混卡性能判读〕/ 车辆族 resolvePoolKey〔T026 立项必答〕/ Inspector 换卡〔增补位〕。）

（**2026-09-28 复核更正**：T024.3–024.5 双轴复核（工程标准 / 需求对照）——功能与实现零缺陷、三门槛复核实测全绿（4291 / layers 631 / typecheck 零错）、代码面零改动；更正三处纯记账——① 本 Acceptance 预算行补 D45 #2/#3 收口注（立项口径原文保留）；② 024.4 冒烟证据形态更正实数（13 帧、断言值内联 README——原记「15 帧 + 三批断言 JSON」）；③ 024.5 Goal/Scope 补 D45 附带交付偏离记注。）

（**2026-09-28 复核代码清理**（用户授权，接上条复核）：修入三条工程面发现——① fade-out 退场带公式 domain 单源化（`transition.ts` 导出 `fadeoutBandProgress`，stepTransition 与池层静止补偿同源消费；池侧局部 clamp01 删净，f→m 补偿逆映射留池侧记注——D45 #1 语义零变化）；② budgetAlert 缺省告警文案去「= 2000」硬编码（只消费运行时 budget，重锁史留模块头注）；③ 放置色卡三入口读法收拢 `toolIA.placementPresetOf`（App 点击 / input 键 4 / 垂直条放置钮同源，零行为红线逐位不变）。裁定跳过两条并记档理由：存储写失败时 UI 态与放置读数的边缘不一致 = 024.4 待裁决位「沿收藏先例」已记档取舍非缺陷；各树材质 preset 解析器两行同型 = D44 试点法逐位复制既定纪律，不为两行表达式引入跨树耦合。路由 = ①② threejs-runtime-agent / ③ 通用子代理，纯重构零新增测试、既有测试零改动；三门槛复跑全绿（4291 / layers 631 / typecheck 零错；check:tasks 55 持平）。）
