# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)（定向读取：索引定位 → 只读该条）。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4023 全绿（`npm test` / `check:layers` 604 / `typecheck` 零错——三门槛判据式口径见 AGENTS.md，D40；4023 = 4034 − 11 个跨资产键碰撞逐对 it，已收容进 assetTaxonomy 单遍断言，T020 阶段二）。
- **当前任务**：无在办（T020 任务执行体系收敛（第二批）两阶段均收官 2026-09-23：阶段一 rule 层原子切换〔**D40**：Lean Task + read-set 白名单 + 测试纪律 + 三门槛判据式 + 族门骨架〕；阶段二 code 面〔tests/support/procedural-tree 共享 harness + O(n²) 碰撞断言集中化 + 16 软跳过清除〕）。
- **最近 Epic**：T018 真实程序化天空与环境光照（5/5 收官 2026-09-23）；上一 Epic：T011 阔叶乔木族 13/13 收官 2026-09-23。
- **下一步**：T006.6 Step 3（A/B 实测 + 阈值重锁判定，不阻塞可执行）；针叶族 T012 立项（012.1 雪松家族首例走完整 SOP 口径）。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
