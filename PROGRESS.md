# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4033 全绿（`npm test` / `check:layers` 601 / `typecheck` 零错——三重门槛）。
- **当前 Epic**：**T018 真实程序化天空与环境光照（in-progress 2026-09-23）**——018.0 + 018.1（Sky 双实例 + 三一致 + legacy 泄漏修复）+ 018.2（PMREM/IBL：事务管线 + uDisplayIntensity + IBL ≈+0.5ms 归因）+ 018.3（统一预设面 + 事务式 fallback + Hemi 删除；「直射光零贡献」定论 = HDR×NoToneMapping 254 饱和非 bug）+ **018.4 done（单会话：__sky DEV 调参面 + skyRebake debounce + skyTuning 端口；sunlow 异常帧两轮复核定案取证层作废）**。**018.5 进行中（checkpoint 2026-09-23）**：过曝处置走显示域压缩（tone mapping 重审弃选——D29.3 修订须用户裁定不触发，ACES 证据留 T019 素材）——day display 0.22 / ibl 0.15 落表（tech/dusk/night 维持）+ 预设面 displayIntensity 键接线；取证主体完成：24 帧新侧 / 同实例 IBL 增量 +0.1~0.2ms / 资源账 6 轮零增长 / 冻结云双帧一致 / warm rebake <1ms；余新旧判读收口 + README + 三门槛复验 + DECISIONS 过曝处置记档。上一 Epic：T011 阔叶乔木族 13/13 收官 2026-09-23。
- **最近完成**：018.4 DEV 调参面会话（取证 `docs/acceptance/t018/018.4/`——README 含 sunlow 异常帧定案与工具教训）。
- **下一步**：018.5 验收（epic 收官子任务）；T006.6 Step 3（不阻塞，可并行/其后）；T003 剩余待排期；园区档核显复验为 T006 遗留项。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志；011.11 时代 `.tmp-*.ps1/png` 系列已清理不存在。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
