# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：2585 全绿（`npm test` / `check:layers` / `typecheck` 三重门槛；check:layers 453 文件）。
- **当前 Epic**：T006 Asset Runtime LOD（1/5 进行中，2026-09-19 启动）——通用 Runtime LOD 调度（张角选档 + 块×档分桶 + 批次控制 + 双档性能验收）；规范依据 `docs/procedural-assets/lod-spec.md`。
- **当前子任务**：006.1 已 done，下一步 006.2（非植物第二资产档位验证）∥ 006.3（块×档分桶+换档）可并行。
- **最近完成**：T006.1 LOD 公共语义层（2026-09-19，通用子代理交付 + 主代理验收）：`src/domain/lod/` 落地——选档评估器纯函数 `evaluateLodRepresentation`（统一度量 m = 视口高归一化视距：透视 `(d/r)·tan(fovY/2)` / 正交 `orthoHeight/(2r)`，两口径阈值带复用）+ 不完整链跳档（等距取低档）+ 单边迟滞 + LOD 总开关语义（关 = 全 High）；`LOD_THRESHOLDS` 候选常量 6/16/60/0.15（D27 候选待 006.4/006.5 实测锁定）；+38 测试 → 2585 全绿。
- **下一步**：T006.2 ∥ T006.3 并行 → 006.4 → 006.5；之后 T011 第一批阔叶乔木（朴树/香樟/榉树/银杏，按 shadow-visual-sop §5 SOP：逐树种 Research Gate + Spec Version 锚定）；T003 剩余（003.5/003.6）依赖 T011+ 资产后排期。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：未跟踪 `screenshots/ref-tmp/`（8 张参考照片，按 D26 永不 git add）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
