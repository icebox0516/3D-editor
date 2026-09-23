# T018.5 验收收官 — 终调定值 + 新旧对比 + epic 十二条收口

> 2026-09-23 ｜ Chrome 153 headless CDP 9333 vsync-off 1920×1080 ｜ Vite 5173（**取证前 kill 残留重启 + curl 验证模块新鲜**——工具教训第三次呼应，见文末）｜ 驱动 `tools/cdp-console.mjs` ｜ 三门槛：npm test **4034 全绿** / check:layers **601** / typecheck **零错**

## 终调定值（预设表已落，environmentPresets.ts）

| 预设 | displayIntensity | iblIntensity | 依据 |
|---|---|---|---|
| day | **0.22** | **0.15** | display × ibl 分离扫描 + 组合扫描 + 视觉判读 + 视口分带定量四重依据：d0.22 天空带 luma 154 / r/B 0.508 / 通道饱和 0.0003 与 legacy day 渐变天空（154.7 / 0.517）逐位对齐零裁剪；i0.15 地面饱和占比 0.87→**0** 脱离 018.3 定论的 254 饱和平台、luma 202.3 vs legacy 186.6、lumaStd 44.9→40.9 阴影对比回归、树影左伸可见；金属三球反射在 i0.15 仍可辨。d0.28 弃选（63% 蓝通道裁剪）；i≥0.2 弃选（饱和平台未脱离） |
| tech | **0.2** | **0.15** | 首轮仅看地面误判「无需处理」，天空带取证推翻：24×12 白色分布图 100% 满白（meanRGB 247,249,249）+ 金属三球纯白占比 0.64/0.78/0.91——同为压缩对。终值：天空白占比 0（冷蓝渐变 + 云可辨）、金属阶梯恢复可辨 0.23/0.20/0.08、地面 luma 75→39 回归 legacy 暗蓝语义 |
| dusk | 1（维持） | 0.85（维持） | 白经反打机位实测排除过曝：视向近太阳（az35）白占比 0.81 vs 背太阳（az240）白占比 0 / 饱和度 0.279——白 = 低太阳正对机位的自然眩光；压缩反会破坏背离太阳方向的正常黄昏渐变 |
| night | 1（维持） | 0.35（维持） | 帧亮度 47.5 无饱和嫌疑（Preetham 无夜晚语义为 D29.6 已知近似） |

- 太阳角锚 **day 50.2°/53.1° 零漂移**（新旧对比阴影方向一致 = epic 第 2 条）；接线 live 确认：`__sky.params()` 读回 day 0.22/0.15、tech 0.2/0.15、四预设 sun 角与预设表一致（t0185-visual.log / t0185-tech-refinal.log）。
- 代码落点（threejs-runtime-agent 交付，主代理审查通过）：`EnvironmentPreset` 增 `displayIntensity` 键 + `setupSkyEnvironment` sky 分支构建期一次 `sky.setDisplayIntensity(preset.displayIntensity)`（fallback 零消费）+ 测试重锚（dusk/night/tech 相对断言改绝对锚定 = 加严；day 最低 ibl 排序锁）。

## ⚠ 补正记档：tech 六主体帧复拍（t0185-tech-refinal.mjs）

24 帧首拍（t0185-visual.mjs）时 tech 终值**尚未定案**（时值 display 1 / ibl 0.7 中间态——t0185-visual.log `presetParams.tech` 为证，tech 复测定案在其后）；day/dusk/night 18 帧为终值态（首拍时 day 0.22/0.15 已接线，同 log `presetParams.day` 为证）。处置：同款协议（freezeTime + place/view 同机位常量 + GLB 同款注入 scale 0.5042 + 金属三球同参数）复拍 tech × 6 主体覆盖 `tech-*.png`，`t0185-compare.mjs` 重跑出新旧对照表——**24 对全终值态**。复拍读数：tech 终值 live 0.2/0.15 断言内建（不符即抛错）、pmrem owned=1、console 零意外错误。

## 新旧对比判读收口（epic 验收第 3 条）

对照表 `tools/t0185-compare.log`（018.5 vs 018.0 视口分带 skyTop/groundBottom，24 对全终值态）：

| 预设 | skyTop old→new | groundBottom old→new | 判读 |
|---|---|---|---|
| day | 154.7→154（六主体 153.8–161.8） | 186.6→202.3 | 天空带与 legacy 渐变逐位对齐（终调判据达成）；地面更亮但脱离 254 饱和平台、阴影对比回归（lumaStd 44.9→40.9）、树影左伸可见 |
| dusk | 65→239.8 | 56.6→92.5 | 低太阳正对机位白区为自然眩光（反打定案）；背离方向正常黄昏渐变；地面暖光层次恢复 |
| night | 18.4→97.8 | 9.5→22.6 | 真实大气 + IBL 环境光贡献下亮度上移（legacy Hemi 平坦偏暗）；Preetham 夜晚近似为已知记档 |
| tech | 19.4→186.3 | 17.1→38.3 | 终值压缩后冷蓝渐变 + 云可辨（中间态满白 242.5 已消除）；地面暗蓝语义回归（中间态 73 偏亮） |

**PBR 环境光/反射可辨改善判定**：018.0 legacy 六主体无环境贴图（envMap/PMREM 全仓零使用）——金属三球近黑纯色、GLB 金属杆与路灯无反光带；新侧终值态 metal 三球反射蓝天白云 + GGX 粗糙度阶梯可辨（018.2 三主体首证，018.5 全预设终值确认：day i0.15 镜面/粗糙阶梯分明〔final-day-metal-d022-i015.png〕、tech d0.2 阶梯 0.23/0.20/0.08 饱和度 0.23–0.30〔tf-tech-metal-d020-i015.png〕）。植被主体（tree3a/celtis/camphor）叶面与树干获得环境光遮蔽层次、路灯/GLB 反光带可辨——**第 3 条过**。视觉复核（analyze_image 双帧判读）：tech-tree3a 冷蓝渐变 + 淡云 + 地平线可辨、无死白平台、树受光/阴影层次分明、地面暗蓝 ✓；tech-metal 三球锐利→中等→哑光阶梯成立、左球反射蓝天分层非死白 ✓。

## 性能与资源（epic 第 4/9/10 条）

- **p95 增量口径裁定（第 9 条）**：**同实例 IBL on/off 差为增量口径**（018.2 建议采纳——跨实例漂移 ≈+0.6ms 淹没信号）。读数：1000 棵档同实例三轮交替 on 3.70–4.00 / off 3.60–3.90（perf2.log）+ on/off 对拍 on 4.10 / off 4.00（perf.log）→ **Δ ≈ +0.1~0.2ms**：≤1.5ms 绝对判据 ✓；≤基线 10% 相对判据（1000 棆 legacy 4.4–4.5ms → 0.44ms）✓。**可测性边界记档**：empty 档帧 p95 0.4–0.6ms，10% = 0.04–0.06ms 小于测量噪声（±0.2ms）不可测——相对判据以 1000 棵重载档为有效域，empty 档仅绝对判据有效。跨实例参考：1000 棵新侧 3.8–3.9 vs legacy 4.4–4.5（新侧反低，Hemi 退役 + 渲染路径差异，不作增量结论依据）。
- **资源账（第 4 条）**：day→dusk→night→tech 循环 **6 轮 × 4 预设**：geo/tex/programs 恒定 **38/5/21 零增长**、每轮 pmrem owned=1 / live=1 / retired=0（整组重建重置语义）——018.0 实测的 legacy 每切换 +1 geo/+2 tex 泄漏面消解（perf.log cycles 段）。
- **PMREM 单次耗时（第 10 条）**：终值态 warm rebake **0.4–0.9ms**（baked 计数核验真烘；perf.log rebakeMs + perf2.log samples）；含 generator 重编译首烘 ~30ms（018.2 证据归档）——≤100ms 参考开发机门 ✓。
- **冻结云双帧（第 12 条视觉侧）**：frozen-cloud-a/b 120 万视口像素仅 **6 像素 ±1**（噪声量级，云位移不符——静态实证，t0185-frozen-diff.mjs）；cloudSpeed=0 单测锁（三门槛内绿）。

## epic Acceptance 十二条逐条对照收口（D31：不重跑项以已落证据收口）

| # | 条目 | 结论 | 证据 |
|---|---|---|---|
| 1 | 渐变天空不再正式路径（仅 fallback） | ✓ | 018.1 代码事实（applyEnvironment sky 分支；legacy 仅初始化失败整组降级）+ 018.3 fallback 单测 |
| 2 | Sky 与 DirectionalLight 同一太阳方向 | ✓ | 018.1 探针 dot 0.99999994 + 三一致单测；018.5 快照阴影方向与 018.0 对比零漂移（day 50.2°/53.1° 锚未动，visual.log 读回一致） |
| 3 | scene.environment = PMREM + 六主体新旧对比可辨改善 | ✓ | 本 README 判读节：24 对全终值态对照表 + 金属/GLB/路灯反射实证 |
| 4 | 循环 ≥5 轮 owned=1 / 无增长 | ✓ | 6 轮 × 4 预设恒定 38/5/21 + owned=1（perf.log cycles） |
| 5 | PMREM 不进每帧路径 | ✓ | 018.2 `?raw` renderFrame 零 PMREM 断言 + 018.4 debounce 单测（不重跑） |
| 6 | Ground/Grid/Shadow/LOD/RenderMode 零回归 | ✓ | rendermode-clay.png 抽查（诊断遍天空照常）+ 三门槛 4034 含 LOD/散布全量回归 |
| 7 | 初始化 fallback / 运行中失败保留旧环境 | ✓ | 018.3 单测 + monkey-patch 实证（不重跑） |
| 8 | dispose 释放链全释放 + StrictMode 不泄漏 | ✓ | 018.1/018.3 单测 + 018.1 泄漏复测 10 轮零增长（不重跑；无 forceContextLoss 冻结规则遵守） |
| 9 | ΔFrameTime p95 ≤1.5ms 且 ≤基线 10% | ✓ | 同实例口径 Δ+0.1~0.2ms 双判据过（可测性边界已记档） |
| 10 | PMREM 单次 ≤100ms | ✓ | warm 0.4–0.9ms / 首烘 ~30ms |
| 11 | 回归三门槛全绿 | ✓ | **4034 / 601 / 零错**（本日主代理复验） |
| 12 | 内建云静态语义 | ✓ | 冻结双帧 6/120 万像素 ±1 + cloudSpeed=0 单测 + 双实例同步断言（018.1） |

## 过曝处置裁定（记档 DECISIONS.md D39）

**选定显示域压缩**（displayIntensity 天空显示单侧 + iblIntensity 环境光贡献双旋钮，018.2 交付机制 / 018.4 实证工具面 / 018.5 终值落表）；**弃选 tone mapping 重审**（D29.3 修订须用户裁定，018.5 不触发；ACES 实证证据 56% 画面改善已归档 `../018.3/README.md`，留作潜在 T019 颜色管线立项素材）。D29.3 本体不修订。

## 工具教训（追加 018.3/018.4 教训链）

1. **跨会话常驻 dev server**（本日复现 018.4 教训）：5173 残留进程 → 取证前必须 kill 重启 + curl 验证下发模块含最新改动（本次验证 environmentPresets.ts 数值 + environmentSetup.ts:83 接线均新鲜后才开拍）。
2. **强状态定案时点 vs 取证时点**：终调流程中预设值在取证后仍可能被推翻（tech 首轮误判→复测推翻）——**验收快照必须在终值定案后统一时点拍摄**，否则按主体补拍复跑对照（本次处置）；预设面读回（presetParams）随每次取证落 log 作时点证据。
