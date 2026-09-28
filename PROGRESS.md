# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)（定向读取：索引定位 → 只读该条）。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4209 全绿（`npm test` 278 文件 / `check:layers` 630 / `typecheck` 零错——三门槛判据式口径见 AGENTS.md，D40；4209 = 4159 + T024.1 净 50〔材质 +7 / 缓存共享 +7 / 池·放置·Ghost·序列化 +23 / 整表锁 +6 / 全链集成 +2 / 机械适配内含〕）。
- **当前任务**：T024 资产色卡预设（024.1 done 2026-09-28：契约层〔presets 必填 typecheck 闸 + 整表锁双钩〕+ 缓存几何/深度跨卡共享〔引用计数，D17 窄化〕+ ginkgo 试点全链〔default + autumn #d4b737，冠变干不变，program 不增〕+ 池/放置/Ghost/序列化接线 + 两规范增量；下一 = 024.2 回补批一 6 树 + 卡 id 域定稿）。
- **最近 Epic**：T021 LOD→Representation 运行体系（9/9 收官 2026-09-28：六概念分离 + Canopy 远景代理 + 两链表示调度落地；021.8 标定验收门九项全维持 + 六面验收全 PASS + 预算四线重锁〔DC 1500 / p95 10ms / tri 12M / shadow ≤15%〕，运行面真相源 docs/procedural-assets/representation-runtime.md 全部「候选」叙述已转「锁定」）；上一 Epic：T018 真实天空与环境光照（2026-09-23）。
- **最近任务**：T023 生产脊柱 spine 提取（2026-09-28）：workflow 体系升级「spine + 方法剖面」两层（spine.md 共性规则新建 / tree.md 剖面化 / SKILL 路由两步化 + 新 Workflow 创建纪律 / AGENTS 新族首例句式 P0 同步）——D30 最低可信证据原则 + D36 边界句经 D43 一次记档（纯文档零代码，`.zcode/` 本地私有）。
- **最近任务**：T024 色卡预设立项（2026-09-28）：preset 收窄定型 = 材质基调色卡（冠变干不变，D19.2 子句激活废止）；硬钩子双钩（meta presets 必填 + 整表锁）；sourceKey×preset = 进键分桶 + 几何/深度材质跨卡共享；默认卡零变化红线。
- **下一步**：T024 执行（024.2/024.3 回补两批 → 024.4 色点 UI → 024.5 验收门〔Renderer 装配闭包端到端冒烟与视觉证据归此〕）→ 资产扩充线（2026-09-24 共识顺序锁定）：T012–T015 植物四族（成员立项时勾选；各族族门承接 presets 非空断言〔D44〕）→ T025 设施（轻量批量制，首例批次触发 simple-asset workflow 创建——引用 spine 只写差异剖面）→ T026 人车（车辆复用 preset 车身色——**有卡无形态族须扩 resolvePoolKey，记 T026 立项必答**）→ T027 自然小物 → T028 建筑/设备（T016 已取消〔T022/D42〕、T019 为 Tone Mapping 占位与色卡无关）。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
