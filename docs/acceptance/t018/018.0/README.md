# T018.0 Preflight Baseline —— legacy 渐变天空环境唯一改前基线（D31.7）

> 任务：[T018.1](../../../tasks/018.1-sky-sun-cloud-core.md) 前置 Step ｜ **018.5 新旧视觉对比、FrameTime Δ、资源账目以本目录为唯一改前源**；树族复用 D30 统一基线帧不重拍。
> 环境：Chrome 153 headless（CDP 9333 直驱，vsync-off：`--disable-gpu-vsync --disable-frame-rate-limit`）+ Vite dev（5173）｜ 1920×1080 DPR=1 ｜ RTX 2080 Ti（ANGLE D3D11）｜ 主相机 fov=50 ｜ Shadow 开启。
> 驱动：`window.__envProbe`（本会话新增 DEV 取证探针——setPreset 走组合根 facade 产品路径 / scene 注入 / info() 账目）+ `window.__tree3aPerf`（产品放置路径 place/view/clear + sampleFrames）+ `window.__tree3a.freezeTime`（风相位确定性）。工具：`tools/`（cdp.mjs + 三个驱动脚本，018.5 复用同款协议对称取证）。

## ① legacy 渐变天空完整参数快照（代码事实，`src/runtime/Renderer.ts`）

- **天空**：`createSkyTexture(top, bottom)`（`Renderer.ts:1255`）= 16×512 CanvasTexture 上下双色线性渐变、SRGBColorSpace；无 DOM 回退顶部色 `THREE.Color`。四预设色（`ENVIRONMENT_PRESETS` `Renderer.ts:138-187`）：

| 预设 | skyTop | skyBottom | groundColor | gridMajor/minor | sunColor | sunIntensity | ambientSky/Ground | ambientIntensity |
|---|---|---|---|---|---|---|---|---|
| day | #6ba3e0 | #d8e8f4 | #e6e4de | 0x9aa4ae / 0xc9cfd6 | #ffffff | 2.4 | 0xbfd6ea / 0x8a8f96 | 0.9 |
| dusk | #2e3a5c | #e8927c | #7a746e | 0x5a5668 / 0x847c7a | #ffb27a | 1.6 | 0x6a6f96 / 0x4a4442 | 0.6 |
| night | #0a0f1e | #1a2338 | #2c3242 | 0x3a4560 / 0x272f42 | #8a9cff | 0.5 | 0x2a3350 / 0x1a1e2c | 0.35 |
| tech | #04121f | #0a2a3f | #0b1c2a | 0x1e5f74 / 0x123244 | #9fd8ff | 1.2 | 0x14364a / 0x0a1a26 | 0.55 |

- **太阳**：`position.set(80, 120, 60)`（`Renderer.ts:1010`，四预设同向）｜ castShadow 2048² / camera ±160 / near 1 far 400 / bias −0.0004（`Renderer.ts:1011-1019`，D29.1 冻结不动）。
- **day 首候选太阳角派生关系**（D29.6）：(80,120,60) → elevation = atan(120/√(80²+60²)) = **50.19°**，azimuth = atan2(80,60) = **53.13°**——与 018.1 首候选 50.2°/53.1° 一致（新旧对比阴影方向零漂移口径）。
- **地面/网格**：GROUND_SIZE 2000m 平面（receiveShadow + 共面偏置）+ 400 分度网格（5m 格，200–1000m 距离渐隐，`Renderer.ts:189-230`）。
- **环境构成**：HemisphereLight + DirectionalLight（Hemi 于 018.3 正常路径删除——D29.4）；toneMapping 全仓无赋值（=NoToneMapping）、outputColorSpace SRGB（`Renderer.ts:388`）。

## ② 运行时灯位实测（空场景，`baseline-data.json` `lights`）

四预设 DirectionalLight 实测 position=[80,120,60] / color / intensity / shadow 2048 / bias −0.0004 **逐项与代码表一致**；HemisphereLight sky/ground/intensity 同表。day 例：dir #ffffff 2.4 + hemi #bfd6ea/#8a8f96 0.9；night 例：dir #8a9cff 0.5 + hemi #2a3350/#1a1e2c 0.35。

## ③ renderer.info 资源账目基线（空场景态，`baseline-data.json` `info`）

| 预设 | calls | triangles | lines | geometries | textures | programs |
|---|---|---|---|---|---|---|
| day | 3 | 4 | 802 | 4 | 6 | 3 |
| dusk | 3 | 4 | 802 | 5 | 8 | 3 |
| night | 3 | 4 | 802 | 6 | 10 | 3 |
| tech | 3 | 4 | 802 | 7 | 12 | 3 |

**改前事实——legacy 预设切换线性泄漏**（`tools/t0180-growth.mjs`，10 轮切换实测）：每切换一次 **geometries +1 / textures +2 / programs 恒定**（4/6 → 13/24 线性）。归因（代码证据）：`disposeObjectTree`（`Renderer.ts:1239`）只覆盖 `isMesh`——GridHelper（LineSegments）几何不释放（+1 geo）；灯光不在遍历释放范围，旧 DirectionalLight 的 shadow map 渲染目标纹理不释放（+2 tex 之主力）。**新实现验收项 4「循环 ≥5 轮 owned=1 / 旧资源=0 / 无增长」以此为改前对照面**——018.1 动 clearEnvironment 时需最小修复（不新增泄漏 + 顺路覆盖本泄漏，记档完成记录）。

## ④ Frame time p95 基线（vsync-off，5000ms 采样 + 30 帧预热，nearest-rank；`baseline-data.json` `perf` / `perf1000`）

| 预设 | 空场景 p95 (ms) | 100 棵夏栎 p95 (ms) | 1000 棵夏栎 p95 (ms) |
|---|---|---|---|
| day | 0.60 | 1.60 | 4.40（511 fps） |
| dusk | 1.60 | 1.60 | 4.50（508 fps） |
| night | 1.70 | 1.60 | 4.50（506 fps） |
| tech | 1.70 | 1.60 | 4.50（507 fps） |

1000 棵 day 511 fps 与 011.13 族门实测（509）同量级——口径互证成立。018.5 验收项 9「ΔFrameTime p95 ≤1.5ms 且 ≤基线 10%」对照本表（1000 棵档基线 4.4–4.5ms → 10% ≈ 0.45ms 为最紧口径；空场景/100 棵档同步抽检）。

## ⑤ 四预设 × 六主体固定机位快照（24 PNG）

主体：夏栎 tree3a / 朴 celtis / 樟 camphor（`__tree3aPerf.place` 产品路径 count=1 jitter=false seed=1，机位 distance 25 / azimuth 35° / elevation 8°）；路灯 asset_streetlamp（同路径，12 / 35° / 6°）；GLB sensor.glb（GLTFLoader 注入归一化 1.2m 高 @ 原点，机位 (3.2,1.1,3.6)→(0,0.6,0)，源尺寸 0.32×2.38×0.34m ×0.504）；金属三球（注入 MeshStandardMaterial metalness=1 × roughness 0.15/0.45/0.75，r=0.5 @ x=−1.4/0/1.4，机位 (0,1.1,5.2)→(0,0.55,0)）。风相位冻结（`__tree3a.freezeTime`）保证跨预设逐位可比；GLB/金属为取证注入（非命令路径），**018.5 新侧须同款注入对称取证**。

命名：`<preset>-<subject>.png`（day/dusk/night/tech × tree3a/celtis/camphor/streetlamp/glb/metal）。判读通道抽检：day-tree3a（渐变天空 + 完整树 + 阴影右前）/ night-metal（三球暗光冷调微反射）双问一致有效。

## 目录

- `baseline-data.json`：全部实测数据（env / lights / info / glb / metal / perf / perf1000 / growth10）
- `<preset>-<subject>.png` ×24 ｜ `tools/`：cdp.mjs + t0180-baseline.mjs（主体快照 + 灯位 + info + empty/100 棵 perf）+ t0180-perf1000.mjs + t0180-growth.mjs ｜ `tools/*.log`：原始运行输出
