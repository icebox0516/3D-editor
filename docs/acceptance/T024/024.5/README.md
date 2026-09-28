# T024.5 验收门取证 — 跨构建默认卡回归 + 干区跨卡一致（2026-09-28）

> 本目录 = T024.5 验收门的回归面（Step B）与横向一致性面（Step C）像素取证 +
> 冻结相位 sanity 三证据 + console 全程收集。取证工具 `tools/`（本目录自带驱动，
> 沿 024.3/024.4 cdp.mjs 体例增补）；**src/** 零改动**。

## 判据 → 证据对照（总判：**13/13 逐位一致 ✅ ｜ 11/11 bbox 外零差异 ✅ ｜ sanity ✅ ｜ console 零条目 ✅**）

| 判据 | 证据 | 结果 |
|---|---|---|
| 回归：默认卡基线帧与 `1bc7035` 冻结帧逐位一致（13 树 × M25 机位） | `regression-default/compare.json`（`pairs[*].bitwiseIdentical`）+ 26 帧（`current/`、`baseline/` 各 13） | ✅ **13/13 RGBA 逐位相等，且 PNG 字节级也全部相等**（零差异像素，无坐标/色差样例可输出） |
| 横向一致性 A：冠变干不变——干区+地面+投影+天空跨卡逐位一致（11 双卡树，冻结相位 default vs autumn 全帧 diff bbox 外扩 16px 外零差异） | `trunk-invariance/compare.json`（`trees[*].passA` = bbox 外差异像素数 0）+ 热区图 11 帧（`<id>-diff.png`，差异像素标红叠加 default 帧） | ✅ **11/11 bbox 外差异 = 0**（安全带 16px） |
| 横向一致性 B：逐卡可辨（bbox 内差异 > 0） | 同上（`passB` + `diffRatioInside`） | ✅ **11/11** bbox 内差异占比 6.1%–23.5%（详表下） |
| sanity：冻结+稳定 / 冻结确实生效非巧合 / seek 重定位确定性 | `regression-default/compare.json`（`sanity`）+ `current/sanity-frozen-{a,b}.png`、`current/sanity-unfrozen.png` | ✅ a==b 逐位 0 差异；正式帧 == a（重定位后 0 差异）；解冻 3s 帧 ≠ a（19983 差异像素） |
| console：两构建全部导航/动作零错误零警告 | `console-summary.json`（37 会话全程 Runtime/Log 域收集）+ `tools/logs/*.json` 逐会话 | ✅ **37 会话 consoleLogs 全部为空**（0 错误 0 警告） |

## 干区跨卡 11 树明细（bbox 外扩 16px；帧 1292×932）

| 树 | 差异像素 | 差异 bbox（minX,minY..maxX,maxY） | bbox 外 | bbox 内 | 内占比 | 全帧占比 |
|---|---|---|---|---|---|---|
| 3a | 16784 | 525,271..765,500 | **0** | 16784 | 23.47% | 1.39% |
| celtis | 13438 | 494,306..799,473 | **0** | 13438 | 19.88% | 1.12% |
| zelkova | 9624 | 479,304..769,516 | **0** | 9624 | 12.16% | 0.80% |
| ginkgo | 9462 | 531,293..702,516 | **0** | 9462 | 18.12% | 0.79% |
| platanus | 31484 | 454,96..743,495 | **0** | 31484 | 22.63% | 2.61% |
| koelreuteria | 12023 | 521,214..822,540 | **0** | 12023 | 10.03% | 1.00% |
| sophora | 7399 | 519,227..796,546 | **0** | 7399 | 6.78% | 0.61% |
| triadica | 8256 | 550,206..791,545 | **0** | 8256 | 8.10% | 0.69% |
| bischofia | 19888 | 525,201..791,519 | **0** | 19888 | 18.95% | 1.65% |
| fraxinus | 4383 | 553,265..763,528 | **0** | 4383 | 6.09% | 0.36% |
| salix | 11535 | 429,273..832,586 | **0** | 11535 | 7.65% | 0.96% |

差异 bbox 全部落于冠区（树冠居中画幅），热区图目检（如 `asset_tree_3a-diff.png`）：
红色差异像素严格限于叶面——树干/地面/网格/投影/天空/小地图/HUD 跨卡逐位一致，
即「冠变干不变」语义的像素级成立。

## 方法学记档

### 基准构建（Step A，worktree）

- `git worktree add D:/3d-editor-preT024 1bc7035`（T023 提交 = T024 全部代码落地前；detached HEAD）。
- node_modules 复用：junction `D:\3d-editor-preT024\node_modules → D:\3D-editor\node_modules`（mklink /J 成功，未回退 npm ci）。
- **DEV 面补丁**：`git diff 1bc7035 -- src/app/bootstrap.ts src/runtime/services/TimeUniformService.ts`（工作树 vs 1bc7035）→ `devface.patch`（留存于 worktree 根，未跟踪）→ 对 1bc7035 工作树 `git apply` 干净应用。
  - 补丁内容 = T024.3 place `preset` 尾参（+10/−1）+ **T024.5 DEV 取证面**：`place presets` 组合参数（round-robin，与 `preset` 互斥硬失败）、句柄 `freezeTime(seconds?)`（带参 = 先 `seekTo` 后 freeze）/ `unfreezeTime()`、`TimeUniformService.seekTo`（确定性定位：置秒数 + last 基准重置，冻结态下下游 uTime 恒为定位值）、组合根注入 `time: renderer.uTime`（结构类型，生产路径无人调用 = 逐位现状）。
  - 应用后核对：worktree `bootstrap.ts` 含 freezeTime **21** 处（门 ≥2），`TimeUniformService.ts` 含 seekTo 3 处；**两构建 DEV 面文件逐字节一致**（bootstrap `diff` 为空；TimeUniformService 仅 LF/CRLF 行尾差异、内容一致）。
  - 两构建渲染引擎差异面核实：`git diff 1bc7035 -- src/runtime/environment src/scene` **零 diff**；package.json / lock / vite.config 零 diff（junction 共享 .vite 缓存安全）；`renderer.uTime` 在 1bc7035 已存在（`readonly uTime = new TimeUniformService()`）。
- 服务：主库 `npm run dev`（5173，current = 工作树）；worktree `npx vite --port 5174 --strictPort`（5174，baseline）。两服务探活（HTTP 200）后才开始；**截帧全程串行**（单浏览器单标签逐会话，GPU 工作不并发）。
- 浏览器：headless Chrome（`--headless=new --remote-debugging-port=9333 --user-data-dir=临时目录`），CDP 驱动；viewport 1920×1080 DPR1（沿 024.3 `setViewport` 同口径）。

### 截帧协议（Step B/C 共用）

1. **单 navigate/会话**：每树每构建一次驱动器调用（新标签页，会话末自动回收标签——批量取证不积累 WebGL 上下文；024.4 通道记档「同 ws 二次 navigate 挂起」的规避延续）。
2. 就绪等待：轮询 `__tree3aPerf` 可用（500ms 步进，上限 20s）。
3. **先冻结再放置**：`freezeTime(2.5)`（seekTo 定位 uTime=2.5s + freeze——放置期新建材质拿到确定 uTime；天空云静态 cloudSpeed=0，uTime 冻结即全场景确定）。
4. `place({assetId, count:1, seedBase:1, spacing:11, jitter:false})` 默认卡不传 preset；Step C autumn 帧同会话内 `place({..., preset:'autumn'})`（place 幂等自动清上次，同冻结相位/同机位/同几何）。
5. `view({distance:25, azimuthDeg:35, elevationDeg:8})`（M25 统一基线机位，024.3 Contact Sheet 同口径）。
6. 池就绪轮询：`stats().objects===1 ∧ triangles>0` 且连续两采样（400ms 间隔）triangles/drawCalls 稳定；再按 024.3 节奏 `sleep(1100)`。
7. **截帧 clip 到 `canvas.ed-viewport__canvas` 矩形（1292×932 @ 308,66）**：纯渲染面 + 确定性覆盖（HUD 角标 + 小地图；`src/ui/hud` 对 1bc7035 零 diff）——排除停靠面板 DOM（跨构建合理不同：T024 色点 UI 仅存在于 current）与状态栏 1Hz FPS 读数（volatile）。
8. 比对：pngjs（工具目录独立 package.json 安装，**主库 package.json 零改动**）RGBA 全像素逐位扫描；Step C 差异集 → bbox → 外扩 16px（clamp 帧界）→ 外零差异断言 + 热区图输出。

### console 收集

驱动器自标签页创建起启用 `Runtime` + `Log` 域事件收集（console.error/warning、未捕获异常、
浏览器侧 Log 条目含 URL）——比 024.3 的「navigate 后覆写 console.*」覆盖更宽（装载期零盲区）。
favicon 404 通道噪声由驱动器 `Fetch` 拦截统一 fulfill 空 200 抑制（两构建同等处理）。
结果：**37 会话（regression 13+13 + invariance 11）consoleLogs 全部为空**。

## Sanity 三证据（current 构建，首树 asset_tree_3a）

| 证据 | 断言 | 结果 |
|---|---|---|
| 同机位连截两帧（`sanity-frozen-a/b.png`） | 逐位相同（证冻结+稳定） | ✅ 0 差异像素（PNG 字节级亦相等） |
| 解冻 3s 后再截（`sanity-unfrozen.png`） | 与 a 不同（证冻结确实生效非巧合） | ✅ 19983 差异像素 |
| 再 `freezeTime(2.5)` 后截正式帧（`asset_tree_3a.png`） | 与 a 逐位相同（证 seek 重定位确定性） | ✅ 0 差异像素 |

## 偏离记档

1. **devface.patch 取自工作树 diff 而非 `1bc7035..HEAD`**：简报原文 `git diff 1bc7035 HEAD -- …`——但 T024.5 DEV 取证面（freezeTime/seekTo/presets）是本任务 Scope 的**未提交**工作树状态（HEAD 的 tree3aPerf 无 freezeTime，其 13 处 freezeTime 字样为 T008.3 时代注释）。若按原文，baseline 句柄无 `freezeTime(2.5)`，Step B/C 无法执行。改用 `git diff 1bc7035 -- <两文件>`（工作树 vs 1bc7035，按定义对 1bc7035 工作树干净应用），效果 = 简报意图「两构建 DEV 驱动面同型、渲染引擎保持新旧对比」的完整达成（两文件与 current 逐字节一致，见上）。
2. **截帧 clip 到 canvas 矩形**（简报未指明画幅）：逐位判据要求排除合理 DOM 差异（跨构建停靠面板）与 volatile 读数（状态栏 FPS 1Hz 轮询）；clip 域内即纯渲染面 + 跨构建零 diff 的 HUD/小地图覆盖。探针帧留存 `tools/probe-5173.png` / `tools/probe-5174.png`（全帧布局目检用）。
3. **favicon 404 抑制**：探针在 5173 首会话发现浏览器自发的 favicon 404（Log 域条目，非应用行为）；驱动器 Fetch 拦截统一 fulfill（通道级、两构建对称），后续 37 会话 console 全空。
4. **ANGLE X4122 shader 精度 warning（一次性通道噪声）**：仅 5173 首次探针出现（THREE.WebGLProgram 转发 D3D 编译器诊断，本机 GPU 编译通道产生，非应用缺陷）；同 profile GPU shader 磁盘缓存吸收后续编译，37 个取证会话零条目。若在无缓存冷环境复跑可能再现，判读时按通道噪声归类（两构建同 GLSL 同现）。
5. **pngjs 装在取证目录独立 package.json**（`tools/package.json` + `tools/node_modules/`，主库 package.json/lock 零改动）——简报预估链路的最优支路（主库无现成 png 库，先于浏览器侧 canvas 解码备选）。
6. sanity 未在 baseline 重复（简报「首树做一次」）：baseline 冻结确定性由 13/13 全帧字节级一致结果本身背书。

## 证据清单

```
024.5/
├── README.md                        本文
├── console-summary.json             37 会话 console 汇总（全空）
├── regression-default/
│   ├── current/   13 帧 + sanity-frozen-a/b + sanity-unfrozen（current=工作树, 5173）
│   ├── baseline/  13 帧（baseline=1bc7035+devface.patch, 5174）
│   └── compare.json                 逐树比对 + sanity + summary（allPass/sanityPass=true）
├── trunk-invariance/
│   ├── <id>-default.png ×11 / <id>-autumn.png ×11 / <id>-diff.png ×11（热区图）
│   └── compare.json                 逐树 bbox/外零差异/占比 + summary（allPass=true）
└── tools/
    ├── cdp.mjs                      CDP 驱动（024.4 体例 + 全程 console 收集 + favicon 抑制 + 标签回收）
    ├── probe.mjs / probe-5173.png / probe-5174.png   探针（能力面 + 布局目检）
    ├── shot-regression.mjs          Step B 单树单构建截帧（env: PORT/OUTDIR/ASSET_ID/SANITY）
    ├── shot-invariance.mjs          Step C 单树双卡同会话截帧
    ├── compare-regression.mjs / compare-invariance.mjs / collect-console.mjs
    ├── logs/*.json                  37 会话原始驱动器输出（result + consoleLogs）
    └── package.json / node_modules  pngjs（取证目录独立安装）
```

- worktree `D:/3d-editor-preT024` **保留**（后续 Step 可能复用）；其根下 `devface.patch` 未跟踪。
- 进程收尾：5173/5174 vite 与取证 Chrome 已停止（见任务报告）。
