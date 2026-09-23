# T018.2 PMREM / IBL —— 实现与验证取证

> 任务：[T018.2](../../../tasks/018.2-pmrem-ibl.md) ｜ 改前对照源：[018.0](../018.0/README.md)（视觉基线 24 帧 / p95 / info 账目）；p95 直接对照 = 018.1 实测 4.50ms ｜ 环境：Chrome 153 headless CDP 9333 vsync-off / Vite dev 5173 / 1920×1080 DPR=1 / RTX 2080 Ti ｜ 交付：park-shader-agent（显示强度 uniform）+ threejs-runtime-agent（PMREM 管线）；审查/复验/视觉验证：主代理。

## 交付面（代码）

- `src/runtime/environment/pmremEnvironment.ts`：`PmremEnvironment` 事务管理器（bake = fromScene → 替换 scene.environment → 旧 RT dispose；失败传播且赋值不发生 = 天然保留上一份成功环境）+ `LazyPmremBackend`（PMREMGenerator 惰性构造/复用/释放）+ `PmremStats` 自维护 counter（baked/retired/owned/live）+ 构造期拒绝 bakeScene===主 Scene（D29.12 防线）。**fromScene 参数锁定**（依据 three 0.186 `PMREMGenerator.js` 源码）：`sigma=0 / near=1 / far=10000`——缺省 far=100 会把 SKY_BOX_SCALE=9000 天空盒（对角 ≈7794.22）整盒远裁剪。
- `src/runtime/environment/skyCore.ts`：构造第三参 `onParamsChanged` 回调（三写入口各恰触发一次；构造初始同步/setDisplayIntensity/followCamera 不触发）+ **Step A 显示强度** `uDisplayIntensity` uniform（仅 displaySky 实例 fragmentShader 字符串注入，锚点 `gl_FragColor = vec4(texColor, 1.0)` 唯一汇合点、tonemapping/colorspace 之前辐射域；锚点 replaceAnchorOnce 恰一次校验——three 升级片元漂移即显式抛错）+ `setDisplayIntensity`（非负有限校验）。
- `src/runtime/Renderer.ts`：applyEnvironment 末尾 PmremEnvironment 创建 + 初烘一次 + `scene.environmentIntensity = 1`；SkyCore 构造注入重烘回调；clearEnvironment PMREM 先于 sky 释放（消费者先撤）；renderFrame 零改动（结构断言锁定零 PMREM）。
- 测试 +25（Step A 6 + Step B 19：pmremEnvironment 15 / skyCore +3 / environmentDisposal +1）：实参锁定 / 7 轮事务 owned 恒 1 / bake 抛错传播旧环境保持 / 云参与烘焙 + showSunDisc 常闭 / Renderer 源码结构断言（`?raw`）。

## 三门槛（主代理复验）

**npm test 3971 全绿**（255 文件，基线 3946 + 25）/ **check:layers 593**（591 + 2）/ **typecheck 零错**。

## IBL 挂接与事务（Acceptance 探针证据）

| 证据 | 结果 |
|---|---|
| scene.environment | Texture 非 null、mapping=306（CubeUVReflectionMapping）、imageWidth=768（PMREM mip 面） |
| environmentIntensity | 1（DEFAULT_ENVIRONMENT_INTENSITY） |
| 预设循环 10 轮（growth 同协议） | geo 23 / tex 5 / prog 10 **恒定零增长**——PMREM RT 新建/释放平衡（RT 泄漏必显形 tex 线性涨；绝对值含取证残留缓存：路灯 source cache + GLB 纹理，与轮次无关） |
| 切换耗时（含整组重建 + PMREM 初烘 + generator 重编译） | 8 轮 **30.2–33.3ms** 稳定——epic 验收第 10 条 PMREM 单次 ≤100ms 参考门内（用户可感知口径） |

## 视觉反射（018.0 同款注入同机位对照，GLM-4.5V 中性判读）

- **金属三球**（metalness=1 × roughness 0.15/0.45/0.75）：018.0 基线 = 近黑/炭灰 + 点状直射高光（无 env 金属不可照明的教科书态）→ **018.2 左球清晰反射蓝天白云**（蓝色饱和块 + 云斑 + 顶部高光）、中球淡蓝模糊映像、右球高 roughness 均质亮白——**GGX 预过滤按 roughness 分档行为直接可见**。`dusk/night/tech-metal-ibl.png` 三预设帧同机位留档（阴天/暗天/冷天空的反射随预设变化）。
- **GLB**（sensor.glb 归一化注入）：金属杆身**清晰反射蓝天白云**（蓝色反射带 + 云状亮区 + 顶部锐利高光），设备盒银色部件天空色反射——内建 MeshStandardMaterial 零改动获得 env 实证。
- **路灯**（产品路径 place）：灯杆蓝色天空反光带 + 云状亮区 + 直射高光分层可辨。
- **`day-metal-ibl-off.png` 判无效剔除**：`scene.environmentIntensity` 直写不触发材质 uniform 重传（three 0.186 `WebGLRenderer.js:2738` 该赋值在 refreshMaterial 路径内执行，直写无刷新事件）——该帧 IBL 未归零。差分证据由 018.0 vs 018.2 同机位对照承担。**018.4 提醒：DEV 面调 environmentIntensity 必须走触发材质刷新的路径（或核实每帧上传变体）**。

## p95 与归因（epic 验收第 9 条量化事实，移交 018.5）

A/B 三态同 session（day × 1000 棵夏栎，vsync-off 5000ms）：**IBL on 5.60ms（458fps）/ environment=null 5.10ms（479fps）/ 产品路径恢复 5.80ms（420fps，env 重挂接验证通过）**。

- **IBL 采样固有帧成本 ≈ +0.5ms**（on/off 同 session 差——env 采样是每像素 GPU 成本，属功能本身成本，与「PMREM 不进帧路径」不矛盾：烘焙不进帧、采样在帧）；
- envNull 5.10 vs 018.1 基线 4.50 的 ≈+0.6ms 为**跨 Chrome 实例漂移**（不同会话实例/profile；中位帧 p50 两态同为 ~1.1ms 无差异，差异集中在 p95 尾部）；
- **018.5 裁定输入**：对照 018.0 基线 4.40 的名义 Δ ≈ +1.1–1.4ms——第一判据 ≤1.5ms 过、第二判据 ≤10%（0.45ms）不过，其中 ~0.5ms 为 IBL 采样物理成本 + ~0.6ms 跨实例漂移；建议 018.5 以同 Chrome 实例 on/off 差值（0.5ms）为增量口径裁定，或接受 IBL 固有成本豁免项。

## console（观察项，非阻塞）

- `favicon.ico` 404（浏览器自动请求，非应用资源）。
- Sky 材质 HLSL `X4122` 双精度求和 warning（Program Info Log）——Sky.js 官方 Preetham 公式在 ANGLE D3D11 编译器下的固有数值精度提示，非错误；018.1 未出现因 bakeSky 材质变体随 PMREM 烘焙首次编译。

## 目录

- `<preset>-metal-ibl.png` ×4 ｜ `day/night-glb-ibl.png` ×2 ｜ `day-streetlamp-ibl.png` ｜ `day-metal-ibl-off.png`（判无效留档，见上）｜ `tools/`：cdp.mjs + cdp-console.mjs（018.1 同款）+ t0182-visual.mjs（主取证）+ t0182-p95-ab.mjs（A/B 归因）+ 两个 .log 原始输出。
