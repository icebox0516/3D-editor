# T024.5 混卡包络性能实测（epic「资源与性能」面，D44 #3）

> 2026-09-28 ｜ 包络：**13 树 × {default, autumn} 双卡 round-robin × 2000 实例**（spacing 10 沿 T021.8 混植档）
> ｜ 环境：RTX 2080 Ti（ANGLE D3D11）/ chrome-for-testing **151.0.7922.34** headless + vsync-off（`--disable-gpu-vsync --disable-frame-rate-limit --no-sandbox`）/ 1920×1080 DPR1 / canvas 1920×1048（pure3d 顶条 32px）/ Shadow ON / T018 day / `sampleFrames` 5000ms（内置 30 帧预热，nearest-rank）——逐位沿 T021.8 §十四口径。
> 主测工具 `tools/perf-mixed.mjs`（v4）｜ 原始输出 `tools/logs/perf-mixed-raw.json`（= results.json `mainRun`）。

## 四线判定（预算 = representation-runtime.md §九 021.8 重锁）

**总判：3/4 线 FAIL（DC / frame p95 / shadow cost），tri 一线 PASS——数据如实记录，报主代理裁决，未改任何代码。**

| 线 | 预算 | 锚 | T021.8 基线（单卡） | **T024.5 实测（双卡）** | 判定 |
|---|---|---|---|---|---|
| Draw Calls | ≤ 1500 | 真近 @150 | 1011 | **1677** | **FAIL**（超线 +11.8%；vs 基线 +65.9%） |
| Frame p95 | ≤ 10ms | 真近 @150 | 9.8ms | **12.4ms** | **FAIL**（mean 10.20ms / p50 9.9 / max 19.0） |
| Triangles | ≤ 12M | 中景过渡带 @180 | 11.75M | **10.96M** | **PASS**（余量 8.6%） |
| Shadow Cost | ≤ 15% | 真近 @150 A/B（简报指定最重机位） | §九原锚：tier1000-near −14% / mixed-far −15% | **56.4%**（off 218.2 ↔ on 95.2 fps） | **FAIL** |

Shadow 线补测（§九原锚风格，`tools/addendum-shadow-far.mjs`）：**far@449 = 24.1%**（off 305.9 ↔ on 232.2；T021.8 同锚 316.8 ↔ 270.2 = 14.7%）——off 态逐位可比（305.9 vs 315.7），on 态阴影 pass 因双卡材质变体（×2）变重。即 56.4% 的真近读数 = 简报指定的最重机位锚（投射体含 791 high/mid 全深度 + 1209 canopy 简化），而 §九 15% 线的 T021.8 原锚投射体以简化 canopy 为主。两锚读数均在 results.json，裁决基准由主代理定。

## 三机位关键数（沉降态，clean 门：账目稳定 ∧ tInst==0）

| 机位 | fps / p95 | DC | tri | 分布（与 T021.8 逐实例对照） | 桶（双卡分裂面） |
|---|---|---|---|---|---|
| 真近 nearClose@150 | 98.1 / 12.4ms | **1677** | 17.22M | h107 + m684 + c1209，tInst 0（= T021.8 逐位） | high 82 / mid 187 / canopy 192 |
| 中景 mid@180 | 100.4 / 11.8ms | 1461 | **10.96M** | h49 + m425 + c1522 + culled4，**tInst 85 / dual 85**（= T021.8 带稳态逐位） | high 43 / mid 175 / canopy 192 |
| 远景 far@449 | 297.3 / 4.7ms | 801 | 1.88M | m15 + c1769 + **culled 216**，tInst 0（= T021.8 沉降态逐位） | mid 14 / canopy 192 / culled 86 |

- **三机位逐实例分布与 T021.8 完全一致**——选档行为跨 epic 逐位复现；性能差全部来自**卡分桶**（每表示桶数近似 ×2）与**双卡材质变体**（阴影 pass / program 编译面）。
- 沉降态 **programs = 146 = T021.8 同值**——双卡零新增 program（「各树 program 不增三档锁」契约的运行时面成立）。shadow toggle 后 267（真近态全部材质变体的 off/on 双缓存累积，three.js ProgramCache 机制；far 态仅 +2：152/154）——非预算线，机制记档。
- tri 与卡无关（几何跨卡共享）：真近 17.22M vs T021.8 17.81M（−3.3%）、远景 1.88M vs 1.91M（−1.5%）——同实例分布下的构建侧几何演变（seed = seedBase+i 与卡无关已核实，`bootstrap.ts` seed 语义未变），记档不判线。

## 有效桶 24（非 26）记档

声明 26 组合（13 资产 × 2 卡）；**camphor / ligustrum 常绿 default 单卡（T024.3 裁定）**——autumn 请求在声明面归一 default → **有效桶 24**。逐桶计数见 results.json `envelope.perCombo`（asset = i%13、卡 = i%2 静态推演，与 place 幂等语义一致）：22 桶 × 77 枚 + camphor/ligustrum default 各 154/153 枚 = 2000。

## 方法学

1. **每配置重新 place**（T021.8 `sampleConfig` 语义：place → view 紧邻 → 沉降 → 采样；place 幂等自动清上次）。v1 单 place 跨机位跳档污染证据留存 `tools/logs/perf-mixed-v1-singleplace-contaminated.json`。
2. **spawn-at-target（v4）**：view 先行 → place，对象首选档即发生在目标机位——T021.8 far 的有效语义（其 far 配置 place 时相机已在 449）。跨距级联路径见「发现」节，级联冻结态非沉降态、不可采。
3. **clean 沉降门**：(DC, tri, tInst, dual) 连续 3 读 ×500ms 稳定 **∧ tInst==0 ∧ dual==0**（上限 60s；mid 档例外——过渡带稳态本就持续双提交，沿 T021.8 mid@180 dual85 口径，只要求稳定）。
4. **源预热**（449 → 150 各 spawn-at-target + clean 门，~2s/步）：T021.8 mixed 在 tiers 12 配置后跑、13×3 表示源已全量热；独立会话不预热则首配置撞 pending-source 假沉降（v2 首跑实测：196 枚 sourceReady=false 对象账目冻结 ≥2s 被门误判 settled——同会话末配置源热后同机位 tInst==0 铁证）。
5. **shadow A/B**（T021.8 §九方法）：clean 门 → `setSunShadow(false)` → 1500ms → sample(4000) → `setSunShadow(true)` → 1500ms → sample(4000)；costRatio = (off−on)/off（fps 口径，与帧时 (on−off)/on 代数恒等）。
6. **console**：驱动器自标签页创建起收集 Runtime+Log 域（024.4 体例，装载期零盲区，favicon 抑制）。全程 6 条目 **全部**为 `[Renderer] draw calls 超预算（>1500）` 批次治理观测告警（T021.8 README 异常记档 8 先例——产品观测噪声非缺陷），**零未预期条目、零错误**。

### 过程记档（工具面迭代，均无效帧留存、零 src 改动）

| 版本 | 问题 | 留存 |
|---|---|---|
| v1（上一代理） | 单 place 跨机位：far 采样吃进 fade-out 在途（tInst 239 / culled 27 vs 沉降态 216），shadowAB off 分支读到 far 态 fps | `tools/logs/perf-mixed-v1-singleplace-contaminated.json` |
| v2 | ① `sampleConfig` 漏调 `view()`——nearClose/far 均采在缺省机位（两机位账目逐位同即铁证）；② 稳定门无 tInst==0 条件，首配置 pending-source 冻结台误判 settled | `tools/logs/perf-mixed-v2-noview-invalid.json` |
| v3 | far/warmup 用跨距级联 + clean 门：→culled fade-out 冻结致 60s 超时（数据本身有效：nearClose/mid/shadowAB 已 clean） | 会话内被 v4 取代，发现转入探针 |
| **v4（最终）** | spawn-at-target 预热 + far、clean 沉降门、per-config re-place | `tools/logs/perf-mixed-raw.json`（本 README 主数据） |

## 发现（非预算线，报主代理裁决）

**→culled fade-out 过渡在当前构建跨距级联中永久冻结（卡无关）。** `tools/probe-fadeout.mjs`（原始 `tools/logs/probe-fadeout.json`）：

- 双卡 place@150 → view(449)：tInst 冻结 **225**（dual 41）恒定 10s；
- **单卡**（2000 夏栎、无 presets）同 maneuver：同样冻结 **296**/10s——非 T024 色卡触发面；
- 冻结对象跨相机移动持续（回 150 后 298 恒定 5s），仅 `place()` 重建清除；
- 指向 high/mid/canopy 的级联正常收敛（mid 搜索 240→tInst 0、210→2、180→带稳态 85）；
- **T021.8 构建同 maneuver 正常**：tier far 扫描 849m 大规模 fade-out（culled 1858）900ms 内 tInst 0 完成——行为差异窗口在 T021.8 之后（回根源需另立项，本任务不改代码）。

本验收处理：far 机位改用 spawn-at-target（T021.8 有效语义）测量，沉降态逐实例复现 T021.8；冻结行为本身不影响四线读数（冻结态从未进入采样），但**远景拉远时的在途冻结双提交**是潜在视觉/性能缺陷信号，建议主代理裁决后续处理。

## 证据清单

```
perf-mixed/
├── README.md            本文
└── results.json         主测全量（env/warmup/三机位 stats+distribution+sample/shadowAB/四线判定/console/有效桶 24 逐桶）
                          + addendumShadowFar（§九原锚 far A/B）+ fadeoutFreezeProbe（发现摘要）+ t0218Baseline
tools/
├── perf-mixed.mjs       主测脚本 v4（头注含完整协议与迭代记档）
├── addendum-shadow-far.mjs / probe-fadeout.mjs
└── logs/
    ├── perf-mixed-raw.json                       主测原始输出（= results.json mainRun）
    ├── addendum-shadow-far.json                  far 锚 shadow A/B 原始
    ├── probe-fadeout.json                        冻结判别探针原始
    ├── perf-mixed-v1-singleplace-contaminated.json / perf-mixed-v2-noview-invalid.json   过程无效帧（判读警示样本）
    └── dev-server-perf.log                       dev server 日志
```

## 进程清理

收尾：vite dev server（5173）与取证 Chrome（CDP 9333，临时 profile `zcode-0245-perf-profile`）已停止，端口探活 000 复核见任务报告。

---

## 更正记档（2026-09-28，主代理 D45 #1 采纳诊断修复结论）

本 README「发现」节的「T024 回归」定性**不成立**：后续诊断（threejs-runtime-agent，`tools/diag-metric-bands.mjs` + baseline worktree 同 probe 复跑 `tools/logs/probe-baseline-run.log`）实证 preT024 基线 `1bc7035` 逐位同冻结（A 级联 225 / B 296 / D 298）——「T021.8 构建同 maneuver 正常」的基线证据系语义错配（spawn-at-target ≠ 跨距级联；849m 扫描带内无人口）。真实根因 = T021.3 metric 步进下静止相机退场带驻留（设计缺口，`transition.ts` fade = m 纯函数）。已按 D45 #1 修复（池层静止期墙钟收敛，`InstancedAssetPool.frameLod` 可选 `dtSeconds`；dither 带内稳态不动；修复后 A 级联 tInst 225→36 / B 296→23 全为 dither 稳态，`tools/logs/probe-fixed-run.log`）。本节不改上文原文（证据 append-only）。四线读数不受影响：主测全部 spawn-at-target 沉降态采样，冻结态从未进入；预算处置见 D45 #2/#3（DC 重锁 2000；p95/shadow 单卡口径维持 + 双卡包络档记档）。
