# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)（定向读取：索引定位 → 只读该条）。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4507 全绿（`npm test` 285 文件 / `check:layers` 656 / `typecheck` 零错——三门槛判据式口径见 AGENTS.md，D40；4507 = 4291 + T012.1 净 110〔cedrus 全链〕+ T025.1 批 A 净 57〔六资产交付与接线锁〕+ T025.2 批 B 净 28〔休憩四件交付与接线：facilityAssets 15 资产 + 伞三卡整表锁行〕+ T025.3 批 C 净 21〔设备三件交付与接线：facilityAssets 18 资产〕）。
- **当前任务**：**T025 园区设施扩充 in-progress**（epic 立项 2026-09-28；批 A 交通静态六件 done 2026-09-29——simple-asset workflow 首例批次验收成立，交通锥 = 首个设施色卡消费者〔卡 id 'yellow'〕，shapeFamily 缺口发现→修复→验证闭环；**批 B 休憩四件套 done 2026-09-29**——花箱/休闲桌/遮阳伞/自行车架零新配方交付，遮阳伞 = 设施第二色卡消费〔default 米白 + dark-green/wine-red〕；**批 C 设备 P1 三件 done 2026-09-29**——监控摄像头/交流充电桩/井盖零新配方交付，family 裁定收口〔井盖 road-facility；摄像头/充电桩 category facility family 缺席——设备域无诚实归属归 T028 按 §7 聚簇扩展〕，Spec 终审三路硬数值重拉逐字一致，manhole 总高语义修正〔80=框体埋入深度非视觉露出高——齐平 ±3–5mm 承重，全件 0.015〕；批 D 消防小件 + 道闸待续，收官门未至）；上一程 **T012.1 雪松全链收官 2026-09-29**（针叶族新 Family 首例：ConiferShapeProfile 契约草案 + 层状轮生骨架 + 莲座簇 SDF + 球果如烛账目 + 鳞块皮第 14 语言 + canopy 零改动接线 + 预算四档锁定回写 §5.2 + `precedents/conifer.md` 首建 + 完整首例验收 + 密度校准一轮两段收敛；缺口 12 条归族门 012.2）。
- **最近 Epic**：T025 园区设施扩充（in-progress：批 A done、批 B done、批 C done、批 D + 道闸待续，收官门未至）；上一 Epic：T012 针叶乔木族（in-progress：012.1 雪松 done、族门未收官可持续增补〔D33〕——下一成员按增补规则顺延）；再上：T024 资产色卡预设（5/5 收官 2026-09-28，D44+D45）。
- **最近任务**：T025.3 批 C 设备 P1 三件（done 2026-09-29）：三资产交付（tri 768/616/1224 零新配方）+ family 裁定收口（井盖 road-facility；摄像头/充电桩 family 缺席）+ Spec 终审三路硬数值重拉（bjjkg 8 字段/hjlcdz 5 字段/yixing.gov.cn 7 字段逐字一致）+ manhole 总高语义修正（齐平安装承重，露出 0.015）+ UI 冒烟放置链状态栏三证；前任务 T025.2 批 B 休憩四件（done 2026-09-29：四资产交付零新配方 + 伞三卡色卡链 + 花箱土面高仰角补图取证）；再前 T025.1 批 A 交通静态六件（done 2026-09-29）。
- **下一步**：资产扩充线（2026-09-24 共识顺序锁定）：T012–T015 植物四族（成员立项时勾选；各族族门承接 presets 非空断言〔D44〕）→ T025 设施（批 A done 2026-09-29〔simple-asset workflow 首例验收成立〕；批 B done 2026-09-29〔休憩四件零新配方 + 伞三卡〕；批 C done 2026-09-29〔设备三件零新配方 + family 缺席裁定〕；批 D + 道闸待续）→ T026 人车（车辆复用 preset 车身色——**有卡无形态族须扩 resolvePoolKey，记 T026 立项必答**；自行车架停放姿态联动在档）→ T027 自然小物 → T028 建筑/设备（T016 已取消〔T022/D42〕、T019 为 Tone Mapping 占位与色卡无关）。散布链 fade-out 同型驻留随 T003 恢复裁定（D45 #1）。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工 + fade-out 散布链随动）待排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
