# T021.4 Density / Batch 解耦 · 取证说明

纯机制任务（node 可测），验收三条均为断言式，无视觉验收面（本目录不产生帧）：

1. **密度与表示独立变化**——同表示不同密度（`thinInstances` 注入面 1/0.75/0.5 单调 + 运行时消费面全量证明，batchPolicy.test「thinInstances 密度输入面」组 + batch.test【同表示不同密度】）；同密度不同表示（三表示 count = 真相源 + 矩阵逐位一致，batch.test【同密度不同表示】）。
2. **合批允许面按表示可配置**——`batchMergeAllowed { high: false, mid/low/canopy: true }` 默认面 + 注入翻转 + 脏表防御（batchPolicy.test）；canopy 合并桶运行时证据（batch.test canopy 合批允许面，假想声明资产）。
3. **三门槛**——typecheck 零错 / check:layers 617 文件全过 / 全量 4141 passed（基线 4129 + 12 增量，零回归）。

行为变化记档：low 桶实例恢复全量（约 ×2，旧 `levelInstanceKeep.low = 0.5` 废止、历史记档在 `src/domain/lod/batchPolicy.ts` 模块头）；drawCallBudget 650 降格 Legacy Baseline（重测重锁归 021.8）。021.2「代表 scale 全集口径」判别测试因密度通道拆除结构性失效，已移除并头注记档（ScatterChunkManager.lod.test），021.8 Density A/B 重开降密时须重立。
