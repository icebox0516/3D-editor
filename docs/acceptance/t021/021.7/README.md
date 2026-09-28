# T021.7 canopy 全链调度冒烟——真实调度路径取证 + 编辑态 pin 行为

> 任务：[tasks/021.7-wiring-editing-pin.md](../../../tasks/021.7-wiring-editing-pin.md) ｜ Epic：021-lod-representation ｜ Step C 视觉冒烟取证 ｜ 执行日 2026-09-24（同日 D1 修复复验收口）
> 验证对象（021.7 交付面）：两链接线后的**真实调度路径**——`RepresentationSourceRouter` 门面（h/m/l → ProceduralSourceCache、canopy → CanopySourceCache）× `InstancedAssetPool.frameLod`（表示链选档 + 过渡状态机执行）× 编辑态 pin（`EditingPinHub` + `frameLod` 第三参 pinIds → `pinnedSelectionOutcome`）。
> **结论先行：首轮取证发现渲染缺陷 D1（fade 包装几何丢失 `groups`，dither/fade-out 像素面整树消失）→ threejs-runtime-agent 修复（`fadeGeometry.acquire` 值拷贝 groups/drawRange/morphAttributes，npm test 4237 全绿）→ **同 harness 确定性重放复验**：D1 两项 FAIL 全部翻转为 PASS（dither 像素渐进、fade-out 渐进退场），其余全项（门面路由 / 序列单调 / culled 清零 / pin / console 0 错误）无回退。全项 PASS。**

## 方法（真实调度路径 harness——比 021.3 材质面冒烟更进一步）

- 页面：`tools/chain-smoke.html` + `tools/chain-smoke-page.ts`（Vite dev 直 serve docs 路径、`/src/...` 绝对导入、console 捕获面——021.3 同款先例）。
- **装配 = Renderer.ts L449-L511 逐行同构**（非手工摆材质）：`AssetRegistry`（`collectProceduralAssetMetas` 真注册表）→ `AssetLoader` + `ProceduralSourceCache` + `CanopySourceCache` → `AssetSourceRouter` → `RepresentationSourceRouter`（providers 注册 canopy 行）→ `InstancedAssetPool`（provideSource 走门面 / resolvePoolKey 查注册表 shapeFamily 槽路由 / getRepresentationCapability 同源投影）。编辑态 pin = 真实 `EditingPinHub` + bootstrap 同款活信号源（selected 集 live 读）。
- 场景：3 树种各 1 实例（不同对象 seed → 不同槽）：celtis（seed 101 → slot-1，r=4.542）居中 = **m 读数口径**、camphor（seed 202 → slot-2，r=5.303）x=+16m、tree3a（seed 303 → slot-2，r=4.787）x=−16m；三树均声明 `representations: ['high','mid','canopy']`。环境域 = T018 day 真实链（SkyCore → PmremEnvironment 初烘 → environmentIntensity 0.15、主光 = day 太阳方向 × LEGACY_SUN_DISTANCE、地面大平面——照抄 021.6 配方）；相机 fov 50 / 1920×1080 DPR1 / preserveDrawingBuffer / near 1 far 10000；uTime 恒 0；无 shadow pass（边界记档§3）。
- **驱动 = 真状态机逐帧步进**：`step(m)` = 相机移到 m（celtis 口径 m = (d/r)·tan(fov/2)，r = High 档源派生稳定基准球半径——与池内 `LodReferenceSphereCache` 冻结值同源同值）→ `pool.frameLod(camera, true, hub.getIds())`（单次调用 = 状态机推进一帧）→ 微任务落定（源 `.then` 回调：建桶 / `applyPendingMigrations` 迟到迁移——真实连续渲染中发生在下一帧前）→ 渲染 → 记录分布统计（`getLodDistribution`）+ 渲染账目 + 像素探针（全帧绿色覆盖率 021.6 同式 + 非背景覆盖率）。init 时经门面预热 9 源（3 树 × high/mid/canopy）并跑 4 帧 prime（触发各池创建后回 high 稳态）。
- 阈值（lodPolicy 候选值）：highToMid 6 / midToCanopy 16 / canopyToCulled 60 / 迟滞 0.15 / 过渡带宽 0.25。dither 降档带 m∈[16,20]（f=(m−16)/4）、fade-out 退场带 m∈[60,75]（f=(m−60)/15）。
- 浏览器自动化：agent-browser（CDP；browser-use 子代理不可用 → 021.3/021.6 同款路径）。金丝雀 PASS：viewport 1920×1080、canvas 1920×1080、DPR 1——截图 = 画布像素 1:1。帧序列确定性复核：01/02/03a 在两个独立会话重放，全部统计逐位同值。
- **D1 修复复验（第二轮，同日）**：src 工作树吃到 `fadeGeometry.acquire` 修复后，同 harness / 同 init / 同帧序列**确定性重放全部 15 帧**——未受 D1 影响的帧（01/02/03a/09b/12/13）统计逐位不变（回归无扰动），受影响帧（03b–11）数字翻转见下表与 D1 节「修复复验」。修复前缺陷帧以 `*-pre-fix.png` 保留对照，规范名 PNG = 修复后（post-fix）帧。

## 帧清单（15 帧 + 1 辅证 zoom——修复后 post-fix 数字；受 D1 影响帧的修复前对照见 D1 节）

逐树 m 值列出（celtis 口径 m 下 camphor/3a 的实际读数——半径不同故逐树有差）；instances = currentRepresentation 口径实例计数，DC = drawCalls，tri = triangles，green = 全帧绿色覆盖率。分布计数列（instances/buckets/transition）修复前后**逐位一致**（状态机面不受 D1 影响）——表值为修复后会话读数。

| 文件 | m（celtis / camphor / 3a） | 距离 celtis | instances（h/m/can/cull） | buckets | transition | DC | tri | green | programs |
|---|---|---|---|---|---|---|---|---|---|
| `01-high-steady.png` | 3 / 2.21 / 3.74 | 29.2m | 3/0/0/0 | 3/0/0/0 | 0 | 7 | 106394 | 2.6927% | 21 |
| `02-mid-hardcut.png` | 8 / 6.19 / 8.38 | 77.9m | 0/3/0/0 | 0/3/0/0 | 0 | 7 | 25390 | 0.0863% | 21 |
| `03a-dither-entry-queue.png` | 17 / 13.82 / 16.88 | 165.6m | 0/3/0/0 | 0/3/0/0 | 0（排队不计） | 7 | 25390 | 0.0074% | 21 |
| `03b-dither-025.png`（+`-zoom2x.png`） | 17 / 13.82 / 16.88 | 165.6m | 0/3/0/0 | 0/3/2/0 | inst 2 / dual 2 / target canopy 2 | **11** | **26364** | 0.0257% | 21 |
| `04-dither-050.png` | 18 / 14.67 / 17.83 | 175.3m | 0/3/0/0 | 0/3/2/0 | inst 2 / dual 2 / target canopy 2 | 11 | 26364 | 0.0393% | 21 |
| `05-dither-075.png` | 19 / 15.52 / 18.78 | 185.1m | 0/3/0/0 | 0/3/2/0 | inst 2 / dual 2 / target canopy 2 | 11 | 26364 | 0.0504% | 21 |
| `06-canopy-steady.png` | 22 / 18.09 / 21.62 | 214.3m | 0/1/2/0 | 0/1/2/0 | 0 | 7 | 9606 | 0.0506% | 21 |
| `07-fadeout-027.png` | 64 / 54.02 / 61.45 | 623.3m | 0/0/3/0 | 0/0/3/0 | inst 2 / target canopy 2 | 7 | 1463 | 0.0078% | 21 |
| `08-fadeout-067.png` | 70 / 59.16 / 67.14 | 681.8m | 0/0/3/0 | 0/0/3/0 | inst 2 / target canopy 2 | 7 | 1463 | 0.0047% | 21 |
| `09-culled.png` | 80 / 67.72 / 76.63 | 779.2m | 0/0/1/2 | 0/0/1/2 | inst 1 / target canopy 1 | 3 | 489 | 0.0008% | 21 |
| `09b-culled-all.png` | 90 / 76.29 / 86.12 | 876.6m | 0/0/0/3 | 0/0/0/3 | 0 | **1** | **2** | **0%** | 21 |
| `10-pin-high.png` | 22（pin camphor） | 214.3m | **1**/0/2/0 | 1/0/2/0 | 0 | 7 | **36062** | 0.0513% | 21 |
| `11-unpin-restore.png` | 22（撤 pin） | 214.3m | 0/0/3/0 | 0/0/3/0 | 0 | 7 | 1463 | 0.0762% | 21 |
| `12-recull.png` | 90 | 876.6m | 0/0/0/3 | 0/0/0/3 | 0 | 1 | 2 | 0% | 21 |
| `13-pin-uncull.png` | 90（pin camphor） | 876.6m | **1**/0/0/2 | 1/0/0/2 | 0 | 3 | **35088** | 0%（≈11px 探针不可辨，zoom 判读✓） | 21 |

（tri 含地面 2；03b DC 11 = 地面 1 + camphor mid 2 组 + celtis/3a mid 各 2 组 + 两 canopy 客座各 2 组——**过渡树两组材质全在提交账目**；06 DC 7 = 客座拆除后 2 canopy × 2 组 + camphor mid 2 组 + 地面，tri 9606 = 2×487 + 8630 + 2；07 DC 7 = 三 canopy × 2 组 + 地面，tri 1463 = 3×487 + 2。shadowCasterInstances 正常态恒 3、culled 帧归 0、pin 帧 10/13 = 3/1。programs 修复后会话 21 恒定（首轮会话曾记 19→21——canopy 程序编译时点会话间差异，计数面无行为影响，两轮会话内各自恒定零重编译）。）

## 验证项结果

### 1. 真实调度链装配可达（门面路由 × 表示链选档 × 跨桶迁移）— PASS

- 3 树 × 3 表示全部经 `RepresentationSourceRouter` 门面供给：h/m/l 命中 ProceduralSourceCache（sourceKey::representation 双维键）、canopy 命中 CanopySourceCache（021.6 工厂 + bounds）——换档全程无 reject、无「canopy 源未注册」防御路径触发。
- 选档读数逐帧与阈值结构一致：m=8 全 mid（硬切，tri 106394→25390 即时）；m=17 起 celtis/3a（m>16）进入 dither 而 camphor（m=13.8<16）保持 mid——**同帧多树不同判定**，per-object 评估正确；m=22 celtis/3a 完成 canopy（f=(m−16)/4≥1 clamp）；m>60 fade-out；m≥75 逐树 culled（09b 全 culled）。
- **表示序列单调无震荡**：径向单调拉远全程 current 从未回跳（instances 计数序列 high→mid→（dither 期 mid 属主+canopy 客座）→canopy→culled 单调推进，无任何帧出现逆向计数）。

### 2. dither 带双表示并存 — **PASS**（首轮像素面 FAIL 经 D1 修复复验翻转）

- **计数面（两轮一致）**：03b–05 三帧 `dualSubmitBuckets=2`（celtis+3a 各自客座桶提交）、`transitionInstances=2`、`transitionTargets.canopy=2`；运行时直读桶内部核对 fade 值逐位正确——celtis 属主 fadeOut=0.25（f=(17−16)/4 精确值）+ 客座 0.75（互补恒和 1）；3a 属主 0.221（f=(16.882−16)/4=0.2205 精确值）+ 客座 0.779。状态机与统计面 021.3 单测语义在真实渲染链复现成立。
- **像素面（修复后）**：过渡树不再消失——DC 11 / tri 26364 的账目含**过渡两树全部五个网格的两组材质**（3 mid 属主 + 2 canopy 客座，见帧清单注）；绿色覆盖率随 f 单调推进 03a 0.0074%（全 mid）→ 03b 0.0257% → 04 0.0393% → 05 0.0504% → 06 canopy 稳态 0.0506%（完成帧与 05 帧衔接无跳变——dither 带末到稳态连续）；zoom 判读：两过渡树呈 f=0.25 盐椒颗粒溶解、冠剪影完整（021.3 材质面溶解行为在真实调度路径复现）。修复前该面 FAIL（整树消失，DC 3 / green 0.0010%），对照见 D1 节。

### 3. fade-out 退场带渐进 — **PASS**（首轮像素面 FAIL 经 D1 修复复验翻转）

- 计数面（两轮一致）：07/08 帧 celtis（f=0.267/0.667）与 3a（f=0.097/0.476）`transitionActive`、按退场中表示归档 canopy；09 帧 celtis/3a 过线 culled（instances.culled=2）+ camphor（f=0.51）仍在退场——逐树状态精确。camphor 的 m 跳变语义见观察记档§2。
- 像素面（修复后）：三树全渲染（07 帧 DC 7 / tri 1463 = 3 canopy × 2 组 + 地面——修复前同帧 DC 3 仅 1 树可见）；绿色覆盖率沿退场带单调消解 0.0078% → 0.0047% → 0.0008% → 0%（07→08→09→09b）——**渐进退场而非瞬时蒸发**（修复前 camphor 首次写 fade 当帧从 489 tri 整体蒸发为 DC 1 / green 0）。

### 4. culled 终态清零（无残影、无实例）— PASS

- `09b-culled-all.png` / `12-recull.png`：instances.culled=3、buckets.culled=3、**drawCalls=1（仅地面）、triangles=2（仅地面）、绿色覆盖率 0**——树实例零提交零像素，无残影。回视恢复路径亦验：10 帧拉回 m=22 时 celtis/3a 从 culled 自动恢复 canopy（升档方向迟滞判定 m<60×0.85 通过）。
- `shadowCasterInstances` 同步归 0（提交终态 cast 双 false 的 belt-and-braces 口径在计数面自洽）。

### 5. 编辑态 pin 行为 — PASS（两轮一致，修复后账目更完整）

- **pin → 强制 high**（帧 10，m=22 canopy 距离，pin camphor）：instances **high+1**（1/0/2/0）；camphor 以高档满细节渲染——修复后 tri 36062 = camphor high 全模 35088 + celtis/3a 两棵 canopy 974 + 地面 2（修复前 35088 = 仅 pinned 树可见，celtis/3a 被 D1 吞没）；**近景细节回归账目级成立**（同帧 pinned 对象 35k tri vs 其余 487 tri/棵）。同帧 celtis/3a 恢复 canopy——「编辑目标高档、其余正常调度」并存。
- **撤 pin → 恢复**（帧 11）：同帧 hard-cut 回 canopy（instances 0/0/3/0、tri 36062→1463——三树全数恢复 canopy 卡，green 0.0762% 为三卡满绿峰）。**实际语义 = 立即恢复**（非迟滞带内保持）：pin 期已把迟滞参考收敛为 high，撤 pin 后降档方向过名义线立即执行（16 < m=18.09）——与 D41 §十二「迟滞参考已随 pin 期收敛高档，按当帧距离重判」语义一致，记档。
- **pin 解除 culled**（帧 13，m=90 全 culled 态 pin camphor）：instances **high=1 / culled=2**，pinned 对象跨 cull 线强制高档现身——zoom 判读确认 868m 外单棵完整树剪影（干 + 冠）在场、地平线洁净；triangles 35088 账目自洽（修复前后同值——该网格从未包装，不受 D1 影响）。「选中远处对象所见即所得」成立。
- pin 集经真实 `EditingPinHub.getIds()` 每帧派生（帧返回的 `pins` 字段逐帧留痕），退出 pin 零残留。

### 6. console / shader 错误 — PASS

两轮会话全程（init 预热 + prime + 15 证据帧 × 各 2 次 + 重放）**0 错误 0 警告**（`consoleDump()` 复核空数组）。canopy/mid/high 材质与深度材质编译零告警；programs 会话内恒定（修复后 21 恒定，无重编译抖动）。

## 缺陷记档 D1（首轮发现 → 已修复 → 复验翻转）

**fade 包装几何丢失 `geometry.groups`——多材质（成套材质数组）桶一旦写出 fade 值即整桶零渲染项（整树消失）。**

- **位置**：`src/runtime/instancing/fadeGeometry.ts` `FadeGeometryPool.acquire`（首轮 L50-L70）：包装时拷贝全部顶点属性 / 索引 / 包围盒球引用，**未拷贝 `groups`**。`InstancedAssetPool.writeEntryFade → ensureFadeBuffer` 换装包装几何后，材质数组网格（13 乔木 mid/high = [皮,叶]、canopy = [干柱,冠卡] 均 2 组）在 three WebGLRenderer 的材质数组渲染路径按 `geometry.groups` 逐组建渲染项——空 groups = **零渲染项 = 网格整体不可见**（无报错、静默）。
- **运行时确诊**（首轮重放会话，dither 帧逐桶直读）：celtis/3a mid 桶与两 canopy 客座桶均 `meshGeometryIsWrapper=true, meshGroups=0`（源几何 `sourceGroups=2`）；camphor（稳态未包装）`meshGroups=2` 正常渲染。像素 + 渲染账目双重吻合：03b 帧 DC 3 / tri 8632 = 地面(1,2) + camphor mid 两材质组(2,8630)，过渡两树零提交。09 帧补充证据：camphor 首次写 fade（f=0.51 退场）当帧从可见（489 tri）变为零提交（DC 1）——「写 fade 即消失」因果链闭合。
- **影响面**：放置链（InstancedAssetPool）与散布链（ScatterChunkManager 共用 `ensureFadeBuffer`/`writeFadeRange`）**全部 dither/fade-out 视觉路径**；021.3 未暴露是因为其冒烟页将 aFadeOut 直挂非共享源几何（不走包装池——其 README「池语义非本页验证面」边界的正下方即本缺陷）。
- **不受影响的交付面**（首轮已验 PASS）：状态机、门面路由、分布统计、桶迁移/客座生命周期、pin、culled——D1 纯视觉层。

### D1 修复复验（threejs-runtime-agent 修复 → 本 Step 同 harness 确定性重放收口）

- **修复面**：`fadeGeometry.ts` `acquire` 补齐包装面拷贝——`groups` 逐组 `addGroup` 值拷贝（不共享组引用）+ `drawRange` 值拷贝 + `morphAttributes` 键图浅拷（条目引用共享）+ `morphTargetsRelative`；`npm test` 4237 全绿（回归测试随修复落地）。
- **复验方法**：同 harness / 同 init / 同 15 帧序列确定性重放（金丝雀同口径 PASS）；未受 D1 影响帧（01/02/03a/09b/12/13）统计逐位不变——回归无扰动。
- **判据翻转数字对照**（修复前 → 修复后；分布计数两轮逐位一致，仅列像素/账目面）：

| 帧 | 指标 | 修复前（FAIL） | 修复后（PASS） |
|---|---|---|---|
| 03b dither f=0.25 | DC / tri / green | 3 / 8632 / 0.0010%（两过渡树消失） | **11 / 26364 / 0.0257%**（五网格两组材质全提交） |
| 04 dither f=0.50 | green | 0.0008% | 0.0393% |
| 05 dither f=0.75 | green | 0.0006% | 0.0504% |
| 06 canopy 稳态 | DC / tri / green | 3 / 8632 / 0.0003% | 7 / 9606 / 0.0506%（与 05 衔接无跳变） |
| 07 fade-out f≈0.27 | DC / tri / green | 3 / 489 / 0.0025%（仅 1 树可见） | 7 / 1463 / 0.0078%（三树全渲染） |
| 08 fade-out f≈0.67 | green | 0.0023% | 0.0047% |
| 09（camphor f=0.51 退场中） | DC / tri / green | 1 / 2 / 0（整树蒸发） | 3 / 489 / 0.0008%（半退场残存） |
| 10 pin | DC / tri | 3 / 35088（仅 pinned 可见） | 7 / 36062（+2 canopy 树同帧在场） |

- **渐进性判读**：dither 带绿色覆盖 0.0074%（03a 全 mid）→ 0.0257% → 0.0393% → 0.0504% → 稳态 0.0506% 单调推进、带末无跳变；fade-out 带 0.0078% → 0.0047% → 0.0008% → 0% 单调消解、终态零残影（09b 两轮同值）。zoom 判读（`03b-dither-025-zoom2x.png` 修复后 vs `*-pre-fix.png` 修复前）：过渡树从「完全缺失」变为「f=0.25 盐椒颗粒溶解、冠剪影完整」。
- **结论**：D1 关闭——dither 与 fade-out 像素面判据翻转为 PASS，全项 PASS；散布链共用路径同步被修复覆盖（其视觉抽查仍留 021.8，见观察记档§5）。

## 观察记档（非缺陷）

1. **dither 决策遇冷桶排队一帧**（03a / 06 帧的 camphor）：目标桶被拆空重建后（prime 回 high 时 mid/canopy 桶 teardown），首次 dither 决策帧 `sourceReady=false` → 排队（`transition.instances` 不计、无客座、旧表示持续渲染——03a 帧与 02 帧逐位同画面）；源就绪后**下一帧** frameLod 起效（03b）。硬切位则经 `applyPendingMigrations` 在源到达回调内自愈（02 帧当帧即迁）——两类分型的排队语义差异在真实链实证，与 transition.ts 头注「dither 排队不在此收敛；迟到一帧可接受」一致。
2. **m 跳变时 f(m) 纯函数直落**：22→64 一帧跳过 camphor 的 dither 带（其 f=(54−16)/4 clamp 1），camphor 在 07 帧直接完成 mid→canopy 迁移（instances.canopy=3）；同理 22→90 使 fade-out 一帧到终态。连续变焦下不发生（带内逐帧推进）——本取证用离散跳帧压缩序列，语义为过渡进度的 m 纯函数性（帧率无关）佐证。
3. **Mid→Culled 瞬时路径本序列未触达（记档澄清）**：camphor 虽在 06 帧 m=18 仍 mid（排队），但 07 帧 m=54 时 f=(54−16)/4 clamp 1 直接完成 mid→canopy，越过 cull 线（60）时已是 canopy 起点——走 fade-out 退场（09 帧 f=0.51 退场中）。mid 起点的瞬时 cull 规则（transition.ts `CULL_FADE_OUT_FROM` 授权集外）在本取证帧序列中未出现，其语义由单测锁定；连续变焦下对象必先完成 canopy 再退场，本路径差异仅由跳帧压缩序列触发。
4. 无 shadow pass（沿 021.3 边界；castShadow 标志由池按策略维护、shadowCasterInstances 计数面已核）；uTime 恒 0 静态帧；aSeed 风相位冻结。
5. 散布链抽查跳过（时间盒）：ScatterChunkManager 装配需 region/chunk 管线成本高；散布与放置共享 domain 分型表与 `fadeGeometry` 写出路径——**D1 修复（acquire 包装面拷贝）同步覆盖散布链共用路径**，散布面视觉抽查留待 021.8 远景验收一并执行更有效；机制面测试覆盖见测试面（复验时点 4237 全绿）。

## 清理

两轮取证（首轮 + 修复复验）收尾均进程用完即清：agent-browser 浏览器已 `close`（chrome-for-testing 残留 0）、vite dev server 已停（首轮 PID 28252、复验轮 PID 17644）、端口 5173 两轮均复核释放（连接拒绝）——无跨会话残留。
