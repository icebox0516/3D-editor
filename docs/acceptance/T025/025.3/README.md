# T025.3 设备 P1 三件 · 验收记录

> 批 C（simple-asset workflow 第三例批次）：监控摄像头 / 交流充电桩 / 井盖。
> Spec：`docs/research/device-p1-reference.md` @1.0（合并 Spec，已终审 2026-09-29——三路硬数值独立重拉逐字一致零修正：bjjkg 8 字段 / hjlcdz 5 字段 / yixing.gov.cn 7 字段）。

## 逐资产身份一行结论（近景帧逐件目检，对照 Spec）

| 资产 | 身份判读 | 近景帧 |
|---|---|---|
| 监控摄像头 cctv_camera | 锥形白杆（顶细底粗）+ 底方法兰 + 顶部横臂侧伸 + 臂端下挂白色枪机筒（顶置遮阳罩 + 前端深色视窗）+ 杆顶不锈钢装饰球——杆装枪机剪影一眼可辨（Spec §1.1 结构分解全对号） | close-asset_cctv_camera.png |
| 交流充电桩 ev_charger | 白色大圆角落地柜 + 正面上部黑色操作面板（屏 + 刷卡区 + 红色急停钮）+ 侧面枪座挂置白枪黑缆（弧线下垂）+ 深灰踢脚——一体柜式交流桩（Spec §2.1 主形态） | close-asset_ev_charger.png |
| 井盖 manhole | 贴地灰黑圆盘 + 宽边框缘微凸 + 内沉盖盘 + 浇筑凹孔亮点（12° 低机位）；**十字网格纹 + 字章/字样槽在缩略图俯视渲染清晰可辨**（卡片第 6 张）——几何在档，场景帧不可辨 = 距离-分辨率约束非缺陷（8m 外 8mm 纹杆 ≈ 亚像素，真实物远观同为暗圆盘） | close-asset_manhole.png + close-asset_manhole-top.png + ui-01-cards.png（缩略图俯视） |

tri 契约：cctv 768 / ev_charger 616 / manhole 1224——全部 ≤3000 红线（状态栏 TRIANGLES 5.2k ≈ 2608×2 shadow 通道 + 地面，与 024/025.1/025.2 同口径）。

## 批级基线帧

- `contact-3.png`：三件同景（`place` assetIds ×3 / spacing 4 / seedBase 7 → view 16m/35°/12° → freezeTime(25)），大纲名逐件对号（监控摄像头/交流充电桩/井盖），OBJECTS 3 / TRIANGLES 5.2k / FPS 56；内容浏览器 footer 计数 **45/45、facility 18**（DOM 直读 `.ed-browser__count`/chips——截图小字号误读 15 已由 DOM 权威更正）。
- `close-asset_manhole-elevated.png`（2 件 50°）+ `close-asset_manhole-top.png`（1 件 d=8/55°）：井盖贴地件疑点触发补图两档（批 B 花箱先例同位）——内沉剪影成立，纹样判读以缩略图俯视为准。
- `ui-01..ui-05`：UI 冒烟帧（见下节）。

## UI 冒烟（cdp.mjs + ui-smoke.mjs，1920×1080 headless；批 C 无色卡 → 无色点面，任务书裁定 6）

判据链全绿（DOM 数据 + 状态栏 + 像素三证）：

1. `.ed-card[data-asset-id]` 三卡在位 + 缩略图 canvas 齐 + presetDots=0（显式无卡）——ui-01-cards.png；
2. 点 cctv 卡 `.ed-card__main` → Ghost——ui-02-ghost-cctv.png；
3. 左键落地 → 状态栏 `Objects=1 | Triangles=2.3k`——ui-03-placed-cctv.png；
4. ev_charger 落地 → `Objects=2 | Triangles=3.4k`——ui-04-placed-ev.png；
5. manhole 落地 → `Objects=3 | Triangles=4.0k` + Home 近景——ui-05-placed-manhole-close.png；
6. console 全动作零错误零警告：视觉批 / 井盖补图 / 主冒烟三批 consoleLog 全 `[]`。

口径记档：DEV 句柄 `stats().objects` 只计 `place()` API 的 placedIds（bootstrap.ts:871），UI 放置走 Command 不入该集——冒烟对象数证据 = 状态栏 `.ed-statusbar` 段读数（批 A 口径），非 stats().objects。

## Step 2 材质复核观察项近景判读（park-shader-agent 交付 6 项，全部亚阈值不修）

| 观察项 | 预期风险 | 近景判读 |
|---|---|---|
| O-C1 cctv 法兰/栓头 Box 拉丝向与杆身不一致 | 条纹走向跳变 | 14mm 近地小板掠射角不可辨——亚阈值 |
| O-C2 cctv 遮阳罩弧段 vs 筒身橘皮密度差 ≈1.5× | 特征尺度不一致 | 白壳微起伏均匀，无可感差异——亚阈值 |
| O-C3 ev 柜体拼合件褪色梯度逐件重起 + 主正面 v 向拉长 | 梯度断裂/颗粒拉长 | 白柜读连续哑光，同配方批 A 标识牌先例已过验收——亚阈值 |
| O-C4 ev 握把 Box vs 枪头 Cylinder 颗粒微观不一致 | 微观尺度跳变 | 设备尺度下同为白粉相——亚阈值 |
| O-C5 ev 踢脚前脸砂粒横向拉长 | 砂粒变形 | 60mm 近地件掠射角不可辨——亚阈值 |
| O-C6 manhole 混合 uv 域铸斑特征尺度不一 | 筒壁拉长带/盘面斑块 | 整体读灰黑铸铁单相，框环带 15mm 无可感异常——亚阈值 |

## 契约缺口记档（有无都记，归 T025 收官门）

1. **manhole 纹样近景可见度受距离-分辨率约束**（观察项非缺陷）：3–8mm 带内浮雕在 ≥5m 视距为亚像素——真实物一致；几何证据 = 缩略图俯视渲染（网格纹 + 字章 + 字样槽全可辨）。字样槽 = 抽象矩形凸槽（文字属贴图域，增补位——任务书裁定 5）。
2. **ev_charger 枪线不按 1:1 建模**：4–5m 整根线缆远超件体尺度，挂置态余缆弧线语义（任务书回填授权）；拔枪/插枪动画 = T005 联动位声明在档（裁定 4）。
3. **cctv 鸭嘴支架两段简化 / 检修手孔不建**：远观等价形态（Spec §1.1 近景保留项的裁量记档，Step 1 头注在档）。
4. **cctv/ev_charger taxonomy family 缺席**：立项裁定 2（设备域无诚实归属——§8 不投机；GLB device 目录「同名大类无 family」同粒度；设备 family 值归 T028 聚簇后按 metadata-taxonomy §7 扩展）。非缺口，记档防误判。
5. **manhole 总高语义修正**（Step 1 中途裁定）：[40]「700×850×80」的 80 = 框体埋入深度非视觉露出高——露出语义由齐平 ±3–5mm（Strong）承重，全件 0.015（框缘顶）/ 盖面 +0.005 / 内沉 10mm；任务书回填歧义修正责任在主代理，资产头注裁量①记档。零校准轮动用（护栏一轮未触发）。

## 门槛复验（本会话重跑，全绿）

| 门槛 | 结果 |
|---|---|
| vitest run | 285 文件 / 4507 测全绿 exit=0（4486 基线 + 批 C 净 21 = facilityAssets 表行 ×3） |
| check:layers | 656 文件通过（653 + 3 新资产） |
| typecheck | 零错 |
| check:tasks | warning 55 持平（96 份任务书，零新信号） |

## 工具清单（tools/）

| 文件 | 用途 |
|---|---|
| cdp.mjs | CDP 驱动（自 025.2 复制，DEBUG_PORT 9335——批 C Chrome 实例隔离） |
| visual-batch.mjs | 批量取证（contact-3 + 三近景，console 判据内置） |
| manhole-reshoot.mjs | 井盖贴地件疑点补图（50° 两件 / d=8·55° 单件两档） |
| ui-smoke.mjs | 主冒烟（三卡渲染 → 放置链 ×3 → 状态栏读数 → Escape，console 判据内置） |

环境：dev server `npm run dev -- --port 5201 --strictPort`（后台）；Chrome headless `--remote-debugging-port=9335 --user-data-dir=<临时目录含 t025c 标记> --headless=new --no-first-run`。收尾已杀两进程并清理临时 profile。
