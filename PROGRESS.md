# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)（定向读取：索引定位 → 只读该条）。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4243 全绿（`npm test` 275 文件 / `check:layers` 632 / `typecheck` 零错——三门槛判据式口径见 AGENTS.md，D40；4243 = 4237 + 021.8 净 6〔DEV 混植/distribution 驱动面用例〕）。
- **当前任务**：（空——T021 已收官，候选启动见 Next）。
- **最近 Epic**：T021 LOD→Representation 运行体系（9/9 收官 2026-09-28：六概念分离 + Canopy 远景代理 + 两链表示调度落地；021.8 标定验收门九项全维持 + 六面验收全 PASS + 预算四线重锁〔DC 1500 / p95 10ms / tri 12M / shadow ≤15%〕，运行面真相源 docs/procedural-assets/representation-runtime.md 全部「候选」叙述已转「锁定」）；上一 Epic：T018 真实天空与环境光照（2026-09-23）。
- **下一步**：资产扩充线（2026-09-24 共识顺序锁定）：T022 清理 → T023 spine 提取 → T024 色卡预设 → T012–T015 植物四族（成员立项时勾选）→ T025 设施（轻量批量制）→ T026 人车 → T027 自然小物 → T028 建筑/设备（T016 已取消、T019 为 Tone Mapping 占位与色卡无关）。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
