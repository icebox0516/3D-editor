# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4034 全绿（`npm test` / `check:layers` 601 / `typecheck` 零错——三重门槛）。
- **最近 Epic**：**T018 真实程序化天空与环境光照（5/5 收官 2026-09-23）**——018.0 前置基线 + 018.1（Sky 双实例 + 三一致 + legacy 泄漏修复）+ 018.2（PMREM/IBL：事务管线 + uDisplayIntensity）+ 018.3（统一预设面 + 事务式 fallback + Hemi 删除）+ 018.4（__sky DEV 调参面 + rebake debounce）+ **018.5 验收收官**（终值 day 0.22/0.15、tech 0.2/0.15 显示域压缩〔**D39**：tone mapping 重审弃选，ACES 证据留 T019 素材〕；epic 十二条逐条收口全过——24 对新旧全终值态对照 / 同实例 IBL 增量 +0.1~0.2ms 双判据 / 资源账 6 轮恒定 / 冻结云静态；tech 六帧终值定案后补拍）。上一 Epic：T011 阔叶乔木族 13/13 收官 2026-09-23。
- **最近完成**：018.5 验收收官会话（取证 `docs/acceptance/t018/018.5/`——README 含 epic 十二条对照表、tech 补正记档与工具教训）。
- **下一步**：T006.6 Step 3（A/B 实测 + 阈值重锁判定，不阻塞可执行）；T003 剩余待排期；园区档核显复验为 T006 遗留项。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志；011.11 时代 `.tmp-*.ps1/png` 系列已清理不存在。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
