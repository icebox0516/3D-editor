# T025.2 休憩四件套 · 验收记录

> 批 B（simple-asset workflow 第二例批次）：花箱 / 休闲桌 / 遮阳伞 / 自行车架。
> Spec：`docs/research/rest-static-reference.md` @1.0（合并 Spec，已终审 2026-09-29——四路硬数值独立重拉逐位/逐字一致）。

## 逐资产身份一行结论（近景帧逐件目检，对照 Spec）

| 资产 | 身份判读 | 近景帧 |
|---|---|---|
| 花箱 planter | 矩形深棕箱体（金属烤漆相）+ 白色内衬翻边框 + 下沉土面（高仰角帧内腔可辨）；标准低仰角土面被近壁遮挡 = 与真实物一致 | close-asset_planter.png + close-asset_planter-soil.png（d=8/55° 俯视补图）|
| 休闲桌 leisure_table | 圆桌橙烤漆面 + 黑弯管框架 + 环绕扇段凳位连体——桌凳组合位（P1 冲孔金属款主形态的扇段近似） | close-asset_leisure_table.png |
| 遮阳伞 parasol | 中柱立伞：米白伞面（default 卡）+ 波浪裙边 + 直骨 + 双径柱 + 圆盘配重底座四层分明 | close-asset_parasol.png |
| 自行车架 bike_rack | 卡位式高低交替弯管圈口（3 高 2 低五拱）+ 长条法兰底板 + 304 不锈钢原色拉丝——槽位段式一眼可辨 | close-asset_bike_rack.png |

tri 契约：planter 168 / leisure_table 1912（真实挤出开孔 Φ50 伞孔）/ parasol 824（三卡同几何）/ bike_rack 1084——全部 ≤3000 红线。状态栏 TRIANGLES ≈2× 契约和 + 地面（shadow 深度通道口径，与 024/025.1 同）。

## 批级基线帧

- `contact-4.png`：四件同景（`place` count 4 / spacing 4 / seedBase 7 → view 16m/35°/12° → freezeTime(25)），大纲名逐件对号，OBJECTS 4 / TRIANGLES 8.0k / FPS 60；内容浏览器 footer `facility 15` 注册计数在位。
- `parasol-triple-preset.png`：伞三卡同景（default 米白 / dark-green 墨绿 / wine-red 酒红，spacing 2.0 / seedBase 3）——三枚异色同几何，池分桶生效（shapeFamily 声明位在 meta，批 A 通用不变量锁覆盖）。
- `close-asset_planter-elevated.png`（2 件 50° 仰角）+ `close-asset_planter-soil.png`（1 件 d=8/55°）：花箱土面疑点触发补图两档。

## UI 冒烟（cdp.mjs + ui-smoke.mjs + ui-smoke-supplement.mjs，1920×1080 headless）

判据链全绿（DOM 数据 + 像素双证）：

1. `.ed-card[data-asset-id="asset_parasol"]` 色点 3 枚（dotTitles：当前色卡：米白 / 切换到「墨绿」/ 切换到「酒红」），干净链 storeBefore=null——ui-01-parasol-dots.png；
2. 点第二点 → localStorage = `{"asset_parasol":"dark-green"}`——ui-02-darkgreen-selected.png；
3. 点 `.ed-card__main` → Ghost 带卡——ui-03-ghost-darkgreen.png；
4. 左键落地（TRIANGLES 1662 = 824×2 shadow 通道 + 地面）——ui-04-placed-darkgreen.png；
5. Escape 退出；
6. **补充**：重载后激活态补读 `[false,true,false]` + title「当前色卡：墨绿」（主冒烟 afterClick 读到 `[true,false,false]` = React 渲染滞后旧态，批 A 同款已知现象——store + 重载补读双证激活语义）——ui-05-darkgreen-active-reload.png；
7. **持久化墨绿卡端到端**：重载 → UI 点击放置 → Home 近景——ui-06-placed-darkgreen-close.png（storage → preset → 池分桶 → 渲染全链）。
8. console 全动作零错误零警告：主冒烟 / 补充 / 视觉批 / 花箱补图 ×2 五批 consoleLog 全 `[]`（含遮阳伞 DoubleSide canopy 程序变体真实编译）。

## Step 2 材质复核观察项近景判读（park-shader-agent 交付的 4 个记档项）

| 观察项 | 预期风险 | 近景判读 |
|---|---|---|
| O-1 休闲桌 Extrude uv 欠满域（桌面 v 仅 [0,0.52]） | 橘皮颗粒 2.6–3.4× 单向拉长 | 桌面读作平滑烤漆，无可感拉丝——亚阈值，不修 |
| O-2 伞顶条纹集中（极坐标 uv 半径收缩） | 径向条纹 | 伞面干净素色，无可感条纹——亚阈值，不修 |
| O-3 花箱底沿共面（底板/四壁 30mm 共面带） | 颗粒级闪烁 | 近景无可见带——亚阈值，不修 |
| O-4 配重盘 metalness 0.7 偏铁相 | 「铸铁感而非理石感」 | 低反照率钝化，读数中性——亚阈值，不修 |

## 契约缺口记档（有无都记）

1. **花箱土面低仰角不可辨**（观察项非缺陷）：标准机位 12° 下土面被近壁遮挡，与真实花箱低视角一致；高仰角补图两档已证「开口 + 下沉土面」语义。植被填充增补位 T014/T015 落地后辨识度自然提升——不改几何。
2. **伞面卡集裁定的立项假设修正**：任务书预期「伞面常为鲜艳纯色」经 Spec §3.5 四源证据推翻（素色主流、鲜艳色集中广告语境）——假设层已在任务书改写，卡集 default 米白 + 墨绿/酒红副卡，拼色不建卡。
3. **UI 激活态读数滞后**（工具侧已知现象沿批 A）：断言以 store + 重载补读为准。
4. 零新配方、零 GLSL 改动、零 customDepthMaterial 声明（实心体先例同则）；faciltyMaterials 既有 10 配方零触碰。

## 门槛复验（本会话重跑，全绿）

| 门槛 | 结果 |
|---|---|
| vitest run | 285 文件 / 4486 测全绿 exit=0（4458 基线 + 批 B 净 28） |
| check:layers | 653 文件通过（649 + 4 新资产） |
| typecheck | 零错 |
| check:tasks | warning 55 持平（95 份任务书，零新信号） |

## 工具清单（tools/）

| 文件 | 用途 |
|---|---|
| cdp.mjs | CDP 驱动（自 025.1 复制，DEBUG_PORT 9334——批 B Chrome 实例隔离） |
| visual-batch.mjs | 批量取证（contact-4 + 四近景 + 伞三卡帧） |
| ui-smoke.mjs | 主冒烟（干净链 → 三色点 → 持久化 → 放置 → Escape，console 判据内置） |
| ui-smoke-supplement.mjs | 补充取证（激活态重载补读 + 持久化墨绿卡 UI 放置端到端近景） |
| planter-reshoot.mjs / planter-reshoot2.mjs | 花箱土面疑点补图（50° 两件 / d=8·55° 单件两档） |

环境：dev server `npm run dev -- --port 5200 --strictPort`（后台）；Chrome headless `--remote-debugging-port=9334 --user-data-dir=<临时目录含 t025b 标记> --headless=new --no-first-run`。收尾已杀两进程并清理临时 profile。
