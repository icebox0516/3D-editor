# three.js 调试取证细则

> 本文件承接一期 AGENTS.md 的调试规则全文（2026-09-16 文档体系拆分，D2）。AGENTS.md 只留摘要，此处是完整版。

## 1. MCP 与截图的自动选择

本项目的 `threejs-devtools-mcp`（60 个工具）为**按需启动模式**：`.zcode/config.json` 中 `enabled: false`，会话启动时不自动连接、不开浏览器。处理 three.js 相关调试/验证时，按以下规则**自动选择工具，不询问用户**。

### 1.1 需要场景数据时：按需拉起 HTTP 变体（"问诊"）

问题属于以下类别时，先启动 MCP 取数，不截图：

- 场景状态查询：对象为何不可见、transform/材质/贴图/灯光参数核对
  （`object_details` `material_details` `find_objects` `raycast` `click_inspect`）
- 相机/渲染器配置核对（`camera_details` `renderer_info` `renderer_settings`）
- 性能与资源：FPS、draw call、内存/显存（`performance_snapshot` `perf_monitor` `memory_stats`）
- 实时改参验证：材质/灯光/相机/雾/阴影（`set_material_property` `set_light` 等 set_* 系列）
- glb → React Three Fiber 代码生成（`gltf_to_r3f`）

启动方式（代理自行执行、用完即杀进程）：

```
env: HTTP_PORT=<如 9300> BRIDGE_PORT=<如 9299>  threejs-devtools-mcp-http
```

- 它会自动探测 dev server 端口并开**一个**系统浏览器标签页承载调试桥（这是获取场景数据的必要条件，属预期行为；调试期间保持该标签存活，结束后可手动关闭）。
- 调用方式：HTTP JSON-RPC（`POST http://127.0.0.1:$HTTP_PORT/mcp`，initialize 取 `mcp-session-id` → `tools/call`）。
- 仅验证服务存活时可用 `BROWSER=none`（无页面挂载，场景类工具不可用）。

### 1.2 绑定金丝雀（三渲染器拓扑，一期 T8.4 增补）

本项目页面含三个 WebGLRenderer（主视口 + 轴指示器 + 小地图），MCP 桥绑定最后创建的上下文 = 小地图——结构化场景工具（`renderer_info` / `material_list` / `object_details` / `scene_tree` / `raycast` / `perf_*`）会**静默读到小地图派生场景的错误数据**（不报错、数据是错的，比工具不可用更危险）。因此：

- 桥启动后先过金丝雀：`renderer_info` 的 canvas 尺寸 ≈ 主视口才可信任结构化工具；
  不等（典型症状 200×140）→ 结构化工具一律弃用。
- 错绑定时仍可信的仅 `run_js` 与 `console_capture`（页面级、非上下文级）。
- 主视图取证快照法细则见 `docs/archive/plan-phase1/METHODOLOGY.md` 第 31 条与 `.zcode/investigate/t84/` 成品脚本。

### 1.3 必须用浏览器截图（像素证据，"确诊"）

问题属于以下类别时，截图（含视觉判读）不可替代：

- 光栅化产物：z-fighting 条纹、摩尔纹、闪烁、锯齿、透明混合顺序——场景数据本身看不出这些，必须看渲染结果
- 最终视觉验收：观感、颜色、网格距离淡出、构图布局
- UI/DOM 层问题：面板遮挡、控件不可点击——MCP 只见场景不见 DOM
- 帧稳定性证明：连续截图逐字节比对

### 1.4 执行顺序与兜底

- 调试顺序：先 MCP 结构化数据定位 → 收尾一次截图验收；两者结论冲突时以像素为准。
- MCP 拉起失败（端口冲突、包损坏、dev server 未启动）**或金丝雀失败（错绑小地图）** → 直接回退浏览器截图方案，不因此阻塞任务；仅在下一次汇报中说明所用路径。

## 2. 子代理派发纪律

凡 three.js / WebGL 渲染相关的实现、诊断、优化任务，按 AGENTS.md「多 Agent 按 Step 派遣」执行（子代理定义于 `.zcode/agents/`，领域知识按各 Agent 内 Skill Routing 从 `.zcode/skills/` 按需加载）：主代理拆分 Step，生产渲染代码按职责派 `threejs-runtime-agent` / `procedural-asset-agent` / `park-shader-agent`，研究、通用实现、独立验证用通用子代理自定。主代理负责拆分、派遣、审查与最终验收，不亲自写渲染层代码。

- 子代理简报必须自包含：症状与根因证据（文件:行）、明确的任务清单、「明确不做」清单、验证标准（三重门槛全绿）。
- 子代理交付后，主代理必须亲自 diff review + 按上文 MCP/截图规则做视觉验收，再向用户汇报。
