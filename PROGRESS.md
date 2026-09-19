# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：2657 全绿（`npm test` / `check:layers` / `typecheck` 三重门槛；check:layers 465 文件）。
- **当前 Epic**：T006 Asset Runtime LOD（4/5 进行中，2026-09-19 启动）——通用 Runtime LOD 调度（张角选档 + 块×档分桶 + 批次控制 + 双档性能验收）；规范依据 `docs/procedural-assets/lod-spec.md`。
- **当前子任务**：006.1–006.4 已 done，下一步 006.5 T006 验收门（双档性能验收 2 万核显/10 万独显 ≥30fps、七项观测报表 D27.9、LOD_THRESHOLDS/BATCH_POLICY 候选值实测锁定、换档点前后帧人工复核窗口 D27.10）。
- **最近完成**：006.4 批次控制（2026-09-19，threejs-runtime-agent 交付 + 主代理合并验收）：domain `batchPolicy`（BATCH_POLICY 候选常量 + keepThinnedInstance 确定性抽稀）+ 散布链粗档稀疏块 2×2 超块合并桶（确定性重建/culled 排除回视恢复）+ 放置链桶级提交跳过 `refreshSubmitVisibility`（006.3 遗留「桶全 culled 仍提交」消除）+ 预算 650 超限节流告警（纯观测不降级）+ LOD 分布双口径计数（Renderer.getLodDistribution / __scatterSmoke.stats().lod）；10 万路灯压测 drawCalls 峰值 531 ≤ 650、LOD off 对照 7,773 → 95.6%↓；+33 测试。
- **下一步**：006.5 验收门收官 T006；之后 T011 第一批阔叶乔木（朴树/香樟/榉树/银杏，按 shadow-visual-sop §5 SOP：逐树种 Research Gate + Spec Version 锚定）；T003 剩余（003.5/003.6）依赖 T011+ 资产后排期。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：未跟踪 `screenshots/ref-tmp/`（8 张参考照片，按 D26 永不 git add）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
