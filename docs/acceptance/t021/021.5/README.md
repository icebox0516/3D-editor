# T021.5 Shadow Representation——阴影策略三态像素级冒烟取证

> 任务：021.5 交付面冒烟验证（Shadow Policy 策略层直消费；canopy 生产路径 021.7 前不可达，沿 021.3/021.6 先例以工厂直消费验证执行面语义）｜ Epic：021-lod-representation ｜ 执行日 2026-09-24（主代理执行——通用子代理派遣撞用量上限改主代理直跑，harness 页面为中断前子代理产物经主代理审查续用 + 探针亮底参考两轮修正）
> 验证对象：`src/domain/lod/shadowPolicy.ts`（策略表 / 查询 / cast 判定原语）+ `InstancedAssetPool.shadowDepthMaterialOf`（depth 三档 → customDepthMaterial 挂载原语）+ `TransitionCommit.shadowRepresentation` 中点切换语义（021.3 钩子的消费面摆位）。

## 方法（最小渲染 harness，策略层原语直消费）

- 页面：`tools/shadow-smoke.html` + `tools/shadow-smoke-page.ts`（Vite dev 直 serve docs 路径，`/src/...` 绝对导入——先例同款）。**装配全走交付原语**：每树 cast/receive = `shadowPolicyOf(rep)`、depth 挂载 = `shadowDepthMaterialOf(rep, source)`、中点摆位 = `isShadowCasterFor(rep, shadowRep)`——harness 不手写任何策略值。
- 场景：celtis（朴树，021.3 同款 slot-0 种子）四树装配——high(x=−25) / low(x=0) / canopy+mid 同位(x=+25，midpoint 帧专用)；普通 Mesh 直挂（无池）。**low 的 source 刻意携带 LOW SDF 深度材质**（「提供也不挂」验证面）。
- 环境域 = T018 day 真实链（照抄 021.3/021.6）：SkyCore(day) → PMREM → environmentIntensity 0.15 + day 太阳方向主光；uTime 恒 0。**Shadow 全链照抄 Renderer.ts 1036-1055 冻结常量**：`shadowMap.enabled + PCFShadowMap`、mapSize 2048²、±160、near 1 / far 400、bias −0.0004——一个数不改（页面 `shadowConstants` 面板逐值回读核对）。
- 像素探针（页内直读 preserveDrawingBuffer）：目标树影足迹 = 树 bbox 沿光向投到 y=0 的外接矩形投屏；亮底参考 = 影心 + 相机右向 18m 无影锚点投影采样中位数（几何锚定，机位无关）；暗像素阈 = 亮底 × 0.75；指标 = 影区暗像素数 / 覆盖率 / 影内亮度均值与标准差。
- 浏览器：agent-browser（CDP），视口 1920×1080 DPR1，canvas 恰满视口（截图 = 画布像素 1:1）。

## 挂载面快照（depth 三档的机制证据——stats().rigs）

| rep | 源提供的深度材质 cacheKey | 实际挂载 | cast | receive | 结论 |
|---|---|---|---|---|---|
| high | `celtis:leaf-depth` | `celtis:leaf-depth` | true | true | full → 挂源 SDF ✓ |
| mid | `celtis:leaf-depth:mid` | `celtis:leaf-depth:mid` | true | true | full → 挂源 SDF ✓ |
| low | `celtis:leaf-depth:low` | **null（未挂）** | true | true | simplified → **源有也不挂**（three 缺省实心几何深度，零 SDF）✓ |
| canopy | `canopy:depth:asset_tree_celtis` | `canopy:depth:asset_tree_celtis` | true | **false** | simplified → 挂 021.6 轮廓级深度 + receive=false ✓ |
| （culled 态 canopy） | — | — | **false** | **false** | 提交终态 belt-and-braces（visible=false + 双 false）✓ |

## 帧清单（9 帧 + 指标）

| 文件 | 状态 | 影足迹暗像素 | 覆盖率 | 影内 σ | dc / tri |
|---|---|---|---|---|---|
| `overview.png` | 三树全景稳态 | high 4476 / low 3119 / canopy 1382 | 0.057 / 0.085 / 0.065 | 24.1 / 18.7 / 22.6 | 13 / 85224 |
| `detail-high.png` | high 影特写 | 15856 | 0.062 | **27.0** | 9 / 81979 |
| `detail-low.png` | low 影特写 | 22057 | **0.086** | 22.4 | 11 / 84737 |
| `detail-canopy.png` | canopy 影特写 | 18345 | 0.069 | 23.6 | 13 / 85224 |
| `midpoint-before.png` | 双表示共存、恰 mid cast（shadowRep=mid） | 9979 | 0.039 | 28.5 | 15 / 103261 |
| `midpoint-after.png` | 双表示共存、恰 canopy cast（shadowRep=canopy） | 19669 | 0.076 | 24.8 | 15 / 94486 |
| `midpoint-both.png` | 反事实双投对照（双侧 cast，非生产语义） | 23485 | 0.092 | 22.9 | 17 / 103748 |
| `mid-single.png` | mid 单 caster 基线（canopy 隐藏） | 8469 | 0.033 | 30.4 | 13 / 102774 |
| `culled.png` | canopy cull 终态（visible=false） | **0** | **0.000** | — | 9 / 84250 |

（亮底参考恒 219.3 / 阈 164.4 全态一致；programs 会话累计 20——含主材质 + SDF 深度 + canopy 深度 + 缺省深度变体全族。）

## 验证项结果

### 1. console / shader 零错误 — PASS

九态全跑 `stats()`：**errors 0 / warnings 0**（无 Sky FXC 警告——本页未启 displaySky 链）。20 个程序全族（含 mid/low SDF 深度、canopy 深度、low 缺省实心深度）编译零失败。

### 2. depth 三档可辨（high SDF / low 实心 / canopy 剪影）— PASS

- **机制证据**：挂载面快照表（low「源提供 `celtis:leaf-depth:low` 但 mounted=null」——策略跳过的直接证据）。
- **像素证据**：同机位三特写帧——low 覆盖率 0.086 > high 0.062（+40%，实心卡无卡内叶形缺刻 → 更致密）、high 影内 σ 27.0 > low 22.4（SDF 缺刻 → 更高纹理方差）；canopy 0.069 介于其间。
- **视觉判读（多模态逐帧）**：high 影边缘与内部细碎叶形缺刻清晰；low 影呈卡片级实心斑驳（**预期形态**：壳卡间结构性间隙仍在、卡内无叶形缺刻——与 high 的卡内细碎缺刻可区分）；canopy 影 = 大块轮廓剪影 + 干柱条影齐全（远景验收第 1 条的影侧对应）。

### 3. 中点切换恰一侧 caster、影随切换换形、无双影 — PASS

- **机制证据**：before 态 `midCast=true / canopyCast=false`、after 态反转（`isShadowCasterFor` 摆位回读）。
- **像素证据**：before 9979 px（mid SDF 影，稀疏 + σ28.5）→ after 19669 px（canopy 剪影影，致密 + σ24.8）——**影形态随 caster 切换整体换形（+97% 暗像素）**；反事实双投对照 23485 px 显著高于任一单侧（双影会把影推向并集密度——生产语义的 before/after 均远离该值）；mid 单侧基线 8469 px ≈ before 9979（差值 = canopy 树体对地面的像素遮挡，影形态一致）。
- **视觉判读**：before = 细碎斑驳 SDF 影、after = 大块剪影影，两帧均为单一形态、无两层错位影、无双倍暗区。

### 4. cull 终态无残影 — PASS

`culled.png`：canopy visible=false + cast/receive 一并 false → 影足迹暗像素 **0**（同机位对照 `detail-canopy.png` 的 18345 px）；视觉判读确认树位地面干净、其余树影正常——验收「无树没了影子还在」的反向像素证据。

## 边界记档

- 本 harness 为工厂直消费（无池 / 无 SourceCache / 无选档）：两链池级 cast 翻转（`refreshSubmitVisibility` / `refreshShadowCast` / 合并桶 OR 语义）由单测覆盖（`InstancedAssetPool.shadow.test.ts` / `ScatterChunkManager.shadow.test.ts`），像素面归 021.7 接线后的全链验收。
- canopy receive=false 的视觉差异（远景树冠不采样阴影）在静态帧中不可直接判读（canopy 卡本身受 lambert+IBL 主导）——归 021.8 A/B 复核（与 mid depth 候选、low 实心影同组记档）。
- midpoint 帧为 TransitionCommit 语义手工摆位（021.3「帧值按 commit 语义摆位」先例）；状态机本身的边沿与带推进由 `tests/domain/lod/transition.test.ts` 26 例覆盖。
