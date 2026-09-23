# T018.1 Sky + Sun + Cloud Core —— 实现与验证取证

> 任务：[T018.1](../../../tasks/018.1-sky-sun-cloud-core.md)（done 2026-09-23）｜ 改前对照源：[018.0](../018.0/README.md) ｜ 环境：Chrome 153 headless CDP 9333 vsync-off / Vite dev 5173 / 1920×1080 DPR=1 / RTX 2080 Ti ｜ 交付：threejs-runtime-agent；审查/复验/视觉验证：主代理。

## 交付面（代码）

- `src/runtime/environment/sunDirection.ts`：`sunDirectionOf(elevation°, azimuth°)` 纯函数（零 THREE）+ day 候选 50.2°/53.1° + `LEGACY_SUN_DISTANCE=√24400≈156.205`。
- `src/runtime/environment/skyCore.ts`：`SkyCore` 双实例（displaySky showSunDisc=1 / bakeSky showSunDisc=0 仅存 bakeScene）+ 共享参数状态同步写双实例 uniforms + `SKY_BOX_SCALE=9000`（对角 ≈7794 < far 10000）+ `SKY_PRESET_ATMOSPHERE` 四预设 provisional 初值 + `skyUniformsOf` 类型化视图（@types 0.185.4 类型滞后收口，零 any）。
- `src/runtime/Renderer.ts`：applyEnvironment 天空段 = SkyCore 挂 envGroup（渐变背景退出正常路径，`createSkyTexture` 保留导出为 018.3 fallback 素材）；太阳段 = `sky.sunDirection × LEGACY_SUN_DISTANCE`（同向同模长替换 (80,120,60)，shadow camera 冻结不动）；renderFrame 每帧 `sky?.followCamera(camera)`；clearEnvironment = sky 全量释放 + `disposeEnvironmentObjectTree`（legacy +1 geo/+2 tex 每切换线性泄漏最小修复）。
- 测试 +28：sunDirection 10 / skyCore 15 / environmentDisposal 6；renderMode.test.ts 注释级机械调整（断言零变化）。

## 三一致（Acceptance ②证据——运行时探针 + 视觉双证）

| 证据 | 结果 |
|---|---|
| 灯位实测 | (79.96, 120.01, 60.04)，模长 156.205 = √24400 |
| 灯向 vs legacy (80,120,60) | 归一点积 **0.99999994**（夹角 ≈0.02°——零漂移） |
| Sky sunPosition uniform vs 灯向 | **同一点积**（同源双消费实证） |
| 静态云 / 太阳盘 / 层 | cloudSpeed=0、time=0、showSunDisc(display)=1、layer mask=4（ENV_LAYER） |
| 视觉（day-tree3a-new vs 018.0 day-tree3a） | 树影均「右侧偏后」——阴影方向零漂移；太阳光晕区右上（世界东南向，与灯位一致） |

## 验证帧（montage-verify.png 七帧拼图 + day 基线帧）

- **day-tree3a-new.png**：Preetham 物理天空（天顶深蓝→地平线浅白渐变 + 太阳光晕）+ 零漂移阴影（GLM-4.5V 中性判读）。
- **dusk / night / tech-tree3a-new.png**：暖橙 / 深暗 / 冷蓝——provisional 初值方向正确、三预设区分成立（终调 018.3/018.5）。
- **follow-camera-far / -extreme.png**：(400,12,400) 与 (−1200,300,−900) 天空完整覆盖背景、无黑边/接缝/错切（相机中心跟随生效）。
- **rendermode-wireframe / -clay.png**：诊断模式环境遍天空照常显示（ENV_LAYER 网格接替 scene.background 语义）。
- **console**：Log + Runtime 双通道捕获 **零错误零警告**。

## 资源与性能

- **泄漏修复复测**（018.0 growth 同协议 10 轮预设切换）：geo/tex/prog 恒 **5/3/12 零增长**（改前 +1/+2 每次线性泄漏——闭合；textures 绝对值 6→3 = 渐变 CanvasTexture 退役）。
- **p95 抽检**（day × 1000 棵夏栎，vsync-off 5000ms）：**4.50ms** vs 基线 4.40ms——**Δ +0.10ms**（验收项 9 双判据 ≤1.5ms 且 ≤基线 10%〔0.44ms〕本阶段已达标；fps 496 vs 511）。
- 三门槛：**npm test 3946 全绿**（254 文件，基线 3918 + 28）/ **check:layers 591**（586 + 5）/ **typecheck 零错**（主代理复验）。

## 工具（018.5 复用）

`tools/cdp-console.mjs`（console 捕获版 CDP 驱动）/ `t0181-visual.mjs`（三一致探针 + 快照 + growth 复测 + p95）/ `montage-src.html` + `montage-shot.mjs`（拼图）/ `cdp.mjs`（011.13 同款）。DEV 探针 `__envProbe`（018.0 建立）本子任务扩展 `setPreset(preset, { renderMode? })` 诊断模式取证通道。
