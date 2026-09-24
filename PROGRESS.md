# PROGRESS

> 极短项目快照：重新打开项目 30 秒知道现在在哪。任务地图看 [TASKS.md](TASKS.md)；任务历史看各任务书「完成记录」；架构原因看 [DECISIONS.md](DECISIONS.md)（定向读取：索引定位 → 只读该条）。本文件不追加历史流水（D24）。

- **项目**：浏览器端三维园区编辑器（React 19 + Three.js WebGL2 + zustand + Vite）。一期收官稳定；二期 = Feature/Style/Asset 三层程序化内容体系（0 外部模型文件）。
- **测试基线**：4160 全绿（`npm test` 267 文件 / `check:layers` 621 / `typecheck` 零错——三门槛判据式口径见 AGENTS.md，D40；4160 = 4041 + 021.2/021.6 净 32 + 021.3 净 56 + 021.4 净 12 + 021.5 净 19）。
- **当前任务**：T021 LOD→Representation 运行体系（7/9 done 2026-09-24：021.0 / 021.1 契约层 / 021.2 选档 / 021.3 过渡〔metric 步进状态机 + aFadeOut + dither×alphaTest〕/ 021.4 密度批次解耦 / 021.5 阴影策略〔ShadowPolicy 三字段 + depth 三档 + 中点切换接通〕/ 021.6 BroadleafCanopyProxy）。
- **最近 Epic**：T018 真实程序化天空与环境光照（5/5 收官 2026-09-23）；上一 Epic：T011 阔叶乔木族 13/13 收官 2026-09-23。
- **下一步**：T021.7 两链接线 + 编辑态 pin（全前置已满足：canopy 源路由 / representations 声明接线 / streetlamp 收编中间分支删除位）；其后 021.8 标定与验收门（吸收 T006.6 Step 3；A/B 复核组 = mid depth / canopy receive / low 实心影 / 合并桶 OR 短暂双投）；针叶族 T012 立项（012.1 雪松家族首例走完整 SOP 口径）。
- **已知阻塞/冻结**：T003 剩余（003.5/003.6/设施返工）待 T011+ 资产后排期；T002.4 遗留②（长椅 GLB 与公园长椅并存策展）建议并入 T004。
- **工作区残留（防误判）**：`screenshots/` 整目录已按 D31.9 入 .gitignore（ref-tmp 参考照片 + 取证工作副本；正式取证已终档 docs/acceptance/）——非任务进行中标志。
- **参考**：宿主架构现状审计 `docs/architecture-audit/`（14 文档，2026-09-15，集成事实参考）。
