# T006 Asset Runtime LOD

## Goal

通用 Asset Runtime LOD 调度完整交付（D27）：张角选档 + 块×档分桶 + 批次控制 + 双档性能验收——把「性能希望」变成「性能治理」。LOD 是与资产类型无关的 Runtime 公共能力（非植物专属，禁止 TreeLOD/VegetationLOD 类资产域系统）；夏栎三档内容已由 T009.6 承担，本 epic 做调度与消费侧 + 非植物第二消费者验证。

## Requirements

- **选档度量（D27.2）**：归一化视距（资产包围球半径归一，等价张角/屏幕占比，分辨率无关）；chunk 代表距离取块最近点、代表 scale 取块内 max（保守偏高档）；hysteresis 防抖
- **块×档分桶（D27.4）**：散布 = chunk × source × level，放置 = source × level；换档复用既有机制（散布确定性重撒重建 / 放置跨桶迁移）；档位每帧派生态，不进 Scene、不进 Command
- **Representation 范围（D27.3）**：本期实装 High/Mid/Low + Culled；Proxy/Impostor 规范预留（010.3），范围门判定见 006.5
- **批次控制**：块尺寸自适应 + 远处合并/密度降级，防「块×资产×档」批次数爆炸；draw call 预算上限常量化
- **一致性**：拾取跨档一致（点任意档实例映射回同一业务对象/区域）；LOD 总开关（关 = 全 High，回退对比与兜底）
- **双档验收（D10）**：交付门槛 ≤ 2 万实例核显 1080p ≥ 30fps；压力线 ≤ 10 万实例独显 ≥ 30fps；七项观测报表（D27.9）；压力场景走独立测试资产（不依赖 T003 样式链解冻，D27.11）
- **块生命周期单测**：跨块区域编辑、块重建/复用、撤销重做后块状态一致

## Scope

- 预期触碰：domain 选档纯函数、ScatterChunkManager（分桶/选档消费）、InstancedAssetPool（level 维度桶）、性能统计扩展（renderLoopStats 保持零 THREE 边界）
- 前置：T009.6（首个真实多档资产 + level 契约）+ T010.3（LOD 声明规范）+ T003.2（分块管线，已完成）；排期 = T010 之后、T011 族建设之前（D27.11）

## Acceptance

- 双档数字达标并留档报表；换档无 pop/无闪烁（机器 diff + 人工复核，D27.10）
- LOD 关闭开关下行为回退可对比回归；块生命周期单测全绿；`npm test` / `check:layers` / `typecheck` 全绿

## Constraints

- LOD 是「治理」不是「炫技」：预算内档位保守（远处降档优先）
- Profile 不加无消费者字段（D27.12）；渲染实现按 AGENTS.md「多 Agent 按 Step 派遣」执行；性能数字 MCP 结构化取数 + 截图双重取证

## 子任务（2026-09-19 D27 修订重构：原 006.1 植物三档实装职责已被 T009.6 承担，拆分并顺延重编号）

- [x] T006.1 LOD 公共语义层（done 2026-09-19：lodPolicy 候选常量 + evaluateLodRepresentation 纯函数——统一度量 m/单边迟滞/不完整链跳档/总开关语义；+38 测试 → 2585 全绿）→ [006.1-lod-semantics.md](006.1-lod-semantics.md)
- [x] T006.2 非植物第二资产档位验证（done 2026-09-19：路灯两档 High 328 / Low 136 面——009.6 契约跨资产复用验证 + SourceCache 无族多档键 `assetId::level` 扩展；+16 测试 → 2601 全绿）→ [006.2-second-asset-levels.md](006.2-second-asset-levels.md)
- [x] T006.3 块×档分桶+换档（done 2026-09-19：两链接线 006.1 评估器——散布 chunk×source×level 确定性重撒换档 / 放置 source×level 跨桶迁移 + 帧内时序 + 迟滞 + 拾取跨档一致 + 总开关；+23 测试，合并态 2624 全绿）→ [006.3-chunk-lod-bucketing.md](006.3-chunk-lod-bucketing.md)
- [ ] T006.4 批次控制 → [006.4-batch-control.md](006.4-batch-control.md)
- [ ] T006.5 T006 验收门 → [006.5-acceptance.md](006.5-acceptance.md)

依赖：006.1 →（006.2 ∥ 006.3）→ 006.4 → 006.5（006.3 另需 T003.2 已完成、T009.6 已交付档位内容）。

## 进度

- 2026-09-16 拆分立项（旧结构 006.1–006.4，植物三档口径，D11/D17 时期）；2026-09-19 D27 修订重构为本结构（通用 Asset Runtime 口径），0/5。
- 2026-09-19 006.1 done（1/5）：LOD 公共语义层落地——选档评估器纯函数 + 全局策略常量（候选值）+ 总开关语义；006.2 ∥ 006.3 解锁。
- 2026-09-19 006.2 done（2/5）：非植物第二消费者验证——路灯 High/Low 两档（328/136 面）+ SourceCache 无族多档键扩展（assetId::level，单档/未声明逐位保持旧行为）；006.3 消费面就绪。
- 2026-09-19 006.3 done（3/5，与 006.2 并行交付）：两链选档接线落地——Renderer 帧内时序（controls 后 render 前）、迟滞 current 两链私有持有、换档点像素取证无 pop 无抖动；遗留面归 006.4：桶内全 culled 跳过提交、drawCalls 峰值治理、LOD_THRESHOLDS 实测锁定；换档点前后帧人工复核窗口开放至 006.5 验收门（D27.10）。006.4 解锁。
