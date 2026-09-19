# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：2624 全绿（`npm test` / `check:layers` / `typecheck` 三重门槛；check:layers 458 文件）。
- **当前 Epic**：T006 Asset Runtime LOD（3/5 进行中，2026-09-19 启动）——通用 Runtime LOD 调度（张角选档 + 块×档分桶 + 批次控制 + 双档性能验收）；规范依据 `docs/procedural-assets/lod-spec.md`。
- **当前子任务**：006.1–006.3 已 done，下一步 006.4 批次控制（桶内全 culled 跳过提交、drawCalls 峰值治理、LOD_THRESHOLDS 实测锁定输入面）。
- **最近完成**：006.2 ∥ 006.3 并行批次（2026-09-19，procedural-asset-agent + threejs-runtime-agent 交付 + 主代理合并验收）：①006.2 路灯两档（High 328 / Low 136 面，仅降径向分段——轮廓/体量/颜色档间一致）+ SourceCache 无族多档键 `assetId::level` 扩展（恒单档资产逐位保持旧行为）+ lod-spec §2.2 措辞同步；②006.3 两链选档接线——`Renderer.renderFrame` 帧内时序（controls 后 render 前）、散布 chunk×source×level 确定性重撒换档 / 放置 source×level 跨桶迁移、迟滞 current 两链 runtime 私有持有、拾取跨档一致、LOD 总开关（`setLodEnabled` + `?lod=0`）；换档点像素取证无 pop 无抖动；+39 测试（16+23）。
- **下一步**：006.4 → 006.5（换档点前后帧人工复核窗口开放至此，D27.10）；之后 T011 第一批阔叶乔木（朴树/香樟/榉树/银杏，按 shadow-visual-sop §5 SOP：逐树种 Research Gate + Spec Version 锚定）；T003 剩余（003.5/003.6）依赖 T011+ 资产后排期。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：未跟踪 `screenshots/ref-tmp/`（8 张参考照片，按 D26 永不 git add）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
