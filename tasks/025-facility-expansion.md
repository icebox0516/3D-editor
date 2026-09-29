# T025 园区设施扩充

> 状态：**in-progress（立项 2026-09-28；批 A done 2026-09-29）**——批 A 首例批次收官（simple-asset workflow 首例验收成立）；收官门未至，可持续增补 ｜ 前置：T002.4 设施五件先例（批量制 + facilityMaterials 配方体系）/ T022 资产库清理（浏览器一行大分类终态）/ T024 presets 体系收官（设施空数组合法态 + preset 消费链全链可用）｜ 候选与批次切分真相源 = `docs/research/facility-device-candidates.md` §1/§3（规划级枚举，逐资产立项时过 Research Gate，D37）｜ 生产方法 = asset-production **`workflows/simple-asset.md`**（本立项时由首例批次触发创建——D36 第 5 条真实消费者触发 + D43 创建纪律）｜ 裁定真相源：D33（批次集合口径同构）/ D30+D43（验收分层与最低可信证据）/ D40（Lean Task 与测试纪律）/ D44（presets 出生即带）。
>
> 本文件口径（D24 / D36 瘦身）：只维护批次清单、立项必答裁定、勾选表与收官门口径——生产流程正文归 workflow，完成详情归各子任务书完成记录。

## Goal

园区设施资产扩充：以**批**为单位（同方法轻量件一会话一批，T002.4 先例）生产 `docs/research/facility-device-candidates.md` §3 推荐批次——交通静态批 A（六件，首例批次兼 workflow 首例）→ 休憩批 B → 设备批 C → 消防小件批 D → 道闸（中等·独立子任务）；全部走 simple-asset workflow 全链（合并 Spec Research Gate → 几何+入口 → 材质配方 → 接线验收），epic 末收官门对执行时点全部已交付批次做混合场景 / 资产库呈现 / 回归收官（不重跑单批已完成项，D30/D31）。

## 立项必答裁定（TASKS 占位行遗留两问，2026-09-28 收口——执行时不再复议）

1. **批次 Spec 口径 = 一批一合并 Spec + 批内逐资产 Gate 留痕**：每批一份 `docs/research/<batch-slug>-reference.md`（Spec Version 头 + 逐资产独立节：身份/识别特征 + 硬数值锚 + 材质相），Gate 判定逐资产独立留痕任务书。依据：TASKS T025 建议案采纳（同域轻量件调研面高度重叠、批级来源复用）；T002.4 为 pre-Gate 时代先例不可直接沿用（候选文档口径明示）。主代理终审走 simple-asset workflow §Step 0 轻量口径（非树族 D38 档）。
2. **category 值收敛策略 = 现状双轨即终态**：程序化设施 **`meta.category: 'facility'` 单栏**（UI 一行大分类行为不变，D23.4 / T022 终态）；细分走 `taxonomy.family`（既有三值 public-facility / road-facility / fire-safety——粒度与 GLB models 目录对齐，值域/配对/归类三闸整表锁既有，metadata-taxonomy §4）；GLB 侧维持「目录 slug 即分类」（manifest 不动，§6 策略记档）。两维正交（category 管浏览器分栏、taxonomy 管归类可测试性，D22/T010.2）即设计答案，不另建收敛机制；新 family 值按 metadata-taxonomy §7 扩展流程（消费者证据先行）。

## 批次清单与增补规则（D33 同构 · 当前批次唯一维护点）

| # | 批次 | 子任务 | 成员（候选文档 §3） | 路由 | 状态 |
|---|---|---|---|---|---|
| A | 交通静态 | 025.1 | 防撞柱 / 人行护栏段 / 道路隔离栏 / 停车挡车器 / 交通锥 / 减速带 | simple-asset | done（2026-09-29） |
| B | 休憩四件套 | 025.2 | 花箱 / 休闲桌 / 遮阳伞 / 自行车架（§1.3 变体系经用户确认后可搭批） | simple-asset | pending |
| C | 设备 P1 批 | 025.3 | 监控摄像头 / 交流充电桩 / 井盖（直流快充若判中等独立立项） | simple-asset（届时按 D36 §5 复核） | pending |
| D | 消防可视小件批 | 025.4 | 疏散指示灯 / 声光报警器 / 手报 / 灭火器（箱装）/ 消火栓变体 | simple-asset | pending |
| — | 道闸（静态版） | 025.5 | 道闸（直杆/栅栏杆；开合动画联动 T005） | 中等·独立子任务（不混批） | pending |
| — | 收官门 | 025.6 | —（编号随批次顺延恒为最后一环） | — | 占位 |

- **增补规则**：收官门前新批次 = 子任务号顺延插入 + 本清单加行（既有编号不重排）；收官后追加按 D33.7 增补轮。留池项（候选文档 §4：凸面镜/车位锁/树池篦子/廊架等）经用户裁定后回填或删除，未裁定不立项。
- **准入判据**：候选文档 §1/§3 域内设施件 + 轻量复杂度（simple-asset workflow §1 适用判定通过）；活动件/动画语义（道闸外：车位锁等）记 T005 联动，静态版先行。

## Requirements（批级口径；流程正文归 workflow，不在此复制）

- 逐批 Research Gate 与 Spec Version 开工校验（D26）= workflow §Step 0（合并 Spec 口径见立项必答裁定 1）。
- **presets 出生即带（D44 承接）**：设施件空数组 = 显式无卡（合法态）；有材质基调变体证据的资产建卡（首个消费者 = 交通锥 红/黄，025.1）——卡 id 域增补按 metadata-taxonomy §2.1 记档同步 + EXPECTED_PRESETS 整表锁。
- **表示链（T021 体系）**：缺省单档 'high'（levels/representations 不声明——parkbench 先例）；面数记档归模块头（streetlamp 先例，设施无 §5.2 家族预算行）。
- 视觉验收分层（D30/D43）：首例批次 = 轻量但完整首例验收（Contact Sheet 批级 + 逐资产身份结论 + 冒烟）；后续批次同口径增量；epic 末收官门集体验收。
- 测试纪律（D40 五者准入）：整表锁/计数表扩充零新增文件；新测试对应新增语义（新配方 / 色卡消费新面）。
- **id 避让**：统一注册表跨 kind 共享命名空间（GLB 先注册者胜）——立项时对照 manifest 校验，撞名即避让改名（parkbench/streetlamp 先例）。

## Scope

- 每批预期触碰：`src/runtime/procedural/assets/<name>.asset.ts` ×N + `docs/research/<batch-slug>-reference.md` + `docs/acceptance/T025/<子任务>/`；批级共享面增行：EXPECTED_TAXONOMY / EXPECTED_PRESETS / phase1 注册清单与计数 / metadata-taxonomy §5 表 / facilityAssets 表行 / facilityMaterials 配方与测试（新配方时）+ `precedents/simple-asset.md`（首例批次首建，批级行）。
- 不碰：树族（broadleaf/conifer）资产与家族契约、BroadleafCanopyProxy、Runtime 调度侧（T021 锁定域）、T003 散布、GLB 管线、three 版本、公共管线代码（零管线改动先例 T002.4——纯资产文件 + 既有契约接线）。

## Acceptance（epic 级，收官门执行——不重跑单批已完成项，D30/D31）

验收对象 = 执行时点全部已交付批次；family-specific 项（本 epic 定义）：

- 混合场景收官：全部新批资产 + 既有设施五件 + 乔木跨域同场检视（设施×植物混植 = 园区运营态语境）
- 资产库呈现：facility 栏分组完整、缩略图正确、色点 UI（有卡资产）行为正确
- 契约收口：整表锁含全部新行（taxonomy/presets/注册计数）、id 域增补记档齐、无证据建卡零发生
- 预算与性能：全部新资产面数账目落模块头 + 10 万实例面数纪律复核（批级实测）
- 回归三门槛全绿；树族与 GLB 零变化

## Constraints

- 一批一方法、一批一子任务（D16 会话粒度）；中等件（道闸、直流快充若判中等）独立子任务不混批。
- 动画语义静态版先行（T005 联动记档）；带活动件候选不因静态版丢失动画位声明。
- 预算四线不破（representation-runtime §九）；单件面数线由批任务书定档（T002.4 纪律先例）。

## 子任务

- [x] T025.1 批 A 交通静态六件（done 2026-09-29：六件交付 + shapeFamily 缺口发现→修复→验证闭环 + 冒烟/取证/README 落盘，四门槛 280 文件/4348 测全绿）→ [025.1-traffic-static.md](025.1-traffic-static.md)
- （后续批次按批次清单顺延；收官门 = `025.6-acceptance.md` 占位，编号随批次顺延恒为最后一环）

依赖链：批间无硬功能依赖（文件集不相交），按编号串行为审查带宽纪律；025.1 承担 workflow 首例验收 + 先例索引首建，后续批次消费其方法基线。
