# T018.3 EnvironmentPreset + fallback 取证

> Chrome 153 headless CDP 9333 vsync-off 1920×1080；Vite 5173。工具在 `tools/`（cdp-console.mjs 驱动 + 各实验脚本 + t0183-run.log）。实施与主取证详录任务书完成记录，本 README 补**疑点闭环证据链**（会话二，2026-09-23）。

## 主取证（会话一，全过）

- 四预设探针：sky 态单一开关不变式（environment 非空 / background null / hemiCount 0 / skyMesh 1）+ environmentIntensity **1 / 0.85 / 0.35 / 0.7** 精确生效；帧亮度 day 152.8 / dusk 99.1 / night 47.5 / tech 93.5，dusk 低角长影方向差异可辨（`{day,dusk,night,tech}-tree-preset.png`）。
- fallback：monkey-patch `PMREMGenerator.fromScene` 抛错 → legacy 渐变 + Hemi + console.error 记档（`fallback-legacy-dusk.png`）；解除后恢复 sky 态（`recovery-dusk.png`）。
- 交替循环 growth10：sky↔legacy 恒定交替零泄漏。
- day 删 Hemi 对照：018.2 `day-metal-ibl.png` vs 018.3 `day-metal-nohemi.png` bands 1–10 逐位一致（机制解释见下——金属球 specular 全饱和 + Hemi 对 metalness 1 漫射≈0，一致是真实物理，非异常）。

## 疑点「直射光对像素零贡献」——闭环（会话二）

### 排查链（每步证据）

1. **双 three 实例假设否证**（`tools/instance-check.mjs`）：app 实际加载 `/node_modules/.vite/deps/three.js?v=5d480239`，与动态 import 不带 query 的 URL 解析到**同一模块实例**（`Object3D` 类恒等、`WebGLRenderer.prototype.render` 恒等）；场景 92 对象全部归属唯一实例。
2. **wrap render 0 条之谜破案**（`tools/probe-renderer.mjs` + `program-defines.mjs`）：three 的 `WebGLRenderer.render` 是 **constructor 内闭包定义的实例自有方法**，`prototype.render` 恒为 undefined——wrap 原型 wrap 到空位上，日志 0 条是**无效工具**（上会话会话一与本会话初版同样中招）。wrap **实例方法**后 600ms 命中 2606 次（主 Scene+PerspectiveCamera），渲染循环完全健康。
3. **零贡献坐实为真实像素事实**（`tools/light-recheck.mjs` + `pole-sun-joint.mjs`）：注入受光物（MeshStandardMaterial 白杆 castShadow + roughness1 白球）入画后，红 HemisphereLight ×50 / 太阳 intensity 0 / 太阳 50 三组截图与基线像素差均 ≈0.005%（仅 HUD 数字区噪点）；而 `scene.environment = null` 时 **40% 画面变化**——IBL 贡献正常，直射光零贡献是渲染输出层事实，非实验假象。
4. **shader/uniform 层全部正常**（`tools/program-uniforms.mjs`）：地面 MeshStandardMaterial 的 GL program 中 `directionalLights[0].direction/.color`、`directionalLightShadows[0].*` uniform 全部 active（灯代码段在），`directionalLights[0].color = [2.4,2.4,2.4]` 与当前太阳 intensity 精确同步（值在真实上传；direction 为 view space 值非异常）。材质层清白：makeGroundMaterial 无 onBeforeCompile（cacheKey 尾部 onBeforeCompile 为 three 默认值表示）。
5. **阴影假设否证**（`tools/shadow-hyp-*.png`）：`sun.castShadow = false`（去阴影采样重编译）后直射依然零贡献——shadow 采样 visibility 清零不是元凶。
6. **env null 帧直射完全正常**（`joint-envnull.png`）：IBL 关闭后标准球有明暗渐变、地面有杆影球影——**直射光与阴影系统本身工作正常**。红太阳仅 0.36% 变化（`shadow-hyp-sunred.png`：球/地面无红色响应，变化集中在高光斑未饱和通道）。
7. **饱和假设定论**（`tools/saturation-hypothesis.mjs` + `sat-*.png`）：页内打开 ACESFilmicToneMapping → **56.3% 画面脱离饱和出现层次**；ACES 下太阳 0 → **31.9% 画面变化**、太阳 50 → **34.4%/亮度 148.5→152**——直射光贡献完全显现。

### 结论（定论）

**渲染管线健康，无 bug**。「直射光零贡献」= **Preetham 正午 HDR 天空 → PMREM irradiance 把 day 场景受光面推到远超 1.0，NoToneMapping（D29.3）输出下大面积 clamp 到 254 饱和**——直射增量（无论 0 还是 50×）落在饱和平台内，像素不变。统一解释全部历史现象：day 地面 254 / 白杆与白球纯平无渐变 / 金属球帧逐位一致 / night 地面 24（暗天空不饱和）/ 红太阳仅高光斑响应。

**遗留问题定性转变**：「day（及 tech）预设内容过曝」——HDR 天空与 D29.3 NoToneMapping 冻结决策的组合显示域问题，**移交 018.4/018.5**（tone mapping 决策重审〔ACES 打开 56% 画面改善的实证在案〕或 sky→PMREM 显示域压缩路径〔uDisplayIntensity 旋钮已存在〕；D29.3 修订需记 DECISIONS）。疑点不再阻塞 018.3 验收。

### 工具层教训（追加任务书会话教训）

- **wrap WebGLRenderer 必须 wrap 实例自有 render，wrap 原型无效**（three 闭包式实例方法架构，`prototype.render === undefined`）。
- 实验设计：灯开关类实验必须**受光物入画时**做（空画面/全 basic 材质时零变化是假象）；定性像素 diff 前先确认画面里有响应载体。
- sky mesh 探测口径：SkyCore displaySky 材质 type 为 'ShaderMaterial'，按 name（'SkyShader'）或 programs 计数探，勿按 type 含 'Sky' 探。

## 帧文件指引

- 主取证：`{day,dusk,night,tech}-tree-preset.png` / `day-metal-nohemi.png` / `fallback-legacy-dusk.png` / `recovery-dusk.png`
- 会话一疑点证据链（过程帧，已闭环归档）：`hemi-live-*` / `hemi-extreme-*` / `liveness-*` / `sun-toggle-*` / `forensic-ball-*`
- 会话二闭环证据链：`light-recheck-*`（双实例/受光物复核）/ `joint-*`（太阳×IBL 交叉）/ `shadow-hyp-*`（阴影假设否证）/ `sat-*`（饱和假设定论）
