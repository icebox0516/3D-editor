# T025.1 交通静态六件 · 验收记录

> 批 A（simple-asset workflow 首例批次）：防撞柱 / 人行护栏段 / 道路隔离栏 / 减速带 / 交通锥 / 停车挡车器。
> Spec：`docs/research/traffic-static-reference.md` @1.0（合并 Spec，六资产单一事实源）。

## 逐资产身份一行结论（近景帧逐件目检）

| 资产 | 身份判读 | 近景帧 |
|---|---|---|
| 防撞柱 bollard | 细圆管 + 荧光黄环带 + 圆头 + 法兰底座 | close-asset_bollard.png |
| 人行护栏段 pedestrian_barrier | 白色三横杆 + 双端柱 + 底脚 | close-asset_pedestrian_barrier.png |
| 道路隔离栏 road_barrier | 京式密竖杆 + 顶部 U 弯头 + 立柱橙红块 + 黑脚座 | close-asset_road_barrier.png |
| 减速带 speedbump | 黄黑交替 4 段弧拱条 | close-asset_speedbump.png |
| 交通锥 trafficcone | 红橙锥体 + 白反光环 + 黑方底座（黄卡 = 黄锥体，环/底不变——shapeFamily 修复后生效） | close-asset_trafficcone.png |
| 停车挡车器 wheelstop | 黑色梯形体 + 顶面黄棱 | close-asset_wheelstop.png |

tri 契约：bollard 474 / pedestrian_barrier 216 / road_barrier 1656 / wheelstop 24 / trafficcone 140（双卡同几何）/ speedbump 86。

## 全景与修复证据

- `contact-6.png`：六件同景（`place` count 6 / spacing 4 / seedBase 7 → view 16m/35°/12° → freezeTime(25)），场景树名称逐件对号。
- `trafficcone-dual-preset.png`：锥双卡同景（default + yellow，spacing 1.2 / seedBase 3）——两枚异色，池分桶生效。
- `verify-single-yellow.png` / `verify-dual-preset.png`：shapeFamily 修复后黄卡生效像素证据（单卡 / 双卡各一）。
- `diag-single-yellow.png` / `diag-mixed-after.png`：修复前坏态证据对（黄卡静默失效：presets:['default','yellow'] 两枚全红、同卡/混卡 drawCalls 相等）。

## shapeFamily 缺口（本批最重要产出）

- 现象：双卡全红、drawCalls 不随卡变化。
- 根因：meta 漏声明 `shapeFamily`——它是 seed/preset 参数化构建路径闸门（`resolvePoolKey` 无 family 回退裸 assetId → 池键无卡段同桶；`ProceduralSourceCache` 无 family 无参 build() → params.preset 被丢）。既有测试全绿因只锁 build 直调消费面，运行时声明前提无锁。
- 修复：`asset_trafficcone.asset.ts` meta 补 `shapeFamily: { size: 1 }`（单槽形态族，跨卡同几何语义成立）+ 两条防复发锁（facilityAssets.test 通用不变量 it.each：presets 声明必须伴随 shapeFamily；trafficconePreset.test 契约锁）。
- 定性：声明面接线（沿 T024.3 主代理声明面先例），渲染代码零触碰——已记入任务书完成记录偏离档。

## UI 冒烟（cdp.mjs + ui-smoke.mjs，1920×1080 headless）

判据链全绿（DOM 数据 + 像素双证）：

1. `.ed-card[data-asset-id="asset_trafficcone"]` 有 `.ed-card__presets` 两点（红/黄，dotTitles 取证）——ui-01-cone-dots.png 像素同证；
2. 点第二点 → localStorage `t3d-editor.asset-presets` = `{"asset_trafficcone":"yellow"}`，干净链（removeItem + 重载）下 storeBefore=null；
3. 点 `.ed-card__main` → canvas 放置 → 黄锥落地（OBJECTS 1 / TRIANGLES 154）——ui-04-placed-yellow.png；
4. Escape 退出放置；
5. console 全动作零错误零警告（consoleLog=[]）。

补充取证（ui-smoke-supplement.mjs + drawer-toggle-probe.mjs）：

- `ui-05-drawer-expanded.png`：内容浏览器展开态，六设施卡网格可见，锥卡红/黄两点像素在位。
- `ui-06-placed-yellow-close.png`：**持久化黄卡 → 重载 → UI 点击放置 → Home 全景近景**——黄锥像素端到端（storage → preset → 池分桶 → 渲染全链），黄卡语义「环/底不变」目检成立。
- 抽屉 toggle 语义探针三读数：fresh=收起（aria-expanded=false, cardRectH 0）→ 点击=展开（cardRectH 140, bodyRectH 232）→ 再点=复原；程序化 click 机制可靠。

### 冒烟脚本两处缺陷修复（本会话，工具侧非产品侧）

1. console 收集器原装在干净链重载之前，navigate 销毁页面上下文连带抹掉收集器（首跑 consoleLog 键丢失）→ 移至重载之后安装。
2. toggle 单击存在初始化竞态瞬态（首跑 ui-01 帧抽屉收起假象，探针证明机制本身可靠）→ 有界重试（≤3 次，判据 = 卡片 offsetParent 非空，attempts 数随证据落盘；复跑 attempts=1 一次展开）。
3. 附带记档：补充脚本曾用 `textContent==='展开'` 全页扫描，命中的是左栏大纲树同名钮（浏览器 toggle 文案为『▼展开』色标+文字拼接，精确等值必错过）→ 改 `.ed-browser__toggle` 直选。抽屉展开态观察跨重载保持（持久化行为，记录备查）。

## 三点记档

1. **近景帧机位 = Home 全景键**（focusAll 产品键位）。弃手算 `d=max(6,宽×3.5)`：`view()` lookAt 固定视心高 3.6m，小设施 d=6 会出画；Home 键 focusBox 半径 max(r,1)、距离 max(...,2)×1.4，小件不触 near=1。
2. **状态栏 TRIANGLES ≈ 2× 契约面数**：renderer.info 含 shadow 深度通道，与 024 同口径，非缺陷。
3. **shapeFamily 缺口发现→修复→验证全记档**（见上节），防复发锁已入 facilityAssets.test 通用不变量。

## 门槛复验（本会话重跑，全绿）

| 门槛 | 结果 |
|---|---|
| vitest run | 280 文件 / 4348 测全绿 exit=0 |
| check:layers | 638 文件通过 |
| typecheck | 零错 |
| check:tasks | warning 55 持平（无新信号） |

## 工具清单（tools/）

| 文件 | 用途 |
|---|---|
| cdp.mjs | CDP 驱动（自 024.3 复制 + captureBeyondViewport；用法 `node cdp.mjs <script.mjs>`，script 导出 `async ({navigate,setViewport,evalJs,screenshot,sleep,send}) => result`） |
| ui-smoke.mjs | 主冒烟（干净链 → 色点 → 持久化 → 放置 → Escape，console 判据内置） |
| ui-smoke-supplement.mjs | 补充取证（抽屉态探针 + 展开帧 + 持久化黄卡 UI 放置近景） |
| drawer-toggle-probe.mjs | 抽屉 toggle 语义探针（点击前后三读数） |
| visual-batch.mjs | 批量取证（contact-6 + 六近景 + 锥双卡） |
| cone-reshoot.mjs | 锥专项重摄（shapeFamily 修复后） |
| diag-cone-preset.mjs | 锥双卡诊断（修复前坏态证据对采集） |

环境：dev server `npm run dev -- --port 5199 --strictPort`（后台）；Chrome headless `--remote-debugging-port=9333 --user-data-dir=<临时目录> --headless=new --no-first-run`。收尾须杀两进程并清理临时 profile。
