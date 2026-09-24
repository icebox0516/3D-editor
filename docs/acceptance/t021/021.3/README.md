# T021.3 过渡 dither 材质面——像素级冒烟取证

> 任务：021.3 交付面冒烟验证（不接 Runtime，canopy 生产路径接线归 021.7）｜ Epic：021-lod-representation ｜ 执行日 2026-09-24
> 验证对象：`src/runtime/instancing/fadeGeometry.ts`（aFadeOut 属性缝）+ `src/runtime/procedural/tree/treeFadeDither.ts`（dither 注入，工厂内已应用）+ `src/domain/lod/transition.ts`（状态机纯函数——单测覆盖面，本冒烟不直接驱动，帧值按其 commit 语义手工摆位）。

## 方法（最小渲染 harness，InstancedMesh 真实消费路径）

- 页面：`tools/fade-smoke.html` + `tools/fade-smoke-page.ts`（Vite dev 直 serve docs 路径，`/src/...` 绝对导入——沿 021.6 canopy-baseline 先例；console 捕获面照抄）。
- 装配：celtis（朴树）LOW 档整树 = `buildCeltisGeometry(mulberry32(morphSeedOf(id,0)), profiles[0], 'low')`（2758 tri = 皮 370 + 叶 2388，预算带 1500–3000 内）+ `createCeltisBarkMaterial/LeafMaterial('low')`（**已内嵌 direct 侧注入**）+ 叶影深度材质挂载面；同位 canopy = `buildBroadleafCanopyGeometry('asset_tree_celtis')`（487 tri，同 slot-0 种子）+ `createBroadleafCanopyMaterials`（**已内嵌 mirrored 侧注入**）。两者各 1 实例 InstancedMesh、同原点 (0,0,0)，geometry 直挂 `aFadeOut` InstancedBufferAttribute（Float32 / itemSize 1 / 非 normalized / DynamicDrawUsage——fadeGeometry 契约的最小消费形态；几何不共享故不建池包装）。
- 环境域 = T018 真实链（照抄 021.6）：SkyCore(day) → PmremEnvironment 初烘 → environmentIntensity 0.15；主光 = day 太阳方向 × LEGACY_SUN_DISTANCE；地面大平面；uTime 恒 0。相机 fov 50 / 1920×1080 DPR1 / preserveDrawingBuffer。
- 机位照抄 021.6 单树口径并**全帧冻结**（像素级可比前提）：distance 60 / azimuth 35° / elevation 8°，目标 (0, 8.587×0.55, 0) = (0, 4.723, 0)。
- 像素探针（页内直读）：全帧绿色覆盖率（021.6 同式：G>R×1.08 ∧ G>B×1.08 ∧ G>40）+ **树冠区域覆盖率**（区域 = 启动时 low(fade0) 与 canopy(fade0) 参考帧绿色 bbox 并集+8px，冻结为 x∈[870,1045] y∈[457,581]，176×125 = 22000 px；覆盖 = 区域内非天空/非地面像素占比，背景参考色从帧内实测采样）+ 全帧 FNV-1a 校验和（位同判据）。
- 浏览器自动化：browser-use:control-browser 在子代理环境不可用（"Browser is not available in subagent"）→ 回退 **agent-browser（CDP）**，021.6 同款取证工具；视口 1920×1080 DPR1，canvas 恰满视口（截图 = 画布像素 1:1）。

## 帧清单（7 帧：6 必做 + 1 单侧证据帧）

| 文件 | 状态 | 绿色覆盖率(全帧) | 树冠区域覆盖率 | drawCalls | triangles | programs |
|---|---|---|---|---|---|---|
| `fade-low-000.png` | low 树 fade=0（零回退参考） | 0.3086% | **0.3330** | 3 | 2760 | 7 |
| `crossfade-025.png` | low .25 + canopy .75 | 0.3290% | 0.3485 | 5 | 3247 | 7 |
| `crossfade-050.png` | low .50 + canopy .50（中点） | 0.3490% | **0.3642** | 5 | 3247 | 7 |
| `crossfade-075.png` | low .75 + canopy .25 | 0.3693% | 0.3798 | 5 | 3247 | 7 |
| `fade-low-only-050.png` | low 树 .5 无 canopy（Low→Cull 路径） | 0.1545% | **0.1668** | 3 | 2760 | 7 |
| `canopy-only-050.png`（额外证据帧） | canopy 单独 .5 | 0.1944% | **0.1974** | 3 | 489 | 7 |
| `canopy-000.png` | canopy 单独 fade=0（incoming 满呈现） | 0.3890% | 0.3949 | 3 | 489 | 7 |

（triangles 含地面 2 tri；programs = 7 会话累计恒定——**fade 值写出全程零重编译**。canopy-000 全帧绿色覆盖率 0.389% 与 021.6 celtis canopy 基线帧 0.39% 同机位同值——跨取证一致性交叉核。）

## 验证项结果

### 1. console / shader 零错误 — PASS

全程 **0 错误**；警告 1 条 = Sky 着色器 FXC X4122 双精度保守误报（011.6 终裁 X4000 系同族接受记档口径，非 fade 路径，021.6 同款）。5 个 +dither 变体程序（bark:low/leaf:low/trunk/card × direct|mirror）全部编译通过、零注入点缺失抛错。

### 2. 溶解可见（dither 颗粒渐进，无整块消失/整片闪黑）— PASS

- 像素账目：crossfade 序列树冠覆盖 0.3485 → 0.3642 → 0.3798 单调推进，成分从 low（细叶簇）连续换手到 canopy（体量卡）——无任何帧出现覆盖塌陷或整体消失。
- 视觉判读（多模态逐帧）：025 = 冠面基本密实、轻度细点洒落；050 = 细盐椒颗粒、冠剪影完整；075 = 更稀疏粗颗粒但冠形连贯；无大块缺失、无黑色区域。
- 静态稳定性 + 可逆性（补证）：同态 300ms 后校验和位同（8a07354a），改值 .25 再回 .50 亦位同——屏幕域 IGN 无时间项、相机静置逐帧逐位静止（treeFadeDither「无明显 dither 闪烁」的机制根据）。

### 3. 中点无透底空洞（direct×mirrored 同像素恰一侧存活）— PASS

| 对比 | 数值 | 结论 |
|---|---|---|
| crossfade-050 | **0.3642** | ≈ 2.18× / 1.84× 任一单侧 50%，且 **高于完整 low 树参考 0.3330** |
| low 单侧 50%（fade-low-only-050） | 0.1668 | ≈ 0.3330 的 50.1%——direct 侧 50% 阈值的精确读数 |
| canopy 单侧 50%（canopy-only-050） | 0.1974 | ≈ 0.3949 的 50.0%——mirrored 侧同 |
| 全部 low 树（fade-low-000） | 0.3330 | 参考 |
| 全部 canopy（canopy-000） | 0.3949 | 参考 |

**逐像素互补的定量验证**：测得 union 覆盖与互补公式预测 `(1−p)×0.3330 + p×0.3949` 逐点吻合——p=0.25 预测 0.3485 / 实测 0.3485；p=0.50 预测 0.3640 / 实测 0.3642；p=0.75 预测 0.3794 / 实测 0.3798（误差 ≤0.0004）。两侧存活分数逐像素恒和 1 ⟺ 每个被双表示覆盖的屏幕像素恰一侧存活。反事实核：若两侧同用 direct，中点 union ≈ 0.18（50% 绝对透底）——实测 0.3642 ≈ 其 2 倍，镜像变体机制成立。

### 4. 零回退（缺属性 / 值 0 = 逐位不变；材质参数未动）— PASS

- **位同校验（页内 FNV-1a 全帧）**：low 侧 `aFadeOut=0 带缓冲 9e7a8214` ≡ `缺属性（GL 顶点属性缺省 0）9e7a8214`；canopy 侧 `88f67f2c ≡ 88f67f2c`——两变体（direct/mirrored）均逐像素一致，「缺属性 = 完整呈现」缺省安全契约像素级成立。
- **材质参数快照**（注入 append-only 未动底参）：celtis:leaf:low+dither = #5a8340 / r0.72 / Double / alphaTest 0.5 / **alphaToCoverage true**（SDF 裁切链原样）；celtis:bark:low+dither = #7a746a / r0.92 / Front；canopy:card/trunk +dither:mirror = 冠色 #5a8340 / 皮色 #7a746a；**深度材质零注入**（celtis:leaf-depth:low、canopy:depth 无后缀——阴影走中点切换的设计裁定得到遵守）。
- **缓存键**：原键 + `+dither` / `+dither:mirror` 后缀齐全（配方变即键变纪律）；programs 恒 7（fade 值变化零重编译）。
- `fade-low-000` / `canopy-000` 目视无异常（满呈现、无溶解残点）。

## 观察记档（非缺陷）

1. **canopy 满覆盖 > low 满覆盖**（0.3949 vs 0.3330）：canopy 卡按簇场包络膨胀吞并 Low 壳卡间隙（021.6 设计语义），故 crossfade 期 union 覆盖随 p 单调上升——是预期行为非空洞问题；跨度连续性的正式基准是 Mid 对（D41 §5.1），021.8 验收再判。
2. 浏览器自动化工具更替：browser-use 子代理不可用 → agent-browser（021.6 同款），取证方法（CDP + 页内探针）不变。
3. transition.ts 状态机本冒烟未逐帧驱动（纯函数面由其单测锁定）；帧值 = 按 commit 语义（outgoing=p / incoming=1−p 互补恒和 1；Low→Cull 单侧 1−f）手工摆位——材质消费面与状态机输出面的对接在 021.7 Runtime 接线后回归。

## 缺陷

无。fade 材质面（treeFadeDither × fadeGeometry 属性缝 × 13 树种 direct 侧以 celtis 为代表 × canopy mirrored 侧）冒烟全项通过。

## 清理

dev server 已停、agent-browser 浏览器已关（`close`）、端口 5173 已复核释放——进程用完即清，无跨会话残留。
