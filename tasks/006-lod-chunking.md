# T006 LOD Chunking

## Goal

分块 LOD 分档完整交付（D9/D10/D11）：相机距离驱动的粗/中/细模动态切换 + 双档性能验收——把「性能希望」变成「性能治理」。

## Requirements

- **generator levels**：程序化 generator 提供 `levels`（粗/中/细几何，面数阶梯至少 3 档）；GLB 资产可声明 proxy 粗模（可选，不强制）
- **块 × 档分桶**：在 T003 分块管线之上，每块按相机距离动态选档；换档平滑（无可见跳变，容差内 hysteresis 防抖）
- **批次控制**：块尺寸自适应 + 远处块合并/密度降级，防「块 × 资产 × 档」批次数爆炸；draw call 预算上限常量化
- **一致性**：拾取跨档一致（点粗模树仍选中区域/对象）；烘焙（T007）取当前档几何语义明确
- **双档验收（D10）**：交付门槛 = ≤ 2 万实例、核显 1080p ≥ 30fps；压力线 = ≤ 10 万实例、独显 ≥ 30fps；产出 draw call / 三角形 / fps 报表（复用视口统计），压力场景入测试资产
- **块生命周期单测**：跨块区域编辑、块重建/复用、撤销重做后块状态一致

## Scope

- 预期触碰：分块实例化管线（分桶/选档/合并）、植物 generator（levels）、性能统计报表输出
- 依赖：T003（分块基础）、T002（generator 契约扩展 levels）

## Acceptance

- 双档数字达标并留档报表；换档无视觉跳变（连续截图比对）
- LOD 关闭开关下行为回退到 T003 形态（可对比回归）
- 块生命周期单测全绿；`npm test` / `check:layers` / `typecheck` 全绿

## Constraints

- LOD 是「治理」不是「炫技」：预算内档位尽量保守（远处粗模优先）
- 渲染实现按 AGENTS.md「多 Agent 按 Step 派遣」执行；性能数字经 MCP 结构化取数 + 截图双重取证

## 子任务（2026-09-16 会话粒度拆分，D16）

- [ ] T006.1 generator levels → [006.1-generator-levels.md](006.1-generator-levels.md)
- [ ] T006.2 块×档分桶+换档 → [006.2-chunk-lod-bucketing.md](006.2-chunk-lod-bucketing.md)
- [ ] T006.3 批次控制 → [006.3-batch-control.md](006.3-batch-control.md)
- [ ] T006.4 T006 验收门 → [006.4-acceptance.md](006.4-acceptance.md)

依赖：006.1（需 T003.4）→ 006.2（需 T003.2）→ 006.3 → 006.4。

## 进度

- 2026-09-16 拆分立项，0/4。
