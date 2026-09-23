# T018.4 DEV 调参面 — 增量视觉验证取证

> 2026-09-23 ｜ Chrome 153 headless CDP 9333 vsync-off 1920×1080 ｜ Vite 5173 常驻 ｜ 工具：`tools/t0184-visual.mjs`（主取证）+ `tools/t0184-sun-verify.mjs`（太阳角受控）+ `tools/t0184-sun-repro.mjs`（疑点复现）——驱动复用 `../018.3/tools/cdp-console.mjs` ｜ 三门槛：npm test **4033 全绿**（基线 3997 + 36）/ check:layers **601**（基线 597 + 4）/ typecheck **零错**

## 交付面（threejs-runtime-agent 单步 + 主代理审查）

- `src/runtime/environment/skyRebake.ts`：debounce 层（REBAKE_DEBOUNCE_MS=200 + RebakeScheduler 注入面 + SkyRebake trigger/flush/cancel）
- `src/runtime/environment/skyTuning.ts`：调参端口（SkyTuningPort 零 THREE 表面 + 八键白名单 satisfies 锁 + setSunAngles 三一致 + setIblIntensity 直写+借道重烘 + params 太阳角反解）
- `environmentSetup.ts`：rebake 闭包（018.3 catch 语义原样）经 SkyRebake 包层后作 onParamsChanged 传入（**回调上游**，SkyCore 零改动）；outcome sky 分支带出 rebake 句柄
- `Renderer.ts`：sunLight 字段提升（释放链不变）+ skyRebake/skyTuningPort 字段 + `get skyTuning()` + clearEnvironment 首步 cancel pending
- `bootstrap.ts`：`__sky` DEV 守卫（SkyDevHandle + createSkyDevHandle 工厂——live getter / legacy 写入口显式抛错 / 装配卸载成对）

## 探针读数（t0184-visual.mjs，全部符合预期）

| 验证点 | 读数 | 裁定 |
|---|---|---|
| ① __sky 可用性 | mode='sky'；params day 读回（sun 50.2/53.1、display 1、ibl 1、preset 'day'）；pmremStats {baked 1, owned 1, live 1} | ✓ |
| ② debounce 合并 | 20 次连续 patchAtmosphere（turbidity 3→23）**立即** baked 仍 1（零重烘）+ turbidity 读回 23（uniform 即时同步）；停手 350ms 后 baked 2 / retired 1 / owned 1（**恰一次**） | ✓ D29 Q6 |
| ③ displayIntensity | 读回 0.35；跨 450ms（>200ms 窗口）baked 仍 1（**display-only 零重烘**） | ✓ D29.13 |
| ④ setIblIntensity | 读回 0.3；settled baked 2（**借道重烘 +1**）；rebake() flush 同步执行 baked 2→3（delta 1，不等 debounce） | ✓ 刷新路径 |
| ⑤ 太阳角三一致 | setSunAngles(8,240) 后 params 读回 {8, 239.99…}；灯位模长 156.205（=LEGACY_SUN_DISTANCE）；灯位·skySun 点积 **1.0000000000000002**（完全同向） | ✓ D29.1 |
| 恢复语义 | setPreset('day') 后 finalProbe：sun 50.2/53.1 / turbidity 3 / baked 1（整组重建重置——会话态语义实证） | ✓ |
| console | 仅 Sky X4122 精度提示（官方源码固有）+ favicon 404——零意外错误 | ✓ |

## 视觉判读（受控与复现双 run）

- **display-035.png**（setDisplayIntensity 0.35）：天空偏暗深蓝 ✓；三金属球反射蓝天白云清晰、观感与 baseline 一致（**env 反射不随动**——018.3 移交「显示域压缩」工具面可用性实证）。
- **ibl-030-immediate.png**（debounce 窗口内截图）：三球/地面/天空与 baseline 观感一致（**直写不重传**——uniform 未刷新零变化）。
- **ibl-030-settled.png**（450ms 重烘后）：左球从「泛白过亮」变为「中等偏暗、蓝天白云反射可辨」、地面从近过曝变偏灰（**IBL 0.3 生效**——借道重烘刷新成功；day 饱和态脱离 254 平台，与 018.3 饱和定论互证）。
- **sun-verify-settled.png**（受控 run：全景机位 setSunAngles(8,240)）：**太阳位于画面左侧地平线附近 + 暖橙色调 + 树干左亮右暗 + 影子朝右极长（1.5–2 倍树高）**——低角 8°/方位 240° 预期完全成立（三一致视觉实证）。
- **sun-repro-settled.png**（复现 run：完整回放原 run ②③④⑤ 序列后 setSunAngles）：太阳左侧地平线 + 暖橙 + 影朝右极长——序列后行为不变（功能稳定性实证）。
- 文件大小旁证：ibl-restored-flush.png (172,443B) ≈ display-baseline.png (172,461B)（恢复观感一致）。

## ⚠ 作废帧记档：sunlow-8-240.png（主取证 run ⑤ 段）

主取证 run 的太阳角帧出现**构图与光影双异常**：判读为全景树构图 + day 光影（太阳右上、影朝左下中长），而同段探针读数（灯位/skySun/params 全 8/240）与前后机位（④ 段金属球近景）均正确。**处置**：两次独立复核 run（t0184-sun-verify 干净态 / t0184-sun-repro 完整序列回放）均「读数正确 + 视觉正确 + console 干净」，功能裁定以复核 run 三帧为准；该帧判定为**取证层异常帧作废**（疑 CDP captureScreenshot 在无 vsync 高帧率环境偶发返回陈旧合成帧——像素内容与 day 全景时代帧同构 318K vs 332K；产品代码无嫌疑——复现 run 同序列三帧连续正确）。**工具教训**（追加 018.3 教训链）：太阳角等强状态变化的取证帧若与预期不符，先做独立复核 run 再下功能结论；单帧判读与探针读数矛盾时以「新 tab 受控复现」为裁决。

## Acceptance 对照（任务书逐条）

- debounce 单测（合并/取消/零重烘/同步调度器语义保持）——node 单测 12 条 + 浏览器 20 连写实测 ✓
- 三一致单测 + setSunAngles 灯位/uniform/读数三证 + 受控视觉 ✓
- IBL 刷新路径（直写可见 + 借道重烘行为断言 + immediate/settled 视觉差）✓
- `__sky` 守卫（装配/卸载/键集无 cloudSpeed/legacy 抛错）——bootstrap.test +7 ✓
- Renderer 既有行为零回归（4033 全绿含既有环境测试语义保持）✓
- 三门槛 4033 / 601 / 零错 ✓
- 主代理视觉验证（本 README 上两节）✓
