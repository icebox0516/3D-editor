# T009.7 夏栎四类验收门 — 取证与数据（2026-09-19）

环境：**NVIDIA GeForce RTX 2080 Ti**（ANGLE D3D11，驱动 32.0.15.9186）/ Chromium 151（chrome-for-testing）/ WebGL2 / 1920×1080 **DPR=1** / day 预设固定灯光 / **Shadow 开启**（sun (80,120,60)，2048²，±160m）。2080 Ti 为开发基准（任务书口径），不作全平台承诺。

**帧率测量口径（重要，如实记档）**：本验收会话的显示输出经虚拟显示器合成（OrayIddDriver），合成器把 rAF 限在 ~10Hz（恒定 ~100.9ms，与场景复杂度无关）——vsync 开启口径在本环境不可测。改为 **`--disable-gpu-vsync --disable-frame-rate-limit` 启动 Chrome，rAF 间隔 = 单帧完整渲染能力（CPU 提交 + GPU，无 vsync 等待）**；阈值换算：≥60 FPS ⇔ mean ≤16.7ms、≥45 ⇔ ≤22.2ms、≥30 ⇔ ≤33.3ms。该口径严格保守（不隐藏 vsync 余量）。GPU 时间：`EXT_disjoint_timer_query_webgl2` 存在但需渲染循环插桩方可可靠测量——标记 **unavailable（未测量，不作伪精确）**；GPU 成本间接证据 = Shadow A/B 帧时差。CPU 时间单项：rAF 间隔为 CPU+GPU 合并口径，CPU-only 分解未测（需 Chrome tracing，未作伪拆分）。

## ① 性能验收（产品放置路径：CreateObjectCommand×N → BatchCommand → SceneSync → InstancedAssetPool）

驱动：DEV 句柄 `window.__tree3aPerf`（tools/cdp.mjs + tools/perf-main.mjs 可复现）；采样 5000ms、预热 30 帧。

| 棵数 | FPS | mean ms | p50 | p95 | max | drawCalls | triangles | 阈值 | 判定 |
|---|---|---|---|---|---|---|---|---|---|
| 0（基线） | 665 | 1.50 | 1.3 | 3.1 | 56 | 3 | 4 | — | — |
| 1 | 710 | 1.41 | 0.9 | 2.7 | 937* | 7 | 57,512 | ≥60 | ✓ |
| 20 | 426 | 2.35 | 2.3 | 3.9 | 11 | 31 | 1,367,720 | ≥60 | ✓ |
| 100 | 267 | 3.75 | 3.3 | 6.8 | 308* | 35 | 6,925,864 | ≥60 | ✓ |
| 500 | 82 | 12.2 | 7.7 | 29.6 | 991* | 35 | 34,512,792 | ≥45 | ✓ |
| 1000 | 49 | 20.3 | 11.8 | 33.2 | 1855* | 35 | 68,982,308 | ≥30 | ✓ |

\* max 尖峰为偶发 GC/提交颠簸（p50/p95 健康；1000 棵 p95 33.2ms 贴近 33.3ms 线，mean 20.3ms 余量充足）。1000 棵用 spacing 10（320m 见方 ⊂ shadow camera ±160m）；其余 11m。

**Shadow 成本 A/B（1000 棵，4s 采样）**：sun castShadow OFF 4.66ms/帧（215fps）↔ ON 12.39ms/帧（81fps）——**影 pass 全场景成本 ≈ +7.7ms/帧**（影贴图重绘 8 桶全部三角）。

**资源契约五条逐项**：

1. **同 sourceKey 不重复创建 Geometry/Material**：1000 棵 geometries=11（环境 3 + 8 形态槽桶——缓存条目数有界 = 槽数，非实例数）✓（另有单测：同键 load 同引用）
2. **500/1000 棵保持 InstancedMesh 路径**：drawCalls 恒 35（8 桶 × [2 主材质组 + 2 影] + 环境 3），不随棵数增长 ✓
3. **不退化逐对象 Mesh**：同上——逐对象退化时 drawCalls 应 ≥1000，实测 35 ✓（另有单测锁定池路径）
4. **删除实例后无残留**：clear 后 objects=0、drawCalls 回 3、triangles 回 4；geometries 保持 11 = 缓存保留 8 槽源（D19.4 无淘汰，设计内持有，非泄漏；实例矩阵缓冲随池拆释放——单测锁定）✓
5. **连续 10 次放置/删除无持续增长**：100 棵 × 10 轮，geometries/textures/programs 逐轮恒 11/4/12，零增长 ✓

## ② 结构验收（对照 docs/research/tree3a-reference.md Spec 1.0）

证据：`vis-near-12m.png`（近）+ `vis-backlight-25m.png`（逆光）。

| 验收项 | Spec 依据 | 判定 |
|---|---|---|
| 主干自然（近直立、锥度平滑） | `trunk_lean_angle` 近直立（Inferred [6]） | ✓ 近直立、无直筒感 |
| 枝干层级清晰 | `branching_levels` ≥3–4 级（Inferred） | ✓ 主干→骨架枝→次枝→末梢 4 级可辨（实现 5 级生成） |
| 枝条粗细递减 | `branch_radius_decay` Unknown（实现 0.55–0.67 逐级） | ✓ 干→主枝→次枝→梢连续递减无跳变 |
| 叶簇与枝梢明确关系 | `leaf_attachment_rule` Verified（叶着生一年生小枝、冠壳外段集中 [1][2][6]） | ✓ 叶簇挂 L4/L5 枝梢末端，无悬浮/穿帮 |
| 冠内通透 | `crown_transparency`/`crown_fill_gradient` Verified（照片直接证据） | ✓ 逆光冠内空隙光斑 + 透枝（内核保留率 0.298 单测锁定） |

## ③ 视觉验收（近 12 / 中 25 / 远 50m × 六要素；机位沿 009.1 约定 az35 el8）

| 要素 | 近 12m | 中 25m | 远 50m |
|---|---|---|---|
| 轮廓 | ✓ 宽展不对称、冠缘不规则 | ✓ 同 | ✓ 剪影完整可辨 |
| 枝干 | ✓ 4 级结构 | ✓ 骨架枝横展剪影可辨 | ✓ 灰褐干可辨 |
| 叶簇 | ✓ 簇团外密内疏 | ✓ 簇团团块感 | ✓ 中绿团块色域 |
| 叶片 | ✓ 单片倒卵形+裂片可辨、明暗层次 | （中距单叶不可辨 = Spec §7 口径内） | （远距牺牲项 = Spec §7） |
| 树皮 | ✓ 沟脊浮雕+苔痕 | ✓ 灰褐主调 | — |
| 阴影 | ✓ 叶形裁切斑驳 | ✓ 同 | ✓ 剪影可辨 |

证据：`vis-near-12m.png` / `vis-mid-25m.png` / `vis-far-50m.png` / `vis-backlight-25m.png` + 009.5 取证（影近景）。**009.6 遗留复核项（Low 远距口径）**：`lod-low-50m.png` 远距剪影完整、绿有亮暗层次非死平、无可信性穿帮——**远距口径下成立**（12m 近距观感含蓄为档位定位使然，见 009.6 记档）；`lod-levels-far-60m.png` 三档 60m 全景剪影颜色连续无跳变。

## ④ 变体验收

证据：`slots-panorama-42m.png`（本批复核）+ `docs/acceptance/t009/009.3/` 全套（用户裁定门两轮 8/8 定稿）。8 槽形态明显不同（冠形宽窄/高矮/疏密，叶卡 4015–9028）且同种语言一致（叶色/树皮/枝干姿态）✓。

## ⑤ 回归

- `npm test` **2542 全绿**（2514 基线 + T009.5 11 + T009.7 驱动 17）/ `check:layers` 446 文件过 / `typecheck` 无错
- GLB 与旧植物/设施资产零变化：`customDepthMaterial` 为源可选字段，GLB/旧资产源不设 → 池不赋值 → 构造性零变化（单测「不带时 undefined」锁定）
- T003 冻结口径维持：ScatterChunkManager 零改动

## 观感裁定口径

四类验收的机器判定（本文件）+ 视觉模型核验为收官判据；用户观感复核窗口开放（沿 008.6 处置先例——异议可回溯本取证目录重开微调）。
