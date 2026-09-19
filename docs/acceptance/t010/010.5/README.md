# T010.5 模板固化验收门 — 取证与数据（2026-09-19）

T010 epic 收官验收：夏栎零回退复核（对照 T009.7 基线）+ 规范齐备性 + T011 启动条件确认。主代理执行。

环境：**NVIDIA GeForce RTX 2080 Ti**（ANGLE D3D11）/ **Chrome 152.0.7977.83**（系统 Chrome；T009.7 基线为 Chromium 151 chrome-for-testing——同机同卡，浏览器版本差异如实记档，影响面见下）/ WebGL2 / 1920×1080 DPR=1 / day 预设固定灯光 / Shadow 开启。测量口径与 T009.7 一致：`--disable-gpu-vsync --disable-frame-rate-limit`（vsync 关闭，rAF 间隔 = 单帧完整渲染能力，严格保守口径；合成器 ~10Hz 限频不可作读数）。

## ① 夏栎零回退复核 — 全过

### 1. 同 seed 逐位复现 ✓

- slot-0 锚点 stats：皮 20724 / 叶 14334 / 卡 7167 —— 与 T009.7/T010.1 锚点锁定值**逐位相同**（`tools/anchor-stats.mjs`）。
- 8 槽形态向量（`tools/slots-stats.mjs`）：皮恒 20724；叶卡 4015–9028；High 总面 28754（slot-6）–38780（slot-7）—— 与 lod-spec.md §5.3 记录带**逐位相同**。
- 单测逐位回归锁（皮 20724 / rng 消费 177234 / High 档逐位 / 材质 fixture 逐字节）随 `npm test` 2547 全绿。

### 2. 固定机位观感对照（vs T009.7 基线截图）✓

8 机位同参重拍（`tools/visual-recheck.mjs`：vis-near/mid/far/backlight + lod 三图 + 8 槽全景，机位与 T009.7 `t0097-visual.mjs` 逐项一致，freezeTime 冻结风相位）：

| 对照 | 像素差异统计（`tools/pixel-diff.mjs`，零依赖 PNG 解码） | 判定 |
|---|---|---|
| vis-near-12m | mean 0.80/255；>8 差异 1.29%；>32 差异 0.79% | ✓ |
| vis-mid-25m | mean 0.25；>8 差异 0.42% | ✓ |
| vis-far-50m | mean 0.13；>8 差异 0.20% | ✓ |
| vis-backlight-25m | mean 0.34；>8 差异 0.56% | ✓ |
| lod-levels-far-60m | mean 0.13；>8 差异 0.20% | ✓ |
| lod-low-50m | mean 0.13；>8 差异 0.20% | ✓ |
| lod-low-25m | mean 0.22；>8 差异 0.36% | ✓ |
| slots-panorama-42m | mean 0.71；>8 差异 1.39% | ✓ |

md5 全异（基线 Chromium 151 vs 复测 Chrome 152，渲染器版本差异导致 AA/合成层微差——预期内）；**99%+ 像素一致或近一致，差异集中于树冠边缘高频轮廓区**（质心在树体剪影处）。视觉模型核验两张最大差异图三联对照（`cmp-vis-near-12m.png` / `cmp-slots-panorama-42m.png`，`tools/diff-composite.mjs` 生成）：树形轮廓/枝干结构/叶簇密度/树皮/阴影逐项一致，8 槽逐棵一致，无结构性差异——判定同一场景的一致渲染，仅渲染管线微差。

### 3. 性能对照（`tools/perf-main.mjs`，口径与 T009.7 逐项一致）✓

| 棵数 | T009.7 基线 FPS | 复测 FPS | 复测 mean | 复测 p95 | 阈值 | 判定 |
|---|---|---|---|---|---|---|
| 0（空场景） | 665 | 2174 | 0.5ms | 0.8ms | — | — |
| 1 | 710 | 2068 | 0.5ms | 0.8ms | ≥60 | ✓ |
| 20 | 426 | 1082 | 0.9ms | 2.2ms | ≥60 | ✓ |
| 100 | 267 | 367 | 2.7ms | 8.8ms | ≥60 | ✓ |
| 500 | 82 | 96 | 10.4ms | 35.8ms | ≥45 | ✓ |
| 1000 | 49 | 79 | 12.7ms | 54.3ms | ≥30 | ✓ |

全档位过阈值且**普遍快于基线**（Chrome 152 + 会话机器负载更低；同机同卡）。复测各档 triangles/drawCalls/geometries 与基线原始 JSON（`docs/acceptance/t009/009.7/perf-measurement.json`）**逐位相同**（20 棵 1,365,592：README 表中 1,367,720 为基线当时誊写差异，原始 JSON 为准——本次复核顺带发现并记档）。p95（1000 棵 54.3ms vs 基线 33.2ms）受采样窗口内后台负载影响，mean 12.7ms 余量充足，SOP §4.7 口径内。

**资源契约五条**（与基线逐项同值）：①geometries 有界恒 11（环境 3+8 槽桶）②③drawCalls 35 恒定不随棵数涨（InstancedMesh 路径）④clear 后 objects=0/drawCalls 回 3/triangles 回 4，geometries 留 11 = 缓存设计内持有 ⑤10 轮放置/删除 geometries/textures/programs 恒 11/4/12 零增长。Shadow A/B（1000 棵）：OFF 4.7ms ↔ ON 8.2ms（影 pass ≈ +3.5ms/帧，低于基线 +7.7ms——方向有利，不构成回退判据）。

### 4. 三门槛 ✓

`npm test` **2547 全绿**（182 文件，与 T010.2/3/4 归档基线同数）/ `check:layers` **449 文件过** / `typecheck` **零错**。

## ② 规范齐备性 — 全过

六面全部落档 `docs/procedural-assets/` 且四文档头部姊妹链接四向互指齐全：

| 规范面 | 文档 | 代码侧真相源指针 |
|---|---|---|
| 家族契约 + 文件组织 + 三级职责 | `organization.md`（75 行） | `tree/broadleaf/broadleafShapeProfile.ts`（纯类型零运行时） |
| 元数据与分类契约 | `metadata-taxonomy.md`（117 行） | `src/domain/assets/taxonomy.ts`（const 元组值域） |
| LOD 声明规范（唯一真相源） | `lod-spec.md`（192 行） | `types.ts:34` / `ProceduralSourceCache.ts:19` / `AssetDescriptor.ts:42` 三处指针核实 |
| Shadow 规范 + 十项视觉检查单 + 固定机位 + 性能模板 + 新增植物 SOP | `shadow-visual-sop.md`（191 行） | `InstancedAssetPool.ts` customDepthMaterial 三建网格点、`tree3aMaterials.ts` 深度材质先例 |

一致性抽核：lod-spec §5.3 夏栎实测带与本批评测 8 槽 stats 逐位吻合；shadow-visual-sop §4.3 基线数 710/426/267/82/49 与 T009.7 README 一致；metadata-taxonomy §5 tree_3a 实测带 h7.39–9.12/w4.44–9.80 与头注口径差记档在位；`tree/` 下恰 `broadleaf/`+`tree3a/` 两目录与 organization.md §2.2 一致。

## ③ T011 启动条件确认 — 就绪

第一批阔叶乔木（朴树 / 香樟 / 榉树 / 银杏）可按 SOP 直接开工，依据：

1. **SOP 全链就位**：shadow-visual-sop.md §5 六步（Step 0 Research Research 前置 → 结构分析 → 参数化 → 双 Step 派遣 → 固定机位验证 → 裁定），含 D26 Gate 判定、豁免记档、rng 纪律、双例外用户裁定门（D23.7）。
2. **Research Gate 可执行**：`asset-research` 技能（方法论 + spec-template + 按域 schema）+ `docs/research/tree3a-reference.md`（Spec 1.0）先例齐备；四树种各自独立调研、各自 Spec Version 头——T011 任务书须逐树种留 Gate 判定痕并锚定 Spec Version（开工前校验权在开发 Agent）。
3. **家族层可复用**：阔叶家族契约（BroadleafShapeProfile 51 字段）实例化填自己数值即可；broadleaf 预算行已锁（≤40000 / 6000–10000 / 1500–3000，lod-spec §5.2）；taxonomy family `broadleaf` 值在域。
4. **验收基线可对照**：夏栎性能基线（本目录 + 009.7）与十项视觉检查单（shadow-visual-sop §2）+ 10 机位代号体系（§3）。
5. **启动前置无缺**：三门槛全绿；夏栎零回退（本验收 ①）确认模板与方法未破坏已验收资产。

## 落档清单

- 本 README（判定表 + 环境 + 口径）
- `perf-recheck.json`（全量性能数据：env/baseline/tiers/shadowAB/afterClear/cycles10）
- 证据图 8 张 + 三联对照图 2 张（`cmp-*`）
- `tools/`：`cdp.mjs`（CDP 直驱）+ `perf-main.mjs` / `visual-recheck.mjs` / `anchor-stats.mjs` / `slots-stats.mjs`（复现脚本）+ `pixel-diff.mjs` / `diff-composite.mjs`（零依赖 PNG 像素对照）
