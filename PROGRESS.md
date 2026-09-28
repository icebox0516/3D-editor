# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)（定向读取：索引定位 → 只读该条）。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4291 全绿（`npm test` 279 文件 / `check:layers` 631 / `typecheck` 零错——三门槛判据式口径见 AGENTS.md，D40；4291 = 4279 + T024.5 净 12〔DEV 取证面 seekTo/freezeTime/presets 10 + fade-out 静止收敛修复 2〕）。
- **当前任务**：无进行中——**T024 资产色卡预设 epic 收官 2026-09-28**（024.1–024.5 五子任务全 done：契约层+缓存共享+ginkgo 试点 → 批一 6 树 + 卡 id 域 {'default','autumn'} → 批二 4 树 + 13 树卡集终态 + Contact Sheet → 浏览器色点 UI + 四放置入口 → **验收门五面全 PASS**〔默认卡 13/13 跨构建逐位相等 + 干区跨卡 11/11 + 混卡包络 + 冒烟六用例〕；附带交付 = fade-out 静止冻结修复〔D45 #1：T021.3 metric 步进设计缺口、基线同现非 T024 回归；池层墙钟收敛〕+ drawCallBudget 1500→2000〔D45 #2〕+ p95/shadow 双卡包络档〔D45 #3〕）。
- **最近 Epic**：T024 资产色卡预设（5/5 收官 2026-09-28：preset = 材质基调色卡〔冠变干不变〕全链——meta 必填 typecheck 闸 + 整表锁 / sourceKey 分桶 + 几何·深度跨卡共享 / 13 树 11 双卡 + 常绿 2 单卡〔卡色证据 = 各 Spec 季相记录，无证据不建卡〕/ 色点 UI + 四入口注入 / 验收门裁决 D44+D45）；上一 Epic：T021 LOD→Representation（2026-09-28，预算四线经 D45 DC 行第三次重锁 2000）。
- **最近任务**：T024.5 验收门（2026-09-28）：五面全 PASS + 两附带运行时交付（fade-out 静止冻结修复 / DC 预算重锁）+ DEV 取证面扩展（seekTo 确定性风相位 / freezeTime / place presets 组合——后续像素取证基建）；裁决 D45（fade-out 定性更正与修复语义 / DC 重锁 / p95·shadow 双卡包络档单卡口径不重锁 / 验收像素「场景域口径」）。
- **下一步**：资产扩充线（2026-09-24 共识顺序锁定）：T012–T015 植物四族（成员立项时勾选；各族族门承接 presets 非空断言〔D44〕）→ T025 设施（轻量批量制，首例批次触发 simple-asset workflow 创建——引用 spine 只写差异剖面）→ T026 人车（车辆复用 preset 车身色——**有卡无形态族须扩 resolvePoolKey，记 T026 立项必答**）→ T027 自然小物 → T028 建筑/设备（T016 已取消〔T022/D42〕、T019 为 Tone Mapping 占位与色卡无关）。散布链 fade-out 同型驻留随 T003 恢复裁定（D45 #1）。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工 + fade-out 散布链随动）待排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
