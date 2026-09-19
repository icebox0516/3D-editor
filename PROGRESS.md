# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：2547 全绿（`npm test` / `check:layers` / `typecheck` 三重门槛；check:layers 449 文件）。
- **当前 Epic**：**T010 程序化资产公共能力与规范**（4/5，2026-09-19 开工）——从夏栎提炼可复制「方法」供 T011+ 族建设批量生产。
- **当前子任务**：无。T010.2/010.3/010.4 已并行收官（2026-09-19）。
- **最近完成**：T010.2 元数据与分类契约 + T010.3 LOD 声明规范 + T010.4 Shadow 规范与视觉验收 SOP（2026-09-19 三子代理并行交付：010.2 触代码——`src/domain/assets/taxonomy.ts` 大类 8 值/family 6 值 + 11 资产归类 + proceduralProfile 通用维度（植物术语禁入公共协议）+ `docs/procedural-assets/metadata-taxonomy.md`；010.3/010.4 纯文档——`lod-spec.md`（LOD 规范唯一真相源）/ `shadow-visual-sop.md`（Shadow 分口径 + 十项视觉检查单 + 固定机位 + 性能模板 + 新增植物 SOP）；2547 全绿 UI 行为不变）；此前 T010.1 家族契约与文件组织规范（2026-09-19，取证 `docs/acceptance/t010/010.1/`）。
- **下一步**：T010.5 模板固化验收门（epic 收官：夏栎迁移对照 T009.7 基线零回退 + 规范齐备 + T011 启动条件确认）→ T006 Asset Runtime LOD（D27 排期）→ T011+ 族建设；T003 剩余（003.5/003.6）依赖 T011+ 资产后排期。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：未跟踪 `screenshots/ref-tmp/`（8 张参考照片，按 D26 永不 git add）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
