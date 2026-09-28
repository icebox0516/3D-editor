# T021.8 Phase A——全项 A/B 标定测量（常量重锁依据采集）

> 任务：[tasks/021.8-calibration-acceptance.md](../../../tasks/021.8-calibration-acceptance.md) ｜ Epic：021-lod-representation ｜ 执行日 2026-09-24
> 范围：九项标定工作项（阈值三数 / 迟滞带 / 过渡带宽度 / low 回插 / canopy receive / mid depth / DC 增量红线 / focus 窗口 / 批次配置）——**只用确定性计数 + 像素探针 + 截图判读，零 FPS/frame-time**（归后续验收 Phase）。全部数值读数见 `calibration-data.json`；证据帧 79 张 PNG 同目录。
> 结论性质：本 Phase 产出**重锁依据**；常量落盘（src + 规范数值表）归 Phase B 收口执行。

## 结论总表

| # | 项 | 现值（候选） | 结论 | 证据锚 | 一句话依据 |
|---|---|---|---|---|---|
| ①a | highToMid | 6 | **维持 6** | `01a/01b/01c` + 平移量表 | m=6（16.7% 屏占比）硬切 pop = 0.167% 视口像素（3 树中 1 树切档），读图判读「可感知但轻微」——T006.5 锁定在新链复证成立 |
| ①b | midToCanopy | 16 | **维持 16** | `02-*`（12 帧 A/B + 2 zoom） | m=16 canopy 剪影/体量/绿覆盖保持且绿覆盖反高于 mid（卡片实心质量）；m=12 亦可接受=有提前空间，但无强证据 + legacy 直承保守偏高档 |
| ①c | canopyToCulled | 60 | **维持 60** | `01d–01k` + `03d/03e` | m=60（1.67% ≈18px）起退场合理，fade 带绿覆盖单调消解；带末 m=75 彻底无感（diff 0.072% 视口） |
| ①d | T006.6 Step3 平移量 | — | **全部 ≈0（≤0.42%）** | calibration-data item1 | 七个边界实测平移均在细扫步长分辨率内——稳定基准球消除档间平移反馈环，实证成立 |
| ② | hysteresisBand | 0.15 | **维持 0.15** | 振荡 6 组记录 | 三边界 ±5% 振荡零翻转（硬切位至多一次沉降后稳定）；升档线实测 5.08–5.10 = 6×0.85 精确 |
| ③ | TRANSITION_BAND_RATIO | 0.25 | **维持 0.25** | `03a–03e` | dither 带末无跳变（diff 0.157% 含相机位移）、fade 带末无感（0.072%）、f=0.5 颗粒像素级不过粗 |
| ④ | 乔木链 low 回插 | 不回插 | **维持不回插** | `04-*`（30 帧） | 屏占比 ≤6.25% 下 low 增益人眼不可辨（zoom 级才可辨）、绿覆盖反低于 canopy；成本面 3.4–4.8× 面 + 两次过渡纯增 |
| ⑤ | canopy receive | false | **维持 false** | `05-*`（4 帧） | 影确实落冠（机制验证）但 m≥16 冠均亮度差 0.5%、90–321px 不可辨；成本 programs +2 + 采样开销 |
| ⑥ | mid depth | full | **维持 full** | `06-*`（6 帧） | m≥8 不可辨成立但 m=6 带缘外推边缘可辨 + 确定性账目（DC/tri/programs）无明确收益（收益在 shadow fragment、本 Phase 禁 FPS）——变更证据不完整 |
| ⑦ | 双表示 DC 红线 ≤+30 | 候选 | **PASS（余量大）** | 两轮 DC 扫描序列 | 产品 1000 树实测**零增量**（客座并入既有 canopy 桶）；紧缩最坏构造峰值 +12（含结构性）/ 纯双表示 ≤+6 / 理论上界 +16 |
| ⑧ | FOCUS_PIN_WINDOW_MS | 600 | **维持 600** | rec4 时间线 + `08` | 实测窗口 607ms；pin 在窗口内于 canopy 距离强制 high、到期自动降档——0.6s 余韵量级未见偏短/偏长证据 |
| ⑨ | 批次配置（32m chunk + 2×2 合并） | 现状 | **够用，无需区域级合批** | `09-*`（2 帧）+ 序列 | 单树种 1000 树 8 桶 / DC 39；3 树种 2700 实例散布 111 桶 / DC 441 < legacy 650；13 树种大区域外推超线**记档归 Phase B DC 重锁** |

## 方法（公共）

- **chain 页**（`tools/calib-chain.html`）：真实调度路径 harness——021.7 chain-smoke 逐行同构（AssetRegistry 真注册表 → 三缓存 → AssetSourceRouter → RepresentationSourceRouter 门面 → InstancedAssetPool 三注入 + 真实 EditingPinHub），树种换 {celtis r=4.542 / camphor r=5.303 / salix r=7.174}。扩展三面：① LOD_THRESHOLDS 运行时覆写通道（同 m A/B 的 mid/canopy 强制帧来源——ES 活引用就地改属性，仅页内会话、用毕恢复）；② 逐对象状态直读（pool entries current/target/t/fade/culled）；③ 帧捕获 + 像素 diff + zoom 判读 overlay。金丝雀 PASS：viewport 1920×1080 / DPR 1 / canvas 恰满视口。
- **AB 页**（`tools/calib-ab.html`）：直挂 A/B 舞台——源全部经真实路由（low → ProceduralSourceCache、canopy → CanopySourceCache），cast/receive/depth 经 SHADOW_POLICY / shadowDepthMaterialOf 交付原语；Shadow 全链照抄 Renderer.ts 1036-1055 冻结常量（2048²/±160/near 1/far 400/bias −0.0004 + PCF——一个数不改）。三舞台均在 ±160 shadow 视锥内。
- **产品路径**：`http://localhost:5173` 主应用 + `window.__tree3aPerf`（place/view/stats）+ `window.__scatterSmoke`（scatter/stats）+ F 键（input.ts → focusObjects → pinFocus）+ 大纲行选中。
- 环境域全部照抄先例：T018 day 真实链、uTime 恒 0 静态帧。像素判读 = PNG 经多模态读图（承重结论附判读依据；两可处如实记两读）。

## 逐项小节

### ① 阈值三数 + T006.6 Step 3 平移量

**方法**：连续 m 扫描（非注入候选值）——相机按 celtis 口径 m 步进（m=(d/r)·tan(25°)，r=High 派生稳定基准球），每树以其**自身 m** 为判据（半径差异自然铺开判定点）；同 m A/B 用 pin（highToMid 位）或阈值覆写（midToCanopy 位）构造对照帧；细扫步长 0.02–0.1 测翻转点。

- **highToMid**：自然扫描 m∈{4.5,5.5,6,6.5,8}——m=6.0 边界帧全 high（边界含下侧）、6.5 切 mid（camphor/salix 各自 m 过线独立切，per-object 正确）。同 m=6.5 A/B：pin-high 帧 tri 107308 vs natural-mid 79670（Δ=27638=celtis high↔mid 全模差），DC 同 7（桶结构不变），像素 diff 3466px=0.167%。判读（`01b/01c` 多模态）：pop 集中在冠密度与叶簇边缘柔和度、剪影连续——**可接受**（T006.5 锁定复证）。
- **midToCanopy**：六档 A/B 对（`02-m2c-ab-*`）diff 从 3594px（T=12）单调降至 1023px（T=24）；绿覆盖率 canopy 恒高于 mid（10–18×，卡片实心绿 vs 叶簇空隙——**绿覆盖连续性受益**）。zoom 判读（T=16 对 + salix 对）：canopy 冠剪影连贯、内外明暗梯度在场、无接缝破洞；celtis 原生 67px 下 low↔canopy 差异不可辨；salix 垂幕特征弱化（泛化冠形）——zoom 级可辨、原生不可辨（树种级冠形差异 = 远景验收第 4 条的已知弱保持折衷，如实记档）。m=12 帧判读形态完整 = **有提前空间**，但默认倾向维持（legacy 直承 + 保守偏高档），变更需强证据——**维持 16**。
- **canopyToCulled**：`01d–01k` 八帧 + f 值核验（f=(m−60)/15 逐帧精确：0.333/0.5/0.667/1）；绿覆盖沿带单调消解；m=75 culled 后无残影（DC 5/tri 976 账目自洽）。判读：m=60 树仍可辨（~18px 绿点）但 fade 渐退使其不突兀、60 之后保留成本（canopy 桶 + 2 DC/树种槽）收益递减——**合理，维持 60**。
- **平移量（T006.6 Step 3 吸收）**：七边界实测全部 ≤0.42%（≤ 细扫步长）——high→mid 降档 6.00→6.02、升档 5.10→5.08（=5.1 精确）、dither 起坡 16.02→16.04、带末完成 19.95→20.00、升档完成 9.64→9.60（=9.6 精确）、fade 起坡 60.00→60.02、un-cull 75.0→74.9。**结论：稳定基准球使 m 恒定、无档间平移反馈环**（006.6 Step 2 交付的实证闭环）。

### ② 迟滞带 0.15

±5% 振荡 8 轮 × 双侧起步 × 三边界：6 位近侧起步 1 次沉降后 16 步零回翻、远侧零翻转；16/60 位双侧零翻转（dither/fade 带吞没偏移，current 不变仅 t 摆动）。升档线细扫直证 5.08–5.10=6×(1−0.15)。**0.15 充分，维持。**

### ③ 过渡带宽度 0.25

- 带端判读：dither 带末 (19.7 f=0.925 双提交 DC11) → (20.3 稳态 DC9) diff 3245px=0.157%（含相机 0.6m 位移 + camphor 入带推进）——**带完成瞬间无可辨跳变**。
- fade 带末 (74.7 f=0.98) → (75.3 culled) diff 1500px=0.072%——**彻底无感**。
- 颗粒判读（`03a` 10.7× zoom @m=18 f=0.5）：像素级盐椒、原生分辨率融入纹理、剪影完整——**不过粗**（两读一致：静态帧不显著；运动中或呈轻微 shimmer 属 dither 固有、非颗粒粗细问题）。
- 带宽语义注记：0.25 → m=16 档带跨 m∈[16,20]（屏占比 6.25%→5%）；静止相机停带内持续双提交（DC 面 ⑦ 实测零增量，窗口成本可忽略）。**维持 0.25。**

### ④ 乔木链 low 回插

24 帧矩阵（3 树种 × {low, canopy} × m∈{16,20,30,45}）+ 6 zoom。面账：celtis 2358/487=4.84×、camphor 4.59×、salix 3.57×。绿覆盖矩阵（calibration-data item4）：**canopy 全档全树种高于 low**（m=45 时 low 读作像素尘：camphor 6e-6、salix 0）。zoom 判读：low 的叶片轮廓/冠内通透增益在 16× zoom 下可见、原生 67px 树高下不可辨；salix 垂幕特征在 low 侧清晰、canopy 侧弱保持（原生不可辨）。成本：+1 桶维度（全树种 sourceKey::low）+ 分段链两次过渡（两个 pop 窗口 + 双表示窗口 ×2）。**结论：不回插，无分段建议。**

### ⑤ canopy receive 阴影 A/B

真实源直挂 + 3 棵 high caster 上风向散布（caster 位 = 太阳方向反推）。m=16：receive false→true 冠均亮度 179.33→178.49（−0.5%）、diff 321px、programs 10→12（+2 冠卡阴影采样变体）、DC 不变；m=30：diff 90px。机制验证（`05-receiveAB-true-m16` 读图）：caster 地面影清晰在场、冠区差异集中 = 影确实落冠、receive 通道真实生效——**不可辨是距离尺度问题非机制缺失**。**维持 false。**

### ⑥ Mid depth full/simplified

m∈{8,16}（78m/156m，任务书 64–172m 量级内）+ m=3 近距对照。m=16 diff 172px、m=8 diff 804px（不可辨）；m=3 近距 diff 9449px（实心卡影致密 +57% 暗像素——与 021.5 low 结论同向，SDF 缺刻收益只在近距显现）。物理原因：0.156 m/txel 下 mid 叶簇卡 ≈2–3 txel，缺刻结构在分辨率极限。成本：DC/tri 全等（SDF 改 shadow pass fragment 不改几何）；programs 侧 full 需 SDF 深度变体。**判定：视觉不可辨在 mid 段成立，但成本收益无法用确定性账目证明（收益在 fragment 内、禁 FPS），且 m=6 带缘外推 ~0.13% 处边缘可辨——变更证据不完整，保守维持 full。**（Phase B 若 shadow cost 线需要，可凭本项视觉面数据直接重判。）

### ⑦ 双表示 DC 增量 +30 红线

- 读出面如实记档：`__scatterSmoke.stats().lod` = {instances, buckets} **无 transition/dualSubmitBuckets 面**；DC 经 `__tree3aPerf.stats().drawCalls`。
- 产品场景（place 1000 单树种，d 120→240 穿带）：DC 95→67 **单调下降零增量**——dither 客座实例并入**既有** canopy 槽桶（同 sourceKey::canopy），不新建桶。
- 最坏构造（place 100 紧缩网格，带入口 canopy 桶 5→8 渐建）：稳态 55 → 峰值 67（+12，其中 +6 为 canopy 桶结构性增长——迁移完成后永久存在非过渡成本）；同机位稳态假想 DC ≈ 同值（混合槽桶结构相同）→ **纯双表示份额 ≤+6**；理论上界 = 客座桶 ≤ 槽数 8 × 2 材质组 = **+16 < +30**。PASS 余量大。

### ⑧ FOCUS_PIN_WINDOW_MS=600

触发 = 产品路径（大纲行选中 → F 键 → focusObjects → pinFocus）；窗口内取消选中用页内合成 canvas 空白点击（产品 pick→deselect 处理器同路，记档）。时间线（rec4）：F 生效 t=384（相机跳近 m≈1.4，h=45）→ 同刻回拉 d=400 → t=484 恢复远景而 **pin 目标仍 high（h=1/c=49）** → t=510 撤选中（选中 pin 抬离，focus 窗口仍在）→ **t=991 掉档（h=0/c=50）**——**实测窗口 607ms ≈ 600 + 帧粒度**。行为面：选中即 pin（canopy 距离强制 high，`08` 证据帧：h=1/c=49 同帧）；窗口外撤选中立即硬切降档（021.7 帧 11 语义产品路径复现）。**裁定：维持 600**——focusBox 取景 m≈1.4 天然 high，窗口 = 迟滞带兜底 + 窗口内取消选中/未来飞行动画的过渡覆盖；0.6s 余韵未见偏短（掉档前有充分观察窗）或偏长（非编辑态占用 <0.7s）证据。

### ⑨ 批次配置复核

- 放置链：place 1000（夏栎 8 槽）d=420 全 canopy 视距 → **buckets.canopy=8**（= 槽数上界）、DC 39。
- 散布链：3 树种 × 300×300m × density 0.03（2700 实例）d=450 → 100 chunks / **buckets.canopy=111**（≈3×37，2×2 稀疏合并生效：64m 超块量级）/ **DC 441 < legacy 650**。
- **判定：32m chunk + 2×2 合并够用**（单树种 8 桶 + 代表负载 111 桶/441 DC 均在线内），无需区域级合批。**记档外推**：13 树种同规模混植 ~480 canopy 桶 / DC ~1900+ 超 legacy 650——多树种大区域混植的 DC 基线归 Phase B 性能梯队（§九 drawCallBudget 重测重锁）判定，本 Phase 不扩结论。

## 异常与边界记档

1. `__scatterSmoke.stats().lod` 无 transition 计数面（形状 dump 如实记）——dualSubmitBuckets 峰值不可读，以 DC 增量为权威口径（规范 §5.2 本就以 DC 为红线）。
2. dither 决策遇冷桶排队一帧（021.7 观察 1 同款）：带入口首帧 t=0 排队、次帧起 f(m)——本 Phase 测量序列均以双步落定规避，语义与 021.7 记档一致。
3. 产品路径 1000 树场景中 variants 小尺度树（scale<1 → m 放大）使 canopy 判定早于标称距离出现——非缺陷（m 口径按 r×scale 归一，spec 语义），记录于 ⑦ 场景注记。
4. salix 树种级冠形（垂幕）在 canopy 侧弱保持——021.6 交付的已知折衷（统一 BroadleafCanopyProxy vs 树种级冠形特征），原生分辨率不可辨、zoom 可辨；远景验收第 4 条（树种级冠形可辨）执行时按此基线判读。
5. 三轮会话 console 全程 0 错误 0 警告；无渲染缺陷发现（D1 修复后的 fade 路径在 79 帧证据中零异常）。

## 帧清单索引

`01*` = ①阈值（h2m 边界与 A/B、c2c 扫描）｜`02*` = ①b midToCanopy（自然扫描 6 帧 + A/B 12 帧 + zoom 2）｜`03*` = ③带端与颗粒（5 帧含 2 zoom）｜`04*` = ④low/canopy（24 帧 + 6 zoom）｜`05*` = ⑤receive（4 帧）｜`06*` = ⑥mid depth（6 帧）｜`08*` = ⑧pin 产品帧｜`09*` = ⑨批次（2 帧）。全部数字读数（逐帧 m/分布/DC/tri/programs/像素探针/时间线）见 `calibration-data.json`。
