# T021.8 Phase C——epic 验收门取证（① 性能梯队 / ② 远景视觉 / ③ Fade 专项 / ④ 散布抽查 / ⑤ 生命周期 / ⑥ 兼容冒烟）

> 任务：[tasks/021.8-calibration-acceptance.md](../../../tasks/021.8-calibration-acceptance.md) ｜ Epic：[021-lod-representation](../../../tasks/021-lod-representation.md) ｜ 口径：[representation-runtime.md §十四](../../../docs/procedural-assets/representation-runtime.md)
> 执行：2026-09-24 晚中断会话（②③ 全量 + ① env/baseline/tiers/mixed/shadowAB + canary）＋ **2026-09-28 续作会话**（本 README：中断面判读接手 + ① mixed 复测 + ③ 拾取复核 + ④⑤⑥ 补齐 + 汇总）。
> 环境：RTX 2080 Ti（ANGLE D3D11）/ chrome-for-testing 151 headless CDP + vsync-off（`--disable-gpu-vsync --disable-frame-rate-limit`）/ 1920×1080 DPR1 / canvas 1920×1048（pure3d 顶条 32px，金丝雀两会话均 PASS）/ Shadow ON / T018 day 预设 / 5000ms 采样 + 30 帧预热（nearest-rank）。续作会话 Chrome 加 `--no-sandbox`（ZCode bash 沙箱与 Chrome 沙箱冲突致 exit 3，GPU 路径与 D3D11 串逐位同）。

## 六面结论总表

| 面 | 判定 | 一句话结论 | 主证据 |
|---|---|---|---|
| ① 性能梯队 + 混植 | **PASS**（锚口径全过，余量 ≥2.7×） | 六档梯队 + 2000 混植三机位 + shadowAB 全量落档；评估锚（1–1000 ≥60、2000/混植 ≥45）最低读数 124fps | `perf-measurement.raw.json` + `perf-mixed-recheck.raw.json` |
| ② 远景视觉十条 | **PASS 10/10**（④ 按已知折衷基线判读） | 无秃干/覆盖连续/冠幅连续/冠形可辨（salix 弱保持记档）/无块状切换/无 dither 闪烁（两读）/cull 渐退无整片消失/无孤儿影/无空洞/连续移动无周期跳变 | 72 帧 + `visual-frames.raw.json` + `cull-ext.raw.json` + `fade-chain.raw.json` |
| ③ Fade 专项 | **PASS**（四面状态同步；picking 面复核翻案） | 六运动模式零震荡；main/depth/shadow/picking 四面同步；中断版 dither 拾取 miss 复核为**合成事件伪影**（真实事件 dual=1 活跃期命中） | `fade-chain.raw.json` + `fade-product*.raw.json` + `pick-recheck.raw.json` |
| ④ 散布链 fade 抽查 | **PASS** | dither 带 dual 提交活跃（16-20 桶）、fade-out 带渐进退场（canopy 284→254 / culled 260→290），判读渐进溶解、无整树缺失——D1 修复散布侧像素面实证 | 7 帧 + `scatter-fade.raw.json` |
| ⑤ 资源生命周期 | **PASS** | place→clear ×10（含 3 far 轮）：P3 起 geometries/textures/programs 恒定 313/5/146；scatter→clear ×5：S2 起恒定 348/5/146——无持续增长 | `lifecycle.raw.json` |
| ⑥ 兼容回归冒烟 | **PASS**（六项全过 + console 清洁） | GLB UI 放置渲染 / streetlamp 放置拉远 / Ghost 预览 / 拾取跨表示身份保持 / 撤销重做 5→0→5 / 渲染模式切换；两轮冒烟 0 错误 0 警告 | 15 帧 + `compat-smoke*.raw.json` |

**Density 专项条件判定（§八）**：混植 far 449m 中断版 348fps、复测 227/240fps——两会话均 ≥45 → **100% 达预算，不得默认降密**（75/50 对照组不触发）。

## ① 性能梯队全表

单种夏栎 place 网格（near = `view()` 缺省自适应 = 网格 extent；far = 自适应搜索 canopy 占比 >90% 的最近距离）。中断会话测量：

| 档 | spacing | near fps / DC / tri / 分布 | far fps @d / DC / tri / 分布（沉降态） |
|---|---|---|---|
| 1 | 11 | 2385 / 7 / 57,522 / high:1 | 2605 @409 / 7 / 988 / canopy:1（share 1.00） |
| 20 | 11 | 1080 / 47 / 956,914 / h12+m8 | 2548 @453 / 31 / 19,494 / canopy:20（1.00） |
| 100 | 11 | 825 / 67 / 1,887,336 / h6+m87+c7 | 2369 @508 / 35 / 92,544 / c95+cul5（0.95） |
| 500 | 11 | 1122 / 67 / 1,246,690 / m48+c452 | 1662 @371 / 35 / 487,014 / canopy:500（搜索态 0.952，沉降 1.00） |
| 1000 | 10 | 1002 / 67 / 1,483,398 / m33+c966+cul1 | 658 @319 / 67 / 同 near 逐位（**同机位**，见异常 2；沉降 share 0.966） |
| 2000 | 10 | 501 / 39 / 1,711,474 / m4+c1686+cul310 | 962 @449 / 39 / 同 near 逐位（**同机位**；宽网格 best-effort share 0.64 搜索态 / 0.843 沉降） |

- 空场景基线 2919fps（DC3/tri14）。全档 frame p95 ≤ 2.8ms。
- 评估锚：1–1000 档最低 658fps ≥60 ✓；2000/混植最低 124fps ≥45 ✓（阈值线 mean ≤16.7/22.2ms 全档满足，最大 mean 8.1ms）。

**2000 混植（13 乔木 round-robin）**：

| 机位 | 会话 | fps | DC | tri | 分布 |
|---|---|---|---|---|---|
| near（缺省 = 449m，实为远景） | 中断 | 324.6 | 445 | 1,905,804 | m15+c1769+cul216 |
| far@449 | 中断 | 348.3 | 445 | 1,905,804 | 同上（同机位） |
| far@449 | 复测 | 226.8 → A/A 240.2 | 445 | 1,905,804 | 同上（**逐位复现中断版账目**） |
| **nearClose@150（真近机位）** | 复测 | **123.6**（p95 9.8ms） | 1011 | 17,807,084 | **h107+m684+c1209**（high 成分在场，最近树 m<6） |
| mid@180（过渡带） | 中断 | 131.7 | 895 | 11,748,876 | h49+m425+c1522，tInst85/dual85 |

- 真近机位 124fps ≥45（亦 ≥60）：混植最重负载下仍过锚。
- **Shadow A/B**（中断版）：tier1000Near off 749.7 / on 644.4（−14%）；mixed2000Far off 316.8 / on 270.2（−15%）——shadow 成本 ~0.2-0.3ms/帧量级，两个采样均远在预算内。

## ② 远景视觉十条逐条

判读 = 帧多模态读图 + `visual-frames.raw.json` 逐帧分布/账目交叉；像素面依据为主、机制面数据佐证。

| # | 条款 | 判定 | 证据锚 | 判读依据 |
|---|---|---|---|---|
| ① | 树冠不再「只剩树干」 | **PASS** | `02-overview-far` + 13× `02-F50-*` | 远景全区无秃干/裸枝树——canopy 卡实心绿体量在场；overview 最近缘 mid 带叶簇观感偏稀（canopy 绿覆盖高于 mid 的已知倒置，非秃干，记档不判 FAIL） |
| ② | 远景绿色覆盖率连续 | **PASS** | `02-overview-far` + calibration ①b 绿覆盖矩阵 | 449m 总览绿质量连续无断带；canopy 绿覆盖恒高于 mid（Phase A 逐帧测量）保连续性 |
| ③ | 冠幅连续 | **PASS** | `02-crown-celtis-d140–d250`（12 帧） | mid（d≤172，叶簇冠 ~86-100px）→ dither（d180-220 双提交）→ canopy（d235+ 实心冠同宽）——冠幅跨带不塌缩；tri 13578→7770→988 无宽度跳变 |
| ④ | 树种级冠形可辨 | **PASS**（折衷基线） | 13× `02-F50-*` + `02-overview-far` | 圆冠/锥形/开展/垂枝形差异可辨；**salix 垂幕在 canopy 侧弱保持**（Phase A 异常记档 4 已知折衷：zoom 可辨/原生不可辨）——如实判读不计 FAIL |
| ⑤ | 无明显块状切换 | **PASS** | `02-probe-d25–d800`（19 帧）+ Phase A ⑦ | 径向 probe 分布单调滑变（h134→0 / m449→0 / c1417→1931），无双提交 DC 增量跳崖；dither 客座并入既有桶 |
| ⑥ | 无明显 dither 闪烁 | **PASS**（两读） | `fade-chain` 六模式 + Phase A ③ | 静态帧盐椒融入纹理（zoom 10.7× 判读不过粗）；**两读**：运动中或呈轻微 shimmer 属 dither 固有、非颗粒粗细问题——按静态证据判过、运动面如实记两读 |
| ⑦ | Cull 不产生整片突然消失 | **PASS** | `02-cull-d600–d960`（17 帧）+ probe d560-800 | fade 带绿覆盖单调消解（d670-780 tInst1 持续），d795 起 culled（DC3/tri14 账目自洽）；混植 probe culled 数 144→272→382→488→687 渐进无跳崖 |
| ⑧ | 无「树没了影子还在」 | **PASS** | `cull-ext.raw.json` + probe 逐帧 | shadowCasterInstances 与可见实例逐帧同步（2000→1939→…→0），cull 帧影子归零无孤儿影残留 |
| ⑨ | 无森林空洞 | **PASS** | `02-overview-far` + `04-scatter-*` | 2000 网格与散布区域内部无整片缺树空洞 |
| ⑩ | 相机连续移动无周期性跳变 | **PASS** | `fade-chain` slowMove/fastDrag + probe 序列 | slowMove diffMax 1.4%、fastDrag diff 2.96% < 相机位移基线 3.96%；换档平移量 ≤0.42%（T006.6 Step 3 吸收项）无周期反馈 |

## ③ Fade 专项判据矩阵

场景 = 3 树种产品路径（celtis/camphor/salix）+ chain harness（真实调度路径逐帧步进）。

| 运动 × 判据 | 无震荡 | 无重复重建 | 无闪烁 | 无明显 pop | 证据 |
|---|---|---|---|---|---|
| 远离 / 靠近 / 往返 | ✓（reversals 0；roundtrip camphor 1 次 = 带内方向翻转非震荡） | ✓（memoryDistinct 收敛 25/3/21） | ✓（diffMean ≤0.43%） | ✓（diffMax ≤5.6% 含相机位移） | `fade-chain.raw.json` modes |
| 快速拖拽 | ✓（3-4 reversals = 穿带方向翻转） | ✓ | ✓（diff 2.96% < 基线 3.96%） | ✓ | fade-chain fastDrag |
| 慢速移动 / FOV 改变 | ✓（0） | ✓（27/3/21 单值） | ✓（diff 1.4%/1.8%） | ✓ | fade-chain slowMove/fovChange |
| 产品路径远离/往返 | ✓（DC 序列单调、迟滞带吞没偏移） | ✓（geo 收敛） | ✓ | ✓（±5% 振荡零翻转） | `fade-product.raw.json` 38×2 读数 |

**四面状态同步**：

| 面 | 判定 | 证据 |
|---|---|---|
| main render | **PASS** | 双提交账目 DC 差 = 桶差（15→19 当 dual=2）；客座并入既有 canopy 桶零增量（Phase A ⑦ 复证） |
| depth（shadow 表示中点切换） | **PASS** | shadowCasterInstances 带内逐帧恒定（per-tree 1），cull 瞬间归 0——§5.4 中点切换无跳变 |
| shadow | **PASS** | 全程连续无空档（3→3→…→0 只在终态 cull） |
| picking | **PASS**（复核翻案） | canopy 距离命中（pin 生效 high 0→1，中断版 + 复测双证）；**dither 活跃期命中**（复测：`dual=1` 时真实鼠标事件点击 hit=true，`03-pick3-dither-real-event.png`）；cull 后不可命中 + 同帧存活树可命中（中断版双对照） |

## ④ 散布链 fade 包装抽查

`__scatterSmoke` 3 乔木区域（120×90m @ density 0.05，544 实例，16 chunks）：

- **dither 带**（d190/212/235 + 穿带帧）：mid/canopy 混合分布（534/767/780 实例含客座），transitionInstances 180-236、**dualSubmitBuckets 16-20 活跃**；帧判读：mid 叶簇 → canopy 实心渐进交接、盐椒溶解在场、**无整树缺失**（D1 修复散布侧像素面实证）、交接按 32m chunk 呈对角带状 = §4.4 chunk 粒度预期形态非缺陷。
- **fade-out 带**（d760/790/820）：canopy 284→278→254 / culled 260→266→290 渐进退场，tInst 190-247 持续；帧判读：近排实心 → 远侧逐棵变淡消散、**无整排硬切、无空洞残迹**。
- clear 后 chunks 0 / DC3 归零。
- **方法记档**：`scatter({ id, params: {…} })` 参数须嵌套于 `params`（ScatterSmokeOptions 契约）；平铺传参被静默忽略跑缺省 trashbin 冒烟——v1 无效帧已删，教训记 `t0218-scatter-fade.mjs` 头注与异常 5。

## ⑤ 资源生命周期

放置链混植 520（13 种 ×40，seed 覆盖全 8 槽）place→clear ×10（第 3/6/9 轮 far@449 穿插 canopy 全量构建）：

| 轮 | 1 | 2 | 3(far) | 4-10 |
|---|---|---|---|---|
| clear 后 geo/tex/prog | 301/5/146 | 301/5/146 | **313/5/146** | **313/5/146 恒定** |

（P1 place 时读 118 = 构建在途；far 轮补建 canopy 槽位 +12 后封顶；place 后与 clear 后读数自 P3 起逐位相同；同参分布逐轮逐位一致 {h41,m231,c248}）

散布链 3 树种区域 scatter→clear ×5（dither 带机位，客座桶参与）：S1 建至 348/5/146 后 **S2-S5 恒定**，DC 71 稳定。

**结论**：`sourceKey+representation` 缓存边界下生成→删除→再生成零增长；上界 = 放置 313 geometries / 散布 348（含全部 13 种 8 槽三表示源 + 客座 fade 几何），textures 5 / programs 146 全程不变——Source owns / Pool references 所有权契约经计数面实证（§十四生命周期专项口径）。

## ⑥ 兼容回归冒烟（每项一帧 + 一句话）

| 项 | 判定 | 一句话 | 帧/读数 |
|---|---|---|---|
| GLB 资产 UI 放置渲染 | **PASS** | 内容浏览器卡片（`data-asset-id`）真实点击激活 placement → canvas 落点，凉亭入大纲、DC 27/tri 734 渲染在场 | `06-glb-placed.png` + `06-glb-ghost-preview.png` |
| Ghost / 预览高档现状 | **PASS** | placement 激活 + hover 出半透明预览（高档），落点成树 | `06-glb-ghost-preview.png` |
| streetlamp 放置 + 拉远 | **PASS** | 近距 d120 混 high/low（跳档 tie-break 取远端 = resolveDeclaredRepresentation 语义正确）；d400 三灯 culled、GLB 恒 high 在场 | `06-streetlamp-mid-d120.png` / `06-streetlamp-far-d400.png` |
| 拾取跨表示身份保持 | **PASS** | 近距选中（high:1）→ 拉远 300m canopy 距离 pin 保 high:1（outline 连续）→ 拉回 high:1——身份全程保持 | `06-pick-{near-selected,far-canopy-pinned,back-near}.png` |
| 撤销重做 | **PASS** | place 5 → Ctrl+Z 批撤 objects 5→0 → Ctrl+Y 5→5（真实键盘事件走 input.ts 产品路径） | `06-undo-after.png` / `06-redo-after.png` |
| 渲染模式切换 | **PASS** | wireframe/xray/clay 三态切换渲染正确（帧内树线框在场），收回 shaded 恢复；**记档**：诊断模式渲染路径不走 renderer.info 计数（读数 dc=0 是读数面差异非渲染缺失） | `06-mode-{wireframe,xray,clay,shaded}.png` |
| console 清洁 | **PASS** | 冒烟两轮 0 错误 0 警告（④③ 复核轮同） | driverConsoleLog |

## raw JSON 索引

| 文件 | 内容 |
|---|---|
| `perf-measurement.raw.json` | ① 中断会话全量：env（GPU/UA/viewport/DPR）+ assetDump + baseline + **六档梯队 near/far 全量**（sample/stats/distribution + far 搜索轨迹）+ mixed 三机位 + shadowAB 两组 + console |
| `perf-mixed-recheck.raw.json` | ① 续作复测：env 复核 + mixed 真近机位 D150 + far@449 复测 + A/A ×2 + tier1000@319 A/A ×2 + 中断版 near 参数注记 |
| `visual-frames.raw.json` | ② 39 帧逐帧读数（M25/F50/overview/probe/crown/cull 前 9 帧）+ canvasRect |
| `cull-ext.raw.json` | ② cull 扫描延展 6 帧（d795-960：culled 态账目） |
| `fade-chain.raw.json` | ③ chain harness 六模式 summary（reversals/diff/memory/pool）+ treeInfo + thresholds |
| `fade-product.raw.json` | ③ 产品路径远离/往返 38×2 读数 + dualAccounting 6 帧 |
| `fade-product-pick.raw.json` | ③ 中断版 picking 三测（blob 瞄准；ditherPick miss——复核见下） |
| `pick-recheck.raw.json` | ③ 续作拾取复核：canopy 对照 + dither 活跃期（dual=1）真实事件命中 + 带搜索轨迹（机制注记：transition 时间驱动 ~1s 完成） |
| `scatter-fade.raw.json` | ④ 散布 dither/fade-out 7 帧读数（stats/dist/perf 三口径） |
| `lifecycle.raw.json` | ⑤ 放置 ×10 + 散布 ×5 逐轮 geo/tex/prog/DC 双读数 |
| `compat-smoke.raw.json` / `compat-smoke-glb.raw.json` | ⑥ 冒烟六项读数（GLB 修正版在后者） |

帧命名：`02-*` ②远景（M25/F50 单树、overview、probe 径向、crown 冠幅扫、cull 退场扫）｜`03-*` ③fade（chain 2 + product 4 + 复核 1）｜`04-*` ④散布（7）｜`06-*` ⑥冒烟（15）｜`canary-*` 金丝雀（3）。

## 异常与边界记档

1. **中断-续作过程**：09-24 晚取证代理在 ① shadowAB 完成后因平台用量上限中断；②③①(梯队/mixed/shadowAB/env) 已落盘可抢救（79 文件），④⑤⑥ 与汇总未做。续作会话先复核抢救面（发现简报所述「tiers 全空壳」与实况不符——`perf-measurement.raw.json` tiers 六档数据完整，简报描述按中断时点快照撰写）后补齐缺口。未重做已完成项。
2. **mixed near/far 逐位相同「异常」——已关闭，非捕获 bug**：`view()` 缺省距离 = `max(lastExtent,25)`（网格实宽），2000 网格 extent=449 恰与 far 搜索选中距离相同 → 两节点同一机位（az35°/el16°/449m），DC445/tri1,905,804/{m15,c1769,cul216} 逐位相同是必然。该机位最近树 ~136m（m≈11，mid 带）故 near 无 high 只有 15 mid——「near 实际很远」分支成立。复测 far@449 **逐位复现同账目**（fps 227/240 vs 中断 348，见 3）+ 补真近机位 D150（h107+m684+c1209，124fps）重写该节点语义。
3. **跨会话 FPS 水平差 + tier1000 far 658 疑点**：同机位 A/A 方差本会话 4-6%（1025/986；227/240）；中断版 tier1000 far@319 658fps 与 near@319 1002fps 同机位差 35% 今日不可复现（复采 ≈ near 值），判中断会话瞬时环境态（背景负载/时钟）；跨会话水平差（mixed far 348→227）同因如实记档。所有评估锚余量 ≥2.7×，结论不受影响。
4. **tier 2000 far canopyShare 0.64/0.843 <0.9**：440m 宽网格物理上无全落 canopy 窗的机位（近侧 mid / 远侧 culled 不可避免），脚本 best-effort 分支如实记录全尝试轨迹——非缺陷。
5. **散布参数嵌套契约（工具面教训）**：`__scatterSmoke.scatter` 期望 `{id, params}` 嵌套；续作 v1 平铺传参被静默忽略跑缺省 trashbin 冒烟（534 实例 = 120×90×0.05 缺省值），一度误判「散布链 high→culled 直跳回归」——实为 trashbin 单 high 档链的完全正确行为。修正后散布链 mid/canopy/dither/fade-out 全部正常。无效帧已删，工具留头注。**产品零缺陷**。
6. **dither 拾取中断版 miss 复核翻案**：中断版 blob 瞄准 + 合成 PointerEvent 点击 dither 树 miss（同 harness canopy 命中）。复核：拾取实现为 raycast（RuntimeViewport/InstancedMesh，非 GPU 像素面）→ dither 像素不可能影响命中；合成事件伴随 OrbitControls `setPointerCapture` NotFoundError（合成事件无 active pointer）。CDP `Input.dispatchMouseEvent` 真实 trusted 事件在 `dual=1` 活跃双提交期命中（high 0→1 pin 生效）——判**合成事件伪影**，产品 picking 面 PASS。机制注记：dither transition 为时间驱动 ~1s 完成（v2/v3 搜索轨迹数据），静止带内树沉降后 current=canopy——后续 harness 触发活跃带须跨 16 线后即时点击（工具头注已记）。
7. **f_koeDepthAlpha 着色器警告**：`THREE.WebGLProgram: warning X4000: use of potentially uninitialized variable (f_koeDepthAlpha)`（koelreuteria 深度材质，两会话均现，中断版日志同）——src 级（park-shader 域）如实记档——**已于收官修复（park-shader-agent 单返回重构，`koeDepthAlpha` 3-return 改 1-return + 初值 1.0 保守方向；X4000 触发形态〔多早退 return 内联临时〕消除，同族先例 011.6 ⑨；三分支表达式逐位不变、锚定测试零改动；4243 全绿）。编译器模式消除为结构性修复，浏览器 console 复验未单独重跑（记档）。**
8. **DC 超 650 legacy 观测告警**：mixed 真近机位 1011 / mid 895 等触发 Renderer 观测告警（Legacy Baseline 650，Phase A ⑨ 已外推预告）——非降级、非缺陷；四线重锁（DC/frame p95/triangle/shadow cost）归主代理收口。
9. **salix 垂幕 canopy 侧弱保持**：Phase A 异常记档 4 已知折衷（统一 BroadleafCanopyProxy vs 树种级冠形），② ④ 按此基线判读（原生不可辨/zoom 可辨）。
10. **渲染模式 dc=0 读数**：wireframe/xray/clay 诊断模式渲染不走 renderer.info 计数路径（帧内视觉在场）——读数面差异记档，不影响冒烟判定。
11. **streetlamp 近距落 low**：d120 混 high/low = [high,low] 链对 canopy 名义区的跳档 tie-break 取远端（resolveDeclaredRepresentation 语义，规范 §四.2）——正确行为记档。
12. **console 总账**：④⑤⑥ 与拾取复核轮 0 错误 0 警告（⑤ 例外 = 4 条已知 DC 观测告警，见 8；中断会话另有同款）——全程无未捕获异常。

## 进程清理

续作会话收尾：Chrome CDP 9333 + vite dev server 5173 已停（复核端口释放）；临时 profile/探针脚本已删；无跨会话残留。
