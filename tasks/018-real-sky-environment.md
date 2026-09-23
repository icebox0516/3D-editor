# T018 真实程序化天空与环境光照

> 立项：2026-09-20（grilling 两轮逐题裁定，**D29**；用户参考方案逐字归档 [docs/sky-reference.md](../docs/sky-reference.md)——输入材料不再更新，冲突处以 D29 为准）。前置：~~T011 族级验收门 + T006.6 Step 3 之后~~ → **2026-09-23 用户指令「先跑 T18」取代原排期**：T011 族门已收官（2026-09-23）；T006.6 Step 3（A/B 实测 + 阈值重锁判定）不再阻塞本任务，改在 018.5 验收后或并行执行（天空变化对选档分布实测无干扰——选档度量 = 距离/半径，与视觉环境无关）。**状态：done（**5/5 epic 收官 2026-09-23**——018.0 前置 + 018.1 Sky+Sun+Cloud + 018.2 PMREM/IBL + 018.3 预设+fallback + 018.4 DEV 调参 + 018.5 验收收官全链交付）**。**2026-09-20 同日修订（用户指令，D29.11-14）：任务核心扩为 Sky + Sun + r186 内建 Cloud + PMREM（cloudSpeed=0 静态云）+ displaySky/bakeSky 双实例。**

## Goal

Renderer 环境从「CanvasTexture 渐变天空 + HemisphereLight + 固定太阳 (80,120,60)」升级为「官方 Sky（Preetham，**r186 内建 Cloud**）+ 统一 SunDirection + DirectionalLight 直射/阴影 + PMREM → scene.environment」的统一环境光照体系：天空→太阳→云→环境光→PBR 材质→阴影共享同一环境关系；**全部现有资产零材质改动自动获得 IBL**（事实基础见「探查事实锚点」：全仓 MeshStandardMaterial + onBeforeCompile）。**T018 ≠ Tone Mapping ≠ 动态云/云影 ≠ Weather ≠ Atmosphere/Fable5**（D29.10 + 修订 11：内建静态云除外）。

## Requirements（D29 裁定面）

- **018.0 Preflight Baseline（018.1 修改渲染代码前执行，D31.7）**：固定 legacy 环境为唯一改前基线——legacy 渐变天空完整参数快照 + day/dusk/night/tech 四预设 × 夏栎/朴树/香樟/路灯/GLB/金属固定机位快照 + frame time p95 基线 + renderer.info 资源账目 + 当前太阳方向记录，落 `docs/acceptance/t018/018.0/`；018.5 新旧视觉对比、FrameTime Δ、资源账目以本目录为唯一改前源；树族复用 D30 统一基线帧不重拍。
- **Sky + Sun + Cloud Core（018.1）**：**displaySky + bakeSky 双实例**取代单一实例（D29.12）——displaySky 挂 envGroup、ENV_LAYER，受现有 Environment Layer / RenderMode 管理，相机中心跟随（渲染前 `sky.position.copy(camera.position)` 轻量维护，非 Scene 数据）；bakeSky 仅存于 environmentBakeScene 供 PMREM 烘焙（bake 用虚拟相机，无需跟随）；两实例由**同一份参数状态驱动**，参数变更同步写双实例 uniforms（Object3D 单父节点，一实例不能同时挂两 Scene）。**内建 Cloud（D29.11）**：直接消费 Sky 自带 `cloudCoverage / cloudDensity / cloudElevation / cloudScale`，第一阶段 **cloudSpeed = 0 静态云**且不接 time 驱动——不做动态云/云影/Weather，不自研云；太阳盘用内建 `showSunDisc`（displaySky 常开 / bakeSky 常闭）。`sunDirectionOf(elevation, azimuth)` 纯函数（node 可测，落点按 D27.5 先例——domain 零 THREE 或 runtime 纯模块，实施 agent 定）**双消费** Sky.sunPosition + DirectionalLight.position——「天空太阳位 = 光向 = 影向」**三一致为核心验收**；day 首候选 elevation 50.2° / azimuth 53.1°（由现行 (80,120,60) 派生，新旧对比阴影方向零漂移；终值 018.5 视觉验收锁定）。
- **PMREM / IBL（018.2）**：独立 environmentBakeScene（只含 **bakeSky**，职责分离——禁止 fromScene(主 Scene)）；**云参与烘焙**（bakeSky 带 cloud 参数，阴天参数下 env 反射含云——D29.11/12）；太阳盘烘焙保护 = bakeSky `showSunDisc` 常闭（内建 uniform，官方文档口径，无需开合切换）；PMREMGenerator.fromScene → scene.environment；IBL 侧旋钮 = `scene.environmentIntensity`；**显示侧强度硬约束（D29.13）**：正式路径**禁止 scene.backgroundIntensity**（只作用于 scene.background，Sky 是 ENV_LAYER 网格）——以 Sky 材质自身显示强度 uniform 实现；legacy fallback 渐变背景仍可用场景级旋钮；**PMREM 仅环境状态变化触发**（预设 / 太阳角 / Sky 含 Cloud 参数变化——cloudSpeed=0 下 time 不构成触发源；相机移动 / 模型变化 / LOD 切换禁止触发）；**事务提交**（新 RT 就绪 → 替换 scene.environment → 旧 RT 释放）+ 自维护 owned/live counter。
- **EnvironmentPreset + fallback（018.3）**：四预设（day/dusk/night/tech）转新参数面（sky 四大气参数 + **cloud 四参数 cloudCoverage·cloudDensity·cloudElevation·cloudScale**（cloudSpeed 恒 0 不进预设）/ sun elevation·azimuth·intensity·color / ibl intensity / ground / grid），Runtime 层不进 Scene 持久化（现状仅 `preset: string` + 开放扩展键，天然兼容，UI 零改动）；**HemisphereLight 正常路径删除**（禁止多光源叠加，D29.4）；**事务式 fallback 单一开关**（D29.5）：首次初始化失败（Sky 构造 / PMREM 烘焙）→ 完整 legacy 路径（CanvasGradient 背景 + Hemi + 现行太阳常量），不出现「真天空但无 IBL」混合态；**运行中环境切换重烘失败 → 保留上一份已成功提交的环境**（不降级不闪断）。
- **DEV 调参（018.4）**：`__sky` DEV 守卫挂载（`__devStage` / `__celtis` 前例）：Sky 四大气参数 / **Cloud 四参数（不含 cloudSpeed——静态云语义锁定，不暴露动态云入口）** / 太阳角 / IBL 强度 / 显示侧旋钮实时调 + **PMREM debounce**（禁止逐参数变化连续重烘，D29 裁决 Q6）。
- **渲染遍兼容**：诊断模式（wireframe/xray/clay/normals）环境遍继续显示天空（ENV_LAYER 网格接替 scene.background 语义）；`renderMode.test.ts` 遍计划断言机械调整（useBackground 语义换口径，预期行为不变）。

## Scope

- 预期触碰：`src/runtime/Renderer.ts` 环境段（applyEnvironment / clearEnvironment / dispose 生命周期挂点）+ 新增 sky / sun / pmrem 模块 + `tests/runtime/` 新测试 + renderMode 遍断言调整 + `docs/acceptance/t018/`。
- 不碰：资产材质与几何（夏栎/朴树/香樟/路灯/GLB 零改动——Standard 材质自动获得 env；011.2 记档的锐高光结构上限在 NoToneMapping 下重新记档）、Shadow Camera 配置（2048 / ±160 / bias 不动，D29.1）、T006 LOD / 散布 / 实例化一行不写、tone mapping（NoToneMapping + SRGBColorSpace 不动，D29.3）、UI 面板与 SceneData 持久化结构、Grid / Ground / RenderMode 机制本身。
- 明确非目标（D29.10）：Tone Mapping（高光控制证明不足则另立 T019 颜色管线，**禁止 T018 内偷切**）/ Weather / Atmosphere(Fable5) / Volumetric Cloud / 动态时间轴 / Atmospheric Fog / Shadow Camera 重构 / LOD 重构 / 资产 Shader 重构。

## Acceptance（epic 级，018.5 执行；方案 §28 十条全采纳 + D29.7 量化口径）

1. 渐变天空不再作为正式路径（仅 fallback 保留）。
2. Sky 与 DirectionalLight 同一太阳方向（纯函数单测 + 取证探针三一致）。
3. scene.environment = PMREM 结果；夏栎 / 香樟 / 路灯 / GLB / 金属资产**新旧环境固定机位对比**，PBR 环境光 / 反射可辨改善（取证 `docs/acceptance/t018/018.5/`）。
4. day→dusk→night→tech 循环切换 ≥5 轮：owned PMREM target = 1 / 旧环境资源 = 0 / 无增长（**自维护 counter 为确定性依据**，renderer.info 字段跨版本口径差异仅辅助）。
5. PMREM 不进每帧路径（触发清单 + DEV debounce 单测锁定）。
6. Ground / Grid / Shadow / LOD / RenderMode 零回归。
7. 初始化异常 → legacy 完整 fallback；运行中重烘失败 → 保留上一份成功环境（均单测锁定）。
8. Renderer dispose 后环境资源全释放（Sky / PMREM RT / PMREMGenerator / scene.environment=null，沿 clearEnvironment 现有链挂入）；StrictMode 双挂载不泄漏；**dispose 不加 forceContextLoss**（项目冻结规则）。
9. 稳态 ΔFrameTime p95 ≤1.5ms **且 ≤基线 10%**（对照既有基线**抽检**，不重跑 T006.5 双档全量——天空成本与实例量无关、增量恒定；超阈再升级全量复验）。
10. PMREM 单次 ≤100ms（**参考开发机门，非跨设备硬承诺**）。
11. 回归三门槛全绿（npm test / check:layers / typecheck）。
12. **内建云静态语义（D29.11）**：cloudSpeed=0 锁定 + 不接 time 驱动——frozen 双帧云零位移（风动冻结同口径逐位一致）；cloud 参数变化进 PMREM 触发清单（重烘生效），阴天候选参数下 env 反射可见云影响；displaySky 云与 bakeSky 云共享同一参数状态（双实例同步断言）。

## Constraints

- 派遣（AGENTS.md / D29.9）：threejs-runtime-agent 主力（Renderer / 生命周期 / PMREM 管线 / 测试）；Sky 材质注入类改动（显示侧强度 uniform——cloud/showSunDisc 为内建 uniform 直接消费无需注入）可派 park-shader-agent；主代理拆分派遣审查验收，不直接写渲染实现。
- addons 导入沿用项目惯例全路径 `three/examples/jsm/objects/Sky.js`（@types/three 0.185.4 含 Sky.d.ts；check:layers 对 `three/*` 在 src/runtime 放行已确认）。
- Renderer 硬规则：dispose 无 forceContextLoss；每帧连续渲染不改为按需；环境逐帧维护仅相机跟随级轻量操作。
- 取证按 `docs/threejs-debugging.md` SOP（MCP 金丝雀 → 截图回退）；复用 t011 tools `cdp.mjs` 框架；验收落 `docs/acceptance/t018/<子任务>/`。

## 子任务（2026-09-20 立项拆分，D16 会话粒度；018.1 合并裁定理由：Sky 无太阳角不可独立视觉验证，三一致验收不可拆——用户裁决）

- [x] 018.0 Preflight Baseline（018.1 前置 Step，不建独立子任务文件——前置证据非会话粒度工作单元，D31.7；done 2026-09-23 随 018.1）→ 落 `docs/acceptance/t018/018.0/`
- [x] [018.1 Sky + Sun + Cloud Core](018.1-sky-sun-cloud-core.md)（displaySky/bakeSky 双实例 / 相机中心 / ENV_LAYER / RenderMode 接入 + 内建 Cloud 参数面 cloudSpeed=0 + sunDirectionOf 纯函数 + 双消费三一致 + 单测；done 2026-09-23——含 legacy 预设切换泄漏最小修复〔018.0 发现 +1 geo/+2 tex 每次〕+ 三一致探针/零漂移/跟随/诊断遍/p95 Δ+0.10ms 全过 + 3946/591/零错）
- [x] 018.2 PMREM / IBL（bake scene / 太阳盘隐藏 / 事务提交 / owned-live counter / environmentIntensity + 显示侧旋钮）→ [018.2-pmrem-ibl.md](018.2-pmrem-ibl.md)（done 2026-09-23——park-shader-agent 显示强度 uniform + threejs-runtime-agent PMREM 管线 + 主代理审查/复验/视觉验证：**fromScene far=10000 锁定**〔缺省 100 整盒裁剪〕+ 事务天然保留旧环境 + 25 测试 3971 全绿；金属/GLB/路灯 env 反射可辨〔GGX roughness 分档可见〕；growth10 零增长；p95 归因 **IBL 采样固有帧成本 ≈+0.5ms** 移交 018.5 裁定〔第二判据 10% 口径风险〕；environmentIntensity 直写不触发材质刷新记档 018.4 提醒）
- [x] 018.3 EnvironmentPreset + fallback（四预设新参数面 / Hemi 删除 / 事务式 fallback 单一开关 / 运行中失败保留旧环境）→ [018.3-preset-fallback.md](018.3-preset-fallback.md)（done 2026-09-23 两会话——threejs-runtime-agent 交付 + 主代理审查/复验/视觉验证 + 会话二疑点闭环：environmentPresets 统一预设面〔SKY_PRESET_ATMOSPHERE 收口〕+ setupSkyEnvironment 事务构建〔单一开关无混合态 + 初烘失败 legacy 整组降级 / 重烘失败保留旧环境〕+ Hemi 正常路径删除〔D29.4〕；+26 测试 **3997 / 597 / 零错**；四预设 environmentIntensity 1/0.85/0.35/0.7 精确生效、fallback monkey-patch 全过、交替 growth10 零泄漏；**「直射光像素零贡献」机制疑点定论：Preetham HDR 天空 + NoToneMapping（D29.3）day 大面积 clamp 254 饱和，管线健康非 bug**〔直射/阴影在 env null 与 ACES 下完全正常；wrap 原型实验无效——three render 为实例方法〕；**day/tech 过曝 + tone mapping 决策重审移交 018.4/018.5**〔ACES 实证 56% 画面改善、ACES 下太阳开关 31.9%/34.4% 响应〕）
- [x] 018.4 DEV 调参面（__sky 守卫 / 参数实时调 / PMREM debounce）→ [018.4-dev-tuning.md](018.4-dev-tuning.md)（done 2026-09-23——threejs-runtime-agent 单步交付 + 主代理审查/复验/视觉验证：skyRebake debounce 层〔200ms + 调度器注入 + cancel〕+ skyTuning 调参端口〔八键白名单 + 太阳角三一致内聚 + ibl 借道重烘刷新〕+ sunLight 字段提升 + `__sky` DEV 守卫〔legacy 显式抛错〕；20 连写恰一次重烘实测 / display 零重烘跨窗实证〔显示域压缩工具面可用〕/ ibl immediate-settled 差分 / 太阳角双 run 视觉〔含 sunlow 异常帧两轮复核定案为取证层作废〕；+36 测试 **4033 / 601 / 零错**）
- [x] 018.5 验收（视觉新旧对比 / 性能抽检 / 资源账 / 回归三门槛）→ [018.5-acceptance.md](018.5-acceptance.md)（done 2026-09-23 两会话——终调定值〔day 0.22/0.15、tech 0.2/0.15 显示域压缩，dusk 白区反打定案自然眩光维持原值〕+ 预设落地〔threejs-runtime-agent，displayIntensity 键 + 构建期应用 + 绝对锚重锚〕+ 取证〔24 帧新旧对照全终值态（tech 六帧终值定案后补拍复跑）/ 同实例 IBL 增量 +0.1~0.2ms 双判据过 / 资源账 6 轮 38/5/21 恒定 owned=1 / 冻结云 6 像素 ±1 / warm rebake 0.4–0.9ms〕+ epic 十二条逐条收口全过 + 过曝处置裁定记档 **D39**；三门槛 **4034 / 601 / 零错**）

依赖链：**018.0 Preflight（018.1 前置）** → 018.1 → 018.2 → 018.3 → 018.4 → 018.5（018.5 候选参数终调直接用 018.4 的 DEV 面；串行维持会话粒度纪律与审查带宽）。

## 探查事实锚点（2026-09-20 立项时点快照；实施前如相关文件大改需复核）

- Renderer 现状：createSkyTexture `Renderer.ts:1255` / EnvironmentPreset 接口 `:125` / 四预设数值 `:138-187` / applyEnvironment `:988` / clearEnvironment `:1055` / 太阳 (80,120,60) + shadow 2048/±160/bias-0.0004 `:1009-1020` / dispose `:954`（无 forceContextLoss）/ toneMapping 全仓无赋值（=NoToneMapping）、outputColorSpace SRGB `:388`。
- 材质盘点：三树叶皮 + 路灯 + Ground = MeshStandardMaterial + onBeforeCompile（tree3aMaterials.ts:357 / celtisMaterials.ts:402 / camphorMaterials.ts:373 / streetlamp.asset.ts:106 / Renderer.ts:252）；GLB 内建材质；Grid = LineBasicMaterial（不受 env 影响）；envMap / PMREM / environmentIntensity 全仓零使用。
- UI / 持久化：InspectorPanel EnvironmentTab 四预设下拉 `InspectorPanel.tsx:1608-1652`；`SceneData.ts:13` SceneEnvironment = preset: string + 开放扩展键 → 预设内部重构零 UI 零持久化影响。
- 测试面：无直接断言 HemisphereLight / 天空纹理内容的测试；`renderMode.test.ts` 遍计划 useBackground 断言需机械调整；`environment.test.ts` / `bootstrap.test.ts` 预设 id/label 断言不受影响（id/label 不变）。
- 工程链：three 0.186.0 实装（@types/three 0.185.4）；Sky 类型 + 运行时可解析；r186 Sky 片元含 tonemapping_fragment + colorspace_fragment（NoToneMapping 下前者空操作——D29.3 硬裁切限制来源）。
- **r186 Sky 内建云（2026-09-20 修订核实，D29.11）**：`node_modules/three/examples/jsm/objects/Sky.js:78-91` uniform 表 = turbidity / rayleigh / mieCoefficient / mieDirectionalG / sunPosition + **cloudScale 0.0002 / cloudSpeed 0.00002 / cloudCoverage 0.4 / cloudDensity 0.4 / cloudElevation 0.5** + showSunDisc + time（Sky 类不自动驱动 time——消费方不更新即天然静态）；云着色 `:277-328`（fbm 噪声 / 云自动遮挡太阳盘 / Beer 定律不透明度 / 地平线消散 / 天空自发光照明）；**@types/three 0.185.4 Sky.d.ts 未声明 cloud/showSunDisc/time（类型滞后）→ 实现需模块类型扩充或局部断言，禁 any 扩散**；`SkyMesh.js` 为 WebGPU/TSL 变体非本路径，勿混用。
- 任务编号：TASKS.md 占位至 T017，T018 空闲无冲突；天空 / IBL 相关条目此前零命中。

## 进度

- 2026-09-20 立项：grilling 两轮（6+8 题）逐题裁决 → D29；参考方案归档 `docs/sky-reference.md`；任务书落盘，0/5。启动条件 = T011.5 + T006.6 Step 3 完成。
- 2026-09-20 同日修订（用户指令，D29.11-14）：任务核心扩 r186 内建 Cloud（cloudSpeed=0 静态）+ displaySky/bakeSky 双实例 + 显示强度硬约束 + showSunDisc 内建太阳盘保护；事实核实入锚点（Sky.js:78-91 uniform 表 / 云着色 :277-328 / @types 0.185.4 类型滞后）；启动条件与其余裁定不变。
- 2026-09-20 D31 收口：新增 018.0 Preflight Baseline 前置步骤（D31.7——018.5 对比的唯一改前基线源，防止「先改环境再找改前截图」）；其余不变。
- 2026-09-23 启动（用户指令「先跑 T18环境任务」）：原排期「T011 族门 + T006.6 Step 3 之后」的用户前置裁决被同日新指令取代（D31.1 口径——历史排期被后续指令取代，约束行已更新为当前事实）；T011 族门已于 2026-09-23 收官，T006.6 Step 3 改不阻塞（理由记头部）。018.0 前置取证面新增 DEV 探针 `window.__envProbe`（bootstrap.ts，只读取证工具：scene/camera/controls/webgl 结构引用 + setPreset 走 facade 产品路径 + info() 账目——018.0 与 018.5 新旧对比共用注入面；typecheck + bootstrap/phase1 测试 35 绿验证）。
- 2026-09-23 **018.0 + 018.1 done**（单会话：主代理前置取证 → threejs-runtime-agent 交付 → 主代理审查/复验/增量视觉验证）。018.0：legacy 全参数快照 + 四预设 × 六主体 24 帧 + p95 三档基线（empty/100/1000 棵）+ info 账目 + **legacy 预设切换线性泄漏 +1 geo/+2 tex 每次实测记档**（GridHelper LineSegments + 灯光 shadow map 不释放——clearEnvironment 只判 isMesh 的盲区）。018.1：sunDirectionOf 纯函数 + SkyCore 双实例 + Renderer 接线（渐变背景退役、太阳同向同模长替换、相机跟随、disposeEnvironmentObjectTree 顺路修复上述泄漏）+ 28 测试；验证全过——三一致探针 dot 0.99999994（零漂移）/ 阴影方向视觉核验一致 / 跟随无黑边 / 诊断遍天空照常 / console 零错误 / 泄漏复测 10 轮零增长 / p95 Δ+0.10ms（预算内）；三门槛 **3946 / 591 / 零错**。基线更新：npm test 3918 → **3946**、check:layers 586 → **591**。
- 2026-09-23 **018.2 done**（单会话两步串行派遣：park-shader-agent 显示强度 uniform 注入 → threejs-runtime-agent PMREM 管线 → 主代理审查/复验/增量视觉验证，取证 `docs/acceptance/t018/018.2/`）。交付：`pmremEnvironment.ts` 事务管理器（fromScene **far=10000** 锁定——缺省 100 整盒裁剪天空；先替换后释放 + 失败赋值不发生天然保留旧环境；owned/retired counter；构造拒绝主 Scene 直烘）+ SkyCore 第三参 onParamsChanged 回调（三写入口恰一次重烘，time 恒不触发）+ `uDisplayIntensity` 显示强度（仅 displaySky 注入，bakeSky 逐字节零污染）+ Renderer 接线（初烘/消费者先撤释放/environmentIntensity=1）。+25 测试（含 `?raw` 结构断言 renderFrame 零 PMREM）。验证：IBL 挂接探针（mapping 306/imageWidth 768）/ 金属三球 018.0 近黑 → 反射蓝天白云（GGX 分档可见）+ GLB 金属杆 + 路灯反光带三主体可辨 / growth10 恒定零增长 / 切换耗时 30–33ms（含初烘+generator 重编译，≤100ms 参考门内）/ **p95 A/B：IBL on 5.60 vs envNull 5.10（同 session）= IBL 采样固有帧成本 ≈+0.5ms，跨实例漂移 ≈+0.6ms——018.5 验收第 9 条第二判据（≤10%）风险记档，建议同实例 on/off 差为增量口径**；无效帧 environmentIntensity 直写不刷新材质（WebGLRenderer.js:2738）记档 018.4 提醒。三门槛 **3971 / 593 / 零错**。基线更新：npm test 3946 → **3971**、check:layers 591 → **593**。
- 2026-09-23 **018.4 done**（单会话：threejs-runtime-agent 单步交付 + 主代理审查/复验/视觉验证，取证 `docs/acceptance/t018/018.4/`）。交付：`skyRebake.ts`（debounce 层：REBAKE_DEBOUNCE_MS=200 + RebakeScheduler 注入面 + trigger 合并/flush 双防线/cancel 幂等）+ `skyTuning.ts`（调参端口：SkyTuningPort 零 THREE 表面 + ATMOSPHERE_KEYS 八键白名单 satisfies+运行时双锁〔cloudSpeed 结构性不可达〕+ setSunAngles 三一致内聚 + setIblIntensity 直写+借道重烘〔RangeError 加严〕+ params 太阳角反解）+ environmentSetup rebake 包层（**回调上游**，018.3 catch 语义原样保留在触发体内；outcome sky 分支带出句柄）+ Renderer（sunLight 字段提升 + skyTuning getter + clearEnvironment 首步 cancel pending）+ bootstrap `__sky` 守卫（live getter / legacy 显式抛错 / 装配卸载成对）。验证全过：20 连写立即零重烘→停手恰一次（baked 1→2）/ displayIntensity 0.35 天空即时压暗 + 跨窗 baked 零增长 + 金属反射不随动（**018.3 移交显示域压缩工具面实证**）/ ibl 0.3 immediate 帧零变化→settled 帧脱离 254 饱和现层次 + flush 同步 +1 / 太阳角 8°/240° 双 run 视觉（左侧地平线暖橙 + 极长影 + 点积 1.0）/**sunlow 异常帧定案**：主 run ⑤ 帧判读与读数矛盾 → 两轮独立复现（干净态 + 完整序列回放）均正确，判取证层作废（疑 CDP 高帧率陈旧合成帧）+ 工具教训记档；+36 测试 **4033 / 601 / 零错**。基线更新：npm test 3997 → **4033**、check:layers 597 → **601**。
- 2026-09-23 **018.5 done，T018 epic 5/5 收官**（两会话：终调 + 预设落地 + 取证主体〔checkpoint〕→ 判读收口 + tech 六帧补正 + README + 三门槛复验 + D39 记档〔收官会话，用户指令「简单测试即可」〕，取证 `docs/acceptance/t018/018.5/`）。终值：**day displayIntensity 0.22 / ibl 0.15、tech 0.2 / 0.15**（显示域压缩，D39；dusk/night 反打定案维持 1 / 0.85·0.35），day 太阳角 50.2°/53.1° 锚零漂移。验收全过：**epic 十二条逐条收口**（新旧 24 对全终值态对照 + 金属/GLB/路灯 PBR 反射可辨 / 三一致零漂移 / 资源账 6 轮恒定 owned=1 / 同实例 IBL 增量 +0.1~0.2ms 双判据〔相对判据有效域 = 重载档，可测性边界记档〕/ 冻结云静态 / warm rebake 0.4–0.9ms / 三门槛 **4034 / 601 / 零错**）；tech 六主体帧终值定案后补拍复跑对照（首拍中间态，presetParams log 为证——工具教训：验收快照须在终值定案后统一时点拍摄）；legacy 预设切换泄漏面（+1geo/+2tex/次）经 018.1 修复在循环账中消解。三门槛基线：npm test 4033 → **4034**（预设落地 +1）、check:layers 601 维持。
